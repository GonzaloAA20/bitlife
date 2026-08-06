/* ============================================================
   HOLOVIDA :: motor
   Estado, ciclo anual, resolución de decisiones, combate, muerte.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  const STATS_0_100 = ['salud', 'fuerza', 'destreza', 'intelecto', 'carisma', 'suerte', 'cordura', 'reputacion', 'notoriedad'];

  /* ---------------- Estado ---------------- */
  function nuevoEstado(cfg, rng) {
    const esp = cfg.especie;
    const era = cfg.era;
    const s = {
      version: 1,
      semilla: rng.seedStr,
      nombre: cfg.nombre,
      pronombre: cfg.pronombre || 'elle',
      especie: esp.id,
      especieN: esp.n,
      // las especies muy longevas se comprimen: una partida cubre ~120 años como mucho
      vidaMax: Math.min(esp.vida, 118),
      vidaEspecie: esp.vida,
      era: era.id,
      eraN: era.n,
      mundo: cfg.mundo,
      mundoNatal: cfg.mundo,
      rasgo: cfg.rasgo.id,
      rasgoN: cfg.rasgo.n,
      apariencia: cfg.apariencia,
      edad: 0,
      muerto: false,
      causaMuerte: '',
      stats: {
        salud: 70, fuerza: 2, destreza: 30, intelecto: 30, carisma: 30,
        suerte: 40, cordura: 60, reputacion: 20, notoriedad: 0,
        alineamiento: 0, creditos: 500
      },
      flags: {},
      poderes: [],
      habilidades: [],
      idiomas: ['básico'],
      objetos: [],
      estudios: [],
      relaciones: [],
      relacionesPasadas: [],
      faccionRep: {},
      contadores: { mundosVisitados: 1, cazas: 0, derribos: 0, rutas: 0, duelos: 0, crimenes: 0, años: 0 },
      mundosVistos: [cfg.mundo],
      trabajo: null, rango: null, sueldo: 0, rendimiento: 50, añosEnTrabajo: 0,
      nave: null, naveNombre: null, naveEstado: 100,
      sable: null, kyber: null, forma: null,
      droide: null, mascota: null,
      cibernetica: [],
      carcelAños: 0,
      titulos: [],
      legado: null,
      historia: [],   // { edad, txt, tipo }
      hitos: []       // momentos destacados para el resumen
    };

    // modificadores de especie / era / rasgo
    aplicarMods(s, esp.mods);
    aplicarMods(s, era.mods);
    aplicarMods(s, cfg.rasgo.mods);
    if (esp.id === 'droide') s.stats.fuerza = 0;

    // ¿nace sensible a la Fuerza? si no, sus poderes crecerán muy poco
    s.sensible = esp.id !== 'droide' && (s.stats.fuerza >= 12 || cfg.rasgo.id === 'sensible');
    if (!s.sensible && s.stats.fuerza > 8) s.stats.fuerza = 8;

    clampStats(s);
    return s;
  }

  function aplicarMods(s, mods) {
    if (!mods) return;
    for (const k in mods) {
      if (s.stats[k] == null) continue;
      s.stats[k] += mods[k];
    }
  }

  function clampStats(s) {
    for (let i = 0; i < STATS_0_100.length; i++) {
      const k = STATS_0_100[i];
      s.stats[k] = U.clamp(Math.round(s.stats[k]), 0, 100);
    }
    s.stats.alineamiento = U.clamp(Math.round(s.stats.alineamiento), -100, 100);
    s.stats.creditos = Math.round(s.stats.creditos);
  }

  /* ---------------- Juego ---------------- */
  function Game(cfg) {
    this.rng = new SW.RNG(cfg.semilla);
    this.s = nuevoEstado(cfg, this.rng);
    this.cola = [];          // eventos pendientes
    this.logAño = [];        // textos de este año
    this.actividadUsada = false;
    this.fase = 'año';       // 'año' | 'evento' | 'menu' | 'fin'
    this.log('Nace ' + this.s.nombre + ' en ' + this.s.mundo + '. Era: ' + this.s.eraN + '.', 'nac');
    this.hito('Nacimiento en ' + this.s.mundo);
  }

  Game.prototype.log = function (txt, tipo) {
    this.s.historia.push({ edad: this.s.edad, txt: txt, tipo: tipo || 'ev' });
    this.logAño.push({ txt: txt, tipo: tipo || 'ev' });
  };
  Game.prototype.hito = function (txt) {
    this.s.hitos.push({ edad: this.s.edad, txt: txt });
  };

  /* ---------------- Slots ---------------- */
  Game.prototype.rellenarSlots = function (ev) {
    const rng = this.rng, s = this.s;
    const slots = {};
    const def = ev.slots || {};
    for (const k in def) {
      switch (def[k]) {
        case 'mundo': slots[k] = rng.pick(SW.MUNDO_NOMBRES); break;
        case 'criatura': slots[k] = rng.pick(SW.CRIATURAS); break;
        case 'lugar': slots[k] = rng.pick(SW.LUGARES); break;
        case 'objeto': slots[k] = rng.pick(SW.OBJETOS).n; break;
        case 'nombre': slots[k] = SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'rodiano', 'duros'])); break;
        case 'faccion': { const f = rng.pick(SW.FACCIONES); slots[k] = f.n; slots['_faccion'] = f.id; break; }
        case 'rumor': slots[k] = rng.pick(SW.RUMORES); break;
        case 'nave': slots[k] = rng.pick(SW.NAVES).n; break;
        default: slots[k] = def[k];
      }
    }
    slots._objetoPrecio = null;
    return slots;
  };

  /* ---------------- Selección de eventos ---------------- */
  Game.prototype.eventosPosibles = function (pool) {
    const s = this.s;
    const out = [];
    for (let i = 0; i < pool.length; i++) {
      const e = pool[i];
      if (e.min != null && s.edad < e.min) continue;
      if (e.max != null && s.edad > e.max) continue;
      if (e.req) { try { if (!e.req(s)) continue; } catch (err) { continue; } }
      if (e.unaVez && s.flags['ev_' + e.id]) continue;
      out.push(e);
    }
    return out;
  };

  Game.prototype.prepararEvento = function (ev) {
    const slots = ev.gen ? {} : this.rellenarSlots(ev);
    const inst = {
      ref: ev,
      id: ev.id,
      slots: slots,
      texto: U.fill(ev.t, slots),
      opciones: []
    };
    const s = this.s;
    for (let i = 0; i < ev.c.length; i++) {
      const o = ev.c[i];
      if (o.req) { try { if (!o.req(s)) continue; } catch (e) { continue; } }
      inst.opciones.push({
        idx: i,
        txt: U.fill(o.t, slots),
        sub: o.sub ? U.fill(o.sub, slots) : null,
        def: o
      });
    }
    if (!inst.opciones.length) return null;
    return inst;
  };

  /* ---------------- Ciclo anual ---------------- */
  Game.prototype.avanzarAño = function () {
    const s = this.s;
    if (s.muerto) return;
    this.logAño = [];
    s.edad++;
    s.contadores.años++;
    this.actividadUsada = false;

    // cárcel
    if (s.carcelAños > 0) {
      s.carcelAños--;
      this.aplicarFx({ cordura: -6, salud: -3, destreza: 3 }, {});
      this.log('Año en prisión. Quedan ' + s.carcelAños + '.', 'mal');
      if (s.carcelAños === 0) this.log('Sales en libertad.', 'bien');
      this.finDeAño(true);
      return;
    }

    // ingresos / trabajo
    if (s.trabajo) {
      s.añosEnTrabajo++;
      const bruto = Math.round(s.sueldo * (0.85 + s.rendimiento / 200));
      s.stats.creditos += bruto;
      this.log('Trabajas de ' + s.rango + '. Ingresas ' + U.cr(bruto) + '.', 'cr');
      this.chequearAscenso();
    } else if (s.edad > 18) {
      const gasto = 900 + s.edad * 14;
      s.stats.creditos -= gasto;
      if (s.stats.creditos < -20000) {
        this.log('Vives de prestado. Los cobradores ya saben tu nombre.', 'mal');
        this.aplicarFx({ cordura: -4, notoriedad: 2 }, {});
      }
    }

    // envejecer
    this.envejecer();
    if (s.muerto) return;

    // eventos automáticos del año
    const n = s.edad < 6 ? 1 : this.rng.int(1, 2);
    const posibles = this.eventosPosibles(SW.EVENTOS);
    const elegidos = [];
    for (let i = 0; i < n && posibles.length; i++) {
      const ev = this.rng.weighted(posibles);
      if (elegidos.indexOf(ev) >= 0) continue;
      elegidos.push(ev);
      const inst = this.prepararEvento(ev);
      if (inst) this.cola.push(inst);
    }
    this.fase = this.cola.length ? 'evento' : 'menu';
  };

  Game.prototype.envejecer = function () {
    const s = this.s;
    const rng = this.rng;
    const ratio = s.edad / s.vidaMax;

    // recuperación natural: el cuerpo cura mientras seas joven
    if (ratio < 0.72 && s.stats.salud < 92) {
      let cura = rng.int(3, 7) * (1 - ratio * 0.7);
      if (s.stats.cordura > 60) cura += 1;
      if (s.flags.adicto) cura -= 3;
      if (s.carcelAños > 0) cura -= 2;
      s.stats.salud += Math.max(0, Math.round(cura));
    }

    if (ratio > 0.62) {
      const dec = Math.round((ratio - 0.62) * 26 + rng.int(0, 2));
      s.stats.salud -= dec;
    } else if (s.edad > 30 && rng.chance(0.2)) {
      s.stats.salud -= 1;
    }
    if (s.edad < 18) s.stats.salud = Math.min(100, s.stats.salud + 2);
    // cordura y alineamiento presionan la salud
    if (s.stats.cordura < 20) s.stats.salud -= 2;
    clampStats(s);

    if (s.stats.salud <= 0) { this.morir('El cuerpo dijo basta.'); return; }
    if (ratio > 0.9 && rng.chance((ratio - 0.9) * 2.2)) {
      this.morir('Vejez. Sin dramatismo.');
    }
  };

  Game.prototype.morir = function (causa) {
    const s = this.s;
    if (s.muerto) return;
    s.muerto = true;
    s.causaMuerte = causa;
    this.log('☠ ' + causa, 'muerte');
    this.hito('Muere a los ' + s.edad + ': ' + causa);
    // títulos finales
    for (let i = 0; i < SW.TITULOS.length; i++) {
      const t = SW.TITULOS[i];
      try { if (t.req(s) && s.titulos.indexOf(t.n) < 0) s.titulos.push(t.n); } catch (e) {}
    }
    this.fase = 'fin';
  };

  Game.prototype.finDeAño = function (skip) {
    this.fase = this.s.muerto ? 'fin' : 'menu';
  };

  /* ---------------- Ascensos ---------------- */
  Game.prototype.chequearAscenso = function () {
    const s = this.s;
    const c = SW.carrera(s.trabajo);
    if (!c) return;
    const idx = c.rangos.indexOf(s.rango);
    if (idx < 0 || idx >= c.rangos.length - 1) return;
    const stat = s.stats[c.stat] || 0;
    const p = U.clamp((stat / 180) + (s.rendimiento - 50) / 300 + s.añosEnTrabajo / 40, 0.02, 0.55);
    if (this.rng.chance(p)) {
      s.rango = c.rangos[idx + 1];
      s.sueldo = Math.round(s.sueldo * (1.45 + this.rng.next() * 0.35));
      s.stats.reputacion += 4;
      this.log('¡Ascenso! Ahora eres ' + s.rango + '. Nuevo sueldo: ' + U.cr(s.sueldo) + '.', 'bien');
      this.hito('Asciende a ' + s.rango);
      clampStats(s);
    }
  };

  /* ---------------- Aplicar efectos ---------------- */
  Game.prototype.aplicarFx = function (fx, slots, ctx) {
    if (!fx) return;
    const s = this.s;
    for (const k in fx) {
      let v = fx[k];
      if (s.stats[k] == null) continue;
      if (typeof v === 'string') {
        if (v.indexOf('sueldo*') === 0) v = Math.round(s.sueldo * parseFloat(v.split('*')[1]));
        else v = parseFloat(v) || 0;
      }
      if (k === 'creditos' && v === -999999) v = -Math.max(0, s.stats.creditos);
      // los no sensibles apenas progresan en la Fuerza (hasta que despierten)
      if (k === 'fuerza' && v > 0 && !s.sensible) {
        v = v * 0.2;
        if (s.stats.fuerza + v > 20) v = Math.max(0, 20 - s.stats.fuerza);
      }
      // las heridas duelen menos si estás en forma o llevas armadura/prótesis
      if (k === 'salud' && v < 0) {
        const mitig = 1 - Math.min(0.35, (s.stats.destreza / 400) + s.cibernetica.length * 0.05);
        v = v * mitig;
      }
      s.stats[k] += v;
    }
    if (s.stats.creditos < -200000) s.stats.creditos = -200000;
    clampStats(s);
  };

  /** despertar tardío a la Fuerza (evento raro) */
  Game.prototype.despertar = function () {
    const s = this.s;
    if (s.sensible || s.especie === 'droide') return;
    s.sensible = true;
    s.stats.fuerza = Math.max(s.stats.fuerza, 25);
    this.log('Algo se abre dentro de ti. Nunca habías sentido esto.', 'bien');
    this.hito('Despierta a la Fuerza');
    clampStats(s);
  };

  /* ---------------- Resolver una elección ---------------- */
  Game.prototype.elegir = function (inst, opcionIdx) {
    const s = this.s, rng = this.rng;
    const op = inst.opciones[opcionIdx];
    if (!op) return;
    const d = op.def;
    const slots = inst.slots || {};
    this.log('› ' + op.txt, 'eleccion');

    // coste previo
    if (d.coste) {
      let c = d.coste;
      if (typeof c === 'string' && c.indexOf('objeto/') === 0) c = 2000;
      s.stats.creditos -= c;
    }

    // resultado aleatorio o directo
    let res = d;
    if (d.r && d.r.length) {
      res = rng.weighted(d.r, function (o) { return o.p == null ? 1 : o.p; });
      // los efectos de la opción base también se aplican
      this.aplicarNodo(d, slots, inst, true);
    }
    this.aplicarNodo(res, slots, inst, false);
  };

  /** aplica un nodo (opción o resultado). soloFx=true evita repetir texto/acciones */
  Game.prototype.aplicarNodo = function (d, slots, inst, soloBase) {
    const s = this.s, rng = this.rng;

    if (d.fx) this.aplicarFx(d.fx, slots);
    if (!soloBase && d.t && d.r == null && d.out == null && d.combate == null && d.dogfight == null) {
      // nodo de resultado con texto en .t
    }
    const texto = soloBase ? null : (d.out || (d !== inst && d.t && d.p != null ? d.t : null));
    if (texto) this.log(U.fill(texto, slots), 'res');

    // ---- acciones especiales ----
    if (d.flag) s.flags[U.fill(d.flag, slots)] = true;
    if (d.quitarFlag) delete s.flags[d.quitarFlag];

    if (d.contador) for (const k in d.contador) s.contadores[k] = (s.contadores[k] || 0) + d.contador[k];

    if (d.rel) this.añadirRelacion(d.rel.tipo, d.rel.afecto, slots.n);
    if (d.relTodas) s.relaciones.forEach(function (r) { r.afecto = U.clamp(r.afecto + d.relTodas, -100, 100); });
    if (d.relHijos) s.relaciones.forEach(function (r) { if (r.tipo === 'hijo') r.afecto = U.clamp(r.afecto + d.relHijos, -100, 100); });
    if (d.relPareja) s.relaciones.forEach(function (r) { if (r.tipo === 'pareja' || r.tipo === 'cónyuge') r.afecto = U.clamp(r.afecto + d.relPareja, -100, 100); });
    if (d.relRival) s.relaciones.forEach(function (r) { if (r.tipo === 'rival') r.afecto = U.clamp(r.afecto + d.relRival, -100, 100); });
    if (d.convertirRival) {
      const r = s.relaciones.filter(function (x) { return x.tipo === 'rival'; })[0];
      if (r) { r.tipo = d.convertirRival; r.afecto = 30; this.log(r.nombre + ' pasa a ser ' + d.convertirRival + '.', 'bien'); }
    }
    if (d.romper) this.romperPareja();
    if (d.casar || d.casado) this.casarse();
    if (d.hijo) this.tenerHijo(slots.n);
    if (d.nuevaRel) this.nuevaRelacion();
    if (d.cortarRel) this.cortarRelacion();

    if (d.item) this.darObjeto(slots.o);
    if (d.mascota) this.darMascota(slots.c);
    if (d.droide) this.darDroide();

    if (d.faccion) this.repFaccion(d.faccion, slots);
    if (d.rendimiento) s.rendimiento = U.clamp(s.rendimiento + d.rendimiento, 0, 100);
    if (d.aumento) { s.sueldo = Math.round(s.sueldo * (1 + d.aumento)); this.log('Nuevo sueldo: ' + U.cr(s.sueldo), 'cr'); }
    if (d.despido) this.perderTrabajo();
    if (d.ascenso != null && rng.chance(d.ascenso)) { s.rendimiento += 20; this.chequearAscenso(); }
    if (d.carcel) { s.carcelAños = d.carcel; this.log('Condena: ' + d.carcel + ' año(s).', 'mal'); this.hito('Entra en prisión (' + d.carcel + ' años)'); }
    if (d.empleo) this.tomarEmpleo(d.empleo.id, d.empleo.sueldo);
    if (d.buscarEmpleo) this.cola.unshift(this.prepararGen(SW.GEN.empleo(rng, s, d.buscarEmpleo)));
    if (d.generar && SW.GEN[d.generar]) this.cola.unshift(this.prepararGen(SW.GEN[d.generar](rng, s)));

    if (d.estudio) this.matricular(d.estudio);
    if (d.matricula) this.cola.unshift(this.prepararGen(this.menuMatricula()));
    if (d.tienda) this.cola.unshift(this.prepararGen(this.menuTienda()));
    if (d.hangar) this.cola.unshift(this.prepararGen(this.menuHangar()));
    if (d.viajar) this.cola.unshift(this.prepararGen(this.menuViaje()));
    if (d.fuerzaMenu) this.cola.unshift(this.prepararGen(this.menuFuerza()));
    if (d.accionMenu) this.cola.unshift(this.prepararGen(SW.GEN[rng.chance(0.5) && s.nave ? 'dogfight' : 'accion'](rng, s)));
    if (d.nombrarNave) this.cola.unshift(this.prepararGen(this.menuNombreNave()));
    if (d.construirSable) this.cola.unshift(this.prepararGen(this.menuSable()));
    if (d.unirse) this.unirseOrden(d.unirse);
    if (d.poder) this.darPoder(d.poder);
    if (d.habilidad && s.habilidades.indexOf(d.habilidad) < 0) { s.habilidades.push(d.habilidad); this.log('Nueva habilidad: ' + d.habilidad + '.', 'bien'); }
    if (d.idioma && s.idiomas.indexOf(d.idioma) < 0) { s.idiomas.push(d.idioma); this.log('Aprendes ' + d.idioma + '.', 'bien'); }
    if (d.cibernetica) { s.cibernetica.push(typeof d.cibernetica === 'string' ? d.cibernetica : 'prótesis'); this.log('Implante instalado.', 'bien'); }
    if (d.despertar) this.despertar();
    if (d.kyber) { s.kyber = rng.pick(SW.COLORES_KYBER); this.log('Cristal kyber ' + s.kyber.c + ' en tu poder.', 'bien'); this.hito('Obtiene un cristal kyber ' + s.kyber.c); }
    if (d.sableNuevo) this.construirSable(null);
    if (d.sablePierde) { s.sable = null; this.log('Ya no tienes sable.', 'mal'); }
    if (d.naveCompra) this.darNave(rng.pick(SW.NAVES));
    if (d.naveGana) this.darNave(rng.pick(SW.NAVES));
    if (d.navePierde) { s.nave = null; s.naveNombre = null; this.log('Pierdes tu nave.', 'mal'); }
    if (d.naveEstado) { s.naveEstado = U.clamp(s.naveEstado + d.naveEstado, 0, 100); }
    if (d.apuesta === 'gana') { const g = Math.round(Math.max(1000, s.stats.creditos * 0.5)); s.stats.creditos += g; this.log('Ganas ' + U.cr(g) + '.', 'cr'); }
    if (d.apuesta === 'pierde') { const g = Math.round(s.stats.creditos * 0.5); s.stats.creditos -= g; this.log('Pierdes ' + U.cr(g) + '.', 'mal'); }
    if (d.legado) { s.legado = d.legado; this.hito('Deja un legado: ' + d.legado); }
    if (d.chequeo) this.chequeoMedico();
    if (d.mover) this.mover(d.mover === 'casa' ? s.mundoNatal : null);
    if (d.mueveA) this.mover(d.mueveA);
    if (d.guerra) { s.flags.veterano = true; this.hito('Va a la guerra'); }
    if (d.muerte) this.morir(d.muerteTxt || 'Una mala decisión, la última.');

    // escenas interactivas
    if (d.combate) this.iniciarCombate(d.combate);
    if (d.dogfight) this.iniciarDogfight(d.dogfight);

    clampStats(this.s);
    if (this.s.stats.salud <= 0 && !this.s.muerto) this.morir('Heridas.');
  };

  Game.prototype.prepararGen = function (ev) {
    const inst = { ref: ev, id: ev.id, slots: {}, texto: ev.t, opciones: [] };
    for (let i = 0; i < ev.c.length; i++) {
      const o = ev.c[i];
      if (o.req) { try { if (!o.req(this.s)) continue; } catch (e) { continue; } }
      inst.opciones.push({ idx: i, txt: o.t, sub: o.sub || null, def: o });
    }
    return inst;
  };

  /* ---------------- Relaciones ---------------- */
  Game.prototype.nombreLibre = function (base) {
    const s = this.s, rng = this.rng;
    let n = base, intentos = 0;
    const usado = function (x) {
      return s.relaciones.some(function (r) { return r.nombre === x; }) ||
             s.relacionesPasadas.some(function (r) { return r.nombre === x; });
    };
    while (usado(n) && intentos < 12) {
      n = SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'togruta', 'duros']));
      intentos++;
    }
    return n;
  };

  Game.prototype.añadirRelacion = function (tipo, afecto, nombre) {
    const s = this.s, rng = this.rng;
    const n = this.nombreLibre(nombre || SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'togruta', 'duros'])));
    const esp = rng.pick(SW.ESPECIES);
    s.relaciones.push({ nombre: n, tipo: tipo, afecto: U.clamp(afecto || 20, -100, 100), especie: esp.n, desde: s.edad });
    this.log('Nueva relación: ' + n + ' (' + tipo + ').', 'rel');
    if (tipo === 'cónyuge' || tipo === 'pareja') this.hito(U.titleCase(tipo) + ': ' + n);
  };
  Game.prototype.nuevaRelacion = function () {
    const rng = this.rng;
    const tipo = rng.weighted([
      { v: 'amigo', w: 40 }, { v: 'pareja', w: 22 }, { v: 'contacto', w: 20 },
      { v: 'rival', w: 10 }, { v: 'socio', w: 8 }
    ], function (o) { return o.w; }).v;
    this.añadirRelacion(tipo, tipo === 'rival' ? -25 : rng.int(20, 60));
  };
  Game.prototype.cortarRelacion = function () {
    const s = this.s;
    const peor = s.relaciones.slice().sort(function (a, b) { return a.afecto - b.afecto; })[0];
    if (!peor) { this.log('No hay a quién cortar. Eso también dice algo.', 'res'); return; }
    s.relaciones = s.relaciones.filter(function (r) { return r !== peor; });
    s.relacionesPasadas.push(peor);
    this.log('Cortas con ' + peor.nombre + '.', 'rel');
  };
  Game.prototype.romperPareja = function () {
    const s = this.s;
    const p = s.relaciones.filter(function (r) { return r.tipo === 'pareja' || r.tipo === 'cónyuge'; })[0];
    if (!p) return;
    s.relaciones = s.relaciones.filter(function (r) { return r !== p; });
    s.relacionesPasadas.push(p);
    this.log('Se acaba lo de ' + p.nombre + '.', 'rel');
    this.hito('Ruptura con ' + p.nombre);
  };
  Game.prototype.casarse = function () {
    const s = this.s;
    const yaCasado = s.relaciones.filter(function (r) { return r.tipo === 'cónyuge'; })[0];
    let p = s.relaciones.filter(function (r) { return r.tipo === 'pareja'; })[0];
    if (yaCasado) {
      if (!p) { this.log('Ya estás casad@ con ' + yaCasado.nombre + '. Renováis los votos.', 'bien'); yaCasado.afecto = Math.min(100, yaCasado.afecto + 10); return; }
      // segunda boda: la anterior se rompe primero
      this.log('Te separas de ' + yaCasado.nombre + ' antes de volver a casarte.', 'rel');
      s.relaciones = s.relaciones.filter(function (r) { return r !== yaCasado; });
      s.relacionesPasadas.push(yaCasado);
    }
    if (!p) { this.añadirRelacion('cónyuge', 65); this.hito('Se casa'); return; }
    p.tipo = 'cónyuge'; p.afecto = Math.min(100, p.afecto + 15);
    this.log('Te casas con ' + p.nombre + '.', 'bien');
    this.hito('Se casa con ' + p.nombre);
  };
  Game.prototype.tenerHijo = function (nombre) {
    const s = this.s, rng = this.rng;
    const n = this.nombreLibre(nombre || SW.genNombre(rng, s.especie));
    s.relaciones.push({ nombre: n, tipo: 'hijo', afecto: 70, especie: s.especieN, desde: s.edad });
    this.log('Nace ' + n + '.', 'bien');
    this.hito('Nace su hijo ' + n);
  };

  /* ---------------- Inventario ---------------- */
  Game.prototype.darObjeto = function (nombre) {
    const s = this.s, rng = this.rng;
    let o = nombre ? SW.OBJETOS.filter(function (x) { return x.n === nombre; })[0] : null;
    if (!o) o = rng.pick(SW.OBJETOS);
    s.objetos.push(o.n);
    this.log('Obtienes: ' + o.n + '.', 'bien');
  };
  Game.prototype.darMascota = function (tipo) {
    const s = this.s, rng = this.rng;
    const t = tipo || rng.pick(SW.CRIATURAS);
    s.mascota = { tipo: t, nombre: SW.genNombre(rng, 'humano') };
    this.log('Ahora tienes un ' + t + ' llamado ' + s.mascota.nombre + '.', 'bien');
    this.hito('Adopta un ' + t);
  };
  Game.prototype.darDroide = function () {
    const s = this.s, rng = this.rng;
    s.droide = { nombre: SW.genNombre(rng, 'droide'), tipo: rng.pick(['astromecánico', 'protocolar', 'médico', 'de carga', 'de combate reprogramado']) };
    this.log('Droide ' + s.droide.tipo + ' ' + s.droide.nombre + ' a tu servicio.', 'bien');
  };
  Game.prototype.darNave = function (nave) {
    const s = this.s;
    s.nave = nave;
    s.naveEstado = 85;
    this.log('Ahora tienes: ' + nave.n + '.', 'bien');
    this.hito('Consigue una nave: ' + nave.n);
  };

  /* ---------------- Facciones ---------------- */
  Game.prototype.repFaccion = function (spec, slots) {
    const s = this.s;
    let id, delta;
    const m = /^([a-z_]+)([+-]\d+)$/.exec(spec);
    if (!m) return;
    id = m[1]; delta = parseInt(m[2], 10);
    if (id === 'auto') id = (slots && slots._faccion) || 'imperio';
    s.faccionRep[id] = U.clamp((s.faccionRep[id] || 0) + delta, -100, 100);
  };

  /* ---------------- Trabajo ---------------- */
  Game.prototype.tomarEmpleo = function (id, sueldo) {
    const s = this.s;
    const c = SW.carrera(id);
    if (!c) return;
    s.trabajo = id;
    s.rango = c.rangos[0];
    s.sueldo = sueldo || c.sueldoBase;
    s.añosEnTrabajo = 0;
    s.rendimiento = 50;
    if (c.faccion) s.faccionRep[c.faccion] = U.clamp((s.faccionRep[c.faccion] || 0) + 15, -100, 100);
    this.log('Empiezas como ' + s.rango + ' (' + c.n + '). ' + U.cr(s.sueldo) + '/año.', 'bien');
    this.hito('Empieza como ' + c.n);
  };
  Game.prototype.perderTrabajo = function () {
    const s = this.s;
    if (!s.trabajo) return;
    const c = SW.carrera(s.trabajo);
    this.log('Dejas de trabajar como ' + (c ? c.n : 'lo que fuera') + '.', 'mal');
    s.trabajo = null; s.rango = null; s.sueldo = 0; s.añosEnTrabajo = 0;
  };
  Game.prototype.unirseOrden = function (cual) {
    const s = this.s;
    if (cual === 'jedi') {
      if (s.stats.alineamiento < -30) { this.log('La Orden percibe la sombra en ti. Te rechazan.', 'mal'); return; }
      this.tomarEmpleo('jedi', 0);
      s.stats.alineamiento += 15;
      this.hito('Entra en la Orden Jedi');
    } else {
      this.tomarEmpleo('sith', 0);
      s.stats.alineamiento -= 25;
      s.stats.fuerza += 10;
      this.hito('Abraza el lado oscuro');
    }
    clampStats(s);
  };

  /* ---------------- Estudios ---------------- */
  Game.prototype.matricular = function (id) {
    const s = this.s;
    const e = SW.ESTUDIOS.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    if (s.stats.creditos < e.coste) { this.log('No puedes pagar la matrícula.', 'mal'); return; }
    s.stats.creditos -= e.coste;
    aplicarMods(s, e.mods);
    s.estudios.push(e.n);
    if (e.faccion) s.faccionRep[e.faccion] = U.clamp((s.faccionRep[e.faccion] || 0) + 15, -100, 100);
    clampStats(s);
    this.log('Completas: ' + e.n + '.', 'bien');
    this.hito('Se forma en ' + e.n);
  };

  /* ---------------- Fuerza ---------------- */
  Game.prototype.darPoder = function (spec) {
    const s = this.s, rng = this.rng;
    let pool = SW.PODERES.filter(function (p) { return s.poderes.indexOf(p.id) < 0; });
    if (spec === 'auto_luz') pool = pool.filter(function (p) { return p.lado >= 0; });
    else if (spec === 'auto_oscuro') pool = pool.filter(function (p) { return p.lado <= 0; });
    else if (spec !== 'auto') { const p = SW.PODERES.filter(function (x) { return x.id === spec; })[0]; pool = p && s.poderes.indexOf(p.id) < 0 ? [p] : pool; }
    pool = pool.filter(function (p) { return s.stats.fuerza >= p.coste * 0.8; });
    if (!pool.length) { this.log('No aprendes nada nuevo esta vez.', 'res'); return; }
    const p = rng.pick(pool);
    s.poderes.push(p.id);
    this.log('Aprendes: ' + p.n + '. ' + p.desc, 'bien');
    this.hito('Aprende ' + p.n);
  };
  Game.prototype.construirSable = function (color) {
    const s = this.s, rng = this.rng;
    const k = color || s.kyber || rng.pick(SW.COLORES_KYBER);
    s.sable = { color: k.c, hex: k.hex, forma: s.forma || rng.pick(SW.FORMAS_SABLE) };
    s.forma = s.sable.forma;
    this.log('Construyes tu sable de luz: hoja ' + k.c + ', forma ' + s.sable.forma + '.', 'bien');
    this.hito('Construye un sable de luz ' + k.c);
  };

  /* ---------------- Movimiento ---------------- */
  Game.prototype.mover = function (destino) {
    const s = this.s, rng = this.rng;
    const d = destino || rng.pick(SW.MUNDO_NOMBRES.filter(function (m) { return m !== s.mundo; }));
    if (d === s.mundo) return;
    s.mundo = d;
    if (s.mundosVistos.indexOf(d) < 0) {
      s.mundosVistos.push(d);
      s.contadores.mundosVisitados = s.mundosVistos.length;
    }
    this.log('Te trasladas a ' + d + '.', 'viaje');
  };

  /* ---------------- Chequeo médico ---------------- */
  Game.prototype.chequeoMedico = function () {
    const s = this.s, rng = this.rng;
    if (rng.chance(0.25 + (100 - s.stats.salud) / 300)) {
      const dolencias = ['una dolencia pulmonar por polvo de especia', 'daño hepático', 'microfracturas antiguas mal curadas', 'una arritmia', 'un parásito de Felucia', 'desgaste articular'];
      const d = rng.pick(dolencias);
      this.log('Te detectan ' + d + '. Tratable a tiempo.', 'mal');
      this.aplicarFx({ salud: 6, creditos: -6000, cordura: -3 }, {});
    } else {
      this.log('Todo en orden. El médico parece decepcionado.', 'bien');
      this.aplicarFx({ cordura: 5 }, {});
    }
  };

  /* ============================================================
     ESCENAS DE ACCIÓN (combate por turnos)
     ============================================================ */
  Game.prototype.iniciarCombate = function (cfg) {
    const s = this.s, rng = this.rng;
    const poderCombate = s.stats.destreza + s.stats.fuerza * 0.6 + (s.sable ? 18 : 0) +
      (s.habilidades.indexOf('luchador') >= 0 ? 10 : 0) + (s.habilidades.indexOf('tirador') >= 0 ? 8 : 0) +
      (s.cibernetica.length * 5);
    this.escena = {
      tipo: 'combate',
      cfg: cfg,
      ronda: 1,
      maxRondas: 3,
      hpEnemigo: 100,
      ventaja: 0,
      poder: poderCombate,
      dif: cfg.dif || 50
    };
    this.cola.unshift(this.escenaCombateEvento());
  };

  Game.prototype.escenaCombateEvento = function () {
    const e = this.escena;
    const s = this.s;
    const desc = e.cfg.duelo ? 'DUELO' : (e.cfg.bestia ? 'BESTIA' : 'COMBATE');
    const barra = '█'.repeat(Math.max(0, Math.round(e.hpEnemigo / 10))) + '░'.repeat(10 - Math.max(0, Math.round(e.hpEnemigo / 10)));
    const opciones = [
      { t: '⚔ Ataque agresivo', tac: 'agresivo', sub: 'Mucho daño, te expones.' },
      { t: '⛨ Defensa y contra', tac: 'defensa', sub: 'Poco daño, poco riesgo.' },
      { t: '↯ Maniobra astuta', tac: 'astuta', sub: 'Usa el entorno. Depende del intelecto.' },
      { t: '✦ Usar la Fuerza', tac: 'fuerza', sub: 'Requiere sensibilidad.', req: function (st) { return st.stats.fuerza > 25; } },
      { t: '⚑ Retirarte', tac: 'huir', sub: 'Vivir para contarlo.' }
    ];
    return this.prepararGen({
      id: 'escena_combate', gen: true,
      t: '<span class="scene-tag">' + desc + ' · RONDA ' + e.ronda + '/' + e.maxRondas + '</span><br>Enemigo: [' + barra + '] ' + Math.max(0, Math.round(e.hpEnemigo)) + '%<br>Tu salud: ' + s.stats.salud + '%',
      c: opciones.map(function (o) { return { t: o.t, sub: o.sub, req: o.req, tactica: o.tac }; })
    });
  };

  Game.prototype.resolverTactica = function (tac) {
    const e = this.escena, s = this.s, rng = this.rng;
    if (!e) return;
    let dmg = 0, recib = 0, txt = '';

    const skill = e.poder;
    const dif = e.dif;

    if (tac === 'huir') {
      if (rng.chance(0.55 + (s.stats.destreza - dif) / 200)) {
        this.log('Te retiras a tiempo. Sin gloria, con vida.', 'res');
        this.escena = null;
        return;
      }
      this.log('No consigues salir. Te alcanzan en la espalda.', 'mal');
      this.aplicarFx({ salud: -18, cordura: -5 }, {});
      this.escena = null;
      return;
    }

    if (tac === 'agresivo') {
      const acierto = rng.chance(U.clamp(0.45 + (skill - dif) / 160, 0.15, 0.9));
      dmg = acierto ? rng.int(35, 55) : rng.int(5, 15);
      recib = acierto ? rng.int(4, 12) : rng.int(14, 26);
      txt = acierto ? 'Entras fuerte y conectas.' : 'Fallas la entrada y te castigan.';
    } else if (tac === 'defensa') {
      const acierto = rng.chance(U.clamp(0.6 + (skill - dif) / 200, 0.3, 0.92));
      dmg = acierto ? rng.int(15, 28) : rng.int(4, 10);
      recib = acierto ? rng.int(0, 6) : rng.int(8, 16);
      txt = acierto ? 'Aguantas y devuelves en el hueco.' : 'La defensa cede un poco.';
    } else if (tac === 'astuta') {
      const acierto = rng.chance(U.clamp(0.35 + (s.stats.intelecto - dif) / 130, 0.1, 0.9));
      dmg = acierto ? rng.int(40, 70) : rng.int(0, 6);
      recib = acierto ? rng.int(0, 5) : rng.int(12, 22);
      txt = acierto ? 'Usas el terreno. Funciona de maravilla.' : 'La idea era buena sobre el papel.';
    } else if (tac === 'fuerza') {
      const acierto = rng.chance(U.clamp(0.4 + (s.stats.fuerza - dif) / 140, 0.1, 0.95));
      dmg = acierto ? rng.int(45, 75) : rng.int(0, 10);
      recib = acierto ? rng.int(0, 4) : rng.int(10, 20);
      txt = acierto ? 'La Fuerza fluye y el resultado no admite discusión.' : 'La conexión se rompe en el peor momento.';
      if (acierto && s.stats.alineamiento < -30) { s.stats.cordura -= 3; }
      s.stats.fuerza = Math.min(100, s.stats.fuerza + 1);
    }

    e.hpEnemigo -= dmg;
    this.aplicarFx({ salud: -recib }, {});
    this.log(txt + ' (le haces ' + Math.round(dmg) + ', recibes ' + Math.round(recib) + ')', dmg > recib ? 'bien' : 'mal');

    if (this.s.stats.salud <= 0) { this.morir(e.cfg.duelo ? 'Cae en un duelo.' : 'Cae en combate.'); this.escena = null; return; }

    if (e.hpEnemigo <= 0) { this.finCombate(true); return; }
    e.ronda++;
    if (e.ronda > e.maxRondas) { this.finCombate(e.hpEnemigo < 45); return; }
    this.cola.unshift(this.escenaCombateEvento());
  };

  Game.prototype.finCombate = function (victoria) {
    const e = this.escena, s = this.s, rng = this.rng;
    if (!e) return;
    if (victoria) {
      const botin = e.cfg.botin || 0;
      if (botin) { s.stats.creditos += botin; this.log('Victoria. Cobras ' + U.cr(botin) + '.', 'cr'); }
      else this.log('Victoria.', 'bien');
      this.aplicarFx({ destreza: 5, reputacion: 4, notoriedad: e.cfg.contrato ? 6 : 3 }, {});
      if (e.cfg.contrato) s.contadores.cazas = (s.contadores.cazas || 0) + 1;
      if (e.cfg.duelo) { s.contadores.duelos = (s.contadores.duelos || 0) + 1; this.hito('Gana un duelo'); }
    } else {
      this.log('El enemigo aguanta más que tú. Te retiras maltrecho.', 'mal');
      this.aplicarFx({ salud: -12, cordura: -6, reputacion: -4 }, {});
    }
    this.escena = null;
    if (this.s.stats.salud <= 0 && !this.s.muerto) this.morir('Heridas de combate.');
  };

  /* ---------------- Combate espacial ---------------- */
  Game.prototype.iniciarDogfight = function (cfg) {
    const s = this.s;
    if (!s.nave) { this.log('No tienes nave. Ves el combate desde tierra.', 'res'); return; }
    this.escena = {
      tipo: 'dogfight', cfg: cfg, ronda: 1, maxRondas: 3,
      hpEnemigo: 100,
      dif: cfg.dif || 50,
      poder: s.stats.destreza + s.nave.vel * 4 + s.nave.arm * 4 + (s.habilidades.indexOf('piloto') >= 0 ? 12 : 0) + (s.naveEstado - 60) / 3
    };
    this.cola.unshift(this.escenaDogfightEvento());
  };

  Game.prototype.escenaDogfightEvento = function () {
    const e = this.escena, s = this.s;
    const barra = '█'.repeat(Math.max(0, Math.round(e.hpEnemigo / 10))) + '░'.repeat(10 - Math.max(0, Math.round(e.hpEnemigo / 10)));
    return this.prepararGen({
      id: 'escena_dogfight', gen: true,
      t: '<span class="scene-tag">COMBATE ESPACIAL · PASADA ' + e.ronda + '/' + e.maxRondas + '</span><br>Enemigo: [' + barra + '] ' + Math.max(0, Math.round(e.hpEnemigo)) + '%<br>Casco de tu nave: ' + s.naveEstado + '%',
      c: [
        { t: '⤢ Persecución cerrada', tacticaN: 'persecucion', sub: 'Directo a su cola.' },
        { t: '⟲ Giro de Koiogran', tacticaN: 'koiogran', sub: 'Maniobra difícil, premio alto.' },
        { t: '⌖ Fuego de proa a distancia', tacticaN: 'distancia', sub: 'Seguro, lento.' },
        { t: '≈ Usar el terreno / desechos', tacticaN: 'terreno', sub: 'Riesgo para el casco.' },
        { t: '⇥ Salto al hiperespacio', tacticaN: 'saltar', sub: 'Abandonar el combate.' }
      ]
    });
  };

  Game.prototype.resolverTacticaNave = function (tac) {
    const e = this.escena, s = this.s, rng = this.rng;
    if (!e) return;
    let dmg = 0, casco = 0, txt = '';
    const p = e.poder, dif = e.dif;

    if (tac === 'saltar') {
      if (rng.chance(0.6 + (s.stats.intelecto - dif) / 200)) {
        this.log('Coordenadas metidas a tiempo. Desapareces.', 'res');
      } else {
        this.log('Te alcanzan justo antes del salto.', 'mal');
        s.naveEstado = U.clamp(s.naveEstado - 30, 0, 100);
        this.aplicarFx({ salud: -10 }, {});
      }
      this.escena = null;
      return;
    }
    if (tac === 'persecucion') {
      const ok = rng.chance(U.clamp(0.5 + (p - dif) / 160, 0.15, 0.9));
      dmg = ok ? rng.int(30, 50) : rng.int(5, 12); casco = ok ? rng.int(2, 8) : rng.int(12, 25);
      txt = ok ? 'Le pegas la cola y disparas en el punto justo.' : 'Se te va y aparece detrás.';
    } else if (tac === 'koiogran') {
      const ok = rng.chance(U.clamp(0.35 + (p - dif) / 140, 0.1, 0.85));
      dmg = ok ? rng.int(50, 80) : rng.int(0, 8); casco = ok ? rng.int(0, 5) : rng.int(18, 32);
      txt = ok ? 'Invertida perfecta. Ahora el cazado es él.' : 'Pierdes velocidad en el peor momento.';
    } else if (tac === 'distancia') {
      const ok = rng.chance(U.clamp(0.65 + (p - dif) / 220, 0.3, 0.9));
      dmg = ok ? rng.int(15, 28) : rng.int(3, 9); casco = ok ? rng.int(0, 4) : rng.int(6, 14);
      txt = ok ? 'Disparo medido a distancia.' : 'Se cierra la distancia demasiado rápido.';
    } else if (tac === 'terreno') {
      const ok = rng.chance(U.clamp(0.45 + (s.stats.intelecto - dif) / 150, 0.1, 0.9));
      dmg = ok ? rng.int(40, 70) : rng.int(0, 5); casco = ok ? rng.int(5, 15) : rng.int(20, 38);
      txt = ok ? 'Le metes en la chatarra y no sale.' : 'Rozas algo grande. Suena feo.';
    }

    e.hpEnemigo -= dmg;
    s.naveEstado = U.clamp(s.naveEstado - casco, 0, 100);
    this.log(txt + ' (daño ' + Math.round(dmg) + ', casco −' + Math.round(casco) + ')', dmg > casco ? 'bien' : 'mal');

    if (s.naveEstado <= 0) {
      this.log('Tu nave se parte. Cápsula de escape.', 'mal');
      this.aplicarFx({ salud: -25, cordura: -10 }, {});
      s.nave = null; s.naveNombre = null;
      this.escena = null;
      if (s.stats.salud <= 0) this.morir('Derribado.');
      return;
    }
    if (e.hpEnemigo <= 0) {
      s.contadores.derribos = (s.contadores.derribos || 0) + 1;
      this.log('Derribado. Uno más para la lista.', 'bien');
      this.aplicarFx({ destreza: 5, reputacion: 5 }, {});
      if (e.cfg.botin) { s.stats.creditos += e.cfg.botin; this.log('Recuperas ' + U.cr(e.cfg.botin) + ' de los restos.', 'cr'); }
      this.escena = null;
      return;
    }
    e.ronda++;
    if (e.ronda > e.maxRondas) {
      this.log('El enemigo rompe el combate y se marcha.', 'res');
      this.escena = null;
      return;
    }
    this.cola.unshift(this.escenaDogfightEvento());
  };

  /* ============================================================
     MENÚS GENERADOS
     ============================================================ */
  Game.prototype.menuTienda = function () {
    const s = this.s, rng = this.rng;
    const stock = rng.pickN(SW.OBJETOS, 5);
    const c = stock.map(function (o) {
      return {
        t: 'Comprar ' + o.n + ' — ' + U.cr(o.p),
        sub: o.t,
        req: function (st) { return st.stats.creditos >= o.p; },
        fx: { creditos: -o.p },
        comprar: o.n
      };
    });
    c.push({ t: 'Vender algo tuyo', vender: true });
    c.push({ t: 'Salir del mercado', fx: {}, out: 'Sales sin gastar. Raro.' });
    return { id: 'menu_tienda', gen: true, t: 'MERCADO de ' + s.mundo + ' — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuHangar = function () {
    const s = this.s, rng = this.rng;
    const c = [];
    const oferta = rng.pickN(SW.NAVES, 3);
    oferta.forEach(function (n) {
      const precio = Math.round(n.p * (0.8 + rng.next() * 0.5));
      c.push({
        t: 'Comprar ' + n.n + ' — ' + U.cr(precio),
        sub: 'vel ' + n.vel + ' · carga ' + n.carga + ' · armas ' + n.arm,
        req: function (st) { return st.stats.creditos >= precio; },
        fx: { creditos: -precio },
        comprarNave: n.n
      });
    });
    if (s.nave) {
      c.push({ t: 'Reparar casco (' + U.cr(12000) + ')', req: function (st) { return st.stats.creditos >= 12000; }, fx: { creditos: -12000 }, naveEstado: 100 });
      c.push({ t: 'Mejorar motores (' + U.cr(25000) + ')', req: function (st) { return st.stats.creditos >= 25000; }, fx: { creditos: -25000 }, mejora: 'vel' });
      c.push({ t: 'Mejorar armamento (' + U.cr(30000) + ')', req: function (st) { return st.stats.creditos >= 30000; }, fx: { creditos: -30000 }, mejora: 'arm' });
      c.push({ t: 'Vender tu ' + s.nave.n, venderNave: true });
    }
    c.push({ t: 'Salir del hangar', fx: {} });
    return { id: 'menu_hangar', gen: true, t: 'HANGAR de ' + s.mundo + ' — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuViaje = function () {
    const s = this.s, rng = this.rng;
    const destinos = rng.pickN(SW.MUNDO_NOMBRES.filter(function (m) { return m !== s.mundo; }), 5);
    const c = destinos.map(function (d) {
      const m = SW.mundo(d);
      const coste = s.nave ? 800 : Math.round(2000 + m.riq * 400);
      return {
        t: 'Ir a ' + d + ' — ' + U.cr(coste),
        sub: m.r + ' · ' + m.bio + ' · ' + m.vibe,
        req: function (st) { return st.stats.creditos >= coste; },
        fx: { creditos: -coste },
        mueveA: d
      };
    });
    c.push({ t: 'Quedarte donde estás', fx: { cordura: 2 } });
    return { id: 'menu_viaje', gen: true, t: 'PUERTO ESTELAR de ' + s.mundo + ' — destinos disponibles', c: c };
  };

  Game.prototype.menuFuerza = function () {
    const s = this.s;
    const c = [
      { t: 'Meditar (fuerza + cordura)', fx: { fuerza: 8, cordura: 10 } },
      { t: 'Entrenar poderes activos', fx: { fuerza: 10, salud: -4 }, poder: 'auto' },
      { t: 'Buscar un cristal kyber', req: function (st) { return !st.kyber; }, fx: { fuerza: 5, salud: -6, creditos: -3000 }, kyber: true },
      { t: 'Construir/rehacer tu sable', req: function (st) { return !!st.kyber; }, construirSable: true },
      { t: 'Estudiar textos prohibidos', fx: { fuerza: 14, alineamiento: -12, cordura: -8 }, poder: 'auto_oscuro' },
      { t: 'Estudiar textos de la Orden', fx: { fuerza: 10, alineamiento: 10, cordura: 5 }, poder: 'auto_luz' },
      { t: 'Ayunar y desconectar', fx: { fuerza: -5, cordura: 15, salud: 5 } }
    ];
    return { id: 'menu_fuerza', gen: true, t: 'LA FUERZA — nivel actual: ' + s.stats.fuerza + ' · alineamiento: ' + s.stats.alineamiento, c: c };
  };

  Game.prototype.menuMatricula = function () {
    const s = this.s;
    const c = SW.ESTUDIOS.filter(function (e) {
      if (e.req) { for (const k in e.req) if ((s.stats[k] || 0) < e.req[k]) return false; }
      return s.estudios.indexOf(e.n) < 0;
    }).map(function (e) {
      return {
        t: e.n + ' — ' + (e.coste ? U.cr(e.coste) : 'gratis'),
        sub: e.años + ' años de formación',
        req: function (st) { return st.stats.creditos >= e.coste; },
        estudio: e.id
      };
    });
    c.push({ t: 'Ninguno', fx: {} });
    return { id: 'menu_matricula', gen: true, t: 'PROGRAMAS DE FORMACIÓN disponibles', c: c };
  };

  Game.prototype.menuNombreNave = function () {
    const rng = this.rng;
    const adj = ['Halcón', 'Fantasma', 'Vagabundo', 'Aguja', 'Corsario', 'Sombra', 'Errante', 'Trueno', 'Cuchillo', 'Mendigo'];
    const comp = ['de Corellia', 'Milenario', 'del Borde', 'Oxidado', 'Afortunado', 'de Hierro', 'sin Nombre', 'Rojo', 'Tardío', 'de tu Madre'];
    const nombres = [];
    for (let i = 0; i < 4; i++) nombres.push(rng.pick(adj) + ' ' + rng.pick(comp));
    const c = nombres.map(function (n) { return { t: '"' + n + '"', ponerNombreNave: n }; });
    return { id: 'menu_nave_nombre', gen: true, t: 'Hay que bautizarla. El nombre importa más de lo que parece.', c: c };
  };

  Game.prototype.menuSable = function () {
    const c = SW.COLORES_KYBER.map(function (k) {
      return { t: 'Hoja ' + k.c, sub: k.s, colorSable: k.c };
    });
    return { id: 'menu_sable', gen: true, t: 'El cristal responde. ¿Qué color canta dentro de ti?', c: c };
  };

  /* ---------------- Menú de actividad anual ---------------- */
  Game.prototype.menuActividades = function () {
    const s = this.s;
    return SW.ACTIVIDADES.filter(function (a) {
      if (s.edad < a.min) return false;
      if (a.req) { try { return a.req(s); } catch (e) { return false; } }
      return true;
    });
  };

  Game.prototype.hacerActividad = function (id) {
    const s = this.s, rng = this.rng;
    const pool = SW.ACTOS[id] || [];
    const posibles = this.eventosPosibles(pool);
    if (!posibles.length) { this.log('Este año no surge nada en esa vía.', 'res'); return; }
    const ev = rng.weighted(posibles);
    const inst = this.prepararEvento(ev);
    if (inst) this.cola.push(inst);
    this.actividadUsada = true;
    this.fase = 'evento';
  };

  /* ---------------- Extras aplicados en UI ---------------- */
  Game.prototype.aplicarExtra = function (d) {
    const s = this.s, rng = this.rng;
    if (d.comprar) { s.objetos.push(d.comprar); this.log('Compras: ' + d.comprar + '.', 'bien'); }
    if (d.comprarNave) {
      const n = SW.NAVES.filter(function (x) { return x.n === d.comprarNave; })[0];
      if (n) this.darNave(Object.assign({}, n));
    }
    if (d.venderNave && s.nave) {
      const v = Math.round(s.nave.p * 0.55 * (s.naveEstado / 100));
      s.stats.creditos += v;
      this.log('Vendes ' + s.nave.n + ' por ' + U.cr(v) + '.', 'cr');
      s.nave = null; s.naveNombre = null;
    }
    if (d.vender) {
      if (!s.objetos.length) { this.log('No tienes nada que vender.', 'res'); }
      else {
        const o = s.objetos.pop();
        const base = SW.OBJETOS.filter(function (x) { return x.n === o; })[0];
        const v = Math.round((base ? base.p : 500) * 0.5);
        s.stats.creditos += v;
        this.log('Vendes ' + o + ' por ' + U.cr(v) + '.', 'cr');
      }
    }
    if (d.mejora && s.nave) {
      s.nave = Object.assign({}, s.nave);
      s.nave[d.mejora] = Math.min(12, s.nave[d.mejora] + 2);
      this.log('Mejora instalada.', 'bien');
    }
    if (d.ponerNombreNave) { s.naveNombre = d.ponerNombreNave; this.log('Tu nave se llama "' + d.ponerNombreNave + '".', 'bien'); this.hito('Bautiza su nave: ' + d.ponerNombreNave); }
    if (d.colorSable) {
      const k = SW.COLORES_KYBER.filter(function (x) { return x.c === d.colorSable; })[0];
      this.construirSable(k);
    }
    clampStats(s);
  };

  SW.Game = Game;
  SW.clampStats = clampStats;

})(window);

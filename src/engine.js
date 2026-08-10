/* ============================================================
   HOLOVIDA :: motor
   Estado, maduración por edad, heridas, ciclo anual,
   resolución de decisiones, combate táctico y muerte.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  const STATS_0_100 = ['salud', 'fisico', 'fuerza', 'destreza', 'intelecto', 'carisma', 'suerte', 'cordura', 'reputacion', 'notoriedad'];

  /* Techo al que llega el crecimiento natural. Por encima de ahí
     solo se sube tomando decisiones. */
  const TECHO_NATURAL = 55;

  /* Curva de maduración: cuánto sube cada estadística por año de vida
     biológica. Valores pequeños a propósito: la vida la construyes tú. */
  function crecimientoPorEdad(bio) {
    if (bio <= 5)  return { fisico: 4.0, destreza: 3.6, intelecto: 4.6, carisma: 2.6, cordura: 1.6 };
    if (bio <= 12) return { fisico: 3.4, destreza: 3.2, intelecto: 4.0, carisma: 2.8, cordura: 1.8 };
    if (bio <= 17) return { fisico: 3.0, destreza: 2.8, intelecto: 2.8, carisma: 2.8, cordura: 1.4 };
    if (bio <= 25) return { fisico: 1.6, destreza: 1.2, intelecto: 1.8, carisma: 1.8, cordura: 1.2 };
    if (bio <= 40) return { fisico: 0.5, destreza: 0.4, intelecto: 1.0, carisma: 1.0, cordura: 1.0 };
    if (bio <= 58) return { fisico: -0.7, destreza: -0.5, intelecto: 0.6, carisma: 0.6, cordura: 0.8 };
    if (bio <= 72) return { fisico: -1.6, destreza: -1.3, intelecto: 0.2, carisma: 0.2, cordura: 0.4 };
    return { fisico: -2.6, destreza: -2.2, intelecto: -0.6, carisma: -0.4, cordura: 0.0 };
  }

  /* ---------------- Estado ---------------- */
  function nuevoEstado(cfg, rng) {
    // sin mundo elegido, se nace donde nace la gente de tu especie
    const hogar = cfg.mundo || (cfg.especie && cfg.especie.home && cfg.especie.home.length
      ? rng.pick(cfg.especie.home) : 'Coruscant');
    const esp = cfg.especie;
    const era = cfg.era;
    const s = {
      version: 2,
      semilla: rng.seedStr,
      nombre: SW.nombreLimpio(cfg.nombre),
      pronombre: cfg.pronombre || 'él',
      especie: esp.id,
      especieN: esp.n,
      ritmo: esp.ritmo || 1,                       // años biológicos por año jugado
      vidaMax: Math.min(esp.vida, 118),
      vidaEspecie: esp.vida,
      era: era.id,
      eraN: era.n,
      mundo: hogar,
      mundoNatal: hogar,
      rasgo: cfg.rasgo.id,
      rasgoN: cfg.rasgo.n,
      apariencia: Object.assign({ especie: esp.id }, cfg.apariencia || {}),
      peligro: 0,                                  // cuánto has tentado a la suerte
      mejorasNave: [],
      contrato: null,
      escalonPolitico: 0,
      aprendizSith: null,
      estudiando: null,
      puestoGuerra: null,
      edad: 0,
      edadBio: 0,
      muerto: false,
      causaMuerte: '',

      /* al nacer eres una cría: todo bajo. lo demás se gana. */
      stats: {
        salud: 82, fisico: 5, fuerza: 0, destreza: 5, intelecto: 5, carisma: 8,
        suerte: 40, cordura: 52, reputacion: 5, notoriedad: 0,
        alineamiento: 0, creditos: 300
      },
      /* potencial innato de especie/era/origen: se expresa al crecer */
      dotes: {},
      dotesDadas: {},

      heridas: [],
      flags: {},
      poderes: [],
      habilidades: [],
      idiomas: ['básico'],
      objetos: [],
      conocidos: [],          // gente conocida del canon con la que te has cruzado
      estudios: [],
      relaciones: [],
      relacionesPasadas: [],
      faccionRep: {},
      bando: null,
      contadores: { mundosVisitados: 1, cazas: 0, derribos: 0, rutas: 0, duelos: 0, crimenes: 0, años: 0, batallas: 0 },
      mundosVistos: [hogar],
      trabajo: null, rango: null, sueldo: 0, rendimiento: 50, añosEnTrabajo: 0,
      nave: null, naveNombre: null, naveEstado: 100,
      sable: null, kyber: null, forma: null,
      droide: null, mascota: null,
      cibernetica: [],
      carcelAños: 0,
      titulos: [],
      legado: null,
      recientes: [],
      vistos: {},
      pendientes: [],         // asuntos que te atan a un mundo
      carga: null,            // mercancía comprada para revender
      buscado: 0,             // gente que te busca en este sistema
      acciones: 3,            // acciones por año
      accionesMax: 3,
      historia: [],
      hitos: [],
      eraFija: (era.id === 'era_perdida'),
      eraNace: era.id,                  // la época que elegiste, que fija el año de nacimiento
      anioNace: (SW.ANIO_ERA || {})[era.id],
      eraElegida: era.id,
      ambicion: cfg.ambicion || null,   // qué querías conseguir con tu vida
      dificultad: cfg.dificultad || 'normal',
      tramas: {},             // hilos largos que cruzan la vida entera
      racha: 0,               // buenas o malas seguidas: da suerte o te la quita
      talentos: []            // lo que has ido eligiendo aprender
    };

    /* Eliges la época que quieres VIVIR, y eso fija tu año de nacimiento.
       El día que naces puedes estar todavía en la anterior: si eliges
       Guerras Clon naces en el 38 ABY, o sea en plena República tardía,
       y llegas a la guerra con dieciséis años. */
    if (!s.eraFija && SW.eraDeAnio && s.anioNace != null) {
      const real = SW.eraDeAnio(s.anioNace);
      const f = (SW.ERAS || []).filter(function (x) { return x.id === real; })[0];
      if (f) { s.era = f.id; s.eraN = f.n; }
    }

    // la dificultad elegida se nota desde el primer día
    if (SW.dificultadDe) {
      const dif = SW.dificultadDe(s);
      s.stats.creditos += dif.creditos;
      s.stats.salud = U.clamp(s.stats.salud + dif.salud, 10, 100);
    }

    // el dinero de la familia es inmediato; el resto es potencial
    const fuentes = [esp.mods, era.mods, cfg.rasgo.mods];
    fuentes.forEach(function (m) {
      if (!m) return;
      for (const k in m) {
        if (k === 'creditos') { s.stats.creditos += m[k]; continue; }
        if (s.stats[k] == null) continue;
        s.dotes[k] = (s.dotes[k] || 0) + m[k];
      }
    });

    // talento natural: cada persona tiene su propio techo, no todos iguales
    s.techos = {};
    ['fisico', 'destreza', 'intelecto', 'carisma', 'cordura'].forEach(function (k) {
      s.techos[k] = TECHO_NATURAL + rng.int(-12, 12);
    });

    // sensibilidad a la Fuerza: se decide al nacer
    s.sensible = esp.id !== 'droide' && ((s.dotes.fuerza || 0) >= 8 || cfg.rasgo.id === 'sensible' || esp.sensible === true);
    if (esp.id === 'droide') { s.dotes.fuerza = 0; s.stats.fuerza = 0; }
    if (s.sensible) s.stats.fuerza = 4;

    if (esp.id === 'clon') SW.prepararClon(s, rng);

    clampStats(s);
    return s;
  }

  function clampStats(s) {
    for (let i = 0; i < STATS_0_100.length; i++) {
      const k = STATS_0_100[i];
      s.stats[k] = U.clamp(Math.round(s.stats[k]), 0, 100);
    }
    s.stats.salud = Math.min(s.stats.salud, saludMax(s));
    s.stats.alineamiento = U.clamp(Math.round(s.stats.alineamiento), -100, 100);
    s.stats.creditos = Math.round(U.clamp(s.stats.creditos, -200000, 1e12));
  }

  /** techo de salud según las heridas abiertas */
  function saludMax(s) {
    let pen = 0;
    for (let i = 0; i < s.heridas.length; i++) pen += s.heridas[i].sev;
    return U.clamp(100 - pen, 8, 100);
  }

  /* ---------------- Juego ---------------- */
  function Game(cfg) {
    this.rng = new SW.RNG(cfg.semilla);
    this.s = nuevoEstado(cfg, this.rng);
    this.cola = [];
    this.logAño = [];
    this.actividadUsada = false;
    this.fase = 'año';
    this.escena = null;
    const m = SW.mundo(this.s.mundo);
    this.log('Nace ' + this.s.nombre + ' en ' + this.s.mundo + ' (' + m.r + '). Era: ' + this.s.eraN + '.', 'nac');
    this.hito('Nacimiento en ' + this.s.mundo);
    if (this.s.especie === 'clon') this.log('Designación ' + this.s.nombre + '. Lote de Kamino. Crecerás al doble de velocidad.', 'res');
  }

  /** Cola de vitrinas: la interfaz las muestra una a una */
  Game.prototype.popup = function (datos) {
    this.popups = this.popups || [];
    this.popups.push(datos);
  };

  Game.prototype.log = function (txt, tipo) {
    // las contracciones se arreglan aquí para todo lo que se escribe,
    // venga de una plantilla o de una concatenación a mano
    const t = SW.contraer ? SW.contraer(txt) : txt;
    this.s.historia.push({ edad: this.s.edad, txt: t, tipo: tipo || 'ev' });
    this.logAño.push({ txt: t, tipo: tipo || 'ev' });
  };
  Game.prototype.hito = function (txt) {
    this.s.hitos.push({ edad: this.s.edad, txt: txt });
    this.s.ultimoHito = this.s.edad;
  };

  /* ---------------- Slots ---------------- */
  Game.prototype.rellenarSlots = function (ev) {
    const rng = this.rng;
    const slots = {};
    const def = ev.slots || {};
    for (const k in def) {
      switch (def[k]) {
        case 'mundo': slots[k] = rng.pick(SW.MUNDO_NOMBRES); break;
        case 'mundoCerca': slots[k] = this.mundoCercano(); break;
        case 'mundoAqui': slots[k] = this.s.mundo; break;
        case 'mundoNatal': slots[k] = this.s.mundoNatal; break;
        // un sarlacc en un mundo de lagos no pega: la fauna es la de aquí
        case 'criatura': { const d = this.dosier(); slots[k] = d.criCorto && d.criCorto.length ? rng.pick(d.criCorto) : rng.pick(SW.CRIATURAS); break; }
        case 'criaturaGalaxia': slots[k] = rng.pick(SW.CRIATURAS); break;
        case 'lugar': slots[k] = rng.pick(SW.lugaresDe ? SW.lugaresDe(this.s.mundo) : SW.LUGARES); break;
        case 'lugarLejos': { const m = rng.pick(SW.MUNDO_NOMBRES); slots[k] = rng.pick(SW.lugaresDe(m)) + ' de ' + m; break; }
        case 'oficio': slots[k] = rng.pick(SW.oficiosDe ? SW.oficiosDe(this.s.mundo) : ['mecánico']); break;
        case 'objeto': slots[k] = rng.pick(SW.OBJETOS).n; break;
        /* gente que YA conoces: sin esto, cada evento inventaba a alguien
           nuevo y tu hermano no volvía a aparecer en toda la partida */
        /* Con el nombre a secas no te acordabas de quién era. Ahora
           se dice quién es y cómo os lleváis. */
        case 'conocido': { const r = this.relacionCualquiera(); slots[k] = this.etiquetaRel(r, 'alguien que conociste'); if (r) slots['_rel'] = r.nombre; break; }
        case 'hermano': { const r = this.relacionDe(['hermano', 'hermana', 'hermano de lote']); slots[k] = this.etiquetaRel(r, 'tu hermano'); if (r) slots['_rel'] = r.nombre; break; }
        case 'amigo': { const r = this.relacionDe(['amigo', 'contacto', 'socio']); slots[k] = this.etiquetaRel(r, 'alguien de confianza'); if (r) slots['_rel'] = r.nombre; break; }
        case 'pareja': { const r = this.relacionDe(['pareja', 'cónyuge']); slots[k] = this.etiquetaRel(r, 'la persona con la que vives'); if (r) slots['_rel'] = r.nombre; break; }
        case 'rivalN': { const r = this.relacionDe(['rival']); slots[k] = this.etiquetaRel(r, 'alguien que te tiene ganas'); if (r) slots['_rel'] = r.nombre; break; }
        case 'nombre': slots[k] = SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'rodiano', 'duros']), rng.chance(0.5) ? 'm' : 'f'); break;
        case 'faccion': { const f = rng.pick(SW.faccionesDeEra(this.s.era)); slots[k] = f.n; slots['_faccion'] = f.id; break; }
        case 'rumor': slots[k] = rng.pick(SW.RUMORES); break;
        case 'nave': slots[k] = rng.pick(SW.NAVES).n; break;
        /* ---- dosier del mundo en el que estás ahora mismo ---- */
        case 'bicho': slots[k] = rng.pick(this.dosier().cri); break;
        case 'peligro': slots[k] = rng.pick(this.dosier().pel); break;
        case 'banda': slots[k] = rng.pick(this.dosier().fac); break;
        case 'hito': slots[k] = rng.pick(this.dosier().hit); break;
        case 'mercancia': slots[k] = rng.pick(this.dosier().bie); break;
        case 'mandamas': slots[k] = this.dosier().aut; break;
        case 'tiempo': slots[k] = rng.pick(this.dosier().cli); break;
        case 'comida': slots[k] = rng.pick(this.dosier().com); break;
        case 'paisanos': slots[k] = rng.pick(this.dosier().gen); break;
        default: slots[k] = def[k];
      }
    }
    return slots;
  };

  /** «Kira Vos (tu hermana, os lleváis bien)» en vez de un nombre suelto */
  Game.prototype.etiquetaRel = function (r, sino) {
    if (!r) return sino;
    const t = r.tipo || 'conocido';
    let como;
    if (r.afecto >= 60) como = 'te fías de ' + (r.gen === 'f' ? 'ella' : 'él');
    else if (r.afecto >= 20) como = 'os lleváis bien';
    else if (r.afecto > -20) como = 'ni fu ni fa';
    else if (r.afecto > -60) como = 'hay mal rollo';
    else como = 'no os habláis';
    const suyo = r.quien ? ', ' + r.quien : '';
    return '<b>' + r.nombre + '</b> <i class="quien">(' + t + suyo + ' · ' + como + ')</i>';
  };

  /** una relación de los tipos pedidos, la de más peso */
  Game.prototype.relacionDe = function (tipos) {
    const rs = this.s.relaciones.filter(function (r) { return tipos.indexOf(r.tipo) >= 0; });
    if (!rs.length) return null;
    return rs.sort(function (a, b) { return Math.abs(b.afecto) - Math.abs(a.afecto); })[0];
  };
  /** cualquiera de tu vida, con preferencia por los que te importan */
  Game.prototype.relacionCualquiera = function () {
    const rs = this.s.relaciones;
    if (!rs.length) return null;
    return this.rng.weighted(rs, function (r) { return 1 + Math.abs(r.afecto) / 20; });
  };
  /** mueve el afecto de UNA persona concreta y lo deja escrito */
  Game.prototype.afectoCon = function (nombre, delta, nota) {
    const r = this.s.relaciones.filter(function (x) { return x.nombre === nombre; })[0];
    if (!r) return;
    r.afecto = U.clamp(r.afecto + delta, -100, 100);
    r.historia = r.historia || [];
    if (nota) r.historia.push({ edad: this.s.edad, txt: nota });
    this.log((delta >= 0 ? 'Te acercas a ' : 'Se enfría lo tuyo con ') + '<b>' + r.nombre + '</b>' +
             (nota ? ': ' + nota : '') + '.', delta >= 0 ? 'rel' : 'mal');
  };

  /** el dosier del mundo donde estás, cacheado mientras no te muevas */
  Game.prototype.dosier = function () {
    if (!this._dos || this._dosMundo !== this.s.mundo) {
      this._dosMundo = this.s.mundo;
      this._dos = SW.dosierDe ? SW.dosierDe(this.s.mundo) : { cri: ['un animal'], pel: ['un peligro'], fac: ['una banda'], hit: ['un sitio'], bie: ['mercancía'], aut: 'quien mande', cli: ['mal tiempo'], com: ['comida'], gen: ['gente'] };
    }
    return this._dos;
  };

  /** un mundo de la misma región: los viajes cortos tienen sentido */
  Game.prototype.mundoCercano = function () {
    const s = this.s, rng = this.rng;
    const reg = SW.mundo(s.mundo).r;
    const cerca = SW.MUNDOS.filter(function (m) { return m.r === reg && m.n !== s.mundo; });
    return (cerca.length ? rng.pick(cerca) : rng.pick(SW.MUNDOS)).n;
  };

  /* ---------------- Selección de eventos ---------------- */
  Game.prototype.eventosPosibles = function (pool, permitirVistos) {
    const s = this.s;
    const out = [];
    for (let i = 0; i < pool.length; i++) {
      const e = pool[i];
      // ya lo viviste: no vuelve hasta que se agote todo lo demás.
      // Salvo los marcados `repetible`: el tablón del Gremio o la mesa
      // de juego tienen que poder salir más de una vez en una vida.
      if (!permitirVistos && s.vistos[e.id] && !e.repetible) continue;
      if (e.min != null && s.edadBio < e.min) continue;
      if (e.max != null && s.edadBio > e.max) continue;
      if (e.era && e.era.indexOf(s.era) < 0) continue;
      if (e.eraNo && e.eraNo.indexOf(s.era) >= 0) continue;
      // lo que ya no encaja con tu situación no se ofrece
      if (SW.eventoCoherente && !SW.eventoCoherente(s, e)) continue;
      if (e.mundo && e.mundo.indexOf(s.mundo) < 0) continue;
      if (e.mundoNo && e.mundoNo.indexOf(s.mundo) >= 0) continue;
      if (e.esp && e.esp.indexOf(s.especie) < 0) continue;
      if (e.espNo && e.espNo.indexOf(s.especie) >= 0) continue;
      if (e.unaVez && s.vistos[e.id]) continue;
      if (s.recientes.indexOf(e.id) >= 0) continue;
      if (e.req) { try { if (!e.req(s)) continue; } catch (err) { continue; } }
      out.push(e);
    }
    return out;
  };

  /** peso efectivo: lo ya visto pesa mucho menos */
  /* Cuánto pesa una escena en el sorteo. Lo que está pasando en tu vida
     ahora mismo tiene que asomar más que el catálogo general: en plena
     guerra salían tres eventos bélicos por vida porque competían de tú
     a tú con seiscientos eventos de tiempos de paz. */
  Game.prototype.peso = function (ev) {
    let base = ev.w == null ? 1 : ev.w;
    const s = this.s;
    if (ev.mundo) base *= 2.2;              // lo de aquí pasa más que lo genérico
    if (/^gv_/.test(ev.id) && SW.guerraActiva && SW.guerraActiva(s)) base *= 9;
    if (ev.era && ev.era.length <= 2) base *= 2.2;   // lo propio de la época
    if (ev.esp) base *= 2.6;                          // lo propio de tu especie
    if (ev.repetible) return base;
    const visto = s.vistos[ev.id] || 0;
    return base / (1 + visto * visto * 3);
  };

  Game.prototype.elegirEvento = function (posibles) {
    const self = this;
    return this.rng.weighted(posibles, function (e) { return self.peso(e); });
  };

  Game.prototype.marcarVisto = function (id) {
    const s = this.s;
    s.vistos[id] = (s.vistos[id] || 0) + 1;
    s.recientes.push(id);
    if (s.recientes.length > 26) s.recientes.shift();
  };

  /** Aviso automático: que no te maten sin haberte avisado. */
  function avisoOpcion(o) {
    const c = o.combate || (o.r && o.r.length && (o.r.find ? (o.r.find(function (x) { return x.combate; }) || {}).combate : null));
    if (!c) return null;
    const partes = [];
    if (c.aMuerte) partes.push('a muerte');
    if (c.canon) partes.push('contra una leyenda');
    else if (c.dif >= 80) partes.push('rival muy por encima de ti');
    else if (c.dif >= 65) partes.push('rival duro');
    if (c.duelo && !c.aMuerte) partes.push('duelo');
    return partes.length ? '⚔ ' + partes.join(' · ') : null;
  }

  Game.prototype.prepararEvento = function (ev, noMarcar) {
    const slots = ev.gen ? {} : this.rellenarSlots(ev);
    const inst = { ref: ev, id: ev.id, slots: slots, texto: U.fill(ev.t, slots), opciones: [] };
    const s = this.s;
    for (let i = 0; i < ev.c.length; i++) {
      const o = ev.c[i];
      if (o.req) { try { if (!o.req(s)) continue; } catch (e) { continue; } }
      const av = avisoOpcion(o);
      inst.opciones.push({
        idx: i,
        txt: U.fill(o.t, slots),
        sub: o.sub ? U.fill(o.sub, slots) + (av ? ' · ' + av : '') : av,
        def: o
      });
    }
    if (!inst.opciones.length) return null;
    // al ofrecer varias situaciones a la vez sólo se marca la elegida:
    // si no, las descartadas se darían por vistas sin haberse jugado
    if (!noMarcar) this.marcarVisto(ev.id);
    return inst;
  };

  /** suerte real: la de la ficha más lo que arrastra la racha */
  Game.prototype.suerte = function () {
    return U.clamp(this.s.stats.suerte + (SW.efectoRacha ? SW.efectoRacha(this.s) : 0), 0, 100);
  };

  /* ---------------- Ciclo anual ---------------- */
  Game.prototype.avanzarAño = function () {
    const s = this.s;
    if (s.muerto) return;
    this.logAño = [];
    s.edad++;
    s.edadBio += s.ritmo;
    s.contadores.años++;
    s.accionesMax = s.edadBio < 6 ? 1 : (s.edadBio < 12 ? 2 : 3);
    s.acciones = s.accionesMax;
    this.actividadUsada = false;

    if (s.carcelAños > 0) {
      s.carcelAños--;
      this.madurar();
      this.curarse();
      this.aplicarFx({ cordura: -6, destreza: 3, fisico: 2 }, {});
      this.log('Año en prisión. Quedan ' + s.carcelAños + '.', 'mal');
      if (s.carcelAños === 0) this.log('Sales en libertad.', 'bien');
      s.acciones = 1;   // dentro se puede hacer poco
      this.fase = 'menu';
      return;
    }

    if (SW.aplicarEstipendio) SW.aplicarEstipendio(this);
    if (s.trabajo) {
      s.añosEnTrabajo++;
      const bruto = Math.round(s.sueldo * (0.85 + s.rendimiento / 200));
      s.stats.creditos += bruto;
      /* Un jedi no cobra sueldo: cobra estipendio, y eso ya lo dice
         otra línea. Decir «Trabajas de Padawan. Ingresas 0 cr.» todos
         los años era ruido y encima contradecía al estipendio. */
      if (bruto > 0) this.log('Trabajas de ' + s.rango + '. Ingresas ' + U.cr(bruto) + '.', 'cr');
      else if (s.añosEnTrabajo === 1) this.log('Sirves como ' + s.rango + '. Aquí no se cobra.', 'res');
      this.chequearAscenso();
    }
    /* Tener mucho cuesta: escoltas, sobornos, casas que mantener y gente
       que vive de ti. Sin esto los millones se apilaban solos y el dinero
       dejaba de ser una decisión. */
    if (s.stats.creditos > 200000) {
      const tren = Math.round((s.stats.creditos - 200000) * 0.06) + 4000;
      s.stats.creditos -= tren;
      if (this.rng.chance(0.3)) this.log('Mantener lo que tienes cuesta ' + U.cr(tren) + ' al año.', 'cr');
    }
    if (!s.trabajo && s.edadBio > 18) {
      const gasto = 900 + s.edadBio * 14;
      s.stats.creditos -= gasto;
      if (s.stats.creditos < -20000) {
        this.log('Vives de prestado. Los cobradores ya saben tu nombre.', 'mal');
        this.aplicarFx({ cordura: -4, notoriedad: 2 }, {});
      }
    }

    this.madurar();
    this.curarse();
    this.envejecer();
    if (s.muerto) return;

    // ¿ha cambiado la época? Va antes que nada: cambia el mundo entero
    if (SW.pasoEra) SW.pasoEra(this);

    // la guerra se cobra antes que nada
    if (SW.añoDeGuerraViva) SW.añoDeGuerraViva(this);
    if (s.muerto) return;
    if (SW.añoDeGuerra) SW.añoDeGuerra(this);
    if (s.muerto) return;
    if (SW.cobrarPeligro) SW.cobrarPeligro(this);
    if (SW.olvidoAtencion) SW.olvidoAtencion(this);
    if (SW.pasoAnual) SW.pasoAnual(this);
    if (SW.pasoTripulacion) SW.pasoTripulacion(this);
    if (SW.pasoNegocios) SW.pasoNegocios(this);
    if (s.muerto) return;
    this.avanzarEstudio();
    if (SW.pasoAprendiz) SW.pasoAprendiz(this);
    if (s.muerto) return;
    if (s.muerto) return;

    // eventos guionizados: los momentos que SÍ o SÍ deben ocurrir
    /* Los guionizados se subastan por prioridad. Antes se cogía sólo el
       primero: si ese no llegaba a producir escena --- los que se
       construyen sobre la marcha pueden quedarse sin material, y
       prepararEvento devuelve null si ninguna opción pasa su `req` ---
       el año se perdía y el resto de candidatos no se probaba nunca. */
    const guion = this.eventosPosibles(SW.GUION || [])
      .sort(function (a, b) { return (b.prio || 0) - (a.prio || 0); });
    for (let gi = 0; gi < guion.length; gi++) {
      const ev = guion[gi];
      let inst = null;
      if (ev.hazlo) { const g = ev.hazlo(this); if (g) { inst = this.prepararGen(g); this.marcarVisto(ev.id); } }
      else inst = this.prepararEvento(ev);
      if (inst) { this.cola.push(inst); break; }
    }

    // cada tantos años eliges en qué te has convertido
    if (SW.tocaTalento && SW.tocaTalento(s) && SW.menuTalento && !this.cola.length) {
      const mt = SW.menuTalento(this);
      if (mt) this.cola.push(this.prepararGen(mt));
    }

    // el mundo sigue girando aunque no te toque
    if (SW.titularDeEra && this.rng.chance(0.22)) {
      const tit = SW.titularDeEra(this.rng, s.era);
      if (tit) this.log('<i class="titular">' + tit + '</i>', 'res');
    }

    // los hilos largos: lo que decidiste hace veinte años vuelve
    if (SW.pasoTramas && !this.cola.length) {
      const tr = SW.pasoTramas(this);
      if (tr) this.cola.push(this.prepararGen(tr));
    }

    // una misión de la Orden sin cerrar te persigue igual que un contrato
    if (s.mision && SW.pasoMision && this.rng.chance(0.7)) {
      const p = SW.pasoMision(this);
      if (p) this.cola.push(this.prepararGen(p));
    }

    // una caza de la Inquisición no espera a que te apetezca
    if (s.caza && SW.pasoCazaJedi && this.rng.chance(0.75)) {
      const pc = SW.pasoCazaJedi(this);
      if (pc) this.cola.push(this.prepararGen(pc));
    }

    // un contrato en marcha manda sobre lo demás: es lo que estás haciendo
    if (s.contrato && SW.pasoCaza) {
      const paso = SW.pasoCaza(this);
      if (paso) this.cola.push(this.prepararGen(paso));
    }

    /* Si vives del Gremio, el Gremio te busca. Antes los contratos solo
       aparecían si el sorteo general escupía la escena del tablón, que
       compite con otras mil: se podía llegar a Leyenda del Gremio sin
       que te ofrecieran uno. Ahora, si eres del oficio y estás libre,
       el trabajo viene a ti. */
    if (!s.contrato && !s.muerto && SW.GEN.contratoCaza && s.edadBio >= 16 &&
        (s.flags.en_el_gremio || s.trabajo === 'cazarrecompensas') && !s.flags.gremio_desconfia) {
      const suyo = s.trabajo === 'cazarrecompensas';
      if (this.rng.chance(suyo ? 0.78 : 0.35)) {
        this.cola.push(this.prepararGen(SW.GEN.contratoCaza(this.rng, s)));
      }
    }

    // encuentro con alguien conocido: muy raro, y más si eres un don nadie
    if (s.edadBio > 12 && SW.GEN.canon) {
      const fama = (s.stats.reputacion + s.stats.notoriedad) / 200;
      if (this.rng.chance(0.014 + fama * 0.045)) {
        const ev = SW.GEN.canon(this.rng, s);
        if (ev && s.conocidos.indexOf(ev.canon.n) < 0) this.cola.push(this.prepararGen(ev));
      }
    }

    const n = s.edadBio < 6 ? 1 : this.rng.int(1, 2);
    let posibles = this.eventosPosibles(SW.EVENTOS);
    if (!posibles.length && s.edadBio >= 14 && SW.GEN.dilema && this.rng.chance(0.6)) {
      this.cola.push(this.prepararGen(SW.GEN.dilema(this.rng, s)));
    }
    if (!posibles.length) posibles = this.eventosPosibles(SW.EVENTOS, true);
    const usados = [];
    for (let i = 0; i < n && posibles.length; i++) {
      const restantes = posibles.filter(function (e) { return usados.indexOf(e.id) < 0; });
      if (!restantes.length) break;
      const ev = this.elegirEvento(restantes);
      usados.push(ev.id);
      const inst = this.prepararEvento(ev);
      if (inst) this.cola.push(inst);
    }
    this.fase = this.cola.length ? 'evento' : 'menu';
  };

  /* ---------------- Maduración ---------------- */
  Game.prototype.madurar = function () {
    const s = this.s;
    const bio = s.edadBio;

    // 1) el potencial innato se va expresando durante el crecimiento
    const finCrecimiento = 18;
    if (bio <= finCrecimiento + s.ritmo) {
      for (const k in s.dotes) {
        const total = s.dotes[k];
        const dado = s.dotesDadas[k] || 0;
        if (Math.abs(dado) >= Math.abs(total)) continue;
        let paso = (total / finCrecimiento) * s.ritmo;
        if (Math.abs(dado + paso) > Math.abs(total)) paso = total - dado;
        s.stats[k] += paso;
        s.dotesDadas[k] = dado + paso;
      }
    }

    // 2) crecimiento natural por edad, con techo que también madura:
    //    un crío de 10 años no puede tener 55 de intelecto solo por existir
    const g = crecimientoPorEdad(bio);
    for (const k in g) {
      const propio = (s.techos && s.techos[k]) || TECHO_NATURAL;
      const techo = U.clamp(16 + bio * 1.9, 16, propio);
      let v = g[k] * s.ritmo;
      if (v > 0 && s.stats[k] >= techo) continue;              // arriba solo se llega decidiendo
      if (v > 0 && s.stats[k] + v > techo) v = techo - s.stats[k];
      if (v < 0 && s.cibernetica.length) v *= 0.5;             // las prótesis frenan el declive
      s.stats[k] += v;
    }

    // 3) la Fuerza solo crece sola en quien es sensible, y despacio
    if (s.sensible && s.stats.fuerza < 42 && bio > 3) s.stats.fuerza += 0.9 * s.ritmo;

    clampStats(s);
  };

  /* ---------------- Heridas y curación ---------------- */
  Game.prototype.herir = function (nombre, sev, cronica) {
    const s = this.s;
    s.heridas.push({ n: nombre, sev: Math.round(sev), cronica: !!cronica });
    this.log('⚕ ' + nombre + ' (−' + Math.round(sev) + ' de salud máxima mientras no cure)', 'mal');
    clampStats(s);
  };

  Game.prototype.curarse = function () {
    const s = this.s, rng = this.rng;
    const ratio = s.edadBio / s.vidaMax;

    // las heridas cierran despacio; el cuerpo joven ayuda
    let ritmoCura = 1 + Math.round(s.stats.fisico / 40);
    if (s.habilidades.indexOf('medico') >= 0) ritmoCura += 1;
    if (s.flags.adicto) ritmoCura -= 1;
    if (ratio > 0.7) ritmoCura -= 1;
    ritmoCura = Math.max(0, ritmoCura);

    const quedan = [];
    for (let i = 0; i < s.heridas.length; i++) {
      const h = s.heridas[i];
      if (h.cronica) { quedan.push(h); continue; }
      h.sev -= ritmoCura;
      if (h.sev > 0) quedan.push(h);
      else this.log('Cura del todo: ' + h.n + '.', 'bien');
    }
    s.heridas = quedan;

    // la salud se regenera sola, lentamente, hacia el techo que dejen las heridas
    const max = saludMax(s);
    if (s.stats.salud < max) {
      let reg = 2 + s.stats.fisico / 30;
      if (s.stats.cordura > 60) reg += 1;
      if (ratio > 0.7) reg *= 0.5;
      if (s.heridas.some(function (h) { return h.sev > 15; })) reg *= 0.4;
      if (s.flags.adicto) reg -= 2;
      s.stats.salud = Math.min(max, s.stats.salud + Math.max(0, reg));
    }
    clampStats(s);
  };

  Game.prototype.envejecer = function () {
    const s = this.s, rng = this.rng;
    const ratio = s.edadBio / s.vidaMax;
    if (ratio > 0.66) {
      s.stats.salud -= Math.round((ratio - 0.66) * 26 * s.ritmo + rng.int(0, 2));
    }
    if (s.stats.cordura < 18) s.stats.salud -= 2;

    /* El cuerpo y la cabeza también envejecen, no sólo la salud. Antes
       nada bajaba nunca y el carisma acababa clavado en 100 en siete de
       cada diez vidas: las tiradas sociales dejaban de tener tensión. */
    const baja = function (k, desde, fuerza) {
      if (ratio <= desde) return;
      const t = (ratio - desde) / (1 - desde);
      const d = t * fuerza * s.ritmo;
      // se pierde antes lo que tienes muy alto y sin usar
      if (rng.chance(Math.min(0.95, d))) s.stats[k] -= 1 + (rng.chance(d / 2) ? 1 : 0);
    };
    baja('fisico', 0.48, 1.5);
    baja('destreza', 0.55, 1.3);
    baja('salud', 0.60, 0.5);
    baja('carisma', 0.78, 0.9);
    baja('intelecto', 0.86, 0.7);
    if (!s.relaciones.length && ratio > 0.5 && rng.chance(0.35)) s.stats.cordura -= 1;

    /* Y la fama se apaga sola si no la alimentas: a los cinco años de
       no hacer nada sonado, la gente ya no se acuerda de ti. */
    const quieto = s.edad - (s.ultimoHito || 0);
    if (quieto > 4) {
      if (rng.chance(0.5)) s.stats.reputacion -= 1;
      if (rng.chance(0.6)) s.stats.notoriedad -= 1;
    }
    clampStats(s);

    if (s.stats.salud <= 0) { this.morir('El cuerpo dijo basta.'); return; }
    if (ratio > 0.92 && rng.chance((ratio - 0.92) * 2.6)) {
      this.morir(s.ritmo > 1
        ? 'Envejecimiento acelerado. Tenías ' + s.edad + ' años y el cuerpo de ' + s.edadBio + '.'
        : 'Vejez. Sin dramatismo.');
    }
  };

  Game.prototype.morir = function (causa) {
    const s = this.s;
    if (s.muerto) return;
    s.muerto = true;
    s.causaMuerte = causa;
    this.log('☠ ' + causa, 'muerte');
    this.hito('Muere a los ' + s.edad + ': ' + causa);
    for (let i = 0; i < SW.TITULOS.length; i++) {
      const t = SW.TITULOS[i];
      try { if (t.req(s) && s.titulos.indexOf(t.n) < 0) s.titulos.push(t.n); } catch (e) {}
    }
    this.escena = null;
    this.cola = [];
    this.fase = 'fin';
  };

  /* ---------------- Ascensos ---------------- */
  Game.prototype.chequearAscenso = function () {
    const s = this.s;
    const c = SW.carrera(s.trabajo);
    if (!c) return;
    const idx = c.rangos.indexOf(s.rango);
    if (idx < 0 || idx >= c.rangos.length - 1) return;
    const stat = s.stats[c.stat] || 0;
    const p = U.clamp((stat / 190) + (s.rendimiento - 50) / 300 + s.añosEnTrabajo / 45, 0.02, 0.5);
    if (this.rng.chance(p)) {
      s.rango = c.rangos[idx + 1];
      s.sueldo = Math.round(s.sueldo * (1.45 + this.rng.next() * 0.35));
      s.stats.reputacion += 4;
      this.log('¡Ascenso! Ahora eres ' + s.rango + '. Nuevo sueldo: ' + U.cr(s.sueldo) + '.', 'bien');
      this.hito('Asciende a ' + s.rango);
      clampStats(s);
    }
  };

  /* ---------------- Efectos ---------------- */
  Game.prototype.aplicarFx = function (fx, slots) {
    if (!fx) return;
    const s = this.s;
    // foto de antes: así se puede enseñar el cambio REAL, no el nominal
    const antes = {};
    for (const kk in fx) if (s.stats[kk] != null) antes[kk] = s.stats[kk];
    for (const k in fx) {
      let v = fx[k];
      if (s.stats[k] == null) continue;
      if (typeof v === 'string') {
        if (v.indexOf('sueldo*') === 0) v = Math.round(s.sueldo * parseFloat(v.split('*')[1]));
        else v = parseFloat(v) || 0;
      }
      if (k === 'creditos' && v === -999999) v = -Math.max(0, s.stats.creditos);
      // lo que llevas encima puede cambiar lo que vale cada cosa
      if (SW.fxMod) v = SW.fxMod(s, k, v);
      // cuanto más alto está algo, menos aporta cada acierto
      if (v > 0 && s.stats[k] != null && k !== 'creditos' && k !== 'alineamiento') {
        // curva, no recta: de 0 a 70 cuesta poco, de 85 a 100 cuesta mucho
        const f = Math.max(0, 1 - s.stats[k] / 100);
        v = v * Math.max(0.04, f * f * 1.25);
      }
      if (k === 'fuerza' && v > 0 && !s.sensible) {
        v = v * 0.15;
        if (s.stats.fuerza + v > 15) v = Math.max(0, 15 - s.stats.fuerza);
      }
      if (k === 'salud' && v < 0) {
        const eq = SW.bonosEquipo ? SW.bonosEquipo(s) : { def: 0 };
        const mitig = 1 - Math.min(0.55, (s.stats.fisico / 320) + (s.stats.destreza / 500) +
          s.cibernetica.length * 0.05 + (eq.def || 0) / 90);
        v = v * mitig;
        // los golpes fuertes dejan herida, y las heridas tardan años
        if (v <= -14) this.herir(this.rng.pick(SW.HERIDAS), Math.min(26, Math.abs(v) * 0.55));
      }
      s.stats[k] += v;
    }
    clampStats(s);
    // lo que ha cambiado se acumula para enseñarlo junto tras la elección
    if (this.cambios) {
      for (const k in antes) {
        const d = Math.round(s.stats[k] - antes[k]);
        if (d) this.cambios[k] = (this.cambios[k] || 0) + d;
      }
    }
  };

  /** nombres legibles de cada estadística, para el resumen de efectos */
  const ETIQ = {
    salud: 'salud', fisico: 'físico', destreza: 'destreza', intelecto: 'intelecto',
    carisma: 'carisma', cordura: 'cordura', suerte: 'suerte', fuerza: 'la Fuerza',
    reputacion: 'reputación', notoriedad: 'notoriedad', alineamiento: 'alineamiento',
    creditos: 'créditos'
  };

  /** convierte lo acumulado en una línea legible bajo el resultado */
  Game.prototype.volcarCambios = function () {
    const c = this.cambios;
    this.cambios = null;
    if (!c) return;
    const partes = [];
    Object.keys(c).forEach(function (k) {
      const v = c[k];
      if (!v) return;
      const txt = k === 'creditos'
        ? (v > 0 ? '+' : '−') + U.cr(Math.abs(v)).replace(' cr', '') + ' cr'
        : (v > 0 ? '+' : '−') + Math.abs(v) + ' ' + (ETIQ[k] || k);
      partes.push('<i class="fx ' + (v > 0 ? 'fx-mas' : 'fx-menos') + '">' + txt + '</i>');
    });
    if (partes.length) this.log(partes.join(' '), 'efectos');

    // rachas: el balance de lo que acaba de pasar
    if (SW.marcarRacha) {
      let bal = 0;
      Object.keys(c).forEach(function (k) {
        if (k === 'creditos') { bal += c[k] > 0 ? 1 : c[k] < 0 ? -1 : 0; return; }
        if (k === 'notoriedad') return;
        bal += c[k] > 0 ? 1 : c[k] < 0 ? -1 : 0;
      });
      if (bal !== 0) SW.marcarRacha(this, bal > 0);
    }
  };

  Game.prototype.despertar = function () {
    const s = this.s;
    if (s.sensible || s.especie === 'droide') return;
    s.sensible = true;
    s.stats.fuerza = Math.max(s.stats.fuerza, 24);
    this.log('Algo se abre dentro de ti. Nunca habías sentido esto.', 'bien');
    this.hito('Despierta a la Fuerza');
    clampStats(s);
  };

  /* ---------------- Resolver elección ---------------- */
  Game.prototype.elegir = function (inst, opcionIdx) {
    const s = this.s, rng = this.rng;
    const op = inst.opciones[opcionIdx];
    if (!op) return;
    const d = op.def;
    const slots = inst.slots || {};
    this.log('› ' + op.txt, 'eleccion');

    if (d.coste) {
      let c = d.coste;
      if (typeof c === 'string') c = 2000;
      /* Antes se restaba y punto: podías comprar una nave de 500.000
         con cero en la cuenta y quedarte a -500.000 sin que pasara
         nada. Ahora, si no llegas, o lo fías (y eso te busca un
         prestamista) o no hay trato. */
      if (c > 0 && s.stats.creditos < c) {
        const falta = c - Math.max(0, s.stats.creditos);
        if (falta > 40000 || s.stats.creditos < -30000) {
          this.log('No te llega, y nadie te va a fiar tanto. Se queda en nada.', 'mal');
          return;
        }
        s.stats.creditos -= c;
        s.flags.debe_a_usureros = true;
        s.contadores.deuda = (s.contadores.deuda || 0) + Math.round(falta * 1.4);
        this.log('No te llega: lo pones a deber. Alguien se apunta ' + U.cr(Math.round(falta * 1.4)) + '.', 'mal');
      } else {
        s.stats.creditos -= c;
      }
    }

    let res = d;
    if (d.r && d.r.length) {
      res = rng.weighted(d.r, function (o) { return o.p == null ? 1 : o.p; });
      this.aplicarNodo(d, slots, inst, true);
    }
    /* Qué rama ha salido: la cadena de escenas suele vivir dentro del
       resultado sorteado («si sales vivo, sigue por aquí»), no en la
       opción. Sin esto, media Purga se cortaba a la primera tirada. */
    this._nodoElegido = res;
    this.aplicarNodo(res, slots, inst, false);
  };

  /** resuelve una elección venga de donde venga: la interfaz y las
      pruebas headless pasan las dos por aquí, así que lo que se mide
      es exactamente lo que se juega. */
  Game.prototype.resolverEleccion = function (inst, i) {
    const op = inst && inst.opciones && inst.opciones[i];
    if (!op) return;
    const d = op.def;
    if (d.situacion != null) {
      const lista = this._situaciones || [];
      const el = lista[d.situacion];
      this._situaciones = null;
      if (el) { this.marcarVisto(el.id); this.cola.unshift(el); this.fase = 'evento'; }
      return;
    }
    if (d.devuelveAccion) {
      // no gastas el año por asomarte y no ver nada que te apetezca,
      // pero sólo una vez al año: si no, se puede mirar en bucle
      this._situaciones = null;
      if (this.s.devueltaEsteAño !== this.s.edad) {
        this.s.devueltaEsteAño = this.s.edad;
        this.s.acciones = Math.min(this.s.accionesMax, this.s.acciones + 1);
        this.log('Te lo piensas mejor y guardas el rato para otra cosa.', 'res');
      } else {
        this.log('Vuelves a asomarte y vuelves a dejarlo. Se te ha ido la tarde.', 'res');
      }
      if (!this.cola.length && !this.s.muerto) this.fase = 'menu';
      return;
    }
    if (d.retoSalta) {
      // renunciar al reto: sale regular, pero sale
      this.log('› ' + op.txt, 'eleccion');
      const r = this.reto; this.reto = null;
      if (r) { this.cambios = {}; this.aplicarNodo(r.medio || r.mal, {}, null, false); this.volcarCambios(); }
      if (!this.cola.length && !this.s.muerto) this.fase = 'menu';
      return;
    }
    if (d.tactica === 'cancelar') { this.cola.unshift(this.escenaCombateEvento()); return; }
    if (d.tactica) { this.log('› ' + op.txt, 'eleccion'); this.resolverTactica(d.tactica); return; }
    if (d.tacticaN) { this.log('› ' + op.txt, 'eleccion'); this.resolverTacticaNave(d.tacticaN); return; }
    if (d.carreraLinea) { this.log('› ' + op.txt, 'eleccion'); SW.resolverCarrera(this, d.carreraLinea); return; }
    this.cambios = {};
    this._nodoElegido = null;
    this.elegir(inst, i);
    if (this.aplicarExtra) this.aplicarExtra(d);
    this.volcarCambios();
    const nodo = this._nodoElegido;
    this._nodoElegido = null;
    this.encadenar(nodo && nodo.cadena ? nodo : d);
  };

  /* Cadena: una escena empuja la siguiente en el MISMO año. Es lo que
     convierte la Orden 66 en una noche seguida y no en cuatro sucesos
     sueltos repartidos por la década. Va DESPUÉS de aplicar los
     efectos: si la elección te ha matado, no hay siguiente escena. */
  Game.prototype.encadenar = function (d) {
    if (!d || !d.cadena || this.s.muerto) return;
    const id = typeof d.cadena === 'function' ? d.cadena(this) : d.cadena;
    if (!id || !SW.ESCENAS || !SW.ESCENAS[id]) return;
    /* si la elección ha abierto un combate, la escena siguiente no se
       construye ahora: se guarda el nombre y se monta cuando la pelea
       termine, con el estado ya actualizado */
    if (this.escena) { this.colaTrasCombate = id; return; }
    const sig = SW.ESCENAS[id](this);
    if (!sig) { this.fase = this.cola.length ? 'evento' : this.fase; return; }
    this.cola.unshift(this.prepararGen(sig));
    this.fase = 'evento';
  };

  /** la escena que estaba esperando a que acabase la pelea */
  Game.prototype.reanudarCadena = function () {
    const id = this.colaTrasCombate;
    this.colaTrasCombate = null;
    if (!id || this.s.muerto || !SW.ESCENAS || !SW.ESCENAS[id]) return;
    const sig = SW.ESCENAS[id](this);
    if (!sig) { if (this.cola.length) this.fase = 'evento'; return; }
    this.cola.push(this.prepararGen(sig));
    this.fase = 'evento';
  };

  Game.prototype.aplicarNodo = function (d, slots, inst, soloBase) {
    const s = this.s, rng = this.rng;
    // lo temerario se anota: se cobra a final de año
    if (!soloBase && SW.peligroDe) s.peligro = Math.min(SW.PELIGRO_MAX, (s.peligro || 0) + SW.peligroDe(d));

    if (d.fx) {
      this.aplicarFx(d.fx, slots);
      // cada entrenamiento cuenta para el virtuosismo: no basta el nivel
      if (!soloBase && d.fx.fuerza && d.fx.fuerza > 0 && s.sensible) {
        s.contadores.entrenosFuerza = (s.contadores.entrenosFuerza || 0) + 1;
      }
    }

    const texto = soloBase ? null : (d.out || (d.p != null && d.t ? d.t : null));
    if (texto) this.log(U.fill(texto, slots), d.tono || 'res');

    if (d.volver) { this.devolverAccion(); return; }
    if (d.pendiente) this.añadirPendiente(U.fill(d.pendiente, slots));
    if (d.buscado) { s.buscado = Math.min(100, s.buscado + d.buscado); this.log('Hay gente buscándote en ' + s.mundo + '.', 'mal'); }
    if (d.darItem) this.darObjeto(d.darItem);
    // lo que te vas haciendo
    if (d.talento && SW.darTalento) SW.darTalento(this, d.talento);
    if (d.hab && s.habilidades.indexOf(d.hab) < 0) s.habilidades.push(d.hab);

    // hilos largos
    if (d.abreTrama && SW.abrirTrama) SW.abrirTrama(this, d.abreTrama);
    if (d.tramaAvanza && SW.avanzarTrama) SW.avanzarTrama(this, d.tramaAvanza.id, d.tramaAvanza.a, d.tramaAvanza.datos);
    if (d.tramaCierra && SW.cerrarTrama) SW.cerrarTrama(this, d.tramaCierra.id, d.tramaCierra.final);

    // misiones de la Orden
    if (d.aceptaMision && SW.aceptarMision) SW.aceptarMision(this, d.aceptaMision);
    if (d.pista && s.mision) s.mision.pistas = (s.mision.pistas || 0) + d.pista;
    if (d.abandonaMision && SW.abandonarMision) SW.abandonarMision(this, d.abandonaMision);
    if (d.retoMision && SW.retoMision) SW.retoMision(this, d.retoMision);
    if (d.cierraMision && SW.cerrarMision) SW.cerrarMision(this, d.cierraMision);
    if (d.cierraMisionGrado != null && SW.cerrarMision) SW.cerrarMision(this, 'fuerza', d.cierraMisionGrado);
    /* Cruzarte con una leyenda deja cuenta abierta: cómo acabó se
       anota aquí y vuelve años después en otra escena. Antes el
       encuentro se resolvía con un log y ahí moría. */
    if (d.conocer) { this.conocerCanon(d.conocer); if (SW.anotarEncuentro) SW.anotarEncuentro(this, d.conocer, d); }
    if (d.conocerN) this.conocerCanon({ n: d.conocerN });
    // marcar cómo acabó una leyenda: eso vuelve más tarde
    if (d.canonMarca && SW.marcarCanon) SW.marcarCanon(this, d.canonMarca[0], d.canonMarca[1]);
    if (d.afectoNombre) this.afectoCon(d.afectoNombre.nombre, d.afectoNombre.delta, d.afectoNombre.nota);
    if (d.flag) s.flags[U.fill(d.flag, slots)] = true;
    if (d.quitarFlag) delete s.flags[d.quitarFlag];
    if (d.contador) for (const k in d.contador) s.contadores[k] = (s.contadores[k] || 0) + d.contador[k];

    if (d.herida) this.herir(d.herida.n || 'herida', d.herida.sev || 12, d.herida.cronica);
    if (d.curarHeridas) { s.heridas = []; this.log('Te reconstruyen entero. Sales sin heridas abiertas.', 'bien'); }

    if (d.rel) this.añadirRelacion(d.rel.tipo, d.rel.afecto, d.rel.canon || slots.n, d.rel.quien, !!d.rel.canon);
    if (d.relTodas) s.relaciones.forEach(function (r) { r.afecto = U.clamp(r.afecto + d.relTodas, -100, 100); });
    if (d.relHijos) s.relaciones.forEach(function (r) { if (r.tipo === 'hijo') r.afecto = U.clamp(r.afecto + d.relHijos, -100, 100); });
    if (d.relPareja) s.relaciones.forEach(function (r) { if (r.tipo === 'pareja' || r.tipo === 'cónyuge') r.afecto = U.clamp(r.afecto + d.relPareja, -100, 100); });
    if (d.conEsa != null && slots._rel) this.afectoCon(slots._rel, d.conEsa, d.notaRel ? U.fill(d.notaRel, slots) : null);
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
    if (d.matarRel) this.matarRelacion(d.matarRel);

    if (d.item) this.darObjeto(typeof d.item === 'string' ? d.item : slots.o);
    if (d.sinMascota) { s.mascota = null; }
    if (d.venderNave && s.nave) {
      let v = Math.round(s.nave.p * 0.5);
      (s.mejorasNave || []).forEach(function (id) {
        const m = SW.MEJORAS_NAVE && SW.MEJORAS_NAVE.filter(function (x) { return x.id === id; })[0];
        if (m) v += Math.round(m.p * 0.25);
      });
      s.stats.creditos += v; this.log('Vendes ' + s.nave.n + ' por ' + U.cr(v) + '.', 'cr');
      s.nave = null; s.naveNombre = null; s.mejorasNave = [];
    }
    if (d.mascota) this.darMascota(slots.c);
    if (d.droide) this.darDroide();

    if (d.faccion) this.repFaccion(d.faccion, slots);
    if (d.faccion2) this.repFaccion(d.faccion2, slots);
    if (d.apodo) this.ponerApodo(d.apodo === 'elegir');
    if (d.bando) this.fijarBando(d.bando, slots);
    if (d.elegirBando) this.cola.unshift(this.prepararGen(this.menuBando()));
    if (d.rendimiento) s.rendimiento = U.clamp(s.rendimiento + d.rendimiento, 0, 100);
    if (d.aumento) { s.sueldo = Math.round(s.sueldo * (1 + d.aumento)); this.log('Nuevo sueldo: ' + U.cr(s.sueldo), 'cr'); }
    if (d.despido) this.perderTrabajo();
    if (d.ascenso != null && rng.chance(d.ascenso)) { s.rendimiento += 20; this.chequearAscenso(); }
    if (d.carcel) { s.carcelAños = d.carcel; this.log('Condena: ' + d.carcel + ' año(s).', 'mal'); this.hito('Entra en prisión (' + d.carcel + ' años)'); }
    /* Un oficio a la vez, y avisando. Antes tomarEmpleo pisaba el
       anterior en silencio: te metías en el Gremio y seguías «siendo»
       mecánico, con las dos pestañas abiertas y ninguna coherente. */
    if (d.empleo) {
      if (SW.chocaConTrabajo && SW.chocaConTrabajo(s, d.empleo.id)) {
        this.cola.unshift(this.prepararGen(SW.menuDejarTrabajo(this, d.empleo)));
        this.fase = 'evento';
      } else {
        this.tomarEmpleo(d.empleo.id, d.empleo.sueldo);
      }
    }
    if (d.buscarEmpleo) this.cola.unshift(this.prepararGen(SW.GEN.empleo(rng, s, d.buscarEmpleo)));
    if (d.generar && SW.GEN[d.generar]) this.cola.unshift(this.prepararGen(SW.GEN[d.generar](rng, s)));

    if (d.estudio) this.matricular(d.estudio);
    if (d.matricula) this.cola.unshift(this.prepararGen(this.menuMatricula()));
    if (d.tienda) this.cola.unshift(this.prepararGen(this.menuTienda()));
    if (d.armeria) this.cola.unshift(this.prepararGen(SW.GEN.armeria(rng, s)));
    if (d.mercancia) this.cola.unshift(this.prepararGen(this.menuMercancia()));
    if (d.venderCarga) this.venderCarga();
    if (d.cargar) this.comprarCarga(d.cargar);
    if (d.venderCarga) this.venderCarga();
    if (d.tirarCarga && s.carga) {
      this.log('Sueltas ' + s.carga.n + ' por la esclusa. Adiós a ' + U.cr(s.carga.coste) + '.', 'mal');
      s.carga = null;
    }
    if (d.viajarA) { this.abrirMapaViaje = true; s.destinoSugerido = d.viajarA; }
    if (d.abrirBodega && SW.menuBodega) { this.cola.unshift(this.prepararGen(SW.menuBodega(this))); this.fase = 'evento'; }
    if (d.rutaViaje && SW.resolverRuta) SW.resolverRuta(this, d.rutaViaje);

    /* --- tripulación --- */
    if (d.contratarTripulante) {
      s.tripulacion = s.tripulacion || [];
      s.tripulacion.push(d.contratarTripulante);
      s.stats.creditos -= d.contratarTripulante.sueldo;
      this.log('Contratas a <b>' + d.contratarTripulante.n + '</b> de ' +
        SW.OFICIOS_TRIPULACION[d.contratarTripulante.of].n + '.', 'bien');
    }
    if (d.despedirTripulante != null && s.tripulacion) {
      const q = s.tripulacion[d.despedirTripulante];
      if (q) { s.tripulacion.splice(d.despedirTripulante, 1); this.log('Despides a ' + q.n + '.', 'mal'); }
    }
    if (d.subirSueldo != null && s.tripulacion && s.tripulacion[d.subirSueldo]) {
      const q = s.tripulacion[d.subirSueldo];
      q.sueldo = Math.round(q.sueldo * 1.4); q.lealtad = U.clamp(q.lealtad + 25, 0, 100);
      this.log(q.n + ' cobra ahora ' + U.cr(q.sueldo) + '. Se le nota.', 'cr');
    }
    if (d.echarA && s.tripulacion) {
      s.tripulacion = s.tripulacion.filter(function (t) { return t.n !== d.echarA; });
    }
    if (d.lealtadA && s.tripulacion) {
      const q = s.tripulacion.filter(function (t) { return t.n === d.lealtadA.n; })[0];
      if (q) q.lealtad = U.clamp(q.lealtad + d.lealtadA.d, -20, 100);
    }
    if (d.lealtadTodos && SW.moverLealtad) SW.moverLealtad(this, d.lealtadTodos);

    /* --- negocios --- */
    if (d.comprarNegocio) {
      const T = (SW.NEGOCIOS || []).filter(function (x) { return x.id === d.comprarNegocio.tipo; })[0];
      if (T) {
        s.negocios = s.negocios || [];
        s.stats.creditos -= d.comprarNegocio.precio;
        s.negocios.push({ tipo: T.id, n: T.n + ' de ' + d.comprarNegocio.mundo,
          mundo: d.comprarNegocio.mundo, precio: d.comprarNegocio.precio,
          renta: T.renta, estado: 85, años: 0, encargado: null, robo: 0 });
        this.log('Compras ' + T.n.toLowerCase() + ' en ' + d.comprarNegocio.mundo + '. Ya es tuyo y ya da problemas.', 'bien');
        this.hito('Compra ' + T.n.toLowerCase() + ' en ' + d.comprarNegocio.mundo);
      }
    }
    if (d.verNegocio != null && SW.menuNegocio) {
      const mn = SW.menuNegocio(this, d.verNegocio);
      if (mn) { this.cola.unshift(this.prepararGen(mn)); this.fase = 'evento'; }
    }
    if (d.negocioArregla != null && s.negocios && s.negocios[d.negocioArregla]) {
      const n0 = s.negocios[d.negocioArregla];
      n0.estado = U.clamp(n0.estado + 30, 0, 100);
      this.log(n0.n + ': reformas. Estado ' + n0.estado + '%.', 'bien');
    }
    if (d.negocioArreglaN) { d.negocioArreglaN[0].estado = U.clamp(d.negocioArreglaN[0].estado + d.negocioArreglaN[1], 0, 100); }
    if (d.negocioDaño) { d.negocioDaño[0].estado = U.clamp(d.negocioDaño[0].estado - d.negocioDaño[1], 0, 100); }
    if (d.negocioPresion) { d.negocioPresion[0].presion = d.negocioPresion[1]; }
    if (d.negocioSinEncargado) { d.negocioSinEncargado.encargado = null; }
    if (d.negocioLimpiaRobo) { d.negocioLimpiaRobo.robo = 0; }
    if (d.negocioPierde && s.negocios) {
      s.negocios = s.negocios.filter(function (x) { return x !== d.negocioPierde; });
    }
    if (d.negocioEncargado != null && s.negocios && s.negocios[d.negocioEncargado]) {
      const n1 = s.negocios[d.negocioEncargado];
      n1.encargado = SW.genNombreCompleto(rng, rng.pick(['humano', 'rodiano', 'twilek', 'duros']));
      n1.robo = 0;
      this.log(n1.n + ': ahora lo lleva ' + n1.encargado + '.', 'res');
    }
    if (d.negocioAtiende != null && s.negocios && s.negocios[d.negocioAtiende]) {
      const n2 = s.negocios[d.negocioAtiende];
      n2.estado = U.clamp(n2.estado + 12, 0, 100);
      this.log('Te pasas por ' + n2.n + '. Se nota cuando el dueño aparece.', 'res');
    }
    if (d.negocioVende != null && s.negocios && s.negocios[d.negocioVende]) {
      const n3 = s.negocios[d.negocioVende];
      const v = Math.round(n3.precio * 0.7 * (n3.estado / 100));
      s.stats.creditos += v;
      s.negocios.splice(d.negocioVende, 1);
      this.log('Vendes ' + n3.n + ' por ' + U.cr(v) + '.', 'cr');
    }
    /* --- encargos de leyenda del Gremio --- */
    if (s.leyenda) {
      const L = s.leyenda;
      if (d.encargoVentaja) L.ventaja = (L.ventaja || 0) + d.encargoVentaja;
      if (d.encargoRuido) L.ruido = (L.ruido || 0) + d.encargoRuido;
      if (d.encargoAviso) L.sabeQueVas = true;
      if (d.encargoVerdad) L.verdad = true;
      if (d.encargoEstado) L.estado = d.encargoEstado;
      if (d.encargoPago) L.pago = Math.round(L.pago * d.encargoPago);
    }
    if (d.soltarLeyenda && SW.cerrarLeyenda) SW.cerrarLeyenda(this, 'soltar');
    if (d.cerrarLeyenda && SW.cerrarLeyenda) {
      if (d.cerrarLeyenda === true) s.leyenda = null;
      else SW.cerrarLeyenda(this, d.cerrarLeyenda, d.encargoCobro);
    }
    // si la ruta acabó en combate espacial, el destino espera detrás
    if (d.rutaTras) s.rutaPendiente = d.rutaTras;
    if (d.hangar) this.cola.unshift(this.prepararGen(this.menuHangar()));
    if (d.taller && SW.menuTaller && s.nave) this.cola.unshift(this.prepararGen(SW.menuTaller(this)));
    if (d.carrera && SW.iniciarCarrera) SW.iniciarCarrera(this, d.circuito);
    if (d.tomarContrato && inst && inst.ref && inst.ref.contrato) {
      s.contrato = inst.ref.contrato;
      if (d.pistaExtra) s.contrato.rastro = 1;
      this.log('Contrato aceptado: ' + s.contrato.nombre + ', en ' + s.contrato.destino + '.', 'bien');
    }
    if (d.cazaAvanza && s.contrato) { if (d.rastro) s.contrato.rastro = U.clamp((s.contrato.rastro || 0) + d.rastro, 0, 3); }
    if (d.cazaBusca && SW.resolverBusqueda) SW.resolverBusqueda(this, d.cazaBusca);
    if (d.cazaCaptura && d.minijuegoCaza && s.contrato) {
      // el disparo de aturdimiento se juega, no se tira
      this.escena = { tipo: 'combate', cfg: { dif: s.contrato.dif, caza: true }, ronda: 1, maxRondas: 1,
                      hpEnemigo: 100, hpMaxEnemigo: 100, aguante: 100, golpe: 1,
                      poder: this.poderCombate(), dif: s.contrato.dif, postura: 'guardia', capturaCaza: true };
      this.cola.unshift(this.prepararGen(this.eventoMinijuego()));
    } else if (d.cazaCaptura && SW.resolverCaptura) SW.resolverCaptura(this, d.cazaCaptura);
    if (d.cazaEntrega && SW.resolverEntrega) SW.resolverEntrega(this, d.cazaEntrega);
    if (d.cazaAbandona) {
      this.log('Dejas el contrato a medias. En el Gremio eso se recuerda.', 'mal');
      s.flags.gremio_desconfia = true; s.contrato = null;
      this.aplicarFx({ reputacion: -10, cordura: -5 }, {});
    }
    if (d.ojo && SW.GEN.atencionFuerza) this.cola.unshift(this.prepararGen(SW.GEN.atencionFuerza(rng, s)));
    if (d.flag2) s.flags[U.fill(d.flag2, slots)] = true;
    if (d.quitarRuido) { s.stats.notoriedad = Math.max(0, s.stats.notoriedad - 10); }
    if (d.instalarMejora) this.instalarMejora(d.instalarMejora);
    // no se puede ser jedi y senador a la vez: hay que salirse de uno
    if (d.empleoPolitico != null && SW.caminoLibre && !SW.caminoLibre(s, 'politico')) {
      this.cola.unshift(this.prepararGen(SW.GEN.dejarCamino(rng, s, 'politico')));
      return;
    }
    if (d.empleoPolitico != null && SW.ESCALONES) {
      const esc = SW.ESCALONES[d.empleoPolitico];
      if (esc) {
        s.escalonPolitico = d.empleoPolitico;
        s.flags.carrera_politica = true;
        this.tomarEmpleo('politico', esc.sueldo);
        // el cargo se llama como se llame en esta época
        const nombreCargo = SW.nombreEscalon ? SW.nombreEscalon(s, d.empleoPolitico) : esc.n;
        s.rango = U.titleCase(nombreCargo);
        this.log('Ahora eres <b>' + nombreCargo + '</b>. Sueldo: ' + U.cr(esc.sueldo) + '.', 'bien');
        this.hito('Llega a ' + nombreCargo);
        // a partir del cuarto escalón te mudas... si hay Senado al que ir.
        // Donde el Senado está disuelto, gobiernas desde tu propio mundo.
        const hayEscano = !SW.hayEscano || SW.hayEscano(s);
        if (d.empleoPolitico >= 3 && hayEscano) {
          s.flags.en_el_senado = true;
          const dest = SW.destinoDeCargo ? SW.destinoDeCargo(s, 'senador') : 'Coruscant';
          if (dest && s.mundo !== dest) this.mover(dest, 'a ocupar tu escaño');
        }
      }
    }
    if (d.votoRegistrado) {
      s.votos = s.votos || [];
      s.votos.push({ edad: s.edad, tema: d.votoRegistrado, sentido: d.t });
    }
    if (d.enemigo) {
      s.contadores.enemigosPoliticos = (s.contadores.enemigosPoliticos || 0) + 1;
      this.log('Te acabas de ganar un enemigo con memoria.', 'mal');
    }
    if (d.viajar) this.abrirMapaViaje = true;
    if (d.fuerzaMenu) this.cola.unshift(this.prepararGen(this.menuFuerza()));
    if (d.clinica) this.cola.unshift(this.prepararGen(this.menuClinica()));
    if (d.accionMenu) this.cola.unshift(this.prepararGen(SW.GEN[rng.chance(0.45) && s.nave ? 'dogfight' : 'accion'](rng, s)));
    if (d.nombrarNave) this.cola.unshift(this.prepararGen(this.menuNombreNave()));
    if (d.construirSable) this.cola.unshift(this.prepararGen(this.menuSable()));
    if (d.dejarOrden) {
      const era = s.trabajo;
      s.trabajo = null; s.rango = null; s.sueldo = 0;
      if (era === 'jedi') { s.faccionRep.orden_jedi = (s.faccionRep.orden_jedi || 0) - 30; }
      this.log('Dejas ' + ((SW.CAMINOS[era] || {}).n || 'lo que hacías') + '.', 'mal');
      this.hito('Deja ' + ((SW.CAMINOS[era] || {}).n || 'su camino'));
    }
    if (d.dejarCargo) {
      s.trabajo = null; s.rango = null; s.sueldo = 0;
      s.flags.carrera_politica = false; s.flags.en_el_senado = false;
      this.log('Se acabó tu carrera política.', 'mal');
    }
    if (d.tomarCamino === 'sith') this.unirseOrden('sith');
    if (d.tomarCamino === 'politico' && SW.ESCALONES) {
      s.flags.carrera_politica = true;
      this.tomarEmpleo('politico', SW.ESCALONES[s.escalonPolitico || 0].sueldo);
    }
    if (d.sableRojo) {
      // sangrar el cristal cambia la hoja de verdad: color, tinte y ficha
      if (!s.sable) s.sable = { color: 'rojo', hex: '#ff3a3a', forma: s.forma || 'Makashi' };
      else { s.sable.color = 'rojo'; s.sable.hex = '#ff3a3a'; }
      s.sable.sangrado = true;
      if (s.kyber) { s.kyber.c = 'rojo'; s.kyber.hex = '#ff3a3a'; }
      this.log('El cristal cede y se vuelve <b>rojo</b>.', 'mal');
      this.popup({ arte: 'sable', color: '#ff3a3a', titulo: 'Cristal sangrado', texto: 'Ya no vuelve a ser azul.' });
    }
    if (d.buscarAprendiz && SW.buscarAprendiz) SW.buscarAprendiz(this);
    if (d.entrenarAprendiz && s.aprendizSith) {
      s.aprendizSith.poder += rng.int(4, 9);
      s.aprendizSith.lealtad += rng.int(-8, 6);
      this.aplicarFx({ fuerza: 5, carisma: 4 }, {});
      this.log('Tu aprendiz mejora. Eso es bueno y es malo.', 'res');
    }
    if (d.aprendizSucio && s.aprendizSith) {
      s.aprendizSith.lealtad -= rng.int(6, 16);
      this.aplicarFx({ creditos: 18000, alineamiento: -12, notoriedad: 6 }, {});
      this.log('Lo hace él. La mancha es suya y el beneficio tuyo.', 'res');
    }
    if (d.matarAprendiz && s.aprendizSith) {
      const a = s.aprendizSith;
      if (rng.chance(U.clamp(0.5 + (s.stats.fuerza - a.poder) / 90, 0.15, 0.92))) {
        this.log('Acabas con ' + a.n + ' antes de que se le ocurra a él.', 'mal');
        this.matarRelacion('aprendiz');
        s.aprendizSith = null;
        this.aplicarFx({ alineamiento: -16, cordura: -10, fuerza: 6 }, {});
      } else {
        this.log(a.n + ' lo esperaba.', 'mal');
        s.aprendizSith = null;
        this.iniciarCombate({ dif: a.poder + 18, duelo: true, sable: true, aMuerte: true });
      }
    }
    if (d.cazarJedi) {
      const dif = 52 + rng.int(0, 30);
      this.log('Sales a cazar. Encuentras a uno.', 'res');
      s.contadores.jedisCazados = (s.contadores.jedisCazados || 0) + 1;
      this.aplicarFx({ alineamiento: -14, notoriedad: 14 }, {});
      this.iniciarCombate({ dif: dif, duelo: true, sable: true, aMuerte: true, sableBotin: !s.sable });
    }
    if (d.conspira && SW.resolverConspiracion) SW.resolverConspiracion(this, d.conspira, d.modo);
    if (d.menuAlistar) this.cola.unshift(this.prepararGen(this.menuAlistarse()));
    if (d.unirse) this.unirseOrden(d.unirse);
    if (d.poder) this.darPoder(d.poder);
    if (d.habilidad && s.habilidades.indexOf(d.habilidad) < 0) { s.habilidades.push(d.habilidad); this.log('Nueva habilidad: ' + d.habilidad + '.', 'bien'); }
    if (d.idioma && s.idiomas.indexOf(d.idioma) < 0) { s.idiomas.push(d.idioma); this.log('Aprendes ' + d.idioma + '.', 'bien'); }
    if (d.cibernetica) { s.cibernetica.push(typeof d.cibernetica === 'string' ? d.cibernetica : 'prótesis'); this.log('Implante instalado.', 'bien'); }
    if (d.asignarMaestro) this.asignarMaestro(d.asignarMaestro);
    if (d.vaciarObjetos) { s.objetos = []; this.log('Entregas todo lo que tenías.', 'res'); }
    if (d.despertar) this.despertar();
    if (d.kyber) this.darKyber();
    if (d.sableOscuro) this.darSableOscuro();
    if (d.sableNuevo) this.construirSable(null);
    if (d.sablePierde) { s.sable = null; this.log('Ya no tienes sable.', 'mal'); }
    if (d.naveCompra) this.darNave(rng.pick(SW.NAVES));
    if (d.naveGana) this.darNave(rng.pick(SW.NAVES));
    if (d.navePierde) { s.nave = null; s.naveNombre = null; this.log('Pierdes tu nave.', 'mal'); }
    if (d.naveEstado) s.naveEstado = U.clamp(s.naveEstado + d.naveEstado, 0, 100);
    // apostar ya no se resuelve a ciegas: se abre la mesa y se juega
    if (d.mesa && SW.iniciarApuesta && s.stats.creditos > 400) {
      this.cola.unshift(this.prepararGen(SW.iniciarApuesta(this, { juego: d.mesa === true ? null : d.mesa })));
    }
    if (d.apuesta === 'gana') { const g = Math.round(Math.max(1000, s.stats.creditos * 0.5)); s.stats.creditos += g; this.log('Ganas ' + U.cr(g) + '.', 'cr'); }
    if (d.apuesta === 'pierde') { const g = Math.round(Math.max(0, s.stats.creditos) * 0.5); s.stats.creditos -= g; this.log('Pierdes ' + U.cr(g) + '.', 'mal'); }
    if (d.legado) { s.legado = d.legado; this.hito('Deja un legado: ' + d.legado); }
    if (d.gastarTodo) { s.stats.creditos = 0; s.negocios = []; }
    if (d.chequeo) this.chequeoMedico();
    if (d.mover) this.mover(d.mover === 'casa' ? (s.mundoSecuestro || s.mundoNatal) : (d.mover === 'cerca' ? this.mundoCercano() : null), d.motivo);
    if (d.mueveA) this.mover(U.fill(d.mueveA, slots), d.motivo);
    // te secuestran: apareces lejos y tienes que resolverlo
    if (d.secuestrar) {
      const lejos = SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, s.mundo) : this.mundoCercano();
      s.mundoSecuestro = s.mundo;
      this.mover(lejos, 'te trajeron aquí en contra de tu voluntad');
    }
    if (d.pagarDeuda) {
      const deuda = s.contadores.deuda || 10000;
      s.stats.creditos -= deuda;
      s.contadores.deuda = 0;
      this.log('Saldas ' + U.cr(deuda) + '. Se acabó.', 'cr');
    }
    if (d.limpiarBusca) { s.buscado = 0; this.log('Ya no te busca nadie.', 'bien'); }
    if (d.evacuar) {
      const dest = SW.refugioDe ? SW.refugioDe(rng, s.mundo) : this.mundoCercano();
      s.flags['evacuado_' + s.mundo] = true;
      this.mover(dest, 'porque allí ya no se podía estar');
    }
    if (d.evacuarA) this.mover(d.evacuarA === 'cerca' ? this.mundoCercano() : d.evacuarA, d.motivo || 'sin mirar atrás');
    if (d.guerra) {
      s.flags.veterano = true; s.contadores.batallas++;
      s.flags.en_el_frente = true;
      s.puestoGuerra = d.puesto || s.puestoGuerra || 'infanteria';
      s.añosDeFrenteRestantes = d.campaña || rng.int(2, 5);
      /* Sin bando no hay unidad, y sin unidad la pestaña de Escuadrón
         no aparece: te alistabas y no te llegaba una sola misión en toda
         la guerra. Si la escena no dice de qué lado vas, se toma el
         ejército regular de tu época. */
      if (!s.bando) this.fijarBando(d.bandoGuerra || (SW.bandoRegular ? SW.bandoRegular(s) : 'republica'), slots);
      s.campaña = { mision: 0, medallas: 0, puesto: s.puestoGuerra };
      this.hito('Va a la guerra');
      this.log('Estás en el frente. A partir de ahora, cada año cuenta.', 'mal');
    }
    if (d.puesto) s.puestoGuerra = d.puesto;
    if (d.dejarFrente) { s.flags.en_el_frente = false; s.añosDeFrenteRestantes = 0; this.log('Te licencian. Se acabó el frente.', 'bien'); }

    /* --- claves que usan las escenas encadenadas (Purga, pruebas,
       Inquisición). Son pequeñas y no merecen cada una su gancho. --- */
    if (d.hito) this.hito(U.fill(d.hito, slots));
    if (d.rango) {
      s.rango = d.rango;
      s.padawan = /iniciado|padawan/i.test(d.rango);
      this.log('Ahora eres <b>' + d.rango + '</b>.', 'bien');
    }
    if (d.ventaja && s.o66) s.o66.ventaja = (s.o66.ventaja || 0) + d.ventaja;
    if (d.maestroAfecto && SW.miMaestro) {
      const mm = SW.miMaestro(this);
      if (mm) mm.afecto = U.clamp(mm.afecto + d.maestroAfecto, -100, 100);
    }
    if (d.relCambio) {
      const rc = s.relaciones.filter(function (r) { return r.nombre === d.relCambio.nombre; })[0];
      if (rc) rc.afecto = U.clamp(rc.afecto + (d.relCambio.afecto || 0), -100, 100);
    }
    if (d.cambiarEmpleo) { this.perderTrabajo(); this.tomarEmpleo(d.cambiarEmpleo.id, d.cambiarEmpleo.sueldo); }
    if (d.pruebaOk && SW.contarPrueba) SW.contarPrueba(this, d);
    if (d.medalla && SW.darMedalla) SW.darMedalla(this);
    // «medallaSi»: te la dan si sales vivo del combate que abre la opción
    if (d.medallaSi) s.pendienteMedalla = true;
    if (d.hazteInquisidor && SW.hazteInquisidor) SW.hazteInquisidor(this);
    if (d.cazaJedi && SW.marcarJediCazado) SW.marcarJediCazado(this, d.cazaJedi);
    if (d.aceptaCaza) {
      s.caza = Object.assign({ fase: 'rastro', intentos: 0, aviso: 0 }, d.aceptaCaza);
      this.log('Expediente abierto: ' + s.caza.perfil.n + ' en ' + s.caza.mundo + '.', 'res');
      if (SW.ESCENAS && SW.ESCENAS.inq_rastro) {
        this.cola.unshift(this.prepararGen(SW.ESCENAS.inq_rastro(this)));
        this.fase = 'evento';
      }
    }
    if (d.cazaRastro && SW.resolverRastro) {
      const sc = SW.resolverRastro(this, d.cazaRastro);
      if (sc) { this.cola.unshift(this.prepararGen(sc)); this.fase = 'evento'; }
    }
    if (d.cazaCerco && SW.resolverCerco) {
      const sc = SW.resolverCerco(this, d.cazaCerco);
      if (sc) { this.cola.unshift(this.prepararGen(sc)); this.fase = 'evento'; }
    }

    if (d.muerte) this.morir(d.muerteTxt || 'Una mala decisión, la última.');

    if (d.combate) this.iniciarCombate(d.combate);
    if (d.dogfight) this.iniciarDogfight(d.dogfight);

    clampStats(this.s);
    if (this.s.stats.salud <= 0 && !this.s.muerto) this.morir('Heridas.');
  };

  Game.prototype.prepararGen = function (ev) {
    const inst = { ref: ev, id: ev.id, slots: ev.slots || {}, texto: ev.t, opciones: [] };
    for (let i = 0; i < ev.c.length; i++) {
      const o = ev.c[i];
      if (o.req) { try { if (!o.req(this.s)) continue; } catch (e) { continue; } }
      const av2 = avisoOpcion(o);
      inst.opciones.push({ idx: i, txt: o.t, sub: (o.sub ? o.sub + (av2 ? ' · ' + av2 : '') : av2), def: o, bloqueada: o.bloqueada });
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

  /* Oficios y señas que hacen memorable a la gente que conoces */
  const OFICIOS = [
    'mecánica de hangar', 'piloto de carga', 'médico de urgencias', 'contrabandista',
    'cocinero de puerto', 'chatarrero', 'guardia de aduanas', 'músico de cantina',
    'minero de especia', 'archivera', 'domador de bestias', 'falsificador',
    'capataz de muelle', 'ingeniera de droides', 'cazarrecompensas retirado',
    'granjera de humedad', 'traficante de información', 'monje de los Whills'
  ];

  Game.prototype.añadirRelacion = function (tipo, afecto, nombre, quien, esCanon) {
    const s = this.s, rng = this.rng;
    // si ya conoces a esa persona, se refuerza el vínculo en vez de duplicarla
    if (nombre) {
      const ya = s.relaciones.filter(function (r) { return r.nombre === nombre; })[0];
      if (ya) {
        ya.afecto = U.clamp(ya.afecto + Math.round((afecto || 20) / 2), -100, 100);
        this.log('Vuelves a ver a ' + ya.nombre + '. La cosa se estrecha.', 'rel');
        return ya.nombre;
      }
    }
    const gen = SW.generoPara ? SW.generoPara(rng, tipo, s.pronombre) : (rng.chance(0.5) ? 'm' : 'f');
    const esp = rng.pick(SW.ESPECIES);
    const n = esCanon ? nombre : this.nombreLibre(nombre ||
      SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'togruta', 'duros']), gen));
    const desc = quien || (esCanon ? '' : rng.pick(OFICIOS));
    s.relaciones.push({
      nombre: n, tipo: tipo, afecto: U.clamp(afecto || 20, -100, 100),
      especie: esCanon ? '' : esp.n, quien: desc, canon: !!esCanon, desde: s.edad,
      gen: gen, historia: []
    });
    this.log('Nueva relación: <b>' + n + '</b> — ' + tipo + (desc ? ', ' + desc : '') + '.', 'rel');
    if (tipo === 'cónyuge' || tipo === 'pareja') this.hito(U.titleCase(tipo) + ': ' + n);
    this.podarRelaciones();
    return n;
  };

  /** Se pierde el contacto con la gente que ni te importa ni te odia */
  Game.prototype.podarRelaciones = function () {
    const s = this.s;
    if (s.relaciones.length <= 12) return;
    const prioridad = { 'cónyuge': 5, 'pareja': 5, 'hijo': 5, 'hermano': 4, 'hermano de lote': 4, 'mentor': 3, 'aprendiz': 3, 'rival': 3, 'amigo': 2 };
    const orden = s.relaciones.slice().sort(function (a, b) {
      const pa = (prioridad[a.tipo] || 1) * 100 + Math.abs(a.afecto);
      const pb = (prioridad[b.tipo] || 1) * 100 + Math.abs(b.afecto);
      return pa - pb;
    });
    const fuera = orden[0];
    if ((prioridad[fuera.tipo] || 1) >= 3) return;
    s.relaciones = s.relaciones.filter(function (r) { return r !== fuera; });
    s.relacionesPasadas.push(fuera);
    this.log('Pierdes el contacto con ' + fuera.nombre + '.', 'rel');
  };

  /** Registrar que te has cruzado con alguien conocido */
  Game.prototype.conocerCanon = function (p) {
    const s = this.s;
    if (s.conocidos.indexOf(p.n) >= 0) return;
    s.conocidos.push(p.n);
    this.hito('Se cruza con ' + p.n);
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
  Game.prototype.matarRelacion = function (tipo) {
    const s = this.s, rng = this.rng;
    const cand = s.relaciones.filter(function (r) { return tipo === true || r.tipo === tipo; });
    if (!cand.length) return;
    const v = rng.pick(cand);
    s.relaciones = s.relaciones.filter(function (r) { return r !== v; });
    s.relacionesPasadas.push(v);
    this.log('Muere ' + v.nombre + ' (' + v.tipo + ').', 'muerte');
    this.hito('Pierde a ' + v.nombre);
    this.aplicarFx({ cordura: -14 }, {});
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
    if (SW.puedeCasarse && !SW.puedeCasarse(s)) {
      this.log('La Orden prohíbe el apego. No hay boda: hay una conversación difícil.', 'mal');
      this.aplicarFx({ cordura: -8 }, {});
      return;
    }
    const yaCasado = s.relaciones.filter(function (r) { return r.tipo === 'cónyuge'; })[0];
    let p = s.relaciones.filter(function (r) { return r.tipo === 'pareja'; })[0];
    if (yaCasado) {
      if (!p) { this.log('Ya estás casad@ con ' + yaCasado.nombre + '. Renováis los votos.', 'bien'); yaCasado.afecto = Math.min(100, yaCasado.afecto + 10); return; }
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
    if (!o && nombre && SW.fichaObjeto(nombre)) o = { n: nombre, t: 'arma', p: 2000 };
    if (!o) o = rng.pick(SW.OBJETOS);
    if (s.objetos.indexOf(o.n) >= 0 && rng.chance(0.5)) {
      this.log('Otro ' + o.n + '. Vendes el viejo.', 'cr');
      s.stats.creditos += Math.round((o.p || 500) * 0.4);
      return;
    }
    s.objetos.push(o.n);
    const ficha = SW.fichaObjeto(o.n);
    this.log('Obtienes: <b>' + o.n + '</b>.', 'bien');
    this.popup({
      tipo: 'objeto',
      titulo: 'OBJETO OBTENIDO',
      nombre: o.n,
      sprite: SW.spriteDeObjeto(o),
      desc: ficha
        ? (ficha.cat === 'fuego' ? 'Arma de fuego. Ahora puedes batirte en duelos de pistolas.'
          : ficha.cat === 'filo' ? 'Arma blanca. Sirve de cerca.'
          : ficha.cat === 'peto' ? 'Protección: resta daño en combate.'
          : 'Herramienta útil.')
        : (o.t === 'reliquia' ? 'Una pieza antigua. Alguien pagaría por ella.' : 'Guardado en tu petate.'),
      stats: ficha ? [
        ficha.atk ? '+' + ficha.atk + ' ataque' : null,
        ficha.def ? '+' + ficha.def + ' defensa' : null,
        ficha.precision ? '+' + ficha.precision + ' precisión' : null
      ].filter(Boolean) : []
    });
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
    s.droide = { nombre: SW.genNombre(rng, 'droide'), tipo: rng.pick(['astromecánico', 'protocolar', 'médico', 'de carga', 'de combate reprogramado', 'de sondeo', 'de cocina malhumorado']) };
    this.log('Droide ' + s.droide.tipo + ' ' + s.droide.nombre + ' a tu servicio.', 'bien');
  };
  Game.prototype.darNave = function (nave) {
    const s = this.s;
    s.nave = nave;
    s.naveEstado = 85;
    this.log('Ahora tienes: <b>' + nave.n + '</b>.', 'bien');
    this.hito('Consigue una nave: ' + nave.n);
    this.popup({
      tipo: 'nave',
      titulo: 'NAVE ADQUIRIDA',
      nombre: nave.n,
      sprite: SW.spriteDeNave(nave),
      desc: 'Clase ' + nave.cls + '. Ya puedes hacer rutas de carga y meterte en combates espaciales.',
      stats: ['velocidad ' + nave.vel, 'carga ' + nave.carga, 'armamento ' + nave.arm]
    });
  };

  /* ---------------- Facciones y bandos ---------------- */
  Game.prototype.repFaccion = function (spec, slots) {
    const s = this.s;
    const m = /^([a-z_]+)([+-]\d+)$/.exec(spec);
    if (!m) return;
    let id = m[1];
    const delta = parseInt(m[2], 10);
    if (id === 'auto') id = (slots && slots._faccion) || 'imperio';
    s.faccionRep[id] = U.clamp((s.faccionRep[id] || 0) + delta, -100, 100);
  };

  Game.prototype.fijarBando = function (id, slots) {
    const s = this.s;
    if (id === 'auto') id = (slots && slots._faccion) || null;
    if (!id) return;
    const f = SW.faccion(id);
    s.bando = id;
    s.faccionRep[id] = U.clamp((s.faccionRep[id] || 0) + 25, -100, 100);
    this.log('Te alistas con: ' + (f ? f.n : id) + '.', 'bien');
    this.hito('Se alista con ' + (f ? f.n : id));
  };

  /** apodo de unidad: deja de ser un número */
  Game.prototype.ponerApodo = function (elegir) {
    const s = this.s, rng = this.rng;
    if (elegir) {
      const ops = rng.pickN(SW.APODOS_CLON, 5);
      this.cola.unshift(this.prepararGen({
        id: 'menu_apodo', gen: true,
        t: 'Un nombre es un nombre aunque te lo pongas tú. ¿Cuál?',
        c: ops.map(function (a) { return { t: '"' + a + '"', fijarApodo: a }; })
      }));
      return;
    }
    const a = rng.pick(SW.APODOS_CLON);
    this.fijarApodo(a);
  };

  Game.prototype.fijarApodo = function (a) {
    const s = this.s;
    s.apodo = a;
    s.nombre = a + ' (' + (s.designacion || s.nombre) + ')';
    this.log('A partir de hoy te llaman <b>' + a + '</b>.', 'bien');
    this.hito('Recibe el nombre de ' + a);
  };

  Game.prototype.menuBando = function () {
    const s = this.s;
    if (SW.puedeAlistarse && !SW.puedeAlistarse(s)) {
      return {
        id: 'menu_bando', gen: true, esMenu: true,
        t: s.trabajo === 'jedi'
          ? 'Eres de la Orden. Los jedi no se alistan en ejércitos: sirven a la República a través del Consejo, y solo si el Consejo lo ordena.'
          : 'Un sith no se alista. Un sith coloca a otros donde le conviene y espera.',
        c: [{ t: '◂ Entendido', volver: true }]
      };
    }
    const bandos = SW.bandosDeEra(s.era, s);
    const c = bandos.map(function (b) {
      return { t: b.n, sub: b.desc, bando: b.id, fx: b.fx || {}, out: b.out || '' };
    });
    c.push({ t: 'No alistarte con nadie', fx: { cordura: 4 }, out: 'Esta guerra no es tuya. Aunque te alcance igual.' });
    return { id: 'menu_bando', gen: true, t: 'CONFLICTO — ' + s.eraN + '. Hay que elegir con quién vas.', c: c };
  };

  /* ---------------- Trabajo ---------------- */
  Game.prototype.tomarEmpleo = function (id, sueldo) {
    const s = this.s;
    const c = SW.carrera(id);
    if (!c) return;
    s.trabajo = id;
    /* Si tu oficio ES el Gremio, tienes la placa. Parece obvio y no lo
       era: los rangos de la carrera se llaman «Novato del Gremio» y
       «Leyenda del Gremio», pero la pestaña de contratos pedía el flag
       `en_el_gremio`, que solo ponía un evento suelto de bar. Se podía
       llegar a Leyenda del Gremio sin recibir un solo contrato. */
    if (id === 'cazarrecompensas' && !s.flags.en_el_gremio) {
      s.flags.en_el_gremio = true;
      this.log('Con el oficio viene la placa: ya estás en el Gremio de Cazarrecompensas.', 'bien');
    }
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
      if (!SW.ordenActiva(s.era)) {
        this.log('No hay Orden a la que presentarse en esta época. Solo ruinas y rumores.', 'mal');
        return;
      }
      if (s.stats.alineamiento < -30) { this.log('La Orden percibe la sombra en ti. Te rechazan.', 'mal'); return; }
      this.tomarEmpleo('jedi', 0);
      s.stats.alineamiento += 15;
      this.hito('Entra en la Orden Jedi');
      // el Templo está donde está: no se es jedi por correspondencia
      const dest = SW.destinoDeCargo ? SW.destinoDeCargo(s, 'jedi') : 'Coruscant';
      if (dest && s.mundo !== dest) this.mover(dest, 'te llevan al Templo');
    } else {
      this.tomarEmpleo('sith', 0);
      s.stats.alineamiento -= 25;
      s.stats.fuerza += 10;
      this.hito('Abraza el lado oscuro');
      // un maestro sith no deja a su aprendiz con las manos vacías
      if (!s.sable) {
        if (!s.kyber) s.kyber = { c: 'rojo', hex: '#ff3a3a', s: 'Un cristal ya sangrado por otro antes que tú.' };
        s.forma = s.forma || 'Makashi';
        s.sable = { color: 'rojo', hex: '#ff3a3a', forma: s.forma, sangrado: true };
        this.log('Tu maestro te entrega una hoja <b>roja</b>. No preguntes de quién era.', 'mal');
        this.hito('Recibe un sable de hoja roja');
      }
    }
    clampStats(s);
  };

  /* ---------------- Estudios ---------------- */
  /** Matricularse ya no es instantáneo: se apunta y los años pasan.
      Antes te dabas ocho años de Templo en un solo año de vida. */
  Game.prototype.matricular = function (id) {
    const s = this.s;
    const e = SW.ESTUDIOS.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    if (s.stats.creditos < e.coste) { this.log('No puedes pagar la matrícula.', 'mal'); return; }
    s.stats.creditos -= e.coste;
    const años = SW.añosDeEstudio ? SW.añosDeEstudio(e.id) : 3;
    s.estudiando = { id: e.id, n: e.n, quedan: años, total: años };
    this.log('Te matriculas en <b>' + e.n + '</b>. Son ' + años + ' años.', 'bien');
  };

  /** un año más de formación; al acabar, el título y sus efectos */
  Game.prototype.avanzarEstudio = function () {
    const s = this.s;
    const est = s.estudiando;
    if (!est) return;
    est.quedan--;
    const e = SW.ESTUDIOS.filter(function (x) { return x.id === est.id; })[0];
    // se aprende poco a poco, no todo de golpe al final
    if (e && e.mods) {
      for (const k in e.mods) {
        if (s.stats[k] == null) continue;
        s.stats[k] += e.mods[k] / est.total;
      }
    }
    if (est.quedan > 0) {
      this.log('Sigues formándote en ' + est.n + '. Quedan ' + est.quedan + ' año(s).', 'res');
      s.acciones = Math.max(1, s.acciones - 1);   // estudiar ocupa
      clampStats(s);
      return;
    }
    s.estudios.push(est.n);
    if (e && e.faccion) s.faccionRep[e.faccion] = U.clamp((s.faccionRep[e.faccion] || 0) + 15, -100, 100);
    s.estudiando = null;
    clampStats(s);
    this.log('Terminas <b>' + est.n + '</b>.', 'bien');
    this.hito('Se forma en ' + est.n);
  };

  /* ---------------- Fuerza ---------------- */
  Game.prototype.darPoder = function (spec) {
    const s = this.s, rng = this.rng;
    let pool = SW.PODERES.filter(function (p) { return s.poderes.indexOf(p.id) < 0; });
    if (spec === 'auto_luz') pool = pool.filter(function (p) { return p.lado >= 0; });
    else if (spec === 'auto_oscuro') pool = pool.filter(function (p) { return p.lado <= 0; });
    else if (spec && spec !== 'auto') {
      const p = SW.PODERES.filter(function (x) { return x.id === spec; })[0];
      if (p && s.poderes.indexOf(p.id) < 0) pool = [p];
    }
    pool = pool.filter(function (p) { return s.stats.fuerza >= p.coste * 0.8; });
    if (!pool.length) { this.log('No aprendes nada nuevo esta vez. Todavía no estás para más.', 'res'); return; }
    const p = rng.pick(pool);
    s.poderes.push(p.id);
    this.log('Aprendes: ' + p.n + '. ' + p.desc, 'bien');
    this.hito('Aprende ' + p.n);
  };
  /** El cristal escoge: el color depende de quién eres, no de lo que quieras */
  Game.prototype.darKyber = function () {
    const s = this.s, rng = this.rng;
    const pool = SW.COLORES_KYBER.filter(function (k) {
      if (k.req) { try { return k.req(s); } catch (e) { return false; } }
      return true;
    });
    const k = rng.weighted(pool, function (x) { return x.w || 1; });
    s.kyber = k;
    this.log('El cristal responde en tu mano. Es <b>' + k.c + '</b>. ' + k.s, 'bien');
    this.hito('Obtiene un cristal kyber ' + k.c);
    this.popup({
      tipo: 'kyber', titulo: 'CRISTAL KYBER', nombre: 'cristal ' + k.c,
      sprite: 'kyber', color: k.hex, desc: k.s,
      stats: ['el cristal elige, no tú']
    });
  };

  /** El Sable Oscuro no se construye: se hereda o se gana en combate */
  Game.prototype.darSableOscuro = function () {
    const s = this.s;
    const D = SW.SABLE_OSCURO;
    s.sable = { color: D.c, hex: D.filo, forma: s.forma || 'Makashi', oscuro: true };
    s.flags.sable_oscuro = true;
    s.faccionRep.mandalorianos = U.clamp((s.faccionRep.mandalorianos || 0) + 30, -100, 100);
    this.log('El <b>Sable Oscuro</b> pasa a tus manos. ' + D.s, 'bien');
    this.hito('Empuña el Sable Oscuro');
    this.popup({
      tipo: 'sable', titulo: 'SABLE OSCURO', nombre: 'el Sable Oscuro de Tarre Vizsla',
      sprite: 'sable_oscuro', color: D.filo, desc: D.s,
      stats: ['pieza única', 'reclama Mandalore', 'solo cambia de manos en combate']
    });
  };

  Game.prototype.asignarMaestro = function (lado) {
    const s = this.s, rng = this.rng;
    const m = SW.maestroDe(rng, s.era, lado);
    s.maestro = m.n;
    const quien = lado === 'sith' ? 'tu maestro sith' : 'tu maestro jedi';
    this.añadirRelacion(lado === 'sith' ? 'maestro sith' : 'maestro jedi',
      lado === 'sith' ? 15 : 55, m.n, quien, m.canon);
    this.log('Tu maestro será <b>' + m.n + '</b>' + (m.canon ? ' — sí, ese.' : '.'), 'bien');
    this.hito('Maestro: ' + m.n);
    if (m.canon) s.conocidos.push(m.n);
  };

  Game.prototype.construirSable = function (forma) {
    const s = this.s, rng = this.rng;
    if (!s.kyber) { this.log('Sin cristal no hay sable.', 'mal'); return; }
    const k = s.kyber;
    s.forma = forma || s.forma || rng.pick(SW.FORMAS_SABLE);
    s.sable = { color: k.c, hex: k.hex, forma: s.forma };
    this.log('Construyes tu sable de luz: hoja <b>' + k.c + '</b>, forma ' + s.sable.forma + '.', 'bien');
    this.hito('Construye un sable de luz ' + k.c);
    this.popup({
      tipo: 'sable', titulo: 'SABLE DE LUZ', nombre: 'sable de hoja ' + k.c,
      sprite: 'sable', color: k.hex, desc: k.s + ' Forma de combate: ' + s.sable.forma + '.',
      stats: ['+16 ataque', '+6 defensa', 'permite duelos de sable']
    });
  };

  /* ---------------- Asuntos pendientes y mercancía ---------------- */
  Game.prototype.añadirPendiente = function (txt) {
    const s = this.s;
    s.pendientes.push({ mundo: s.mundo, txt: txt, edad: s.edad });
    this.log('⚑ Te queda pendiente en ' + s.mundo + ': ' + txt, 'mal');
  };

  Game.prototype.pendientesAqui = function () {
    const s = this.s;
    return s.pendientes.filter(function (p) { return p.mundo === s.mundo; });
  };

  /** Precio al que se vende tu carga en un mundo concreto */
  Game.prototype.valorCargaEn = function (mundo) {
    const s = this.s;
    if (!s.carga) return 0;
    const m = SW.mundo(mundo);
    const origen = SW.mundo(s.carga.origen);
    const saltos = SW.saltosEntre(s.carga.origen, mundo);
    // lejos y a un mundo rico se paga mejor; lo ilegal cotiza donde no hay ley
    let factor = 1 + saltos * 0.055 + (m.riq - origen.riq) * 0.04;
    if (s.carga.ilegal) factor += (9 - m.ley) * 0.035;
    else factor -= Math.max(0, (5 - m.ley)) * 0.02;
    /* Vender es negociar: quien cae bien y tiene nombre saca más por lo
       mismo. Con lo ilegal manda la notoriedad, que ahí es currículum. */
    factor += (s.stats.carisma - 50) / 420;
    factor += ((s.carga.ilegal ? s.stats.notoriedad : s.stats.reputacion) - 40) / 600;
    // el tasador sabe lo que vale todo en cuatro sectores
    if (SW.aporteDe) factor += SW.aporteDe(s, 'tasador') * 0.22;
    return Math.round(s.carga.coste * U.clamp(factor, 0.4, 2.1));
  };

  Game.prototype.comprarCarga = function (tipo) {
    const s = this.s;
    if (s.carga) { this.log('Ya llevas ' + s.carga.n + ' en la bodega.', 'mal'); return; }
    if (s.stats.creditos < tipo.coste) { this.log('No te llega.', 'mal'); return; }
    s.stats.creditos -= tipo.coste;
    s.carga = { n: tipo.n, coste: tipo.coste, ilegal: !!tipo.ilegal, origen: s.mundo, edad: s.edad };
    this.log('Cargas <b>' + tipo.n + '</b> por ' + U.cr(tipo.coste) + '. Ahora hay que colocarlo lejos.', 'cr');
  };

  Game.prototype.venderCarga = function () {
    const s = this.s;
    if (!s.carga) return;
    const v = this.valorCargaEn(s.mundo);
    const dif = v - s.carga.coste;
    s.stats.creditos += v;
    this.log('Vendes ' + s.carga.n + ' en ' + s.mundo + ' por ' + U.cr(v) +
      ' <span class="' + (dif >= 0 ? 'l-bien' : 'l-mal') + '">(' + (dif >= 0 ? '+' : '') + U.cr(dif) + ')</span>.', 'cr');
    if (s.carga.ilegal) this.aplicarFx({ notoriedad: 6 }, {});
    s.carga = null;
  };

  /* ---------------- Movimiento ---------------- */
  Game.prototype.mover = function (destino, motivo) {
    const s = this.s, rng = this.rng;
    // a Exegol o a Dagobah no se muda uno por casualidad: hay que ir a propósito
    const d = destino || (SW.mundoAleatorioNormal
      ? SW.mundoAleatorioNormal(rng, s.mundo, s.era)
      : rng.pick(SW.MUNDO_NOMBRES.filter(function (m) { return m !== s.mundo; })));
    if (d === s.mundo) { this.log('Te quedas en ' + s.mundo + '.', 'viaje'); return; }
    // un destino que no existe en la tabla dejaría el mundo en un
    // nombre inventado y todos los textos saldrían con el hueco sin rellenar
    if (!SW.mundo(d)) { this.log('No hay forma de llegar allí.', 'mal'); return; }
    /* Y un destino que en esta época ya no existe tampoco vale: nadie se
       muda a Alderaan en el 40 DBY. */
    if (SW.mundoViable && !SW.mundoViable(d, s.era)) {
      const caido = (SW.MUNDOS_CAIDOS || {})[d];
      this.log(caido ? caido.txt : 'Allí ya no queda nada a donde llegar.', 'mal');
      const alt = SW.refugioDe ? SW.refugioDe(rng, d) : this.mundoCercano();
      if (!alt || alt === d || !SW.mundo(alt) || !SW.mundoViable(alt, s.era)) return;
      this.log('Acabas en ' + alt + ', que es lo más cerca que se puede llegar.', 'res');
      return this.mover(alt, motivo);
    }
    const m = SW.mundo(d);
    const anterior = s.mundo;
    s.mundo = d;
    if (s.mundosVistos.indexOf(d) < 0) {
      s.mundosVistos.push(d);
      s.contadores.mundosVisitados = s.mundosVistos.length;
    }
    // lo que dejas atrás
    const dejados = s.pendientes.filter(function (x) { return x.mundo === anterior; });
    if (dejados.length) {
      this.log('Dejas sin resolver en ' + anterior + ': ' + dejados.map(function (x) { return x.txt; }).join('; ') + '.', 'mal');
      this.aplicarFx({ reputacion: -4 * dejados.length, cordura: -3 }, {});
      s.pendientes = s.pendientes.filter(function (x) { return x.mundo !== anterior; });
    }
    if (s.buscado > 0) {
      const antes = s.buscado;
      s.buscado = Math.max(0, s.buscado - 45);
      this.log('Cambiar de sistema despista a quien te buscaba' + (s.buscado > 0 ? ', pero no del todo' : '') + '.', s.buscado > 0 ? 'res' : 'bien');
      if (antes >= 45) this.aplicarFx({ notoriedad: -6 }, {});
    }

    const dato = SW.datoMundo ? SW.datoMundo(d) : null;
    this.log('✈ ' + anterior + ' → <b>' + d + '</b> <span class="dim">(' + m.r + ' · ' + m.bio + ')</span>' +
      (motivo ? ' — ' + motivo : '') + '.', 'viaje');
    this.log('<span class="dato">◈ ' + (dato || U.titleCase(m.vibe)) + '</span>', 'dato');
    this.hito('Se traslada a ' + d);
    if (s.carga) {
      const v = this.valorCargaEn(d);
      this.log('En bodega: ' + s.carga.n + '. Aquí lo pagarían a ' + U.cr(v) +
        ' (te costó ' + U.cr(s.carga.coste) + ').', 'cr');
    }
  };

  Game.prototype.chequeoMedico = function () {
    const s = this.s, rng = this.rng;
    if (s.heridas.length) {
      const h = s.heridas[0];
      h.sev = Math.max(0, h.sev - 8);
      h.cronica = false;
      this.log('Te tratan: ' + h.n + ' mejora bastante.', 'bien');
      this.aplicarFx({ creditos: -7000 }, {});
    } else if (rng.chance(0.22 + (100 - s.stats.salud) / 300)) {
      const d = rng.pick(SW.DOLENCIAS);
      this.log('Te detectan ' + d + '. Cogida a tiempo.', 'mal');
      this.herir(d, rng.int(6, 14));
      this.aplicarFx({ creditos: -6000, cordura: -3 }, {});
    } else {
      this.log('Todo en orden. El médico parece decepcionado.', 'bien');
      this.aplicarFx({ cordura: 5 }, {});
    }
    clampStats(s);
  };

  /* ============================================================
     COMBATE TÁCTICO
     El enemigo elige postura y la telegrafía. Leerle es la clave:
     Agresivo > Finta   ·   Defensa > Embestida   ·   Astuta > Guardia
     ============================================================ */
  const POSTURAS = {
    embestida: { n: 'embestida', tell: 'Carga el peso adelante y aprieta los dientes.', pierdeAnte: 'defensa' },
    guardia:   { n: 'guardia',   tell: 'Retrocede medio paso y se cubre.',              pierdeAnte: 'astuta' },
    finta:     { n: 'finta',     tell: 'Te mira las manos, no los ojos.',               pierdeAnte: 'agresivo' }
  };

  Game.prototype.poderCombate = function () {
    const s = this.s;
    const eq = SW.bonosEquipo(s);
    let p = s.stats.destreza * 0.55 + s.stats.fisico * 0.35 +
      (s.sensible ? s.stats.fuerza * 0.3 : 0) +
      (s.habilidades.indexOf('luchador') >= 0 ? 9 : 0) +
      (s.habilidades.indexOf('tirador') >= 0 ? 7 : 0) +
      s.cibernetica.length * 4 +
      eq.atk * 0.8 + eq.precision * 0.4;
    // pelear con las manos desnudas contra alguien armado se nota
    if (!SW.armaDeMano(s)) p -= 14;
    return p;
  };

  /* ------------------------------------------------------------
     LA VENTAJA DEL SABLE
     Medido antes de esto: el mismo personaje ganaba el 53% de las
     peleas con las manos vacías y el 56% con un sable de luz. Tres
     puntos. El arma entraba sólo en la probabilidad de acertar
     —(poder - dificultad) / 170— y el daño estaba en rangos fijos
     iguales para todos, así que daba igual con qué pegaras.

     Un sable contra alguien que no lo tiene no es un arma mejor: es
     otra categoría de pelea. Corta la guardia, corta el arma y desvía
     lo que le disparen. Pero contra un nombre grande —un mandaloriano
     con beskar, un cazador de leyenda, cualquiera que haya visto
     antes uno— la ventaja se cae: esa gente sabe exactamente a qué se
     enfrenta. Y contra otro sable no hay ventaja ninguna: eso es un
     duelo y tiene su propio minijuego.
     ------------------------------------------------------------ */
  SW.ventajaSable = function (s, cfg) {
    if (!s.sable) return 0;
    cfg = cfg || {};
    if (cfg.sable || cfg.canon || cfg.rival === 'leyenda') return 0;
    const dif = cfg.dif == null ? 50 : cfg.dif;
    return U.clamp((85 - dif) / 40, 0, 1);
  };

  /** Reducción de daño por armadura y prótesis */
  Game.prototype.defensa = function () {
    const eq = SW.bonosEquipo(this.s);
    return eq.def;
  };

  Game.prototype.iniciarCombate = function (cfg) {
    const s = this.s;
    cfg = cfg || {};
    if (cfg.pistolas && !SW.tieneArmaFuego(s)) {
      this.log('Un duelo de blásters sin bláster no es un duelo: es un suicidio. Te retiras entre risas.', 'mal');
      this.aplicarFx({ reputacion: -8, cordura: -5 }, {});
      return;
    }
    if (cfg.sable && !s.sable) {
      this.log('No tienes sable. No hay duelo posible.', 'mal');
      return;
    }
    if (!SW.armaDeMano(s)) this.log('Peleas con lo puesto: sin arma, todo cuesta más.', 'mal');

    /* Una pelea de bar tenía la misma dificultad con quince años que con
       cuarenta, y la mitad de las vidas se acababan antes de los treinta.
       Los encontronazos corrientes se ajustan a lo que eres; los duelos,
       las leyendas y lo que va a muerte no se tocan: eso es lo que da
       miedo precisamente porque no se adapta. */
    if (!cfg.canon && !cfg.aMuerte && !cfg.duelo && !cfg.contrato) {
      const poder = this.poderCombate();
      const techo = Math.round(poder + 22);
      const suelo = Math.round(poder - 18);
      const d0 = cfg.dif == null ? 50 : cfg.dif;
      cfg.dif = U.clamp(d0, Math.min(d0, suelo), Math.max(20, techo));
      cfg.ajustado = cfg.dif !== d0;
    }

    this.escena = {
      tipo: 'combate',
      cfg: cfg || {},
      ronda: 1,
      maxRondas: 5,
      // duelo de sables: solo si los dos llevan uno. Cambia el tono y el riesgo.
      sables: !!(cfg && cfg.sable && this.s.sable),
      // el rival duro AGUANTA más y PEGA más: antes todos tenían 100 de vida
      hpEnemigo: Math.round(80 + ((cfg && cfg.dif) || 50) * 0.85),
      hpMaxEnemigo: Math.round(80 + ((cfg && cfg.dif) || 50) * 0.85),
      golpe: 0.8 + ((cfg && cfg.dif) || 50) / 145,
      aguante: 100,
      poder: this.poderCombate(),
      dif: (cfg && cfg.dif) || 50,
      ventajaSable: SW.ventajaSable(this.s, cfg),
      postura: this.rng.pick(['embestida', 'guardia', 'finta'])
    };
    this.cola.unshift(this.escenaCombateEvento());
  };

  Game.prototype.escenaCombateEvento = function () {
    const e = this.escena, s = this.s;
    const desc = e.sables ? 'DUELO DE SABLES' : (e.cfg.duelo ? 'DUELO' : (e.cfg.bestia ? 'BESTIA' : 'COMBATE'));
    const barra = function (v) {
      const n = U.clamp(Math.round(v / 10), 0, 10);
      return '█'.repeat(n) + '░'.repeat(10 - n);
    };
    // El rival duro tiene más de 100 puntos de vida. Mostrarlos crudos
    // hacía creer que no le hacías nada ("140%" → le pegas → "90%").
    // Se enseña siempre sobre su propio total.
    const pctRival = U.clamp((e.hpEnemigo / (e.hpMaxEnemigo || 100)) * 100, 0, 100);
    const dureza = e.hpMaxEnemigo > 120 ? ' <i class="dim">(aguanta mucho)</i>' : '';
    const p = POSTURAS[e.postura];
    const c = [
      { t: '⚔ Ataque agresivo', tactica: 'agresivo', sub: 'Rompe fintas. Se estrella contra la defensa. Gasta aguante.' },
      { t: '⛨ Defensa y contra', tactica: 'defensa', sub: 'Castiga embestidas. Poco daño contra el resto.' },
      { t: '↯ Maniobra astuta', tactica: 'astuta', sub: 'Abre guardias. Depende del intelecto.' },
      { t: '✦ Usar la Fuerza', tactica: 'fuerza', sub: 'Ignora la postura, pero cansa.', req: function (st) { return st.sensible && st.stats.fuerza > 20; } },
      e.sables
        ? { t: '⚔⚔ Cruzar hojas', tactica: 'minijuego',
            sub: e.cfg.vader === 2 ? 'Lo único que le hace daño. Lee la línea y para al filo.'
                                   : 'Intercambio de verdad: lee por dónde entra y para al filo.' }
        : { t: '⚡ Jugártela', tactica: 'minijuego', sub: 'Todo a una jugada. Reflejos puros.' },
      { t: '⚑ Retirarte', tactica: 'huir', sub: 'Vivir para contarlo.' }
    ];
    return this.prepararGen({
      id: 'escena_combate', gen: true,
      t: '<span class="scene-tag">' + desc + ' · ASALTO ' + e.ronda + '/' + e.maxRondas + '</span>' +
         '<div class="hp"><span>Rival</span><code>[' + barra(pctRival) + ']</code> ' + Math.round(pctRival) + '%' + dureza + '</div>' +
         '<div class="hp"><span>Tú</span><code>[' + barra(s.stats.salud) + ']</code> ' + s.stats.salud + '%</div>' +
         '<div class="hp"><span>Aguante</span><code>[' + barra(e.aguante) + ']</code> ' + Math.round(e.aguante) + '%</div>' +
         '<p class="tell">' + p.tell + '</p>',
      c: c
    });
  };

  /** matriz: devuelve 1 si ganas el intercambio, -1 si lo pierdes, 0 neutro */
  function duelo(tac, postura) {
    if (tac === 'agresivo' && postura === 'finta') return 1;
    if (tac === 'agresivo' && postura === 'guardia') return -1;
    if (tac === 'defensa' && postura === 'embestida') return 1;
    if (tac === 'defensa' && postura === 'finta') return -1;
    if (tac === 'astuta' && postura === 'guardia') return 1;
    if (tac === 'astuta' && postura === 'embestida') return -1;
    return 0;
  }

  Game.prototype.resolverTactica = function (tac) {
    const e = this.escena, s = this.s, rng = this.rng;
    if (!e) return;

    if (tac === 'huir') {
      const p = U.clamp(0.45 + (s.stats.destreza - e.dif) / 180 + (e.aguante - 50) / 300, 0.12, 0.88);
      if (rng.chance(p)) {
        this.log('Te retiras a tiempo. Sin gloria, con vida.', 'res');
      } else {
        this.log('No consigues salir. Te alcanzan en la espalda.', 'mal');
        this.aplicarFx({ salud: -Math.round(14 + e.dif / 3), cordura: -8, reputacion: -5 }, {});
        this.herir('herida en la espalda', Math.round(6 + e.dif / 8), false);
        if (s.stats.salud <= 0 && !s.muerto) { this.morir('Le alcanzaron mientras huía.'); return; }
      }
      this.escena = null;
      if (e.cfg.huirFatal) { this.morir(e.cfg.huirFatal); return; }
      this.reanudarCadena();
      return;
    }

    if (tac === 'minijuego') {
      this.cola.unshift(this.prepararGen(this.eventoMinijuego()));
      return;
    }

    const ventaja = duelo(tac, e.postura);
    let dmg = 0, recib = 0, coste = 0, txt = '';
    /* Segunda fase de Vader: no cae a golpes. La táctica corriente sólo
       sirve para no morir; para hacerle algo hay que cruzar hojas. */
    const vader2 = e.cfg.vader === 2;
    const skill = e.poder, dif = e.dif;
    const cansado = e.aguante < 35 ? 0.5 : (e.aguante < 65 ? 0.78 : 1);
    // sin aire encajas peor, y un rival duro pega más fuerte siempre
    const expuesto = (e.aguante < 28 ? 1.35 : 1) * (e.golpe || 1);

    if (tac === 'agresivo') {
      coste = 34;
      const base = U.clamp(0.44 + (skill - dif) / 170, 0.12, 0.88) * cansado;
      const ok = rng.chance(base + ventaja * 0.28);
      dmg = ok ? rng.int(26, 42) * (ventaja > 0 ? 1.5 : 1) : rng.int(2, 8);
      recib = (ok ? rng.int(3, 9) : rng.int(12, 22) * (ventaja < 0 ? 1.5 : 1)) * expuesto;
      txt = ventaja > 0 ? 'Su finta no llega a nada: entras por el hueco.'
          : ventaja < 0 ? 'Te lanzas contra una guardia cerrada. Mal negocio.'
          : (ok ? 'Entras fuerte y conectas.' : 'Fallas la entrada y te castigan.');
    } else if (tac === 'defensa') {
      coste = 8;
      const base = U.clamp(0.58 + (skill - dif) / 210, 0.28, 0.9) * cansado;
      const ok = rng.chance(base + ventaja * 0.25);
      dmg = ok ? rng.int(12, 24) * (ventaja > 0 ? 1.8 : 1) : rng.int(2, 6);
      recib = (ok ? rng.int(0, 4) : rng.int(8, 15) * (ventaja < 0 ? 1.4 : 1)) * expuesto;
      txt = ventaja > 0 ? 'Le dejas venir y la embestida se come tu contra.'
          : ventaja < 0 ? 'Cubres donde no era: la finta entra limpia.'
          : (ok ? 'Aguantas y devuelves en el hueco.' : 'La defensa cede un poco.');
    } else if (tac === 'astuta') {
      coste = 14;
      const base = U.clamp(0.34 + (s.stats.intelecto - dif) / 140, 0.1, 0.86) * cansado;
      const ok = rng.chance(base + ventaja * 0.3);
      dmg = ok ? rng.int(28, 46) * (ventaja > 0 ? 1.6 : 1) : rng.int(0, 5);
      recib = (ok ? rng.int(0, 5) : rng.int(10, 20) * (ventaja < 0 ? 1.5 : 1)) * expuesto;
      txt = ventaja > 0 ? 'Se ha cerrado tanto que no ve venir el entorno. Funciona.'
          : ventaja < 0 ? 'Te pones creativo mientras te embisten. Error.'
          : (ok ? 'Usas el terreno. Funciona de maravilla.' : 'La idea era buena sobre el papel.');
    } else if (tac === 'fuerza') {
      coste = 22;
      const ok = rng.chance(U.clamp(0.4 + (s.stats.fuerza - dif) / 150, 0.1, 0.92) * cansado);
      dmg = ok ? rng.int(34, 58) : rng.int(0, 8);
      recib = (ok ? rng.int(0, 4) : rng.int(9, 18)) * expuesto;
      txt = ok ? 'La Fuerza fluye y el resultado no admite discusión.' : 'La conexión se rompe en el peor momento.';
      if (ok && s.stats.alineamiento < -30) s.stats.cordura -= 2;
    }

    /* El sable contra quien no lo tiene: corta lo que le pongan
       delante y desvía lo que le tiren. */
    const vs = e.ventajaSable || 0;
    if (vs > 0) {
      dmg *= 1 + 0.85 * vs;
      recib *= 1 - 0.40 * vs;
      if (dmg > 0 && this.rng.chance(0.22 * vs)) {
        txt += ' <span class="dim">Le partes el arma por la mitad.</span>';
        e.dif = Math.max(15, e.dif - 6);
      }
    }

    if (vader2) {
      dmg *= 0.2;
      if (this.rng.chance(0.5)) txt = 'Le pegas. Es como pegarle a una puerta blindada que además contesta.';
    }

    e.aguante = U.clamp(e.aguante - coste + 6, 0, 100);
    e.hpEnemigo -= dmg;
    if (recib > 0) this.aplicarFx({ salud: -recib }, {});
    this.log(txt + ' <span class="dim">(le haces ' + Math.round(dmg) + ', recibes ' + Math.round(recib) + ')</span>',
      dmg > recib ? 'bien' : 'mal');

    this.siguienteAsalto();
  };

  Game.prototype.siguienteAsalto = function () {
    const e = this.escena, s = this.s;
    if (!e) return;
    if (s.stats.salud <= 0) { this.morir(e.cfg.duelo ? 'Cae en un duelo.' : 'Cae en combate.'); this.escena = null; return; }
    if (e.hpEnemigo <= 0) { this.finCombate(true); return; }
    e.ronda++;
    if (e.ronda > e.maxRondas) { this.finCombate(e.hpEnemigo < e.hpMaxEnemigo * 0.18); return; }
    // el rival cambia de postura, con tendencia a repetir lo que le funciona
    e.postura = this.rng.pick(['embestida', 'guardia', 'finta']);
    this.cola.unshift(this.escenaCombateEvento());
  };

  /* --- minijuego de reflejos dentro del combate --- */
  Game.prototype.eventoMinijuego = function () {
    const s = this.s;
    /* Si los dos llevan sable, esto no es «pulsa cuando pase la barra»:
       es un intercambio de golpes en el que hay que leer la línea de
       ataque y responder con la parada correcta, y donde tu forma de
       combate cambia el margen, el número de asaltos y lo que devuelves. */
    if (this.escena && this.escena.sables) {
      const f = SW.formaDuelo ? SW.formaDuelo(s.forma) : null;
      return {
        id: 'escena_duelo', gen: true,
        t: '<span class="scene-tag">DUELO DE SABLES</span>' +
           '<p>Lee de dónde viene el golpe y para ahí. Si fallas, entra.</p>' +
           (f ? '<p class="dim">Forma ' + f.n + ' — ' + f.d + '</p>' : ''),
        minijuego: 'sable',
        dificultad: U.clamp(this.escena.dif || 50, 20, 99),
        forma: s.forma || 'Shii-Cho',
        pericia: Math.round(s.stats.destreza * 0.5 + (s.sensible ? s.stats.fuerza * 0.5 : 0) +
          (s.habilidades.indexOf('duelista') >= 0 ? 14 : 0)),
        rival: this.escena.cfg && this.escena.cfg.canon ? 'leyenda' : null,
        fase: this.escena.cfg && this.escena.cfg.faseVader ? this.escena.cfg.faseVader : 0,
        c: [{ t: 'Volver a la táctica normal', tactica: 'cancelar' }]
      };
    }
    // con sable se para el filo; con bláster se desenfunda; sin nada, reflejos a pelo
    const modo = s.sable ? 'filo' : (SW.tieneArmaFuego(s) ? 'desenfundar' : 'filo');
    return {
      id: 'escena_minijuego', gen: true,
      t: '<span class="scene-tag">TE LA JUEGAS</span>' +
         (modo === 'desenfundar'
           ? '<p>Las manos quietas. Cuando la señal cambie, dispara. Ni un instante antes.</p>'
           : '<p>El filo va y viene. Golpea cuando cruce el punto ciego de su guardia.</p>'),
      minijuego: modo,
      dificultad: U.clamp(this.escena ? this.escena.dif : 50, 20, 98),
      pericia: Math.round(s.stats.destreza * 0.6 + (s.sensible ? s.stats.fuerza * 0.4 : 0) +
        (s.habilidades.indexOf('tirador') >= 0 ? 12 : 0) + (s.habilidades.indexOf('duelista') >= 0 ? 12 : 0)),
      rival: this.escena && this.escena.cfg.canon ? 'leyenda' : null,
      c: [{ t: 'Volver a la táctica normal', tactica: 'cancelar' }]
    };
  };

  /* --- reto de concentración: un minijuego fuera del combate ---
     Lo usan las misiones de la Orden. No hay a quién pegar: hay que
     acertar la secuencia que la Fuerza te enseña. */
  Game.prototype.retoFuerza = function (cfg) {
    const s = this.s;
    this.reto = cfg;
    this.cola.unshift(this.prepararGen({
      id: 'reto_fuerza', gen: true,
      t: '<span class="scene-tag">CONCENTRACIÓN</span><p>' +
         (cfg.txt || 'Cierra los ojos. Durante un instante la Fuerza te enseña el orden de las cosas. Repítelo.') + '</p>',
      minijuego: 'fuerza',
      dificultad: U.clamp(cfg.dif || 50, 15, 98),
      pericia: Math.round(s.stats.fuerza * 0.6 + s.stats.intelecto * 0.3 + s.stats.cordura * 0.1),
      c: [{ t: 'No fiarte de la Fuerza y hacerlo a ojo', retoSalta: true }]
    }));
    this.fase = 'evento';
  };

  /* --- duelo suelto: cruzar hojas sin que haya barra de vida ---
     Lo usan la Purga y las cacerías: no se trata de tumbar a nadie,
     sino de salir vivo del intercambio. El resultado entra por la
     misma puerta que los retos de concentración. */
  Game.prototype.retoDuelo = function (cfg) {
    const s = this.s;
    this.reto = cfg;
    const f = SW.formaDuelo ? SW.formaDuelo(s.forma) : null;
    this.cola.unshift(this.prepararGen({
      id: cfg.id || 'reto_duelo', gen: true,
      t: '<span class="scene-tag">' + (cfg.tag || 'HOJA CONTRA FUEGO') + '</span>' +
         '<p>' + (cfg.txt || 'Lee de dónde viene y responde en esa línea.') + '</p>' +
         (f ? '<p class="dim">Forma ' + f.num + ' · ' + f.n + ' — ' + f.d + '</p>' : ''),
      minijuego: 'sable',
      modo: cfg.modo || 'desvio',
      dificultad: U.clamp(cfg.dif || 60, 15, 99),
      forma: s.forma || (s.sable && s.sable.forma) || 'Shii-Cho',
      pericia: Math.round(s.stats.destreza * 0.5 + (s.sensible ? s.stats.fuerza * 0.5 : 0) +
        (s.habilidades.indexOf('duelista') >= 0 ? 14 : 0)),
      fase: cfg.fase || 0,
      rival: cfg.rival || null,
      asaltos: cfg.asaltos || 0,
      c: cfg.c || [{ t: 'Bajar la hoja y aceptar lo que venga', retoSalta: true }]
    }));
    this.fase = 'evento';
  };

  /** llamado por la interfaz con el resultado del minijuego */
  Game.prototype.resolverMinijuego = function (grado) {
    const e = this.escena, s = this.s, rng = this.rng;
    // los retos de concentración no viven dentro de un combate
    if (this.reto) {
      const r = this.reto;
      this.reto = null;
      this.duelo = null;
      const nodo = grado >= 2 ? (r.critico || r.bien)
                 : grado === 1 ? r.bien
                 : grado === 0 ? (r.medio || r.mal) : r.mal;
      if (nodo) { this.cambios = {}; this.aplicarNodo(nodo, {}, null, false); this.volcarCambios(); }
      if (grado >= 1 && !r.sinPremio) this.aplicarFx({ fuerza: grado === 2 ? 6 : 3 }, {});
      else if (grado < 0 && !r.sinPremio) this.aplicarFx({ cordura: -5 }, {});
      clampStats(this.s);
      // un reto también puede empujar la escena siguiente del mismo año
      if (nodo) this.encadenar(nodo);
      if (r.despues && !this.s.muerto) this.encadenar({ cadena: r.despues });
      if (!this.cola.length && !this.s.muerto) this.fase = 'menu';
      return;
    }
    if (!e) return;

    // si el minijuego era el disparo de aturdimiento de una caza,
    // el grado decide si te lo llevas vivo o se lía
    if (e.capturaCaza && s.contrato) {
      this.escena = null;
      if (grado >= 1) {
        this.log('Disparo limpio. Cae sin enterarse.', 'bien');
        s.contrato.estado = 'vivo'; s.contrato.fase = 'entrega';
        this.aplicarFx({ destreza: 6 }, {});
      } else if (grado === 0) {
        this.log('Le rozas. Reacciona.', 'mal');
        s.contrato.estado = 'vivo'; s.contrato.fase = 'entrega';
        this.aplicarFx({ salud: -12 }, {});
      } else {
        this.log('Fallas. Y ahora sabe que estás ahí.', 'mal');
        s.contrato.estado = 'muerto'; s.contrato.fase = 'entrega';
        this.iniciarCombate({ dif: s.contrato.dif + 10, contrato: true });
      }
      return;
    }
    /* Duelo de sables: el daño no sale de una tabla de cuatro casillas,
       sino de lo que ha pasado intercambio a intercambio y de la forma
       con la que peleas. */
    if (this.duelo) {
      const res = this.duelo;
      this.duelo = null;
      const d = SW.dañoDuelo(this, res);
      e.aguante = U.clamp(e.aguante - (d.forma.coste || 18), 0, 100);
      e.hpEnemigo -= d.dmg;
      if (d.recib > 0) this.aplicarFx({ salud: -d.recib }, {});
      if (d.forma.oscuro && res.perfectas >= 2) {
        this.aplicarFx({ cordura: -3, alineamiento: -3 }, {});
        this.log('Vaapad te devuelve lo que le das. Disfrutas más de lo que deberías.', 'mal');
      }
      const bueno = d.dmg > d.recib;
      this.log((res.fallos === 0 ? 'No te toca ni una vez. ' : '') +
        (res.perfectas >= 3 ? 'Le has leído entero. ' : '') +
        '<span class="dim">(le haces ' + d.dmg + ', recibes ' + d.recib + ')</span>', bueno ? 'bien' : 'mal');
      if (grado >= 2) s.stats.reputacion += 2;
      this.siguienteAsalto();
      return;
    }

    // grado: 2 crítico · 1 bien · 0 flojo · -1 fallo
    let dmg = 0, recib = 0, txt = '';
    const pega = (e.golpe || 1);
    if (grado === 2) { dmg = rng.int(80, 115); recib = 0; txt = 'Perfecto. Ni te ha visto moverte.'; s.stats.reputacion += 3; }
    else if (grado === 1) { dmg = rng.int(40, 62); recib = rng.int(0, 8) * pega; txt = 'Limpio. Suficiente.'; }
    else if (grado === 0) { dmg = rng.int(10, 22); recib = rng.int(16, 30) * pega; txt = 'Los dos acertáis a medias.'; }
    else {
      dmg = 0; recib = rng.int(34, 55) * pega; txt = 'Te precipitas. Y lo pagas entero.';
      // jugártela y fallar puede acabar la pelea de golpe
      if (rng.chance(0.28)) { this.herir('tajo de la jugada fallida', rng.int(12, 24), false); }
    }

    const vsm = e.ventajaSable || 0;
    if (vsm > 0) { dmg *= 1 + 0.85 * vsm; recib *= 1 - 0.40 * vsm; }

    e.aguante = U.clamp(e.aguante - 18, 0, 100);
    e.hpEnemigo -= dmg;
    if (recib > 0) this.aplicarFx({ salud: -recib }, {});
    this.log(txt + ' <span class="dim">(le haces ' + dmg + ', recibes ' + Math.round(recib) + ')</span>', dmg > recib ? 'bien' : 'mal');
    this.siguienteAsalto();
  };

  Game.prototype.finCombate = function (victoria) {
    const e = this.escena, s = this.s;
    if (!e) return;
    /* Algunas peleas no acaban donde acaba la barra de vida: la de
       Vader tiene dos fases y la caza de un jedi tiene un después.
       El gancho puede quedarse con el final entero. */
    if (SW.finCombateExtra && SW.finCombateExtra(this, e, victoria)) return;
    // una misión de la Orden que se resuelve a golpes se cierra aquí
    if (e.cfg.mision && SW.cerrarMision) SW.cerrarMision(this, 'combate', victoria ? 1 : -1);
    if (victoria) {
      if (e.cfg.sableOscuro) this.darSableOscuro();
      // al que cae se le queda el sable: es como se han armado siempre los sith
      if (e.cfg.sableBotin && !s.sable) {
        const oscuro = s.stats.alineamiento < -20;
        s.sable = { color: oscuro ? 'rojo' : 'azul', hex: oscuro ? '#ff3a3a' : '#3ad6ff',
                    forma: s.forma || 'Makashi', sangrado: oscuro };
        this.log('Te quedas con su sable. Hoja <b>' + s.sable.color + '</b>.', oscuro ? 'mal' : 'bien');
        this.hito('Se queda con el sable de su enemigo');
      }
      if (e.cfg.canon) {
        this.log('Has ganado un combate del que se va a hablar.', 'bien');
        this.aplicarFx({ reputacion: 15, notoriedad: 15 }, {});
        this.hito('Vence a alguien de leyenda');
        // ganar a una leyenda deja secuelas: alguien vendrá a preguntar
        if (SW.marcarCanon) SW.marcarCanon(this, e.cfg.canon, e.cfg.aMuerte ? 'muerto' : 'vencido');
      }
      const botin = e.cfg.botin || 0;
      if (botin) { s.stats.creditos += botin; this.log('Victoria. Cobras ' + U.cr(botin) + '.', 'cr'); }
      else this.log('Victoria.', 'bien');
      this.aplicarFx({ destreza: 3, fisico: 2, reputacion: 4, notoriedad: e.cfg.contrato ? 6 : 3 }, {});
      if (e.cfg.contrato) s.contadores.cazas = (s.contadores.cazas || 0) + 1;
      if (e.cfg.frente && s.pendienteMedalla && SW.darMedalla) SW.darMedalla(this);
      s.pendienteMedalla = false;
      if (e.cfg.duelo) { s.contadores.duelos = (s.contadores.duelos || 0) + 1; this.hito('Gana un duelo'); }
    } else {
      const hp = e.hpEnemigo;
      this.escena = null;
      if (SW.consecuenciaDerrota) { SW.consecuenciaDerrota(this, e.cfg, hp); this.reanudarCadena(); return; }
      this.log('El enemigo aguanta más que tú. Te retiras maltrecho.', 'mal');
      this.aplicarFx({ salud: -10, cordura: -6, reputacion: -4 }, {});
    }
    this.escena = null;
    if (this.s.stats.salud <= 0 && !this.s.muerto) this.morir('Heridas de combate.');
    this.reanudarCadena();
  };

  /* ---------------- Combate espacial ---------------- */
  Game.prototype.iniciarDogfight = function (cfg) {
    const s = this.s;
    if (!s.nave) { this.log('No tienes nave. Ves el combate desde tierra.', 'res'); return; }
    this.escena = {
      tipo: 'dogfight', cfg: cfg || {}, ronda: 1, maxRondas: 4,
      hpEnemigo: 100,
      hpMaxEnemigo: 100,
      dif: (cfg && cfg.dif) || 50,
      postura: this.rng.pick(['embestida', 'guardia', 'finta']),
      poder: s.stats.destreza * 0.5 + s.nave.vel * 4 + s.nave.arm * 4 +
        (s.habilidades.indexOf('piloto') >= 0 ? 12 : 0) + (s.naveEstado - 60) / 3 +
        // torretas tripuladas: alguien disparando mientras tú vuelas
        (SW.aporteDe ? SW.aporteDe(s, 'artillero') * 22 + SW.aporteDe(s, 'piloto') * 14 : 0)
    };
    this.cola.unshift(this.escenaDogfightEvento());
  };

  Game.prototype.escenaDogfightEvento = function () {
    const e = this.escena, s = this.s;
    const barra = function (v) {
      const n = U.clamp(Math.round(v / 10), 0, 10);
      return '█'.repeat(n) + '░'.repeat(10 - n);
    };
    // el caza rival también se enseña sobre su propio total
    const pctRival = U.clamp((e.hpEnemigo / (e.hpMaxEnemigo || 100)) * 100, 0, 100);
    const dureza = e.hpMaxEnemigo > 120 ? ' <i class="dim">(bien blindado)</i>' : '';
    const tells = {
      embestida: 'Viene de frente, sin desviarse. Quiere el choque.',
      guardia: 'Cierra el giro y se pega a la chatarra. Espera.',
      finta: 'Amaga a estribor. No se lo cree ni él.'
    };
    return this.prepararGen({
      id: 'escena_dogfight', gen: true,
      t: '<span class="scene-tag">COMBATE ESPACIAL · PASADA ' + e.ronda + '/' + e.maxRondas + '</span>' +
         '<div class="hp"><span>Rival</span><code>[' + barra(pctRival) + ']</code> ' + Math.round(pctRival) + '%' + dureza + '</div>' +
         '<div class="hp"><span>Casco</span><code>[' + barra(s.naveEstado) + ']</code> ' + s.naveEstado + '%</div>' +
         '<p class="tell">' + tells[e.postura] + '</p>',
      c: [
        { t: '⤢ Persecución cerrada', tacticaN: 'agresivo', sub: 'Directo a su cola. Castiga fintas.' },
        { t: '⟲ Frenar y dejarle pasar', tacticaN: 'defensa', sub: 'Castiga a quien viene de frente.' },
        { t: '≈ Meterle en la chatarra', tacticaN: 'astuta', sub: 'Abre a los que se cierran. Riesgo de casco.' },
        { t: '⇥ Salto al hiperespacio', tacticaN: 'huir', sub: 'Abandonar el combate.' }
      ]
    });
  };

  Game.prototype.resolverTacticaNave = function (tac) {
    const e = this.escena, s = this.s, rng = this.rng;
    if (!e) return;

    if (tac === 'huir') {
      if (rng.chance(0.58 + (s.stats.intelecto - e.dif) / 200)) {
        this.log('Coordenadas metidas a tiempo. Desapareces.', 'res');
      } else {
        this.log('Te alcanzan justo antes del salto.', 'mal');
        s.naveEstado = U.clamp(s.naveEstado - 28, 0, 100);
        this.aplicarFx({ salud: -8 }, {});
      }
      this.escena = null;
      return;
    }

    const ventaja = duelo(tac, e.postura);
    let dmg = 0, casco = 0, txt = '';
    const p = e.poder, dif = e.dif;

    if (tac === 'agresivo') {
      const ok = rng.chance(U.clamp(0.48 + (p - dif) / 170, 0.12, 0.88) + ventaja * 0.26);
      dmg = ok ? rng.int(24, 40) * (ventaja > 0 ? 1.5 : 1) : rng.int(3, 9);
      casco = ok ? rng.int(2, 7) : rng.int(12, 24) * (ventaja < 0 ? 1.4 : 1);
      txt = ventaja > 0 ? 'Su amago no engaña a nadie: le pegas la cola.' : ventaja < 0 ? 'Le persigues justo cuando frena. Le pasas por delante.' : 'Pasada firme.';
    } else if (tac === 'defensa') {
      const ok = rng.chance(U.clamp(0.55 + (p - dif) / 200, 0.2, 0.9) + ventaja * 0.26);
      dmg = ok ? rng.int(16, 30) * (ventaja > 0 ? 1.7 : 1) : rng.int(2, 7);
      casco = ok ? rng.int(0, 5) : rng.int(8, 16) * (ventaja < 0 ? 1.4 : 1);
      txt = ventaja > 0 ? 'Frenas, te pasa de largo y se lo comes por detrás.' : ventaja < 0 ? 'Frenas contra alguien que también esperaba. Mal sitio.' : 'Intercambio de disparos medido.';
    } else if (tac === 'astuta') {
      const ok = rng.chance(U.clamp(0.4 + (s.stats.intelecto - dif) / 155, 0.1, 0.88) + ventaja * 0.28);
      dmg = ok ? rng.int(32, 55) * (ventaja > 0 ? 1.5 : 1) : rng.int(0, 6);
      casco = ok ? rng.int(4, 12) : rng.int(16, 32) * (ventaja < 0 ? 1.4 : 1);
      txt = ventaja > 0 ? 'Se había pegado a los restos. Ahí es donde le metes.' : ventaja < 0 ? 'Buscas chatarra mientras te embisten de frente.' : 'Rozas algo grande, pero le tocas.';
    }

    e.hpEnemigo -= dmg;
    s.naveEstado = U.clamp(s.naveEstado - casco, 0, 100);
    this.log(txt + ' <span class="dim">(daño ' + Math.round(dmg) + ', casco −' + Math.round(casco) + ')</span>', dmg > casco ? 'bien' : 'mal');

    if (s.naveEstado <= 0) {
      this.log('Tu nave se parte. Cápsula de escape.', 'mal');
      this.aplicarFx({ salud: -20, cordura: -10 }, {});
      s.nave = null; s.naveNombre = null;
      this.escena = null;
      if (s.stats.salud <= 0) this.morir('Derribado.');
      if (s.rutaPendiente && !s.muerto) { const dd = s.rutaPendiente; s.rutaPendiente = null; this.mover(dd, 'después de pelear por el camino'); }
      return;
    }
    if (e.hpEnemigo <= 0) {
      s.contadores.derribos = (s.contadores.derribos || 0) + 1;
      this.log('Derribado. Uno más para la lista.', 'bien');
      this.aplicarFx({ destreza: 4, reputacion: 5 }, {});
      if (e.cfg.botin) { s.stats.creditos += e.cfg.botin; this.log('Recuperas ' + U.cr(e.cfg.botin) + ' de los restos.', 'cr'); }
      this.escena = null;
      return;
    }
    e.ronda++;
    if (e.ronda > e.maxRondas) { this.log('El enemigo rompe el combate y se marcha.', 'res'); this.escena = null; return; }
    e.postura = rng.pick(['embestida', 'guardia', 'finta']);
    this.cola.unshift(this.escenaDogfightEvento());
  };

  /* ============================================================
     MENÚS
     ============================================================ */
  Game.prototype.menuTienda = function () {
    const s = this.s, rng = this.rng;
    const stock = rng.pickN(SW.OBJETOS, 6);
    const c = stock.map(function (o) {
      const puede = s.stats.creditos >= o.p;
      return {
        t: (puede ? 'Comprar ' : '✕ ') + o.n + ' — ' + U.cr(o.p),
        sub: puede ? o.t : 'no te llega',
        bloqueada: !puede,
        fx: puede ? { creditos: -o.p } : {},
        comprar: puede ? o.n : null
      };
    });
    c.push({ t: 'Ir a la armería', sub: 'armas y protección', armeria: true });
    /* La lonja ya no vive aquí escondida entre las chucherías: tiene
       pestaña propia y exige bodega. Comprar mercancía sin nave era
       comprar algo que no te podías llevar. */
    if (!s.nave) {
      c.push({ t: '✕ Mercancía a granel', bloqueada: true,
        sub: 'hace falta una nave con bodega: se compra en el Hangar' });
    }
    if (s.carga) {
      const v = this.valorCargaEn(s.mundo);
      c.push({ t: 'Vender tu carga: ' + s.carga.n + ' — ' + U.cr(v),
        sub: 'te costó ' + U.cr(s.carga.coste) + (v >= s.carga.coste ? ' · beneficio' : ' · pérdida'),
        venderCarga: true });
    }
    c.push({ t: 'Vender algo tuyo', vender: true });
    c.push({ t: '◂ Salir del mercado sin comprar', volver: true });
    return { id: 'menu_tienda', gen: true, esMenu: true, t: 'MERCADO de ' + s.mundo + ' — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuMercancia = function () {
    const s = this.s, rng = this.rng;
    const m = SW.mundo(s.mundo);
    const catalogo = [
      { n: 'grano y raciones', base: 4000, ilegal: false },
      { n: 'piezas de repuesto', base: 9000, ilegal: false },
      { n: 'medicinas de bacta', base: 18000, ilegal: false },
      { n: 'licor de contrabando', base: 12000, ilegal: true },
      { n: 'especia sin refinar', base: 30000, ilegal: true },
      { n: 'armas sin registrar', base: 26000, ilegal: true },
      { n: 'mineral en bruto', base: 15000, ilegal: false },
      { n: 'reliquias sin procedencia', base: 40000, ilegal: true }
    ];
    const oferta = rng.pickN(catalogo, 4).map(function (x) {
      // donde abunda, sale barato
      const coste = Math.round(x.base * (0.7 + rng.next() * 0.5) * (1 - (m.riq - 5) * 0.03));
      const puede = s.stats.creditos >= coste && !s.carga;
      return {
        t: (puede ? 'Cargar ' : '✕ ') + x.n + ' — ' + U.cr(coste),
        sub: (x.ilegal ? 'ilegal: se paga mejor donde no hay ley' : 'legal, margen corto') +
             (s.carga ? ' · ya llevas carga' : (puede ? '' : ' · no te llega')),
        bloqueada: !puede,
        cargar: puede ? { n: x.n, coste: coste, ilegal: x.ilegal } : null
      };
    });
    oferta.push({ t: '◂ Salir sin cargar nada', volver: true });
    return {
      id: 'menu_mercancia', gen: true, esMenu: true,
      t: 'LONJA de ' + s.mundo + ' <span class="dim">(riqueza ' + m.riq + '/10 · ley ' + m.ley + '/10)</span>. ' +
         'Se compra barato donde sobra y se vende caro donde falta.',
      c: oferta
    };
  };

  Game.prototype.instalarMejora = function (id) {
    const s = this.s;
    const m = (SW.MEJORAS_NAVE || []).filter(function (x) { return x.id === id; })[0];
    if (!m || !s.nave) return;
    s.mejorasNave = s.mejorasNave || [];
    if (s.mejorasNave.indexOf(id) >= 0) return;
    // una por ranura: la nueva sustituye a la vieja salvo en extras
    if (m.cat !== 'extra') {
      s.mejorasNave = s.mejorasNave.filter(function (otro) {
        const o = SW.MEJORAS_NAVE.filter(function (x) { return x.id === otro; })[0];
        return !o || o.cat !== m.cat;
      });
    }
    s.mejorasNave.push(id);
    this.log('Montado en tu nave: ' + m.n + '. ' + m.d, 'bien');
    this.popup({ arte: SW.arteMejora ? SW.arteMejora(m) : 'nave_carguero', titulo: m.n, texto: m.sub });
  };

  /** el hangar ya no vende mejoras: eso es cosa del taller */
  /** alistarse: se ve a qué te apuntas y lo mortal que es cada puesto */
  Game.prototype.menuAlistarse = function () {
    const s = this.s;
    const bando = SW.bandosDeEra ? SW.bandosDeEra(s.era) : null;
    /* No todo el mundo puede ir a todas las guerras. En las Guerras
       Clon el Gran Ejército es de clones: a un civil le queda la
       milicia de su mundo y a un cazarrecompensas con nombre le
       contratan, que es otra cosa y sale en otra escena. */
    const puertas = SW.puestosDeGuerra ? SW.puestosDeGuerra(s)
                                       : { lista: (SW.PUESTOS_GUERRA || []), nota: null };
    if (!puertas.lista.length) {
      return {
        id: 'menu_alistarse', gen: true, esMenu: true,
        t: 'ALISTAMIENTO' + (bando ? ' — ' + bando : '') + '<br>' +
           '<span class="dim">' + (puertas.nota || 'Aquí no hay sitio para ti.') + '</span>',
        c: [{ t: '◂ Dejarlo estar', volver: true }]
      };
    }
    const c = puertas.lista.map(function (p) {
      const riesgo = Math.round((SW.RIESGO_GUERRA[p.id] || 0.15) * 100);
      return Object.assign({
        t: p.n, sub: p.sub + ' · ' + p.aviso + ' (~' + riesgo + '% al año)',
        guerra: true, puesto: p.id, habilidad: p.habilidad
      }, { fx: p.fx });
    });
    c.push({ t: '◂ Pensarlo mejor', volver: true });
    return {
      id: 'menu_alistarse', gen: true, esMenu: true,
      t: 'ALISTAMIENTO' + (puertas.milicia ? ' — MILICIA PLANETARIA' : (bando ? ' — ' + bando : '')) +
         '<br><span class="dim">' + (puertas.nota ? puertas.nota + ' ' : '') +
         'Cada puesto tiene su probabilidad de no volver. Elige sabiendo.</span>',
      c: c
    };
  };

  Game.prototype.menuHangar = function () {
    const s = this.s, rng = this.rng;
    const c = [];
    rng.pickN(SW.NAVES, 4).forEach(function (n) {
      const precio = Math.round(n.p * (0.8 + rng.next() * 0.5));
      const puede = s.stats.creditos >= precio;
      c.push({
        t: (puede ? 'Comprar ' : '✕ ') + n.n + ' — ' + U.cr(precio),
        sub: 'vel ' + n.vel + ' · carga ' + n.carga + ' · armas ' + n.arm + (puede ? '' : ' · no te llega'),
        bloqueada: !puede,
        fx: puede ? { creditos: -precio } : {},
        comprarNave: puede ? n.n : null
      });
    });
    if (s.nave) {
      c.push({ t: '⚙ Abrir el taller', sub: 'Mejoras que cambian lo que puedes hacer', taller: true });
      c.push({ t: 'Vender tu ' + s.nave.n, venderNave: true });
    }
    c.push({ t: '◂ Salir del hangar', volver: true });
    return { id: 'menu_hangar', gen: true, esMenu: true, t: 'HANGAR de ' + s.mundo + ' — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuViaje = function () {
    const s = this.s, rng = this.rng;
    const reg = SW.mundo(s.mundo).r;
    const cerca = SW.MUNDOS.filter(function (m) { return m.r === reg && m.n !== s.mundo; });
    const lejos = SW.MUNDOS.filter(function (m) { return m.r !== reg; });
    const destinos = rng.pickN(cerca, 3).concat(rng.pickN(lejos, 4));
    const c = destinos.map(function (m) {
      const salto = m.r === reg ? 1 : 2.6;
      const coste = Math.round((s.nave ? 400 : 1400) * salto + m.riq * 220);
      const puede = s.stats.creditos >= coste;
      return {
        t: (puede ? '' : '✕ ') + 'Ir a ' + m.n + ' — ' + U.cr(coste) + (m.r === reg ? ' · cerca' : ''),
        sub: m.r + ' · ' + m.bio + ' · ' + m.vibe + (puede ? '' : ' · no te llega'),
        bloqueada: !puede,
        fx: puede ? { creditos: -coste } : {},
        mueveA: puede ? m.n : null,
        motivo: 'por decisión propia'
      };
    });
    c.push({
      t: 'Pagarte el pasaje trabajando en la bodega',
      sub: 'gratis, pero un año duro y sin elegir destino',
      fx: { fisico: 4, cordura: -5, creditos: 600 }, mover: true, motivo: 'trabajando el pasaje'
    });
    c.push({ t: '◂ Quedarte en ' + s.mundo, volver: true });
    return { id: 'menu_viaje', gen: true, esMenu: true, t: 'PUERTO ESTELAR de ' + s.mundo + ' (' + reg + ') — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuFuerza = function () {
    const s = this.s;
    const c = [
      { t: 'Meditar', sub: 'Fuerza y cordura, sin riesgo', fx: { fuerza: 7, cordura: 10 } },
      { t: 'Entrenar poderes activos', sub: 'Aprendes uno nuevo si estás a la altura', fx: { fuerza: 9, salud: -4 }, poder: 'auto' },
      { t: 'Buscar un cristal kyber', req: function (st) { return !st.kyber && st.sensible; }, fx: { fuerza: 5, salud: -6, creditos: -3000 }, kyber: true },
      { t: 'Construir o rehacer tu sable', req: function (st) { return !!st.kyber; }, construirSable: true },
      { t: 'Estudiar textos prohibidos', sub: 'Rápido y caro', fx: { fuerza: 13, alineamiento: -12, cordura: -8 }, poder: 'auto_oscuro' },
      { t: 'Estudiar textos de la Orden', sub: 'Lento y sólido', fx: { fuerza: 9, alineamiento: 10, cordura: 5 }, poder: 'auto_luz' },
      { t: 'Practicar una forma de sable', req: function (st) { return !!st.sable; }, fx: { destreza: 8, fuerza: 5 }, habilidad: 'duelista' },
      { t: 'Ayunar y desconectar', fx: { fuerza: -5, cordura: 15, salud: 5 } },
      { t: '◂ Hoy no', volver: true }
    ];
    return { id: 'menu_fuerza', gen: true, esMenu: true, t: 'LA FUERZA — nivel ' + s.stats.fuerza + ' · alineamiento ' + SW.etiquetaAlineamiento(s.stats.alineamiento), c: c };
  };

  Game.prototype.menuClinica = function () {
    const s = this.s;
    const c = [];
    if (s.heridas.length) {
      s.heridas.forEach(function (h, i) {
        const precio = 4000 + h.sev * 900;
        const puede = s.stats.creditos >= precio;
        c.push({
          t: (puede ? 'Tratar: ' : '✕ ') + h.n + ' — ' + U.cr(precio),
          sub: '−' + h.sev + ' de salud máxima' + (puede ? '' : ' · no te llega'),
          bloqueada: !puede,
          fx: puede ? { creditos: -precio } : {},
          tratar: puede ? i : null
        });
      });
    } else {
      c.push({ t: 'No tienes heridas abiertas', sub: 'el médico te mira con envidia', fx: { cordura: 3 } });
    }
    c.push({ t: 'Tanque de bacta completo — ' + U.cr(30000), req: function (st) { return st.stats.creditos >= 30000; }, fx: { creditos: -30000, salud: 20 }, curarHeridas: true });
    c.push({ t: '◂ Salir de la clínica', volver: true });
    return { id: 'menu_clinica', gen: true, esMenu: true, t: 'CLÍNICA de ' + s.mundo + ' — tienes ' + U.cr(s.stats.creditos), c: c };
  };

  Game.prototype.menuMatricula = function () {
    const s = this.s;
    const c = SW.ESTUDIOS.filter(function (e) {
      if (e.era && e.era.indexOf(s.era) < 0) return false;
      if (e.req) { for (const k in e.req) if ((s.stats[k] || 0) < e.req[k]) return false; }
      return s.estudios.indexOf(e.n) < 0;
    }).map(function (e) {
      const puede = s.stats.creditos >= e.coste;
      return {
        t: (puede ? '' : '✕ ') + e.n + ' — ' + (e.coste ? U.cr(e.coste) : 'gratis'),
        sub: e.años + ' años de formación' + (puede ? '' : ' · no te llega'),
        bloqueada: !puede,
        estudio: puede ? e.id : null
      };
    });
    c.push({ t: '◂ Ninguno por ahora', volver: true });
    return { id: 'menu_matricula', gen: true, esMenu: true, t: 'PROGRAMAS DE FORMACIÓN disponibles', c: c };
  };

  Game.prototype.menuNombreNave = function () {
    const rng = this.rng;
    const adj = ['Halcón', 'Fantasma', 'Vagabundo', 'Aguja', 'Corsario', 'Sombra', 'Errante', 'Trueno', 'Cuchillo', 'Mendigo', 'Alondra', 'Espolón', 'Cometa', 'Púa'];
    const comp = ['de Corellia', 'Milenario', 'del Borde', 'Oxidado', 'Afortunado', 'de Hierro', 'sin Nombre', 'Rojo', 'Tardío', 'de tu Madre', 'de Ceniza', 'Impagado'];
    const nombres = [];
    for (let i = 0; i < 5; i++) nombres.push(rng.pick(adj) + ' ' + rng.pick(comp));
    return {
      id: 'menu_nave_nombre', gen: true, esMenu: true,
      t: 'Hay que bautizarla. En el Borde dicen que una nave sin nombre no vuelve.',
      c: nombres.map(function (n) { return { t: '"' + n + '"', ponerNombreNave: n }; })
    };
  };

  Game.prototype.menuSable = function () {
    const s = this.s;
    const k = s.kyber;
    const notas = {
      'Shii-Cho': 'La Forma I. Básica, tosca y fiable cuando todo falla.',
      'Makashi': 'La Forma II. Duelo puro, elegante, pensada contra otro sable.',
      'Soresu': 'La Forma III. Defensa cerrada; nadie gana rápido contra ella.',
      'Ataru': 'La Forma IV. Acrobática y agotadora.',
      'Shien/Djem So': 'La Forma V. Devolver el golpe con más fuerza de la que vino.',
      'Niman': 'La Forma VI. Equilibrada, la del diplomático.',
      'Juyo/Vaapad': 'La Forma VII. Al filo del lado oscuro; pocos la controlan.'
    };
    const c = SW.FORMAS_SABLE.filter(function (f) {
      if (f === 'Juyo/Vaapad') return s.stats.fuerza > 55;
      return true;
    }).map(function (f) {
      return { t: f, sub: notas[f] || '', construirForma: f };
    });
    return {
      id: 'menu_sable', gen: true, esMenu: true,
      t: 'Tu cristal es <b>' + (k ? k.c : '—') + '</b>: eso ya está decidido, el cristal eligió por ti. ' +
         'Lo que sí eliges es cómo peleas.',
      c: c.concat([{ t: '◂ Todavía no', volver: true }])
    };
  };

  /* ---------------- Actividades ---------------- */
  Game.prototype.menuActividades = function () {
    const s = this.s;
    const s0 = this.s;
    return SW.ACTIVIDADES.filter(function (a) {
      if (SW.actividadPermitida && SW.actividadPermitida(s0, a.id) === false) return false;
      if (s.edadBio < a.min) return false;
      if (a.req) { try { return a.req(s); } catch (e) { return false; } }
      return true;
    });
  };

  /** Dos o tres situaciones entre las que elegir al abrir una vía. */
  Game.prototype.menuSituaciones = function (posibles, menuId, siempre) {
    const rng = this.rng;
    if (!posibles.length) return null;
    // no en cada apertura: si no, es un peaje. Cuatro de cada diez.
    const cuantas = (posibles.length >= 3 && (siempre || rng.chance(0.4)))
      ? (rng.chance(0.5) ? 3 : 2) : 1;
    if (cuantas <= 1) {
      const ev0 = this.elegirEvento(posibles);
      return this.prepararEvento(ev0);
    }
    const pool = posibles.slice();
    const elegidos = [];
    for (let i = 0; i < cuantas && pool.length; i++) {
      const ev = this.elegirEvento(pool);
      pool.splice(pool.indexOf(ev), 1);
      const inst = this.prepararEvento(ev, true);   // sin marcar todavía
      if (inst) elegidos.push(inst);
    }
    if (!elegidos.length) return null;
    if (elegidos.length === 1) { this.marcarVisto(elegidos[0].id); return elegidos[0]; }

    this._situaciones = elegidos;
    const quitaTags = function (h) { return String(h).replace(/<[^>]+>/g, '').trim(); };
    return this.prepararGen({
      id: 'sit_' + menuId, gen: true, esMenu: true,
      t: '<span class="scene-tag">¿A QUÉ LO DEDICAS?</span>',
      c: elegidos.map(function (x, i) {
        let txt = quitaTags(x.texto);
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);   // abre en mayúscula
        return { t: txt.length > 128 ? txt.slice(0, 126) + '…' : txt, situacion: i };
      }).concat(menuId === 'viaje'
        ? [{ t: '◎ Abrir la carta estelar y marcharte de aquí', viajar: true }]
        : [{ t: '◂ Dejarlo para otro día', volver: true, devuelveAccion: true }])
    });
  };

  Game.prototype.hacerActividad = function (id) {
    const s = this.s, rng = this.rng;
    if (s.acciones <= 0) { this.log('Ya no te queda tiempo este año.', 'res'); return; }
    s.acciones--;
    this.actividadEnCurso = id;
    /* «Viajar» abría el mapa y se acababa ahí, así que las escenas
       escritas para este menú no se veían nunca. Ahora se elige: la
       carta estelar es una opción más, no la única. */
    if (id === 'viaje') {
      const pool = this.eventosPosibles(SW.ACTOS.viaje || []);
      if (pool.length && rng.chance(0.6)) {
        const inst = this.menuSituaciones(pool, 'viaje', true);
        if (inst) { this.cola.push(inst); this.fase = 'evento'; return; }
      }
      this.abrirMapaViaje = true; this.actividadUsada = s.acciones <= 0; this.fase = 'menu'; return;
    }

    // La clínica no compite con eventos: si la pides, se abre la clínica.
    // Antes «Cuerpo y mente» te soltaba cualquier cosa menos curarte.
    if (id === 'clinica') { this.cola.push(this.prepararGen(this.menuClinica())); this.fase = 'evento'; return; }
    // Los bajos fondos se adaptan: un clon en servicio no monta un cártel
    if (id === 'crimen' && SW.actividadPermitida &&
        SW.actividadPermitida(s, 'crimen') === 'limitado' && SW.GEN.crimenLimitado) {
      this.cola.push(this.prepararGen(SW.GEN.crimenLimitado(rng, s)));
      this.fase = 'evento'; return;
    }
    // El gremio y el taller tienen su propia pantalla, no sorteo de eventos
    if (id === 'gremio' && SW.GEN.contratoCaza) {
      const paso = s.contrato && SW.pasoCaza ? SW.pasoCaza(this) : null;
      this.cola.push(this.prepararGen(paso || SW.GEN.contratoCaza(rng, s)));
      this.fase = 'evento'; return;
    }
    if (id === 'taller' && SW.menuTaller && s.nave) {
      this.cola.push(this.prepararGen(SW.menuTaller(this))); this.fase = 'evento'; return;
    }
    if (id === 'senado' && SW.menuPolitica) {
      this.cola.push(this.prepararGen(SW.menuPolitica(this))); this.fase = 'evento'; return;
    }
    if (id === 'oscuro' && SW.menuOscuro) {
      this.cola.push(this.prepararGen(SW.menuOscuro(this))); this.fase = 'evento'; return;
    }
    if (id === 'orden' && SW.menuOrden) {
      const m = SW.menuOrden(this);
      if (m) { this.cola.push(this.prepararGen(m)); this.fase = 'evento'; return; }
    }
    if (id === 'tripulacion' && SW.menuTripulacion) {
      this.cola.push(this.prepararGen(SW.menuTripulacion(this)));
      this.actividadUsada = s.acciones <= 0; this.fase = 'evento'; return;
    }
    if (id === 'negocios' && SW.menuNegocios) {
      this.cola.push(this.prepararGen(SW.menuNegocios(this)));
      this.actividadUsada = s.acciones <= 0; this.fase = 'evento'; return;
    }
    if (id === 'mercancia') {
      this.cola.push(this.prepararGen(SW.menuBodega ? SW.menuBodega(this) : this.menuMercancia()));
      this.actividadUsada = s.acciones <= 0; this.fase = 'evento'; return;
    }
    if (id === 'inquisicion' && SW.menuInquisicion) {
      const m = SW.menuInquisicion(this);
      if (m) { this.cola.push(this.prepararGen(m)); this.fase = 'evento'; }
      this.actividadUsada = s.acciones <= 0; this.fase = this.cola.length ? 'evento' : 'menu';
      return;
    }
    const pool = SW.ACTOS[id] || [];
    let posibles = this.eventosPosibles(pool);
    // si ya has vivido todo lo escrito para esa vía, se genera algo nuevo
    // en vez de repetirte una escena que ya conoces
    if (!posibles.length) {
      const gens = {
        trabajo: 'encargo', formacion: 'dilema', social: 'dilema', crimen: 'contrato',
        nave: 'ruta', accion: 'accion', escuadron: 'mision', politica: 'encargo',
        exploracion: 'encargo', mercado: 'armeria', salud: 'dilema', fuerza: 'dilema'
      };
      const g = s.edadBio >= 14 ? gens[id] : null;   // los generadores son cosa de adultos
      if (g && SW.GEN[g] && rng.chance(0.75)) {
        this.cola.push(this.prepararGen(SW.GEN[g](rng, s)));
        this.actividadUsada = s.acciones <= 0;
        this.fase = 'evento';
        return;
      }
      posibles = this.eventosPosibles(pool, true);
    }
    if (!posibles.length) {
      // nunca dejes al jugador sin nada que decidir
      const gens = { crimen: 'contrato', nave: 'ruta', accion: 'accion', escuadron: 'mision', politica: 'encargo', exploracion: 'encargo' };
      const g = gens[id];
      if (g && SW.GEN[g]) this.cola.push(this.prepararGen(SW.GEN[g](rng, s)));
      else if (id === 'viaje') this.abrirMapaViaje = true;
      else if (id === 'mercado') this.cola.push(this.prepararGen(this.menuTienda()));
      else if (id === 'salud') this.cola.push(this.prepararGen(this.menuClinica()));
      else if (id === 'clinica') this.cola.push(this.prepararGen(this.menuClinica()));
      else if (id === 'senado' && SW.menuPolitica) this.cola.push(this.prepararGen(SW.menuPolitica(this)));
      else if (id === 'oscuro' && SW.menuOscuro) this.cola.push(this.prepararGen(SW.menuOscuro(this)));
      else if (id === 'fuerza') this.cola.push(this.prepararGen(this.menuFuerza()));
      else if (id === 'taller' && SW.menuTaller && s.nave) this.cola.push(this.prepararGen(SW.menuTaller(this)));
      else if (id === 'gremio' && SW.GEN.contratoCaza) {
        // si ya hay contrato en marcha se sigue por donde iba
        const paso = s.contrato && SW.pasoCaza ? SW.pasoCaza(this) : null;
        this.cola.push(this.prepararGen(paso || SW.GEN.contratoCaza(rng, s)));
      }
      else this.cola.push(this.prepararGen(this.rellenoActividad(id)));
    } else {
      /* Antes se sorteaba una situación y punto. Con 30-48 escenas por
         menú y ~17 aperturas por vida, más de la mitad no se veían
         nunca. Ahora se ofrecen dos o tres y eliges tú a qué dedicas
         el rato: se triplica lo que ves y la elección es tuya. */
      const inst = this.menuSituaciones(posibles, id);
      if (inst) this.cola.push(inst);
    }
    this.actividadUsada = s.acciones <= 0;
    this.fase = 'evento';
  };

  /** El jugador ha salido de un menú sin decidir nada: se le devuelve la acción */
  Game.prototype.devolverAccion = function () {
    const s = this.s;
    if (s.acciones < s.accionesMax) s.acciones++;
    this.actividadUsada = false;
    this.cola = [];
    this.escena = null;
    this.fase = 'menu';
  };

  /* Un rato dedicado a algo siempre da para algo, aunque sea pequeño */
  const RELLENO = {
    trabajo: { t: 'No hay nada nuevo en el trabajo, pero el año pasa igual.', c: [
      { t: 'Cumplir el horario sin más', fx: { creditos: 'sueldo*0.1', cordura: 3 }, out: 'Turnos, café y poco más.' },
      { t: 'Aprender de los veteranos', fx: { intelecto: 5, carisma: 3 }, out: 'Te enseñan trucos que no vienen en ningún manual.' },
      { t: 'Hacer horas de más por si acaso', fx: { creditos: 'sueldo*0.25', salud: -4 }, rendimiento: 8, out: 'Nadie lo pide. Alguien lo apunta.' },
      { t: '◂ Dejarlo estar', volver: true }
    ] },
    formacion: { t: 'Nadie te va a enseñar nada esta vez. Te toca a ti.', c: [
      { t: 'Repasar lo que ya sabes hasta clavarlo', fx: { intelecto: 5, destreza: 4 }, out: 'La repetición aburre y funciona.' },
      { t: 'Leer por curiosidad, sin plan', fx: { intelecto: 6, cordura: 4 }, out: 'Cosas inútiles que algún día servirán.' },
      { t: 'Entrenar el cuerpo por tu cuenta', fx: { fisico: 6, salud: 3 }, out: 'Sin gimnasio, sin excusas.' },
      { t: '◂ Otro año', volver: true }
    ] },
    social: { t: 'Nadie te ha llamado. Puedes llamar tú.', c: [
      { t: 'Ver a los tuyos sin motivo', fx: { cordura: 8 }, relTodas: 8, out: 'Una tarde tonta y necesaria.' },
      { t: 'Salir a que te vea gente', fx: { carisma: 5, creditos: -600 }, out: 'Caras nuevas, ninguna importante todavía.' },
      { t: 'Escribir a alguien con quien lo dejaste a medias', fx: { cordura: 6, carisma: 3 }, relTodas: 6, out: 'Contesta. Tarde, pero contesta.' },
      { t: '◂ Estar solo', volver: true }
    ] },
    crimen: { t: 'El barrio está tranquilo. Demasiado.', c: [
      { t: 'Escuchar en las cantinas', fx: { intelecto: 4, notoriedad: 3 }, out: 'Anotas nombres. Se usan más adelante.' },
      { t: 'Trapicheo de poca monta', fx: { creditos: 4000, alineamiento: -5, notoriedad: 4 }, out: 'Poco riesgo, poco beneficio.' },
      { t: '◂ Mantener el perfil bajo', volver: true }
    ] },
    nave: { t: 'Hoy el hangar solo pide mantenimiento.', c: [
      { t: 'Revisar la nave de arriba abajo', req: function (st) { return !!st.nave; }, fx: { intelecto: 4 }, naveEstado: 15, out: 'Aprietas lo que estaba flojo.' },
      { t: 'Trabajar de mecánico para otros', fx: { creditos: 4500, intelecto: 4 }, out: 'Manos negras y algo de dinero.' },
      { t: '◂ Salir del hangar', volver: true }
    ] },
    accion: { t: 'No hay pelea que buscar. Puedes prepararte para la próxima.', c: [
      { t: 'Entrenar tácticas de combate', fx: { destreza: 5, fisico: 4 }, out: 'Solo, contra un muñeco de prácticas.' },
      { t: 'Estudiar cómo pelea la gente de aquí', fx: { intelecto: 5, destreza: 3 }, out: 'Cada mundo tiene sus vicios de guardia.' },
      { t: '◂ Dejarlo', volver: true }
    ] },
    escuadron: { t: 'Semana tranquila en la unidad.', c: [
      { t: 'Mantenimiento de equipo', fx: { intelecto: 4, destreza: 3 }, out: 'Todo limpio, todo revisado.' },
      { t: 'Beber con los tuyos', fx: { cordura: 8 }, relTodas: 10, out: 'Historias repetidas que siguen haciendo gracia.' },
      { t: '◂ Descansar', volver: true }
    ] },
    politica: { t: 'Ningún asunto grande sobre la mesa.', c: [
      { t: 'Cultivar contactos', fx: { carisma: 5, reputacion: 4 }, out: 'Comidas largas y ninguna decisión.' },
      { t: 'Leer expedientes atrasados', fx: { intelecto: 6 }, out: 'Encuentras una cifra que no cuadra.' },
      { t: '◂ Dejarlo pasar', volver: true }
    ] },
    exploracion: { t: 'Los mapas de la zona ya están hechos. Casi todos.', c: [
      { t: 'Revisar cartas viejas buscando huecos', fx: { intelecto: 6 }, out: 'Hay tres sistemas mal catalogados. Interesante.' },
      { t: 'Salir a caminar sin rumbo', fx: { cordura: 8, fisico: 4 }, out: 'No encuentras nada. Vuelves mejor.' },
      { t: '◂ Quedarte', volver: true }
    ] },
    mercado: { t: 'El mercado está flojo hoy.', c: [
      { t: 'Regatear por deporte', fx: { carisma: 5 }, out: 'No compras nada. Aprendes precios.' },
      { t: '◂ Salir', volver: true }
    ] },
    salud: { t: 'Nada que tratar. Puedes cuidarte igual.', c: [
      { t: 'Dormir bien todo un año', fx: { salud: 6, cordura: 8 }, out: 'Suena tonto. Funciona.' },
      { t: 'Comer decente por una vez', fx: { salud: 5, fisico: 3, creditos: -1500 }, out: 'El cuerpo lo agradece.' },
      { t: '◂ Ya me cuidaré', volver: true }
    ] },
    fuerza: { t: 'Silencio. Ni visiones ni maestros.', c: [
      { t: 'Sentarte a escuchar', fx: { fuerza: 5, cordura: 8 }, out: 'Nada habla. También es una respuesta.' },
      { t: '◂ Levantarte', volver: true }
    ] }
  };

  /* Rellenos para cuando el personaje todavía es un crío */
  const RELLENO_CRIO = {
    formacion: { t: 'Nadie te va a enseñar nada hoy. Puedes practicar por tu cuenta.', c: [
      { t: 'Leer todo lo que caiga en tus manos', fx: { intelecto: 5 }, out: 'Manuales viejos y un cuento repetido.' },
      { t: 'Trepar y correr hasta cansarte', fx: { fisico: 5, destreza: 4 }, out: 'Rodillas peladas y buen fondo.' },
      { t: 'Copiar lo que hacen los mayores', fx: { intelecto: 3, carisma: 4 }, out: 'Aprendes gestos antes que motivos.' },
      { t: '◂ Otro día', volver: true }
    ] },
    social: { t: 'Los críos del barrio están fuera.', c: [
      { t: 'Salir a jugar con ellos', fx: { cordura: 8, carisma: 5 }, out: 'Un juego con reglas que cambian cada diez minutos.' },
      { t: 'Quedarte cerca de casa', fx: { cordura: 4, intelecto: 3 }, out: 'Miras desde la puerta.' },
      { t: '◂ Nada', volver: true }
    ] },
    salud: { t: 'Tienes la edad en la que el cuerpo crece solo.', c: [
      { t: 'Comer todo lo que te pongan', fx: { fisico: 5, salud: 4 }, out: 'Creces un palmo en un año.' },
      { t: 'Dormir mucho', fx: { salud: 5, cordura: 5 }, out: 'Doce horas y sin remordimientos.' },
      { t: '◂ Nada', volver: true }
    ] },
    mercado: { t: 'El mercado con la paga de un crío da para poco.', c: [
      { t: 'Mirarlo todo sin comprar nada', fx: { intelecto: 4, carisma: 3 }, out: 'Te aprendes los precios de memoria.' },
      { t: 'Gastarte lo poco que tienes en un dulce', fx: { cordura: 6, creditos: -30 }, out: 'Merece la pena.' },
      { t: '◂ Volver', volver: true }
    ] },
    fuerza: { t: 'Cierras los ojos como te dijeron. No pasa gran cosa.', c: [
      { t: 'Insistir un rato', fx: { fuerza: 4, cordura: 5 }, out: 'Un cosquilleo. O te lo imaginas.' },
      { t: '◂ Aburrirte', volver: true }
    ] }
  };

  Game.prototype.rellenoActividad = function (id) {
    const s = this.s;
    if (s.edadBio < 13 && RELLENO_CRIO[id]) {
      const c = RELLENO_CRIO[id];
      return { id: 'relleno_crio_' + id, gen: true, esMenu: true, t: c.t, c: c.c };
    }
    const base = RELLENO[id] || RELLENO.social;
    return { id: 'relleno_' + id, gen: true, esMenu: true, t: base.t, c: base.c };
  };

  /* ---------------- Extras de interfaz ---------------- */
  Game.prototype.aplicarExtra = function (d) {
    const s = this.s;
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
      if (!s.objetos.length) this.log('No tienes nada que vender.', 'res');
      else {
        const o = s.objetos.pop();
        const base = SW.OBJETOS.filter(function (x) { return x.n === o; })[0];
        const v = Math.round((base ? base.p : 500) * 0.5);
        s.stats.creditos += v;
        this.log('Vendes ' + o + ' por ' + U.cr(v) + '.', 'cr');
      }
    }
    if (d.tratar != null && s.heridas[d.tratar]) {
      const h = s.heridas[d.tratar];
      this.log('Te tratan: ' + h.n + '. Cerrado.', 'bien');
      s.heridas.splice(d.tratar, 1);
    }
    if (d.mejora && s.nave) {
      s.nave = Object.assign({}, s.nave);
      s.nave[d.mejora] = Math.min(12, s.nave[d.mejora] + 2);
      this.log('Mejora instalada.', 'bien');
    }
    if (d.fijarApodo) this.fijarApodo(d.fijarApodo);
    if (d.ponerNombreNave) {
      s.naveNombre = SW.nombreLimpio(d.ponerNombreNave);
      this.log('Tu nave se llama "' + d.ponerNombreNave + '".', 'bien');
      this.hito('Bautiza su nave: ' + d.ponerNombreNave);
    }
    if (d.construirForma) this.construirSable(d.construirForma);
    clampStats(s);
  };

  SW.Game = Game;
  SW.clampStats = clampStats;
  SW.saludMax = saludMax;

})(window);

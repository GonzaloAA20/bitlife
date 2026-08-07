/* ============================================================
   HOLOVIDA :: CARRERAS
   Rara, difícil y con premio de verdad. Tres vueltas, y en cada
   una eliges cómo pilotar y te la juegas en un minijuego de
   precisión. Fallar no es perder puntos: es estrellarte.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  SW.CIRCUITOS = [
    { id: 'boonta', n: 'Boonta Eve', mundo: ['Tatooine'], dif: 72, bolsa: 45000,
      tramos: ['la Garganta del Mendigo', 'las Dunas de Jabba', 'el Arco de Piedra'],
      sabor: 'Vainas. Sin escudos, sin frenos y con tusken disparando desde las rocas.' },
    { id: 'malastare', n: 'Gran Premio de Malastare', mundo: ['Malastare'], dif: 66, bolsa: 38000,
      tramos: ['la recta de los pozos', 'la curva del combustible', 'el salto largo'],
      sabor: 'Medio planeta apostando y los dugs sin ningún respeto por las normas.' },
    { id: 'kessel', n: 'El Pasillo de Kessel', mundo: ['Kessel'], dif: 88, bolsa: 90000,
      tramos: ['la Boca', 'el remolino de carbonita', 'el Ojo'],
      sabor: 'No es una carrera: es una ruta que casi nadie termina. Se cronometra igual.' },
    { id: 'vandor', n: 'Descenso de Vandor', mundo: ['Vandor'], dif: 70, bolsa: 40000,
      tramos: ['el viaducto', 'la garganta helada', 'el túnel'],
      sabor: 'Bajando la montaña a ras de vía, con el conveyex de frente si te despistas.' },
    { id: 'cantonica', n: 'Circuito de Canto Bight', mundo: ['Cantonica'], dif: 62, bolsa: 55000,
      tramos: ['el paseo marítimo', 'la curva del casino', 'el desierto corto'],
      sabor: 'Aquí lo que se corre es el dinero de otros. Y hay mucho.' },
    { id: 'corellia', n: 'Circuito de Coronet', mundo: ['Corellia'], dif: 64, bolsa: 36000,
      tramos: ['los astilleros', 'la Espina', 'el puerto viejo'],
      sabor: 'Entre grúas y cargueros. Los corellianos aprenden a volar aquí o no aprenden.' },
    { id: 'libre', n: 'Carrera de puerto', mundo: null, dif: 55, bolsa: 22000,
      tramos: ['la boya de salida', 'el cinturón de chatarra', 'la baliza final'],
      sabor: 'Se corre entre pecios, de boya a boya, y se apuesta en la cantina.' }
  ];

  /** ¿hay carrera aquí y ahora? rara a propósito */
  SW.circuitoDe = function (mundo) {
    const propio = SW.CIRCUITOS.filter(function (c) { return c.mundo && c.mundo.indexOf(mundo) >= 0; });
    return propio.length ? propio[0] : null;
  };

  /* ============================================================
     LA CARRERA
     ============================================================ */
  SW.iniciarCarrera = function (g, circuito) {
    const s = g.s;
    const c = circuito || SW.circuitoDe(s.mundo) || SW.CIRCUITOS[SW.CIRCUITOS.length - 1];
    // tu máquina cuenta: nave con motores buenos o vaina prestada
    const motor = s.nave ? SW.naveStat(s, 'vel') : 3;
    const ventajaMotor = SW.naveAbre(s, 'carreras') ? 3 : 0;

    g.escena = {
      tipo: 'carrera', circuito: c, vuelta: 1, maxVueltas: 3,
      pos: 5 + g.rng.int(0, 3),            // en qué puesto vas (menos es mejor)
      integridad: 100,
      dif: c.dif,
      motor: motor + ventajaMotor,
      riesgoAcumulado: 0
    };
    g.log('Sales a correr ' + c.n + '. ' + c.sabor, 'res');
    g.cola.unshift(g.prepararGen(SW.escenaCarrera(g)));
  };

  SW.escenaCarrera = function (g) {
    const e = g.escena, s = g.s;
    const tramo = e.circuito.tramos[(e.vuelta - 1) % e.circuito.tramos.length];
    const barra = function (v) {
      const n = U.clamp(Math.round(v / 10), 0, 10);
      return '█'.repeat(n) + '░'.repeat(10 - n);
    };
    return {
      id: 'escena_carrera', gen: true, carrera: true,
      t: '<span class="scene-tag">' + e.circuito.n.toUpperCase() + '</span>' +
         '<p>Vuelta ' + e.vuelta + ' de ' + e.maxVueltas + ' · <b>' + tramo + '</b></p>' +
         '<p class="dim">Posición: ' + e.pos + '.º · Integridad ' + barra(e.integridad) + ' ' + Math.round(e.integridad) + '%</p>',
      c: [
        { t: '⟫ Trazada agresiva', carreraLinea: 'agresiva', sub: 'Ganas muchos puestos. La máquina lo paga.' },
        { t: '⟩ Trazada limpia', carreraLinea: 'limpia', sub: 'Ganas poco y no rompes nada.' },
        { t: '↯ Buscar el hueco', carreraLinea: 'hueco', sub: 'Depende de tu intelecto. Si sale, sales disparado.' },
        { t: '⚑ Retirarte', carreraLinea: 'abandonar', sub: 'Vivir para correr otro día.' }
      ]
    };
  };

  SW.resolverCarrera = function (g, linea) {
    const e = g.escena, s = g.s, rng = g.rng;
    if (!e || e.tipo !== 'carrera') return;

    if (linea === 'abandonar') {
      g.log('Metes la vaina en boxes. Se acabó.', 'res');
      g.aplicarFx({ reputacion: -6, cordura: -4 }, {});
      g.escena = null;
      return;
    }

    // pericia = pilotaje + máquina
    const pericia = s.stats.destreza * 0.55 + s.stats.intelecto * 0.2 + e.motor * 3.5 +
                    (s.habilidades.indexOf('pilotaje') >= 0 ? 12 : 0) +
                    (s.sensible ? s.stats.fuerza * 0.35 : 0);
    const margen = pericia - e.dif;

    let gana = 0, dano = 0, txt = '';
    if (linea === 'agresiva') {
      const ok = rng.chance(U.clamp(0.38 + margen / 130, 0.08, 0.85));
      gana = ok ? rng.int(2, 4) : 0;
      dano = ok ? rng.int(9, 18) : rng.int(24, 42);
      txt = ok ? 'Entras por dentro donde no cabías. Te llevas dos puestos.'
               : 'Rozas el muro y algo se rompe.';
    } else if (linea === 'limpia') {
      const ok = rng.chance(U.clamp(0.62 + margen / 190, 0.28, 0.92));
      gana = ok ? rng.int(1, 2) : 0;
      dano = ok ? rng.int(2, 6) : rng.int(8, 16);
      txt = ok ? 'Vuelta limpia. Ganas un puesto sin arriesgar.'
               : 'Te cierran el paso y pierdes el rebufo.';
    } else {
      const ok = rng.chance(U.clamp(0.30 + (s.stats.intelecto - e.dif) / 110, 0.06, 0.8));
      gana = ok ? rng.int(3, 5) : -1;
      dano = ok ? rng.int(4, 10) : rng.int(18, 32);
      txt = ok ? 'Ves el hueco antes que nadie y te cuelas. Tres puestos de golpe.'
               : 'El hueco se cierra justo cuando entras.';
    }

    e.pos = Math.max(1, e.pos - gana);
    e.integridad -= dano;
    e.riesgoAcumulado += dano;
    g.log(txt + ' <span class="dim">(−' + dano + '% de integridad)</span>', gana > 0 ? 'bien' : 'mal');

    // estrellarse de verdad
    if (e.integridad <= 0) {
      SW.estrellarse(g);
      return;
    }
    // aunque aguantes, ir al límite tiene premio de riesgo
    if (e.integridad < 30 && rng.chance(0.30)) {
      SW.estrellarse(g);
      return;
    }

    e.vuelta++;
    if (e.vuelta > e.maxVueltas) { SW.finCarrera(g); return; }
    g.cola.unshift(g.prepararGen(SW.escenaCarrera(g)));
  };

  SW.estrellarse = function (g) {
    const e = g.escena, s = g.s, rng = g.rng;
    const dif = e.circuito.dif;
    g.escena = null;
    // a esta velocidad, chocar mata con facilidad
    let pMuerte = U.clamp(0.16 + (dif - 55) / 190, 0.08, 0.55);
    if (s.stats.fisico > 60) pMuerte -= 0.06;
    if (s.sensible && s.stats.fuerza > 45) pMuerte -= 0.10;
    if (rng.chance(pMuerte)) {
      g.morir('Se estrella corriendo ' + e.circuito.n + '. Lo vio medio sector.');
      return;
    }
    g.log('Te sales a toda velocidad. La máquina queda para chatarra.', 'mal');
    g.aplicarFx({ salud: -rng.int(30, 52), cordura: -14, reputacion: -6 }, {});
    g.herir(rng.pick(['columna tocada', 'pierna destrozada', 'quemaduras de cabina', 'costillas hundidas']),
            rng.int(14, 28), rng.chance(0.3));
    if (s.nave && rng.chance(0.4)) { s.naveEstado = Math.max(5, (s.naveEstado || 100) - 60); }
    s.peligro = (s.peligro || 0) + 18;
    if (s.stats.salud <= 0 && !s.muerto) g.morir('No sobrevive al accidente de la carrera.');
  };

  SW.finCarrera = function (g) {
    const e = g.escena, s = g.s;
    const pos = e.pos, c = e.circuito;
    g.escena = null;
    if (pos === 1) {
      const bolsa = c.bolsa;
      g.log('GANAS ' + c.n + '. Eso no se olvida en este sector.', 'bien');
      g.aplicarFx({ creditos: bolsa, reputacion: 26, destreza: 10, carisma: 10 }, {});
      g.hito('Gana ' + c.n);
      s.contadores.carreras = (s.contadores.carreras || 0) + 1;
      if (!s.apodo) g.ponerApodo(false);
    } else if (pos <= 3) {
      g.log('Terminas ' + pos + '.º. Podio. Se paga y se recuerda.', 'bien');
      g.aplicarFx({ creditos: Math.round(c.bolsa * 0.35), reputacion: 12, destreza: 7 }, {});
      g.hito('Podio en ' + c.n);
    } else {
      g.log('Terminas ' + pos + '.º. Terminar ya es algo aquí.', 'res');
      g.aplicarFx({ creditos: Math.round(c.bolsa * 0.08), destreza: 5, reputacion: 3 }, {});
    }
  };

  /* ============================================================
     CÓMO SE LLEGA A UNA CARRERA
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.EVENTOS = SW.EVENTOS || [];
  SW.EVENTOS.push({
    id: 'crr_invitacion', min: 16, max: 200, w: 6,
    slots: { p: 'mundoAqui', l: 'lugar', k: 'banda' },
    req: function (s) {
      // rara: hace falta circuito aquí (o nave y pulso) y algo de mano
      const hay = SW.circuitoDe(s.mundo);
      return (hay || (s.nave && s.stats.destreza > 45)) && s.stats.destreza > 32;
    },
    t: 'Se corre en {p} este año y admiten inscripciones. La bolsa es de las que cambian una vida.',
    c: [
      { t: 'Inscribirte y correr', carrera: true, fx: { reputacion: 4 },
        sub: 'Tres vueltas. Se puede morir.' },
      { t: 'Inscribirte con la máquina bien preparada', req: function (s) { return SW.naveAbre(s, 'carreras'); },
        carrera: true, fx: { reputacion: 6, destreza: 4 },
        sub: 'Tus impulsores de carreras cuentan, y mucho.' },
      { t: 'Trabajar en los fosos y aprender', fx: { creditos: 4000, intelecto: 8, destreza: 8 }, habilidad: 'mecánica' },
      { t: 'Apostar fuerte por otro', r: [
        { p: 0.42, t: 'Tu piloto gana.', fx: { creditos: 18000, suerte: 5 } },
        { p: 0.58, t: 'Tu piloto se estrella en la segunda vuelta.', fx: { creditos: -9000 } }] },
      { t: 'Mirarla desde la grada', fx: { cordura: 8, carisma: 4 } }
    ]
  });

})(typeof window !== 'undefined' ? window : globalThis);

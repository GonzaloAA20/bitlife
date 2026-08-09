/* ============================================================
   HOLOVIDA :: LA CARRERA POLÍTICA
   Un camino largo que solo se abre si te lo has ganado desde
   pequeño: estudiar, tener cabeza y saber tratar con la gente.
   No es un botón: son cinco escalones, y cada uno tiene su
   requisito. Llegar al Senado te lleva a Coruscant, como debe.

     aprendiz de despacho → concejal → delegado planetario
       → senador del sector → figura del Senado

   Y en el Senado se vota. Los votos dejan huella: te ganan
   enemigos, te cambian el alineamiento y algunos te persiguen
   décadas después.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  SW.ESCALONES = [
    { id: 0, n: 'aprendiz de despacho', sueldo: 6000,
      req: function (s) { return s.stats.intelecto > 42 && s.stats.carisma > 38; } },
    { id: 1, n: 'concejal de distrito', sueldo: 14000,
      req: function (s) { return s.stats.intelecto > 52 && s.stats.carisma > 50 && s.stats.reputacion > 25; } },
    { id: 2, n: 'delegado planetario', sueldo: 34000,
      req: function (s) { return s.stats.intelecto > 60 && s.stats.carisma > 60 && s.stats.reputacion > 40; } },
    { id: 3, n: 'senador del sector', sueldo: 78000,
      req: function (s) { return s.stats.intelecto > 66 && s.stats.carisma > 68 && s.stats.reputacion > 55; } },
    { id: 4, n: 'figura del Senado', sueldo: 140000,
      req: function (s) { return s.stats.intelecto > 72 && s.stats.carisma > 76 && s.stats.reputacion > 70; } }
  ];

  const escalonDe = function (s) { return SW.ESCALONES[s.escalonPolitico || 0]; };

  /* La carrera tiene que estar registrada o tomarEmpleo() se sale sin
     hacer nada y te quedas de senador sin cobrar. */
  SW.CARRERAS = SW.CARRERAS || [];
  if (!SW.CARRERAS.some(function (c) { return c.id === 'politico'; })) {
    SW.CARRERAS.push({
      id: 'politico', n: 'carrera política', sueldoBase: 6000,
      rangos: SW.ESCALONES.map(function (e) { return U.titleCase(e.n); }),
      faccion: 'republica',
      req: function (s) { return s.stats.intelecto > 45 && s.stats.carisma > 42; }
    });
  }

  /* ============================================================
     LA PUERTA: hay que haber sido buen estudiante
     ============================================================ */
  SW.EVENTOS = SW.EVENTOS || [];
  SW.EVENTOS.push({
    id: 'sn_puerta', min: 17, max: 60, w: 9,
    slots: { p: 'mundoAqui', l: 'lugar', d: 'mandamas' },
    req: function (s) {
      if (s.flags.carrera_politica) return false;
      if (s.trabajo === 'jedi' || s.trabajo === 'sith') return false;
      // se abre solo si te lo has trabajado: cabeza, labia y buen nombre
      return s.stats.intelecto > 45 && s.stats.carisma > 42 && s.stats.reputacion > 18 &&
             s.stats.notoriedad < 45;
    },
    t: 'En {p} se fijan en ti: has estudiado, sabes hablar y no tienes manchas. ' +
       '{d} te ofrece un puesto de aprendiz en un despacho.',
    c: [
      { t: 'Aceptar y empezar desde abajo', flag: 'carrera_politica', empleoPolitico: 0,
        fx: { intelecto: 6, carisma: 6 }, sub: 'Cinco escalones hasta el Senado',
        out: 'Archivo, actas y café. Así empieza todo el mundo.' },
      { t: 'Preguntar hasta dónde se puede llegar', fx: { intelecto: 8 },
        out: '"Hasta donde aguantes. El Senado está en Coruscant y no se llega desde aquí sin manos."' },
      { t: 'No es lo tuyo', volver: true }
    ]
  });

  /* ============================================================
     SUBIR ESCALÓN
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.GEN.ascensoPolitico = function (rng, s) {
    const actual = s.escalonPolitico || 0;
    const sig = SW.ESCALONES[actual + 1];
    if (!sig) {
      return {
        id: 'sn_cima', gen: true,
        t: 'Ya no hay escalón por encima del tuyo. Lo que queda es qué haces con el sitio.',
        c: [{ t: 'Seguir', volver: true }]
      };
    }
    const listo = sig.req(s);
    if (!listo) {
      return {
        id: 'sn_no_listo', gen: true,
        t: 'Optas a <b>' + sig.n + '</b> y no sale. Te falta peso.<br>' +
           '<span class="dim">Hace falta intelecto, carisma y buen nombre. Se consiguen trabajando.</span>',
        c: [
          { t: 'Estudiar el expediente hasta sabértelo', fx: { intelecto: 10, cordura: -5 } },
          { t: 'Hacer contactos en los pasillos', fx: { carisma: 10, reputacion: 5 } },
          { t: 'Aparecer en la HoloRed defendiendo algo', fx: { reputacion: 12, carisma: 6, notoriedad: 4 } },
          { t: 'Comprar apoyos', coste: 25000, fx: { reputacion: 14, alineamiento: -10 },
            sub: 'Rápido y sucio' }
        ]
      };
    }
    return {
      id: 'sn_ascenso', gen: true,
      t: 'Hay hueco para <b>' + sig.n + '</b> y esta vez cumples los requisitos.',
      c: [
        { t: 'Presentarte', empleoPolitico: actual + 1, fx: { reputacion: 10, carisma: 6 } },
        { t: 'Presentarte y prometer lo que haga falta', empleoPolitico: actual + 1,
          fx: { reputacion: 16, carisma: 10, alineamiento: -12 }, flag: 'promesas_vacias' },
        { t: 'Dejar que se lo lleve otro', fx: { cordura: 6, reputacion: -6 } }
      ]
    };
  };

  /* ============================================================
     LAS VOTACIONES: aquí es donde la política duele
     ============================================================ */
  const VOTOS = [
    { t: 'Se vota ampliar los poderes de emergencia del Canciller.',
      a: { t: 'A favor: hace falta mano dura', fx: { alineamiento: -18, reputacion: 8 }, faccion: 'republica+20', flag: 'voto_poderes' },
      b: { t: 'En contra: eso no se devuelve nunca', fx: { alineamiento: 16, reputacion: -6 }, enemigo: true },
      c: { t: 'Abstenerte', fx: { cordura: -6, reputacion: -4 } } },
    { t: 'Se vota financiar un ejército con clones de Kamino.',
      a: { t: 'A favor', fx: { alineamiento: -14, reputacion: 10 }, flag: 'voto_ejercito' },
      b: { t: 'En contra: eso es comprar personas', fx: { alineamiento: 20, reputacion: -8 }, enemigo: true },
      c: { t: 'Pedir una comisión que lo estudie', fx: { intelecto: 8, reputacion: -2 } } },
    { t: 'Se vota un bloqueo comercial que hundirá tu propio sector.',
      a: { t: 'Votar con tu bloque', fx: { reputacion: 6, alineamiento: -8 }, faccion: 'auto+10' },
      b: { t: 'Votar por los tuyos aunque te cueste el puesto', fx: { alineamiento: 18, reputacion: 14 }, enemigo: true },
      c: { t: 'Negociar una excepción para tu planeta', fx: { carisma: 14, creditos: 20000, alineamiento: -6 } } },
    { t: 'Un consorcio te ofrece mucho dinero por una enmienda de tres líneas.',
      a: { t: 'Meterla y cobrar', fx: { creditos: 90000, alineamiento: -24, notoriedad: 10 }, flag: 'corrupto' },
      b: { t: 'Rechazarlo y denunciarlo', fx: { alineamiento: 22, reputacion: 16 }, enemigo: true },
      c: { t: 'Rechazarlo sin hacer ruido', fx: { alineamiento: 10, cordura: 6 } } },
    { t: 'Se vota reconocer la independencia de unos sistemas del Borde.',
      a: { t: 'A favor: llevan razón', fx: { alineamiento: 14, reputacion: 6 }, faccion: 'separatistas+15', enemigo: true },
      b: { t: 'En contra: es el principio del fin', fx: { alineamiento: -6, reputacion: 8 }, faccion: 'republica+15' },
      c: { t: 'Proponer autonomía en vez de independencia', fx: { carisma: 16, intelecto: 10, reputacion: 12 } } },
    { t: 'Sale a la luz que un colega tuyo cobra de un cártel. Te piden que le cubras.',
      a: { t: 'Cubrirle', fx: { alineamiento: -16, reputacion: -4 }, rel: { tipo: 'contacto', afecto: 60 } },
      b: { t: 'Entregarle', fx: { alineamiento: 18, reputacion: 12 }, enemigo: true },
      c: { t: 'Avisarle de que dimita él solo', fx: { carisma: 12, alineamiento: 6 } } }
  ];

  SW.GEN.votacion = function (rng, s) {
    const v = rng.pick(VOTOS);
    return {
      id: 'sn_voto', gen: true,
      t: '<span class="scene-tag">VOTACIÓN</span><p>' + v.t + '</p>',
      c: [
        Object.assign({ votoRegistrado: v.t }, v.a),
        Object.assign({ votoRegistrado: v.t }, v.b),
        Object.assign({ votoRegistrado: v.t }, v.c)
      ]
    };
  };

  /* ============================================================
     LO QUE TE PASA POR SER POLÍTICO
     ============================================================ */
  SW.EVENTOS.push({
    id: 'sn_enemigo_vuelve', min: 25, max: 200, w: 9, repetible: true,
    slots: { p: 'mundoAqui', l: 'lugar' },
    req: function (s) { return !!s.flags.carrera_politica && (s.contadores.enemigosPoliticos || 0) > 0; },
    t: 'Alguien a quien votaste en contra hace años tiene ahora más poder que tú, y buena memoria.',
    c: [
      { t: 'Ir a hablar con él', fx: { carisma: 10, cordura: -4 },
        r: [{ p: 0.45, t: 'Llegáis a un acuerdo.', fx: { reputacion: 8 } },
            { p: 0.55, t: 'No hay acuerdo. Hay aviso.', fx: { reputacion: -12 }, buscado: 15 }] },
      { t: 'Adelantarte y sacarle los trapos', fx: { notoriedad: 14, reputacion: 6, alineamiento: -8 } },
      { t: 'Blindarte: contratar seguridad', coste: 30000, fx: { cordura: 8 }, flag: 'con_escolta' },
      { t: 'Retirarte de la política', quitarFlag: 'carrera_politica', fx: { cordura: 14, reputacion: -10 },
        despido: true, out: 'Te vas antes de que te echen. No es lo mismo.' }
    ]
  });

  SW.EVENTOS.push({
    id: 'sn_escandalo', min: 25, max: 200, w: 8, repetible: true,
    slots: { p: 'mundoAqui' },
    req: function (s) { return !!s.flags.carrera_politica && (s.flags.corrupto || s.flags.promesas_vacias); },
    t: 'Sale en la HoloRed lo que hiciste para llegar donde estás.',
    c: [
      { t: 'Negarlo todo', fx: { carisma: 10, alineamiento: -10 },
        r: [{ p: 0.5, t: 'Cuela. El ciclo de noticias pasa.', fx: { reputacion: -6 } },
            { p: 0.5, t: 'Aparecen pruebas.', fx: { reputacion: -30, notoriedad: 18 }, despido: true, quitarFlag: 'carrera_politica' }] },
      { t: 'Admitirlo y pedir perdón', fx: { reputacion: -14, alineamiento: 12, cordura: 8 },
        out: 'Se te perdona a medias. Nunca del todo.' },
      { t: 'Dimitir', despido: true, quitarFlag: 'carrera_politica', fx: { cordura: 10, reputacion: -8 } },
      { t: 'Comprar el silencio del medio', coste: 60000, fx: { alineamiento: -16, notoriedad: 8 } }
    ]
  });

  /* ============================================================
     LA PESTAÑA
     ============================================================ */
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.ACTIVIDADES.push({
    id: 'senado', n: 'Política', ico: '⚖', desc: 'Escalar, votar y sobrevivir a lo que votaste.', min: 16,
    req: function (s) { return !!s.flags.carrera_politica; }
  });

  /* Lo que puedes hacer depende del escalón. Antes el menú era el
     mismo siendo concejal que siendo senador, y por eso a veces
     parecía que mandabas y a veces no. */
  const PODERES = [
    /* 0 · aprendiz de despacho */
    [{ t: 'Redactar informes para otro', fx: { intelecto: 10, cordura: -4 }, sub: 'Firma él, trabajas tú' },
     { t: 'Colarte en reuniones a las que no te llaman', fx: { intelecto: 8, carisma: 8, reputacion: -4 } },
     { t: 'Hacerte imprescindible para alguien', fx: { carisma: 12, reputacion: 6 },
       rel: { tipo: 'mentor', afecto: 35 }, sub: 'Un padrino en el despacho' }],
    /* 1 · concejal de distrito */
    [{ t: 'Conceder o negar licencias en tu distrito', fx: { creditos: 12000, alineamiento: -6, reputacion: 4 },
       sub: 'Poder pequeño, dinero rápido' },
     { t: 'Arreglar algo que lleva años roto', fx: { reputacion: 16, alineamiento: 12, creditos: -8000 } },
     { t: 'Montar tu propia red de fieles', fx: { carisma: 12, reputacion: 8, alineamiento: -4 } }],
    /* 2 · delegado planetario */
    [{ t: 'Firmar un decreto para todo el planeta', fx: { reputacion: 14, alineamiento: 8, cordura: -6 },
       sub: 'Tu firma vale en todo el planeta' },
     { t: 'Negociar con una corporación', fx: { creditos: 30000, alineamiento: -10, carisma: 10 } },
     { t: 'Abrir una investigación sobre quien manda aquí', fx: { intelecto: 12, notoriedad: 10, reputacion: 8 }, enemigo: true },
     { t: 'Declarar el estado de emergencia', fx: { reputacion: 8, alineamiento: -14 }, faccion: 'auto+18' }],
    /* 3 · senador del sector */
    [{ t: 'Presentar una ley en el Senado', generar: 'votacion', sub: 'La tuya, esta vez' },
     { t: 'Bloquear la ley de otro', fx: { intelecto: 12, reputacion: 8 }, enemigo: true,
       sub: 'Te ganas a alguien con memoria' },
     { t: 'Pedir una comisión de investigación', fx: { intelecto: 14, notoriedad: 12, reputacion: 10 }, enemigo: true },
     { t: 'Pedir escolta de la flota para tu sector', fx: { reputacion: 12, creditos: -20000 }, faccion: 'republica+18' },
     { t: 'Usar tu inmunidad para tapar algo tuyo', fx: { alineamiento: -18, cordura: -8 }, limpiarBusca: true },
     { t: 'Traer fondos a tu mundo', fx: { reputacion: 20, alineamiento: 10, creditos: -6000 },
       sub: 'En tu mundo se acordarán de esto' }],
    /* 4 · figura del Senado */
    [{ t: 'Liderar una coalición', fx: { carisma: 16, reputacion: 18, cordura: -10 } },
     { t: 'Presentar una moción de censura', fx: { notoriedad: 18, reputacion: 12 }, enemigo: true,
       sub: 'O te la llevas por delante o te lleva a ti' },
     { t: 'Nombrar a los tuyos en puestos clave', fx: { reputacion: 14, alineamiento: -14, creditos: 25000 } },
     { t: 'Negociar la paz entre dos bandos', fx: { carisma: 20, alineamiento: 20, reputacion: 22, cordura: -12 } },
     { t: 'Presentarte a la jefatura', fx: { carisma: 14, notoriedad: 16, creditos: -50000, reputacion: 16 },
       sub: 'Muy caro y sin garantías' },
     { t: 'Retirarte con honores', dejarCargo: true, fx: { cordura: 16, reputacion: 10 } }]
  ];

  SW.menuPolitica = function (g) {
    const s = g.s;
    const nivel = s.escalonPolitico || 0;
    const e = escalonDe(s);
    const sig = SW.ESCALONES[nivel + 1];
    const c = [];
    // los poderes de tu escalón y los de todos los anteriores
    for (let i = 0; i <= nivel && i < PODERES.length; i++) {
      PODERES[i].forEach(function (o) { c.push(o); });
    }
    c.push({ t: 'Optar al siguiente escalón', generar: 'ascensoPolitico',
      sub: sig ? 'Siguiente: ' + sig.n : 'Ya estás arriba del todo' });
    c.push({ t: 'Ir a una votación', generar: 'votacion', sub: 'Lo que votes te va a seguir' });
    c.push({ t: 'Trabajar el distrito', fx: { reputacion: 10, carisma: 6, cordura: -4 },
      sub: 'Aburrido, seguro y suma' });
    c.push({ t: 'Estudiar los expedientes a fondo', fx: { intelecto: 10, cordura: -4 } });
    c.push({ t: 'Hacer campaña con tu propio dinero', req: function (st) { return st.stats.creditos > 20000; },
      coste: 20000, fx: { reputacion: 18, carisma: 8 } });
    c.push({ t: '◂ Volver', volver: true });

    // lo que puedes hacer, dicho en voz alta, para que no haya dudas
    const alcance = nivel >= 4 ? 'Tu voto arrastra a otros y tu firma llega a toda la República.'
                  : nivel === 3 ? 'Tienes escaño: puedes presentar leyes, bloquearlas y abrir comisiones.'
                  : nivel === 2 ? 'Mandas en ' + s.mundo + ', no en la galaxia.'
                  : nivel === 1 ? 'Mandas en tu distrito y en poco más.'
                  : 'Todavía no mandas en nada: aprendes y haces favores.';

    return {
      id: 'menu_politica', gen: true, esMenu: true,
      t: 'POLÍTICA — eres <b>' + e.n + '</b>' +
         '<br><span class="dim">' + alcance + '</span>' +
         '<br><span class="dim">Intelecto ' + s.stats.intelecto + ' · carisma ' + s.stats.carisma +
         ' · reputación ' + s.stats.reputacion + '</span>',
      c: c
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

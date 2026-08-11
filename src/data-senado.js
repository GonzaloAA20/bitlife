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
      req: function (s) { return s.stats.intelecto > 72 && s.stats.carisma > 76 && s.stats.reputacion > 70; } },
    /* La jefatura. No es un ascenso más: es una elección con rivales,
       hace falta llevar años arriba y no todas las épocas la tienen
       (bajo el Imperio el puesto está ocupado por alguien que no se
       presenta a nada). Lo controla `tope` en POLITICA_ERA. */
    { id: 5, n: 'Canciller Supremo', sueldo: 400000, jefatura: true,
      req: function (s) {
        return s.stats.intelecto > 84 && s.stats.carisma > 88 && s.stats.reputacion > 84 &&
               (s.añosEnCumbre || 0) >= 4;
      } }
  ];

  /* ============================================================
     LA POLÍTICA NO ES LA MISMA EN CADA ÉPOCA
     Los mismos cinco escalones servían igual en la Alta República
     que bajo el Imperio, y eso no se sostiene: en la Era de la
     Rebelión el Senado está DISUELTO (lo cierra Tarkin), y en la
     época de la Primera Orden no hay Senado galáctico porque
     Hosnian Prime ya no existe. Aquí sólo cambian los nombres y el
     techo; la mecánica es la misma.
     ============================================================ */
  SW.POLITICA_ERA = {
    alta_republica: { n: ['aprendiz de despacho', 'concejal de distrito', 'delegado planetario',
                          'senador del sector', 'figura del Senado', 'Canciller Supremo'], tope: 5,
      casa: 'el Senado de la República', nota: 'La República se está expandiendo y hacen falta manos.' },
    republica_tardia: { n: ['aprendiz de despacho', 'concejal de distrito', 'delegado planetario',
                            'senador del sector', 'figura del Senado', 'Canciller Supremo'], tope: 5,
      casa: 'el Senado Galáctico', nota: 'Todo se decide en comités que duran años.' },
    /* En las Guerras Clon la silla está ocupada por Palpatine y no la
       suelta: se puede llegar a figura del Senado y no más arriba. */
    guerras_clon: { n: ['aprendiz de despacho', 'concejal de distrito', 'delegado planetario',
                        'senador del sector', 'figura del Senado'], tope: 4,
      casa: 'el Senado Galáctico', nota: 'Cada mes se votan poderes de emergencia nuevos.',
      techoPorque: 'La Cancillería no sale a concurso: la ocupa Palpatine y cada año tiene más poderes.' },
    imperio_temprano: { n: ['auxiliar de la administración', 'concejal de distrito', 'gobernador adjunto',
                            'senador del Senado Imperial', 'portavoz de comité'], tope: 4,
      casa: 'el Senado Imperial', nota: 'El Senado sigue reuniéndose. Decidir, decide otro.',
      techoPorque: 'Por encima del Senado Imperial está el Emperador, y ese puesto no se vota.' },
    rebelion: { n: ['auxiliar de la administración', 'concejal de distrito', 'gobernador adjunto',
                    'gobernador planetario', 'enlace con el Moff del sector'], tope: 4,
      casa: 'la administración imperial del sector',
      nota: 'El Senado está disuelto desde hace años: ahora manda el moff que te toque.', sinSenado: true,
      techoPorque: 'No hay Senado que presidir: Tarkin lo disolvió y el escalafón acaba en el Moff.' },
    nueva_republica: { n: ['aprendiz de despacho', 'concejal de distrito', 'delegado planetario',
                           'senador de la Nueva República', 'figura del Senado', 'Canciller de la Nueva República'],
      tope: 5,
      casa: 'el Senado de la Nueva República', nota: 'Un Senado nuevo que aún discute dónde sentarse.' },
    primera_orden: { n: ['auxiliar de la administración', 'concejal de distrito', 'gobernador adjunto',
                         'administrador de sector', 'gobernador general'], tope: 4,
      casa: 'la administración de la Primera Orden',
      nota: 'No hay Senado: voló con Hosnian Prime. Hay órdenes.', sinSenado: true,
      techoPorque: 'Arriba del todo hay un Líder Supremo, y a eso no se opta: se hereda a la fuerza.' },
    era_perdida: { n: ['aprendiz de despacho', 'concejal de distrito', 'delegado planetario',
                       'consejero del sector', 'figura del consejo', 'Primer Consejero'], tope: 5,
      casa: 'el consejo de sector', nota: 'Se gobierna a trozos.' }
  };

  SW.politicaDe = function (s) {
    return SW.POLITICA_ERA[s.era] || SW.POLITICA_ERA.republica_tardia;
  };
  /** El nombre del escalón, con el vocabulario de su época. */
  SW.nombreEscalon = function (s, i) {
    const p = SW.politicaDe(s);
    return (p.n && p.n[i]) || (SW.ESCALONES[i] || {}).n || 'cargo';
  };
  SW.hayEscano = function (s) { return !SW.politicaDe(s).sinSenado; };

  const escalonDe = function (s) {
    const base = SW.ESCALONES[s.escalonPolitico || 0];
    return { id: base.id, sueldo: base.sueldo, req: base.req, n: SW.nombreEscalon(s, base.id) };
  };

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
     UNA SOLA CARRERA POLÍTICA
     Había dos conviviendo: esta escalera por época y una carrera
     suelta llamada «Político galáctico» con rangos propios que
     llegaban hasta Canciller. Se podía acabar de Canciller en la Alta
     República por el menú genérico de empleo, saltándose la época, el
     tope y todo lo demás. La vieja se retira del reparto de empleos y
     lo que hace ahora es meterte por la puerta de abajo de esta.
     ============================================================ */
  SW.CARRERAS.forEach(function (c) {
    if (c.id === 'senador') { c.noOfrecer = true; c.rangos = SW.ESCALONES.map(function (e) { return U.titleCase(e.n); }); }
  });
  SW.REDIRIGE_A_POLITICA = 'senador';

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
  /** El escalón más alto al que se puede llegar en esta época. */
  SW.topePolitico = function (s) {
    const p = SW.politicaDe(s);
    return p.tope == null ? 4 : p.tope;
  };

  SW.GEN.ascensoPolitico = function (rng, s) {
    const actual = s.escalonPolitico || 0;
    const tope = SW.topePolitico(s);
    const sig = SW.ESCALONES[actual + 1];
    if (!sig || actual >= tope) {
      const pol = SW.politicaDe(s);
      return {
        id: 'sn_cima', gen: true,
        t: 'Ya no hay escalón por encima del tuyo.' +
           (actual >= tope && SW.ESCALONES[actual + 1]
             ? '<br><span class="dim">' + (pol.techoPorque || 'En esta época el escalafón acaba aquí.') + '</span>'
             : '<br><span class="dim">Lo que queda es qué haces con el sitio.</span>'),
        c: [{ t: 'Seguir', volver: true }]
      };
    }

    /* La jefatura no es un ascenso: es una elección con rivales. Puedes
       cumplir los requisitos y perderla igual, que es como funciona. */
    if (sig.jefatura) return SW.GEN.eleccionJefatura(rng, s, sig);

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
     LA JEFATURA
     Ser Canciller no es subir un peldaño más: es ganarle el puesto a
     gente que lleva toda la vida preparándolo. Se puede cumplir todo
     y perder, y perder tiene precio.
     ============================================================ */
  SW.GEN.eleccionJefatura = function (rng, s, esc) {
    const pol = SW.politicaDe(s);
    const cargo = SW.nombreEscalon(s, esc.id);
    const años = s.añosEnCumbre || 0;
    if (!esc.req(s)) {
      const falta = [];
      if (s.stats.intelecto <= 84) falta.push('intelecto ' + s.stats.intelecto + '/85');
      if (s.stats.carisma <= 88) falta.push('carisma ' + s.stats.carisma + '/89');
      if (s.stats.reputacion <= 84) falta.push('reputación ' + s.stats.reputacion + '/85');
      if (años < 4) falta.push(años + '/4 años en la cumbre');
      return {
        id: 'sn_jefatura_no', gen: true,
        t: '<span class="scene-tag">' + U.esc(cargo.toUpperCase()) + '</span>' +
          '<p>' + (SW.contraer ? SW.contraer('Suena tu nombre para la jefatura de ' + U.esc(pol.casa)) :
                   'Suena tu nombre para la jefatura de ' + U.esc(pol.casa)) + ' y se apaga solo. ' +
          'Nadie te lo dice a la cara: simplemente la conversación sigue sin ti.</p>' +
          '<p class="dim">Te falta: ' + falta.join(' · ') + '</p>',
        c: [
          { t: 'Ponerte a ello en serio', fx: { intelecto: 8, carisma: 8, cordura: -8 },
            out: 'Cuatro años de trabajo por delante y ninguna garantía.' },
          { t: 'Comprar peso a base de favores', coste: 60000,
            fx: { reputacion: 16, alineamiento: -14, notoriedad: 8 },
            out: 'Se compran apoyos, no votos. La diferencia es de matiz y de precio.' },
          { t: 'Dejarlo estar: ya has llegado lejos', fx: { cordura: 12 },
            out: 'No todo el mundo quiere la silla. Casi nadie lo admite.' }
        ]
      };
    }
    /* Cumples. Ahora hay que ganarla. */
    const base = U.clamp(0.12 + (s.stats.carisma - 88) / 90 + (s.stats.reputacion - 84) / 110 +
      años * 0.03 + (s.stats.intelecto - 84) / 150, 0.1, 0.6);
    const conDinero = U.clamp(base + 0.18, 0.15, 0.75);
    const sucio = U.clamp(base + 0.30, 0.2, 0.88);
    const pct = function (x) { return Math.round(x * 100) + '%'; };
    return {
      id: 'sn_jefatura', gen: true,
      t: '<span class="scene-tag">ELECCIÓN · ' + U.esc(cargo.toUpperCase()) + '</span>' +
        '<p>' + (SW.contraer ? SW.contraer('La jefatura de ' + U.esc(pol.casa)) : 'La jefatura de ' + U.esc(pol.casa)) +
        ' queda libre y esta vez tu nombre está en la lista corta. ' +
        'Enfrente hay dos o tres que llevan preparando esto desde antes de que tú entraras.</p>' +
        '<p class="dim">' + años + ' años en la cumbre · intelecto ' + s.stats.intelecto +
        ' · carisma ' + s.stats.carisma + ' · reputación ' + s.stats.reputacion + '</p>',
      c: [
        { t: 'Presentarte y hacer la campaña limpia', sub: pct(base) + ' · si sales, sales entero',
          jefatura: { p: base, esc: esc.id, limpio: true } },
        { t: 'Gastarte tu fortuna en la campaña', sub: pct(conDinero) + ' · ' + U.cr(200000),
          coste: 200000, jefatura: { p: conDinero, esc: esc.id } },
        { t: 'Sacar lo que tienes de los otros candidatos',
          sub: pct(sucio) + ' · funciona, y se sabrá algún día',
          fx: { alineamiento: -22, notoriedad: 14 }, jefatura: { p: sucio, esc: esc.id, sucio: true } },
        { t: 'Retirar tu nombre', fx: { cordura: 10, reputacion: -6 },
          out: 'Apoyas a otro y te ganas una deuda que vale casi tanto como el puesto.' }
      ]
    };
  };

  /** Ganar o perder la jefatura. Perderla también cuenta. */
  SW.resolverJefatura = function (g, cfg) {
    const s = g.s;
    const cargo = SW.nombreEscalon(s, cfg.esc);
    if (g.rng.chance(cfg.p)) {
      g.aplicarNodo({ empleoPolitico: cfg.esc }, {}, null, false);
      g.log('<b>Sales elegido ' + cargo + '.</b> Una galaxia entera y tu firma al final de las páginas.', 'bien');
      g.hito('Alcanza la jefatura: ' + cargo);
      s.flags.jefatura = true;
      if (cfg.sucio) s.flags.jefatura_sucia = true;
      g.aplicarFx({ reputacion: 20, notoriedad: 20, cordura: -10 }, {});
      return;
    }
    g.log('No sales. Gana otro por un puñado de votos que sabes contar de memoria.', 'mal');
    s.contadores.jefaturasPerdidas = (s.contadores.jefaturasPerdidas || 0) + 1;
    g.aplicarFx({ cordura: -18, reputacion: -8 }, {});
    if (cfg.sucio) {
      g.log('Y lo que sacaste de los otros sale a la luz la semana siguiente.', 'mal');
      g.aplicarFx({ reputacion: -20, notoriedad: 15 }, {});
    }
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
  /* Había DOS pestañas llamadas «Política»: ésta, que es la carrera de
     verdad, y otra de eventos sueltos de data-world-ext.js. Se veían
     iguales en la barra y una de las dos no llevaba a ninguna parte.
     Ahora hay una sola: la de siempre («politica»), que abre esta
     pantalla en cuanto entras en la carrera y el sorteo de escenas
     mientras no. Esta entrada se retira. */
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];

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
    /* 3 · senador del sector (o gobernador, según la época) */
    [{ t: 'Presentar una ley en el Senado', generar: 'votacion', sub: 'La tuya, esta vez',
       req: function (st) { return SW.hayEscano(st); } },
     { t: 'Firmar un bando para todo el planeta', req: function (st) { return !SW.hayEscano(st); },
       fx: { reputacion: 12, alineamiento: -6, cordura: -6 }, sub: 'Sin debate ni votación: se publica y ya' },
     { t: 'Interpretar las órdenes de arriba a tu manera', req: function (st) { return !SW.hayEscano(st); },
       fx: { intelecto: 12, alineamiento: 14, reputacion: 6 }, sub: 'Cumplir la letra y perderte la intención' },
     { t: 'Bloquear la ley de otro', fx: { intelecto: 12, reputacion: 8 }, enemigo: true,
       req: function (st) { return SW.hayEscano(st); }, sub: 'Te ganas a alguien con memoria' },
     { t: 'Pedir una comisión de investigación', fx: { intelecto: 14, notoriedad: 12, reputacion: 10 }, enemigo: true },
     { t: 'Pedir escolta de la flota para tu sector', fx: { reputacion: 12, creditos: -20000 }, faccion: 'republica+18' },
     { t: 'Usar tu inmunidad para tapar algo tuyo', fx: { alineamiento: -18, cordura: -8 }, limpiarBusca: true },
     { t: 'Traer fondos a tu mundo', fx: { reputacion: 20, alineamiento: 10, creditos: -6000 },
       sub: 'En tu mundo se acordarán de esto' }],
    /* 4 · figura del Senado */
    [{ t: 'Liderar una coalición', fx: { carisma: 16, reputacion: 18, cordura: -10 },
       req: function (st) { return SW.hayEscano(st); } },
     { t: 'Montar tu propia red de gobernadores', req: function (st) { return !SW.hayEscano(st); },
       fx: { carisma: 16, reputacion: 14, notoriedad: 10 }, sub: 'Favores cruzados entre sectores' },
     { t: 'Presentar una moción de censura', fx: { notoriedad: 18, reputacion: 12 }, enemigo: true,
       req: function (st) { return SW.hayEscano(st); }, sub: 'O te la llevas por delante o te lleva a ti' },
     { t: 'Nombrar a los tuyos en puestos clave', fx: { reputacion: 14, alineamiento: -14, creditos: 25000 } },
     { t: 'Negociar la paz entre dos bandos', fx: { carisma: 20, alineamiento: 20, reputacion: 22, cordura: -12 } },
     /* «Presentarte a la jefatura» estaba aquí como un poder más que
        cobraba 50.000 y sólo daba estadísticas: una jefatura de mentira
        al lado de la de verdad. La de verdad es «Optar a la jefatura»,
        abajo del menú, y es una elección que se puede perder. */
     { t: 'Preparar el terreno para la jefatura',
       fx: { carisma: 12, reputacion: 14, notoriedad: 8, creditos: -50000 },
       sub: 'Cenas, favores y una lista de quién te debe qué',
       out: 'No te da el puesto. Te da los apoyos que hacen falta cuando quede libre.' },
     { t: 'Retirarte con honores', dejarCargo: true, fx: { cordura: 16, reputacion: 10 } }]
  ];

  /* Los años que llevas en el escalón más alto del Senado. Sin esto la
     jefatura sería un ascenso más y no lo es: hay que haber estado
     arriba el tiempo suficiente para que te conozcan. */
  SW.pasoPolitica = function (g) {
    const s = g.s;
    if (!s.flags.carrera_politica) return;
    if ((s.escalonPolitico || 0) >= 4) s.añosEnCumbre = (s.añosEnCumbre || 0) + 1;
  };

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
    const tope = SW.topePolitico(s);
    const hayMas = sig && nivel < tope;
    c.push({ t: hayMas && sig.jefatura ? 'Optar a la jefatura' : 'Optar al siguiente escalón',
      generar: 'ascensoPolitico',
      sub: hayMas ? 'Siguiente: ' + SW.nombreEscalon(s, nivel + 1)
                  : (SW.politicaDe(s).techoPorque || 'Ya estás arriba del todo') });
    c.push({ t: 'Ir a una votación', generar: 'votacion', sub: 'Lo que votes te va a seguir' });
    c.push({ t: 'Trabajar el distrito', fx: { reputacion: 10, carisma: 6, cordura: -4 },
      sub: 'Aburrido, seguro y suma' });
    c.push({ t: 'Estudiar los expedientes a fondo', fx: { intelecto: 10, cordura: -4 } });
    c.push({ t: 'Hacer campaña con tu propio dinero', req: function (st) { return st.stats.creditos > 20000; },
      coste: 20000, fx: { reputacion: 18, carisma: 8 } });
    c.push({ t: '◂ Volver', volver: true });

    // lo que puedes hacer, dicho en voz alta, para que no haya dudas
    const pol = SW.politicaDe(s);
    const alcance = nivel >= 5 ? 'Presides ' + pol.casa + '. Lo que decidas es la historia que otros leerán.'.replace(/^/, '')
                  : nivel >= 4 ? (pol.sinSenado
                        ? 'Mandas en un sector entero, y por encima de ti sólo hay uniformes.'
                        : 'Tu voto arrastra a otros y tu firma llega a media galaxia.')
                  : nivel === 3 ? (pol.sinSenado
                        ? 'Gobiernas un planeta. Las órdenes vienen de arriba y tú decides cómo se cumplen.'
                        : 'Tienes escaño en ' + pol.casa + ': puedes presentar leyes, bloquearlas y abrir comisiones.')
                  : nivel === 2 ? 'Mandas en ' + s.mundo + ', no en la galaxia.'
                  : nivel === 1 ? 'Mandas en tu distrito y en poco más.'
                  : 'Todavía no mandas en nada: aprendes y haces favores.';

    return {
      id: 'menu_politica', gen: true, esMenu: true,
      t: 'POLÍTICA — eres <b>' + e.n + '</b>' +
         '<br><span class="dim">' + alcance + '</span>' +
         '<br><span class="dim">Escalón ' + nivel + ' de ' + SW.topePolitico(s) + ' en ' + pol.casa + '</span>' +
         '<br><span class="dim">Intelecto ' + s.stats.intelecto + ' · carisma ' + s.stats.carisma +
         ' · reputación ' + s.stats.reputacion + '</span>',
      c: c
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

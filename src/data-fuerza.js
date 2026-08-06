/* ============================================================
   HOLOVIDA :: el camino de la Fuerza
   Ser jedi no es una carrera más: es un código con renuncias.
   Ser sith tampoco: es la Regla de los Dos y un maestro que
   solo espera que le falles.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  const esJedi = function (s) { return s.trabajo === 'jedi'; };
  const esSith = function (s) { return s.trabajo === 'sith'; };
  const senda = function (s) { return esJedi(s) || esSith(s); };

  /* El Código y sus consecuencias mecánicas */
  SW.CODIGO_JEDI = [
    'No hay emoción, hay paz.',
    'No hay ignorancia, hay conocimiento.',
    'No hay pasión, hay serenidad.',
    'No hay caos, hay armonía.',
    'No hay muerte, hay la Fuerza.'
  ];
  SW.CODIGO_SITH = [
    'La paz es una mentira, solo hay pasión.',
    'Mediante la pasión, obtengo fuerza.',
    'Mediante la fuerza, obtengo poder.',
    'Mediante el poder, obtengo la victoria.',
    'Mediante la victoria, mis cadenas se rompen.'
  ];

  /* ============================================================
     GUION DEL CAMINO JEDI
     ============================================================ */
  push(SW.GUION, [
    {
      id: 'jd_maestro', min: 12, max: 60, prio: 80, unaVez: true,
      req: function (s) { return esJedi(s) && !s.maestro; },
      t: 'El Consejo te asigna maestro. A partir de hoy le sigues a todas partes.',
      c: [{ t: 'Presentarte ante quien te ha tocado', asignarMaestro: 'jedi' }]
    },
    {
      id: 'sh_maestro', min: 14, max: 70, prio: 80, unaVez: true,
      req: function (s) { return esSith(s) && !s.maestro; },
      t: 'Nadie te presenta a nadie. Alguien te encuentra a ti, que es peor.',
      c: [{ t: 'Arrodillarte', asignarMaestro: 'sith' }]
    },
    {
      id: 'jd_apego', min: 16, max: 80, prio: 70, unaVez: true,
      req: function (s) { return esJedi(s) && s.relaciones.some(function (r) { return r.tipo === 'pareja' || r.tipo === 'cónyuge'; }); },
      t: 'La Orden prohíbe el apego. Tú tienes a alguien. Las dos cosas no caben en la misma vida sin pagar por ello.',
      c: [
        { t: 'Dejar a esa persona y quedarte en la Orden', fx: { cordura: -20, fuerza: 12, alineamiento: 8 }, romper: true, flag: 'renuncio_apego', out: 'Lo haces bien y sin escenas. Duele exactamente igual.' },
        { t: 'Dejar la Orden y quedarte con esa persona', fx: { cordura: 18, fuerza: -14, reputacion: -10 }, despido: true, faccion: 'orden_jedi-30', flag: 'dejo_la_orden', out: 'Devuelves el sable al Consejo. Nadie te lo reprocha en voz alta.' },
        { t: 'Mantenerlo en secreto', fx: { cordura: -10, carisma: 8, fuerza: 5 }, flag: 'apego_secreto', out: 'Funciona durante años. Los secretos siempre funcionan durante años.' },
        { t: 'Confesarlo ante el Consejo', r: [
          { p: 0.4, t: 'Te escuchan. Hay más precedentes de los que creías.', fx: { cordura: 12, reputacion: 6, fuerza: 6 } },
          { p: 0.6, t: 'Te dan a elegir, y elegir no es gratis.', fx: { cordura: -14, fuerza: 8 }, romper: true }
        ] }
      ]
    },
    {
      id: 'sh_regla_dos', min: 20, max: 90, prio: 75, unaVez: true,
      req: function (s) { return esSith(s) && s.maestro && s.stats.fuerza > 60; },
      t: 'La Regla de los Dos: un maestro y un aprendiz. Uno para encarnar el poder, otro para ansiarlo. Ya no cabéis los dos.',
      c: [
        { t: 'Matar a tu maestro', combate: { dif: 88, duelo: true, sable: true }, fx: { alineamiento: -25, fuerza: 20, cordura: -15 }, flag: 'mato_maestro', out: '' },
        { t: 'Esperar. Todavía no estás preparado.', fx: { fuerza: 10, intelecto: 10, cordura: -6 }, out: 'Le sirves un año más. Los dos sabéis lo que estás haciendo.' },
        { t: 'Traicionarle entregándole a los jedi', fx: { alineamiento: 15, notoriedad: 20, fuerza: -8 }, faccion: 'orden_jedi+20', flag: 'traiciono_sith', out: 'Cae. Los jedi no te dan las gracias: te miran y toman nota.' },
        { t: 'Huir del lado oscuro para siempre', fx: { fuerza: -20, cordura: 20, alineamiento: 25 }, despido: true, flag: 'renegado_sith', out: 'No se sale de esto. Pero se puede correr mucho tiempo.' }
      ]
    }
  ]);

  /* ============================================================
     EVENTOS DEL CAMINO
     ============================================================ */
  push(SW.EVENTOS, [
    {
      id: 'jd_codigo', min: 12, max: 90, w: 13, req: esJedi,
      t: 'Un iniciado te pregunta qué significa de verdad la primera línea del Código: «No hay emoción, hay paz».',
      c: [
        { t: 'Que no debemos sentir', fx: { cordura: -8, fuerza: 5, carisma: -4 }, out: 'Le contestas lo que te enseñaron. No te lo crees ni tú.' },
        { t: 'Que no debemos dejarnos gobernar por lo que sentimos', fx: { cordura: 14, fuerza: 10, carisma: 8 }, out: 'El crío se queda pensando. Tú también.' },
        { t: 'Que llevas años preguntándotelo', fx: { cordura: 10, intelecto: 8, alineamiento: 5 }, out: 'La honestidad enseña más que la doctrina.' }
      ]
    },
    {
      id: 'jd_posesiones', min: 14, max: 90, w: 11, req: esJedi,
      req2: true,
      t: 'La Orden no permite posesiones personales. Tienes cosas que no deberías tener.',
      c: [
        { t: 'Entregarlo todo', fx: { cordura: 10, fuerza: 8, alineamiento: 10 }, vaciarObjetos: true, out: 'Te quedas con la túnica, el sable y nada más. Se respira raro de bien.' },
        { t: 'Guardar solo una cosa', fx: { cordura: 6, fuerza: 4 }, out: 'Todos guardan una cosa. Los maestros lo saben y callan.' },
        { t: 'Quedártelo todo y que se enteren si quieren', fx: { alineamiento: -10, reputacion: -8, fuerza: -5 }, faccion: 'orden_jedi-12', out: 'Un maestro te lo menciona una vez. Solo una.' }
      ]
    },
    {
      id: 'jd_mision_consejo', min: 14, max: 90, w: 15, req: esJedi, slots: { p: 'mundo', n: 'nombre' },
      t: 'El Consejo te envía a {p}. La misión es observar e informar. Nada más.',
      c: [
        { t: 'Observar e informar, como te han pedido', fx: { fuerza: 8, cordura: 8, reputacion: 6 }, faccion: 'orden_jedi+12', mueveA: '{p}', motivo: 'enviado por el Consejo', out: 'Cumples al pie de la letra. El informe cambia una política. Nadie sabrá que fuiste tú.' },
        { t: 'Intervenir cuando ves lo que está pasando', fx: { alineamiento: 15, fuerza: 6, reputacion: -8 }, faccion: 'orden_jedi-10', mueveA: '{p}', motivo: 'a una misión del Consejo', out: 'Salvas a mucha gente. El Consejo te recuerda que no era tu misión.' },
        { t: 'Ir por libre y resolverlo a tu manera', fx: { fuerza: 10, alineamiento: -8, notoriedad: 10 }, faccion: 'orden_jedi-18', mueveA: '{p}', motivo: 'sin autorización del Consejo', out: 'Funciona. Ese es el problema: que funciona.' },
        { t: 'Pedir que envíen a otro', fx: { cordura: 6, reputacion: -6 }, out: 'Aceptan sin preguntar. Eso te preocupa más que la misión.' }
      ]
    },
    {
      id: 'jd_padawan', min: 30, max: 120, w: 11, req: function (s) { return esJedi(s) && s.stats.fuerza > 55; },
      t: 'Ya tienes rango para tomar un padawan. Hay un iniciado esperando.',
      c: [
        { t: 'Aceptarle', fx: { cordura: 12, carisma: 10, fuerza: 6 }, rel: { tipo: 'padawan', afecto: 55, quien: 'tu aprendiz' }, out: 'Le cortas la trenza tú mismo. Es tan torpe como lo eras tú.' },
        { t: 'Rechazarlo: no estás preparado para enseñar', fx: { cordura: 8, fuerza: 4, reputacion: -6 }, out: 'El Consejo lo anota. Lo entienden mejor de lo que esperabas.' },
        { t: 'Aceptarle y enseñarle también lo que la Orden calla', fx: { fuerza: 12, alineamiento: -10, intelecto: 8 }, rel: { tipo: 'padawan', afecto: 45, quien: 'tu aprendiz' }, flag: 'ensena_prohibido', out: 'Aprende rápido. Demasiado rápido.' }
      ]
    },
    {
      id: 'jd_tentacion_oscura', min: 16, max: 90, w: 12, req: function (s) { return senda(s) && s.stats.fuerza > 40; }, slots: { n: 'nombre' },
      t: 'Alguien a quien quieres está en peligro y hay una forma de salvarle. Una forma que te enseñaron a no usar.',
      c: [
        { t: 'Usarla', fx: { fuerza: 18, alineamiento: -25, cordura: -15 }, flag: 'cruzo_la_linea', out: 'Funciona. Se salva. Y algo dentro de ti se queda encendido.' },
        { t: 'Buscar otra manera aunque tardes más', r: [
          { p: 0.55, t: 'Llegas a tiempo por los pelos.', fx: { alineamiento: 20, cordura: 12, fuerza: 8 } },
          { p: 0.45, t: 'No llegas.', fx: { cordura: -22, alineamiento: 12, fuerza: 6 }, matarRel: true }
        ] },
        { t: 'Pedir ayuda en vez de resolverlo solo', fx: { carisma: 12, alineamiento: 12, cordura: 8 }, relTodas: 15, out: 'Vienen. Entre varios sale bien. La lección tarda años en calar.' }
      ]
    },
    {
      id: 'sh_maestro_prueba', min: 16, max: 90, w: 14, req: esSith,
      t: 'Tu maestro te pone una prueba. Las pruebas de tu maestro nunca son lo que parecen.',
      c: [
        { t: 'Superarla con obediencia perfecta', fx: { fuerza: 12, alineamiento: -10, cordura: -6 }, out: 'Aprueba con un gesto. La obediencia perfecta le aburre y le tranquiliza.' },
        { t: 'Superarla haciendo trampas', fx: { fuerza: 14, intelecto: 10, alineamiento: -12 }, flag: 'maestro_impresionado', out: '"Bien." Es la primera vez que te dice algo bueno.' },
        { t: 'Fallarla a propósito para que te subestime', fx: { intelecto: 14, cordura: 8, fuerza: 4 }, flag: 'juega_largo', out: 'Te castiga. Tú cuentas los días.' },
        { t: 'Negarte a hacerla', fx: { salud: -25, cordura: -10, alineamiento: 12 }, out: 'El castigo es físico y largo. No vuelves a negarte igual.' }
      ]
    },
    {
      id: 'sh_secreto', min: 16, max: 90, w: 12, req: esSith,
      t: 'Los Sith llevan un milenio escondidos. Alguien empieza a sospechar de ti.',
      c: [
        { t: 'Eliminar el problema', fx: { alineamiento: -22, notoriedad: 8, cordura: -10 }, flag: 'sangre_en_manos', out: 'Nadie relaciona la desaparición contigo. Tu maestro sí, y asiente.' },
        { t: 'Desaparecer y reaparecer con otro nombre', fx: { intelecto: 10, notoriedad: -12, cordura: -6 }, mover: true, motivo: 'borrando tu rastro', flag: 'identidad_falsa', out: 'Otro sistema, otro apellido, mismos ojos.' },
        { t: 'Dejar que sospechen: te divierte', fx: { notoriedad: 20, fuerza: 8, alineamiento: -8 }, out: 'Jugar con eso es exactamente lo que tu maestro te dijo que no hicieras.' }
      ]
    },
    {
      id: 'fz_ilum', min: 10, max: 60, w: 10,
      req: function (s) { return s.sensible && !s.kyber && s.stats.fuerza > 25 && SW.ordenActiva(s.era); },
      t: 'Te llevan a las cuevas heladas. Te dejan solo, sin luz, y te dicen que no vuelvas sin tu cristal.',
      c: [
        { t: 'Escuchar hasta que algo cante', fx: { fuerza: 12, cordura: 12, salud: -8 }, kyber: true, out: '' },
        { t: 'Buscar a la desesperada', fx: { fuerza: 6, cordura: -10, salud: -14 }, kyber: true, out: 'Sales con un cristal y una hipotermia leve.' },
        { t: 'Salir con las manos vacías', fx: { cordura: -12, fuerza: -6, reputacion: -8 }, out: 'Algunos vuelven al año siguiente. Otros no vuelven.' }
      ]
    },
    {
      id: 'fz_sable_oscuro', min: 20, max: 120, w: 3,
      req: function (s) { return !s.flags.sable_oscuro && (s.faccionRep.mandalorianos || 0) > 25 && SW.SABLE_OSCURO.eras.indexOf(s.era) >= 0; },
      t: 'Corre la voz de que el <b>Sable Oscuro</b> ha cambiado de manos otra vez. Quien lo tiene ahora está a un salto de aquí, y el Credo es claro: solo se gana en combate.',
      c: [
        { t: 'Ir a por él', combate: { dif: 86, duelo: true, sableOscuro: true }, fx: { notoriedad: 15 }, out: '' },
        { t: 'Intentar comprárselo', fx: { creditos: -60000, reputacion: -10 }, faccion: 'mandalorianos-20', out: 'Se ríe en tu cara. Ofrecer créditos por eso es un insulto que se recuerda.' },
        { t: 'Dejarlo estar: ese sable trae guerras civiles', fx: { cordura: 10, intelecto: 6 }, out: 'Históricamente, es la decisión más sensata que ha tomado nadie con ese objeto.' }
      ]
    },
    {
      id: 'fz_holocron_leer', min: 16, max: 120, w: 10, req: function (s) { return s.sensible && s.objetos.some(function (o) { return /holocr/i.test(o); }); },
      t: 'El holocrón que llevas encima lleva semanas zumbando bajito. Quiere que lo abras.',
      c: [
        { t: 'Abrirlo del todo', fx: { fuerza: 16, intelecto: 10, cordura: -8 }, poder: 'auto', out: 'Una maestra muerta hace siglos te da clase durante tres noches.' },
        { t: 'Abrirlo solo un poco', fx: { fuerza: 8, cordura: 5 }, out: 'Aprendes una cosa pequeña y muy útil.' },
        { t: 'Enterrarlo', fx: { alineamiento: 10, cordura: 10 }, out: 'Duermes mejor. Piensas en él cada cierto tiempo.' }
      ]
    }
  ]);

  /* ============================================================
     LO QUE UN JEDI O UN SITH NO PUEDE HACER
     Se comprueba en los propios eventos, pero también aquí:
     estas funciones las usa el motor para filtrar.
     ============================================================ */
  SW.puedeAlistarse = function (s) {
    if (s.trabajo === 'sith') return false;   // los Sith no se alistan: manipulan
    if (s.trabajo === 'jedi') return false;   // los Jedi sirven a la Orden, no a un ejército
    return true;
  };
  SW.puedeCasarse = function (s) {
    return s.trabajo !== 'jedi' || !!s.flags.apego_secreto || !!s.flags.dejo_la_orden;
  };
  SW.puedeAcumular = function (s) {
    return s.trabajo !== 'jedi';
  };

})(window);

/* ============================================================
   HOLOVIDA :: SEGUNDA TANDA DE MEJORAS
   Calendario galáctico, los momentos que definen cada época,
   nombres que cambian con el poder de turno, una ambición que
   llevas toda la vida, dificultad al empezar y un salón de la
   fama con las vidas anteriores.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     1 · CALENDARIO GALÁCTICO
     Saber que naciste en el 32 ABY y que la Orden 66 te pilló con
     trece años cambia por completo cómo se lee una vida.
     ============================================================ */
  /* Año de nacimiento de cada época. No es el año en que la época
     empieza: es el año en que hay que nacer para VIVIRLA de joven.
     Naciendo el mismo día que empiezan las Guerras Clon las vives con
     tres años y a los seis ya no hay Orden Jedi a la que presentarse:
     elegir «Guerras Clon» dejaba de significar nada. */
  SW.ANIO_ERA = {
    alta_republica: -250,    // adulto en plena expansión de la Frontera
    republica_tardia: -60,   // veinteañero en los años de Naboo
    guerras_clon: -38,       // 16 en Geonosis, 19 cuando cae la Orden
    imperio_temprano: -32,   // 13 en la Purga, adulto bajo el Imperio
    rebelion: -20,           // 18 en Yavin
    nueva_republica: -10,    // 14 en Endor, adulto en la República nueva
    primera_orden: 10,       // 24 cuando se apaga el sistema Hosnian
    era_perdida: -3000
  };

  /** Año galáctico en el que estás ahora mismo.
      El año de nacimiento se fija UNA vez: si se recalcula con la era
      actual, al cambiar de época el calendario pega un salto (naces en
      el 2 ABY, cumples 40 y te dice que estás en el 68 DBY). */
  SW.anioNacimiento = function (s) {
    if (s.anioNace == null) s.anioNace = SW.ANIO_ERA[s.eraNace || s.era];
    return s.anioNace;
  };
  SW.anioGalactico = function (s) {
    const base = SW.anioNacimiento(s);
    if (base == null) return null;
    return base + (s.edad || 0);
  };

  SW.formatoAnio = function (y) {
    if (y == null) return '';
    if (y < 0) return Math.abs(y) + ' ABY';
    if (y === 0) return 'año 0';
    return y + ' DBY';
  };

  /* ============================================================
     1b · LA ÉPOCA AVANZA CONTIGO
     Alguien nacido en el 22 ABY vive las Guerras Clon con tres
     años, el Imperio con veinte y la Nueva República con setenta.
     Hasta ahora la era se fijaba al nacer y te morías de viejo
     «durante las Guerras Clon», con la Confederación todavía en pie
     cincuenta años después de rendirse.
     ============================================================ */
  SW.LIMITES_ERA = [
    { id: 'alta_republica',   hasta: -100 },
    { id: 'republica_tardia', hasta: -22 },
    { id: 'guerras_clon',     hasta: -19 },
    { id: 'imperio_temprano', hasta: -2 },
    { id: 'rebelion',         hasta: 5 },
    { id: 'nueva_republica',  hasta: 28 },
    { id: 'primera_orden',    hasta: 9999 }
  ];

  SW.eraDeAnio = function (y) {
    for (let i = 0; i < SW.LIMITES_ERA.length; i++) {
      if (y < SW.LIMITES_ERA[i].hasta) return SW.LIMITES_ERA[i].id;
    }
    return 'primera_orden';
  };

  const CAMBIO = {
    republica_tardia: 'Los Nihil son historia y la Frontera se ha calmado. Empieza otra época, más gris y más burocrática.',
    guerras_clon: 'La República se parte en dos. Hay guerra, y esta vez con ejércitos de verdad.',
    imperio_temprano: 'Se acabó la República. Ahora hay un Imperio, y lo primero que hace es cambiarle el nombre a las cosas.',
    rebelion: 'Ya no son cuatro descontentos: hay una Alianza, y el Imperio ha dejado de disimular.',
    nueva_republica: 'El Imperio ha caído. Lo que queda de él se reparte el Borde mientras un Senado nuevo discute dónde sentarse.',
    primera_orden: 'De los restos imperiales ha salido algo peor y con mejor uniforme. La Nueva República mira para otro lado.'
  };

  /** Tick anual: si el calendario ha cruzado a otra época, se cambia. */
  SW.pasoEra = function (g) {
    const s = g.s;
    if (s.eraFija) return false;               // la Era Perdida no avanza
    const y = SW.anioGalactico(s);
    if (y == null) return false;
    const nueva = SW.eraDeAnio(y);
    if (nueva === s.era) return false;
    const ficha = (SW.ERAS || []).filter(function (e) { return e.id === nueva; })[0];
    if (!ficha) return false;
    s.eraAnterior = s.era;
    s.era = nueva;
    s.eraN = ficha.n;
    /* Cada época tiene su guerra: si arrastras la bandera de que «ya
       estalló» de la época anterior, la nueva no empieza nunca. */
    if (s.guerra && !s.guerra.activa) { s.guerra = null; s.flags.guerra_estallo = false; }
    else if (!s.guerra) s.flags.guerra_estallo = false;
    s.flags['momento_' + s.era] = s.flags['momento_' + s.era] || false;
    g.log('<b class="cambio-era">' + SW.formatoAnio(y) + ' — ' + ficha.n + '.</b> ' +
          (CAMBIO[nueva] || ficha.desc), 'res');
    g.hito('Vive el paso a ' + ficha.n);
    // el mundo donde estás puede haber dejado de ser habitable
    if (SW.mundoViable && !SW.mundoViable(s.mundo, s.era) && g.mundoCercano) {
      const caido = (SW.MUNDOS_CAIDOS || {})[s.mundo];
      if (caido) g.log(caido.txt, 'mal');
      g.mover(g.mundoCercano(), 'porque allí ya no se podía estar');
    }
    return true;
  };

  /* ============================================================
     2 · LOS NOMBRES CAMBIAN CON QUIEN MANDA
     Bajo el Imperio, Coruscant es el Centro Imperial. No es un
     detalle tonto: es lo primero que hace un imperio.
     ============================================================ */
  SW.RENOMBRES = {
    imperio_temprano: { Coruscant: 'Centro Imperial' },
    rebelion: { Coruscant: 'Centro Imperial' }
  };

  SW.nombreDeMundo = function (s, mundo) {
    const r = SW.RENOMBRES[s && s.era];
    return (r && r[mundo]) || mundo;
  };

  /* ============================================================
     3 · EL MOMENTO QUE DEFINE TU ÉPOCA
     Si te toca vivirlo, lo vives. No de refilón: con una escena.
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.GUION = SW.GUION || [];

  const MOMENTOS = {
    guerras_clon: {
      anio: -19, n: 'La Orden 66',
      t: 'Los holos se cortan a la vez en toda la galaxia. Cuando vuelven, hay un Imperio y ya no hay jedi.',
      c: [
        { t: 'Esconder a alguien que huye', fx: { alineamiento: 22, cordura: -10 }, buscado: 25,
          out: 'Se queda tres semanas en tu bodega y se va sin decir adónde.' },
        { t: 'Aplaudir en la plaza como todos', fx: { alineamiento: -14, cordura: -8, reputacion: 6 },
          out: 'Aplaudes. Miras a los lados y todo el mundo mira a los lados.' },
        { t: 'Intentar entender qué ha pasado', fx: { intelecto: 12, cordura: -6 },
          out: 'Tardas años en atar los cabos. Cuando lo haces, es peor.' },
        { t: 'Marcharte al Borde ese mismo día', mover: 'cerca', motivo: 'porque el Núcleo dejó de ser un sitio',
          fx: { cordura: 6, creditos: -8000 } }
      ]
    },
    imperio_temprano: {
      anio: -14, n: 'La leva imperial',
      t: 'Llegan las cuotas: cada mundo debe entregar gente y materia prima. En {mundoAqui} ya han empezado a contar cabezas.',
      c: [
        { t: 'Presentarte voluntario', menuAlistar: true, faccion: 'imperio+18' },
        { t: 'Comprar tu exención', coste: 22000, fx: { alineamiento: -8 } },
        { t: 'Esconder a los que van en la lista', fx: { alineamiento: 20, reputacion: 12 }, buscado: 22 },
        { t: 'Aprovechar el desorden para hacer caja', fx: { creditos: 26000, alineamiento: -16 } }
      ]
    },
    rebelion: {
      anio: 0, n: 'Alderaan',
      t: 'Alderaan ya no está. No hay guerra, no hay batalla: había un planeta y ahora hay polvo. Todo el mundo se acuerda de dónde estaba ese día.',
      c: [
        { t: 'Buscar a los alderaanianos que quedaban fuera', fx: { alineamiento: 22, cordura: -12, reputacion: 12 },
          out: 'Los que estaban de viaje se quedaron sin sitio al que volver. Ayudas a los que puedes.' },
        { t: 'Decidir de qué lado estás, de una vez', fx: { cordura: 10, alineamiento: 14 }, faccion: 'rebelion+25',
          out: 'Ese día se acabó lo de mirar para otro lado.' },
        { t: 'Callarte más que nunca', fx: { cordura: -14, notoriedad: -10 },
          out: 'Si pueden hacer eso, pueden hacer cualquier cosa.' },
        { t: 'Comerciar con lo que la gente vende para huir', fx: { creditos: 40000, alineamiento: -24 } }
      ]
    },
    nueva_republica: {
      anio: 12, n: 'El reparto del Borde',
      t: 'La Nueva República dice que la guerra terminó. En el Borde Exterior nadie se ha enterado: los restos imperiales y los cárteles se están repartiendo sectores enteros.',
      c: [
        { t: 'Alistarte para poner orden', menuAlistar: true, faccion: 'nueva_republica+18' },
        { t: 'Montar tu propio negocio en el hueco', fx: { creditos: 30000, notoriedad: 10 }, flag: 'autonomo' },
        { t: 'Defender tu mundo por vuestra cuenta', fx: { reputacion: 18, fisico: 8, alineamiento: 14 } },
        { t: 'Irte al Núcleo, donde sí hay ley', mover: 'cerca', motivo: 'buscando un sitio con ley' }
      ]
    },
    primera_orden: {
      anio: 34, n: 'El sistema Hosnian',
      t: 'Se ve desde aquí. Cinco planetas apagándose a la vez en el cielo, sin ruido, como si alguien cerrara una puerta. Con ellos se va el Senado y la Nueva República.',
      c: [
        { t: 'Buscar a la Resistencia', fx: { alineamiento: 18 }, faccion: 'resistencia+25', buscado: 18 },
        { t: 'Ponerte del lado que ha ganado', fx: { creditos: 25000, alineamiento: -22 }, faccion: 'primera_orden+25' },
        { t: 'Coger a los tuyos y desaparecer', mover: 'cerca', motivo: 'hacia donde no llegue la nueva bandera',
          fx: { cordura: -8, creditos: -10000 } },
        { t: 'Seguir con tu vida como si nada', fx: { cordura: -12 } }
      ]
    },
    alta_republica: {
      anio: -230, n: 'El Gran Desastre',
      t: 'Un carguero se ha roto en pleno hiperespacio y sus pedazos están saliendo a velocidad de la luz por media Frontera. Caen del cielo, sin aviso, durante días.',
      c: [
        { t: 'Ayudar en la evacuación', fx: { alineamiento: 20, reputacion: 14, salud: -10 } },
        { t: 'Ponerte a salvo y ya', fx: { cordura: -6 } },
        { t: 'Rebuscar entre lo que cae', fx: { creditos: 18000, alineamiento: -12, salud: -8 } },
        { t: 'Preguntarte quién rompe un carguero en el hiperespacio', fx: { intelecto: 14 }, flag: 'sospecha_nihil' }
      ]
    }
  };

  /* Uno por época, no uno por vida: quien vive ochenta años ve varios. */
  SW.GUION.push({
    id: 'mm_momento', min: 3, max: 200, prio: 99, repetible: true,
    req: function (s) {
      const m = MOMENTOS[s.era];
      if (!m) return false;
      if ((s.flags || {})['momento_' + s.era]) return false;
      const y = SW.anioGalactico(s);
      return y != null && y >= m.anio;
    },
    gen: true, c: [],
    hazlo: function (g) {
      const m = MOMENTOS[g.s.era];
      if (!m) return null;
      g.s.flags['momento_' + g.s.era] = true;
      g.hito(m.n);
      /* Un crío de seis años no decide de qué lado está en una guerra
         galáctica: lo vive por debajo, mirando a los mayores. */
      const critico = g.s.edadBio < 13;
      const c = critico ? [
        { t: 'Preguntar qué pasa', fx: { intelecto: 8, cordura: -6 },
          out: 'Nadie te contesta del todo. Eso te dice bastante.' },
        { t: 'Agarrarte a los tuyos', fx: { cordura: 6 },
          out: 'Están tan asustados como tú, pero disimulan mejor.' },
        { t: 'Fijarte en todo y no olvidarlo', fx: { intelecto: 10, cordura: -4 },
          out: 'Vas a acordarte de ese día toda la vida.' },
        { t: 'Seguir jugando', fx: { cordura: 8 },
          out: 'Ya te enterarás de mayor de lo que pasó ese día.' }
      ] : m.c;
      return {
        gen: true, id: 'mm_' + g.s.era,
        t: '<span class="momento-tag">' + U.esc(m.n.toUpperCase()) + ' · ' + SW.formatoAnio(SW.anioGalactico(g.s)) + '</span>' +
           '<p>' + U.fill(m.t, { mundoAqui: g.s.mundo }) + '</p>' +
           (critico ? '<p class="dim">Tienes ' + g.s.edad + ' años y lo ves desde abajo.</p>' : ''),
        c: c
      };
    }
  });

  /* ============================================================
     4 · UNA AMBICIÓN PARA TODA LA VIDA
     Eliges qué querías conseguir. Al morir se te dice si lo hiciste.
     ============================================================ */
  SW.AMBICIONES = [
    { id: 'rico', n: 'Morir rico', d: 'Que no te falte nunca más.',
      ok: function (s) { return s.stats.creditos >= 250000; },
      medida: function (s) { return U.cr(Math.max(0, s.stats.creditos)) + ' de 250.000'; } },
    { id: 'familia', n: 'Formar una familia', d: 'Gente tuya, y que te quiera.',
      ok: function (s) { return (s.contadores.hijos || 0) >= 2 && (s.relaciones || []).some(function (r) { return r.afecto > 55; }); },
      medida: function (s) { return (s.contadores.hijos || 0) + ' hijos'; } },
    { id: 'maestro', n: 'Dominar la Fuerza', d: 'Llegar hasta donde llegue.',
      ok: function (s) { return s.sensible && s.stats.fuerza >= 80; },
      medida: function (s) { return 'Fuerza ' + s.stats.fuerza + ' de 80'; } },
    { id: 'galaxia', n: 'Ver la galaxia entera', d: 'No morirte donde naciste.',
      ok: function (s) { return (s.contadores.mundosVisitados || 0) >= 18; },
      medida: function (s) { return (s.contadores.mundosVisitados || 0) + ' mundos de 18'; } },
    { id: 'nombre', n: 'Que se sepa tu nombre', d: 'Fama, para bien o para mal.',
      ok: function (s) { return s.stats.reputacion >= 80 || s.stats.notoriedad >= 85; },
      medida: function (s) { return 'reputación ' + s.stats.reputacion + ' · notoriedad ' + s.stats.notoriedad; } },
    { id: 'justo', n: 'Vivir sin deber nada a nadie', d: 'Irte con las manos limpias.',
      ok: function (s) { return s.stats.alineamiento >= 55 && (s.buscado || 0) < 15; },
      medida: function (s) { return SW.etiquetaAlineamiento(s.stats.alineamiento); } },
    { id: 'poder', n: 'Mandar sobre otros', d: 'Que las decisiones sean tuyas.',
      ok: function (s) { return (s.escalonPolitico || 0) >= 3 || /maestro|general|jefe|figura|gobernador/i.test(s.rango || ''); },
      medida: function (s) { return s.rango || 'sin cargo'; } },
    { id: 'paz', n: 'Llegar a viejo en paz', d: 'Sin sobresaltos y con la cabeza en su sitio.',
      ok: function (s) { return s.edad >= 65 && s.stats.cordura >= 55; },
      medida: function (s) { return s.edad + ' años · cordura ' + s.stats.cordura; } },
    { id: 'legado', n: 'Dejar algo detrás', d: 'Que quede una cosa cuando tú no estés.',
      ok: function (s) { return !!s.legado || (s.titulos || []).length >= 2; },
      medida: function (s) { return s.legado || ((s.titulos || []).length + ' títulos'); } }
  ];

  SW.ambicionDe = function (s) {
    return SW.AMBICIONES.filter(function (a) { return a.id === s.ambicion; })[0] || null;
  };
  SW.cumpleAmbicion = function (s) {
    const a = SW.ambicionDe(s);
    if (!a) return null;
    let ok = false;
    try { ok = a.ok(s); } catch (e) { ok = false; }
    let m = '';
    try { m = a.medida(s); } catch (e) { m = ''; }
    return { n: a.n, d: a.d, ok: ok, medida: m };
  };

  /* ============================================================
     5 · DIFICULTAD
     No todo el mundo quiere lo mismo de una partida.
     ============================================================ */
  SW.DIFICULTADES = [
    { id: 'suave', n: 'Acomodada', d: 'Empiezas con dinero, mueres menos y la vejez perdona.',
      creditos: 20000, letal: 0.55, salud: 12 },
    { id: 'normal', n: 'Normal', d: 'La galaxia como es.', creditos: 0, letal: 1, salud: 0 },
    { id: 'dura', n: 'Dura', d: 'Sin colchón, todo cuesta y cualquier error se paga.',
      creditos: -3000, letal: 1.5, salud: -10 }
  ];
  SW.dificultadDe = function (s) {
    return SW.DIFICULTADES.filter(function (d) { return d.id === (s && s.dificultad); })[0] || SW.DIFICULTADES[1];
  };

  /* ============================================================
     6 · SALÓN DE LA FAMA
     Las vidas anteriores, guardadas en el propio navegador.
     ============================================================ */
  const CLAVE = 'holovida_salon';

  SW.guardarEnSalon = function (s) {
    try {
      const previo = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      const amb = SW.cumpleAmbicion(s);
      previo.unshift({
        n: s.nombre, e: s.especieN, era: s.eraN, ed: s.edad,
        cm: s.causaMuerte || '', cr: s.stats.creditos,
        rep: s.stats.reputacion, not: s.stats.notoriedad,
        amb: amb ? amb.n : null, ok: amb ? !!amb.ok : null,
        tr: (SW.tramasDe ? SW.tramasDe(s) : []).filter(function (x) { return x.cerrada; }).length,
        hi: (s.hitos || []).length, t: Date.now()
      });
      localStorage.setItem(CLAVE, JSON.stringify(previo.slice(0, 12)));
    } catch (e) { /* sin almacenamiento, sin salón */ }
  };

  SW.leerSalon = function () {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { return []; }
  };
  SW.borrarSalon = function () { try { localStorage.removeItem(CLAVE); } catch (e) {} };

})(typeof window !== 'undefined' ? window : globalThis);

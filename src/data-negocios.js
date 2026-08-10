/* ============================================================
   HOLOVIDA :: NEGOCIOS
   Por encima de 200.000 créditos lo único que pasaba era que te
   cobraban mantenimiento: el dinero dejaba de ser una decisión y
   pasaba a ser un número que sube. Se podía ser magnate galáctico
   sin que la galaxia se enterase.

   Un negocio no es sólo renta: es exposición. Alguien te extorsiona,
   un rival te lo quema, el Imperio te lo nacionaliza, tu encargado
   te roba durante seis años. Eso convierte los créditos en algo que
   hay que defender.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.GUION = SW.GUION || [];

  const TIPOS = [
    { id: 'cantina', n: 'Cantina', ic: '⌾', precio: 60000, renta: 0.16, riesgo: 0.22,
      d: 'Ruido, mesas pegajosas y todo el mundo hablando de más. Se entera de cosas antes que nadie.',
      extra: 'rumores' },
    { id: 'hangar', n: 'Hangar de reparaciones', ic: '⚙', precio: 90000, renta: 0.14, riesgo: 0.14,
      d: 'Naves rotas y gente con prisa. El sitio más aburrido y más rentable del puerto.',
      extra: 'casco' },
    { id: 'carga', n: 'Línea de carga', ic: '▤', precio: 140000, renta: 0.19, riesgo: 0.26,
      d: 'Tres cargueros viejos y una ruta fija. Legal casi siempre.',
      extra: 'mercancia' },
    { id: 'chatarra', n: 'Desguace', ic: '⛁', precio: 45000, renta: 0.12, riesgo: 0.10,
      d: 'Un descampado con montañas de metal. Aparecen cosas.',
      extra: 'piezas' },
    { id: 'apuestas', n: 'Casa de apuestas', ic: '◈', precio: 110000, renta: 0.26, riesgo: 0.38,
      d: 'La que más da y la que más gente cabrea.', ilegal: true, extra: 'deudas' },
    { id: 'clinica', n: 'Clínica de barrio', ic: '✚', precio: 75000, renta: 0.10, riesgo: 0.08,
      d: 'No es negocio, es otra cosa. La gente se acuerda.', extra: 'salud' }
  ];
  SW.NEGOCIOS = TIPOS;

  SW.negocios = function (s) { return s.negocios || []; };
  SW.rentaAnual = function (s) {
    return (s.negocios || []).reduce(function (a, n) {
      return a + Math.round(n.precio * n.renta * (n.estado / 100));
    }, 0);
  };

  SW.ACTIVIDADES.push({
    id: 'negocios', n: 'Negocios', ico: '⌸', min: 18,
    desc: 'Comprar locales, cuidarlos y defenderlos de quien venga.',
    req: function (s) { return s.stats.creditos >= 40000 || (s.negocios && s.negocios.length); }
  });

  SW.menuNegocios = function (g) {
    const s = g.s, rng = g.rng;
    s.negocios = s.negocios || [];
    const c = [];
    const m = SW.mundo(s.mundo);

    s.negocios.forEach(function (n, i) {
      const T = TIPOS.filter(function (t) { return t.id === n.tipo; })[0] || {};
      const renta = Math.round(n.precio * n.renta * (n.estado / 100));
      c.push({ t: T.ic + ' ' + n.n + ' (' + n.mundo + ') — ' + U.cr(renta) + '/año',
        sub: 'estado ' + n.estado + '% · ' + (n.encargado ? 'lleva ' + n.encargado : 'sin encargado, lo llevas tú') +
             (n.presion ? ' · alguien le está apretando' : ''),
        verNegocio: i });
    });

    if (s.negocios.length < 5) {
      const yaAqui = s.negocios.filter(function (n) { return n.mundo === s.mundo; }).length;
      rng.pickN(TIPOS, 3).forEach(function (T) {
        const precio = Math.round(T.precio * (0.8 + rng.next() * 0.5) * (1 + (m.riq - 5) * 0.05) * (1 + yaAqui * 0.15));
        const puede = s.stats.creditos >= precio;
        c.push({ t: (puede ? 'Comprar ' : '✕ ') + T.n + ' en ' + s.mundo + ' — ' + U.cr(precio),
          sub: T.d + ' · renta ~' + Math.round(T.renta * 100) + '% al año' +
               (T.ilegal ? ' · ilegal donde hay ley' : '') + (puede ? '' : ' · no te llega'),
          bloqueada: !puede,
          comprarNegocio: puede ? { tipo: T.id, precio: precio, mundo: s.mundo } : null });
      });
    }
    c.push({ t: '◂ Salir', volver: true });

    const total = SW.rentaAnual(s);
    return {
      id: 'menu_negocios', gen: true, esMenu: true,
      t: '<span class="scene-tag">LO QUE ES TUYO</span>' +
        (s.negocios.length
          ? '<p>' + s.negocios.length + ' negocio' + (s.negocios.length > 1 ? 's' : '') +
            ' que te dan <b>' + U.cr(total) + '</b> al año sin que hagas nada. Que no es lo mismo que ' +
            'sin que te cueste nada.</p>'
          : '<p>Tienes ' + U.cr(s.stats.creditos) + ' parados. El dinero quieto se lo come el mantenimiento; ' +
            'el dinero puesto en algo da problemas, que es una forma de que pase algo.</p>') +
        '<p class="dim">' + U.esc(s.mundo) + ': riqueza ' + m.riq + '/10 · ley ' + m.ley + '/10</p>',
      c: c
    };
  };

  /* --- la ficha de un local: aquí se cuida o se descuida --- */
  SW.menuNegocio = function (g, i) {
    const s = g.s, n = (s.negocios || [])[i];
    if (!n) return null;
    const T = TIPOS.filter(function (t) { return t.id === n.tipo; })[0] || {};
    const renta = Math.round(n.precio * n.renta * (n.estado / 100));
    const c = [
      { t: 'Meterle dinero', sub: 'Sube el estado y con él la renta.',
        coste: Math.round(n.precio * 0.15), negocioArregla: i, fx: { } },
      { t: n.encargado ? 'Cambiar de encargado' : 'Poner un encargado',
        sub: n.encargado ? 'El de ahora no te acaba de convencer.' : 'Cobra, pero te quita el problema de encima.',
        negocioEncargado: i, coste: 5000 },
      { t: 'Pasarte a menudo y que te vean', sub: 'Sin encargado esto es lo que lo sostiene.',
        negocioAtiende: i, fx: { cordura: -4, carisma: 4 } },
      { t: 'Venderlo — ' + U.cr(Math.round(n.precio * 0.7 * (n.estado / 100))),
        sub: 'Se vende peor de lo que se compra. Siempre.', negocioVende: i },
      { t: '◂ Volver', volver: true }
    ];
    return {
      id: 'ficha_negocio', gen: true, esMenu: true,
      t: '<span class="scene-tag">' + U.esc(n.n.toUpperCase()) + '</span>' +
        '<p>' + U.esc(T.d || '') + '</p>' +
        '<p class="dim">En ' + U.esc(n.mundo) + ' · comprado por ' + U.cr(n.precio) +
        ' · estado ' + n.estado + '% · renta ' + U.cr(renta) + '/año' +
        (n.encargado ? ' · lo lleva ' + U.esc(n.encargado) : '') + '</p>',
      c: c
    };
  };

  /* ------------------------------------------------------------
     El año de los negocios: renta, desgaste y problemas
     ------------------------------------------------------------ */
  SW.pasoNegocios = function (g) {
    const s = g.s, rng = g.rng;
    if (!s.negocios || !s.negocios.length) return;
    let renta = 0;
    s.negocios.forEach(function (n) {
      n.años = (n.años || 0) + 1;
      // se desgasta más rápido si no estás ni pones a nadie
      const cuidado = n.encargado ? 4 : (n.mundo === s.mundo ? 6 : 12);
      n.estado = U.clamp(n.estado - cuidado + rng.int(0, 3), 0, 100);
      let r = Math.round(n.precio * n.renta * (n.estado / 100));
      // el encargado se lleva lo suyo, y a veces algo más
      if (n.encargado) {
        r = Math.round(r * 0.75);
        if (rng.chance(0.06)) {
          n.robo = (n.robo || 0) + 1;
          r = Math.round(r * 0.4);
        }
      }
      renta += r;
    });
    if (renta) {
      s.stats.creditos += renta;
      if (rng.chance(0.5)) g.log('Rentas de lo tuyo: ' + U.cr(renta) + '.', 'cr');
    }
  };

  /* ------------------------------------------------------------
     Y los problemas, que es para lo que se compran
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'ng_problema', min: 18, max: 200, prio: 68, repetible: true, gen: true, c: [],
    req: function (s) { return !!(s.negocios && s.negocios.length) && !s.flags['ng_' + s.edad]; },
    hazlo: function (g) {
      const s = g.s, rng = g.rng;
      const n = rng.pick(s.negocios);
      const T = TIPOS.filter(function (t) { return t.id === n.tipo; })[0] || {};
      const p = 0.16 + (T.riesgo || 0.15) + (s.stats.notoriedad / 500);
      if (!rng.chance(p)) return null;
      s.flags['ng_' + s.edad] = true;

      const cuales = ['extorsion', 'rival', 'robo', 'estado'];
      let cual = rng.pick(cuales);
      if (n.robo && rng.chance(0.6)) cual = 'robo';
      if ((s.era === 'imperio_temprano' || s.era === 'rebelion') && rng.chance(0.3)) cual = 'estado';

      if (cual === 'extorsion') {
        const cuota = Math.round(n.precio * 0.12);
        return {
          id: 'ng_extorsion', gen: true,
          t: '<span class="scene-tag">VISITA AL LOCAL</span>' +
            '<p>Tres tipos entran en <b>' + U.esc(n.n) + '</b> a media tarde, se sientan y no piden nada.</p>' +
            '<p>«Un sitio así, en un barrio así… hay que cuidarlo. Nosotros cuidamos sitios.» ' + U.cr(cuota) + ' al año.</p>',
          c: [
            { t: 'Pagar y que no vuelvan', fx: { creditos: -cuota, cordura: -6 }, negocioPresion: [n, true],
              out: 'Vuelven todos los años. La cuota sube todos los años.' },
            { t: 'Decirles quién eres', sub: 'Depende de tu notoriedad.',
              r: [
                { p: U.clamp(0.15 + s.stats.notoriedad / 150, 0.12, 0.8),
                  t: 'Se miran entre ellos, se levantan y piden perdón. Uno se disculpa dos veces.',
                  fx: { notoriedad: 8, carisma: 6 } },
                { p: 0.5, t: 'No les suena tu nombre, y ahora tienen que dejar claro que no les impresionas.',
                  fx: { salud: -18, creditos: -Math.round(cuota * 1.5) }, negocioDaño: [n, 25] }
              ] },
            { t: 'Sacarles tú mismo', combate: { dif: 58 }, fx: { notoriedad: 10 },
              sub: 'Los tres a la vez.' },
            { t: 'Cerrar el local una temporada', fx: { cordura: 4 }, negocioDaño: [n, 30],
              out: 'Cuando abres, la mitad de la clientela se ha acostumbrado a ir a otro sitio.' }
          ]
        };
      }

      if (cual === 'rival') {
        return {
          id: 'ng_rival', gen: true,
          t: '<span class="scene-tag">COMPETENCIA</span>' +
            '<p>Ha abierto otro <b>' + U.esc(T.n.toLowerCase()) + '</b> a dos calles de ' + U.esc(n.n) +
            ', más nuevo y más barato.</p><p>En dos meses te ha quitado un tercio de la gente.</p>',
          c: [
            { t: 'Bajar precios y aguantar', fx: { creditos: -Math.round(n.precio * 0.1) },
              negocioArreglaN: [n, 10], out: 'Aguantas. Los dos perdéis dinero, pero tú tenías más.' },
            { t: 'Mejorar lo tuyo hasta que no haya color',
              coste: Math.round(n.precio * 0.25), negocioArreglaN: [n, 35], fx: { intelecto: 6 },
              out: 'Reformas enteras. Vuelve la gente y vuelve con amigos.' },
            { t: 'Comprarles el negocio', sub: 'Si tienes con qué.',
              coste: Math.round(n.precio * 0.8), negocioArreglaN: [n, 20], fx: { reputacion: 6, notoriedad: 6 },
              out: 'Aceptan a la primera, que es señal de que iban peor de lo que parecía.' },
            { t: 'Que les pase algo', sub: 'No preguntas cómo.',
              fx: { alineamiento: -25, notoriedad: 16, creditos: -12000 }, buscado: 20,
              negocioArreglaN: [n, 25], flag: 'quemo_a_un_rival',
              out: 'A las tres semanas hay un incendio. Nadie te lo va a preguntar a la cara.' }
          ]
        };
      }

      if (cual === 'robo') {
        const cuanto = Math.round(n.precio * 0.2 * (n.robo || 1));
        return {
          id: 'ng_robo', gen: true,
          t: '<span class="scene-tag">LAS CUENTAS</span>' +
            '<p>Te sientas por fin con los libros de <b>' + U.esc(n.n) + '</b> y no cuadran. ' +
            'No cuadran desde hace ' + (n.robo || 1) + ' año' + ((n.robo || 1) > 1 ? 's' : '') + '.</p>' +
            '<p>' + (n.encargado ? U.esc(n.encargado) + ' lleva sacando ' + U.cr(cuanto) + '.'
                                 : 'Alguien de dentro lleva sacando ' + U.cr(cuanto) + '.') + '</p>',
          c: [
            { t: 'Echarle y olvidarlo', fx: { creditos: -Math.round(cuanto * 0.3), cordura: -6 },
              negocioSinEncargado: n, negocioLimpiaRobo: n,
              out: 'Recuperas parte. Lo demás se ha ido en cosas que no vuelven.' },
            { t: 'Hacérselo pagar', fx: { alineamiento: -18, notoriedad: 12, creditos: cuanto },
              negocioSinEncargado: n, negocioLimpiaRobo: n,
              out: 'Devuelve hasta el último crédito. Y no vuelve a trabajar en este sector.' },
            { t: 'Preguntarle por qué', sub: 'A veces hay un por qué.',
              r: [
                { p: 0.5, t: 'Su hija lleva dos años en una clínica que cuesta exactamente eso.',
                  fx: { alineamiento: 20, cordura: 10, creditos: -cuanto }, negocioLimpiaRobo: n,
                  out: 'Le subes el sueldo y no volvéis a hablar del tema. No vuelve a faltar un crédito.' },
                { p: 0.5, t: 'No hay por qué. Había una oportunidad y la cogió.',
                  fx: { cordura: -8 }, negocioSinEncargado: n, negocioLimpiaRobo: n }
              ] },
            { t: 'Dejarlo estar: ya te enterarás del todo algún día',
              fx: { cordura: -10 }, out: 'Sigue sacando. Cada año un poco más.' }
          ]
        };
      }

      // el estado se fija en lo tuyo
      const multa = Math.round(n.precio * 0.3);
      return {
        id: 'ng_estado', gen: true,
        t: '<span class="scene-tag">INSPECCIÓN</span>' +
          '<p>Llega una notificación con sello oficial sobre <b>' + U.esc(n.n) + '</b>: licencias, ' +
          'impuestos atrasados y «una revisión de la titularidad».</p>' +
          '<p>' + (T.ilegal ? 'Y lo tuyo, además, no es del todo legal.' :
            'Todo está en regla. Eso no siempre importa.') + '</p>',
        c: [
          { t: 'Pagar lo que pidan', fx: { creditos: -multa, cordura: -4 },
            out: 'Se va todo en papeleo. El local sigue siendo tuyo.' },
          { t: 'Sobornar al inspector',
            r: [
              { p: U.clamp(0.35 + s.stats.carisma / 220, 0.3, 0.82),
                t: 'Acepta con una naturalidad que da un poco de miedo.',
                fx: { creditos: -Math.round(multa * 0.4), alineamiento: -10 } },
              { p: 0.4, t: 'No acepta, y ahora hay dos expedientes.',
                fx: { creditos: -Math.round(multa * 1.8), notoriedad: 10 }, buscado: 15 }
            ] },
          { t: 'Pelearlo con abogados', req: function (st) { return st.stats.intelecto > 50; },
            fx: { creditos: -Math.round(multa * 0.3), intelecto: 8, reputacion: 6 },
            out: 'Catorce meses de recursos. Ganas tú, que es lo raro.' },
          { t: 'Perderlo', fx: { cordura: -14 }, negocioPierde: n,
            out: 'Un funcionario firma un papel y deja de ser tuyo. Así de rápido.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

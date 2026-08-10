/* ============================================================
   HOLOVIDA :: LA BODEGA
   La lonja estaba escondida como una opción más dentro del menú de
   Mercado, compitiendo con las chucherías y los médicos, y encima
   dejaba comprar mercancía sin tener dónde meterla. Así que comprabas
   la nave para comerciar y la nave no servía para nada.

   Ahora la Bodega es su propia pestaña, sólo aparece si tienes nave,
   y comprar es una decisión con dos salidas: colocarlo cerca hoy
   mismo, o guardarlo y buscarle un mundo donde valga el triple.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];

  SW.ACTIVIDADES.push({
    id: 'mercancia', n: 'Bodega', ico: '▣', min: 14,
    desc: 'Comprar barato, colocarlo caro. Hace falta nave.',
    req: function (s) { return !!s.nave; }
  });

  const CATALOGO = [
    { n: 'grano y raciones', base: 4000, ilegal: false, d: 'Nadie lo mira. Nadie paga mucho.' },
    { n: 'piezas de repuesto', base: 9000, ilegal: false, d: 'Se vende solo en mundos industriales.' },
    { n: 'medicinas de bacta', base: 18000, ilegal: false, d: 'Vale una fortuna donde hay guerra.' },
    { n: 'mineral en bruto', base: 15000, ilegal: false, d: 'Pesa. Ocupa. Se paga por volumen.' },
    { n: 'licor de contrabando', base: 12000, ilegal: true, d: 'Ilegal en los mundos con ley y muy querido en los demás.' },
    { n: 'especia sin refinar', base: 30000, ilegal: true, d: 'El margen es enorme. El problema también.' },
    { n: 'armas sin registrar', base: 26000, ilegal: true, d: 'Siempre hay alguien empezando una guerra pequeña.' },
    { n: 'reliquias sin procedencia', base: 40000, ilegal: true, d: 'Coleccionistas que no preguntan y aduanas que sí.' }
  ];

  /** Qué se paga por algo en un mundo, sin haberlo comprado todavía. */
  const valorEn = function (s, art, coste, mundo) {
    const m = SW.mundo(mundo), o = SW.mundo(s.mundo);
    const saltos = SW.saltosEntre(s.mundo, mundo);
    let f = 1 + saltos * 0.055 + (m.riq - o.riq) * 0.04;
    if (art.ilegal) f += (9 - m.ley) * 0.035; else f -= Math.max(0, 5 - m.ley) * 0.02;
    f += (s.stats.carisma - 50) / 420;
    f += ((art.ilegal ? s.stats.notoriedad : s.stats.reputacion) - 40) / 600;
    return Math.round(coste * U.clamp(f, 0.4, 2.1));
  };

  /** El mejor destino conocido para lo que llevas: la pista que hace
      que el mapa signifique algo. */
  SW.mejorMercadoPara = function (g) {
    const s = g.s;
    if (!s.carga) return null;
    let mejor = null, mejorV = -1;
    (SW.MUNDO_NOMBRES || []).forEach(function (n) {
      if (n === s.mundo) return;
      if (SW.mundoViable && !SW.mundoViable(n, s.era)) return;
      if (SW.saltosEntre(s.mundo, n) > 4) return;
      const v = g.valorCargaEn(n);
      if (v > mejorV) { mejorV = v; mejor = n; }
    });
    return mejor ? { mundo: mejor, valor: mejorV } : null;
  };

  SW.menuBodega = function (g) {
    const s = g.s, rng = g.rng;
    const m = SW.mundo(s.mundo);
    const c = [];

    /* --- si ya llevas algo, lo primero es qué hacer con ello --- */
    if (s.carga) {
      const aqui = g.valorCargaEn(s.mundo);
      const dif = aqui - s.carga.coste;
      const mejor = SW.mejorMercadoPara(g);
      c.push({ t: 'Vender aquí — ' + U.cr(aqui),
        sub: (dif >= 0 ? 'ganas ' + U.cr(dif) : 'pierdes ' + U.cr(-dif)) +
             ' sobre lo que pagaste' + (s.carga.ilegal ? ' · ilegal aquí si hay ley' : ''),
        venderCarga: true });
      if (mejor) {
        c.push({ t: 'Llevarlo a ' + mejor.mundo + ' — pagan ' + U.cr(mejor.valor),
          sub: SW.saltosEntre(s.mundo, mejor.mundo) + ' saltos. Se abre la carta estelar.',
          viajarA: mejor.mundo });
      }
      c.push({ t: 'Tirar la carga por la esclusa',
        sub: 'Pierdes lo pagado y dejas de llevar encima algo que te puede costar la nave.',
        tirarCarga: true });
      c.push({ t: '◂ Dejarlo en bodega y salir', volver: true });
      return {
        id: 'bodega_llena', gen: true, esMenu: true,
        t: '<span class="scene-tag">BODEGA · ' + U.esc(s.nave.n.toUpperCase()) + '</span>' +
          '<p>Llevas <b>' + U.esc(s.carga.n) + '</b>, cargado en ' + U.esc(s.carga.origen) +
          ' por ' + U.cr(s.carga.coste) + '.</p>' +
          '<p class="dim">' + U.esc(s.mundo) + ': riqueza ' + m.riq + '/10 · ley ' + m.ley + '/10' +
          (s.carga.ilegal ? ' — y esto no se puede enseñar en la aduana.' : '') + '</p>',
        c: c
      };
    }

    /* --- bodega vacía: se compra --- */
    const oferta = rng.pickN(CATALOGO, 4);
    oferta.forEach(function (x) {
      const coste = Math.round(x.base * (0.7 + rng.next() * 0.5) * (1 - (m.riq - 5) * 0.03));
      const puede = s.stats.creditos >= coste;
      // dónde se paga mejor, para que la compra sea una decisión y no un dado
      let destino = null, mejorV = -1;
      (SW.MUNDO_NOMBRES || []).forEach(function (n) {
        if (n === s.mundo) return;
        if (SW.mundoViable && !SW.mundoViable(n, s.era)) return;
        if (SW.saltosEntre(s.mundo, n) > 3) return;
        const v = valorEn(s, x, coste, n);
        if (v > mejorV) { mejorV = v; destino = n; }
      });
      c.push({
        t: (puede ? 'Cargar ' : '✕ ') + x.n + ' — ' + U.cr(coste),
        sub: x.d + (destino ? ' · en ' + destino + ' pagarían ~' + U.cr(mejorV) : '') +
             (puede ? '' : ' · no te llega'),
        bloqueada: !puede,
        cargar: puede ? { n: x.n, coste: coste, ilegal: x.ilegal } : null
      });
    });
    c.push({ t: '◂ Salir sin cargar nada', volver: true });
    return {
      id: 'bodega_vacia', gen: true, esMenu: true,
      t: '<span class="scene-tag">LONJA DE ' + U.esc(s.mundo.toUpperCase()) + '</span>' +
        '<p>Bodega libre: ' + (s.nave.carga || 1) + ' de capacidad. Se compra barato donde sobra ' +
        'y se coloca caro donde falta.</p>' +
        '<p class="dim">Riqueza ' + m.riq + '/10 · ley ' + m.ley + '/10 · tu carisma ' +
        s.stats.carisma + ' cuenta al cerrar el trato.</p>',
      c: c
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

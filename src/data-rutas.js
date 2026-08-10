/* ============================================================
   HOLOVIDA :: RUTAS
   Tener nave sólo hacía que el billete costara menos, que es la
   forma más aburrida posible de premiar una nave. Volar es elegir
   por dónde: la ruta balizada se paga y es segura; el tramo sin
   balizar es gratis y ahí fuera hay gente; y el corredor restringido
   es rápido y barato porque no estás pagando las tasas de nadie.

   La velocidad de la nave y el estado del casco mandan de verdad:
   correr más es escapar de lo que te encuentres.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};

  /* Un número que resume lo que vuela tu nave, de 0 a 1. */
  SW.solturaNave = function (s) {
    if (!s.nave) return 0;
    return U.clamp((s.nave.vel || 4) / 12 * 0.7 + (s.naveEstado || 60) / 100 * 0.3, 0.1, 1);
  };

  SW.menuRuta = function (g, destino) {
    const s = g.s;
    const saltos = SW.saltosEntre(s.mundo, destino);
    const m = SW.mundo(destino);
    const tasa = SW.costeViaje(s.mundo, destino, true, s);
    const sol = SW.solturaNave(s);
    const ley = m.ley;
    const pct = function (x) { return Math.round(U.clamp(x, 0, 1) * 100) + '%'; };

    // lo que te puedes encontrar en cada ruta
    const rPirata = U.clamp(0.30 + saltos * 0.05 - sol * 0.28, 0.08, 0.62);
    const rControl = U.clamp(0.20 + ley * 0.035 - sol * 0.12 +
      (s.carga && s.carga.ilegal ? 0.18 : 0) + s.buscado / 400, 0.08, 0.72);

    const c = [
      { t: '⬢ Ruta comercial balizada — ' + U.cr(tasa),
        sub: saltos + ' saltos · tasas pagadas, faros cada tramo. No pasa nada y no pasa nada.',
        rutaViaje: { destino: destino, tipo: 'comercial', coste: tasa } },
      { t: '◇ Tramo sin balizar — gratis',
        sub: 'Ni tasas ni faros. Riesgo de encontronazo: ' + pct(rPirata) +
             (sol > 0.6 ? ' · tu nave corre, eso ayuda' : ' · tu nave no corre mucho'),
        rutaViaje: { destino: destino, tipo: 'oscura', coste: 0, riesgo: rPirata } },
      { t: '⇥ Corredor restringido — ' + U.cr(Math.round(tasa * 0.25)),
        sub: 'La vía rápida de los convoyes militares. Rápido y barato porque no deberías estar ahí. ' +
             'Riesgo de control: ' + pct(rControl),
        rutaViaje: { destino: destino, tipo: 'atajo', coste: Math.round(tasa * 0.25), riesgo: rControl } }
    ];
    if (s.carga) {
      c.push({ t: '▣ Antes de salir: ver la bodega',
        sub: 'Llevas ' + U.esc(s.carga.n) + (s.carga.ilegal ? ' — y eso en un control es un problema' : ''),
        abrirBodega: true });
    }
    c.push({ t: '◂ No salir todavía', volver: true });

    return {
      id: 'ruta_viaje', gen: true, esMenu: true,
      t: '<span class="scene-tag">PLAN DE VUELO · ' + U.esc(destino.toUpperCase()) + '</span>' +
        '<p>' + U.esc(s.nave.n) + ' lista en la rampa. ' + saltos + ' saltos hasta ' + U.esc(destino) +
        ', que es un mundo con ley ' + ley + '/10.</p>' +
        '<p class="dim">Velocidad ' + (s.nave.vel || 4) + '/12 · casco ' + (s.naveEstado || 0) + '%. ' +
        'Correr más es poder irte de lo que te encuentres.</p>',
      c: c
    };
  };

  /* ------------------------------------------------------------
     Volar. Lo que pasa por el camino pasa antes de llegar.
     ------------------------------------------------------------ */
  SW.resolverRuta = function (g, cfg) {
    const s = g.s, rng = g.rng;
    const sol = SW.solturaNave(s);
    if (cfg.coste) g.aplicarFx({ creditos: -cfg.coste }, {});

    if (cfg.tipo === 'comercial') {
      g.log('Ruta balizada, faros cada tramo y una cola de treinta naves en la aduana. Aburrido y limpio.', 'viaje');
      g.mover(cfg.destino, 'por la ruta de siempre');
      return;
    }

    if (cfg.tipo === 'oscura') {
      if (!rng.chance(cfg.riesgo || 0.3)) {
        g.log('Tres saltos por donde no hay faros. Silencio, oscuridad y nadie. Sales gratis.', 'viaje');
        g.aplicarFx({ destreza: 4, cordura: -3 }, {});
        g.mover(cfg.destino, 'por el camino largo');
        return;
      }
      // hay alguien ahí fuera
      g.cola.unshift(g.prepararGen(SW.GEN.encuentroRuta(g, cfg.destino)));
      g.fase = 'evento';
      return;
    }

    // atajo: no es peligroso, es ilegal
    if (!rng.chance(cfg.riesgo || 0.25)) {
      g.log('Entras en el corredor restringido como si fuera tuyo y sales por el otro lado en la mitad de tiempo.', 'viaje');
      g.aplicarFx({ notoriedad: 2 }, {});
      g.mover(cfg.destino, 'por donde no se debe');
      return;
    }
    g.cola.unshift(g.prepararGen(SW.GEN.controlRuta(g, cfg.destino)));
    g.fase = 'evento';
  };

  /* --- lo que te encuentras en el tramo sin balizar --- */
  SW.GEN.encuentroRuta = function (g, destino) {
    const s = g.s, rng = g.rng;
    const sol = SW.solturaNave(s);
    const quien = rng.pick([
      { n: 'una corbeta pirata con las marcas quemadas', dif: 58 },
      { n: 'dos cazas viejos que vuelan demasiado juntos', dif: 52 },
      { n: 'un carguero que pide auxilio y no tiene avería ninguna', dif: 62 },
      { n: 'algo que no responde y no tiene luces', dif: 68 }
    ]);
    return {
      id: 'ruta_encuentro', gen: true,
      t: '<span class="scene-tag">A MITAD DE SALTO</span>' +
        '<p>Sale de la sombra de una luna muerta: ' + quien.n + '. Te tiene a tiro y lo sabe.</p>' +
        '<p class="dim">Tu nave: velocidad ' + (s.nave ? s.nave.vel : 0) + '/12 · casco ' + s.naveEstado + '%.</p>',
      c: [
        { t: 'Correr', sub: 'Depende de lo que vuele tu nave.',
          r: [
            { p: U.clamp(0.25 + sol * 0.6, 0.2, 0.88), t: 'Los dejas atrás. Para eso pagaste los motores.',
              fx: { destreza: 6, cordura: -6 }, mueveA: destino, motivo: 'con alguien detrás' },
            { p: 0.5, t: 'Te alcanzan un par de veces antes de saltar. El casco lo nota.',
              fx: { naveEstado: -22, salud: -10, cordura: -8 }, mueveA: destino, motivo: 'a trompicones' }
          ] },
        { t: 'Plantarles cara', sub: 'Combate espacial.',
          dogfight: { dif: quien.dif }, rutaTras: destino },
        { t: 'Soltar la carga y que se entretengan',
          req: function (st) { return !!st.carga; },
          sub: 'Pierdes la mercancía, salvas la nave.',
          tirarCarga: true, fx: { cordura: -8 }, mueveA: destino, motivo: 'más ligero de lo que salió' },
        { t: 'Pagar el peaje que te pidan',
          sub: 'Aquí el peaje se llama de otra manera.',
          fx: { creditos: -Math.max(3000, Math.round(Math.max(0, s.stats.creditos) * 0.18)), cordura: -6, notoriedad: 4 },
          mueveA: destino, motivo: 'después de pagar a quien no debía' }
      ]
    };
  };

  /* --- y lo que pasa cuando te paran en el corredor --- */
  SW.GEN.controlRuta = function (g, destino) {
    const s = g.s;
    const ilegal = !!(s.carga && s.carga.ilegal);
    const multa = 4000 + Math.round(Math.max(0, s.stats.creditos) * 0.08);
    return {
      id: 'ruta_control', gen: true,
      t: '<span class="scene-tag">CONTROL EN EL CORREDOR</span>' +
        '<p>Una patrullera se cruza en tu vector y te ilumina entero. «Corredor restringido. Identifíquese ' +
        'y prepare la bodega para inspección.»</p>' +
        (ilegal ? '<p><b>Llevas ' + U.esc(s.carga.n) + ' ahí detrás.</b></p>' : ''),
      c: [
        { t: 'Pagar la multa y sonreír', sub: U.cr(multa),
          fx: { creditos: -multa, cordura: -4 }, mueveA: destino, motivo: 'con una multa encima',
          out: ilegal ? 'Ni abren la bodega. Hoy tenían prisa y tú suerte.' : 'Papeleo y a otra cosa.' },
        { t: 'Hablarles bien', sub: 'Depende de tu carisma.',
          r: [
            { p: U.clamp(0.22 + s.stats.carisma / 190, 0.18, 0.72),
              t: 'Les cuentas una historia con la seguridad justa y te dejan seguir sin mirar nada.',
              fx: { carisma: 8 }, mueveA: destino, motivo: 'hablando más que volando' },
            { p: 0.55, t: 'No cuela. Abren la bodega.',
              fx: { creditos: -multa, notoriedad: ilegal ? 16 : 4 },
              buscado: ilegal ? 25 : 0, tirarCarga: !!ilegal,
              mueveA: destino, motivo: 'después de un mal rato' }
          ] },
        { t: 'Acelerar y que se fastidien', sub: 'Depende de lo que vuele tu nave.',
          r: [
            { p: U.clamp(0.20 + SW.solturaNave(s) * 0.55, 0.15, 0.8),
              t: 'Metes la nave por un desfiladero de basura orbital y los pierdes. Eso ya es una anécdota de bar.',
              fx: { destreza: 8, notoriedad: 12, naveEstado: -10 }, buscado: 15,
              mueveA: destino, motivo: 'huyendo de una patrullera' },
            { p: 0.5, t: 'No corres tanto como creías.',
              fx: { naveEstado: -25, creditos: -multa * 2, notoriedad: 18 }, buscado: 35,
              tirarCarga: !!ilegal, mueveA: destino, motivo: 'escoltado hasta la órbita' }
          ] },
        { t: 'Dar media vuelta y salir por la ruta larga',
          fx: { creditos: -Math.round(SW.costeViaje(s.mundo, destino, true, s) * 0.8), cordura: -4 },
          mueveA: destino, motivo: 'por el camino de siempre, al final',
          out: 'Pierdes semanas y dinero, pero nadie apunta tu matrícula.' }
      ]
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

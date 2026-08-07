/* ============================================================
   HOLOVIDA :: JUEGOS DE AZAR EN PIXEL ART
   Apostar era una línea de texto: "ganas / pierdes". Aquí se ve.
   Tres juegos dibujados a mano y animados en canvas:
     · dados    — dos dados que ruedan y paran
     · sabacc   — dos cartas que se voltean
     · ruleta   — una rueda que gira y frena
   El motor solo pide el resultado; la animación la lleva la
   interfaz, y el desenlace lo decide el RNG con semilla, así que
   una partida compartida sale igual.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ---------- paleta ---------- */
  const P = {
    hueso: ['#f4efe2', '#d8d0bd', '#a89e88', '#6b6354'],
    fieltro: ['#1c4a34', '#153a28', '#0e2a1c', '#08180f'],
    carta: ['#f2ecdc', '#d6cdb8', '#9d9481', '#5e574a'],
    rojo: ['#ff7a6a', '#e0452f', '#a02a1c', '#5c1610'],
    oro: ['#ffe9a8', '#e0bd5a', '#a8842e', '#5e4818'],
    metal: ['#dfe7f0', '#a3b0be', '#6a7684', '#3a434e']
  };

  /* ============================================================
     QUÉ SE JUEGA
     ============================================================ */
  SW.JUEGOS_AZAR = {
    dados: {
      n: 'Dados de chance-cube',
      regla: 'Sacas más que la casa y cobras. Empate, gana la casa.',
      // devuelve {gana, mio, suyo, texto}
      tirar: function (rng, ventaja) {
        const d = function () { return rng.int(1, 6); };
        let mio = d() + d();
        const suyo = d() + d();
        // la maña con los dados (o la Fuerza) empuja un poco
        if (ventaja > 0 && rng.chance(ventaja)) mio = Math.min(12, mio + rng.int(1, 3));
        return { gana: mio > suyo, mio: mio, suyo: suyo,
                 texto: 'Tú ' + mio + ' · la casa ' + suyo };
      }
    },
    sabacc: {
      n: 'Mano de sabacc',
      regla: 'Gana quien se acerque más a 23 sin pasarse. Pasarse es perder.',
      tirar: function (rng, ventaja) {
        const carta = function () { return rng.int(1, 11) * (rng.chance(0.18) ? -1 : 1); };
        let mio = Math.abs(carta() + carta());
        let suyo = Math.abs(carta() + carta());
        if (ventaja > 0 && rng.chance(ventaja)) mio = Math.min(23, mio + rng.int(2, 6));
        const dMio = mio > 23 ? 99 : 23 - mio;
        const dSuyo = suyo > 23 ? 99 : 23 - suyo;
        return { gana: dMio < dSuyo, mio: mio, suyo: suyo,
                 texto: 'Tú ' + mio + ' · la casa ' + suyo + (mio > 23 ? ' (te pasas)' : '') };
      }
    },
    ruleta: {
      n: 'Rueda de Cantonica',
      regla: 'Doce casillas. Eliges color: la roja paga doble, la dorada paga cinco.',
      tirar: function (rng, ventaja, apuestaColor) {
        const casilla = rng.int(0, 11);
        const color = casilla === 0 ? 'oro' : (casilla % 2 === 0 ? 'rojo' : 'negro');
        const col = apuestaColor || 'rojo';
        const gana = color === col;
        return { gana: gana, casilla: casilla, color: color, mult: col === 'oro' ? 5 : 2,
                 texto: 'Sale ' + (color === 'oro' ? 'la dorada' : color === 'rojo' ? 'roja' : 'negra') +
                        ' (casilla ' + casilla + ')' };
      }
    }
  };

  /* ============================================================
     DIBUJO
     Todo a 64×40 lógicos, escalado con los píxeles a la vista.
     ============================================================ */
  const AW = 96, AH = 56;

  function lienzo(escala) {
    const c = global.document.createElement('canvas');
    c.width = AW * escala; c.height = AH * escala;
    c.style.imageRendering = 'pixelated';
    c.style.width = '100%';
    c.style.maxWidth = (AW * escala) + 'px';
    return c;
  }
  function pin(g, e, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x * e, y * e, w * e, h * e); }

  /** fondo de tapete, común a los tres */
  function tapete(g, e) {
    pin(g, e, 0, 0, AW, AH, P.fieltro[1]);
    for (let y = 0; y < AH; y += 2) for (let x = (y / 2) % 2; x < AW; x += 2) pin(g, e, x, y, 1, 1, P.fieltro[2]);
    pin(g, e, 0, 0, AW, 1, P.fieltro[0]);
    pin(g, e, 0, AH - 1, AW, 1, P.fieltro[3]);
  }

  /* --- un dado con su cara --- */
  const CARAS = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [3, 1], [1, 3], [3, 3]],
    5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
    6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]]
  };
  function dado(g, e, x, y, cara, resaltado) {
    const s = 15;
    pin(g, e, x, y, s, s, P.hueso[3]);            // contorno
    pin(g, e, x + 1, y + 1, s - 2, s - 2, P.hueso[1]);
    pin(g, e, x + 1, y + 1, s - 3, s - 3, P.hueso[0]);   // cara, luz arriba-izq
    pin(g, e, x + 2, y + 2, s - 5, 1, '#ffffff');       // brillo del canto
    const pts = CARAS[cara] || CARAS[1];
    pts.forEach(function (p) {
      const px = x + 2 + p[0] * 3, py = y + 2 + p[1] * 3;
      pin(g, e, px, py, 2, 2, resaltado ? P.rojo[1] : P.hueso[3]);
    });
  }

  /* --- una carta --- */
  function carta(g, e, x, y, valor, boca) {
    const w = 20, h = 28;
    pin(g, e, x, y, w, h, P.carta[3]);
    pin(g, e, x, y, w - 1, h - 1, P.carta[1]);
    if (!boca) {                                   // dorso
      pin(g, e, x + 2, y + 2, w - 5, h - 5, P.fieltro[0]);
      for (let j = 3; j < h - 3; j += 3) for (let i = 3; i < w - 3; i += 3) pin(g, e, x + i, y + j, 1, 1, P.oro[1]);
      return;
    }
    pin(g, e, x, y, w - 2, h - 2, P.carta[0]);
    const neg = valor < 0;
    const v = Math.abs(valor);
    const col = neg ? P.rojo[1] : P.fieltro[0];
    // el número, en bloques
    const dig = String(v);
    let cx = x + 3;
    for (let k = 0; k < dig.length; k++) { numero(g, e, cx, y + 3, parseInt(dig[k], 10), col); cx += 6; }
    for (let k = 0; k < dig.length; k++) { numero(g, e, x + w - 9 + k * 6, y + h - 11, parseInt(dig[k], 10), col); }
    if (neg) pin(g, e, x + 3, y + 13, w - 8, 2, P.rojo[2]);
  }

  /* dígitos de 4×7 en bloques */
  const DIG = {
    0: ['111', '101', '101', '101', '101', '101', '111'],
    1: ['010', '110', '010', '010', '010', '010', '111'],
    2: ['111', '001', '001', '111', '100', '100', '111'],
    3: ['111', '001', '001', '111', '001', '001', '111'],
    4: ['101', '101', '101', '111', '001', '001', '001'],
    5: ['111', '100', '100', '111', '001', '001', '111'],
    6: ['111', '100', '100', '111', '101', '101', '111'],
    7: ['111', '001', '001', '010', '010', '010', '010'],
    8: ['111', '101', '101', '111', '101', '101', '111'],
    9: ['111', '101', '101', '111', '001', '001', '111']
  };
  function numero(g, e, x, y, d, col) {
    const m = DIG[d] || DIG[0];
    for (let j = 0; j < m.length; j++) for (let i = 0; i < m[j].length; i++) {
      if (m[j][i] === '1') pin(g, e, x + i, y + j, 1, 1, col);
    }
  }

  /* --- la rueda --- */
  function rueda(g, e, giro, resaltada) {
    const cx = AW / 2, cy = AH / 2 + 2, R = 22;
    for (let a = 0; a < 12; a++) {
      const col = a === 0 ? P.oro[1] : (a % 2 === 0 ? P.rojo[1] : '#1a1a20');
      const ini = (a / 12) * Math.PI * 2 + giro;
      const fin = ((a + 1) / 12) * Math.PI * 2 + giro;
      g.fillStyle = (resaltada === a) ? '#ffffff' : col;
      g.beginPath();
      g.moveTo(cx * e, cy * e);
      g.arc(cx * e, cy * e, R * e, ini, fin);
      g.closePath(); g.fill();
    }
    g.fillStyle = P.metal[2];
    g.beginPath(); g.arc(cx * e, cy * e, 5 * e, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.metal[0];
    g.beginPath(); g.arc(cx * e, cy * e, 3 * e, 0, Math.PI * 2); g.fill();
    // la aguja, arriba
    pin(g, e, cx - 1, cy - R - 5, 2, 6, P.oro[0]);
  }

  /* ============================================================
     ANIMACIÓN
     `alTerminar(res)` se llama cuando para.
     ============================================================ */
  SW.animarAzar = function (contenedor, juego, res, alTerminar) {
    const e = 4;
    const c = lienzo(e);
    contenedor.innerHTML = '';
    contenedor.appendChild(c);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;

    let t = 0;
    const DUR = 46;                 // fotogramas hasta parar
    let raf = 0;
    const parar = function () {
      if (raf) global.cancelAnimationFrame(raf);
      raf = 0;
      if (alTerminar) alTerminar(res);
    };

    const paso = function () {
      t++;
      const p = Math.min(1, t / DUR);
      const frenando = p * p;                        // desacelera al final
      tapete(g, e);

      if (juego === 'dados') {
        const a = p < 1 ? ((Math.random() * 6) | 0) + 1 : Math.max(1, res.mio - 6 > 0 ? 6 : res.mio - 1);
        const b = p < 1 ? ((Math.random() * 6) | 0) + 1 : Math.max(1, res.mio - (res.mio - 6 > 0 ? 6 : res.mio - 1));
        dado(g, e, 18, 18, p < 1 ? a : Math.max(1, Math.min(6, res.mio - Math.min(6, res.mio - 1))), p >= 1 && res.gana);
        dado(g, e, 46, 18, p < 1 ? b : Math.max(1, Math.min(6, Math.min(6, res.mio - 1))), p >= 1 && res.gana);
      } else if (juego === 'sabacc') {
        const abierta1 = p > 0.55, abierta2 = p > 0.85;
        carta(g, e, 16, 14, res.mio > 11 ? 11 : res.mio, abierta1);
        carta(g, e, 44, 14, res.mio > 11 ? res.mio - 11 : 0, abierta2);
      } else {
        const vel = (1 - frenando) * 0.55 + 0.004;
        rueda(g, e, t * vel, p >= 1 ? res.casilla : -1);
      }

      // marcador
      if (p >= 1) {
        pin(g, e, 0, AH - 9, AW, 9, 'rgba(0,0,0,.72)');
        g.fillStyle = res.gana ? '#7ce8a0' : '#ff8a8a';
        g.font = (5 * e) + 'px monospace';
        g.textAlign = 'center';
        g.fillText(res.gana ? 'GANAS' : 'PIERDES', (AW / 2) * e, (AH - 2.5) * e);
      }

      if (p >= 1) { global.setTimeout(parar, 620); return; }
      raf = global.requestAnimationFrame(paso);
    };
    raf = global.requestAnimationFrame(paso);
    return { cancelar: function () { if (raf) global.cancelAnimationFrame(raf); raf = 0; } };
  };

  /* ============================================================
     ESCENA: la apuesta como decisión de verdad
     ============================================================ */
  SW.iniciarApuesta = function (g, cfg) {
    const s = g.s;
    cfg = cfg || {};
    const tipo = cfg.juego || g.rng.pick(['dados', 'sabacc', 'ruleta']);
    const J = SW.JUEGOS_AZAR[tipo];
    const tope = Math.max(500, Math.round(s.stats.creditos * 0.6));
    const apuestas = [
      { n: 'Poco', v: Math.max(200, Math.round(tope * 0.12)) },
      { n: 'La mitad de lo que llevas', v: Math.max(500, Math.round(tope * 0.5)) },
      { n: 'Todo lo que llevas encima', v: tope }
    ];
    g.escena = { tipo: 'apuesta', juego: tipo, J: J };

    const c = apuestas.filter(function (a) { return s.stats.creditos >= a.v; }).map(function (a) {
      return { t: a.n + ' — ' + U.cr(a.v), apostar: a.v, juegoAzar: tipo,
               sub: 'Si ganas te llevas otro tanto' };
    });
    if (tipo === 'ruleta') {
      c.push({ t: 'A la dorada — ' + U.cr(apuestas[0].v), apostar: apuestas[0].v, juegoAzar: tipo,
               color: 'oro', sub: 'Paga cinco veces. Sale una de doce.' });
    }
    c.push({ t: '◂ No jugar', volver: true });

    return {
      id: 'escena_apuesta', gen: true, apuesta: true, juegoAzar: tipo,
      t: '<span class="scene-tag">' + J.n.toUpperCase() + '</span>' +
         '<p>' + J.regla + '</p>' +
         '<p class="dim">Llevas ' + U.cr(s.stats.creditos) + '.</p>',
      c: c
    };
  };

  /** resuelve la apuesta; la interfaz enseña la animación antes */
  SW.resolverApuesta = function (g, cantidad, tipo, color) {
    const s = g.s;
    const J = SW.JUEGOS_AZAR[tipo] || SW.JUEGOS_AZAR.dados;
    // maña: el intelecto y la suerte ayudan un poco; hacer trampa, más
    let ventaja = U.clamp((s.stats.intelecto - 45) / 260 + (s.stats.suerte - 45) / 300, 0, 0.22);
    if (s.habilidades.indexOf('tahúr') >= 0) ventaja += 0.14;
    if (s.sensible && s.stats.fuerza > 40) ventaja += 0.10;

    const res = J.tirar(g.rng, ventaja, color);
    const mult = res.mult || 2;
    if (res.gana) {
      const premio = Math.round(cantidad * (mult - 1));
      s.stats.creditos += premio;
      g.log('<b>' + J.n + '</b>: ' + res.texto + '. Ganas ' + U.cr(premio) + '.', 'cr');
      g.aplicarFx({ carisma: 3, suerte: 2 }, {});
    } else {
      s.stats.creditos -= cantidad;
      g.log('<b>' + J.n + '</b>: ' + res.texto + '. Pierdes ' + U.cr(cantidad) + '.', 'mal');
      g.aplicarFx({ cordura: -4 }, {});
      // perder mucho engancha
      if (cantidad > 8000 && g.rng.chance(0.28)) {
        s.flags.enganchado_al_juego = true;
        g.log('Te quedas mirando la mesa más rato del que deberías.', 'mal');
      }
    }
    g.escena = null;
    return res;
  };

})(typeof window !== 'undefined' ? window : globalThis);

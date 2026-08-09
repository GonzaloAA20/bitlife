/* ============================================================
   HOLOVIDA :: CAPA DE DETALLE FINO
   El lienzo pasó de 48 a 96 píxeles, así que ahora caben cosas
   que antes no: costuras de un píxel, remaches, rejillas, luces
   de posición, reflejos y arañazos. Esta capa envuelve los
   sprites que más se ven y les añade ese detalle encima, sin
   tocar la silueta ni la paleta originales.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const S2 = SW.S2;
  if (!S2) return;
  const PAL = SW.PAL_PIXEL;
  const U = SW.PX_U || 2;
  const mez = SW.mezclaColor || function (a) { return a; };

  /* coordenadas lógicas → píxel real, para poder pintar a media unidad */
  function R(v) { return Math.round(v * U); }

  /* ---------- pinceles finos, todos en píxeles reales ---------- */

  /** línea horizontal de un píxel real, sólo donde ya hay pintura */
  function costuraH(L, x, y, w, c) {
    const X = R(x), Y = R(y), W = R(w);
    for (let i = 0; i < W; i++) if (L.g1(X + i, Y)) L.p1(X + i, Y, c);
  }
  function costuraV(L, x, y, h, c) {
    const X = R(x), Y = R(y), H = R(h);
    for (let j = 0; j < H; j++) if (L.g1(X, Y + j)) L.p1(X, Y + j, c);
  }
  /** puntos repartidos: remaches, tornillos, luces */
  function puntos(L, x, y, w, paso, c, cSom) {
    const X = R(x), Y = R(y), W = R(w);
    for (let i = 0; i < W; i += paso) {
      if (!L.g1(X + i, Y)) continue;
      L.p1(X + i, Y, c);
      if (cSom) L.p1(X + i, Y + 1, cSom);
    }
  }
  /** reflejo especular: una diagonal corta y brillante */
  function reflejo(L, x, y, largo, c) {
    const X = R(x), Y = R(y);
    for (let i = 0; i < largo; i++) if (L.g1(X + i, Y + i)) L.p1(X + i, Y + i, c);
  }
  /** arañazos: rayas cortas y aleatorias pero deterministas */
  function arañazos(L, n, semilla, c) {
    let h = semilla | 0;
    const sig = function () { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    for (let k = 0; k < n; k++) {
      const x = Math.floor(sig() * L.n), y = Math.floor(sig() * L.n);
      const largo = 2 + Math.floor(sig() * 4);
      const dx = sig() < 0.5 ? 1 : -1;
      for (let i = 0; i < largo; i++) if (L.g1(x + i * dx, y + i)) L.p1(x + i * dx, y + i, c);
    }
  }
  /** rejilla de ventilación: puntos en malla dentro de un rectángulo */
  function rejilla(L, x, y, w, h, c) {
    const X = R(x), Y = R(y), W = R(w), H = R(h);
    for (let j = 0; j < H; j += 2) for (let i = (j / 2) % 2; i < W; i += 2) {
      if (L.g1(X + i, Y + j)) L.p1(X + i, Y + j, c);
    }
  }
  /** halo suave alrededor de una fuente de luz, tramado */
  function halo(L, cx, cy, r, c) {
    const CX = R(cx), CY = R(cy), R2 = r * U;
    for (let y = CY - R2; y <= CY + R2; y++) for (let x = CX - R2; x <= CX + R2; x++) {
      const d = Math.hypot(x - CX, y - CY) / R2;
      if (d > 1) continue;
      if (SW.pxTrama(x, y) > 1 - d) continue;
      const base = L.g1(x, y);
      if (base) L.p1(x, y, mez(base, c, (1 - d) * 0.55));
    }
  }

  /** envuelve un sprite: primero lo original, después el detalle */
  function detalle(nombre, fn) {
    const orig = S2[nombre];
    if (!orig) return;
    S2[nombre] = function (L, din) { orig(L, din); try { fn(L, din); } catch (e) { /* el sprite base ya está */ } };
  }

  /* ══════════════════════ ARMAS ══════════════════════ */

  detalle('sable', function (L, din) {
    const hoja = din || '#3ad6ff';
    // la hoja se afila hacia la punta y tiene un núcleo caliente
    halo(L, 24, 14, 9, hoja);
    for (let y = R(1); y < R(29); y++) {
      L.p1(R(23) + 1, y, '#ffffff');
      L.p1(R(24), y, '#ffffff');
    }
    // punta redondeada de un píxel real
    L.p1(R(23) + 1, R(1) - 1, '#ffffff'); L.p1(R(24), R(1) - 1, '#ffffff');
    L.p1(R(23), R(1) - 1, mez(hoja, '#ffffff', 0.5));
    L.p1(R(25), R(1) - 1, mez(hoja, '#ffffff', 0.5));
    // empuñadura: estrías finas, ranuras y tornillos
    for (let y = R(35); y < R(39); y += 2) costuraH(L, 20, y / U, 8, PAL.hierro[3]);
    costuraH(L, 20, 30.5, 8, PAL.acero[0]);
    costuraH(L, 20, 41.5, 8, PAL.hierro[3]);
    puntos(L, 20.5, 32.5, 7, 5, PAL.acero[0], PAL.hierro[3]);
    reflejo(L, 21, 30, 5, '#ffffff');
    // aletas del emisor
    L.p1(R(19), R(30), PAL.acero[0]); L.p1(R(28) + 1, R(30), PAL.acero[2]);
  });

  detalle('sable_oscuro', function (L) {
    for (let y = R(2); y < R(28); y++) {
      if (L.g1(R(24), y)) L.p1(R(24), y, '#2a2440');
    }
    for (let y = R(35); y < R(39); y += 2) costuraH(L, 20, y / U, 8, '#3a3358');
    reflejo(L, 21, 30, 4, '#cfc8ff');
  });

  detalle('blaster', function (L) {
    // aletas de refrigeración sobre el cañón
    for (let x = 30; x < 40; x += 2) costuraV(L, x, 19, 3, PAL.hierro[3]);
    costuraH(L, 12, 15.5, 8, PAL.acero[0]);      // riel superior
    costuraH(L, 12, 18.5, 26, PAL.hierro[3]);    // línea de recámara
    puntos(L, 9, 29, 7, 5, PAL.cuero[0], PAL.cuero[3]);  // tachuelas de la culata
    halo(L, 7, 24, 3, '#ff6a5a');                // piloto de carga
    L.p1(R(6) + 1, R(22) + 1, '#ffd0c8');
    reflejo(L, 26, 16, 4, '#eef6ff');
    L.p1(R(40), R(21), '#ffb03a');               // boca del cañón
  });

  detalle('rifle', function (L) {
    for (let x = 26; x < 40; x += 2) costuraV(L, x, 20, 2, PAL.hierro[3]);
    costuraH(L, 8, 21.5, 32, PAL.acero[0]);
    costuraH(L, 8, 24.5, 32, PAL.hierro[3]);
    puntos(L, 10, 26, 8, 4, PAL.cuero[0], PAL.cuero[3]);
    halo(L, 20, 23, 3, '#6aff8a');
    arañazos(L, 6, 4471, PAL.acero[0]);
  });

  /* ══════════════════════ ARMADURA ══════════════════════ */

  detalle('casco', function (L, din) {
    const pal = din === 'beskar' ? PAL.beskar : PAL.acero;
    // visor: degradado interno con reflejo largo
    const X = R(14), Y = R(16), W = R(20), H = R(5);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const t = j / H;
      L.p1(X + i, Y + j, t < 0.3 ? '#2b4a5e' : t < 0.65 ? '#16303e' : '#0b1c26');
    }
    for (let i = 2; i < W - 6; i++) L.p1(X + i, Y + 1, i % 7 === 0 ? '#9fd8ee' : '#3f6f88');
    reflejo(L, 16, 17, 6, '#bfe6f7');
    // el pie de la T también es cristal, no un agujero negro
    const SX = R(21), SY = R(21), SW_ = R(6), SH = R(11);
    for (let j = 0; j < SH; j++) for (let i = 0; i < SW_; i++) {
      const t2 = j / SH;
      L.p1(SX + i, SY + j, t2 < 0.4 ? '#16303e' : t2 < 0.75 ? '#0f242f' : '#0a1a23');
    }
    for (let j = 1; j < SH - 2; j += 3) L.p1(SX + 1, SY + j, '#3f6f88');
    // costura de las mejillas y de la cresta
    costuraV(L, 14, 21, 12, pal[3]); costuraV(L, 34, 21, 12, pal[3]);
    costuraV(L, 24, 6, 10, pal[0]);
    costuraH(L, 12, 15.5, 24, pal[3]);        // ceja
    costuraH(L, 12, 21.5, 24, pal[3]);
    // telémetro
    L.p1(R(34) + 1, R(14), '#ff6a5a'); L.p1(R(34) + 1, R(15), pal[3]);
    // rejilla de respiración
    rejilla(L, 20, 33, 8, 4, pal[3]);
    arañazos(L, 8, 991, pal[0]);
  });

  detalle('armadura', function (L, din) {
    const pal = din === 'beskar' ? PAL.beskar : PAL.hierro;
    costuraH(L, 12, 21.5, 24, pal[3]);
    costuraH(L, 12, 27.5, 24, pal[3]);
    costuraV(L, 24, 12, 6, pal[3]);
    puntos(L, 13, 13, 22, 6, pal[0], pal[3]);      // remaches del peto
    puntos(L, 5, 15, 8, 5, pal[0], pal[3]);
    puntos(L, 36, 15, 8, 5, pal[0], pal[3]);
    halo(L, 24, 22, 4, '#ff6a5a');                 // lámpara del pectoral
    reflejo(L, 14, 14, 7, mez(pal[0], '#ffffff', 0.5));
    arañazos(L, 10, 7717, pal[0]);
  });

  detalle('casco_soldado', function (L) {
    costuraV(L, 24, 8, 8, '#dfe7f0');
    costuraH(L, 14, 27.5, 20, '#9aa6b4');
    rejilla(L, 20, 30, 8, 3, '#7d8896');
    reflejo(L, 17, 13, 6, '#ffffff');
    arañazos(L, 6, 313, '#c8d2de');
  });

  detalle('casco_piloto', function (L) {
    costuraH(L, 12, 19.5, 24, '#5f6b78');
    puntos(L, 13, 15, 22, 6, '#eef4fb', '#7c8894');
    reflejo(L, 16, 21, 7, '#bfe6f7');
    halo(L, 34, 22, 3, '#6aff8a');
  });

  /* ══════════════════════ NAVES ══════════════════════ */

  function panelesNave(L, y0, y1, x0, x1, c) {
    for (let y = R(y0); y < R(y1); y += 5) {
      for (let x = R(x0); x < R(x1); x++) if (L.g1(x, y)) L.p1(x, y, c);
    }
  }

  detalle('nave_carguero', function (L) {
    panelesNave(L, 18, 32, 6, 42, '#5d6874');
    costuraV(L, 20, 18, 14, '#5d6874');
    costuraV(L, 30, 18, 14, '#5d6874');
    puntos(L, 8, 20, 30, 7, '#cbd5e1', '#4a5460');
    halo(L, 40, 26, 4, '#ffb03a');                  // tobera
    L.p1(R(7), R(30), '#6aff8a');                   // luces de posición
    L.p1(R(41), R(19), '#ff6a5a');
    reflejo(L, 26, 20, 5, '#e8f1fb');
    arañazos(L, 14, 5501, '#8b98a6');
  });

  detalle('nave_caza', function (L) {
    costuraV(L, 24, 16, 16, '#5d6874');
    puntos(L, 20, 22, 8, 5, '#cbd5e1', '#4a5460');
    halo(L, 24, 34, 5, '#ffb03a');
    L.p1(R(17), R(15), '#6aff8a'); L.p1(R(31), R(15), '#ff6a5a');
    reflejo(L, 22, 18, 4, '#e8f1fb');
  });

  detalle('nave_lanzadera', function (L) {
    panelesNave(L, 22, 40, 10, 38, '#5d6874');
    costuraV(L, 24, 12, 26, '#5d6874');
    halo(L, 18, 40, 3, '#ffb03a'); halo(L, 30, 40, 3, '#ffb03a');
    reflejo(L, 20, 24, 6, '#e8f1fb');
    arañazos(L, 8, 2027, '#8b98a6');
  });

  detalle('nave_capital', function (L) {
    for (let y = 20; y < 42; y += 3) costuraH(L, 8, y + 0.5, 32, '#59636f');
    // ventanas de las cubiertas: puntos de luz en filas
    for (let y = 24; y < 40; y += 3) puntos(L, 12, y, 24, 4, '#ffd98a', null);
    halo(L, 24, 20, 5, '#8ad8ff');
    arañazos(L, 12, 6101, '#8b98a6');
  });

  detalle('motor', function (L) {
    for (let x = 14; x < 34; x += 2) costuraV(L, x, 16, 16, PAL.hierro[3]);
    halo(L, 24, 38, 6, '#ffb03a');
    reflejo(L, 16, 18, 5, '#eef6ff');
  });

  detalle('torreta', function (L) {
    costuraH(L, 12, 27.5, 24, PAL.hierro[3]);
    puntos(L, 13, 24, 22, 6, PAL.acero[0], PAL.hierro[3]);
    L.p1(R(40), R(20), '#ff6a5a');
    reflejo(L, 16, 22, 5, '#eef6ff');
  });

  /* ══════════════════════ DROIDES ══════════════════════ */

  detalle('droide', function (L) {
    costuraH(L, 14, 25.5, 20, '#5d6874');
    costuraH(L, 14, 33.5, 20, '#5d6874');
    puntos(L, 15, 20, 18, 6, '#e2e9f1', '#4a5460');
    // fila de pilotos
    for (let i = 0; i < 4; i++) L.p1(R(18) + i * 4, R(30) + 1, i === 1 ? '#6aff8a' : '#3a4652');
    reflejo(L, 17, 16, 6, '#ffffff');
    arañazos(L, 6, 1213, '#b8c4d2');
  });

  detalle('astromec', function (L) {
    costuraH(L, 12, 24.5, 24, '#5d6874');
    costuraV(L, 18, 22, 18, '#5d6874');
    costuraV(L, 30, 22, 18, '#5d6874');
    puntos(L, 13, 21, 22, 6, '#e2e9f1', '#4a5460');
    halo(L, 30, 14, 3, '#8ad8ff');                 // ojo
    L.p1(R(30), R(14), '#ffffff');
    reflejo(L, 16, 13, 5, '#ffffff');
  });

  detalle('rival', function (L) {
    costuraH(L, 16, 27.5, 16, '#1a2029');
    puntos(L, 17, 20, 14, 6, '#39424f', '#12171e');
    L.p1(R(20), R(19) + 1, '#ffd0d0'); L.p1(R(28), R(19) + 1, '#ffd0d0');
  });

  /* ══════════════════════ OBJETOS ══════════════════════ */

  detalle('holocron', function (L, din) {
    const luz = din || '#8ad8ff';
    // retícula interna de glifos
    for (let y = R(19); y < R(33); y += 3) for (let x = R(17); x < R(31); x += 3) {
      if (L.g1(x, y)) L.p1(x, y, mez(luz, '#ffffff', 0.75));
    }
    // aristas doradas de un píxel
    costuraH(L, 14, 16, 20, PAL.oro[0]);
    costuraH(L, 14, 35.5, 20, PAL.oro[3]);
    costuraV(L, 14, 16, 20, PAL.oro[0]);
    costuraV(L, 33.5, 16, 20, PAL.oro[3]);
    halo(L, 24, 26, 8, luz);
  });

  detalle('kyber', function (L, din) {
    const c = din || '#dff4ff';
    // facetas: dos aristas finas que cruzan el cristal
    for (let i = 0; i < R(20); i++) {
      L.p1(R(24) - i / 2, R(14) + i, mez(c, '#ffffff', 0.7));
      L.p1(R(24) + i / 2, R(14) + i, mez(c, '#334455', 0.35));
    }
    costuraV(L, 24, 8, 32, '#ffffff');
    halo(L, 24, 24, 9, c);
  });

  detalle('geoda', function (L) {
    arañazos(L, 14, 8821, '#8a8296');
    halo(L, 24, 24, 7, '#8ad8ff');
  });

  detalle('carga', function (L) {
    costuraH(L, 10, 19.5, 28, '#3b3022');
    costuraH(L, 10, 32.5, 28, '#3b3022');
    puntos(L, 11, 17, 26, 7, '#8a6a44', '#2c2012');
    arañazos(L, 10, 3301, '#6a4e30');
  });

  detalle('reliquia', function (L) {
    for (let y = R(16); y < R(38); y += 4) costuraH(L, 15, y / U, 18, '#6a5a3a');
    puntos(L, 16, 15, 16, 6, '#e0c98a', '#4a3c1c');
    reflejo(L, 18, 18, 6, '#fff0c0');
  });

  detalle('criatura', function (L, din) {
    // pelaje: trazos cortos siguiendo el lomo
    let h = 4099;
    const sig = function () { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    for (let k = 0; k < 90; k++) {
      const x = R(12) + Math.floor(sig() * R(24));
      const y = R(18) + Math.floor(sig() * R(12));
      const c = L.g1(x, y);
      if (!c) continue;
      const tono = sig() < 0.5 ? mez(c, '#ffffff', 0.22) : mez(c, '#000000', 0.22);
      L.p1(x, y, tono); L.p1(x, y + 1, tono);
    }
    L.p1(R(18), R(17), '#ffffff');   // brillo del ojo
  });

  detalle('trofeo', function (L) {
    reflejo(L, 18, 16, 7, '#fff4c8');
    puntos(L, 16, 34, 16, 5, PAL.oro[0], PAL.oro[3]);
  });

  detalle('medalla', function (L) {
    halo(L, 24, 28, 6, '#ffe9a8');
    reflejo(L, 20, 24, 5, '#fffbe8');
  });

  detalle('bacta', function (L) {
    for (let y = R(14); y < R(40); y += 3) costuraH(L, 16, y / U, 16, '#7ad8e8');
    halo(L, 24, 26, 7, '#8ad8ff');
  });

  detalle('especia', function (L) {
    let h = 771;
    const sig = function () { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    for (let k = 0; k < 70; k++) {
      const x = Math.floor(sig() * L.n), y = Math.floor(sig() * L.n);
      const c = L.g1(x, y);
      if (c) L.p1(x, y, mez(c, '#ffffff', 0.35));
    }
  });

  detalle('holomapa', function (L, din) {
    const luz = din || '#8ad8ff';
    for (let y = R(14); y < R(34); y += 3) costuraH(L, 12, y / U, 24, mez(luz, '#ffffff', 0.5));
    halo(L, 24, 24, 10, luz);
  });

  detalle('credencial', function (L) {
    for (let y = R(20); y < R(32); y += 3) costuraH(L, 20, y / U, 14, '#5d6874');
    reflejo(L, 14, 18, 5, '#ffffff');
  });

  detalle('herramienta', function (L) {
    reflejo(L, 16, 16, 6, '#eef6ff');
    arañazos(L, 8, 6607, PAL.acero[0]);
  });

  detalle('talisman', function (L, din) {
    halo(L, 24, 26, 6, din || '#c98aff');
    reflejo(L, 20, 20, 4, '#ffffff');
  });

  detalle('datachip', function (L) {
    for (let x = 14; x < 34; x += 2) costuraV(L, x, 20, 8, '#3a4652');
    halo(L, 24, 24, 4, '#6aff8a');
  });

  detalle('copa', function (L) {
    reflejo(L, 19, 15, 6, '#fff4c8');
  });

  detalle('vaina', function (L) {
    puntos(L, 12, 18, 24, 6, '#e2e9f1', '#4a5460');
    halo(L, 24, 30, 4, '#8ad8ff');
  });

  detalle('sigilo', function (L, din) {
    halo(L, 24, 24, 10, din || '#8a7ad8');
  });

})(typeof window !== 'undefined' ? window : globalThis);

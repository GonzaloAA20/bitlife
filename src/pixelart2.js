/* ============================================================
   HOLOVIDA :: pixel art de alta resolución
   Los sprites viejos eran de 16-28 px de ancho y se veían muy
   bastos. Estos van a 48x48 con un pequeño motor de dibujo por
   píxel: primitivas, sombreado por luz y paletas de 4-5 tonos
   por material. Sigue siendo pixel art, con más píxeles.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  const N = 48;   // lienzo lógico

  /* ---------- mini motor de dibujo por píxel ---------- */
  function Lienzo(n) {
    this.n = n || N;
    this.px = new Array(this.n * this.n).fill(null);
  }
  Lienzo.prototype.set = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.n || y >= this.n || !c) return;
    this.px[y * this.n + x] = c;
  };
  Lienzo.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.n || y >= this.n) return null;
    return this.px[y * this.n + x];
  };
  Lienzo.prototype.rect = function (x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  };
  /** rectángulo con volumen: luz arriba-izquierda, sombra abajo-derecha */
  Lienzo.prototype.bloque = function (x, y, w, h, pal) {
    this.rect(x, y, w, h, pal[1]);
    for (let i = 0; i < w; i++) { this.set(x + i, y, pal[0]); this.set(x + i, y + h - 1, pal[3] || pal[2]); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, pal[0]); this.set(x + w - 1, y + j, pal[2]); }
    this.set(x, y, pal[0]); this.set(x + w - 1, y + h - 1, pal[3] || pal[2]);
  };
  /** cilindro vertical: degradado horizontal de tonos */
  Lienzo.prototype.cilindro = function (x, y, w, h, pal) {
    for (let i = 0; i < w; i++) {
      const t = i / (w - 1);
      const idx = t < 0.18 ? 0 : t < 0.45 ? 1 : t < 0.75 ? 2 : 3;
      for (let j = 0; j < h; j++) this.set(x + i, y + j, pal[Math.min(idx, pal.length - 1)]);
    }
  };
  Lienzo.prototype.elipse = function (cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
  };
  Lienzo.prototype.linea = function (x0, y0, x1, y1, c, gr) {
    const pasos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= pasos; i++) {
      const t = i / pasos;
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const g = gr || 1;
      for (let a = 0; a < g; a++) for (let b = 0; b < g; b++) this.set(x + a, y + b, c);
    }
  };
  /** contorno oscuro alrededor de todo lo dibujado */
  Lienzo.prototype.contorno = function (c) {
    const copia = this.px.slice();
    const at = (x, y) => (x < 0 || y < 0 || x >= this.n || y >= this.n) ? null : copia[y * this.n + x];
    for (let y = 0; y < this.n; y++) for (let x = 0; x < this.n; x++) {
      if (at(x, y)) continue;
      if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) this.set(x, y, c);
    }
  };

  /* ---------- paletas de material (4 tonos: luz → sombra) ---------- */
  const PAL = {
    acero:   ['#e6eef7', '#a8b8c8', '#6a7a8a', '#3a4652'],
    hierro:  ['#c8ccd4', '#8a909a', '#5a626c', '#2e343c'],
    beskar:  ['#f2f6fb', '#c4d0de', '#8c9aac', '#525f6e'],
    oro:     ['#ffe9a8', '#e0bd5a', '#a8842e', '#5e4818'],
    cuero:   ['#8a6a44', '#6a4e30', '#4a3620', '#2c2012'],
    negro:   ['#4a5260', '#2e3644', '#1c222c', '#0e1218'],
    verdeMil:['#7a8a5a', '#5a6a40', '#3e4a2c', '#242c18'],
    rojo:    ['#ff8a72', '#e04a3a', '#a02c22', '#5e1610'],
    cobre:   ['#ffc08a', '#d88a4a', '#a05e2a', '#5e3414']
  };

  /* ============================================================
     SPRITES
     Cada uno devuelve un Lienzo de 48x48.
     `din` es el color dinámico (hoja del sable, casco de nave…).
     ============================================================ */
  const S2 = {};

  /* --- sable de luz encendido --- */
  S2.sable = function (L, din) {
    const hoja = din || '#3ad6ff';
    const nucleo = '#ffffff';
    const halo = SW.mezclaColor ? SW.mezclaColor(hoja, '#000010', 0.35) : hoja;
    // hoja: halo, cuerpo, núcleo blanco
    L.rect(20, 2, 8, 26, halo);
    L.rect(21, 1, 6, 28, hoja);
    L.rect(23, 1, 2, 28, nucleo);
    L.set(23, 0, nucleo); L.set(24, 0, nucleo);
    // empuñadura
    L.cilindro(20, 29, 8, 16, PAL.hierro);
    L.rect(20, 29, 8, 2, PAL.acero[0]);          // emisor
    L.rect(19, 31, 10, 2, PAL.acero[1]);
    L.rect(20, 34, 8, 1, PAL.oro[1]);            // anillos
    L.rect(20, 38, 8, 1, PAL.oro[1]);
    L.rect(22, 35, 1, 3, PAL.negro[1]);          // botón
    L.rect(25, 35, 1, 3, PAL.negro[1]);
    L.rect(20, 43, 8, 2, PAL.acero[2]);          // pomo
    L.rect(21, 45, 6, 1, PAL.hierro[3]);
  };

  /* --- sable oscuro: hoja plana con filo blanco --- */
  S2.sable_oscuro = function (L) {
    const filo = '#e8e2ff', cuerpo = '#161222';
    for (let y = 2; y < 29; y++) {
      const t = (y - 2) / 27;
      const ancho = Math.round(3 + t * 4);
      const cx = 24 - Math.round(t * 2);
      L.rect(cx - ancho, y, ancho * 2, 1, cuerpo);
      L.set(cx - ancho - 1, y, filo);
      L.set(cx + ancho, y, filo);
    }
    L.rect(22, 1, 4, 2, filo);
    L.cilindro(20, 29, 8, 16, PAL.negro);
    L.rect(20, 29, 8, 2, '#9a92c8');
    L.rect(20, 34, 8, 1, '#6a5fb0');
    L.rect(20, 39, 8, 1, '#6a5fb0');
    L.rect(20, 43, 8, 2, PAL.negro[2]);
  };

  /* --- bláster pesado --- */
  S2.blaster = function (L) {
    L.bloque(6, 20, 30, 8, PAL.hierro);          // cuerpo
    L.bloque(30, 22, 12, 4, PAL.acero);          // cañón
    L.rect(42, 23, 2, 2, PAL.negro[0]);          // boca
    L.bloque(10, 14, 12, 6, PAL.negro);          // mira
    L.rect(12, 16, 8, 2, PAL.acero[1]);
    L.bloque(8, 28, 8, 14, PAL.cuero);           // culata
    L.bloque(18, 28, 5, 8, PAL.negro);           // cargador
    L.linea(24, 27, 24, 31, PAL.negro[1], 1);    // gatillo
    L.rect(22, 31, 5, 1, PAL.hierro[2]);
    L.rect(30, 21, 10, 1, PAL.oro[1]);           // detalle
    L.rect(6, 22, 2, 4, PAL.rojo[1]);            // indicador
  };

  /* --- casco mandaloriano --- */
  S2.casco = function (L, din) {
    const pal = din === 'beskar' ? PAL.beskar : PAL.acero;
    for (let y = 6; y < 40; y++) {
      const t = (y - 6) / 34;
      const ancho = Math.round(13 - Math.pow(t, 2.2) * 5);
      for (let x = 24 - ancho; x <= 24 + ancho; x++) {
        const lat = (x - (24 - ancho)) / (ancho * 2);
        const idx = lat < 0.18 ? 0 : lat < 0.5 ? 1 : lat < 0.8 ? 2 : 3;
        L.set(x, y, pal[idx]);
      }
    }
    L.elipse(24, 8, 12, 4, pal[0]);
    // visor en T
    L.rect(14, 16, 20, 5, PAL.negro[3]);
    L.rect(21, 21, 6, 11, PAL.negro[3]);
    L.rect(15, 17, 18, 1, '#1a2c3a');
    // remache y rejilla
    L.rect(18, 34, 12, 1, pal[3]);
    L.rect(19, 36, 10, 1, pal[3]);
  };

  /* --- peto de armadura --- */
  S2.armadura = function (L, din) {
    const pal = din === 'beskar' ? PAL.beskar : PAL.hierro;
    L.bloque(12, 12, 24, 26, pal);                // peto
    L.bloque(4, 14, 9, 10, pal);                  // hombreras
    L.bloque(35, 14, 9, 10, pal);
    L.rect(20, 18, 8, 8, PAL.negro[1]);           // placa central
    L.rect(21, 19, 6, 6, PAL.rojo[1]);
    L.rect(14, 30, 20, 1, pal[3]);
    L.rect(14, 33, 20, 1, pal[3]);
    L.bloque(16, 38, 6, 8, pal);                  // musleras
    L.bloque(26, 38, 6, 8, pal);
  };

  /* --- holocrón --- */
  S2.holocron = function (L, din) {
    const luz = din || '#8ad8ff';
    // cubo en perspectiva
    L.rect(14, 16, 20, 20, PAL.oro[2]);
    L.rect(16, 18, 16, 16, luz);
    L.rect(18, 20, 12, 12, SW.mezclaColor ? SW.mezclaColor(luz, '#ffffff', 0.4) : luz);
    L.rect(21, 23, 6, 6, '#ffffff');
    // aristas doradas
    L.rect(14, 16, 20, 1, PAL.oro[0]); L.rect(14, 35, 20, 1, PAL.oro[3]);
    L.rect(14, 16, 1, 20, PAL.oro[0]); L.rect(33, 16, 1, 20, PAL.oro[3]);
    // esquinas biseladas
    for (let i = 0; i < 4; i++) {
      L.set(14 + i, 16 + 3 - i, PAL.oro[1]); L.set(33 - i, 16 + 3 - i, PAL.oro[1]);
      L.set(14 + i, 35 - 3 + i, PAL.oro[2]); L.set(33 - i, 35 - 3 + i, PAL.oro[2]);
    }
    // resplandor
    L.rect(23, 10, 2, 5, luz); L.rect(23, 37, 2, 5, luz);
    L.rect(8, 25, 5, 2, luz); L.rect(35, 25, 5, 2, luz);
  };

  /* --- cristal kyber --- */
  S2.kyber = function (L, din) {
    const c = din || '#cfe8f5';
    const claro = SW.mezclaColor ? SW.mezclaColor(c, '#ffffff', 0.55) : '#ffffff';
    const osc = SW.mezclaColor ? SW.mezclaColor(c, '#000018', 0.45) : c;
    for (let y = 6; y < 42; y++) {
      const t = Math.abs(y - 24) / 18;
      const ancho = Math.round((1 - t) * 11) + 1;
      for (let x = 24 - ancho; x <= 24 + ancho; x++) {
        const lat = (x - (24 - ancho)) / (ancho * 2 || 1);
        L.set(x, y, lat < 0.3 ? claro : lat < 0.62 ? c : osc);
      }
    }
    // facetas
    L.linea(24, 6, 24, 41, claro, 1);
    L.linea(24, 24, 14, 30, osc, 1);
    L.linea(24, 24, 34, 30, osc, 1);
    // destellos
    L.rect(19, 12, 2, 2, '#ffffff');
    L.rect(28, 30, 1, 1, '#ffffff');
  };

  /* --- droide astromecánico --- */
  S2.droide = function (L, din) {
    const acc = din || '#3ad6ff';
    L.elipse(24, 12, 10, 7, PAL.acero[1]);        // cúpula
    L.elipse(22, 10, 6, 4, PAL.acero[0]);
    L.rect(20, 9, 5, 4, PAL.negro[2]);            // ojo
    L.rect(21, 10, 3, 2, acc);
    L.rect(14, 15, 20, 2, PAL.acero[2]);
    L.bloque(15, 17, 18, 22, PAL.acero);          // cuerpo
    L.rect(18, 20, 12, 5, PAL.negro[1]);          // panel
    L.rect(19, 21, 4, 3, acc);
    L.rect(25, 21, 4, 3, PAL.rojo[1]);
    L.rect(18, 27, 12, 2, PAL.hierro[2]);
    L.rect(18, 31, 12, 2, PAL.hierro[2]);
    L.rect(20, 35, 8, 3, PAL.oro[2]);
    L.bloque(11, 20, 4, 16, PAL.hierro);          // patas
    L.bloque(33, 20, 4, 16, PAL.hierro);
    L.rect(10, 36, 6, 5, PAL.negro[1]);
    L.rect(32, 36, 6, 5, PAL.negro[1]);
    L.rect(20, 39, 8, 5, PAL.negro[1]);
  };

  /* --- naves: cuatro siluetas --- */
  S2.nave_carguero = function (L, din) {
    const c = din ? [din, din, din, din] : PAL.hierro;
    L.elipse(24, 26, 20, 12, c[1]);               // casco
    L.elipse(22, 23, 16, 8, c[0]);
    L.rect(4, 24, 40, 5, c[2]);
    L.bloque(30, 12, 12, 9, c);                   // cabina lateral
    L.rect(32, 14, 8, 4, '#7fd8ff');
    L.bloque(6, 14, 9, 8, c);                     // mandíbulas
    L.bloque(6, 30, 9, 8, c);
    L.rect(2, 16, 5, 4, c[2]);
    L.rect(2, 32, 5, 4, c[2]);
    L.rect(40, 24, 6, 5, PAL.cobre[1]);           // motores
    L.rect(44, 25, 4, 3, '#ffd28a');
    L.rect(16, 22, 14, 1, c[0]);
    L.rect(16, 30, 14, 1, c[3]);
  };
  S2.nave_caza = function (L, din) {
    const c = din ? [din, din, din, din] : PAL.acero;
    // alas en X
    L.linea(4, 8, 22, 22, c[1], 3); L.linea(4, 40, 22, 26, c[2], 3);
    L.linea(44, 8, 26, 22, c[1], 3); L.linea(44, 40, 26, 26, c[2], 3);
    L.rect(3, 6, 4, 5, PAL.rojo[1]); L.rect(3, 38, 4, 5, PAL.rojo[1]);
    L.rect(42, 6, 4, 5, PAL.rojo[1]); L.rect(42, 38, 4, 5, PAL.rojo[1]);
    // fuselaje
    for (let y = 10; y < 42; y++) {
      const t = Math.abs(y - 26) / 16;
      const w = Math.round((1 - t * 0.75) * 6);
      for (let x = 24 - w; x <= 24 + w; x++) {
        const lat = (x - (24 - w)) / (w * 2 || 1);
        L.set(x, y, lat < 0.25 ? c[0] : lat < 0.6 ? c[1] : c[2]);
      }
    }
    L.rect(21, 14, 6, 5, '#7fd8ff');              // cabina
    L.rect(22, 15, 4, 3, '#cfefff');
    L.rect(21, 40, 6, 4, PAL.cobre[1]);           // motor
    L.rect(22, 43, 4, 3, '#ffd28a');
  };
  S2.nave_lanzadera = function (L, din) {
    const c = din ? [din, din, din, din] : PAL.hierro;
    L.linea(24, 4, 10, 34, c[1], 3);              // ala superior
    L.linea(24, 4, 38, 34, c[2], 3);
    L.rect(23, 2, 3, 12, c[0]);
    for (let y = 18; y < 44; y++) {               // cuerpo triangular
      const t = (y - 18) / 26;
      const w = Math.round(4 + t * 9);
      for (let x = 24 - w; x <= 24 + w; x++) {
        const lat = (x - (24 - w)) / (w * 2 || 1);
        L.set(x, y, lat < 0.22 ? c[0] : lat < 0.58 ? c[1] : c[2]);
      }
    }
    L.rect(20, 22, 9, 4, '#7fd8ff');
    L.rect(12, 44, 24, 2, c[3]);
    L.rect(14, 40, 4, 4, PAL.cobre[1]);
    L.rect(30, 40, 4, 4, PAL.cobre[1]);
  };
  S2.nave_capital = function (L, din) {
    const c = din ? [din, din, din, din] : PAL.hierro;
    for (let y = 8; y < 40; y++) {                // cuña
      const t = (y - 8) / 32;
      const w = Math.round(2 + t * 21);
      for (let x = 24 - w; x <= 24 + w; x++) {
        const lat = (x - (24 - w)) / (w * 2 || 1);
        L.set(x, y, lat < 0.2 ? c[0] : lat < 0.55 ? c[1] : c[2]);
      }
    }
    L.rect(2, 39, 44, 3, c[3]);
    L.bloque(19, 14, 10, 6, c);                   // torre de mando
    L.rect(21, 16, 6, 2, '#7fd8ff');
    for (let i = 0; i < 5; i++) L.rect(8 + i * 7, 42, 5, 4, PAL.cobre[1]);
    for (let i = 0; i < 5; i++) L.rect(9 + i * 7, 45, 3, 2, '#a8d8ff');
    L.rect(14, 30, 20, 1, c[3]);
  };

  /* --- rival: silueta con detalle --- */
  S2.rival = function (L, din) {
    const c = din || '#ff4d5e';
    L.elipse(24, 12, 7, 8, PAL.negro[1]);         // cabeza
    L.rect(19, 10, 4, 2, c); L.rect(25, 10, 4, 2, c);
    L.bloque(16, 20, 16, 16, PAL.negro);          // torso
    L.rect(18, 23, 12, 2, c);
    L.bloque(10, 21, 6, 13, PAL.negro);           // brazos
    L.bloque(32, 21, 6, 13, PAL.negro);
    L.bloque(17, 36, 6, 11, PAL.negro);           // piernas
    L.bloque(25, 36, 6, 11, PAL.negro);
    L.rect(6, 30, 6, 3, PAL.hierro[2]);           // arma
    L.rect(4, 31, 3, 1, c);
  };

  /* --- criatura --- */
  S2.criatura = function (L, din) {
    const pal = din ? [din, din, din, din] : PAL.cuero;
    L.elipse(26, 26, 15, 10, pal[1]);             // cuerpo
    L.elipse(24, 22, 12, 6, pal[0]);
    L.elipse(11, 20, 7, 6, pal[1]);               // cabeza
    L.rect(6, 19, 5, 3, pal[2]);                  // hocico
    L.rect(9, 17, 2, 2, '#ffd23a');               // ojo
    L.linea(9, 14, 7, 9, pal[2], 2);              // cuernos
    L.linea(14, 14, 16, 9, pal[2], 2);
    L.bloque(16, 33, 5, 12, pal);                 // patas
    L.bloque(24, 33, 5, 12, pal);
    L.bloque(32, 33, 5, 12, pal);
    L.rect(15, 44, 7, 2, PAL.negro[2]);
    L.rect(23, 44, 7, 2, PAL.negro[2]);
    L.rect(31, 44, 7, 2, PAL.negro[2]);
    L.linea(41, 24, 46, 16, pal[2], 2);           // cola
  };

  /* --- reliquia --- */
  S2.reliquia = function (L, din) {
    const c = din || '#ffe9a8';
    L.bloque(13, 14, 22, 24, PAL.oro);
    L.rect(16, 17, 16, 18, PAL.cuero[2]);
    L.rect(18, 19, 12, 14, c);
    L.rect(21, 22, 6, 8, PAL.oro[2]);
    L.rect(22, 24, 4, 4, '#ffffff');
    L.rect(13, 38, 22, 3, PAL.oro[2]);
    L.rect(15, 41, 18, 2, PAL.oro[3]);
    L.rect(13, 11, 22, 3, PAL.oro[1]);
  };

  SW.SPRITES2 = S2;

  /* ============================================================
     RENDER
     ============================================================ */
  SW.pixel2 = function (nombre, opts) {
    const o = opts || {};
    const fn = S2[nombre];
    const esc = o.escala || 5;
    const cv = document.createElement('canvas');
    cv.width = N * esc; cv.height = N * esc;
    cv.className = 'sprite';
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;
    if (!fn) return cv;

    const L = new Lienzo(N);
    fn(L, o.dinamico);
    L.contorno('#0a0d12');

    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = L.px[y * N + x];
      if (!c) continue;
      cx.fillStyle = c;
      cx.fillRect(x * esc, y * esc, esc, esc);
    }
    return cv;
  };

  SW.tienePixel2 = function (nombre) { return !!S2[nombre]; };
  SW.Lienzo = Lienzo;
  SW.PAL_PIXEL = PAL;

})(window);

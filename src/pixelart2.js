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

  /* El lienzo real pasa de 48 a 96 píxeles de lado: cuatro veces más
     puntos. Los sprites se siguen dibujando en coordenadas de 48
     (U = 2 píxeles reales por unidad lógica), así que la silueta y la
     estética no cambian; lo que cambia es que las curvas, los
     degradados y los detalles finos se calculan a resolución real.
     Encima pasa una tubería de acabado: oclusión en los recodos, luz
     de canto arriba-izquierda, brillo especular y grano por material. */
  const N = 96;   // lienzo real
  const U = 2;    // píxeles reales por unidad lógica

  /* Bayer 4x4 para degradar sin bandas ni antialias */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function trama(x, y) { return BAYER[(y & 3) * 4 + (x & 3)] / 16; }

  /* ---------- mini motor de dibujo por píxel ---------- */
  function Lienzo(n, u) {
    this.n = n || N;
    this.u = u == null ? U : u;
    this.px = new Array(this.n * this.n).fill(null);
  }
  /** píxel real, sin escalar */
  Lienzo.prototype.p1 = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.n || y >= this.n || !c) return;
    this.px[y * this.n + x] = c;
  };
  Lienzo.prototype.g1 = function (x, y) {
    if (x < 0 || y < 0 || x >= this.n || y >= this.n) return null;
    return this.px[y * this.n + x];
  };
  /** píxel lógico: rellena un bloque de u×u */
  Lienzo.prototype.set = function (x, y, c) {
    const u = this.u;
    const bx = Math.round(x) * u, by = Math.round(y) * u;
    for (let j = 0; j < u; j++) for (let i = 0; i < u; i++) this.p1(bx + i, by + j, c);
  };
  Lienzo.prototype.get = function (x, y) { return this.g1(Math.round(x) * this.u, Math.round(y) * this.u); };
  Lienzo.prototype.rect = function (x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  };
  /** rectángulo con volumen: luz arriba-izquierda, sombra abajo-derecha.
      El canto se pinta a resolución real: media unidad, no una entera. */
  Lienzo.prototype.bloque = function (x, y, w, h, pal) {
    this.rect(x, y, w, h, pal[1]);
    const u = this.u, X = x * u, Y = y * u, W = w * u, H = h * u;
    for (let i = 0; i < W; i++) {
      this.p1(X + i, Y, pal[0]);
      this.p1(X + i, Y + H - 1, pal[3] || pal[2]);
      this.p1(X + i, Y + H - 2, pal[2]);
    }
    for (let j = 0; j < H; j++) {
      this.p1(X, Y + j, pal[0]);
      this.p1(X + W - 1, Y + j, pal[3] || pal[2]);
      this.p1(X + W - 2, Y + j, pal[2]);
    }
  };
  /** cilindro vertical con degradado tramado: ya no son cuatro franjas */
  Lienzo.prototype.cilindro = function (x, y, w, h, pal) {
    const u = this.u, X = x * u, Y = y * u, W = w * u, H = h * u;
    for (let i = 0; i < W; i++) {
      const t = W > 1 ? i / (W - 1) : 0;
      // curva de iluminación de un cilindro: brillo cerca del 25%
      const lum = 1 - Math.abs(t - 0.26) * 1.75;
      const f = (1 - lum) * (pal.length - 1);
      const lo = Math.max(0, Math.min(pal.length - 1, Math.floor(f)));
      const hi = Math.min(pal.length - 1, lo + 1);
      const frac = f - lo;
      for (let j = 0; j < H; j++) {
        this.p1(X + i, Y + j, trama(X + i, Y + j) < frac ? pal[hi] : pal[lo]);
      }
    }
  };
  /** elipse calculada en píxeles reales: bordes mucho más limpios */
  Lienzo.prototype.elipse = function (cx, cy, rx, ry, c) {
    const u = this.u, CX = cx * u + (u - 1) / 2, CY = cy * u + (u - 1) / 2, RX = rx * u, RY = ry * u;
    for (let y = Math.floor(CY - RY); y <= Math.ceil(CY + RY); y++)
      for (let x = Math.floor(CX - RX); x <= Math.ceil(CX + RX); x++) {
        const dx = (x - CX) / RX, dy = (y - CY) / RY;
        if (dx * dx + dy * dy <= 1) this.p1(x, y, c);
      }
  };
  /** anillo de un píxel real: sirve para lentes, juntas y visores */
  Lienzo.prototype.anillo = function (cx, cy, rx, ry, c, gr) {
    const u = this.u, CX = cx * u + (u - 1) / 2, CY = cy * u + (u - 1) / 2, RX = rx * u, RY = ry * u;
    const g = (gr || 1);
    for (let y = Math.floor(CY - RY) - 1; y <= Math.ceil(CY + RY) + 1; y++)
      for (let x = Math.floor(CX - RX) - 1; x <= Math.ceil(CX + RX) + 1; x++) {
        const d = Math.sqrt(Math.pow((x - CX) / RX, 2) + Math.pow((y - CY) / RY, 2));
        if (d <= 1 && d > 1 - g / Math.min(RX, RY)) this.p1(x, y, c);
      }
  };
  Lienzo.prototype.linea = function (x0, y0, x1, y1, c, gr) {
    const u = this.u;
    const X0 = x0 * u, Y0 = y0 * u, X1 = x1 * u, Y1 = y1 * u;
    const pasos = Math.round(Math.max(Math.abs(X1 - X0), Math.abs(Y1 - Y0))) + 1;
    const g = (gr || 1) * u;
    for (let i = 0; i <= pasos; i++) {
      const t = i / pasos;
      const x = Math.round(X0 + (X1 - X0) * t), y = Math.round(Y0 + (Y1 - Y0) * t);
      for (let a = 0; a < g; a++) for (let b = 0; b < g; b++) this.p1(x + a, y + b, c);
    }
  };
  /** degradado vertical tramado dentro de un rectángulo lógico */
  Lienzo.prototype.gradV = function (x, y, w, h, pal) {
    const u = this.u, X = x * u, Y = y * u, W = w * u, H = h * u;
    for (let j = 0; j < H; j++) {
      const f = (j / Math.max(1, H - 1)) * (pal.length - 1);
      const lo = Math.max(0, Math.min(pal.length - 1, Math.floor(f)));
      const hi = Math.min(pal.length - 1, lo + 1);
      const frac = f - lo;
      for (let i = 0; i < W; i++) this.p1(X + i, Y + j, trama(X + i, Y + j) < frac ? pal[hi] : pal[lo]);
    }
  };
  /** Grano fino: no pinta encima, mezcla un poco. Es la diferencia
      entre metal usado y una superficie llena de puntos sueltos. */
  Lienzo.prototype.grano = function (c, dens) {
    const d = dens == null ? 0.05 : dens;
    const mz = SW.mezclaColor;
    for (let y = 0; y < this.n; y++) for (let x = 0; x < this.n; x++) {
      const base = this.g1(x, y);
      if (!base) continue;
      let h = (x * 374761393 + y * 668265263) | 0;
      h = (h ^ (h >>> 13)) * 1274126177 | 0;
      h = (h ^ (h >>> 16)) >>> 0;
      const r = (h % 1000) / 1000;
      if (r >= d) continue;
      // intensidad variable: unos puntos casi no se ven
      const fuerza = 0.12 + (r / d) * 0.22;
      this.p1(x, y, mz ? mz(base, c, fuerza) : base);
    }
  };
  /** remaches: puntos de un píxel real repartidos por una línea */
  Lienzo.prototype.remaches = function (x, y, w, paso, cLuz, cSom) {
    const u = this.u, X = x * u, Y = y * u, W = w * u;
    for (let i = 0; i < W; i += paso) {
      this.p1(X + i, Y, cLuz);
      this.p1(X + i, Y + 1, cSom);
    }
  };
  /** oclusión: oscurece el píxel real pegado al borde interior */
  Lienzo.prototype.oclusion = function (fuerza) {
    const f = fuerza == null ? 0.30 : fuerza;
    const copia = this.px.slice();
    const at = (x, y) => (x < 0 || y < 0 || x >= this.n || y >= this.n) ? null : copia[y * this.n + x];
    for (let y = 0; y < this.n; y++) for (let x = 0; x < this.n; x++) {
      const c = at(x, y);
      if (!c) continue;
      // vacío abajo o a la derecha = canto en sombra
      if (!at(x + 1, y) || !at(x, y + 1)) this.p1(x, y, SW.mezclaColor ? SW.mezclaColor(c, '#05070c', f) : c);
    }
  };
  /** luz de canto: aclara el píxel real pegado al borde superior-izquierdo */
  Lienzo.prototype.luzCanto = function (fuerza) {
    const f = fuerza == null ? 0.26 : fuerza;
    const copia = this.px.slice();
    const at = (x, y) => (x < 0 || y < 0 || x >= this.n || y >= this.n) ? null : copia[y * this.n + x];
    for (let y = 0; y < this.n; y++) for (let x = 0; x < this.n; x++) {
      const c = at(x, y);
      if (!c) continue;
      if (!at(x - 1, y) || !at(x, y - 1)) this.p1(x, y, SW.mezclaColor ? SW.mezclaColor(c, '#eaf4ff', f) : c);
    }
  };
  /** contorno oscuro alrededor de todo lo dibujado (píxeles reales) */
  Lienzo.prototype.contorno = function (c) {
    const copia = this.px.slice();
    const at = (x, y) => (x < 0 || y < 0 || x >= this.n || y >= this.n) ? null : copia[y * this.n + x];
    for (let y = 0; y < this.n; y++) for (let x = 0; x < this.n; x++) {
      if (at(x, y)) continue;
      if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) this.p1(x, y, c);
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

  /* ============================================================
     MÁS OBJETOS
     ============================================================ */

  /* --- cristal kyber en bruto, dentro de su geoda --- */
  S2.geoda = function (L, din) {
    const c = din || '#8ad8ff';
    L.elipse(24, 28, 15, 13, PAL.hierro[2]);
    L.elipse(24, 27, 13, 11, PAL.hierro[1]);
    L.elipse(24, 28, 10, 9, '#1a2028');
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9, x = 24 + Math.cos(a) * 5, y = 28 + Math.sin(a) * 4;
      L.linea(x, y, x + Math.cos(a) * 3, y - 4 - (i % 3), c, 1);
      L.set(x, y - 5 - (i % 3), '#ffffff');
    }
    L.elipse(24, 28, 3, 3, c); L.elipse(23, 27, 1.5, 1.5, '#ffffff');
    L.contorno('#0a0d12');
  };

  /* --- casco de piloto rebelde --- */
  S2.casco_piloto = function (L, din) {
    const c = din || '#e8e4d8';
    L.elipse(24, 22, 13, 12, c);
    L.elipse(21, 19, 8, 7, '#ffffff');
    L.rect(11, 22, 26, 12, c);
    L.rect(13, 23, 22, 7, '#1a2632');           // visera
    L.rect(14, 24, 9, 4, '#4a90c8');
    L.set(15, 25, '#bfe4ff');
    L.rect(18, 32, 12, 6, PAL.negro[1]);        // respirador
    for (let i = 0; i < 3; i++) L.rect(19 + i * 4, 33, 2, 4, PAL.negro[3]);
    L.rect(9, 24, 3, 7, PAL.rojo[1]); L.rect(36, 24, 3, 7, PAL.rojo[2]);
    L.contorno('#0a0d12');
  };

  /* --- bláster pesado de dos manos --- */
  S2.rifle = function (L, din) {
    L.rect(6, 24, 32, 5, PAL.hierro[1]);
    L.rect(6, 24, 32, 1, PAL.hierro[0]);
    L.rect(6, 28, 32, 1, PAL.hierro[3]);
    L.rect(34, 25, 8, 3, PAL.hierro[2]);        // cañón
    L.rect(41, 25, 2, 3, din || '#ff6a4a');
    L.rect(14, 20, 10, 4, PAL.negro[1]);        // mira
    L.rect(16, 18, 2, 3, PAL.negro[0]);
    L.rect(18, 29, 5, 8, PAL.cuero[1]);         // empuñadura
    L.rect(6, 22, 6, 9, PAL.cuero[2]);          // culata
    L.rect(26, 29, 8, 4, PAL.negro[2]);         // cargador
    L.contorno('#0a0d12');
  };

  /* --- vaina de carreras --- */
  S2.vaina = function (L, din) {
    const c = din || '#d8722a';
    L.cilindro(4, 14, 13, 9, [c, c, PAL.cobre[2], PAL.cobre[3]]);
    L.cilindro(31, 14, 13, 9, [c, c, PAL.cobre[2], PAL.cobre[3]]);
    L.elipse(6, 18, 3, 4, PAL.negro[1]); L.elipse(33, 18, 3, 4, PAL.negro[1]);
    L.rect(4, 22, 13, 2, PAL.rojo[1]); L.rect(31, 22, 13, 2, PAL.rojo[1]);
    L.linea(16, 18, 22, 32, PAL.hierro[2], 1);  // cables de arrastre
    L.linea(32, 18, 26, 32, PAL.hierro[2], 1);
    L.elipse(24, 35, 7, 5, PAL.hierro[1]);      // cabina
    L.elipse(24, 34, 5, 3, '#2a3a4a');
    L.elipse(23, 33, 2, 1.5, '#8ad8ff');
    L.contorno('#0a0d12');
  };

  /* --- droide astromecánico --- */
  S2.astromec = function (L, din) {
    const c = din || '#4a90c8';
    L.elipse(24, 14, 9, 7, PAL.acero[1]);       // cúpula
    L.elipse(22, 12, 6, 4, PAL.acero[0]);
    L.elipse(27, 13, 2.5, 2, '#1a2028');
    L.set(27, 13, c);
    L.rect(15, 16, 18, 22, PAL.acero[1]);       // cuerpo
    L.rect(15, 16, 18, 1, PAL.acero[0]);
    L.rect(32, 16, 1, 22, PAL.acero[3]);
    L.rect(18, 20, 5, 6, c); L.rect(26, 20, 4, 4, PAL.hierro[2]);
    L.rect(18, 29, 12, 3, PAL.hierro[2]);
    for (let i = 0; i < 4; i++) L.rect(18 + i * 3, 33, 2, 4, PAL.hierro[3]);
    L.rect(11, 22, 4, 16, PAL.acero[2]);        // patas
    L.rect(33, 22, 4, 16, PAL.acero[2]);
    L.rect(10, 37, 6, 4, PAL.negro[1]); L.rect(32, 37, 6, 4, PAL.negro[1]);
    L.contorno('#0a0d12');
  };

  /* --- casco de scout / soldado --- */
  S2.casco_soldado = function (L, din) {
    const c = din || '#e8ecf0';
    L.elipse(24, 20, 14, 13, c);
    L.elipse(20, 16, 8, 6, '#ffffff');
    L.rect(10, 20, 28, 14, c);
    L.rect(12, 22, 10, 8, '#12181f'); L.rect(26, 22, 10, 8, '#12181f');  // ojos
    L.rect(13, 23, 4, 3, '#3a4a5a'); L.rect(27, 23, 4, 3, '#3a4a5a');
    L.rect(19, 27, 10, 9, PAL.hierro[2]);       // filtro central
    for (let i = 0; i < 3; i++) L.rect(20, 29 + i * 2, 8, 1, PAL.negro[2]);
    L.rect(10, 34, 28, 3, PAL.hierro[3]);
    L.contorno('#0a0d12');
  };

  /* --- holomapa / carta estelar --- */
  S2.holomapa = function (L, din) {
    const c = din || '#3ad6ff';
    L.rect(12, 34, 24, 5, PAL.hierro[2]);       // base
    L.rect(12, 34, 24, 1, PAL.hierro[0]);
    L.rect(21, 30, 6, 4, PAL.hierro[1]);
    for (let a = 0; a < 360; a += 12) {         // esfera de puntos
      const r = (a * Math.PI) / 180;
      L.set(24 + Math.cos(r) * 12, 20 + Math.sin(r) * 7, c);
      L.set(24 + Math.cos(r) * 8, 20 + Math.sin(r) * 11, c);
    }
    L.elipse(24, 20, 2, 2, '#ffffff');
    for (let i = 0; i < 6; i++) L.set(14 + i * 4, 12 + (i % 3) * 3, '#ffffff');
    L.contorno('#0a0d12');
  };

  /* --- caja de carga / contrabando --- */
  S2.carga = function (L, din) {
    L.bloque(9, 16, 30, 22, PAL.verdeMil);
    L.rect(9, 25, 30, 2, PAL.verdeMil[3]);
    L.rect(22, 16, 3, 22, PAL.verdeMil[3]);
    L.rect(12, 19, 8, 4, PAL.negro[2]);         // etiqueta
    L.rect(13, 20, 6, 2, din || '#ffd23a');
    L.rect(9, 36, 30, 3, PAL.hierro[3]);
    L.rect(6, 20, 3, 14, PAL.hierro[2]); L.rect(39, 20, 3, 14, PAL.hierro[2]);
    L.contorno('#0a0d12');
  };

  /* --- bota de especia / vial --- */
  S2.especia = function (L, din) {
    const c = din || '#c86adc';
    L.rect(18, 10, 12, 4, PAL.hierro[2]);       // tapón
    L.rect(19, 13, 10, 26, PAL.acero[3]);
    L.rect(20, 14, 8, 24, c);
    L.rect(20, 14, 3, 24, '#ffffff');
    L.rect(20, 14, 8, 3, PAL.negro[3]);
    for (let i = 0; i < 5; i++) L.set(22 + (i % 3) * 2, 20 + i * 3, '#ffffff');
    L.rect(18, 38, 12, 3, PAL.hierro[3]);
    L.contorno('#0a0d12');
  };

  /* --- llave / credencial --- */
  S2.credencial = function (L, din) {
    const c = din || '#3ad6ff';
    L.bloque(12, 14, 24, 22, PAL.hierro);
    L.rect(15, 17, 18, 8, '#12181f');
    L.rect(16, 18, 8, 6, c);
    for (let i = 0; i < 4; i++) L.rect(16, 28 + i, 16 - i * 2, 1, PAL.hierro[3]);
    L.rect(30, 28, 4, 5, c);
    L.contorno('#0a0d12');
  };

  /* --- copa / bebida de cantina --- */
  S2.copa = function (L, din) {
    const c = din || '#ffb03a';
    L.rect(17, 12, 14, 3, PAL.acero[2]);
    L.rect(18, 15, 12, 12, PAL.acero[1]);
    L.rect(19, 16, 10, 10, c);
    L.rect(19, 16, 3, 10, '#ffffff');
    L.rect(22, 27, 4, 8, PAL.acero[2]);         // pie
    L.elipse(24, 36, 8, 3, PAL.acero[1]);
    L.contorno('#0a0d12');
  };

  /* --- herramienta / llave de mecánico --- */
  S2.herramienta = function (L, din) {
    L.linea(12, 36, 34, 14, PAL.hierro[1], 3);
    L.linea(13, 36, 35, 14, PAL.hierro[0], 1);
    L.rect(30, 8, 10, 10, PAL.hierro[1]);
    L.rect(33, 8, 4, 6, null);
    L.rect(33, 8, 4, 6, '#0a0d12');
    L.rect(8, 32, 10, 10, PAL.cuero[1]);
    L.rect(9, 33, 8, 8, PAL.cuero[2]);
    L.contorno('#0a0d12');
  };

  /* --- medalla / condecoración --- */
  S2.medalla = function (L, din) {
    const c = din || '#e0bd5a';
    L.rect(16, 8, 16, 12, PAL.rojo[1]);
    L.rect(16, 8, 16, 2, PAL.rojo[0]);
    L.linea(16, 20, 24, 26, PAL.rojo[2], 2);
    L.linea(32, 20, 24, 26, PAL.rojo[2], 2);
    L.elipse(24, 32, 10, 10, PAL.oro[2]);
    L.elipse(24, 31, 8, 8, c);
    L.elipse(22, 29, 4, 4, PAL.oro[0]);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      L.set(24 + Math.cos(a) * 5, 31 + Math.sin(a) * 5, PAL.oro[3]);
    }
    L.contorno('#0a0d12');
  };

  /* --- amuleto / talismán de bruja --- */
  S2.talisman = function (L, din) {
    const c = din || '#8aff9a';
    for (let i = 0; i < 12; i++) L.set(24 + (i % 5) - 2, 6 + i, PAL.cuero[2]);
    L.elipse(24, 28, 11, 12, PAL.cuero[2]);
    L.elipse(24, 28, 9, 10, PAL.cuero[1]);
    L.elipse(24, 28, 5, 6, '#1a1420');
    L.elipse(24, 27, 3, 4, c);
    L.set(23, 26, '#ffffff');
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      L.set(24 + Math.cos(a) * 8, 28 + Math.sin(a) * 9, c);
    }
    L.contorno('#0a0d12');
  };

  /* --- datachip / holocrón de datos --- */
  S2.datachip = function (L, din) {
    const c = din || '#7fffd0';
    L.bloque(14, 18, 20, 16, PAL.negro);
    L.rect(16, 20, 16, 8, '#0e1a18');
    for (let i = 0; i < 4; i++) L.rect(17, 21 + i * 2, 14 - i * 3, 1, c);
    for (let i = 0; i < 5; i++) L.rect(15 + i * 4, 34, 2, 4, PAL.oro[1]);
    L.rect(14, 18, 20, 1, PAL.negro[0]);
    L.contorno('#0a0d12');
  };

  /* --- bacta / botiquín --- */
  S2.bacta = function (L, din) {
    L.bloque(11, 16, 26, 20, PAL.acero);
    L.rect(22, 20, 4, 12, PAL.rojo[1]);
    L.rect(17, 24, 14, 4, PAL.rojo[1]);
    L.rect(22, 20, 2, 12, PAL.rojo[0]);
    L.rect(11, 34, 26, 2, PAL.acero[3]);
    L.rect(18, 13, 12, 3, PAL.hierro[2]);
    L.contorno('#0a0d12');
  };

  /* --- trofeo de caza --- */
  S2.trofeo = function (L, din) {
    const c = din || '#c8b89a';
    L.elipse(24, 22, 11, 10, c);
    L.elipse(21, 19, 5, 4, '#ffffff');
    L.elipse(19, 21, 2.5, 2, '#12181f'); L.elipse(29, 21, 2.5, 2, '#12181f');
    L.linea(14, 16, 8, 6, c, 2); L.linea(34, 16, 40, 6, c, 2);   // cuernos
    L.rect(20, 30, 8, 4, PAL.cuero[2]);
    L.rect(12, 34, 24, 6, PAL.cuero[1]);
    L.rect(12, 34, 24, 1, PAL.cuero[0]);
    L.contorno('#0a0d12');
  };

  /* --- mejora de motor --- */
  S2.motor = function (L, din) {
    const c = din || '#3ad6ff';
    L.cilindro(10, 16, 28, 16, PAL.hierro);
    L.rect(10, 16, 28, 1, PAL.hierro[0]);
    L.rect(10, 31, 28, 1, PAL.hierro[3]);
    L.elipse(12, 24, 4, 7, PAL.negro[1]);
    L.elipse(12, 24, 2.5, 5, c);
    for (let i = 0; i < 5; i++) L.rect(18 + i * 4, 14, 2, 4, PAL.hierro[2]);
    L.rect(36, 20, 6, 8, PAL.cobre[1]);
    for (let i = 0; i < 4; i++) L.set(6 - i, 24, c);
    L.contorno('#0a0d12');
  };

  /* --- torreta / armamento --- */
  S2.torreta = function (L, din) {
    const c = din || '#ff6a4a';
    L.elipse(24, 32, 13, 8, PAL.hierro[2]);
    L.elipse(24, 30, 11, 7, PAL.hierro[1]);
    L.rect(19, 22, 10, 9, PAL.hierro[1]);
    L.rect(19, 22, 10, 1, PAL.hierro[0]);
    L.rect(13, 12, 4, 14, PAL.hierro[2]); L.rect(31, 12, 4, 14, PAL.hierro[2]);
    L.rect(20, 10, 3, 16, PAL.hierro[1]); L.rect(25, 10, 3, 16, PAL.hierro[1]);
    L.rect(13, 10, 4, 2, c); L.rect(31, 10, 4, 2, c);
    L.rect(20, 8, 3, 2, c); L.rect(25, 8, 3, 2, c);
    L.contorno('#0a0d12');
  };

  /* --- mapa de mejora genérico (sigilo) --- */
  S2.sigilo = function (L, din) {
    const c = din || '#8a7ad8';
    L.elipse(24, 24, 15, 15, '#151a24');
    for (let a = 0; a < 360; a += 18) {
      const r = (a * Math.PI) / 180;
      L.set(24 + Math.cos(r) * 15, 24 + Math.sin(r) * 15, c);
      L.set(24 + Math.cos(r) * 11, 24 + Math.sin(r) * 11, PAL.negro[0]);
    }
    L.elipse(24, 24, 6, 6, PAL.negro[1]);
    L.elipse(24, 24, 3, 3, c);
    L.set(23, 23, '#ffffff');
    L.contorno('#0a0d12');
  };


  /** Qué sprites llevan grano y de qué color: el metal no es plástico. */
  const GRANO = {
    nave_carguero: ['#3a4652', 0.16], nave_capital: ['#3a4652', 0.13],
    nave_lanzadera: ['#3a4652', 0.12], nave_caza: ['#3a4652', 0.12],
    armadura: ['#4a5460', 0.11], casco: ['#4a5460', 0.05],
    casco_soldado: ['#5a6470', 0.10], casco_piloto: ['#5a6470', 0.10],
    carga: ['#2c2012', 0.18], reliquia: ['#4a3c1c', 0.16],
    geoda: ['#2c2838', 0.16], torreta: ['#3a4652', 0.13],
    motor: ['#3a4652', 0.13], trofeo: ['#5e4818', 0.12],
    rifle: ['#2e343c', 0.13], blaster: ['#2e343c', 0.13],
    droide: ['#3a4652', 0.10], astromec: ['#3a4652', 0.10],
    criatura: ['#2a1c10', 0.16]
  };

  /* --- arma blanca: vibrohoja --- */
  S2.vibrohoja = function (L, din) {
    const filo = din || PAL.acero;
    // hoja recta con lomo y filo, apuntando arriba
    for (let y = 4; y < 28; y++) {
      const t = (y - 4) / 24;
      const ancho = Math.round(2 + t * 2);
      L.rect(24 - ancho, y, ancho, 1, filo[0]);        // filo, a la luz
      L.rect(24, y, ancho, 1, filo[2]);                // lomo, en sombra
    }
    L.rect(22, 3, 4, 2, filo[0]);                      // punta
    L.rect(19, 28, 10, 2, PAL.hierro[2]);              // guarda
    L.cilindro(21, 30, 6, 13, PAL.cuero);              // mango forrado
    L.rect(20, 43, 8, 3, PAL.hierro[1]);               // pomo
  };

  /* --- arma blanca eléctrica: bastón --- */
  S2.baston = function (L) {
    L.cilindro(22, 6, 4, 36, PAL.hierro);
    L.rect(20, 4, 8, 4, PAL.acero[1]);
    L.rect(20, 40, 8, 4, PAL.acero[1]);
    for (let y = 12; y < 36; y += 6) L.rect(21, y, 6, 1, PAL.oro[1]);
  };

  /* --- utillaje: mochila propulsora --- */
  S2.jetpack = function (L) {
    L.bloque(14, 12, 20, 22, PAL.hierro);
    L.cilindro(12, 16, 5, 20, PAL.acero);
    L.cilindro(31, 16, 5, 20, PAL.acero);
    L.rect(13, 36, 3, 5, PAL.negro[1]);
    L.rect(32, 36, 3, 5, PAL.negro[1]);
    L.rect(20, 18, 8, 6, PAL.rojo[1]);
  };

  /** dibuja `nombre` en un canvas y lo devuelve */
  SW.pixel2 = function (nombre, opts) {
    const o = opts || {};
    const fn = S2[nombre];
    // el lienzo es el doble de grande que antes, así que la escala por
    // defecto baja a la mitad para que el sprite ocupe lo mismo en pantalla
    const esc = o.escala || 3;
    const cv = document.createElement('canvas');
    cv.width = N * esc; cv.height = N * esc;
    cv.className = 'sprite';
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;
    if (!fn) return cv;

    const L = new Lienzo(N, U);
    fn(L, o.dinamico);

    /* --- acabado: lo que convierte bloques en volumen --- */
    const gr = GRANO[nombre];
    if (gr) L.grano(gr[0], gr[1]);
    L.oclusion(0.30);
    L.luzCanto(0.24);
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
  SW.SPRITES2 = Object.keys(S2);

  /** qué sprite le toca a cada mejora de nave */
  SW.arteMejora = function (m) {
    if (!m) return 'nave_carguero';
    if (m.cat === 'motor') return m.id === 'motor_silencio' ? 'sigilo' : 'motor';
    if (m.cat === 'arma') return 'torreta';
    if (m.cat === 'casco') return m.id === 'casco_medico' ? 'bacta' : 'carga';
    if (m.id === 'ex_droide') return 'astromec';
    if (m.id === 'ex_taller') return 'herramienta';
    if (m.id === 'sis_nav') return 'holomapa';
    if (m.id === 'sis_falsa') return 'credencial';
    if (m.id === 'sis_escaner') return 'holomapa';
    return 'carga';
  };
  SW.Lienzo = Lienzo;
  SW.PAL_PIXEL = PAL;
  SW.S2 = S2;          // para que la capa de detalle fino pueda envolverlos
  SW.PX_N = N; SW.PX_U = U;
  SW.pxTrama = trama;

})(window);

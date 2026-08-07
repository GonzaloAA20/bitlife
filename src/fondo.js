/* ============================================================
   HOLOVIDA :: FONDO EN PIXEL ART
   El fondo eran seis puntitos de CSS haciendo de estrellas. Esto
   dibuja una escena de verdad a baja resolución (192×120) y la
   escala con los píxeles a la vista: cielo con degradado de
   tramado Bayer, nebulosa, estrellas de tres brillos, un planeta
   al fondo y un horizonte propio de cada bioma en tres capas de
   parallax. Cambia cuando cambias de mundo.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  const W = 192, H = 120;

  /* ---- tramado de Bayer 4×4: así se hacen los degradados en pixel art ---- */
  const BAYER = [
    [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]
  ];
  const trama = function (x, y) { return BAYER[y & 3][x & 3] / 16; };

  /* ---- color ---- */
  function rgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function hx(c) {
    return '#' + c.map(function (v) {
      const n = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return n.length < 2 ? '0' + n : n;
    }).join('');
  }
  function mez(a, b, t) {
    const A = rgb(a), B = rgb(b);
    return hx([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  }

  /* ---- generador determinista por mundo ---- */
  function semilla(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5; let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ============================================================
     PALETAS Y HORIZONTES POR BIOMA
     ============================================================ */
  const ESCENA = {
    desierto: { alto: '#2a1a30', bajo: '#c8703a', neb: '#e0a060', suelo: '#3a2418', lejos: '#5a3a24', cerca: '#241408', astro: '#ffd6a0', horizonte: 'dunas' },
    hielo:    { alto: '#0a1a34', bajo: '#4a7ea8', neb: '#a8d8f0', suelo: '#1a3448', lejos: '#2a4e68', cerca: '#0e2030', astro: '#dff0ff', horizonte: 'crestas' },
    ciudad:   { alto: '#120a28', bajo: '#4a2a6a', neb: '#c86adc', suelo: '#160e28', lejos: '#241640', cerca: '#0c0818', astro: '#ffb8f0', horizonte: 'torres' },
    jungla:   { alto: '#08161c', bajo: '#1a5a44', neb: '#5ad8a0', suelo: '#0e2418', lejos: '#153a26', cerca: '#06120c', astro: '#c0ffd8', horizonte: 'copas' },
    oceano:   { alto: '#04162c', bajo: '#1a6a9a', neb: '#6ad8f0', suelo: '#0a2c44', lejos: '#0e4062', cerca: '#051826', astro: '#c0f0ff', horizonte: 'olas' },
    volcanico:{ alto: '#1c0a0a', bajo: '#8a2a14', neb: '#ff8a3a', suelo: '#2a1008', lejos: '#48180c', cerca: '#160604', astro: '#ffb060', horizonte: 'conos' },
    rocoso:   { alto: '#100c1c', bajo: '#4a4058', neb: '#a89ad0', suelo: '#1c1828', lejos: '#2e2840', cerca: '#0e0c16', astro: '#d8ccf0', horizonte: 'canon' },
    templado: { alto: '#0a1424', bajo: '#2a5a5a', neb: '#8ad8c0', suelo: '#12281e', lejos: '#1c3c2a', cerca: '#081410', astro: '#d8f0e0', horizonte: 'colinas' },
    pantano:  { alto: '#0c1408', bajo: '#3a4a1a', neb: '#a8c060', suelo: '#141c0c', lejos: '#202c12', cerca: '#0a1006', astro: '#e0f0a0', horizonte: 'juncos' },
    gaseoso:  { alto: '#2a1408', bajo: '#c8863a', neb: '#ffd8a0', suelo: '#3a2410', lejos: '#5a3a18', cerca: '#20120a', astro: '#fff0d0', horizonte: 'nubes' }
  };

  /* ============================================================
     DIBUJO
     ============================================================ */
  function pintar(mundo) {
    const bioma = (SW.biomaDe ? SW.biomaDe(mundo).id : 'rocoso');
    const E = ESCENA[bioma] || ESCENA.rocoso;
    const r = semilla(mundo || 'nada');

    const cv = global.document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const px = function (x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); };

    const suelo = 84 + Math.floor(r() * 10);

    /* --- 1. cielo con degradado tramado --- */
    for (let y = 0; y < suelo; y++) {
      const t = y / suelo;
      for (let x = 0; x < W; x++) {
        // el tramado rompe la banda: dos tonos alternando según Bayer
        const tt = Math.max(0, Math.min(1, t + (trama(x, y) - 0.5) * 0.16));
        px(x, y, mez(E.alto, E.bajo, tt * tt));
      }
    }

    /* --- 2. nebulosa: manchas suaves con tramado --- */
    const nubes = 2 + Math.floor(r() * 3);
    for (let n = 0; n < nubes; n++) {
      const cx = r() * W, cy = r() * suelo * 0.8, rx = 24 + r() * 46, ry = 10 + r() * 20;
      const fuerza = 0.20 + r() * 0.24;
      for (let y = Math.max(0, cy - ry) | 0; y < Math.min(suelo, cy + ry); y++) {
        for (let x = Math.max(0, cx - rx) | 0; x < Math.min(W, cx + rx); x++) {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          const d = 1 - (dx * dx + dy * dy);
          if (d <= 0) continue;
          if (trama(x, y) > d * fuerza * 3.2) continue;   // el tramado hace de alfa
          // se pinta encima con el tono de nebulosa mezclado con el cielo de esa altura
          const cieloAqui = mez(E.alto, E.bajo, Math.pow(y / suelo, 2));
          px(x, y, mez(cieloAqui, E.neb, 0.45));
        }
      }
    }

    /* --- 3. estrellas de tres brillos --- */
    const estrellas = 90 + Math.floor(r() * 60);
    for (let i = 0; i < estrellas; i++) {
      const x = (r() * W) | 0, y = (r() * (suelo - 6)) | 0;
      const b = r();
      if (b > 0.94) {                       // las gordas, con destello en cruz
        px(x, y, '#ffffff');
        px(x - 1, y, '#b8d8f0'); px(x + 1, y, '#b8d8f0');
        px(x, y - 1, '#b8d8f0'); px(x, y + 1, '#b8d8f0');
      } else if (b > 0.72) px(x, y, '#dfeaf6');
      else px(x, y, mez(E.bajo, '#ffffff', 0.45));
    }

    /* --- 4. un cuerpo celeste al fondo --- */
    if (r() > 0.25) {
      const cx = 20 + r() * (W - 40), cy = 16 + r() * 26, rad = 9 + r() * 16;
      for (let y = (cy - rad) | 0; y <= cy + rad; y++) {
        for (let x = (cx - rad) | 0; x <= cx + rad; x++) {
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy > rad * rad) continue;
          // luz por un lado, terminador tramado por el otro
          const luz = (-dx * 0.7 - dy * 0.7) / rad;
          const t = Math.max(0, Math.min(1, (luz + 0.55) * 0.9));
          if (t + (trama(x, y) - 0.5) * 0.3 < 0.16) continue;   // lado nocturno
          px(x, y, mez(mez(E.astro, '#000000', 0.55), E.astro, t));
        }
      }
      // un anillo de vez en cuando
      if (r() > 0.7) {
        for (let x = (cx - rad * 1.9) | 0; x <= cx + rad * 1.9; x++) {
          const dy = Math.round(cy + (x - cx) * 0.14);
          if (Math.abs(x - cx) < rad * 0.92) continue;
          px(x, dy, mez(E.astro, '#ffffff', 0.3));
          px(x, dy + 1, mez(E.astro, '#000000', 0.35));
        }
      }
    }

    /* --- 5. tres capas de horizonte --- */
    capa(g, px, E, r, suelo, 0.55, E.lejos, bioma, 1);
    capa(g, px, E, r, suelo + 6, 1.0, E.suelo, bioma, 2);
    capa(g, px, E, r, suelo + 18, 1.6, E.cerca, bioma, 3);

    /* --- 6. suelo hasta abajo --- */
    for (let y = suelo + 18; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const t = (y - suelo - 18) / (H - suelo - 18);
        if (trama(x, y) > 1 - t * 0.5) px(x, y, mez(E.cerca, '#000000', 0.4));
        else px(x, y, E.cerca);
      }
    }

    return cv.toDataURL('image/png');
  }

  /** una capa de silueta: cada bioma tiene su perfil */
  function capa(g, px, E, r, base, escala, color, bioma, n) {
    const alturas = new Array(W);
    const tipo = E.horizonte;

    for (let x = 0; x < W; x++) {
      let h = 0;
      if (tipo === 'dunas') {
        h = Math.sin(x / (16 * escala) + n) * 6 * escala + Math.sin(x / 7 + n * 2) * 2;
      } else if (tipo === 'torres') {
        const blq = Math.floor(x / (7 + n * 2));
        h = ((blq * 2654435761) % 100) / 100 * 26 * escala;
        h = Math.round(h);
      } else if (tipo === 'crestas') {
        h = Math.abs(Math.sin(x / (11 * escala) + n)) * 14 * escala;
      } else if (tipo === 'copas') {
        h = Math.abs(Math.sin(x / 5 + n)) * 5 * escala + Math.abs(Math.sin(x / 17 + n)) * 9 * escala;
      } else if (tipo === 'olas') {
        h = Math.sin(x / 9 + n * 1.7) * 3 * escala + 1;
      } else if (tipo === 'conos') {
        h = Math.max(0, 16 * escala - Math.abs((x % (48 + n * 9)) - (24 + n * 4)) * 1.1);
      } else if (tipo === 'canon') {
        h = Math.max(0, Math.sin(x / (13 * escala) + n) * 13 * escala);
        if ((x + n * 7) % 37 < 3) h += 5 * escala;
      } else if (tipo === 'colinas') {
        h = (Math.sin(x / (19 * escala) + n) + 1) * 5 * escala;
      } else if (tipo === 'juncos') {
        h = ((x * 2654435761) % 7) * escala + Math.sin(x / 21 + n) * 3 * escala;
      } else {   // nubes
        h = (Math.sin(x / 23 + n) + Math.sin(x / 11 + n * 2)) * 4 * escala + 4;
      }
      alturas[x] = Math.max(0, Math.round(h));
    }

    for (let x = 0; x < W; x++) {
      const top = base - alturas[x];
      for (let y = top; y < base + 20 && y < H; y++) {
        if (y < 0) continue;
        px(x, y, color);
      }
      // borde iluminado arriba: da volumen y se ve "dibujado"
      if (top >= 0 && top < H) px(x, top, mez(color, '#ffffff', 0.22));
    }

    // detalles: ventanas en las torres, brasas en los conos, luces en las copas
    if (tipo === 'torres' && n <= 2) {
      for (let x = 0; x < W; x += 2) {
        const top = base - alturas[x];
        for (let y = top + 2; y < base; y += 3) {
          if (((x * 31 + y * 17) % 11) < 3) px(x, y, n === 1 ? '#ffd6a0' : '#ffb060');
        }
      }
    }
    if (tipo === 'conos' && n >= 2) {
      for (let x = 0; x < W; x++) {
        const top = base - alturas[x];
        if (alturas[x] > 6 && ((x * 7) % 13) < 2) {
          px(x, top + 1, '#ff8a3a'); px(x, top + 2, '#ffb060');
        }
      }
    }
    if ((tipo === 'copas' || tipo === 'juncos') && n === 3) {
      for (let x = 0; x < W; x += 3) {
        if (((x * 13) % 17) < 2) px(x, base - alturas[x] - 1, '#8affc0');
      }
    }
  }

  /* ============================================================
     API
     ============================================================ */
  const cache = {};
  SW.fondoDe = function (mundo) {
    const k = mundo || 'nada';
    if (!cache[k]) {
      try { cache[k] = pintar(k); } catch (e) { cache[k] = null; }
    }
    return cache[k];
  };

  /** lo aplica al documento; lo llama la interfaz al cambiar de mundo */
  SW.aplicarFondo = function (mundo) {
    const url = SW.fondoDe(mundo);
    if (!url) return;
    const r = global.document.documentElement;
    r.style.setProperty('--fondo-escena', 'url(' + url + ')');
    r.setAttribute('data-fondo', '1');
  };

})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   HOLOVIDA :: RETRATO EN PIXEL ART (64×64)
   El retrato viejo eran cuatro formas de SVG. Esto es un motor
   de píxel de verdad: rejilla de 64×64 (16 veces más píxeles
   que un sprite de 16), rampa de cinco tonos calculada a partir
   del color de piel que elijas, luz desde arriba a la izquierda,
   y anatomía propia para cada especie: lekku, montrales, cuernos,
   hocicos, antenas, branquias, cascos y vendajes.

   Sale un <img> con un PNG dentro, así que encaja donde antes
   iba el SVG sin tocar nada más.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const N = 64;                    // lado del lienzo en píxeles

  /* ══════════════ color ══════════════ */
  function rgb(h) {
    h = String(h || '#888888').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function hex(c) {
    return '#' + c.map(function (v) {
      const n = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return n.length < 2 ? '0' + n : n;
    }).join('');
  }
  function mezcla(a, b, t) {
    const A = rgb(a), B = rgb(b);
    return hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  }
  const clarear = function (c, t) { return mezcla(c, '#ffffff', t); };
  const oscurecer = function (c, t) { return mezcla(c, '#0a0a12', t); };

  /** cinco tonos + línea a partir de un color base */
  function rampa(base) {
    return {
      luz2: clarear(base, 0.34),
      luz1: clarear(base, 0.16),
      base: base,
      som1: oscurecer(base, 0.20),
      som2: oscurecer(base, 0.40),
      linea: oscurecer(base, 0.62)
    };
  }

  /* ══════════════ lienzo ══════════════ */
  function Lienzo() { this.p = new Array(N * N).fill(null); }
  const L = Lienzo.prototype;

  L.set = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (c == null || x < 0 || y < 0 || x >= N || y >= N) return;
    this.p[y * N + x] = c;
  };
  L.get = function (x, y) {
    if (x < 0 || y < 0 || x >= N || y >= N) return null;
    return this.p[y * N + x];
  };
  /** pinta solo donde ya hay algo (para sombrear sin desbordar la silueta) */
  L.sobre = function (x, y, c) { if (this.get(x, y)) this.set(x, y, c); };

  L.rect = function (x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  };
  L.hlin = function (x, y, w, c) { for (let i = 0; i < w; i++) this.set(x + i, y, c); };
  L.vlin = function (x, y, h, c) { for (let j = 0; j < h; j++) this.set(x, y + j, c); };

  L.elipse = function (cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.02) this.set(x, y, c);
      }
    }
  };
  /** media elipse: lado = 'arriba' | 'abajo' */
  L.mediaElipse = function (cx, cy, rx, ry, c, lado) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      if (lado === 'arriba' && y > cy) continue;
      if (lado === 'abajo' && y < cy) continue;
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.02) this.set(x, y, c);
      }
    }
  };

  /** línea de Bresenham con grosor */
  L.linea = function (x0, y0, x1, y1, c, g) {
    g = g || 1;
    // Bresenham necesita enteros: con decimales la comparación final
    // no se cumplía nunca y la línea se disparaba fuera del lienzo
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx - dy, x = x0, y = y0, seg = 0;
    while (seg++ < 200) {
      if (g <= 1) this.set(x, y, c); else this.rect(x - ((g / 2) | 0), y - ((g / 2) | 0), g, g, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * e;
      if (e2 > -dy) { e -= dy; x += sx; }
      if (e2 < dx) { e += dx; y += sy; }
    }
  };

  /** contorno oscuro alrededor de todo lo pintado, por fuera */
  L.contorno = function (c, fondoNulo) {
    const copia = this.p.slice();
    const lleno = function (i) { return copia[i] != null && copia[i] !== fondoNulo; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      if (lleno(i)) continue;
      if ((x > 0 && lleno(i - 1)) || (x < N - 1 && lleno(i + 1)) ||
          (y > 0 && lleno(i - N)) || (y < N - 1 && lleno(i + N))) this.set(x, y, c);
    }
  };

  /* ══════════════ familias de especie ══════════════ */
  /* cada especie apunta a un tratamiento anatómico */
  const FAM = {
    humano: 'humano', humano_corelliano: 'humano', echani: 'palido', clon: 'humano',
    clon_nulo: 'humano', kissai: 'sith', dathomiriana: 'sith', mandaloriano: 'humano',
    twilek: 'twilek', togruta: 'togruta', zabrak: 'zabrak', rodiano: 'rodiano',
    wookiee: 'peludo', mon_cal: 'moncal', quarren: 'quarren', bothan: 'peludo_fino',
    chiss: 'chiss', nautolano: 'nautolano', kel_dor: 'keldor', trandoshano: 'reptil',
    ithoriano: 'ithoriano', gungan: 'gungan', sullustano: 'sullustano',
    devaroniano: 'cuernudo', duros: 'duros', gran: 'gran', aqualish: 'aqualish',
    hutt: 'hutt', droide: 'droide', yodesano: 'orejudo', geonosiano: 'insecto',
    nikto: 'nikto', weequay: 'weequay', pantorano: 'chiss', lasat: 'lasat',
    ugnaught: 'hocico', jawa: 'encapuchado', cerean: 'cerean', miraluka: 'miraluka',
    anzati: 'humano', falleen: 'cresta', defel: 'sombra', talz: 'talz',
    chagriano: 'chagriano', muun: 'muun', neimoidiano: 'neimoidiano',
    kaminoano: 'kaminoano', ortolano: 'trompa', bith: 'bith', shistavanen: 'lobo',
    noghri: 'noghri', yuzzem: 'peludo', selkath: 'selkath', tusken: 'vendado',
    ewok: 'peludo_capucha', gamorreano: 'hocico', kubaz: 'kubaz', sluissi: 'reptil',
    togorian: 'felino', verpine: 'insecto', ryn: 'ryn'
  };

  /* pieles que la especie impone por encima de lo que elijas */
  const PIEL_FIJA = {
    chiss: '#7aa8d8', pantorano: '#6a9ad0', rodiano: '#5fae5a', duros: '#6aa8c0',
    nautolano: '#4fa89a', mon_cal: '#c88a4a', quarren: '#b06a5a', trandoshano: '#7a9a4a',
    geonosiano: '#a08050', yodesano: '#8ab04a', ithoriano: '#b08a5a', gungan: '#c8a878',
    kel_dor: '#c05a4a', hutt: '#9aa858', talz: '#e8e8f0', lasat: '#9a8ac0',
    neimoidiano: '#8aa87a', muun: '#d8d0c0', kaminoano: '#e0dce8', ortolano: '#6a9ad8',
    bith: '#d8c8a8', selkath: '#8ab0a0', wookiee: '#7a5a38', ewok: '#8a6a48',
    gamorreano: '#7aa050', ugnaught: '#e0b8a0', droide: '#9aa4b0', defel: '#2a2a38',
    verpine: '#9ab08a', shistavanen: '#8a7a68', togorian: '#a08858', noghri: '#7a8088',
    sullustano: '#c8a888', weequay: '#a89070', nikto: '#9a7050', jawa: '#3a2a20'
  };

  /* ══════════════ el retrato ══════════════ */
  function dibujar(ap, especie) {
    const lz = new Lienzo();
    ap = ap || {};
    const fam = FAM[especie] || 'humano';
    const pielBase = PIEL_FIJA[especie] || ap.piel || '#c98d5a';
    const P = rampa(pielBase);
    const ojoC = ap.ojos || '#3ad6ff';
    const peloC = ap.pelo && ap.pelo !== 'ninguno' ? ap.pelo : null;
    const forma = ap.forma == null ? 0 : ap.forma;
    const tocado = ap.tocado || 'nada';
    const marca = ap.marca || 'sin marcas';

    /* ---- geometría de la cabeza según forma y especie ---- */
    let cx = 32, cy = 27, rx = 14, ry = 16;
    if (forma === 1) { rx = 13; ry = 18; }        // alargada
    else if (forma === 2) { rx = 16; ry = 15; }   // ancha
    else if (forma === 3) { rx = 15; ry = 17; }   // cuadrada
    if (fam === 'cerean' || fam === 'muun' || fam === 'kaminoano') { ry += 5; cy -= 3; rx -= 2; }
    if (fam === 'bith') { rx += 3; ry += 2; cy -= 2; }
    if (fam === 'hutt') { rx += 5; ry -= 2; }
    if (fam === 'insecto') { rx -= 2; ry += 3; }

    const arriba = cy - ry, abajo = cy + ry;

    /* ---------- 1. cuello y hombros ---------- */
    const ROPA = {
      'túnica de arpillera': '#9a8258', 'chaqueta de piloto': '#6a4a34', 'uniforme imperial': '#4a525c',
      'armadura completa': '#b0bac6', 'traje de gala': '#42306a', 'mono de mecánico': '#3a6a52',
      'capa de cazador': '#6a3434', 'túnica jedi': '#8a6e46', 'ropa de calle de Nar Shaddaa': '#2e4266',
      'traje de vuelo rebelde': '#d0742e'
    };
    const R = rampa(ROPA[ap.ropa] || '#3a4a58');

    // cuello
    lz.rect(cx - 5, abajo - 4, 10, 9, P.som1);
    lz.rect(cx - 5, abajo - 4, 10, 3, P.som2);          // sombra de la mandíbula
    lz.vlin(cx + 3, abajo - 3, 8, P.som2);

    // hombros: dos hombreras y el pecho
    lz.mediaElipse(cx, 60, 26, 14, R.base, 'arriba');
    lz.mediaElipse(cx, 61, 26, 13, R.luz1, 'arriba');
    lz.mediaElipse(cx, 63, 24, 12, R.base, 'arriba');
    // pliegues
    lz.linea(cx - 9, 52, cx - 13, 63, R.som1, 1);
    lz.linea(cx + 9, 52, cx + 13, 63, R.som1, 1);
    lz.linea(cx - 3, 51, cx - 2, 63, R.som2, 1);
    lz.linea(cx + 3, 51, cx + 2, 63, R.som2, 1);
    // luz en el hombro izquierdo (la luz viene de arriba-izquierda)
    for (let x = cx - 24; x < cx - 6; x++) for (let y = 50; y < 58; y++) {
      if (lz.get(x, y) === R.base || lz.get(x, y) === R.luz1) lz.set(x, y, R.luz2);
    }
    if (ap.ropa === 'armadura completa') {
      lz.rect(cx - 22, 52, 9, 5, R.luz2); lz.rect(cx + 13, 52, 9, 5, R.som1);
      lz.hlin(cx - 22, 52, 9, R.linea); lz.hlin(cx + 13, 52, 9, R.linea);
    }
    if (ap.ropa === 'uniforme imperial') {
      lz.rect(cx - 12, 54, 5, 3, '#c8c8d0'); lz.rect(cx - 12, 58, 5, 3, '#d84a4a');
    }
    if (ap.ropa === 'túnica jedi' || ap.ropa === 'túnica de arpillera') {
      lz.linea(cx - 7, 49, cx - 14, 63, R.som2, 2);
      lz.linea(cx + 7, 49, cx + 14, 63, R.som2, 2);
    }

    /* ---------- 2. cráneo ---------- */
    lz.elipse(cx, cy, rx, ry, P.base);
    if (fam === 'insecto') {                  // cráneo alargado hacia atrás
      lz.elipse(cx + 2, cy - 4, rx - 2, ry - 4, P.base);
      lz.elipse(cx, cy + 6, rx - 3, ry - 6, P.base);
    }
    if (forma === 3) {                        // mandíbula cuadrada
      lz.rect(cx - rx + 2, cy + 4, (rx - 2) * 2, ry - 5, P.base);
    }
    if (fam === 'hutt') lz.mediaElipse(cx, cy + ry - 2, rx + 3, 8, P.base, 'abajo');

    // volumen: luz arriba-izquierda, sombra abajo-derecha
    for (let y = arriba - 2; y <= abajo + 2; y++) for (let x = cx - rx - 2; x <= cx + rx + 2; x++) {
      if (lz.get(x, y) !== P.base) continue;
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      const d = dx * dx + dy * dy;
      const luzDir = (-dx * 0.72) + (-dy * 0.68);        // producto con el vector de luz
      if (d > 0.74 && luzDir < -0.25) lz.set(x, y, P.som2);
      else if (luzDir < -0.02) lz.set(x, y, P.som1);
      else if (luzDir > 0.52 && d < 0.62) lz.set(x, y, P.luz2);
      else if (luzDir > 0.18) lz.set(x, y, P.luz1);
    }
    // sombra bajo la barbilla y en las sienes
    lz.mediaElipse(cx, abajo - 1, rx - 4, 3, P.som2, 'abajo');
    lz.sobre(cx - rx + 1, cy - 2, P.som1); lz.sobre(cx + rx - 1, cy - 2, P.som2);

    /* ---------- 3. orejas ---------- */
    const conOrejas = ['humano', 'palido', 'sith', 'chiss', 'zabrak', 'cuernudo', 'weequay',
                       'cerean', 'miraluka', 'noghri', 'nikto', 'cresta', 'neimoidiano', 'ryn'];
    if (conOrejas.indexOf(fam) >= 0) {
      lz.elipse(cx - rx + 1, cy + 1, 2, 4, P.som1);
      lz.elipse(cx + rx - 1, cy + 1, 2, 4, P.som1);
      lz.set(cx - rx + 1, cy + 1, P.som2); lz.set(cx + rx - 1, cy + 1, P.som2);
    }
    if (fam === 'orejudo') {                    // orejas enormes hacia fuera
      lz.elipse(cx - rx - 3, cy - 1, 6, 4, P.base);
      lz.elipse(cx + rx + 3, cy - 1, 6, 4, P.som1);
      lz.elipse(cx - rx - 3, cy - 1, 4, 2, P.som1);
      lz.elipse(cx + rx + 3, cy - 1, 4, 2, P.som2);
    }
    if (fam === 'lasat' || fam === 'felino' || fam === 'lobo') {   // orejas puntiagudas arriba
      lz.linea(cx - rx + 3, arriba + 4, cx - rx - 1, arriba - 4, P.base, 3);
      lz.linea(cx + rx - 3, arriba + 4, cx + rx + 1, arriba - 4, P.som1, 3);
      lz.linea(cx - rx + 2, arriba + 3, cx - rx, arriba - 2, P.som2, 1);
    }


    /* ---- 3bis. pelaje: va ANTES de la cara, o taparía los ojos ---- */
    if (fam === 'peludo' || fam === 'peludo_capucha' || fam === 'peludo_fino') {
      const f = peloC ? peloC : oscurecer(pielBase, 0.25);
      const F = rampa(f);
      const largo = fam === 'peludo_fino' ? 2 : 4;
      lz.elipse(cx, cy + 1, rx + largo, ry + largo, F.som1);
      lz.elipse(cx, cy, rx + largo - 1, ry + largo - 1, F.base);
      lz.mediaElipse(cx - 2, cy - 2, rx + largo - 3, ry + largo - 3, F.luz1, 'arriba');
      // mechones: dientes de sierra en el borde, no rayos
      for (let a = 0; a < 360; a += 11) {
        const r = (a * Math.PI) / 180;
        const m = 1 + ((a / 11) % 3);
        lz.linea(cx + Math.cos(r) * (rx + largo - 1), cy + Math.sin(r) * (ry + largo - 1),
                 cx + Math.cos(r) * (rx + largo + m), cy + Math.sin(r) * (ry + largo + m),
                 (a % 22 < 11) ? F.base : F.som2, 1);
      }
      // la cara, despejada dentro del pelo
      lz.elipse(cx, cy + 2, rx - 2, ry - 4, P.base);
      lz.mediaElipse(cx - 2, cy, rx - 4, ry - 6, P.luz1, 'arriba');
      lz.mediaElipse(cx, cy + ry - 3, rx - 4, 3, P.som1, 'abajo');
    } else if (fam === 'talz') {
      lz.elipse(cx, cy + 1, rx + 5, ry + 5, '#c8ccd8');
      lz.elipse(cx, cy, rx + 4, ry + 4, '#e8ecf4');
      lz.mediaElipse(cx - 2, cy - 2, rx + 1, ry + 1, '#ffffff', 'arriba');
      for (let a = 0; a < 360; a += 9) {
        const r = (a * Math.PI) / 180;
        lz.linea(cx + Math.cos(r) * (rx + 4), cy + Math.sin(r) * (ry + 4),
                 cx + Math.cos(r) * (rx + 6), cy + Math.sin(r) * (ry + 6),
                 a % 18 < 9 ? '#ffffff' : '#c0c6d4', 1);
      }
      lz.elipse(cx, cy + 2, rx - 3, ry - 5, P.som1);
      lz.mediaElipse(cx - 1, cy + 1, rx - 5, ry - 7, P.base, 'arriba');
    }

    /* ---------- 4. ojos ---------- */
    const sinOjos = (tocado === 'casco de beskar' || fam === 'keldor' || fam === 'vendado' ||
                     fam === 'miraluka' || fam === 'droide' || fam === 'encapuchado' || fam === 'sombra' ||
                     fam === 'moncal' || fam === 'ithoriano' || fam === 'gungan' ||
                     tocado === 'visor cibernético' || tocado === 'gafas de soldador');
    const ojoY = cy - 1;
    let ojoDX = 6, ojoRX = 3, ojoRY = 2;
    if (fam === 'rodiano' || fam === 'duros' || fam === 'bith' || fam === 'nautolano') { ojoDX = 7; ojoRX = 4; ojoRY = 4; }
    if (fam === 'insecto') { ojoDX = 7; ojoRX = 4; ojoRY = 3; }
    if (fam === 'moncal') { ojoDX = 9; ojoRX = 4; ojoRY = 4; }
    if (fam === 'kaminoano') { ojoDX = 6; ojoRX = 4; ojoRY = 2; }

    function ojo(px) {
      // cuenca
      lz.elipse(px, ojoY, ojoRX + 1, ojoRY + 1, P.som2);
      if (fam === 'rodiano' || fam === 'duros' || fam === 'bith' || fam === 'insecto' || fam === 'nautolano') {
        // ojos enteros negros con brillo
        lz.elipse(px, ojoY, ojoRX, ojoRY, '#0d1016');
        lz.elipse(px, ojoY, ojoRX - 1, ojoRY - 1, mezcla('#0d1016', ojoC, 0.35));
        lz.set(px - 1, ojoY - 1, '#ffffff'); lz.set(px - 1, ojoY - 2, clarear(ojoC, 0.6));
        return;
      }
      lz.elipse(px, ojoY, ojoRX, ojoRY, '#efeadf');           // esclerótica
      lz.elipse(px, ojoY, ojoRX - 1, ojoRY, oscurecer('#efeadf', 0.12));
      lz.elipse(px, ojoY, ojoRY - 0.2, ojoRY - 0.2, ojoC);    // iris
      lz.elipse(px, ojoY, Math.max(1, ojoRY - 1.4), Math.max(1, ojoRY - 1.4), oscurecer(ojoC, 0.55));
      lz.set(px, ojoY, '#08090c');                             // pupila
      lz.set(px - 1, ojoY - 1, '#ffffff');                     // brillo
      lz.hlin(px - ojoRX, ojoY - ojoRY, ojoRX * 2 + 1, P.som2); // párpado
      lz.hlin(px - ojoRX + 1, ojoY - ojoRY - 1, ojoRX * 2 - 1, P.som1);
    }
    if (!sinOjos) {
      ojo(cx - ojoDX); ojo(cx + ojoDX);
      if (fam === 'gran') { ojoDX = 0; ojo(cx); }               // el tercer ojo
      if (fam === 'talz' || fam === 'aqualish') {               // par extra, más pequeño
        const g = ojoRX; ojoRX = 2; ojoRY = 1;
        ojo(cx - ojoDX - 1); ojo(cx + ojoDX + 1); ojoRX = g;
      }
    }

    /* ---------- 5. cejas ---------- */
    if (!sinOjos && peloC && fam !== 'rodiano' && fam !== 'duros' && fam !== 'bith' && fam !== 'insecto') {
      const cj = oscurecer(peloC, 0.15);
      lz.hlin(cx - ojoDX - 3, ojoY - ojoRY - 3, 6, cj);
      lz.hlin(cx + ojoDX - 2, ojoY - ojoRY - 3, 6, cj);
      lz.set(cx - ojoDX - 3, ojoY - ojoRY - 2, cj); lz.set(cx + ojoDX + 3, ojoY - ojoRY - 2, cj);
    }

    /* ---------- 6. nariz y boca ---------- */
    const bocaY = cy + Math.round(ry * 0.55);
    if (fam === 'hocico' || fam === 'lobo' || fam === 'felino' || fam === 'peludo' || fam === 'peludo_capucha') {
      // hocico saliente
      lz.elipse(cx, bocaY - 2, 6, 5, P.luz1);
      lz.elipse(cx, bocaY - 3, 5, 3, P.luz2);
      lz.elipse(cx, bocaY - 4, 2, 1.5, oscurecer(P.linea, 0.2));   // trufa
      lz.hlin(cx - 4, bocaY + 1, 9, P.linea);
      lz.set(cx - 5, bocaY, P.linea); lz.set(cx + 5, bocaY, P.linea);
      if (fam === 'hocico') {                                       // colmillos
        lz.vlin(cx - 3, bocaY + 2, 2, '#f0ead8'); lz.vlin(cx + 3, bocaY + 2, 2, '#f0ead8');
      }
    } else if (fam === 'trompa') {
      lz.rect(cx - 2, cy + 2, 4, 12, P.som1);
      lz.rect(cx - 2, cy + 2, 2, 12, P.base);
      lz.hlin(cx - 2, cy + 13, 4, P.som2);
    } else if (fam === 'quarren') {
      for (let i = -2; i <= 2; i++) lz.vlin(cx + i * 2, bocaY - 3, 8 - Math.abs(i), P.som1);
      for (let i = -2; i <= 2; i++) lz.set(cx + i * 2, bocaY + 4 - Math.abs(i), P.som2);
    } else if (fam === 'ithoriano') {
      lz.rect(cx - 8, bocaY, 4, 3, P.som2); lz.rect(cx + 5, bocaY, 4, 3, P.som2);
    } else if (fam === 'kubaz' || fam === 'ryn') {
      lz.linea(cx, cy - 1, cx - 1, cy + 8, P.som1, 3);
      lz.set(cx - 1, cy + 8, P.linea);
    } else if (fam === 'duros' || fam === 'bith' || fam === 'insecto') {
      lz.hlin(cx - 3, bocaY + 1, 7, P.som2);                        // boca fina, sin nariz
      lz.set(cx - 1, cy + 2, P.som1); lz.set(cx + 1, cy + 2, P.som1);
    } else if (fam === 'reptil' || fam === 'selkath') {
      lz.elipse(cx, bocaY - 1, 5, 3, P.som1);
      lz.hlin(cx - 5, bocaY + 1, 11, P.linea);
      lz.set(cx - 2, cy + 1, P.som2); lz.set(cx + 2, cy + 1, P.som2);
    } else if (fam === 'droide') {
      lz.rect(cx - 5, bocaY, 11, 3, oscurecer(pielBase, 0.55));
      for (let i = 0; i < 5; i++) lz.vlin(cx - 4 + i * 2, bocaY, 3, oscurecer(pielBase, 0.3));
    } else {
      // nariz humana: caballete iluminado, ala y fosa
      lz.vlin(cx - 1, cy + 1, 4, P.luz1);
      lz.vlin(cx, cy + 1, 4, P.som1);
      lz.set(cx + 1, cy + 4, P.som2); lz.set(cx - 2, cy + 4, P.som2);
      lz.hlin(cx - 2, cy + 5, 5, P.som1);
      // boca
      lz.hlin(cx - 3, bocaY, 7, P.som2);
      lz.hlin(cx - 2, bocaY + 1, 5, P.luz1);                        // labio inferior con luz
      lz.set(cx - 4, bocaY, P.som1); lz.set(cx + 4, bocaY, P.som1);
    }

    /* ---------- 7. anatomía propia de la especie ---------- */
    switch (fam) {
      case 'twilek': {                                   // dos lekku por delante de los hombros
        const l = P.som1;
        for (let i = 0; i < 26; i++) {
          const w = Math.max(2, 5 - Math.floor(i / 7));
          lz.rect(cx - rx - 1 - Math.floor(i / 9), arriba + 9 + i, w, 1, i % 6 < 3 ? l : P.som2);
          lz.rect(cx + rx - 2 + Math.floor(i / 9), arriba + 9 + i, w, 1, i % 6 < 3 ? P.som2 : oscurecer(l, 0.12));
        }
        for (let i = 0; i < 26; i += 5) {                // bandas de piel
          lz.hlin(cx - rx - 1, arriba + 10 + i, 4, P.linea);
          lz.hlin(cx + rx - 2, arriba + 10 + i, 4, P.linea);
        }
        break;
      }
      case 'togruta': {                                  // montrales + tres lekku
        lz.linea(cx - 8, arriba + 2, cx - 13, arriba - 7, P.base, 4);
        lz.linea(cx + 8, arriba + 2, cx + 13, arriba - 7, P.som1, 4);
        lz.linea(cx - 12, arriba - 6, cx - 13, arriba - 9, P.luz1, 2);
        lz.linea(cx + 12, arriba - 6, cx + 13, arriba - 9, P.som2, 2);
        for (let i = 0; i < 22; i++) {
          lz.rect(cx - rx, arriba + 12 + i, 4, 1, i % 7 < 4 ? P.som1 : '#f0eae0');
          lz.rect(cx + rx - 3, arriba + 12 + i, 4, 1, i % 7 < 4 ? P.som2 : '#e0dad0');
        }
        lz.rect(cx - 3, arriba - 3, 7, 6, '#f0eae0');    // marca blanca de la frente
        lz.rect(cx - 2, arriba - 2, 5, 4, '#ffffff');
        break;
      }
      case 'zabrak': {                                   // corona de cuernos
        const h = oscurecer(pielBase, 0.5);
        for (let i = -3; i <= 3; i++) {
          const px = cx + i * 4, alt = 4 - Math.abs(i);
          lz.linea(px, arriba + 2, px, arriba - 1 - alt, h, 2);
          lz.set(px, arriba - 2 - alt, oscurecer(h, 0.3));
        }
        break;
      }
      case 'cuernudo': {                                 // dos cuernos grandes de devaroniano
        const h = '#d8cdb8';
        lz.linea(cx - 7, arriba + 3, cx - 9, arriba - 9, h, 3);
        lz.linea(cx + 7, arriba + 3, cx + 9, arriba - 9, oscurecer(h, 0.18), 3);
        lz.set(cx - 9, arriba - 10, '#fffbf0'); lz.set(cx + 9, arriba - 10, '#e8ddc8');
        break;
      }
      case 'rodiano': {                                  // antenas y hocico corto
        lz.linea(cx - 4, arriba + 1, cx - 6, arriba - 7, P.som1, 2);
        lz.linea(cx + 4, arriba + 1, cx + 6, arriba - 7, P.som2, 2);
        lz.elipse(cx - 6, arriba - 8, 2, 2, P.luz1); lz.elipse(cx + 6, arriba - 8, 2, 2, P.som1);
        lz.elipse(cx, bocaY, 4, 3, P.som1); lz.hlin(cx - 3, bocaY + 2, 7, P.linea);
        break;
      }
      case 'nautolano': {                                // tentáculos craneales
        for (let i = -2; i <= 2; i++) {
          const bx = cx + i * 5;
          for (let j = 0; j < 20; j++) {
            lz.rect(bx + Math.round(Math.sin(j / 5 + i) * 2), arriba + 6 + j, 3, 1,
                    j % 5 < 3 ? P.som1 : P.som2);
          }
        }
        break;
      }
      case 'moncal': {                                   // cráneo alto, ojos a los lados
        lz.mediaElipse(cx, arriba + 6, rx - 1, 9, P.luz1, 'arriba');
        lz.elipse(cx - rx + 1, cy - 1, 4, 4, P.som1); lz.elipse(cx + rx - 1, cy - 1, 4, 4, P.som2);
        lz.elipse(cx - rx + 1, cy - 1, 3, 3, '#efeadf'); lz.elipse(cx + rx - 1, cy - 1, 3, 3, '#e0dbd0');
        lz.elipse(cx - rx + 1, cy - 1, 1.6, 1.6, ojoC); lz.elipse(cx + rx - 1, cy - 1, 1.6, 1.6, ojoC);
        lz.set(cx - rx + 1, cy - 1, '#08090c'); lz.set(cx + rx - 1, cy - 1, '#08090c');
        break;
      }
      case 'keldor': {                                   // máscara antiox + gafas
        lz.elipse(cx, cy + 2, rx - 2, ry - 4, '#3a3f48');
        lz.elipse(cx, cy + 3, rx - 4, ry - 7, '#4a505a');
        lz.elipse(cx - 6, cy - 2, 4, 3, '#101820'); lz.elipse(cx + 6, cy - 2, 4, 3, '#101820');
        lz.elipse(cx - 6, cy - 2, 3, 2, ojoC); lz.elipse(cx + 6, cy - 2, 3, 2, oscurecer(ojoC, 0.2));
        lz.set(cx - 7, cy - 3, '#ffffff');
        lz.rect(cx - 3, cy + 6, 7, 5, '#2a2f36'); lz.hlin(cx - 3, cy + 8, 7, '#5a626c');
        lz.linea(cx - 4, cy + 8, cx - 11, cy + 12, '#4a505a', 2);
        lz.linea(cx + 4, cy + 8, cx + 11, cy + 12, '#3a3f48', 2);
        break;
      }
      case 'reptil': {                                   // escamas
        for (let y = arriba + 3; y < abajo - 2; y += 3) for (let x = cx - rx + 2; x < cx + rx - 1; x += 3) {
          if (Math.abs(x - cx) < 7 && Math.abs(y - cy) < 5) continue;
          lz.sobre(x + (y % 6 === 0 ? 1 : 0), y, P.som1);
        }
        lz.linea(cx - 3, arriba + 3, cx - 1, arriba + 1, P.som2, 1);
        break;
      }
      case 'ithoriano': {                                // cabeza de martillo
        lz.elipse(cx, cy - 6, rx + 5, 5, P.base);
        lz.elipse(cx, cy - 7, rx + 4, 3, P.luz1);
        lz.elipse(cx - rx - 2, cy - 5, 3, 3, P.som1); lz.elipse(cx + rx + 2, cy - 5, 3, 3, P.som2);
        lz.elipse(cx - rx - 2, cy - 5, 2, 2, ojoC); lz.elipse(cx + rx + 2, cy - 5, 2, 2, ojoC);
        lz.rect(cx - 4, cy + 4, 9, 10, P.som1);          // el cuello curvo
        break;
      }
      case 'gungan': {                                   // ojos con tallo y haillu
        lz.linea(cx - 6, arriba + 3, cx - 8, arriba - 4, P.som1, 3);
        lz.linea(cx + 6, arriba + 3, cx + 8, arriba - 4, P.som2, 3);
        lz.elipse(cx - 8, arriba - 6, 3, 3, '#efeadf'); lz.elipse(cx + 8, arriba - 6, 3, 3, '#e0dbd0');
        lz.elipse(cx - 8, arriba - 6, 1.6, 1.6, ojoC); lz.elipse(cx + 8, arriba - 6, 1.6, 1.6, ojoC);
        for (let i = 0; i < 16; i++) {
          lz.rect(cx - rx - 2, cy + 2 + i, 4, 1, i % 5 < 3 ? P.som1 : P.som2);
          lz.rect(cx + rx - 1, cy + 2 + i, 4, 1, i % 5 < 3 ? P.som2 : P.som1);
        }
        break;
      }
      case 'chagriano': {                                // dos lethorns y cuernos
        lz.linea(cx - 6, arriba + 2, cx - 8, arriba - 6, P.som1, 2);
        lz.linea(cx + 6, arriba + 2, cx + 8, arriba - 6, P.som2, 2);
        for (let i = 0; i < 14; i++) {
          lz.rect(cx - rx - 1, cy + 4 + i, 5, 1, P.som1);
          lz.rect(cx + rx - 3, cy + 4 + i, 5, 1, P.som2);
        }
        break;
      }
      case 'cerean': case 'muun': case 'kaminoano': {    // cráneo alargado
        lz.mediaElipse(cx, arriba + 8, rx - 1, 12, P.luz1, 'arriba');
        lz.mediaElipse(cx, arriba + 7, rx - 4, 10, P.luz2, 'arriba');
        if (fam === 'kaminoano') { lz.rect(cx - 3, abajo - 3, 7, 10, P.som1); lz.rect(cx - 3, abajo - 3, 3, 10, P.base); }
        break;
      }
      case 'insecto': {                                  // mandíbulas y crestas
        lz.linea(cx - 4, bocaY, cx - 6, bocaY + 5, P.som2, 2);
        lz.linea(cx + 4, bocaY, cx + 6, bocaY + 5, P.som2, 2);
        lz.linea(cx, arriba, cx + 4, arriba - 5, P.som1, 2);
        break;
      }
      case 'cresta': {                                   // cresta de espinas falleen
        const h = oscurecer(pielBase, 0.4);
        for (let i = 0; i < 7; i++) lz.linea(cx - 9 + i * 3, arriba + 3 - i * 0.4, cx - 9 + i * 3, arriba - 3 - (3 - Math.abs(i - 3)), h, 2);
        break;
      }
      case 'vendado': {                                  // tusken: vendas, lentes y filtro
        const t = rampa('#a8926e');
        lz.elipse(cx, cy, rx + 1, ry + 1, t.base);
        for (let y = arriba - 1; y < abajo + 2; y += 3) lz.hlin(cx - rx - 1, y, rx * 2 + 3, t.som1);
        for (let y = arriba; y < abajo + 2; y += 6) lz.hlin(cx - rx - 1, y, rx * 2 + 3, t.som2);
        lz.rect(cx - 10, cy - 4, 20, 7, '#2a2018');
        lz.elipse(cx - 6, cy - 1, 3.4, 3, '#0d1016'); lz.elipse(cx + 6, cy - 1, 3.4, 3, '#0d1016');
        lz.elipse(cx - 6, cy - 1, 2, 1.6, mezcla('#0d1016', ojoC, 0.5));
        lz.elipse(cx + 6, cy - 1, 2, 1.6, mezcla('#0d1016', ojoC, 0.35));
        lz.set(cx - 7, cy - 2, '#ffffff');
        lz.rect(cx - 4, cy + 6, 9, 6, '#3a3028');        // filtro de la boca
        for (let i = 0; i < 4; i++) lz.hlin(cx - 4, cy + 7 + i, 9, i % 2 ? '#5a4c3c' : '#241c14');
        lz.rect(cx - 8, cy + 7, 4, 3, '#4a3f30'); lz.rect(cx + 5, cy + 7, 4, 3, '#33291f');
        break;
      }
      case 'encapuchado': {                              // jawa: solo dos brasas
        const c = rampa('#43301f');
        lz.elipse(cx, cy, rx + 2, ry + 2, c.base);
        lz.mediaElipse(cx, cy - 2, rx + 2, ry + 2, c.luz1, 'arriba');
        lz.elipse(cx, cy + 2, rx - 3, ry - 4, '#0a0a0e');
        lz.elipse(cx - 5, cy + 1, 2.4, 1.8, '#ffb03a'); lz.elipse(cx + 5, cy + 1, 2.4, 1.8, '#ffb03a');
        lz.elipse(cx - 5, cy + 1, 1.2, 1, '#fff0c0'); lz.elipse(cx + 5, cy + 1, 1.2, 1, '#fff0c0');
        lz.linea(cx - rx - 2, cy + 4, cx - rx - 4, abajo + 6, c.som1, 3);
        lz.linea(cx + rx + 2, cy + 4, cx + rx + 4, abajo + 6, c.som2, 3);
        break;
      }
      case 'miraluka': {                                 // banda de tela sobre los ojos
        lz.rect(cx - rx, cy - 4, rx * 2, 7, '#5a4a6a');
        lz.hlin(cx - rx, cy - 4, rx * 2, '#7a6a8a'); lz.hlin(cx - rx, cy + 2, rx * 2, '#3a2f4a');
        lz.linea(cx - rx, cy + 1, cx - rx - 3, cy + 6, '#5a4a6a', 2);
        break;
      }
      case 'droide': {                                   // placa frontal y fotorreceptores
        const m = rampa(pielBase);
        lz.elipse(cx, cy, rx, ry, m.base);
        lz.mediaElipse(cx, cy - 1, rx - 1, ry - 2, m.luz1, 'arriba');
        lz.rect(cx - rx + 2, cy - 5, rx * 2 - 4, 8, m.som1);
        lz.elipse(cx - 6, cy - 1, 3, 2.4, '#101820'); lz.elipse(cx + 6, cy - 1, 3, 2.4, '#101820');
        lz.elipse(cx - 6, cy - 1, 2, 1.5, ojoC); lz.elipse(cx + 6, cy - 1, 2, 1.5, ojoC);
        lz.set(cx - 6, cy - 1, clarear(ojoC, 0.75)); lz.set(cx + 6, cy - 1, clarear(ojoC, 0.75));
        lz.hlin(cx - rx + 3, cy + 5, rx * 2 - 6, m.linea);
        for (let i = 0; i < 3; i++) lz.rect(cx - 8 + i * 7, arriba + 3, 3, 2, m.som2);
        break;
      }
      case 'sombra': {                                   // defel: casi una silueta
        for (let y = arriba - 1; y <= abajo + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) {
          if (lz.get(x, y)) lz.set(x, y, oscurecer(pielBase, 0.35));
        }
        lz.elipse(cx - 6, cy - 1, 2, 1.4, ojoC); lz.elipse(cx + 6, cy - 1, 2, 1.4, ojoC);
        break;
      }
      case 'weequay': case 'nikto': case 'noghri': {     // piel curtida con arrugas
        for (let i = 0; i < 5; i++) {
          lz.linea(cx - rx + 3, cy - 6 + i * 4, cx - 6, cy - 5 + i * 4, P.som2, 1);
          lz.linea(cx + rx - 3, cy - 6 + i * 4, cx + 6, cy - 5 + i * 4, P.som2, 1);
        }
        if (fam === 'nikto') for (let i = -2; i <= 2; i++) lz.set(cx + i * 3, arriba + 3, P.linea);
        break;
      }
      case 'neimoidiano': {                              // ojos rojos y tocado alto
        lz.elipse(cx - 6, cy - 1, 2, 1.4, '#c02a2a'); lz.elipse(cx + 6, cy - 1, 2, 1.4, '#c02a2a');
        lz.mediaElipse(cx, arriba + 2, rx - 1, 8, '#3a3050', 'arriba');
        lz.mediaElipse(cx, arriba + 1, rx - 4, 6, '#4a4066', 'arriba');
        break;
      }
      case 'hutt': {                                     // papada y boca ancha
        lz.mediaElipse(cx, abajo + 1, rx + 2, 6, P.som1, 'abajo');
        lz.hlin(cx - 9, bocaY + 1, 19, P.linea);
        lz.hlin(cx - 8, bocaY + 2, 17, P.som2);
        break;
      }
      case 'selkath': {                                  // aletas laterales
        lz.linea(cx - rx, cy + 2, cx - rx - 6, cy + 8, P.som1, 3);
        lz.linea(cx + rx, cy + 2, cx + rx + 6, cy + 8, P.som2, 3);
        break;
      }
      case 'sith': {                                     // tentáculos faciales de kissai
        lz.linea(cx - 5, bocaY, cx - 7, bocaY + 7, P.som1, 2);
        lz.linea(cx + 5, bocaY, cx + 7, bocaY + 7, P.som2, 2);
        break;
      }
    }

    /* ---------- 8. pelo ---------- */
    const conPelo = ['humano', 'palido', 'sith', 'chiss', 'zabrak', 'cuernudo', 'cerean',
                     'miraluka', 'muun', 'cresta', 'ryn', 'noghri'];
    if (peloC && conPelo.indexOf(fam) >= 0) {
      const H = rampa(peloC);
      // casquete: sigue la curva del cráneo
      lz.mediaElipse(cx, arriba + 7, rx + 1, 9, H.base, 'arriba');
      lz.mediaElipse(cx, arriba + 6, rx - 1, 8, H.luz1, 'arriba');
      lz.mediaElipse(cx - 4, arriba + 5, rx - 6, 6, H.luz2, 'arriba');
      // flequillo y patillas, distintos según la forma de cabeza
      if (forma === 0 || forma === 2) {
        lz.linea(cx - rx, arriba + 8, cx - rx + 3, cy + 2, H.som1, 3);
        lz.linea(cx + rx, arriba + 8, cx + rx - 3, cy + 2, H.som2, 3);
        for (let i = -3; i <= 3; i++) lz.vlin(cx + i * 3, arriba + 3, 4 + (i % 2 ? 2 : 0), H.som1);
      } else if (forma === 1) {                          // recogido
        lz.elipse(cx + rx - 2, arriba + 4, 4, 4, H.som1);
        lz.elipse(cx + rx - 2, arriba + 3, 2.5, 2.5, H.base);
      } else {                                           // hacia atrás
        for (let i = -4; i <= 4; i++) lz.linea(cx + i * 3, arriba + 2, cx + i * 3 + (i > 0 ? 3 : -3), arriba + 8, H.som1, 1);
      }
      lz.hlin(cx - rx + 2, arriba + 1, rx * 2 - 4, H.linea);
    }

    /* ---------- 9. marcas ---------- */
    if (marca === 'tatuajes rituales') {
      const t = oscurecer(pielBase, 0.72);
      for (let i = -2; i <= 2; i++) for (let y = cy - 8; y < cy + 12; y++) lz.sobre(cx + i * 5, y, t);
      for (let x = cx - 10; x <= cx + 10; x++) lz.sobre(x, cy + 8, t);
      for (let y = cy - 8; y < cy + 12; y += 4) { lz.sobre(cx - 12, y, t); lz.sobre(cx + 12, y, t); }
    } else if (marca === 'cicatriz vertical') {
      for (let y = cy - 9; y <= cy + 8; y++) { lz.sobre(cx - 7, y, '#c8705a'); lz.sobre(cx - 6, y, mezcla(pielBase, '#ffffff', 0.4)); }
      for (let y = cy - 7; y < cy + 7; y += 3) lz.sobre(cx - 8, y, '#a85a48');
    } else if (marca === 'pintura de clan') {
      for (let x = cx - 10; x <= cx + 10; x++) {
        const y = cy + 6 + Math.round(Math.abs(x - cx) * 0.3);
        lz.sobre(x, y, '#c8323f'); lz.sobre(x, y - 1, '#e85060');
      }
      for (let i = 0; i < 4; i++) { lz.sobre(cx - 9 + i, cy - 8, '#c8323f'); lz.sobre(cx + 6 + i, cy - 8, '#c8323f'); }
    } else if (marca === 'implantes cromados') {
      const m = rampa('#b6c2d0');
      for (let y = cy - 7; y <= cy + 1; y++) for (let x = cx + 3; x <= cx + 12; x++) {
        lz.sobre(x, y, y === cy - 7 ? m.luz2 : (y === cy + 1 ? m.som2 : m.base));
      }
      for (let y = cy - 5; y <= cy - 3; y++) for (let x = cx + 5; x <= cx + 8; x++) lz.sobre(x, y, oscurecer(ojoC, 0.1));
      lz.sobre(cx + 6, cy - 4, clarear(ojoC, 0.7));
      for (let i = 0; i < 3; i++) for (let y = cy - 6; y < cy + 1; y++) lz.sobre(cx + 10 + i, y, m.som1);
    } else if (marca === 'escamas iridiscentes') {
      for (let y = cy - 6; y < cy + 10; y += 3) for (let x = cx - rx + 2; x < cx + rx - 1; x += 3) {
        if (Math.abs(x - cx) < 6 && Math.abs(y - cy) < 4) continue;
        lz.sobre(x + (y % 6 === 0 ? 1 : 0), y, mezcla(pielBase, '#7fd8ff', 0.55));
      }
    } else if (marca === 'runas luminiscentes') {
      const g = '#7fffd0';
      [[-8,8],[-7,8],[-6,8],[-2,9],[-1,9],[0,9],[1,9],[2,9],[6,8],[7,8],[8,8],
       [-7,6],[-7,7],[7,6],[7,7],[0,7],[0,11]].forEach(function (d) { lz.sobre(cx + d[0], cy + d[1], g); });
    } else if (marca === 'quemadura de bláster') {
      for (let y = cy + 1; y <= cy + 7; y++) for (let x = cx + 3; x <= cx + 11; x++) {
        const dx = (x - cx - 7) / 4, dy = (y - cy - 4) / 3.4;
        if (dx * dx + dy * dy > 1) continue;
        lz.sobre(x, y, (dx * dx + dy * dy < 0.36) ? mezcla(pielBase, '#2a1410', 0.85)
                                                  : mezcla(pielBase, '#40201c', 0.72));
      }
      lz.sobre(cx + 6, cy + 3, '#6a3028');
    }

    /* ---------- 10. tocado ---------- */
    if (tocado === 'casco de beskar') {
      const m = rampa('#c2c8d2');
      lz.mediaElipse(cx, cy - 1, rx + 2, ry + 2, m.base, 'arriba');
      lz.rect(cx - rx - 2, cy - 1, (rx + 2) * 2, ry - 1, m.base);
      lz.mediaElipse(cx - 4, cy - 3, rx - 3, ry - 3, m.luz2, 'arriba');
      lz.mediaElipse(cx + 6, cy - 1, rx - 6, ry - 4, m.som1, 'arriba');
      // visera en T
      lz.rect(cx - 9, cy - 4, 19, 5, '#12161c');
      lz.rect(cx - 3, cy - 4, 7, 12, '#12161c');
      lz.hlin(cx - 9, cy - 5, 19, m.som2); lz.hlin(cx - 8, cy - 4, 17, '#2a3a4a');
      lz.set(cx - 8, cy - 3, mezcla('#12161c', ojoC, 0.5));
      lz.hlin(cx - rx - 2, cy + ry - 2, (rx + 2) * 2, m.som2);
      lz.linea(cx, arriba - 1, cx, cy - 5, m.luz2, 1);
    } else if (tocado === 'capucha de peregrino') {
      const h = rampa('#5a4a38');
      lz.mediaElipse(cx, cy - 1, rx + 4, ry + 4, h.base, 'arriba');
      lz.mediaElipse(cx - 3, cy - 3, rx + 1, ry + 1, h.luz1, 'arriba');
      lz.elipse(cx, cy + 1, rx - 1, ry - 2, null);       // hueco de la cara: se repinta debajo
      // sombra proyectada de la capucha sobre la frente
      for (let x = cx - rx + 1; x < cx + rx; x++) for (let y = arriba + 2; y < arriba + 9; y++) lz.sobre(x, y, P.som2);
      lz.linea(cx - rx - 3, cy + 2, cx - rx - 6, abajo + 8, h.som1, 4);
      lz.linea(cx + rx + 3, cy + 2, cx + rx + 6, abajo + 8, h.som2, 4);
    } else if (tocado === 'gafas de soldador') {
      lz.rect(cx - 12, cy - 5, 25, 8, '#2a3038');
      lz.hlin(cx - 12, cy - 6, 25, '#4a545e');
      lz.elipse(cx - 6, cy - 1, 4, 3, '#0d1016'); lz.elipse(cx + 6, cy - 1, 4, 3, '#0d1016');
      lz.elipse(cx - 6, cy - 1, 3, 2, mezcla('#0d1016', '#c8a050', 0.55));
      lz.elipse(cx + 6, cy - 1, 3, 2, mezcla('#0d1016', '#c8a050', 0.35));
      lz.set(cx - 7, cy - 2, '#fff0c0');
      lz.rect(cx - 13, cy - 3, 2, 4, '#c8a050'); lz.rect(cx + 12, cy - 3, 2, 4, '#8a6a30');
    } else if (tocado === 'diadema de senador') {
      const o = rampa('#d8b84a');
      lz.mediaElipse(cx, arriba + 5, rx - 1, 4, o.base, 'arriba');
      lz.mediaElipse(cx, arriba + 4, rx - 3, 3, o.luz2, 'arriba');
      lz.set(cx, arriba + 2, '#ffffff'); lz.elipse(cx, arriba + 4, 2, 2, ojoC);
    } else if (tocado === 'respirador') {
      const m = rampa('#464e58');
      lz.elipse(cx, bocaY + 2, 8, 6, m.base);
      lz.elipse(cx, bocaY + 1, 6, 4, m.luz1);
      for (let i = 0; i < 4; i++) lz.hlin(cx - 4, bocaY + i, 9, i % 2 ? m.som1 : m.som2);
      lz.linea(cx - 8, bocaY + 2, cx - rx - 3, cy + 1, m.som1, 3);
      lz.linea(cx + 8, bocaY + 2, cx + rx + 3, cy + 1, m.som2, 3);
    } else if (tocado === 'trenza de padawan') {
      const h = rampa(peloC || '#8a6a3a');
      for (let i = 0; i < 24; i++) {
        lz.rect(cx + rx - 1 + Math.round(Math.sin(i / 4) * 1.5), cy + 2 + i, 2, 1,
                i % 4 < 2 ? h.base : h.som1);
      }
      lz.rect(cx + rx - 1, cy + 26, 2, 2, '#c8a050');
    } else if (tocado === 'corona de clan') {
      const o = rampa('#c8a050');
      for (let i = -3; i <= 3; i++) {
        const alt = 5 - Math.abs(i);
        lz.linea(cx + i * 4, arriba + 5, cx + i * 4, arriba + 1 - alt, o.base, 2);
        lz.set(cx + i * 4, arriba - alt, o.luz2);
      }
      lz.hlin(cx - 13, arriba + 5, 27, o.som1); lz.hlin(cx - 13, arriba + 4, 27, o.base);
    } else if (tocado === 'visor cibernético') {
      lz.rect(cx - rx - 1, cy - 5, rx * 2 + 2, 8, '#101820');
      lz.hlin(cx - rx - 1, cy - 6, rx * 2 + 2, '#2a3a4a');
      lz.hlin(cx - rx + 1, cy - 3, 12, ojoC);
      lz.hlin(cx - rx + 1, cy - 2, 8, clarear(ojoC, 0.5));
      for (let i = 0; i < 4; i++) lz.set(cx + 4 + i * 3, cy - 1, oscurecer(ojoC, 0.35));
      lz.rect(cx + rx - 2, cy - 5, 3, 8, '#3a444e');
    }

    /* ---------- 11. contorno y fondo ---------- */
    lz.contorno('#0a0d12');

    return lz;
  }

  /* ══════════════ pintar ══════════════ */
  function aCanvas(lz, escala) {
    const c = global.document.createElement('canvas');
    c.width = N * escala; c.height = N * escala;
    const g = c.getContext('2d');

    // fondo de holograma con líneas de barrido
    const grad = g.createRadialGradient(c.width / 2, c.height * 0.42, 4,
                                        c.width / 2, c.height / 2, c.width * 0.72);
    grad.addColorStop(0, '#0e2634'); grad.addColorStop(1, '#04080d');
    g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height);

    g.imageSmoothingEnabled = false;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const col = lz.p[y * N + x];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x * escala, y * escala, escala, escala);
    }

    // barrido holográfico por encima
    g.globalAlpha = 0.10; g.fillStyle = '#3ad6ff';
    for (let y = 0; y < c.height; y += Math.max(2, escala * 2)) g.fillRect(0, y, c.width, Math.max(1, escala / 2));
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(58,214,255,.35)'; g.lineWidth = Math.max(1, escala);
    g.strokeRect(0, 0, c.width, c.height);
    return c;
  }

  /** devuelve un <img> con el retrato dentro, listo para innerHTML */
  SW.retratoPixel = function (ap, tam, especie) {
    const t = tam || 160;
    const escala = Math.max(2, Math.round(t / N));
    const lz = dibujar(ap || {}, especie || (ap && ap.especie) || 'humano');
    const c = aCanvas(lz, escala);
    return '<img class="retrato" width="' + t + '" height="' + t + '" alt="" ' +
           'style="image-rendering:pixelated;image-rendering:crisp-edges;display:block" src="' +
           c.toDataURL('image/png') + '">';
  };

  /** por si alguien quiere el canvas crudo (vitrina, exportar) */
  SW.retratoCanvas = function (ap, escala, especie) {
    return aCanvas(dibujar(ap || {}, especie || 'humano'), escala || 4);
  };

  SW.RETRATO_LADO = N;

})(typeof window !== 'undefined' ? window : globalThis);

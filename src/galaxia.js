/* ============================================================
   HOLOVIDA :: la galaxia
   Mapa navegable con la estructura real de la galaxia (anillos
   del Núcleo Profundo al Borde Exterior, el Espacio Hutt en su
   sector y las Regiones Desconocidas al oeste), planetas
   dibujados por código y una vista de pixel art del mundo en
   el que estás.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ---------- anillos: radio normalizado y sector angular ---------- */
  const REGIONES = {
    'Núcleo Profundo':      { r: 0.07, a: null, n: 'Núcleo Profundo' },
    'Núcleo':               { r: 0.16, a: null, n: 'Mundos del Núcleo' },
    'Núcleo Interior':      { r: 0.24, a: null, n: 'Núcleo Interior' },
    'Colonias':             { r: 0.32, a: null, n: 'Las Colonias' },
    'Borde Interior':       { r: 0.42, a: null, n: 'Borde Interior' },
    'Borde Medio':          { r: 0.60, a: null, n: 'Borde Medio' },
    'Borde Exterior':       { r: 0.82, a: null, n: 'Borde Exterior' },
    'Espacio Hutt':         { r: 0.70, a: [3.5, 4.6], n: 'Espacio Hutt' },
    'Regiones Desconocidas':{ r: 0.95, a: [2.3, 3.9], n: 'Regiones Desconocidas' },
    '¿?':                   { r: 1.10, a: [1.0, 1.6], n: 'Fuera de las cartas' }
  };

  /* hash determinista para colocar cada mundo siempre en el mismo sitio */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }

  /** Posición de un mundo en coordenadas normalizadas (-1..1) */
  SW.posicionMundo = function (nombre) {
    const m = SW.mundo(nombre);
    const reg = REGIONES[m.r] || REGIONES['Borde Medio'];
    const h1 = hash(nombre), h2 = hash(nombre + '·θ');
    let ang;
    if (reg.a) ang = reg.a[0] + h2 * (reg.a[1] - reg.a[0]);
    else ang = h2 * Math.PI * 2;
    // los brazos espirales tuercen ligeramente el ángulo según el radio
    const radio = reg.r + (h1 - 0.5) * 0.09;
    ang += radio * 1.15;
    return { x: Math.cos(ang) * radio, y: Math.sin(ang) * radio * 0.62, r: radio, reg: m.r };
  };

  /** Distancia en "saltos" entre dos mundos */
  SW.saltosEntre = function (a, b) {
    if (a === b) return 0;
    const pa = SW.posicionMundo(a), pb = SW.posicionMundo(b);
    const d = Math.hypot(pa.x - pb.x, (pa.y - pb.y) / 0.62);
    return Math.max(1, Math.round(d * 9));
  };

  /** Coste del pasaje según distancia real y riqueza del destino */
  /** `nave` puede ser el estado del jugador: aplica el descuento de sus mejoras */
  SW.costeViaje = function (origen, destino, tieneNave, estado) {
    const saltos = SW.saltosEntre(origen, destino);
    const m = SW.mundo(destino);
    let base = (tieneNave ? 320 : 900) * saltos + m.riq * 180;
    if (estado && SW.descuentoSalto) base *= (1 - SW.descuentoSalto(estado));
    return Math.round(base);
  };

  /* ============================================================
     PALETA DE CADA MUNDO
     ============================================================ */
  const BIOMAS = [
    { re: /ciudad|urban|subciudad|industrial|fábrica|desguace|astillero|colgant/i, id: 'ciudad',
      base: ['#3a4250', '#4a5260', '#2a3038'], detalle: '#ffd28a', atm: '#8a9ad8', luces: true },
    { re: /desierto|árido|arena|dunas|\bsal\b|chatarra/i, id: 'desierto',
      base: ['#c89a52', '#e0b878', '#a87a3a'], detalle: '#8a5a28', atm: '#ffd6a0' },
    { re: /hielo|glaciar|tundra|helad|nieve/i, id: 'hielo',
      base: ['#cfe8f5', '#a8d0e8', '#e8f4ff'], detalle: '#7fb0d0', atm: '#cfe8ff' },
    { re: /océano|oceán|acuát|agua|mar\b|lagos|anfibi/i, id: 'oceano',
      base: ['#1a5a8a', '#2a7ab0', '#0e3a5a'], detalle: '#6ac0e0', atm: '#7fd8ff' },
    { re: /volcán|volcan|lava|basalto|ceniza|obsidiana/i, id: 'volcanico',
      base: ['#3a1a12', '#5a2a18', '#241008'], detalle: '#ff6a2a', atm: '#ff8a4a', brillo: true },
    { re: /jungla|selva|bosque|hongo|árbol|copas/i, id: 'jungla',
      base: ['#1a5a2a', '#2a7a3a', '#0e3a1a'], detalle: '#6aff8a', atm: '#8affa0' },
    { re: /pradera|templad|campo|trigo|llanura|sabana/i, id: 'templado',
      base: ['#3a7a4a', '#5a9a5a', '#2a5a7a'], detalle: '#a8d88a', atm: '#a8e8ff' },
    { re: /pantano|ciénaga|húmed/i, id: 'pantano',
      base: ['#2a3a1a', '#3a4a24', '#1a2810'], detalle: '#7a8a3a', atm: '#8a9a5a' },
    { re: /gas|nube|gigante/i, id: 'gaseoso',
      base: ['#c88a4a', '#e0a868', '#a86a30'], detalle: '#fff0d0', atm: '#ffd6a0', bandas: true },
    { re: /cristal|kyber|roca|montaña|cañón|rocoso|tumbas|ruinas|páramo|penumbra/i, id: 'rocoso',
      base: ['#5a5060', '#6a6070', '#3a3444'], detalle: '#a8a0c0', atm: '#c8b8e0' }
  ];

  SW.biomaDe = function (nombre) {
    const m = SW.mundo(nombre);
    // el tipo de terreno manda; la descripción solo desempata
    for (let i = 0; i < BIOMAS.length; i++) if (BIOMAS[i].re.test(m.bio || '')) return BIOMAS[i];
    for (let i = 0; i < BIOMAS.length; i++) if (BIOMAS[i].re.test(m.vibe || '')) return BIOMAS[i];
    return BIOMAS[BIOMAS.length - 1];
  };

  /* ============================================================
     PLANETA DIBUJADO POR CÓDIGO (para el mapa y la cabecera)
     ============================================================ */
  SW.dibujarPlaneta = function (cx, x, y, radio, nombre, opts) {
    const o = opts || {};
    const b = SW.biomaDe(nombre);
    const h = hash(nombre);
    const rnd = (function (seed) {
      let s = seed;
      return function () { s = (s * 16807 + 1) % 2147483647; return (s % 10000) / 10000; };
    })(Math.floor(h * 2147483) + 1);

    cx.save();

    /* atmósfera */
    if (radio > 6) {
      const halo = cx.createRadialGradient(x, y, radio * 0.9, x, y, radio * 1.5);
      halo.addColorStop(0, b.atm + '88');
      halo.addColorStop(1, b.atm + '00');
      cx.fillStyle = halo;
      cx.beginPath(); cx.arc(x, y, radio * 1.5, 0, 7); cx.fill();
    }

    /* disco base */
    cx.beginPath(); cx.arc(x, y, radio, 0, 7); cx.clip();
    cx.fillStyle = b.base[0];
    cx.fillRect(x - radio, y - radio, radio * 2, radio * 2);

    /* manchas de superficie */
    const manchas = Math.max(4, Math.round(radio / 2));
    for (let i = 0; i < manchas; i++) {
      const a = rnd() * 7, d = rnd() * radio * 0.92;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      const rr = radio * (0.12 + rnd() * 0.34);
      cx.fillStyle = b.base[1 + Math.floor(rnd() * (b.base.length - 1))];
      cx.globalAlpha = 0.55 + rnd() * 0.4;
      cx.beginPath(); cx.ellipse(px, py, rr, rr * (0.5 + rnd() * 0.6), a, 0, 7); cx.fill();
    }
    cx.globalAlpha = 1;

    /* bandas de gigante gaseoso */
    if (b.bandas) {
      for (let i = -radio; i < radio; i += Math.max(2, radio / 7)) {
        cx.fillStyle = rnd() > 0.5 ? b.base[1] : b.base[2];
        cx.globalAlpha = 0.35;
        cx.fillRect(x - radio, y + i, radio * 2, Math.max(1.5, radio / 11));
      }
      cx.globalAlpha = 1;
    }

    /* casquetes polares */
    if (b.id === 'hielo' || b.id === 'templado' || b.id === 'oceano') {
      cx.fillStyle = '#eaf6ff';
      cx.globalAlpha = b.id === 'hielo' ? 0.9 : 0.55;
      cx.beginPath(); cx.ellipse(x, y - radio * 0.95, radio * 0.7, radio * 0.28, 0, 0, 7); cx.fill();
      cx.beginPath(); cx.ellipse(x, y + radio * 0.95, radio * 0.62, radio * 0.24, 0, 0, 7); cx.fill();
      cx.globalAlpha = 1;
    }

    /* venas de lava */
    if (b.brillo) {
      cx.strokeStyle = b.detalle; cx.lineWidth = Math.max(0.8, radio / 12);
      cx.globalAlpha = 0.85;
      for (let i = 0; i < 4; i++) {
        cx.beginPath();
        let px = x - radio + rnd() * radio * 2, py = y - radio + rnd() * radio * 2;
        cx.moveTo(px, py);
        for (let k = 0; k < 4; k++) { px += (rnd() - 0.5) * radio; py += (rnd() - 0.5) * radio; cx.lineTo(px, py); }
        cx.stroke();
      }
      cx.globalAlpha = 1;
    }

    /* luces de ciudad en el lado nocturno */
    if (b.luces && radio > 8) {
      cx.fillStyle = b.detalle;
      for (let i = 0; i < radio * 3; i++) {
        const a = rnd() * 7, d = rnd() * radio * 0.95;
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
        if (px < x - radio * 0.15) continue;          // solo en la mitad en sombra
        cx.globalAlpha = 0.35 + rnd() * 0.6;
        cx.fillRect(px, py, Math.max(1, radio / 22), Math.max(1, radio / 22));
      }
      cx.globalAlpha = 1;
    }

    /* nubes */
    if (radio > 10 && b.id !== 'gaseoso') {
      cx.fillStyle = '#ffffff'; cx.globalAlpha = 0.16;
      for (let i = 0; i < 5; i++) {
        const a = rnd() * 7, d = rnd() * radio * 0.8;
        cx.beginPath();
        cx.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, radio * (0.2 + rnd() * 0.3), radio * 0.1, a, 0, 7);
        cx.fill();
      }
      cx.globalAlpha = 1;
    }

    /* terminador: la sombra de la noche */
    const sombra = cx.createLinearGradient(x - radio, y, x + radio, y);
    sombra.addColorStop(0, 'rgba(255,255,255,0.16)');
    sombra.addColorStop(0.42, 'rgba(0,0,0,0)');
    sombra.addColorStop(1, 'rgba(0,0,0,0.72)');
    cx.fillStyle = sombra;
    cx.fillRect(x - radio, y - radio, radio * 2, radio * 2);

    cx.restore();

    /* anillos para algún gigante */
    if (b.id === 'gaseoso' && radio > 10) {
      cx.save();
      cx.strokeStyle = b.atm + 'aa';
      cx.lineWidth = Math.max(1, radio / 10);
      cx.beginPath(); cx.ellipse(x, y, radio * 1.6, radio * 0.4, -0.35, 0, 7); cx.stroke();
      cx.restore();
    }
  };

  /* ============================================================
     PIXEL ART DEL MUNDO (vista grande al clicar donde estás)
     Cada planeta sale distinto pero coherente con su bioma.
     ============================================================ */
  SW.pixelPlaneta = function (nombre, escala) {
    const N = 36;
    const esc = escala || 8;
    const b = SW.biomaDe(nombre);
    const h = hash(nombre);
    let seed = Math.floor(h * 2147483) + 7;
    const rnd = function () { seed = (seed * 16807 + 11) % 2147483647; return (seed % 10000) / 10000; };

    const cv = document.createElement('canvas');
    cv.width = N * esc; cv.height = N * esc;
    cv.className = 'sprite planeta-px';
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;

    const c = (N - 1) / 2;
    const R = c - 1.2;

    /* rejilla de "altura" con manchas suaves */
    const centros = [];
    for (let i = 0; i < 9; i++) centros.push({ x: rnd() * N, y: rnd() * N, r: 3 + rnd() * 7, t: Math.floor(rnd() * b.base.length) });

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dx = x - c, dy = y - c;
        const d = Math.hypot(dx, dy);
        if (d > R) continue;

        /* color base por la mancha más cercana */
        let mejor = 0, mejorD = 1e9;
        for (let i = 0; i < centros.length; i++) {
          const cc = centros[i];
          const dd = Math.hypot(x - cc.x, y - cc.y) / cc.r;
          if (dd < mejorD) { mejorD = dd; mejor = cc.t; }
        }
        let col = b.base[mejor % b.base.length];

        /* casquetes */
        if ((b.id === 'hielo' || b.id === 'templado' || b.id === 'oceano') && Math.abs(dy) > R * 0.72) col = '#eaf6ff';
        /* bandas del gigante gaseoso */
        if (b.bandas) col = b.base[(Math.floor(y / 3) + mejor) % b.base.length];
        /* venas de lava */
        if (b.brillo && mejorD > 0.85 && mejorD < 1.05) col = b.detalle;
        /* luces de ciudad en el lado oscuro */
        if (b.luces && dx > R * 0.05 && rnd() > 0.86) col = b.detalle;

        /* sombreado esférico: iluminado arriba a la izquierda */
        const luz = (-dx * 0.6 - dy * 0.5) / R;
        const f = Math.max(-0.62, Math.min(0.3, luz * 0.55));
        col = mezcla(col, f > 0 ? '#ffffff' : '#000010', Math.abs(f));

        cx.fillStyle = col;
        cx.fillRect(x * esc, y * esc, esc, esc);
      }
    }

    /* borde de atmósfera */
    cx.strokeStyle = b.atm + '99';
    cx.lineWidth = esc;
    cx.beginPath();
    cx.arc(c * esc + esc / 2, c * esc + esc / 2, (R + 0.6) * esc, 0, 7);
    cx.stroke();

    return cv;
  };

  function mezcla(hex1, hex2, t) {
    const p = function (h) {
      h = h.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const a = p(hex1), b = p(hex2);
    const m = a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); });
    return 'rgb(' + m[0] + ',' + m[1] + ',' + m[2] + ')';
  }
  SW.mezclaColor = mezcla;

  /* ============================================================
     MAPA NAVEGABLE
     ============================================================ */
  SW.Mapa = function (canvas, estado) {
    this.cv = canvas;
    this.cx = canvas.getContext('2d');
    this.s = estado;
    this.zoom = 1;
    this.cam = { x: 0, y: 0 };
    this.sel = null;
    this.hover = null;
    this.arrastrando = false;
    this.mundos = SW.MUNDOS.map(function (m) {
      const p = SW.posicionMundo(m.n);
      return { n: m.n, m: m, x: p.x, y: p.y, reg: m.r };
    });
    /* centrado en donde estás */
    const yo = SW.posicionMundo(estado.mundo);
    this.cam.x = yo.x; this.cam.y = yo.y;
    this.instalar();
  };

  SW.Mapa.prototype.escala = function () {
    return Math.min(this.cv.width, this.cv.height) * 0.46 * this.zoom;
  };
  SW.Mapa.prototype.aPantalla = function (x, y) {
    const e = this.escala();
    return {
      x: this.cv.width / 2 + (x - this.cam.x) * e,
      y: this.cv.height / 2 + (y - this.cam.y) * e
    };
  };
  SW.Mapa.prototype.aMundo = function (px, py) {
    const e = this.escala();
    return { x: (px - this.cv.width / 2) / e + this.cam.x, y: (py - this.cv.height / 2) / e + this.cam.y };
  };

  SW.Mapa.prototype.mundoEn = function (px, py) {
    let mejor = null, mejorD = 22;
    for (let i = 0; i < this.mundos.length; i++) {
      const w = this.mundos[i];
      const p = this.aPantalla(w.x, w.y);
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < mejorD) { mejorD = d; mejor = w; }
    }
    return mejor;
  };

  SW.Mapa.prototype.instalar = function () {
    const self = this;
    const cv = this.cv;
    let ultimo = null;

    const pos = function (ev) {
      const r = cv.getBoundingClientRect();
      const t = ev.touches ? ev.touches[0] : ev;
      return { x: (t.clientX - r.left) * (cv.width / r.width), y: (t.clientY - r.top) * (cv.height / r.height) };
    };

    const abajo = function (ev) {
      self.arrastrando = true; self.movido = false;
      ultimo = pos(ev);
    };
    const mover = function (ev) {
      const p = pos(ev);
      if (self.arrastrando && ultimo) {
        const e = self.escala();
        const dx = (p.x - ultimo.x) / e, dy = (p.y - ultimo.y) / e;
        if (Math.abs(p.x - ultimo.x) > 3 || Math.abs(p.y - ultimo.y) > 3) self.movido = true;
        self.cam.x -= dx; self.cam.y -= dy;
        ultimo = p;
        self.pintar();
        if (ev.cancelable) ev.preventDefault();
      } else {
        const w = self.mundoEn(p.x, p.y);
        if (w !== self.hover) { self.hover = w; cv.style.cursor = w ? 'pointer' : 'grab'; self.pintar(); }
      }
    };
    const arriba = function (ev) {
      if (self.arrastrando && !self.movido) {
        const p = ultimo || pos(ev);
        const w = self.mundoEn(p.x, p.y);
        if (w) { self.sel = w; if (self.onSelect) self.onSelect(w); }
      }
      self.arrastrando = false;
      self.pintar();
    };

    cv.addEventListener('mousedown', abajo);
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', arriba);
    cv.addEventListener('touchstart', function (e) { abajo(e); }, { passive: true });
    cv.addEventListener('touchmove', function (e) { mover(e); }, { passive: false });
    cv.addEventListener('touchend', arriba);
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.zoom = Math.max(0.5, Math.min(6, self.zoom * (e.deltaY < 0 ? 1.15 : 0.87)));
      self.pintar();
    }, { passive: false });
    this._mover = mover; this._arriba = arriba;
  };

  SW.Mapa.prototype.destruir = function () {
    window.removeEventListener('mousemove', this._mover);
    window.removeEventListener('mouseup', this._arriba);
  };

  SW.Mapa.prototype.centrarEn = function (nombre) {
    const p = SW.posicionMundo(nombre);
    this.cam.x = p.x; this.cam.y = p.y;
    this.pintar();
  };

  SW.Mapa.prototype.pintar = function () {
    const cx = this.cx, cv = this.cv;
    const W = cv.width, H = cv.height;
    const e = this.escala();
    const centro = this.aPantalla(0, 0);

    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#03060b';
    cx.fillRect(0, 0, W, H);

    /* halo galáctico y brazos espirales */
    const g = cx.createRadialGradient(centro.x, centro.y, 0, centro.x, centro.y, e * 1.15);
    g.addColorStop(0, 'rgba(180,210,255,.30)');
    g.addColorStop(0.35, 'rgba(90,130,200,.13)');
    g.addColorStop(1, 'rgba(20,40,80,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.ellipse(centro.x, centro.y, e * 1.15, e * 0.72, 0, 0, 7); cx.fill();

    cx.save();
    cx.globalAlpha = 0.5;
    for (let brazo = 0; brazo < 5; brazo++) {
      cx.beginPath();
      for (let t = 0.05; t < 1.12; t += 0.012) {
        const ang = brazo * (Math.PI * 2 / 5) + t * 3.1;
        const p = this.aPantalla(Math.cos(ang) * t, Math.sin(ang) * t * 0.62);
        if (t === 0.05) cx.moveTo(p.x, p.y); else cx.lineTo(p.x, p.y);
      }
      cx.strokeStyle = 'rgba(120,170,240,.16)';
      cx.lineWidth = e * 0.11;
      cx.stroke();
    }
    cx.restore();

    /* polvo de estrellas */
    cx.fillStyle = 'rgba(200,225,255,.5)';
    for (let i = 0; i < 500; i++) {
      const a = (i * 2.399), t = ((i * 37) % 100) / 100 * 1.1;
      const p = this.aPantalla(Math.cos(a + t * 3) * t, Math.sin(a + t * 3) * t * 0.62);
      if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) continue;
      cx.globalAlpha = 0.18 + ((i * 13) % 60) / 140;
      cx.fillRect(p.x, p.y, 1.2, 1.2);
    }
    cx.globalAlpha = 1;

    /* anillos de región con etiqueta */
    const orden = ['Núcleo Profundo', 'Núcleo', 'Borde Interior', 'Borde Medio', 'Borde Exterior'];
    cx.setLineDash([4, 8]);
    orden.forEach(function (id) {
      const reg = REGIONES[id];
      cx.strokeStyle = 'rgba(120,180,230,.16)';
      cx.lineWidth = 1;
      cx.beginPath();
      cx.ellipse(centro.x, centro.y, reg.r * e, reg.r * e * 0.62, 0, 0, 7);
      cx.stroke();
    });
    cx.setLineDash([]);

    if (this.zoom < 2.2) {
      cx.fillStyle = 'rgba(140,190,235,.45)';
      cx.font = '10px monospace';
      cx.textAlign = 'center';
      orden.forEach(function (id) {
        const reg = REGIONES[id];
        cx.fillText(reg.n.toUpperCase(), centro.x, centro.y - reg.r * e * 0.62 - 5);
      });
    }

    /* ruta desde donde estás */
    const yo = this.mundos.filter(function (w) { return w.n === this.s.mundo; }.bind(this))[0];
    if (yo && this.sel && this.sel !== yo) {
      const a = this.aPantalla(yo.x, yo.y), b = this.aPantalla(this.sel.x, this.sel.y);
      cx.setLineDash([5, 5]);
      cx.strokeStyle = 'rgba(255,176,58,.75)';
      cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
      cx.setLineDash([]);
    }

    /* aviso si tu mundo queda fuera de pantalla */
    const yoP = SW.posicionMundo(this.s.mundo);
    const yoS = this.aPantalla(yoP.x, yoP.y);
    if (yoS.x < 0 || yoS.x > W || yoS.y < 0 || yoS.y > H) {
      const bx = Math.max(16, Math.min(W - 16, yoS.x));
      const by = Math.max(16, Math.min(H - 16, yoS.y));
      cx.fillStyle = '#ffb03a';
      cx.beginPath();
      const ang = Math.atan2(yoS.y - by, yoS.x - bx);
      cx.moveTo(bx + Math.cos(ang) * 9, by + Math.sin(ang) * 9);
      cx.lineTo(bx + Math.cos(ang + 2.5) * 9, by + Math.sin(ang + 2.5) * 9);
      cx.lineTo(bx + Math.cos(ang - 2.5) * 9, by + Math.sin(ang - 2.5) * 9);
      cx.fill();
      cx.font = '10px monospace'; cx.textAlign = 'center';
      cx.fillText(this.s.mundo, bx, by - 13);
    }

    /* planetas */
    const visitados = this.s.mundosVistos || [];
    for (let i = 0; i < this.mundos.length; i++) {
      const w = this.mundos[i];
      const p = this.aPantalla(w.x, w.y);
      if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) continue;

      const esYo = w.n === this.s.mundo;
      const visto = visitados.indexOf(w.n) >= 0;
      const importante = w.m.riq >= 7 || esYo;
      let radio = 2.6 + w.m.riq * 0.28;
      if (this.zoom > 1.6) radio *= 1.5;
      if (this.zoom > 3) radio *= 1.4;

      if (this.zoom > 2.4 || esYo) {
        SW.dibujarPlaneta(cx, p.x, p.y, Math.max(5, radio * 2.2), w.n);
      } else {
        cx.fillStyle = visto ? '#cfe8f5' : 'rgba(150,190,220,.6)';
        cx.beginPath(); cx.arc(p.x, p.y, radio, 0, 7); cx.fill();
      }

      if (esYo) {
        const t = (Date.now() % 2000) / 2000;
        cx.strokeStyle = 'rgba(255,176,58,' + (0.9 - t * 0.6) + ')';
        cx.lineWidth = 2;
        cx.beginPath(); cx.arc(p.x, p.y, radio * 2.4 + t * 16, 0, 7); cx.stroke();
        cx.strokeStyle = '#ffb03a'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.arc(p.x, p.y, radio * 2.4, 0, 7); cx.stroke();
      }
      if (this.sel === w) {
        cx.strokeStyle = '#fff'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.arc(p.x, p.y, radio * 2.9, 0, 7); cx.stroke();
      }

      const etiquetar = esYo || this.sel === w || this.hover === w || this.zoom > 2 || (importante && this.zoom > 1.2);
      if (etiquetar) {
        cx.font = (esYo ? 'bold ' : '') + '11px monospace';
        cx.textAlign = 'center';
        cx.fillStyle = esYo ? '#ffb03a' : (visto ? '#cfe8f5' : 'rgba(190,215,235,.75)');
        cx.fillText(w.n, p.x, p.y - radio * 2.6 - 5);
      }
    }
  };

  SW.Mapa.prototype.animar = function () {
    const self = this;
    if (this._raf) cancelAnimationFrame(this._raf);
    const paso = function () {
      self.pintar();
      self._raf = requestAnimationFrame(paso);
    };
    paso();
  };
  SW.Mapa.prototype.parar = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.destruir();
  };

})(window);

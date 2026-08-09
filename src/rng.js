/* ============================================================
   HOLOVIDA :: núcleo aleatorio determinista
   Todo el juego usa una única semilla -> vidas reproducibles.
   ============================================================ */
(function (global) {
  'use strict';

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function RNG(seed) {
    this.seedStr = String(seed == null ? Date.now() + ':' + Math.random() : seed);
    const s = xmur3(this.seedStr);
    this._n = mulberry32(s());
    this.calls = 0;
  }

  RNG.prototype.next = function () {
    this.calls++;
    return this._n();
  };
  /** float en [a,b) */
  RNG.prototype.range = function (a, b) {
    return a + this.next() * (b - a);
  };
  /** entero en [a,b] inclusive */
  RNG.prototype.int = function (a, b) {
    return Math.floor(this.range(a, b + 1));
  };
  /** true con probabilidad p */
  RNG.prototype.chance = function (p) {
    return this.next() < p;
  };
  RNG.prototype.pick = function (arr) {
    if (!arr || !arr.length) return undefined;
    return arr[Math.floor(this.next() * arr.length)];
  };
  RNG.prototype.pickN = function (arr, n) {
    const copy = arr.slice();
    const out = [];
    while (out.length < n && copy.length) {
      out.push(copy.splice(Math.floor(this.next() * copy.length), 1)[0]);
    }
    return out;
  };
  RNG.prototype.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  };
  /** elección ponderada: items con .w (peso), por defecto 1 */
  RNG.prototype.weighted = function (items, wf) {
    const f = wf || function (o) { return o.w == null ? 1 : o.w; };
    let total = 0;
    for (let i = 0; i < items.length; i++) total += Math.max(0, f(items[i]));
    if (total <= 0) return this.pick(items);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, f(items[i]));
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };
  /** campana: valor central con dispersión, recortado */
  RNG.prototype.bell = function (min, max, rolls) {
    const n = rolls || 3;
    let s = 0;
    for (let i = 0; i < n; i++) s += this.next();
    return Math.round(min + (s / n) * (max - min));
  };

  // --- utilidades generales -------------------------------------------------
  const U = {
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    /** formatea créditos: 1234567 -> 1.234.567 */
    cr: function (n) {
      const neg = n < 0;
      const s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return (neg ? '−' : '') + s + ' cr';
    },
    num: function (n) {
      return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    esc: function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    /** rellena {slots} en una plantilla */
    fill: function (tpl, slots) {
      const s = String(tpl).replace(/\{(\w+)\}/g, function (m, k) {
        if (!slots) return m;
        if (slots[k] != null) return slots[k];
        // {C} = el hueco {c} con mayúscula, para abrir frase
        const baja = k.charAt(0).toLowerCase() + k.slice(1);
        if (k !== baja && slots[baja] != null) {
          const v = String(slots[baja]);
          return v.charAt(0).toUpperCase() + v.slice(1);
        }
        return m;
      });
      /* Las contracciones. Al meter «el bar» en una plantilla que dice
         «de {l}» salía «de el bar»; ahora sale «del bar». Se hace aquí
         una vez y no en trescientas plantillas. */
      return s
        .replace(/\bde el\b/g, 'del')
        .replace(/\bDe el\b/g, 'Del')
        .replace(/\ba el\b(?! que)/g, 'al')
        .replace(/\bA el\b(?! que)/g, 'Al');
    },
    titleCase: function (s) {
      return String(s).charAt(0).toUpperCase() + String(s).slice(1);
    }
  };

  // --- compresión LZW -> base64url (para enlaces de resumen) ----------------
  function lzwEncode(str) {
    const dict = new Map();
    const data = String(str);
    let out = [];
    let phrase = data[0];
    let code = 256;
    for (let i = 1; i < data.length; i++) {
      const c = data[i];
      if (dict.has(phrase + c)) {
        phrase += c;
      } else {
        out.push(phrase.length > 1 ? dict.get(phrase) : phrase.charCodeAt(0));
        dict.set(phrase + c, code++);
        phrase = c;
      }
    }
    if (phrase !== '') out.push(phrase.length > 1 ? dict.get(phrase) : phrase.charCodeAt(0));
    return out;
  }

  function lzwDecode(codes) {
    const dict = {};
    let currChar = String.fromCharCode(codes[0]);
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    for (let i = 1; i < codes.length; i++) {
      const currCode = codes[i];
      if (currCode < 256) phrase = String.fromCharCode(currCode);
      else phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code++] = oldPhrase + currChar;
      oldPhrase = phrase;
    }
    return out.join('');
  }

  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  /* Cada código se guardaba en 20 bits fijos «por si acaso», pero un
     resumen de vida no pasa de unos miles de entradas de diccionario:
     se desperdiciaba casi la mitad del enlace. Ahora se usa el ancho
     mínimo que hace falta y se apunta al principio, detrás de una `~`
     que no existe en el alfabeto (así los enlaces antiguos, sin marca,
     se siguen leyendo a 20 bits como siempre). */
  const ANCHO = '~';

  function packCodes(codes) {
    let maxc = 1;
    for (let i = 0; i < codes.length; i++) if (codes[i] > maxc) maxc = codes[i];
    let w = 8;
    while ((1 << w) <= maxc && w < 24) w++;
    let bits = '';
    for (let i = 0; i < codes.length; i++) bits += codes[i].toString(2).padStart(w, '0');
    while (bits.length % 6) bits += '0';
    let out = '';
    for (let i = 0; i < bits.length; i += 6) out += B64[parseInt(bits.substr(i, 6), 2)];
    return ANCHO + B64[w] + out;
  }

  function unpackCodes(s) {
    let w = 20, cuerpo = s;
    if (s[0] === ANCHO) { w = B64.indexOf(s[1]); cuerpo = s.slice(2); if (w < 4) return []; }
    let bits = '';
    for (let i = 0; i < cuerpo.length; i++) {
      const v = B64.indexOf(cuerpo[i]);
      if (v < 0) continue;
      bits += v.toString(2).padStart(6, '0');
    }
    const codes = [];
    for (let i = 0; i + w <= bits.length; i += w) codes.push(parseInt(bits.substr(i, w), 2));
    return codes;
  }

  /* El LZW de aquí trabaja por carácter y reserva los códigos ≥256 para
     el diccionario, así que sólo puede tragar texto por debajo de 256.
     Antes se resolvía con encodeURIComponent, que convierte cada tilde
     en tres caracteres (`é` → `%C3%A9`): en un texto en español eso
     hinchaba el enlace una barbaridad. Ahora sólo se escapa lo que de
     verdad se sale de rango, y las tildes viajan tal cual. */
  const MARCA = '\u0002';

  function aSeguro(json) {
    let out = MARCA;
    for (let i = 0; i < json.length; i++) {
      const c = json[i], n = json.charCodeAt(i);
      if (c === '\\') out += '\\\\';
      else if (n < 256) out += c;
      else out += '\\u' + n.toString(16).padStart(4, '0');
    }
    return out;
  }

  function deSeguro(safe) {
    let out = '';
    for (let i = 0; i < safe.length; i++) {
      if (safe[i] !== '\\') { out += safe[i]; continue; }
      if (safe[i + 1] === '\\') { out += '\\'; i++; continue; }
      if (safe[i + 1] === 'u') { out += String.fromCharCode(parseInt(safe.substr(i + 2, 4), 16)); i += 5; continue; }
      out += safe[i];
    }
    return out;
  }

  U.pack = function (obj) {
    try {
      return packCodes(lzwEncode(aSeguro(JSON.stringify(obj))));
    } catch (e) { return ''; }
  };

  U.unpack = function (str) {
    try {
      const codes = unpackCodes(str);
      if (!codes.length) return null;
      const safe = lzwDecode(codes);
      // los enlaces antiguos venían con encodeURIComponent; se siguen leyendo
      if (safe[0] === MARCA) return JSON.parse(deSeguro(safe.slice(1)));
      return JSON.parse(decodeURIComponent(safe));
    } catch (e) { return null; }
  };

  global.SW = global.SW || {};
  global.SW.RNG = RNG;
  global.SW.U = U;
})(window);

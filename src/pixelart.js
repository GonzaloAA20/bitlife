/* ============================================================
   HOLOVIDA :: pixel art
   Sprites dibujados a mano en rejilla de caracteres. Cada letra
   es un color de la paleta del sprite; el carácter '#' se
   sustituye por un color dinámico (la hoja de un sable, el
   casco de una nave) para que el mismo dibujo sirva para
   muchas variantes.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* paletas compartidas */
  const METAL = { a: '#2a3038', b: '#4a545e', c: '#6e7b88', d: '#98a6b4', e: '#c8d4e0' };
  const OSCURO = { a: '#14181d', b: '#242b33' };

  /* ---------------- SPRITES ----------------
     '.' = transparente · '#' = color dinámico
  */
  const S = {};

  /* --- sable de luz encendido (24x24) --- */
  S.sable = {
    w: 24, h: 24,
    pal: Object.assign({}, METAL, { g: '#ffffff', k: '#c8a050' }),
    px: [
      '..........####..........',
      '..........####..........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........g####g.........',
      '.........ddddd..........',
      '.........dceed..........',
      '.........dcbcd..........',
      '.........dkkkd..........',
      '.........dcbcd..........',
      '.........dcbcd..........',
      '.........dkkkd..........',
      '.........dcbcd..........',
      '.........ddddd..........',
      '..........ccc...........'
    ]
  };

  /* --- sable oscuro: hoja plana con filo blanco --- */
  S.sable_oscuro = {
    w: 24, h: 24,
    pal: Object.assign({}, METAL, { g: '#d8d0ff', n: '#1a1524', k: '#8a7fd8' }),
    px: [
      '..........g.g...........',
      '.........gnnng..........',
      '.........gnnng..........',
      '.........gnnng..........',
      '.........gnnng..........',
      '.........gnnng..........',
      '........gnnnng..........',
      '........gnnnng..........',
      '........gnnnng..........',
      '........gnnnng..........',
      '........gnnnnng.........',
      '........gnnnnng.........',
      '.......gnnnnnng.........',
      '.......gnnnnnng.........',
      '........ddddd...........',
      '........dkkkd...........',
      '........dcbcd...........',
      '........dcbcd...........',
      '........dkkkd...........',
      '........dcbcd...........',
      '........dcbcd...........',
      '........dkkkd...........',
      '........ddddd...........',
      '.........ccc............'
    ]
  };

  /* --- cristal kyber (16x16) --- */
  S.kyber = {
    w: 16, h: 16,
    pal: { g: '#ffffff' },
    px: [
      '................',
      '.......##.......',
      '......g##g......',
      '.....g####g.....',
      '....g######g....',
      '....########....',
      '...g########g...',
      '...##########...',
      '...##########...',
      '...g########g...',
      '....########....',
      '....g######g....',
      '.....g####g.....',
      '......g##g......',
      '.......##.......',
      '................'
    ]
  };

  /* --- naves: cuatro siluetas distintas (28x20) --- */
  S.nave_carguero = {
    w: 28, h: 20,
    pal: Object.assign({}, METAL, { r: '#c85a2a', g: '#7fd8ff' }),
    px: [
      '............................',
      '.......bbbb.....bbbb........',
      '......bccccb...bccccb.......',
      '......bcddcb...bcddcb.......',
      '.......bccb.....bccb........',
      '.....bbbbbbbbbbbbbbbb.......',
      '....bcccccccccccccccccb.....',
      '...bcdddddddddddddddddcb....',
      '..bcddd###########dddddcb...',
      '..bcdd#############ddddcb...',
      '..bcdd####ggg######ddddcb...',
      '..bcdd####ggg######ddddcb...',
      '..bcdd#############ddddcb...',
      '..bcddd###########dddddcb...',
      '...bcdddddddddddddddddcb....',
      '....bcccccccccccccccccb.....',
      '.....bbbbbbbbbbbbbbbb.......',
      '......rrb.........brr.......',
      '.......rr.........rr........',
      '............................'
    ]
  };
  S.nave_caza = {
    w: 28, h: 20,
    pal: Object.assign({}, METAL, { r: '#ff4d5e', g: '#7fd8ff' }),
    px: [
      '..b......................b..',
      '..bb....................bb..',
      '..bcb..................bcb..',
      '..bccb................bccb..',
      '..bcccb..............bcccb..',
      '..bccccb....####....bccccb..',
      '...bcccb...######...bcccb...',
      '...bcccb..########..bcccb...',
      '...bcccbb#########bbcccb....',
      '....bcccb###ggg###bcccb.....',
      '....bcccb###ggg###bcccb.....',
      '...bcccbb#########bbcccb....',
      '...bcccb..########..bcccb...',
      '...bcccb...######...bcccb...',
      '..bccccb....####....bccccb..',
      '..bcccb....r####r...bcccb...',
      '..bccb......rrrr.....bccb...',
      '..bcb........rr.......bcb...',
      '..bb..................bb....',
      '..b....................b....'
    ]
  };
  S.nave_lanzadera = {
    w: 28, h: 20,
    pal: Object.assign({}, METAL, { g: '#7fd8ff' }),
    px: [
      '.............##.............',
      '............####............',
      '............####............',
      '...........b####b...........',
      '...........b####b...........',
      '..........bc####cb..........',
      '..........bc####cb..........',
      '.........bcc####ccb.........',
      '.........bcc####ccb.........',
      '........bccc####cccb........',
      '.......bcccc####ccccb.......',
      '......bccccc####cccccb......',
      '.....bcccccc####ccccccb.....',
      '....bccccccc####cccccccb....',
      '...bcccccccc#gg#cccccccb....',
      '..bccccccccc#gg#ccccccccb...',
      '..bbbbbbbbbb####bbbbbbbbb...',
      '............####............',
      '...........b####b...........',
      '............b..b............'
    ]
  };
  S.nave_capital = {
    w: 28, h: 20,
    pal: Object.assign({}, METAL, { g: '#7fd8ff', r: '#ff9d3d' }),
    px: [
      '............................',
      '.............bb.............',
      '............b##b............',
      '...........b####b...........',
      '..........b######b..........',
      '.........b########b.........',
      '........b##########b........',
      '.......b############b.......',
      '......b##############b......',
      '.....b###ggg####ggg###b.....',
      '....b#################b.....',
      '...b###################b....',
      '..b#####################b...',
      '.b#######################b..',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbb.',
      '..rrb...rrb....brr...brr....',
      '...rr....rr.....rr....rr....',
      '............................',
      '............................',
      '............................'
    ]
  };

  /* --- bláster (24x14) --- */
  S.blaster = {
    w: 24, h: 14,
    pal: Object.assign({}, METAL, OSCURO, { r: '#c85a2a', g: '#ff4d5e' }),
    px: [
      '........................',
      '.......bbbbbb...........',
      '......bccccccbbbb.......',
      '.....bcddddddccccbb.....',
      'g.g.bcdeeeeeddddddccb...',
      '..bbcddddddddddddddccb..',
      '.bcccccccccccccccccccb..',
      '.bccbbbbbbbbbbbbbbbbb...',
      '.bccb....bccb...........',
      '.bccb...bcddcb..........',
      '..bb....bcddcb..........',
      '........bccccb..........',
      '.........brrb...........',
      '..........bb............'
    ]
  };

  /* --- casco de beskar (18x18) --- */
  S.casco = {
    w: 18, h: 18,
    pal: Object.assign({}, METAL, OSCURO),
    px: [
      '......eeeeee......',
      '....eedddddee.....',
      '...edddddddde.....',
      '..eddddddddddde...',
      '..edddddddddddde..',
      '..eddddddddddddde.',
      '..edddaaaaaddddde.',
      '..eddaaaaaaadddde.',
      '..edaaaaaaaaaddde.',
      '..edaaaaaaaaaddde.',
      '..edddaaaaaddddde.',
      '..eddddddddddddde.',
      '..eddddddddddddde.',
      '...eddddddddddde..',
      '....eddddddddde...',
      '.....eddddddde....',
      '......eeeeeee.....',
      '..................'
    ]
  };

  /* --- holocrón (18x18) --- */
  S.holocron = {
    w: 18, h: 18,
    pal: { g: '#ffffff', k: '#c8a050' },
    px: [
      '..................',
      '......kkkkkk......',
      '....kk######kk....',
      '...k##########k...',
      '..k############k..',
      '..k##gggggggg##k..',
      '..k##g######g##k..',
      '..k##g#gggg#g##k..',
      '..k##g#g..g#g##k..',
      '..k##g#g..g#g##k..',
      '..k##g#gggg#g##k..',
      '..k##g######g##k..',
      '..k##gggggggg##k..',
      '..k############k..',
      '...k##########k...',
      '....kk######kk....',
      '......kkkkkk......',
      '..................'
    ]
  };

  /* --- droide astromecánico (16x18) --- */
  S.droide = {
    w: 16, h: 18,
    pal: Object.assign({}, METAL, { g: '#3ad6ff', r: '#ff4d5e' }),
    px: [
      '.....dddd.......',
      '....ddeedd......',
      '...ddeggedd.....',
      '...deggggcd.....',
      '...dddddddd.....',
      '..bdddddddddb...',
      '..bd##rr##ddb...',
      '..bd######ddb...',
      '..bd##gg##ddb...',
      '..bd######ddb...',
      '..bd##rr##ddb...',
      '..bd######ddb...',
      '..bd######ddb...',
      '..bdddddddddb...',
      '..b.dddddd..b...',
      '..b.dd..dd..b...',
      '....dd..dd......',
      '...ddd..ddd.....'
    ]
  };

  /* --- armadura / peto (18x18) --- */
  S.armadura = {
    w: 18, h: 18,
    pal: Object.assign({}, METAL, OSCURO),
    px: [
      '..................',
      '...cc........cc...',
      '..cddc......cddc..',
      '.cdddcc####ccdddc.',
      '.cddddc####cddddc.',
      '.cddd##########dc.',
      '..cd############c.',
      '..cd####aa####dc..',
      '..cd###aaaa###dc..',
      '..cd####aa####dc..',
      '..cd##########dc..',
      '..cd##########dc..',
      '...c##########c...',
      '...c###ddd####c...',
      '....c##ddd###c....',
      '....cc#####cc.....',
      '.....ccccccc......',
      '..................'
    ]
  };

  /* --- reliquia genérica (16x16) --- */
  S.reliquia = {
    w: 16, h: 16,
    pal: { k: '#c8a050', a: '#5a4a2a', g: '#fff4d0' },
    px: [
      '................',
      '....kkkkkkkk....',
      '...kaaaaaaaak...',
      '..kaggggggggak..',
      '..kagaaaaaagak..',
      '..kagaggggagak..',
      '..kagagkkgagak..',
      '..kagagkkgagak..',
      '..kagaggggagak..',
      '..kagaaaaaagak..',
      '..kaggggggggak..',
      '...kaaaaaaaak...',
      '....kkkkkkkk....',
      '.....kaaaak.....',
      '......kkkk......',
      '................'
    ]
  };

  /* --- silueta de rival (18x20) --- */
  S.rival = {
    w: 18, h: 20,
    pal: Object.assign({}, OSCURO, { g: '#ff4d5e', c: '#3a4450' }),
    px: [
      '......aaaaa.......',
      '.....aaaaaaa......',
      '....aaggaggaa.....',
      '....aaaaaaaaa.....',
      '.....aaaaaaa......',
      '......aaaaa.......',
      '...ccaaaaaaacc....',
      '..caaaaaaaaaaac...',
      '..caaaaaaaaaaac...',
      '..caaaaaaaaaaac...',
      '..caaaaaaaaaaac...',
      '..cc.aaaaaaa.cc...',
      '.....aaaaaaa......',
      '.....aaa.aaa......',
      '.....aaa.aaa......',
      '.....aaa.aaa......',
      '.....aaa.aaa......',
      '....caaa.aaac.....',
      '....cccc.cccc.....',
      '..................'
    ]
  };

  /* --- mascota / criatura (18x16) --- */
  S.criatura = {
    w: 18, h: 16,
    pal: { a: '#6a4a30', b: '#8a6440', c: '#a8804a', g: '#ffd23a', d: '#3a2818' },
    px: [
      '..................',
      '...bb........bb...',
      '..bcb........bcb..',
      '..bcbbbbbbbbbbcb..',
      '.bccccccccccccccb.',
      '.bcgcccccccccgccb.',
      '.bccccccddccccccb.',
      '.bcccccddddcccccb.',
      '..bccccccccccccb..',
      '..bcccccccccccb...',
      '..bccccccccccb....',
      '..bcb.bcb.bcb.....',
      '..bab.bab.bab.....',
      '..ddd.ddd.ddd.....',
      '..................',
      '..................'
    ]
  };

  SW.SPRITES = S;

  /* ============================================================
     RENDER
     ============================================================ */
  /**
   * Dibuja un sprite en un <canvas> y devuelve el elemento.
   * @param {string} nombre  clave de SW.SPRITES
   * @param {object} opts    { escala, dinamico: '#hex', fondo }
   */
  SW.pixel = function (nombre, opts) {
    const o = opts || {};
    const sp = S[nombre] || S.reliquia;
    const esc = o.escala || 6;
    const cv = document.createElement('canvas');
    cv.width = sp.w * esc;
    cv.height = sp.h * esc;
    cv.className = 'sprite';
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;

    if (o.fondo) { cx.fillStyle = o.fondo; cx.fillRect(0, 0, cv.width, cv.height); }

    const din = o.dinamico || '#c8d4e0';
    for (let y = 0; y < sp.px.length; y++) {
      const fila = sp.px[y];
      for (let x = 0; x < fila.length; x++) {
        const ch = fila[x];
        if (ch === '.') continue;
        const color = ch === '#' ? din : sp.pal[ch];
        if (!color) continue;
        cx.fillStyle = color;
        cx.fillRect(x * esc, y * esc, esc, esc);
      }
    }
    return cv;
  };

  /** Devuelve el sprite ya como data-URI, útil para incrustar en HTML */
  SW.pixelURL = function (nombre, opts) {
    try { return SW.pixel(nombre, opts).toDataURL('image/png'); }
    catch (e) { return ''; }
  };

  /* ---------- elegir el sprite adecuado para una cosa ---------- */
  SW.spriteDeNave = function (nave) {
    if (!nave) return 'nave_carguero';
    if (nave.cls === 'caza') return 'nave_caza';
    if (nave.cls === 'lanzadera' || nave.cls === 'yate') return 'nave_lanzadera';
    if (nave.cls === 'capital') return 'nave_capital';
    return 'nave_carguero';
  };

  /* Antes esto miraba sólo `obj.t` y devolvía «blaster» para cualquier
     arma: un cuchillo de vibro-obsidiana salía dibujado como una
     pistola. Ahora manda el nombre y, si está fichado, su categoría. */
  SW.spriteDeObjeto = function (obj) {
    if (!obj) return 'reliquia';
    const n = String((obj.n || obj.nombre || obj) || '').toLowerCase();
    const ficha = SW.fichaObjeto ? SW.fichaObjeto(obj.n || obj.nombre || obj) : null;
    const cat = ficha ? ficha.cat : null;

    // primero lo que se reconoce por el nombre, que es lo más fiable
    if (/holocr/.test(n)) return 'holocron';
    if (/sable/.test(n)) return /oscur|negra/.test(n) ? 'sable_oscuro' : 'sable';
    if (/cristal|kyber/.test(n)) return 'kyber';
    if (/casco|visor/.test(n)) return /clon|soldado|tropa/.test(n) ? 'casco_soldado'
                                    : /piloto|vuelo/.test(n) ? 'casco_piloto' : 'casco';
    if (/jetpack|mochila/.test(n)) return 'jetpack';
    if (/bastón|baston|látigo|latigo|pica/.test(n)) return 'baston';
    if (/cuchillo|vibrohoja|vibro|daga|hoja/.test(n)) return 'vibrohoja';
    if (/rifle|ballesta|arco|francotirador|lanzacohetes|lanzallamas/.test(n)) return 'rifle';
    if (/pistola|bláster|blaster/.test(n)) return 'blaster';
    if (/medalla|condecoraci/.test(n)) return 'medalla';
    if (/trofeo/.test(n)) return 'trofeo';
    if (/talismán|talisman|amuleto/.test(n)) return 'talisman';
    if (/chip|datos|spike|slicer/.test(n)) return 'datachip';
    if (/droide/.test(n)) return /astro/.test(n) ? 'astromec' : 'droide';
    if (/bacta|botiquín|botiquin|kit de médico|kit médico|kit de medico|médic|medic|cura/.test(n)) return 'bacta';
    if (/kit|caja|equipo de/.test(n)) return 'herramienta';
    if (/credencial|salvoconducto|permiso|identidad/.test(n)) return 'credencial';
    if (/mapa|carta|macrobinocular/.test(n)) return 'holomapa';
    if (/especia/.test(n)) return 'especia';
    if (/copa|licor|bebida/.test(n)) return 'copa';
    if (/herramienta|llave|multiherr/.test(n)) return 'herramienta';
    if (/droide/.test(n)) return /astro/.test(n) ? 'astromec' : 'droide';

    // después, lo que diga la ficha de equipo
    if (cat === 'fuego') return 'blaster';
    if (cat === 'filo') return 'vibrohoja';
    if (cat === 'peto') return 'armadura';
    if (cat === 'util') return 'herramienta';

    // y por último el tipo genérico del evento que lo dio
    const t = obj.t || obj.tipo;
    if (t === 'arma' || t === 'arma_fuego') return 'blaster';
    if (t === 'armadura') return 'armadura';
    if (t === 'droide') return 'droide';
    if (t === 'vehículo') return 'nave_caza';
    return 'reliquia';
  };

})(window);

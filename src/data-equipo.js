/* ============================================================
   HOLOVIDA :: equipo
   Los objetos dejan de ser una lista y pasan a importar: si no
   tienes un bláster no puedes batirte en un duelo de pistolas,
   y la armadura que llevas encima resta daño de verdad.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* Categorías de uso. Un objeto puede tener varias. */
  SW.CAT = {
    fuego: 'arma_fuego',      // bláster, rifle: habilita duelos de pistolas
    filo: 'arma_filo',        // vibrohoja, cuchillo
    sable: 'sable',           // sable de luz
    peto: 'armadura',
    util: 'herramienta',
    nave: 'nave'
  };

  /* Ficha de combate de cada objeto: qué habilita y cuánto suma.
     Lo que no aparezca aquí es decorativo o mercancía. */
  SW.FICHA_OBJETO = {
    'bláster DL-44 modificado':            { cat: 'fuego', atk: 10, precision: 8 },
    'rifle de francotirador Verpine':      { cat: 'fuego', atk: 14, precision: 14, torpe: true },
    'rifle bláster DC-15A':                { cat: 'fuego', atk: 11, precision: 9 },
    'pistola de aturdimiento reglamentaria': { cat: 'fuego', atk: 4, precision: 5, noLetal: true },
    'lanzacohetes de hombro':              { cat: 'fuego', atk: 20, precision: -6, torpe: true },
    'ballesta wookiee':                    { cat: 'fuego', atk: 13, precision: 6 },
    'arco tusken':                         { cat: 'fuego', atk: 7, precision: 7 },
    'lanzallamas de muñeca':               { cat: 'fuego', atk: 12, precision: 2 },
    'vibrohoja de Iridonia':               { cat: 'filo', atk: 8 },
    'cuchillo de vibro-obsidiana':         { cat: 'filo', atk: 10 },
    'bastón eléctrico gamorreano':         { cat: 'filo', atk: 7 },
    'látigo eléctrico de capataz':         { cat: 'filo', atk: 6 },
    'armadura de beskar (una pieza)':      { cat: 'peto', def: 16 },
    'placas de armadura clon repintadas':  { cat: 'peto', def: 9 },
    'chaleco reflectante barato':          { cat: 'peto', def: 4 },
    'casco con visor táctico':             { cat: 'peto', def: 5, precision: 6 },
    'escudo de energía personal':          { cat: 'peto', def: 14 },
    'capa térmica de Hoth':                { cat: 'peto', def: 2 },
    'jetpack mandaloriano':                { cat: 'util', esquiva: 8 },
    'spike de slicer militar':             { cat: 'util', intelecto: 6 },
    'macrobinoculares con registro':       { cat: 'util', precision: 4 },
    'kit de médico de campaña':            { cat: 'util', cura: 3 },
    'droide médico 2-1B reparado':         { cat: 'util', cura: 5 }
  };

  SW.fichaObjeto = function (nombre) { return SW.FICHA_OBJETO[nombre] || null; };

  /** ¿lleva encima algo de esa categoría? */
  SW.tieneCat = function (s, cat) {
    if (cat === 'sable') return !!s.sable;
    for (let i = 0; i < s.objetos.length; i++) {
      const f = SW.fichaObjeto(s.objetos[i]);
      if (f && f.cat === cat) return true;
    }
    return false;
  };
  SW.tieneArmaFuego = function (s) { return SW.tieneCat(s, 'fuego'); };
  SW.armaDeMano = function (s) { return !!s.sable || SW.tieneCat(s, 'filo') || SW.tieneCat(s, 'fuego'); };

  /** El mejor objeto que tengas de una categoría */
  SW.mejorDe = function (s, cat) {
    let mejor = null, mejorV = -1;
    for (let i = 0; i < s.objetos.length; i++) {
      const f = SW.fichaObjeto(s.objetos[i]);
      if (!f || f.cat !== cat) continue;
      const v = (f.atk || 0) + (f.def || 0) + (f.precision || 0);
      if (v > mejorV) { mejorV = v; mejor = { n: s.objetos[i], f: f }; }
    }
    return mejor;
  };

  /** Bonos totales que aporta el equipo que llevas */
  SW.bonosEquipo = function (s) {
    const b = { atk: 0, def: 0, precision: 0, esquiva: 0, cura: 0 };
    const vistos = {};
    for (let i = 0; i < s.objetos.length; i++) {
      const n = s.objetos[i];
      const f = SW.fichaObjeto(n);
      if (!f) continue;
      // solo cuenta el mejor de cada categoría de arma; las utilidades suman todas
      if (f.cat === 'fuego' || f.cat === 'filo' || f.cat === 'peto') {
        if (vistos[f.cat]) continue;
        vistos[f.cat] = true;
        const mejor = SW.mejorDe(s, f.cat);
        if (mejor) {
          b.atk += mejor.f.atk || 0;
          b.def += mejor.f.def || 0;
          b.precision += mejor.f.precision || 0;
        }
        continue;
      }
      b.atk += f.atk || 0;
      b.def += f.def || 0;
      b.precision += f.precision || 0;
      b.esquiva += f.esquiva || 0;
      b.cura += f.cura || 0;
    }
    if (s.sable) { b.atk += 16; b.def += 6; }
    return b;
  };

  /* ============================================================
     CONSEGUIR ARMAS: comprar, robar, ganar, fabricar, heredar
     ============================================================ */
  SW.GEN = SW.GEN || {};

  SW.GEN.armeria = function (rng, s) {
    const armas = Object.keys(SW.FICHA_OBJETO).filter(function (n) {
      const f = SW.FICHA_OBJETO[n];
      return (f.cat === 'fuego' || f.cat === 'filo' || f.cat === 'peto') && s.objetos.indexOf(n) < 0;
    });
    const stock = rng.pickN(armas, 4);
    const c = stock.map(function (n) {
      const base = (SW.OBJETOS.filter(function (o) { return o.n === n; })[0] || { p: 2000 }).p;
      const precio = Math.round(base * (0.85 + rng.next() * 0.4));
      const f = SW.FICHA_OBJETO[n];
      const puede = s.stats.creditos >= precio;
      const etq = f.cat === 'fuego' ? 'arma de fuego' : f.cat === 'filo' ? 'cuerpo a cuerpo' : 'protección';
      return {
        t: (puede ? 'Comprar ' : '✕ ') + n + ' — ' + SW.U.cr(precio),
        sub: etq + (f.atk ? ' · +' + f.atk + ' ataque' : '') + (f.def ? ' · +' + f.def + ' defensa' : '') + (puede ? '' : ' · no te llega'),
        bloqueada: !puede,
        fx: puede ? { creditos: -precio } : {},
        darItem: puede ? n : null
      };
    });

    /* robar: barato en créditos, caro en todo lo demás */
    const objetivo = rng.pick(stock);
    c.push({
      t: 'Robar ' + objetivo + ' del mostrador',
      sub: 'gratis si sale bien',
      r: [
        { p: 0.45, t: 'Sales con ello bajo la chaqueta.', fx: { destreza: 8, notoriedad: 10, alineamiento: -10 }, darItem: objetivo },
        { p: 0.35, t: 'El armero te ve y te echa a patadas.', fx: { reputacion: -10, notoriedad: 8 } },
        { p: 0.20, t: 'El armero te ve y tiene su propio surtido cargado.', fx: { salud: -20, notoriedad: 14 } }
      ]
    });
    if (s.habilidades.indexOf('armero') >= 0) {
      c.push({ t: 'Fabricarte una tú mismo', sub: 'sabes hacerlo', fx: { creditos: -1200, intelecto: 6 }, darItem: rng.pick(stock) });
    }
    c.push({ t: '◂ Salir de la armería', volver: true });
    return { id: 'menu_armeria', gen: true, esMenu: true, t: 'ARMERÍA de ' + s.mundo + ' — tienes ' + SW.U.cr(s.stats.creditos), c: c };
  };

})(window);

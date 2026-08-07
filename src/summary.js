/* ============================================================
   HOLOVIDA :: retrato, resumen de vida y enlaces para compartir
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ---------------- RETRATO ----------------
     El de verdad lo dibuja pixelart-retrato.js en 64×64. Esto de
     abajo es el SVG viejo, que queda como red de seguridad si el
     navegador no deja usar canvas. */
  SW.retrato = function (ap, tam, especie) {
    if (SW.retratoPixel) {
      try { return SW.retratoPixel(ap, tam, especie || (ap && ap.especie)); } catch (e) { /* al SVG */ }
    }
    return SW.retratoSVG(ap, tam);
  };

  SW.retratoSVG = function (ap, tam) {
    const t = tam || 160;
    const piel = ap.piel, ojos = ap.ojos, pelo = ap.pelo;
    const cabeza = ap.forma || 0;
    const marca = ap.marca || 'sin marcas';
    const tocado = ap.tocado || 'nada';

    let cara;
    if (cabeza === 0) cara = '<ellipse cx="50" cy="52" rx="26" ry="31" fill="' + piel + '"/>';
    else if (cabeza === 1) cara = '<path d="M24 40 Q50 12 76 40 L70 76 Q50 92 30 76 Z" fill="' + piel + '"/>';
    else if (cabeza === 2) cara = '<rect x="24" y="24" width="52" height="60" rx="14" fill="' + piel + '"/>';
    else cara = '<path d="M26 46 Q50 16 74 46 Q74 84 50 88 Q26 84 26 46 Z" fill="' + piel + '"/>';

    let extra = '';
    if (pelo !== 'ninguno') {
      extra += '<path d="M22 44 Q50 6 78 44 Q64 30 50 32 Q36 30 22 44 Z" fill="' + pelo + '"/>';
    }
    if (marca === 'tatuajes rituales') extra += '<path d="M40 34 L40 70 M50 30 L50 74 M60 34 L60 70" stroke="#1a1a1a" stroke-width="2" opacity=".7"/>';
    if (marca === 'cicatriz vertical') extra += '<path d="M38 32 L36 66" stroke="#8a2a2a" stroke-width="2.4"/>';
    if (marca === 'pintura de clan') extra += '<path d="M28 52 Q50 62 72 52" stroke="#ff4d5e" stroke-width="4" fill="none" opacity=".8"/>';
    if (marca === 'implantes cromados') extra += '<rect x="56" y="42" width="16" height="10" rx="2" fill="#b8c4d0" stroke="#5a6570"/>';
    if (marca === 'escamas iridiscentes') extra += '<g opacity=".45"><circle cx="36" cy="60" r="3" fill="#7fd8ff"/><circle cx="44" cy="66" r="3" fill="#7fd8ff"/><circle cx="60" cy="62" r="3" fill="#7fd8ff"/></g>';
    if (marca === 'runas luminiscentes') extra += '<text x="50" y="76" font-size="9" text-anchor="middle" fill="#7fffd8" opacity=".9">◇◈◇</text>';
    if (marca === 'quemadura de bláster') extra += '<circle cx="64" cy="58" r="7" fill="#5a2a2a" opacity=".65"/>';

    let head = '';
    if (tocado === 'casco de beskar') head = '<path d="M22 46 Q50 14 78 46 L78 58 L22 58 Z" fill="#c9ced6" stroke="#8a9099" stroke-width="1.5"/><rect x="30" y="48" width="40" height="7" rx="3" fill="#1a1f26"/>';
    else if (tocado === 'capucha de peregrino') head = '<path d="M18 52 Q50 4 82 52 L74 58 Q50 26 26 58 Z" fill="#4a3f33"/>';
    else if (tocado === 'gafas de soldador') head = '<rect x="28" y="42" width="44" height="12" rx="4" fill="#2a3038" stroke="#c8a050"/>';
    else if (tocado === 'diadema de senador') head = '<path d="M30 32 Q50 22 70 32" stroke="#d8b84a" stroke-width="3.5" fill="none"/>';
    else if (tocado === 'respirador') head = '<rect x="38" y="60" width="24" height="16" rx="6" fill="#3a4048" stroke="#8a9099"/><path d="M38 68 H26 M62 68 H74" stroke="#8a9099" stroke-width="2"/>';
    else if (tocado === 'trenza de padawan') head = '<path d="M74 44 Q80 62 78 84" stroke="#8a6a3a" stroke-width="3" fill="none"/>';
    else if (tocado === 'corona de clan') head = '<path d="M32 30 L38 20 L44 30 L50 18 L56 30 L62 20 L68 30 Z" fill="#c8a050"/>';
    else if (tocado === 'visor cibernético') head = '<rect x="26" y="44" width="48" height="9" rx="4" fill="#101820" stroke="#3ad6ff"/><rect x="30" y="46" width="18" height="4" fill="#3ad6ff" opacity=".8"/>';

    const ojosSvg = (tocado === 'casco de beskar' || tocado === 'visor cibernético' || tocado === 'gafas de soldador') ? '' :
      '<circle cx="41" cy="52" r="4.2" fill="#0a0e13"/><circle cx="59" cy="52" r="4.2" fill="#0a0e13"/>' +
      '<circle cx="41" cy="52" r="2.6" fill="' + ojos + '"/><circle cx="59" cy="52" r="2.6" fill="' + ojos + '"/>' +
      '<circle cx="42" cy="51" r="1" fill="#fff" opacity=".85"/><circle cx="60" cy="51" r="1" fill="#fff" opacity=".85"/>';

    // hombros / vestimenta
    const ROPA_COLOR = {
      'túnica de arpillera': '#8a7550', 'chaqueta de piloto': '#5a4030', 'uniforme imperial': '#4a5058',
      'armadura completa': '#b8c0c8', 'traje de gala': '#3a2a5a', 'mono de mecánico': '#3a5a4a',
      'capa de cazador': '#5a3030', 'túnica jedi': '#7a6040', 'ropa de calle de Nar Shaddaa': '#2a3a5a',
      'traje de vuelo rebelde': '#c86a2a'
    };
    const cr = ROPA_COLOR[ap.ropa] || '#3a4a58';
    const hombros = '<path d="M14 100 Q22 84 38 80 L50 88 L62 80 Q78 84 86 100 Z" fill="' + cr + '"/>' +
      '<path d="M50 88 L46 100 L54 100 Z" fill="' + piel + '" opacity=".55"/>';

    return '<svg class="retrato" viewBox="0 0 100 100" width="' + t + '" height="' + t + '" aria-hidden="true">' +
      '<defs><radialGradient id="holoG"><stop offset="0%" stop-color="#0d2230"/><stop offset="100%" stop-color="#050a0f"/></radialGradient></defs>' +
      '<rect width="100" height="100" fill="url(#holoG)"/>' +
      '<g opacity=".18">' + [10, 20, 30, 40, 50, 60, 70, 80, 90].map(function (y) { return '<line x1="0" y1="' + y + '" x2="100" y2="' + y + '" stroke="#3ad6ff" stroke-width=".5"/>'; }).join('') + '</g>' +
      cara + extra + ojosSvg + head + hombros +
      '<rect width="100" height="100" fill="none" stroke="#3ad6ff" stroke-width="1" opacity=".35"/>' +
      '</svg>';
  };

  /* ---------------- RESUMEN COMPACTO ---------------- */
  SW.construirResumen = function (s) {
    const rel = s.relaciones.map(function (r) { return { n: r.nombre, t: r.tipo, a: r.afecto }; });
    return {
      v: 1,
      n: s.nombre,
      e: s.especieN,
      m: s.mundoNatal,
      mm: s.mundo,
      er: s.eraN,
      ed: s.edad,
      mu: s.muerto,
      cm: s.causaMuerte,
      st: [s.stats.salud, s.stats.fuerza, s.stats.destreza, s.stats.intelecto, s.stats.carisma,
           s.stats.suerte, s.stats.cordura, s.stats.reputacion, s.stats.notoriedad, s.stats.alineamiento,
           s.stats.creditos, s.stats.fisico],
      se: !!s.sensible,
      he: (s.heridas || []).map(function (h) { return h.n + ' (−' + h.sev + ')'; }),
      ba: s.bando ? (SW.faccion(s.bando) || {}).n : null,
      hb: s.habilidades,
      cn: s.conocidos || [],
      ob: (s.objetos || []).slice(0, 12),
      ma: s.maestro || null,
      tr: s.trabajo ? (SW.carrera(s.trabajo) ? SW.carrera(s.trabajo).n : s.trabajo) : null,
      rg: s.rango,
      ti: s.titulos,
      hi: s.hitos.slice(-14),
      re: rel.slice(0, 10),
      po: s.poderes,
      sa: s.sable ? [s.sable.color, s.sable.forma] : null,
      na: s.nave ? (s.naveNombre ? '"' + s.naveNombre + '" (' + s.nave.n + ')' : s.nave.n) : null,
      ap: s.apariencia,
      esp: s.especie,
      ct: s.contadores,
      ra: s.rasgoN,
      sem: s.semilla
    };
  };

  SW.enlaceResumen = function (s) {
    const data = SW.construirResumen(s);
    const packed = U.pack(data);
    // usa la URL real desde la que se sirve la página (funciona en http, https y file)
    let base = String(location.href || '').split('#')[0];
    if (!/^(https?|file):/.test(base)) base = '';   // about:srcdoc y similares: solo el fragmento
    return base + '#v=' + packed;
  };

  /* ---------------- TEXTO PARA PEGAR EN UN CHAT ---------------- */
  SW.resumenTexto = function (s) {
    const L = [];
    L.push('╔══ HOLOVIDA ══════════════════');
    L.push('║ ' + s.nombre + ' · ' + s.especieN);
    L.push('║ ' + s.eraN + ' · nacid@ en ' + s.mundoNatal);
    L.push('║ ' + (s.muerto ? 'Murió a los ' + s.edad + ' — ' + s.causaMuerte : 'Vive, ' + s.edad + ' años'));
    if (s.trabajo) L.push('║ ' + s.rango + ' (' + (SW.carrera(s.trabajo) || {}).n + ')');
    if (s.titulos.length) L.push('║ ' + s.titulos.join(' · '));
    L.push('╠══════════════════════════════');
    L.push('║ Créditos: ' + U.cr(s.stats.creditos));
    L.push('║ Físico ' + s.stats.fisico + ' · Destreza ' + s.stats.destreza + ' · Intelecto ' + s.stats.intelecto);
    L.push('║ Carisma ' + s.stats.carisma + ' · Cordura ' + s.stats.cordura + ' · Salud ' + s.stats.salud);
    if (s.sensible) L.push('║ La Fuerza: ' + s.stats.fuerza);
    if (s.heridas && s.heridas.length) L.push('║ Heridas: ' + s.heridas.map(function (h) { return h.n; }).join(', '));
    L.push('║ Alineamiento: ' + SW.etiquetaAlineamiento(s.stats.alineamiento));
    if (s.sable) L.push('║ Sable: hoja ' + s.sable.color + ' (' + s.sable.forma + ')');
    if (s.maestro) L.push('║ Maestro: ' + s.maestro);
    if (s.conocidos && s.conocidos.length) L.push('║ Se cruzó con: ' + s.conocidos.join(', '));
    if (s.nave) L.push('║ Nave: ' + (s.naveNombre || s.nave.n));
    L.push('║ Mundos visitados: ' + s.contadores.mundosVisitados);
    L.push('╠══ MOMENTOS ══════════════════');
    s.hitos.slice(-8).forEach(function (h) { L.push('║ ' + h.edad + ' — ' + h.txt); });
    L.push('╚══════════════════════════════');
    return L.join('\n');
  };

  SW.etiquetaAlineamiento = function (a) {
    if (a > 70) return 'Luz plena';
    if (a > 35) return 'Luminoso';
    if (a > 10) return 'Bienintencionado';
    if (a > -10) return 'Gris';
    if (a > -35) return 'Turbio';
    if (a > -70) return 'Oscuro';
    return 'Abismo';
  };

  /* ---------------- TARJETA DE RESUMEN (HTML) ---------------- */
  SW.tarjetaResumen = function (d, opciones) {
    const o = opciones || {};
    const st = d.st;
    const stats = [
      ['Salud', st[0]], ['Físico', st[11] == null ? 40 : st[11]], ['Destreza', st[2]], ['Intelecto', st[3]],
      ['Carisma', st[4]], ['Cordura', st[6]], ['Suerte', st[5]], ['Reputación', st[7]], ['Notoriedad', st[8]]
    ];
    if (d.se !== false) stats.push(['✦ La Fuerza', st[1]]);
    let h = '<div class="card-vida">';
    h += '<div class="cv-head">';
    h += '<div class="cv-retrato">' + SW.retrato(d.ap, 130, d.esp) + '</div>';
    h += '<div class="cv-id"><h2>' + U.esc(d.n) + '</h2>';
    h += '<p class="cv-sub">' + U.esc(d.e) + ' · ' + U.esc(d.ra || '') + '</p>';
    h += '<p class="cv-sub">' + U.esc(d.er) + ' · nacid@ en ' + U.esc(d.m) + '</p>';
    h += '<p class="cv-estado ' + (d.mu ? 'muerto' : 'vivo') + '">' + (d.mu ? '☠ Murió a los ' + d.ed + ' — ' + U.esc(d.cm) : '● ' + d.ed + ' años, sigue en pie') + '</p>';
    if (d.tr) h += '<p class="cv-sub">' + U.esc(d.rg || '') + ' — ' + U.esc(d.tr) + '</p>';
    if (d.ma) h += '<p class="cv-sub">Maestro: <b>' + U.esc(d.ma) + '</b></p>';
    h += '</div></div>';

    if (d.ti && d.ti.length) {
      h += '<div class="cv-titulos">' + d.ti.map(function (t) { return '<span class="tag oro">' + U.esc(t) + '</span>'; }).join('') + '</div>';
    }

    h += '<div class="cv-stats">';
    stats.forEach(function (p) {
      h += '<div class="cv-stat"><span>' + p[0] + '</span><div class="barra"><i style="width:' + p[1] + '%"></i></div><b>' + p[1] + '</b></div>';
    });
    h += '</div>';

    h += '<div class="cv-linea">';
    h += '<span class="tag">' + U.cr(st[10]) + '</span>';
    h += '<span class="tag">' + SW.etiquetaAlineamiento(st[9]) + '</span>';
    if (d.ba) h += '<span class="tag">' + U.esc(d.ba) + '</span>';
    if (d.sa) h += '<span class="tag" style="border-color:' + (SW.COLORES_KYBER.filter(function (k) { return k.c === d.sa[0]; })[0] || {}).hex + '">Sable ' + U.esc(d.sa[0]) + ' · ' + U.esc(d.sa[1]) + '</span>';
    if (d.na) h += '<span class="tag">' + U.esc(d.na) + '</span>';
    if (d.ct && d.ct.mundosVisitados) h += '<span class="tag">' + d.ct.mundosVisitados + ' mundos</span>';
    if (d.ct && d.ct.derribos) h += '<span class="tag">' + d.ct.derribos + ' derribos</span>';
    if (d.ct && d.ct.cazas) h += '<span class="tag">' + d.ct.cazas + ' contratos</span>';
    h += '</div>';

    if (d.he && d.he.length) {
      h += '<div class="cv-seccion"><h3>Heridas sin cerrar</h3><p class="cv-heridas">' + d.he.map(U.esc).join(' · ') + '</p></div>';
    }

    if (d.hb && d.hb.length) {
      h += '<div class="cv-seccion"><h3>Oficios</h3><p>' + d.hb.map(U.esc).join(' · ') + '</p></div>';
    }

    if (d.ob && d.ob.length) {
      h += '<div class="cv-seccion"><h3>Lo que llevaba encima</h3><p>' + d.ob.map(U.esc).join(' · ') + '</p></div>';
    }

    if (d.cn && d.cn.length) {
      h += '<div class="cv-seccion"><h3>Se cruzó con</h3><p class="cv-canon">' +
        d.cn.map(function (n) { return '<span class="tag oro">' + U.esc(n) + '</span>'; }).join('') + '</p></div>';
    }

    if (d.po && d.po.length) {
      h += '<div class="cv-seccion"><h3>Poderes</h3><p>' + d.po.map(function (p) {
        const P = SW.PODERES.filter(function (x) { return x.id === p; })[0];
        return U.esc(P ? P.n : p);
      }).join(' · ') + '</p></div>';
    }

    if (d.re && d.re.length) {
      h += '<div class="cv-seccion"><h3>Gente</h3><ul class="cv-rel">';
      d.re.forEach(function (r) {
        h += '<li><b>' + U.esc(r.n) + '</b> <span class="rt">' + U.esc(r.t) + '</span> <span class="af ' + (r.a > 0 ? 'pos' : 'neg') + '">' + (r.a > 0 ? '+' : '') + r.a + '</span></li>';
      });
      h += '</ul></div>';
    }

    if (d.hi && d.hi.length) {
      h += '<div class="cv-seccion"><h3>Momentos</h3><ol class="cv-hitos">';
      d.hi.forEach(function (x) { h += '<li><span class="edad">' + x.edad + '</span> ' + U.esc(x.txt) + '</li>'; });
      h += '</ol></div>';
    }

    h += '<div class="cv-pie">HOLOVIDA · semilla <code>' + U.esc(String(d.sem || '').slice(0, 18)) + '</code></div>';
    h += '</div>';
    return h;
  };

  /* ---------------- MÉTRICAS: espacio de decisiones ---------------- */
  SW.metricas = function () {
    const pools = {
      mundo: SW.MUNDO_NOMBRES.length,
      criatura: SW.CRIATURAS.length,
      lugar: SW.LUGARES.length,
      objeto: SW.OBJETOS.length,
      faccion: SW.FACCIONES.length,
      rumor: SW.RUMORES.length,
      nave: SW.NAVES.length,
      nombre: 40 // se cuenta acotado: los nombres varían pero no cambian el escenario
    };
    let plantillas = 0, nodos = 0, escenarios = 0;

    function contar(lista) {
      lista.forEach(function (ev) {
        plantillas++;
        let v = 1;
        const sl = ev.slots || {};
        for (const k in sl) v *= (pools[sl[k]] || 1);
        escenarios += v;
        nodos += v * ev.c.length;
      });
    }
    contar(SW.EVENTOS);
    contar(SW.GUION || []);
    for (const k in SW.ACTOS) contar(SW.ACTOS[k]);

    // generadores procedurales
    const gen = [
      { e: 8 * pools.faccion * pools.mundo * pools.lugar, o: 4 },   // contrato
      { e: 10 * pools.mundo * pools.mundo * 8, o: 4 },              // ruta
      { e: 12 * pools.lugar, o: 4 },                                // acción
      { e: 6 * 41, o: 4 },                                          // dogfight
      { e: SW.CARRERAS.length * 4, o: 5 },                          // empleo
      { e: 9 * 7 * pools.mundo, o: 4 },                             // misión militar
      { e: 8 * pools.faccion * pools.mundo, o: 4 },                 // encargo de facción
      { e: 4 * 40 * 40 * pools.lugar, o: 3 },                       // dilema moral
      { e: (SW.CANON ? SW.CANON.length : 0) * pools.lugar, o: 4 },   // encuentros canónicos
      { e: 12 * 4, o: 6 }                                            // armería
    ];
    let genEsc = 0, genNodos = 0;
    gen.forEach(function (g) { genEsc += g.e; genNodos += g.e * g.o; });

    return {
      plantillas: plantillas,
      escenariosFijos: escenarios,
      nodosFijos: nodos,
      escenariosGen: genEsc,
      nodosGen: genNodos,
      totalEscenarios: escenarios + genEsc,
      totalNodos: nodos + genNodos,
      especies: SW.ESPECIES.length,
      mundos: SW.MUNDOS.length,
      carreras: SW.CARRERAS.length,
      poderes: SW.PODERES.length,
      canon: SW.CANON ? SW.CANON.length : 0
    };
  };

})(window);

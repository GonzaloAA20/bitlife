/* ============================================================
   HOLOVIDA :: TRAMAS LARGAS
   Hilos que se abren por algo que decidiste y siguen ahí veinte
   años después. Cada trama tiene etapas, memoria propia y varios
   finales; lo que elegiste en la etapa 1 cambia lo que se te
   ofrece en la 5. Se ven en la ficha y salen en el resumen final.

   Modelo:
     s.tramas[id] = { etapa, desde, prox, datos:{}, cerrada, final }
   Cada etapa devuelve un evento generado. Las opciones llevan
     tramaAvanza: { id, a: n, datos: {...} }   → siguiente etapa
     tramaCierra: { id, final: 'texto' }       → se acaba
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------ */
  function esperar(rng, a, b) { return rng.int(a, b); }

  SW.abrirTrama = function (g, id, datos) {
    const s = g.s, rng = g.rng;
    const T = SW.TRAMAS[id];
    if (!T || (s.tramas && s.tramas[id])) return false;
    s.tramas = s.tramas || {};
    s.tramas[id] = {
      etapa: 0, desde: s.edad, prox: s.edad + esperar(rng, T.primera ? T.primera[0] : 1, T.primera ? T.primera[1] : 3),
      datos: datos || {}, cerrada: false, final: null
    };
    g.log('<i class="trama-abre">◈ Empieza algo:</i> ' + T.n + '.', 'res');
    return true;
  };

  SW.tramaActiva = function (s, id) {
    const t = (s.tramas || {})[id];
    return t && !t.cerrada ? t : null;
  };

  SW.cerrarTrama = function (g, id, final) {
    const s = g.s;
    const t = (s.tramas || {})[id];
    if (!t || t.cerrada) return;
    t.cerrada = true;
    t.final = final || 'Se acabó.';
    t.hasta = s.edad;
    const T = SW.TRAMAS[id];
    g.log('<i class="trama-cierra">◈ ' + (T ? T.n : 'Una historia') + ' — ' + t.final + '</i>', 'res');
    g.hito((T ? T.n : 'Una historia') + ': ' + t.final);
  };

  SW.avanzarTrama = function (g, id, a, datos) {
    const s = g.s, rng = g.rng;
    const t = (s.tramas || {})[id];
    const T = SW.TRAMAS[id];
    if (!t || !T) return;
    t.etapa = a != null ? a : t.etapa + 1;
    if (datos) for (const k in datos) t.datos[k] = datos[k];
    if (t.etapa >= T.etapas.length) { SW.cerrarTrama(g, id, T.finalPorDefecto || 'Se apagó sola.'); return; }
    const e = T.etapas[t.etapa];
    t.prox = s.edad + esperar(rng, (e.espera && e.espera[0]) || 2, (e.espera && e.espera[1]) || 5);
  };

  /** Tick anual: abre tramas nuevas y saca la etapa que toque. */
  SW.pasoTramas = function (g) {
    const s = g.s, rng = g.rng;
    s.tramas = s.tramas || {};

    // como mucho tres hilos vivos a la vez: si no, se diluyen
    let vivas = 0;
    for (const k in s.tramas) if (!s.tramas[k].cerrada) vivas++;

    // ¿se abre alguna?
    if (vivas < 3) for (const id in SW.TRAMAS) {
      const T = SW.TRAMAS[id];
      if (s.tramas[id]) continue;
      if (T.min != null && s.edadBio < T.min) continue;
      let ok = false;
      try { ok = T.arranca(s); } catch (e) { ok = false; }
      if (ok && rng.chance(T.p == null ? 0.7 : T.p)) { SW.abrirTrama(g, id); break; }
    }

    // ¿toca escena de alguna?
    const listas = [];
    for (const id in s.tramas) {
      const t = s.tramas[id];
      if (t.cerrada) continue;
      const T = SW.TRAMAS[id];
      if (!T) continue;
      if (s.edad < t.prox) continue;
      listas.push({ id: id, t: t, T: T });
    }
    if (!listas.length) return null;
    // una por año como mucho: la más antigua manda
    listas.sort(function (a, b) { return a.t.prox - b.t.prox; });
    const el = listas[0];
    const etapa = el.T.etapas[el.t.etapa];
    if (!etapa) { SW.cerrarTrama(g, el.id, el.T.finalPorDefecto || 'Se apagó sola.'); return null; }
    let ev = null;
    try { ev = etapa.escena(g, el.t); } catch (e) { ev = null; }
    if (!ev) { el.t.prox = s.edad + 2; return null; }
    ev.gen = true;
    ev.id = 'trama_' + el.id + '_' + el.t.etapa;
    ev.esTrama = el.id;
    // cabecera común: se ve que esto viene de lejos
    const años = s.edad - el.t.desde;
    ev.t = '<span class="trama-tag">' + U.esc(el.T.n.toUpperCase()) + (años > 0 ? ' · ' + años + ' AÑOS' : '') + '</span>' + ev.t;
    // por si el jugador no elige nada que mueva la trama, que no se atasque
    el.t.prox = s.edad + 3;
    return ev;
  };

  /* ============================================================
     LAS TRAMAS
     ============================================================ */
  const T = {};
  SW.TRAMAS = T;

  /* ---------------------------------------------------------- 1
     LA DEUDA
     Empieza por pedir prestado a quien no deberías y acaba
     contigo pagando, huyendo o trabajando para ellos.
     ---------------------------------------------------------- */
  T.deuda = {
    n: 'La deuda', ico: '⛓', min: 16, p: 0.9,
    resumen: 'Debes dinero a gente que no olvida.',
    arranca: function (s) { return !!s.flags.debe_a_usureros; },
    primera: [1, 2],
    finalPorDefecto: 'Al final se cansaron de buscarte.',
    etapas: [
      { espera: [2, 3], escena: function (g, t) {
        t.datos.monto = t.datos.monto || 18000;
        return { t: '<p>Vienen a recordarte lo que debes. Con educación, de momento: ' + U.cr(t.datos.monto) + '.</p>',
          c: [
            { t: 'Pagar entero', req: function (s) { return s.stats.creditos >= t.datos.monto; },
              coste: t.datos.monto, tramaCierra: { id: 'deuda', final: 'la pagaste y se acabó' }, fx: { cordura: 12 } },
            { t: 'Pagar la mitad y ganar tiempo', coste: Math.round(t.datos.monto / 2),
              tramaAvanza: { id: 'deuda', a: 1, datos: { monto: Math.round(t.datos.monto * 0.8), buen_pagador: true } } },
            { t: 'Decirles que no tienes', tramaAvanza: { id: 'deuda', a: 1, datos: { monto: Math.round(t.datos.monto * 1.6) } }, fx: { cordura: -8 } },
            { t: 'Trabajar para ellos a cuenta', tramaAvanza: { id: 'deuda', a: 2, datos: { trabajas: true } },
              fx: { notoriedad: 12, alineamiento: -10 } }
          ] };
      } },
      { espera: [3, 5], escena: function (g, t) {
        const m = t.datos.monto || 30000;
        return { t: '<p>Han pasado años y la cifra ha crecido sola: ' + U.cr(m) + '. Esta vez traen a alguien grande.</p>',
          c: [
            { t: 'Pagar', req: function (s) { return s.stats.creditos >= m; }, coste: m,
              tramaCierra: { id: 'deuda', final: 'la saldaste tarde pero entera' }, fx: { cordura: 14, reputacion: 6 } },
            { t: 'Pelear', combate: { dif: 62 }, tramaAvanza: { id: 'deuda', a: 3 }, fx: { notoriedad: 10 } },
            { t: 'Huir del planeta', mover: 'cerca', motivo: 'huyendo de una deuda',
              tramaAvanza: { id: 'deuda', a: 3, datos: { huiste: true } }, fx: { cordura: -6 } },
            { t: 'Ofrecerles tu negocio como pago', req: function (s) { return !!s.flags.tiene_local; },
              tramaCierra: { id: 'deuda', final: 'les diste el local y saliste limpio' }, fx: { creditos: -5000 } }
          ] };
      } },
      { espera: [2, 4], escena: function (g, t) {
        return { t: '<p>Llevas años haciéndoles trabajos. Ya no sabes si sigues debiendo algo o simplemente eres suyo.</p>',
          c: [
            { t: 'Pedir las cuentas', fx: { intelecto: 10 },
              tramaAvanza: { id: 'deuda', a: 3, datos: { sabes_la_verdad: true } } },
            { t: 'Seguir sin preguntar', fx: { creditos: 12000, alineamiento: -10, cordura: -8 },
              tramaAvanza: { id: 'deuda', a: 2 } },
            { t: 'Hacerte imprescindible', fx: { carisma: 14, notoriedad: 12 },
              tramaAvanza: { id: 'deuda', a: 4, datos: { dentro: true } } },
            { t: 'Denunciarlos', fx: { alineamiento: 16 }, buscado: 30,
              tramaAvanza: { id: 'deuda', a: 3, datos: { delataste: true } } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        const dur = g.s.edad - t.desde;
        return { t: '<p>' + dur + ' años arrastrando esto. Hoy te encuentran otra vez, en otro planeta, con otro nombre y la misma cara.</p>',
          c: [
            { t: 'Acabar con esto a la mala', combate: { dif: 70, aMuerte: true },
              tramaCierra: { id: 'deuda', final: 'lo cerraste a golpes' }, fx: { notoriedad: 16 } },
            { t: 'Pagar el triple y que te dejen en paz', coste: 60000,
              req: function (s) { return s.stats.creditos >= 60000; },
              tramaCierra: { id: 'deuda', final: 'pagaste tres veces lo que debías' }, fx: { cordura: 16 } },
            { t: 'Comprarles a ellos', req: function (s) { return s.stats.creditos >= 120000; }, coste: 120000,
              tramaCierra: { id: 'deuda', final: 'acabaste siendo su dueño' }, fx: { notoriedad: 20, carisma: 14 } },
            { t: 'Aceptar que esto no se acaba', fx: { cordura: -14 },
              tramaAvanza: { id: 'deuda', a: 3 } }
          ] };
      } },
      { espera: [5, 9], escena: function (g, t) {
        return { t: '<p>Ya no eres el que debe: eres uno de ellos. Y ahora hay alguien nuevo que no puede pagar.</p>',
          c: [
            { t: 'Hacerle lo que te hicieron', fx: { creditos: 25000, alineamiento: -22, cordura: -10 },
              tramaCierra: { id: 'deuda', final: 'te convertiste en lo que te perseguía' } },
            { t: 'Perdonarle la deuda de tu bolsillo', coste: 20000, fx: { alineamiento: 24, cordura: 18 },
              tramaCierra: { id: 'deuda', final: 'rompiste la cadena con alguien' } },
            { t: 'Dejarlo todo y desaparecer', mover: 'cerca', motivo: 'dejándolo todo atrás',
              fx: { cordura: 10, creditos: -20000 },
              tramaCierra: { id: 'deuda', final: 'lo dejaste y te fuiste' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 2
     EL ENEMIGO PACIENTE
     Alguien a quien humillaste crece durante décadas.
     ---------------------------------------------------------- */
  T.enemigo = {
    n: 'El enemigo paciente', ico: '☍', min: 14, p: 0.55,
    resumen: 'Alguien te tiene ganas y tiene tiempo.',
    arranca: function (s) {
      return (s.contadores.enemigosPoliticos || 0) > 0 || s.stats.notoriedad > 45 ||
             (s.relaciones || []).some(function (r) { return r.tipo === 'rival' && r.afecto < -40; });
    },
    primera: [2, 5],
    finalPorDefecto: 'Se murió antes de cobrárselo.',
    etapas: [
      { espera: [3, 6], escena: function (g, t) {
        const rng = g.rng;
        t.datos.n = t.datos.n || SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'duros']), rng.chance(0.5) ? 'm' : 'f');
        return { t: '<p>Te llega el nombre de quien lleva tiempo hablando mal de ti: <b>' + t.datos.n + '</b>. Todavía no es nadie.</p>',
          c: [
            { t: 'Ir a hablar con él', fx: { carisma: 12 },
              tramaAvanza: { id: 'enemigo', a: 1, datos: { hablasteis: true } } },
            { t: 'Aplastarle ahora que puedes', fx: { notoriedad: 12, alineamiento: -14 },
              tramaAvanza: { id: 'enemigo', a: 1, datos: { humillado: true } } },
            { t: 'Comprarle', coste: 15000, fx: { alineamiento: -6 },
              tramaAvanza: { id: 'enemigo', a: 1, datos: { comprado: true } } },
            { t: 'No darle importancia', fx: { cordura: 4 },
              tramaAvanza: { id: 'enemigo', a: 1 } }
          ] };
      } },
      { espera: [5, 9], escena: function (g, t) {
        const n = t.datos.n || 'aquel al que humillaste';
        const como = t.datos.humillado ? 'Te odia más que antes y ahora tiene con qué.'
                   : t.datos.comprado ? 'Se quedó tu dinero y ahora tiene el suyo.'
                   : t.datos.hablasteis ? 'Sigue sin tragarte, pero ha aprendido a esperar.'
                   : 'Nunca supo que existías para ti. Tú sí que existes para él.';
        return { t: '<p><b>' + n + '</b> ha subido. Puesto, dinero, gente. ' + como + '</p>',
          c: [
            { t: 'Adelantarte y hundirle', fx: { notoriedad: 16, alineamiento: -16, intelecto: 10 },
              tramaAvanza: { id: 'enemigo', a: 2, datos: { guerra: true } } },
            { t: 'Buscar una tregua', fx: { carisma: 16 },
              tramaAvanza: { id: 'enemigo', a: 2, datos: { tregua: true } } },
            { t: 'Prepararte para lo que venga', fx: { intelecto: 10, fisico: 8, cordura: -4 },
              tramaAvanza: { id: 'enemigo', a: 2, datos: { listo: true } } },
            { t: 'Irte donde no llegue', mover: 'cerca', motivo: 'poniendo tierra de por medio',
              tramaAvanza: { id: 'enemigo', a: 2, datos: { huiste: true } } }
          ] };
      } },
      { espera: [6, 12], escena: function (g, t) {
        const n = t.datos.n || 'tu enemigo';
        const c = [];
        if (t.datos.tregua) {
          c.push({ t: 'Confiar en la tregua', fx: { cordura: 10 },
            tramaCierra: { id: 'enemigo', final: 'la tregua aguantó hasta el final' } });
        }
        c.push({ t: 'Enfrentarle', combate: { dif: 74, aMuerte: !!t.datos.guerra },
          tramaAvanza: { id: 'enemigo', a: 3, datos: { chocasteis: true } } });
        c.push({ t: 'Darle lo que quiere', fx: { creditos: -50000, reputacion: -14, cordura: 8 },
          tramaCierra: { id: 'enemigo', final: 'le diste lo que quería y te dejó vivir' } });
        c.push({ t: 'Destaparle en público', fx: { intelecto: 14, reputacion: 12, notoriedad: 12 },
          tramaAvanza: { id: 'enemigo', a: 3, datos: { destapado: true } } });
        return { t: '<p>Después de todos estos años, <b>' + n + '</b> hace su movimiento. Va a por lo que más te importa.</p>', c: c };
      } },
      { espera: [3, 7], escena: function (g, t) {
        const n = t.datos.n || 'él';
        return { t: '<p>Uno de los dos tiene que soltar. <b>' + n + '</b> ya está viejo y tú también.</p>',
          c: [
            { t: 'Terminarlo', combate: { dif: 66, duelo: true, aMuerte: true },
              tramaCierra: { id: 'enemigo', final: 'lo terminasteis de la única forma que sabíais' } },
            { t: 'Sentaros a hablar de una vez', fx: { cordura: 20, carisma: 14, alineamiento: 14 },
              tramaCierra: { id: 'enemigo', final: 'acabasteis hablando, cuarenta años tarde' } },
            { t: 'Dejar que gane', fx: { reputacion: -16, cordura: 12, alineamiento: 8 },
              tramaCierra: { id: 'enemigo', final: 'le dejaste ganar y respiraste' } },
            { t: 'Pasarle la cuenta a tus hijos', req: function (s) { return (s.contadores.hijos || 0) > 0; },
              fx: { alineamiento: -18, cordura: -10 },
              tramaCierra: { id: 'enemigo', final: 'lo heredaron los tuyos' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 3
     EL HIJO
     Crece, te mira, y acaba pareciéndose a lo que hiciste.
     ---------------------------------------------------------- */
  T.hijo = {
    n: 'El hijo que te mira', ico: '☖', min: 20, p: 0.85,
    resumen: 'Uno de tus hijos está aprendiendo de ti sin que se lo enseñes.',
    arranca: function (s) { return (s.contadores.hijos || 0) > 0; },
    primera: [3, 5],
    finalPorDefecto: 'Hizo su vida lejos.',
    etapas: [
      { espera: [4, 6], escena: function (g, t) {
        const rng = g.rng;
        t.datos.n = t.datos.n || SW.genNombreCompleto(rng, g.s.especie === 'humano' ? 'humano' : 'humano', rng.chance(0.5) ? 'm' : 'f').split(' ')[0];
        return { t: '<p><b>' + t.datos.n + '</b> tiene ocho años y te copia todo: cómo andas, cómo hablas, cómo tratas a la gente.</p>',
          c: [
            { t: 'Enseñarle a hacer las cosas bien', fx: { alineamiento: 12, cordura: 10 },
              tramaAvanza: { id: 'hijo', a: 1, datos: { via: 'recto' } } },
            { t: 'Enseñarle a buscarse la vida', fx: { intelecto: 8, carisma: 8 },
              tramaAvanza: { id: 'hijo', a: 1, datos: { via: 'listo' } } },
            { t: 'Enseñarle a pelear', fx: { fisico: 8 },
              tramaAvanza: { id: 'hijo', a: 1, datos: { via: 'duro' } } },
            { t: 'No estar mucho por casa', fx: { creditos: 10000, cordura: -8 },
              tramaAvanza: { id: 'hijo', a: 1, datos: { via: 'ausente' } } }
          ] };
      } },
      { espera: [5, 8], escena: function (g, t) {
        const n = t.datos.n, via = t.datos.via;
        const pinta = via === 'recto' ? 'Es honrado y eso aquí se paga caro.'
                    : via === 'listo' ? 'Ya sabe conseguir cosas sin pedirlas.'
                    : via === 'duro' ? 'Le han abierto la ceja dos veces y no se ha rajado.'
                    : 'Apenas le conoces y él a ti tampoco.';
        return { t: '<p><b>' + n + '</b> tiene dieciséis. ' + pinta + ' Y hoy te pide algo.</p>',
          c: [
            { t: 'Pagarle los estudios', coste: 20000, fx: { alineamiento: 12 },
              tramaAvanza: { id: 'hijo', a: 2, datos: { rumbo: 'estudia' } } },
            { t: 'Meterle en lo tuyo', fx: { carisma: 8 },
              tramaAvanza: { id: 'hijo', a: 2, datos: { rumbo: 'contigo' } } },
            { t: 'Decirle que se busque la vida', fx: { cordura: -6 },
              tramaAvanza: { id: 'hijo', a: 2, datos: { rumbo: 'solo' } } },
            { t: 'Preguntarle qué quiere él', fx: { carisma: 14, cordura: 12, alineamiento: 10 },
              tramaAvanza: { id: 'hijo', a: 2, datos: { rumbo: 'suyo' } } }
          ] };
      } },
      { espera: [6, 10], escena: function (g, t) {
        const n = t.datos.n;
        const c = [];
        if (t.datos.rumbo === 'contigo') {
          c.push({ t: 'Dejarle el negocio', fx: { cordura: 14, reputacion: 10 },
            tramaAvanza: { id: 'hijo', a: 3, datos: { heredero: true } } });
          c.push({ t: 'Mantenerle debajo', fx: { alineamiento: -12, cordura: -8 },
            tramaAvanza: { id: 'hijo', a: 3, datos: { resentido: true } } });
        }
        c.push({ t: 'Ayudarle con dinero', coste: 25000, fx: { alineamiento: 10 },
          tramaAvanza: { id: 'hijo', a: 3, datos: { apoyado: true } } });
        c.push({ t: 'Ayudarle con tiempo', fx: { cordura: 16, carisma: 10, alineamiento: 12 },
          tramaAvanza: { id: 'hijo', a: 3, datos: { cerca: true } } });
        c.push({ t: 'Que se apañe', fx: { cordura: -10 },
          tramaAvanza: { id: 'hijo', a: 3, datos: { lejos: true } } });
        return { t: '<p><b>' + n + '</b> se ha metido en un lío de adulto y viene a ti.</p>', c: c };
      } },
      { espera: [8, 14], escena: function (g, t) {
        const n = t.datos.n;
        const bien = t.datos.cerca || t.datos.apoyado || t.datos.heredero;
        return { t: '<p><b>' + n + '</b> ya tiene su vida. ' +
            (bien ? 'Viene a verte sin que se lo pidas.' : 'Hace años que no le ves y te has enterado por terceros de cómo le va.') + '</p>',
          c: [
            { t: 'Decirle lo que nunca le dijiste', fx: { cordura: 22, alineamiento: 12 },
              tramaCierra: { id: 'hijo', final: bien ? 'acabasteis bien' : 'llegasteis a tiempo por poco' } },
            { t: 'Dejarle todo lo que tienes', fx: { creditos: -40000, cordura: 14 },
              tramaCierra: { id: 'hijo', final: 'le dejaste todo lo que tenías' }, legado: 'lo dejó todo a su hijo' },
            { t: 'Pedirle perdón', fx: { cordura: 18, alineamiento: 14 },
              tramaCierra: { id: 'hijo', final: 'pediste perdón y te escuchó' } },
            { t: 'No decir nada, como siempre', fx: { cordura: -16 },
              tramaCierra: { id: 'hijo', final: 'nunca llegasteis a hablarlo' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 4
     EL NEGOCIO
     De un puesto en el mercado a algo con nombre propio.
     ---------------------------------------------------------- */
  T.negocio = {
    n: 'Tu propio nombre en una puerta', ico: '⌂', min: 18, p: 0.7,
    resumen: 'Lo que montaste puede crecer o comerte.',
    arranca: function (s) { return !!s.flags.tiene_local || !!s.flags.autonomo || !!s.flags.produce; },
    primera: [2, 4],
    finalPorDefecto: 'Se fue apagando.',
    etapas: [
      { espera: [3, 5], escena: function (g, t) {
        return { t: '<p>Lo tuyo funciona lo justo para seguir abierto. Hay que decidir hacia dónde.</p>',
          c: [
            { t: 'Crecer deprisa pidiendo dinero', fx: { creditos: 30000 }, flag: 'debe_a_usureros',
              tramaAvanza: { id: 'negocio', a: 1, datos: { via: 'deuda' } } },
            { t: 'Crecer despacio con lo que hay', fx: { creditos: 6000, cordura: 8 },
              tramaAvanza: { id: 'negocio', a: 1, datos: { via: 'lento' } } },
            { t: 'Especializarte en algo caro', fx: { intelecto: 12, creditos: -8000 },
              tramaAvanza: { id: 'negocio', a: 1, datos: { via: 'nicho' } } },
            { t: 'Meter a un socio con dinero', fx: { creditos: 25000, carisma: 8 },
              tramaAvanza: { id: 'negocio', a: 1, datos: { via: 'socio' } } }
          ] };
      } },
      { espera: [4, 7], escena: function (g, t) {
        const v = t.datos.via;
        const cab = v === 'deuda' ? 'Creces rápido y el interés crece más rápido todavía.'
                  : v === 'socio' ? 'Tu socio ha empezado a tomar decisiones sin ti.'
                  : v === 'nicho' ? 'Te has hecho un nombre en algo muy concreto y muy bien pagado.'
                  : 'Va lento, pero es tuyo entero.';
        return { t: '<p>' + cab + ' Y ahora aparece alguien grande que quiere comprarte.</p>',
          c: [
            { t: 'Vender y retirarte', fx: { creditos: 90000, cordura: 10 },
              tramaCierra: { id: 'negocio', final: 'vendiste bien y te retiraste' } },
            { t: 'Negarte y competir', fx: { intelecto: 12, cordura: -10 },
              tramaAvanza: { id: 'negocio', a: 2, datos: { guerra: true } } },
            { t: 'Venderles una parte', fx: { creditos: 45000 },
              tramaAvanza: { id: 'negocio', a: 2, datos: { compartido: true } } },
            { t: 'Comprarles tú algo a ellos', req: function (s) { return s.stats.creditos > 60000; },
              coste: 60000, fx: { carisma: 12, reputacion: 10 },
              tramaAvanza: { id: 'negocio', a: 2, datos: { ambicion: true } } }
          ] };
      } },
      { espera: [5, 9], escena: function (g, t) {
        return { t: '<p>Empleas a gente. Hay familias que comen de esto. Y hay un año malo.</p>',
          c: [
            { t: 'Poner tu dinero para no despedir a nadie', coste: 40000,
              fx: { alineamiento: 22, reputacion: 20 },
              tramaAvanza: { id: 'negocio', a: 3, datos: { querido: true } } },
            { t: 'Recortar y aguantar', fx: { creditos: 15000, alineamiento: -10, reputacion: -8 },
              tramaAvanza: { id: 'negocio', a: 3, datos: { duro: true } } },
            { t: 'Cambiar de negocio entero', fx: { intelecto: 14, creditos: -20000 },
              tramaAvanza: { id: 'negocio', a: 3, datos: { pivote: true } } },
            { t: 'Cerrar mientras se pueda cerrar bien', fx: { creditos: 20000, cordura: 12 },
              tramaCierra: { id: 'negocio', final: 'cerraste a tiempo y sin deber nada' } }
          ] };
      } },
      { espera: [8, 15], escena: function (g, t) {
        const q = t.datos.querido;
        return { t: '<p>Ya eres viejo y esto te sobrevive. Toca decidir de quién es cuando tú no estés.</p>',
          c: [
            { t: 'Dejárselo a tus hijos', req: function (s) { return (s.contadores.hijos || 0) > 0; },
              fx: { cordura: 14 }, legado: 'dejó el negocio a los suyos',
              tramaCierra: { id: 'negocio', final: 'quedó en la familia' } },
            { t: 'Dejárselo a los que trabajan ahí', fx: { alineamiento: 26, reputacion: 24, cordura: 18 },
              legado: 'dejó su negocio a quienes lo levantaron',
              tramaCierra: { id: 'negocio', final: 'lo heredaron los que lo levantaron contigo' } },
            { t: 'Venderlo al mejor postor', fx: { creditos: 140000 },
              tramaCierra: { id: 'negocio', final: 'lo vendiste al mejor postor' } },
            { t: 'Que se muera contigo', fx: { cordura: -10, creditos: 20000 },
              tramaCierra: { id: 'negocio', final: (q ? 'lo cerraste y dolió a mucha gente' : 'lo cerraste y no lo notó nadie') } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 5
     EL SECRETO
     Ser sensible a la Fuerza cuando eso te mata.
     ---------------------------------------------------------- */
  T.secreto = {
    n: 'Lo que no puedes contar', ico: '◍', min: 8, p: 0.85,
    resumen: 'Sabes hacer algo por lo que te matarían.',
    arranca: function (s) {
      return s.sensible && s.trabajo !== 'jedi' && s.trabajo !== 'sith' &&
             (s.era === 'imperio_temprano' || s.era === 'rebelion' || s.era === 'primera_orden');
    },
    primera: [2, 4],
    finalPorDefecto: 'Te lo llevaste a la tumba.',
    etapas: [
      { espera: [3, 6], escena: function (g, t) {
        return { t: '<p>Se te ha escapado delante de alguien. Un vaso que no se cayó, una puerta que se abrió sola.</p>',
          c: [
            { t: 'Reírte y cambiar de tema', fx: { carisma: 10 },
              tramaAvanza: { id: 'secreto', a: 1, datos: { disimulaste: true } } },
            { t: 'Borrárselo de la cabeza', fx: { fuerza: 8, alineamiento: -12, cordura: -6 },
              tramaAvanza: { id: 'secreto', a: 1, datos: { borraste: true } } },
            { t: 'Contárselo de verdad', fx: { cordura: 14 },
              tramaAvanza: { id: 'secreto', a: 1, datos: { confiaste: true } },
              rel: { tipo: 'confidente', afecto: 50 } },
            { t: 'Marcharte de ese sitio hoy', mover: 'cerca', motivo: 'antes de que hablaran',
              tramaAvanza: { id: 'secreto', a: 1, datos: { huiste: true } } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        const cab = t.datos.confiaste ? 'La persona a la que se lo contaste ha empezado a hablar más de la cuenta.'
                  : t.datos.borraste ? 'Aquello que borraste ha vuelto a la cabeza de alguien en trozos.'
                  : 'Alguien lleva semanas haciendo preguntas por el barrio.';
        return { t: '<p>' + cab + '</p>',
          c: [
            { t: 'Cortar tu conexión del todo', fx: { fuerza: -18, cordura: -10, notoriedad: -14 },
              tramaAvanza: { id: 'secreto', a: 2, datos: { cortaste: true } } },
            { t: 'Buscar a otros como tú', fx: { fuerza: 10, cordura: 10 }, buscado: 14,
              tramaAvanza: { id: 'secreto', a: 2, datos: { red: true } } },
            { t: 'Quitar de en medio a quien pregunta', fx: { alineamiento: -24, notoriedad: 12 },
              tramaAvanza: { id: 'secreto', a: 2, datos: { manchado: true } } },
            { t: 'Entregarte y negociar', fx: { alineamiento: -14, creditos: 20000 },
              tramaAvanza: { id: 'secreto', a: 3, datos: { colaboras: true } } }
          ] };
      } },
      { espera: [5, 10], escena: function (g, t) {
        const c = [];
        if (t.datos.red) {
          c.push({ t: 'Sacar a los tuyos del planeta', fx: { alineamiento: 24, reputacion: 12, creditos: -25000 },
            tramaAvanza: { id: 'secreto', a: 3, datos: { salvaste: true } } });
        }
        c.push({ t: 'Plantar cara a quien viene', combate: { dif: 80, duelo: true, sable: false },
          tramaAvanza: { id: 'secreto', a: 3, datos: { peleaste: true } } });
        c.push({ t: 'Cambiar de nombre y de cara', coste: 25000, fx: { notoriedad: -30, cordura: -8 },
          tramaAvanza: { id: 'secreto', a: 3, datos: { otro: true } } });
        c.push({ t: 'Usar lo que sabes hacer, por una vez, delante de todos',
          fx: { fuerza: 16, reputacion: 20, notoriedad: 30 }, buscado: 40,
          tramaAvanza: { id: 'secreto', a: 3, datos: { publico: true } } });
        return { t: '<p>Han venido a por ti. Esta vez con nombre y apellidos, y con orden.</p>', c: c };
      } },
      { espera: [6, 14], escena: function (g, t) {
        return { t: '<p>Han pasado los años y sigues aquí. Y ahora hay un crío en el barrio que mueve cosas sin tocarlas.</p>',
          c: [
            { t: 'Enseñarle a esconderlo', fx: { alineamiento: 14, cordura: 12, fuerza: 6 },
              tramaCierra: { id: 'secreto', final: 'enseñaste a otro a sobrevivir con lo mismo' } },
            { t: 'Enseñarle a usarlo', fx: { fuerza: 14, alineamiento: 16 }, buscado: 20,
              tramaCierra: { id: 'secreto', final: 'pasaste lo que sabías, con todo el riesgo' } },
            { t: 'Sacarle del planeta y no volver a saber', fx: { alineamiento: 18, creditos: -20000, cordura: 10 },
              tramaCierra: { id: 'secreto', final: 'le pusiste a salvo y nunca supiste el resto' } },
            { t: 'No meterte', fx: { cordura: -16, alineamiento: -12 },
              tramaCierra: { id: 'secreto', final: 'no hiciste nada y lo sabes' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 6
     LA PROMESA
     Alguien se muere y te pide una cosa. Tarda una vida.
     ---------------------------------------------------------- */
  T.promesa = {
    n: 'La promesa', ico: '✎', min: 16, p: 0.5,
    resumen: 'Le dijiste que sí a alguien que ya no puede reclamártelo.',
    arranca: function (s) {
      return (s.relacionesPasadas || []).length > 0 || (s.contadores.batallas || 0) > 0;
    },
    primera: [1, 3],
    finalPorDefecto: 'Se te fue quedando en el cajón.',
    etapas: [
      { espera: [2, 4], escena: function (g, t) {
        const rng = g.rng;
        t.datos.quien = t.datos.quien || SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'rodiano']), rng.chance(0.5) ? 'm' : 'f');
        t.datos.que = t.datos.que || rng.pick([
          'que encuentres a su hermana', 'que le lleves una carta a su madre',
          'que le devuelvas una cosa a su dueño', 'que no dejes que se olvide su nombre',
          'que cuides de alguien que no conoce a nadie', 'que termines lo que él empezó'
        ]);
        t.datos.donde = t.datos.donde || (SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, g.s.mundo) : 'otro sistema');
        return { t: '<p><b>' + t.datos.quien + '</b> se muere y te pide una cosa: ' + t.datos.que + '. Es en ' + t.datos.donde + '.</p>',
          c: [
            { t: 'Prometérselo y decirlo en serio', fx: { alineamiento: 14, cordura: 8 },
              tramaAvanza: { id: 'promesa', a: 1, datos: { enSerio: true } } },
            { t: 'Prometérselo para que descanse', fx: { cordura: 4 },
              tramaAvanza: { id: 'promesa', a: 1 } },
            { t: 'Decirle la verdad: que no vas a poder', fx: { cordura: -8, alineamiento: 6 },
              tramaCierra: { id: 'promesa', final: 'al menos no le mentiste' } },
            { t: 'Ir hoy mismo', mueveA: t.datos.donde, motivo: 'a cumplir una promesa',
              fx: { alineamiento: 18, creditos: -8000 },
              tramaAvanza: { id: 'promesa', a: 2, datos: { enSerio: true, corriendo: true } } }
          ] };
      } },
      { espera: [5, 12], escena: function (g, t) {
        const años = g.s.edad - t.desde;
        return { t: '<p>Han pasado ' + años + ' años. Lo de ' + t.datos.quien + ' sigue sin hacerse. Hoy te has acordado otra vez.</p>',
          c: [
            { t: 'Dejar todo e ir a ' + t.datos.donde, mueveA: t.datos.donde, motivo: 'a cumplir una promesa vieja',
              fx: { cordura: 10, creditos: -10000 },
              tramaAvanza: { id: 'promesa', a: 2 } },
            { t: 'Pagar a alguien para que lo haga', coste: 18000, fx: { cordura: 4, alineamiento: 4 },
              tramaAvanza: { id: 'promesa', a: 3, datos: { delegado: true } } },
            { t: 'Otro año más', fx: { cordura: -8 },
              tramaAvanza: { id: 'promesa', a: 1 } },
            { t: 'Aceptar que no lo vas a hacer', fx: { cordura: -14, alineamiento: -8 },
              tramaCierra: { id: 'promesa', final: 'nunca la cumpliste' } }
          ] };
      } },
      { espera: [1, 2], escena: function (g, t) {
        return { t: '<p>Estás en ' + t.datos.donde + '. Y resulta que la cosa no es tan simple como te la contaron.</p>',
          c: [
            { t: 'Llegar hasta el final cueste lo que cueste', fx: { alineamiento: 20, cordura: 16, salud: -10 },
              tramaAvanza: { id: 'promesa', a: 3, datos: { cumplida: true } } },
            { t: 'Hacer la versión fácil', fx: { cordura: 6 },
              tramaAvanza: { id: 'promesa', a: 3, datos: { media: true } } },
            { t: 'Descubrir por qué te lo pidió a ti', fx: { intelecto: 14, cordura: -8 },
              tramaAvanza: { id: 'promesa', a: 3, datos: { verdad: true } } },
            { t: 'Volverte', fx: { cordura: -12 },
              tramaCierra: { id: 'promesa', final: 'llegaste hasta la puerta y no llamaste' } }
          ] };
      } },
      { espera: [3, 8], escena: function (g, t) {
        const cab = t.datos.cumplida ? 'Está hecho. Y ahora hay alguien que te debe a ti lo que tú debías.'
                  : t.datos.verdad ? 'Sabes por qué te eligió a ti, y no te gusta la respuesta.'
                  : t.datos.delegado ? 'Te llega la confirmación de que se hizo. No estabas tú.'
                  : 'Se hizo, más o menos.';
        return { t: '<p>' + cab + '</p>',
          c: [
            { t: 'Cerrar el círculo y soltarlo', fx: { cordura: 22, alineamiento: 12 },
              tramaCierra: { id: 'promesa', final: 'la cumpliste y te quitaste un peso' } },
            { t: 'Quedarte con quien encontraste', fx: { cordura: 14 }, rel: { tipo: 'amigo', afecto: 55 },
              tramaCierra: { id: 'promesa', final: 'de aquella promesa te quedó alguien' } },
            { t: 'Pedir tú otra promesa a alguien', fx: { cordura: 10, carisma: 8 },
              tramaCierra: { id: 'promesa', final: 'pasaste la cadena a otro' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 7
     LA ENFERMEDAD LARGA
     ---------------------------------------------------------- */
  T.enfermedad = {
    n: 'Lo que llevas dentro', ico: '✚', min: 32, p: 0.5,
    resumen: 'Algo del cuerpo que no se cura, solo se lleva.',
    arranca: function (s) { return !!s.flags.cronica || (s.stats.salud < 38 && s.edadBio > 42); },
    primera: [1, 3],
    finalPorDefecto: 'Aprendiste a vivir con ello.',
    etapas: [
      { espera: [2, 4], escena: function (g, t) {
        return { t: '<p>Ya tiene nombre. El médico habla despacio y usa la palabra "crónico".</p>',
          c: [
            { t: 'Tratamiento caro y constante', coste: 20000, fx: { salud: 18 },
              tramaAvanza: { id: 'enfermedad', a: 1, datos: { tratas: true } } },
            { t: 'Cambiar de vida entera', fx: { salud: 14, cordura: 12, creditos: -10000 },
              tramaAvanza: { id: 'enfermedad', a: 1, datos: { cambio: true } } },
            { t: 'Seguir como si nada', fx: { salud: -12, cordura: 6 },
              tramaAvanza: { id: 'enfermedad', a: 1, datos: { niegas: true } } },
            { t: 'Buscar algo que no sea medicina', fx: { creditos: -12000, cordura: 8 },
              tramaAvanza: { id: 'enfermedad', a: 1, datos: { alternativa: true } } }
          ] };
      } },
      { espera: [4, 7], escena: function (g, t) {
        return { t: '<p>Un brote malo. Dos meses sin poder trabajar y las facturas siguen llegando.</p>',
          c: [
            { t: 'Aguantar y volver', fx: { salud: -8, fisico: -6, cordura: 8 },
              tramaAvanza: { id: 'enfermedad', a: 2 } },
            { t: 'Vender lo que haga falta', fx: { creditos: -30000, salud: 16 },
              tramaAvanza: { id: 'enfermedad', a: 2, datos: { vendiste: true } } },
            { t: 'Pedir ayuda a los tuyos', fx: { salud: 10, cordura: 12, alineamiento: 4 },
              tramaAvanza: { id: 'enfermedad', a: 2, datos: { arropado: true } } },
            { t: 'Cibernética para lo que ya no funciona', coste: 30000, fx: { fisico: 14, salud: 8 },
              cibernetica: 'sustitución interna', tramaAvanza: { id: 'enfermedad', a: 2, datos: { ciber: true } } }
          ] };
      } },
      { espera: [5, 10], escena: function (g, t) {
        return { t: '<p>Te dan una estimación. No es una sentencia, pero se le parece.</p>',
          c: [
            { t: 'Hacer todo lo que no has hecho', fx: { cordura: 24, creditos: -25000, salud: -6 },
              tramaCierra: { id: 'enfermedad', final: 'lo aprovechaste todo' } },
            { t: 'Poner tus asuntos en orden', fx: { cordura: 16, alineamiento: 12 },
              legado: 'dejó todo atado', tramaCierra: { id: 'enfermedad', final: 'lo dejaste todo en orden' } },
            { t: 'Pelearlo hasta el final', fx: { salud: 12, cordura: -8, creditos: -40000 },
              tramaCierra: { id: 'enfermedad', final: 'lo peleaste año a año' } },
            { t: 'No decírselo a nadie', fx: { cordura: -18 },
              tramaCierra: { id: 'enfermedad', final: 'lo llevaste solo' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 8
     EL CULTO
     Alguien decide que tú eres una señal.
     ---------------------------------------------------------- */
  T.culto = {
    n: 'La gente que cree en ti', ico: '☉', min: 20, p: 0.45,
    resumen: 'Unos cuantos han decidido que eres algo que no eres.',
    arranca: function (s) {
      return s.stats.reputacion > 55 || (s.sensible && s.stats.fuerza > 45) || (s.contadores.duelos || 0) > 2;
    },
    primera: [2, 5],
    finalPorDefecto: 'Se cansaron y se fueron con otro.',
    etapas: [
      { espera: [3, 5], escena: function (g, t) {
        return { t: '<p>Hay un grupito que te espera a la salida. Han pintado tu cara en una pared y le rezan.</p>',
          c: [
            { t: 'Decirles que se vayan a casa', fx: { cordura: 8, alineamiento: 10 },
              tramaAvanza: { id: 'culto', a: 1, datos: { rechazo: true } } },
            { t: 'Escucharles', fx: { carisma: 10, cordura: -4 },
              tramaAvanza: { id: 'culto', a: 1, datos: { escuchas: true } } },
            { t: 'Aprovecharlo', fx: { creditos: 20000, carisma: 12, alineamiento: -16 },
              tramaAvanza: { id: 'culto', a: 1, datos: { usas: true } } },
            { t: 'Enseñarles algo útil de verdad', fx: { alineamiento: 16, carisma: 14, reputacion: 10 },
              tramaAvanza: { id: 'culto', a: 1, datos: { escuela: true } } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        const cab = t.datos.rechazo ? 'Los echaste y volvieron más, porque negarlo es lo que haría un elegido de verdad.'
                  : t.datos.usas ? 'Son cuatrocientos y te mantienen sin trabajar.'
                  : t.datos.escuela ? 'Ya no rezan: aprenden. Y son muchos.'
                  : 'Son más y tienen normas que tú no has escrito.';
        return { t: '<p>' + cab + ' Alguien de dentro empieza a hablar en tu nombre.</p>',
          c: [
            { t: 'Ponerte tú al mando', fx: { carisma: 16, reputacion: 12, cordura: -8 },
              tramaAvanza: { id: 'culto', a: 2, datos: { mandas: true } } },
            { t: 'Dejar que lo lleve él', fx: { cordura: 6 },
              tramaAvanza: { id: 'culto', a: 2, datos: { delegas: true } } },
            { t: 'Disolverlo', fx: { alineamiento: 16, reputacion: -10, cordura: 10 },
              tramaAvanza: { id: 'culto', a: 3, datos: { disuelto: true } } },
            { t: 'Marcharte lejos y en silencio', mover: 'cerca', motivo: 'para que te olvidaran',
              tramaAvanza: { id: 'culto', a: 2, datos: { huiste: true } } }
          ] };
      } },
      { espera: [5, 10], escena: function (g, t) {
        return { t: '<p>Han hecho algo grave en tu nombre. Hay gente herida y tu cara en todas partes.</p>',
          c: [
            { t: 'Dar la cara y asumirlo', fx: { alineamiento: 20, reputacion: -12, cordura: 12 },
              tramaAvanza: { id: 'culto', a: 3, datos: { asumiste: true } } },
            { t: 'Negar que tengas nada que ver', fx: { alineamiento: -12, cordura: -10 },
              tramaAvanza: { id: 'culto', a: 3, datos: { negaste: true } } },
            { t: 'Entregar a los responsables', fx: { alineamiento: 14, reputacion: 8 },
              tramaAvanza: { id: 'culto', a: 3, datos: { entregaste: true } } },
            { t: 'Usarlo para tomar el poder aquí', fx: { notoriedad: 26, alineamiento: -24, creditos: 40000 },
              tramaAvanza: { id: 'culto', a: 3, datos: { poder: true } } }
          ] };
      } },
      { espera: [6, 14], escena: function (g, t) {
        return { t: '<p>Sigue existiendo. Ya no depende de ti y va a durar más que tú.</p>',
          c: [
            { t: 'Dejar por escrito lo que de verdad piensas', fx: { cordura: 18, intelecto: 12 },
              legado: 'dejó escrito lo que pensaba de verdad',
              tramaCierra: { id: 'culto', final: 'dejaste tu versión por escrito' } },
            { t: 'Nombrar sucesor y desaparecer', fx: { cordura: 12 },
              tramaCierra: { id: 'culto', final: 'nombraste a otro y te fuiste' } },
            { t: 'Reventarlo desde dentro', fx: { alineamiento: 16, cordura: -12, notoriedad: 14 },
              tramaCierra: { id: 'culto', final: 'lo desmontaste tú mismo' } },
            { t: 'Dejar que sea lo que quiera ser', fx: { cordura: 6 },
              tramaCierra: { id: 'culto', final: 'siguió sin ti, para bien y para mal' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 9
     LA CASA
     El sitio del que vienes y al que a lo mejor vuelves.
     ---------------------------------------------------------- */
  T.casa = {
    n: 'La casa de donde vienes', ico: '⌂', min: 18, p: 0.55,
    resumen: 'Tu mundo natal sigue ahí y sigue teniendo tu nombre.',
    arranca: function (s) { return s.mundo !== s.mundoNatal && s.edadBio > 20; },
    primera: [3, 7],
    finalPorDefecto: 'Dejaste de pensar en ello.',
    etapas: [
      { espera: [4, 8], escena: function (g, t) {
        return { t: '<p>Te llega noticia de tu mundo natal. Las cosas allí no van bien.</p>',
          c: [
            { t: 'Mandar dinero', fx: { creditos: -15000, alineamiento: 12 },
              tramaAvanza: { id: 'casa', a: 1, datos: { dinero: true } } },
            { t: 'Volver a ver qué pasa', mover: 'casa', motivo: 'a ver qué queda',
              fx: { cordura: 8 }, tramaAvanza: { id: 'casa', a: 1, datos: { volviste: true } } },
            { t: 'Traerte a alguien contigo', fx: { creditos: -8000, cordura: 10 },
              rel: { tipo: 'familia', afecto: 45 },
              tramaAvanza: { id: 'casa', a: 1, datos: { trajiste: true } } },
            { t: 'No es tu problema desde hace años', fx: { cordura: -10, alineamiento: -8 },
              tramaAvanza: { id: 'casa', a: 1, datos: { pasaste: true } } }
          ] };
      } },
      { espera: [5, 10], escena: function (g, t) {
        return { t: '<p>La casa donde creciste está en venta o en ruinas, según a quién preguntes.</p>',
          c: [
            { t: 'Comprarla', coste: 35000, fx: { cordura: 18 }, flag: 'casa_propia',
              tramaAvanza: { id: 'casa', a: 2, datos: { compraste: true } } },
            { t: 'Comprarla y darla al pueblo', coste: 35000, fx: { alineamiento: 22, reputacion: 20 },
              tramaAvanza: { id: 'casa', a: 2, datos: { donaste: true } } },
            { t: 'Ir a verla una última vez', mover: 'casa', motivo: 'a despedirte de una casa',
              fx: { cordura: 12 }, tramaAvanza: { id: 'casa', a: 2, datos: { despediste: true } } },
            { t: 'Dejar que se caiga', fx: { cordura: -8 },
              tramaAvanza: { id: 'casa', a: 2 } }
          ] };
      } },
      { espera: [8, 16], escena: function (g, t) {
        return { t: '<p>Ya eres mayor. Allí queda gente que te recuerda de crío y aquí no queda casi nadie.</p>',
          c: [
            { t: 'Volver para quedarte', mover: 'casa', motivo: 'a terminar donde empezaste',
              fx: { cordura: 24, salud: 6 },
              tramaCierra: { id: 'casa', final: 'volviste a morir donde naciste' } },
            { t: 'Dejar allí lo que tengas', fx: { creditos: -40000, alineamiento: 20, reputacion: 16 },
              legado: 'dejó lo suyo en su mundo natal',
              tramaCierra: { id: 'casa', final: 'lo tuyo se quedó allí aunque tú no' } },
            { t: 'Mandar que te entierren allí', fx: { cordura: 12 },
              tramaCierra: { id: 'casa', final: 'pediste que te llevaran de vuelta' } },
            { t: 'Ese sitio ya no existe para ti', fx: { cordura: -10 },
              tramaCierra: { id: 'casa', final: 'cortaste del todo' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 10
     EL APRENDIZ
     Alguien aprende de ti. Y un día sabe más.
     ---------------------------------------------------------- */
  T.aprendiz = {
    n: 'El que aprendió de ti', ico: '⚘', min: 24, p: 0.6,
    resumen: 'Le enseñaste. Ahora tiene vida propia.',
    arranca: function (s) {
      return (s.relaciones || []).some(function (r) { return r.tipo === 'aprendiz'; }) ||
             !!s.aprendizSith || (s.contadores.misionesJedi || 0) > 3;
    },
    primera: [2, 4],
    finalPorDefecto: 'Se perdió de vista.',
    etapas: [
      { espera: [3, 6], escena: function (g, t) {
        const rng = g.rng;
        t.datos.n = t.datos.n || ((g.s.aprendizSith && g.s.aprendizSith.n) ||
          SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak']), rng.chance(0.5) ? 'm' : 'f'));
        return { t: '<p><b>' + t.datos.n + '</b> ya hace las cosas casi tan bien como tú. Y quiere hacerlas a su manera.</p>',
          c: [
            { t: 'Dejarle probar', fx: { carisma: 10, alineamiento: 8 },
              tramaAvanza: { id: 'aprendiz', a: 1, datos: { libre: true } } },
            { t: 'Corregirle en público', fx: { reputacion: 4, alineamiento: -8 },
              tramaAvanza: { id: 'aprendiz', a: 1, datos: { humillado: true } } },
            { t: 'Enseñarle lo que te guardabas', fx: { carisma: 14, cordura: 8 },
              tramaAvanza: { id: 'aprendiz', a: 1, datos: { todo: true } } },
            { t: 'Frenarle', fx: { alineamiento: -12, cordura: -6 },
              tramaAvanza: { id: 'aprendiz', a: 1, datos: { frenado: true } } }
          ] };
      } },
      { espera: [5, 9], escena: function (g, t) {
        const n = t.datos.n;
        const cab = t.datos.humillado || t.datos.frenado
          ? '<b>' + n + '</b> se ha ido por su cuenta y no ha dejado nota.'
          : '<b>' + n + '</b> ha hecho algo grande y todo el mundo sabe quién le enseñó.';
        return { t: '<p>' + cab + '</p>',
          c: [
            { t: 'Alegrarte de verdad', fx: { cordura: 16, alineamiento: 12 },
              tramaAvanza: { id: 'aprendiz', a: 2, datos: { orgullo: true } } },
            { t: 'Reclamar tu parte del mérito', fx: { reputacion: 10, alineamiento: -10 },
              tramaAvanza: { id: 'aprendiz', a: 2, datos: { celos: true } } },
            { t: 'Buscarle y hacer las paces', fx: { carisma: 14, cordura: 12 },
              tramaAvanza: { id: 'aprendiz', a: 2, datos: { paces: true } } },
            { t: 'Competir con él', fx: { intelecto: 10, fisico: 6, cordura: -8 },
              tramaAvanza: { id: 'aprendiz', a: 2, datos: { rivales: true } } }
          ] };
      } },
      { espera: [6, 14], escena: function (g, t) {
        const n = t.datos.n;
        const c = [];
        if (t.datos.celos || t.datos.rivales || t.datos.humillado) {
          c.push({ t: 'Enfrentarte a él', combate: { dif: 78, duelo: true, sable: !!g.s.sable },
            tramaAvanza: { id: 'aprendiz', a: 3, datos: { chocasteis: true } } });
        }
        c.push({ t: 'Pedirle que te ayude ahora que no puedes solo', fx: { cordura: 18, alineamiento: 10 },
          tramaCierra: { id: 'aprendiz', final: 'acabó cuidando de ti' } });
        c.push({ t: 'Darle lo último que te queda por enseñar', fx: { cordura: 20, carisma: 12 },
          legado: 'lo que sabía se lo quedó otro',
          tramaCierra: { id: 'aprendiz', final: 'le diste lo último que sabías' } });
        c.push({ t: 'Dejarle en paz de una vez', fx: { cordura: 10 },
          tramaCierra: { id: 'aprendiz', final: 'le dejaste hacer su vida' } });
        return { t: '<p>Eres viejo y <b>' + n + '</b> está en su mejor momento.</p>', c: c };
      } },
      { espera: [2, 5], escena: function (g, t) {
        return { t: '<p>Después de aquello, uno de los dos tiene que decir algo.</p>',
          c: [
            { t: 'Perdonarle', fx: { cordura: 20, alineamiento: 16 },
              tramaCierra: { id: 'aprendiz', final: 'os perdonasteis tarde' } },
            { t: 'No perdonarle', fx: { cordura: -14 },
              tramaCierra: { id: 'aprendiz', final: 'nunca os perdonasteis' } },
            { t: 'Acabar lo que empezasteis', combate: { dif: 82, duelo: true, aMuerte: true },
              tramaCierra: { id: 'aprendiz', final: 'acabó como tenía que acabar' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 11
     LA RELIQUIA
     Un objeto que llevas encima y que no te deja en paz.
     ---------------------------------------------------------- */
  T.reliquia = {
    n: 'Lo que llevas encima', ico: '◈', min: 14, p: 0.5,
    resumen: 'Un objeto que arrastras y que otros quieren.',
    arranca: function (s) {
      return (s.objetos || []).length > 2 || !!s.flags.carta_vieja || !!s.kyber;
    },
    primera: [2, 5],
    finalPorDefecto: 'Se perdió en alguna mudanza.',
    etapas: [
      { espera: [3, 6], escena: function (g, t) {
        const rng = g.rng;
        t.datos.obj = t.datos.obj || rng.pick([
          'una placa de metal con inscripciones que nadie sabe leer',
          'un cilindro sellado que zumba de noche',
          'un anillo con el sello de una casa que ya no existe',
          'un cuaderno lleno de rutas que no llevan a ningún sitio conocido',
          'una figura de piedra que pesa más de lo que debería'
        ]);
        return { t: '<p>Tienes ' + t.datos.obj + '. Hoy alguien te ha ofrecido dinero por ello sin que lo enseñaras.</p>',
          c: [
            { t: 'Venderlo', fx: { creditos: 25000 },
              tramaAvanza: { id: 'reliquia', a: 2, datos: { vendido: true } } },
            { t: 'Guardarlo mejor', fx: { intelecto: 6, cordura: -4 },
              tramaAvanza: { id: 'reliquia', a: 1, datos: { guardado: true } } },
            { t: 'Averiguar qué es', fx: { intelecto: 14 },
              tramaAvanza: { id: 'reliquia', a: 1, datos: { investigas: true } } },
            { t: 'Preguntar cómo sabía él que lo tenías', fx: { intelecto: 10, cordura: -8 },
              tramaAvanza: { id: 'reliquia', a: 1, datos: { sospechas: true } } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        return { t: '<p>Han entrado en tu casa y no se han llevado nada de valor. Buscaban una cosa concreta.</p>',
          c: [
            { t: 'Esconderlo donde nadie mire', fx: { intelecto: 10, cordura: -6 },
              tramaAvanza: { id: 'reliquia', a: 2, datos: { escondido: true } } },
            { t: 'Llevarlo siempre encima', fx: { cordura: -10, destreza: 6 },
              tramaAvanza: { id: 'reliquia', a: 2, datos: { encima: true } } },
            { t: 'Dárselo a alguien de confianza', fx: { cordura: 6 },
              tramaAvanza: { id: 'reliquia', a: 2, datos: { cedido: true } } },
            { t: 'Ponerlo de cebo y esperarles', combate: { dif: 60 },
              tramaAvanza: { id: 'reliquia', a: 2, datos: { emboscada: true } } }
          ] };
      } },
      { espera: [5, 12], escena: function (g, t) {
        const c = [];
        if (t.datos.vendido) {
          c.push({ t: 'Recuperarlo como sea', fx: { creditos: -40000, cordura: 10 },
            tramaAvanza: { id: 'reliquia', a: 3, datos: { recuperado: true } } });
          c.push({ t: 'Alegrarte de haberlo soltado', fx: { cordura: 12 },
            tramaCierra: { id: 'reliquia', final: 'lo vendiste y fue lo mejor que hiciste' } });
        }
        c.push({ t: 'Descubrir de una vez para qué sirve', fx: { intelecto: 16, fuerza: 6, cordura: -10 },
          tramaAvanza: { id: 'reliquia', a: 3, datos: { sabes: true } } });
        c.push({ t: 'Destruirlo', fx: { cordura: 16, alineamiento: 10 },
          tramaCierra: { id: 'reliquia', final: 'lo destruiste y dormiste mejor' } });
        c.push({ t: 'Entregarlo a quien lo estudie bien', fx: { reputacion: 12, alineamiento: 14 },
          tramaCierra: { id: 'reliquia', final: 'lo pusiste en buenas manos' } });
        return { t: '<p>Sea lo que sea, lleva años marcando tu vida y ya no puedes hacer como que no.</p>', c: c };
      } },
      { espera: [4, 10], escena: function (g, t) {
        return { t: '<p>Ya sabes lo que tienes. Y sabes lo que puede hacer si va a las manos equivocadas.</p>',
          c: [
            { t: 'Usarlo', fx: { fuerza: 18, creditos: 40000, alineamiento: -16, cordura: -12 },
              tramaCierra: { id: 'reliquia', final: 'lo usaste y te cambió' } },
            { t: 'Esconderlo donde no lo encuentre nadie nunca', fx: { cordura: 14, alineamiento: 16 },
              legado: 'escondió algo que era mejor que siguiera escondido',
              tramaCierra: { id: 'reliquia', final: 'lo enterraste tú mismo' } },
            { t: 'Dejarlo a alguien con instrucciones', fx: { cordura: 10, carisma: 8 },
              tramaCierra: { id: 'reliquia', final: 'lo pasaste con una advertencia' } },
            { t: 'Destruirlo aunque cueste', fx: { salud: -20, cordura: 20, alineamiento: 20 },
              tramaCierra: { id: 'reliquia', final: 'te costó salud, pero lo destruiste' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 12
     EL NOMBRE
     Un clon que decide quién es.
     ---------------------------------------------------------- */
  T.nombre = {
    n: 'Un nombre que sea tuyo', ico: '✧', min: 8, p: 0.9,
    resumen: 'Naciste con un número y estás decidiendo qué eres.',
    arranca: function (s) { return s.especie === 'clon' || s.especie === 'clon_nulo'; },
    primera: [1, 3],
    finalPorDefecto: 'Te quedaste con el número.',
    etapas: [
      { espera: [2, 4], escena: function (g, t) {
        return { t: '<p>Tus hermanos de lote se están poniendo nombres. Algunos por una cicatriz, otros por una manía.</p>',
          c: [
            { t: 'Ponerte uno tú', fx: { cordura: 14, carisma: 8 },
              tramaAvanza: { id: 'nombre', a: 1, datos: { tuyo: true } } },
            { t: 'Dejar que te lo pongan ellos', fx: { cordura: 10, carisma: 10 },
              tramaAvanza: { id: 'nombre', a: 1, datos: { deEllos: true } } },
            { t: 'Quedarte con el número', fx: { cordura: -6, fisico: 6 },
              tramaAvanza: { id: 'nombre', a: 1, datos: { numero: true } } },
            { t: 'Coger el nombre de uno que murió', fx: { cordura: 6, alineamiento: 8 },
              tramaAvanza: { id: 'nombre', a: 1, datos: { heredado: true } } }
          ] };
      } },
      { espera: [3, 6], escena: function (g, t) {
        return { t: '<p>Un oficial te llama por el número delante de todos y corrige a quien usa tu nombre.</p>',
          c: [
            { t: 'Corregirle tú a él', fx: { cordura: 12, reputacion: -6, carisma: 10 },
              tramaAvanza: { id: 'nombre', a: 2, datos: { plantaste: true } } },
            { t: 'Tragar', fx: { cordura: -10 },
              tramaAvanza: { id: 'nombre', a: 2 } },
            { t: 'Tatuártelo donde se vea', fx: { cordura: 14, salud: -2, carisma: 8 },
              tramaAvanza: { id: 'nombre', a: 2, datos: { tatuaje: true } } },
            { t: 'Hacer que todos los de tu escuadra usen nombre', fx: { carisma: 16, reputacion: 10 },
              tramaAvanza: { id: 'nombre', a: 2, datos: { escuadra: true } } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        return { t: '<p>La guerra o el Imperio se acaban para ti. Nadie va a decirte ya cómo llamarte, y nadie va a preguntarte tampoco.</p>',
          c: [
            { t: 'Empezar de cero con ese nombre', fx: { cordura: 20, carisma: 10 },
              tramaAvanza: { id: 'nombre', a: 3, datos: { civil: true } } },
            { t: 'Buscar a los de tu lote', fx: { cordura: 16, alineamiento: 12 },
              rel: { tipo: 'hermano de lote', afecto: 60 },
              tramaAvanza: { id: 'nombre', a: 3, datos: { hermanos: true } } },
            { t: 'Cambiártelo otra vez y desaparecer', fx: { notoriedad: -25, cordura: 8 },
              tramaAvanza: { id: 'nombre', a: 3, datos: { otro: true } } },
            { t: 'Seguir siendo un soldado', fx: { fisico: 10, cordura: -8 },
              tramaAvanza: { id: 'nombre', a: 3, datos: { soldado: true } } }
          ] };
      } },
      { espera: [6, 14], escena: function (g, t) {
        return { t: '<p>Eres viejo antes de tiempo, como todos los tuyos. Alguien te pregunta cómo te llamas.</p>',
          c: [
            { t: 'Decir tu nombre entero, sin número', fx: { cordura: 24 },
              legado: 'murió con nombre propio',
              tramaCierra: { id: 'nombre', final: 'moriste con nombre y no con número' } },
            { t: 'Decir el número, por costumbre', fx: { cordura: -10 },
              tramaCierra: { id: 'nombre', final: 'volviste al número al final' } },
            { t: 'Contarle toda la historia', fx: { cordura: 18, carisma: 12 },
              tramaCierra: { id: 'nombre', final: 'se lo contaste todo a un desconocido' } },
            { t: 'Ponerle nombre a otro que no tiene', fx: { cordura: 20, alineamiento: 16 },
              tramaCierra: { id: 'nombre', final: 'le pusiste nombre a otro' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 13
     LA HERIDA DE GUERRA
     ---------------------------------------------------------- */
  T.guerra = {
    n: 'Lo que te trajiste del frente', ico: '☓', min: 18, p: 0.75,
    resumen: 'Volviste, pero no del todo.',
    arranca: function (s) { return !!s.flags.veterano || (s.contadores.batallas || 0) > 1; },
    primera: [1, 4],
    finalPorDefecto: 'Se fue calmando con los años.',
    etapas: [
      { espera: [2, 4], escena: function (g, t) {
        return { t: '<p>Vuelves y todo el mundo espera que sigas donde lo dejaste. Tú no encuentras el sitio.</p>',
          c: [
            { t: 'Buscar a los de tu unidad', fx: { cordura: 14 }, rel: { tipo: 'camarada', afecto: 55 },
              tramaAvanza: { id: 'guerra', a: 1, datos: { unidad: true } } },
            { t: 'No hablar de ello con nadie', fx: { cordura: -12, fisico: 4 },
              tramaAvanza: { id: 'guerra', a: 1, datos: { callas: true } } },
            { t: 'Contarlo todo a quien te escuche', fx: { cordura: 8, carisma: 8, reputacion: -4 },
              tramaAvanza: { id: 'guerra', a: 1, datos: { cuentas: true } } },
            { t: 'Volver a alistarte', menuAlistar: true,
              tramaAvanza: { id: 'guerra', a: 1, datos: { volviste: true } } }
          ] };
      } },
      { espera: [3, 7], escena: function (g, t) {
        return { t: '<p>Un ruido cualquiera te ha tirado al suelo delante de la gente.</p>',
          c: [
            { t: 'Buscar ayuda de verdad', coste: 8000, fx: { cordura: 20 },
              tramaAvanza: { id: 'guerra', a: 2, datos: { tratas: true } } },
            { t: 'Beber', fx: { cordura: 6, salud: -16 },
              tramaAvanza: { id: 'guerra', a: 2, datos: { bebes: true } } },
            { t: 'Entrenar hasta caer rendido cada día', fx: { fisico: 14, cordura: 6, salud: -6 },
              tramaAvanza: { id: 'guerra', a: 2, datos: { entrenas: true } } },
            { t: 'Irte a vivir donde no haya nadie', mover: 'cerca', motivo: 'a un sitio sin ruido',
              fx: { cordura: 12, carisma: -8 },
              tramaAvanza: { id: 'guerra', a: 2, datos: { aislado: true } } }
          ] };
      } },
      { espera: [5, 12], escena: function (g, t) {
        return { t: '<p>Hay una placa con los nombres de los que no volvieron y te han pedido que hables.</p>',
          c: [
            { t: 'Hablar y decir la verdad', fx: { cordura: 22, reputacion: 12, alineamiento: 12 },
              tramaCierra: { id: 'guerra', final: 'lo dijiste en voz alta y te soltó' } },
            { t: 'Hablar y decir lo que quieren oír', fx: { reputacion: 14, cordura: -8 },
              tramaCierra: { id: 'guerra', final: 'les diste el discurso que esperaban' } },
            { t: 'Ir y no hablar', fx: { cordura: 10 },
              tramaCierra: { id: 'guerra', final: 'fuiste, y con eso bastaba' } },
            { t: 'No ir', fx: { cordura: -14 },
              tramaCierra: { id: 'guerra', final: 'nunca volviste a mirar esa placa' } }
          ] };
      } }
    ]
  };

  /* ---------------------------------------------------------- 14
     LA CONSPIRACIÓN QUE TE ENVUELVE
     ---------------------------------------------------------- */
  T.complot = {
    n: 'Algo que se cuece por encima de ti', ico: '⌬', min: 20, p: 0.5,
    resumen: 'Te has cruzado con algo grande sin querer.',
    arranca: function (s) {
      return !!s.flags.en_el_senado || !!s.flags.espia || !!s.flags.dentro_del_senado ||
             (s.contadores.tramas || 0) > 0 || !!s.flags.trabaja_para_dooku;
    },
    primera: [2, 5],
    finalPorDefecto: 'Nunca supiste del todo qué era.',
    etapas: [
      { espera: [3, 6], escena: function (g, t) {
        return { t: '<p>Un documento que no deberías tener menciona tres nombres y una fecha.</p>',
          c: [
            { t: 'Guardarlo y callar', fx: { intelecto: 8, cordura: -6 },
              tramaAvanza: { id: 'complot', a: 1, datos: { guardas: true } } },
            { t: 'Investigar los tres nombres', fx: { intelecto: 16 }, buscado: 12,
              tramaAvanza: { id: 'complot', a: 1, datos: { investigas: true } } },
            { t: 'Venderlo', fx: { creditos: 35000, alineamiento: -12 }, buscado: 18,
              tramaAvanza: { id: 'complot', a: 1, datos: { vendiste: true } } },
            { t: 'Destruirlo y olvidarlo', fx: { cordura: 8 },
              tramaCierra: { id: 'complot', final: 'quemaste el papel y viviste tranquilo' } }
          ] };
      } },
      { espera: [4, 8], escena: function (g, t) {
        return { t: '<p>Uno de los tres nombres ha aparecido muerto. Los otros dos han subido de puesto.</p>',
          c: [
            { t: 'Ir a por los que quedan', fx: { intelecto: 12, notoriedad: 14 }, buscado: 22,
              tramaAvanza: { id: 'complot', a: 2, datos: { cazas: true } } },
            { t: 'Ponerte a cubierto', fx: { notoriedad: -12, cordura: -6 },
              tramaAvanza: { id: 'complot', a: 2, datos: { cubierto: true } } },
            { t: 'Ofrecerles tu silencio', fx: { creditos: 45000, alineamiento: -18 },
              tramaAvanza: { id: 'complot', a: 2, datos: { comprado: true } } },
            { t: 'Contárselo a la prensa', fx: { reputacion: 16, notoriedad: 22, alineamiento: 16 }, buscado: 30,
              tramaAvanza: { id: 'complot', a: 2, datos: { publicaste: true } } }
          ] };
      } },
      { espera: [5, 11], escena: function (g, t) {
        return { t: '<p>Lo que se cocía ya ha pasado. Ha cambiado la vida de millones y tú lo sabías antes que nadie.</p>',
          c: [
            { t: 'Contar lo que sabías desde el principio', fx: { reputacion: 18, cordura: 14, notoriedad: 16 },
              tramaCierra: { id: 'complot', final: 'lo contaste todo cuando ya no servía de nada' } },
            { t: 'Ponerte del lado que ganó', fx: { creditos: 60000, alineamiento: -20, reputacion: 10 },
              tramaCierra: { id: 'complot', final: 'te pusiste del lado que ganó' } },
            { t: 'Buscar a los que quedaron debajo y ayudarles', fx: { alineamiento: 24, reputacion: 14, creditos: -20000 },
              tramaCierra: { id: 'complot', final: 'ayudaste a los que quedaron debajo' } },
            { t: 'No volver a hablar de esto jamás', fx: { cordura: -12 },
              tramaCierra: { id: 'complot', final: 'te lo callaste para siempre' } }
          ] };
      } }
    ]
  };

  /* ------------------------------------------------------------
     Resumen para la ficha y el final
     ------------------------------------------------------------ */
  SW.tramasDe = function (s) {
    const out = [];
    for (const id in (s.tramas || {})) {
      const t = s.tramas[id], T = SW.TRAMAS[id];
      if (!T) continue;
      out.push({
        id: id, n: T.n, ico: T.ico, resumen: T.resumen,
        etapa: t.etapa, total: T.etapas.length,
        desde: t.desde, hasta: t.hasta, cerrada: t.cerrada, final: t.final
      });
    }
    return out;
  };

})(typeof window !== 'undefined' ? window : globalThis);

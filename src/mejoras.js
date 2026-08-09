/* ============================================================
   HOLOVIDA :: MEJORAS DE JUEGO
   Sistemas pequeños que se notan mucho: rachas, talentos que
   eliges tú, prestigio por facción, y la posibilidad de seguir
   jugando con un descendiente cuando te mueres.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     1 · RACHAS
     Encadenar aciertos te pone fino; encadenar palos te hunde.
     No es magia: mueve la suerte, que es una estadística real.
     ============================================================ */
  SW.RACHA_TOPE = 5;

  SW.marcarRacha = function (g, bien) {
    const s = g.s;
    const antes = s.racha || 0;
    if (bien) s.racha = antes >= 0 ? Math.min(SW.RACHA_TOPE, antes + 1) : 0;
    else s.racha = antes <= 0 ? Math.max(-SW.RACHA_TOPE, antes - 1) : 0;
    if (s.racha === 3) g.log('Te está saliendo todo. Se nota en cómo andas.', 'bien');
    if (s.racha === -3) g.log('No te sale una. Y se te nota en la cara.', 'mal');
  };

  SW.efectoRacha = function (s) { return (s.racha || 0) * 2; };

  SW.etiquetaRacha = function (s) {
    const r = s.racha || 0;
    if (r >= 4) return { t: 'imparable', c: 'buena' };
    if (r >= 2) return { t: 'en racha', c: 'buena' };
    if (r <= -4) return { t: 'hundido', c: 'mala' };
    if (r <= -2) return { t: 'de capa caída', c: 'mala' };
    return null;
  };

  /* ============================================================
     2 · TALENTOS
     Cada cierto tiempo eliges en qué te has convertido. No son
     puntos sueltos: cambian cómo se resuelven las cosas.
     ============================================================ */
  SW.TALENTOS = [
    { id: 'ojo', n: 'Ojo para la gente', d: 'Calas a quien tienes delante antes de que hable.',
      mods: { carisma: 8, intelecto: 4 }, pasivo: 'Los tratos y las mediaciones te salen mejor.' },
    { id: 'manos', n: 'Manos', d: 'Arreglas cosas que otros tiran.',
      mods: { destreza: 8, intelecto: 4 }, hab: 'mecánico' },
    { id: 'aguante', n: 'Aguante', d: 'Encajas más de lo que deberías.',
      mods: { fisico: 8, salud: 8 }, pasivo: 'Menos probabilidad de morir al perder una pelea.' },
    { id: 'sangre_fria', n: 'Sangre fría', d: 'Cuando todo se tuerce, tú bajas las pulsaciones.',
      mods: { cordura: 10, destreza: 4 }, pasivo: 'Los minijuegos te dan más margen.' },
    { id: 'memoria', n: 'Memoria de elefante', d: 'No se te olvida una cara ni una deuda.',
      mods: { intelecto: 10 }, pasivo: 'Recuerdas quién te debe qué.' },
    { id: 'labia', n: 'Labia', d: 'Has salido de sitios de los que no se sale hablando.',
      mods: { carisma: 12 }, pasivo: 'Se abren opciones de convencer.' },
    { id: 'olfato', n: 'Olfato', d: 'Hueles el problema antes de meterte en él.',
      mods: { suerte: 10, intelecto: 4 }, pasivo: 'Menos accidentes tontos.' },
    { id: 'nervio', n: 'Nervio', d: 'Vas primero y preguntas después.',
      mods: { fisico: 6, destreza: 8 }, pasivo: 'Mejor en los ataques de apertura.' },
    { id: 'paciencia', n: 'Paciencia', d: 'Sabes esperar años a que algo madure.',
      mods: { cordura: 8, intelecto: 6 }, pasivo: 'Las tramas largas te salen mejor.' },
    { id: 'contactos', n: 'Agenda', d: 'Siempre conoces a alguien que conoce a alguien.',
      mods: { carisma: 6, reputacion: 8 }, pasivo: 'Más contactos útiles.' },
    { id: 'ahorro', n: 'Cabeza para el dinero', d: 'Sabes lo que cuesta cada cosa.',
      mods: { intelecto: 6 }, credito: 0.12, pasivo: 'Ganas un 12% más en todo lo que cobras.' },
    { id: 'instinto', n: 'Instinto', d: 'A veces sabes cosas sin saber por qué.',
      mods: { suerte: 8, fuerza: 6 }, pasivo: 'Algo se remueve cuando hay peligro.' }
  ];

  SW.tieneTalento = function (s, id) { return (s.talentos || []).indexOf(id) >= 0; };

  SW.menuTalento = function (g) {
    const s = g.s, rng = g.rng;
    const libres = SW.TALENTOS.filter(function (t) { return !SW.tieneTalento(s, t.id); });
    if (!libres.length) return null;
    const copia = libres.slice();
    const opciones = [];
    for (let i = 0; i < 3 && copia.length; i++) {
      opciones.push(copia.splice(rng.int(0, copia.length - 1), 1)[0]);
    }
    return {
      gen: true, id: 'talento_' + s.edad,
      t: '<span class="scene-tag">LO QUE TE VAS HACIENDO</span>' +
         '<p>Han pasado unos años y algo se te ha quedado. ¿Qué se te da bien ahora?</p>',
      c: opciones.map(function (t) {
        return {
          t: t.n, sub: t.d + (t.pasivo ? ' — ' + t.pasivo : ''),
          talento: t.id, fx: t.mods, hab: t.hab
        };
      })
    };
  };

  SW.darTalento = function (g, id) {
    const s = g.s;
    const t = SW.TALENTOS.filter(function (x) { return x.id === id; })[0];
    if (!t || SW.tieneTalento(s, id)) return;
    s.talentos = s.talentos || [];
    s.talentos.push(id);
    if (t.hab && s.habilidades.indexOf(t.hab) < 0) s.habilidades.push(t.hab);
    g.log('Ahora se te da bien una cosa: <b>' + t.n + '</b>.', 'bien');
    g.hito('Se hace con ' + t.n.toLowerCase());
  };

  /** ¿toca elegir talento este año? Cada 14 años, a partir de los 14. */
  SW.tocaTalento = function (s) {
    if (s.edadBio < 14) return false;
    const n = (s.talentos || []).length;
    return s.edadBio >= 14 + n * 14 && n < 5;
  };

  /* ============================================================
     3 · PRESTIGIO POR FACCIÓN
     Estaba guardado y no se veía en ninguna parte.
     ============================================================ */
  SW.prestigioDe = function (s) {
    const out = [];
    for (const id in (s.faccionRep || {})) {
      const v = s.faccionRep[id];
      if (!v) continue;
      const f = SW.faccion ? SW.faccion(id) : null;
      out.push({ id: id, n: f ? f.n : id, v: U.clamp(v, -100, 100) });
    }
    return out.sort(function (a, b) { return Math.abs(b.v) - Math.abs(a.v); }).slice(0, 6);
  };

  SW.etiquetaPrestigio = function (v) {
    if (v >= 60) return 'te deben favores';
    if (v >= 25) return 'bien visto';
    if (v > -25) return 'les da igual';
    if (v > -60) return 'mal visto';
    return 'te quieren muerto';
  };

  /* ============================================================
     4 · LEGADO: JUGAR CON UN DESCENDIENTE
     Cuando te mueres puedes seguir con alguien de tu sangre. Se
     hereda el apellido, el mundo, parte del dinero y un talento.
     ============================================================ */
  SW.puedeHeredar = function (s) {
    return !!s && ((s.contadores.hijos || 0) > 0 || (s.relaciones || []).some(function (r) {
      return r.tipo === 'aprendiz' || r.tipo === 'familia';
    }));
  };

  SW.herenciaDe = function (s) {
    const apellido = (s.nombre || '').split(' ').slice(1).join(' ');
    const talento = (s.talentos || [])[0] || null;
    // se hereda una parte del dinero, no todo: hay impuestos y hermanos
    const dinero = Math.max(0, Math.round((s.stats.creditos || 0) * 0.35));
    return {
      apellido: apellido || null,
      mundo: s.mundo,
      especie: s.especie,
      era: s.era,
      creditos: dinero,
      talento: talento,
      sensible: !!s.sensible && Math.abs(s.stats.alineamiento) > 20,
      deQuien: s.nombre,
      reputacion: Math.round((s.stats.reputacion || 0) * 0.4),
      notoriedad: Math.round((s.stats.notoriedad || 0) * 0.3),
      tramas: (SW.tramasDe ? SW.tramasDe(s) : []).filter(function (t) { return !t.cerrada; }).map(function (t) { return t.n; })
    };
  };

  /** Aplica la herencia a una partida recién creada. */
  SW.aplicarHerencia = function (g, h) {
    if (!h) return;
    const s = g.s;
    s.herencia = h;
    s.stats.creditos += h.creditos;
    s.stats.reputacion = U.clamp(s.stats.reputacion + h.reputacion, 0, 100);
    s.stats.notoriedad = U.clamp(s.stats.notoriedad + h.notoriedad, 0, 100);
    if (h.talento) SW.darTalento(g, h.talento);
    g.log('Eres de la familia de <b>' + h.deQuien + '</b>. Eso abre puertas y cierra otras.', 'res');
    if (h.creditos > 0) g.log('Te llega la herencia: ' + U.cr(h.creditos) + '.', 'cr');
    if (h.tramas && h.tramas.length) {
      g.log('Quedaron cosas sin cerrar: ' + h.tramas.join('; ') + '.', 'mal');
    }
    g.hito('Hereda el nombre de ' + h.deQuien);
  };

  /* ============================================================
     5 · TITULARES DE ÉPOCA
     Un poco de mundo alrededor, aunque no te toque a ti.
     ============================================================ */
  const TITULARES = {
    alta_republica: ['Se inaugura otro Faro estelar.', 'La Frontera pide más jedi y llegan menos.', 'Otro ataque nihil en una ruta que se creía segura.'],
    republica_tardia: ['El Senado debate el mismo asunto por sexto año.', 'Otro sistema pide entrar en la República.', 'Los gremios comerciales suben tasas otra vez.'],
    guerras_clon: ['Nueva leva de clones sale de Kamino.', 'El Senado aprueba más poderes de emergencia.', 'Un mundo neutral deja de ser neutral.'],
    imperio_temprano: ['Se disuelve otro consejo planetario.', 'Los astilleros de Kuat trabajan a triple turno.', 'Otra "reubicación de población" en el Borde.'],
    rebelion: ['La Alianza reclama un golpe que nadie confirma.', 'El Imperio anuncia que la rebelión está acabada. Otra vez.', 'Suben las cuotas de reclutamiento imperial.'],
    nueva_republica: ['El Senado nuevo discute dónde ponerse.', 'Los restos imperiales se reparten el Borde.', 'Vuelven a abrirse rutas cerradas hace veinte años.'],
    primera_orden: ['Reclutamiento forzoso en tres sistemas más.', 'La Resistencia pide ayuda y no contesta nadie.', 'Otro planeta amanece bajo bandera nueva.']
  };

  SW.titularDeEra = function (rng, era) {
    const l = TITULARES[era];
    return l ? rng.pick(l) : null;
  };

})(typeof window !== 'undefined' ? window : globalThis);

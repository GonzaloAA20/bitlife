/* ============================================================
   HOLOVIDA :: QUIÉN SE FIJA EN TI
   Entrenar la Fuerza por tu cuenta no pasa desapercibido. Según
   la época, tu edad, tu alineamiento y lo bueno que seas, te
   reclutan, te vigilan, te ofrecen las dos cosas o te vienen a
   matar. Y a veces no pasa nada, que también es un resultado.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     ¿CUÁNTO DESTACAS?
     Ser virtuoso no puede ser fácil: hace falta nivel alto de
     Fuerza, haberla entrenado muchas veces y algo de talento.
     ============================================================ */
  SW.virtuosismo = function (s) {
    if (!s.sensible) return 0;
    const entrenos = (s.contadores && s.contadores.entrenosFuerza) || 0;
    let v = s.stats.fuerza * 0.75            // el nivel manda
          + Math.min(entrenos, 18) * 1.6     // pero hay que haber sudado
          + (s.dotes && s.dotes.fuerza ? s.dotes.fuerza * 1.1 : 0)
          + (s.poderes ? s.poderes.length * 3 : 0)
          + (s.sable ? 8 : 0);
    if (s.stats.cordura < 25) v -= 8;
    return Math.round(U.clamp(v, 0, 130));
  };

  /** el ruido que haces: lo que hace que te encuentren */
  SW.ruidoFuerza = function (s) {
    let r = SW.virtuosismo(s) * 0.6;
    r += (s.stats.notoriedad || 0) * 0.35;
    r += (s.stats.reputacion || 0) * 0.15;
    if (s.flags.uso_publico_fuerza) r += 25;
    if (s.flags.lo_guarda) r -= 15;             // discreto desde crío
    if (s.flags.sabe_esconderse) r -= 10;
    if (SW.naveAbre && SW.naveAbre(s, 'colarse')) r -= 6;
    return Math.round(Math.max(0, r));
  };

  /* ============================================================
     QUIÉN ANDA SUELTO EN CADA ÉPOCA
     ============================================================ */
  const ERA = {
    alta_republica:   { jedi: 'fuerte', sith: 'oculto',  caza: 0.00, recluta: 'nino' },
    republica_tardia: { jedi: 'fuerte', sith: 'oculto',  caza: 0.00, recluta: 'nino' },
    guerras_clon:     { jedi: 'ocupado', sith: 'oculto', caza: 0.05, recluta: 'nino' },
    imperio_temprano: { jedi: 'cazado', sith: 'manda',   caza: 0.55, recluta: 'no' },
    rebelion:         { jedi: 'cazado', sith: 'manda',   caza: 0.45, recluta: 'no' },
    nueva_republica:  { jedi: 'renace', sith: 'restos',  caza: 0.12, recluta: 'cualquiera' },
    primera_orden:    { jedi: 'renace', sith: 'restos',  caza: 0.22, recluta: 'cualquiera' },
    era_perdida:      { jedi: 'mito',   sith: 'mito',    caza: 0.06, recluta: 'raro' }
  };

  /** ¿puede la Orden reclutarte a esta edad y en esta época? */
  SW.puedenReclutarte = function (s) {
    const e = ERA[s.era] || ERA.rebelion;
    if (s.trabajo === 'jedi' || s.trabajo === 'sith') return false;
    if (e.recluta === 'no') return false;
    if (e.recluta === 'nino') return s.edadBio <= 13;
    if (e.recluta === 'raro') return s.edadBio <= 16;
    return s.edadBio <= 30;                    // eras tardías: menos estrictas
  };

  /* ============================================================
     EL EVENTO CENTRAL: alguien se fija en ti
     Se dispara desde el guion, no compite con los eventos random,
     para que no se lo coma la aleatoriedad.
     ============================================================ */
  SW.GUION = SW.GUION || [];
  SW.GUION.push({
    id: 'fz_te_han_visto', min: 5, max: 200, prio: 62,
    req: function (s) {
      if (!s.sensible || s.muerto) return false;
      if (s.trabajo === 'jedi' || s.trabajo === 'sith') return false;
      if (s.flags.ya_te_vieron_este_tramo) return false;
      // hace falta destacar de verdad: no basta con ser sensible
      const v = SW.virtuosismo(s);
      const umbral = SW.puedenReclutarte(s) ? 34 : 52;
      return v >= umbral && (s.contadores.entrenosFuerza || 0) >= 3;
    },
    t: 'Llevas tiempo entrenando por tu cuenta y hace semanas que notas algo: alguien te está prestando atención.',
    c: [{ t: 'Ver quién es', ojo: true }]
  });

  /* el desenlace se calcula al vuelo: lo genera el motor */
  SW.GEN = SW.GEN || {};
  SW.GEN.atencionFuerza = function (rng, s) {
    const e = ERA[s.era] || ERA.rebelion;
    const v = SW.virtuosismo(s);
    const ruido = SW.ruidoFuerza(s);
    const al = s.stats.alineamiento;
    const joven = SW.puedenReclutarte(s);
    const viejo = s.edadBio >= 34;

    /* --- quién llega primero --- */
    // peso de cada desenlace: nada de esto es automático
    const pesos = [];
    const P = function (id, w) { if (w > 0) pesos.push({ id: id, w: w }); };

    P('nadie', 40 - ruido / 3);                                   // lo más común es que no pase nada
    if (joven && e.jedi !== 'cazado' && e.jedi !== 'mito') P('recluta_jedi', 34 + (al > 0 ? al / 3 : 0));
    if (joven && e.sith === 'manda') P('recluta_sith', 14 + (al < 0 ? -al / 3 : 0));
    if (!joven && e.jedi === 'fuerte' && viejo) P('jedi_amenaza', 20 + (al < -20 ? 22 : 0));
    if (!joven && e.jedi === 'renace') P('jedi_ofrece_tarde', 24 + (al > 10 ? 12 : 0));
    if (e.sith === 'manda' || e.sith === 'restos') P('sith_tienta', 20 + (al < 0 ? -al / 2.4 : 0) + v / 6);
    if (e.sith === 'oculto' && v > 70) P('sith_tienta', 14);
    // en las Guerras Clon casi nadie te caza; bajo el Imperio, casi todos
    if (e.caza > 0) P('caza', e.caza * (60 + ruido / 1.5));
    if (v > 60 && !joven) P('los_dos', 16 + v / 8);
    if (viejo && e.sith !== 'mito' && al < -10) P('sith_amenaza', 16);

    const sel = rng.weighted(pesos, function (o) { return o.w; }).id;
    return CONSTRUIR[sel](rng, s, { v: v, ruido: ruido, era: e, joven: joven, viejo: viejo });
  };

  /* ============================================================
     LOS DESENLACES
     ============================================================ */
  /** nombre de maestro con la firma real de data-canon.js */
  const maestro = function (rng, s, lado) {
    if (!SW.maestroDe) return lado === 'sith' ? 'alguien sin nombre' : 'un caballero jedi';
    const m = SW.maestroDe(rng, s.era, lado || 'jedi');
    return m && m.n ? m.n : 'un caballero jedi';
  };

  const CONSTRUIR = {

    nadie: function (rng, s) {
      return { id: 'fz_nadie', gen: true, tono: 'res',
        t: 'Era un vecino curioso, o nadie. Nadie de los que importan se ha fijado en ti.<br>' +
           '<span class="dim">Todavía. Cuanto más entrenes, más ruido harás.</span>',
        c: [{ t: 'Seguir entrenando en silencio', fx: { fuerza: 4, cordura: 4 }, flag: 'ya_te_vieron_este_tramo' },
            { t: 'Bajar el ritmo una temporada', fx: { cordura: 8 }, quitarRuido: true, flag: 'ya_te_vieron_este_tramo' }] };
    },

    recluta_jedi: function (rng, s, ctx) {
      const mn = maestro(rng, s, 'jedi');
      return { id: 'fz_recluta_jedi', gen: true,
        t: 'Se presenta en tu casa <b>' + mn + '</b>. Ha venido desde muy lejos y sabe tu nombre.<br>' +
           'Dice que tienes edad, y que a partir de mañana la tendrías demasiado tarde.',
        c: [
          { t: 'Irte con la Orden', unirse: 'jedi', fx: { fuerza: 14, alineamiento: 12, cordura: -8 },
            flag: 'ya_te_vieron_este_tramo',
            out: 'Te despides de tu familia en un pasillo del Templo y no vuelves a verlos siendo el mismo.' },
          { t: 'Pedir un día para pensarlo', fx: { intelecto: 6, cordura: -5 },
            flag: 'ya_te_vieron_este_tramo',
            r: [{ p: 0.55, t: 'Vuelve al día siguiente. Te vas con él.', unirse: 'jedi', fx: { fuerza: 12, alineamiento: 10 } },
                { p: 0.45, t: 'No vuelve. La Orden no insiste dos veces.', fx: { cordura: -12, fuerza: 4 }, flag: 'rechazo_a_la_orden' }] },
          { t: 'Decir que no', fx: { cordura: 6, fuerza: 6, alineamiento: -2 },
            flag: 'rechazo_a_la_orden', flag2: 'ya_te_vieron_este_tramo',
            out: 'Te mira un rato largo antes de irse. Sabe algo que tú no.' },
          { t: 'Preguntarle qué pasa con los que dicen que no', fx: { intelecto: 10, cordura: -6 },
            flag: 'ya_te_vieron_este_tramo',
            out: '"Nada. Ese es el problema: nadie os enseña, y aprendéis igual."' }
        ] };
    },

    recluta_sith: function (rng, s) {
      return { id: 'fz_recluta_sith', gen: true,
        t: 'No llama a la puerta: ya está dentro. No dice de dónde viene ni cómo se llama.<br>' +
           '"Te han dejado solo con esto. Yo no voy a dejarte solo."',
        c: [
          { t: 'Irte con él', unirse: 'sith', fx: { fuerza: 18, alineamiento: -18, cordura: -10 },
            flag: 'ya_te_vieron_este_tramo',
            out: 'No te dice a dónde vais. Tú tampoco preguntas.' },
          { t: 'Negarte', flag: 'ya_te_vieron_este_tramo',
            r: [{ p: 0.55, t: 'Se va. "Volveré cuando estés peor."', fx: { cordura: -10, fuerza: 6 } },
                { p: 0.45, t: 'No acepta un no.', combate: { dif: 68, duelo: true }, fx: { cordura: -14 } }] },
          { t: 'Avisar a alguien', fx: { alineamiento: 10, cordura: -8 }, flag: 'ya_te_vieron_este_tramo',
            out: 'Nadie te cree. Cuando vuelves a casa ya no hay nadie.' }
        ] };
    },

    jedi_ofrece_tarde: function (rng, s) {
      const mn = maestro(rng, s, 'jedi');
      return { id: 'fz_jedi_tarde', gen: true,
        t: '<b>' + mn + '</b> te encuentra. Dice que la Orden vieja no te habría querido a tu edad,<br>' +
           'y que la de ahora no puede permitirse esos remilgos.',
        c: [
          { t: 'Aceptar la formación', unirse: 'jedi', fx: { fuerza: 12, alineamiento: 10, cordura: -4 },
            flag: 'ya_te_vieron_este_tramo', out: 'Empiezas veinte años tarde. Empiezas.' },
          { t: 'Aceptar solo lo que te sirva', fx: { fuerza: 14, intelecto: 8, alineamiento: 4 },
            poder: 'auto', flag: 'ya_te_vieron_este_tramo',
            out: 'Aprendes lo que quieres y te vas. Le decepcionas y lo entiende.' },
          { t: 'Decir que ya es tarde para ti', fx: { cordura: -8, fuerza: 6 }, flag: 'ya_te_vieron_este_tramo' }
        ] };
    },

    jedi_amenaza: function (rng, s) {
      const mn = maestro(rng, s, 'jedi');
      return { id: 'fz_jedi_amenaza', gen: true,
        t: 'Dos jedi te esperan en la puerta. No vienen a reclutarte: <b>' + mn + '</b> lleva meses<br>' +
           'siguiendo lo que haces. A tu edad, sin Orden y con ese nivel, para ellos eres un problema.',
        c: [
          { t: 'Dejarte examinar', r: [
              { p: 0.5, t: 'Te dan por inofensivo y te vigilan de lejos.', fx: { cordura: -8, fuerza: 4 }, flag: 'vigilado_por_la_orden' },
              { p: 0.5, t: 'No les gusta lo que ven. Te prohíben usarla.', fx: { fuerza: -10, cordura: -12, alineamiento: 4 }, flag: 'prohibido_usarla' }] },
          { t: 'Negarte a que te toquen', combate: { dif: 70, duelo: true, sable: false }, fx: { alineamiento: -6 } },
          { t: 'Convencerles de que no eres una amenaza', req: function (st) { return st.stats.carisma > 50; },
            fx: { carisma: 12, cordura: 6, reputacion: 6 }, out: 'Funciona. Te dejan en paz y uno de ellos vuelve años después, a preguntar otra cosa.' },
          { t: 'Desaparecer esa misma noche', fx: { cordura: -6, intelecto: 6 }, mover: 'cerca', motivo: 'antes de que vuelvan' }
        ], flag: 'ya_te_vieron_este_tramo' };
    },

    sith_tienta: function (rng, s) {
      return { id: 'fz_sith_tienta', gen: true,
        t: 'Alguien te invita a hablar en un sitio donde no hay nadie más. Sabe cosas de ti<br>' +
           'que no has contado. No te pide que te unas a nada: te ofrece enseñarte lo que nadie te enseña.',
        c: [
          { t: 'Escuchar y aprender', fx: { fuerza: 16, alineamiento: -14, cordura: -8 }, poder: 'auto_oscuro',
            flag: 'ya_te_vieron_este_tramo', out: 'Lo que te enseña funciona. Ese es el problema.' },
          { t: 'Aprender y no deberle nada', req: function (st) { return st.stats.intelecto > 50; },
            fx: { fuerza: 12, alineamiento: -6, intelecto: 8 }, flag: 'ya_te_vieron_este_tramo',
            out: 'Te llevas lo que has venido a buscar. Él cree que le debes algo. Ya se verá.' },
          { t: 'Levantarte y salir', fx: { alineamiento: 12, cordura: 8, fuerza: 3 }, flag: 'ya_te_vieron_este_tramo',
            out: '"Volverás." No lo dice como amenaza, y eso es lo que asusta.' },
          { t: 'Atacarle allí mismo', combate: { dif: 74, duelo: true }, fx: { alineamiento: 6, cordura: -10 } }
        ] };
    },

    sith_amenaza: function (rng, s) {
      return { id: 'fz_sith_amenaza', gen: true,
        t: 'Has llegado demasiado lejos para andar suelto. Alguien que sí tiene maestro<br>' +
           'ha decidido que dos no caben, y ha venido a arreglarlo.',
        c: [
          { t: 'Pelear', combate: { dif: 78, duelo: true, aMuerte: true }, fx: { cordura: -10 } },
          { t: 'Ofrecerle algo mejor que matarte', req: function (st) { return st.stats.carisma > 55; },
            fx: { carisma: 14, alineamiento: -8, notoriedad: 10 }, rel: { tipo: 'contacto', afecto: 20 },
            out: 'Le convences de que vivo vales más. Te lo va a cobrar.' },
          { t: 'Huir del sistema esta noche', fx: { cordura: -12, creditos: -8000 }, mover: 'cerca', motivo: 'con alguien detrás' },
          { t: 'Esconder lo que eres y dejar de usarla', fx: { fuerza: -16, cordura: -10 }, flag: 'la_enterro' }
        ], flag: 'ya_te_vieron_este_tramo' };
    },

    los_dos: function (rng, s) {
      const jm = maestro(rng, s, 'jedi');
      return { id: 'fz_los_dos', gen: true,
        t: 'Pasa dos veces en el mismo mes. Primero <b>' + jm + '</b>, que te ofrece disciplina y límites.<br>' +
           'Después, alguien sin nombre que te ofrece exactamente lo contrario.<br>' +
           '<span class="dim">Los dos saben que el otro ha estado aquí.</span>',
        c: [
          { t: 'Elegir la Orden', unirse: 'jedi', fx: { fuerza: 12, alineamiento: 14, cordura: -6 },
            flag: 'ya_te_vieron_este_tramo', out: 'El otro no se enfada. Toma nota.' },
          { t: 'Elegir al otro', unirse: 'sith', fx: { fuerza: 18, alineamiento: -18, cordura: -10 },
            flag: 'ya_te_vieron_este_tramo', out: 'La Orden te da por perdido esa misma semana.' },
          { t: 'No elegir a ninguno', fx: { fuerza: 8, cordura: -14, alineamiento: 4 },
            flag: 'ni_uno_ni_otro', flag2: 'ya_te_vieron_este_tramo',
            out: 'Ahora tienes dos sitios donde no eres bienvenido y ninguno donde sí.' },
          { t: 'Sacarles información a los dos y desaparecer', req: function (st) { return st.stats.intelecto > 55; },
            fx: { intelecto: 14, fuerza: 10, notoriedad: 8, cordura: -8 }, flag: 'ya_te_vieron_este_tramo',
            out: 'Aprendes de los dos lo justo. Te vas antes de que comparen notas.' }
        ] };
    },

    caza: function (rng, s) {
      const inq = s.era === 'primera_orden' ? 'un Caballero de Ren' : 'un Inquisidor';
      return { id: 'fz_caza', gen: true,
        t: 'No vienen a ofrecerte nada. Llega <b>' + inq + '</b> con dos soldados y una lista<br>' +
           'en la que estás tú. Ha tardado un año en encontrarte y no tiene prisa.',
        c: [
          { t: 'Pelear', combate: { dif: 76, duelo: true, aMuerte: true, sableOscuro: false }, fx: { cordura: -8 } },
          { t: 'Huir', r: [
              { p: 0.45, t: 'Les pierdes. Cambias de nombre y de planeta.', fx: { cordura: -12, intelecto: 6 }, mover: 'cerca', motivo: 'con la Inquisición detrás' },
              { p: 0.55, t: 'Te alcanzan a las afueras.', combate: { dif: 82, duelo: true, aMuerte: true } }] },
          { t: 'Entregarte', fx: { cordura: -20, fuerza: -12, alineamiento: -6 }, carcel: 3,
            flag: 'estuvo_en_manos_del_imperio', out: 'Te llevan a un sitio del que se sale distinto o no se sale.' },
          { t: 'Esconder lo que eres para siempre', req: function (st) { return st.stats.intelecto > 45; },
            fx: { fuerza: -20, cordura: -14, intelecto: 8 }, flag: 'la_enterro',
            out: 'Dejas de usarla del todo. Funciona. Te cuesta lo que te cuesta.' }
        ], flag: 'ya_te_vieron_este_tramo' };
    }
  };

  /* ============================================================
     Se puede volver a llamar la atención: la marca se borra
     cada cierto tiempo si sigues entrenando.
     ============================================================ */
  SW.olvidoAtencion = function (g) {
    const s = g.s;
    if (!s.flags.ya_te_vieron_este_tramo) return;
    s.contadores.desdeAtencion = (s.contadores.desdeAtencion || 0) + 1;
    if (s.contadores.desdeAtencion >= 8) {
      delete s.flags.ya_te_vieron_este_tramo;
      s.contadores.desdeAtencion = 0;
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);

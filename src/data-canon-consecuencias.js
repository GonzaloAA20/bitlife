/* ============================================================
   HOLOVIDA :: LOS ENCUENTROS CANÓNICOS TIENEN CONSECUENCIAS
   Cruzarte con Padmé y que no pase nada es peor que no cruzarte.
   Aquí cada leyenda deja una cuenta abierta: si la matas viene
   quien la quería, si la salvas viene a darte las gracias, y si
   la humillas viene a devolvértelo.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};
  SW.GUION = SW.GUION || [];

  /* ------------------------------------------------------------
     Registro de cuentas abiertas
     ------------------------------------------------------------ */
  SW.marcarCanon = function (g, id, como) {
    const s = g.s;
    s.canonEstado = s.canonEstado || {};
    s.canonEstado[id] = como;
    s.canonPendiente = s.canonPendiente || [];
    if (s.canonPendiente.indexOf(id) < 0) s.canonPendiente.push(id);
  };
  SW.estadoCanon = function (s, id) { return (s.canonEstado || {})[id] || null; };

  /* Quién viene a cobrar por quién. */
  SW.VENGADORES = {
    padme:   { n: 'Anakin Skywalker', dif: 92, sable: true, eras: ['guerras_clon'] },
    anakin:  { n: 'Obi-Wan Kenobi',   dif: 88, sable: true, eras: ['guerras_clon'] },
    obiwan:  { n: 'Anakin Skywalker', dif: 92, sable: true, eras: ['guerras_clon'] },
    ahsoka:  { n: 'el Capitán Rex',   dif: 74, sable: false, eras: ['guerras_clon', 'imperio_temprano'] },
    aayla:   { n: 'el Comandante Bly', dif: 70, sable: false, eras: ['guerras_clon'] },
    rex:     { n: 'Ahsoka Tano',      dif: 86, sable: true, eras: ['guerras_clon', 'imperio_temprano'] },
    hondo:   { n: 'la banda Ohnaka',  dif: 62, sable: false, eras: null },
    bokatan: { n: 'la Guardia de la Muerte', dif: 72, sable: false, eras: null },
    windu:   { n: 'Mace Windu no tiene quien le vengue, pero el Consejo sí', dif: 84, sable: true, eras: ['guerras_clon'] },
    vader:   { n: 'los Inquisidores', dif: 84, sable: true, eras: ['imperio_temprano', 'rebelion'] },
    luke:    { n: 'Leia Organa',      dif: 66, sable: false, eras: ['rebelion', 'nueva_republica'] }
  };

  /* ============================================================
     PADMÉ: LA CADENA ENTERA
     Tres puertas según quién seas, y todas llevan a Anakin.
     ============================================================ */
  SW.GEN.canon_padme = function (rng, s) {
    const oscuro = s.stats.alineamiento < -25 || s.trabajo === 'sith';
    const jedi = s.trabajo === 'jedi';
    const c = [];
    const donde = s.mundo === 'Coruscant' ? 'el pasillo del Senado' : 'el espaciopuerto de ' + s.mundo;
    let cab = '<span class="canon-tag">ENCUENTRO</span> En ' + donde + ' te cruzas con <b>Padmé Amidala</b>. ';

    // hay un atentado en marcha: eso es lo que hace que la escena valga algo
    cab += 'Y ves lo que ella no ve: dos tipos siguiéndola con las manos dentro del abrigo.';

    c.push({ t: 'Avisarla y ponerte en medio',
      out: 'Los dos sicarios se lo piensan. Uno saca el blaster igual.',
      combate: { dif: 62, canon: 'padme_sicarios', botin: 0 },
      canonMarca: ['padme', 'salvada'],
      fx: { alineamiento: 16, reputacion: 12 } });
    c.push({ t: 'Sacarla de allí sin explicaciones',
      req: function (st) { return st.stats.destreza > 45 || st.stats.fuerza > 35; },
      out: 'La metes en un turboascensor de servicio. Tarda tres pisos en dejar de forcejear y uno más en darte las gracias.',
      canonMarca: ['padme', 'salvada'],
      rel: { tipo: 'aliado', afecto: 55, canon: 'Padmé Amidala', quien: 'senadora de Naboo' },
      fx: { alineamiento: 14, carisma: 12, reputacion: 14 } });
    c.push({ t: 'Dejar que pase lo que tenga que pasar',
      out: 'Sus guardias reaccionan tarde pero reaccionan. Ella sale con un brazo en cabestrillo y tú con una mancha en la conciencia.',
      canonMarca: ['padme', 'ignorada'],
      fx: { cordura: -10, alineamiento: -10 } });
    if (oscuro) {
      c.push({ t: 'Terminar tú el trabajo que ellos iban a hacer',
        out: 'Los sicarios ni te ven llegar. Ella sí.',
        combate: { dif: 70, duelo: true, aMuerte: true, canon: 'padme' },
        canonMarca: ['padme', 'atacada'],
        fx: { alineamiento: -30, notoriedad: 30 }, buscado: 40 });
      c.push({ t: 'Ofrecerte como su guardaespaldas para tenerla cerca',
        out: 'Acepta. Le has resuelto un problema y te has abierto una puerta al Senado.',
        canonMarca: ['padme', 'infiltrado'],
        rel: { tipo: 'contacto', afecto: 30, canon: 'Padmé Amidala', quien: 'senadora de Naboo' },
        fx: { carisma: 14, intelecto: 10, alineamiento: -8 }, flag: 'dentro_del_senado' });
    }
    if (jedi) {
      c.push({ t: 'Detenerlos sin desenfundar el sable',
        req: function (st) { return st.stats.fuerza > 30; },
        out: 'Los dos blásters salen volando por su cuenta. Nadie ha visto nada. Ella sí.',
        canonMarca: ['padme', 'salvada'],
        rel: { tipo: 'aliado', afecto: 60, canon: 'Padmé Amidala', quien: 'senadora de Naboo' },
        fx: { fuerza: 10, alineamiento: 16, reputacion: 12 } });
    }
    c.push({ t: 'Grabarlo todo y venderlo a la prensa',
      out: 'El vídeo se paga bien. Sale tu codo en el encuadre.',
      canonMarca: ['padme', 'ignorada'],
      fx: { creditos: 26000, alineamiento: -18, notoriedad: 14 } });

    return { gen: true, id: 'canon_padme', t: cab, c: c, canon: { n: 'Padmé Amidala' } };
  };

  /* ---- Anakin viene después, para bien o para mal ---- */
  SW.GUION.push({
    id: 'cc_anakin_gracias', min: 12, max: 200, prio: 86, unaVez: true,
    req: function (s) {
      return SW.estadoCanon(s, 'padme') === 'salvada' && s.era === 'guerras_clon';
    },
    t: '<span class="canon-tag">ENCUENTRO</span> Te para un jedi joven con cara de pocos amigos y una frase preparada: <b>Anakin Skywalker</b> te da las gracias por lo de la senadora. No dice por qué le importa tanto.',
    c: [
      { t: 'Restarle importancia', fx: { carisma: 10, cordura: 6 },
        rel: { tipo: 'aliado', afecto: 55, canon: 'Anakin Skywalker', quien: 'el Héroe Sin Miedo' },
        conocerN: 'Anakin Skywalker',
        out: '"Si algún día necesitas algo, pregunta por mí en el Templo." Y lo dice en serio.' },
      { t: 'Pedirle que te entrene', req: function (s) { return !!s.sensible; },
        fx: { fuerza: 18, destreza: 10, cordura: -4 },
        rel: { tipo: 'mentor', afecto: 45, canon: 'Anakin Skywalker', quien: 'el Héroe Sin Miedo' },
        conocerN: 'Anakin Skywalker',
        out: 'Te enseña tres cosas. Dos no vienen en ningún manual del Templo.' },
      { t: 'Pedirle un favor concreto: que te saquen de un lío',
        fx: { reputacion: 10 }, limpiarBusca: true, conocerN: 'Anakin Skywalker',
        out: 'Habla con quien tiene que hablar. Tu ficha se queda muy corta de repente.' },
      { t: 'Preguntarle qué es ella para él', fx: { intelecto: 8, cordura: -6 },
        conocerN: 'Anakin Skywalker', flag: 'sabe_lo_de_anakin',
        out: 'Se le tensa la mandíbula. "Una amiga." Ahora sabes algo que no deberías saber.' },
      { t: 'Cobrarle el favor', fx: { creditos: 15000, alineamiento: -12, reputacion: -8 },
        conocerN: 'Anakin Skywalker', out: 'Paga. Y te apunta en una lista mental.' }
    ]
  });

  SW.GUION.push({
    id: 'cc_anakin_venganza', min: 12, max: 200, prio: 95, unaVez: true,
    req: function (s) {
      const e = SW.estadoCanon(s, 'padme');
      return (e === 'atacada' || e === 'muerto') && s.era === 'guerras_clon';
    },
    t: '<span class="canon-tag">ENCUENTRO</span> Llevas meses notando que alguien pregunta por ti. Hoy deja de preguntar. <b>Anakin Skywalker</b> está en la puerta y no viene a detenerte.',
    c: [
      { t: 'Sable contra sable', combate: { dif: 94, duelo: true, sable: true, aMuerte: true, canon: 'anakin' },
        conocerN: 'Anakin Skywalker' },
      { t: 'Intentar razonar con él', req: function (s) { return s.stats.carisma > 70; },
        r: [{ p: 0.3, t: 'Le haces dudar tres segundos. Con eso te basta para salir por la ventana.', fx: { carisma: 14, cordura: -12 }, mover: 'cerca', motivo: 'poniendo mucha distancia' },
            { p: 0.7, t: 'No hay nada que razonar.', combate: { dif: 94, duelo: true, sable: true, aMuerte: true, canon: 'anakin' } }],
        conocerN: 'Anakin Skywalker' },
      { t: 'Huir antes de que encienda el sable',
        r: [{ p: 0.45, t: 'Escapas. Vas a vivir mirando hacia atrás.', fx: { cordura: -18, destreza: 10 }, mover: 'cerca', motivo: 'huyendo de Anakin Skywalker' },
            { p: 0.55, t: 'Te alcanza en el hangar.', combate: { dif: 94, duelo: true, sable: true, aMuerte: true, canon: 'anakin' } }] },
      { t: 'Ofrecerle lo que sabes de quien te pagó',
        fx: { alineamiento: 8, cordura: -10, notoriedad: -10 },
        out: 'Escucha. Te deja vivo porque le sirves más así. No es perdón: es aplazamiento.',
        conocerN: 'Anakin Skywalker', flag: 'debe_a_anakin' }
    ]
  });

  /* ============================================================
     VENGADORES GENÉRICOS
     Si matas a una leyenda, alguien viene. Siempre.
     ============================================================ */
  SW.GUION.push({
    id: 'cc_vengador', min: 12, max: 200, prio: 90, repetible: true,
    req: function (s) {
      if (!s.canonPendiente || !s.canonPendiente.length) return false;
      return s.canonPendiente.some(function (id) {
        const v = SW.VENGADORES[id];
        if (!v) return false;
        if (SW.estadoCanon(s, id) !== 'muerto') return false;
        if (v.eras && v.eras.indexOf(s.era) < 0) return false;
        return !s.flags['vengado_' + id];
      });
    },
    gen: true, c: [],
    hazlo: function (g) { return SW.GEN.vengador(g.rng, g.s); }
  });

  SW.GEN.vengador = function (rng, s) {
    const id = (s.canonPendiente || []).filter(function (x) {
      const v = SW.VENGADORES[x];
      return v && SW.estadoCanon(s, x) === 'muerto' && !s.flags['vengado_' + x] &&
             (!v.eras || v.eras.indexOf(s.era) >= 0);
    })[0];
    if (!id) return null;
    const v = SW.VENGADORES[id];
    return {
      gen: true, id: 'cc_veng_' + id,
      t: 'Lo que hiciste tiene quien lo recuerde. ' + v.n + ' te ha encontrado.',
      c: [
        { t: 'Plantarle cara', combate: { dif: v.dif, duelo: true, sable: v.sable, aMuerte: true, canon: id + '_veng' },
          flag: 'vengado_' + id },
        { t: 'Pagar para que otro se ocupe', coste: 45000, flag: 'vengado_' + id,
          fx: { alineamiento: -12, notoriedad: 10 }, out: 'Sale caro y no del todo bien, pero deja de perseguirte.' },
        { t: 'Desaparecer del mapa', flag: 'vengado_' + id, mover: 'cerca',
          motivo: 'con otro nombre', fx: { cordura: -12, reputacion: -14, creditos: -12000 },
          out: 'Otro nombre, otro planeta, la misma cara en el espejo.' },
        { t: 'Entregarte y contarlo todo', flag: 'vengado_' + id,
          fx: { alineamiento: 18, cordura: 10, reputacion: -10 }, carcel: 4,
          out: 'Al menos duermes.' }
      ]
    };
  };

  /* ============================================================
     LOS AMIGOS TAMBIÉN VUELVEN
     Si te ganaste a una leyenda, un día te llama.
     ============================================================ */
  SW.GUION.push({
    id: 'cc_favor_leyenda', min: 16, max: 200, prio: 62, repetible: true,
    req: function (s) {
      return (s.relaciones || []).some(function (r) {
        return r.canon && r.afecto > 40 && !r.vivo === false;
      }) && !s.flags.favor_leyenda_este_año;
    },
    gen: true, c: [],
    hazlo: function (g) { return SW.GEN.favorLeyenda(g.rng, g.s); }
  });

  const ENCARGOS = [
    { t: 'necesita que lleves un paquete sin abrirlo a {x}', fx: { creditos: 20000, reputacion: 8 }, riesgo: 40 },
    { t: 'quiere que le hagas de testigo en algo incómodo', fx: { reputacion: 14, alineamiento: 8 }, riesgo: 20 },
    { t: 'te pide que escondas a alguien una temporada', fx: { alineamiento: 14, cordura: -6 }, riesgo: 55 },
    { t: 'necesita un piloto y no se fía de nadie más', fx: { destreza: 10, creditos: 24000 }, riesgo: 60 },
    { t: 'quiere que le presentes a la gente que conoces en {p}', fx: { carisma: 12, reputacion: 8 }, riesgo: 10 },
    { t: 'te pide dinero, y le cuesta pedirlo', fx: { alineamiento: 10 }, riesgo: 0 },
    { t: 'quiere que le acompañes a una reunión donde puede no salir vivo', fx: { fisico: 8 }, riesgo: 75 }
  ];

  SW.GEN.favorLeyenda = function (rng, s) {
    const r = rng.pick((s.relaciones || []).filter(function (x) { return x.canon && x.afecto > 40; }));
    if (!r) return null;
    const e = rng.pick(ENCARGOS);
    const txt = e.t.replace('{x}', SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, s.mundo) : 'otro sistema')
                   .replace('{p}', s.mundo);
    return {
      gen: true, id: 'cc_favor',
      t: '<b>' + r.nombre + '</b> te llama después de mucho tiempo. No es una visita de cortesía: ' + txt + '.',
      c: [
        { t: 'Hacerlo sin preguntar', fx: e.fx, afectoNombre: { nombre: r.nombre, delta: 15, nota: 'le hiciste un favor sin preguntar' },
          combate: e.riesgo > 50 ? { dif: e.riesgo, canon: 'favor' } : null },
        { t: 'Hacerlo, pero enterándote antes de qué va',
          fx: Object.assign({ intelecto: 8 }, e.fx), afectoNombre: { nombre: r.nombre, delta: 6, nota: 'le ayudaste, con condiciones' } },
        { t: 'Cobrarle', fx: { creditos: 22000, alineamiento: -8 }, afectoNombre: { nombre: r.nombre, delta: -20, nota: 'le cobraste un favor' } },
        { t: 'Decir que no', fx: { cordura: 4 }, afectoNombre: { nombre: r.nombre, delta: -25, nota: 'le dijiste que no' },
          out: 'No insiste. Eso es lo peor.' }
      ]
    };
  };

  /* ============================================================
     OTRAS ESCENAS CANÓNICAS CON PESO
     ============================================================ */
  SW.GEN.canonPeso = function (rng, s) {
    const lista = [];
    const era = s.era;
    const sensible = s.sensible && s.stats.fuerza > 25;

    if (era === 'guerras_clon') {
      lista.push({
        id: 'cp_dooku', t: '<span class="canon-tag">ENCUENTRO</span> <b>El Conde Dooku</b> te recibe en una sala demasiado grande. Sabe tu nombre, tu mundo y lo que te deben.',
        c: [{ t: 'Escuchar su oferta', fx: { creditos: 40000, alineamiento: -18, intelecto: 8 }, flag: 'trabaja_para_dooku', faccion: 'separatistas+25' },
            { t: 'Retarle', combate: { dif: 90, duelo: true, sable: true, aMuerte: true, canon: 'dooku' } },
            { t: 'Pedirle que te enseñe', req: function (st) { return !!st.sensible; }, fx: { fuerza: 20, alineamiento: -24, cordura: -10 }, flag: 'aprendiz_de_dooku' },
            { t: 'Aceptar y avisar a la República', fx: { intelecto: 14, reputacion: 12 }, buscado: 25, faccion: 'republica+20' }]
      });
      lista.push({
        id: 'cp_grievous', t: '<span class="canon-tag">ENCUENTRO</span> El pasillo se llena de tos metálica. <b>El General Grievous</b> viene andando y no tiene prisa.',
        c: [{ t: 'Pelear', combate: { dif: 88, duelo: true, sable: !!s.sable, aMuerte: true, canon: 'grievous' } },
            { t: 'Cortar el pasillo y sellarlo', fx: { intelecto: 14, destreza: 10 }, out: 'Se queda al otro lado. Le oyes arañar la puerta un rato.' },
            { t: 'Fingir que eres personal separatista', fx: { carisma: 14, cordura: -10 }, r: [{ p: 0.6, t: 'Pasa de largo.', fx: { carisma: 8 } }, { p: 0.4, t: 'No cuela.', combate: { dif: 88, duelo: true, aMuerte: true, canon: 'grievous' } }] },
            { t: 'Correr', fx: { destreza: 8, cordura: -14 } }]
      });
    }
    if (era === 'imperio_temprano' || era === 'rebelion') {
      lista.push({
        id: 'cp_vader', t: '<span class="canon-tag">ENCUENTRO</span> La respiración se oye antes que los pasos. <b>Darth Vader</b> ha venido en persona, que es la peor noticia posible.',
        c: [{ t: 'Arrodillarte', fx: { cordura: -16, alineamiento: -10 }, out: 'Pasa por delante de ti sin mirarte. Vives.' },
            { t: 'Pelear', combate: { dif: 97, duelo: true, sable: true, aMuerte: true, canon: 'vader' } },
            { t: 'Darle lo que busca', fx: { alineamiento: -22, cordura: -12, creditos: -20000 }, out: 'Se lo lleva. No da las gracias.' },
            { t: 'Ganar tiempo para que otros escapen', fx: { alineamiento: 25, reputacion: 20 }, combate: { dif: 97, duelo: true, sable: !!s.sable, aMuerte: true, canon: 'vader' } }]
      });
      lista.push({
        id: 'cp_inquisidor', t: '<span class="canon-tag">ENCUENTRO</span> Un <b>Inquisidor</b> lleva tres días haciendo preguntas sobre alguien con tu descripción.',
        c: [{ t: 'Emboscarle tú primero', combate: { dif: 80, duelo: true, sable: !!s.sable, aMuerte: true, canon: 'inquisidor' }, fx: { alineamiento: 8 } },
            { t: 'Esconder lo que eres y aguantar', req: function (st) { return !!st.sensible; }, fx: { cordura: -14, fuerza: -6 }, out: 'Cortas tu conexión durante semanas. Funciona. Duele.' },
            { t: 'Entregarle a otro sensible para quitártelo de encima', fx: { alineamiento: -30, cordura: -18, notoriedad: 12 }, out: 'Se lo llevan a él. Tú duermes en tu cama.' },
            { t: 'Salir del planeta hoy mismo', mover: 'cerca', motivo: 'con lo puesto', fx: { creditos: -10000, cordura: -8 } }]
      });
    }
    if (sensible) {
      lista.push({
        id: 'cp_voz', t: 'Alguien te habla por la Fuerza sin estar delante. La voz sabe cosas que no has contado a nadie.',
        c: [{ t: 'Contestar', fx: { fuerza: 16, cordura: -10 }, ojo: true },
            { t: 'Cerrarte', fx: { cordura: 10, fuerza: -6 } },
            { t: 'Buscar de dónde viene', fx: { fuerza: 10, intelecto: 10 }, mover: 'cerca', motivo: 'siguiendo una voz' },
            { t: 'Contárselo a tu maestro', req: function (st) { return !!st.maestro; }, fx: { cordura: 8, fuerza: 6 } }]
      });
    }
    const nuevas = lista.filter(function (x) { return !s.flags['esc_' + x.id]; });
    if (!nuevas.length) return null;
    const e = rng.pick(nuevas);
    s.flags['esc_' + e.id] = true;
    return { gen: true, id: e.id, t: e.t, c: e.c };
  };

  SW.GUION.push({
    id: 'cc_peso', min: 14, max: 200, prio: 58, repetible: true,
    req: function (s) {
      const fama = (s.stats.reputacion + s.stats.notoriedad) / 200;
      return fama > 0.35 && !!SW.GEN.canonPeso;
    },
    gen: true, c: [],
    hazlo: function (g) { return SW.GEN.canonPeso(g.rng, g.s); }
  });

})(typeof window !== 'undefined' ? window : globalThis);

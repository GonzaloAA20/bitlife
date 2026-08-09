/* ============================================================
   HOLOVIDA :: CAMINOS EXCLUYENTES Y TIEMPO QUE PASA
   Tres arreglos de fondo:

   1) No se puede ser jedi y senador a la vez. Ni jedi y sith. Los
      caminos con voto de por medio se excluyen, y para cambiar
      hay que salirse del anterior con sus consecuencias.

   2) Formarse LLEVA AÑOS. Antes matricularte en algo de ocho años
      te lo daba entero en un año y seguías con tu vida. Ahora los
      años pasan: el mundo sigue, envejeces y sales con el título.

   3) Cambiar de bando de verdad: un jedi que cae tiene que romper
      con la Orden, y entonces el sable cambia de color, se busca
      aprendiz y se puede conspirar.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     1. CAMINOS QUE NO CABEN JUNTOS
     ============================================================ */
  SW.CAMINOS = {
    jedi:     { n: 'la Orden Jedi', choca: ['sith', 'politico', 'imperial'] },
    sith:     { n: 'el lado oscuro', choca: ['jedi', 'politico'] },
    politico: { n: 'la carrera política', choca: ['jedi', 'sith'] },
    imperial: { n: 'el Imperio', choca: ['jedi'] }
  };

  /** ¿puedes meterte en esto ahora mismo? */
  SW.caminoLibre = function (s, nuevo) {
    const c = SW.CAMINOS[nuevo];
    if (!c) return true;
    const actual = s.trabajo;
    if (!actual) return true;
    return c.choca.indexOf(actual) < 0;
  };

  /** el evento que te obliga a elegir antes de entrar en el otro */
  SW.GEN = SW.GEN || {};
  SW.GEN.dejarCamino = function (rng, s, nuevo) {
    const viejo = s.trabajo;
    const vn = (SW.CAMINOS[viejo] || {}).n || 'lo que haces ahora';
    const nn = (SW.CAMINOS[nuevo] || {}).n || 'lo nuevo';
    const c = [];

    if (viejo === 'jedi') {
      c.push({ t: 'Devolver el sable y dejar la Orden', dejarOrden: true, tomarCamino: nuevo,
        fx: { fuerza: -12, cordura: -10, alineamiento: -4 }, faccion: 'orden_jedi-30',
        sub: 'Sales por la puerta. Pierdes parte de lo que eras.',
        out: 'Dejas el sable en la mesa del Consejo. Nadie te lo impide y eso duele más.' });
      c.push({ t: 'Irte sin decir nada y quedarte el sable', dejarOrden: true, tomarCamino: nuevo,
        fx: { cordura: -14, notoriedad: 12, alineamiento: -10 }, faccion: 'orden_jedi-50',
        flag: 'renegado', sub: 'Te van a buscar' });
    } else if (viejo === 'sith') {
      c.push({ t: 'Romper con tu maestro', dejarOrden: true, tomarCamino: nuevo,
        combate: { dif: 76, duelo: true, sable: true, aMuerte: true },
        sub: 'No se dimite del lado oscuro' });
      c.push({ t: 'Fingir que sigues y llevar las dos cosas', fx: { cordura: -16, intelecto: 8 },
        flag: 'doble_vida', tomarCamino: nuevo, sub: 'Se sostiene mientras se sostenga' });
    } else if (viejo === 'politico') {
      c.push({ t: 'Dimitir del cargo', dejarCargo: true, tomarCamino: nuevo,
        fx: { reputacion: -12, cordura: 8 }, sub: 'Se acabó la política' });
      c.push({ t: 'Que te echen y salir por la puerta de atrás', dejarCargo: true, tomarCamino: nuevo,
        fx: { reputacion: -24, notoriedad: 8 } });
    } else {
      c.push({ t: 'Dejar lo que hacías', dejarCargo: true, tomarCamino: nuevo, fx: { cordura: -4 } });
    }
    c.push({ t: 'Seguir con ' + vn + ' y olvidar lo otro', volver: true, fx: { cordura: 4 } });

    return {
      id: 'cm_choque', gen: true,
      t: '<span class="scene-tag">NO CABEN LAS DOS</span>' +
         '<p>Estás en <b>' + vn + '</b> y te ofrecen entrar en <b>' + nn + '</b>.</p>' +
         '<p>Una cosa excluye a la otra. Hay que elegir.</p>',
      c: c
    };
  };

  /* ============================================================
     2. FORMARSE LLEVA AÑOS
     ============================================================ */
  SW.DURACION_ESTUDIO = {
    // años que se van de verdad de tu vida
    academia_militar: 4, universidad: 4, ingenieria: 5, medicina: 6,
    pilotaje: 3, derecho: 5, comercio: 3, criminologia: 4,
    templo_jedi: 8, academia_sith: 6, mecanica: 2, arte: 3
  };

  SW.añosDeEstudio = function (id) {
    return SW.DURACION_ESTUDIO[id] || 3;
  };

  /* ============================================================
     3. CAER AL LADO OSCURO DE VERDAD
     ============================================================ */
  SW.GUION = SW.GUION || [];
  SW.GUION.push({
    id: 'cm_caida', min: 16, max: 200, prio: 76, unaVez: true,
    req: function (s) {
      return s.trabajo === 'jedi' && s.stats.alineamiento < -35 && s.stats.fuerza > 40;
    },
    t: 'Llevas tiempo haciendo cosas que en el Consejo no se cuentan. Alguien te lo dice a la cara: ' +
       'ya no eres de los suyos.',
    c: [
      { t: 'Reconocerlo y caer del todo', dejarOrden: true, tomarCamino: 'sith',
        fx: { fuerza: 20, alineamiento: -25, cordura: -14 }, sableRojo: true,
        faccion: 'orden_jedi-60', flag: 'cayo_del_lado_oscuro',
        out: 'Sangras el cristal esa misma noche. Sale rojo, como sale siempre.' },
      { t: 'Volver al Código y hacer penitencia', fx: { alineamiento: 30, fuerza: -8, cordura: 10 },
        out: 'Cuesta años. Nadie te lo agradece.' },
      { t: 'Irte de todo y no ser nada', dejarOrden: true, fx: { cordura: 12, fuerza: -10, reputacion: -8 },
        out: 'Te quitas la túnica y te buscas la vida.' }
    ]
  });

  /* ============================================================
     LO QUE PUEDE HACER UN SITH Y ANTES NO PODÍA
     ============================================================ */
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.ACTIVIDADES.push({
    id: 'oscuro', n: 'Lado oscuro', ico: '☾', desc: 'Aprendiz, conspiración, cacería de jedi y el trono.', min: 14,
    req: function (s) { return s.trabajo === 'sith' || !!s.flags.cayo_del_lado_oscuro; }
  });

  SW.menuOscuro = function (g) {
    const s = g.s;
    const c = [];
    // el sable
    if (s.sable && s.sable.color !== 'rojo') {
      c.push({ t: 'Sangrar el cristal', sableRojo: true, fx: { fuerza: 8, alineamiento: -10, cordura: -6 },
        sub: 'El kyber grita y se vuelve rojo. Es lo que se hace.' });
    } else if (!s.sable) {
      // un señor oscuro sin sable no es nadie: hay tres formas de tener uno
      if (s.kyber) {
        c.push({ t: 'Forjar tu sable con el cristal que tienes', construirSable: true,
          sub: 'Y sangrarlo después' });
      } else {
        c.push({ t: 'Arrancarle el cristal a un jedi', cazarJedi: true,
          sub: 'Su sable será tuyo si ganas' });
        c.push({ t: 'Comprar un cristal en el mercado negro', coste: 25000, kyber: true,
          req: function (st) { return st.stats.creditos >= 25000; },
          sub: '25.000 y ninguna pregunta' });
      }
    }
    // aprendiz
    if (!s.aprendizSith) {
      c.push({ t: 'Buscar un aprendiz', buscarAprendiz: true,
        sub: 'La Regla de los Dos. Te será útil hasta que deje de serlo.' });
    } else {
      c.push({ t: 'Entrenar a tu aprendiz', entrenarAprendiz: true,
        sub: 'Cuanto más fuerte, más peligroso para ti' });
      c.push({ t: 'Usarlo para algo sucio', aprendizSucio: true,
        sub: 'Que se manche él' });
      c.push({ t: 'Deshacerte de él antes de que crezca', matarAprendiz: true,
        sub: 'Antes de que se le ocurra a él' });
    }
    // conspirar
    c.push({ t: 'Tejer una conspiración', generar: 'conspiracion',
      sub: 'Infiltrarte, comprar voluntades, mover piezas' });
    if (SW.ordenActiva && SW.ordenActiva(s.era)) {
      c.push({ t: 'Cazar a un jedi', cazarJedi: true, sub: 'Uno menos. Y más ruido.' });
    }
    c.push({ t: 'Buscar un holocrón sith', fx: { fuerza: 12, alineamiento: -8, salud: -8 },
      poder: 'auto_oscuro', sub: 'Lo que enseñan no se olvida' });
    c.push({ t: '◂ Volver', volver: true });

    return {
      id: 'menu_oscuro', gen: true, esMenu: true,
      t: 'EL LADO OSCURO — Fuerza ' + s.stats.fuerza + ' · alineamiento ' + SW.etiquetaAlineamiento(s.stats.alineamiento) +
         (s.aprendizSith ? '<br><span class="dim">Tu aprendiz: ' + s.aprendizSith.n + ' (poder ' + s.aprendizSith.poder + ')</span>' : ''),
      c: c
    };
  };

  /* ---- conspiraciones ---- */
  const TRAMAS = [
    { n: 'infiltrar a alguien tuyo en el Senado', dif: 60, premio: { creditos: 40000, notoriedad: 8 }, flag: 'topo_en_el_senado' },
    { n: 'comprar a un moff de sector', dif: 55, premio: { creditos: 30000, reputacion: -6 }, flag: 'moff_comprado' },
    { n: 'provocar una guerra pequeña entre dos mundos', dif: 70, premio: { notoriedad: 20, alineamiento: -20 }, flag: 'guerra_provocada' },
    { n: 'hacerte con el cártel de un sector', dif: 65, premio: { creditos: 70000, notoriedad: 18 }, flag: 'controla_un_cartel' },
    { n: 'colocar a tu gente en la flota', dif: 68, premio: { reputacion: 12, notoriedad: 10 }, flag: 'flota_infiltrada' },
    { n: 'quedarte con un yacimiento de kyber', dif: 62, premio: { creditos: 55000 }, flag: 'kyber_propio' }
  ];
  SW.GEN.conspiracion = function (rng, s) {
    const t = rng.pick(TRAMAS.filter(function (x) { return !s.flags[x.flag]; })) || TRAMAS[0];
    return {
      id: 'cm_conspira', gen: true,
      t: '<span class="scene-tag">CONSPIRACIÓN</span><p>Plan: ' + t.n + '.</p>' +
         '<p class="dim">Dificultad ' + t.dif + ' · se juega con intelecto y carisma</p>',
      c: [
        { t: 'Moverlo tú personalmente', conspira: t, modo: 'directo',
          sub: 'Rápido. Deja tu firma.' },
        { t: 'Hacerlo a través de intermediarios', conspira: t, modo: 'indirecto',
          sub: 'Lento y limpio' },
        { t: 'Usar la Fuerza para empujar voluntades', req: function (st) { return st.stats.fuerza > 45; },
          conspira: t, modo: 'fuerza', sub: 'Nadie sabrá por qué cambió de opinión' },
        { t: 'Dejarlo para otro año', volver: true }
      ]
    };
  };

  SW.resolverConspiracion = function (g, t, modo) {
    const s = g.s, rng = g.rng;
    let p;
    if (modo === 'directo') p = U.clamp(0.3 + (s.stats.carisma - t.dif) / 130, 0.08, 0.85);
    else if (modo === 'indirecto') p = U.clamp(0.28 + (s.stats.intelecto - t.dif) / 130, 0.08, 0.85);
    else p = U.clamp(0.34 + (s.stats.fuerza - t.dif) / 120, 0.08, 0.9);

    if (rng.chance(p)) {
      g.log('Sale. ' + U.titleCase(t.n) + ': hecho.', 'bien');
      g.aplicarFx(t.premio, {});
      s.flags[t.flag] = true;
      s.contadores.tramas = (s.contadores.tramas || 0) + 1;
      g.hito('Conspiración: ' + t.n);
    } else {
      g.log('No sale. Y alguien ha visto tu mano.', 'mal');
      g.aplicarFx({ notoriedad: 10, cordura: -6 }, {});
      s.peligro = (s.peligro || 0) + 14;
      if (modo === 'directo') { s.buscado = Math.min(100, s.buscado + 20); }
    }
  };

  /* ---- el aprendiz ---- */
  SW.buscarAprendiz = function (g) {
    const s = g.s, rng = g.rng;
    const n = SW.genNombreCompleto(rng, rng.pick(['humano', 'zabrak', 'twilek', 'chiss']),
                                   rng.chance(0.5) ? 'm' : 'f');
    s.aprendizSith = { n: n, poder: rng.int(18, 34), lealtad: rng.int(30, 60) };
    g.log('Tomas a <b>' + n + '</b> como aprendiz. Es la Regla de los Dos: uno para encarnar el poder, otro para ansiarlo.', 'rel');
    g.añadirRelacion('aprendiz', 30, n, 'tu aprendiz');
    g.hito('Toma un aprendiz: ' + n);
  };

  SW.pasoAprendiz = function (g) {
    const s = g.s, rng = g.rng;
    const a = s.aprendizSith;
    if (!a) return;
    a.poder += rng.int(2, 5);
    // cuando te supera y no te quiere, ataca
    if (a.poder > s.stats.fuerza * 0.9 && a.lealtad < 40 && rng.chance(0.35)) {
      g.log('<b>' + a.n + '</b> ha esperado el momento. Es hoy.', 'mal');
      s.aprendizSith = null;
      g.iniciarCombate({ dif: Math.round(a.poder + 20), duelo: true, sable: true, aMuerte: true });
    }
  };

  /* ============================================================
     LAS GUERRAS OCURREN
     Si vives en una era con guerra, la guerra pasa: no puede ser
     que atravieses las Guerras Clon sin enterarte.
     ============================================================ */
  SW.GUERRAS = {
    guerras_clon: { n: 'las Guerras Clon', dura: 3 },
    rebelion: { n: 'la Guerra Civil Galáctica', dura: 5 },
    primera_orden: { n: 'la guerra contra la Primera Orden', dura: 3 },
    alta_republica: { n: 'la crisis de los Nihil', dura: 4 }
  };


})(typeof window !== 'undefined' ? window : globalThis);

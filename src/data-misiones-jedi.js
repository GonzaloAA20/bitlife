/* ============================================================
   HOLOVIDA :: MISIONES DE LA ORDEN
   Ser jedi era ir a «Entrenar la Fuerza» y poco más. Ahora hay una
   pestaña propia: el Consejo te asigna misiones concretas, en tres
   fases (llegar, averiguar, resolver), con reto de concentración y
   con la posibilidad de volver mal.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};

  SW.esJedi = function (s) {
    return s.trabajo === 'jedi' || (s.padawan && s.trabajo !== 'sith');
  };

  /* ------------------------------------------------------------
     Catálogo de misiones
     ------------------------------------------------------------ */
  SW.MISIONES_JEDI = [
    { id: 'mj_rescate', n: 'Rescate', rango: 0,
      brief: 'Una nave civil se ha estrellado en {d} y hay gente viva bajo los restos.',
      nudo: 'El casco cede por un lado. Si mueves mal una placa, se viene todo abajo.',
      dif: 45, premio: 8000, bien: { alineamiento: 16, reputacion: 14, fuerza: 6 } },
    { id: 'mj_mediar', n: 'Mediación', rango: 0,
      brief: 'Dos clanes de {d} llevan cuarenta años sin hablarse y ahora tienen armas nuevas.',
      nudo: 'Los dos ancianos quieren lo mismo y no lo van a decir delante del otro.',
      dif: 50, premio: 6000, bien: { carisma: 16, alineamiento: 14, reputacion: 12 } },
    { id: 'mj_esclavistas', n: 'Esclavistas', rango: 1,
      brief: 'Un cargamento de esclavos sale de {d} cada dos semanas y nadie lo mira.',
      nudo: 'El capataz tiene a treinta personas con collar y el dedo en el detonador.',
      dif: 62, premio: 12000, bien: { alineamiento: 22, reputacion: 16, fisico: 6 }, combate: 62 },
    { id: 'mj_artefacto', n: 'Artefacto', rango: 1,
      brief: 'En una ruina de {d} hay algo que la Fuerza no quiere que siga ahí.',
      nudo: 'La cámara está sellada por dentro y el mecanismo responde a la mente, no a la mano.',
      dif: 66, premio: 15000, bien: { fuerza: 14, intelecto: 12, reputacion: 8 }, kyber: 0.18 },
    { id: 'mj_padawan', n: 'Padawan perdido', rango: 1,
      brief: 'Un padawan mandado a {d} lleva cuatro meses sin dar señales.',
      nudo: 'Le encuentras. No quiere volver, y lo que ha aprendido aquí no se enseña en el Templo.',
      dif: 58, premio: 9000, bien: { alineamiento: 12, cordura: 10, carisma: 10 } },
    { id: 'mj_bestia', n: 'Bestia', rango: 0,
      brief: 'Algo grande se está comiendo los rebaños de {d} y ya ha probado a un granjero.',
      nudo: 'No está rabiosa: está defendiendo una camada.',
      dif: 55, premio: 7000, bien: { fisico: 12, fuerza: 8, reputacion: 10 }, combate: 58 },
    { id: 'mj_bloqueo', n: 'Bloqueo', rango: 2,
      brief: 'Nadie entra ni sale de {d}. Dentro se acaba la comida.',
      nudo: 'La flota del bloqueo te deja pasar si te identificas. Identificarte cuesta la misión.',
      dif: 70, premio: 18000, bien: { destreza: 12, intelecto: 10, reputacion: 16 } },
    { id: 'mj_espia', n: 'Topo en el Templo', rango: 2,
      brief: 'Alguien pasa las rutas de la Orden a quien no debe. El rastro lleva a {d}.',
      nudo: 'El topo es alguien que conoces y tiene una razón que casi entiendes.',
      dif: 72, premio: 14000, bien: { intelecto: 16, cordura: -6, reputacion: 14 } },
    { id: 'mj_sith', n: 'Sombra', rango: 3,
      brief: 'En {d} hay un usuario del lado oscuro y el Consejo quiere saber de quién es aprendiz.',
      nudo: 'Te estaba esperando. Lleva esperándote desde antes de que te asignaran la misión.',
      dif: 84, premio: 25000, bien: { fuerza: 18, reputacion: 20, cordura: -10 }, combate: 84, sable: true },
    { id: 'mj_holocron', n: 'Holocrón', rango: 2,
      brief: 'Un holocrón de la Orden se subastará en {d} dentro de dos días.',
      nudo: 'La sala está llena y hay tres pujadores que no son coleccionistas.',
      dif: 68, premio: 16000, bien: { intelecto: 14, fuerza: 10, reputacion: 10 } },
    { id: 'mj_plaga', n: 'Plaga', rango: 1,
      brief: 'Una enfermedad se lleva a los niños de {d} y el laboratorio no da abasto.',
      nudo: 'Hay dosis para la mitad. Alguien tiene que decidir para qué mitad.',
      dif: 60, premio: 10000, bien: { alineamiento: 14, intelecto: 12, cordura: -8 } },
    { id: 'mj_corrupcion', n: 'Corrupción', rango: 2,
      brief: 'El gobernador de {d} pide ayuda a la Orden y no dice contra quién.',
      nudo: 'El corrupto es el que pidió la ayuda, y lo sabe todo el mundo menos el Consejo.',
      dif: 64, premio: 13000, bien: { intelecto: 14, alineamiento: 12, reputacion: 10 } },
    { id: 'mj_reliquia', n: 'Reliquia sith', rango: 3,
      brief: 'Un templo enterrado en {d} lleva mil años llamando y por fin alguien contestó.',
      nudo: 'La piedra te enseña una vida entera que no has vivido y te la ofrece.',
      dif: 80, premio: 20000, bien: { fuerza: 20, cordura: -14, intelecto: 12 }, tentacion: true },
    { id: 'mj_refugiados', n: 'Éxodo', rango: 0,
      brief: 'Hay que sacar a nueve mil personas de {d} antes de que llegue el frente.',
      nudo: 'Caben ocho mil. Los pilotos preguntan a quién dejan.',
      dif: 58, premio: 9000, bien: { alineamiento: 20, cordura: -10, reputacion: 16 } },
    { id: 'mj_terror', n: 'Célula', rango: 2,
      brief: 'Una célula ha puesto tres bombas en {d} y dice que hay una cuarta.',
      nudo: 'El detenido dice la verdad a medias. Sacarle el resto tiene un precio.',
      dif: 70, premio: 15000, bien: { intelecto: 14, cordura: -8, reputacion: 14 } },
    { id: 'mj_maestro', n: 'El maestro caído', rango: 3,
      brief: 'Un maestro de la Orden ha desaparecido en {d} después de matar a su padawan.',
      nudo: 'No está loco. Está convencido, que es peor.',
      dif: 82, premio: 22000, bien: { fuerza: 14, cordura: -12, reputacion: 18 }, combate: 82, sable: true }
  ];

  function mundoMision(rng, s) {
    const m = SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, s.mundo) : s.mundo;
    return m || s.mundo;
  }

  function rangoDe(s) {
    if (/maestro/i.test(s.rango || '')) return 3;
    if (/caballero/i.test(s.rango || '')) return 2;
    if (s.stats.fuerza > 55) return 2;
    if (s.stats.fuerza > 30) return 1;
    return 0;
  }

  /* ------------------------------------------------------------
     Pestaña de la Orden
     ------------------------------------------------------------ */
  SW.menuOrden = function (g) {
    const s = g.s, rng = g.rng;
    if (s.mision) return SW.pasoMision(g);

    const r = rangoDe(s);
    const pool = SW.MISIONES_JEDI.filter(function (m) {
      return m.rango <= r + 1 && !s.flags['mision_' + m.id];
    });
    const libres = pool.length ? pool : SW.MISIONES_JEDI.filter(function (m) { return m.rango <= r + 1; });
    const ofertas = [];
    const copia = libres.slice();
    for (let i = 0; i < 3 && copia.length; i++) {
      const m = copia.splice(rng.int(0, copia.length - 1), 1)[0];
      ofertas.push({ m: m, mundo: mundoMision(rng, s) });
    }

    const c = ofertas.map(function (o) {
      return {
        t: o.m.n + ' — ' + o.mundo,
        sub: o.m.brief.replace('{d}', o.mundo) + ' (dificultad ' + o.m.dif + ')',
        aceptaMision: { id: o.m.id, mundo: o.mundo }
      };
    });
    c.push({ t: 'Quedarte en el Templo a entrenar', fuerzaMenu: true });
    c.push({ t: 'Pedir permiso para ocuparte de un asunto propio', fx: { cordura: 8 },
      out: 'Te lo dan a regañadientes. La Orden lleva la cuenta de estas cosas.' });

    return { gen: true, id: 'orden_menu',
      t: '<span class="scene-tag">SALA DE ASIGNACIONES</span><p>El Consejo tiene tres cosas abiertas y tú una tarde libre.</p>',
      c: c };
  };

  /* ------------------------------------------------------------
     Ciclo de una misión: viaje → nudo → resolución
     ------------------------------------------------------------ */
  SW.aceptarMision = function (g, d) {
    const s = g.s;
    const m = SW.MISIONES_JEDI.filter(function (x) { return x.id === d.id; })[0];
    if (!m) return;
    s.mision = { id: m.id, mundo: d.mundo, fase: 'viaje', pistas: 0 };
    s.flags['mision_' + m.id] = true;
    g.log('Misión aceptada: <b>' + m.n + '</b>, en ' + d.mundo + '.', 'bien');
    if (s.mundo !== d.mundo) g.mover(d.mundo, 'te manda el Consejo');
  };

  SW.abandonarMision = function (g, motivo) {
    const s = g.s;
    if (!s.mision) return;
    g.log('Dejas la misión sin terminar. ' + (motivo || ''), 'mal');
    g.aplicarFx({ reputacion: -12, cordura: -6 }, {});
    s.faccionRep.orden_jedi = (s.faccionRep.orden_jedi || 0) - 15;
    s.mision = null;
  };

  SW.pasoMision = function (g) {
    const s = g.s, rng = g.rng;
    const mi = s.mision;
    if (!mi) return null;
    const m = SW.MISIONES_JEDI.filter(function (x) { return x.id === mi.id; })[0];
    if (!m) { s.mision = null; return null; }

    if (s.mundo !== mi.mundo) {
      return { gen: true, id: 'mj_lejos',
        t: 'Tu misión está en <b>' + mi.mundo + '</b> y tú no.',
        c: [{ t: 'Ir allí ahora', mueveA: mi.mundo, motivo: 'a cumplir el encargo del Consejo' },
            { t: 'Dejarlo estar', abandonaMision: 'El Consejo toma nota.' }] };
    }

    /* --- fase 1: averiguar --- */
    if (mi.fase === 'viaje') {
      mi.fase = 'nudo';
      return { gen: true, id: 'mj_llegada_' + m.id,
        t: '<span class="scene-tag">' + m.n.toUpperCase() + ' · ' + mi.mundo + '</span><p>' +
           m.brief.replace('{d}', mi.mundo) + '</p><p>Lo primero es enterarse de qué pasa de verdad.</p>',
        c: [
          { t: 'Preguntar a la gente del sitio', fx: { carisma: 8, intelecto: 4 }, pista: 1,
            out: 'Tardan en soltarse. Cuando lo hacen, cuentan más de lo que preguntas.' },
          { t: 'Escuchar la Fuerza', req: function (st) { return st.stats.fuerza > 20; },
            retoMision: 'pista',
            sub: 'Reto de concentración' },
          { t: 'Ir directo al sitio y mirar tú', fx: { destreza: 6 }, pista: 1,
            out: 'Ves lo que hay. No ves lo que hubo.' },
          { t: 'Usar la autoridad de la Orden', fx: { reputacion: 6, alineamiento: -4 }, pista: 1,
            out: 'Se cuadran y contestan lo mínimo. Es rápido y es poco.' },
          { t: 'No perder tiempo: ir al grano', out: 'Vas a ciegas.' },
          { t: 'Abandonar la misión', abandonaMision: 'Te vuelves con las manos vacías.' }
        ] };
    }

    /* --- fase 2: el nudo --- */
    if (mi.fase === 'nudo') {
      mi.fase = 'final';
      const bonus = mi.pistas > 0 ? ' <i>(sabes más que ellos: eso cuenta)</i>' : '';
      const dif = Math.max(20, m.dif - mi.pistas * 12);
      const c = [];
      c.push({ t: 'Resolverlo con la Fuerza', req: function (st) { return st.stats.fuerza > 15; },
        retoMision: 'final', sub: 'Reto de concentración · dificultad ' + dif });
      c.push({ t: 'Resolverlo hablando', req: function (st) { return st.stats.carisma > 35; },
        cierraMision: 'carisma', sub: 'Se juega tu carisma contra ' + dif });
      c.push({ t: 'Resolverlo pensando', req: function (st) { return st.stats.intelecto > 35; },
        cierraMision: 'intelecto', sub: 'Se juega tu intelecto contra ' + dif });
      if (m.combate) {
        c.push({ t: 'Resolverlo peleando',
          combate: { dif: m.combate, duelo: !!m.sable, sable: !!m.sable,
                     aMuerte: m.rango >= 3, mision: true } });
      }
      c.push({ t: 'Resolverlo como lo haría un civil: llamar a quien manda',
        cierraMision: 'flojo' });
      c.push({ t: 'Marcharte de aquí', abandonaMision: 'Algunos nudos no se desatan.' });
      return { gen: true, id: 'mj_nudo_' + m.id,
        t: '<span class="scene-tag">' + m.n.toUpperCase() + ' · EL NUDO</span><p>' + m.nudo + '</p>' + bonus,
        c: c };
    }

    // por si acaso: cerrar
    return SW.cerrarMision(g, 'flojo');
  };

  /** Cierra la misión y reparte lo que toque. `via` decide cómo. */
  SW.cerrarMision = function (g, via, gradoForzado) {
    const s = g.s, rng = g.rng;
    const mi = s.mision;
    if (!mi) return null;
    const m = SW.MISIONES_JEDI.filter(function (x) { return x.id === mi.id; })[0];
    const dif = Math.max(20, m.dif - (mi.pistas || 0) * 12);

    let grado = gradoForzado;
    if (grado == null) {
      let tirada = 0;
      if (via === 'carisma') tirada = s.stats.carisma;
      else if (via === 'intelecto') tirada = s.stats.intelecto;
      else if (via === 'combate') tirada = 65 + s.stats.fisico / 3;
      else tirada = 35 + s.stats.reputacion / 4;
      const p = U.clamp(0.35 + (tirada - dif) / 110, 0.08, 0.95);
      grado = rng.chance(p) ? (rng.chance(0.3) ? 2 : 1) : (rng.chance(0.5) ? 0 : -1);
    }

    s.mision = null;
    s.contadores.misionesJedi = (s.contadores.misionesJedi || 0) + 1;

    if (grado >= 1) {
      const paga = Math.round(m.premio * (grado === 2 ? 1.5 : 1));
      g.aplicarFx(Object.assign({ creditos: paga }, m.bien), {});
      s.faccionRep.orden_jedi = (s.faccionRep.orden_jedi || 0) + (grado === 2 ? 22 : 14);
      g.log(grado === 2
        ? 'Misión resuelta mejor de lo que nadie esperaba. En el Templo se comenta.'
        : 'Misión cumplida. El Consejo lo apunta y pasa a lo siguiente.', 'bien');
      g.hito('Cumple una misión de la Orden: ' + m.n);
      if (m.kyber && rng.chance(m.kyber) && g.darKyber) g.darKyber();
      if (grado === 2 && s.contadores.misionesJedi >= 4 && !/caballero|maestro/i.test(s.rango || '')) {
        s.rango = 'Caballero Jedi';
        g.log('Te nombran <b>Caballero Jedi</b>.', 'bien');
        g.hito('Nombrado Caballero Jedi');
      }
      if (s.contadores.misionesJedi >= 10 && !/maestro/i.test(s.rango || '') && grado === 2) {
        s.rango = 'Maestro Jedi';
        g.log('Te sientan en una silla del Consejo. Sin comentarios: se sienta y ya está.', 'bien');
        g.hito('Nombrado Maestro Jedi');
      }
    } else if (grado === 0) {
      g.aplicarFx({ creditos: Math.round(m.premio * 0.35), cordura: -8, reputacion: 2 }, {});
      g.log('Sale a medias. Alguien se salva y alguien no.', 'res');
    } else {
      g.aplicarFx({ cordura: -14, reputacion: -10, salud: -10 }, {});
      s.faccionRep.orden_jedi = (s.faccionRep.orden_jedi || 0) - 12;
      g.log('Sale mal. De estas se aprende, dicen los que no estaban.', 'mal');
      if (m.tentacion && rng.chance(0.4)) {
        g.log('La piedra sigue hablándote cuando cierras los ojos.', 'mal');
        g.aplicarFx({ alineamiento: -14, fuerza: 8 }, {});
        s.flags.tentado_oscuro = true;
      }
    }
    return null;
  };

  /* El reto de concentración conectado a la misión */
  SW.retoMision = function (g, cual) {
    const s = g.s;
    const mi = s.mision;
    if (!mi) return;
    const m = SW.MISIONES_JEDI.filter(function (x) { return x.id === mi.id; })[0];
    const dif = Math.max(20, m.dif - (mi.pistas || 0) * 10);
    if (cual === 'pista') {
      g.retoFuerza({
        dif: Math.max(20, dif - 15),
        txt: 'Te sientas en el suelo y dejas de preguntar. La Fuerza no habla: enseña.',
        bien: { fx: { intelecto: 6 }, pista: 2, out: 'Lo ves entero. Sabes dónde mirar y a quién no creer.' },
        medio: { pista: 1, out: 'Algo captas. Un nombre, un sitio, poco más.' },
        mal: { fx: { cordura: -6 }, out: 'Solo ruido. Te levantas peor de lo que te sentaste.' }
      });
      return;
    }
    g.retoFuerza({
      dif: dif,
      txt: m.nudo + '\nRespira. Solo hay un orden posible.',
      critico: { cierraMisionGrado: 2 },
      bien: { cierraMisionGrado: 1 },
      medio: { cierraMisionGrado: 0 },
      mal: { cierraMisionGrado: -1 }
    });
  };

  /* ------------------------------------------------------------
     Actividad
     ------------------------------------------------------------ */
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.ACTIVIDADES.push({
    id: 'orden', n: 'La Orden', ico: '✷',
    desc: 'Misiones del Consejo: rescates, mediaciones, sombras.', min: 8,
    req: function (s) { return SW.esJedi(s); }
  });

})(typeof window !== 'undefined' ? window : globalThis);

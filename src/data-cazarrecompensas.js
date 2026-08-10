/* ============================================================
   HOLOVIDA :: EL GREMIO DE CAZARRECOMPENSAS
   Una cadena larga, rara y con varios pasos, no un evento suelto:

     1. Te ofrecen entrar en el Gremio (hay que pagar y valer).
     2. Coges un contrato: objetivo, planeta y condiciones.
     3. Viajas hasta allí. Por el camino pasan cosas.
     4. Buscas al objetivo en ese mundo, con sus pistas.
     5. La captura: se puede hacer por la fuerza, con maña o
        hablando, y cada vía usa tus estadísticas.
     6. La entrega: vivo paga más, y a veces el objetivo te da
        una razón para no entregarle.

   Puede ocuparte varios años. Se puede abandonar a medias, y
   dejar tirado un contrato tiene consecuencias con el Gremio.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     LOS OBJETIVOS
     ============================================================ */
  const TIPOS = [
    { id: 'desertor', n: 'un desertor', dif: 42, pago: 14000,
      por: 'Se largó con la caja de su unidad.', vivo: 1.4,
      pistas: ['bebe en el mismo sitio cada noche', 'ha cambiado de nombre pero no de acento', 'sigue mandando dinero a su familia'] },
    { id: 'estafador', n: 'un estafador', dif: 48, pago: 22000,
      por: 'Vendió participaciones de una mina que no existe.', vivo: 1.6,
      pistas: ['gasta más de lo que dice ganar', 'siempre tiene una historia mejor', 'ha comprado pasaje con tres nombres distintos'] },
    { id: 'contrabandista', n: 'un contrabandista', dif: 58, pago: 30000,
      por: 'Se quedó con una carga que no era suya.', vivo: 1.3,
      pistas: ['su nave tiene la firma cambiada', 'paga sobornos en el puerto', 'nunca duerme dos noches en el mismo sitio'] },
    { id: 'asesino', n: 'un asesino a sueldo', dif: 72, pago: 55000,
      por: 'Cobró por un trabajo y lo hizo demasiado bien.', vivo: 1.2,
      pistas: ['no deja testigos, así que hay pocos', 'usa siempre la misma arma', 'alguien le está escondiendo'] },
    { id: 'jefe', n: 'un jefe de banda', dif: 68, pago: 48000,
      por: 'Se le acabó la protección que tenía comprada.', vivo: 1.5,
      pistas: ['tiene medio barrio de su parte', 'no sale sin cuatro personas detrás', 'su gente cobra los martes'] },
    { id: 'testigo', n: 'un testigo protegido', dif: 40, pago: 26000,
      por: 'Alguien con dinero quiere que no llegue a declarar.', vivo: 2.2,
      pistas: ['le han dado identidad nueva y le queda grande', 'no sabe moverse aquí', 'llama a casa aunque le han dicho que no'] },
    { id: 'sensible', n: 'alguien sensible a la Fuerza', dif: 78, pago: 70000,
      por: 'El encargo no dice por qué. Ese es el problema.', vivo: 1.8, oscuro: true,
      pistas: ['pasan cosas raras donde está', 'los animales se comportan distinto cerca', 'nadie recuerda su cara del todo'] },
    { id: 'droide', n: 'un droide con memoria intacta', dif: 52, pago: 34000,
      por: 'Lo que tiene en la memoria vale más que él.', vivo: 3.0,
      pistas: ['se esconde entre otros droides', 'no puede evitar corregir a la gente', 'necesita repuestos muy concretos'] }
  ];

  const rangoDe = function (cazas) {
    if (cazas >= 12) return { n: 'leyenda del Gremio', mult: 2.2 };
    if (cazas >= 7) return { n: 'cazador veterano', mult: 1.7 };
    if (cazas >= 3) return { n: 'cazador con nombre', mult: 1.3 };
    return { n: 'novato del Gremio', mult: 1 };
  };

  /* ============================================================
     1. ENTRAR EN EL GREMIO
     ============================================================ */
  SW.EVENTOS = SW.EVENTOS || [];
  SW.EVENTOS.push({
    id: 'cz_gremio_entrada', min: 18, max: 200, w: 10,
    slots: { p: 'mundoAqui', l: 'lugar', k: 'banda' },
    req: function (s) {
      if (s.flags.en_el_gremio) return false;
      // ni a cualquiera ni en cualquier sitio: hace falta mano y algo de fama
      const apto = s.stats.fisico > 38 || s.stats.destreza > 42 || s.stats.notoriedad > 25;
      const sitio = ['Nevarro', 'Tatooine', 'Nar Shaddaa', 'Ord Mantell', 'Rodia', 'Sriluur',
                     'Chalmun', 'Batuu', 'Trandosha', 'Nal Hutta', 'Kijimi', 'Corellia', 'Coruscant',
                     'Bespin', 'Takodana', 'Kessel', 'Cantonica', 'Jakku', 'Lothal', 'Malastare',
                     'Akiva', 'Taris', 'Vandor', 'Savareen', 'Ando', 'Kintan'].indexOf(s.mundo) >= 0;
      return apto && (sitio || s.stats.notoriedad > 45);
    },
    t: 'En {l} hay una casa del Gremio de Cazarrecompensas. Se entra pagando y demostrando algo.',
    c: [
      { t: 'Pagar la cuota y entrar', coste: 9000, fx: { notoriedad: 8, reputacion: 4 },
        flag: 'en_el_gremio', sub: '9.000 cr y una placa',
        out: 'Te dan una placa de identificación y una advertencia: los contratos se terminan.' },
      { t: 'Demostrar que vales en vez de pagar', req: function (s) { return s.stats.fisico > 50 || s.stats.destreza > 55; },
        combate: { dif: 58 }, flag: 'en_el_gremio', fx: { notoriedad: 10 },
        sub: 'Una pelea delante de todos', out: 'Te ahorras la cuota. Te ganas la mirada de todos.' },
      { t: 'Preguntar cómo funciona', fx: { intelecto: 8 },
        out: 'Cobras por contrato. Vivo paga más. Si dejas uno a medias, no vuelves a coger otro.' },
      { t: 'No es lo tuyo', volver: true }
    ]
  });

  /* ============================================================
     2. COGER UN CONTRATO
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.GEN.contratoCaza = function (rng, s) {
    const t = rng.pick(TIPOS.filter(function (x) { return !x.oscuro || s.stats.alineamiento < 10; }));
    // el objetivo está en OTRO mundo: hay que ir
    const destino = SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, s.mundo)
                                            : rng.pick(SW.MUNDO_NOMBRES);
    const rango = rangoDe(s.contadores.cazas || 0);
    const pago = Math.round(t.pago * rango.mult * (0.85 + rng.next() * 0.4));
    const nombre = SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'rodiano', 'duros']),
                                        rng.chance(0.5) ? 'm' : 'f');
    const contrato = {
      tipo: t.id, tipoN: t.n, nombre: nombre, destino: destino, dif: t.dif,
      pago: pago, vivo: t.vivo, por: t.por, pista: rng.pick(t.pistas),
      fase: 'viaje', rastro: 0
    };
    return {
      id: 'cz_contrato', gen: true, contrato: contrato,
      t: '<span class="scene-tag">CONTRATO DEL GREMIO</span>' +
         '<p>Objetivo: <b>' + nombre + '</b>, ' + t.n + '.</p>' +
         '<p>' + t.por + '</p>' +
         '<p>Última posición conocida: <b>' + destino + '</b>.</p>' +
         '<p class="dim">Paga ' + U.cr(pago) + ' · vivo multiplica por ' + t.vivo + ' · dificultad ' + t.dif + '</p>',
      c: [
        { t: 'Aceptar el contrato', tomarContrato: true, fx: { notoriedad: 4 } },
        { t: 'Pedir más información antes', fx: { intelecto: 6, creditos: -800 },
          tomarContrato: true, pistaExtra: true, sub: 'Cuesta, pero empiezas con ventaja' },
        { t: 'Rechazarlo', fx: { reputacion: -2 }, volver: true }
      ]
    };
  };

  /* ============================================================
     3. EL VIAJE — pasan cosas por el camino
     ============================================================ */
  const IMPREVISTOS = [
    { t: 'A mitad de ruta te para un control. Preguntan a dónde vas y por qué.',
      c: [{ t: 'Enseñar la placa del Gremio', fx: { carisma: 4 }, out: 'Te dejan pasar. Y queda registrado dónde vas.' },
          { t: 'Mentir', fx: { carisma: 8, intelecto: 4 }, out: 'Cuela. Nadie sabe que vas.' },
          { t: 'Dar media vuelta y rodear', fx: { creditos: -2000, intelecto: 6 }, out: 'Pierdes semanas. Nadie te ha visto.' }] },
    { t: 'Alguien más va a por el mismo objetivo y viaja en tu misma nave.',
      c: [{ t: 'Proponerle ir a medias', fx: { carisma: 10 }, rastro: 2, out: 'Sabe cosas que tú no. Se reparte.' },
          { t: 'Deshacerte de él', fx: { alineamiento: -14, notoriedad: 8 }, combate: { dif: 55 } },
          { t: 'Adelantarle en el puerto', fx: { destreza: 8, intelecto: 6 }, rastro: 1 }] },
    { t: 'Se te avería algo a mitad de salto y hay que parar.',
      c: [{ t: 'Arreglarlo tú', fx: { intelecto: 8, destreza: 6 }, naveEstado: -8 },
          { t: 'Pagar a alguien', fx: { creditos: -6000 } },
          { t: 'Seguir a medio gas', fx: { naveEstado: -22 }, rastro: -1, out: 'Llegas tarde. El rastro se enfría.' }] },
    { t: 'En una escala te llega un aviso: alguien ha ofrecido más dinero por que NO entregues al objetivo.',
      c: [{ t: 'Ignorarlo', fx: { alineamiento: 4 } },
          { t: 'Escuchar la oferta', fx: { intelecto: 6 }, flag: 'oferta_paralela', out: 'Te dan un nombre y una cifra. La cifra es alta.' },
          { t: 'Avisar al Gremio', fx: { reputacion: 8 }, faccion: 'gremio+15' }] },
    { t: 'Reconoces la cara del objetivo en una grabación de un puerto por el que acabas de pasar.',
      c: [{ t: 'Volver atrás a buscar', fx: { intelecto: 8 }, rastro: 2 },
          { t: 'Seguir al destino igual', rastro: 0 },
          { t: 'Comprar la grabación entera', fx: { creditos: -3500, intelecto: 10 }, rastro: 3 }] }
  ];

  SW.GEN.viajeCaza = function (rng, s) {
    const c = s.contrato;
    const im = rng.pick(IMPREVISTOS);
    return {
      id: 'cz_viaje', gen: true, cazaPaso: 'viaje',
      t: '<span class="scene-tag">RUMBO A ' + c.destino.toUpperCase() + '</span><p>' + im.t + '</p>',
      c: im.c.map(function (o) { return Object.assign({ cazaAvanza: true }, o); })
    };
  };

  /* ============================================================
     4. LA BÚSQUEDA — ya en el planeta
     ============================================================ */
  SW.GEN.buscarObjetivo = function (rng, s) {
    const c = s.contrato;
    const d = SW.dosierDe ? SW.dosierDe(s.mundo) : null;
    const sitio = d ? rng.pick(d.hit) : 'el puerto';
    const banda = d ? rng.pick(d.fac) : 'la gente de aquí';
    return {
      id: 'cz_buscar', gen: true, cazaPaso: 'buscar',
      t: '<span class="scene-tag">EN ' + s.mundo.toUpperCase() + '</span>' +
         '<p>Buscas a <b>' + c.nombre + '</b>. Lo que sabes: ' + c.pista + '.</p>' +
         '<p class="dim">Rastro: ' + ['frío', 'tibio', 'caliente', 'lo tienes'][U.clamp(c.rastro, 0, 3)] + '</p>',
      c: [
        { t: 'Preguntar en ' + sitio, cazaBusca: 'preguntar', sub: 'Depende de tu carisma' },
        { t: 'Pagar información a ' + banda, cazaBusca: 'pagar', coste: 4000, sub: 'Rápido y caro' },
        { t: 'Rastrear por tu cuenta', cazaBusca: 'rastrear', sub: 'Depende de tu intelecto y destreza' },
        { t: 'Montar una trampa y esperar', cazaBusca: 'trampa', sub: 'Lento pero muy efectivo si sale' },
        { t: 'Abandonar el contrato', cazaAbandona: true,
          sub: 'El Gremio toma nota, y el aviso no es una forma de hablar: pierdes lo invertido ' +
               'y te cuesta reputación' }
      ]
    };
  };

  SW.resolverBusqueda = function (g, modo) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (!c) return;
    let p, txt;
    if (modo === 'preguntar') {
      p = U.clamp(0.28 + (s.stats.carisma - c.dif) / 150, 0.08, 0.8);
      txt = 'Preguntas sin llamar la atención.';
    } else if (modo === 'pagar') {
      p = U.clamp(0.52 + (s.stats.creditos > 20000 ? 0.1 : 0), 0.3, 0.82);
      txt = 'El dinero abre bocas.';
    } else if (modo === 'rastrear') {
      p = U.clamp(0.24 + (s.stats.intelecto + s.stats.destreza - c.dif * 2) / 190, 0.06, 0.82);
      txt = 'Sigues su rastro como se sigue un rastro.';
    } else {
      p = U.clamp(0.36 + (s.stats.intelecto - c.dif) / 150, 0.1, 0.78);
      txt = 'Montas la trampa y esperas.';
    }
    if (s.habilidades.indexOf('rastreador') >= 0) p += 0.12;
    if (s.habilidades.indexOf('cazarrecompensas') >= 0) p += 0.10;
    if (SW.naveAbre && SW.naveAbre(s, 'buscar')) p += 0.08;

    if (rng.chance(p)) {
      c.rastro = Math.min(3, c.rastro + 1);
      g.log(txt + ' El rastro se calienta.', 'bien');
      g.aplicarFx({ intelecto: 3, destreza: 2 }, {});
    } else {
      c.rastro = Math.max(0, c.rastro - (rng.chance(0.4) ? 1 : 0));
      g.log(txt + ' No sale nada. Y ahora sabe que le buscan.', 'mal');
      g.aplicarFx({ cordura: -3 }, {});
      if (rng.chance(0.22)) {
        g.log(c.nombre + ' te ha visto primero.', 'mal');
        g.iniciarCombate({ dif: c.dif, duelo: false });
        return;
      }
    }
    if (c.rastro >= 3) { c.fase = 'captura'; g.log('Ya sabes dónde duerme. Mañana.', 'bien'); }
  };

  /* ============================================================
     5. LA CAPTURA
     ============================================================ */
  SW.GEN.capturar = function (rng, s) {
    const c = s.contrato;
    return {
      id: 'cz_captura', gen: true, cazaPaso: 'captura',
      t: '<span class="scene-tag">LA CAPTURA</span>' +
         '<p>Tienes a <b>' + c.nombre + '</b> localizado. A partir de aquí solo hay una oportunidad.</p>' +
         '<p class="dim">Vivo paga ×' + c.vivo + '. Muerto, el contrato base.</p>',
      c: [
        { t: 'Entrar por la fuerza', cazaCaptura: 'fuerza', sub: 'Combate. Rápido y sucio.' },
        { t: 'Aturdirle a la primera', cazaCaptura: 'aturdir', minijuegoCaza: true,
          sub: 'Un solo disparo, a tiempo. Si fallas, se acabó lo fácil.' },
        { t: 'Hablar con él antes', cazaCaptura: 'hablar', sub: 'Puede entregarse. O engañarte.' },
        { t: 'Esperar a que salga solo', cazaCaptura: 'esperar', sub: 'Paciencia. Depende de tu intelecto.' }
      ]
    };
  };

  SW.resolverCaptura = function (g, modo) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (!c) return;

    if (modo === 'fuerza') {
      g.log('Entras por la puerta y no hay conversación.', 'res');
      c.fase = 'entrega'; c.estado = 'muerto';
      g.iniciarCombate({ dif: c.dif, contrato: true, botin: 0 });
      c.pendienteCombate = true;
      return;
    }
    if (modo === 'aturdir') {
      const p = U.clamp(0.30 + (s.stats.destreza - c.dif) / 130, 0.08, 0.85);
      if (rng.chance(p)) {
        g.log('Un disparo de aturdimiento limpio. Ni se entera.', 'bien');
        c.estado = 'vivo'; c.fase = 'entrega';
      } else {
        g.log('Fallas el primer disparo y se acabó lo fácil.', 'mal');
        c.estado = 'muerto'; c.fase = 'entrega';
        g.iniciarCombate({ dif: c.dif + 10, contrato: true });
        c.pendienteCombate = true;
      }
      return;
    }
    if (modo === 'hablar') {
      const p = U.clamp(0.26 + (s.stats.carisma - c.dif) / 140, 0.06, 0.8);
      if (rng.chance(p)) {
        g.log('Le convences de que contigo tiene más futuro que huyendo.', 'bien');
        c.estado = 'vivo'; c.fase = 'entrega'; c.hablado = true;
        g.aplicarFx({ carisma: 8 }, {});
      } else {
        g.log('Te da conversación mientras alcanza algo debajo de la mesa.', 'mal');
        c.estado = 'muerto'; c.fase = 'entrega';
        g.iniciarCombate({ dif: c.dif + 6, contrato: true });
        c.pendienteCombate = true;
      }
      return;
    }
    // esperar
    const p = U.clamp(0.34 + (s.stats.intelecto - c.dif) / 140, 0.08, 0.85);
    if (rng.chance(p)) {
      g.log('Sale solo, de madrugada, como llevabas semanas viendo.', 'bien');
      c.estado = 'vivo'; c.fase = 'entrega';
    } else {
      g.log('Sale acompañado. Cuatro personas y ninguna amable.', 'mal');
      c.estado = 'muerto'; c.fase = 'entrega';
      g.iniciarCombate({ dif: c.dif + 14, contrato: true });
      c.pendienteCombate = true;
    }
  };

  /* ============================================================
     6. LA ENTREGA — la última decisión es moral
     ============================================================ */
  SW.GEN.entregar = function (rng, s) {
    const c = s.contrato;
    const vivo = c.estado === 'vivo';
    const pago = Math.round(c.pago * (vivo ? c.vivo : 1));
    const razones = [
      'Dice que el que paga por él es el que hizo lo que le achacan.',
      'Tiene una hija en el planeta de al lado y no ha podido despedirse.',
      'Jura que el Gremio ya sabe que el contrato es falso.',
      'Te ofrece el doble de lo que cobras por soltarle.',
      'No dice nada. Eso es peor que si dijera algo.'
    ];
    const c2 = [
      { t: 'Entregarlo y cobrar', cazaEntrega: 'entregar', sub: U.cr(pago) },
      { t: 'Entregarlo y no preguntar nada más', cazaEntrega: 'entregar', sub: 'Se duerme mejor así, dicen' }
    ];
    if (vivo) {
      c2.push({ t: 'Soltarlo', cazaEntrega: 'soltar', sub: 'No cobras. El Gremio se entera.' });
      c2.push({ t: 'Comprobar si dice la verdad', cazaEntrega: 'comprobar', sub: 'Depende de tu intelecto' });
    }
    return {
      id: 'cz_entrega', gen: true, cazaPaso: 'entrega',
      t: '<span class="scene-tag">LA ENTREGA</span>' +
         '<p>Tienes a <b>' + c.nombre + '</b> ' + (vivo ? 'vivo y esposado' : 'y ya no habla') + '.</p>' +
         (vivo ? '<p>' + rng.pick(razones) + '</p>' : '') +
         '<p class="dim">Cobras ' + U.cr(pago) + '</p>',
      c: c2
    };
  };

  SW.resolverEntrega = function (g, modo) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (!c) return;
    const vivo = c.estado === 'vivo';
    const pago = Math.round(c.pago * (vivo ? c.vivo : 1));

    if (modo === 'entregar') {
      s.stats.creditos += pago;
      s.contadores.cazas = (s.contadores.cazas || 0) + 1;
      const r = rangoDe(s.contadores.cazas);
      g.log('Contrato cerrado. Cobras ' + U.cr(pago) + '. Ahora eres ' + r.n + '.', 'cr');
      g.aplicarFx({ notoriedad: 8, reputacion: 4, alineamiento: vivo ? -2 : -8 }, {});
      g.hito('Cierra un contrato: ' + c.nombre);
      if (!vivo) g.aplicarFx({ cordura: -6 }, {});
    } else if (modo === 'soltar') {
      g.log('Le quitas las esposas y le dices por dónde no hay control.', 'res');
      g.aplicarFx({ alineamiento: 20, cordura: 10, reputacion: -10 }, {});
      s.faccionRep = s.faccionRep || {};
      s.faccionRep.gremio = (s.faccionRep.gremio || 0) - 30;
      g.añadirRelacion('contacto', 55, c.nombre, 'te debe la vida');
      if (rng.chance(0.4)) { s.flags.gremio_desconfia = true; g.log('En el Gremio se enteran. Toman nota.', 'mal'); }
    } else {
      const p = U.clamp(0.3 + (s.stats.intelecto - 45) / 120, 0.1, 0.85);
      if (rng.chance(p)) {
        g.log('Compruebas su historia. Es cierta.', 'bien');
        g.aplicarFx({ intelecto: 10 }, {});
        s.contrato.verdad = true;
        // se vuelve a preguntar, ahora sabiendo
        g.cola.unshift(g.prepararGen({
          id: 'cz_entrega2', gen: true, cazaPaso: 'entrega',
          t: '<p>Es verdad: el contrato lo puso quien hizo lo que le achacan.</p>',
          c: [{ t: 'Entregarlo igual: es tu trabajo', cazaEntrega: 'entregar' },
              { t: 'Soltarlo', cazaEntrega: 'soltar' },
              { t: 'Ir a por quien puso el contrato', cazaEntrega: 'vengar' }]
        }));
        return;
      }
      g.log('No consigues comprobar nada. Se te acaba el tiempo.', 'mal');
      g.cola.unshift(g.prepararGen(SW.GEN.entregar(rng, s)));
      return;
    }
    if (modo === 'vengar') {
      g.log('Vas a por el que puso el contrato.', 'res');
      g.aplicarFx({ alineamiento: 12, notoriedad: 16 }, {});
      g.iniciarCombate({ dif: c.dif + 12, botin: Math.round(pago * 1.5) });
    }
    s.contrato = null;
  };

  /* ============================================================
     EL CICLO: se comprueba cada año si hay contrato en marcha
     ============================================================ */
  SW.pasoCaza = function (g) {
    const s = g.s;
    const c = s.contrato;
    if (!c) return null;
    if (c.pendienteCombate) { c.pendienteCombate = false; }
    if (c.fase === 'viaje') {
      // hay que llegar: con nave es más rápido
      c.viajes = (c.viajes || 0) + 1;
      const listo = s.mundo === c.destino || c.viajes >= (s.nave ? 2 : 3);
      if (listo) {
        if (s.mundo !== c.destino) g.mover(c.destino, 'siguiendo un contrato');
        c.fase = 'buscar';
        g.log('Llegas a ' + c.destino + '. Ahora hay que encontrarle.', 'res');
        return SW.GEN.buscarObjetivo(g.rng, s);
      }
      return SW.GEN.viajeCaza(g.rng, s);
    }
    if (c.fase === 'buscar') return SW.GEN.buscarObjetivo(g.rng, s);
    if (c.fase === 'captura') return SW.GEN.capturar(g.rng, s);
    if (c.fase === 'entrega') return SW.GEN.entregar(g.rng, s);
    return null;
  };

  /* la puerta de entrada a un contrato nuevo */
  SW.EVENTOS.push({
    id: 'cz_hay_trabajo', min: 18, max: 200, w: 26, repetible: true,
    slots: { l: 'lugar' },
    req: function (s) { return !!s.flags.en_el_gremio && !s.contrato && !s.flags.gremio_desconfia; },
    t: 'Hay contratos nuevos en el tablón del Gremio.',
    c: [{ t: 'Mirar qué hay', generar: 'contratoCaza' },
        { t: 'Este año no', volver: true }]
  });
  SW.EVENTOS.push({
    id: 'cz_gremio_frio', min: 18, max: 200, w: 14, repetible: true,
    slots: { l: 'lugar' },
    req: function (s) { return !!s.flags.gremio_desconfia && !s.contrato; },
    t: 'En el Gremio ya no te dan lo bueno. Alguien se acuerda de aquel contrato que soltaste.',
    c: [{ t: 'Pagar una multa y limpiar tu nombre', coste: 15000, quitarFlag: 'gremio_desconfia',
          fx: { reputacion: 4 }, out: 'Vuelves a estar en la lista.' },
        { t: 'Coger lo que sobra', generar: 'contratoCaza', fx: { reputacion: -2 } },
        { t: 'Dejar el Gremio', quitarFlag: 'en_el_gremio', fx: { cordura: 8 },
          out: 'Devuelves la placa. No hacen preguntas.' }] });

})(typeof window !== 'undefined' ? window : globalThis);

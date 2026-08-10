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
  /* ------------------------------------------------------------
     Lo que averiguas cuando una vía sale bien. Antes «el rastro se
     calienta» era un número invisible del 0 al 3 y no te enterabas de
     nada: se podían pasar cuatro años buscando sin leer una sola pista.
     Ahora cada acierto te da un dato concreto, se apuntan todos y los
     ves en la pantalla de búsqueda.
     ------------------------------------------------------------ */
  const HALLAZGOS = {
    preguntar: [
      'Un camarero de {sitio} le sirvió hace nueve días y se acuerda del acento.',
      'Media docena de personas en {sitio} niegan haberle visto, y las seis demasiado deprisa.',
      'Alguien de {gente} te dice el barrio. No el número, pero el barrio.',
      'Le pusieron un mote aquí. Con el mote sí le conoce todo el mundo.'
    ],
    pagar: [
      'Pagas sin preguntar y sale el nombre falso con el que se registró en el puerto.',
      'Por {precio} te enseñan una grabación de tres segundos. Suficiente.',
      'Compras la ruta que hizo desde el puerto. Termina en {sitio}.',
      'Alguien de {banda} te pasa quién le está pagando el escondite.'
    ],
    rastrear: [
      'Encuentras dónde tiró lo que llevaba encima al llegar. Eso dice mucho.',
      'Sigues sus compras: come siempre a la misma hora y en el mismo radio.',
      'Das con la ventana desde la que vigila la calle. Está usada.',
      'Cruzas manifiestos de carga hasta que uno no cuadra. Ese es el suyo.'
    ],
    trampa: [
      'Dejas correr un rumor con un cebo dentro y alguien muerde por él.',
      'Montas una entrega falsa. No aparece, pero manda a alguien a mirar.',
      'Pones vigilancia en {sitio} tres semanas. A la tercera pasa por delante.',
      'Le haces creer que tiene un comprador. Contesta desde una terminal que puedes situar.'
    ]
  };
  const CERCA = [
    'Ya sabes en qué edificio duerme.',
    'Tienes su rutina entera escrita en una hoja.',
    'Sabes por dónde sale, a qué hora y con quién.'
  ];

  const VIAS = {
    preguntar: { n: 'Preguntar', stat: 'carisma', base: 0.30, ruido: 6,
                 txt: 'Preguntas sin llamar mucho la atención.' },
    pagar:     { n: 'Pagar información', stat: null, base: 0.58, ruido: 10,
                 txt: 'El dinero abre bocas.' },
    rastrear:  { n: 'Rastrear', stat: 'mixto', base: 0.30, ruido: 2,
                 txt: 'Sigues su rastro como se sigue un rastro.' },
    trampa:    { n: 'Montar una trampa', stat: 'intelecto', base: 0.32, ruido: 4,
                 txt: 'Montas la trampa y esperas.' }
  };

  /** Probabilidad real de sacar algo por cada vía. Se enseña al jugador. */
  SW.probBusqueda = function (s, modo) {
    const c = s.contrato, V = VIAS[modo];
    if (!c || !V) return 0;
    const st = s.stats;
    let p = V.base;
    if (V.stat === 'carisma') p += (st.carisma - c.dif * 0.75) / 120;
    else if (V.stat === 'intelecto') p += (st.intelecto - c.dif * 0.70) / 120;
    else if (V.stat === 'mixto') p += (st.intelecto * 0.6 + st.destreza * 0.6 - c.dif * 0.75) / 120;
    else {
      /* Pagar es la vía fiable: no depende de lo que valgas, sino de lo
         que sueltes. Pero a alguien bien escondido no le delata nadie
         por cuatro créditos, así que también baja con la dificultad. */
      p += Math.min(0.12, Math.max(0, st.creditos) / 900000) - (c.dif - 50) * 0.004;
    }
    /* El oficio tiene que notarse. Un cazarrecompensas de profesión con
       doce capturas encima no busca igual que alguien con una placa
       recién comprada, y hasta ahora buscaban exactamente igual. */
    if (s.trabajo === 'cazarrecompensas') p += 0.12;
    p += Math.min(0.12, (s.contadores.cazas || 0) * 0.015);
    if (s.habilidades.indexOf('rastreador') >= 0) p += 0.12;
    if (s.habilidades.indexOf('cazarrecompensas') >= 0) p += 0.10;
    if (SW.naveAbre && SW.naveAbre(s, 'buscar')) p += 0.08;
    if (SW.aporteDe) p += SW.aporteDe(s, 'tasador') * 0.10;
    // si llevas varios intentos en seco, el siguiente es más fácil
    p += Math.min(0.30, (c.seco || 0) * 0.10);
    return U.clamp(p, 0.15, 0.92);
  };

  const pct = function (x) { return Math.round(x * 100) + '%'; };

  /** Apuntar una pista, venga de donde venga. Si llegas a tres, se captura. */
  SW.darPistaCaza = function (g, texto) {
    const c = g.s.contrato;
    if (!c) return;
    c.pistas = c.pistas || [];
    if (c.pistas.length >= 3) return;
    const t = texto || g.rng.pick(HALLAZGOS.rastrear).replace(/\{[a-z]+\}/g, 'el puerto');
    c.pistas.push(SW.contraer ? SW.contraer(t) : t);
    c.rastro = c.pistas.length;
    c.seco = 0;
    g.log('<b>' + c.pistas[c.pistas.length - 1] + '</b>', 'bien');
    if (c.pistas.length >= 3) {
      c.fase = 'captura';
      g.log(g.rng.pick(CERCA) + ' Mañana.', 'bien');
    }
  };

  SW.GEN.buscarObjetivo = function (rng, s) {
    const c = s.contrato;
    const d = SW.dosierDe ? SW.dosierDe(s.mundo, SW.anioGalactico ? SW.anioGalactico(s) : null) : null;
    const sitio = d ? rng.pick(d.hit) : 'el puerto';
    const banda = d ? rng.pick(d.fac) : 'la gente de aquí';
    c.pistas = c.pistas || [];
    const coste = 3000 + Math.round(c.dif * 55);

    const sabido = c.pistas.length
      ? '<ul class="pistas">' + c.pistas.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'
      : '<p class="dim">Todavía no sabes nada que sirva.</p>';

    return {
      id: 'cz_buscar', gen: true, cazaPaso: 'buscar',
      t: '<span class="scene-tag">EN ' + s.mundo.toUpperCase() + '</span>' +
         '<p>Buscas a <b>' + c.nombre + '</b>, ' + c.tipoN + '. De partida sabes que ' + c.pista + '.</p>' +
         '<p><b>Lo que llevas averiguado (' + c.pistas.length + ' de 3):</b></p>' + sabido +
         (c.alerta >= 2 ? '<p class="dim">Sabe que le buscan. Cuanto más tardes, más preparado estará.</p>' : '') +
         (c.seco >= 2 ? '<p class="dim">Llevas un tiempo en seco. Por probabilidad, ya te toca.</p>' : ''),
      c: [
        { t: 'Preguntar en ' + sitio, cazaBusca: 'preguntar',
          sub: pct(SW.probBusqueda(s, 'preguntar')) + ' · tu carisma · discreto' },
        { t: 'Pagar información a ' + banda, cazaBusca: 'pagar', coste: coste,
          sub: pct(SW.probBusqueda(s, 'pagar')) + ' · ' + U.cr(coste) + ' · caro y ruidoso' },
        { t: 'Rastrear por tu cuenta', cazaBusca: 'rastrear',
          sub: pct(SW.probBusqueda(s, 'rastrear')) + ' · intelecto y destreza · nadie se entera' },
        { t: 'Montar una trampa y esperar', cazaBusca: 'trampa',
          sub: pct(SW.probBusqueda(s, 'trampa')) + ' · tu intelecto · tarda' },
        { t: 'Abandonar el contrato', cazaAbandona: true,
          sub: 'El Gremio toma nota, y el aviso no es una forma de hablar: pierdes lo invertido ' +
               'y te cuesta reputación' }
      ]
    };
  };

  SW.resolverBusqueda = function (g, modo) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (!c) return;
    const V = VIAS[modo] || VIAS.preguntar;
    const p = SW.probBusqueda(s, modo);
    c.pistas = c.pistas || [];

    if (rng.chance(p)) {
      c.seco = 0;
      const d = SW.dosierDe ? SW.dosierDe(s.mundo, SW.anioGalactico ? SW.anioGalactico(s) : null) : null;
      const hallazgo = rng.pick(HALLAZGOS[modo] || HALLAZGOS.preguntar)
        .replace('{sitio}', d ? rng.pick(d.hit) : 'el puerto')
        .replace('{banda}', d ? rng.pick(d.fac) : 'la gente de aquí')
        .replace('{gente}', d ? rng.pick(d.gen) : 'los de aquí')
        .replace('{precio}', U.cr(3000 + Math.round(c.dif * 55)));
      c.pistas.push(SW.contraer ? SW.contraer(hallazgo) : hallazgo);
      c.rastro = c.pistas.length;
      g.log(V.txt + ' <b>' + hallazgo + '</b>', 'bien');
      g.aplicarFx({ intelecto: 3, destreza: 2 }, {});
    } else {
      /* Fallar ya no borra lo que sabías. Lo que hace es que él se
         entere de que le buscan, y eso se paga después, en la captura.
         Perder pistas convertía la búsqueda en un pozo: dabas dos pasos
         y retrocedías dos, y así cuatro años. */
      c.seco = (c.seco || 0) + 1;
      c.alerta = (c.alerta || 0) + 1;
      g.log(V.txt + ' No sale nada, y alguien va a contarle que preguntas por él.', 'mal');
      g.aplicarFx({ cordura: -3 }, {});
      const riesgo = 0.08 + (c.alerta || 0) * 0.02 + V.ruido * 0.004;
      if (rng.chance(Math.min(0.22, riesgo))) {
        g.cola.unshift(g.prepararGen(SW.GEN.emboscadaCaza(rng, s)));
        g.fase = 'evento';
        return;
      }
    }
    if (c.pistas.length >= 3) {
      c.fase = 'captura';
      g.log(rng.pick(CERCA) + ' Mañana.', 'bien');
    }
  };

  /* ------------------------------------------------------------
     Que te descubran no puede ser una sentencia de muerte sin más.
     Antes un fallo de búsqueda te metía de cabeza en un combate a la
     dificultad completa del objetivo, sin preguntarte nada. Ahora es
     una escena: los que vienen son los suyos, no él, y tienes salidas.
     ------------------------------------------------------------ */
  SW.GEN.emboscadaCaza = function (rng, s) {
    const c = s.contrato;
    const dif = Math.max(30, c.dif - 18);
    return {
      id: 'cz_emboscada', gen: true,
      t: '<span class="scene-tag">TE HAN VISTO PRIMERO</span>' +
         '<p>Dos personas que no son ' + U.esc(c.nombre) + ' te esperan a la salida. ' +
         'Le has puesto nervioso, y esto es lo que hace la gente nerviosa.</p>' +
         '<p class="dim">No vienen a matarte: vienen a que te vayas del planeta.</p>',
      c: [
        { t: 'Pelear', sub: 'Dificultad ' + dif + ', más baja que la de él.',
          combate: { dif: dif } },
        { t: 'Escabullirte por donde has venido', sub: 'Depende de tu destreza.',
          r: [
            { p: U.clamp(0.30 + s.stats.destreza / 170, 0.25, 0.85),
              t: 'Sales por un patio de servicio antes de que te corten el paso.',
              fx: { destreza: 6, cordura: -4 } },
            { p: 0.5, t: 'Te alcanzan en el callejón y te lo hacen saber.',
              fx: { salud: -16, cordura: -6 } }
          ] },
        { t: 'Hablar con ellos', sub: 'Depende de tu carisma. Y puede salir bien del todo.',
          r: [
            { p: U.clamp(0.22 + s.stats.carisma / 200, 0.18, 0.7),
              t: 'Les cuentas cuánto cobras y cuánto podrían cobrar ellos. Se lo piensan y te dan una dirección.',
              fx: { carisma: 10 }, cazaRegalo: true },
            { p: 0.55, t: 'No hay conversación posible. Sí hay costillas.',
              fx: { salud: -18, notoriedad: 6 } }
          ] },
        { t: 'Enseñar la placa del Gremio',
          req: function (st) { return !!st.flags.en_el_gremio; },
          sub: 'A veces basta. A veces es peor.',
          r: [
            { p: 0.5, t: 'Se miran, calculan lo que cuesta pegarle a alguien del Gremio y se van.',
              fx: { reputacion: 6, notoriedad: 4 } },
            { p: 0.5, t: 'Justo por eso han venido.', fx: { salud: -14, notoriedad: 8 } }
          ] }
      ]
    };
  };

  /* ============================================================
     5. LA CAPTURA
     ============================================================ */
  /* Lo que te cuesta que se haya enterado de que le buscas. Cada vía
     que falló durante la búsqueda le dio un aviso, y aquí se cobra. */
  SW.durezaCaptura = function (s) {
    const c = s.contrato;
    return Math.min(20, (c && c.alerta ? c.alerta : 0) * 3);
  };

  SW.GEN.capturar = function (rng, s) {
    const c = s.contrato;
    const extra = SW.durezaCaptura(s);
    return {
      id: 'cz_captura', gen: true, cazaPaso: 'captura',
      t: '<span class="scene-tag">LA CAPTURA</span>' +
         '<p>Tienes a <b>' + c.nombre + '</b> localizado. A partir de aquí solo hay una oportunidad.</p>' +
         (extra ? '<p>Te ha visto venir de lejos: está esperando. <b>+' + extra + ' de dificultad</b> ' +
                  'por el ruido que hiciste buscándole.</p>' : '') +
         '<p class="dim">Vivo paga ×' + c.vivo + '. Muerto, el contrato base.</p>',
      c: [
        { t: 'Entrar por la fuerza', cazaCaptura: 'fuerza', sub: 'Combate a dificultad ' + (c.dif + extra) + '.' },
        { t: 'Aturdirle a la primera', cazaCaptura: 'aturdir', minijuegoCaza: true,
          sub: 'Un solo disparo, a tiempo. Si fallas, se acabó lo fácil.' },
        { t: 'Hablar con él antes', cazaCaptura: 'hablar', sub: 'Puede entregarse. O engañarte.' },
        { t: 'Esperar a que salga solo', cazaCaptura: 'esperar', sub: 'Paciencia. Depende de tu intelecto.' }
      ]
    };
  };

  /* Un intento de captura que sale mal no siempre acaba a tiros. Antes
     sí: las cuatro vías desembocaban en combate y encadenar contratos
     era encadenar peleas hasta que una te mataba. Ahora, la mitad de
     las veces el objetivo simplemente se te escapa: pierdes una pista,
     él se pone más nervioso, y vuelves a buscarle. Cuesta tiempo en
     vez de sangre, que es lo que debe costar fallar. */
  const falloCaptura = function (g, extra, plus) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (rng.chance(0.55)) {
      const perdida = c.pistas && c.pistas.length ? c.pistas.pop() : null;
      c.rastro = (c.pistas || []).length;
      c.alerta = (c.alerta || 0) + 2;
      c.fase = 'buscar';
      g.log('Se te escapa por los tejados antes de que puedas hacer nada. ' +
            (perdida ? 'Y el sitio que sabías ya no vale.' : 'Vuelta a empezar.'), 'mal');
      g.aplicarFx({ cordura: -5, destreza: 3 }, {});
      return;
    }
    c.estado = 'muerto'; c.fase = 'entrega';
    g.iniciarCombate({ dif: c.dif + extra + plus, contrato: true });
    c.pendienteCombate = true;
  };

  /* Con el objetivo esposado en la bodega, la entrega es la misma
     escena, no la del año que viene: esperar un año con un preso
     atado no lo mejora para nadie. */
  const seguirAEntrega = function (g) {
    g.cola.unshift(g.prepararGen(SW.GEN.entregar(g.rng, g.s)));
    g.fase = 'evento';
  };

  SW.resolverCaptura = function (g, modo) {
    const s = g.s, rng = g.rng, c = s.contrato;
    if (!c) return;
    const extra = SW.durezaCaptura(s);

    if (modo === 'fuerza') {
      g.log('Entras por la puerta y no hay conversación.', 'res');
      c.fase = 'entrega'; c.estado = 'muerto';
      g.iniciarCombate({ dif: c.dif + extra, contrato: true, botin: 0 });
      c.pendienteCombate = true;
      return;
    }
    if (modo === 'aturdir') {
      const p = U.clamp(0.30 + (s.stats.destreza - c.dif - extra) / 130, 0.08, 0.85);
      if (rng.chance(p)) {
        g.log('Un disparo de aturdimiento limpio. Ni se entera.', 'bien');
        c.estado = 'vivo'; c.fase = 'entrega'; seguirAEntrega(g);
      } else {
        g.log('Fallas el primer disparo y se acabó lo fácil.', 'mal');
        falloCaptura(g, extra, 10);
      }
      return;
    }
    if (modo === 'hablar') {
      const p = U.clamp(0.26 + (s.stats.carisma - c.dif - extra) / 140, 0.06, 0.8);
      if (rng.chance(p)) {
        g.log('Le convences de que contigo tiene más futuro que huyendo.', 'bien');
        c.estado = 'vivo'; c.fase = 'entrega'; c.hablado = true;
        g.aplicarFx({ carisma: 8 }, {});
        seguirAEntrega(g);
      } else {
        g.log('Te da conversación mientras alcanza algo debajo de la mesa.', 'mal');
        falloCaptura(g, extra, 6);
      }
      return;
    }
    // esperar
    const p = U.clamp(0.34 + (s.stats.intelecto - c.dif - extra) / 140, 0.08, 0.85);
    if (rng.chance(p)) {
      g.log('Sale solo, de madrugada, como llevabas semanas viendo.', 'bien');
      c.estado = 'vivo'; c.fase = 'entrega'; seguirAEntrega(g);
    } else {
      g.log('Sale acompañado. Cuatro personas y ninguna amable.', 'mal');
      falloCaptura(g, extra, 14);
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
      /* Ir hasta allí consumía casi la mitad de todo el tiempo del
         contrato: tres escalas sin nave, dos con ella, y cada escala
         se comía una acción del año. Se viaja, pasa una cosa por el
         camino y se llega. */
      c.viajes = (c.viajes || 0) + 1;
      const listo = s.mundo === c.destino || c.viajes >= (s.nave ? 1 : 2);
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

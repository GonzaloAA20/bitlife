/* ============================================================
   HOLOVIDA :: CONTRATOS DE LEYENDA
   Los contratos normales del Gremio son un oficio: viaje, rastreo,
   captura, entrega. Esto es lo otro: el encargo que sólo te llega
   cuando ya tienes nombre, que ocupa una noche entera encadenada y
   que se juega, no se sortea.

   Cuatro escenas seguidas dentro del mismo año, dos minijuegos y un
   final que depende de lo que hayas hecho en cada una.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ESCENAS = SW.ESCENAS || {};
  SW.GUION = SW.GUION || [];

  const esCazador = function (s) {
    return s.trabajo === 'cazarrecompensas' || s.flags.en_el_gremio;
  };

  /* Los encargos que no salen en el tablón. Cada uno cambia el tono
     de las cuatro escenas y lo que te llevas al final. */
  const ENCARGOS = [
    { id: 'desertor', n: 'el desertor de la 501', dif: 74, pago: 90000,
      quien: 'Un soldado que se llevó algo al irse. El Imperio no dice el qué.',
      donde: 'un mundo de nieve donde no hay registros de nadie',
      giro: 'Lo que se llevó es una lista de nombres. La tuya está en ella.' },
    { id: 'senadora', n: 'la senadora que sabe demasiado', dif: 68, pago: 120000,
      quien: 'Cargo público, escolta propia y una agenda que alguien quiere quemada.',
      donde: 'una recepción de gala a la que no estás invitado',
      giro: 'La agenda que quieren quemada demuestra quién puso el contrato.' },
    { id: 'nino', n: 'el crío que mueve cosas sin tocarlas', dif: 62, pago: 200000,
      quien: 'Seis años. El cliente paga vivo y paga mucho, y no dice para qué.',
      donde: 'una granja al final de un camino sin nombre',
      giro: 'El cliente lleva capa negra y no ha venido en persona a decírtelo.' },
    { id: 'colega', n: 'el mejor cazador del Gremio', dif: 86, pago: 150000,
      quien: 'Uno de los tuyos. Cerró un contrato que no debía y ahora es el contrato.',
      donde: 'el sitio donde tú también te esconderías',
      giro: 'Te estaba esperando. Sabía que te lo darían a ti precisamente.' },
    { id: 'hutt', n: 'el contable de un cártel hutt', dif: 70, pago: 110000,
      quien: 'Se fue con los libros. Los libros valen más que él y él lo sabe.',
      donde: 'una estación de tránsito con nueve niveles y ninguna ley',
      giro: 'Te ofrece los libros. Con los libros no vuelves a trabajar en tu vida.' }
  ];

  /* ------------------------------------------------------------
     EL DISPARADOR: sólo si ya eres alguien
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'gl_encargo', min: 20, max: 200, prio: 76, repetible: true, gen: true, c: [],
    req: function (s) {
      if (!esCazador(s) || s.contrato || s.leyenda) return false;
      if (s.flags.gremio_desconfia) return false;
      // hace falta oficio: cuatro contratos cerrados o un nombre muy grande
      const veterano = (s.contadores.cazas || 0) >= 4 || s.stats.notoriedad >= 60;
      if (!veterano) return false;
      return s.ultimoEncargo == null || (s.edad - s.ultimoEncargo) >= 4;
    },
    hazlo: function (g) {
      const s = g.s;
      const libres = ENCARGOS.filter(function (e) { return !s.flags['encargo_' + e.id]; });
      if (!libres.length) return null;
      if (!g.rng.chance(0.6)) return null;
      const e = g.rng.pick(libres);
      s.ultimoEncargo = s.edad;
      s.flags['encargo_' + e.id] = true;
      const rango = 1 + Math.min(1.2, (s.contadores.cazas || 0) * 0.08);
      s.leyenda = {
        id: e.id, n: e.n, dif: e.dif, pago: Math.round(e.pago * rango),
        giro: e.giro, ventaja: 0, ruido: 0, sabeQueVas: false
      };
      return SW.ESCENAS.gl_oferta(g, e);
    }
  });

  const tag = function (t) { return '<span class="scene-tag">' + t + '</span>'; };

  SW.ESCENAS.gl_oferta = function (g, e) {
    const s = g.s;
    const L = s.leyenda;
    if (!L) return null;              // sin encargo abierto no hay oferta que hacer
    e = e || ENCARGOS.filter(function (x) { return x.id === L.id; })[0] || {};
    return {
      id: 'gl_oferta', gen: true,
      t: tag('ENCARGO PRIVADO') +
        '<p>No te llega por el tablón. Te llega por un intermediario que no da su nombre y que sabe ' +
        'el tuyo, el de tu nave y cuántos contratos llevas cerrados.</p>' +
        '<p>Objetivo: <b>' + U.esc(L.n) + '</b>. ' + U.esc(e.quien) + '</p>' +
        '<p>Última posición: ' + U.esc(e.donde) + '.</p>' +
        '<p class="dim">' + U.cr(L.pago) + ' al cierre. Dificultad ' + L.dif + '. ' +
        'De estos se cogen pocos en una vida.</p>',
      c: [
        { t: 'Aceptar sin preguntar', sub: 'Es lo que se espera de un profesional.',
          fx: { notoriedad: 8 }, cadena: 'gl_rastro' },
        { t: 'Preguntar quién paga', sub: 'Saber quién paga cambia cómo se cobra.',
          fx: { intelecto: 8, notoriedad: 4 }, encargoVentaja: 14, flag: 'sabe_quien_paga',
          out: 'No te lo dice. Pero por cómo no te lo dice, ya sabes bastante.',
          cadena: 'gl_rastro' },
        { t: 'Pedir el doble', sub: 'Depende de tu nombre.',
          r: [
            { p: U.clamp(0.18 + s.stats.notoriedad / 170, 0.15, 0.7),
              t: 'Se lo piensa cuatro segundos y acepta. Eso significa que tenía margen y que el trabajo es peor de lo que suena.',
              fx: { carisma: 8 }, encargoPago: 2, encargoVentaja: -8 },
            { p: 0.6, t: 'Se levanta. A los dos pasos se para, vuelve y acepta el precio de antes.',
              fx: { reputacion: -4 } }
          ], cadena: 'gl_rastro' },
        { t: 'Rechazarlo', sub: 'Hay encargos que huelen desde la puerta.',
          fx: { cordura: 8, reputacion: -6 }, cerrarLeyenda: true,
          out: 'Se lo darán a otro. Puede que te toque cazar a ese otro dentro de unos años.' }
      ]
    };
  };

  /* --- 1. EL RASTRO: un reto de concentración, no un dado --- */
  SW.ESCENAS.gl_rastro = function (g) {
    const s = g.s, L = s.leyenda;
    if (!L) return null;
    g.retoFuerza({
      dif: U.clamp(L.dif - s.stats.intelecto / 4 - (L.ventaja || 0), 35, 90),
      sinPremio: true,
      txt: 'Nueve meses de movimientos: billetes, transferencias, un médico pagado en efectivo, ' +
           'una compra de raciones para dos cuando debería ser para uno. El patrón está ahí. ' +
           'Sostenlo entero en la cabeza y te dirá dónde duerme.',
      critico: { t: 'El patrón se ordena solo. No sólo sabes dónde está: sabes a qué hora sale a por agua.',
        fx: { intelecto: 12, reputacion: 6 }, encargoVentaja: 26, cadena: 'gl_cerco' },
      bien: { t: 'Sacas el sitio. No la rutina, pero el sitio.',
        fx: { intelecto: 6 }, encargoVentaja: 10, cadena: 'gl_cerco' },
      medio: { t: 'Sacas una zona y tres nombres. Vas a tener que preguntar, y preguntar hace ruido.',
        fx: { cordura: -4 }, encargoRuido: 20, cadena: 'gl_cerco' },
      mal: { t: 'Te equivocas de rastro y aprietas a quien no era. A las seis horas alguien le avisa.',
        fx: { cordura: -8, reputacion: -4 }, encargoRuido: 45, encargoAviso: true, cadena: 'gl_cerco' }
    });
    return null;
  };

  /* --- 2. EL CERCO: cómo entras decide cómo acaba --- */
  SW.ESCENAS.gl_cerco = function (g) {
    const s = g.s, L = s.leyenda;
    if (!L) return null;
    const avisado = L.sabeQueVas || (L.ruido || 0) > 35;
    return {
      id: 'gl_cerco', gen: true,
      t: tag('LA NOCHE') +
        '<p>Sabes dónde está. ' + (avisado
          ? 'Y él sabe que lo sabes: lleva dos días durmiendo vestido y con la puerta trabada.'
          : 'Y no tiene ni idea. Eso vale más que cualquier arma que lleves encima.') + '</p>' +
        '<p class="dim">Ventaja acumulada: ' + (L.ventaja || 0) + ' · ruido que has hecho: ' + (L.ruido || 0) + '</p>',
      c: [
        { t: 'Entrar por donde no hay puerta', sub: 'Silencio. Depende de tu destreza.',
          r: [
            { p: U.clamp(0.30 + s.stats.destreza / 200 + (L.ventaja || 0) / 200 - (avisado ? 0.18 : 0), 0.2, 0.85),
              t: 'Estás dentro y sentado en su cocina cuando se despierta.',
              encargoVentaja: 20, fx: { destreza: 8 }, cadena: 'gl_cara' },
            { p: 0.5, t: 'Una alarma que no estaba en los planos. Ahora es una persecución.',
              encargoRuido: 30, fx: { salud: -12, destreza: 4 }, cadena: 'gl_cara' }
          ] },
        { t: 'Esperarle fuera toda la noche', sub: 'Paciencia. Lento y seguro, si aguantas.',
          r: [
            { p: 0.68, t: 'Sale a las cuatro de la mañana, como sale todo el mundo que se cree listo.',
              encargoVentaja: 12, fx: { cordura: -6 }, cadena: 'gl_cara' },
            { p: 0.32, t: 'No sale. A la mañana siguiente descubres que hay una segunda salida.',
              encargoRuido: 25, fx: { cordura: -10 }, cadena: 'gl_cara' }
          ] },
        { t: 'Quemarle el sitio y esperar en la única salida',
          sub: 'Funciona siempre. Y hay gente dentro que no es él.',
          fx: { alineamiento: -22, notoriedad: 18, cordura: -10 },
          encargoVentaja: 24, encargoRuido: 40, flag: 'quemo_el_sitio',
          out: 'Sale tosiendo y con las manos vacías. Detrás salen otros cuatro que no tenían nada que ver.',
          cadena: 'gl_cara' },
        { t: 'Llamar a la puerta', sub: 'A veces lo que nadie espera es lo educado.',
          r: [
            { p: U.clamp(0.20 + s.stats.carisma / 220, 0.18, 0.6),
              t: 'Abre. Se queda mirándote. «Llevo un año esperando a alguien y esperaba a alguien peor.»',
              encargoVentaja: 18, fx: { carisma: 10 }, cadena: 'gl_cara' },
            { p: 0.55, t: 'Contesta un disparo a través de la puerta.',
              fx: { salud: -20 }, encargoRuido: 20, cadena: 'gl_cara' }
          ] }
      ]
    };
  };

  /* --- 3. CARA A CARA: el giro, y el minijuego --- */
  SW.ESCENAS.gl_cara = function (g) {
    const s = g.s, L = s.leyenda;
    if (!L) return null;
    const e = ENCARGOS.filter(function (x) { return x.id === L.id; })[0] || {};
    return {
      id: 'gl_cara', gen: true,
      t: tag('CARA A CARA') +
        '<p>Le tienes delante y no está pidiendo clemencia: está hablando.</p>' +
        '<p><b>' + U.esc(e.giro || '') + '</b></p>' +
        '<p class="dim">Se paga ' + U.cr(L.pago) + ' por entregarlo. Lo que dice, si es verdad, vale más.</p>',
      c: [
        { t: 'No escuchar y reducirlo', sub: 'Un profesional cobra y se va.',
          cadena: 'gl_pulso' },
        { t: 'Escuchar hasta el final', sub: 'Y decidir después, sabiendo.',
          fx: { intelecto: 8, cordura: -4 }, encargoVerdad: true,
          out: 'Habla nueve minutos. Nada de lo que dice se puede comprobar y todo encaja.',
          cadena: 'gl_pulso' },
        { t: 'Preguntarle qué haría él en tu sitio',
          req: function (st) { return st.stats.carisma > 45; },
          fx: { carisma: 10, cordura: 4 }, encargoVerdad: true, encargoVentaja: 10,
          out: '«Cobrar», dice. «Pero yo dormía peor que tú.»', cadena: 'gl_pulso' },
        { t: 'Avisarle de que salga por atrás y decir que se te escapó',
          sub: 'Renuncias al pago y el Gremio no se lo va a creer.',
          fx: { alineamiento: 25, cordura: 12, reputacion: -14, notoriedad: -6 },
          soltarLeyenda: true }
      ]
    };
  };

  /* --- 4. EL PULSO: se resuelve con las manos --- */
  SW.ESCENAS.gl_pulso = function (g) {
    const s = g.s, L = s.leyenda;
    if (!L) return null;
    const dif = U.clamp(L.dif - (L.ventaja || 0) / 2 + (L.ruido || 0) / 4, 30, 95);
    // con sable es un duelo; sin él, quien saque primero
    if (s.sable) {
      g.retoDuelo({
        id: 'gl_duelo', tag: 'SE ACABÓ HABLAR', modo: 'duelo', dif: dif, sinPremio: true,
        txt: 'Tiene con qué defenderse y sabe usarlo. Aquí no hay plan que valga: hay manos.',
        critico: { t: 'Lo desarmas en cuatro movimientos sin hacerle un rasguño de más.',
          fx: { destreza: 10 }, encargoEstado: 'vivo', cadena: 'gl_cierre' },
        bien: { t: 'Cuesta, pero cae.', fx: { salud: -12 }, encargoEstado: 'vivo', cadena: 'gl_cierre' },
        medio: { t: 'Cae, y tú también acabas en el suelo un rato.',
          fx: { salud: -28 }, encargoEstado: 'vivo', cadena: 'gl_cierre' },
        mal: { t: 'Se te va de las manos. Cuando acaba, ya no hay a quién entregar vivo.',
          fx: { salud: -34, cordura: -12 }, encargoEstado: 'muerto', cadena: 'gl_cierre' }
      });
      return null;
    }
    g.reto = {
      sinPremio: true,
      critico: { t: 'Sacas antes. Ni siquiera llega a apuntarte.', fx: { destreza: 10 },
        encargoEstado: 'vivo', cadena: 'gl_cierre' },
      bien: { t: 'Sacas primero por poco.', fx: { salud: -8 }, encargoEstado: 'vivo', cadena: 'gl_cierre' },
      medio: { t: 'Empatáis y os lleváis los dos algo.', fx: { salud: -24 },
        encargoEstado: 'vivo', cadena: 'gl_cierre' },
      mal: { t: 'Saca él. Sales vivo de milagro y de él no queda nada que entregar entero.',
        fx: { salud: -36, cordura: -10 }, encargoEstado: 'muerto', cadena: 'gl_cierre' }
    };
    g.cola.unshift(g.prepararGen({
      id: 'gl_pulso', gen: true,
      t: tag('QUIEN SAQUE PRIMERO') +
        '<p>Las manos de los dos bajan a la vez. Va a amagar: siempre amagan.</p>',
      minijuego: 'desenfundar',
      dificultad: dif,
      pericia: Math.round(s.stats.destreza * 0.7 + (s.habilidades.indexOf('tirador') >= 0 ? 14 : 0)),
      c: [{ t: 'Bajar la mano y aceptar lo que venga', retoSalta: true }]
    }));
    g.fase = 'evento';
    return null;
  };

  /* --- 5. EL CIERRE: lo que te llevas --- */
  SW.ESCENAS.gl_cierre = function (g) {
    const s = g.s, L = s.leyenda;
    if (!L) return null;
    const vivo = L.estado !== 'muerto';
    const pago = Math.round(L.pago * (vivo ? 1 : 0.55));
    const c = [
      { t: vivo ? 'Entregarlo y cobrar' : 'Entregar lo que queda y cobrar',
        sub: U.cr(pago), cerrarLeyenda: 'entregar', encargoCobro: pago }
    ];
    if (vivo) {
      c.push({ t: 'Soltarlo y quedarte con lo que sabe',
        sub: 'No cobras. Te llevas otra cosa.', cerrarLeyenda: 'soltar' });
      if (L.verdad) {
        c.push({ t: 'Ir a por quien puso el contrato',
          sub: 'Sabes quién es. Es mucho más grande que tú.',
          cerrarLeyenda: 'vengar' });
      }
    }
    c.push({ t: 'Desaparecer y no volver a coger el comunicador',
      sub: 'Ni cobras ni entregas. El Gremio te borra.', cerrarLeyenda: 'huir' });
    return {
      id: 'gl_cierre', gen: true,
      t: tag('EL CIERRE') +
        '<p>Se acabó. ' + (vivo ? 'Está vivo, atado y callado en tu bodega.'
                                : 'No está vivo, y eso te va a costar casi la mitad del pago.') + '</p>' +
        (L.verdad ? '<p>Y encima te ha contado lo que te ha contado, que no se te va a olvidar.</p>' : ''),
      c: c
    };
  };

  /* ------------------------------------------------------------
     Los cierres, que es donde el encargo deja huella
     ------------------------------------------------------------ */
  SW.cerrarLeyenda = function (g, modo, pago) {
    const s = g.s, L = s.leyenda;
    if (!L) return;
    s.leyenda = null;
    if (modo === 'entregar') {
      s.stats.creditos += pago || L.pago;
      s.contadores.cazas = (s.contadores.cazas || 0) + 1;
      s.contadores.leyendas = (s.contadores.leyendas || 0) + 1;
      g.aplicarFx({ notoriedad: 20, reputacion: 14, alineamiento: -10, cordura: -8 }, {});
      g.log('Cierras un encargo de los que no salen en el tablón. Cobras ' + U.cr(pago || L.pago) + '.', 'cr');
      g.hito('Cierra el encargo de ' + L.n);
      if (s.contadores.leyendas >= 3) {
        s.flags.leyenda_del_gremio = true;
        g.hito('Leyenda del Gremio: tres encargos imposibles');
        g.log('En el Gremio ya no dicen tu nombre: dicen «el que cerró los tres».', 'bien');
      }
    } else if (modo === 'soltar') {
      g.aplicarFx({ alineamiento: 26, cordura: 14, reputacion: -16, intelecto: 8 }, {});
      s.faccionRep = s.faccionRep || {};
      s.faccionRep.gremio = (s.faccionRep.gremio || 0) - 35;
      g.añadirRelacion('contacto', 70, null, 'te debe la vida y lo sabe');
      g.log('Le sueltas. En el Gremio se enteran en dos semanas.', 'mal');
      if (g.rng.chance(0.5)) s.flags.gremio_desconfia = true;
      g.hito('Suelta a un objetivo de leyenda');
    } else if (modo === 'vengar') {
      g.log('Das media vuelta y vas a por el que firmó el contrato.', 'res');
      g.aplicarFx({ alineamiento: 16, notoriedad: 30 }, {});
      s.buscado = Math.min(100, s.buscado + 40);
      g.iniciarCombate({ dif: L.dif + 14, duelo: true, aMuerte: true,
        botin: Math.round(L.pago * 2), sable: !!s.sable });
      g.hito('Va a por quien puso el contrato');
    } else {
      g.aplicarFx({ cordura: 6, reputacion: -20, notoriedad: -10 }, {});
      s.flags.gremio_desconfia = true;
      g.log('Apagas el comunicador y cambias de sector. El Gremio te da de baja.', 'mal');
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);

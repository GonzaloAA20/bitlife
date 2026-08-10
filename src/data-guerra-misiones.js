/* ============================================================
   HOLOVIDA :: LA GUERRA, POR DENTRO
   Alistarse era una tirada de muerte anual y un par de frases de
   sabor: se podía pasar una guerra entera sin una sola decisión. Y
   además te dejaba alistarte en sitios donde no pintabas nada — un
   cazarrecompensas de piloto en el Gran Ejército de la República,
   que es solo de clones.

   Aquí vive lo uno y lo otro: quién puede ir a cada guerra y con
   quién, y qué te pasa una vez estás dentro.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};
  SW.ESCENAS = SW.ESCENAS || {};

  const esClon = function (s) { return s.especie === 'clon' || s.especie === 'clon_nulo'; };
  const esFuerza = function (s) {
    return s.trabajo === 'jedi' || s.trabajo === 'sith' || (s.sensible && s.stats.fuerza > 40);
  };

  /* ------------------------------------------------------------
     EL EJÉRCITO REGULAR DE CADA ÉPOCA
     ------------------------------------------------------------ */
  const REGULAR = {
    alta_republica: 'republica', republica_tardia: 'republica',
    guerras_clon: 'republica', imperio_temprano: 'imperio',
    rebelion: 'imperio', nueva_republica: 'nueva_republica',
    primera_orden: 'primera_orden', era_perdida: 'piratas'
  };
  SW.bandoRegular = function (s) { return REGULAR[s.era] || 'republica'; };

  /* ------------------------------------------------------------
     QUIÉN PUEDE ALISTARSE, Y EN QUÉ
     En las Guerras Clon el Gran Ejército es de clones y punto. Los
     jedi van de generales porque el Senado se lo impuso a la Orden,
     no porque se alisten. Un civil puede ir a una fuerza de defensa
     planetaria, y a un cazarrecompensas con nombre le CONTRATAN —
     que es otra cosa y se paga mejor.
     ------------------------------------------------------------ */
  SW.puestosDeGuerra = function (s) {
    const base = (SW.PUESTOS_GUERRA || []).filter(function (p) {
      try { return !p.req || p.req(s); } catch (e) { return false; }
    });
    if (s.era !== 'guerras_clon') return { lista: base, nota: null };

    // Guerras Clon: la puerta está cerrada para casi todo el mundo
    if (esClon(s)) return { lista: base, nota: 'Naciste dentro. No hay nada que firmar.' };
    if (esFuerza(s)) {
      return { lista: base.filter(function (p) { return p.id === 'oficial' || p.id === 'comando'; }),
        nota: 'A ti no te alistan: te asignan. Los sensibles a la Fuerza van al mando, no a la fila.' };
    }
    // civil: solo milicia planetaria y puestos de retaguardia
    return {
      lista: base.filter(function (p) { return ['infanteria', 'medico', 'ingeniero'].indexOf(p.id) >= 0; }),
      nota: 'El Gran Ejército de la República es de clones: no admite voluntarios. ' +
            'Lo que sí admite gente es la fuerza de defensa de tu mundo.',
      milicia: true
    };
  };

  /* Al cazarrecompensas notorio no se le alista: se le contrata. Y en
     esta guerra el que paga bien y sin preguntas es el otro bando. */
  SW.GUION = SW.GUION || [];
  SW.GUION.push({
    id: 'gw_contrato_separatista', min: 18, max: 200, prio: 74, unaVez: true, gen: true, c: [],
    req: function (s) {
      if (s.era !== 'guerras_clon' || !SW.guerraActiva || !SW.guerraActiva(s)) return false;
      if (esClon(s) || esFuerza(s) || s.flags.en_el_frente) return false;
      const cazador = s.trabajo === 'cazarrecompensas' || s.flags.en_el_gremio;
      return cazador && s.stats.notoriedad >= 35;
    },
    hazlo: function (g) {
      const s = g.s;
      const pago = 40000 + Math.round(s.stats.notoriedad * 900);
      return {
        id: 'gw_contrato_separatista', gen: true,
        t: '<span class="scene-tag">UNA OFERTA, NO UN ALISTAMIENTO</span>' +
          '<p>No te llama ningún ejército: a ti te llama un intermediario con acento de Muunilinst y ' +
          'una habitación alquilada por horas.</p>' +
          '<p>«La Confederación no recluta. La Confederación <i>compra</i>. Y ahora mismo está comprando ' +
          'a gente que sepa encontrar a personas concretas detrás de las líneas republicanas.»</p>' +
          '<p class="dim">' + U.cr(pago) + ' por contrato. Sin uniforme, sin bandera y sin nadie que te ' +
          'reclame si te cogen.</p>',
        c: [
          { t: 'Firmar', sub: 'El dinero es el dinero.',
            fx: { creditos: pago, notoriedad: 18, alineamiento: -12 },
            faccion: 'separatistas+30', flag: 'contratado_por_la_confederacion',
            bando: 'separatistas', out: 'Ni juras bandera ni te la dan. Te dan coordenadas.' },
          { t: 'Firmar y vender lo que veas a los dos lados',
            req: function (st) { return st.stats.intelecto > 50; },
            sub: 'El doble de dinero y el doble de gente queriéndote muerto.',
            fx: { creditos: Math.round(pago * 1.6), notoriedad: 26, alineamiento: -20 },
            flag: 'agente_doble', buscado: 30,
            out: 'Cobras dos veces por el mismo viaje. Funciona hasta que deja de funcionar.' },
          { t: 'Ofrecerte a la República en vez de eso',
            sub: 'Pagan menos y preguntan más.',
            fx: { creditos: Math.round(pago * 0.55), reputacion: 10, alineamiento: 6 },
            faccion: 'republica+20', bando: 'republica',
            out: 'Contrato de rastreo para Inteligencia. Papeleo, pero duermes en camas.' },
          { t: 'No meterte en la guerra de otros', fx: { cordura: 8 },
            out: 'Se levanta sin insistir. Vuelve a llamar dentro de un año.' }
        ]
      };
    }
  });

  /* ============================================================
     LAS MISIONES: lo que hacías en la guerra y no existía
     ============================================================ */
  const OBJETIVOS = {
    republica: [
      { v: 'romper el cerco de droides sobre una capital', dif: 66, al: 4, en: 'oleadas de B1 y dos droidekas' },
      { v: 'sacar a una guarnición rodeada antes de que caiga', dif: 60, al: 12, en: 'artillería que no para' },
      { v: 'tomar un puente que lleva tres meses cambiando de manos', dif: 70, al: -2, en: 'lo que quede de los dos bandos' },
      { v: 'escoltar un convoy médico por una ruta minada', dif: 52, al: 14, en: 'francotiradores y minas' }
    ],
    separatistas: [
      { v: 'cortar la línea de suministro republicana en un sector', dif: 62, al: -6, en: 'clones veteranos' },
      { v: 'capturar un oficial jedi vivo', dif: 82, al: -18, en: 'un caballero jedi y su compañía' },
      { v: 'volar un astillero antes de que boten la flota', dif: 68, al: -10, en: 'seguridad de astillero' }
    ],
    imperio: [
      { v: 'limpiar una célula rebelde en los niveles bajos', dif: 58, al: -16, en: 'insurgentes y civiles mezclados' },
      { v: 'escoltar un cargamento imperial que nadie te explica', dif: 55, al: -4, en: 'piratas, o eso dicen' },
      { v: 'pacificar un mundo que ha dejado de pagar impuestos', dif: 60, al: -24, en: 'granjeros con rifles viejos' },
      { v: 'perseguir a un piloto rebelde por un campo de asteroides', dif: 66, al: -6, en: 'un ala-X que vuela mejor que tú' }
    ],
    rebelion: [
      { v: 'robar los planos de una guarnición imperial', dif: 64, al: 10, en: 'tropas de asalto y un oficial listo' },
      { v: 'sacar a una familia entera de un mundo ocupado', dif: 56, al: 18, en: 'controles en cada esquina' },
      { v: 'volar un depósito de combustible y salir vivo', dif: 68, al: 6, en: 'la guarnición entera detrás de ti' }
    ],
    generico: [
      { v: 'defender una posición que no vale nada', dif: 60, al: 0, en: 'gente igual de cansada que tú' },
      { v: 'recuperar los cuerpos de una patrulla perdida', dif: 50, al: 12, en: 'el frío y algo más' },
      { v: 'reconocer un valle del que no ha vuelto nadie', dif: 58, al: 2, en: 'no se sabe, y eso es lo malo' }
    ]
  };

  const bandoDe = function (s) {
    const b = s.bando || SW.bandoRegular(s);
    return OBJETIVOS[b] ? b : 'generico';
  };

  /** Una misión de campaña. Se juega, no se tira un dado por ti. */
  SW.GEN.misionGuerra = function (rng, s) {
    const fam = bandoDe(s);
    const t = rng.pick(OBJETIVOS[fam]);
    const w = s.guerra || {};
    const donde = w.frente || s.mundo;
    const puesto = s.puestoGuerra || 'infanteria';
    s.campaña = s.campaña || { mision: 0, medallas: 0 };
    s.campaña.mision++;
    const n = s.campaña.mision;

    const c = [
      { t: '⚔ Ir delante', sub: 'Lo que se espera de ti. Y lo que te mata.',
        combate: { dif: t.dif, frente: true }, fx: { reputacion: 8, alineamiento: t.al },
        contador: { batallas: 1 }, medallaSi: true },
      { t: '◈ Planificarla hasta el último detalle',
        sub: 'Depende de tu intelecto. Si sale, vuelve todo el mundo.',
        r: [
          { p: U.clamp(0.30 + s.stats.intelecto / 190, 0.25, 0.78),
            t: 'Sale como estaba escrito. Es tan raro que hasta el mando pregunta cómo lo hiciste.',
            fx: { intelecto: 10, reputacion: 14, alineamiento: t.al }, rendimiento: 15,
            contador: { batallas: 1 }, medalla: true },
          { p: 0.45, t: 'El enemigo no había leído tu plan.',
            combate: { dif: t.dif + 6, frente: true }, fx: { alineamiento: t.al } }
        ] },
      { t: '↯ Colarte por donde no miran',
        sub: 'Depende de tu destreza. Menos gente, menos ruido, más riesgo si te ven.',
        r: [
          { p: U.clamp(0.26 + s.stats.destreza / 175, 0.22, 0.76),
            t: 'Entras, haces lo que hay que hacer y sales sin que suene una alarma.',
            fx: { destreza: 12, reputacion: 10, notoriedad: 6, alineamiento: t.al },
            contador: { batallas: 1 }, medalla: true },
          { p: 0.5, t: 'Te ven a mitad de camino y ya no hay sigilo que valga.',
            combate: { dif: t.dif + 10, frente: true }, fx: { salud: -12 } }
        ] },
      { t: '⛨ Mandarlo desde atrás', sub: 'Vuelves entero. No todos.',
        fx: { reputacion: -6, cordura: -8, intelecto: 5 }, contador: { batallas: 1 },
        out: 'Firmas el parte de bajas sin haber visto ninguna. Eso también pesa.' }
    ];
    if (t.al <= -14) {
      c.push({ t: '✕ Negarte a ejecutarla', sub: 'Esto no es una batalla: es otra cosa.',
        fx: { alineamiento: 25, reputacion: -20, cordura: 12 }, flag: 'insubordinado',
        out: 'Consejo de guerra abierto. No te fusilan porque hacen falta manos, pero queda escrito.' });
    }
    if (s.sensible && s.stats.fuerza > 35) {
      c.push({ t: '✦ Resolverla con la Fuerza', sub: 'Delante de doscientos testigos.',
        r: [{ p: U.clamp(0.32 + s.stats.fuerza / 160, 0.3, 0.85),
              t: 'Haces algo que la tropa va a contar mal durante años.',
              fx: { fuerza: 10, reputacion: 18, notoriedad: 14, alineamiento: t.al },
              contador: { batallas: 1 }, medalla: true },
             { p: 0.4, t: 'La Fuerza no es un arma de asedio y hoy te lo recuerda.',
               combate: { dif: t.dif + 4, frente: true }, fx: { cordura: -10 } }] });
    }

    return {
      id: 'gw_mision', gen: true,
      t: '<span class="scene-tag">MISIÓN ' + n + ' · ' + U.esc(String(donde).toUpperCase()) + '</span>' +
        '<p>Objetivo: <b>' + t.v + '</b>.</p>' +
        '<p>Enfrente: ' + t.en + '.</p>' +
        '<p class="dim">Vas de ' + puesto + '. Salud ' + s.stats.salud + '%.</p>',
      c: c
    };
  };

  /* Las medallas: lo que la guerra te deja además de las cicatrices. */
  SW.darMedalla = function (g) {
    const s = g.s;
    s.campaña = s.campaña || { mision: 0, medallas: 0 };
    s.campaña.medallas++;
    const m = s.campaña.medallas;
    g.aplicarFx({ reputacion: 10 }, {});
    if (m === 1) { g.hito('Primera condecoración'); g.log('Te dan una medalla. Pesa poco y abre puertas.', 'bien'); }
    else if (m === 3) {
      g.hito('Héroe de guerra condecorado tres veces');
      s.flags.heroe_de_guerra = true;
      g.log('Tres condecoraciones. Ya eres una foto que sale en los carteles.', 'bien');
      g.aplicarFx({ reputacion: 12, carisma: 6 }, {});
    } else if (m === 5) {
      g.hito('Leyenda del frente');
      g.log('Cinco. En tu unidad ya no dicen tu nombre: dicen «el que estuvo en todas».', 'bien');
      g.aplicarFx({ reputacion: 18, notoriedad: 10 }, {});
    } else {
      g.log('Otra condecoración para la caja.', 'bien');
    }
  };

  /* ============================================================
     LO QUE LA GUERRA TE DEJA DESPUÉS
     ============================================================ */
  SW.GUION.push({
    id: 'gw_despues', min: 16, max: 200, prio: 72, unaVez: true, gen: true, c: [],
    req: function (s) {
      return s.flags.veterano && !s.flags.en_el_frente && !s.flags.guerra_cerrada &&
             (s.campaña && s.campaña.mision >= 2);
    },
    hazlo: function (g) {
      const s = g.s;
      s.flags.guerra_cerrada = true;
      const m = (s.campaña && s.campaña.medallas) || 0;
      return {
        id: 'gw_despues', gen: true,
        t: '<span class="scene-tag">LICENCIADO</span>' +
          '<p>Se acabó tu campaña: ' + s.campaña.mision + ' misiones y ' +
          (m ? m + ' condecoraciones' : 'ninguna condecoración') + '.</p>' +
          '<p>Te devuelven la ropa con la que entraste. No te vale.</p>',
        c: [
          { t: 'Volver a casa y no hablar de esto nunca',
            fx: { cordura: -10, salud: 8 }, flag: 'veterano_callado',
            out: 'Funciona de día. De noche, regular.' },
          { t: 'Usar el uniforme para abrirte puertas',
            req: function (st) { return (st.campaña && st.campaña.medallas) >= 1; },
            fx: { reputacion: 16, carisma: 10, creditos: 12000 }, flag: 'tira_del_uniforme',
            out: 'Un veterano condecorado entra en despachos donde otros esperan meses.' },
          { t: 'Quedarte: no sabes hacer otra cosa',
            fx: { fisico: 6, cordura: -14, reputacion: 6 }, guerra: true, campaña: 3,
            out: 'Firmas otra campaña antes de pensarlo. Es más fácil que volver.' },
          { t: 'Buscar a los de tu unidad que quedan',
            fx: { cordura: 14, carisma: 8 },
            rel: { tipo: 'camarada', afecto: 70, quien: 'estuvo contigo en el frente' },
            out: 'Quedáis una vez al año. No habláis de la guerra: por eso funciona.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

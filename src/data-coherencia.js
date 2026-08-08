/* ============================================================
   HOLOVIDA :: COHERENCIA DE ESTADO Y DE LORE
   Aquí vive todo lo que el juego tiene que dejar de ofrecerte
   cuando tu situación cambia, y todo lo que el canon impone:

     · Si te expulsan del ejército, se acabaron las misiones.
     · Después de la Orden 66 no hay misiones para los jedi.
     · Kamino se desmantela tras la guerra: no se vive allí.
     · Mandalore queda arrasada: se puede ser mandaloriano, pero
       no vivir en el planeta durante la Purga.
     · Alderaan deja de existir en el 0 ABY.
     · Un jedi cobra un estipendio de la Orden. No mucho, pero
       cobra: si no, acabas robando para poder curarte.
     · Entrar en una Orden o en el Senado te lleva a Coruscant.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     MUNDOS QUE DEJAN DE SER HABITABLES SEGÚN LA ÉPOCA
     ============================================================ */
  SW.MUNDOS_CAIDOS = {
    'Kamino': { desde: ['imperio_temprano', 'rebelion', 'nueva_republica', 'primera_orden'],
                txt: 'El Imperio desmanteló Ciudad Tipoca. Aquí ya no queda nada que no sea agua.' },
    'Alderaan': { desde: ['rebelion', 'nueva_republica', 'primera_orden'],
                  txt: 'Alderaan ya no está. Ni el planeta.' },
    'Mandalore': { desde: ['imperio_temprano', 'rebelion'],
                   txt: 'Después de la Purga, la superficie de Mandalore es cristal. Se puede ser mandaloriano; vivir allí, no.' },
    'Scarif': { desde: ['nueva_republica', 'primera_orden'],
                txt: 'De Scarif queda un cinturón de escombros y un mar hirviendo.' },
    'Jedha': { desde: ['nueva_republica', 'primera_orden'],
               txt: 'La Ciudad Santa se la llevó un disparo de prueba. Queda el cráter.' }
  };

  /** ¿se puede vivir aquí en esta época? */
  SW.mundoViable = function (nombre, era) {
    const c = SW.MUNDOS_CAIDOS[nombre];
    if (!c) return true;
    return c.desde.indexOf(era) < 0;
  };

  /** un destino de evacuación decente para cuando tu mundo cae */
  SW.refugioDe = function (rng, nombre) {
    const REF = { 'Kamino': 'Nar Shaddaa', 'Alderaan': 'Chandrila', 'Mandalore': 'Concordia',
                  'Scarif': 'Batuu', 'Jedha': 'Takodana' };
    return REF[nombre] || (SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, nombre) : 'Nar Shaddaa');
  };

  /* ============================================================
     ¿QUÉ ACTIVIDADES TIENEN SENTIDO AHORA MISMO?
     Se consulta desde el menú anual: lo que no encaja, no sale.
     ============================================================ */
  SW.actividadPermitida = function (s, id) {
    const clon = s.especie === 'clon' || s.especie === 'clon_nulo';
    const jedi = s.trabajo === 'jedi';
    const sith = s.trabajo === 'sith';

    if (id === 'escuadron') {
      // te echaron, desertaste o se acabó tu ejército: no hay unidad
      if (s.flags.expulsado_ejercito || s.flags.desertor) return false;
      if ((s.flags.ejecuto_orden66 || s.flags.resistio_orden66 || s.flags.salvo_jedi) && jedi) return false;
      // un clon después de la guerra ya no tiene escuadrón al que volver
      if (clon && (s.era === 'rebelion' || s.era === 'nueva_republica')) return false;
      if (s.flags.licenciado) return false;
      return true;
    }
    if (id === 'crimen') {
      // un clon en servicio o un jedi en la Orden no se meten a contrabandistas
      if (clon && !s.flags.desertor && !s.flags.expulsado_ejercito && s.era === 'guerras_clon') return 'limitado';
      if (jedi) return 'limitado';
      return true;
    }
    if (id === 'nave' || id === 'taller') {
      if (clon && !s.flags.desertor && !s.flags.expulsado_ejercito && s.era === 'guerras_clon') return false;
      return true;
    }
    if (id === 'viaje') {
      if (clon && !s.flags.desertor && !s.flags.expulsado_ejercito && s.era === 'guerras_clon') return false;
      if (s.contrato) return true;
      return true;
    }
    if (id === 'gremio') return !!s.flags.en_el_gremio;
    if (id === 'senado') return !!s.flags.en_el_senado;
    if (id === 'fuerza') return s.sensible || s.stats.fuerza > 5;
    return true;
  };

  /* ============================================================
     SUELDOS QUE FALTABAN
     Un jedi no cobraba nada y acababa robando para curarse.
     ============================================================ */
  SW.ESTIPENDIOS = {
    jedi: function (s) {
      // la Orden cubre lo tuyo: no te haces rico, pero no mendigas
      const base = 5200 + (s.contadores.años || 0) * 60;
      return Math.round(base * (s.rango && /maestro/i.test(s.rango) ? 1.6 : 1));
    },
    sith: function (s) { return 3000 + Math.round(s.stats.fuerza * 60); },
    clon: function (s) { return 900; }   // simbólico: al clon se le da todo, no se le paga
  };

  SW.aplicarEstipendio = function (g) {
    const s = g.s;
    let f = null;
    if (s.trabajo === 'jedi') f = 'jedi';
    else if (s.trabajo === 'sith') f = 'sith';
    else if ((s.especie === 'clon' || s.especie === 'clon_nulo') &&
             !s.flags.desertor && !s.flags.expulsado_ejercito && !s.flags.licenciado) f = 'clon';
    if (!f) return;
    const v = SW.ESTIPENDIOS[f](s);
    if (!v) return;
    s.stats.creditos += v;
    if (f === 'jedi') g.log('La Orden cubre tus gastos: ' + U.cr(v) + '.', 'cr');
    else if (f === 'sith') g.log('Tu maestro te pasa ' + U.cr(v) + '. Nada es gratis.', 'cr');
    else g.log('Paga de soldado: ' + U.cr(v) + '.', 'cr');
  };

  /* ============================================================
     MUDANZAS OBLIGADAS
     Entrar en la Orden o en el Senado te lleva a Coruscant.
     ============================================================ */
  SW.destinoDeCargo = function (s, cargo) {
    if (cargo === 'jedi') {
      // en las eras sin Templo no hay a dónde ir
      if (['alta_republica', 'republica_tardia', 'guerras_clon'].indexOf(s.era) >= 0) return 'Coruscant';
      if (s.era === 'nueva_republica' || s.era === 'primera_orden') return 'Ajan Kloss';
      return null;
    }
    if (cargo === 'senador') return 'Coruscant';
    if (cargo === 'sith') return s.era === 'imperio_temprano' || s.era === 'rebelion' ? 'Coruscant' : null;
    return null;
  };

  /* ============================================================
     REVISIÓN ANUAL: lo que el mundo te impone quieras o no
     ============================================================ */
  SW.GUION = SW.GUION || [];

  /* tu mundo deja de existir bajo tus pies */
  SW.GUION.push({
    id: 'coh_mundo_caido', min: 0, max: 200, prio: 95,
    req: function (s) { return !SW.mundoViable(s.mundo, s.era) && !s.flags['evacuado_' + s.mundo]; },
    t: 'Aquí ya no se puede seguir.',
    c: [{ t: 'Salir de aquí como sea', evacuar: true }]
  });

  /* después de la Orden 66 un clon ya no puede seguir de misiones jedi */
  SW.GUION.push({
    id: 'coh_post66', min: 0, max: 200, prio: 90, unaVez: true,
    req: function (s) {
      return (s.flags.ejecuto_orden66 || s.flags.resistio_orden66 || s.flags.salvo_jedi) && !s.flags.post66_asentado &&
             (s.especie === 'clon' || s.especie === 'clon_nulo');
    },
    t: 'La guerra se ha acabado de la noche a la mañana. Ya no hay Generales Jedi, ni República, ni el ejército que conocías.<br>' +
       '<span class="dim">Ahora eres un soldado del Imperio, y el Imperio prefiere reclutas que no cuesten dinero.</span>',
    c: [
      { t: 'Seguir sirviendo mientras te dejen', flag: 'post66_asentado', fx: { cordura: -10, reputacion: 4 },
        faccion: 'imperio+20', out: 'Te destinan a guarnición. Cada año hay menos como tú.' },
      { t: 'Desertar ahora que hay caos', flag: 'post66_asentado', flag2: 'desertor',
        fx: { cordura: 8, notoriedad: 12 }, buscado: 35, evacuarA: 'cerca',
        out: 'Te quitas la armadura en un callejón y no miras atrás.' },
      { t: 'Pedir el retiro por el chip', flag: 'post66_asentado', flag2: 'licenciado',
        fx: { salud: -10, cordura: -6 }, out: 'Envejeces al doble. Ellos lo saben y les viene bien.' }
    ]
  });

  /* Kamino cae: un clon que siga allí tiene que salir */
  SW.GUION.push({
    id: 'coh_kamino', min: 0, max: 200, prio: 92, unaVez: true,
    req: function (s) {
      return s.mundo === 'Kamino' && !SW.mundoViable('Kamino', s.era);
    },
    t: 'El Imperio ha empezado a desmantelar Ciudad Tipoca. Las plataformas caen al mar una a una.',
    c: [
      { t: 'Subir al último transporte', evacuar: true, fx: { cordura: -8 } },
      { t: 'Llevarte contigo a los que puedas', evacuar: true, fx: { alineamiento: 18, cordura: -12, reputacion: 10 },
        out: 'Metes a catorce en una lanzadera para ocho.' },
      { t: 'Quedarte hasta el final', fx: { cordura: -20, salud: -25 }, evacuar: true,
        out: 'Ves hundirse el sitio donde naciste. Sales el último.' }
    ]
  });

  /* te expulsan: hay que salir del planeta militar sin un crédito */
  SW.GUION.push({
    id: 'coh_expulsado', min: 0, max: 200, prio: 88, unaVez: true,
    req: function (s) { return s.flags.expulsado_ejercito && !s.flags.expulsion_resuelta; },
    t: 'Te han dado de baja. Sin unidad, sin paga y sin transporte de vuelta: eso te lo buscas tú.',
    c: [
      { t: 'Pagarte un pasaje', req: function (s) { return s.stats.creditos >= 4000; },
        coste: 4000, flag: 'expulsion_resuelta', evacuar: true, out: 'Clase de carga, pero sales.' },
      { t: 'Colarte en la bodega de un carguero', flag: 'expulsion_resuelta',
        r: [{ p: 0.5, t: 'Sales sin que nadie te vea.', fx: { destreza: 10, cordura: 6 }, evacuar: true },
            { p: 0.3, t: 'Te pillan a medio salto y te ponen a trabajar el pasaje.', fx: { fisico: 8, salud: -10, creditos: 1200 }, evacuar: true },
            { p: 0.2, t: 'Te pillan antes de despegar.', fx: { salud: -18, reputacion: -8 }, carcel: 1 }] },
      { t: 'Ofrecerte de tripulación a quien salga', flag: 'expulsion_resuelta',
        fx: { carisma: 8, creditos: 900 }, evacuar: true, habilidad: 'tripulante',
        out: 'Fregando bodegas, pero con destino.' },
      { t: 'Quedarte y buscarte la vida aquí', flag: 'expulsion_resuelta',
        fx: { cordura: -8, notoriedad: 6 }, out: 'Hay peores sitios. No muchos.' }
    ]
  });

  /* ============================================================
     FILTRO GLOBAL DE EVENTOS
     Un evento puede ser válido por edad y por mundo y aun así no
     tener ningún sentido en tu situación. Esto lo corta antes de
     que llegue a la pantalla.
     ============================================================ */
  const MILITAR = /^(cl_|esc_|mil_|gen_mision)/;
  const JEDI_EV = /^(jd_|jedi_)/;

  SW.eventoCoherente = function (s, e) {
    const id = e.id || '';
    const clon = s.especie === 'clon' || s.especie === 'clon_nulo';
    const fueraDelEjercito = s.flags.expulsado_ejercito || s.flags.desertor || s.flags.licenciado;

    // misiones y vida de cuartel: solo si sigues en filas
    if (MILITAR.test(id) && id !== 'cl_orden66') {
      if (fueraDelEjercito) return false;
      if (clon && ['rebelion', 'nueva_republica', 'primera_orden'].indexOf(s.era) >= 0) return false;
    }
    // la vida de la Orden se acaba con la Orden 66
    if (JEDI_EV.test(id) && (s.flags.ejecuto_orden66 || s.flags.orden66_pasada)) {
      if (s.trabajo !== 'jedi') return false;
    }
    // eventos atados a un mundo que ya no existe
    if (e.mundo && e.mundo.length === 1 && !SW.mundoViable(e.mundo[0], s.era)) return false;
    return true;
  };

  /* ============================================================
     BAJOS FONDOS ADAPTADOS A TU SITUACIÓN
     Un clon en servicio no se hace contrabandista: roba raciones.
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.GEN.crimenLimitado = function (rng, s) {
    const clon = s.especie === 'clon' || s.especie === 'clon_nulo';
    if (clon) {
      return {
        id: 'coh_crimen_clon', gen: true,
        t: 'No puedes salir de la base ni tienes con quién tratar fuera. Lo que sí hay es almacén.',
        c: [
          { t: 'Sisar raciones y venderlas en el hangar', fx: { creditos: 1400, notoriedad: 5, alineamiento: -5 },
            sub: 'Poco dinero, poco riesgo' },
          { t: 'Cambiar piezas de armería por favores', fx: { carisma: 8, creditos: 2200, notoriedad: 8 },
            r: [{ p: 0.7, t: 'Nadie cuenta los cargadores.', fx: { creditos: 1500 } },
                { p: 0.3, t: 'Alguien sí los cuenta.', fx: { reputacion: -12 }, contador: { faltas: 1 } }] },
          { t: 'Vender información de rotaciones a un piloto de carga', fx: { creditos: 5000, alineamiento: -14 },
            contador: { faltas: 1 }, sub: 'Esto ya es traición, técnicamente' },
          { t: 'Dejarlo estar', volver: true }
        ]
      };
    }
    // jedi: no robas, pero el mundo te ofrece atajos igual
    return {
      id: 'coh_crimen_jedi', gen: true,
      t: 'Podrías resolver esto por el camino corto. Nadie se enteraría. Tú sí.',
      c: [
        { t: 'Usar la Fuerza para influir en una mente débil', fx: { creditos: 4000, alineamiento: -12, fuerza: 4 },
          sub: 'Funciona. Ese es el problema.' },
        { t: 'Pedir ayuda a la Orden como es debido', fx: { creditos: 2000, alineamiento: 6, cordura: 5 } },
        { t: 'Apañártelas sin nada', fx: { cordura: -6, fisico: 4, alineamiento: 8 } },
        { t: 'Dejarlo', volver: true }
      ]
    };
  };

  /* ============================================================
     LA CLÍNICA, SEPARADA DE «CUERPO Y MENTE»
     ============================================================ */
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.ACTIVIDADES.push({
    id: 'clinica', n: 'Clínica', ico: '✚', desc: 'Curar heridas abiertas, prótesis y revisiones. Solo eso.', min: 6
  });

})(typeof window !== 'undefined' ? window : globalThis);

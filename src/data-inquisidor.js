/* ============================================================
   HOLOVIDA :: LA INQUISICIÓN
   Lo que viene después de la Orden 66 si dijiste que sí: años de
   cacería, jedi que no se dejan matar, y una barra que se llena
   junto a un casco negro. Cuando se llena, alguien decide que has
   crecido demasiado y baja a verlo en persona.

   Y lo que viene si dijiste que no: los que aceptaron vienen a
   buscarte.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ESCENAS = SW.ESCENAS || {};
  SW.GUION = SW.GUION || [];
  SW.ACTOS = SW.ACTOS || {};
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];

  const AMENAZA_MAX = 100;

  /* ------------------------------------------------------------
     Entrar en la Inquisición
     ------------------------------------------------------------ */
  const NUMEROS = ['Segunda Hermana', 'Tercer Hermano', 'Quinto Hermano', 'Séptima Hermana',
                   'Octavo Hermano', 'Noveno Hermano', 'Décimo Hermano', 'Decimotercera Hermana'];

  SW.hazteInquisidor = function (g) {
    const s = g.s;
    if (s.flags.inquisidor_hecho) return;
    s.flags.inquisidor_hecho = true;
    s.flags.inquisidor = true;
    s.trabajo = 'inquisidor';
    s.padawan = false;              // ya no eres de la Orden en ningún sentido
    s.mision = null;                // ni tienes misiones del Consejo pendientes
    s.rango = g.rng.pick(NUMEROS);
    s.sueldo = 24000;
    s.añosEnTrabajo = 0;
    s.rendimiento = 50;
    s.amenazaVader = 0;
    s.contadores.jediCazados = s.contadores.jediCazados || 0;
    // la hoja se sangra: es el precio de entrada
    if (s.sable) {
      s.sable = Object.assign({}, s.sable, { color: 'rojo', hex: '#ff3a3a', sangrado: true });
      g.log('Sangras el cristal hasta que la hoja sale roja. Duele a los dos.', 'mal');
    }
    g.log('Ya no tienes nombre: tienes número. Eres <b>' + s.rango + '</b>.', 'mal');
    g.hito('Se convierte en Inquisidor');
    if (g.repFaccion) { g.repFaccion('imperio+35', {}); g.repFaccion('orden_jedi-90', {}); }
  };

  SW.esInquisidor = function (s) { return !!s.flags.inquisidor && !s.flags.inquisidor_desertor; };

  /* la carrera existe para que la ficha y los ascensos tengan sentido */
  if (SW.CARRERAS && !SW.CARRERAS.filter(function (c) { return c.id === 'inquisidor'; }).length) {
    SW.CARRERAS.push({
      id: 'inquisidor', n: 'Inquisición Imperial', fam: 'fuerza', stat: 'fuerza', sueldoBase: 24000,
      req: { fuerza: 40 }, desc: 'Cazar a los tuyos, uno a uno.', faccion: 'imperio', oculta: true,
      rangos: NUMEROS.slice(0, 5).concat(['Gran Inquisidor'])
    });
  }

  /* ------------------------------------------------------------
     El objetivo de turno
     ------------------------------------------------------------ */
  const PERFILES = [
    { n: 'un archivista', d: 'No sabe pelear. Sabe dónde están los otros.', dur: -18, listo: 22 },
    { n: 'una superviviente del Templo', d: 'Tu misma promoción. Reconoce tu forma antes de verte la cara.', dur: 6, listo: 8 },
    { n: 'un maestro viejo', d: 'Sesenta y muchos años y una Soresu que no se rompe.', dur: 20, listo: 4 },
    { n: 'un padawan sin maestro', d: 'Diecisiete años y más rabia que técnica.', dur: -10, listo: -6 },
    { n: 'un jedi del Cuerpo Agrícola', d: 'Nunca pasó las pruebas. Lleva doce años cavando y tiene las manos como piedras.', dur: -4, listo: 0 },
    { n: 'una guardiana de los Whills', d: 'Sin Fuerza y sin sable. Con un bastón y una fe insoportable.', dur: -6, listo: 12 },
    { n: 'un caballero desertor', d: 'Se fue de la Orden antes de la Purga. Lleva tres años esperando a alguien como tú.', dur: 12, listo: 10 },
    { n: 'un niño sensible sin instruir', d: 'Seis años. La familia le esconde en un sótano.', dur: -30, listo: -20, nino: true }
  ];

  SW.objetivoInquisidor = function (g) {
    const rng = g.rng, s = g.s;
    const p = rng.pick(PERFILES);
    const mundo = SW.mundoViable
      ? (function () {
          const l = SW.MUNDO_NOMBRES.filter(function (m) { return SW.mundoViable(m, s.era); });
          return l.length ? rng.pick(l) : s.mundo;
        })()
      : rng.pick(SW.MUNDO_NOMBRES);
    return {
      perfil: p,
      nombre: SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'zabrak', 'togruta', 'duros'])),
      mundo: mundo,
      forma: rng.pick(SW.FORMAS_SABLE),
      dif: U.clamp(58 + p.dur + rng.int(-6, 12) + (s.contadores.jediCazados || 0) * 2, 38, 94),
      listo: 50 + (p.listo || 0)
    };
  };

  /* ------------------------------------------------------------
     La barra de Vader
     ------------------------------------------------------------ */
  SW.amenazaVader = function (s) { return U.clamp(s.amenazaVader || 0, 0, AMENAZA_MAX); };

  SW.marcarJediCazado = function (g, info) {
    const s = g.s;
    s.contadores.jediCazados = (s.contadores.jediCazados || 0) + 1;
    if (!SW.esInquisidor(s)) return;
    // cuanto más ruido haces, antes se fija en ti
    const sube = 14 + Math.round(s.stats.notoriedad / 14) + (info && info.sonado ? 8 : 0);
    s.amenazaVader = U.clamp((s.amenazaVader || 0) + sube, 0, AMENAZA_MAX);
    g.log('En algún sitio, alguien apunta tu número en una lista corta. ' +
      '<span class="dim">(atención de Vader ' + s.amenazaVader + '%)</span>', 'mal');
  };

  /* ------------------------------------------------------------
     Pestaña de la Inquisición
     ------------------------------------------------------------ */
  SW.ACTIVIDADES.push({
    id: 'inquisicion', n: 'La Inquisición', ico: '⌖',
    desc: 'Encargos de la Fortaleza: buscar, acorralar y cerrar.', min: 12,
    req: function (s) { return SW.esInquisidor(s); }
  });

  SW.menuInquisicion = function (g) {
    const s = g.s;
    if (s.caza) return SW.pasoCazaJedi(g);
    const a = SW.objetivoInquisidor(g), b = SW.objetivoInquisidor(g);
    const linea = function (o) {
      return { t: o.perfil.n.charAt(0).toUpperCase() + o.perfil.n.slice(1) + ' — ' + o.mundo,
        sub: o.perfil.d + ' (dificultad ' + o.dif + ')', aceptaCaza: o };
    };
    return {
      id: 'inq_menu', gen: true,
      t: '<span class="scene-tag">FORTALEZA INQUISITORIA</span>' +
        '<p>Dos expedientes abiertos y una lista de espera muy larga. ' +
        (SW.amenazaVader(s) > 55 ? 'Últimamente te llegan los difíciles. No es casualidad.' : 'Elige.') + '</p>',
      c: [
        linea(a), linea(b),
        { t: 'Entrenar en la fortaleza en vez de salir', fuerzaMenu: true },
        { t: 'Cerrar un expediente sin abrirlo', sub: 'Poner «no localizado» y firmar.',
          fx: { alineamiento: 10, cordura: 6, reputacion: -10 }, flag: 'inquisidor_blando',
          out: 'Es la tercera vez este año. Alguien lleva la cuenta de las terceras veces.' }
      ]
    };
  };

  /* ------------------------------------------------------------
     La caza, en tres fases dentro de los años
     ------------------------------------------------------------ */
  SW.pasoCazaJedi = function (g) {
    const s = g.s, c = s.caza;
    if (!c) return null;
    if (c.fase === 'rastro') return SW.ESCENAS.inq_rastro(g);
    if (c.fase === 'cerco') return SW.ESCENAS.inq_cerco(g);
    return SW.ESCENAS.inq_duelo(g);
  };

  SW.ESCENAS.inq_rastro = function (g) {
    const c = g.s.caza;
    if (!c) return null;   // el expediente puede haberse cerrado por el camino
    return {
      id: 'inq_rastro', gen: true,
      t: '<span class="scene-tag">EL RASTRO · ' + U.esc(c.mundo.toUpperCase()) + '</span>' +
        '<p>' + U.esc(c.perfil.n.charAt(0).toUpperCase() + c.perfil.n.slice(1)) + ' en ' + U.esc(c.mundo) + '. ' +
        U.esc(c.perfil.d) + '</p><p>Un jedi escondido lleva doce años siendo bueno escondiéndose. Tú llevas menos cazando.</p>',
      c: [
        { t: 'Buscar en la Fuerza', sub: 'Se sienten unos a otros. Eso vale en las dos direcciones.',
          cazaRastro: 'fuerza' },
        { t: 'Detener y presionar a la gente del barrio', sub: 'Funciona. Y deja un reguero.',
          cazaRastro: 'presion' },
        { t: 'Rastrear el papeleo: raciones, permisos, médicos',
          sub: 'Lento y silencioso. Nadie sabe que estás.', cazaRastro: 'papel' },
        { t: 'Dejar que te encuentre él', sub: 'Ponerte a la vista y esperar. Muy arriesgado.',
          cazaRastro: 'cebo' }
      ]
    };
  };

  SW.resolverRastro = function (g, modo) {
    const s = g.s, c = s.caza, rng = g.rng;
    let p, txt;
    if (modo === 'fuerza') {
      p = U.clamp(0.35 + (s.stats.fuerza - c.listo) / 130, 0.2, 0.85);
      txt = 'Cierras los ojos en mitad de la plaza y buscas el hueco donde alguien está intentando no existir.';
      c.aviso = (c.aviso || 0) + 30;   // te siente igual que tú a él
    } else if (modo === 'presion') {
      p = U.clamp(0.42 + s.stats.notoriedad / 190, 0.28, 0.86);
      txt = 'Cuatro puertas y dos detenciones. A la tercera, alguien habla.';
      c.aviso = (c.aviso || 0) + 45;
      g.aplicarFx({ alineamiento: -12, notoriedad: 10, reputacion: -6 }, {});
    } else if (modo === 'papel') {
      p = U.clamp(0.30 + s.stats.intelecto / 150, 0.22, 0.82);
      txt = 'Tres semanas de registros. Una tarjeta de racionamiento que come por dos en una casa de uno.';
      c.aviso = (c.aviso || 0) + 5;
    } else {
      p = 0.62;
      txt = 'Te sientas en la terraza de la plaza mayor con la capa puesta y esperas cuatro días.';
      c.aviso = (c.aviso || 0) + 70;
      g.aplicarFx({ cordura: -6 }, {});
    }
    if (rng.chance(p)) {
      g.log(txt + ' <b>Lo tienes.</b>', 'bien');
      c.fase = 'cerco';
      return SW.ESCENAS.inq_cerco(g);
    }
    g.log(txt + ' No sale nada. Se ha movido antes de que llegaras.', 'mal');
    c.intentos = (c.intentos || 0) + 1;
    if (c.intentos >= 3) {
      g.log('El expediente se enfría. Vuelve a la lista de espera con una nota tuya al margen.', 'res');
      g.aplicarFx({ reputacion: -8, cordura: -4 }, {});
      s.caza = null;
      return null;
    }
    return null;
  };

  SW.ESCENAS.inq_cerco = function (g) {
    const c = g.s.caza;
    if (!c) return null;
    const alerta = (c.aviso || 0) > 55;
    return {
      id: 'inq_cerco', gen: true,
      t: '<span class="scene-tag">EL CERCO</span>' +
        '<p>Sabes dónde duerme. ' + (alerta
          ? 'Y él sabe que lo sabes: lleva dos días sin dormir en el mismo sitio y ha sacado a la familia del barrio.'
          : 'No sabe nada todavía. Eso vale más que cualquier pelotón.') + '</p>',
      c: [
        { t: 'Entrar solo y de noche', sub: 'Sin testigos y sin nadie que te estorbe.', cazaCerco: 'solo' },
        { t: 'Rodear la manzana con tropas de asalto', sub: 'No se escapa. Se entera media ciudad.',
          cazaCerco: 'tropas' },
        { t: 'Coger a los suyos primero', sub: 'Sale él solo. Siempre salen.', cazaCerco: 'rehenes' },
        { t: 'Hablar con él antes de encender nada',
          sub: 'Ofrecerle lo que a ti te ofrecieron.', cazaCerco: 'hablar' }
      ]
    };
  };

  SW.resolverCerco = function (g, modo) {
    const s = g.s, c = s.caza, rng = g.rng;
    c.mod = 0;
    if (modo === 'solo') {
      c.mod = (c.aviso || 0) > 55 ? 10 : -12;
      g.log((c.aviso || 0) > 55 ? 'Te está esperando desde hace horas, sentado y con la hoja apagada.'
                                : 'Entras sin ruido. La ventaja es tuya durante los tres primeros segundos.', 'res');
    } else if (modo === 'tropas') {
      c.mod = -6; c.sonado = true;
      g.aplicarFx({ notoriedad: 14, alineamiento: -6 }, {});
      g.log('Cuarenta hombres y dos transportes. Caen ocho antes de que puedas acercarte tú.', 'res');
    } else if (modo === 'rehenes') {
      c.mod = -20; c.rehenes = true;
      g.aplicarFx({ alineamiento: -25, cordura: -10, notoriedad: 12 }, {});
      g.log('Sale a la calle él solo, con las manos abiertas y la peor cara que has visto.', 'res');
    } else {
      // hablar: a veces se rinde, casi nunca
      const p = U.clamp(0.10 + s.stats.carisma / 300 + (c.perfil.nino ? 0.35 : 0), 0.08, 0.5);
      if (rng.chance(p)) {
        g.log('Baja la hoja. No sabes si es sensatez o si se ha cansado.', 'bien');
        s.caza = null;
        return SW.ESCENAS.inq_rendicion(g, c);
      }
      c.mod = 6;
      g.log('Te deja hablar entero y luego dice que no. Suelen decir que no.', 'res');
    }
    c.fase = 'duelo';
    return SW.ESCENAS.inq_duelo(g);
  };

  SW.ESCENAS.inq_rendicion = function (g, c) {
    c = c || {};
    return {
      id: 'inq_rendicion', gen: true,
      t: '<span class="scene-tag">SE ENTREGA</span>' +
        '<p>' + U.esc((c.nombre || 'El objetivo')) + ' te entrega su sable con las dos manos, como se hace con un maestro.</p>',
      c: [
        { t: 'Entregarlo vivo a la Fortaleza', fx: { reputacion: 14, alineamiento: -12, creditos: 18000 },
          cazaJedi: { sonado: false }, out: 'Lo que le hacen allí dentro no es asunto tuyo. Eso te dices.' },
        { t: 'Matarlo ahí mismo', fx: { alineamiento: -26, cordura: -14, fuerza: 8, notoriedad: 10, creditos: 12000 },
          cazaJedi: { sonado: true }, out: 'Es más rápido. También es lo que ellos esperan que hagas.' },
        { t: 'Dejarle marchar y poner «no localizado»',
          fx: { alineamiento: 22, cordura: 10, reputacion: -14 }, flag: 'inquisidor_blando',
          out: 'Se va sin darte las gracias. Mejor: las gracias dejan rastro.' }
      ]
    };
  };

  SW.ESCENAS.inq_duelo = function (g) {
    const s = g.s, c = s.caza;
    if (!c) return null;
    const dif = U.clamp(c.dif + (c.mod || 0), 30, 96);
    g.iniciarCombate({
      dif: dif, duelo: true, sable: !!s.sable, aMuerte: true,
      cazaJedi: true, objetivo: c.nombre, sonado: !!c.sonado
    });
    return null;
  };

  /* ------------------------------------------------------------
     Final de una caza y de la pelea con Vader
     ------------------------------------------------------------ */
  SW.finCombateExtra = function (g, e, victoria) {
    const s = g.s;

    /* --- Vader, fase 1: no se gana. Se sobrevive lo suficiente --- */
    if (e.cfg.vader === 1) {
      g.escena = null;
      if (!victoria && s.stats.salud <= 0) return false;   // que muera por la vía normal
      g.cola.unshift(g.prepararGen(SW.ESCENAS.vader_frase(g)));
      g.fase = 'evento';
      return true;
    }
    if (e.cfg.vader === 2) {
      g.escena = null;
      if (victoria) { SW.matarVader(g); return true; }
      return false;   // perder contra Vader en fase 2 es lo normal: vía normal
    }

    /* --- caza de un jedi --- */
    if (e.cfg.cazaJedi) {
      g.escena = null;
      const c = s.caza;
      s.caza = null;
      if (victoria) {
        g.aplicarFx({ fuerza: 10, destreza: 6, creditos: 22000, notoriedad: 14,
                      alineamiento: -14, cordura: -8, reputacion: 10 }, {});
        g.log('Se acabó. Recoges el sable y lo metes en la caja que te dieron para eso.', 'mal');
        g.hito('Caza a ' + (e.cfg.objetivo || 'un jedi'));
        SW.marcarJediCazado(g, { sonado: !!e.cfg.sonado });
      } else {
        g.aplicarFx({ salud: -18, cordura: -12, reputacion: -14 }, {});
        g.log('Se te va. Vas a tener que explicar esto por escrito.', 'mal');
        if (c) s.flags['fallo_' + (c.perfil ? c.perfil.n : 'caza')] = true;
      }
      if (s.stats.salud <= 0 && !s.muerto) g.morir('Muere cazando a un jedi.');
      g.reanudarCadena();
      return true;
    }

    /* --- te cazaban a ti y el que ha caído es el otro --- */
    if (e.cfg.inquisidorCaza) {
      g.escena = null;
      if (victoria) {
        g.aplicarFx({ fuerza: 12, destreza: 6, reputacion: 10, notoriedad: 18, cordura: -10 }, {});
        g.log('Cae. Le quitas el comunicador y el sable de doble hoja: los dos van a hacerte falta.', 'bien');
        g.hito('Mata a un inquisidor');
        s.contadores.inquisidoresMuertos = (s.contadores.inquisidoresMuertos || 0) + 1;
        // matar a uno no te quita a los demás de encima: al contrario
        s.stats.notoriedad = U.clamp(s.stats.notoriedad + 10, 0, 100);
        if (!s.sable && g.rng.chance(0.6)) {
          s.sable = { color: 'rojo', hex: '#ff3a3a', forma: s.forma || 'Makashi', sangrado: true, doble: true };
          g.log('Te quedas su hoja. Es roja y da mala espina llevarla encima.', 'mal');
        }
      } else {
        g.aplicarFx({ salud: -20, cordura: -14 }, {});
        g.log('No puedes con él. Sales de allí porque algo se derrumba entre los dos.', 'mal');
        g.aplicarFx({ notoriedad: 12 }, {});
      }
      if (s.stats.salud <= 0 && !s.muerto) g.morir('Le encontró la Inquisición.');
      g.reanudarCadena();
      return true;
    }
    return false;
  };

  /* ============================================================
     DARTH VADER
     ============================================================ */
  SW.GUION.push({
    id: 'inq_vader', min: 12, max: 200, prio: 140, unaVez: true, gen: true, c: [],
    req: function (s) {
      return SW.esInquisidor(s) && !s.flags.vader_visto && SW.amenazaVader(s) >= AMENAZA_MAX;
    },
    hazlo: function (g) {
      g.s.flags.vader_visto = true;
      SW.premioEncuentroVader(g);
      return SW.ESCENAS.vader_llega(g);
    }
  });

  /* El casco se gana por PLANTARSE delante de él, no por ganarle.
     Ganarle es casi imposible a propósito: si la reliquia dependiera de
     eso, no la vería nadie nunca. Lo que se premia es haber llegado
     hasta aquí y haberle mirado, salgas vivo o no. */
  SW.premioEncuentroVader = function (g) {
    const s = g.s;
    if (s.flags.casco_desbloqueado) return;
    s.flags.casco_desbloqueado = true;
    g.hito('Se planta delante de Darth Vader');
    if (SW.desbloquearReliquia) SW.desbloquearReliquia('casco_vader');
    g.log('Muy pocos han estado a dos metros de eso. <b>El casco queda desbloqueado</b>: ' +
      'podrás empezar cualquier vida futura llevándolo.', 'bien');
    g.popup({
      tipo: 'reliquia', titulo: 'RELIQUIA DESBLOQUEADA', nombre: 'Casco de Darth Vader',
      sprite: 'casco_vader', color: '#c8102e',
      desc: 'Estás a dos metros de él y no has salido corriendo. Eso ya es más de lo que puede decir ' +
            'casi nadie, y en esta galaxia lo que se hace delante de Vader no se olvida: ' +
            'a partir de ahora podrás empezar cualquier vida con el casco.',
      stats: ['no hace falta ganarle', 'la fama cuenta casi el doble', 'tira de ti hacia el lado oscuro']
    });
  };

  SW.ESCENAS.vader_llega = function (g) {
    const s = g.s;
    return {
      id: 'vader_llega', gen: true,
      t: '<span class="momento-tag">ÉL</span>' +
        '<p>El hangar se queda sin ruido de golpe, como si alguien hubiera cerrado una puerta muy grande en otro sitio.</p>' +
        '<p>Baja por la rampa sin prisa. Dos metros y dos dedos de negro, y una respiración que llena todo el edificio. ' +
        'Lleva un rato observando tu expediente: ' + (s.contadores.jediCazados || 0) + ' cerrados, ' +
        'una hoja roja que no le pidió permiso a nadie y una reputación que ya se pronuncia en las guarniciones.</p>' +
        '<p>«<b>Has llegado lejos.</b>» Pausa. «<b>Demasiado.</b>»</p>',
      c: [
        { t: 'Arrodillarte y jurar que no eras una amenaza',
          r: [
            { p: 0.30, t: 'Te deja ahí, de rodillas, y se va. Vas a vivir. También vas a acordarte de esto todos los días.',
              fx: { cordura: -30, reputacion: -25, notoriedad: -20, alineamiento: -8 },
              flag: 'humillado_por_vader', hito: 'Se arrodilla ante Vader' },
            { p: 0.70, t: 'No dice nada. Levanta una mano y tu propia hoja sale del cinturón hacia él.',
              cadena: 'vader_fase1' }
          ] },
        { t: 'Encender la hoja', sub: 'Es lo único honesto que te queda.', cadena: 'vader_fase1' },
        { t: 'Tirarle encima el generador del hangar y correr',
          sub: 'Nadie le ha ganado peleando. A lo mejor se le gana no peleando.',
          r: [
            { p: 0.22, t: 'Cuarenta toneladas de generador y una explosión que se ve desde la órbita. Cuando se apaga el fuego, él está de pie donde estaba. Pero tú ya no.',
              fx: { salud: -30, cordura: -20, notoriedad: 25 }, flag: 'huyo_de_vader',
              hito: 'Escapa de Darth Vader', mover: true, motivo: 'huyendo de algo que no se puede matar' },
            { p: 0.78, t: 'El generador se para en el aire a medio metro de él y vuelve por donde vino.',
              fx: { salud: -26 }, cadena: 'vader_fase1' }
          ] }
      ]
    };
  };

  SW.ESCENAS.vader_fase1 = function (g) {
    g.iniciarCombate({
      dif: 88, duelo: true, sable: !!g.s.sable, aMuerte: true, canon: 'Darth Vader',
      vader: 1, faseVader: 1, huirFatal: 'No se le da la espalda a Darth Vader.'
    });
    /* Primera fase: dura, pero de las que se pueden ganar. Está jugando
       contigo y todavía no se le nota. */
    const e = g.escena;
    if (e) { e.hpEnemigo = 240; e.hpMaxEnemigo = 240; e.golpe = 1.45; e.maxRondas = 6; }
    return null;
  };

  SW.ESCENAS.vader_frase = function (g) {
    const s = g.s;
    const bien = s.stats.salud > 45;
    return {
      id: 'vader_frase', gen: true,
      t: '<span class="momento-tag">SEGUNDA FASE</span>' +
        '<p>' + (bien
          ? 'Le has hecho retroceder tres pasos. Tres. Nadie en la Fortaleza se va a creer esto y tú tampoco te lo crees del todo.'
          : 'Estás de rodillas, con la hoja todavía encendida y sin saber muy bien cómo sigues sujetándola.') + '</p>' +
        '<p>Él se para. Ladea la cabeza un poco, como quien reconoce por fin de qué se trataba todo esto.</p>' +
        '<p class="vader-linea">«Impresionante. Te han enseñado bien.<br>' +
        'Pero llevas toda la pelea peleando contra un hombre.<br>' +
        '<b>Yo dejé de serlo hace mucho.</b>»</p>' +
        '<p>Y entonces cambia la guardia. Y el hangar entero parece más pequeño.</p>',
      c: [
        { t: 'Volver a levantar la hoja', cadena: 'vader_fase2' },
        { t: 'Soltar el sable', sub: 'Ya está. Se acabó.',
          r: [
            { p: 0.35, t: 'Cae al suelo y hace mucho ruido. Él lo mira, te mira, y se da la vuelta. «Ya no eres nada.» Y eso, viniendo de él, es un indulto.',
              fx: { cordura: -34, reputacion: -30, notoriedad: -25, fuerza: -12 }, sablePierde: true,
              flag: 'perdonado_por_vader', hito: 'Vader le perdona la vida' },
            { p: 0.65, t: 'Cae al suelo. Él no se para por eso.', cadena: 'vader_fase2' }
          ] },
        { t: 'Decirle que sabes quién era antes',
          req: function (st) { return st.stats.intelecto > 65 || st.flags.saqueo_templo; },
          sub: 'Lo has leído en un holocrón que no deberías haber abierto.',
          r: [
            { p: 0.30, t: 'Se para. Durante cuatro segundos larguísimos no hace absolutamente nada. Luego el hangar se derrumba sobre la mitad del edificio y tú sales por el otro lado.',
              fx: { salud: -34, cordura: -22, notoriedad: 20, intelecto: 8 }, flag: 'huyo_de_vader',
              hito: 'Le dice a Vader su nombre de antes', mover: true, motivo: 'con algo que nadie más sabe' },
            { p: 0.70, t: 'Dices el nombre. Es lo último que dices con la garganta libre.',
              fx: { salud: -30, cordura: -18 }, cadena: 'vader_fase2' }
          ] }
      ]
    };
  };

  SW.ESCENAS.vader_fase2 = function (g) {
    const s = g.s;
    s.flags.vader_fase2 = true;
    /* Casi imposible: aguanta más del doble, pega el doble, la ventana
       del duelo se estrecha al 60% y la táctica corriente casi no le
       hace nada. Se puede ganar. Casi nadie lo hace. */
    g.iniciarCombate({
      dif: 99, duelo: true, sable: !!s.sable, aMuerte: true, canon: 'Darth Vader',
      vader: 2, faseVader: 2, huirFatal: 'Intentó darle la espalda a Darth Vader.'
    });
    const e = g.escena;
    if (e) {
      e.hpEnemigo = 400; e.hpMaxEnemigo = 400;
      e.golpe = 2.1; e.maxRondas = 8;
    }
    return null;
  };

  SW.matarVader = function (g) {
    const s = g.s;
    s.flags.mato_a_vader = true;
    g.aplicarFx({ fuerza: 25, reputacion: 40, notoriedad: 60, cordura: -20, alineamiento: -10 }, {});
    g.hito('MATA A DARTH VADER');
    g.log('Se queda de rodillas. La respiración se rompe y no vuelve a empezar. ' +
      'Cuando se calla del todo, el silencio es lo más raro que has oído en tu vida.', 'muerte');
    if (SW.marcarCanon) SW.marcarCanon(g, 'Darth Vader', 'muerto');
    // el casco ya lo tenías por plantarte: esto es la hazaña, que es otra cosa
    if (SW.desbloquearReliquia) SW.desbloquearReliquia('casco_vader');
    g.popup({
      tipo: 'hazaña', titulo: 'HAS MATADO A DARTH VADER', nombre: 'El hangar en silencio',
      sprite: 'casco_vader', color: '#c8102e',
      desc: 'No lo ha hecho nadie. Lo levantas del suelo, todavía caliente, y pesa mucho más de lo ' +
            'que parece. El Emperador lo va a saber en menos de una hora.',
      stats: ['el casco ya era tuyo', 'ahora además eres quien lo mató', 'queda en el salón de tus vidas']
    });
    g.cola.unshift(g.prepararGen({
      id: 'vader_muerto', gen: true,
      t: '<span class="momento-tag">EL CASCO</span>' +
        '<p>En el suelo del hangar hay un casco negro y quemado con la rejilla partida.</p>' +
        '<p>El Emperador va a saber esto en menos de una hora. Tienes, siendo generoso, esa hora.</p>',
      c: [
        { t: 'Coger el casco y desaparecer', fx: { cordura: -14, notoriedad: 20 },
          flag: 'tiene_casco_vader', mover: true, motivo: 'con un casco en una bolsa',
          out: 'No vas a poder enseñárselo a nadie nunca. Eso también es un peso.' },
        { t: 'Coger el casco y sentarte en su sitio', sub: 'Alguien tiene que estar al lado del trono.',
          fx: { alineamiento: -30, notoriedad: 30, fuerza: 12, reputacion: 20 },
          flag: 'tiene_casco_vader', flag2: 'aspirante_al_trono',
          out: 'Cuando el Emperador te recibe, no parece sorprendido. Parece interesado, que es mucho peor.' },
        { t: 'Quemar el hangar entero y no coger nada',
          fx: { cordura: 14, alineamiento: 20, notoriedad: -20 }, flag: 'quemo_el_hangar',
          mover: true, motivo: 'sin nada en las manos',
          out: 'Que se piensen lo que quieran. Tú sabes lo que pasó y con eso basta.' }
      ]
    }));
    g.fase = 'evento';
  };

  /* ============================================================
     SI SOBREVIVISTE A LA PURGA: ellos siguen buscando
     ============================================================ */
  SW.GUION.push({
    id: 'pu_inquisidor_caza', min: 12, max: 200, prio: 86, repetible: true, gen: true, c: [],
    req: function (s) {
      if (!s.flags.superviviente_purga || s.flags.inquisidor) return false;
      if (['imperio_temprano', 'rebelion'].indexOf(s.era) < 0) return false;
      /* Sobrevivir a una visita te da aire: pierden el rastro un par de
         años. Si no, la notoriedad que deja cada encuentro realimenta la
         siguiente y te cazan en bucle. */
      if (s.ultimaVisitaInq != null && s.edad - s.ultimaVisitaInq < 3) return false;
      return true;
    },
    hazlo: function (g) {
      const s = g.s;
      /* La tirada va aquí y no en req: req se evalúa muchas veces por
         año y con Math.random dejaría de ser la misma vida con la misma
         semilla. Esconderse funciona: pesa la notoriedad y lo expuesto
         que vivas. */
      const p = U.clamp(0.10 + s.stats.notoriedad / 480 + (s.flags.jedi_oculto ? -0.05 : 0.04) +
        (s.flags.busca_supervivientes ? 0.07 : 0) + (s.flags.o66_fichado ? 0.06 : 0), 0.04, 0.30);
      if (!g.rng.chance(p)) return null;
      s.ultimaVisitaInq = s.edad;
      return SW.ESCENAS.pu_inquisidor(g);
    }
  });

  SW.ESCENAS.pu_inquisidor = function (g) {
    const s = g.s;
    const n = g.rng.pick(NUMEROS);
    s.o66 = s.o66 || {};
    s.o66.cazador = n;
    return {
      id: 'pu_inquisidor', gen: true,
      t: '<span class="scene-tag">TE HAN ENCONTRADO</span>' +
        '<p>Llevas años haciendo bien las cosas: sin nombre, sin sable a la vista, sin usar nada de lo que sabes.</p>' +
        '<p>Y aun así, esta tarde hay alguien apoyado en la pared de enfrente con una capa demasiado buena para este barrio. ' +
        'Cuando te mira, sabes exactamente lo que es. <b>' + U.esc(n) + '</b>.</p>',
      c: [
        { t: 'Encender el sable', req: function (st) { return !!st.sable; },
          combate: { dif: U.clamp(64 + s.stats.notoriedad / 4, 60, 90), duelo: true, sable: true,
                     aMuerte: true, inquisidorCaza: true },
          fx: { cordura: -8 } },
        { t: 'Correr y perderle en el mercado',
          r: [
            { p: U.clamp(0.40 + s.stats.destreza / 220 + s.stats.intelecto / 320, 0.3, 0.8),
              t: 'Tres calles, un tejado y una alcantarilla. Cuando sales, no hay nadie.',
              fx: { destreza: 6, cordura: -10 }, mover: true, motivo: 'porque te habían encontrado' },
            { p: 0.6, t: 'Te alcanza en el callejón de las cocinas.',
              fx: { salud: -22 }, combate: { dif: 74, duelo: true, sable: !!s.sable, aMuerte: true, inquisidorCaza: true } }
          ] },
        { t: 'Usar la Fuerza para que se olvide de tu cara',
          req: function (st) { return st.sensible && st.stats.fuerza > 50; },
          sub: 'Con un inquisidor. Que también la usa.',
          r: [
            { p: U.clamp(0.20 + s.stats.fuerza / 300, 0.18, 0.45), t: 'Se queda mirando un escaparate durante mucho rato y luego se va con prisa a otro sitio.',
              fx: { fuerza: 12, cordura: -8 } },
            { p: 0.55, t: 'Nota el empujón y sonríe. Ahora sabe seguro que eres tú.',
              fx: { notoriedad: 15 }, combate: { dif: 78, duelo: true, sable: !!s.sable, aMuerte: true, inquisidorCaza: true } }
          ] },
        { t: 'Entregarte para que dejen en paz a los de aquí',
          sub: 'Hay una familia que lleva seis años dándote de comer.',
          fx: { alineamiento: 30, cordura: -16 },
          r: [
            { p: 0.25, t: 'Cumplen. A veces cumplen. Te llevan a un sitio del que se sale, aunque tarde años.',
              fx: { salud: -30, cordura: -20 }, carcel: 4, sablePierde: true },
            { p: 0.75, t: 'No cumplen.',
              muerte: true, muerteTxt: 'Se entregó a la Inquisición para salvar a los suyos.' }
          ] }
      ]
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   HOLOVIDA :: RIESGO Y MUERTE
   Antes era casi imposible morir joven: perder un combate costaba
   diez de salud y la guerra era un adorno. Aquí vive la parte fea:
   cuánto te puede matar cada cosa, y cómo las malas decisiones se
   acumulan hasta que una noche cualquiera no te levantas.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ============================================================
     PELIGRO ACUMULADO
     Cada decisión temeraria suma. El peligro baja solo, despacio,
     si te portas bien. Alto peligro = más probabilidad de que algo
     te salga muy mal este año.
     ============================================================ */
  SW.PELIGRO_MAX = 100;

  /** cuánto peligro añade lo que acabas de hacer */
  SW.peligroDe = function (d) {
    let p = 0;
    if (d.combate) p += 6 + (d.combate.dif || 50) / 12;
    if (d.dogfight) p += 8;
    if (d.buscado) p += d.buscado / 3;
    if (d.herida) p += (d.herida.sev || 10) / 2.5;
    if (d.guerra) p += 22;
    if (d.fx) {
      if (d.fx.salud && d.fx.salud < -12) p += (-d.fx.salud - 12) / 2.2;
      if (d.fx.notoriedad && d.fx.notoriedad > 8) p += (d.fx.notoriedad - 8) / 2.4;
      if (d.fx.alineamiento && d.fx.alineamiento < -14) p += 3;
      if (d.fx.cordura && d.fx.cordura < -12) p += 2.5;
    }
    return p;
  };

  /** el precio de vivir peligrosamente, una vez al año */
  SW.cobrarPeligro = function (g) {
    const s = g.s, rng = g.rng, U = SW.U;
    const p = s.peligro || 0;
    if (p <= 0) return;

    // el riesgo se dispara si además estás herido o sin cordura
    let mult = 1;
    if (s.stats.salud < 40) mult += 0.7;
    if (s.heridas.length >= 2) mult += 0.5;
    if (s.stats.cordura < 25) mult += 0.4;
    if (s.stats.fisico > 60) mult -= 0.25;
    if (s.habilidades.indexOf('supervivencia') >= 0) mult -= 0.2;
    mult = Math.max(0.3, mult);

    // por debajo de 30 de peligro no pasa nada: se puede vivir así
    const prob = U.clamp(((p - 30) / 260) * mult, 0, 0.42);
    if (prob > 0 && rng.chance(prob)) {
      const grave = rng.chance(U.clamp(p / 190, 0.1, 0.6));
      if (grave) {
        g.log('Se te acumularon demasiadas. Esta te alcanza de lleno.', 'mal');
        g.morir(SW.MUERTES_RIESGO[rng.int(0, SW.MUERTES_RIESGO.length - 1)]);
        return;
      }
      const h = rng.pick(SW.HERIDAS_RIESGO);
      g.log('Vivir así se paga: ' + h.txt, 'mal');
      g.aplicarFx({ salud: -rng.int(14, 30), cordura: -6 }, {});
      g.herir(h.n, rng.int(10, 22), rng.chance(0.2));
      s.peligro = Math.max(0, p - 25);
      return;
    }

    // se enfría solo: el que se porta bien un año respira
    s.peligro = Math.max(0, p - (5 + s.stats.fisico / 25));
  };

  SW.MUERTES_RIESGO = [
    'Un ajuste de cuentas pendiente desde hacía años.',
    'Una emboscada de la que ya te habían avisado.',
    'Una herida vieja que nunca terminó de cerrar.',
    'Un trabajo más. Siempre es un trabajo más.',
    'Alguien a quien le debías algo y se cansó de esperar.',
    'La suerte se acabó a mitad de una calle cualquiera.',
    'Un disparo desde un tejado. Ni lo oíste.',
    'La deuda se cobró sola.'
  ];
  SW.HERIDAS_RIESGO = [
    { n: 'costillas rotas', txt: 'te esperaban a la salida y esta vez eran tres.' },
    { n: 'corte profundo', txt: 'un cuchillo en un callejón que conocías bien.' },
    { n: 'quemadura de bláster', txt: 'un disparo que no viste venir.' },
    { n: 'pierna destrozada', txt: 'te tiraron por unas escaleras y no fue un accidente.' },
    { n: 'conmoción', txt: 'despiertas en una clínica sin saber cómo llegaste.' },
    { n: 'infección', txt: 'algo que no curaste a tiempo se pone muy feo.' }
  ];

  /* ============================================================
     PERDER UN COMBATE AHORA DUELE
     ============================================================ */
  SW.consecuenciaDerrota = function (g, cfg, hpEnemigo) {
    const s = g.s, rng = g.rng, U = SW.U;
    const dif = (cfg && cfg.dif) || 50;
    // lo cerca que estuviste importa: perder por poco no es perder por mucho
    const paliza = U.clamp((hpEnemigo == null ? 60 : hpEnemigo) / 100, 0, 1);

    // probabilidad de que no salgas vivo de esta
    let pMuerte = U.clamp((dif - 30) / 330 + paliza * 0.13, 0, 0.4);
    if (cfg && cfg.duelo) pMuerte += 0.10;         // un duelo es a algo
    if (cfg && cfg.canon) pMuerte += 0.22;         // contra una leyenda, más
    if (cfg && cfg.bestia) pMuerte += 0.08;
    if (cfg && cfg.aMuerte) pMuerte += 0.25;
    if (s.stats.salud < 35) pMuerte += 0.14;
    if (s.stats.fisico > 65) pMuerte -= 0.08;
    if (s.sensible && s.stats.fuerza > 50) pMuerte -= 0.10;
    if (s.habilidades.indexOf('medico') >= 0) pMuerte -= 0.04;
    pMuerte = U.clamp(pMuerte, 0.02, 0.5);

    if (rng.chance(pMuerte)) {
      g.morir(cfg && cfg.duelo ? 'Pierde el duelo. No hubo segunda parte.'
            : (cfg && cfg.bestia ? 'La bestia pudo con él.' : 'Cae en combate.'));
      return true;
    }

    // sobrevives, pero con factura
    const dano = Math.round(18 + dif / 3 + paliza * 22);
    g.aplicarFx({ salud: -dano, cordura: -10, reputacion: -6 }, {});
    const h = rng.pick(SW.HERIDAS_DERROTA);
    g.herir(h, Math.round(10 + dif / 5), rng.chance(0.18));
    g.log('Sales vivo. Poco más se puede decir.', 'mal');
    s.peligro = (s.peligro || 0) + 10;
    if (s.stats.salud <= 0 && !s.muerto) g.morir('Heridas de combate.');
    return false;
  };
  SW.HERIDAS_DERROTA = ['costillas hundidas', 'brazo roto', 'corte que llega al hueso',
    'quemadura profunda', 'mandíbula partida', 'rodilla destrozada', 'perforación'];

  /* ============================================================
     LA GUERRA MATA
     Alistarse deja de ser una línea de texto. Cada año de frente
     es una tirada, y la tirada es mala.
     ============================================================ */
  SW.RIESGO_GUERRA = {
    // por bando/puesto: cuánto de mortal es cada año en el frente
    infanteria: 0.17, piloto: 0.13, comando: 0.20, oficial: 0.07,
    medico: 0.06, ingeniero: 0.05, clon: 0.19
  };

  /** una campaña: se resuelve año a año mientras dure la guerra */
  SW.añoDeGuerra = function (g) {
    const s = g.s, rng = g.rng, U = SW.U;
    if (!s.flags.en_el_frente) return;

    const puesto = s.puestoGuerra || 'infanteria';
    let p = SW.RIESGO_GUERRA[puesto] || 0.16;

    // lo que te salva: estar en forma, saber pelear, tener suerte, la Fuerza
    p *= U.clamp(1.35 - s.stats.fisico / 190 - s.stats.destreza / 210 - s.stats.suerte / 320, 0.45, 1.4);
    if (s.sensible && s.stats.fuerza > 40) p *= 0.62;
    if (s.habilidades.indexOf('supervivencia') >= 0) p *= 0.85;
    if (s.armadura || (s.objetos || []).some(function (o) { return /armadura|beskar/i.test(o); })) p *= 0.8;
    if (s.stats.salud < 45) p *= 1.5;
    p = U.clamp(p, 0.02, 0.55);

    s.contadores.añosFrente = (s.contadores.añosFrente || 0) + 1;
    s.añosDeFrenteRestantes = (s.añosDeFrenteRestantes || 1) - 1;
    if (s.añosDeFrenteRestantes <= 0) {
      s.flags.en_el_frente = false;
      g.log('Termina tu campaña. Te mandan a casa.', 'bien');
    }

    if (rng.chance(p)) {
      g.morir(rng.pick(SW.MUERTES_GUERRA));
      return;
    }
    // sobrevives el año: nadie sale igual
    const dur = rng.int(0, 3);
    if (dur === 0) {
      g.log('Un año entero en el frente. Vuelves entero de milagro.', 'res');
      g.aplicarFx({ fisico: 6, destreza: 5, cordura: -12, reputacion: 5 }, {});
    } else if (dur === 1) {
      g.log('Te alcanzan. Te cosen en campaña y vuelves a la línea en dos semanas.', 'mal');
      g.aplicarFx({ salud: -rng.int(18, 34), cordura: -14, fisico: 4, reputacion: 7 }, {});
      g.herir(rng.pick(SW.HERIDAS_GUERRA), rng.int(10, 24), rng.chance(0.22));
    } else if (dur === 2) {
      g.log('Pierdes a gente con la que llevabas meses comiendo.', 'mal');
      g.aplicarFx({ cordura: -22, alineamiento: -3, fisico: 5, reputacion: 8 }, {});
      s.flags.perdio_companeros = true;
    } else {
      g.log('Haces algo en el frente de lo que se habla después.', 'bien');
      g.aplicarFx({ reputacion: 14, fisico: 6, destreza: 6, cordura: -8 }, {});
    }
    if (s.stats.salud <= 0 && !s.muerto) g.morir('Muere de sus heridas en campaña.');
  };

  SW.MUERTES_GUERRA = [
    'Cae en el frente. Ni la primera ni la última de ese día.',
    'Un bombardeo orbital sobre la posición. No quedó nada que repatriar.',
    'Muere cubriendo la retirada de su unidad.',
    'Una emboscada al amanecer. La columna entera.',
    'Muere en la enfermería de campaña, tres días después.',
    'Su transporte no llegó nunca a la zona de aterrizaje.',
    'Cae en la segunda oleada, a doscientos metros del objetivo.'
  ];
  SW.HERIDAS_GUERRA = ['metralla en el costado', 'quemadura de plasma', 'pierna reventada',
    'perforación de bláster', 'oído perdido', 'mano destrozada'];

  /* ============================================================
     ALISTARSE: ahora te dicen a qué te apuntas
     ============================================================ */
  SW.PUESTOS_GUERRA = [
    { id: 'infanteria', n: 'Infantería de línea', sub: 'Donde muere la gente. Paga poco.',
      fx: { fisico: 10, destreza: 6, creditos: 3500 }, aviso: 'Uno de cada cinco no vuelve.' },
    { id: 'piloto', n: 'Piloto de caza', sub: 'Requiere pulso', req: function (s) { return s.stats.destreza > 40; },
      fx: { destreza: 12, intelecto: 6, creditos: 7000 }, aviso: 'Uno de cada siete no vuelve.' },
    { id: 'comando', n: 'Unidad de asalto', sub: 'Lo peor de lo peor', req: function (s) { return s.stats.fisico > 45; },
      fx: { fisico: 14, destreza: 10, creditos: 9000, notoriedad: 8 }, aviso: 'Uno de cada cinco. Siendo optimistas.' },
    { id: 'oficial', n: 'Oficial de estado mayor', sub: 'Mandas desde atrás', req: function (s) { return s.stats.intelecto > 45 || s.stats.carisma > 50; },
      fx: { intelecto: 10, carisma: 10, creditos: 14000, reputacion: 8 }, aviso: 'Mueres mucho menos. Y lo sabes.' },
    { id: 'medico', n: 'Sanitario de campaña', sub: 'Vas al frente a sacar gente',
      fx: { intelecto: 12, alineamiento: 14, creditos: 5000 }, habilidad: 'medico', aviso: 'Te disparan igual, pero duermes mejor.' },
    { id: 'ingeniero', n: 'Zapador / mecánico', sub: 'Detrás de la línea, casi siempre', req: function (s) { return s.stats.intelecto > 38; },
      fx: { intelecto: 12, destreza: 8, creditos: 6500 }, habilidad: 'ingeniero', aviso: 'El puesto más seguro que hay en una guerra.' }
  ];

})(typeof window !== 'undefined' ? window : globalThis);

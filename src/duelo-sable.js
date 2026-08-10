/* ============================================================
   HOLOVIDA :: DUELOS DE SABLE
   Un duelo no es «pulsa el botón cuando pase la barra». Es leer de
   dónde viene el golpe (alto, medio, bajo), decidir si se para, se
   esquiva o se entra, y hacerlo en el instante justo: ni antes ni
   después. Y la forma de combate que elegiste al construir el sable
   cambia el margen que tienes, cuántos intercambios aguantas, lo que
   devuelves al parar bien y lo que encajas al fallar.

   También vive aquí lo que se hereda de una vida a otra: las
   reliquias (el casco, si algún día llegas tan lejos).
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ------------------------------------------------------------
     LAS SIETE FORMAS
     ventana  : ancho del margen para parar (multiplicador)
     asaltos  : intercambios del duelo
     contra   : lo que devuelves cuando la parada es perfecta
     guardia  : lo que encajas cuando fallas (menos es mejor)
     vsBlaster: corrección cuando lo que llega son disparos, no un sable
     coste    : aguante que quema el duelo
     ------------------------------------------------------------ */
  const FORMAS = {
    'Shii-Cho': {
      n: 'Shii-Cho', num: 'I', d: 'Tosca y fiable: no brilla, pero perdona los errores.',
      ventana: 1.06, asaltos: 5, contra: 1.00, guardia: 0.82, vsBlaster: 1.00, coste: 16
    },
    'Makashi': {
      n: 'Makashi', num: 'II', d: 'Duelo puro. Contra otro sable no hay nada mejor; contra un bláster, poco sirve.',
      ventana: 1.30, asaltos: 5, contra: 1.15, guardia: 0.95, vsBlaster: 0.72, coste: 14
    },
    'Soresu': {
      n: 'Soresu', num: 'III', d: 'Muro. Casi nadie te toca, pero ganar te va a llevar toda la noche.',
      ventana: 1.45, asaltos: 7, contra: 0.60, guardia: 0.45, vsBlaster: 1.25, coste: 12
    },
    'Ataru': {
      n: 'Ataru', num: 'IV', d: 'Acrobática y suicida: margen mínimo, castigo enorme, agota.',
      ventana: 0.86, asaltos: 6, contra: 1.40, guardia: 1.22, vsBlaster: 0.95, coste: 30
    },
    'Shien/Djem So': {
      n: 'Shien/Djem So', num: 'V', d: 'Devolver el golpe con más fuerza de la que vino: cada impacto que encajas alimenta el siguiente.',
      ventana: 0.98, asaltos: 5, contra: 1.30, guardia: 1.05, vsBlaster: 1.15, coste: 22, rencor: 0.3
    },
    'Niman': {
      n: 'Niman', num: 'VI', d: 'Equilibrada. Deja hueco para meter la Fuerza en mitad del intercambio.',
      ventana: 1.10, asaltos: 5, contra: 0.95, guardia: 0.85, vsBlaster: 1.05, coste: 16, empuje: true
    },
    'Juyo/Vaapad': {
      n: 'Juyo/Vaapad', num: 'VII', d: 'Al filo. El margen es una rendija y lo que devuelves da miedo. También a ti.',
      ventana: 0.80, asaltos: 6, contra: 1.60, guardia: 1.18, vsBlaster: 0.90, coste: 26, oscuro: true
    }
  };

  SW.formaDuelo = function (f) { return FORMAS[f] || FORMAS['Shii-Cho']; };
  SW.FORMAS_DUELO = FORMAS;

  /* ------------------------------------------------------------
     Parámetros de un duelo concreto. La interfaz sólo dibuja: los
     números salen de aquí, para que las pruebas sin navegador midan
     exactamente lo que se juega.
     ------------------------------------------------------------ */
  SW.paramsDuelo = function (ref) {
    const f = SW.formaDuelo(ref.forma);
    const dif = U.clamp(ref.dificultad || 50, 10, 100);
    const per = U.clamp(ref.pericia || 30, 0, 130);
    const desvio = ref.modo === 'desvio';

    let ventana = (1180 - dif * 7.2) * (0.84 + per / 260) * f.ventana;
    if (desvio) ventana *= f.vsBlaster;
    if (ref.rival === 'leyenda') ventana *= 0.74;
    if (ref.fase === 2) ventana *= 0.60;
    ventana = Math.round(U.clamp(ventana, 240, 1500));

    let asaltos = f.asaltos + (desvio ? 1 : 0) + (ref.fase === 2 ? 2 : 0);
    if (ref.asaltos) asaltos = ref.asaltos;

    return {
      forma: f,
      desvio: desvio,
      asaltos: U.clamp(asaltos, 3, 10),
      ventana: ventana,
      // pausa entre intercambios: con Vader no hay tiempo de respirar
      pausa: ref.fase === 2 ? 240 : 420,
      // probabilidad de que el golpe no sea parable y haya que esquivar
      pEstocada: desvio ? 0.10 : 0.20,
      // probabilidad de que el rival se abra y toque entrar
      pHueco: ref.fase === 2 ? 0.10 : 0.18,
      empuje: !!f.empuje && !desvio
    };
  };

  /* Puntuación → nota de 2 a -1, la misma escala que el resto de
     minijuegos del motor. */
  SW.notaDuelo = function (res) {
    const max = res.asaltos * 2;
    const r = max > 0 ? res.puntos / max : 0;
    if (r >= 0.82) return 2;
    if (r >= 0.50) return 1;
    if (r >= 0.18) return 0;
    return -1;
  };

  /* ------------------------------------------------------------
     Daño del duelo. Lo aplica el motor en resolverMinijuego.
     ------------------------------------------------------------ */
  SW.dañoDuelo = function (g, res) {
    const e = g.escena, s = g.s;
    const f = SW.formaDuelo(res.forma || s.forma);
    const dif = (e && e.dif) || 50;
    // cada parada perfecta abre al rival; las buenas sólo le molestan
    /* Escala: un intercambio medio (dos paradas al filo y dos limpias)
       hace ~36 sobre un rival de 130 de vida, así que un duelo dura tres
       o cuatro intercambios. Uno impecable con Juyo hace el triple: por
       eso Juyo da miedo y por eso te deja abierto. */
    let dmg = res.perfectas * 13 * f.contra + res.buenas * 5;
    /* Contra el Vader «serio» una parada limpia no le hace nada: sólo
       cuentan las que le abren la guardia. Por eso Soresu te mantiene
       vivo contra él y aun así no le mata: hace falta una forma que
       devuelva de verdad. */
    if (res.fase === 2) dmg = res.perfectas * 13 * f.contra;
    // Djem So: lo que te han hecho vuelve multiplicado
    if (f.rencor) dmg += res.fallos * res.perfectas * f.rencor * 6;
    // el aguante manda: sin aire no hay contra
    if (e && e.aguante < 35) dmg *= 0.65;
    let recib = (res.fallos * (12 + dif / 7) + res.pronto * 4) * f.guardia;
    /* Segunda fase de Vader: cada hueco que dejas se paga entero. La
       única forma de ganarle es no dejar ninguno, varios intercambios
       seguidos. Se puede. Casi nadie puede. */
    if (res.fase === 2) recib *= 1.9;
    return { dmg: Math.round(dmg), recib: Math.round(recib), forma: f };
  };

  /* ============================================================
     RELIQUIAS: lo que sobrevive a la muerte del personaje
     ============================================================ */
  const CLAVE_REL = 'holovida_reliquias';

  SW.RELIQUIAS = {
    casco_vader: {
      id: 'casco_vader', n: 'Casco de Darth Vader', ico: '☗',
      d: 'Chapa quemada y una rejilla que ya no respira por nadie. Pesa mucho más de lo que parece. ' +
         'Se desbloquea por plantarse delante de él, no por ganarle.',
      efecto: 'La galaxia te toma en serio a la primera: todo lo que ganas en fama vale casi el doble. ' +
              'A cambio, algo tira de ti hacia abajo un poco cada año.'
    }
  };

  SW.reliquias = function () {
    try { return JSON.parse(localStorage.getItem(CLAVE_REL) || '[]'); } catch (e) { return []; }
  };
  SW.tieneReliquia = function (id) { return SW.reliquias().indexOf(id) >= 0; };
  SW.desbloquearReliquia = function (id) {
    try {
      const l = SW.reliquias();
      if (l.indexOf(id) < 0) { l.push(id); localStorage.setItem(CLAVE_REL, JSON.stringify(l)); }
    } catch (e) { /* sin almacenamiento: la reliquia vale sólo esta partida */ }
  };
  SW.borrarReliquias = function () { try { localStorage.removeItem(CLAVE_REL); } catch (e) {} };

  /** Se llama al empezar la vida si el jugador ha equipado una reliquia. */
  SW.ponerReliquia = function (g, id) {
    const r = SW.RELIQUIAS[id];
    if (!r) return;
    const s = g.s;
    s.reliquia = id;
    if (id === 'casco_vader') {
      s.stats.notoriedad = U.clamp(s.stats.notoriedad + 14, 0, 100);
      s.stats.alineamiento = U.clamp(s.stats.alineamiento - 10, -100, 100);
      s.flags.lleva_casco_vader = true;
      g.log('Llevas contigo el <b>casco de Darth Vader</b>. Nadie sabe qué es y todo el mundo baja la voz.', 'mal');
      g.hito('Empieza la vida con el casco de Vader');
    }
  };

  /** Corrección global de efectos: es donde muerde el casco. */
  SW.fxMod = function (s, k, v) {
    if (s.reliquia !== 'casco_vader') return v;
    if (v > 0 && (k === 'reputacion' || k === 'notoriedad')) return v * 1.9;
    if (k === 'alineamiento' && v > 0) return v * 0.55;
    return v;
  };

  /* ------------------------------------------------------------
     Paso anual genérico: cosas que pasan sí o sí y no gastan escena.
     ------------------------------------------------------------ */
  SW.pasoAnual = function (g) {
    const s = g.s;
    if (s.reliquia === 'casco_vader' && s.edadBio >= 6) {
      s.stats.alineamiento = U.clamp(s.stats.alineamiento - 2, -100, 100);
      if (g.rng.chance(0.16)) g.log('El casco está en su caja y aun así lo notas. Cada año un poco más.', 'mal');
    }
    // esconderse funciona: la notoriedad de un jedi oculto se apaga sola,
    // y la de cualquier superviviente que no arme ruido baja despacio
    if (!s.flags.inquisidor && s.stats.notoriedad > 0) {
      if (s.flags.jedi_oculto) s.stats.notoriedad = Math.max(0, s.stats.notoriedad - 4);
      else if (s.flags.superviviente_purga) s.stats.notoriedad = Math.max(0, s.stats.notoriedad - 2);
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);

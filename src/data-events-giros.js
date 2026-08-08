/* ============================================================
   HOLOVIDA :: GIROS QUE DEJAN HUELLA
   Cosas que te pasan y que NO se olvidan al año siguiente: si te
   secuestran, apareces en otro planeta y tienes que volver (o no).
   Si te deben algo, alguien vuelve a cobrarlo. Si haces una
   promesa, se te recuerda. Cada uno de estos deja un flag que
   otros eventos leen después.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_GIROS = [];
  const S = { p: 'mundoAqui', l: 'lugar', k: 'banda', d: 'mandamas', x: 'mundoCerca',
              n: 'nombre', c: 'conocido', h: 'hito', b: 'bicho', m: 'mercancia' };
  const E = function (o) { o.slots = o.slots || S; SW.EVENTOS_GIROS.push(o); };

  /* ══════════════ SECUESTRO: te llevan de verdad ══════════════ */

  E({ id: 'gi_secuestro', min: 12, max: 80, w: 3,
    req: function (s) {
      if (s.flags.secuestrado || s.mundoSecuestro) return false;   // una vez por vida basta
      // secuestran a quien tiene algo que sacarle o algo que callar
      return s.stats.notoriedad > 25 || s.stats.creditos > 40000 ||
             !!s.flags.carrera_politica || s.buscado > 20 || !!s.flags.en_el_gremio;
    },
    t: 'Te meten en la bodega de una nave en {l} con un saco en la cabeza. Cuando te lo quitan, ya no estás en {p}.',
    c: [
      { t: 'Mirar dónde estás y quiénes son', fx: { intelecto: 8, cordura: -12 },
        flag: 'secuestrado', secuestrar: true,
        out: 'Estás muy lejos de casa y no sabes por qué te han traído.' },
      { t: 'Pelear ahí mismo', fx: { fisico: 6, salud: -18 }, herida: { n: 'paliza', sev: 12 },
        flag: 'secuestrado', secuestrar: true, out: 'No sale bien. Igual te traen.' },
      { t: 'Hacerte el dormido y escuchar', fx: { intelecto: 12, carisma: 4 },
        flag: 'secuestrado', flag2: 'sabe_quien_le_llevo', secuestrar: true,
        out: 'Oyes un nombre. Te lo aprendes.' }
    ] });

  E({ id: 'gi_secuestro_salir', min: 8, max: 95, w: 30, repetible: true,
    req: function (s) { return !!s.flags.secuestrado; },
    t: 'Sigues en {p}, donde te trajeron. Nadie te vigila todo el rato, pero tampoco tienes con qué salir.',
    c: [
      { t: 'Trabajar hasta pagarte el pasaje', fx: { creditos: 3000, fisico: 8, salud: -6 },
        quitarFlag: 'secuestrado', mover: 'casa', motivo: 'de vuelta, por tu cuenta',
        out: 'Dos años fregando bodegas. Vuelves.' },
      { t: 'Escaparte en un carguero', r: [
          { p: 0.5, t: 'Sales.', fx: { destreza: 12, cordura: 8 }, quitarFlag: 'secuestrado',
            mover: 'casa', motivo: 'de polizón' },
          { p: 0.3, t: 'Te pillan y te ponen a trabajar.', fx: { salud: -14, fisico: 6 } },
          { p: 0.2, t: 'Sales, pero acabas en otro sitio.', fx: { cordura: -8 },
            quitarFlag: 'secuestrado', mover: 'cerca', motivo: 'a donde fuera' }] },
      { t: 'Pedir ayuda a alguien de tu vida', req: function (s) { return s.relaciones.length > 0; },
        fx: { creditos: -1000, cordura: 10 }, quitarFlag: 'secuestrado',
        mover: 'casa', motivo: 'alguien pagó tu billete', conEsa: 30,
        notaRel: 'pagó tu vuelta cuando te secuestraron' },
      { t: 'Quedarte: aquí nadie sabe quién eras', quitarFlag: 'secuestrado',
        fx: { cordura: 6, intelecto: 6 }, flag: 'empezó_de_cero',
        out: 'Te cambias el nombre y montas otra vida. Funciona más de lo que crees.' }
    ] });

  E({ id: 'gi_secuestro_venganza', min: 14, max: 95, w: 8,
    req: function (s) { return !!s.flags.sabe_quien_le_llevo && !s.flags.secuestrado; },
    t: 'Años después te cruzas con el nombre que oíste en aquella bodega.',
    c: [
      { t: 'Ir a por él', combate: { dif: 62 }, fx: { notoriedad: 12 }, quitarFlag: 'sabe_quien_le_llevo' },
      { t: 'Entregarlo a {d}', fx: { alineamiento: 14, reputacion: 10 }, quitarFlag: 'sabe_quien_le_llevo' },
      { t: 'Preguntarle por qué', fx: { intelecto: 10, cordura: -6 }, quitarFlag: 'sabe_quien_le_llevo',
        out: 'La respuesta es más tonta de lo que esperabas. Alguien pagó y ya.' },
      { t: 'Dejarlo pasar', fx: { cordura: 10, alineamiento: 8 }, quitarFlag: 'sabe_quien_le_llevo' }
    ] });

  /* ══════════════ DEUDAS QUE VUELVEN ══════════════ */

  E({ id: 'gi_deuda_contraes', min: 16, max: 90, w: 9,
    req: function (s) { return !s.flags.debe_a_un_carte && s.stats.creditos < 3000; },
    t: 'Necesitas dinero ya y {k} presta a quien sea. Las condiciones no se discuten.',
    c: [
      { t: 'Coger el préstamo', fx: { creditos: 25000 }, flag: 'debe_a_un_carte',
        contador: { deuda: 25000 }, out: 'Te dan el dinero en la mano. Ahora corre el reloj.' },
      { t: 'Pedir menos', fx: { creditos: 8000 }, flag: 'debe_a_un_carte', contador: { deuda: 8000 } },
      { t: 'Apañarte sin él', fx: { cordura: -8, fisico: 4 } }
    ] });

  E({ id: 'gi_deuda_cobran', min: 17, max: 95, w: 26, repetible: true,
    req: function (s) { return !!s.flags.debe_a_un_carte; },
    t: 'Vienen a cobrar. {k} no manda avisos dos veces.',
    c: [
      { t: 'Pagar lo que debes', req: function (s) { return s.stats.creditos >= (s.contadores.deuda || 10000); },
        pagarDeuda: true, quitarFlag: 'debe_a_un_carte', fx: { cordura: 12 },
        out: 'Pagas y te miran como si les quitaras algo.' },
      { t: 'Pagar una parte y ganar tiempo', fx: { creditos: -6000, cordura: -4 },
        contador: { deuda: 4000 }, out: 'Aceptan. Y suben los intereses.' },
      { t: 'Trabajar para ellos hasta saldarlo', fx: { notoriedad: 14, alineamiento: -12 },
        quitarFlag: 'debe_a_un_carte', flag: 'trabaja_para_el_carte',
        out: 'Ya no debes dinero. Debes otra cosa.' },
      { t: 'Salir del planeta esta noche', fx: { cordura: -10 }, mover: 'cerca',
        motivo: 'con una deuda detrás', buscado: 20, out: 'Te siguen. Tardan, pero te siguen.' },
      { t: 'Plantarles cara', combate: { dif: 58 }, fx: { notoriedad: 10 } }
    ] });

  /* ══════════════ ENFERMEDAD LARGA ══════════════ */

  E({ id: 'gi_enfermedad_cronica', min: 25, max: 100, w: 8,
    req: function (s) { return !s.flags.enfermo_cronico && s.stats.salud < 70; },
    t: 'Llevas meses arrastrando algo que no se va. En una clínica de {p} te ponen nombre.',
    c: [
      { t: 'Tratarlo bien, cueste lo que cueste', coste: 22000, fx: { salud: 18, cordura: 8 },
        out: 'Se controla. Hay que seguir con ello de por vida.' },
      { t: 'Tratarlo a medias', fx: { creditos: -6000, salud: 6 }, flag: 'enfermo_cronico',
        out: 'Vas tirando. Malos años, de vez en cuando.' },
      { t: 'No tratarlo', flag: 'enfermo_cronico', fx: { cordura: -8 },
        herida: { n: 'enfermedad sin tratar', sev: 14, cronica: true } },
      { t: 'Buscar algo en el mercado negro', r: [
          { p: 0.45, t: 'Funciona mejor que lo legal.', fx: { salud: 20, creditos: -9000 } },
          { p: 0.55, t: 'Te venden agua con colorante.', fx: { creditos: -9000, salud: -8 }, flag: 'enfermo_cronico' }] }
    ] });

  E({ id: 'gi_recaida', min: 26, max: 105, w: 9, repetible: true,
    req: function (s) { return !!s.flags.enfermo_cronico; },
    t: 'Recaes. Ya sabes lo que toca y sigue sin gustarte.',
    c: [
      { t: 'Pasar por la clínica', clinica: true },
      { t: 'Aguantarlo en casa', fx: { salud: -14, cordura: -6, fisico: 3 } },
      { t: 'Cuidarte en serio este año', fx: { salud: 12, cordura: 8, creditos: -5000 },
        r: [{ p: 0.3, t: 'Esta vez remite del todo.', quitarFlag: 'enfermo_cronico', fx: { salud: 15 } },
            { p: 0.7, t: 'Se controla otro año más.', fx: { salud: 5 } }] }
    ] });

  /* ══════════════ REPUTACIÓN QUE TE PERSIGUE ══════════════ */

  E({ id: 'gi_te_reconocen', min: 20, max: 100, w: 9, repetible: true,
    req: function (s) { return s.stats.notoriedad > 45; },
    t: 'Te reconocen en {l}. No por lo bueno.',
    c: [
      { t: 'Negar que seas tú', fx: { carisma: 8 },
        r: [{ p: 0.55, t: 'Cuela.', fx: { cordura: 4 } },
            { p: 0.45, t: 'No cuela y lo cuentan.', fx: { notoriedad: 8, reputacion: -6 } }] },
      { t: 'Asumirlo delante de todos', fx: { notoriedad: 10, carisma: 10, cordura: 6 } },
      { t: 'Irte antes de que llamen a nadie', fx: { destreza: 6 }, mover: 'cerca', motivo: 'antes de que llamen' },
      { t: 'Comprar su silencio', coste: 6000, fx: { notoriedad: -6 } }
    ] });

  E({ id: 'gi_limpiar_nombre', min: 25, max: 100, w: 8,
    req: function (s) { return s.stats.notoriedad > 55 || s.buscado > 40; },
    t: 'Hay una forma de limpiar tu expediente en {p}. Cara y con letra pequeña.',
    c: [
      { t: 'Pagar una amnistía', coste: 45000, fx: { notoriedad: -30, reputacion: 6 },
        limpiarBusca: true, out: 'Papel firmado. Tu nombre vuelve a valer.' },
      { t: 'Delatar a alguien a cambio', fx: { notoriedad: -25, alineamiento: -18 },
        limpiarBusca: true, out: 'Sales limpio. Otro entra.' },
      { t: 'Cambiar de identidad', coste: 18000, fx: { notoriedad: -40, reputacion: -20 },
        limpiarBusca: true, flag: 'identidad_nueva', out: 'Eres otro. Con lo bueno y lo malo.' },
      { t: 'Vivir con ello', fx: { cordura: -4 } }
    ] });

  /* ══════════════ HERENCIAS Y GOLPES DE SUERTE ══════════════ */

  E({ id: 'gi_herencia', min: 22, max: 100, w: 7,
    req: function (s) { return s.relaciones.length > 1; },
    t: 'Muere alguien de tu familia y aparece tu nombre en lo que deja.',
    c: [
      { t: 'Quedarte el dinero', fx: { creditos: 40000, cordura: -4 } },
      { t: 'Quedarte la casa de {p}', fx: { cordura: 14 }, flag: 'casa_heredada',
        out: 'Vieja, fría y tuya.' },
      { t: 'Repartirlo con quien lo necesite más', fx: { alineamiento: 20, reputacion: 12, relTodas: 16 } },
      { t: 'Descubrir que hay deudas en vez de dinero', fx: { creditos: -12000, cordura: -10 },
        flag: 'debe_a_un_carte', contador: { deuda: 12000 } }
    ] });

  E({ id: 'gi_hallazgo', min: 16, max: 100, w: 7,
    t: 'Encuentras algo en {h} que no debería estar ahí.',
    c: [
      { t: 'Quedártelo', item: true, fx: { cordura: 6 } },
      { t: 'Venderlo sin preguntar', fx: { creditos: 18000, alineamiento: -6 } },
      { t: 'Averiguar de quién es', fx: { intelecto: 10 },
        r: [{ p: 0.5, t: 'Aparece el dueño y te lo agradece de verdad.', fx: { alineamiento: 14, creditos: 9000 },
              rel: { tipo: 'contacto', afecto: 55 } },
            { p: 0.5, t: 'Aparece alguien que dice ser el dueño.', fx: { cordura: -6 }, buscado: 10 }] },
      { t: 'Dejarlo donde estaba', fx: { alineamiento: 8, cordura: 4 } }
    ] });

  /* ══════════════ HIJOS QUE CRECEN ══════════════ */

  E({ id: 'gi_hijo_crece', min: 30, max: 100, w: 9, repetible: true,
    req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo'; }); },
    t: 'Tu hijo ya no es un crío y ha decidido a qué se va a dedicar. No te ha preguntado.',
    c: [
      { t: 'Apoyarle sin condiciones', fx: { relHijos: 24, cordura: 12 } },
      { t: 'Decirle que se equivoca', fx: { relHijos: -18, cordura: -6 },
        out: 'Igual tienes razón. Da igual.' },
      { t: 'Pagarle lo que necesite para empezar', fx: { creditos: -25000, relHijos: 20 } },
      { t: 'Ofrecerle meterse en lo tuyo', fx: { relHijos: 10, reputacion: 6 },
        flag: 'hijo_en_el_negocio' }
    ] });

  E({ id: 'gi_hijo_problema', min: 34, max: 100, w: 8,
    req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo'; }); },
    t: 'Tu hijo se ha metido en un lío de los que no se arreglan hablando.',
    c: [
      { t: 'Sacarle tú, cueste lo que cueste', fx: { creditos: -30000, relHijos: 26, cordura: -8 },
        buscado: 12 },
      { t: 'Dejar que lo resuelva solo', fx: { relHijos: -20, cordura: -12 },
        r: [{ p: 0.5, t: 'Lo resuelve. Y no te lo perdona.', fx: { relHijos: -10 } },
            { p: 0.5, t: 'No lo resuelve.', fx: { cordura: -20, relHijos: -25 } }] },
      { t: 'Ir con él a dar la cara', fx: { relHijos: 22, salud: -14, reputacion: 8 },
        herida: { n: 'golpe por defender a los tuyos', sev: 8 } }
    ] });

  /* ══════════════ MAESTRÍA: lo que se te da bien ══════════════ */

  E({ id: 'gi_maestria', min: 30, max: 100, w: 8,
    req: function (s) { return s.habilidades.length >= 3; },
    t: 'Se te reconoce como uno de los que mejor hace lo que haces en este sector.',
    c: [
      { t: 'Cobrar en consecuencia', fx: { creditos: 30000, reputacion: 10, aumento: 0.4 } },
      { t: 'Montar escuela y enseñarlo', fx: { reputacion: 22, alineamiento: 12, carisma: 10 },
        legado: 'formó a una generación', habilidad: 'maestro' },
      { t: 'Guardarte los trucos', fx: { creditos: 14000, reputacion: -6, intelecto: 6 } },
      { t: 'Buscar a alguien mejor que tú y aprender', fx: { intelecto: 12, cordura: 10 },
        rel: { tipo: 'mentor', afecto: 45 } }
    ] });

  /* --- al pozo global --- */
  SW.EVENTOS = SW.EVENTOS || [];
  for (let i = 0; i < SW.EVENTOS_GIROS.length; i++) SW.EVENTOS.push(SW.EVENTOS_GIROS[i]);

})(typeof window !== 'undefined' ? window : globalThis);

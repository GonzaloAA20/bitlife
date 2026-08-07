/* ============================================================
   HOLOVIDA :: LA GENTE VUELVE
   El problema: decidías si te llevabas bien con tu hermano y no
   volvías a saber de él en toda la partida. Estos eventos usan a
   gente que YA está en tu vida ({hermano}, {amigo}, {pareja},
   {conocido}, {rivalN}) y mueven el afecto de esa persona
   concreta, no de todas a la vez. Muchos exigen que la relación
   esté en cierto punto: si te llevas fatal con alguien, sale otra
   cosa distinta que si os adoráis.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_GENTE = [];

  const E = function (o) { SW.EVENTOS_GENTE.push(o); };
  /** ¿tienes a alguien de estos tipos, y con qué afecto? */
  const con = function (tipos, min, max) {
    return function (s) {
      return s.relaciones.some(function (r) {
        if (tipos.indexOf(r.tipo) < 0) return false;
        if (min != null && r.afecto < min) return false;
        if (max != null && r.afecto > max) return false;
        return true;
      });
    };
  };
  const HERM = ['hermano', 'hermana', 'hermano de lote'];
  const AMIG = ['amigo', 'contacto', 'socio'];
  const PAR = ['pareja', 'cónyuge'];

  /* ══════════════ HERMANOS ══════════════ */

  E({ id: 'gt_herm_favor', min: 10, max: 90, w: 11, slots: { h: 'hermano', p: 'mundoAqui', l: 'lugar' },
    req: con(HERM, 20, null),
    t: '{h} te pide algo que no le puede pedir a nadie más. Tú sabes lo que le cuesta pedir.',
    c: [{ t: 'Hacerlo sin preguntar', fx: { alineamiento: 10, cordura: 6, creditos: -3000 }, conEsa: 22,
          notaRel: 'le sacaste de un lío sin hacer preguntas' },
        { t: 'Hacerlo, pero enterarte de todo primero', fx: { intelecto: 8, carisma: 6 }, conEsa: 12,
          notaRel: 'le ayudaste, pero exigiendo la verdad', out: 'Es peor de lo que contaba. Le ayudas igual.' },
        { t: 'Decirle que no', fx: { cordura: -6 }, conEsa: -25, notaRel: 'le dijiste que no cuando más lo necesitaba',
          out: 'No insiste. Eso es lo que más duele.' },
        { t: 'Decírselo a vuestra familia', fx: { alineamiento: 4 }, conEsa: -18, relTodas: 6,
          notaRel: 'lo contaste en casa' }] });

  E({ id: 'gt_herm_frio', min: 14, max: 95, w: 10, slots: { h: 'hermano' },
    req: con(HERM, null, -10),
    t: 'Llevas años sin hablar con {h}. Alguien de la familia te dice que ha preguntado por ti.',
    c: [{ t: 'Llamarle', r: [
            { p: 0.55, t: 'Habláis cuatro horas. Como si no hubiera pasado nada.', fx: { cordura: 16 }, conEsa: 45, notaRel: 'volvisteis a hablar después de años' },
            { p: 0.45, t: 'Se nota que ya no os conocéis.', fx: { cordura: -6 }, conEsa: 10, notaRel: 'lo intentasteis y no salió' }] },
        { t: 'Esperar a que llame él', fx: { cordura: -8 }, out: 'No llama. Los dos estáis esperando lo mismo.' },
        { t: 'Escribirle todo lo que nunca le dijiste', fx: { cordura: 12, carisma: 6 }, conEsa: 25,
          notaRel: 'le escribiste la carta que llevabas años debiendo' },
        { t: 'Dejarlo como está', fx: { cordura: -4 } }] });

  E({ id: 'gt_herm_exito', min: 22, max: 95, w: 9, slots: { h: 'hermano', p: 'mundoAqui' },
    req: con(HERM, null, null),
    t: 'A {h} le va bien. Mejor que a ti, y no lo disimula.',
    c: [{ t: 'Alegrarte de verdad', fx: { cordura: 12, alineamiento: 8 }, conEsa: 18, notaRel: 'te alegraste de su suerte' },
        { t: 'Pedirle ayuda', fx: { creditos: 12000, cordura: -6 }, conEsa: -8, notaRel: 'le pediste dinero' },
        { t: 'Distanciarte', fx: { cordura: -10, intelecto: 4 }, conEsa: -22, notaRel: 'te apartaste por envidia' },
        { t: 'Usarlo de empujón', fx: { intelecto: 8, carisma: 8, fisico: 4 }, conEsa: 6, flag: 'motivado_por_su_hermano' }] });

  /* ══════════════ AMIGOS Y CONTACTOS ══════════════ */

  E({ id: 'gt_amigo_deuda', min: 16, max: 95, w: 10, slots: { a: 'amigo', p: 'mundoAqui', k: 'banda' },
    req: con(AMIG, 25, null),
    t: '{a} se ha metido en algo con {k} y no tiene con qué salir.',
    c: [{ t: 'Pagar lo que debe', fx: { creditos: -14000, alineamiento: 12 }, conEsa: 40,
          notaRel: 'le pagaste la deuda que le iba a costar la vida' },
        { t: 'Ir a hablar con {k}', req: function (s) { return s.stats.carisma > 45; },
          fx: { carisma: 14, notoriedad: 8 }, conEsa: 32, notaRel: 'diste la cara por él' },
        { t: 'Ayudarle a desaparecer', fx: { intelecto: 8, creditos: -4000 }, conEsa: 26, buscado: 12,
          notaRel: 'le sacaste del planeta' },
        { t: 'No es tu problema', fx: { cordura: -10 }, conEsa: -35, notaRel: 'miraste para otro lado' }] });

  E({ id: 'gt_amigo_traiciona', min: 18, max: 95, w: 9, slots: { a: 'amigo', p: 'mundoAqui' },
    req: con(AMIG, 40, null),
    t: 'Descubres que {a}, en quien confiabas del todo, te ha estado ocultando algo grande.',
    c: [{ t: 'Preguntárselo a la cara', fx: { carisma: 8, cordura: -6 }, r: [
            { p: 0.5, t: 'Tenía un motivo. Uno bueno.', fx: { cordura: 10 }, conEsa: 15, notaRel: 'os lo aclarasteis todo' },
            { p: 0.5, t: 'No tenía ninguno.', fx: { cordura: -14 }, conEsa: -55, notaRel: 'te mintió durante años' }] },
        { t: 'Callártelo y vigilar', fx: { intelecto: 10, cordura: -8 }, conEsa: -12, notaRel: 'dejaste de fiarte sin decírselo' },
        { t: 'Cortar por lo sano', fx: { cordura: -8 }, conEsa: -70, notaRel: 'lo cortaste de golpe' },
        { t: 'Perdonarlo antes de que lo explique', fx: { alineamiento: 12, cordura: 8 }, conEsa: 20,
          notaRel: 'le perdonaste sin pedir explicaciones' }] });

  E({ id: 'gt_amigo_lejos', min: 18, max: 95, w: 9, slots: { a: 'amigo', x: 'mundoCerca' },
    req: con(AMIG, 20, null),
    t: '{a} se va a {x} y no sabe si volverá.',
    c: [{ t: 'Irte con él', fx: { cordura: 10 }, conEsa: 30, mover: 'cerca', motivo: 'siguiendo a alguien',
          notaRel: 'os fuisteis juntos' },
        { t: 'Despedirte bien', fx: { cordura: 8 }, conEsa: 12, notaRel: 'os despedisteis como es debido' },
        { t: 'No ir a la despedida', fx: { cordura: -10 }, conEsa: -20, notaRel: 'no fuiste a despedirle' },
        { t: 'Prometerle que le visitarás', fx: { cordura: 6 }, conEsa: 8, flag: 'promesa_visita' }] });

  /* ══════════════ PAREJA ══════════════ */

  E({ id: 'gt_pareja_crisis', min: 20, max: 95, w: 10, slots: { q: 'pareja', p: 'mundoAqui' },
    req: con(PAR, null, 45),
    t: 'Con {q} lleváis meses de discusiones por lo mismo.',
    c: [{ t: 'Ceder tú', fx: { cordura: -8, carisma: 6 }, conEsa: 22, notaRel: 'cediste para salvarlo' },
        { t: 'Hablarlo de verdad', req: function (s) { return s.stats.carisma > 40; },
          fx: { carisma: 12, cordura: 12 }, conEsa: 35, notaRel: 'os sentasteis a hablarlo en serio' },
        { t: 'Dejarlo estar y que se pudra', fx: { cordura: -14 }, conEsa: -30, notaRel: 'dejasteis que se pudriera' },
        { t: 'Romper', fx: { cordura: -16, intelecto: 6 }, romper: true, notaRel: 'lo dejasteis' }] });

  E({ id: 'gt_pareja_bien', min: 22, max: 95, w: 9, slots: { q: 'pareja', p: 'mundoAqui', h: 'hito' },
    req: con(PAR, 50, null),
    t: 'Con {q} las cosas van bien de una forma que no esperabas a estas alturas.',
    c: [{ t: 'Llevarle a {h}', fx: { cordura: 14, creditos: -2000 }, conEsa: 20, notaRel: 'os llevasteis un día bueno' },
        { t: 'Proponerle formar familia', fx: { cordura: 10 }, conEsa: 18, hijo: true },
        { t: 'Comprar algo juntos en {p}', fx: { creditos: -18000, cordura: 12 }, conEsa: 16, flag: 'casa_compartida' },
        { t: 'No tocar nada, que está bien así', fx: { cordura: 10 }, conEsa: 8 }] });

  /* ══════════════ RIVALES ══════════════ */

  E({ id: 'gt_rival_vuelve', min: 18, max: 95, w: 10, slots: { v: 'rivalN', p: 'mundoAqui', l: 'lugar' },
    req: con(['rival'], null, -20),
    t: 'Te cruzas con {v} en {l}. Han pasado años y sigue mirándote igual.',
    c: [{ t: 'Ir a hablar', r: [
            { p: 0.45, t: 'Estáis los dos mayores para esto.', fx: { cordura: 14 }, conEsa: 60, notaRel: 'hicisteis las paces' },
            { p: 0.55, t: 'Sigue igual que el primer día.', fx: { cordura: -6 }, conEsa: -15, notaRel: 'no hubo manera' }] },
        { t: 'Ignorarle', fx: { cordura: 4 } },
        { t: 'Provocarle', fx: { notoriedad: 8, fisico: 4 }, conEsa: -25, combate: { dif: 52 } },
        { t: 'Ofrecerle un trato', req: function (s) { return s.stats.carisma > 50; },
          fx: { carisma: 12, creditos: 9000 }, conEsa: 35, notaRel: 'acabasteis haciendo negocios' }] });

  E({ id: 'gt_rival_pide', min: 22, max: 95, w: 8, slots: { v: 'rivalN' },
    req: con(['rival'], null, -10),
    t: '{v}, que nunca te ha pedido nada, te pide ayuda. Está desesperado.',
    c: [{ t: 'Ayudarle', fx: { alineamiento: 18, cordura: 12, creditos: -6000 }, conEsa: 70,
          notaRel: 'le ayudaste cuando podías haberle hundido', convertirRival: 'contacto' },
        { t: 'Disfrutarlo y negarte', fx: { cordura: -8, alineamiento: -14 }, conEsa: -30,
          notaRel: 'te reíste en su cara' },
        { t: 'Ayudarle a cambio de algo', fx: { creditos: 14000, carisma: 8, alineamiento: -4 }, conEsa: 20,
          notaRel: 'le ayudaste, pero cobrando' }] });

  /* ══════════════ CUALQUIERA DE TU VIDA ══════════════ */

  E({ id: 'gt_conocido_reaparece', min: 16, max: 100, w: 10, slots: { c: 'conocido', p: 'mundoAqui', l: 'lugar' },
    req: function (s) { return s.relaciones.length >= 2; },
    t: 'Te encuentras a {c} en {l}, muchos años después.',
    c: [{ t: 'Sentaros a ponerse al día', fx: { cordura: 12, carisma: 6 }, conEsa: 25, notaRel: 'os pusisteis al día' },
        { t: 'Saludar y seguir', fx: { cordura: 3 }, conEsa: 4 },
        { t: 'Hacer como que no le ves', fx: { cordura: -6 }, conEsa: -12, notaRel: 'fingiste no verle' },
        { t: 'Proponerle trabajar juntos', fx: { creditos: 8000, carisma: 10 }, conEsa: 20,
          notaRel: 'montasteis algo juntos' }] });

  E({ id: 'gt_conocido_muere', min: 25, max: 110, w: 8, slots: { c: 'conocido', p: 'mundoAqui' },
    req: function (s) { return s.relaciones.length >= 3; },
    t: 'Se muere {c}. Te enteras tarde y por otra persona.',
    c: [{ t: 'Ir al entierro aunque no llegues a tiempo', fx: { cordura: 8, alineamiento: 6 } },
        { t: 'Ocuparte de lo que deja', fx: { alineamiento: 16, reputacion: 10, creditos: -4000 } },
        { t: 'Quedarte con algo suyo', fx: { cordura: 10 }, item: true },
        { t: 'No hacer nada', fx: { cordura: -10 } }] });

  E({ id: 'gt_conocido_pide_favor', min: 18, max: 100, w: 9, slots: { c: 'conocido', p: 'mundoAqui', k: 'banda' },
    req: function (s) { return s.relaciones.length >= 2; },
    t: '{c} te recuerda un favor de hace años y viene a cobrárselo.',
    c: [{ t: 'Pagarlo con creces', fx: { alineamiento: 12, creditos: -8000 }, conEsa: 35, notaRel: 'saldaste con creces' },
        { t: 'Pagarlo justo', fx: { creditos: -3000 }, conEsa: 12 },
        { t: 'Negar que le debas nada', fx: { alineamiento: -10 }, conEsa: -45, notaRel: 'negaste una deuda vieja' },
        { t: 'Pedirle tiempo', fx: { carisma: 6, cordura: -4 }, conEsa: -6 }] });

  /* ══════════════ LA MESA ══════════════ */
  E({ id: 'gt_mesa', min: 16, max: 100, w: 9, repetible: true, slots: { l: 'lugar', p: 'mundoAqui', c: 'conocido' },
    req: function (s) { return s.stats.creditos > 1200; },
    t: 'En {l} hay una partida abierta. Se juega fuerte y hay sitio.',
    c: [{ t: 'Jugar', mesa: true, sub: 'Dados, sabacc o la rueda. Lo que caiga.' },
        { t: 'Jugar solo a los dados', mesa: 'dados', sub: 'Rápido y sin vueltas.' },
        { t: 'Jugar al sabacc', mesa: 'sabacc', sub: 'Se acerca más a 23 sin pasarse.' },
        { t: 'Mirar y aprender cómo hacen trampa', fx: { intelecto: 10, carisma: 6 },
          habilidad: 'tahúr', out: 'Tardas seis meses en verlo. Cuando lo ves, ya no puedes no verlo.' },
        { t: 'No entrar', volver: true }] });

  E({ id: 'gt_mesa_enganche', min: 18, max: 100, w: 10, repetible: true, slots: { l: 'lugar' },
    req: function (s) { return !!s.flags.enganchado_al_juego && s.stats.creditos > 600; },
    t: 'Vuelves a {l} sin haberlo decidido. Ya sabes cómo acaba esto y vas igual.',
    c: [{ t: 'Jugar otra vez', mesa: true, fx: { cordura: -6 } },
        { t: 'Darte la vuelta en la puerta', fx: { cordura: 12, intelecto: 4 },
          quitarFlag: 'enganchado_al_juego', out: 'Cuesta más de lo que parece. Lo haces.' },
        { t: 'Pedir ayuda a alguien', fx: { cordura: 14, alineamiento: 6 }, conEsa: 15,
          slots2: true, quitarFlag: 'enganchado_al_juego' }] });

  /* --- al pozo global --- */
  SW.EVENTOS = SW.EVENTOS || [];
  for (let i = 0; i < SW.EVENTOS_GENTE.length; i++) SW.EVENTOS.push(SW.EVENTOS_GENTE[i]);

})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   HOLOVIDA :: LO QUE SE ABRE CUANDO TIENES NAVE (Y MEJORAS)
   Una mejora que solo sube un número no sirve de nada. Cada
   evento de aquí pregunta por una mejora concreta: si no la
   llevas montada, la opción buena ni siquiera aparece.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_NAVE = [];
  const S = { p: 'mundoAqui', l: 'lugar', n: 'nombre', k: 'banda', m: 'mercancia',
              h: 'hito', d: 'mandamas', x: 'mundoCerca' };
  const E = function (o) { o.slots = o.slots || S; o.reqNave = true; SW.EVENTOS_NAVE.push(o); };
  const tiene = function (t) { return function (s) { return SW.naveAbre(s, t); }; };

  /* ---------- el taller como acción libre ---------- */
  E({ id: 'nv_taller_aviso', min: 16, max: 200, w: 7,
    req: function (s) { return !!s.nave && (s.mejorasNave || []).length === 0; },
    t: 'Tu nave vuela, y ya está. Un mecánico de {l} te enseña lo que se le podría montar.',
    c: [{ t: 'Abrir el taller y mirar', taller: true },
        { t: 'Preguntar qué merece la pena', fx: { intelecto: 8 }, out: 'Te lo explica: motores para huir, sigilo para pasar, bodega para ganar. Elige tú.', taller: true },
        { t: 'Así vuela bien', fx: { creditos: 1000 } }] });

  /* ---------- contrabando: pide sigilo o bodega ---------- */
  E({ id: 'nv_contrabando', min: 17, max: 200, w: 11,
    t: 'Te ofrecen sacar {m} de {p} con un bloqueo aduanero puesto. Pagan por encima de lo normal.',
    c: [{ t: 'Meterlo en el compartimento oculto', req: tiene('contrabando'),
          fx: { creditos: 34000, notoriedad: 8, alineamiento: -6 },
          out: 'Ni te paran. La bodega falsa hace su trabajo.' },
        { t: 'Colarte con el transpondedor cambiado', req: tiene('colarse'),
          fx: { creditos: 30000, notoriedad: 6, intelecto: 6 },
          out: 'Entras siendo un carguero de fruta de otro sector.' },
        { t: 'Intentarlo a pelo', r: [
            { p: 0.35, t: 'Cuela de milagro.', fx: { creditos: 26000, notoriedad: 10 } },
            { p: 0.65, t: 'Te abren la bodega en el primer control.', fx: { creditos: -6000, carcel: 1 }, buscado: 30, naveEstado: -20 }] },
        { t: 'Decir que no', volver: true }] });

  /* ---------- huir de verdad ---------- */
  E({ id: 'nv_persecucion', min: 17, max: 200, w: 11,
    t: 'Te siguen desde que saliste de {p}. Dos cazas y ganan terreno.',
    c: [{ t: 'Pisar a fondo con los impulsores de carreras', req: tiene('huida'),
          fx: { destreza: 10, cordura: 6 }, out: 'Los pierdes en cuatro minutos. Para eso los montaste.' },
        { t: 'Aguantar el fuego con el blindaje', req: tiene('aguantar_fuego'),
          fx: { naveEstado: -18, fisico: 5 }, out: 'Te dan de lleno dos veces y no pasa nada. Las placas dobles.' },
        { t: 'Meterte en un campo de asteroides', r: [
            { p: 0.5, t: 'Los pierdes. Y casi te pierdes tú.', fx: { destreza: 10, naveEstado: -25, cordura: -6 } },
            { p: 0.5, t: 'Chocas.', fx: { salud: -22, naveEstado: -45 }, herida: { n: 'golpe de cabina', sev: 12 } }] },
        { t: 'Plantarles cara', dogfight: { dif: 62 } }] });

  /* ---------- abordaje: pide cañones iónicos ---------- */
  E({ id: 'nv_abordaje', min: 18, max: 200, w: 10,
    t: 'Un carguero sin escolta cruza tu ruta. Va cargado y va solo.',
    c: [{ t: 'Apagarle los motores con los iónicos y abordar', req: tiene('abordaje'),
          fx: { creditos: 42000, notoriedad: 16, alineamiento: -14 }, buscado: 22,
          out: 'Nadie muere. Se llevan un susto y tú, la bodega entera.' },
        { t: 'Destrozarlo', fx: { creditos: 26000, notoriedad: 22, alineamiento: -26 }, buscado: 35,
          out: 'Había gente dentro. Lo sabes.' },
        { t: 'Escoltarle hasta puerto y cobrar por ello', req: tiene('escolta'),
          fx: { creditos: 16000, alineamiento: 12, reputacion: 10 }, rel: { tipo: 'contacto', afecto: 45 } },
        { t: 'Dejarle pasar', fx: { alineamiento: 8, cordura: 4 } }] });

  /* ---------- rescate: pide escáner ---------- */
  E({ id: 'nv_rescate', min: 17, max: 200, w: 10,
    t: 'Recoges una baliza de socorro entre {p} y {x}. Está muy lejos de las rutas.',
    c: [{ t: 'Localizarla con el escáner de largo alcance', req: tiene('rescate'),
          fx: { alineamiento: 18, reputacion: 14 }, rel: { tipo: 'contacto', afecto: 60 },
          out: 'La encuentras en dos horas. Sin el escáner habrías tardado semanas.' },
        { t: 'Buscar a ojo', r: [
            { p: 0.4, t: 'Los encuentras a tiempo.', fx: { alineamiento: 16, reputacion: 10 } },
            { p: 0.6, t: 'Llegas tarde.', fx: { cordura: -16, alineamiento: 6 } }] },
        { t: 'Ir a por lo que se pueda rescatar de la nave', fx: { creditos: 18000, alineamiento: -16 } },
        { t: 'Seguir tu ruta', fx: { cordura: -8, alineamiento: -10 } }] });

  /* ---------- sacar gente ---------- */
  E({ id: 'nv_sacar_gente', min: 18, max: 200, w: 10,
    t: '{d} ha cerrado {p}. Hay familias que necesitan salir y no pueden.',
    c: [{ t: 'Sacarlos en el compartimento oculto', req: tiene('esconder_gente'),
          fx: { alineamiento: 26, reputacion: 18, creditos: 6000 }, buscado: 25,
          out: 'Cuatro viajes, once personas. Nadie sabrá nunca que fuiste tú.' },
        { t: 'Llevarlos como pasajeros con papeles falsos', req: tiene('suplantar'),
          fx: { alineamiento: 20, creditos: 12000, intelecto: 8 }, buscado: 18 },
        { t: 'Cobrarles todo lo que tengan', fx: { creditos: 30000, alineamiento: -22, reputacion: -16 } },
        { t: 'No meterte', fx: { cordura: -10 } }] });

  /* ---------- atajo peligroso ---------- */
  E({ id: 'nv_atajo', min: 18, max: 200, w: 9,
    t: 'Hay una ruta que corta tres semanas de viaje. También hay una razón por la que nadie la usa.',
    c: [{ t: 'Calcularla con el ordenador militar', req: tiene('atajo'),
          fx: { intelecto: 12, creditos: 14000, reputacion: 10 }, habilidad: 'navegación',
          out: 'Sale. Ahora eres de los pocos que la conocen.' },
        { t: 'Intentarlo a mano', r: [
            { p: 0.35, t: 'Sale, y no sabes muy bien cómo.', fx: { intelecto: 10, creditos: 12000, suerte: 6 } },
            { p: 0.4, t: 'Sales por donde no era, dos meses tarde.', fx: { creditos: -4000, cordura: -8 } },
            { p: 0.25, t: 'Rozas algo enorme al salir del salto.', fx: { naveEstado: -40, salud: -18 }, herida: { n: 'quemadura de consola', sev: 10 } }] },
        { t: 'Ir por la ruta larga como todo el mundo', fx: { creditos: -2000, cordura: 4 } }] });

  /* ---------- curar a bordo ---------- */
  E({ id: 'nv_bahia', min: 18, max: 200, w: 9,
    req: function (s) { return s.heridas && s.heridas.length > 0; },
    t: 'Arrastras heridas de hace tiempo y el próximo salto es largo.',
    c: [{ t: 'Meterte en la bahía médica todo el viaje', req: tiene('curar_a_bordo'),
          fx: { salud: 22, cordura: 8 }, curarHeridas: true,
          out: 'Sales del salto entero. La bahía se ha pagado sola.' },
        { t: 'Aguantar como siempre', fx: { salud: -6, fisico: 4, cordura: -5 } },
        { t: 'Parar en una clínica de {p}', clinica: true }] });

  /* ---------- pasajeros ---------- */
  E({ id: 'nv_pasajeros', min: 18, max: 200, w: 9,
    t: 'Hay gente en el puerto de {p} que paga por un asiento a donde vayas.',
    c: [{ t: 'Llevarlos en condiciones', req: tiene('pasajeros'),
          fx: { creditos: 16000, carisma: 10, reputacion: 8 },
          out: 'Van cómodos, pagan bien y te recomiendan.' },
        { t: 'Meterlos en la bodega y que se apañen', fx: { creditos: 9000, reputacion: -10, alineamiento: -8 } },
        { t: 'Tu nave no es un autobús', volver: true }] });

  /* ---------- fabricar a bordo ---------- */
  E({ id: 'nv_fabricar', min: 18, max: 200, w: 8,
    t: 'Se te ocurre una modificación que no vende nadie porque no existe.',
    c: [{ t: 'Hacerla en el taller de a bordo', req: tiene('fabricar'),
          fx: { intelecto: 14, destreza: 10, creditos: -3000 }, item: true, habilidad: 'ingeniero',
          out: 'Funciona. Es tuya y no la tiene nadie más.' },
        { t: 'Encargársela a alguien', fx: { creditos: -18000, intelecto: 4 }, item: true },
        { t: 'Dejarlo en la libreta', fx: { intelecto: 6 } }] });

  /* ---------- contrato de escolta ---------- */
  E({ id: 'nv_escolta', min: 18, max: 200, w: 9,
    t: 'Un convoy sale de {p} hacia {x} y busca escolta armada. La ruta tiene fama.',
    c: [{ t: 'Aceptar: para eso montaste la torreta', req: tiene('escolta'),
          fx: { creditos: 22000, reputacion: 12 }, dogfight: { dif: 55 } },
        { t: 'Aceptar aunque vas justo de armas', dogfight: { dif: 70 }, fx: { creditos: 22000 } },
        { t: 'Ofrecerte de guía en vez de escolta', fx: { creditos: 8000, intelecto: 6 } },
        { t: 'Pasar', volver: true }] });

  /* ---------- objetivo grande ---------- */
  E({ id: 'nv_grande', min: 20, max: 200, w: 8,
    t: 'Hay una recompensa enorme por un carguero blindado de {k}. Es mucho más grande que tú.',
    c: [{ t: 'Reventarle los motores con los torpedos', req: tiene('objetivo_grande'),
          dogfight: { dif: 72, botin: 60000 }, fx: { notoriedad: 18 } },
        { t: 'Colarte dentro y hacerlo por dentro', req: tiene('colarse'),
          fx: { creditos: 45000, intelecto: 12, notoriedad: 14 }, buscado: 30,
          out: 'Atracas como uno más y sales antes de que nadie mire el manifiesto.' },
        { t: 'Ir de frente sin nada especial', dogfight: { dif: 88, botin: 60000 }, fx: { notoriedad: 12 } },
        { t: 'Vender el chivatazo', fx: { creditos: 9000, notoriedad: 6 } }] });

  /* ---------- vivir a bordo ---------- */
  E({ id: 'nv_vivir', min: 18, max: 200, w: 8,
    t: 'Pagas alquiler en {p} y casi nunca duermes ahí.',
    c: [{ t: 'Dejar la casa y vivir en la nave', req: tiene('vivir_a_bordo'),
          fx: { creditos: 9000, cordura: 8 }, flag: 'vive_en_su_nave',
          out: 'Con los camarotes decentes se vive bien. Ahorras un dineral.' },
        { t: 'Dejar la casa y dormir donde caiga', fx: { creditos: 7000, cordura: -12, salud: -6 } },
        { t: 'Mantener la casa', fx: { creditos: -4000, cordura: 6 } }] });

  /* ---------- avería ---------- */
  E({ id: 'nv_averia', min: 17, max: 200, w: 10,
    t: 'Salta una alarma a mitad de salto. Algo va mal y va mal ya.',
    c: [{ t: 'Que lo arregle el astromecánico', req: tiene('reparar_en_vuelo'),
          fx: { intelecto: 5 }, naveEstado: -5, out: 'Pita, gira la cúpula y lo arregla antes de que salgas del salto.' },
        { t: 'Salir al casco en pleno vuelo', r: [
            { p: 0.55, t: 'Lo apañas.', fx: { destreza: 12, fisico: 6 }, naveEstado: -10 },
            { p: 0.45, t: 'Se te va la herramienta y algo más.', fx: { salud: -20, naveEstado: -30 }, herida: { n: 'descompresión', sev: 14 } }] },
        { t: 'Salir del salto donde sea', fx: { naveEstado: -20, cordura: -8 }, mover: 'cerca', motivo: 'una avería te deja tirado' }] });

  /* ---------- si no tienes nave ---------- */
  SW.EVENTOS_NAVE_SIN = [{
    id: 'nv_conseguir', min: 17, max: 200, w: 8, slots: S,
    req: function (s) { return !s.nave && s.stats.creditos > 20000; },
    t: 'En el puerto de {p} hay una nave a medio pudrir que nadie quiere. El dueño escucha ofertas.',
    c: [{ t: 'Comprarla y arreglarla tú', coste: 20000, fx: { intelecto: 8, destreza: 8 }, naveCompra: true,
          out: 'Tres años de trabajo. Vuela. Es tuya.' },
        { t: 'Ir al hangar a ver algo decente', hangar: true },
        { t: 'Robarla', r: [
            { p: 0.45, t: 'Sale.', fx: { notoriedad: 18, alineamiento: -14 }, naveGana: true, buscado: 30 },
            { p: 0.55, t: 'Tenía alarma y dueño con amigos.', fx: { salud: -18, reputacion: -10 }, buscado: 25 }] },
        { t: 'No la necesitas', volver: true }]
  }];

  /* --- al pozo global --- */
  SW.EVENTOS = SW.EVENTOS || [];
  SW.EVENTOS_NAVE.forEach(function (e) {
    // todos exigen nave: se envuelve el req para no repetirlo en cada uno
    const antes = e.req;
    e.req = function (s) { return !!s.nave && (!antes || antes(s)); };
    SW.EVENTOS.push(e);
  });
  SW.EVENTOS_NAVE_SIN.forEach(function (e) { SW.EVENTOS.push(e); });

})(typeof window !== 'undefined' ? window : globalThis);

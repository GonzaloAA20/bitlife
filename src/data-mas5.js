/* ============================================================
   HOLOVIDA :: QUINTA TANDA
   Más decisiones para todos los menús y más eventos anuales.
   Aquí se cubren los huecos temáticos que quedaban: oficios,
   burocracia, vida de barrio, el bajo mundo, y todo lo que
   pasa por el simple hecho de vivir muchos años en un sitio.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.ACTOS = SW.ACTOS || {};
  SW.EVENTOS = SW.EVENTOS || [];
  const S = { p: 'mundoAqui', l: 'lugar', k: 'banda', d: 'mandamas', h: 'hito', o: 'oficio',
              m: 'mercancia', g: 'paisanos', b: 'bicho', n: 'nombre', x: 'mundoCerca',
              c: 'conocido', f: 'faccion', t: 'tiempo', a: 'amigo', r: 'rivalN',
              j: 'pareja', v: 'nave', q: 'comida', z: 'peligro', w: 'hermano' };
  const A = function (menu, arr) {
    SW.ACTOS[menu] = SW.ACTOS[menu] || [];
    arr.forEach(function (e) { e.slots = e.slots || S; SW.ACTOS[menu].push(e); });
  };
  const V = function (arr) { arr.forEach(function (e) { e.slots = e.slots || S; SW.EVENTOS.push(e); }); };
  const conNave = function (s) { return !!s.nave; };
  const sensible = function (s) { return !!s.sensible; };

  /* ══════════════════════════ TRABAJO ══════════════════════════ */
  A('trabajo', [
    { id: 'u5_oferta_rival', min: 20, max: 85, w: 9, t: 'La competencia de {l} te ofrece el doble por lo mismo.',
      c: [{ t: 'Irte con ellos', fx: { creditos: 18000, reputacion: -8 } },
          { t: 'Usarlo para negociar aquí', fx: { creditos: 12000, carisma: 12 } },
          { t: 'Contárselo a tu jefe', fx: { reputacion: 10, alineamiento: 8 } },
          { t: 'Irte y llevarte a dos compañeros', fx: { creditos: 22000, carisma: 12, reputacion: -14 } }] },
    { id: 'u5_patente', min: 22, max: 85, w: 8, t: 'Has resuelto un problema que nadie de {p} había resuelto.',
      c: [{ t: 'Patentarlo a tu nombre', coste: 9000, fx: { creditos: 40000, intelecto: 12 } },
          { t: 'Dárselo a la empresa', fx: { reputacion: 14, creditos: 8000 } },
          { t: 'Publicarlo abierto', fx: { alineamiento: 18, reputacion: 16, intelecto: 10 } },
          { t: 'Venderlo fuera', fx: { creditos: 55000, reputacion: -12, alineamiento: -10 } }] },
    { id: 'u5_turno_solo', min: 16, max: 85, w: 8, t: 'Te dejan solo al cargo de todo por primera vez.',
      c: [{ t: 'Hacerlo por el libro', fx: { intelecto: 10, reputacion: 10 } },
          { t: 'Improvisar', fx: { destreza: 10, cordura: -6, reputacion: 6 } },
          { t: 'Llamar cada diez minutos', fx: { reputacion: -8, cordura: 4 } },
          { t: 'Aprovechar para hacer tus cosas', fx: { creditos: 4000, alineamiento: -8 } }] },
    { id: 'u5_gremio_pelea', min: 20, max: 85, w: 8, t: 'Dos gremios de {p} se están peleando y los dos te quieren de su lado.',
      c: [{ t: 'Elegir el de los trabajadores', fx: { alineamiento: 14, reputacion: 12 } },
          { t: 'Elegir el que paga', fx: { creditos: 20000, alineamiento: -12 } },
          { t: 'Mediar', fx: { carisma: 18, reputacion: 14, cordura: -8 } },
          { t: 'Quedarte fuera', fx: { reputacion: -6 } }] },
    { id: 'u5_curro_lejos', min: 18, max: 85, w: 8, t: 'Hay trabajo de {o} en las minas de {x} y pagan por adelantado.',
      c: [{ t: 'Ir un año', mueveA: '{x}', motivo: 'a las minas', fx: { creditos: 22000, salud: -16, fisico: 10 } },
          { t: 'Ir y quedarte', mueveA: '{x}', motivo: 'a las minas, para siempre', fx: { creditos: 14000, salud: -10 } },
          { t: 'Mandar a otro y llevarte comisión', fx: { creditos: 6000, alineamiento: -10 } },
          { t: 'Quedarte', fx: {} }] }
  ]);

  /* ══════════════════════════ FORMACIÓN ══════════════════════════ */
  A('formacion', [
    { id: 'u5_congreso', min: 22, max: 85, w: 8, t: 'Hay un congreso del ramo en {x} y podrías presentar algo.',
      c: [{ t: 'Ir y presentar', fx: { intelecto: 14, reputacion: 12, creditos: -6000 } },
          { t: 'Ir solo a escuchar', fx: { intelecto: 10, creditos: -4000 } },
          { t: 'Ir a hacer contactos', fx: { carisma: 12, creditos: -4000 }, rel: { tipo: 'contacto', afecto: 30 } },
          { t: 'No ir', fx: {} }] },
    { id: 'u5_examen_repetir', min: 14, max: 60, w: 8, t: 'Has suspendido y toca decidir.',
      c: [{ t: 'Repetir y hacerlo bien', fx: { intelecto: 14, cordura: -8 } },
          { t: 'Cambiar de rama', fx: { intelecto: 8, cordura: 8 } },
          { t: 'Dejarlo y ponerte a trabajar', fx: { creditos: 6000, fisico: 6, intelecto: -4 } },
          { t: 'Recurrir la nota', fx: { carisma: 10, intelecto: 6 } }] },
    { id: 'u5_profesor', min: 28, max: 90, w: 8, t: 'Te ofrecen dar clase en {l}.',
      c: [{ t: 'Aceptar', fx: { carisma: 12, intelecto: 10, reputacion: 12, creditos: 8000 } },
          { t: 'Aceptar solo un curso', fx: { carisma: 8, creditos: 4000 } },
          { t: 'Rechazar', fx: {} },
          { t: 'Aceptar y montar tu propia escuela luego', fx: { creditos: -20000, carisma: 16, reputacion: 16 } }] },
    { id: 'u5_mentor_tuyo', min: 25, max: 90, w: 8, t: 'Alguien te pide que le enseñes tu oficio de {o}.',
      c: [{ t: 'Enseñarle todo', fx: { alineamiento: 14, carisma: 10 }, rel: { tipo: 'aprendiz', afecto: 45 } },
          { t: 'Enseñarle guardándote lo bueno', fx: { intelecto: 6, alineamiento: -8 } },
          { t: 'Cobrarle', fx: { creditos: 9000, carisma: 6 } },
          { t: 'Decirle que no tienes tiempo', fx: { cordura: 4 } }] }
  ]);

  /* ══════════════════════════ SOCIAL ══════════════════════════ */
  A('social', [
    { id: 'u5_juicio_amigo', min: 20, max: 90, w: 8, t: 'Juzgan a {a} y tú sabes que sí lo hizo.',
      c: [{ t: 'Declarar la verdad', conEsa: -35, notaRel: 'declaraste contra él', fx: { alineamiento: 18, cordura: -8 } },
          { t: 'Mentir por él', conEsa: 25, notaRel: 'mentiste por él', fx: { alineamiento: -16 }, buscado: 14 },
          { t: 'No presentarte', conEsa: -10, notaRel: 'no apareciste', fx: { cordura: -8 } },
          { t: 'Pagarle el abogado y callarte', conEsa: 15, notaRel: 'le pagaste la defensa', fx: { creditos: -18000 } }] },
    { id: 'u5_cumple', min: 12, max: 95, w: 8, t: 'Es tu cumpleaños y nadie parece acordarse.',
      c: [{ t: 'Recordárselo a todos', fx: { carisma: 8, reputacion: -4, cordura: 6 } },
          { t: 'Celebrarlo tú solo', fx: { cordura: 8 } },
          { t: 'Invitar a quien te apetezca', fx: { carisma: 10, cordura: 12, creditos: -3000 } },
          { t: 'Dejarlo pasar', fx: { cordura: -6 } }] },
    { id: 'u5_perdon', min: 20, max: 95, w: 8, t: 'Hay alguien a quien deberías pedir perdón desde hace años.',
      c: [{ t: 'Ir a verle', conEsa: 25, notaRel: 'le pediste perdón en persona', fx: { cordura: 16, alineamiento: 14 } },
          { t: 'Escribirle', conEsa: 12, notaRel: 'le escribiste', fx: { cordura: 8 } },
          { t: 'Compensarle sin decir nada', conEsa: 10, notaRel: 'le compensaste en silencio', fx: { creditos: -12000, alineamiento: 12 } },
          { t: 'Convencerte de que no hace falta', fx: { cordura: -10 } }] },
    { id: 'u5_comunidad', min: 18, max: 95, w: 8, t: 'La comunidad de {g} de {p} te acepta como uno más si haces lo que toca.',
      c: [{ t: 'Hacerlo', fx: { carisma: 12, cordura: 12, reputacion: 10 }, flag: 'de_aqui' },
          { t: 'Hacerlo a medias', fx: { carisma: 6 } },
          { t: 'Negarte y seguir siendo de fuera', fx: { cordura: 6, reputacion: -8 } },
          { t: 'Cuestionar la costumbre en voz alta', fx: { notoriedad: 10, intelecto: 8, reputacion: -10 } }] }
  ]);

  /* ══════════════════════════ MERCADO ══════════════════════════ */
  A('mercado', [
    { id: 'u5_subasta_deudas', min: 20, max: 90, w: 8, t: 'Subastan las deudas de medio barrio de {l}.',
      c: [{ t: 'Comprarlas y perdonarlas', coste: 25000, fx: { alineamiento: 26, reputacion: 24 } },
          { t: 'Comprarlas y cobrarlas', coste: 25000, fx: { creditos: 60000, alineamiento: -22, notoriedad: 12 } },
          { t: 'Denunciar la subasta', fx: { alineamiento: 14, reputacion: 10 } },
          { t: 'Pasar', fx: {} }] },
    { id: 'u5_moneda_local', min: 18, max: 90, w: 8, t: 'La moneda de {p} se está hundiendo.',
      c: [{ t: 'Cambiar todo a créditos', fx: { creditos: 8000, intelecto: 8 } },
          { t: 'Comprar bienes reales', fx: { creditos: -10000 }, flag: 'con_stock' },
          { t: 'Especular con el cambio', r: [{ p: 0.4, t: 'Aciertas.', fx: { creditos: 40000 } }, { p: 0.6, t: 'Fallas.', fx: { creditos: -22000 } }] },
          { t: 'No hacer nada', fx: { creditos: -6000 } }] },
    { id: 'u5_cooperativa', min: 20, max: 90, w: 8, t: 'Los {o} de {p} quieren montar una cooperativa.',
      c: [{ t: 'Entrar', coste: 6000, fx: { reputacion: 12, alineamiento: 12, creditos: 4000 } },
          { t: 'Dirigirla', fx: { carisma: 14, reputacion: 16, cordura: -8 } },
          { t: 'Boicotearla', fx: { creditos: 12000, alineamiento: -18, reputacion: -14 } },
          { t: 'Verlas venir', fx: {} }] }
  ]);

  /* ══════════════════════════ CRIMEN ══════════════════════════ */
  A('crimen', [
    { id: 'u5_carcel_dentro', min: 18, max: 85, w: 8, req: function (s) { return s.carcelAños > 0; },
      t: 'Dentro también hay economía y jerarquía.',
      c: [{ t: 'Buscarte un protector', fx: { carisma: 10, alineamiento: -8 } },
          { t: 'Hacerte respetar a golpes', combate: { dif: 55 }, fx: { fisico: 10, notoriedad: 10 } },
          { t: 'Estudiar en la biblioteca', fx: { intelecto: 14, cordura: 8 } },
          { t: 'No llamar la atención', fx: { cordura: 6, destreza: 4 } }] },
    { id: 'u5_pasaporte', min: 18, max: 85, w: 8, t: 'Un falsificador de {l} hace identidades que aguantan un control.',
      c: [{ t: 'Comprar una', coste: 15000, fx: { notoriedad: -20 }, flag: 'otra_identidad' },
          { t: 'Comprar tres', coste: 40000, fx: { notoriedad: -25, intelecto: 6 }, flag: 'otra_identidad' },
          { t: 'Aprender a hacerlas', fx: { intelecto: 16, creditos: -8000 }, habilidad: 'falsificador' },
          { t: 'Denunciarle', fx: { alineamiento: 10, creditos: 5000 }, buscado: 10 }] },
    { id: 'u5_cargo_conciencia', min: 25, max: 90, w: 8, req: function (s) { return s.stats.alineamiento < -30; },
      t: 'Hay una cosa que hiciste y que vuelve todas las noches.',
      c: [{ t: 'Repararlo como puedas', fx: { alineamiento: 22, cordura: 18, creditos: -20000 } },
          { t: 'Contárselo a alguien', fx: { cordura: 14, alineamiento: 8 } },
          { t: 'Entregarte', carcel: 5, fx: { alineamiento: 26, cordura: 16 }, limpiarBusca: true },
          { t: 'Enterrarlo más hondo', fx: { cordura: -14, alineamiento: -8 } }] }
  ]);

  /* ══════════════════════════ NAVE / VIAJE / ACCIÓN ══════════════════════════ */
  A('nave', [
    { id: 'u5_motor_nuevo', min: 18, max: 90, w: 8, req: conNave, t: 'Se puede meter un motor de contrabando en el {v}.',
      c: [{ t: 'Instalarlo', coste: 22000, fx: { naveEstado: 10, destreza: 6 }, buscado: 8 },
          { t: 'Instalarlo tú mismo', fx: { intelecto: 12, naveEstado: -6, creditos: -12000 } },
          { t: 'Buscar uno legal', coste: 32000, fx: { naveEstado: 15 } },
          { t: 'Dejarlo como está', fx: {} }] },
    { id: 'u5_pasajeros', min: 18, max: 90, w: 8, req: conNave, t: 'Diez personas de {p} necesitan salir de aquí y pagan lo que tienen.',
      c: [{ t: 'Llevarlos', fx: { creditos: 12000, alineamiento: 14 } },
          { t: 'Llevarlos gratis', fx: { alineamiento: 22, reputacion: 14, creditos: -4000 } },
          { t: 'Cobrarles el doble', fx: { creditos: 26000, alineamiento: -20 } },
          { t: 'No meterte en líos', fx: {} }] },
    { id: 'u5_vender_nave', min: 20, max: 90, w: 7, req: conNave, t: 'Te ofrecen buen dinero por tu nave.',
      c: [{ t: 'Venderla', fx: { creditos: 70000, cordura: -10 }, navePierde: true },
          { t: 'No venderla', fx: { cordura: 8 } },
          { t: 'Venderla y comprar otra peor', fx: { creditos: 30000 } },
          { t: 'Pedir más', fx: { carisma: 10, creditos: 15000 } }] }
  ]);

  A('viaje', [
    { id: 'u5_tren_lento', min: 12, max: 95, w: 8, t: 'Hay una línea vieja que cruza {p} en dos días.',
      c: [{ t: 'Cogerla y mirar por la ventana', fx: { cordura: 12, intelecto: 4 } },
          { t: 'Trabajar durante el trayecto', fx: { intelecto: 8, creditos: 3000 } },
          { t: 'Hablar con los que van', fx: { carisma: 10 }, rel: { tipo: 'contacto', afecto: 25 } },
          { t: 'Coger un vuelo', fx: { creditos: -6000 } }] },
    { id: 'u5_pasaje_urgente', min: 16, max: 95, w: 8, t: 'Necesitas salir de {p} hoy y no hay plazas.',
      c: [{ t: 'Pagar lo que sea', coste: 20000, mover: 'cerca', motivo: 'con lo puesto' },
          { t: 'Buscar un carguero', fx: { carisma: 10 }, mover: 'cerca', motivo: 'en la bodega de un carguero' },
          { t: 'Colarte', fx: { destreza: 12 }, mover: 'cerca', motivo: 'sin billete', buscado: 12 },
          { t: 'Quedarte y afrontarlo', fx: { cordura: 8 }, peligro: 15 }] }
  ]);

  A('accion', [
    { id: 'u5_rescate_altura', min: 14, max: 85, w: 8, t: 'Alguien se ha quedado colgado en la fachada de {h}.',
      c: [{ t: 'Subir', fx: { destreza: 14, alineamiento: 16, salud: -10 } },
          { t: 'Montar una red abajo', fx: { intelecto: 12, carisma: 10, alineamiento: 14 } },
          { t: 'Bajarle con la Fuerza', req: sensible, fx: { fuerza: 14, alineamiento: 16, reputacion: 12 }, ojo: true },
          { t: 'Llamar a emergencias', fx: { alineamiento: 4 } }] },
    { id: 'u5_pelea_banda', min: 16, max: 85, w: 8, t: '{k} está dando una paliza a alguien en un callejón de {l}.',
      c: [{ t: 'Meterte', combate: { dif: 58 }, fx: { alineamiento: 16 } },
          { t: 'Gritar y hacer ruido', fx: { alineamiento: 10, carisma: 6 } },
          { t: 'Grabarlo y denunciarlo', fx: { alineamiento: 12, reputacion: 8 }, buscado: 14 },
          { t: 'Seguir andando', fx: { cordura: -10, alineamiento: -10 } }] },
    { id: 'u5_prueba_valor2', min: 14, max: 80, w: 8, t: 'En {l} hay una prueba que la gente del sitio hace una vez en la vida.',
      c: [{ t: 'Hacerla', fx: { fisico: 14, reputacion: 14, salud: -12, cordura: 10 } },
          { t: 'Hacerla sin preparar', fx: { salud: -22, reputacion: 8, fisico: 8 }, peligro: 20 },
          { t: 'Prepararte un año y hacerla', fx: { fisico: 18, reputacion: 18, cordura: 12 } },
          { t: 'No hacerla', fx: { reputacion: -8 } }] }
  ]);

  /* ══════════════════════════ FUERZA / ESCUADRÓN / SALUD / POLÍTICA ══════════════════════════ */
  A('fuerza', [
    { id: 'u5_kyber_grieta', min: 14, max: 95, w: 8, req: function (s) { return !!s.sable; },
      t: 'Tu cristal tiene una grieta y el sable parpadea.',
      c: [{ t: 'Repararlo tú', fx: { fuerza: 10, intelecto: 10 } },
          { t: 'Buscar otro cristal', fx: { fuerza: 8, cordura: 6 }, kyber: true },
          { t: 'Usarlo así', fx: { destreza: -6 }, peligro: 12 },
          { t: 'Dejar de usar sable una temporada', fx: { cordura: 10, fisico: 8 } }] },
    { id: 'u5_ayuno', min: 12, max: 95, w: 7, req: sensible, t: 'Los viejos textos hablan de purificarse pasando hambre.',
      c: [{ t: 'Hacerlo entero', fx: { fuerza: 14, cordura: 12, salud: -14 } },
          { t: 'Hacerlo a medias', fx: { fuerza: 6, cordura: 6, salud: -4 } },
          { t: 'Buscar otra vía', fx: { intelecto: 10, fuerza: 6 } },
          { t: 'Los textos se escribieron hace mil años', fx: { cordura: 6, intelecto: 6 } }] }
  ]);

  A('escuadron', [
    { id: 'u5_rendicion', min: 16, max: 75, w: 8, t: 'El enemigo levanta bandera blanca y tu mando duda.',
      c: [{ t: 'Aceptar la rendición', fx: { alineamiento: 18, reputacion: 10 } },
          { t: 'Cumplir lo que ordenen', fx: { alineamiento: -14, cordura: -12 } },
          { t: 'Desobedecer y aceptarla tú', fx: { alineamiento: 22, reputacion: -12 }, flag: 'insubordinado' },
          { t: 'Pedir instrucciones más arriba', fx: { intelecto: 8, cordura: -6 } }] },
    { id: 'u5_permiso', min: 16, max: 75, w: 8, t: 'Te dan diez días de permiso.',
      c: [{ t: 'Ir a ver a los tuyos', mover: 'casa', motivo: 'de permiso', fx: { cordura: 16 } },
          { t: 'Gastártelos de fiesta', fx: { cordura: 12, salud: -8, creditos: -6000 } },
          { t: 'Dormir diez días', fx: { salud: 14, cordura: 8 } },
          { t: 'Renunciar al permiso', fx: { reputacion: 10, cordura: -10 } }] }
  ]);

  A('salud', [
    { id: 'u5_cicatriz', min: 20, max: 95, w: 7, t: 'Tienes una cicatriz que se puede quitar.',
      c: [{ t: 'Quitártela', coste: 8000, fx: { carisma: 8, cordura: 6 } },
          { t: 'Quedártela', fx: { cordura: 10, notoriedad: 4 } },
          { t: 'Tatuar encima', coste: 3000, fx: { carisma: 10, cordura: 8 } },
          { t: 'Ni te acordabas', fx: {} }] },
    { id: 'u5_alergia', min: 10, max: 95, w: 7, t: 'Algo del aire de {p} no te sienta bien.',
      c: [{ t: 'Tratarlo', coste: 6000, fx: { salud: 12 } },
          { t: 'Filtros en casa', coste: 9000, fx: { salud: 10, cordura: 4 } },
          { t: 'Mudarte', mover: 'cerca', motivo: 'porque aquí no puedes respirar', fx: { salud: 12 } },
          { t: 'Aguantarte', fx: { salud: -10 } }] }
  ]);

  A('politica', [
    { id: 'u5_diplomacia', min: 22, max: 95, w: 8, t: 'Te mandan a negociar a {x} y el otro lado no quiere negociar.',
      c: [{ t: 'Aguantar y desgastarles', fx: { carisma: 14, cordura: -10, reputacion: 12 } },
          { t: 'Ceder para cerrar rápido', fx: { reputacion: -8, cordura: 6 } },
          { t: 'Amenazar', fx: { notoriedad: 12, alineamiento: -12 }, faccion: 'auto+10' },
          { t: 'Buscar lo que de verdad quieren', fx: { intelecto: 16, carisma: 14, reputacion: 14 } }] },
    { id: 'u5_prensa_hostil', min: 20, max: 95, w: 8, t: 'Un medio de {p} te ha puesto en su punto de mira.',
      c: [{ t: 'Darles acceso total', fx: { alineamiento: 14, reputacion: 8 } },
          { t: 'Comprar el medio', coste: 60000, fx: { reputacion: 12, alineamiento: -22 } },
          { t: 'Ignorarlos', fx: { reputacion: -8, cordura: 6 } },
          { t: 'Cerrarles la publicidad institucional', fx: { alineamiento: -18, notoriedad: 12 } }] }
  ]);

  A('exploracion', [
    { id: 'u5_expedicion', min: 18, max: 90, w: 8, t: 'Se monta una expedición a la zona sin cartografiar de {p} y buscan gente.',
      c: [{ t: 'Ir de guía', fx: { creditos: 12000, intelecto: 10, salud: -8 } },
          { t: 'Financiarla', coste: 25000, fx: { creditos: 45000, reputacion: 12 } },
          { t: 'Ir por tu cuenta antes que ellos', fx: { intelecto: 12, creditos: 20000, salud: -14 }, peligro: 20 },
          { t: 'Verla salir', fx: {} }] }
  ]);

  /* ══════════════════════════ EVENTOS ANUALES ══════════════════════════ */
  V([
    { id: 'z5_puerta_vecina', min: 14, max: 95, w: 9, t: 'La casa de al lado en {l} lleva un mes con la puerta abierta.',
      c: [{ t: 'Entrar a ver', fx: { intelecto: 8, cordura: -6 } },
          { t: 'Avisar a alguien', fx: { alineamiento: 10 } },
          { t: 'Cerrarla y ya', fx: { cordura: 4 } },
          { t: 'Meterte a vivir', fx: { creditos: 8000, alineamiento: -12 }, buscado: 8 }] },
    { id: 'z5_deuda_vieja', min: 22, max: 95, w: 9, t: 'Aparece alguien a cobrar algo que debías hace quince años.',
      c: [{ t: 'Pagar con intereses', fx: { creditos: -20000, alineamiento: 12, cordura: 8 } },
          { t: 'Discutir la cifra', fx: { carisma: 12, creditos: -8000 } },
          { t: 'Negar que exista', fx: { alineamiento: -12, cordura: -6 }, buscado: 10 },
          { t: 'Ofrecerle trabajo en vez de dinero', fx: { carisma: 14, creditos: -4000 } }] },
    { id: 'z5_reclamo_familia', min: 25, max: 95, w: 8, t: 'Un pariente que no conocías te reclama parte de algo.',
      c: [{ t: 'Repartir', fx: { creditos: -15000, alineamiento: 14 } },
          { t: 'Pelearlo', fx: { intelecto: 10, creditos: -6000, cordura: -8 } },
          { t: 'Conocerle primero', fx: { carisma: 10, cordura: 8 }, rel: { tipo: 'familia', afecto: 30 } },
          { t: 'Ignorarle', fx: { alineamiento: -8 } }] },
    { id: 'z5_oferta_faccion', min: 18, max: 90, w: 9, t: '{f} te ofrece un puesto y una vida resuelta.',
      c: [{ t: 'Aceptar', fx: { creditos: 24000, reputacion: 10 }, faccion: 'auto+25' },
          { t: 'Aceptar y guardar distancias', fx: { creditos: 16000, intelecto: 8 }, faccion: 'auto+12' },
          { t: 'Rechazar', fx: { cordura: 8 }, faccion: 'auto-10' },
          { t: 'Aceptar para saber qué hacen', fx: { intelecto: 14 }, flag: 'infiltrado', buscado: 12 }] },
    { id: 'z5_hijo_camino', min: 30, max: 95, w: 8, req: function (s) { return (s.contadores.hijos || 0) > 0; },
      t: 'Tu hijo quiere dedicarse a lo mismo que tú.',
      c: [{ t: 'Enseñarle', fx: { carisma: 12, cordura: 12, alineamiento: 10 } },
          { t: 'Quitárselo de la cabeza', fx: { cordura: -8, alineamiento: -4 } },
          { t: 'Dejar que se equivoque solo', fx: { cordura: 6, intelecto: 6 } },
          { t: 'Abrirle todas tus puertas', fx: { reputacion: -6, creditos: -10000, cordura: 8 } }] },
    { id: 'z5_reconocer_error', min: 25, max: 95, w: 8, t: 'Descubres que llevabas años equivocado en algo importante.',
      c: [{ t: 'Reconocerlo en público', fx: { alineamiento: 18, reputacion: -6, cordura: 14, intelecto: 10 } },
          { t: 'Corregirlo en silencio', fx: { intelecto: 12, cordura: 8 } },
          { t: 'Defenderlo igual', fx: { cordura: -10, intelecto: -4, carisma: 6 } },
          { t: 'Cambiar de tema', fx: { cordura: -6 } }] },
    { id: 'z5_visita_inesperada', min: 18, max: 95, w: 9, t: 'Llaman a tu puerta en {p} y es la última persona que esperabas.',
      c: [{ t: 'Dejarle pasar', fx: { cordura: 10, carisma: 6 } },
          { t: 'Hablar en la puerta', fx: { cordura: 4 } },
          { t: 'No abrir', fx: { cordura: -8 } },
          { t: 'Abrir con algo en la mano', fx: { fisico: 4, cordura: -6, notoriedad: 4 } }] },
    { id: 'z5_trabajo_negro', min: 18, max: 90, w: 9, t: 'Hay trabajo sin contrato en {l} y pagan en el momento.',
      c: [{ t: 'Cogerlo', fx: { creditos: 7000, salud: -6 } },
          { t: 'Cogerlo y exigir seguridad', fx: { creditos: 5000, reputacion: 6, alineamiento: 8 } },
          { t: 'Denunciarlo', fx: { alineamiento: 12, reputacion: 6 }, buscado: 6 },
          { t: 'Buscar otra cosa', fx: {} }] },
    { id: 'z5_bar_cierra', min: 20, max: 95, w: 8, t: 'Cierra el sitio donde llevas años yendo en {l}.',
      c: [{ t: 'Ir el último día', fx: { cordura: 10 } },
          { t: 'Comprarlo', coste: 30000, fx: { cordura: 16, reputacion: 12 }, flag: 'tiene_local' },
          { t: 'Buscar otro sitio', fx: { cordura: 4, carisma: 6 } },
          { t: 'Dejar de salir', fx: { cordura: -10, creditos: 3000 } }] },
    { id: 'z5_denuncia_falsa', min: 18, max: 95, w: 8, t: 'Te denuncian por algo que no has hecho.',
      c: [{ t: 'Defenderte por lo legal', fx: { intelecto: 10, creditos: -12000, cordura: -6 } },
          { t: 'Buscar quién te ha denunciado', fx: { intelecto: 12, notoriedad: 8 } },
          { t: 'Pactar y pagar', fx: { creditos: -18000, cordura: 4 } },
          { t: 'Marcharte de {p}', mover: 'cerca', motivo: 'con la denuncia encima', fx: { reputacion: -10 } }] },
    { id: 'z5_hallazgo', min: 14, max: 95, w: 8, t: 'Encuentras algo enterrado en el patio de {l}.',
      c: [{ t: 'Desenterrarlo', fx: { creditos: 12000, intelecto: 8 } },
          { t: 'Avisar a las autoridades', fx: { alineamiento: 12, reputacion: 8, creditos: 3000 } },
          { t: 'Volver a taparlo', fx: { cordura: 6 } },
          { t: 'Averiguar quién lo puso ahí', fx: { intelecto: 14, cordura: -6 } }] },
    { id: 'z5_hospital_deuda', min: 25, max: 95, w: 8, req: function (s) { return s.stats.salud < 55; },
      t: 'La factura del hospital de {p} es más de lo que ganas en un año.',
      c: [{ t: 'Pagarla a plazos', fx: { creditos: -25000, cordura: -6 } },
          { t: 'Pedirla a un prestamista', fx: { creditos: 20000 }, flag: 'debe_a_usureros' },
          { t: 'Negociar con el hospital', fx: { carisma: 14, creditos: -12000 } },
          { t: 'No pagarla', fx: { reputacion: -10 }, buscado: 10 }] },
    { id: 'z5_reconocimiento_tarde', min: 45, max: 95, w: 7, t: 'Te reconocen algo que hiciste hace treinta años.',
      c: [{ t: 'Aceptarlo con gusto', fx: { cordura: 14, reputacion: 12 } },
          { t: 'Decir que llegan tarde', fx: { cordura: 8, notoriedad: 8, reputacion: -4 } },
          { t: 'Compartirlo con quien te ayudó', fx: { alineamiento: 18, reputacion: 14 } },
          { t: 'No presentarte', fx: { cordura: -4 } }] },
    { id: 'z5_mudanza_ultima', min: 55, max: 95, w: 8, t: 'Ya no puedes con la casa donde vives.',
      c: [{ t: 'Mudarte a algo pequeño', fx: { creditos: 12000, cordura: -6, salud: 6 } },
          { t: 'Irte con familia', fx: { cordura: 8, alineamiento: 6 } },
          { t: 'Contratar ayuda', fx: { creditos: -14000, salud: 10, cordura: 6 } },
          { t: 'Quedarte como sea', fx: { cordura: 10, salud: -10 } }] },
    { id: 'z5_ultimo_favor', min: 60, max: 95, w: 8, t: 'Alguien te pide un último favor y sabes que es el último.',
      c: [{ t: 'Hacerlo', fx: { alineamiento: 18, cordura: 14, salud: -6 } },
          { t: 'Hacerlo aunque te cueste todo', fx: { alineamiento: 24, creditos: -25000, cordura: 16 } },
          { t: 'No poder', fx: { cordura: -12 } },
          { t: 'Buscar a alguien que sí pueda', fx: { carisma: 12, alineamiento: 12 } }] },
    { id: 'z5_sombra_pasado', min: 35, max: 95, w: 8, req: function (s) { return s.stats.notoriedad > 35; },
      t: 'Alguien escribe sobre lo que hiciste y no lo cuenta bien.',
      c: [{ t: 'Contar tu versión', fx: { carisma: 12, reputacion: 8, cordura: 8 } },
          { t: 'Dejar que lo cuenten', fx: { cordura: -6 } },
          { t: 'Pararlo por lo legal', fx: { creditos: -18000, reputacion: 6 } },
          { t: 'Hablar con quien lo escribe', fx: { carisma: 14, intelecto: 8 } }] },
    { id: 'z5_generacion', min: 40, max: 95, w: 8, t: 'La gente joven de {p} hace las cosas de otra manera y te molesta.',
      c: [{ t: 'Aprender de ellos', fx: { intelecto: 12, cordura: 10, carisma: 8 } },
          { t: 'Discutírselo', fx: { carisma: 6, cordura: -4 } },
          { t: 'Dejarles en paz', fx: { cordura: 6 } },
          { t: 'Enseñarles lo que sabes tú', fx: { carisma: 14, alineamiento: 12, reputacion: 10 } }] },
    { id: 'z5_dinero_perdido', min: 20, max: 95, w: 8, t: 'Descubres que llevas años pagando algo que no usas.',
      c: [{ t: 'Cancelarlo y reclamar', fx: { creditos: 9000, intelecto: 8 } },
          { t: 'Cancelarlo y ya', fx: { creditos: 3000 } },
          { t: 'Dejarlo por pereza', fx: { creditos: -3000, cordura: -4 } },
          { t: 'Revisar todo lo demás también', fx: { creditos: 14000, intelecto: 12, cordura: -4 } }] }
  ]);

})(typeof window !== 'undefined' ? window : globalThis);

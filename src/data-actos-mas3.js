/* ============================================================
   HOLOVIDA :: MÁS DECISIONES POR MENÚ (TERCERA TANDA)
   Tercera pasada sobre todos los menús. Aquí entran las cosas
   raras: burocracia, oficios concretos, gente del sitio, y lo
   que pasa cuando llevas años haciendo lo mismo.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.ACTOS = SW.ACTOS || {};
  const S = { p: 'mundoAqui', l: 'lugar', k: 'banda', d: 'mandamas', h: 'hito', o: 'oficio',
              m: 'mercancia', g: 'paisanos', b: 'bicho', n: 'nombre', x: 'mundoCerca',
              c: 'conocido', f: 'faccion', t: 'tiempo', a: 'amigo', r: 'rivalN',
              j: 'pareja', v: 'nave', q: 'comida', z: 'peligro' };
  const A = function (menu, arr) {
    SW.ACTOS[menu] = SW.ACTOS[menu] || [];
    arr.forEach(function (e) { e.slots = e.slots || S; SW.ACTOS[menu].push(e); });
  };
  const conNave = function (s) { return !!s.nave; };

  /* ══════════════════════════ TRABAJO ══════════════════════════ */
  A('trabajo', [
    { id: 't3_inspector', min: 18, max: 85, w: 9, t: 'Viene un inspector de {d} a mirar cómo trabajáis en {l}.',
      c: [{ t: 'Enseñarle todo', fx: { alineamiento: 10, reputacion: 6, creditos: -5000 } },
          { t: 'Enseñarle lo que quieras', fx: { intelecto: 8, alineamiento: -6 } },
          { t: 'Invitarle a comer', coste: 3000, fx: { carisma: 10, alineamiento: -8 } },
          { t: 'Contarle lo que de verdad pasa aquí', fx: { alineamiento: 18, reputacion: -10 } }] },
    { id: 't3_encargo_imposible', min: 18, max: 85, w: 10, t: 'Te dan un plazo que no se puede cumplir.',
      c: [{ t: 'Decir que no se puede', fx: { reputacion: -6, cordura: 8, alineamiento: 8 } },
          { t: 'Matarte a trabajar', fx: { salud: -14, cordura: -12, reputacion: 14, creditos: 6000 } },
          { t: 'Entregar algo a medias', fx: { reputacion: -12, cordura: 4 } },
          { t: 'Subcontratar por tu cuenta', fx: { creditos: -8000, intelecto: 10, reputacion: 8 } }] },
    { id: 't3_compañero_roba', min: 16, max: 85, w: 9, t: 'Un compañero se lleva material del almacén todas las semanas.',
      c: [{ t: 'Hablar con él', fx: { carisma: 10, alineamiento: 8 } },
          { t: 'Denunciarle', fx: { alineamiento: 10, reputacion: 6, carisma: -8 } },
          { t: 'Pedir tu parte', fx: { creditos: 7000, alineamiento: -14 } },
          { t: 'Callarte', fx: { cordura: -4 } }] },
    { id: 't3_cliente_gordo', min: 20, max: 85, w: 9, t: 'Un cliente grande de {x} lo cambia todo si firmáis.',
      c: [{ t: 'Darlo todo por el contrato', fx: { creditos: 30000, cordura: -10, salud: -6 } },
          { t: 'Poner condiciones', fx: { carisma: 14, creditos: 16000 } },
          { t: 'Investigar de dónde sale su dinero', fx: { intelecto: 14, creditos: 4000 } },
          { t: 'Rechazarlo por lo que son', fx: { alineamiento: 18, reputacion: 8 } }] },
    { id: 't3_sindicato', min: 18, max: 85, w: 9, t: 'Os están presionando para que nadie se organice en {l}.',
      c: [{ t: 'Organizaros igual', fx: { carisma: 14, reputacion: 12, alineamiento: 14 }, buscado: 8 },
          { t: 'Aceptar el sobre por no organizaros', fx: { creditos: 14000, alineamiento: -18 } },
          { t: 'Hacer de intermediario', fx: { carisma: 16, creditos: 6000 } },
          { t: 'Quedarte al margen', fx: {} }] },
    { id: 't3_turno_peligroso', min: 16, max: 85, w: 9, t: 'El trabajo de {l} que nadie quiere paga cuatro veces más.',
      c: [{ t: 'Cogerlo', fx: { creditos: 18000, salud: -18 }, peligro: 20 },
          { t: 'Cogerlo con equipo bueno', coste: 8000, fx: { creditos: 18000, salud: -8 } },
          { t: 'Cogerlo y hacer lo mínimo', fx: { creditos: 9000, reputacion: -8 } },
          { t: 'Pasar', fx: {} }] },
    { id: 't3_reconversion', min: 25, max: 80, w: 8, t: 'Tu oficio de {o} se está quedando sin sitio en {p}.',
      c: [{ t: 'Reciclarte', fx: { intelecto: 14, creditos: -8000 } },
          { t: 'Ser el último que lo hace bien', fx: { reputacion: 16, creditos: 6000, cordura: 8 } },
          { t: 'Irte donde todavía haga falta', mueveA: '{x}', motivo: 'buscando trabajo', fx: { creditos: -3000 } },
          { t: 'Aguantar hasta que se acabe', fx: { creditos: 2000, cordura: -8 } }] },
    { id: 't3_becario', min: 24, max: 85, w: 8, t: 'Te ponen a cargo de alguien que acaba de llegar.',
      c: [{ t: 'Enseñarle bien', fx: { carisma: 12, alineamiento: 12 }, rel: { tipo: 'aliado', afecto: 40 } },
          { t: 'Ponerle a hacer lo tuyo', fx: { cordura: 8, alineamiento: -10 } },
          { t: 'Hundirle antes de que te haga sombra', fx: { alineamiento: -18, notoriedad: 6 } },
          { t: 'Ignorarle', fx: { reputacion: -6 } }] },
    { id: 't3_viaje_trabajo', min: 20, max: 85, w: 8, t: 'Te mandan seis meses a {x} por trabajo.',
      c: [{ t: 'Ir y aprovecharlo', mueveA: '{x}', motivo: 'por un encargo largo', fx: { creditos: 14000, intelecto: 8 } },
          { t: 'Ir y contar los días', mueveA: '{x}', motivo: 'a regañadientes', fx: { creditos: 12000, cordura: -8 } },
          { t: 'Negarte', fx: { reputacion: -10, cordura: 6 } },
          { t: 'Mandar a otro', fx: { carisma: 8, alineamiento: -8 } }] }
  ]);

  /* ══════════════════════════ SOCIAL ══════════════════════════ */
  A('social', [
    { id: 's3_apuesta_amigos', min: 14, max: 90, w: 9, t: 'Se hace una apuesta tonta en {l} que va subiendo sola.',
      c: [{ t: 'Entrar', mesa: 'dados' },
          { t: 'Entrar y hacer trampas', fx: { creditos: 6000, alineamiento: -12, destreza: 8 } },
          { t: 'Ser el que guarda el dinero', fx: { carisma: 8, reputacion: 6 } },
          { t: 'Quedarte fuera', fx: { cordura: 4 } }] },
    { id: 's3_confesion', min: 18, max: 95, w: 9, t: 'Llevas años sin contarle a nadie una cosa.',
      c: [{ t: 'Contársela a {a}', conEsa: 18, notaRel: 'le contaste lo que nunca cuentas', fx: { cordura: 16 } },
          { t: 'Contarla en público', fx: { cordura: 10, reputacion: -12, notoriedad: 10 } },
          { t: 'Escribirla y guardarla', fx: { cordura: 8, intelecto: 4 } },
          { t: 'Llevártela a la tumba', fx: { cordura: -10 } }] },
    { id: 's3_traicion_pareja', min: 20, max: 90, w: 8, req: function (s) { return (s.relaciones || []).some(function (r) { return r.tipo === 'pareja' || r.tipo === 'cónyuge'; }); },
      t: 'Hay alguien más y todavía no ha pasado nada.',
      c: [{ t: 'Cortar por lo sano antes', conEsa: 10, notaRel: 'elegiste quedarte', fx: { cordura: 8, alineamiento: 10 } },
          { t: 'Contárselo a {j}', conEsa: -10, notaRel: 'se lo contaste', fx: { cordura: 6, alineamiento: 14 } },
          { t: 'Que pase', conEsa: -35, notaRel: 'te lo montaste con otra persona', fx: { cordura: -12, alineamiento: -14 } },
          { t: 'Dejarlo todo y empezar de cero', mover: 'cerca', motivo: 'huyendo de tu propia vida', fx: { cordura: -10 } }] },
    { id: 's3_grupo_estudio', min: 12, max: 60, w: 8, t: 'Se junta gente en {l} para aprender algo por su cuenta.',
      c: [{ t: 'Apuntarte', fx: { intelecto: 12, carisma: 8 }, rel: { tipo: 'amigo', afecto: 35 } },
          { t: 'Darles clase tú', fx: { carisma: 14, intelecto: 8, reputacion: 8 } },
          { t: 'Ir solo a por los contactos', fx: { carisma: 8, alineamiento: -6 } },
          { t: 'Ir a criticar', fx: { cordura: -4, carisma: -6 } }] },
    { id: 's3_favor_devuelto', min: 20, max: 95, w: 8, t: 'Alguien a quien ayudaste hace años aparece con algo para ti.',
      c: [{ t: 'Aceptarlo', fx: { creditos: 12000, cordura: 8 } },
          { t: 'Decirle que no hacía falta', fx: { alineamiento: 14, cordura: 10 } },
          { t: 'Pedirle otra cosa distinta', fx: { carisma: 10, creditos: 6000 } },
          { t: 'Preguntarle qué necesita él', fx: { alineamiento: 16, reputacion: 8 } }] },
    { id: 's3_recomendacion', min: 20, max: 90, w: 8, t: '{c} te pide que le recomiendes para algo para lo que no vale.',
      c: [{ t: 'Recomendarle igual', conEsa: 15, notaRel: 'le recomendaste', fx: { reputacion: -10, alineamiento: -8 } },
          { t: 'Decirle la verdad', conEsa: -12, notaRel: 'le dijiste que no valía', fx: { alineamiento: 12, cordura: 6 } },
          { t: 'Buscarle otra cosa mejor para él', conEsa: 18, notaRel: 'le buscaste otra salida', fx: { carisma: 14, alineamiento: 14 } },
          { t: 'Dar largas', conEsa: -6, notaRel: 'le diste largas', fx: { cordura: -4 } }] }
  ]);

  /* ══════════════════════════ CRIMEN ══════════════════════════ */
  A('crimen', [
    { id: 'c3_contable', min: 20, max: 85, w: 8, t: 'Necesitas a alguien que sepa mover el dinero sin dejar rastro.',
      c: [{ t: 'Contratar al mejor', coste: 20000, fx: { creditos: 0, notoriedad: -8 }, flag: 'blanqueo' },
          { t: 'Aprender tú', fx: { intelecto: 16, creditos: -4000 }, flag: 'blanqueo' },
          { t: 'Meterlo en un banco de {x} y confiar', fx: { creditos: -6000 }, buscado: 10 },
          { t: 'Guardarlo en metálico debajo del colchón', fx: { cordura: -6 } }] },
    { id: 'c3_territorio', min: 18, max: 85, w: 9, t: '{k} ha empezado a operar en tu zona de {p}.',
      c: [{ t: 'Marcar el territorio a golpes', combate: { dif: 62 }, fx: { notoriedad: 14 } },
          { t: 'Repartiros la zona', fx: { carisma: 14, creditos: 10000 } },
          { t: 'Delatarles', fx: { creditos: 8000, alineamiento: -6 }, buscado: 16 },
          { t: 'Irte tú a otra zona', fx: { notoriedad: -8, creditos: -4000 } }] },
    { id: 'c3_encargo_limpio', min: 20, max: 85, w: 8, t: 'Te ofrecen un trabajo que solo sale bien si no muere nadie.',
      c: [{ t: 'Prepararlo bien', fx: { intelecto: 14, creditos: 28000, destreza: 10 } },
          { t: 'Improvisarlo', fx: { creditos: 15000, notoriedad: 14 }, buscado: 20 },
          { t: 'Rechazarlo por lo que hay detrás', fx: { alineamiento: 10 } },
          { t: 'Aceptarlo y venderlo al otro lado', fx: { creditos: 22000, alineamiento: -18, notoriedad: 16 } }] },
    { id: 'c3_familia_crimen', min: 20, max: 85, w: 8, t: 'Alguien de tu familia se ha metido en algo con {k}.',
      c: [{ t: 'Sacarle de ahí', fx: { creditos: -18000, alineamiento: 14, notoriedad: 8 } },
          { t: 'Meterte tú también', fx: { creditos: 14000, alineamiento: -14, notoriedad: 12 } },
          { t: 'Denunciar a {k}', fx: { alineamiento: 12 }, buscado: 25 },
          { t: 'No es asunto tuyo', fx: { cordura: -8 } }] },
    { id: 'c3_museo', min: 22, max: 85, w: 8, t: 'La colección de {h} tiene una pieza que vale un año de tu vida.',
      c: [{ t: 'Planificar el golpe', fx: { intelecto: 14, creditos: 45000 }, buscado: 28 },
          { t: 'Entrar de noche sin plan', fx: { creditos: 18000, salud: -12 }, buscado: 34 },
          { t: 'Sobornar al conservador', coste: 15000, fx: { creditos: 40000, alineamiento: -16 }, buscado: 14 },
          { t: 'Dejarlo', fx: {} }] }
  ]);

  /* ══════════════════════════ MERCADO ══════════════════════════ */
  A('mercado', [
    { id: 'm3_proveedor', min: 18, max: 90, w: 8, t: 'Tu proveedor de {m} sube precios sin avisar.',
      c: [{ t: 'Buscar otro', fx: { intelecto: 10, creditos: 4000 } },
          { t: 'Aguantarle', fx: { creditos: -8000 } },
          { t: 'Producirlo tú', fx: { creditos: -20000, intelecto: 14 }, flag: 'produce' },
          { t: 'Presionarle', fx: { carisma: 10, notoriedad: 8, creditos: 5000 } }] },
    { id: 'm3_franquicia', min: 22, max: 90, w: 8, t: 'Te ofrecen abrir una franquicia de una marca de {x} en {p}.',
      c: [{ t: 'Abrirla', coste: 35000, fx: { creditos: 0, reputacion: 8 }, flag: 'tiene_local' },
          { t: 'Abrir algo propio en su lugar', coste: 20000, fx: { cordura: 10, intelecto: 8 }, flag: 'tiene_local' },
          { t: 'Ser proveedor en vez de dueño', fx: { creditos: 14000 } },
          { t: 'Pasar', fx: {} }] },
    { id: 'm3_marca_negra', min: 18, max: 90, w: 8, t: 'Puedes fabricar copias de algo de marca en {l}.',
      c: [{ t: 'Hacerlas bien', fx: { creditos: 26000, intelecto: 10, alineamiento: -12 }, buscado: 14 },
          { t: 'Hacerlas baratas', fx: { creditos: 12000, reputacion: -10, alineamiento: -14 }, buscado: 10 },
          { t: 'Venderle la idea a la marca original', fx: { creditos: 18000, carisma: 12 } },
          { t: 'Denunciar a quien ya lo hace', fx: { alineamiento: 10, creditos: 6000 } }] },
    { id: 'm3_cliente_moroso', min: 20, max: 90, w: 8, t: 'Un cliente grande lleva medio año sin pagarte.',
      c: [{ t: 'Reclamar por lo legal', fx: { creditos: 9000, intelecto: 8 } },
          { t: 'Mandar a alguien', fx: { creditos: 14000, alineamiento: -18, notoriedad: 10 } },
          { t: 'Cambiar deuda por servicios', fx: { carisma: 12, creditos: 4000 } },
          { t: 'Darlo por perdido', fx: { creditos: -12000, cordura: 6 } }] }
  ]);

  /* ══════════════════════════ NAVE / VIAJE ══════════════════════════ */
  A('nave', [
    { id: 'n3_bandera', min: 18, max: 90, w: 8, req: conNave, t: 'Puedes registrar la nave bajo bandera de {f} y pagar menos.',
      c: [{ t: 'Registrarla', fx: { creditos: 8000 }, faccion: 'auto+12' },
          { t: 'Registrarla en un paraíso fiscal', fx: { creditos: 14000, alineamiento: -10 }, buscado: 8 },
          { t: 'Dejarla como está', fx: {} },
          { t: 'Volar sin registro', fx: { creditos: 12000 }, buscado: 20 }] },
    { id: 'n3_cargamento_vivo', min: 18, max: 90, w: 8, req: conNave, t: 'Te ofrecen transportar {b} vivos a {x}. Van apretados.',
      c: [{ t: 'Llevarlos y cuidarlos', fx: { creditos: 16000, alineamiento: 8, cordura: -4 } },
          { t: 'Llevarlos y no mirar', fx: { creditos: 22000, alineamiento: -12 } },
          { t: 'Soltarlos en el camino', fx: { alineamiento: 16, creditos: -8000, notoriedad: 8 } },
          { t: 'Negarte', fx: {} }] },
    { id: 'n3_pilotos', min: 18, max: 90, w: 8, req: conNave, t: 'Los pilotos de {p} se reúnen en un local de {l}.',
      c: [{ t: 'Ir y hacer contactos', fx: { carisma: 10, destreza: 6 }, rel: { tipo: 'contacto', afecto: 30 } },
          { t: 'Ir a presumir', fx: { reputacion: 8, carisma: 6, notoriedad: 6 } },
          { t: 'Ir a buscar trabajo', fx: { creditos: 10000 } },
          { t: 'Ir a buscar quién te tiene ganas', fx: { intelecto: 8, notoriedad: 8 } }] }
  ]);

  A('viaje', [
    { id: 'v3_crucero', min: 20, max: 95, w: 8, t: 'Hay un crucero de lujo que hace escala en {p}.',
      c: [{ t: 'Pagarte un billete', coste: 25000, fx: { cordura: 16, carisma: 10 } },
          { t: 'Colarte de personal', fx: { destreza: 10, creditos: 3000, cordura: 6 } },
          { t: 'Trabajar en él una temporada', fx: { creditos: 14000, carisma: 10, cordura: -4 } },
          { t: 'Mirarlo desde el muelle', fx: { cordura: -4 } }] },
    { id: 'v3_ruta_larga', min: 16, max: 95, w: 8, t: 'Hay una ruta de dos meses que cruza media galaxia y busca pasaje.',
      c: [{ t: 'Cogerla', mueveA: '{x}', motivo: 'por el camino largo', fx: { cordura: 12, intelecto: 8, creditos: -8000 } },
          { t: 'Cogerla trabajando a bordo', mueveA: '{x}', motivo: 'trabajando el pasaje', fx: { fisico: 8, destreza: 8 } },
          { t: 'Buscar algo más rápido', fx: { creditos: -14000 } },
          { t: 'Quedarte', fx: {} }] },
    { id: 'v3_desierto', min: 14, max: 95, w: 8, t: 'Cruzar {p} por tierra es más barato y más largo.',
      c: [{ t: 'Cruzarlo solo', fx: { fisico: 12, cordura: 10, salud: -12 } },
          { t: 'Contratar guía de los {g}', coste: 4000, fx: { intelecto: 8, carisma: 8 } },
          { t: 'Unirte a otros que van', fx: { carisma: 10 }, rel: { tipo: 'contacto', afecto: 30 } },
          { t: 'Pagar el vuelo', coste: 9000, fx: { cordura: 4 } }] }
  ]);

  /* ══════════════════════════ FUERZA / ESCUADRÓN ══════════════════════════ */
  A('fuerza', [
    { id: 'f3_desapego', min: 14, max: 95, w: 8, req: function (s) { return !!s.sensible; },
      t: 'Te han enseñado que el apego lleva al miedo, y tú tienes gente a la que quieres.',
      c: [{ t: 'Aceptar la doctrina', fx: { fuerza: 12, cordura: -8, alineamiento: 6 } },
          { t: 'Quedarte con la gente', fx: { cordura: 14, fuerza: -4, alineamiento: 8 } },
          { t: 'Esconder lo que sientes', fx: { fuerza: 8, cordura: -12 } },
          { t: 'Discutírselo al Consejo', fx: { carisma: 12, reputacion: -8, intelecto: 10 } }] },
    { id: 'f3_forma_sable', min: 14, max: 95, w: 8, req: function (s) { return !!s.sable; },
      t: 'Toca elegir en qué forma de combate te vas a especializar.',
      c: [{ t: 'Soresu: defender hasta que el otro se canse', fx: { fisico: 12, cordura: 10 }, habilidad: 'duelista' },
          { t: 'Djem So: devolver más fuerte de lo que te dan', fx: { fisico: 14, alineamiento: -4 }, habilidad: 'duelista' },
          { t: 'Ataru: acrobacia y velocidad', fx: { destreza: 16 }, habilidad: 'duelista' },
          { t: 'Makashi: duelo puro, filo contra filo', fx: { destreza: 12, carisma: 8 }, habilidad: 'duelista' }] },
    { id: 'f3_prueba_valor', min: 12, max: 95, w: 8, req: function (s) { return !!s.sensible; },
      t: 'Hay una cueva en {p} donde solo entras tú y lo que llevas dentro.',
      c: [{ t: 'Entrar sin armas', fx: { fuerza: 18, cordura: 12, alineamiento: 10 } },
          { t: 'Entrar armado', fx: { fuerza: 8, cordura: -6 } },
          { t: 'Entrar con alguien', fx: { fuerza: 6, cordura: 8 } },
          { t: 'No entrar', fx: { cordura: -8 } }] }
  ]);

  A('escuadron', [
    { id: 'e3_desercion', min: 18, max: 75, w: 9, t: 'Podrías desaparecer esta noche y nadie se daría cuenta hasta mañana.',
      c: [{ t: 'Desertar', mover: 'cerca', motivo: 'desertando', fx: { cordura: 6 }, flag: 'desertor', buscado: 30 },
          { t: 'Quedarte', fx: { cordura: -8, reputacion: 6 } },
          { t: 'Pedir el traslado por lo legal', fx: { intelecto: 8, cordura: 6 } },
          { t: 'Convencer a otros de irse contigo', fx: { carisma: 14 }, flag: 'desertor', buscado: 40 }] },
    { id: 'e3_oficial_nuevo', min: 18, max: 75, w: 8, t: 'Llega un oficial recién salido de la academia a mandaros.',
      c: [{ t: 'Enseñarle sin humillarle', fx: { carisma: 12, reputacion: 10 } },
          { t: 'Dejar que se estrelle', fx: { alineamiento: -10, cordura: 4 } },
          { t: 'Ganártele', fx: { carisma: 10, creditos: 4000 }, rel: { tipo: 'aliado', afecto: 35 } },
          { t: 'Reventarle la autoridad', fx: { notoriedad: 10, reputacion: -8 }, flag: 'insubordinado' }] },
    { id: 'e3_captura', min: 18, max: 75, w: 8, t: 'Te capturan en una escaramuza cerca de {p}.',
      c: [{ t: 'Aguantar el interrogatorio', fx: { cordura: -16, salud: -14, reputacion: 16 } },
          { t: 'Contar algo pequeño', fx: { salud: -6, alineamiento: -10, cordura: -8 } },
          { t: 'Intentar la fuga', combate: { dif: 66 } },
          { t: 'Cambiar de bando', fx: { alineamiento: -18, notoriedad: 14 }, flag: 'cambio_bando' }] }
  ]);

  /* ══════════════════════════ SALUD / POLÍTICA / EXPLORACIÓN ══════════════════════════ */
  A('salud', [
    { id: 'h3_espalda', min: 30, max: 95, w: 9, t: 'La espalda te avisa cada mañana.',
      c: [{ t: 'Hacer caso y cambiar de rutina', fx: { salud: 12, fisico: 6, creditos: -4000 } },
          { t: 'Calmantes', fx: { salud: -8, cordura: 6 }, flag: 'automedicado' },
          { t: 'Operarte', coste: 22000, fx: { salud: 18 } },
          { t: 'Aguantar', fx: { salud: -8, fisico: -6 } }] },
    { id: 'h3_ansiedad', min: 16, max: 95, w: 9, t: 'Te cuesta respirar en sitios con gente desde hace meses.',
      c: [{ t: 'Tratarlo', coste: 8000, fx: { cordura: 18 } },
          { t: 'Evitar esos sitios', fx: { cordura: 4, carisma: -8 } },
          { t: 'Forzarte a ir igual', fx: { cordura: -6, carisma: 8, fisico: 4 } },
          { t: 'Hablarlo con {a}', conEsa: 12, notaRel: 'le contaste lo que te pasa', fx: { cordura: 12 } }] },
    { id: 'h3_veneno', min: 12, max: 95, w: 8, t: 'Te ha picado algo de {p} y la mano se te está poniendo rara.',
      c: [{ t: 'Corriendo a la clínica', clinica: true },
          { t: 'Remedio de los {g}', fx: { salud: 6, cordura: 4, intelecto: 6 } },
          { t: 'Cortar por lo sano', fx: { salud: -20, fisico: -8 }, cibernetica: 'prótesis de mano' },
          { t: 'Esperar a ver', fx: { salud: -18, cordura: -8 } }] }
  ]);

  A('politica', [
    { id: 'q3_censura', min: 20, max: 95, w: 8, t: 'Te piden que retires una publicación incómoda en {p}.',
      c: [{ t: 'Retirarla', fx: { alineamiento: -14, reputacion: -8, cordura: -6 } },
          { t: 'Negarte', fx: { alineamiento: 16, notoriedad: 12, reputacion: 10 }, buscado: 12 },
          { t: 'Negociar una corrección', fx: { carisma: 12, intelecto: 8 } },
          { t: 'Publicar más', fx: { notoriedad: 20, alineamiento: 14 }, buscado: 20 }] },
    { id: 'q3_alianza_dudosa', min: 22, max: 95, w: 8, t: 'Para ganar te hace falta el apoyo de gente que da vergüenza.',
      c: [{ t: 'Aceptarlo', fx: { reputacion: 12, alineamiento: -18 } },
          { t: 'Perder limpiamente', fx: { alineamiento: 18, reputacion: -8, cordura: 10 } },
          { t: 'Aceptarlo y romperlo después', fx: { intelecto: 12, alineamiento: -12, notoriedad: 10 } },
          { t: 'Buscar otro camino', fx: { carisma: 14, cordura: -6 } }] },
    { id: 'q3_promesa', min: 20, max: 95, w: 8, t: 'Prometiste algo que ahora no se puede hacer.',
      c: [{ t: 'Explicarlo en público', fx: { alineamiento: 14, reputacion: -6, carisma: 10 } },
          { t: 'Hacer algo parecido y llamarlo igual', fx: { intelecto: 8, alineamiento: -10 } },
          { t: 'Cumplirla aunque arruine otras cosas', fx: { reputacion: 16, creditos: -30000 } },
          { t: 'Hacer como que nunca lo dijiste', fx: { alineamiento: -16, reputacion: -12 } }] }
  ]);

  A('exploracion', [
    { id: 'x3_luna', min: 14, max: 90, w: 8, t: 'Una de las lunas de {p} tiene algo que no se ve desde abajo.',
      c: [{ t: 'Subir a mirar', req: conNave, fx: { intelecto: 12, creditos: 10000, naveEstado: -8 } },
          { t: 'Pagar a alguien para que suba', coste: 8000, fx: { intelecto: 8 } },
          { t: 'Estudiarlo con instrumentos', fx: { intelecto: 14 } },
          { t: 'Dejarlo estar', fx: {} }] },
    { id: 'x3_fosil', min: 12, max: 90, w: 8, t: 'Aparecen huesos enormes en una obra de {l}.',
      c: [{ t: 'Parar la obra y avisar', fx: { alineamiento: 14, intelecto: 10, reputacion: 8 } },
          { t: 'Venderlos', fx: { creditos: 20000, alineamiento: -14 } },
          { t: 'Quedarte uno', fx: { cordura: 6 }, item: 'un colmillo fósil' },
          { t: 'Que sigan cavando', fx: { creditos: 3000, alineamiento: -8 } }] },
    { id: 'x3_faro', min: 14, max: 90, w: 8, t: 'Hay una baliza automática en el sistema de {p} que lleva siglos emitiendo.',
      c: [{ t: 'Descifrar el mensaje', fx: { intelecto: 16 } },
          { t: 'Seguir su origen', req: conNave, fx: { intelecto: 10, creditos: 14000, naveEstado: -10 } },
          { t: 'Apagarla', fx: { intelecto: 6, alineamiento: -8 } },
          { t: 'Venderla como chatarra', fx: { creditos: 9000, alineamiento: -10 } }] }
  ]);

  /* ══════════════════════════ ACCIÓN / FORMACIÓN ══════════════════════════ */
  A('accion', [
    { id: 'a3_rehen', min: 16, max: 85, w: 9, t: 'Alguien retiene a tres personas dentro de un local de {l}.',
      c: [{ t: 'Entrar', combate: { dif: 64 }, fx: { alineamiento: 14 } },
          { t: 'Hablar con él', fx: { carisma: 18, cordura: -8, alineamiento: 16, reputacion: 14 } },
          { t: 'Entrar por atrás sin que te vea', fx: { destreza: 14, alineamiento: 12 } },
          { t: 'Dejarlo a los profesionales', fx: {} }] },
    { id: 'a3_carrera_droides', min: 12, max: 85, w: 8, t: 'Hay peleas de droides en un sótano de {l}.',
      c: [{ t: 'Apostar', mesa: 'sabacc' },
          { t: 'Meter el tuyo', fx: { intelecto: 10, creditos: 8000 } },
          { t: 'Reventar el negocio', fx: { alineamiento: 12, notoriedad: 10 }, buscado: 10 },
          { t: 'Arreglar los droides que quedan', fx: { intelecto: 12, creditos: 4000 } }] },
    { id: 'a3_naufrago', min: 12, max: 85, w: 8, t: 'El mar (o lo que haga de mar en {p}) se ha llevado a alguien.',
      c: [{ t: 'Meterte a por él', fx: { fisico: 12, salud: -14, alineamiento: 18 } },
          { t: 'Buscar una cuerda y hacerlo bien', fx: { intelecto: 12, alineamiento: 14 } },
          { t: 'Pedir ayuda', fx: { carisma: 6, alineamiento: 6 } },
          { t: 'No sabes nadar', fx: { cordura: -8 } }] }
  ]);

  A('formacion', [
    { id: 'y3_taller_oficio', min: 12, max: 80, w: 8, t: 'Un taller de {o} de {l} admite aprendices por dos años.',
      c: [{ t: 'Entrar', fx: { destreza: 14, intelecto: 8, creditos: -3000 }, habilidad: 'oficio' },
          { t: 'Entrar y aprender solo lo que te sirva', fx: { destreza: 10 } },
          { t: 'Entrar para copiarles el método', fx: { intelecto: 12, alineamiento: -10 } },
          { t: 'Pasar', fx: {} }] },
    { id: 'y3_curso_caro', min: 18, max: 80, w: 8, t: 'Un curso corto y carísimo que abre puertas en {p}.',
      c: [{ t: 'Pagarlo', coste: 22000, fx: { intelecto: 14, reputacion: 10 } },
          { t: 'Colarte de oyente', fx: { intelecto: 10, destreza: 6 } },
          { t: 'Pedir una beca', fx: { carisma: 10, intelecto: 10, creditos: -4000 } },
          { t: 'Aprenderlo por tu cuenta', fx: { intelecto: 12, cordura: -6 } }] },
    { id: 'y3_biblioteca_prohibida', min: 16, max: 90, w: 8, t: 'En {p} hay libros que no se pueden leer.',
      c: [{ t: 'Leerlos igual', fx: { intelecto: 16, cordura: -6 }, buscado: 12 },
          { t: 'Copiarlos y difundirlos', fx: { intelecto: 12, alineamiento: 14, notoriedad: 14 }, buscado: 22 },
          { t: 'Preguntar por qué están prohibidos', fx: { intelecto: 10, notoriedad: 6 } },
          { t: 'Respetar la prohibición', fx: {} }] }
  ]);

})(typeof window !== 'undefined' ? window : globalThis);

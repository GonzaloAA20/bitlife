/* ============================================================
   HOLOVIDA :: CUARTA TANDA
   Última pasada de contenido: se refuerzan los menús que seguían
   siendo los más cortos (viaje, acción, exploración, la Fuerza,
   política y escuadrón) y se añaden eventos anuales nuevos.
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

  /* ══════════════════════════ VIAJE ══════════════════════════ */
  A('viaje', [
    { id: 'v4_contrabando_maletas', min: 16, max: 95, w: 9, t: 'Te ofrecen 8.000 por llevar un bulto pequeño hasta {x}.',
      c: [{ t: 'Llevarlo', fx: { creditos: 8000 }, buscado: 14 },
          { t: 'Llevarlo después de abrirlo', fx: { creditos: 8000, intelecto: 8 }, buscado: 10 },
          { t: 'Negarte', fx: {} },
          { t: 'Aceptar y entregarlo a las aduanas', fx: { alineamiento: 12, reputacion: 8 }, buscado: 18 }] },
    { id: 'v4_transbordo', min: 12, max: 95, w: 9, t: 'Doce horas de escala en un puerto de {x} que no conoces.',
      c: [{ t: 'Salir a ver la ciudad', fx: { cordura: 10, intelecto: 6 } },
          { t: 'Quedarte en la terminal', fx: { cordura: -2, creditos: 500 } },
          { t: 'Buscar una partida', mesa: true },
          { t: 'Dormir', fx: { salud: 6, cordura: 6 } }] },
    { id: 'v4_billete_ajeno', min: 14, max: 95, w: 8, t: 'Alguien se ha dejado un billete para {x} encima del mostrador.',
      c: [{ t: 'Devolverlo', fx: { alineamiento: 14, carisma: 6 } },
          { t: 'Usarlo', mueveA: '{x}', motivo: 'con el billete de otro', fx: { alineamiento: -10, creditos: 4000 } },
          { t: 'Venderlo', fx: { creditos: 3000, alineamiento: -8 } },
          { t: 'Dejarlo donde estaba', fx: {} }] },
    { id: 'v4_compañia', min: 16, max: 95, w: 8, t: 'Alguien te propone hacer el viaje a {x} juntos y repartir gastos.',
      c: [{ t: 'Aceptar', mueveA: '{x}', motivo: 'acompañado', fx: { creditos: -3000, carisma: 8 }, rel: { tipo: 'contacto', afecto: 30 } },
          { t: 'Aceptar con reservas', mueveA: '{x}', motivo: 'con alguien que acabas de conocer', fx: { creditos: -4000, intelecto: 6 } },
          { t: 'Ir por tu cuenta', fx: { creditos: -7000, cordura: 4 } },
          { t: 'No viajar', fx: {} }] },
    { id: 'v4_tumba', min: 20, max: 95, w: 8, t: 'Hay alguien tuyo enterrado en {x} y nunca has ido.',
      c: [{ t: 'Ir', mueveA: '{x}', motivo: 'a visitar una tumba', fx: { cordura: 14, creditos: -6000 } },
          { t: 'Mandar flores', fx: { creditos: -800, cordura: 4 } },
          { t: 'Ir y traértelo', fx: { cordura: 10, creditos: -14000, alineamiento: 8 } },
          { t: 'No ir', fx: { cordura: -8 } }] },
    { id: 'v4_hiperespacio', min: 16, max: 95, w: 8, req: conNave, t: 'Puedes hacer el salto a {x} por una ruta que no tiene balizas.',
      c: [{ t: 'Saltar', fx: { destreza: 12, creditos: 8000, naveEstado: -10 }, peligro: 18 },
          { t: 'Saltar con el navegador al máximo', fx: { intelecto: 10, destreza: 8, creditos: 5000 } },
          { t: 'Ir por la ruta larga', fx: { creditos: -4000, cordura: 4 } },
          { t: 'Contratar un navegante local', coste: 6000, fx: { carisma: 6, intelecto: 6 } }] },
    { id: 'v4_frontera_salvaje', min: 18, max: 95, w: 8, t: 'Más allá de {x} empieza el Borde y nadie garantiza nada.',
      c: [{ t: 'Ir', mueveA: '{x}', motivo: 'hacia el Borde', fx: { cordura: 10, notoriedad: 6 } },
          { t: 'Ir armado hasta los dientes', fx: { creditos: -12000, fisico: 6 }, mueveA: '{x}', motivo: 'preparado para lo peor' },
          { t: 'Buscar quién ha vuelto de allí', fx: { intelecto: 12, carisma: 8 } },
          { t: 'Quedarte donde hay ley', fx: { cordura: 4 } }] }
  ]);

  /* ══════════════════════════ ACCIÓN ══════════════════════════ */
  A('accion', [
    { id: 'a4_apuesta_fisica', min: 14, max: 80, w: 9, t: 'En {l} se apuesta a ver quién aguanta más.',
      c: [{ t: 'Aguantar tú', fx: { fisico: 12, salud: -12, creditos: 6000 } },
          { t: 'Apostar por otro', mesa: 'dados' },
          { t: 'Amañarlo', fx: { creditos: 14000, alineamiento: -14 }, buscado: 8 },
          { t: 'Mirar', fx: { cordura: 4 } }] },
    { id: 'a4_cazador_furtivo', min: 14, max: 85, w: 8, t: 'Alguien está cazando {b} protegidos en {p}.',
      c: [{ t: 'Pararle', combate: { dif: 50 }, fx: { alineamiento: 14 } },
          { t: 'Denunciarle', fx: { alineamiento: 12, reputacion: 8 }, buscado: 6 },
          { t: 'Comprarle la carne', fx: { creditos: -3000, salud: 6, alineamiento: -8 } },
          { t: 'Unirte', fx: { creditos: 12000, alineamiento: -16, destreza: 8 }, buscado: 12 }] },
    { id: 'a4_desactivar', min: 16, max: 85, w: 8, t: 'Hay un artefacto en {l} y la gente sigue paseando alrededor.',
      c: [{ t: 'Desactivarlo tú', fx: { intelecto: 14, alineamiento: 16, salud: -10 }, peligro: 25 },
          { t: 'Despejar la zona', fx: { carisma: 14, alineamiento: 16, reputacion: 12 } },
          { t: 'Avisar y alejarte', fx: { alineamiento: 8 } },
          { t: 'Grabarlo desde lejos', fx: { notoriedad: 8, alineamiento: -10 } }] },
    { id: 'a4_caida', min: 12, max: 85, w: 8, t: 'Alguien se queda colgado del borde de {h}.',
      c: [{ t: 'Agarrarle', fx: { fisico: 12, alineamiento: 18, salud: -8 } },
          { t: 'Buscar algo con lo que alcanzarle', fx: { intelecto: 12, alineamiento: 14 } },
          { t: 'Tirar de él con la Fuerza', req: sensible, fx: { fuerza: 14, alineamiento: 16, reputacion: 10 }, ojo: true },
          { t: 'Gritar pidiendo ayuda', fx: { cordura: -8 } }] },
    { id: 'a4_estampida', min: 10, max: 85, w: 8, t: 'Una manada de {b} viene de frente por la calle de {l}.',
      c: [{ t: 'Meterte en un portal', fx: { destreza: 8 } },
          { t: 'Desviarlas', fx: { fisico: 10, intelecto: 10, reputacion: 12, salud: -8 } },
          { t: 'Sacar a la gente del camino', fx: { alineamiento: 18, salud: -12, reputacion: 14 } },
          { t: 'Subirte a una y ver qué pasa', fx: { destreza: 14, salud: -16, notoriedad: 12 } }] }
  ]);

  /* ══════════════════════════ EXPLORACIÓN ══════════════════════════ */
  A('exploracion', [
    { id: 'x4_isla', min: 12, max: 90, w: 8, t: 'Hay una parte de {p} donde la gente del lugar no entra.',
      c: [{ t: 'Entrar', fx: { intelecto: 12, cordura: -8, destreza: 8 }, peligro: 15 },
          { t: 'Preguntar por qué no entran', fx: { intelecto: 12, carisma: 8 } },
          { t: 'Entrar con guía de los {g}', coste: 5000, fx: { intelecto: 14, carisma: 8 } },
          { t: 'Respetarlo', fx: { alineamiento: 10, cordura: 6 } }] },
    { id: 'x4_nucleo', min: 14, max: 90, w: 8, t: 'Las galerías bajo {l} llegan más hondo de lo que dicen los planos.',
      c: [{ t: 'Bajar hasta el fondo', fx: { intelecto: 14, salud: -12, creditos: 12000 } },
          { t: 'Cartografiar lo que puedas', fx: { intelecto: 12, creditos: 6000 } },
          { t: 'Buscar mineral', fx: { creditos: 18000, salud: -10, fisico: 8 } },
          { t: 'Sellar la entrada', fx: { alineamiento: 8, fisico: 6 } }] },
    { id: 'x4_orbita', min: 16, max: 90, w: 8, req: conNave, t: 'Hay chatarra en órbita de {p} que lleva ahí desde antes de la ciudad.',
      c: [{ t: 'Recogerla y venderla', fx: { creditos: 16000, naveEstado: -6 } },
          { t: 'Buscar de qué nave era', fx: { intelecto: 14 } },
          { t: 'Avisar de que es peligrosa', fx: { alineamiento: 10, reputacion: 8 } },
          { t: 'Dejarla', fx: {} }] },
    { id: 'x4_glaciar', min: 14, max: 90, w: 8, t: 'El hielo de {p} se retira y deja algo a la vista.',
      c: [{ t: 'Ir a mirar', fx: { intelecto: 12, salud: -8 } },
          { t: 'Avisar a un instituto', fx: { alineamiento: 12, reputacion: 10, creditos: 6000 } },
          { t: 'Sacarlo y venderlo', fx: { creditos: 24000, alineamiento: -14 } },
          { t: 'Volver a taparlo', fx: { alineamiento: 10, cordura: 6 } }] }
  ]);

  /* ══════════════════════════ FUERZA ══════════════════════════ */
  A('fuerza', [
    { id: 'w4_telepatia', min: 12, max: 95, w: 9, req: sensible, t: 'Puedes oír lo que piensa la gente de {l} si te concentras.',
      c: [{ t: 'Escuchar', fx: { fuerza: 12, cordura: -10, intelecto: 8 } },
          { t: 'Escuchar solo a quien te importa', fx: { fuerza: 8, cordura: -4 } },
          { t: 'Cerrarte del todo', fx: { cordura: 12, fuerza: -4 } },
          { t: 'Usarlo para ganar dinero', fx: { creditos: 22000, alineamiento: -16, fuerza: 8 } }] },
    { id: 'w4_objeto_perdido', min: 10, max: 95, w: 8, req: sensible, t: 'Alguien de {l} ha perdido algo que le importa mucho.',
      c: [{ t: 'Encontrarlo con la Fuerza', fx: { fuerza: 10, alineamiento: 12, reputacion: 8 } },
          { t: 'Buscarlo como todo el mundo', fx: { intelecto: 8, alineamiento: 8 } },
          { t: 'Cobrar por encontrarlo', fx: { creditos: 6000, fuerza: 6, alineamiento: -6 } },
          { t: 'Quedártelo tú', fx: { alineamiento: -18, creditos: 8000 } }] },
    { id: 'w4_maestro_sith', min: 14, max: 95, w: 8, req: function (s) { return s.trabajo === 'sith'; },
      t: 'Tu maestro te pone a prueba y no dice de qué va la prueba.',
      c: [{ t: 'Obedecer al pie de la letra', fx: { fuerza: 12, alineamiento: -12, cordura: -6 } },
          { t: 'Hacerlo a tu manera', fx: { fuerza: 14, carisma: 8, cordura: -4 } },
          { t: 'Negarte', fx: { cordura: 10, fuerza: -6 }, peligro: 25 },
          { t: 'Intentar matarle', combate: { dif: 88, duelo: true, sable: true, aMuerte: true } }] },
    { id: 'w4_equilibrio', min: 16, max: 95, w: 8, req: sensible,
      t: 'Llevas años tirando de un lado y del otro y ya no sabes de qué lado estás.',
      c: [{ t: 'Elegir la luz de una vez', fx: { alineamiento: 25, fuerza: 8, cordura: 10 } },
          { t: 'Elegir la sombra de una vez', fx: { alineamiento: -25, fuerza: 14, cordura: -8 } },
          { t: 'No elegir', fx: { fuerza: 10, cordura: -6, intelecto: 10 }, flag: 'gris' },
          { t: 'Dejar la Fuerza en paz una temporada', fx: { cordura: 16, fuerza: -10 } }] }
  ]);

  /* ══════════════════════════ POLÍTICA ══════════════════════════ */
  A('politica', [
    { id: 'k4_mocion', min: 20, max: 95, w: 8, t: 'Hay una moción contra ti y los números están muy justos.',
      c: [{ t: 'Convencer uno a uno', fx: { carisma: 16, cordura: -8 } },
          { t: 'Comprar los votos que faltan', coste: 40000, fx: { alineamiento: -20 } },
          { t: 'Dejar que se vote', fx: { cordura: 8, alineamiento: 12 } },
          { t: 'Dimitir antes', dejarCargo: true, fx: { alineamiento: 14, cordura: 12 } }] },
    { id: 'k4_reforma', min: 22, max: 95, w: 8, t: 'Puedes cambiar una ley que lleva doscientos años igual.',
      c: [{ t: 'Cambiarla del todo', fx: { reputacion: 18, alineamiento: 14, cordura: -10 } },
          { t: 'Cambiarla a medias para que pase', fx: { intelecto: 14, reputacion: 10 } },
          { t: 'Cambiarla en tu beneficio', fx: { creditos: 50000, alineamiento: -26 } },
          { t: 'Dejarla como está', fx: {} }] },
    { id: 'k4_emergencia', min: 20, max: 95, w: 8, t: 'Se pide poderes de emergencia en {p} y tu voto cuenta.',
      c: [{ t: 'Votar a favor', fx: { alineamiento: -18, reputacion: 8 }, faccion: 'auto+20' },
          { t: 'Votar en contra', fx: { alineamiento: 18, reputacion: -6, notoriedad: 10 } },
          { t: 'Abstenerte', fx: { cordura: -6, reputacion: -8 } },
          { t: 'Votar a favor con fecha de caducidad', fx: { intelecto: 16, carisma: 12, alineamiento: 6 } }] }
  ]);

  /* ══════════════════════════ ESCUADRÓN ══════════════════════════ */
  A('escuadron', [
    { id: 'q4_flanco', min: 16, max: 75, w: 9, t: 'Vuestro flanco se ha quedado sin cobertura.',
      c: [{ t: 'Cubrirlo tú', fx: { fisico: 10, reputacion: 12, salud: -14 } },
          { t: 'Replegaros', fx: { intelecto: 10, reputacion: -6 } },
          { t: 'Pedir refuerzos y aguantar', fx: { cordura: -8, fisico: 6 }, peligro: 20 },
          { t: 'Buscar tú la salida y avisar', fx: { destreza: 10, alineamiento: 10, reputacion: 10 } }] },
    { id: 'q4_botin', min: 16, max: 75, w: 8, t: 'Después de la posición tomada, hay cosas de valor por el suelo.',
      c: [{ t: 'No tocar nada', fx: { alineamiento: 12, reputacion: 6 } },
          { t: 'Coger algo pequeño', fx: { creditos: 6000, alineamiento: -6 } },
          { t: 'Repartirlo con la unidad', fx: { creditos: 4000, carisma: 12, reputacion: 8 } },
          { t: 'Llevarte lo mejor', fx: { creditos: 20000, alineamiento: -18, reputacion: -8 } }] },
    { id: 'q4_carta_casa', min: 16, max: 75, w: 8, t: 'Llega correo del frente y hay una carta para alguien que ya no está.',
      c: [{ t: 'Contestar tú a la familia', fx: { alineamiento: 18, cordura: -10, carisma: 8 } },
          { t: 'Devolverla sin abrir', fx: { alineamiento: 6 } },
          { t: 'Leerla', fx: { cordura: -12, intelecto: 4 } },
          { t: 'Guardarla para dársela en persona', fx: { alineamiento: 14, cordura: -6 } }] },
    { id: 'q4_orden_66', min: 12, max: 75, w: 9,
      req: function (s) { return (s.especie === 'clon' || s.especie === 'clon_nulo') && s.era === 'guerras_clon'; },
      t: 'Notas algo en la cabeza que no estaba ayer. Un zumbido bajo, constante.',
      c: [{ t: 'Ir al médico de la unidad', fx: { salud: 4, intelecto: 6 }, flag: 'sospecha_chip' },
          { t: 'Buscar a quien te lo pueda quitar', fx: { creditos: -20000, cordura: 12 }, flag: 'chip_fuera' },
          { t: 'No contárselo a nadie', fx: { cordura: -10 }, flag: 'sospecha_chip' },
          { t: 'Contárselo a un jedi', fx: { alineamiento: 14, cordura: 8 }, flag: 'sospecha_chip' }] }
  ]);

  /* ══════════════════════════ EVENTOS ANUALES ══════════════════════════ */
  V([
    { id: 'y4_mudanza_forzada', min: 16, max: 95, w: 9, t: 'Te echan del sitio donde vives en {p}.',
      c: [{ t: 'Buscar algo peor pero tuyo', fx: { creditos: -6000, cordura: -4 } },
          { t: 'Quedarte en casa de {a}', conEsa: -8, notaRel: 'te metiste en su casa', fx: { creditos: 2000, cordura: -4 } },
          { t: 'Irte de {p}', mover: 'cerca', motivo: 'sin sitio donde vivir', fx: { cordura: -6 } },
          { t: 'Pelearlo por lo legal', fx: { intelecto: 10, creditos: -4000, cordura: -6 } }] },
    { id: 'y4_reencuentro_enemigo', min: 25, max: 95, w: 8, t: 'Te cruzas con alguien a quien hiciste daño hace años.',
      c: [{ t: 'Pedirle perdón', fx: { alineamiento: 16, cordura: 14 } },
          { t: 'Hacer como que no te acuerdas', fx: { cordura: -8 } },
          { t: 'Compensarle con dinero', fx: { creditos: -15000, alineamiento: 10 } },
          { t: 'Rematar lo que empezaste', fx: { alineamiento: -20, notoriedad: 12 }, combate: { dif: 52 } }] },
    { id: 'y4_oportunidad_unica', min: 20, max: 80, w: 9, t: 'Se te presenta algo que solo pasa una vez y hay que decidir hoy.',
      c: [{ t: 'Lanzarte', r: [{ p: 0.4, t: 'Sale bien y te cambia la vida.', fx: { creditos: 40000, reputacion: 16, cordura: 12 } },
                                { p: 0.6, t: 'Sale mal y lo pagas.', fx: { creditos: -18000, cordura: -10, intelecto: 8 } }] },
          { t: 'Estudiarlo un día más y perderlo', fx: { intelecto: 8, cordura: -6 } },
          { t: 'Meter a alguien más contigo', fx: { creditos: 15000, carisma: 10 }, rel: { tipo: 'socio', afecto: 35 } },
          { t: 'Dejarlo pasar', fx: { cordura: 4 } }] },
    { id: 'y4_gente_del_puerto', min: 14, max: 95, w: 9, t: 'En el puerto de {p} siempre hay alguien buscando manos.',
      c: [{ t: 'Descargar carga un mes', fx: { creditos: 5000, fisico: 10, salud: -6 } },
          { t: 'Hacer de intérprete', fx: { creditos: 6000, carisma: 8, intelecto: 6 } },
          { t: 'Vigilar cargamentos', fx: { creditos: 7000, notoriedad: 6 } },
          { t: 'Buscar algo mejor', fx: { intelecto: 6 } }] },
    { id: 'y4_ola_calor', min: 8, max: 95, w: 8, t: '{t} en {p} un mes entero y no hay dónde meterse.',
      c: [{ t: 'Aguantar', fx: { salud: -10, fisico: 6 } },
          { t: 'Gastarte lo que sea en refrigeración', fx: { creditos: -8000, salud: 6 } },
          { t: 'Montar un negocio con eso', fx: { creditos: 14000, intelecto: 8 } },
          { t: 'Irte al norte', mover: 'cerca', motivo: 'buscando aire', fx: { creditos: -4000, cordura: 6 } }] },
    { id: 'y4_perdida', min: 20, max: 95, w: 9, t: 'Pierdes algo que llevabas encima desde hace años.',
      c: [{ t: 'Buscarlo hasta encontrarlo', fx: { cordura: 8, creditos: -2000 } },
          { t: 'Sustituirlo', fx: { creditos: -6000, cordura: 4 } },
          { t: 'Dejarlo ir', fx: { cordura: -6, alineamiento: 6 } },
          { t: 'Acusar a alguien', conEsa: -20, notaRel: 'le acusaste sin pruebas', fx: { cordura: -8 } }] },
    { id: 'y4_carta_anonima', min: 18, max: 95, w: 8, t: 'Te llega un mensaje anónimo que sabe demasiado de ti.',
      c: [{ t: 'Contestar', fx: { intelecto: 10, cordura: -6 } },
          { t: 'Averiguar quién es', fx: { intelecto: 14, notoriedad: 6 } },
          { t: 'Borrarlo', fx: { cordura: 4 } },
          { t: 'Enseñárselo a alguien de confianza', conEsa: 8, notaRel: 'le enseñaste el mensaje', fx: { cordura: 8 } }] },
    { id: 'y4_puesto_publico', min: 25, max: 85, w: 8, t: 'Te ofrecen un cargo pequeño en la administración de {p}.',
      c: [{ t: 'Aceptarlo', empleoPolitico: 0, fx: { reputacion: 8 } },
          { t: 'Aceptarlo solo por el sueldo', empleoPolitico: 0, fx: { alineamiento: -8 } },
          { t: 'Rechazarlo', fx: { cordura: 6 } },
          { t: 'Proponer a otro mejor', fx: { alineamiento: 14, carisma: 10 } }] },
    { id: 'y4_arte_propio', min: 14, max: 95, w: 8, t: 'Llevas tiempo haciendo algo tuyo y alguien lo ha visto.',
      c: [{ t: 'Enseñarlo en público', fx: { carisma: 12, reputacion: 10, cordura: 10 } },
          { t: 'Venderlo', fx: { creditos: 9000, carisma: 6 } },
          { t: 'Seguir haciéndolo para ti', fx: { cordura: 14 } },
          { t: 'Dejarlo', fx: { cordura: -8 } }] },
    { id: 'y4_animal_compania', min: 12, max: 95, w: 7, req: function (s) { return !!s.flags.mascota; },
      t: 'Tu animal está enfermo y el tratamiento no es barato.',
      c: [{ t: 'Pagarlo', coste: 9000, fx: { cordura: 10, alineamiento: 10 } },
          { t: 'Cuidarle tú', fx: { cordura: 6, intelecto: 6, salud: -4 } },
          { t: 'Dejarle ir', fx: { cordura: -14, alineamiento: 4 } },
          { t: 'Buscar un remedio de los {g}', fx: { intelecto: 8, cordura: 6 } }] },
    { id: 'y4_reputacion_barrio', min: 16, max: 95, w: 8, t: 'En {l} se ha corrido que eres alguien a quien acudir.',
      c: [{ t: 'Estar disponible', fx: { reputacion: 16, cordura: -6, alineamiento: 12 } },
          { t: 'Cobrar por ello', fx: { creditos: 12000, reputacion: 8 } },
          { t: 'Poner límites', fx: { cordura: 10, carisma: 8 } },
          { t: 'Desaparecer del mapa', fx: { reputacion: -12, cordura: 8 } }] },
    { id: 'y4_viejo_enemigo_muere', min: 30, max: 95, w: 7, t: 'Se ha muerto {r}.',
      c: [{ t: 'Ir al entierro', fx: { cordura: 10, alineamiento: 10 } },
          { t: 'Alegrarte', fx: { cordura: -6, alineamiento: -10 } },
          { t: 'Ayudar a su familia', fx: { alineamiento: 20, reputacion: 12, creditos: -8000 } },
          { t: 'No sentir nada', fx: { cordura: -4 } }] },
    { id: 'y4_ofrecen_gremio', min: 18, max: 80, w: 8, req: function (s) { return !s.flags.gremio_caza; },
      t: 'Alguien te comenta que en {l} el Gremio de Cazadores admite a gente como tú.',
      c: [{ t: 'Ir a apuntarte', flag: 'gremio_caza', fx: { notoriedad: 10, reputacion: 6 } },
          { t: 'Preguntar qué implica', fx: { intelecto: 10 } },
          { t: 'No es lo tuyo', fx: {} },
          { t: 'Ir a ver quién anda por allí', fx: { carisma: 8, notoriedad: 6 } }] },
    { id: 'y4_alguien_te_busca', min: 18, max: 95, w: 8, req: function (s) { return s.buscado > 15; },
      t: 'Han estado preguntando por ti en {l} y no eran de la ley.',
      c: [{ t: 'Adelantarte y buscarles tú', fx: { intelecto: 10, notoriedad: 10 }, combate: { dif: 58 } },
          { t: 'Cambiar de barrio', fx: { creditos: -5000, notoriedad: -8 } },
          { t: 'Pagar por saber quién los manda', coste: 8000, fx: { intelecto: 14 } },
          { t: 'Esperar', fx: { cordura: -10 }, peligro: 20 }] },
    { id: 'y4_paisano_famoso', min: 16, max: 95, w: 7, t: 'Alguien de {p} ha triunfado fuera y vuelve de visita.',
      c: [{ t: 'Ir a saludarle', fx: { carisma: 8, reputacion: 6 }, rel: { tipo: 'contacto', afecto: 25 } },
          { t: 'Pedirle ayuda', fx: { creditos: 10000, reputacion: -4 } },
          { t: 'Recordarle de dónde viene', fx: { carisma: 10, notoriedad: 6 } },
          { t: 'Pasar', fx: {} }] },
    { id: 'y4_incendio_negocio', min: 20, max: 90, w: 7, req: function (s) { return !!s.flags.tiene_local; },
      t: 'Arde tu local en {l}.',
      c: [{ t: 'Reconstruirlo', fx: { creditos: -30000, cordura: -8, fisico: 6 } },
          { t: 'Cobrar el seguro', fx: { creditos: 25000 }, flag: 'sospecha_seguro' },
          { t: 'Buscar quién lo hizo', fx: { intelecto: 12, notoriedad: 8 } },
          { t: 'Dejarlo y cambiar de vida', fx: { cordura: 10, creditos: -8000 } }] }
  ]);

})(typeof window !== 'undefined' ? window : globalThis);

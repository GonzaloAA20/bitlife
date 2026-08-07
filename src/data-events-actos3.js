/* ============================================================
   HOLOVIDA :: tercer bloque de eventos por actividad
   Cada vía con mucho más fondo y respetando la edad.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };
  const conTrabajo = function (s) { return !!s.trabajo; };

  /* ═══════════ TRABAJO ═══════════ */
  push(SW.ACTOS.trabajo, [
    { id: 't3_cliente', min: 16, max: 200, w: 8, req: conTrabajo, slots: { n: 'nombre' }, t: 'Un cliente, {n}, monta un escándalo y exige hablar con quien mande.',
      c: [{ t: 'Atenderle tú con calma', fx: { carisma: 10, cordura: -4 }, rendimiento: 10, out: 'Se va contento y pide por ti la próxima vez.' },
          { t: 'Echarle del local', fx: { fisico: 4, reputacion: -5, carisma: -3 }, out: 'Silencio en la sala. Algunos aplauden por dentro.' },
          { t: 'Pasarle a tu jefe', fx: { cordura: 3, rendimiento: -5 }, out: 'Tu jefe lo resuelve en dos frases y te mira raro.' }] },
    { id: 't3_nocturno', min: 18, max: 200, w: 8, req: conTrabajo, t: 'Turnos de noche durante un año entero. Pagan un 40% más.',
      c: [{ t: 'Cogerlos todos', fx: { creditos: 'sueldo*0.4', salud: -10, cordura: -8 }, out: 'Ves poco el sol y menos a la gente.' },
          { t: 'Alternar', fx: { creditos: 'sueldo*0.2', salud: -4 }, out: 'El cuerpo se acostumbra a medias.' },
          { t: 'Rechazarlos', fx: { cordura: 6 }, rendimiento: -8, out: 'Se lo dan a otro. Se nota en la revisión.' }] },
    { id: 't3_formacion_empresa', min: 18, max: 200, w: 8, req: conTrabajo, t: 'La empresa paga formación a quien la pida. Casi nadie la pide.',
      c: [{ t: 'Pedirla y aprovecharla', fx: { intelecto: 12, reputacion: 5 }, rendimiento: 12, out: 'Vuelves sabiendo cosas que nadie más sabe ahí.' },
          { t: 'Pedirla para no trabajar dos semanas', fx: { cordura: 8, intelecto: 3 }, rendimiento: -5, out: 'Vacaciones encubiertas con diploma.' },
          { t: 'Ni enterarte', fx: {}, out: 'Se acaba el plazo.' }] },
    { id: 't3_competencia', min: 20, max: 200, w: 8, req: conTrabajo, t: 'La competencia te llama y ofrece más.',
      c: [{ t: 'Irte', fx: { creditos: 8000, cordura: -4 }, aumento: 0.4, out: 'Nuevo sitio, mismas mañanas.' },
          { t: 'Usarlo para negociar donde estás', r: [{ p: 0.55, t: 'Igualan la oferta.', fx: { carisma: 10 }, aumento: 0.35 },
               { p: 0.45, t: '"Pues que te vaya bien."', fx: { cordura: -8 }, despido: true }] },
          { t: 'Decir que no y contarlo', fx: { reputacion: 8, rendimiento: 10 }, out: 'Tu jefe lo recuerda cuando toca repartir.' }] },
    { id: 't3_accidente_laboral', min: 18, max: 200, w: 7, req: conTrabajo, t: 'Un accidente en el turno. Podría haber sido peor.',
      c: [{ t: 'Denunciar las condiciones', fx: { reputacion: 8, alineamiento: 12 }, rendimiento: -15, flag: 'sindicalista', out: 'Inspección. Cambian dos cosas de diez.' },
          { t: 'Callar y cobrar la compensación', fx: { creditos: 14000, alineamiento: -8 }, out: 'Firmas un papel que no lees entero.' },
          { t: 'Ayudar al herido y ya', fx: { alineamiento: 10, salud: -6 }, herida: { n: 'quemadura en el antebrazo', sev: 8 }, out: 'Te llevas lo tuyo por meter la mano.' }] },
    { id: 't3_reconocimiento', min: 25, max: 200, w: 7, req: conTrabajo, t: 'Te dan un premio interno. Placa, foto y nada más.',
      c: [{ t: 'Aceptarlo y pedir algo real', fx: { carisma: 10 }, aumento: 0.15, out: 'Se ríen y te suben algo. Funciona.' },
          { t: 'Agradecerlo sin más', fx: { reputacion: 6, cordura: 4 }, out: 'La placa acaba en un cajón.' },
          { t: 'Compartirlo con tu equipo', fx: { carisma: 12, reputacion: 8 }, rendimiento: 12, out: 'Se acuerdan de eso más que del premio.' }] }
  ]);

  /* ═══════════ FORMACIÓN ═══════════ */
  push(SW.ACTOS.formacion, [
    { id: 'f3_idiomas2', min: 10, max: 200, w: 8, t: 'Hay más lenguas en la galaxia de las que caben en una vida.',
      c: [{ t: 'Bocce, la lengua franca de los comerciantes', fx: { carisma: 8, intelecto: 5 }, idioma: 'bocce', out: 'En cualquier puerto te entienden.' },
          { t: 'Mando\'a', fx: { destreza: 4, carisma: 6 }, idioma: "mando'a", faccion: 'mandalorianos+10', out: 'Cambia cómo te miran ciertos cascos.' },
          { t: 'Ryl, de Ryloth', fx: { carisma: 8 }, idioma: 'ryl', out: 'Se abre medio Borde Exterior.' },
          { t: 'Ur-Kittât, la vieja lengua sith', fx: { intelecto: 10, fuerza: 5, cordura: -6 }, idioma: 'ur-kittât', out: 'Nadie la habla. Los textos, sí.' }] },
    { id: 'f3_academia_libre', min: 16, max: 200, w: 8, t: 'Hay clases abiertas y gratuitas en el centro cívico.',
      c: [{ t: 'Historia de la galaxia', fx: { intelecto: 10, cordura: 5 }, out: 'Entiendes por qué todo está como está.' },
          { t: 'Contabilidad y contratos', fx: { intelecto: 8, creditos: 3000 }, habilidad: 'negociador', out: 'Aburrido y rentable.' },
          { t: 'Primeros auxilios', fx: { intelecto: 6, alineamiento: 6 }, habilidad: 'medico', out: 'Algún día salvas a alguien con esto.' },
          { t: 'Mecánica básica', fx: { intelecto: 8, destreza: 4 }, habilidad: 'ingeniero', out: 'Dejas de pagar a otros por lo evidente.' }] },
    { id: 'f3_fracaso_estudio', min: 15, max: 200, w: 7, t: 'Llevas un año estudiando algo y no avanzas.',
      c: [{ t: 'Insistir un año más', r: [{ p: 0.5, t: 'De repente encaja todo.', fx: { intelecto: 14, cordura: 8 } },
               { p: 0.5, t: 'Sigue sin encajar.', fx: { cordura: -10, intelecto: 4 } }] },
          { t: 'Cambiar de enfoque', fx: { intelecto: 10, carisma: 4 }, out: 'Otro profesor, otro método, otra cosa.' },
          { t: 'Aceptar que no es lo tuyo', fx: { cordura: 10, intelecto: 3 }, out: 'Se te da bien otra cosa. Ya la encontrarás.' }] },
    { id: 'f3_biblioteca', min: 12, max: 200, w: 8, slots: { p: 'mundo' }, t: 'Hay un archivo abierto en {p} con material que casi nadie consulta.',
      c: [{ t: 'Pasar el año ahí dentro', fx: { intelecto: 14, cordura: 8, carisma: -5 }, out: 'Sales pálido y con tres cuadernos llenos.' },
          { t: 'Buscar algo muy concreto', fx: { intelecto: 8 }, r: [{ p: 0.4, t: 'Lo encuentras. Cambia tus planes.', fx: { intelecto: 8, fuerza: 5 }, item: true },
               { p: 0.6, t: 'No está. O lo han quitado.', fx: { cordura: -5, intelecto: 4 } }] },
          { t: 'Vender el acceso a quien lo necesite', fx: { creditos: 6000, notoriedad: 5 }, out: 'La información también es mercancía.' }] }
  ]);

  /* ═══════════ SOCIAL ═══════════ */
  push(SW.ACTOS.social, [
    { id: 's3_vecino', min: 14, max: 200, w: 8, slots: { n: 'nombre' }, t: 'Tu vecino {n} lleva semanas sin salir de casa.',
      c: [{ t: 'Llamar a su puerta', fx: { alineamiento: 12, cordura: 6 }, rel: { tipo: 'amigo', afecto: 40, quien: 'tu vecino' }, out: 'Estaba mal. Ahora hay alguien que lo sabe.' },
          { t: 'Dejarle comida en la puerta', fx: { alineamiento: 8, creditos: -400 }, out: 'La recoge. Nunca lo mencionáis.' },
          { t: 'No es asunto tuyo', fx: { cordura: -6 }, out: 'Meses después te enteras de cómo acabó.' }] },
    { id: 's3_traicion_amiga', min: 18, max: 200, w: 8, req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'amigo'; }); },
      t: 'Un amigo tuyo ha hecho algo indefendible.',
      c: [{ t: 'Decírselo a la cara', fx: { carisma: 10, alineamiento: 12, cordura: -4 }, relTodas: -10, out: 'No le gusta. Le hace falta.' },
          { t: 'Apoyarle igualmente', fx: { alineamiento: -10, cordura: -6 }, relTodas: 20, out: 'La lealtad también tiene lados feos.' },
          { t: 'Alejarte sin explicaciones', fx: { cordura: -8 }, cortarRel: true, out: 'Se entera por otros de que ya no estás.' }] },
    { id: 's3_reunion_antiguos', min: 25, max: 200, w: 8, t: 'Reunión de los de tu promoción, veinte años después.',
      c: [{ t: 'Ir y disfrutarlo', fx: { cordura: 12, carisma: 8, creditos: -1500 }, nuevaRel: true, out: 'Todos estáis peor y mejor a la vez.' },
          { t: 'Ir a presumir', fx: { carisma: 6, reputacion: 6, cordura: -6 }, out: 'Funciona media hora.' },
          { t: 'No ir y mirar las fotos', fx: { cordura: -4, intelecto: 3 }, out: 'Es peor que ir. Lo sabes al ver la tercera.' }] },
    { id: 's3_cuidar', min: 20, max: 200, w: 8, req: function (s) { return s.relaciones.length > 1; },
      t: 'Alguien cercano se pone muy enfermo y necesita cuidados diarios.',
      c: [{ t: 'Cuidarle tú', fx: { cordura: -8, alineamiento: 20, salud: -6, creditos: -6000 }, relTodas: 25, out: 'Un año duro que no cambiarías.' },
          { t: 'Organizar turnos entre varios', fx: { carisma: 14, intelecto: 8, alineamiento: 12 }, relTodas: 15, out: 'La solución inteligente y nada obvia.' },
          { t: 'Pagar a alguien', fx: { creditos: -22000, cordura: -4 }, out: 'Se hace bien. No es lo mismo y lo sabes.' }] },
    { id: 's3_confesion', min: 18, max: 200, w: 7, t: 'Alguien te cuenta algo enorme y te pide que no lo repitas.',
      c: [{ t: 'Guardarlo', fx: { cordura: -6, alineamiento: 10 }, relTodas: 20, out: 'Pesa. Lo llevas.' },
          { t: 'Convencerle de que lo cuente él', fx: { carisma: 14, alineamiento: 12, cordura: 6 }, out: 'Tarda meses. Lo hace.' },
          { t: 'Contarlo a quien deba saberlo', fx: { alineamiento: 5, cordura: -8 }, relTodas: -30, out: 'Puede que fuera lo correcto. No te lo perdona.' }] }
  ]);

  /* ═══════════ BAJOS FONDOS ═══════════ */
  push(SW.ACTOS.crimen, [
    { id: 'c3_falsificar', min: 16, max: 200, w: 8, t: 'Hay demanda de identidades nuevas. Mucha demanda.',
      c: [{ t: 'Montar un taller de falsificación', fx: { creditos: 26000, intelecto: 10, notoriedad: 15, alineamiento: -10 }, habilidad: 'falsificador', buscado: 12, out: 'Clientela fija y silenciosa.' },
          { t: 'Falsificar solo la tuya', fx: { creditos: -6000, notoriedad: -10 }, flag: 'identidad_falsa', out: 'Otro nombre, otro expediente, mismo tú.' },
          { t: 'Denunciar el taller que ya existe', fx: { creditos: 8000, reputacion: 6, notoriedad: 8 }, out: 'Cae. Abren otro en un mes.' }] },
    { id: 'c3_apuesta_amanada', min: 16, max: 200, w: 8, t: 'Te ofrecen amañar un resultado. Solo tienes que fallar a propósito.',
      c: [{ t: 'Aceptar', fx: { creditos: 22000, alineamiento: -15, reputacion: -8 }, out: 'Fácil. Y para siempre.' },
          { t: 'Aceptar y ganar igualmente', fx: { creditos: 12000, reputacion: 12, notoriedad: 12 }, buscado: 25, rel: { tipo: 'rival', afecto: -60, quien: 'quien perdió mucho dinero' }, out: 'Se queda su dinero y tú una lista de enemigos.' },
          { t: 'Negarte y avisar', fx: { alineamiento: 12, reputacion: 10, notoriedad: 6 }, out: 'Se suspende. Alguien pierde mucho.' }] },
    { id: 'c3_soplon', min: 18, max: 200, w: 7, req: function (s) { return s.stats.notoriedad > 25; },
      t: 'La autoridad local te ofrece inmunidad por información.',
      c: [{ t: 'Colaborar del todo', fx: { notoriedad: -25, alineamiento: 5, creditos: 12000 }, flag: 'chivato', buscado: 40, out: 'Limpio ante la ley, marcado en la calle.' },
          { t: 'Dar solo lo que no compromete a los tuyos', fx: { notoriedad: -10, intelecto: 10, carisma: 8 }, out: 'Un equilibrio muy fino que aguanta.' },
          { t: 'Mandarles a paseo', fx: { notoriedad: 10, reputacion: 6 }, out: 'Se te complica todo. Duermes bien.' }] },
    { id: 'c3_territorio', min: 18, max: 200, w: 8, req: function (s) { return !!s.flags.jefe_barrio || s.stats.notoriedad > 40; },
      t: 'Otra banda entra en tu zona.',
      c: [{ t: 'Responder por la fuerza', combate: { dif: 62, botin: 20000 }, fx: { notoriedad: 15 } },
          { t: 'Repartirse la zona', fx: { carisma: 12, creditos: 9000 }, out: 'Dos mesas, un acuerdo y ningún muerto.' },
          { t: 'Retirarte del negocio', fx: { notoriedad: -20, cordura: 12 }, out: 'Se lo quedan. Tú te quedas vivo.' }] }
  ]);

  /* ═══════════ HANGAR ═══════════ */
  push(SW.ACTOS.nave, [
    { id: 'n3_contrabando_doble', min: 18, max: 200, w: 8, req: function (s) { return !!s.nave; },
      t: 'Un compartimento falso en tu nave. El mecánico no pregunta para qué.',
      c: [{ t: 'Instalarlo', fx: { creditos: -12000, intelecto: 6 }, flag: 'compartimento', out: 'Cabe justo lo que no debería verse.' },
          { t: 'Instalar dos, uno señuelo', fx: { creditos: -20000, intelecto: 12 }, flag: 'compartimento', out: 'Que encuentren el primero es parte del plan.' },
          { t: 'No meterte en eso', fx: { cordura: 4 }, out: 'Tu nave sigue siendo aburrida y legal.' }] },
    { id: 'n3_motin', min: 20, max: 200, w: 7, req: function (s) { return !!s.nave && s.relaciones.some(function (r) { return r.tipo === 'tripulante'; }); },
      t: 'Tu tripulación no está de acuerdo con la última ruta que has elegido.',
      c: [{ t: 'Escucharles y cambiar el plan', fx: { carisma: 12, intelecto: 6 }, relTodas: 20, out: 'Tenían razón. Se lo dices.' },
          { t: 'Imponerte', fx: { reputacion: 5, cordura: -5 }, relTodas: -20, out: 'Se hace lo que dices. Se habla poco durante el viaje.' },
          { t: 'Dejar que decidan ellos', fx: { carisma: 8, cordura: 6 }, relTodas: 15, out: 'Sale bien. Y ya no es tu nave del todo.' }] },
    { id: 'n3_hangar_deuda', min: 18, max: 200, w: 7, req: function (s) { return !!s.nave; },
      t: 'Las tasas de atraque llevan meses sin pagarse. Han puesto un precinto.',
      c: [{ t: 'Pagar todo de golpe', fx: { creditos: -18000 }, out: 'Duele. Vuelves a volar.' },
          { t: 'Sacarla de noche sin pagar', r: [{ p: 0.5, t: 'Escapas del puerto sin luces.', fx: { destreza: 8, notoriedad: 12 }, buscado: 20, mover: true, motivo: 'escapando del puerto' },
               { p: 0.5, t: 'Te pillan en la rampa.', fx: { creditos: -25000, notoriedad: 15 } }] },
          { t: 'Trabajar en el hangar para saldarlo', fx: { creditos: -2000, intelecto: 6, fisico: 5 }, habilidad: 'ingeniero', out: 'Seis meses de grasa. Y aprendes.' }] }
  ]);

  /* ═══════════ ACCIÓN ═══════════ */
  push(SW.ACTOS.accion, [
    { id: 'a3_guardaespaldas', min: 18, max: 200, w: 8, slots: { n: 'nombre' }, t: '{n} paga bien por que alguien se ponga delante cuando toque.',
      c: [{ t: 'Aceptar el contrato', fx: { creditos: 20000, notoriedad: 6 }, rel: { tipo: 'contacto', afecto: 30, quien: 'a quien protegiste' }, combate: { dif: 55 } },
          { t: 'Aceptar y traicionarle', fx: { creditos: 45000, alineamiento: -28, notoriedad: 20 }, buscado: 35, out: 'Cobras de los dos lados. Solo una vez.' },
          { t: 'Rechazarlo', fx: { cordura: 3 }, out: 'Contrata a otro. Ese otro dura tres meses.' }] },
    { id: 'a3_rescate_montaña', min: 16, max: 200, w: 7, slots: { p: 'mundo' }, t: 'Un grupo se ha quedado atrapado en las alturas de {p}. Nadie más va a subir.',
      c: [{ t: 'Subir', r: [{ p: 0.55, t: 'Los bajas a todos.', fx: { alineamiento: 22, reputacion: 16, fisico: 8, salud: -10 } },
               { p: 0.45, t: 'Bajas a la mitad y te dejas algo arriba.', fx: { alineamiento: 18, salud: -24, cordura: -10 }, herida: { n: 'congelación en dos dedos', sev: 12 } }] },
          { t: 'Organizar el rescate desde abajo', fx: { intelecto: 12, carisma: 10, alineamiento: 12 }, out: 'Coordinas a seis equipos. Salen todos.' },
          { t: 'No es tu problema', fx: { cordura: -8 }, out: 'Se habla de ello en el pueblo durante años.' }] },
    { id: 'a3_prueba_valor', min: 14, max: 200, w: 7, slots: { c: 'criatura' }, t: 'Un reto local: pasar la noche donde duerme {c}.',
      c: [{ t: 'Aceptar', r: [{ p: 0.6, t: 'Aguantas. Al amanecer sales entero.', fx: { fisico: 8, reputacion: 12, cordura: 8 } },
               { p: 0.4, t: 'No aguantas ni dos horas.', fx: { reputacion: -8, cordura: -6, destreza: 5 } }] },
          { t: 'Aceptar y hacer trampas', fx: { intelecto: 10, reputacion: 8, alineamiento: -6 }, out: 'Duermes en una cornisa. Nadie lo comprueba.' },
          { t: 'Reírte del reto', fx: { carisma: 5, reputacion: -4 }, out: 'Los locales te miran como a un forastero. Lo eres.' }] }
  ]);

  /* ═══════════ MERCADO / SALUD / VIAJE ═══════════ */
  push(SW.ACTOS.mercado, [
    { id: 'm3_regateo', min: 12, max: 200, w: 8, slots: { o: 'objeto' }, t: 'Un puesto vende un {o} muy por encima de su precio.',
      c: [{ t: 'Regatear hasta el hueso', r: [{ p: 0.55, t: 'Baja a la mitad.', fx: { carisma: 10, creditos: -1500 }, item: true },
               { p: 0.45, t: 'Se ofende y te echa.', fx: { carisma: 4, reputacion: -4 } }] },
          { t: 'Pagarlo sin discutir', fx: { creditos: -6000, carisma: -3 }, item: true, out: 'El vendedor te recuerda con cariño.' },
          { t: 'Buscarlo en otro sitio', fx: { intelecto: 6, creditos: -2500 }, item: true, out: 'Tres puestos más allá, la mitad de precio.' }] },
    { id: 'm3_estafa', min: 16, max: 200, w: 7, slots: { n: 'nombre' }, t: '{n} monta un tinglado de inversión que huele a estafa piramidal.',
      c: [{ t: 'Entrar pronto y salir antes', fx: { creditos: 25000, alineamiento: -12, notoriedad: 8 }, out: 'Cobras y desapareces. Los últimos lo pagan.' },
          { t: 'Avisar a todo el barrio', fx: { reputacion: 14, alineamiento: 15 }, rel: { tipo: 'rival', afecto: -50, quien: 'el estafador' }, out: 'Se hunde el tinglado. Te odia para siempre.' },
          { t: 'No meterte', fx: { cordura: 3 }, out: 'Cae medio barrio. Tú no.' }] }
  ]);
  push(SW.ACTOS.salud, [
    { id: 'sa3_dieta', min: 14, max: 200, w: 8, t: 'Un médico te dice, sin rodeos, que comes fatal.',
      c: [{ t: 'Hacerle caso', fx: { salud: 10, fisico: 6, cordura: -3, creditos: -3000 }, out: 'Aburrido y eficaz.' },
          { t: 'Hacerle caso a medias', fx: { salud: 4, fisico: 2 }, out: 'Lo normal.' },
          { t: 'Cambiar de médico', fx: { cordura: 5, salud: -5, carisma: 3 }, out: 'El siguiente te dice lo mismo.' }] },
    { id: 'sa3_terapia_grupo', min: 18, max: 200, w: 7, t: 'Un grupo de apoyo en el centro cívico. Sillas en círculo y café malo.',
      c: [{ t: 'Ir y hablar', fx: { cordura: 18, carisma: 6 }, rel: { tipo: 'amigo', afecto: 40, quien: 'del grupo' }, out: 'Cuesta la primera vez. Luego no.' },
          { t: 'Ir y escuchar', fx: { cordura: 10, intelecto: 5 }, out: 'Con eso ya sirve.' },
          { t: 'No volver después del primer día', fx: { cordura: -4 }, out: 'Te acuerdas del sitio cada cierto tiempo.' }] }
  ]);
  push(SW.ACTOS.viaje, [
    { id: 'v3_peregrinos', min: 14, max: 200, w: 7, slots: { p: 'mundo' }, t: 'Un grupo de peregrinos va hacia {p} y aceptan compañía.',
      c: [{ t: 'Ir con ellos andando', fx: { cordura: 16, fisico: 6, fuerza: 5, salud: -5 }, mueveA: '{p}', motivo: 'con una peregrinación', out: 'Semanas de polvo, cantos y conversaciones raras.' },
          { t: 'Llevarles en tu nave', req: function (s) { return !!s.nave; }, fx: { alineamiento: 12, creditos: 3000 }, mueveA: '{p}', motivo: 'llevando peregrinos', out: 'Pagan poco y bendicen mucho.' },
          { t: 'Dejarles ir', fx: {}, out: 'Les ves marcharse a pie.' }] },
    { id: 'v3_frontera_cerrada', min: 14, max: 200, w: 7, slots: { p: 'mundo' }, t: 'Han cerrado el tráfico civil hacia {p}. Nadie explica por qué.',
      c: [{ t: 'Buscar una ruta alternativa', fx: { intelecto: 10, notoriedad: 6 }, mueveA: '{p}', motivo: 'saltándote un bloqueo', out: 'Entras por donde no miran.' },
          { t: 'Averiguar el motivo', fx: { intelecto: 12, cordura: -6 }, flag: 'sabe_demasiado', out: 'Lo que descubres explica muchas otras cosas.' },
          { t: 'Cambiar de destino', fx: { cordura: 3 }, mover: 'cerca', motivo: 'cambiando de destino' }] }
  ]);

})(window);

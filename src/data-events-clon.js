/* ============================================================
   HOLOVIDA :: la vida de un clon
   Cronología comprimida (envejeces al doble), hermanos de lote,
   campañas, apodos, armaduras pintadas y la Orden 66.
   Todos los tiempos van en edad BIOLÓGICA.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const CLON = ['clon', 'clon_nulo'];

  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  /* ================= CICLO DE VIDA (automáticos) ================= */
  push(SW.EVENTOS, [
    {
      id: 'cl_tubo', min: 2, max: 5, w: 30, esp: CLON, unaVez: true,
      t: 'Primer recuerdo: cristal, líquido tibio y una silueta muy alta al otro lado. Un kaminoano anota algo y se va.',
      c: [
        { t: 'Golpear el cristal', fx: { fisico: 6, cordura: -4, destreza: 4 }, out: 'Anotan "agresividad dentro de parámetros". Te sacan una semana antes.' },
        { t: 'Quedarte quieto y mirar', fx: { intelecto: 8, cordura: 6 }, out: 'Anotan "observador". Eso te seguirá en el expediente para siempre.' },
        { t: 'Buscar a los otros con la mirada', fx: { carisma: 8, cordura: 4 }, out: 'Hay miles de caras iguales a la tuya. Ninguna te da miedo.' }
      ]
    },
    {
      id: 'cl_hermano', min: 4, max: 10, w: 16, esp: CLON,
      t: 'En el barracón, el catre de al lado. Tu hermano de lote no puede dormir y habla toda la noche.',
      c: [
        { t: 'Escucharle hasta el toque de diana', fx: { cordura: 8, carisma: 6 }, rel: { tipo: 'hermano de lote', afecto: 55 }, out: 'Habla de un mundo con hierba. Nunca ha visto uno.' },
        { t: 'Decirle que se calle', fx: { cordura: -3, destreza: 3 }, out: 'Se calla. No vuelve a hablarte fuera de servicio.' },
        { t: 'Sacarle a hurtadillas a ver la lluvia', fx: { cordura: 12, destreza: 6, reputacion: -4 }, rel: { tipo: 'hermano de lote', afecto: 65 }, out: 'Os pillan. Merece la pena. Kamino solo tiene eso: lluvia.' }
      ]
    },
    {
      id: 'cl_simulador', min: 6, max: 12, w: 16, esp: CLON,
      t: 'Prueba de pasillo con fuego real de aturdimiento. El instructor cronometra y no parpadea.',
      c: [
        { t: 'Ir primero y marcar el ritmo', fx: { destreza: 10, fisico: 6, reputacion: 8 }, out: 'Récord del lote. Los kaminoanos toman nota.' },
        { t: 'Cubrir a los que se quedan atrás', fx: { carisma: 12, cordura: 8, destreza: 4 }, relTodas: 25, flag: 'lider_natural', out: 'Pasáis todos. Tardáis más. El instructor tacha algo con rabia.' },
        { t: 'Estudiar el patrón antes de moverte', fx: { intelecto: 14, destreza: 5 }, out: 'Descubres que el patrón se repite cada 40 segundos. Lo usas siempre.' },
        { t: 'Fallar a propósito para ver qué pasa', fx: { intelecto: 8, cordura: -6, reputacion: -10 }, flag: 'marcado_defectuoso', out: 'Lo que pasa es una noche entera en reacondicionamiento.' }
      ]
    },
    {
      id: 'cl_reacondicionamiento', min: 6, max: 14, w: 9, esp: CLON,
      req: function (s) { return s.flags.marcado_defectuoso || s.especie === 'clon_nulo'; },
      t: 'Te llaman a la sala blanca. "Reacondicionamiento" es una palabra larga para algo muy corto.',
      c: [
        { t: 'Entrar', fx: { cordura: -16, destreza: 6, intelecto: -4 }, quitarFlag: 'marcado_defectuoso', out: 'Sales obediente. Durante un tiempo.' },
        { t: 'Fingir que ya estás corregido', fx: { carisma: 12, intelecto: 8, cordura: -6 }, flag: 'finge_obediencia', out: 'Cuela. Aprendes que la cara sirve de armadura.' },
        { t: 'Negarte delante de todo el lote', fx: { cordura: 8, reputacion: -14, destreza: 8 }, relTodas: 20, flag: 'insubordinado', out: 'Nadie se mueve. El instructor tampoco. Algo cambia ese día.' }
      ]
    },
    {
      id: 'cl_apodo', min: 8, max: 16, w: 18, esp: CLON, unaVez: true,
      req: function (s) { return !s.apodo; },
      t: 'CT-números hay miles. Alguien del pelotón te ha empezado a llamar de otra manera.',
      c: [
        { t: 'Aceptar el apodo', apodo: true, fx: { cordura: 12, carisma: 8 }, out: '' },
        { t: 'Elegir tú uno mejor', apodo: 'elegir', fx: { carisma: 10, cordura: 8 }, out: '' },
        { t: 'Seguir siendo tu número', fx: { cordura: -8, destreza: 6, reputacion: 4 }, flag: 'sin_nombre', out: 'Algunos dicen que es disciplina. Otros, que da miedo.' }
      ]
    },
    {
      id: 'cl_armadura', min: 9, max: 20, w: 14, esp: CLON,
      t: 'Placas nuevas, blancas y anónimas. La pintura del taller no está vigilada esta noche.',
      c: [
        { t: 'Pintarla con los colores de tu unidad', fx: { carisma: 8, reputacion: 6, cordura: 8 }, flag: 'armadura_pintada', out: 'Un pelotón entero con la misma marca ya no es un lote: es algo tuyo.' },
        { t: 'Pintar la cara de tu hermano caído', fx: { cordura: 14, alineamiento: 8 }, flag: 'armadura_memorial', out: 'Los oficiales miran para otro lado. Saben lo que es.' },
        { t: 'Dejarla blanca reglamentaria', fx: { reputacion: 8, cordura: -4 }, out: 'Cumples. Eres exactamente lo que pidieron.' },
        { t: 'Pintar algo que solo entiendes tú', fx: { cordura: 10, intelecto: 6, reputacion: -4 }, out: 'Te preguntan qué significa durante años. Nunca lo dices.' }
      ]
    },
    {
      id: 'cl_despliegue', min: 10, max: 22, w: 20, esp: CLON, unaVez: true,
      era: ['guerras_clon'], slots: { p: 'mundo' },
      t: 'Primer despliegue. Cañonera abierta sobre {p}, fuego antiaéreo y un general jedi gritando algo que no oyes.',
      c: [
        { t: 'Saltar el primero', fx: { fisico: 10, destreza: 10, cordura: -8, reputacion: 10 }, contador: { batallas: 1 }, out: 'Aterrizas antes que nadie. Sobrevives. Los dos hechos están relacionados menos de lo que crees.' },
        { t: 'Quedarte con los heridos en la cañonera', fx: { intelecto: 8, alineamiento: 12, cordura: 4 }, habilidad: 'medico', out: 'Salvas a tres. Nadie te lo escribe en ningún informe.' },
        { t: 'Seguir al jedi sin preguntar', fx: { destreza: 8, fuerza: 3, cordura: -4 }, faccion: 'orden_jedi+15', contador: { batallas: 1 }, out: 'Le sigues a través de fuego cruzado. Está loco. Funciona.' },
        { t: 'Buscar cobertura y pensar', fx: { intelecto: 12, destreza: 6 }, contador: { batallas: 1 }, out: 'Encuentras un flanco que nadie había visto. La compañía lo usa.' }
      ]
    },
    {
      id: 'cl_general', min: 11, max: 30, w: 13, esp: CLON, era: ['guerras_clon'], slots: { n: 'nombre' },
      t: 'Tu general jedi, {n}, te pregunta tu opinión delante de los oficiales. Nadie te había preguntado nunca nada.',
      c: [
        { t: 'Dar tu opinión de verdad', fx: { intelecto: 10, carisma: 10, reputacion: 8 }, rel: { tipo: 'general jedi', afecto: 55 }, faccion: 'orden_jedi+15', out: 'La adopta. La compañía pierde a dos hombres en vez de a veinte.' },
        { t: 'Decir "lo que usted ordene, señor"', fx: { reputacion: 4, cordura: -6 }, out: 'Asiente, decepcionado. Vuelve a preguntar la próxima vez.' },
        { t: 'Preguntarle a él si esta guerra tiene sentido', fx: { cordura: -10, intelecto: 10, fuerza: 3 }, flag: 'duda_guerra', rel: { tipo: 'general jedi', afecto: 40 }, out: 'Tarda mucho en contestar. Al final dice: "No lo sé". Eso te acompaña.' }
      ]
    },
    {
      id: 'cl_baja', min: 11, max: 34, w: 15, esp: CLON, era: ['guerras_clon'],
      req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hermano de lote'; }); },
      t: 'Cae uno de tus hermanos de lote. Tiene tu cara. Siempre tienen tu cara.',
      c: [
        { t: 'Recoger su placa y seguir', fx: { cordura: -12, destreza: 6 }, matarRel: 'hermano de lote', item: true, flag: 'lleva_placas', out: 'Ya llevas varias colgando. Suenan al andar.' },
        { t: 'Parar el avance para sacar el cuerpo', fx: { alineamiento: 15, cordura: 6, reputacion: -8 }, matarRel: 'hermano de lote', out: 'El oficial te lo recrimina. La compañía te lo agradece en silencio.' },
        { t: 'No mirar y disparar hacia adelante', fx: { destreza: 10, cordura: -16, alineamiento: -6 }, matarRel: 'hermano de lote', out: 'Funciona en el momento. Falla por las noches.' }
      ]
    },
    {
      id: 'cl_civil', min: 12, max: 34, w: 12, esp: CLON, era: ['guerras_clon'], slots: { p: 'mundo' },
      t: 'En {p}, una familia local se ha quedado entre vuestra posición y la artillería separatista.',
      c: [
        { t: 'Detener el avance y sacarlos', fx: { alineamiento: 20, cordura: 10, reputacion: -6 }, out: 'Perdéis la posición. Los cuatro civiles viven.' },
        { t: 'Cumplir la orden', fx: { alineamiento: -18, cordura: -14, reputacion: 8 }, flag: 'obedece_ciego', out: 'Cumples. El informe dice "objetivo asegurado". Tú sabes lo que dice de verdad.' },
        { t: 'Avisarles por radio abierta y arriesgar el flanco', fx: { intelecto: 10, alineamiento: 12, cordura: 4 }, out: 'Se van a tiempo. El enemigo también os oye. Empate raro.' }
      ]
    },
    {
      id: 'cl_desercion', min: 14, max: 40, w: 8, esp: CLON, era: ['guerras_clon'], slots: { p: 'mundo' },
      req: function (s) { return s.flags.duda_guerra || s.stats.cordura < 45 || s.especie === 'clon_nulo'; },
      t: 'En {p} hay granjas donde han desaparecido clones antes. Nadie los busca demasiado.',
      c: [
        { t: 'Desertar esta noche', fx: { cordura: 16, reputacion: -20, notoriedad: 15 }, flag: 'desertor', despido: true, mueveA: '{p}', motivo: 'desertando', out: 'Entierras la armadura. Te dejas crecer la barba. Nadie viene. Todavía.' },
        { t: 'Ayudar a desertar a otro y quedarte', fx: { alineamiento: 15, cordura: 8, reputacion: -8 }, out: 'Le das tus raciones y una dirección. No vuelves a saber de él.' },
        { t: 'Denunciar a los que planean irse', fx: { reputacion: 12, alineamiento: -20, cordura: -14 }, relTodas: -50, flag: 'delator', out: 'Te ascienden. Comes solo a partir de entonces.' },
        { t: 'Quedarte y no decir nada', fx: { cordura: -4, reputacion: 4 }, out: 'Cada uno con lo suyo.' }
      ]
    },
    {
      id: 'cl_chip', min: 14, max: 44, w: 7, esp: CLON, era: ['guerras_clon'], unaVez: true,
      req: function (s) { return s.flags.chip_inhibidor; },
      t: 'Migrañas. Un médico clon te enseña una radiografía y señala una mancha en el lóbulo. "Todos lo tenemos. No sé para qué es."',
      c: [
        { t: 'Que te lo saquen en secreto', fx: { salud: -12, cordura: 10, intelecto: 6 }, quitarFlag: 'chip_inhibidor', flag: 'chip_extraido', herida: { n: 'cicatriz de craneotomía', sev: 10 }, out: 'Duele semanas. Duermes mejor que en tu vida.' },
        { t: 'Informar por el canal reglamentario', fx: { reputacion: 6, cordura: -10 }, out: 'Te dicen que es un "inhibidor de agresividad". Nadie vuelve a mencionarlo.' },
        { t: 'Callarte y anotarlo todo', fx: { intelecto: 12, cordura: -6 }, flag: 'sospecha_chip', out: 'Llenas un cuaderno. Algún día servirá. O no.' }
      ]
    },
    {
      id: 'cl_envejecer_aviso', min: 22, max: 60, w: 10, esp: CLON, unaVez: true,
      t: 'Un médico civil te mira la ficha dos veces. "¿Seguro que tienes esta edad?" Le enseñas el número de tu brazo.',
      c: [
        { t: 'Explicarle lo que eres', fx: { cordura: 6, carisma: 6 }, out: 'Se sienta. Te escucha una hora entera. Es la primera vez que alguien pregunta.' },
        { t: 'Decirle que se ocupe de lo suyo', fx: { cordura: -4, fisico: 2 }, out: 'Te receta algo genérico y te despacha.' },
        { t: 'Preguntarle cuánto te queda', fx: { intelecto: 8, cordura: -10 }, out: 'Hace cuentas en voz baja. No te gusta el número.' }
      ]
    }
  ]);

  /* ---- guion: la asignación y la Orden 66 no se dejan al azar ---- */
  push(SW.GUION, [
    {
      id: 'cl_asignacion', min: 9, max: 14, prio: 90, esp: CLON, era: ['guerras_clon'], unaVez: true,
      req: function (s) { return !s.trabajo; },
      t: 'Fin de la instrucción. Un kaminoano lee tu expediente y decide para qué sirves. Puedes influir un poco.',
      c: [
        { t: 'Infantería de línea', sub: 'Lo que se espera de ti.', empleo: { id: 'clon_soldado', sueldo: 0 }, fx: { destreza: 8, fisico: 8 }, bando: 'gar' },
        { t: 'Aspirante a comando ARC', sub: 'Iniciativa permitida. Muy pocos pasan.', req: function (s) { return s.stats.destreza > 45; }, empleo: { id: 'clon_arc', sueldo: 0 }, fx: { destreza: 14, cordura: 6 }, bando: 'gar' },
        { t: 'Médico de campaña', sub: 'Sacas a los tuyos de la cañonera.', req: function (s) { return s.stats.intelecto > 35; }, empleo: { id: 'clon_medico', sueldo: 0 }, fx: { intelecto: 12 }, habilidad: 'medico', bando: 'gar' },
        { t: 'Piloto', sub: 'Cañonera, ARC-170 o bombardero.', req: function (s) { return s.stats.destreza > 40; }, empleo: { id: 'clon_piloto', sueldo: 0 }, fx: { destreza: 12, intelecto: 6 }, habilidad: 'piloto', bando: 'gar' },
        { t: 'Fallar las pruebas a propósito', sub: 'A ver qué pasa con los que no sirven.', fx: { cordura: -10, intelecto: 8, reputacion: -12 }, flag: 'marcado_defectuoso', out: 'Te mandan a mantenimiento en Kamino. Ves salir a tus hermanos sin ti.' }
      ]
    },
    {
      id: 'cl_orden66', min: 20, max: 46, prio: 100, esp: CLON, era: ['guerras_clon'], unaVez: true,
      slots: { n: 'nombre' },
      t: '<b>Buena ejecución de la Orden 66.</b><br>La voz llega por el canal general. Es un código antiguo. A tu lado, tu general jedi se gira hacia ti sin entender nada.',
      c: [
        { t: 'Obedecer', req: function (s) { return !s.flags.chip_extraido; },
          fx: { alineamiento: -35, cordura: -30, reputacion: 10, destreza: 5 }, faccion: 'imperio+30', faccion2: 'orden_jedi-60',
          flag: 'ejecuto_orden66', flag2: 'orden66_pasada', matarRel: 'general jedi',
          out: 'Tu cuerpo lo hace antes que tú. Cuando vuelves en ti, ya está hecho. Nunca te perdonarás del todo, aunque no fueras tú.' },
        { t: 'Resistirte al chip con todas tus fuerzas', req: function (s) { return !s.flags.chip_extraido; },
          r: [
            { p: 0.35, t: 'Bajas el rifle. Te tiemblan las manos, pero lo bajas.', fx: { cordura: -14, alineamiento: 20, notoriedad: 20 }, flag: 'resistio_orden66', flag2: 'orden66_pasada' },
            { p: 0.65, t: 'No puedes. Lo intentas y no puedes.', fx: { alineamiento: -30, cordura: -35 }, flag: 'ejecuto_orden66', flag2: 'orden66_pasada', matarRel: 'general jedi' }
          ] },
        { t: 'Gritarle que corra', req: function (s) { return !!s.flags.chip_extraido; },
          fx: { alineamiento: 25, cordura: -10, notoriedad: 25, reputacion: -20 }, flag: 'salvo_jedi', flag2: 'orden66_pasada', faccion: 'orden_jedi+40',
          out: 'Se va entre los árboles. Tú te quedas explicando por qué fallaste el tiro. Nadie te cree, pero nadie puede probarlo.' },
        { t: 'Disparar a los que disparan', req: function (s) { return !!s.flags.chip_extraido; },
          fx: { alineamiento: 15, cordura: -20, notoriedad: 35 }, flag: 'desertor', despido: true, mover: true, motivo: 'huyendo de tu propia unidad',
          out: 'Tus hermanos caen por tu mano. Los que quedan te cazarán el resto de tu vida corta.' }
      ]
    }
  ]);

  push(SW.EVENTOS, [
    {
      id: 'cl_despues', min: 18, max: 60, w: 12, esp: CLON, unaVez: true,
      req: function (s) { return s.flags.ejecuto_orden66 || s.flags.desertor || s.flags.salvo_jedi; },
      slots: { p: 'mundo' },
      t: 'La guerra terminó de un día para otro. Ahora hay un Imperio, reclutas humanos más baratos que tú, y una pregunta: ¿y ahora qué?',
      c: [
        { t: 'Quedarte en el nuevo ejército', fx: { reputacion: 8, cordura: -12, alineamiento: -10 }, faccion: 'imperio+20', empleo: { id: 'stormtrooper', sueldo: 11000 }, out: 'Te dan un casco nuevo y un número más. Duras hasta que dejas de servir.' },
        { t: 'Retirarte a una granja en {p}', fx: { cordura: 22, fisico: -4, creditos: -4000 }, mueveA: '{p}', motivo: 'buscando una vida quieta', flag: 'retirado', out: 'Aprendes a plantar cosas. Se te da regular. Da igual.' },
        { t: 'Buscar a los hermanos que quedan', fx: { carisma: 10, cordura: 12, notoriedad: 8 }, rel: { tipo: 'hermano de lote', afecto: 60 }, out: 'Encuentras a tres. Uno no quiere verte. Los otros dos lloran.' },
        { t: 'Vender lo que sabes al mejor postor', fx: { creditos: 45000, alineamiento: -14, notoriedad: 18 }, out: 'Sabes protocolos, códigos y nombres. Todo eso cotiza.' }
      ]
    },
    {
      id: 'cl_envejecer', min: 30, max: 70, w: 14, esp: CLON,
      t: 'Tienes el pelo blanco y la cara de un hombre de sesenta. Has vivido la mitad de esos años.',
      c: [
        { t: 'Aceptarlo con humor', fx: { cordura: 14, carisma: 8 }, out: '"Nos hicieron rápidos también para esto", dices. Nadie se ríe. Tú sí.' },
        { t: 'Buscar un tratamiento kaminoano', r: [
          { p: 0.3, t: 'Un ex-científico te frena el reloj un poco.', fx: { salud: 15, creditos: -40000, cordura: 8 } },
          { p: 0.7, t: 'Es un timo caro y doloroso.', fx: { salud: -10, creditos: -25000, cordura: -8 } }
        ] },
        { t: 'Aprovechar el tiempo que queda', fx: { cordura: 20, creditos: -8000, carisma: 6 }, out: 'Haces todo lo que no te dejaron hacer. En orden y con lista.' }
      ]
    }
  ]);

  /* ================= ACTIVIDAD: ESCUADRÓN ================= */
  SW.ACTOS.escuadron = [
    {
      id: 'es_entreno', min: 4, max: 200, w: 12,
      t: 'Tiempo con la unidad. Lo que hagas aquí decide quién vuelve de la próxima.',
      c: [
        { t: 'Instrucción dura de combate', fx: { destreza: 10, fisico: 8, cordura: -4 }, out: 'Todos acaban molidos. Todos disparan mejor.' },
        { t: 'Entrenar tácticas de escuadra', fx: { intelecto: 10, carisma: 8 }, relTodas: 12, out: 'Menos heroísmo, más coordinación.' },
        { t: 'Noche libre con los tuyos', fx: { cordura: 14, carisma: 8, creditos: -600 }, relTodas: 20, out: 'Cantáis mal y os reís peor. Hace falta.' },
        { t: 'Entrenar tú solo hasta caer', fx: { destreza: 12, fisico: 10, cordura: -10, carisma: -6 }, out: 'Mejoras. Te alejas.' }
      ]
    },
    {
      id: 'es_mision', min: 8, max: 200, w: 14,
      t: 'Órdenes nuevas. El mapa táctico se llena de marcas rojas.',
      c: [{ t: 'Ver la misión', generar: 'mision', out: '' }]
    },
    {
      id: 'es_mando', min: 10, max: 200, w: 10, slots: { n: 'nombre' },
      t: 'Tu oficial, {n}, da una orden que va a costar vidas por nada.',
      c: [
        { t: 'Cumplirla', fx: { reputacion: 8, cordura: -12, alineamiento: -8 }, relTodas: -15, out: 'Cumples. Vuelven dos de nueve.' },
        { t: 'Discutirla delante de la unidad', fx: { carisma: 10, reputacion: -10, cordura: 6 }, relTodas: 25, flag: 'insubordinado', out: 'Te ganas un expediente y la lealtad de todos.' },
        { t: 'Cumplirla mal a propósito', fx: { intelecto: 12, destreza: 6, cordura: 4 }, relTodas: 15, out: 'Llegáis tarde y por otro sitio. Vuelven siete de nueve.' },
        { t: 'Proponer una alternativa con datos', fx: { intelecto: 14, carisma: 10, reputacion: 6 }, rendimiento: 15, out: 'La acepta. Empieza a preguntarte antes de decidir.' }
      ]
    },
    {
      id: 'es_camarada', min: 8, max: 200, w: 10,
      t: 'Uno de la unidad se está viniendo abajo. Se le nota en las manos.',
      c: [
        { t: 'Hablar con él toda la noche', fx: { cordura: 10, carisma: 8, alineamiento: 10 }, rel: { tipo: 'hermano de lote', afecto: 60 }, out: 'Aguanta. Por ahora eso es todo lo que se puede pedir.' },
        { t: 'Reportarlo al médico de la unidad', fx: { alineamiento: 6, reputacion: 6 }, out: 'Le apartan del frente. Vive. No te lo agradece.' },
        { t: 'Ignorarlo, no es asunto tuyo', fx: { cordura: -10 }, relTodas: -12, out: 'Tres semanas después ya no está.' },
        { t: 'Taparle en el siguiente informe', fx: { alineamiento: 8, reputacion: -6, cordura: 4 }, relTodas: 18, out: 'Se recupera. Te debe algo que no se paga.' }
      ]
    },
    {
      id: 'es_botin', min: 10, max: 200, w: 9, slots: { o: 'objeto', p: 'mundo' },
      t: 'Tras despejar una posición en {p}, hay material enemigo sin inventariar.',
      c: [
        { t: 'Quedarte un {o}', fx: { alineamiento: -5, notoriedad: 4 }, item: true, out: 'Entra en tu petate. Nadie cuenta lo que no existe.' },
        { t: 'Entregarlo todo', fx: { reputacion: 8, rendimiento: 10 }, out: 'Correcto y aburrido. Sube tu ficha.' },
        { t: 'Repartirlo con la unidad', fx: { carisma: 12 }, relTodas: 22, out: 'Los oficiales sospechan. La unidad calla.' },
        { t: 'Venderlo en el siguiente puerto', fx: { creditos: 9000, notoriedad: 10, alineamiento: -8 }, out: 'Primer dinero propio de tu vida. Sabe raro.' }
      ]
    },
    {
      id: 'es_veterano', min: 20, max: 200, w: 9,
      t: 'Llegan reclutas nuevos y te miran como se mira a un mueble antiguo que aún funciona.',
      c: [
        { t: 'Enseñarles todo lo que sabes', fx: { carisma: 12, cordura: 10, reputacion: 8 }, rel: { tipo: 'aprendiz', afecto: 45 }, out: 'Sobreviven más de los que deberían. Ese es tu monumento.' },
        { t: 'Endurecerlos a base de bien', fx: { destreza: 8, reputacion: 6, carisma: -6 }, out: 'Te odian seis meses y te buscan diez años.' },
        { t: 'Mantener las distancias', fx: { cordura: -8, destreza: 4 }, out: 'No aprendes sus nombres. Es más fácil después.' }
      ]
    }
  ];

  /* ================= GENERADOR: MISIONES MILITARES ================= */
  SW.GEN.mision = function (rng, s) {
    const tipos = [
      { v: 'asalto frontal a una posición fortificada', dif: 68, al: -4, r: 'batallas' },
      { v: 'reconocimiento tras las líneas', dif: 52, al: 0, r: 'batallas' },
      { v: 'escolta de un convoy de refugiados', dif: 45, al: 10, r: 'batallas' },
      { v: 'sabotaje de una fábrica de droides', dif: 60, al: -2, r: 'batallas' },
      { v: 'defensa de un puesto avanzado', dif: 62, al: 4, r: 'batallas' },
      { v: 'rescate de prisioneros', dif: 58, al: 12, r: 'batallas' },
      { v: 'captura de un oficial enemigo', dif: 64, al: -6, r: 'batallas' },
      { v: 'evacuación bajo fuego', dif: 55, al: 12, r: 'batallas' },
      { v: 'bombardeo de una ciudad "con objetivos militares"', dif: 40, al: -25, r: 'batallas' }
    ];
    const t = rng.pick(tipos);
    const mundo = rng.pick(SW.MUNDO_NOMBRES);
    const enemigo = rng.pick(['droides B1 en masa', 'droidekas', 'comandos separatistas', 'artillería pesada', 'un general con sable', 'mercenarios de Sol Negro', 'droides tácticos coordinados']);
    return {
      id: 'gen_mision', gen: true,
      t: 'MISIÓN — ' + mundo + '. Objetivo: ' + t.v + '. Oposición: ' + enemigo + '.',
      c: [
        { t: 'Ir al frente y liderar', combate: { dif: t.dif, duelo: false }, fx: { alineamiento: t.al, reputacion: 6 }, contador: { batallas: 1 } },
        { t: 'Planificarla al detalle antes de mover a nadie', r: [
          { p: 0.6, t: 'Sale casi perfecta. Bajas mínimas.', fx: { intelecto: 10, reputacion: 10, alineamiento: t.al }, contador: { batallas: 1 }, rendimiento: 15 },
          { p: 0.4, t: 'El enemigo cambia el plan por ti.', combate: { dif: t.dif + 8 }, fx: { alineamiento: t.al } }
        ] },
        { t: 'Delegar y quedarte en retaguardia', fx: { reputacion: -6, cordura: 4, intelecto: 4 }, contador: { batallas: 1 }, out: 'Vuelven menos de los que salieron. Tú vuelves entero.' },
        { t: 'Negarte a ejecutarla', req: function (st) { return t.al <= -20 || st.flags.insubordinado; },
          fx: { alineamiento: 20, reputacion: -18, cordura: 10 }, flag: 'insubordinado', out: 'Consejo de guerra. No te fusilan porque hacen falta manos.' }
      ]
    };
  };

})(window);

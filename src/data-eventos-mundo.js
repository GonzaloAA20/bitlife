/* ============================================================
   HOLOVIDA :: eventos propios de cada mundo
   Solo salen si estás en ese planeta. Un tusken de Tatooine no
   recibe la vida de un funcionario de Coruscant.
   Se usa `mundo: [...]` para atar el evento al sitio.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_MUNDO = [];
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  push(SW.EVENTOS_MUNDO, [

  /* ════════ TATOOINE ════════ */
  { id: 'w_tat_vaporizador', mundo: ['Tatooine'], min: 5, max: 200, w: 12,
    t: 'Se avería el vaporizador de humedad principal. Sin él, la granja tiene tres días de agua.',
    c: [{ t: 'Arreglarlo tú con lo que haya', r: [{ p: 0.55, t: 'Funciona. Chirría, pero funciona.', fx: { intelecto: 8, destreza: 5 } },
           { p: 0.45, t: 'Lo empeoras y hay que llamar a un jawa.', fx: { creditos: -1200, intelecto: 4 } }] },
        { t: 'Comprar una pieza a los jawas', fx: { creditos: -900, carisma: 5 }, out: 'Regateas mal. Te lo recuerdan cada visita.' },
        { t: 'Racionar el agua y aguantar', fx: { salud: -8, cordura: 6, fisico: 4 }, out: 'Aprendes cuánta agua necesita de verdad un cuerpo.' }] },
  { id: 'w_tat_tusken', mundo: ['Tatooine'], min: 6, max: 200, w: 11,
    t: 'Hay humo de un campamento tusken a dos crestas de aquí. Los colonos hablan de organizarse.',
    c: [{ t: 'Ir con los colonos', fx: { destreza: 6, alineamiento: -14, reputacion: 6 }, buscado: 10, out: 'Vuelven todos. No todos vuelven iguales.' },
        { t: 'Avisar a los tusken', fx: { alineamiento: 18, reputacion: -12, cordura: 6 }, out: 'Levantan el campamento de noche. Nadie sabe por qué.' },
        { t: 'No meterte', fx: { cordura: -5 }, out: 'Oyes los disparos desde el porche.' },
        { t: 'Ir a comerciar en vez de a pelear', req: function (s) { return s.stats.carisma > 35; }, fx: { carisma: 12, creditos: 3000, alineamiento: 10 }, idioma: 'lengua tusken', out: 'Cambias agua por carne seca. Funciona durante años.' }] },
  { id: 'w_tat_carrera', mundo: ['Tatooine', 'Malastare'], min: 8, max: 200, w: 11,
    t: 'Carrera de vainas en el circuito. Medio planeta apuesta y el otro medio trabaja en los fosos.',
    c: [{ t: 'Trabajar en un foso', fx: { intelecto: 8, destreza: 6, creditos: 900 }, habilidad: 'ingeniero', out: 'Motores Radon-Ulzer y las manos quemadas.' },
        { t: 'Apostar por el favorito', r: [{ p: 0.5, t: 'Gana.', fx: { creditos: 2500, suerte: 4 } }, { p: 0.5, t: 'Se estrella en la Garganta del Mendigo.', fx: { creditos: -2000 } }] },
        { t: 'Correr tú', req: function (s) { return s.stats.destreza > 45; }, combate: { dif: 65, botin: 25000 }, fx: { reputacion: 10 } },
        { t: 'Robar piezas del foso', fx: { creditos: 1800, notoriedad: 8, alineamiento: -8 }, buscado: 12, out: 'Un weequay te ve. No hace nada. Todavía.' }] },
  { id: 'w_tat_jabba', mundo: ['Tatooine'], min: 14, max: 200, w: 10,
    t: 'El palacio de Jabba busca gente. Pagan bien y no dan detalles.',
    c: [{ t: 'Entrar a trabajar allí', fx: { creditos: 14000, notoriedad: 15, alineamiento: -10 }, faccion: 'hutt+20', out: 'Comes bien. Ves cosas.' },
        { t: 'Rechazarlo educadamente', fx: { cordura: 5 }, out: 'Se toma nota de quién dice que no.' },
        { t: 'Entrar para robarle', r: [{ p: 0.3, t: 'Sales con algo que vale una fortuna.', fx: { creditos: 60000, notoriedad: 25 }, buscado: 45, item: true },
           { p: 0.7, t: 'Hay un rancor debajo del salón por algo.', fx: { salud: -30 }, herida: { n: 'mordedura profunda', sev: 18 } }] }] },
  { id: 'w_tat_dos_soles', mundo: ['Tatooine'], min: 4, max: 200, w: 9,
    t: 'Te sientas a ver ponerse los dos soles. No es la primera vez, pero hoy pesa distinto.',
    c: [{ t: 'Prometerte que te irás de aquí', fx: { cordura: 8, intelecto: 4 }, flag: 'quiere_irse', out: 'La mayoría no se va. Algunos sí.' },
        { t: 'Aceptar que este es tu sitio', fx: { cordura: 12, salud: 3 }, out: 'Hay paz en eso, aunque no lo parezca.' },
        { t: 'Ir a buscar a alguien con quien verlo', fx: { carisma: 6, cordura: 10 }, nuevaRel: true }] },

  /* ════════ CORUSCANT ════════ */
  { id: 'w_cor_niveles', mundo: ['Coruscant', 'Coruscant Nivel 1313'], min: 6, max: 200, w: 12,
    t: 'Vives por debajo del nivel 50. Arriba hay sol y aquí hay luz de anuncio.',
    c: [{ t: 'Subir a ver el sol una vez', fx: { cordura: 10, creditos: -300 }, out: 'Un guardia te mira todo el rato. Merece la pena igual.' },
        { t: 'Aprenderte los túneles como nadie', fx: { intelecto: 8, destreza: 8 }, habilidad: 'rastreador', flag: 'conoce_los_bajos', out: 'Puedes cruzar veinte niveles sin pisar una pasarela oficial.' },
        { t: 'Trabajar en lo que salga aquí abajo', fx: { creditos: 2500, salud: -5, fisico: 4 }, out: 'Turnos de doce horas sin ver el cielo.' }] },
  { id: 'w_cor_senado', mundo: ['Coruscant'], min: 16, max: 200, w: 11, slots: { f: 'faccion' },
    t: 'Una votación del Senado va a decidir algo que afecta a tu barrio. Hay sitio en la galería pública.',
    c: [{ t: 'Ir a mirar', fx: { intelecto: 10, carisma: 4 }, out: 'Cuatro horas de procedimiento y una decisión en dos minutos.' },
        { t: 'Colarte en un despacho y hablar con alguien', fx: { carisma: 12, notoriedad: 6 }, rel: { tipo: 'contacto', afecto: 30, quien: 'ayudante de senador' }, out: 'Te escucha. No promete nada. Es más de lo normal.' },
        { t: 'Organizar una protesta en la plaza', fx: { carisma: 14, notoriedad: 14, reputacion: 8 }, faccion: 'auto-12', out: 'Salís en la HoloRed nueve segundos.' },
        { t: 'Vender el resultado antes de que se anuncie', req: function (s) { return s.stats.intelecto > 45; }, fx: { creditos: 22000, alineamiento: -14, notoriedad: 10 }, out: 'La información vale más caliente.' }] },
  { id: 'w_cor_trafico', mundo: ['Coruscant'], min: 14, max: 200, w: 10,
    t: 'Accidente de tráfico aéreo a doce carriles de altura. Cae chatarra durante veinte minutos.',
    c: [{ t: 'Ayudar en el rescate', fx: { alineamiento: 15, salud: -8, reputacion: 10 }, out: 'Sacas a dos de una cabina partida.' },
        { t: 'Recoger lo que cae', fx: { creditos: 6000, alineamiento: -8 }, item: true, out: 'Piezas caras y un poco de vergüenza.' },
        { t: 'Grabarlo y venderlo', fx: { creditos: 4000, carisma: 5 }, out: 'Tu vídeo circula por medio planeta.' }] },
  { id: 'w_cor_templo', mundo: ['Coruscant'], min: 8, max: 200, w: 9,
    req: function (s) { return SW.ordenActiva(s.era); },
    t: 'Pasas por delante del Templo Jedi. Las puertas están abiertas y nadie te mira.',
    c: [{ t: 'Entrar hasta donde te dejen', fx: { cordura: 10, fuerza: 5, intelecto: 4 }, out: 'Silencio, piedra y gente que no hace ruido al andar.' },
        { t: 'Preguntar si pueden mirarte', req: function (s) { return s.sensible; }, fx: { fuerza: 10, cordura: 6 }, flag: 'visto_por_la_orden', out: 'Un maestro te pone la mano en la frente y frunce el ceño.' },
        { t: 'Seguir andando', fx: { cordura: 3 }, out: 'Piensas en ello el resto de la semana.' }] },

  /* ════════ NAR SHADDAA / NAL HUTTA ════════ */
  { id: 'w_nar_deuda', mundo: ['Nar Shaddaa', 'Nal Hutta', 'Kintan'], min: 12, max: 200, w: 12,
    t: 'Aquí todo el mundo le debe algo a alguien. Hoy te toca a ti estar en la lista.',
    c: [{ t: 'Pagar como sea', fx: { creditos: -9000, notoriedad: -5 }, out: 'Limpio. Por ahora.' },
        { t: 'Trabajar la deuda', fx: { notoriedad: 10, destreza: 5 }, faccion: 'hutt+12', pendiente: 'una deuda de trabajo con un cártel', out: 'Ahora tienes un jefe que no elegiste.' },
        { t: 'Cambiar de nivel y desaparecer', fx: { destreza: 8, cordura: -6 }, buscado: 25, out: 'Vertical hay mucho sitio donde perderse.' }] },
  { id: 'w_nar_neon', mundo: ['Nar Shaddaa'], min: 14, max: 200, w: 11,
    t: 'Una galería entera de neón vertical y nadie mira a nadie a los ojos.',
    c: [{ t: 'Montar un puesto propio', fx: { creditos: -4000, carisma: 8 }, flag: 'puesto_propio', out: 'Vendes de todo un poco. Sobre todo información.' },
        { t: 'Trabajar de vigilante en un local', fx: { creditos: 9000, fisico: 6, notoriedad: 6 }, out: 'Sacas a gente a rastras tres noches por semana.' },
        { t: 'Buscar a alguien perdido en los niveles', fx: { intelecto: 8, cordura: -6 }, rel: { tipo: 'contacto', afecto: 30, quien: 'que te debe una' }, out: 'Le encuentras. No quería que le encontraran.' }] },

  /* ════════ KASHYYYK ════════ */
  { id: 'w_kas_esclavistas', mundo: ['Kashyyyk'], min: 10, max: 200, w: 12,
    t: 'Una nave esclavista ha aterrizado en el suelo del bosque, muy por debajo de las plataformas.',
    c: [{ t: 'Bajar a cortarles el paso', combate: { dif: 62 }, fx: { alineamiento: 20, reputacion: 12 } },
        { t: 'Avisar a las aldeas y evacuar', fx: { carisma: 12, alineamiento: 18, cordura: -5 }, out: 'Suben a doscientos por las cuerdas en una noche.' },
        { t: 'Venderles la ubicación de una aldea', fx: { creditos: 35000, alineamiento: -35, notoriedad: 20 }, buscado: 50, out: 'Nunca podrás volver a este planeta.' },
        { t: 'Esconderte arriba y no bajar', fx: { cordura: -10 }, out: 'Oyes lo que pasa abajo durante dos días.' }] },
  { id: 'w_kas_arbol', mundo: ['Kashyyyk', 'Endor', 'Felucia', 'Yavin 4'], min: 6, max: 200, w: 10,
    t: 'El bosque tiene un piso de abajo del que nadie habla y al que nadie baja.',
    c: [{ t: 'Bajar de todas formas', r: [{ p: 0.5, t: 'Encuentras algo que llevaba mucho tiempo ahí.', fx: { intelecto: 8, cordura: -8 }, item: true },
           { p: 0.5, t: 'Encuentras por qué nadie baja.', fx: { salud: -20, destreza: 8 } }] },
        { t: 'Aprender a moverte solo por arriba', fx: { destreza: 10, fisico: 6 }, out: 'Puentes, lianas y ningún paso en falso.' },
        { t: 'Escuchar las historias de los viejos', fx: { cordura: 8, intelecto: 6, fuerza: 3 }, out: 'La mitad son ciertas y no dicen cuál.' }] },

  /* ════════ MANDALORE ════════ */
  { id: 'w_man_forja', mundo: ['Mandalore', 'Concordia', 'Concord Dawn'], min: 8, max: 200, w: 12,
    t: 'La forja del clan está encendida. El armero acepta aprendices una vez cada muchos años.',
    c: [{ t: 'Presentarte', fx: { intelecto: 8, destreza: 8, fisico: 6 }, habilidad: 'armero', faccion: 'mandalorianos+18', out: '"Este es el Camino." Y te da un martillo.' },
        { t: 'Pedir una pieza de beskar para ti', fx: { creditos: -22000 }, item: 'armadura de beskar (una pieza)', faccion: 'mandalorianos+10' },
        { t: 'Preguntar por tu casco', fx: { cordura: 10, reputacion: 6 }, out: 'Te explican qué significa cada abolladura. Tardan tres horas.' }] },
  { id: 'w_man_credo', mundo: ['Mandalore', 'Concordia'], min: 10, max: 200, w: 11,
    t: 'Hay dos formas de ser mandaloriano y las dos se odian: los del Credo y los que quieren otra cosa.',
    c: [{ t: 'Seguir el Credo al pie de la letra', fx: { cordura: 10, reputacion: 8, carisma: -5 }, faccion: 'mandalorianos+20', flag: 'credo_estricto', out: 'No te quitas el casco delante de nadie. Nunca.' },
        { t: 'Defender una Mandalore nueva', fx: { carisma: 12, intelecto: 6 }, faccion: 'mandalorianos-10', out: 'Te llaman traidor los mismos que te enseñaron a pelear.' },
        { t: 'Irte del planeta y dejarlos discutir', fx: { cordura: 8 }, mover: true, motivo: 'harto de guerras civiles' }] },

  /* ════════ KAMINO ════════ */
  { id: 'w_kam_lluvia', mundo: ['Kamino'], min: 4, max: 200, w: 11,
    t: 'Llueve. Lleva lloviendo desde antes de que existieras y seguirá cuando no estés.',
    c: [{ t: 'Salir a la plataforma a mojarte', fx: { cordura: 12, salud: -3 }, out: 'Te llaman la atención. Vuelves a hacerlo la semana siguiente.' },
        { t: 'Aprenderte el sonido del mar', fx: { cordura: 8, intelecto: 4 }, out: 'Sabes qué tormenta viene por cómo suena.' },
        { t: 'Odiar este sitio en silencio', fx: { cordura: -6, destreza: 5 }, out: 'Cuentas los días para el despliegue.' }] },

  /* ════════ HOTH / MUNDOS HELADOS ════════ */
  { id: 'w_hie_ventisca', mundo: ['Hoth', 'Orto Plutonia', 'Csilla', 'Ilum', 'Mygeeto', 'Kijimi'], min: 8, max: 200, w: 11,
    t: 'Ventisca. Visibilidad de dos metros y alguien no ha vuelto al refugio.',
    c: [{ t: 'Salir a buscarle', r: [{ p: 0.55, t: 'Le encuentras a doscientos metros, sentado.', fx: { alineamiento: 18, salud: -12, reputacion: 10 }, rel: { tipo: 'amigo', afecto: 55, quien: 'a quien sacaste de la ventisca' } },
           { p: 0.45, t: 'Le encuentras tarde.', fx: { cordura: -16, salud: -18 }, herida: { n: 'congelación', sev: 14 } }] },
        { t: 'Esperar a que amaine', fx: { cordura: -8, intelecto: 4 }, out: 'Es lo que dice el protocolo. No ayuda a dormir.' },
        { t: 'Organizar una cuerda de búsqueda', fx: { carisma: 12, intelecto: 8, alineamiento: 12 }, out: 'Seis personas atadas entre sí. Funciona.' }] },

  /* ════════ MUNDOS DE CIUDAD Y FÁBRICA ════════ */
  { id: 'w_ciu_turno', mundo: ['Sullust', 'Duro', 'Bracca', 'Gentes', 'Kuat', 'Sluis Van', 'Ringo Vinda'], min: 12, max: 200, w: 11,
    t: 'La fábrica funciona en tres turnos y aquí no se habla de otra cosa.',
    c: [{ t: 'Entrar en el turno de noche', fx: { creditos: 8000, salud: -8, cordura: -5 }, out: 'Pagan más porque nadie quiere.' },
        { t: 'Meterte en el comité de seguridad', fx: { carisma: 10, reputacion: 10, intelecto: 6 }, flag: 'sindicalista', out: 'Consigues dos barandillas y un extractor.' },
        { t: 'Aprender el oficio de verdad', fx: { intelecto: 12, destreza: 6 }, habilidad: 'ingeniero', out: 'En diez años eres quien arregla lo que nadie entiende.' }] },

  /* ════════ MUNDOS MINEROS ════════ */
  { id: 'w_min_derrumbe', mundo: ['Kessel', 'Mustafar', 'Mygeeto', 'Bracca', 'Sullust', 'Ryloth', 'Ryloth Sur'], min: 12, max: 200, w: 11,
    t: 'Un derrumbe en la galería tres. Hay gente dentro y el capataz calcula costes en voz alta.',
    c: [{ t: 'Entrar a sacarlos', r: [{ p: 0.6, t: 'Sacas a cuatro.', fx: { alineamiento: 20, reputacion: 15, salud: -12, fisico: 5 } },
           { p: 0.4, t: 'Sacas a dos y te quedas dentro seis horas.', fx: { alineamiento: 18, salud: -25, cordura: -10 }, herida: { n: 'pulmones llenos de polvo', sev: 16, cronica: false } }] },
        { t: 'Organizar la excavación desde fuera', fx: { intelecto: 10, carisma: 10, alineamiento: 12 }, out: 'Tardáis más y salen todos.' },
        { t: 'Grabar al capataz diciendo lo que dice', fx: { intelecto: 8, notoriedad: 8 }, flag: 'material_chantaje', out: 'Ese audio vale mucho en las manos correctas.' }] },

  /* ════════ MUNDOS OCEÁNICOS ════════ */
  { id: 'w_oce_marea', mundo: ['Mon Cala', 'Manaan', 'Glee Anselm', 'Ando', 'Kamino', 'Kef Bir'], min: 8, max: 200, w: 10,
    t: 'La marea de temporada sube más de lo previsto y hay barrios bajos que se inundan.',
    c: [{ t: 'Ayudar a evacuar', fx: { alineamiento: 16, reputacion: 10, salud: -6 }, out: 'Barcas, cuerdas y tres días sin dormir.' },
        { t: 'Reparar los diques', fx: { intelecto: 10, fisico: 8, creditos: 4000 }, habilidad: 'ingeniero' },
        { t: 'Comprar barato lo que la gente vende para huir', fx: { creditos: 20000, alineamiento: -20, reputacion: -12 }, out: 'Legal. Repugnante. Rentable.' }] },

  /* ════════ MUNDOS DE FRONTERA ════════ */
  { id: 'w_fro_forastero', mundo: ['Batuu', 'Ord Mantell', 'Nevarro', 'Takodana', 'Jakku', 'Savareen', 'Akiva', 'Vandor'], min: 10, max: 200, w: 11,
    t: 'Llega un forastero al puerto haciendo preguntas y todo el mundo deja de hablar.',
    c: [{ t: 'Contarle lo que quiere saber', fx: { creditos: 3000, reputacion: -8 }, out: 'Se va contento. El pueblo se acuerda.' },
        { t: 'Mentirle bien', fx: { carisma: 12, intelecto: 6 }, out: 'Se va hacia donde no hay nada. Tardará semanas.' },
        { t: 'Seguirle para ver qué busca', fx: { intelecto: 10, destreza: 6 }, r: [{ p: 0.5, t: 'Busca algo que también te interesa.', fx: { creditos: 12000 }, item: true },
           { p: 0.5, t: 'Te descubre y no le gusta.', fx: { salud: -14, notoriedad: 8 } }] },
        { t: 'Avisar a quien esté buscando', fx: { alineamiento: 10, reputacion: 8 }, rel: { tipo: 'contacto', afecto: 40, quien: 'a quien avisaste a tiempo' } }] },

  /* ════════ MUNDOS SAGRADOS ════════ */
  { id: 'w_sag_peregrino', mundo: ['Jedha', 'Ilum', 'Tython', 'Ossus', 'Dorin', 'Ithor'], min: 8, max: 200, w: 11,
    t: 'Los peregrinos llenan las calles y los precios se triplican durante la temporada.',
    c: [{ t: 'Hacerte guía', fx: { creditos: 7000, carisma: 10, intelecto: 5 }, out: 'Te aprendes cuarenta historias sagradas y te crees seis.' },
        { t: 'Peregrinar tú también', fx: { cordura: 16, fuerza: 8, fisico: 5 }, out: 'Andas mucho. Piensas más.' },
        { t: 'Vender reliquias falsas', fx: { creditos: 12000, alineamiento: -18, notoriedad: 8 }, buscado: 15, out: 'Piedras del río con un cordel. Se venden solas.' },
        { t: 'Proteger a los peregrinos de quien los desvalija', combate: { dif: 48 }, fx: { alineamiento: 15, reputacion: 10 } }] },

  /* ════════ MUNDOS DE GUERRA ════════ */
  { id: 'w_gue_ocupacion', mundo: ['Lothal', 'Christophsis', 'Umbara', 'Umbara Profunda', 'Onderon', 'Wobani', 'Corvus', 'Saleucami'],
    min: 10, max: 200, w: 11, slots: { f: 'faccion' },
    t: 'Hay guarnición de {f} en el pueblo y todo el mundo ha aprendido a bajar la mirada.',
    c: [{ t: 'Bajar la mirada como todos', fx: { cordura: -6, reputacion: 3 }, out: 'Se sobrevive así muchos años.' },
        { t: 'Sabotear algo pequeño cada semana', fx: { destreza: 8, notoriedad: 12, alineamiento: 12 }, faccion: 'auto-18', buscado: 20, out: 'Nunca nada grande. Nunca dos veces igual.' },
        { t: 'Hacerte útil para la guarnición', fx: { creditos: 12000, alineamiento: -14, reputacion: -10 }, faccion: 'auto+18', out: 'Comes bien. Cruzas la calle para evitar a los vecinos.' },
        { t: 'Ayudar a esconder a quien buscan', fx: { alineamiento: 20, cordura: 8 }, buscado: 25, rel: { tipo: 'aliado', afecto: 50, quien: 'a quien escondiste' } }] },

  /* ════════ MUNDOS DE LUJO ════════ */
  { id: 'w_luj_casino', mundo: ['Cantonica', 'Zeltros', 'Cato Neimoidia', 'Muunilinst', 'Serenno'], min: 16, max: 200, w: 11,
    t: 'Aquí el dinero de otros se mueve delante de tus narices toda la noche.',
    c: [{ t: 'Jugar en serio', r: [{ p: 0.35, t: 'Buena racha.', fx: { creditos: 30000, carisma: 8, suerte: 6 } },
           { p: 0.65, t: 'La casa siempre gana.', fx: { creditos: -18000, cordura: -6 } }] },
        { t: 'Trabajar en el servicio y escuchar', fx: { creditos: 6000, intelecto: 10, carisma: 6 }, flag: 'material_chantaje', out: 'La gente rica habla como si no hubiera nadie.' },
        { t: 'Buscar de dónde sale ese dinero', fx: { intelecto: 14, cordura: -8, notoriedad: 8 }, flag: 'sabe_demasiado', out: 'Sale de vender armas a los dos bandos. Siempre es eso.' },
        { t: 'Soltar los fathiers del establo', fx: { alineamiento: 15, notoriedad: 14, destreza: 6 }, buscado: 20, out: 'Destrozan medio paseo marítimo. Vale cada crédito de multa.' }] },

  /* ════════ MUNDOS OSCUROS ════════ */
  { id: 'w_osc_tumbas', mundo: ['Korriban', 'Dathomir', 'Exegol', 'Zeffo', 'Dxun', 'Nur', 'Mustafar'], min: 14, max: 200, w: 11,
    t: 'Este sitio tiene algo debajo. No es una metáfora: la gente evita ciertas piedras.',
    c: [{ t: 'Bajar a mirar', r: [{ p: 0.4, t: 'Encuentras algo antiguo y muy despierto.', fx: { fuerza: 16, cordura: -14, alineamiento: -10 }, item: true },
           { p: 0.35, t: 'Encuentras huesos y una advertencia grabada.', fx: { intelecto: 10, cordura: -6 } },
           { p: 0.25, t: 'Encuentras lo que se comió a los anteriores.', combate: { dif: 74 } }] },
        { t: 'Preguntar a los locales', fx: { intelecto: 8, cordura: 5 }, out: 'Te cuentan tres versiones y ninguna tranquiliza.' },
        { t: 'Marcar el sitio y no volver', fx: { cordura: 8, alineamiento: 8 }, flag: 'sitio_marcado' }] },

  /* ════════ MUNDOS AGRÍCOLAS ════════ */
  { id: 'w_agr_cosecha', mundo: ['Naboo', 'Alderaan', 'Chandrila', 'Lothal', 'Cerea', 'Kinyen', 'Ithor', 'Shili', 'Togoria', 'Lasan'],
    min: 6, max: 200, w: 11,
    t: 'Temporada de cosecha. El pueblo entero trabaja de sol a sol y luego cena junto.',
    c: [{ t: 'Trabajar como el que más', fx: { fisico: 8, creditos: 2500, reputacion: 8 }, relTodas: 12, out: 'Te ganas un sitio en la mesa larga.' },
        { t: 'Organizar el reparto', fx: { carisma: 10, intelecto: 8, reputacion: 10 }, out: 'Menos peleas que otros años.' },
        { t: 'Escaquearte y explorar', fx: { intelecto: 6, cordura: 6, reputacion: -6 }, out: 'Encuentras un sitio bonito. Nadie te lo agradece.' },
        { t: 'Vender la cosecha fuera por tu cuenta', fx: { creditos: 12000, reputacion: -10, carisma: 8 }, out: 'Ganas más. Los vecinos toman nota.' }] },

  /* ════════ ESPACIO PROFUNDO / RAREZAS ════════ */
  { id: 'w_raro_señal', mundo: ['Exegol', 'Mundo sin nombre', 'Anzat', 'Af\'El', 'Alpheridies', 'Ilum Profundo'], min: 12, max: 200, w: 11,
    t: 'Aquí las cartas fallan, los relojes discrepan y hay una señal que se repite cada once horas.',
    c: [{ t: 'Seguir la señal', r: [{ p: 0.45, t: 'Llegas a algo que no debería existir.', fx: { intelecto: 14, fuerza: 10, cordura: -12 }, item: true },
           { p: 0.55, t: 'La señal se apaga justo cuando llegas.', fx: { cordura: -8, intelecto: 6 } }] },
        { t: 'Grabarla y venderla', fx: { creditos: 15000, intelecto: 6 }, out: 'Tres compradores distintos y ninguno explica para qué.' },
        { t: 'Irte de aquí cuanto antes', fx: { cordura: 6 }, mover: true, motivo: 'huyendo de un sitio que no cuadra' }] }

  ]);

  /* ---- se suman al conjunto general: el motor filtra por `mundo` ---- */

  /* ════════ los 34 mundos que faltaban por tener lo suyo ════════ */
  push(SW.EVENTOS_MUNDO, [

  { id: 'w_cor_espina', mundo: ['Corellia'], min: 14, max: 200, w: 11,
    t: 'La Espina de Corellia: el tramo de vía por donde pasan los cargueros de Ingeniería. Los chavales lo cruzan corriendo por apuesta.',
    c: [{ t: 'Cruzarlo', r: [{ p: 0.6, t: 'Lo cruzas. Te ganas un mote para siempre.', fx: { destreza: 12, reputacion: 12, cordura: 8 }, apodo: true },
           { p: 0.4, t: 'No calculas el segundo carguero.', fx: { salud: -22 }, herida: { n: 'pierna partida', sev: 16 } }] },
        { t: 'Meterte en los astilleros a aprender de verdad', fx: { intelecto: 10, destreza: 10, creditos: 2200 }, habilidad: 'ingeniero', out: 'De aquí salen los mejores pilotos porque antes fueron los mejores mecánicos.' },
        { t: 'Apuntarte a la lista de pilotos de la Aduana', fx: { faccion: 'auto+15', creditos: 5000, reputacion: 6 }, out: 'Uniforme, sueldo y todo el barrio mirándote raro.' },
        { t: 'Robar un motor y venderlo en el puerto', fx: { creditos: 9000, notoriedad: 12, alineamiento: -10 }, buscado: 15 }] },

  { id: 'w_bes_carbonita', mundo: ['Bespin'], min: 16, max: 200, w: 11,
    t: 'En la plataforma de carbonita de Ciudad Nube buscan operario. Se congela mineral. A veces no solo mineral.',
    c: [{ t: 'Trabajar en la cámara', fx: { creditos: 8000, intelecto: 6, salud: -6 }, habilidad: 'operario de carbonita' },
        { t: 'Preguntar qué congelan los martes', fx: { intelecto: 10, cordura: -8 }, flag: 'sabe_lo_de_bespin', out: 'Te dicen que no preguntes. Con eso ya lo sabes.' },
        { t: 'Bajar a las capas de tibanna con los mineros de gas', fx: { creditos: 12000, fisico: 8, salud: -10 }, out: 'Se cobra el doble por buenas razones.' },
        { t: 'Jugarte el sueldo al sabacc en el salón', r: [{ p: 0.45, t: 'Ganas.', fx: { creditos: 14000, carisma: 6 } }, { p: 0.55, t: 'Pierdes.', fx: { creditos: -6000 } }] }] },

  { id: 'w_dag_cueva', mundo: ['Dagobah'], min: 12, max: 200, w: 12,
    t: 'Hay una cueva bajo el árbol grande. No hay animales dentro. El aire pesa de otra manera.',
    c: [{ t: 'Entrar', fx: { cordura: -10, intelecto: 12, fuerza: 6 }, out: 'Lo que hay dentro solo lo llevas tú. Sales sabiendo algo de ti que preferías no saber.' },
        { t: 'Entrar armado', fx: { cordura: -16, fisico: 6 }, out: 'Sales con el arma en la mano y sin nadie a quien apuntar.' },
        { t: 'No entrar', fx: { cordura: 6, intelecto: 4 }, out: 'Es la respuesta cómoda y a veces la correcta.' },
        { t: 'Acampar fuera y esperar a ver qué sale', fx: { cordura: -6, intelecto: 8 }, out: 'No sale nada. Tres noches. Nada.' }] },

  { id: 'w_geo_arena', mundo: ['Geonosis'], min: 14, max: 200, w: 12,
    t: 'La colmena celebra ejecuciones en la arena. Se paga por asistir y se paga más por participar en la organización.',
    c: [{ t: 'Trabajar en los fosos de bestias', fx: { creditos: 6000, fisico: 8, alineamiento: -10, salud: -8 }, out: 'Alimentas a un acklay durante dos años. Le pones nombre.' },
        { t: 'Sabotear una ejecución', r: [{ p: 0.4, t: 'Escapan tres.', fx: { alineamiento: 22, reputacion: 12 }, buscado: 40 },
           { p: 0.6, t: 'Te descubren y te bajan a la arena.', combate: { dif: 72, botin: 0 }, fx: { alineamiento: 16 } }] },
        { t: 'Entrar en las fábricas de droides', fx: { creditos: 9000, intelecto: 10 }, habilidad: 'ingeniero', out: 'Cadena de montaje bajo tierra, dieciocho horas, sin ver el sol rojo.' },
        { t: 'Irte de esta colmena', mover: 'cerca', motivo: 'porque aquí no hay vida propia', fx: { cordura: 6 } }] },

  { id: 'w_iri_duelo', mundo: ['Iridonia'], min: 14, max: 200, w: 12,
    t: 'En Iridonia una discusión se termina en la plataforma del cañón. No a muerte, pero sí hasta que uno lo reconoce.',
    c: [{ t: 'Aceptar el duelo', combate: { dif: 52, botin: 3000 }, fx: { fisico: 8, reputacion: 8 } },
        { t: 'Aceptar y perder a propósito', fx: { reputacion: -12, cordura: 10, carisma: 8, alineamiento: 8 }, out: 'Le dejas ganar. Los dos lo sabéis. Eso cambia algo.' },
        { t: 'Negarte', fx: { reputacion: -18, cordura: -6 }, out: 'Aquí eso se paga en silencio durante años.' },
        { t: 'Proponer resolverlo trabajando juntos', req: function (s) { return s.stats.carisma > 45; }, fx: { carisma: 14, reputacion: 10, alineamiento: 10 }, rel: { tipo: 'contacto', afecto: 45 } }] },

  { id: 'w_sca_playa', mundo: ['Scarif'], min: 16, max: 200, w: 11,
    t: 'Scarif es un archivo con playas. Te destinan a la torre de datos y las palmeras son lo único que no está clasificado.',
    c: [{ t: 'Archivar sin leer', fx: { creditos: 9000, cordura: 6, intelecto: 4 } },
        { t: 'Leer lo que archivas', fx: { intelecto: 16, cordura: -10 }, flag: 'vio_los_planos', out: 'Hay cosas ahí dentro que no deberías saber que existen.' },
        { t: 'Copiar algo', r: [{ p: 0.4, t: 'Sales con la cinta.', fx: { alineamiento: 20, notoriedad: 14 }, buscado: 60, item: true },
           { p: 0.6, t: 'El escudo se cierra antes de que llegues al puerto.', fx: { carcel: 6 }, buscado: 40 }] },
        { t: 'Pedir el traslado', fx: { cordura: 8 }, mover: 'cerca', motivo: 'traslado solicitado' }] },

  { id: 'w_bot_secreto', mundo: ['Bothawui'], min: 16, max: 200, w: 12,
    t: 'La Spynet bothan compra lo que sepas. Y sabe lo que no le has contado.',
    c: [{ t: 'Vender lo que sabes', fx: { creditos: 20000, notoriedad: 10, alineamiento: -6 }, out: 'Pagan bien y no vuelven a llamarte hasta que les hace falta.' },
        { t: 'Entrar a trabajar para ellos', fx: { intelecto: 14, carisma: 10, creditos: 8000 }, habilidad: 'espía', faccion: 'bothan+25' },
        { t: 'Comprar información en vez de venderla', coste: 12000, fx: { intelecto: 12 }, flag: 'sabe_un_secreto_gordo', out: 'Lo que compras vale mucho más de lo que pagas. Ese es el problema.' },
        { t: 'No jugar a esto', volver: true }] },

  { id: 'w_tra_trofeo', mundo: ['Trandosha'], min: 14, max: 200, w: 12,
    t: 'En Trandosha se cuenta la vida en puntos de caza. Alguien te propone salir a por un wookiee escapado.',
    c: [{ t: 'Ir', fx: { creditos: 14000, alineamiento: -25, notoriedad: 14, fisico: 6 }, out: 'Vuelves con puntos. Y con eso te quedas.' },
        { t: 'Ir y dejarlo escapar', fx: { alineamiento: 22, reputacion: -14, cordura: 12 }, buscado: 20, rel: { tipo: 'contacto', afecto: 70 }, out: 'Nadie de aquí te lo perdona. Él sí.' },
        { t: 'Negarte y cazar bestias en vez de gente', fx: { fisico: 10, destreza: 8, creditos: 6000, alineamiento: 6 }, habilidad: 'cazador' },
        { t: 'Denunciar el mercado de esclavos', fx: { alineamiento: 24, reputacion: 12 }, buscado: 45, out: 'No sirve de nada esta vez. Sirve dentro de veinte años.' }] },

  { id: 'w_rod_caza', mundo: ['Rodia'], min: 13, max: 200, w: 11,
    t: 'En Rodia se es adulto cuando traes tu primera presa. Todo el clan mira.',
    c: [{ t: 'Cazar en la jungla como se ha hecho siempre', fx: { destreza: 12, fisico: 8, reputacion: 10 }, habilidad: 'rastreador' },
        { t: 'Comprar una presa y fingir', r: [{ p: 0.5, t: 'Cuela.', fx: { creditos: -3000, reputacion: 8, cordura: -8 } },
           { p: 0.5, t: 'No cuela y el clan entero lo sabe.', fx: { reputacion: -22, cordura: -10 } }] },
        { t: 'Cazar algo que no debías', fx: { reputacion: 14, alineamiento: -10, notoriedad: 8 }, out: 'Impresiona. También ofende.' },
        { t: 'Decir que no quieres cazar nada', fx: { reputacion: -12, cordura: 10, alineamiento: 8 }, out: 'Tu familia tarda años en volver a hablarte del tema.' }] },

  { id: 'w_sri_contrato', mundo: ['Sriluur'], min: 16, max: 200, w: 11,
    t: 'Una compañía weequay recluta para un contrato en otro sistema. No dicen contra quién.',
    c: [{ t: 'Firmar', fx: { creditos: 16000, fisico: 10, alineamiento: -8 }, guerra: true, habilidad: 'mercenario' },
        { t: 'Firmar solo si te dicen contra quién', fx: { carisma: 10, creditos: 9000 }, out: 'Te lo dicen. Ahora tienes que decidir de verdad.', generar: 'dilema' },
        { t: 'Quedarte a guardar caravanas aquí', fx: { creditos: 6000, destreza: 8, salud: -4 } },
        { t: 'Meterte a sacerdote del templo del clan', fx: { carisma: 10, cordura: 12, intelecto: 6 }, out: 'Sorprende a todo el mundo, tú incluido.' }] },

  { id: 'w_pan_asamblea', mundo: ['Pantora'], min: 15, max: 200, w: 11,
    t: 'La Asamblea Pantorana discute quién manda de verdad en la luna de al lado. Se buscan voluntarios para la expedición.',
    c: [{ t: 'Ir con la expedición', fx: { fisico: 8, intelecto: 8, creditos: 4000 }, mover: 'cerca', motivo: 'con la expedición de la Asamblea' },
        { t: 'Meterte en política', fx: { carisma: 14, intelecto: 10, reputacion: 10 }, habilidad: 'orador', out: 'Descubres que se te da bien y que eso no es del todo bueno.' },
        { t: 'Trabajar en los campos de hielo azul', fx: { creditos: 7000, fisico: 10, salud: -6 } },
        { t: 'Decir en público que la luna no es vuestra', fx: { alineamiento: 18, reputacion: 8, carisma: 8 }, faccion: 'auto-15', out: 'Media Asamblea te odia. La otra media toma nota.' }] },

  { id: 'w_ana_academia', mundo: ['Anaxes'], min: 16, max: 200, w: 12,
    t: 'La Academia Naval de Anaxes. Simuladores dieciséis horas al día y una lista de promoción que todos miran.',
    c: [{ t: 'Estudiar hasta reventar', fx: { intelecto: 16, destreza: 10, salud: -8, cordura: -6 }, habilidad: 'pilotaje', out: 'Sales el tercero de tu promoción.' },
        { t: 'Hacer contactos en vez de notas', fx: { carisma: 16, reputacion: 10, intelecto: 4 }, rel: { tipo: 'contacto', afecto: 50 }, out: 'A largo plazo puede valer más. A corto te suspenden dos.' },
        { t: 'Amañar un simulacro', r: [{ p: 0.45, t: 'Nadie lo detecta y subes veinte puestos.', fx: { intelecto: 8, reputacion: 12, alineamiento: -12 } },
           { p: 0.55, t: 'Consejo de disciplina.', fx: { reputacion: -20, cordura: -8 }, out: 'Expulsado.' }] },
        { t: 'Dejarlo', fx: { cordura: 8, reputacion: -10 }, out: 'No todo el mundo aguanta un uniforme.' }] },

  { id: 'w_esh_escuela', mundo: ['Eshan'], min: 12, max: 200, w: 12,
    t: 'En Eshan se conversa peleando. Un maestro te ofrece plaza en su patio.',
    c: [{ t: 'Aceptar y quedarte años', fx: { destreza: 18, fisico: 12, cordura: 10 }, habilidad: 'esgrima', out: 'Aprendes a leer a alguien antes de que se mueva.' },
        { t: 'Aceptar y marcharte al primer año', fx: { destreza: 8, fisico: 5, cordura: -6 } },
        { t: 'Retar al maestro el primer día', combate: { dif: 78, botin: 0 }, fx: { reputacion: 10 }, out: 'Es una estupidez. También es muy de aquí.' },
        { t: 'Rechazarlo', fx: { cordura: 4 } }] },

  { id: 'w_roc_taller', mundo: ['Roche'], min: 14, max: 200, w: 11,
    t: 'Los verpine de la colmena te dejan mirar cómo montan un arma de precisión. Nadie habla mientras trabajan.',
    c: [{ t: 'Aprender el oficio', fx: { intelecto: 14, destreza: 14 }, habilidad: 'armero', out: 'Cuatro años. Sales sabiendo hacer cosas que casi nadie sabe hacer.' },
        { t: 'Encargar un arma a medida', coste: 18000, fx: { destreza: 4 }, armeria: true, out: 'Tardan ocho meses. Vale cada crédito.' },
        { t: 'Copiar el diseño y venderlo fuera', fx: { creditos: 30000, alineamiento: -16, reputacion: -14 }, buscado: 15, out: 'La colmena no persigue a nadie. Simplemente deja de venderte.' },
        { t: 'Trabajar de portero de la colmena', fx: { creditos: 5000, fisico: 6 } }] },

  { id: 'w_hon_deuda', mundo: ['Honoghr'], min: 14, max: 200, w: 12,
    t: 'Te explican por qué el suelo de Honoghr está muerto y a quién le debe el planeta entero su supervivencia.',
    c: [{ t: 'Aceptar la deuda como todos', fx: { cordura: 6, alineamiento: -4, fisico: 6 }, faccion: 'imperio+20', out: 'Sirves. Es lo que se hace aquí.' },
        { t: 'Ir a mirar los campos por tu cuenta', fx: { intelecto: 14, cordura: -12 }, flag: 'duda_de_la_deuda', out: 'Los números no cuadran. Nadie más los ha mirado.' },
        { t: 'Decirlo en voz alta', fx: { alineamiento: 18, reputacion: 10 }, buscado: 45, out: 'Los ancianos te mandan callar. Uno de ellos te busca esa noche.' },
        { t: 'Irte de Honoghr y no volver', mover: 'cerca', motivo: 'para no deber nada a nadie', fx: { cordura: 8 } }] },

  { id: 'w_gam_clan', mundo: ['Gamorr'], min: 13, max: 200, w: 11,
    t: 'Empieza la temporada de guerra de clanes. Las matriarcas ya han decidido; los machos solo van.',
    c: [{ t: 'Ir a la guerra ritual', fx: { fisico: 14, salud: -14, reputacion: 12 }, herida: { n: 'hachazo', sev: 12 }, out: 'Vuelves. Muchos vuelven. Algunos no.' },
        { t: 'Contratarte de guardaespaldas fuera', fx: { creditos: 12000, fisico: 8 }, mover: 'cerca', motivo: 'contratado como guardaespaldas' },
        { t: 'Ponerte del lado de las matriarcas y organizar', fx: { intelecto: 10, carisma: 12, reputacion: 14 }, out: 'En Gamorr eso es más raro y más poderoso que un hacha.' },
        { t: 'No ir', fx: { reputacion: -16, cordura: 6 } }] },

  { id: 'w_cha_oratoria', mundo: ['Champala'], min: 14, max: 200, w: 11,
    t: 'En Champala las decisiones se toman hablando delante de todo el mundo. Hoy hay un debate y falta quien defienda una postura.',
    c: [{ t: 'Defender lo que crees', fx: { carisma: 16, intelecto: 10, reputacion: 12 }, habilidad: 'orador' },
        { t: 'Defender la postura que nadie quiere', fx: { carisma: 20, intelecto: 12, reputacion: 6 }, out: 'Pierdes el debate y ganas fama de valiente.' },
        { t: 'Aprender de los maestros antes de hablar', fx: { intelecto: 14, carisma: 8 } },
        { t: 'Callarte', fx: { cordura: 4 } }] },

  { id: 'w_fal_corte', mundo: ['Falleen'], min: 16, max: 200, w: 11,
    t: 'La Casa falleen te invita a una recepción. Todo el mundo huele demasiado bien y sonríe demasiado.',
    c: [{ t: 'Jugar el juego', fx: { carisma: 16, creditos: 14000, alineamiento: -8 }, rel: { tipo: 'contacto', afecto: 45 }, out: 'Aprendes a leer una sala en tres minutos.' },
        { t: 'Marcharte a media velada', fx: { cordura: 8, reputacion: -8 } },
        { t: 'Averiguar qué se decide de verdad en esa sala', req: function (s) { return s.stats.intelecto > 45; }, fx: { intelecto: 14, notoriedad: 8 }, flag: 'sabe_de_la_casa', out: 'Detrás de la Casa está el Sol Negro. Ya no puedes no saberlo.' },
        { t: 'Enamorarte de alguien de la Casa', fx: { cordura: 12, carisma: 8 }, nuevaRel: true, out: 'Mala idea con muy buena prensa.' }] },

  { id: 'w_uve_rastro', mundo: ['Uvena Prime'], min: 12, max: 200, w: 11,
    t: 'Bajo las dos lunas, un rastreador shistavanen te propone enseñarte a seguir un rastro de tres días.',
    c: [{ t: 'Aprender', fx: { destreza: 14, intelecto: 10, fisico: 8 }, habilidad: 'rastreador', out: 'Después de esto, cualquier bosque de la galaxia te parece fácil.' },
        { t: 'Aprender y usarlo para cazar gente', fx: { destreza: 12, creditos: 14000, alineamiento: -16, notoriedad: 12 }, habilidad: 'cazarrecompensas' },
        { t: 'Preferir quedarte en la aldea', fx: { cordura: 8, carisma: 6 } }] },

  { id: 'w_om2_feria', mundo: ['Ord Mantell II'], min: 10, max: 200, w: 11,
    t: 'La feria flotante lleva tres generaciones sobre el mar. Aquí se gana dinero de nueve maneras y ocho son mentira.',
    c: [{ t: 'Montar tu propio puesto', fx: { creditos: 6000, carisma: 12, destreza: 6 }, habilidad: 'feriante' },
        { t: 'Trabajar en el truco de otro', fx: { creditos: 3500, carisma: 8, alineamiento: -6 } },
        { t: 'Desmontar el truco delante de todos', fx: { reputacion: 10, carisma: 8, alineamiento: 10 }, out: 'El feriante te odia. La gente te invita a beber.' },
        { t: 'Aprender a pilotar los flotadores', fx: { destreza: 12, intelecto: 8, creditos: 4000 }, habilidad: 'pilotaje' }] },

  { id: 'w_tar_niveles', mundo: ['Taris'], min: 12, max: 200, w: 12,
    t: 'En Taris se vive por niveles. Abajo hay rakghouls y arriba hay bandas, y nadie baja por gusto.',
    c: [{ t: 'Bajar a buscar lo que dejó el bombardeo', r: [{ p: 0.45, t: 'Subes con algo que vale una fortuna.', fx: { creditos: 26000, destreza: 8 }, item: true },
           { p: 0.35, t: 'Subes con las manos vacías y con miedo.', fx: { cordura: -10, destreza: 6 } },
           { p: 0.2, t: 'Te alcanza uno.', fx: { salud: -30 }, herida: { n: 'zarpazo infectado', sev: 20, cronica: true } }] },
        { t: 'Quedarte arriba con una banda', fx: { creditos: 6000, notoriedad: 12, alineamiento: -10 } },
        { t: 'Montar una clínica en la Ciudad Baja', fx: { creditos: -8000, alineamiento: 22, reputacion: 20 }, habilidad: 'medicina' },
        { t: 'Buscar una nave que te saque de Taris', fx: { creditos: -5000 }, mover: 'cerca', motivo: 'porque aquí no hay futuro' }] },

  { id: 'w_nak_refineria', mundo: ['Nal Kesh'], min: 14, max: 200, w: 11,
    t: 'En la refinería de Nal Kesh el turno son catorce horas y el vapor te come los pulmones. Se cobra por turno cumplido.',
    c: [{ t: 'Cumplir los turnos', fx: { creditos: 7000, fisico: 6, salud: -14 }, out: 'Cinco años de esto y ya toses distinto.' },
        { t: 'Organizar a los que están igual', fx: { carisma: 14, reputacion: 16, alineamiento: 14 }, buscado: 25, out: 'El capataz te señala en la lista. Aun así sales adelante.' },
        { t: 'Escapar al pantano', r: [{ p: 0.55, t: 'Nadie te busca demasiado.', fx: { cordura: 10, fisico: 8 }, mover: 'cerca', motivo: 'escapando de la deuda' },
           { p: 0.45, t: 'Te encuentran.', fx: { salud: -18, creditos: -4000 }, herida: { n: 'escarmiento', sev: 14 } }] },
        { t: 'Hacerte capataz tú', fx: { creditos: 14000, alineamiento: -18, reputacion: -14 }, out: 'Se cobra mejor desde este lado. Duele más de lo que esperabas.' }] },

  { id: 'w_ris_escucha', mundo: ['Rishi'], min: 16, max: 200, w: 10,
    t: 'El puesto de escucha de Rishi: cuatro personas, una roca y todas las señales del sector pasando por tus manos.',
    c: [{ t: 'Cumplir el destino sin más', fx: { creditos: 5000, cordura: -8, intelecto: 6 }, out: 'Dos años mirando una pantalla y el mar.' },
        { t: 'Escuchar lo que no te toca', fx: { intelecto: 14, notoriedad: 6 }, flag: 'oyó_algo_en_rishi', out: 'Hay tráfico cifrado que no aparece en ningún registro oficial.' },
        { t: 'Salir a pescar anguilas con los locales', fx: { fisico: 8, cordura: 12, carisma: 6 } },
        { t: 'Pedir el traslado', fx: { cordura: 6 }, mover: 'cerca', motivo: 'traslado desde el puesto' }] },

  { id: 'w_fes_esporas', mundo: ['Felucia Sur'], min: 13, max: 200, w: 11,
    t: 'Las esporas rojas del sur te hablan si respiras el tiempo suficiente. Los chamanes dicen que hay que saber escuchar.',
    c: [{ t: 'Respirarlas con un chamán al lado', fx: { intelecto: 12, cordura: 8, fuerza: 4 }, out: 'Ves cosas. Algunas resultan ser verdad, años después.' },
        { t: 'Respirarlas solo', r: [{ p: 0.5, t: 'Vuelves con una idea que cambia lo que haces.', fx: { intelecto: 16, cordura: -6 } },
           { p: 0.5, t: 'Pierdes tres días y parte de algo más.', fx: { cordura: -20, salud: -10 } }] },
        { t: 'Recolectarlas y venderlas fuera', fx: { creditos: 22000, alineamiento: -12, notoriedad: 10 }, buscado: 15 },
        { t: 'No tocarlas', fx: { cordura: 5 } }] },

  { id: 'w_chal_cantina', mundo: ['Chalmun'], min: 14, max: 200, w: 12,
    t: 'La cantina es del tamaño de un pueblo. En la barra hay contratos, en el reservado hay problemas y en el escenario hay una banda bith.',
    c: [{ t: 'Coger un contrato de la barra', fx: { creditos: 9000, notoriedad: 8 }, generar: 'accion' },
        { t: 'Ponerte a servir copas y escuchar', fx: { creditos: 3000, intelecto: 12, carisma: 10 }, flag: 'oreja_en_la_barra', out: 'Aquí se entera uno de todo antes que en ningún otro sitio del Borde.' },
        { t: 'Meterte en la pelea del fondo', combate: { dif: 45, botin: 2000 }, fx: { fisico: 6 } },
        { t: 'Quedarte a escuchar a la banda', fx: { cordura: 12, carisma: 6 } }] },

  { id: 'w_cra_sal', mundo: ['Crait'], min: 12, max: 200, w: 10,
    t: 'La costra blanca de Crait se rompe bajo tus pies y debajo hay sal roja. Los vulptex de cristal te miran desde la mina vieja.',
    c: [{ t: 'Meterte en la mina abandonada', r: [{ p: 0.55, t: 'Encuentras material que alguien dejó con prisa.', fx: { creditos: 12000 }, item: true },
           { p: 0.45, t: 'Se hunde un tramo detrás de ti.', fx: { salud: -18 }, herida: { n: 'aplastamiento', sev: 14 } }] },
        { t: 'Llevarte un vulptex', fx: { cordura: 12, creditos: -1000 }, mascota: true },
        { t: 'Sacar sal y venderla', fx: { creditos: 5000, fisico: 6, salud: -5 } },
        { t: 'Quedarte a mirar el rastro rojo hasta el horizonte', fx: { cordura: 14 } }] },

  { id: 'w_ajk_base', mundo: ['Ajan Kloss'], min: 15, max: 200, w: 10,
    t: 'Bajo las lianas de Ajan Kloss hay una base que oficialmente no existe. Buscan manos y no preguntan por tu pasado.',
    c: [{ t: 'Quedarte a trabajar', fx: { creditos: 2000, destreza: 10, intelecto: 8, alineamiento: 12 }, faccion: 'rebelion+25', habilidad: 'mecánico' },
        { t: 'Entrenar con ellos', fx: { fisico: 12, destreza: 10, cordura: 8 } },
        { t: 'Vender la ubicación', fx: { creditos: 40000, alineamiento: -30, notoriedad: 20 }, buscado: 50, out: 'Cobras. No vuelves a dormir bien.' },
        { t: 'Irte y no decir nada', fx: { alineamiento: 6, cordura: 4 }, mover: 'cerca', motivo: 'sin decir dónde has estado' }] },

  { id: 'w_pas_festival', mundo: ['Pasaana'], min: 8, max: 200, w: 11,
    t: 'El Festival de los Ancestros solo se celebra cada cuarenta y dos años. Está pasando ahora y te ha tocado vivirlo.',
    c: [{ t: 'Vivirlo entero', fx: { cordura: 20, carisma: 10, salud: 4 }, out: 'Hay quien no lo ve nunca y quien lo ve una vez.' },
        { t: 'Aprender a tejer con los aki-aki', fx: { destreza: 12, carisma: 8, cordura: 10 }, habilidad: 'artesano' },
        { t: 'Aprovechar el gentío para lo tuyo', fx: { creditos: 14000, alineamiento: -10, notoriedad: 8 } },
        { t: 'Cruzar el mar de arenas movedizas', r: [{ p: 0.5, t: 'Llegas al otro lado y encuentras las cuevas.', fx: { intelecto: 10, cordura: 10 }, item: true },
           { p: 0.5, t: 'La arena tira de ti y alguien te saca a tiempo.', fx: { salud: -16, cordura: -8 } }] }] },

  { id: 'w_nei_nidada', mundo: ['Neimoidia'], min: 12, max: 200, w: 11,
    t: 'En Neimoidia los críos se crían solos en los criaderos hasta los siete años. Los que salen, salen con hambre de por vida.',
    c: [{ t: 'Sobrevivir al criadero acumulando', fx: { intelecto: 10, creditos: 3000, alineamiento: -8, cordura: -8 }, flag: 'criado_en_nidada' },
        { t: 'Sobrevivir haciendo alianzas', fx: { carisma: 14, intelecto: 8 }, rel: { tipo: 'contacto', afecto: 55 } },
        { t: 'Entrar a trabajar en la Federación de Comercio', fx: { creditos: 12000, intelecto: 10, alineamiento: -6 }, faccion: 'federacion+20' },
        { t: 'Renegar de todo esto', fx: { alineamiento: 14, cordura: 10, reputacion: -10 }, mover: 'cerca', motivo: 'para no ser un neimoidiano más' }] },

  { id: 'w_cla_musica', mundo: ['Clak\'dor VII'], min: 12, max: 200, w: 11,
    t: 'En Clak\'dor VII dos ciudades-cúpula se hicieron la guerra por una discusión musical. La atmósfera de fuera sigue sin poder respirarse.',
    c: [{ t: 'Entrar en una banda', fx: { carisma: 14, destreza: 10, cordura: 12 }, habilidad: 'música', out: 'De aquí salen las mejores bandas del Borde y no es casualidad.' },
        { t: 'Estudiar química de precisión', fx: { intelecto: 16 }, habilidad: 'químico' },
        { t: 'Salir fuera de la cúpula con filtro', fx: { cordura: 10, salud: -8, intelecto: 6 }, out: 'Ves lo que hicieron. No se te olvida.' },
        { t: 'Montar el negocio de los filtros', fx: { creditos: 18000, intelecto: 8 } }] },

  { id: 'w_kub_datos', mundo: ['Kubindi'], min: 14, max: 200, w: 10,
    t: 'Los kubaz no venden insectos: venden lo que han visto. En Kubindi el mercado de datos es más grande que el de comida.',
    c: [{ t: 'Aprender a informar', fx: { intelecto: 14, carisma: 8, creditos: 7000 }, habilidad: 'informador' },
        { t: 'Comprar un informe sobre alguien', coste: 9000, fx: { intelecto: 8, notoriedad: 4 }, flag: 'tiene_un_informe' },
        { t: 'Trabajar en los criaderos', fx: { creditos: 4000, destreza: 6 } },
        { t: 'Probar la cocina local en serio', fx: { salud: 6, cordura: 8, carisma: 4 }, out: 'Cien preparaciones distintas y todas de bicho. Está buenísimo.' }] },

  { id: 'w_ort_musica', mundo: ['Orto'], min: 8, max: 200, w: 10,
    t: 'En Orto todo suena a algo: los tejados con la lluvia, la torre con el viento, la gente al trabajar.',
    c: [{ t: 'Aprender un instrumento del gremio', fx: { destreza: 12, carisma: 12, cordura: 12 }, habilidad: 'música' },
        { t: 'Hacerte luthier', fx: { destreza: 14, intelecto: 10, creditos: 6000 }, habilidad: 'artesano' },
        { t: 'Salir de Orto a tocar por la galaxia', fx: { carisma: 14, creditos: 9000 }, mover: 'cerca', motivo: 'de gira' },
        { t: 'Quedarte a escuchar y ya', fx: { cordura: 12 } }] },

  { id: 'w_yuz_bosque', mundo: ['Yuzzem'], min: 10, max: 200, w: 10,
    t: 'En el bosque colosal de Yuzzem nadie levanta la voz dos veces. Una compañía maderera acaba de hacerlo.',
    c: [{ t: 'Ponerte del lado del bosque', fx: { alineamiento: 18, reputacion: 14, fisico: 8 }, buscado: 15 },
        { t: 'Trabajar para la compañía', fx: { creditos: 12000, fisico: 10, alineamiento: -12, reputacion: -14 } },
        { t: 'Mediar', req: function (s) { return s.stats.carisma > 45; }, fx: { carisma: 16, reputacion: 12, creditos: 6000, alineamiento: 8 } },
        { t: 'Aprender a moverte por las copas', fx: { destreza: 14, fisico: 8 }, habilidad: 'trepador' }] },

  { id: 'w_dev_matriarcas', mundo: ['Devaron'], min: 12, max: 200, w: 11,
    t: 'En Devaron los hombres se van al espacio y las mujeres gobiernan los valles. Te toca decidir de qué lado de eso estás.',
    c: [{ t: 'Irte al espacio como se espera', fx: { intelecto: 8, cordura: 6, creditos: 3000 }, mover: 'cerca', motivo: 'como todos los hombres de Devaron' },
        { t: 'Quedarte y trabajar las terrazas', fx: { fisico: 10, reputacion: 8, cordura: 8, creditos: 4000 } },
        { t: 'Entrar en el consejo del valle', req: function (s) { return s.stats.carisma > 45; }, fx: { carisma: 14, reputacion: 16, intelecto: 8 }, out: 'Cuesta. Se puede.' },
        { t: 'Hacerte guardián del templo excavado', fx: { cordura: 14, intelecto: 10, fuerza: 4 } }] }

  ]);

  for (let i = 0; i < SW.EVENTOS_MUNDO.length; i++) SW.EVENTOS.push(SW.EVENTOS_MUNDO[i]);

})(window);

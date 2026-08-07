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
  for (let i = 0; i < SW.EVENTOS_MUNDO.length; i++) SW.EVENTOS.push(SW.EVENTOS_MUNDO[i]);

})(window);

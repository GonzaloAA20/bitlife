/* ============================================================
   HOLOVIDA :: eventos de vida (ciclo anual automático)
   Formato de plantilla:
     { id, min, max, w, req(s), slots:{clave:'pool'}, t:'texto {clave}',
       c:[ {t:'opción', fx:{...}, out:'resultado'}  |
           {t:'opción', r:[{p:0.5, t:'resultado', fx:{...}}, ...]} ] }
   Pools de slots: mundo, criatura, lugar, objeto, nombre, faccion, rumor, nave
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS = SW.EVENTOS || [];

  const E = [

  /* ================= INFANCIA (0-5) ================= */
  {
    id: 'inf_primera_palabra', min: 1, max: 3, w: 10, slots: { p: 'mundoAqui' },
    t: 'Dices tu primera palabra en {p}. Tu familia se queda muy callada.',
    c: [
      { t: '"Mamá"', fx: { carisma: 3, cordura: 3 }, out: 'Lloran. Es un buen día.' },
      { t: '"Créditos"', fx: { intelecto: 4, carisma: -2 }, out: 'Tu tío se ríe demasiado fuerte. Ya sabe qué serás.' },
      { t: 'Un idioma que nadie de la casa habla', fx: { fuerza: 8, intelecto: 4 }, out: 'Tu madre mira al techo y no vuelve a mencionarlo.' },
      { t: 'Un insulto huttés perfecto', fx: { carisma: 5, reputacion: -3, notoriedad: 3 }, out: 'La vecina lo cuenta en el mercado durante veinte años.' }
    ]
  },
  {
    id: 'inf_juguete', min: 2, max: 5, w: 9, slots: { o: 'objeto', c: 'criatura' },
    t: 'Tu juguete favorito es un {c} de trapo con un ojo de menos.',
    c: [
      { t: 'Dormir abrazado a él cada noche', fx: { cordura: 6, destreza: -2 }, out: 'Te dura años. Aún lo tienes en algún cajón.' },
      { t: 'Desmontarlo para ver qué hay dentro', fx: { intelecto: 7, cordura: -3 }, out: 'Serrín. Y una decepción temprana con el universo.' },
      { t: 'Cambiarlo por un cuchillo pequeño', fx: { destreza: 6, cordura: -4, notoriedad: 2 }, out: 'A los cuatro años ya negocias mal, pero negocias.' }
    ]
  },
  {
    id: 'inf_levitar', min: 2, max: 5, w: 7, req: function (s) { return s.stats.fuerza > 20; },
    slots: { o: 'objeto' },
    t: 'Sin tocarlo, haces flotar tu cuenco de la cena a través de la habitación.',
    c: [
      { t: 'Reírte y repetirlo', fx: { fuerza: 10, notoriedad: 6 }, out: 'Tu padre cierra las persianas. Alguien podría estar mirando.' },
      { t: 'Asustarte y esconderte', fx: { fuerza: 4, cordura: -6 }, out: 'Aprendes pronto que lo raro se guarda.' },
      { t: 'No volver a hacerlo nunca', fx: { fuerza: -8, cordura: 5, reputacion: 2 }, out: 'Lo entierras tan hondo que casi lo olvidas. Casi.' }
    ]
  },
  {
    id: 'inf_hermano', min: 1, max: 5, w: 8, slots: { n: 'nombre' },
    t: 'Nace tu hermano pequeño: {n}. Ocupa todo el espacio del piso y de la atención.',
    c: [
      { t: 'Cuidarlo como si fuera tuyo', fx: { carisma: 6, cordura: 5 }, rel: { tipo: 'hermano', afecto: 30 }, out: 'Serás su referencia toda la vida.' },
      { t: 'Ignorarlo', fx: { cordura: -3, intelecto: 3 }, rel: { tipo: 'hermano', afecto: -10 }, out: 'Cada uno a su rincón.' },
      { t: 'Intentar venderlo a un jawa', fx: { notoriedad: 6, carisma: 4, reputacion: -6 }, rel: { tipo: 'hermano', afecto: -25 }, out: 'El jawa ofrece 12 créditos. Tus padres intervienen.' }
    ]
  },
  {
    id: 'inf_enfermedad', min: 1, max: 5, w: 6,
    t: 'Contraes fiebre de las arenas. Tres semanas de sudor y voces.',
    c: [
      { t: 'Aguantar en casa (no hay créditos)', r: [
        { p: 0.55, t: 'Sobrevives, pero algo se queda dentro.', fx: { salud: -12, cordura: -4 } },
        { p: 0.45, t: 'Pasas la fiebre entero y sales más duro.', fx: { salud: 4, cordura: 6 } }
      ] },
      { t: 'Que tu familia se endeude por un médico', fx: { salud: 6, creditos: -3000 }, out: 'Te curan. La deuda te sobrevivirá.' },
      { t: 'Un curandero local con hierbas y humo', r: [
        { p: 0.5, t: 'Funciona. Nadie sabe por qué.', fx: { salud: 5, fuerza: 5 } },
        { p: 0.5, t: 'Empeora. El humo era parte del problema.', fx: { salud: -15 } }
      ] }
    ]
  },
  {
    id: 'inf_visitante', min: 3, max: 6, w: 5, slots: { p: 'mundo', n: 'nombre' },
    t: 'Un forastero encapuchado pregunta por ti en la puerta. Tu familia dice que te has ido a {p}.',
    c: [
      { t: 'Espiar desde la ventana', fx: { intelecto: 5, fuerza: 4, cordura: -3 }, flag: 'visto_por_encapuchado', out: 'Levanta la vista. Te mira exactamente a ti. Sonríe y se va.' },
      { t: 'Salir corriendo a saludarle', fx: { fuerza: 8, notoriedad: 8, cordura: -5 }, flag: 'marcado_por_orden', out: 'Te pone una mano en la cabeza, dice "todavía no" y desaparece.' },
      { t: 'Esconderte y no volver a preguntar', fx: { cordura: 4, fuerza: -3 }, out: 'Nunca sabrás quién era. Eso también es una vida.' }
    ]
  },
  {
    id: 'inf_mascota', min: 3, max: 8, w: 8, slots: { c: 'criatura' },
    t: 'Encuentras un {c} bebé herido detrás de casa.',
    c: [
      { t: 'Curarlo y quedártelo', fx: { cordura: 8, creditos: -200 }, mascota: true, out: 'Te sigue a todas partes. Le pones un nombre ridículo.' },
      { t: 'Venderlo en el mercado', fx: { creditos: 600, alineamiento: -6 }, out: 'Pagan bien. No duermes bien.' },
      { t: 'Dejarlo donde estaba', fx: { cordura: -4, intelecto: 2 }, out: 'La naturaleza hace su trabajo. Tú aprendes el tuyo.' }
    ]
  },

  /* ================= NIÑEZ (6-12) ================= */
  {
    id: 'nin_escuela', min: 6, max: 10, w: 10, slots: { p: 'mundoAqui' },
    t: 'Primer día en la escuela del sector de {p}. Huele a desinfectante y a droide viejo.',
    c: [
      { t: 'Empollar y sacar las mejores notas', fx: { intelecto: 10, carisma: -3 }, out: 'Los profesores te adoran. Nadie más.' },
      { t: 'Hacerte el gracioso', fx: { carisma: 10, intelecto: -3 }, out: 'Popularidad instantánea, expediente mediocre.' },
      { t: 'Pelearte el primer día', fx: { destreza: 9, reputacion: -6, notoriedad: 5 }, out: 'Nadie te molesta después. Te llaman por el apellido.' },
      { t: 'Faltar y explorar los muelles', fx: { suerte: 6, intelecto: 4, reputacion: -4 }, out: 'Aprendes cosas que no vienen en el temario.' }
    ]
  },
  {
    id: 'nin_matone', min: 7, max: 13, w: 9, slots: { n: 'nombre' },
    t: '{n}, tres cursos por encima, te quita el almuerzo cada día.',
    c: [
      { t: 'Devolvérsela con una llave inglesa', r: [
        { p: 0.6, t: 'Funciona. Te temen y te expulsan una semana.', fx: { destreza: 10, notoriedad: 6, reputacion: -5 } },
        { p: 0.4, t: 'Falla. Te rompen la nariz.', fx: { salud: -10, cordura: -5, destreza: 4 } }
      ] },
      { t: 'Comprarle con créditos', fx: { creditos: -400, carisma: 5 }, out: 'Aprendes que casi todo el mundo tiene precio.' },
      { t: 'Hacerte su amigo', fx: { carisma: 9 }, rel: { tipo: 'amigo', afecto: 25 }, out: 'Resulta que también le pegan en casa.' },
      { t: 'Denunciarle a la autoridad local', fx: { reputacion: 6, carisma: -6, notoriedad: -3 }, out: 'Se lo llevan. Nadie te habla en dos años.' }
    ]
  },
  {
    id: 'nin_holo', min: 7, max: 12, w: 8, slots: { f: 'faccion' },
    t: 'En el holoproyector de la plaza emiten propaganda de {f}. Los adultos callan; tú miras fijo.',
    c: [
      { t: 'Te lo crees entero', fx: { reputacion: 5, intelecto: -3 }, faccion: 'auto+8', out: 'Recortas el emblema y lo pegas en tu pared.' },
      { t: 'Te da la risa', fx: { carisma: 5, cordura: 4 }, faccion: 'auto-6', out: 'Un vecino te mira mal. Muy mal.' },
      { t: 'Te preguntas quién paga esas emisiones', fx: { intelecto: 9 }, out: 'Empiezas a tirar del hilo. No pararás nunca.' }
    ]
  },
  {
    id: 'nin_chatarra', min: 6, max: 13, w: 9, slots: { l: 'lugar', o: 'objeto' },
    t: 'En {l} encuentras un {o} medio enterrado.',
    c: [
      { t: 'Repararlo tú mismo', r: [
        { p: 0.55, t: 'Funciona. Casi.', fx: { intelecto: 10 }, item: true },
        { p: 0.45, t: 'Explota una chispa y pierdes una ceja.', fx: { salud: -6, intelecto: 6 } }
      ] },
      { t: 'Venderlo tal cual', fx: { creditos: 700, carisma: 4 }, out: 'Te pagan menos de lo que vale. Lo sabes y aceptas.' },
      { t: 'Guardarlo bajo la cama durante años', fx: { cordura: 3 }, item: true, out: 'Algún día servirá. Spoiler: sirve.' }
    ]
  },
  {
    id: 'nin_padre_pierde', min: 6, max: 14, w: 6,
    t: 'Tu padre pierde el trabajo. Las cenas se vuelven más pequeñas y más silenciosas.',
    c: [
      { t: 'Ponerte a trabajar tú también', fx: { creditos: 900, salud: -5, destreza: 6, cordura: -4 }, out: 'A los nueve años ya tienes callos.' },
      { t: 'Robar comida del mercado', r: [
        { p: 0.65, t: 'Nadie te ve. Comes.', fx: { destreza: 8, notoriedad: 4, alineamiento: -4 } },
        { p: 0.35, t: 'Te pillan. Tu padre paga la multa que no tiene.', fx: { reputacion: -8, creditos: -500, cordura: -5 } }
      ] },
      { t: 'Aguantar y estudiar más', fx: { intelecto: 8, cordura: -6 }, out: 'Te prometes que no vivirás así.' }
    ]
  },
  {
    id: 'nin_sueño', min: 6, max: 16, w: 6, req: function (s) { return s.stats.fuerza > 15; },
    slots: { p: 'mundo', c: 'criatura' },
    t: 'Sueñas con {p}, un planeta que nunca has visto, y con un {c} enorme que dice tu nombre.',
    c: [
      { t: 'Anotarlo todo en un datapad', fx: { intelecto: 6, fuerza: 8 }, flag: 'diario_visiones', out: 'El cuaderno crecerá durante décadas.' },
      { t: 'Contárselo a alguien', r: [
        { p: 0.5, t: 'Te toman por raro.', fx: { reputacion: -6, fuerza: 4 } },
        { p: 0.5, t: 'Una anciana te escucha muy seria y te da un colgante.', fx: { fuerza: 12, suerte: 5 }, item: true }
      ] },
      { t: 'Olvidarlo a propósito', fx: { fuerza: -6, cordura: 6 }, out: 'Los sueños vuelven igual, solo que más tarde.' }
    ]
  },
  {
    id: 'nin_carrera', min: 8, max: 14, w: 7, slots: { p: 'mundoAqui' },
    t: 'Se celebra una carrera de vainas ilegal en las afueras de {p}. Puedes colarte en el foso.',
    c: [
      { t: 'Colarte y ayudar a un mecánico', fx: { intelecto: 8, destreza: 6, creditos: 300 }, flag: 'foso_vainas', out: 'Te dejan tocar un motor Radon-Ulzer. No lo olvidas.' },
      { t: 'Apostar tus ahorros', r: [
        { p: 0.35, t: 'Ganas. Muchísimo, para lo que eres.', fx: { creditos: 2500, suerte: 6 } },
        { p: 0.65, t: 'Pierdes todo y algo prestado.', fx: { creditos: -800, cordura: -5, suerte: -3 } }
      ] },
      { t: 'Robar piezas del foso', r: [
        { p: 0.5, t: 'Sales con una válvula de plasma que vale una fortuna.', fx: { creditos: 1800, notoriedad: 6, alineamiento: -5 } },
        { p: 0.5, t: 'Un weequay te levanta del suelo por el cuello.', fx: { salud: -10, notoriedad: 8, destreza: 5 } }
      ] }
    ]
  },
  {
    id: 'nin_prueba_fuerza', min: 8, max: 14, w: 5, req: function (s) { return s.stats.fuerza > 30 && !s.flags.reclutado_orden; },
    t: 'Dos figuras con túnica piden hablar con tus padres a solas. Salen con una oferta: el Templo.',
    c: [
      { t: 'Irte con ellos', fx: { fuerza: 20, cordura: 8, carisma: -6 }, flag: 'reclutado_orden', estudio: 'templo', faccion: 'orden_jedi+25', out: 'No vuelves a ver tu casa hasta muchos años después.' },
      { t: 'Negarte y quedarte con tu familia', fx: { cordura: 12, fuerza: -5, reputacion: 4 }, flag: 'rechazo_orden', out: 'Uno de ellos deja una tarjeta. "Por si cambias de idea."' },
      { t: 'Escapar por la ventana esa misma noche', fx: { destreza: 12, cordura: -8, notoriedad: 6 }, flag: 'fugado', out: 'Duermes en un almacén. Eres libre y tienes mucho frío.' }
    ]
  },
  {
    id: 'nin_amigo', min: 6, max: 16, w: 10, slots: { n: 'nombre', l: 'lugar' },
    t: 'Conoces a {n} en {l}. Os entendéis sin explicaros nada.',
    c: [
      { t: 'Amistad para siempre', fx: { cordura: 8, carisma: 5 }, rel: { tipo: 'amigo', afecto: 45 }, out: 'De esas que aguantan décadas y traiciones.' },
      { t: 'Montar un negocio juntos', fx: { creditos: 500, intelecto: 5, carisma: 5 }, rel: { tipo: 'socio', afecto: 30 }, out: 'Vendéis algo dudoso. Funciona un tiempo.' },
      { t: 'Competir hasta que se rompa', fx: { destreza: 8, intelecto: 6, cordura: -5 }, rel: { tipo: 'rival', afecto: -30 }, out: 'Os hacéis mejores odiándoos.' }
    ]
  },

  /* ================= ADOLESCENCIA (13-17) ================= */
  {
    id: 'ado_primer_beso', min: 13, max: 19, w: 9, slots: { n: 'nombre', l: 'lugar' },
    t: 'En {l}, {n} se acerca demasiado y la conversación deja de tener sentido.',
    c: [
      { t: 'Besarle', fx: { carisma: 8, cordura: 6 }, rel: { tipo: 'pareja', afecto: 40 }, out: 'Se te queda grabado el olor del sitio.' },
      { t: 'Hacer una broma y arruinarlo', fx: { carisma: -4, cordura: -3, intelecto: 3 }, out: 'Lo recordarás con vergüenza a los cuarenta.' },
      { t: 'Preguntarle antes si está seguro', fx: { carisma: 6, reputacion: 5 }, rel: { tipo: 'pareja', afecto: 45 }, out: 'Dice que sí. Y que le gusta que preguntes.' },
      { t: 'Irte sin decir nada', fx: { cordura: -6, fuerza: 3 }, out: 'Hay caminos que se cierran así, en silencio.' }
    ]
  },
  {
    id: 'ado_primer_trabajo', min: 13, max: 18, w: 10, slots: { l: 'lugar', p: 'mundo' },
    t: 'Tu primer curro: turno de noche en {l}.',
    c: [
      { t: 'Trabajar duro y ahorrar', fx: { creditos: 2200, salud: -4, reputacion: 5 }, out: 'La primera cuenta a tu nombre.' },
      { t: 'Robar de la caja poco a poco', r: [
        { p: 0.6, t: 'Nunca lo notan. Aprendes contabilidad creativa.', fx: { creditos: 4000, intelecto: 5, alineamiento: -8, notoriedad: 6 } },
        { p: 0.4, t: 'Lo notan. Te echan y te marcan.', fx: { reputacion: -12, notoriedad: 8, creditos: 300 } }
      ] },
      { t: 'Organizar a los compañeros', fx: { carisma: 12, reputacion: 6, creditos: 900 }, flag: 'sindicalista', out: 'Consigues una hora menos de turno. Y un expediente.' }
    ]
  },
  {
    id: 'ado_academia', min: 15, max: 19, w: 8, slots: { f: 'faccion' },
    t: 'Un reclutador de {f} monta mesa en tu instituto. Prometen viajes, uniforme y comida caliente.',
    c: [
      { t: 'Firmar en el acto', fx: { destreza: 10, reputacion: 6, carisma: -3 }, faccion: 'auto+20', out: 'Te dan un número. Te lo aprendes antes que tu propio nombre.' },
      { t: 'Coger el folleto y pensarlo', fx: { intelecto: 4 }, out: 'El folleto se queda en un cajón, brillando en la oscuridad.' },
      { t: 'Discutir con el reclutador delante de todos', fx: { carisma: 8, reputacion: -6, notoriedad: 8 }, faccion: 'auto-15', out: 'Te aplauden. Y te apuntan en una lista.' }
    ]
  },
  {
    id: 'ado_banda', min: 14, max: 20, w: 8, slots: { p: 'mundo', n: 'nombre' },
    t: 'La banda de {n} controla tu barrio en {p}. Te ofrecen entrar.',
    c: [
      { t: 'Entrar', fx: { notoriedad: 15, destreza: 10, creditos: 1500, reputacion: -8 }, faccion: 'sol_negro+10', rel: { tipo: 'socio', afecto: 20 }, out: 'Te tatúan algo que no podrás borrar barato.' },
      { t: 'Rechazarlo con educación', r: [
        { p: 0.6, t: 'Lo respetan. Más o menos.', fx: { reputacion: 5, cordura: 4 } },
        { p: 0.4, t: 'Te dan una paliza de aviso.', fx: { salud: -14, destreza: 5, cordura: -6 } }
      ] },
      { t: 'Delatarles a la autoridad', r: [
        { p: 0.5, t: 'Caen. Nadie sabe que fuiste tú.', fx: { reputacion: 10, alineamiento: 6, creditos: 1200 } },
        { p: 0.5, t: 'Se enteran. Tienes que dejar el planeta.', fx: { notoriedad: 20, cordura: -10 }, mover: true }
      ] }
    ]
  },
  {
    id: 'ado_kyber', min: 13, max: 25, w: 4, req: function (s) { return s.stats.fuerza > 35 && !s.sable; },
    slots: { p: 'mundo' },
    t: 'Oyes hablar de cuevas de cristal en {p}. Algo tira de ti hacia allí como una cuerda.',
    c: [
      { t: 'Ir. Entrar. Escuchar.', fx: { fuerza: 15, cordura: -6, salud: -6 }, kyber: true, out: 'Sales con un cristal caliente en la mano y sin saber cuánto tiempo ha pasado.' },
      { t: 'Ir, pero venderlo todo', fx: { creditos: 40000, fuerza: -12, alineamiento: -12 }, out: 'Pagan una fortuna. La cueva deja de llamarte para siempre.' },
      { t: 'No ir', fx: { cordura: 6, fuerza: -6 }, out: 'La cuerda se afloja. No del todo.' }
    ]
  },
  {
    id: 'ado_muerte_familiar', min: 12, max: 40, w: 5,
    t: 'Muere alguien de tu familia. La casa se llena de gente que apenas conoces.',
    c: [
      { t: 'Llorar delante de todos', fx: { cordura: 6, carisma: 4, alineamiento: 4 }, out: 'Duele bien, si es que eso existe.' },
      { t: 'Encerrarte y no hablar en semanas', fx: { cordura: -14, fuerza: 8, intelecto: 4 }, out: 'Algo se te endurece por dentro.' },
      { t: 'Buscar culpables', fx: { destreza: 6, alineamiento: -10, notoriedad: 8, cordura: -8 }, flag: 'vendetta', out: 'Ahora tienes una lista. Es un tipo de brújula.' },
      { t: 'Ocuparte de todo el papeleo', fx: { intelecto: 8, cordura: -4, reputacion: 6 }, out: 'Nadie te lo agradece. Lo haces igual.' }
    ]
  },
  {
    id: 'ado_fuga', min: 15, max: 22, w: 7, slots: { p: 'mundo', l: 'lugar' },
    t: 'Un carguero sale de puerto esta noche hacia {p}. El capitán no mira mucho la lista de pasajeros.',
    c: [
      { t: 'Subir sin decir adiós', fx: { destreza: 8, cordura: -8, suerte: 6 }, mover: true, out: 'Ves tu mundo hacerse pequeño por un ojo de buey sucio.' },
      { t: 'Subir después de despedirte bien', fx: { carisma: 6, cordura: 4 }, mover: true, out: 'Tu madre te da comida para tres días. Dura dos.' },
      { t: 'Quedarte', fx: { cordura: 5, reputacion: 4 }, out: 'Ves la nave irse. Piensas en ella cada cierto tiempo.' }
    ]
  },

  /* ================= ADULTO: TRABAJO Y DINERO ================= */
  {
    id: 'adu_ascenso', min: 20, max: 70, w: 8, req: function (s) { return !!s.trabajo; },
    slots: { n: 'nombre' },
    t: 'Se abre una plaza por encima de ti. {n} también la quiere.',
    c: [
      { t: 'Currártelo y presentar el mejor informe', fx: { intelecto: 6 }, ascenso: 0.6, out: 'La meritocracia funciona a veces.' },
      { t: 'Sabotear a {n}', fx: { alineamiento: -12, notoriedad: 6 }, ascenso: 0.8, rel: { tipo: 'rival', afecto: -50 }, out: 'Funciona. Y {n} lo sabe.' },
      { t: 'Cedérsela a {n}', fx: { reputacion: 10, carisma: 5, alineamiento: 8 }, rel: { tipo: 'amigo', afecto: 35 }, out: 'Te debe una enorme. Te servirá más adelante.' },
      { t: 'Pedir el puesto de tu jefe directamente', r: [
        { p: 0.35, t: 'Se ríe. Y luego te lo da.', fx: { carisma: 10 }, ascenso: 1 },
        { p: 0.65, t: 'Se ríe. Solo se ríe.', fx: { reputacion: -6, carisma: 4 } }
      ] }
    ]
  },
  {
    id: 'adu_deuda_hutt', min: 18, max: 80, w: 6, slots: { n: 'nombre', p: 'mundo' },
    t: 'El cártel de {n} el Hutt reclama una deuda tuya (o de tu familia) de 15.000 créditos.',
    c: [
      { t: 'Pagar entero', fx: { creditos: -15000, notoriedad: -6, reputacion: 5 }, faccion: 'hutt+10', out: 'Pagas. Duele. Duermes.' },
      { t: 'Negociar un trabajo a cambio', fx: { notoriedad: 10, destreza: 5 }, faccion: 'hutt+15', flag: 'debe_favor_hutt', out: 'Ahora eres una herramienta con nombre en su libro.' },
      { t: 'Huir del sistema', r: [
        { p: 0.5, t: 'Te pierden la pista. Por ahora.', fx: { notoriedad: 12, cordura: -8 }, mover: true },
        { p: 0.5, t: 'Un cazarrecompensas te encuentra en tres semanas.', fx: { salud: -20, creditos: -8000, notoriedad: 15 } }
      ] },
      { t: 'Matar al mensajero', fx: { alineamiento: -20, notoriedad: 25, destreza: 6 }, faccion: 'hutt-30', flag: 'enemigo_hutt', out: 'Mala idea con clase. Ahora tienes precio.' }
    ]
  },
  {
    id: 'adu_inversion', min: 20, max: 80, w: 7, slots: { p: 'mundo', n: 'nombre' },
    t: '{n} te ofrece invertir en una mina de especia en {p}. Enseña gráficos preciosos.',
    c: [
      { t: 'Meter 10.000 créditos', r: [
        { p: 0.4, t: 'Se multiplica por cinco.', fx: { creditos: 40000, intelecto: 4 } },
        { p: 0.6, t: 'La mina no existía. {n} tampoco, resulta.', fx: { creditos: -10000, intelecto: 6, cordura: -5 } }
      ], coste: 10000 },
      { t: 'Investigar primero', fx: { intelecto: 8 }, r: [
        { p: 0.5, t: 'Es real y entras con ventaja.', fx: { creditos: 18000 } },
        { p: 0.5, t: 'Es un timo, y lo demuestras. {n} desaparece.', fx: { reputacion: 8, carisma: 5 } }
      ] },
      { t: 'Denunciarlo y quedarte con la comisión', fx: { creditos: 3000, reputacion: 6, notoriedad: 4 }, out: 'La autoridad local paga por chivatazos. Poco, pero paga.' }
    ]
  },
  {
    id: 'adu_sabacc', min: 16, max: 90, w: 8, slots: { l: 'lugar', n: 'nombre' },
    t: 'Partida de sabacc en {l}. {n} apuesta algo que no debería.',
    c: [
      { t: 'Jugar limpio', r: [
        { p: 0.42, t: 'Ganas la mano.', fx: { creditos: 6000, carisma: 5, suerte: 3 } },
        { p: 0.58, t: 'Pierdes bien.', fx: { creditos: -4000, cordura: -3 } }
      ] },
      { t: 'Hacer trampas', r: [
        { p: 0.55, t: 'Limpias la mesa.', fx: { creditos: 14000, notoriedad: 8, alineamiento: -8 } },
        { p: 0.45, t: 'Te pillan. La mesa se pone de pie.', fx: { salud: -18, reputacion: -10, creditos: -3000 } }
      ] },
      { t: 'Apostar tu nave', req: function (s) { return !!s.nave; }, r: [
        { p: 0.4, t: 'Ganas la suya. Es mejor.', fx: { creditos: 0 }, naveGana: true },
        { p: 0.6, t: 'Sales del local andando. Sin nave.', fx: { cordura: -12 }, navePierde: true }
      ] },
      { t: 'Mirar y no jugar', fx: { intelecto: 5, cordura: 3 }, out: 'Aprendes las señales de todos. Guardas el dato.' }
    ]
  },
  {
    id: 'adu_herencia', min: 25, max: 85, w: 4, slots: { n: 'nombre', o: 'objeto' },
    t: 'Muere {n}, un pariente que apenas recordabas. Te deja algo en testamento.',
    c: [
      { t: 'Aceptar la herencia', r: [
        { p: 0.45, t: 'Créditos. Bastantes.', fx: { creditos: 55000 } },
        { p: 0.35, t: 'Un {o}. Y una nota que no entiendes.', fx: { cordura: 4 }, item: true },
        { p: 0.20, t: 'Sus deudas. Todas.', fx: { creditos: -20000, notoriedad: 8 } }
      ] },
      { t: 'Renunciar a todo', fx: { cordura: 8, alineamiento: 5 }, out: 'Que se lo repartan otros. Duermes tranquilo.' }
    ]
  },

  /* ================= ADULTO: RELACIONES ================= */
  {
    id: 'adu_amor', min: 18, max: 75, w: 9, slots: { n: 'nombre', p: 'mundo', l: 'lugar' },
    t: 'Conoces a {n} en {l}, en {p}. Se ríen de lo mismo, que es lo importante.',
    c: [
      { t: 'Irte a vivir con {n}', fx: { cordura: 10, carisma: 5, creditos: -3000 }, rel: { tipo: 'pareja', afecto: 60 }, out: 'Compartís un piso pequeño y un futuro grande.' },
      { t: 'Una historia larga y complicada', fx: { cordura: -4, carisma: 8, fuerza: 3 }, rel: { tipo: 'pareja', afecto: 25 }, out: 'Cinco rupturas, seis reconciliaciones.' },
      { t: 'Casarse rápido en una capilla de puerto', fx: { cordura: 12, reputacion: 5, creditos: -1500 }, rel: { tipo: 'cónyuge', afecto: 70 }, casado: true, out: 'Testigos: un droide y un ugnaught borracho.' },
      { t: 'Dejarlo estar', fx: { cordura: -5, fuerza: 5 }, out: 'Hay vidas que se separan sin discusión.' }
    ]
  },
  {
    id: 'adu_hijo', min: 20, max: 60, w: 7, req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'pareja' || r.tipo === 'cónyuge'; }); },
    slots: { n: 'nombre' },
    t: 'Vais a tener un hijo. La galaxia se hace de repente más pequeña y más peligrosa.',
    c: [
      { t: 'Tenerlo y criarlo con todo', fx: { cordura: 12, creditos: -8000, salud: -4 }, hijo: true, out: 'Le pones {n}. Duermes cuatro horas durante tres años.' },
      { t: 'Tenerlo y seguir tu vida igual', fx: { creditos: -4000, alineamiento: -6 }, hijo: true, rel: { tipo: 'hijo', afecto: 10 }, out: 'Crece bien, pero sin ti en las fotos.' },
      { t: 'No es el momento', fx: { cordura: -10, creditos: -1000 }, out: 'Lo hablas mucho. Sigue doliendo un tiempo.' }
    ]
  },
  {
    id: 'adu_traicion', min: 20, max: 80, w: 6, req: function (s) { return s.relaciones.length > 0; },
    slots: { n: 'nombre' },
    t: 'Descubres que alguien cercano lleva tiempo vendiendo información sobre ti.',
    c: [
      { t: 'Enfrentarle en persona', fx: { carisma: 6, cordura: -6 }, r: [
        { p: 0.5, t: 'Confiesa y llora. Tenía motivos.', fx: { alineamiento: 5 } },
        { p: 0.5, t: 'Lo niega todo y desaparece esa noche.', fx: { cordura: -8, notoriedad: 5 } }
      ] },
      { t: 'Usar la información en su contra', fx: { intelecto: 8, alineamiento: -10, creditos: 8000 }, out: 'Aprendes que la venganza tiene cotización.' },
      { t: 'Perdonar', fx: { alineamiento: 12, cordura: 8, reputacion: 4 }, out: 'Cuesta más que golpear. Por eso vale más.' },
      { t: 'Hacerle desaparecer', fx: { alineamiento: -25, notoriedad: 20, cordura: -12, destreza: 5 }, flag: 'sangre_en_manos', out: 'Nadie pregunta. Tú sí, cada noche.' }
    ]
  },
  {
    id: 'adu_droide_amigo', min: 15, max: 90, w: 7, slots: { l: 'lugar' },
    t: 'Compras un droide de segunda mano en {l}. Tiene la memoria a medio borrar y opiniones.',
    c: [
      { t: 'Dejarle la memoria como está', fx: { intelecto: 6, cordura: 8 }, droide: true, out: 'Te cuenta cosas de su dueño anterior. Algunas son horribles.' },
      { t: 'Borrarle todo y empezar de cero', fx: { intelecto: 4, alineamiento: -6 }, droide: true, out: 'Es más obediente. Y menos interesante.' },
      { t: 'Liberarlo', fx: { alineamiento: 12, carisma: 5, creditos: -2000 }, out: 'Se va. Vuelve dos años después, por su cuenta.' }
    ]
  },

  /* ================= ADULTO: ACCIÓN Y PELIGRO ================= */
  {
    id: 'adu_emboscada', min: 16, max: 80, w: 8, slots: { p: 'mundo', l: 'lugar', c: 'criatura' },
    t: 'Te emboscan en {l}, en {p}. Tres siluetas, una salida.',
    c: [
      { t: 'Pelear', combate: { dif: 45 }, out: '' },
      { t: 'Correr', r: [
        { p: 0.6, t: 'Escapas por los tejados.', fx: { destreza: 8, salud: -4 } },
        { p: 0.4, t: 'Te alcanzan a mitad del callejón.', fx: { salud: -22, creditos: -3000 } }
      ] },
      { t: 'Hablar', r: [
        { p: 0.45, t: 'Les convences de que no vale la pena.', fx: { carisma: 12, reputacion: 5 } },
        { p: 0.55, t: 'No les interesa la conversación.', fx: { salud: -15, creditos: -2000 } }
      ] },
      { t: 'Soltar todo lo que llevas y salir andando', fx: { creditos: -5000, cordura: -4, intelecto: 4 }, out: 'Lo material se recupera. Lo otro no siempre.' }
    ]
  },
  {
    id: 'adu_control_imperial', min: 14, max: 80, w: 8, req: function (s) { return s.era !== 'alta_republica' && s.era !== 'republica_tardia'; },
    slots: { p: 'mundo' },
    t: 'Control de identificación en el puerto de {p}. Un oficial muy joven mira tu documentación demasiado tiempo.',
    c: [
      { t: 'Papeles falsos y sonrisa', r: [
        { p: 0.6, t: 'Pasas.', fx: { carisma: 6, notoriedad: 3 } },
        { p: 0.4, t: 'No cuelan. Detención de 48 horas.', fx: { notoriedad: 12, creditos: -4000, cordura: -5 } }
      ] },
      { t: 'Soborno directo', fx: { creditos: -2500 }, r: [
        { p: 0.75, t: 'Lo coge sin mirar.', fx: { notoriedad: -3 } },
        { p: 0.25, t: 'Es de los honestos. Peor para ti.', fx: { notoriedad: 18, creditos: -3000 } }
      ] },
      { t: 'Usar la Fuerza', req: function (s) { return s.poderes.indexOf('persuasion') >= 0; }, fx: { fuerza: 5, cordura: -3 }, out: '"Estos no son los papeles que buscas." Y no lo son.' },
      { t: 'Correr', r: [
        { p: 0.45, t: 'Te pierdes en la multitud.', fx: { destreza: 8, notoriedad: 10 } },
        { p: 0.55, t: 'Disparo de aturdimiento en la espalda.', fx: { salud: -12, notoriedad: 20, creditos: -6000 } }
      ] }
    ]
  },
  {
    id: 'adu_bestia', min: 14, max: 80, w: 7, slots: { c: 'criatura', p: 'mundo' },
    t: 'Un {c} adulto bloquea el único paso hacia el asentamiento en {p}.',
    c: [
      { t: 'Enfrentarlo', combate: { dif: 55, bestia: true }, out: '' },
      { t: 'Rodearlo por el desfiladero (dos días más)', fx: { salud: -6, cordura: -3, intelecto: 4 }, out: 'Llegas tarde y entero. Suele ser buen trato.' },
      { t: 'Domarlo', req: function (s) { return s.stats.fuerza > 40 || s.stats.carisma > 65; }, r: [
        { p: 0.5, t: 'Baja la cabeza. Ahora te sigue.', fx: { fuerza: 8, carisma: 8 }, mascota: true },
        { p: 0.5, t: 'Casi te arranca un brazo.', fx: { salud: -25, destreza: 6 } }
      ] },
      { t: 'Cazarlo y vender la piel', fx: { creditos: 7000, alineamiento: -5, destreza: 6, salud: -10 }, out: 'Los mercados del Borde pagan bien por eso.' }
    ]
  },
  {
    id: 'adu_naufragio', min: 16, max: 80, w: 5, slots: { p: 'mundo' },
    t: 'Fallo de hipermotor. Caes en {p}, un mundo que no estaba en la ruta.',
    c: [
      { t: 'Reparar con lo que haya', r: [
        { p: 0.55, t: 'Vuelas en cuatro días con un motor peor.', fx: { intelecto: 10, salud: -6 } },
        { p: 0.45, t: 'Tres meses varado. Aprendes el idioma local.', fx: { intelecto: 12, carisma: 8, cordura: -6 } }
      ] },
      { t: 'Buscar ayuda en el asentamiento', fx: { carisma: 6, creditos: -4000 }, out: 'Te cobran cuatro veces lo que vale. Sonríes y pagas.' },
      { t: 'Explorar antes de arreglar nada', r: [
        { p: 0.4, t: 'Encuentras ruinas y algo dentro.', fx: { intelecto: 8, fuerza: 10, creditos: 12000 }, item: true },
        { p: 0.6, t: 'Encuentras a los que se estrellaron antes.', fx: { cordura: -10, salud: -8 } }
      ] }
    ]
  },
  {
    id: 'adu_inquisidor', min: 18, max: 70, w: 4,
    req: function (s) { return s.stats.fuerza > 45 && (s.era === 'imperio_temprano' || s.era === 'rebelion'); },
    slots: { p: 'mundo', n: 'nombre' },
    t: 'Una figura de rojo y negro aterriza en {p}. Pregunta por alguien con tu descripción.',
    c: [
      { t: 'Esconder tu presencia en la Fuerza', req: function (s) { return s.poderes.indexOf('ocultar') >= 0; }, fx: { fuerza: 8, cordura: -5 }, out: 'Pasa a tres metros de ti y sigue de largo.' },
      { t: 'Huir del planeta esta noche', fx: { cordura: -8, notoriedad: 8 }, mover: true, out: 'Dejas todo. Otra vez.' },
      { t: 'Enfrentarle', combate: { dif: 80, duelo: true }, out: '' },
      { t: 'Entregarte', fx: { fuerza: -20, cordura: -20, alineamiento: -15, notoriedad: 15 }, faccion: 'imperio+20', flag: 'capturado_inquisidor', out: 'Te llevan a una sala blanca. Sales distinto.' }
    ]
  },
  {
    id: 'adu_rescate', min: 16, max: 80, w: 7, slots: { n: 'nombre', p: 'mundo', l: 'lugar' },
    t: '{n} está retenido en {l}, en {p}. Piden un rescate que no puedes pagar.',
    c: [
      { t: 'Asalto directo', combate: { dif: 60 }, out: '' },
      { t: 'Negociar a la baja', r: [
        { p: 0.5, t: 'Aceptan la mitad.', fx: { creditos: -12000, carisma: 10 }, rel: { tipo: 'amigo', afecto: 40 } },
        { p: 0.5, t: 'Suben el precio por hacerles perder el tiempo.', fx: { creditos: -25000, cordura: -6 } }
      ] },
      { t: 'Entrar disfrazado', r: [
        { p: 0.5, t: 'Sales con {n} y con su cena a medias.', fx: { carisma: 8, destreza: 10 }, rel: { tipo: 'amigo', afecto: 50 } },
        { p: 0.5, t: 'Te descubren dentro.', fx: { salud: -20, notoriedad: 12 } }
      ] },
      { t: 'No hacer nada', fx: { cordura: -15, alineamiento: -12 }, out: 'Vives. Con eso.' }
    ]
  },

  /* ================= ADULTO: FUERZA Y MISTERIO ================= */
  {
    id: 'adu_holocron', min: 18, max: 90, w: 5, req: function (s) { return s.stats.fuerza > 25; },
    slots: { l: 'lugar', p: 'mundo' },
    t: 'En {l} de {p} aparece un holocrón. Se enciende solo cuando te acercas.',
    c: [
      { t: 'Abrirlo con paciencia', fx: { fuerza: 15, intelecto: 8, cordura: -4 }, poder: 'auto_luz', out: 'Una maestra muerta hace siglos te enseña algo nuevo.' },
      { t: 'Forzarlo con rabia', fx: { fuerza: 20, alineamiento: -15, cordura: -12 }, poder: 'auto_oscuro', out: 'Se abre. Grita. Aprendes rápido y mal.' },
      { t: 'Venderlo a un coleccionista', fx: { creditos: 60000, fuerza: -8, notoriedad: 8 }, out: 'Un noble de Cantonica lo pone en una vitrina. Se apaga para siempre.' },
      { t: 'Enterrarlo donde nadie lo encuentre', fx: { alineamiento: 10, cordura: 6 }, out: 'Algunas puertas es mejor dejarlas cerradas.' }
    ]
  },
  {
    id: 'adu_vision', min: 15, max: 90, w: 6, req: function (s) { return s.stats.fuerza > 30; },
    slots: { n: 'nombre', p: 'mundo' },
    t: 'Una visión: {p} en llamas, y {n} de rodillas. No sabes si ya pasó o va a pasar.',
    c: [
      { t: 'Actuar para evitarlo', r: [
        { p: 0.4, t: 'Lo evitas. La visión era un aviso.', fx: { fuerza: 12, alineamiento: 10, reputacion: 8 } },
        { p: 0.6, t: 'Tus actos son justo lo que la provoca.', fx: { fuerza: 8, cordura: -15, alineamiento: -8 } }
      ] },
      { t: 'Ignorarla', fx: { cordura: 5, fuerza: -5 }, out: 'Pasa igual. O no. Nunca lo sabrás.' },
      { t: 'Meditar hasta entenderla', fx: { fuerza: 10, cordura: 8, intelecto: 5 }, out: 'Sale una palabra clara: "espera". Esperas.' }
    ]
  },
  {
    id: 'adu_tentacion', min: 18, max: 90, w: 6, req: function (s) { return s.stats.fuerza > 40; },
    slots: { n: 'nombre' },
    t: 'Tienes a {n} a tu merced. Sería rápido. Nadie lo sabría.',
    c: [
      { t: 'Bajar el arma', fx: { alineamiento: 20, cordura: 10, fuerza: 5 }, out: 'La mano tiembla al bajarla. Eso también es fuerza.' },
      { t: 'Terminar el trabajo', fx: { alineamiento: -25, fuerza: 15, cordura: -15, notoriedad: 10 }, flag: 'sangre_en_manos', out: 'Es más fácil de lo que debería. Eso es lo que asusta.' },
      { t: 'Dejarle vivir pero marcado', fx: { alineamiento: -8, notoriedad: 8, carisma: 6 }, rel: { tipo: 'rival', afecto: -60 }, out: 'Le dejas una cicatriz y un motivo.' }
    ]
  },
  {
    id: 'adu_sable_perdido', min: 18, max: 90, w: 4, req: function (s) { return !!s.sable; },
    t: 'Pierdes tu sable de luz. Simplemente ya no está.',
    c: [
      { t: 'Buscarlo obsesivamente', r: [
        { p: 0.5, t: 'Lo recuperas de un chatarrero que no sabía qué tenía.', fx: { creditos: -3000, fuerza: 5 } },
        { p: 0.5, t: 'No aparece. Alguien lo tiene y lo usa.', fx: { cordura: -10 }, sablePierde: true }
      ] },
      { t: 'Construir uno nuevo', fx: { fuerza: 10, intelecto: 8, cordura: 5 }, sableNuevo: true, out: 'El segundo siempre sale mejor que el primero.' },
      { t: 'Vivir sin él', fx: { cordura: 8, destreza: 6, fuerza: -5 }, sablePierde: true, out: 'Aprendes que el arma no era el punto.' }
    ]
  },

  /* ================= MADUREZ Y VEJEZ ================= */
  {
    id: 'vej_crisis', min: 38, max: 55, w: 7,
    t: 'Te miras en un espejo de un baño de puerto y no reconoces la cara.',
    c: [
      { t: 'Comprar una nave que no puedes pagar', fx: { creditos: -60000, cordura: 10, carisma: 5 }, naveCompra: true, out: 'Ridículo y necesario.' },
      { t: 'Dejarlo todo y volver a casa', fx: { cordura: 15, creditos: -5000, reputacion: -5 }, mover: 'casa', out: 'El sitio ha cambiado menos que tú.' },
      { t: 'Aprender algo nuevo desde cero', fx: { intelecto: 12, cordura: 8 }, out: 'A tu edad. Da igual.' },
      { t: 'Ignorarlo y trabajar más', fx: { creditos: 15000, salud: -8, cordura: -8 }, out: 'Funciona hasta que deja de funcionar.' }
    ]
  },
  {
    id: 'vej_alumno', min: 40, max: 95, w: 7, slots: { n: 'nombre', p: 'mundo' },
    t: 'Un joven de {p}, {n}, te busca para que le enseñes lo que sabes.',
    c: [
      { t: 'Aceptarle como aprendiz', fx: { cordura: 12, reputacion: 10, carisma: 6 }, rel: { tipo: 'aprendiz', afecto: 40 }, out: 'Es un desastre. Como tú a su edad.' },
      { t: 'Rechazarle con una frase críptica', fx: { fuerza: 4, cordura: -4 }, out: 'Se va. Vuelve tres años después, mejor.' },
      { t: 'Usarle para tus fines', fx: { alineamiento: -15, creditos: 12000, carisma: 5 }, rel: { tipo: 'aprendiz', afecto: -20 }, out: 'Aprende. Aprende demasiado.' },
      { t: 'Enseñarle todo, incluso lo que no debería', fx: { fuerza: 8, alineamiento: -8, reputacion: 6 }, rel: { tipo: 'aprendiz', afecto: 55 }, out: 'Le entregas tus errores como si fueran lecciones.' }
    ]
  },
  {
    id: 'vej_salud', min: 55, max: 200, w: 9,
    t: 'El cuerpo empieza a pasar factura. El médico usa la palabra "crónico".',
    c: [
      { t: 'Tratamiento caro de bacta', fx: { creditos: -25000, salud: 18 }, out: 'Compras años. Literalmente.' },
      { t: 'Prótesis cibernéticas', fx: { creditos: -40000, salud: 12, destreza: 15, cordura: -6 }, cibernetica: true, out: 'Zumbas un poco al andar. Corres más que antes.' },
      { t: 'Aceptarlo y vivir despacio', fx: { cordura: 12, salud: -4 }, out: 'Hay dignidad en no pelearse con el tiempo.' },
      { t: 'Ignorar al médico completamente', fx: { salud: -15, cordura: 5, carisma: 4 }, out: 'Sigues bebiendo lo mismo. La cantina te quiere.' }
    ]
  },
  {
    id: 'vej_memorias', min: 55, max: 200, w: 6,
    t: 'Un editor de Chandrila quiere publicar tus memorias.',
    c: [
      { t: 'Contarlo todo', fx: { creditos: 45000, reputacion: -10, notoriedad: 15, cordura: 8 }, flag: 'memorias', out: 'Se vende muchísimo. Pierdes tres amistades.' },
      { t: 'Contar una versión amable', fx: { creditos: 25000, reputacion: 12 }, flag: 'memorias', out: 'Queda bonito. No es del todo cierto.' },
      { t: 'Negarte', fx: { cordura: 6, reputacion: 4 }, out: 'Algunas historias se mueren contigo. Está bien.' },
      { t: 'Escribirlas pero no publicarlas', fx: { cordura: 15, intelecto: 6 }, flag: 'memorias_ocultas', out: 'Tu nieto las encuentra décadas después.' }
    ]
  },
  {
    id: 'vej_legado', min: 60, max: 250, w: 6, slots: { p: 'mundo' },
    t: 'Es momento de decidir qué queda de ti cuando ya no estés.',
    c: [
      { t: 'Repartirlo todo entre los tuyos', fx: { alineamiento: 12, cordura: 12 }, legado: 'familia', out: 'Discuten menos de lo que temías.' },
      { t: 'Fundar algo en {p}', fx: { creditos: -50000, reputacion: 20, cordura: 10 }, legado: 'fundacion', out: 'Una escuela, un refugio, un taller. Lleva tu nombre mal escrito.' },
      { t: 'Enterrarlo todo con una carta de acertijos', fx: { cordura: 8, notoriedad: 10 }, legado: 'tesoro', out: 'Alguien lo buscará durante generaciones.' },
      { t: 'Gastártelo entero antes de morir', fx: { creditos: -999999, cordura: 20, salud: -6 }, legado: 'fiesta', out: 'La fiesta dura once días. Se habla de ella durante décadas.' }
    ]
  },
  {
    id: 'vej_ultimo_viaje', min: 65, max: 300, w: 5, slots: { p: 'mundo' },
    t: 'Todavía te queda un salto en el cuerpo. ¿Adónde?',
    c: [
      { t: 'Al mundo donde naciste', fx: { cordura: 18, salud: -5 }, mover: 'casa', out: 'Está peor y sigue oliendo igual.' },
      { t: 'A {p}, que nunca visitaste', fx: { cordura: 12, suerte: 8 }, mover: true, out: 'Llegas tarde a un sitio precioso.' },
      { t: 'Al lugar donde perdiste a alguien', fx: { cordura: -8, fuerza: 12, alineamiento: 8 }, out: 'Te sientas un rato. No dices nada.' },
      { t: 'A ningún sitio. Te quedas.', fx: { cordura: 10, salud: 5 }, out: 'La galaxia puede venir ella.' }
    ]
  },

  /* ================= COMODINES (cualquier edad adulta) ================= */
  {
    id: 'com_rumor', min: 14, max: 200, w: 9, slots: { r: 'rumor', l: 'lugar', p: 'mundo' },
    t: 'En {l} se habla de {r}, en algún punto de {p}.',
    c: [
      { t: 'Ir a comprobarlo', r: [
        { p: 0.35, t: 'Era verdad. Y era mejor de lo que contaban.', fx: { creditos: 25000, suerte: 8, fuerza: 5 }, item: true },
        { p: 0.4, t: 'Era mentira, pero conoces a alguien útil.', fx: { carisma: 6 }, rel: { tipo: 'contacto', afecto: 20 } },
        { p: 0.25, t: 'Era una trampa.', fx: { salud: -18, creditos: -4000, destreza: 5 } }
      ] },
      { t: 'Vender el rumor a otro', fx: { creditos: 3500, carisma: 5, notoriedad: 4 }, out: 'La información es la única mercancía que se puede vender dos veces.' },
      { t: 'Ignorarlo', fx: { cordura: 3 }, out: 'La galaxia está llena de historias. No puedes ir a todas.' }
    ]
  },
  {
    id: 'com_favor', min: 16, max: 200, w: 8, slots: { n: 'nombre', f: 'faccion' },
    t: '{n}, con contactos en {f}, te pide un favor que no quiere explicar del todo.',
    c: [
      { t: 'Hacerlo sin preguntar', r: [
        { p: 0.5, t: 'Te lo agradece con créditos y silencio.', fx: { creditos: 14000, notoriedad: 6 }, faccion: 'auto+12' },
        { p: 0.5, t: 'Eras la coartada de algo feo.', fx: { notoriedad: 18, reputacion: -10, cordura: -6 } }
      ] },
      { t: 'Exigir saberlo todo primero', fx: { intelecto: 6, carisma: 5 }, r: [
        { p: 0.6, t: 'Te lo cuenta. Aceptas con condiciones.', fx: { creditos: 9000, reputacion: 5 }, faccion: 'auto+8' },
        { p: 0.4, t: 'Se lo pide a otro. Y sale mal para todos.', fx: { cordura: -4 } }
      ] },
      { t: 'Negarte', fx: { reputacion: 3, cordura: 4 }, faccion: 'auto-8', out: 'Se lo apunta. Todos se lo apuntan.' }
    ]
  },
  {
    id: 'com_refugiados', min: 16, max: 200, w: 7, slots: { p: 'mundo' },
    t: 'Una familia de refugiados de {p} te pide sitio en tu transporte. No tienen con qué pagar.',
    c: [
      { t: 'Llevarles gratis', fx: { alineamiento: 18, cordura: 10, creditos: -2000, reputacion: 8 }, out: 'La niña te dibuja tu nave. Lo guardas.' },
      { t: 'Llevarles a cambio de trabajo', fx: { alineamiento: 5, creditos: 1500, carisma: 4 }, out: 'Es justo. Ellos también lo ven así.' },
      { t: 'Denunciarles por la recompensa', fx: { creditos: 9000, alineamiento: -25, notoriedad: 10, reputacion: -12 }, faccion: 'imperio+15', out: 'Cobras rápido. Nadie te mira a los ojos en ese puerto nunca más.' },
      { t: 'Decir que no y seguir tu ruta', fx: { cordura: -5 }, out: 'No es tu guerra. Eso te repites.' }
    ]
  },
  {
    id: 'com_arte', min: 14, max: 200, w: 6, slots: { l: 'lugar', p: 'mundo' },
    t: 'En {l} de {p} hay música en vivo y alguien te empuja al escenario.',
    c: [
      { t: 'Tocar / cantar', r: [
        { p: 0.5, t: 'Sales aplaudido y con propinas.', fx: { carisma: 10, creditos: 1200, cordura: 8 } },
        { p: 0.5, t: 'Es un desastre memorable.', fx: { carisma: 4, cordura: 5, reputacion: -4 } }
      ] },
      { t: 'Bajarte inmediatamente', fx: { cordura: -3 }, out: 'La ocasión no vuelve. Casi ninguna vuelve.' },
      { t: 'Robar la caja mientras todos miran al escenario', fx: { creditos: 4000, alineamiento: -12, notoriedad: 8, destreza: 6 }, out: 'La distracción perfecta eras tú sin subir.' }
    ]
  },
  {
    id: 'com_enfermedad_grave', min: 25, max: 200, w: 4,
    t: 'Un diagnóstico serio. El médico usa palabras largas y evita el plazo.',
    c: [
      { t: 'Tratamiento agresivo', r: [
        { p: 0.6, t: 'Funciona. Sales con la mitad de peso y el doble de perspectiva.', fx: { salud: 10, creditos: -35000, cordura: 10 } },
        { p: 0.4, t: 'No funciona del todo. Ganas tiempo.', fx: { salud: -10, creditos: -35000 } }
      ] },
      { t: 'Buscar una cura en el Borde Exterior', r: [
        { p: 0.35, t: 'Un curandero nautolano hace algo que la ciencia no explica.', fx: { salud: 25, fuerza: 10, creditos: -8000 } },
        { p: 0.65, t: 'Pierdes seis meses y mucho dinero.', fx: { salud: -14, creditos: -18000, cordura: -8 } }
      ] },
      { t: 'No tratarte y vivir a tope', fx: { salud: -20, cordura: 20, creditos: -10000 }, out: 'Haces cosas que llevabas décadas posponiendo.' }
    ]
  },
  {
    id: 'com_fama', min: 20, max: 200, w: 5, req: function (s) { return s.stats.reputacion > 55 || s.stats.notoriedad > 55; },
    slots: { p: 'mundoAqui' },
    t: 'Sales en las noticias de {p}. La foto es horrible y el titular peor.',
    c: [
      { t: 'Aprovechar el momento', fx: { carisma: 10, creditos: 12000, reputacion: 6 }, out: 'Firmas cosas. Cobras por aparecer.' },
      { t: 'Desmentirlo todo', fx: { reputacion: 8, notoriedad: -8, carisma: 4 }, out: 'Nadie lee los desmentidos, pero queda registrado.' },
      { t: 'Desaparecer una temporada', fx: { notoriedad: -15, cordura: 10, creditos: -5000 }, out: 'Una casa pequeña, sin holonet, tres meses.' },
      { t: 'Alimentar el escándalo', fx: { notoriedad: 20, carisma: 8, reputacion: -12, creditos: 20000 }, out: 'Malo para el alma, buenísimo para el bolsillo.' }
    ]
  },
  {
    id: 'com_guerra', min: 16, max: 200, w: 6, slots: { p: 'mundo', f: 'faccion' },
    t: 'La guerra llega a {p}. {f} pide voluntarios y la evacuación va lenta.',
    c: [
      { t: 'Alistarte', fx: { destreza: 12, salud: -10, reputacion: 8 }, faccion: 'auto+25', guerra: true, out: 'Te dan un arma y tres horas de formación.' },
      { t: 'Ayudar en la evacuación', fx: { alineamiento: 20, cordura: -6, salud: -8, reputacion: 12 }, out: 'Sacas a 340 personas. Recuerdas las caras de las que no.' },
      { t: 'Aprovechar el caos para hacer negocio', fx: { creditos: 45000, alineamiento: -20, notoriedad: 12 }, out: 'El agua se vende cara cuando escasea.' },
      { t: 'Irte antes de que empiece', fx: { cordura: -6, suerte: 6 }, mover: true, out: 'Los que se van a tiempo también cuentan historias.' }
    ]
  },
  {
    id: 'com_reencuentro', min: 25, max: 200, w: 6, req: function (s) { return s.relacionesPasadas.length > 0 || s.relaciones.length > 1; },
    slots: { l: 'lugar', n: 'nombre' },
    t: 'En {l} te cruzas con alguien de tu pasado. Han cambiado, pero no tanto.',
    c: [
      { t: 'Invitarle a una copa', fx: { cordura: 10, carisma: 5, creditos: -200 }, out: 'Cuatro horas de puesta al día. Ninguna promesa.' },
      { t: 'Fingir que no le has visto', fx: { cordura: -6 }, out: 'Él también finge. Los dos lo sabéis.' },
      { t: 'Ajustar cuentas viejas', r: [
        { p: 0.5, t: 'Os gritáis. Y luego os abrazáis.', fx: { cordura: 12, carisma: 6 } },
        { p: 0.5, t: 'Acaba en el suelo de la cantina.', fx: { salud: -10, reputacion: -6, destreza: 4 } }
      ] },
      { t: 'Proponerle un último trabajo juntos', fx: { creditos: 18000, destreza: 6, notoriedad: 8 }, rel: { tipo: 'socio', afecto: 30 }, out: 'Como en los viejos tiempos, con más artritis.' }
    ]
  },
  {
    id: 'com_dilema_droide', min: 18, max: 200, w: 5, req: function (s) { return !!s.droide; },
    t: 'Tu droide empieza a hacer preguntas que no están en su programación.',
    c: [
      { t: 'Contestarle en serio', fx: { intelecto: 8, cordura: 10, alineamiento: 8 }, out: 'Nunca sabrás si entiende. Pero pregunta mejor cada vez.' },
      { t: 'Borrarle la memoria', fx: { alineamiento: -12, cordura: -6 }, out: 'Vuelve a ser una herramienta. Echas de menos las preguntas.' },
      { t: 'Registrarlo como ciudadano', fx: { creditos: -6000, alineamiento: 15, reputacion: 8 }, flag: 'droide_libre', out: 'El funcionario tarda cuatro horas y se lo toma a mal.' }
    ]
  },
  {
    id: 'com_despertar', min: 9, max: 60, w: 3, req: function (s) { return !s.sensible && s.especie !== 'droide'; },
    slots: { l: 'lugar', c: 'criatura' },
    t: 'En {l}, un {c} se abalanza sobre ti. Levantas la mano por instinto y el animal se detiene en el aire.',
    c: [
      { t: 'Mirarte la mano en silencio', despertar: true, fx: { cordura: -6, intelecto: 4 }, out: 'Tardarás años en atreverte a repetirlo.' },
      { t: 'Probar otra vez, ahora mismo', despertar: true, fx: { fuerza: 8, salud: -6 }, out: 'Funciona. Te sangra la nariz, pero funciona.' },
      { t: 'Convencerte de que fue el viento', fx: { cordura: 8, suerte: 4 }, out: 'Fue el viento. Seguro que fue el viento.' }
    ]
  },
  {
    id: 'com_epidemia', min: 12, max: 200, w: 5, slots: { p: 'mundo' },
    t: 'Una plaga respiratoria recorre {p}. Cierran los puertos y suben los precios del bacta.',
    c: [
      { t: 'Encerrarte y esperar', fx: { salud: 5, cordura: -10, creditos: -3000 }, out: 'Meses de techo y ruido de ventilación.' },
      { t: 'Ofrecerte como voluntario sanitario', r: [
        { p: 0.6, t: 'Salvas gente. Te lo reconocen.', fx: { reputacion: 15, alineamiento: 15, cordura: 6, salud: -8 } },
        { p: 0.4, t: 'La coges tú también.', fx: { salud: -25, alineamiento: 12, reputacion: 10 } }
      ] },
      { t: 'Acaparar medicinas y revenderlas', fx: { creditos: 40000, alineamiento: -25, reputacion: -15, notoriedad: 12 }, out: 'Fortuna rápida, apellido manchado.' },
      { t: 'Salir del planeta antes del cierre', fx: { creditos: -8000, suerte: 5 }, mover: true, out: 'Último transporte. Precio de último transporte.' }
    ]
  },
  {
    id: 'com_maquina', min: 16, max: 200, w: 5, slots: { l: 'lugar' },
    t: 'En {l} encuentras una máquina prerrepublicana que sigue funcionando. Nadie sabe qué hace.',
    c: [
      { t: 'Encenderla', r: [
        { p: 0.3, t: 'Proyecta un mapa de rutas que ya no existen.', fx: { intelecto: 12, creditos: 25000 }, item: true },
        { p: 0.35, t: 'Habla en un idioma muerto. Grabas todo.', fx: { intelecto: 15, fuerza: 6, cordura: -6 } },
        { p: 0.35, t: 'Explota. Menos mal que estabas agachado.', fx: { salud: -20, intelecto: 5 } }
      ] },
      { t: 'Desmontarla y vender las piezas', fx: { creditos: 18000, intelecto: 6 }, out: 'Valen más de lo que pesan.' },
      { t: 'Dejarla como está y marcar el sitio', fx: { intelecto: 5, cordura: 5 }, flag: 'sitio_marcado', out: 'Volverás. O no. Está anotado.' }
    ]
  },
  {
    id: 'vej_nietos', min: 50, max: 250, w: 6,
    req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo' && s.edad - r.desde > 20; }); },
    t: 'Te hacen abuelo. La criatura te mira como si supiera algo.',
    c: [
      { t: 'Volcarte con ellos', fx: { cordura: 18, salud: 4 }, relHijos: 20, out: 'La mejor etapa y nadie te avisó.' },
      { t: 'Contarles todas tus historias, incluso las malas', fx: { cordura: 12, reputacion: 5 }, flag: 'memorias_orales', out: 'Se las aprenden de memoria.' },
      { t: 'Mantener las distancias', fx: { cordura: -8 }, relHijos: -10, out: 'No sabes hacerlo mejor.' }
    ]
  },
  {
    id: 'com_apuesta_vida', min: 18, max: 200, w: 5, slots: { n: 'nombre', l: 'lugar' },
    t: '{n} te reta en {l}: una apuesta única, todo o nada.',
    c: [
      { t: 'Apostar la mitad de todo lo que tienes', r: [
        { p: 0.45, t: 'Ganas. La mesa se calla.', fx: { creditos: 0, carisma: 10 }, apuesta: 'gana' },
        { p: 0.55, t: 'Pierdes. Sales con las manos en los bolsillos.', fx: { carisma: 4 }, apuesta: 'pierde' }
      ] },
      { t: 'Apostar un año de trabajo gratis', r: [
        { p: 0.5, t: 'Ganas y {n} te debe un año.', fx: { creditos: 30000, reputacion: 6 } },
        { p: 0.5, t: 'Pierdes. Un año de tu vida es de otro.', fx: { creditos: -1000, cordura: -12, destreza: 8 }, flag: 'año_perdido' }
      ] },
      { t: 'Rechazar el reto', fx: { reputacion: -4, cordura: 6, intelecto: 4 }, out: 'La gente inteligente pierde muchas oportunidades de arruinarse.' }
    ]
  }

  ];

  for (let i = 0; i < E.length; i++) SW.EVENTOS.push(E[i]);

})(window);

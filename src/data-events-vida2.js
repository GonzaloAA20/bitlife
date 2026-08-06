/* ============================================================
   HOLOVIDA :: segundo bloque de eventos de vida
   Más variedad por franja de edad, con consecuencias que
   arrastran (banderas que abren o cierran caminos después).
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  push(SW.EVENTOS, [

  /* ================= INFANCIA ================= */
  {
    id: 'i2_hambre', min: 3, max: 10, w: 9, slots: { p: 'mundo' },
    t: 'Mala cosecha en {p}. En casa se come una vez al día y nadie lo comenta.',
    c: [
      { t: 'Repartir tu parte con tu hermano pequeño', fx: { alineamiento: 14, cordura: 8, fisico: -6 }, relTodas: 20, out: 'Creces menos. Creces distinto.' },
      { t: 'Aprender a buscar comida fuera', fx: { destreza: 8, intelecto: 8, fisico: 4 }, habilidad: 'rastreador', out: 'Raíces, huevos y trampas. Nunca se te olvida.' },
      { t: 'Robar del almacén comunal', r: [
        { p: 0.6, t: 'Coméis. Nadie pregunta.', fx: { destreza: 8, alineamiento: -8, notoriedad: 4 } },
        { p: 0.4, t: 'Te pillan y el pueblo entero lo sabe.', fx: { reputacion: -14, cordura: -8, destreza: 5 } }
      ] }
    ]
  },
  {
    id: 'i2_maestro', min: 5, max: 12, w: 9, slots: { n: 'nombre' },
    t: 'Un maestro de escuela, {n}, se fija en ti y te deja libros que no tocan a tu edad.',
    c: [
      { t: 'Leerlos todos', fx: { intelecto: 14, carisma: -3 }, flag: 'lector', out: 'Descubres que la galaxia es enorme y que tú estás en un punto muy pequeño.' },
      { t: 'Venderlos', fx: { creditos: 900, alineamiento: -8, intelecto: -3 }, out: 'Pagan bien por papel de verdad. {n} no vuelve a mirarte igual.' },
      { t: 'Pedirle que te enseñe fuera de clase', fx: { intelecto: 12, carisma: 8 }, rel: { tipo: 'mentor', afecto: 50 }, out: 'Dos tardes por semana durante seis años.' }
    ]
  },
  {
    id: 'i2_accidente', min: 4, max: 14, w: 8, slots: { l: 'lugar' },
    t: 'Te caes desde muy alto en {l}. Se oye el golpe desde lejos.',
    c: [
      { t: 'Levantarte y no decírselo a nadie', fx: { fisico: 4, cordura: 6 }, herida: { n: 'fractura mal soldada', sev: 14 }, out: 'Suelda torcido. Te dolerá los días de humedad toda la vida.' },
      { t: 'Que te lleven al médico', fx: { creditos: -3000, salud: 5 }, herida: { n: 'fractura en recuperación', sev: 8 }, out: 'Escayola y tres meses quieto. Lees mucho.' },
      { t: 'Curandera del pueblo', r: [
        { p: 0.5, t: 'Te coloca el hueso en un movimiento. Perfecto.', fx: { fisico: 4, salud: 3 } },
        { p: 0.5, t: 'Empeora. Y duele el doble.', fx: { salud: -8 }, herida: { n: 'hueso mal colocado', sev: 16 } }
      ] }
    ]
  },
  {
    id: 'i2_musica', min: 4, max: 14, w: 8, slots: { l: 'lugar' },
    t: 'Alguien toca en {l} y te quedas parado en medio de la calle sin poder moverte.',
    c: [
      { t: 'Pedir que te enseñen', fx: { carisma: 12, cordura: 8, intelecto: 4 }, habilidad: 'musico', out: 'Empiezas con un instrumento prestado y desafinado.' },
      { t: 'Aprender de oído tú solo', fx: { carisma: 8, intelecto: 8, cordura: 6 }, habilidad: 'musico', out: 'Nadie te corrige. Tocas raro y muy tuyo.' },
      { t: 'Seguir andando', fx: { cordura: -2 }, out: 'Te acordarás de esa melodía cuarenta años después.' }
    ]
  },

  /* ================= ADOLESCENCIA ================= */
  {
    id: 'a2_deporte', min: 12, max: 22, w: 10, slots: { p: 'mundo' },
    t: 'Hay liga de deslizadores en {p}. Los equipos buscan gente que no tenga miedo.',
    c: [
      { t: 'Entrar en el equipo', fx: { fisico: 14, destreza: 12, carisma: 8, salud: -4 }, habilidad: 'atleta', out: 'Cuatro temporadas, dos costillas y muchos amigos.' },
      { t: 'Apostar en los partidos', r: [
        { p: 0.4, t: 'Lees bien las apuestas y sacas dinero.', fx: { creditos: 6000, intelecto: 8, suerte: 5 } },
        { p: 0.6, t: 'Pierdes lo que no tenías.', fx: { creditos: -4000, cordura: -6, notoriedad: 5 } }
      ] },
      { t: 'Hacerte el mecánico del equipo', fx: { intelecto: 12, carisma: 6, creditos: 2500 }, habilidad: 'ingeniero', out: 'Aprendes más en el foso que en clase.' },
      { t: 'No te interesa nada de eso', fx: { intelecto: 6, cordura: 4 }, out: 'Otros sábados, otras cosas.' }
    ]
  },
  {
    id: 'a2_expediente', min: 14, max: 22, w: 9,
    t: 'Se decide tu futuro académico en una reunión a la que no te han invitado.',
    c: [
      { t: 'Presentarte igualmente y defenderte', fx: { carisma: 14, reputacion: 8, intelecto: 5 }, out: 'Se hace un silencio incómodo. Cambian la decisión.' },
      { t: 'Aceptar lo que decidan', fx: { cordura: -6, reputacion: 4 }, out: 'Te destinan a formación técnica básica. Podría ser peor.' },
      { t: 'Sabotear el expediente', r: [
        { p: 0.5, t: 'Nadie descubre nada. Empiezas de cero en otro sitio.', fx: { intelecto: 10, notoriedad: 8, alineamiento: -8 } },
        { p: 0.5, t: 'Te expulsan del sistema educativo del sector.', fx: { reputacion: -18, destreza: 8, notoriedad: 10 } }
      ] }
    ]
  },
  {
    id: 'a2_primera_nave', min: 14, max: 26, w: 9, slots: { l: 'lugar' },
    t: 'En {l} hay un cacharro volador abandonado. Con trabajo, podría despegar.',
    c: [
      { t: 'Dedicarle dos años de tu vida', fx: { intelecto: 16, destreza: 10, creditos: -8000 }, naveCompra: true, habilidad: 'ingeniero', out: 'Vuela. Hace un ruido horrible, pero vuela y es tuya.' },
      { t: 'Venderla por piezas', fx: { creditos: 14000, intelecto: 6 }, out: 'Dinero rápido y una espina clavada.' },
      { t: 'Dormir dentro cuando hace falta', fx: { cordura: 6, salud: -4 }, flag: 'casa_chatarra', out: 'No vuela, pero tiene techo. A veces basta.' }
    ]
  },
  {
    id: 'a2_bandera', min: 14, max: 30, w: 9, slots: { f: 'faccion', p: 'mundo' },
    t: 'Manifestación en {p} contra {f}. Hay más gente de la que nadie esperaba.',
    c: [
      { t: 'Ir y quedarte hasta el final', fx: { carisma: 10, notoriedad: 12, cordura: 8, alineamiento: 10 }, faccion: 'auto-15', out: 'Cargan al anochecer. Corres con gente que no conocías esta mañana.' },
      { t: 'Ir a mirar desde lejos', fx: { intelecto: 6 }, out: 'Ves lo que pasa. Te lo guardas.' },
      { t: 'Informar de quién estaba', fx: { creditos: 5000, alineamiento: -20, reputacion: -10 }, faccion: 'auto+18', flag: 'delator', out: 'Nunca sabrán que fuiste tú. Tú sí.' },
      { t: 'Organizar la siguiente', fx: { carisma: 16, notoriedad: 18, reputacion: 8 }, flag: 'agitador', faccion: 'auto-25', out: 'Ahora hay una foto tuya en un archivo.' }
    ]
  },

  /* ================= ADULTO ================= */
  {
    id: 'ad2_socio', min: 20, max: 200, w: 10, slots: { n: 'nombre', l: 'lugar' },
    t: '{n} te propone montar un negocio en {l}. Tiene la idea; tú tendrías que poner el resto.',
    c: [
      { t: 'Entrar a medias', r: [
        { p: 0.45, t: 'Funciona muy por encima de lo previsto.', fx: { creditos: 55000, carisma: 8 }, rel: { tipo: 'socio', afecto: 55 } },
        { p: 0.35, t: 'Va tirando, sin más.', fx: { creditos: 9000 }, rel: { tipo: 'socio', afecto: 30 } },
        { p: 0.2, t: '{n} desaparece con la caja.', fx: { creditos: -20000, cordura: -10, intelecto: 6 }, rel: { tipo: 'rival', afecto: -60 } }
      ], coste: 15000 },
      { t: 'Entrar solo como inversor callado', fx: { creditos: -8000 }, r: [
        { p: 0.5, t: 'Cobras dividendos durante años.', fx: { creditos: 26000 } },
        { p: 0.5, t: 'Cierra en dos años.', fx: { creditos: -3000, intelecto: 5 } }
      ] },
      { t: 'Robarle la idea y montarlo tú', fx: { creditos: 30000, alineamiento: -20, carisma: 6 }, rel: { tipo: 'rival', afecto: -70 }, out: 'Sale bien. Te cruzas con {n} cada cierto tiempo.' },
      { t: 'Decir que no', fx: { cordura: 4 }, out: 'Lees sobre el negocio años después. Le fue bien.' }
    ]
  },
  {
    id: 'ad2_mentor_muere', min: 22, max: 200, w: 8,
    req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'mentor' || r.tipo === 'general jedi'; }); },
    t: 'Muere la persona que te enseñó lo que sabes.',
    c: [
      { t: 'Terminar lo que dejó empezado', fx: { cordura: 10, intelecto: 10, reputacion: 10 }, matarRel: 'mentor', out: 'Te lleva años. Sale bien.' },
      { t: 'Encerrarte con sus cosas una semana', fx: { cordura: -8, fuerza: 8, intelecto: 6 }, matarRel: 'mentor', out: 'Encuentras cartas que no eran para ti.' },
      { t: 'Seguir como si nada', fx: { cordura: -16, destreza: 6 }, matarRel: 'mentor', out: 'Funciona hasta que un día, en una cola cualquiera, se te cae encima.' }
    ]
  },
  {
    id: 'ad2_juicio', min: 20, max: 200, w: 8, slots: { n: 'nombre' },
    t: 'Te citan como testigo en un juicio. Lo que digas hunde o salva a {n}.',
    c: [
      { t: 'Decir la verdad entera', fx: { alineamiento: 15, reputacion: 12, notoriedad: 8 }, out: 'Condenan a {n}. Su familia te espera fuera del juzgado.' },
      { t: 'Mentir para salvarle', fx: { alineamiento: -8, cordura: -8, notoriedad: 10 }, rel: { tipo: 'contacto', afecto: 60 }, out: 'Sale libre. Ahora te debe todo y lo sabéis los dos.' },
      { t: 'Decir que no recuerdas nada', fx: { cordura: -4, reputacion: -6 }, out: 'La respuesta cobarde también es una respuesta.' },
      { t: 'No presentarte', fx: { notoriedad: 12, creditos: -6000 }, out: 'Multa por desacato y una carpeta con tu nombre.' }
    ]
  },
  {
    id: 'ad2_incendio', min: 16, max: 200, w: 8, slots: { l: 'lugar', p: 'mundo' },
    t: 'Arde {l} en {p}. Hay gente dentro y el cuerpo de bomberos tarda.',
    c: [
      { t: 'Entrar a sacar a quien puedas', r: [
        { p: 0.6, t: 'Sacas a dos. El techo aguanta lo justo.', fx: { alineamiento: 25, reputacion: 18, salud: -14, fisico: 4 } },
        { p: 0.4, t: 'Sacas a uno y pagas caro.', fx: { alineamiento: 25, reputacion: 20, salud: -26 }, herida: { n: 'quemaduras en brazos y espalda', sev: 20 } }
      ] },
      { t: 'Organizar a la gente desde fuera', fx: { carisma: 14, intelecto: 8, alineamiento: 12 }, out: 'Cadena de cubos, orden y menos pánico. Funciona.' },
      { t: 'Aprovechar para vaciar los locales de al lado', fx: { creditos: 22000, alineamiento: -30, notoriedad: 14 }, out: 'Nadie mira. Tú tampoco te miras.' },
      { t: 'Grabarlo todo y venderlo a la HoloRed', fx: { creditos: 9000, alineamiento: -12, carisma: 6 }, out: 'Las imágenes dan la vuelta al sector.' }
    ]
  },
  {
    id: 'ad2_hallazgo', min: 18, max: 200, w: 8, slots: { o: 'objeto', l: 'lugar' },
    t: 'En {l} encuentras un {o} que claramente pertenece a alguien.',
    c: [
      { t: 'Buscar a su dueño', r: [
        { p: 0.55, t: 'Lo encuentras. Te lo agradece de una forma que no esperabas.', fx: { alineamiento: 15, carisma: 8, creditos: 6000 }, rel: { tipo: 'contacto', afecto: 45 } },
        { p: 0.45, t: 'El dueño está muerto y su familia te deja quedártelo.', fx: { alineamiento: 10, cordura: -4 }, item: true }
      ] },
      { t: 'Quedártelo sin más', fx: { alineamiento: -8 }, item: true, out: 'Quien lo perdió lo buscará mucho tiempo.' },
      { t: 'Venderlo hoy mismo', fx: { creditos: 8000, alineamiento: -10 }, out: 'Rápido y sin preguntas.' }
    ]
  },
  {
    id: 'ad2_secreto', min: 22, max: 200, w: 8, slots: { n: 'nombre' },
    t: 'Descubres un secreto de {n} que valdría mucho dinero en las manos correctas.',
    c: [
      { t: 'Guardarlo', fx: { alineamiento: 12, cordura: 6 }, rel: { tipo: 'amigo', afecto: 40 }, out: 'Nunca lo sabrá. Da igual: tú sí.' },
      { t: 'Chantajear con elegancia', fx: { creditos: 40000, alineamiento: -25, notoriedad: 12 }, rel: { tipo: 'rival', afecto: -70 }, out: 'Paga puntual. Y cuenta los días.' },
      { t: 'Contárselo a {n} y ofrecerle ayuda', fx: { carisma: 14, alineamiento: 15 }, rel: { tipo: 'aliado', afecto: 65 }, out: 'Llora de alivio. Ganas a alguien para siempre.' },
      { t: 'Publicarlo', fx: { notoriedad: 20, reputacion: -8, creditos: 12000 }, out: 'Escándalo. Consecuencias para mucha gente que no tenía culpa.' }
    ]
  },
  {
    id: 'ad2_reencarnar', min: 25, max: 200, w: 6, req: function (s) { return s.stats.cordura < 40; },
    t: 'Llevas años funcionando en automático. Un día te sientas en el suelo del pasillo y no te levantas en tres horas.',
    c: [
      { t: 'Pedir ayuda de verdad', fx: { cordura: 22, creditos: -8000, salud: 6 }, out: 'Tarda. Funciona. Es la decisión más difícil que has tomado.' },
      { t: 'Cambiarlo todo de golpe', fx: { cordura: 14, creditos: -15000, carisma: 6 }, mover: true, motivo: 'empezando de cero', despido: true, out: 'Otro mundo, otro trabajo, otra gente. Arriesgado y necesario.' },
      { t: 'Tirar hacia delante', fx: { cordura: -12, salud: -8, creditos: 8000 }, out: 'Aguantas. Se paga aparte.' },
      { t: 'Buscar consuelo en la especia', fx: { cordura: 8, salud: -18 }, flag: 'adicto', out: 'Funciona una temporada. Como todo lo que funciona así.' }
    ]
  },
  {
    id: 'ad2_pirata', min: 18, max: 200, w: 8, req: function (s) { return !!s.nave; }, slots: { p: 'mundo' },
    t: 'Corsarios te interceptan camino de {p}. El capitán te saluda por tu nombre.',
    c: [
      { t: 'Combatir', dogfight: { dif: 62 } },
      { t: 'Escuchar su oferta', fx: { carisma: 6 }, r: [
        { p: 0.5, t: 'Te ofrecen entrar en su flota.', fx: { creditos: 20000, notoriedad: 15, alineamiento: -12 }, faccion: 'piratas+25' },
        { p: 0.5, t: 'Solo querían tu carga y tu silencio.', fx: { creditos: -14000, cordura: -6 } }
      ] },
      { t: 'Fingir avería y llamar a la patrulla', r: [
        { p: 0.5, t: 'Llegan a tiempo. Los corsarios huyen.', fx: { reputacion: 10, intelecto: 8 } },
        { p: 0.5, t: 'No llega nadie. Y ahora están enfadados.', fx: { salud: -18, creditos: -18000 }, naveEstado: -25 }
      ] },
      { t: 'Entregar la carga sin discutir', fx: { creditos: -12000, cordura: -3 }, out: 'Vives. Es un intercambio razonable.' }
    ]
  },
  {
    id: 'ad2_familia_lejos', min: 25, max: 200, w: 8,
    req: function (s) { return s.mundo !== s.mundoNatal; },
    t: 'Llega un mensaje desde tu mundo natal. Alguien está mal y preguntan por ti.',
    c: [
      { t: 'Dejarlo todo y volver', fx: { cordura: 14, alineamiento: 15, creditos: -9000 }, mover: 'casa', motivo: 'volviendo a casa por familia', out: 'Llegas a tiempo. Eso no siempre pasa.' },
      { t: 'Mandar dinero y seguir', fx: { creditos: -15000, cordura: -8 }, out: 'Ayuda. No es lo mismo y lo sabes.' },
      { t: 'No contestar', fx: { cordura: -18, alineamiento: -12 }, relTodas: -20, out: 'El mensaje se queda ahí, sin leer del todo, durante años.' }
    ]
  },
  {
    id: 'ad2_maestria', min: 28, max: 200, w: 8, req: function (s) { return s.habilidades.length >= 2; },
    t: 'Llevas décadas haciendo lo tuyo. Alguien te llama "el mejor del sector" y no suena a broma.',
    c: [
      { t: 'Aceptar el título y cobrarlo', fx: { creditos: 35000, reputacion: 15, carisma: 8 }, out: 'Subes tarifas. Nadie protesta.' },
      { t: 'Montar una escuela', fx: { creditos: -20000, reputacion: 20, cordura: 12 }, rel: { tipo: 'aprendiz', afecto: 45 }, flag: 'escuela', out: 'Doce alumnos el primer año. Ochenta el quinto.' },
      { t: 'Buscar a alguien mejor que tú', fx: { intelecto: 12, cordura: 8, destreza: 8 }, mover: true, motivo: 'buscando un maestro mejor', out: 'Lo encuentras. Vuelves a ser aprendiz a tu edad.' },
      { t: 'Dejarlo mientras estás arriba', fx: { cordura: 16, creditos: 12000 }, despido: true, out: 'Nadie lo entiende. Tú duermes bien.' }
    ]
  },

  /* ================= VEJEZ ================= */
  {
    id: 'v2_cuerpo', min: 55, max: 250, w: 10, req: function (s) { return s.heridas.length > 0; },
    t: 'Las heridas viejas hablan más alto que antes. Los días de humedad son insoportables.',
    c: [
      { t: 'Tratamiento largo y caro', fx: { creditos: -28000 }, curarHeridas: true, out: 'Meses de rehabilitación. Vuelves a andar sin pensarlo.' },
      { t: 'Aprender a vivir con ello', fx: { cordura: 12, salud: -3 }, out: 'Te haces una rutina. Funciona más de lo esperado.' },
      { t: 'Analgésicos y adelante', fx: { salud: -10, cordura: 6, creditos: -5000 }, out: 'Rápido y con precio a plazos.' }
    ]
  },
  {
    id: 'v2_reconocimiento', min: 55, max: 250, w: 8, req: function (s) { return s.stats.reputacion > 55; }, slots: { p: 'mundo' },
    t: 'En {p} quieren darte una medalla, una placa o algo con tu nombre encima.',
    c: [
      { t: 'Aceptarlo y dar un discurso honesto', fx: { reputacion: 12, carisma: 10, cordura: 10 }, out: 'Dices cosas que nadie esperaba. Se hace un silencio bueno.' },
      { t: 'Aceptarlo y no ir', fx: { reputacion: 4, cordura: 4 }, out: 'Envías una nota de tres líneas.' },
      { t: 'Rechazarlo públicamente', fx: { notoriedad: 15, reputacion: -8, cordura: 12, carisma: 8 }, out: 'Explicas por qué. La mitad te odia, la otra mitad te entiende.' },
      { t: 'Pedir que se lo den a otro', fx: { alineamiento: 18, reputacion: 10 }, out: 'Nombras a alguien que nadie recordaba. Es el mejor discurso de la noche.' }
    ]
  },
  {
    id: 'v2_ultima_pelea', min: 58, max: 250, w: 7, slots: { n: 'nombre' },
    t: '{n} viene a por ti por algo que hiciste hace treinta años. Está en forma. Tú no.',
    c: [
      { t: 'Pelear igual', combate: { dif: 62, duelo: true } },
      { t: 'Reconocer lo que hiciste', fx: { alineamiento: 20, cordura: 16 }, r: [
        { p: 0.55, t: 'Se queda sin discurso. Se va.', fx: { carisma: 10 } },
        { p: 0.45, t: 'No le vale. Igual te pega.', fx: { salud: -18 } }
      ] },
      { t: 'Comprarle', fx: { creditos: -40000, cordura: -6 }, out: 'Coge el dinero. Ninguno de los dos queda bien.' },
      { t: 'Llamar a los tuyos', req: function (s) { return s.relaciones.length > 2; }, fx: { carisma: 8, reputacion: 6 }, relTodas: -8, out: 'Aparecen cuatro personas. {n} se lo piensa mejor.' }
    ]
  },
  {
    id: 'v2_carta', min: 60, max: 250, w: 8,
    t: 'Te sientas a escribir una carta que llevas décadas debiendo.',
    c: [
      { t: 'Escribirla y enviarla', fx: { cordura: 20, alineamiento: 10 }, out: 'Contestan a las tres semanas. Es mejor de lo que temías.' },
      { t: 'Escribirla y no enviarla', fx: { cordura: 10 }, flag: 'carta_no_enviada', item: true, out: 'Queda en un cajón. La encontrarán.' },
      { t: 'No escribir nada', fx: { cordura: -8 }, out: 'Sigues debiéndola.' }
    ]
  },
  {
    id: 'v2_despedida', min: 70, max: 250, w: 9,
    t: 'Te queda poco y lo sabes con una claridad rara y tranquila.',
    c: [
      { t: 'Reunir a todo el mundo', fx: { cordura: 25, creditos: -12000 }, relTodas: 30, out: 'Cenáis, discutís y os reís. Sale bien.' },
      { t: 'Volver al sitio donde empezó todo', fx: { cordura: 20, fuerza: 10 }, mover: 'casa', motivo: 'cerrando el círculo', out: 'Está distinto. Huele igual.' },
      { t: 'Ponerte a trabajar en algo hasta el final', fx: { cordura: 12, intelecto: 8, salud: -6 }, out: 'Te encuentran con las manos ocupadas. Como debe ser.' },
      { t: 'Irte solo, sin decírselo a nadie', fx: { cordura: -6, fuerza: 12 }, mover: true, motivo: 'sin decírselo a nadie', out: 'Nadie sabe dónde. Es exactamente lo que querías.' }
    ]
  }

  ]);

})(window);

/* ============================================================
   HOLOVIDA :: LOS PRIMEROS AÑOS
   El problema era simple: con 1 año solo había 3 eventos posibles
   y con 2 años, 6. Todas las vidas empezaban igual. Aquí van 52
   más para la franja de 0 a 6, muchos con sabor del planeta, para
   que dos partidas seguidas no se parezcan en nada.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_CUNA = [];
  const S = { p: 'mundoAqui', l: 'lugar', c: 'criatura', n: 'nombre', o: 'oficio',
              b: 'bicho', t: 'tiempo', g: 'paisanos', m: 'comida', h: 'hito', k: 'banda' };
  const E = function (o) { o.slots = o.slots || S; SW.EVENTOS_CUNA.push(o); };

  /* ══════════ 0–2 años: lo primero de todo ══════════ */

  E({ id: 'cu_llanto', min: 0, max: 3, w: 12,
    t: 'Lloras cada noche a la misma hora y nadie sabe por qué.',
    c: [{ t: 'Alguien se queda contigo hasta que paras', fx: { cordura: 10, salud: 3 }, relTodas: 8, out: 'Se levanta cada noche durante meses. No te acordarás. Importa igual.' },
        { t: 'Te dejan llorar', fx: { cordura: -6, fisico: 4 }, out: 'Aprendes pronto que no siempre viene alguien.' },
        { t: 'Descubren que era el ruido de un generador', fx: { cordura: 8, intelecto: 3 }, out: 'Lo apagan. Duermes de un tirón por primera vez.' }] });

  E({ id: 'cu_nombre', min: 0, max: 3, w: 11,
    t: 'Discuten cómo llamarte. Hay dos nombres sobre la mesa y una familia entera opinando.',
    c: [{ t: 'Gana el nombre de un antepasado', fx: { cordura: 5, reputacion: 4 }, flag: 'nombre_heredado', out: 'Cargas con un nombre que ya tuvo alguien. Se nota en cómo te miran.' },
        { t: 'Gana un nombre que no significa nada', fx: { cordura: 6, suerte: 3 }, out: 'Es tuyo y de nadie más. Eso también es una herencia.' },
        { t: 'Te acaban llamando por un apodo', fx: { carisma: 6 }, apodo: true }] });

  E({ id: 'cu_primer_viaje', min: 1, max: 4, w: 10,
    t: 'Te llevan por primera vez fuera de casa, a {l}.',
    c: [{ t: 'Duermes todo el camino', fx: { salud: 4, cordura: 4 } },
        { t: 'No paras de mirarlo todo', fx: { intelecto: 7, cordura: 5 }, out: 'Tu primera imagen del mundo, y es esta.' },
        { t: 'Montas un escándalo', fx: { carisma: 5, cordura: -3 }, out: 'Tardan dos años en volver a sacarte de casa.' }] });

  E({ id: 'cu_gateo', min: 1, max: 3, w: 11,
    t: 'Empiezas a moverte solo y la casa deja de ser segura de un día para otro.',
    c: [{ t: 'Te metes debajo de todo', fx: { destreza: 7, intelecto: 4 }, out: 'Conoces tu casa por debajo antes que por arriba.' },
        { t: 'Te caes por unas escaleras', fx: { salud: -8, fisico: 4 }, out: 'Susto grande, daño pequeño. La primera cicatriz.' },
        { t: 'Te atan corto', fx: { cordura: -4, salud: 4 } }] });

  E({ id: 'cu_animal_casa', min: 1, max: 5, w: 10,
    t: 'En casa hay {c} y os pasáis el día el uno encima del otro.',
    c: [{ t: 'Se convierte en tu sombra', fx: { cordura: 12, salud: 3 }, mascota: true },
        { t: 'Te muerde y te da miedo años', fx: { salud: -5, cordura: -6 }, flag: 'miedo_animales' },
        { t: 'Aprendes a tratarlo antes que a hablar', fx: { destreza: 6, intelecto: 5, alineamiento: 5 } }] });

  E({ id: 'cu_hambre', min: 1, max: 6, w: 10,
    t: 'Hay semanas en {p} en las que la comida no llega para todos.',
    c: [{ t: 'Comes tú primero', fx: { salud: 6, cordura: -4 }, out: 'Alguien come menos para que tú comas. Te enteras mucho después.' },
        { t: 'Se reparte y todos pasáis un poco', fx: { salud: -4, alineamiento: 8, relTodas: 10 } },
        { t: 'Alguien de fuera trae {m}', fx: { salud: 5, cordura: 8 }, rel: { tipo: 'contacto', afecto: 45 }, out: 'No se olvida un plato de comida en un mal año.' }] });

  E({ id: 'cu_ruido', min: 1, max: 5, w: 9,
    t: 'Hay un ruido de {p} que te acompaña desde que naces y que no oyes en ningún otro sitio.',
    c: [{ t: 'Te duerme', fx: { cordura: 10 }, out: 'Años después, en otro planeta, no podrás dormir sin él.' },
        { t: 'Te da miedo', fx: { cordura: -6, intelecto: 4 } },
        { t: 'Aprendes a imitarlo', fx: { carisma: 8, destreza: 4 }, out: 'Le hace gracia a todo el mundo. A ti también.' }] });

  E({ id: 'cu_vecina', min: 2, max: 6, w: 10,
    t: 'Una vecina, {n}, se ocupa de ti muchas tardes porque en tu casa se trabaja.',
    c: [{ t: 'Te cría medio ella', fx: { cordura: 12, carisma: 6 }, rel: { tipo: 'contacto', afecto: 65 }, out: 'La llamarás por su nombre toda la vida y le dirás cosas que en casa no.' },
        { t: 'Te aburres en su casa', fx: { intelecto: 5, cordura: -3 } },
        { t: 'Te enseña un oficio antes de tiempo', fx: { destreza: 8, intelecto: 6 }, habilidad: 'manitas' }] });

  E({ id: 'cu_enfermo_grave', min: 1, max: 7, w: 9,
    t: 'Te pones malo de verdad. En {p} eso no siempre se arregla.',
    c: [{ t: 'Gastan lo que no tienen en un médico', fx: { salud: 10, creditos: -3000 }, relTodas: 14, out: 'Se nota en casa durante años. Nadie te lo echa en cara nunca.' },
        { t: 'Lo pasas en casa como se ha hecho siempre', r: [
            { p: 0.65, t: 'Sales adelante y sales más duro.', fx: { salud: -6, fisico: 10, cordura: 6 } },
            { p: 0.35, t: 'Te deja algo para siempre.', fx: { salud: -14, fisico: -4 }, herida: { n: 'secuela de infancia', sev: 8, cronica: true } }] },
        { t: 'Alguien conoce un remedio de aquí', fx: { salud: 8, intelecto: 4 }, out: 'Funciona. Nadie sabe explicar por qué.' }] });

  E({ id: 'cu_padres', min: 2, max: 8, w: 10,
    t: 'Empiezas a entender a qué se dedica tu familia en {p}: {o}.',
    c: [{ t: 'Te parece lo más grande del mundo', fx: { cordura: 8, relTodas: 12 }, flag: 'orgullo_familiar' },
        { t: 'Te parece pequeño y te da vergüenza', fx: { intelecto: 6, relTodas: -8, cordura: -5 }, out: 'Tardarás treinta años en pedir perdón por eso.' },
        { t: 'Decides que tú harás otra cosa', fx: { intelecto: 8, carisma: 4 }, flag: 'otro_camino' }] });

  E({ id: 'cu_hermana', min: 2, max: 9, w: 10,
    t: 'Llega alguien nuevo a la familia y de golpe ya no eres el centro.',
    c: [{ t: 'Lo llevas fatal', fx: { cordura: -8, carisma: 4 }, out: 'Se te pasa. Tarda.' },
        { t: 'Te vuelves su sombra', fx: { alineamiento: 10, cordura: 8 }, relTodas: 12 },
        { t: 'Aprovechas que ya nadie te mira', fx: { destreza: 8, intelecto: 6 }, out: 'Haces lo que quieres durante tres años.' }] });

  /* ══════════ 3–6 años: el mundo se abre ══════════ */

  E({ id: 'cu_pregunta', min: 3, max: 8, w: 11,
    t: 'Preguntas algo que deja callados a los adultos de {p}.',
    c: [{ t: 'Te contestan la verdad', fx: { intelecto: 10, cordura: -4 }, out: 'Era peor de lo que imaginabas y agradeces que no te mientan.' },
        { t: 'Te contestan una tontería', fx: { intelecto: 4, carisma: 5 }, out: 'Te das cuenta de que te están mintiendo. Ese es el aprendizaje.' },
        { t: 'Te mandan callar', fx: { cordura: -6, intelecto: 6 }, flag: 'aprendio_a_callar' },
        { t: 'Buscas la respuesta por tu cuenta', fx: { intelecto: 12 }, out: 'Tardas dos años. La encuentras.' }] });

  E({ id: 'cu_mentira', min: 3, max: 9, w: 10,
    t: 'Rompes algo importante en casa y nadie te ha visto.',
    c: [{ t: 'Confesarlo', fx: { alineamiento: 12, cordura: 6, relTodas: 8 }, out: 'Te cae una bronca y algo mejor que una bronca.' },
        { t: 'Echárselo a otro', fx: { alineamiento: -12, carisma: 6, cordura: -5 }, out: 'Cuela. Te acuerdas de esto de mayor.' },
        { t: 'Arreglarlo tú a escondidas', fx: { destreza: 10, intelecto: 8 }, out: 'Queda regular pero queda. Nadie dice nada.' }] });

  E({ id: 'cu_amigo_raro', min: 3, max: 9, w: 10,
    t: 'Te haces amigo de un crío de {p} que a los demás no les cae bien.',
    c: [{ t: 'Seguir siendo su amigo', fx: { alineamiento: 12, reputacion: -6, cordura: 8 }, nuevaRel: true },
        { t: 'Dejarle cuando los otros se ríen', fx: { carisma: 5, cordura: -10, alineamiento: -8 }, out: 'Funciona. Te sienta mal durante años.' },
        { t: 'Defenderle a golpes', fx: { fisico: 8, salud: -6, reputacion: 6, alineamiento: 8 }, nuevaRel: true }] });

  E({ id: 'cu_perderse', min: 3, max: 9, w: 10,
    t: 'Te pierdes en {h} y tardan medio día en encontrarte.',
    c: [{ t: 'Quedarte quieto donde estabas', fx: { intelecto: 8, cordura: 5 }, out: 'Es exactamente lo que había que hacer y lo hiciste solo.' },
        { t: 'Buscar la salida tú', fx: { destreza: 10, fisico: 5, cordura: -5 }, out: 'Sales por otro lado. Nadie entiende cómo.' },
        { t: 'Te encuentra alguien de {g}', fx: { carisma: 6, cordura: 6 }, rel: { tipo: 'contacto', afecto: 40 } }] });

  E({ id: 'cu_trabajo_nino', min: 4, max: 10, w: 10,
    t: 'En {p} a tu edad ya se echa una mano. Te ponen a hacer algo de verdad.',
    c: [{ t: 'Hacerlo bien', fx: { destreza: 10, fisico: 6, reputacion: 5 }, out: 'Descubren que tienes manos. Ya no te dejan en paz.' },
        { t: 'Hacerlo fatal a propósito', fx: { intelecto: 6, cordura: 5, relTodas: -6 }, out: 'Funciona. Te libras. También dejan de contar contigo.' },
        { t: 'Pedir que te paguen', fx: { carisma: 10, creditos: 300 }, out: 'Se ríen. Y te pagan.' }] });

  E({ id: 'cu_bicho_casa', min: 3, max: 9, w: 9,
    t: 'Aparece {b} donde no debería y toda la casa se organiza para sacarlo.',
    c: [{ t: 'Ayudar sin que te lo pidan', fx: { destreza: 7, relTodas: 8, fisico: 4 } },
        { t: 'Esconderlo para quedártelo', fx: { cordura: 8, alineamiento: -3 }, mascota: true, out: 'Lo tienes tres semanas antes de que se enteren.' },
        { t: 'Salir corriendo', fx: { destreza: 5, cordura: -4 } }] });

  E({ id: 'cu_estrellas', min: 4, max: 11, w: 10,
    t: 'Alguien te enseña a distinguir estrellas desde {p} y te dice cuáles son sistemas con gente.',
    c: [{ t: 'Aprendértelas todas', fx: { intelecto: 12, cordura: 8 }, habilidad: 'navegación', out: 'De mayor sabrás dónde estás mirando arriba.' },
        { t: 'Elegir una y decidir que irás', fx: { cordura: 12, intelecto: 5 }, flag: 'sueña_con_irse' },
        { t: 'Preguntar quién vive allí', fx: { intelecto: 9, carisma: 5 }, out: 'La respuesta te ocupa la cabeza semanas.' }] });

  E({ id: 'cu_musica_casa', min: 3, max: 10, w: 9,
    t: 'En casa suena siempre la misma música. Es la de {p} y no la oyes en ningún otro sitio.',
    c: [{ t: 'Aprender a tocarla', fx: { destreza: 10, carisma: 10, cordura: 8 }, habilidad: 'música' },
        { t: 'Odiarla', fx: { cordura: -3, carisma: 4 }, out: 'Volverá a gustarte a los cuarenta, de golpe.' },
        { t: 'Cantarla en todas partes', fx: { carisma: 12, cordura: 8 } }] });

  E({ id: 'cu_castigo', min: 4, max: 11, w: 10,
    t: 'Te castigan por algo que no hiciste.',
    c: [{ t: 'Aguantarlo callado', fx: { cordura: -8, fisico: 5, alineamiento: 6 }, out: 'El que lo hizo lo sabe. Eso también cuenta.' },
        { t: 'Gritar hasta que te crean', r: [
            { p: 0.45, t: 'Te creen. Piden perdón.', fx: { carisma: 10, cordura: 8, relTodas: 6 } },
            { p: 0.55, t: 'Te cae doble.', fx: { cordura: -12, carisma: 6 } }] },
        { t: 'Vengarte', fx: { alineamiento: -10, destreza: 6, cordura: 4 }, rel: { tipo: 'rival', afecto: -30 } }] });

  E({ id: 'cu_tiempo_malo', min: 3, max: 10, w: 9,
    t: 'Cae {t} sobre {p} y os quedáis encerrados días.',
    c: [{ t: 'Escuchar historias de los mayores', fx: { intelecto: 10, cordura: 10, carisma: 5 }, out: 'Te enteras de cosas de tu familia que no te iban a contar nunca.' },
        { t: 'Desmontar algo para ver cómo va', fx: { intelecto: 10, destreza: 8 }, habilidad: 'manitas' },
        { t: 'Escaparte fuera igual', fx: { salud: -8, fisico: 8, cordura: 8 }, out: 'Vuelves helado y contentísimo.' }] });

  E({ id: 'cu_mercado', min: 4, max: 11, w: 10,
    t: 'Te llevan al mercado de {p} y te sueltan la mano cinco minutos.',
    c: [{ t: 'Mirar cómo se regatea', fx: { intelecto: 8, carisma: 8 }, habilidad: 'comerciante' },
        { t: 'Robar algo pequeño', r: [
            { p: 0.6, t: 'Nadie se entera.', fx: { destreza: 10, alineamiento: -8 }, flag: 'manos_rapidas' },
            { p: 0.4, t: 'Te pilla un tendero.', fx: { reputacion: -8, carisma: 5, cordura: -6 }, out: 'Te suelta una charla que te acompaña treinta años.' }] },
        { t: 'Hacerte amigo de un puesto', fx: { carisma: 10 }, rel: { tipo: 'contacto', afecto: 40 }, out: 'Te guardan lo que sobra cada tarde.' }] });

  E({ id: 'cu_hito_primero', min: 4, max: 11, w: 9,
    t: 'Ves {h} por primera vez y te lo explican mal, como se explican estas cosas a un crío.',
    c: [{ t: 'Creerte la versión bonita', fx: { cordura: 10 }, out: 'Tardarás años en enterarte de la de verdad.' },
        { t: 'Notar que falta algo en la historia', fx: { intelecto: 12 }, flag: 'no_se_traga_nada' },
        { t: 'Preguntar hasta que te cuenten lo que pasó', fx: { intelecto: 10, cordura: -8 }, out: 'Te lo cuentan. Preferirías no haber preguntado.' }] });

  E({ id: 'cu_banda_calle', min: 5, max: 12, w: 9,
    t: 'Los mayores del barrio andan con {k}. A ti te dejan mirar de lejos.',
    c: [{ t: 'Mirar y aprender cómo funcionan', fx: { intelecto: 8, carisma: 5 }, flag: 'sabe_de_la_calle' },
        { t: 'Hacerles recados', fx: { creditos: 400, destreza: 6, notoriedad: 5, alineamiento: -5 } },
        { t: 'Mantenerte lejos', fx: { cordura: 6, alineamiento: 6 } }] });

  E({ id: 'cu_regalo', min: 3, max: 10, w: 10,
    t: 'Te hacen un regalo que en {p} vale mucho más de lo que parece.',
    c: [{ t: 'Guardarlo como un tesoro', fx: { cordura: 10 }, item: true, flag: 'tesoro_de_infancia' },
        { t: 'Romperlo el primer día', fx: { cordura: -10, destreza: 4 }, out: 'Nadie te riñe. Eso es lo peor.' },
        { t: 'Regalárselo a otro que lo necesita más', fx: { alineamiento: 16, cordura: 8, carisma: 6 } }] });

  E({ id: 'cu_muerte_primera', min: 4, max: 11, w: 9,
    t: 'Se muere alguien de tu familia y es la primera vez que entiendes lo que significa.',
    c: [{ t: 'Preguntarlo todo', fx: { intelecto: 10, cordura: -8 } },
        { t: 'No llorar delante de nadie', fx: { cordura: -12, fisico: 5 }, flag: 'se_lo_traga' },
        { t: 'Quedarte con algo suyo', fx: { cordura: 8 }, item: true },
        { t: 'Decidir que tú vas a vivir mucho', fx: { cordura: 10, salud: 4 } }] });

  E({ id: 'cu_don', min: 4, max: 12, w: 9,
    t: 'Se te da bien algo que a los demás críos de {p} no.',
    c: [{ t: 'Practicarlo a todas horas', fx: { destreza: 12, intelecto: 8 }, out: 'A los diez años ya eres mejor que la mayoría de adultos.' },
        { t: 'Disimularlo para no destacar', fx: { carisma: 8, cordura: -6 } },
        { t: 'Usarlo para ganar algo', fx: { creditos: 900, carisma: 8, notoriedad: 4 } }] });

  E({ id: 'cu_desconocido', min: 4, max: 11, w: 9,
    t: 'Un desconocido se para a mirarte más rato del normal en {l}.',
    c: [{ t: 'Sostenerle la mirada', fx: { cordura: 6, fisico: 4 }, out: 'Se va. No vuelves a verlo. O sí.' },
        { t: 'Contarlo en casa', fx: { relTodas: 8, cordura: 5 }, out: 'Se lo toman más en serio de lo que esperabas.' },
        { t: 'Seguirle', r: [
            { p: 0.5, t: 'Le pierdes en dos calles.', fx: { destreza: 7, intelecto: 5 } },
            { p: 0.5, t: 'Te ve y te dice algo raro.', fx: { cordura: -8, intelecto: 10 }, flag: 'aviso_temprano' }] }] });

  E({ id: 'cu_promesa_cria', min: 5, max: 12, w: 9,
    t: 'Le prometes algo a alguien con la seriedad con la que solo prometen los críos.',
    c: [{ t: 'Prometer que nunca te irás de {p}', fx: { cordura: 8 }, flag: 'promesa_quedarse' },
        { t: 'Prometer que os iréis juntos', fx: { cordura: 10, carisma: 6 }, nuevaRel: true, flag: 'promesa_irse_juntos' },
        { t: 'Prometer algo imposible', fx: { carisma: 8, cordura: -4 }, out: 'Los dos sabéis que es mentira. Vale igual.' }] });

  E({ id: 'cu_dinero', min: 5, max: 12, w: 9,
    t: 'Ganas tu primer crédito. No te lo ha dado nadie: te lo has ganado.',
    c: [{ t: 'Guardarlo sin gastarlo', fx: { intelecto: 8, creditos: 200 }, flag: 'ahorrador', out: 'Lo tendrás treinta años. En serio.' },
        { t: 'Gastártelo entero el mismo día', fx: { cordura: 10, carisma: 5 } },
        { t: 'Dárselo a tu familia', fx: { relTodas: 16, alineamiento: 10 }, out: 'Se lo guardan sin decírtelo.' }] });

  E({ id: 'cu_pelea_cria', min: 5, max: 12, w: 9,
    t: 'Tu primera pelea de verdad, de las que dejan marca.',
    c: [{ t: 'Ganar', fx: { fisico: 10, reputacion: 8, salud: -6 }, out: 'A partir de hoy te dejan en paz. Y te tienen otro respeto, del malo.' },
        { t: 'Perder', fx: { fisico: 6, salud: -12, cordura: -8 }, herida: { n: 'labio partido', sev: 4 }, out: 'Vuelves a casa sin contarlo.' },
        { t: 'No pelear', fx: { cordura: 6, reputacion: -8, intelecto: 5 }, out: 'Es más difícil que pelear y no te lo va a reconocer nadie.' }] });

  E({ id: 'cu_idioma', min: 3, max: 12, w: 9,
    t: 'En {p} se habla más de una lengua y en tu casa se mezclan.',
    c: [{ t: 'Aprender las dos bien', fx: { intelecto: 12, carisma: 8 }, idioma: 'lengua local', out: 'Te abrirá puertas que no sabes que existen.' },
        { t: 'Quedarte con la de la calle', fx: { carisma: 10, reputacion: 5 } },
        { t: 'Quedarte con la de casa', fx: { intelecto: 8, relTodas: 8 } }] });

  E({ id: 'cu_secreto_casa', min: 5, max: 12, w: 9,
    t: 'Hay una habitación de tu casa en la que no se entra y nadie explica por qué.',
    c: [{ t: 'Entrar', r: [
            { p: 0.5, t: 'Hay cosas de alguien que ya no está.', fx: { cordura: -8, intelecto: 8 } },
            { p: 0.3, t: 'Hay algo que no debería estar ahí.', fx: { intelecto: 12, cordura: -10 }, item: true, flag: 'lo_de_la_habitacion' },
            { p: 0.2, t: 'No hay nada. Ese es el misterio.', fx: { intelecto: 6, cordura: 4 } }] },
        { t: 'No entrar nunca', fx: { cordura: 6, alineamiento: 4 } },
        { t: 'Preguntar directamente', fx: { intelecto: 8, relTodas: -5 }, out: 'Cambian de tema con una habilidad que da miedo.' }] });

  E({ id: 'cu_juego_calle', min: 4, max: 11, w: 10,
    t: 'Los críos de {p} tienen su propio código de la calle y tú acabas de entrar.',
    c: [{ t: 'Aprenderte las reglas', fx: { carisma: 8, intelecto: 6, cordura: 6 } },
        { t: 'Saltártelas desde el primer día', fx: { reputacion: -8, destreza: 8, notoriedad: 5 } },
        { t: 'Acabar mandando tú', fx: { carisma: 14, reputacion: 10 }, habilidad: 'liderazgo', out: 'Con siete años ya sabes lo que es que te hagan caso.' }] });

  E({ id: 'cu_altura', min: 5, max: 12, w: 8,
    t: 'Subes a lo más alto a lo que puedes subir en {p} solo para verlo desde ahí.',
    c: [{ t: 'Quedarte hasta que anochezca', fx: { cordura: 14, intelecto: 5 } },
        { t: 'Resbalar al bajar', fx: { salud: -14, destreza: 8 }, herida: { n: 'brazo roto', sev: 8 } },
        { t: 'Volver cada semana', fx: { cordura: 12, fisico: 6 }, flag: 'su_sitio_alto' }] });

  E({ id: 'cu_forastero', min: 4, max: 12, w: 8,
    t: 'Llega gente de fuera a {p} y traen cosas que no habías visto nunca.',
    c: [{ t: 'No separarte de ellos', fx: { intelecto: 10, carisma: 8 }, out: 'Te cuentan cómo es el resto de la galaxia. Te cambia la cabeza.' },
        { t: 'Cambiarles algo tuyo', fx: { carisma: 8, creditos: 500 }, item: true },
        { t: 'Desconfiar como los mayores', fx: { cordura: 5, intelecto: 4 } }] });

  E({ id: 'cu_frio_hambre', min: 3, max: 11, w: 8,
    t: 'Pasas un invierno de {p} de los que se recuerdan.',
    c: [{ t: 'Aguantarlo', fx: { fisico: 10, salud: -8, cordura: 6 } },
        { t: 'Aprender dónde se está caliente', fx: { intelecto: 8, destreza: 6 }, habilidad: 'supervivencia' },
        { t: 'Refugiaros todos juntos', fx: { relTodas: 14, cordura: 10, salud: -4 } }] });

  E({ id: 'cu_talento_fuerza', min: 3, max: 10, w: 7,
    req: function (s) { return s.sensible; },
    t: 'Pasa algo pequeño que no tiene explicación: un vaso que no cae, una puerta que se abre sola.',
    c: [{ t: 'No contárselo a nadie', fx: { fuerza: 6, cordura: -5 }, flag: 'lo_guarda' },
        { t: 'Contarlo en casa', fx: { fuerza: 4, relTodas: -6, cordura: 5 }, flag: 'en_casa_lo_saben', out: 'Se miran entre ellos. No te dicen nada. Eso lo dice todo.' },
        { t: 'Intentar repetirlo', fx: { fuerza: 10, salud: -6, intelecto: 5 }, out: 'Lo consigues una vez de cada veinte. Sigues intentándolo.' }] });

  E({ id: 'cu_suenio', min: 3, max: 11, w: 8,
    t: 'Tienes un sueño que se repite y en él siempre estás en el mismo sitio.',
    c: [{ t: 'Contarlo hasta aburrir a todos', fx: { carisma: 6, cordura: 5 } },
        { t: 'Dibujarlo', fx: { intelecto: 8, destreza: 8 }, out: 'Guardas el dibujo. Un día reconocerás el sitio.' },
        { t: 'Olvidarlo a propósito', fx: { cordura: 6, intelecto: -2 } }] });

  E({ id: 'cu_escuela_primera', min: 5, max: 12, w: 10,
    t: 'Primer día de clase en {p}. Sea lo que sea aquí "clase".',
    c: [{ t: 'Portarte bien y aprender', fx: { intelecto: 12, cordura: 4 } },
        { t: 'Hacer reír a todos', fx: { carisma: 14, intelecto: 3, reputacion: 5 } },
        { t: 'No volver al día siguiente', fx: { intelecto: -4, destreza: 8, cordura: 6 }, out: 'Tardan un mes en darse cuenta.' },
        { t: 'Pelearte el primer día', fx: { fisico: 8, reputacion: 6, salud: -6 } }] });

  E({ id: 'cu_hermano_mayor', min: 4, max: 12, w: 9,
    t: 'Alguien mayor de tu familia te toma bajo su ala.',
    c: [{ t: 'Seguirle a todas partes', fx: { destreza: 8, carisma: 6, relTodas: 12 } },
        { t: 'Copiarle hasta lo malo', fx: { fisico: 8, alineamiento: -8, notoriedad: 5 } },
        { t: 'Discutirle todo', fx: { intelecto: 8, relTodas: -6, carisma: 6 } }] });

  E({ id: 'cu_pobreza', min: 4, max: 12, w: 9,
    t: 'Te enteras de que en tu casa hay menos que en la de al lado.',
    c: [{ t: 'Que te dé igual', fx: { cordura: 10, alineamiento: 5 } },
        { t: 'Que te dé vergüenza', fx: { cordura: -10, carisma: 6 }, flag: 'quiere_dinero' },
        { t: 'Prometerte que eso va a cambiar', fx: { intelecto: 8, carisma: 6 }, flag: 'ambicion_temprana' }] });

  E({ id: 'cu_rico', min: 4, max: 12, w: 7,
    req: function (s) { return SW.mundo(s.mundo).riq >= 7; },
    t: 'En {p} tu familia no pasa apuros, y eso también marca.',
    c: [{ t: 'No enterarte de nada hasta mucho después', fx: { cordura: 8, intelecto: -2 } },
        { t: 'Ver lo que hay unas calles más allá', fx: { intelecto: 10, alineamiento: 12, cordura: -6 } },
        { t: 'Aprovecharlo', fx: { creditos: 2500, carisma: 8, alineamiento: -6 } }] });

  E({ id: 'cu_manos', min: 5, max: 12, w: 9,
    t: 'Descubres que se te dan bien las manos arreglando cosas rotas de {p}.',
    c: [{ t: 'Arreglar todo lo que cae', fx: { destreza: 12, intelecto: 8 }, habilidad: 'manitas' },
        { t: 'Cobrar por ello', fx: { creditos: 800, carisma: 8, destreza: 8 } },
        { t: 'Desmontarlo todo y no montar nada', fx: { intelecto: 10, relTodas: -6 } }] });

  E({ id: 'cu_animal_muerto', min: 4, max: 11, w: 8,
    t: 'Encuentras {b} muerto y te quedas mirándolo más de lo normal.',
    c: [{ t: 'Enterrarlo', fx: { alineamiento: 10, cordura: 6 } },
        { t: 'Estudiarlo', fx: { intelecto: 12, cordura: -4 }, habilidad: 'naturalista' },
        { t: 'No volver por ahí', fx: { cordura: -5 } }] });

  E({ id: 'cu_ley_local', min: 5, max: 12, w: 8,
    t: 'Ves cómo funciona la ley en {p}: alguien se lleva a alguien y nadie dice nada.',
    c: [{ t: 'Preguntar por qué', fx: { intelecto: 10, cordura: -6 } },
        { t: 'Aprender a no estar delante', fx: { destreza: 8, intelecto: 6 }, flag: 'sabe_esconderse' },
        { t: 'Que se te quede grabado', fx: { alineamiento: 12, cordura: -8 }, flag: 'no_lo_olvida' }] });

  E({ id: 'cu_fiesta_cria', min: 3, max: 11, w: 9,
    t: 'Tu primera fiesta grande de {p}. Hay {m} y ruido hasta el amanecer.',
    c: [{ t: 'Aguantar despierto hasta el final', fx: { cordura: 12, fisico: -3, carisma: 6 } },
        { t: 'Dormirte encima de alguien', fx: { cordura: 10, relTodas: 8 } },
        { t: 'Escaparte a explorar mientras nadie mira', fx: { destreza: 10, intelecto: 6 } }] });

  E({ id: 'cu_cicatriz', min: 4, max: 12, w: 8,
    t: 'Te haces una herida que va a dejar marca para siempre.',
    c: [{ t: 'Enseñarla con orgullo', fx: { carisma: 8, fisico: 5, salud: -6 }, out: 'Contarás la historia mil veces y cada vez será distinta.' },
        { t: 'Taparla', fx: { cordura: -5, salud: -5 } },
        { t: 'Que te la curen mal', fx: { salud: -10 }, herida: { n: 'cicatriz fea', sev: 6 } }] });

  E({ id: 'cu_heroe', min: 4, max: 12, w: 8,
    t: 'Hay alguien en {p} al que todo el mundo admira y tú también.',
    c: [{ t: 'Querer ser como esa persona', fx: { cordura: 10, fisico: 5 }, flag: 'tiene_un_modelo' },
        { t: 'Descubrir que no era para tanto', fx: { intelecto: 10, cordura: -8 } },
        { t: 'Conocerla de verdad', fx: { carisma: 10, cordura: 8 }, rel: { tipo: 'contacto', afecto: 50 } }] });

  E({ id: 'cu_marcharse_alguien', min: 4, max: 12, w: 9,
    t: 'Alguien importante se va de {p} y no va a volver.',
    c: [{ t: 'Ir a despedirle', fx: { cordura: 8, relTodas: 8 } },
        { t: 'No ir', fx: { cordura: -10 }, out: 'Te arrepientes esa misma noche.' },
        { t: 'Pedirle que te lleve', fx: { cordura: -6, carisma: 6 }, out: 'Te dice que no y te promete volver a por ti. No vuelve.' }] });

  E({ id: 'cu_comida_favorita', min: 3, max: 12, w: 8,
    t: 'Hay {m} en casa y decides que eso es lo mejor que existe.',
    c: [{ t: 'Aprender a hacerlo', fx: { destreza: 8, cordura: 8, carisma: 5 }, habilidad: 'cocina' },
        { t: 'Comerlo hasta hartarte', fx: { salud: 5, cordura: 8 } },
        { t: 'Guardar un poco siempre', fx: { intelecto: 5, cordura: 6 }, flag: 'previsor' }] });

  E({ id: 'cu_ruido_lejos', min: 4, max: 12, w: 8,
    t: 'Se oyen explosiones a lo lejos en {p} y los adultos bajan la voz.',
    c: [{ t: 'Preguntar qué pasa', fx: { intelecto: 8, cordura: -6 }, out: 'Te dicen que no es nada. Sabes que es algo.' },
        { t: 'Subirte a mirar', fx: { intelecto: 10, cordura: -8, destreza: 5 } },
        { t: 'Meterte en la cama y taparte', fx: { cordura: -5, salud: 3 } }] });

  E({ id: 'cu_regalo_nave', min: 5, max: 12, w: 8,
    t: 'Te regalan un modelo a escala de una nave y no lo sueltas en un año.',
    c: [{ t: 'Aprenderte cada pieza', fx: { intelecto: 12, destreza: 6 }, habilidad: 'mecánica', flag: 'quiere_volar' },
        { t: 'Jugar hasta romperlo', fx: { cordura: 10, destreza: 5 } },
        { t: 'Cambiarlo por otra cosa', fx: { carisma: 8, creditos: 300 } }] });

  E({ id: 'cu_apodo_cria', min: 5, max: 12, w: 8,
    t: 'Te ponen un mote en {p} y se te queda.',
    c: [{ t: 'Que te guste', fx: { carisma: 8, cordura: 6 }, apodo: true },
        { t: 'Pelearte con quien lo dice', fx: { fisico: 8, salud: -6, reputacion: 4 }, out: 'Se te queda igual. Ahora además con historia.' },
        { t: 'Ponerte tú otro mejor', fx: { carisma: 12, intelecto: 5 }, apodo: 'elegir' }] });

  /* --- al pozo global --- */
  SW.EVENTOS = SW.EVENTOS || [];
  for (let i = 0; i < SW.EVENTOS_CUNA.length; i++) SW.EVENTOS.push(SW.EVENTOS_CUNA[i]);

})(typeof window !== 'undefined' ? window : globalThis);

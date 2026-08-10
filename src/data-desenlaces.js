/* ============================================================
   HOLOVIDA :: DESENLACES AUTOMÁTICOS
   Un jugador se cruzó con alguien importante, eligió venderle
   información y me dijo que «no había pasado nado». Fui a mirar y
   tenía razón: la opción daba veintidós mil créditos y ni una línea
   de texto. Salían los números y punto.

   No era un caso aislado: hay más de dos mil opciones repartidas por
   el juego que aplican efectos y no cuentan nada. Escribirlas todas a
   mano no es realista, así que el motor cierra la escena él cuando el
   autor no lo hizo: mira cuál es el efecto que más pesa y remata con
   una frase que encaje con él.

   Una frase escrita a mano SIEMPRE gana: esto sólo entra cuando no
   hay ninguna. Y si el autor puso `out: ''` a propósito (porque la
   siguiente escena habla por sí sola), también se respeta.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* Qué efecto manda en la frase. El orden importa: perder salud pesa
     más en el recuerdo que ganar tres puntos de carisma. */
  const ORDEN = ['salud', 'creditos', 'cordura', 'alineamiento', 'reputacion',
    'notoriedad', 'fuerza', 'carisma', 'intelecto', 'destreza', 'fisico', 'suerte'];

  /* Cuánto tiene que moverse cada cosa para considerarla «la noticia» */
  const PESO = { creditos: 0.0012, salud: 1.4, cordura: 1.1, alineamiento: 1, reputacion: 1,
    notoriedad: 0.8, fuerza: 1, carisma: 0.9, intelecto: 0.9, destreza: 0.9, fisico: 0.9, suerte: 0.7 };

  const LINEAS = {
    'creditos+grande': [
      'Pagan sin regatear y en el acto. Cuentas el saldo dos veces por si acaso.',
      'El dinero entra limpio y de golpe. Cosas así no pasan a menudo.',
      'Cobras más de lo que ibas a pedir, que siempre significa que pediste poco.',
      'Se cierra con un apretón de manos y una transferencia que tarda seis segundos.',
      'Nadie firma nada y aun así el dinero aparece antes de que salgas del edificio.',
      'Te pagan en tres cuentas distintas para que no cante. Suma bien.',
      'Es de esos días que se recuerdan por la cifra y no por lo que hiciste para ganarla.',
      'Sales de ahí con más créditos de los que has visto juntos en años.',
      'La cantidad es tan buena que tardas un rato en preguntarte por qué.'
    ],
    'creditos+': [
      'Cobras lo hablado y nadie discute la cifra.',
      'No es una fortuna, pero es dinero y es tuyo.',
      'Sale la cuenta. A veces con eso basta.',
      'Te pagan en el sitio, en metálico y sin recibo.',
      'Da para la semana y para una copa. Tampoco pedías más.',
      'Poco, pero puntual. Eso también vale.',
      'Redondean a la baja y no te apetece discutir por tan poco.'
    ],
    'creditos-grande': [
      'Duele pagarlo y aun así lo pagas. Hay cosas que sólo se arreglan así.',
      'Sale caro. Lo raro sería que no.',
      'Ves marcharse el dinero y te quedas mirando el saldo un rato largo.',
      'Se lleva por delante los ahorros de bastante tiempo.',
      'Pagas y te queda esa sensación de haber comprado algo que no se ve.',
      'Es mucho dinero. Lo sabes mientras autorizas la transferencia.',
      'No se negocia el precio de estas cosas: se paga o no se paga.'
    ],
    'creditos-': [
      'Pagas y te vas sin mirar el saldo.',
      'Se te va algo en el camino. Ya contabas con ello.',
      'Cuatro créditos aquí, cuatro allá. Así se vacía una cuenta.',
      'Sale de tu bolsillo, como casi todo.',
      'Poco dinero y ninguna gana de discutirlo.'
    ],
    'salud-grande': [
      'Sales de ahí andando de milagro y tardas semanas en volver a estar entero.',
      'Lo pagas con el cuerpo. Eso tarda mucho más en devolverse que el dinero.',
      'Te llevan a un centro médico y no recuerdas el viaje.',
      'Pierdes la cuenta de los golpes antes de perder la conciencia.',
      'Te cosen en una trastienda y te dicen que has tenido suerte. No lo parece.',
      'El cuerpo dice basta y esta vez tiene razón.',
      'Vas a acordarte de esto cada vez que cambie el tiempo.'
    ],
    'salud-': [
      'Acabas con más golpes de los que pensabas y menos de los que podían ser.',
      'Nada grave. Nada que no se note al día siguiente al levantarte.',
      'Sales cojeando y haciéndote el entero delante de quien mira.',
      'Un corte, un moratón y una lección barata.',
      'Te duele algo que no sabías que se podía usar para eso.'
    ],
    'salud+': [
      'Te recomponen. El cuerpo agradece lo que la cabeza todavía no.',
      'Sales de ahí mejor de lo que entraste, y eso ya es raro.',
      'Duermes doce horas seguidas y despiertas siendo otro.',
      'Se cierra lo que llevabas abierto desde hacía demasiado.'
    ],
    'cordura+': [
      'Te vas más ligero de lo que llegaste, y sin saber muy bien por qué.',
      'Duermes bien esa noche. Últimamente no era lo normal.',
      'Algo se te coloca por dentro y se queda colocado.',
      'Se te quita un peso que llevabas sin darte cuenta de que lo llevabas.',
      'Sales respirando distinto. No sabrías explicarlo a nadie.',
      'Es una tontería y te arregla la semana entera.',
      'Por una vez no le das vueltas por la noche.',
      'Te ríes de verdad, que hacía tiempo.',
      'Lo cuentas después como si no hubiera sido importante. Lo fue.'
    ],
    'cordura-': [
      'Te lo llevas puesto y te dura más de lo que te gustaría reconocer.',
      'No se lo cuentas a nadie. Vuelve solo, por las noches.',
      'Sales de ahí con algo raro dentro y no lo sueltas en meses.',
      'Te quedas dándole vueltas en sitios donde no viene a cuento.',
      'Esa noche te despiertas dos veces y no sabes por qué.',
      'Se te queda una imagen que no pediste y no se borra.',
      'Haces como si nada. Te sale regular.',
      'Algo se te tuerce por dentro y tardas en enderezarlo.',
      'Piensas en ello mientras haces otra cosa, que es lo peor.'
    ],
    'alineamiento+': [
      'Nadie aplaude. Tú sabes lo que has hecho y con eso te vale.',
      'No sale en ningún registro. Sale en cómo te miras después.',
      'Cuesta más y era lo correcto. Las dos cosas son verdad.',
      'Nadie se entera y no hacía falta que nadie se enterase.',
      'Te complica el mes y no te arrepientes ni un segundo.',
      'Es lo que había que hacer. No siempre está tan claro.',
      'Pierdes tiempo, dinero y ganas. Ganas otra cosa.',
      'Alguien duerme mejor esta noche por lo que has hecho, y no eres tú.'
    ],
    'alineamiento-': [
      'Funciona. Y funciona demasiado bien, que es lo que da que pensar.',
      'Sale bien y nadie te pide explicaciones. Todavía.',
      'Lo haces y sigues con el día. Ahí está el problema.',
      'La primera vez cuesta. Esta no ha costado nada.',
      'Te justificas por el camino y te convences a la tercera calle.',
      'Nadie va a saberlo nunca. Eso no lo hace más limpio.',
      'Sale barato. Todo lo que sale barato se paga luego.',
      'Alguien paga esto por ti y ni siquiera sabes cómo se llama.'
    ],
    'reputacion+': [
      'Se corre la voz. La próxima vez ya no tienes que presentarte.',
      'Alguien lo cuenta en otro sitio y llega antes que tú.',
      'Tu nombre empieza a decirse con otro tono.',
      'Te saludan dos desconocidos en la misma semana.',
      'Se te empieza a tener en cuenta en conversaciones donde no estás.',
      'La versión que circula es mejor que lo que pasó, y no la corriges.'
    ],
    'reputacion-': [
      'Se corre la voz, y esta vez no a tu favor.',
      'Te cuesta un par de puertas que antes estaban abiertas.',
      'Alguien lo cuenta mal a propósito y prende enseguida.',
      'Notas el cambio en cómo te miran antes de que nadie diga nada.'
    ],
    'notoriedad+': [
      'Ahora hay gente que sabe tu cara y no todos son amigos.',
      'Sales en una conversación que no querías protagonizar.',
      'Empiezan a preguntar por ti en sitios donde no conviene.',
      'Tu nombre aparece en una lista. No en la buena.',
      'Alguien pega tu cara en un tablón y le pone una cifra debajo.',
      'A partir de hoy entras en los sitios mirando las salidas.'
    ],
    'fuerza+': [
      'Notas algo que antes no estaba. Todavía no sabes ponerle nombre.',
      'Se te queda dentro, callado, y crece por su cuenta.',
      'Por un momento sabes lo que va a pasar antes de que pase.',
      'Algo responde cuando lo llamas. Poco, pero responde.'
    ],
    'carisma+': [
      'Aprendes algo de cómo se maneja a la gente, y lo usas esa misma tarde.',
      'Te sale mejor de lo que esperabas y tomas nota de por qué.',
      'Descubres que si esperas dos segundos antes de hablar, ganas la sala.',
      'Te escuchan hasta el final. No siempre pasaba.',
      'Aprendes a decir que no sin que suene a que no.'
    ],
    'intelecto+': [
      'Te llevas una idea que no tenías al entrar.',
      'Aprendes algo que no estabas buscando, que suele ser lo que más dura.',
      'Entiendes por fin una cosa que llevabas años haciendo de memoria.',
      'Te queda una pregunta mejor que la que traías.',
      'Apuntas dos cosas y una de ellas te sirve años después.',
      'Sales sabiendo un poco más de cómo funciona todo esto.'
    ],
    'destreza+': [
      'Las manos van solas al final. Eso no se olvida.',
      'Repites el gesto luego, tú solo, hasta que sale limpio.',
      'Le pillas el punto a la tercera y ya no lo pierdes.',
      'Descubres que ibas sobrado de fuerza y corto de precisión.'
    ],
    'fisico+': [
      'El cuerpo aguanta y se acuerda.',
      'Acabas reventado y al día siguiente, un poco más fuerte.',
      'Te descubres haciendo sin pensar algo que hace un año no podías.'
    ],
    'suerte+': [
      'Sale bien por muy poco. Es mejor no pensar en el margen.',
      'Podía haber salido de siete maneras y sale de la buena.',
      'No sabes a quién darle las gracias, así que no se las das a nadie.'
    ],
    'nada': [
      'Y ya está. No todo lo que se decide tiene eco.',
      'La cosa se queda ahí. Sigues con el día.',
      'Pasa lo que tenía que pasar, que es casi nada.',
      'Se resuelve solo y ni te enteras de cómo.',
      'Nadie dice nada más del asunto.',
      'Queda en eso. Hay días así.'
    ]
  };

  /* Cosas que ya hablan solas: no hay que rematarlas */
  const YA_HABLA = ['volver', 'esMenu', 'devuelveAccion', 'combate', 'dogfight', 'duelo',
    'minijuego', 'reto', 'retoDuelo', 'cadena', 'generar', 'situacion', 'mueveA', 'mover',
    'viajarA', 'rutaViaje', 'empleo', 'buscarEmpleo', 'casar', 'hijo', 'nuevaRel',
    'cortarRel', 'matarRel', 'romper', 'despido', 'carcel', 'elegirBando', 'aceptaMision',
    'cierraMision', 'abandonaMision', 'retoMision', 'abreTrama', 'tramaAvanza', 'tramaCierra'];

  SW.necesitaDesenlace = function (d) {
    if (!d || d.out !== undefined) return false;      // el autor ya decidió, aunque fuera callar
    if (d.p != null && d.t) return false;             // es una rama sorteada: su `t` es el texto
    for (let i = 0; i < YA_HABLA.length; i++) if (d[YA_HABLA[i]] != null) return false;
    return !!d.fx;
  };

  /** El efecto que más pesa de todos, con su signo. */
  SW.efectoDominante = function (fx) {
    let mejor = null, peso = 0;
    for (let i = 0; i < ORDEN.length; i++) {
      const k = ORDEN[i];
      const v = fx[k];
      if (!v) continue;
      const p = Math.abs(v) * (PESO[k] || 1);
      if (p > peso) { peso = p; mejor = { k: k, v: v, p: p }; }
    }
    return peso >= 4 ? mejor : null;
  };

  /** Una frase de cierre para una opción que no traía ninguna. */
  SW.desenlaceAuto = function (g, d) {
    const dom = SW.efectoDominante(d.fx || {});
    let clave = 'nada';
    if (dom) {
      const signo = dom.v > 0 ? '+' : '-';
      const grande = dom.k === 'creditos' ? Math.abs(dom.v) >= 15000 : Math.abs(dom.v) >= 18;
      clave = dom.k + signo + (grande ? 'grande' : '');
      if (!LINEAS[clave]) clave = dom.k + signo;
      if (!LINEAS[clave]) clave = 'nada';
    }
    const pool = LINEAS[clave];
    /* Esto se dispara unas sesenta veces por vida: sin memoria, las
       frases más usadas se repetirían cada dos escenas. Se guardan las
       últimas seis y se evitan mientras queden alternativas. */
    g._desRecientes = g._desRecientes || [];
    const libres = pool.filter(function (x) { return g._desRecientes.indexOf(x) < 0; });
    const linea = g.rng.pick(libres.length ? libres : pool);
    g._desRecientes.push(linea);
    if (g._desRecientes.length > 6) g._desRecientes.shift();
    return linea;
  };

})(typeof window !== 'undefined' ? window : globalThis);

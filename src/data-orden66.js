/* ============================================================
   HOLOVIDA :: LA ORDEN 66
   19 ABY. No es un evento: es una noche entera encadenada dentro
   del mismo año. Cae donde tiene que caer en el calendario y lo que
   te pasa depende de LO QUE ERES: caballero, padawan, clon o civil.

   Sobrevivir siendo jedi no es fácil (~45%), siendo padawan lo es
   menos (~38%), y las dos cifras se mueven mucho con lo que elijas.

   Aquí viven también las pruebas de Caballero, porque un padawan que
   no ha pasado las pruebas no es lo mismo que un jedi hecho.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ESCENAS = SW.ESCENAS || {};
  SW.GUION = SW.GUION || [];
  SW.EVENTOS = SW.EVENTOS || [];

  const ANIO_66 = -19;

  /* ------------------------------------------------------------
     Quién eres cuando cae la Orden
     ------------------------------------------------------------ */
  SW.esPadawan = function (s) {
    if (s.trabajo !== 'jedi') return false;
    return !/caballero|maestro|consejo/i.test(s.rango || '');
  };
  SW.esCaballero = function (s) {
    return s.trabajo === 'jedi' && /caballero|maestro|consejo/i.test(s.rango || '');
  };
  const esClon = function (s) { return s.especie === 'clon' || s.especie === 'clon_nulo'; };

  /** Tu maestro. Si nunca se te asignó uno por escena, se te asigna aquí:
      nadie llega a padawan sin maestro. Ojo con el nombre: SW.maestroDe
      ya existe en data-canon.js y es otra cosa (saca un nombre canónico). */
  SW.miMaestro = function (g) {
    const s = g.s, rng = g.rng;
    let m = s.relaciones.filter(function (r) { return r.tipo === 'maestro jedi'; })[0];
    if (!m) {
      g.asignarMaestro('jedi');
      m = s.relaciones.filter(function (r) { return r.tipo === 'maestro jedi'; })[0];
    }
    if (!m) {
      const n = g.añadirRelacion('maestro jedi', rng.int(35, 70), null, 'el jedi que te tomó de padawan');
      m = s.relaciones.filter(function (r) { return r.nombre === n; })[0];
    }
    if (m && m.poder == null) {
      m.poder = rng.int(42, 92);
      m.forma = rng.pick(SW.FORMAS_SABLE);
    }
    return m;
  };

  /** Lo bien que te va a ir con tu maestro al lado: su poder y cuánto te quiere. */
  SW.apoyoMaestro = function (g) {
    const m = SW.miMaestro(g);
    if (!m || m.muerto) return 0;
    return Math.round(m.poder * 0.55 + Math.max(0, m.afecto) * 0.25);
  };

  const escena = function (id, def) { SW.ESCENAS[id] = def; };
  const tag = function (t) { return '<span class="scene-tag">' + t + '</span>'; };
  const anio = function (s) {
    return SW.formatoAnio && SW.anioGalactico ? SW.formatoAnio(SW.anioGalactico(s)) : '19 ABY';
  };

  /* ============================================================
     DISPARADOR: la Purga cae en su año y no en otro
     ============================================================ */
  SW.GUION.push({
    id: 'o66_purga', min: 0, max: 200, prio: 130, unaVez: true, gen: true, c: [],
    req: function (s) {
      if (s.flags.o66_vivida) return false;
      if (s.especie === 'droide') return false;
      const y = SW.anioGalactico ? SW.anioGalactico(s) : null;
      return y != null && y >= ANIO_66 && y <= ANIO_66 + 1;
    },
    hazlo: function (g) {
      const s = g.s;
      s.flags.o66_vivida = true;
      s.flags.orden66_pasada = true;
      // el «momento de era» genérico ya no tiene nada que contar aquí
      s.flags.momento_guerras_clon = true;
      s.o66 = { pie: 'de pie', ventaja: 0 };
      g.hito('Vive la Orden 66');
      /* Con dos años no se decide nada: la Purga te pasa por encima y te
         la contarán mal durante el resto de tu vida. */
      if (s.edadBio < 6) {
        g.log('La galaxia cambia de dueño mientras tú aprendes a andar. ' +
          'Toda tu vida te van a contar esta noche de una manera que no es la que fue.', 'res');
        s.flags.nacio_con_el_imperio = true;
        return null;
      }
      if (esClon(s)) return SW.ESCENAS.o66_clon_1(g);
      if (s.trabajo === 'sith' || s.flags.aprendiz_oscuro) return SW.ESCENAS.o66_sith(g);
      if (s.edadBio < 13 || (!SW.esJedi(s) && !s.flags.perdido_de_la_orden)) return SW.ESCENAS.o66_civil_1(g);
      if (SW.esPadawan(s)) return SW.ESCENAS.o66_pad_1(g);
      if (SW.esCaballero(s)) return SW.ESCENAS.o66_jedi_1(g);
      return SW.ESCENAS.o66_civil_1(g);
    }
  });

  /* ============================================================
     RAMA JEDI (caballero o maestro)
     ============================================================ */
  escena('o66_jedi_1', function (g) {
    const s = g.s;
    const conTropa = s.era === 'guerras_clon';
    return {
      id: 'o66_jedi_1', gen: true,
      t: tag('LA ORDEN 66 · ' + anio(s)) +
        '<p><b>«Ejecutar la Orden 66.»</b> La voz entra por el canal general y no es de nadie: ni de tu comandante, ni del Consejo, ni de la República.</p>' +
        '<p>' + (conTropa
          ? 'Los hombres con los que llevas dos años durmiendo en el barro se giran a la vez. No hay grito, ni insulto, ni aviso. Sólo los rifles subiendo y catorce caras iguales que ya no te miran a ti.'
          : 'La guarnición que te escoltaba baja los visores y se despliega en abanico. Han hecho esto mil veces en el simulador. Nunca contigo dentro del abanico.') + '</p>',
      c: [
        { t: 'Encender el sable antes de que dispare el primero',
          req: function (st) { return !!st.sable; },
          sub: 'Te la juegas a la mano. Si llegas, llegas de pie.',
          fx: { salud: -6, destreza: 4 }, cadena: 'o66_jedi_desvio',
          out: 'La hoja sale del cinturón antes que el primer disparo. Por poco.' },
        { t: 'Empujar con la Fuerza todo lo que tengas delante',
          req: function (st) { return st.sensible && st.stats.fuerza > 30; },
          sub: 'Ganas un segundo. Un segundo es mucho.',
          r: [
            { p: 0.55, t: 'Media escuadra sale despedida contra los contenedores. Tienes tu segundo.',
              fx: { fuerza: 6, salud: -3 }, cadena: 'o66_jedi_desvio', ventaja: 16 },
            { p: 0.45, t: 'La Fuerza no llega a tiempo: te tiembla todo. Empujas aire.',
              fx: { salud: -22, cordura: -10 }, cadena: 'o66_jedi_desvio' }
          ] },
        { t: 'Correr sin encender nada', sub: 'Sin duelo, sin honor y con la espalda descubierta.',
          fx: { salud: -22, cordura: -12, notoriedad: 6 },
          herida: { n: 'disparo de bláster en la espalda', sev: 16 },
          cadena: 'o66_jedi_salida',
          out: 'Corres. Te alcanzan dos veces antes de la esquina y sigues corriendo.' },
        { t: 'Gritarles sus nombres y pedirles que paren',
          sub: 'Los conoces a todos. Eso no va a importar.',
          fx: { salud: -34, cordura: -22, alineamiento: 18 },
          herida: { n: 'heridas de bláster múltiples', sev: 22 },
          cadena: 'o66_jedi_desvio',
          out: 'Dices tres nombres. El tercero llora mientras dispara y no puede parar. Tú tampoco entiendes nada.' }
      ]
    };
  });

  /* el intercambio: hoja contra fuego automático */
  escena('o66_jedi_desvio', function (g) {
    const s = g.s;
    if (!s.sable) return SW.ESCENAS.o66_jedi_salida(g);
    const dif = U.clamp(70 - (s.o66 && s.o66.ventaja ? s.o66.ventaja : 0) - s.stats.destreza / 8, 42, 88);
    g.retoDuelo({
      id: 'o66_desvio', tag: 'HOJA CONTRA FUEGO', modo: 'desvio', dif: dif, sinPremio: true,
      txt: 'Ocho rifles y un pasillo. No puedes matarlos a todos y no vas a intentarlo: sólo tienes que llegar a la puerta del fondo con el corazón dentro del pecho.',
      critico: { t: 'Los disparos vuelven por donde vinieron. Llegas al fondo del pasillo entero, con la respiración fija y con un hueco por delante que nadie está cubriendo.',
        fx: { destreza: 8, fuerza: 6, salud: -4, reputacion: 6 }, flag: 'o66_limpio',
        ventaja: 24, cadena: 'o66_jedi_salida' },
      bien: { t: 'Desvías lo que importa y encajas lo que no. Llegas.',
        fx: { destreza: 5, salud: -12 }, ventaja: 10, cadena: 'o66_jedi_salida' },
      medio: { t: 'Paras la mitad. La otra mitad te encuentra, y para cuando sales ya han cerrado el perímetro.',
        fx: { salud: -28, cordura: -8 }, herida: { n: 'quemadura de bláster', sev: 14 },
        ventaja: -12, cadena: 'o66_jedi_salida' },
      mal: { t: 'No hay parada que valga. Te cosen contra la pared y sales de allí porque alguien deja de disparar para recargar. Fuera ya te esperan.',
        fx: { salud: -46, cordura: -14 }, herida: { n: 'perforación de bláster en el costado', sev: 24 },
        ventaja: -26, cadena: 'o66_jedi_salida' }
    });
    return null;
  });

  escena('o66_jedi_salida', function (g) {
    const s = g.s;
    const d = s.stats.destreza, i = s.stats.intelecto;
    /* Lo que hiciste con la hoja hace treinta segundos decide con qué
       cerco te encuentras ahora: por eso el duelo no es decorativo. */
    const v = (s.o66 && s.o66.ventaja) || 0;
    const b = v / 180;                            // empuja a favor
    const mal = U.clamp(-v / 260, -0.14, 0.15);   // y en contra si lo hiciste fatal
    return {
      id: 'o66_jedi_salida', gen: true,
      t: tag('LA MISMA NOCHE · SALIR') +
        '<p>Fuera hay más. Siempre hay más: el cerco se cierra con la calma de quien ha ensayado esto durante meses ' +
        'sin saber que lo estaba ensayando.</p><p class="dim">Salud ' + s.stats.salud + '%. ' +
        (v >= 20 ? 'Has salido limpio del pasillo: todavía no saben por dónde vas.'
         : v <= -12 ? 'Vas dejando un rastro de sangre y ya tienen tu posición.'
         : 'Aquí es donde se decide.') + '</p>',
      c: [
        { t: 'Robar una cañonera del campo', sub: 'Rápido y a la vista de todos. Depende de tus manos.',
          r: [
            { p: U.clamp(0.34 + b + d / 200 + s.stats.suerte / 420, 0.22, 0.82), t: 'Te llevas la cañonera con dos disparos en el fuselaje y ninguno dentro.',
              fx: { destreza: 8, cordura: -10 }, cadena: 'o66_jedi_baliza' },
            { p: 0.28, t: 'Despegas con la rampa abierta y medio pelotón dentro. Aterrizas a ocho kilómetros, ardiendo.',
              fx: { salud: -34, cordura: -14 }, herida: { n: 'quemaduras del aterrizaje', sev: 18 }, cadena: 'o66_jedi_baliza' },
            { p: U.clamp(0.26 + mal, 0.18, 0.36), t: 'La torreta antiaérea no falla. La cañonera se abre en el aire.',
              muerte: true, muerteTxt: 'Derribado sobre su propio campamento la noche de la Orden 66.' }
          ] },
        { t: 'Bajar a los túneles de drenaje', sub: 'Lento, sucio y muy poco heroico. Depende de la cabeza.',
          r: [
            { p: U.clamp(0.34 + b + i / 190, 0.22, 0.82), t: 'Tres horas de agua helada hasta la cintura y sales a nueve manzanas del cerco.',
              fx: { intelecto: 6, salud: -12, cordura: -10 }, cadena: 'o66_jedi_baliza' },
            { p: 0.36, t: 'Te equivocas de ramal y acabas saliendo dentro del cerco. Tienes que volver a empezar y esta vez sangrando.',
              fx: { salud: -30, cordura: -12 }, cadena: 'o66_jedi_baliza' },
            { p: U.clamp(0.16 + mal, 0.10, 0.26), t: 'Lo que encuentras en el ramal cerrado es un comando con visores térmicos esperando exactamente esto.',
              muerte: true, muerteTxt: 'Cazado en un desagüe la noche de la Orden 66.' }
          ] },
        { t: 'Tumbarte entre los cuerpos y esperar a que amanezca',
          sub: 'La opción que nadie cuenta luego. Es la que más veces funciona.',
          r: [
            { p: U.clamp(0.66 + b, 0.6, 0.82), t: 'Nueve horas sin moverte, con la cara contra el barro y alguien que conocías encima. Al alba ya no hay nadie.',
              fx: { cordura: -30, salud: -8, alineamiento: -4 }, flag: 'o66_entre_muertos', cadena: 'o66_jedi_baliza' },
            { p: 0.22, t: 'Pasan el detector de signos vitales por la fila. Te da tiempo a rodar y a correr, no a pensar.',
              fx: { salud: -26, cordura: -24 }, cadena: 'o66_jedi_baliza' },
            { p: U.clamp(0.12 + mal, 0.07, 0.22), t: 'Pasan el detector. No te da tiempo a nada.',
              muerte: true, muerteTxt: 'Encontrado entre los cuerpos la noche de la Orden 66.' }
          ] },
        { t: 'Volver a por los que estaban dentro',
          sub: 'Hay heridos y hay críos con trenza. Es la peor idea posible.',
          r: [
            { p: U.clamp(0.30 + b, 0.26, 0.44), t: 'Sacas a tres. Uno es un padawan de once años que no suelta tu capa en toda la noche.',
              fx: { alineamiento: 30, reputacion: 18, cordura: -18, salud: -26 }, flag: 'salvo_jedi',
              rel: { tipo: 'padawan', afecto: 80, quien: 'el crío que sacaste de la Purga' }, cadena: 'o66_jedi_baliza' },
            { p: 0.24, t: 'Llegas tarde para todos menos para ti. Eso también hay que cargarlo.',
              fx: { cordura: -34, salud: -30, alineamiento: 10 }, cadena: 'o66_jedi_baliza' },
            { p: U.clamp(0.46 + mal, 0.36, 0.58), t: 'Vuelves a entrar. Ya sabías cómo acababa esto.',
              muerte: true, muerteTxt: 'Volvió a entrar a por los suyos la noche de la Orden 66.' }
          ] },
        { t: 'Dejar el sable en el suelo y salir con las manos vistas',
          sub: 'No tienen orden de detener a nadie.',
          r: [
            { p: 0.14, t: 'Un sargento aparta el cañón dos centímetros y te dice «corra, señor» sin mirarte. No sabes por qué.',
              fx: { cordura: -20, alineamiento: 12, fuerza: -10 }, sablePierde: true, flag: 'jedi_oculto', cadena: 'o66_jedi_baliza' },
            { p: 0.86, t: 'No tienen orden de detener a nadie.',
              muerte: true, muerteTxt: 'Se rindió la noche de la Orden 66.' }
          ] }
      ]
    };
  });

  escena('o66_jedi_baliza', function (g) {
    const s = g.s;
    return {
      id: 'o66_jedi_baliza', gen: true,
      t: tag('LA BALIZA DEL TEMPLO') +
        '<p>Estás vivo y el comunicador sigue funcionando. Lo que sale de él es la señal de reagrupamiento del Templo: ' +
        '<i>volved a casa, aquí estáis a salvo</i>.</p>' +
        '<p>Sabes leer la marca de tiempo de una transmisión. Esa señal se ha reescrito hace seis horas.</p>',
      c: [
        { t: 'Recodificarla desde aquí para que diga lo contrario',
          sub: 'No hace falta estar allí para tocar una señal. Hace falta cabeza y Fuerza.',
          cadena: 'o66_jedi_recodificar' },
        { t: 'Ir a Coruscant a apagarla tú mismo',
          sub: 'Es lo que haría un jedi. Por eso lo tienen previsto.',
          r: [
            { p: 0.44, t: 'Entras por los conductos de mantenimiento, llegas a la torre de comunicaciones y cambias la señal. En los años siguientes te cruzarás con gente que sigue viva por esto.',
              fx: { reputacion: 26, fuerza: 12, cordura: -26, salud: -30, notoriedad: 25 },
              flag: 'apago_baliza', flag2: 'salvo_jedi', hito: 'Apaga la baliza del Templo',
              cadena: 'o66_jedi_fin' },
            { p: 0.56, t: 'Hay un pelotón de la 501 en cada rellano de esa torre y no se cansan.',
              muerte: true, muerteTxt: 'Cayó en el Templo intentando apagar la baliza.' }
          ] },
        { t: 'Apagar el comunicador y desaparecer',
          sub: 'Lo que hicieron casi todos los que llegaron a viejos.',
          fx: { cordura: -16, notoriedad: -10, fuerza: -6 }, flag: 'jedi_oculto',
          out: 'Lo tiras a un canal. Sigue sonando debajo del agua un rato.',
          cadena: 'o66_jedi_fin' },
        { t: 'Contestar a la baliza y pedir ayuda',
          sub: 'Alguien tiene que quedar al otro lado.',
          r: [
            { p: 0.54, t: 'Contesta una voz que dice ser un maestro y que no lo es. Cortas a tiempo. Por poco.',
              fx: { cordura: -22, notoriedad: 18 }, buscado: 30, cadena: 'o66_jedi_fin' },
            { p: 0.46, t: 'Contestan enseguida. Llegan en cuarenta minutos.',
              muerte: true, muerteTxt: 'Contestó a la baliza y le contestaron a él.' }
          ] }
      ]
    };
  });

  escena('o66_jedi_recodificar', function (g) {
    g.retoFuerza({
      dif: U.clamp(84 - g.s.stats.intelecto / 4, 45, 88),
      txt: 'La señal es un patrón repetido. Para reescribirla sin que salte la verificación hay que sostener el patrón entero en la cabeza y devolverlo cambiado. Una sola vez.',
      critico: { t: 'La baliza ahora dice: «no vengáis». Se emitirá durante nueve días antes de que la corten.',
        fx: { intelecto: 12, fuerza: 10, reputacion: 16, cordura: -10 }, flag: 'salvo_jedi', flag2: 'salvo_jedi_dispersos',
        cadena: 'o66_jedi_fin' },
      bien: { t: 'La señal sale corrupta: no dice «no vengáis», pero ya no dice «volved». Algo es algo.',
        fx: { intelecto: 8, reputacion: 8, cordura: -8 }, flag: 'salvo_jedi_dispersos', cadena: 'o66_jedi_fin' },
      medio: { t: 'La verificación salta. Ahora saben desde dónde se ha intentado.',
        fx: { cordura: -14, notoriedad: 20 }, buscado: 28, cadena: 'o66_jedi_fin' },
      mal: { t: 'La verificación salta y además dejas tu firma de acceso de la Orden en el registro. Con nombre.',
        fx: { cordura: -20, notoriedad: 30 }, buscado: 45, flag: 'o66_fichado', cadena: 'o66_jedi_fin' }
    });
    return null;
  });

  /* ¿te ofrecen el otro camino? Raro, y sólo si ya estabas a medio camino */
  SW.ofrecerInquisidor = function (g) {
    const s = g.s;
    if (s.flags.inquisidor || s.muerto) return false;
    if (s.stats.alineamiento > 22) return false;
    if (s.stats.fuerza < 38) return false;
    const p = 0.22 + (s.stats.alineamiento < -20 ? 0.20 : 0) + (s.stats.fuerza > 65 ? 0.08 : 0);
    return g.rng.chance(p);
  };

  escena('o66_jedi_fin', function (g) {
    const s = g.s;
    if (SW.ofrecerInquisidor(g)) return SW.ESCENAS.o66_oferta(g);
    s.flags.superviviente_purga = true;
    return {
      id: 'o66_jedi_fin', gen: true,
      t: tag('AMANECE') +
        '<p>Amanece sobre una galaxia que se ha acostado con una República y se ha levantado con un Imperio. ' +
        'En los holos, un anciano con la cara derretida habla de una conspiración jedi.</p>' +
        '<p>Quedan unos cuantos. Muy pocos, y ninguno sabe dónde están los otros.</p>',
      c: [
        { t: 'Enterrar el sable y ser otra persona', fx: { fuerza: -18, cordura: 10, notoriedad: -25 },
          flag: 'jedi_oculto', sablePierde: true, despido: true, mover: true, motivo: 'borrando tu rastro',
          out: 'Te cortas el pelo con un cuchillo de cocina. Empiezas de cero, con un nombre que no es el tuyo.' },
        { t: 'Quedarte el sable aunque te queme en la bolsa', fx: { cordura: -8, fuerza: 4, notoriedad: 8 },
          flag: 'superviviente_armado', despido: true, mover: true, motivo: 'huyendo de la Purga',
          out: 'Lo desmontas en piezas y lo repartes por el fondo de la bolsa. Es lo único tuyo que queda.' },
        { t: 'Buscar a los que queden', fx: { cordura: 6, notoriedad: 16, alineamiento: 10 },
          flag: 'busca_supervivientes', despido: true, mover: true, motivo: 'buscando a los que quedan',
          buscado: 20, out: 'Es la peor forma de esconderse y la única que te deja dormir.' },
        { t: 'Jurar que alguien va a pagar esto', fx: { alineamiento: -18, fuerza: 10, cordura: -12, notoriedad: 12 },
          flag: 'jura_venganza', despido: true, mover: true, motivo: 'con una lista en la cabeza',
          out: 'La rabia también es un combustible. Malo, pero arde mucho tiempo.' }
      ]
    };
  });

  /* ============================================================
     LA OFERTA: la Inquisición sólo llama a quien ya dudaba
     ============================================================ */
  escena('o66_oferta', function (g) {
    const s = g.s;
    return {
      id: 'o66_oferta', gen: true,
      t: tag('LA OFERTA') +
        '<p>No te encuentra un pelotón: te encuentra una mujer sola, con una capa sin insignias y un sable que no enciende.</p>' +
        '<p>«Sé lo que sientes ahora mismo, y no es miedo. Es rabia, y llevas años pidiéndole permiso al Consejo para sentirla.» ' +
        'Se sienta enfrente como si tuviera toda la noche. «Hay un sitio donde no hace falta pedir permiso. ' +
        'Se paga con lo único que ya has perdido igualmente.»</p>',
      c: [
        { t: 'Preguntar qué hay que hacer exactamente',
          sub: 'Ya sabes lo que hay que hacer. Preguntarlo es la mitad del sí.',
          fx: { cordura: -8, alineamiento: -10 }, cadena: 'o66_oferta_2',
          out: '«Encontrar a los que queden. Uno por uno. Se les da la oportunidad de arrodillarse.»' },
        { t: 'Encender el sable', sub: 'Aquí y ahora.',
          combate: { dif: 82, duelo: true, sable: true, aMuerte: true, inquisidor: true },
          fx: { alineamiento: 14 }, cadena: 'o66_oferta_rechazo' },
        { t: 'Levantarte y marcharte sin decir nada',
          fx: { cordura: 8, alineamiento: 14, notoriedad: 8 }, flag: 'rechazo_inquisicion',
          out: '«Tranquilo», dice a tu espalda. «Nos vamos a ver mucho.»', cadena: 'o66_jedi_fin_tras_oferta' },
        { t: 'Escupirle y decirle su nombre de antes',
          req: function (st) { return st.stats.intelecto > 55; },
          sub: 'Porque tú sabes quién era. Estaba tres cursos por delante.',
          fx: { cordura: -10, alineamiento: 16, notoriedad: 14 }, flag: 'rechazo_inquisicion',
          buscado: 25, out: 'Se le mueve algo en la cara. Sólo un instante. Luego se va.',
          cadena: 'o66_jedi_fin_tras_oferta' }
      ]
    };
  });

  escena('o66_oferta_rechazo', function (g) {
    // si has sobrevivido al duelo, la Inquisición ya tiene tu cara
    const s = g.s;
    s.flags.rechazo_inquisicion = true;
    s.stats.notoriedad = U.clamp(s.stats.notoriedad + 20, 0, 100);
    return SW.ESCENAS.o66_jedi_fin_tras_oferta(g);
  });

  escena('o66_jedi_fin_tras_oferta', function (g) {
    g.s.flags.o66_oferta_hecha = true;
    return SW.ESCENAS.o66_jedi_fin(g);
  });

  escena('o66_oferta_2', function (g) {
    const s = g.s;
    return {
      id: 'o66_oferta_2', gen: true,
      t: tag('EL PRECIO') +
        '<p>«El primero te lo damos elegido», dice. «Y no va a ser un desconocido. Nunca lo es la primera vez.»</p>' +
        '<p>Pone un holo encima de la mesa. Es alguien del Templo. Alguien con quien compartiste dormitorio.</p>',
      c: [
        { t: 'Cogerlo', sub: 'No hay vuelta desde aquí.',
          fx: { alineamiento: -40, cordura: -25, fuerza: 14, notoriedad: 25, reputacion: -20 },
          flag: 'inquisidor', flag2: 'o66_convertido', hazteInquisidor: true,
          out: 'Coges el holo. Ella asiente como quien firma un albarán.' },
        { t: 'Cogerlo y jurarte por dentro que le avisarás',
          sub: 'Todo el mundo se dice esto la primera vez.',
          fx: { alineamiento: -22, cordura: -18, fuerza: 10, notoriedad: 20 },
          flag: 'inquisidor', flag2: 'inquisidor_doble', hazteInquisidor: true,
          out: 'Te lo juras de verdad. Ella también lo sabe, y le da exactamente igual.' },
        { t: 'Levantarte de la mesa a mitad de frase',
          fx: { cordura: 10, alineamiento: 12, notoriedad: 10 }, flag: 'rechazo_inquisicion',
          out: 'Sales sin cerrar la puerta. Detrás no se oyen pasos, y eso es peor.',
          cadena: 'o66_jedi_fin_tras_oferta' }
      ]
    };
  });

  /* ============================================================
     RAMA PADAWAN: depende de tu maestro y es más dura
     ============================================================ */
  escena('o66_pad_1', function (g) {
    const s = g.s;
    const m = SW.miMaestro(g);
    s.o66.maestro = m.nombre;
    const fuerte = m.poder > 70;
    return {
      id: 'o66_pad_1', gen: true,
      t: tag('LA ORDEN 66 · ' + anio(s)) +
        '<p><b>«Ejecutar la Orden 66.»</b> Tú no oyes la orden: oyes cómo se levantan catorce rifles a la vez.</p>' +
        '<p><b>' + U.esc(m.nombre) + '</b>, tu maestro, ya tiene la hoja encendida y está delante de ti. ' +
        (fuerte ? 'Se mueve como no le has visto moverse en cinco años de entrenamiento.'
                : 'Está aguantando, pero no va a aguantar mucho.') + '</p>' +
        '<p class="dim">Tu maestro: ' + U.esc(m.nombre) + ' · pericia ' + m.poder + ' · forma ' + U.esc(m.forma || '—') +
        ' · os tenéis ' + (m.afecto > 55 ? 'mucho cariño' : m.afecto > 25 ? 'respeto' : 'poca cosa') + '</p>',
      c: [
        { t: 'Espalda contra espalda con él',
          req: function (st) { return !!st.sable; },
          sub: 'Es lo que os enseñaron. Funciona si los dos aguantáis.',
          fx: { salud: -8, fuerza: 4 }, ventaja: 20, cadena: 'o66_pad_desvio',
          out: 'Notas su espalda contra la tuya y durante diez segundos esto se parece a un entrenamiento.' },
        { t: 'Hacer lo que te está gritando: correr',
          sub: 'Le obedeces. Es lo último que te va a pedir.',
          fx: { salud: -14, cordura: -16 }, flag: 'o66_corriste', cadena: 'o66_pad_sacrificio',
          out: 'Corres sin mirar atrás porque mirar atrás cuesta medio segundo y él te ha dado ese medio segundo.' },
        { t: 'Quedarte clavado en el sitio',
          sub: 'Tienes quince años y esto no estaba en ninguna clase.',
          fx: { salud: -30, cordura: -26 }, herida: { n: 'disparo en el hombro', sev: 15 },
          cadena: 'o66_pad_desvio',
          out: 'Él tiene que retroceder a cubrirte y eso le cuesta la posición. Y la pierna.' },
        { t: 'Ir a por el detonador térmico del cinturón del sargento',
          sub: 'Es una barbaridad. También es lo único que no esperan.',
          r: [
            { p: 0.38, t: 'Lo arrancas, lo tiras y el pasillo se convierte en humo y gritos. Vía libre.',
              fx: { destreza: 10, salud: -16, cordura: -12, notoriedad: 10 }, ventaja: 26, cadena: 'o66_pad_desvio' },
            { p: 0.62, t: 'Llegas al cinturón. No llegas a soltarlo antes de que te alcancen.',
              fx: { salud: -40, cordura: -14 }, herida: { n: 'quemaduras de detonación', sev: 24 }, cadena: 'o66_pad_desvio' }
          ] }
      ]
    };
  });

  escena('o66_pad_desvio', function (g) {
    const s = g.s;
    const apoyo = SW.apoyoMaestro(g);
    if (!s.sable) return SW.ESCENAS.o66_pad_sacrificio(g);
    // un padawan lo tiene peor: menos oficio. Lo que compensa es el maestro.
    const dif = U.clamp(84 - apoyo / 3 - (s.o66.ventaja || 0) - s.stats.destreza / 10, 46, 94);
    g.retoDuelo({
      id: 'o66_pad_desvio', tag: 'HOJA CONTRA FUEGO · CON TU MAESTRO', modo: 'desvio', dif: dif, sinPremio: true,
      txt: 'Él cubre el ángulo alto. Todo lo demás es tuyo. Todavía no manejas la hoja lo suficiente y los dos lo sabéis.',
      critico: { t: 'Aguantas tu lado entero. Él te mira un segundo, sorprendido, y ese segundo vale más que la trenza.',
        fx: { destreza: 10, fuerza: 8, salud: -6, reputacion: 8 }, flag: 'o66_limpio',
        ventaja: 22, maestroAfecto: 12, cadena: 'o66_pad_sacrificio' },
      bien: { t: 'Aguantas. Encajas un par. Aguantas.', fx: { destreza: 6, salud: -14 },
        ventaja: 8, cadena: 'o66_pad_sacrificio' },
      medio: { t: 'Se te cuela más de lo que paras y él tiene que taparte dos veces.',
        fx: { salud: -30, cordura: -10 }, herida: { n: 'quemadura de bláster', sev: 15 },
        ventaja: -12, cadena: 'o66_pad_sacrificio' },
      mal: { t: 'No paras casi nada. Él se come tu lado además del suyo, y un jedi que pelea por dos deja de pelear bien.',
        fx: { salud: -44, cordura: -16 }, herida: { n: 'perforación de bláster', sev: 22 },
        ventaja: -24, flag: 'o66_maestro_tocado', cadena: 'o66_pad_sacrificio' }
    });
    return null;
  });

  escena('o66_pad_sacrificio', function (g) {
    const s = g.s;
    const m = SW.miMaestro(g);
    const tocado = s.flags.o66_maestro_tocado;
    const apoyo = SW.apoyoMaestro(g) + ((s.o66 && s.o66.ventaja) || 0);
    return {
      id: 'o66_pad_sacrificio', gen: true,
      t: tag('LA RAMPA') +
        '<p>Hay una lanzadera con el motor encendido a treinta metros y un pasillo abierto que se cierra por segundos.</p>' +
        '<p><b>' + U.esc(m.nombre) + '</b> te pone una mano en el pecho y te empuja hacia la rampa sin dejar de mirar al frente. ' +
        (tocado ? 'Le tiembla el brazo del sable y no puede levantarlo del todo. ' : '') +
        '«Sube. Yo los entretengo.»</p>',
      c: [
        { t: 'Subir', sub: 'Es lo que te está pidiendo. Vas a llevarlo encima toda la vida.',
          r: [
            { p: U.clamp(0.62 + apoyo / 700, 0.55, 0.78), t: 'La rampa se cierra con él fuera. Lo último que ves es su hoja moviéndose muy deprisa y muy sola.',
              fx: { cordura: -34, salud: -6, fuerza: 8 }, flag: 'maestro_murio_por_ti',
              matarRel: 'maestro jedi', hito: 'Su maestro muere para que él suba a la lanzadera',
              cadena: 'o66_pad_salida' },
            { p: 0.24, t: 'La rampa se cierra con él fuera y con un disparo dentro, en tu costado. Pilotas tú, que nunca has pilotado nada.',
              fx: { cordura: -34, salud: -34 }, herida: { n: 'disparo en el costado', sev: 20 },
              flag: 'maestro_murio_por_ti', matarRel: 'maestro jedi', cadena: 'o66_pad_salida' },
            { p: U.clamp(0.20 - apoyo / 700, 0.06, 0.22), t: 'La lanzadera despega y la batería antiaérea del perímetro no está pensada para dejar salir a nadie.',
              muerte: true, muerteTxt: 'Derribado al despegar la noche de la Orden 66.' }
          ] },
        { t: 'Quedarte con él', sub: 'Los dos o ninguno. Casi siempre es ninguno.',
          r: [
            { p: U.clamp(0.12 + apoyo / 420, 0.12, 0.30), t: 'Salís los dos. No sabes cómo. Él tampoco, y no lo va a explicar nunca.',
              fx: { cordura: -12, fuerza: 14, reputacion: 12, salud: -24 }, flag: 'maestro_vivo',
              hito: 'Sale de la Purga con su maestro vivo', cadena: 'o66_pad_salida' },
            { p: 0.36, t: 'Él cae. Tú sales porque él cae encima del que te apuntaba.',
              fx: { cordura: -38, salud: -26, alineamiento: -6 }, matarRel: 'maestro jedi',
              flag: 'maestro_murio_por_ti', cadena: 'o66_pad_salida' },
            { p: U.clamp(0.46 - apoyo / 700, 0.30, 0.50), t: 'Los dos os quedáis. Los dos.',
              muerte: true, muerteTxt: 'Se quedó con su maestro la noche de la Orden 66.' }
          ] },
        { t: 'Empujarle tú a él con la Fuerza dentro de la lanzadera',
          req: function (st) { return st.sensible && st.stats.fuerza > 40; },
          sub: 'Le debes cinco años. Se los devuelves ahora o no se los devuelves.',
          r: [
            { p: 0.30, t: 'Entra de espaldas y la rampa se cierra con él dentro gritando tu nombre. Tú te quedas fuera, y fuera hay una alcantarilla.',
              fx: { cordura: -20, fuerza: 16, alineamiento: 26, salud: -34 }, flag: 'maestro_vivo',
              hito: 'Manda a su maestro a la lanzadera y se queda', cadena: 'o66_pad_salida' },
            { p: 0.70, t: 'Se resiste. Claro que se resiste: te dobla en Fuerza y en años.',
              muerte: true, muerteTxt: 'Intentó salvar a su maestro la noche de la Orden 66.' }
          ] },
        { t: 'Decirle que corra él y quedarte tú a cerrar el pasillo',
          sub: 'Un padawan cerrando un pasillo. Ya sabes cómo suena.',
          r: [
            { p: 0.18, t: 'Aguantas ocho segundos. Ocho segundos bastan. Sales por el hueco de mantenimiento con la capa ardiendo.',
              fx: { cordura: -14, fuerza: 18, reputacion: 14, salud: -40 }, flag: 'maestro_vivo',
              herida: { n: 'quemaduras graves', sev: 26 }, hito: 'Cierra el pasillo para que salga su maestro',
              cadena: 'o66_pad_salida' },
            { p: 0.82, t: 'Aguantas cuatro.',
              muerte: true, muerteTxt: 'Cubrió la retirada de su maestro con quince años.' }
          ] }
      ]
    };
  });

  escena('o66_pad_salida', function (g) {
    const s = g.s;
    const solo = !s.flags.maestro_vivo;
    return {
      id: 'o66_pad_salida', gen: true,
      t: tag('SOLO, POR PRIMERA VEZ') +
        '<p>' + (solo
          ? 'Nadie te ha enseñado a hacer nada de esto. Llevas la trenza puesta, un sable que no sabes esconder y una cara que sale en un holo de la red imperial desde hace tres horas.'
          : 'Estáis los dos vivos, sin nave propia, sin dinero y con dos sables que hay que hacer desaparecer antes del siguiente control.') + '</p>' +
        '<p class="dim">Salud ' + s.stats.salud + '%.</p>',
      c: [
        { t: 'Cortarte la trenza', sub: 'Es lo primero que mira un control.',
          fx: { cordura: -18, notoriedad: -20, fuerza: -6 }, flag: 'jedi_oculto',
          out: 'La cortas con la propia hoja y la tiras a un incinerador. Duele mucho más de lo que debería.',
          cadena: 'o66_pad_control' },
        { t: 'Meterte en una bodega de carga y dejar que te lleve donde sea',
          fx: { cordura: -10, salud: -8 }, cadena: 'o66_pad_control',
          out: 'Cuatro días entre contenedores de grano. Sales en un mundo cuyo nombre no sabes pronunciar.' },
        { t: 'Buscar a los padres que no recuerdas', sub: 'Te llevaron al Templo con dos años. Alguien te dejó allí.',
          fx: { cordura: 6, intelecto: 8, notoriedad: 6 }, flag: 'busca_su_origen',
          out: 'No tienes ni el mundo. Tienes un número de registro y muchas ganas de que signifique algo.',
          cadena: 'o66_pad_control' },
        { t: 'Ir a por el que dio la orden', sub: 'Tienes quince años y un sable. Adelante.',
          fx: { alineamiento: -14, fuerza: 10, cordura: -14, notoriedad: 18 }, flag: 'jura_venganza',
          buscado: 25, out: 'No llegarás. Pero no lo sabes todavía, y eso es lo que te mantiene en pie esta noche.',
          cadena: 'o66_pad_fin' }
      ]
    };
  });

  /* Un padawan solo no sabe moverse por una galaxia que le busca: aquí
     es donde se cae la mayoría, y por eso su Purga es más dura que la
     de un caballero hecho. */
  escena('o66_pad_control', function (g) {
    const s = g.s;
    const marcado = !s.flags.jedi_oculto;
    return {
      id: 'o66_pad_control', gen: true,
      t: tag('CONTROL DE SALIDA') +
        '<p>Puerto espacial, cola de embarque, escáner y dos filas de armadura blanca. ' +
        (marcado ? 'Llevas la trenza, la cara del holo y quince años.' : 'Vas rapado y sucio, que es lo mejor que puedes hacer.') + '</p>' +
        '<p>El que lee las tarjetas no levanta la vista. El de detrás sí.</p>',
      c: [
        { t: 'Pasar por el escáner como si nada',
          r: [
            { p: U.clamp((marcado ? 0.42 : 0.68) + s.stats.carisma / 320, 0.3, 0.86),
              t: 'Pasas. Tardas dos calles en volver a respirar bien.',
              fx: { cordura: -10 }, cadena: 'o66_pad_fin' },
            { p: 0.34, t: 'El de detrás te para. Sales corriendo por la pasarela de servicio con medio andén detrás.',
              fx: { salud: -26, cordura: -14, notoriedad: 14 }, herida: { n: 'caída desde la pasarela', sev: 14 },
              cadena: 'o66_pad_fin' },
            { p: marcado ? 0.30 : 0.13, t: 'El escáner pita. No es un escáner de metales: es un escáner de sangre.',
              muerte: true, muerteTxt: 'Detenido en un control de salida días después de la Orden 66.' }
          ] },
        { t: 'Usar la Fuerza con el que lee las tarjetas',
          req: function (st) { return st.sensible; },
          sub: 'Es lo primero que te enseñaron y lo que peor se te da.',
          r: [
            { p: U.clamp(0.28 + s.stats.fuerza / 210, 0.24, 0.74), t: '«No hace falta que veas esa tarjeta.» Y no le hace falta.',
              fx: { fuerza: 12, cordura: 6 }, cadena: 'o66_pad_fin' },
            { p: 0.44, t: 'Le empujas la cabeza más de la cuenta y se cae al suelo. Eso llama la atención de todo el andén.',
              fx: { salud: -24, notoriedad: 20, cordura: -12 }, cadena: 'o66_pad_fin' },
            { p: 0.22, t: 'Hay un inhibidor ysalamiri en la aduana. Lo notas cuando ya has intentado el empujón.',
              muerte: true, muerteTxt: 'Le pillaron usando la Fuerza en una aduana imperial.' }
          ] },
        { t: 'No pasar: buscar un contrabandista',
          sub: 'Cuesta dinero y hay que fiarse de alguien.',
          r: [
            { p: 0.58, t: 'Un capitán viejo que no pregunta y cobra el triple. Sales metido en un depósito de agua.',
              fx: { creditos: -6000, cordura: -6, salud: -10 }, cadena: 'o66_pad_fin' },
            { p: 0.28, t: 'Coge el dinero y no aparece. Pierdes tres semanas y todo lo que tenías.',
              fx: { creditos: -6000, cordura: -14 }, cadena: 'o66_pad_fin' },
            { p: 0.14, t: 'Coge el dinero y te vende. Te está esperando la patrulla en el muelle.',
              muerte: true, muerteTxt: 'Vendido por un contrabandista semanas después de la Orden 66.' }
          ] },
        { t: 'Quedarte en este mundo y aprender a ser invisible',
          sub: 'No salir es también una forma de salir.',
          fx: { cordura: -12, fuerza: -10, notoriedad: -25, intelecto: 8 }, flag: 'jedi_oculto',
          out: 'Fregando platos en un puerto que huele a combustible. Nadie mira a los que friegan platos.',
          cadena: 'o66_pad_fin' }
      ]
    };
  });

  escena('o66_pad_fin', function (g) {
    const s = g.s;
    s.flags.superviviente_purga = true;
    s.padawan = false;
    if (SW.ofrecerInquisidor(g) && s.stats.fuerza > 45) return SW.ESCENAS.o66_oferta(g);
    return {
      id: 'o66_pad_fin', gen: true,
      t: tag('AMANECE') +
        '<p>Sales de esa noche siendo lo que la Orden no llegó a nombrarte. Nadie te va a cortar la trenza en una ceremonia, ' +
        'nadie te va a llamar Caballero.</p><p>Estás vivo, y por lo que sabes puede que seas el único.</p>',
      c: [
        { t: 'Nombrarte a ti mismo', fx: { cordura: 14, fuerza: 8, carisma: 6 },
          rango: 'Caballero Jedi', despido: true, mover: true, motivo: 'lejos de todo lo que conocías',
          out: 'Dices las palabras en voz alta, solo, en la bodega de un carguero. Cuentan igual.' },
        { t: 'No nombrarte nada', fx: { cordura: -6, intelecto: 8 }, flag: 'jedi_oculto',
          despido: true, mover: true, motivo: 'sin nombre y sin rumbo',
          out: 'Padawan sin maestro, jedi sin Orden. Un hueco con forma de persona.' },
        { t: 'Prometer que algún día habrá otro Templo', fx: { cordura: 10, alineamiento: 16, reputacion: 6 },
          flag: 'sueña_templo', despido: true, mover: true, motivo: 'con una idea imposible en la cabeza',
          out: 'Es una promesa absurda. Casi todas las buenas lo son.' }
      ]
    };
  });

  /* ============================================================
     RAMA CLON: obedecer tampoco es gratis
     ============================================================ */
  escena('o66_clon_1', function (g) {
    const s = g.s;
    const gen = s.relaciones.filter(function (r) { return r.tipo === 'general jedi'; })[0];
    const nombre = gen ? gen.nombre : (SW.genNombreCompleto ? SW.genNombreCompleto(g.rng, 'humano') : 'tu general');
    s.o66.general = nombre;
    return {
      id: 'o66_clon_1', gen: true,
      t: tag('LA ORDEN 66 · ' + anio(s)) +
        '<p><b>«Buena ejecución de la Orden 66.»</b> El código entra directo por el casco. No pasa por los oídos: pasa por debajo.</p>' +
        '<p>A doce metros, <b>' + U.esc(nombre) + '</b> se gira hacia ti sin entender nada. Y algo dentro de tu cabeza empieza a decir una frase ' +
        'que no has pensado tú: <i>buena ejecución, buena ejecución, buena ejecución</i>.</p>',
      c: [
        { t: 'Obedecer', req: function (st) { return !st.flags.chip_extraido; },
          sub: 'Dejar de pelear contra tu propia cabeza. Es un alivio y es lo peor que has hecho.',
          fx: { cordura: -18, alineamiento: -20, salud: -10 }, cadena: 'o66_clon_matar',
          out: 'Levantas el rifle. Las manos ya lo estaban levantando. Él desvía el primer disparo y te lo devuelve al peto.' },
        { t: 'Resistirte al chip con todo lo que tengas',
          req: function (st) { return !st.flags.chip_extraido; },
          sub: 'Agarrarte a algo tuyo y no soltarlo.', cadena: 'o66_clon_chip' },
        { t: 'Gritarle que corra', req: function (st) { return !!st.flags.chip_extraido; },
          fx: { alineamiento: 25, cordura: -10, notoriedad: 25, reputacion: -20 },
          flag: 'salvo_jedi', faccion: 'orden_jedi+40', cadena: 'o66_clon_traidor',
          out: '"¡SEÑOR, CORRA!". Se va entre los árboles sin preguntar por qué.' },
        { t: 'Disparar a los que disparan', req: function (st) { return !!st.flags.chip_extraido; },
          sub: 'Tus hermanos. Con tu cara.',
          fx: { alineamiento: 10, cordura: -28, notoriedad: 35 }, flag: 'salvo_jedi',
          cadena: 'o66_clon_traidor',
          out: 'Caen tres antes de que nadie entienda de dónde viene el fuego. Tienen tu cara. Siempre tienen tu cara.' }
      ]
    };
  });

  escena('o66_clon_chip', function (g) {
    g.retoFuerza({
      dif: U.clamp(88 - g.s.stats.cordura / 2.2 - (g.s.especie === 'clon_nulo' ? 18 : 0), 40, 92),
      sinPremio: true,
      txt: 'La orden es un patrón y el patrón quiere entrar. Lo único que puedes hacer es sostener otra cosa en la cabeza y no soltarla: ' +
           'las caras de tu escuadrón, en el orden en el que se sientan a comer.',
      critico: { t: 'Sostienes las caras. La frase se apaga sola, como una radio a la que se le acaba la carga. Y sigues siendo tú.',
        fx: { cordura: -12, alineamiento: 22, notoriedad: 20, intelecto: 6 },
        flag: 'resistio_orden66', flag2: 'chip_vencido', hito: 'Resiste a la Orden 66',
        cadena: 'o66_clon_traidor' },
      bien: { t: 'Bajas el rifle. Te tiemblan las manos, pero lo bajas.',
        fx: { cordura: -20, alineamiento: 18, notoriedad: 18 }, flag: 'resistio_orden66',
        hito: 'Resiste a la Orden 66', cadena: 'o66_clon_traidor' },
      medio: { t: 'Aguantas cuatro segundos. Cuatro segundos le dan a él tiempo de encender el sable, y nada más.',
        fx: { cordura: -28, alineamiento: -8 }, cadena: 'o66_clon_matar' },
      mal: { t: 'No puedes. Lo intentas y no puedes, y ni siquiera te acuerdas del momento en el que dejaste de intentarlo.',
        fx: { cordura: -35, alineamiento: -25 }, cadena: 'o66_clon_matar' }
    });
    return null;
  });

  escena('o66_clon_matar', function (g) {
    const s = g.s;
    const nombre = (s.o66 && s.o66.general) || 'tu general';
    return {
      id: 'o66_clon_matar', gen: true,
      t: tag('DOCE METROS') +
        '<p>Doce metros no es nada para un jedi. <b>' + U.esc(nombre) + '</b> ya tiene la hoja encendida y el primer disparo ' +
        'que le mandas vuelve y funde el visor del que tienes al lado.</p>' +
        '<p>Nadie te contó nunca cómo se mata a uno de estos. Sólo que se podía.</p>',
      c: [
        { t: 'Ir tú de frente', sub: 'A doce metros y contra un sable. Suerte.',
          combate: { dif: 88, aMuerte: true, duelo: true, general: true, matoGeneral: true },
          fx: { cordura: -10 }, cadena: 'o66_clon_despues' },
        { t: 'Coordinar a la compañía: todos a la vez, al mismo punto',
          sub: 'Un sable para de uno en uno. No para de catorce en catorce. Tú vas delante igual.',
          r: [
            { p: 0.40, t: 'Catorce rifles y un patrón cruzado. Aguanta ocho segundos. Nadie aguanta más. A ti te alcanza un rebote en el hombro.',
              fx: { cordura: -30, alineamiento: -25, reputacion: 12, intelecto: 6, salud: -22 },
              herida: { n: 'rebote de bláster en el hombro', sev: 14 },
              flag: 'ejecuto_orden66', matarRel: 'general jedi', cadena: 'o66_clon_despues' },
            { p: 0.24, t: 'Aguanta los ocho segundos y se lleva a seis por delante. Uno de ellos era tu hermano de lote, y a ti te deja el brazo colgando.',
              fx: { cordura: -38, alineamiento: -22, salud: -40 }, matarRel: 'hermano de lote',
              herida: { n: 'corte de sable en el brazo', sev: 24 },
              flag: 'ejecuto_orden66', flag2: 'o66_caro', cadena: 'o66_clon_despues' },
            { p: 0.20, t: 'No aguanta ocho segundos: se mete entre vosotros. Cuando acaba, quedáis cuatro de pie y él no está.',
              fx: { cordura: -32, salud: -38, alineamiento: -10 }, herida: { n: 'corte de sable en el pecho', sev: 26 },
              flag: 'o66_escapo_general', cadena: 'o66_clon_despues' },
            { p: 0.16, t: 'Nadie te contó que un jedi puede decidir por dónde vuelve cada disparo. Y decide.',
              muerte: true, muerteTxt: 'Muerto por su propio disparo la noche de la Orden 66.' }
          ] },
        { t: 'Pedir apoyo del blindado y esperar', sub: 'Tardan cuatro minutos. En cuatro minutos pasan muchas cosas.',
          r: [
            { p: 0.36, t: 'El cañón del blindado no negocia. Tú no disparas ni una vez, y eso no te va a servir de nada por las noches.',
              fx: { cordura: -26, alineamiento: -18, reputacion: -6 }, flag: 'ejecuto_orden66',
              matarRel: 'general jedi', cadena: 'o66_clon_despues' },
            { p: 0.40, t: 'En cuatro minutos un jedi cruza medio campamento. Se va, y antes de irse te mira a ti concretamente.',
              fx: { cordura: -18, reputacion: -14 }, flag: 'o66_escapo_general', flag2: 'jedi_te_vio',
              cadena: 'o66_clon_despues' },
            { p: 0.24, t: 'En cuatro minutos un jedi cruza medio campamento. Y pasa por encima de tu posición para hacerlo.',
              fx: { salud: -46, cordura: -20 }, herida: { n: 'corte de sable en el costado', sev: 28 },
              flag: 'o66_escapo_general', cadena: 'o66_clon_despues' }
          ] },
        { t: 'Fallar el primer disparo a propósito',
          sub: 'Contra la orden, con la orden dentro. Duele físicamente.',
          r: [
            { p: 0.34, t: 'Fallas. Nadie lo nota con el ruido. Él sí lo nota, y se va.',
              fx: { cordura: -26, alineamiento: 20, salud: -20 }, flag: 'o66_escapo_general', flag2: 'salvo_jedi',
              cadena: 'o66_clon_despues' },
            { p: 0.46, t: 'Fallas el primero. El chip te devuelve el control para el segundo.',
              fx: { cordura: -34, alineamiento: -20, salud: -14 }, flag: 'ejecuto_orden66', matarRel: 'general jedi',
              cadena: 'o66_clon_despues' },
            { p: 0.20, t: 'Fallas el primero y el sargento que tienes al lado no falla el suyo: ni contra el jedi ni, después, contra ti.',
              fx: { salud: -50, cordura: -24 }, herida: { n: 'disparo a bocajarro', sev: 26 },
              flag: 'marcado_defectuoso', cadena: 'o66_clon_despues' }
          ] }
      ]
    };
  });

  escena('o66_clon_traidor', function (g) {
    const s = g.s;
    return {
      id: 'o66_clon_traidor', gen: true,
      t: tag('EL SIGUIENTE MINUTO') +
        '<p>Has hecho lo que no estaba en la orden y en esta compañía todo el mundo lleva el mismo casco y el mismo chip.</p>' +
        '<p>Ahora mismo hay entre nueve y catorce hermanos tuyos decidiendo qué eres.</p>',
      c: [
        { t: 'Correr hacia los árboles',
          r: [
            { p: 0.6, t: 'Corres. Disparan. Los árboles hacen el resto.',
              fx: { salud: -20, cordura: -12, notoriedad: 15 }, flag: 'desertor', despido: true,
              mover: true, motivo: 'huyendo de tu propia unidad', cadena: 'o66_clon_despues' },
            { p: 0.28, t: 'Corres con un tiro en la pierna y llegas igual, porque para eso te diseñaron.',
              fx: { salud: -38, cordura: -14 }, herida: { n: 'disparo en la pierna', sev: 20 },
              flag: 'desertor', despido: true, mover: true, motivo: 'arrastrándote lejos de tu unidad',
              cadena: 'o66_clon_despues' },
            { p: 0.12, t: 'Te diseñaron a todos igual. También a los que disparan.',
              muerte: true, muerteTxt: 'Abatido por su propia compañía la noche de la Orden 66.' }
          ] },
        { t: 'Ponerte el casco y decir que has visto al jedi irse por el norte',
          sub: 'Mentir con la voz de un clon a otros clones. Nadie mira una cara idéntica a la suya.',
          r: [
            { p: 0.7, t: 'Cuela. Salen todos hacia el norte. Te quedas de guardia con el corazón a doscientas.',
              fx: { intelecto: 10, cordura: -16, carisma: 8 }, flag: 'finge_obediencia',
              cadena: 'o66_clon_despues' },
            { p: 0.3, t: 'No cuela: el sargento tiene el registro de tu rifle y ahí no hay ningún disparo.',
              fx: { salud: -26, cordura: -18, reputacion: -20 }, flag: 'marcado_defectuoso',
              flag2: 'desertor', despido: true, mover: true, motivo: 'con una orden de captura interna',
              cadena: 'o66_clon_despues' }
          ] },
        { t: 'Quedarte y aceptar lo que venga', sub: 'Reacondicionamiento, si hay suerte.',
          r: [
            { p: 0.5, t: 'Sala blanca, tres días. Sales obediente y hueco. Tardas años en volver del todo.',
              fx: { cordura: -34, intelecto: -8, alineamiento: -10 }, flag: 'reacondicionado',
              cadena: 'o66_clon_despues' },
            { p: 0.5, t: 'No hay reacondicionamiento para esto. Hay un informe de una línea.',
              muerte: true, muerteTxt: 'Ejecutado por no ejecutar la Orden 66.' }
          ] }
      ]
    };
  });

  escena('o66_clon_despues', function (g) {
    const s = g.s;
    s.flags.orden66_pasada = true;
    return {
      id: 'o66_clon_despues', gen: true,
      t: tag('AL DÍA SIGUIENTE') +
        '<p>Por la mañana la República ya no existe. Los holos hablan de un Imperio y de una conspiración jedi, ' +
        'y los oficiales que ayer llevaban insignia de la GAR llevan hoy otra sin que nadie explique cuándo se cambiaron.</p>' +
        '<p>' + (s.flags.ejecuto_orden66
          ? 'A ti no te dicen nada. Cumpliste.'
          : 'A ti te miran de una forma nueva.') + '</p>',
      c: [
        { t: 'No pensar en ello nunca más', fx: { cordura: -14, reputacion: 6, alineamiento: -8 },
          flag: 'post66_asentado', faccion: 'imperio+15',
          out: 'Funciona durante el día. Los clones envejecen deprisa y tú vas a envejecer más deprisa todavía.' },
        { t: 'Buscar a alguien que sepa sacar el chip',
          req: function (st) { return !st.flags.chip_extraido; },
          r: [
            { p: 0.42, t: 'Un médico kaminoano desertor, en una trastienda, sin anestesia suficiente. Sale.',
              fx: { salud: -22, cordura: 20, intelecto: 6, creditos: -8000 }, flag: 'chip_extraido',
              hito: 'Se hace extraer el chip inhibidor' },
            { p: 0.38, t: 'El que dice que sabe no sabe. Sales de allí con dolores de cabeza para el resto de tu vida corta.',
              fx: { salud: -26, cordura: -12, creditos: -8000 }, herida: { n: 'secuela craneal', sev: 14 } },
            { p: 0.20, t: 'Es una trampa de contrainteligencia imperial.',
              fx: { salud: -20, notoriedad: 20 }, carcel: 2 }
          ] },
        { t: 'Desertar ahora, con el caos', fx: { cordura: 10, notoriedad: 12 },
          flag: 'desertor', flag2: 'post66_asentado', despido: true, buscado: 30, evacuarA: 'cerca',
          out: 'Te quitas la armadura en un callejón. Debajo hay un hombre de treinta años con cuerpo de sesenta.' },
        { t: 'Pedir el traslado a lo más lejos que haya', fx: { cordura: 4, reputacion: -6 },
          flag: 'post66_asentado', mover: true, motivo: 'pidiendo destino en el culo de la galaxia',
          out: 'Guarnición en una roca sin nombre. Te viene bien.' }
      ]
    };
  });

  /* ============================================================
     RAMA CIVIL: la Purga vista desde abajo
     ============================================================ */
  escena('o66_civil_1', function (g) {
    const s = g.s;
    const cria = s.edadBio < 13;
    return {
      id: 'o66_civil_1', gen: true,
      t: tag('LA ORDEN 66 · ' + anio(s)) +
        '<p>Los holos se cortan a la vez en toda la galaxia. Cuando vuelven, hay un Imperio.</p>' +
        (cria ? '<p>Tienes ' + s.edad + ' años y lo ves desde abajo: los mayores no hablan, y eso da más miedo que si gritaran.</p>'
              : '<p>En la calle de abajo, tres soldados con armadura blanca sacan a alguien de un portal. ' +
                'La gente mira desde las ventanas y nadie enciende la luz.</p>'),
      c: [
        { t: 'Abrirle la puerta al que golpea a las tres de la mañana',
          sub: 'Va sin capa, sin sable y con una quemadura en el costado.',
          fx: { alineamiento: 26, cordura: -12 }, buscado: 25, flag: 'escondio_jedi',
          cadena: 'o66_civil_2',
          out: 'Se queda tres semanas en la bodega. Se va sin decir adónde y sin decir su nombre.' },
        { t: 'Llamar a la patrulla', fx: { alineamiento: -30, cordura: -18, creditos: 6000, reputacion: -10 },
          faccion: 'imperio+20', flag: 'delato_jedi', cadena: 'o66_civil_2',
          out: 'Cobras la recompensa. La cifra es más baja de lo que esperabas y aun así te la gastas rápido.' },
        { t: 'Cerrar la ventana y no mirar', fx: { cordura: -14, alineamiento: -6 },
          cadena: 'o66_civil_2', out: 'Es lo que hace casi todo el mundo. Eso no lo hace más fácil.' },
        { t: 'Grabarlo todo desde la ventana', req: function (st) { return st.stats.intelecto > 40; },
          fx: { intelecto: 8, notoriedad: 10, alineamiento: 14 }, flag: 'grabo_la_purga',
          buscado: 15, cadena: 'o66_civil_2',
          out: 'Tienes cuarenta minutos de holo que dentro de veinte años valdrán una fortuna o una condena.' }
      ]
    };
  });

  escena('o66_civil_2', function (g) {
    const s = g.s;
    const escondio = s.flags.escondio_jedi;
    return {
      id: 'o66_civil_2', gen: true,
      t: tag('PUERTA A PUERTA') +
        '<p>' + (escondio
          ? 'A la mañana siguiente registran el bloque piso por piso. Hay alguien en tu bodega.'
          : 'A la mañana siguiente registran el bloque piso por piso. Buscan simpatizantes, y simpatizante lo decide quien pregunta.') + '</p>',
      c: [
        { t: 'Abrir con cara de sueño y dejarles pasar',
          r: [
            { p: escondio ? 0.55 : 0.85, t: 'Miran por encima. Se van. Respiras cuando ya han bajado dos pisos.',
              fx: { cordura: -10 } },
            { p: escondio ? 0.45 : 0.15, t: 'Encuentran lo que hay que encontrar.',
              fx: { salud: -18, cordura: -20, creditos: -6000 }, carcel: 2, buscado: 30 }
          ] },
        { t: 'No abrir', fx: { cordura: -8, salud: -10, creditos: -3000 },
          out: 'Abren ellos. La puerta la pagas tú.' },
        { t: 'Ofrecerles algo de comer y hablarles de fútbol de vaina',
          req: function (st) { return st.stats.carisma > 45; },
          fx: { carisma: 10, cordura: -6, reputacion: 6 },
          out: 'Uno de ellos tiene veinte años y una cara idéntica a la del que registra el piso de al lado. Se van antes de mirar la bodega.' },
        { t: 'Marcharte del planeta esa misma semana',
          fx: { cordura: -6, creditos: -9000 }, mover: true, motivo: 'porque el aire se ha puesto raro',
          out: 'Mucha gente hizo lo mismo ese mes. Los puertos estuvieron llenos hasta el verano.' }
      ]
    };
  });

  /* ============================================================
     RAMA OSCURA: si ya estabas del otro lado, esto es tu noche
     ============================================================ */
  escena('o66_sith', function (g) {
    const s = g.s;
    return {
      id: 'o66_sith', gen: true,
      t: tag('LA ORDEN 66 · ' + anio(s)) +
        '<p>Llevas años esperando esto sin saber que tenía número. La orden se ejecuta sola en mil frentes a la vez ' +
        'y en ninguno hace falta que estés tú.</p><p>Alguien ha ganado. No eres tú, pero estás del lado que ha ganado.</p>',
      c: [
        { t: 'Ofrecer tus servicios a la nueva Inquisición',
          fx: { alineamiento: -20, fuerza: 12, notoriedad: 25, reputacion: -10 },
          flag: 'inquisidor', hazteInquisidor: true,
          out: 'Te miden, te prueban y te dan un número en vez de un nombre. Hermano Nueve, o el que quede libre.' },
        { t: 'Aprovechar el caos para saquear lo que queda del Templo',
          fx: { creditos: 60000, alineamiento: -18, notoriedad: 20, intelecto: 8 }, flag: 'saqueo_templo',
          out: 'Holocrones, cristales y una biblioteca entera. Los cristales sangran solos si insistes.' },
        { t: 'Desaparecer antes de que el ganador ordene la casa',
          sub: 'El Imperio no va a querer competencia con la Fuerza.',
          fx: { cordura: 10, notoriedad: -20, intelecto: 8 }, flag: 'oscuro_oculto',
          mover: true, motivo: 'antes de que barran la casa',
          out: 'Los que se quedaron a celebrarlo duraron entre dos y cuatro años.' }
      ]
    };
  });

  /* ============================================================
     LAS PRUEBAS DE CABALLERO
     Un padawan no pasa a jedi por acumular años: hay cinco pruebas
     y no todo el mundo las pasa a la primera.
     ============================================================ */
  const PRUEBAS = ['pericia', 'valor', 'carne', 'espiritu', 'perspicacia'];

  /* Repetible a propósito: si suspendes, el Consejo te dice «dentro de
     unos años» y eso es literal. Vuelve a tocar a los tres años. */
  SW.GUION.push({
    id: 'pd_pruebas', min: 12, max: 200, prio: 84, repetible: true, gen: true, c: [],
    req: function (s) {
      if (s.flags.pruebas_hechas || s.flags.orden66_pasada) return false;
      if (!SW.esPadawan(s)) return false;
      if (s.pruebasIntento != null && s.edad - s.pruebasIntento < 3) return false;
      return s.stats.fuerza >= 42 &&
        ((s.contadores.misionesJedi || 0) >= 1 || (s.añosEnTrabajo || 0) >= 3);
    },
    hazlo: function (g) {
      g.s.pruebas = { n: 0, pasadas: 0 };
      g.s.pruebasIntento = g.s.edad;
      return SW.ESCENAS.prueba_intro(g);
    }
  });

  escena('prueba_intro', function (g) {
    const m = SW.miMaestro(g);
    return {
      id: 'prueba_intro', gen: true,
      t: '<span class="momento-tag">LAS PRUEBAS DE CABALLERO</span>' +
        '<p><b>' + U.esc(m.nombre) + '</b> te ha propuesto ante el Consejo. Son cinco pruebas y se hacen seguidas, ' +
        'en el mismo día, porque parte de la prueba es que se hagan seguidas.</p>' +
        '<p class="dim">Con tres superadas te cortan la trenza. Con menos, vuelves dentro de unos años.</p>',
      c: [
        { t: 'Entrar', cadena: 'prueba_pericia' },
        { t: 'Pedir un año más', fx: { cordura: 8, fuerza: 4 }, flag: 'aplazo_pruebas',
          out: 'El Consejo lo concede sin comentarios. Tu maestro no dice nada en todo el camino de vuelta.' }
      ]
    };
  });

  escena('prueba_pericia', function (g) {
    const s = g.s;
    g.retoDuelo({
      id: 'prueba_pericia', tag: 'PRUEBA DE LA PERICIA', modo: 'duelo', sinPremio: true,
      dif: U.clamp(64 + s.stats.fuerza / 6, 55, 84),
      txt: 'Un miembro del Consejo, sin armadura, con un sable de entrenamiento que igualmente quema. No hay que ganarle: hay que durar.',
      critico: { t: 'No sólo duras: le tocas una vez. Levanta una ceja y eso, en un maestro, es una ovación.',
        fx: { destreza: 12, fuerza: 8, reputacion: 8 }, pruebaOk: true, cadena: 'prueba_valor' },
      bien: { t: 'Duras los tres minutos enteros. Es exactamente lo que se pedía.',
        fx: { destreza: 8, fuerza: 5 }, pruebaOk: true, cadena: 'prueba_valor' },
      medio: { t: 'Duras dos minutos y medio y acabas sentado en el suelo.',
        fx: { destreza: 4, cordura: -6 }, cadena: 'prueba_valor' },
      mal: { t: 'Te desarma en catorce segundos. El sable cae y hace mucho ruido en una sala tan grande.',
        fx: { cordura: -12, reputacion: -6 }, cadena: 'prueba_valor' }
    });
    return null;
  });

  escena('prueba_valor', function (g) {
    const s = g.s;
    return {
      id: 'prueba_valor', gen: true,
      t: '<span class="momento-tag">PRUEBA DEL VALOR</span>' +
        '<p>Te sueltan en un nivel abandonado de Coruscant con una misión de una línea: <i>hay un niño perdido, tráelo</i>.</p>' +
        '<p>Lo encuentras en veinte minutos. Lo que no te dijeron es que hay tres cosas más ahí abajo que también lo han encontrado.</p>',
      c: [
        { t: 'Ir de frente con la hoja encendida',
          r: [{ p: U.clamp(0.42 + s.stats.destreza / 250, 0.35, 0.8), t: 'Dos cortes y mucho ruido. El niño no suelta tu mano en todo el camino.',
                fx: { destreza: 8, fuerza: 6 }, pruebaOk: true, cadena: 'prueba_carne' },
               { p: 0.35, t: 'Sales con el crío y con un mordisco en el muslo. Cuenta igual, pero no bien.',
                fx: { salud: -20, destreza: 4 }, cadena: 'prueba_carne' }] },
        { t: 'Apagarlo todo y sacarle a oscuras',
          r: [{ p: U.clamp(0.40 + s.stats.intelecto / 220, 0.32, 0.78), t: 'Sin luz, sin ruido y sin pelea. El Consejo valora especialmente esto.',
                fx: { intelecto: 10, cordura: 6, reputacion: 6 }, pruebaOk: true, cadena: 'prueba_carne' },
               { p: 0.4, t: 'A oscuras te pierdes tú también. Salís los dos, tres horas tarde.',
                fx: { cordura: -8 }, cadena: 'prueba_carne' }] },
        { t: 'Convencerlas de que no tenéis buen sabor',
          req: function (st) { return st.sensible && st.stats.fuerza > 40; },
          r: [{ p: U.clamp(0.30 + s.stats.fuerza / 200, 0.28, 0.72), t: 'Les metes la idea de que hay algo más grande arriba. Se van solas.',
                fx: { fuerza: 12, alineamiento: 10 }, pruebaOk: true, cadena: 'prueba_carne' },
               { p: 0.45, t: 'Una de las tres no tiene la cabeza donde tú buscas.',
                fx: { salud: -24, fuerza: 4 }, cadena: 'prueba_carne' }] },
        { t: 'Volver a por refuerzos', sub: 'Sensato. Y el niño estará solo veinte minutos más.',
          fx: { cordura: -10, reputacion: -8 }, cadena: 'prueba_carne',
          out: 'Vuelves con dos caballeros. El niño está bien. El Consejo apunta algo y no dice qué.' }
      ]
    };
  });

  escena('prueba_carne', function (g) {
    const s = g.s;
    const querido = s.relaciones.filter(function (r) { return r.afecto > 55 && r.tipo !== 'maestro jedi'; })[0];
    return {
      id: 'prueba_carne', gen: true,
      t: '<span class="momento-tag">PRUEBA DE LA CARNE</span>' +
        '<p>Esta prueba no se aprueba: se paga. «Enseña algo que te duela soltar», dice el maestro que la dirige, ' +
        'y se calla durante el rato que haga falta.</p>' +
        (querido ? '<p class="dim">Piensas en ' + U.esc(querido.nombre) + ' sin querer pensar en nadie.</p>' : ''),
      c: [
        { t: 'Soltar el apego que tienes con alguien de fuera',
          req: function () { return !!querido; },
          fx: { cordura: -22, fuerza: 14, alineamiento: 6 }, pruebaOk: true,
          relCambio: querido ? { nombre: querido.nombre, afecto: -35 } : null,
          out: 'Dejas de escribir. Tardas años en saber si aquello fue disciplina o cobardía.' },
        { t: 'Soltar el brazo', sub: 'Literal. Hay prótesis buenas.',
          fx: { salud: -26, fisico: -6, fuerza: 12, destreza: -6 }, pruebaOk: true,
          cibernetica: 'brazo', hito: 'Pierde un brazo en la Prueba de la Carne',
          out: 'Es más barato que lo otro y todo el mundo en esa sala sabe que has hecho trampa.' },
        { t: 'Soltar el miedo a morir', fx: { cordura: 12, fuerza: 10, salud: -10, alineamiento: 8 },
          pruebaOk: true, flag: 'sin_miedo',
          out: 'Te sientas con ello tres horas. Cuando te levantas, algo pesa menos y algo se ha apagado.' },
        { t: 'Negarte a pagar nada', fx: { cordura: 10, reputacion: -12, alineamiento: -6 },
          flag: 'se_nego_a_la_carne',
          out: '«También es una respuesta», dice. No es la que buscaban.' }
      ].map(function (o) { o.cadena = 'prueba_espiritu'; return o; })
    };
  });

  escena('prueba_espiritu', function (g) {
    g.retoFuerza({
      dif: U.clamp(70 - g.s.stats.cordura / 4, 42, 82), sinPremio: true,
      txt: 'La cueva no tiene nada dentro. Eso es exactamente lo que la hace peligrosa: lo que sale de ella lo pones tú. ' +
           'Lo único que puedes hacer es reconocer el orden de lo que ves y no discutirlo.',
      critico: { t: 'Ves lo que temes, lo miras entero y sigue sin ser verdad. Sales antes de tiempo, andando despacio.',
        fx: { cordura: 14, fuerza: 10, alineamiento: 8 }, pruebaOk: true, cadena: 'prueba_perspicacia' },
      bien: { t: 'Ves lo que temes. Te quedas. Se va.',
        fx: { cordura: 8, fuerza: 6 }, pruebaOk: true, cadena: 'prueba_perspicacia' },
      medio: { t: 'Ves lo que temes y le contestas. Nunca hay que contestar.',
        fx: { cordura: -14, alineamiento: -6 }, cadena: 'prueba_perspicacia' },
      mal: { t: 'Sales de la cueva con algo que no entró contigo.',
        fx: { cordura: -24, alineamiento: -14, fuerza: 6 }, flag: 'sombra_pegada',
        cadena: 'prueba_perspicacia' }
    });
    return null;
  });

  escena('prueba_perspicacia', function (g) {
    return {
      id: 'prueba_perspicacia', gen: true,
      t: '<span class="momento-tag">PRUEBA DE LA PERSPICACIA</span>' +
        '<p>Última. Te enseñan un informe de una misión que salió mal: cuatro muertos, un mundo perdido y un caballero ' +
        'que hizo todo lo que el manual decía.</p><p>«¿Dónde estuvo el error?»</p>',
      c: [
        { t: '«En que hizo todo lo que el manual decía.»',
          fx: { intelecto: 14, fuerza: 6, reputacion: 8 }, pruebaOk: true, cadena: 'prueba_fin',
          out: 'Silencio largo. Luego el maestro del fondo asiente una sola vez.' },
        { t: '«En el que escribió el informe.»',
          fx: { intelecto: 8, carisma: 6 }, cadena: 'prueba_fin',
          out: 'Es ingenioso y no es la respuesta. Se nota que lo saben los dos.' },
        { t: '«En que le mandaron solo.»',
          fx: { intelecto: 6, alineamiento: 6 }, pruebaOk: true, cadena: 'prueba_fin',
          out: 'No es la respuesta que esperaban, pero no pueden decir que sea falsa.' },
        { t: '«No hubo error. A veces salen así.»',
          fx: { cordura: 8, reputacion: -6 }, cadena: 'prueba_fin',
          out: 'Un maestro te da la razón por lo bajo. Los otros tres, no.' }
      ]
    };
  });

  escena('prueba_fin', function (g) {
    const s = g.s;
    const p = (s.pruebas && s.pruebas.pasadas) || 0;
    s.flags.pruebas_hechas = true;
    s.pruebasIntento = s.edad;
    if (p >= 3) {
      return {
        id: 'prueba_fin_ok', gen: true,
        t: '<span class="momento-tag">LA TRENZA</span>' +
          '<p>' + p + ' de 5. El Consejo no felicita a nadie: simplemente, uno de ellos se levanta con un sable encendido ' +
          'y te corta la trenza de un movimiento que no ves llegar.</p>',
        c: [
          { t: 'Levantarte como Caballero Jedi', rango: 'Caballero Jedi',
            fx: { fuerza: 12, reputacion: 18, cordura: 10 }, hito: 'Caballero Jedi',
            out: 'Guardas la trenza. Todo el mundo dice que no lo hace y todo el mundo lo hace.' },
          { t: 'Levantarte y pedir de inmediato una misión lejos', rango: 'Caballero Jedi',
            fx: { fuerza: 10, reputacion: 10, destreza: 6, cordura: -4 }, hito: 'Caballero Jedi',
            out: 'Te la dan. Sales de Coruscant esa misma noche.' }
        ]
      };
    }
    return {
      id: 'prueba_fin_no', gen: true,
      t: '<span class="momento-tag">DENTRO DE UNOS AÑOS</span>' +
        '<p>' + p + ' de 5. Nadie te grita: te dicen «dentro de unos años», que en el Templo es la frase más dura que existe.</p>',
      c: [
        { t: 'Aceptarlo', fx: { cordura: -10, fuerza: 6, intelecto: 6 }, quitarFlag: 'pruebas_hechas',
          out: 'Tu maestro te espera fuera y no dice nada del asunto en dos meses.' },
        { t: 'Discutirlo delante del Consejo', fx: { carisma: 8, reputacion: -12, alineamiento: -8, fuerza: 6 },
          flag: 'discutio_al_consejo', quitarFlag: 'pruebas_hechas',
          out: 'Uno de ellos te escucha entero. Los demás ya se han levantado.' },
        { t: 'Empezar a preguntarte si la Orden tiene razón en algo',
          fx: { intelecto: 10, alineamiento: -12, cordura: -8 }, flag: 'duda_de_la_orden',
          quitarFlag: 'pruebas_hechas',
          out: 'Es una pregunta pequeña. Crecen deprisa.' }
      ]
    };
  });

  /* Contabilidad de las pruebas: cualquier nodo con pruebaOk suma. */
  SW.contarPrueba = function (g, d) {
    if (!d || !d.pruebaOk) return;
    const s = g.s;
    s.pruebas = s.pruebas || { n: 0, pasadas: 0 };
    s.pruebas.pasadas++;
  };

  /* ============================================================
     EL MAESTRO: para que «depende de tu maestro» signifique algo
     ============================================================ */
  SW.EVENTOS.push({
    id: 'pd_maestro_1', min: 10, max: 40, w: 16, unaVez: true,
    req: function (s) { return SW.esPadawan(s) && !s.flags.maestro_conocido; },
    t: 'Tu maestro te lleva por primera vez a una misión de verdad. En la lanzadera no te habla en cuatro horas. ' +
       'Cuando aterrizáis, te dice: «Aquí abajo, lo que yo diga. Arriba, en la nave, puedes decirme lo que quieras.»',
    c: [
      { t: 'Decírselo todo esa misma noche en la nave', fx: { carisma: 10, cordura: 8, fuerza: 4 },
        flag: 'maestro_conocido', maestroAfecto: 22,
        out: 'Habláis hasta el amanecer. A partir de ahí siempre hay una conversación pendiente entre vosotros.' },
      { t: 'No decir nada nunca y hacerlo todo bien', fx: { destreza: 10, fuerza: 6, cordura: -6 },
        flag: 'maestro_conocido', maestroAfecto: 6,
        out: 'Te respeta. Tardas años en saber si eso era lo que querías.' },
      { t: 'Desobedecerle abajo, en la primera curva', fx: { destreza: 8, fuerza: 8, reputacion: -8 },
        flag: 'maestro_conocido', maestroAfecto: -18,
        out: 'Sale bien, que es lo peor que podía pasar. Él no te lo perdona ni cuando tiene razón.' },
      { t: 'Preguntarle por qué te eligió a ti', fx: { cordura: 10, intelecto: 8, carisma: 6 },
        flag: 'maestro_conocido', maestroAfecto: 16,
        out: '«Porque nadie más iba a hacerlo», dice. Y luego: «Y porque te vi aguantar sin llorar algo que yo no aguanté.»' }
    ]
  });

  SW.EVENTOS.push({
    id: 'pd_maestro_2', min: 11, max: 45, w: 12,
    req: function (s) { return SW.esPadawan(s) && s.flags.maestro_conocido; },
    t: 'Tu maestro se equivoca en una misión y se equivoca delante de ti. Muere gente por ello.',
    c: [
      { t: 'Callártelo', fx: { cordura: -12, carisma: 4 }, maestroAfecto: 10,
        out: 'Él sabe que lo sabes. Eso también es una forma de estar unidos.' },
      { t: 'Decírselo a solas', fx: { carisma: 10, intelecto: 8, cordura: 6 }, maestroAfecto: 18,
        out: 'Se lo toma peor de lo que esperabas y mejor de lo que temías.' },
      { t: 'Informar al Consejo', fx: { reputacion: 10, alineamiento: 8, cordura: -10 }, maestroAfecto: -40,
        out: 'Hacen lo correcto con él. Nunca vuelve a mandarte por delante.' },
      { t: 'Usarlo cuando te convenga', fx: { intelecto: 8, alineamiento: -16, carisma: 6 },
        flag: 'chantajea_maestro', maestroAfecto: -12,
        out: 'Guardas el dato como quien guarda un cuchillo pequeño.' }
    ]
  });


  /* ============================================================
     DESPUÉS: la galaxia ya no es la misma y hay que notarlo
     ============================================================ */

  /* El Templo. Si vuelves a Coruscant siendo lo que eres, esto pasa. */
  SW.GUION.push({
    id: 'o66_templo', min: 12, max: 200, prio: 80, unaVez: true, gen: true, c: [],
    req: function (s) {
      if (!s.flags.superviviente_purga && !s.flags.inquisidor) return false;
      const m = (s.mundo || '').toLowerCase();
      return m.indexOf('coruscant') >= 0 || m.indexOf('centro imperial') >= 0;
    },
    hazlo: function (g) {
      const s = g.s;
      const inq = !!s.flags.inquisidor;
      return {
        id: 'o66_templo', gen: true,
        t: tag('EL TEMPLO') +
          '<p>Sigue ahí. Las cinco torres siguen ahí, y eso es lo que más impresiona: no lo tiraron, ' +
          'sólo lo apagaron y le cambiaron el letrero.</p>' +
          '<p>' + (inq
            ? 'Ahora entras por la puerta principal con un pase y nadie te mira dos veces. Los pasillos huelen igual.'
            : 'Hay andamios en el ala de los archivos y un cordón militar en la escalinata por la que subiste de crío.') + '</p>',
        c: [
          { t: 'Entrar a ver qué queda', sub: 'No queda nada. Vas igual.',
            r: [
              { p: inq ? 0.9 : 0.5, t: 'Los archivos están vacíos: se lo llevaron todo el primer mes. En una sala de meditación, alguien ha grabado con la punta de una hoja una lista de nombres.',
                fx: { cordura: -18, intelecto: 8, fuerza: 6 }, flag: 'vio_el_templo' },
              { p: inq ? 0.1 : 0.5, t: 'Hay sensores de la Fuerza en cada rellano. Sales por donde puedes.',
                fx: { salud: -20, cordura: -14, notoriedad: 18 }, buscado: 25 }
            ] },
          { t: 'Quedarte abajo, mirando, quince minutos',
            fx: { cordura: -10, alineamiento: 8 }, flag: 'vio_el_templo',
            out: 'Quince minutos y te vas. Es lo máximo que aguantas sin hacer algo que no puedes permitirte.' },
          { t: 'Buscar el cristal de tu sable en el mercado negro de reliquias',
            req: function (st) { return !st.sable; },
            r: [
              { p: 0.35, t: 'Está en una vitrina de un coleccionista, con una etiqueta que dice «arma ritual, procedencia desconocida». Te lo llevas.',
                fx: { creditos: -18000, fuerza: 10, cordura: 12 }, kyber: true },
              { p: 0.65, t: 'Hay cuarenta cristales en cuarenta vitrinas y ninguno es el tuyo. Todos fueron de alguien.',
                fx: { cordura: -16, creditos: -4000 } }
            ] },
          { t: 'No acercarte', fx: { cordura: 6, alineamiento: -4 },
            out: 'Das un rodeo de tres kilómetros. Es lo más sensato que has hecho en años.' }
        ]
      };
    }
  });

  /* La vida de después: dónde se mete un jedi que ya no puede ser jedi */
  SW.GUION.push({
    id: 'o66_asentarse', min: 12, max: 200, prio: 78, unaVez: true, gen: true, c: [],
    req: function (s) {
      return s.flags.superviviente_purga && !s.trabajo && !s.flags.post66_asentado &&
             !s.flags.inquisidor;
    },
    hazlo: function (g) {
      const s = g.s;
      return {
        id: 'o66_asentarse', gen: true,
        t: tag('Y AHORA QUÉ') +
          '<p>Han pasado unos meses. Nadie te ha encontrado todavía y el dinero que llevabas encima se ha acabado.</p>' +
          '<p>Sabes pilotar, sabes pelear, sabes negociar y sabes mover cosas sin tocarlas. Casi todo eso ' +
          'llama la atención, y llamar la atención es exactamente lo que no puedes hacer.</p>',
        c: [
          { t: 'Desguace y chatarra en un puerto cualquiera', sub: 'Invisible y aburrido: perfecto.',
            flag: 'post66_asentado', empleo: { id: 'chatarrero', sueldo: 9000 },
            fx: { fisico: 10, cordura: 8, notoriedad: -20, fuerza: -8 },
            out: 'Piezas, óxido y peso al kilo. Diez años así es una vida entera, y es más de lo que tuvieron los otros.' },
          { t: 'Contrabando: al menos usas lo que sabes',
            flag: 'post66_asentado', flag2: 'en_los_bajos_fondos',
            fx: { destreza: 10, creditos: 14000, alineamiento: -10, notoriedad: 12 },
            out: 'Rutas ciegas y cargas que no se preguntan. Se te da bien y eso te preocupa.' },
          { t: 'Buscar a otros supervivientes y montar algo',
            flag: 'post66_asentado', flag2: 'busca_supervivientes',
            fx: { carisma: 10, cordura: 10, alineamiento: 12, notoriedad: 18 }, buscado: 20,
            out: 'Encuentras a dos en dos años. Uno se vuelve loco. El otro dura.' },
          { t: 'Enseñar a alguien lo que sabes, en secreto',
            req: function (st) { return st.sensible && st.stats.fuerza > 35; },
            flag: 'post66_asentado', flag2: 'ensena_en_secreto',
            fx: { fuerza: 12, cordura: 12, alineamiento: 14, notoriedad: 10 },
            rel: { tipo: 'aprendiz', afecto: 60, quien: 'la cría que no debería saber nada de esto' },
            out: 'Tiene nueve años y mueve una piedra a los tres meses. Estás cometiendo un error precioso.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

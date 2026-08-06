/* ============================================================
   HOLOVIDA :: eventos atados a la época
   Ser jedi en la Alta República no se parece en nada a serlo
   durante la Purga. La guerra tampoco es la misma guerra.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  const esFuerza = function (s) { return s.sensible && s.stats.fuerza > 25; };
  const esJedi = function (s) { return s.trabajo === 'jedi' || s.estudios.indexOf('Templo Jedi') >= 0; };

  push(SW.EVENTOS, [

  /* ================= ALTA REPÚBLICA ================= */
  {
    id: 'ar_faro', min: 14, max: 200, w: 12, era: ['alta_republica'], slots: { p: 'mundo' },
    t: 'Un faro republicano en el borde de las Fronteras pide personal. Está a tres semanas de todo, cerca de {p}.',
    c: [
      { t: 'Aceptar el puesto', fx: { intelecto: 12, cordura: 10, carisma: -6, creditos: 9000 }, mover: 'cerca', motivo: 'destinado a un faro de las Fronteras', out: 'Ver naves pasar y anotarlas. Sorprendentemente, te gusta.' },
      { t: 'Ir solo a instalar el equipo y volver', fx: { intelecto: 8, destreza: 6, creditos: 14000 }, out: 'Trabajo bien pagado en el sitio más solitario que has visto.' },
      { t: 'Rechazarlo: el Borde da mala espina', fx: { cordura: 4 }, out: 'Meses después, ese faro deja de emitir.' }
    ]
  },
  {
    id: 'ar_nihil', min: 14, max: 200, w: 12, era: ['alta_republica'], slots: { p: 'mundo' },
    t: 'Asaltantes sin bandera caen sobre el convoy en el que viajas hacia {p}. No piden nada: solo rompen.',
    c: [
      { t: 'Defender el convoy', combate: { dif: 62, botin: 14000 }, fx: { alineamiento: 10 } },
      { t: 'Organizar la evacuación de los pasajeros', fx: { carisma: 14, alineamiento: 18, cordura: -6 }, out: 'Sacas a casi todos. Casi.' },
      { t: 'Esconderte en un compartimento de carga', fx: { destreza: 6, cordura: -10, alineamiento: -8 }, out: 'Sobrevives escuchándolo todo.' },
      { t: 'Ofrecerles unirte', fx: { notoriedad: 22, alineamiento: -22, creditos: 16000 }, faccion: 'nihil+25', out: 'Te miran, se ríen y te dan un arma. Ya está.' }
    ]
  },
  {
    id: 'ar_jedi_frontera', min: 12, max: 200, w: 14, era: ['alta_republica'], req: esFuerza, slots: { p: 'mundo' },
    t: 'La Orden está en su mejor momento: capas doradas, templos nuevos y misiones de expansión. Te destinan a {p}.',
    c: [
      { t: 'Mediar entre colonos y nativos', fx: { carisma: 14, alineamiento: 15, fuerza: 6, cordura: 8 }, mover: 'cerca', motivo: 'misión diplomática de la Orden', out: 'Ni tratado ni guerra: un acuerdo feo que aguanta veinte años.' },
      { t: 'Cartografiar rutas seguras', fx: { intelecto: 14, fuerza: 5, destreza: 6 }, habilidad: 'piloto', out: 'Tu ruta lleva tu nombre en las cartas durante un siglo.' },
      { t: 'Perseguir a los asaltantes hasta su nido', combate: { dif: 70, duelo: true }, fx: { alineamiento: -4 } },
      { t: 'Quedarte en el templo enseñando a los pequeños', fx: { cordura: 16, carisma: 10, fuerza: 8 }, rel: { tipo: 'aprendiz', afecto: 45 }, out: 'Nadie escribe canciones sobre esto. Deberían.' }
    ]
  },

  /* ================= REPÚBLICA TARDÍA ================= */
  {
    id: 'rt_bloqueo', min: 14, max: 200, w: 12, era: ['republica_tardia'], slots: { p: 'mundo' },
    t: 'El Gremio de Comercio bloquea {p}. Legalmente no es una guerra, así que nadie hace nada.',
    c: [
      { t: 'Romper el bloqueo con suministros', fx: { alineamiento: 18, notoriedad: 12, destreza: 8, creditos: -6000 }, out: 'Pasas comida por rutas que no salen en las cartas. Te esperan cada vez.' },
      { t: 'Vender pasajes de salida a precio de oro', fx: { creditos: 40000, alineamiento: -20, reputacion: -10 }, out: 'La desesperación tiene un precio y tú lo has fijado.' },
      { t: 'Denunciarlo en el Senado', fx: { carisma: 12, reputacion: 12, cordura: -8 }, faccion: 'republica+15', out: 'Discurso brillante. Comité formado. Nada cambia. De momento.' },
      { t: 'Trabajar para el Gremio en el bloqueo', fx: { creditos: 22000, alineamiento: -12 }, faccion: 'separatistas+15', out: 'Buen sueldo, malas noches.' }
    ]
  },
  {
    id: 'rt_padawan', min: 10, max: 30, w: 13, era: ['republica_tardia', 'alta_republica'], req: esFuerza,
    t: 'En el Templo, los maestros eligen padawan. Llevas años esperando y la edad límite se acerca.',
    c: [
      { t: 'Destacar en la práctica de sables', fx: { destreza: 12, fuerza: 8, carisma: -4 }, empleo: { id: 'jedi', sueldo: 0 }, out: 'Un maestro se fija. Trenza cortada, trenza nueva.' },
      { t: 'Destacar en los archivos', fx: { intelecto: 16, fuerza: 6 }, out: 'Acabas en el Cuerpo de Servicio Agrícola. Tampoco está tan mal.' },
      { t: 'Pedírselo directamente a un maestro', r: [
        { p: 0.45, t: 'Le sorprende tu descaro y acepta.', fx: { carisma: 12, fuerza: 8 }, empleo: { id: 'jedi', sueldo: 0 } },
        { p: 0.55, t: '"La paciencia también se aprende."', fx: { cordura: 8, fuerza: 4 } }
      ] },
      { t: 'Irte del Templo por tu cuenta', fx: { cordura: -10, destreza: 10, notoriedad: 8, alineamiento: -6 }, flag: 'perdido_de_la_orden', mover: true, motivo: 'dejando el Templo', out: 'Nadie te persigue. Eso duele más.' }
    ]
  },

  /* ================= GUERRAS CLON ================= */
  {
    id: 'gc_frente', min: 14, max: 200, w: 14, era: ['guerras_clon'], espNo: ['clon', 'clon_nulo'], slots: { p: 'mundo' },
    t: 'La guerra llega a {p}. No puedes alistarte en el Gran Ejército —eso es solo para clones— pero hay otras formas de meterse.',
    c: [
      { t: 'Ver qué opciones hay', elegirBando: true, out: '' },
      { t: 'Montar un hospital de campaña', fx: { intelecto: 12, alineamiento: 20, cordura: -8, creditos: -6000 }, habilidad: 'medico', out: 'Dos bandos, una camilla. No preguntas de qué lado vienen.' },
      { t: 'Sacar civiles del planeta', fx: { alineamiento: 22, reputacion: 12, cordura: -6 }, out: 'Cuatro viajes, tres días, ciento veinte personas.' },
      { t: 'Irte antes de que llegue el frente', fx: { suerte: 6, cordura: -6 }, mover: true, motivo: 'huyendo del frente' }
    ]
  },
  {
    id: 'gc_jedi_general', min: 16, max: 200, w: 14, era: ['guerras_clon'], req: esJedi, slots: { p: 'mundo' },
    t: 'Te han dado rango de general. Nadie te preguntó. Bajo tu mando hay dos mil hombres con la misma cara, y una campaña en {p}.',
    c: [
      { t: 'Aprenderte sus nombres uno a uno', fx: { carisma: 16, cordura: 10, alineamiento: 12, fuerza: -3 }, relTodas: 20, rel: { tipo: 'comandante clon', afecto: 60 }, out: 'Tardas meses. Ellos lo notan desde el primer día.' },
      { t: 'Mandar como se espera de un general', fx: { reputacion: 14, cordura: -10, alineamiento: -8 }, contador: { batallas: 1 }, out: 'Ganas la campaña. Firmas partes de bajas con números, no nombres.' },
      { t: 'Negarte al mando: no eres un soldado', fx: { alineamiento: 15, cordura: 8, reputacion: -16, fuerza: 8 }, faccion: 'orden_jedi-15', out: 'El Consejo lo acepta a regañadientes. Vuelves a las misiones de verdad.' },
      { t: 'Usar la Fuerza como arma sin reservas', fx: { fuerza: 16, alineamiento: -18, cordura: -12, destreza: 8 }, contador: { batallas: 1 }, out: 'Es eficaz. Es exactamente lo que te enseñaron a no hacer.' }
    ]
  },
  /* ================= IMPERIO / PURGA ================= */
  {
    id: 'im_purga', min: 12, max: 200, w: 13, era: ['imperio_temprano', 'rebelion'], req: esFuerza,
    t: 'Ser lo que eres es delito. Hay carteles con siluetas encapuchadas y una recompensa que sube cada año.',
    c: [
      { t: 'Esconder tu don del todo', fx: { fuerza: -12, cordura: 8, notoriedad: -12 }, flag: 'jedi_oculto', out: 'Trabajas de mecánico. Se te da bien. Duermes con un ojo abierto.' },
      { t: 'Buscar a otros como tú', r: [
        { p: 0.45, t: 'Encuentras una red pequeña y muy asustada.', fx: { fuerza: 10, cordura: 8, notoriedad: 10 }, rel: { tipo: 'aliado', afecto: 50 } },
        { p: 0.55, t: 'La red era un cebo del Inquisitorio.', fx: { salud: -25, notoriedad: 25, cordura: -15 }, flag: 'fichado_inquisitorio' }
      ] },
      { t: 'Usar tus poderes para ayudar aunque te delaten', fx: { alineamiento: 22, fuerza: 12, notoriedad: 25 }, out: 'Salvas a gente. Dejas un rastro que alguien está siguiendo.' },
      { t: 'Ofrecerte al Inquisitorio', fx: { alineamiento: -35, fuerza: 18, cordura: -20, notoriedad: 15 }, faccion: 'inquisitorio+35', empleo: { id: 'inquisidor', sueldo: 30000 }, out: 'Te ponen una máscara. Ya no hace falta esconderse.' }
    ]
  },
  {
    id: 'im_registro', min: 10, max: 200, w: 12, era: ['imperio_temprano', 'rebelion'], slots: { p: 'mundo' },
    t: 'Censo imperial en {p}. Toman huellas, sangre y una lista de "aptitudes especiales".',
    c: [
      { t: 'Registrarte como todo el mundo', fx: { notoriedad: -6, reputacion: 5 }, out: 'Ahora existes en un archivo. Para bien y para mal.' },
      { t: 'Falsificar tus datos', r: [
        { p: 0.6, t: 'Cuela. Existes con otro nombre.', fx: { intelecto: 8, notoriedad: 5 }, flag: 'identidad_falsa' },
        { p: 0.4, t: 'No cuela.', fx: { notoriedad: 20, creditos: -8000 }, carcel: 1 }
      ] },
      { t: 'No presentarte', fx: { notoriedad: 12, cordura: -4 }, out: 'Vives en los márgenes. Sin sanidad, sin permisos, sin rastro.' },
      { t: 'Trabajar tú en el censo', fx: { creditos: 12000, intelecto: 8, alineamiento: -12 }, faccion: 'imperio+15', out: 'Ves nombres que luego desaparecen de la lista. Y de todo lo demás.' }
    ]
  },
  {
    id: 'im_celula', min: 14, max: 200, w: 12, era: ['imperio_temprano', 'rebelion'], slots: { n: 'nombre', p: 'mundo' },
    t: '{n} te tantea en una cantina de {p}. Habla mucho de impuestos y muy poco de sí mism@.',
    c: [
      { t: 'Unirte a la célula', fx: { alineamiento: 15, notoriedad: 18, carisma: 6 }, faccion: 'rebelion+25', bando: 'rebelion', rel: { tipo: 'aliado', afecto: 45 }, out: 'Cuatro personas y una radio. Así empiezan estas cosas.' },
      { t: 'Ofrecer apoyo sin mojarte', fx: { creditos: -4000, alineamiento: 8 }, faccion: 'rebelion+10', out: 'Dinero y silencio. También hace falta.' },
      { t: 'Denunciarles', fx: { creditos: 20000, alineamiento: -25, reputacion: -15 }, faccion: 'imperio+25', flag: 'delator', out: 'Cobras. Esa cantina cierra. Nadie te vuelve a hablar en ese barrio.' },
      { t: 'Decir que no y olvidarlo', fx: { cordura: 3 }, out: 'A los dos meses lees que han cogido a cuatro personas.' }
    ]
  },

  /* ================= NUEVA REPÚBLICA ================= */
  {
    id: 'nr_reconstruir', min: 14, max: 200, w: 12, era: ['nueva_republica'], slots: { p: 'mundo' },
    t: '{p} quedó destrozado por la guerra y ahora llegan fondos de reconstrucción. Y con ellos, buitres.',
    c: [
      { t: 'Coordinar la reconstrucción de verdad', fx: { carisma: 14, reputacion: 18, intelecto: 8, creditos: 8000 }, faccion: 'nueva_republica+20', out: 'Tres años de obra. Un barrio entero lleva tu apellido mal escrito.' },
      { t: 'Quedarte con parte de los fondos', fx: { creditos: 60000, alineamiento: -22, notoriedad: 14 }, out: 'Nadie audita nada todavía. "Todavía" es la palabra clave.' },
      { t: 'Cazar a los que roban los fondos', fx: { intelecto: 12, reputacion: 14, notoriedad: 8 }, out: 'Destapas tres tramas. Te ganas dos enemigos con recursos.' },
      { t: 'Montar un negocio con el dinero que circula', fx: { creditos: 32000, carisma: 8 }, out: 'La reconstrucción también es un mercado.' }
    ]
  },
  {
    id: 'nr_orden_nueva', min: 12, max: 200, w: 11, era: ['nueva_republica'], req: esFuerza,
    t: 'Corre el rumor de que alguien está reuniendo a los sensibles a la Fuerza otra vez. Una escuela nueva, en alguna parte.',
    c: [
      { t: 'Buscarla y unirte', fx: { fuerza: 16, cordura: 12, alineamiento: 12 }, empleo: { id: 'jedi', sueldo: 0 }, mover: true, motivo: 'buscando la nueva escuela', out: 'Sois una docena. Ninguno sabe muy bien qué está haciendo. Se aprende igual.' },
      { t: 'Ofrecerte como maestro', fx: { fuerza: 10, carisma: 12, reputacion: 10 }, rel: { tipo: 'aprendiz', afecto: 45 }, out: 'Enseñas lo poco que sabes. Es más de lo que ellos tenían.' },
      { t: 'Mantenerte lejos: eso siempre acaba mal', fx: { cordura: 10, fuerza: -6 }, out: 'La historia te dará la razón. No te alegrarás.' }
    ]
  },

  /* ================= PRIMERA ORDEN ================= */
  {
    id: 'po_recluta', min: 6, max: 20, w: 12, era: ['primera_orden'], slots: { p: 'mundo' },
    t: 'Naves negras sobre {p}. No matan a nadie: se llevan a los niños. Uno de ellos podrías ser tú.',
    c: [
      { t: 'Te llevan y creces en el programa', fx: { destreza: 16, fisico: 12, cordura: -18, carisma: -10 }, faccion: 'primera_orden+30', bando: 'primera_orden', flag: 'criado_po', out: 'Te dan un número por nombre. Aprendes rápido porque no hay alternativa.' },
      { t: 'Tus padres te esconden bajo el suelo', fx: { cordura: -12, suerte: 10 }, out: 'Oyes las botas encima durante veinte minutos. Los cuentas todos.' },
      { t: 'Huir del planeta esa noche', fx: { destreza: 8, cordura: -8 }, mover: true, motivo: 'huyendo de una leva de la Primera Orden' }
    ]
  },
  {
    id: 'po_desertar', min: 16, max: 200, w: 11, era: ['primera_orden'],
    req: function (s) { return s.flags.criado_po || s.bando === 'primera_orden'; },
    t: 'Primera misión real. La orden es disparar contra una aldea. El casco te tapa la cara, así que nadie ve lo que estás pensando.',
    c: [
      { t: 'No disparar', fx: { alineamiento: 25, cordura: -10, notoriedad: 15 }, flag: 'no_disparo', out: 'Nadie lo nota en el momento. Tu sargento revisa las armas al volver.' },
      { t: 'Desertar en el mismo planeta', fx: { alineamiento: 22, notoriedad: 25, cordura: 8 }, flag: 'desertor', bando: 'resistencia', despido: true, mover: true, motivo: 'desertando de la Primera Orden', out: 'Te quitas el casco. El aire sabe distinto.' },
      { t: 'Disparar', fx: { alineamiento: -30, cordura: -25, reputacion: 10 }, faccion: 'primera_orden+20', out: 'Sigues las órdenes. Duermes con la luz encendida a partir de esa noche.' },
      { t: 'Disparar al aire y fingir', fx: { alineamiento: 12, cordura: -12, intelecto: 8 }, out: 'Sobrevives al día. Y a tu conciencia, a medias.' }
    ]
  },

  /* ================= ERA PERDIDA ================= */
  {
    id: 'ep_deriva', min: 10, max: 200, w: 14, era: ['era_perdida'], slots: { p: 'mundo', c: 'criatura' },
    t: 'Las cartas de navegación no coinciden con el cielo. En {p} nadie sabe qué año es y hay un {c} adorado como dios local.',
    c: [
      { t: 'Aceptar el sinsentido y vivir aquí', fx: { cordura: 14, suerte: 10, intelecto: -4 }, out: 'Es más fácil que discutir con el cielo.' },
      { t: 'Intentar reconstruir el calendario', fx: { intelecto: 18, cordura: -10 }, flag: 'calendario', out: 'Llegas a tres fechas posibles. Ninguna cuadra con la anterior.' },
      { t: 'Buscar una nave que sepa volver', r: [
        { p: 0.4, t: 'Encuentras un piloto que dice recordar la ruta.', fx: { creditos: -15000, suerte: 8 }, mover: true, motivo: 'siguiendo una ruta que quizá no existe' },
        { p: 0.6, t: 'El piloto mentía. Estáis más lejos que antes.', fx: { cordura: -14, intelecto: 6 }, mover: true, motivo: 'perdiéndote más' }
      ] }
    ]
  }

  ]);

  /* ---- guion: la Purga no puede depender del azar ---- */
  push(SW.GUION, [
  {
    id: 'gc_orden66_jedi', min: 22, max: 200, prio: 100, era: ['guerras_clon'], req: esJedi, unaVez: true,
    t: '<b>Los soldados que llevan meses a tu lado se giran a la vez.</b> No hay aviso. No hay motivo. Sus rifles suben.',
    c: [
      { t: 'Correr', r: [
        { p: 0.55, t: 'Sales por poco. La galaxia entera acaba de cambiar de dueño.', fx: { cordura: -25, fuerza: 10, notoriedad: 20 }, flag: 'superviviente_purga', despido: true, mover: true, motivo: 'huyendo de la Purga' },
        { p: 0.45, t: 'No corres lo suficiente.', fx: { salud: -45, cordura: -30 }, flag: 'superviviente_purga', despido: true, herida: { n: 'disparo de bláster en la espalda', sev: 22 }, mover: true, motivo: 'arrastrándote lejos de tu propia unidad' }
      ] },
      { t: 'Defenderte', combate: { dif: 78, duelo: true }, fx: { cordura: -22, alineamiento: -10 }, flag: 'superviviente_purga', despido: true },
      { t: 'Bajar el sable y preguntarles por qué', fx: { salud: -55, cordura: -20, alineamiento: 25 }, flag: 'superviviente_purga', despido: true, herida: { n: 'heridas de bláster múltiples', sev: 26 }, out: 'Tu comandante llora mientras dispara. No puede parar. Tú tampoco entiendes nada.' },
      { t: 'Enterrar el sable y desaparecer para siempre', fx: { fuerza: -20, cordura: 8, notoriedad: -15 }, flag: 'jedi_oculto', despido: true, sablePierde: true, mover: true, motivo: 'borrando tu rastro', out: 'Te cortas la trenza con un cuchillo de cocina. Empiezas de cero, sin nombre.' }
    ]
  }
  ]);

  /* ============================================================
     ACTIVIDADES NUEVAS: POLÍTICA Y EXPLORACIÓN
     ============================================================ */
  SW.ACTOS.politica = [
    {
      id: 'po_local', min: 18, max: 200, w: 12, slots: { p: 'mundo' },
      t: 'La política del sector es un mercado con mejor iluminación.',
      c: [
        { t: 'Presentarte a un cargo local', r: [
          { p: 0.45, t: 'Sales elegido por poco.', fx: { carisma: 12, reputacion: 15, creditos: 9000 }, flag: 'cargo_publico' },
          { p: 0.55, t: 'Pierdes, pero te conocen.', fx: { carisma: 8, reputacion: 6, creditos: -8000 } }
        ] },
        { t: 'Financiar a un candidato afín', fx: { creditos: -15000, reputacion: 8 }, faccion: 'auto+12', out: 'Gana. Te coge el comunicador a la primera durante años.' },
        { t: 'Filtrar los trapos sucios de todos', fx: { intelecto: 10, notoriedad: 15, reputacion: -8, creditos: 14000 }, out: 'Dimiten cuatro. Entran otros cuatro iguales.' },
        { t: 'Organizar a los vecinos al margen de todo', fx: { carisma: 14, cordura: 10, alineamiento: 12 }, out: 'Arregláis una calle. Es más de lo que consiguió el comité.' }
      ]
    },
    {
      id: 'po_senado', min: 24, max: 200, w: 10, req: function (s) { return s.stats.reputacion > 45 || s.flags.cargo_publico; },
      slots: { f: 'faccion', p: 'mundo' },
      t: 'Se vota una ley que decide el futuro de {p}. {f} presiona fuerte y tu voto cuenta.',
      c: [
        { t: 'Votar en conciencia', fx: { alineamiento: 15, cordura: 10, reputacion: 8 }, faccion: 'auto-15', out: 'Pierdes apoyos y ganas algo que no cotiza.' },
        { t: 'Votar lo que te conviene', fx: { creditos: 45000, alineamiento: -18, reputacion: -6 }, faccion: 'auto+20', out: 'La cuenta sube. El espejo también habla.' },
        { t: 'Negociar enmiendas hasta que sirva de algo', fx: { intelecto: 14, carisma: 14, reputacion: 12 }, out: 'La ley sale peor de lo que querías y mejor de lo que iba a salir.' },
        { t: 'Bloquearla con un discurso de nueve horas', fx: { carisma: 18, salud: -6, reputacion: 14, notoriedad: 10 }, out: 'Se retransmite en toda la galaxia. Tu garganta no lo perdona.' }
      ]
    },
    {
      id: 'po_corrupcion', min: 22, max: 200, w: 10, slots: { n: 'nombre' },
      t: '{n} te ofrece un sobre. Ni siquiera intenta disimular.',
      c: [
        { t: 'Cogerlo', fx: { creditos: 35000, alineamiento: -18, notoriedad: 10 }, flag: 'sobre_cobrado', out: 'Es más fácil la segunda vez.' },
        { t: 'Rechazarlo y grabarlo todo', fx: { intelecto: 10, reputacion: 16, notoriedad: 8 }, flag: 'material_chantaje', out: 'Tienes un arma. Decide luego si la usas.' },
        { t: 'Rechazarlo y olvidarlo', fx: { alineamiento: 12, cordura: 6 }, out: 'Duermes bien. Sigues siendo pobre.' }
      ]
    }
  ];

  SW.ACTOS.exploracion = [
    {
      id: 'ex_ruinas', min: 14, max: 200, w: 12, slots: { p: 'mundo', c: 'criatura' },
      t: 'Ruinas sin catalogar en {p}. Los sensores dan lecturas que no deberían existir.',
      c: [
        { t: 'Entrar despacio y documentarlo todo', r: [
          { p: 0.5, t: 'Un hallazgo que cambia tres teorías.', fx: { intelecto: 18, reputacion: 14, creditos: 22000 }, item: true },
          { p: 0.5, t: 'Está vacío. Pero el techo cede.', fx: { salud: -16, intelecto: 8 } }
        ] },
        { t: 'Ir directo a la cámara central', r: [
          { p: 0.35, t: 'Reliquia intacta. Vale una fortuna.', fx: { creditos: 65000, fuerza: 8, notoriedad: 10 }, item: true },
          { p: 0.35, t: 'Trampa milenaria, todavía en servicio.', fx: { salud: -28, destreza: 8 } },
          { p: 0.3, t: 'Algo lleva mucho tiempo esperando ahí.', combate: { dif: 72 } }
        ] },
        { t: 'Sellarlo y vender el mapa', fx: { creditos: 18000, intelecto: 6 }, out: 'Que se maten otros por entrar.' },
        { t: 'Avisar a las autoridades', fx: { reputacion: 12, alineamiento: 10, creditos: 4000 }, out: 'Lo protegen. Sale tu nombre en una placa pequeña.' }
      ]
    },
    {
      id: 'ex_ruta', min: 14, max: 200, w: 11, req: function (s) { return !!s.nave; }, slots: { p: 'mundo' },
      t: 'Hay un salto sin cartografiar que ahorraría dos días hasta {p}. También podría no tener salida.',
      c: [
        { t: 'Probarlo', r: [
          { p: 0.5, t: 'Funciona. Es tuyo y vale dinero.', fx: { creditos: 30000, intelecto: 12, reputacion: 10 }, habilidad: 'piloto', mueveA: '{p}', motivo: 'estrenando tu propia ruta' },
          { p: 0.3, t: 'Sales en un sistema que no está en ninguna carta.', fx: { intelecto: 10, cordura: -8, suerte: 8 }, mover: true, motivo: 'saliendo donde no debías' },
          { p: 0.2, t: 'Campo gravitatorio. Casi no lo cuentas.', fx: { salud: -22 }, naveEstado: -40 }
        ] },
        { t: 'Vender la corazonada a un cartógrafo', fx: { creditos: 12000, carisma: 5 }, out: 'Cobras poco y sin riesgo.' },
        { t: 'Ir por la ruta larga como todo el mundo', fx: { cordura: 4, creditos: -1500 }, mueveA: '{p}', motivo: 'por la ruta de siempre' }
      ]
    },
    {
      id: 'ex_primer_contacto', min: 16, max: 200, w: 9, slots: { p: 'mundo' },
      t: 'En {p} hay un asentamiento de una especie que no aparece en ningún registro. Te han visto llegar.',
      c: [
        { t: 'Bajar desarmado y con las manos visibles', fx: { carisma: 16, alineamiento: 18, cordura: 10, intelecto: 8 }, idioma: 'una lengua sin nombre', out: 'Tardáis meses en entenderos. Merece cada minuto.' },
        { t: 'Observar desde lejos y no interferir', fx: { intelecto: 14, cordura: 8 }, out: 'Anotas costumbres, ciclos y una canción que no olvidarás.' },
        { t: 'Registrar el mundo a tu nombre', fx: { creditos: 55000, alineamiento: -25, reputacion: -12, notoriedad: 12 }, out: 'Legalmente impecable. Moralmente, ya sabes.' },
        { t: 'Avisar a una corporación minera', fx: { creditos: 80000, alineamiento: -35, notoriedad: 15 }, out: 'Cobras muchísimo. Ese mundo deja de existir tal como era.' }
      ]
    }
  ];

})(window);

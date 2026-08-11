/* ============================================================
   HOLOVIDA :: segundo bloque de eventos por actividad
   Más opciones en cada vía y generadores nuevos.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  /* ---------------- TRABAJO ---------------- */
  push(SW.ACTOS.trabajo, [
    {
      id: 't2_huelga', min: 16, max: 200, w: 8, req: function (s) { return !!s.trabajo; },
      t: 'El turno entero habla de parar. Faltan manos y sobran horas.',
      c: [
        { t: 'Liderar la huelga', fx: { carisma: 16, reputacion: 10, creditos: -4000, notoriedad: 10 }, rendimiento: -20, flag: 'sindicalista', out: 'Once días. Ganáis dos cosas de cinco. Cuenta como victoria.' },
        { t: 'Secundarla en silencio', fx: { carisma: 5, creditos: -2000 }, rendimiento: -8, out: 'No destacas. No traicionas.' },
        { t: 'Seguir trabajando', fx: { creditos: 6000, reputacion: -10 }, rendimiento: 15, out: 'Te llaman esquirol durante años.' },
        { t: 'Informar a la dirección de quién la organiza', fx: { creditos: 12000, alineamiento: -20 }, rendimiento: 25, flag: 'delator', out: 'Ascenso rápido. Comedor vacío a tu alrededor.' }
      ]
    },
    {
      id: 't2_traslado', min: 18, max: 200, w: 8, req: function (s) { return !!s.trabajo; }, slots: { p: 'mundo' },
      t: 'Te ofrecen un puesto mejor en {p}. Habría que mudarse.',
      c: [
        { t: 'Aceptar y mudarte', fx: { creditos: 6000, cordura: -6 }, aumento: 0.3, mueveA: '{p}', motivo: 'por un traslado laboral', out: 'Casa nueva, cielo nuevo, mismo trabajo con más ceros.' },
        { t: 'Aceptar y viajar cada semana', fx: { creditos: 4000, salud: -8, cordura: -10 }, aumento: 0.25, out: 'Vives en naves de línea. Conoces a todos los auxiliares por su nombre.' },
        { t: 'Rechazarlo por los tuyos', fx: { cordura: 12 }, relTodas: 15, out: 'Nadie te lo pide. Todos lo notan.' }
      ]
    },
    {
      id: 't2_error', min: 16, max: 200, w: 8, req: function (s) { return !!s.trabajo; },
      t: 'Cometes un error que cuesta mucho dinero. Todavía no lo sabe nadie.',
      c: [
        { t: 'Reconocerlo de inmediato', fx: { reputacion: 8, cordura: 8, creditos: -6000 }, rendimiento: -10, out: 'Bronca enorme y respeto a largo plazo.' },
        { t: 'Arreglarlo tú antes de que se note', r: [
          { p: 0.55, t: 'Lo tapas del todo. Nadie se entera nunca.', fx: { intelecto: 12, cordura: -6 } },
          { p: 0.45, t: 'Al taparlo lo empeoras.', fx: { creditos: -12000, reputacion: -12 }, rendimiento: -25 }
        ] },
        { t: 'Echárselo a otro', fx: { alineamiento: -20, reputacion: 4 }, rendimiento: 5, rel: { tipo: 'rival', afecto: -50 }, out: 'Cuela. Despiden a quien no fue.' }
      ]
    },
    {
      id: 't2_jubilacion', min: 55, max: 200, w: 8, req: function (s) { return !!s.trabajo && s.añosEnTrabajo > 5; },
      t: 'Te ofrecen prejubilación. Menos dinero, todo el tiempo del mundo.',
      c: [
        { t: 'Aceptar', fx: { cordura: 18, creditos: 20000 }, despido: true, out: 'El primer lunes libre te sientes raro. El segundo, no.' },
        { t: 'Seguir hasta el final', fx: { creditos: 'sueldo*1', salud: -6, cordura: -4 }, out: 'Trabajas hasta que no puedas. Es una postura respetable.' },
        { t: 'Cambiar a media jornada', fx: { cordura: 12, creditos: 'sueldo*0.4' }, aumento: -0.4, out: 'El punto medio. Funciona.' }
      ]
    }
  ]);

  /* ---------------- FORMACIÓN ---------------- */
  push(SW.ACTOS.formacion, [
    {
      id: 'f2_oficio', min: 12, max: 200, w: 9,
      t: 'Puedes dedicar el año a aprender un oficio concreto, de los que dan de comer.',
      c: [
        { t: 'Armería', fx: { intelecto: 10, destreza: 8, creditos: -4000 }, habilidad: 'armero', out: 'Montas y desmontas con los ojos cerrados.' },
        { t: 'Medicina de urgencia', fx: { intelecto: 12, creditos: -6000 }, habilidad: 'medico', out: 'Sabes qué hacer los tres primeros minutos. Casi todo se decide ahí.' },
        { t: 'Rastreo y supervivencia', fx: { fisico: 10, intelecto: 6, destreza: 6 }, habilidad: 'rastreador', out: 'Puedes vivir tres semanas con lo que llevas encima.' },
        { t: 'Negociación dura', fx: { carisma: 14, intelecto: 6, creditos: -5000 }, habilidad: 'negociador', out: 'Aprendes a callarte en el momento exacto.' },
        { t: 'Falsificación de documentos', fx: { intelecto: 12, notoriedad: 8, creditos: -3000 }, habilidad: 'falsificador', out: 'Papeles impecables. Demasiado impecables, dice tu maestro.' }
      ]
    },
    {
      id: 'f2_gimnasio', min: 12, max: 200, w: 10,
      t: 'Un año dedicado al cuerpo cambia bastante las cosas.',
      c: [
        { t: 'Fuerza bruta', fx: { fisico: 14, salud: 5, destreza: -2 }, out: 'Levantas cosas que antes no. Corres peor.' },
        { t: 'Resistencia y fondo', fx: { fisico: 10, salud: 10, cordura: 5 }, out: 'Puedes andar todo el día. Sirve más de lo que parece.' },
        { t: 'Agilidad y reflejos', fx: { destreza: 14, fisico: 5 }, out: 'Coges las cosas al vuelo sin pensarlo.' },
        { t: 'Artes marciales de tu pueblo', fx: { destreza: 10, fisico: 8, cordura: 6 }, habilidad: 'luchador', out: 'Disciplina, golpes y una forma de respirar.' }
      ]
    },
    {
      id: 'f2_mentor_busca', min: 14, max: 200, w: 8, slots: { p: 'mundo', n: 'nombre' },
      t: 'Dicen que en {p} vive {n}, que fue el mejor en lo tuyo antes de desaparecer.',
      c: [
        { t: 'Ir a buscarle', r: [
          { p: 0.5, t: 'Está viv@ y accede a enseñarte, a su manera insoportable.', fx: { intelecto: 12, destreza: 10, cordura: -6 }, rel: { tipo: 'mentor', afecto: 40 }, mueveA: '{p}', motivo: 'buscando un maestro' },
          { p: 0.3, t: 'Murió hace años. Su viuda te da sus cuadernos.', fx: { intelecto: 16 }, item: true, mueveA: '{p}', motivo: 'buscando a alguien que ya no está' },
          { p: 0.2, t: 'Es un fraude que vive de la leyenda.', fx: { intelecto: 6, creditos: -6000, carisma: 5 }, mueveA: '{p}', motivo: 'persiguiendo un rumor' }
        ] },
        { t: 'Escribirle en vez de ir', fx: { intelecto: 6, cordura: 3 }, out: 'Contesta una carta de dos líneas: "Ven o no preguntes".' },
        { t: 'Aprender por tu cuenta, como siempre', fx: { intelecto: 8, cordura: 5 }, out: 'Más lento, más tuyo.' }
      ]
    }
  ]);

  /* ---------------- SOCIAL ---------------- */
  push(SW.ACTOS.social, [
    {
      id: 's2_fiesta', min: 16, max: 200, w: 9, slots: { l: 'lugar', p: 'mundo' },
      t: 'Fiesta grande en {l}, {p}. Va a estar todo el mundo que importa y todo el que no.',
      c: [
        { t: 'Ir a hacer contactos', fx: { carisma: 10, creditos: -2000 }, nuevaRel: true, out: 'Sales con tres nombres útiles apuntados.' },
        { t: 'Ir a pasarlo bien y ya', fx: { cordura: 14, salud: -4, creditos: -1500 }, out: 'No recuerdas la última hora. Recuerdas que fue buena.' },
        { t: 'Ir a buscar a alguien concreto', fx: { carisma: 8, cordura: 6 }, rel: { tipo: 'pareja', afecto: 45 }, out: 'Estaba. Habláis hasta que se va la música.' },
        { t: 'Quedarte en casa', fx: { cordura: 8, intelecto: 6, carisma: -3 }, out: 'La mejor decisión que nadie celebrará.' }
      ]
    },
    {
      id: 's2_deuda_amistad', min: 18, max: 200, w: 8,
      req: function (s) { return s.relaciones.some(function (r) { return r.afecto > 50; }); },
      t: 'Alguien a quien quieres te pide dinero. Bastante. Otra vez.',
      c: [
        { t: 'Dárselo sin condiciones', fx: { creditos: -18000, alineamiento: 10 }, relTodas: 12, out: 'No vuelve. La amistad sí.' },
        { t: 'Dárselo con un plan de devolución', fx: { creditos: -12000, intelecto: 6, carisma: 8 }, out: 'Cumple a medias. Sois adultos.' },
        { t: 'Negarte y explicar por qué', fx: { carisma: 10, cordura: -6 }, relTodas: -15, out: 'Lo entiende. No del todo.' },
        { t: 'Ofrecerle trabajo en vez de dinero', fx: { carisma: 12, creditos: -5000 }, rel: { tipo: 'socio', afecto: 40 }, out: 'Resulta que es muy bueno en algo que nadie sabía.' }
      ]
    },
    {
      id: 's2_adopcion', min: 25, max: 200, w: 7, slots: { n: 'nombre', p: 'mundo' },
      t: 'Un crío sin nadie se te pega en {p}. Nadie viene a buscarlo.',
      c: [
        { t: 'Quedártelo', fx: { cordura: 16, creditos: -9000, alineamiento: 20 }, hijo: true, out: 'No sabes nada de criar a nadie. Aprendes deprisa.' },
        { t: 'Buscarle una familia buena', fx: { alineamiento: 15, carisma: 8, cordura: 6 }, out: 'Tardas meses. Al final aparece la gente adecuada.' },
        { t: 'Darle dinero y seguir', fx: { creditos: -1500, cordura: -10 }, out: 'Piensas en ese crío cada cierto tiempo, siempre a deshora.' },
        { t: 'Enseñarle un oficio y soltarle', fx: { carisma: 10, alineamiento: 12 }, rel: { tipo: 'aprendiz', afecto: 45 }, out: 'A los cinco años ya se defiende solo.' }
      ]
    }
  ]);

  /* ---------------- BAJOS FONDOS ---------------- */
  push(SW.ACTOS.crimen, [
    {
      id: 'c2_proteccion', min: 16, max: 200, w: 9, slots: { l: 'lugar' },
      t: 'Los comercios de {l} pagan "protección" a alguien. Ese alguien podrías ser tú.',
      c: [
        { t: 'Montar tu propia red', fx: { creditos: 30000, alineamiento: -22, notoriedad: 20, carisma: 8 }, flag: 'jefe_barrio', out: 'Cobras cada mes. Y proteges de verdad, que es lo raro.' },
        { t: 'Echar a los que cobran ahora', combate: { dif: 58, botin: 15000 }, fx: { alineamiento: 12, reputacion: 12 } },
        { t: 'Avisar a las autoridades', fx: { reputacion: 10, notoriedad: 12, alineamiento: 12 }, out: 'Detienen a tres. Vuelven en seis meses.' },
        { t: 'No meterte', fx: {}, out: 'Los comercios siguen pagando.' }
      ]
    },
    {
      id: 'c2_fuga', min: 16, max: 200, w: 8, req: function (s) { return s.stats.notoriedad > 30; }, slots: { n: 'nombre' },
      t: '{n} está en un centro de detención y su gente pagaría mucho por sacarle.',
      c: [
        { t: 'Planificar la fuga con calma', r: [
          { p: 0.55, t: 'Sale limpio. Cobras muchísimo.', fx: { creditos: 70000, intelecto: 14, notoriedad: 20 } },
          { p: 0.45, t: 'Un guardia no estaba comprado.', fx: { salud: -25, creditos: -8000, notoriedad: 20 }, carcel: 2 }
        ] },
        { t: 'Entrar por la fuerza', combate: { dif: 68, botin: 50000 }, fx: { notoriedad: 25, alineamiento: -8 } },
        { t: 'Sobornar a un juez', fx: { creditos: -25000 }, r: [
          { p: 0.6, t: 'Sale por la puerta principal en un mes.', fx: { creditos: 60000, carisma: 10, notoriedad: 10 } },
          { p: 0.4, t: 'El juez se queda el dinero y no hace nada.', fx: { cordura: -10, notoriedad: 8 } }
        ] },
        { t: 'Rechazarlo', fx: {}, out: '{n} cumple condena entera. Se acuerda de ti.' }
      ]
    },
    {
      id: 'c2_traicion_carte', min: 18, max: 200, w: 8, req: function (s) { return (s.faccionRep.hutt || 0) > 20 || s.stats.notoriedad > 45; },
      t: 'El cártel para el que trabajas está a punto de caer. Tienes información y una ventana pequeña.',
      c: [
        { t: 'Venderla a la competencia', fx: { creditos: 65000, notoriedad: 25, alineamiento: -18 }, faccion: 'hutt-40', flag: 'enemigo_hutt', out: 'Cobras. Y ahora hay una lista con tu nombre arriba.' },
        { t: 'Avisar a tu jefe y ganar puntos', fx: { creditos: 20000, notoriedad: 10 }, faccion: 'hutt+30', out: 'Sobrevive el cártel. Y tú dentro de él.' },
        { t: 'Salir del negocio ahora mismo', fx: { cordura: 14, notoriedad: -18, creditos: -8000 }, mover: true, motivo: 'saliendo del negocio antes de la redada', out: 'Desapareces bien. Es un arte.' },
        { t: 'Quedarte quieto', fx: { cordura: -8 }, r: [
          { p: 0.5, t: 'La redada no te toca.', fx: { suerte: 6 } },
          { p: 0.5, t: 'La redada te toca de lleno.', fx: { creditos: -20000 }, carcel: 3 }
        ] }
      ]
    }
  ]);

  /* ---------------- HANGAR ---------------- */
  push(SW.ACTOS.nave, [
    {
      id: 'n2_tripulacion', min: 18, max: 200, w: 9, req: function (s) { return !!s.nave; },
      t: 'Volar sol@ tiene un límite. Hay gente buscando plaza en el puerto.',
      c: [
        { t: 'Contratar a un copiloto veterano', fx: { creditos: -8000, destreza: 6 }, rel: { tipo: 'tripulante', afecto: 40 }, out: 'Sabe más que tú y lo dice a menudo.' },
        { t: 'Contratar a un mecánico joven', fx: { creditos: -5000, intelecto: 5 }, naveEstado: 20, rel: { tipo: 'tripulante', afecto: 45 }, out: 'La nave nunca ha sonado tan bien.' },
        { t: 'Recoger a quien no tiene adónde ir', fx: { alineamiento: 15, cordura: 10 }, rel: { tipo: 'tripulante', afecto: 55 }, out: 'No sabe hacer nada. Aprende todo.' },
        { t: 'Seguir volando solo', fx: { cordura: -5, destreza: 5 }, out: 'Tú, la nave y mucho silencio.' }
      ]
    },
    {
      id: 'n2_carrera', min: 16, max: 200, w: 9, req: function (s) { return !!s.nave; }, slots: { p: 'mundo' },
      t: 'Carrera ilegal de cargueros en la órbita de {p}. Bolsa: 40.000 créditos.',
      c: [
        { t: 'Correr a fondo', r: [
          { p: 0.4, t: 'Ganas por medio casco.', fx: { creditos: 40000, destreza: 10, reputacion: 8 }, habilidad: 'piloto' },
          { p: 0.35, t: 'Segundo puesto. Cobras algo.', fx: { creditos: 8000, destreza: 6 } },
          { p: 0.25, t: 'Chocas contra un satélite muerto.', fx: { salud: -20 }, naveEstado: -45 }
        ] },
        { t: 'Amañarla desde dentro', fx: { creditos: 25000, alineamiento: -15, notoriedad: 12 }, out: 'Un cable suelto en la nave favorita. Nadie lo sabrá.' },
        { t: 'Apostar en vez de correr', r: [
          { p: 0.45, t: 'Aciertas al tapado.', fx: { creditos: 18000, suerte: 6 } },
          { p: 0.55, t: 'Pierdes.', fx: { creditos: -9000 } }
        ] },
        { t: 'Mirar desde las gradas', fx: { cordura: 5 }, out: 'Es un espectáculo precioso y muy peligroso.' }
      ]
    },
    {
      id: 'n2_señal', min: 16, max: 200, w: 8, req: function (s) { return !!s.nave; }, slots: { p: 'mundo' },
      t: 'Señal de socorro cerca de {p}. Nadie más la ha contestado.',
      c: [
        { t: 'Acudir', r: [
          { p: 0.45, t: 'Una familia con el hipermotor muerto. Te lo agradecen con lo poco que tienen.', fx: { alineamiento: 20, cordura: 12, creditos: 3000 }, rel: { tipo: 'contacto', afecto: 45 } },
          { p: 0.3, t: 'Nave vacía. Y con carga.', fx: { creditos: 28000, cordura: -6 }, item: true },
          { p: 0.25, t: 'Es una emboscada de corsarios.', dogfight: { dif: 60 } }
        ] },
        { t: 'Retransmitirla y seguir', fx: { alineamiento: 5 }, out: 'Alguien la cogerá. Probablemente.' },
        { t: 'Ignorarla', fx: { alineamiento: -12, cordura: -6 }, out: 'Sigue sonando en tu cabeza tres días.' }
      ]
    }
  ]);

  /* ---------------- VIAJE ---------------- */
  push(SW.ACTOS.viaje, [
    {
      id: 'v2_polizon', min: 12, max: 200, w: 9, req: function (s) { return !s.nave && s.stats.creditos < 5000; },
      t: 'Sin nave y sin dinero, pero hay cargueros que salen esta noche.',
      c: [
        { t: 'Colarte en la bodega', r: [
          { p: 0.55, t: 'Sales del sistema sin que nadie te vea.', fx: { destreza: 8, salud: -5 }, mover: true, motivo: 'de polizón en una bodega' },
          { p: 0.45, t: 'Te descubren a mitad de trayecto.', fx: { salud: -10, cordura: -6, reputacion: -5 }, mover: true, motivo: 'echado en el primer puerto' }
        ] },
        { t: 'Ofrecerte a trabajar el pasaje', fx: { fisico: 6, creditos: 400, cordura: -4 }, mover: true, motivo: 'trabajando el pasaje' },
        { t: 'Vender algo tuyo para pagar el billete', fx: { creditos: -500 }, viajar: true },
        { t: 'Quedarte donde estás', fx: { cordura: 3 } }
      ]
    },
    {
      id: 'v2_perdido', min: 14, max: 200, w: 8, slots: { p: 'mundo' },
      t: 'El transporte hace escala forzosa en {p} y se queda ahí tres semanas.',
      c: [
        { t: 'Aprovechar y conocer el sitio', fx: { intelecto: 8, cordura: 10, carisma: 6 }, mueveA: '{p}', motivo: 'por una escala forzosa', out: 'Acabas conociendo el sitio mejor que tu propio barrio.' },
        { t: 'Buscar trabajo temporal', fx: { creditos: 5000, fisico: 4 }, mueveA: '{p}', motivo: 'varado por una avería' },
        { t: 'Pagar otro pasaje y salir corriendo', fx: { creditos: -9000 }, viajar: true },
        { t: 'Esperar sin moverte del hangar', fx: { cordura: -8, intelecto: 4 }, mueveA: '{p}', motivo: 'esperando en un hangar' }
      ]
    }
  ]);

  /* ---------------- MERCADO ---------------- */
  push(SW.ACTOS.mercado, [
    {
      id: 'm2_subasta', min: 16, max: 200, w: 9, slots: { o: 'objeto', l: 'lugar' },
      t: 'Subasta en {l}. La pieza estrella es un {o} con una historia detrás.',
      c: [
        { t: 'Pujar hasta el final', r: [
          { p: 0.45, t: 'Es tuyo. Te has pasado de presupuesto.', fx: { creditos: -30000, reputacion: 8 }, item: true },
          { p: 0.55, t: 'Alguien con más dinero se lo lleva.', fx: { creditos: -1000, carisma: 4 } }
        ] },
        { t: 'Vender algo tuyo en la subasta', vender: true, fx: { carisma: 5 } },
        { t: 'Robarlo durante la puja', r: [
          { p: 0.35, t: 'Cambiazo perfecto.', fx: { notoriedad: 18, destreza: 10, alineamiento: -18 }, item: true },
          { p: 0.65, t: 'La seguridad de una subasta no es la de una tienda.', fx: { salud: -18, notoriedad: 20 }, carcel: 1 }
        ] },
        { t: 'Solo mirar y aprender precios', fx: { intelecto: 8, carisma: 4 }, out: 'Ahora sabes lo que vale de verdad lo que llevas encima.' }
      ]
    },
    {
      id: 'm2_prestamista', min: 16, max: 200, w: 8, req: function (s) { return s.stats.creditos < 3000; }, slots: { n: 'nombre' },
      t: '{n} presta dinero rápido, sin preguntas y con un interés que nadie escribe.',
      c: [
        { t: 'Pedir 20.000', fx: { creditos: 20000, notoriedad: 8 }, flag: 'debe_prestamista', out: 'Tienes dinero. Y una fecha.' },
        { t: 'Pedir solo lo justo', fx: { creditos: 6000, notoriedad: 4 }, flag: 'debe_prestamista', out: 'Menos agujero, menos problema.' },
        { t: 'Trabajar para {n} en vez de pedir', fx: { creditos: 9000, alineamiento: -8, notoriedad: 10 }, out: 'Cobras deudas a otros. Ironías.' },
        { t: 'Salir de ahí', fx: { cordura: 5 }, out: 'Pasarás hambre, pero no tendrás fecha límite.' }
      ]
    }
  ]);

  /* ---------------- ACCIÓN ---------------- */
  push(SW.ACTOS.accion, [
    {
      id: 'a2_torneo', min: 16, max: 200, w: 9, slots: { p: 'mundo' },
      t: 'Torneo abierto en {p}. Cuatro rondas, un premio gordo y muchos huesos rotos.',
      c: [
        { t: 'Inscribirte', combate: { dif: 66, botin: 32000, duelo: true }, fx: { reputacion: 6 } },
        { t: 'Inscribirte con nombre falso', combate: { dif: 66, botin: 32000, duelo: true }, fx: { notoriedad: -5 }, out: 'Si pierdes, no lo sabrá nadie.' },
        { t: 'Entrenar a otro competidor', fx: { carisma: 10, creditos: 9000, intelecto: 6 }, out: 'Llega a semifinales. Te llevas tu parte.' },
        { t: 'Apostar por el favorito', r: [
          { p: 0.55, t: 'Gana. Beneficio modesto.', fx: { creditos: 6000 } },
          { p: 0.45, t: 'Pierde en la primera ronda.', fx: { creditos: -7000 } }
        ] }
      ]
    },
    {
      id: 'a2_persecucion', min: 14, max: 200, w: 9, slots: { l: 'lugar', p: 'mundo' },
      t: 'Te persiguen por {l} en {p}. Son cuatro y conocen las calles mejor que tú.',
      c: [
        { t: 'Correr por los tejados', r: [
          { p: 0.5, t: 'Los pierdes en tres manzanas.', fx: { destreza: 10, fisico: 6 } },
          { p: 0.5, t: 'Un salto sale mal.', fx: { salud: -20, destreza: 6 }, herida: { n: 'tobillo destrozado', sev: 14 } }
        ] },
        { t: 'Meterte en la multitud', r: [
          { p: 0.6, t: 'Desapareces entre la gente.', fx: { intelecto: 8, carisma: 4 } },
          { p: 0.4, t: 'Te ven. Y ahora hay testigos.', fx: { salud: -12, notoriedad: 10 } }
        ] },
        { t: 'Dejar de correr y plantarte', combate: { dif: 55 } },
        { t: 'Meterte en un local y pedir ayuda', fx: { carisma: 8, creditos: -1500 }, rel: { tipo: 'contacto', afecto: 35 }, out: 'El dueño baja la persiana sin preguntar. Le deberás una siempre.' }
      ]
    }
  ]);

  /* ---------------- SALUD ---------------- */
  push(SW.ACTOS.salud, [
    {
      id: 'sa2_clinica', min: 8, max: 200, w: 14,
      t: 'La clínica del puerto atiende sin cita si tienes con qué pagar.',
      c: [{ t: 'Entrar a la clínica', clinica: true }, { t: 'Otro día', fx: { cordura: 2 } }]
    },
    {
      id: 'sa2_descanso', min: 10, max: 200, w: 10,
      t: 'Podrías parar. De verdad parar, un año entero.',
      c: [
        { t: 'Un año sabático', fx: { cordura: 22, salud: 12, creditos: -12000, reputacion: -5 }, out: 'Duermes, andas, no haces nada útil. Vuelves entero.' },
        { t: 'Retiro en un templo', fx: { cordura: 25, fuerza: 8, creditos: -4000 }, out: 'Silencio, tareas simples y comida sosa. Milagroso.' },
        { t: 'Vacaciones caras', fx: { cordura: 15, creditos: -25000, carisma: 6 }, out: 'Playa con escudo planetario. Vuelves moreno y arruinado.' },
        { t: 'Ni hablar, hay trabajo', fx: { creditos: 5000, cordura: -8 }, out: 'La gente que no para acaba parando de golpe.' }
      ]
    }
  ]);

  /* ============================================================
     GENERADORES NUEVOS
     ============================================================ */

  /* ofertas de empleo: ahora respetan época y especie */
  SW.GEN.empleo = function (rng, s, filtro) {
    let pool = SW.CARRERAS.filter(function (c) {
      if (c.era && c.era.indexOf(s.era) < 0) return false;
      if (c.esp && c.esp.indexOf(s.especie) < 0) return false;
      if (c.id === 'jedi' && !SW.ordenActiva(s.era)) return false;
      if (c.fam === 'fuerza' && !s.sensible) return false;
      // carreras que existen sólo como respaldo y no se ofrecen sueltas
      if (c.noOfrecer) return false;
      return true;
    });
    if (filtro === 'legal') pool = pool.filter(function (c) { return !c.ilegal; });
    if (filtro === 'ilegal') pool = pool.filter(function (c) { return c.ilegal || c.fam === 'crimen'; });

    const apto = pool.filter(function (c) {
      const r = c.req || {};
      for (const k in r) if ((s.stats[k] || 0) < r[k]) return false;
      return true;
    });
    const lista = (apto.length ? apto : pool);
    if (!lista.length) {
      return { id: 'gen_empleo', gen: true, esMenu: true, t: 'No hay nada para ti en este puerto, en esta época.', c: [{ t: '◂ Volver', volver: true }] };
    }
    const opciones = rng.pickN(lista, Math.min(5, lista.length)).map(function (c) {
      const sueldo = Math.round(c.sueldoBase * (0.7 + rng.next() * 0.8));
      return {
        t: c.n + ' — ' + (sueldo ? SW.U.cr(sueldo) + '/año' : 'sin sueldo'),
        sub: c.desc,
        empleo: { id: c.id, sueldo: sueldo }
      };
    });
    opciones.push({ t: '◂ Ninguna de estas', volver: true });
    return { id: 'gen_empleo', gen: true, esMenu: true, t: 'Ofertas disponibles en ' + s.mundo + ':', c: opciones };
  };

  /* encargo de una facción concreta */
  SW.GEN.encargo = function (rng, s) {
    const f = rng.pick(SW.faccionesDeEra(s.era));
    const tareas = [
      { v: 'entregar un mensaje que no puede ir por la HoloRed', dif: 35, pago: 0.6, al: 0 },
      { v: 'sacar a un informante de un planeta cerrado', dif: 58, pago: 1.1, al: 8 },
      { v: 'colocar un dispositivo en un edificio oficial', dif: 62, pago: 1.2, al: -10 },
      { v: 'escoltar a un diplomático nervioso', dif: 45, pago: 0.8, al: 5 },
      { v: 'recuperar un cuerpo de detrás de las líneas', dif: 66, pago: 1.0, al: 12 },
      { v: 'destruir unos archivos comprometedores', dif: 52, pago: 0.9, al: -12 },
      { v: 'sobornar a un comité entero', dif: 40, pago: 1.0, al: -15 },
      { v: 'proteger un cargamento de medicinas', dif: 48, pago: 0.7, al: 15 }
    ];
    const t = rng.pick(tareas);
    const mundo = rng.pick(SW.MUNDO_NOMBRES);
    const pago = Math.round((10000 + rng.int(0, 45000)) * t.pago);
    return {
      id: 'gen_encargo', gen: true,
      t: 'ENCARGO — ' + f.n + ' paga ' + SW.U.cr(pago) + ' por ' + t.v + ' en <b>' + mundo + '</b>.',
      c: [
        { t: 'Aceptar y hacerlo por la vía rápida', combate: { dif: t.dif, botin: pago }, fx: { alineamiento: t.al }, faccion: f.id + '+12', mueveA: mundo, motivo: 'por un encargo de ' + f.n },
        { t: 'Aceptar y hacerlo con cabeza', r: [
          { p: 0.6, t: 'Sale perfecto y sin ruido.', fx: { creditos: pago, intelecto: 10, alineamiento: t.al }, faccion: f.id + '+15' },
          { p: 0.4, t: 'Alguien se te adelanta y hay que improvisar.', combate: { dif: t.dif + 10, botin: Math.round(pago * 0.7) } }
        ], mueveA: mundo, motivo: 'por un encargo de ' + f.n },
        { t: 'Aceptar y vender el encargo a sus rivales', fx: { creditos: Math.round(pago * 1.7), alineamiento: -18, notoriedad: 15 }, faccion: f.id + '-30', out: 'Cobras el doble. Ganas un enemigo con recursos.' },
        { t: 'Rechazarlo', fx: {}, faccion: f.id + '-5', out: 'Buscan a otro. Siempre hay otro.' }
      ]
    };
  };

  /* dilemas a escala de crío: mismo peso emocional, otra escala */
  SW.GEN.dilemaCrio = function (rng, s) {
    const n1 = SW.genNombre(rng, 'humano');
    const lugar = rng.pick(SW.lugaresDe(s.mundo));
    const casos = [
      { t: 'Has roto algo en casa y nadie te ha visto.', a: 'Decirlo', b: 'Callar', c: 'Echárselo a otro' },
      { t: n1 + ' te ha copiado en clase y el profesor os mira a los dos.', a: 'Cubrirle', b: 'Decir la verdad', c: 'No decir nada y aguantar' },
      { t: 'Encuentras unos créditos en ' + lugar + '.', a: 'Buscar a quien los perdió', b: 'Quedártelos', c: 'Dárselos a tu familia' },
      { t: 'Los otros críos se están metiendo con ' + n1 + '.', a: 'Ponerte delante', b: 'Mirar', c: 'Unirte para que no te toque a ti' },
      { t: 'Te han invitado a un sitio al que tienes prohibido ir.', a: 'Ir igualmente', b: 'No ir', c: 'Ir y contarlo después' },
      { t: n1 + ' te pide que le guardes un secreto que da un poco de miedo.', a: 'Guardarlo', b: 'Contárselo a un adulto', c: 'Convencerle de contarlo él' }
    ];
    const k = rng.pick(casos);
    return {
      id: 'gen_dilema_crio', gen: true,
      t: 'DECISIÓN — ' + k.t,
      c: [
        { t: k.a, fx: { cordura: rng.int(-3, 6), alineamiento: rng.int(0, 10), carisma: 3 }, out: 'Te acuerdas de esto muchos años.' },
        { t: k.b, fx: { cordura: rng.int(-5, 4), alineamiento: rng.int(-6, 4), intelecto: 3 }, out: 'Nadie se entera. Tú sí.' },
        { t: k.c, fx: { cordura: rng.int(-6, 2), alineamiento: rng.int(-10, 2), destreza: 3 }, out: 'Funciona ahora. Ya veremos luego.' }
      ]
    };
  };

  /* dilema moral puro, sin combate */
  SW.GEN.dilema = function (rng, s) {
    if (s.edadBio < 14) return SW.GEN.dilemaCrio(rng, s);
    const n1 = SW.genNombreCompleto(rng, 'humano');
    const n2 = SW.genNombreCompleto(rng, rng.pick(['twilek', 'zabrak', 'duros']));
    const lugar = rng.pick(SW.LUGARES);
    const oficios = ['un médico', 'una capataz', 'un piloto', 'una archivera', 'un contrabandista', 'una senadora', 'un mecánico', 'una cazarrecompensas'];
    const of1 = rng.pick(oficios), of2 = rng.pick(oficios);
    const casos = [
      { t: 'Puedes salvar a ' + n1 + ' o a ' + n2 + '. No a los dos.', a: 'Salvar a ' + n1, b: 'Salvar a ' + n2, c: 'Intentar los dos y arriesgarlo todo' },
      { t: n1 + ' te pide que mientas por ' + n2 + ', que es culpable.', a: 'Mentir', b: 'Decir la verdad', c: 'Callarte y desaparecer' },
      { t: 'Puedes repartir lo que tienes entre muchos o salvar del todo a uno.', a: 'Repartirlo entre todos', b: 'Salvar del todo a uno', c: 'Quedártelo' },
      { t: n1 + ' te ofrece dinero por no contar lo que viste en ' + lugar + '.', a: 'Aceptar el dinero', b: 'Contarlo igualmente', c: 'Pedirle que lo cuente él' },
      { t: n1 + ', ' + of1 + ', te pide ayuda para algo que roza lo ilegal pero salvaría vidas.', a: 'Ayudarle', b: 'Negarte y avisar', c: 'Ayudarle a cambio de una parte' },
      { t: 'En ' + lugar + ' hay comida para diez y sois veinte.', a: 'Repartir a medias raciones', b: 'Dársela a los que aguantarán más', c: 'Coger la tuya y callar' },
      { t: n1 + ' ha robado para dar de comer a su familia y te toca decidir.', a: 'Dejarle marchar', b: 'Entregarle', c: 'Pagar tú lo robado' },
      { t: 'Te enteras de que ' + n2 + ', ' + of2 + ', va a perder el trabajo por un error tuyo.', a: 'Confesar', b: 'Callar', c: 'Buscarle otro trabajo sin decir nada' },
      { t: 'Puedes salvar tu carga o a un desconocido que se hunde en ' + lugar + '.', a: 'Salvar al desconocido', b: 'Salvar la carga', c: 'Intentar las dos cosas' },
      { t: n1 + ' te pide que le acompañes a algo peligroso solo para no ir solo.', a: 'Ir con él', b: 'Convencerle de no ir', c: 'Dejarle ir solo' },
      { t: 'Tienes pruebas de que alguien poderoso hizo algo terrible hace años.', a: 'Publicarlas', b: 'Usarlas para negociar', c: 'Destruirlas' },
      { t: 'Un crío de ' + lugar + ' te pide que le enseñes lo que sabes hacer. Lo tuyo es peligroso.', a: 'Enseñarle bien', b: 'Espantarle', c: 'Enseñarle solo lo seguro' },
      { t: n1 + ' te pide perdón por algo que todavía te duele.', a: 'Perdonarle', b: 'Decirle que no puedes', c: 'Fingir que ya lo habías olvidado' },
      { t: 'Puedes quedarte con el mérito de algo que hicisteis entre dos.', a: 'Compartirlo', b: 'Quedártelo', c: 'Cedérselo entero a ' + n2 }
    ];
    const k = rng.pick(casos);
    return {
      id: 'gen_dilema', gen: true,
      t: 'DECISIÓN — ' + k.t,
      c: [
        { t: k.a, fx: { cordura: -6, alineamiento: rng.int(-8, 12), carisma: 5 }, out: 'Vives con ello. Es lo que hay.' },
        { t: k.b, fx: { cordura: -4, alineamiento: rng.int(-4, 18), reputacion: 6 }, out: 'Alguien te lo recordará siempre.' },
        { t: k.c, fx: { cordura: -10, alineamiento: rng.int(-15, 8), intelecto: 6 }, out: 'La tercera vía tiene su propio precio.' }
      ]
    };
  };

})(window);

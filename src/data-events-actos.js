/* ============================================================
   HOLOVIDA :: eventos por actividad (el jugador elige categoría)
   Mismo formato que los eventos de vida.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  SW.ACTOS = {

  /* ---------------- TRABAJO ---------------- */
  trabajo: [
    {
      id: 'tr_horas', min: 14, max: 200, w: 10, req: function (s) { return !!s.trabajo; },
      t: 'Otro ciclo laboral. El supervisor pregunta si puedes cubrir turnos extra.',
      c: [
        { t: 'Doblar turnos todo el año', fx: { creditos: 'sueldo*0.5', salud: -8, cordura: -8, reputacion: 6 }, rendimiento: 15, out: 'Ganas más. Ves menos a todo el mundo.' },
        { t: 'Cumplir y nada más', fx: { cordura: 4 }, rendimiento: 0, out: 'Ni destacas ni molestas.' },
        { t: 'Escaquearte con estilo', fx: { cordura: 8, carisma: 5 }, rendimiento: -15, out: 'Nadie sabe dónde estás la mitad del turno.' },
        { t: 'Proponer una mejora al proceso', r: [
          { p: 0.5, t: 'La aplican y llevan tu nombre.', fx: { intelecto: 8, reputacion: 8 }, rendimiento: 25 },
          { p: 0.5, t: 'La aplican y lleva el nombre de tu jefe.', fx: { intelecto: 6, cordura: -6 }, rendimiento: 5 }
        ] }
      ]
    },
    {
      id: 'tr_pedir_aumento', min: 16, max: 200, w: 8, req: function (s) { return !!s.trabajo; },
      t: 'Entras al despacho a pedir un aumento.',
      c: [
        { t: 'Argumentar con datos', r: [
          { p: 0.55, t: 'Te suben un 20%.', fx: { intelecto: 5 }, aumento: 0.2 },
          { p: 0.45, t: '"El presupuesto está ajustado."', fx: { cordura: -5 } }
        ] },
        { t: 'Amenazar con irte', r: [
          { p: 0.45, t: 'Te suben un 35% y te odian un poco.', fx: { carisma: 6, reputacion: -4 }, aumento: 0.35 },
          { p: 0.55, t: 'Te aceptan la dimisión en el acto.', fx: { cordura: -8 }, despido: true }
        ] },
        { t: 'Chantajear con lo que sabes', r: [
          { p: 0.6, t: 'Doblan tu sueldo. Nadie te habla.', fx: { alineamiento: -15, notoriedad: 10, reputacion: -10 }, aumento: 1.0 },
          { p: 0.4, t: 'Te denuncian antes de que abras la boca del todo.', fx: { notoriedad: 20, creditos: -5000 }, despido: true }
        ] },
        { t: 'No pedir nada', fx: { cordura: -3 }, out: 'Vuelves a tu mesa. Otro año.' }
      ]
    },
    {
      id: 'tr_buscar', min: 14, max: 200, w: 10, req: function (s) { return !s.trabajo; },
      t: 'Sin trabajo. Los tablones de anuncios del puerto están llenos de ofertas dudosas.',
      c: [
        { t: 'Buscar algo legal y estable', buscarEmpleo: 'legal', out: '' },
        { t: 'Buscar algo que pague bien y pregunte poco', buscarEmpleo: 'ilegal', out: '' },
        { t: 'Buscar según tus talentos', buscarEmpleo: 'mejor', out: '' },
        { t: 'No buscar nada este año', fx: { cordura: 6, creditos: -2000 }, out: 'Vives de lo que hay. Es sorprendentemente agradable.' }
      ]
    },
    {
      id: 'tr_conflicto', min: 16, max: 200, w: 7, req: function (s) { return !!s.trabajo; }, slots: { n: 'nombre' },
      t: '{n}, compañero de turno, se lleva el mérito de algo tuyo delante de todos.',
      c: [
        { t: 'Corregirle en público', fx: { carisma: 6, reputacion: 5 }, rendimiento: 5, rel: { tipo: 'rival', afecto: -30 }, out: 'Queda claro. Y queda tenso.' },
        { t: 'Hablarlo en privado', fx: { carisma: 8, cordura: 4 }, rel: { tipo: 'amigo', afecto: 15 }, out: 'Se disculpa. Cumple.' },
        { t: 'Documentarlo todo para más adelante', fx: { intelecto: 8 }, flag: 'expediente_{n}', out: 'La carpeta crece. Algún día se abre.' },
        { t: 'Dejarlo pasar', fx: { cordura: -4, reputacion: -3 }, out: 'No es la última vez.' }
      ]
    },
    {
      id: 'tr_corrupcion', min: 18, max: 200, w: 6, req: function (s) { return !!s.trabajo; }, slots: { f: 'faccion' },
      t: 'Alguien de {f} te ofrece dinero por mirar hacia otro lado en un envío.',
      c: [
        { t: 'Aceptar', fx: { creditos: 22000, alineamiento: -12, notoriedad: 10 }, faccion: 'auto+10', out: 'Fácil. Demasiado fácil.' },
        { t: 'Rechazar y denunciar', fx: { reputacion: 12, alineamiento: 12 }, faccion: 'auto-20', rendimiento: 10, out: 'Cae gente. Alguna era inocente.' },
        { t: 'Rechazar y callar', fx: { cordura: 4, alineamiento: 5 }, out: 'No haces daño. Tampoco bien.' },
        { t: 'Aceptar y grabarlo todo', fx: { creditos: 22000, intelecto: 10, notoriedad: 6 }, flag: 'material_chantaje', out: 'Ahora tienes dinero y una póliza de seguros.' }
      ]
    },
    {
      id: 'tr_dimitir', min: 18, max: 200, w: 5, req: function (s) { return !!s.trabajo && s.añosEnTrabajo > 3; },
      t: 'Llevas años en el mismo sitio. Hoy te has quedado mirando la pared 20 minutos.',
      c: [
        { t: 'Dimitir sin plan B', fx: { cordura: 15, creditos: -3000 }, despido: true, out: 'Miedo y aire fresco a partes iguales.' },
        { t: 'Aguantar un año más', fx: { creditos: 'sueldo*0.2', cordura: -8 }, out: 'El mismo pasillo, otra vez.' },
        { t: 'Pedir traslado a otro mundo', fx: { cordura: 8, carisma: 4 }, mover: true, out: 'Mismo trabajo, cielo distinto. Ayuda más de lo esperado.' }
      ]
    }
  ],

  /* ---------------- FORMACIÓN ---------------- */
  formacion: [
    {
      id: 'fo_estudiar', min: 6, max: 200, w: 10,
      t: 'Puedes dedicar el año a formarte.',
      c: [
        { t: 'Estudios técnicos (intelecto)', fx: { intelecto: 12, creditos: -3000, cordura: -3 }, out: 'Manuales, simuladores y café.' },
        { t: 'Entrenamiento físico (destreza y salud)', fx: { destreza: 12, salud: 8, cordura: -2 }, out: 'Duele. Funciona.' },
        { t: 'Oratoria y trato social (carisma)', fx: { carisma: 12, creditos: -2000 }, out: 'Aprendes a mirar a los ojos el tiempo justo.' },
        { t: 'Meditación y disciplina (cordura)', fx: { cordura: 14, fuerza: 4 }, out: 'Menos ruido dentro de la cabeza.' }
      ]
    },
    {
      id: 'fo_matricula', min: 15, max: 45, w: 8, req: function (s) { return !s.estudios.length || s.estudios.length < 2; },
      t: 'Puedes matricularte en un programa formal. Cuesta tiempo y créditos.',
      c: [{ t: 'Ver programas disponibles', matricula: true, out: '' }, { t: 'Otro año no', fx: {}, out: 'La formación reglada no es para todos.' }]
    },
    {
      id: 'fo_idioma', min: 8, max: 200, w: 7, slots: { p: 'mundo' },
      t: 'Puedes aprender un idioma nuevo. En el puerto de {p} se oyen doce a la vez.',
      c: [
        { t: 'Huttés (útil en los bajos fondos)', fx: { carisma: 6, notoriedad: 4 }, idioma: 'huttés', out: 'Ahora entiendes las amenazas antes de que te las traduzcan.' },
        { t: 'Binario de droides', fx: { intelecto: 8 }, idioma: 'binario', out: 'Los astromecánicos te toman en serio.' },
        { t: 'Shyriiwook', fx: { carisma: 5, reputacion: 5 }, idioma: 'shyriiwook', out: 'No puedes hablarlo. Puedes entenderlo. Basta.' },
        { t: 'Alto galáctico protocolario', fx: { carisma: 8, reputacion: 6 }, idioma: 'alto galáctico', out: 'Suenas caro. Abre puertas de mármol.' }
      ]
    },
    {
      id: 'fo_maestro', min: 12, max: 200, w: 6, slots: { n: 'nombre', p: 'mundo' },
      t: 'Un veterano llamado {n} en {p} acepta enseñarte algo muy concreto.',
      c: [
        { t: 'Tiro de precisión', fx: { destreza: 15, creditos: -6000 }, habilidad: 'tirador', out: 'Aprendes a respirar antes de apretar.' },
        { t: 'Pilotaje avanzado', fx: { destreza: 12, intelecto: 6, creditos: -8000 }, habilidad: 'piloto', out: 'Maniobras que no vienen en el manual.' },
        { t: 'Mecánica de hipermotores', fx: { intelecto: 15, creditos: -5000 }, habilidad: 'ingeniero', out: 'Escuchas el motor y sabes qué le duele.' },
        { t: 'Lectura de gente', fx: { carisma: 14, intelecto: 6, creditos: -4000 }, habilidad: 'lector', out: 'Ves la mentira tres segundos antes de que salga.' },
        { t: 'Combate cuerpo a cuerpo', fx: { destreza: 14, salud: 6, creditos: -3000 }, habilidad: 'luchador', out: 'Ocho meses de moratones útiles.' }
      ]
    },
    {
      id: 'fo_autodidacta', min: 10, max: 200, w: 7,
      t: 'Sin dinero para maestros, pero con acceso a la HoloNet y mucha terquedad.',
      c: [
        { t: 'Devorar archivos técnicos', fx: { intelecto: 9 }, out: 'Aprendes desordenado pero aprendes.' },
        { t: 'Ver holos de duelos hasta memorizarlos', fx: { destreza: 7, fuerza: 3 }, out: 'La teoría del combate. Falta lo otro.' },
        { t: 'Estudiar historia de la galaxia', fx: { intelecto: 6, cordura: 6, carisma: 4 }, out: 'Entiendes por qué todo está así. No ayuda a dormir.' },
        { t: 'Aprender a cocinar de verdad', fx: { cordura: 10, carisma: 6, salud: 5 }, habilidad: 'cocinero', out: 'La habilidad más infravalorada de la galaxia.' }
      ]
    }
  ],

  /* ---------------- SOCIAL ---------------- */
  social: [
    {
      id: 'so_gente', min: 6, max: 200, w: 10, slots: { l: 'lugar', n: 'nombre' },
      t: 'Un año para cuidar (o quemar) tus vínculos.',
      c: [
        { t: 'Pasar tiempo con los tuyos', fx: { cordura: 12, carisma: 4 }, relTodas: 12, out: 'Cenas largas y discusiones tontas.' },
        { t: 'Salir a conocer gente nueva en {l}', fx: { carisma: 8, creditos: -1500 }, nuevaRel: true, out: '' },
        { t: 'Cortar con alguien tóxico', fx: { cordura: 10, carisma: -3 }, cortarRel: true, out: '' },
        { t: 'Encerrarte con tus cosas', fx: { intelecto: 8, cordura: -6, carisma: -5 }, relTodas: -8, out: 'Productivo y solo.' }
      ]
    },
    {
      id: 'so_boda', min: 18, max: 90, w: 6,
      req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'pareja' && r.afecto > 55; }); },
      t: 'Lo habéis hablado. ¿Ceremonia?',
      c: [
        { t: 'Boda grande con toda la familia', fx: { creditos: -25000, cordura: 15, reputacion: 10 }, casar: true, out: 'Sale carísima y sale bien.' },
        { t: 'Firmar en un registro de puerto', fx: { creditos: -500, cordura: 10 }, casar: true, out: 'Once minutos. Suficiente.' },
        { t: 'Ceremonia según el rito de tu pueblo', fx: { creditos: -8000, cordura: 14, reputacion: 8, fuerza: 3 }, casar: true, out: 'Tu abuela llora. Es una buena señal.' },
        { t: 'Mejor así, sin papeles', fx: { cordura: 5 }, out: 'Funciona igual. O eso decís.' }
      ]
    },
    {
      id: 'so_ruptura', min: 16, max: 95, w: 6,
      req: function (s) { return s.relaciones.some(function (r) { return (r.tipo === 'pareja' || r.tipo === 'cónyuge') && r.afecto < 45; }); },
      t: 'La cosa lleva tiempo torcida y los dos lo sabéis.',
      c: [
        { t: 'Hablarlo e intentar arreglarlo', r: [
          { p: 0.5, t: 'Funciona. Volvéis a empezar.', fx: { cordura: 12 }, relPareja: 30 },
          { p: 0.5, t: 'Solo confirma lo que ya sabíais.', fx: { cordura: -8 }, romper: true }
        ] },
        { t: 'Romper limpio', fx: { cordura: -10, carisma: 4 }, romper: true, out: 'Duele bien. Es lo mejor que se puede pedir.' },
        { t: 'Romper mal, con público', fx: { cordura: -14, reputacion: -8, notoriedad: 6 }, romper: true, out: 'La cantina entera lo comenta un mes.' },
        { t: 'Aguantar por costumbre', fx: { cordura: -8, creditos: 2000 }, relPareja: -10, out: 'Años cómodos y grises.' }
      ]
    },
    {
      id: 'so_amistad_prueba', min: 14, max: 200, w: 7,
      req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'amigo'; }); },
      slots: { n: 'nombre' },
      t: 'Un amigo tuyo se ha metido en algo feo y te pide ayuda.',
      c: [
        { t: 'Ayudarle sin condiciones', fx: { creditos: -12000, cordura: 8, alineamiento: 10 }, relTodas: 20, out: 'Te lo devolverá. O no. Da igual.' },
        { t: 'Ayudarle pero poniendo límites', fx: { creditos: -4000, carisma: 8, cordura: 4 }, out: 'Es la respuesta adulta. Nadie aplaude.' },
        { t: 'Decirle que no', fx: { cordura: -6, alineamiento: -6 }, relTodas: -20, out: 'Se acuerda. Siempre se acuerdan.' },
        { t: 'Aprovecharte de su situación', fx: { creditos: 15000, alineamiento: -20, notoriedad: 8 }, relTodas: -40, out: 'Sale rentable. Y caro.' }
      ]
    },
    {
      id: 'so_familia_hijos', min: 22, max: 200, w: 7,
      req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo'; }); },
      slots: { n: 'nombre' },
      t: 'Tu hijo te pide algo difícil de conceder.',
      c: [
        { t: 'Dejarle elegir su camino', fx: { alineamiento: 10, cordura: 8 }, relHijos: 25, out: 'Se equivocará. Es lo suyo.' },
        { t: 'Imponer tu criterio', fx: { reputacion: 4, cordura: -5 }, relHijos: -20, out: 'Obedece. Y guarda rencor.' },
        { t: 'Negociar un término medio', fx: { carisma: 10, intelecto: 5 }, relHijos: 12, out: 'Los dos cedéis un poco.' },
        { t: 'Financiarle la locura entera', fx: { creditos: -30000, cordura: 10 }, relHijos: 35, out: 'Le compras el sueño. Sale mejor de lo previsto.' }
      ]
    },
    {
      id: 'so_enemigo', min: 16, max: 200, w: 6,
      req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'rival'; }); },
      t: 'Tu rival de siempre aparece en el mismo sitio que tú. Otra vez.',
      c: [
        { t: 'Hacer las paces de una vez', fx: { cordura: 14, carisma: 8, alineamiento: 8 }, convertirRival: 'amigo', out: 'Los dos estáis mayores para esto.' },
        { t: 'Humillarle en público', fx: { carisma: 6, reputacion: -4, notoriedad: 8 }, relRival: -30, out: 'Placer inmediato, problema futuro.' },
        { t: 'Arruinarle discretamente', fx: { intelecto: 10, alineamiento: -15, creditos: 8000 }, relRival: -40, out: 'Nunca sabrá que fuiste tú. Tú sí.' },
        { t: 'Proponerle una alianza', fx: { carisma: 12, creditos: 15000 }, convertirRival: 'socio', out: 'Los mejores socios salen de los peores enemigos.' }
      ]
    }
  ],

  /* ---------------- BAJOS FONDOS ---------------- */
  crimen: [
    { id: 'cr_menu', min: 12, max: 200, w: 12, t: 'Los bajos fondos siempre tienen trabajo.', c: [{ t: 'Ver contratos disponibles', generar: 'contrato', out: '' }] },
    {
      id: 'cr_carterista', min: 10, max: 200, w: 8, slots: { l: 'lugar' },
      t: 'Multitud densa en {l}. Bolsillos por todas partes.',
      c: [
        { t: 'Trabajar la multitud toda la tarde', r: [
          { p: 0.6, t: 'Sales con varios bolsillos ajenos.', fx: { creditos: 2500, destreza: 6, alineamiento: -6, notoriedad: 4 } },
          { p: 0.4, t: 'Una mano de wookiee te agarra la muñeca.', fx: { salud: -12, reputacion: -6, notoriedad: 6 } }
        ] },
        { t: 'Elegir un solo objetivo rico', r: [
          { p: 0.45, t: 'Cartera de un noble de Cantonica.', fx: { creditos: 9000, destreza: 8, alineamiento: -8, notoriedad: 6 } },
          { p: 0.55, t: 'Guardaespaldas. Dos.', fx: { salud: -18, notoriedad: 10 } }
        ] },
        { t: 'Dejarlo, hoy no', fx: { cordura: 3, alineamiento: 3 }, out: 'Te vas a casa con las manos vacías y limpias.' }
      ]
    },
    {
      id: 'cr_especia', min: 16, max: 200, w: 8, slots: { p: 'mundo' },
      t: 'Un cargamento de especia busca quien lo mueva hasta {p}.',
      c: [
        { t: 'Llevarlo tú', r: [
          { p: 0.55, t: 'Entrega limpia.', fx: { creditos: 28000, notoriedad: 10, destreza: 5 }, faccion: 'hutt+10' },
          { p: 0.3, t: 'Control en órbita. Sueltas la carga al vacío.', fx: { creditos: -6000, notoriedad: 12, cordura: -6 } },
          { p: 0.15, t: 'Te detienen. Multa, cárcel corta.', fx: { creditos: -20000, notoriedad: 25, salud: -8 }, carcel: 1 }
        ] },
        { t: 'Subcontratarlo a un desesperado', fx: { creditos: 9000, alineamiento: -12, notoriedad: 5 }, out: 'Cobras la mitad y no arriesgas nada. Él sí.' },
        { t: 'Robar el cargamento entero', r: [
          { p: 0.4, t: 'Desapareces con todo.', fx: { creditos: 60000, notoriedad: 25, alineamiento: -18 }, faccion: 'hutt-35', flag: 'enemigo_hutt' },
          { p: 0.6, t: 'Te esperaban. Sabían que lo pensarías.', fx: { salud: -30, creditos: -10000, notoriedad: 20 } }
        ] },
        { t: 'Pasar del tema', fx: {}, out: 'Otra vez será.' }
      ]
    },
    {
      id: 'cr_atraco', min: 16, max: 200, w: 7, slots: { l: 'lugar', p: 'mundo' },
      t: 'Casa de cambio en {l}, {p}. Poca seguridad, mucho efectivo.',
      c: [
        { t: 'Entrar por la fuerza', combate: { dif: 50, botin: 35000 }, out: '' },
        { t: 'Preparar el golpe durante meses', r: [
          { p: 0.65, t: 'Perfecto. Ni una alarma.', fx: { creditos: 48000, intelecto: 10, notoriedad: 12, alineamiento: -12 } },
          { p: 0.35, t: 'Un fallo tonto al final.', fx: { creditos: 8000, notoriedad: 20, salud: -12 } }
        ] },
        { t: 'Slicear las cuentas desde fuera', req: function (s) { return s.stats.intelecto > 55; }, r: [
          { p: 0.6, t: 'Nadie sabe que ha pasado nada.', fx: { creditos: 40000, intelecto: 12, notoriedad: 4, alineamiento: -8 } },
          { p: 0.4, t: 'Dejas rastro. Alguien tira del hilo.', fx: { creditos: 15000, notoriedad: 18 } }
        ] },
        { t: 'Vender el plan a otra banda', fx: { creditos: 12000, carisma: 6, notoriedad: 6 }, out: 'Riesgo cero, beneficio decente.' }
      ]
    },
    {
      id: 'cr_carcel', min: 14, max: 200, w: 5, req: function (s) { return s.stats.notoriedad > 40; },
      t: 'Te detienen. Las pruebas son razonables y tu abogado no.',
      c: [
        { t: 'Declararte culpable y cumplir', fx: { creditos: -5000, notoriedad: -15, cordura: -10, destreza: 6 }, carcel: 2, out: 'Dos años. Sales con contactos nuevos.' },
        { t: 'Pagar la fianza y desaparecer', fx: { creditos: -35000, notoriedad: 12 }, mover: true, out: 'Te buscan en un sistema. Vives en otro.' },
        { t: 'Delatar a tus socios', fx: { notoriedad: -25, reputacion: -10, alineamiento: -10 }, faccion: 'hutt-25', flag: 'chivato', out: 'Sales libre. Y con precio en la cabeza.' },
        { t: 'Fugarte', r: [
          { p: 0.35, t: 'Consigues salir por los conductos.', fx: { destreza: 15, notoriedad: 25, cordura: -8 } },
          { p: 0.65, t: 'Te añaden cinco años.', fx: { notoriedad: 15, salud: -15, cordura: -15 }, carcel: 5 }
        ] }
      ]
    },
    {
      id: 'cr_esclavos', min: 18, max: 200, w: 5, slots: { p: 'mundo' },
      t: 'Un tratante ofrece dinero fácil por transportar "trabajadores contratados" desde {p}.',
      c: [
        { t: 'Aceptar sin mirar la carga', fx: { creditos: 35000, alineamiento: -30, notoriedad: 15, cordura: -12 }, out: 'No miras atrás. Los oyes igual.' },
        { t: 'Aceptar y liberarlos en ruta', fx: { creditos: -5000, alineamiento: 25, reputacion: 12, notoriedad: 12 }, faccion: 'hutt-25', out: 'El tratante pone precio a tu cabeza. Vale la pena.' },
        { t: 'Denunciar la operación', fx: { alineamiento: 18, reputacion: 10, notoriedad: 8 }, out: 'Cae la célula. Otra abre en dos meses.' },
        { t: 'Rechazarlo y marcharte', fx: { alineamiento: 8 }, out: 'No es tu problema. Salvo que sí.' }
      ]
    }
  ],

  /* ---------------- HANGAR / NAVE ---------------- */
  nave: [
    { id: 'na_menu', min: 16, max: 200, w: 12, t: 'El hangar. Grasa, ozono y posibilidades.', c: [{ t: 'Ver el mercado de naves y mejoras', hangar: true, out: '' }] },
    {
      id: 'na_ruta', min: 16, max: 200, w: 10, req: function (s) { return !!s.nave; },
      t: 'Tu nave está lista. Hay rutas de carga esperando.',
      c: [{ t: 'Ver rutas disponibles', generar: 'ruta', out: '' }]
    },
    {
      id: 'na_averia', min: 16, max: 200, w: 7, req: function (s) { return !!s.nave; },
      t: 'El hipermotor hace un ruido que no hacía. Los mecánicos ponen mala cara.',
      c: [
        { t: 'Reparación completa y cara', fx: { creditos: -18000, salud: 2 }, naveEstado: 40, out: 'Vuela como nueva. Duele en la cuenta.' },
        { t: 'Apaño barato', fx: { creditos: -3000 }, naveEstado: 12, out: 'Aguanta. Probablemente.' },
        { t: 'Arreglarlo tú mismo', r: [
          { p: 0.55, t: 'Lo clavas.', fx: { intelecto: 10, creditos: -800 }, naveEstado: 30 },
          { p: 0.45, t: 'Ahora hace dos ruidos.', fx: { intelecto: 5, creditos: -1500 }, naveEstado: -10 }
        ] },
        { t: 'Volar así y cruzar los dedos', fx: { suerte: -4 }, naveEstado: -20, out: 'La suerte es un sistema de mantenimiento pésimo.' }
      ]
    },
    {
      id: 'na_polizon', min: 16, max: 200, w: 6, req: function (s) { return !!s.nave; }, slots: { n: 'nombre', p: 'mundo' },
      t: 'Encuentras a {n} escondido en la bodega. Lleva dos días sin comer.',
      c: [
        { t: 'Darle de comer y llevarle a {p}', fx: { alineamiento: 15, cordura: 8, creditos: -500 }, rel: { tipo: 'amigo', afecto: 30 }, out: 'Te ayuda en la bodega el resto del viaje.' },
        { t: 'Entregarle a las autoridades', fx: { creditos: 2000, alineamiento: -12 }, out: 'Cobras la recompensa. Poco.' },
        { t: 'Ponerle a trabajar sin paga', fx: { creditos: 3000, alineamiento: -15 }, out: 'Trabaja bien. Se va en cuanto puede.' },
        { t: 'Echarle en el siguiente puerto', fx: { cordura: -3 }, out: 'Sin drama. Sin ayuda.' }
      ]
    },
    {
      id: 'na_persecucion', min: 16, max: 200, w: 7, req: function (s) { return !!s.nave; }, slots: { f: 'faccion' },
      t: 'Dos cazas de {f} te ordenan detenerte y prepararte para el abordaje.',
      c: [
        { t: 'Combate espacial', dogfight: { dif: 55 }, out: '' },
        { t: 'Salto ciego al hiperespacio', r: [
          { p: 0.6, t: 'Sales. Apareces en un sistema sin nombre.', fx: { destreza: 8, cordura: -5 }, mover: true },
          { p: 0.4, t: 'Cálculo malo. Rozas un campo de asteroides.', fx: { salud: -12 }, naveEstado: -30 }
        ] },
        { t: 'Dejarles abordar y hablar', r: [
          { p: 0.5, t: 'Papeles en regla, o casi. Te dejan ir.', fx: { carisma: 8, creditos: -2000 } },
          { p: 0.5, t: 'Encuentran lo que llevas.', fx: { creditos: -20000, notoriedad: 18 }, carcel: 1 }
        ] },
        { t: 'Soltar la carga y correr', fx: { creditos: -12000, destreza: 6, notoriedad: 4 }, out: 'Pierdes el flete, salvas la nave.' }
      ]
    },
    {
      id: 'na_bautizo', min: 16, max: 200, w: 5, req: function (s) { return !!s.nave && !s.naveNombre; },
      t: 'Tu nave todavía no tiene nombre. En el Borde eso da mala suerte.',
      c: [{ t: 'Ponerle nombre', nombrarNave: true, out: '' }, { t: 'Los nombres son para los sentimentales', fx: { suerte: -5 }, out: 'La llamas "la nave". Ella se entera.' }]
    }
  ],

  /* ---------------- VIAJE ---------------- */
  viaje: [
    { id: 'vi_menu', min: 8, max: 200, w: 12, t: 'La galaxia es grande y tú estás en un solo punto de ella.', c: [{ t: 'Elegir destino', viajar: true, out: '' }] },
    {
      id: 'vi_encuentro', min: 10, max: 200, w: 8, slots: { p: 'mundo', n: 'nombre', l: 'lugar' },
      t: 'Escala imprevista en {p}. En {l} alguien te reconoce sin que sepas de qué.',
      c: [
        { t: 'Seguirle la conversación', r: [
          { p: 0.5, t: 'Te confunde con otro. Aprovechas la confusión.', fx: { creditos: 4000, carisma: 8 } },
          { p: 0.5, t: 'Es alguien de tu pasado con una factura pendiente.', fx: { creditos: -6000, cordura: -5 } }
        ] },
        { t: 'Negarlo todo y marcharte', fx: { destreza: 4, cordura: -2 }, out: 'Te sigue con la mirada hasta la puerta.' },
        { t: 'Preguntarle directamente quién eres para él', fx: { intelecto: 6, cordura: 6 }, rel: { tipo: 'contacto', afecto: 20 }, out: 'La respuesta es larga y bastante buena.' }
      ]
    },
    {
      id: 'vi_frontera', min: 12, max: 200, w: 7, slots: { p: 'mundo' },
      t: 'Aduana de {p}. Te piden abrir todo el equipaje.',
      c: [
        { t: 'Cooperar del todo', fx: { cordura: -2, notoriedad: -4 }, out: 'Tres horas. Nada más.' },
        { t: 'Soborno rápido', fx: { creditos: -1500 }, out: 'La cola se acorta milagrosamente.' },
        { t: 'Discutir tus derechos', r: [
          { p: 0.45, t: 'Ganas la discusión. Te odian.', fx: { carisma: 8, notoriedad: 5 } },
          { p: 0.55, t: 'Cinco horas en una sala gris.', fx: { cordura: -8, notoriedad: 8 } }
        ] }
      ]
    },
    {
      id: 'vi_peregrinacion', min: 14, max: 200, w: 6, slots: { p: 'mundo' },
      t: 'Hay un lugar sagrado en {p}. Se llega andando, y hay que andar mucho.',
      c: [
        { t: 'Hacer el camino entero', fx: { cordura: 18, fuerza: 8, salud: -6, alineamiento: 8 }, out: 'Veintiún días. Vuelves distinto y con ampollas.' },
        { t: 'Ir en speeder hasta arriba', fx: { cordura: 4 }, out: 'Está bien. No es lo mismo.' },
        { t: 'Vender recuerdos a los peregrinos', fx: { creditos: 7000, carisma: 6, alineamiento: -6 }, out: 'La fe mueve mercancía.' }
      ]
    }
  ],

  /* ---------------- FUERZA ---------------- */
  fuerza: [
    { id: 'fu_menu', min: 6, max: 200, w: 12, req: function (s) { return s.stats.fuerza > 5; }, t: 'Cierras los ojos. Está ahí, esperando como siempre.', c: [{ t: 'Entrenar la Fuerza', fuerzaMenu: true, out: '' }] },
    {
      id: 'fu_sable', min: 12, max: 200, w: 8, req: function (s) { return s.stats.fuerza > 35 && !s.sable && s.kyber; },
      t: 'Tienes un cristal. Ahora falta lo demás: la empuñadura, los emisores, la paciencia.',
      c: [{ t: 'Construir tu sable de luz', construirSable: true, out: '' }, { t: 'Todavía no estás preparado', fx: { cordura: 5, fuerza: 3 }, out: 'El cristal espera. Lleva milenios haciéndolo.' }]
    },
    {
      id: 'fu_lado', min: 14, max: 200, w: 7, req: function (s) { return s.stats.fuerza > 40; }, slots: { n: 'nombre' },
      t: 'Sientes las dos corrientes tirando de ti. Hay que elegir hacia dónde inclinarse este año.',
      c: [
        { t: 'Templanza y servicio', fx: { alineamiento: 15, cordura: 10, fuerza: 6 }, out: 'Más lento. Más sólido.' },
        { t: 'Pasión y poder', fx: { alineamiento: -15, fuerza: 14, cordura: -8, destreza: 5 }, out: 'Rápido. Caliente. Caro.' },
        { t: 'El filo entre las dos', fx: { fuerza: 10, cordura: -4, intelecto: 6 }, flag: 'gris', out: 'Ninguna Orden te querrá. Ninguna te tendrá.' },
        { t: 'Apartarte de la Fuerza este año', fx: { fuerza: -10, cordura: 12, salud: 5 }, out: 'Silencio. Casi da miedo lo bien que sienta.' }
      ]
    },
    {
      id: 'fu_templo', min: 14, max: 200, w: 6, req: function (s) { return s.stats.fuerza > 30; }, slots: { p: 'mundo' },
      t: 'Un templo abandonado en {p}. Las puertas ceden con demasiada facilidad.',
      c: [
        { t: 'Meditar en el vestíbulo', fx: { fuerza: 12, cordura: 12 }, out: 'Los ecos te contestan.' },
        { t: 'Bajar a las criptas', r: [
          { p: 0.45, t: 'Encuentras un maestro muerto y su sable.', fx: { fuerza: 15 }, sableNuevo: true },
          { p: 0.3, t: 'Encuentras un holocrón sith intacto.', fx: { fuerza: 18, alineamiento: -15, cordura: -10 }, poder: 'auto_oscuro' },
          { p: 0.25, t: 'Encuentras lo que mató a los anteriores.', fx: { salud: -25, cordura: -15, destreza: 8 } }
        ] },
        { t: 'Saquear lo que tenga valor', fx: { creditos: 30000, alineamiento: -12, fuerza: -6 }, out: 'Los coleccionistas pagan por piedras viejas.' },
        { t: 'Sellar la entrada al salir', fx: { alineamiento: 12, cordura: 8 }, out: 'Que descansen.' }
      ]
    },
    {
      id: 'fu_orden', min: 16, max: 200, w: 6, req: function (s) { return s.stats.fuerza > 50 && !s.trabajo; },
      t: 'Con tu nivel en la Fuerza, hay caminos formales abiertos.',
      c: [
        { t: 'Presentarte ante la Orden Jedi', unirse: 'jedi', out: '' },
        { t: 'Buscar un maestro del lado oscuro', unirse: 'sith', out: '' },
        { t: 'Ir por libre', fx: { fuerza: 8, cordura: 6, notoriedad: 5 }, flag: 'gris', out: 'Sin túnica, sin consejo, sin permiso.' }
      ]
    }
  ],

  /* ---------------- MERCADO ---------------- */
  mercado: [
    { id: 'me_menu', min: 10, max: 200, w: 12, t: 'El mercado. Todo tiene precio, incluido lo que no debería.', c: [{ t: 'Entrar al mercado', tienda: true, out: '' }] },
    {
      id: 'me_timo', min: 12, max: 200, w: 7, slots: { o: 'objeto', n: 'nombre' },
      t: '{n} te ofrece un {o} "auténtico" a un cuarto de su precio.',
      c: [
        { t: 'Comprarlo sin mirar', r: [
          { p: 0.4, t: 'Es auténtico. Y robado, pero auténtico.', fx: { notoriedad: 5 }, item: true, coste: 'objeto/4' },
          { p: 0.6, t: 'Es una falsificación pésima.', fx: { intelecto: 4, cordura: -4 }, coste: 'objeto/4' }
        ] },
        { t: 'Examinarlo a fondo primero', fx: { intelecto: 6 }, r: [
          { p: 0.5, t: 'Real. Regateas aún más.', fx: { carisma: 6 }, item: true, coste: 'objeto/6' },
          { p: 0.5, t: 'Falso. Se lo dices y se va rápido.', fx: { carisma: 4, reputacion: 4 } }
        ] },
        { t: 'Denunciarle al gremio del mercado', fx: { reputacion: 6, creditos: 800 }, out: 'Le cierran el puesto. Otro abre mañana.' }
      ]
    },
    {
      id: 'me_apuestas', min: 14, max: 200, w: 8, slots: { c: 'criatura', l: 'lugar' },
      t: 'Peleas de {c} en {l}. La casa acepta apuestas grandes.',
      c: [
        { t: 'Apostar fuerte al favorito', r: [
          { p: 0.6, t: 'Ganas poco pero ganas.', fx: { creditos: 4000, suerte: 3 } },
          { p: 0.4, t: 'El favorito se lesiona en el minuto dos.', fx: { creditos: -8000, cordura: -4 } }
        ] },
        { t: 'Apostar al que nadie quiere', r: [
          { p: 0.22, t: 'Gana. La casa palidece.', fx: { creditos: 45000, suerte: 12, carisma: 8 } },
          { p: 0.78, t: 'Pierde, como todos decían.', fx: { creditos: -6000, suerte: -3 } }
        ] },
        { t: 'Liberar a los animales', r: [
          { p: 0.5, t: 'Caos absoluto. Escapas entre gritos.', fx: { alineamiento: 15, notoriedad: 12, destreza: 8 } },
          { p: 0.5, t: 'Te pillan a mitad.', fx: { salud: -20, creditos: -5000, alineamiento: 12 } }
        ] },
        { t: 'Solo mirar', fx: { cordura: -3, intelecto: 3 }, out: 'No apuestas. Tampoco te gusta lo que ves.' }
      ]
    }
  ],

  /* ---------------- ACCIÓN ---------------- */
  accion: [
    { id: 'ac_menu', min: 12, max: 200, w: 12, t: 'Hay maneras de buscarse problemas a propósito.', c: [{ t: 'Buscar acción', accionMenu: true, out: '' }] },
    {
      id: 'ac_arena', min: 14, max: 200, w: 8, slots: { p: 'mundo', c: 'criatura' },
      t: 'La arena de {p} ofrece 12.000 créditos por tres asaltos contra un {c}.',
      c: [
        { t: 'Aceptar el combate', combate: { dif: 60, botin: 12000, bestia: true }, out: '' },
        { t: 'Aceptar y amañarlo', fx: { creditos: 6000, alineamiento: -8, notoriedad: 6 }, out: 'Pierdes de forma convincente. Cobras por los dos lados.' },
        { t: 'Negociar por más dinero primero', r: [
          { p: 0.5, t: 'Suben a 20.000.', fx: { carisma: 8 }, combate: { dif: 60, botin: 20000, bestia: true } },
          { p: 0.5, t: 'Buscan a otro.', fx: { carisma: 3 } }
        ] },
        { t: 'Pasar', fx: {}, out: 'La arena siempre tiene hueco. Mañana también.' }
      ]
    },
    {
      id: 'ac_duelo', min: 14, max: 200, w: 7, slots: { n: 'nombre', l: 'lugar' },
      t: '{n} te reta a un duelo formal en {l}. Hay público.',
      c: [
        { t: 'Aceptar el duelo a blásters', sub: 'necesitas un arma de fuego', req: function (st) { return SW.tieneArmaFuego(st); }, combate: { dif: 65, duelo: true, pistolas: true }, out: '' },
        { t: 'Aceptar el duelo con sable', req: function (st) { return !!st.sable; }, combate: { dif: 65, duelo: true, sable: true }, out: '' },
        { t: 'Aceptar el duelo a puños', combate: { dif: 55, duelo: true }, out: 'Sin armas. Como la gente honrada o la que no tiene nada.' },
        { t: 'Aceptar pero cambiar las reglas', fx: { carisma: 8, notoriedad: 5 }, combate: { dif: 45, duelo: true }, out: 'Propones armas de aturdimiento. Aceptan a regañadientes.' },
        { t: 'Rechazar públicamente', fx: { reputacion: -10, cordura: 4 }, out: 'Se ríen. Sigues vivo.' },
        { t: 'Atacarle antes de que empiece', fx: { alineamiento: -15, notoriedad: 12, destreza: 6 }, combate: { dif: 40, duelo: true }, out: 'Nada elegante. Muy eficaz.' }
      ]
    }
  ],

  /* ---------------- SALUD ---------------- */
  salud: [
    {
      id: 'sa_cuidarse', min: 8, max: 200, w: 10,
      t: 'El cuerpo y la cabeza piden cosas distintas este año.',
      c: [
        { t: 'Rutina física seria', fx: { salud: 12, destreza: 8, cordura: 4, creditos: -1000 }, out: 'Duermes mejor. Todo mejora un poco.' },
        { t: 'Terapia con un especialista', fx: { cordura: 18, creditos: -6000 }, out: 'Hablar funciona. Quién lo diría.' },
        { t: 'Chequeo médico completo', fx: { salud: 8, creditos: -4000, intelecto: 3 }, chequeo: true, out: '' },
        { t: 'Vicios y noches largas', fx: { salud: -12, cordura: 10, carisma: 6, creditos: -5000 }, out: 'Un año memorable del que recuerdas poco.' }
      ]
    },
    {
      id: 'sa_implante', min: 18, max: 200, w: 6,
      t: 'Una clínica de mejoras cibernéticas te enseña el catálogo.',
      c: [
        { t: 'Ojo cibernético (percepción)', fx: { creditos: -22000, intelecto: 8, destreza: 6, carisma: -4 }, cibernetica: 'ojo', out: 'Ves espectros que no deberías ver.' },
        { t: 'Brazo reforzado (fuerza)', fx: { creditos: -30000, destreza: 12, salud: 8, carisma: -5 }, cibernetica: 'brazo', out: 'Abolla las puertas al abrirlas.' },
        { t: 'Pulmones sintéticos (resistencia)', fx: { creditos: -35000, salud: 18 }, cibernetica: 'pulmones', out: 'Respiras en atmósferas que matarían a otro.' },
        { t: 'Nada de metal en el cuerpo', fx: { cordura: 6, fuerza: 4 }, out: 'Prefieres envejecer entero.' }
      ]
    },
    {
      id: 'sa_adiccion', min: 16, max: 200, w: 5, req: function (s) { return s.stats.cordura < 45; },
      t: 'La especia dejó de ser una salida y empezó a ser una rutina.',
      c: [
        { t: 'Desintoxicación completa', fx: { creditos: -12000, salud: 10, cordura: 15, destreza: -5 }, quitarFlag: 'adicto', out: 'Nueve semanas horribles. Sales del otro lado.' },
        { t: 'Reducir poco a poco', r: [
          { p: 0.5, t: 'Funciona.', fx: { cordura: 8, salud: 5 } },
          { p: 0.5, t: 'No funciona.', fx: { salud: -10, cordura: -8 }, flag: 'adicto' }
        ] },
        { t: 'Seguir así', fx: { salud: -15, cordura: -10, creditos: -8000 }, flag: 'adicto', out: 'Funciona hasta que no.' }
      ]
    }
  ]

  };

  /* ============================================================
     GENERADORES PROCEDURALES
     Cada uno construye eventos únicos combinando datos del mundo.
     Aquí es donde el espacio de decisiones se dispara.
     ============================================================ */
  SW.GEN = SW.GEN || {};
  Object.assign(SW.GEN, {

    /* --- Contratos de los bajos fondos / gremio --- */
    contrato: function (rng, s) {
      const objetivo = SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'rodiano', 'zabrak']));
      const mundo = rng.pick(SW.MUNDO_NOMBRES);
      const lugar = rng.pick(SW.LUGARES);
      const tipos = [
        { v: 'capturar vivo a', dif: 55, pago: 1.0, al: -4 },
        { v: 'eliminar a', dif: 65, pago: 1.6, al: -20 },
        { v: 'recuperar una carga robada por', dif: 45, pago: 0.8, al: -2 },
        { v: 'escoltar y proteger a', dif: 40, pago: 0.7, al: 6 },
        { v: 'intimidar (sin marcas) a', dif: 35, pago: 0.5, al: -10 },
        { v: 'sacar del planeta a', dif: 50, pago: 0.9, al: 8 },
        { v: 'sustituir con un doble a', dif: 70, pago: 1.4, al: -8 },
        { v: 'robar los archivos personales de', dif: 45, pago: 0.85, al: -6 }
      ];
      const tipo = rng.pick(tipos);
      const cliente = rng.pick(SW.FACCIONES);
      const base = Math.round((8000 + rng.int(0, 40000)) * tipo.pago * (1 + s.edad / 120));
      return {
        id: 'gen_contrato', gen: true,
        t: 'CONTRATO — ' + cliente.n + ' paga ' + SW.U.cr(base) + ' por ' + tipo.v + ' <b>' + objetivo + '</b>, visto por última vez en ' + lugar + ', ' + mundo + '.',
        c: [
          { t: 'Aceptar y hacerlo a tu manera', combate: { dif: tipo.dif, botin: base, contrato: true }, fx: { alineamiento: tipo.al }, faccion: cliente.id + '+10' },
          { t: 'Aceptar y buscar un atajo (planificar)', r: [
            { p: 0.55, t: 'Encuentras el punto débil y sale limpio.', fx: { creditos: base, intelecto: 8, alineamiento: tipo.al, notoriedad: 6 }, contador: { cazas: 1 } },
            { p: 0.45, t: 'El atajo era una trampa.', fx: { salud: -20, creditos: -3000, notoriedad: 8 } }
          ] },
          { t: 'Aceptar y luego avisar al objetivo', fx: { creditos: Math.round(base * 0.4), alineamiento: 15, reputacion: 8 }, faccion: cliente.id + '-20', out: objetivo + ' te paga menos que el cliente, pero te debe la vida.' },
          { t: 'Rechazar el contrato', fx: {}, faccion: cliente.id + '-4', out: 'Hay contratos que no se firman.' }
        ]
      };
    },

    /* --- Rutas de carga --- */
    ruta: function (rng, s) {
      const origen = s.mundo;
      const destino = rng.pick(SW.MUNDO_NOMBRES.filter(function (m) { return m !== origen; }));
      const cargas = [
        { n: 'grano procesado', p: 1.0, r: 0.1, leg: true },
        { n: 'piezas de droide', p: 1.4, r: 0.2, leg: true },
        { n: 'medicinas de bacta', p: 1.8, r: 0.25, leg: true },
        { n: 'armas registradas', p: 2.6, r: 0.45, leg: true },
        { n: 'especia glitterstim', p: 4.5, r: 0.7, leg: false },
        { n: 'pasajeros sin registrar', p: 3.2, r: 0.6, leg: false },
        { n: 'reliquias sin procedencia', p: 5.0, r: 0.65, leg: false },
        { n: 'un contenedor sellado que no puedes abrir', p: 3.8, r: 0.55, leg: false },
        { n: 'animales vivos', p: 2.2, r: 0.4, leg: true },
        { n: 'combustible de coaxium', p: 6.0, r: 0.8, leg: true }
      ];
      const carga = rng.pick(cargas);
      const dist = rng.int(2, 9);
      const pago = Math.round(3000 * dist * carga.p);
      return {
        id: 'gen_ruta', gen: true,
        t: 'RUTA — ' + origen + ' → <b>' + destino + '</b> (' + dist + ' saltos). Carga: ' + carga.n + '. Flete: ' + SW.U.cr(pago) + '.',
        c: [
          { t: 'Ruta directa y rápida', r: [
            { p: 1 - carga.r * 0.7, t: 'Entrega puntual.', fx: { creditos: pago, destreza: 3 }, mueveA: destino, contador: { rutas: 1 } },
            { p: carga.r * 0.7, t: 'Inspección en el destino.', fx: { creditos: -Math.round(pago * 0.5), notoriedad: 12 }, mueveA: destino }
          ] },
          { t: 'Rodeo por rutas no cartografiadas', r: [
            { p: 0.65, t: 'Nadie te ve. Llegas tarde y entero.', fx: { creditos: Math.round(pago * 0.85), intelecto: 5 }, mueveA: destino, contador: { rutas: 1 } },
            { p: 0.35, t: 'Piratas.', combate: { dif: 55, botin: Math.round(pago * 0.5) }, mueveA: destino }
          ] },
          { t: 'Vender la carga en el mercado negro a mitad de camino', fx: { creditos: Math.round(pago * 1.8), notoriedad: 15, alineamiento: -12 }, mueveA: destino, out: 'El cliente original no lo olvida.' },
          { t: 'Rechazar el flete', fx: {}, out: 'Otro capitán se lo lleva.' }
        ]
      };
    },

    /* --- Encuentros de acción --- */
    accion: function (rng, s) {
      const enemigos = [
        { n: 'una banda de piratas weequay', dif: 45 },
        { n: 'un cazarrecompensas trandoshano', dif: 60 },
        { n: 'una patrulla de soldados imperiales', dif: 55 },
        { n: 'un droide de combate reprogramado', dif: 50 },
        { n: 'un guerrero mandaloriano con deudas', dif: 70 },
        { n: 'un asesino del Sol Negro', dif: 65 },
        { n: 'un antiguo compañero de armas', dif: 58 },
        { n: 'un inquisidor', dif: 85 },
        { n: 'una bruja de Dathomir', dif: 75 },
        { n: 'un campeón de arena retirado', dif: 62 },
        { n: 'tres matones con muy mala coordinación', dif: 30 },
        { n: 'algo que no tiene nombre en ningún archivo', dif: 90 }
      ];
      const e = rng.pick(enemigos);
      const lugar = rng.pick(SW.LUGARES);
      const botin = rng.int(3000, 40000);
      return {
        id: 'gen_accion', gen: true,
        t: 'Te cruzas con ' + e.n + ' en ' + lugar + '. No hay forma elegante de salir de esto.',
        c: [
          { t: 'Atacar primero', combate: { dif: e.dif - 8, botin: botin } },
          { t: 'Esperar y contraatacar', combate: { dif: e.dif + 5, botin: Math.round(botin * 1.5) } },
          { t: 'Intentar hablar', r: [
            { p: 0.4, t: 'Contra todo pronóstico, funciona.', fx: { carisma: 12, reputacion: 6 } },
            { p: 0.6, t: 'No funciona.', combate: { dif: e.dif + 10, botin: botin } }
          ] },
          { t: 'Retirada táctica', r: [
            { p: 0.6, t: 'Sales de ahí.', fx: { destreza: 5, cordura: -3 } },
            { p: 0.4, t: 'Te alcanzan.', fx: { salud: -18, creditos: -4000 } }
          ] }
        ]
      };
    },

    /* --- Dogfight espacial --- */
    dogfight: function (rng, s) {
      const enem = rng.pick(['un escuadrón de TIEs', 'dos cazas piratas', 'un interceptor solitario muy bueno', 'cuatro cazas de la Confederación', 'un caza mandaloriano', 'una lanzadera armada']);
      const dif = rng.int(40, 80);
      return {
        id: 'gen_dogfight', gen: true,
        t: 'Combate espacial contra ' + enem + '. Los escudos aguantan lo que aguantan.',
        c: [
          { t: 'Combate frontal', dogfight: { dif: dif } },
          { t: 'Meterlos en un campo de asteroides', dogfight: { dif: dif - 12, riesgoNave: 25 } },
          { t: 'Fingir avería y girar en el último momento', dogfight: { dif: dif - 5, riesgoPropio: 15 } },
          { t: 'Huir al hiperespacio', r: [
            { p: 0.65, t: 'Saltas a tiempo.', fx: { destreza: 4 } },
            { p: 0.35, t: 'Te alcanzan antes del salto.', fx: { salud: -15 }, naveEstado: -25 }
          ] }
        ]
      };
    },

    /* --- Ofertas de empleo generadas --- */
    empleo: function (rng, s, filtro) {
      let pool = SW.CARRERAS.slice();
      if (filtro === 'legal') pool = pool.filter(function (c) { return !c.ilegal; });
      if (filtro === 'ilegal') pool = pool.filter(function (c) { return c.ilegal || c.fam === 'crimen'; });
      const apto = pool.filter(function (c) {
        const r = c.req || {};
        for (const k in r) if ((s.stats[k] || 0) < r[k]) return false;
        return true;
      });
      const lista = (apto.length ? apto : pool).slice();
      const opciones = rng.pickN(lista, Math.min(4, lista.length)).map(function (c) {
        const sueldo = Math.round(c.sueldoBase * (0.7 + rng.next() * 0.8));
        return {
          t: c.n + ' — ' + SW.U.cr(sueldo) + '/año',
          sub: c.desc,
          empleo: { id: c.id, sueldo: sueldo }
        };
      });
      opciones.push({ t: '◂ Ninguna de estas', volver: true });
      return { id: 'gen_empleo', gen: true, esMenu: true, t: 'Ofertas disponibles este año:', c: opciones };
    }
  });

})(window);

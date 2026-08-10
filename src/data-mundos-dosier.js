/* ============================================================
   HOLOVIDA :: DOSIER DE CADA MUNDO
   Cada planeta tiene sus bichos, sus peligros, sus mafias, sus
   monumentos, lo que se compra y se vende, quién manda, qué
   tiempo hace, qué se come y cómo se llama a la gente de aquí.
   Esto es lo que hace que un evento en Tatooine no se parezca
   en nada al mismo evento en Csilla.
   Claves:  cri criaturas | pel peligros | fac facciones
            hit hitos     | bie bienes   | aut autoridad
            cli clima     | com comida   | gen gente
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ---- fondo de armario por bioma: nada se queda sin rellenar ---- */
  SW.DOSIER_BIOMA = {
    ciudad: {
      cri: ['una rata de conducto', 'un enjambre de escarabajos de cableado', 'un perro de guardia modificado', 'una colonia de pájaros de antena', 'un tooka callejero', 'un lagarto de tubería', 'una paloma de neón', 'un roedor de vertedero'],
      pel: ['un incendio de nivel', 'una redada de la patrulla', 'un derrumbe de pasarela', 'una banda que cobra peaje'],
      fac: ['el sindicato de estibadores', 'la patrulla municipal', 'una banda de barrio', 'el gremio de constructores'],
      hit: ['la torre de comunicaciones', 'el mercado cubierto', 'el viaducto viejo', 'la plaza de los generadores'],
      bie: ['piezas recuperadas', 'permisos falsificados', 'raciones prensadas', 'células de energía'],
      aut: 'el prefecto de sector', cli: ['lluvia ácida ligera', 'esmog naranja', 'un apagón de cuatro horas'],
      com: ['fideos de puesto callejero', 'proteína prensada', 'café de conducto'],
      gen: ['los obreros de turno', 'los chatarreros', 'los funcionarios de bajo rango', 'gente de los niveles bajos']
    },
    desierto: {
      cri: ['un lagarto de carga', 'una serpiente de arena', 'un enjambre de moscas de sal', 'un carroñero de dunas', 'un escorpión de dunas', 'un ave carroñera', 'una bestia de carga con joroba', 'un roedor de madriguera'],
      pel: ['una tormenta de arena', 'la insolación del mediodía', 'un pozo seco', 'bandidos de las rutas'],
      fac: ['los clanes de las dunas', 'los caravaneros', 'el cártel del agua', 'una milicia de colonos'],
      hit: ['el mar de dunas', 'la roca partida', 'el pozo profundo', 'las ruinas medio enterradas'],
      bie: ['agua condensada', 'sal', 'piezas de vaporizador', 'especia de paso'],
      aut: 'quien tenga más agua', cli: ['un sol que raja la piel', 'una noche de helada', 'viento con arena tres días'],
      com: ['carne seca', 'pan de raíz', 'agua racionada con sabor a metal'],
      gen: ['los granjeros de humedad', 'las nómadas', 'los chatarreros', 'los caravaneros']
    },
    hielo: {
      cri: ['un depredador de nieve', 'una manada de bestias de carga peludas', 'un pez de agujero de hielo', 'algo blanco que no ves hasta que lo tienes encima', 'una liebre de nieve', 'un ave de glaciar', 'un lobo blanco', 'una foca de agujero'],
      pel: ['una ventisca de dos días', 'una grieta bajo la nieve', 'la congelación', 'una avalancha'],
      fac: ['los guías de glaciar', 'el consejo de la colonia', 'los mineros de hielo', 'unos furtivos'],
      hit: ['la lengua del glaciar', 'la ciudad bajo el hielo', 'el paso del viento', 'un lago congelado del tamaño de un mar'],
      bie: ['pieles', 'hielo de agua pura', 'combustible térmico', 'mineral de veta fría'],
      aut: 'el consejo de la colonia', cli: ['ventisca', 'sol que no calienta', 'noche de seis meses'],
      com: ['guiso graso', 'licor que quema al bajar', 'carne curada al frío'],
      gen: ['gente del hielo', 'los mineros', 'los guías', 'los colonos tercos']
    },
    oceano: {
      cri: ['un banco de peces plateados', 'algo grande que pasa por debajo', 'un molusco del tamaño de una casa', 'una anguila de arrecife', 'un cangrejo de roca', 'una raya de fondo', 'un ave marina', 'un pulpo de grieta'],
      pel: ['una marejada', 'una fuga en un domo', 'la presión a según qué profundidad', 'piratas de costa'],
      fac: ['el gremio de buceadores', 'los astilleros flotantes', 'el consejo de mareas', 'los pescadores armados'],
      hit: ['la ciudad sumergida', 'el arrecife grande', 'el faro viejo', 'la fosa'],
      bie: ['perlas', 'pescado seco', 'algas medicinales', 'sal fina'],
      aut: 'el consejo de mareas', cli: ['temporal', 'niebla de mar', 'calma que da mala espina'],
      com: ['pescado crudo con cítrico', 'sopa de alga', 'licor salado'],
      gen: ['gente de costa', 'los buceadores', 'los anfibios', 'los armadores']
    },
    volcanico: {
      cri: ['un lagarto de lava', 'insectos que anidan en la ceniza', 'algo que solo sale de noche', 'un carroñero de escoria', 'una salamandra de fisura', 'un escarabajo de ceniza', 'un murciélago de galería', 'un ave de humo'],
      pel: ['una colada nueva', 'gas de fisura', 'ceniza que tapa el cielo un mes', 'un derrumbe de galería'],
      fac: ['la compañía minera', 'el gremio de capataces', 'los sindicatos de galería', 'unos okupas de las cuevas'],
      hit: ['el río de lava', 'la mina profunda', 'el campo de obsidiana', 'la fundición'],
      bie: ['obsidiana', 'mineral raro', 'aleación de fundición', 'trajes térmicos'],
      aut: 'el capataz de la compañía', cli: ['lluvia de ceniza', 'calor que quema al respirar', 'cielo naranja'],
      com: ['pan cocido en piedra', 'carne a la brasa de fisura', 'agua filtrada cara'],
      gen: ['los mineros', 'los fundidores', 'los capataces', 'gente quemada por el trabajo']
    },
    jungla: {
      cri: ['un felino de copas', 'un insecto del tamaño de un brazo', 'una serpiente colgada', 'un herbívoro enorme y sordo', 'una rana de lluvia', 'un mono de dosel', 'una mariposa enorme', 'un jabalí de sotobosque'],
      pel: ['una fiebre de humedad', 'una planta que muerde', 'perderte doscientos metros de casa', 'esclavistas'],
      fac: ['los clanes de las copas', 'una compañía maderera', 'los cazadores', 'los que viven abajo'],
      hit: ['el árbol grande', 'el claro de las ruinas', 'el río bajo el dosel', 'el puente de lianas'],
      bie: ['madera noble', 'resina', 'pieles', 'plantas medicinales'],
      aut: 'el jefe de clan', cli: ['lluvia todos los días a la misma hora', 'humedad que pudre la ropa', 'niebla baja'],
      com: ['fruta que solo se da aquí', 'carne ahumada', 'infusión amarga'],
      gen: ['gente de las copas', 'los cazadores', 'los madereros', 'los clanes del río']
    },
    templado: {
      cri: ['un animal de tiro', 'aves de campo', 'un depredador que se lleva el ganado', 'un bicho de granero', 'un zorro de campo', 'una liebre', 'un ave de rapiña', 'un ciervo joven'],
      pel: ['una mala cosecha', 'una leva forzosa', 'una helada fuera de tiempo', 'bandidos de camino'],
      fac: ['el consejo del pueblo', 'los terratenientes', 'la guarnición', 'una cooperativa de granjeros'],
      hit: ['la colina de la torre', 'el molino', 'el puente de piedra', 'la plaza del mercado'],
      bie: ['grano', 'lana', 'herramienta de labranza', 'licor de la comarca'],
      aut: 'el consejo del pueblo', cli: ['una tormenta de primavera', 'sequía', 'un verano largo y bueno'],
      com: ['pan del día', 'estofado', 'vino de la comarca'],
      gen: ['los granjeros', 'los artesanos', 'gente del pueblo', 'los jornaleros']
    },
    pantano: {
      cri: ['una babosa del tamaño de un bote', 'nubes de insectos', 'algo que respira bajo el agua', 'una anguila de barro', 'una rana de barro', 'una garza de ciénaga', 'un caimán de laguna', 'un mosquito enorme'],
      pel: ['fiebre de ciénaga', 'arenas movedizas', 'gas que sale del barro', 'perder el camino de noche'],
      fac: ['los recolectores', 'una refinería', 'los que hacen de guía', 'contrabandistas de ruta'],
      hit: ['el árbol hueco', 'la pasarela vieja', 'la laguna quieta', 'el embarcadero'],
      bie: ['raíces medicinales', 'combustible turbio', 'pieles curtidas', 'huevos de bicho'],
      aut: 'el que tiene la barca grande', cli: ['lluvia tibia constante', 'niebla a ras de agua', 'un calor que pesa'],
      com: ['guiso de raíz', 'carne de ciénaga', 'licor turbio'],
      gen: ['gente de la ciénaga', 'los recolectores', 'los guías', 'los refineros']
    },
    gaseoso: {
      cri: ['una medusa de nube', 'aves de corriente térmica', 'un bicho que vive en la tubería', 'algo enorme y lento entre las capas', 'un beldon joven', 'un ave de corriente', 'un velker solitario', 'una medusa de capa alta'],
      pel: ['una caída sin fondo', 'una fuga de gas', 'una plataforma que cede', 'vientos de capa baja'],
      fac: ['la administración de la ciudad', 'el gremio de mineros de gas', 'los tycoons', 'una banda de plataforma'],
      hit: ['la plataforma grande', 'el mirador de nubes', 'los refinadores', 'el ascensor de capa'],
      bie: ['gas tibanna', 'aleaciones ligeras', 'licor de altura', 'seguros de plataforma'],
      aut: 'el administrador de la ciudad', cli: ['atardecer que dura horas', 'tormenta de capa', 'niebla dorada'],
      com: ['fruta importada carísima', 'sopa caliente en el turno', 'destilado local'],
      gen: ['gente de plataforma', 'los mineros de gas', 'los administrativos', 'los ricos de paso']
    },
    rocoso: {
      cri: ['una cabra de risco', 'un carroñero alado', 'algo que anida en las grietas', 'un reptil de piedra', 'una cabra montesa', 'un águila de risco', 'un lagarto de grieta', 'un murciélago de cueva'],
      pel: ['un desprendimiento', 'perder pie en el cañón', 'una tormenta seca', 'saqueadores de ruinas'],
      fac: ['los guardianes del sitio', 'una expedición forastera', 'los clanes del cañón', 'una patrulla'],
      hit: ['el cañón grande', 'las ruinas de la meseta', 'la cueva alta', 'el monolito'],
      bie: ['mineral', 'reliquias', 'agua de cisterna', 'cuerda y equipo de escalada'],
      aut: 'los ancianos del clan', cli: ['viento que no para', 'cielo limpio y frío', 'polvo en suspensión'],
      com: ['pan duro', 'carne de risco', 'té fuerte'],
      gen: ['gente del cañón', 'los guardianes', 'los buscadores', 'los pastores de altura']
    }
  };

  /* ============================================================
     LOS 117 MUNDOS, UNO A UNO
     ============================================================ */
  SW.DOSIER = {

  /* ═══════════ NÚCLEO Y NÚCLEO PROFUNDO ═══════════ */
  'Coruscant': {
    cri: ['una rata de conducto del tamaño de un gato', 'los pájaros de antena del nivel 300', 'un perro de guardia con implantes', 'los granx de alcantarilla'],
    pel: ['una redada de la Guardia', 'un tramo de pasarela sin barandilla', 'una banda que cobra por pasar', 'un incendio de veinte niveles'],
    fac: ['la Guardia de Coruscant', 'el Sol Negro', 'el gremio de transportistas', 'los Aguja Roja del 1313'],
    hit: ['la Plaza del Senado', 'el Templo Jedi', 'la Ópera Galaxies', 'el Monumento a Contispex', 'el nivel 1313'],
    bie: ['permisos de residencia', 'datos robados', 'plazas de aparcamiento aéreo', 'especia cortada'],
    aut: 'el Canciller y catorce capas de burocracia debajo',
    cli: ['lluvia reciclada entre los niveles', 'un cielo que nadie del nivel bajo ha visto', 'calor de motor a las tres de la mañana'],
    com: ['fideos nerf de puesto de pasarela', 'café de Corellia carísimo', 'raciones del subsidio'],
    gen: ['los funcionarios', 'gente de los bajos niveles', 'los senadores y su gente', 'los aliens de mil especies']
  },
  'Corellia': {
    cri: ['los perros de astillero', 'las gaviotas de dársena', 'los ratones de bodega', 'un pájaro que anida en las grúas'],
    pel: ['una grúa que suelta la carga', 'la Aduana Imperial', 'las Cabezas Blancas', 'un tren de mineral sin frenos'],
    fac: ['los Cabezas Blancas de Lady Proxima', 'Ingeniería Corelliana', 'el sindicato de astilleros', 'los pilotos de la Espina'],
    hit: ['los astilleros de Coronet', 'la Espina de Corellia', 'la dársena seca número siete', 'el barrio de Kor Vella'],
    bie: ['motores de segunda', 'coaxium', 'placas de casco', 'permisos de vuelo'],
    aut: 'el gremio de astilleros, y la Aduana cuando le apetece',
    cli: ['llovizna de puerto', 'un viento que huele a soldadura', 'días grises que no acaban'],
    com: ['guiso de dársena', 'whisky corelliano', 'pan frito de turno de noche'],
    gen: ['los soldadores', 'los pilotos', 'los chavales de banda', 'los capataces']
  },
  'Alderaan': {
    cri: ['los thranta que planean sobre los valles', 'ciervos de montaña', 'aves cantoras que solo hay aquí', 'nerfs de pasto alto'],
    pel: ['una tormenta de montaña', 'una discusión de política mal llevada', 'la altura si no sabes andarla', 'nada más, y eso es raro'],
    fac: ['la Casa Organa', 'el Consejo de Ancianos', 'la Universidad de Aldera', 'los gremios artesanos'],
    hit: ['el palacio de Aldera', 'las montañas Juran', 'el lago de la ciudad', 'la biblioteca de la Casa'],
    bie: ['instrumentos', 'obra de arte', 'vino de valle', 'libros de verdad, en papel'],
    aut: 'la Casa Organa y el Consejo',
    cli: ['primaveras que dan ganas de vivir', 'nieve limpia en las cumbres', 'tormentas cortas y bonitas'],
    com: ['pan de horno de piedra', 'queso de montaña', 'vino de las terrazas'],
    gen: ['los músicos', 'gente educada de una forma que se nota', 'los pastores de altura', 'los estudiantes']
  },
  'Chandrila': {
    cri: ['aves migratorias por millones', 'peces de lago', 'ciervos de reserva', 'insectos de polen dorados'],
    pel: ['un escándalo que te salpica', 'una comisión de investigación', 'la carretera de la costa con niebla', 'muy poco más'],
    fac: ['la Asamblea', 'la prensa de Hanna', 'las familias de la costa', 'una ONG con más poder del que parece'],
    hit: ['la Ciudad de Hanna', 'el anfiteatro al aire libre', 'los acantilados de Silver Sea', 'la sede de la Asamblea'],
    bie: ['información política', 'vino blanco', 'servicios legales', 'obra publicada'],
    aut: 'la Asamblea, y quien le paga la campaña',
    cli: ['veranos de postal', 'niebla de costa por la mañana', 'lluvia fina de otoño'],
    com: ['pescado a la parrilla', 'ensalada de la costa', 'vino blanco frío'],
    gen: ['los políticos', 'los periodistas', 'los profesores', 'gente con buenos modales y peores intenciones']
  },
  'Kuat': {
    cri: ['nada vivo en los anillos, solo droides', 'aves de reserva en la superficie', 'caballos de las fincas', 'insectos importados por un noble'],
    pel: ['un fallo de presión en el anillo', 'una purga de plantilla', 'un accidente de soldadura orbital', 'las intrigas de las Casas'],
    fac: ['Astilleros de Kuat', 'las Casas Nobles', 'el sindicato orbital', 'la seguridad corporativa'],
    hit: ['el Anillo de Astilleros', 'las fincas de la superficie', 'el dique seco de destructores', 'la Casa Kuat'],
    bie: ['acciones', 'chapa de blindaje', 'contratos militares', 'caballos de raza'],
    aut: 'la Familia Kuat y su Consejo',
    cli: ['no hay clima en el anillo, solo turnos', 'primaveras controladas abajo', 'días de trabajo iguales'],
    com: ['comedor de plantilla', 'banquete de Casa si te invitan', 'estimulantes de turno'],
    gen: ['los soldadores orbitales', 'los nobles', 'los ingenieros', 'gente que hereda o gente que suelda']
  },
  'Mon Cala': {
    cri: ['un knowledge bank de coral vivo', 'peces vela', 'una criatura enorme que pasa por debajo de la ciudad', 'quarren que no saludan'],
    pel: ['una fuga en un domo', 'la política mon calamari–quarren', 'la presión a mil metros', 'un depredador de fosa'],
    fac: ['el Consejo de la Corona', 'los sindicatos quarren', 'los astilleros mon calamari', 'los buceadores de fosa'],
    hit: ['la ciudad-catedral sumergida', 'los astilleros flotantes', 'la fosa profunda', 'el arrecife del rey'],
    bie: ['perlas', 'diseño naval', 'algas cultivadas', 'coral tallado'],
    aut: 'el Rey y el Consejo, cuando se ponen de acuerdo',
    cli: ['el sol filtrado a treinta metros', 'temporales de superficie', 'corrientes frías del norte'],
    com: ['pescado crudo con cítrico', 'sopa de alga espesa', 'huevas'],
    gen: ['los mon calamari', 'los quarren', 'los buceadores', 'los constructores de naves']
  },
  'Duro': {
    cri: ['nada en la superficie: está muerta', 'bacterias industriales', 'droides de mantenimiento', 'un pájaro que alguien metió de contrabando'],
    pel: ['bajar a la superficie sin traje', 'un fallo de estación', 'una huelga que acaba mal', 'una fuga de refrigerante'],
    fac: ['los consorcios orbitales', 'el gremio de navegantes duros', 'los sindicatos de estación', 'la Federación de Comercio'],
    hit: ['las ciudades orbitales', 'la superficie envenenada', 'el gran ascensor', 'el astillero de la órbita baja'],
    bie: ['cartas de navegación', 'química industrial', 'chatarra de superficie', 'permisos de atraque'],
    aut: 'el consorcio que te tenga contratado',
    cli: ['dentro, siempre 21 grados', 'abajo, tóxico', 'la vista de un planeta gris a través del cristal'],
    com: ['comida sintética buena de verdad', 'té duros', 'raciones de estación'],
    gen: ['los duros', 'los navegantes', 'gente que nunca ha pisado tierra', 'los técnicos de estación']
  },
  'Muunilinst': {
    cri: ['aves de jardín corporativo', 'peces de estanque de banco', 'perros de seguridad', 'muy poco fuera de un macetero'],
    pel: ['una auditoría', 'deber dinero aquí', 'un ejecutivo con recursos', 'la ejecución de una garantía'],
    fac: ['el Clan Bancario Intergaláctico', 'las Casas de crédito menores', 'los tasadores', 'la seguridad muun'],
    hit: ['la catedral-banco de Harnaidan', 'la cámara de las cuentas', 'el jardín de los fundadores', 'la bóveda'],
    bie: ['crédito', 'deuda ajena', 'metales de reserva', 'información financiera'],
    aut: 'el Clan Bancario. Aquí no hay otra',
    cli: ['templado y aburrido a propósito', 'lluvia programada', 'días sin sobresaltos'],
    com: ['comida cara y sosa', 'café de negociación', 'agua embotellada de otro planeta'],
    gen: ['los muun', 'los contables', 'los tasadores', 'gente que te sonríe mientras calcula']
  },
  'Tython': {
    cri: ['aves de risco', 'algo que se mueve en las ruinas', 'ciervos de montaña muy poco asustadizos', 'insectos que zumban en un tono raro'],
    pel: ['tormentas de la Fuerza', 'un precipicio con niebla', 'la soledad', 'lo que dejaron enterrado los Je\'daii'],
    fac: ['nadie vive aquí ya', 'algún peregrino', 'una expedición arqueológica', 'los que no quieren que se excave'],
    hit: ['los templos Je\'daii', 'el Puente de la Balanza', 'las cumbres sagradas', 'el valle donde empezó todo'],
    bie: ['nada que vender', 'reliquias si eres de ese tipo', 'agua de manantial', 'silencio'],
    aut: 'ninguna, y se nota',
    cli: ['tormentas que no son solo tormentas', 'un cielo demasiado limpio', 'viento que suena a voces'],
    com: ['lo que lleves', 'raíces', 'agua de deshielo'],
    gen: ['los peregrinos', 'los arqueólogos', 'los ermitaños', 'nadie']
  },
  'Dorin': {
    cri: ['criaturas de viento que no tienen forma fija', 'aves de helio', 'nada que respire como tú', 'algo grande entre las corrientes'],
    pel: ['la atmósfera: te mata en un minuto sin máscara', 'una corriente descendente', 'quedarte sin filtro', 'la presión de altura'],
    fac: ['la Orden Baran Do', 'el consejo de templos', 'los guías de viento', 'los kel dor de la ciudad alta'],
    hit: ['los templos de viento', 'la ciudad de las corrientes', 'el santuario Baran Do', 'el mirador sin barandilla'],
    bie: ['máscaras y filtros', 'gas noble', 'enseñanza', 'cristal de altura'],
    aut: 'los Sabios Baran Do',
    cli: ['viento que canta contra los templos', 'aire que no puedes respirar', 'cielo naranja permanente'],
    com: ['lo que se come con máscara puesta, o sea, poco en público', 'infusión de raíz', 'pasta nutritiva'],
    gen: ['los kel dor', 'los monjes del viento', 'los guías', 'los forasteros con máscara']
  },

  /* ═══════════ BORDE INTERIOR ═══════════ */
  'Mandalore': {
    cri: ['un strill que huele a tres kilómetros', 'un shriek-hawk de los cañones', 'un mythosaurio, si crees en eso', 'un lagarto de ceniza'],
    pel: ['un duelo que no puedes rechazar', 'el desierto de cristal fuera del domo', 'una guerra civil más', 'la Guardia de la Muerte'],
    fac: ['la Guardia de la Muerte', 'los Nuevos Mandalorianos', 'el Clan Wren', 'los Hijos de la Guardia', 'la Casa Vizsla'],
    hit: ['Sundari bajo el domo', 'la Forja', 'el Gran Foso', 'el desierto de cristal', 'la Tumba de los Reyes'],
    bie: ['beskar', 'armadura de segunda mano con historia', 'contratos de mercenario', 'señales de clan'],
    aut: 'el que lleve el Sable Oscuro, cuando hay alguien que lo lleve',
    cli: ['ceniza que cae como nieve sucia', 'viento de cristal fuera del domo', 'aire limpio y controlado dentro'],
    com: ['tiingilar picante hasta llorar', 'ne\'tra gal, cerveza negra', 'uj\'alayi, el pastel'],
    gen: ['los guerreros', 'los herreros de beskar', 'los huérfanos adoptados por el Credo', 'los pacifistas que aquí lo tienen difícil']
  },
  'Cato Neimoidia': {
    cri: ['aves de puente que anidan en los cables', 'insectos de nube', 'nada en la superficie, nadie baja', 'un bicho que se come el revestimiento'],
    pel: ['un puente que cede por el peso del oro', 'una purga de la Federación', 'caer', 'un contrato con letra pequeña'],
    fac: ['la Federación de Comercio', 'las casas de subastas', 'los gremios de puente', 'la guardia neimoidiana'],
    hit: ['las ciudades colgantes', 'la bóveda de las subastas', 'el puente grande', 'los viñedos de niebla'],
    bie: ['vino de niebla', 'contratos', 'oro literal', 'derechos de paso'],
    aut: 'el virrey del sector, o quien le compre el puesto',
    cli: ['niebla espesa bajo los puentes', 'sol arriba, nada abajo', 'viento que hace cantar los cables'],
    com: ['vino de niebla carísimo', 'banquetes largos', 'comida que se sirve fría a propósito'],
    gen: ['los neimoidianos', 'los subastadores', 'gente de puente', 'los contables']
  },
  'Onderon': {
    cri: ['un drexl que caza de noche', 'bestias voladoras de monta', 'felinos de la jungla', 'insectos que zumban en la muralla'],
    pel: ['salir de la muralla al anochecer', 'la guerra civil de siempre', 'una bestia sin jinete', 'la guarnición'],
    fac: ['la Corona de Iziz', 'los rebeldes de la jungla', 'los jinetes de bestias', 'la guarnición ocupante'],
    hit: ['la muralla de Iziz', 'la jungla que empieza donde acaba la muralla', 'el palacio', 'los criaderos de bestias'],
    bie: ['bestias de monta', 'armas de contrabando', 'pieles', 'medicinas de la jungla'],
    aut: 'quien tenga el palacio esta semana',
    cli: ['calor húmedo', 'tormentas de la tarde', 'noches en las que se oye todo'],
    com: ['carne asada en la muralla', 'fruta de jungla', 'licor fuerte'],
    gen: ['los jinetes', 'gente de la muralla', 'los rebeldes', 'los soldados de guarnición']
  },
  'Dxun': {
    cri: ['un cannok que se come cualquier cosa', 'un zakkeg del tamaño de un carro', 'un boma de la manada', 'un maalraas que caza en silencio'],
    pel: ['todo. Literalmente todo lo que hay aquí quiere comerte', 'la noche', 'quedarte sin munición', 'la lluvia que borra tu rastro y el suyo no'],
    fac: ['nadie tiene esta luna', 'restos de una expedición', 'los mandalorianos que acamparon aquí una vez', 'cazadores de trofeos'],
    hit: ['las ruinas del campamento mandaloriano', 'el templo bajo la selva', 'el claro de los huesos', 'el puente natural a Onderon'],
    bie: ['trofeos', 'colmillos', 'nada más que valga la pena', 'lo que le quites a un cadáver'],
    aut: 'la cadena alimentaria',
    cli: ['lluvia constante', 'una noche que dura demasiado', 'niebla que huele a animal'],
    com: ['lo que caces', 'raíces si sabes cuáles', 'agua hervida siempre'],
    gen: ['los cazadores', 'los supervivientes', 'gente que no debería estar aquí', 'nadie estable']
  },
  'Serenno': {
    cri: ['ciervos de coto', 'aves de cetrería', 'perros de jauría', 'un depredador que los condes cazan por deporte'],
    pel: ['una intriga de condado', 'un duelo formal', 'la caza si te toca ser presa', 'los impuestos de la Casa'],
    fac: ['la Casa Dooku', 'los condados menores', 'el gremio de mayordomos', 'los separatistas, luego'],
    hit: ['el castillo del conde', 'los bosques del coto', 'la sala de retratos', 'el mausoleo de la Casa'],
    bie: ['tierra', 'obra de arte muy vieja', 'títulos', 'vino de bodega centenaria'],
    aut: 'el Conde. El de turno',
    cli: ['otoños largos y dorados', 'niebla en el coto', 'inviernos secos'],
    com: ['caza mayor', 'vino de la bodega vieja', 'pan de la casa'],
    gen: ['los condes', 'los monteros', 'los criados de generaciones', 'gente que sabe su sitio']
  },
  'Zeltros': {
    cri: ['aves de plumaje absurdo', 'peces de estanque de fiesta', 'un felino doméstico carísimo', 'insectos que brillan de noche'],
    pel: ['una resaca de tres días', 'firmar algo en una fiesta', 'una feromona que no controlas', 'muy poco realmente'],
    fac: ['la Corte de la Anfitriona', 'los gremios de placer', 'las embajadas', 'los que organizan las fiestas de verdad'],
    hit: ['el palacio de la fiesta permanente', 'las playas rosas', 'el mercado de perfumes', 'la sala de las mil lámparas'],
    bie: ['perfume', 'diplomacia', 'licores imposibles', 'invitaciones'],
    aut: 'nadie manda de verdad, y funciona',
    cli: ['siempre buen tiempo, sospechosamente', 'atardeceres rosas', 'una brisa cálida constante'],
    com: ['banquetes de doce horas', 'cócteles con nombre propio', 'fruta que solo se da aquí'],
    gen: ['los zeltron', 'los diplomáticos de vacaciones', 'los artistas', 'gente que ha venido a olvidar algo']
  },
  'Eshan': {
    cri: ['aves de risco entrenadas', 'peces de río de montaña', 'perros de guardia de escuela', 'nada peligroso'],
    pel: ['un desafío formal que no puedes declinar', 'la vergüenza', 'un maestro exigente', 'poco más'],
    fac: ['las escuelas de esgrima', 'el consejo de maestros', 'los Echani de sangre', 'los mercenarios formados aquí'],
    hit: ['los patios de entrenamiento', 'la escuela de la montaña', 'el salón de los duelos', 'el río de agua helada'],
    bie: ['instrucción de combate', 'armas ceremoniales', 'guardaespaldas formados', 'seda de entrenamiento'],
    aut: 'los maestros de las escuelas',
    cli: ['montaña limpia y fría', 'niebla de amanecer en el patio', 'inviernos duros'],
    com: ['arroz de montaña', 'té después del combate', 'comida sencilla a propósito'],
    gen: ['los echani', 'los alumnos', 'los maestros', 'los guardaespaldas de exportación']
  },
  'Concordia': {
    cri: ['strills de mina', 'murciélagos de galería', 'lagartos de roca', 'poco que no sea mineral'],
    pel: ['un derrumbe de mina', 'la Guardia de la Muerte', 'ser el que hace preguntas', 'el vacío al otro lado de la esclusa'],
    fac: ['la Guardia de la Muerte', 'los mineros de beskar', 'el gobernador de la luna', 'los que se esconden aquí'],
    hit: ['las minas de beskar', 'el campamento oculto', 'la vista de Mandalore desde aquí', 'la galería abandonada'],
    bie: ['beskar en bruto', 'explosivos de mina', 'silencio comprado', 'armas escondidas'],
    aut: 'el gobernador, y quien esté debajo de él de verdad',
    cli: ['polvo de mina en el aire', 'frío de luna', 'poca luz siempre'],
    com: ['rancho de mina', 'ne\'tra gal traído de abajo', 'pan duro'],
    gen: ['los mineros', 'los guerreros escondidos', 'gente que no da su nombre', 'los capataces']
  },
  'Devaron': {
    cri: ['aves de valle rojo', 'un depredador de risco', 'ganado de terraza', 'insectos que cantan al anochecer'],
    pel: ['los hombres que se van y no vuelven', 'un valle sin agua', 'la ocupación imperial', 'un peregrinaje mal hecho'],
    fac: ['el consejo de matriarcas', 'el templo del valle', 'los que se van al espacio', 'la guarnición de turno'],
    hit: ['el templo excavado en el valle', 'las terrazas rojas', 'el mercado de las mujeres', 'el paso al desierto'],
    bie: ['grano de terraza', 'peregrinaciones', 'artesanía de cuerno', 'rutas'],
    aut: 'las matriarcas, sin discusión',
    cli: ['polvo rojo al atardecer', 'lluvias cortas y fuertes', 'sol duro al mediodía'],
    com: ['guiso de terraza', 'pan rojo', 'licor de raíz'],
    gen: ['los devaronianos', 'las matriarcas', 'los hombres de paso', 'los peregrinos']
  },
  'Ossus': {
    cri: ['algo que anida en las bibliotecas', 'lagartos de ruina', 'aves que solo cantan en las torres caídas', 'ysalamiri en los árboles'],
    pel: ['un techo de mil años que cede', 'saqueadores de reliquias', 'lo que quedó del cataclismo', 'perderte en los archivos'],
    fac: ['los guardianes del yacimiento', 'expediciones jedi', 'saqueadores', 'los ysanna del bosque'],
    hit: ['la Gran Biblioteca quemada', 'las torres de los archivos', 'el bosque que creció encima', 'el cráter'],
    bie: ['holocrones rotos', 'textos', 'reliquias', 'información que nadie más tiene'],
    aut: 'nadie desde hace cuatro mil años',
    cli: ['verde y quieto', 'lluvia entre las ruinas', 'un silencio que pesa'],
    com: ['lo que traigas', 'fruta del bosque nuevo', 'agua de ruina'],
    gen: ['los arqueólogos', 'los ysanna', 'los saqueadores', 'los peregrinos jedi']
  },
  'Neimoidia': {
    cri: ['insectos de pantano criados para carne', 'algo que se come los huevos', 'aves de negocio, dicen aquí', 'babosas de refinería'],
    pel: ['un contrato mal leído', 'la purga de un directivo', 'gas del pantano', 'una nidada perdida'],
    fac: ['la Federación de Comercio', 'los criaderos de huevos', 'los gremios contables', 'la guardia corporativa'],
    hit: ['los criaderos', 'la sede de la Federación', 'el pantano de las refinerías', 'la bóveda de contratos'],
    bie: ['contratos', 'huevos con derecho de crianza', 'droides de negocio', 'rutas comerciales'],
    aut: 'la Federación de Comercio y su miedo',
    cli: ['humedad que lo pudre todo', 'niebla de refinería', 'lluvia tibia'],
    com: ['larvas guisadas, en serio', 'licor de pantano', 'comida de banquete de negocios'],
    gen: ['los neimoidianos', 'los contables', 'los criadores', 'gente asustada que asusta']
  },

  /* ═══════════ BORDE MEDIO ═══════════ */
  'Naboo': {
    cri: ['un colo claw fish en las profundidades', 'shaak en las praderas', 'kaadu de monta gungan', 'peces de lago plateados'],
    pel: ['el núcleo del planeta si te metes por ahí', 'una ocupación con droides', 'un opee en las cuevas de agua', 'la política de Theed'],
    fac: ['la Casa Real de Theed', 'los gungan de Otoh Gunga', 'la Guardia Real', 'el gremio de artesanos del plasma'],
    hit: ['el palacio de Theed', 'la cascada de la ciudad', 'Otoh Gunga bajo el lago', 'las Colinas de la Frontera', 'las minas de plasma'],
    bie: ['plasma refinado', 'obra artesana', 'fruta de las praderas', 'naves cromadas'],
    aut: 'la Reina electa, y ya está',
    cli: ['primaveras de postal', 'tormentas sobre el lago', 'mañanas con niebla en la cascada'],
    com: ['pescado de lago a la plancha', 'fruta shuura', 'vino de Theed'],
    gen: ['los naboo de las ciudades', 'los gungan', 'los artesanos', 'los guardias reales']
  },
  'Kashyyyk': {
    cri: ['un wyyyschokk, la araña del tamaño de una mesa', 'un katarn que caza en el nivel medio', 'un kinrath de la sombra', 'aves de copa'],
    pel: ['bajar del nivel de las copas', 'los esclavistas trandoshanos', 'una rama que cede a doscientos metros', 'la Sombra, abajo del todo'],
    fac: ['los clanes wookiee', 'los esclavistas trandoshanos', 'la guarnición imperial', 'los herreros de bowcaster'],
    hit: ['Rwookrrorro en las copas', 'el árbol wroshyr grande', 'la Sombra del nivel bajo', 'el Puente de los Clanes'],
    bie: ['madera wroshyr', 'bowcasters', 'pieles', 'esclavos, por desgracia'],
    aut: 'los ancianos de clan, cuando el Imperio no está mirando',
    cli: ['lluvia que tarda un minuto en llegar al suelo', 'niebla entre los troncos', 'sol solo arriba del todo'],
    com: ['carne ahumada en la copa', 'nueces de wroshyr', 'licor fermentado de savia'],
    gen: ['los wookiees', 'los trandoshanos que no deberían estar', 'los madereros', 'gente de las copas']
  },
  'Bothawui': {
    cri: ['aves de mensajería', 'perros de olfato entrenados', 'peces de estanque diplomático', 'insectos que nadie mira'],
    pel: ['saber algo que no deberías', 'un chantaje bien montado', 'una guerra de clanes bothan', 'un espía que ya te vio'],
    fac: ['la Spynet bothan', 'los clanes de la Casa', 'las embajadas', 'los corredores de información'],
    hit: ['la Casa de los Clanes', 'el mercado de rumores', 'la torre de comunicaciones', 'los jardines de la neutralidad'],
    bie: ['secretos', 'pruebas', 'coartadas', 'silencio, a precio de oro'],
    aut: 'el Consejo de Clanes, y la Spynet debajo',
    cli: ['templado y agradable', 'lluvia fina', 'noches con demasiada gente en la calle'],
    com: ['comida especiada', 'té de reunión', 'vino que se sirve en salas privadas'],
    gen: ['los bothans', 'los espías', 'los diplomáticos', 'gente que escucha mejor de lo que habla']
  },
  'Ryloth': {
    cri: ['un rycrit de la manada', 'un lylek de las cuevas, peor de lo que te han contado', 'aves de la banda crepuscular', 'gutkurr de cañón'],
    pel: ['salir a la cara de día o a la cara de noche, elige', 'los cárteles de especia', 'un lylek en una galería', 'las tormentas de la línea'],
    fac: ['los clanes twi\'lek', 'el cártel de la especia ryll', 'la resistencia de Cham Syndulla', 'la ocupación de turno'],
    hit: ['la Banda Crepuscular donde se puede vivir', 'las minas de ryll', 'Lessu sobre el desfiladero', 'las cuevas de los clanes'],
    bie: ['especia ryll', 'esclavos, cuando no hay quien lo impida', 'artesanía de cuerno', 'guías de cañón'],
    aut: 'los jefes de clan, y el hutt o el moff que los tenga cogidos',
    cli: ['un lado ardiendo y otro helado', 'vientos de la línea que arrancan tejados', 'crepúsculo permanente donde vive la gente'],
    com: ['guiso de rycrit', 'raíces de cueva', 'licor de especia rebajado'],
    gen: ['los twi\'lek', 'los mineros de ryll', 'los clanes de cañón', 'gente que ha visto irse a muchos']
  },
  'Nal Hutta': {
    cri: ['babosas de pantano', 'insectos de refinería', 'algo que vive en el barro y crece', 'ranas del tamaño de un perro'],
    pel: ['deber algo a un hutt', 'gas de ciénaga', 'un capataz con cuota', 'firmar de palabra y creerlo'],
    fac: ['los clanes hutt', 'el Sol Negro', 'los capataces evocii', 'los gremios de refinería'],
    hit: ['los palacios hutt', 'las ciénagas industriales', 'la torre de Bilbousa', 'el vertedero grande'],
    bie: ['especia', 'contratos verbales', 'deudas de otro', 'permisos hutt'],
    aut: 'el hutt que te haya tocado',
    cli: ['calor pegajoso', 'lluvia que huele a químico', 'un cielo marrón'],
    com: ['guiso graso dulce', 'gusanos vivos si estás en un palacio', 'licor turbio'],
    gen: ['los evocii', 'los matones', 'los refineros', 'gente que debe dinero']
  },
  'Ord Mantell': {
    cri: ['perros de chatarral', 'aves carroñeras enormes', 'roedores de feria', 'un bicho que anida en los motores'],
    pel: ['una milicia con la que no has hablado', 'un timo de feria', 'un desprendimiento de chatarra', 'un cazarrecompensas'],
    fac: ['las milicias separatistas locales', 'el gremio de chatarreros', 'los feriantes', 'el Sol Negro de paso'],
    hit: ['la feria permanente', 'el chatarral grande', 'el puerto de Worlport', 'el circuito de apuestas'],
    bie: ['chatarra', 'armas de segunda', 'boletos amañados', 'información de puerto'],
    aut: 'la milicia que controle tu barrio hoy',
    cli: ['polvo de chatarral', 'sol duro', 'lluvias que hacen barro naranja'],
    com: ['fritanga de feria', 'cerveza floja', 'brochetas de origen dudoso'],
    gen: ['los chatarreros', 'los feriantes', 'los milicianos', 'los timadores']
  },
  'Takodana': {
    cri: ['ciervos de bosque', 'peces de lago', 'aves nocturnas', 'algo que se acerca al castillo por la noche y no entra'],
    pel: ['una pelea de cantina que escala', 'no respetar la única regla', 'los bandos que se encuentran aquí', 'el bosque de noche'],
    fac: ['la gente de Maz', 'contrabandistas de todos los bandos', 'los músicos', 'quien esté de paso'],
    hit: ['el castillo de Maz Kanata', 'el lago', 'las banderas de mil bandos', 'el sótano'],
    bie: ['todo lo que se pueda cargar', 'pasajes', 'información', 'reliquias sin papeles'],
    aut: 'Maz, y su regla: aquí no se pelea',
    cli: ['bosque húmedo y verde', 'niebla sobre el lago al amanecer', 'lluvia suave'],
    com: ['guiso del castillo', 'cerveza de todas partes', 'pan que sale caliente a todas horas'],
    gen: ['los contrabandistas', 'los músicos', 'gente escondiéndose', 'los clientes de Maz']
  },
  'Jedha': {
    cri: ['aves de risco del desierto', 'lagartos de piedra', 'bestias de carga peregrinas', 'poco más: es un sitio seco'],
    pel: ['una patrulla imperial nerviosa', 'los Partisanos de Saw', 'la tormenta de arena santa', 'estar en la plaza equivocada'],
    fac: ['los Guardianes de los Whills', 'los Partisanos de Saw Gerrera', 'la ocupación imperial', 'los peregrinos de mil credos'],
    hit: ['la Ciudad Santa de NiJedha', 'el Templo del Kyber', 'la estatua caída del Jedi', 'las minas de kyber imperiales'],
    bie: ['kyber, y todos lo saben', 'reliquias de peregrinación', 'guías', 'oraciones a peso'],
    aut: 'los Guardianes, en teoría. El Imperio, en la práctica',
    cli: ['frío de altura y sol que ciega', 'tormentas de arena que borran la ciudad', 'noches heladas'],
    com: ['pan de peregrino', 'té caliente en cada esquina', 'guiso de mercado'],
    gen: ['los peregrinos', 'los Guardianes de los Whills', 'los insurgentes', 'los comerciantes de reliquias']
  },
  'Malastare': {
    cri: ['dugs que te miran mal', 'bestias de tiro', 'aves de circuito', 'algo enorme y dormido bajo la arena, dicen'],
    pel: ['una vaina que se sale en la curva', 'un dug ofendido', 'apostar lo que no tienes', 'un pozo de combustible ardiendo'],
    fac: ['los clanes dug', 'los gremios de carreras', 'los mineros de combustible', 'los apostadores gran'],
    hit: ['el circuito grande', 'los pozos de combustible', 'la tribuna del clan', 'el desierto de la vuelta larga'],
    bie: ['combustible', 'motores de vaina', 'apuestas', 'pilotos jóvenes'],
    aut: 'los clanes dug, y el que patrocine la carrera',
    cli: ['calor de motor y arena', 'un cielo con humo permanente', 'noches frescas'],
    com: ['carne de circuito', 'cerveza dug fortísima', 'fritos de puesto'],
    gen: ['los dugs', 'los mecánicos', 'los pilotos', 'los apostadores']
  },
  'Glee Anselm': {
    cri: ['anguilas de laguna', 'peces bioluminiscentes', 'un depredador de agua dulce', 'aves zancudas'],
    pel: ['una corriente que te lleva', 'las profundidades sin luz', 'un temporal de lagos', 'algo que caza de noche en el agua'],
    fac: ['los clanes nautolanos', 'los anfibios del norte', 'el consejo de lagunas', 'los pescadores armados'],
    hit: ['las ciudades anfibias', 'la laguna grande', 'los arrecifes de agua dulce', 'el templo sumergido'],
    bie: ['pescado', 'perlas de laguna', 'medicinas de alga', 'guías de agua'],
    aut: 'el consejo de lagunas',
    cli: ['humedad constante', 'tormentas cortas', 'agua tibia siempre'],
    com: ['pescado crudo', 'sopa de laguna', 'fruta de orilla'],
    gen: ['los nautolanos', 'los anfibios', 'los pescadores', 'los buceadores']
  },
  'Ithor': {
    cri: ['manadas que nadie molesta abajo', 'aves de dosel', 'insectos polinizadores gigantes', 'criaturas que el Rebaño protege'],
    pel: ['pisar el suelo, y aquí eso es grave', 'un temporal de altura', 'los cazadores furtivos', 'ofender al Rebaño'],
    fac: ['el Rebaño de las ciudades flotantes', 'los sacerdotes de la Madre Jungla', 'los jardineros', 'furtivos de fuera'],
    hit: ['las ciudades-rebaño flotando sobre la selva', 'la Madre Jungla abajo', 'los jardines colgantes', 'el templo del bosque'],
    bie: ['plantas medicinales', 'semillas', 'conocimiento botánico', 'fruta que no crece en otra parte'],
    aut: 'el Rebaño y sus sacerdotes',
    cli: ['húmedo y cálido', 'lluvia bajo las ciudades', 'sol arriba del dosel'],
    com: ['todo vegetal', 'zumos de fruta imposible', 'pan de semillas'],
    gen: ['los ithorianos', 'los jardineros', 'los sacerdotes', 'los botánicos de visita']
  },
  'Pantora': {
    cri: ['bestias de tiro peludas', 'peces de agujero de hielo', 'aves de acantilado', 'un depredador de tundra'],
    pel: ['la ventisca', 'una disputa de la Asamblea', 'quedarte fuera de noche', 'el hielo fino'],
    fac: ['la Asamblea Pantorana', 'los gremios de hielo', 'los guías de tundra', 'la guarnición de la luna'],
    hit: ['la capital bajo cúpula', 'los campos de hielo azul', 'la Asamblea', 'el paso helado'],
    bie: ['hielo azul', 'pieles', 'minerales de luna', 'diplomacia'],
    aut: 'el Presidente de la Asamblea',
    cli: ['frío seco', 'auroras casi todas las noches', 'ventiscas de tres días'],
    com: ['guiso caliente y graso', 'té con especias', 'carne curada'],
    gen: ['los pantoranos', 'los guías', 'los políticos', 'los mineros de hielo']
  },
  'Ando': {
    cri: ['peces de arrecife', 'algo grande en la fosa exterior', 'aves de puerto', 'crustáceos enormes'],
    pel: ['piratas de costa', 'una marejada de las gordas', 'un arrecife a la altura del casco', 'una disputa de puerto'],
    fac: ['los clanes aqualish', 'los armadores', 'los piratas de arrecife', 'la milicia de puerto'],
    hit: ['los puertos armados', 'el arrecife grande', 'los astilleros de costa', 'el faro viejo'],
    bie: ['pescado', 'barcos', 'armas de costa', 'botín repartido'],
    aut: 'el que tenga más barcos armados',
    cli: ['temporales frecuentes', 'sol de mar', 'niebla de amanecer'],
    com: ['pescado en salazón', 'guiso de puerto', 'licor de caña'],
    gen: ['los aqualish', 'los armadores', 'los pescadores', 'los piratas que se llaman comerciantes']
  },
  'Concord Dawn': {
    cri: ['ganado de llanura', 'aves de campo', 'un depredador que se lleva terneros', 'caballos de monta'],
    pel: ['una banda de jinetes de casco', 'una helada mala', 'un duelo por tierras', 'la ley que no llega'],
    fac: ['los Protectores de Concord Dawn', 'las familias granjeras', 'los clanes mandalorianos de aquí', 'bandidos de camino'],
    hit: ['las llanuras rotas', 'la granja de la familia fundadora', 'el cráter grande', 'el paso del río'],
    bie: ['grano', 'ganado', 'armadura heredada', 'tierra'],
    aut: 'los Protectores, cuando están',
    cli: ['vientos de llanura', 'heladas de madrugada', 'veranos secos'],
    com: ['carne asada', 'pan de granja', 'licor de grano'],
    gen: ['los granjeros', 'los jinetes de casco', 'gente dura y callada', 'los Protectores']
  },
  'Umbara': {
    cri: ['bestias que solo se ven por su brillo', 'plantas que se mueven cuando no miras', 'depredadores sin ojos', 'insectos que emiten luz falsa'],
    pel: ['no ver a tres metros', 'la fauna que sí te ve', 'una emboscada umbarana', 'confundir una luz con otra'],
    fac: ['la nobleza umbarana', 'la milicia de sombras', 'los separatistas', 'los que guían por la penumbra'],
    hit: ['la ciudad que brilla desde dentro', 'el bosque bioluminiscente', 'la torre de mando', 'el camino iluminado'],
    bie: ['tecnología de sombra', 'armas umbaranas', 'plantas luminosas', 'guías'],
    aut: 'la nobleza, que no se deja ver',
    cli: ['penumbra permanente', 'una niebla que refracta la luz', 'nunca hay día'],
    com: ['hongos luminosos', 'carne de bosque', 'bebida amarga que te mantiene despierto'],
    gen: ['los umbaranos', 'los guías', 'los soldados perdidos', 'gente a la que no le ves la cara']
  },
  'Falleen': {
    cri: ['reptiles de jungla', 'aves de plumaje verde', 'peces de río templado', 'un depredador que caza de emboscada'],
    pel: ['una intriga de la nobleza', 'un falleen que te quiere convencer de algo', 'el Sol Negro', 'una jungla que parece amable'],
    fac: ['la aristocracia falleen', 'el Sol Negro', 'los gremios de comercio', 'los clanes menores'],
    hit: ['el palacio de la Casa', 'la jungla templada', 'el mercado de perfumes', 'las terrazas de piedra'],
    bie: ['feromonas embotelladas', 'influencia', 'arte', 'contratos discretos'],
    aut: 'el Príncipe de la Casa mayor',
    cli: ['templado y agradable', 'lluvia de tarde', 'noches perfumadas'],
    com: ['cocina muy elaborada', 'vino de terraza', 'fruta de jungla'],
    gen: ['los falleen', 'los nobles', 'los agentes', 'gente que sonríe demasiado bien']
  },
  'Togoria': {
    cri: ['un mosgoth de monta', 'manadas de herbívoros de llanura', 'grandes felinos salvajes', 'aves de altura'],
    pel: ['un mosgoth que no te acepta', 'una manada en estampida', 'el invierno en la llanura', 'un duelo togoriano'],
    fac: ['los clanes de jinetes', 'las aldeas de mujeres', 'los cazadores', 'nadie más, y les gusta'],
    hit: ['las llanuras sin ciudades', 'la aldea permanente', 'el risco de los mosgoths', 'el río grande'],
    bie: ['pieles', 'monturas', 'carne curada', 'nada industrial'],
    aut: 'el jefe de clan, y solo mientras cace bien',
    cli: ['viento de llanura', 'inviernos largos', 'cielos enormes'],
    com: ['carne, y poco más', 'leche fermentada', 'agua de río'],
    gen: ['los togorianos', 'los jinetes', 'los cazadores', 'gente que no construye']
  },
  'Ord Mantell II': {
    cri: ['aves de plataforma', 'peces de mar abierto', 'ratas de feria', 'un bicho que vive bajo los flotadores'],
    pel: ['caer entre dos plataformas', 'un timo de feria flotante', 'un temporal que separa la ciudad', 'una banda de embarcadero'],
    fac: ['los feriantes', 'el gremio de flotadores', 'los timadores organizados', 'la milicia de plataforma'],
    hit: ['la feria sobre el mar', 'el embarcadero grande', 'la noria de plataforma', 'el mercado flotante'],
    bie: ['boletos', 'pescado', 'chatarra flotante', 'trucos'],
    aut: 'el gremio de flotadores',
    cli: ['brisa de mar', 'temporales que mueven la ciudad', 'sol reflejado que ciega'],
    com: ['fritanga de feria', 'pescado a la plancha', 'refresco carísimo'],
    gen: ['los feriantes', 'los marineros', 'los timadores', 'gente de plataforma']
  },
  'Manaan': {
    cri: ['un firaxa que ronda las plataformas', 'bancos de peces', 'algo en la fosa del kolto', 'medusas de superficie'],
    pel: ['romper la neutralidad', 'un firaxa en el agua', 'bajar a la fosa', 'la Selkath cuando se enfada'],
    fac: ['el Consejo Selkath', 'las corporaciones del kolto', 'los buceadores de fosa', 'las embajadas de los dos bandos'],
    hit: ['Ahto City sobre el agua', 'la fosa del kolto', 'la sala del Consejo', 'la plataforma de tribunal'],
    bie: ['kolto', 'neutralidad', 'permisos de extracción', 'medicina'],
    aut: 'el Consejo Selkath, y no se discute',
    cli: ['océano en todas direcciones', 'temporales largos', 'sol sobre el agua'],
    com: ['pescado en todas sus formas', 'algas', 'agua salada filtrada'],
    gen: ['los selkath', 'los buceadores', 'los diplomáticos', 'los médicos']
  },
  'Sluis Van': {
    cri: ['nada vivo, es una estación', 'ratas de bodega que se colaron', 'un droide que se cree mascota', 'insectos de invernadero'],
    pel: ['una descompresión', 'un accidente de dique seco', 'una redada de aduana', 'la lentitud burocrática que te arruina'],
    fac: ['la administración del astillero', 'el gremio de estibadores', 'la aduana', 'los transportistas'],
    hit: ['los diques secos', 'el anillo de atraque', 'la sala de control', 'el invernadero de la estación'],
    bie: ['reparaciones', 'plazas de dique', 'aduana blanda', 'piezas de casco'],
    aut: 'el administrador del astillero',
    cli: ['no hay: hay turnos', 'iluminación que simula amanecer', 'siempre 20 grados'],
    com: ['comedor de estación', 'café malo constante', 'verdura de invernadero cara'],
    gen: ['los estibadores', 'los inspectores', 'los pilotos esperando', 'los técnicos']
  },
  'Roche': {
    cri: ['verpine, que son la gente y también los insectos', 'nada más vive aquí', 'algo que se cría en los túneles', 'colonias de líquenes'],
    pel: ['una roca que cambia de órbita', 'una fuga de aire', 'un experimento que sale mal', 'ir sin traje'],
    fac: ['las colmenas verpine', 'los armeros', 'los contratistas de fuera', 'los ingenieros de asteroide'],
    hit: ['las colmenas de asteroide', 'el taller grande', 'el campo de rocas', 'la sala limpia'],
    bie: ['armas de precisión', 'ingeniería a medida', 'prototipos', 'piezas imposibles'],
    aut: 'la colmena, que decide en grupo',
    cli: ['vacío fuera, aire reciclado dentro', 'gravedad baja', 'silencio absoluto'],
    com: ['pasta nutritiva', 'hongos de túnel', 'nada que sepa a mucho'],
    gen: ['los verpine', 'los armeros', 'los ingenieros', 'los clientes con dinero']
  },
  'Champala': {
    cri: ['peces de lago salino', 'aves zancudas rosas', 'anfibios de orilla', 'algo que canta al anochecer'],
    pel: ['la sal si te quedas mucho', 'un debate que se te va de las manos', 'una tormenta de lago', 'poco más'],
    fac: ['los templos abiertos', 'la escuela de oratoria', 'el consejo chagriano', 'los mediadores'],
    hit: ['los templos sin paredes', 'los lagos de sal', 'el anfiteatro', 'la biblioteca de discursos'],
    bie: ['mediación', 'sal fina', 'formación en oratoria', 'medicinas de lago'],
    aut: 'el consejo, elegido por debate público',
    cli: ['calor seco sobre los lagos', 'atardeceres rosas', 'tormentas raras y violentas'],
    com: ['pescado de lago salado', 'pan de sal', 'infusión clara'],
    gen: ['los chagrianos', 'los oradores', 'los mediadores', 'los estudiantes de retórica']
  },
  'Cerea': {
    cri: ['caballos y bestias de tiro', 'aves de pradera', 'ganado', 'un depredador de bosque'],
    pel: ['usar una máquina donde no debes', 'una helada', 'el conflicto entre viejos y jóvenes', 'un parto complicado sin tecnología'],
    fac: ['el Consejo de Ancianos', 'los jóvenes que quieren máquinas', 'las aldeas', 'los mercaderes de fuera'],
    hit: ['la aldea del Consejo', 'las praderas sin una sola carretera', 'el mercado de trueque', 'el bosque prohibido'],
    bie: ['artesanía', 'grano', 'caballos', 'nada con motor'],
    aut: 'el Consejo de Ancianos',
    cli: ['estaciones marcadas y limpias', 'lluvias de primavera', 'inviernos con nieve'],
    com: ['pan, queso y verdura', 'sidra', 'todo de aquí'],
    gen: ['los cereanos', 'los ancianos', 'los jóvenes inquietos', 'los artesanos']
  },
  'Orto': {
    cri: ['aves cantoras que la gente cría', 'insectos que zumban en tono', 'peces de estanque', 'ganado'],
    pel: ['un mal concierto en público', 'una disputa de gremio musical', 'poco más', 'la lluvia en día de festival'],
    fac: ['los gremios musicales', 'el consejo de la ciudad', 'las escuelas de instrumento', 'los luthiers'],
    hit: ['la sala de conciertos de piedra', 'el mercado de instrumentos', 'la torre que suena con el viento', 'el auditorio al aire libre'],
    bie: ['instrumentos', 'partituras', 'formación', 'campanas'],
    aut: 'el consejo, con mucha música de fondo',
    cli: ['templado', 'lluvia que suena bien en los tejados', 'primaveras largas'],
    com: ['comida de festival', 'sidra', 'pan de horno común'],
    gen: ['los ortolanos', 'los músicos', 'los luthiers', 'gente que canta al trabajar']
  },
  'Kinyen': {
    cri: ['ganado de llanura', 'aves de cultivo', 'insectos polinizadores', 'nada que muerda'],
    pel: ['casi nada, y eso desconcierta', 'una mala cosecha', 'un forastero con malas ideas', 'comer demasiado'],
    fac: ['los consejos de aldea', 'las cooperativas agrícolas', 'los cocineros de gremio', 'los pocos que se van fuera'],
    hit: ['las llanuras de cultivo', 'la mesa larga del pueblo', 'el granero comunal', 'el mercado de la cosecha'],
    bie: ['grano', 'comida buena de verdad', 'cerveza', 'hospitalidad'],
    aut: 'el consejo de aldea, en la mesa',
    cli: ['templado y estable', 'lluvias a su hora', 'veranos generosos'],
    com: ['banquetes de cinco horas', 'cerveza de cosecha', 'pan recién hecho'],
    gen: ['los gran', 'los granjeros', 'los cocineros', 'gente que te invita a comer antes de preguntarte nada']
  },
  'Christophsis': {
    cri: ['insectos de cristal', 'aves que anidan en las agujas', 'poco fauna: es un mundo de mineral', 'algo que reptar por las torres'],
    pel: ['una torre que se parte', 'un frente de guerra que se mueve', 'esquirlas de cristal', 'un francotirador'],
    fac: ['los magnates del cristal', 'la ocupación separatista', 'la resistencia local', 'los gremios de corte'],
    hit: ['las torres traslúcidas de Chaleydonia', 'la mina de cristal', 'el puente partido', 'la plaza de cristal'],
    bie: ['cristal en bruto', 'cortes de precisión', 'refugio', 'agua potable en tiempo de asedio'],
    aut: 'los magnates, hasta que llega un ejército',
    cli: ['luz que se refracta en todo', 'calor que rebota', 'noches con la ciudad brillando'],
    com: ['raciones de asedio', 'lo que quede en las despensas', 'agua racionada'],
    gen: ['los cortadores de cristal', 'los magnates', 'los refugiados', 'los soldados']
  },
  'Ringo Vinda': {
    cri: ['nada, es una estación anular', 'plagas de bodega', 'droides sueltos', 'algo en el sector no presurizado'],
    pel: ['una brecha de casco', 'un tramo del anillo tomado', 'perderte en cuarenta kilómetros de pasillo', 'gravedad artificial que falla'],
    fac: ['la administración del anillo', 'los sectores en disputa', 'los gremios de mantenimiento', 'la flota que lo asedie'],
    hit: ['el anillo que rodea el planeta entero', 'el sector de mando', 'el tramo sin presión', 'el mirador al planeta'],
    bie: ['posición estratégica', 'reparación de casco', 'aire', 'información'],
    aut: 'quien controle el sector de mando',
    cli: ['ninguno: todo es interior', 'la luz del planeta desde las ventanas', 'un zumbido constante'],
    com: ['raciones de anillo', 'hidropónico', 'café que sabe a metal'],
    gen: ['los técnicos de anillo', 'los soldados', 'los administrativos', 'gente que nació en un pasillo']
  },
  'Umbara Profunda': {
    cri: ['depredadores que brillan al cazar', 'plantas carnívoras del tamaño de un edificio', 'insectos que imitan luces de gente', 'algo que no emite luz y es peor'],
    pel: ['seguir una luz equivocada', 'la selva de noche, que es siempre', 'una emboscada', 'esporas que te confunden'],
    fac: ['los clanes de la selva profunda', 'los cazadores umbaranos', 'expediciones perdidas', 'los que dicen guiar'],
    hit: ['la selva bioluminiscente', 'el claro que brilla en azul', 'las raíces gigantes', 'la ciudad abandonada'],
    bie: ['esporas', 'plantas raras', 'guías', 'lo que dejaron las expediciones'],
    aut: 'nadie que se identifique',
    cli: ['noche permanente con colores', 'humedad', 'una niebla que confunde distancias'],
    com: ['hongos', 'lo que caces', 'agua que hay que filtrar dos veces'],
    gen: ['los umbaranos de selva', 'los cazadores', 'los perdidos', 'los guías dudosos']
  },
  'Bracca': {
    cri: ['aves carroñeras de desguace', 'ratas de casco', 'perros de vigilancia', 'algo que anida en los reactores fríos'],
    pel: ['una viga que cae de un destructor', 'un reactor mal purgado', 'el capataz del Gremio', 'un corte que se infecta'],
    fac: ['el Gremio de Desguace', 'los capataces', 'los que roban piezas', 'la Inquisición cuando viene'],
    hit: ['los cascos de destructores partidos', 'el tren de mineral', 'el campamento de trabajadores', 'la fosa de fundición'],
    bie: ['chatarra de guerra', 'piezas de contrabando', 'metal', 'turnos vendidos'],
    aut: 'el Gremio de Desguace',
    cli: ['lluvia sucia', 'humo de corte permanente', 'un cielo del color del óxido'],
    com: ['rancho de campamento', 'café de turno', 'lo que compres en el tren'],
    gen: ['los desguazadores', 'los capataces', 'gente escondida', 'los trabajadores por deuda']
  },
  'Mygeeto': {
    cri: ['nada nativo grande', 'insectos de cristal', 'algo que vive en las grietas del glaciar', 'aves importadas que no aguantan'],
    pel: ['un frente de trincheras', 'el frío', 'una veta de cristal que estalla', 'un banco que te ejecuta la deuda'],
    fac: ['el Clan Bancario', 'los mineros de cristal', 'los ejércitos de turno', 'los sindicatos helados'],
    hit: ['las torres bancarias sobre el hielo', 'las trincheras', 'la mina de cristal profunda', 'el puente helado'],
    bie: ['cristal de valor', 'crédito', 'material de guerra', 'calor'],
    aut: 'el Clan Bancario, con o sin ejército',
    cli: ['frío que duele', 'ventiscas de cristal', 'una luz azul que no calienta'],
    com: ['guiso caliente racionado', 'licor para el frío', 'raciones de trinchera'],
    gen: ['los mineros', 'los banqueros', 'los soldados', 'gente helada']
  },
  'Gentes': {
    cri: ['bichos de horno', 'roedores de fundición', 'aves de chimenea', 'perros de gremio'],
    pel: ['un horno mal purgado', 'una disputa de gremios', 'metal fundido', 'quedarte sin gremio'],
    fac: ['los gremios ugnaught', 'los maestros de horno', 'los aprendices', 'los compradores de fuera'],
    hit: ['la Gran Fundición', 'el salón de gremios', 'los hornos eternos', 'el mercado de aleaciones'],
    bie: ['aleaciones', 'trabajo de precisión', 'aprendizaje', 'herramienta'],
    aut: 'el consejo de gremios',
    cli: ['calor de horno en toda la ciudad', 'humo', 'nunca hace frío'],
    com: ['comida abundante y salada', 'cerveza de gremio', 'pan de horno grande'],
    gen: ['los ugnaught', 'los herreros', 'los aprendices', 'gente muy orgullosa de su oficio']
  },
  'Clak\'dor VII': {
    cri: ['insectos de atmósfera densa', 'algo que flota en la niebla', 'peces de laguna ácida', 'aves de cúpula'],
    pel: ['salir de la cúpula sin filtro', 'una guerra entre ciudades por música', 'un bith ofendido', 'la atmósfera envenenada de antes'],
    fac: ['las ciudades-cúpula', 'los gremios musicales bith', 'los químicos', 'los que exportan bandas'],
    hit: ['la cúpula grande', 'la sala de conciertos', 'el páramo de fuera', 'el laboratorio químico'],
    bie: ['música', 'química de precisión', 'instrumentos', 'filtros de aire'],
    aut: 'el consejo de la cúpula',
    cli: ['dentro, controlado', 'fuera, no respirable', 'una luz filtrada verdosa'],
    com: ['comida procesada de cúpula', 'bebida clara', 'nada que crezca fuera'],
    gen: ['los bith', 'los músicos', 'los químicos', 'gente que no ha salido nunca de la cúpula']
  },
  'Nal Kesh': {
    cri: ['babosas de ácido', 'algo que sobrevive al pantano y no debería', 'insectos de refinería', 'anguilas de barro'],
    pel: ['una fuga de ácido', 'un capataz con cuota', 'el barro que te traga', 'deber turnos'],
    fac: ['los capataces hutt', 'los sindicatos que no existen oficialmente', 'los refineros', 'los que se escapan al pantano'],
    hit: ['las refinerías sobre el pantano', 'las pasarelas', 'el campamento de trabajadores', 'la laguna ácida'],
    bie: ['químicos', 'turnos', 'rutas de fuga', 'silencio'],
    aut: 'el capataz, y el hutt detrás',
    cli: ['vapores ácidos', 'lluvia que pica', 'calor pegajoso'],
    com: ['rancho', 'agua filtrada tres veces', 'licor que quema por buenas razones'],
    gen: ['los refineros', 'los trabajadores por deuda', 'los capataces', 'los fugados']
  },
  'Ryloth Sur': {
    cri: ['lylek de galería profunda', 'cosas ciegas en las minas', 'murciélagos de cueva', 'nada en la superficie helada'],
    pel: ['el frío eterno de la cara oscura', 'una galería que se hunde', 'un lylek adulto', 'quedarte sin lámpara'],
    fac: ['los mineros de ryll', 'los capataces del cártel', 'los clanes que no bajaron', 'contrabandistas'],
    hit: ['las minas profundas de ryll', 'la superficie helada', 'el campamento de mineros', 'la galería sellada'],
    bie: ['ryll puro', 'lámparas y aire', 'rutas de galería', 'silencio'],
    aut: 'el cártel de la especia',
    cli: ['frío que no cede nunca', 'oscuridad permanente', 'viento de la línea a lo lejos'],
    com: ['guiso de mina', 'té hirviendo constante', 'raciones'],
    gen: ['los mineros twi\'lek', 'los capataces', 'gente que no ha visto el sol', 'los contrabandistas']
  },

  /* ═══════════ BORDE EXTERIOR ═══════════ */
  'Tatooine': {
    cri: ['un bantha viejo que ya no obedece', 'un dewback de patrulla', 'un ronto cargado de los jawas', 'un dragón krayt, si tienes muy mala suerte', 'una womp rat del tamaño de un perro'],
    pel: ['una tormenta de arena de tres días', 'los moradores de las arenas al anochecer', 'el mediodía sin agua', 'un cazarrecompensas en la cantina'],
    fac: ['el cártel de Jabba', 'los granjeros de humedad', 'los moradores de las arenas', 'los jawas del transporte', 'los pilotos de vaina'],
    hit: ['el Mar de Dunas', 'la Garganta del Mendigo', 'el palacio de Jabba', 'el Pozo de Carkoon', 'Mos Eisley'],
    bie: ['agua condensada', 'piezas de vaporizador', 'especia de paso', 'chatarra de motor', 'esclavos, tristemente'],
    aut: 'los hutt, y nadie más se molesta en fingir',
    cli: ['dos soles a plomo', 'una tormenta de arena que borra los caminos', 'noches que hielan'],
    com: ['leche azul de bantha', 'carne seca de dewback', 'ale de Mos Eisley'],
    gen: ['los granjeros de humedad', 'los jawas', 'los moradores de las arenas', 'los contrabandistas de paso']
  },
  'Jakku': {
    cri: ['un happabore que bebe en el pozo', 'un luggabeast de carga', 'nightwatcher worms bajo la arena', 'carroñeros alados'],
    pel: ['una tormenta que descubre y entierra naves', 'los matones de Plutt', 'quedarte sin raciones', 'un casco que colapsa contigo dentro'],
    fac: ['la gente de Unkar Plutt', 'los chatarreros libres', 'los teedo', 'los que buscan reliquias imperiales'],
    hit: ['el Cementerio de Naves', 'el Puesto de Niima', 'el destructor caído', 'el pozo de Tuanul'],
    bie: ['piezas limpias', 'raciones prensadas', 'agua', 'reliquias de la batalla'],
    aut: 'Unkar Plutt, porque tiene la comida',
    cli: ['sol que raja', 'tormentas de arena que reescriben el paisaje', 'noches heladas'],
    com: ['pan instantáneo que crece en el cuenco', 'agua racionada', 'carne seca cara'],
    gen: ['los chatarreros', 'los teedo', 'gente que cambia piezas por comida', 'los buscadores de reliquias']
  },
  'Hoth': {
    cri: ['un wampa que sale de la nieve', 'un tauntaun que apesta por dentro y por fuera', 'algo bajo el hielo', 'nada más vive aquí'],
    pel: ['la noche: seis horas y estás muerto', 'una ventisca', 'una grieta bajo la nieve fresca', 'un wampa que te lleva a su cueva'],
    fac: ['nadie, salvo quien se esconda', 'una base rebelde, en su momento', 'cazadores de pieles', 'exploradores perdidos'],
    hit: ['la llanura blanca', 'las cuevas de hielo', 'el paso de la ventisca', 'los restos de la base'],
    bie: ['pieles de tauntaun', 'combustible térmico', 'nada más', 'refugio'],
    aut: 'ninguna. El frío manda',
    cli: ['ventisca casi siempre', 'un sol que no calienta nada', 'noches que matan'],
    com: ['raciones calientes', 'lo que lleves', 'nieve derretida'],
    gen: ['nadie fijo', 'los exploradores', 'los refugiados de guerra', 'los cazadores de pieles']
  },
  'Dagobah': {
    cri: ['un dragonsnake de las lagunas', 'un bogwing de los árboles', 'un nudj que chilla de noche', 'algo enorme y lento en el fondo'],
    pel: ['la ciénaga que se traga naves', 'la fiebre de humedad', 'la cueva que no es una cueva', 'perderte a doscientos metros'],
    fac: ['nadie. Ese es el punto', 'algún naufragio', 'un ermitaño si tienes suerte', 'nada organizado'],
    hit: ['la laguna donde se hunden las naves', 'la cueva oscura bajo el árbol', 'el claro sin nombre', 'el árbol grande'],
    bie: ['nada', 'raíces comestibles', 'lo que caces', 'soledad'],
    aut: 'ninguna en absoluto',
    cli: ['niebla permanente', 'lluvia tibia', 'una humedad que pudre todo en tres días'],
    com: ['raíz hervida', 'guiso de lo que haya', 'agua que hay que hervir'],
    gen: ['nadie', 'un naufragio ocasional', 'lo que sea que te mira', 'los silencio']
  },
  'Mustafar': {
    cri: ['una lava flea que salta sobre la escoria', 'insectos que anidan en fisuras', 'algo que resiste el calor y no debería', 'nada con sangre caliente'],
    pel: ['una colada nueva sin avisar', 'gas de fisura', 'una plataforma que cede', 'el calor sin traje'],
    fac: ['las compañías mineras', 'los northern miners', 'los que buscan lo que Vader dejó', 'los capataces'],
    hit: ['los ríos de lava', 'el castillo negro', 'la mina de obsidiana', 'la plataforma de recogida'],
    bie: ['obsidiana', 'mineral raro', 'trajes térmicos', 'reliquias que no deberías tocar'],
    aut: 'la compañía minera, y algo peor arriba en el castillo',
    cli: ['ceniza cayendo siempre', 'calor que quema al respirar', 'un cielo naranja permanente'],
    com: ['comida importada carísima', 'agua filtrada', 'nada crece aquí'],
    gen: ['los mineros', 'los capataces', 'gente quemada', 'nadie que quiera estar aquí']
  },
  'Kamino': {
    cri: ['un aiwha que vuela y nada', 'peces de tormenta', 'algo grande bajo las plataformas', 'nada terrestre'],
    pel: ['caer al mar en plena tormenta', 'una plataforma que cede', 'una decisión ética que no es tuya', 'un lote defectuoso'],
    fac: ['los kaminoanos', 'los instructores mandalorianos', 'los clones', 'la República que paga'],
    hit: ['Ciudad Tipoca sobre el agua', 'las salas de crecimiento', 'la plataforma de aterrizaje batida por la lluvia', 'el mar sin islas'],
    bie: ['clones', 'genética', 'formación militar', 'discreción'],
    aut: 'el Primer Ministro kaminoano',
    cli: ['lluvia que no para nunca', 'tormenta eléctrica sobre el mar', 'olas de doce metros'],
    com: ['nutrición calculada', 'nada por placer', 'agua desalada'],
    gen: ['los kaminoanos', 'los clones', 'los instructores', 'nadie de aquí que no sea alto y pálido']
  },
  'Geonosis': {
    cri: ['un acklay de arena', 'un nexu de risco', 'un reek de arena roja', 'un orray de tiro', 'enjambres de guerreros geonosianos'],
    pel: ['la arena de ejecución', 'un enjambre defendiendo la colmena', 'las fábricas de droides', 'una tormenta roja'],
    fac: ['las colmenas geonosianas', 'la Unión Tecno', 'los separatistas', 'los archiduques'],
    hit: ['la arena de ejecución', 'las fábricas subterráneas de droides', 'las agujas de la colmena', 'el desierto rojo'],
    bie: ['droides', 'armas de línea', 'trabajo de casta obrera', 'huevos de casta'],
    aut: 'el Archiduque de la colmena',
    cli: ['polvo rojo permanente', 'calor seco', 'tormentas que tapan el sol'],
    com: ['pasta de colmena', 'agua de cisterna', 'nada que un forastero quiera'],
    gen: ['los geonosianos de casta', 'los aristócratas alados', 'los obreros', 'los forasteros que trabajan aquí']
  },
  'Lothal': {
    cri: ['un loth-gato en el trigo', 'un loth-lobo, que no es solo un lobo', 'aves de pradera', 'ganado de granja'],
    pel: ['una patrulla imperial', 'una expropiación de tierras', 'la fábrica que envenena el arroyo', 'un capataz de la mina'],
    fac: ['la guarnición imperial', 'los granjeros expropiados', 'la resistencia de Ezra y los suyos', 'los mineros'],
    hit: ['la Ciudad Capital y su cúpula imperial', 'las llanuras de trigo', 'la torre de comunicaciones', 'el templo bajo la llanura'],
    bie: ['grano', 'mineral', 'permisos de tránsito', 'información de la resistencia'],
    aut: 'el Ministro imperial, y antes el gobernador local',
    cli: ['vientos de pradera', 'atardeceres largos y naranjas', 'inviernos secos'],
    com: ['guiso de granja', 'meiloorun si la encuentras', 'cerveza de la Capital'],
    gen: ['los granjeros', 'los mineros', 'los chavales de la calle', 'los soldados imperiales']
  },
  'Sullust': {
    cri: ['insectos de galería', 'nada en la superficie', 'algo que vive junto al magma', 'murciélagos de túnel'],
    pel: ['una erupción de galería', 'gas volcánico', 'un colapso de túnel', 'un turno de dieciséis horas'],
    fac: ['SoroSuub', 'los sindicatos sullustanos', 'la resistencia de túnel', 'la administración imperial'],
    hit: ['las ciudades subterráneas', 'la fábrica de SoroSuub', 'el mirador al mar de lava', 'los túneles de escape'],
    bie: ['naves y componentes', 'combustible', 'mapas de túnel', 'trabajo cualificado'],
    aut: 'SoroSuub, que también es el gobierno',
    cli: ['no hay cielo, hay techo', 'calor de fondo', 'aire filtrado siempre'],
    com: ['comida de comedor de fábrica', 'hongo de túnel', 'cerveza sullustana'],
    gen: ['los sullustanos', 'los obreros', 'los navegantes', 'gente que conoce los túneles de memoria']
  },
  'Dathomir': {
    cri: ['un rancor, y aquí se montan', 'una araña de sangre', 'purgatorio de los pantanos rojos', 'bestias que las brujas crían'],
    pel: ['ofender a una Hermana de la Noche', 'la magia de aquí, que es real', 'un rancor sin jinete', 'la niebla verde'],
    fac: ['las Hermanas de la Noche', 'los Hermanos de la Noche', 'los clanes de jinetes de rancor', 'lo que quedó después de la masacre'],
    hit: ['el Santuario de las Hermanas', 'los pantanos rojos', 'la aldea de los Hermanos', 'la cueva de los espíritus'],
    bie: ['magia embotellada', 'talismanes', 'monturas', 'rituales'],
    aut: 'la Madre Talzin, mientras estuvo',
    cli: ['bruma roja', 'noches con luces que no son estrellas', 'un cielo que parece enfermo'],
    com: ['guiso de pantano', 'raíces amargas', 'bebida ritual que no deberías probar'],
    gen: ['las Hermanas de la Noche', 'los zabrak de la aldea', 'los jinetes de rancor', 'los espíritus, dicen']
  },
  'Nevarro': {
    cri: ['lagartos de basalto', 'algo que anida en la lava fría', 'aves carroñeras', 'un depredador de llanura negra'],
    pel: ['aceptar un contrato sin leerlo', 'el río de lava fuera de la ciudad', 'un cazarrecompensas rival', 'los restos imperiales'],
    fac: ['el Gremio de Cazarrecompensas', 'la magistrada de la ciudad', 'los restos imperiales', 'los mercaderes de la plaza'],
    hit: ['la ciudad amurallada', 'el edificio del Gremio', 'las llanuras de basalto', 'la escuela nueva'],
    bie: ['contratos', 'armas', 'información de fugitivos', 'metal fundido'],
    aut: 'la magistrada, ahora que ya no es un vertedero',
    cli: ['calor seco', 'ceniza fina', 'cielos limpios y muy negros de noche'],
    com: ['guiso de plaza', 'cerveza de la cantina del Gremio', 'pan duro'],
    gen: ['los cazarrecompensas', 'los comerciantes', 'gente del Gremio', 'los colonos nuevos']
  },
  'Shili': {
    cri: ['un akul, de los que dan el diente del collar', 'manadas de herbívoros de hierba alta', 'aves de sabana', 'depredadores que se esconden en el turquesa'],
    pel: ['un akul adulto', 'perderte en hierba más alta que tú', 'un incendio de sabana', 'un rito de paso que sale mal'],
    fac: ['las aldeas togruta', 'los cazadores de akul', 'los ancianos', 'los que se van a la Orden'],
    hit: ['la sabana turquesa', 'la aldea grande', 'el risco de los cazadores', 'el árbol de las reuniones'],
    bie: ['dientes de akul', 'pieles', 'carne curada', 'artesanía de montral'],
    aut: 'los ancianos de la aldea',
    cli: ['sol de sabana', 'vientos que mueven la hierba como agua', 'lluvias cortas'],
    com: ['carne asada', 'raíces de sabana', 'bebida fermentada de hierba'],
    gen: ['los togruta', 'los cazadores', 'los ancianos', 'los críos que quieren su diente']
  },
  'Iridonia': {
    cri: ['depredadores de cañón', 'aves de risco', 'bestias de carga con cuernos', 'algo que anida en las paredes'],
    pel: ['un duelo ritual que aceptaste sin querer', 'un desprendimiento', 'el viento del cañón', 'un clan ofendido'],
    fac: ['los clanes zabrak', 'las escuelas de duelo', 'los herreros de cañón', 'los que se van de mercenarios'],
    hit: ['el cañón principal', 'la plataforma de duelos', 'las viviendas talladas en la pared', 'el puente colgante'],
    bie: ['armas', 'formación de combate', 'mercenarios', 'artesanía de metal'],
    aut: 'el consejo de clanes',
    cli: ['viento constante en los cañones', 'calor de día, frío de noche', 'tormentas secas'],
    com: ['carne especiada', 'pan de cañón', 'licor fuerte'],
    gen: ['los zabrak', 'los duelistas', 'los herreros', 'los mercenarios de exportación']
  },
  'Rodia': {
    cri: ['un ghest de pantano', 'insectos gigantes de jungla', 'peces de río lodoso', 'algo que caza en la humedad'],
    pel: ['un duelo de clanes rodiano', 'la jungla húmeda', 'un cazador que empieza y quiere probarse', 'los hutt de visita'],
    fac: ['los clanes rodianos', 'el gremio de cazarrecompensas local', 'los hutt', 'los domos de comerciantes'],
    hit: ['los domos de Equator City', 'la jungla húmeda', 'la arena de duelos', 'el río lodoso'],
    bie: ['contratos de caza', 'pieles', 'armas', 'formación de rastreo'],
    aut: 'el clan que gobierne el domo',
    cli: ['humedad brutal', 'lluvias diarias', 'niebla de amanecer'],
    com: ['insecto asado, que está mejor de lo que suena', 'guiso de río', 'licor de jungla'],
    gen: ['los rodianos', 'los cazadores jóvenes', 'los comerciantes', 'gente de clan']
  },
  'Sriluur': {
    cri: ['reptiles de roca', 'aves carroñeras', 'bestias de carga de desierto', 'algo que vive en los cañones secos'],
    pel: ['un weequay al que no le gustas', 'el sol del mediodía', 'una banda de mercenarios sin contrato', 'la falta de agua'],
    fac: ['los clanes weequay', 'las compañías mercenarias', 'los hutt de paso', 'los templos del dios de turno'],
    hit: ['el desierto rocoso', 'el templo del clan', 'el puerto mercenario', 'el cañón seco'],
    bie: ['mercenarios', 'armas usadas', 'agua', 'contratos sin preguntas'],
    aut: 'el clan más grande de la temporada',
    cli: ['sol duro', 'viento de roca', 'noches frías'],
    com: ['carne seca', 'pan de piedra', 'licor weequay que tumba'],
    gen: ['los weequay', 'los mercenarios', 'los sacerdotes de clan', 'gente que no explica su pasado']
  },
  'Kintan': {
    cri: ['bestias de carga nikto', 'reptiles de desierto', 'aves carroñeras', 'algo que los hutt trajeron y se quedó'],
    pel: ['heredar una deuda que no firmaste', 'el sol', 'un capataz nikto', 'una tormenta seca'],
    fac: ['los clanes nikto', 'los hutt que los tienen desde hace siglos', 'los capataces', 'los que se niegan a servir'],
    hit: ['las tierras áridas', 'el templo nikto viejo', 'el puesto hutt', 'el pozo comunal'],
    bie: ['mano de obra', 'deudas', 'agua', 'lealtad comprada'],
    aut: 'el hutt de siempre',
    cli: ['calor seco', 'polvo', 'noches limpias'],
    com: ['guiso escaso', 'pan de raíz', 'agua racionada'],
    gen: ['los nikto', 'los siervos por deuda', 'los capataces', 'gente con más siglos de deuda que de historia']
  },
  'Felucia': {
    cri: ['acklay que anidan entre los hongos', 'rancors de jungla', 'insectos del tamaño de un perro', 'un gelagrub de carga'],
    pel: ['esporas que te hacen ver cosas', 'un acklay', 'perderte entre hongos de veinte metros', 'los colores que marean de verdad'],
    fac: ['los aldeanos felucianos', 'los recolectores de esporas', 'los separatistas de paso', 'los chamanes'],
    hit: ['el bosque de hongos gigantes', 'la aldea entre raíces', 'el claro de las esporas', 'el río bajo los sombreros'],
    bie: ['esporas medicinales', 'plantas raras', 'guías', 'venenos'],
    aut: 'los chamanes de la aldea',
    cli: ['humedad de invernadero', 'lluvia que gotea de los hongos', 'colores que cambian con la luz'],
    com: ['hongo guisado', 'fruta de raíz', 'infusión que te deja raro'],
    gen: ['los felucianos', 'los recolectores', 'los chamanes', 'gente pintada de colores']
  },
  'Yavin 4': {
    cri: ['woolamanders en las copas', 'stintarils que roban comida', 'runyips de suelo', 'algo que anida en los templos'],
    pel: ['una piedra suelta en un templo de cuatro mil años', 'la jungla de noche', 'lo que dejó Exar Kun', 'una fiebre de selva'],
    fac: ['nadie fijo', 'una base rebelde, cuando la hubo', 'arqueólogos', 'lo que susurra en el Gran Templo'],
    hit: ['el Gran Templo Massassi', 'la selva alrededor', 'el río de la base', 'los templos menores'],
    bie: ['nada que vender', 'reliquias massassi', 'refugio', 'silencio'],
    aut: 'ninguna',
    cli: ['calor de selva', 'lluvias de tarde', 'un gigante de gas llenando medio cielo'],
    com: ['fruta de selva', 'raciones', 'lo que caces'],
    gen: ['nadie', 'los rebeldes', 'los arqueólogos', 'los ecos']
  },
  'Kessel': {
    cri: ['energy spiders en las galerías profundas', 'algo ciego en el fondo', 'insectos de mina', 'nada agradable'],
    pel: ['la mina', 'el Pasillo de Kessel al salir', 'un capataz pyke', 'los pulmones después de dos años'],
    fac: ['el Sindicato Pyke', 'los capataces', 'los esclavos de la mina', 'los contrabandistas del Pasillo'],
    hit: ['las minas de especia', 'el Pasillo de Kessel', 'la torre de control', 'la galería profunda'],
    bie: ['especia', 'coaxium', 'esclavos', 'rutas'],
    aut: 'el Sindicato Pyke',
    cli: ['atmósfera fina y mala', 'polvo de especia', 'una luz mortecina'],
    com: ['rancho de mina', 'agua con sabor a especia', 'nada bueno'],
    gen: ['los esclavos', 'los capataces pyke', 'los contrabandistas', 'gente que no sale de aquí']
  },
  'Cantonica': {
    cri: ['un fathier de carreras', 'aves de jardín importadas', 'perros de casino', 'nada nativo, todo traído'],
    pel: ['una deuda de casino', 'el desierto que empieza donde acaba la ciudad', 'un acreedor con recursos', 'saber de dónde sale el dinero'],
    fac: ['los casinos de Canto Bight', 'la policía de la ciudad', 'los traficantes de armas que veranean aquí', 'los mozos de cuadra'],
    hit: ['Canto Bight', 'el hipódromo de fathier', 'la playa artificial', 'las cuadras'],
    bie: ['fichas', 'armas al por mayor', 'discreción', 'fathier'],
    aut: 'la policía de Canto Bight, comprada',
    cli: ['desierto fuera, primavera dentro', 'noches de luces', 'nunca llueve'],
    com: ['cena de veinte platos', 'champán de otro sistema', 'lo que comen los mozos, que es otra cosa'],
    gen: ['los ricos', 'los crupieres', 'los mozos de cuadra', 'los niños que trabajan y nadie mira']
  },
  'Batuu': {
    cri: ['aves de meseta', 'reptiles de ruina', 'bestias de carga', 'algo que anida en las petrificadas'],
    pel: ['la Primera Orden preguntando', 'un trato en el Mercado Negro', 'las ruinas de noche', 'un piloto con prisa'],
    fac: ['el Mercado de los Comerciantes', 'la resistencia escondida', 'la Primera Orden', 'los pilotos de paso'],
    hit: ['el Puesto Avanzado de Black Spire', 'las agujas petrificadas', 'la cantina de Oga', 'el astillero de reparación'],
    bie: ['piezas raras', 'información de rutas', 'contrabando', 'bebida cara'],
    aut: 'Oga Garra, en la práctica',
    cli: ['clima de meseta', 'vientos secos', 'noches con muchas estrellas'],
    com: ['guiso de puesto', 'bebida de la cantina de Oga', 'pan de viaje'],
    gen: ['los comerciantes', 'los pilotos', 'gente escondiéndose', 'los lugareños tercos']
  },
  'Endor': {
    cri: ['ewoks, que no son tan simpáticos como parecen', 'un gorax de las montañas', 'un boar-wolf', 'aves de dosel'],
    pel: ['una trampa de madera perfectamente hecha', 'un gorax', 'la guarnición imperial', 'ofender a una aldea'],
    fac: ['las aldeas ewok', 'la guarnición imperial del generador', 'los duloks', 'quien se esconda aquí'],
    hit: ['la aldea en los árboles', 'el generador de escudo', 'el bosque de secuoyas', 'la trampa grande'],
    bie: ['nada industrial', 'pieles', 'miel', 'trampas'],
    aut: 'el jefe de la aldea, y el chamán detrás',
    cli: ['bosque templado y húmedo', 'niebla entre los troncos', 'lluvia fina'],
    com: ['carne asada en la aldea', 'miel', 'bebida fermentada'],
    gen: ['los ewoks', 'los soldados imperiales', 'los exploradores', 'gente muy pequeña y muy organizada']
  },
  'Trandosha': {
    cri: ['presas criadas para la caza', 'depredadores de jungla dura', 'aves de risco', 'lo que sea que cuelgue en la pared'],
    pel: ['ser considerado presa', 'una casa de trofeos', 'la jungla', 'un trandoshano que necesita puntos'],
    fac: ['los clanes cazadores', 'los esclavistas', 'el gremio de trofeos', 'los que trafican con wookiees'],
    hit: ['la sala de trofeos del clan', 'la jungla dura', 'el mercado de esclavos', 'el risco de la caza'],
    bie: ['trofeos', 'esclavos', 'armas de caza', 'permisos de coto'],
    aut: 'el clan que más puntos tenga con la Diosa',
    cli: ['calor y humedad', 'tormentas fuertes', 'noches con ruido'],
    com: ['carne cruda si eres de aquí', 'guiso si no', 'licor espeso'],
    gen: ['los trandoshanos', 'los cazadores', 'los esclavistas', 'los esclavos']
  },
  'Ilum': {
    cri: ['nada vive aquí', 'algo que se mueve en las cuevas y no es un animal', 'ni un insecto', 'el hielo, que casi parece vivo'],
    pel: ['la ventisca de superficie', 'una cueva que se cierra', 'lo que te enseña el cristal', 'quedarte sin luz'],
    fac: ['la Orden Jedi, mientras existió', 'los guardianes del templo', 'el Imperio, después', 'nadie'],
    hit: ['el Templo de cristal', 'las cuevas que cantan', 'la superficie helada', 'el corazón del cristal'],
    bie: ['kyber, y no se vende', 'nada más', 'silencio', 'una prueba'],
    aut: 'la Orden, y luego los que la vaciaron',
    cli: ['frío absoluto', 'ventiscas que duran semanas', 'un sol lejano y pálido'],
    com: ['lo que traigas', 'nieve derretida', 'ayuno, normalmente'],
    gen: ['los iniciados', 'los guardianes', 'nadie', 'los después, mineros imperiales']
  },
  'Ilum Profundo': {
    cri: ['nada', 'ecos', 'el hielo que cruje como si respirara', 'lo que te acompaña ahí abajo'],
    pel: ['la cueva que se cierra detrás de ti', 'el frío', 'lo que te enseña el cristal de ti mismo', 'la oscuridad total'],
    fac: ['nadie', 'los que bajaron antes', 'lo que dejaron', 'tú'],
    hit: ['las cuevas de cristal', 'la cámara del canto', 'el pozo helado', 'la veta madre'],
    bie: ['kyber', 'nada que se pueda vender', 'una respuesta', 'una prueba'],
    aut: 'ninguna',
    cli: ['frío que atraviesa cualquier traje', 'un silencio con eco', 'oscuridad'],
    com: ['nada', 'agua de deshielo', 'lo que lleves'],
    gen: ['nadie', 'los iniciados', 'los ecos', 'los el que baje']
  },
  'Exegol': {
    cri: ['nada que se pueda llamar animal', 'sombras que se mueven mal', 'algo bajo la ciudadela', 'nada natural'],
    pel: ['aterrizar', 'las tormentas de rayos', 'lo que hay en la ciudadela', 'saber que estás aquí'],
    fac: ['los Sith Eternos', 'los cultistas', 'la flota escondida', 'nadie que hable'],
    hit: ['la ciudadela de los Sith', 'el trono', 'los astilleros ocultos', 'el altar'],
    bie: ['nada', 'flotas', 'lealtad', 'una promesa que no deberías aceptar'],
    aut: 'algo que lleva demasiado tiempo mandando',
    cli: ['tormenta eléctrica permanente', 'sin sol', 'un aire que sabe a metal'],
    com: ['nada', 'lo que traigas', 'nadie come aquí'],
    gen: ['los cultistas', 'nadie', 'las sombras', 'gente que ya no es gente']
  },
  'Korriban': {
    cri: ['un tuk\'ata guardando las tumbas', 'un shyrack de las cuevas', 'k\'lor\'slug en los sepulcros', 'nada vivo por gusto'],
    pel: ['entrar en una tumba', 'lo que susurra el valle', 'una prueba de la Academia', 'otro aspirante'],
    fac: ['la Academia Sith', 'los guardianes de las tumbas', 'los aspirantes', 'los espíritus que no se van'],
    hit: ['el Valle de los Señores Oscuros', 'la Academia', 'la tumba de Marka Ragnos', 'el desierto de arena roja'],
    bie: ['reliquias', 'holocrones', 'aprendices', 'nada honesto'],
    aut: 'el Señor Oscuro de turno',
    cli: ['viento seco que suena a voces', 'sol rojizo', 'noches en las que se oye demasiado'],
    com: ['raciones de academia', 'agua de cisterna', 'poco y a destiempo'],
    gen: ['los aspirantes', 'los acólitos', 'los guardianes', 'los muertos que no callan']
  },
  'Scarif': {
    cri: ['peces de arrecife tropical', 'aves de palmera', 'algo grande en el mar abierto', 'crustáceos de playa'],
    pel: ['el escudo planetario cerrándose', 'la guarnición', 'una tormenta tropical', 'estar donde no te toca'],
    fac: ['la guarnición imperial', 'los archiveros', 'los técnicos del escudo', 'los pocos civiles con permiso'],
    hit: ['la Ciudadela de datos', 'las playas', 'la puerta del escudo', 'la torre de comunicaciones'],
    bie: ['datos', 'permisos de acceso', 'nada más', 'palmeras, técnicamente'],
    aut: 'el comandante de la guarnición',
    cli: ['tropical de postal', 'lluvias cortas', 'un sol que no cuadra con lo que pasa aquí'],
    com: ['comedor de guarnición', 'fruta local', 'raciones'],
    gen: ['los soldados', 'los archiveros', 'los técnicos', 'nadie que no tenga autorización']
  },
  'Saleucami': {
    cri: ['ganado de oasis', 'reptiles de desierto', 'aves de charca', 'algo que ronda las granjas de noche'],
    pel: ['un desertor que no quiere que le encuentres', 'el desierto entre oasis', 'una banda de saqueadores', 'la sequía'],
    fac: ['los granjeros de oasis', 'los desertores escondidos', 'las bandas del desierto', 'quien pase buscando gente'],
    hit: ['los oasis dispersos', 'la granja de la loma', 'el desierto entre medias', 'el pozo grande'],
    bie: ['grano de oasis', 'ganado', 'silencio', 'refugio'],
    aut: 'nadie: por eso vienen aquí los que huyen',
    cli: ['calor seco', 'noches frescas', 'lluvias raras y bienvenidas'],
    com: ['guiso de granja', 'pan de oasis', 'agua fresca de pozo'],
    gen: ['los granjeros', 'los desertores', 'gente que cambió de nombre', 'los saqueadores']
  },
  'Rishi': {
    cri: ['anguilas eel de Rishi, y son grandes', 'aves marinas', 'crustáceos de roca', 'algo en las cuevas de la isla'],
    pel: ['las anguilas', 'una tormenta de archipiélago', 'un puesto de escucha comprometido', 'el mar entre islas'],
    fac: ['el puesto de escucha militar', 'los pocos pescadores', 'quien quiera esa estación', 'nadie más'],
    hit: ['el puesto de escucha en la roca', 'las islas', 'la cueva de las anguilas', 'la playa negra'],
    bie: ['pescado', 'posición estratégica', 'nada más', 'aviso temprano'],
    aut: 'quien tenga la estación',
    cli: ['tormentas de mar', 'sol entre nubes', 'viento constante'],
    com: ['pescado', 'raciones de puesto', 'agua de lluvia'],
    gen: ['los soldados', 'los pescadores', 'los técnicos', 'casi nadie']
  },
  'Felucia Sur': {
    cri: ['gelagrubs enormes', 'acklay rojos', 'insectos que zumban en tu cabeza', 'algo que se mueve entre las esporas'],
    pel: ['las esporas rojas, que te hablan', 'perder tres días sin darte cuenta', 'un acklay', 'confiar en lo que ves'],
    fac: ['los chamanes de las esporas', 'las aldeas rojas', 'los recolectores', 'los que no salieron'],
    hit: ['el bosque de hongos rojos', 'el claro de los sueños', 'la aldea de raíz', 'el río rojo'],
    bie: ['esporas alucinógenas', 'medicinas', 'guías', 'visiones a la venta'],
    aut: 'los chamanes',
    cli: ['humedad roja', 'una luz que tiñe todo', 'lluvia tibia'],
    com: ['hongo rojo, con cuidado', 'raíces', 'infusión de la aldea'],
    gen: ['los felucianos del sur', 'los chamanes', 'los recolectores', 'gente que ya no distingue del todo']
  },
  'Zeffo': {
    cri: ['bestias de tumba', 'aves de viento', 'algo que anida en los sarcófagos', 'nada que hable'],
    pel: ['un mecanismo de tumba de mil años', 'el viento del páramo', 'saqueadores imperiales', 'lo que los Zeffo dejaron cerrado'],
    fac: ['las excavaciones imperiales', 'los saqueadores', 'los arqueólogos', 'los Zeffo, que ya no están'],
    hit: ['las tumbas ventosas', 'el templo de la montaña', 'la aldea abandonada', 'la mina imperial'],
    bie: ['artefactos zeffo', 'información', 'nada legal', 'herramientas de excavación'],
    aut: 'el oficial imperial de la excavación',
    cli: ['viento que no para', 'lluvia fría', 'cielos grises'],
    com: ['raciones de campamento', 'té caliente', 'poco más'],
    gen: ['los arqueólogos', 'los soldados', 'los saqueadores', 'los fantasmas de una civilización que se fue']
  },
  'Nur': {
    cri: ['criaturas de océano oscuro', 'algo enorme en la fosa', 'peces sin ojos', 'nada agradable'],
    pel: ['la fortaleza', 'la presión', 'los Inquisidores', 'no salir'],
    fac: ['la Inquisitorius', 'la guarnición', 'los prisioneros', 'nadie que elija estar aquí'],
    hit: ['la Fortaleza Inquisitorius bajo el agua', 'la fosa', 'la plataforma de superficie', 'las celdas'],
    bie: ['información sacada a la fuerza', 'nada', 'nada', 'nada'],
    aut: 'el Gran Inquisidor',
    cli: ['océano negro', 'tormentas de superficie', 'una oscuridad total abajo'],
    com: ['raciones de guarnición', 'nada por gusto', 'agua desalada'],
    gen: ['los inquisidores', 'los guardias', 'los prisioneros', 'los técnicos que no preguntan']
  },
  'Wobani': {
    cri: ['insectos de barro', 'ratas de barracón', 'perros de guardia', 'aves carroñeras'],
    pel: ['un turno de dieciséis horas', 'un guardia aburrido', 'una infección', 'intentar escapar'],
    fac: ['la administración imperial del campo', 'los presos', 'los guardias', 'los que organizan algo por dentro'],
    hit: ['el campo de trabajo', 'la alambrada', 'el barracón cuatro', 'la cantera'],
    bie: ['favores', 'raciones extra', 'información', 'nada que se pueda tocar'],
    aut: 'el comandante del campo',
    cli: ['barro', 'lluvia constante', 'frío que se mete'],
    com: ['rancho aguado', 'pan de campo', 'lo que consigas cambiar'],
    gen: ['los presos', 'los guardias', 'gente que no debería estar aquí', 'gente que sí']
  },
  'Akiva': {
    cri: ['insectos de jungla', 'aves de tejado', 'monos de ruina', 'algo en el río'],
    pel: ['los restos imperiales conspirando', 'una revuelta de calle', 'la jungla que se come la ciudad', 'un satrap corrupto'],
    fac: ['el satrap de Myrra', 'los oficiales imperiales refugiados', 'la resistencia de calle', 'los comerciantes'],
    hit: ['Myrra y sus tejados', 'el palacio del satrap', 'la jungla que rodea todo', 'el mercado de la plaza'],
    bie: ['información imperial', 'chatarra de guerra', 'especia', 'refugio'],
    aut: 'el satrap, mientras dure',
    cli: ['calor húmedo', 'lluvias de tarde', 'noches con mucha gente fuera'],
    com: ['comida de puesto especiada', 'fruta de jungla', 'cerveza local'],
    gen: ['los akivanos', 'los imperiales escondidos', 'los comerciantes', 'gente que quiere que esto cambie']
  },
  'Chalmun': {
    cri: ['bichos de bodega', 'un lagarto que vive detrás de la barra', 'aves de tejado', 'nada nativo'],
    pel: ['una pelea de cantina', 'un tipo que ha bebido de más y va armado', 'un trato en el reservado', 'el desierto de fuera'],
    fac: ['los dueños de la cantina', 'las bandas de paso', 'los músicos', 'los que van a contratar a alguien'],
    hit: ['la barra que no acaba nunca', 'los reservados', 'el escenario de la banda', 'el aparcamiento de speeders'],
    bie: ['bebida', 'contratos', 'información', 'silencio'],
    aut: 'el dueño y su escopeta bajo la barra',
    cli: ['fuera hace un calor de muerte', 'dentro, fresco y oscuro', 'polvo en todo'],
    com: ['bebida de todo tipo', 'algo frito', 'agua carísima'],
    gen: ['los contrabandistas', 'los músicos', 'los cazarrecompensas', 'gente de paso siempre']
  },
  'Vandor': {
    cri: ['bestias de montaña peludas', 'aves de risco', 'lobos de nieve', 'ganado de altura'],
    pel: ['un atraco al tren de mineral', 'la ventisca de la montaña', 'una banda de Enfys Nest', 'el precipicio junto a la vía'],
    fac: ['la compañía del tren', 'los Cloud-Riders', 'los mineros', 'la taberna de Fort Ypso'],
    hit: ['el conveyex sobre el precipicio', 'Fort Ypso', 'la montaña nevada', 'la mina de coaxium'],
    bie: ['coaxium', 'pieles', 'información de horarios', 'apuestas de sabacc'],
    aut: 'la compañía, cuando el tren llega',
    cli: ['nieve casi siempre', 'viento de montaña', 'sol frío entre nubes'],
    com: ['guiso caliente en Fort Ypso', 'licor que quema', 'carne de montaña'],
    gen: ['los mineros', 'los atracadores', 'los ferroviarios', 'gente dura de montaña']
  },
  'Savareen': {
    cri: ['aves de costa', 'peces de aguas frías', 'algo grande en el mar', 'cabras de acantilado'],
    pel: ['los piratas que ya vinieron una vez', 'la refinería si algo sale mal', 'el mar', 'un trato que sale torcido'],
    fac: ['los refineros de coaxium', 'los pescadores', 'los piratas de Enfys', 'los compradores de fuera'],
    hit: ['la refinería sobre el acantilado', 'la aldea de la costa', 'la playa gris', 'el embarcadero'],
    bie: ['coaxium refinado', 'licor de Savareen', 'pescado', 'discreción'],
    aut: 'la aldea, y quien traiga más armas ese día',
    cli: ['viento de costa', 'niebla de mar', 'sol pálido'],
    com: ['pescado a la brasa', 'licor de Savareen', 'pan de costa'],
    gen: ['los refineros', 'los pescadores', 'gente marcada por lo que pasó', 'los contrabandistas']
  },
  'Kef Bir': {
    cri: ['un orbak de monta', 'aves marinas', 'peces de oleaje', 'algo entre los restos'],
    pel: ['el oleaje contra los restos', 'entrar en la estación hundida', 'una tormenta', 'lo que hay dentro'],
    fac: ['los jinetes de orbak', 'los pocos colonos', 'buscadores de restos', 'nadie más'],
    hit: ['los restos de la Estrella de la Muerte en el oleaje', 'la aldea de los jinetes', 'el acantilado', 'el mar sin fin'],
    bie: ['chatarra imperial', 'orbaks', 'pescado', 'guías al pecio'],
    aut: 'los jinetes, informalmente',
    cli: ['viento y sal', 'oleaje constante', 'cielos grises'],
    com: ['pescado', 'pan de aldea', 'guiso de mar'],
    gen: ['los jinetes de orbak', 'los colonos', 'los buscadores', 'gente que vive mirando un cadáver de metal']
  },
  'Crait': {
    cri: ['un vulptex, el zorro de cristal', 'nada más grande', 'insectos de sal', 'aves que anidan en la mina'],
    pel: ['la sal roja bajo la costra blanca', 'una mina vieja que cede', 'estar en campo abierto', 'la sed'],
    fac: ['nadie ahora', 'una base rebelde vieja', 'mineros de sal, hace mucho', 'quien se esconda'],
    hit: ['la llanura de sal blanca sobre tierra roja', 'la mina abandonada', 'la puerta blindada', 'el horizonte rojo'],
    bie: ['sal', 'cristales de vulptex', 'nada más', 'refugio'],
    aut: 'ninguna',
    cli: ['seco y blanco', 'viento que levanta polvo rojo', 'un sol duro'],
    com: ['raciones', 'agua traída', 'nada crece aquí'],
    gen: ['nadie', 'los refugiados', 'los zorros', 'los ecos de una batalla']
  },
  'Ajan Kloss': {
    cri: ['insectos de liana', 'aves de dosel', 'serpientes de rama', 'algo que se acerca al campamento'],
    pel: ['la humedad y lo que hace al equipo', 'perderte', 'una patrulla que pasa cerca', 'la jungla de noche'],
    fac: ['la base escondida', 'nadie más', 'exploradores', 'quien busque la base'],
    hit: ['el claro del campamento', 'las lianas gigantes', 'la cueva de entrenamiento', 'el río'],
    bie: ['nada', 'refugio', 'entrenamiento', 'secreto'],
    aut: 'quien mande en la base',
    cli: ['calor húmedo', 'lluvia diaria', 'noches ruidosas'],
    com: ['raciones de campamento', 'fruta de jungla', 'agua hervida'],
    gen: ['los rebeldes', 'los pilotos', 'los mecánicos', 'nadie nativo']
  },
  'Pasaana': {
    cri: ['orbaks y bestias de festival', 'serpientes de arena', 'vexis en las cuevas', 'aves carroñeras'],
    pel: ['las arenas movedizas del Mar de Arena', 'una vexis en el túnel', 'la sed', 'el festival, si te buscan'],
    fac: ['los Aki-Aki', 'los peregrinos del festival', 'quien venga a buscar algo', 'nadie estable'],
    hit: ['el Festival de los Ancestros', 'el Mar de Arenas Movedizas', 'las cuevas bajo la arena', 'el desierto de Lurch'],
    bie: ['artesanía de festival', 'agua', 'guías', 'reliquias sacadas de abajo'],
    aut: 'los ancianos aki-aki, cada cuarenta y dos años',
    cli: ['calor seco', 'viento que mueve las dunas', 'noches limpias'],
    com: ['comida de festival', 'agua fresca del pozo', 'dulce de raíz'],
    gen: ['los aki-aki', 'los peregrinos', 'los forasteros de paso', 'gente que solo viene una vez en la vida']
  },
  'Kijimi': {
    cri: ['aves de tejado helado', 'ratas de callejón', 'perros de banda', 'nada nativo grande'],
    pel: ['la Primera Orden en las calles', 'un ladrón mejor que tú', 'la ventisca de montaña', 'un callejón cerrado'],
    fac: ['los Ladrones Espectrales', 'la ocupación de la Primera Orden', 'los rompedores de droides', 'los gremios de callejón'],
    hit: ['la ciudad en escalones sobre la montaña', 'el taller de Babu Frik', 'el callejón del mercado', 'los tejados nevados'],
    bie: ['piezas robadas', 'trabajo de droide ilegal', 'abrigos buenos', 'rutas de tejado'],
    aut: 'nadie, y la Primera Orden lo intenta',
    cli: ['nieve constante', 'frío de montaña', 'noches con luces en las ventanas'],
    com: ['guiso caliente de puesto', 'té con licor', 'pan de horno de callejón'],
    gen: ['los ladrones', 'los rompedores de droides', 'gente con muy buen abrigo', 'los soldados nuevos']
  },
  'Corvus': {
    cri: ['aves de ceniza', 'reptiles de bosque quemado', 'ganado escaso', 'nada que prospere'],
    pel: ['la magistrada y sus guardias', 'el muro y quién está fuera', 'una redada', 'hablar de más'],
    fac: ['la magistrada de Calodan', 'los aldeanos', 'los que se esconden en el bosque', 'los mercenarios contratados'],
    hit: ['la ciudad amurallada de Calodan', 'el bosque de ceniza', 'el jardín de la magistrada', 'la puerta'],
    bie: ['grano requisado', 'armas', 'información', 'protección'],
    aut: 'la magistrada, con guardias pagados',
    cli: ['ceniza en el aire', 'niebla gris', 'un sol apagado'],
    com: ['lo que dejan las requisas', 'té amargo', 'pan racionado'],
    gen: ['los aldeanos', 'los guardias mercenarios', 'gente asustada', 'los del bosque']
  },
  'Orto Plutonia': {
    cri: ['un narglatch de la nieve', 'bestias de carga talz', 'aves de tundra', 'algo que te ha estado mirando'],
    pel: ['un narglatch', 'la ventisca', 'malinterpretar a los talz', 'la noche'],
    fac: ['los talz', 'una guarnición que no debería estar', 'los pantoranos que reclaman la luna', 'nadie más'],
    hit: ['la llanura helada', 'el campamento talz', 'la base abandonada', 'el paso de hielo'],
    bie: ['pieles', 'nada más', 'guías talz', 'refugio'],
    aut: 'el jefe talz, y le costó que lo reconocieran',
    cli: ['ventisca', 'silencio blanco', 'frío que no cede'],
    com: ['carne cruda curada', 'nieve derretida', 'lo que traigas'],
    gen: ['los talz', 'los soldados', 'los exploradores', 'muy poca gente']
  },
  'Honoghr': {
    cri: ['kholm-grass, que ya casi no queda', 'insectos resistentes', 'aves envenenadas', 'poco vivo'],
    pel: ['el suelo, que está muerto', 'una deuda de honor que dura generaciones', 'una tormenta tóxica', 'descubrir la verdad'],
    fac: ['los clanes noghri', 'los que les mantienen la deuda', 'los que descubren el engaño', 'los ancianos'],
    hit: ['los campos muertos', 'la aldea de clan', 'el monumento a la deuda', 'los invernaderos'],
    bie: ['guerreros noghri', 'lealtad', 'nada material', 'una mentira sostenida'],
    aut: 'los ancianos de clan, y quien les engañó',
    cli: ['polvo tóxico', 'cielos amarillos', 'lluvias que no ayudan'],
    com: ['lo que crece en invernadero', 'raciones traídas de fuera', 'agua tratada'],
    gen: ['los noghri', 'los ancianos', 'los guerreros', 'gente que debe algo desde antes de nacer']
  },
  'Gamorr': {
    cri: ['jabalíes de bosque', 'aves de pantano', 'perros de guerra', 'insectos gordos'],
    pel: ['una guerra de clanes que hoy toca', 'un hacha', 'el bosque húmedo', 'ofender a una matriarca'],
    fac: ['los clanes gamorreanos', 'las matriarcas que mandan de verdad', 'los que exportan guardaespaldas', 'nadie más'],
    hit: ['el fuerte de madera', 'el campo de batalla ritual', 'el bosque húmedo', 'la aldea de las matriarcas'],
    bie: ['guardaespaldas', 'hachas', 'cerveza', 'carne'],
    aut: 'las matriarcas. Los machos solo pelean',
    cli: ['húmedo y templado', 'lluvia frecuente', 'barro'],
    com: ['carne y más carne', 'cerveza espesa', 'pan basto'],
    gen: ['los gamorreanos', 'las matriarcas', 'los guerreros de temporada', 'los reclutadores de fuera']
  },
  'Uvena Prime': {
    cri: ['lobos de bosque boreal', 'aves de presa', 'ciervos grandes', 'algo que sigue tu rastro'],
    pel: ['un depredador con paciencia', 'la noche de dos lunas', 'perderte en el boreal', 'un cazador rival'],
    fac: ['los clanes shistavanen', 'los rastreadores', 'los pocos forasteros', 'los que exportan cazadores'],
    hit: ['el bosque boreal', 'la aldea de troncos', 'el risco de las dos lunas', 'el río helado'],
    bie: ['pieles', 'rastreo', 'carne curada', 'guías'],
    aut: 'el jefe de manada',
    cli: ['inviernos largos', 'dos lunas que confunden las sombras', 'nieve de temporada'],
    com: ['carne asada', 'raíces', 'bebida fuerte'],
    gen: ['los shistavanen', 'los rastreadores', 'los cazadores', 'gente que habla poco']
  },
  'Kubindi': {
    cri: ['insectos de todo tipo, y aquí se comen', 'colmenas enteras', 'aves que comen insectos', 'nada grande'],
    pel: ['una plaga de temporada', 'el calor árido', 'un trato de datos que sale mal', 'una colmena defendiéndose'],
    fac: ['las colmenas kubaz', 'los corredores de información', 'los criadores de insectos', 'los compradores de fuera'],
    hit: ['las colmenas de barro', 'el mercado de datos', 'los criaderos', 'el páramo árido'],
    bie: ['información', 'insectos criados', 'espionaje', 'nada visible'],
    aut: 'las colmenas, que negocian entre sí',
    cli: ['seco y caliente', 'temporada de enjambres', 'noches frescas'],
    com: ['insectos, en cien preparaciones', 'pasta de larva', 'agua'],
    gen: ['los kubaz', 'los informadores', 'los criadores', 'gente con gafas oscuras siempre']
  },
  'Af\'El': {
    cri: ['criaturas que ven en infrarrojo', 'nada que use luz visible', 'algo en las minas de metal', 'insectos de roca'],
    pel: ['la luz, que aquí ofende de verdad', 'una mina de duracero', 'el ultravioleta que no ves', 'ofender a un anfitrión'],
    fac: ['los clanes defel', 'las compañías mineras', 'los que exportan espías', 'los forasteros con permiso'],
    hit: ['la ciudad en penumbra', 'las minas de duracero', 'el páramo metálico', 'la sala sin lámparas'],
    bie: ['duracero', 'espías que no se ven', 'minerales', 'discreción literal'],
    aut: 'el consejo de clanes',
    cli: ['un sol que emite mal', 'penumbra permanente para ojos normales', 'viento metálico'],
    com: ['comida sin presentación, porque nadie la ve', 'carne de mina', 'bebida oscura'],
    gen: ['los defel', 'los mineros', 'los espías', 'los forasteros que van a tientas']
  },
  'Yuzzem': {
    cri: ['algo enorme entre los troncos', 'aves de copa', 'insectos gordos', 'depredadores que no atacan si no gritas'],
    pel: ['levantar la voz dos veces', 'un yuzzem enfadado', 'el bosque colosal', 'una compañía maderera'],
    fac: ['los clanes yuzzem', 'las compañías madereras', 'los que reclutan por la fuerza', 'los ancianos del bosque'],
    hit: ['el bosque colosal', 'la aldea entre raíces', 'el claro de las reuniones', 'el árbol más viejo'],
    bie: ['madera', 'fuerza de trabajo', 'pieles', 'nada industrial'],
    aut: 'los ancianos, y el que grite menos',
    cli: ['húmedo y verde', 'lluvia entre los troncos', 'niebla baja'],
    com: ['carne ahumada', 'raíces grandes', 'bebida fermentada'],
    gen: ['los yuzzem', 'los madereros', 'los ancianos', 'gente muy grande y muy tranquila']
  },
  'Lasan': {
    cri: ['aves de pradera alta', 'ganado de montaña', 'depredadores de risco', 'insectos de flor'],
    pel: ['lo que pasó aquí y sigue pasando', 'una patrulla imperial', 'la pradera abierta', 'recordar en voz alta'],
    fac: ['lo que queda de la Guardia de Honor', 'los pocos lasat que volvieron', 'la guarnición imperial', 'los saqueadores'],
    hit: ['las praderas altas', 'la ciudad arrasada', 'el monumento sin nombre', 'el templo vacío'],
    bie: ['reliquias lasat', 'bo-rifles', 'memoria', 'nada más'],
    aut: 'nadie desde la purga',
    cli: ['viento de altura', 'cielos enormes', 'inviernos limpios'],
    com: ['lo que crezca solo', 'carne de caza', 'agua de manantial'],
    gen: ['lasat, muy pocos', 'los saqueadores', 'los soldados', 'los silencio']
  },
  'Anaxes': {
    cri: ['nada nativo relevante', 'aves de acantilado', 'peces de bahía', 'perros de academia'],
    pel: ['un simulacro que sale mal', 'un consejo de guerra', 'un instructor con manía', 'un accidente de vuelo'],
    fac: ['la Academia Naval', 'el Estado Mayor', 'los cadetes', 'los astilleros de defensa'],
    hit: ['la Academia', 'el simulador grande', 'los acantilados de la bahía', 'la sala de mapas'],
    bie: ['formación', 'destinos', 'contactos de promoción', 'reputación'],
    aut: 'el almirante que dirija la Academia',
    cli: ['costa fría', 'niebla de mañana', 'días de formación bajo la lluvia'],
    com: ['comedor de cadetes', 'café malo a todas horas', 'lo que se cuele de fuera'],
    gen: ['los cadetes', 'los oficiales', 'los instructores', 'gente que lleva uniforme desde los quince']
  },
  'Csilla': {
    cri: ['algo que caza bajo el hielo', 'peces de lago subglaciar', 'aves que no salen a la superficie', 'nada visible'],
    pel: ['la superficie sin traje', 'una purga de familia', 'decir algo impreciso', 'el hielo que se mueve'],
    fac: ['las Familias Gobernantes', 'la Flota de Defensa Chiss', 'las casas menores', 'el Sindicato Expansionista'],
    hit: ['las ciudades bajo el glaciar', 'la sala del Consejo', 'la superficie muerta', 'la academia militar'],
    bie: ['información', 'promoción', 'tecnología de flota', 'silencio disciplinado'],
    aut: 'las Familias Gobernantes',
    cli: ['glaciar en superficie', 'temperatura constante abajo', 'una luz siempre artificial'],
    com: ['comida precisa y medida', 'té caliente', 'nada superfluo'],
    gen: ['los chiss', 'los oficiales', 'gente de Familia', 'nadie de fuera, casi nunca']
  },
  'Alpheridies': {
    cri: ['criaturas que no usan ojos', 'aves de eco', 'nada que necesite luz', 'insectos de calor'],
    pel: ['confiar en lo que ves', 'el sol infrarrojo', 'un miraluka que ya sabe lo que piensas', 'perderte sin eco'],
    fac: ['las comunidades miraluka', 'los templos de la Visión', 'los que enseñan a ver sin ojos', 'los forasteros con guía'],
    hit: ['la ciudad sin lámparas', 'el templo de la Visión', 'el valle infrarrojo', 'la sala de meditación'],
    bie: ['enseñanza', 'artesanía táctil', 'guías', 'perspectiva'],
    aut: 'los maestros de los templos',
    cli: ['una luz que tus ojos no captan', 'calor constante', 'sin días ni noches como tú los entiendes'],
    com: ['comida por textura y olor', 'infusión caliente', 'pan denso'],
    gen: ['los miraluka', 'los maestros', 'los guías', 'los forasteros muy desorientados']
  },
  'Taris': {
    cri: ['un rakghoul de los niveles bajos', 'un kinrath de las ruinas', 'ratas de nivel', 'algo peor abajo del todo'],
    pel: ['bajar a los Niveles Inferiores', 'la plaga rakghoul', 'una banda de las Alturas', 'una estructura de siglos que cede'],
    fac: ['las bandas de las Alturas', 'los Ocultos de abajo', 'los buscadores de reliquias', 'lo que quedó del bombardeo'],
    hit: ['los Niveles Superiores en ruinas', 'los Niveles Inferiores', 'la Ciudad Baja', 'el cráter del bombardeo'],
    bie: ['reliquias', 'medicinas contra la plaga', 'piezas', 'rutas seguras'],
    aut: 'la banda que controle tu nivel',
    cli: ['lluvia entre ruinas', 'polvo de escombro', 'un cielo que se ve a trozos'],
    com: ['lo que se cultive en un tejado', 'raciones viejas', 'agua filtrada'],
    gen: ['los supervivientes', 'las bandas', 'los buscadores', 'gente que no ha salido de su nivel']
  },
  'Ord Mantell': {},
  'Coruscant Nivel 1313': {
    cri: ['ratas de conducto', 'algo que se cría en las alcantarillas', 'perros sin dueño', 'insectos de cableado'],
    pel: ['una banda que cobra por pasar', 'un droide de seguridad averiado', 'un tramo sin luz', 'un tratante de niños'],
    fac: ['las bandas del 1313', 'el Sol Negro', 'los tratantes', 'los que viven aquí y no se meten'],
    hit: ['el nivel 1313', 'el mercado sin licencia', 'los conductos de ventilación', 'la escalera al 1200'],
    bie: ['todo lo robado de arriba', 'información', 'niños, por desgracia', 'rutas'],
    aut: 'la banda de tu manzana',
    cli: ['nunca hay sol', 'aire caliente de máquina', 'goteras de mil niveles'],
    com: ['fideos de puesto', 'proteína prensada', 'agua de conducto hervida'],
    gen: ['los chavales de la calle', 'las bandas', 'gente que nunca subió', 'los aliens sin papeles']
  },
  'Bespin': {
    cri: ['un beldon enorme entre las capas', 'un rawwk de plataforma', 'un velker de las corrientes', 'un ave de nube'],
    pel: ['caer', 'una fuga de tibanna', 'un cambio de administración con visita imperial', 'las corrientes de capa baja'],
    fac: ['la administración de Ciudad Nube', 'el gremio de mineros de gas', 'los ugnaught de mantenimiento', 'el Sindicato de paso'],
    hit: ['Ciudad Nube', 'la plataforma de carbonita', 'el mirador de nubes', 'los refinadores de tibanna'],
    bie: ['gas tibanna', 'apuestas de sabacc', 'permisos de plataforma', 'discreción'],
    aut: 'el Barón Administrador',
    cli: ['un atardecer que dura horas', 'tormentas de capa', 'nubes doradas'],
    com: ['cena de plataforma cara', 'licor de altura', 'lo que comen los ugnaught abajo'],
    gen: ['gente de plataforma', 'los ugnaught', 'los mineros de gas', 'los ricos que vienen a no ser vistos']
  },
  'Nar Shaddaa': {
    cri: ['ratas de nivel', 'algo que vive en los conductos y crece', 'aves de neón', 'perros de banda'],
    pel: ['un trato en un callejón', 'una banda de nivel', 'caer entre dos edificios', 'deberle algo a un hutt'],
    fac: ['los cárteles hutt', 'el Sol Negro', 'las bandas de nivel', 'los gremios de contrabandistas'],
    hit: ['el Promenade', 'los muelles de contrabando', 'la torre de los hutt', 'los niveles hundidos'],
    bie: ['todo, literalmente', 'especia', 'identidades', 'armas sin número'],
    aut: 'el hutt que controle tu sector',
    cli: ['neón en vez de sol', 'lluvia sucia entre niveles', 'un aire que sabe a combustible'],
    com: ['comida de puesto de veinte especies', 'licor de todo el sector', 'agua embotellada cara'],
    gen: ['los contrabandistas', 'los refugiados', 'los matones', 'gente de todas las especies y ninguna ley']
  },
  'Mundo sin nombre': {
    cri: ['algo que no está en ningún catálogo', 'aves que no deberían volar así', 'nada identificable', 'lo que sea que hizo esas huellas'],
    pel: ['no saber dónde estás', 'lo que sea que vive aquí', 'quedarte sin combustible', 'que alguien te encuentre'],
    fac: ['nadie', 'lo que sea que dejó esas ruinas', 'otro naufragio', 'nada humano'],
    hit: ['las ruinas sin nombre', 'el valle que no aparece en las cartas', 'el lago negro', 'la estructura'],
    bie: ['nada', 'lo que rescates', 'una carta estelar', 'un secreto'],
    aut: 'ninguna',
    cli: ['un clima que no cuadra con nada', 'cielos raros', 'silencio'],
    com: ['lo que traigas', 'lo que te atrevas a probar', 'agua, si la encuentras'],
    gen: ['nadie', 'los náufragos', 'lo que sea', 'los tú y poco más']
  },
  'Anzat': {
    cri: ['nada visible', 'aves que no cantan', 'ganado que nadie cuida', 'algo que no deja huellas'],
    pel: ['un anzati con hambre', 'olvidar por qué viniste', 'la niebla del valle', 'quedarte a dormir'],
    fac: ['los anzati', 'nadie más', 'los que vienen a contratar asesinos', 'los que no vuelven'],
    hit: ['el valle de las casas vacías', 'la ciudad quieta', 'el bosque sin ruido', 'la posada'],
    bie: ['asesinatos', 'nada legal', 'olvido', 'sopa, dicen'],
    aut: 'nadie que se deje ver',
    cli: ['templado y quieto', 'niebla de valle', 'un silencio que no es normal'],
    com: ['nadie te ofrece nada', 'lo que traigas', 'no comas aquí'],
    gen: ['los anzati', 'nadie', 'los visitantes que no recuerdan', 'los silencio']
  }
  };

  /* ---- alias y mundos que comparten dosier ---- */
  SW.DOSIER['Ord Mantell'] = {
    cri: ['perros de chatarral', 'aves carroñeras enormes', 'roedores de feria', 'un bicho que anida en los motores'],
    pel: ['una milicia con la que no has hablado', 'un timo de feria', 'un desprendimiento de chatarra', 'un cazarrecompensas'],
    fac: ['las milicias separatistas locales', 'el gremio de chatarreros', 'los feriantes', 'el Sol Negro de paso'],
    hit: ['la feria permanente', 'el chatarral grande', 'el puerto de Worlport', 'el circuito de apuestas'],
    bie: ['chatarra', 'armas de segunda', 'boletos amañados', 'información de puerto'],
    aut: 'la milicia que controle tu barrio hoy',
    cli: ['polvo de chatarral', 'sol duro', 'lluvias que hacen barro naranja'],
    com: ['fritanga de feria', 'cerveza floja', 'brochetas de origen dudoso'],
    gen: ['los chatarreros', 'los feriantes', 'los milicianos', 'los timadores']
  };

  /* ============================================================
     ACCESO: siempre devuelve algo, nunca undefined
     ============================================================ */
  const CLAVES = ['cri', 'pel', 'fac', 'hit', 'bie', 'aut', 'cli', 'com', 'gen'];

  /* La coma abre un aparte de sabor ("mythosaurios, si crees en eso").
     Queda bien leyéndolo suelto y fatal metido en mitad de una frase,
     así que las plantillas reciben la versión corta. */
  const NEGATIVO = /^(nada|nadie|ning[uú]n|ninguna|ni un|poco |muy poco|casi nada|nunca|lo que (lleves|traigas|caces|haya|sea)|todo\b)/i;

  const corto = function (x) {
    const i = String(x).indexOf(',');
    return i > 0 ? String(x).slice(0, i) : String(x);
  };

  /* ============================================================
     RELOJ: lo que en este planeta todavía no existe (o ya no)
     El dosier describe cada mundo «en general», y eso hacía que en
     Lothal te cruzaras con la gente de Ezra doscientos años antes de
     que Ezra naciera, o que hubiera guarnición imperial en plena Alta
     República. Cada regla dice en qué ventana de años galácticos vale
     un texto; gana la primera que encaje, así que las excepciones van
     antes que la regla general.
     ============================================================ */
  SW.RELOJ_DOSIER = [
    // lo concreto primero
    { re: /\bezra\b/i,                                    desde: -5,    hasta: 1 },
    { re: /primera orden/i,                               desde: 21,    hasta: 9999 },
    { re: /inquisidor/i,                                  desde: -19,   hasta: -1 },
    { re: /estrella de la muerte/i,                       desde: 0,     hasta: 9999 },
    { re: /\bsaw\b|partisanos/i,                          desde: -19,   hasta: 1 },
    { re: /\bvader\b/i,                                   desde: -19,   hasta: 5 },
    { re: /cham syndulla/i,                               desde: -21,   hasta: 5 },
    { re: /unkar plutt/i,                                 desde: 5,     hasta: 9999 },
    { re: /ladrones espectrales/i,                        desde: 21,    hasta: 9999 },
    // «restos» del Imperio: eso sólo existe cuando el Imperio ya cayó
    { re: /restos imperiales|imperiales (refugiados|escondidos)|oficiales imperiales/i,
                                                          desde: 4,     hasta: 40 },
    // y el Imperio en activo: de la Proclamación al Concordato
    { re: /\bimperial|\bimperio\b|\bmoff\b|soldados imperiales/i,
                                                          desde: -19,   hasta: 12 },
    { re: /separatista|uni[oó]n tecno|confederaci[oó]n/i,  desde: -25,   hasta: -18 },
    { re: /\bclones\b|\bclon\b/i,                         desde: -32,   hasta: -8 }
  ];

  /** ¿Se puede decir esto en el año galáctico `y`? */
  SW.cabeEnElAnio = function (txt, y) {
    if (y == null) return true;
    const t = String(txt);
    for (let i = 0; i < SW.RELOJ_DOSIER.length; i++) {
      const r = SW.RELOJ_DOSIER[i];
      if (!r.re.test(t)) continue;
      return y >= r.desde && y <= r.hasta;      // gana la primera que encaje
    }
    return true;
  };

  SW.dosierDe = function (nombre, anio) {
    const propio = SW.DOSIER[nombre] || {};
    const bioma = (SW.biomaDe ? SW.biomaDe(nombre).id : 'rocoso');
    const fondo = SW.DOSIER_BIOMA[bioma] || SW.DOSIER_BIOMA.rocoso;
    const aTiempo = function (lista) {
      if (anio == null) return lista;
      const ok = lista.filter(function (x) { return SW.cabeEnElAnio(x, anio); });
      return ok.length ? ok : lista;      // antes un anacronismo que un hueco
    };
    const out = {};
    for (let i = 0; i < CLAVES.length; i++) {
      const k = CLAVES[i];
      let p = propio[k], f = fondo[k];
      if (k === 'aut') {
        // la autoridad de un mundo cambia con quien manda en la galaxia
        out[k] = corto((p && SW.cabeEnElAnio(p, anio) ? p : null) || f);
        continue;
      }
      p = p && p.length ? aTiempo(p) : p;
      // lo propio primero, el fondo de bioma detrás: nunca se queda seco
      const lista = ((p && p.length) ? p.concat(f || []) : (f || [])).map(corto);
      // "nada", "nadie", "ninguna"... quedan bien en una lista y fatal
      // metidos en una frase ("Ves de cerca nada terrestre"). Fuera.
      const util = lista.filter(function (x) { return !NEGATIVO.test(x); });
      out[k] = util.length ? util : lista;
    }
    /* {c} viene con su artículo puesto y en singular. No intentamos
       adivinar plurales: nos quedamos con lo que ya está bien escrito,
       y el fondo de bioma garantiza que a ningún mundo le falte fauna. */
    out.criCorto = out.cri
      .filter(function (x) { return !/^(algo|lo que|ni |eso\b|el hielo|la cadena|nada|nadie)/i.test(x); })
      .map(function (x) { return x.replace(/ que .*$/i, '').replace(/ del tamaño de .*$/i, '').trim(); })
      .map(function (x) {
        const m = /^(un|una|unos|unas|los|las|el|la)\s+/i.exec(x);
        return { art: m ? m[1].toLowerCase() : null, cuerpo: m ? x.slice(m[0].length) : x };
      })
      .filter(function (o) {
        if (['unos', 'unas', 'los', 'las'].indexOf(o.art) >= 0) return false;   // plural
        if (!o.art && (/s$/i.test(o.cuerpo.split(' ')[0]) || o.cuerpo.indexOf(' ') >= 0)) return false;
        return o.cuerpo.length > 1;
      })
      .map(function (o) {
        const a = o.art === 'el' ? 'un' : (o.art === 'la' ? 'una' : (o.art || 'un'));
        return a + ' ' + o.cuerpo;
      });
    if (!out.criCorto.length) out.criCorto = ['un animal de aquí'];
    return out;
  };

  /** el aparte largo de quién manda, para cuando la frase lo aguanta */
  SW.autoridadDe = function (nombre) {
    const p = SW.DOSIER[nombre] || {};
    const bioma = (SW.biomaDe ? SW.biomaDe(nombre).id : 'rocoso');
    return p.aut || (SW.DOSIER_BIOMA[bioma] || SW.DOSIER_BIOMA.rocoso).aut;
  };

  /** ¿cuántos mundos tienen dosier escrito a mano? (para los tests) */
  SW.dosierPropios = function () { return Object.keys(SW.DOSIER).length; };

})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   HOLOVIDA :: OFICIOS PROPIOS DEL RESTO DE MUNDOS
   data-mundos-local.js ya trae los de los 31 planetas grandes.
   Aquí van los otros 86, para que nadie sea "agricultor" en un
   planeta-banco ni "minero" en una estación orbital.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = global.SW;

  const OFI = {
    'Chandrila': ['asesor parlamentario', 'periodista de la Asamblea', 'viticultor de la costa', 'archivero público', 'profesor de instituto'],
    'Kuat': ['soldador orbital', 'inspector de casco', 'mozo de cuadra de una Casa', 'ingeniera de dique seco', 'contable de astillero'],
    'Dagobah': ['nada: aquí no hay oficios', 'náufrago', 'recolector de raíces', 'ermitaño'],
    'Sullust': ['operario de SoroSuub', 'topógrafo de túneles', 'soldador de línea', 'guía de galerías', 'controladora de ventilación'],
    'Iridonia': ['maestro de duelo', 'herrero de cañón', 'tallador de vivienda en roca', 'mercenaria de exportación'],
    'Shili': ['cazadora de akul', 'curtidor de pieles', 'narrador de la aldea', 'guía de sabana'],
    'Csilla': ['oficial de la Flota', 'analista de las Familias', 'técnico de glaciar', 'archivera de linajes'],
    'Scarif': ['archivero imperial', 'técnico de escudo', 'estibador de la Ciudadela', 'operadora de torre'],
    'Malastare': ['mecánico de vaina', 'corredor de apuestas', 'perforador de combustible', 'comisario de circuito'],
    'Batuu': ['mecánico de puerto', 'tabernera', 'corredor de piezas raras', 'estibador del Mercado'],
    'Exegol': ['acólito', 'centinela', 'nada que se pueda llamar oficio'],
    'Bothawui': ['corredor de información', 'diplomática de clan', 'archivista', 'analista de rumores'],
    'Trandosha': ['cazador de trofeos', 'taxidermista', 'tratante de esclavos', 'guardián de coto'],
    'Dorin': ['guía de corrientes', 'fabricante de máscaras', 'monje Baran Do', 'meteoróloga de altura'],
    'Glee Anselm': ['pescador de laguna', 'buceadora de arrecife', 'boticaria de algas', 'guía de aguas'],
    'Rodia': ['cazarrecompensas novato', 'guía de pantano', 'armera de domo', 'criador de insectos'],
    'Ithor': ['jardinero del Rebaño', 'botánica', 'sacerdote de la Madre Jungla', 'piloto de ciudad flotante'],
    'Sriluur': ['mercenario weequay', 'guarda de caravana', 'sacerdotisa de clan', 'aguador'],
    'Pantora': ['guía de tundra', 'diputada de la Asamblea', 'minero de hielo azul', 'cortadora de hielo'],
    'Kintan': ['peón por deuda', 'capataz nikto', 'aguador', 'pastor de bestias'],
    'Duro': ['navegante', 'cartógrafa estelar', 'técnica de estación', 'controlador de atraque'],
    'Ando': ['armador', 'pescador de arrecife', 'artillero de puerto', 'calafate'],
    'Concord Dawn': ['granjero de llanura', 'jinete de casco', 'herrero', 'veterinaria de ganado'],
    'Felucia': ['recolector de esporas', 'chamana de aldea', 'guía de hongos', 'boticario'],
    'Umbara': ['guía de penumbra', 'armera umbarana', 'técnica de bioluminiscencia', 'explorador'],
    'Yavin 4': ['arqueóloga', 'guía de templos', 'mecánico de base', 'nadie: aquí no vive nadie'],
    'Anaxes': ['cadete', 'instructora de vuelo', 'técnico de simulador', 'oficial de estado mayor'],
    'Zeltros': ['anfitrión de fiestas', 'perfumista', 'diplomática', 'músico de corte'],
    'Mundo sin nombre': ['náufrago', 'lo que puedas', 'nada'],
    'Cerea': ['artesano sin máquinas', 'anciana del consejo', 'granjero de tiro', 'partera'],
    'Eshan': ['maestro de esgrima', 'alumna de escuela', 'guardaespaldas de exportación', 'forjadora de hoja'],
    'Alpheridies': ['maestro de la Visión', 'guía para forasteros', 'artesana táctil', 'cartógrafo de eco'],
    'Muunilinst': ['tasador', 'contable del Clan Bancario', 'agente de cobros', 'analista de riesgo'],
    'Cato Neimoidia': ['subastador', 'inspector de puentes', 'viticultora de niebla', 'escribano de contratos'],
    'Manaan': ['buceador de kolto', 'juez selkath', 'técnica de plataforma', 'mediadora'],
    'Sluis Van': ['estibador de dique', 'inspectora de aduana', 'soldador de casco', 'controlador de atraque'],
    'Roche': ['armero verpine', 'ingeniera de precisión', 'minero de asteroide', 'probadora de prototipos'],
    'Honoghr': ['guerrero noghri', 'anciana de clan', 'jardinero de invernadero', 'rastreador'],
    'Gamorr': ['guerrero de temporada', 'matriarca de clan', 'cervecera', 'guardaespaldas de exportación'],
    'Orto Plutonia': ['cazador talz', 'guía de tundra', 'operadora de puesto', 'curtidora'],
    'Champala': ['orador', 'mediadora', 'salinero', 'maestro de retórica'],
    'Falleen': ['cortesana de Casa', 'perfumista', 'agente comercial', 'guardia de palacio'],
    'Togoria': ['jinete de mosgoth', 'cazador de llanura', 'curtidora', 'criadora de monturas'],
    'Uvena Prime': ['rastreador shistavanen', 'cazadora de pieles', 'guía de boreal', 'leñador'],
    'Anzat': ['nadie lo dice en voz alta', 'posadero', 'asesino', 'viajera de paso'],
    'Ord Mantell II': ['feriante', 'timadora de plataforma', 'pescador de altura', 'mecánico de flotador'],
    'Serenno': ['montero del conde', 'criada de la Casa', 'administrador de condado', 'bodeguera'],
    'Onderon': ['jinete de bestia', 'guardia de muralla', 'criadora de drexl', 'contrabandista de jungla'],
    'Dxun': ['cazador', 'superviviente', 'nada: aquí no se trabaja, se aguanta'],
    'Taris': ['buscador de reliquias', 'médica de los Niveles Bajos', 'matón de banda', 'guía de ruinas'],
    'Nal Kesh': ['refinero', 'capataz', 'guía de pantano', 'peón por turnos'],
    'Christophsis': ['cortador de cristal', 'ingeniera de torres', 'magnate menor', 'sanitaria de asedio'],
    'Ryloth Sur': ['minero de ryll', 'capataz de galería', 'lamparero', 'guía de mina'],
    'Saleucami': ['granjero de oasis', 'pocero', 'desertor con otro nombre', 'tratante de ganado'],
    'Rishi': ['operador de escucha', 'pescadora de anguilas', 'técnico de radar', 'cocinero de puesto'],
    'Ringo Vinda': ['técnico de anillo', 'soldadora de casco', 'controladora de sector', 'ordenanza'],
    'Umbara Profunda': ['guía de selva', 'cazador de esporas', 'cartógrafa de raíces', 'recolector'],
    'Mygeeto': ['minero de cristal', 'contable de trinchera', 'zapadora', 'tasador del Clan Bancario'],
    'Felucia Sur': ['recolectora de esporas rojas', 'chamán', 'boticario', 'guía de aldea'],
    'Zeffo': ['excavador', 'arqueóloga imperial', 'saqueador de tumbas', 'topógrafa de vientos'],
    'Nur': ['guardia de la Fortaleza', 'técnica de presión', 'interrogador', 'carcelera'],
    'Coruscant Nivel 1313': ['chaval de recados', 'perista', 'mecánica de conducto', 'vigía de banda'],
    'Ilum Profundo': ['nada', 'iniciado', 'guardián'],
    'Wobani': ['preso número tal', 'guardia de campo', 'picadora de cantera', 'ordenanza de barracón'],
    'Akiva': ['comerciante de tejado', 'informadora de calle', 'mecánico de jungla', 'funcionaria del satrap'],
    'Chalmun': ['camarera', 'músico de banda', 'portero', 'perista de barra'],
    'Vandor': ['ferroviario', 'minera de coaxium', 'atracador de trenes', 'tabernero de Fort Ypso'],
    'Savareen': ['refinero de coaxium', 'pescadora de costa', 'destilador', 'vigía de acantilado'],
    'Kef Bir': ['jinete de orbak', 'buscadora de restos', 'pescador', 'guía al pecio'],
    'Crait': ['salinero', 'minera de la vieja mina', 'nadie: ya no vive nadie aquí'],
    'Ajan Kloss': ['mecánico de base', 'piloto', 'exploradora de jungla', 'instructor'],
    'Pasaana': ['tejedora aki-aki', 'guía de arenas', 'organizador del Festival', 'pocero'],
    'Corvus': ['aldeano', 'guardia mercenario', 'leñadora de ceniza', 'ordenanza de la magistrada'],
    'Tython': ['peregrino', 'arqueóloga', 'ermitaño', 'nadie'],
    'Ossus': ['arqueólogo', 'guardiana del yacimiento', 'saqueador', 'cazadora ysanna'],
    'Neimoidia': ['escribano de contratos', 'criadora de nidada', 'contable', 'capataz de refinería'],
    'Clak\'dor VII': ['músico bith', 'química de cúpula', 'luthier', 'técnico de filtros'],
    'Kubindi': ['criador de insectos', 'informadora', 'cocinero de colmena', 'corredor de datos'],
    'Orto': ['luthier', 'músico de gremio', 'campanero', 'maestra de instrumento'],
    'Af\'El': ['minero de duracero', 'espía de exportación', 'fundidora', 'guía en penumbra'],
    'Yuzzem': ['leñador', 'anciana del bosque', 'porteador', 'rastreadora'],
    'Gentes': ['maestro de horno', 'aprendiz de gremio', 'aleadora', 'herrera de precisión'],
    'Lasan': ['guardia de honor sin guardia', 'pastora de altura', 'saqueador', 'último de su oficio'],
    'Concordia': ['minero de beskar', 'guerrera escondida', 'capataz', 'contrabandista de armas'],
    'Devaron': ['matriarca de valle', 'guardián del templo', 'agricultora de terraza', 'guía de peregrinos'],
    'Kinyen': ['granjero gran', 'cocinera de gremio', 'cervecero', 'maestra de mesa']
  };

  /* se enchufan a SW.LOCAL, que es de donde tira SW.oficiosDe */
  SW.LOCAL = SW.LOCAL || {};
  for (const k in OFI) {
    SW.LOCAL[k] = SW.LOCAL[k] || {};
    if (!SW.LOCAL[k].oficios) SW.LOCAL[k].oficios = OFI[k];
  }

  /* ------------------------------------------------------------
     Mundos a los que nadie se muda por casualidad.
     Un crío de Tatooine no acaba viviendo en Exegol porque sí.
     ------------------------------------------------------------ */
  SW.MUNDOS_OCULTOS = ['Exegol', 'Ilum Profundo', 'Nur', 'Mundo sin nombre', 'Korriban',
                       'Dxun', 'Dagobah', 'Tython', 'Ilum', 'Anzat', 'Scarif', 'Crait',
                       'Kef Bir', 'Ajan Kloss', 'Wobani', 'Zeffo'];
  /* Un mundo cualquiera al que se pueda ir de verdad. Sin el filtro por
     época te mandaba a Alderaan setenta años después de que lo
     volaran, o a Kamino después de la purga. */
  SW.mundoAleatorioNormal = function (rng, excluir, era) {
    const lista = SW.MUNDO_NOMBRES.filter(function (m) {
      if (m === excluir || SW.MUNDOS_OCULTOS.indexOf(m) >= 0) return false;
      if (era && SW.mundoViable && !SW.mundoViable(m, era)) return false;
      return true;
    });
    return rng.pick(lista.length ? lista : SW.MUNDO_NOMBRES.filter(function (m) { return m !== excluir; }));
  };

})(typeof window !== 'undefined' ? window : globalThis);

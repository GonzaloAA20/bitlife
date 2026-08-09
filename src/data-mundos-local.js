/* ============================================================
   HOLOVIDA :: color local
   El problema de fondo era que los lugares salían de una lista
   global: un tusken de Tatooine acababa en "un baño público del
   nivel 40". Aquí cada mundo tiene sus propios sitios, sus
   oficios y su gente, y lo que no esté escrito a mano se
   rellena con lo que corresponda a su bioma.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ============================================================
     LUGARES POR BIOMA — cubre los 113 mundos
     ============================================================ */
  SW.LUGARES_BIOMA = {
    desierto: ['un puesto comercial junto a los vaporizadores', 'una cantina sin ventanas', 'el fondo seco de un cañón',
      'un mar de dunas al mediodía', 'una granja de humedad abandonada', 'el desguace del asentamiento',
      'un pozo comunal', 'la sombra de una roca partida', 'un mercado bajo toldos remendados', 'un cementerio de reptadores'],
    ciudad: ['un pasillo del nivel bajo', 'una plataforma de aterrizaje entre torres', 'un mercado de tres pisos',
      'un tren de superficie a medianoche', 'una azotea con antenas', 'un conducto de mantenimiento',
      'una galería comercial infinita', 'la cola de una oficina administrativa', 'un bar de trabajadores del turno de noche', 'un mirador sobre el tráfico'],
    hielo: ['una grieta bajo el hielo', 'un refugio de emergencia', 'un campamento de perforación',
      'un túnel excavado a mano', 'la superficie durante una ventisca', 'un invernadero presurizado',
      'un puesto de escucha helado', 'una estación de transporte enterrada'],
    oceano: ['un embarcadero flotante', 'una cúpula sumergida', 'una plataforma de algas',
      'un arrecife a media profundidad', 'una lonja de pescado', 'un dique con la marea baja',
      'un submarino de carga', 'un faro sobre pilotes'],
    volcanico: ['la boca de una mina de obsidiana', 'una pasarela sobre lava', 'un refugio con filtros de ceniza',
      'una refinería de mineral', 'un campo de escoria caliente', 'un puente de roca negra'],
    jungla: ['una plataforma entre las copas', 'un sendero abierto a machete', 'un claro con ruinas',
      'una aldea sobre pilotes', 'un río de aguas marrones', 'la base de un árbol imposible',
      'un puesto de caza', 'un tramo de selva que nadie ha cartografiado'],
    templado: ['un granero comunal', 'un camino entre campos', 'la plaza del pueblo',
      'un molino parado', 'una feria de ganado', 'un tejado con vistas al valle',
      'una casa de postas', 'un lago al amanecer'],
    pantano: ['una pasarela podrida', 'una choza sobre el agua', 'un banco de niebla espesa',
      'un tocón hueco', 'un canal de aguas negras', 'una trampa de anguilas'],
    gaseoso: ['una plataforma flotante', 'un ascensor exterior', 'una sala de extracción de gas',
      'un balcón sobre las nubes', 'un hangar suspendido', 'un salón con el atardecer permanente'],
    rocoso: ['una galería de mina', 'un desfiladero estrecho', 'un campamento entre peñascos',
      'una cueva con ecos', 'una cantera abandonada', 'un puesto avanzado en la roca']
  };

  SW.OFICIOS_BIOMA = {
    desierto: ['granjero de humedad', 'chatarrero', 'cazador de reptadores', 'tabernero', 'guía de dunas'],
    ciudad: ['funcionario cansado', 'mensajero de niveles', 'técnico de mantenimiento', 'vendedor de galería', 'vigilante de plataforma'],
    hielo: ['perforador', 'operario de refugio', 'rastreador de superficie', 'mecánico de calefacción'],
    oceano: ['pescador', 'buzo de reparación', 'lonjero', 'piloto de submarino'],
    volcanico: ['minero de obsidiana', 'capataz de refinería', 'técnico de filtros'],
    jungla: ['guía de selva', 'recolector', 'cazador', 'constructor de pasarelas'],
    templado: ['agricultor', 'herrero', 'tratante de ganado', 'molinero'],
    pantano: ['trampero', 'barquero', 'destilador clandestino'],
    gaseoso: ['operario de extracción', 'piloto de plataforma', 'camarero de mirador'],
    rocoso: ['minero', 'cantero', 'guía de desfiladero']
  };

  /* ============================================================
     MUNDOS CON COLOR PROPIO
     Sitios y oficios escritos a mano para los mundos que más
     aparecen. El resto hereda los de su bioma.
     ============================================================ */
  SW.LOCAL = {
    'Tatooine': {
      lugares: ['la cantina de Chalmun en Mos Eisley', 'los desguaces de Mos Espa', 'un pozo de agua vigilado',
        'el Mar de Dunas al anochecer', 'una granja de humedad en el borde del yermo', 'el circuito de Boonta Eve',
        'el palacio de Jabba', 'la Garganta del Mendigo', 'un campamento tusken entre rocas', 'el puerto espacial de Mos Eisley'],
      oficios: ['granjero de humedad', 'chatarrero jawa', 'mecánico de vainas', 'tabernero de Mos Eisley', 'matón de Jabba', 'cazador de bantha'],
      sabor: 'dos soles y ningún gobierno que valga'
    },
    'Coruscant': {
      lugares: ['un pasillo del nivel 1313', 'la Plaza del Senado', 'una plataforma de aterrizaje del nivel 5127',
        'los archivos de un edificio administrativo', 'un bar del distrito industrial', 'una plataforma de tráfico aéreo',
        'una azotea a kilómetros del suelo', 'los túneles de mantenimiento del subnivel', 'el Templo Jedi visto desde fuera', 'un mercado de la Franja Inferior'],
      oficios: ['funcionario del Senado', 'guardia de plataforma', 'ayudante de senador', 'técnico de tráfico aéreo', 'carterista del 1313', 'periodista de la HoloRed'],
      sabor: 'la ciudad no acaba nunca, ni hacia arriba ni hacia abajo'
    },
    'Nar Shaddaa': {
      lugares: ['una galería de neón vertical', 'un fumadero de las Terrazas Rojas', 'un hangar sin registrar',
        'la casa de apuestas de un hutt', 'un callejón entre dos torres', 'un mercado que solo abre de noche',
        'los muelles inferiores', 'un refugio de refugiados en un almacén'],
      oficios: ['prestamista', 'guardaespaldas', 'traficante de información', 'crupier', 'contrabandista', 'cobrador de deudas'],
      sabor: 'todo se compra, todo se vende, nadie pregunta'
    },
    'Kashyyyk': {
      lugares: ['una plataforma en la copa de un wroshyr', 'el Bosque de las Sombras al pie de los árboles',
        'una aldea colgante', 'un puente de lianas trenzadas', 'un taller de arcos', 'un campamento de esclavistas'],
      oficios: ['constructor de plataformas', 'tejedor de cuerdas', 'cazador de las profundidades', 'guardián de la aldea'],
      sabor: 'arriba se vive, abajo se sobrevive'
    },
    'Hoth': {
      lugares: ['una cueva de wampa', 'un refugio con las paredes de hielo', 'la llanura blanca a menos cincuenta',
        'un campamento de perforación', 'una grieta que no se ve hasta que caes'],
      oficios: ['explorador de superficie', 'operario de refugio', 'mecánico de reptadores'],
      sabor: 'seis horas fuera y no vuelves'
    },
    'Bespin': {
      lugares: ['un mirador de Ciudad Nube', 'una sala de extracción de tibanna', 'una pasarela exterior',
        'un salón de juego sobre las nubes', 'el hangar de la plataforma 327'],
      oficios: ['operario de tibanna', 'crupier de altura', 'administrador de plataforma', 'guardia de Ciudad Nube'],
      sabor: 'un atardecer permanente y muy caro'
    },
    'Naboo': {
      lugares: ['una plaza con fuentes en Theed', 'las cascadas al amanecer', 'un domo gungan bajo el lago',
        'un hangar de cazas cromados', 'una pradera junto al río', 'un pasillo del palacio real'],
      oficios: ['artesano de Theed', 'piloto de la Guardia Real', 'granjero del valle', 'pescador gungan'],
      sabor: 'todo demasiado bonito para lo que pasa debajo'
    },
    'Nal Hutta': {
      lugares: ['una ciénaga industrial', 'el salón de un kajidic', 'un almacén de especia',
        'una pista de aterrizaje hundiéndose en el barro', 'un mercado de contratos'],
      oficios: ['intermediario de cártel', 'capataz de almacén', 'traductor de huttés', 'cobrador'],
      sabor: 'el barro huele dulce y los contratos son verbales'
    },
    'Corellia': {
      lugares: ['un astillero con el casco a medio montar', 'los muelles de Coronet', 'un tramo de vía de conveyex',
        'una taberna de mecánicos', 'un circuito ilegal de deslizadores', 'las alcantarillas del puerto'],
      oficios: ['soldador de astillero', 'piloto de pruebas', 'contrabandista joven', 'capataz de muelle', 'mecánico'],
      sabor: 'aquí todo el mundo sabe pilotar algo'
    },
    'Mandalore': {
      lugares: ['un domo de la Ciudad Vieja', 'el desierto de cristal fuera de la cúpula', 'una forja de beskar',
        'una sala de clan', 'un campo de entrenamiento'],
      oficios: ['herrero de beskar', 'instructor de clan', 'armero', 'piloto de Fang'],
      sabor: 'el Credo pesa más que la ley'
    },
    'Kamino': {
      lugares: ['un pasillo blanco sin ventanas', 'una sala de crecimiento', 'la plataforma de aterrizaje bajo la lluvia',
        'un barracón de cadetes', 'la sala de reacondicionamiento'],
      oficios: ['técnico de crecimiento', 'instructor', 'médico kaminoano'],
      sabor: 'llueve siempre y nadie lo menciona'
    },
    'Ryloth': {
      lugares: ['una mina de ryll', 'un asentamiento en la franja templada', 'la cara oscura al descubierto',
        'un mercado de clanes', 'un túnel excavado en la roca'],
      oficios: ['minero de ryll', 'jefe de clan', 'guía de la franja', 'músico de bar'],
      sabor: 'una cara arde, la otra congela, y se vive en la costura'
    },
    'Jedha': {
      lugares: ['la Ciudad Sagrada', 'una mina de kyber', 'un templo de los Whills',
        'un callejón de peregrinos', 'el desierto de piedra alrededor'],
      oficios: ['guardián de los Whills', 'guía de peregrinos', 'minero de kyber', 'vendedor de reliquias falsas'],
      sabor: 'la fe y la minería compiten por el mismo suelo'
    },
    'Lothal': {
      lugares: ['un campo de trigo interminable', 'la torre de comunicaciones imperial', 'el mercado de Ciudad Capital',
        'una granja abandonada', 'una loma con loth-gatos'],
      oficios: ['granjero de trigo', 'obrero de fábrica imperial', 'comerciante de mercado'],
      sabor: 'pradera abierta con una torre gris en medio'
    },
    'Mustafar': {
      lugares: ['una pasarela sobre un río de lava', 'una plataforma de extracción', 'un refugio con filtros',
        'una mina de obsidiana', 'el borde de una colada'],
      oficios: ['minero de obsidiana', 'operario de extracción', 'técnico de refrigeración'],
      sabor: 'el aire quema y aquí trabaja gente igualmente'
    },
    'Nevarro': {
      lugares: ['la sede del Gremio', 'una taberna de cazadores', 'la llanura de basalto negro',
        'un puerto con dos rampas', 'la fundición'],
      oficios: ['agente del Gremio', 'cazarrecompensas', 'fundidor', 'tabernera'],
      sabor: 'roca negra y contratos sobre la mesa'
    },
    'Jakku': {
      lugares: ['el interior de un destructor caído', 'el puesto de Niima', 'un mar de arena con restos asomando',
        'un lavadero de piezas', 'una tienda de chatarrero'],
      oficios: ['chatarrero', 'tasador de piezas', 'aguador', 'mercader de raciones'],
      sabor: 'una batalla acabó aquí y nadie recogió nada'
    },
    'Kessel': {
      lugares: ['una galería de mina de especia', 'el barracón de trabajadores', 'la torre de control',
        'el borde del Pozo de Boquejo'],
      oficios: ['capataz de mina', 'trabajador contratado', 'controlador de vuelo'],
      sabor: 'aquí se entra a trabajar y casi nadie sale'
    },
    'Cantonica': {
      lugares: ['la sala principal del casino', 'un establo de fathiers', 'una suite con vistas al mar artificial',
        'un salón privado de apuestas altas', 'el paseo marítimo de Canto Bight'],
      oficios: ['crupier', 'mozo de establo', 'marchante de armas', 'portero de casino'],
      sabor: 'todo el lujo se paga con guerras de otros'
    },
    'Dathomir': {
      lugares: ['una aldea del aquelarre', 'un bosque de niebla roja', 'un altar de huesos',
        'la cueva de un rancor', 'un nido de nightbrothers'],
      oficios: ['hermana del aquelarre', 'criador de rancor', 'guerrero zabrak'],
      sabor: 'la magia aquí no se llama Fuerza'
    },
    'Mon Cala': {
      lugares: ['una ciudad-burbuja sumergida', 'un astillero submarino', 'un arrecife de coral vivo',
        'la cámara del consejo', 'una granja de algas'],
      oficios: ['ingeniero naval', 'pescador quarren', 'diplomático', 'buzo de reparación'],
      sabor: 'dos pueblos, un planeta y ningún acuerdo'
    },
    'Geonosis': {
      lugares: ['una colmena de roca roja', 'una fábrica de droides', 'la arena de ejecuciones',
        'un túnel de casta obrera'],
      oficios: ['obrero de colmena', 'supervisor de fábrica', 'domador de arena'],
      sabor: 'la colmena decide y tú obedeces'
    },
    'Endor': {
      lugares: ['una aldea en las copas', 'un claro con trampas', 'un tronco caído sobre un barranco',
        'un sendero de caza'],
      oficios: ['cazador ewok', 'constructor de trampas', 'explorador'],
      sabor: 'todo parece inofensivo hasta que te cuelga de un pie'
    },
    'Alderaan': {
      lugares: ['una sala de conciertos en Aldera', 'un sendero de montaña', 'un lago glaciar',
        'la biblioteca del palacio', 'un mercado de artesanía'],
      oficios: ['músico', 'guía de montaña', 'bibliotecario', 'diplomático'],
      sabor: 'sin ejército y muy orgullosos de ello'
    },
    'Nar Kesh': { lugares: ['una refinería de ácido', 'un barracón de contratados'], oficios: ['capataz'], sabor: 'todo pica' },
    'Ord Mantell': {
      lugares: ['una feria de chatarra', 'un campamento de milicianos', 'una playa con restos',
        'un salón de apuestas', 'un desguace en la costa'],
      oficios: ['tratante de chatarra', 'miliciano', 'timador de feria'],
      sabor: 'aquí se vende hasta lo que no existe'
    },
    'Takodana': {
      lugares: ['el castillo de Maz', 'un embarcadero del lago', 'un bosque de árboles altos',
        'la bodega del castillo'],
      oficios: ['tabernero del castillo', 'piloto de paso', 'contrabandista de visita'],
      sabor: 'todos los bandos beben en la misma sala'
    },
    'Ilum': {
      lugares: ['una cueva de cristal', 'la superficie helada', 'un templo excavado en el hielo'],
      oficios: ['guardián del templo'],
      sabor: 'el hielo canta si te quedas quieto'
    },
    'Korriban': {
      lugares: ['el Valle de los Señores Oscuros', 'la entrada de una tumba', 'una academia en ruinas',
        'un desfiladero con estatuas'],
      oficios: ['saqueador de tumbas', 'acólito'],
      sabor: 'las tumbas hablan y es mejor no contestar'
    },
    'Bracca': {
      lugares: ['el casco abierto de un destructor', 'una grúa de desguace', 'el barracón de la cuadrilla',
        'un montón de chatarra del tamaño de un edificio'],
      oficios: ['cortador de cascos', 'gruista', 'capataz de cuadrilla'],
      sabor: 'se despieza lo que otros construyeron'
    },
    'Kijimi': {
      lugares: ['una calle empinada con nieve sucia', 'el gremio de ladrones', 'un taller clandestino',
        'un templo pequeño en la montaña'],
      oficios: ['ladrón', 'relojero', 'mercader de abrigos'],
      sabor: 'hace un frío que justifica cualquier delito'
    }
  };

  /** Lugares que corresponden al mundo donde estás */
  SW.lugaresDe = function (nombre) {
    const l = SW.LOCAL[nombre];
    if (l && l.lugares && l.lugares.length) return l.lugares;
    const b = SW.biomaDe ? SW.biomaDe(nombre).id : 'rocoso';
    return SW.LUGARES_BIOMA[b] || SW.LUGARES_BIOMA.rocoso;
  };

  /** Oficios propios del mundo donde estás */
  SW.oficiosDe = function (nombre) {
    const l = SW.LOCAL[nombre];
    if (l && l.oficios && l.oficios.length) return l.oficios;
    const b = SW.biomaDe ? SW.biomaDe(nombre).id : 'rocoso';
    return SW.OFICIOS_BIOMA[b] || SW.OFICIOS_BIOMA.rocoso;
  };

  SW.saborDe = function (nombre) {
    const l = SW.LOCAL[nombre];
    return (l && l.sabor) || SW.mundo(nombre).vibe;
  };

})(window);

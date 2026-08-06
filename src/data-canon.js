/* ============================================================
   HOLOVIDA :: canon
   Personajes conocidos (cada uno solo en las épocas en que
   estuvo activo), datos reales de los mundos y las reglas de
   los cristales kyber y del Sable Oscuro.
   Los encuentros son raros a propósito: cuando pasa, se nota.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  /* ============================================================
     CRISTALES KYBER
     El cristal elige, no tú. El negro no es un color de kyber:
     el Sable Oscuro es una pieza única y se hereda o se gana.
     ============================================================ */
  SW.COLORES_KYBER = [
    { c: 'azul', hex: '#3ad6ff', s: 'Guardián. El color del que se pone delante.', lado: 1, w: 30 },
    { c: 'verde', hex: '#6aff8a', s: 'Cónsul. El color del que negocia antes de desenfundar.', lado: 1, w: 30 },
    { c: 'amarillo', hex: '#ffd23a', s: 'Centinela. El color de los guardias del Templo.', lado: 1, w: 12 },
    { c: 'púrpura', hex: '#c98aff', s: 'Rarísimo. Solo canta para quien camina por el filo.', lado: 0, w: 4, req: function (s) { return Math.abs(s.stats.alineamiento) < 45; } },
    { c: 'blanco', hex: '#ffffff', s: 'Un cristal sangrado y luego purificado. Ya no pertenece a nadie.', lado: 1, w: 3, req: function (s) { return s.flags.cristal_purificado; } },
    { c: 'rojo', hex: '#ff3a3a', s: 'Sangrado: se le arranca el color a base de odio. Duele para siempre.', lado: -1, w: 8, req: function (s) { return s.stats.alineamiento < -30; } }
  ];

  /* El Sable Oscuro: pieza única, forjada por Tarre Vizsla, el primer
     mandaloriano de la Orden Jedi. Va unida al gobierno de Mandalore
     y, según el Credo, solo cambia de manos ganándola en combate. */
  SW.SABLE_OSCURO = {
    c: 'negro', hex: '#2a2438', filo: '#d8d0ff',
    s: 'El Sable Oscuro de Tarre Vizsla. Quien lo empuña reclama Mandalore.',
    unico: true,
    eras: ['alta_republica', 'republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion', 'nueva_republica', 'primera_orden']
  };

  /* ============================================================
     DATOS DE LOS MUNDOS
     Una línea de contexto real al llegar. Si un mundo no está
     aquí, se usa su descripción genérica.
     ============================================================ */
  SW.DATOS = {
    'Coruscant': 'la ciudad cubre el planeta entero; nadie ha visto su superficie original',
    'Corellia': 'de sus astilleros salen el Halcón Milenario y la mitad de la flota',
    'Alderaan': 'sin armas desde hace generaciones; será famosa por cómo acabó',
    'Chandrila': 'cuna de Mon Mothma y, más tarde, capital de la Nueva República',
    'Kuat': 'los Astilleros de Deriva Kuat construyen los Destructores Estelares',
    'Naboo': 'humanos arriba, gungans abajo, y una reina elegida por votación',
    'Tatooine': 'dos soles, sin agua y bajo control del cartel de Jabba',
    'Ryloth': 'una cara siempre al sol y otra siempre helada; se vive en la franja de en medio',
    'Kashyyyk': 'los wookiees viven en las copas; el suelo pertenece a otras cosas',
    'Nal Hutta': '"Joya Gloriosa" en huttés; fue un vergel antes de que lo exprimieran',
    'Nar Shaddaa': 'la Luna del Contrabandista: ni un metro cuadrado sin edificar',
    'Mon Cala': 'mon calamari y quarren comparten planeta y casi nunca opinión',
    'Bespin': 'Ciudad Nube flota sobre un gigante gaseoso extrayendo tibanna',
    'Hoth': 'sexto planeta de su sistema, sin población nativa inteligente y con wampas',
    'Dagobah': 'tan denso en la Fuerza que oculta lo que hay dentro',
    'Mustafar': 'ríos de lava y minas de obsidiana; se construirá un castillo aquí',
    'Kamino': 'no aparece en los archivos jedi porque alguien borró la entrada',
    'Geonosis': 'colmenas de casta rígida y las fábricas de droides de la Confederación',
    'Mandalore': 'siglos de guerras civiles entre el Credo guerrero y los pacifistas',
    'Jakku': 'un cementerio de flota de una batalla que cerró la Guerra Civil Galáctica',
    'Lothal': 'trigo, torres imperiales y loth-lobos que aparecen cuando hacen falta',
    'Sullust': 'la flota rebelde se reunió aquí antes de Endor',
    'Dathomir': 'las Hermanas de la Noche usan magia; la Orden prefiere llamarlo superstición',
    'Iridonia': 'los zabrak resuelven casi todo con duelos rituales',
    'Shili': 'los togruta cazan en hierba más alta que ellos',
    'Csilla': 'los chiss viven bajo el hielo y no dan explicaciones a nadie',
    'Nevarro': 'volcánico, con una sede del Gremio de Cazarrecompensas',
    'Ord Mantell': '"Ord" significa Depósito de Artillería de la vieja República',
    'Takodana': 'el castillo de Maz Kanata lleva mil años abierto a todos los bandos',
    'Jedha': 'una de las primeras lunas donde se veneró la Fuerza; sus minas dan kyber',
    'Scarif': 'archivo militar imperial protegido por un escudo planetario',
    'Endor': 'la luna boscosa, no el gigante gaseoso que le da nombre',
    'Kessel': 'sus minas de especia dan nombre a la ruta más peligrosa de la galaxia',
    'Malastare': 'circuito clásico de carreras de vainas y sede dug',
    'Cantonica': 'Canto Bight vive del juego y de venderle armas a los dos bandos',
    'Batuu': 'el Puesto Negro fue puerto de paso antes de que existieran las rutas modernas',
    'Ilum': 'los iniciados vienen a por su cristal; el Imperio lo destripará entero',
    'Exegol': 'no está en ninguna carta; hace falta un guía sith para llegar',
    'Bothawui': 'los bothans venden información y nunca la regalan',
    'Trandosha': 'los trandoshanos puntúan sus cazas ante una diosa llamada Scorekeeper',
    'Dorin': 'atmósfera de helio: un kel dor sin máscara fuera de aquí se ahoga',
    'Rodia': 'el clima obliga a vivir en domos; exporta cazadores',
    'Ithor': 'nadie pisa el suelo: las ciudades flotan por respeto a la Madre Selva',
    'Pantora': 'luna de Orto Plutonia, con asamblea propia y un chairman muy protocolario',
    'Duro': 'la superficie quedó inhabitable; la población vive en órbita',
    'Concord Dawn': 'de aquí salen los Protectores Mandalorianos',
    'Felucia': 'hongos del tamaño de edificios y esporas que alteran la percepción',
    'Umbara': 'el Mundo Sombrío: nunca llega luz directa de su sol',
    'Yavin 4': 'templos massassi vacíos; alguien montará una base rebelde aquí',
    'Anaxes': 'academia naval desde la vieja República; su doctrina es materia de examen',
    'Zeltros': 'los zeltron hacen diplomacia a base de fiestas y feromonas',
    'Korriban': 'el Valle de los Señores Oscuros: cada tumba tiene dueño y opinión',
    'Muunilinst': 'el Clan Bancario Intergaláctico decide qué guerras se pueden pagar',
    'Cato Neimoidia': 'ciudades colgadas de arcos rocosos, sostenidas por el Gremio de Comercio',
    'Manaan': 'neutral por decreto; el kolto sale de aquí y de ningún otro sitio',
    'Serenno': 'condados hereditarios y una de las fortunas más viejas de la galaxia',
    'Onderon': 'ciudad amurallada porque la jungla de fuera no perdona',
    'Dxun': 'luna de Onderon; su nombre aparece en muchas listas de bajas',
    'Taris': 'los niveles altos brillan; los de abajo llevan siglos a oscuras',
    'Christophsis': 'torres de cristal partidas por la guerra en su primer año',
    'Mygeeto': 'planeta bancario y campo de batalla a la vez; nadie ve la contradicción',
    'Bracca': 'aquí se despiezan las flotas que sobran después de cada guerra',
    'Zeffo': 'una civilización se marchó sin explicar adónde y dejó las tumbas abiertas',
    'Nur': 'bajo su océano hay una fortaleza del Inquisitorio',
    'Coruscant Nivel 1313': 'tan abajo que la luz del sol es un rumor',
    'Wobani': 'campo de trabajo imperial; salir de aquí es noticia',
    'Kijimi': 'ciudad de montaña, gremio de ladrones y muy buen abrigo',
    'Crait': 'costra de sal blanca sobre suelo rojo; los vulptex son de cristal',
    'Pasaana': 'el Festival de los Ancestros se celebra cada cuarenta y dos años',
    'Kef Bir': 'luna oceánica de Endor, con los restos de una estación de combate',
    'Tython': 'aquí se ordenó por primera vez lo que hoy se llama la Orden Jedi',
    'Ossus': 'sus bibliotecas ardieron hace milenios y todavía se rebusca entre las cenizas',
    'Savareen': 'refinan coaxium y hacen un licor que solo aguantan los locales',
    'Vandor': 'trenes de conveyex cargados de coaxium cruzando montaña',
    'Ajan Kloss': 'jungla espesa: buen sitio para esconder una flota pequeña',
    'Sluis Van': 'astilleros lentos, seguros y muy solicitados',
    'Roche': 'los verpine fabrican las armas más precisas de la galaxia',
    'Honoghr': 'los noghri deben una deuda de honor a quien "salvó" su mundo',
    'Kintan': 'los nikto firmaron con los hutt hace tanto que ya nadie recuerda por qué',
    'Gamorr': 'los clanes gamorreanos guerrean por temporadas, como quien siembra'
  };

  SW.datoMundo = function (n) {
    return SW.DATOS[n] || null;
  };

  /* ============================================================
     PERSONAJES CONOCIDOS
     `eras` marca cuándo se les puede encontrar. `w` es el peso:
     todos muy bajos, para que un encuentro sea un acontecimiento.
     ============================================================ */
  SW.CANON = [
    /* --- Alta República --- */
    { id: 'avar', n: 'Avar Kriss', tipo: 'jedi', eras: ['alta_republica'], desc: 'Maestra Jedi que oye la Fuerza como una canción', w: 3 },
    { id: 'elzar', n: 'Elzar Mann', tipo: 'jedi', eras: ['alta_republica'], desc: 'Jedi brillante y poco ortodoxo', w: 3 },
    { id: 'porter', n: 'Porter Engle', tipo: 'jedi', eras: ['alta_republica'], desc: 'el Cuchillo de la Orden, que ahora solo quiere cocinar', w: 2 },
    { id: 'marchion', n: 'Marchion Ro', tipo: 'villano', eras: ['alta_republica'], desc: 'el Ojo de los Sin Nombre', w: 2 },

    /* --- República Tardía --- */
    { id: 'quigon', n: 'Qui-Gon Jinn', tipo: 'jedi', eras: ['republica_tardia'], desc: 'Maestro Jedi que discute con el Consejo por costumbre', w: 3 },
    { id: 'shmi', n: 'Shmi Skywalker', tipo: 'civil', eras: ['republica_tardia'], desc: 'esclava en Mos Espa, con un hijo poco corriente', w: 2 },
    { id: 'watto', n: 'Watto', tipo: 'criminal', eras: ['republica_tardia'], desc: 'chatarrero toydariano, inmune a los trucos mentales', w: 3 },
    { id: 'jango', n: 'Jango Fett', tipo: 'cazador', eras: ['republica_tardia', 'guerras_clon'], desc: 'el cazarrecompensas del que salieron todos los clones', w: 2 },
    { id: 'maul', n: 'Darth Maul', tipo: 'sith', eras: ['republica_tardia', 'guerras_clon', 'imperio_temprano'], desc: 'zabrak de Dathomir con un sable de doble hoja', w: 2 },

    /* --- Guerras Clon --- */
    { id: 'obiwan', n: 'Obi-Wan Kenobi', tipo: 'jedi', eras: ['guerras_clon'], desc: 'General Jedi, negociador y piloto a regañadientes', w: 4 },
    { id: 'anakin', n: 'Anakin Skywalker', tipo: 'jedi', eras: ['guerras_clon'], desc: 'el Héroe Sin Miedo, con muy poca paciencia', w: 4 },
    { id: 'ahsoka', n: 'Ahsoka Tano', tipo: 'jedi', eras: ['guerras_clon', 'imperio_temprano', 'rebelion', 'nueva_republica'], desc: 'togruta que dejó la Orden y siguió peleando', w: 4 },
    { id: 'yoda', n: 'Yoda', tipo: 'jedi', eras: ['alta_republica', 'republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion'], desc: 'Gran Maestro de la Orden, ochocientos años y contando', w: 2 },
    { id: 'windu', n: 'Mace Windu', tipo: 'jedi', eras: ['republica_tardia', 'guerras_clon'], desc: 'del Consejo, con un sable púrpura y ninguna gana de charla', w: 3 },
    { id: 'plo', n: 'Plo Koon', tipo: 'jedi', eras: ['republica_tardia', 'guerras_clon'], desc: 'kel dor del Consejo, el que rescata a los que nadie va a buscar', w: 3 },
    { id: 'aayla', n: 'Aayla Secura', tipo: 'jedi', eras: ['guerras_clon'], desc: "General Jedi twi'lek", w: 3 },
    { id: 'dooku', n: 'el Conde Dooku', tipo: 'sith', eras: ['guerras_clon'], desc: 'aristócrata de Serenno, ex jedi y líder separatista', w: 2 },
    { id: 'grievous', n: 'el General Grievous', tipo: 'villano', eras: ['guerras_clon'], desc: 'kaleesh dentro de un cuerpo de droide, coleccionista de sables', w: 2 },
    { id: 'ventress', n: 'Asajj Ventress', tipo: 'sith', eras: ['guerras_clon'], desc: 'dathomiriana con dos sables curvos y ningún maestro', w: 3 },
    { id: 'rex', n: 'el Capitán Rex', tipo: 'clon', eras: ['guerras_clon'], desc: 'CT-7567, de la 501', w: 4 },
    { id: 'cody', n: 'el Comandante Cody', tipo: 'clon', eras: ['guerras_clon'], desc: 'CC-2224, de la 212', w: 4 },
    { id: 'padme', n: 'Padmé Amidala', tipo: 'politico', eras: ['republica_tardia', 'guerras_clon'], desc: 'senadora de Naboo, incómoda para todos los comités', w: 3 },
    { id: 'hondo', n: 'Hondo Ohnaka', tipo: 'criminal', eras: ['guerras_clon', 'imperio_temprano', 'rebelion'], desc: 'pirata weequay de lealtad estrictamente comercial', w: 5 },
    { id: 'cadbane', n: 'Cad Bane', tipo: 'cazador', eras: ['guerras_clon', 'imperio_temprano'], desc: 'duros con sombrero de ala ancha y muy mala idea', w: 3 },
    { id: 'bokatan', n: 'Bo-Katan Kryze', tipo: 'mando', eras: ['guerras_clon', 'imperio_temprano', 'nueva_republica'], desc: 'de la casa Kryze, con opiniones firmes sobre quién debe gobernar Mandalore', w: 3 },

    /* --- Imperio temprano / Rebelión --- */
    { id: 'vader', n: 'Darth Vader', tipo: 'sith', eras: ['imperio_temprano', 'rebelion'], desc: 'el aprendiz del Emperador; se le oye antes de verle', w: 2 },
    { id: 'palpatine', n: 'el Emperador Palpatine', tipo: 'sith', eras: ['republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion'], desc: 'canciller, después Emperador, siempre lo mismo', w: 1 },
    { id: 'inquisidor', n: 'el Gran Inquisidor', tipo: 'villano', eras: ['imperio_temprano'], desc: 'fue guardia del Templo; ahora caza a los suyos', w: 3 },
    { id: 'kanan', n: 'Kanan Jarrus', tipo: 'jedi', eras: ['imperio_temprano'], desc: 'padawan superviviente que se hace pasar por contrabandista', w: 3 },
    { id: 'hera', n: 'Hera Syndulla', tipo: 'piloto', eras: ['imperio_temprano', 'rebelion', 'nueva_republica'], desc: "piloto twi'lek del Espíritu", w: 4 },
    { id: 'saw', n: 'Saw Gerrera', tipo: 'militar', eras: ['imperio_temprano', 'rebelion'], desc: 'extremista rebelde: demasiado radical hasta para la Alianza', w: 3 },
    { id: 'tarkin', n: 'el Gran Moff Tarkin', tipo: 'militar', eras: ['imperio_temprano', 'rebelion'], desc: 'gobernar por el miedo es doctrina suya, con nombre propio', w: 2 },
    { id: 'obiwan_viejo', n: 'Ben Kenobi', tipo: 'jedi', eras: ['imperio_temprano', 'rebelion'], desc: 'un ermitaño de Tatooine que mira demasiado al horizonte', w: 3 },
    { id: 'luke', n: 'Luke Skywalker', tipo: 'jedi', eras: ['rebelion', 'nueva_republica'], desc: 'granjero de humedad y, más tarde, otra cosa', w: 3 },
    { id: 'leia', n: 'Leia Organa', tipo: 'politico', eras: ['rebelion', 'nueva_republica', 'primera_orden'], desc: 'princesa, senadora y la persona más terca de la Alianza', w: 3 },
    { id: 'han', n: 'Han Solo', tipo: 'criminal', eras: ['rebelion', 'nueva_republica'], desc: 'contrabandista corelliano que le debe dinero a un hutt', w: 4 },
    { id: 'chewie', n: 'Chewbacca', tipo: 'criminal', eras: ['rebelion', 'nueva_republica', 'primera_orden'], desc: 'wookiee de Kashyyyk con una deuda de vida pendiente', w: 4 },
    { id: 'lando', n: 'Lando Calrissian', tipo: 'criminal', eras: ['rebelion', 'nueva_republica', 'primera_orden'], desc: 'jugador, barón administrador y encantador profesional', w: 4 },
    { id: 'boba', n: 'Boba Fett', tipo: 'cazador', eras: ['imperio_temprano', 'rebelion', 'nueva_republica'], desc: 'la armadura más reconocible del Gremio', w: 3 },
    { id: 'jabba', n: 'Jabba el Hutt', tipo: 'criminal', eras: ['republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion'], desc: 'el cartel de Tatooine, en persona y en su palacio', w: 3 },
    { id: 'monmothma', n: 'Mon Mothma', tipo: 'politico', eras: ['imperio_temprano', 'rebelion', 'nueva_republica'], desc: 'senadora de Chandrila que fundó la Alianza en voz baja', w: 3 },
    { id: 'ackbar', n: 'el Almirante Ackbar', tipo: 'militar', eras: ['rebelion', 'nueva_republica'], desc: 'mon calamari, el mejor táctico naval de la Alianza', w: 3 },
    { id: 'wedge', n: 'Wedge Antilles', tipo: 'piloto', eras: ['rebelion', 'nueva_republica'], desc: 'el piloto que sobrevivió a las dos Estrellas de la Muerte', w: 4 },

    /* --- Nueva República --- */
    { id: 'mando', n: 'Din Djarin', tipo: 'mando', eras: ['nueva_republica'], desc: 'un mandaloriano que no se quita el casco', w: 3 },
    { id: 'gideon', n: 'Moff Gideon', tipo: 'villano', eras: ['nueva_republica'], desc: 'remanente imperial con un sable que no le corresponde', w: 2 },
    { id: 'thrawn', n: 'el Gran Almirante Thrawn', tipo: 'militar', eras: ['imperio_temprano', 'nueva_republica'], desc: 'chiss que estudia el arte de un pueblo antes de conquistarlo', w: 2 },
    { id: 'karga', n: 'Greef Karga', tipo: 'criminal', eras: ['nueva_republica'], desc: 'agente del Gremio de Cazarrecompensas en Nevarro', w: 4 },

    /* --- Primera Orden --- */
    { id: 'rey', n: 'Rey', tipo: 'jedi', eras: ['primera_orden'], desc: 'chatarrera de Jakku que espera a una familia que no vuelve', w: 3 },
    { id: 'kylo', n: 'Kylo Ren', tipo: 'sith', eras: ['primera_orden'], desc: 'Maestro de los Caballeros de Ren, con un sable de filo inestable', w: 3 },
    { id: 'finn', n: 'Finn', tipo: 'militar', eras: ['primera_orden'], desc: 'FN-2187, un soldado que decidió no disparar', w: 4 },
    { id: 'poe', n: 'Poe Dameron', tipo: 'piloto', eras: ['primera_orden'], desc: 'el mejor piloto de la Resistencia, y lo sabe', w: 4 },
    { id: 'maz', n: 'Maz Kanata', tipo: 'civil', eras: ['rebelion', 'nueva_republica', 'primera_orden'], desc: 'mil años regentando un castillo y leyendo ojos ajenos', w: 3 },
    { id: 'phasma', n: 'la Capitana Phasma', tipo: 'militar', eras: ['primera_orden'], desc: 'armadura cromada y cero tolerancia', w: 3 },
    { id: 'hux', n: 'el General Hux', tipo: 'militar', eras: ['primera_orden'], desc: 'discursos largos y ambición corta', w: 3 }
  ];

  SW.canonDeEra = function (era) {
    return SW.CANON.filter(function (c) { return c.eras.indexOf(era) >= 0; });
  };

  /* ============================================================
     MAESTROS Y APRENDICES CON NOMBRE
     Si la época lo permite hay opción de que te toque alguien
     conocido; si no, un nombre generado del mismo estilo.
     ============================================================ */
  SW.MAESTROS_JEDI = {
    alta_republica: ['Avar Kriss', 'Stellan Gios', 'Porter Engle', 'Indeera Stokes'],
    republica_tardia: ['Qui-Gon Jinn', 'Mace Windu', 'Plo Koon', 'Yaddle', 'Adi Gallia'],
    guerras_clon: ['Obi-Wan Kenobi', 'Plo Koon', 'Luminara Unduli', 'Kit Fisto', 'Shaak Ti', 'Ki-Adi-Mundi'],
    nueva_republica: ['Luke Skywalker']
  };
  SW.MAESTROS_SITH = {
    republica_tardia: ['Darth Sidious', 'Darth Maul'],
    guerras_clon: ['Darth Tyranus', 'Darth Sidious'],
    imperio_temprano: ['Darth Vader', 'Darth Sidious'],
    rebelion: ['Darth Vader', 'Darth Sidious'],
    primera_orden: ['Snoke', 'Kylo Ren']
  };

  /** Nombre de maestro: canónico si toca (30%), inventado si no */
  SW.maestroDe = function (rng, era, lado) {
    const tabla = lado === 'sith' ? SW.MAESTROS_SITH : SW.MAESTROS_JEDI;
    const lista = tabla[era];
    if (lista && lista.length && rng.chance(0.3)) return { n: rng.pick(lista), canon: true };
    if (lado === 'sith') {
      const titulos = ['Darth'];
      const nombres = ['Vharun', 'Nekros', 'Ozhan', 'Malicar', 'Sever', 'Ruina', 'Ithrax', 'Vespera', 'Karrn', 'Dolor'];
      return { n: rng.pick(titulos) + ' ' + rng.pick(nombres), canon: false };
    }
    return { n: SW.genNombreCompleto(rng, rng.pick(['humano', 'togruta', 'zabrak', 'nautolano', 'cerean'])), canon: false };
  };

  /* ============================================================
     ENCUENTROS CON PERSONAJES CONOCIDOS
     Un único generador: el encuentro cambia según quién sea la
     otra persona y según tu alineamiento y tu camino.
     ============================================================ */
  SW.GEN = SW.GEN || {};
  SW.GEN.canon = function (rng, s) {
    const pool = SW.canonDeEra(s.era);
    if (!pool.length) return null;
    const p = rng.weighted(pool, function (c) { return c.w || 1; });
    const lugar = rng.pick(SW.LUGARES);
    const oscuro = s.stats.alineamiento < -30;
    const luminoso = s.stats.alineamiento > 30;
    const sensible = s.sensible && s.stats.fuerza > 25;
    const esSith = s.trabajo === 'sith' || (oscuro && sensible);
    const esJedi = s.trabajo === 'jedi';

    const c = [];
    const cab = '<span class="canon-tag">ENCUENTRO</span> En ' + lugar + ' te cruzas con <b>' + p.n + '</b>, ' + p.desc + '.';

    /* ---- ramas según quién es ---- */
    if (p.tipo === 'jedi') {
      if (esSith) {
        c.push({ t: 'Atacar sin avisar', combate: { dif: 88, duelo: true, canon: p.id }, fx: { alineamiento: -20, notoriedad: 25 }, conocer: p });
        c.push({ t: 'Dejar que te lea y marcharte', fx: { fuerza: 10, cordura: -10, notoriedad: 10 }, out: p.n + ' te mira demasiado tiempo. Sabe lo que eres. No hace nada. Todavía.', conocer: p });
        c.push({ t: 'Fingir ser un civil', fx: { carisma: 12, intelecto: 8 }, out: 'Cuela por poco. Te tiembla la mano hasta el hangar.', conocer: p });
      } else if (sensible) {
        c.push({ t: 'Pedirle que te enseñe algo', fx: { fuerza: 16, cordura: 10, alineamiento: 8 }, rel: { tipo: 'mentor', afecto: 45, canon: p.n, quien: p.desc }, out: p.n + ' te corrige la postura durante veinte minutos. Te dura toda la vida.', conocer: p });
        c.push({ t: 'Pedirle consejo sobre tu camino', fx: { cordura: 16, fuerza: 8, alineamiento: 10 }, out: 'Te contesta con una pregunta. Tardarás años en entenderla.', conocer: p });
        c.push({ t: 'Retarle a un duelo de práctica', combate: { dif: 78, duelo: true, canon: p.id, practica: true }, fx: { destreza: 8 }, conocer: p });
        c.push({ t: 'No molestarle', fx: { cordura: 5 }, out: 'Se va. Piensas en ello mucho tiempo.' });
      } else {
        c.push({ t: 'Ofrecerle ayuda', fx: { alineamiento: 12, reputacion: 12, carisma: 8 }, rel: { tipo: 'aliado', afecto: 45, canon: p.n, quien: p.desc }, out: 'Acepta. Trabajáis juntos tres días. No vuelve a olvidarse de ti.', conocer: p });
        c.push({ t: 'Pedirle dinero por la información que tienes', fx: { creditos: 9000, alineamiento: -8 }, out: 'Paga sin regatear. Te mira de una forma que no te gusta.', conocer: p });
        c.push({ t: 'Delatarle a quien le busca', fx: { creditos: 30000, alineamiento: -30, notoriedad: 20 }, faccion: 'imperio+20', out: 'Cobras. En algún momento tendrás que explicárselo a alguien.', conocer: p });
        c.push({ t: 'Solo mirar y no decir nada', fx: { cordura: 6 }, out: 'Cuentas la anécdota durante décadas. Nadie te cree.', conocer: p });
      }
    } else if (p.tipo === 'sith' || p.tipo === 'villano') {
      c.push({ t: 'Enfrentarte', combate: { dif: p.id === 'palpatine' || p.id === 'vader' ? 95 : 82, duelo: true, canon: p.id }, fx: { alineamiento: luminoso ? 10 : 0 }, conocer: p });
      if (sensible) {
        c.push({ t: 'Escuchar lo que te ofrece', fx: { fuerza: 18, alineamiento: -22, cordura: -12, notoriedad: 12 }, flag: 'oferta_oscura', out: p.n + ' te habla del poder que la Orden te niega. Lo peor es que tiene parte de razón.', conocer: p });
      }
      c.push({ t: 'Arrodillarte y ofrecerle tus servicios', fx: { alineamiento: -25, notoriedad: 18, creditos: 20000 }, faccion: 'sith+25', rel: { tipo: 'amo', afecto: 20, canon: p.n, quien: p.desc }, out: 'Acepta. Ahora tienes un sitio en una estructura muy vertical.', conocer: p });
      c.push({ t: 'Huir sin mirar atrás', fx: { cordura: -12, destreza: 8 }, mover: true, motivo: 'poniendo distancia con ' + p.n, conocer: p });
    } else if (p.tipo === 'clon') {
      c.push({ t: 'Compartir raciones y hablar de la guerra', fx: { cordura: 12, carisma: 8 }, rel: { tipo: 'camarada', afecto: 55, canon: p.n, quien: p.desc }, out: 'Habla despacio y escucha mejor. Te acuerdas de él mucho después.', conocer: p });
      c.push({ t: 'Pedirle instrucción de combate', fx: { destreza: 12, fisico: 8 }, habilidad: 'luchador', out: 'Te corrige cosas que llevabas años haciendo mal.', conocer: p });
      c.push({ t: 'Preguntarle por los chips', fx: { intelecto: 10, cordura: -8 }, flag: 'sospecha_chip', out: 'Se queda callado. "Los médicos dicen que es para la agresividad."', conocer: p });
    } else if (p.tipo === 'cazador') {
      c.push({ t: 'Contratarle', fx: { creditos: -35000, notoriedad: 10 }, rel: { tipo: 'contacto', afecto: 25, canon: p.n, quien: p.desc }, out: 'Caro y sin preguntas. Cumple.', conocer: p });
      c.push({ t: 'Competir por el mismo contrato', combate: { dif: 76, botin: 40000, canon: p.id }, fx: { notoriedad: 15 }, conocer: p });
      c.push({ t: 'Ofrecerle trabajar juntos', fx: { creditos: 18000, destreza: 8, notoriedad: 12 }, rel: { tipo: 'socio', afecto: 35, canon: p.n, quien: p.desc }, out: 'Acepta a medias y con un contrato de once páginas.', conocer: p });
      c.push({ t: 'Salir del local con calma', fx: { cordura: 4 }, out: 'No te sigue. Esta vez.' });
    } else if (p.tipo === 'criminal') {
      c.push({ t: 'Hacer negocios', fx: { creditos: 24000, notoriedad: 12, alineamiento: -8 }, rel: { tipo: 'contacto', afecto: 35, canon: p.n, quien: p.desc }, out: 'Sale bien. Sorprendentemente bien.', conocer: p });
      c.push({ t: 'Jugártela a las cartas', r: [
        { p: 0.4, t: 'Ganas. ' + p.n + ' se ríe y paga.', fx: { creditos: 30000, carisma: 12, suerte: 8 } },
        { p: 0.6, t: 'Pierdes, y encima disfrutando.', fx: { creditos: -15000, carisma: 8 } }
      ], conocer: p });
      c.push({ t: 'Intentar robarle', r: [
        { p: 0.25, t: 'Increíblemente, funciona.', fx: { creditos: 45000, destreza: 12, notoriedad: 20 } },
        { p: 0.75, t: 'No funciona. Nunca funciona.', fx: { salud: -22, creditos: -8000, notoriedad: 15 } }
      ], conocer: p });
      c.push({ t: 'Invitarle a una copa y escuchar', fx: { cordura: 10, carisma: 8, creditos: -400 }, out: 'Cuenta tres historias. Dos son mentira y la tercera da miedo.', conocer: p });
    } else if (p.tipo === 'politico') {
      c.push({ t: 'Ofrecerle apoyo', fx: { reputacion: 14, alineamiento: 10 }, rel: { tipo: 'aliado', afecto: 40, canon: p.n, quien: p.desc }, faccion: luminoso ? 'rebelion+15' : 'republica+15', conocer: p });
      c.push({ t: 'Venderle información', fx: { creditos: 22000, intelecto: 6 }, conocer: p });
      c.push({ t: 'Pedirle un favor para tu mundo', fx: { reputacion: 10, carisma: 10 }, out: 'Toma nota. Meses después llega un envío sin remitente.', conocer: p });
      c.push({ t: 'Filtrar su agenda a la prensa', fx: { creditos: 12000, alineamiento: -18, notoriedad: 15 }, conocer: p });
    } else if (p.tipo === 'piloto') {
      c.push({ t: 'Retarle a una carrera', r: [
        { p: 0.3, t: 'Le ganas. Por muy poco, pero le ganas.', fx: { destreza: 14, reputacion: 14 }, habilidad: 'piloto' },
        { p: 0.7, t: 'Te deja atrás en la segunda curva.', fx: { destreza: 8, carisma: 5 } }
      ], conocer: p });
      c.push({ t: 'Pedirle que te enseñe a volar', fx: { destreza: 14, intelecto: 8 }, habilidad: 'piloto', rel: { tipo: 'mentor', afecto: 40, canon: p.n, quien: p.desc }, conocer: p });
      c.push({ t: 'Ofrecerte como copiloto', fx: { destreza: 10, cordura: 8 }, rel: { tipo: 'camarada', afecto: 45, canon: p.n, quien: p.desc }, conocer: p });
    } else if (p.tipo === 'mando') {
      c.push({ t: 'Saludar según el Credo', fx: { reputacion: 10, carisma: 8 }, faccion: 'mandalorianos+18', rel: { tipo: 'aliado', afecto: 35, canon: p.n, quien: p.desc }, out: '"Este es el Camino." Y ya está: eso vale por un contrato.', conocer: p });
      c.push({ t: 'Retarle por el honor', combate: { dif: 80, duelo: true, canon: p.id }, fx: { notoriedad: 12 }, conocer: p });
      c.push({ t: 'Preguntarle por el beskar', fx: { intelecto: 8, creditos: -12000 }, item: 'placas de armadura clon repintadas', conocer: p });
    } else if (p.tipo === 'militar') {
      c.push({ t: 'Cuadrarte y obedecer', fx: { reputacion: 10, cordura: -6 }, faccion: 'imperio+12', conocer: p });
      c.push({ t: 'Sabotear sus planes desde dentro', fx: { alineamiento: 15, notoriedad: 20, intelecto: 10 }, conocer: p });
      c.push({ t: 'Ofrecerle tus servicios', fx: { creditos: 26000, alineamiento: -15 }, rel: { tipo: 'contacto', afecto: 25, canon: p.n, quien: p.desc }, conocer: p });
      c.push({ t: 'Pasar desapercibido', fx: { cordura: 4, notoriedad: -5 }, conocer: p });
    } else {
      c.push({ t: 'Hablar con calma', fx: { cordura: 12, carisma: 8, intelecto: 6 }, rel: { tipo: 'contacto', afecto: 40, canon: p.n, quien: p.desc }, conocer: p });
      c.push({ t: 'Pedirle ayuda', fx: { creditos: 8000, cordura: 8 }, conocer: p });
      c.push({ t: 'Seguir tu camino', fx: {}, conocer: p });
    }

    return { id: 'gen_canon_' + p.id, gen: true, canon: p, t: cab, c: c };
  };

})(window);

/* ============================================================
   HOLOVIDA :: datos del universo
   Especies, mundos, facciones, nombres, objetos, naves, criaturas.
   Todo esto alimenta el generador de eventos por "slots".
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ---------- ERAS ---------- */
  SW.ERAS = [
    { id: 'alta_republica', n: 'Alta República', y: '−230 ABY', desc: 'Faroles y capas doradas. La Orden en su apogeo, las Fronteras aún salvajes.', mods: { fuerza: 6, reputacion: 4 }, tags: ['jedi_alto', 'frontera'] },
    { id: 'republica_tardia', n: 'República Tardía', y: '−40 ABY', desc: 'Burocracia, gremios comerciales y bloqueos. El polvo antes de la tormenta.', mods: { intelecto: 4, creditos: 500 }, tags: ['senado', 'gremios'] },
    { id: 'guerras_clon', n: 'Guerras Clon', y: '−22 ABY', desc: 'Droides de combate y clones. La galaxia entera es un frente.', mods: { destreza: 6, salud: -3 }, tags: ['guerra', 'clones', 'separatistas'] },
    { id: 'imperio_temprano', n: 'Imperio Temprano', y: '−18 ABY', desc: 'Se apagan los faros. Purga, miedo y cascos blancos nuevos.', mods: { notoriedad: 5, fuerza: -4 }, tags: ['purga', 'imperio'] },
    { id: 'rebelion', n: 'Era de la Rebelión', y: '0 ABY', desc: 'Una chispa en el Borde Exterior. Contrabandistas ricos, oficiales nerviosos.', mods: { carisma: 4, suerte: 3 }, tags: ['rebelion', 'imperio'] },
    { id: 'nueva_republica', n: 'Nueva República', y: '+8 DBY', desc: 'Restos imperiales, señores de la guerra y una paz frágil de comité.', mods: { creditos: 900, reputacion: 3 }, tags: ['reconstruccion'] },
    { id: 'primera_orden', n: 'Primera Orden', y: '+34 DBY', desc: 'Cromo nuevo sobre huesos viejos. La historia tartamudea.', mods: { destreza: 3, notoriedad: 3 }, tags: ['resistencia', 'orden'] },
    { id: 'era_perdida', n: 'La Era Perdida', y: '¿?', desc: 'Cartas de navegación corruptas. Nadie sabe qué año es y a nadie le importa.', mods: { suerte: 8, cordura: -5 }, tags: ['raro', 'frontera'] }
  ];

  /* ---------- ESPECIES ---------- */
  // vida: esperanza de vida base | mods: bonos de estadística
  SW.ESPECIES = [
    { id: 'humano', n: 'Humano', vida: 82, mods: { suerte: 5, carisma: 3 }, rasgo: 'Adaptable: +5% a todo aprendizaje.', home: ['Corellia', 'Chandrila', 'Naboo', 'Alderaan', 'Tatooine', 'Coruscant'] },
    { id: 'twilek', n: "Twi'lek", vida: 78, mods: { carisma: 10, destreza: 4, reputacion: -3 }, rasgo: 'Lekku expresivos: negociación superior, prejuicio frecuente.', home: ['Ryloth', 'Nar Shaddaa', 'Coruscant'] },
    { id: 'zabrak', n: 'Zabrak', vida: 84, mods: { salud: 8, destreza: 6, carisma: -3 }, rasgo: 'Doble corazón: resistencia al dolor.', home: ['Iridonia', 'Dathomir'] },
    { id: 'togruta', n: 'Togruta', vida: 86, mods: { destreza: 8, fuerza: 5 }, rasgo: 'Ecolocalización pasiva: no te sorprenden por la espalda.', home: ['Shili', 'Coruscant'] },
    { id: 'rodiano', n: 'Rodiano', vida: 70, mods: { destreza: 7, notoriedad: 5, carisma: -5 }, rasgo: 'Instinto cazador: +rastreo de objetivos.', home: ['Rodia', 'Nar Shaddaa'] },
    { id: 'wookiee', n: 'Wookiee', vida: 400, mods: { salud: 18, destreza: 8, intelecto: 2, carisma: -6 }, rasgo: 'Fuerza bruta y deuda de vida. Vives siglos.', home: ['Kashyyyk'] },
    { id: 'mon_cal', n: 'Mon Calamari', vida: 88, mods: { intelecto: 12, cordura: 6 }, rasgo: 'Mente de arquitecto naval.', home: ['Mon Cala'] },
    { id: 'bothan', n: 'Bothan', vida: 76, mods: { intelecto: 8, carisma: 6, reputacion: -4 }, rasgo: 'Red de espías innata: información barata.', home: ['Bothawui'] },
    { id: 'chiss', n: 'Chiss', vida: 90, mods: { intelecto: 14, carisma: -4, cordura: 8 }, rasgo: 'Táctica fría: ventaja en batallas espaciales.', home: ['Csilla'] },
    { id: 'mandaloriano', n: 'Humano mandaloriano', vida: 80, mods: { destreza: 12, salud: 6, carisma: -2 }, rasgo: 'El Credo. Empiezas con armadura de beskar heredada.', home: ['Mandalore', 'Concordia', 'Nevarro'] },
    { id: 'nautolano', n: 'Nautolano', vida: 92, mods: { fuerza: 6, cordura: 8, destreza: 4 }, rasgo: 'Lees emociones por feromonas.', home: ['Glee Anselm'] },
    { id: 'kel_dor', n: 'Kel Dor', vida: 86, mods: { fuerza: 10, salud: -6 }, rasgo: 'Necesitas máscara fuera de casa. Afinidad natural con la Fuerza.', home: ['Dorin'] },
    { id: 'trandoshano', n: 'Trandoshano', vida: 95, mods: { salud: 14, destreza: 8, carisma: -8, notoriedad: 6 }, rasgo: 'Regeneras miembros. Cuentas puntos de honor por cazas.', home: ['Trandosha'] },
    { id: 'ithoriano', n: 'Ithoriano', vida: 120, mods: { intelecto: 8, cordura: 12, destreza: -6 }, rasgo: 'Jardinero galáctico: pacifismo y paciencia.', home: ['Ithor'] },
    { id: 'gungan', n: 'Gungan', vida: 78, mods: { destreza: 6, salud: 6, intelecto: -4, suerte: 8 }, rasgo: 'Torpeza afortunada.', home: ['Naboo'] },
    { id: 'sullustano', n: 'Sullustano', vida: 74, mods: { intelecto: 9, destreza: 5 }, rasgo: 'Memoria de navegación perfecta.', home: ['Sullust'] },
    { id: 'devaroniano', n: 'Devaroniano', vida: 88, mods: { carisma: 8, notoriedad: 8, cordura: -6 }, rasgo: 'Nómada crónico: nunca echas raíces.', home: ['Devaron', 'Nar Shaddaa'] },
    { id: 'duros', n: 'Duros', vida: 82, mods: { intelecto: 10, destreza: 6 }, rasgo: 'Piloto por herencia genética.', home: ['Duro', 'Neimoidia'] },
    { id: 'gran', n: 'Gran', vida: 79, mods: { carisma: 5, intelecto: 4 }, rasgo: 'Tres ojos: percepción amplia.', home: ['Kinyen', 'Malastare'] },
    { id: 'aqualish', n: 'Aqualish', vida: 80, mods: { salud: 10, carisma: -7, destreza: 5 }, rasgo: 'Reputación de matón, merecida o no.', home: ['Ando'] },
    { id: 'hutt', n: 'Hutt', vida: 700, mods: { salud: 20, carisma: 10, destreza: -20, creditos: 8000, notoriedad: 15 }, rasgo: 'Naces con deudas ajenas a tu favor. Casi inmortal, casi inmóvil.', home: ['Nal Hutta'] },
    { id: 'droide', n: 'Droide sintiente', vida: 300, mods: { intelecto: 16, salud: 10, fuerza: -100, carisma: -6 }, rasgo: 'Sin Fuerza, sin sueño, con memoria borrable.', home: ['Coruscant', 'Nal Hutta', 'Corellia'] },
    { id: 'yodesano', n: 'Especie desconocida', vida: 800, mods: { fuerza: 20, intelecto: 10, destreza: -6 }, rasgo: 'Nadie sabe qué eres. Envejeces lentísimo.', home: ['Mundo sin nombre'] },
    { id: 'geonosiano', n: 'Geonosiano', vida: 60, mods: { intelecto: 8, destreza: 8, carisma: -8 }, rasgo: 'Casta de colmena: obediencia o exilio.', home: ['Geonosis'] },
    { id: 'nikto', n: 'Nikto', vida: 72, mods: { salud: 10, destreza: 6, intelecto: -4 }, rasgo: 'Sirviente tradicional de los Hutt. Rompe el molde si puedes.', home: ['Kintan', 'Nal Hutta'] },
    { id: 'weequay', n: 'Weequay', vida: 84, mods: { salud: 8, destreza: 7, carisma: -5, notoriedad: 5 }, rasgo: 'Piel de cuero: aguantas soles y palizas.', home: ['Sriluur'] },
    { id: 'pantorano', n: 'Pantorano', vida: 83, mods: { carisma: 9, intelecto: 5 }, rasgo: 'Diplomacia de sangre azul.', home: ['Pantora'] },
    { id: 'lasat', n: 'Lasat', vida: 100, mods: { salud: 12, destreza: 10, fuerza: 4 }, rasgo: 'Último de un pueblo. Cargas con eso.', home: ['Lasan'] },
    { id: 'ugnaught', n: 'Ugnaught', vida: 90, mods: { intelecto: 10, destreza: 6, carisma: -6 }, rasgo: 'Manos de ingeniero, orgullo de gremio.', home: ['Bespin', 'Gentes'] },
    { id: 'jawa', n: 'Jawa', vida: 80, mods: { intelecto: 8, suerte: 10, salud: -8, carisma: -10 }, rasgo: 'Chatarrero nato: encuentras piezas donde no hay nada.', home: ['Tatooine'] }
  ];

  /* ---------- MUNDOS ---------- */
  SW.MUNDOS = [
    { n: 'Coruscant', r: 'Núcleo', bio: 'ciudad-planeta', vibe: 'niveles infinitos, sol de anuncios', riq: 9, ley: 8 },
    { n: 'Corellia', r: 'Núcleo', bio: 'astilleros', vibe: 'grasa, apuestas y motores', riq: 7, ley: 5 },
    { n: 'Alderaan', r: 'Núcleo', bio: 'praderas', vibe: 'música de cámara y montañas', riq: 8, ley: 9 },
    { n: 'Chandrila', r: 'Núcleo', bio: 'templado', vibe: 'política limpia de puertas afuera', riq: 8, ley: 9 },
    { n: 'Kuat', r: 'Núcleo', bio: 'anillos de astillero', vibe: 'acero orbital y dinastías', riq: 10, ley: 7 },
    { n: 'Naboo', r: 'Borde Medio', bio: 'lagos', vibe: 'domos, plazas y algo bajo el agua', riq: 8, ley: 8 },
    { n: 'Tatooine', r: 'Borde Exterior', bio: 'desierto', vibe: 'dos soles y ninguna ley', riq: 2, ley: 1 },
    { n: 'Ryloth', r: 'Borde Exterior', bio: 'desierto/hielo', vibe: 'especia, viento y clanes', riq: 3, ley: 2 },
    { n: 'Kashyyyk', r: 'Borde Medio', bio: 'bosque colosal', vibe: 'ciudades en las copas, esclavistas abajo', riq: 4, ley: 3 },
    { n: 'Nal Hutta', r: 'Espacio Hutt', bio: 'pantano industrial', vibe: 'grasa dulce y contratos verbales', riq: 6, ley: 1 },
    { n: 'Nar Shaddaa', r: 'Espacio Hutt', bio: 'luna-ciudad', vibe: 'neón vertical, todo se compra', riq: 6, ley: 1 },
    { n: 'Mon Cala', r: 'Núcleo Profundo', bio: 'océano', vibe: 'catedrales sumergidas', riq: 7, ley: 7 },
    { n: 'Bespin', r: 'Borde Exterior', bio: 'gigante gaseoso', vibe: 'atardecer permanente, tycoons', riq: 7, ley: 5 },
    { n: 'Hoth', r: 'Borde Exterior', bio: 'hielo', vibe: 'blanco, wampas, silencio', riq: 1, ley: 0 },
    { n: 'Dagobah', r: 'Borde Exterior', bio: 'pantano', vibe: 'niebla y algo que te mira', riq: 0, ley: 0 },
    { n: 'Mustafar', r: 'Borde Exterior', bio: 'volcánico', vibe: 'minería de obsidiana y malos recuerdos', riq: 4, ley: 2 },
    { n: 'Kamino', r: 'Borde Exterior', bio: 'océano-tormenta', vibe: 'pasillos blancos, ética discutible', riq: 8, ley: 6 },
    { n: 'Geonosis', r: 'Borde Exterior', bio: 'roca roja', vibe: 'colmenas y fábricas de droides', riq: 5, ley: 2 },
    { n: 'Mandalore', r: 'Borde Interior', bio: 'ceniza y domos', vibe: 'honor, beskar y guerras civiles', riq: 5, ley: 4 },
    { n: 'Jakku', r: 'Borde Exterior', bio: 'desierto de chatarra', vibe: 'cementerio de flotas', riq: 1, ley: 1 },
    { n: 'Lothal', r: 'Borde Exterior', bio: 'praderas', vibe: 'trigo, torres imperiales, loth-gatos', riq: 3, ley: 4 },
    { n: 'Sullust', r: 'Borde Exterior', bio: 'volcánico subterráneo', vibe: 'túneles de fábrica', riq: 6, ley: 5 },
    { n: 'Dathomir', r: 'Borde Exterior', bio: 'rojo brumoso', vibe: 'magia, huesos y hermandad', riq: 1, ley: 0 },
    { n: 'Iridonia', r: 'Borde Medio', bio: 'cañones', vibe: 'duelos rituales', riq: 3, ley: 3 },
    { n: 'Shili', r: 'Borde Exterior', bio: 'sabana turquesa', vibe: 'hierba alta, cazadores', riq: 2, ley: 2 },
    { n: 'Csilla', r: 'Regiones Desconocidas', bio: 'glaciar', vibe: 'ciudades bajo el hielo', riq: 7, ley: 9 },
    { n: 'Nevarro', r: 'Borde Exterior', bio: 'basalto', vibe: 'gremio de cazarrecompensas', riq: 3, ley: 2 },
    { n: 'Ord Mantell', r: 'Borde Medio', bio: 'chatarrales', vibe: 'ferias, timos y milicias', riq: 4, ley: 2 },
    { n: 'Takodana', r: 'Borde Medio', bio: 'bosque y lago', vibe: 'castillo, música, todos los bandos', riq: 4, ley: 3 },
    { n: 'Jedha', r: 'Borde Medio', bio: 'desierto sagrado', vibe: 'peregrinos y minas de kyber', riq: 2, ley: 2 },
    { n: 'Scarif', r: 'Borde Exterior', bio: 'tropical', vibe: 'playas con escudo planetario', riq: 6, ley: 8 },
    { n: 'Endor', r: 'Borde Exterior', bio: 'luna boscosa', vibe: 'trampas de madera y ositos', riq: 1, ley: 0 },
    { n: 'Kessel', r: 'Borde Exterior', bio: 'minas', vibe: 'especia, esclavitud y un pasillo estrecho', riq: 5, ley: 1 },
    { n: 'Malastare', r: 'Borde Medio', bio: 'gasolina y arena', vibe: 'circuitos de vainas', riq: 5, ley: 3 },
    { n: 'Cantonica', r: 'Borde Exterior', bio: 'desierto de casinos', vibe: 'lujo comprado con guerra', riq: 9, ley: 4 },
    { n: 'Batuu', r: 'Borde Exterior', bio: 'mesetas', vibe: 'último puerto antes de la nada', riq: 3, ley: 2 },
    { n: 'Ilum', r: 'Regiones Desconocidas', bio: 'hielo cristalino', vibe: 'cuevas que cantan', riq: 0, ley: 0 },
    { n: 'Exegol', r: 'Regiones Desconocidas', bio: 'tormenta eterna', vibe: 'no deberías estar aquí', riq: 0, ley: 0 },
    { n: 'Bothawui', r: 'Borde Medio', bio: 'templado', vibe: 'mercado de secretos', riq: 6, ley: 6 },
    { n: 'Trandosha', r: 'Borde Medio', bio: 'jungla dura', vibe: 'trofeos colgados', riq: 3, ley: 1 },
    { n: 'Dorin', r: 'Núcleo Profundo', bio: 'atmósfera de helio', vibe: 'templos de viento', riq: 4, ley: 6 },
    { n: 'Glee Anselm', r: 'Borde Medio', bio: 'lagos y pantanos', vibe: 'ciudades anfibias', riq: 4, ley: 5 },
    { n: 'Rodia', r: 'Borde Exterior', bio: 'jungla húmeda', vibe: 'domos y cazadores jóvenes', riq: 3, ley: 2 },
    { n: 'Ithor', r: 'Borde Medio', bio: 'selva sagrada', vibe: 'ciudades flotantes, nadie pisa el suelo', riq: 5, ley: 8 },
    { n: 'Sriluur', r: 'Borde Exterior', bio: 'desierto rocoso', vibe: 'mercenarios weequay', riq: 2, ley: 1 },
    { n: 'Pantora', r: 'Borde Medio', bio: 'luna helada', vibe: 'asamblea y hielo azul', riq: 6, ley: 7 },
    { n: 'Kintan', r: 'Espacio Hutt', bio: 'árido', vibe: 'deudas heredadas', riq: 2, ley: 1 },
    { n: 'Duro', r: 'Núcleo', bio: 'planeta-fábrica', vibe: 'nadie vive en la superficie', riq: 7, ley: 6 },
    { n: 'Ando', r: 'Borde Medio', bio: 'océano y arrecife', vibe: 'puertos armados', riq: 3, ley: 2 },
    { n: 'Concord Dawn', r: 'Borde Medio', bio: 'llanuras rotas', vibe: 'granjas y jinetes de casco', riq: 2, ley: 2 },
    { n: 'Felucia', r: 'Borde Exterior', bio: 'hongos gigantes', vibe: 'colores que marean', riq: 2, ley: 1 },
    { n: 'Umbara', r: 'Borde Medio', bio: 'penumbra eterna', vibe: 'todo brilla y nada se ve', riq: 5, ley: 3 },
    { n: 'Yavin 4', r: 'Borde Exterior', bio: 'luna selvática', vibe: 'templos vacíos y ecos', riq: 1, ley: 1 },
    { n: 'Anaxes', r: 'Núcleo', bio: 'academia naval', vibe: 'uniformes y simuladores', riq: 8, ley: 9 },
    { n: 'Zeltros', r: 'Borde Interior', bio: 'templado rosado', vibe: 'fiesta permanente, diplomacia hedonista', riq: 7, ley: 4 },
    { n: 'Mundo sin nombre', r: '¿?', bio: 'desconocido', vibe: 'ni figura en las cartas', riq: 0, ley: 0 }
  ];
  SW.MUNDO_NOMBRES = SW.MUNDOS.map(function (m) { return m.n; });
  SW.mundo = function (n) {
    for (let i = 0; i < SW.MUNDOS.length; i++) if (SW.MUNDOS[i].n === n) return SW.MUNDOS[i];
    return SW.MUNDOS[0];
  };

  /* ---------- FACCIONES ----------
     Cada una en su época. Antes casi todas estaban marcadas como «de
     todas las eras» y salía la Alianza Rebelde reclutando en la Alta
     República, el Imperio existiendo mil años antes de fundarse y la
     Confederación Separatista viva veinte años después de rendirse.
     `eras` vacío = existe siempre (los cárteles y los gremios). */
  SW.FACCIONES = [
    { id: 'orden_jedi', n: 'Orden Jedi', color: '#7fd8ff', desc: 'Guardianes de la paz. Papeleo místico.',
      eras: ['alta_republica', 'republica_tardia', 'guerras_clon', 'nueva_republica'] },
    { id: 'jedi_ocultos', n: 'Jedi supervivientes', color: '#7fd8ff', desc: 'Los que quedaron. No se anuncian.',
      eras: ['imperio_temprano', 'rebelion'] },
    { id: 'sith', n: 'Los Sith', color: '#ff4d5e', desc: 'Dos hay siempre: maestro y aprendiz.',
      eras: ['republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion'] },
    { id: 'imperio', n: 'Imperio', color: '#c9ced6', desc: 'Orden mediante miedo y presupuesto militar.',
      eras: ['imperio_temprano', 'rebelion'] },
    { id: 'rebelion', n: 'Alianza Rebelde', color: '#ff9d3d', desc: 'Poca flota, mucha convicción.',
      eras: ['rebelion'] },
    { id: 'celulas', n: 'Células insurgentes', color: '#ff9d3d', desc: 'Todavía no se llaman Alianza ni se hablan entre sí.',
      eras: ['imperio_temprano'] },
    { id: 'republica', n: 'República Galáctica', color: '#9fe8b4', desc: 'Comités, senados y buenas intenciones.',
      eras: ['alta_republica', 'republica_tardia', 'guerras_clon'] },
    { id: 'separatistas', n: 'Confederación', color: '#b48cff', desc: 'Droides baratos, accionistas contentos.',
      eras: ['guerras_clon'] },
    { id: 'hutt', n: 'Cárteles Hutt', color: '#c8e05a', desc: 'La economía real del Borde Exterior.' },
    { id: 'mandalorianos', n: 'Clanes Mandalorianos', color: '#8fb8ff', desc: 'Honor con casco.' },
    { id: 'sol_negro', n: 'Sol Negro', color: '#ff6ad5', desc: 'Crimen con corbata.' },
    { id: 'gremio_caza', n: 'Gremio de Cazarrecompensas', color: '#ffcf5a', desc: 'El credo es el contrato.' },
    { id: 'contrabando', n: 'Sindicato de Contrabando', color: '#5ad9c8', desc: 'Rutas que no salen en las cartas.' },
    { id: 'hermandad', n: 'Aquelarre de Dathomir', color: '#ff7a7a', desc: 'Magia que la Orden llama superstición.',
      eras: ['alta_republica', 'republica_tardia', 'guerras_clon'] },
    { id: 'brujas', n: 'Lo que queda de Dathomir', color: '#ff7a7a', desc: 'Después de la matanza quedaron pocas, y escondidas.',
      eras: ['imperio_temprano', 'rebelion', 'nueva_republica'] }
  ];

  /* ---------- NOMBRES ---------- */
  SW.NOMBRES = {
    pre: ['Ka', 'Zar', 'Ora', 'Vek', 'Tal', 'Mir', 'Dro', 'Sev', 'Ilo', 'Nyx', 'Bar', 'Cor', 'Jed', 'Lom', 'Riv', 'Tav', 'Ael', 'Wex', 'Sil', 'Ryn', 'Gar', 'Hux', 'Qel', 'Vas', 'Ondo', 'Fen', 'Mal', 'Dez', 'Sora', 'Tyr', 'Ven', 'Ash', 'Ker', 'Lyr', 'Nem', 'Orr', 'Pax', 'Rho', 'Sab', 'Thal'],
    suf: ['ra', 'ek', 'is', 'oon', 'ath', 'ix', 'ara', 'en', 'ol', 'ur', 'ai', 'ess', 'oth', 'ian', 'ka', 'us', 'ir', 'ay', 'om', 'ea', 'ol', 'ux', 'in', 'ov', 'ash', 'el', 'yn', 'or'],
    ape: ['Vandor', 'Kesh', 'Antilles', 'Ordo', 'Vizsla', 'Sunrider', 'Onasi', 'Tarn', 'Halcyon', 'Drallig', 'Bel Iblis', 'Organa', 'Kryze', 'Vos', 'Secura', 'Offee', 'Tano', 'Bridger', 'Syndulla', 'Wren', 'Andor', 'Erso', 'Rook', 'Malbus', 'Îmwe', 'Motti', 'Yularen', 'Veers', 'Piett', 'Needa', 'Calrissian', 'Katarn', 'Marek', 'Starkiller', 'Jarrus', 'Dume', 'Nunb', 'Ackbar', 'Rieekan', 'Dodonna', 'Mothma', 'Tagge', 'Zorn', 'Krayt', 'Sal-Solo', 'Fett', 'Djarin', 'Karga', 'Dune', 'Shand'],
    droide: ['R', 'C', 'BD', 'K', 'IG', 'HK', 'T', 'L', 'AZ', 'QT', 'ZX', 'D', 'U', 'V']
  };

  /* Terminaciones con género, para que un nombre suene a él o a ella.
     Antes todos los nombres eran neutros y las parejas parecían todas
     iguales. Los droides siguen sin género. */
  SW.NOMBRES.sufM = ['ek', 'is', 'oon', 'ath', 'ix', 'en', 'ol', 'ur', 'oth', 'ian',
                     'us', 'ir', 'om', 'ux', 'in', 'ov', 'ash', 'el', 'or', 'ar', 'ed', 'un'];
  SW.NOMBRES.sufF = ['ra', 'ara', 'a', 'ea', 'ia', 'ka', 'ana', 'ila', 'ena', 'ora',
                     'isa', 'ya', 'esa', 'una', 'ala', 'ira', 'sha', 'nia', 'eia', 'ava'];

  SW.genNombre = function (rng, especie, genero) {
    if (especie === 'droide') {
      return SW.NOMBRES.droide[Math.floor(rng.next() * SW.NOMBRES.droide.length)] +
        '-' + rng.int(1, 9) + String.fromCharCode(65 + rng.int(0, 25)) + rng.int(0, 9);
    }
    const suf = genero === 'f' ? SW.NOMBRES.sufF
              : genero === 'm' ? SW.NOMBRES.sufM
              : SW.NOMBRES.suf;
    let n = rng.pick(SW.NOMBRES.pre) + rng.pick(suf);
    if (rng.chance(genero ? 0.16 : 0.25)) n += "'" + rng.pick(['a', 'ka', 'ir', 'oth', 'en']);
    return SW.U.titleCase(n);
  };
  SW.genApellido = function (rng) { return rng.pick(SW.NOMBRES.ape); };
  SW.genNombreCompleto = function (rng, especie, genero) {
    const n = SW.genNombre(rng, especie, genero);
    return especie === 'droide' ? n : n + ' ' + SW.genApellido(rng);
  };

  /* ---------- GÉNERO DE LA GENTE QUE TE ENCUENTRAS ----------
     Para parejas se mira el tratamiento del personaje: la mayoría de
     los emparejamientos son heterosexuales porque es lo más común,
     y el resto sale con normalidad y sin comentarlo. */
  SW.generoPara = function (rng, tipo, pronombreJugador) {
    if (tipo === 'pareja' || tipo === 'cónyuge' || tipo === 'amante' || tipo === 'romance') {
      const yo = pronombreJugador === 'ella' ? 'f' : 'm';
      const opuesto = yo === 'f' ? 'm' : 'f';
      return rng.chance(0.88) ? opuesto : yo;
    }
    return rng.chance(0.5) ? 'm' : 'f';
  };

  /* ---------- CRIATURAS ---------- */
  SW.CRIATURAS = ['bantha', 'dewback', 'rancor', 'nexu', 'wampa', 'sarlacc', 'krayt', 'tauntaun', 'acklay', 'reek', 'varactyl', 'loth-gato', 'porg', 'ewok', 'gundark', 'mynock', 'sando', 'blurrg', 'happabore', 'vulptex', 'fathier', 'shaak', 'eopie', 'massiff', 'sarlacc joven', 'rathtar', 'anguila colosal', 'purrgil', 'convor', 'tooka'];

  /* ---------- OBJETOS ---------- */
  SW.OBJETOS = [
    { n: 'bláster DL-44 modificado', p: 1200, t: 'arma' },
    { n: 'rifle de francotirador Verpine', p: 6500, t: 'arma' },
    { n: 'vibrohoja de Iridonia', p: 900, t: 'arma' },
    { n: 'lanzallamas de muñeca', p: 3400, t: 'arma' },
    { n: 'bastón eléctrico gamorreano', p: 700, t: 'arma' },
    { n: 'armadura de beskar (una pieza)', p: 22000, t: 'armadura' },
    { n: 'chaleco reflectante barato', p: 400, t: 'armadura' },
    { n: 'droide astromecánico de segunda mano', p: 4800, t: 'droide' },
    { n: 'droide protocolar con acento raro', p: 3200, t: 'droide' },
    { n: 'droide médico 2-1B reparado', p: 9000, t: 'droide' },
    { n: 'holocrón agrietado', p: 45000, t: 'reliquia' },
    { n: 'cristal kyber en bruto', p: 30000, t: 'reliquia' },
    { n: 'máscara sith corroída', p: 60000, t: 'reliquia' },
    { n: 'mapa estelar prerrepublicano', p: 18000, t: 'reliquia' },
    { n: 'cargamento de especia glitterstim', p: 15000, t: 'contrabando' },
    { n: 'lote de armas separatistas', p: 11000, t: 'contrabando' },
    { n: 'licor corelliano añejo', p: 800, t: 'lujo' },
    { n: 'traje de gala de Zeltros', p: 2600, t: 'lujo' },
    { n: 'speeder bike 74-Z', p: 5200, t: 'vehículo' },
    { n: 'landspeeder oxidado', p: 2200, t: 'vehículo' },
    { n: 'jetpack mandaloriano', p: 14000, t: 'vehículo' },
    { n: 'kit de esclavo de chatarrero', p: 300, t: 'herramienta' },
    { n: 'spike de slicer militar', p: 5500, t: 'herramienta' },
    { n: 'traductor universal pirateado', p: 1400, t: 'herramienta' },
    { n: 'mazo de sabacc marcado', p: 250, t: 'herramienta' },
    { n: 'dados de cromo colgantes', p: 60, t: 'recuerdo' },
    { n: 'holofoto de tu familia', p: 0, t: 'recuerdo' },
    { n: 'trozo de casco firmado por un as', p: 900, t: 'recuerdo' }
  ];

  /* ---------- NAVES ---------- */
  SW.NAVES = [
    { n: 'carguero ligero YT-1300', p: 95000, vel: 6, carga: 8, arm: 4, cls: 'carguero' },
    { n: 'carguero YT-2400 remendado', p: 78000, vel: 6, carga: 7, arm: 5, cls: 'carguero' },
    { n: 'lanzadera Lambda robada', p: 130000, vel: 5, carga: 6, arm: 5, cls: 'lanzadera' },
    { n: 'caza estelar Ala-X', p: 150000, vel: 9, carga: 1, arm: 9, cls: 'caza' },
    { n: 'caza Ala-A de segunda', p: 120000, vel: 10, carga: 1, arm: 7, cls: 'caza' },
    { n: 'TIE robado sin escudos', p: 60000, vel: 9, carga: 0, arm: 8, cls: 'caza' },
    { n: 'Fang Fighter mandaloriano', p: 140000, vel: 10, carga: 2, arm: 9, cls: 'caza' },
    { n: 'yate estelar de lujo', p: 320000, vel: 5, carga: 5, arm: 2, cls: 'yate' },
    { n: 'nave prisión Halcón de Hierro', p: 88000, vel: 4, carga: 9, arm: 6, cls: 'carguero' },
    { n: 'cañonera Razor Crest', p: 110000, vel: 6, carga: 6, arm: 7, cls: 'carguero' },
    { n: 'chatarra voladora con nombre cariñoso', p: 25000, vel: 4, carga: 5, arm: 2, cls: 'chatarra' },
    { n: 'corbeta corelliana CR90', p: 900000, vel: 5, carga: 10, arm: 8, cls: 'capital' }
  ];

  /* ---------- ORGANIZACIONES / LUGARES GENÉRICOS ---------- */
  SW.LUGARES = ['una cantina sin nombre', 'el mercado de chatarra', 'los muelles inferiores', 'una estación de repostaje', 'un templo abandonado', 'el nivel 1313', 'un desguace orbital', 'una arena de apuestas', 'una capilla de peregrinos', 'un tren de carga', 'una torre de control', 'el sótano de una casa de empeños', 'un campo de refugiados', 'una nave hospital', 'un jardín hidropónico', 'una mina abandonada', 'el hangar 7', 'un club de sabacc flotante', 'una embajada en obras', 'un cementerio de naves'];
  SW.RUMORES = ['un tesoro sepultado bajo las dunas', 'una flota fantasma que aparece cada ciclo', 'un jedi escondido de granjero', 'un holocrón vendido en tres partes', 'una ruta de salto que ahorra dos días', 'una cría de rancor en el sótano', 'una traición dentro de la guarnición', 'un cargamento sin dueño', 'una moneda que da suerte', 'una voz que canta en las cuevas'];

  /* ---------- TÍTULOS / EPITAFIOS ---------- */
  SW.TITULOS = [
    { id: 'gran_maestro', n: 'Gran Maestro de la Orden', req: function (s) { return s.rango === 'Maestro Jedi' && s.stats.fuerza > 90; } },
    { id: 'senor_oscuro', n: 'Señor Oscuro de los Sith', req: function (s) { return s.stats.alineamiento < -80 && s.stats.fuerza > 85; } },
    { id: 'leyenda_caza', n: 'Leyenda del Gremio', req: function (s) { return (s.contadores.cazas || 0) >= 25; } },
    { id: 'principe_crimen', n: 'Príncipe del Crimen', req: function (s) { return s.stats.notoriedad > 85 && s.stats.creditos > 500000; } },
    { id: 'as_galactico', n: 'As Galáctico', req: function (s) { return (s.contadores.derribos || 0) >= 20; } },
    { id: 'heroe_rebelde', n: 'Héroe de la Alianza', req: function (s) { return (s.faccionRep.rebelion || 0) > 80; } },
    { id: 'mano_imperial', n: 'Mano del Emperador', req: function (s) { return (s.faccionRep.imperio || 0) > 85 && s.stats.fuerza > 50; } },
    { id: 'magnate', n: 'Magnate Galáctico', req: function (s) { return s.stats.creditos > 2000000; } },
    { id: 'errante', n: 'Errante de las Estrellas', req: function (s) { return (s.contadores.mundosVisitados || 0) >= 20; } },
    { id: 'padre_clan', n: 'Cabeza de Clan', req: function (s) { return s.relaciones.filter(function (r) { return r.tipo === 'hijo'; }).length >= 4; } },
    { id: 'martir', n: 'Mártir', req: function (s) { return s.stats.alineamiento > 70 && s.edad < 40 && s.muerto; } },
    { id: 'fantasma', n: 'Fantasma de la Fuerza', req: function (s) { return s.muerto && s.stats.fuerza > 80 && s.stats.alineamiento > 60; } }
  ];

  SW.EPITAFIOS = [
    'Que la Fuerza le acompañe.',
    'Nadie pagó la lápida. La grabó un droide por su cuenta.',
    'Su nave sigue en órbita, en piloto automático.',
    'Le recuerdan en tres cantinas y un informe imperial.',
    'Vivió deprisa y firmó pocos contratos.',
    'La galaxia no cambió. Su calle, sí.',
    'Sus dados de cromo siguen colgando de alguna cabina.',
    'Murió debiendo dinero a alguien muy paciente.',
    'Volvió a la Fuerza sin hacer ruido.',
    'Hay una estatua. Es fea, pero la hay.'
  ];

  /* ---------- RASGOS DE NACIMIENTO ---------- */
  SW.RASGOS = [
    { id: 'sensible', n: 'Sensible a la Fuerza', desc: 'Sientes cosas antes de que pasen.', mods: { fuerza: 25 }, w: 8 },
    { id: 'huerfano', n: 'Huérfano', desc: 'Creciste sin red de seguridad.', mods: { carisma: -5, destreza: 8, cordura: -8 }, w: 10 },
    { id: 'noble', n: 'Cuna noble', desc: 'Dinero viejo y expectativas pesadas.', mods: { creditos: 25000, reputacion: 15, cordura: -4 }, w: 6 },
    { id: 'esclavo', n: 'Nacido en servidumbre', desc: 'Tienes un chip. Y una deuda.', mods: { salud: -8, destreza: 10, creditos: -2000 }, w: 8 },
    { id: 'gemelo', n: 'Gemelo separado', desc: 'Hay alguien ahí fuera con tu cara.', mods: { suerte: 6 }, w: 5 },
    { id: 'prodigio', n: 'Prodigio', desc: 'Aprendes el doble de rápido.', mods: { intelecto: 18 }, w: 5 },
    { id: 'enfermizo', n: 'Constitución frágil', desc: 'Los médicos te conocen por el nombre.', mods: { salud: -18, intelecto: 6 }, w: 7 },
    { id: 'marcado', n: 'Marcado al nacer', desc: 'Una profecía menor, probablemente falsa.', mods: { fuerza: 10, notoriedad: 10 }, w: 4 },
    { id: 'clan', n: 'Hijo de clan guerrero', desc: 'Te dieron un arma antes que un nombre.', mods: { destreza: 15, carisma: -5 }, w: 6 },
    { id: 'contrabando', n: 'Familia de contrabandistas', desc: 'Aprendiste a mentir con acento.', mods: { carisma: 10, notoriedad: 8 }, w: 7 },
    { id: 'granja', n: 'De granja húmeda', desc: 'Horizontes anchos, ambiciones estrechas.', mods: { salud: 8, cordura: 8, reputacion: -4 }, w: 9 },
    { id: 'burocrata', n: 'Familia funcionaria', desc: 'Sabes rellenar cualquier formulario.', mods: { intelecto: 10, carisma: 4, suerte: -4 }, w: 8 },
    { id: 'refugiado', n: 'Refugiado de guerra', desc: 'Tu mundo ya no existe en las cartas.', mods: { cordura: -12, destreza: 8, suerte: 6 }, w: 6 },
    { id: 'suerte', n: 'Nacido bajo estrella rara', desc: 'Las cosas te salen bien sin motivo.', mods: { suerte: 22 }, w: 4 },
    { id: 'ninguno', n: 'Absolutamente normal', desc: 'Nada destacable. Aún.', mods: {}, w: 12 }
  ];

  /* ---------- APARIENCIA (retro-holo) ---------- */
  SW.APARIENCIA = {
    piel: ['#f2c9a0', '#c98d5a', '#8a5a3b', '#5e3a2a', '#9fd4c1', '#7fc4e8', '#c85a7a', '#b8b8c8', '#6ec46e', '#d8c05a', '#a88ad8', '#e07a4a'],
    ojos: ['#3ad6ff', '#ffd23a', '#ff4d5e', '#8cff6a', '#c98aff', '#ffffff', '#ff8a3a', '#3affc0'],
    pelo: ['#1a1a1a', '#5a3a20', '#c8a050', '#d8d8d8', '#8a2a4a', '#2a5a8a', '#e05a2a', 'ninguno'],
    marca: ['sin marcas', 'tatuajes rituales', 'cicatriz vertical', 'pintura de clan', 'implantes cromados', 'quemadura de bláster', 'escamas iridiscentes', 'runas luminiscentes'],
    tocado: ['nada', 'casco de beskar', 'capucha de peregrino', 'gafas de soldador', 'diadema de senador', 'respirador', 'trenza de padawan', 'corona de clan', 'visor cibernético'],
    ropa: ['túnica de arpillera', 'chaqueta de piloto', 'uniforme imperial', 'armadura completa', 'traje de gala', 'mono de mecánico', 'capa de cazador', 'túnica jedi', 'ropa de calle de Nar Shaddaa', 'traje de vuelo rebelde']
  };

  // etiquetas legibles para los selectores de color
  SW.NOMBRE_COLOR = {
    '#f2c9a0': 'clara', '#c98d5a': 'tostada', '#8a5a3b': 'morena', '#5e3a2a': 'oscura',
    '#9fd4c1': 'verde jade', '#7fc4e8': 'azul cielo', '#c85a7a': 'rosa', '#b8b8c8': 'gris ceniza',
    '#6ec46e': 'verde', '#d8c05a': 'dorada', '#a88ad8': 'lila', '#e07a4a': 'cobriza',
    '#3ad6ff': 'cian', '#ffd23a': 'ámbar', '#ff4d5e': 'rojo sith', '#8cff6a': 'verde ácido',
    '#c98aff': 'violeta', '#ffffff': 'blanco', '#ff8a3a': 'naranja', '#3affc0': 'turquesa',
    '#1a1a1a': 'negro', '#5a3a20': 'castaño', '#c8a050': 'rubio', '#d8d8d8': 'blanco',
    '#8a2a4a': 'burdeos', '#2a5a8a': 'azul', '#e05a2a': 'pelirrojo', 'ninguno': 'sin pelo'
  };

  /* ---------- SALUDOS / SABOR ---------- */
  SW.SABOR = {
    exito: ['Sale bien.', 'Funciona a la primera.', 'Nadie sale herido. Casi.', 'Limpio.', 'Mejor de lo esperado.'],
    fallo: ['Sale mal.', 'Muy mal.', 'Nada sale como estaba en la cabeza.', 'Se tuerce en el segundo tres.', 'Alguien grita. Eres tú.'],
    neutro: ['Pasa lo que tenía que pasar.', 'La galaxia sigue girando.', 'Nada cambia demasiado.']
  };

})(window);

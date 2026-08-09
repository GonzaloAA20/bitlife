/* ============================================================
   HOLOVIDA :: expansión del universo
   Duplica el contenido base y añade los sistemas que dependen
   de la época: facciones activas, bandos de cada guerra y
   la vida particular de un clon.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  /* Eventos guionizados: momentos que no se dejan al azar.
     Se comprueban cada año antes que los aleatorios y el de mayor
     prioridad se dispara sí o sí en cuanto se cumplen sus condiciones. */
  SW.GUION = SW.GUION || [];

  /* ================= ESPECIES NUEVAS ================= */
  push(SW.ESPECIES, [
    /* El clon: vida corta, acelerada y con guion propio. */
    {
      id: 'clon', n: 'Clon de Kamino', vida: 50, ritmo: 2,
      mods: { fisico: 22, destreza: 20, salud: 10, cordura: 8, carisma: -6, intelecto: 4 },
      rasgo: 'Envejeces al doble. Naces entrenado, con hermanos idénticos y un chip en la cabeza.',
      home: ['Kamino'], soloEra: ['guerras_clon', 'imperio_temprano']
    },
    { id: 'clon_nulo', n: 'Clon defectuoso', vida: 44, ritmo: 2, mods: { intelecto: 18, destreza: 14, fisico: 6, cordura: -10, carisma: -4 }, rasgo: 'Saliste "mal": piensas demasiado. Eso te salvará o te matará.', home: ['Kamino'], soloEra: ['guerras_clon', 'imperio_temprano'] },
    { id: 'echani', n: 'Echani', vida: 84, mods: { destreza: 16, fisico: 8, carisma: -4 }, rasgo: 'Lees a la gente por cómo se mueve. Hablas peleando.', home: ['Eshan'] },
    { id: 'cerean', n: 'Cerean', vida: 94, mods: { intelecto: 20, cordura: 10, fisico: -6, destreza: -4 }, rasgo: 'Dos cerebros: piensas dos cosas a la vez.', home: ['Cerea'] },
    { id: 'miraluka', n: 'Miraluka', vida: 86, mods: { fuerza: 22, intelecto: 6, destreza: -2 }, rasgo: 'Sin ojos. Ves por la Fuerza, siempre.', home: ['Alpheridies'], sensible: true },
    { id: 'anzati', n: 'Anzati', vida: 300, mods: { carisma: 18, fuerza: 10, alineamiento: -10 }, rasgo: 'Te alimentas de "sopa" ajena. Vives siglos y nadie lo sabe.', home: ['Anzat'] },
    { id: 'falleen', n: 'Falleen', vida: 250, mods: { carisma: 22, intelecto: 8, fisico: 4 }, rasgo: 'Feromonas que persuaden. Sangre fría en todos los sentidos.', home: ['Falleen'] },
    { id: 'defel', n: 'Defel', vida: 74, mods: { destreza: 18, notoriedad: 8, carisma: -10 }, rasgo: 'Absorbes la luz: en penumbra eres una sombra literal.', home: ['Af\'El'] },
    { id: 'talz', n: 'Talz', vida: 90, mods: { fisico: 20, salud: 12, intelecto: -6, carisma: -6 }, rasgo: 'Cuatro ojos y frío en los huesos. Muy pacífico hasta que no.', home: ['Orto Plutonia'] },
    { id: 'chagriano', n: 'Chagriano', vida: 96, mods: { intelecto: 14, carisma: 12, fisico: -4 }, rasgo: 'Voz de anfiteatro. Naciste para presidir algo.', home: ['Champala'] },
    { id: 'muun', n: 'Muun', vida: 100, mods: { intelecto: 20, carisma: 6, fisico: -12, creditos: 20000 }, rasgo: 'Banca intergaláctica en la sangre. El interés compuesto es tu religión.', home: ['Muunilinst'] },
    { id: 'neimoidiano', n: 'Neimoidiano', vida: 88, mods: { intelecto: 12, carisma: 8, fisico: -8, creditos: 12000, reputacion: -8 }, rasgo: 'Gremio de Comercio. Cobarde y riquísimo, en ese orden.', home: ['Neimoidia', 'Cato Neimoidia'] },
    { id: 'kaminoano', n: 'Kaminoano', vida: 92, mods: { intelecto: 24, cordura: 10, fisico: -10, carisma: -8 }, rasgo: 'Genética por encima de ética. Muy alto, muy frío.', home: ['Kamino'] },
    { id: 'quarren', n: 'Quarren', vida: 84, mods: { intelecto: 8, destreza: 8, carisma: -6, notoriedad: 6 }, rasgo: 'Del mismo mundo que los mon calamari y en el bando contrario.', home: ['Mon Cala'] },
    { id: 'ortolano', n: 'Ortolano', vida: 78, mods: { carisma: 14, intelecto: 6, fisico: -6 }, rasgo: 'Oído absoluto. La música te sale sin pedir permiso.', home: ['Orto'] },
    { id: 'bith', n: 'Bith', vida: 82, mods: { intelecto: 18, carisma: 8, fisico: -10 }, rasgo: 'Manos precisas y oído analítico. Músico o cirujano.', home: ['Clak\'dor VII'] },
    { id: 'shistavanen', n: 'Shistavanen', vida: 80, mods: { destreza: 16, fisico: 12, carisma: -10 }, rasgo: 'Rastreador lobuno. Hueles el miedo, literalmente.', home: ['Uvena Prime'] },
    { id: 'noghri', n: 'Noghri', vida: 76, mods: { destreza: 22, fisico: 10, carisma: -12, notoriedad: 8 }, rasgo: 'Asesino nato y leal hasta la muerte a quien te salve.', home: ['Honoghr'] },
    { id: 'yuzzem', n: 'Yuzzem', vida: 88, mods: { fisico: 22, salud: 10, intelecto: -8, cordura: -6 }, rasgo: 'Enorme, gruñón y sorprendentemente sentimental.', home: ['Yuzzem'] },
    { id: 'selkath', n: 'Selkath', vida: 96, mods: { intelecto: 14, cordura: 12, destreza: 4 }, rasgo: 'Diplomacia acuática y muy mal genio bajo presión.', home: ['Manaan'] },
    { id: 'kissai', n: 'Sith puro', vida: 90, mods: { fuerza: 20, fisico: 10, alineamiento: -20, carisma: 6 }, rasgo: 'Sangre de la especie original. Pesa como una losa.', home: ['Korriban'], sensible: true },
    { id: 'dathomiriana', n: 'Hija de Dathomir', vida: 88, mods: { fuerza: 18, destreza: 12, cordura: -8 }, rasgo: 'Magia del aquelarre: no es la Fuerza, o eso dicen ellas.', home: ['Dathomir'], sensible: true },
    { id: 'tusken', n: 'Pueblo de las Arenas', vida: 72, mods: { fisico: 16, destreza: 14, cordura: 10, carisma: -16 }, rasgo: 'Sobrevives donde no hay nada. Nadie de fuera te entiende.', home: ['Tatooine'] },
    { id: 'ewok', n: 'Ewok', vida: 70, mods: { destreza: 16, suerte: 12, fisico: -8, intelecto: -4 }, rasgo: 'Pequeño, subestimado y letal con trampas de madera.', home: ['Endor'] },
    { id: 'gamorreano', n: 'Gamorreano', vida: 66, mods: { fisico: 24, salud: 14, intelecto: -14, carisma: -10 }, rasgo: 'Hacha y lealtad. En ese orden.', home: ['Gamorr', 'Nal Hutta'] },
    { id: 'kubaz', n: 'Kubaz', vida: 80, mods: { intelecto: 10, destreza: 10, notoriedad: 10, carisma: -8 }, rasgo: 'Informador profesional. Todo el mundo te compra algo.', home: ['Kubindi'] },
    { id: 'sluissi', n: 'Sluissi', vida: 94, mods: { intelecto: 18, cordura: 12, destreza: -4 }, rasgo: 'Paciencia infinita en astilleros. Nunca corres.', home: ['Sluis Van'] },
    { id: 'togorian', n: 'Togoriano', vida: 84, mods: { fisico: 20, destreza: 14, carisma: -8 }, rasgo: 'Felino de dos metros. Cazador o corsario, sin punto medio.', home: ['Togoria'] },
    { id: 'verpine', n: 'Verpine', vida: 90, mods: { intelecto: 22, destreza: 10, fisico: -10, carisma: -6 }, rasgo: 'Te comunicas por radio biológica. Armero insuperable.', home: ['Roche'] },
    { id: 'ryn', n: 'Ryn', vida: 82, mods: { carisma: 16, suerte: 14, intelecto: 6, reputacion: -10 }, rasgo: 'Nómada, músico y red de información andante.', home: ['Ord Mantell', 'Nar Shaddaa'] },
    { id: 'humano_corelliano', n: 'Humano corelliano', vida: 84, mods: { destreza: 14, suerte: 10, carisma: 8, reputacion: -4 }, rasgo: 'Naces con la mano puesta en una palanca de hipervelocidad.', home: ['Corellia'] }
  ]);

  /* ================= MUNDOS NUEVOS ================= */
  push(SW.MUNDOS, [
    { n: 'Kamino', r: 'Borde Exterior', bio: 'océano-tormenta', vibe: 'pasillos blancos y lluvia sin fin', riq: 8, ley: 6 },
    { n: 'Cerea', r: 'Borde Medio', bio: 'praderas', vibe: 'sin máquinas por elección', riq: 4, ley: 8 },
    { n: 'Eshan', r: 'Núcleo Interior', bio: 'templado', vibe: 'duelos como conversación', riq: 6, ley: 7 },
    { n: 'Alpheridies', r: 'Borde Exterior', bio: 'infrarrojo', vibe: 'un mundo que nadie ve con los ojos', riq: 3, ley: 6 },
    { n: 'Korriban', r: 'Regiones Desconocidas', bio: 'desierto de tumbas', vibe: 'valle de reyes muertos que susurran', riq: 0, ley: 0 },
    { n: 'Muunilinst', r: 'Núcleo', bio: 'templado', vibe: 'bancos con forma de catedral', riq: 10, ley: 8 },
    { n: 'Cato Neimoidia', r: 'Borde Interior', bio: 'ciudades colgantes', vibe: 'puentes bajo el peso del oro', riq: 9, ley: 5 },
    { n: 'Manaan', r: 'Borde Medio', bio: 'océano total', vibe: 'neutralidad armada y kolto', riq: 8, ley: 9 },
    { n: 'Sluis Van', r: 'Borde Medio', bio: 'estación orbital', vibe: 'astilleros lentos y seguros', riq: 7, ley: 7 },
    { n: 'Roche', r: 'Borde Exterior', bio: 'campo de asteroides', vibe: 'colmenas de armeros', riq: 6, ley: 4 },
    { n: 'Honoghr', r: 'Borde Exterior', bio: 'páramo envenenado', vibe: 'un pueblo con una deuda eterna', riq: 1, ley: 3 },
    { n: 'Gamorr', r: 'Borde Exterior', bio: 'bosque húmedo', vibe: 'guerras de clanes por deporte', riq: 1, ley: 1 },
    { n: 'Orto Plutonia', r: 'Borde Exterior', bio: 'tundra helada', vibe: 'silencio blanco y ojos que miran', riq: 1, ley: 1 },
    { n: 'Champala', r: 'Borde Medio', bio: 'lagos salinos', vibe: 'oratoria y templos abiertos', riq: 6, ley: 8 },
    { n: 'Falleen', r: 'Borde Medio', bio: 'jungla templada', vibe: 'aristocracia de sangre fría', riq: 6, ley: 6 },
    { n: 'Togoria', r: 'Borde Medio', bio: 'llanuras', vibe: 'nadie construye ciudades aquí', riq: 2, ley: 3 },
    { n: 'Uvena Prime', r: 'Borde Exterior', bio: 'bosque boreal', vibe: 'rastreadores y lunas dobles', riq: 2, ley: 2 },
    { n: 'Anzat', r: 'Regiones Desconocidas', bio: 'templado', vibe: 'nadie recuerda haber estado aquí', riq: 3, ley: 0 },
    { n: 'Ord Mantell II', r: 'Borde Medio', bio: 'ciudad flotante', vibe: 'ferias permanentes sobre el mar', riq: 5, ley: 3 },
    { n: 'Serenno', r: 'Borde Exterior', bio: 'bosques nobles', vibe: 'condados y dinero muy viejo', riq: 8, ley: 6 },
    { n: 'Onderon', r: 'Borde Interior', bio: 'jungla amurallada', vibe: 'jinetes de bestias voladoras', riq: 5, ley: 4 },
    { n: 'Dxun', r: 'Borde Interior', bio: 'luna selvática', vibe: 'todo lo que hay quiere comerte', riq: 0, ley: 0 },
    { n: 'Taris', r: 'Borde Exterior', bio: 'ciudad en ruinas', vibe: 'niveles hundidos, pandillas arriba', riq: 3, ley: 1 },
    { n: 'Nal Kesh', r: 'Espacio Hutt', bio: 'pantano ácido', vibe: 'refinerías y capataces', riq: 4, ley: 1 },
    { n: 'Christophsis', r: 'Borde Exterior', bio: 'cristal', vibe: 'torres traslúcidas partidas por la guerra', riq: 6, ley: 4 },
    { n: 'Ryloth Sur', r: 'Borde Exterior', bio: 'cara oscura', vibe: 'frío eterno y minas de ryll', riq: 2, ley: 1 },
    { n: 'Saleucami', r: 'Borde Exterior', bio: 'oasis y desierto', vibe: 'granjas de desertores', riq: 3, ley: 2 },
    { n: 'Rishi', r: 'Borde Exterior', bio: 'archipiélago', vibe: 'puesto de escucha y anguilas', riq: 1, ley: 2 },
    { n: 'Ringo Vinda', r: 'Borde Medio', bio: 'estación anular', vibe: 'un anillo entero alrededor del planeta', riq: 7, ley: 5 },
    { n: 'Umbara Profunda', r: 'Borde Medio', bio: 'selva bioluminiscente', vibe: 'la noche tiene dueño', riq: 5, ley: 2 },
    { n: 'Mygeeto', r: 'Borde Exterior', bio: 'glaciar cristalino', vibe: 'bancos y trincheras a la vez', riq: 7, ley: 3 },
    { n: 'Felucia Sur', r: 'Borde Exterior', bio: 'hongos rojos', vibe: 'esporas que te cuentan cosas', riq: 2, ley: 1 },
    { n: 'Bracca', r: 'Borde Medio', bio: 'desguace planetario', vibe: 'cortas naves de guerra en pedazos', riq: 3, ley: 3 },
    { n: 'Zeffo', r: 'Borde Exterior', bio: 'tumbas ventosas', vibe: 'una civilización que se fue sin avisar', riq: 1, ley: 0 },
    { n: 'Nur', r: 'Regiones Desconocidas', bio: 'océano oscuro', vibe: 'una fortaleza bajo el agua', riq: 4, ley: 8 },
    { n: 'Coruscant Nivel 1313', r: 'Núcleo', bio: 'subciudad', vibe: 'nunca ha visto el sol y le va bien', riq: 3, ley: 1 },
    { n: 'Ilum Profundo', r: 'Regiones Desconocidas', bio: 'cuevas de cristal', vibe: 'el hielo canta si escuchas', riq: 0, ley: 0 },
    { n: 'Wobani', r: 'Borde Exterior', bio: 'campo de trabajo', vibe: 'barro, alambre y turnos', riq: 1, ley: 9 },
    { n: 'Akiva', r: 'Borde Exterior', bio: 'jungla y ciudad', vibe: 'restos imperiales de tertulia', riq: 4, ley: 3 },
    { n: 'Chalmun', r: 'Borde Exterior', bio: 'estación de paso', vibe: 'una cantina del tamaño de un pueblo', riq: 3, ley: 1 },
    { n: 'Vandor', r: 'Borde Medio', bio: 'montaña nevada', vibe: 'trenes de mineral y atracadores', riq: 4, ley: 2 },
    { n: 'Savareen', r: 'Borde Exterior', bio: 'costa árida', vibe: 'refinerías y licor de coaxium', riq: 3, ley: 1 },
    { n: 'Kef Bir', r: 'Regiones Desconocidas', bio: 'luna oceánica', vibe: 'restos de una estación enorme en el oleaje', riq: 1, ley: 1 },
    { n: 'Crait', r: 'Borde Exterior', bio: 'sal roja', vibe: 'zorros de cristal y minas viejas', riq: 1, ley: 0 },
    { n: 'Ajan Kloss', r: 'Borde Exterior', bio: 'jungla', vibe: 'base escondida entre lianas', riq: 1, ley: 1 },
    { n: 'Pasaana', r: 'Borde Exterior', bio: 'desierto de arena movediza', vibe: 'festival cada cuarenta años', riq: 2, ley: 2 },
    { n: 'Kijimi', r: 'Borde Exterior', bio: 'montaña helada', vibe: 'ladrones con abrigo bueno', riq: 3, ley: 1 },
    { n: 'Corvus', r: 'Borde Exterior', bio: 'ceniza', vibe: 'un magistrado y un muro', riq: 2, ley: 4 },
    { n: 'Tython', r: 'Núcleo Profundo', bio: 'montañas sagradas', vibe: 'donde empezó todo esto', riq: 1, ley: 0 },
    { n: 'Ossus', r: 'Borde Interior', bio: 'ruinas verdes', vibe: 'bibliotecas quemadas hace milenios', riq: 2, ley: 1 },
    { n: 'Neimoidia', r: 'Borde Interior', bio: 'pantano de negocios', vibe: 'huevos, contratos y miedo', riq: 8, ley: 5 },
    { n: 'Clak\'dor VII', r: 'Borde Medio', bio: 'atmósfera densa', vibe: 'ciudades-cúpula y música rara', riq: 4, ley: 5 },
    { n: 'Kubindi', r: 'Borde Exterior', bio: 'árido', vibe: 'colmenas y mercado de datos', riq: 3, ley: 3 },
    { n: 'Orto', r: 'Borde Medio', bio: 'templado', vibe: 'todo suena a algo', riq: 4, ley: 6 },
    { n: 'Af\'El', r: 'Borde Exterior', bio: 'penumbra metálica', vibe: 'la luz aquí es un insulto', riq: 4, ley: 3 },
    { n: 'Yuzzem', r: 'Borde Exterior', bio: 'bosque colosal', vibe: 'nadie levanta la voz dos veces', riq: 2, ley: 2 },
    { n: 'Gentes', r: 'Borde Medio', bio: 'industrial', vibe: 'gremios ugnaught y hornos', riq: 5, ley: 5 },
    { n: 'Lasan', r: 'Borde Exterior', bio: 'praderas altas', vibe: 'un pueblo del que casi no queda nadie', riq: 2, ley: 2 },
    { n: 'Concordia', r: 'Borde Medio', bio: 'luna minera', vibe: 'donde se esconden los que no aceptan la paz', riq: 3, ley: 3 },
    { n: 'Devaron', r: 'Borde Interior', bio: 'valles rojos', vibe: 'los hombres se van, las mujeres gobiernan', riq: 4, ley: 4 },
    { n: 'Kinyen', r: 'Borde Medio', bio: 'llanuras de cultivo', vibe: 'pacifistas de tres ojos y muy buena mesa', riq: 5, ley: 8 }
  ]);
  SW.MUNDO_NOMBRES = SW.MUNDOS.map(function (m) { return m.n; });

  /* ================= CRIATURAS, LUGARES, RUMORES ================= */
  push(SW.CRIATURAS, ['colo pez garra', 'opee', 'gorg', 'kowakiano', 'anooba', 'corvo de Umbara', 'rathtar joven', 'sarlacc anciano', 'jinete de dxun', 'drexl', 'kath', 'firaxa', 'vornskr', 'ysalamiri', 'krayt menor', 'zorro de cristal', 'lagarto boga', 'ruping', 'can-cell', 'zillo', 'mudhorn', 'krykna', 'nightbrother rancor', 'bogwing', 'tuk\'ata', 'sando joven', 'condor dragon', 'flea de Jakku', 'blurrg blanco', 'tooka salvaje']);

  push(SW.LUGARES, ['un ascensor averiado entre niveles', 'una sala de máquinas a 60 grados', 'la cola del reparto de raciones', 'un vagón de mineral en marcha', 'una biblioteca sellada', 'un quirófano improvisado', 'un tejado con vistas a dos soles', 'una capilla del Credo', 'una feria de armas', 'un vertedero orbital', 'una piscina de bacta vacía', 'la sala de espera de una aduana', 'un puesto de escucha abandonado', 'una tienda de campaña militar', 'un invernadero de esporas', 'un teatro con la mitad de las butacas rotas', 'un baño público del nivel 40', 'un campo de entrenamiento', 'un pozo de mina inundado', 'una cabina de mando sin luces', 'un mercado de amanecer', 'un banco de niebla en la pista', 'una celda compartida', 'un templo convertido en almacén', 'un funeral ajeno']);

  push(SW.RUMORES, ['un maestro que enseña gratis a quien llegue vivo', 'una nave sin tripulación que responde a la radio', 'un banco de datos imperial olvidado', 'una cría de criatura extinta en venta', 'un pozo que devuelve lo que le tiras', 'un contrato que nadie ha cobrado nunca', 'una ruta que atraviesa un sistema prohibido', 'un traidor dentro del propio consejo', 'un cargamento de kyber sin escolta', 'una ciudad entera que dejó de emitir hace un año', 'una deuda tuya que alguien ya pagó', 'un hermano tuyo que creías muerto', 'un arma que no dispara nada visible', 'una tumba con tu apellido']);

  /* ================= OBJETOS ================= */
  push(SW.OBJETOS, [
    { n: 'rifle bláster DC-15A', p: 3800, t: 'arma' },
    { n: 'pistola de aturdimiento reglamentaria', p: 900, t: 'arma' },
    { n: 'lanzacohetes de hombro', p: 12000, t: 'arma' },
    { n: 'cuchillo de vibro-obsidiana', p: 2400, t: 'arma' },
    { n: 'látigo eléctrico de capataz', p: 1600, t: 'arma' },
    { n: 'arco tusken', p: 700, t: 'arma' },
    { n: 'ballesta wookiee', p: 5200, t: 'arma' },
    { n: 'casco con visor táctico', p: 4400, t: 'armadura' },
    { n: 'placas de armadura clon repintadas', p: 6800, t: 'armadura' },
    { n: 'capa térmica de Hoth', p: 1100, t: 'armadura' },
    { n: 'escudo de energía personal', p: 16000, t: 'armadura' },
    { n: 'droide sonda reparado', p: 7500, t: 'droide' },
    { n: 'droide de seguridad viejo', p: 11000, t: 'droide' },
    { n: 'droide jardinero cariñoso', p: 2100, t: 'droide' },
    { n: 'holocrón jedi intacto', p: 90000, t: 'reliquia' },
    { n: 'amuleto del aquelarre', p: 26000, t: 'reliquia' },
    { n: 'tablilla de los Whills', p: 34000, t: 'reliquia' },
    { n: 'brújula de un templo perdido', p: 52000, t: 'reliquia' },
    { n: 'lote de piezas de hipermotor', p: 9000, t: 'contrabando' },
    { n: 'identidades falsas en blanco', p: 7000, t: 'contrabando' },
    { n: 'ryll refinado', p: 13000, t: 'contrabando' },
    { n: 'coaxium sin refinar', p: 45000, t: 'contrabando' },
    { n: 'reloj de bolsillo de Chandrila', p: 3200, t: 'lujo' },
    { n: 'colección de música ortolana', p: 1800, t: 'lujo' },
    { n: 'té de Ithor de primera cosecha', p: 2400, t: 'lujo' },
    { n: 'swoop bike de carreras', p: 8800, t: 'vehículo' },
    { n: 'moto deslizadora militar', p: 6400, t: 'vehículo' },
    { n: 'cápsula de salvamento reciclada', p: 15000, t: 'vehículo' },
    { n: 'kit de médico de campaña', p: 3600, t: 'herramienta' },
    { n: 'decodificador de sellos imperiales', p: 9500, t: 'herramienta' },
    { n: 'macrobinoculares con registro', p: 1900, t: 'herramienta' },
    { n: 'soldador de precisión verpine', p: 5400, t: 'herramienta' },
    { n: 'grabadora de holomensajes', p: 1200, t: 'herramienta' },
    { n: 'una carta que nunca enviaste', p: 0, t: 'recuerdo' },
    { n: 'la placa de identificación de un hermano', p: 0, t: 'recuerdo' },
    { n: 'un puñado de arena de tu mundo', p: 0, t: 'recuerdo' }
  ]);

  /* ================= NAVES ================= */
  push(SW.NAVES, [
    { n: 'cañonera LAAT/i de segunda mano', p: 140000, vel: 5, carga: 6, arm: 8, cls: 'militar' },
    { n: 'interceptor ARC-170 retirado', p: 165000, vel: 8, carga: 2, arm: 9, cls: 'caza' },
    { n: 'caza Delta-7 jedi', p: 180000, vel: 10, carga: 1, arm: 7, cls: 'caza' },
    { n: 'bombardero Ala-Y cansado', p: 100000, vel: 5, carga: 3, arm: 9, cls: 'caza' },
    { n: 'caza Ala-B experimental', p: 210000, vel: 7, carga: 2, arm: 11, cls: 'caza' },
    { n: 'transporte GR-75 desvencijado', p: 190000, vel: 3, carga: 12, arm: 3, cls: 'carguero' },
    { n: 'yate Naboo cromado', p: 400000, vel: 8, carga: 4, arm: 2, cls: 'yate' },
    { n: 'corbeta Hammerhead usada', p: 700000, vel: 4, carga: 11, arm: 8, cls: 'capital' },
    { n: 'nave de contrabando con doble casco', p: 130000, vel: 7, carga: 9, arm: 4, cls: 'carguero' },
    { n: 'saltador de asteroides', p: 42000, vel: 6, carga: 4, arm: 2, cls: 'chatarra' },
    { n: 'lanzadera médica reconvertida', p: 88000, vel: 5, carga: 7, arm: 1, cls: 'lanzadera' },
    { n: 'caza pirata de piezas sueltas', p: 55000, vel: 8, carga: 1, arm: 6, cls: 'chatarra' },
    { n: 'velero solar de Serenno', p: 350000, vel: 9, carga: 3, arm: 5, cls: 'yate' },
    { n: 'remolcador de desguace', p: 60000, vel: 3, carga: 10, arm: 1, cls: 'carguero' }
  ]);

  /* ================= RASGOS DE ORIGEN ================= */
  push(SW.RASGOS, [
    { id: 'hijo_soldado', n: 'Hijo de soldado', desc: 'Te criaron entre uniformes y ausencias.', mods: { fisico: 10, destreza: 8, cordura: -4 }, w: 8 },
    { id: 'callejero', n: 'Criado en la calle', desc: 'Nadie te enseñó nada y aprendiste todo.', mods: { destreza: 14, carisma: 6, intelecto: -4, notoriedad: 8 }, w: 9 },
    { id: 'templo_criado', n: 'Criado en un templo', desc: 'Rezos, disciplina y silencio.', mods: { cordura: 16, intelecto: 8, carisma: -6 }, w: 6 },
    { id: 'hijo_piloto', n: 'Hijo de pilotos', desc: 'Aprendiste a leer cartas estelares antes que a escribir.', mods: { destreza: 12, intelecto: 8 }, w: 7 },
    { id: 'exiliado', n: 'Familia exiliada', desc: 'Tenéis un apellido que en algún sistema es delito.', mods: { carisma: 8, notoriedad: 10, reputacion: -10 }, w: 6 },
    { id: 'colmena', n: 'Nacido en colmena', desc: 'Uno entre miles. Se te da bien obedecer o rebelarte.', mods: { fisico: 8, cordura: 8, carisma: -8 }, w: 5 },
    { id: 'heredero', n: 'Heredero de un negocio', desc: 'Hay una empresa esperándote y no la quieres.', mods: { creditos: 40000, intelecto: 8, cordura: -6 }, w: 5 },
    { id: 'superviviente', n: 'Único superviviente', desc: 'De tu nave, de tu pueblo o de tu clase. Solo tú.', mods: { suerte: 16, cordura: -16, fisico: 6 }, w: 5 },
    { id: 'hijo_medico', n: 'Hijo de médicos', desc: 'Sabes dónde presionar para que deje de sangrar.', mods: { intelecto: 12, cordura: 6 }, w: 7 },
    { id: 'artista', n: 'Familia de artistas', desc: 'Mucho talento, cero estabilidad.', mods: { carisma: 14, creditos: -1500, cordura: 4 }, w: 7 },
    { id: 'contratado', n: 'Contrato de servidumbre', desc: 'Tus padres firmaron algo por ti antes de que nacieras.', mods: { fisico: 10, destreza: 6, creditos: -5000, cordura: -8 }, w: 6 },
    { id: 'granja_lejana', n: 'Frontera profunda', desc: 'El vecino más cercano está a 200 km.', mods: { cordura: 12, fisico: 8, carisma: -10 }, w: 7 },
    { id: 'chip', n: 'Con un implante desde niño', desc: 'Te pusieron algo dentro. Funciona. No sabes para qué.', mods: { intelecto: 10, salud: -6, cordura: -6 }, w: 4 },
    { id: 'profecia', n: 'Objeto de una profecía', desc: 'Alguien escribió sobre ti antes de conocerte.', mods: { fuerza: 16, notoriedad: 12, cordura: -8 }, w: 3 },
    { id: 'sin_registro', n: 'Sin registro de nacimiento', desc: 'Oficialmente no existes. Tiene ventajas.', mods: { notoriedad: -10, suerte: 10, reputacion: -8 }, w: 5 },
    { id: 'veterano_padres', n: 'Padres veteranos de guerra', desc: 'Nadie habla de ello en la mesa.', mods: { fisico: 8, cordura: -8, destreza: 6 }, w: 7 }
  ]);

  /* ================= HERIDAS Y DOLENCIAS ================= */
  SW.HERIDAS = [
    'quemadura de bláster mal curada', 'costilla rota', 'hombro dislocado que se sale solo',
    'corte profundo en la pierna', 'conmoción con secuelas', 'mano quemada',
    'rodilla destrozada', 'perforación en el costado', 'tímpano reventado',
    'espalda tocada para siempre', 'dedos que ya no cierran bien', 'quemadura de sable'
  ];
  SW.DOLENCIAS = [
    'una dolencia pulmonar por polvo de especia', 'daño hepático', 'una arritmia',
    'un parásito de Felucia', 'desgaste articular', 'anemia crónica',
    'esporas alojadas en el pecho', 'envenenamiento lento por metales', 'migrañas con aura'
  ];

  /* ================= FACCIONES NUEVAS ================= */
  push(SW.FACCIONES, [
    { id: 'gar', n: 'Gran Ejército de la República', color: '#9fd4ff', desc: 'Clones, cañoneras y generales jedi.', eras: ['guerras_clon'] },
    { id: 'primera_orden', n: 'Primera Orden', color: '#e0e4ea', desc: 'Cromo nuevo, ideas viejas.', eras: ['primera_orden'] },
    { id: 'resistencia', n: 'Resistencia', color: '#ff8a3a', desc: 'Poquísimos y muy tercos.', eras: ['primera_orden'] },
    { id: 'nueva_republica', n: 'Nueva República', color: '#9fe8b4', desc: 'Comités otra vez, pero con mejor prensa.', eras: ['nueva_republica'] },
    { id: 'remanente', n: 'Remanente Imperial', color: '#8a9099', desc: 'Señores de la guerra con destructores viejos.', eras: ['nueva_republica', 'primera_orden'] },
    { id: 'inquisitorio', n: 'Inquisitorio', color: '#ff3a3a', desc: 'Cazadores de lo que queda de la Orden.', eras: ['imperio_temprano', 'rebelion'] },
    { id: 'whills', n: 'Guardianes de los Whills', color: '#ffd9a0', desc: 'Fe sin poderes. A veces basta.' },
    { id: 'piratas', n: 'Corsarios del Borde', color: '#c86a2a', desc: 'Sin bandera y con muy buenas naves.' },
    { id: 'gremio_minero', n: 'Gremio Minero', color: '#b8a878', desc: 'Concesiones, capataces y silicosis.' },
    { id: 'tecno_union', n: 'Unión Tecnológica', color: '#7fd8c8', desc: 'Patentes, droides y contratos blindados.', eras: ['republica_tardia', 'guerras_clon'] },
    { id: 'pykes', n: 'Sindicato Pyke', color: '#c8b0ff', desc: 'La especia sube por sus tuberías.' },
    { id: 'nihil', n: 'Los Sin Nombre', color: '#ff6ad5', desc: 'Asaltantes de las Fronteras. Sin reglas.', eras: ['alta_republica'] }
  ]);

  SW.faccion = function (id) {
    for (let i = 0; i < SW.FACCIONES.length; i++) if (SW.FACCIONES[i].id === id) return SW.FACCIONES[i];
    return null;
  };

  /** facciones que existen realmente en esa época */
  /* Cada facción declara sus eras en la propia tabla; había además una
     lista de exclusiones aquí que decía lo mismo con otras palabras, y
     dos fuentes de verdad para lo mismo acaban discrepando. */
  SW.faccionesDeEra = function (era) {
    const out = SW.FACCIONES.filter(function (f) { return !f.eras || f.eras.indexOf(era) >= 0; });
    return out.length ? out : SW.FACCIONES.filter(function (f) { return !f.eras; });
  };

  /** ¿hay una Orden Jedi a la que uno pueda presentarse? */
  SW.ordenActiva = function (era) {
    return ['alta_republica', 'republica_tardia', 'guerras_clon', 'nueva_republica'].indexOf(era) >= 0;
  };
  /** ¿ser jedi es motivo de caza? */
  SW.ordenPerseguida = function (era) {
    return ['imperio_temprano', 'rebelion', 'primera_orden'].indexOf(era) >= 0;
  };

  /* ================= BANDOS POR ÉPOCA =================
     El GAR solo admite clones (y jedi como oficiales). Un civil
     que "se alista" en las Guerras Clon va a una fuerza planetaria.
  */
  SW.bandosDeEra = function (era, s) {
    const esClon = s && (s.especie === 'clon' || s.especie === 'clon_nulo');
    const esJedi = s && (s.trabajo === 'jedi' || (s.sensible && s.stats.fuerza > 45));
    const B = {
      alta_republica: [
        { id: 'republica', n: 'República: cuerpo de exploradores', desc: 'Faros, rutas nuevas y mucho vacío.', fx: { intelecto: 8, destreza: 6 } },
        { id: 'orden_jedi', n: 'Escolta de una misión jedi', desc: 'Vas con ellos aunque no seas uno.', fx: { cordura: 8, reputacion: 8 } },
        { id: 'nihil', n: 'Los Sin Nombre', desc: 'Sin reglas, sin mando, sin futuro.', fx: { notoriedad: 20, alineamiento: -20, creditos: 12000 } }
      ],
      republica_tardia: [
        { id: 'republica', n: 'Fuerzas de seguridad del sector', desc: 'Burocracia con armadura.', fx: { reputacion: 8, destreza: 5 } },
        { id: 'hutt', n: 'Milicia pagada por un cártel', desc: 'Mejor sueldo, peor gente.', fx: { creditos: 14000, alineamiento: -10 } },
        { id: 'gremio_minero', n: 'Guardia de concesión minera', desc: 'Proteges un agujero de otros.', fx: { fisico: 8, creditos: 6000 } }
      ],
      guerras_clon: [
        { id: 'gar', n: 'Gran Ejército de la República', desc: 'Solo para clones. Tú ya estabas dentro al nacer.', soloClon: true, fx: { destreza: 8, fisico: 6 } },
        { id: 'gar', n: 'Oficial jedi al mando de una compañía', desc: 'General sin haberlo pedido.', soloJedi: true, fx: { reputacion: 12, cordura: -8 } },
        { id: 'republica', n: 'Fuerzas de defensa planetaria', desc: 'Voluntarios locales bajo bandera republicana.', fx: { fisico: 8, reputacion: 6 } },
        { id: 'separatistas', n: 'Confederación de Sistemas Independientes', desc: 'Droides delante, tú detrás.', fx: { creditos: 12000, reputacion: -8 } },
        { id: 'contrabando', n: 'Corredor de suministros', desc: 'Sin bandera: vendes a los dos lados.', fx: { creditos: 22000, notoriedad: 10, alineamiento: -6 } }
      ],
      imperio_temprano: [
        { id: 'imperio', n: 'Ejército Imperial', desc: 'Orden, presupuesto y muy pocas preguntas.', fx: { reputacion: 6, destreza: 6, alineamiento: -8 } },
        { id: 'rebelion', n: 'Célula clandestina', desc: 'Todavía no se llama Alianza.', fx: { alineamiento: 12, notoriedad: 12 } },
        { id: 'contrabando', n: 'Nadie: te dedicas a huir', desc: 'La guerra es de otros.', fx: { destreza: 6, cordura: -4 } }
      ],
      rebelion: [
        { id: 'imperio', n: 'Armada Imperial', desc: 'Uniforme gris, carrera larga.', fx: { reputacion: 8, intelecto: 6, alineamiento: -10 } },
        { id: 'rebelion', n: 'Alianza para Restaurar la República', desc: 'Poca flota, muchas canciones.', fx: { alineamiento: 14, notoriedad: 12, carisma: 6 } },
        { id: 'hutt', n: 'Cártel: la guerra es un mercado', desc: 'Los dos bandos necesitan combustible.', fx: { creditos: 26000, alineamiento: -12 } }
      ],
      nueva_republica: [
        { id: 'nueva_republica', n: 'Nueva República', desc: 'Reconstruir es más lento que romper.', fx: { reputacion: 10, intelecto: 6 } },
        { id: 'remanente', n: 'Remanente Imperial', desc: 'Un señor de la guerra con un destructor y ganas.', fx: { creditos: 18000, alineamiento: -14 } },
        { id: 'gremio_caza', n: 'Gremio de Cazarrecompensas', desc: 'Sin política, con contratos.', fx: { destreza: 8, notoriedad: 10 } }
      ],
      primera_orden: [
        { id: 'primera_orden', n: 'Primera Orden', desc: 'Reclutado de niño o convencido de mayor.', fx: { destreza: 8, alineamiento: -14 } },
        { id: 'resistencia', n: 'Resistencia', desc: 'Sois muy pocos y lo sabéis.', fx: { alineamiento: 14, carisma: 6, notoriedad: 10 } },
        { id: 'piratas', n: 'Corsarios del Borde', desc: 'Que se maten ellos.', fx: { creditos: 20000, notoriedad: 12 } }
      ],
      era_perdida: [
        { id: 'piratas', n: 'La flota de quien te encontró', desc: 'No sabes su nombre. Te da igual.', fx: { notoriedad: 12, destreza: 8 } },
        { id: 'whills', n: 'Los que rezan en la bodega', desc: 'Fe sin datos.', fx: { cordura: 14 } }
      ]
    };
    let lista = B[era] || B.rebelion;
    return lista.filter(function (b) {
      if (b.soloClon && !esClon) return false;
      if (b.soloJedi && !esJedi) return false;
      return true;
    });
  };

  /* ================= EL CLON ================= */
  SW.prepararClon = function (s, rng) {
    const num = rng.int(1000, 9999);
    s.nombre = 'CT-' + num;
    s.designacion = 'CT-' + num;
    s.apodo = null;
    s.flags.chip_inhibidor = true;
    s.lote = rng.int(1, 40);
    s.mundo = 'Kamino';
    s.mundoNatal = 'Kamino';
    s.hermanos = [];
    for (let i = 0; i < 4; i++) {
      s.hermanos.push('CT-' + rng.int(1000, 9999));
    }
    s.relaciones.push({ nombre: s.hermanos[0], tipo: 'hermano de lote', afecto: 70, especie: 'Clon', desde: 0 });
    s.relaciones.push({ nombre: s.hermanos[1], tipo: 'hermano de lote', afecto: 60, especie: 'Clon', desde: 0 });
  };

  SW.APODOS_CLON = ['Chatarra', 'Nervios', 'Ojos', 'Búho', 'Hueso', 'Tuerto', 'Cinco', 'Silencio', 'Trueno', 'Rayo', 'Ladrillo', 'Tinta', 'Cuervo', 'Cuchara', 'Nueve', 'Ceniza', 'Duro', 'Risas', 'Sombra', 'Ancla'];

  /* ================= NUEVAS ACTIVIDADES ================= */
  push(SW.ACTIVIDADES, [
    { id: 'escuadron', n: 'Escuadrón', ico: '⛨', desc: 'Tu unidad, tus hermanos, tu guerra.', min: 4, req: function (s) { return s.especie === 'clon' || s.especie === 'clon_nulo' || !!s.bando; } },
    { id: 'politica', n: 'Política', ico: '⚖', desc: 'Senado, comités, sobornos y discursos.', min: 18 },
    { id: 'exploracion', n: 'Exploración', ico: '◎', desc: 'Ruinas, mundos sin cartografiar y cosas enterradas.', min: 14 }
  ]);

  /* la clínica entra en el menú de salud */
  SW.ACTIVIDADES.forEach(function (a) { if (a.id === 'salud') a.desc = 'Clínicas, heridas, gimnasio, terapia, implantes.'; });

})(window);

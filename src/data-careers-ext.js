/* ============================================================
   HOLOVIDA :: expansión de carreras, poderes y estudios
   Con restricción de época: no puedes ser oficial imperial
   durante la Alta República, ni padawan durante la Purga.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const push = function (arr, items) { for (let i = 0; i < items.length; i++) arr.push(items[i]); };

  /* --- las carreras existentes también tienen época --- */
  const ERAS_DE = {
    oficial_imperial: ['imperio_temprano', 'rebelion'],
    piloto_rebelde: ['rebelion', 'imperio_temprano'],
    jedi: ['alta_republica', 'republica_tardia', 'guerras_clon', 'nueva_republica'],
    senador: ['alta_republica', 'republica_tardia', 'guerras_clon', 'nueva_republica', 'rebelion']
  };
  SW.CARRERAS.forEach(function (c) { if (ERAS_DE[c.id]) c.era = ERAS_DE[c.id]; });

  push(SW.CARRERAS, [
    { id: 'clon_soldado', n: 'Soldado clon', fam: 'militar', stat: 'destreza', sueldoBase: 0, req: {}, desc: 'No cobras. Nunca has cobrado.', faccion: 'gar', era: ['guerras_clon'], esp: ['clon', 'clon_nulo'],
      rangos: ['Cadete', 'Soldado raso', 'Cabo', 'Sargento', 'Comandante', 'Capitán clon'] },
    { id: 'clon_arc', n: 'Comando ARC', fam: 'militar', stat: 'destreza', sueldoBase: 0, req: { destreza: 65 }, desc: 'Entrenamiento especial. Iniciativa permitida.', faccion: 'gar', era: ['guerras_clon'], esp: ['clon', 'clon_nulo'],
      rangos: ['Aspirante ARC', 'ARC', 'ARC veterano', 'Líder de escuadra ARC', 'Alfa'] },
    { id: 'clon_medico', n: 'Médico de campaña clon', fam: 'militar', stat: 'intelecto', sueldoBase: 0, req: { intelecto: 45 }, desc: 'Los sacas de la cañonera y los devuelves enteros.', faccion: 'gar', era: ['guerras_clon'], esp: ['clon', 'clon_nulo'],
      rangos: ['Auxiliar', 'Médico', 'Médico jefe', 'Cirujano de flota'] },
    { id: 'clon_piloto', n: 'Piloto clon', fam: 'vuelo', stat: 'destreza', sueldoBase: 0, req: { destreza: 55 }, desc: 'Cañonera, ARC-170 o bombardero. Todos duelen.', faccion: 'gar', era: ['guerras_clon'], esp: ['clon', 'clon_nulo'],
      rangos: ['Piloto novato', 'Piloto', 'Líder de vuelo', 'Comandante de escuadrón'] },
    { id: 'stormtrooper', n: 'Soldado de asalto', fam: 'militar', stat: 'destreza', sueldoBase: 9000, req: { destreza: 40 }, desc: 'Casco blanco, puntería discutible.', faccion: 'imperio', era: ['imperio_temprano', 'rebelion'],
      rangos: ['Recluta', 'Soldado', 'Cabo', 'Sargento', 'Comandante de guarnición'] },
    { id: 'agente_isb', n: 'Agente del BSI', fam: 'crimen', stat: 'intelecto', sueldoBase: 24000, req: { intelecto: 60 }, desc: 'Buró de Seguridad Imperial. Nadie te quiere en su mesa.', faccion: 'imperio', era: ['imperio_temprano', 'rebelion'],
      rangos: ['Analista', 'Supervisor', 'Agente mayor', 'Coronel', 'Director'] },
    { id: 'inquisidor', n: 'Inquisidor', fam: 'fuerza', stat: 'fuerza', sueldoBase: 30000, req: { fuerza: 55 }, desc: 'Cazas a los tuyos. Te enseñaron a disfrutarlo.', faccion: 'inquisitorio', era: ['imperio_temprano', 'rebelion'],
      rangos: ['Iniciado del Inquisitorio', 'Inquisidor', 'Gran Inquisidor'] },
    { id: 'oficial_resistencia', n: 'Oficial de la Resistencia', fam: 'militar', stat: 'carisma', sueldoBase: 6000, req: { carisma: 45 }, desc: 'Sois treinta y sabéis los nombres de todos.', faccion: 'resistencia', era: ['primera_orden'],
      rangos: ['Voluntario', 'Teniente', 'Comandante', 'General'] },
    { id: 'oficial_po', n: 'Oficial de la Primera Orden', fam: 'militar', stat: 'intelecto', sueldoBase: 22000, req: { intelecto: 50 }, desc: 'Criado para esto desde niño.', faccion: 'primera_orden', era: ['primera_orden'],
      rangos: ['Cadete', 'Teniente', 'Capitán', 'General', 'Líder Supremo'] },
    { id: 'explorador', n: 'Explorador de rutas', fam: 'vuelo', stat: 'intelecto', sueldoBase: 14000, req: { intelecto: 50, destreza: 40 }, desc: 'Cartografías lo que aún no tiene nombre.',
      rangos: ['Aprendiz de carta', 'Explorador', 'Cartógrafo jefe', 'Descubridor de rutas', 'Leyenda de los faros'] },
    { id: 'arqueologo', n: 'Saqueador de tumbas', fam: 'crimen', stat: 'intelecto', sueldoBase: 12000, req: { intelecto: 45 }, desc: 'Como el xenoarqueólogo, pero sin permisos.', ilegal: true,
      rangos: ['Excavador', 'Saqueador', 'Especialista en reliquias', 'Proveedor de coleccionistas', 'Leyenda de los museos'] },
    { id: 'medico_droide', n: 'Ingeniero de droides', fam: 'tecnico', stat: 'intelecto', sueldoBase: 15000, req: { intelecto: 55 }, desc: 'Los reparas y, a veces, los escuchas.',
      rangos: ['Montador', 'Técnico', 'Ingeniero', 'Diseñador', 'Padre de una línea entera'] },
    { id: 'cocinero', n: 'Cocinero de puerto', fam: 'civil', stat: 'carisma', sueldoBase: 7000, req: {}, desc: 'Todo el mundo vuelve a un buen puesto de comida.',
      rangos: ['Pinche', 'Cocinero', 'Dueño del puesto', 'Restaurador conocido', 'Institución del sector'] },
    { id: 'periodista', n: 'Periodista de la HoloRed', fam: 'civil', stat: 'intelecto', sueldoBase: 11000, req: { intelecto: 50, carisma: 40 }, desc: 'Publicar lo que otros pagan por tapar.',
      rangos: ['Becario', 'Reportero', 'Corresponsal', 'Editor', 'Voz del sector'] },
    { id: 'abogado', n: 'Abogado de gremio', fam: 'civil', stat: 'intelecto', sueldoBase: 20000, req: { intelecto: 60, carisma: 45 }, desc: 'Contratos, cláusulas y salir del paso.',
      rangos: ['Pasante', 'Abogado', 'Socio', 'Consejero de gremio', 'Árbitro sectorial'] },
    { id: 'capataz', n: 'Capataz de mina', fam: 'civil', stat: 'carisma', sueldoBase: 13000, req: { carisma: 40, fisico: 40 }, desc: 'Mandas a gente cansada.', faccion: 'gremio_minero',
      rangos: ['Encargado de turno', 'Capataz', 'Jefe de pozo', 'Director de concesión'] },
    { id: 'piloto_pruebas', n: 'Piloto de pruebas', fam: 'vuelo', stat: 'destreza', sueldoBase: 26000, req: { destreza: 65, intelecto: 45 }, desc: 'Vuelas lo que aún no debería volar.',
      rangos: ['Suplente', 'Piloto de pruebas', 'Jefe de programa', 'As de fábrica'] },
    { id: 'asesino', n: 'Asesino a sueldo', fam: 'crimen', stat: 'destreza', sueldoBase: 40000, req: { destreza: 70 }, desc: 'Un nombre, un precio, un problema menos.', ilegal: true, faccion: 'sol_negro',
      rangos: ['Ejecutor novato', 'Asesino', 'Especialista', 'Nombre que se susurra'] },
    { id: 'guardia', n: 'Guardia personal', fam: 'militar', stat: 'fisico', sueldoBase: 17000, req: { fisico: 55, destreza: 45 }, desc: 'Tu trabajo es ponerte delante.',
      rangos: ['Escolta', 'Guardia', 'Jefe de seguridad', 'Sombra personal'] },
    { id: 'domador', n: 'Domador de bestias', fam: 'civil', stat: 'carisma', sueldoBase: 9000, req: { carisma: 45, fisico: 40 }, desc: 'Trabajas con lo que muerde.',
      rangos: ['Mozo de establo', 'Domador', 'Especialista en fauna', 'Director de reserva'] },
    { id: 'agricultor_espacial', n: 'Granjero orbital', fam: 'civil', stat: 'intelecto', sueldoBase: 10000, req: { intelecto: 40 }, desc: 'Hidroponía en órbita: alimentas sistemas enteros.',
      rangos: ['Operario', 'Técnico agrónomo', 'Gestor de anillo', 'Proveedor de sector'] },
    { id: 'artista_holo', n: 'Estrella de la HoloRed', fam: 'civil', stat: 'carisma', sueldoBase: 12000, req: { carisma: 60 }, desc: 'Millones te ven. Nadie te conoce.',
      rangos: ['Aspirante', 'Rostro conocido', 'Estrella', 'Icono galáctico'] },
    { id: 'contramaestre', n: 'Contramaestre de flota', fam: 'vuelo', stat: 'carisma', sueldoBase: 19000, req: { carisma: 50, intelecto: 45 }, desc: 'Que la flota funcione es cosa tuya.',
      rangos: ['Auxiliar', 'Contramaestre', 'Jefe de operaciones', 'Almirante de logística'] },
    { id: 'monje_tec', n: 'Monje tecnológico', fam: 'fuerza', stat: 'intelecto', sueldoBase: 4000, req: { intelecto: 55, cordura: 50 }, desc: 'Reparas máquinas viejas como quien reza.',
      rangos: ['Novicio', 'Hermano', 'Custodio', 'Archivero del silencio'] },
    { id: 'esclavista_libre', n: 'Liberador de contratos', fam: 'crimen', stat: 'carisma', sueldoBase: 8000, req: { carisma: 50 }, desc: 'Compras contratos de servidumbre para romperlos.',
      rangos: ['Voluntario', 'Negociador', 'Coordinador de red', 'Nombre en muchas oraciones'] },
    { id: 'corsario', n: 'Corsario', fam: 'crimen', stat: 'destreza', sueldoBase: 24000, req: { destreza: 55 }, desc: 'Pirata con buena prensa entre los suyos.', ilegal: true, faccion: 'piratas',
      rangos: ['Marinero', 'Corsario', 'Segundo', 'Capitán', 'Almirante sin bandera'] }
  ]);

  /* ================= PODERES NUEVOS ================= */
  push(SW.PODERES, [
    { id: 'telequinesis', n: 'Telequinesis mayor', coste: 60, lado: 0, desc: 'Levantas naves pequeñas. Con esfuerzo.' },
    { id: 'reflejo', n: 'Reflejo precognitivo', coste: 40, lado: 0, desc: 'Esquivas antes de que disparen.' },
    { id: 'rastreo', n: 'Rastro en la Fuerza', coste: 35, lado: 0, desc: 'Sigues a alguien por su eco.' },
    { id: 'bestias', n: 'Vínculo con bestias', coste: 30, lado: 1, desc: 'Los animales te escuchan.' },
    { id: 'aliento', n: 'Aliento de la Fuerza', coste: 55, lado: 1, desc: 'Sobrevives sin aire, sin agua, sin comida.' },
    { id: 'escudo', n: 'Barrera de Fuerza', coste: 50, lado: 1, desc: 'Detienes lo que viene, incluso el fuego.' },
    { id: 'transferir', n: 'Transferencia vital', coste: 85, lado: 1, desc: 'Das tu vida para salvar otra. Una vez.' },
    { id: 'terror', n: 'Ola de terror', coste: 45, lado: -1, desc: 'Huyen sin saber por qué.' },
    { id: 'corromper', n: 'Corromper mente', coste: 65, lado: -1, desc: 'No obedecen: creen que fue idea suya.' },
    { id: 'hambre', n: 'Hambre insaciable', coste: 80, lado: -1, desc: 'Drenas la vida de todo un lugar.' },
    { id: 'esencia', n: 'Transferencia de esencia', coste: 95, lado: -1, desc: 'Sigues aquí aunque tu cuerpo no.' },
    { id: 'ilusion', n: 'Ilusión', coste: 45, lado: 0, desc: 'Ven lo que quieres que vean.' },
    { id: 'sanar_grupo', n: 'Círculo de sanación', coste: 70, lado: 1, desc: 'Curas a todos los que te rodean.' },
    { id: 'relampago_cadena', n: 'Tormenta', coste: 90, lado: -1, desc: 'Rayos en cadena. Se ve desde la órbita.' },
    { id: 'magia_noche', n: 'Magia de las Hermanas', coste: 50, lado: -1, desc: 'Icor verde, no midiclorianos. Ellas dirán.' },
    { id: 'vinculo', n: 'Vínculo de díada', coste: 75, lado: 0, desc: 'Dos mentes, una sola conexión, a años luz.' }
  ]);

  /* ================= ESTUDIOS NUEVOS ================= */
  push(SW.ESTUDIOS, [
    { id: 'kamino_cadete', n: 'Instrucción de cadete en Kamino', coste: 0, años: 5, mods: { destreza: 20, fisico: 16, cordura: 6 }, esp: ['clon', 'clon_nulo'] },
    { id: 'academia_imperial', n: 'Academia Imperial de Carida', coste: 15000, años: 4, mods: { destreza: 14, intelecto: 12, alineamiento: -8 }, faccion: 'imperio', era: ['imperio_temprano', 'rebelion'] },
    { id: 'medicina', n: 'Facultad de medicina de Mon Cala', coste: 50000, años: 6, mods: { intelecto: 26, cordura: 8 } },
    { id: 'derecho', n: 'Derecho gremial en Muunilinst', coste: 42000, años: 4, mods: { intelecto: 20, carisma: 12 } },
    { id: 'pilotaje', n: 'Escuela de pilotos de Corellia', coste: 22000, años: 3, mods: { destreza: 22, intelecto: 8 } },
    { id: 'conservatorio', n: 'Conservatorio de Orto', coste: 16000, años: 4, mods: { carisma: 24, cordura: 10 } },
    { id: 'arena', n: 'Escuela de arena de Nal Hutta', coste: 4000, años: 3, mods: { fisico: 22, destreza: 14, cordura: -8 } },
    { id: 'whills', n: 'Noviciado de los Whills', coste: 0, años: 6, mods: { cordura: 24, intelecto: 8, fisico: 6 } },
    { id: 'exploradores', n: 'Cuerpo de exploradores', coste: 9000, años: 3, mods: { intelecto: 14, destreza: 12, fisico: 8 } },
    { id: 'inquisitorio', n: 'Adiestramiento del Inquisitorio', coste: 0, años: 5, mods: { fuerza: 24, destreza: 14, alineamiento: -25, cordura: -12 }, req: { fuerza: 40 }, era: ['imperio_temprano', 'rebelion'] }
  ]);

  /* la Orden solo admite alumnos cuando existe */
  SW.ESTUDIOS.forEach(function (e) {
    if (e.id === 'templo') e.era = ['alta_republica', 'republica_tardia', 'guerras_clon', 'nueva_republica'];
    if (e.id === 'academia_naval') e.era = ['republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion', 'nueva_republica'];
  });

})(window);

/* ============================================================
   UN OFICIO A LA VEZ
   El motor solo tiene una casilla de trabajo, así que aceptar uno
   nuevo borraba el anterior sin decir nada: te metías en el Gremio
   de Cazarrecompensas y seguías figurando de mecánico. Ahora se
   avisa y decides tú.

   No todo choca. Un escaño en el Senado se compagina con casi
   cualquier cosa —para eso es un cargo, no un turno— y con el bajo
   mundo se compagina en secreto, que es como se ha hecho siempre.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  // oficios que son un cargo, no una jornada: caben junto a otra cosa
  const CARGOS = ['senador', 'gobernador', 'academico', 'musico'];
  // y los que exigen tu vida entera
  const EXCLUSIVOS = ['jedi', 'sith', 'inquisidor', 'cazarrecompensas', 'mando'];

  SW.chocaConTrabajo = function (s, nuevo) {
    if (!s.trabajo || s.trabajo === nuevo) return false;
    if (CARGOS.indexOf(nuevo) >= 0 && CARGOS.indexOf(s.trabajo) < 0) return false;
    if (CARGOS.indexOf(s.trabajo) >= 0 && CARGOS.indexOf(nuevo) < 0) return false;
    return true;
  };

  SW.menuDejarTrabajo = function (g, empleo) {
    const s = g.s;
    const viejo = SW.carrera(s.trabajo);
    const nuevo = SW.carrera(empleo.id);
    const exclusivo = EXCLUSIVOS.indexOf(empleo.id) >= 0;
    return {
      id: 'trabajo_choca', gen: true, esMenu: true,
      t: '<span class="scene-tag">NO CABEN LAS DOS COSAS</span>' +
        '<p>Ahora mismo eres <b>' + U.esc(s.rango || (viejo ? viejo.n : 'algo')) + '</b>' +
        (viejo ? ' (' + U.esc(viejo.n) + ')' : '') + '.</p>' +
        '<p>Para entrar en <b>' + U.esc(nuevo ? nuevo.n : empleo.id) + '</b> hay que dejarlo. ' +
        (exclusivo ? 'Esto no es un empleo con horario: es a lo que te dedicas.'
                   : 'Nadie hace dos jornadas completas.') + '</p>' +
        '<p class="dim">Sueldo actual ' + U.cr(s.sueldo || 0) + ' · ' + (s.añosEnTrabajo || 0) + ' años dentro.</p>',
      c: [
        { t: 'Dejarlo y empezar de cero', sub: 'Se acabó lo anterior.',
          cambiarEmpleo: empleo, fx: { cordura: -4 } },
        { t: 'Dejarlo bien, avisando con tiempo',
          req: function (st) { return (st.añosEnTrabajo || 0) >= 2; },
          sub: 'Pierdes unos meses de sueldo y ganas una puerta abierta.',
          cambiarEmpleo: empleo, fx: { creditos: -3000, reputacion: 8, cordura: 4 },
          out: 'Te despiden con un apretón de manos. Eso vale más de lo que parece.' },
        { t: 'Quedarte donde estás', fx: { cordura: 4 },
          out: 'Lo dejas pasar. A lo mejor vuelve a salir, a lo mejor no.' }
      ]
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

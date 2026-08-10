/* ============================================================
   HOLOVIDA :: carreras, rangos, estudios y poderes
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});

  /* ---------- CARRERAS ----------
     req: umbrales mínimos | rangos: escalera de ascensos
     stat: estadística que rige los ascensos
  */
  SW.CARRERAS = [
    {
      id: 'granjero', n: 'Granjero de humedad', fam: 'civil', stat: 'salud', sueldoBase: 4200,
      req: {}, desc: 'Vaporizadores, arena y horizonte.',
      rangos: ['Peón', 'Granjero', 'Propietario', 'Cooperativista', 'Terrateniente del sector']
    },
    {
      id: 'mecanico', n: 'Mecánico de hangar', fam: 'tecnico', stat: 'intelecto', sueldoBase: 9000,
      req: { intelecto: 25 }, desc: 'Manos negras, oído fino para motores.',
      rangos: ['Aprendiz', 'Mecánico', 'Jefe de taller', 'Ingeniero de vuelo', 'Maestro constructor']
    },
    {
      id: 'slicer', n: 'Slicer', fam: 'tecnico', stat: 'intelecto', sueldoBase: 14000,
      req: { intelecto: 45 }, desc: 'Puertas que no eran tuyas, ahora lo son.', ilegal: true,
      rangos: ['Script kiddie de datapad', 'Slicer', 'Fantasma de red', 'Arquitecto de intrusión', 'Leyenda anónima']
    },
    {
      id: 'medico', n: 'Médico de campaña', fam: 'civil', stat: 'intelecto', sueldoBase: 16000,
      req: { intelecto: 50 }, desc: 'Bacta, torniquetes y muy poco sueño.',
      rangos: ['Auxiliar', 'Médico', 'Cirujano', 'Jefe de trauma', 'Director de nave hospital']
    },
    {
      id: 'piloto_carga', n: 'Piloto de carga', fam: 'vuelo', stat: 'destreza', sueldoBase: 12000,
      req: { destreza: 35 }, desc: 'Rutas legales, márgenes finos.',
      rangos: ['Copiloto', 'Piloto', 'Capitán de ruta', 'Jefe de flota', 'Armador']
    },
    {
      id: 'contrabandista', n: 'Contrabandista', fam: 'crimen', stat: 'suerte', sueldoBase: 22000,
      req: { destreza: 40 }, desc: 'Compartimentos falsos y sonrisa ancha.', ilegal: true,
      rangos: ['Mula', 'Corredor', 'Contrabandista', 'Capitán de ruta negra', 'Rey del pasillo de Kessel']
    },
    {
      id: 'cazarrecompensas', n: 'Cazarrecompensas', fam: 'crimen', stat: 'destreza', sueldoBase: 26000,
      req: { destreza: 50 }, desc: 'El contrato es el credo.', ilegal: false,
      rangos: ['Novato del Gremio', 'Cazador', 'Cazador de clase alta', 'Especialista', 'Leyenda del Gremio']
    },
    {
      id: 'mercenario', n: 'Mercenario', fam: 'militar', stat: 'destreza', sueldoBase: 18000,
      req: { destreza: 45, salud: 40 }, desc: 'Bandos intercambiables, factura fija.',
      rangos: ['Carne de cañón', 'Soldado de fortuna', 'Jefe de escuadra', 'Comandante de compañía', 'Señor de la guerra']
    },
    {
      id: 'oficial_imperial', n: 'Oficial imperial', fam: 'militar', stat: 'intelecto', sueldoBase: 20000,
      req: { intelecto: 45, carisma: 30 }, desc: 'Uniforme gris, ambición negra.', faccion: 'imperio',
      rangos: ['Cadete', 'Teniente', 'Comandante', 'Capitán', 'Almirante', 'Gran Moff']
    },
    {
      id: 'piloto_rebelde', n: 'Piloto de la Alianza', fam: 'vuelo', stat: 'destreza', sueldoBase: 8000,
      req: { destreza: 55 }, desc: 'Poca paga, buenas canciones.', faccion: 'rebelion',
      rangos: ['Recluta', 'Piloto de escuadrón', 'Líder de vuelo', 'Comandante de ala', 'General']
    },
    {
      id: 'senador', n: 'Político galáctico', fam: 'civil', stat: 'carisma', sueldoBase: 30000,
      req: { carisma: 60, intelecto: 45 }, desc: 'Discursos, comités y sobres.',
      rangos: ['Ayudante', 'Representante', 'Senador', 'Presidente de comité', 'Canciller']
    },
    {
      id: 'comerciante', n: 'Comerciante', fam: 'civil', stat: 'carisma', sueldoBase: 15000,
      req: { carisma: 40 }, desc: 'Compra barato en un sistema, vende caro en otro.',
      rangos: ['Vendedor de puesto', 'Comerciante', 'Importador', 'Magnate menor', 'Barón del comercio']
    },
    {
      id: 'gladiador', n: 'Gladiador de arena', fam: 'militar', stat: 'destreza', sueldoBase: 11000,
      req: { destreza: 45, salud: 50 }, desc: 'La multitud paga por tu cara rota.',
      rangos: ['Carne fresca', 'Luchador', 'Favorito del público', 'Campeón', 'Invicto del sector']
    },
    {
      id: 'podracer', n: 'Corredor de vainas', fam: 'vuelo', stat: 'destreza', sueldoBase: 13000,
      req: { destreza: 60 }, desc: 'Reflejos imposibles o funeral corto.',
      rangos: ['Aspirante', 'Corredor', 'Corredor de circuito', 'Estrella del Boonta', 'Leyenda de las vainas']
    },
    {
      id: 'espia', n: 'Espía', fam: 'crimen', stat: 'carisma', sueldoBase: 17000,
      req: { carisma: 45, intelecto: 45 }, desc: 'Muchos nombres, ninguna casa.', ilegal: true,
      rangos: ['Informante', 'Agente de campo', 'Agente encubierto', 'Jefe de célula', 'Director de inteligencia']
    },
    {
      id: 'minero', n: 'Minero de especia', fam: 'civil', stat: 'salud', sueldoBase: 7000,
      req: { salud: 45 }, desc: 'Pulmones de cristal y horas eternas.',
      rangos: ['Perforador', 'Minero', 'Capataz', 'Jefe de pozo', 'Concesionario']
    },
    {
      id: 'musico', n: 'Músico de cantina', fam: 'civil', stat: 'carisma', sueldoBase: 5000,
      req: { carisma: 40 }, desc: 'Todos te oyen, nadie te escucha.',
      rangos: ['Callejero', 'Músico de cantina', 'Banda residente', 'Gira de sector', 'Estrella holográfica']
    },
    {
      id: 'jedi', n: 'Camino Jedi', fam: 'fuerza', stat: 'fuerza', sueldoBase: 0,
      req: { fuerza: 30 }, desc: 'Sin paga, con propósito.', faccion: 'orden_jedi',
      rangos: ['Iniciado', 'Padawan', 'Caballero Jedi', 'Maestro Jedi', 'Miembro del Consejo']
    },
    {
      id: 'sith', n: 'Camino Oscuro', fam: 'fuerza', stat: 'fuerza', sueldoBase: 0,
      req: { fuerza: 30 }, desc: 'Todo el poder, ninguna amistad.', faccion: 'sith',
      rangos: ['Acólito', 'Aprendiz', 'Señor Sith', 'Señor Oscuro', 'Emperador en la sombra']
    },
    {
      id: 'mando', n: 'Guerrero mandaloriano', fam: 'militar', stat: 'destreza', sueldoBase: 16000,
      req: { destreza: 50 }, desc: 'Este es el Camino.', faccion: 'mandalorianos',
      rangos: ['Iniciado', 'Verd', 'Al\'verde', 'Jefe de clan', 'Mand\'alor']
    },
    {
      id: 'sacerdote', n: 'Guardián de los Whills', fam: 'fuerza', stat: 'cordura', sueldoBase: 2000,
      req: { cordura: 55 }, desc: 'Sin Fuerza, con fe. A veces basta.',
      rangos: ['Peregrino', 'Guardián', 'Guardián mayor', 'Custodio del templo', 'Voz de los Whills']
    },
    {
      id: 'chatarrero', n: 'Chatarrero', fam: 'civil', stat: 'suerte', sueldoBase: 3000,
      req: {}, desc: 'Peso en piezas, pago en raciones.',
      rangos: ['Rebuscador', 'Chatarrero', 'Tasador', 'Dueño de puesto', 'Jefe de desguace']
    },
    {
      id: 'ejecutor_hutt', n: 'Ejecutor de cártel', fam: 'crimen', stat: 'destreza', sueldoBase: 19000,
      req: { destreza: 45 }, desc: 'Cobras deudas con métodos poco elegantes.', ilegal: true, faccion: 'hutt',
      rangos: ['Matón', 'Ejecutor', 'Lugarteniente', 'Mano derecha', 'Jefe de cártel']
    },
    {
      id: 'academico', n: 'Xenoarqueólogo', fam: 'civil', stat: 'intelecto', sueldoBase: 10000,
      req: { intelecto: 55 }, desc: 'Ruinas, polvo y publicaciones.',
      rangos: ['Becario', 'Investigador', 'Doctor', 'Catedrático', 'Descubridor de una civilización']
    }
  ];

  SW.carrera = function (id) {
    for (let i = 0; i < SW.CARRERAS.length; i++) if (SW.CARRERAS[i].id === id) return SW.CARRERAS[i];
    return null;
  };

  /* ---------- ESTUDIOS ---------- */
  SW.ESTUDIOS = [
    { id: 'basica', n: 'Escuela básica del sector', coste: 0, años: 6, mods: { intelecto: 10 } },
    { id: 'academia_naval', n: 'Academia Naval de Anaxes', coste: 20000, años: 4, mods: { intelecto: 15, destreza: 12 }, faccion: 'imperio' },
    { id: 'universidad', n: 'Universidad de Coruscant', coste: 45000, años: 4, mods: { intelecto: 25, carisma: 8 } },
    { id: 'templo', n: 'Templo Jedi', coste: 0, años: 8, mods: { fuerza: 25, cordura: 15, destreza: 10 }, req: { fuerza: 25 } },
    { id: 'gremio_tec', n: 'Gremio técnico de Duro', coste: 12000, años: 3, mods: { intelecto: 18 } },
    { id: 'calle', n: 'La calle', coste: 0, años: 4, mods: { destreza: 15, carisma: 8, notoriedad: 10, cordura: -6 } },
    { id: 'aquelarre', n: 'Aquelarre de Dathomir', coste: 0, años: 5, mods: { fuerza: 20, cordura: -10, destreza: 10 }, req: { fuerza: 20 } },
    { id: 'forja', n: 'Forja mandaloriana', coste: 8000, años: 4, mods: { destreza: 20, salud: 10 } }
  ];

  /* ---------- PODERES DE LA FUERZA ---------- */
  SW.PODERES = [
    { id: 'empujon', n: 'Empujón de Fuerza', coste: 10, lado: 0, desc: 'Mover cosas. Y gente.' },
    { id: 'salto', n: 'Salto de Fuerza', coste: 12, lado: 0, desc: 'Tres pisos hacia arriba.' },
    { id: 'persuasion', n: 'Persuasión mental', coste: 25, lado: 0, desc: 'Funciona con los débiles de mente.' },
    { id: 'vision', n: 'Visión del futuro', coste: 35, lado: 0, desc: 'Fragmentos. Casi nunca útiles.' },
    { id: 'curacion', n: 'Curación', coste: 45, lado: 1, desc: 'Cierra heridas. Cuesta salud propia.' },
    { id: 'valor', n: 'Valor de batalla', coste: 30, lado: 1, desc: 'Reflejos amplificados en combate.' },
    { id: 'meditacion', n: 'Meditación profunda', coste: 20, lado: 1, desc: 'Recuperas cordura y claridad.' },
    { id: 'rayo', n: 'Rayos de Fuerza', coste: 55, lado: -1, desc: 'Dolor puro. Te consume.' },
    { id: 'estrangular', n: 'Estrangulamiento', coste: 40, lado: -1, desc: 'Sin tocarlos. Muy efectivo, muy caro moralmente.' },
    { id: 'rabia', n: 'Rabia', coste: 30, lado: -1, desc: 'Más daño, menos control.' },
    { id: 'drenar', n: 'Drenar vida', coste: 70, lado: -1, desc: 'Su salud pasa a ser tuya.' },
    { id: 'fantasma', n: 'Presencia espectral', coste: 90, lado: 1, desc: 'Puedes volver después de morir.' },
    { id: 'combate', n: 'Forma de combate avanzada', coste: 50, lado: 0, desc: 'Dominas una forma de sable.' },
    { id: 'ocultar', n: 'Ocultar presencia', coste: 40, lado: 0, desc: 'Ni la Orden ni los Inquisidores te sienten.' }
  ];

  SW.FORMAS_SABLE = ['Shii-Cho', 'Makashi', 'Soresu', 'Ataru', 'Shien/Djem So', 'Niman', 'Juyo/Vaapad'];
  SW.COLORES_KYBER = [
    { c: 'azul', hex: '#3ad6ff', s: 'Guardián. Templanza.' },
    { c: 'verde', hex: '#6aff8a', s: 'Cónsul. Sabiduría.' },
    { c: 'amarillo', hex: '#ffd23a', s: 'Centinela. Vigilancia.' },
    { c: 'púrpura', hex: '#c98aff', s: 'Filo entre dos luces.' },
    { c: 'blanco', hex: '#ffffff', s: 'Cristal purificado. Sin bando.' },
    { c: 'rojo', hex: '#ff3a3a', s: 'Sangrado. Duele para siempre.' },
    { c: 'naranja', hex: '#ff9d3d', s: 'Raro. Muy raro.' },
    { c: 'negro', hex: '#6a5aff', s: 'El Sable Oscuro. Con el trono incluido.' }
  ];

  /* ---------- ACTIVIDADES (menú anual) ---------- */
  // Cada actividad genera decisiones concretas en tiempo de ejecución.
  SW.ACTIVIDADES = [
    { id: 'trabajo', n: 'Trabajo', ico: '⚙', desc: 'Turnos extra, ascensos, sabotajes de oficina.', min: 14 },
    { id: 'formacion', n: 'Formación', ico: '📚', desc: 'Estudiar, entrenar, meditar, aprender formas.', min: 6 },
    { id: 'social', n: 'Social', ico: '☍', desc: 'Familia, amistades, romance, rivalidades.', min: 4 },
    { id: 'crimen', n: 'Bajos fondos', ico: '☠', desc: 'Robos, contratos, cárteles, mercado negro.', min: 12 },
    { id: 'nave', n: 'Hangar', ico: '⛭', desc: 'Comprar naves, mejorarlas, hacer rutas.', min: 16 },
    { id: 'taller', n: 'Taller', ico: '⚙', desc: 'Mejoras que cambian lo que tu nave te deja hacer.', min: 14,
      req: function (s) { return !!s.nave; } },
    { id: 'gremio', n: 'Gremio', ico: '✵', desc: 'Contratos de caza: buscar, seguir, capturar y entregar.', min: 16,
      req: function (s) { return !!s.flags.en_el_gremio || s.trabajo === 'cazarrecompensas'; } },
    { id: 'viaje', n: 'Viajar', ico: '✈', desc: 'Saltar a otro mundo. Todo cambia.', min: 10 },
    { id: 'fuerza', n: 'La Fuerza', ico: '✦', desc: 'Poderes, sables, holocrones, visiones.', min: 6, req: function (s) { return s.stats.fuerza > 5; } },
    { id: 'mercado', n: 'Mercado', ico: '⌂', desc: 'Objetos, médicos, cirugía, apuestas.', min: 10 },
    { id: 'accion', n: 'Acción', ico: '⚔', desc: 'Duelos, combates espaciales, persecuciones.', min: 12 },
    { id: 'salud', n: 'Cuerpo y mente', ico: '✚', desc: 'Clínicas, gimnasio, terapia, implantes.', min: 8 }
  ];

})(window);

/* ============================================================
   HOLOVIDA :: LA GUERRA COMO ESTADO DEL MUNDO
   Antes podías vivir sesenta y cinco años en plenas Guerras Clon
   sin que nadie disparase un tiro. La guerra ahora empieza, tiene
   un frente que se mueve, se nota en el precio del pan y termina.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};

  /* Los bandos de cada conflicto, para que las noticias digan algo. */
  SW.BANDOS = {
    guerras_clon:  ['la República', 'los Separatistas'],
    rebelion:      ['la Alianza Rebelde', 'el Imperio'],
    primera_orden: ['la Resistencia', 'la Primera Orden'],
    alta_republica:['la República', 'los Nihil'],
    imperio:       ['las células rebeldes', 'el Imperio'],
    nueva_republica:['la Nueva República', 'los restos imperiales']
  };

  /* Mundos donde suele haber frente, por conflicto. Si no existen en
     la tabla de mundos se descartan al sortear. */
  SW.FRENTES = {
    guerras_clon:  ['Geonosis', 'Christophsis', 'Ryloth', 'Umbara', 'Felucia', 'Saleucami',
                    'Mygeeto', 'Kashyyyk', 'Utapau', 'Malastare', 'Onderon', 'Lola Sayu'],
    rebelion:      ['Hoth', 'Yavin 4', 'Endor', 'Scarif', 'Lothal', 'Jedha', 'Atollon', 'Mimban'],
    primera_orden: ['Takodana', 'Crait', 'Exegol', 'Kijimi', 'Batuu', 'D\'Qar'],
    alta_republica:['Hetzal', 'Valo', 'Corellia', 'Eiram', 'Ord Mantell'],
    imperio:       ['Lothal', 'Mimban', 'Ferrix', 'Aldhani', 'Kessel'],
    nueva_republica:['Jakku', 'Akiva', 'Chandrila', 'Kuat']
  };

  /* ------------------------------------------------------------
     Estado
     ------------------------------------------------------------ */
  SW.guerraActiva = function (s) { return !!(s && s.guerra && s.guerra.activa); };

  SW.frenteAqui = function (s) {
    return SW.guerraActiva(s) && s.guerra.frente === s.mundo;
  };

  function frenteNuevo(rng, era, evitar) {
    const lista = (SW.FRENTES[era] || []).filter(function (m) {
      return m !== evitar && (!SW.mundo || SW.mundo(m)) &&
             (!SW.mundoViable || SW.mundoViable(m, era));
    });
    if (lista.length) return rng.pick(lista);
    return SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, evitar) : evitar;
  }

  /** Arranca el conflicto. Se llama desde el guion o desde el tick. */
  SW.empezarGuerra = function (g) {
    const s = g.s, rng = g.rng;
    const w = (SW.GUERRAS || {})[s.era];
    if (!w || SW.guerraActiva(s)) return false;
    const bandos = SW.BANDOS[s.era] || ['unos', 'otros'];
    s.guerra = {
      activa: true, n: w.n, era: s.era, año: 0,
      dura: w.dura + rng.int(0, 4),
      frente: frenteNuevo(rng, s.era, s.mundo),
      bandos: bandos,
      marea: 0            // >0 gana el primer bando, <0 el segundo
    };
    s.flags.guerra_estallo = true;
    g.log('Empieza la guerra: <b>' + w.n + '</b>. ' + bandos[0] + ' contra ' + bandos[1] + '.', 'mal');
    g.hito('Vive el estallido de ' + w.n);
    return true;
  };

  SW.acabarGuerra = function (g) {
    const s = g.s;
    if (!SW.guerraActiva(s)) return;
    const b = s.guerra.bandos;
    const gana = s.guerra.marea >= 0 ? b[0] : b[1];
    g.log('Fin de ' + s.guerra.n + '. Gana ' + gana + '. Ahora hay que recoger.', 'res');
    g.hito('Sobrevive a ' + s.guerra.n);
    s.flags.posguerra = true;
    s.flags.veterano_de = s.guerra.n;
    s.guerra.activa = false;
    s.guerra.ganador = gana;
    if (s.flags.en_el_frente) {
      s.flags.en_el_frente = false;
      s.añosDeFrenteRestantes = 0;
      g.log('Te licencian con lo puesto.', 'res');
    }
  };

  /* Titulares: la guerra suena aunque estés lejos. */
  const PARTES = [
    'Cae {f}. Dicen que fue rápido; los que estaban dicen otra cosa.',
    'Bombardeo orbital sobre {f}. Tres días sin noticias.',
    '{a} avanza en {f}. En los holos se ve muy limpio.',
    'Convoy de {b} destruido saliendo de {f}.',
    'Se pide una nueva leva. Bajan la edad mínima otra vez.',
    'Suben los precios: todo lo que sirva para la guerra ya no es para ti.',
    'Llegan refugiados de {f}. Duermen en el puerto.',
    'Cortan las rutas comerciales que pasan cerca de {f}.',
    'Racionamiento. Dos comidas al día y a callar.',
    'Los hospitales de la zona se llenan de heridos de {f}.',
    '{a} pierde una flota entera en {f}. Nadie da cifras.',
    'Alto el fuego de once días. Se rompe al duodécimo.',
    'Detenciones por hablar de más. Aquí ya nadie habla de más.',
    'Reclutadores de {b} en el mercado, pagando en el sitio.',
    'Un general de {a} desaparece. Deserción, dicen unos; purga, dicen otros.',
    'Se cierra el espaciopuerto a naves civiles.',
    'Suben los seguros de carga un cuatrocientos por ciento.',
    'Vuelven los muertos de {f} en cajas idénticas.',
    '{b} bombardea {f} y {a} responde en otro sitio.',
    'La propaganda es tan mala que da la vuelta y hace gracia.'
  ];

  /** Tick anual. Va antes que nada, como la muerte. */
  SW.añoDeGuerraViva = function (g) {
    const s = g.s, rng = g.rng;
    // ¿debe estallar? A partir de los 6 años de vida hay margen para verla venir
    if (!s.guerra && (SW.GUERRAS || {})[s.era] && s.edadBio >= 6 && !s.flags.guerra_estallo) {
      // en época de guerra, la guerra llega pronto y con seguridad
      const p = 0.30 + (s.contadores.años || 0) * 0.03;
      if (rng.chance(Math.min(p, 0.85))) SW.empezarGuerra(g);
      return;
    }
    if (!SW.guerraActiva(s)) return;
    const w = s.guerra;
    w.año++;
    w.marea += rng.int(-2, 2);

    // el frente se mueve
    if (rng.chance(0.5)) {
      const antes = w.frente;
      w.frente = frenteNuevo(rng, w.era, antes);
      if (w.frente === s.mundo) g.log('El frente llega a ' + s.mundo + '. Ya no hay que ir a buscarla.', 'mal');
    }

    // titular del año
    // por U.fill, que además arregla las contracciones («de el Imperio»)
    const t = U.fill(rng.pick(PARTES), { f: w.frente, a: w.bandos[0], b: w.bandos[1] });
    g.log('<i>Parte de guerra:</i> ' + t, 'res');

    // vivir en el frente sin estar alistado también mata
    if (SW.frenteAqui(s) && !s.flags.en_el_frente) {
      s.flags.zona_de_guerra = true;
      const riesgo = 0.05 + (100 - s.stats.salud) / 900;
      if (rng.chance(riesgo)) {
        g.aplicarFx({ salud: -rng.int(18, 40), cordura: -rng.int(6, 15) }, {});
        g.log('Estabas en el sitio equivocado cuando cayó algo grande.', 'mal');
        if (s.stats.salud <= 0) g.morir('Un bombardeo en ' + s.mundo + '.');
      } else {
        g.aplicarFx({ cordura: -rng.int(3, 8) }, {});
      }
    } else {
      s.flags.zona_de_guerra = false;
    }
    if (s.muerto) return;

    // la economía de guerra pellizca a todos
    if (rng.chance(0.4) && s.stats.creditos > 2000) {
      const q = Math.round(s.stats.creditos * 0.06);
      s.stats.creditos -= q;
      g.log('Impuesto de guerra: ' + U.cr(q) + '.', 'mal');
    }

    if (w.año >= w.dura) SW.acabarGuerra(g);
  };

  /* ------------------------------------------------------------
     Eventos que solo existen mientras hay guerra
     ------------------------------------------------------------ */
  function G(arr) {
    SW.EVENTOS = SW.EVENTOS || [];
    arr.forEach(function (e) {
      const r0 = e.req;
      e.slots = e.slots || { mundoAqui: 'mundoAqui', faccion: 'faccion', paisanos: 'paisanos' };
      e.req = function (s) { return SW.guerraActiva(s) && (!r0 || r0(s)); };
      e.repetible = e.repetible !== false;
      SW.EVENTOS.push(e);
    });
  }

  G([
    { id: 'gv_leva', min: 16, max: 45, w: 12,
      t: 'Te llega la carta de reclutamiento. No es una invitación.',
      c: [{ t: 'Presentarte', menuAlistar: true },
          { t: 'Pagar la exención', coste: 30000, fx: { reputacion: -10, cordura: 4 } },
          { t: 'Falsificar un parte médico', fx: { intelecto: 8, alineamiento: -6 }, buscado: 10 },
          { t: 'Desaparecer', mover: 'cerca', motivo: 'huyendo de la leva', fx: { cordura: -6, notoriedad: 8 }, buscado: 18 }] },
    { id: 'gv_refugiados', min: 10, max: 95, w: 12,
      t: 'Una familia entera de refugiados duerme en tu portal.',
      c: [{ t: 'Meterles en casa', fx: { alineamiento: 18, cordura: 6, creditos: -3000 } },
          { t: 'Darles comida y nada más', fx: { alineamiento: 8 } },
          { t: 'Llamar a las autoridades', fx: { alineamiento: -14, cordura: -6 } },
          { t: 'Cobrarles por el sitio', fx: { creditos: 4000, alineamiento: -18 } }] },
    { id: 'gv_racion', min: 8, max: 95, w: 11,
      t: 'La cartilla de racionamiento no da para el mes.',
      c: [{ t: 'Apretarse el cinturón', fx: { salud: -8, fisico: -4, cordura: -4 } },
          { t: 'Comprar en el mercado negro', coste: 6000, fx: { salud: 6 } },
          { t: 'Robar de un almacén militar', fx: { destreza: 8, salud: 6 }, buscado: 22 },
          { t: 'Montar tu propio estraperlo', fx: { creditos: 14000, alineamiento: -12, notoriedad: 8 }, buscado: 14 }] },
    { id: 'gv_bombardeo', min: 6, max: 95, w: 10,
      req: function (s) { return SW.frenteAqui(s); },
      t: 'Suenan las sirenas. Tienes noventa segundos.',
      c: [{ t: 'Al refugio, corriendo', fx: { cordura: -8, destreza: 4 } },
          { t: 'Ir a por los que no pueden correr', fx: { alineamiento: 20, reputacion: 12, salud: -18, cordura: -10 } },
          { t: 'Salir del planeta como sea', mover: 'cerca', motivo: 'con lo puesto', fx: { creditos: -8000, cordura: -6 } },
          { t: 'Quedarte en casa y esperar', fx: { salud: -22, cordura: -12 } }] },
    { id: 'gv_desertor', min: 16, max: 70, w: 9,
      t: 'Un desertor de {faccion} te pide que le escondas una noche.',
      c: [{ t: 'Esconderle', fx: { alineamiento: 10, cordura: -4 }, buscado: 16 },
          { t: 'Entregarle', fx: { creditos: 9000, alineamiento: -16, reputacion: 6 } },
          { t: 'Darle ropa y decirle que se vaya', fx: { alineamiento: 4 } },
          { t: 'Cobrarle por el silencio', fx: { creditos: 5000, alineamiento: -10 } }] },
    { id: 'gv_industria', min: 20, max: 90, w: 10,
      t: 'Todo el mundo se está forrando con la guerra menos tú.',
      c: [{ t: 'Fabricar piezas para el ejército', fx: { creditos: 34000, alineamiento: -6, intelecto: 6 } },
          { t: 'Vender a los dos bandos', fx: { creditos: 62000, alineamiento: -22, notoriedad: 14 }, buscado: 18 },
          { t: 'Poner una cocina para los que vuelven', fx: { alineamiento: 20, reputacion: 18, creditos: -9000 } },
          { t: 'No tocar nada de esto', fx: { cordura: 8, alineamiento: 8 } }] },
    { id: 'gv_hospital', min: 14, max: 90, w: 10,
      t: 'El hospital de {mundoAqui} pide voluntarios. Llegan más heridos que camas.',
      c: [{ t: 'Ir a ayudar', fx: { alineamiento: 16, intelecto: 6, cordura: -8, reputacion: 8 } },
          { t: 'Donar dinero', coste: 8000, fx: { alineamiento: 10, reputacion: 6 } },
          { t: 'Ir solo a que te vean ir', fx: { reputacion: 10, alineamiento: -8 } },
          { t: 'No es tu guerra', fx: {} }] },
    { id: 'gv_propaganda', min: 12, max: 90, w: 9,
      t: 'Quieren tu cara en un cartel de reclutamiento.',
      c: [{ t: 'Prestarla', fx: { reputacion: 16, carisma: 8, alineamiento: -6 } },
          { t: 'Cobrar por ella', fx: { creditos: 22000, reputacion: 8, alineamiento: -10 } },
          { t: 'Negarte en público', fx: { alineamiento: 12, notoriedad: 12, reputacion: -8 } },
          { t: 'Aceptar y sabotear el mensaje', fx: { intelecto: 12, notoriedad: 14, alineamiento: 6 }, buscado: 14 }] },
    { id: 'gv_prisioneros', min: 18, max: 80, w: 9,
      t: 'Pasa un convoy de prisioneros de guerra por delante de ti.',
      c: [{ t: 'Darles agua', fx: { alineamiento: 14, reputacion: 4 } },
          { t: 'Escupirles como todos', fx: { alineamiento: -12, cordura: -4 } },
          { t: 'Liberar a uno en el descuido', fx: { alineamiento: 16, destreza: 8 }, buscado: 24 },
          { t: 'Mirar y seguir andando', fx: { cordura: -5 } }] },
    { id: 'gv_carta', min: 16, max: 95, w: 9,
      t: 'Llega una carta oficial: alguien que conoces no vuelve.',
      c: [{ t: 'Ir al funeral', fx: { cordura: -10, alineamiento: 6 } },
          { t: 'Alistarte por él', menuAlistar: true },
          { t: 'Beber hasta no acordarte', fx: { cordura: -6, salud: -10 } },
          { t: 'Buscar a quien firmó la orden', fx: { notoriedad: 10, cordura: -6, intelecto: 6 } }] },
    { id: 'gv_espia', min: 18, max: 80, w: 8,
      t: 'Te ofrecen pasar información de {mundoAqui} a {faccion}.',
      c: [{ t: 'Aceptar', fx: { creditos: 26000, intelecto: 8 }, buscado: 26, flag: 'espia' },
          { t: 'Aceptar y pasar mentiras', fx: { intelecto: 16, carisma: 10 }, buscado: 14 },
          { t: 'Denunciarlo', fx: { reputacion: 12, alineamiento: 8 } },
          { t: 'Decir que no y olvidarlo', fx: {} }] },
    { id: 'gv_frente_cerca', min: 14, max: 90, w: 10,
      req: function (s) { return !SW.frenteAqui(s); },
      t: 'El frente está a dos saltos. Medio {mundoAqui} está haciendo las maletas.',
      c: [{ t: 'Marcharte ya', mover: 'cerca', motivo: 'antes de que llegue', fx: { creditos: -6000 } },
          { t: 'Quedarte y organizar la defensa', fx: { reputacion: 16, fisico: 8, cordura: -8 } },
          { t: 'Comprar barato lo que otros malvenden', fx: { creditos: 28000, alineamiento: -16 } },
          { t: 'Ir hacia el frente a buscar a alguien', fx: { cordura: -10, salud: -12, alineamiento: 12 } }] }
  ]);


  /* Alistarse debe poder hacerse cuando quieras, no solo el día que
     estalla: el guion de antes era una única ventana y se perdía. */
  SW.GUION = SW.GUION || [];
  SW.GUION.push({
    id: 'gv_estalla', min: 6, max: 200, prio: 88, unaVez: true,
    req: function (s) { return SW.guerraActiva(s) && s.guerra.año <= 1; },
    t: 'Aquí se nota en tres días: cierran el puerto, suben los precios y empiezan a pedir voluntarios.',
    c: [{ t: 'Alistarte', req: function (s) { return s.edadBio >= 16; }, menuAlistar: true },
        { t: 'Buscar la forma de ganar dinero con esto', req: function (s) { return s.edadBio >= 14; },
          fx: { creditos: 18000, alineamiento: -12, intelecto: 6 }, out: 'Siempre hay quien gana con una guerra.' },
        { t: 'Marcharte a un sitio tranquilo', mover: 'cerca',
          motivo: 'huyendo de la guerra', fx: { cordura: -6 } },
        { t: 'Seguir con tu vida y aguantar lo que venga', fx: { cordura: -8, fisico: 4 } }]
  });
  SW.GUION.push({
    id: 'gv_llamada', min: 16, max: 60, prio: 70, unaVez: true,
    req: function (s) { return SW.guerraActiva(s) && !s.flags.en_el_frente && !s.flags.veterano && s.guerra.año >= 1; },
    t: 'Un antiguo conocido ha vuelto del frente con una pierna menos y una pregunta: ¿tú qué estás haciendo?',
    c: [{ t: 'Alistarte', menuAlistar: true },
        { t: 'Ayudar desde aquí', fx: { alineamiento: 10, reputacion: 8 } },
        { t: 'Decirle que la guerra es de otros', fx: { cordura: 4, reputacion: -6 } },
        { t: 'Pagarle la prótesis', coste: 18000, fx: { alineamiento: 16, reputacion: 10 } }]
  });

})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   HOLOVIDA :: UN CLON ESTÁ EN FILAS, Y ESO LO ES TODO

   Había contenido de clon —el tubo, los hermanos de lote, el
   simulador, la asignación, la Orden 66— y casi nada se disparaba.
   El motivo era el mismo en todos los sitios: estaba condicionado a
   `era === 'guerras_clon'`, y un clon NUNCA está en esa era de crío.
   Nace en el 32 ABY y la guerra empieza en el 22: sus años de cadete
   caen enteros en la República Tardía. Resultado: la asignación no
   llegaba (te quedabas sin oficio), y como no había oficio ni bando,
   el juego te trataba como a un civil cualquiera. Podías coger otro
   trabajo, comprar una nave, viajar a donde quisieras y meterte en el
   Gremio de Cazarrecompensas siendo propiedad del Gran Ejército.

   Aquí se arregla de raíz: lo que manda no es la época, es si sigues
   en filas. Y estar en filas significa exactamente lo que parece.

     · Naces soldado. No hay que buscar trabajo, ni se puede tener otro.
     · Te asignan un destino; puedes pedir, no elegir.
     · No viajas: te despliegan. Salir por tu cuenta es desertar.
     · Desertar te pone precio y te manda al ejército detrás.
     · Y un clon defectuoso NO es un clon con otras estadísticas.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GEN = SW.GEN || {};
  SW.GUION = SW.GUION || [];
  SW.ESCENAS = SW.ESCENAS || {};

  SW.esClon = function (s) { return s.especie === 'clon' || s.especie === 'clon_nulo'; };
  SW.esClonNulo = function (s) { return s.especie === 'clon_nulo'; };

  /* Las épocas en las que un clon sigue siendo propiedad de alguien.
     Después de la reforma imperial de reclutamiento ya no eres nadie:
     eres un veterano al que le sobran años y le faltan. */
  const ERAS_EN_FILAS = ['republica_tardia', 'guerras_clon', 'imperio_temprano'];

  /** ¿Sigue este clon dentro del ejército? La pregunta que manda. */
  SW.clonEnServicio = function (s) {
    if (!SW.esClon(s)) return false;
    if (s.flags.desertor || s.flags.expulsado_ejercito || s.flags.licenciado) return false;
    return ERAS_EN_FILAS.indexOf(s.era) >= 0;
  };

  /** Todavía en Kamino, sin desplegar: ni siquiera has salido del tubo. */
  SW.clonCadete = function (s) {
    return SW.clonEnServicio(s) && !s.destinoClon;
  };

  /* ------------------------------------------------------------
     DESTINOS
     No se elige: se pide. Te dan lo que dice tu expediente.
     ------------------------------------------------------------ */
  SW.DESTINOS_CLON = {
    infanteria: { n: 'Infantería de línea', ic: '⛨', carrera: 'clon_soldado',
      d: 'La fila. Donde va todo el mundo y de donde salen todas las bajas.',
      stat: 'fisico', umbral: 0 },
    piloto: { n: 'Piloto', ic: '⤢', carrera: 'clon_piloto', hab: 'piloto',
      d: 'Cañonera, ARC-170 o bombardero. Todos duelen.',
      stat: 'destreza', umbral: 48 },
    medico: { n: 'Médico de campaña', ic: '✚', carrera: 'clon_medico', hab: 'medico',
      d: 'Los sacas de la cañonera y los devuelves enteros.',
      stat: 'intelecto', umbral: 44 },
    arc: { n: 'Comando ARC', ic: '✦', carrera: 'clon_arc',
      d: 'Iniciativa permitida. De cada lote pasan dos.',
      stat: 'destreza', umbral: 62 }
  };

  SW.nombreDestino = function (s) {
    const D = SW.DESTINOS_CLON[s.destinoClon];
    return D ? D.n : 'sin destino';
  };

  /** Fijar destino: cambia el oficio, el bando y lo que sabes hacer. */
  SW.asignarDestino = function (g, id) {
    const s = g.s, D = SW.DESTINOS_CLON[id];
    if (!D) return;
    s.destinoClon = id;
    s.trabajo = D.carrera;
    const c = SW.carrera(D.carrera);
    s.rango = c ? c.rangos[0] : 'soldado';
    s.sueldo = 0;
    s.añosEnTrabajo = 0;
    s.rendimiento = 50;
    s.bando = s.bando || 'gar';
    if (D.hab && s.habilidades.indexOf(D.hab) < 0) s.habilidades.push(D.hab);
    g.log('Destino asignado: <b>' + D.n + '</b>. Ya no eres un número de lote, eres un puesto.', 'bien');
    g.hito('Destinado a ' + D.n);
  };

  /* ------------------------------------------------------------
     LA ASIGNACIÓN
     Sin `era`, con `req`: es lo que rompía todo lo anterior.
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'cls_asignacion', min: 13, max: 200, prio: 94, unaVez: true, gen: true, c: [],
    req: function (s) { return SW.clonCadete(s); },
    hazlo: function (g) {
      const s = g.s;
      const c = [];
      const pct = function (x) { return Math.round(U.clamp(x, 0, 1) * 100) + '%'; };
      Object.keys(SW.DESTINOS_CLON).forEach(function (id) {
        const D = SW.DESTINOS_CLON[id];
        if (id === 'infanteria') return;
        const p = U.clamp(0.15 + (s.stats[D.stat] - D.umbral) / 90, 0.05, 0.92);
        c.push({ t: 'Pedir ' + D.n.toLowerCase(), sub: D.d + ' · te lo dan un ' + pct(p),
          pedirDestino: { id: id, p: p } });
      });
      c.push({ t: 'No pedir nada y aceptar lo que digan',
        sub: 'Es lo que se espera de ti, y no falla nunca.',
        pedirDestino: { id: 'infanteria', p: 1 } });
      return {
        id: 'cls_asignacion', gen: true,
        t: '<span class="scene-tag">FIN DE INSTRUCCIÓN · CIUDAD TIPOCA</span>' +
          '<p>Un kaminoano lee tu expediente entero sin mirarte una sola vez y anota una palabra al final. ' +
          'Esa palabra es el resto de tu vida.</p>' +
          '<p>Puedes pedir. Pedir no es elegir: pedir es que conste.</p>' +
          (SW.esClonNulo(s)
            ? '<p class="dim">En tu expediente hay una marca roja desde el primer año. Lo sabes tú y lo sabe él.</p>'
            : ''),
        c: c
      };
    }
  });

  /* ------------------------------------------------------------
     UN CLON NO VIAJA: LE DESPLIEGAN
     ------------------------------------------------------------ */
  SW.GEN.clonNoViaja = function (rng, s) {
    const c = [];
    c.push({ t: 'Volver al barracón', volver: true,
      sub: 'Donde tienes que estar.' });
    c.push({ t: 'Pedir traslado por el conducto reglamentario',
      sub: 'Depende de tu hoja de servicio. Tarda, y a lo mejor sale.',
      pedirTraslado: true });
    c.push({ t: 'Desertar', sub: 'Quitarte la armadura y desaparecer. No hay vuelta.',
      abrirDesercion: true, tono: 'mal' });
    return {
      id: 'cls_no_viaja', gen: true, esMenu: true,
      t: '<span class="scene-tag">NO TIENES PERMISO DE MOVIMIENTO</span>' +
        '<p>Eres propiedad del Gran Ejército. No compras billetes, no eliges destino y no hay ningún ' +
        'puerto de ' + U.esc(s.mundo) + ' que te deje subir a una nave sin una orden firmada.</p>' +
        '<p class="dim">Los clones no viajan. A los clones se les despliega.</p>',
      c: c
    };
  };

  SW.GEN.desercion = function (rng, s) {
    const dest = SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(rng, s.mundo, s.era) : 'Nar Shaddaa';
    const sigilo = U.clamp(0.20 + s.stats.destreza / 220 + s.stats.intelecto / 320 +
      (s.flags.finge_obediencia ? 0.12 : 0), 0.15, 0.82);
    return {
      id: 'cls_desercion', gen: true,
      t: '<span class="scene-tag">DESERCIÓN</span>' +
        '<p>Hay una lanzadera de carga que sale de madrugada y un turno de guardia que se cambia tarde. ' +
        'Llevas semanas mirándolo sin admitir que lo estabas mirando.</p>' +
        '<p><b>Si sales, se acabó.</b> No hay paga, no hay médico, no hay hermanos, y tu cara es la misma ' +
        'que la de dos millones de soldados a los que sí están buscando.</p>',
      c: [
        { t: 'Irte esta noche, en la lanzadera',
          sub: 'Depende de tu destreza. ' + Math.round(sigilo * 100) + '% de salir limpio.',
          r: [
            { p: sigilo, t: 'Nadie te para. A las cuatro horas estás fuera del sistema y no eres nadie.',
              desertar: 'limpio', mueveA: dest, motivo: 'desertando' },
            { p: 1 - sigilo, t: 'Te ven salir. No te disparan: anotan tu designación, que es peor.',
              desertar: 'visto', mueveA: dest, motivo: 'desertando, y con la designación anotada' }
          ] },
        { t: 'Hacerte pasar por muerto en el próximo despliegue',
          sub: 'Más lento y mucho más limpio. Necesitas cabeza.',
          req: function (st) { return st.stats.intelecto >= 50; },
          r: [
            { p: U.clamp(0.25 + s.stats.intelecto / 190, 0.2, 0.85),
              t: 'Dejas la armadura con tu designación junto a un cráter y te vas andando. Para el registro, caíste.',
              desertar: 'muerto', mueveA: dest, motivo: 'oficialmente muerto' },
            { p: 0.5, t: 'El recuento sale mal y alguien pregunta por ti.',
              desertar: 'visto', mueveA: dest, motivo: 'con una investigación abierta' }
          ] },
        { t: 'Llevarte a un hermano contigo',
          sub: 'Más difícil. Pero no te vas solo.',
          req: function (st) { return (st.relaciones || []).some(function (r) { return r.tipo === 'hermano de lote'; }); },
          r: [
            { p: U.clamp(sigilo - 0.18, 0.1, 0.7),
              t: 'Salís los dos. Tarda años en dejar de mirar hacia atrás, y tú también.',
              desertar: 'limpio', llevaHermano: true, fx: { cordura: 14 },
              mueveA: dest, motivo: 'desertando, y no solo' },
            { p: 0.6, t: 'Él se queda a cubrirte y le cae encima todo.',
              desertar: 'visto', fx: { cordura: -22, alineamiento: -8 }, matarRel: 'hermano de lote',
              mueveA: dest, motivo: 'desertando, y con una deuda' }
          ] },
        { t: 'Esta noche no', volver: true }
      ]
    };
  };

  /** Lo que pasa cuando cruzas la línea. */
  SW.hacerDesertor = function (g, modo) {
    const s = g.s;
    s.flags.desertor = true;
    s.destinoClon = null;
    s.trabajo = null; s.rango = null; s.sueldo = 0;
    s.bando = null;
    s.flags.licenciado = false;
    if (modo === 'muerto') {
      s.flags.dado_por_muerto = true;
      g.log('Para el Gran Ejército, tu designación figura como baja en combate. Eso vale más que un pasaporte.', 'bien');
    } else if (modo === 'visto') {
      s.buscado = Math.min(100, (s.buscado || 0) + 45);
      s.flags.buscado_desertor = true;
      g.log('Tu designación está en una lista de deserción. La lista circula.', 'mal');
    } else {
      s.buscado = Math.min(100, (s.buscado || 0) + 18);
      s.flags.buscado_desertor = true;
      g.log('Nadie te ha visto salir, pero en el recuento faltas tú.', 'res');
    }
    g.hito('Deserta del Gran Ejército');
    g.aplicarFx({ cordura: -10, notoriedad: 10 }, {});
  };

  /* ------------------------------------------------------------
     Y EL EJÉRCITO VA DETRÁS
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'cls_caceria', min: 12, max: 200, prio: 72, repetible: true, gen: true, c: [],
    req: function (s) {
      return SW.esClon(s) && s.flags.buscado_desertor && !s.flags.dado_por_muerto &&
             ['republica_tardia', 'guerras_clon', 'imperio_temprano', 'rebelion'].indexOf(s.era) >= 0;
    },
    hazlo: function (g) {
      const s = g.s;
      if (!g.rng.chance(U.clamp(0.16 + (s.buscado || 0) / 320, 0.12, 0.5))) return null;
      const dest = SW.mundoAleatorioNormal ? SW.mundoAleatorioNormal(g.rng, s.mundo, s.era) : 'Nar Shaddaa';
      return {
        id: 'cls_caceria', gen: true,
        t: '<span class="scene-tag">TE ESTÁN BUSCANDO</span>' +
          '<p>Un equipo de recuperación con tu misma cara pregunta por ' + U.esc(s.mundo) + '. ' +
          'Llevan tu designación impresa y una orden que no necesita juez.</p>' +
          '<p class="dim">Buscado: ' + (s.buscado || 0) + '/100.</p>',
        c: [
          { t: 'Irte del planeta esta misma noche',
            fx: { creditos: -6000, cordura: -6 }, mueveA: dest, motivo: 'con un equipo de recuperación detrás',
            out: 'Coges lo que cabe en una bolsa. Otra vez.' },
          { t: 'Esconderte y no salir en meses',
            fx: { cordura: -14, salud: -6 }, buscadoMenos: 12,
            out: 'Cuatro paredes y ningún ruido. Funciona, y te cuesta.' },
          { t: 'Cambiarte la cara', sub: 'Caro. Definitivo.',
            coste: 30000, fx: { cordura: 8 }, quitarFlag: 'buscado_desertor', buscadoMenos: 45,
            out: 'Un cirujano de callejón te deja una cara que no es la de nadie. Duele meses. Ya no eres reconocible.' },
          { t: 'Esperarles', sub: 'Son tus hermanos. Eso puede jugar de las dos maneras.',
            r: [
              { p: U.clamp(0.24 + s.stats.carisma / 200, 0.2, 0.7),
                t: 'Habláis media hora en un almacén. Informan de que el rastro era falso y se van.',
                fx: { cordura: 16, carisma: 8 }, buscadoMenos: 25 },
              { p: 0.55, t: 'Cumplen la orden. Tienen el mismo entrenamiento que tú y son cuatro.',
                combate: { dif: 68 } }
            ] }
        ]
      };
    }
  });

  /* ------------------------------------------------------------
     EL AÑO DE UN CLON EN FILAS
     La queja era «avanzo y no pasa mucha cosa». Pasaba poco porque
     el clon no tenía ni oficio ni bando, así que ni las misiones de
     guerra ni la vida de cuartel le tocaban nunca.
     ------------------------------------------------------------ */
  const RUTINA = [
    { t: 'Rotación de guarnición en {p}. Tres meses vigilando una pista de aterrizaje.',
      c: [
        { t: 'Aprovechar para entrenar', fx: { fisico: 6, destreza: 5 }, out: 'Sales de ahí más fuerte y más aburrido.' },
        { t: 'Estudiar los partes de la campaña', fx: { intelecto: 8 }, out: 'Empiezas a entender la guerra como un mapa, no como un pasillo.' },
        { t: 'Pasar el rato con los tuyos', fx: { cordura: 10, carisma: 4 }, relTodas: 12, out: 'Cartas, apuestas y una lata de algo. Tres meses buenos.' }
      ] },
    { t: 'Ejercicio de fuego real. El instructor dice que hay bajas cada dos años y que este es el segundo.',
      c: [
        { t: 'Ir a por el récord del batallón', fx: { destreza: 10, reputacion: 8, salud: -5 }, out: 'Lo bates por dos segundos. Alguien apunta tu designación en otra lista.' },
        { t: 'Quedarte en la media a propósito', fx: { intelecto: 5, cordura: 4 }, out: 'Al que destaca lo mandan a lo difícil. Tú no destacas.' },
        { t: 'Cubrir al que va peor de tu sección', fx: { carisma: 10, cordura: 8, reputacion: 4 }, relTodas: 15, out: 'Pasáis todos. Se acuerdan.' }
      ] },
    { t: 'Un oficial nuevo, no clon, se ha hecho cargo de la sección. Lleva tres semanas dando órdenes malas.',
      c: [
        { t: 'Obedecer y callar', fx: { cordura: -8, reputacion: 6 }, out: 'La orden mala se cumple. Hay dos heridos. Nadie dice nada.' },
        { t: 'Corregirle en privado', fx: { carisma: 8, intelecto: 6 }, out: 'Lo acepta a regañadientes. A la siguiente te pregunta antes.' },
        { t: 'Corregirle delante de la sección', fx: { reputacion: -10, cordura: 6 }, relTodas: 18, contador: { faltas: 1 }, out: 'Tienes razón y te cuesta un parte. Tus hermanos no lo olvidan.' }
      ] },
    { t: 'Reparto de armadura nueva. Puedes pintarla, y aquí eso es lo único que es tuyo.',
      c: [
        { t: 'Pintarla con las marcas de tu unidad', fx: { cordura: 8, reputacion: 4 }, out: 'Idénticos otra vez, pero idénticos a los tuyos y no a los demás.' },
        { t: 'Pintarla como te dé la gana', fx: { cordura: 12, carisma: 6, reputacion: -4 }, out: 'El sargento tuerce el gesto y no dice nada. Es lo más parecido a un permiso.' },
        { t: 'Dejarla blanca', fx: { intelecto: 4 }, out: 'Blanca se ve peor en la nieve y mejor en un informe.' }
      ] },
    { t: 'Baja en la sección. Uno de tu lote no ha vuelto de {p} y hay que recoger sus cosas.',
      c: [
        { t: 'Guardar algo suyo', fx: { cordura: -6, alineamiento: 6 }, out: 'Un trozo de placa pintada. Lo llevas encima el resto de tu vida.' },
        { t: 'Pedir que conste su nombre y no su número', fx: { cordura: -4, carisma: 8, reputacion: 6 }, out: 'Se lo niegan por escrito. Tú lo dices en voz alta igual.' },
        { t: 'No pensarlo', fx: { cordura: -12, destreza: 5 }, out: 'Funciona durante un tiempo. Todo funciona durante un tiempo.' }
      ] }
  ];

  SW.GEN.rutinaClon = function (rng, s) {
    const r = rng.pick(RUTINA);
    return {
      id: 'cls_rutina', gen: true,
      t: '<span class="scene-tag">' + (SW.nombreDestino(s) || 'EN FILAS').toUpperCase() + '</span>' +
         '<p>' + r.t.replace('{p}', U.esc(s.mundo)) + '</p>',
      c: r.c
    };
  };

  /** Paso anual: si estás en filas, el ejército te da algo que hacer. */
  SW.pasoClon = function (g) {
    const s = g.s, rng = g.rng;
    if (!SW.esClon(s) || s.muerto) return;
    /* Hay escenas antiguas que te sacan del ejército poniendo el flag a
       mano. Si has salido por cualquier puerta, el puesto se cierra. */
    if (!SW.clonEnServicio(s)) {
      if (s.destinoClon) {
        s.destinoClon = null;
        if (s.trabajo && /^clon_/.test(s.trabajo)) { s.trabajo = null; s.rango = null; s.sueldo = 0; }
        s.bando = null;
      }
      return;
    }
    if (!s.destinoClon) return;                 // todavía cadete: manda la asignación
    if (s.flags['clon_año_' + s.edad]) return;
    s.flags['clon_año_' + s.edad] = true;

    /* Te despliegan: no eliges tú a dónde vas, y eso también es
       contenido. Antes un clon se quedaba en Kamino toda la vida. */
    if (SW.FRENTES_CLON && rng.chance(0.45)) {
      const destino = rng.pick(SW.FRENTES_CLON.filter(function (m) {
        return m !== s.mundo && SW.mundo(m) && (!SW.mundoViable || SW.mundoViable(m, s.era));
      }));
      if (destino) {
        g.log('<b>Orden de despliegue:</b> ' + destino + '. No se pregunta, se embarca.', 'res');
        g.mover(destino, 'desplegado');
      }
    }
    // y una escena de la vida en filas la mayoría de los años
    if (rng.chance(0.55)) g.cola.push(g.prepararGen(SW.GEN.rutinaClon(rng, s)));
  };

  SW.FRENTES_CLON = ['Christophsis', 'Geonosis', 'Ryloth', 'Umbara', 'Felucia', 'Saleucami',
    'Kashyyyk', 'Mygeeto', 'Utapau', 'Onderon', 'Coruscant', 'Anaxes', 'Lola Sayu'];

  /* Lo único parecido a elegir a dónde vas: pedirlo por escrito. */
  SW.pedirTrasladoClon = function (g) {
    const s = g.s, rng = g.rng;
    if (s.flags['traslado_' + s.edad]) {
      g.log('Ya has cursado una solicitud este año. Una es una.', 'res');
      return;
    }
    s.flags['traslado_' + s.edad] = true;
    const p = U.clamp(0.10 + s.stats.reputacion / 260 + ((s.campaña && s.campaña.medallas) || 0) * 0.05 -
      SW.vigilanciaClon(s) / 400, 0.05, 0.55);
    if (!rng.chance(p)) {
      g.log('Solicitud de traslado cursada. Respuesta: <i>denegada, necesidades del servicio</i>. ' +
            'Ni una línea más.', 'mal');
      g.aplicarFx({ cordura: -4 }, {});
      return;
    }
    const libres = Object.keys(SW.DESTINOS_CLON).filter(function (id) { return id !== s.destinoClon; });
    const nuevo = rng.pick(libres);
    g.log('Solicitud aprobada. No a lo que pediste, pero aprobada.', 'bien');
    SW.asignarDestino(g, nuevo);
    g.aplicarFx({ cordura: 6 }, {});
  };

  /* ------------------------------------------------------------
     LA PESTAÑA DEL ESCUADRÓN, PARA UN CLON
     «Semana tranquila en la unidad» con dos botones era todo lo que
     había. Ahora es el sitio donde se hace la vida militar.
     ------------------------------------------------------------ */
  SW.menuEscuadronClon = function (g) {
    const s = g.s;
    const c = [];
    const D = SW.DESTINOS_CLON[s.destinoClon];

    c.push({ t: '⛬ Entrenar duro', sub: 'Lo que más se usa en tu destino.',
      fx: D && D.stat === 'intelecto' ? { intelecto: 7, cordura: -3 }
        : D && D.stat === 'destreza' ? { destreza: 7, fisico: 3, salud: -3 }
        : { fisico: 7, destreza: 3, salud: -3 },
      out: 'Cuatro horas de más, todos los días de la semana.' });

    if (SW.GEN.misionGuerra && (s.guerra || s.era === 'guerras_clon' || s.era === 'imperio_temprano')) {
      c.push({ t: '✦ Presentarte voluntario para la próxima operación',
        sub: 'Se sale de la rutina. También se vuelve peor.', generar: 'misionGuerra' });
    }
    c.push({ t: '☰ Estar con tus hermanos', fx: { cordura: 10, carisma: 5 }, relTodas: 14,
      out: 'No hace falta hablar mucho. Es de las pocas cosas que no hay que explicarle a nadie.' });
    c.push({ t: '⚙ Mantenimiento de equipo', fx: { intelecto: 5, destreza: 3 },
      out: 'Todo limpio, todo revisado, todo tuyo hasta que te lo cambien.' });
    c.push({ t: '⇄ Pedir traslado de destino',
      sub: 'Va por conducto reglamentario y casi nunca sale.', pedirTraslado: true });

    if (SW.esClonNulo(s)) {
      c.push({ t: '◍ Leer lo que no deberías leer',
        sub: 'Tu problema es que piensas. Aprovéchalo.',
        fx: { intelecto: 10, cordura: -6 }, flag: 'clon_curioso',
        out: 'Partes de bajas, cifras de producción y una nota sobre «unidades no conformes». Tú eres una.' });
    }
    c.push({ t: '◂ Volver al barracón', volver: true });

    return {
      id: 'cls_escuadron', gen: true, esMenu: true,
      t: '<span class="scene-tag">TU UNIDAD</span>' +
        '<p>' + (D ? D.ic + ' <b>' + D.n + '</b>. ' + D.d : 'Todavía sin destino asignado.') + '</p>' +
        '<p class="dim">' + U.esc(s.mundo) + ' · ' +
        ((s.relaciones || []).filter(function (r) { return r.tipo === 'hermano de lote'; }).length) +
        ' hermanos de lote vivos · ' + ((s.campaña && s.campaña.medallas) || 0) + ' condecoraciones</p>',
      c: c
    };
  };

  /* ------------------------------------------------------------
     EL CLON DEFECTUOSO ES OTRA COSA
     Tenía otras estadísticas y ya está. Lo que le define no es que
     sea más listo: es que el chip inhibidor no le funciona bien, que
     en Kamino lo saben, y que a las unidades no conformes se las
     retira. Vives con eso encima toda la vida.
     ------------------------------------------------------------ */
  SW.prepararClonNulo = function (s, rng) {
    s.nombre = 'CT-' + rng.int(1000, 9999) + '-N';
    s.designacion = s.nombre;
    s.flags.chip_inhibidor = false;      // el suyo no prendió bien
    s.flags.chip_defectuoso = true;
    s.flags.marcado_defectuoso = true;
    s.flags.expediente_rojo = true;
  };

  /** Cuánto te vigilan. Sube sola y se nota en todo. */
  SW.vigilanciaClon = function (s) {
    if (!SW.esClonNulo(s) && !s.flags.marcado_defectuoso) return 0;
    return U.clamp((s.vigilancia || 0), 0, 100);
  };

  SW.GUION.push({
    id: 'cls_expediente', min: 14, max: 200, prio: 73, repetible: true, gen: true, c: [],
    req: function (s) {
      return SW.clonEnServicio(s) && (SW.esClonNulo(s) || s.flags.marcado_defectuoso) &&
             !s.flags['expediente_' + s.edad];
    },
    hazlo: function (g) {
      const s = g.s, rng = g.rng;
      s.vigilancia = U.clamp((s.vigilancia || 20) + rng.int(3, 11), 0, 100);
      if (!rng.chance(0.42)) return null;
      s.flags['expediente_' + s.edad] = true;
      const v = s.vigilancia;

      if (v >= 70) {
        return {
          id: 'cls_retirada', gen: true,
          t: '<span class="scene-tag">UNIDAD NO CONFORME</span>' +
            '<p>Dos médicos kaminoanos y un oficial te esperan al bajar de la lanzadera. Traen tu expediente ' +
            'entero impreso, que ya es raro, y la palabra <b>retirada</b> escrita en la última página.</p>' +
            '<p>No es un castigo. Para ellos es control de calidad.</p>',
          c: [
            { t: 'Entrar en la sala y dejar que te «corrijan»',
              fx: { intelecto: -14, cordura: -20, destreza: 6 }, quitarFlag: 'marcado_defectuoso',
              vigilancia: -60,
              out: 'Sales tres semanas después. Obedeces mejor y piensas menos. Los dos lo notáis.' },
            { t: 'Convencerles de que tu hoja de servicio vale más que la marca',
              sub: 'Depende de tu reputación y de tu cabeza.',
              r: [
                { p: U.clamp(0.18 + s.stats.reputacion / 200 + s.stats.intelecto / 300, 0.15, 0.8),
                  t: 'Les enseñas los números de tu sección. Cierran la carpeta y te devuelven al frente.',
                  fx: { intelecto: 8, reputacion: 10, cordura: 8 }, vigilancia: -35 },
                { p: 0.55, t: 'No discuten contigo: firman y llaman a los de la sala blanca.',
                  fx: { intelecto: -12, cordura: -18 }, vigilancia: -50 }
              ] },
            { t: 'Salir de allí ahora mismo', sub: 'Esto es desertar, y hoy.',
              abrirDesercion: true }
          ]
        };
      }

      return {
        id: 'cls_expediente', gen: true,
        t: '<span class="scene-tag">REVISIÓN DE EXPEDIENTE</span>' +
          '<p>Otra revisión más. Te miden, te preguntan cosas que ya te preguntaron el año pasado ' +
          'y anotan cuánto tardas en contestar.</p>' +
          '<p class="dim">Marca en tu expediente: ' + v + '/100. A los setenta se retira la unidad.</p>',
        c: [
          { t: 'Contestar exactamente lo que quieren oír',
            fx: { carisma: 6, cordura: -5 }, flag: 'finge_obediencia', vigilancia: -14,
            out: 'Te sale bordado. Eso también es un síntoma, pero ese no lo miden.' },
          { t: 'Contestar la verdad',
            fx: { cordura: 8, intelecto: 5 }, vigilancia: 10,
            out: 'Anotan mucho rato. Sales sabiendo que has empeorado tu situación y que lo volverías a hacer.' },
          { t: 'Ofrecerte para lo peor que haya, para que compense tenerte',
            fx: { reputacion: 12, salud: -12, destreza: 6 }, vigilancia: -20,
            out: 'Te apuntan a lo que nadie quiere. Vuelves. Eso, en tu expediente, vale más que ser normal.' },
          { t: 'No presentarte a la revisión',
            fx: { cordura: 4, reputacion: -10 }, vigilancia: 18, contador: { faltas: 1 },
            out: 'Consta como ausencia. Al lado de una marca roja, una ausencia pesa el doble.' }
        ]
      };
    }
  });

  /* Lo bueno de estar mal hecho: el chip no manda del todo sobre ti. */
  SW.GUION.push({
    id: 'cls_chip_falla', min: 16, max: 200, prio: 68, unaVez: true, gen: true, c: [],
    req: function (s) { return SW.clonEnServicio(s) && SW.esClonNulo(s) && !s.flags.o66_vivida; },
    hazlo: function (g) {
      const s = g.s;
      if (!g.rng.chance(0.35)) return null;
      return {
        id: 'cls_chip_falla', gen: true,
        t: '<span class="scene-tag">ALGO NO VA BIEN AHÍ DENTRO</span>' +
          '<p>Migrañas que llegan por la mañana y se van solas. Un zumbido cuando alguien da una orden ' +
          'en un tono concreto. Y la sensación, muy rara, de que hay una puerta cerrada dentro de tu cabeza ' +
          'a la que alguien llama de vez en cuando.</p>' +
          '<p>El médico de la unidad dice que es normal. No lo dice mirándote.</p>',
        c: [
          { t: 'Callártelo y vigilarlo tú', fx: { intelecto: 8, cordura: -6 }, flag: 'sospecha_chip',
            out: 'Apuntas cuándo pasa. Hay un patrón, y el patrón no es médico.' },
          { t: 'Buscar a alguien que sepa sacarlo', sub: 'Fuera del protocolo. Caro y peligroso.',
            coste: 18000, flag: 'chip_extraido', fx: { salud: -18, cordura: 14 },
            out: 'Un cirujano en un sótano de puerto te saca un implante del tamaño de una uña. Lo miras un rato largo.' },
          { t: 'Informar como manda el reglamento',
            fx: { reputacion: 8, cordura: -10 }, vigilancia: 25,
            out: 'Lo anotan. A partir de ahora te revisan cada seis meses en vez de cada año.' },
          { t: 'Decírselo a tu hermano de lote',
            req: function (st) { return (st.relaciones || []).some(function (r) { return r.tipo === 'hermano de lote'; }); },
            fx: { cordura: 10, carisma: 6 }, flag: 'sospecha_chip',
            out: 'Se queda callado mucho rato. Luego dice: «a mí también». Y eso lo cambia todo.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

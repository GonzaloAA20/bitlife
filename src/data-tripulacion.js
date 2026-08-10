/* ============================================================
   HOLOVIDA :: TRIPULACIÓN
   Tenías nave, bodega y rutas, y volabas solo. La «tripulación» era
   un evento suelto que te añadía un conocido y no hacía nada más.

   Ahora se contrata gente con oficio y lealtad, y cada uno muerde
   donde le toca: el piloto en las huidas, el mecánico en el casco,
   el artillero en el combate espacial y el tasador en lo que te
   pagan por la carga. Cobran todos los años. Y si les pagas mal o
   les haces cosas feas, se van — o algo peor.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.ACTIVIDADES = SW.ACTIVIDADES || [];
  SW.GUION = SW.GUION || [];

  const OFICIOS = {
    piloto:    { n: 'piloto', ic: '⤢', d: 'Vuela mejor que tú. Lo dice a menudo.',
                 efecto: 'huir de lo que te encuentres por el camino' },
    mecanico:  { n: 'mecánico', ic: '⚙', d: 'El casco aguanta lo que ella diga que aguanta.',
                 efecto: 'reparar el casco cada año y encajar mejor los impactos' },
    artillero: { n: 'artillero', ic: '⌖', d: 'Habla poco y apunta mucho.',
                 efecto: 'el combate espacial' },
    tasador:   { n: 'tasador', ic: '▣', d: 'Sabe lo que vale todo en cuatro sectores.',
                 efecto: 'lo que te pagan por la carga' }
  };
  SW.OFICIOS_TRIPULACION = OFICIOS;

  SW.tripulacion = function (s) { return s.tripulacion || []; };
  SW.tripulanteDe = function (s, of) {
    return (s.tripulacion || []).filter(function (t) { return t.of === of; })[0] || null;
  };

  /** Cuánto aporta alguien: su oficio por su lealtad. */
  SW.aporteTripulante = function (t) {
    if (!t) return 0;
    return U.clamp((t.pericia / 100) * (0.45 + U.clamp(t.lealtad, 0, 100) / 180), 0, 1);
  };
  SW.aporteDe = function (s, of) { return SW.aporteTripulante(SW.tripulanteDe(s, of)); };

  /* ------------------------------------------------------------
     La pestaña
     ------------------------------------------------------------ */
  SW.ACTIVIDADES.push({
    id: 'tripulacion', n: 'Tripulación', ico: '☷', min: 16,
    desc: 'Contratar gente para tu nave, pagarla y aguantarla.',
    req: function (s) { return !!s.nave; }
  });

  const generar = function (g, of) {
    const rng = g.rng;
    const pericia = rng.int(28, 88);
    return {
      of: of, n: SW.genNombreCompleto(rng, rng.pick(['humano', 'twilek', 'rodiano', 'duros', 'zabrak', 'togruta'])),
      pericia: pericia, lealtad: rng.int(30, 60),
      sueldo: Math.round(2500 + pericia * 240), años: 0
    };
  };

  SW.menuTripulacion = function (g) {
    const s = g.s;
    s.tripulacion = s.tripulacion || [];
    const c = [];
    const libres = Object.keys(OFICIOS).filter(function (o) { return !SW.tripulanteDe(s, o); });
    const plazas = Math.max(1, Math.min(4, Math.round((s.nave.carga || 3) / 2) + 1));

    (s.tripulacion || []).forEach(function (t, i) {
      const O = OFICIOS[t.of];
      c.push({ t: O.ic + ' Subirle el sueldo a ' + t.n + ' — ' + U.cr(Math.round(t.sueldo * 0.4)),
        sub: O.n + ' · pericia ' + t.pericia + ' · lealtad ' + Math.round(t.lealtad) +
             ' · lleva ' + t.años + ' años contigo',
        subirSueldo: i, coste: Math.round(t.sueldo * 0.4) });
      c.push({ t: '✕ Despedir a ' + t.n, sub: 'Se lo dices tú o se lo dice el silencio.',
        despedirTripulante: i });
    });

    if (s.tripulacion.length < plazas) {
      libres.slice(0, 3).forEach(function (o) {
        const cand = generar(g, o);
        const O = OFICIOS[o];
        c.push({ t: O.ic + ' Contratar a ' + cand.n + ' — ' + U.cr(cand.sueldo) + '/año',
          sub: O.n + ' · pericia ' + cand.pericia + ' · mejora ' + O.efecto,
          bloqueada: s.stats.creditos < cand.sueldo,
          contratarTripulante: cand });
      });
    } else {
      c.push({ t: '✕ No caben más', bloqueada: true, sub: 'Tu ' + s.nave.n + ' da para ' + plazas + '.' });
    }
    c.push({ t: '◂ Volver al hangar', volver: true });

    const nom = s.tripulacion.length
      ? s.tripulacion.map(function (t) { return t.n + ' (' + OFICIOS[t.of].n + ')'; }).join(', ')
      : 'nadie: vuelas solo';
    return {
      id: 'menu_tripulacion', gen: true, esMenu: true,
      t: '<span class="scene-tag">TRIPULACIÓN · ' + U.esc(s.nave.n.toUpperCase()) + '</span>' +
        '<p>A bordo: ' + U.esc(nom) + '.</p>' +
        '<p class="dim">' + s.tripulacion.length + ' de ' + plazas + ' plazas. ' +
        'Cobran todos los años, y quien cobra poco acaba escuchando otras ofertas.</p>',
      c: c
    };
  };

  /* ------------------------------------------------------------
     El año de la tripulación: cobran, mejoran y a veces se van
     ------------------------------------------------------------ */
  SW.pasoTripulacion = function (g) {
    const s = g.s, rng = g.rng;
    if (!s.tripulacion || !s.tripulacion.length) return;
    if (!s.nave) {
      g.log('Sin nave no hay tripulación: se despiden en el puerto.', 'mal');
      s.tripulacion = [];
      return;
    }
    let nomina = 0;
    const sefue = [];
    s.tripulacion.forEach(function (t) {
      t.años++;
      nomina += t.sueldo;
      if (t.pericia < 95 && rng.chance(0.35)) t.pericia = Math.min(95, t.pericia + rng.int(1, 3));
      t.lealtad += rng.int(-3, 5);
      if (t.of === 'mecanico') {
        const rep = Math.round(6 + SW.aporteTripulante(t) * 16);
        s.naveEstado = U.clamp((s.naveEstado || 60) + rep, 0, 100);
      }
      if (t.lealtad < 12 && rng.chance(0.45)) sefue.push(t);
    });
    if (nomina) {
      s.stats.creditos -= nomina;
      if (s.stats.creditos < -20000) {
        g.log('No llegas a la nómina de la tripulación. Se enteran enseguida.', 'mal');
        s.tripulacion.forEach(function (t) { t.lealtad -= 22; });
      } else if (rng.chance(0.35)) {
        g.log('Nóminas de la tripulación: ' + U.cr(nomina) + '.', 'cr');
      }
    }
    sefue.forEach(function (t) {
      s.tripulacion = s.tripulacion.filter(function (x) { return x !== t; });
      g.log(t.n + ' recoge sus cosas y se baja en el siguiente puerto. No hay discusión.', 'mal');
      g.aplicarFx({ cordura: -6 }, {});
    });
  };

  /* Cuando pasa algo bueno o malo a bordo, la lealtad se mueve. */
  SW.moverLealtad = function (g, d) {
    const s = g.s;
    if (!s.tripulacion || !s.tripulacion.length) return;
    s.tripulacion.forEach(function (t) { t.lealtad = U.clamp(t.lealtad + d, -20, 100); });
  };

  /* ------------------------------------------------------------
     Escenas de a bordo: la gente da problemas, que es lo bueno
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'tr_abordo', min: 16, max: 200, prio: 66, repetible: true, gen: true, c: [],
    req: function (s) {
      if (!s.nave || !s.tripulacion || !s.tripulacion.length) return false;
      return !s.flags['abordo_' + s.edad];
    },
    hazlo: function (g) {
      const s = g.s, rng = g.rng;
      if (!rng.chance(0.30)) return null;
      s.flags['abordo_' + s.edad] = true;
      const t = rng.pick(s.tripulacion);
      const O = SW.OFICIOS_TRIPULACION[t.of];
      const leal = t.lealtad > 55;

      if (!leal && rng.chance(0.45)) {
        return {
          id: 'tr_traicion', gen: true,
          t: '<span class="scene-tag">A BORDO</span>' +
            '<p><b>' + U.esc(t.n) + '</b>, tu ' + O.n + ', lleva semanas hablando por un canal que no es el de la nave.</p>' +
            '<p>Le has pagado ' + U.cr(t.sueldo) + ' al año durante ' + t.años + ' años y alguien le ha ofrecido más.</p>',
          c: [
            { t: 'Igualar la oferta', sub: 'Cuesta, y funciona.',
              coste: Math.round(t.sueldo * 1.5), lealtadA: { n: t.n, d: 30 },
              out: 'Se queda. Y a partir de ahora sabe exactamente cuánto vale.' },
            { t: 'Echarle ahora mismo', fx: { cordura: -6 }, echarA: t.n,
              out: 'Le dejas en el puerto con sus cosas. Se lleva lo que sabe de ti.' },
            { t: 'Hablarlo de verdad', sub: 'Depende de tu carisma.',
              r: [
                { p: U.clamp(0.25 + s.stats.carisma / 190, 0.2, 0.78),
                  t: 'Habláis cuatro horas en la bodega. Se queda por razones que no son dinero.',
                  fx: { carisma: 8, cordura: 6 }, lealtadA: { n: t.n, d: 40 } },
                { p: 0.55, t: 'No hay nada que hablar: ya había firmado.',
                  fx: { cordura: -10 }, echarA: t.n }
              ] },
            { t: 'Dejar que se vaya y no reemplazarle',
              fx: { cordura: -4, creditos: 0 }, echarA: t.n,
              out: 'Vuelves a volar solo. Se nota en todo.' }
          ]
        };
      }

      return {
        id: 'tr_abordo', gen: true,
        t: '<span class="scene-tag">A BORDO</span>' +
          '<p><b>' + U.esc(t.n) + '</b> (' + O.n + ') te pide cinco minutos en la cabina. ' +
          (leal ? 'No suele pedir nada, así que será algo.' : 'Trae la cara de quien ha ensayado la frase.') + '</p>' +
          '<p>' + U.esc(rng.pick([
            'Quiere desviar la ruta dos días para ver a alguien.',
            'Ha encontrado una pieza que arreglaría lo que lleváis un año arrastrando, y cuesta.',
            'Le han ofrecido un trabajo mejor y ha dicho que no. Quería que lo supieras.',
            'Cree que la última carga que subisteis no era lo que decía el manifiesto.'
          ])) + '</p>',
        c: [
          { t: 'Decir que sí sin pensarlo', fx: { cordura: 6, creditos: -6000 },
            lealtadA: { n: t.n, d: 22 }, out: 'No lo dice, pero no se le olvida.' },
          { t: 'Escuchar y decidir después', fx: { intelecto: 6 }, lealtadA: { n: t.n, d: 8 },
            out: 'Le das largas con educación. Es lo que esperaba.' },
          { t: 'Recordarle quién manda aquí', fx: { reputacion: 4 },
            lealtadA: { n: t.n, d: -25 }, out: 'Dice «sí, capitán» y se va. Eso no se arregla con un aumento.' },
          { t: 'Invitar a toda la tripulación a cenar en tierra',
            coste: 4000, fx: { cordura: 12, carisma: 6 }, lealtadTodos: 16,
            out: 'Cuatro horas en una taberna con suelo pegajoso. Vuelven siendo otra cosa.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

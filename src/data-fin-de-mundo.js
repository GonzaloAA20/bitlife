/* ============================================================
   HOLOVIDA :: EL DÍA QUE UN MUNDO DEJA DE ESTAR

   Había mundos caídos, pero mal medidos y sin consecuencia:

     · Se cortaban POR ÉPOCA, no por año. Alderaan dejaba de ser
       habitable al entrar en la Era de la Rebelión (2 ABY) aunque
       se destruye en el año 0: dos años en los que el planeta ya
       no te dejaba estar y todavía existía.
     · Faltaba Hosnian Prime, que se apaga entero en el 34 DBY.
     · Y sobre todo: si estabas allí el día que pasó, el juego te
       decía «aquí ya no se puede seguir» y te sacaba con un botón
       que nunca fallaba. De la destrucción de Alderaan se salía
       siempre, y gratis.

   Aquí van las fechas exactas y lo que pasa ese día. Hay dos clases
   de final: el que avisa —una campaña, un desmantelamiento, meses de
   evacuación— y el que no avisa, que es un disparo desde la órbita.
   Del segundo no se sale casi nadie, y quien no sale, muere allí.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GUION = SW.GUION || [];
  SW.GEN = SW.GEN || {};

  /* `y` es el año galáctico exacto. `aviso` son los años de margen que
     da: 0 = no da ninguno, te pilla dentro. */
  SW.FIN_DE_MUNDO = {
    'Alderaan': { y: 0, aviso: 0, arma: 'Estrella de la Muerte',
      t: 'Un destructor no, algo mucho más grande, se pone entre Alderaan y su sol.',
      q: 'Alderaan ya no está. Ni el planeta.' },
    'Jedha': { y: 0, aviso: 0, arma: 'Estrella de la Muerte',
      t: 'El cielo sobre la Ciudad Santa se pone verde y luego blanco. Empieza a llover piedra.',
      q: 'La Ciudad Santa se la llevó un disparo de prueba. Queda el cráter.' },
    'Scarif': { y: 0, aviso: 0, arma: 'Estrella de la Muerte',
      t: 'El escudo planetario se cierra y nadie entra ni sale. Luego el mar se levanta entero.',
      q: 'De Scarif queda un cinturón de escombros y un mar hirviendo.' },
    'Hosnian Prime': { y: 34, aviso: 0, arma: 'Base Starkiller',
      t: 'Alguien señala al cielo de mediodía. Hay cinco líneas rojas donde no había nada.',
      q: 'El sistema Hosnian se apagó en una tarde, con la Nueva República dentro.' },
    'Kamino': { y: -18, aviso: 3, arma: 'el Imperio',
      t: 'El Imperio ha empezado a desmantelar Ciudad Tipoca. Las plataformas caen al mar una a una.',
      q: 'El Imperio desmanteló Ciudad Tipoca. Aquí ya no queda nada que no sea agua.' },
    'Mandalore': { y: -19, aviso: 1, arma: 'la Purga',
      t: 'Bombardeo orbital sin aviso previo y sin objetivo militar. Llaman a esto la Noche de las Mil Lágrimas.',
      q: 'Después de la Purga, la superficie de Mandalore es cristal. Se puede ser mandaloriano; vivir allí, no.' }
  };

  /** ¿Existe todavía este mundo en el año `y`? */
  SW.mundoVivoEn = function (nombre, y) {
    const F = SW.FIN_DE_MUNDO[nombre];
    if (!F || y == null) return true;
    return y < F.y;
  };

  /* `mundoViable` la consultan el mapa, las mudanzas, el dosier y el
     creador de personajes. Ahora, si hay año, manda el año; si no lo
     hay, se sigue usando la tabla vieja por épocas. */
  const viablePorEra = SW.mundoViable;
  SW.mundoViable = function (nombre, era, anio) {
    if (anio != null) return SW.mundoVivoEn(nombre, anio);
    const F = SW.FIN_DE_MUNDO[nombre];
    if (F) {
      // sin año: se corta a partir de la época en la que cae el suceso
      const eraFin = SW.eraDeAnio ? SW.eraDeAnio(F.y) : null;
      if (eraFin) {
        const orden = (SW.LIMITES_ERA || []).map(function (l) { return l.id; });
        const iFin = orden.indexOf(eraFin), iAhora = orden.indexOf(era);
        if (iFin >= 0 && iAhora >= 0) return iAhora <= iFin;
      }
    }
    return viablePorEra ? viablePorEra(nombre, era) : true;
  };

  /* ------------------------------------------------------------
     EL AVISO: sólo para los finales que dan margen
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'fm_aviso', min: 0, max: 200, prio: 97, gen: true, c: [],
    req: function (s) {
      const F = SW.FIN_DE_MUNDO[s.mundo];
      if (!F || !F.aviso) return false;
      const y = SW.anioGalactico ? SW.anioGalactico(s) : null;
      if (y == null) return false;
      return y >= F.y - F.aviso && y < F.y && !s.flags['aviso_fin_' + s.mundo];
    },
    hazlo: function (g) {
      const s = g.s;
      const F = SW.FIN_DE_MUNDO[s.mundo];
      s.flags['aviso_fin_' + s.mundo] = true;
      const y = SW.anioGalactico(s);
      const quedan = F.y - y;
      return {
        id: 'fm_aviso', gen: true,
        t: '<span class="scene-tag">' + U.esc(s.mundo.toUpperCase()) + ' · SE ACABA</span>' +
          '<p>' + F.t + '</p>' +
          '<p><b>Quedan ' + quedan + ' año' + (quedan === 1 ? '' : 's') + '.</b> Quien pueda irse, que se vaya. ' +
          'Los que se queden hasta el final se quedan del todo.</p>',
        c: [
          { t: 'Irse ahora, con tiempo y sin dramas',
            sub: 'Lo sensato. No cuesta nada más que dejarlo todo.',
            fx: { cordura: -10 }, evacuar: true },
          { t: 'Sacar a los tuyos primero y salir después',
            sub: 'Más lento. Y te lo llevas puesto para siempre.',
            fx: { alineamiento: 20, reputacion: 12, cordura: -16, creditos: -8000 },
            evacuar: true, flag: 'saco_gente_de_' },
          { t: 'Quedarte a ver hasta dónde llega',
            sub: 'Te quedan ' + quedan + ' año(s). Después ya no habrá salida.',
            fx: { cordura: -8, intelecto: 6 },
            out: 'Te quedas. Cada mes se va alguien más y el sitio suena distinto.' }
        ]
      };
    }
  });

  /* ------------------------------------------------------------
     EL DÍA. Aquí se puede morir, y de los finales sin aviso se
     muere casi siempre: eso es lo que significa que un planeta
     deje de existir contigo dentro.
     ------------------------------------------------------------ */
  SW.GUION.push({
    id: 'fm_final', min: 0, max: 200, prio: 99, gen: true, c: [],
    req: function (s) {
      const F = SW.FIN_DE_MUNDO[s.mundo];
      if (!F) return false;
      const y = SW.anioGalactico ? SW.anioGalactico(s) : null;
      if (y == null) return false;
      return y >= F.y && !s.flags['fin_vivido_' + s.mundo];
    },
    hazlo: function (g) { return SW.escenaFinDeMundo(g); }
  });

  SW.escenaFinDeMundo = function (g) {
    const s = g.s;
    const F = SW.FIN_DE_MUNDO[s.mundo];
    if (!F) return null;
    s.flags['fin_vivido_' + s.mundo] = true;
    const subito = !F.aviso;
    const destino = SW.refugioDe ? SW.refugioDe(g.rng, s.mundo) : 'Nar Shaddaa';
    const pct = function (x) { return Math.round(U.clamp(x, 0, 1) * 100) + '%'; };

    /* Con nave propia y en el sitio adecuado hay una posibilidad real.
       Sin nave, en un disparo orbital, no la hay casi. */
    const soltura = SW.solturaNave ? SW.solturaNave(s) : (s.nave ? 0.5 : 0);
    const conNave = s.nave
      ? U.clamp((subito ? 0.34 : 0.80) + soltura * 0.30, 0.2, subito ? 0.72 : 0.97)
      : 0;
    const aPie = subito
      ? U.clamp(0.05 + s.stats.destreza / 900 + s.stats.suerte / 700, 0.03, 0.16)
      : U.clamp(0.55 + s.stats.destreza / 320 + s.stats.carisma / 400, 0.4, 0.9);
    const pagando = subito
      ? U.clamp(0.08 + Math.max(0, s.stats.creditos) / 900000, 0.05, 0.28)
      : U.clamp(0.72 + Math.max(0, s.stats.creditos) / 600000, 0.6, 0.96);
    const coste = subito ? Math.max(20000, Math.round(Math.max(0, s.stats.creditos) * 0.6))
                         : Math.max(6000, Math.round(Math.max(0, s.stats.creditos) * 0.2));

    const c = [];
    if (s.nave) {
      c.push({ t: 'Correr al hangar y despegar como sea',
        sub: pct(conNave) + ' · tu ' + U.esc(s.nave.n),
        finMundo: { p: conNave, destino: destino,
          bien: 'Despegas con la rampa todavía bajando. Lo que ves por la ventanilla trasera no se te va nunca.',
          mal: 'No llegas al hangar.' } });
    }
    c.push({ t: subito ? 'Correr a la lanzadera más cercana' : 'Subir a un transporte de evacuación',
      sub: pct(aPie) + ' · tu destreza',
      finMundo: { p: aPie, destino: destino,
        bien: subito ? 'Te metes en una lanzadera de carga que ya iba llena. Salís por muy poco.'
                     : 'Cola de nueve horas, una bolsa y un asiento. Sales.',
        mal: subito ? 'La lanzadera despega sin ti.' : 'El último transporte sale sin ti.' } });
    c.push({ t: 'Pagar lo que pidan por un asiento', sub: pct(pagando) + ' · ' + U.cr(coste),
      coste: coste,
      finMundo: { p: pagando, destino: destino,
        bien: 'Pagas una barbaridad por un sitio de pie en una bodega. Barato, visto lo visto.',
        mal: 'Te cogen el dinero y la nave se va sin ti.' } });
    c.push({ t: 'Sacar a quien puedas antes de pensar en ti',
      sub: pct(Math.max(0.02, (s.nave ? conNave : aPie) - (subito ? 0.06 : 0.22)) ) + ' · lo correcto cuesta',
      fx: { alineamiento: 25, reputacion: 15 },
      finMundo: { p: Math.max(0.02, (s.nave ? conNave : aPie) - (subito ? 0.06 : 0.22)), destino: destino,
        bien: 'Metes a catorce en una lanzadera para ocho y subes el último. Lo cuentas el resto de tu vida.',
        mal: 'Los metes a todos. Para ti ya no hay sitio, y lo sabías al empezar.' } });
    c.push({ t: 'Quedarte', sub: 'No hay porcentaje. Es lo que es.',
      finMundo: { p: 0, destino: destino, mal: 'Te quedas donde estabas.' } });

    return {
      id: 'fm_final', gen: true, tono: 'mal',
      t: '<span class="scene-tag">' + U.esc(s.mundo.toUpperCase()) + ' · ' +
         (SW.formatoAnio ? SW.formatoAnio(SW.anioGalactico(s)) : '') + '</span>' +
        '<p>' + F.t + '</p>' +
        (subito
          ? '<p><b>No hay aviso, no hay evacuación y no hay plan.</b> Lo que decidas en los próximos ' +
            'segundos es lo único que va a haber.</p>'
          : '<p>Es el último año. Después de esto no queda a dónde volver.</p>') +
        '<p class="dim">' + U.esc(F.arma) + '.</p>',
      c: c
    };
  };

  /** Resolver la salida. Si no sale, se muere aquí. */
  SW.resolverFinDeMundo = function (g, cfg) {
    const s = g.s;
    const F = SW.FIN_DE_MUNDO[s.mundo] || { q: 'Ya no queda nada.', arma: 'lo que fuera' };
    const mundo = s.mundo;
    if (cfg.p > 0 && g.rng.chance(cfg.p)) {
      g.log(cfg.bien, 'bien');
      g.hito('Sobrevive al fin de ' + mundo);
      s.flags['sobrevivio_' + mundo] = true;
      g.aplicarFx({ cordura: -22, notoriedad: 4 }, {});
      g.mover(cfg.destino, 'saliendo de ' + mundo + ' el último día');
      g.log(F.q, 'res');
      return;
    }
    if (cfg.mal) g.log(cfg.mal, 'mal');
    g.log(F.q, 'mal');
    g.morir('Estaba en ' + mundo + ' el día que dejó de existir.');
  };

})(typeof window !== 'undefined' ? window : globalThis);

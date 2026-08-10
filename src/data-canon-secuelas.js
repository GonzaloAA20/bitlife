/* ============================================================
   HOLOVIDA :: LO QUE PASA DESPUÉS DE CRUZARTE CON ALGUIEN
   Encontrarte con el Conde Dooku, hacer un trato, cobrar veinte mil
   créditos y que ahí se acabe es anticlimático: te has cruzado con
   una de las cinco personas que deciden la galaxia y el juego lo
   despacha con una línea de log.

   Aquí se guarda cómo acabó cada encuentro y vuelve años después.
   No siempre igual: un trato con un Lord Sith no vuelve como vuelve
   un favor que le hiciste a un contrabandista.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GUION = SW.GUION || [];

  /* ------------------------------------------------------------
     Cómo clasificar lo que acabas de hacer. Se deduce de los
     efectos de la propia opción para no tener que reescribir a mano
     las nueve ramas del generador de encuentros.
     ------------------------------------------------------------ */
  SW.modoEncuentro = function (d) {
    if (!d) return 'roce';
    if (d.combate) return 'enfrentado';
    const fx = d.fx || {};
    if ((fx.alineamiento || 0) <= -18 || /sith\+|imperio\+/.test(d.faccion || '')) return 'trato_oscuro';
    if ((fx.creditos || 0) >= 15000) return 'negocio';
    if (d.rel) return 'vinculo';
    if (d.mover) return 'huida';
    return 'roce';
  };

  /** Lo llama el motor cada vez que una escena de leyenda se resuelve. */
  SW.anotarEncuentro = function (g, persona, d) {
    const s = g.s;
    if (!persona || !persona.n) return;
    s.encuentros = s.encuentros || [];
    if (s.encuentros.some(function (e) { return e.n === persona.n; })) return;
    s.encuentros.push({
      n: persona.n, tipo: persona.tipo || 'gente',
      modo: SW.modoEncuentro(d), edad: s.edad, cobrado: false
    });
  };

  /* ------------------------------------------------------------
     LA SECUELA
     ------------------------------------------------------------ */
  const PENDIENTE = function (s) {
    if (!s.encuentros) return null;
    for (let i = 0; i < s.encuentros.length; i++) {
      const e = s.encuentros[i];
      if (e.cobrado) continue;
      if (s.edad - e.edad < 3) continue;      // que dé tiempo a olvidarlo
      return e;
    }
    return null;
  };

  SW.GUION.push({
    id: 'ce_secuela', min: 12, max: 200, prio: 70, repetible: true, gen: true, c: [],
    req: function (s) { return !!PENDIENTE(s); },
    hazlo: function (g) {
      const s = g.s;
      const e = PENDIENTE(s);
      if (!e) return null;
      if (!g.rng.chance(0.45)) return null;
      e.cobrado = true;
      const años = s.edad - e.edad;
      return SW.escenaSecuela(g, e, años);
    }
  });

  SW.escenaSecuela = function (g, e, años) {
    const s = g.s;
    const N = U.esc(e.n);
    const tag = '<span class="canon-tag">' + años + ' AÑOS DESPUÉS</span>';
    const oscuro = e.tipo === 'sith' || e.tipo === 'villano';

    /* --- hiciste un trato con alguien muy grande --- */
    if (e.modo === 'trato_oscuro' || e.modo === 'negocio') {
      const cobro = oscuro ? 'cobrar' : 'pedir';
      return {
        id: 'ce_sec_trato', gen: true,
        t: tag + '<p>Aquel trato con <b>' + N + '</b> no era un trato: era una cuenta abierta. ' +
          'Y hoy alguien viene a ' + cobro + 'la.</p>' +
          '<p>' + (oscuro
            ? 'No viene ' + N + ' en persona. Viene alguien con su autoridad, que es peor, porque a ese sí le pueden matar y no le importa.'
            : 'Viene un intermediario con una carpeta y una sonrisa de las que no se discuten.') + '</p>',
        c: [
          { t: 'Pagar lo que sea que se deba',
            fx: { creditos: -Math.max(20000, Math.round(Math.max(0, s.stats.creditos) * 0.3)), cordura: -6 },
            out: 'Queda saldado. Por escrito no hay nada, que es justo el problema.' },
          { t: 'Pagar con un favor en vez de con dinero',
            sub: 'Más barato hoy, más caro siempre.',
            fx: { notoriedad: 14, alineamiento: -14, cordura: -10 }, flag: 'debe_un_favor_grande',
            out: 'Aceptan encantados. Los favores no vencen nunca y ellos lo saben.' },
          { t: 'Negarte', sub: 'A gente así.',
            r: [
              { p: U.clamp(0.2 + s.stats.notoriedad / 260, 0.15, 0.5),
                t: 'Te miran, calculan lo que costaría y deciden que no compensa. Todavía.',
                fx: { notoriedad: 10, cordura: -8 } },
              { p: 0.6, t: 'No hace falta que insistan mucho.',
                fx: { salud: -26, creditos: -30000, cordura: -12 }, buscado: 25,
                herida: { n: 'un aviso escrito en la cara', sev: 14 } }
            ] },
          { t: 'Contarlo todo a quien esté enfrente de ' + N,
            sub: 'Convertir la deuda en información.',
            fx: { creditos: 35000, notoriedad: 22, alineamiento: 10 }, buscado: 30,
            flag: 'delato_a_una_leyenda',
            out: 'Pagan bien por saber. Y ahora tienes a los dos lados pendientes de ti.' }
        ]
      };
    }

    /* --- te enfrentaste y sigues vivo --- */
    if (e.modo === 'enfrentado') {
      return {
        id: 'ce_sec_duelo', gen: true,
        t: tag + '<p>Lo de <b>' + N + '</b> no se quedó donde pasó. Alguien lo contó, alguien lo adornó, ' +
          'y a estas alturas hay una versión en la que tú quedas mucho mejor de lo que quedaste.</p>' +
          '<p>Hoy se te acerca alguien que se la cree entera.</p>',
        c: [
          { t: 'Dejar que se la crea', fx: { reputacion: 16, notoriedad: 12, carisma: 6 },
            out: 'No corriges nada. La leyenda se alimenta sola a partir de aquí.' },
          { t: 'Contar lo que pasó de verdad',
            fx: { reputacion: -4, cordura: 12, alineamiento: 8 },
            out: '«Me dio una paliza y me fui corriendo.» Se decepciona. Tú duermes mejor.' },
          { t: 'Aprovecharlo para cobrar',
            fx: { creditos: 26000, carisma: 10, notoriedad: 10, alineamiento: -6 },
            out: 'Le vendes la historia y un objeto que juras que es de aquel día.' },
          { t: 'Preguntar por dónde anda ' + N + ' ahora',
            sub: 'Porque aquello no acabó.',
            fx: { intelecto: 8, notoriedad: 8, cordura: -8 }, flag: 'busca_revancha',
            out: 'Te dan un sector y una fecha. Ahora tienes que decidir si vas.' }
        ]
      };
    }

    /* --- os hicisteis algo parecido a amigos --- */
    if (e.modo === 'vinculo') {
      return {
        id: 'ce_sec_vinculo', gen: true,
        t: tag + '<p>Llega un mensaje sin remitente y con una sola línea. Es de <b>' + N + '</b>, ' +
          'y es una petición de ayuda de las que no se hacen dos veces.</p>',
        c: [
          { t: 'Ir', sub: 'Sin preguntar qué es.',
            fx: { alineamiento: 16, reputacion: 14, cordura: 10, salud: -14 },
            flag: 'debe_favor_una_leyenda', notoriedad: 10,
            out: 'Tres semanas muy malas y una deuda que ahora tiene ' + N + ' contigo. Eso vale una fortuna.' },
          { t: 'Ir, pero cobrando',
            fx: { creditos: 40000, reputacion: -6, alineamiento: -8 },
            out: 'Paga sin discutir. Y algo se rompe entre vosotros sin que nadie lo diga.' },
          { t: 'Mandar ayuda sin ir tú',
            fx: { creditos: -18000, alineamiento: 8, cordura: -4 },
            out: 'Llega a tiempo. No es lo mismo, y los dos lo sabéis.' },
          { t: 'No contestar', fx: { cordura: -16, alineamiento: -10 },
            out: 'No vuelve a escribir. Te acuerdas de esto en momentos raros durante años.' }
        ]
      };
    }

    /* --- saliste corriendo, o pasaste de largo --- */
    return {
      id: 'ce_sec_roce', gen: true,
      t: tag + '<p>Sale <b>' + N + '</b> en un holo y te quedas quieto mirándolo más rato del que hace falta.</p>' +
        '<p>' + (e.modo === 'huida'
          ? 'Aquel día echaste a correr y hasta hoy no habías pensado en cómo habría ido si no lo hubieras hecho.'
          : 'Estuvisteis a tres metros y no dijiste nada. La galaxia es enorme y aun así os cruzasteis.') + '</p>',
      c: [
        { t: 'Contarlo por fin a alguien', fx: { cordura: 10, carisma: 6 },
          out: 'No te creen. Da igual: tú estabas allí.' },
        { t: 'Buscar la forma de volver a cruzarte',
          fx: { intelecto: 6, notoriedad: 8, cordura: -4 }, flag: 'busca_a_' + e.n.replace(/\s+/g, '_'),
          out: 'Empiezas a seguir por dónde va. Es una manera rara de vivir y ya no la sueltas.' },
        { t: 'Escribir lo que viste y venderlo',
          fx: { creditos: 14000, intelecto: 8, notoriedad: 6 },
          out: 'Un holoperiódico de tercera te compra el testimonio. Le cambian el titular.' },
        { t: 'Apagar el holo', fx: { cordura: 4 },
          out: 'Algunas cosas pasan una vez y ya está.' }
      ]
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

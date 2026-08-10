/* ============================================================
   HOLOVIDA :: LA ÚLTIMA DÉCADA
   Las vidas se acababan sin acabarse: llegabas a viejo y el juego
   seguía ofreciéndote lo mismo que a los treinta hasta que un día
   te morías en una línea de log. Faltaba el tramo en el que ya no
   se construye nada y sólo se decide qué queda.

   Se dispara cuando el cuerpo avisa, no a una edad fija: depende de
   tu especie y de lo machacado que estés.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  SW.GUION = SW.GUION || [];

  /** Los años que probablemente te quedan, en bruto. */
  SW.tramoFinal = function (s) {
    const esp = (SW.ESPECIES || []).filter(function (e) { return e.id === s.especie; })[0];
    const tope = (esp && esp.vida) ? esp.vida : 85;
    return s.edadBio >= tope * 0.78;
  };

  /* --- 1. EL AVISO: el cuerpo dice que queda menos --- */
  SW.GUION.push({
    id: 'vj_aviso', min: 30, max: 200, prio: 64, unaVez: true, gen: true, c: [],
    req: function (s) { return SW.tramoFinal(s) && !s.flags.ultima_decada; },
    hazlo: function (g) {
      const s = g.s;
      s.flags.ultima_decada = true;
      const hijos = s.relaciones.filter(function (r) { return /hij/.test(r.tipo); });
      const c = [
        { t: 'Ponerte a ordenar lo tuyo', sub: 'Papeles, cuentas, quién se queda con qué.',
          fx: { intelecto: 6, cordura: 10 }, flag: 'testamento_hecho',
          out: 'Tardas tres tardes. Al acabar te sientas y no sabes muy bien qué hacer con la cuarta.' },
        { t: 'Seguir como si no pasara nada', fx: { cordura: -6, fisico: 4 },
          out: 'Funciona bastante bien, hasta que deja de funcionar.' },
        { t: 'Escribir todo lo que has visto', sub: 'Que quede en alguna parte.',
          fx: { intelecto: 10, cordura: 12 }, flag: 'memorias',
          out: 'Nadie te lo ha pedido. Lo escribes igual, y sale más largo de lo que creías.' }
      ];
      if (hijos.length) {
        c.push({ t: 'Hablar con ' + U.esc(hijos[0].nombre) + ' de lo que nunca hablasteis',
          fx: { cordura: 20, alineamiento: 8 }, afectoNombre: { nombre: hijos[0].nombre, delta: 30 },
          flag: 'hablo_con_los_suyos',
          out: 'Cuarenta minutos incomodísimos y luego ya no. Deberías haberlo hecho hace veinte años.' });
      }
      return {
        id: 'vj_aviso', gen: true,
        t: '<span class="momento-tag">SE NOTA</span>' +
          '<p>No es una enfermedad ni un golpe: es que subir tres tramos de escalera ha pasado a ser ' +
          'una cosa que se planea.</p>' +
          '<p>Tienes ' + s.edad + ' años y por primera vez el número significa algo.</p>',
        c: c
      };
    }
  });

  /* --- 2. QUÉ HACES CON LO QUE TIENES --- */
  SW.GUION.push({
    id: 'vj_legado', min: 30, max: 200, prio: 62, unaVez: true, gen: true, c: [],
    req: function (s) {
      return s.flags.ultima_decada && !s.flags.legado_decidido &&
        (s.stats.creditos > 60000 || (s.negocios && s.negocios.length) || s.nave);
    },
    hazlo: function (g) {
      const s = g.s;
      s.flags.legado_decidido = true;
      const hijos = s.relaciones.filter(function (r) { return /hij|aprendiz|padawan/.test(r.tipo); });
      const c = [
        { t: 'Repartirlo entre los tuyos', req: function (st) { return hijos.length > 0; },
          fx: { cordura: 16, alineamiento: 10 }, legado: 'reparto',
          out: 'Lo dejas todo firmado y por partes iguales, que es la única forma de que no se peleen. ' +
               'Se pelearán igual.' },
        { t: 'Dárselo todo a un sitio que lo necesite',
          fx: { cordura: 20, alineamiento: 25, reputacion: 20 }, legado: 'donado',
          out: 'Una clínica, una escuela o un puerto que se caía. Le ponen tu nombre y lo escriben mal.' },
        { t: 'Gastártelo entero antes de irte',
          fx: { cordura: 24, salud: -8, notoriedad: 12 }, legado: 'gastado', gastarTodo: true,
          out: 'Nueve meses que no se pueden contar en un resumen de vida. Llegas al final sin un crédito ' +
               'y sin una sola queja.' },
        { t: 'Esconderlo y dejar un mapa malo',
          fx: { intelecto: 10, cordura: 8, notoriedad: 16 }, legado: 'escondido', flag: 'tesoro_escondido',
          out: 'Alguien lo buscará durante décadas. Puede que lo encuentre. Puede que no estuviera.' },
        { t: 'No decidir nada', fx: { cordura: -8 }, legado: 'nada',
          out: 'Que se lo repartan los abogados y el Estado. Mayormente el Estado.' }
      ];
      return {
        id: 'vj_legado', gen: true,
        t: '<span class="momento-tag">LO QUE DEJAS</span>' +
          '<p>Tienes ' + U.cr(s.stats.creditos) +
          (s.negocios && s.negocios.length ? ', ' + s.negocios.length + ' negocios' : '') +
          (s.nave ? ' y una nave que ya casi no vuelas' : '') + '.</p>' +
          '<p>Nada de eso se va contigo. Alguien va a decidir qué pasa con ello: puedes ser tú.</p>',
        c: c
      };
    }
  });

  /* --- 3. LO QUE TE QUEDÓ SIN HACER --- */
  SW.GUION.push({
    id: 'vj_pendiente', min: 30, max: 200, prio: 60, unaVez: true, gen: true, c: [],
    req: function (s) { return s.flags.ultima_decada && !s.flags.cuenta_saldada; },
    hazlo: function (g) {
      const s = g.s;
      if (!g.rng.chance(0.7)) return null;
      s.flags.cuenta_saldada = true;
      const enemigo = s.relaciones.filter(function (r) { return r.afecto < -30; })[0];
      const perdido = s.relacionesPasadas && s.relacionesPasadas.length
        ? s.relacionesPasadas[s.relacionesPasadas.length - 1] : null;
      const c = [
        { t: 'Volver al mundo donde naciste', sub: U.esc(s.mundoNatal),
          fx: { cordura: 22, salud: -4 }, mueveA: s.mundoNatal, motivo: 'a cerrar el círculo',
          flag: 'volvio_a_casa',
          out: 'Está más pequeño y más sucio de lo que recordabas, y aun así te quedas dos horas parado.' }
      ];
      if (enemigo) {
        c.push({ t: 'Arreglar lo de ' + U.esc(enemigo.nombre),
          sub: 'Lleváis media vida sin hablaros.',
          r: [
            { p: 0.55, t: 'Os dais la mano en una puerta y ninguno de los dos dice nada más. Basta.',
              fx: { cordura: 26, alineamiento: 12 }, afectoNombre: { nombre: enemigo.nombre, delta: 60 } },
            { p: 0.45, t: 'No quiere verte. Tenía sus razones y siguen siendo buenas.',
              fx: { cordura: -12, alineamiento: 6 } }
          ] });
      }
      if (perdido) {
        c.push({ t: 'Buscar a ' + U.esc(perdido.nombre), sub: 'Por saber qué fue.',
          fx: { cordura: 14, creditos: -8000 },
          out: 'Tardas ocho meses en localizarle. Habláis una hora. No hay nada que arreglar y aun así ayuda.' });
      }
      c.push({ t: 'Enseñarle a alguien lo que sabes',
        fx: { cordura: 18, carisma: 8, reputacion: 10 },
        rel: { tipo: 'aprendiz', afecto: 60, quien: 'te escucha como no te escuchó nadie' },
        flag: 'dejo_escuela',
        out: 'Al principio por aburrimiento. Luego porque es lo mejor que haces en el día.' });
      c.push({ t: 'No remover nada', fx: { cordura: -6 },
        out: 'Hay cosas que se quedan como están y no pasa nada. Casi nada.' });
      return {
        id: 'vj_pendiente', gen: true,
        t: '<span class="momento-tag">CUENTAS PENDIENTES</span>' +
          '<p>A esta edad la cabeza va sola a los mismos tres sitios, y ninguno de los tres es agradable.</p>' +
          '<p>Todavía se puede hacer algo con alguno.</p>',
        c: c
      };
    }
  });

  /* --- 4. EL ÚLTIMO AÑO: se sabe cuándo se sabe --- */
  SW.GUION.push({
    id: 'vj_ultimo', min: 30, max: 200, prio: 58, unaVez: true, gen: true, c: [],
    req: function (s) {
      return s.flags.ultima_decada && !s.flags.ultimo_año &&
        (s.stats.salud < 35 || (s.heridas && s.heridas.length >= 3));
    },
    hazlo: function (g) {
      const s = g.s;
      s.flags.ultimo_año = true;
      const gente = s.relaciones.filter(function (r) { return r.afecto > 40; });
      return {
        id: 'vj_ultimo', gen: true,
        t: '<span class="momento-tag">EL ÚLTIMO AÑO</span>' +
          '<p>Un médico te lo dice de la única forma en que se puede decir: mirando la pared.</p>' +
          '<p>' + (gente.length
            ? 'Tienes ' + gente.length + ' persona' + (gente.length > 1 ? 's' : '') + ' a quien avisar.'
            : 'No tienes a quién avisar, que también es una manera de haber vivido.') + '</p>',
        c: [
          { t: 'Reunir a todo el mundo una última vez',
            req: function (st) { return gente.length > 0; },
            fx: { cordura: 30, creditos: -15000, salud: -4 }, flag: 'ultima_cena',
            out: 'Una mesa larga, comida de más y nadie mencionando lo evidente. Sales de allí en paz.' },
          { t: 'Irte a un sitio bonito y esperar',
            fx: { cordura: 24, salud: -6 }, mover: true, motivo: 'a esperar sentado y con vistas',
            flag: 'se_fue_tranquilo',
            out: 'Alquilas algo con ventana. Ves amanecer todos los días de lo que queda.' },
          { t: 'Hacer una última cosa de las tuyas',
            sub: 'Ya no hay nada que perder, literalmente.',
            fx: { notoriedad: 25, salud: -18, cordura: 20 }, flag: 'ultima_locura',
            out: 'Sale en los holos del sector. Sales tú, con esa cara. Vale la pena.' },
          { t: 'No decírselo a nadie', fx: { cordura: -14 }, flag: 'se_lo_callo',
            out: 'Sigues haciendo la compra y saludando al vecino. Se enteran después.' }
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);

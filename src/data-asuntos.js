/* ============================================================
   HOLOVIDA :: LO QUE TIENES ENTRE MANOS
   Se puede llegar a tener seis cosas abiertas a la vez —contrato del
   Gremio, encargo de leyenda, misión de la Orden, expediente de la
   Inquisición, carga en bodega y una campaña de guerra— y la barra
   de arriba sólo enseñaba tres. El resto existía en el estado pero
   no en la pantalla: te saltaba solo cuando el juego se acordaba.

   Esto reúne todo lo que está en marcha en un sitio.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /** Todo lo que tienes abierto, en orden de a qué deberías atender. */
  SW.asuntosAbiertos = function (s) {
    const a = [];
    if (s.leyenda) {
      a.push({ ic: '✦', n: 'Encargo de leyenda', d: s.leyenda.n,
        pie: U.cr(s.leyenda.pago) + ' al cierre', c: 'leyenda', urg: 1 });
    }
    if (s.contrato) {
      const fases = { viaje: 'de camino', buscar: 'buscándole', captura: 'a punto', entrega: 'para entregar' };
      a.push({ ic: '✵', n: 'Contrato del Gremio', d: s.contrato.nombre,
        pie: (fases[s.contrato.fase] || '') + ' · ' + s.contrato.destino, c: 'contrato', urg: 2 });
    }
    if (s.caza) {
      a.push({ ic: '⌖', n: 'Expediente de la Inquisición', d: s.caza.perfil ? s.caza.perfil.n : 'un objetivo',
        pie: s.caza.mundo, c: 'caza', urg: 2 });
    }
    if (s.mision) {
      a.push({ ic: '✷', n: 'Misión de la Orden', d: s.mision.n || 'del Consejo',
        pie: s.mision.mundo, c: 'mision', urg: 3 });
    }
    if (s.flags && s.flags.en_el_frente) {
      const cmp = s.campaña || {};
      a.push({ ic: '⛨', n: 'En el frente', d: (s.puestoGuerra || 'infantería'),
        pie: (s.añosDeFrenteRestantes || 0) + ' años de campaña · ' + (cmp.medallas || 0) + ' condecoraciones',
        c: 'frente', urg: 3 });
    }
    if (s.carga) {
      a.push({ ic: '▣', n: 'Carga en bodega', d: s.carga.n,
        pie: 'comprada en ' + s.carga.origen + ' por ' + U.cr(s.carga.coste) +
             (s.carga.ilegal ? ' · ilegal' : ''), c: 'carga', urg: 4 });
    }
    if (s.pendientes && s.pendientes.length) {
      s.pendientes.slice(0, 2).forEach(function (p) {
        a.push({ ic: '⚑', n: 'Pendiente en ' + p.mundo, d: p.txt, pie: 'desde los ' + p.edad,
          c: 'pendiente', urg: 5 });
      });
    }
    return a.sort(function (x, y) { return x.urg - y.urg; });
  };

  /** El bloque de la ficha. */
  SW.htmlAsuntos = function (s) {
    const a = SW.asuntosAbiertos(s);
    if (!a.length) return '';
    let h = '<div class="ficha asuntos"><h4>Entre manos</h4>';
    a.forEach(function (x) {
      h += '<div class="asunto ' + x.c + '"><i>' + x.ic + '</i>' +
        '<div><b>' + U.esc(x.n) + '</b>' +
        (x.d ? '<span class="asunto-q">' + U.esc(String(x.d)) + '</span>' : '') +
        (x.pie ? '<span class="asunto-pie">' + U.esc(x.pie) + '</span>' : '') +
        '</div></div>';
    });
    return h + '</div>';
  };

})(typeof window !== 'undefined' ? window : globalThis);

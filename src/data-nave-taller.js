/* ============================================================
   HOLOVIDA :: TALLER DE NAVE
   Tener nave era solo una línea en la ficha. Aquí se convierte en
   una pestaña propia con mejoras que NO son números decorativos:
   cada una desbloquea opciones nuevas en los eventos, cambia cómo
   te salen las cosas o te abre trabajos que sin ella no existen.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;

  /* ============================================================
     LAS MEJORAS
     cat  : dónde va montada (una por ranura salvo 'extra')
     req  : qué necesitas para poder instalarla
     abre : qué opciones desbloquea en los eventos (flags legibles)
     ============================================================ */
  SW.MEJORAS_NAVE = [
    /* ---- motor ---- */
    { id: 'motor_sublz', n: 'Impulsores de carreras', cat: 'motor', p: 34000,
      d: 'Aceleración bruta. Sirve para huir y para llegar el primero.',
      ef: { vel: 2 }, abre: ['carreras', 'huida'],
      sub: 'Desbloquea correr carreras y escapar de persecuciones.' },
    { id: 'motor_hiper', n: 'Hiperimpulsor clase 0.7', cat: 'motor', p: 52000,
      d: 'Saltos más largos y más rápidos. Los viajes cuestan menos.',
      ef: { vel: 1, saltoBarato: 0.45 }, abre: ['ruta_larga'],
      sub: 'Viajar cuesta casi la mitad. Abre rutas al otro lado de la galaxia.' },
    { id: 'motor_silencio', n: 'Amortiguadores de firma', cat: 'motor', p: 46000,
      d: 'Tu nave casi no aparece en un escáner.',
      ef: { sigilo: 3 }, abre: ['contrabando', 'colarse'],
      sub: 'Pasas aduanas y bloqueos. Casi todo el contrabando se abre aquí.' },

    /* ---- casco ---- */
    { id: 'casco_blindaje', n: 'Blindaje de placas dobles', cat: 'casco', p: 40000,
      d: 'Pesa. Aguanta.',
      ef: { casco: 3, vel: -1 }, abre: ['aguantar_fuego'],
      sub: 'Sobrevives a lo que hundiría a otro. Pierdes velocidad.' },
    { id: 'casco_bodega', n: 'Bodega ampliada y compartimentos', cat: 'casco', p: 28000,
      d: 'Más sitio, y algunos huecos que no salen en los planos.',
      ef: { carga: 4, sigilo: 1 }, abre: ['contrabando', 'pasajeros'],
      sub: 'Llevas el doble de carga y puedes esconderla. Y a gente.' },
    { id: 'casco_medico', n: 'Bahía médica', cat: 'casco', p: 44000,
      d: 'Una camilla, un droide 2-1B y suficientes bactas.',
      ef: { cura: 3 }, abre: ['curar_a_bordo'],
      sub: 'Tus heridas curan mucho más rápido. Puedes salvar a gente.' },

    /* ---- armas ---- */
    { id: 'arma_cuadruple', n: 'Torreta cuádruple', cat: 'arma', p: 48000,
      d: 'Cuatro cañones y un asiento incómodo.',
      ef: { arm: 3 }, abre: ['escolta', 'caza'],
      sub: 'Abre contratos de escolta y de caza. Ganas combates espaciales.' },
    { id: 'arma_ion', n: 'Cañones iónicos', cat: 'arma', p: 41000,
      d: 'No destruyen: apagan.',
      ef: { arm: 1, ion: 3 }, abre: ['abordaje', 'capturar'],
      sub: 'Puedes dejar una nave muerta y abordarla en vez de reventarla.' },
    { id: 'arma_torpedos', n: 'Tubos de torpedos de protones', cat: 'arma', p: 62000,
      d: 'Dos disparos. Con eso basta.',
      ef: { arm: 4 }, abre: ['caza', 'objetivo_grande'],
      sub: 'Puedes atacar cosas mucho más grandes que tú.' },

    /* ---- sistemas ---- */
    { id: 'sis_nav', n: 'Ordenador de navegación militar', cat: 'sistema', p: 36000,
      d: 'Calcula saltos que otros no se atreven a intentar.',
      ef: { nav: 3, saltoBarato: 0.25 }, abre: ['ruta_larga', 'atajo'],
      sub: 'Atajos peligrosos que ahorran años. El Pasillo de Kessel, por ejemplo.' },
    { id: 'sis_escaner', n: 'Escáner de largo alcance', cat: 'sistema', p: 30000,
      d: 'Ves lo que hay antes de que te vea.',
      ef: { nav: 2, sigilo: 1 }, abre: ['rescate', 'buscar'],
      sub: 'Encuentras pecios, gente perdida y emboscadas antes de caer en ellas.' },
    { id: 'sis_falsa', n: 'Transpondedor falsificable', cat: 'sistema', p: 38000,
      d: 'Tu nave puede ser otra nave durante un rato.',
      ef: { sigilo: 3 }, abre: ['colarse', 'contrabando', 'suplantar'],
      sub: 'Te cuelas donde no deberías. Muy útil si te buscan.' },

    /* ---- extras (se pueden acumular) ---- */
    { id: 'ex_droide', n: 'Droide astromecánico', cat: 'extra', p: 22000,
      d: 'Repara en vuelo y se queja en binario.',
      ef: { casco: 1, nav: 1, repara: 2 }, abre: ['reparar_en_vuelo'],
      sub: 'Arregla averías solo. Menos accidentes.' },
    { id: 'ex_camarote', n: 'Camarotes decentes', cat: 'extra', p: 18000,
      d: 'Se puede vivir aquí sin odiarlo.',
      ef: { moral: 2 }, abre: ['vivir_a_bordo', 'pasajeros'],
      sub: 'Puedes vivir en tu nave, y llevar pasajeros que paguen.' },
    { id: 'ex_taller', n: 'Taller de a bordo', cat: 'extra', p: 26000,
      d: 'Un banco de trabajo y las herramientas bien puestas.',
      ef: { repara: 3 }, abre: ['fabricar', 'reparar_en_vuelo'],
      sub: 'Fabricas y modificas cosas en ruta. Las reparaciones son gratis.' },
    { id: 'ex_escondite', n: 'Compartimento oculto reforzado', cat: 'extra', p: 24000,
      d: 'Cabe una persona o mucha especia.',
      ef: { sigilo: 2, carga: 1 }, abre: ['contrabando', 'esconder_gente'],
      sub: 'Puedes sacar a alguien de un planeta bloqueado.' }
  ];

  SW.RANURAS = [
    { id: 'motor', n: 'Motores' }, { id: 'casco', n: 'Casco' },
    { id: 'arma', n: 'Armamento' }, { id: 'sistema', n: 'Sistemas' },
    { id: 'extra', n: 'Extras', multiple: true }
  ];

  /* ============================================================
     CONSULTAS
     ============================================================ */
  SW.mejorasDe = function (s) {
    return (s.mejorasNave || []).map(function (id) {
      return SW.MEJORAS_NAVE.filter(function (m) { return m.id === id; })[0];
    }).filter(Boolean);
  };

  /** ¿tu nave puede hacer X? lo consultan los eventos */
  SW.naveAbre = function (s, etiqueta) {
    if (!s.nave) return false;
    const ms = SW.mejorasDe(s);
    for (let i = 0; i < ms.length; i++) if ((ms[i].abre || []).indexOf(etiqueta) >= 0) return true;
    return false;
  };

  /** suma de un efecto concreto, mejoras + nave base */
  SW.naveStat = function (s, k) {
    if (!s.nave) return 0;
    let v = s.nave[k] || 0;
    const ms = SW.mejorasDe(s);
    for (let i = 0; i < ms.length; i++) v += (ms[i].ef && ms[i].ef[k]) || 0;
    return v;
  };

  /** descuento de viaje acumulado */
  SW.descuentoSalto = function (s) {
    let d = 0;
    SW.mejorasDe(s).forEach(function (m) { d += (m.ef && m.ef.saltoBarato) || 0; });
    return U.clamp(d, 0, 0.6);
  };

  /** ficha corta para la interfaz */
  SW.resumenNave = function (s) {
    if (!s.nave) return null;
    return {
      nombre: s.naveNombre || s.nave.n,
      clase: s.nave.n,
      vel: SW.naveStat(s, 'vel'), carga: SW.naveStat(s, 'carga'),
      arm: SW.naveStat(s, 'arm'), casco: SW.naveStat(s, 'casco'),
      sigilo: SW.naveStat(s, 'sigilo'), nav: SW.naveStat(s, 'nav'),
      estado: s.naveEstado == null ? 100 : s.naveEstado,
      mejoras: SW.mejorasDe(s)
    };
  };

  /* ============================================================
     EL MENÚ DEL TALLER
     ============================================================ */
  SW.menuTaller = function (g) {
    const s = g.s;
    const puestas = s.mejorasNave || [];
    const c = [];

    SW.RANURAS.forEach(function (r) {
      const yaAqui = SW.MEJORAS_NAVE.filter(function (m) {
        return m.cat === r.id && puestas.indexOf(m.id) >= 0;
      });
      // una por ranura, salvo extras
      if (!r.multiple && yaAqui.length) return;

      SW.MEJORAS_NAVE.filter(function (m) { return m.cat === r.id && puestas.indexOf(m.id) < 0; })
        .forEach(function (m) {
          const precio = Math.round(m.p * (s.stats.intelecto > 55 ? 0.88 : 1) *
                                    (s.habilidades.indexOf('ingeniero') >= 0 ? 0.82 : 1));
          const puede = s.stats.creditos >= precio;
          c.push({
            t: (puede ? '' : '✕ ') + r.n + ' · ' + m.n + ' — ' + U.cr(precio),
            sub: m.sub + (puede ? '' : ' · no te llega'),
            bloqueada: !puede,
            fx: puede ? { creditos: -precio, intelecto: 2 } : {},
            instalarMejora: puede ? m.id : null
          });
        });
    });

    const rota = (s.naveEstado == null ? 100 : s.naveEstado) < 100;
    if (rota) {
      const gratis = SW.naveAbre(s, 'reparar_en_vuelo');
      const coste = gratis ? 0 : Math.round((100 - s.naveEstado) * 190);
      c.push({
        t: gratis ? 'Reparar el casco (tu taller lo cubre)' : 'Reparar el casco — ' + U.cr(coste),
        sub: gratis ? 'Tienes taller a bordo: no te cuesta nada.' : 'Estado actual: ' + s.naveEstado + '%',
        req: function (st) { return gratis || st.stats.creditos >= coste; },
        fx: gratis ? {} : { creditos: -coste }, naveEstado: 100
      });
    }
    c.push({ t: 'Ponerle nombre a la nave', nombrarNave: true });
    c.push({ t: 'Vender la nave y todo lo montado', venderNave: true,
             sub: 'Recuperas la mitad. Las mejoras se pierden.' });
    c.push({ t: '◂ Cerrar el taller', volver: true });

    const f = SW.resumenNave(s);
    return {
      id: 'menu_taller', gen: true, esMenu: true, taller: true,
      t: 'TALLER — ' + f.nombre + ' · vel ' + f.vel + ' · carga ' + f.carga +
         ' · armas ' + f.arm + ' · sigilo ' + f.sigilo + ' · casco ' + f.estado + '%' +
         '<br><span class="dim">Tienes ' + U.cr(s.stats.creditos) + ' · ' +
         f.mejoras.length + ' mejora(s) instalada(s)</span>',
      c: c
    };
  };

})(typeof window !== 'undefined' ? window : globalThis);

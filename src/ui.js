/* ============================================================
   HOLOVIDA :: interfaz
   Layout de altura fija con dos zonas de scroll independientes:
   la ficha nunca se pierde detrás del registro de la vida.
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  const $ = function (sel) { return document.querySelector(sel); };

  const UI = { juego: null, creador: null, app: null, mini: null };

  /* ============================================================
     AMBIENTE POR MUNDO
     Cada bioma tiñe la interfaz. No es decorado: te dice de un
     vistazo dónde estás sin leer nada.
     ============================================================ */
  const AMBIENTES = [
    { re: /desierto|árido|arena|dunas|sal/i,        id: 'desierto',  acento: '#ffb03a', cielo: '#3a2410', suelo: '#1a1006', niebla: '#c88a3a' },
    { re: /hielo|glaciar|tundra|helad/i,             id: 'hielo',     acento: '#a8e8ff', cielo: '#0e2a3a', suelo: '#071620', niebla: '#7fc4e8' },
    { re: /océano|oceán|lagos|acuát|agua|mar/i,      id: 'oceano',    acento: '#3ad6ff', cielo: '#052436', suelo: '#03131e', niebla: '#2a9ac8' },
    { re: /volcán|volcan|lava|basalto|ceniza/i,      id: 'volcanico', acento: '#ff5a3a', cielo: '#3a0e08', suelo: '#1a0604', niebla: '#c83a1a' },
    { re: /jungla|selva|bosque|hongo|pradera|verde/i,acento: '#6aff8a', id: 'selva',    cielo: '#0a2a18', suelo: '#04120a', niebla: '#3aa85a' },
    { re: /ciudad|urban|subciudad|industrial|fábrica|estación|anillo|orbital/i, id: 'ciudad', acento: '#c98aff', cielo: '#1a1030', suelo: '#0a0618', niebla: '#8a5ad8' },
    { re: /pantano|tumbas|ruinas|penumbra|sombr|niebla/i, id: 'sombra', acento: '#8affc0', cielo: '#0e2018', suelo: '#050e0a', niebla: '#4a8a6a' },
    { re: /cristal|kyber|gas|nube/i,                  id: 'cristal',   acento: '#ffd6f5', cielo: '#2a1030', suelo: '#12061a', niebla: '#c86ad8' }
  ];

  UI.ambienteDe = function (mundoNombre) {
    const m = SW.mundo(mundoNombre);
    const texto = (m.bio || '') + ' ' + (m.vibe || '');
    for (let i = 0; i < AMBIENTES.length; i++) {
      if (AMBIENTES[i].re.test(texto)) return AMBIENTES[i];
    }
    return { id: 'neutro', acento: '#3ad6ff', cielo: '#0d2438', suelo: '#04070c', niebla: '#1d7fa0' };
  };

  UI.aplicarAmbiente = function (mundoNombre) {
    const a = UI.ambienteDe(mundoNombre);
    const r = document.documentElement;
    r.style.setProperty('--acento', a.acento);
    r.style.setProperty('--cielo', a.cielo);
    r.style.setProperty('--suelo', a.suelo);
    r.style.setProperty('--niebla', a.niebla);
    r.setAttribute('data-bioma', a.id);
    if (SW.aplicarFondo) SW.aplicarFondo(mundoNombre);
    return a;
  };

  /** filtro de pantalla y animaciones: se recuerdan entre partidas */
  UI.aplicarPreferencias = function () {
    const crt = localStorage.getItem('holovida_crt') !== 'no';
    document.body.classList.toggle('sin-crt', !crt);
    UI.sinAnimacion = localStorage.getItem('holovida_anim') === 'no';
    document.body.classList.toggle('sin-anim', !!UI.sinAnimacion);
  };

  UI.init = function () {
    UI.aplicarPreferencias();
    // los atajos se enganchan aquí y no en la partida: si no, Esc no
    // cerraba los diálogos abiertos desde la pantalla de inicio
    UI.bindTeclado();
    UI.app = $('#app');
    const hash = location.hash || '';
    if (hash.indexOf('#v=') === 0) { UI.pantallaCompartida(hash.slice(3)); return; }
    UI.pantallaInicio();
  };

  /* ============================================================
     INICIO
     ============================================================ */
  UI.pantallaInicio = function () {
    UI.herencia = null;
    document.body.classList.remove('en-juego');
    const m = SW.metricas();
    const guardada = UI.CLAVES.some(function (k) { return !!localStorage.getItem(k); });
    UI.app.innerHTML =
      '<div class="pantalla inicio"><div class="crt-frame">' +
      '<div class="logo">' +
      '<div class="logo-sub">SISTEMA DE SIMULACIÓN BIOGRÁFICA · MOD. 77-RX</div>' +
      '<h1>HOLO<span>VIDA</span></h1>' +
      '<div class="logo-line"></div>' +
      '<div class="logo-tag">una vida entera en una galaxia muy, muy lejana</div>' +
      '</div>' +
      '<div class="menu-inicio">' +
      '<button class="btn grande" data-a="crear">▸ NUEVA VIDA</button>' +
      (guardada ? '<button class="btn" data-a="ranuras">▸ CONTINUAR PARTIDA</button>' : '') +
      '<button class="btn" data-a="rapida">▸ VIDA ALEATORIA (rápida)</button>' +
      ((SW.leerSalon && SW.leerSalon().length)
        ? '<button class="btn" data-a="salon">▸ VIDAS ANTERIORES (' + SW.leerSalon().length + ')</button>' : '') +
      '<button class="btn fantasma" data-a="info">▸ ¿QUÉ ES ESTO?</button>' +
      '</div>' +
      '<div class="metricas">' +
      '<div><b>' + U.num(m.totalNodos) + '</b><span>decisiones posibles</span></div>' +
      '<div><b>' + U.num(m.totalEscenarios) + '</b><span>escenarios únicos</span></div>' +
      '<div><b>' + m.especies + '</b><span>especies</span></div>' +
      '<div><b>' + m.mundos + '</b><span>mundos</span></div>' +
      '<div><b>' + m.carreras + '</b><span>carreras</span></div>' +
      '<div><b>' + m.poderes + '</b><span>poderes</span></div>' +
      '</div>' +
      ((SW.reliquias && SW.reliquias().length)
        ? '<div class="reliquias-inicio">' + SW.reliquias().map(function (id) {
            const r = SW.RELIQUIAS[id];
            return r ? '<span title="' + U.esc(r.d) + '">' + r.ico + ' ' + U.esc(r.n) + '</span>' : '';
          }).join('') + '<em>lo que te llevaste de otra vida</em></div>'
        : '') +
      '<div class="disclaimer">Proyecto de fan sin ánimo de lucro. No afiliado a Lucasfilm ni a Disney.</div>' +
      '</div></div>';

    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'salon') { UI.salonFama(); return; }
      if (a === 'ranuras') { UI.menuRanuras(); return; }
      if (a === 'crear') UI.pantallaCrear();
      else if (a === 'rapida') UI.vidaRapida();
      else if (a === 'continuar') UI.cargarPartida();
      else if (a === 'info') UI.modalInfo();
    };
  };

  /** Elegir con qué vida a medias sigues. */
  UI.menuRanuras = function () {
    let h = '<div class="ranuras">';
    UI.CLAVES.forEach(function (k, i) {
      const d = UI.leerRanura(i);
      h += '<button class="btn ranura' + (d ? '' : ' fantasma') + '" data-ran="' + i + '"' +
        (d ? '' : ' disabled') + '>' +
        '<b>Ranura ' + (i + 1) + '</b>' +
        (d ? '<span>' + U.esc(d.nombre) + ' · ' + d.edad + ' años · ' + U.esc(d.mundo) +
             '<br>' + U.esc(String(d.era)) + '</span>'
           : '<span>vacía</span>') + '</button>';
    });
    h += '</div><p class="nota dim">Al empezar una vida nueva se te preguntará en qué ranura la guardas, ' +
      'así que ya no se pisa nada sin querer.</p>';
    UI.modal('CONTINUAR', h, null, function (root) {
      root.onclick = function (e) {
        const b = e.target.closest('[data-ran]');
        if (!b || b.disabled) return;
        UI.ranura = parseInt(b.dataset.ran, 10);
        UI.cerrarModal();
        UI.cargarPartida();
      };
    });
  };

  /* Las vidas anteriores, para poder compararte contigo mismo. */
  UI.salonFama = function () {
    const lista = SW.leerSalon ? SW.leerSalon() : [];
    let h = '';
    if (!lista.length) h = '<p class="nota">Todavía no has terminado ninguna vida. Vuelve cuando te hayas muerto una vez.</p>';
    else {
      h = '<div class="salon">';
      lista.forEach(function (v, i) {
        h += '<div class="salon-fila' + (v.ok ? ' logro' : '') + '">' +
          '<b>' + (i + 1) + '</b>' +
          '<div class="salon-id"><span class="salon-n">' + U.esc(v.n) + '</span>' +
          '<span class="salon-sub">' + U.esc(v.e) + ' · ' + U.esc(v.era) + '</span></div>' +
          '<div class="salon-datos">' +
            '<span>' + v.ed + ' años</span>' +
            '<span>' + U.cr(v.cr) + '</span>' +
            '<span>' + (v.tr || 0) + ' historias cerradas</span>' +
          '</div>' +
          '<div class="salon-amb">' + (v.amb ? (v.ok ? '✔ ' : '✕ ') + U.esc(v.amb) : '—') + '</div>' +
          '</div>';
      });
      h += '</div><button class="btn fantasma" data-m="borrar-salon">Vaciar el salón</button>';
    }
    UI.modal('VIDAS ANTERIORES', h, null, function (root) {
      root.onclick = function (e) {
        const b = e.target.closest('[data-m="borrar-salon"]');
        if (!b) return;
        if (SW.borrarSalon) SW.borrarSalon();
        UI.cerrarModal(); UI.salonFama();
      };
    });
  };

  UI.modalInfo = function () {
    const m = SW.metricas();
    UI.modal('¿QUÉ ES HOLOVIDA?',
      '<p>Un simulador de vida por turnos en una galaxia muy, muy lejana. Naces con casi nada: las estadísticas <b>crecen solas con la edad</b> hasta cierto punto, y de ahí para arriba solo se sube <b>decidiendo</b>.</p>' +
      '<p><b>Cada año</b> ocurren eventos automáticos y además eliges <b>una actividad</b> entre las disponibles para tu edad, tu especie y tu época.</p>' +
      '<p><b>La época manda.</b> No puedes presentarte al Templo Jedi durante la Purga, ni alistarte en el Gran Ejército si no eres un clon. Cada era tiene sus bandos, sus carreras y sus eventos.</p>' +
      '<p><b>Las heridas duran.</b> Un golpe fuerte deja una herida que baja tu salud máxima y tarda años en cerrar, o dinero en curarse. La salud se regenera sola, despacio.</p>' +
      '<p><b>Combate:</b> el rival telegrafía su postura. Agresivo rompe fintas, defensa castiga embestidas, la maniobra astuta abre guardias. Leerle importa más que pegar fuerte. Y siempre puedes <b>jugártela</b> a un pulso de reflejos.</p>' +
      '<p><b>Espacio de decisiones:</b> ' + U.num(m.nodosFijos) + ' opciones escritas a mano (' + m.plantillas + ' plantillas × escenarios variables) + ' + U.num(m.nodosGen) + ' generadas = <b>' + U.num(m.totalNodos) + '</b>.</p>',
      function () { UI.pantallaInicio(); });
  };

  /* ============================================================
     CREACIÓN
     ============================================================ */
  UI.pantallaCrear = function () {
    const rng = new SW.RNG('creador' + Date.now());
    const h = UI.herencia;                 // si vienes de una vida anterior
    const esp = h ? (SW.ESPECIES.filter(function (e) { return e.id === h.especie; })[0] || SW.ESPECIES[0]) : SW.ESPECIES[0];
    let nombre = SW.genNombreCompleto(rng, esp.id);
    if (h && h.apellido) nombre = nombre.split(' ')[0] + ' ' + h.apellido;
    UI.creador = {
      rng: rng,
      nombre: nombre,
      especie: esp.id,
      era: h ? h.era : 'rebelion',
      mundo: h ? h.mundo : rng.pick(esp.home),
      rasgo: 'ninguno',
      pronombre: 'él',
      ambicion: (SW.AMBICIONES[0] || {}).id,
      dificultad: 'normal',
      reliquia: null,
      semilla: '',
      apariencia: UI.aparienciaAleatoria(rng)
    };
    UI.renderCrear();
  };

  UI.aparienciaAleatoria = function (rng) {
    const A = SW.APARIENCIA;
    return {
      piel: rng.pick(A.piel), ojos: rng.pick(A.ojos), pelo: rng.pick(A.pelo),
      marca: rng.pick(A.marca), tocado: rng.pick(A.tocado), ropa: rng.pick(A.ropa),
      forma: rng.int(0, 3)
    };
  };

  /** ajusta era y mundo si la especie los restringe */
  UI.coherenciaCreador = function () {
    const c = UI.creador;
    const esp = SW.ESPECIES.filter(function (e) { return e.id === c.especie; })[0];
    if (esp.soloEra && esp.soloEra.indexOf(c.era) < 0) c.era = esp.soloEra[0];
    if (esp.home.indexOf(c.mundo) < 0) c.mundo = esp.home[0];
    return esp;
  };

  UI.renderCrear = function () {
    const c = UI.creador;
    const esp = UI.coherenciaCreador();
    const era = SW.ERAS.filter(function (e) { return e.id === c.era; })[0];
    const rasgo = SW.RASGOS.filter(function (r) { return r.id === c.rasgo; })[0];

    let h = '<div class="pantalla crear"><div class="crt-frame ancho">';
    h += '<div class="cab"><h2>FICHA DE ORIGEN</h2><button class="btn mini" data-a="volver">◂ volver</button></div>';
    h += '<div class="crear-grid">';

    h += '<div class="col-retrato">';
    h += '<div class="holo-marco">' + SW.retrato(c.apariencia, 190, c.especie) + '</div>';
    h += '<button class="btn mini bloque" data-a="rand-cara">⟳ generar aspecto</button>';
    h += '<div class="ap-controles">';

    /* colores: muestras que se tocan, no desplegables */
    [['piel', 'Piel'], ['ojos', 'Ojos'], ['pelo', 'Pelo']].forEach(function (par) {
      const k = par[0];
      h += '<div class="ap-grupo"><label class="ap-lab">' + par[1] +
        ' <span class="dim">' + U.esc(SW.NOMBRE_COLOR[c.apariencia[k]] || c.apariencia[k]) + '</span></label>' +
        '<div class="muestras">';
      SW.APARIENCIA[k].forEach(function (o) {
        const activo = c.apariencia[k] === o;
        if (o === 'ninguno') {
          h += '<button class="muestra sin' + (activo ? ' on' : '') + '" data-apv="' + k + '|' + U.esc(o) + '" title="sin pelo">∅</button>';
        } else {
          h += '<button class="muestra' + (activo ? ' on' : '') + '" style="background:' + o + '" data-apv="' + k + '|' + U.esc(o) + '" title="' + U.esc(SW.NOMBRE_COLOR[o] || o) + '"></button>';
        }
      });
      h += '</div></div>';
    });

    /* cráneo: cuatro siluetas en botones grandes */
    h += '<div class="ap-grupo"><label class="ap-lab">Cráneo</label><div class="ap-fila">';
    [0, 1, 2, 3].forEach(function (i) {
      h += '<button class="ap-btn' + (c.apariencia.forma === i ? ' on' : '') + '" data-apv="forma|' + i + '">' +
        ['◍', '◆', '▣', '⬟'][i] + '</button>';
    });
    h += '</div></div>';

    /* el resto, en carrusel de flechas: en móvil es mucho más cómodo */
    [['marca', 'Marcas'], ['tocado', 'Tocado'], ['ropa', 'Ropa']].forEach(function (par) {
      const k = par[0];
      h += '<div class="ap-grupo"><label class="ap-lab">' + par[1] + '</label>' +
        '<div class="ap-carrusel">' +
        '<button class="ap-flecha" data-apciclo="' + k + '|-1">◂</button>' +
        '<span class="ap-valor">' + U.esc(c.apariencia[k]) + '</span>' +
        '<button class="ap-flecha" data-apciclo="' + k + '|1">▸</button>' +
        '</div></div>';
    });

    h += '</div></div>';

    h += '<div class="col-datos">';
    h += '<label class="campo">NOMBRE<div class="fila"><input id="in-nombre" value="' + U.esc(c.nombre) + '" maxlength="34"><button class="btn mini" data-a="rand-nombre">⟳</button></div></label>';
    h += '<label class="campo">TRATAMIENTO<select data-set="pronombre">' +
      ['él', 'ella'].map(function (p) { return '<option value="' + p + '"' + (c.pronombre === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label>';

    h += '<div class="campo"><span class="campo-cab">ESPECIE <span class="dim">(' + SW.ESPECIES.length + ')</span>' +
      '<button class="btn mini dado" data-rand="especie">⟳ al azar</button></span><div class="chips">';
    SW.ESPECIES.forEach(function (e) {
      h += '<button class="chip' + (e.id === c.especie ? ' on' : '') + '" data-esp="' + e.id + '">' + U.esc(e.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(esp.rasgo) + ' <span class="dim">· esperanza de vida ~' + esp.vida + ' años' +
      (esp.ritmo > 1 ? ' · envejece ×' + esp.ritmo : '') + '</span></p></div>';

    h += '<div class="campo"><span class="campo-cab">ERA<button class="btn mini dado" data-rand="era">⟳ al azar</button></span><div class="chips">';
    SW.ERAS.forEach(function (e) {
      const bloq = esp.soloEra && esp.soloEra.indexOf(e.id) < 0;
      h += '<button class="chip' + (e.id === c.era ? ' on' : '') + (bloq ? ' bloq' : '') + '" data-era="' + e.id + '"' + (bloq ? ' disabled' : '') + '>' + U.esc(e.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(era.desc) +
      (SW.ANIO_ERA && SW.ANIO_ERA[era.id] != null
        ? ' <b class="dim">Naces en ' + SW.formatoAnio(SW.ANIO_ERA[era.id]) +
          ', así que la vives de joven.</b>' : '') + ' <span class="dim">(' + era.y + ')</span>' +
      (esp.soloEra ? '<br><span class="aviso">Esta especie solo existe en: ' + esp.soloEra.map(function (i) { return SW.ERAS.filter(function (x) { return x.id === i; })[0].n; }).join(', ') + '.</span>' : '') +
      '</p></div>';

    h += '<label class="campo"><span class="campo-cab">MUNDO NATAL<button class="btn mini dado" data-rand="mundo">⟳ al azar</button></span><select data-set="mundo">';
    const mundos = esp.soloEra ? esp.home : esp.home.concat(SW.MUNDO_NOMBRES.filter(function (m) { return esp.home.indexOf(m) < 0; }));
    mundos.forEach(function (m) {
      h += '<option value="' + U.esc(m) + '"' + (c.mundo === m ? ' selected' : '') + '>' + U.esc(m) + ' — ' + U.esc(SW.mundo(m).r) + '</option>';
    });
    h += '</select><p class="nota">' + U.esc(SW.mundo(c.mundo).vibe) + '</p></label>';

    h += '<div class="campo"><span class="campo-cab">ORIGEN<button class="btn mini dado" data-rand="rasgo">⟳ al azar</button></span><div class="chips">';
    SW.RASGOS.forEach(function (r) {
      h += '<button class="chip' + (r.id === c.rasgo ? ' on' : '') + '" data-rasgo="' + r.id + '">' + U.esc(r.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(rasgo.desc) + '</p></div>';

    /* Qué querías conseguir con esta vida: se te recuerda en la ficha
       y se te dice al final si lo lograste. */
    const amb = SW.AMBICIONES.filter(function (a) { return a.id === c.ambicion; })[0] || SW.AMBICIONES[0];
    h += '<div class="bloque"><h3>AMBICIÓN</h3><div class="chips">';
    SW.AMBICIONES.forEach(function (a) {
      h += '<button class="chip' + (a.id === c.ambicion ? ' on' : '') + '" data-amb="' + a.id + '">' + U.esc(a.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(amb.d) + '</p></div>';

    const dif = SW.DIFICULTADES.filter(function (x) { return x.id === c.dificultad; })[0] || SW.DIFICULTADES[1];
    h += '<div class="bloque"><h3>DIFICULTAD</h3><div class="chips">';
    SW.DIFICULTADES.forEach(function (x) {
      h += '<button class="chip' + (x.id === c.dificultad ? ' on' : '') + '" data-dif="' + x.id + '">' + U.esc(x.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(dif.d) + '</p></div>';

    /* Reliquias: lo que te llevaste de una vida anterior. Sólo aparece
       si alguna vez conseguiste algo que sobreviviera a tu personaje. */
    const rel = SW.reliquias ? SW.reliquias() : [];
    if (rel.length) {
      h += '<div class="bloque reliquias"><h3>RELIQUIA</h3><div class="chips">' +
        '<button class="chip' + (!c.reliquia ? ' on' : '') + '" data-rel="">Ninguna</button>';
      rel.forEach(function (id) {
        const r = SW.RELIQUIAS[id];
        if (!r) return;
        h += '<button class="chip rel' + (c.reliquia === id ? ' on' : '') + '" data-rel="' + U.esc(id) + '">' +
          r.ico + ' ' + U.esc(r.n) + '</button>';
      });
      const rr = c.reliquia && SW.RELIQUIAS[c.reliquia];
      h += '</div><p class="nota">' + (rr ? U.esc(rr.d) + ' <b>' + U.esc(rr.efecto) + '</b>'
        : 'Empiezas con las manos vacías, como todo el mundo.') + '</p></div>';
    }

    h += '<label class="campo">SEMILLA <span class="dim">(opcional — misma semilla, misma vida)</span><input id="in-semilla" value="' + U.esc(c.semilla) + '" placeholder="dejar vacío = azar"></label>';
    h += '<div class="acciones"><button class="btn grande" data-a="empezar">▸ EMPEZAR VIDA</button>' +
      '<button class="btn fantasma" data-a="rand-todo">⟳ todo al azar</button></div>' +
      '<p class="nota dim">Cada apartado tiene su propio ⟳: puedes tirar los dados solo para la especie, la era, el mundo o el origen y diseñar el resto a mano.</p>';
    h += '</div></div></div></div>';

    UI.app.innerHTML = h;
    UI.bindCrear();
  };

  UI.bindCrear = function () {
    const c = UI.creador;
    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a],[data-esp],[data-era],[data-rasgo],[data-apv],[data-apciclo],[data-rand],[data-amb],[data-dif],[data-rel]');
      if (!b || b.disabled) return;
      UI.leerCampos();
      if (b.dataset.rand) {
        const rng = c.rng, q = b.dataset.rand;
        if (q === 'especie') {
          const esp = rng.pick(SW.ESPECIES);
          c.especie = esp.id;
          if (esp.soloEra) c.era = rng.pick(esp.soloEra);
          c.mundo = rng.pick(esp.home);
          c.nombre = SW.genNombreCompleto(rng, esp.id);
        } else if (q === 'era') {
          const esp0 = SW.ESPECIES.filter(function (x) { return x.id === c.especie; })[0];
          c.era = esp0.soloEra ? rng.pick(esp0.soloEra) : rng.pick(SW.ERAS).id;
        } else if (q === 'mundo') {
          const esp0 = SW.ESPECIES.filter(function (x) { return x.id === c.especie; })[0];
          c.mundo = esp0.soloEra ? rng.pick(esp0.home) : rng.pick(SW.MUNDO_NOMBRES);
        } else if (q === 'rasgo') {
          c.rasgo = rng.weighted(SW.RASGOS).id;
        }
        UI.renderCrear(); return;
      }
      if (b.dataset.apv) {
        const par = b.dataset.apv.split('|');
        c.apariencia[par[0]] = par[0] === 'forma' ? parseInt(par[1], 10) : par[1];
        UI.renderCrear(); return;
      }
      if (b.dataset.apciclo) {
        const par = b.dataset.apciclo.split('|');
        const lista = SW.APARIENCIA[par[0]];
        const i = lista.indexOf(c.apariencia[par[0]]);
        const n = (i + parseInt(par[1], 10) + lista.length) % lista.length;
        c.apariencia[par[0]] = lista[n];
        UI.renderCrear(); return;
      }
      if (b.dataset.esp) {
        c.especie = b.dataset.esp;
        UI.coherenciaCreador();
        c.nombre = SW.genNombreCompleto(c.rng, c.especie);
        UI.renderCrear(); return;
      }
      if (b.dataset.era) { c.era = b.dataset.era; UI.renderCrear(); return; }
      if (b.dataset.rasgo) { c.rasgo = b.dataset.rasgo; UI.renderCrear(); return; }
      const a = b.dataset.a;
      if (a === 'volver') { UI.pantallaInicio(); return; }
      if (a === 'rand-cara') { c.apariencia = UI.aparienciaAleatoria(c.rng); UI.renderCrear(); return; }
      if (b.dataset.amb) { c.ambicion = b.dataset.amb; UI.renderCrear(); return; }
      if (b.dataset.dif) { c.dificultad = b.dataset.dif; UI.renderCrear(); return; }
      if (b.dataset.rel != null) { c.reliquia = b.dataset.rel || null; UI.renderCrear(); return; }
      if (a === 'rand-nombre') { c.nombre = SW.genNombreCompleto(c.rng, c.especie); UI.renderCrear(); return; }
      if (a === 'rand-todo') {
        const rng = c.rng;
        const esp = rng.pick(SW.ESPECIES);
        c.especie = esp.id;
        c.era = esp.soloEra ? rng.pick(esp.soloEra) : rng.pick(SW.ERAS).id;
        c.mundo = rng.pick(esp.home);
        c.rasgo = rng.weighted(SW.RASGOS).id;
        c.nombre = SW.genNombreCompleto(rng, esp.id);
        c.apariencia = UI.aparienciaAleatoria(rng);
        UI.renderCrear(); return;
      }
      if (a === 'empezar') { UI.empezar(); return; }
    };
    UI.app.onchange = function (e) {
      const t = e.target;
      UI.leerCampos();
      if (t.dataset.ap) {
        c.apariencia[t.dataset.ap] = t.dataset.ap === 'forma' ? parseInt(t.value, 10) : t.value;
        UI.renderCrear();
      } else if (t.dataset.set) {
        c[t.dataset.set] = t.value;
        UI.renderCrear();
      }
    };
  };

  UI.leerCampos = function () {
    const n = $('#in-nombre'), s = $('#in-semilla');
    if (n) UI.creador.nombre = n.value.trim() || UI.creador.nombre;
    if (s) UI.creador.semilla = s.value.trim();
  };

  UI.empezar = function () {
    const c = UI.creador;
    /* Se busca ranura libre antes de nada: empezar una vida ya no
       borra la que tenías a medias. Si están las tres llenas, se usa
       la que estés mirando. */
    const libre = UI.CLAVES.findIndex(function (k) { return !localStorage.getItem(k); });
    if (libre >= 0) UI.ranura = libre;
    const esp = SW.ESPECIES.filter(function (e) { return e.id === c.especie; })[0];
    const era = SW.ERAS.filter(function (e) { return e.id === c.era; })[0];
    const rasgo = SW.RASGOS.filter(function (r) { return r.id === c.rasgo; })[0];
    UI.juego = new SW.Game({
      semilla: c.semilla || (c.nombre + ':' + Date.now() + ':' + Math.random()),
      nombre: c.nombre, especie: esp, era: era, mundo: c.mundo,
      rasgo: rasgo, apariencia: c.apariencia, pronombre: c.pronombre,
      ambicion: c.ambicion, dificultad: c.dificultad
    });
    UI.app.onchange = null;
    // la sangre pesa: dinero, nombre, reputación y un talento heredados
    if (UI.herencia && SW.aplicarHerencia) { SW.aplicarHerencia(UI.juego, UI.herencia); UI.herencia = null; }
    // lo que te llevaste de una vida anterior
    if (c.reliquia && SW.ponerReliquia) SW.ponerReliquia(UI.juego, c.reliquia);
    UI.renderJuego();
  };

  UI.vidaRapida = function () {
    const rng = new SW.RNG('rapida' + Date.now() + Math.random());
    const esp = rng.pick(SW.ESPECIES);
    const era = esp.soloEra ? SW.ERAS.filter(function (e) { return esp.soloEra.indexOf(e.id) >= 0; })[0] : rng.pick(SW.ERAS);
    UI.juego = new SW.Game({
      semilla: 'r' + Date.now() + Math.random(),
      nombre: SW.genNombreCompleto(rng, esp.id),
      especie: esp, era: era, mundo: rng.pick(esp.home),
      rasgo: rng.weighted(SW.RASGOS),
      apariencia: UI.aparienciaAleatoria(rng),
      pronombre: 'él'
    });
    UI.app.onchange = null;
    UI.renderJuego();
  };

  /* ============================================================
     JUEGO
     ============================================================ */
  UI.renderJuego = function () {
    const g = UI.juego, s = g.s;
    document.body.classList.add('en-juego');
    if (s.muerto && !g.cola.length) { UI.pantallaFin(); return; }

    const m = SW.mundo(s.mundo);
    const amb = UI.aplicarAmbiente(s.mundo);
    let h = '<div class="hud">';

    /* --- barra superior: siempre visible --- */
    h += '<header class="topbar">' +
      '<button class="btn mini tb-ficha solo-movil" data-a="ficha" title="ficha">☰</button>' +
      '<div class="tb-id"><b>' + U.esc(s.nombre) + '</b><span>' + U.esc(s.especieN) + '</span></div>' +
      '<div class="tb-edad"><b>' + s.edad + '</b><span>' +
        (SW.anioGalactico && SW.anioGalactico(s) != null
          ? SW.formatoAnio(SW.anioGalactico(s))
          : (s.ritmo > 1 ? 'años · asp. ' + s.edadBio : 'años')) + '</span></div>' +
      '<div class="tb-mundo"><b><i class="bioma-punto"></i>' +
        U.esc(SW.nombreDeMundo ? SW.nombreDeMundo(s, s.mundo) : s.mundo) + '</b><span>' + U.esc(m.r) + '</span></div>' +
      '<div class="tb-cr"><b>' + U.cr(s.stats.creditos) + '</b><span>créditos</span></div>' +
      '<div class="tb-acc"><b>' + UI.pips(s) + '</b><span>acciones</span></div>' +
      UI.tbAvisos(s) +
      '<div class="tb-mini">' + UI.miniBarras(s) + '</div>' +
      '<button class="btn mini tb-mapa" data-a="mapa" title="carta estelar">◎</button>' +
      '<button class="btn mini tb-menu" data-a="menu" title="menú">≡</button>' +
      '</header>';

    h += '<div class="cuerpo">';
    h += '<aside class="panel" id="panel">' +
      '<div class="panel-cab solo-movil"><span>FICHA DE ' + U.esc(s.nombre.toUpperCase()) + '</span>' +
      '<button class="btn mini" data-a="ficha">✕</button></div>' +
      UI.htmlPanel(s) + '<div class="panel-fin">— fin de la ficha —</div></aside>';
    h += '<main class="consola" id="consola">' +
         '<div class="escena" id="escena"><div class="escena-pie">' +
         '<b>' + U.esc(s.mundo) + '</b><span>' + U.esc(SW.mundo(s.mundo).vibe || '') + '</span></div></div>' +
         UI.htmlConsola() + '</main>';
    h += '</div>';

    /* --- barra inferior --- */
    h += '<footer class="acciones-bar">';
    if (g.cola.length) {
      h += '<div class="hint">Resuelve la situación para continuar…</div>';
    } else if (s.muerto) {
      h += '<button class="btn grande" data-a="fin">▸ VER RESUMEN DE VIDA</button>';
    } else {
      h += '<div class="acts">';
      const sinTiempo = s.acciones <= 0;
      g.menuActividades().forEach(function (a) {
        h += '<button class="act' + (sinTiempo ? ' off' : '') + '" data-act="' + a.id + '" title="' + U.esc(a.desc) + '">' +
          '<i>' + a.ico + '</i><span>' + U.esc(a.n) + '</span></button>';
      });
      h += '</div>';
      h += '<button class="btn grande avanzar" data-a="avanzar">▸ AÑO ' + (s.edad + 1) +
        (s.acciones > 0 ? ' <em>(te quedan ' + s.acciones + ')</em>' : '') + '</button>';
      h += '<p class="atajos">1-9 elegir · <b>Enter</b> avanzar · <b>R</b> repetir ' +
        (UI.ultimaActividad ? U.esc(UI.ultimaActividad) : 'lo último') + ' · <b>M</b> mapa · <b>F</b> ficha</p>';
    }
    h += '</footer></div>';

    UI.app.innerHTML = h;
    if (g.abrirMapaViaje) { g.abrirMapaViaje = false; UI.bindJuego(); UI.abrirMapa(true); return; }
    if (g.cola.length) UI.mostrarEvento();
    UI.mostrarPopup();
    const cons = $('#consola');
    if (cons) cons.scrollTop = cons.scrollHeight;
    UI.bindJuego();
    UI.guardarPartida();
  };

  /** avisos de la barra: guerra en curso y racha. Lo que cambia el año. */
  UI.tbAvisos = function (s) {
    let h = '';
    if (SW.guerraActiva && SW.guerraActiva(s)) {
      const w = s.guerra;
      h += '<div class="tb-aviso guerra" title="' + U.esc(w.n) + ' · frente en ' + U.esc(w.frente) + '">' +
        '<b>⚔ ' + U.esc(w.frente) + '</b><span>' + (SW.frenteAqui(s) ? 'estás en el frente' : 'frente') + '</span></div>';
    }
    const r = SW.etiquetaRacha ? SW.etiquetaRacha(s) : null;
    if (r) h += '<div class="tb-aviso racha ' + r.c + '"><b>' + (r.c === 'buena' ? '▲' : '▼') + ' ' + r.t + '</b><span>racha</span></div>';
    if (s.mision) h += '<div class="tb-aviso mision" title="misión de la Orden en ' + U.esc(s.mision.mundo) + '"><b>✷ misión</b><span>' + U.esc(s.mision.mundo) + '</span></div>';
    if (s.caza) h += '<div class="tb-aviso caza" title="expediente abierto en ' + U.esc(s.caza.mundo) + '"><b>⌖ caza</b><span>' + U.esc(s.caza.mundo) + '</span></div>';
    if (s.contrato) h += '<div class="tb-aviso contrato" title="contrato del Gremio: ' + U.esc(s.contrato.nombre) + '"><b>✵ contrato</b><span>' + U.esc(s.contrato.destino) + '</span></div>';
    if (s.leyenda) h += '<div class="tb-aviso leyenda" title="encargo de leyenda: ' + U.esc(s.leyenda.n) + '"><b>✦ encargo</b><span>de leyenda</span></div>';
    if (s.carga) h += '<div class="tb-aviso carga' + (s.carga.ilegal ? ' ilegal' : '') + '" title="en bodega: ' + U.esc(s.carga.n) + '"><b>▣ bodega</b><span>' + (s.carga.ilegal ? 'ilegal' : 'carga') + '</span></div>';
    /* La atención de Vader: cada jedi que cierras llena un poco más la
       barra. Cuando se llena, baja él. */
    if (SW.esInquisidor && SW.esInquisidor(s)) {
      const v = SW.amenazaVader(s);
      h += '<div class="tb-aviso vader' + (v >= 100 ? ' lleno' : v >= 60 ? ' alto' : '') +
        '" title="Atención de Darth Vader: ' + v + '%">' +
        '<span class="casco-vader" aria-hidden="true"></span>' +
        '<div class="vader-col"><b>' + v + '%</b>' +
        '<div class="vader-barra"><i style="width:' + v + '%"></i></div></div></div>';
    }
    // la barra es una rejilla con áreas con nombre: sin envoltorio, esto
    // se colocaría solo en la primera casilla y se comería el nombre
    return h ? '<div class="tb-avisos">' + h + '</div>' : '';
  };

  UI.pips = function (s) {
    let h = '';
    for (let i = 0; i < s.accionesMax; i++) h += '<i class="pip' + (i < s.acciones ? ' on' : '') + '"></i>';
    return h;
  };

  /** micro-barras de la topbar, para no depender del panel */
  UI.miniBarras = function (s) {
    const items = [['salud', 'SAL', '#6aff8a'], ['fisico', 'FIS', '#ffb03a'], ['destreza', 'DES', '#3ad6ff'], ['cordura', 'COR', '#c98aff']];
    if (s.sensible) items.push(['fuerza', 'FZA', '#ffffff']);
    return items.map(function (p) {
      return '<span class="mb" title="' + p[0] + '"><i>' + p[1] + '</i>' +
        '<b style="--w:' + s.stats[p[0]] + '%;--c:' + p[2] + '"></b>' +
        '<u>' + s.stats[p[0]] + '</u></span>';
    }).join('');
  };

  UI.htmlPanel = function (s) {
    // la cara envejece con el personaje
    const ap = Object.assign({}, s.apariencia || {}, { edad: s.edadBio });
    let h = '<div class="holo-mini">' + SW.retrato(ap, 116, s.especie) + '</div>';
    // lo primero de la ficha: lo que tienes abierto ahora mismo
    if (SW.htmlAsuntos) h += SW.htmlAsuntos(s);

    /* Para qué sirve cada número. Estaban ahí sin explicar y había que
       adivinar si conviene subir carisma o intelecto. */
    const PARAQUE = {
      salud: 'Si llega a cero, te mueres. Baja con las heridas y con los años.',
      fisico: 'Pega más fuerte y aguanta más en las peleas y en el frente.',
      destreza: 'Puntería, reflejos y pilotar. Manda en los minijuegos.',
      intelecto: 'Abre opciones de pensar en vez de pelear, y sube el sueldo.',
      carisma: 'Convencer, negociar y caer bien. La vía sin sangre.',
      cordura: 'Aguantar lo que has visto. Si se hunde, la salud se va detrás.',
      suerte: 'Inclina los resultados dudosos. La racha la mueve arriba y abajo.',
      reputacion: 'Lo que la gente decente piensa de ti. Abre puertas legales.',
      notoriedad: 'Lo que se cuenta de ti en los bajos fondos. Abre las otras.'
    };
    h += '<div class="stats">';
    [['salud', 'Salud'], ['fisico', 'Físico'], ['destreza', 'Destreza'], ['intelecto', 'Intelecto'],
     ['carisma', 'Carisma'], ['cordura', 'Cordura'], ['suerte', 'Suerte'],
     ['reputacion', 'Reputación'], ['notoriedad', 'Notoriedad']
    ].forEach(function (p) {
      h += '<div class="stat s-' + p[0] + '" title="' + U.esc(PARAQUE[p[0]] || '') + '">' +
        '<span>' + p[1] + '</span><div class="barra"><i style="width:' + s.stats[p[0]] + '%"></i></div><b>' + s.stats[p[0]] + '</b></div>';
    });
    h += '</div>';

    h += '<div class="fuerza-box' + (s.sensible ? ' on' : '') + '">' +
      '<span>✦ La Fuerza</span>' +
      (s.sensible
        ? '<div class="barra"><i style="width:' + s.stats.fuerza + '%"></i></div><b>' + s.stats.fuerza + '</b>'
        : '<em>no sensible</em>') +
      '</div>';

    if (SW.cumpleAmbicion) {
      const amb = SW.cumpleAmbicion(s);
      if (amb) {
        h += '<div class="ficha ambicion' + (amb.ok ? ' hecha' : '') + '"><h4>Lo que querías</h4>' +
          '<div class="amb-n">' + (amb.ok ? '✔ ' : '◌ ') + U.esc(amb.n) + '</div>' +
          '<div class="amb-m">' + U.esc(amb.medida) + '</div></div>';
      }
    }

    const al = s.stats.alineamiento;
    h += '<div class="align"><span>Alineamiento</span><div class="align-barra"><i style="left:' + ((al + 100) / 2) + '%"></i></div><b>' + SW.etiquetaAlineamiento(al) + '</b></div>';

    if (s.heridas.length) {
      h += '<div class="ficha heridas"><h4>Heridas abiertas</h4>';
      s.heridas.forEach(function (x) {
        h += '<div class="f-row alerta"><span>' + U.esc(x.n) + '</span><b>−' + x.sev + '</b></div>';
      });
      h += '<div class="f-row"><span>Salud máxima</span><b>' + SW.saludMax(s) + '</b></div></div>';
    }

    h += '<div class="ficha">';
    h += '<div class="f-row"><span>Ubicación</span><b>' + U.esc(s.mundo) + '</b></div>';
    h += '<div class="f-row"><span>Región</span><b>' + U.esc(SW.mundo(s.mundo).r) + '</b></div>';
    if (s.bando) { const f = SW.faccion(s.bando); h += '<div class="f-row"><span>Bando</span><b>' + U.esc(f ? f.n : s.bando) + '</b></div>'; }
    if (s.trabajo) h += '<div class="f-row"><span>Trabajo</span><b>' + U.esc(s.rango) + '</b></div>';
    if (s.sueldo) h += '<div class="f-row"><span>Sueldo</span><b>' + U.cr(s.sueldo) + '</b></div>';
    if (s.nave) h += '<div class="f-row"><span>Nave</span><b>' + U.esc(s.naveNombre || s.nave.n) + ' (' + s.naveEstado + '%)</b></div>';
    if (s.sable) h += '<div class="f-row"><span>Sable</span><b style="color:' + s.sable.hex + '">' + U.esc(s.sable.color) + ' · ' + U.esc(s.sable.forma) + '</b></div>';
    if (s.kyber && !s.sable) h += '<div class="f-row"><span>Cristal</span><b>' + U.esc(s.kyber.c) + '</b></div>';
    if (s.droide) h += '<div class="f-row"><span>Droide</span><b>' + U.esc(s.droide.nombre) + '</b></div>';
    if (s.mascota) h += '<div class="f-row"><span>Mascota</span><b>' + U.esc(s.mascota.nombre) + '</b></div>';
    if (s.carcelAños) h += '<div class="f-row alerta"><span>Prisión</span><b>' + s.carcelAños + ' años</b></div>';
    h += '<div class="f-row"><span>Mundos</span><b>' + s.contadores.mundosVisitados + '</b></div>';
    h += '</div>';

    if (s.habilidades.length || s.poderes.length) {
      h += '<div class="ficha"><h4>Repertorio</h4><p class="mini-lista">' +
        s.habilidades.map(function (x) { return '<span class="tag mini">' + U.esc(x) + '</span>'; }).join('') +
        s.poderes.map(function (p) {
          const P = SW.PODERES.filter(function (x) { return x.id === p; })[0];
          return '<span class="tag mini fz">' + U.esc(P ? P.n : p) + '</span>';
        }).join('') + '</p></div>';
    }

    if (s.conocidos && s.conocidos.length) {
      h += '<div class="ficha"><h4>Te has cruzado con</h4><p class="mini-lista">' +
        s.conocidos.map(function (n) { return '<span class="tag mini canon">' + U.esc(n) + '</span>'; }).join('') +
        '</p></div>';
    }

    /* --- hilos largos: lo que llevas abierto y lo que cerraste --- */
    if (SW.tramasDe) {
      const tr = SW.tramasDe(s);
      if (tr.length) {
        const vivas = tr.filter(function (x) { return !x.cerrada; });
        const hechas = tr.filter(function (x) { return x.cerrada; });
        h += '<div class="ficha tramas"><h4>Tu historia</h4>';
        vivas.forEach(function (x) {
          const pct = Math.round((x.etapa / Math.max(1, x.total)) * 100);
          h += '<div class="trama viva"><b>' + x.ico + ' ' + U.esc(x.n) + '</b>' +
            '<span class="trama-sub">' + U.esc(x.resumen) + '</span>' +
            '<span class="trama-años">desde los ' + x.desde + '</span>' +
            '<i style="width:' + pct + '%"></i></div>';
        });
        hechas.forEach(function (x) {
          h += '<div class="trama hecha"><b>' + x.ico + ' ' + U.esc(x.n) + '</b>' +
            '<span class="trama-sub">' + U.esc(x.final || '') + '</span>' +
            '<span class="trama-años">' + x.desde + '–' + (x.hasta != null ? x.hasta : '?') + '</span></div>';
        });
        h += '</div>';
      }
    }

    /* --- talentos --- */
    if (SW.TALENTOS && (s.talentos || []).length) {
      h += '<div class="ficha"><h4>Se te da bien</h4><p class="mini-lista">' +
        s.talentos.map(function (id) {
          const T = SW.TALENTOS.filter(function (x) { return x.id === id; })[0];
          return '<span class="tag mini tal" title="' + U.esc(T ? T.d : '') + '">' + U.esc(T ? T.n : id) + '</span>';
        }).join('') + '</p></div>';
    }

    /* --- cómo te ven las facciones --- */
    if (SW.prestigioDe) {
      const pr = SW.prestigioDe(s);
      if (pr.length) {
        h += '<div class="ficha facs"><h4>Quién te debe qué</h4>';
        pr.forEach(function (f) {
          h += '<div class="fac"><span>' + U.esc(f.n) + '</span>' +
            '<div class="fac-barra"><i class="' + (f.v >= 0 ? 'pos' : 'neg') + '" style="width:' + Math.abs(f.v) / 2 + '%"></i></div>' +
            '<em>' + U.esc(SW.etiquetaPrestigio(f.v)) + '</em></div>';
        });
        h += '</div>';
      }
    }

    /* --- hitos --- */
    if (s.hitos && s.hitos.length) {
      h += '<div class="ficha hitos"><h4>Hitos (' + s.hitos.length + ')</h4>';
      s.hitos.slice(-10).reverse().forEach(function (x) {
        h += '<div class="hito-row"><b>' + x.edad + '</b><span>' + U.esc(x.txt) + '</span></div>';
      });
      h += '</div>';
    }

    if (s.relaciones.length) {
      h += '<div class="ficha rels"><h4>Gente (' + s.relaciones.length + ')</h4>';
      s.relaciones.slice(-12).forEach(function (r) {
        h += '<div class="rel' + (r.canon ? ' canon' : '') + '">' +
          '<b>' + U.esc(r.nombre) + '</b>' +
          '<span class="rel-tipo">' + U.esc(r.tipo) + '</span>' +
          (r.quien ? '<span class="rel-quien">(' + U.esc(r.quien) + ')</span>' : '') +
          '<i class="' + (r.afecto >= 0 ? 'pos' : 'neg') + '" style="width:' + Math.abs(r.afecto) / 2 + '%"></i></div>';
      });
      h += '</div>';
    }
    return h;
  };

  /** en qué momento de la vida estás: tiñe el log y da contexto */
  UI.etapaVital = function (e) {
    if (e <= 5) return { c: 'cuna', n: 'infancia' };
    if (e <= 12) return { c: 'niñez', n: 'niñez' };
    if (e <= 19) return { c: 'juventud', n: 'juventud' };
    if (e <= 35) return { c: 'adulto', n: 'adulto joven' };
    if (e <= 55) return { c: 'madurez', n: 'madurez' };
    if (e <= 70) return { c: 'mayor', n: 'ya mayor' };
    return { c: 'vejez', n: 'vejez' };
  };

  /* Con trescientas líneas por vida, encontrar «cuándo conocí a este»
     era imposible. Filtro por tipo, que se recuerda entre repintados. */
  UI.FILTROS = [
    { id: 'todo', n: 'Todo', tipos: null },
    { id: 'clave', n: 'Lo importante', tipos: ['nac', 'muerte', 'hito', 'res', 'bien', 'mal'] },
    { id: 'gente', n: 'Gente', tipos: ['rel'] },
    { id: 'dinero', n: 'Dinero', tipos: ['cr'] },
    { id: 'viajes', n: 'Viajes', tipos: ['viaje'] }
  ];
  UI.filtro = UI.filtro || 'todo';

  UI.htmlFiltros = function () {
    return '<div class="log-filtros">' + UI.FILTROS.map(function (f) {
      return '<button class="lf' + (UI.filtro === f.id ? ' on' : '') + '" data-lf="' + f.id + '">' + f.n + '</button>';
    }).join('') + '</div>';
  };

  UI.htmlConsola = function () {
    const s = UI.juego.s;
    const filtro = UI.FILTROS.filter(function (f) { return f.id === UI.filtro; })[0] || UI.FILTROS[0];
    let h = UI.htmlFiltros();
    let ultimaEdad = -1;
    let etapaPrev = null;
    const lineas = filtro.tipos
      ? s.historia.filter(function (l) { return filtro.tipos.indexOf(l.tipo) >= 0; })
      : s.historia;
    lineas.slice(-90).forEach(function (l) {
      if (l.edad !== ultimaEdad) {
        const et = UI.etapaVital(l.edad);
        const cambio = etapaPrev !== et.c;
        h += '<div class="año e-' + et.c + (cambio ? ' cambio' : '') + '">' +
          '<span>' + (l.edad === 0 ? 'AÑO 0' : 'AÑO ' + l.edad) + '</span>' +
          (cambio ? '<em>' + et.n + '</em>' : '') + '</div>';
        ultimaEdad = l.edad;
        etapaPrev = et.c;
      }
      h += '<p class="l l-' + l.tipo + ' e-' + UI.etapaVital(l.edad).c + '">' + l.txt + '</p>';
    });
    return h;
  };

  /* ============================================================
     MAPA DE LA GALAXIA
     Arrastra para moverte, rueda para acercar, pulsa un mundo
     para verlo. Si pulsas donde estás, se abre en grande.
     ============================================================ */
  UI.abrirMapa = function (modoViaje) {
    const g = UI.juego, s = g.s;
    UI.pararMapa();

    const cont = document.createElement('div');
    cont.className = 'mapa-overlay';
    cont.innerHTML =
      '<div class="mapa-marco">' +
      '<div class="mapa-cab">' +
      '<h3>CARTA ESTELAR</h3>' +
      '<span class="mapa-ayuda">arrastra para moverte · rueda para acercar · pulsa un mundo</span>' +
      '<button class="btn mini" data-cerrar-mapa>✕</button>' +
      '</div>' +
      '<canvas id="mapa-cv"></canvas>' +
      '<div class="mapa-ficha" id="mapa-ficha"></div>' +
      '<div class="mapa-pie">' +
      '<button class="btn mini" data-mapa-centrar>◎ centrar en mí</button>' +
      '<button class="btn mini" data-mapa-zoom="1.4">＋</button>' +
      '<button class="btn mini" data-mapa-zoom="0.7">－</button>' +
      (modoViaje ? '<span class="dim mapa-nota">elige destino y confirma abajo</span>' : '') +
      '</div></div>';
    document.body.appendChild(cont);
    UI._mapaCont = cont;

    const cv = cont.querySelector('#mapa-cv');
    const ajustar = function () {
      const r = cv.parentElement.getBoundingClientRect();
      cv.width = Math.round(r.width);
      cv.height = Math.round(r.height - 132);
      cv.style.width = cv.width + 'px';
      cv.style.height = cv.height + 'px';
    };
    ajustar();

    const mapa = new SW.Mapa(cv, s);
    UI._mapa = mapa;
    mapa.zoom = 1.5;
    mapa.animar();

    const ficha = cont.querySelector('#mapa-ficha');
    const pintarFicha = function (w) {
      if (!w) { ficha.innerHTML = '<p class="dim">Pulsa un mundo para ver sus datos.</p>'; return; }
      const esAqui = w.n === s.mundo;
      const saltos = SW.saltosEntre(s.mundo, w.n);
      const coste = SW.costeViaje(s.mundo, w.n, !!s.nave, s);
      const dato = SW.datoMundo(w.n);
      const visto = (s.mundosVistos || []).indexOf(w.n) >= 0;
      let h = '<div class="mf-cab"><b>' + U.esc(w.n) + '</b>' +
        '<span class="tag">' + U.esc(w.m.r) + '</span>' +
        (visto ? '<span class="tag">visitado</span>' : '') +
        (esAqui ? '<span class="tag oro">estás aquí</span>' : '') + '</div>';
      h += '<p class="mf-bio">' + U.esc(U.titleCase(w.m.bio)) + ' · ' + U.esc(w.m.vibe) + '</p>';
      if (dato) h += '<p class="mf-dato">◈ ' + U.esc(dato) + '</p>';
      h += '<p class="mf-datos"><span>riqueza ' + w.m.riq + '/10</span><span>ley ' + w.m.ley + '/10</span>' +
        (esAqui ? '' : '<span>' + saltos + ' saltos</span>') + '</p>';

      if (esAqui) {
        h += '<button class="btn bloque" data-ver-planeta="' + U.esc(w.n) + '">◉ VER ' + U.esc(w.n.toUpperCase()) + '</button>';
      } else if (modoViaje) {
        if (s.carga) {
          const v = g.valorCargaEn(w.n);
          const dif = v - s.carga.coste;
          h += '<p class="mf-carga">Llevas <b>' + U.esc(s.carga.n) + '</b>. Aquí se paga a ' + U.cr(v) +
            ' <span class="' + (dif >= 0 ? 'pos' : 'neg') + '">(' + (dif >= 0 ? '+' : '') + U.cr(dif) + ')</span></p>';
        }
        const pend = g.pendientesAqui();
        if (pend.length) {
          h += '<p class="mf-aviso">⚑ Dejas sin resolver en ' + U.esc(s.mundo) + ':<br>' +
            pend.map(function (x) { return '· ' + U.esc(x.txt); }).join('<br>') + '</p>';
        }
        if (s.buscado > 0) h += '<p class="mf-bien">✦ Irte despistará a quien te busca aquí.</p>';
        const puede = s.stats.creditos >= coste;
        h += '<button class="btn grande bloque" data-viajar="' + U.esc(w.n) + '"' + (puede ? '' : ' disabled') + '>' +
          (puede ? '▸ VIAJAR — ' + U.cr(coste) : '✕ NO TE LLEGA (' + U.cr(coste) + ')') + '</button>';
      } else {
        h += '<p class="dim">Para viajar, usa la actividad <b>Viajar</b>.</p>';
      }
      ficha.innerHTML = h;
    };
    pintarFicha(null);
    mapa.onSelect = pintarFicha;

    cont.addEventListener('click', function (e) {
      const cerrar = e.target.closest('[data-cerrar-mapa]');
      if (cerrar) { UI.pararMapa(); if (modoViaje) g.devolverAccion(); UI.renderJuego(); return; }
      const centrar = e.target.closest('[data-mapa-centrar]');
      if (centrar) { mapa.centrarEn(s.mundo); return; }
      const z = e.target.closest('[data-mapa-zoom]');
      if (z) { mapa.zoom = Math.max(0.5, Math.min(6, mapa.zoom * parseFloat(z.dataset.mapaZoom))); return; }
      const ver = e.target.closest('[data-ver-planeta]');
      if (ver) { UI.verPlaneta(ver.dataset.verPlaneta); return; }
      const via = e.target.closest('[data-viajar]');
      if (via && !via.disabled) {
        const destino = via.dataset.viajar;
        UI.pararMapa();
        g.log('› Viajar a ' + destino, 'eleccion');
        /* Con nave propia, volar es elegir por dónde. Sin nave compras
           un billete y te sientas donde te digan: ahí no hay plan de
           vuelo que valga. */
        if (s.nave && SW.menuRuta) {
          g.cola.unshift(g.prepararGen(SW.menuRuta(g, destino)));
          g.fase = 'evento';
        } else {
          g.aplicarFx({ creditos: -SW.costeViaje(s.mundo, destino, false, s) }, {});
          g.mover(destino, 'por decisión propia');
        }
        UI.renderJuego();
      }
    });

    window.addEventListener('resize', ajustar);
    UI._mapaResize = ajustar;
  };

  UI.pararMapa = function () {
    if (UI._mapa) { UI._mapa.parar(); UI._mapa = null; }
    if (UI._mapaCont) { UI._mapaCont.remove(); UI._mapaCont = null; }
    if (UI._mapaResize) { window.removeEventListener('resize', UI._mapaResize); UI._mapaResize = null; }
  };

  /** Vista grande del planeta en pixel art */
  UI.verPlaneta = function (nombre) {
    const m = SW.mundo(nombre);
    const dato = SW.datoMundo(nombre);
    const amb = UI.ambienteDe(nombre);
    const cont = document.createElement('div');
    cont.className = 'vitrina-overlay planeta-overlay';
    cont.innerHTML =
      '<div class="vitrina ancha">' +
      '<div class="vit-cab">' + U.esc(m.r.toUpperCase()) + '</div>' +
      '<div class="vit-arte planeta-arte"><div class="vit-halo"></div></div>' +
      '<div class="vit-nombre">' + U.esc(nombre) + '</div>' +
      '<p class="vit-desc">' + U.esc(U.titleCase(m.bio)) + '. ' + U.esc(U.titleCase(m.vibe)) + '.</p>' +
      (dato ? '<p class="planeta-dato">◈ ' + U.esc(dato) + '</p>' : '') +
      '<div class="vit-stats"><span>riqueza ' + m.riq + '/10</span><span>ley ' + m.ley + '/10</span></div>' +
      '<button class="btn grande bloque" data-vit>VOLVER AL MAPA</button>' +
      '</div>';
    document.body.appendChild(cont);
    try {
      const arte = cont.querySelector('.planeta-arte');
      arte.appendChild(SW.pixelPlaneta(nombre, 7));
      arte.style.setProperty('--halo', amb.acento);
    } catch (e) {}
    cont.addEventListener('click', function (e) {
      if (e.target.closest('[data-vit]') || e.target === cont) cont.remove();
    });
  };

  /* ============================================================
     VITRINA: cuando consigues algo, se ve
     ============================================================ */
  UI.mostrarPopup = function () {
    const g = UI.juego;
    if (!g || !g.popups || !g.popups.length) return;
    const p = g.popups[0];

    const cont = document.createElement('div');
    cont.className = 'vitrina-overlay';
    cont.innerHTML =
      '<div class="vitrina">' +
      '<div class="vit-cab">' + U.esc(p.titulo) + '</div>' +
      '<div class="vit-arte"><div class="vit-halo"></div></div>' +
      '<div class="vit-nombre">' + U.esc(p.nombre) + '</div>' +
      '<p class="vit-desc">' + U.esc(p.desc) + '</p>' +
      (p.stats && p.stats.length
        ? '<div class="vit-stats">' + p.stats.map(function (x) { return '<span>' + U.esc(x) + '</span>'; }).join('') + '</div>'
        : '') +
      '<button class="btn grande bloque" data-vit>CONTINUAR</button>' +
      '</div>';
    document.body.appendChild(cont);

    try {
      const arte = cont.querySelector('.vit-arte');
      const cv = (SW.tienePixel2 && SW.tienePixel2(p.sprite))
        ? SW.pixel2(p.sprite, { escala: 2, dinamico: p.color || null })
        : SW.pixel(p.sprite, { escala: 7, dinamico: p.color || '#c8d4e0' });
      arte.appendChild(cv);
      if (p.color) arte.style.setProperty('--halo', p.color);
    } catch (e) {}

    cont.addEventListener('click', function (e) {
      if (!e.target.closest('[data-vit]') && e.target !== cont) return;
      cont.remove();
      g.popups.shift();
      UI.mostrarPopup();
    });
  };

  /* ---------------- Eventos ---------------- */
  UI.mostrarEvento = function () {
    const g = UI.juego;
    const inst = g.cola[0];
    if (!inst) return;
    let mini = inst.ref && inst.ref.minijuego;
    /* Hay gente que no puede con los juegos de reflejos, y en el móvil
       con una mano tampoco es cómodo. Con el modo sin cronómetro el
       minijuego se resuelve con lo que sabes hacer: misma escala de
       notas, sin pedirte milisegundos. */
    const sinTiempo = localStorage.getItem('holovida_sintiempo') === 'si';
    if (mini && sinTiempo) mini = null;

    const esTrama = !!(inst.ref && inst.ref.esTrama);
    let h = '<div class="evento-overlay"><div class="evento' + (esTrama ? ' de-trama' : '') + '">';
    h += '<div class="ev-texto">' + inst.texto + '</div>';
    if (mini) {
      h += UI.htmlMinijuego(inst.ref);
    } else if (inst.ref && inst.ref.minijuego) {
      h += '<div class="mini mini-auto"><p class="mini-pie">Modo sin cronómetro: se resuelve con tu pericia.</p>' +
        '<button class="btn grande bloque" data-auto>▸ RESOLVERLO</button></div>';
    }
    h += '<div class="ev-ops">';
    /* Durante un duelo el teclado numérico es del duelo: enseñar «1» en
       la opción de escape haría creer que pulsar 1 la elige. */
    const sinNumero = mini === 'sable';
    inst.opciones.forEach(function (o, i) {
      h += '<button class="op' + (o.bloqueada ? ' bloq' : '') + (sinNumero ? ' sin-n' : '') +
        '" data-op="' + i + '"' + (o.bloqueada ? ' disabled' : '') + '>' +
        (i < 9 && !sinNumero ? '<u class="op-n">' + (i + 1) + '</u>' : '') +
        '<span class="op-t">' + U.esc(o.txt) + '</span>' +
        (o.sub ? '<span class="op-s">' + U.esc(o.sub) + '</span>' : '') + '</button>';
    });
    h += '</div></div></div>';

    const div = document.createElement('div');
    div.innerHTML = h;
    UI.app.querySelector('.hud').appendChild(div.firstChild);
    if (mini) UI.arrancarMinijuego(inst.ref);
    else UI.escribirTexto();
    const bAuto = document.querySelector('[data-auto]');
    if (bAuto) bAuto.onclick = function () { UI.resolverSinTiempo(inst.ref); };
  };

  /* ------------------------------------------------------------
     El texto se escribe solo, rápido. Un clic lo completa: nunca
     te hace esperar, sólo hace que la escena entre mejor.
     ------------------------------------------------------------ */
  UI.escribirTexto = function () {
    const cont = document.querySelector('.evento .ev-texto');
    if (!cont || UI.sinAnimacion) return;
    const html = cont.innerHTML;
    const plano = cont.textContent || '';
    if (plano.length < 24 || plano.length > 700) return;
    UI._maquina = { activa: true, html: html, cont: cont, t: 0 };
    cont.classList.add('escribiendo');
    // se revela por caracteres visibles sin romper las etiquetas
    let i = 0;
    const total = plano.length;
    const paso = Math.max(1, Math.round(total / 46));
    const tick = function () {
      const m = UI._maquina;
      if (!m || !m.activa) return;
      i += paso;
      if (i >= total) { UI.completarTexto(); return; }
      cont.style.setProperty('--rev', (i / total * 100).toFixed(2) + '%');
      m.t = setTimeout(tick, 16);
    };
    cont.style.setProperty('--rev', '0%');
    UI._maquina.t = setTimeout(tick, 16);
  };

  UI.completarTexto = function () {
    const m = UI._maquina;
    if (!m) return;
    if (m.t) clearTimeout(m.t);
    m.activa = false;
    if (m.cont) { m.cont.classList.remove('escribiendo'); m.cont.style.removeProperty('--rev'); }
    UI._maquina = null;
  };

  /* ============================================================
     TECLADO
     1-9 elige opción, Enter/Espacio avanza el año, M el mapa,
     F la ficha, Esc cierra lo que haya abierto.
     ============================================================ */
  UI.bindTeclado = function () {
    if (UI._tecladoPuesto) return;
    UI._tecladoPuesto = true;
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const foco = document.activeElement;
      if (foco && /^(INPUT|TEXTAREA|SELECT)$/.test(foco.tagName)) return;
      const g = UI.juego;

      if (e.key === 'Escape') {
        if (UI._modal) { UI.cerrarModal(); e.preventDefault(); return; }
        // la vitrina se cierra por su botón, para que siga el flujo normal
        const vit = document.querySelector('.vitrina-overlay [data-vit]');
        if (vit) { vit.click(); e.preventDefault(); return; }
        const ov = document.querySelector('.mapa-overlay, .popup-overlay');
        if (ov) { ov.remove(); UI.pararMapa(); e.preventDefault(); return; }
        document.body.classList.remove('panel-abierto');
        return;
      }
      if (!g || document.querySelector('.pantalla')) return;

      // si hay texto escribiéndose, la primera tecla lo completa
      if (UI._maquina && UI._maquina.activa) { UI.completarTexto(); e.preventDefault(); return; }

      /* en mitad de un duelo el teclado es del duelo: si no, el «1» se
         iría al menú de opciones y te sacaría de la pelea */
      if (UI.mini && UI.mini.teclas && UI.mini.pulsar && !UI.mini.terminado) {
        const T = { '1': 'alto', '2': 'medio', '3': 'bajo', '4': 'esquiva', '5': 'entrar',
                    'ArrowUp': 'alto', 'ArrowRight': 'medio', 'ArrowDown': 'bajo',
                    'ArrowLeft': 'esquiva', ' ': 'entrar' };
        const t = T[e.key];
        if (t) { UI.mini.pulsar(t); e.preventDefault(); return; }
      }

      const ops = [].slice.call(document.querySelectorAll('.evento .op:not([disabled])'));
      if (ops.length) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9 && ops[n - 1]) { ops[n - 1].click(); e.preventDefault(); }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const av = document.querySelector('[data-a="avanzar"], [data-a="fin"]');
        if (av) { av.click(); e.preventDefault(); }
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        // repetir la última vía que abriste, que es lo que uno hace
        const ult = UI.ultimaActividad;
        if (ult) { const b = document.querySelector('.act[data-act="' + ult + '"]:not(.off)'); if (b) b.click(); }
        return;
      }
      if (e.key === 'm' || e.key === 'M') { const b = document.querySelector('[data-a="mapa"]'); if (b) b.click(); return; }
      if (e.key === 'f' || e.key === 'F') { document.body.classList.toggle('panel-abierto'); return; }
    });
  };

  UI.bindJuego = function () {
    UI.bindTeclado();
    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a],[data-act],[data-op],[data-lf]');
      if (!b || b.disabled) return;
      if (b.dataset.lf) { UI.filtro = b.dataset.lf; UI.renderJuego(); return; }
      if (b.dataset.op != null) { UI.elegirOpcion(parseInt(b.dataset.op, 10)); return; }
      if (b.dataset.act) {
        if (UI.juego.s.acciones <= 0) { UI.flash('Ya no te queda tiempo este año. Avanza de año.'); return; }
        UI.ultimaActividad = b.dataset.act;
        UI.juego.hacerActividad(b.dataset.act);
        UI.renderJuego(); return;
      }
      const a = b.dataset.a;
      if (a === 'avanzar') { UI.juego.avanzarAño(); UI.renderJuego(); return; }
      if (a === 'fin') { UI.pantallaFin(); return; }
      if (a === 'menu') { UI.menuPausa(); return; }
      if (a === 'mapa') { UI.abrirMapa(false); return; }
      if (a === 'ficha') { document.body.classList.toggle('panel-abierto'); return; }
    };
  };

  UI.elegirOpcion = function (i) {
    const g = UI.juego;
    UI.pararMinijuego();
    const inst = g.cola.shift();
    if (!inst) return;
    const op = inst.opciones[i];
    if (!op) return;
    const d = op.def;

    if (d.tactica === 'cancelar') { g.resolverEleccion(inst, i); UI.renderJuego(); return; }

    // apuesta: se ve rodar el dado antes de saber el resultado
    if (d.apostar && d.juegoAzar && SW.animarAzar) {
      g.log('› ' + op.txt, 'eleccion');
      UI.mesaAzar(d, inst);
      return;
    }
    const saludAntes = g.s.stats.salud;
    const credAntes = g.s.stats.creditos;
    g.resolverEleccion(inst, i);
    UI.reaccion(saludAntes - g.s.stats.salud, g.s.stats.creditos - credAntes);

    if (!g.cola.length && !g.s.muerto) g.fase = 'menu';
    UI.renderJuego();
  };

  /** Feedback físico: si te han hecho daño, la pantalla lo acusa. */
  UI.reaccion = function (daño, dinero) {
    if (UI.sinAnimacion) return;
    const b = document.body;
    if (daño >= 18) {
      b.classList.add('golpe-fuerte');
      setTimeout(function () { b.classList.remove('golpe-fuerte'); }, 420);
    } else if (daño >= 6) {
      b.classList.add('golpe');
      setTimeout(function () { b.classList.remove('golpe'); }, 300);
    } else if (dinero >= 20000) {
      b.classList.add('destello-oro');
      setTimeout(function () { b.classList.remove('destello-oro'); }, 500);
    }
  };

  /** Enseña la tirada y solo después aplica el resultado. */
  UI.mesaAzar = function (d, inst) {
    const g = UI.juego;
    const capa = document.createElement('div');
    capa.className = 'azar-overlay';
    capa.innerHTML = '<div class="azar-marco"><h3>' +
      U.esc((SW.JUEGOS_AZAR[d.juegoAzar] || {}).n || 'Apuesta') + '</h3>' +
      '<div class="azar-lienzo" id="azar-lienzo"></div>' +
      '<p class="azar-pie">' + U.cr(d.apostar) + ' sobre la mesa…</p></div>';
    document.body.appendChild(capa);

    // el resultado se decide con el RNG con semilla; la animación solo lo cuenta
    const res = SW.resolverApuesta(g, d.apostar, d.juegoAzar, d.color);
    SW.animarAzar(capa.querySelector('#azar-lienzo'), d.juegoAzar, res, function () {
      capa.remove();
      if (!g.cola.length && !g.s.muerto) g.fase = 'menu';
      UI.renderJuego();
    });
  };

  /* ============================================================
     MINIJUEGOS DE REFLEJOS
     ============================================================ */
  UI.htmlMinijuego = function (ref) {
    if (ref.minijuego === 'sable') {
      const P = SW.paramsDuelo(ref);
      const linea = function (id, sim, txt) {
        return '<div class="sb-linea" data-l="' + id + '"><b>' + sim + '</b>' +
          '<div class="sb-carril"><span class="sb-zona"></span><i class="sb-filo"></i></div>' +
          '<em>' + txt + '</em></div>';
      };
      return '<div class="mini mini-sable" id="mini">' +
        '<div class="sb-cab"><span class="sb-forma">FORMA ' + P.forma.num + ' · ' + U.esc(P.forma.n) + '</span>' +
        '<span class="sb-cont" id="sb-cont">1 / ' + P.asaltos + '</span></div>' +
        '<div class="sb-arena" id="sb-arena">' +
        linea('alto', '▲', 'alto') + linea('medio', '▬', 'medio') + linea('bajo', '▼', 'bajo') +
        '<div class="sb-flash" id="sb-flash"></div></div>' +
        '<div class="sb-botones" id="sb-botones">' +
        '<button class="sb-btn" data-sb="alto"><b>1</b> ▲ PARAR</button>' +
        '<button class="sb-btn" data-sb="medio"><b>2</b> ▬ PARAR</button>' +
        '<button class="sb-btn" data-sb="bajo"><b>3</b> ▼ PARAR</button>' +
        '<button class="sb-btn esq" data-sb="esquiva"><b>4</b> ✧ ESQUIVAR</button>' +
        '<button class="sb-btn ent" data-sb="entrar"><b>5</b> ⚔ ENTRAR</button>' +
        '</div>' +
        '<p class="mini-pie" id="sb-pie">Para en la línea por la que viene. Cuanto más ajustada la parada, ' +
        'más le abres. <b>✧</b> para las estocadas, <b>⚔</b> cuando se abra él.</p>' +
        '<div class="sb-marcador" id="sb-marcador"></div></div>';
    }
    if (ref.minijuego === 'desenfundar') {
      return '<div class="mini mini-draw" id="mini">' +
        '<button class="draw-zona" id="draw-zona"><span id="draw-txt">QUIETO…</span></button>' +
        '<div class="draw-marcas" id="draw-marcas"></div>' +
        '<p class="mini-pie" id="draw-pie">Va a amagar antes de ir de verdad. ' +
        'Si desenfundas con un amago, te ha ganado. Espera al <b>rojo</b>.</p></div>';
    }
    if (ref.minijuego === 'fuerza') {
      let g = '<div class="mini mini-fuerza" id="mini"><div class="fz-rejilla" id="fz-rejilla">';
      const GLIFOS = ['◈', '◉', '✦', '❂', '◐', '⬡', '⟁', '✧', '◇'];
      for (let i = 0; i < 9; i++) {
        g += '<button class="fz-glifo" data-fz="' + i + '" disabled>' + GLIFOS[i] + '</button>';
      }
      g += '</div><p class="mini-pie" id="fz-pie">Mira. Todavía no toques nada.</p></div>';
      return g;
    }
    return '<div class="mini mini-filo" id="mini">' +
      '<div class="filo-pista" id="filo-pista"><div class="filo-zona" id="filo-zona"></div><div class="filo-marca" id="filo-marca"></div></div>' +
      '<button class="btn grande bloque" id="filo-golpe">GOLPEAR</button>' +
      '<p class="mini-pie">Detén el filo dentro de la franja iluminada.</p></div>';
  };

  UI.arrancarMinijuego = function (ref) {
    UI.pararMinijuego();
    const dif = ref.dificultad || 50;
    const s = UI.juego.s;

    /* ---------- duelo de sables ----------
       Varios intercambios seguidos. En cada uno el rival anuncia por
       dónde entra y el filo recorre el carril: hay que responder en la
       línea correcta y lo más ajustado posible. Parar pronto sólo te
       cubre; parar al filo le abre la guardia. */
    if (ref.minijuego === 'sable') {
      const P = SW.paramsDuelo(ref);
      const arena = $('#sb-arena'), cont = $('#sb-cont'), pie = $('#sb-pie');
      const flash = $('#sb-flash'), marcador = $('#sb-marcador');
      const lineas = {};
      ['alto', 'medio', 'bajo'].forEach(function (l) {
        lineas[l] = arena.querySelector('.sb-linea[data-l="' + l + '"]');
      });
      const res = { asaltos: P.asaltos, puntos: 0, perfectas: 0, buenas: 0, pronto: 0, fallos: 0,
                    forma: ref.forma, fase: ref.fase || 0 };
      const st = { terminado: false, timers: [], raf: 0, activo: null, n: 0, teclas: true };
      UI.mini = st;
      const espera = function (ms, fn) { st.timers.push(setTimeout(fn, ms)); };

      const pintarMarcador = function () {
        let h = '';
        for (let i = 0; i < P.asaltos; i++) {
          const v = res.marcas && res.marcas[i];
          h += '<i class="' + (v || '') + '"></i>';
        }
        marcador.innerHTML = h;
      };
      res.marcas = [];
      pintarMarcador();

      const limpiar = function () {
        ['alto', 'medio', 'bajo'].forEach(function (l) {
          lineas[l].classList.remove('viene', 'estocada', 'hueco');
          lineas[l].querySelector('.sb-filo').style.width = '0%';
          lineas[l].querySelector('.sb-zona').style.display = 'none';
        });
      };

      const cerrar = function (marca, txt, clase) {
        if (st.activo) st.activo.cerrado = true;
        cancelAnimationFrame(st.raf);
        res.marcas.push(marca);
        pintarMarcador();
        pie.innerHTML = txt;
        flash.className = 'sb-flash ' + clase;
        espera(180, function () { flash.className = 'sb-flash'; });
        limpiar();
        if (res.marcas.length >= P.asaltos) { espera(520, terminar); return; }
        espera(P.pausa, asalto);
      };

      const resolver = function (tipo, momento) {
        const a = st.activo;
        if (!a || a.cerrado) return;
        const bien = tipo === a.espera;
        if (!bien) {
          res.fallos++; res.puntos -= 1;
          cerrar('fallo', a.tipo === 'hueco'
            ? '<b>Se abre y no entras.</b> Cierra la guardia y te cobra la duda.'
            : (a.tipo === 'estocada' ? '<b>Paras una estocada.</b> No se para: se esquiva.'
                                     : '<b>Guardia equivocada.</b> Entra por donde no mirabas.'), 'mal');
          return;
        }
        const r = momento / a.ventana;
        if (r < 0.22) {
          res.pronto++;
          cerrar('pronto', 'Te precipitas. Cubres, pero se recompone antes que tú.', 'flojo');
        } else if (r < 0.58) {
          res.buenas++; res.puntos += 1;
          cerrar('buena', 'Parada limpia. Chispas y nada más.', 'bien');
        } else {
          res.perfectas++; res.puntos += 2;
          cerrar('perfecta', a.tipo === 'hueco'
            ? '<b>Entras por el hueco.</b> Eso le va a durar.'
            : '<b>Al filo.</b> Le desvías la hoja y le abres entero.', 'critico');
        }
      };

      const asalto = function () {
        if (st.terminado) return;
        st.n++;
        cont.textContent = st.n + ' / ' + P.asaltos;
        const d = Math.random();
        let pHueco = P.pHueco + (P.empuje ? 0.12 : 0);
        let tipo, linea, esperaTecla;
        if (d < P.pEstocada) { tipo = 'estocada'; linea = ['alto', 'medio', 'bajo'][Math.floor(Math.random() * 3)]; esperaTecla = 'esquiva'; }
        else if (d < P.pEstocada + pHueco) { tipo = 'hueco'; linea = ['alto', 'medio', 'bajo'][Math.floor(Math.random() * 3)]; esperaTecla = 'entrar'; }
        else { tipo = 'corte'; linea = ['alto', 'medio', 'bajo'][Math.floor(Math.random() * 3)]; esperaTecla = linea; }

        // los últimos intercambios de una fase dura van más rápidos
        const ventana = Math.round(P.ventana * (1 - Math.min(0.22, (st.n - 1) * 0.045)));
        const el = lineas[linea], filo = el.querySelector('.sb-filo'), zona = el.querySelector('.sb-zona');
        el.classList.add('viene');
        if (tipo === 'estocada') el.classList.add('estocada');
        if (tipo === 'hueco') el.classList.add('hueco');
        zona.style.display = 'block';
        pie.innerHTML = tipo === 'estocada' ? 'Punta. <b>Esquiva.</b>'
          : tipo === 'hueco' ? 'Se ha abierto. <b>Entra.</b>'
          : 'Viene por <b>' + linea + '</b>.';

        const t0 = performance.now();
        st.activo = { tipo: tipo, linea: linea, espera: esperaTecla, ventana: ventana, t0: t0, cerrado: false };
        const paso = function (t) {
          if (st.terminado || !st.activo || st.activo.cerrado) return;
          const p = (t - t0) / ventana;
          filo.style.width = Math.min(100, p * 100) + '%';
          if (p >= 1.08) {
            res.fallos++; res.puntos -= 1;
            cerrar('fallo', tipo === 'hueco' ? 'Dejas pasar el hueco. No habrá muchos más.'
                                             : '<b>Te alcanza.</b> No has llegado.', 'mal');
            return;
          }
          st.raf = requestAnimationFrame(paso);
        };
        st.raf = requestAnimationFrame(paso);
      };

      const terminar = function () {
        if (st.terminado) return;
        st.terminado = true;
        const grado = SW.notaDuelo(res);
        UI.juego.duelo = res;
        UI.finMinijuego(grado, res.perfectas + ' al filo · ' + res.buenas + ' limpias · ' +
          res.pronto + ' precipitadas · ' + res.fallos + ' encajadas');
      };

      st.pulsar = function (tipo) {
        if (st.terminado || !st.activo || st.activo.cerrado) return;
        resolver(tipo, performance.now() - st.activo.t0);
      };
      $('#sb-botones').onclick = function (ev) {
        const b = ev.target.closest('[data-sb]');
        if (b) st.pulsar(b.dataset.sb);
      };
      pie.innerHTML = 'Aguanta la guardia…';
      espera(700, asalto);
      return;
    }

    /* ---------- desenfundar ----------
       Antes esto era una prueba de tiempo de reacción pura, y estaba
       mal calibrada hasta lo imposible: con dificultad 50 la ventana
       era de 228 ms y el «perfecto» pedía bajar de 102 ms. Un humano
       reacciona en 200-300 ms, así que no se podía ganar por diseño.

       Ahora la gracia no es ser más rápido que la biología: es aguantar
       los amagos. El rival finge dos o tres veces (ámbar) antes de ir
       de verdad (rojo). Picar un amago te cuesta el duelo; la ventana
       real es amplia y lo que se mide encima es lo ajustado que vas. */
    if (ref.minijuego === 'desenfundar') {
      const zona = $('#draw-zona'), txt = $('#draw-txt'), pie = $('#draw-pie'), marcas = $('#draw-marcas');
      const pericia = U.clamp(ref.pericia || 30, 0, 120);
      // cuanto peor es el rival, más se le ve venir; la pericia te da aire
      const amagos = U.clamp(Math.round(1 + dif / 30 - pericia / 90), 1, 4);
      // ventana real: de sobra para un humano, estrecha contra una leyenda
      let ventana = 900 - dif * 3.4 + pericia * 1.6;
      if (ref.rival === 'leyenda') ventana *= 0.62;
      ventana = Math.round(U.clamp(ventana, 330, 1200));

      const st = { fase: 0, listo: false, t0: 0, timers: [], terminado: false, picados: 0 };
      UI.mini = st;
      const espera = function (ms, fn) { st.timers.push(setTimeout(fn, ms)); };
      let hechos = 0;
      const pintar = function () {
        let h = '';
        for (let i = 0; i < amagos; i++) h += '<i class="' + (i < hechos ? 'ok' : '') + '"></i>';
        h += '<b class="' + (st.listo ? 'on' : '') + '"></b>';
        marcas.innerHTML = h;
      };
      pintar();

      let t = 600 + Math.random() * 700;
      for (let i = 0; i < amagos; i++) {
        (function (n) {
          espera(t, function () {
            if (st.terminado) return;
            zona.classList.add('amago');
            txt.textContent = 'AMAGO';
          });
          espera(t + 170, function () {
            if (st.terminado) return;
            zona.classList.remove('amago');
            txt.textContent = 'QUIETO…';
            hechos = n + 1; pintar();
          });
        })(i);
        t += 700 + Math.random() * 900;
      }
      espera(t, function () {
        if (st.terminado) return;
        st.listo = true; st.t0 = performance.now();
        zona.classList.add('ya');
        txt.textContent = '¡AHORA!';
        pintar();
        // si no reaccionas, te dispara él
        espera(ventana + 260, function () {
          if (st.terminado) return;
          st.terminado = true;
          UI.finMinijuego(-1, 'No llegas a sacar. Él sí.');
        });
      });

      zona.onclick = function () {
        if (st.terminado) return;
        if (!st.listo) {
          // picar un amago no siempre es mortal: es ir por detrás
          st.picados++;
          st.terminado = true;
          UI.finMinijuego(st.picados > 0 && Math.random() < 0.4 ? 0 : -1,
            'Picas el amago. Sacas a destiempo y te lo come él.');
          return;
        }
        st.terminado = true;
        const ms = Math.round(performance.now() - st.t0);
        let grado;
        if (ms < ventana * 0.42) grado = 2;
        else if (ms < ventana * 0.78) grado = 1;
        else if (ms < ventana) grado = 0;
        else grado = -1;
        UI.finMinijuego(grado, 'Aguantas ' + amagos + ' amago' + (amagos > 1 ? 's' : '') +
          ' y sacas en ' + ms + ' ms (margen ' + ventana + ' ms).');
      };
      return;
    }

    /* modo fuerza: la secuencia se enseña una vez y hay que repetirla */
    if (ref.minijuego === 'fuerza') {
      const rejilla = $('#fz-rejilla'), pie = $('#fz-pie');
      const botones = [].slice.call(rejilla.querySelectorAll('.fz-glifo'));
      // cuanto más difícil, más larga la secuencia y menos tiempo en pantalla
      const largo = U.clamp(Math.round(3 + dif / 22 - (ref.pericia || 40) / 90), 3, 7);
      const visible = Math.max(260, 760 - dif * 4.5 + (ref.pericia || 40) * 2);
      const seq = [];
      for (let i = 0; i < largo; i++) seq.push(Math.floor(Math.random() * 9));
      const st = { terminado: false, timers: [], entrada: [] };
      UI.mini = st;
      const espera = function (ms, fn) { st.timers.push(setTimeout(fn, ms)); };

      pie.textContent = 'Mira la secuencia (' + largo + ').';
      let t = 350;
      seq.forEach(function (idx) {
        espera(t, function () {
          if (st.terminado) return;
          botones[idx].classList.add('on');
        });
        espera(t + visible, function () {
          if (st.terminado) return;
          botones[idx].classList.remove('on');
        });
        t += visible + 170;
      });
      espera(t + 120, function () {
        if (st.terminado) return;
        pie.textContent = 'Ahora tú. En el mismo orden.';
        botones.forEach(function (b) { b.disabled = false; });
      });

      rejilla.onclick = function (ev) {
        const b = ev.target.closest('.fz-glifo');
        if (!b || b.disabled || st.terminado) return;
        const idx = parseInt(b.dataset.fz, 10);
        st.entrada.push(idx);
        b.classList.add('pulsado');
        setTimeout(function () { b.classList.remove('pulsado'); }, 140);
        if (st.entrada.length < seq.length) return;
        st.terminado = true;
        let aciertos = 0;
        for (let i = 0; i < seq.length; i++) if (st.entrada[i] === seq[i]) aciertos++;
        const r = aciertos / seq.length;
        const grado = r === 1 ? 2 : (r >= 0.75 ? 1 : (r >= 0.45 ? 0 : -1));
        UI.finMinijuego(grado, aciertos + ' de ' + seq.length + ' en su sitio.');
      };
      return;
    }

    /* modo filo: barra en movimiento */
    const pista = $('#filo-pista'), marca = $('#filo-marca'), zonaEl = $('#filo-zona'), btn = $('#filo-golpe');
    let anchoZona = U.clamp(18 - dif / 7 + s.stats.destreza / 22 + (s.sensible ? s.stats.fuerza / 34 : 0), 4.5, 16);
    if (ref.rival === 'leyenda') anchoZona *= 0.45;
    // la zona no siempre está en el centro: hay que mirar, no memorizar
    const centro = 34 + (ref.semillaZona != null ? ref.semillaZona : Math.random()) * 32;
    zonaEl.style.left = (centro - anchoZona / 2) + '%';
    zonaEl.style.width = anchoZona + '%';

    // la barra va más rápido y arranca donde le da la gana
    const st = { pos: Math.random() * 100, dir: Math.random() < 0.5 ? 1 : -1, raf: 0,
                 terminado: false, vel: 1.4 + dif / 45 };
    UI.mini = st;
    const paso = function () {
      if (st.terminado) return;
      st.pos += st.dir * st.vel;
      if (st.pos >= 100) { st.pos = 100; st.dir = -1; }
      if (st.pos <= 0) { st.pos = 0; st.dir = 1; }
      marca.style.left = st.pos + '%';
      st.raf = requestAnimationFrame(paso);
    };
    st.raf = requestAnimationFrame(paso);

    btn.onclick = function () {
      if (st.terminado) return;
      st.terminado = true;
      cancelAnimationFrame(st.raf);
      const d = Math.abs(st.pos - centro);
      let grado;
      if (d < anchoZona / 5) grado = 2;
      else if (d < anchoZona / 2) grado = 1;
      else if (d < anchoZona * 0.8) grado = 0;
      else grado = -1;
      UI.finMinijuego(grado, 'Desvío: ' + d.toFixed(1) + '%.');
    };
  };

  /** Resuelve un minijuego con las estadísticas, sin pedir reflejos. */
  UI.resolverSinTiempo = function (ref) {
    const g = UI.juego;
    const per = U.clamp(ref.pericia || 30, 0, 130);
    const dif = U.clamp(ref.dificultad || 50, 10, 100);
    // la misma cuenta que haría un jugador competente: pericia contra dificultad
    const v = U.clamp(0.5 + (per - dif) / 110, 0.05, 0.95);
    const r = Math.random();
    let grado;
    if (r < v * 0.42) grado = 2;
    else if (r < v * 0.92) grado = 1;
    else if (r < v * 0.92 + (1 - v) * 0.5) grado = 0;
    else grado = -1;
    if (ref.minijuego === 'sable' && SW.paramsDuelo) {
      // el duelo necesita su desglose para que la forma siga contando
      const P = SW.paramsDuelo(ref);
      const res = { asaltos: P.asaltos, puntos: 0, perfectas: 0, buenas: 0, pronto: 0, fallos: 0,
                    forma: ref.forma, fase: ref.fase || 0 };
      for (let i = 0; i < P.asaltos; i++) {
        const x = Math.random();
        if (x < v * 0.55) { res.perfectas++; res.puntos += 2; }
        else if (x < v * 0.55 + 0.3) { res.buenas++; res.puntos += 1; }
        else if (x < 0.85) { res.pronto++; }
        else { res.fallos++; res.puntos -= 1; }
      }
      g.duelo = res;
      grado = SW.notaDuelo(res);
    }
    UI.finMinijuego(grado, 'Resuelto con tu pericia (' + per + ' contra dificultad ' + dif + ').');
  };

  UI.pararMinijuego = function () {
    if (!UI.mini) return;
    UI.mini.terminado = true;
    if (UI.mini.timer) clearTimeout(UI.mini.timer);
    if (UI.mini.raf) cancelAnimationFrame(UI.mini.raf);
    if (UI.mini.timers) UI.mini.timers.forEach(clearTimeout);
    UI.mini = null;
  };

  UI.finMinijuego = function (grado, detalle) {
    const g = UI.juego;
    UI.pararMinijuego();
    g.cola.shift();                       // quita el evento del minijuego
    g.log('› Te la juegas. <span class="dim">' + detalle + '</span>', 'eleccion');
    g.resolverMinijuego(grado);
    UI.renderJuego();
  };

  /* ---------------- Varios ---------------- */
  UI.flash = function (msg) {
    const d = document.createElement('div');
    d.className = 'flash';
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { d.classList.add('out'); }, 1400);
    setTimeout(function () { d.remove(); }, 2000);
  };

  UI.menuPausa = function () {
    UI.modal('MENÚ',
      '<div class="menu-pausa">' +
      '<button class="btn" data-m="seguir">▸ Seguir jugando</button>' +
      '<button class="btn" data-m="resumen">▸ Ver ficha completa</button>' +
      '<button class="btn" data-m="guardar">▸ Guardar partida</button>' +
      '<button class="btn" data-m="crt">▸ Filtro de pantalla: ' + (localStorage.getItem('holovida_crt') === 'no' ? 'apagado' : 'encendido') + '</button>' +
      '<button class="btn" data-m="sintiempo">▸ Minijuegos con cronómetro: ' + (localStorage.getItem('holovida_sintiempo') === 'si' ? 'no' : 'sí') + '</button>' +
      '<button class="btn" data-m="anim">▸ Animaciones: ' + (UI.sinAnimacion ? 'apagadas' : 'encendidas') + '</button>' +
      '<button class="btn peligro" data-m="nueva">▸ Abandonar y empezar de cero</button>' +
      '</div>', null,
      function (root) {
        root.onclick = function (e) {
          const b = e.target.closest('[data-m]');
          if (!b) return;
          const m = b.dataset.m;
          UI.cerrarModal();
          if (m === 'resumen') UI.modal('FICHA', SW.tarjetaResumen(SW.construirResumen(UI.juego.s)), function () { UI.renderJuego(); });
          else if (m === 'guardar') { UI.guardarPartida(); UI.flash('Partida guardada.'); UI.renderJuego(); }
          else if (m === 'nueva') { localStorage.removeItem(UI.CLAVES[UI.ranura] || UI.CLAVES[0]); UI.pantallaInicio(); }
          else if (m === 'crt') {
            const apagado = localStorage.getItem('holovida_crt') === 'no';
            localStorage.setItem('holovida_crt', apagado ? 'si' : 'no');
            UI.aplicarPreferencias(); UI.renderJuego();
          }
          else if (m === 'sintiempo') {
            const on = localStorage.getItem('holovida_sintiempo') === 'si';
            localStorage.setItem('holovida_sintiempo', on ? 'no' : 'si');
            UI.cerrarModal(); UI.renderJuego(); UI.menuPausa();
          }
          else if (m === 'anim') {
            UI.sinAnimacion = !UI.sinAnimacion;
            localStorage.setItem('holovida_anim', UI.sinAnimacion ? 'no' : 'si');
            UI.renderJuego();
          }
          else UI.renderJuego();
        };
      });
  };

  /* ============================================================
     FIN
     ============================================================ */
  UI.pantallaFin = function () {
    document.body.classList.remove('en-juego');
    const g = UI.juego, s = g.s;
    const d = SW.construirResumen(s);
    const rng = new SW.RNG(s.semilla + ':epitafio');
    const epi = rng.pick(SW.EPITAFIOS);

    let h = '<div class="pantalla fin"><div class="crt-frame ancho">';
    h += '<div class="fin-cab"><h2>' + (s.muerto ? 'FIN DE TRANSMISIÓN' : 'INFORME DE VIDA') + '</h2>' +
      '<p class="epitafio">' + U.esc(epi) + '</p></div>';
    h += SW.tarjetaResumen(d);

    /* --- lo que dejaste a medias y lo que cerraste --- */
    if (SW.tramasDe) {
      const tr = SW.tramasDe(s);
      if (tr.length) {
        h += '<div class="fin-tramas"><h3>TUS HISTORIAS</h3>';
        tr.forEach(function (x) {
          const dur = (x.hasta != null ? x.hasta : s.edad) - x.desde;
          h += '<div class="fin-trama ' + (x.cerrada ? 'ok' : 'abierta') + '">' +
            '<b>' + x.ico + ' ' + U.esc(x.n) + '</b>' +
            '<span>' + (x.cerrada ? U.esc(x.final) : 'quedó abierta') + '</span>' +
            '<em>' + dur + ' años</em></div>';
        });
        h += '</div>';
      }
    }

    /* ¿Conseguiste lo que querías? Es la última pregunta de la vida. */
    if (SW.cumpleAmbicion) {
      const amb = SW.cumpleAmbicion(s);
      if (amb) {
        h += '<div class="fin-ambicion ' + (amb.ok ? 'ok' : 'no') + '">' +
          '<span>LO QUE QUERÍAS</span><b>' + (amb.ok ? '✔ ' : '✕ ') + U.esc(amb.n) + '</b>' +
          '<em>' + U.esc(amb.medida) + '</em></div>';
      }
    }
    if (SW.guardarEnSalon) SW.guardarEnSalon(s);

    const puede = SW.puedeHeredar && SW.puedeHeredar(s);
    h += '<div class="fin-acciones">' +
      '<button class="btn grande" data-a="link">⧉ COPIAR ENLACE PARA COMPARTIR</button>' +
      '<button class="btn" data-a="texto">⧉ COPIAR RESUMEN EN TEXTO</button>' +
      '<button class="btn" data-a="descargar">⭳ DESCARGAR TARJETA</button>' +
      (puede ? '<button class="btn legado" data-a="heredero">⚘ SEGUIR CON SU DESCENDIENTE</button>' : '') +
      '<button class="btn fantasma" data-a="otra">▸ OTRA VIDA</button></div>';
    h += '<div id="zona-link" class="zona-link"></div></div></div>';
    UI.app.innerHTML = h;
    localStorage.removeItem('holovida_save');

    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'otra') { UI.pantallaInicio(); return; }
      if (a === 'link') {
        const url = SW.enlaceResumen(s);
        UI.copiar(url);
        $('#zona-link').innerHTML = '<p class="ok">Enlace copiado. Pásaselo a quien quieras:</p>' +
          '<input class="link-input" value="' + U.esc(url) + '" readonly onclick="this.select()">';
      }
      if (a === 'texto') {
        UI.copiar(SW.resumenTexto(s));
        $('#zona-link').innerHTML = '<p class="ok">Resumen copiado al portapapeles.</p><pre class="txt-resumen">' + U.esc(SW.resumenTexto(s)) + '</pre>';
      }
      if (a === 'descargar') UI.descargarTarjeta(s);
      if (a === 'heredero') {
        UI.herencia = SW.herenciaDe(s);
        localStorage.removeItem('holovida_save');
        UI.pantallaCrear();
      }
    };
  };

  UI.copiar = function (txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).catch(function () {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    }
  };

  UI.descargarTarjeta = function (s) {
    const d = SW.construirResumen(s);
    const estilos = Array.prototype.map.call(document.querySelectorAll('style'), function (e) { return e.textContent; }).join('\n');
    const enlace = document.querySelector('link[rel=stylesheet]');
    const html = '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>HOLOVIDA — ' + U.esc(d.n) + '</title>' +
      (enlace ? '<link rel="stylesheet" href="' + enlace.getAttribute('href') + '">' : '') +
      (estilos ? '<style>' + estilos + '</style>' : '') +
      '</head><body class="solo-tarjeta"><div class="pantalla"><div class="crt-frame ancho">' +
      SW.tarjetaResumen(d) + '</div></div></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'holovida-' + String(d.n).replace(/\s+/g, '-').toLowerCase() + '.html';
    a.click();
  };

  /* ============================================================
     COMPARTIDO
     ============================================================ */
  UI.pantallaCompartida = function (packed) {
    const d = U.unpack(packed);
    if (!d) {
      UI.app.innerHTML = '<div class="pantalla"><div class="crt-frame"><h2>SEÑAL CORRUPTA</h2>' +
        '<p>No se ha podido decodificar esta vida. El enlace puede estar incompleto.</p>' +
        '<button class="btn" data-a="inicio">▸ IR AL JUEGO</button></div></div>';
    } else {
      UI.app.innerHTML = '<div class="pantalla fin"><div class="crt-frame ancho">' +
        '<div class="fin-cab"><h2>HOLOVIDA · REGISTRO RECIBIDO</h2><p class="epitafio">Alguien te ha pasado esta vida.</p></div>' +
        SW.tarjetaResumen(d) +
        '<div class="fin-acciones"><button class="btn grande" data-a="inicio">▸ JUGAR TU PROPIA VIDA</button></div>' +
        '</div></div>';
    }
    UI.app.onclick = function (e) {
      if (e.target.closest('[data-a="inicio"]')) {
        history.replaceState(null, '', location.pathname);
        UI.pantallaInicio();
      }
    };
  };

  /* ============================================================
     MODAL / GUARDADO
     ============================================================ */
  UI.modal = function (titulo, contenido, onCerrar, onRender) {
    const d = document.createElement('div');
    d.className = 'modal-overlay';
    d.innerHTML = '<div class="modal"><div class="modal-cab"><h3>' + U.esc(titulo) + '</h3>' +
      '<button class="btn mini" data-cerrar>✕</button></div><div class="modal-cuerpo">' + contenido + '</div></div>';
    document.body.appendChild(d);
    UI._modal = d;
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]') || e.target === d) {
        UI.cerrarModal();
        if (onCerrar) onCerrar();
      }
    });
    if (onRender) onRender(d.querySelector('.modal-cuerpo'));
  };
  UI.cerrarModal = function () { if (UI._modal) { UI._modal.remove(); UI._modal = null; } };

  /* Tres ranuras. Antes había una sola: empezar una vida nueva te
     borraba la que tenías a medias sin avisar. La ranura 1 sigue
     siendo la clave de siempre para no perder la partida de nadie. */
  UI.CLAVES = ['holovida_save', 'holovida_save_2', 'holovida_save_3'];
  UI.ranura = 0;

  UI.leerRanura = function (i) {
    try {
      const raw = localStorage.getItem(UI.CLAVES[i]);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return { nombre: d.s.nombre, edad: d.s.edad, especie: d.s.especieN || d.s.especie,
               mundo: d.s.mundo, era: d.s.eraN || d.s.era, muerto: !!d.s.muerto };
    } catch (e) { return null; }
  };

  UI.guardarPartida = function () {
    try {
      if (!UI.juego || UI.juego.s.muerto) return;
      localStorage.setItem(UI.CLAVES[UI.ranura] || UI.CLAVES[0], JSON.stringify({
        s: UI.juego.s, semilla: UI.juego.rng.seedStr, calls: UI.juego.rng.calls
      }));
    } catch (e) {}
  };

  UI.cargarPartida = function () {
    try {
      const raw = localStorage.getItem(UI.CLAVES[UI.ranura] || UI.CLAVES[0]);
      if (!raw) return UI.pantallaInicio();
      const data = JSON.parse(raw);
      const esp = SW.ESPECIES.filter(function (e) { return e.id === data.s.especie; })[0] || SW.ESPECIES[0];
      const era = SW.ERAS.filter(function (e) { return e.id === data.s.era; })[0] || SW.ERAS[0];
      const g = new SW.Game({
        semilla: data.semilla, nombre: SW.nombreLimpio(data.s.nombre), especie: esp, era: era,
        mundo: data.s.mundo, rasgo: SW.RASGOS[0], apariencia: data.s.apariencia
      });
      g.s = data.s;
      if (!g.s.heridas) g.s.heridas = [];
      if (g.s.stats.fisico == null) g.s.stats.fisico = 30;
      for (let i = 0; i < (data.calls || 0); i++) g.rng.next();
      g.fase = 'menu';
      g.cola = [];
      UI.juego = g;
      UI.renderJuego();
    } catch (e) { UI.pantallaInicio(); }
  };

  SW.UI = UI;
  global.addEventListener('DOMContentLoaded', function () { UI.init(); });

})(window);

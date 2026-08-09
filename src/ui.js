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

  UI.init = function () {
    UI.app = $('#app');
    const hash = location.hash || '';
    if (hash.indexOf('#v=') === 0) { UI.pantallaCompartida(hash.slice(3)); return; }
    UI.pantallaInicio();
  };

  /* ============================================================
     INICIO
     ============================================================ */
  UI.pantallaInicio = function () {
    document.body.classList.remove('en-juego');
    const m = SW.metricas();
    const guardada = localStorage.getItem('holovida_save');
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
      (guardada ? '<button class="btn" data-a="continuar">▸ CONTINUAR PARTIDA</button>' : '') +
      '<button class="btn" data-a="rapida">▸ VIDA ALEATORIA (rápida)</button>' +
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
      '<div class="disclaimer">Proyecto de fan sin ánimo de lucro. No afiliado a Lucasfilm ni a Disney.</div>' +
      '</div></div>';

    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'crear') UI.pantallaCrear();
      else if (a === 'rapida') UI.vidaRapida();
      else if (a === 'continuar') UI.cargarPartida();
      else if (a === 'info') UI.modalInfo();
    };
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
    const esp = SW.ESPECIES[0];
    UI.creador = {
      rng: rng,
      nombre: SW.genNombreCompleto(rng, esp.id),
      especie: esp.id,
      era: 'rebelion',
      mundo: rng.pick(esp.home),
      rasgo: 'ninguno',
      pronombre: 'él',
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
    h += '</div><p class="nota">' + U.esc(era.desc) + ' <span class="dim">(' + era.y + ')</span>' +
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
      const b = e.target.closest('[data-a],[data-esp],[data-era],[data-rasgo],[data-apv],[data-apciclo],[data-rand]');
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
    const esp = SW.ESPECIES.filter(function (e) { return e.id === c.especie; })[0];
    const era = SW.ERAS.filter(function (e) { return e.id === c.era; })[0];
    const rasgo = SW.RASGOS.filter(function (r) { return r.id === c.rasgo; })[0];
    UI.juego = new SW.Game({
      semilla: c.semilla || (c.nombre + ':' + Date.now() + ':' + Math.random()),
      nombre: c.nombre, especie: esp, era: era, mundo: c.mundo,
      rasgo: rasgo, apariencia: c.apariencia, pronombre: c.pronombre
    });
    UI.app.onchange = null;
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
      '<div class="tb-edad"><b>' + s.edad + '</b><span>' + (s.ritmo > 1 ? 'años · asp. ' + s.edadBio : 'años') + '</span></div>' +
      '<div class="tb-mundo"><b><i class="bioma-punto"></i>' + U.esc(s.mundo) + '</b><span>' + U.esc(m.r) + '</span></div>' +
      '<div class="tb-cr"><b>' + U.cr(s.stats.creditos) + '</b><span>créditos</span></div>' +
      '<div class="tb-acc"><b>' + UI.pips(s) + '</b><span>acciones</span></div>' +
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
    let h = '<div class="holo-mini">' + SW.retrato(s.apariencia, 116, s.especie) + '</div>';

    h += '<div class="stats">';
    [['salud', 'Salud'], ['fisico', 'Físico'], ['destreza', 'Destreza'], ['intelecto', 'Intelecto'],
     ['carisma', 'Carisma'], ['cordura', 'Cordura'], ['suerte', 'Suerte'],
     ['reputacion', 'Reputación'], ['notoriedad', 'Notoriedad']
    ].forEach(function (p) {
      h += '<div class="stat s-' + p[0] + '"><span>' + p[1] + '</span><div class="barra"><i style="width:' + s.stats[p[0]] + '%"></i></div><b>' + s.stats[p[0]] + '</b></div>';
    });
    h += '</div>';

    h += '<div class="fuerza-box' + (s.sensible ? ' on' : '') + '">' +
      '<span>✦ La Fuerza</span>' +
      (s.sensible
        ? '<div class="barra"><i style="width:' + s.stats.fuerza + '%"></i></div><b>' + s.stats.fuerza + '</b>'
        : '<em>no sensible</em>') +
      '</div>';

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

  UI.htmlConsola = function () {
    const s = UI.juego.s;
    let h = '';
    let ultimaEdad = -1;
    s.historia.slice(-90).forEach(function (l) {
      if (l.edad !== ultimaEdad) {
        h += '<div class="año"><span>' + (l.edad === 0 ? 'AÑO 0' : 'AÑO ' + l.edad) + '</span></div>';
        ultimaEdad = l.edad;
      }
      h += '<p class="l l-' + l.tipo + '">' + l.txt + '</p>';
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
        const coste = SW.costeViaje(s.mundo, destino, !!s.nave, s);
        UI.pararMapa();
        g.log('› Viajar a ' + destino, 'eleccion');
        g.aplicarFx({ creditos: -coste }, {});
        g.mover(destino, 'por decisión propia');
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
        ? SW.pixel2(p.sprite, { escala: 5, dinamico: p.color || null })
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
    const mini = inst.ref && inst.ref.minijuego;

    let h = '<div class="evento-overlay"><div class="evento">';
    h += '<div class="ev-texto">' + inst.texto + '</div>';
    if (mini) {
      h += UI.htmlMinijuego(inst.ref);
    }
    h += '<div class="ev-ops">';
    inst.opciones.forEach(function (o, i) {
      h += '<button class="op' + (o.bloqueada ? ' bloq' : '') + '" data-op="' + i + '"' + (o.bloqueada ? ' disabled' : '') + '>' +
        '<span class="op-t">' + U.esc(o.txt) + '</span>' +
        (o.sub ? '<span class="op-s">' + U.esc(o.sub) + '</span>' : '') + '</button>';
    });
    h += '</div></div></div>';

    const div = document.createElement('div');
    div.innerHTML = h;
    UI.app.querySelector('.hud').appendChild(div.firstChild);
    if (mini) UI.arrancarMinijuego(inst.ref);
  };

  UI.bindJuego = function () {
    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a],[data-act],[data-op]');
      if (!b || b.disabled) return;
      if (b.dataset.op != null) { UI.elegirOpcion(parseInt(b.dataset.op, 10)); return; }
      if (b.dataset.act) {
        if (UI.juego.s.acciones <= 0) { UI.flash('Ya no te queda tiempo este año. Avanza de año.'); return; }
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
    g.resolverEleccion(inst, i);

    if (!g.cola.length && !g.s.muerto) g.fase = 'menu';
    UI.renderJuego();
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
    if (ref.minijuego === 'desenfundar') {
      return '<div class="mini mini-draw" id="mini">' +
        '<button class="draw-zona" id="draw-zona"><span id="draw-txt">ESPERA…</span></button>' +
        '<p class="mini-pie">Pulsa en cuanto el recuadro cambie. Si te adelantas, pierdes.</p></div>';
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

    if (ref.minijuego === 'desenfundar') {
      const zona = $('#draw-zona'), txt = $('#draw-txt');
      const espera = 700 + Math.random() * 1800;
      const st = { listo: false, t0: 0, timer: 0, terminado: false };
      UI.mini = st;
      st.timer = setTimeout(function () {
        if (st.terminado) return;
        st.listo = true; st.t0 = Date.now();
        zona.classList.add('ya');
        txt.textContent = '¡AHORA!';
      }, espera);
      zona.onclick = function () {
        if (st.terminado) return;
        st.terminado = true;
        clearTimeout(st.timer);
        if (!st.listo) { UI.finMinijuego(-1, 'Disparas antes de tiempo.'); return; }
        const ms = Date.now() - st.t0;
        // ventana base 480 ms, que se estrecha con la dificultad del rival
        // y se ensancha con tu pericia. Contra una leyenda es casi imposible.
        // Un humano reacciona en ~250 ms. La ventana base ronda eso, así
        // que acertar exige ir de verdad: antes daba 400 ms de margen.
        const pericia = (ref.pericia || 30) / 100;
        let ventana = 300 * (1.25 - dif / 105) * (0.78 + pericia * 0.5);
        if (ref.rival === 'leyenda') ventana *= 0.5;
        ventana = Math.max(70, ventana);
        let grado;
        if (ms < ventana * 0.45) grado = 2;
        else if (ms < ventana) grado = 1;
        else if (ms < ventana * 1.35) grado = 0;
        else grado = -1;
        UI.finMinijuego(grado, 'Reacción: ' + ms + ' ms · ventana ' + Math.round(ventana) + ' ms.');
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
          else if (m === 'nueva') { localStorage.removeItem('holovida_save'); UI.pantallaInicio(); }
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
    h += '<div class="fin-acciones">' +
      '<button class="btn grande" data-a="link">⧉ COPIAR ENLACE PARA COMPARTIR</button>' +
      '<button class="btn" data-a="texto">⧉ COPIAR RESUMEN EN TEXTO</button>' +
      '<button class="btn" data-a="descargar">⭳ DESCARGAR TARJETA</button>' +
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

  UI.guardarPartida = function () {
    try {
      if (!UI.juego || UI.juego.s.muerto) return;
      localStorage.setItem('holovida_save', JSON.stringify({
        s: UI.juego.s, semilla: UI.juego.rng.seedStr, calls: UI.juego.rng.calls
      }));
    } catch (e) {}
  };

  UI.cargarPartida = function () {
    try {
      const raw = localStorage.getItem('holovida_save');
      if (!raw) return UI.pantallaInicio();
      const data = JSON.parse(raw);
      const esp = SW.ESPECIES.filter(function (e) { return e.id === data.s.especie; })[0] || SW.ESPECIES[0];
      const era = SW.ERAS.filter(function (e) { return e.id === data.s.era; })[0] || SW.ERAS[0];
      const g = new SW.Game({
        semilla: data.semilla, nombre: data.s.nombre, especie: esp, era: era,
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

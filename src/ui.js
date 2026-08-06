/* ============================================================
   HOLOVIDA :: interfaz
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  const U = SW.U;
  const $ = function (sel) { return document.querySelector(sel); };

  const UI = {
    juego: null,
    instActual: null,
    creador: null,
    app: null
  };

  /* ============================================================
     ARRANQUE
     ============================================================ */
  UI.init = function () {
    UI.app = $('#app');
    const hash = location.hash || '';
    if (hash.indexOf('#v=') === 0) {
      UI.pantallaCompartida(hash.slice(3));
      return;
    }
    UI.pantallaInicio();
  };

  /* ============================================================
     PANTALLA: INICIO
     ============================================================ */
  UI.pantallaInicio = function () {
    const m = SW.metricas();
    const guardada = localStorage.getItem('holovida_save');
    UI.app.innerHTML =
      '<div class="pantalla inicio">' +
      '  <div class="crt-frame">' +
      '    <div class="logo">' +
      '      <div class="logo-sub">SISTEMA DE SIMULACIÓN BIOGRÁFICA · MOD. 77-RX</div>' +
      '      <h1>HOLO<span>VIDA</span></h1>' +
      '      <div class="logo-line"></div>' +
      '      <div class="logo-tag">una vida entera en una galaxia muy, muy lejana</div>' +
      '    </div>' +
      '    <div class="menu-inicio">' +
      '      <button class="btn grande" data-a="crear">▸ NUEVA VIDA</button>' +
      (guardada ? '      <button class="btn" data-a="continuar">▸ CONTINUAR PARTIDA</button>' : '') +
      '      <button class="btn" data-a="rapida">▸ VIDA ALEATORIA (rápida)</button>' +
      '      <button class="btn fantasma" data-a="info">▸ ¿QUÉ ES ESTO?</button>' +
      '    </div>' +
      '    <div class="metricas">' +
      '      <div><b>' + U.num(m.totalNodos) + '</b><span>decisiones posibles</span></div>' +
      '      <div><b>' + U.num(m.totalEscenarios) + '</b><span>escenarios únicos</span></div>' +
      '      <div><b>' + m.especies + '</b><span>especies</span></div>' +
      '      <div><b>' + m.mundos + '</b><span>mundos</span></div>' +
      '      <div><b>' + m.carreras + '</b><span>carreras</span></div>' +
      '      <div><b>' + m.poderes + '</b><span>poderes</span></div>' +
      '    </div>' +
      '    <div class="disclaimer">Proyecto de fan sin ánimo de lucro. No afiliado a Lucasfilm ni a Disney.</div>' +
      '  </div>' +
      '</div>';

    UI.app.addEventListener('click', function (e) {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'crear') UI.pantallaCrear();
      else if (a === 'rapida') UI.vidaRapida();
      else if (a === 'continuar') UI.cargarPartida();
      else if (a === 'info') UI.modalInfo();
    }, { once: true });
  };

  UI.modalInfo = function () {
    const m = SW.metricas();
    UI.modal('¿QUÉ ES HOLOVIDA?',
      '<p>Un simulador de vida por turnos ambientado en una galaxia muy, muy lejana. Naces, creces, eliges, te equivocas y mueres. Después te llevas una tarjeta con tu vida entera para enseñársela a quien quieras.</p>' +
      '<p><b>Cada año</b> ocurren eventos automáticos y además eliges <b>una actividad</b>: trabajo, formación, bajos fondos, hangar, viaje, la Fuerza, mercado, acción, salud o vida social.</p>' +
      '<p><b>Espacio de decisiones:</b> ' + U.num(m.nodosFijos) + ' opciones escritas a mano (' + m.plantillas + ' plantillas × escenarios variables) + ' + U.num(m.nodosGen) + ' generadas proceduralmente = <b>' + U.num(m.totalNodos) + '</b>.</p>' +
      '<p><b>Combate:</b> los duelos y los combates espaciales son escenas por turnos con tácticas reales, no tiradas de dados invisibles.</p>' +
      '<p><b>Compartir:</b> al morir obtienes un enlace. Quien lo abra ve tu vida sin instalar nada.</p>',
      function () { UI.pantallaInicio(); });
  };

  /* ============================================================
     PANTALLA: CREACIÓN DE PERSONAJE
     ============================================================ */
  UI.pantallaCrear = function () {
    const rng = new SW.RNG('creador' + Date.now());
    const esp = rng.pick(SW.ESPECIES);
    UI.creador = {
      rng: rng,
      nombre: SW.genNombreCompleto(rng, esp.id),
      especie: esp.id,
      era: 'rebelion',
      mundo: rng.pick(esp.home),
      rasgo: 'ninguno',
      pronombre: 'elle',
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

  UI.renderCrear = function () {
    const c = UI.creador;
    const esp = SW.ESPECIES.filter(function (e) { return e.id === c.especie; })[0];
    const era = SW.ERAS.filter(function (e) { return e.id === c.era; })[0];
    const rasgo = SW.RASGOS.filter(function (r) { return r.id === c.rasgo; })[0];

    let h = '<div class="pantalla crear"><div class="crt-frame ancho">';
    h += '<div class="cab"><h2>FICHA DE ORIGEN</h2><button class="btn mini" data-a="volver">◂ volver</button></div>';
    h += '<div class="crear-grid">';

    /* --- columna retrato --- */
    h += '<div class="col-retrato">';
    h += '<div class="holo-marco">' + SW.retrato(c.apariencia, 190) + '</div>';
    h += '<button class="btn mini bloque" data-a="rand-cara">⟳ generar aspecto</button>';
    h += '<div class="ap-controles">';
    ['piel', 'ojos', 'pelo', 'marca', 'tocado', 'ropa'].forEach(function (k) {
      const opts = SW.APARIENCIA[k];
      h += '<label>' + U.titleCase(k) + '<select data-ap="' + k + '">' +
        opts.map(function (o) {
          const etq = SW.NOMBRE_COLOR[o] || o;
          const est = o.charAt(0) === '#' ? ' style="background:' + o + ';color:#04070c"' : '';
          return '<option value="' + U.esc(o) + '"' + est + (c.apariencia[k] === o ? ' selected' : '') + '>' + U.esc(etq) + '</option>';
        }).join('') +
        '</select></label>';
    });
    h += '<label>Cráneo<select data-ap="forma">' + [0, 1, 2, 3].map(function (i) {
      return '<option value="' + i + '"' + (c.apariencia.forma === i ? ' selected' : '') + '>tipo ' + (i + 1) + '</option>';
    }).join('') + '</select></label>';
    h += '</div></div>';

    /* --- columna datos --- */
    h += '<div class="col-datos">';
    h += '<label class="campo">NOMBRE<div class="fila"><input id="in-nombre" value="' + U.esc(c.nombre) + '" maxlength="34"><button class="btn mini" data-a="rand-nombre">⟳</button></div></label>';

    h += '<label class="campo">TRATAMIENTO<select data-set="pronombre">' +
      ['elle', 'ella', 'él'].map(function (p) { return '<option value="' + p + '"' + (c.pronombre === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label>';

    h += '<div class="campo">ESPECIE<div class="chips">';
    SW.ESPECIES.forEach(function (e) {
      h += '<button class="chip' + (e.id === c.especie ? ' on' : '') + '" data-esp="' + e.id + '">' + U.esc(e.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(esp.rasgo) + ' <span class="dim">· esperanza de vida ~' + esp.vida + ' años</span></p></div>';

    h += '<div class="campo">ERA<div class="chips">';
    SW.ERAS.forEach(function (e) {
      h += '<button class="chip' + (e.id === c.era ? ' on' : '') + '" data-era="' + e.id + '">' + U.esc(e.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(era.desc) + ' <span class="dim">(' + era.y + ')</span></p></div>';

    h += '<label class="campo">MUNDO NATAL<select data-set="mundo">';
    const mundos = esp.home.concat(SW.MUNDO_NOMBRES.filter(function (m) { return esp.home.indexOf(m) < 0; }));
    mundos.forEach(function (m) {
      h += '<option value="' + U.esc(m) + '"' + (c.mundo === m ? ' selected' : '') + '>' + U.esc(m) + '</option>';
    });
    h += '</select><p class="nota">' + U.esc(SW.mundo(c.mundo).vibe) + '</p></label>';

    h += '<div class="campo">ORIGEN<div class="chips">';
    SW.RASGOS.forEach(function (r) {
      h += '<button class="chip' + (r.id === c.rasgo ? ' on' : '') + '" data-rasgo="' + r.id + '">' + U.esc(r.n) + '</button>';
    });
    h += '</div><p class="nota">' + U.esc(rasgo.desc) + '</p></div>';

    h += '<label class="campo">SEMILLA <span class="dim">(opcional — misma semilla, misma vida)</span><input id="in-semilla" value="' + U.esc(c.semilla) + '" placeholder="dejar vacío = azar"></label>';

    h += '<div class="acciones"><button class="btn grande" data-a="empezar">▸ EMPEZAR VIDA</button>' +
      '<button class="btn fantasma" data-a="rand-todo">⟳ todo al azar</button></div>';
    h += '</div>';

    h += '</div></div></div>';
    UI.app.innerHTML = h;
    UI.bindCrear();
  };

  UI.bindCrear = function () {
    const c = UI.creador;
    UI.app.onclick = function (e) {
      const t = e.target;
      const b = t.closest('[data-a],[data-esp],[data-era],[data-rasgo]');
      if (!b) return;
      if (b.dataset.esp) {
        c.especie = b.dataset.esp;
        const esp = SW.ESPECIES.filter(function (x) { return x.id === c.especie; })[0];
        if (esp.home.indexOf(c.mundo) < 0) c.mundo = esp.home[0];
        c.nombre = SW.genNombreCompleto(c.rng, c.especie);
        UI.leerCampos(); c.especie = b.dataset.esp; UI.renderCrear(); return;
      }
      if (b.dataset.era) { UI.leerCampos(); c.era = b.dataset.era; UI.renderCrear(); return; }
      if (b.dataset.rasgo) { UI.leerCampos(); c.rasgo = b.dataset.rasgo; UI.renderCrear(); return; }
      const a = b.dataset.a;
      if (a === 'volver') { UI.pantallaInicio(); return; }
      if (a === 'rand-cara') { UI.leerCampos(); c.apariencia = UI.aparienciaAleatoria(c.rng); UI.renderCrear(); return; }
      if (a === 'rand-nombre') { UI.leerCampos(); c.nombre = SW.genNombreCompleto(c.rng, c.especie); UI.renderCrear(); return; }
      if (a === 'rand-todo') {
        const rng = c.rng;
        const esp = rng.pick(SW.ESPECIES);
        c.especie = esp.id; c.era = rng.pick(SW.ERAS).id; c.mundo = rng.pick(esp.home);
        c.rasgo = rng.weighted(SW.RASGOS).id; c.nombre = SW.genNombreCompleto(rng, esp.id);
        c.apariencia = UI.aparienciaAleatoria(rng);
        UI.renderCrear(); return;
      }
      if (a === 'empezar') { UI.leerCampos(); UI.empezar(); return; }
    };
    UI.app.onchange = function (e) {
      const t = e.target;
      if (t.dataset.ap) {
        c.apariencia[t.dataset.ap] = t.dataset.ap === 'forma' ? parseInt(t.value, 10) : t.value;
        UI.leerCampos(); UI.renderCrear();
      } else if (t.dataset.set) {
        c[t.dataset.set] = t.value;
        UI.leerCampos(); UI.renderCrear();
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
    UI.app.onclick = null; UI.app.onchange = null;
    UI.renderJuego();
  };

  UI.vidaRapida = function () {
    const rng = new SW.RNG('rapida' + Date.now() + Math.random());
    const esp = rng.pick(SW.ESPECIES);
    UI.juego = new SW.Game({
      semilla: 'r' + Date.now() + Math.random(),
      nombre: SW.genNombreCompleto(rng, esp.id),
      especie: esp,
      era: rng.pick(SW.ERAS),
      mundo: rng.pick(esp.home),
      rasgo: rng.weighted(SW.RASGOS),
      apariencia: UI.aparienciaAleatoria(rng),
      pronombre: 'elle'
    });
    UI.app.onclick = null; UI.app.onchange = null;
    UI.renderJuego();
  };

  /* ============================================================
     PANTALLA: JUEGO
     ============================================================ */
  UI.renderJuego = function () {
    const g = UI.juego, s = g.s;
    if (s.muerto && g.fase === 'fin' && !g.cola.length) { UI.pantallaFin(); return; }

    let h = '<div class="pantalla juego"><div class="hud">';

    /* barra superior */
    h += '<header class="topbar">' +
      '<div class="tb-id"><b>' + U.esc(s.nombre) + '</b><span>' + U.esc(s.especieN) + ' · ' + U.esc(s.rasgoN) + '</span></div>' +
      '<div class="tb-edad"><b>' + s.edad + '</b><span>años</span></div>' +
      '<div class="tb-mundo"><b>' + U.esc(s.mundo) + '</b><span>' + U.esc(s.eraN) + '</span></div>' +
      '<div class="tb-cr"><b>' + U.cr(s.stats.creditos) + '</b><span>créditos</span></div>' +
      '<button class="btn mini" data-a="menu">≡</button>' +
      '</header>';

    h += '<div class="cuerpo">';

    /* panel izquierdo */
    h += '<aside class="panel">';
    h += '<div class="holo-mini">' + SW.retrato(s.apariencia, 120) + '</div>';
    h += '<div class="stats">';
    [['salud', 'Salud'], ['fuerza', 'Fuerza'], ['destreza', 'Destreza'], ['intelecto', 'Intelecto'],
     ['carisma', 'Carisma'], ['suerte', 'Suerte'], ['cordura', 'Cordura'], ['reputacion', 'Reputación'], ['notoriedad', 'Notoriedad']
    ].forEach(function (p) {
      h += '<div class="stat s-' + p[0] + '"><span>' + p[1] + '</span><div class="barra"><i style="width:' + s.stats[p[0]] + '%"></i></div><b>' + s.stats[p[0]] + '</b></div>';
    });
    const al = s.stats.alineamiento;
    h += '<div class="align"><span>Alineamiento</span><div class="align-barra"><i style="left:' + ((al + 100) / 2) + '%"></i></div><b>' + SW.etiquetaAlineamiento(al) + '</b></div>';
    h += '</div>';

    h += '<div class="ficha">';
    if (s.trabajo) h += '<div class="f-row"><span>Trabajo</span><b>' + U.esc(s.rango) + '</b></div>';
    if (s.sueldo) h += '<div class="f-row"><span>Sueldo</span><b>' + U.cr(s.sueldo) + '</b></div>';
    if (s.nave) h += '<div class="f-row"><span>Nave</span><b>' + U.esc(s.naveNombre || s.nave.n) + ' (' + s.naveEstado + '%)</b></div>';
    if (s.sable) h += '<div class="f-row"><span>Sable</span><b style="color:' + s.sable.hex + '">' + U.esc(s.sable.color) + ' · ' + U.esc(s.sable.forma) + '</b></div>';
    if (s.kyber && !s.sable) h += '<div class="f-row"><span>Cristal</span><b>' + U.esc(s.kyber.c) + '</b></div>';
    if (s.droide) h += '<div class="f-row"><span>Droide</span><b>' + U.esc(s.droide.nombre) + '</b></div>';
    if (s.mascota) h += '<div class="f-row"><span>Mascota</span><b>' + U.esc(s.mascota.nombre) + ' (' + U.esc(s.mascota.tipo) + ')</b></div>';
    if (s.carcelAños) h += '<div class="f-row alerta"><span>Prisión</span><b>' + s.carcelAños + ' años</b></div>';
    if (s.poderes.length) h += '<div class="f-row"><span>Poderes</span><b>' + s.poderes.length + '</b></div>';
    if (s.objetos.length) h += '<div class="f-row"><span>Objetos</span><b>' + s.objetos.length + '</b></div>';
    h += '<div class="f-row"><span>Mundos</span><b>' + s.contadores.mundosVisitados + '</b></div>';
    h += '</div>';

    if (s.relaciones.length) {
      h += '<div class="ficha rels"><h4>Gente</h4>';
      s.relaciones.slice(-8).forEach(function (r) {
        h += '<div class="rel"><b>' + U.esc(r.nombre) + '</b><span>' + U.esc(r.tipo) + '</span>' +
          '<i class="' + (r.afecto >= 0 ? 'pos' : 'neg') + '" style="width:' + Math.abs(r.afecto) / 2 + '%"></i></div>';
      });
      h += '</div>';
    }
    h += '</aside>';

    /* consola central */
    h += '<main class="consola" id="consola">';
    h += UI.htmlConsola();
    h += '</main>';
    h += '</div>';

    /* barra inferior */
    h += '<footer class="acciones-bar">';
    if (g.cola.length) {
      h += '<div class="hint">Resuelve la situación para continuar…</div>';
    } else if (s.muerto) {
      h += '<button class="btn grande" data-a="fin">▸ VER RESUMEN DE VIDA</button>';
    } else {
      const acts = g.menuActividades();
      h += '<div class="acts">';
      acts.forEach(function (a) {
        h += '<button class="act' + (g.actividadUsada ? ' off' : '') + '" data-act="' + a.id + '" title="' + U.esc(a.desc) + '">' +
          '<i>' + a.ico + '</i><span>' + U.esc(a.n) + '</span></button>';
      });
      h += '</div>';
      h += '<button class="btn grande avanzar" data-a="avanzar">▸ AVANZAR AÑO ' + (s.edad + 1) + '</button>';
    }
    h += '</footer>';

    h += '</div></div>';
    UI.app.innerHTML = h;

    /* evento actual */
    if (g.cola.length) UI.mostrarEvento();

    const cons = $('#consola');
    if (cons) cons.scrollTop = cons.scrollHeight;

    UI.bindJuego();
    UI.guardarPartida();
  };

  UI.htmlConsola = function () {
    const g = UI.juego, s = g.s;
    let h = '';
    const hist = s.historia.slice(-70);
    let ultimaEdad = -1;
    hist.forEach(function (l) {
      if (l.edad !== ultimaEdad) {
        h += '<div class="año"><span>' + (l.edad === 0 ? 'AÑO 0' : 'AÑO ' + l.edad) + '</span></div>';
        ultimaEdad = l.edad;
      }
      h += '<p class="l l-' + l.tipo + '">' + l.txt + '</p>';
    });
    return h;
  };

  UI.mostrarEvento = function () {
    const g = UI.juego;
    const inst = g.cola[0];
    if (!inst) return;
    UI.instActual = inst;
    let h = '<div class="evento-overlay"><div class="evento">';
    h += '<div class="ev-texto">' + inst.texto + '</div>';
    h += '<div class="ev-ops">';
    inst.opciones.forEach(function (o, i) {
      h += '<button class="op" data-op="' + i + '"><span class="op-t">' + U.esc(o.txt) + '</span>' +
        (o.sub ? '<span class="op-s">' + U.esc(o.sub) + '</span>' : '') + '</button>';
    });
    h += '</div></div></div>';
    const div = document.createElement('div');
    div.innerHTML = h;
    UI.app.querySelector('.hud').appendChild(div.firstChild);
  };

  UI.bindJuego = function () {
    UI.app.onclick = function (e) {
      const b = e.target.closest('[data-a],[data-act],[data-op]');
      if (!b) return;
      if (b.dataset.op != null) { UI.elegirOpcion(parseInt(b.dataset.op, 10)); return; }
      if (b.dataset.act) {
        if (UI.juego.actividadUsada) { UI.flash('Ya has usado tu actividad de este año.'); return; }
        UI.juego.hacerActividad(b.dataset.act);
        UI.renderJuego(); return;
      }
      const a = b.dataset.a;
      if (a === 'avanzar') { UI.juego.avanzarAño(); UI.renderJuego(); return; }
      if (a === 'fin') { UI.pantallaFin(); return; }
      if (a === 'menu') { UI.menuPausa(); return; }
    };
  };

  UI.elegirOpcion = function (i) {
    const g = UI.juego;
    const inst = g.cola.shift();
    if (!inst) return;
    const op = inst.opciones[i];
    if (!op) return;
    const d = op.def;

    if (d.tactica) { g.log('› ' + op.txt, 'eleccion'); g.resolverTactica(d.tactica); }
    else if (d.tacticaN) { g.log('› ' + op.txt, 'eleccion'); g.resolverTacticaNave(d.tacticaN); }
    else { g.elegir(inst, i); g.aplicarExtra(d); }

    if (!g.cola.length && !g.s.muerto) g.fase = 'menu';
    UI.renderJuego();
  };

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
      '</div>',
      null,
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
     PANTALLA: FIN DE VIDA
     ============================================================ */
  UI.pantallaFin = function () {
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
      '<button class="btn" data-a="descargar">⭳ DESCARGAR TARJETA (.html)</button>' +
      '<button class="btn fantasma" data-a="otra">▸ OTRA VIDA</button>' +
      '</div>';
    h += '<div id="zona-link" class="zona-link"></div>';
    h += '</div></div>';
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
        $('#zona-link').innerHTML = '<p class="ok">Enlace copiado. Pásaselo a quien quieras:</p><input class="link-input" value="' + U.esc(url) + '" readonly onclick="this.select()">';
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
    const css = document.getElementById('estilo-principal');
    const cssTxt = css ? '' : '';
    const html = '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>HOLOVIDA — ' + U.esc(d.n) + '</title>' +
      '<link rel="stylesheet" href="assets/style.css">' + cssTxt +
      '</head><body class="solo-tarjeta"><div class="pantalla"><div class="crt-frame ancho">' +
      SW.tarjetaResumen(d) + '</div></div></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'holovida-' + d.n.replace(/\s+/g, '-').toLowerCase() + '.html';
    a.click();
  };

  /* ============================================================
     PANTALLA: RESUMEN COMPARTIDO
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
     MODALES / GUARDADO
     ============================================================ */
  UI.modal = function (titulo, contenido, onCerrar, onRender) {
    const d = document.createElement('div');
    d.className = 'modal-overlay';
    d.innerHTML = '<div class="modal"><div class="modal-cab"><h3>' + U.esc(titulo) + '</h3>' +
      '<button class="btn mini" data-cerrar>✕</button></div><div class="modal-cuerpo">' + contenido + '</div></div>';
    document.body.appendChild(d);
    UI._modal = d;
    UI._modalCerrar = onCerrar;
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
      localStorage.setItem('holovida_save', JSON.stringify({ s: UI.juego.s, semilla: UI.juego.rng.seedStr, calls: UI.juego.rng.calls }));
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
      // reproduce el estado del generador para no repetir la misma secuencia
      for (let i = 0; i < (data.calls || 0); i++) g.rng.next();
      g.fase = 'menu';
      g.cola = [];
      UI.juego = g;
      UI.app.onclick = null;
      UI.renderJuego();
    } catch (e) {
      UI.pantallaInicio();
    }
  };

  SW.UI = UI;
  global.addEventListener('DOMContentLoaded', function () { UI.init(); });

})(window);

#!/usr/bin/env node
/* ============================================================
   HOLOVIDA :: empaquetador a un solo archivo
   Genera dist/holovida.html con el CSS y el JS incrustados,
   para poder enviar el juego entero por chat, correo o subirlo
   a cualquier sitio que solo acepte un fichero.

   Uso:  node tools/build-single.js [--body]
         --body  omite <!doctype>/<html>/<head>/<body> (para hosts
                 que envuelven el contenido ellos mismos)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const soloCuerpo = process.argv.indexOf('--body') >= 0;
const salida = process.argv[2] && process.argv[2].charAt(0) !== '-'
  ? process.argv[2]
  : path.join(raiz, 'dist', 'holovida.html');

const SCRIPTS = [
  'src/rng.js',
  'src/data-world.js',
  'src/data-careers.js',
  'src/data-world-ext.js',
  'src/data-careers-ext.js',
  'src/data-events-vida.js',
  'src/data-events-vida2.js',
  'src/data-events-actos.js',
  'src/data-events-actos2.js',
  'src/data-events-clon.js',
  'src/data-events-era.js',
  'src/engine.js',
  'src/summary.js',
  'src/ui.js'
];

const leer = function (rel) { return fs.readFileSync(path.join(raiz, rel), 'utf8'); };
// evita que un "</script>" dentro de una cadena cierre el bloque antes de tiempo
const seguro = function (js) { return js.replace(/<\/script>/gi, '<\\/script>'); };

const css = leer('assets/style.css');
const js = SCRIPTS.map(function (f) {
  return '/* ===== ' + f + ' ===== */\n' + leer(f);
}).join('\n');

const titulo = 'HOLOVIDA — una vida en una galaxia muy, muy lejana';
const desc = 'Simulador de vida retrofuturista ambientado en una galaxia muy, muy lejana. Crea tu personaje, elige tu camino y comparte el resumen de tu vida.';

const nucleo =
  '<title>' + titulo + '</title>\n' +
  '<style>\n' + css + '\n</style>\n' +
  '<div id="app"><noscript><p style="padding:24px">HOLOVIDA necesita JavaScript activado.</p></noscript></div>\n' +
  '<script>\n' + seguro(js) + '\n</script>\n';

const doc = soloCuerpo ? nucleo :
  '<!doctype html>\n<html lang="es">\n<head>\n' +
  '<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  '<meta name="description" content="' + desc + '">\n' +
  '<meta name="theme-color" content="#04070c">\n' +
  nucleo.replace('<div id="app">', '</head>\n<body>\n<div id="app">') +
  '</body>\n</html>\n';

fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, doc, 'utf8');

const kb = (Buffer.byteLength(doc, 'utf8') / 1024).toFixed(1);
console.log('✓ ' + path.relative(raiz, salida) + ' — ' + kb + ' KB, un solo archivo, sin dependencias.');

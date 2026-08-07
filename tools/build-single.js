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

// La lista de scripts se LEE DE index.html, no se escribe a mano.
// Antes estaba duplicada aquí y se quedó desfasada: el bundle salía
// sin la mitad de los ficheros nuevos y nadie se enteraba.
const indice = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const SCRIPTS = [];
const re = /<script[^>]+src=["']([^"']+\.js)["']/gi;
let m;
while ((m = re.exec(indice)) !== null) SCRIPTS.push(m[1]);
if (!SCRIPTS.length) {
  console.error('✗ No se ha encontrado ni un <script src> en index.html.');
  process.exit(1);
}

const leer = function (rel) {
  const abs = path.join(raiz, rel);
  if (!fs.existsSync(abs)) { console.error('✗ index.html pide ' + rel + ' y no existe.'); process.exit(1); }
  return fs.readFileSync(abs, 'utf8');
};
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

/* ---- red de seguridad: que el bundle lleve de verdad lo que dice ----
   Cada fichero registra algo en SW; si el empaquetado se dejara alguno
   fuera, el juego cargaría a medias sin dar ningún error visible. */
const FIRMAS = {
  'src/pixelart-retrato.js': 'SW.retratoPixel =',
  'src/fondo.js': 'SW.fondoDe =',
  'src/data-mundos-dosier.js': 'SW.dosierDe =',
  'src/data-eventos-locales.js': 'SW.EVENTOS_LOCALES',
  'src/data-events-cuna.js': 'SW.EVENTOS_CUNA',
  'src/data-riesgo.js': 'SW.cobrarPeligro =',
  'src/data-nave-taller.js': 'SW.MEJORAS_NAVE =',
  'src/data-carrera.js': 'SW.CIRCUITOS =',
  'src/data-fuerza-atencion.js': 'SW.virtuosismo =',
  'src/pixelart2.js': 'SW.pixel2 ='
};
// Se comprueban TODAS: si una de estas no está en el bundle es un fallo,
// tanto si el fichero se cayó de index.html como si no se empaquetó.
const faltan = Object.keys(FIRMAS).filter(function (f) { return doc.indexOf(FIRMAS[f]) < 0; });
if (faltan.length) {
  console.error('✗ El bundle ha salido incompleto. No aparece lo que define:');
  faltan.forEach(function (f) { console.error('   · ' + f + '  (busco "' + FIRMAS[f] + '")'); });
  console.error('  Revisa que index.html lo cargue y que el fichero exista.');
  process.exit(1);
}

const kb = (Buffer.byteLength(doc, 'utf8') / 1024).toFixed(1);
console.log('✓ ' + path.relative(raiz, salida) + ' — ' + kb + ' KB · ' +
            SCRIPTS.length + ' scripts, tomados de index.html.');

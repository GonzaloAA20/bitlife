/* ============================================================
   HOLOVIDA :: AUDITORÍA TEMPORAL
   Carga el juego entero en un sandbox y cruza especies × épocas ×
   mundos × años galácticos buscando incoherencias de canon:

     · especies que pueden nacer en un mundo que ya no existe
     · mundos destruidos sin fecha, o con fecha mal puesta
     · destrucciones de las que se sale siempre
     · eventos, carreras y objetos con época o mundo inventados

   Uso:  node tools/auditar-tiempo.js
   ============================================================ */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function cargar(){
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const files=[...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(m=>m[1]);
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;ctx.global=ctx;
  ctx.document={createElement:()=>({getContext:()=>({}),style:{}}),getElementById:()=>null,addEventListener:()=>{}};
  ctx.location={hash:'',href:''};ctx.navigator={userAgent:'node'};ctx.localStorage={getItem:()=>null,setItem:()=>{}};
  ctx.requestAnimationFrame=()=>{};ctx.setTimeout=setTimeout;ctx.devicePixelRatio=1;
  vm.createContext(ctx);
  const errs=[];
  for(const f of files){
    try{vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});}
    catch(e){errs.push(f+': '+e.message);}
  }
  return {ctx,SW:ctx.SW,errs,files};
}



const { SW, errs } = cargar();
const malos = errs.filter(e => !/ui\.js/.test(e));
if (malos.length) { console.log('ERRORES DE CARGA:', malos); process.exit(1); }

const P = [];
const UIcuna = (m, eraId) => {
  const y = (SW.ANIO_ERA || {})[eraId];
  if (y == null) return true;
  return !SW.mundoVivoEn || SW.mundoVivoEn(m, y);
};
const av = (cat, txt) => P.push({ cat, txt });

/* ---- fechas canónicas de referencia (año galáctico) ---- */
const DESTRUIDOS = {
  'Alderaan': { y: 0, q: 'La Estrella de la Muerte lo desintegra.' },
  'Jedha':    { y: 0, q: 'Disparo de prueba sobre la Ciudad Santa.' },
  'Scarif':   { y: 0, q: 'Disparo sobre la Ciudadela; el cinturón queda en llamas.' },
  'Kamino':   { y: -18, q: 'El Imperio desmantela Ciudad Tipoca.' },
  'Mandalore':{ y: -19, q: 'La Purga: la superficie queda vitrificada.' },
  'Hosnian Prime': { y: 34, q: 'Starkiller apaga el sistema Hosnian.' },
  /* Dathomir, Lasan y Malachor NO se destruyen: se arrasa a su gente
     (o se hunde un templo) y el planeta sigue estando. No van aquí. */
};

console.log('══════════ 1. ESPECIES × ÉPOCAS ══════════');
const ERAS = SW.ERAS.map(e => e.id);
SW.ESPECIES.forEach(esp => {
  const permitidas = esp.soloEra || ERAS;
  // ¿el mundo natal existe en cada época permitida?
  permitidas.forEach(eid => {
    if (eid === 'era_perdida') return;
    const y = (SW.ANIO_ERA || {})[eid];
    (esp.home || []).forEach(m => {
      if (!SW.mundo(m)) { av('mundo', 'especie ' + esp.id + ': mundo natal «' + m + '» NO EXISTE en la tabla'); return; }
      // sólo es un fallo si el creador puede acabar poniéndote ahí:
      // con otros mundos natales vivos, el filtro del creador lo evita
      if (!UIcuna(m, eid) && !(esp.home || []).some(h => UIcuna(h, eid))) {
        av('nacer', 'especie ' + esp.id + ' en ' + eid + ': su único mundo natal ' + m +
           ' ya no existe en ' + SW.formatoAnio(y));
      }
    });
  });
  // ¿la esperanza de vida cruza épocas coherentemente?
  const ritmo = esp.ritmo || 1;
  const añosReales = Math.round((esp.vida || 80) / ritmo);
  if (esp.soloEra && esp.soloEra.length) {
    const y0 = (SW.ANIO_ERA || {})[esp.soloEra[0]];
    if (y0 != null) {
      const yFin = y0 + añosReales;
      const eraFin = SW.eraDeAnio(yFin);
      if (esp.soloEra.indexOf(eraFin) < 0) {
        av('vida', 'especie ' + esp.id + ' (solo ' + esp.soloEra.join('/') + ') nace en ' +
           SW.formatoAnio(y0) + ' y muere de viejo en ' + SW.formatoAnio(yFin) + ', ya en ' + eraFin);
      }
    }
  }
});
console.log(P.length ? '' : '  ok');

console.log('\n══════════ 2. MUNDOS QUE DEJAN DE EXISTIR ══════════');
Object.keys(DESTRUIDOS).forEach(m => {
  const D = DESTRUIDOS[m];
  const existe = !!SW.mundo(m);
  const reg = (SW.MUNDOS_CAIDOS || {})[m];
  const marca = existe ? (reg ? 'registrado' : '★ SIN REGISTRAR') : 'no está en el juego';
  console.log('  ' + m.padEnd(16) + SW.formatoAnio(D.y).padStart(8) + '  ' + marca);
  if (existe && !reg) av('caido', m + ' se destruye en ' + SW.formatoAnio(D.y) + ' y no figura en MUNDOS_CAIDOS');
  if (existe && reg) {
    // ¿la primera época prohibida empieza antes o después del año real?
    const primera = reg.desde[0];
    const lim = (SW.LIMITES_ERA || []).filter(l => l.id === primera)[0];
    const desdeY = lim ? (SW.LIMITES_ERA[SW.LIMITES_ERA.indexOf(lim) - 1] || { hasta: -9999 }).hasta : null;
    if (desdeY != null && Math.abs(desdeY - D.y) > 6) {
      av('caido', m + ': destruido en ' + SW.formatoAnio(D.y) + ' pero el juego lo corta al entrar en «' +
         primera + '», que empieza en ' + SW.formatoAnio(desdeY) + ' (desfase de ' + Math.abs(desdeY - D.y) + ' años)');
    }
  }
});

console.log('\n══════════ 3. ¿SE PUEDE MORIR EN LA DESTRUCCIÓN? ══════════');
{
  const humano = SW.ESPECIES.filter(e => e.id === 'humano')[0];
  Object.keys(DESTRUIDOS).forEach(m => {
    if (!SW.FIN_DE_MUNDO || !SW.FIN_DE_MUNDO[m]) { av('evacuar', m + ' no tiene fecha exacta de fin'); return; }
    const F = SW.FIN_DE_MUNDO[m];
    const g = new SW.Game({ semilla: 'fin' + m, nombre: 'X', especie: humano,
      era: SW.ERAS[1], mundo: 'Coruscant', rasgo: SW.RASGOS[0], apariencia: { forma: 0 },
      pronombre: 'el', ambicion: null, dificultad: 'normal' });
    g.s.mundo = m;
    g.s.anioNace = F.y - 30; g.s.edad = 30; g.s.edadBio = 30;
    Object.assign(g.s.stats, { destreza: 55, carisma: 55, suerte: 50, creditos: 40000 });
    const esc = SW.escenaFinDeMundo(g);
    if (!esc) { av('evacuar', m + ': no se genera escena de fin'); return; }
    const ps = esc.c.filter(o => o.finMundo).map(o => o.finMundo.p);
    const mejor = Math.max.apply(null, ps.concat([0]));
    const puedeMorir = ps.some(p => p < 1);
    console.log('  ' + m.padEnd(15) + SW.formatoAnio(F.y).padStart(8) +
      (F.aviso ? '  avisa ' + F.aviso + ' año(s)' : '  SIN AVISO      ') +
      '  · mejor salida a pie ' + Math.round(mejor * 100) + '%' +
      (puedeMorir ? '  · se puede morir ✓' : '  · ✗ NO se puede morir'));
    if (!puedeMorir) av('evacuar', m + ': de la destrucción se sale siempre');
  });
}

console.log('\n══════════ 4. CARRERAS × ÉPOCA ══════════');
(SW.CARRERAS || []).forEach(c => {
  if (!c.era) return;
  c.era.forEach(e => { if (ERAS.indexOf(e) < 0) av('carrera', 'carrera ' + c.id + ' usa época inexistente: ' + e); });
});
const carrerasSinEra = (SW.CARRERAS || []).filter(c => !c.era).length;
console.log('  ' + (SW.CARRERAS || []).length + ' carreras · ' + carrerasSinEra + ' sin restricción de época');

console.log('\n══════════ 5. EVENTOS CON ÉPOCA O MUNDO ══════════');
const pools = ['EVENTOS', 'ACTOS', 'GUION'];
let conEra = 0, conMundo = 0;
const revisar = (e) => {
  if (e.era) {
    conEra++;
    (Array.isArray(e.era) ? e.era : [e.era]).forEach(x => {
      if (ERAS.indexOf(x) < 0) av('evento', 'evento ' + e.id + ' usa época inexistente: ' + x);
    });
  }
  if (e.mundo) {
    conMundo++;
    (Array.isArray(e.mundo) ? e.mundo : [e.mundo]).forEach(m => {
      if (!SW.mundo(m)) av('evento', 'evento ' + e.id + ' usa mundo inexistente: ' + m);
    });
  }
  if (e.esp) (Array.isArray(e.esp) ? e.esp : [e.esp]).forEach(x => {
    if (!SW.ESPECIES.some(s => s.id === x)) av('evento', 'evento ' + e.id + ' usa especie inexistente: ' + x);
  });
};
pools.forEach(p => {
  const arr = SW[p];
  if (Array.isArray(arr)) arr.forEach(revisar);
  else if (arr) Object.keys(arr).forEach(k => (arr[k] || []).forEach(revisar));
});
console.log('  ' + conEra + ' eventos atados a época · ' + conMundo + ' atados a mundo');

console.log('\n══════════ 6. TECNOLOGÍA Y OBJETOS FUERA DE SU TIEMPO ══════════');
const TECNO = [
  { re: /sable de luz|sable láser/i, desde: -25000, hasta: 9999 },
  { re: /destructor estelar/i, desde: -22, hasta: 40 },
  { re: /caza TIE|\bTIE\b/i, desde: -19, hasta: 40 },
  { re: /ala-?X|X-wing/i, desde: -2, hasta: 9999 },
  { re: /estrella de la muerte/i, desde: -19, hasta: 5 },
  { re: /droide de combate B1|superdroide/i, desde: -32, hasta: -19 },
  { re: /soldado de asalto|stormtrooper/i, desde: -19, hasta: 12 }
];
let objTiempo = 0;
(SW.OBJETOS || []).forEach(o => {
  TECNO.forEach(t => { if (t.re.test(o.n)) objTiempo++; });
});
console.log('  ' + (SW.OBJETOS || []).length + ' objetos · ' + objTiempo + ' con tecnología datable');

console.log('\n══════════ 7. NACER EN UN MUNDO QUE YA NO EXISTE ══════════');
let cuna = 0;
SW.ESPECIES.forEach(esp => {
  (esp.soloEra || ERAS).forEach(eid => {
    if (eid === 'era_perdida') return;
    const vivos = (esp.home || []).filter(m => UIcuna(m, eid));
    if (!vivos.length) {
      cuna++;
      av('cuna', 'especie ' + esp.id + ' en «' + eid + '»: NINGUNO de sus mundos natales existe ya (' +
         (esp.home || []).join(', ') + ')');
    }
  });
});
if (!cuna) console.log('  ok — toda especie tiene al menos una cuna posible en cada época suya');

/* ---------------- resumen ---------------- */
console.log('\n══════════ RESULTADO ══════════');
if (!P.length) { console.log('✓ sin problemas'); process.exit(0); }
const porCat = {};
P.forEach(p => { (porCat[p.cat] = porCat[p.cat] || []).push(p.txt); });
Object.keys(porCat).forEach(c => {
  console.log('\n[' + c + '] ' + porCat[c].length);
  porCat[c].slice(0, 14).forEach(t => console.log('   ✗ ' + t));
  if (porCat[c].length > 14) console.log('   … y ' + (porCat[c].length - 14) + ' más');
});
console.log('\nTOTAL: ' + P.length + ' incoherencias');

// Batería VISUAL (fase 1, ronda 33): compara capturas de pantallas clave con sus REFERENCIAS aprobadas (tests/visual/referencias/*.png).
// Detecta lo que se ve mal aunque ninguna medida concreta falle (como el nombre roto letra a letra en el móvil de Javier, ronda 32).
//   · Pantallas sin datos de la persona ni fechas: portada, Explorar (primera tanda), comparador AMZN–BKNG y «Cómo funciona», a 390 y 1440 px,
//     y Explorar y el comparador a 345 px con el texto del sistema al 118 % (como el Android de Javier).
//   · Sin movimiento (reducedMotion) y sin TradingView. Tolerancia: como mucho un 0,1 % de píxeles distintos.
//   · Para APROBAR un cambio visual intencionado: ACTUALIZAR=1 node tests/ronda33/testVisual.cjs y revisar las imágenes nuevas antes de commitear.
//   · Si una captura no coincide, se guarda la actual y un mapa de diferencias en <ronda>/visual/ para mirarlas.
const { chromium, B, ev, fin } = require('../ronda5/h.cjs');
const fs = require('fs'), path = require('path'), { PNG } = require('pngjs'), pixelmatch = require('pixelmatch');
const RAIZ = path.resolve(__dirname, '..', '..'), REF = path.join(RAIZ, 'tests/visual/referencias'), OUT = path.resolve(RAIZ, process.env.RONDA || 'ronda33', 'visual');
const ACT = process.env.ACTUALIZAR === '1', TOL = 0.001;   // en este entorno las capturas salen idénticas (0 píxeles); el fallo de la ronda 32 da 0,95 %
const PANTALLAS = [
  { id: 'portada', hash: '#inicio', espera: '.hero' },
  { id: 'explorar', hash: '#empresas', espera: '.ver-ficha >> visible=true', antes: async p => p.evaluate(() => document.querySelector('#vista-empresas h1').scrollIntoView()) },
  { id: 'comparador', hash: '#comparar-AMZN-BKNG', espera: '.tabla-cmp' },
  { id: 'como-funciona', hash: '#como-funciona', espera: '#vista-como-funciona:not([hidden])' },
];
const TAMANOS = [[390, 844, 1], [1440, 900, 1], [345, 760, 1.18]];
(async () => {
  fs.mkdirSync(REF, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const [w, h, escala] of TAMANOS) for (const pa of PANTALLAS) {
    if (escala !== 1 && !['explorar', 'comparador'].includes(pa.id)) continue;
    const nombre = `${pa.id}-${w}${escala !== 1 ? '-texto118' : ''}.png`;
    const c = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', deviceScaleFactor: 1 }), p = await c.newPage();
    await p.route(/tradingview\.com/, r => r.abort());
    if (escala !== 1) await p.addInitScript(e => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = (e * 100) + '%'; }), escala);
    await p.goto(B + pa.hash); await p.waitForSelector(pa.espera); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
    if (pa.antes) { await pa.antes(p); await p.waitForTimeout(200); }
    await p.addStyleTag({ content: '*{caret-color:transparent!important} .esq{animation:none!important}' });
    const buf = await p.screenshot(); await c.close();
    const ref = path.join(REF, nombre);
    if (ACT || !fs.existsSync(ref)) { fs.writeFileSync(ref, buf); ev(`VIS-${nombre}`, `Referencia ${ACT ? 'actualizada' : 'creada'}: ${nombre}`, 'revisar la imagen antes de commitear', ref.replace(RAIZ + '/', ''), true); continue; }
    const A = PNG.sync.read(fs.readFileSync(ref)), Bn = PNG.sync.read(buf);
    if (A.width !== Bn.width || A.height !== Bn.height) { fs.writeFileSync(path.join(OUT, nombre), buf); ev(`VIS-${nombre}`, `Captura igual a su referencia: ${nombre}`, 'mismo tamaño', `${A.width}×${A.height} → ${Bn.width}×${Bn.height}`, false); continue; }
    const dif = new PNG({ width: A.width, height: A.height }), n = pixelmatch(A.data, Bn.data, dif.data, A.width, A.height, { threshold: 0.12 }), frac = n / (A.width * A.height);
    if (frac > TOL) { fs.writeFileSync(path.join(OUT, nombre), buf); fs.writeFileSync(path.join(OUT, 'dif-' + nombre), PNG.sync.write(dif)); }
    ev(`VIS-${nombre}`, `Captura igual a su referencia: ${nombre}`, `≤ ${TOL * 100} % de píxeles distintos`, `${(frac * 100).toFixed(3)} % (${n} píxeles)`, frac <= TOL);
  }
  await b.close(); fin('evidencias-VIS33');
})();

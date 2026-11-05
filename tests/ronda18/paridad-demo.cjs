// Ronda 18 · la demo concatenada es ACEPTABLE solo si (1) reconstruirla es reproducible y (2) hace lo mismo que los módulos compartidos con las mismas entradas.
//  (1) se construye dos veces y se comparan las huellas; (2) se carga el HTML de la demo en el navegador y se ejecutan sus funciones (`evaluar`, `validarResumen`, `normalizarFecha`,
//  `estadoSeguimiento`) con las MISMAS entradas que los módulos de `public/js/` en Node; las salidas deben ser idénticas. Uso: node tests/ronda18/paridad-demo.cjs
const { chromium, ev, fin } = require('../ronda5/h.cjs');
const { execFileSync } = require('child_process'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), DEMO = path.join(RAIZ, 'build', 'klever_demo_artifact.html');
const huella = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async () => {
  execFileSync('python3', ['scripts/demo/build_demo.py'], { cwd: RAIZ, stdio: 'ignore' }); const h1 = huella(DEMO);
  execFileSync('python3', ['scripts/demo/build_demo.py'], { cwd: RAIZ, stdio: 'ignore' }); const h2 = huella(DEMO);
  ev('PD1', 'Reconstruir la demo dos veces', 'Mismas huellas (la construcción es reproducible)', `${h1.slice(0, 16)} / ${h2.slice(0, 16)}`, h1 === h2);
  const nota = await import(path.join(RAIZ, 'public/js/nota.js')), cont = await import(path.join(RAIZ, 'public/js/contenido.js')), ui = await import(path.join(RAIZ, 'public/js/nota-ui.js'));
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/tradingview\.com/, r => r.abort()); await p.goto('file://' + DEMO); await p.waitForSelector('.hero');
  const universo = await p.evaluate(async () => (await fetch('/api/universo')).json());
  const carteras = [[{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], [{ ticker: 'KO', peso: 50 }, { ticker: 'JPM', peso: 50 }], [{ ticker: 'KO', peso: 100 }], [{ ticker: 'AAPL', peso: 50 }, { ticker: 'MSFT', peso: 50 }], [{ ticker: 'KO', peso: 60 }]];
  const dem = await p.evaluate(([cs, u]) => cs.map(c => { const e = evaluar(c, u); return JSON.stringify({ publicada: e.publicada, nota: e.nota, motivo: e.motivo, res: resumenNota(e), poblacion: e.poblacion }); }), [carteras, universo]);
  const mod = carteras.map(c => { const e = nota.evaluar(c, universo); return JSON.stringify({ publicada: e.publicada, nota: e.nota, motivo: e.motivo, res: nota.resumenNota(e), poblacion: e.poblacion }); });
  ev('PD2', 'evaluar(): la demo y el módulo con las mismas cinco carteras sobre el mismo universo', 'Salidas idénticas (nota, motivo, resumen, población); KO + PG = 4,4 en ambos', `${carteras.length} carteras; KO+PG demo ${JSON.parse(dem[0]).nota} / módulo ${JSON.parse(mod[0]).nota}`, dem.every((x, i) => x === mod[i]) && JSON.parse(dem[0]).nota === 4.4 && JSON.parse(dem[0]).poblacion.ficticias === 21);
  const fechas = ['2026-11-04', '2026-11-04 10:00:00', '2026-11-04basura', '2026-11-04 25:00:00', 'ayer', null], resumenes = [JSON.parse(mod[0]).res, { ...JSON.parse(mod[0]).res, nota: 10 }, { ...JSON.parse(mod[0]).res, version: 'foo' }];
  const [fd, vd] = await p.evaluate(([f, r]) => [f.map(x => normalizarFecha(x)), r.map(x => { const v = validarResumen(x, { guardar: true }); return [v.ok, v.motivo ?? null]; })], [fechas, resumenes]);
  const fm = fechas.map(x => nota.normalizarFecha(x)), vm = resumenes.map(x => { const v = nota.validarResumen(x, { guardar: true }); return [v.ok, v.motivo ?? null]; });
  ev('PD3', 'normalizarFecha() y validarResumen(): la demo y el módulo con las mismas entradas', 'Mismas salidas (fechas válidas e inválidas; resumen coherente, nota 10 y versión «foo»)', `${JSON.stringify(fd)} ; ${JSON.stringify(vd.map(x => x[0]))}`, JSON.stringify(fd) === JSON.stringify(fm) && JSON.stringify(vd) === JSON.stringify(vm));
  const casos = [{ historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', pregunta: '¿Se han firmado los dos contratos anunciados?' }, { historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', pregunta: 'otra cosa' }, { historia: 'hidrogeno-norte', pregunta_ref: null, pregunta: 'x' }, { historia: 'otra', pregunta_ref: 'hidrogeno-norte:1', pregunta: 'x' }, { historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:99', pregunta: 'x' }];
  const sd = await p.evaluate(cs => cs.map(c => { const e = estadoSeguimiento(c); return [e.tipo, !!e.distinta, !!e.refInvalida]; }), casos), sm = casos.map(c => { const e = cont.estadoSeguimiento(c); return [e.tipo, !!e.distinta, !!e.refInvalida]; });
  ev('PD4', 'estadoSeguimiento(): la demo y el módulo con las mismas cinco entradas (incluido el par discordante)', 'Mismas salidas', `${JSON.stringify(sd)}`, JSON.stringify(sd) === JSON.stringify(sm) && sd[3][0] !== 'responde');
  ev('PD5', 'Sin errores de JavaScript al cargar la demo y ejecutar sus funciones', 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
  await b.close(); fin('evidencias-PD18');
})();

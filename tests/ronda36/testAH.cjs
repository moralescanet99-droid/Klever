// Batería AH (ronda 36): LIGA, Temporada 0, de punta a punta con dos personas. Servidor real, 390 / 1440 / 320 px.
//   AH1 desde «Hoy», el acceso a la Liga lleva a #liga; inscribir la cartera muestra puntos, la barra de la semana y su desglose
//   AH2 apodo y clasificación general (solo si se hace pública); el apodo nunca es un correo
//   AH3 liga privada: crear → código → la otra persona abre el enlace de invitación (?liga=CÓDIGO), entra y se une con el código ya escrito; ambas se ven en la clasificación privada
//   AH4 al salir, la Liga (apodos y puntos) desaparece de la página
//   AH0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const entrar = async (p, email, url = B) => { await p.goto(url); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForTimeout(900); };
  const cartera = p => p.evaluate(async () => { await fetch('/api/portfolios', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ nombre: 'Repartida', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 20 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }, { ticker: 'JPM', peso: 20 }] }) }); });
  for (const [w, h] of [[390, 844], [1440, 900], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    await entrar(p, mail('AHa' + w)); await cartera(p);
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#hoy-liga:not([hidden]) .hoy-liga'); await p.click('.hoy-liga'); await p.waitForSelector('#liga-inscribir');
    await p.click('#liga-inscribir button'); await p.waitForSelector('.lg-total'); await p.waitForTimeout(300);
    const a1 = await p.evaluate(() => ({ hash: location.hash, titulo: document.title, total: document.querySelector('.lg-num').textContent, barras: document.querySelectorAll('.lg-semanas .lg-sem').length, desglose: [...document.querySelectorAll('.lg-mio .peq')].map(x => x.textContent).join(' '), juegas: document.querySelector('.lg-juegas')?.textContent }));
    ev('AH1-' + w, `Inscribirse en la Liga (${w} px)`, '#liga, «Klever · Liga»; 60 puntos esta semana (equilibrio 50 + constancia 10); una barra; desglose; «Juegas con «Repartida»»', J(a1), a1.hash === '#liga' && a1.titulo === 'Klever · Liga' && a1.total === '60' && a1.barras === 1 && /equilibrio 50/.test(a1.desglose) && /Repartida/.test(a1.juegas || ''));
    await mira('liga');
    await p.fill('#lg-apodo', 'yo@correo.es'); await p.click('#liga-perfil button'); await p.waitForTimeout(500); const errApodo = await p.textContent('#liga-perfil .error');
    const apodo = ('Ana' + w).slice(0, 12); await p.fill('#lg-apodo', apodo); await p.check('#liga-perfil input[name=publica]'); await p.click('#liga-perfil button'); await p.waitForSelector('.lg-clas li.tu'); await p.waitForTimeout(300);
    const gen = await p.evaluate(() => [...document.querySelectorAll('.lg-clas li')].map(l => l.textContent.replace(/\s+/g, ' ').trim()));
    ev('AH2-' + w, `Apodo y clasificación general (${w} px)`, 'un correo como apodo se rechaza; con apodo y «aparecer» activado, sales en la clasificación general marcado como tú', J({ errApodo, gen }), /correo/.test(errApodo) && gen.some(t => t.includes(apodo) && /60/.test(t)));
    await p.fill('#lg-nombre', 'Los del piso ' + w); await p.click('#liga-crear button'); await p.waitForSelector('.lg-priv'); const codigo = (await p.textContent('.lg-codigo')).trim();
    // la otra persona abre el enlace de invitación
    const q = await nuevo(b, w, h); q.on('pageerror', e => errs.push(e.message));
    await entrar(q, mail('AHb' + w), B + '?liga=' + codigo); await q.waitForSelector('#vista-liga:not([hidden]) #liga-unirse', { timeout: 15000 });
    const pre = await q.inputValue('#lg-codigo'); await cartera(q); await q.click('#liga-unirse button'); await q.waitForSelector('.lg-priv');
    await q.evaluate(() => { location.hash = '#carteras'; }); await q.waitForTimeout(300); await q.evaluate(() => { location.hash = '#liga'; }); await q.waitForSelector('#liga-inscribir'); await q.click('#liga-inscribir button'); await q.waitForSelector('.lg-total');
    await q.waitForTimeout(300); const priv = await q.evaluate(() => [...document.querySelectorAll('.lg-priv .lg-clas li')].map(l => l.textContent.replace(/\s+/g, ' ').trim()));
    ev('AH3-' + w, `Liga privada con invitación (${w} px)`, `el enlace ?liga=${codigo} lleva a la Liga tras entrar, con el código ya escrito; tras unirse e inscribirse, la clasificación privada tiene «Tú» y «${apodo}»; sin correos`, J({ pre, priv }),
      pre === codigo && priv.length === 2 && priv.some(t => /Tú/.test(t)) && priv.some(t => t.includes(apodo)) && !priv.join(' ').includes('@'));
    await q.ctx.close();
    await p.evaluate(() => (document.querySelector('#salir:not([hidden])') || document.querySelector('#salir-m')).click()); await p.waitForTimeout(800);
    const tras = await p.evaluate(() => ({ cuerpo: document.querySelector('#liga-cuerpo').textContent.includes('Los del piso'), apodo: document.body.innerText.includes('Ana') }));
    ev('AH4-' + w, `Al salir, la Liga desaparece (${w} px)`, 'ni la liga privada ni el apodo en la página', J(tras), !tras.cuerpo && !tras.apodo);
    ev('AH0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún error; ancho = ventana', J({ errs, desb }), !errs.length && !desb.length);
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-AH36');
})();

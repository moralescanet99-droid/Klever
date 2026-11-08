// Batería Y (ronda 28, fase 2 del plan): móvil y descubrir. Servidor real, datos ficticios, 1440 / 390 / 320 px.
//   Y1 barra inferior: en móvil, 3 destinos y el actual marcado; no aparece en el editor ni en el laboratorio; en escritorio no existe a la vista
//   Y2 pegar «KO 40, PG 60, ZZZZ 5» en el buscador del editor: crea las dos posiciones y dice qué no reconoce
//   Y3 Explorar → «Probar» abre el laboratorio con esa empresa
//   Y4 señal en tres niveles al pulsar y umbrales propios (cambian las señales y «Mis carteras» los respeta)
//   Y5 renombrados: el Cuaderno dice «Mis ideas» y «Empresas que sigo»; la ficha, «Seguir esta empresa»; sin «escenario» ni «radar» a la vista
//   Y6 preguntas de ejemplo al guardar una idea · Y0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin, revision } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], movil = w < 720; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
    const desb = []; const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    const tab = () => p.evaluate(() => { const t = document.querySelector('#tabbar'), v = !!t && getComputedStyle(t).display !== 'none'; return { visible: v, enlaces: v ? [...t.querySelectorAll('a')].map(a => a.textContent.trim()) : [], actual: t?.querySelector('[aria-current=page]')?.textContent.trim() || null }; });

    // ---- Y1 barra inferior
    await p.goto(B + '#inicio'); await p.waitForSelector('.hero'); await p.waitForTimeout(300); const enInicio = await tab(); await mira('inicio');
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(300); const enEmp = await tab();
    await p.goto(B + '#inicio'); await p.waitForSelector('.plantilla'); await p.click('[data-plantilla="riesgo"]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(300); const enEditor = await tab();
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.waitForTimeout(300); const enLab = await tab();
    ev('Y1-' + w, `Barra inferior (${w} px): ${movil ? 'tres destinos y el actual marcado; oculta en el editor y el laboratorio' : 'no se muestra en escritorio'}`, movil ? 'Carteras · Descubrir · Cuaderno; portada → Carteras; Explorar → Descubrir; editor y laboratorio sin barra' : 'oculta en todas las vistas',
      J({ enInicio, enEmp, enEditor, enLab }), movil ? (J(enInicio.enlaces.map(x => x.replace(/^\W+/, ''))) === J(['Carteras', 'Descubrir', 'Cuaderno']) && /Carteras/.test(enInicio.actual) && /Descubrir/.test(enEmp.actual) && !enEditor.visible && !enLab.visible) : (!enInicio.visible && !enEmp.visible && !enEditor.visible));

    // ---- Y2 pegar una lista
    await p.goto(B + '#inicio'); await p.waitForSelector('#entrada-manual'); await p.click('#entrada-manual'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(300);
    await p.fill('#buscar-activo', 'KO 40, PG 60, ZZZZ 5'); await p.waitForTimeout(150); const ayuda = await p.evaluate(() => !document.querySelector('#pegado-ayuda').hidden);
    await p.press('#buscar-activo', 'Enter'); await p.waitForTimeout(400);
    const y2 = await p.evaluate(() => ({ pesos: Object.fromEntries([...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => [(e.getAttribute('aria-label') || '').match(/^Peso de ([A-Z.]+),/)?.[1], e.value])), total: document.querySelector('#comp-total').textContent, res: document.querySelector('#pegado-res').textContent, campo: document.querySelector('#buscar-activo').value }));
    ev('Y2-' + w, `Pegar «KO 40, PG 60, ZZZZ 5» en el editor (${w} px)`, 'ayuda «Pulsa Intro» visible; KO 40 y PG 60 creadas (total 100 %); el aviso dice que ZZZZ no se reconoce; el campo queda vacío', J({ ayuda, y2 }),
      ayuda && y2.pesos.KO === '40,0' && y2.pesos.PG === '60,0' && /100/.test(y2.total) && /sin reconocer: ZZZZ/.test(y2.res) && y2.campo === ''); await mira('editor');

    // ---- Y3 Explorar → Probar
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(500);
    await p.locator('[data-probar-emp="JNJ"] >> visible=true').first().click(); await p.waitForSelector('#lab-form'); await p.waitForTimeout(300);
    const y3 = await p.evaluate(() => ({ t: document.querySelector('#lab-ticker').value, peso: document.querySelector('#lab-peso').value, rango: !!document.querySelector('#lab-rango') }));
    ev('Y3-' + w, `Explorar → «Probar» (${w} px)`, 'el laboratorio llega con JNJ y 10 %, con el deslizador listo', J(y3), y3.t === 'JNJ' && y3.peso === '10' && y3.rango); await mira('explorar');

    // ---- Y4 señal en tres niveles y umbrales propios (cuenta con una cartera concentrada)
    await entrarCon(p, mail('Y' + w));
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Concentrada Y', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 35 }, { ticker: 'MSFT', peso: 5 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }] })).j;
    await p.evaluate(i => { location.hash = '#cartera-' + i; }, c.id); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 5); await p.waitForTimeout(300);
    await revision(p); await p.waitForSelector('#nota-cuerpo .senal'); await p.waitForTimeout(300);
    const antes4 = await p.$$eval('#nota-cuerpo .senal', l => l.map(x => x.dataset.senal));
    await p.click('#nota-cuerpo [data-senal="posicion"]'); await p.waitForTimeout(200);
    const niveles = await p.evaluate(() => [...document.querySelectorAll('.senal-det.elegida p b')].map(b => b.textContent));
    await p.click('#vz-mas-b'); await p.waitForSelector('#umb-pos'); await p.fill('#umb-pos', '50'); await p.click('#umb-form button[type=submit]'); await p.waitForTimeout(300);
    const despues4 = await p.$$eval('#nota-cuerpo .senal', l => l.map(x => x.dataset.senal)), catTxt = await p.evaluate(() => { document.querySelector('#nota-cuerpo [data-senal="categoria"]')?.click(); return new Promise(r => setTimeout(() => r(document.querySelector('.senal-det')?.textContent || ''), 150)); });
    ev('Y4-' + w, `Señal en tres niveles y umbrales propios (${w} px)`, 'antes: categoria + posicion; al pulsar: «Qué es / Por qué importa / Qué probar»; con posición 50 %: ya no hay «posicion» y el detalle dice «Tu referencia»',
      J({ antes4, niveles, despues4, catTxt: catTxt.slice(0, 120) }), antes4.includes('categoria') && antes4.includes('posicion') && J(niveles) === J(['Qué es:', 'Por qué importa:', 'Qué probar:']) && !despues4.includes('posicion') && /Tu referencia/.test(catTxt));
    await p.evaluate(() => localStorage.removeItem('klever_umbrales'));

    // ---- Y6 preguntas de ejemplo al guardar una idea
    await p.click('#vz-probar'); await p.waitForSelector('#lab-guardar-btn', { timeout: 10000 }); await p.click('[data-pregunta] >> nth=0'); await p.waitForTimeout(150);
    const preg = await p.inputValue('#lab-pregunta');
    ev('Y6-' + w, `Preguntas de ejemplo al guardar una idea (${w} px)`, 'pulsar la primera rellena «¿Sigue creciendo NVDA?»', J(preg), preg === '¿Sigue creciendo NVDA?'); await mira('laboratorio');

    // ---- Y5 renombrados
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios'); await p.waitForTimeout(800);
    const seg = await p.evaluate(() => ({ h2: [...document.querySelectorAll('#vista-seguimiento h2')].map(h => h.textContent.replace(/\s*\(\d+\)\s*/, '').trim()), texto: document.querySelector('#vista-seguimiento').innerText }));
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForTimeout(500); await p.fill('#emp-buscar', 'KO'); await p.waitForTimeout(200); /* ronda 31: en el móvil la lista va por tandas; se busca la empresa */ await p.locator('.ver-ficha[data-t="KO"] >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(600);
    const ficha = await p.evaluate(() => document.querySelector('#dlg-ficha').innerText); await p.click('#dlg-ficha [data-cerrar]');
    ev('Y5-' + w, `Renombrados (${w} px): «idea» y «empresas que sigo»`, 'el Cuaderno tiene «Mis ideas» y «Empresas que sigo»; la ficha ofrece «Seguir esta empresa»; ni «escenario» ni «radar» a la vista', J({ h2: seg.h2, ficha: /Seguir esta empresa/.test(ficha) }),
      seg.h2.includes('Mis ideas') && seg.h2.includes('Empresas que sigo') && /Seguir esta empresa/.test(ficha) && !/escenario|radar/i.test(seg.texto + ficha)); await mira('cuaderno');

    ev('Y0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún pageerror; ninguna vista más ancha que la ventana', J({ errs, desb }), errs.length === 0 && desb.length === 0);
    await p.ctx.close();
  }
  await b.close(); await fin('evidencias-Y28');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-Y28'); });

const { chromium } = require('playwright');
const F=process.env.DEMO_URL||'http://localhost:8790/';
(async()=>{const b=await chromium.launch();let bad=0;const ok=(n,c,x='')=>{console.log((c?'OK   ':'FALLA')+' '+n+(c?'':' ['+x+']'));if(!c)bad++};
for(const [w,h] of [[390,844],[1440,900]]){
 const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(F);await p.waitForSelector('.plantilla');await p.waitForSelector('#muestra-publicas .tarjeta');
 ok(w+': portada, banner de demo, 3 plantillas, ejemplos con etiqueta',await p.locator('.demo-banner').count()===1&&await p.locator('.plantilla').count()===3&&(await p.locator('#muestra-publicas .chip.origen').allTextContents()).every(t=>t==='Ejemplo de Klever'));
 await p.click('[data-plantilla=dividendos]');await p.waitForSelector('#vista-cartera:not([hidden])');
 await p.locator('.peso-in').filter({visible:true}).first().fill('20');await p.waitForTimeout(150);
 ok(w+': 103 % → Guardar desactivado con motivo',await p.locator('.js-guardar >> visible=true').isDisabled()&&((await p.locator(w<900?'#b-estado':'#motivo').textContent())||'').match(/exceso|Exceso/));
 await p.locator('.peso-in').filter({visible:true}).first().fill('17');
 await p.click('.js-guardar >> visible=true');await p.waitForSelector('#dlg-acceso[open]');await p.fill('#acc-email','a@b.co');await p.check('#acc-acepto');await p.click('#form-acceso button');await p.waitForSelector('#demo-enter');await p.click('#demo-enter');await p.waitForTimeout(900);
 ok(w+': tras "simular enlace" la cartera queda en la cuenta',/^#cartera-\d+$/.test(await p.evaluate(()=>location.hash)));
 await p.evaluate(()=>{document.querySelector('#det-pub').open=true});await p.fill('#tesis','Dividendos.');await p.click('#publicar');await p.waitForFunction(()=>document.querySelector('#chip').textContent==='Pública');
 await p.goto(F+'#publicas');await p.waitForSelector('#publicas-lista .tarjeta');ok(w+': publicada con etiqueta de usuario',(await p.locator('#publicas-lista .chip.origen').allTextContents()).includes('Publicada por un usuario'));
 await p.goto(F+'#empresas');await p.waitForSelector('[data-t]:visible');await p.locator('[data-t]:visible').nth(1).click();await p.waitForSelector('#dlg-ficha[open]');ok(w+': ficha con 5 comprobaciones',await p.locator('#fi-cuerpo .checks li').count()===5);
 ok(w+': sin desbordamiento y sin errores',(await p.evaluate(()=>document.documentElement.scrollWidth))<=w&&errs.length===0,errs.join('|'));await c.close();}
{const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(F);await p.waitForSelector('.plantilla');const bn=(await p.textContent('.demo-banner'))||'';
 ok('banner: demostración sin persistencia de cuenta y no equivalente al servidor probado',bn.includes('sin persistencia de cuenta')&&bn.includes('al recargar se pierde todo')&&bn.includes('no es equivalente al servidor'));
 await p.click('[data-plantilla=dividendos]');await p.waitForSelector('#vista-cartera:not([hidden])');await p.click('.js-guardar >> visible=true');await p.waitForSelector('#dlg-acceso[open]');await p.fill('#acc-email','a@b.co');await p.check('#acc-acepto');await p.click('#form-acceso button');await p.waitForSelector('#demo-enter');await p.click('#demo-enter');
 await p.waitForFunction(()=>document.querySelector('#estado-live')?.textContent.includes('Guardada'));
 await p.locator('.peso-in >> visible=true').first().fill('10');await p.waitForTimeout(150);
 await p.check('#demo-fallo');await p.click('.js-guardar >> visible=true');await p.waitForTimeout(600);
 ok('demo: la casilla «Simular fallo de red al guardar» provoca un fallo explícito',((await p.textContent('#estado'))||'').trim().startsWith('No se pudo guardar')&&((await p.locator('.js-guardar >> visible=true').textContent())||'').trim()==='Reintentar guardado');
 await p.uncheck('#demo-fallo');await p.click('.js-guardar >> visible=true');await p.waitForFunction(()=>document.querySelector('#estado-live').textContent.startsWith('Guardada en tu cuenta'));ok('demo: al quitar la simulación, reintentar guarda',true);
 // ronda 13: recorrido radar → laboratorio → escenario en la demo (simulado en memoria; etiquetado como demostración)
 await p.evaluate(()=>{location.hash='#empresas'});await p.waitForSelector('.ver-ficha >> visible=true');await p.fill('#emp-buscar','AAPL');await p.waitForTimeout(250);
 const origen=((await p.textContent('#aviso-datos'))||'').trim();
 await p.locator('.ver-ficha >> visible=true').first().click();await p.waitForSelector('#fir-toggle');await p.click('#fir-toggle');await p.waitForSelector('#fi-radar [data-nota=editar]');
 ok('demo: el origen se declara como DEMOSTRACIÓN y no se atribuye a la SEC',/DEMOSTRACIÓN/.test(origen)&&!/SEC EDGAR/.test(await p.textContent('#fi-cuerpo')),origen);
 await p.click('#fir-sim');await p.waitForSelector('#lab-form');await p.fill('#lab-peso','5');await p.check('input[name=lab-fin][value=proporcional]');await p.click('#lab-form button[type=submit]');await p.waitForSelector('#lab-res table.tabla-lab');
 ok('demo: la simulación muestra la tabla y la etiqueta «Simulación»',(await p.locator('#lab-res .chip.sim').count())>=1&&/AAPL/.test(await p.textContent('#lab-res')));
 await p.click('#lab-guardar-btn');await p.waitForSelector('#esc-editar');
 ok('demo: el escenario se guarda y se reabre como simulación',(await p.locator('#vista-lab h1 .chip.sim').count())===1&&/AAPL al 5/.test(await p.textContent('#vista-lab')));
 await p.evaluate(()=>{location.hash='#seguimiento'});await p.waitForSelector('.seg-item');await p.waitForSelector('.esc-item');
 ok('demo: el seguimiento lista el radar y el escenario',(await p.locator('.seg-item').count())===1&&(await p.locator('.esc-item').count())===1);
 await p.evaluate(()=>{location.hash='#historia-hidrogeno-norte'});await p.waitForSelector('.art h1');
 ok('demo: la historia de ejemplo se lee y es ficticia desde el título',/Caso ficticio/.test(await p.textContent('.art h1'))&&(await p.locator('.art-fuentes li').count())===6);
 await p.evaluate(()=>{location.hash='#inicio'});await p.waitForTimeout(300);await p.reload();await p.waitForSelector('.plantilla');await p.waitForTimeout(1200);
 ok('demo: al recargar se pierde todo (sin sesión ni carteras)',(await p.locator('#dlg-acceso[open]').count())===1||(await p.locator('.cartera-item').count())===0);
 ok('demo: sin errores de JavaScript',errs.length===0,errs.join('|'));await c.close();}
await b.close();console.log(bad?'HAY FALLOS':'DEMO OK')})();

const {chromium}=require('playwright');const path=require('path');
const OUT=process.argv[2]||path.join(__dirname,'out');
const N=['01-mi-cartera','02-mi-cartera-mapa','03-liga','04-liga-draft','05-construye','06-construye-equipo'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:2});
p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.join(__dirname,'pantallas.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
const info=await p.evaluate(()=>[...document.querySelectorAll('.pant')].map(s=>{const r=s.getBoundingClientRect();const c=s.querySelector('.cuerpo');let max=0;c.querySelectorAll('*').forEach(e=>{const q=e.getBoundingClientRect();if(q.height>0)max=Math.max(max,q.bottom-r.top)});
 const over=[];s.querySelectorAll('*').forEach(e=>{if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='hidden'&&e.clientWidth>0&&!(e instanceof SVGElement))over.push(e.className+':'+e.scrollWidth+'>'+e.clientWidth)});
 return s.id+' fondo contenido='+Math.round(max)+' sello='+Math.round(s.querySelector('.sello').getBoundingClientRect().top-r.top)+' desb='+over.slice(0,5).join(' | ')}));
console.log(info.join('\n'));
require('fs').mkdirSync(OUT,{recursive:true});
for(let i=0;i<6;i++){await p.locator('#s'+(i+1)).screenshot({path:path.join(OUT,N[i]+'.png')})}
await b.close()})();

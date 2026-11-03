
// ---------- Backend simulado en memoria (solo demo) ----------
const UNIVERSE = %s;
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19}let a=h>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DB={assets:[],fund:{},ideas:{},users:{},sessions:{},ports:[],pos:{},nextId:1};
for(const a of UNIVERSE){DB.assets.push(a);if(a.tipo!=='accion')continue;const r=rng(a.ticker);const fin=a.sector==='Finanzas';const base=(20+r()*220)*1e9;let ing=base*0.8;DB.fund[a.ticker]=[];
  for(const y of [2022,2023,2024]){ing*=0.97+r()*0.14;const margen=0.03+r()*0.28;const ebitda=ing*(0.12+r()*0.3);const debt=(r()*3.2-0.3)*ebitda;
    DB.fund[a.ticker].push({periodo:'FY'+y,ingresos:ing,beneficio_neto:ing*margen,deuda_neta:fin?null:debt,ebitda:fin?null:ebitda,flujo_caja_libre:ing*(r()*0.25-0.03),roic:fin?null:0.02+r()*0.28})}
  DB.fund[a.ticker].reverse();
  const L=DB.fund[a.ticker][0],P=DB.fund[a.ticker][1];
  DB.ideas[a.ticker]={periodo:L.periodo,
    deuda_ebitda:fin?{ok:null,valor:null}:{ok:L.deuda_neta/L.ebitda<2.5,valor:L.deuda_neta/L.ebitda},roic:fin?{ok:null,valor:null}:{ok:L.roic>0.1,valor:L.roic},
    margen_neto:{ok:L.beneficio_neto/L.ingresos>0.1,valor:L.beneficio_neto/L.ingresos},flujo_caja:{ok:L.flujo_caja_libre>0,valor:L.flujo_caja_libre},
    crecimiento:{ok:L.ingresos>P.ingresos,valor:L.ingresos/P.ingresos-1}}}
const latest=t=>DB.fund[t]?.[0];
const ahora=()=>new Date().toISOString().slice(0,19).replace('T',' ');
function addPort(uid,nombre,plantilla,publico,tesis,posiciones){const id=DB.nextId++;DB.ports.push({id,usuario_id:uid,nombre,plantilla,publico:publico?1:0,tesis,creado_en:ahora(),actualizado_en:null,revision:0});DB.pos[id]=posiciones;return id}
addPort(0,'Dividendos defensivos','dividendos',1,'Fondos de dividendos y empresas de consumo, salud y energía.',[{ticker:'SCHD',peso:30},{ticker:'KO',peso:20},{ticker:'PG',peso:20},{ticker:'JNJ',peso:15},{ticker:'XOM',peso:15}]);
addPort(0,'Oro y mineras','oro',1,'Oro físico y mineras de oro como contrapeso a la renta variable.',[{ticker:'GLD',peso:50},{ticker:'IAU',peso:20},{ticker:'GDX',peso:20},{ticker:'NEM',peso:10}]);
addPort(0,'Crecimiento tecnológico','riesgo',1,'Cinco grandes empresas tecnológicas y de internet.',[{ticker:'NVDA',peso:25},{ticker:'MSFT',peso:25},{ticker:'GOOGL',peso:20},{ticker:'AMZN',peso:20},{ticker:'META',peso:10}]);
const A=t=>DB.assets.find(a=>a.ticker===t);
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});
const conf=p=>J({error:'La cartera cambió en tu cuenta después de la versión desde la que editas.',conflicto:true,revision:p.revision,actualizado_en:p.actualizado_en||p.creado_en||null},409);
const revOk=r=>Number.isInteger(r)&&r>=0;
function valida(ps){if(!Array.isArray(ps)||ps.length>50)return{e:'Posiciones no válidas'};let tot=0;const seen={};for(const x of ps){if(!A(x.ticker))return{e:'Algún ticker no está en el universo'};if(seen[x.ticker]||!(Number(x.peso)>0&&Number(x.peso)<=100))return{e:'Posición no válida: '+x.ticker};seen[x.ticker]=1;tot+=Number(x.peso)}tot=Math.round(tot*10)/10;if(tot>100)return{e:'Los pesos suman más de 100 %% (exceso de asignación: '+String(Math.round((tot-100)*10)/10).replace('.',',')+' %%)'};return{tot}}
function view(p){const posiciones=(DB.pos[p.id]||[]).map(x=>({...x,nombre:A(x.ticker).nombre,sector:A(x.ticker).sector,tipo:A(x.ticker).tipo,roic:latest(x.ticker)?.roic??null,fecha_entrada:'2026-11-03'})).sort((a,b)=>b.peso-a.peso||(a.ticker<b.ticker?-1:1));
  const total=posiciones.reduce((s,r)=>s+r.peso,0);const sectores={};posiciones.forEach(r=>sectores[r.sector]=(sectores[r.sector]||0)+r.peso);return{...p,posiciones,total,sectores}}
const realFetch=window.fetch.bind(window);
window.fetch=async(url,opts={})=>{
  if(typeof url!=='string'||!url.startsWith('/api'))return realFetch(url,opts);
  const path=url.slice(4),m=(opts.method||'GET').toUpperCase(),body=opts.body?JSON.parse(opts.body):{};
  if(window.__demoFalloGuardado&&/^\/portfolios/.test(path)&&m!=='GET'&&m!=='DELETE')throw new TypeError('Failed to fetch'); // SIMULACIÓN EXPLÍCITA de la demo (casilla del aviso amarillo): no es una desconexión real
  const tk=((opts.headers||{}).authorization||'').replace('Bearer ',''),uid=DB.sessions[tk];
  let g;
  if(path==='/assets'&&m==='GET')return J(DB.assets.map(a=>({ticker:a.ticker,nombre:a.nombre,tipo:a.tipo,sector:a.sector,...(latest(a.ticker)||{})})));
  if((g=path.match(/^\/assets\/(\w+)$/))){const t=g[1].toUpperCase(),a=A(t);return a?J({...a,fundamentales:DB.fund[t]||[],criterios:DB.ideas[t]||null}):J({error:'No encontrado'},404)}
  if(path==='/ideas')return J(Object.keys(DB.ideas).map(t=>{const c=DB.ideas[t],k=Object.keys(c).filter(x=>x!=='periodo');return{ticker:t,nombre:A(t).nombre,sector:A(t).sector,periodo:c.periodo,cumplidos:k.filter(x=>c[x].ok===true).length,evaluados:k.filter(x=>c[x].ok!==null).length,total:k.length,criterios:c}}).map(r=>({...r,no_superadas:r.evaluados-r.cumplidos,sin_datos:r.total-r.evaluados})).sort((a,b)=>b.cumplidos-a.cumplidos||a.no_superadas-b.no_superadas||a.ticker.localeCompare(b.ticker)));
  if(path==='/public')return J(DB.ports.filter(p=>p.publico).sort((a,b)=>(a.usuario_id===0?0:1)-(b.usuario_id===0?0:1)||b.id-a.id).map(p=>({id:p.id,nombre:p.nombre,plantilla:p.plantilla,tesis:p.tesis,origen:p.usuario_id===0?'ejemplo':'usuario',n_posiciones:(DB.pos[p.id]||[]).length})));
  if((g=path.match(/^\/public\/(\d+)$/))){const p=DB.ports.find(x=>x.id==g[1]&&x.publico);if(!p)return J({error:'No encontrado'},404);const v=view(p);return J({id:p.id,nombre:p.nombre,plantilla:p.plantilla,tesis:p.tesis,origen:p.usuario_id===0?'ejemplo':'usuario',posiciones:v.posiciones})}
  if(path==='/datos')return J({origen:'demo',actualizado_en:null,ideas_calculadas_en:null});
  if(path==='/login')return J({ok:true,dev_link:'#'});
  if(path==='/verify'){const t='s'+Math.random().toString(36).slice(2);DB.sessions[t]=1;return J({token:t,con_borrador:false})}
  if(path==='/logout'){delete DB.sessions[tk];return J({ok:true})}
  if(!uid)return J({error:'No autorizado'},401);
  // ---- ronda 13: origen de los datos, radar, límite personal y escenarios (todo en memoria; se pierde al recargar)
  if(!uid)return J({error:'No autorizado'},401);
  DB.radar=DB.radar||{};DB.esc=DB.esc||[];DB.nextEsc=DB.nextEsc||1;
  const R=DB.radar[uid]=DB.radar[uid]||{};
  if(path==='/radar'&&m==='GET')return J(Object.keys(R).map(t=>({ticker:t,nombre:A(t).nombre,sector:A(t).sector,tipo:A(t).tipo,nota:R[t].nota,creado_en:R[t].creado_en,actualizado_en:R[t].actualizado_en})));
  if((g=path.match(/^\/radar\/([A-Za-z.]+)$/))){const t=g[1].toUpperCase();if(!A(t))return J({error:'Ese activo no está en el universo'},400);
    if(m==='PUT'){const nuevo=!R[t];if(body.nota!==undefined&&String(body.nota).length>500)return J({error:'La nota admite hasta 500 caracteres'},400);R[t]={nota:body.nota!==undefined?String(body.nota).trim():(R[t]?.nota||''),creado_en:R[t]?.creado_en||ahora(),actualizado_en:ahora()};return J({ok:true,nuevo,ticker:t,...R[t]})}
    if(m==='DELETE'){delete R[t];return J({ok:true})}}
  if((g=path.match(/^\/portfolios\/(\d+)\/limite$/))&&m==='PUT'){const p=DB.ports.find(x=>x.id==g[1]&&x.usuario_id===uid);if(!p)return J({error:'No encontrado'},404);
    let l=null;if(body.limite!==null&&body.limite!==undefined){l=Math.round(Number(body.limite)*10)/10;if(!(l>=0.1&&l<=100))return J({error:'El límite debe estar entre 0,1 y 100 %%.'},400)}p.limite_peso=l;return J({ok:true,limite_peso:l})}
  const escV=e=>{const c=DB.ports.find(p=>p.id===e.cartera_id&&p.usuario_id===uid);return {...e,cartera_existe:!!c,revision_actual:c?c.revision:null,hay_version_posterior:!!c&&c.revision>e.base_revision}};
  if(path==='/escenarios'&&m==='GET')return J(DB.esc.filter(e=>e.uid===uid).sort((a,b)=>b.id-a.id).map(escV));
  if(path==='/escenarios'&&m==='POST'){const nombre=String(body.nombre??'').trim();if(!nombre||nombre.length>80)return J({error:'Escribe un nombre de hasta 80 caracteres para el escenario.'},400);
    const ya=DB.esc.find(e=>e.uid===uid&&e.clave===body.clave);if(ya)return J({...escV(ya),duplicado:true});
    const c=DB.ports.find(p=>p.id===Number(body.cartera_id)&&p.usuario_id===uid);if(!c)return J({error:'No encontrado'},404);
    if(body.base_revision!==c.revision)return J({error:'La cartera cambió después de la versión que simulaste.',conflicto:true,revision:c.revision},409);
    const base=(DB.pos[c.id]||[]).map(x=>({ticker:x.ticker,peso:x.peso})).sort((a,b)=>b.peso-a.peso||(a.ticker<b.ticker?-1:1));
    const sim=simular(base,{ticker:body.ticker,peso:Number(body.peso)},body.financiacion);if(!sim.viable)return J({error:'La simulación no es viable: '+sim.motivo},400);
    const ok=propuestaCoincide(base,{ticker:body.ticker,peso:Number(body.peso)},body.financiacion,body.propuesta||[]);if(!ok.ok)return J({error:ok.motivo},400);
    const e={id:DB.nextEsc++,uid,clave:body.clave,nombre,nota:String(body.nota??'').trim(),estado:'en_estudio',metodo:body.financiacion,ticker:body.ticker,peso_objetivo:Number(body.peso),cartera_id:c.id,cartera_nombre:c.nombre,base_revision:c.revision,revision:0,base,propuesta:sim.despues,creado_en:ahora(),actualizado_en:ahora()};DB.esc.push(e);return J(escV(e),201)}
  if((g=path.match(/^\/escenarios\/(\d+)$/))){const e=DB.esc.find(x=>x.id==g[1]&&x.uid===uid);if(!e)return J({error:'No encontrado'},404);
    if(m==='GET')return J(escV(e));
    if(m==='DELETE'){DB.esc=DB.esc.filter(x=>x!==e);return J({ok:true})}
    if(m==='PATCH'){if(body.revision!==e.revision)return J({error:'El escenario cambió en tu cuenta después de la versión que ves.',conflicto:true,revision:e.revision},409);
      if(body.estado!==undefined&&!['en_estudio','descartado','archivado'].includes(body.estado))return J({error:'Estado no válido.'},400);
      if(body.nombre!==undefined)e.nombre=String(body.nombre).trim();if(body.nota!==undefined)e.nota=String(body.nota).trim();if(body.estado!==undefined)e.estado=body.estado;e.revision++;e.actualizado_en=ahora();return J(escV(e))}}
  if(path==='/portfolios'&&m==='GET')return J(DB.ports.filter(p=>p.usuario_id===uid).map(p=>{const ps=DB.pos[p.id]||[];return {id:p.id,nombre:p.nombre,plantilla:p.plantilla,publico:p.publico,revision:p.revision,limite_peso:p.limite_peso??null,creado_en:p.creado_en,actualizado_en:p.actualizado_en,n_posiciones:ps.length,total:ps.reduce((s,x)=>s+x.peso,0),posiciones:ps.slice().sort((a,b)=>b.peso-a.peso||(a.ticker<b.ticker?-1:1)).map(x=>({ticker:x.ticker,peso:x.peso}))}}).sort((a,b)=>String(b.actualizado_en||b.creado_en).localeCompare(String(a.actualizado_en||a.creado_en))||b.id-a.id));
  if(path==='/portfolios'&&m==='POST'){if(!body.nombre||!['riesgo','oro','dividendos'].includes(body.plantilla))return J({error:'Nombre o plantilla no válidos'},400);const ps=body.posiciones===undefined?[]:body.posiciones,v=valida(ps);if(v.e)return J({error:v.e},400);const id=addPort(uid,body.nombre.trim().slice(0,80),body.plantilla,0,body.tesis?String(body.tesis).trim().slice(0,600):null,ps.map(x=>({ticker:x.ticker,peso:Number(x.peso)})));return J({id,revision:0,actualizado_en:null},201)}
  if((g=path.match(/^\/portfolios\/(\d+)$/))){const p=DB.ports.find(x=>x.id==g[1]&&x.usuario_id===uid);if(!p)return J({error:'No encontrado'},404);
    if(m==='GET')return J(view(p));
    if(m==='DELETE'){DB.ports=DB.ports.filter(x=>x!==p);delete DB.pos[p.id];return J({ok:true})}
    if(m==='PUT'){const v=valida(body.posiciones);if(v.e)return J({error:v.e},400);const nombre=body.nombre!==undefined?String(body.nombre).trim().slice(0,80):p.nombre;if(!nombre)return J({error:'El nombre no puede estar vacío'},400);const tesis=body.tesis!==undefined?String(body.tesis).trim().slice(0,600):p.tesis;if(p.publico){if(v.tot!==100)return J({error:'Esta cartera es pública y debe mantener el 100 %% asignado. Deja de publicarla para guardar un reparto incompleto.'},400);if(!tesis)return J({error:'Para publicar, escribe una tesis.'},400)}if(!revOk(body.revision))return J({error:'Falta la revisión de la cartera desde la que editas.'},400);if(body.revision!==p.revision)return conf(p);DB.pos[p.id]=body.posiciones.map(x=>({ticker:x.ticker,peso:Number(x.peso)}));p.nombre=nombre;p.tesis=tesis||null;p.revision++;p.actualizado_en=ahora();return J({ok:true,revision:p.revision,actualizado_en:p.actualizado_en})}
    if(m==='PATCH'){const nombre=body.nombre!==undefined?String(body.nombre).trim().slice(0,80):p.nombre;if(!nombre)return J({error:'El nombre no puede estar vacío'},400);const tesis=body.tesis!==undefined?String(body.tesis).trim().slice(0,600):p.tesis;const pub=body.publico!==undefined?(body.publico?1:0):p.publico;if(pub){const ps=DB.pos[p.id]||[],tot=Math.round(ps.reduce((s,x)=>s+x.peso,0)*10)/10;if(!ps.length)return J({error:'Para publicar, añade al menos una posición.'},400);if(tot!==100)return J({error:'Para publicar, la cartera debe tener el 100 %% asignado (ahora tiene '+String(tot).replace('.',',')+' %%).'},400);if(!tesis)return J({error:'Para publicar, escribe una tesis.'},400)}if(!revOk(body.revision))return J({error:'Falta la revisión de la cartera desde la que editas.'},400);if(body.revision!==p.revision)return conf(p);p.nombre=nombre;p.tesis=tesis||null;p.publico=pub;p.revision++;p.actualizado_en=ahora();return J({ok:true,revision:p.revision,actualizado_en:p.actualizado_en})}}
  return J({error:'Ruta no encontrada'},404)};

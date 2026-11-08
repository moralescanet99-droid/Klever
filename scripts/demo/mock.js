
// ---------- Backend simulado en memoria (solo demo) ----------
window.__KLEVER_DEMO__=true;
const UNIVERSE = %s;
const SEMILLA = %s;
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19}let a=h>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DB={assets:[],fund:{},ideas:{},users:{},sessions:{},ports:[],pos:{},nextId:1};
for(const a of UNIVERSE){DB.assets.push(a);if(a.tipo!=='accion')continue;const fin=a.sector==='Finanzas';DB.fund[a.ticker]=(SEMILLA.fund[a.ticker]||[]).map(x=>({...x,fuente:'demo'}));
  const L=DB.fund[a.ticker][0],P=DB.fund[a.ticker][1];
  DB.ideas[a.ticker]={periodo:L.periodo,
    deuda_ebitda:fin?{ok:null,valor:null}:{ok:L.deuda_neta/L.ebitda<2.5,valor:L.deuda_neta/L.ebitda},roic:fin?{ok:null,valor:null}:{ok:L.roic>0.1,valor:L.roic},
    margen_neto:{ok:L.beneficio_neto/L.ingresos>0.1,valor:L.beneficio_neto/L.ingresos},flujo_caja:{ok:L.flujo_caja_libre>0,valor:L.flujo_caja_libre},
    crecimiento:{ok:L.ingresos>P.ingresos,valor:L.ingresos/P.ingresos-1}}}
const latest=t=>DB.fund[t]?.[0];
const ACT={'Tecnología':['Software','Semiconductores','Hardware'],'Salud':['Farmacia','Dispositivos','Servicios sanitarios'],'Finanzas':['Banca','Seguros','Mercados'],'Energía':['Petróleo y gas','Renovables','Servicios petrolíferos'],'Consumo básico':['Alimentación','Bebidas','Distribución'],'Consumo discrecional':['Comercio minorista','Automoción','Ocio'],'Industria':['Maquinaria','Transporte','Defensa'],'Comunicaciones':['Medios','Telecomunicaciones','Plataformas'],'Materiales':['Química','Metales','Envases'],'Inmobiliario':['Oficinas','Logística','Residencial'],'Suministros':['Electricidad','Agua','Gas']};
DB.mercado={};for(const a of DB.assets){if(a.tipo!=='accion')continue;const sa=SEMILLA.activos[a.ticker]||{},m=SEMILLA.mercado[a.ticker];a.actividad=sa.actividad??null;a.emisor=sa.emisor??null;if(m)DB.mercado[a.ticker]={cap:m.cap,imp:m.imp,sesiones:m.sesiones}}
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
  if(path==='/universo'){const empresas={};for(const a of DB.assets){const m=DB.mercado[a.ticker]||{};empresas[a.ticker]={nombre:a.nombre,tipo:a.tipo,sector:a.sector,ficticia:/\(empresa ficticia\)/.test(a.nombre),actividad:a.actividad??null,emisor:a.emisor??null,cap:m.cap??null,imp:m.imp??null,sesiones:m.sesiones??null,moneda:m.cap?'USD':null,fuenteMercado:m.cap?'demo':null,fechaMercado:m.cap?'2026-11-04':null,ej:(DB.fund[a.ticker]||[]).slice().reverse().map(r=>({p:r.periodo,ing:r.ingresos,ni:r.beneficio_neto,op:r.resultado_operativo,ebitda:r.ebitda,deuda:r.deuda_neta,fcf:r.flujo_caja_libre,roic:r.roic,f:r.fuente,d:r.actualizado_en}))}}return J({fecha:'2026-11-04',mercado:Object.keys(DB.mercado).length,origen:'sintetico',habilitada:false,empresas})}
  if(path==='/datos')return J({origen:'demo',empresas:Object.keys(DB.fund).length,grupos:[{fuente:'demo',n:Object.keys(DB.fund).length,desde:null,hasta:null}],ultima_carga:null});
  if(path==='/evento')return J({ok:true});   // fase 1: la demo no cuenta nada
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
  const escV=e=>{const c=DB.ports.find(p=>p.id===e.cartera_id&&p.usuario_id===uid);return {...e,invalidacion:e.invalidacion||'',n_revisiones:(e.revs||[]).length,cartera_existe:!!c,revision_actual:c?c.revision:null,hay_version_posterior:!!c&&c.revision>e.base_revision}};
  if(path==='/escenarios'&&m==='GET')return J(DB.esc.filter(e=>e.uid===uid).sort((a,b)=>b.id-a.id).map(escV));
  if(path==='/escenarios'&&m==='POST'){const nombre=String(body.nombre??'').trim();if(!nombre||nombre.length>80)return J({error:'Escribe un nombre de hasta 80 caracteres para el escenario.'},400);
    const ya=DB.esc.find(e=>e.uid===uid&&e.clave===body.clave);if(ya)return J({...escV(ya),duplicado:true});
    const c=DB.ports.find(p=>p.id===Number(body.cartera_id)&&p.usuario_id===uid);if(!c)return J({error:'No encontrado'},404);
    if(body.base_revision!==c.revision)return J({error:'La cartera cambió después de la versión que simulaste.',conflicto:true,revision:c.revision},409);
    const base=(DB.pos[c.id]||[]).map(x=>({ticker:x.ticker,peso:x.peso})).sort((a,b)=>b.peso-a.peso||(a.ticker<b.ticker?-1:1));
    if(!esDecima(body.peso))return J({error:'El peso admite como mucho un decimal (por ejemplo 10 o 10,5 %%).'},400);
    const preg=String(body.pregunta??'').trim();if(preg.length>200)return J({error:'La pregunta admite hasta 200 caracteres.'},400);
    const rev=body.revisar_en==null||body.revisar_en===''?null:String(body.revisar_en);if(rev!==null&&!(/^\d{4}-\d{2}-\d{2}$/.test(rev)&&new Date(rev+'T00:00:00Z').toISOString().slice(0,10)===rev))return J({error:'La fecha de revisión no es válida (AAAA-MM-DD).'},400);
    const sim=simular(base,{ticker:body.ticker,peso:Number(body.peso)},body.financiacion);if(!sim.viable)return J({error:'La simulación no es viable: '+sim.motivo},400);
    const ok=propuestaCoincide(base,{ticker:body.ticker,peso:Number(body.peso)},body.financiacion,body.propuesta||[]);if(!ok.ok)return J({error:ok.motivo},400);
    const inv=String(body.invalidacion??'').trim();if(inv.length>600)return J({error:'Qué me haría cambiar de opinión admite hasta 600 caracteres.'},400);
    const e={id:DB.nextEsc++,uid,clave:body.clave,nombre,nota:String(body.nota??'').trim(),invalidacion:inv,revs:[],estado:'en_estudio',evaluacion:body.evaluacion||null,pregunta:preg,pregunta_ref:body.historia&&body.pregunta_ref||null,revisar_en:rev,historia:body.historia||null,metodo:body.financiacion,ticker:body.ticker,peso_objetivo:Number(body.peso),cartera_id:c.id,cartera_nombre:c.nombre,base_revision:c.revision,revision:0,base,propuesta:sim.despues,foto_datos:(()=>{const ts=empresasDeIdea(base,sim.despues,body.ticker),cr={};for(const t of ts)if(DB.ideas[t])cr[t]=DB.ideas[t];return fotoDatos(ts,cr,ahora().slice(0,10))})(),creado_en:ahora(),actualizado_en:ahora()};DB.esc.push(e);return J(escV(e),201)}
  if((g=path.match(/^\/escenarios\/(\d+)\/revisiones$/))){const e=DB.esc.find(x=>x.id==g[1]&&x.uid===uid);if(!e)return J({error:'No encontrado'},404);e.revs=e.revs||[];
    if(m==='GET')return J(e.revs.slice().sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha))||b.id-a.id));
    if(m==='POST'){const ya=e.revs.find(r=>r.clave===body.clave);if(ya)return J({...ya,duplicado:true});
      const fok=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
      if(!fok(body.fecha))return J({error:'La fecha de la revisión no es válida (AAAA-MM-DD).'},400);
      if(!['mantener','descartar','reprogramar'].includes(body.decision))return J({error:'Elige si mantienes la idea, la descartas o programas otra revisión.'},400);
      const prox=body.proxima_fecha||null;if(prox!==null&&!fok(prox))return J({error:'La fecha de la próxima revisión no es válida (AAAA-MM-DD).'},400);
      if(body.decision==='reprogramar'&&prox===null)return J({error:'Indica la fecha de la próxima revisión.'},400);
      if(body.revision!==e.revision)return J({error:'El escenario cambió en tu cuenta después de la versión que ves.',conflicto:true,revision:e.revision},409);
      const r={id:(e.revs.length?Math.max(...e.revs.map(x=>x.id)):0)+1,clave:body.clave,fecha:body.fecha,observacion:String(body.observacion??'').trim().slice(0,600),aprendizaje:String(body.aprendizaje??'').trim().slice(0,600),decision:body.decision,proxima_fecha:body.decision==='descartar'?null:prox,creado_en:ahora()};
      e.revs.push(r);e.estado=body.decision==='descartar'?'descartado':'en_estudio';e.revisar_en=body.decision==='descartar'?null:prox;e.revision++;e.actualizado_en=ahora();return J({...r,escenario:escV(e)},201)}}
  if((g=path.match(/^\/escenarios\/(\d+)$/))){const e=DB.esc.find(x=>x.id==g[1]&&x.uid===uid);if(!e)return J({error:'No encontrado'},404);
    if(m==='GET')return J({...escV(e),revisiones:(e.revs||[]).slice().sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha))||b.id-a.id)});
    if(m==='DELETE'){DB.esc=DB.esc.filter(x=>x!==e);return J({ok:true})}
    if(m==='PATCH'){if(body.revision!==e.revision)return J({error:'El escenario cambió en tu cuenta después de la versión que ves.',conflicto:true,revision:e.revision},409);
      if(body.estado!==undefined&&!['en_estudio','descartado','archivado'].includes(body.estado))return J({error:'Estado no válido.'},400);
      if(body.nombre!==undefined)e.nombre=String(body.nombre).trim();if(body.nota!==undefined)e.nota=String(body.nota).trim();if(body.invalidacion!==undefined)e.invalidacion=String(body.invalidacion).trim().slice(0,600);if(body.pregunta!==undefined)e.pregunta=String(body.pregunta).trim();if(body.pregunta_ref!==undefined)e.pregunta_ref=body.pregunta_ref||null;if(body.revisar_en!==undefined)e.revisar_en=body.revisar_en||null;if(body.estado!==undefined)e.estado=body.estado;e.revision++;e.actualizado_en=ahora();return J(escV(e))}}
  if(path==='/semana'&&m==='GET'){const hoy=ahora().slice(0,10),sem=lunesDe(hoy);DB.inst=DB.inst||{};const H=DB.inst[uid]=DB.inst[uid]||{};const act={};for(const a of DB.assets)act[a.ticker]={sector:a.sector,tipo:a.tipo};
    const cs=DB.ports.filter(p=>p.usuario_id===uid).map(p=>({id:p.id,nombre:p.nombre,foto:fotoCartera(DB.pos[p.id]||[],act)}));for(const k of Object.keys(H))if(!cs.some(c=>String(c.id)===k))delete H[k];
    for(const c of cs){if(!c.foto)continue;const l=H[c.id]=(H[c.id]||[]).filter(f=>f.semana!==sem);l.push({semana:sem,...c.foto})}
    return J({hoy,semana:sem,carteras:cs.map(c=>({...c,historial:(H[c.id]||[]).slice().sort((a,b)=>a.semana.localeCompare(b.semana)).slice(-8)}))})}
  if(path==='/liga'){const hoy=ahora().slice(0,10),sem=lunesDe(hoy),T=temporada('2026-11-02'),k=Math.max(0,Math.floor((Date.parse(sem)-Date.parse(T.inicio))/(84*864e5))),Tt=temporada(new Date(Date.parse(T.inicio)+k*84*864e5).toISOString().slice(0,10)),n=Tt.semanas.indexOf(sem)+1;
    DB.liga=DB.liga||{perfil:{},ins:{},ligas:[]};const Lg=DB.liga,yo=Lg.perfil[uid]||{apodo:null,publica:false};
    const pts=u=>{const i=Lg.ins[u];if(!i)return null;const H=(DB.inst||{})[u]||{},f=(H[i]||[]).find(x=>x.semana===sem)||null,ps=DB.pos[i]||[];return puntosTemporada(Tt.semanas.map(s=>({semana:s,foto:s===sem?f:null,completa:Math.round(ps.reduce((a,x)=>a+x.peso,0))===100,n:ps.length,entro:s===sem,retoHecho:false,ideaSemana:false})),sem)};
    if(m==='POST'){const a=body.accion;
      if(a==='perfil'){if(body.apodo&&!apodoValido(body.apodo))return J({error:'El apodo debe tener entre 3 y 20 caracteres (letras, números, espacios, punto o guiones) y no puede ser un correo.'},400);Lg.perfil[uid]={apodo:body.apodo||null,publica:!!body.publica};return J({ok:true})}
      if(a==='inscribir'){const c=DB.ports.find(p=>p.id===Number(body.cartera_id)&&p.usuario_id===uid);if(!c)return J({error:'No encontrado'},404);Lg.ins[uid]=c.id;return J({ok:true,cartera_id:c.id})}
      if(a==='crear_liga'){const nombre=String(body.nombre||'').trim();if(nombre.length<3||nombre.length>40)return J({error:'El nombre de la liga debe tener entre 3 y 40 caracteres.'},400);const l={id:Lg.ligas.length+1,codigo:codigoLiga(),nombre,creador:uid,miembros:[uid]};Lg.ligas.push(l);return J({ok:true,id:l.id,codigo:l.codigo,nombre},201)}
      if(a==='unirse'){const l=Lg.ligas.find(x=>x.codigo===String(body.codigo||'').toUpperCase());if(!l)return J({error:'No hay ninguna liga con ese código.'},404);if(!l.miembros.includes(uid))l.miembros.push(uid);return J({ok:true,id:l.id,nombre:l.nombre})}
      if(a==='salir'||a==='borrar_liga'){Lg.ligas=a==='borrar_liga'?Lg.ligas.filter(x=>!(x.id===body.liga_id&&x.creador===uid)):Lg.ligas.map(x=>x.id===body.liga_id?{...x,miembros:x.miembros.filter(u=>u!==uid)}:x);return J({ok:true})}
      return J({error:'Acción no válida'},400)}
    const p=pts(uid),c=Lg.ins[uid]?DB.ports.find(x=>x.id===Lg.ins[uid]):null,gen=clasificar(Object.keys(Lg.ins).map(Number).filter(u=>Lg.perfil[u]?.publica&&Lg.perfil[u]?.apodo).map(u=>({id:u,apodo:Lg.perfil[u].apodo,...pts(u),inscrito:''})));
    return J({temporada:{nombre:'Temporada '+k,inicio:Tt.inicio,fin:Tt.fin,semana:n,semanas:12,puede_cambiar:n<=2},yo:{apodo:yo.apodo,publica:yo.publica,inscripcion:c?{cartera_id:c.id,nombre:c.nombre}:null,puntos:p?{total:p.total,detalle:p.detalle}:null,puesto_general:gen.find(f=>f.id===uid)?.puesto??null,en_general:gen.length},
      general:gen.map(f=>({apodo:f.apodo,total:f.total,puesto:f.puesto,tu:f.id===uid})),privadas:Lg.ligas.filter(l=>l.miembros.includes(uid)).map(l=>({id:l.id,codigo:l.codigo,nombre:l.nombre,mia:l.creador===uid,miembros:l.miembros.length,sin_inscribir:0,clasificacion:clasificar(l.miembros.filter(u=>Lg.ins[u]).map(u=>({id:u,...pts(u),inscrito:''}))).map(f=>({apodo:f.id===uid?'Tú':(Lg.perfil[f.id]?.apodo||'Sin apodo'),tu:f.id===uid,total:f.total,puesto:f.puesto}))}))})}
  if(path==='/portfolios'&&m==='GET')return J(DB.ports.filter(p=>p.usuario_id===uid).map(p=>{const ps=DB.pos[p.id]||[];return {id:p.id,nombre:p.nombre,plantilla:p.plantilla,publico:p.publico,revision:p.revision,limite_peso:p.limite_peso??null,creado_en:p.creado_en,actualizado_en:p.actualizado_en,n_posiciones:ps.length,total:ps.reduce((s,x)=>s+x.peso,0),posiciones:ps.slice().sort((a,b)=>b.peso-a.peso||(a.ticker<b.ticker?-1:1)).map(x=>({ticker:x.ticker,peso:x.peso}))}}).sort((a,b)=>String(b.actualizado_en||b.creado_en).localeCompare(String(a.actualizado_en||a.creado_en))||b.id-a.id));
  if(path==='/portfolios'&&m==='POST'){if(!body.nombre||!['riesgo','oro','dividendos'].includes(body.plantilla))return J({error:'Nombre o plantilla no válidos'},400);const ps=body.posiciones===undefined?[]:body.posiciones,v=valida(ps);if(v.e)return J({error:v.e},400);const id=addPort(uid,body.nombre.trim().slice(0,80),body.plantilla,0,body.tesis?String(body.tesis).trim().slice(0,600):null,ps.map(x=>({ticker:x.ticker,peso:Number(x.peso)})));return J({id,revision:0,actualizado_en:null},201)}
  if((g=path.match(/^\/portfolios\/(\d+)$/))){const p=DB.ports.find(x=>x.id==g[1]&&x.usuario_id===uid);if(!p)return J({error:'No encontrado'},404);
    if(m==='GET')return J(view(p));
    if(m==='DELETE'){DB.ports=DB.ports.filter(x=>x!==p);delete DB.pos[p.id];return J({ok:true})}
    if(m==='PUT'){const v=valida(body.posiciones);if(v.e)return J({error:v.e},400);const nombre=body.nombre!==undefined?String(body.nombre).trim().slice(0,80):p.nombre;if(!nombre)return J({error:'El nombre no puede estar vacío'},400);const tesis=body.tesis!==undefined?String(body.tesis).trim().slice(0,600):p.tesis;if(p.publico){if(v.tot!==100)return J({error:'Esta cartera es pública y debe mantener el 100 %% asignado. Deja de publicarla para guardar un reparto incompleto.'},400);if(!tesis)return J({error:'Para publicar, escribe una tesis.'},400)}if(!revOk(body.revision))return J({error:'Falta la revisión de la cartera desde la que editas.'},400);if(body.revision!==p.revision)return conf(p);DB.pos[p.id]=body.posiciones.map(x=>({ticker:x.ticker,peso:Number(x.peso)}));p.nombre=nombre;p.tesis=tesis||null;p.revision++;p.actualizado_en=ahora();return J({ok:true,revision:p.revision,actualizado_en:p.actualizado_en})}
    if(m==='PATCH'){const nombre=body.nombre!==undefined?String(body.nombre).trim().slice(0,80):p.nombre;if(!nombre)return J({error:'El nombre no puede estar vacío'},400);const tesis=body.tesis!==undefined?String(body.tesis).trim().slice(0,600):p.tesis;const pub=body.publico!==undefined?(body.publico?1:0):p.publico;if(pub){const ps=DB.pos[p.id]||[],tot=Math.round(ps.reduce((s,x)=>s+x.peso,0)*10)/10;if(!ps.length)return J({error:'Para publicar, añade al menos una posición.'},400);if(tot!==100)return J({error:'Para publicar, la cartera debe tener el 100 %% asignado (ahora tiene '+String(tot).replace('.',',')+' %%).'},400);if(!tesis)return J({error:'Para publicar, escribe una tesis.'},400)}if(!revOk(body.revision))return J({error:'Falta la revisión de la cartera desde la que editas.'},400);if(body.revision!==p.revision)return conf(p);p.nombre=nombre;p.tesis=tesis||null;p.publico=pub;p.revision++;p.actualizado_en=ahora();return J({ok:true,revision:p.revision,actualizado_en:p.actualizado_en})}}
  return J({error:'Ruta no encontrada'},404)};

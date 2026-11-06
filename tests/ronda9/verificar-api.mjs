// Verificación de la API por HTTP, repetible contra CUALQUIER despliegue (local o D1 remoto). Solo API, sin navegador.
// Uso: BASE_URL=http://localhost:8788 node tests/ronda9/verificar-api.mjs
//      BASE_URL=https://TU-PROYECTO-DE-PRUEBA.pages.dev node tests/ronda9/verificar-api.mjs   (proyecto de PRUEBA con DEV_RETURN_LINK=1; ver ronda9/GUION-BETA-Y-D1-REMOTO.md)
// Crea su propia cuenta y sus carteras de prueba. NO usar contra producción: el acceso devuelve el enlace en la respuesta.
const BASE = (process.env.BASE_URL || 'http://localhost:8788').replace(/\/$/, '');
let ok = 0; const fallos = [];
const t = (id, esc, cond, obs) => { cond ? ok++ : fallos.push(`${id} ${esc} → ${obs}`); console.log((cond ? 'OK   ' : 'FALLA') + ` [${id}] ${esc}  ${obs}`); };
let tok = '';
const api = async (m, p, b) => { const r = await fetch(BASE + '/api' + p, { method: m, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: b && JSON.stringify(b) }); let j = {}; try { j = await r.json(); } catch {} return { s: r.status, j }; };
const A = [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], B = [{ ticker: 'JNJ', peso: 70 }, { ticker: 'XOM', peso: 30 }];
const ps = c => (c.posiciones || []).map(x => x.ticker + ':' + x.peso).sort().join(',');
const email = `verificar-${Date.now()}@example.com`;
const lg = await api('POST', '/login', { email, acepto: true });
if (!lg.j.dev_link) { console.log('FALLA: el despliegue no devuelve dev_link (DEV_RETURN_LINK=1). Solo se debe usar un proyecto de PRUEBA.'); process.exit(1); }
const v = await api('POST', '/verify', { token: new URL(lg.j.dev_link, BASE).searchParams.get('login') }); tok = v.j.token;
t('V0', 'Acceso por enlace de desarrollo', !!tok, `HTTP ${v.s}`);

const c = await api('POST', '/portfolios', { nombre: 'V1', plantilla: 'dividendos', posiciones: A });
t('V1', 'Crear cartera con posiciones en una operación', c.s === 201 && c.j.revision === 0, `HTTP ${c.s}, revisión ${c.j.revision}`);
const id = c.j.id;
const w = await api('PUT', '/portfolios/' + id, { posiciones: B, nombre: 'V1b', tesis: 'Tesis', revision: 0 });
const g = await api('GET', '/portfolios/' + id);
t('V2', 'Guardar posiciones + nombre + tesis juntos; la respuesta trae su revisión', w.s === 200 && w.j.revision === 1 && g.j.nombre === 'V1b' && g.j.tesis === 'Tesis' && ps(g.j) === 'JNJ:70,XOM:30', `HTTP ${w.s}, revisión ${w.j.revision}, ${g.j.nombre}, ${ps(g.j)}`);
const viejo = await api('PUT', '/portfolios/' + id, { posiciones: A, revision: 0 });
t('V3', 'Guardar con una revisión caducada', viejo.s === 409 && (await api('GET', '/portfolios/' + id)).j.nombre === 'V1b', `HTTP ${viejo.s}`);
const mal = await api('PUT', '/portfolios/' + id, { posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'ZZZZ', peso: 50 }], nombre: 'NO', revision: 1 });
t('V4', 'Ticker desconocido: 400 y nada cambia', mal.s === 400 && (await api('GET', '/portfolios/' + id)).j.nombre === 'V1b', `HTTP ${mal.s}`);

let ambos = 0, uno = 0, ninguno = 0;
for (let i = 0; i < 20; i++) { const rev = (await api('GET', '/portfolios/' + id)).j.revision;
  const rs = await Promise.all([api('PUT', '/portfolios/' + id, { posiciones: A, revision: rev }), api('PUT', '/portfolios/' + id, { posiciones: B, revision: rev })]);
  const n = rs.filter(r => r.s === 200).length; if (n === 2) ambos++; else if (n === 1) uno++; else ninguno++; }
t('V5', '20 pares de guardados simultáneos con la misma revisión', ambos === 0 && ninguno === 0 && uno === 20, `ambos aceptados ${ambos}, exactamente uno ${uno}, ninguno ${ninguno}`);

// Lecturas coherentes mientras otro dispositivo escribe: la versión «par» es (nombre P, KO/PG), la «impar» (nombre I, JNJ/XOM)
let mezcla = 0, lecturas = 0, fin = false;
const escritor = (async () => { for (let i = 0; i < 40 && !fin; i++) { const rev = (await api('GET', '/portfolios/' + id)).j.revision; await api('PUT', '/portfolios/' + id, { posiciones: i % 2 ? B : A, nombre: i % 2 ? 'I' : 'P', revision: rev }); } fin = true; })();
const lector = (async () => { while (!fin) { const r = await api('GET', '/portfolios/' + id); lecturas++; const par = r.j.nombre === 'P', pr = ps(r.j); if (r.j.nombre === 'P' || r.j.nombre === 'I') { if (par ? pr !== 'KO:60,PG:40' : pr !== 'JNJ:70,XOM:30') mezcla++; } } })();
await Promise.all([escritor, lector]);
t('V6', 'GET con otro dispositivo guardando: nunca mezcla nombre y posiciones', mezcla === 0 && lecturas > 5, `${lecturas} lecturas, ${mezcla} mezclas`);

// GET público mientras se publica / despublica con otras posiciones
await api('PUT', '/portfolios/' + id, { posiciones: A, nombre: 'Pub', tesis: 'Tesis pública', revision: (await api('GET', '/portfolios/' + id)).j.revision });
let fuga = 0, lect2 = 0, fin2 = false;
const esc2 = (async () => { for (let i = 0; i < 15 && !fin2; i++) {
  let r = await api('GET', '/portfolios/' + id); await api('PATCH', '/portfolios/' + id, { publico: true, revision: r.j.revision });
  await new Promise(s => setTimeout(s, 30));
  r = await api('GET', '/portfolios/' + id); await api('PATCH', '/portfolios/' + id, { publico: false, revision: r.j.revision });
  r = await api('GET', '/portfolios/' + id); await api('PUT', '/portfolios/' + id, { posiciones: B, nombre: 'PRIVADA', tesis: 'secreta', revision: r.j.revision });   // privada con otras posiciones
  r = await api('GET', '/portfolios/' + id); await api('PUT', '/portfolios/' + id, { posiciones: A, nombre: 'Pub', tesis: 'Tesis pública', revision: r.j.revision }); }
  fin2 = true; })();
const lec2 = (async () => { while (!fin2) { const r = await api('GET', '/public/' + id); lect2++; if (r.s === 200 && (ps(r.j) !== 'KO:60,PG:40' || r.j.nombre !== 'Pub')) fuga++; } })();
await Promise.all([esc2, lec2]);
t('V7', 'GET público mientras se publica/despublica con otras posiciones: nunca devuelve una versión que no fue pública', fuga === 0 && lect2 > 5, `${lect2} lecturas, ${fuga} versiones no públicas devueltas`);
console.log(`\nRESULTADO: ${ok} correctas, ${fallos.length} fallos${fallos.length ? '\nFALLOS:\n- ' + fallos.join('\n- ') : ''}\nNota: V5–V7 son pruebas de estrés EMPÍRICAS: que pasen no demuestra ausencia de carreras; la garantía determinista está en tests/ronda8/unit-carreras.mjs.`);
process.exit(fallos.length ? 1 : 0);

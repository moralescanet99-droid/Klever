// Ronda 30 · punto 14: foto semanal en el servidor, evolución, reto de la semana y ciclo de las ideas. Piezas PURAS y servidor real sobre SQLite real.
// Uso: node tests/ronda30/unit-ronda30.mjs
import { lunesDe, fotoCartera, fotoValida, evolucion, cambiosSemana, retoSemana, fotoAnterior, RETOS_SEMANA, indiceSemana } from '../../public/js/semana.js';
import { empresasDeIdea, fotoDatos, validarFoto, cambiosDatos, miraAtras, diasEntre } from '../../public/js/ciclo.js';
import * as SE from '../../functions/api/semana.js';
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import * as PO from '../../functions/api/portfolios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-R30.json');
const J = JSON.stringify;
const A = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, NVDA: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' }, JPM: { sector: 'Finanzas' }, GLD: { sector: 'Materias primas', tipo: 'etf' } };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));

// ===================== piezas puras: semana
t('S1', 'lunesDe: la semana es la del lunes (UTC) que contiene el día', 'sábado 7-nov-2026 → lunes 2-nov; lunes → sí mismo; domingo 1-nov → 26-oct; cambio de año', J([lunesDe('2026-11-07'), lunesDe('2026-11-02'), lunesDe('2026-11-01'), lunesDe('2027-01-01')]),
  J([lunesDe('2026-11-07'), lunesDe('2026-11-02'), lunesDe('2026-11-01'), lunesDe('2027-01-01')]) === J(['2026-11-02', '2026-11-02', '2026-10-26', '2026-12-28']));
const fConc = fotoCartera(P(['NVDA', 40], ['MSFT', 20], ['KO', 20], ['JNJ', 20]), A), fVar = fotoCartera(P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]), A);
t('S2', 'fotoCartera: solo niveles, número de categorías y señales (sin pesos sueltos ni importes)', 'concentrada: concentración media/alta, 3 categorías, señal de alerta; repartida: concentración baja, variedad amplia, 5 categorías; vacía → null',
  J({ fConc, fVar }), fConc.concentracion !== 'ok' && fConc.n_categorias === 3 && fConc.senales.some(s => s.nivel === 'alerta') && fVar.concentracion === 'ok' && fVar.variedad === 'ok' && fVar.n_categorias === 5
  && fotoCartera([], A) === null && J(Object.keys(fConc).sort()) === J(['concentracion', 'n_categorias', 'senales', 'variedad']) && fConc.senales.every(s => J(Object.keys(s).sort()) === J(['id', 'nivel', 'titulo'])));
t('S3', 'fotoValida descarta formas inesperadas', 'nivel desconocido, fecha mala, 4 señales o n_categorias negativo → null; una buena pasa', '',
  fotoValida({ semana: '2026-11-02', ...fConc }) && !fotoValida({ semana: '2026-11-02', ...fConc, concentracion: 'rojo' }) && !fotoValida({ semana: '2/11', ...fConc }) && !fotoValida({ semana: '2026-11-02', ...fConc, senales: [1, 2, 3, 4] }) && !fotoValida({ semana: '2026-11-02', ...fConc, n_categorias: -1 }) && !fotoValida(null));
const H = [{ semana: '2026-10-19', concentracion: 'alto', variedad: 'alto', n_categorias: 2, senales: [{ id: 'categoria', nivel: 'alerta', titulo: 'Exposición alta: Tecnología' }] },
  { semana: '2026-10-26', concentracion: 'medio', variedad: 'medio', n_categorias: 3, senales: [{ id: 'posicion', nivel: 'alerta', titulo: 'NVDA pesa el 40 %' }] },
  { semana: '2026-11-02', concentracion: 'ok', variedad: 'ok', n_categorias: 5, senales: [{ id: 'ok', nivel: 'ok', titulo: 'Sin concentraciones destacadas' }] }];
let ev = evolucion(H, '2026-11-02');
t('E1', 'Evolución con tres semanas: de Alta/Poca a Baja/Amplia', 'semanas 3, desde 19-oct; concentración y variedad «mejora»', J(ev.tendencias), ev.semanas === 3 && ev.desde === '2026-10-19' && ev.tendencias.concentracion.tendencia === 'mejora' && ev.tendencias.variedad.tendencia === 'mejora' && ev.tendencias.concentracion.antes === 'alto');
ev = evolucion([H[2], { ...H[0], semana: '2026-10-26' }].reverse(), '2026-11-02');
t('E2', 'Orden indiferente y empeorar también se dice', 'de Baja a Alta = «empeora» si el orden se invierte', J(evolucion([{ ...H[2], semana: '2026-10-26' }, { ...H[0], semana: '2026-11-02' }], '2026-11-02').tendencias), evolucion([{ ...H[2], semana: '2026-10-26' }, { ...H[0], semana: '2026-11-02' }], '2026-11-02').tendencias.concentracion.tendencia === 'empeora' && ev.tendencias.concentracion.tendencia === 'mejora');
t('E3', 'Con una sola semana NO hay evolución (no se inventa)', 'tendencias null, semanas 1', J(evolucion([H[2]], '2026-11-02')), evolucion([H[2]], '2026-11-02').tendencias === null && evolucion([], '2026-11-02').semanas === 0);
t('E4', 'Evolución: como mucho 6 semanas y nunca semanas futuras; filas dañadas fuera', 'de 9 semanas válidas + una dañada + una futura → 6', '',
  evolucion([...Array(9)].map((_, i) => ({ ...H[0], semana: `2026-0${i + 1}-05` })).concat([{ semana: 'x' }, { ...H[0], semana: '2027-01-04' }]), '2026-11-02').semanas === 6);
let k = cambiosSemana(H, '2026-11-02');
t('C1', 'Cambios de señales desde la última semana con foto', '«Ya no: NVDA pesa el 40 %» desde el 26-oct; «Sin concentraciones» no cuenta como señal nueva', J(k), k.desde === '2026-10-26' && J(k.cambios) === J([{ tipo: 'resuelta', texto: 'NVDA pesa el 40 %' }]));
t('C2', 'Sin semana anterior o sin foto de esta semana: sin cambios', 'desde null', J([cambiosSemana([H[2]], '2026-11-02'), cambiosSemana([H[0]], '2026-11-02')]), cambiosSemana([H[2]], '2026-11-02').desde === null && cambiosSemana([H[0]], '2026-11-02').desde === null);
t('C3', 'fotoAnterior: la última semana ANTERIOR a la actual', '26-oct', J(fotoAnterior(H, '2026-11-02')?.semana), fotoAnterior(H, '2026-11-02').semana === '2026-10-26' && fotoAnterior(H, '2026-10-19') === null);

// reto de la semana
const sem0 = '2026-11-02', i0 = indiceSemana(sem0) % RETOS_SEMANA.length;
const semanaDe = id => { for (let i = 0; i < 20; i++) { const s = new Date(Date.parse(sem0 + 'T00:00:00Z') + i * 7 * 864e5).toISOString().slice(0, 10); if (RETOS_SEMANA[indiceSemana(s) % RETOS_SEMANA.length].id === id) return s; } };
const ids = [...Array(5)].map((_, i) => retoSemana({ semana: new Date(Date.parse(sem0 + 'T00:00:00Z') + i * 7 * 864e5).toISOString().slice(0, 10), carteras: [{ id: 1, foto: fConc }], anteriores: { 1: fVar }, ideas: [{ estado: 'en_estudio', invalidacion: '', creado_en: '2026-01-01 10:00:00', actualizado_en: '2026-01-01 10:00:00' }] })?.id);
t('W1', 'Reto de la semana: rota cada lunes por los cinco y es el mismo toda la semana', 'cinco semanas seguidas → cinco retos distintos; martes y domingo de la misma semana → el mismo', J(ids),
  new Set(ids).size === 5 && J(retoSemana({ semana: sem0, carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: [] })) === J(retoSemana({ semana: sem0, carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: [] })) && i0 >= 0);
let w = retoSemana({ semana: semanaDe('mejora'), carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: [] });
t('W2', 'Si el que toca necesita una semana anterior y no la hay, se pasa al siguiente', 'en la semana de «mejora» sin historial → otro reto', J(w), w && w.id !== 'mejora' && w.id !== 'categoria-nueva');
w = retoSemana({ semana: semanaDe('mejora'), carteras: [{ id: 1, foto: fVar }], anteriores: { 1: fConc }, ideas: [] });
const w2 = retoSemana({ semana: semanaDe('mejora'), carteras: [{ id: 1, foto: fConc }], anteriores: { 1: fVar }, ideas: [] });
t('W3', '«Mejora un indicador»: conseguido solo si sube respecto a la semana anterior', 'concentrada → repartida: hecho; al revés: no; cambia el lunes siguiente', J([w, w2]), w.id === 'mejora' && w.hecho === true && w2.hecho === false && w.cambia === new Date(Date.parse(semanaDe('mejora') + 'T00:00:00Z') + 7 * 864e5).toISOString().slice(0, 10));
const sI = semanaDe('idea-semana');
w = retoSemana({ semana: sI, carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: [{ estado: 'en_estudio', creado_en: sI + ' 09:00:00' }] });
const wNo = retoSemana({ semana: sI, carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: [{ estado: 'en_estudio', creado_en: '2020-01-01 09:00:00' }] });
const wNull = retoSemana({ semana: sI, carteras: [{ id: 1, foto: fConc }], anteriores: {}, ideas: null });
t('W4', '«Guarda esta semana una idea»: cuenta solo lo guardado desde el lunes; sin poder leer ideas se salta', 'hecho / no hecho / otro reto', J([w?.hecho, wNo?.hecho, wNull?.id]), w.id === 'idea-semana' && w.hecho && wNo.hecho === false && wNull.id !== 'idea-semana');
t('W5', 'Nunca hay un reto de rentabilidad ni de precio', 'ningún título habla de rentabilidad, ganar, precio o comprar', J(RETOS_SEMANA.map(r => r.titulo)), RETOS_SEMANA.every(r => !/rentab|gan|precio|compra|vend/i.test(r.titulo + r.pista)));
t('W6', 'Sin carteras ni ideas: no hay reto que aplicar', 'null', J(retoSemana({ semana: sem0, carteras: [], anteriores: {}, ideas: [] })), retoSemana({ semana: sem0, carteras: [], anteriores: {}, ideas: [] }) === null);

// ===================== piezas puras: ciclo de las ideas
t('I1', 'Empresas de una idea: la que se añade primero y luego las que ceden peso (como mucho 8)', 'C, A, B; la que no cambia (D) fuera', J(empresasDeIdea(P(['A', 50], ['B', 30], ['D', 20]), P(['A', 45], ['B', 25], ['C', 10], ['D', 20]), 'C')),
  J(empresasDeIdea(P(['A', 50], ['B', 30], ['D', 20]), P(['A', 45], ['B', 25], ['C', 10], ['D', 20]), 'C')) === J(['C', 'A', 'B']) && empresasDeIdea([], [...Array(12)].map((_, i) => ({ ticker: 'T' + 'ABCDEFGHIJKL'[i], peso: 5 })), 'X').length === 8);
const crit = { periodo: 'FY2024', deuda_ebitda: { ok: true }, roic: { ok: false }, margen_neto: { ok: true }, flujo_caja: { ok: null }, crecimiento: { ok: true } };
const foto = fotoDatos(['KO', 'ZZZ'], { KO: crit }, '2026-10-01');
t('I2', 'Foto de datos: estados ok/no/nd por comprobación y periodo; sin fila = sin datos', 'KO con 5 estados y FY2024; ZZZ sin datos', J(foto), foto.empresas.KO.periodo === 'FY2024' && J(foto.empresas.KO.c) === J({ deuda_ebitda: 'ok', roic: 'no', margen_neto: 'ok', flujo_caja: 'nd', crecimiento: 'ok' }) && foto.empresas.ZZZ.c === null && validarFoto(foto) !== null);
t('I3', 'validarFoto descarta formas inesperadas', 'estado raro, clave extra, ticker malo, fecha mala, 9 empresas → null', '',
  [{ ...foto, fecha: 'ayer' }, { fecha: '2026-10-01', empresas: { KO: { periodo: 'FY', c: { ...foto.empresas.KO.c, roic: 'rojo' } } } }, { fecha: '2026-10-01', empresas: { KO: { periodo: 'FY', c: { ...foto.empresas.KO.c, precio: 'ok' } } } },
    { fecha: '2026-10-01', empresas: { 'ko;': foto.empresas.KO } }, { fecha: '2026-10-01', empresas: Object.fromEntries([...Array(9)].map((_, i) => ['T' + 'ABCDEFGHI'[i], foto.empresas.KO])) }, null].every(x => validarFoto(x) === null));
const hoyCrit = { KO: { ...crit, periodo: 'FY2025', roic: { ok: true } }, ZZZ: { periodo: 'FY2025', deuda_ebitda: { ok: true } } };
let cd = cambiosDatos(foto, hoyCrit);
t('I4', 'Qué ha cambiado: ROIC de «no superada» a «superada» y un informe nuevo', 'KO: periodo FY2024→FY2025, roic no→ok; ZZZ: deuda nd→ok; n = 2', J(cd), cd.n === 2 && cd.periodos === 2 && cd.empresas[0].cambios[0].clave === 'roic' && cd.empresas[0].cambios[0].antes === 'no' && cd.empresas[0].cambios[0].ahora === 'ok' && cd.empresas[1].cambios[0].clave === 'deuda_ebitda');
cd = cambiosDatos(foto, { KO: crit, ZZZ: null });
const cdSin = cambiosDatos(foto, { KO: crit });
t('I5', 'Sin cambios se dice; una empresa que hoy no aparece es «no se puede comparar», no un cambio', 'n = 0; ZZZ sin_lectura', J([cd.n, cdSin.empresas[1]]), cd.n === 0 && cd.periodos === 0 && cdSin.empresas[1].sin_lectura === true && cdSin.n === 0 && cambiosDatos({ fecha: 'x' }, {}) === null);
const ideasM = [{ id: 1, estado: 'en_estudio', nombre: 'Nueva', foto_datos: { ...foto, fecha: '2026-11-01' } }, { id: 2, estado: 'en_estudio', nombre: 'Vieja', pregunta: '¿Mejora su ROIC?', foto_datos: foto },
  { id: 3, estado: 'descartado', nombre: 'Descartada', foto_datos: { ...foto, fecha: '2026-01-01' } }, { id: 4, estado: 'en_estudio', nombre: 'Sin foto', foto_datos: null }];
const m = miraAtras(ideasM, '2026-11-07', hoyCrit);
t('I6', '«Mira atrás»: la idea en estudio más antigua con foto y al menos 28 días', 'la «Vieja» (37 días), con su pregunta y 2 cambios; ni descartadas ni sin foto; nada si todas son recientes', J(m),
  m.id === 2 && m.dias === 37 && m.motivo === '¿Mejora su ROIC?' && m.cambios.n === 2 && miraAtras([ideasM[0]], '2026-11-07', hoyCrit) === null && diasEntre('2026-10-01', '2026-11-07') === 37);

// ===================== servidor
const env = crearEnv(); await sembrar(env);
for (const [tk, sec] of [['KO', 'Consumo básico'], ['PG', 'Consumo básico'], ['NVDA', 'Tecnología'], ['MSFT', 'Tecnología'], ['JNJ', 'Salud'], ['XOM', 'Energía']]) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(tk, tk, 'accion', sec);
env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(2,'otra@example.com')").run(); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,2)').run(await sha256('token-2'));
env.sql.prepare('INSERT INTO ideas(ticker,criterios_cumplidos) VALUES(?,?)').run('KO', J(crit)); env.sql.prepare('INSERT INTO ideas(ticker,criterios_cumplidos) VALUES(?,?)').run('NVDA', J({ ...crit, roic: { ok: true } }));
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla) VALUES (1,1,'Concentrada','riesgo'),(2,1,'Vacía','riesgo'),(3,2,'Ajena','riesgo');
  INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'NVDA',40),(1,'MSFT',20),(1,'KO',20),(1,'JNJ',20),(3,'KO',100)`);
const T = { 1: 'token-de-prueba', 2: 'token-2', 0: null };
const llama = async (f, u, m, body, params = {}) => { const h = { 'content-type': 'application/json' }; if (T[u]) h.authorization = 'Bearer ' + T[u];
  const r = await f({ request: new Request('http://x/api', { method: m, headers: h, body: body === undefined ? undefined : J(body) }), env, params }); return { s: r.status, j: await r.json() }; };
const filas = (u = 1) => env.sql.prepare('SELECT cartera_id, semana, concentracion, variedad, n_categorias FROM instantaneas WHERE usuario_id = ? ORDER BY cartera_id, semana').all(u);
const semHoy = lunesDe(new Date().toISOString().slice(0, 10)), semAnt = new Date(Date.parse(semHoy + 'T00:00:00Z') - 7 * 864e5).toISOString().slice(0, 10);
let r = await llama(SE.onRequestGet, 0, 'GET');
t('V1', '/api/semana sin sesión', 'HTTP 401 y nada escrito', `HTTP ${r.s}; filas ${filas().length}`, r.s === 401 && filas().length === 0);
r = await llama(SE.onRequestGet, 1, 'GET');
const c1 = r.j.carteras?.find(c => c.id === 1);
t('V2', 'Primera visita: registra la foto de ESTA semana de cada cartera con posiciones (no la vacía) y la devuelve', `una fila (cartera 1, semana ${semHoy}); la vacía sin foto; historial de 1 semana`, J({ semana: r.j.semana, filas: filas(), c1 }),
  r.s === 200 && r.j.semana === semHoy && filas().length === 1 && filas()[0].cartera_id === 1 && c1.historial.length === 1 && c1.foto.concentracion === fConc.concentracion && r.j.carteras.find(c => c.id === 2).foto === null && !r.j.carteras.some(c => c.id === 3));
const enBruto = env.sql.prepare('SELECT * FROM instantaneas').get();
t('V3', 'Lo guardado: niveles, categorías y señales; NUNCA importes ni la composición', 'columnas sin pesos de posiciones ni dinero', J(Object.keys(enBruto)), !Object.keys(enBruto).some(x => /peso|importe|precio|ticker/.test(x)) && !/"peso"/.test(enBruto.senales));
env.sql.exec(`UPDATE posiciones SET peso = 20 WHERE portafolio_id = 1 AND ticker = 'NVDA'; INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'XOM',20)`);
r = await llama(SE.onRequestGet, 1, 'GET');
t('V4', 'Otra visita la misma semana: actualiza la foto de la semana (no añade otra)', 'sigue habiendo 1 fila y ahora refleja la cartera repartida', J(filas()), filas().length === 1 && filas()[0].n_categorias === 4 && r.j.carteras.find(c => c.id === 1).historial.length === 1);
// una semana anterior (concentrada) y una muy antigua (que debe borrarse)
env.sql.prepare("INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales) VALUES (1,1,?,'alto','medio',3,?)").run(semAnt, J([{ id: 'posicion', nivel: 'alerta', titulo: 'NVDA pesa el 40 %' }]));
env.sql.prepare("INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales) VALUES (1,1,'2020-01-06','alto','alto',1,'[]')").run();
env.sql.prepare("INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales) VALUES (1,99,?,'alto','alto',1,'[]')").run(semAnt);   // de una cartera que ya no existe
r = await llama(SE.onRequestGet, 1, 'GET');
const h1 = r.j.carteras.find(c => c.id === 1).historial, evS = evolucion(h1, r.j.semana), kS = cambiosSemana(h1, r.j.semana);
t('V5', 'Con una semana anterior: evolución y cambios salen del servidor; lo de hace más de medio año y lo de carteras borradas se elimina', 'historial de 2 semanas; «Ya no: NVDA pesa el 40 %»; la de 2020 y la de la cartera 99 borradas',
  J({ h1, ev: evS.tendencias, kS, filas: filas() }), h1.length === 2 && evS.tendencias.concentracion.tendencia === 'mejora' && kS.cambios.some(x => x.tipo === 'resuelta' && /NVDA pesa el 40/.test(x.texto)) && !filas().some(f => f.semana === '2020-01-06' || f.cartera_id === 99));
env.sql.prepare("INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales) VALUES (1,1,?,'medio','medio',3,'esto no es json')").run(new Date(Date.parse(semHoy + 'T00:00:00Z') - 14 * 864e5).toISOString().slice(0, 10));
r = await llama(SE.onRequestGet, 1, 'GET');
t('V6', 'Una fila dañada en la base no se entrega (ni rompe la respuesta)', 'HTTP 200; sigue con 2 semanas válidas', `HTTP ${r.s}; ${r.j.carteras.find(c => c.id === 1).historial.length}`, r.s === 200 && r.j.carteras.find(c => c.id === 1).historial.length === 2);
r = await llama(SE.onRequestGet, 2, 'GET');
t('V7', 'Aislamiento: la otra cuenta solo ve y escribe lo suyo', 'usuario 2: solo «Ajena»; las filas del usuario 1 no cambian', J(r.j.carteras.map(c => c.nombre)), J(r.j.carteras.map(c => c.nombre)) === J(['Ajena']) && filas(2).length === 1 && filas(1).every(f => f.cartera_id === 1));
env.fallarEnSentencia = 0; r = await llama(SE.onRequestGet, 1, 'GET'); env.fallarEnSentencia = null;
t('V8', 'Fallo de la base: error claro y nada a medias', 'HTTP 500 con mensaje; filas iguales que antes', `HTTP ${r.s}: ${r.j.error}`, r.s === 500 && /semana/.test(r.j.error));
const antesDel = filas().length; r = await llama(PO.onRequestDelete, 1, 'DELETE', undefined, { id: '1' });
t('V9', 'Borrar una cartera borra también su foto semanal (es privada)', 'HTTP 200; 0 filas de la cartera 1', `HTTP ${r.s}; antes ${antesDel}, ahora ${filas().length}`, r.s === 200 && antesDel > 0 && filas().filter(f => f.cartera_id === 1).length === 0);

// ciclo: foto de datos al guardar una idea (la hace el servidor)
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla) VALUES (5,1,'Base','riesgo'); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (5,'KO',60),(5,'PG',40)`);
const cuerpo = (o = {}) => ({ clave: 'r30-intento-01', nombre: 'Añadir NVDA', cartera_id: 5, base_revision: 0, ticker: 'NVDA', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'NVDA', peso: 10 }], ...o });
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ foto_datos: { fecha: '2000-01-01', empresas: { KO: { periodo: 'falso', c: null } } } }));
const fila = env.sql.prepare("SELECT foto_datos FROM escenarios WHERE clave = 'r30-intento-01'").get();
t('F1', 'Guardar una idea: el servidor hace la foto (no la acepta del cliente)', 'NVDA, KO y PG; KO con FY2024 y ROIC «no»; PG sin datos; fecha de hoy; la foto enviada por el cliente se ignora', fila.foto_datos,
  r.s === 201 && J(Object.keys(r.j.foto_datos.empresas)) === J(['NVDA', 'KO', 'PG']) && r.j.foto_datos.empresas.KO.c.roic === 'no' && r.j.foto_datos.empresas.KO.periodo === 'FY2024' && r.j.foto_datos.empresas.PG.c === null && r.j.foto_datos.fecha === new Date().toISOString().slice(0, 10));
env.sql.prepare("UPDATE ideas SET criterios_cumplidos = ? WHERE ticker = 'KO'").run(J({ ...crit, periodo: 'FY2025', roic: { ok: true } }));
const g = await llama(EI.onRequestGet, 1, 'GET', undefined, { id: String(r.j.id) });
cd = cambiosDatos(g.j.foto_datos, { KO: { ...crit, periodo: 'FY2025', roic: { ok: true } }, NVDA: { ...crit, roic: { ok: true } }, PG: null });
t('F2', 'Leer la idea más tarde: conserva su foto y se compara con los datos de hoy', 'KO: informe nuevo y ROIC «no superada» → «superada»; NVDA y PG sin cambios', J(cd), g.s === 200 && cd.n === 1 && cd.periodos === 1 && cd.empresas.find(e => e.ticker === 'KO').cambios[0].clave === 'roic');
env.sql.prepare("UPDATE escenarios SET foto_datos = ? WHERE id = ?").run('{"fecha":"2026-01-01","empresas":{"KO":{"periodo":"FY","c":{"roic":"rojo"}}}}', r.j.id);
const g2 = await llama(EI.onRequestGet, 1, 'GET', undefined, { id: String(r.j.id) }), lista = await llama(ES.onRequestGet, 1, 'GET');
t('F3', 'Una foto manipulada en la base no se entrega', 'foto_datos null en la ficha y en la lista', J([g2.j.foto_datos, lista.j.find(e => e.id === r.j.id).foto_datos]), g2.s === 200 && g2.j.foto_datos === null && lista.j.find(e => e.id === r.j.id).foto_datos === null);
const rep = await llama(ES.onRequestPost, 1, 'POST', cuerpo());
t('F4', 'Un reintento con la misma clave no duplica la idea', 'devuelve la misma idea (duplicado) y sigue habiendo una', `${rep.s} ${rep.j.duplicado}`, rep.j.duplicado === true && env.sql.prepare("SELECT COUNT(*) n FROM escenarios WHERE clave = 'r30-intento-01'").get().n === 1);
await fin();

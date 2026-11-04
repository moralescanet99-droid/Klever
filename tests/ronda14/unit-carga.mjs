// Ronda 14: procedencia de los datos. La carga real (scripts/lib/carga.mjs) aplicada a SQLite real sobre datos PREVIOS: vacía, parcial y correcta;
// una empresa fallida conserva su fecha anterior; ausencia ≠ cero en las métricas derivadas; /api/datos se DERIVA de las filas.
// Uso: node tests/ronda14/unit-carga.mjs
import { derivar, criterios, sqlCarga } from '../../scripts/lib/carga.mjs';
import * as DA from '../../functions/api/datos.js';
import * as AS from '../../functions/api/assets/[ticker].js';
import { crearEnv, registro } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-CARGA.json');
const J = JSON.stringify;
const nuevo = () => { const env = crearEnv(), db = env.sql;
  db.exec(`INSERT INTO activos(ticker,nombre,tipo,sector) VALUES ('AAA','Empresa A','accion','Tecnología'),('BBB','Empresa B','accion','Salud'),('CCC','Empresa C','accion','Energía');
    INSERT INTO fundamentales(ticker,periodo,ingresos,beneficio_neto,deuda_neta,ebitda,flujo_caja_libre,roic,fuente,actualizado_en) VALUES
     ('AAA','FY2024',100,10,5,20,8,.12,'sec','2026-10-01'),('BBB','FY2024',200,20,9,40,16,.15,'prueba','2026-09-15'),('CCC','FY2024',50,5,1,10,4,.2,'sec','2026-10-01');`);
  return env; };
const filas = env => env.sql.prepare('SELECT ticker, periodo, fuente, actualizado_en, ingresos FROM fundamentales ORDER BY ticker, periodo').all().map(r => `${r.ticker}:${r.periodo}:${r.fuente}:${r.actualizado_en}:${r.ingresos}`).join(' | ');
const act = (t, extra = {}) => ({ activo: { ticker: t, nombre: 'Empresa ' + t, tipo: 'accion', sector: 'Tecnología' }, cik: '000' + t, ...extra });
const datos = a => ({ ingresos: a, ni: a / 10, op: a / 5, da: a / 20, ocf: a / 6, capex: a / 12, ltd: a / 4, cash: a / 10, eq: a / 2, tax: .2 });
const consultar = async env => (await (await DA.onRequestGet({ env })).json());

// ---- carga vacía
let env = nuevo(); const previo = filas(env);
env.sql.exec(sqlCarga([], { fecha: '2026-11-04' }));
let d = await consultar(env), c = env.sql.prepare('SELECT * FROM cargas').all();
t('L1', 'Carga VACÍA (catálogo sin empresas) sobre datos previos', 'No cambia ninguna fila ni su fecha; solo queda el lote «vacia» con 0 empresas; el origen sigue siendo el real de cada fila (mixto: sec + prueba), no «sec actualizado hoy»',
  `filas ${filas(env) === previo ? 'intactas' : 'CAMBIARON'}; lote ${c[0].estado} ok=${c[0].n_ok}; origen ${d.origen}; grupos ${J(d.grupos)}`, filas(env) === previo && c.length === 1 && c[0].estado === 'vacia' && c[0].n_ok === 0 && d.origen === 'mixto' && !d.grupos.some(g => g.hasta === '2026-11-04'));
// ---- carga con todas las empresas fallidas o sin años
env = nuevo(); env.sql.exec(sqlCarga([act('AAA', { error: '503 sec.gov' }), act('BBB', { anios: {} }), act('CCC', { error: 'timeout' })], { fecha: '2026-11-04' }));
c = env.sql.prepare('SELECT * FROM cargas').all();
t('L2', 'Carga donde TODAS fallan o vienen sin años', 'No se toca ninguna fila; lote «vacia» con 2 fallidas y 1 vacía', `${filas(env) === previo ? 'intactas' : 'CAMBIARON'}; ${J(c[0])}`, filas(env) === previo && c[0].estado === 'vacia' && c[0].n_fallidas === 2 && c[0].n_vacias === 1);
// ---- carga parcial
env = nuevo(); env.sql.exec(sqlCarga([act('AAA', { anios: { 2024: datos(110), 2023: datos(90) } }), act('BBB', { error: '429 sec.gov' }), act('CCC', { anios: { 2024: datos(55) } })], { fecha: '2026-11-04' }));
const f = filas(env); c = env.sql.prepare('SELECT * FROM cargas').all(); d = await consultar(env);
t('L3', 'Carga PARCIAL: una empresa falla', 'AAA y CCC pasan a «sec» con la fecha nueva; BBB (fallida) CONSERVA su fuente y su fecha anteriores; lote «parcial» 2 ok / 1 fallida',
  `${f}; lote ${c[0].estado} ${c[0].n_ok}/${c[0].n_fallidas}; origen ${d.origen}`, /AAA:FY2024:sec:2026-11-04:110/.test(f) && /BBB:FY2024:prueba:2026-09-15:200/.test(f) && /CCC:FY2024:sec:2026-11-04:55/.test(f) && /AAA:FY2023:sec:2026-11-04/.test(f) && c[0].estado === 'parcial' && c[0].n_ok === 2 && c[0].n_fallidas === 1 && d.origen === 'mixto');
const ficha = await (await AS.onRequestGet({ env, params: { ticker: 'BBB' } })).json(), fichaA = await (await AS.onRequestGet({ env, params: { ticker: 'AAA' } })).json();
t('L3b', 'La ficha lleva la procedencia de CADA dato', 'La ficha de BBB dice prueba/2026-09-15; la de AAA, sec/2026-11-04', `${J([ficha.fundamentales[0].fuente, ficha.fundamentales[0].actualizado_en])} ${J([fichaA.fundamentales[0].fuente, fichaA.fundamentales[0].actualizado_en])}`,
  ficha.fundamentales[0].fuente === 'prueba' && ficha.fundamentales[0].actualizado_en === '2026-09-15' && fichaA.fundamentales[0].fuente === 'sec' && fichaA.fundamentales[0].actualizado_en === '2026-11-04');
// ---- carga correcta y repetida
env = nuevo(); const sql = sqlCarga([act('AAA', { anios: { 2024: datos(110) } }), act('BBB', { anios: { 2024: datos(210) } }), act('CCC', { anios: { 2024: datos(55) } })], { fecha: '2026-11-04' });
env.sql.exec(sql); env.sql.exec(sql); d = await consultar(env); c = env.sql.prepare('SELECT estado, n_ok FROM cargas').all();
t('L4', 'Carga CORRECTA (y repetida: idempotente)', 'Todas «sec» con fecha 2026-11-04; el origen pasa a «sec» con rango de fechas; dos lotes «correcta»', `${J(d.grupos)}; origen ${d.origen}; lotes ${J(c)}`, d.origen === 'sec' && d.grupos.length === 1 && d.grupos[0].desde === '2026-11-04' && d.grupos[0].n === 3 && c.length === 2 && c.every(x => x.estado === 'correcta'));
env = crearEnv(); d = await consultar(env);
t('L5', 'Sin ninguna fila: no se atribuye a nadie', 'origen null, 0 empresas', J(d), d.origen === null && d.empresas === 0);
env = nuevo(); env.sql.exec("UPDATE fundamentales SET fuente = NULL, actualizado_en = NULL"); d = await consultar(env);
t('L5b', 'Filas anteriores sin fuente registrada (datos antiguos)', 'origen null: «sin fuente verificada»', J(d.grupos), d.origen === null && d.grupos[0].fuente === 'sin_fuente');
// ---- ausencia ≠ cero
const base = { ingresos: 100, ni: 10, op: 20, da: 5, ocf: 30, capex: 10, ltd: 40, cash: 10, eq: 100, tax: .2 };
const mk = o => derivar({ ...base, ...o });
t('L6', 'Métricas derivadas: ausencia ≠ cero', 'Sin amortizaciones → EBITDA desconocido (NO el EBIT); sin capex → caja libre desconocida; capex = 0 declarado SÍ cuenta; deuda LP = 0 declarada SÍ cuenta; sin impuesto → ROIC desconocido (sin tipo supuesto)',
  J({ ebitda: mk({ da: null }).ebitda, fcfSinCapex: mk({ capex: undefined }).fcf, fcfCapex0: mk({ capex: 0 }).fcf, deuda0: mk({ ltd: 0 }).debt, roicSinTax: mk({ tax: null }).roic, completo: [mk({}).ebitda, mk({}).fcf, mk({}).debt, +mk({}).roic.toFixed(4)] }),
  mk({ da: null }).ebitda === null && mk({ capex: undefined }).fcf === null && mk({ capex: 0 }).fcf === 30 && mk({ ltd: 0 }).debt === -10 && mk({ tax: null }).roic === null && mk({}).ebitda === 25 && mk({}).fcf === 20 && mk({}).debt === 30 && Math.abs(mk({}).roic - 20 * .8 / 130) < 1e-12);
const L = derivar({ ...base, ni: 0 }), L0 = derivar({ ...base, ni: null }), Lc = derivar({ ...base, da: null });
const c0 = criterios(L, derivar(base)), cn = criterios(L0, derivar(base)), ce = criterios(Lc, derivar(base));
t('L7', 'Criterios: beneficio 0 ≠ beneficio ausente; EBITDA ausente → deuda sin datos', 'ni = 0 → margen 0 y «no superada» (false); ni ausente → «sin datos» (null); EBITDA ausente → deuda/EBITDA «sin datos», no 0',
  J({ margen0: c0.margen_neto, margenAusente: cn.margen_neto, deudaSinEbitda: ce.deuda_neta ?? ce.deuda_ebitda }), c0.margen_neto.ok === false && c0.margen_neto.valor === 0 && cn.margen_neto.ok === null && cn.margen_neto.valor === null && ce.deuda_ebitda.ok === null && ce.deuda_ebitda.valor === null);
t('L8', 'Crecimiento con año anterior ausente o con ingresos 0', '«sin datos» en ambos casos; con ingresos previos válidos, el signo real', J([criterios(derivar(base), null).crecimiento.ok, criterios(derivar(base), derivar({ ...base, ingresos: 0 })).crecimiento.ok, criterios(derivar(base), derivar({ ...base, ingresos: 80 })).crecimiento.ok]),
  criterios(derivar(base), null).crecimiento.ok === null && criterios(derivar(base), derivar({ ...base, ingresos: 0 })).crecimiento.ok === null && criterios(derivar(base), derivar({ ...base, ingresos: 80 })).crecimiento.ok === true);
t('L9', 'El SQL no escribe ningún origen global', 'Sin referencias a datos_meta en el SQL generado', 'datos_meta ausente', !/datos_meta/.test(sql));
await fin();

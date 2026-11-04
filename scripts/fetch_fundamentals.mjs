// Lee fundamentales anuales de SEC EDGAR (datos públicos) y genera SQL para D1.
// Uso: node scripts/fetch_fundamentals.mjs > build/seed.sql
// Obligatorio: SEC_USER_AGENT="Klever tu@correo.com". Límite SEC: 10 req/s (aquí ~5/s).
import { readFileSync } from 'node:fs';
import { sqlCarga, seleccionarAnual } from './lib/carga.mjs';
const annual = (facts, conceptos, unit = 'USD', flujo = true) => { for (const c of conceptos) { const arr = facts['us-gaap']?.[c]?.units?.[unit]; if (!arr) continue; const m = seleccionarAnual(arr, { flujo }); if (m.size) return m; } return new Map(); };

const UA = process.env.SEC_USER_AGENT;
if (!UA || !UA.includes('@')) { console.error('Define SEC_USER_AGENT="App correo@dominio"'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  await sleep(200);
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

const universe = JSON.parse(readFileSync(new URL('../data/universe.json', import.meta.url)));
const tickers = await get('https://www.sec.gov/files/company_tickers.json');
const cikOf = Object.fromEntries(Object.values(tickers).map(t => [t.ticker, String(t.cik_str).padStart(10, '0')]));

// Solo se recogen los insumos de cada año; las métricas derivadas, el SQL y la procedencia (fuente y fecha por fila, lote en `cargas`)
// los decide scripts/lib/carga.mjs (probado con datos previos, cargas vacías, parciales y correctas).
const resultados = [];
for (const a of universe) {
  const cik = a.tipo === 'accion' ? cikOf[a.ticker] ?? null : null;
  if (!cik) { resultados.push({ activo: a, cik: null, anios: null }); continue; }
  try {
    const { facts } = await get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`);
    const rev = annual(facts, ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet']);
    const ni = annual(facts, ['NetIncomeLoss']);
    const op = annual(facts, ['OperatingIncomeLoss']);
    const da = annual(facts, ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization']);
    const ocf = annual(facts, ['NetCashProvidedByUsedInOperatingActivities']);
    const capex = annual(facts, ['PaymentsToAcquirePropertyPlantAndEquipment']);
    const ltd = annual(facts, ['LongTermDebt', 'LongTermDebtNoncurrent'], 'USD', false);          // saldos: sin duración
    const cash = annual(facts, ['CashAndCashEquivalentsAtCarryingValue'], 'USD', false);
    const eq = annual(facts, ['StockholdersEquity'], 'USD', false);
    const tax = annual(facts, ['EffectiveIncomeTaxRateContinuingOperations'], 'pure');
    const years = [...rev.keys()].sort().slice(-5), anios = {};   // cinco ejercicios (la nota exige ventanas de cinco)
    for (const y of years) { const g = m => m.get(y)?.val; anios[y] = { informe: rev.get(y)?.accn ?? null, ingresos: g(rev), ni: g(ni), op: g(op), da: g(da), ocf: g(ocf), capex: g(capex), ltd: g(ltd), cash: g(cash), eq: g(eq), tax: g(tax) }; }
    resultados.push({ activo: a, cik, anios });
    console.error(`ok ${a.ticker} (${years.length} años)`);
  } catch (e) { resultados.push({ activo: a, cik, anios: null, error: e.message }); console.error(`fallo ${a.ticker}: ${e.message}`); }
}
console.log(sqlCarga(resultados, { fecha: new Date().toISOString().slice(0, 10), fuente: 'sec' }));

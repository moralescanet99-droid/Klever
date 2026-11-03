// Lee fundamentales anuales de SEC EDGAR (datos públicos) y genera SQL para D1.
// Uso: node scripts/fetch_fundamentals.mjs > build/seed.sql
// Obligatorio: SEC_USER_AGENT="Klever tu@correo.com". Límite SEC: 10 req/s (aquí ~5/s).
import { readFileSync } from 'node:fs';

const UA = process.env.SEC_USER_AGENT;
if (!UA || !UA.includes('@')) { console.error('Define SEC_USER_AGENT="App correo@dominio"'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const q = s => s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`;
const n = v => (v == null || !Number.isFinite(v)) ? 'NULL' : v;

async function get(url) {
  await sleep(200);
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

// Último valor anual (10-K, ejercicio completo) de los primeros conceptos disponibles.
function annual(facts, concepts, unit = 'USD') {
  for (const c of concepts) {
    const arr = facts['us-gaap']?.[c]?.units?.[unit];
    if (!arr) continue;
    const fy = arr.filter(x => x.form === '10-K' && x.fp === 'FY' && x.fy);
    if (!fy.length) continue;
    const byYear = new Map();
    for (const x of fy) { // por año fiscal, el dato con fecha de cierre más reciente
      const cur = byYear.get(x.fy);
      if (!cur || x.end > cur.end) byYear.set(x.fy, x);
    }
    return byYear;
  }
  return new Map();
}

const universe = JSON.parse(readFileSync(new URL('../data/universe.json', import.meta.url)));
const tickers = await get('https://www.sec.gov/files/company_tickers.json');
const cikOf = Object.fromEntries(Object.values(tickers).map(t => [t.ticker, String(t.cik_str).padStart(10, '0')]));

const out = ['BEGIN TRANSACTION;'];
for (const a of universe) {
  const cik = a.tipo === 'accion' ? cikOf[a.ticker] ?? null : null;
  out.push(`INSERT INTO activos (ticker,nombre,tipo,sector,cik) VALUES (${q(a.ticker)},${q(a.nombre)},${q(a.tipo)},${q(a.sector)},${q(cik)})
ON CONFLICT(ticker) DO UPDATE SET nombre=excluded.nombre,tipo=excluded.tipo,sector=excluded.sector,cik=excluded.cik;`);
  if (!cik) continue;
  try {
    const { facts } = await get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`);
    const rev = annual(facts, ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet']);
    const ni = annual(facts, ['NetIncomeLoss']);
    const op = annual(facts, ['OperatingIncomeLoss']);
    const da = annual(facts, ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization']);
    const ocf = annual(facts, ['NetCashProvidedByUsedInOperatingActivities']);
    const capex = annual(facts, ['PaymentsToAcquirePropertyPlantAndEquipment']);
    const ltd = annual(facts, ['LongTermDebt', 'LongTermDebtNoncurrent']);
    const cash = annual(facts, ['CashAndCashEquivalentsAtCarryingValue']);
    const eq = annual(facts, ['StockholdersEquity']);
    const tax = annual(facts, ['EffectiveIncomeTaxRateContinuingOperations'], 'pure');
    const years = [...rev.keys()].sort().slice(-3);
    for (const y of years) {
      const g = m => m.get(y)?.val;
      const ebitda = g(op) != null ? g(op) + (g(da) ?? 0) : null;
      const fcf = g(ocf) != null ? g(ocf) - (g(capex) ?? 0) : null;
      const debt = g(ltd) != null ? g(ltd) - (g(cash) ?? 0) : null;
      // ROIC aprox. = EBIT*(1-t) / (deuda LP + patrimonio - caja). Aproximación, no dato oficial.
      const t = Math.min(Math.max(g(tax) ?? 0.21, 0), 0.4);
      const invested = (g(ltd) ?? 0) + (g(eq) ?? 0) - (g(cash) ?? 0);
      const roic = g(op) != null && invested > 0 ? g(op) * (1 - t) / invested : null;
      out.push(`INSERT INTO fundamentales (ticker,periodo,ingresos,beneficio_neto,deuda_neta,ebitda,flujo_caja_libre,roic)
VALUES (${q(a.ticker)},'FY${y}',${n(g(rev))},${n(g(ni))},${n(debt)},${n(ebitda)},${n(fcf)},${n(roic)})
ON CONFLICT(ticker,periodo) DO UPDATE SET ingresos=excluded.ingresos,beneficio_neto=excluded.beneficio_neto,
deuda_neta=excluded.deuda_neta,ebitda=excluded.ebitda,flujo_caja_libre=excluded.flujo_caja_libre,roic=excluded.roic;`);
    }
    console.error(`ok ${a.ticker} (${years.length} años)`);
  } catch (e) { console.error(`fallo ${a.ticker}: ${e.message}`); }
}
out.push('COMMIT;');
console.log(out.join('\n'));

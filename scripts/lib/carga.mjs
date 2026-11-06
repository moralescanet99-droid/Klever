// Lógica PURA de la carga de fundamentales (sin red): métricas derivadas y generación del SQL. La usan scripts/fetch_fundamentals.mjs
// y las pruebas (tests/ronda14/unit-carga.mjs), que aplican el SQL a SQLite real sobre datos previos.
// Reglas de procedencia:
//  · Cada fila de `fundamentales` lleva SU fuente y la fecha de la carga que la escribió; no existe un «origen global».
//  · Una empresa que falla, o que no devuelve ningún año, NO se toca: conserva su fuente y su fecha anteriores.
//  · Una carga vacía solo deja constancia en `cargas` (estado «vacia»); no declara fuente alguna.
//  · AUSENCIA ≠ CERO: una métrica derivada exige todos sus insumos; si falta uno, es NULL (sin datos), nunca 0 ni un supuesto.
// Selección del dato ANUAL de un concepto (pura: se prueba con fixtures). `hechos` = lista de hechos de un concepto (formato de companyfacts).
//  · Solo informes anuales (10-K y 10-K/A) del ejercicio completo (fp = FY).
//  · Un FLUJO (ingresos, resultado, flujos de caja, tipo impositivo) debe cubrir ~12 meses (350–380 días): se descartan acumulados parciales y
//    trimestres con el mismo cierre. Un SALDO (deuda, caja, patrimonio) es un valor a una fecha y no tiene duración.
//  · Para cada ejercicio gana el cierre más reciente y, a igualdad, la presentación más reciente (revisión).
//  · Se conserva el identificador del informe (`accn`) para poder trazar la cifra.
export function seleccionarAnual(hechos, { flujo }) {
  const dias = (a, b) => (new Date(b) - new Date(a)) / 864e5, porAnio = new Map();
  for (const x of hechos || []) {
    if (!['10-K', '10-K/A'].includes(x.form) || x.fp !== 'FY' || !x.fy || !x.end || typeof x.val !== 'number') continue;
    if (flujo) { if (!x.start) continue; const d = dias(x.start, x.end); if (!(d >= 350 && d <= 380)) continue; }
    const cur = porAnio.get(x.fy);
    if (!cur || x.end > cur.end || (x.end === cur.end && (x.filed || '') > (cur.filed || ''))) porAnio.set(x.fy, { val: x.val, end: x.end, filed: x.filed || null, accn: x.accn || null });
  }
  return porAnio;
}
export const q = s => s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`;
export const n = v => (v == null || !Number.isFinite(v)) ? 'NULL' : v;
const hay = v => v != null && Number.isFinite(v);

// d: insumos de UN año { ingresos, ni, op, da, ocf, capex, ltd, cash, eq, tax }; undefined/null = ausente en el informe.
export function derivar(d) {
  const ebitda = hay(d.op) && hay(d.da) ? d.op + d.da : null;                          // sin amortizaciones NO es «EBIT»: es desconocido
  const fcf = hay(d.ocf) && hay(d.capex) ? d.ocf - d.capex : null;                    // sin inversiones NO es «flujo operativo»: es desconocido
  const debt = hay(d.ltd) && hay(d.cash) ? d.ltd - d.cash : null;                     // sin caja o sin deuda declaradas, no se supone 0
  // ROIC aprox. = EBIT·(1−t) / (deuda LP + patrimonio − caja). Aproximación, no dato oficial; todos los insumos (incluido el tipo impositivo) deben existir.
  const invested = hay(d.ltd) && hay(d.eq) && hay(d.cash) ? d.ltd + d.eq - d.cash : null;
  const t = hay(d.tax) ? Math.min(Math.max(d.tax, 0), 0.4) : null;
  const roic = hay(d.op) && t !== null && invested !== null && invested > 0 ? d.op * (1 - t) / invested : null;
  return { ingresos: hay(d.ingresos) ? d.ingresos : null, ni: hay(d.ni) ? d.ni : null, op: hay(d.op) ? d.op : null, debt, ebitda, fcf, roic };
}

// L = último año, P = el anterior (o null). «ok: null» = sin datos (no suma ni resta); false = no superada.
export function criterios(L, P) {
  const ratio = (a, b) => (hay(a) && hay(b) && b > 0 ? a / b : null);
  const deuda = ratio(L.debt, L.ebitda), margen = ratio(L.ni, L.ingresos), crec = hay(P?.ingresos) && P.ingresos > 0 && hay(L.ingresos) ? L.ingresos / P.ingresos - 1 : null;
  return {
    deuda_ebitda: { ok: deuda === null ? null : deuda < 2.5, valor: deuda },
    roic: { ok: hay(L.roic) ? L.roic > 0.1 : null, valor: hay(L.roic) ? L.roic : null },
    margen_neto: { ok: margen === null ? null : margen > 0.1, valor: margen },
    flujo_caja: { ok: hay(L.fcf) ? L.fcf > 0 : null, valor: hay(L.fcf) ? L.fcf : null },
    crecimiento: { ok: crec === null ? null : crec > 0, valor: crec },
  };
}

// resultados: [{ activo: {ticker,nombre,tipo,sector}, cik, anios: { 2024: {insumos}, … } | null, error?: string }]
// fecha: «AAAA-MM-DD» de la carga. Devuelve el SQL completo (una transacción).
export function sqlCarga(resultados, { fecha, fuente }) {
  if (!['sec', 'prueba', 'demo'].includes(fuente)) throw new Error('La carga exige declarar su fuente (sec | prueba | demo): no hay fuente por defecto.');   // un fixture nunca se confunde con datos reales
  const out = ['BEGIN TRANSACTION;']; let ok = 0, vacias = 0, fallidas = 0;
  for (const r of resultados) {
    const a = r.activo;
    out.push(`INSERT INTO activos (ticker,nombre,tipo,sector,cik) VALUES (${q(a.ticker)},${q(a.nombre)},${q(a.tipo)},${q(a.sector)},${q(r.cik ?? null)})
ON CONFLICT(ticker) DO UPDATE SET nombre=excluded.nombre,tipo=excluded.tipo,sector=excluded.sector,cik=excluded.cik;`);
    if (!r.cik) continue;                                               // fondos: sin fundamentales
    if (r.error) { fallidas++; continue; }                              // falla: NO se toca ninguna fila de esa empresa (conserva su fecha anterior)
    const años = Object.keys(r.anios || {}).sort();
    if (!años.length) { vacias++; continue; }                           // sin datos: tampoco se toca
    ok++; const hist = {};
    for (const y of años) {
      const h = hist[y] = derivar(r.anios[y]);
      out.push(`INSERT INTO fundamentales (ticker,periodo,ingresos,beneficio_neto,deuda_neta,ebitda,flujo_caja_libre,roic,fuente,actualizado_en,resultado_operativo,informe)
VALUES (${q(a.ticker)},'FY${y}',${n(h.ingresos)},${n(h.ni)},${n(h.debt)},${n(h.ebitda)},${n(h.fcf)},${n(h.roic)},${q(fuente)},${q(fecha)},${n(h.op)},${q(r.anios[y].informe ?? null)})
ON CONFLICT(ticker,periodo) DO UPDATE SET ingresos=excluded.ingresos,beneficio_neto=excluded.beneficio_neto,deuda_neta=excluded.deuda_neta,ebitda=excluded.ebitda,
flujo_caja_libre=excluded.flujo_caja_libre,roic=excluded.roic,fuente=excluded.fuente,actualizado_en=excluded.actualizado_en,resultado_operativo=excluded.resultado_operativo,informe=excluded.informe;`);
    }
    const L = hist[años.at(-1)], P = años.length > 1 ? hist[años.at(-2)] : null;
    out.push(`INSERT INTO ideas (ticker,criterios_cumplidos,calculado_en) VALUES (${q(a.ticker)},${q(JSON.stringify({ periodo: 'FY' + años.at(-1), ...criterios(L, P) }))},${q(fecha)})
ON CONFLICT(ticker) DO UPDATE SET criterios_cumplidos=excluded.criterios_cumplidos,calculado_en=excluded.calculado_en;`);
  }
  const estado = ok === 0 ? 'vacia' : (vacias + fallidas) > 0 ? 'parcial' : 'correcta';
  out.push(`INSERT INTO cargas (origen,fecha,n_ok,n_vacias,n_fallidas,estado) VALUES (${q(fuente)},${q(fecha)},${ok},${vacias},${fallidas},${q(estado)});`, 'COMMIT;');
  return out.join('\n');
}

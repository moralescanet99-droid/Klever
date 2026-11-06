// COMPARADOR sencillo entre dos empresas del mismo sector: PURO (sin DOM ni red). Tres filas, una decisión por pantalla, sin clasificación de ganadores.
//  1. Crecimiento de ventas  = ventas del ejercicio / ventas del ejercicio anterior − 1                       (%)
//  2. Margen operativo       = resultado operativo / ventas del ejercicio                                     (%)  — NO es el margen neto
//  3. Deuda neta / EBITDA    = deuda neta / EBITDA del ejercicio                                              (veces)
//     «Deuda neta entre EBITDA, en veces (por cada euro de EBITDA del ejercicio, tantos euros de deuda neta)»; no indica cuándo se devolverá la deuda. Una cifra baja es menos deuda; negativa = caja neta. Si el EBITDA es ≤ 0 la ratio
//     no es interpretable: «no comparable». Mucha o poca deuda NO es «mejor» ni «peor» por sí sola: depende del sector y del momento.
// Los ejercicios se ALINEAN (se compara el último ejercicio que tienen las dos); todo en la misma moneda (USD) y unidades; cada cifra lleva su fuente,
// su periodo y su fecha de carga. Lo que no se puede comparar se dice con su motivo; nunca se rellena.
const hayNum = v => v != null && Number.isFinite(v);
const anioDe = p => +String(p || '').replace(/\D/g, '') || null;
export const MONEDA = 'USD';

export function compararEmpresas(a, b) {
  const res = { ejercicio: null, moneda: MONEDA, mismoSector: !!a?.sector && a.sector === b?.sector, filas: [] };
  const fa = Object.fromEntries((a?.fundamentales || []).map(x => [anioDe(x.periodo), x])), fb = Object.fromEntries((b?.fundamentales || []).map(x => [anioDe(x.periodo), x]));
  const comunes = Object.keys(fa).filter(y => fb[y]).map(Number).sort((x, y) => y - x), y = comunes[0] ?? null; res.ejercicio = y ? 'FY' + y : null;
  const origen = f => f ? { periodo: f.periodo, fuente: f.fuente || null, fecha: f.actualizado_en || null } : null;
  const celda = (valor, texto, f, estado = 'ok', motivo = null) => ({ valor, texto, estado, motivo, origen: origen(f) });
  const sinComun = 'No comparable: no tienen ningún ejercicio en común.';
  const pct = v => (v * 100).toFixed(1).replace('.', ',') + ' %';
  const veces = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',') + ' veces';
  const fila = (id, nombre, definicion, unidad, calc) => ({ id, nombre, definicion, unidad, a: y ? calc(fa, y) : celda(null, null, null, 'no_comparable', sinComun), b: y ? calc(fb, y) : celda(null, null, null, 'no_comparable', sinComun) });
  res.filas.push(fila('crecimiento', 'Crecimiento de ventas', 'Ventas del ejercicio frente a las del ejercicio anterior', '%', (f, yy) => {
    const c = f[yy], p = f[yy - 1];
    if (!hayNum(c?.ingresos)) return celda(null, null, c, 'sin_dato', 'Sin dato de ventas del ejercicio.');
    if (!p) return celda(null, null, c, 'sin_dato', 'Sin el ejercicio anterior para calcular la variación.');
    if (!hayNum(p.ingresos) || p.ingresos <= 0) return celda(null, null, c, 'no_comparable', 'Las ventas del ejercicio anterior no son positivas o faltan.');
    const v = c.ingresos / p.ingresos - 1; return celda(v, pct(v), c);
  }));
  res.filas.push(fila('margen_operativo', 'Margen operativo', 'Resultado operativo sobre ventas (no es el margen neto)', '%', (f, yy) => {
    const c = f[yy];
    if (!hayNum(c?.resultado_operativo)) return celda(null, null, c, 'sin_dato', 'Sin dato de resultado operativo (no se sustituye por el margen neto).');
    if (!hayNum(c.ingresos) || c.ingresos <= 0) return celda(null, null, c, 'sin_dato', 'Sin ventas positivas para calcular el margen.');
    const v = c.resultado_operativo / c.ingresos; return celda(v, pct(v), c);
  }));
  res.filas.push(fila('deuda', 'Deuda neta / EBITDA', 'Deuda neta (deuda menos caja) dividida entre el EBITDA del mismo ejercicio, en veces: por cada euro de EBITDA del ejercicio hay esa cantidad de euros de deuda neta. Esta relación no indica cuándo se devolverá la deuda. Negativa = caja neta', 'veces', (f, yy) => {
    const c = f[yy];
    if (!hayNum(c?.deuda_neta) || !hayNum(c?.ebitda)) return celda(null, null, c, 'sin_dato', 'Sin dato de deuda neta o de EBITDA.');
    if (c.ebitda <= 0) return celda(null, null, c, 'no_comparable', 'El EBITDA es nulo o negativo: la ratio no se puede interpretar.');
    const v = c.deuda_neta / c.ebitda; return celda(v, v < 0 ? `Caja neta (${veces(v)})` : veces(v), c);
  }));
  return res;
}

import { json } from '../_lib.js';

// Ranking (solo fundamentales; sin precios). REGLA REAL DE ORDEN:
//   1.º más comprobaciones SUPERADAS; 2.º menos NO SUPERADAS; 3.º símbolo (A–Z).
// Las comprobaciones SIN DATOS no suman ni restan: no se tratan como fallos (no cuentan en «no superadas»)
// y una evaluación parcial se muestra siempre como parcial («3 superadas · 2 sin datos»), nunca como completa.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT a.ticker, a.nombre, a.sector, i.criterios_cumplidos, i.calculado_en FROM ideas i JOIN activos a ON a.ticker = i.ticker').all();
  const rows = results.map(r => {
    const c = JSON.parse(r.criterios_cumplidos);
    const keys = Object.keys(c).filter(k => k !== 'periodo');
    const cumplidos = keys.filter(k => c[k].ok === true).length, evaluados = keys.filter(k => c[k].ok !== null).length;
    return { ticker: r.ticker, nombre: r.nombre, sector: r.sector, periodo: c.periodo, cumplidos, evaluados,
      no_superadas: evaluados - cumplidos, sin_datos: keys.length - evaluados, total: keys.length, criterios: c };
  }).sort((a, b) => b.cumplidos - a.cumplidos || a.no_superadas - b.no_superadas || a.ticker.localeCompare(b.ticker));
  return json(rows);
}

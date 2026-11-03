import { json } from '../_lib.js';

// Ranking por nº de criterios cumplidos (solo fundamentales; sin precios).
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT a.ticker, a.nombre, a.sector, i.criterios_cumplidos, i.calculado_en FROM ideas i JOIN activos a ON a.ticker = i.ticker').all();
  const rows = results.map(r => {
    const c = JSON.parse(r.criterios_cumplidos);
    const keys = Object.keys(c).filter(k => k !== 'periodo');
    return { ticker: r.ticker, nombre: r.nombre, sector: r.sector, periodo: c.periodo,
      cumplidos: keys.filter(k => c[k].ok === true).length, evaluados: keys.filter(k => c[k].ok !== null).length, criterios: c };
  }).sort((a, b) => b.cumplidos - a.cumplidos || a.ticker.localeCompare(b.ticker));
  return json(rows);
}

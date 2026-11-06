import { json } from '../_lib.js';

// Activos con el último periodo de fundamentales (si existe).
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT a.ticker, a.nombre, a.tipo, a.sector, f.periodo, f.ingresos, f.beneficio_neto,
           f.deuda_neta, f.ebitda, f.flujo_caja_libre, f.roic
    FROM activos a
    LEFT JOIN fundamentales f ON f.ticker = a.ticker
      AND f.periodo = (SELECT MAX(periodo) FROM fundamentales WHERE ticker = a.ticker)
    ORDER BY a.ticker`).all();
  return json(results);
}

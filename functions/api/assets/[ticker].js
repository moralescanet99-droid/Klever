import { json } from '../../_lib.js';

export async function onRequestGet({ env, params }) {
  const t = String(params.ticker).toUpperCase();
  const a = await env.DB.prepare('SELECT ticker, nombre, tipo, sector FROM activos WHERE ticker = ?').bind(t).first();
  if (!a) return json({ error: 'No encontrado' }, 404);
  const { results } = await env.DB.prepare(
    'SELECT periodo, ingresos, beneficio_neto, deuda_neta, ebitda, flujo_caja_libre, roic, fuente, actualizado_en FROM fundamentales WHERE ticker = ? ORDER BY periodo DESC').bind(t).all();
  const idea = await env.DB.prepare('SELECT criterios_cumplidos FROM ideas WHERE ticker = ?').bind(t).first();
  return json({ ...a, fundamentales: results, criterios: idea ? JSON.parse(idea.criterios_cumplidos) : null });
}

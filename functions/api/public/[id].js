import { json } from '../../_lib.js';

// Solo composición y tesis. Nunca rentabilidad ni datos del usuario.
export async function onRequestGet({ env, params }) {
  const p = await env.DB.prepare('SELECT id, nombre, plantilla, tesis FROM portafolios WHERE id = ? AND publico = 1').bind(params.id).first();
  if (!p) return json({ error: 'No encontrado' }, 404);
  const { results } = await env.DB.prepare(
    `SELECT po.ticker, po.peso, a.nombre, a.sector FROM posiciones po JOIN activos a ON a.ticker = po.ticker
     WHERE po.portafolio_id = ? ORDER BY po.peso DESC`).bind(p.id).all();
  return json({ ...p, posiciones: results });
}

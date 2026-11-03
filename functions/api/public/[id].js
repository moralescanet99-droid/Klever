import { json, DEMO_EMAIL } from '../../_lib.js';

// Solo composición y tesis. Nunca rentabilidad ni datos del usuario.
export async function onRequestGet({ env, params }) {
  const p = await env.DB.prepare(`SELECT p.id, p.nombre, p.plantilla, p.tesis, CASE WHEN u.email = ? THEN 'ejemplo' ELSE 'usuario' END AS origen
    FROM portafolios p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id = ? AND p.publico = 1`).bind(DEMO_EMAIL, params.id).first();
  if (!p) return json({ error: 'No encontrado' }, 404);
  const { results } = await env.DB.prepare(
    `SELECT po.ticker, po.peso, a.nombre, a.sector FROM posiciones po JOIN activos a ON a.ticker = po.ticker
     WHERE po.portafolio_id = ? ORDER BY po.peso DESC`).bind(p.id).all();
  return json({ ...p, posiciones: results });
}

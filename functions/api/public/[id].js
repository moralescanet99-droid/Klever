import { json, DEMO_EMAIL } from '../../_lib.js';

// Solo composición y tesis. Nunca rentabilidad ni datos del usuario.
// Visibilidad, metadatos y posiciones salen de UNA instantánea (un lote de lecturas = una transacción), y las posiciones
// se piden además solo si la cartera sigue siendo pública en esa misma instantánea: nunca se mezclan dos versiones.
export async function onRequestGet({ env, params }) {
  let rp, rq;
  try {
    [rp, rq] = await env.DB.batch([
      env.DB.prepare(`SELECT p.id, p.nombre, p.plantilla, p.tesis, CASE WHEN u.email = ? THEN 'ejemplo' ELSE 'usuario' END AS origen
        FROM portafolios p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id = ? AND p.publico = 1`).bind(DEMO_EMAIL, params.id),
      env.DB.prepare(`SELECT po.ticker, po.peso, a.nombre, a.sector FROM posiciones po JOIN activos a ON a.ticker = po.ticker
        WHERE po.portafolio_id = ? AND EXISTS (SELECT 1 FROM portafolios WHERE id = ? AND publico = 1) ORDER BY po.peso DESC`).bind(params.id, params.id)]);
  } catch (e) { console.error('leer cartera pública:', e); return json({ error: 'No se pudo leer la cartera. Inténtalo de nuevo.' }, 500); }
  const p = rp.results[0];
  if (!p) return json({ error: 'No encontrado' }, 404);
  return json({ ...p, posiciones: rq.results });
}

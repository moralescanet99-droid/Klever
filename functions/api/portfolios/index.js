import { json, auth, readJson } from '../../_lib.js';

const PLANTILLAS = ['riesgo', 'oro', 'dividendos'];

export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  // Resumen para «Mis carteras»: posiciones y total asignado salen de las posiciones guardadas.
  // actualizado_en es NULL hasta la primera modificación real (no se inventa ninguna fecha).
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.nombre, p.plantilla, p.publico, p.creado_en, p.actualizado_en,
            COUNT(po.ticker) AS n_posiciones, COALESCE(SUM(po.peso), 0) AS total
     FROM portafolios p LEFT JOIN posiciones po ON po.portafolio_id = p.id
     WHERE p.usuario_id = ? GROUP BY p.id
     ORDER BY COALESCE(p.actualizado_en, p.creado_en) DESC, p.id DESC`
  ).bind(user.id).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request);
  const nombre = String(b?.nombre || '').trim().slice(0, 80);
  if (!nombre || !PLANTILLAS.includes(b?.plantilla)) return json({ error: 'Nombre o plantilla no válidos' }, 400);
  const r = await env.DB.prepare('INSERT INTO portafolios (usuario_id, nombre, plantilla, publico) VALUES (?,?,?,0)')
    .bind(user.id, nombre, b.plantilla).run();
  return json({ id: r.meta.last_row_id }, 201);
}

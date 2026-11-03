import { json, auth, readJson } from '../../_lib.js';

const PLANTILLAS = ['riesgo', 'oro', 'dividendos'];

export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT id, nombre, plantilla, publico, creado_en FROM portafolios WHERE usuario_id = ? ORDER BY id DESC'
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

import { json, auth, readJson, ERROR_INTERNO } from '../../../_lib.js';

// Límite personal de peso por posición (opcional, solo para quien lo define). Es una PREFERENCIA de lectura: no cambia la composición,
// por eso no sube la revisión (no provoca conflictos de edición) y nunca se publica. { limite: número entre 0,1 y 100 | null }
export async function onRequestPut({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request) || {};
  let limite = null;
  if (b.limite !== null && b.limite !== undefined) {
    limite = Math.round(Number(b.limite) * 10) / 10;
    if (!(limite >= 0.1 && limite <= 100)) return json({ error: 'El límite debe estar entre 0,1 y 100 %.' }, 400);
  }
  try {
    const r = await env.DB.prepare('UPDATE portafolios SET limite_peso = ? WHERE id = ? AND usuario_id = ? RETURNING limite_peso').bind(limite, params.id, user.id).all();
    if (!r.results.length) return json({ error: 'No encontrado' }, 404);
    return json({ ok: true, limite_peso: r.results[0].limite_peso });
  } catch (e) { console.error('límite de peso:', e); return json({ error: ERROR_INTERNO }, 500); }
}

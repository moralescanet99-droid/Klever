import { json, auth } from '../../_lib.js';

// Radar PRIVADO: solo las filas del usuario autenticado (la condición va en la consulta, no en la interfaz).
export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  try {
    const { results } = await env.DB.prepare(
      `SELECT r.ticker, a.nombre, a.sector, a.tipo, r.nota, r.creado_en, r.actualizado_en
       FROM radar r JOIN activos a ON a.ticker = r.ticker WHERE r.usuario_id = ? ORDER BY r.creado_en DESC, r.ticker`).bind(user.id).all();
    return json(results);
  } catch (e) { console.error('leer radar:', e); return json({ error: 'No se pudo leer tu radar. Inténtalo de nuevo.' }, 500); }
}

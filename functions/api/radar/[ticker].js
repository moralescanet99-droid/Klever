import { json, auth, readJson, tickersDesconocidos, ERROR_INTERNO } from '../../_lib.js';

const MAX_RADAR = 200, MAX_NOTA = 500;
const valido = t => /^[A-Z.]{1,6}$/.test(t || '');

// PUT: guarda (o actualiza la nota de) un activo en MI radar. Idempotente: repetirlo no duplica (clave primaria usuario+ticker).
// Sin `nota` en el cuerpo, una fila existente conserva la suya.
export async function onRequestPut({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const ticker = String(params.ticker || '').toUpperCase();
  if (!valido(ticker)) return json({ error: 'Símbolo no válido' }, 400);
  const b = await readJson(request) || {};
  if (b.nota !== undefined && typeof b.nota !== 'string') return json({ error: 'La nota debe ser texto' }, 400);
  const nota = b.nota === undefined ? null : b.nota.trim();
  if (nota !== null && nota.length > MAX_NOTA) return json({ error: `La nota admite hasta ${MAX_NOTA} caracteres` }, 400);
  if ((await tickersDesconocidos(env, [{ ticker }])).length) return json({ error: 'Ese activo no está en el universo' }, 400);
  try {
    const ya = await env.DB.prepare('SELECT 1 x FROM radar WHERE usuario_id = ? AND ticker = ?').bind(user.id, ticker).first();
    if (!ya) {
      const { c } = await env.DB.prepare('SELECT COUNT(*) c FROM radar WHERE usuario_id = ?').bind(user.id).first();
      if (c >= MAX_RADAR) return json({ error: `Tu radar admite hasta ${MAX_RADAR} empresas. Quita alguna para añadir otra.` }, 400);
    }
    const r = await env.DB.prepare(
      `INSERT INTO radar (usuario_id, ticker, nota) VALUES (?, ?, COALESCE(?, ''))
       ON CONFLICT (usuario_id, ticker) DO UPDATE SET nota = COALESCE(?, nota), actualizado_en = datetime('now')
       RETURNING ticker, nota, creado_en, actualizado_en`).bind(user.id, ticker, nota, nota).all();
    return json({ ok: true, nuevo: !ya, ...r.results[0] });
  } catch (e) { console.error('guardar radar:', e); return json({ error: ERROR_INTERNO }, 500); }
}

export async function onRequestDelete({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const ticker = String(params.ticker || '').toUpperCase();
  if (!valido(ticker)) return json({ error: 'Símbolo no válido' }, 400);
  try { await env.DB.prepare('DELETE FROM radar WHERE usuario_id = ? AND ticker = ?').bind(user.id, ticker).run(); }
  catch (e) { console.error('quitar del radar:', e); return json({ error: 'No se pudo quitar. Inténtalo de nuevo.' }, 500); }
  return json({ ok: true }); // idempotente: quitar algo que no estaba no es un error
}

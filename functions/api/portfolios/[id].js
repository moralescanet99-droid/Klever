import { json, auth, readJson } from '../../_lib.js';

async function owned(env, user, id) {
  return await env.DB.prepare('SELECT * FROM portafolios WHERE id = ? AND usuario_id = ?').bind(id, user.id).first();
}

export async function onRequestGet({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const { results } = await env.DB.prepare(`
    SELECT po.ticker, po.peso, po.fecha_entrada, a.nombre, a.sector, a.tipo, f.roic
    FROM posiciones po JOIN activos a ON a.ticker = po.ticker
    LEFT JOIN fundamentales f ON f.ticker = po.ticker
      AND f.periodo = (SELECT MAX(periodo) FROM fundamentales WHERE ticker = po.ticker)
    WHERE po.portafolio_id = ? ORDER BY po.peso DESC`).bind(p.id).all();
  const total = results.reduce((s, r) => s + r.peso, 0);
  const sectores = {};
  for (const r of results) sectores[r.sector] = (sectores[r.sector] || 0) + r.peso;
  const conRoic = results.filter(r => r.roic != null);
  const wRoic = conRoic.reduce((s, r) => s + r.peso, 0);
  const calidad = wRoic ? conRoic.reduce((s, r) => s + r.roic * r.peso, 0) / wRoic : null;
  return json({ ...p, posiciones: results, total, sectores, calidad_media_roic: calidad });
}

// Reemplaza todas las posiciones: { posiciones: [{ticker, peso}] }, suma <= 100.
export async function onRequestPut({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const b = await readJson(request);
  const pos = Array.isArray(b?.posiciones) ? b.posiciones : null;
  if (!pos || pos.length > 50) return json({ error: 'Posiciones no válidas' }, 400);
  const seen = new Set(); let total = 0;
  for (const x of pos) {
    const peso = Number(x.peso);
    if (!/^[A-Z.]{1,6}$/.test(x.ticker) || seen.has(x.ticker) || !(peso > 0 && peso <= 100))
      return json({ error: 'Posición no válida: ' + x.ticker }, 400);
    seen.add(x.ticker); total += peso;
  }
  if (total > 100.0001) return json({ error: 'Los pesos suman más de 100%' }, 400);
  const stmts = [env.DB.prepare('DELETE FROM posiciones WHERE portafolio_id = ?').bind(p.id)];
  for (const x of pos)
    stmts.push(env.DB.prepare('INSERT INTO posiciones (portafolio_id, ticker, peso) VALUES (?,?,?)').bind(p.id, x.ticker, Number(x.peso)));
  try { await env.DB.batch(stmts); } catch { return json({ error: 'Algún ticker no está en el universo' }, 400); }
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM posiciones WHERE portafolio_id = ?').bind(p.id),
    env.DB.prepare('DELETE FROM portafolios WHERE id = ?').bind(p.id)]);
  return json({ ok: true });
}

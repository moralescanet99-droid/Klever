import { json, auth, readJson, validarComposicion, puedePublicar } from '../../_lib.js';

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

// Reemplaza todas las posiciones: { posiciones: [{ticker, peso}] }. Suma <= 100 %.
// Si la cartera es pública, debe seguir completa (100 %).  Misma regla que la interfaz.
export async function onRequestPut({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const b = await readJson(request);
  const pos = Array.isArray(b?.posiciones) ? b.posiciones : null;
  const v = validarComposicion(pos);
  if (!v.ok) return json({ error: v.error }, 400);
  if (p.publico && !v.completa) return json({ error: 'Esta cartera es pública y debe mantener el 100 % asignado. Deja de publicarla para guardar un reparto incompleto.' }, 400);
  const stmts = [env.DB.prepare('DELETE FROM posiciones WHERE portafolio_id = ?').bind(p.id),
    env.DB.prepare(`UPDATE portafolios SET actualizado_en = datetime('now') WHERE id = ?`).bind(p.id)];
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

// Edita nombre, tesis y visibilidad. Para publicar: composición completa (100 %), al menos 1 posición y tesis.
export async function onRequestPatch({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const b = await readJson(request) || {};
  const nombre = b.nombre !== undefined ? String(b.nombre).trim().slice(0, 80) : p.nombre;
  if (!nombre) return json({ error: 'El nombre no puede estar vacío' }, 400);
  const tesis = b.tesis !== undefined ? String(b.tesis).trim().slice(0, 600) : p.tesis;
  const publico = b.publico !== undefined ? (b.publico ? 1 : 0) : p.publico;
  if (publico) {
    const r = await env.DB.prepare('SELECT COUNT(*) c, COALESCE(SUM(peso), 0) s FROM posiciones WHERE portafolio_id = ?').bind(p.id).first();
    const motivo = puedePublicar({ total: r.s, n: r.c, tesis });
    if (motivo) return json({ error: motivo }, 400);
  }
  await env.DB.prepare('UPDATE portafolios SET nombre = ?, tesis = ?, publico = ?, actualizado_en = datetime(\'now\') WHERE id = ?').bind(nombre, tesis || null, publico, p.id).run();
  const u = await env.DB.prepare('SELECT actualizado_en FROM portafolios WHERE id = ?').bind(p.id).first();
  return json({ ok: true, actualizado_en: u.actualizado_en }); // la marca de versión que usa el cliente para detectar cambios de otra sesión
}

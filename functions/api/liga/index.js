import { json, auth, readJson } from '../../_lib.js';
import { lunesDe, fotoValida, retoSemana } from '../../../public/js/semana.js';
import { temporada, puntosTemporada, clasificar, codigoLiga, codigoValido, apodoValido, SEMANAS_TEMPORADA } from '../../../public/js/liga.js';

// Ronda 36 · LIGA, Temporada 0 (ronda36/LIGA.md). Sin precios ni rentabilidad: equilibrio + aprendizaje + constancia, semana a semana.
// GET  → temporada actual, tu perfil (apodo, pública), tu inscripción, tus puntos por semana, la clasificación general (solo quien la hace pública) y tus ligas privadas.
// POST → { accion: 'perfil' | 'inscribir' | 'crear_liga' | 'unirse' | 'salir' | 'borrar_liga', ... }.
// Lo que nunca sale de aquí: correos, composiciones ni importes. En las clasificaciones solo hay apodos y puntos.
export const INICIO_LIGA = '2026-11-02';   // lunes en que empieza la Temporada 0; las siguientes, cada 12 semanas
const MAX_LIGAS_CREADAS = 10, MAX_MIEMBROS = 200, TOP_GENERAL = 20, SEMANAS_PARA_CAMBIAR = 2;
const hoyUtc = () => new Date().toISOString().slice(0, 10);
const masDias = (iso, d) => new Date(Date.parse(iso + 'T00:00:00Z') + d * 864e5).toISOString().slice(0, 10);
export function temporadaActual(hoy = hoyUtc()) {
  const l = lunesDe(hoy), k = Math.max(0, Math.floor((Date.parse(l) - Date.parse(INICIO_LIGA)) / (7 * 864e5 * SEMANAS_TEMPORADA)));
  const t = temporada(masDias(INICIO_LIGA, 7 * SEMANAS_TEMPORADA * k));
  return { ...t, numero: k, nombre: `Temporada ${k}`, semanaActual: l, n: t.semanas.indexOf(l) + 1 };
}

// Puntos de la temporada de UNA persona (con su cartera inscrita). Todo sale de la base: fotos semanales, ideas y revisiones.
export async function puntosDe(env, uid, t) {
  const [ins, fotos, ideas, revs] = await env.DB.batch([
    env.DB.prepare('SELECT cartera_id, inscrito_en FROM liga_inscripciones WHERE usuario_id = ? AND temporada = ?').bind(uid, t.inicio),
    env.DB.prepare('SELECT cartera_id, semana, concentracion, variedad, n_categorias, senales, n_posiciones, completa FROM instantaneas WHERE usuario_id = ? AND semana >= ? AND semana <= ?').bind(uid, masDias(t.inicio, -7), t.fin),
    env.DB.prepare('SELECT estado, invalidacion, creado_en, actualizado_en FROM escenarios WHERE usuario_id = ?').bind(uid),
    env.DB.prepare('SELECT creado_en FROM revisiones_escenario WHERE usuario_id = ?').bind(uid)]);
  const i = ins.results[0]; if (!i) return null;
  const porSemana = {};
  for (const f of fotos.results) { let s = null; try { s = JSON.parse(f.senales); } catch { s = null; } const v = fotoValida({ semana: f.semana, concentracion: f.concentracion, variedad: f.variedad, n_categorias: f.n_categorias, senales: s });
    if (v) (porSemana[f.semana] ||= {})[f.cartera_id] = { foto: v, n: f.n_posiciones ?? 0, completa: f.completa === 1 }; }
  const semanas = t.semanas.map((sem, k) => {
    const fin = masDias(sem, 7), mias = porSemana[sem] || {}, propia = mias[i.cartera_id] || null, antes = porSemana[masDias(sem, -7)] || {};
    // el reto de esa semana, con las ideas tal como estaban al terminarla (aproximación declarada: «qué te haría cambiar de opinión» usa la última edición)
    const ideasSem = ideas.results.filter(e => String(e.creado_en).slice(0, 10) < fin);
    const r = retoSemana({ semana: sem, carteras: Object.entries(mias).map(([id, x]) => ({ id: +id, foto: x.foto })), anteriores: Object.fromEntries(Object.entries(antes).map(([id, x]) => [id, x.foto])), ideas: ideasSem });
    const enSemana = d => { const x = String(d || '').slice(0, 10); return x >= sem && x < fin; };
    return { semana: sem, foto: propia?.foto || null, completa: !!propia?.completa, n: propia?.n || 0, entro: Object.keys(mias).length > 0,
      retoHecho: !!r?.hecho, ideaSemana: ideas.results.some(e => enSemana(e.creado_en)) || revs.results.some(x => enSemana(x.creado_en)) };
  });
  return { cartera_id: i.cartera_id, inscrito: i.inscrito_en, ...puntosTemporada(semanas, t.semanaActual) };
}
async function clasificacionDe(env, ids, t) {
  const filas = [];
  for (const u of ids) { const p = await puntosDe(env, u.id, t); if (p) filas.push({ id: u.id, apodo: u.apodo, total: p.total, semanasBajas: p.semanasBajas, inscrito: p.inscrito }); }
  return clasificar(filas);
}

export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const t = temporadaActual(env.HOY_PRUEBAS || undefined);   // HOY_PRUEBAS: solo en las pruebas (fecha fija); nunca en producción
  try {
    const yo = await env.DB.prepare('SELECT apodo, liga_publica FROM usuarios WHERE id = ?').bind(user.id).first();
    const mios = await puntosDe(env, user.id, t);
    const nombreCartera = mios ? (await env.DB.prepare('SELECT nombre FROM portafolios WHERE id = ? AND usuario_id = ?').bind(mios.cartera_id, user.id).first())?.nombre ?? null : null;
    const { results: publicos } = await env.DB.prepare(`SELECT u.id, u.apodo FROM usuarios u JOIN liga_inscripciones i ON i.usuario_id = u.id AND i.temporada = ?
      WHERE u.liga_publica = 1 AND u.apodo IS NOT NULL LIMIT 500`).bind(t.inicio).all();
    const general = await clasificacionDe(env, publicos, t);
    const { results: misLigas } = await env.DB.prepare('SELECT l.id, l.codigo, l.nombre, l.creador_id FROM ligas l JOIN liga_miembros m ON m.liga_id = l.id WHERE m.usuario_id = ? ORDER BY l.id').bind(user.id).all();
    const privadas = [];
    for (const l of misLigas) {
      const { results: miembros } = await env.DB.prepare('SELECT u.id, u.apodo FROM liga_miembros m JOIN usuarios u ON u.id = m.usuario_id WHERE m.liga_id = ?').bind(l.id).all();
      const cl = await clasificacionDe(env, miembros, t);
      privadas.push({ id: l.id, codigo: l.codigo, nombre: l.nombre, mia: l.creador_id === user.id, miembros: miembros.length,
        clasificacion: cl.map(f => ({ apodo: f.id === user.id ? 'Tú' : (f.apodo || 'Sin apodo'), tu: f.id === user.id, total: f.total, puesto: f.puesto })),
        sin_inscribir: miembros.length - cl.length });
    }
    const puesto = general.find(f => f.id === user.id)?.puesto ?? null;
    return json({ temporada: { nombre: t.nombre, inicio: t.inicio, fin: t.fin, semana: t.n, semanas: SEMANAS_TEMPORADA, puede_cambiar: t.n <= SEMANAS_PARA_CAMBIAR },
      yo: { apodo: yo?.apodo ?? null, publica: yo?.liga_publica === 1, inscripcion: mios ? { cartera_id: mios.cartera_id, nombre: nombreCartera } : null,
        puntos: mios ? { total: mios.total, detalle: mios.detalle } : null, puesto_general: puesto, en_general: general.length },
      general: general.slice(0, TOP_GENERAL).map(f => ({ apodo: f.apodo, total: f.total, puesto: f.puesto, tu: f.id === user.id })), privadas });
  } catch (e) { console.error('liga:', e); return json({ error: 'No se pudo leer la Liga. Inténtalo de nuevo.' }, 500); }
}

export async function onRequestPost({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request) || {}, t = temporadaActual(env.HOY_PRUEBAS || undefined);
  try {
    if (b.accion === 'perfil') {
      const apodo = b.apodo == null || b.apodo === '' ? null : String(b.apodo).trim();
      if (apodo !== null && !apodoValido(apodo)) return json({ error: 'El apodo debe tener entre 3 y 20 caracteres (letras, números, espacios, punto o guiones) y no puede ser un correo.' }, 400);
      if (b.publica && !apodo) return json({ error: 'Para aparecer en la clasificación pública necesitas un apodo.' }, 400);
      try { await env.DB.prepare('UPDATE usuarios SET apodo = ?, liga_publica = ? WHERE id = ?').bind(apodo, b.publica ? 1 : 0, user.id).run(); }
      catch (e) { if (/UNIQUE/i.test(String(e.message))) return json({ error: 'Ese apodo ya lo usa otra persona. Prueba con otro.' }, 409); throw e; }
      return json({ ok: true, apodo, publica: !!b.publica });
    }
    if (b.accion === 'inscribir') {
      const c = await env.DB.prepare('SELECT id FROM portafolios WHERE id = ? AND usuario_id = ?').bind(Number(b.cartera_id), user.id).first();
      if (!c) return json({ error: 'No encontrado' }, 404);
      const ya = await env.DB.prepare('SELECT cartera_id FROM liga_inscripciones WHERE usuario_id = ? AND temporada = ?').bind(user.id, t.inicio).first();
      if (ya && ya.cartera_id !== c.id && t.n > SEMANAS_PARA_CAMBIAR) return json({ error: `Solo se puede cambiar de cartera en las ${SEMANAS_PARA_CAMBIAR} primeras semanas de la temporada.` }, 409);
      await env.DB.prepare(`INSERT INTO liga_inscripciones (usuario_id, temporada, cartera_id) VALUES (?, ?, ?)
        ON CONFLICT (usuario_id, temporada) DO UPDATE SET cartera_id = excluded.cartera_id`).bind(user.id, t.inicio, c.id).run();
      return json({ ok: true, cartera_id: c.id });
    }
    if (b.accion === 'crear_liga') {
      const nombre = String(b.nombre ?? '').trim();
      if (nombre.length < 3 || nombre.length > 40 || /[<>]/.test(nombre)) return json({ error: 'El nombre de la liga debe tener entre 3 y 40 caracteres.' }, 400);
      const n = await env.DB.prepare('SELECT COUNT(*) n FROM ligas WHERE creador_id = ?').bind(user.id).first();
      if (n.n >= MAX_LIGAS_CREADAS) return json({ error: `Puedes crear hasta ${MAX_LIGAS_CREADAS} ligas privadas.` }, 400);
      for (let intento = 0; intento < 5; intento++) {
        const codigo = codigoLiga();
        try {
          const [r] = await env.DB.batch([
            env.DB.prepare('INSERT INTO ligas (codigo, nombre, creador_id) VALUES (?, ?, ?) RETURNING id').bind(codigo, nombre, user.id),
            env.DB.prepare('INSERT INTO liga_miembros (liga_id, usuario_id) SELECT id, ? FROM ligas WHERE codigo = ?').bind(user.id, codigo)]);
          return json({ ok: true, id: r.results[0].id, codigo, nombre }, 201);
        } catch (e) { if (!/UNIQUE/i.test(String(e.message))) throw e; }   // código repetido (muy raro): se prueba otro
      }
      return json({ error: 'No se pudo crear la liga. Inténtalo de nuevo.' }, 500);
    }
    if (b.accion === 'unirse') {
      const codigo = String(b.codigo ?? '').trim().toUpperCase();
      if (!codigoValido(codigo)) return json({ error: 'El código tiene 6 letras o números (sin O, I, L, 0 ni 1).' }, 400);
      const l = await env.DB.prepare('SELECT id, nombre FROM ligas WHERE codigo = ?').bind(codigo).first();
      if (!l) return json({ error: 'No hay ninguna liga con ese código.' }, 404);
      const r = await env.DB.prepare(`INSERT OR IGNORE INTO liga_miembros (liga_id, usuario_id) SELECT ?, ? WHERE (SELECT COUNT(*) FROM liga_miembros WHERE liga_id = ?) < ?`).bind(l.id, user.id, l.id, MAX_MIEMBROS).run();
      const dentro = await env.DB.prepare('SELECT 1 x FROM liga_miembros WHERE liga_id = ? AND usuario_id = ?').bind(l.id, user.id).first();
      if (!dentro) return json({ error: `Esta liga ya tiene ${MAX_MIEMBROS} personas.` }, 409);
      return json({ ok: true, id: l.id, nombre: l.nombre, nuevo: !!r.meta?.changes });
    }
    if (b.accion === 'salir' || b.accion === 'borrar_liga') {
      const l = await env.DB.prepare('SELECT l.id, l.creador_id FROM ligas l JOIN liga_miembros m ON m.liga_id = l.id AND m.usuario_id = ? WHERE l.id = ?').bind(user.id, Number(b.liga_id)).first();
      if (!l) return json({ error: 'No encontrado' }, 404);
      if (b.accion === 'borrar_liga') {
        if (l.creador_id !== user.id) return json({ error: 'Solo quien creó la liga puede borrarla.' }, 403);
        await env.DB.batch([env.DB.prepare('DELETE FROM liga_miembros WHERE liga_id = ?').bind(l.id), env.DB.prepare('DELETE FROM ligas WHERE id = ?').bind(l.id)]);
      } else await env.DB.prepare('DELETE FROM liga_miembros WHERE liga_id = ? AND usuario_id = ?').bind(l.id, user.id).run();
      return json({ ok: true });
    }
    return json({ error: 'Acción no válida' }, 400);
  } catch (e) { console.error('liga post:', e); return json({ error: 'No se pudo guardar. Inténtalo de nuevo.' }, 500); }
}

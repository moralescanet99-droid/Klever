import { json, auth } from '../_lib.js';
import { fotoCartera, fotoValida, lunesDe } from '../../public/js/semana.js';

// Ronda 30 · «Tu semana» con memoria en el SERVIDOR. GET: calcula la foto de HOY de cada cartera del usuario (desde su composición GUARDADA y los
// umbrales de Klever), la registra como la foto de ESTA semana (una por cartera y semana: la última visita de la semana manda) y devuelve el historial.
// Así la evolución y «desde la semana del…» sirven en cualquier dispositivo, sobreviven a cerrar sesión y podrán alimentar el correo semanal.
// Qué se guarda: niveles de concentración y variedad, número de categorías y las señales (títulos). NUNCA importes ni rentabilidad.
// Se conservan 26 semanas por usuario; las más antiguas se borran en la misma operación.
const SEMANAS_HISTORIAL = 8, SEMANAS_CONSERVADAS = 26;
const hoyUtc = () => new Date().toISOString().slice(0, 10);

export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const hoy = hoyUtc(), semana = lunesDe(hoy);
  const desde = new Date(Date.parse(semana + 'T00:00:00Z') - (SEMANAS_HISTORIAL - 1) * 7 * 864e5).toISOString().slice(0, 10);
  const corte = new Date(Date.parse(semana + 'T00:00:00Z') - SEMANAS_CONSERVADAS * 7 * 864e5).toISOString().slice(0, 10);
  try {
    // Una sola instantánea de lectura: carteras + posiciones (con su categoría) del usuario.
    const [rc, rp] = await env.DB.batch([
      env.DB.prepare('SELECT id, nombre FROM portafolios WHERE usuario_id = ? ORDER BY id').bind(user.id),
      env.DB.prepare(`SELECT po.portafolio_id AS id, po.ticker, po.peso, a.sector, a.tipo FROM posiciones po JOIN portafolios p ON p.id = po.portafolio_id
                      JOIN activos a ON a.ticker = po.ticker WHERE p.usuario_id = ?`).bind(user.id)]);
    const activos = {}, pos = {};
    for (const x of rp.results) { activos[x.ticker] = { sector: x.sector, tipo: x.tipo }; (pos[x.id] ||= []).push({ ticker: x.ticker, peso: x.peso }); }
    const actuales = rc.results.map(c => ({ id: c.id, nombre: c.nombre, foto: fotoCartera(pos[c.id] || [], activos) }));
    const escr = actuales.filter(c => c.foto).map(c => env.DB.prepare(
      `INSERT INTO instantaneas (usuario_id, cartera_id, semana, concentracion, variedad, n_categorias, senales) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (usuario_id, cartera_id, semana) DO UPDATE SET concentracion = excluded.concentracion, variedad = excluded.variedad,
         n_categorias = excluded.n_categorias, senales = excluded.senales, actualizado_en = datetime('now')`)
      .bind(user.id, c.id, semana, c.foto.concentracion, c.foto.variedad, c.foto.n_categorias, JSON.stringify(c.foto.senales)));
    // Escritura de la semana + limpieza de lo antiguo (y de fotos de carteras que ya no existen) + lectura del historial, en UN lote transaccional.
    const res = await env.DB.batch([...escr,
      env.DB.prepare('DELETE FROM instantaneas WHERE usuario_id = ? AND (semana < ? OR cartera_id NOT IN (SELECT id FROM portafolios WHERE usuario_id = ?))').bind(user.id, corte, user.id),
      env.DB.prepare('SELECT cartera_id, semana, concentracion, variedad, n_categorias, senales FROM instantaneas WHERE usuario_id = ? AND semana >= ? ORDER BY semana').bind(user.id, desde)]);
    const hist = {};
    for (const f of res[res.length - 1].results) {
      let s = null; try { s = JSON.parse(f.senales); } catch { s = null; }
      const v = fotoValida({ semana: f.semana, concentracion: f.concentracion, variedad: f.variedad, n_categorias: f.n_categorias, senales: s });
      if (v) (hist[f.cartera_id] ||= []).push(v);   // una fila con forma inesperada no se entrega
    }
    return json({ hoy, semana, carteras: actuales.map(c => ({ id: c.id, nombre: c.nombre, foto: c.foto, historial: hist[c.id] || [] })) });
  } catch (e) { console.error('semana:', e); return json({ error: 'No se pudo leer tu semana. Inténtalo de nuevo.' }, 500); }
}

import { json, readJson } from '../_lib.js';

// Fase 1 (ronda 33) · EMBUDO ANÓNIMO: suma 1 al contador del día para un evento de una lista cerrada.
// No se guarda NADA de la persona: ni cuenta, ni IP, ni dispositivo, ni hora exacta. No necesita sesión.
// Lo que se puede medir: visitas (una por dispositivo y día), vuelve a los 7 días, cuentas iniciadas, carteras creadas e ideas guardadas.
export const EVENTOS = ['visita', 'vuelve_7d', 'cuenta_iniciada', 'cartera_creada', 'idea_guardada'];
export async function onRequestPost({ request, env }) {
  const b = await readJson(request) || {};
  if (!EVENTOS.includes(b.evento)) return json({ error: 'Evento no válido' }, 400);
  try {
    await env.DB.prepare(`INSERT INTO eventos_dia (fecha, evento, n) VALUES (date('now'), ?, 1)
      ON CONFLICT (fecha, evento) DO UPDATE SET n = n + 1`).bind(b.evento).run();
    return json({ ok: true });
  } catch (e) { console.error('evento:', e); return json({ error: 'No se pudo registrar' }, 500); }
}

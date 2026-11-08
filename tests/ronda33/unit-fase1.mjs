// Fase 1 (ronda 33) · cimientos: embudo anónimo (servidor real sobre SQLite), migración 0014, hoja de estilo única y documento del sistema de diseño.
// Uso: node tests/ronda33/unit-fase1.mjs
import * as EV from '../../functions/api/evento.js';
import { crearEnv, registro, RAIZ } from '../lib/d1-sqlite.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-F1-33.json');
const J = JSON.stringify, env = crearEnv();
const post = async body => { const r = await EV.onRequestPost({ request: new Request('http://x/api/evento', { method: 'POST', headers: { 'content-type': 'application/json' }, body: J(body) }), env }); return { s: r.status, j: await r.json() }; };
const filas = () => env.sql.prepare('SELECT evento, n FROM eventos_dia ORDER BY evento').all().map(x => x.evento + ':' + x.n).join(',');
let r = await post({ evento: 'visita' }); await post({ evento: 'visita' }); await post({ evento: 'cartera_creada' });
t('E1', 'Embudo: suma por día y evento, sin sesión', 'HTTP 200; visita 2 y cartera_creada 1 en una fila por evento', `${r.s} ${filas()}`, r.s === 200 && filas() === 'cartera_creada:1,visita:2');
const malos = await Promise.all([post({ evento: 'compra' }), post({}), post({ evento: 'visita; DROP TABLE eventos_dia' })]);
t('E2', 'Eventos fuera de la lista cerrada', 'HTTP 400 los tres y nada escrito', J(malos.map(x => x.s)) + ' ' + filas(), malos.every(x => x.s === 400) && filas() === 'cartera_creada:1,visita:2');
const cols = env.sql.prepare('PRAGMA table_info(eventos_dia)').all().map(c => c.name);
t('E3', 'No se guarda nada de la persona', 'solo fecha, evento y n (sin usuario, IP, dispositivo ni hora)', J(cols), J(cols) === J(['fecha', 'evento', 'n']));
t('E4', 'La lista de eventos es la del cliente', 'visita, vuelve_7d, cuenta_iniciada, cartera_creada, idea_guardada', J(EV.EVENTOS), J(EV.EVENTOS) === J(['visita', 'vuelve_7d', 'cuenta_iniciada', 'cartera_creada', 'idea_guardada']));
env.fallarEnSentencia = null; env.sql.exec('DROP TABLE eventos_dia'); r = await post({ evento: 'visita' });
t('E5', 'Fallo de la base: error claro, nunca un éxito falso', 'HTTP 500', `${r.s} ${r.j.error}`, r.s === 500);
let err = ''; try { crearEnv().sql.exec(readFileSync(path.join(RAIZ, 'migrations/0014_eventos.sql'), 'utf8')); } catch (e) { err = e.message; }
t('M1', 'Migración 0014 sobre un esquema nuevo', 'no falla (idempotente)', err || 'sin error', !err);
const html = readFileSync(path.join(RAIZ, 'public/index.html'), 'utf8'), css = readFileSync(path.join(RAIZ, 'public/klever.css'), 'utf8');
const hojas = [...html.matchAll(/rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
t('C1', 'Una sola hoja de estilo', 'index.html enlaza solo klever.css; las cinco antiguas ya no existen', J(hojas), J(hojas) === J(['klever.css']) && ['style.css', 'style-r13.css', 'style-r17.css', 'style-r26.css', 'style-r31.css'].every(f => !existsSync(path.join(RAIZ, 'public', f))));
const roots = [...css.matchAll(/(^|\n)(@media[^{]*\{)?:root\s*\{/g)].map(m => !!m[2]);
t('C2', 'Un único bloque de tokens', 'un :root de primer nivel (al principio) y solo los dos de @media del margen lateral', J(roots), roots.filter(x => !x).length === 1 && roots.filter(Boolean).length === 2 && css.indexOf(':root{') < css.indexOf('body'));
t('C3', 'Documento del sistema de diseño', 'DESIGN.md con identidad, tokens, componentes y reglas', existsSync(path.join(RAIZ, 'DESIGN.md')) ? 'existe' : 'falta', existsSync(path.join(RAIZ, 'DESIGN.md')) && /## Tokens/.test(readFileSync(path.join(RAIZ, 'DESIGN.md'), 'utf8')));
await fin();

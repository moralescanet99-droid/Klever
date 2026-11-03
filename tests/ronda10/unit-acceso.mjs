// Ronda 10: acceso por enlace. El enlace NUNCA sale en la respuesta salvo en desarrollo/pruebas aisladas (DEV_RETURN_LINK=1); un solo uso; caducidad;
// límites; tokens guardados con hash; y la configuración pública no expone nada. Manejadores reales de functions/api/{login,verify}.js sobre SQLite real.
// El «correo» se simula interceptando fetch (Brevo): NO es correo real.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as LOGIN from '../../functions/api/login.js';
import * as VERIFY from '../../functions/api/verify.js';
import { sha256 } from '../../functions/_lib.js';
import { crearEnv, RAIZ, registro } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-A.json');
const post = (f, env, body, extra = {}) => f({ request: new Request('https://beta.example/api/x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), env: { ...env, ...extra } }).then(async r => ({ s: r.status, j: await r.json() }));
const login = (env, email, extra) => post(LOGIN.onRequestPost, env, { email, acepto: true }, extra);
const canjear = (env, token) => post(VERIFY.onRequestPost, env, { token });
const enviados = []; const fetchReal = globalThis.fetch;
const brevo = ok => { globalThis.fetch = async (url, opts) => { enviados.push({ url: String(url), body: JSON.parse(opts.body) }); return { ok, status: ok ? 201 : 500 }; }; };
const idEnv = () => { const e = crearEnv(); return e; };

{ // A1 envío real simulado: la respuesta no lleva enlace ni token; el enlace solo va en el correo
  const env = idEnv(); brevo(true); enviados.length = 0;
  const r = await login(env, 'a1@example.com', { BREVO_API_KEY: 'k', MAIL_FROM: 'x@example.com' });
  const cuerpo = JSON.stringify(r.j), correo = enviados[0]?.body?.htmlContent || '';
  const token = (correo.match(/\?login=([0-9a-f]{64})/) || [])[1];
  t('A1', 'Acceso con envío de correo (configuración pública, sin DEV_RETURN_LINK)', 'La respuesta es solo {ok:true}: sin dev_link, sin token ni «login=»; el enlace va únicamente en el correo (a la dirección pedida)', `HTTP ${r.s}; cuerpo ${cuerpo}; correos enviados ${enviados.length} a ${enviados[0]?.body?.to?.[0]?.email}; enlace en el correo=${!!token}`,
    r.s === 200 && cuerpo === '{"ok":true}' && !/login=|dev_link|[0-9a-f]{64}/.test(cuerpo) && enviados.length === 1 && enviados[0].body.to[0].email === 'a1@example.com' && !!token);
  const c1 = await canjear(env, token), c2 = await canjear(env, token);
  t('A2', 'Enlace de un solo uso', 'El primer canje da sesión; el segundo, 400 «caducado o ya se usó»', `1.º HTTP ${c1.s} (sesión=${!!c1.j.token}); 2.º HTTP ${c2.s} «${c2.j.error}»`, c1.s === 200 && !!c1.j.token && c2.s === 400 && /ya se usó/.test(c2.j.error));
  const enl = env.sql.prepare('SELECT hash FROM enlaces').all(), ses = env.sql.prepare('SELECT hash FROM sesiones').all();
  t('A3', 'Tokens guardados solo como hash', 'Ni el enlace ni la sesión están en claro en la base de datos', `enlaces con token en claro=${enl.some(x => x.hash === token)}; sesiones con token en claro=${ses.some(x => x.hash === c1.j.token)}; hash del enlace correcto=${(await sha256(token)) === enl[0]?.hash || enl.length === 0}`, !enl.some(x => x.hash === token) && !ses.some(x => x.hash === c1.j.token) && ses.length === 1);
}
{ // A4 caducidad
  const env = idEnv(); brevo(true); enviados.length = 0; await login(env, 'a4@example.com', { BREVO_API_KEY: 'k', MAIL_FROM: 'x@example.com' });
  const token = enviados[0].body.htmlContent.match(/\?login=([0-9a-f]{64})/)[1];
  const dur = env.sql.prepare("SELECT (julianday(expira) - julianday('now')) * 24 * 60 AS min FROM enlaces").get().min;
  env.sql.exec("UPDATE enlaces SET expira = datetime('now','-1 minute')");
  const r = await canjear(env, token);
  t('A4', 'Caducidad del enlace', 'Dura unos 15 min y, caducado, no entra (400) ni crea sesión', `duración inicial ≈ ${dur.toFixed(1)} min; tras caducar HTTP ${r.s} «${r.j.error}»; sesiones=${env.sql.prepare('SELECT COUNT(*) c FROM sesiones').get().c}`, dur > 14 && dur <= 15.1 && r.s === 400 && env.sql.prepare('SELECT COUNT(*) c FROM sesiones').get().c === 0);
}
{ // A5 fallo del proveedor
  const env = idEnv(); brevo(false); const r = await login(env, 'a5@example.com', { BREVO_API_KEY: 'k', MAIL_FROM: 'x@example.com' });
  globalThis.fetch = async () => { throw new Error('sin red'); }; const r2 = await login(env, 'a5b@example.com', {});
  t('A5', 'Si el correo no se puede enviar (proveedor caído o sin configurar)', 'HTTP 502 con mensaje de reintento; NUNCA se devuelve el enlace como alternativa', `proveedor 500: HTTP ${r.s} «${r.j.error}»; sin red/sin claves: HTTP ${r2.s}; enlace en alguna respuesta=${/login=|dev_link/.test(JSON.stringify([r.j, r2.j]))}`, r.s === 502 && r2.s === 502 && !/login=|dev_link/.test(JSON.stringify([r.j, r2.j])));
}
{ // A6 solo DEV_RETURN_LINK === '1' devuelve el enlace
  const env = idEnv(); brevo(true); const visto = [];
  for (const [v, esp] of [['1', true], ['true', false], ['0', false], ['', false], [undefined, false]]) { const r = await login(env, `a6-${String(v)}-${visto.length}@example.com`, v === undefined ? { BREVO_API_KEY: 'k', MAIL_FROM: 'x@e.com' } : { DEV_RETURN_LINK: v, BREVO_API_KEY: 'k', MAIL_FROM: 'x@e.com' }); visto.push(`${JSON.stringify(v)}→${r.j.dev_link ? 'enlace' : 'sin enlace'}`); if (!!r.j.dev_link !== esp) visto.push('ERROR'); }
  t('A6', 'El enlace en pantalla solo con DEV_RETURN_LINK exactamente «1»', 'Con «1» sí; con «true», «0», vacío o sin definir, no', visto.join('; '), !visto.includes('ERROR'));
}
{ // A7 límites
  const env = idEnv(); brevo(true); const k = { BREVO_API_KEY: 'k', MAIL_FROM: 'x@e.com' };
  const a = await login(env, 'a7@example.com', k), b = await login(env, 'a7@example.com', k);
  env.sql.exec("UPDATE enlaces SET creado_en = datetime('now','-2 minutes')"); const c = await login(env, 'a7@example.com', k);
  for (let i = 0; i < 3; i++) { env.sql.exec("UPDATE enlaces SET creado_en = datetime('now','-2 minutes')"); await login(env, 'a7@example.com', k); }   // envíos 3.º, 4.º y 5.º del día
  env.sql.exec("UPDATE enlaces SET creado_en = datetime('now','-2 minutes')");
  const d = await login(env, 'a7@example.com', k);                                                                                        // el 6.º del día
  t('A7', 'Límites de envío por correo', 'Un segundo envío en menos de un minuto: 429; a partir del 5.º del día: 429', `2.º inmediato HTTP ${b.s}; tras 2 min HTTP ${c.s}; 6.º del día HTTP ${d.s} «${d.j.error}»`, a.s === 200 && b.s === 429 && c.s === 200 && d.s === 429);
}
globalThis.fetch = fetchReal;
{ // A8 configuración pública
  const toml = readFileSync(path.join(RAIZ, 'wrangler.toml'), 'utf8'), ign = readFileSync(path.join(RAIZ, '.gitignore'), 'utf8');
  const rastreados = execFileSync('git', ['ls-files'], { cwd: RAIZ, encoding: 'utf8' }).split('\n');
  const conClave = rastreados.filter(f => f && !/^(tests\/|ronda\d|procesos-klever\/|LEEME|PRUEBAS|PENDIENTES|README|scripts\/|revision-chatgpt\/|demo\/|package-lock)/.test(f) && (() => { try { return /DEV_RETURN_LINK/.test(readFileSync(path.join(RAIZ, f), 'utf8')); } catch { return false; } })());
  t('A8', 'La configuración desplegable no activa el enlace en pantalla ni guarda secretos', 'wrangler.toml sin [vars] ni DEV_RETURN_LINK; .dev.vars ignorado y no versionado; DEV_RETURN_LINK solo aparece en el manejador de acceso (y en scripts/pruebas/documentación)', `[vars] en wrangler.toml=${/\[vars\]/.test(toml)}; DEV_RETURN_LINK en wrangler.toml=${/DEV_RETURN_LINK/.test(toml)}; .dev.vars ignorado=${/^\.dev\.vars$/m.test(ign)}; versionado=${rastreados.includes('.dev.vars')}; ficheros de código con DEV_RETURN_LINK: ${conClave.join(', ')}; database_id es el marcador=${/REEMPLAZAR_CON_ID_DE_D1/.test(toml)}`,
    !/\[vars\]/.test(toml) && !/DEV_RETURN_LINK/.test(toml) && /^\.dev\.vars$/m.test(ign) && !rastreados.includes('.dev.vars') && conClave.join() === 'functions/api/login.js' && /REEMPLAZAR_CON_ID_DE_D1/.test(toml));
}
await fin();

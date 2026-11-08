// Ronda 36 · Liga (Temporada 0) en el SERVIDOR sobre SQLite real: inscripción, puntos desde las fotos semanales, apodos, clasificación general y ligas privadas.
// Uso: node tests/ronda36/unit-liga-servidor36.mjs
import * as LI from '../../functions/api/liga/index.js';
import * as PO from '../../functions/api/portfolios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-LIGASRV36.json');
const J = JSON.stringify;
const env = crearEnv(); await sembrar(env); env.HOY_PRUEBAS = '2026-11-18';   // semana 3 de la Temporada 0 (empieza el 2 nov)
for (const k of ['A', 'B', 'C', 'D', 'E']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
for (const u of [2, 3]) { env.sql.prepare('INSERT INTO usuarios(id,email) VALUES(?,?)').run(u, `u${u}@example.com`); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,?)').run(await sha256('token-' + u), u); }
const T = { 1: 'token-de-prueba', 2: 'token-2', 3: 'token-3', 0: null };
const llama = async (f, u, m, body, params = {}) => { const h = { 'content-type': 'application/json' }; if (T[u]) h.authorization = 'Bearer ' + T[u];
  const r = await f({ request: new Request('http://x/api/liga', { method: m, headers: h, body: body === undefined ? undefined : J(body) }), env, params }); return { s: r.status, j: await r.json() }; };
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla) VALUES (1,1,'Mía','riesgo'),(2,1,'Otra mía','riesgo'),(3,2,'De dos','riesgo'),(4,3,'De tres','riesgo')`);
const foto = (u, c, sem, co, va, n = 5, comp = 1) => env.sql.prepare("INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales,n_posiciones,completa) VALUES (?,?,?,?,?,?,'[]',?,?)").run(u, c, sem, co, va, n, n, comp);
// usuario 1: semana 1 alta/media, semana 2 no entra, semana 3 baja/amplia; idea guardada en la semana 3
foto(1, 1, '2026-11-02', 'alto', 'medio'); foto(1, 1, '2026-11-16', 'ok', 'ok');
env.sql.prepare("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json,creado_en) VALUES (1,'idea-liga-001','Idea','proporcional',1,'Mía',0,'A',10,'[]','[]','2026-11-17 10:00:00')").run();
// usuario 2: tres semanas con cartera de 3 posiciones (no puntúa equilibrio)
for (const s of ['2026-11-02', '2026-11-09', '2026-11-16']) foto(2, 3, s, 'ok', 'ok', 3);

let r = await llama(LI.onRequestGet, 0, 'GET');
t('G1', 'Sin sesión', 'HTTP 401', `HTTP ${r.s}`, r.s === 401);
r = await llama(LI.onRequestGet, 1, 'GET');
t('G2', 'Temporada 0: semana 3 de 12; sin inscribir no hay puntos', 'Temporada 0, del 2 nov al 24 ene, semana 3; inscripción y puntos vacíos; aún se puede cambiar de cartera… no (semana 3 > 2)', J(r.j.temporada) + J(r.j.yo),
  r.s === 200 && r.j.temporada.nombre === 'Temporada 0' && r.j.temporada.inicio === '2026-11-02' && r.j.temporada.fin === '2027-01-24' && r.j.temporada.semana === 3 && r.j.yo.inscripcion === null && r.j.yo.puntos === null && r.j.temporada.puede_cambiar === false);
r = await llama(LI.onRequestPost, 1, 'POST', { accion: 'inscribir', cartera_id: 3 });
t('I1', 'No se puede inscribir la cartera de otra persona', 'HTTP 404', `HTTP ${r.s}`, r.s === 404);
r = await llama(LI.onRequestPost, 1, 'POST', { accion: 'inscribir', cartera_id: 1 });
const r2 = await llama(LI.onRequestPost, 1, 'POST', { accion: 'inscribir', cartera_id: 2 });
t('I2', 'Inscribirse; cambiar de cartera después de la semana 2 no se puede', 'HTTP 200 y después HTTP 409 con el motivo', `${r.s} / ${r2.s}: ${r2.j.error}`, r.s === 200 && r2.s === 409 && /2 primeras semanas/.test(r2.j.error));
r = await llama(LI.onRequestGet, 1, 'GET');
const d = r.j.yo.puntos?.detalle || [];
t('P1', 'Puntos por semana desde las fotos (reglas de LIGA.md)', 'semana 1: 0+12 equilibrio, entra 10 = 22 (+ reto si lo hubo); semana 2: sin entrar, hereda la última foto (12) sin constancia; semana 3: 50 equilibrio + 10 idea + 10 entra (racha rota) ≥ 70', J(d.map(x => [x.semana, x.equilibrio, x.aprendizaje, x.constancia])),
  d.length === 3 && d[0].equilibrio === 12 && d[0].constancia === 10 && d[1].equilibrio === 12 && d[1].constancia === 0 && d[2].equilibrio === 50 && d[2].aprendizaje >= 10 && d[2].constancia === 10 && r.j.yo.puntos.total === d.reduce((a, x) => a + x.total, 0) && r.j.yo.inscripcion.nombre === 'Mía');
await llama(LI.onRequestPost, 2, 'POST', { accion: 'inscribir', cartera_id: 3 });
r = await llama(LI.onRequestGet, 2, 'GET');
t('P2', 'Cartera con menos de 4 posiciones: sin puntos de equilibrio (y se dice por qué)', 'equilibrio 0 las tres semanas, con su motivo; constancia sí', J(r.j.yo.puntos.detalle.map(x => [x.equilibrio, x.constancia, x.motivo])), r.j.yo.puntos.detalle.every(x => x.equilibrio === 0 && /4 posiciones/.test(x.motivo)) && r.j.yo.puntos.detalle[2].constancia === 14);
// perfil y clasificación general
const malos = await Promise.all([llama(LI.onRequestPost, 1, 'POST', { accion: 'perfil', apodo: 'yo@correo.es', publica: true }), llama(LI.onRequestPost, 1, 'POST', { accion: 'perfil', apodo: '', publica: true })]);
t('A1', 'Apodo: nunca un correo; para ser pública hace falta apodo', 'HTTP 400 los dos', J(malos.map(x => x.s)), malos.every(x => x.s === 400));
r = await llama(LI.onRequestPost, 1, 'POST', { accion: 'perfil', apodo: 'Lucía_23', publica: true });
const rep = await llama(LI.onRequestPost, 2, 'POST', { accion: 'perfil', apodo: 'lucía_23', publica: true });
t('A2', 'Apodo único (sin distinguir mayúsculas)', 'HTTP 200 y después HTTP 409', `${r.s} / ${rep.s}`, r.s === 200 && rep.s === 409);
await llama(LI.onRequestPost, 2, 'POST', { accion: 'perfil', apodo: 'Dani', publica: false });
r = await llama(LI.onRequestGet, 3, 'GET');
t('C1', 'Clasificación general: solo quien la hace pública y está inscrito; nunca correos', 'aparece «Lucía_23» (pública), no «Dani» (privada); sin «@» en la respuesta', J(r.j.general), J(r.j.general.map(x => x.apodo)) === J(['Lucía_23']) && !J(r.j).includes('@'));
// ligas privadas
r = await llama(LI.onRequestPost, 1, 'POST', { accion: 'crear_liga', nombre: 'Los del piso' });
const codigo = r.j.codigo, lid = r.j.id;
t('L1', 'Crear una liga privada', 'HTTP 201 con un código de 6 caracteres; quien la crea ya es miembro', J(r.j), r.s === 201 && /^[A-Z2-9]{6}$/.test(codigo));
const u2 = await llama(LI.onRequestPost, 2, 'POST', { accion: 'unirse', codigo: codigo.toLowerCase() }), u2b = await llama(LI.onRequestPost, 2, 'POST', { accion: 'unirse', codigo });
const mal = await llama(LI.onRequestPost, 3, 'POST', { accion: 'unirse', codigo: 'ZZZZZZ' });
t('L2', 'Unirse con el código (sin distinguir mayúsculas); repetir no duplica; código inexistente', '200 nuevo / 200 no nuevo / 404', `${u2.s}:${u2.j.nuevo} ${u2b.s}:${u2b.j.nuevo} ${mal.s}`, u2.s === 200 && u2.j.nuevo === true && u2b.j.nuevo === false && mal.s === 404);
r = await llama(LI.onRequestGet, 2, 'GET');
const pl = r.j.privadas[0];
t('L3', 'Clasificación privada: apodos y «Tú», nunca correos; la ven sus miembros', '«Los del piso», 2 miembros; «Tú» (Dani) y «Lucía_23»; sin «@»', J(pl), pl.nombre === 'Los del piso' && pl.miembros === 2 && pl.clasificacion.some(x => x.apodo === 'Tú' && x.tu) && pl.clasificacion.some(x => x.apodo === 'Lucía_23') && !J(r.j).includes('@'));
r = await llama(LI.onRequestGet, 3, 'GET');
t('L4', 'Quien no es miembro no ve la liga privada', 'usuario 3 sin ligas privadas', J(r.j.privadas), r.j.privadas.length === 0);
const b2 = await llama(LI.onRequestPost, 2, 'POST', { accion: 'borrar_liga', liga_id: lid }), s2 = await llama(LI.onRequestPost, 2, 'POST', { accion: 'salir', liga_id: lid }), b1 = await llama(LI.onRequestPost, 1, 'POST', { accion: 'borrar_liga', liga_id: lid });
t('L5', 'Salir y borrar', 'quien no la creó no puede borrarla (403) pero puede salir (200); quien la creó la borra (200)', `${b2.s} ${s2.s} ${b1.s}`, b2.s === 403 && s2.s === 200 && b1.s === 200 && env.sql.prepare('SELECT COUNT(*) n FROM ligas').get().n === 0 && env.sql.prepare('SELECT COUNT(*) n FROM liga_miembros').get().n === 0);
const malas = await Promise.all([llama(LI.onRequestPost, 1, 'POST', { accion: 'crear_liga', nombre: 'ab' }), llama(LI.onRequestPost, 1, 'POST', { accion: 'unirse', codigo: 'ABC' }), llama(LI.onRequestPost, 1, 'POST', { accion: 'otra' })]);
t('L6', 'Entradas no válidas', 'nombre corto, código mal formado y acción desconocida: HTTP 400', J(malas.map(x => x.s)), malas.every(x => x.s === 400));
r = await llama(PO.onRequestDelete, 1, 'DELETE', undefined, { id: '1' });
t('B1', 'Borrar la cartera inscrita borra su inscripción', 'HTTP 200; sin inscripción del usuario 1', `HTTP ${r.s}; ${env.sql.prepare('SELECT COUNT(*) n FROM liga_inscripciones WHERE usuario_id = 1').get().n}`, r.s === 200 && env.sql.prepare('SELECT COUNT(*) n FROM liga_inscripciones WHERE usuario_id = 1').get().n === 0);
env.fallarEnSentencia = 0; r = await llama(LI.onRequestGet, 2, 'GET'); env.fallarEnSentencia = null;
t('E1', 'Fallo de la base: error claro', 'HTTP 500 con mensaje', `HTTP ${r.s}: ${r.j.error}`, r.s === 500 && /Liga/.test(r.j.error));
await fin();

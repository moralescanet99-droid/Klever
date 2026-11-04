// Ronda 8: la migración 0007 sobre una base ANTIGUA (esquema anterior a la ronda 7) CON DATOS: no pierde carteras ni posiciones.
// El esquema antiguo es un fixture (commit aa21407). No se aplica la migración sobre el esquema nuevo (ya tiene las columnas): se comprueba que falla.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as P from '../../functions/api/portfolios/[id].js';
import { crearEnv, sembrar, llamar, RAIZ } from '../lib/d1-sqlite.mjs';
import { registro } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-M.json');
const mig = readFileSync(path.join(RAIZ, 'migrations/0007_revision.sql'), 'utf8');
const env = crearEnv(path.join(RAIZ, 'tests/ronda8/fixtures/esquema-anterior-0006.sql')); await sembrar(env);
const db = env.sql;
const antesCols = db.prepare('PRAGMA table_info(portafolios)').all().map(c => c.name);
db.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis,actualizado_en,creado_en) VALUES
 (1,1,'Privada antigua','oro',0,NULL,NULL,'2026-10-01 10:00:00'),
 (2,1,'Pública antigua','oro',1,'Tesis antigua','2026-10-05 12:30:00','2026-10-02 09:00:00');
 INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'GLD',60),(1,'IAU',40),(2,'GDX',70),(2,'NEM',30)`);
const volcado = () => JSON.stringify({ c: db.prepare('SELECT id,usuario_id,nombre,plantilla,publico,tesis,actualizado_en,creado_en FROM portafolios ORDER BY id').all(), p: db.prepare('SELECT portafolio_id,ticker,peso,fecha_entrada FROM posiciones ORDER BY portafolio_id,ticker').all() });
const antes = volcado();
t('M0', 'La base de partida es de verdad la antigua', 'portafolios sin las columnas revision y token_escritura', antesCols.join(','), !antesCols.includes('revision') && !antesCols.includes('token_escritura'));
db.exec(mig);
const rev = db.prepare('SELECT id, revision, token_escritura FROM portafolios ORDER BY id').all();
t('M1', 'Aplicar 0007 sobre la base antigua con datos', 'Mismas 2 carteras y 4 posiciones, campo a campo; revisión 0 y sin marca de escritura en todas', `datos intactos=${volcado() === antes}; revisiones ${rev.map(r => r.revision + '/' + r.token_escritura).join(' ')}`, volcado() === antes && rev.length === 2 && rev.every(r => r.revision === 0 && r.token_escritura === null));
// Ronda 13: la migración 0008 (radar, escenarios, límite, origen de datos) encadenada sobre lo anterior: aditiva, sin tocar filas
const mig8 = readFileSync(path.join(RAIZ, 'migrations/0008_radar_escenarios.sql'), 'utf8'), antes8 = volcado();
db.exec(mig8);
const tablas = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(x => x.name);
t('M1b', 'Aplicar 0008 (ronda 13) tras la 0007 sobre la base antigua con datos', 'Datos intactos; existen radar, escenarios y datos_meta; limite_peso vacío en todas las carteras', `datos intactos=${volcado() === antes8}; tablas ${tablas.filter(x => ['radar', 'escenarios', 'datos_meta'].includes(x)).join(',')}; límites ${J(db.prepare('SELECT limite_peso FROM portafolios').all().map(x => x.limite_peso))}`,
  volcado() === antes8 && ['radar', 'escenarios', 'datos_meta'].every(x => tablas.includes(x)) && db.prepare('SELECT limite_peso FROM portafolios').all().every(x => x.limite_peso === null));
function J(x) { return JSON.stringify(x); }
// Ronda 14: la migración 0009 (procedencia por dato, campos de seguimiento y lotes de carga) encadenada, con filas previas de fundamentales y de escenarios
db.exec("INSERT INTO usuarios(id,email) VALUES (7,'migra@example.com') ON CONFLICT DO NOTHING; INSERT INTO activos(ticker,nombre,tipo,sector) VALUES ('MIG','Migrada','accion','Salud') ON CONFLICT DO NOTHING; INSERT INTO fundamentales(ticker,periodo,ingresos) VALUES ('MIG','FY2024',5);");
db.exec("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json) VALUES (7,'antiguo-0001','De la ronda 13','proporcional',1,'X',0,'MIG',10,'[]','[]')");
const mig9 = readFileSync(path.join(RAIZ, 'migrations/0009_procedencia_y_seguimiento.sql'), 'utf8'); db.exec(mig9);
const colsDe = (d, tb) => d.prepare(`PRAGMA table_info(${tb})`).all().map(c => `${c.name}:${c.type}:${c.notnull}:${c.dflt_value}`).sort().join('|');
const nuevo9 = crearEnv().sql, fm = db.prepare('SELECT fuente, actualizado_en FROM fundamentales WHERE ticker=?').get('MIG'), em = db.prepare("SELECT pregunta, revisar_en, historia FROM escenarios WHERE clave='antiguo-0001'").get();
t('M1c', 'Aplicar 0009 (ronda 14) con filas previas', 'Las filas previas siguen: fundamentales con fuente NULL («sin fuente verificada») y el escenario antiguo con pregunta vacía y sin fecha; tablas idénticas a schema.sql; existe `cargas`',
  `fundamentales ${J(fm)}; escenario ${J(em)}; fundamentales iguales=${colsDe(db, 'fundamentales') === colsDe(nuevo9, 'fundamentales')}; escenarios iguales=${colsDe(db, 'escenarios') === colsDe(nuevo9, 'escenarios')}; cargas ${colsDe(db, 'cargas') === colsDe(nuevo9, 'cargas')}`,
  fm.fuente === null && fm.actualizado_en === null && em.pregunta === '' && em.revisar_en === null && em.historia === null && colsDe(db, 'cargas') === colsDe(nuevo9, 'cargas'));
// Ronda 15: la migración 0010 (resultado operativo, informe, actividad, emisor, mercado, evaluación fechada) encadenada, con filas previas
const mig10 = readFileSync(path.join(RAIZ, 'migrations/0010_nota_y_comparador.sql'), 'utf8'); db.exec(mig10);
const nuevo10 = crearEnv().sql, f10 = db.prepare('SELECT resultado_operativo, informe FROM fundamentales WHERE ticker=?').get('MIG'), e10 = db.prepare("SELECT nota_json FROM escenarios WHERE clave='antiguo-0001'").get(), a10 = db.prepare("SELECT actividad, emisor FROM activos WHERE ticker='MIG'").get();
t('M1d', 'Aplicar 0010 (ronda 15) con filas previas', 'Filas previas intactas (resultado operativo, informe, actividad, emisor y evaluación en NULL = «sin dato»); tablas idénticas a schema.sql; existe `mercado`',
  `fundamentales ${J(f10)}; activos ${J(a10)}; escenario ${J(e10)}; iguales: ${['fundamentales', 'activos', 'mercado'].map(x => x + '=' + (colsDe(db, x) === colsDe(nuevo10, x))).join(',')}`,
  f10.resultado_operativo === null && f10.informe === null && a10.actividad === null && a10.emisor === null && e10.nota_json === null && ['fundamentales', 'activos', 'mercado'].every(x => colsDe(db, x) === colsDe(nuevo10, x)));
// Ronda 16: la migración 0011 (vínculo estable con la pregunta editorial) encadenada. Antes de aplicarla hay escenarios antiguos de cuatro tipos.
const ins = (clave, pregunta, historia) => db.prepare("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json,pregunta,historia) VALUES (7,?,'x','proporcional',1,'X',0,'MIG',10,'[]','[]',?,?)").run(clave, pregunta, historia);
ins('mig11-igual-01', '¿Se han firmado los dos contratos anunciados?', 'hidrogeno-norte'); ins('mig11-otra-001', '¿Y si la empresa cambia de cliente?', 'hidrogeno-norte');
ins('mig11-igual-02', '¿Se firmará el contrato de D antes de que acabe el primer trimestre de 2027?', 'hidrogeno-norte'); ins('mig11-sinhis-01', '¿Se han firmado los dos contratos anunciados?', null); ins('mig11-casi-0001', '¿Se han firmado los dos contratos anunciados? ', 'hidrogeno-norte');
const mig11 = readFileSync(path.join(RAIZ, 'migrations/0011_pregunta_estable.sql'), 'utf8'); db.exec(mig11);
const nuevo11 = crearEnv().sql, r11 = Object.fromEntries(db.prepare("SELECT clave, pregunta_ref FROM escenarios WHERE clave LIKE 'mig11-%' OR clave='antiguo-0001'").all().map(x => [x.clave, x.pregunta_ref]));
t('M1e', 'Aplicar 0011 (ronda 16) con escenarios antiguos: solo la coincidencia INEQUÍVOCA se vincula', '; escenarios idéntico a schema.sql', `${J(r11)}; escenarios iguales=${colsDe(db, 'escenarios') === colsDe(nuevo11, 'escenarios')}`,
  r11['mig11-igual-01'] === 'hidrogeno-norte:1' && r11['mig11-igual-02'] === 'hidrogeno-norte:2' && r11['mig11-otra-001'] === null && r11['mig11-sinhis-01'] === null && r11['mig11-casi-0001'] === null && r11['antiguo-0001'] === null && colsDe(db, 'escenarios') === colsDe(nuevo11, 'escenarios'));
const nuevoCols = crearEnv().sql.prepare('PRAGMA table_info(portafolios)').all().map(c => `${c.name}:${c.type}:${c.notnull}:${c.dflt_value}`).sort().join('|');
const migCols = db.prepare('PRAGMA table_info(portafolios)').all().map(c => `${c.name}:${c.type}:${c.notnull}:${c.dflt_value}`).sort().join('|');
t('M2', 'La base migrada y la base nueva (schema.sql) tienen la misma tabla portafolios', 'Mismas columnas, tipos, obligatoriedad y valores por defecto', `iguales=${nuevoCols === migCols}`, nuevoCols === migCols);
const g = await llamar(P.onRequestGet, env, 'GET', undefined, 2);
t('M3', 'Leer una cartera pública antigua tras migrar', 'HTTP 200, revisión 0, tesis y posiciones conservadas, sin exponer token_escritura', `HTTP ${g.s}; revisión ${g.j.revision}; tesis «${g.j.tesis}»; posiciones ${g.j.posiciones?.length}; token expuesto=${'token_escritura' in g.j}`, g.s === 200 && g.j.revision === 0 && g.j.tesis === 'Tesis antigua' && g.j.posiciones.length === 2 && !('token_escritura' in g.j));
const w = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 50 }, { ticker: 'NEM', peso: 50 }], nombre: 'Pública antigua', tesis: 'Tesis antigua', revision: 0 }, 2);
const g2 = await llamar(P.onRequestGet, env, 'GET', undefined, 2);
t('M4', 'Guardar una cartera antigua migrada', 'HTTP 200, revisión 1 y las posiciones nuevas; la otra cartera no se toca', `HTTP ${w.s}; revisión ${w.j.revision}; posiciones ${g2.j.posiciones.map(x => x.ticker + ':' + x.peso).sort().join(',')}; la otra intacta=${JSON.stringify(db.prepare('SELECT nombre,revision FROM portafolios WHERE id=1').get()) === '{"nombre":"Privada antigua","revision":0}'}`, w.s === 200 && w.j.revision === 1 && g2.j.posiciones.length === 2 && g2.j.posiciones.every(x => x.peso === 50) && db.prepare('SELECT revision FROM portafolios WHERE id=1').get().revision === 0);
let err = ''; try { crearEnv().sql.exec(mig); } catch (e) { err = e.message; }
t('M5', 'Aplicar 0007 sobre el esquema NUEVO (que ya tiene las columnas)', 'Falla con «duplicate column»: por eso solo se aplica a bases anteriores', `error: ${err}`, /duplicate column/i.test(err));
let err8 = ''; try { crearEnv().sql.exec(mig8); } catch (e) { err8 = e.message; }
t('M6', 'Aplicar 0008 sobre el esquema NUEVO', 'Falla con «duplicate column»: solo se aplica a bases anteriores', `error: ${err8}`, /duplicate column/i.test(err8));
let err9 = ''; try { crearEnv().sql.exec(mig9); } catch (e) { err9 = e.message; }
t('M7', 'Aplicar 0009 sobre el esquema NUEVO', 'Falla con «duplicate column»: solo se aplica a bases anteriores', `error: ${err9}`, /duplicate column/i.test(err9));
let err10 = ''; try { crearEnv().sql.exec(mig10); } catch (e) { err10 = e.message; }
t('M8', 'Aplicar 0010 sobre el esquema NUEVO', 'Falla con «duplicate column»: solo se aplica a bases anteriores', `error: ${err10}`, /duplicate column/i.test(err10));
let err11 = ''; try { crearEnv().sql.exec(mig11); } catch (e) { err11 = e.message; }
t('M9', 'Aplicar 0011 sobre el esquema NUEVO', 'Falla con «duplicate column»: solo se aplica a bases anteriores', `error: ${err11}`, /duplicate column/i.test(err11));
await fin();

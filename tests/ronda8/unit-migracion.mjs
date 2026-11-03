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
await fin();

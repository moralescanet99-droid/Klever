// Ronda 21 · el CÓDIGO DE SALIDA de las pruebas de MÓDULO (`registro()`), verificado en SUBPROCESOS reales: éxito → 0; aserción fallida → ≠ 0; error previo con aserciones correctas → se conserva (≠ 0); error previo MÁS aserción fallida → ≠ 0;
// recurso que mantiene vivo el proceso → 3 con «CIERRE FORZADO». Y `tests/run-all.sh` rechaza cada caso. La garantía se acota a los caminos controlados (no a un `process.exit(0)` arbitrario en cualquier archivo). Uso: node tests/ronda21/unit-registro21.mjs
import { spawnSync } from 'node:child_process';
import { rmSync, readFileSync, existsSync } from 'node:fs';
import { registro, RAIZ } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-REG21.json');
const FIX = 'tests/ronda21/fixture-registro.mjs', TMP = 'ronda21/registro-tmp';
const corre = modo => { const r = spawnSync('node', [FIX], { cwd: RAIZ, env: { ...process.env, MODO_REGISTRO: modo, RONDA: TMP }, encoding: 'utf8', timeout: 60000 }); return { cod: r.status, sal: (r.stdout || '') + (r.stderr || '') }; };
const ejecutor = modo => { rmSync(RAIZ + '/' + TMP, { recursive: true, force: true }); const r = spawnSync('bash', ['tests/run-all.sh'], { cwd: RAIZ, env: { ...process.env, MODO_REGISTRO: modo, RONDA: TMP, UNIDAD: FIX, BATERIAS: ' ', PRUEBAS_SH: ' ', SEGURIDAD: ' ', OMITIR_DEMO: '1', LIMITE_BATERIA: '60' }, encoding: 'utf8', timeout: 120000 });
  const lg = `${RAIZ}/${TMP}/logs/fixture-registro.log`; return { cod: r.status, sal: (r.stdout || '') + (r.stderr || ''), log: existsSync(lg) ? readFileSync(lg, 'utf8') : '' }; };
let r = corre('exito'); t('Y1', 'Éxito real (módulo)', 'Código 0 y «RESULTADO: 1 correctas, 0 fallos», sin cierre forzado', `código ${r.cod}`, r.cod === 0 && /RESULTADO: 1 correctas, 0 fallos/.test(r.sal) && !/CIERRE/.test(r.sal));
r = corre('fallo'); t('Y2', 'Aserción fallida (módulo)', 'Código ≠ 0', `código ${r.cod}`, r.cod === 1 && /RESULTADO: 0 correctas, 1 fallos/.test(r.sal));
r = corre('error-previo'); t('Y3', 'Error previo (código 2 fijado antes) con las aserciones aprobadas — el caso exacto de la revisión de la ronda 20', 'El código 2 se CONSERVA (la ronda 20 lo borraba con process.exit(0))', `código ${r.cod}`, r.cod === 2 && /RESULTADO: 1 correctas, 0 fallos/.test(r.sal));
r = corre('error-previo-y-fallo'); t('Y4', 'Error previo MÁS aserción fallida', 'Código ≠ 0 (1 o el previo; nunca 0)', `código ${r.cod}`, r.cod !== 0 && r.cod !== null && /RESULTADO: 0 correctas, 1 fallos/.test(r.sal));
r = corre('recurso'); t('Y5', 'Recurso que mantiene vivo el proceso (módulo)', 'Tras 10 s: «CIERRE FORZADO» y código 3', `código ${r.cod}`, r.cod === 3 && /CIERRE FORZADO/.test(r.sal));
for (const [id, modo, esp] of [['Y6', 'exito', null], ['Y7', 'fallo', /tiene 1 fallos|salió con código/], ['Y8', 'error-previo', /salió con código 2/], ['Y9', 'error-previo-y-fallo', /salió con código|tiene 1 fallos/], ['Y10', 'recurso', /CIERRE ANÓMALO o forzado/]]) {
  const e = ejecutor(modo); t(id, `run-all.sh con la fixture de módulo en modo «${modo}»`, esp ? 'El ejecutor sale con 1 y nombra el problema' : 'Sale con 0 y «todo correcto»', `código ${e.cod}; ${e.sal.split('\n').filter(l => /FALLA|RESUMEN/.test(l)).join(' | ').slice(0, 200)}`,
    esp ? e.cod === 1 && esp.test(e.sal) && /^# comando: node tests\/ronda21\/fixture-registro\.mjs/m.test(e.log) : e.cod === 0 && /todo correcto/.test(e.sal)); }
rmSync(RAIZ + '/' + TMP, { recursive: true, force: true });
await fin();

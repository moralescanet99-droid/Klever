// Ronda 20 · CÓDIGO DE SALIDA y CIERRE de las pruebas, verificado en SUBPROCESOS reales (nada de simular): éxito real → 0; aserción fallida → ≠ 0; error previo → ≠ 0; recurso que obliga a forzar el cierre →
// ≠ 0 con registro «CIERRE FORZADO»; navegador sin cerrar → ≠ 0 con «CIERRE ANÓMALO». Y `tests/run-all.sh` rechaza cada caso por su cuenta (usando la misma fixture como «batería»). Uso: node tests/ronda20/unit-cierre20.mjs
import { spawnSync } from 'node:child_process';
import { rmSync, readFileSync, existsSync } from 'node:fs';
import { registro, RAIZ } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-CIE20.json');
const FIX = 'tests/ronda20/fixture-cierre.cjs', TMP = 'ronda20/cierre-tmp';
const corre = (modo) => { const r = spawnSync('node', [FIX], { cwd: RAIZ, env: { ...process.env, MODO_CIERRE: modo, RONDA: TMP }, encoding: 'utf8', timeout: 60000 }); return { cod: r.status, sal: (r.stdout || '') + (r.stderr || '') }; };
const ejecutor = (modo) => { rmSync(RAIZ + '/' + TMP, { recursive: true, force: true }); const r = spawnSync('bash', ['tests/run-all.sh'], { cwd: RAIZ, env: { ...process.env, MODO_CIERRE: modo, RONDA: TMP, UNIDAD: FIX, BATERIAS: ' ', PRUEBAS_SH: ' ', SEGURIDAD: ' ', OMITIR_DEMO: '1', LIMITE_BATERIA: '60' }, encoding: 'utf8', timeout: 120000 });
  const log = existsSync(`${RAIZ}/${TMP}/logs/fixture-cierre.log`) ? readFileSync(`${RAIZ}/${TMP}/logs/fixture-cierre.log`, 'utf8') : ''; return { cod: r.status, sal: (r.stdout || '') + (r.stderr || ''), log }; };

let r = corre('exito');
t('X1', 'Éxito real', 'Código 0 y «RESULTADO: 1 correctas, 0 fallos»', `código ${r.cod}`, r.cod === 0 && /RESULTADO: 1 correctas, 0 fallos/.test(r.sal) && !/CIERRE/.test(r.sal));
r = corre('fallo');
t('X2', 'Aserción fallida', 'Código distinto de cero aunque el proceso termine solo (el defecto de la ronda 19: informaba el fallo y salía con 0)', `código ${r.cod}`, r.cod !== 0 && r.cod !== null && /RESULTADO: 0 correctas, 1 fallos/.test(r.sal) && !/CIERRE/.test(r.sal));
r = corre('error-previo');
t('X3', 'Error previo (un código distinto de cero ya fijado) con todas las aserciones correctas', 'Se conserva: código ≠ 0', `código ${r.cod}`, r.cod === 2 && /RESULTADO: 1 correctas, 0 fallos/.test(r.sal));
r = corre('recurso');
t('X4', 'Recurso que mantiene vivo el proceso (el que ocultaba la salida forzada de la ronda 19 con código 0)', 'Tras 10 s se fuerza el cierre, se registra «CIERRE FORZADO» y el código NO es 0', `código ${r.cod}; ${r.sal.split('\n').filter(l => /CIERRE/.test(l)).join(' ')}`, r.cod === 3 && /CIERRE FORZADO: el proceso no terminó solo/.test(r.sal));
r = corre('navegador-abierto');
t('X5', 'Navegador que nadie cerró', 'Se cierra en `finally`, se registra «CIERRE ANÓMALO» y el código NO es 0 aunque las aserciones pasen', `código ${r.cod}; ${r.sal.split('\n').filter(l => /CIERRE/.test(l)).join(' ')}`, r.cod === 3 && /CIERRE ANÓMALO: 1 navegador/.test(r.sal) && !/CIERRE FORZADO/.test(r.sal));

for (const [id, modo, esperado] of [['X6', 'exito', null], ['X7', 'fallo', /tiene 1 fallos|salió con código/], ['X8', 'error-previo', /salió con código 2/], ['X9', 'recurso', /CIERRE ANÓMALO o forzado/], ['X10', 'navegador-abierto', /CIERRE ANÓMALO o forzado/]]) {
  const e = ejecutor(modo);
  t(id, `run-all.sh con la fixture en modo «${modo}»`, esperado ? 'El ejecutor sale con código 1 y nombra el problema' : 'Sale con código 0 y «todo correcto»', `código ${e.cod}; ${e.sal.split('\n').filter(l => /FALLA|RESUMEN/.test(l)).join(' | ').slice(0, 220)}`,
    esperado ? e.cod === 1 && esperado.test(e.sal) && /^# comando: node tests\/ronda20\/fixture-cierre\.cjs/m.test(e.log) : e.cod === 0 && /todo correcto/.test(e.sal) && /# código de salida: 0/.test(e.log));
}
rmSync(RAIZ + '/' + TMP, { recursive: true, force: true });
await fin();

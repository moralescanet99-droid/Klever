// Ronda 21 · FIXTURE (no es una batería): reproduce cómo termina una prueba de MÓDULO que usa `registro()` de tests/lib/d1-sqlite.mjs. Lo gobierna MODO_REGISTRO. Lo usan unit-registro21.mjs y, a través de run-all.sh, la comprobación del ejecutor.
import { registro } from '../lib/d1-sqlite.mjs';
const modo = process.env.MODO_REGISTRO || 'exito';
if (modo === 'error-previo' || modo === 'error-previo-y-fallo') process.exitCode = 2;      // un error anterior ya fijó un código distinto de cero
const { t, fin } = registro('evidencias-FIXREG21.json');
t('x', 'aserción', 'según el modo', '', modo !== 'fallo' && modo !== 'error-previo-y-fallo');
if (modo === 'recurso') setInterval(() => {}, 1000);                                          // un recurso que mantiene vivo el proceso
await fin();

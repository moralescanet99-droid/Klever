// Ronda 20 · FIXTURE (no es una batería): reproduce cómo termina una prueba que usa tests/ronda5/h.cjs. Lo gobierna MODO_CIERRE. Lo usan unit-cierre20.mjs y, a través de run-all.sh, la comprobación de que el ejecutor rechaza cada caso.
const { chromium, ok, fin } = require('../ronda5/h.cjs');
(async () => {
  const modo = process.env.MODO_CIERRE || 'exito';
  if (modo === 'error-previo') process.exitCode = 2;                          // un error anterior ya fijó un código distinto de cero
  ok('aserción', modo !== 'fallo');
  if (modo === 'recurso') setInterval(() => {}, 1000);                         // un recurso que mantiene vivo el proceso
  if (modo === 'navegador-abierto') await chromium.launch();                   // un navegador que nadie cerró
  await fin();
})();

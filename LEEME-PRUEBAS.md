# Klever · cómo repetir las pruebas desde cero

Todo lo necesario está en este repositorio: código, dependencias fijadas (`package.json` + `package-lock.json`), servidor (Cloudflare Pages Functions + D1 simulada en local), migraciones, scripts, datos ficticios y pruebas. **No hay secretos** (no se necesita cuenta de Cloudflare, Brevo ni GitHub para probar).

## Requisitos
- **Node.js 22.13 o superior** (`.nvmrc` = 22; probado con 22.23) y npm. Las pruebas del servidor usan `node:sqlite`, que sin indicador experimental existe desde 22.13; `tests/run-all.sh` se niega a ejecutarse con una versión menor.
- Python 3 (servidor de la demo y regeneración de datos de prueba).
- Herramientas del sistema: `bash` (vale el 3.2 de macOS), `curl`, `git`, `pgrep`, `mktemp`. **No se usan `timeout` ni `setsid`** (no vienen en macOS): los límites de tiempo y la parada de procesos son propios de los scripts.
- Linux o macOS (en Windows, mediante WSL).

## Instalación limpia (comandos exactos)
```bash
git clone https://github.com/moralescanet99-droid/Klever.git
cd Klever
git checkout <COMMIT>   # el commit EXACTO del código probado figura en la primeras líneas de ronda12/resultado-ejecucion.txt y en ronda11/LEEME.md (los commits posteriores solo añaden resultados e informes)
npm ci                                   # instala wrangler 3.114.17 y playwright 1.63.0 EXACTOS (package-lock.json)
npx playwright install chromium          # navegador para las pruebas (una sola vez)
```

## Datos ficticios de prueba
- `data/seed-prueba.sql`: 125 activos y 105 empresas con cifras **inventadas** (semilla fija). Se regenera con `python3 tests/ronda5/seed.py` y sale idéntico.
- `data/demo.sql`: 3 carteras públicas de ejemplo.
- `schema.sql`: esquema completo (incluye la revisión de la ronda 7). `migrations/0002`–`0007`: para bases creadas con versiones anteriores (**no** se aplica la 0007 sobre `schema.sql` nuevo: ya tiene las columnas y falla con «duplicate column»; está comprobado en `unit-migracion.mjs`).

## Arrancar la versión completa a mano
```bash
bash scripts/local/arrancar.sh          # http://localhost:8788  (RESET=1 para empezar de cero; PORT=9000 para otro puerto)
```
El enlace de acceso **no se envía por email**: aparece en pantalla («Modo desarrollo: entrar»). Guion de uso para personas: `PRUEBAS-DE-USO.md`.

## Ejecutar TODAS las pruebas automáticas
```bash
bash tests/run-all.sh                   # ~15 min; arranca un servidor limpio entre baterías y lo para al final.
                                        # CÓDIGO DE SALIDA 0 solo si TODO pasa; ≠ 0 si falla el arranque, hay timeout, falta el resultado o hay fallos
bash tests/ronda8/test-ejecutor.sh      # prueba del propio ejecutor (fallos, timeouts y puertos ocupados deliberados), ~4 min
```
Escribe el resultado literal y la versión del código en `ronda12/resultado-ejecucion.txt` y los datos observados en `ronda12/evidencias-*.json`. Variables: `RONDA` (ronda12), `LIMITE_BATERIA` (900 s), `PORT` (8788).

| Prueba | Qué comprueba | Contra qué |
|---|---|---|
| `tests/ronda7/unit-servidor.mjs`, `tests/ronda8/unit-carreras.mjs`, `tests/ronda8/unit-migracion.mjs` (`npm run test:servidor`, ~2 s, sin navegador) | Atomicidad, revisión en cada escritura, sin guardados parciales, carreras de lectura y de respuesta simuladas de forma determinista, errores internos frente a validación, migración 0007 sobre una base antigua con datos | Los manejadores reales de `functions/api/portfolios/*` sobre SQLite real (adaptador de D1 en `tests/lib/d1-sqlite.mjs`) |
| `tests/ronda5/testA`–`testE` | Interfaz completa, móvil, empresas, acceso, escenarios con evidencia | Servidor real local (D1 simulada) + Chromium |
| `tests/ronda7/testF` | Guardado fiable, conflicto, E16a corregida, diálogo móvil, desconexión real | Servidor real local + Chromium |
| `tests/ronda8/testG` | Respuesta tardía de un guardado/publicación mientras se abre otra cartera | Servidor real local + Chromium |
| `tests/ronda8/test-ejecutor.sh` (18 casos) | Que `run-all.sh` falle (código ≠ 0) ante fallos, caídas, timeouts, servidor que no arranca y, para la demo, «DEMO OK» con código 1, puerto ocupado (sin usar un servidor ajeno), etc., y limpie procesos | Fixtures en `tests/ronda8/fixtures/` |
| `tests/ronda10/testH.cjs` (16) | Pulido visual: avisos en zona reservada (sin solapes, legibles, errores persistentes), resumen de ROIC plegable, estado en móvil y acciones alcanzables en 320/390/1440 (texto ampliado y teclado **simulados**) | Servidor real local + Chromium |
| `tests/ronda10/unit-acceso.mjs`, `tests/ronda10/seguridad-http.mjs` | Acceso: envío solo por correo (simulado), un solo uso, caducidad, límites, hash de tokens, sin enlace en pantalla ni claves en lo público; HTTP contra un servidor arrancado **sin** `DEV_RETURN_LINK` | Manejadores reales sobre SQLite; servidor local con `SIN_ENLACE_DEV=1` |
| `tests/ronda11/testI.cjs` (16) | Identidad visual del editor: composición dibujada con los pesos reales, una sola acción principal, composición > ROIC, filas con barra de peso y táctiles, sin desbordamiento, contraste de todos los tokens en claro y oscuro | Servidor local + Chromium |
| `tests/ronda12/testJ.cjs` (53) | «Mis carteras» (composición real, pendiente local, vacío), Explorar (píldoras vs servidor, búsqueda conservada, sin resultados, error), ficha (datos principales, datos ausentes), detalles del editor y colores estables; 320/390/1440 y texto ampliado simulado | Servidor local + Chromium |
| `tests/ronda13/unit-calculos.mjs` (23), `tests/ronda13/unit-r13.mjs` (30) | Cálculos de radiografía y simulación (ejemplo A 60/B 40 + C 10 → 54/36/10, base incompleta, inviables, 2000 casos al azar) y servidor de radar/escenarios/límite/datos con **aislamiento entre dos usuarios**, reintentos sin duplicados, fallo de infraestructura y migración | Manejadores reales sobre SQLite real, sin navegador |
| `tests/ronda13/testK.cjs` (75) | **Recorrido completo** cartera → radiografía → explorar → radar (nota) → laboratorio → escenario → seguimiento, en 320/390/1440, teclado y texto ampliado simulado; visitante y migración al entrar; filtros; origen de los datos; aislamiento por HTTP | Servidor local + Chromium |
| `tests/ronda14/unit-carga.mjs` (11), `tests/ronda14/unit-r14.mjs` (14) | Procedencia por dato (carga vacía, parcial y correcta sobre datos previos; empresa fallida conserva su fecha; ausencia ≠ cero) y escenarios (una decimal, símbolos únicos, pregunta/fecha/historia, escenario antiguo, dos pestañas, reintentos y topes atómicos) | SQLite real, sin navegador |
| `tests/ronda14/testL.cjs` (28) | Privacidad al salir (incl. respuesta lenta y caducidad), radar con almacenamiento lleno/dañado y con lectura fallida, **primera visita sin cuenta** (historia → opinión → revisión → laboratorio con cartera de ejemplo, 54/36/10) y **regreso con cuenta** (pregunta, fecha, revisión editorial, pesos históricos), integridad de lo público, 320/390 | Servidor local + Chromium |
| `tests/ronda14/antes-despues-*.{cjs,mjs}` | Demostraciones antes/después de los fallos de la ronda 13 contra un árbol de trabajo del commit `b7ad3b9` (`ronda14/ANTES-Y-DESPUES.md`) | Asistidas, no entran en `run-all.sh` |
| `tests/ronda11/test-zip.sh` (8) | Verificación de entregas ZIP: manipulación detectada, `.dev.vars` y falta de manifiesto rechazados, y que ni un ZIP ni un repositorio nuevo declaren verificado el historial | Sin dependencias (git, zip, unzip, Node ≥ 22.13) |
| `tests/ronda10/validar-acceso-real.mjs` | **Asistida, no entra en `run-all.sh`**: correo realmente enviado, persistencia, dos sesiones, caducidad (`CADUCIDAD=1`) | Despliegue de PRUEBA con correo real (**bloqueado: faltan credenciales**, `ronda10/BLOQUEOS.md`); en local solo con `MODO_DEV=1` (no valida correo real) |
| `tests/ronda10/capturas.cjs`, `tests/ronda10/medir.cjs` | Capturas y mediciones comparables antes/después (`antes`/`despues`) | Servidor local + Chromium |
| `tests/ronda9/verificar-api.mjs` | La API por HTTP: guardado atómico, revisión, 20 pares concurrentes, lecturas sin mezcla, `GET` público sin versiones no públicas. **Repetible contra un despliegue remoto de PRUEBA** (`BASE_URL=…`) | Servidor local en `run-all.sh`; D1 remoto: `ronda10/GUION-VALIDACION-REMOTA.md` |
| `tests/ronda5/demotest.cjs` | La demo HTML (simulada, sin persistencia) | `demo/index.html` en memoria |

Las baterías antiguas `tests/ronda4/` y `shots*.cjs` son históricas (generan capturas de rondas anteriores y llevan rutas de aquel entorno).

## Qué NO se puede repetir con este proyecto
Email real (Brevo), carga real de la SEC, widgets de TradingView, móviles reales, Safari/Firefox, lector de pantalla, zoom real del navegador y teclado móvil real: ver `ronda11/pruebas-manuales.md`. **Ninguna de ellas se ha ejecutado.** Tampoco se ha probado **Cloudflare D1 remoto**: todo lo «transaccional» está probado con D1 local simulada (Miniflare) y con SQLite real.

## Demo HTML
`demo/index.html` es una **demostración sin persistencia de cuenta**: simula el servidor en la memoria de la página y al recargar se pierde todo. No es equivalente al servidor probado; sirve para enseñar la interfaz. Su casilla «Simular fallo de red al guardar» es una simulación explícita (el modo sin conexión del navegador no afecta a las peticiones simuladas en memoria). Para probar la desconexión de verdad, usa la versión completa local.

## Verificar una entrega ZIP (sin `.git`)
Un ZIP creado con `git archive` **no contiene `.git`**: por eso no se puede comprobar desde él el historial de commits. Qué se puede y qué no:

| Comprobación | Desde el ZIP | Requiere el repositorio |
|---|---|---|
| Integridad de cada archivo (huellas SHA-256) | ✅ `MANIFEST-SHA256.txt` | — |
| Qué commit es (`ENTREGA.json`) | se **lee**, pero no se puede contrastar | ✅ `git rev-parse HEAD` debe coincidir |
| Sin `.dev.vars`, `.env`, claves ni dependencias instaladas; marcador de `database_id` en `wrangler.toml` | ✅ | — |
| Sin secretos evidentes en el contenido | ✅ (patrones conocidos) | — |
| Pruebas del servidor, conflictos, migración y acceso (SQLite real, sin dependencias) | ✅ | — |
| Que **ningún commit anterior** contuvo secretos o un `database_id` real | ❌ | ✅ A8 en «modo repositorio» (historial de ≥ 2 commits) |
| Batería de navegador | ❌ (necesita `npm ci` + Playwright) | — |
| Cloudflare D1 remoto, correo real | ❌ bloqueados (`ronda10/BLOQUEOS.md`) | — |

```bash
bash scripts/entrega/verificar-zip.sh klever-ronda11-tecnico.zip     # requiere bash, unzip y Node >= 22.13; no requiere npm ci
```
Termina con código 0 solo si todo lo verificable pasa, y **siempre** imprime lo que no ha podido verificar. **Un repositorio nuevo creado a partir del ZIP (vacío, o con un único commit del propio contenido) no verifica el historial**: A8 lo trata como «modo ZIP» y escribe «historial: NO verificado». Para verificar el historial hay que clonar el repositorio original y ejecutar `node tests/ronda10/unit-acceso.mjs` (A8 dirá «VERIFICADO en el repositorio (N commits)»). Para crear una entrega: `bash scripts/entrega/crear-zip.sh salida.zip` (desde un commit limpio).

## Baterías de las rondas 15 y 16 (añadidas)
| Batería | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda15/unit-nota.mjs` (35) | Nota de estructura v1: efectivas, cobertura por indicador, ausente/cero/negativo, 60 sesiones, moneda y fuente, origen sintético, guardar y reabrir | Módulo (sin navegador) |
| `tests/ronda15/unit-comparador.mjs` (9) | Comparador de dos empresas | Módulo |
| `tests/ronda15/unit-almacen.mjs` (9) | Privacidad del almacén de radar con carreras deterministas | Módulo |
| `tests/ronda16/unit-escenarios16.mjs` (11) | Validación de evaluaciones guardadas (al guardar y al leer) y vínculo estable de la pregunta; cierre de sesión y otra cuenta | Servidor sobre SQLite real |
| `tests/ronda15/testM.cjs` (7) | Privacidad con cuentas A y B | Navegador |
| `tests/ronda15/testN.cjs` (41) | Interfaz y recorridos de la ronda 15 en 320/390/1440 | Navegador |
| `tests/ronda16/testO.cjs` (14) | Notas en el móvil, comparador, laboratorio, seguimiento con tres casos, nota manipulada | Navegador |
| `tests/ronda16/antes-despues-r16.mjs <raíz>` | Antes/después de los tres fallos contra un árbol de trabajo anterior | Módulo/servidor |

## Baterías de la ronda 17 (añadidas)
| Batería | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda17/unit-procedencia17.mjs` (13) | Desde SQLite hasta el texto de la nota: fuente NULL, fecha imposible, «ayer», mixto, real, KO+JPM, 4,4 exacto, conjuntos de tickers | Módulo/servidor (SQLite real) |
| `tests/ronda17/unit-guardada17.mjs` (20) | Nota guardada (versión, coherencia, límites, texto), catálogo de preguntas, concurrencia, aislamiento y token revocado | Servidor (SQLite real) |
| `tests/ronda17/testP.cjs` (28) | Creador con el diseño aprobado, entrada según el estado, navegación, acción principal, teclado, sin desplazamiento horizontal | Navegador |
| `tests/ronda17/antes-despues-r17.mjs <raíz>` | Antes/después de los casos reproducibles contra un árbol anterior | Módulo/servidor |
| `tests/ronda17/repetir-intermitentes.sh [N]` | Repite testE/testF con servidor limpio y deja el rastro por repetición | Navegador |

## Baterías de la ronda 18 (añadidas)
| Batería | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda18/unit-integridad18.mjs` (18) | Los contraejemplos exactos de la revisión: nota guardada (intervalo del redondeo), fechas con sufijo, comparables ajenos y caché, par historia/referencia, propiedad propia y ancho cero | Módulo/servidor (SQLite real) |
| `tests/ronda18/testQ.cjs` (25) | Creador por pasos medido en el viewport (primer campo, acción dominante, barra, revisión, volver, teclado, cuenta con y sin cambios, Cuaderno) y capturas | Navegador |
| `tests/ronda18/paridad-demo.cjs` (5) | La demo y los módulos dan las mismas salidas; reconstrucción reproducible | Navegador (demo) |
| `tests/ronda18/antes-despues-r18.mjs <raíz>` | Antes/después de los contraejemplos contra un árbol anterior | Módulo/servidor |
| `tests/ronda19/repetir-intermitentes.sh [N] [ms]` | Repite testE/testF/testC con servidor limpio, sin y con latencia determinista, con traza | Navegador |

## Baterías de la ronda 19 (añadidas)
| Archivo | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda19/unit-redondeo19.mjs` (6) | Frontera del redondeo (caso exacto, vecinos, oráculo por fuerza bruta, barrida del evaluador) | Módulo/servidor |
| `tests/ronda19/unit-revision19.mjs` (10) | Revisión sin nota: ETF, datos ausentes/inválidos, cobertura; lo que sí existe; sin cambiar pesos | Módulo |
| `tests/ronda19/testR.cjs` (9) | Rectángulo del resultado entre la zona útil y la barra a 320/390/1440, con y sin nota, ratón/teclado, movimiento reducido; capturas de viewport | Navegador |
| `tests/ronda19/antes-despues-r19.mjs <raíz>` | Antes/después del redondeo y del texto con ETF | Módulo/servidor |
| `tests/ronda19/repetir-intermitentes.sh [N] [ms]` | Repite testE/testF/testC con y sin latencia | Navegador |
`tests/run-all.sh` guarda ahora un registro íntegro por batería en `<ronda>/logs/` (`LOGS_DIR` para cambiarlo).

## Baterías de la ronda 20 (añadidas o cambiadas)
| Archivo | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda20/unit-causas20.mjs` (10) | Causas coexistentes con código, los tres casos de la revisión, caso conjunto, plantilla, solo ETF, con nota, espera real | Módulo/servidor |
| `tests/ronda20/unit-cierre20.mjs` (10) | Código de salida y cierre de las pruebas en subprocesos reales; `run-all.sh` rechaza cada caso | Subprocesos |
| `tests/ronda20/fixture-cierre.cjs` | Fixture (no es batería) gobernada por `MODO_CIERRE` | — |
| `tests/ronda19/testR.cjs` (16) | Ampliada: contexto de escritorio, cambios sin guardar, teclado real, estabilización exigida, diálogos acotados, regresión R4 | Navegador |
| `tests/ronda20/antes-despues-r20.mjs <raíz>` | Antes/después corto contra un árbol de la ronda 19 | Módulo/subprocesos |
`tests/run-all.sh` guarda además el log de `demotest` y rechaza `CIERRE FORZADO/ANÓMALO`.

## Baterías de la ronda 21 (añadidas o cambiadas)
| Archivo | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda21/unit-registro21.mjs` (10) | Código de salida de las pruebas de módulo (`registro()`), en subprocesos, y rechazo por `run-all.sh` | Subprocesos |
| `tests/ronda21/unit-cuaderno21.mjs` (20) | Invalidación, revisiones atómicas e idempotentes, conflicto, aislamiento, cartera cambiada/borrada, cascada, tope y la regresión del `ORDER BY` público (K20) | Módulo/servidor |
| `tests/ronda21/testS.cjs` (30) | Recorrido completo con cuenta y persistencia (1440 y 390 px): tres entradas, vistazo, comparación, Cuaderno, cerrar/volver, revisión, aislamiento, teclado | Navegador |
| `tests/ronda21/fixture-registro.mjs` | Fixture (no es batería) gobernada por `MODO_REGISTRO` | — |
| `tests/ronda8/unit-migracion.mjs` (15) | Ampliada con M1f (migración 0012 con datos previos) | Módulo |
`tests/lib/d1-sqlite.mjs` `registro()` ya no sale con `process.exit(0)`.

## Baterías de la ronda 22 (añadidas o cambiadas)
| Archivo | Qué comprueba | Entorno |
|---|---|---|
| `tests/ronda22/unit-cliente-revision22.mjs` (8) | El cliente del registro de revisiones (`revisiones.js`) contra el servidor real con cortes inyectados; réplica de la lógica de la R21 (C8) | Módulo/servidor |
| `tests/ronda22/testT.cjs` (24) | Cuaderno y recuperación en el navegador a 1440/390/320: «Para revisar» primero, respuesta perdida, relectura fallida, texto modificado, dos pestañas, archivar/descartar, seguimiento personal vs editorial, Mis portafolios con cuenta | Navegador |
| `tests/ronda22/testDemo22.cjs` (12) | Registrar una revisión en la demo y que no persista tras recargar | Navegador (demo) |
Adaptadas por el diseño nuevo: `testO`, `testQ`, `testN`, `testP`, `testL`, `testB` (ver `ronda22/LEEME.md` §7).

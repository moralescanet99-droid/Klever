# Ronda 9 · cierre técnico (para pegar en ChatGPT)

Sube el zip `klever-ronda9-tecnico.zip` a **la misma conversación** (proyecto completo en el commit indicado más este texto en la raíz) y pega el texto de abajo. Si no puede abrir zips, sube por separado: `functions/api/public/[id].js`, `functions/api/portfolios/[id].js`, `functions/api/portfolios/index.js`, `tests/lib/d1-sqlite.mjs`, `tests/ronda8/unit-carreras.mjs`, `tests/run-all.sh`, `tests/ronda8/test-ejecutor.sh`, `tests/ronda9/verificar-api.mjs`, `ronda9/GUION-BETA-Y-D1-REMOTO.md`, `ronda9/LEEME.md`, `ronda9/resultado-ejecucion.txt`, `ronda9/antes-pruebas.txt` y `ronda9/antes-ejecutor-demo.txt`.

---

Actúa como revisor técnico senior (backend, concurrencia, SQLite/Cloudflare D1, shell portable y pruebas). Ya revisaste la ronda 7 y encontraste dos carreras, un ejecutor que daba éxito falso y requisitos incorrectos; la ronda 8 los corrigió. En esta **ronda 9, breve**, se cierran tres puntos pendientes. Quiero que intentes **romper** lo que afirmo, como la vez anterior.

## Qué se afirma (verifícalo en el código)
1. **`GET /api/public/:id` en una sola instantánea.** Antes comprobaba `publico = 1` y leía las posiciones en consultas independientes: con una despublicación y un cambio de posiciones entre las dos lecturas devolvía la cartera pública **con posiciones privadas**. Ahora usa un único `DB.batch([...])` y la consulta de posiciones lleva además `EXISTS (SELECT 1 FROM portafolios WHERE id = ? AND publico = 1)`. La respuesta debe ser la versión pública anterior completa o 404; nunca una mezcla ni datos de una versión que no fue pública. Prueba determinista **R6a** (`tests/ronda8/unit-carreras.mjs`): falla con el código anterior y pasa con el nuevo (`ronda9/antes-pruebas.txt`).
2. **La demo en `tests/run-all.sh` se comprueba como una batería:** exige código de salida 0, «DEMO OK», ausencia de «HAY FALLOS» y de timeout, que exista `demo/index.html`, que el puerto esté libre antes de arrancar (si está ocupado no ejecuta nada y no mata al ajeno) y que su servidor arranque. Antes salía con 0 con «DEMO OK» + código 1 y ejecutaba contra un servidor ajeno (`ronda9/antes-ejecutor-demo.txt`). Casos D1–D8 en `tests/ronda8/test-ejecutor.sh` (18 en total).
3. **Descripciones G2 y U4:** ahora dicen que el ticker desconocido se rechaza **antes** del lote (validación previa); la evidencia de rollback ante un error interno es **R4a**.
4. **Resultado:** clon nuevo del commit `a4f871b531bf0abd7ef7ef97b14b70ae05e141df`, `npm ci`, `bash tests/run-all.sh`: 221 comprobaciones correctas, código de salida 0 (`ronda9/resultado-ejecucion.txt`); `test-ejecutor.sh` 18/18 (`ronda9/resultado-ejecutor.txt`). Los commits posteriores solo añaden resultados, informes y este paquete.

## Qué quiero que revises, por orden
1. **R6a y el arreglo del `GET` público.** ¿Es R6a una simulación fiel o tiene trampas (el adaptador aplaza las escrituras intercaladas hasta después del commit del lote)? ¿Hay otra forma de que el endpoint devuelva datos de una versión no pública? ¿Y `GET /api/public` (la lista, una sola consulta con `COUNT`)? ¿La condición `EXISTS` es redundante o necesaria dentro de un lote transaccional en D1 real?
2. **El bloque de la demo de `run-all.sh`.** Condiciones de carrera (comprobar el puerto y luego arrancar), el bucle de espera con `kill -0`/`curl`, `matar_arbol` con `pgrep -P`, compatibilidad con bash 3.2 de macOS, qué ocurre si el servidor de la demo muere a mitad, y si algún camino deja un proceso vivo o un código de salida engañoso. ¿Los casos D1–D8 prueban lo que dicen o algún no puede fallar?
3. **Honestidad de G2/U4/R4a:** ¿queda alguna descripción que presente la validación previa como fallo a mitad de transacción? ¿R4a demuestra de verdad rollback (el fallo se inyecta en la sentencia 2 del lote, con nombre y tesis ya cambiados)?
4. **`tests/ronda9/verificar-api.mjs`** (se ejecutará contra D1 remoto): ¿V5–V7 pueden pasar de forma vacía (por ejemplo V7 sin llegar a leer ninguna cartera pública)? ¿Detectarían el defecto original si existiera? ¿Algún riesgo de dejar datos o de usarse contra producción?
5. **`ronda9/GUION-BETA-Y-D1-REMOTO.md`:** ¿los comandos son correctos para `wrangler@3.114.17` (crear D1 y proyecto de Pages, secreto `DEV_RETURN_LINK`, binding `DB`, migración sobre base antigua)? ¿Falta algún paso o hay riesgos (datos de producción, `wrangler.toml` con el `database_id`)? Está marcado **sin ejecutar**.
6. **Informe `ronda9/LEEME.md`:** ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado lo ejecutado de lo pendiente?
7. Todo lo que **no puedas comprobar leyendo el código** y cómo lo comprobaría yo.

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- **Nada se ha ejecutado contra Cloudflare D1 remoto**: solo D1 local simulada (Miniflare, `wrangler@3.114.17`) y SQLite real (`node:sqlite`).
- Las carreras se modelan de forma determinista con un adaptador que aplaza las escrituras intercaladas hasta después del commit (comportamiento documentado de `batch()`); no hay dos procesos reales. V5–V7 son estrés empírico.
- **Ninguna prueba manual real** (móviles reales, Safari, Firefox, lector de pantalla, zoom real, teclado real, dos dispositivos reales) ni el guion de beta y D1 remoto se han ejecutado.
- Los datos son inventados; el email, la SEC y TradingView no se usan en las pruebas.

## Formato de respuesta
- **Veredicto de 3 líneas:** ¿está cerrado el cierre técnico? ¿qué queda abierto?
- **Defectos ordenados por gravedad** (crítico / importante / menor): archivo y línea, escenario concreto que lo dispara, por qué ocurre y arreglo (código o prueba).
- **Pruebas que añadirías** (las 3–5 más valiosas) y **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar leyendo el código**.

*Fuera de alcance:* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión (futuro plan de pago), y cualquier rediseño visual.

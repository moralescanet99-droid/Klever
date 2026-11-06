# Ronda 14 · confianza primero y una historia que se puede leer, probar y retomar (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda14-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-14/`) y las **12 imágenes** de `imagenes-ronda14-chatgpt.zip` a **la misma conversación** (si admite pocas por mensaje, en dos tandas: 01–06 y 07–12). Son capturas del **primer uso** (sin cuenta) y del **regreso** (con cuenta) en móvil (390 px y 320 px); los nombres llevan número, pantalla y ancho. Para el estado anterior tienes `ronda13/capturas/`.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–13 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 13 (88 comprobaciones repetidas, 16 capturas) se convirtió en el encargo de la ronda 14: **primero cuatro fallos de confianza, después una historia que se pueda leer, probar y retomar**. Esta vez te pido **repetir los casos críticos con tus propios medios** y **juzgar si el recorrido se entiende en móvil**. El resultado esperado es una versión interna que Javier abra desde el móvil (la **demo**; la versión completa solo se ha ejecutado en local).

## Qué se afirma
1. **Privacidad al salir** (`public/app.js` `limpiarPrivado`, `public/js/lab.js` `limpiarSesionLab`, contador de sesión `LAB.gen`): al salir o caducar la sesión se vacían memoria y pantalla y se descartan las respuestas en vuelo. Antes/después: `ronda14/ANTES-Y-DESPUES.md` §1. Prueba: `tests/ronda14/testL.cjs` L1–L3.
2. **Procedencia de datos** (migración `0009`, `scripts/lib/carga.mjs`, `scripts/fetch_fundamentals.mjs`, `functions/api/datos.js`): fuente y fecha **por fila**, lotes en `cargas`, empresa fallida o vacía intacta, carga vacía sin declarar fuente, `/api/datos` derivado de las filas, **ausencia ≠ cero** en las métricas derivadas (sin supuestos silenciosos). Prueba: `tests/ronda14/unit-carga.mjs` (11). Documento: `ronda14/PROCEDENCIA.md`.
3. **Radar con errores reales** (`public/js/almacen.js`, `store.setItemEstricto`): escritura y lectura estrictas; lectura fallida ≠ «radar vacío»; texto conservado y «Reintentar guardado». Prueba: `testL` L4–L6b; demostración `tests/ronda14/antes-despues-radar.mjs`.
4. **Integridad de escenarios** (`functions/api/escenarios/*`, `public/js/calculos.js`): una decimal como mucho, propuesta con símbolos únicos y comparada sin normalizar antes, fecha de revisión real, topes atómicos en la sentencia, reintentos concurrentes, revisión para dos pestañas. Prueba: `tests/ronda14/unit-r14.mjs` (14).
5. **Historia legible sin cuenta** (`public/js/contenido.js`, `public/js/revista.js`; imágenes 02–03): caso **ficticio desde el título**, autora ficticia, fecha, 6 fuentes de ejemplo identificadas como tales, tabla de proyectos, empresa vinculada («Hidrógeno Norte (empresa ficticia)», en `data/ficticios.json`, no en el universo real).
6. **El Superespeculador** (imágenes 04–05): opinión firmada con hecho observado / interpretación / qué haría cambiar de opinión / pregunta; **revisión fechada con «desenlace simulado»** vinculada a la tesis; la tesis original sigue accesible y avisa de su revisión.
7. **Laboratorio desde la historia** (imágenes 06–07): «Probar en mi cartera» conserva la empresa; **sin cartera ofrece una de ejemplo** (KO 60 % · PG 40 %, «no es tuya»); radar opcional; **primero** de dónde sale el peso, **después** tabla y pasos; redondeo en desplegable. Con 10 % y reducción proporcional: **KO 54 · PG 36 · empresa 10**.
8. **Seguimiento** (imágenes 08–12): pregunta (precargada, editable) y fecha de revisión opcionales; al volver, pregunta, fecha, base original, comparación y enlaces a historia/opinión/revisión editorial; escenarios antiguos siguen abriendo; «Marcar como descartado» (conserva) frente a «Eliminar definitivamente» (borra); «Editar nota» en vez de formularios abiertos; un cambio posterior de la cartera conserva los pesos históricos.
9. **Resultado:** `bash tests/run-all.sh` completo (servidor limpio entre baterías) sobre el commit `4a04367e616b60e06c236327b5bea1bd731e3f1b`: **522 comprobaciones correctas, 0 fallos, código de salida 0** (nuevas: 11 de carga, 14 de escenarios, 28 de navegador `testL`; migración con 0009). **No** se repitió en un clon nuevo ni `test-ejecutor.sh`.
10. **Incidencias declaradas:** una pasada previa falló porque `testF` «terminó sin resultado» mientras yo ejecutaba otras pruebas en paralelo (en solitario pasa 9/9); es la **segunda vez** (en la ronda 13, `testE`) que una prueba antigua del navegador falla de forma intermitente y **sigue sin diagnosticar**. Otra pasada falló por una mayúscula en una expresión regular de mi prueba. Resultados conservados en `ronda14/resultado-ejecucion-intento*.txt`.
11. **Pruebas antiguas adaptadas** (cambios intencionados, dime si alguna rebaja la exigencia): `testB` (menú móvil con 5 enlaces; 106 empresas al incluir la ficticia), `testJ`/`testK` (106; la nota se edita con «Editar nota»; «Eliminar definitivamente»), `demotest` y `unit-migracion` (M1c, M7).
12. **Bloqueado:** D1 remoto, migraciones 0008–0009 en D1 real, correo real, **carga real de la SEC** (la lógica nueva solo se probó con datos simulados): `ronda10/BLOQUEOS.md`. No se piden secretos por el chat.

## Imágenes (12)
- 01-S0-portada-con-historia-390.png
- 02-S1-historia-390.png
- 03-S1-historia-320.png
- 04-S2-opinion-original-390.png
- 05-S3-revision-simulada-390.png
- 06-S4-laboratorio-primera-visita-390.png
- 07-S4-laboratorio-primera-visita-320.png
- 08-S5-escenario-guardado-390.png
- 09-S6-regreso-seguimiento-390.png
- 10-S7-regreso-escenario-390.png
- 11-S7-regreso-escenario-320.png
- 12-S6-regreso-seguimiento-320.png

## Casos críticos que te pido repetir (tú, no yo)
Desde un clon del zip: `npm ci`, y sin navegador (solo Node ≥ 22.13): `node tests/ronda14/unit-carga.mjs`, `node tests/ronda14/unit-r14.mjs`, `node tests/ronda13/unit-calculos.mjs`, `node tests/ronda13/unit-r13.mjs`, `node tests/ronda8/unit-migracion.mjs`. Con navegador: `bash scripts/local/servidor.sh start` y `node tests/ronda14/testL.cjs` (y `testK.cjs`). Para el «antes» de la ronda 13 (commit `b7ad3b9`): `git worktree add --detach <ruta> b7ad3b9`, enlaza `node_modules`, y ejecuta `tests/ronda14/antes-despues-radar.mjs <ruta>/public/js/almacen.js`, `unit-r14.mjs` copiado a ese árbol y `antes-despues-privacidad.cjs` con `BASE_URL`. **Dime cuáles reproduces y cuáles no.**

## Qué quiero que evalúes
### Producto y móvil (con las imágenes)
1. **¿Se entiende el recorrido en móvil?** Primera visita: portada (01) → historia (02–03) → opinión (04) → revisión (05) → laboratorio con la cartera de ejemplo (06–07). Regreso: escenario guardado (08) → seguimiento (09, 12) → detalle (10–11). ¿Dónde se pierde una persona que no conoce Klever? ¿Qué sobra?
2. **Honestidad del caso ficticio:** ¿queda inequívoco que es ejemplo (título, aviso, fuentes, empresa, desenlace simulado)? ¿Algún texto puede confundirse con información real o con una recomendación?
3. **Laboratorio:** ¿«de dónde sale el peso» antes de la tabla funciona? ¿La cartera de ejemplo se entiende como no tuya? ¿El texto «la simulación es temporal» basta?
4. **Seguimiento:** ¿la pregunta y la fecha dan una razón para volver? ¿Cómo se lee «Marcar como descartado» frente a «Eliminar definitivamente»? ¿«Editar nota» reduce el ruido?
5. **320 px y texto ampliado** (simulado): ¿algo se corta o es incómodo?
6. **Regresiones** respecto a la ronda 13.
### Técnico
7. **Privacidad:** ¿queda algún camino por el que datos de A lleguen a B o al visitante (caché de módulo, `sessionStorage`, `localStorage`, DOM, respuestas en vuelo, `fichaActivo`)? ¿Es aceptable que `klever_edit_*` permanezca tras salir?
8. **Procedencia:** `scripts/lib/carga.mjs` y `functions/api/datos.js`: ¿alguna ruta por la que una fila pueda quedar con fuente `sec` sin carga real? ¿Los casos vacío / parcial / correcto cubren lo importante? ¿La regla «ausencia ≠ cero» tiene huecos (p. ej. `ratio` con denominador 0)? ¿Cuántas métricas quedarían «sin datos» con datos reales, a tu juicio?
9. **Radar y almacenamiento:** `almacen.js` (escritura/lectura estrictas, generación de sesión); ¿carreras entre `cargar` y `guardar`? ¿Qué pasa con almacenamiento bloqueado desde el principio?
10. **Escenarios:** validaciones, topes atómicos con `INSERT … SELECT … WHERE (subconsulta) < tope`, `ON CONFLICT` del radar, claves de reintento, PATCH con revisión. ¿Algún IDOR o carrera? ¿La migración 0009 es segura sobre una D1 con datos?
11. **Pruebas:** ¿alguna comprobación de `testL`, `unit-carga` o `unit-r14` puede pasar en vacío o medir lo equivocado (HTML completo para la privacidad, respuesta lenta simulada con `route`, almacenamiento roto con `addInitScript`, `innerText` frente a `<details>` cerrado)? ¿Falta algo? ¿Cómo explicas los dos fallos intermitentes (`testE`, `testF`)?
12. **Estructura:** `public/js/{calculos,almacen,contenido,revista,lab}.js`, la demo que los concatena sin `import/export`; ¿deuda aceptable? ¿Qué limpiarías antes de pasar el contenido editorial a base de datos?
13. **Accesibilidad:** secciones de la opinión, tablas con `th scope`, `aria-live`, foco tras guardar/editar, `<details>`, `confirm` nativo al eliminar.
14. **Honestidad del informe (`ronda14/LEEME.md`, `PROCEDENCIA.md`, `ANTES-Y-DESPUES.md`, `ABRIR-EN-MOVIL.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Se separan bien módulo, navegador y entorno remoto? ¿Las demostraciones antes/después prueban lo que dicen?
15. Todo lo que debería probar yo a mano (`ronda14/pruebas-manuales.md`, M50–M58, más M1–M49).

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo en **Chromium** con servidor local (D1 simulada con Miniflare) y SQLite real; **nada en Cloudflare D1 remoto**, **ningún correo real**, **ningún Safari, Firefox, móvil físico ni lector de pantalla**; texto ampliado **simulado**; sin revisar el tema oscuro.
- **Todos los datos son inventados**, incluida la empresa y la pieza editorial (caso de ejemplo); la demo no persiste y simula el correo.
- Fuera de alcance de esta ronda: piloto de tres piezas, revista con categorías, publicaciones semanales, avisos, comparación de escenarios, análisis interno de ETF, Revolut/Trade Republic, artículo y tip diarios, suscripciones, apertura pública.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en confianza/privacidad, procedencia de datos, claridad del recorrido en móvil, honestidad del contenido, solidez técnica y calidad de las pruebas, **comparadas con tu valoración anterior**.
- **Qué casos has repetido y con qué resultado**, y cuáles no has podido repetir.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían el recorrido en móvil**, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar**.

*Fuera de alcance (no lo critiques ni lo propongas):* Revolut y Trade Republic, artículo diario personalizado, tip diario, suscripciones y monetización (futuro plan de pago).

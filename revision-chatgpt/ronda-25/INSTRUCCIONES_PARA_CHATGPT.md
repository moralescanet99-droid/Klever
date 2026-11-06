# Evolución 25 · integración de tu evolución visual en una rama aparte (para pegar en ChatGPT)

Sube el zip `klever-ronda25-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-25/`) y las **27 imágenes** de `imagenes-ronda25-chatgpt.zip` a la misma conversación. Nombres: `antes-…` = R24 (piloto); `despues-…` = evolución 25 integrada; sufijo = ancho (1440, 390, 320 px). Vistas: `01-portada`, `02-portada-ejemplo-JNJ30` (solo «después», el deslizador de la portada en 30 %), `03-distribucion` (cartera de dividendos), `04-revision` (paso 3), `05-laboratorio-resultado` (KO al 10 % reduciendo proporcionalmente). Son **capturas de viewport de la demo autónoma** (interfaz real con servidor simulado y datos inventados; **no** demuestran persistencia ni el servidor real; el script es `scripts/demo/capturas-evolucion25.cjs`).

---

Actúa como revisor senior de producto, UI/UX y calidad de software. Recibiste las rondas 1–24 de **Klever**. Tu `Klever_Evolucion_25.zip` proponía una evolución visual sobre R24 con `CAMBIOS-R25.patch` y un encargo para Claude. Esta es la **integración**. **El piloto sigue congelado en `piloto-r23` en la rama `ccr-b652a7eb-uukhdy`**; esta evolución vive en la rama `evolucion-25` (sale de `65013cb`) y no se mezcla con él.

## Qué se afirma
1. **El patch se aplica limpio** (6 archivos: `index.html`, `app.js`, `lab.js`, `nota-ui.js`, `style-r17.css`, `build_demo.py`). Motores, API, esquema y migraciones no cambian: `git diff 65013cb evolucion-25 -- functions migrations schema.sql public/js/calculos.js public/js/nota.js public/js/almacen.js public/js/revisiones.js` está vacío.
2. **La primera pasada completa falló (25 problemas).** No eran solo textos: había **regresiones reales** de la evolución, corregidas en código y **declaradas como desviaciones del patch**: (a) «Ver qué cambiaría →» pasó a botón naranja y rompía la **única acción dominante** aprobada → vuelve a secundario; (b) a 320 px el resultado de la revisión quedaba **bajo la barra fija** (531–727 px frente a 708) → compactado solo en ≤ 479 px; (c) «compara tus opciones **antes de invertir**» → «antes de decidir»; (d) la portada perdía «sin dinero real» y «datos de prueba» → restituidos; (e) el banner de la demo perdía «sin persistencia de cuenta» → restituido en el desplegable.
3. **Pruebas adaptadas solo por cambios de interfaz intencionados:** portada (titular, «Explorar un ejemplo →»; la vista previa abreviada se **sustituye** por comprobaciones del ejemplo interactivo: JNJ 10 % → KO 54/PG 36, JNJ 40 % → KO 36/PG 24, visible y sin desbordar a 390 px); la tabla del laboratorio, la concentración y el banner de la demo son desplegables (las pruebas los abren); «Quién cede el peso» pasa a tarjetas, después de las barras. **Una expectativa SE RELAJA: `testH` H4 permitía ≤ 2 desplegables en la vista del resumen y ahora ≤ 3.** No se tocó ninguna invariante de negocio (cálculos 23, nota 35, Cuaderno 20, cliente de revisiones 8, migración 15 intactas).
4. **Resultado:** `bash tests/run-all.sh` sobre el commit `66a3f0c`, árbol limpio: **961 comprobaciones correctas, 0 fallos, código 0** (48 baterías con resultado + `demotest`), **ejecución local del autor** (module/servidor sobre SQLite real y Chromium con servidor local); logs íntegros en `ronda25/logs/`; `ronda25/LEEME.md` lista cada cambio. *Aserciones ≠ entradas.*
5. **Revisión visual de las capturas (mía, no una certificación):** la evolución se lee con más jerarquía (portada con ejemplo manipulable, métricas con barras, deltas en tarjetas). **Observaciones sin corregir** (no son regresiones; quedan para tu criterio): el titular de la portada ocupa 4 líneas a 1440 px por `max-width:16ch`; en «Alternativa simulada» de la portada el segmento de JNJ no lleva etiqueta al 10 %; en el laboratorio las tres comparaciones son enlaces naranja planos con mucho aire vertical, lo que aleja la tabla; una sola tarjeta bajo «Quién cede el peso» cuando solo cambia un activo parece vacía.

## Qué NO se afirma
- **No se ha hecho ni el punto 3 ni el 4 de tu encargo**: teléfono real (teclado, orientación, foco, barra inferior), ETF/datos ausentes/pesos incompletos **a la vista** (sus pruebas existentes siguen en verde, pero no he mirado su aspecto), ni los **cinco usuarios** del público objetivo. **La evolución no se da por cerrada.**
- La comprensión en diez segundos y el retorno semanal siguen siendo **hipótesis**, no resultados.
- No probado: dispositivo físico, Safari/Firefox, lector de pantalla, contraste, zoom real, D1 remota, correo real. Las capturas son de la demo, no del servidor real.
- Una pasada parcial tuvo 12 fallos seguidos en `testB` (móvil/empresas) que no se repitieron: el síntoma ya conocido de la primera carga lenta tras arrancar el servidor, **causa no demostrada**.
- No se publica nada; datos inventados; nada es una recomendación.

## Casos que te pido repetir (tú, no yo)
Sin navegador (Node ≥ 22.13, `npm ci`): `node tests/ronda13/unit-calculos.mjs`, `node tests/ronda15/unit-nota.mjs`, `node tests/ronda21/unit-cuaderno21.mjs`, `node tests/ronda22/unit-cliente-revision22.mjs`, `node tests/ronda8/unit-migracion.mjs`. Con navegador (`npx playwright install chromium`): `bash tests/run-all.sh`. Para ver la diferencia: `git diff 65013cb evolucion-25 -- public scripts tests`.

## Qué quiero que evalúes
1. **Desviaciones del patch** (punto 2 de arriba): ¿son correctas? ¿Alguna otra regresión visible en las capturas que las pruebas no vean?
2. **Adaptación de pruebas:** ¿alguna adaptación rebaja una invariante de negocio? ¿Aceptas H4 ≤ 3?
3. **Capturas:** ¿la evolución mejora la comprensión en diez segundos frente a «antes»? ¿Las observaciones del punto 5 merecen corrección ahora o pueden esperar a ver a usuarios?
4. **Alcance:** ¿se puede pasar a preparar la prueba con cinco usuarios sobre `evolucion-25`, o falta algo antes (teléfono real, ETF/datos ausentes)? ¿Cómo se compagina con el piloto R23 ya preparado (mismo grupo, orden, o dos grupos)?
5. **Honestidad** de `ronda25/LEEME.md` y de este texto: ¿alguna afirmación que lo comprobado no respalde?

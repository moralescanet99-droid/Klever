# Ronda 16 · notas guardadas protegidas, puntuación corregida, seguimiento con vínculo estable y dos notas demostrables en el móvil (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda16-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-16/`) y las **6 imágenes** de `imagenes-ronda16-chatgpt.zip` a **la misma conversación** (si admite pocas por mensaje, en dos tandas: 01–03 y 04–06). Son capturas de móvil: las dos notas a 390 y 320 px, y el seguimiento y el laboratorio a 390 px (no hay versión a 320 de esas dos). Para el estado anterior tienes `ronda15/capturas/`.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–15 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 15 (168 comprobaciones repetidas en 11 suites, 9 capturas) se convirtió en el encargo de la ronda 16, **por este orden**: proteger las notas guardadas, corregir la puntuación antes de calibrarla, mantener el seguimiento cuando cambia la redacción y hacer demostrables en el móvil las dos salidas de la nota (calculada y pendiente). Te pido **repetir los casos críticos con tus propios medios** y **juzgar si la nota se entiende en móvil**.

## Qué se afirma
1. **Notas guardadas** (`public/js/nota.js` `validarResumen`; `functions/api/escenarios/{index,_comun}.js`; `public/js/nota-ui.js` `htmlEvaluacionGuardada`): al guardar se valida la **forma** (versión, fecha real, `publicada` booleano, nota finita de 1 a 10 con un decimal o `null`, cobertura ≥ 90 si está publicada, cinco bloques conocidos, texto sin marcado, ningún campo extra) y se guarda una **copia reconstruida**; al leer se revalida y una fila antigua manipulada o corrupta sale **sin contenido** (`evaluacion_invalida`); la interfaz la vuelve a validar y no interpola texto sin escapar. El servidor **no recalcula** (`evaluacion_verificada: false`). Antes: marcador aceptado (201) y devuelto. Pruebas: `unit-escenarios16` P1–P3c; `testO` O6.
2. **Puntuación** (`public/js/nota.js`): EBITDA **ausente ≠ cero ≠ negativo** (ausente = indicador pendiente; antes **3,5/10 con cobertura 100 %** en tu caso); liquidez con **60 sesiones** y moneda, fuente y fecha (referencia = la más frecuente; empate = ninguna); **cobertura por indicador** (tamaño: capitalización y liquidez; deuda: deuda neta/EBITDA y caja libre; rentabilidad: ROIC, años con beneficio y años con ventas al alza), cada uno ≥ 90 %; umbrales y pesos de la v1 **sin cambios**; `/api/universo` transmite moneda, fuente y fecha de mercado y el **origen** del conjunto (`sintetico` solo si todas las filas con fuente son prueba/demo); con otros orígenes la nota **no se publica** (`habilitada` siempre `false`). Pruebas: `unit-nota` N20–N25.
3. **Vínculo estable** (migración `0011_pregunta_estable.sql`, `public/js/contenido.js` `estadoSeguimiento`, `public/js/lab.js`): `pregunta_ref` = «historia:n»; `pregunta` es la formulación personal; casilla «Sigo la pregunta de la historia»; estados responde / sigue pendiente / **pregunta distinta** (con «Ver revisión de la historia» y aclarando que la suya sigue pendiente); «Sin novedades» ya no aparece con una revisión publicada; la migración vincula solo coincidencias **inequívocas**. Pruebas: `unit-escenarios16` P4–P9, `unit-migracion` M1e/M9, `testO` O5.
4. **Dos notas en el móvil** (imágenes 01–04): ejemplo **calculado** (KO 60 % / PG 40 %, nota 4,4, fecha, «Coca-Cola (KO) pesa el 60 % de la cartera…») y ejemplo **incompleto** (KO 50 % / JPM 50 %: «Podemos medir… Faltan datos para valorar… Causa principal: JPM…»); arreglados «Nota pendiente. Nota pendiente» y «observados el fecha no disponible». Comparador: la última ratio en **veces**, «No es un plazo de devolución». Laboratorio: **quién cede el peso** primero, desarrollo debajo. **Para que el ejemplo calculado tenga ≥ 20 comparables sin tocar los umbrales se añadieron 20 empresas ficticias (`EJBA…EJBT`) a «Consumo básico» en la semilla y la demo** (no en el universo real); alteran los percentiles de ese sector en la semilla/demo.
5. **Resultado:** `bash tests/run-all.sh` completo (servidor limpio entre baterías) sobre el commit `c372d49` (árbol limpio; después solo cambió documentación): **659 comprobaciones correctas, 0 fallos, código 0** (30 baterías + demo). Nuevas: `unit-escenarios16` 11, `testO` 14; ampliadas: `unit-nota` 35, `unit-migracion` 14. Entornos: módulo/servidor sobre SQLite real; navegador Chromium con servidor local; **remoto: nada**.
6. **Incidencias declaradas:** una pasada previa falló (1 problema) porque `testB` tenía el recuento antiguo de **106** empresas (126 con las 20 ficticias); corregidos también `testJ` y `testK` y repetida la pasada completa (`ronda16/resultado-ejecucion-intento1.txt`). Siguen **sin diagnosticar** los fallos intermitentes antiguos (`testE`, `testF`) y la carrera del historial de la ficha de la ronda 15.
7. **Pruebas antiguas adaptadas** (dime si alguna rebaja la exigencia): `unit-nota` (universos con origen y mercado con procedencia), `unit-migracion` (M1d sin `escenarios`), `testN` N7 («Sigue pendiente») y N8 (nuevo texto del registro), recuentos 106 → 126.
8. **Bloqueado / no hecho:** D1 remoto y migraciones 0008–0011, correo real, carga SEC real, datos de mercado reales, móvil físico, Safari/Firefox, lector de pantalla, tema oscuro. **La prueba con cinco principiantes NO se ha realizado** (`ronda16/PRUEBA-CON-USUARIOS.md`). La demo autónoma pierde sus datos al recargar.

## Imágenes (6)
- 01-C10-nota-calculada-390.png · 02-C10-nota-calculada-320.png
- 03-C11-nota-pendiente-390.png · 04-C11-nota-pendiente-320.png
- 05-C12-pregunta-editada-390.png
- 06-C13-comparacion-pesos-390.png

## Casos críticos que te pido repetir (tú, no yo)
Desde un clon del zip: `npm ci` y, sin navegador (Node ≥ 22.13): `node tests/ronda15/unit-nota.mjs`, `node tests/ronda16/unit-escenarios16.mjs`, `node tests/ronda8/unit-migracion.mjs`, `node tests/ronda15/unit-comparador.mjs`, `node tests/ronda15/unit-almacen.mjs`. Con navegador: `bash scripts/local/servidor.sh start`, `node tests/ronda16/testO.cjs` y `node tests/ronda15/testN.cjs`. El **antes**: `git worktree add --detach <ruta> 8dc5003` y `node tests/ronda16/antes-despues-r16.mjs <ruta> ANTES`, luego con `.` (resultado esperado en `ronda16/antes-despues-resultado.txt`). Añade tus propios casos: una nota con marcado en cada campo de la evaluación, EBITDA ausente con otras combinaciones de datos, 60 sesiones en la frontera, dos fuentes de mercado, y un escenario con una pregunta reformulada.

## Qué quiero que evalúes
### Producto y móvil (con las imágenes)
1. **¿Se entiende la nota?** Calculada (01–02): ¿explica por qué recibe esa cifra con sus posiciones? Pendiente (03–04): ¿se entiende qué se mide, qué falta y por qué, sin jerga? ¿Se confunde con una previsión de rentabilidad?
2. **Seguimiento (05):** ¿se ve cuál de las tres preguntas responde la revisión, cuál se reformuló y cuál es otra? ¿«Ver revisión de la historia» y «Pregunta distinta a la de la historia» se entienden?
3. **Laboratorio (06):** ¿«Quién cede el peso» justo después de calcular funciona? ¿Las barras antes/después y la tabla de bloques se leen? (solo hay captura a 390 px; dime si a 320 temes cortes)
4. **Comparador:** ¿«veces» y «No es un plazo de devolución» evitan la lectura como plazo?
5. **Honestidad:** ¿queda inequívoco que los datos son sintéticos y que la nota no está habilitada con datos reales? ¿Las empresas ficticias del sector confunden?
6. **Regresiones** respecto a la ronda 15.
### Técnico
7. **`validarResumen`:** ¿algún hueco (tipos, `-0`, números como cadenas, claves heredadas, `__proto__`, cadenas muy largas, unicode de control, entidades HTML)? ¿Es suficiente validar la forma sin recalcular? ¿El límite de 6000 caracteres es coherente con la copia reconstruida?
8. **Nota:** ¿alguna entrada que dé una cifra con datos incompletos? Revisa `preparar` (ausente/cero/negativo, `deudaCaso`), la referencia de moneda/fuente por moda, la cobertura por indicador (¿se puede publicar con un indicador cubierto por empresas que no pesan nada?), el redondeo único y el origen sintético.
9. **Vínculo:** `pregunta_ref` en POST/PATCH (misma historia, formato), migración 0011 (coincidencia inequívoca), `estadoSeguimiento`; ¿algún IDOR, caso en que una pregunta nueva herede una respuesta ajena o una reformulación pierda el vínculo?
10. **Universo y demo:** `functions/api/universo.js` (origen, `habilitada`), semilla/demo con 20 ficticias; ¿puede una ficticia entrar en comparables reales?
11. **Pruebas:** ¿alguna comprobación de `unit-nota` N20–N25, `unit-escenarios16` o `testO` puede pasar en vacío (p. ej. la nota manipulada servida con `route`, el cierre de sesión simulado en SQLite, regex demasiado laxas)? ¿Falta algo? ¿Cómo explicas los fallos intermitentes antiguos?
12. **Estructura:** la demo concatenada sin `import/export`, `nota.js` importado por el servidor; ¿deuda aceptable?
13. **Accesibilidad:** explicación de la nota, tarjeta de seguimiento con estado, tabla de bloques, casillas nuevas.
14. **Honestidad del informe (`ronda16/LEEME.md`, `ANTES-Y-DESPUES.md`, `TABLA-NOTA.md`, `ABRIR-EN-MOVIL.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Se separan bien módulo, navegador y entorno remoto? ¿El «antes/después» prueba lo que dice (módulo y servidor, no navegador)?
15. Todo lo que debería probar yo a mano (`ronda16/pruebas-manuales.md`, M67–M72, más M1–M66).

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo en **Chromium** con servidor local y SQLite real; **nada en Cloudflare D1 remoto**, ningún correo real, ningún Safari, Firefox, móvil físico ni lector de pantalla; sin revisar el tema oscuro.
- **Todos los datos son inventados**, incluida la empresa, la pieza editorial y las 20 empresas ficticias del sector; la demo no persiste y simula el correo.
- Fuera de alcance: piloto de tres piezas, revista con categorías, publicaciones semanales, avisos, comparación de escenarios, análisis interno de ETF, Revolut/Trade Republic, artículo y tip diarios, suscripciones, apertura pública.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en confianza/privacidad, procedencia de datos, claridad de la nota en móvil, honestidad del contenido, solidez técnica y calidad de las pruebas, **comparadas con tu valoración anterior (6/7/7/9/7/7)**.
- **Qué casos has repetido y con qué resultado**, y cuáles no has podido repetir.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían la comprensión de la nota en móvil**, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar**.

*Fuera de alcance (no lo critiques ni lo propongas):* Revolut y Trade Republic, artículo diario personalizado, tip diario, suscripciones y monetización (futuro plan de pago).

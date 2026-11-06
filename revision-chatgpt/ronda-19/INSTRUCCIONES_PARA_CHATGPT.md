# Ronda 19 · frontera del redondeo, revisión a 320 px medida por el resultado y revisión sin nota (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda19-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-19/`) y las **10 imágenes** de `imagenes-ronda19-chatgpt.zip` a **la misma conversación** (00 es la maqueta aprobada; 01–02 escritorio con nota; 03–05 móvil con nota; 06–08 móvil sin nota; 09 escritorio sin nota). Todas son **capturas de viewport**, tomadas tras estabilizarse el desplazamiento, no páginas completas.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–18 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 18 pidió: cerrar la frontera del redondeo (bloques 5,44/5,44/5,44/5,46/5,44 con nota 5,5), medir a 320 px el rectángulo del resultado, reescribir la revisión sin nota, aportar evidencia de regresión con logs íntegros y preparar la prueba con personas. Todo ello va **sin cambiar la identidad visual** y con datos **inventados**.

## Qué se afirma
1. **Redondeo** (`public/js/nota.js`, `validarResumen`): el caso exacto pasa de **aceptado** (ronda 18) a **rechazado**. Con bloques de dos decimales, S = suma ponderada = 5,445; el total real está en [5,44; 5,45), así que no puede dar 5,5. Condición: `S4 + 50 > n10·1000 − 500` **y** `S4 − 50 < n10·1000 + 500`, ambas estrictas. Vecinos aceptados: misma nota 5,4; 5,45 en los cinco bloques con nota 5,5. Pruebas: `unit-redondeo19` (6) con un **oráculo independiente** por fuerza bruta y una barrida de carteras del evaluador.
2. **Revisión a 320/390 px** (`testR`, 9): el **rectángulo del resultado** (cifra + titular con nota; aviso completo sin nota) queda entre la parte superior y el inicio de la barra fija; etiqueta «Paso 3 de 3 · Revisión» y «Volver» visibles; foco en la nota; pesos idénticos al volver; ratón y teclado; movimiento reducido on/off. Imágenes 02–08.
3. **Revisión sin nota** (`public/js/nota-ui.js`, `unit-revision19`, 10): tres causas separadas (instrumento sin método, datos ausentes/inválidos, cobertura insuficiente), explicación breve, «lo que sí podemos decirte» a la vista y detalle por activo en «Cómo se calcula». Plantilla mixta actual: «Esta cartera no tiene nota global. Los ETF representan el 33,6 % y el método actual no evalúa su composición. Puedes revisar el reparto y la concentración por posición; el detalle explica los límites del análisis. Además faltan datos de JNJ y XOM: el detalle dice cuáles.» Imágenes 06–09.
4. **Evidencia**: `bash tests/run-all.sh` completo sobre el commit `ca9b1ae`: **800 comprobaciones correctas, 0 fallos, código 0** (39 baterías + demo), **locales del autor**; registro íntegro por batería en `ronda19/logs/` (comando, entorno, código, tiempo agotado, salida). Repeticiones de `testE`, `testF` y `testC` con latencia 0 y 300 ms: **12/12** (`ronda19/intermitentes.txt`). *Aserciones ≠ entradas.*
5. **Intentos fallidos conservados** (`ronda19/logs-intento1/`, `logs-intento2/`, `resultado-intento2.txt`): `testF` sin resultado (causa **demostrada**: diálogo `beforeunload` sin aceptar al recargar con cambios sin guardar; corregida solo en la prueba, que lo acepta y lo registra); `testQ` Q3-320 (medía antes de estabilizarse el desplazamiento; ahora espera); `testK` con `goto` abortado y `testO` que no salía del proceso: **no reproducidos, causa no demostrada** (se añadió una salida forzada a los 10 s en `h.cjs` para el segundo).

## Limitaciones y lo que NO se afirma
- **Prueba con cinco principiantes: NO realizada** (`ronda19/PRUEBA-CON-USUARIOS.md`, todo «pendiente»; «cerrar y volver» exige persistencia verificada, la demo no sirve).
- **No probado**: móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, D1 remota, correo real, datos reales. **Remoto: nada.**
- **No hay medición «antes»** de la geometría a 320 px con el criterio nuevo (el antiguo medía el panel, no el resultado).
- La aritmética coherente de una nota guardada no acredita su origen.
- **Datos inventados**; la nota solo existe con el conjunto sintético; nada es una recomendación ni una previsión.

## Casos que te pido repetir (tú, no yo)
Sin navegador (Node ≥ 22.13, tras `npm ci`): `node tests/ronda19/unit-redondeo19.mjs`, `node tests/ronda19/unit-revision19.mjs`, `node tests/ronda18/unit-integridad18.mjs`, `node tests/ronda15/unit-nota.mjs`. Antes/después: **este ZIP no lleva historial Git**; `tests/ronda19/antes-despues-r19.mjs <raíz>` necesita un segundo árbol con la ronda 18 (commit `51d9523`); su salida literal está en `ronda19/antes-despues-resultado.txt`. Con navegador: `npx playwright install chromium` y `node tests/ronda19/testR.cjs` (necesita el servidor: `bash scripts/local/servidor.sh start`).

## Qué quiero que evalúes
### Reparación técnica (aceptar o rechazar)
1. **Redondeo**: ¿la condición es exacta? Revisa el oráculo de `unit-redondeo19` (¿puede pasar en vacío?), empates binarios, bloques 0 y 10, `-0`, y resúmenes antiguos guardados que cumplían la tolerancia anterior.
2. **Revisión sin nota**: ¿las tres causas están bien separadas y ordenadas? ¿Algún caso (ETF + banco + dato ausente + cobertura) produce un texto incoherente o que mienta?
3. **Evidencia**: ¿los logs son íntegros y creíbles? ¿La corrección del `beforeunload` rebaja alguna exigencia? ¿Es aceptable la salida forzada de `h.cjs` y las dos causas no demostradas?
### Aplicación visual (aceptar o rechazar)
4. **Revisión a 320 px** (05, 08): ¿el resultado se ve entero y es lo primero? ¿La etiqueta «Paso 3 de 3 · Revisión» y «Volver» son claros? ¿La barra tapa algo?
5. **Revisión sin nota** (06–09): ¿se entiende por qué no hay nota y qué sí se puede saber? ¿El aviso naranja es proporcionado?
6. **Escritorio** (01, 02, 09 frente a 00): ¿algo se aleja de la maqueta?
7. **Honestidad del informe** (`ronda19/LEEME.md`, `ANTES-Y-DESPUES.md`, `ABRIR-EN-MOVIL.md`): ¿alguna afirmación que las pruebas no respalden?
8. **Prueba con personas**: ¿el guion distingue datos ficticios, evaluación parcial y nota global? ¿Qué cambiarías?
9. Lo que debería probar yo a mano (`ronda19/pruebas-manuales.md`, M85–M90).

## Formato de respuesta
- **Veredicto de 3 líneas** y **dos decisiones separadas: aceptar/rechazar la reparación técnica y aceptar/rechazar la aplicación visual**, con notas del 1 al 10 en confianza/privacidad, procedencia de datos, claridad del recorrido en móvil, honestidad del contenido, solidez técnica y calidad de las pruebas, **comparadas con tu valoración anterior**.
- **Qué casos has repetido y con qué resultado**, y cuáles no.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían el recorrido**, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar**.

*Fuera de alcance:* conexión a Revolut y Trade Republic, artículo diario personalizado, tip diario, suscripciones y monetización; integraciones bancarias, personalización diaria y activación de la nota con datos reales.

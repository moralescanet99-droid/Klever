# Ronda 20 (cierre técnico y visual): causas coexistentes, código de salida de las pruebas y Revisión de escritorio

Parte de la revisión de la ronda 19 (`procesos-klever/06-`, C17). Sin funcionalidades nuevas, sin cambiar la metodología numérica, posiciones, pesos ni notas calculadas. Identidad visual intacta.

> **Código de la última pasada completa:** el commit que figura en la cabecera de `ronda20/resultado-ejecucion.txt` (ver §6). Una guía única para abrir el recorrido: `ronda20/ABRIR-EN-MOVIL.md`. Antes/después corto: `ronda20/ANTES-Y-DESPUES.md`.

# 1. Bloque A · Causas y explicación (I1, M1)
- **Causas coexistentes con código estable** (`public/js/nota.js`): cada posición sin evaluar lleva `causas: [{ codigo, bloque, indicador, texto }]` con cuatro códigos: `metodo_no_aplicable`, `dato_ausente`, `dato_invalido` y `comparables_insuficientes`. Los códigos se asignan **en el origen** del motivo; no se deducen de ningún texto (ninguna expresión regular) y una causa ya no sustituye a otra. Se retira el campo único `causa`.
- **Qué se dice** (`public/js/nota-ui.js`): para cada indicador que no llega a la cobertura mínima se buscan las familias que, resueltas **solas**, lo arreglarían; si ninguna basta, son relevantes todas las que le afectan. Lo demás se menciona al final con «Además». Cada porcentaje es el de su familia y no se suma a otro (una posición cuenta una vez por familia).
- **Encabezado por estado:** «Evaluación parcial» (hay bloques evaluados), «Sin nota global» (ninguno) y «Nota pendiente» **solo** cuando hay una espera real (cartera incompleta, procedencia, origen). El aviso deja de ser un bloque ámbar: texto normal con un filete; el ámbar queda para la espera real. Se elimina la frase «el detalle explica/dice…».
- **Casos exactos de la revisión** (`unit-causas20`, 10/10):

| Caso | Antes (R19) | Después (R20) |
|---|---|---|
| JPM 50 % + KO 50 %, KO sin EBITDA | omite el banco | «El método no analiza la deuda y los beneficios del banco (50 %) y faltan datos de KO.» |
| SCHD 1 % + AAPL 99 % | culpa al ETF y dice «faltan datos de AAPL» | «No hay comparables suficientes en su sector para valorar «deuda y caja» y «rentabilidad y crecimiento» de AAPL (99 %). Además, el método no analiza la composición de los ETF (1 %).» |
| JPM 50 % + PG 50 %, JPM sin capitalización | solo el banco | «El método no analiza … del banco (50 %) y faltan datos de JPM.» |
| Plantilla mixta | «faltan datos de JNJ y XOM» | «…no hay comparables suficientes en su sector para valorar … de JNJ y XOM (33,2 %).» — **cambia la afirmación de la ronda 19**: JNJ y XOM no tenían datos ausentes, les faltaban comparables |

Las tablas de la ronda 19 (`unit-revision19` V1, V7–V10) se actualizaron al nuevo texto **con la misma exigencia** (comparación de la cadena exacta). El ejemplo «KO + JPM» pasa a llamarse «evaluación parcial» en el selector, en la demo y en `testO`.

# 2. Bloque B · Pruebas y cierre (I2, M2, registros)
- **`tests/ronda5/h.cjs`:** aserción fallida → código 1; un código distinto de cero ya fijado se conserva; los navegadores abiertos se cierran en `finally` con plazo; si no cierran o el proceso no termina solo a los 10 s se escribe `CIERRE FORZADO`/`CIERRE ANÓMALO` y se sale con **código 3**, nunca con éxito. Verificado en subprocesos reales (`unit-cierre20`, 10/10): éxito → 0; fallo → ≠ 0; error previo → ≠ 0; recurso que obliga a forzar → 3 con registro; navegador sin cerrar → 3; y `run-all.sh` rechaza cada caso por su cuenta (la misma fixture como «batería»).
- **`run-all.sh`:** además de lo anterior, detecta `CIERRE FORZADO/ANÓMALO` y **conserva el log íntegro de `demotest`** (`ronda20/logs/demotest.log`), que la ronda 19 no tenía.
- **`testF`:** el escuchador solo acepta `beforeunload` y registra cualquier otro diálogo como inesperado; F9 **exige que el aviso aparezca** (≥ 1) y que no haya inesperados (antes `every` pasaba con una lista vacía). No rebaja ninguna comprobación de persistencia.
- **`testR`:** la espera de estabilización **falla** si no se estabiliza (R0e); el teclado es **real** (desde el nombre, solo con Tab hasta «Revisar»; R0t); diálogos acotados (R0d).
- **Redondeo:** se retira la afirmación «no hace falta tolerar empates binarios». Las 4.800 salidas de la barrida se aceptan y **ninguna cae en la franja de la frontera**; no se demuestra nada sobre empates (el contador se publica, no se exige).
- **`testK` y `testO`:** no se intenta explicar por conjetura. El cierre forzado **no es una explicación** de su causa. No han vuelto a ocurrir en esta ronda (ver §6).

# 3. Bloque C · Revisión visual y guía (I3, M2)
- **Escritorio 1440×900, tras «Revisar portafolio»:** la página ya no salta a la nota; se queda arriba y en la columna derecha el resultado va primero con «← Volver a la distribución»; a la izquierda siguen las posiciones. Se ven nombre, pasos, el resultado, «Volver» y la acción de guardado (o «Guardada en tu cuenta»; «Cambios locales pendientes…» y «Guardar cartera» activo cuando los hay). Sin contenido decorativo.
- **320×780 y 390×780:** el resultado breve y «Volver» siguen libres de la barra; con nota, sin nota y con cambios sin guardar; ratón y teclado real; movimiento reducido on/off. El regreso conserva exactamente los pesos (se compara el **valor**, porque el campo puede mostrar «50» o «50,0»; un primer intento comparó el texto y dio un falso fallo: ver §5).
- **`testR` 15/15**; capturas de viewport (sin desplazamiento manual) en `ronda20/capturas/`, incluidas Revisión de escritorio con cambios sin guardar.
- **Guion de personas** (`PRUEBA-CON-USUARIOS.md`) ajustado: tarea 3 sin sugerir la respuesta (se informa una sola vez de que los datos son inventados y se mide si se recuerda sin ayuda); tarea 4 con preparación KO 60 % / PG 40 %, sin enseñar que quitar fondos «mejore» la cartera; tarea 6 pregunta qué se puede y qué no se puede concluir; sin franja de edad. **M86** ya no exige que todo quepa a la vez a 200 % con teclado: se pide lectura por desplazamiento, sin solapamiento persistente, foco visible y controles alcanzables. **No se afirma que se haya probado con personas: solo se preparó el documento.**

# 4. Lo que NO cambia
Metodología numérica, pesos, posiciones y notas calculadas (KO 60 % / PG 40 % = 4,4 antes y después; `unit-nota` 35/35 y `unit-calculos` 23/23). Identidad visual, navegación, Revista y El Superespeculador.

# 5. Incidencias de la propia ronda (todas conservadas con su log)
1. **Mi error en `unit-cierre20`:** el primer intento lanzó el `run-all.sh` real y no solo la fixture (una variable de entorno vacía recupera su valor por defecto); detenido, corregido y repetido. Los ficheros que ensució se restauraron; sin efecto sobre lo entregado.
2. **Falso fallo de `testR`** («pesos conservados false»): comparaba el texto «50» con «50,0»; ahora compara el valor.
3. **`testR` escribía sus capturas en `ronda19/`:** se parametrizó con `RONDA` y se repitió solo `testR` para generarlas (`logs-testR-capturas.log`).
4. **Pasada 1 (`logs-pasada1/`, 826/0, todo correcto)** sobre un árbol con cambios sin commitear.
5. **Pasada 2 (`logs-pasada2-fallo-Q3/`, 825, 1 fallo):** `testQ` Q3-1440, intermitente (≈ 1 de cada 4-8 ejecuciones). **Causa demostrada con registro de `scrollTo/scrollBy`: era un fallo REAL de la aplicación.** `app.js` (`focusin`) centraba el campo de peso activo con un `scrollBy` diferido 300 ms; si se pulsaba «Revisar» dentro de ese plazo, el desplazamiento llegaba **después** de `pasoActual` y arrastraba la página a 527 px. Corrección: el desplazamiento diferido se cancela si el campo ya no tiene el foco o está oculto. Mi primera hipótesis (que la prueba midiera antes de empezar el desplazamiento) era **incorrecta**: el cambio que hice entonces (esperar al foco en la nota) no lo arregló y se mantiene solo como robustez. Regresión determinista nueva (`testR` R4-1440: pulsar «Revisar» a < 300 ms de editar un peso, 6 veces): **falla con la corrección quitada (scrollY = 516 ×6) y pasa con ella**.
6. **Pasada 3 (`logs-pasada3-fallo-E5/`, 826, 1 fallo):** `testD` E5, intermitente (1 de 9 repeticiones). **Causa demostrada con las cajas medidas:** la prueba leía las posiciones del motivo y de «Guardar» mientras ese mismo desplazamiento diferido de 300 ms estaba en curso (motivo en y = 2, «Guardar» en y = 184). Es una carrera de la **prueba**, no de la aplicación; espera ahora 700 ms (antes 200) y la observación publica las coordenadas. 12/12 repeticiones limpias después (`repeticion-testD.txt`). No se rebaja ninguna aserción.
7. **Pasada 4 (definitiva, `logs/`):** todo correcto.

# 6. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador) y subprocesos de Node:** `unit-causas20` **10** y `unit-cierre20` **10** (nuevos), `unit-revision19` 10 (actualizada), `unit-redondeo19` 6, `unit-integridad18` 18, `unit-guardada17` 20, `unit-procedencia17` 13, `unit-nota` 35, `unit-calculos` 23 y las anteriores.
**Navegador (Chromium, servidor local):** `testR` **16** (ampliado: escritorio con contexto, cambios sin guardar, teclado real, estabilización, regresión R4), `testQ` 25, `testF` 10, `testD` 29, `testK` 75, `testO` 18, `paridad-demo` 5 y las anteriores; demo autónoma (`demotest`) con su log íntegro.
**Pasada completa definitiva (commit `9c1eda3`, árbol limpio): 827 comprobaciones correctas, 0 fallos, código 0** (41 baterías + demo). Ningún log contiene `CIERRE FORZADO` ni `CIERRE ANÓMALO`: **no hubo cierre forzado en esta pasada.** *Aserciones ≠ entradas.*
**Repeticiones** (`tests/ronda19/repetir-intermitentes.sh 2 300`, `ronda20/intermitentes.txt`): `testE` 15/0, `testF` 10/0 y `testC` 50/0, con latencia 0 y 300 ms, dos veces cada una.
**Entorno remoto:** nada ejecutado. **Móvil físico, lector de pantalla, Safari/Firefox, D1 remota, correo real, datos reales y comprensión por personas: no probados.** Mi inspección visual de las capturas no sustituye a las pruebas de interacción ni de accesibilidad real.

# 7. Afirmaciones ajustadas (según la revisión)
| Antes | Ahora |
|---|---|
| «Las tres causas están separadas» | Las causas coexisten con código estable y las combinaciones de los casos probados se explican; no se afirma cobertura de toda combinación posible. |
| «No hace falta tolerar empates binarios» | Las 4.800 salidas de la barrida se aceptan; ninguna cae en la franja de la frontera. |
| «Probado con teclado» | Recorrido real con Tab desde el nombre hasta «Revisar» y Enter (R0t). No es lector de pantalla. |
| «Cierre correcto» | Aserciones terminadas **y** proceso cerrado sin forzar; si no, código 3 y registro. En esta pasada no hubo cierre forzado. |
| «Todo el registro es íntegro» | Logs íntegros de las 41 baterías **y de `demotest`**, más los de los intentos fallidos. |

# 8. Limitaciones y pendientes
- **Prueba con personas: no realizada** (guion en `PRUEBA-CON-USUARIOS.md`, todo «pendiente»). Siguiente evidencia relevante, según la revisión.
- `testK` (goto abortado) y `testO` (sin salir) **no se reprodujeron** en esta ronda; su causa sigue sin demostrar y el cierre forzado no la explica.
- No hay medición «antes» de la geometría de escritorio con el criterio nuevo (la ronda 19 medía solo la nota).
- El mismo desplazamiento diferido de 300 ms puede afectar a otras pruebas que midan cajas justo después de editar un peso; se corrigió donde falló.

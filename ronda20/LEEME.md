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

# 5. Incidencias de la propia ronda
- **Mi error de la prueba de cierre:** el primer `unit-cierre20` lanzó el `run-all.sh` real y no solo la fixture, porque una variable de entorno vacía recupera su valor por defecto en el script; detenido, corregido (valor «un espacio») y repetido. Sin efecto sobre el código entregado; los ficheros que ensució se restauraron.
- **Falso fallo de `testR`** («pesos conservados false» con cambios sin guardar): comparaba «50» con «50,0»; corregido comparando el valor numérico.
- **`testR` escribía las capturas en `ronda19/`:** se detectó al restaurar el árbol, se parametrizó con `RONDA` y se repitió solo `testR` para generarlas (`logs-testR-capturas.log`).

# 6. Pruebas realmente ejecutadas (separadas por entorno)
Se rellena al cierre (pasada completa definitiva y repeticiones): ver abajo.
**Entorno remoto:** nada ejecutado. **Móvil físico, lector de pantalla, Safari/Firefox, D1 remota, correo real, datos reales y comprensión por personas: no probados.** Mi inspección visual de las capturas no sustituye a las pruebas de interacción ni de accesibilidad real.

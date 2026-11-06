# Ronda 19 · antes y después

«Antes» = ronda 18 (commit `51d9523`, en un árbol aparte). «Después» = esta ronda. Salida literal del script en `ronda19/antes-despues-resultado.txt` (`node tests/ronda19/antes-despues-r19.mjs <raíz>`; módulo y servidor con SQLite real, **sin navegador**).

## 1. Frontera del redondeo (contraejemplo exacto de la revisión)
Bloques 5,44 / 5,44 / 5,44 / 5,46 / 5,44 con nota **5,5**: la suma ponderada de los bloques guardados es 5,445; el total real está en [5,44; 5,45), por lo que **no puede redondear a 5,5**.

| Caso | Antes (R18) | Después (R19) |
|---|---|---|
| bloques 5,44/5,44/5,44/5,46/5,44 · nota 5,5 | **ACEPTADO** (error) | **RECHAZADO** |
| mismos bloques · nota 5,4 | aceptado | aceptado |
| 5,45 en los cinco bloques · nota 5,5 | aceptado | aceptado (legítimo) |

Cambio aislado: una sola condición en `validarResumen` (`S4 + 50 > n10·1000 − 500 && S4 − 50 < n10·1000 + 500`, ambas **estrictas**). Pruebas de compatibilidad en `tests/ronda19/unit-redondeo19.mjs` (6 comprobaciones; un oráculo independiente por fuerza bruta contra el validador en miles de resúmenes cerca de la frontera, y una barrida de carteras calculadas por el evaluador: ninguna salida legítima se rechaza).

## 2. Revisión a 320 px: resultado entre la zona útil y la barra
Ahora se mide el **rectángulo del resultado** (cifra + titular con nota; aviso completo sin nota), no su panel. `tests/ronda19/testR.cjs` (9/0) comprueba a 320×780 y 390×780, con nota y sin nota, con ratón y con teclado, con movimiento reducido on/off: resultado con `top ≥ 0` y `bottom ≤ inicio de la barra`, etiqueta «Paso 3 de 3 · Revisión» y «Volver» visibles, foco en la nota, pesos idénticos al volver. El desplazamiento se hace en dos fotogramas y de forma instantánea; las capturas se toman cuando `scrollY` lleva cinco fotogramas sin cambiar.
*No hay medición «antes» con el mismo criterio:* la comprobación antigua miraba el panel, no el resultado. Sí se observó, al endurecer `testQ`, que a 320 px con la plantilla mixta la comprobación fallaba mientras el desplazamiento no se había estabilizado (Q3-320 en `logs-intento2/testQ.log`, intento fallido conservado).
Capturas de viewport (no página completa) en `ronda19/capturas/`: `R-distribucion-…` y `R-revision-…`, con nota y sin nota, a 320, 390 y 1440.

## 3. Mensaje de la revisión sin nota (plantilla mixta con ETF)
| | Texto |
|---|---|
| Antes | «Faltan datos para valorar «empresas», «sectores y actividades», «tamaño y liquidez», «deuda y caja» y «rentabilidad y crecimiento». Causa principal: SCHD (17 % de la cartera): fondo (ETF) sin metodología ni composición válida: cuenta como peso sin evaluar; VYM (16,6 % de la cartera): …» |
| Después | «Esta cartera no tiene nota global. Los ETF representan el 33,6 % y el método actual no evalúa su composición. Puedes revisar el reparto y la concentración por posición; el detalle explica los límites del análisis. Además faltan datos de JNJ y XOM: el detalle dice cuáles.» |

Se separan tres causas: instrumento sin método (ETF, bancos), datos ausentes o inválidos y cobertura insuficiente. Fuera del desplegable aparece lo que sí existe (asignado 100 % en 6 posiciones; mayor posición; ETF 33,6 % · acciones 66,4 %; «dos ETF no equivalen a dos empresas»); el motivo por activo queda en «Cómo se calcula». Las posiciones y los pesos no cambian (`unit-revision19`, V1–V10).

# Ronda 20 · antes y después (corto)

«Antes» = ronda 19 (commit `9a1e272`, árbol aparte). «Después» = esta ronda. Salida literal: `ronda20/antes-despues-resultado.txt` (`node tests/ronda20/antes-despues-r20.mjs <raíz>`; SQLite real y subprocesos de Node, **sin navegador de interacción**).

## 1. Causas de una evaluación incompleta (I1)
| Caso | Antes | Después |
|---|---|---|
| JPM 50 % + KO 50 %, KO sin EBITDA | «Podemos medir … Faltan datos para valorar «deuda y caja»… Causa principal: KO … falta el EBITDA» (omite el banco) | Evaluación parcial. «El método no analiza la deuda y los beneficios del banco (50 %) y faltan datos de KO.» |
| SCHD 1 % + AAPL 99 % | «Los ETF representan el 1 % … Además faltan datos de AAPL» | Evaluación parcial. «No hay comparables suficientes en su sector para valorar «deuda y caja» y «rentabilidad y crecimiento» de AAPL (99 %). Además, el método no analiza la composición de los ETF (1 %).» |
| JPM 50 % + PG 50 %, JPM sin capitalización | solo el banco | «El método no analiza … del banco (50 %) y faltan datos de JPM.» |
| SCHD 20 % + JPM 40 % + KO 40 %, KO sin EBITDA | frase conjunta con encabezado «Nota pendiente» | «El método no analiza la composición de los ETF (20 %) ni la deuda y los beneficios del banco (40 %) y faltan datos de KO.» · Sin nota global |
| Plantilla mixta | «… faltan datos de JNJ y XOM: el detalle dice cuáles.» | «… no hay comparables suficientes en su sector para valorar … de JNJ y XOM (33,2 %).» · Sin nota global |

Encabezados: «Nota pendiente» solo con espera real; «Evaluación parcial» y «Sin nota global» en los demás. Causas con código estable (`metodo_no_aplicable`, `dato_ausente`, `dato_invalido`, `comparables_insuficientes`), sin deducirlas del texto. Posiciones, pesos y notas calculadas sin cambios (KO 60 % / PG 40 % = 4,4).

## 2. Código de salida de las pruebas (I2)
Ejemplo literal de la revisión (`h.ok('fallo intencionado', false); h.fin();`): **antes** `RESULTADO: 0 correctas, 1 fallos` con **código de salida 0**; **después** el mismo mensaje con **código 1**. Recurso que obliga a forzar el cierre → código 3 con `CIERRE FORZADO`; navegador sin cerrar → código 3 con `CIERRE ANÓMALO`; `run-all.sh` rechaza cada caso (`unit-cierre20`, 10/10).

## 3. Revisión de escritorio (I3) y fallos reales encontrados
- **Antes (ronda 19, capturas 02 y 09):** al revisar, la página saltaba a la nota; quedaba una zona vacía a la izquierda y sin nombre, pasos, «Volver» ni guardado a la vista. **Después:** la página se queda arriba; resultado primero en su columna con «Volver a la distribución»; posiciones a la izquierda; nombre, pasos y guardado (o «Guardada») a la vista, también con cambios sin guardar (`testR` R2/R3, capturas `ronda20/capturas/R-revision-*-1440-viewport.png`). No hay medición «antes» con este criterio.
- **Fallo real hallado al repetir:** pulsar «Revisar» a menos de 300 ms de editar un peso dejaba la página desplazada 516–527 px (el centrado diferido del campo activo llegaba tras el cambio de paso). Falla con la corrección quitada, pasa con ella (`testR` R4-1440).

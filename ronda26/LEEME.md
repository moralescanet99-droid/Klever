# Ronda 26 · Evolución visual e interactiva («descubre alternativas y compara antes de invertir»)

**Encargo (Javier, 2026-11-06):** que Klever se entienda de forma visual, interactiva y rápida para personas de 20–30 años con poca experiencia; núcleo *Cartera → Descubrimiento → Comparación → Decisión → Revisión*; menos texto; conservar lo que funciona y la estética carbón y cobre; sin prometer rentabilidades. Auditoría breve primero, después cambios prioritarios.
**Base:** rama `evolucion-25` (R24 + evolución visual 25, 961/0) más las notas del traspaso al supervisor de la rama del piloto. Trabajo en `claude/klever-visual-interactive-evolution-h6n454`. **El piloto `piloto-r23` no se toca.**

## 1. Auditoría breve (antes de tocar nada)
Capturas de partida a 1440 y 390 px del recorrido completo (portada, ejemplo, editor, revisión, laboratorio, empresas, Cuaderno, Revista).

| Área | Lo que funcionaba | Lo que fallaba |
|---|---|---|
| 1–2. Portada y propuesta en < 10 s | Estética carbón/cobre, ejemplo interactivo (JNJ cede peso), tres entradas | El titular hablaba de «entender», no de comparar antes de invertir; en móvil el ejemplo quedaba **bajo** las tres entradas y dos líneas de avisos; el recorrido no se veía |
| 3. Crear cartera | Editor por pasos, anillo, deslizadores, guardado fiable | — (no se toca) |
| 4. Nota y motivos | Criterios en barras (R25), causas concretas | La cifra no tenía forma visual; el texto de causas es largo |
| 5. Reparto y «Quién cede el peso» | Barras antes/después y tarjetas de cambio | Solo aparecían tras rellenar un formulario de tres bloques |
| 6. Original vs alternativa | Cálculo exacto, tablas en desplegables | **«Ver qué cambiaría» abría un laboratorio vacío**: la promesa se rompía justo en el momento clave; el hueco liberado no se veía |
| 7. Ideas y empresas | Tabla con las cinco comprobaciones en fichas | Sin puente de «qué le falta a mi cartera» a «qué puedo explorar» |
| 8–9. «Para revisar» y Cuaderno | Agrupado por fecha (hoy / próximas / sin fecha) | Ninguna cifra de un vistazo; cabecera y tarjetas densas |
| 10. Móvil | Sin desbordes a 320 px | La revisión iba al límite de la barra fija |
| 11. Texto | Advertencias honestas | Cabeceras de dos frases repetidas en cada pantalla |
| 12. Valor y vuelta semanal | Aviso «tienes N ideas para revisar» en portada (con cuenta) | Nada en «Mis portafolios» decía qué mirar de cada cartera |

### Qué se mantiene · simplifica · rediseña · elimina
- **Se mantiene:** toda la lógica (cálculos, nota, guardado, conflictos, privacidad, Cuaderno, revisiones), el editor, el ejemplo interactivo de portada, la estética carbón/cobre con un serif por pantalla, «Quién cede el peso», las tres entradas, los desplegables de detalle, la Revista como secundaria.
- **Se simplifica:** cabeceras del laboratorio, Explorar, Cuaderno y Revista (una frase); las cifras «Mayor posición / Tres mayores» de la revisión pasan de dos tarjetas a una línea; la explicación de cada señal y «Qué mide» aparecen **al pulsar**.
- **Se rediseña:** portada (propuesta + recorrido de 5 pasos; en móvil el ejemplo sube), resumen de la revisión (exposición por categoría + señales), salto revisión → laboratorio (comparación **ya calculada**), laboratorio (deslizador instantáneo, cifras clave antes→después, alternativa en azul, hueco «libre»), nota publicada (anillo), Cuaderno (resumen de cifras), «Mis portafolios» (señal principal).
- **Se elimina:** el titular y el antetítulo anteriores, las dos tarjetas grandes de métricas del vistazo y las frases repetidas de cabecera. **Ninguna función se elimina.**

## 2. Qué se ha hecho (implementado)
1. **Señales de cartera** (`public/js/senales.js`, puro): «Exposición alta: {categoría}» (> 40 % en una categoría de acciones), «{TICKER} pesa el N %» (> 25 %), «Solo N categorías» (≤ 3), «N posiciones» (< 4), «Falta asignar / Exceso», «Una sola posición» o «Sin concentraciones destacadas». Sin duplicar la misma idea; los ETF no cuentan como exposición sectorial. Los umbrales se declaran como **referencias orientativas de Klever, no normas ni consejos**.
2. **Revisión:** barra de exposición por categoría con leyenda, señales como fichas pulsables (alerta naranja, aviso ámbar, correcto verde) y la hipótesis a la vista («¿Y si NVDA pesara menos?»).
3. **«Ver qué cambiaría» → comparación instantánea:** abre el laboratorio con la hipótesis de la señal (activo que **ya está**, peso menor —la mitad, como mucho 20 %—, reducción proporcional) **simulada sin pulsar «Simular»** y desplazada a la vista. Nunca propone un activo nuevo.
4. **Laboratorio:** deslizador del peso que recalcula al instante (ratón y teclado, sin mover el foco); cifras clave antes→después (mayor posición, tres mayores, categorías, sin asignar); alternativa en azul; lo liberado se ve como tramo «libre»; sin activo elegido se ve la cartera base y «Descubre otras categorías» (las que la cartera no tiene) lleva a Explorar con ese filtro, sin elegir empresa.
5. **Nota publicada** dentro de un anillo proporcional (0–10), sin cambiar el texto ni el cálculo.
6. **Cuaderno:** resumen «Para revisar hoy / En estudio (próxima fecha) / En tu radar» solo con datos leídos; sin cuenta, el ciclo Simula → Guarda → Vuelve.
7. **Mis portafolios:** cada cartera muestra su señal principal (de la versión guardada).
8. **Portada:** «Descubre alternativas. Compáralas antes de invertir.» + recorrido de 5 pasos; en < 960 px el ejemplo interactivo va antes de las tres entradas.
9. **Estilo** (`public/style-r26.css`, se carga el último): azul eléctrico `#6CB4FF` solo para lo simulado/alternativo, verde para estados correctos, capa de luz y sombra suave en superficies, transiciones cortas (fundido de vistas, barras que crecen) desactivadas con movimiento reducido. Sin fuentes externas (pila local; Inter solo si está instalada).
10. **Demo** reconstruida con los mismos archivos (`scripts/demo/build_demo.py` incluye `senales.js` y `style-r26.css`).

## 3. Qué se ha probado
- **`tests/ronda26/unit-senales26.mjs` (13):** cada regla, sin duplicados, ETF fuera de la exposición sectorial, incompleta/exceso, cartera vacía, peso hipotético siempre menor que el actual y con una decimal, ninguna hipótesis con un activo que no esté ya en la cartera, umbrales congelados.
- **`tests/ronda26/testV.cjs` (24, servidor real, 1440/390/320):** V1 portada; V2 señales y detalle al pulsar (foco conservado); V3 comparación ya calculada y cartera del servidor intacta; V4 deslizador (ratón y teclado); V5 descubrir por categoría → Explorar filtrado; V6 resumen del Cuaderno; V7 señal en «Mis portafolios»; V0 sin errores ni desbordes.
- **Regresiones encontradas por las pruebas existentes y corregidas en código (no en las pruebas):**
  - `testQ` Q3: un `<details>` nuevo («Qué mide») antes del aviso de la nota rompía el orden «resultado → aviso → detalle» → pasa a botón con `aria-expanded`.
  - `testQ` Q3 y `testR` R1/R2: el vistazo más alto empujaba el resultado de la nota fuera de la pantalla (1440: 913–1059 de 900; 320: 546–718 con la barra en 708) → vistazo compacto en todos los anchos, detalle al pulsar, anillo de 64 px. Tras el ajuste: 1440 752–874 de 900; 320 sin nota 478–674 (barra 708), con cambios sin guardar 512–659 (barra 689). **Margen estrecho (26–30 px):** cualquier línea más en el vistazo puede volver a romperlo.
- **Prueba adaptada a propósito (se declara):** `testS` S1 exigía el titular literal «Entiende lo que tienes / Explora lo que podría cambiar»; ahora exige «Descubre alternativas» y «antes de invertir» (cambio de promesa pedido por Javier). No se ha relajado ninguna otra aserción.
- **Pasada completa:** ver §5.

## 4. Sin comprobar
Teléfono real, teclado virtual, Safari/Firefox, lector de pantalla con las fichas de señales y el deslizador, contraste medido sobre píxeles (el azul da 7,6–8,7:1 **calculado** sobre los fondos planos), D1 remota, correo real, personas. Que las señales se **entiendan** como referencia y no como consejo, que la comparación instantánea aumente las ganas de volver y que la propuesta se capte en 10 s son **hipótesis**: solo el piloto con personas puede decirlo.

## 5. Resultado de la pasada completa
- **Primera pasada** (commit `eabef44`): 996 correctas, **2 fallos**, ambos en `testB`: (1) al acortar la cabecera de Explorar se perdió «no es una recomendación **de compra**» → **repuesto en el código**; (2) el titular literal de la portada → **prueba adaptada** por el cambio de promesa (declarado arriba).
- **Pasada definitiva** (commit `cdae3ee`, árbol limpio, 2026-11-06 14:59 UTC, local del autor): **998 correctas, 0 fallos, código de salida 0** (50 baterías con resultado; 961 anteriores + 13 `unit-senales26` + 24 `testV`). Registro en `resultado-ejecucion.txt` y `logs/`; capturas en `capturas/` (no versionadas salvo `V*`).

## 6. Decisiones que necesita Javier
1. **Promesa:** el producto dice ahora «compara tus opciones **antes de invertir**» (tu texto). La evolución 25 la había cambiado a «antes de decidir» para no sugerir que se opera o se recomienda. ¿Confirmas «antes de invertir»?
2. **Umbrales de las señales (25 % / 40 % / ≤ 3 categorías / < 4 posiciones):** es la primera vez que Klever enseña umbrales propios (hasta ahora solo el límite personal, «Klever no impone ningún umbral»). Se rotulan como orientativos. ¿Se aceptan, se cambian o se dejan solo como límite personal?
3. **Integración:** esta rama contiene la evolución 25. Integrarla aquí resuelve de hecho la decisión abierta 1 del traspaso (¿se integra `evolucion-25`?). El piloto sigue en `piloto-r23`; probar esta versión con personas sería un segundo grupo (no mezclar).
4. ¿Siguiente paso: probar con 5 personas esta versión o el piloto ya preparado?

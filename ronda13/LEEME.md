# Ronda 13: primer recorrido completo de cartera, descubrimiento, simulación y seguimiento

Nueva propuesta de valor: **«Entiende lo que tienes, descubre alternativas y compara tus opciones antes de invertir»**. Se implementa un servicio pequeño y conectado: *abrir una cartera → comprender su concentración → explorar una empresa → guardarla en el radar → simular su incorporación → comparar antes/después → guardar el escenario con una nota*. Parte de la ronda 12 y conserva sus garantías (guardado atómico, revisiones y conflictos, recuperación local, separación público/privado).

> **Código probado: commit `fde8fee66c1d6b295042f5dccedef6f1843f6334`** (árbol de trabajo limpio al ejecutar; los commits posteriores solo añaden resultados, informe y memoria). Resultado literal al final. Capturas del recorrido: `ronda13/capturas/` (R1–R8 en 320/390/1440). Plan previo: `ronda13/PLAN.md`.

## 1. Qué puede hacer ahora una persona (ejemplo)
**Ana** tiene una cartera «Base dividendos» con KO 60 % y PG 40 %. En la ronda 12 solo podía editarla y mirarla. Ahora:
1. La abre y la **radiografía** le dice, con la versión que analiza: «La mayor posición es KO (60 %). Solo hay 2 posiciones: suman el 100 %». Define un **límite personal** del 50 % y lee: «KO: esta posición supera el límite del 50 % que has definido».
2. En «Explorar empresas» abre la ficha de Johnson & Johnson: ve que **no figura directamente** en su cartera, la guarda **en su radar** con la nota «Revisar deuda y caja libre».
3. Desde «Mi seguimiento» pulsa «Simular en el laboratorio» con la cartera y el activo ya elegidos, pone el 10 % y elige «reducir proporcionalmente». Lee el método **antes** de calcular y obtiene **KO 54 % · PG 36 % · JNJ 10 %**, con la comparación (mayor posición, tres mayores, categorías, límite: «KO sigue superando el límite del 50 %»).
4. Guarda el **escenario** con nombre y nota («Simulación»: su cartera y su versión pública **no cambian**).
5. Días después cambia su cartera; al reabrir el escenario ve «La cartera cambió después de este escenario (revisión 0 → 1)» y **la base y la propuesta tal como se guardaron**; lo archiva con una nota.

## 2. Qué se ha implementado (todo probado; ver §4)
- **Mi cartera:** panel «Radiografía de concentración» en el editor (conclusión primero; mayor posición, tres mayores o las que haya, sin asignar/exceso, límite personal, cobertura; qué no mide). Distingue **versión guardada / cambios locales** (botones y texto «Analizando: …»); el visitante ve su borrador rotulado.
- **Mi radar:** guardar/quitar, nota privada (≤ 500), «ya figura directamente en la cartera elegida» (sin mirar dentro de los fondos), marca «★ En tu radar», filtros explícitos en Explorar (sector, comprobación + resultado, «solo mi radar») **sin ranking nuevo** y conservados con la búsqueda; paso al laboratorio con cartera y activo.
- **Mi laboratorio:** base guardada, activo, peso, financiación (sin asignar / proporcional), método explicado antes, resultado con tablas antes/después/cambio, concentración, categorías (comerciales), límites afectados y pasos del cálculo; inviable con motivo; escenario con nombre y nota; rotulado «Simulación».
- **Mi seguimiento:** radar con notas y escenarios (filtro por estado), cada escenario con fecha, cartera y revisión de origen, copia de la base, propuesta, método, nota y estado (en estudio / descartado / archivado); aviso de versión posterior sin recalcular; editar, archivar y descartar.
- **Datos y confianza:** `datos_meta` declara el origen; la interfaz y `legal.html` ya **no atribuyen a la SEC** ni prometen cargas nocturnas sin comprobar (`ronda13/DATOS.md`).
- **Arquitectura:** `public/js/{calculos,almacen,lab}.js` + `public/style-r13.css` (archivo propio); `app.js` solo enruta, pasa un contexto y añade filtros/ficha. **Migración aditiva 0008** (`radar`, `escenarios`, `datos_meta`, `portafolios.limite_peso`); API `radar`, `escenarios`, `portfolios/:id/limite`, `datos`. Propiedad comprobada en **cada** consulta (`WHERE usuario_id = ?`).
- **Visitantes:** exploración y simulación temporales y rotuladas; radar solo en este dispositivo y **migrado al iniciar sesión**; los escenarios requieren cuenta y no se dice «guardado» sin persistencia real.
- **Demo reconstruida** (módulos concatenados; el mock implementa radar, escenarios y límite en memoria; origen «demostración»).
- **Documentación:** `CALCULOS.md` (fórmulas, redondeo, límites), `DATOS.md` (auditoría), `EDITORIAL.md` (diseño de la fase editorial, sin construirla), `PLAN-POR-FASES.md`, `pruebas-manuales.md`.

## 3. Explicación de cálculos y límites
Ver `ronda13/CALCULOS.md`. En resumen: décimas enteras, reparto por mayor resto (empate por símbolo), una cartera incompleta **no se normaliza**, lo liberado al bajar un peso queda sin asignar, nunca pesos negativos, el servidor **recalcula** y rechaza una propuesta distinta. No hay riesgo, puntuaciones, países/divisas, solapamientos, rentabilidades esperadas, costes ni impuestos.

## 4. Pruebas realmente ejecutadas
`bash tests/run-all.sh` completo con servidor limpio entre baterías: **467 comprobaciones correctas, 0 fallos, código de salida 0** (unidad 96 incl. 23 de cálculos y 30 de servidor de la ronda 13; zip 8; navegador A 31, B 51, C 50, D 29, E 15, F 9, G 3, H 25, I 16, J 53, **K 75 nuevas**; API 8; seguridad 6; demo OK con el recorrido radar → laboratorio → escenario).
**Un intento previo falló por tiempo:** en una pasada anterior `testE` agotó el límite de 900 s (resultado conservado en `ronda13/resultado-ejecucion-intento1-testE-agotado.txt`). En solitario `testE` tarda 22 s y pasó 15/15; las dos pasadas siguientes pasaron. **Causa no identificada** (no reproducible); lo dejo declarado.
`testK` cubre en 320/390/1440: radiografía guardada y local, cartera incompleta sin reescalar, límite y su persistencia, ficha (figura/no figura directamente), radar con teclado y nota, filtro «Solo mi radar», seguimiento, laboratorio (método antes, ejemplo 54/36/10, comparación, inviable), guardar sin tocar la cartera, reabrir tras cambiar la cartera, estado y nota, descartar, texto ampliado simulado, y sin errores de JS; además fallo de red con reintento sin duplicar, aislamiento entre dos usuarios por HTTP (404 / 401), visitante, migración del radar al entrar, filtros y origen de los datos.
**Revisión visual de capturas** (laboratorio, radiografía, ficha, seguimiento, Explorar en escritorio y móvil) corrigió: «Mi seguimiento» duplicado en el menú, la tabla antes/después cortada a 320 px, desbordes con texto ampliado (fieldsets, filtros, menú), y un clic perdido en la radiografía por repintado.
**Pruebas antiguas adaptadas** (cambio intencionado, no regresión): `testB` (menú móvil con 4 enlaces; la ficha declara el origen «PRUEBA ficticios» en lugar de «Fuente: informes anuales… SEC»), y `unit-migracion` (M1b, M6: migración 0008 encadenada y rechazada sobre el esquema nuevo). `testH` H4 sigue exigiendo ≤ 2 desplegables en el resumen: la radiografía no añade ninguno.

## 5. Limitaciones y bloqueos (no ejecutado)
- **Sin validar:** Cloudflare D1 remoto, `UPDATE … RETURNING`/`batch` y migración 0008 en una D1 real, correo real, carga real de la SEC (todo en `ronda10/BLOQUEOS.md`; faltan accesos; no se piden secretos). Los datos de las capturas son **inventados**: no acreditan la calidad ni la actualización de datos financieros.
- Navegadores reales, lector de pantalla, zoom real, tema oscuro de las pantallas nuevas: `ronda13/pruebas-manuales.md` (M41–M49; también M1–M40 anteriores). El texto ampliado es simulado.
- El laboratorio parte siempre de la versión **guardada**; un visitante no puede guardar escenarios (la simulación es temporal); el límite personal exige cartera guardada; no se comparan dos escenarios entre sí ni se rehacen con la nueva versión de la cartera (fase 15).
- La nota del radar es «la última escritura gana» (sin revisión); los escenarios sí usan revisión.
- `window.confirm` nativo al descartar un escenario (sin diálogo propio).
- La edición de una cartera pública no se ha rediseñado; las pantallas de la ronda 12 y la portada siguen como estaban salvo el menú.

## 6. Plan por fases y nueva visión
`ronda13/PLAN-POR-FASES.md` (datos reales y confianza → radar/laboratorio más profundos → fondos → editorial → simulaciones monetarias → plan de pago reservado) y `ronda13/EDITORIAL.md`.

## 7. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-03 23:44 UTC
Código: commit fde8fee66c1d6b295042f5dccedef6f1843f6334; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 8 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
=== unit-calculos ===
RESULTADO: 23 correctas, 0 fallos
=== unit-r13 ===
RESULTADO: 30 correctas, 0 fallos
=== test-zip ===
RESULTADO: 8 correctas, 0 fallos
=== testA ===
RESULTADO: 31 correctas, 0 fallos
=== testB ===
RESULTADO: 51 correctas, 0 fallos
=== testC ===
RESULTADO: 50 correctas, 0 fallos
=== testD ===
RESULTADO: 29 correctas, 0 fallos
=== testE ===
RESULTADO: 15 correctas, 0 fallos
=== testF ===
RESULTADO: 9 correctas, 0 fallos
=== testG ===
RESULTADO: 3 correctas, 0 fallos
=== verificar-api ===
RESULTADO: 8 correctas, 0 fallos
=== testH ===
RESULTADO: 25 correctas, 0 fallos
=== testI ===
RESULTADO: 16 correctas, 0 fallos
=== testJ ===
RESULTADO: 53 correctas, 0 fallos
=== testK ===
RESULTADO: 75 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```

# Ronda 16: nota protegida y corregida, seguimiento con vínculo estable y dos salidas de la nota demostrables en el móvil

Parte de la ronda 15. Orden del encargo (C13 en `procesos-klever/06-`): **1)** proteger las notas guardadas; **2)** corregir la puntuación antes de calibrarla; **3)** mantener el seguimiento cuando cambia la redacción; **4)** hacer demostrables las dos salidas de la nota en el móvil.

> **Código de la última pasada completa: commit `c372d49`** (árbol limpio al ejecutar; después solo cambió la documentación). Resultado literal al final. Antes/después: `ronda16/ANTES-Y-DESPUES.md`. Entradas y salidas de la nota: `ronda16/TABLA-NOTA.md`. Abrir en el móvil: `ronda16/ABRIR-EN-MOVIL.md`.

## 1. Notas de escenarios guardados (marcado)
- **Antes:** `POST` con marcado en el campo `nota` de la evaluación → 201 y el marcador volvía en la lectura; una fila antigua equivalente salía en la lista. **Después:** `validarResumen` (módulo puro `nota.js`) exige versión, fecha real, `publicada` booleano, nota numérica finita de 1 a 10 con un decimal (o `null` si está pendiente), cobertura (≥ 90 si está publicada), cinco bloques conocidos con puntuación 1–10 o `null`, fortaleza y limitación conocidas, texto sin marcado y ningún campo extra. Se rechaza con **400** y lo que se guarda es una **copia reconstruida** campo a campo.
- **Lectura:** se revalida al leer; una fila antigua manipulada o con JSON corrupto sale **sin contenido** (`evaluacion: null`, `evaluacion_invalida`). La interfaz la vuelve a validar y pinta solo números y fechas formateados y texto escapado.
- **«Si el servidor no puede verificar la evaluación, trátala como tal»:** el servidor comprueba la **forma**, no recalcula (el universo de entonces ya no existe); la respuesta lleva `evaluacion_verificada: false` y la pantalla dice «Registro de la nota de estructura que viste… el servidor comprobó su formato, no la recalculó, y tampoco se recalcula».

## 2. Puntuación (umbrales y pesos de la v1 sin cambiar)
- **Ausente ≠ cero ≠ negativo.** Un EBITDA ausente deja ese indicador **pendiente**; cero o negativo con deuda positiva es un hecho (1 punto). Antes: **3,5/10 con cobertura 100 %** en el caso del encargo; ahora, nota pendiente.
- **Liquidez:** exige las **60 sesiones**, y la capitalización y el importe, **moneda, fuente y fecha**. Moneda y fuente de referencia = las más frecuentes del universo; una empresa distinta, o un empate, deja su tamaño pendiente con el motivo. `/api/universo` ahora transmite moneda, fuente y fecha de mercado por empresa.
- **Cobertura por indicador** (no por bloque conjunto): tamaño (capitalización, liquidez), deuda (deuda neta/EBITDA, caja libre), rentabilidad (ROIC, años con beneficio, años con ventas al alza). El bloque se publica si **cada indicador** conserva el 90 %; con datos ausentes en posiciones distintas se publica; con 89,9 % en un indicador no, y el motivo cita el indicador.
- **Origen:** el conjunto se declara `sintetico` solo si **todas** las filas con fuente son de prueba/demo; con datos reales, mixtos o sin origen la nota **no se publica** hasta una habilitación explícita posterior a la calibración (`habilitada` no la concede ningún dato; hoy siempre `false`).

## 3. Seguimiento con vínculo estable
- Migración **0011**: `escenarios.pregunta_ref` («historia:n»). La pregunta del escenario pasa a ser la **formulación personal**; el vínculo con la cuestión editorial es el identificador. Solo se migran las coincidencias **inequívocas** (misma historia y texto idéntico).
- Casilla «Sigo la pregunta de la historia» al guardar y al editar. Estados de la tarjeta: **responde**, **sigue pendiente** (vinculada), **pregunta distinta** (con «Ver revisión de la historia» y aclarando que la suya sigue pendiente) y **sin historia**. Desaparece «Sin novedades» cuando hay una revisión de esa historia. Se mantienen el ejemplo de ambos contratos, la fecha, la fuente y la etiqueta del futuro plan de pago.
- Probado: texto original, reformulación y pregunta nueva con la misma empresa; guardar, **cerrar sesión, volver con la misma cuenta** y **otra cuenta** (no ve nada).

## 4. Dos salidas de la nota en el móvil
- **Ejemplo calculado** (KO 60 % / PG 40 %): nota 4,4, fecha «4 nov 2026» y «Coca-Cola (KO) pesa el 60 % de la cartera: el reparto equivale a 1,9 empresas del mismo tamaño…». Para que haya ≥ 20 comparables en «Consumo básico» se añadieron a la **semilla y a la demo** 20 empresas **ficticias** (`EJBA…EJBT`, rotuladas «empresa ficticia»); **no están en el universo real**.
- **Ejemplo incompleto** (KO 50 % / JPM 50 %), con un enlace «Ver un ejemplo con datos incompletos»: «Nota pendiente. Podemos medir «empresas», «sectores y actividades» y «tamaño y liquidez». Faltan datos para valorar «deuda y caja» y «rentabilidad y crecimiento». Causa principal: JPM (50 % de la cartera): sector sin metodología…». Corregidos «Nota pendiente. Nota pendiente» y «observados el fecha no disponible».
- **Comparador:** la última ratio va **en veces**, con «deuda neta (deuda menos caja) dividida entre el EBITDA… 2,0 veces = dos años de EBITDA. No es un plazo de devolución».
- **Laboratorio:** primero «Cuánto espacio ocuparía» y «Quién cede el peso», después las barras y debajo el desarrollo.

## 5. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** unidad con `unit-nota` **35** (N20–N25 nuevas), **`unit-escenarios16` 11** (nuevo), `unit-migracion` **14** (0011), `unit-comparador` 9, `unit-almacen` 9 y el resto de rondas anteriores.
**Navegador (Chromium, servidor local):** `testO` **14** (nuevo: dos notas en 320/390, comparador, laboratorio, seguimiento con tres casos, cierre de sesión, otra cuenta, nota manipulada servida por un servidor «antiguo») y las baterías anteriores; demo OK.
**Total de la pasada completa: 659 comprobaciones correctas, 0 fallos, código 0** (30 baterías + demo).
**Entorno remoto:** nada ejecutado.
**Primera pasada, conservada:** `ronda16/resultado-ejecucion-intento1.txt`: un problema, `testB`, por el **recuento de empresas** (106 → 126 al añadir las 20 ficticias a la semilla). Se corrigieron también los recuentos de `testJ` y `testK`. Se repitió la pasada completa.
**Pruebas antiguas adaptadas:** `unit-nota` (los universos declaran origen y mercado con procedencia), `unit-migracion` (M1d sin `escenarios`, M1e y M9 nuevas), `testN` (N7: «Sigue pendiente»; N8: nuevo texto del registro).

## 6. Límites y pendiente
- **No probado:** exposición entre cuentas de una nota manipulada (se prueba que no se acepta, no se entrega y no se pinta), D1 remoto y migraciones 0008–0011, correo real, carga SEC real, datos de mercado reales (capitalización, 60 sesiones, moneda, fuente, fecha), móvil físico, Safari/Firefox, lector de pantalla, tema oscuro.
- **La prueba con cinco principiantes NO se ha realizado** (`ronda16/PRUEBA-CON-USUARIOS.md`, con los tres criterios nuevos: de dónde sale el 10 %, qué mide la nota, qué contrato se firmó). **La demo autónoma pierde sus datos al recargar:** sirve para la primera visita y el ejemplo de regreso; «mañana, cierra y vuelve» exige un entorno privado con persistencia verificada (**pendiente**). La disposición a pagar sigue siendo una hipótesis.
- **Honestidad:** la nota solo existe con datos sintéticos rotulados; los umbrales (15 empresas efectivas, 6 sectores, 10 actividades, 20 comparables, 60 sesiones, 90 %) son **provisionales**. Las 20 empresas ficticias alteran los percentiles del sector «Consumo básico» **solo en la semilla y la demo**.
- **Pendientes de ChatGPT:** revisión de cálculos y casos límite de esta ronda.

## 7. Capturas (`ronda16/capturas/`, 320 y 390 px)
`C10-nota-calculada` · `C11-nota-pendiente` (con su motivo) · `C12-pregunta-editada` (tres casos tras editar la pregunta) · `C13-comparacion-pesos` (laboratorio con pesos antes y después).

## 8. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-04 18:19 UTC
Código: commit 725741479b0a08e8cbcec5245103230a5a6cf122; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 14 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
=== unit-calculos ===
RESULTADO: 23 correctas, 0 fallos
=== unit-r13 ===
RESULTADO: 30 correctas, 0 fallos
=== unit-carga ===
RESULTADO: 18 correctas, 0 fallos
=== unit-r14 ===
RESULTADO: 14 correctas, 0 fallos
=== unit-nota ===
RESULTADO: 35 correctas, 0 fallos
=== unit-comparador ===
RESULTADO: 9 correctas, 0 fallos
=== unit-almacen ===
RESULTADO: 9 correctas, 0 fallos
=== unit-escenarios16 ===
RESULTADO: 11 correctas, 0 fallos
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
=== testL ===
RESULTADO: 28 correctas, 0 fallos
=== testM ===
RESULTADO: 7 correctas, 0 fallos
=== testN ===
RESULTADO: 41 correctas, 0 fallos
=== testO ===
RESULTADO: 14 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```

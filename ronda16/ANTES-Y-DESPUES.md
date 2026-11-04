# Ronda 16 · Antes y después de los tres fallos

Mismo guion ejecutado contra **la ronda 15** (commit `8dc5003`, en un árbol de trabajo aparte) y contra el código actual: `node tests/ronda16/antes-despues-r16.mjs <raíz>`. Resultado literal en `ronda16/antes-despues-resultado.txt`. Son pruebas de **módulo y servidor sobre SQLite real**, no de navegador ni de entorno remoto.

| Fallo | ANTES (ronda 15) | DESPUÉS (ronda 16) |
|---|---|---|
| **1. Nota guardada con marcado.** Un marcador HTML dentro del campo `nota` de la evaluación | `POST` → **201**; la lectura **devuelve el marcador**; una fila antigua equivalente sale en la lista | `POST` → **400**; no se guarda nada; una fila antigua equivalente se entrega **sin contenido** (`evaluacion: null`, `evaluacion_invalida`) y la interfaz, además, la vuelve a validar |
| **2. EBITDA ausente.** Una posición al 100 %, EBITDA ausente, una sola sesión de negociación | **3,5 / 10 con cobertura 100 %** (el dato ausente contaba como EBITDA ≤ 0 y la liquidez no miraba las sesiones) | **Nota pendiente**, cobertura de deuda 0 %; ausente, cero y negativo son tres entradas distintas |
| **3. Vínculo de la pregunta.** Escenario con la pregunta de la historia | Texto exacto → responde; **un espacio de más → «sin vínculo»**; reformulación → «sin vínculo» | Vínculo por **identificador estable** (`hidrogeno-norte:1`): exacto, espacio de más y reformulación → responde |

## Pruebas que lo demuestran (todas locales)
- `unit-escenarios16` (11): 18 evaluaciones malas rechazadas (marcado en motivo, nota, versión, fecha o bloque; números fuera de rango; fecha inexistente; cobertura insuficiente; campos extra); una válida se guarda y se reabre con la misma cifra, fecha, cobertura y versión; fila antigua manipulada y JSON corrupto sin contenido; tres casos con la misma empresa; editar la pregunta; vínculo ajeno o mal formado; **cerrar sesión, volver con la misma cuenta y mirar con otra** (la otra ve 0 escenarios, 404 al abrir y al editar).
- `unit-nota` (35, ampliada con N20–N25): EBITDA ausente / cero / negativo; 59 frente a 60 sesiones; otra moneda, otra fuente o sin fecha; datos ausentes en posiciones distintas con 90 % por indicador (publica) y 89,9 % (no publica); origen sintético frente a real o sin origen; guardar y reabrir.
- `unit-migracion` (14): la migración 0011 solo vincula la coincidencia inequívoca.
- `testO` (14, navegador, 320/390): las dos notas en el móvil, el comparador, el laboratorio, el seguimiento con tres casos, cierre de sesión, otra cuenta y una nota guardada manipulada servida por un servidor «antiguo» (no se crea ninguna etiqueta y no se ejecuta nada).

## Qué no demuestra
- No hay una prueba de **exposición entre cuentas** de una nota manipulada: lo que se prueba es que no se acepta, que no se entrega y que la interfaz no la pinta.
- «Antes» se ejecutó contra el código de la ronda 15 solo en módulo/servidor; en navegador no se repitió la carga de la nota manipulada contra el código antiguo.

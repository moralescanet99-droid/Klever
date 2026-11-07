# Ronda 29 · Fase 2.5: atraer y hacer volver (arranque guiado, huella, «Tu semana» y retos)

**Encargo (Javier, 2026-11-07, C33–C34):** «no termino de ver una web superior, le faltan muchas cosas para atraer y retener» → «Hazlo» (la fase 2.5 propuesta). Retoma el punto 14 sin cuentas externas.

## Qué se ha hecho (implementado)
| Pieza | Qué hace |
|---|---|
| **Arranque guiado** (`#empezar`) | El botón principal de la portada pasa a **«Empieza en 1 minuto»**: dos preguntas (qué te interesa: crecer, dividendos, oro o «aún no lo sé»; y si ya tienes cartera). Con «todavía no», abre la **cartera de ejemplo** que corresponde (una plantilla rotulada como ejemplo, no una recomendación) **ya en la revisión**, con su primera señal y los tres indicadores. Con «sí», el editor vacío con el buscador listo para escribir o pegar «KO 40, PG 60». «Prefiero empezar de cero» sigue disponible. Klever no elige empresas según las respuestas. |
| **Huella de empresa** (`public/js/huella.js`, puro) | Pentágono con las cinco comprobaciones: superada en el borde, no superada al 40 %, sin datos en el centro con un punto hueco (un dato que falta no es un suspenso). Pequeña en cada fila de Explorar y grande en la ficha, con texto accesible. |
| **«Tu semana»** (Mis carteras) | La señal principal de cada cartera, las ideas que tocan en los próximos 7 días (y cuántas hoy) y **«Desde tu última visita»**: qué señales se han resuelto o han aparecido desde el día anterior en que entraste (cambios tuyos, no del mercado; la instantánea vive solo en tu dispositivo y se borra al salir). |
| **Retos de aprendizaje** (`public/js/semana.js`, puro) | Cinco retos con barra de avance: que ninguna posición pase de tu umbral, repartir en 5 categorías, guardar una idea comparando, seguir 3 empresas y revisar una idea. Cada uno con su pista y enlace. **Nunca miden rentabilidad.** Si no se pueden leer tus ideas, esos retos dicen «sin datos» (ni conseguidos ni suspendidos). |

## Qué se ha probado
- **`tests/ronda29/unit-semana29.mjs` (12):** geometría de la huella (borde / 40 % / centro), SVG accesible o decorativo y con comillas escapadas; retos (ninguno, todos, «sin datos», sin carteras, umbrales propios); resumen (ideas de 7 días sin contar descartadas, señal principal, cambios desde una instantánea de otro día, una del mismo día no cuenta). Un dato de prueba mal elegido (Tecnología seguía en el 40 %) se corrigió en la prueba.
- **`tests/ronda29/testAA.cjs` (15, servidor real, 1440/390/320):** arranque guiado completo, «ya tengo cartera» y «de cero», huella en lista y ficha, «Tu semana» con retos y «desde tu última visita», sin errores ni desbordes.
- **Regresión encontrada y corregida en código:** la huella hacía las filas de Explorar de 98 px (límite 96 en `testB`) → huella de 30 px en la tabla.
- **Regresión de PRIVACIDAD encontrada por la pasada completa y corregida en código:** la primera pasada (`8e22582`) dio 1114/7: `testL` L1–L3 y `testM` M1, M2 y M5 detectaron que, tras cerrar sesión (o caducar, o con una respuesta tardía), el nombre de la cartera seguía en la página dentro de «Tu semana». Corrección: «Tu semana» se vacía y se oculta en `limpiarPrivado()` y no se pinta si la respuesta llega después de salir. Las mismas pruebas, sin la corrección, fallan (lo demostró esa pasada).
- **Pruebas adaptadas a propósito (se declara):** el botón principal de la portada dice ahora «Empieza en 1 minuto» y abre el arranque guiado: `testN` N2, `testP` P7a y `testX` X1 (que ahora llega al editor vacío por «Prefiero empezar de cero»). En `testAA`, la exigencia de foco en la primera opción se retiró: el patrón de la app al cambiar de vista lleva el foco al contenido.

## Sin comprobar
Personas (¿el arranque engancha?, ¿vuelven por «Tu semana»?, ¿los retos motivan o molestan?), teléfono real, lector de pantalla con la huella. **Sigue faltando lo que más retiene y no depende de mí:** datos reales (SEC, fase 4), correo para el resumen semanal (Brevo) y la decisión sobre precios históricos.

## Resultado de la pasada completa
*(pendiente)*

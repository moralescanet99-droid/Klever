# Ronda 33 · Fase 1 (cimientos), primera parte

**Encargo:** hoja de ruta de C43 (`PLAN.md`) y «Sí» de Javier (C44) para empezar por la fase 1: reordenar el código, un sistema de diseño, pruebas rápidas y medición.

## Qué se ha hecho
| Pieza | Estado | Qué |
|---|---|---|
| **Pruebas en paralelo** | ✅ | `tests/run-all.sh` ejecuta las baterías de navegador con `PARALELO=3` trabajadores (cada uno con su servidor en el puerto 8800+k y su base limpia por batería; cola común con cerrojo portable; resultados evaluados después y en el orden de siempre). **Pasada completa: de ≈ 22 a ≈ 11–15 minutos.** `PARALELO=1` vuelve al modo anterior; `test-ejecutor.sh` lo fija para seguir probando el modo secuencial. |
| **Hoja de estilo única** | ✅ | `public/klever.css` sustituye a las cinco hojas (concatenadas en su orden de carga: cascada idéntica). Sus **cuatro bloques de tokens que se pisaban** se fusionan en uno al principio, con los valores que realmente se aplicaban (65 tokens agrupados). `legal.html` también la usa. La demo la lee. |
| **Sistema de diseño documentado** | ✅ | `DESIGN.md`: identidad, tokens, componentes, reglas de uso y la deuda que queda. |
| **Embudo anónimo** | ✅ | `POST /api/evento` suma 1 a un contador por día y evento (`eventos_dia`, migración 0014): visita (una por dispositivo y día), vuelve a los 7 días, cuenta iniciada, cartera creada, idea guardada. **Sin cuenta, IP, dispositivo ni hora.** Consulta en `scripts/metrics.sql`; explicado en la página de privacidad. La demo no cuenta nada. |
| **Código por pantallas** | 🟡 empezado | Las utilidades comunes (almacenamiento, selectores, escape y formatos) salen de `app.js` a `public/js/base.js`. **Falta** separar cada pantalla (Explorar, Mis carteras, editor) en su módulo. |
| **Paso de construcción (Vite)** | ⬜ | Aplazado a la fase 6 (publicar): solo aporta al desplegar y cambiaría cómo se sirven las pruebas. |
| **Comparación visual de capturas** | ⬜ | Pendiente: sustituirá a parte de las medidas de píxeles a mano. |

## Qué se ha probado
- `tests/ronda33/unit-fase1.mjs` (9): el embudo suma por día y evento sin sesión; rechaza eventos fuera de la lista; la tabla no tiene datos personales; error claro si falla la base; la migración 0014 es idempotente; una sola hoja; un solo bloque de tokens; existe DESIGN.md.
- `tests/ronda33/testAD.cjs` (3): una sola «visita» al día por dispositivo (y nada más en el envío); «vuelve_7d» cuando la primera visita fue hace 8 días; la hoja única aplica sus tokens (fondo carbón, fuente propia).
- **Pasada completa en paralelo sobre `27a51f4`: 1205 correctas, 2 fallos**, los dos en `testD` E10a, que aún exigía la disposición antigua de las tarjetas de Explorar (nombre y resultado en la misma línea), la que se rompía en el móvil de Javier (ronda 32). **Adaptación declarada:** E10a exige ahora el nombre en su propia línea (≥ 200 px) con el resultado debajo. testD en solitario: 29/0.
- **Dos fallos del propio ejecutor encontrados al pasar a paralelo y corregidos:** (1) una carrera al detener el vigilante de tiempo podía marcar un falso «tiempo agotado» (testY terminó con código 0 y salió como agotado); (2) al arrancar tres servidores a la vez, uno podía no estar listo a tiempo (testB no se ejecutó). Ahora: el vigilante solo marca si la batería sigue viva; arranques escalonados (8 s) y un reintento de arranque declarado. `test-ejecutor.sh` (18 casos, modo secuencial): 18/0.
- **Pasada completa final (`ad1989b`, árbol limpio, 2026-11-08 13:30 UTC, local, PARALELO=3): 1206 correctas, 0 fallos, código de salida 0** (63 baterías con resultado), en **15 minutos** (antes ≈ 22). Registro en `resultado-ejecucion.txt` y `logs/`.

## Qué falta de la fase 1
1. Separar cada pantalla en su módulo (Explorar, Mis carteras y «Tu semana», editor, ficha).
2. Comparación visual de capturas (pocas pantallas clave a 390 y 1440 px).
3. Limpiar las reglas de CSS que se pisan: se hará pantalla a pantalla en la fase 2, cuando se rehagan.
4. Vite: en la fase 6.

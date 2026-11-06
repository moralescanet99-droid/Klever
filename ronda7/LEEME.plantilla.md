# Ronda 7: fiabilidad del guardado y entrega reproducible

No hay rediseño ni funciones nuevas. Se corrige la contradicción del conflicto, se elimina el guardado parcial, se sustituye la fecha por una revisión atómica, se corrige la prueba de visibilidad E16a, se termina el diálogo móvil y se entrega un proyecto que se puede repetir desde cero (`LEEME-PRUEBAS.md`).

> Informe generado con `tests/ronda7/informe7.py` a partir de lo **observado** en `ronda7/resultado-ejecucion.txt` y `ronda7/evidencias-*.json`. **Código con el que se obtuvo el resultado: commit `{{COMMIT}}`** ({{ARBOL}}). Las capturas de esta ronda están en el repositorio (`ronda7/evidencias/`); las de las rondas 5 y 6 **no** están (ver `ronda7/EVIDENCIAS.md`).

## 1. Defectos: confirmados en el servidor real frente a observados solo en la demo

| Defecto | Servidor real | Solo demo |
|---|---|---|
| **Guardado parcial:** el cliente enviaba `PUT` (posiciones) y después `PATCH` (nombre y tesis) | **Confirmado** (`ronda7/antes-defectos.txt`, ejecutado contra el servidor local antes de corregir): con el `PATCH` fallido, en una cartera **pública** las posiciones nuevas quedaron **guardadas y publicadas** mientras nombre y tesis conservaban los valores antiguos, y la interfaz decía «No se pudo guardar» aunque la cuenta ya había cambiado | La demo copiaba el mismo comportamiento (mismo cliente) |
| **Versión con resolución de un segundo:** la comprobación de conflicto usaba `actualizado_en` | **Confirmado**: dos `PUT` seguidos con la misma versión de un segundo devolvieron 200 y 200 (el segundo debía rechazarse) | — |
| **Comprobación y escritura no atómicas:** la versión se leía antes y se escribía después en pasos separados | **Defecto de diseño confirmado por lectura del código**; en el servidor local no se logró reproducir la carrera (las peticiones simultáneas dieron 200 + 409). Por eso se prueba de forma determinista inyectando una escritura ajena entre la lectura y la escritura (U3) | — |
| **Contradicción del conflicto:** el texto decía «solo la guarda cuando pulses Guardar» pero `resolverConflictoGuardado()` llamaba a `guardar()` | **Confirmado** (es código del cliente, igual en servidor real y demo) | Igual |
| **Guion de desconexión:** el modo sin conexión del navegador no afecta a las peticiones simuladas en memoria | No aplica (el servidor real sí falla sin conexión: prueba G5) | **Solo demo**: se añade una casilla «Simular fallo de red al guardar», explícita e identificada |

## 2. Qué se ha corregido

- **Conflicto coherente (punto 1).** «Conservar la de este dispositivo» **vuelve al editor sin escribir en la cuenta** (se comprueba que la cuenta queda idéntica, revisión incluida) y hay que pulsar Guardar. Es igual al abrir y al guardar. «Decidir después» y Escape posponen: no eligen copia, no descartan datos y no escriben.
- **Guardado en una sola operación transaccional (punto 2).** `PUT /api/portfolios/:id` recibe posiciones, nombre, tesis y la **revisión** desde la que se edita. Todo va en **un lote de D1** (transacción). La escritura está condicionada a esa revisión **dentro del propio `UPDATE`**, y las posiciones solo se tocan si esa misma escritura ganó (marca única por escritura): dos guardados con la misma revisión → solo uno gana, el otro recibe 409 y no escribe nada; si algo falla a mitad, el lote se revierte entero. `POST` también es atómico (cartera + posiciones + tesis), y `PATCH` (publicar/despublicar) exige y sube la revisión. La **revisión** (entero) sube en cada escritura; la fecha `actualizado_en` queda solo para mostrar. Migración `0007_revision.sql`.
- **E16a corregida (punto 3).** La prueba anterior daba por buena una última posición con el borde inferior en −1979 px. Ahora se desplaza y enfoca el campo y se exige que sus límites estén dentro de la ventana y por encima de la barra fija, y que se pueda escribir (G6). Sigue siendo **ampliación de texto simulada**: el zoom real y el teclado móvil real están como pruebas manuales separadas (M17, M18).
- **Diálogo móvil (punto 5).** Cabecera fija con «Decidir después», cuerpo con desplazamiento propio y pie fijo con las dos decisiones; probado a 320×568 con texto al 200 % simulado y muchas diferencias (G7).
- **Entrega reproducible (punto 4).** `package.json` + `package-lock.json`, `scripts/local/{arrancar,servidor}.sh`, `tests/run-all.sh` sin rutas absolutas, `data/seed-prueba.sql` regenerable, y un `LEEME-PRUEBAS.md` con los comandos exactos. La demo se identifica como **demostración sin persistencia de cuenta** y su guion de desconexión usa una casilla de simulación explícita.

## 3. Resultado de la ejecución (literal)

```
{{RESULTADO}}
```

Se obtuvo en un **clon nuevo** del commit indicado (`git clone`, `npm ci`, `bash tests/run-all.sh`). Dos ejecuciones limpias anteriores sirvieron para corregir fallos del propio script de ejecución (avisos de wrangler en el resultado y un servidor de la demo sin parar); esta es la tercera y es la que se entrega. **Nota sobre la demo:** `demo/index.html` se reconstruyó después de esa ejecución (un último ajuste de foco y CSS del diálogo) y se volvió a probar: `ronda7/resultado-demo-reconstruida.txt`.

## 4. Evidencia por escenario

**Servidor real sobre SQLite (U): atomicidad y revisión**

{{TABLA_U}}

**Batería F: guardado fiable, conflicto, E16a, diálogo móvil, desconexión real**

{{TABLA_F}}

**Regresión: baterías de rondas anteriores con los textos y reglas vigentes** (escenarios E de la ronda 6 y D de la ronda 5):

{{TABLA_E}}

{{TABLA_D}}

## 5. Limitaciones y pruebas manuales pendientes

- **Ninguna prueba manual se ha ejecutado** (`ronda7/pruebas-manuales.md`, M1–M21): teclado móvil real, zoom real, lector de pantalla, Safari y Firefox, email real, dos dispositivos reales, D1 real de Cloudflare y migración 0007 con datos.
- La atomicidad se ha probado con SQLite real y con D1 local simulada (Miniflare); no con Cloudflare D1 real. Se asume que `D1.batch()` es transaccional, como documenta Cloudflare.
- «Otro dispositivo» en las pruebas es una petición directa a la API con la misma cuenta, o un contexto de navegador aparte; no hay dos equipos reales.
- Las copias locales de cambios creadas por versiones anteriores del cliente llevan la marca de versión antigua y se tratarán como conflicto al abrir (solo afecta a copias previas a esta ronda).
- Con un nombre de 80 caracteres en móvil el título sigue necesitando tres líneas y se desplaza dentro del campo.

## 6. Antes de desplegar
Aplicar `migrations/0007_revision.sql` (además de `0002`–`0006` si faltan). Los clientes anteriores a esta ronda dejan de poder guardar (el servidor exige `revision`).

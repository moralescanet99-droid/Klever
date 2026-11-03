# Ronda 8: carreras de lectura y respuesta, ejecutor fiable y migración verificada

Ronda acotada a la revisión técnica de ChatGPT sobre la ronda 7 (`procesos-klever/06-` C5). No hay rediseño ni funciones nuevas.

> Informe generado con `tests/ronda8/informe8.py` a partir de `ronda8/resultado-ejecucion.txt` y `ronda8/evidencias-*.json`. **Código con el que se obtuvo el resultado: commit `{{COMMIT}}`** ({{ARBOL}}); etiqueta fija `ronda-8`. Las capturas de esta ronda están en el repositorio; el índice de presentes y ausentes de todas las rondas, en `ronda8/EVIDENCIAS.md`.

## 1. Qué afirmo ahora (y qué no)

**Afirmación vigente:** el guardado es transaccional, la revisión que recibe cada cliente es la de su propia escritura, las lecturas son instantáneas coherentes y los errores internos no se confunden con validación; todo ello **supera los escenarios comprobados en local** (D1 simulada con Miniflare y SQLite real).

**No afirmo:** fiabilidad completa entre dispositivos reales ni en producción. **Cloudflare D1 remoto no se ha probado**; tampoco una migración con datos reales, ni dispositivos físicos. La ronda 7 afirmaba más de lo que sus pruebas cubrían: ChatGPT reprodujo dos carreras que no estaban cubiertas.

## 2. Defectos de ChatGPT: falla antes, pasa después

| # | Defecto | Prueba | Antes (código de la ronda 7) | Después |
|---|---|---|---|---|
| 1 | **Crítico.** La revisión devuelta se leía *después* del lote con una lectura independiente: A podía recibir la revisión de B y, al guardar de nuevo con ella, sobrescribir a B con 200 | R1 (PUT), R2 (PATCH) | **Fallan** (`ronda8/antes-pruebas.txt`): revisión devuelta 2 en lugar de 1; el siguiente guardado dio 200 y quedó «A2» encima de B | Pasan: cada respuesta lleva la revisión y la fecha de **su** escritura (`UPDATE … RETURNING` dentro de la transacción); el siguiente guardado obsoleto recibe 409 |
| 2 | **Importante.** `GET` leía la cartera y después sus posiciones: podía devolver nombre y revisión antiguos con posiciones nuevas | R3 | **Falla**: «Prueba», revisión 0 con posiciones `NEM:100` | Pasa: cartera y posiciones se leen en **un solo lote** (una instantánea) |
| 3 | **Importante.** `run-all.sh` terminaba con éxito aunque fallaran baterías | `test-ejecutor.sh` E1–E5 | **Falla** (`ronda8/antes-ejecutor.txt`): con una batería que informa «1 fallos», el ejecutor antiguo salió con código 0 | Pasa: código de salida agregado (≠ 0 ante fallo de arranque, timeout, resultado ausente, código ≠ 0 o «N fallos»), `trap` de limpieza |
| 4 | **Importante.** Requisitos: Node 20 declarado pero `node:sqlite` exige 22.13; `timeout` y `setsid` no existen en macOS | Revisión + E4/E5 | Declaraba `>=20` y usaba `timeout`/`setsid` | `engines >=22.13`, `.nvmrc`, el ejecutor se niega con Node menor; límites de tiempo y parada de procesos propios (sin `timeout`/`setsid`); etiqueta `ronda-8` |
| 5 | **Menor.** Todo error del lote devolvía 400 «ticker desconocido» | R4a, R4b, R5 | **Fallan** (R4a, R5): HTTP 400 con ese mensaje ante un fallo de infraestructura | Pasan: validación previa de tickers → 400; error interno → 500 «Inténtalo de nuevo» con el detalle en el registro del servidor |
| — | **Prueba 4 de ChatGPT:** `guardar()` usaba `current` (global) tras el `await` | H1 (guardado), H2 (publicación) | **Fallan** (`ronda8/antes-pruebas-cliente.txt`): al abrir B durante el guardado de A, B pasaba a «Guardando…», luego «pendiente» con Guardar inactivo; al publicar, B aparecía «Pública» y acababa en un conflicto falso | Pasan: cada operación queda atada a la cartera que la inició; la respuesta tardía no toca el editor, la revisión ni la copia local de otra |

## 3. Migración 0007 sobre una base antigua con datos (`unit-migracion.mjs`)

Esquema anterior a la ronda 7 (fixture del commit `aa21407`) con 2 carteras (una pública) y 4 posiciones: tras aplicar `0007_revision.sql` quedan intactas campo a campo, con revisión 0; la tabla resultante es idéntica a la de `schema.sql` nuevo; se puede leer y guardar; y **aplicarla sobre el esquema nuevo falla con «duplicate column»** (por eso solo se aplica a bases anteriores). Es SQLite real, no D1 remoto con datos reales.

## 4. Resultado de la ejecución (literal)

```
{{RESULTADO}}
```

Se obtuvo en un clon nuevo del commit indicado (`git clone`, `npm ci`, `bash tests/run-all.sh`). El ejecutor termina con código 0 solo si todo pasa. La prueba del propio ejecutor (fallos, caídas, timeouts y puerto ocupado deliberados) está en `ronda8/resultado-ejecutor.txt` (9/9, también desde un clon limpio). El ejecutor antiguo, con la misma batería defectuosa, salía con código 0: `ronda8/antes-ejecutor.txt`.

## 5. Evidencia por escenario

**Carreras de lectura y respuesta, errores internos (R):**

{{TABLA_R}}

**Migración 0007 (M):**

{{TABLA_M}}

**Respuestas tardías en el navegador (G):**

{{TABLA_G}}

**Guardado fiable, conflicto, E16a, diálogo móvil (F) y servidor de la ronda 7 (U):**

{{TABLA_F}}

{{TABLA_U}}

**Regresión: escenarios D (incluye la E16a corregida) y E:**

{{TABLA_D}}

{{TABLA_E}}

## 6. Local, D1 remoto y pendiente

| Ámbito | Estado |
|---|---|
| **Local simulado** (D1 con Miniflare, SQLite real, Chromium) | Probado: todo lo de este informe |
| **D1 remoto** (Cloudflare) | **No probado**: que `D1.batch()` sea transaccional y que `UPDATE … RETURNING` funcione dentro del lote se apoya en la documentación de Cloudflare y en el comportamiento local (M22 en `ronda8/pruebas-manuales.md`) |
| **Migración con datos reales** | **No probada** (solo con una base antigua de prueba) |
| **Pruebas manuales** (móviles reales, Safari, Firefox, lector de pantalla, zoom real, teclado real, dos dispositivos) | **Ninguna ejecutada** (`ronda8/pruebas-manuales.md`, M1–M23) |

## 7. Limitaciones conocidas
- La carrera «una escritura ajena entre el commit y la respuesta» se modela con un adaptador que aplaza las escrituras intercaladas hasta después del commit (así lo documenta Cloudflare para `batch()`); no es una carrera real entre dos procesos.
- Un guardado cuya respuesta llega con otra cartera abierta muestra un aviso corto («“X” guardada»); no se ha rediseñado.
- Siguen en pie las de la ronda 7: título de 80 caracteres en móvil, clientes antiguos sin `revision`, «otro dispositivo» simulado.

## 8. Antes de desplegar
Aplicar `migrations/0007_revision.sql` solo a bases anteriores a la ronda 7. Fuera de alcance: plan de pago (Revolut, Trade Republic, artículo y consejo diarios).

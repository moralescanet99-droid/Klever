# Ronda 9: cierre técnico (API pública coherente, comprobación de la demo y descripciones)

Ronda breve y acotada. Se conservan las correcciones de la ronda 8; no hay rediseño ni funciones nuevas.

> Informe generado con `tests/ronda9/informe9.py` a partir de `ronda9/resultado-ejecucion.txt` y `ronda9/evidencias-*.json`. **Código con el que se obtuvo el resultado: commit `{{COMMIT}}`** ({{ARBOL}}). Para repetirlo: `git checkout {{COMMIT}}` y `LEEME-PRUEBAS.md`.

## 1. `GET /api/public/:id`: una sola instantánea
- **Defecto (confirmado con una prueba que falla antes):** comprobaba `publico = 1` y leía las posiciones en consultas independientes. Con una despublicación y un cambio de posiciones entre las dos lecturas devolvía la cartera pública **con posiciones privadas** (`NEM:100`). `ronda9/antes-pruebas.txt`.
- **Corrección:** visibilidad, metadatos y posiciones salen de **un lote de lecturas** (una transacción) y las posiciones se piden, además, solo si la cartera sigue siendo pública en esa misma instantánea. La respuesta es la versión pública anterior completa o 404; nunca posiciones, nombre o tesis de una versión que no fue pública.
- **Prueba:** R6a (determinista: despublicación + cambio de posiciones intercalados entre las lecturas originales; comprueba también que no se filtra nombre ni tesis privados) y R6b (cartera ya privada → 404). Además `tests/ronda9/verificar-api.mjs` V7 hace una prueba de estrés por HTTP (empírica, no determinista).

## 2. La comprobación de la demo en `tests/run-all.sh`
- **Defecto (confirmado, `ronda9/antes-ejecutor-demo.txt`):** el ejecutor de la ronda 8 salía con código 0 con una demo que imprimía «DEMO OK» y terminaba con código 1, y con el puerto de la demo ocupado ejecutaba la prueba contra un **servidor ajeno**.
- **Corrección:** la demo exige código 0, «DEMO OK», ausencia de «HAY FALLOS» y de timeout; comprueba que existe `demo/index.html`, que el puerto está libre y que su servidor arranca; no ejecuta nada si el puerto está ocupado y no mata servidores ajenos.
- **Casos de prueba** (`tests/ronda8/test-ejecutor.sh`, D1–D8, 18 en total con los anteriores): control correcto; «DEMO OK» con código 1; sin «DEMO OK»; «HAY FALLOS»; timeout; sin demo; servidor que no arranca; puerto ocupado sin ejecutar la prueba y sin matar al ajeno. Resultado: `ronda9/resultado-ejecutor.txt`.

## 3. Descripciones G2 y U4
Un ticker desconocido se rechaza **antes** del lote (validación previa, HTTP 400): ya no se describe como fallo a mitad de transacción. La evidencia de **rollback ante un error interno** es **R4a** (el lote falla en la sentencia 2, HTTP 500, nada cambia y el detalle se registra) y R5 para la creación.
*Nota:* los informes de las rondas 7 y 8 conservan la descripción antigua de G2 y U4 como antecedente; la vigente es la de esta ronda.

## 4. Resultado de la ejecución (literal)
```
{{RESULTADO}}
```
Obtenido en un clon nuevo del commit indicado (`git clone`, `npm ci`, `bash tests/run-all.sh`); el ejecutor termina con código 0 solo si todo pasa.

## 5. Evidencia
**Carreras, rollback y API pública (R):**

{{TABLA_R}}

**Servidor de la ronda 7 (U) y guardado fiable (F, incluye G2):**

{{TABLA_U}}

{{TABLA_F}}

**Verificación por HTTP repetible en D1 remoto (V):** pasa en local (`ronda9/resultado-ejecucion.txt`, bloque `verificar-api`); **no se ha ejecutado contra D1 remoto**.

## 6. Ejecutado y pendiente
| Ámbito | Estado |
|---|---|
| Local simulado (Miniflare, SQLite real, Chromium) | **Ejecutado**: todo lo de este informe |
| D1 remoto (Cloudflare) | **Pendiente**: `ronda9/GUION-BETA-Y-D1-REMOTO.md` (secciones A–C); ningún paso ejecutado |
| Recorrido completo de la beta en un despliegue | **Pendiente**: guion D1–D11, sin ejecutar |
| Pruebas manuales (móviles reales, Safari, Firefox, lector de pantalla, zoom real, teclado real) | **Pendientes**: `ronda9/pruebas-manuales.md` (M1–M24), ninguna ejecutada |

## 7. Limitaciones
Las carreras se modelan con un adaptador que aplaza las escrituras intercaladas hasta después del commit (comportamiento documentado de `batch()`), no con dos procesos reales; V5–V7 son estrés empírico. Siguen las de las rondas 7 y 8.

Fuera de alcance: plan de pago (Revolut, Trade Republic, artículo y consejo diarios).

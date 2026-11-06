# Ronda 10: pulido visual y camino a la beta real

Ronda de **pulido, no de rediseño**, partiendo de la entrega técnica de la ronda 9 y del feedback de ChatGPT (`procesos-klever/06-` C7). Se conservan las garantías técnicas de las rondas 7–9.

> Informe generado con `tests/ronda10/informe10.py` a partir de `ronda10/resultado-ejecucion.txt`, `ronda10/evidencias-*.json` y `ronda10/medidas-*.json`. **Código con el que se obtuvo el resultado: commit `{{COMMIT}}`** ({{ARBOL}}). Para repetirlo: `git checkout {{COMMIT}}` y `LEEME-PRUEBAS.md`.

## 1. Estado revisado antes de modificar
- Leídos `CLAUDE.md`, `procesos-klever/`, `ronda9/LEEME.md`, `ronda9/GUION-BETA-Y-D1-REMOTO.md` y `PRUEBAS-DE-USO.md`, y contrastados con el código.
- **Las «25 comprobaciones locales»** que ChatGPT dio por superadas son las 11 + 8 + 6 de `unit-servidor`, `unit-carreras` y `unit-migracion` (servidor, conflictos y migración sobre SQLite real). **No acreditan** la batería de navegador, Cloudflare D1 remoto, el correo real ni dispositivos físicos; este informe no lo afirma.
- **Referencias obsoletas actualizadas** (el historial se conserva): `procesos-klever/07-` (las revisiones 5 y 7 seguían como «pendientes» aunque ya estaban recibidas), `05-estado-actual.md` y `PENDIENTES.md`.
- **Hallazgo real al contrastar con el código:** en el editor móvil los **enlaces del pie** («Aviso legal…», cookies) quedaban **tapados por la barra inferior** al final de la página: la reserva de espacio estaba en `main`, no en el pie. Existía desde antes de esta ronda y no lo detectaba ninguna prueba (la de «última posición» no miraba el pie). Corregido y cubierto por `testB` y `testH`.

## 2. Los tres problemas visuales (Chromium; 320, 390 y 1440 px)
| | Antes | Después |
|---|---|---|
| **Notificación de guardado** | `position: fixed` arriba: tapaba la cabecera, «Mis carteras» y «Nueva cartera»; fugaz incluso para errores | Zona reservada **bajo la cabecera, en el flujo**, pegada arriba al desplazarse; los **errores que requieren actuar permanecen** (rol `alert`, «Cerrar aviso»); los de éxito se cierran solos; los errores de guardado del editor siguen en el estado y la barra |
| **Resumen de ROIC** | Indicador, advertencia, 2–3 líneas de cobertura, desplegable de cálculo y nota de categorías, todo a la vista | Indicador primero y grande; advertencia esencial; cobertura breve (con «no cuenta como 0» para datos ausentes); **un solo desplegable** accesible con fórmula, definición, ausente frente a no aplicable y cobertura completa; nota de categorías plegada |
| **Móvil** | Pie largo; barra inferior apretada («No se / pudo / guardar») y botón recortado con texto muy ampliado; enlaces del pie tapados | Pie compacto con «Fuentes y límites» plegado; barra que baja el botón a su fila (con texto muy ampliado, arriba y a todo el ancho; `max-height: 40vh`); reserva de la barra en el pie; foco centrado entre el aviso y la barra |

**Mediciones comparables** (`ronda10/medidas-antes.json` / `medidas-despues.json`; px y caracteres de texto visible, editor con la plantilla «Dividendos»):

{{TABLA_MEDIDAS}}

*Lectura:* la página del editor y el resumen son más cortos y llevan menos texto visible; el pie visible baja bastante en texto (la altura del pie incluye ahora la reserva de la barra, por eso no baja tanto); con texto ampliado la barra es más alta que antes porque ya no recorta (queda limitada al 40 % de la ventana). Capturas comparables en `ronda10/capturas/` (índice en `ronda10/CAPTURAS.md`; `antes-*` y `despues-*` con los mismos nombres).

## 3. Garantías técnicas conservadas
Sin regresiones en la batería completa (sección 6): separación público/privado, guardado atómico de posiciones + nombre + tesis, revisiones y conflictos, recuperación local, respuestas tardías, publicar/actualizar/retirar y ejecutor que falla ante errores. **Dos pruebas se adaptaron por cambios de diseño, con exigencia igual o mayor** (no se ha rebajado nada):
- `testB`: pasó de exigir que `main` tuviera relleno ≥ 72 px a exigir que el **último enlace del pie** quede sobre la barra y que el relleno del pie cubra la altura de la barra.
- `testD` E9b: la nota de categorías debe **existir dentro del desplegable** (plegada) en lugar de estar visible, porque reducir el texto secundario era el objetivo.

## 4. Validación real: bloqueada (sin credenciales)
`wrangler whoami`: no autenticado; sin variables de Cloudflare ni de Brevo; la red hacia `api.cloudflare.com` y `api.brevo.com` es alcanzable (solo faltan credenciales). **No se ha enviado ningún correo ni tocado Cloudflare.** Lo imprescindible, en un solo bloque: `ronda10/BLOQUEOS.md`. Guion actualizado: `ronda10/GUION-VALIDACION-REMOTA.md`; script asistido: `tests/ronda10/validar-acceso-real.mjs` (probado solo en local con `MODO_DEV=1`, que **no** valida correo real).

| Ámbito | Estado |
|---|---|
| **Probado en local** (Miniflare, SQLite real, Chromium) | Todo lo de las secciones 2, 3 y 6; el acceso con envío de correo **simulado** (fetch interceptado), un solo uso, caducidad, límites y que la respuesta nunca lleve el enlace sin `DEV_RETURN_LINK`; servidor arrancado **sin** enlace en pantalla (`seguridad-http`) |
| **Probado en remoto** | **Nada** |
| **Emulado/simulado** | Texto ampliado (`font-size` del documento), teclado (ventana reducida), «otro dispositivo» (petición directa o contexto aparte), correo (interceptación de `fetch`), carreras (escritura intercalada tras el commit) |
| **Bloqueado** | Correo realmente enviado, caducidad real, persistencia y conflictos contra D1 remota, migración sobre una D1 remota con datos: faltan credenciales (`ronda10/BLOQUEOS.md`) |
| **Pendiente** (requiere personas/dispositivos) | Safari, dispositivos físicos, lectores de pantalla, zoom real, teclado móvil real (`ronda10/pruebas-manuales.md`, M1–M28): **ninguno usado** |

**Configuración pública:** el enlace en pantalla solo aparece con `DEV_RETURN_LINK` exactamente «1» (probado: «true», «0», vacío y sin definir no lo devuelven); `wrangler.toml` no define variables ni contiene el valor; `.dev.vars` está ignorado y no versionado; el JS y el HTML públicos no contienen claves (`seguridad-http` S6, `unit-acceso` A8). Si el correo falla, el servidor responde 502 y **nunca** devuelve el enlace como alternativa (A5, S1).

## 5. Evidencia por escenario
**Pulido visual (H):**

{{TABLA_H}}

**Acceso (A, unit-acceso con manejadores reales):**

{{TABLA_A}}

**Carreras, rollback y API pública (R):**

{{TABLA_R}}

## 6. Resultado de la ejecución (literal) y comandos
```
{{RESULTADO}}
```
Comandos ejecutados (clon nuevo del commit indicado): `git clone … && npm ci --ignore-scripts && bash tests/run-all.sh` (código de salida 0 solo si todo pasa). Además: `node tests/ronda10/capturas.cjs antes|despues`, `node tests/ronda10/medir.cjs antes|despues` (con `git stash push -- public` para el «antes»), `bash tests/ronda8/test-ejecutor.sh` ({{EJECUTOR}}), `python3 scripts/demo/build_demo.py` y `MODO_DEV=1 … node tests/ronda10/validar-acceso-real.mjs` (solo local). Demo reconstruida del código actual y comprobada (`demotest`: «DEMO OK», código 0, sin persistencia al recargar).

## 7. Qué falta para que personas reales usen la beta
1. **Accesos para validar en remoto** (`ronda10/BLOQUEOS.md`): token de Cloudflare acotado, Brevo gratuito con remitente verificado, buzón de pruebas y autorización para crear/borrar recursos de prueba.
2. Ejecutar `ronda10/GUION-VALIDACION-REMOTA.md` (A–F) y anotar resultados.
3. Pruebas manuales con personas y dispositivos reales (M1–M28), en especial Safari, móviles físicos y lector de pantalla.
4. Lo ya pendiente del usuario (`PENDIENTES.md`): cuenta de Brevo y secretos, D1 y despliegue reales, carga de la SEC, términos de TradingView y revisión legal.

## 8. Limitaciones
Capturas y pruebas solo en Chromium. El «antes» se tomó con el mismo servidor sirviendo la versión sin cambios de `public/`. Con texto al 200 % a 320 px la barra inferior ocupa hasta el 40 % de la ventana (se desplaza internamente). Siguen las limitaciones de las rondas 7–9.

**Reservado para el futuro plan de pago (sin implementar ni simular):** conexión con Revolut, conexión con Trade Republic, artículo diario según los intereses del usuario y tip diario de inversión.

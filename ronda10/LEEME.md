# Ronda 10: pulido visual y camino a la beta real

Ronda de **pulido, no de rediseño**, partiendo de la entrega técnica de la ronda 9 y del feedback de ChatGPT (`procesos-klever/06-` C7). Se conservan las garantías técnicas de las rondas 7–9.

> Informe generado con `tests/ronda10/informe10.py` a partir de `ronda10/resultado-ejecucion.txt`, `ronda10/evidencias-*.json` y `ronda10/medidas-*.json`. **Código con el que se obtuvo el resultado: commit `6c5599911a569cefeef76661cdfa2d5996125961`** (árbol de trabajo limpio). Para repetirlo: `git checkout 6c5599911a569cefeef76661cdfa2d5996125961` y `LEEME-PRUEBAS.md`.

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

| Medida | 320 px antes → después | 390 px antes → después | 1440 px antes → después |
|---|---|---|---|
| Altura de la página del editor (px) | 2232 → 2016 | 2046 → 1889 | 1190 → 1108 |
| Altura del panel «Resumen» (px) | 770 → 700 | 708 → 635 | 724 → 651 |
| Texto visible del resumen (caracteres) | 436 → 376 | 436 → 376 | 436 → 376 |
| Texto visible del pie (caracteres) | 362 → 221 | 362 → 221 | 362 → 221 |
| Altura de la barra inferior (px) | 72 → 72 | 72 → 72 | 0 → 0 |
| Altura de la barra con texto al 200 % (px, simulado) | 139 → 154 | 139 → 154 | 0 → 0 |
| Aviso: posición CSS | fixed → static | fixed → static | fixed → static |
| Aviso: controles que tapa (cabecera, título…) | 2 → 0 | 3 → 0 | 3 → 0 |

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

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| H1-320 | Aviso de guardado en el editor (320 px): zona reservada bajo la cabecera, sin superponerse, legible en toda la animación | En 14 muestras durante la animación: el aviso queda siempre bajo la cabecera, no solapa ningún control y su contraste es ≥ 4,5:1 | 14 muestras con aviso visible; solapes con controles (aviso en su sitio): 0; muestras con el aviso pegado arriba al desplazarse: 14; controles solapados: [estado]; bajo la cabecera siempre=true; contraste mínimo 15.2:1; texto «Cartera guardada» | texto y valores en la propia fila | ✅ |
| H2-320 | Aviso sobre «Mis carteras» y al desplazarse (320 px) | El aviso queda debajo de la cabecera y no tapa el título ni «Nueva cartera»; con la página desplazada el aviso de error sigue entero arriba de la ventana y la página no desborda | solapes con controles en «Mis carteras»: 0 (); sobre el título=false, sobre «Nueva cartera»=false; desplazado 556 px: aviso a 0 px (cabecera termina en -495; arriba del todo si la cabecera ya salió), entero y con «Cerrar aviso» dentro de la ventana=true; ancho de página 320/320 | texto y valores en la propia fila | ✅ |
| H3-320 | Errores accesibles y avisos de éxito fugaces (320 px, título largo) | Tras 6 s el guardado fallido sigue visible en el estado (y «Reintentar guardado»); el aviso de error de la ficha sigue ahí (rol alert, «Cerrar aviso») hasta cerrarlo; el de éxito se cierra solo | guardado fallido a los 6 s: estado «No se pudo guardar. Tus cambios siguen en este dispositivo», botón «Reintentar guardado», barra «No se pudo guardar»; aviso de error a los 6 s: visible=true, rol «alert», «Cerrar aviso» visible=true, «No se pudo cargar la ficha»; tras cerrar oculto=true; aviso de éxito a los 4,7 s sigue visible=false | texto y valores en la propia fila | ✅ |
| H1-390 | Aviso de guardado en el editor (390 px): zona reservada bajo la cabecera, sin superponerse, legible en toda la animación | En 14 muestras durante la animación: el aviso queda siempre bajo la cabecera, no solapa ningún control y su contraste es ≥ 4,5:1 | 14 muestras con aviso visible; solapes con controles (aviso en su sitio): 0; muestras con el aviso pegado arriba al desplazarse: 14; controles solapados: [estado]; bajo la cabecera siempre=true; contraste mínimo 15.2:1; texto «Cartera guardada» | texto y valores en la propia fila | ✅ |
| H2-390 | Aviso sobre «Mis carteras» y al desplazarse (390 px) | El aviso queda debajo de la cabecera y no tapa el título ni «Nueva cartera»; con la página desplazada el aviso de error sigue entero arriba de la ventana y la página no desborda | solapes con controles en «Mis carteras»: 0 (); sobre el título=false, sobre «Nueva cartera»=false; desplazado 150 px: aviso a 0 px (cabecera termina en -89; arriba del todo si la cabecera ya salió), entero y con «Cerrar aviso» dentro de la ventana=true; ancho de página 390/390 | texto y valores en la propia fila | ✅ |
| H3-390 | Errores accesibles y avisos de éxito fugaces (390 px, título largo) | Tras 6 s el guardado fallido sigue visible en el estado (y «Reintentar guardado»); el aviso de error de la ficha sigue ahí (rol alert, «Cerrar aviso») hasta cerrarlo; el de éxito se cierra solo | guardado fallido a los 6 s: estado «No se pudo guardar. Tus cambios siguen en este dispositivo», botón «Reintentar guardado», barra «No se pudo guardar»; aviso de error a los 6 s: visible=true, rol «alert», «Cerrar aviso» visible=true, «No se pudo cargar la ficha»; tras cerrar oculto=true; aviso de éxito a los 4,7 s sigue visible=false | texto y valores en la propia fila | ✅ |
| H1-1440 | Aviso de guardado en el editor (1440 px): zona reservada bajo la cabecera, sin superponerse, legible en toda la animación | En 14 muestras durante la animación: el aviso queda siempre bajo la cabecera, no solapa ningún control y su contraste es ≥ 4,5:1 | 14 muestras con aviso visible; solapes con controles (aviso en su sitio): 0; muestras con el aviso pegado arriba al desplazarse: 0; controles solapados: []; bajo la cabecera siempre=true; contraste mínimo 15.2:1; texto «Cartera guardada» | texto y valores en la propia fila | ✅ |
| H2-1440 | Aviso sobre «Mis carteras» y al desplazarse (1440 px) | El aviso queda debajo de la cabecera y no tapa el título ni «Nueva cartera»; con la página desplazada el aviso de error sigue entero arriba de la ventana y la página no desborda | solapes con controles en «Mis carteras»: 0 (); sobre el título=false, sobre «Nueva cartera»=false; desplazado 0 px: aviso a 61 px (cabecera termina en 61; arriba del todo si la cabecera ya salió), entero y con «Cerrar aviso» dentro de la ventana=true; ancho de página 1440/1440 | texto y valores en la propia fila | ✅ |
| H3-1440 | Errores accesibles y avisos de éxito fugaces (1440 px, título largo) | Tras 6 s el guardado fallido sigue visible en el estado (y «Reintentar guardado»); el aviso de error de la ficha sigue ahí (rol alert, «Cerrar aviso») hasta cerrarlo; el de éxito se cierra solo | guardado fallido a los 6 s: estado «No se pudo guardar. Tus cambios siguen en este dispositivo», botón «Reintentar guardado», motivo «Sin conexión con el servidor. Inténtalo de nuevo.»; aviso de error a los 6 s: visible=true, rol «alert», «Cerrar aviso» visible=true, «No se pudo cargar la ficha»; tras cerrar oculto=true; aviso de éxito a los 4,7 s sigue visible=false | texto y valores en la propia fila | ✅ |
| H4-320 | Resumen de ROIC (320 px): indicador, cobertura y advertencia visibles; explicación en desplegable | Visibles: ROIC medio, «Con dato: N de M…», «No representa la rentabilidad de tu cartera.»; la fórmula y los datos ausentes, en un solo desplegable cerrado que se abre con teclado; una empresa sin dato queda fuera del cálculo y se dice que no cuenta como 0; sin tarjeta explicativa extra | ROIC «15,6 %» visible=true; cobertura «Con dato: 4 de 6 posiciones (66 % del peso asignado).Fuera del cálculo: 2 fondos (no aplicable).»; advertencia «No representa la rentabilidad de tu cartera.» visible=true; desplegable «Cómo se calcula y qué se excluye» cerrado=true, fórmula oculta=true; con Enter se abre=true, fórmula visible=true; desplegables en el resumen 2 (≤ 2), paneles anidados 0, h2 1; con JPMorgan: «Con dato: 4 de 7 posiciones (63 % del peso asignado).Fuera del cálculo: 1 empresa sin dato (no cuenta como 0) · 2 fondos (no aplicable).» · detalle «Dato ausente (no disponible): 1 empresa.No aplicable: 2 fondos; los ETF no tienen ROIC.» · ROIC 15,6 %; ancho 320/320 | `ronda10/evidencias/H4-roic-desplegado-320.png` | ✅ |
| H4-390 | Resumen de ROIC (390 px): indicador, cobertura y advertencia visibles; explicación en desplegable | Visibles: ROIC medio, «Con dato: N de M…», «No representa la rentabilidad de tu cartera.»; la fórmula y los datos ausentes, en un solo desplegable cerrado que se abre con teclado; una empresa sin dato queda fuera del cálculo y se dice que no cuenta como 0; sin tarjeta explicativa extra | ROIC «15,6 %» visible=true; cobertura «Con dato: 4 de 6 posiciones (66 % del peso asignado).Fuera del cálculo: 2 fondos (no aplicable).»; advertencia «No representa la rentabilidad de tu cartera.» visible=true; desplegable «Cómo se calcula y qué se excluye» cerrado=true, fórmula oculta=true; con Enter se abre=true, fórmula visible=true; desplegables en el resumen 2 (≤ 2), paneles anidados 0, h2 1; con JPMorgan: «Con dato: 4 de 7 posiciones (63 % del peso asignado).Fuera del cálculo: 1 empresa sin dato (no cuenta como 0) · 2 fondos (no aplicable).» · detalle «Dato ausente (no disponible): 1 empresa.No aplicable: 2 fondos; los ETF no tienen ROIC.» · ROIC 15,6 %; ancho 390/390 | `ronda10/evidencias/H4-roic-desplegado-390.png` | ✅ |
| H4-1440 | Resumen de ROIC (1440 px): indicador, cobertura y advertencia visibles; explicación en desplegable | Visibles: ROIC medio, «Con dato: N de M…», «No representa la rentabilidad de tu cartera.»; la fórmula y los datos ausentes, en un solo desplegable cerrado que se abre con teclado; una empresa sin dato queda fuera del cálculo y se dice que no cuenta como 0; sin tarjeta explicativa extra | ROIC «15,6 %» visible=true; cobertura «Con dato: 4 de 6 posiciones (66 % del peso asignado).Fuera del cálculo: 2 fondos (no aplicable).»; advertencia «No representa la rentabilidad de tu cartera.» visible=true; desplegable «Cómo se calcula y qué se excluye» cerrado=true, fórmula oculta=true; con Enter se abre=true, fórmula visible=true; desplegables en el resumen 2 (≤ 2), paneles anidados 0, h2 1; con JPMorgan: «Con dato: 4 de 7 posiciones (63 % del peso asignado).Fuera del cálculo: 1 empresa sin dato (no cuenta como 0) · 2 fondos (no aplicable).» · detalle «Dato ausente (no disponible): 1 empresa.No aplicable: 2 fondos; los ETF no tienen ROIC.» · ROIC 15,6 %; ancho 1440/1440 | `ronda10/evidencias/H4-roic-desplegado-1440.png` | ✅ |
| H5-320 | Móvil 320×568: estado claro y acciones alcanzables (texto ampliado SIMULADO, aviso de error, título largo, teclado SIMULADO) | El estado distingue «solo en este dispositivo», «guardada en tu cuenta», «cambios locales pendientes» y «pública + tus cambios aún no son públicos»; Guardar, el título, «Cerrar aviso», la última posición y el pie quedan visibles y no tapados | solo dispositivo «Solo en este dispositivo \| Solo en este dispositivo»; cuenta «Guardada en tu cuenta \| ✓ Guardada»; pendiente «Cambios locales pendientes de guardar en tu cuenta \| Cambios locales pendientes»; pública «Pública \| Cambios locales pendientes de guardar en tu cuenta \| Tus cambios aún no son públicos»; alcanzables: cerrar aviso {"libre":true,"dentro":true}, título {"libre":true,"dentro":true}, Guardar {"libre":true,"dentro":true}, barra inferior con texto ampliado {"botonDentro":true,"textoSinRecorte":true,"infoDentro":true,"alto":227}, última posición {"dentro":true,"esPeso":true}, pie {"libre":true,"dentro":true}; teclado simulado (ventana 320×256): campo 103–147 px, aviso termina en 84, barra desde 165, campo entre aviso y barra=true | `ronda10/evidencias/H5-acciones-200-error-320.png` | ✅ |
| H6-320 | Sin errores de JavaScript (320 px) | Ninguno | ninguno | texto y valores en la propia fila | ✅ |
| H5-390 | Móvil 390×844: estado claro y acciones alcanzables (texto ampliado SIMULADO, aviso de error, título largo, teclado SIMULADO) | El estado distingue «solo en este dispositivo», «guardada en tu cuenta», «cambios locales pendientes» y «pública + tus cambios aún no son públicos»; Guardar, el título, «Cerrar aviso», la última posición y el pie quedan visibles y no tapados | solo dispositivo «Solo en este dispositivo \| Solo en este dispositivo»; cuenta «Guardada en tu cuenta \| ✓ Guardada»; pendiente «Cambios locales pendientes de guardar en tu cuenta \| Cambios locales pendientes»; pública «Pública \| Cambios locales pendientes de guardar en tu cuenta \| Tus cambios aún no son públicos»; alcanzables: cerrar aviso {"libre":true,"dentro":true}, título {"libre":true,"dentro":true}, Guardar {"libre":true,"dentro":true}, barra inferior con texto ampliado {"botonDentro":true,"textoSinRecorte":true,"infoDentro":true,"alto":267}, última posición {"dentro":true,"esPeso":true}, pie {"libre":true,"dentro":true}; teclado simulado (ventana 390×380): campo 162–206 px, aviso termina en 62, barra desde 308, campo entre aviso y barra=true | `ronda10/evidencias/H5-acciones-200-error-390.png` | ✅ |
| H6-390 | Sin errores de JavaScript (390 px) | Ninguno | ninguno | texto y valores en la propia fila | ✅ |

**Acceso (A, unit-acceso con manejadores reales):**

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| A1 | Acceso con envío de correo (configuración pública, sin DEV_RETURN_LINK) | La respuesta es solo {ok:true}: sin dev_link, sin token ni «login=»; el enlace va únicamente en el correo (a la dirección pedida) | HTTP 200; cuerpo {"ok":true}; correos enviados 1 a a1@example.com; enlace en el correo=true | texto y valores en la propia fila | ✅ |
| A2 | Enlace de un solo uso | El primer canje da sesión; el segundo, 400 «caducado o ya se usó» | 1.º HTTP 200 (sesión=true); 2.º HTTP 400 «El enlace ha caducado o ya se usó» | texto y valores en la propia fila | ✅ |
| A3 | Tokens guardados solo como hash | Ni el enlace ni la sesión están en claro en la base de datos | enlaces con token en claro=false; sesiones con token en claro=false; hash del enlace correcto=true | texto y valores en la propia fila | ✅ |
| A4 | Caducidad del enlace | Dura unos 15 min y, caducado, no entra (400) ni crea sesión | duración inicial ≈ 15.0 min; tras caducar HTTP 400 «El enlace ha caducado o ya se usó»; sesiones=0 | texto y valores en la propia fila | ✅ |
| A5 | Si el correo no se puede enviar (proveedor caído o sin configurar) | HTTP 502 con mensaje de reintento; NUNCA se devuelve el enlace como alternativa | proveedor 500: HTTP 502 «No se pudo enviar el email; inténtalo más tarde»; sin red/sin claves: HTTP 502; enlace en alguna respuesta=false | texto y valores en la propia fila | ✅ |
| A6 | El enlace en pantalla solo con DEV_RETURN_LINK exactamente «1» | Con «1» sí; con «true», «0», vacío o sin definir, no | "1"→enlace; "true"→sin enlace; "0"→sin enlace; ""→sin enlace; undefined→sin enlace | texto y valores en la propia fila | ✅ |
| A7 | Límites de envío por correo | Un segundo envío en menos de un minuto: 429; a partir del 5.º del día: 429 | 2.º inmediato HTTP 429; tras 2 min HTTP 200; 6.º del día HTTP 429 «Demasiados intentos hoy; inténtalo mañana» | texto y valores en la propia fila | ✅ |
| A8 | La configuración desplegable no activa el enlace en pantalla ni guarda secretos | wrangler.toml sin [vars] ni DEV_RETURN_LINK; .dev.vars ignorado y no versionado; DEV_RETURN_LINK solo aparece en el manejador de acceso (y en scripts/pruebas/documentación) | [vars] en wrangler.toml=false; DEV_RETURN_LINK en wrangler.toml=false; .dev.vars ignorado=true; versionado=false; ficheros de código con DEV_RETURN_LINK: functions/api/login.js; database_id es el marcador=true | texto y valores en la propia fila | ✅ |

**Carreras, rollback y API pública (R):**

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| R1 | PUT: una escritura ajena llega entre el commit y la respuesta | A recibe SU revisión (1), no la de B (2); su siguiente guardado con esa revisión es 409 y no pisa a B | HTTP 200, revisión devuelta 1; siguiente guardado HTTP 409; estado {"nombre":"B","tesis":null,"publico":0,"revision":2,"pos":"NEM:100"} | texto y valores en la propia fila | ✅ |
| R2 | PATCH: una escritura ajena llega entre el commit y la respuesta | A recibe SU revisión (1); su siguiente cambio con esa revisión es 409 | HTTP 200, revisión devuelta 1; siguiente HTTP 409; estado {"nombre":"B","tesis":null,"publico":0,"revision":2,"pos":"NEM:100"} | texto y valores en la propia fila | ✅ |
| R3 | GET: una escritura ajena llega entre la lectura de la cartera y la de sus posiciones | La respuesta es UNA versión que existió (nombre, revisión y posiciones a juego), nunca una mezcla | nombre «Prueba», revisión 0, posiciones GLD:60,IAU:40; la escritura ajena sí se aplicó=true | texto y valores en la propia fila | ✅ |
| R4a | Rollback ante un error interno de infraestructura a mitad del lote (PUT) | HTTP 500 con mensaje de reintento (no «ticker desconocido»), nada queda a medias y el detalle técnico se registra en el servidor | HTTP 500; «No se pudo guardar por un error del servidor. Inténtalo de nuevo.»; sin cambios=true; registrado=true | texto y valores en la propia fila | ✅ |
| R4b | Ticker desconocido (validación) | HTTP 400 «Algún ticker no está en el universo» y nada cambia | HTTP 400; «Algún ticker no está en el universo»; sin cambios=true | texto y valores en la propia fila | ✅ |
| R5 | POST: error interno a mitad del lote | HTTP 500 y no queda ninguna cartera | HTTP 500; carteras=0 | texto y valores en la propia fila | ✅ |
| R6a | GET público: la cartera se despublica y cambian sus posiciones entre las lecturas originales | La respuesta es la versión pública anterior COMPLETA (o 404); nunca posiciones, nombre o tesis de una versión que no fue pública | HTTP 200; nombre «Prueba», tesis «Tesis pública», posiciones GLD:60,IAU:40; la despublicación sí se aplicó=true; fuga de datos privados=false | texto y valores en la propia fila | ✅ |
| R6b | GET público de una cartera ya privada | HTTP 404, sin posiciones | HTTP 404; posiciones en la respuesta=false | texto y valores en la propia fila | ✅ |

## 6. Resultado de la ejecución (literal) y comandos
```
Ejecución: 2026-11-03 19:42 UTC
Código: commit 6c5599911a569cefeef76661cdfa2d5996125961; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 6 correctas, 0 fallos
=== unit-acceso ===
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
RESULTADO: 16 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
Comandos ejecutados (clon nuevo del commit indicado): `git clone … && npm ci --ignore-scripts && bash tests/run-all.sh` (código de salida 0 solo si todo pasa). Además: `node tests/ronda10/capturas.cjs antes|despues`, `node tests/ronda10/medir.cjs antes|despues` (con `git stash push -- public` para el «antes»), `bash tests/ronda8/test-ejecutor.sh` (18/18, ver ronda10/resultado-ejecutor.txt), `python3 scripts/demo/build_demo.py` y `MODO_DEV=1 … node tests/ronda10/validar-acceso-real.mjs` (solo local). Demo reconstruida del código actual y comprobada (`demotest`: «DEMO OK», código 0, sin persistencia al recargar).

## 7. Qué falta para que personas reales usen la beta
1. **Accesos para validar en remoto** (`ronda10/BLOQUEOS.md`): token de Cloudflare acotado, Brevo gratuito con remitente verificado, buzón de pruebas y autorización para crear/borrar recursos de prueba.
2. Ejecutar `ronda10/GUION-VALIDACION-REMOTA.md` (A–F) y anotar resultados.
3. Pruebas manuales con personas y dispositivos reales (M1–M28), en especial Safari, móviles físicos y lector de pantalla.
4. Lo ya pendiente del usuario (`PENDIENTES.md`): cuenta de Brevo y secretos, D1 y despliegue reales, carga de la SEC, términos de TradingView y revisión legal.

## 8. Limitaciones
Capturas y pruebas solo en Chromium. El «antes» se tomó con el mismo servidor sirviendo la versión sin cambios de `public/`. Con texto al 200 % a 320 px la barra inferior ocupa hasta el 40 % de la ventana (se desplaza internamente). Siguen las limitaciones de las rondas 7–9.

**Reservado para el futuro plan de pago (sin implementar ni simular):** conexión con Revolut, conexión con Trade Republic, artículo diario según los intereses del usuario y tip diario de inversión.

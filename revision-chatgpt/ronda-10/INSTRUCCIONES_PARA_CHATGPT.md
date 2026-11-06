# Ronda 10 · pulido visual y camino a la beta real (para pegar en ChatGPT)

Sube **el zip completo** `klever-ronda10-chatgpt.zip` (proyecto + este texto en la raíz) y, además, las 16 imágenes de la carpeta `imagenes/` a **la misma conversación** (si admite pocas por mensaje, en dos tandas: 01–08 y 09–16). Los nombres llevan `antes-`/`despues-` y un número: las parejas son 01/02 … 13/14; 15 y 16 solo existen «después». Si no puede abrir zips, sube por separado: `public/app.js` (busca `mostrarAviso`, `toastError`, `coberturaCorta`, `focusin`), `public/style.css` (final del fichero: «ronda 10»), `public/index.html`, `tests/ronda10/testH.cjs`, `tests/ronda10/unit-acceso.mjs`, `tests/ronda10/seguridad-http.mjs`, `tests/ronda10/validar-acceso-real.mjs`, `tests/run-all.sh`, `ronda10/LEEME.md`, `ronda10/BLOQUEOS.md`, `ronda10/GUION-VALIDACION-REMOTA.md` y `ronda10/resultado-ejecucion.txt`.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–9 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript sin dependencias). La ronda 9 dejó tres puntos pendientes de **pulido visual** (aviso de guardado, resumen de ROIC, móvil) y se pidió avanzar hacia una beta comprobable con servicios reales, **sin rediseño**. Intenta **romper** lo que afirmo, como las veces anteriores.

## Qué se afirma
1. **Aviso de guardado (imágenes 01–06).** Antes era `position: fixed` arriba y tapaba la cabecera, el título «Mis carteras» y «Nueva cartera». Ahora es una zona reservada bajo la cabecera, en el flujo y pegada arriba al desplazarse (`position: sticky`). Los avisos de éxito se cierran a los 4 s; los **errores que requieren actuar** permanecen (rol `alert`, «Cerrar aviso») hasta cerrarlos (imágenes 05/06, a los 5 s: antes desaparecía, ahora sigue). Los errores de guardado del editor siguen en el estado y la barra inferior.
2. **Resumen de ROIC (07–10, 16).** A la vista: ROIC medio (grande), «No representa la rentabilidad de tu cartera.» y cobertura breve (con «no cuenta como 0» para datos ausentes). Fórmula, definición, ausente frente a no aplicable y cobertura completa: **un solo desplegable** accesible. Sin tarjeta explicativa nueva.
3. **Móvil (11–15).** Pie compacto (fuentes plegadas); al final de la página sus enlaces **ya no quedan tapados por la barra inferior** (defecto real previo: la reserva estaba en `main`, no en el pie); con texto muy ampliado el botón de la barra baja a su fila (consulta de contenedor en `rem`) y la barra tiene `max-height: 40vh`; al enfocar un peso se centra entre el aviso y la barra.
4. **Acceso.** El enlace en pantalla solo con `DEV_RETURN_LINK` exactamente «1»; sin él la respuesta es `{"ok":true}` y el enlace va solo en el correo (envío **simulado** en las pruebas); si el correo falla, 502 sin devolver el enlace; un solo uso; caducidad; límites; tokens con hash; `wrangler.toml` sin variables; `.dev.vars` ignorado. Pruebas con manejadores reales (`unit-acceso`, 8) y por HTTP contra un servidor **sin** enlace en pantalla (`seguridad-http`, 6).
5. **Pruebas adaptadas, no rebajadas:** `testB` (antes `main` con relleno ≥ 72 px; ahora el último enlace del pie sobre la barra y relleno del pie ≥ altura de la barra) y `testD` E9b (la nota de categorías debe existir plegada dentro de su desplegable en lugar de estar visible).
6. **Resultado:** clon nuevo del commit `6c5599911a569cefeef76661cdfa2d5996125961`, `npm ci`, `bash tests/run-all.sh`: **251 comprobaciones correctas, 0 fallos, código de salida 0** (`ronda10/resultado-ejecucion.txt`); `test-ejecutor.sh` 18/18. Los commits posteriores solo añaden resultados, informes y este paquete.
7. **Validación real: bloqueada.** `wrangler whoami` no autenticado; sin credenciales de Cloudflare ni de Brevo; la red hacia sus APIs responde. **No se ha enviado ningún correo ni tocado Cloudflare.** Lo imprescindible, en `ronda10/BLOQUEOS.md`; guion en `ronda10/GUION-VALIDACION-REMOTA.md`; script asistido `validar-acceso-real.mjs` (probado solo en local con `MODO_DEV=1`, que no valida correo real).

## Qué quiero que evalúes
### Visual (con las imágenes)
1. **Aviso (01–06):** ¿queda claro, no molesta y no tapa nada? ¿Es acertado que un aviso de éxito pegado arriba al desplazarse pueda cubrir contenido que pasa por debajo? ¿El aviso de error persistente (con «Cerrar aviso») es demasiado grande en móvil? ¿Falta una acción en el error (reintentar) o basta?
2. **Resumen de ROIC (07–10, 16):** jerarquía, espaciado y lectura. ¿Se entiende «Fuera del cálculo: … (no cuenta como 0)»? ¿Sobra o falta algo visible? ¿El desplegable «Cómo se calcula y qué se excluye» es un buen nombre?
3. **Móvil (11–15):** densidad, barra inferior con estado y botón, pie compacto, y el caso extremo con texto al 200 % a 320 px (15, **simulado**). ¿Se distingue siempre «solo en este dispositivo / guardada en la cuenta / pública»?
4. **Regresiones:** ¿algo era mejor antes?

### Técnico (con el código)
5. **Avisos y foco:** `mostrarAviso`/`toastError`/`cerrarAviso`/`hideToast`, cambio de `role`/`aria-live` en un mismo elemento (¿se anuncia bien?), `position: sticky` con `grid-template-rows: 0fr → 1fr`, cálculo de la zona libre en el manejador de `focusin`, `@container (max-width: 18rem)` dentro de un `@media`, `container-type` en un elemento `position: fixed`.
6. **Pruebas:** `testH` (16): ¿hay comprobaciones que no puedan fallar? Mide los solapes sobre la parte **visible** del aviso (recortada por su zona) y solo cuando está en su sitio; ¿es legítimo? ¿Las dos pruebas adaptadas (punto 5) mantienen o rebajan la exigencia? ¿Algún caso de acceso de `unit-acceso` es trivial (se intercepta `fetch` para simular el correo)?
7. **Acceso y configuración pública:** ¿hay algún camino por el que el enlace o un token salgan en una respuesta, un registro o un fichero público? ¿`SIN_ENLACE_DEV=1` en `scripts/local/servidor.sh` y la prueba `seguridad-http` ejercitan de verdad la configuración pública?
8. **Honestidad del informe (`ronda10/LEEME.md`) y de los bloqueos (`BLOQUEOS.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado probado en local / en remoto / emulado / pendiente / bloqueado? ¿Falta algo imprescindible en el bloque de requisitos (por ejemplo, para comprobar el correo real o la caducidad)?
9. **Guion remoto y `validar-acceso-real.mjs`:** ¿los comandos son correctos para `wrangler@3.114.17`? ¿El script puede pasar en vacío o dejar datos? ¿Los límites de envío (1/min, 5/día) lo hacen inviable en la práctica?
10. Todo lo que debería probar yo a mano y no puedas ver en imágenes fijas.

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo está probado en **Chromium** con servidor local (D1 simulada con Miniflare) y SQLite real; **nada en Cloudflare D1 remoto**, **ningún correo real**, **ningún Safari, dispositivo físico ni lector de pantalla**. El texto ampliado (`font-size` del documento) y el teclado (ventana reducida) son **simulaciones**; el «otro dispositivo» es una petición directa o un contexto aparte; las carreras se modelan aplazando la escritura intercalada tras el commit.
- Las capturas «antes» se tomaron con el mismo servidor sirviendo la versión anterior de `public/`. Los datos son inventados.
- Con texto al 200 % a 320 px la barra inferior ocupa hasta el 40 % de la ventana (se desplaza internamente).

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué es un problema y arreglo concreto.
- **Los 5 cambios que más mejorarían el producto** y **3 cosas que quitaría**; las **pruebas que añadirías**; las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar** con imágenes fijas y lectura de código.

*Fuera de alcance (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión (futuro plan de pago), y cualquier rediseño general.

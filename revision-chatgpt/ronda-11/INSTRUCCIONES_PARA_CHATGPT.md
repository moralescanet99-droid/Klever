# Ronda 11 · incidencias de avisos y primera pantalla con identidad propia (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda11-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-11/`) y las **23 imágenes** de `imagenes-ronda11-chatgpt.zip` a **la misma conversación** (si admite pocas por mensaje, en tres tandas: 01–08, 09–16 y 17–23). Los nombres llevan número, `antes-`/`despues-` y el estado: las parejas son 01/02 … 19/20 (editor en escritorio y móvil: normal, pendiente, error, pública con cambios privados y texto ampliado); 21, 22 y 23 solo existen «después». Si no puede abrir zips, sube por separado: `public/style.css` (final del fichero y tokens `:root`), `public/app.js` (`mostrarAviso`, `medirAvisos`, `pintarComposicion`, `focusin`), `public/index.html`, `tests/ronda10/testH.cjs`, `tests/ronda11/testI.cjs`, `tests/ronda10/unit-acceso.mjs`, `scripts/entrega/*.sh`, `tests/ronda11/test-zip.sh`, `ronda11/LEEME.md`, `ronda11/SISTEMA-VISUAL.md` y `ronda11/resultado-ejecucion.txt`.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–10 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). En la ronda 10 señalaste que la prueba H1 daba por superado un solape, que las acciones y el elemento enfocado debían quedar visibles, el poco espacio útil a 320 px con texto ampliado y la legibilidad durante la animación; y pediste empezar la dirección visual por el **editor de cartera**. Intenta **romper** lo que afirmo, como siempre. **No quiero un rediseño de otras pantallas.**

## Qué se afirma
1. **H1 reescrita** (`tests/ronda10/testH.cjs`): cada fase exige ≥ 6 muestras elegibles (si no, falla); se prueba al inicio de la página (H1a) y tras desplazarse (H1c); se distingue el contenido que pasa por debajo de una zona fija (normal) de una **acción inaccesible** (enfocada, queda tapada o fuera de la zona libre entre aviso y barra); el contraste se mezcla con la **opacidad real** (H1b). Validada con una mutación: sin `scroll-padding-top` falla a 1440 px (`ronda11/mutacion-h1c.txt`; a 320 y 390 px la mutación **no** la hizo fallar).
2. **Avisos** (imágenes 22, 23): zona bajo la cabecera; solo se fijan los errores y, en escritorio, los éxitos; `scroll-padding-top` medido; cierre compacto «✕» («Cerrar aviso»); el mensaje usa el ancho; no se anima la opacidad. A 320×568 con texto al 200 % (simulado), con un aviso de error abierto, queda ≥ 35 % de la ventana libre y se puede editar y guardar sin cerrarlo (H7).
3. **Editor con identidad propia** (imágenes 01–20): fondo cálido, superficies blancas, texto azul tinta, acento verde petróleo; **composición primero** (barra de tramos con los pesos reales, punto de color y barra de peso por fila); **ROIC secundario** (tras la distribución, cifra menor, desplegable con la explicación, imagen 21); una acción principal (acento sólido); menos cajas; móvil con filas táctiles y sin la tabla trasladada; el resumen breve móvil se integró en la composición. Todo gráfico sale de datos existentes. Documento: `ronda11/SISTEMA-VISUAL.md`; propiedades medibles en `tests/ronda11/testI.cjs` (16) con contraste calculado de todos los tokens en claro y oscuro.
4. **Entregas ZIP:** tu A8 se interrumpió porque el ZIP no tiene `.git`. Ahora A8 tiene **modo repositorio** (≥ 2 commits: `.dev.vars` nunca versionado y `wrangler.toml` nunca con un `database_id` real) y **modo ZIP** (solo contenido: «historial: NO verificado»); un repositorio vacío o de un commit no acredita historial. `scripts/entrega/crear-zip.sh` / `verificar-zip.sh` (manifiesto SHA-256 + `ENTREGA.json`), `tests/ronda11/test-zip.sh` (8 casos) y la guía de `LEEME-PRUEBAS.md`.
5. **Resultado:** clon nuevo del commit `778e19d625854e3348f7bd951817b1bc864abdc8`, `npm ci`, `bash tests/run-all.sh`: **284 comprobaciones correctas, 0 fallos, código de salida 0**; `test-ejecutor.sh` 18/18. Los commits posteriores solo añaden resultados, informes y este paquete.
6. **Pruebas viejas adaptadas, no rebajadas** (por el nuevo diseño): `testA` usa `#roic-det`; `testB` mide el margen sobre `#comp` y el orden con `#comp` y `#pos-cards`; `testD` E8 mide el aviso asentado y al inicio de la página; `testD` E9a mide `#comp-pie` (visible) en vez de `#rb-estado` (ahora oculto).
7. **Validación remota: bloqueada** (sin credenciales de Cloudflare ni de Brevo; no se piden secretos por el chat). **Un único bloque** en `ronda10/BLOQUEOS.md`; guion en `ronda10/GUION-VALIDACION-REMOTA.md`. Ningún correo real enviado.

## Qué quiero que evalúes
### Visual (con las imágenes)
1. **Identidad:** ¿es reconocible, sobria y moderna? ¿Qué le falta para que no parezca «una plantilla»? ¿La paleta (cálido + tinta + petróleo) funciona? ¿Los 8 colores del reparto son demasiados, o confusos con los colores de estado (verde/ámbar/rojo)?
2. **Jerarquía (01–08):** ¿la composición es de verdad la información principal? ¿ROIC se lee como secundario sin esconderse? ¿La acción principal es inequívoca (compara 05/06, pendiente, con 01–04, guardada)?
3. **Filas de activos:** ¿se comparan y se editan bien? ¿La barra de peso por fila aporta o es ruido? ¿Falta o sobra algo en móvil (09–12)?
4. **Estados:** error de guardado (09/10), pública con cambios privados (13–16): ¿se entienden las tres capas (privada/pública, validez del reparto, dónde están los cambios)? ¿Demasiado texto?
5. **Texto ampliado a 320 px (17–20, 23, **simulado**):** ¿usable? ¿Se pierde algo importante al ocultar las etiquetas de la barra de composición?
6. **Regresiones:** ¿algo era mejor antes?

### Técnico (con el código)
7. **Avisos y foco:** `mostrarAviso`/`medirAvisos` (`ResizeObserver`), `scroll-padding-top` y el manejador de `focusin` que centra entre aviso y barra; `position: sticky` con altura animada; `role`/`aria-live` cambiados en un mismo elemento.
8. **Pruebas:** ¿H1a/H1b/H1c/H7/H8 pueden aún pasar en vacío o medir la cosa equivocada (la intersección recortada, la acción «accesible» con `focus()`)? ¿La mutación solo a 1440 px es insuficiente? ¿Alguna de las cuatro adaptaciones rebaja la exigencia?
9. **CSS:** el rediseño se aplicó con un bloque de reglas «ronda 11» **sobre** las existentes (más `!important` en `.res-breve{display:none!important}` y varias reglas que se pisan). ¿Es deuda técnica grave? ¿Qué limpiarías ya? ¿Soporte de `color-mix()`, `@container` en `rem` y `scroll-padding` fuera de Chromium?
10. **Accesibilidad de la composición:** la barra es un `role="img"` con nombre que lista tickers y pesos, y los tramos son `aria-hidden`; ¿suficiente? ¿Los colores del reparto se distinguen sin color (hay etiqueta solo si el tramo es ≥ 9 %)?
11. **Entregas ZIP:** `crear-zip.sh` / `verificar-zip.sh` (portabilidad a bash 3.2 de macOS, `grep -vxFf <(…)`, `sha256sum`/`shasum`), la prueba `test-zip.sh` y A8 en dos modos. ¿Se declara algo verificado que no lo está? ¿El manifiesto dentro del propio ZIP aporta integridad real o es circular (quien manipula el ZIP puede regenerarlo)?
12. **Honestidad del informe (`ronda11/LEEME.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado ejecutado / simulado / bloqueado / pendiente?
13. Todo lo que debería probar yo a mano.

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo se probó en **Chromium** con servidor local (D1 simulada con Miniflare) y SQLite real; **nada en Cloudflare D1 remoto**, **ningún correo real**, **ningún Safari, Firefox, dispositivo físico ni lector de pantalla**. El texto ampliado (`font-size` del documento) y el teclado (ventana reducida) son **simulaciones**. No se revisó el tema oscuro a ojo (solo se calculan sus contrastes).
- Solo el editor está rediseñado; el resto de pantallas sigue con el estilo anterior (con el tono nuevo por los tokens). Las capturas «antes» se tomaron con el mismo servidor sirviendo la versión anterior de `public/`. Los datos son inventados.
- La paleta del reparto repite colores a partir de la 9.ª posición.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían la pantalla del editor** antes de extender el diseño, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar** con imágenes fijas y lectura de código.

*Fuera de alcance (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión (futuro plan de pago).

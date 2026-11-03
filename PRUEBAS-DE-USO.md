# Klever · versión para pruebas de uso

Todo lo que ves es **beta gratuita con dinero simulado y datos inventados**: no hay cifras reales de empresas, no se envía ningún email y no se recomienda nada. Hay tres formas de abrirla, de la más sencilla a la más completa.

## Cómo abrirla

| # | Qué es | Cómo se abre | Qué incluye | Qué NO incluye |
|---|---|---|---|---|
| 1 | **Demo autónoma** (`demo/index.html`) | Doble clic al archivo, o publicarla con `wrangler pages deploy demo --project-name klever-demo` para tener un enlace público | Toda la interfaz con un servidor simulado dentro de la página: editar, guardar, publicar, errores de guardado, empresas y fichas | Lo creado se pierde al recargar la página; no hay cuentas ni email; un único «dispositivo»: no se puede probar el otro navegador ni el conflicto entre dos dispositivos |
| 2 | **Versión completa local** (`scripts/local/arrancar.sh`) | `bash scripts/local/arrancar.sh` y abrir <http://localhost:8788> | Web + API + base de datos D1 simulada; **lo guardado sobrevive a recargar y a reiniciar el servidor** (`RESET=1` para empezar de cero); dos navegadores = dos dispositivos | Necesita Node.js; el enlace de acceso sale en pantalla («Modo desarrollo: entrar»), no por email; los gráficos de TradingView no cargan sin internet |
| 3 | **Artefacto privado de Claude** | <https://claude.ai/artifact/6MEdsYjnZaUPwXtUxriEiD> | La demo autónoma dentro de Claude | Solo la abre la persona propietaria |

Para las pruebas con otras personas, lo recomendable es la opción 1 publicada (enlace público) o la 2 en un ordenador con la persona delante.

## Guion de prueba (opción 2; las que dicen «demo» valen también en la 1)

Cada tarea tiene un resultado esperado. Anota si coincide, si dudaste o si te perdiste.

1. **Crear, editar y guardar.** En la portada elige «Dividendos», cambia dos pesos, pulsa «Guardar cartera», entra con tu email (en pruebas el enlace aparece en pantalla). *Esperado:* aparece «Cartera guardada» y el estado dice «Guardada en tu cuenta».
2. **Cerrar y reabrir.** Ve a «Mis carteras», abre la cartera, **recarga la página**. *Esperado:* los pesos son los que dejaste.
3. **Cambios locales.** Cambia un peso sin guardar y vuelve a «Mis carteras». *Esperado:* la tarjeta dice «Cambios locales pendientes de guardar en tu cuenta» y muestra por separado la versión de la cuenta y la de este dispositivo. Recarga y abre la cartera: los cambios se recuperan.
4. **Fallo de guardado.** Con una cartera con cambios, abre las herramientas del navegador (F12 → pestaña «Red» → «Sin conexión»), pulsa «Guardar cartera» y después desmarca «Sin conexión» para reintentar. *Esperado:* «No se pudo guardar», «Tus cambios siguen en este dispositivo» y el botón «Reintentar guardado».
5. **Otro navegador (solo local).** Pide el enlace con un borrador sin guardar y ábrelo en **otro** navegador. *Esperado:* «Mis carteras» muestra el aviso «Tu cartera todavía no se ha guardado en la cuenta…», sin toast flotante.
6. **Conflicto (solo local).** Abre la misma cuenta en dos navegadores; en A cambia un peso sin guardar; en B cambia otro y guarda; en A pulsa «Guardar». *Esperado:* A no guarda nada y muestra «Versión de este dispositivo» y «Versión de tu cuenta» con fechas y horas; elige una.
7. **Cartera pública.** Con una cartera al 100 % escribe una tesis y pulsa «Publicar cartera». Después sube un peso hasta pasar del 100 %. *Esperado:* «Guardar y actualizar publicación» desactivado con su motivo, «Tus cambios aún no son públicos», la versión de «Carteras públicas» no cambia. Pulsa «Dejar de publicar»: debe funcionar sin perder lo que escribiste.
8. **Empresas con datos ausentes.** En «Explorar empresas» busca «JPMorgan» (sin algunos datos). *Esperado:* «N superadas · M sin datos», no «N de 5». Abre la ficha: grupos Superadas / No superadas / Sin datos.

## Qué se ha probado ya y qué no

- **Automático (hecho):** estos mismos flujos están cubiertos por la batería E (`tests/ronda5/testE.cjs`) en Chromium, con servidor local y datos inventados; los resultados esperado/observado están en `ronda6/LEEME.md`.
- **Pendiente (manual):** móviles reales, Safari y Firefox, lector de pantalla, zoom real, email real, conflicto entre dos dispositivos reales (ver `ronda6/pruebas-manuales.md`). **Nadie ha ejecutado todavía ninguna de ellas.**

## Qué observar y cómo anotarlo

Por tarea: ¿tardó en entenderse?, ¿qué texto no se entendió?, ¿dónde dudó la persona?, ¿pulsó algo que no esperabas? Apunta la frase literal. No expliques la web mientras la prueban; si se bloquean, anota dónde y por qué.

## Fuera de alcance

No hay (ni se simulan) las conexiones con Revolut y Trade Republic, el artículo diario personalizado ni el consejo diario de inversión: forman parte de un futuro plan de pago.

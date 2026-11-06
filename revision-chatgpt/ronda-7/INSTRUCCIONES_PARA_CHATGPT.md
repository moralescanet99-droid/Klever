# Rondas 6 y 7: conflicto de versiones, guardado fiable y datos ausentes (para pegar en ChatGPT)

Sube las 17 imágenes `.png` de esta carpeta a **la misma conversación** de las rondas anteriores y pega el texto de abajo. Si admite pocas imágenes por mensaje, súbelas en dos tandas: 01–09 y 10–17. Los números de captura son los del nombre de archivo.

Esta entrega cubre **dos rondas seguidas** (no hubo paquete para la ronda 6): tu feedback sobre la ronda 5 (ronda 6) y mi corrección posterior (ronda 7). Todas las capturas son de la versión actual; no hay parejas antes/después.

---

Actúa como un diseñador de producto y experto en interfaces (UI/UX) para productos financieros de particulares. Ya revisaste cinco versiones de **Klever**. Tras la ronda 5 dijiste que la base visual era suficiente y pediste cerrar puntos concretos y preparar pruebas de uso; después se pidió priorizar la **fiabilidad del guardado**. **No quiero otro rediseño general.** Esta vez te pido sobre todo que revises los textos, los estados y los diálogos de estos puntos.

## El producto (recordatorio)
Beta gratuita en la que un inversor particular crea **carteras simuladas**, ve cómo se reparten y qué ROIC medio tienen, y explora un ranking de empresas de EE. UU. con cinco comprobaciones sobre cifras de la SEC. Sin dinero real, sin recomendaciones. Acceso por enlace al email, sin contraseña; se puede probar sin registro con un borrador en el dispositivo.

## Qué se pidió y qué se ha hecho
1. **Abrir el enlace de acceso en otro navegador (captura 01).** Se quitó el aviso flotante largo. Ahora «Mis carteras» muestra un aviso fijo antes del formulario: «Tu cartera todavía no se ha guardado en la cuenta. El borrador no está disponible en este navegador. Vuelve al navegador donde lo creaste para guardarlo.», con «Entendido». No afirma que el borrador siga existiendo en otro sitio ni confirma ningún guardado.
2. **Cambios locales pendientes (02, 03).** El texto es «Cambios locales pendientes de guardar en tu cuenta». Si hay una copia local distinta de la cuenta, la tarjeta rotula cada cifra con su versión («Versión de tu cuenta» / «Versión de este dispositivo», con fecha y hora).
3. **Conflicto entre versiones (04–09).** Si la cuenta cambió después de la copia local, sale un diálogo con las dos versiones, sus fechas y una lista «Qué cambia». Salidas: **«Decidir después»** (arriba, siempre visible; también Escape), **«Usar la versión de tu cuenta»** (descarta lo local) y **«Conservar la de este dispositivo»**, que **vuelve al editor sin guardar**: hay que pulsar Guardar después (antes guardaba al instante y contradecía su propio texto). Pasa igual al abrir la cartera y al guardar (el servidor rechaza el guardado si la cuenta cambió).
4. **Guardado fiable (10, 11).** Guardar posiciones, nombre y tesis es **una sola operación todo-o-nada**. Si falla, no queda nada a medias (captura 11: cartera pública tras un fallo; lo publicado no cambia). Tras un fallo el botón es «Reintentar guardado» y se explica que los cambios siguen en el dispositivo.
5. **Cartera pública (12, 13).** El botón es «Guardar y actualizar publicación» (dos líneas en móvil) y mientras hay cambios sin guardar aparece «Tus cambios aún no son públicos»; lo publicado no cambia hasta un guardado válido. En excesos: «Reduce los pesos hasta sumar 100 %».
6. **Comprobaciones con datos ausentes (14, 15).** La lista dice «3 superadas · 2 sin datos» (y «5 de 5 superadas» solo si la evaluación es completa); la ficha agrupa en **Superadas / No superadas / Sin datos** con «Evaluación parcial». Orden real: más superadas, luego menos no superadas, luego símbolo; «sin datos» no suma ni resta.
7. **Detalles.** Tabla histórica con «Importes en miles de millones de USD; ROIC en %» (15); título de la cartera de hasta dos líneas en móvil (16); última posición alcanzable con texto ampliado al 200 % (17).

## Qué ves en las capturas
01 aviso al abrir el enlace en otro navegador (390 px) · 02/03 tarjeta con cambios locales (390 y 1440) · 04/05 diálogo de conflicto al abrir (1440 y 390) · 06 conflicto al guardar · 07 tras «Decidir después» · 08/09 el diálogo a 320 px con texto al 200 %, sin y con desplazamiento · 10 guardado fallido en móvil · 11 guardado fallido en cartera pública (sin cambios a medias) · 12/13 cartera pública con cambios pendientes (1440 y 390) · 14 empresa con datos ausentes · 15 ficha con grupos y unidades · 16 título largo · 17 última posición a 390 px con texto al 200 %.

## Limitaciones (no las critiques)
- **Datos inventados** de una base local de prueba (algunos bancos salen «sin dato» a propósito). Gráficos de TradingView como recuadros.
- Solo ves imágenes fijas: **no puedes juzgar interacción, teclado, lector de pantalla ni tiempos**. Si algo depende de eso, dilo en lugar de suponerlo. Para tu información: 196 comprobaciones automáticas pasan en Chromium contra un servidor local con base simulada, pero **ninguna prueba manual real se ha ejecutado** (móvil real, Safari, Firefox, lector de pantalla, zoom real, teclado móvil real, dos dispositivos reales, base de datos real de Cloudflare). La «ampliación al 200 %» de las capturas 08, 09 y 17 es **tamaño de texto simulado**, no zoom del navegador.
- El «otro navegador» y el «otro dispositivo» de las capturas son un contexto de navegador separado o una petición directa al servidor.
- Con 80 caracteres (máximo) el título necesita tres líneas en móvil y se desplaza dentro del campo.

## Decisiones mías que quiero que cuestiones
- **«Decidir después»** en el diálogo de conflicto (no me lo pediste): ¿evita atrapar al usuario o es una salida que deja el problema sin resolver? ¿Debería estar en la cabecera como ahora?
- **«Conservar la de este dispositivo» solo vuelve al editor**: ¿se entiende que aún hay que guardar? ¿El aviso corto «Has conservado la versión de este dispositivo. Revísala y pulsa Guardar.» basta?
- **El diálogo de conflicto**: ¿«Versión de este dispositivo / Versión de tu cuenta» y la lista «Qué cambia» se entienden sin ser técnico? ¿Demasiado largo en móvil (08/09)?
- **Aviso fijo con «Entendido»** en «Mis carteras»: ¿es mejor que el aviso flotante? ¿El texto «Vuelve al navegador donde lo creaste» es suficiente o falta una acción?
- **«Guardar y actualizar publicación»** y **«Tus cambios aún no son públicos»**: ¿se ve que lo publicado no cambia hasta guardar?
- **«3 superadas · 2 sin datos»**: ¿se entiende que «sin datos» no es un fallo? ¿Hace falta mostrar también las «no superadas» en la lista?
- **Una cartera pública que se guarda con un reparto válido se actualiza sin pedir confirmación.**

## Qué quiero que evalúes
1. ¿Siguen quedando **incoherencias** entre estados, etiquetas, botones y mensajes? Enuméralas con el número de captura.
2. **Diálogo de conflicto** (04–09): claridad del texto, jerarquía de las tres salidas, riesgo de elegir mal, uso en móvil con texto grande.
3. **Estados de guardado y de error** (10–13): ¿se entiende dónde están los cambios y qué está publicado?
4. **Tarjeta de «Mis carteras» con dos versiones** (02/03): ¿se distingue bien cada versión y cada cifra?
5. **Datos ausentes** (14/15): claridad, nombres largos, unidades.
6. **Regresiones:** ¿algo era mejor antes?
7. Todo lo que, en tu opinión, **debería probar yo a mano** y que no puedes ver en imágenes.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en: visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- Problemas ordenados por **gravedad** (crítico / importante / menor). Para cada uno: qué ocurre (con la captura), por qué es un problema y cómo arreglarlo de forma concreta.
- **Los 5 cambios que más mejorarían el producto**, en orden, y **3 cosas que quitaría**.
- Una lista final de **lo que no has podido comprobar con imágenes fijas**.

*Fuera de alcance de esta ronda (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión. Pertenecen a un futuro plan de pago.

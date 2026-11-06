# Cuarta ronda: revisión de claridad, densidad y coherencia de estados (para pegar en ChatGPT)

Sube las capturas `.png` de esta carpeta (21 imágenes) a **la misma conversación** de las rondas anteriores y pega el texto de abajo. Si admite pocas imágenes por mensaje, súbelas en dos tandas: primero las que empiezan por 01 a 10 y después las de 11 a 20.

Los nombres llevan `ANTES` o `DESPUES` y un número. Las capturas largas van partidas en partes, de arriba a abajo.

---

Actúa como un diseñador de producto y experto en interfaces (UI/UX) para productos financieros de particulares. Ya revisaste tres versiones de **Klever**. En la ronda anterior señalaste varios problemas citando las capturas 06, 09, 11, 12 y 14. Esta es la versión que los aborda. Quiero otra crítica **dura, concreta y sin cortesías**: prefiero que me digas todo lo que sigue mal a que me confirmes lo que está bien.

## El producto (recordatorio)
Beta gratuita en la que un inversor particular crea **carteras simuladas**, ve cómo se reparten y qué ROIC medio tienen, y explora un ranking de empresas de EE. UU. con cinco comprobaciones sobre cifras de la SEC. Sin dinero real, sin recomendaciones. Acceso por enlace al email. Español de España. Recorrido a proteger: **probar una cartera → comprenderla → guardarla → volver a consultarla.**

## Qué señalaste y qué se ha hecho
1. **Captura 09 (103 % asignado: «Guardar» desactivado y «Publicar» disponible).** Se comprobó el comportamiento real: «Publicar» con un 103 % lanzaba una petición que el servidor rechazaba y la cabecera decía «Error al guardar» sin que nadie hubiera pulsado Guardar; y con un 88 % la cartera **llegaba a publicarse incompleta**. Ahora hay **una sola regla**, aplicada igual en la interfaz y en el servidor:
   - Más de 100 %: ni se guarda ni se publica. Se explica el motivo junto a la acción afectada.
   - Menos de 100 %: es un **reparto incompleto**. Se puede guardar en privado; **no se puede publicar**. No existe efectivo implícito.
   - Una cartera ya pública debe mantener el 100 % (si no, hay que dejar de publicarla antes). «Dejar de publicar» siempre está disponible.
   - Si no es válida, no se envía ninguna petición; una operación fallida nunca muestra confirmación; el borrador local se conserva.
   - El estado separa **tres conceptos**: dónde está guardada (este dispositivo o tu cuenta), si hay cambios pendientes, y si es privada o pública.
2. **Resumen que dice exactamente lo que muestra:** «100 % asignado» / «Pendiente de asignar: 12 %» / «Exceso de asignación: 3 %»; «Distribución por categorías» (con nota de que no es exposición sectorial de los ETF); «ROIC medio de empresas con datos» con «No representa la rentabilidad de tu cartera»; cobertura por posiciones **y** por peso con denominador definido; media ponderada explicada; «No aplicable» (fondos) frente a «No disponible» (dato ausente).
3. **Captura 06 (cabecera móvil excesiva y guardar duplicado):** cabecera global de 61 px (antes 105) con menú accesible; sin botón «Guardar» duplicado en la cabecera; barra inferior de 72 px con total, estado breve y acción; lista plana de posiciones sin tarjetas anidadas; nombre completo al desplegar los detalles; el estado de guardado se muestra una sola vez.
4. **Captura 14 (gráficos antes que el resumen en tableta):** en una columna el orden es resumen breve → posiciones → resumen detallado → gráficos → publicación. En escritorio, dos columnas.
5. **Captura 12 (empresas sin encabezados ni acción):** tabla con encabezados Empresa · Sector · Comprobaciones superadas · acción; «Ver ficha» visible; filas de 60 px; criterio de orden y desempate explicados; aviso de que no es una recomendación de compra; sin paginación ficticia.
6. **Captura 11 (tabla histórica cortada en móvil):** desplazamiento solo dentro de la tabla, con aviso y columna del año fija; título con «miles de millones de dólares (USD)»; cabecera con «Cerrar» fija.
7. **Portada:** texto acortado, SEC a texto secundario de fuentes, vista previa de escritorio abreviada (3 posiciones + «+3 posiciones» con totales de las 6), plantillas móviles compactas (357 px frente a 649), etiquetas veraces «Ejemplo de Klever» / «Publicada por un usuario».
8. **Enlace de acceso abierto en otro dispositivo:** el texto ya no promete guardar el borrador; si se abre en otro navegador se entra en la cuenta pero no se guarda nada, y se avisa.

## Qué ves en las capturas
- `01`/`02`, `03`/`04`, `05`/`06`, `07`/`08`: editor antes y después en móvil, escritorio y tableta, con un 103 % (estado inválido) y con la cartera válida y guardada. La `08` es la tableta con la barra inferior colocada al final de la página (en la captura `07` «antes» esa barra aparece a mitad de la imagen: es un efecto de la captura de página completa).
- `09`/`10`, `11`/`12`: explorar empresas, antes y después. `13`/`14`: ficha en móvil.
- `15`/`16`/`17`: portada. `18`: «Mis carteras». `19`: editor con exceso en tema oscuro. `20`: editor a 360 px.

## Limitaciones de las capturas (no las critiques)
- **Datos inventados** de una base local de prueba (algunos bancos salen «sin dato» a propósito). Los gráficos de TradingView son recuadros con «Cargar».
- Solo ves imágenes fijas: **no puedes juzgar interacción, teclado, lector de pantalla ni tiempos**. Si algo depende de eso, dilo en vez de suponerlo. Para tu información, esos flujos se han probado con un navegador automático (130 comprobaciones), pero no con dispositivos ni lectores reales.

## Decisiones mías que quiero que cuestiones
- **«Reparto incompleto»:** se guarda en privado pero no se publica, y las carteras públicas deben sumar siempre 100 %. ¿Es la regla correcta o genera fricción? ¿Está bien explicada en pantalla?
- **Estado de guardado en tres conceptos:** ¿se entiende la diferencia entre «Guardado en este dispositivo», «Guardada en tu cuenta», «Cambios sin guardar» y «Privada/Pública»? En móvil el estado solo aparece en la barra inferior, con un ⓘ que abre el detalle; ¿lo descubre alguien?
- **Resumen breve arriba y total en la barra inferior (móvil):** ¿es redundante?
- **Etiquetas del resumen** («Exceso de asignación», «Pendiente de asignar», «ROIC medio de empresas con datos», «No aplicable»/«No disponible»): ¿se entienden sin ser experto o se han vuelto demasiado técnicas?
- **«Carteras públicas»** como nombre de sección y las etiquetas de origen.
- **Barra inferior móvil con mensajes cortos** como «exceso 3 %» y «Reduce el exceso»: ¿son suficientemente claros?

## Qué quiero que evalúes
1. ¿Siguen quedando **incoherencias** entre estados, etiquetas, botones y mensajes? Enuméralas con la captura donde las ves.
2. **Claridad y densidad:** ¿cada pantalla se entiende de un vistazo? ¿Qué sobra, qué compite por la atención, qué falta?
3. **Móvil:** ¿cabecera, barra inferior, lista de posiciones y detalles se pueden usar con una mano? ¿Se llega rápido a lo importante?
4. **Explorar empresas y ficha:** ¿se lee cada fila como una unidad? ¿«5 de 5» no parece una recomendación? ¿Se entiende «no disponible»?
5. **Confianza y tono** para un producto financiero; textos y etiquetas de botones.
6. **Regresiones:** ¿algo era mejor antes?
7. Todo lo que, en tu opinión, **debería probar yo a mano** y que no puedes ver en imágenes.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en: visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- Problemas ordenados por **gravedad** (crítico / importante / menor). Para cada uno: qué ocurre (con la captura), por qué es un problema y cómo arreglarlo de forma concreta.
- **Los 5 cambios que más mejorarían el producto**, en orden, y **3 cosas que quitaría**.
- Una lista final de **lo que no has podido comprobar con imágenes fijas**.

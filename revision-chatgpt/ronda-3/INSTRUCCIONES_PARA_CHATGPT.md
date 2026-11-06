# Tercera ronda: crítica del rediseño (para pegar en ChatGPT)

Sube a ChatGPT las 14 capturas `.png` de esta carpeta y pega el texto de abajo. Conviene usar la **misma conversación** de las rondas anteriores, para que pueda comparar con sus críticas previas. Si abres una conversación nueva, el texto funciona solo.

Las imágenes llevan el prefijo `ANTES` o `DESPUES` y un número de orden. Las capturas muy largas de móvil (01, 02 y 05) van partidas en varias partes (`-parte1de2`, etc.), de arriba a abajo. Si ChatGPT admite pocas imágenes por mensaje, súbelas en dos tandas: primero las que empiezan por 01 a 07 y luego las de 08 a 14.

---

Actúa como un diseñador de producto y experto en interfaces (UI/UX) con mucha experiencia en productos financieros para particulares. Ya revisaste dos versiones de esta web. Ahora te paso el **rediseño completo** y quiero otra crítica **dura, concreta y sin cortesías**: prefiero que me digas todo lo que sigue mal a que me confirmes lo que está bien. No suavices.

## El producto
**Klever** es una beta gratuita en la que un inversor particular crea **carteras simuladas** (plantillas de oro, dividendos y crecimiento), ve cómo se reparten y qué rentabilidad media sobre el capital (ROIC) tienen, y explora un ranking de empresas de EE. UU. con cinco comprobaciones sobre cifras oficiales de la SEC. Sin dinero real y sin recomendaciones personalizadas. Acceso por enlace al email, sin contraseña. Español de España.

## El objetivo del rediseño
Priorizar este recorrido: **probar una cartera → comprenderla → guardarla → volver a consultarla.**
El principio de diseño es: que la persona entienda *qué ocurre, qué requiere atención y qué hacer después*, sin leer instrucciones largas. Juzga el rediseño frente a ese principio.

## Qué se pidió cambiar y qué se ha hecho
1. **Portada** más ligera: cabecera compacta; titular «Crea y entiende tu cartera simulada»; una frase; una acción dominante «Probar una cartera»; plantillas con su contenido; en escritorio, una vista previa **real** del editor (no una ilustración); carteras públicas reducidas a una muestra; el listado completo de empresas y el screener se mueven a «Explorar empresas».
2. **Editor como espacio de trabajo:** nombre editable, estado (Borrador/Privada/Pública), estado de guardado y botón principal «Guardar cartera»; en escritorio, posiciones a dos tercios y resumen fijo al tercio; pesos editables en la tabla; buscador de activos por nombre o símbolo; muestra cuánto falta o sobra para el 100 %; «Reemplazar por plantilla» y «Eliminar» en un menú secundario con confirmación; publicación plegada y como acción secundaria; gráficos de precio en sección aparte.
3. **Móvil diseñado aparte** (no es la tabla comprimida): cada posición es una fila compacta con el peso editable a la derecha y detalles desplegables; barra inferior fija con el total asignado y «Guardar cartera»; número y unidad nunca se parten.
4. **Sistema visual:** fondo #F6F8FB, texto #17212F, acento verde petróleo #0F766E, radios de 12 px, espacios de 8/16/24/32, un solo botón relleno por zona; tema oscuro con superficies propias.
5. **Acceso y estados:** diálogo «Guarda tu cartera / Te enviaremos un enlace para entrar sin contraseña»; tras enviar, confirmación con el email, «Cambiar email» y «Reenviar enlace»; sin mensajes en rojo que no sean errores.
6. **Ficha de empresa:** cabecera con empresa, símbolo, sector y periodo; cinco comprobaciones en filas con valor y resultado (icono + texto); metodología, fuentes y glosario plegados; el ROIC se explica como medida de la empresa y no como lo que gana el inversor; si una media tiene activos sin dato, se indica la cobertura y se excluyen en vez de contarlos como cero.

**Decisión que quiero que cuestiones:** la sección se llama «Carteras públicas» y no «Carteras de ejemplo», porque incluirá las que publiquen los usuarios.

## Qué ves en las capturas
- `01` y `02` / `03` y `04`: portada, antes y después, en móvil y escritorio.
- `05` y `06` / `07` y `08`: editor, antes y después. La `06` es el editor tal como se ve en un móvil real (con la barra inferior fija); en capturas de página completa esa barra queda al final de la página.
- `09`: editor en tema oscuro con el bloque de publicación abierto y los pesos sumando más de 100 % (estado de error).
- `10`: diálogo tras pedir el enlace. `11`: ficha en móvil. `12`: vista «Explorar empresas». `13`: portada en oscuro. `14`: tableta.

## Limitaciones de las capturas (no las critiques)
- **Datos inventados** de una base local de prueba. Algunos bancos salen «sin dato» a propósito para probar la cobertura.
- Los gráficos de TradingView aparecen como recuadros con el botón «Cargar» porque el entorno no tiene Internet.
- La línea «Modo desarrollo: entrar» de la captura `10` solo existe en el entorno de pruebas.
- Solo ves imágenes fijas: **no puedes juzgar animaciones, tiempos de respuesta, teclado ni lector de pantalla**. Si algo depende de eso, dilo en vez de suponerlo.

## Qué quiero que evalúes
1. **Primera impresión (5 segundos)** de la portada en móvil y escritorio, antes frente a después. ¿Se entiende qué es, para quién y qué hacer primero? ¿Genera confianza para un producto financiero?
2. **El editor:** ¿se entiende a primera vista qué hay, cuánto falta para el 100 % y cuál es el siguiente paso? ¿La jerarquía entre guardar, publicar y las acciones secundarias es clara? ¿Qué sobra y qué falta? En móvil: ¿la barra inferior y las filas compactas funcionan bien con una mano?
3. **Recorrido completo** probar → comprender → guardar → volver. ¿Dónde se atascaría un usuario nuevo? ¿Qué le haría abandonar?
4. **Números y finanzas:** ¿se entienden los porcentajes, «Cartera completa», «Cobertura parcial», el ROIC medio y la ficha sin ser experto? ¿El aviso legal está bien ubicado sin molestar?
5. **Sistema visual:** jerarquía, espacios, tipografía, color, consistencia, tema oscuro. ¿Parece una herramienta financiera cuidada y profesional, o genérica? Sé concreto.
6. **Accesibilidad** visible en las capturas: contraste, tamaños táctiles, color como único indicador.
7. **Textos:** claridad, tono, etiquetas de botones, mensajes de estado.
8. **Regresiones:** ¿algo del diseño anterior era mejor?

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en: visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- Problemas ordenados por **gravedad** (crítico / importante / menor). Para cada uno: qué ocurre, por qué es un problema y cómo arreglarlo de forma concreta (valores aproximados de tamaños, espacios, colores o textos cuando ayude).
- **Los 5 cambios que más mejorarían el producto**, en orden, y **3 cosas que quitaría**.
- Una lista final de **lo que no has podido comprobar con imágenes fijas** y que yo debería probar a mano.

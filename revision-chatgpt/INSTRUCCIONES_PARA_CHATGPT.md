# Segunda ronda de crítica de diseño e interacción (para pegar en ChatGPT)

Sube a ChatGPT todas las capturas `.png` de esta carpeta y pega el texto de abajo. Conviene usar la misma conversación de la primera ronda; si no, el texto funciona solo.

---

Actúa como un diseñador de producto y experto en interfaces (UI/UX) con mucha experiencia en productos financieros para particulares. Esta es la **segunda versión** de una web en beta que ya criticaste. Te adjunto capturas nuevas. Quiero otra crítica **dura, concreta y sin cortesías**: prefiero que me digas todo lo que sigue mal a que me confirmes lo que está bien.

## Qué es el producto
**Klever**: web gratuita (beta de un mes) en la que inversores particulares crean **carteras simuladas** (plantillas de oro, dividendos y crecimiento), ven su composición, el reparto por sector y la rentabilidad media sobre el capital (ROIC), y descubren **ideas de empresas** de EE. UU. con un ranking propio de 5 comprobaciones sobre cifras oficiales de la SEC (deuda, rentabilidad, margen, caja, crecimiento). Hay carteras públicas de ejemplo (solo composición y tesis, sin rentabilidad). Acceso por enlace al email, sin contraseña. Español de España. Sin dinero real y sin recomendaciones personalizadas.

**Objetivo de la beta:** que los visitantes prueben una cartera, se registren, guarden al menos una y vuelvan pasada una semana. Todo lo que no ayude a eso sobra.

## Qué dijiste en la primera ronda y qué se ha cambiado
Tu veredicto fue: se entiende como herramienta de carteras simuladas, interfaz limpia, pero parece más una demo que un producto financiero que genere confianza. Se ha hecho esto:

1. **Banner de cookies que tapaba el registro en móvil:** se ha eliminado el banner global. El permiso para cargar los gráficos de TradingView se pide ahora en el propio hueco del gráfico («Cargar» / «Ahora no») y se puede cambiar desde el pie de la página.
2. **Propuesta de valor poco clara frente a una hoja de cálculo o un bróker:** nueva portada con título y subtítulo concretos y tres frases de valor.
3. **Dejar probar antes de pedir el email:** tres botones de plantilla abren un editor sin registro; el borrador se conserva y se guarda en la cuenta al entrar con el email.
4. **Guardar, publicar y cargar mezclados en el editor:** ahora «Guardar» (privado) y «Publicación» son bloques separados, con estado (Privada/Pública), explicación de consecuencias y aviso de cambios sin guardar. El botón de plantilla explica qué sustituye.
5. **Métricas financieras poco claras:** unidades y términos en español (veces, %, miles de millones de USD), coma decimal, criterios redactados en claro y glosario desplegable en la ficha de empresa.
6. **Tabla completa de empresas en la portada:** ahora salen 8, con buscador y «Ver las N empresas».
7. **Accesibilidad:** etiquetas en campos, cabeceras de tabla, objetivos táctiles de 44 px, contraste revisado (todo ≥ 4,5:1).

**Evalúa si cada punto está realmente resuelto o si lo he arreglado a medias o creado problemas nuevos.**

## Qué ves en las capturas
- `01-primera-pantalla-…`: lo primero que ve un visitante nuevo.
- `01b-pagina-completa-…`: la página de inicio entera (en móvil va partida en varias partes, de arriba a abajo).
- `02-editor-sin-registro-…`: el editor tras pulsar «Cartera de dividendos», sin cuenta.
- `03-pedir-email-…`: lo que aparece al pulsar «Guardar con mi email».
- `04-editor-con-cuenta-guardar-y-publicar-…`: el editor ya con sesión iniciada (bloques Guardar y Publicación).
- `05-ficha-de-empresa-…`: la ficha de una empresa del ranking.
- Variantes en escritorio y móvil, en claro y oscuro (algunas solo en claro).

## Limitaciones de las capturas (no las critiques)
- Es una demo con **datos inventados**; los números no significan nada.
- Los recuadros punteados que dicen «Aquí iría el widget de TradingView» son huecos de gráficos y de un screener de precios que en la web real carga TradingView. Juzga el espacio y cómo encajan, no su contenido.
- Un aviso amarillo de «Demo interactiva» aparece arriba solo en esta demo; en la web real no existe.
- Algunas capturas muestran solo una parte de la página.

## Qué quiero que evalúes
1. Primera impresión en 5 segundos: ¿se entiende qué es, para quién y qué hago primero? ¿Genera confianza para algo relacionado con dinero?
2. Jerarquía y composición: orden de secciones, qué compite por la atención, espacio, consistencia.
3. Tipografía y color: legibilidad, contraste, si la identidad es genérica.
4. Interacción y flujos: probar sin cuenta → guardar → pedir email → editor con cuenta → guardar → publicar → ver ideas y fichas. Fricciones, pasos que sobran, controles poco claros, feedback ausente.
5. Móvil: usabilidad real con una mano (tablas, formularios, botones, longitud de la página).
6. Accesibilidad.
7. Cifras financieras: ¿se entienden sin ser experto? ¿Aviso legal bien ubicado sin molestar?
8. Textos: claridad, tono, etiquetas de botones.
9. Qué haría que un usuario se vaya y qué haría que vuelva a la semana.

## Formato de respuesta
- **Veredicto de 3 líneas** y nota del 1 al 10 en: visual, interacción, confianza y móvil, **comparando con tu valoración anterior**.
- Lista de problemas ordenados por gravedad (crítico / importante / menor). Para cada uno: qué ocurre, por qué es un problema y cómo arreglarlo de forma concreta (valores aproximados de tamaños, espacios, colores o textos cuando ayude).
- **Los 5 cambios que más mejorarían el producto**, en orden, y **3 cosas que quitaría**.
- Si algo no puedes juzgarlo con las capturas, dilo en vez de suponerlo.

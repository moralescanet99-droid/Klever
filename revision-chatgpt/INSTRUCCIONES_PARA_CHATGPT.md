# Pide una crítica de diseño e interacción (para pegar en ChatGPT)

Sube a ChatGPT las capturas de esta carpeta (todas los `.png`) y pega el texto de abajo.

---

Actúa como un diseñador de producto y experto en interfaces (UI/UX) con mucha experiencia en productos financieros para particulares. Te adjunto capturas de una web en fase beta. Quiero una crítica **dura, concreta y sin cortesías**: prefiero que me digas todo lo que está mal a que me digas lo que está bien.

## Qué es el producto
**Klever**: web gratuita (beta de un mes) en la que inversores particulares crean **portafolios simulados** (plantillas de riesgo, oro y dividendos), ven su composición, el peso por sector y la «calidad media» (ROIC), y descubren **ideas de empresas** con fundamentales sólidos mediante un ranking propio de 5 criterios (deuda/EBITDA, ROIC, margen neto, flujo de caja, crecimiento). Hay portafolios públicos simulados (solo composición y tesis, sin rentabilidad). Acceso por enlace al email, sin contraseña. Idioma: español de España. Sin dinero real y sin recomendaciones personalizadas.

**Objetivo de la beta:** que los visitantes se registren, creen al menos un portafolio y vuelvan pasada una semana. Todo lo que no ayude a eso sobra.

## Qué ves en las capturas
- `01-...`: lo primero que ve un visitante (con el banner de cookies encima).
- `02-...`: la página completa de inicio (en móvil va partida en parte1 y parte2, de arriba a abajo).
- `03-...`: el editor de un portafolio ya con sesión iniciada.
- `04-...`: la ficha de una empresa del ranking de ideas.
- Variantes en escritorio y móvil, en claro y oscuro.

## Limitaciones de las capturas (no las critiques)
- Es una demo con **datos inventados**; los números no significan nada.
- Los recuadros punteados que dicen «Aquí iría el widget de TradingView» son huecos donde en la web real aparecen gráficos de precios y un screener de TradingView. Juzga el espacio que ocupan y cómo encajan, no su contenido.
- Algunas capturas, como el editor o la ficha, muestran solo esa parte de la página.

## Qué quiero que evalúes (en este orden)
1. **Primera impresión (5 segundos):** ¿se entiende qué es, para quién es y qué hago primero? ¿Inspira confianza para algo relacionado con dinero?
2. **Jerarquía y composición visual:** orden de las secciones, qué compite por la atención, espacio en blanco, tamaño y peso de los títulos, uso del color, consistencia entre componentes.
3. **Tipografía y color:** legibilidad, contraste (claro y oscuro), si la identidad visual es genérica o tiene personalidad.
4. **Interacción y flujos:** registro, crear portafolio, añadir posiciones, guardar, publicar, explorar ideas, abrir una ficha. Fricciones, pasos que sobran, controles poco claros, feedback ausente, errores previsibles, qué haría un usuario nuevo mal.
5. **Móvil:** si es realmente usable con una mano (tablas, formularios, banner, navegación).
6. **Accesibilidad:** contraste, tamaños táctiles, foco de teclado, lectores de pantalla, color como único indicador.
7. **Datos financieros:** cómo se presentan cifras, porcentajes, criterios cumplidos/no cumplidos; si se entiende sin ser experto; si el aviso legal está donde corresponde sin molestar.
8. **Textos:** claridad, tono, etiquetas de botones y mensajes.
9. **Lo que haría que un usuario se vaya** y lo que haría que vuelva a la semana.

## Formato de respuesta
- Empieza con un **veredicto de 3 líneas** y una nota del 1 al 10 en: visual, interacción, confianza y móvil.
- Después una lista de problemas ordenados por **gravedad** (crítico / importante / menor). Para cada uno: *qué ocurre, por qué es un problema, cómo arreglarlo de forma concreta* (con valores aproximados de tamaños, espacios, colores o textos cuando ayude).
- Cierra con **los 5 cambios que más mejorarían el producto**, en orden, y **3 cosas que quitarías**.
- Si algo no puedes juzgarlo con las capturas, dilo en vez de suponerlo.

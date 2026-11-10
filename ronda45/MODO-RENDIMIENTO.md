# Modo «Rendimiento» de la Liga (decisión C71, «Mixto»)

La Liga tiene **dos modos**, y cada liga elige el suyo al crearse:
- **Cuidado:** el actual. Equilibrio 50 + Aprendizaje 30 + Constancia 20; sin precios.
- **Rendimiento:** nuevo. Premia la rentabilidad **simulada y ajustada al riesgo**, con reglas.

## Reglas propuestas del modo Rendimiento
1. **Índice que empieza en 100** al inicio de la temporada. Se calcula con los precios de cierre diarios y los pesos de la foto de cada lunes (la cartera se «congela» de lunes a lunes).
2. **Puntúa la rentabilidad ajustada al riesgo,** no la bruta: rentabilidad de la temporada ÷ volatilidad semanal, una medida tipo Sharpe sin tipo libre de riesgo. Se enseña también la rentabilidad bruta, rotulada «simulada».
3. **Solo puntúa quien cumple las reglas de diversificación:** máximo 25 % por empresa y mínimo 5 sectores. La liga puede endurecerlas, pero no relajarlas.
4. **Las carteras de los demás quedan ocultas** hasta que acaba la temporada (para que nadie copie al líder). Durante la temporada solo se ven el índice y el puesto.
5. **Premios:** sin valor en dinero (insignias), o bien en ligas **sin ventajas de pago** (Ley 13/2011, art. 3; consulta pendiente, anexo C66).
6. **Siempre visible:** «Rentabilidad simulada con precios pasados · no es una recomendación · el pasado no garantiza el futuro».

## Requisitos antes de construirlo
- **Empresas reales,** no inventadas: un catálogo cerrado de unas 150–300, con la huella de la SEC (ya hay un script) y su sector.
- **Fuente de precios de cierre con licencia que permita mostrar a los usuarios un índice calculado a partir de ellos.** Candidatas (precios de búsqueda del 2026-11-10, sin verificar en la página oficial):
  - **EODHD «All World»:** unos 19,99 $/mes. Cubre EE. UU. y la bolsa española.
  - **Financial Modeling Prep «Starter»:** unos 22 $/mes, facturado al año.

  En las dos, **el uso comercial o mostrar los datos a terceros va con licencia aparte**, sin precio publicado: hay que preguntarles por escrito.
- **Decisión de Javier:** qué proveedor, y enviar la consulta de licencia (Claude redacta el correo).

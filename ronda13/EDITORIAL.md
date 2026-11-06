# Diseño breve de la fase editorial (NO construida en la ronda 13)

Dirección aprobada por el usuario; aquí solo cómo encajará. **No se publica contenido generado automáticamente ni se crean noticias ficticias.**
## Secciones
| Sección | Qué es | Conexión con el producto |
|---|---|---|
| **Bajo el radar** | Empresas y negocios para investigar | Enlaza a la ficha y ofrece «Guardar en mi radar» |
| **¿Qué está pasando?** | Explicación de movimientos y tendencias | Enlaza a fichas afectadas y al laboratorio («comparar antes de decidir») |
| **El Superespeculador** | Tesis argumentadas con escenarios, riesgos y **condiciones de invalidación** | Cada tesis puede abrir un escenario en el laboratorio; historial de versiones |
| **Seguimos la pista** | Actualizaciones, aciertos, errores y cambios de opinión | Enlaza a la tesis original y a su historial |
## Contrato de un artículo (D1, migración futura aditiva)
`articulos(id, seccion, titulo, resumen, cuerpo, fuente_url, fuente_fecha, publicado_en, responsable, hechos_json, interpretacion, estado borrador|revisado|publicado)` · `articulo_activos(articulo_id, ticker)` · `tesis_versiones(tesis_id, version, cuerpo, riesgos, invalidacion, creado_en, motivo_del_cambio)` (solo se añade, nunca se reescribe).
## Reglas
1. Cada artículo lleva **fuente verificable, fecha y responsable editorial** (persona con nombre, no «Klever»).
2. **Hechos e interpretación separados** visualmente y en datos (`hechos_json` vs `interpretacion`).
3. Las tesis conservan **historial público de versiones**; un cambio de opinión se publica en «Seguimos la pista», no se edita en silencio.
4. Nada se genera ni publica sin revisión humana; sin automatización de titulares ni «noticias» sintéticas.
5. Sin recomendaciones personalizadas ni rentabilidades prometidas (restricción del producto).
## Encaje en la navegación
Una entrada «Ideas» (cuarta fase) con las cuatro secciones como filtros; la ficha y el radar muestran «Artículos relacionados» solo si existen. Sin datos editoriales reales, **no se muestra la sección** (no hay secciones vacías).
## Dependencias
Responsables editoriales y proceso de revisión (decisión del usuario), almacén de artículos, y —para «¿Qué está pasando?»— una fuente de datos de mercado verificada que hoy no existe.

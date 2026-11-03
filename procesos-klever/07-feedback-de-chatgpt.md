# 07 · Feedback de ChatGPT y qué se hizo

ChatGPT actúa como **revisor externo de diseño e interacción**. Solo ve capturas y el texto de instrucciones, así que no puede juzgar interacción real, teclado, lector de pantalla ni tiempos. El usuario le entrega un paquete, copia su respuesta y la pega aquí en la conversación.

> Nota de fidelidad: del feedback de la ronda 3 el usuario no pegó la respuesta íntegra de ChatGPT, sino el encargo de la ronda 4 (texto C de `06-`), que cita sus capturas 06, 09, 11, 12 y 14. Lo registrado abajo para esa ronda sale de ese encargo.

## Revisión 1 · sobre el paquete de la ronda 2 (texto literal en `06-`, apartado A)
Veredicto: se entiende como herramienta de carteras simuladas, interfaz limpia, pero parece más una demo que un producto financiero que genere confianza.

| Punto señalado | Qué se hizo | Commit |
|---|---|---|
| En móvil el banner de cookies tapa el email y el registro | Se eliminó el banner global; el consentimiento se pide donde se usa TradingView y se cambia desde el pie | `75c16b4` |
| Propuesta de valor poco clara frente a hoja de cálculo o bróker | Portada con título y subtítulo concretos | `75c16b4` |
| Dejar explorar una cartera antes de pedir email | Probar sin registro con borrador local | `75c16b4` |
| Guardar, publicar y cargar mezclados en el editor | Guardar y publicar separados, estado y explicación | `75c16b4` |
| Métricas sin unidades ni términos claros | Unidades, coma decimal, criterios redactados, glosario | `75c16b4` |
| Quitar la tabla completa de empresas de la portada | Ocho filas con buscador (luego, ronda 3, a «Explorar empresas») | `75c16b4` |
| Contraste, foco visible y etiquetas accesibles | Etiquetas, `caption`, foco de 3 px, contraste ≥ 4,5:1 | `75c16b4` |
| (propio) tabla del editor cortada en móvil | La tabla cabe; sector en «Reparto por sector» | `de56340` |

## Revisión 2 · sobre el paquete de la ronda 3 (rediseño)
Puntos que el usuario trasladó en el encargo de la ronda 4:

| Punto | Qué se hizo | Commit |
|---|---|---|
| Captura 09: con 103 % «Guardar» desactivado y «Publicar» disponible | Regla única de composición en interfaz y servidor; «Publicar» desactivado con motivo; reparto incompleto definido; tres conceptos de estado | `b45376e` |
| Resumen impreciso («Cartera completa», «ROIC medio», «Distribución por sector») | Etiquetas exactas, cobertura, media ponderada, «No aplicable»/«No disponible» | `b45376e` |
| Captura 06: cabecera móvil excesiva y guardado duplicado | Cabecera 61 px con menú, barra inferior 72 px, sin duplicado, lista plana | `b45376e` |
| Captura 14: gráficos antes que resumen en tableta | Orden en una columna con resumen breve | `b45376e` |
| Captura 12: empresas sin encabezados ni acción | Tabla con encabezados, «Ver ficha», orden explicado | `b45376e` |
| Captura 11: tabla histórica cortada en móvil | Desplazamiento contenido, columna de año fija, escala y moneda | `b45376e` |
| Portada: texto largo, vista previa alta, plantillas altas, avisos recortados | Texto acortado, vista previa abreviada, plantillas 357 px, descripciones completas | `b45376e` |
| Enlace abierto en otro dispositivo | Aviso honesto; el borrador no se reescala | `b45376e` |

## Revisión 3 · sobre el paquete de la ronda 4 — **PENDIENTE**
Paquete entregado al usuario (`revision-chatgpt/ronda-4/`, 21 capturas + instrucciones). Se pidió a ChatGPT que cuestione expresamente:
- La regla «reparto incompleto: se guarda en privado, no se publica; las públicas suman 100 %».
- El estado en tres conceptos, y el ⓘ de la barra inferior móvil (¿se descubre?).
- La redundancia entre el resumen breve de arriba y el total de la barra inferior en móvil.
- Las etiquetas nuevas («Exceso de asignación», «Pendiente de asignar», «ROIC medio de empresas con datos», «No aplicable»/«No disponible»).
- El nombre «Carteras públicas» y las etiquetas de origen.
- Los mensajes cortos de la barra («exceso 3 %», «Reduce el exceso»).

Cuando llegue su respuesta: **pegarla aquí, revisarla contra el código antes de tocar nada, descartar lo que no aplique y registrar en esta tabla qué se hace con cada punto.**

## Cómo se prepara un paquete para ChatGPT
1. Capturas con Playwright (≤ 8000 px por lado; las largas se parten; PNG optimizado a 256 colores).
2. `INSTRUCCIONES_PARA_CHATGPT.md`: contexto del producto, qué se pidió y qué se hizo (citando sus capturas), qué ve y qué no, decisiones que debe cuestionar, formato de respuesta (veredicto de 3 líneas, notas del 1 al 10 comparadas, problemas por gravedad, 5 cambios, 3 cosas a quitar, lista de lo no comprobable).
3. Zip con imágenes + instrucciones. El usuario copia el texto **bajo la primera línea `---`** y sube las imágenes a la misma conversación.

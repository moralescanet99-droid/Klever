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

## Revisión 3 · sobre el paquete de la ronda 4 (recibida a través del encargo C2 de `06-`)
Valoración del usuario: «La ronda 4 mejora claramente Klever». Se conserva estructura, paleta, portada compacta, posiciones móviles y tabla de escritorio. Puntos a cerrar:

| Punto | Qué se hizo (ronda 5) |
|---|---|
| «Mis carteras» abre con el formulario por delante de las carteras guardadas | Lista primero (nombre, privada/pública, posiciones, total asignado, fecha real); botón «Nueva cartera» que abre el formulario a petición; sin carteras, crear es lo principal |
| Con 103 % «Publicar cartera» sigue pareciendo disponible | Causa: solo el botón primario tenía estilo `:disabled`. Ahora todos los botones desactivados lo muestran y el motivo va al lado de Guardar y de Publicar |
| Editar una cartera pública con un reparto temporalmente inválido | No modifica la versión publicada; se conserva en el dispositivo; se guarda al volver a ser válido sin despublicar |
| El estado dependía del ⓘ | Textos explícitos de persistencia («Guardada en tu cuenta», «Solo en este dispositivo», «Cambios sin guardar en tu cuenta», «No se pudo guardar»), separados de privacidad y validez; el ⓘ solo amplía |
| Confirmación flotante larga y que tapaba campos; «borrador» para todo | «Cartera guardada», arriba; «borrador» solo para lo no guardado en la cuenta |
| Resumen con redundancias («100,0 % ✓ 100 % asignado», «Sin dato: 2 fondos (no aplicable)») | «Asignado: 100 %»; «Dato ausente (no disponible)» y «No aplicable» por separado; fórmula en el desplegable; nota breve de categorías; exceso legible a 360 px |
| Explorar empresas en móvil con tres columnas que estrechan el nombre | Dos líneas por empresa; buscador junto al título; introducción de una frase; un desplegable de metodología |
| Ficha: unidad larga compitiendo con el criterio; desplazamiento de la tabla sin verificar | Cifra y unidad separadas; desplazamiento real verificado con teclado y columna del año fija |
| Entregar evidencias, no solo un total de comprobaciones | Tabla de escenarios con esperado, observado y evidencia, y pruebas manuales pendientes |

## Revisión 4 · sobre el paquete de la ronda 5 (recibida; texto literal C3 en `06-`)
Valoración: «La ronda 5 tiene una base visual suficiente. No hagas otro rediseño general.»

| Punto | Qué se hace (ronda 6) |
|---|---|
| Notificación larga de la captura 18 («borrador no disponible») | Aviso persistente dentro de «Mis carteras», antes del formulario; sin afirmar que el borrador sigue en otro dispositivo; sin confirmación de guardado al completar solo el acceso |
| «Cambios sin guardar en este dispositivo» | «Cambios locales pendientes de guardar en tu cuenta», con el mismo significado en «Mis carteras» y en el editor; la tarjeta no mezcla métricas de la versión local con las de la cuenta |
| Conflicto local/cuenta: «otra sesión» como única explicación | Diálogo con «Versión de este dispositivo» y «Versión de tu cuenta», fechas y horas reales y comparación; sin sobrescritura silenciosa (el servidor rechaza con 409 si la cartera cambió) |
| «3 de 5» con «2 no disponibles» debajo | «3 superadas · 2 sin datos»; ficha con Superadas / No superadas / Sin datos; orden documentado y sin tratar los datos ausentes como fallos |
| Guardar una cartera pública actualiza la publicación | «Guardar y actualizar publicación» (dos líneas en móvil), «Tus cambios aún no son públicos» mientras haya cambios pendientes; retirar la publicación con cambios locales inválidos sin perder el trabajo |
| Fallo de guardado, exceso, tabla histórica, título móvil | «Reintentar guardado» con la explicación de dónde están los cambios; «Reduce los pesos hasta sumar 100 %»; «Importes en miles de millones de USD; ROIC en %»; título de hasta dos líneas |
| Entrega para probar | Versión ejecutable en local (`PRUEBAS-DE-USO.md`) + demo autónoma; evidencias de los siete recorridos; pruebas manuales pendientes aparte |

## Revisión 5 · paquete de las rondas 6 y 7 (visual) — **RECIBIDA** (a la ronda 7 se le dijo «la revisión visual de la ronda 6 queda suficientemente cerrada»; resumen en `06-` C4). Los tres pulidos visuales pendientes que se arrastraron se cerraron en la ronda 10
## Revisión 6 · paquete TÉCNICO de la ronda 7 — **RECIBIDA** (literal resumido en `06-` C5)
| Punto | Acción en la ronda 8 |
|---|---|
| 1 Revisión devuelta leída después del lote (crítico) | Revisión y fecha de la propia escritura dentro de la operación (`UPDATE … RETURNING`), PUT y PATCH |
| 2 GET mezcla versiones | Lectura de cartera y posiciones en un solo lote transaccional |
| 3 `run-all.sh` éxito falso | Código de salida agregado, `trap`, fallos de arranque/timeout/resultado ausente cuentan; prueba del ejecutor |
| 4 Requisitos (Node, timeout/setsid) | Node ≥ 22.13 fijado (`engines`, `.nvmrc`, docs); scripts portables sin `timeout`/`setsid`; commit exacto |
| 5 Todo error = «ticker desconocido» | Validación previa → 400; error interno → 500 genérico + detalle en el log |
| 5 pruebas | Añadidas, con evidencia «falla antes / pasa después» |
| Migración 0007 sobre base antigua con datos | Prueba nueva con el esquema anterior y datos |
| Informe | Local / D1 remoto / pendiente separados; E16a antigua sustituida |

## Revisión 8 · paquete TÉCNICO y visual de la ronda 10 — **RECIBIDA** (resumen en `06-` C8): superó 25 pruebas técnicas y los casos A1–A7 de acceso; **A8 se interrumpió porque el ZIP no contiene `.git`**; señaló que H1 daba por superado un solape (excluía las muestras «pegado»), que había que hacer visibles y utilizables las acciones y el elemento enfocado, el espacio útil a 320 px con texto ampliado y la legibilidad durante la animación con la opacidad real; y pidió empezar la dirección visual por el editor. Acciones: ronda 11
| Punto | Acción en la ronda 11 |
|---|---|
| A8 sin `.git` | A8 en dos modos (repositorio / ZIP: «historial NO verificado»); `crear-zip.sh`/`verificar-zip.sh`; `test-zip.sh`; guía en `LEEME-PRUEBAS.md` |
| H1 podía pasar sin muestras | Reescrita: muestras elegibles obligatorias, inicio y tras desplazarse, acciones inaccesibles frente a contenido que pasa por debajo; mutación que la hace fallar |
| Acciones y foco | `scroll-padding-top` medido; fijo solo errores (y éxito en escritorio); botón de cierre compacto; foco centrado entre aviso y barra |
| 320 px con texto ampliado | Mensaje a todo el ancho, barra reorganizada (consulta de contenedor), H7: trabajar sin cerrar el aviso |
| Contraste y animación | Sin animar la opacidad; contraste con la opacidad real en cada fotograma (H1b, H8) |
| Dirección visual | Editor rediseñado como pantalla de referencia (`ronda11/SISTEMA-VISUAL.md`) |

## Revisión 9 · paquete de la ronda 11 — **PENDIENTE** (preparado en `revision-chatgpt/ronda-11/`: texto + 23 imágenes antes/después + ZIP verificable del proyecto; falta que el usuario se lo pase a ChatGPT y traiga su feedback)

## Cómo se prepara un paquete para ChatGPT
1. Capturas con Playwright (≤ 8000 px por lado; las largas se parten; PNG optimizado a 256 colores).
2. `INSTRUCCIONES_PARA_CHATGPT.md`: contexto del producto, qué se pidió y qué se hizo (citando sus capturas), qué ve y qué no, decisiones que debe cuestionar, formato de respuesta (veredicto de 3 líneas, notas del 1 al 10 comparadas, problemas por gravedad, 5 cambios, 3 cosas a quitar, lista de lo no comprobable).
3. Zip con imágenes + instrucciones. El usuario copia el texto **bajo la primera línea `---`** y sube las imágenes a la misma conversación.

## Revisión 7 · paquete TÉCNICO de la ronda 9 — **PENDIENTE** (preparado en `revision-chatgpt/ronda-9-tecnica/`; falta que el usuario se lo entregue y traiga su feedback)


## Revisión 10 · paquete de la ronda 12 — **PENDIENTE** (falta preparar el paquete y que el usuario traiga el feedback)

## Revisión 11 · paquete de la ronda 13 — **PENDIENTE** (falta que el usuario traiga el feedback de ChatGPT)

## Revisión 12 · ronda 14 — la revisión de la ronda 13 la trajo el usuario en `Klever_Claude_Ronda_14.md` (guardada literal como C11 en `06-`); ChatGPT repetirá los casos críticos de la ronda 14 (**PENDIENTE**)

## Revisión 13 · paquete de la ronda 14 — **PENDIENTE** (falta que el usuario traiga el feedback de ChatGPT; esta vez repetirá los casos críticos)

## Revisión 14 · ronda 15 — la revisión de la ronda 14 llegó como `Klever_Revision_14_y_encargo_15_1.md` (guardada literal como C12 en `06-`): 88 comprobaciones repetidas y 12 capturas; notas 6/7/7/9/7/7. ChatGPT revisará cálculos, casos límite y recorridos de la ronda 15 (**PENDIENTE**)

## Revisión 15 · ronda 16 — llegó como `Klever_Revision_15_y_encargo_16.md` (guardada literal como C13 en `06-`): 168 comprobaciones repetidas en 11 suites y 9 capturas; hallazgos: marcado aceptado en la nota guardada, EBITDA ausente = 3,5/10 con cobertura 100 %, vínculo de la pregunta por texto literal, ejemplo con «Nota pendiente. Nota pendiente». ChatGPT revisará la ronda 16 (**PENDIENTE**)

## Revisión 16 · ronda 17 — llegó como `Klever_Revision_16_y_encargo_17.md` (guardada literal como C14 en `06-`, con la maqueta aprobada): 133 comprobaciones repetidas de siete baterías; notas 7/6/8/9/7/8 (confianza, procedencia, claridad móvil, honestidad, solidez, pruebas). Hallazgos: fuente NULL y fecha «ayer» siguen dando 4,4, nota 4,4→10 y versión «foo» aceptadas, referencias editoriales inexistentes aceptadas, aserciones débiles (O1, O5e, P9). ChatGPT revisará la ronda 17 (**PENDIENTE**)

## Revisión 17 · ronda 18 — llegó como `Klever_Revision_17_y_encargo_18.md` (guardada literal como C15 en `06-`): reparación técnica y aplicación visual **rechazadas por separado** (cierre completo); 139 comprobaciones repetidas de siete baterías. Notas 8/7/7/9/7/8 (confianza, procedencia, claridad móvil, honestidad, solidez, pruebas). Hallazgos: I1 décima imposible aceptada, I2 fecha con sufijo, I3 creador móvil largo, I4 comparables ajenos y caché, M1–M5. ChatGPT revisará la ronda 18 (**PENDIENTE**)

## Revisión 18 · ronda 19 — llegó como `Klever_Revision_18_y_encargo_19.md` (guardada literal como C16 en `06-`): se pidió cerrar el redondeo (caso 5,44/5,44/5,44/5,46/5,44 con nota 5,5), medir a 320 px el rectángulo del resultado entre la zona útil y la barra, reescribir la revisión sin nota (ETF, datos, cobertura), aportar evidencia de regresión con logs íntegros y preparar —sin darla por hecha— la prueba con cinco principiantes. Atendido en la ronda 19 (`ronda19/LEEME.md`).

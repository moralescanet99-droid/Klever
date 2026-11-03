# 06 · Peticiones del usuario

Aquí están los encargos largos **literales** (no resumidos) y, después, el resto de instrucciones en orden aproximado. Lo que escribió el usuario manda sobre cualquier resumen de otros archivos.

---

## A. Veredicto de ChatGPT pegado por el usuario (sobre la ronda 2)

> Ya lo tengo: mi veredicto es que se entiende como herramienta de carteras simuladas, interfaz limpia, pero parece más una demo que un producto financiero listo para generar confianza. Problemas clave: en móvil el banner de cookies tapa el email y el registro, la propuesta de valor no deja claro por qué usarlo frente a una hoja de cálculo o un bróker, y en el editor se mezclan acciones de guardar, publicar y cargar sin explicar consecuencias. Cambios con más impacto: en móvil no bloquear el registro con cookies, aclarar el mensaje principal con un título y subtítulo concretos, dejar explorar una cartera antes de pedir email, separar guardar vs. publicar en el editor y simplificar métricas financieras con unidades y términos claros en español. También quitaría la tabla completa de empresas de la página inicial para que el primer contacto sea más ligero, y comprobaría contraste, foco visible y etiquetas accesibles en código. No puedo juzgar bien los flujos reales de guardado o error sólo con estas capturas.

---

## B. Encargo de rediseño completo (ronda 3)

> Quiero que rediseñes Klever para que parezca una herramienta financiera cuidada, clara y profesional. Conserva las funcionalidades existentes y prioriza probar una cartera → comprenderla → guardarla → volver a consultarla.
>
> La referencia conceptual es la que buscamos para Administrea y nuestra aplicación de recordatorios de WhatsApp: entender qué ocurre, qué requiere atención y qué hacer después sin leer instrucciones largas. Adapta esos principios al inversor particular.
>
> 1. REORGANIZA LA PORTADA
>
> La portada actual tiene demasiado texto y demasiados bloques con idéntica importancia.
>
> - Usa una cabecera compacta: marca, «Explorar empresas», «Carteras de ejemplo» y «Entrar».
> - Acorta el titular: «Crea y entiende tu cartera simulada».
> - Añade una sola frase explicativa y una acción dominante: «Probar una cartera».
> - Sitúa la selección de plantilla inmediatamente después: oro, dividendos y crecimiento. Cada opción debe explicar brevemente qué contiene.
> - En escritorio, acompaña el texto con una vista previa real del editor. Evita ilustraciones decorativas que no expliquen el producto.
> - Reduce las carteras públicas a una muestra breve. Traslada el listado completo de empresas y el screener a «Explorar empresas».
>
> No evalúes el aviso amarillo de demo como parte de la portada real; el paquete indica que solo aparece en la demostración.
>
> 2. CONVIERTE EL EDITOR EN UN ESPACIO DE TRABAJO
>
> - Cabecera: nombre editable, estado «Privada», estado de guardado y botón principal «Guardar cartera».
> - Escritorio: zona de posiciones ocupando aproximadamente dos tercios del espacio y resumen en el tercio restante.
> - Resumen: porcentaje asignado, número de posiciones y distribución. Mantén visibles los datos necesarios mientras se edita.
> - Tabla a todo el ancho disponible: activo, sector, peso y métricas. Alinea cifras a la derecha y utiliza números de ancho uniforme.
> - Sustituye el selector largo por búsqueda de nombre o símbolo.
> - Permite modificar el peso directamente y muestra cuánto falta o sobra para llegar al 100 %.
> - Mueve «Reemplazar por plantilla» y «Eliminar cartera» a un menú secundario. Protege la sustitución de posiciones existentes.
> - Sitúa los gráficos de precio en una sección secundaria, sin competir con la composición.
>
> 3. DISEÑA EL MÓVIL DE FORMA ESPECÍFICA
>
> No comprimas la tabla de escritorio.
>
> - Presenta cada posición como una fila o tarjeta compacta: símbolo y nombre a la izquierda; peso editable a la derecha; detalles desplegables.
> - Mantén juntos número y unidad: «16,6 %» nunca debe partirse.
> - Usa márgenes laterales de 16 px y controles táctiles de al menos 44 × 44 px.
> - Añade una barra inferior de guardado cuando sea útil, reservando espacio para que no tape contenido ni controles.
> - Deja la publicación y las explicaciones extensas plegadas inicialmente.
>
> 4. DEFINE UN SISTEMA VISUAL CONSISTENTE
>
> Dirección: sobria, moderna y legible.
>
> - Fondo claro de referencia: #F6F8FB; superficies blancas; texto principal #17212F; acento verde petróleo #0F766E.
> - Comprueba el contraste de cada combinación antes de adoptarla.
> - Ancho máximo orientativo: 1200 px; espacios de 8, 16, 24 y 32 px; radios de 12 px.
> - Cuerpo de 16 px; títulos de sección de 22–24 px; titular principal de 40–48 px en escritorio y 28–32 px en móvil.
> - Usa bordes suaves y sombras discretas. Evita encerrar cada párrafo en otra tarjeta.
> - Reserva el botón relleno para la acción principal de cada zona. Acciones secundarias con menor énfasis.
> - Diseña el modo oscuro con superficies diferenciadas y estados legibles, no mediante una simple inversión de colores.
>
> 5. CORRIGE LOS ESTADOS Y LOS TEXTOS
>
> - El mensaje para entrar con email no es un error: elimina su presentación roja.
> - Simplifica el acceso: «Guarda tu cartera» y «Te enviaremos un enlace para entrar sin contraseña».
> - Tras enviar el enlace, muestra confirmación, opción de corregir el email y mecanismo de reenvío.
> - Garantiza la conservación del borrador durante el acceso.
> - «Guardando», «Guardado», «Cambios sin guardar» y «Error al guardar» deben reflejar estados reales y coherentes. En la captura aparecen una confirmación de guardado y cambios pendientes simultáneamente: investiga la causa.
> - Mantén «Publicar» como acción secundaria y explica que hace pública la composición y la tesis.
> - Sustituye «Públicos» por «Carteras de ejemplo» o «Carteras públicas», según el contenido.
>
> 6. MEJORA LA LECTURA DE LAS FICHAS
>
> - Cabecera con empresa, símbolo, sector y periodo de los datos.
> - Resume las cinco comprobaciones en filas: criterio, valor y resultado.
> - Combina texto e iconos; no dependas únicamente del color.
> - Mantén metodología, fuentes y glosario accesibles mediante despliegues.
> - Explica qué significa el ROIC y evita presentarlo como rentabilidad obtenida por el inversor.
> - Si muestras una media con activos sin dato, indica su cobertura y método de cálculo. No conviertas un dato ausente en cero ni ocultes su exclusión.
>
> 7. ENTREGA Y VERIFICA
>
> Implementa primero portada, editor y móvil; después ficha, acceso y estados secundarios.
>
> Entrega capturas comparables antes/después en 360, 390, 768 y 1440 px, en ambos temas. Comprueba teclado, foco visible, ampliación al 200 %, ausencia de desbordamientos y estados vacíos, de carga y error.
>
> Prueba el recorrido completo desde la plantilla hasta guardar y volver a abrir la cartera. Verifica que publicar y despublicar muestran el estado correcto.
>
> No añadas dependencias de pago, testimonios inventados, rentabilidades ficticias ni funciones nuevas que distraigan de la beta. Distingue lo implementado de lo realmente probado.

---

## C. Encargo de la ronda 4 (claridad, densidad visual y coherencia de estados)

> Revisa la tercera versión de Klever y realiza una ronda de mejora centrada en claridad, densidad visual y coherencia de estados.
>
> Conserva la estructura que ya funciona: portada separada del editor, tabla editable en escritorio, filas específicas en móvil, resumen lateral, búsqueda de activos y paleta actual. No reinicies el diseño ni añadas funcionalidades ajenas al recorrido principal.
>
> El objetivo sigue siendo: probar una cartera → comprenderla → guardarla → volver a consultarla.
>
> 1. UNIFICA LAS VALIDACIONES DE GUARDAR Y PUBLICAR
>
> En la captura 09, con un 103 % asignado, «Guardar cartera» está desactivado mientras «Publicar cartera» parece disponible y anuncia que también guarda.
>
> Comprueba el comportamiento real. Guardar y publicar deben aplicar las mismas reglas de validez de la composición, tanto en la interfaz como en la lógica que procesa la acción.
>
> - Si el total supera el límite, explica el motivo junto a la acción afectada.
> - No muestres una publicación con apariencia disponible si esa composición no puede publicarse.
> - Conserva el borrador local durante la corrección.
> - Una operación fallida no debe mostrar confirmación de guardado o publicación.
> - Define explícitamente qué sucede por debajo del 100 %: reparto incompleto o efectivo, según lo que realmente soporte el producto. No inventes efectivo implícito.
>
> Distingue siempre tres conceptos: dónde está guardada la cartera, si tiene cambios pendientes y si es privada o pública.
>
> 2. HAZ QUE EL RESUMEN DIGA EXACTAMENTE LO QUE MUESTRA
>
> - Cambia «Cartera completa» por «100 % asignado».
> - Usa «Pendiente de asignar: 12 %» y «Exceso de asignación: 3 %» en los estados correspondientes.
> - Cambia «Distribución por sector» por «Distribución por categorías» mientras se mezclen sectores con categorías como «ETF dividendos».
> - No presentes esa agrupación como la exposición sectorial de las empresas contenidas en los ETF si no se ha calculado.
> - Cambia «ROIC medio» por «ROIC medio de empresas con datos».
> - Añade junto al indicador: «No representa la rentabilidad de tu cartera».
> - Muestra cobertura por número de posiciones y por peso, con un denominador definido y consistente.
> - Explica si la media es simple o ponderada y cómo se excluyen los datos ausentes.
> - Diferencia «No disponible» de «No aplicable» cuando los datos permitan hacerlo; evita un guion sin explicación para todos los casos.
>
> No hace falta añadir otro panel. Resuelve esto con etiquetas precisas, una explicación breve y metodología desplegable.
>
> 3. REDUCE LA CABECERA DEL EDITOR MÓVIL
>
> La captura 06 muestra demasiada interfaz antes de llegar a las posiciones y repite el guardado arriba y abajo.
>
> - Usa una cabecera móvil compacta, aproximadamente 56–64 px de altura, con navegación secundaria dentro de un menú accesible.
> - Mantén el título de la cartera, su estado y el menú de acciones.
> - Cuando exista barra inferior de guardado, elimina el botón principal duplicado de la cabecera.
> - Muestra la explicación del almacenamiento local una sola vez. Puede ser «Guardado en este dispositivo», con detalle accesible.
> - Mantén 16 px de margen exterior y evita sumar innecesariamente márgenes, rellenos y tarjetas anidadas.
> - Conserva texto principal de 16 px y controles táctiles de al menos 44 × 44 px.
> - Da más anchura al nombre del activo. Si se trunca, permite leer el nombre completo al desplegar sus detalles.
> - Mantén un campo de peso compacto, suficiente para introducir decimales con comodidad.
>
> La barra inferior debe mostrar total asignado, estado breve y acción principal. Apunta a unos 72–88 px de altura, más el área segura, permitiendo crecimiento con texto ampliado.
>
> Reserva espacio debajo del contenido y comprueba el teclado virtual: la barra no debe tapar el campo activo ni impedir llegar a la última posición.
>
> 4. CORRIGE EL ORDEN EN TABLETA Y MÓVIL
>
> En la captura 14, «Gráficos de precio» aparece antes que «Resumen». Invierte esa prioridad.
>
> En una sola columna:
>
> - Cabecera compacta.
> - Resumen breve con total, posiciones y acceso al detalle.
> - Posiciones.
> - Resumen detallado.
> - Gráficos y publicación como contenido secundario.
>
> Evita repetir todo el resumen: la versión superior debe ser breve. En escritorio, conserva las dos columnas.
>
> 5. RECUPERA LA CLARIDAD DE EXPLORAR EMPRESAS
>
> La captura 12 ha perdido encabezados y una acción evidente para abrir las fichas.
>
> - Añade encabezados: Empresa, Sector, Comprobaciones y una columna de acción.
> - Usa el nombre de la empresa con suficiente protagonismo y el símbolo como identificador complementario.
> - Explica «5 de 5» mediante el encabezado «Comprobaciones superadas».
> - Recupera «Ver ficha» como enlace visible y accesible por teclado.
> - Ajusta el espacio entre columnas para que cada fila se lea como una unidad.
> - Usa filas de aproximadamente 56–64 px cuando el contenido lo permita.
> - Indica el criterio de ordenación real y cómo se resuelven los empates.
> - Comprueba cómo se recorre la lista completa de 105 empresas; no añadas controles de paginación ficticios.
>
> No conviertas cinco comprobaciones superadas en una etiqueta de recomendación de compra.
>
> 6. TERMINA LA FICHA DE EMPRESA EN MÓVIL
>
> Conserva las cinco comprobaciones con valor, icono y texto.
>
> La tabla histórica queda cortada en la captura 11:
>
> - Si mantienes desplazamiento horizontal, hazlo evidente, limita el desplazamiento a la tabla y conserva la columna de año como referencia.
> - Muestra moneda y escala junto al título o en los encabezados.
> - Evita abreviaturas ambiguas como «mil M» cuando puedas escribir «miles de millones».
> - Mantén accesibles fuentes, periodo y metodología.
> - Comprueba que el cierre del diálogo sigue accesible al desplazarse y con texto ampliado.
>
> No reduzcas la tipografía para encajar todas las columnas a la fuerza.
>
> 7. AFILA LA PORTADA SIN CAMBIAR SU DIRECCIÓN VISUAL
>
> - Conserva «Crea y entiende tu cartera simulada».
> - Acorta la explicación: «Prueba un reparto de activos y consulta los datos de las empresas. Sin invertir dinero real».
> - Lleva la referencia a los informes de la SEC a un texto secundario de fuentes.
> - Haz que «Probar una cartera» tenga un destino inequívoco. Si lleva a las plantillas, desplaza y sitúa el foco allí de forma accesible.
> - Reduce la altura de la vista previa de escritorio. Puedes mostrar tres posiciones y «+3 posiciones», manteniendo los totales de la cartera completa y señalando que la lista está abreviada.
> - En móvil, compacta las tarjetas de plantilla para que comparar las tres no exija tanto desplazamiento.
> - Mantén «Carteras públicas», diferenciando ejemplos propios y publicaciones de usuarios mediante etiquetas veraces.
> - Sustituye fragmentos recortados de avisos educativos por descripciones breves y completas; conserva el aviso general.
> - No añadas gráficos decorativos, testimonios, rentabilidades ficticias ni nuevas métricas para llenar espacio.
>
> 8. COMPRUEBA EL RECORRIDO QUE LAS CAPTURAS NO DEMUESTRAN
>
> Prueba y documenta:
>
> - Elegir plantilla, cambiar pesos y añadir o quitar activos.
> - Introducir coma decimal, vaciar un campo y corregir un total superior al 100 %.
> - Solicitar acceso y conservar el borrador.
> - Abrir el enlace del email, guardar y volver desde «Mis carteras».
> - Recargar y comprobar que permanece la versión correcta.
> - Publicar y despublicar con estados coherentes.
> - Recuperarse de un error de guardado sin perder cambios.
> - Usar teclado, foco visible, lector de pantalla y ampliación al 200 %.
> - Abrir el teclado móvil y editar la última posición.
>
> Comprueba además el enlace de acceso cuando el correo se abre en otro navegador o dispositivo: no des por hecho que el borrador local estará disponible allí y no prometas que se ha guardado si no es cierto.
>
> Entrega capturas comparables a 390, 768 y 1440 px, y una comprobación de anchura a 360 px. Incluye estados válidos e inválidos, ambos temas y la pantalla «Mis carteras».
>
> Distingue lo implementado de lo probado y de lo pendiente. Prioriza resolver estas incoherencias antes de añadir más elementos visuales.

---

## C2. Encargo de la ronda 5 (cerrar problemas concretos de la ronda 4)

> La ronda 4 mejora claramente Klever. Conserva la estructura, la paleta, la portada compacta, las posiciones móviles y la tabla de escritorio. Esta ronda debe cerrar problemas concretos, sin reiniciar el diseño.
>
> 1. PRIORIZA LAS CARTERAS EXISTENTES
>
> En «Mis carteras», muestra primero las carteras guardadas y un botón «Nueva cartera». Abre el formulario únicamente al solicitarlo.
>
> Cada elemento debe permitir reconocer y recuperar la cartera: nombre, privada/pública, posiciones, total asignado y última modificación si existe ese dato. No inventes fechas ni metadatos.
>
> Si todavía no hay carteras, entonces sí muestra la creación como acción principal.
>
> 2. UNIFICA EL BLOQUEO VISUAL DE GUARDAR Y PUBLICAR
>
> Con un 103 %, «Publicar cartera» sigue pareciendo disponible en las capturas, aunque el documento indica que la lógica ya lo impide.
>
> Representa su indisponibilidad de forma coherente con Guardar y muestra el motivo al lado. Mantén las validaciones tanto en interfaz como en servidor.
>
> Conserva las reglas actuales:
>
> - Más del 100 %: no guardar en cuenta ni publicar; conservar el borrador local.
> - Menos del 100 %: guardar en privado como reparto incompleto, sin efectivo implícito.
> - Publicar: exigir el 100 % y los demás requisitos de publicación.
>
> Comprueba que una edición temporalmente inválida de una cartera pública no modifica la versión publicada. Permite corregir el borrador y guardar cuando vuelva a ser válido, sin exigir despublicar durante cada cambio de peso.
>
> 3. MUESTRA EL ESTADO DE GUARDADO SIN DEPENDER DEL ICONO DE INFORMACIÓN
>
> Distingue privacidad, validez del reparto y persistencia.
>
> Muestra textos explícitos según el estado real:
>
> - «Guardada en tu cuenta».
> - «Solo en este dispositivo».
> - «Cambios sin guardar en tu cuenta».
> - «No se pudo guardar».
>
> Un error de asignación no debe ocultar si los cambios están conservados localmente. El icono de información puede ampliar detalles, pero no contener la información esencial.
>
> Acorta la confirmación flotante a «Cartera guardada» y evita que tape campos editables. No llames «borrador» a toda cartera guardada si no existe una distinción funcional que lo justifique.
>
> 4. SIMPLIFICA EL RESUMEN SIN PERDER PRECISIÓN
>
> Mantén visibles:
>
> - Total asignado y diferencia respecto al 100 %.
> - Número de posiciones.
> - ROIC de las empresas con datos.
> - Cobertura.
> - «No representa la rentabilidad de tu cartera».
>
> Lleva la fórmula y el desarrollo metodológico al desplegable.
>
> Sustituye «Sin dato: 2 fondos (no aplicable)» por una distinción clara entre datos ausentes e indicadores no aplicables.
>
> En categorías, usa una nota breve: «Los ETF se agrupan por tipo; no se desglosan sus empresas». Deja la explicación completa accesible.
>
> Elimina «100,0 % ✓ 100 % asignado»: basta «Asignado: 100 %». Diseña el estado de exceso para que se lea bien a 360 px, sin reducir el tamaño de letra.
>
> 5. TERMINA EXPLORAR EMPRESAS EN MÓVIL
>
> Conserva la tabla de escritorio.
>
> En móvil, evita tres columnas que estrechan el nombre:
>
> - Primera línea: nombre de empresa y resultado.
> - Segunda línea: símbolo, sector y «Ver ficha», permitiendo crecimiento para nombres largos.
>
> Acerca el buscador al título. Resume la introducción y mantén metodología y significado de las comprobaciones accesibles.
>
> Comprueba nombres largos, sectores largos, resultados incompletos y empresas con datos ausentes. No presentes datos ausentes como comprobaciones fallidas.
>
> 6. CONSERVA LA PORTADA Y AJUSTA LA FICHA SOLO DONDE HACE FALTA
>
> No vuelvas a rediseñar la portada.
>
> En la ficha, conserva unidades y acceso al cierre. Separa visualmente cifra y unidad cuando esta sea larga: por ejemplo, «29,6» y debajo «miles de millones de USD». Evita que la unidad compita con la explicación del criterio.
>
> Verifica el desplazamiento horizontal real de la tabla histórica y la columna de año fija; la captura solo demuestra que se ha añadido una instrucción.
>
> 7. CIERRA CON PRUEBAS Y EVIDENCIAS
>
> Entrega una tabla breve con escenario, resultado esperado, resultado observado y evidencia. El número total de comprobaciones no sustituye esta información.
>
> Incluye:
>
> - Cartera privada al 88 %, 100 % y 103 %.
> - Edición de una cartera pública y conservación de su última versión publicada.
> - Guardado fallido y recuperación sin perder cambios.
> - Acceso por email en el mismo navegador y en otro.
> - Regreso desde «Mis carteras».
> - Teclado móvil abierto al editar la última posición.
> - Texto ampliado al 200 %, navegación por teclado y foco en diálogos.
>
> Distingue pruebas automáticas de pruebas manuales y deja explícitamente pendientes las que no puedas ejecutar.
>
> Las conexiones con Revolut y Trade Republic, el artículo diario personalizado y el consejo diario de inversión pertenecen al futuro plan de pago. No los implementes en esta ronda.

---

## D. El resto de instrucciones, en orden aproximado

1. Enlace al Claude Doc del plan: «Léelo». → se leyó y se resumió.
2. «Empieza a montar la página web.» → semanas 1–2 (Cloudflare Pages + Functions + D1, ingesta SEC, editor).
3. «Sí» → semana 3. «Espera. Sigue con la semana 3.» → se aclaró que ya estaba hecha. «Continuar» → semana 4.
4. «¿Qué es más importante?» → se recomendó: revisión de TradingView, luego el registro (enlace mágico), luego ampliar el universo.
5. «Ponte con ello, ¿cuál me recomiendas?» (servicio de email) → Brevo; se implementó el enlace mágico.
6. «Lo de Brevo, explícame para qué me sirve.» → explicación.
7. «Ahora no estoy en casa… deja todo listo y deja en tareas pendientes crearme la cuenta.» → `PENDIENTES.md`.
8. «¿Qué más puedes ir haciendo para tener una web funcional?» → pruebas locales de extremo a extremo.
9. «Hazlo» → universo ampliado a 125 activos.
10. «¿Puedo ver un enlace funcional e interactivo de cómo está la web?» → demo en un artefacto privado.
11. «Ahora, a nivel de desarrollador experto en interfaces, ¿qué le falta?» → autocrítica por prioridades. «Hazlo» → ronda 2 (consentimiento, validaciones, estados).
12. «Quiero que pueda ver la web mi IA de ChatGPT, y que te critique todo, en especial la parte visual y de interacción» → primer paquete de revisión (capturas + instrucciones).
13. Veredicto de ChatGPT (texto A). → «Aplicado casi todo» (portada, sin registro, guardar/publicar, métricas).
14. «Vuelve a crear un archivo zip para volver a entregárselo a ChatGPT.» → segundo paquete.
15. Encargo de rediseño (texto B). → ronda 3.
16. «Quiero que lo revise ChatGPT.» → paquete de la ronda 3. «¿Todo va con el zip o tengo que copiar algo más?» → hay que copiar el texto de las instrucciones (bajo la primera `---`).
17. Encargo de la ronda 4 (texto C). → ronda 4.
18. «Quiero poder ver la página web y poder interactuar con ella sin que sea privada para que ChatGPT también pueda acceder.» → demo autónoma `demo/index.html`; el usuario **lo hará después** (desplegar en Cloudflare Pages).
19. «Ahora pásame tu actualización para que la vea ChatGPT y te pase feedback.» → paquete de la ronda 4.
20. «Almacena todo el contexto en una carpeta que se diga procesos klever y ve actualizándola a medida que vamos creando la web, así no pierdes contexto en ningún momento.» → esta carpeta y `CLAUDE.md`. *(La carpeta se llama `procesos-klever` por no usar espacios en la ruta.)*
21. Encargo de la ronda 5 (texto C2). → ronda 5. *Fuera de alcance, para un futuro plan de pago:* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión.

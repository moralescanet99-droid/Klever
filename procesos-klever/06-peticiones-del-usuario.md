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

## C3. Feedback de ChatGPT sobre la ronda 5 y encargo de la ronda 6 (pegado por el usuario)

> La ronda 5 tiene una base visual suficiente. No hagas otro rediseño general. Cierra los siguientes puntos y después prepara una versión para pruebas de uso.
>
> 1. AVISO DE BORRADOR NO DISPONIBLE
>
> Sustituye la notificación flotante larga de la captura 18 por un aviso persistente dentro de «Mis carteras», antes del formulario.
>
> Texto orientativo:
> «Tu cartera todavía no se ha guardado en la cuenta. El borrador no está disponible en este navegador. Vuelve al navegador donde lo creaste para guardarlo».
>
> No afirmes que el borrador sigue existiendo en otro dispositivo si no puedes verificarlo. No muestres una confirmación de guardado cuando solo se ha completado el acceso.
>
> Conserva las notificaciones breves para éxitos simples como «Cartera guardada».
>
> 2. COHERENCIA ENTRE COPIA LOCAL Y VERSIÓN DE LA CUENTA
>
> Sustituye «Cambios sin guardar en este dispositivo» por «Cambios locales pendientes de guardar en tu cuenta».
>
> Usa el mismo significado en Mis carteras y en el editor.
>
> Si existe un borrador local diferente de la versión de la cuenta, identifica a cuál corresponden las posiciones y el porcentaje que muestra la tarjeta. No mezcles métricas de una versión con el estado de otra.
>
> Conserva la recuperación local y la detección de conflictos. En un conflicto, muestra «Versión de este dispositivo» y «Versión de tu cuenta», con fechas y horas reales y una breve comparación. Evita «otra sesión» como única explicación. No sobrescribas silenciosamente.
>
> 3. COMPROBACIONES CON DATOS AUSENTES
>
> En lugar de «3 de 5» como resultado dominante y «2 no disponibles» debajo, muestra «3 superadas · 2 sin datos».
>
> Distingue en la ficha:
>
> - Superadas.
> - No superadas.
> - Sin datos.
>
> Comprueba que la ordenación no trate los datos ausentes como fallos ni presente una evaluación parcial como completa. Documenta la regla real aplicada.
>
> 4. GUARDADO Y PUBLICACIÓN
>
> Cuando guardar una cartera pública actualice su publicación, usa «Guardar y actualizar publicación». Adapta el botón móvil permitiendo dos líneas si hace falta.
>
> No añadas una confirmación repetitiva en cada guardado.
>
> Mientras haya cambios pendientes, muestra junto al estado público: «Tus cambios aún no son públicos». Mantén la última versión publicada intacta hasta completar correctamente el guardado válido.
>
> Verifica también qué ocurre al dejar de publicar con cambios locales inválidos: debe poder retirarse la publicación sin perder el trabajo local.
>
> 5. RECUPERACIÓN Y TEXTOS FINALES
>
> Tras un fallo de guardado, usa «Reintentar guardado» y conserva la explicación de dónde permanecen los cambios.
>
> En exceso de asignación, acompaña el dato con una instrucción breve: «Reduce los pesos hasta sumar 100 %».
>
> En la tabla histórica, distingue las unidades: «Importes en miles de millones de USD; ROIC en %».
>
> Permite hasta dos líneas en el título móvil de la cartera.
>
> 6. ENTREGA PARA PROBAR, NO OTRA RONDA DE REDISEÑO
>
> Prepara una versión ejecutable o enlace de prueba, según el entorno disponible, e indica cómo abrirla.
>
> Acompaña la entrega con evidencias de estos recorridos:
>
> - Crear, editar, guardar, cerrar y recuperar una cartera.
> - Conservar cambios tras recargar.
> - Recuperarse de un guardado fallido.
> - Abrir el enlace de acceso en otro navegador.
> - Resolver un conflicto entre cambios locales y cambios de la cuenta.
> - Editar una cartera pública sin alterar prematuramente su publicación.
> - Mostrar comprobaciones con datos ausentes correctamente.
>
> Distingue resultados automáticos de pruebas manuales pendientes. No presentes el número de comprobaciones como sustituto de sus resultados.
>
> Mantén fuera de esta entrega las funcionalidades del futuro plan de pago.

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
22. «Ya se lo he pasado a ChatGPT, te cuento su feedback» (texto C3). → ronda 6: cerrar esos puntos y preparar una versión para pruebas de uso (no otro rediseño, no paquete para ChatGPT todavía).

## C4. Feedback tras la ronda 6 y encargo de la ronda 7 (2026-11-03, literal resumido del usuario)
«La revisión visual de la ronda 6 queda suficientemente cerrada. No hagas otro rediseño general. Prioriza fiabilidad del guardado y una entrega reproducible.»
1. **Contradicción del conflicto:** la captura F5b dice que «Conservar la de este dispositivo» solo guarda al pulsar Guardar, pero `resolverConflictoGuardado()` llamaba enseguida a `guardar()`. Elegir la local debe volver al editor sin escribir en la cuenta. Prueba: elegir la local no modifica la cuenta; pulsar Guardar después sí; «Decidir después» no descarta ninguna copia; coherente al abrir y al guardar.
2. **Guardado parcial:** `guardar()` envía PUT (posiciones) y luego PATCH (nombre y tesis). Comprobar si el servidor real lo comparte; simular PUT correcto + PATCH fallido (qué queda guardado, qué publicado, qué comunica la interfaz). Preferible: posiciones, nombre y tesis en **una sola operación transaccional con comprobación de versión**; sin actualización parcial. Comprobar dos guardados concurrentes: validación de versión y escritura **atómicas**; no usar una fecha de precisión de segundos como única garantía: usar una **revisión que cambie en cada escritura**. Distinguir defectos confirmados en el servidor real de los observados solo en la demo.
3. **Prueba E16a:** un elemento con borde inferior en −1979 px no está visible; no justifica marcar correcta la accesibilidad de la última posición. Desplazar y enfocar el campo, comprobar que sus límites quedan dentro de la zona visible y por encima de la barra fija, y que permite introducir el valor. Mantener separados: ampliación de texto simulada, zoom real, teclado móvil real. No marcar como ejecutadas las pruebas manuales.
4. **Entrega reproducible:** proyecto con dependencias, archivo de bloqueo, servidor, migraciones, scripts y pruebas, sin secretos; comandos exactos de instalación limpia y de datos ficticios; evidencias referenciadas (o marcar las ausentes); resultado de la ejecución y versión del código con que se obtuvo. La demo HTML debe seguir identificada como demostración sin persistencia de cuenta al recargar, no equivalente al servidor probado. Corregir el guion de desconexión: las peticiones simuladas en memoria no fallan con el modo sin conexión; ejecutarlo contra el servidor o añadir una simulación de error explícita e identificada.
5. **Diálogo móvil:** «Decidir después» fácilmente accesible incluso con texto grande y muchas diferencias; cerrar o posponer no elige copia, no descarta datos ni escribe en la cuenta; comprobar foco y desplazamiento.
Entrega final: qué se corrigió, evidencia, proyecto ejecutable, limitaciones y pruebas manuales pendientes. No añadir funciones nuevas ni las del plan de pago.

## C5. Feedback técnico de ChatGPT sobre la ronda 7 y encargo de la ronda 8 (2026-11-03, resumen fiel)
Veredicto: «La ronda 7 mejora la base técnica, pero aún no daría por fiable el guardado entre dispositivos.» Ejecutó las 11 pruebas del servidor (pasan) y **reprodujo dos problemas de concurrencia que no cubren**; la entrega está más completa pero el ejecutor y los requisitos necesitan corregirse.
Bien resuelto: lote único (D1.batch() es transacción según Cloudflare), revisión entera + condición del UPDATE, «Conservar la de este dispositivo» ya no guarda solo, G6 corrige la debilidad de E16a (sin equivaler a zoom/teclado reales).
Defectos: **1 (crítico)** `functions/api/portfolios/[id].js` ~64–65 y 100–101: la revisión devuelta se lee DESPUÉS del lote con una lectura independiente → A puede recibir la revisión de B (A guarda rev 1, B rev 2, A recibe 2, A vuelve a guardar con 2 y sobrescribe a B con 200). Arreglo: devolver revisión y fecha de la propia escritura dentro de la operación atómica (PUT y PATCH). **2 (importante)** GET ~10–17 lee cartera y luego posiciones: puede mezclar versiones (nombre/revisión antiguos con posiciones nuevas); arreglo: instantánea consistente (consulta conjunta o lote de lecturas). **3 (importante)** `tests/run-all.sh`: si el servidor no arranca continúa; no agrega códigos de salida; el `kill … || true` final puede dejar éxito; arreglo: registrar cualquier fallo de arranque/ejecución/timeout/resultado ausente, salir ≠ 0, limpiar con `trap`. **4 (importante)** requisitos: Node 20 declarado pero se usa `node:sqlite` (22.5+, sin indicador desde 22.13); `timeout` y `setsid` no vienen en macOS; arreglo: fijar Node comprobado, alinear docs y `engines`, declarar dependencias o hacer portables los scripts; indicar el commit exacto, no una rama. **5 (menor)** toda excepción del lote se devuelve como 400 «ticker desconocido»; arreglo: distinguir validación de errores internos, registrar detalle en servidor.
Cinco pruebas a añadir: (1) escritura intercalada entre el commit del PUT y su respuesta: debe devolver su propia revisión y el siguiente guardado obsoleto, 409; (2) lo mismo con PATCH; (3) escritura intercalada entre las lecturas del GET: nunca una mezcla; (4) retrasar un guardado, abrir otra cartera y comprobar que la respuesta no modifica el editor, la revisión ni la copia local de la otra (`guardar()` usa `current` global tras el await); (5) fallos y timeouts deliberados del ejecutor: el comando global debe fallar y limpiar procesos.
Informe: rebajar a «El guardado es transaccional y supera los escenarios comprobados; quedan carreras de lectura y respuesta por corregir»; retirar el ✅ de la antigua E16a (mostraba −1979 px como aprobado; conservar como antecedente sustituido por G6).
**Ronda 8 acotada:** corregir respuestas PUT/PATCH y consistencia del GET; incorporar las cinco pruebas mostrando cuáles fallan antes y pasan después; corregir código de salida del ejecutor y requisitos; **verificar la migración 0007 sobre una base antigua con datos** conservando carteras y posiciones (no aplicarla sobre el esquema nuevo que ya tiene las columnas); informe separando resultados locales, D1 remoto y pruebas pendientes. No tocar diseño ni ampliar funcionalidad. Futuro plan de pago fuera. ChatGPT no repitió la batería de navegador ni probó D1 remoto, migración con datos reales o dispositivos físicos.

## C6. Encargo de la ronda 9 (2026-11-03, cierre técnico breve)
«Haz una ronda 9 breve de cierre técnico de Klever. Conserva las correcciones de la ronda 8.» (1) **`GET /api/public/:id`** comprobaba `publico=1` y leía las posiciones en consultas independientes: una petición podía leer la cartera pública y después posiciones guardadas cuando ya era privada. Visibilidad, metadatos y posiciones de una única instantánea consistente; prueba determinista que intercale despublicación y cambio de posiciones entre las lecturas originales; demostrar que falla antes y pasa después; la respuesta puede ser la versión pública anterior o 404, nunca posiciones de una versión que no fue pública. (2) **Comprobación de la demo en `tests/run-all.sh`**: exigir código de salida 0 además de DEMO OK y ausencia de timeout; comprobar el arranque de su servidor; no ejecutar contra un servidor ajeno si el puerto está ocupado; casos de prueba, incluido imprimir DEMO OK y terminar con código 1. (3) **Descripciones G2 y U4**: el ticker desconocido se rechaza antes del lote, no es un fallo a mitad de transacción; R4a es la evidencia de rollback ante un error interno. Entregar código, resultados y commit exacto separando ejecutado y pendiente; no rediseñar ni añadir funcionalidades; plan de pago fuera. **Si pasa:** guion breve para probar el recorrido completo de la beta y verificar el comportamiento en D1 remoto, sin declarar completadas pruebas no ejecutadas.

## C7. Feedback técnico de ChatGPT sobre la ronda 9 y encargo de la ronda 10 (2026-11-03, resumen fiel)
ChatGPT informó de **25 comprobaciones locales de servidor, conflictos y migración superadas**; eso no acredita la batería completa de navegador, Cloudflare D1 remoto, el correo real ni dispositivos físicos. Encargo «Klever · Ronda 10»: **cerrar el pulido visual pendiente y avanzar hacia una beta comprobable con servicios reales, manteniendo la estabilidad**; implementar y entregar evidencias, no solo un plan.
1. **Revisar el estado antes de modificar:** leer `CLAUDE.md`, `procesos-klever/`, `ronda9/LEEME.md`, `ronda9/GUION-BETA-Y-D1-REMOTO.md`, `PRUEBAS-DE-USO.md` y contrastar con el código; actualizar referencias obsoletas que aún presentan revisiones anteriores como pendientes (conservar historial, distinguir estado actual).
2. **Tres problemas visuales** (320, 390 y 1440 px; títulos largos, errores, contenido ampliado; distinguir simulación de zoom/teclado de pruebas reales; pulido, no rediseño): (a) *Notificación de guardado*: que no se superponga a «Mis carteras», la cabecera u otros controles; debajo de la cabecera o en zona reservada y coherente; legible durante toda la animación y al desplazarse; los errores que requieren actuar deben permanecer accesibles. (b) *Resumen de ROIC*: visibles indicador, cobertura y advertencia esencial; explicación extensa en un desplegable accesible; conservar significado, limitaciones y la distinción entre ausente y cero; mejor jerarquía, espaciado y lectura sin otra tarjeta explicativa redundante. (c) *Móvil*: menos espacio para textos secundarios y pie; claro si los cambios están solo en el dispositivo, guardados en la cuenta o publicados; conservar advertencias con acceso al detalle; cabecera, barra inferior, avisos y teclado no deben impedir llegar a las acciones.
3. **Conservar las garantías técnicas** (separación público/privado, guardado atómico, revisiones y conflictos, recuperación local, respuestas tardías, publicar/actualizar/retirar, ejecutor que falla ante errores); no alterar pruebas para ocultar fallos ni rebajar exigencias.
4. **Validación real:** comprobar primero qué accesos existen; si hay entorno de pruebas autorizado, ejecutar el guion de beta y D1 remoto con datos ficticios aislados (correo realmente enviado, caducidad y uso único del enlace, persistencia al recargar y cerrar sesión, conflictos entre dos sesiones independientes, fallos de guardado y recuperación, separación público/privado, migraciones sobre base de pruebas con datos). El enlace en pantalla solo para desarrollo/pruebas aisladas; verificar que la configuración pública no expone enlaces ni tokens. Si faltan cuentas/credenciales/permisos: completar lo independiente y entregar **un único bloque** con lo imprescindible. No inventar resultados ni presentar una demo como app remota validada; no contratar servicios ni generar costes; no tocar producción.
5. **Pruebas y evidencias:** ejecutar tras cada cambio y la batería completa al cerrar; reconstruir y verificar la demo; revisar la consola; pruebas de regresión; **capturas comparables antes/después** de los tres cambios; comandos, resultados y commit; separar probado en local / remoto / emulado / pendiente / bloqueado; no afirmar Safari, dispositivos físicos, lectores de pantalla ni correo real sin haberlos usado.
6. **Alcance:** siguen reservados al futuro plan de pago (conservar en la documentación, sin implementar ni simular): Revolut, Trade Republic, artículo diario según intereses y tip diario de inversión.
7. **Entrega:** `klever-ronda10-tecnico.zip` con código y archivos para reproducirlo, demo reconstruida (sin persistencia), `ronda10/LEEME.md`, evidencias visuales antes/después, resultados reales y comandos, guion actualizado de validación manual y remota, documentación de continuidad y pendientes externos concretos; sin secretos, credenciales, datos personales ni dependencias instaladas. Al terminar: qué ha mejorado, qué se ha probado y qué falta para que personas reales usen la beta.


## C8. Encargo de la ronda 11 (2026-11-03, resumen fiel): cierre de incidencias visuales y primera pantalla con identidad propia
«La ronda 10 mejora la claridad. Ya podemos comenzar la dirección visual acordada con el usuario, manteniendo pendiente y separada la validación remota. Implementa el trabajo; no entregues solo propuestas.»
1. **Cerrar dos problemas concretos.** (a) En `tests/ronda10/testH.cjs`, H1 excluye las muestras «pegado» al comprobar solapamientos; el informe registra solapamiento con «estado» pero da la prueba por superada: evitar comprobaciones que pasen por no tener muestras elegibles; probar explícitamente **al inicio de la página y después de desplazarse**. (b) Corregir los avisos para que las **acciones y el elemento enfocado sean visibles y utilizables**; diferenciar el contenido que pasa normalmente por debajo de una zona fija de una acción realmente inaccesible. (c) En **320 px con texto ampliado**, aviso y barra inferior dejan poco espacio útil: reorganizar controles, que el mensaje use el ancho disponible, reconsiderar qué debe permanecer fijo; conservar errores persistentes y acciones accesibles **sin obligar a cerrar el aviso** para trabajar. (d) Comprobar la **legibilidad durante la animación**; calcular contraste de colores CSS sin considerar la opacidad no lo acredita.
2. **Dirección visual concreta** (reconocible, sobria, moderna, agradable), **empezando por el editor de cartera** en escritorio y móvil, como pantalla de referencia: fondo claro ligeramente cálido, superficies blancas, texto azul tinta, acento verde petróleo; jerarquía tipográfica clara, cifras alineadas, espaciado consistente; menos cajas dentro de cajas, bordes y sombras; una acción principal inequívoca y secundarias discretas; **composición y reparto de la cartera como información principal, ROIC secundario** (conservando cobertura, limitaciones y explicación); filas de activos fáciles de comparar y editar; móvil pensado para tocar y leer, sin trasladar la tabla; detalles gráficos útiles basados en datos existentes (sin métricas ficticias ni rentabilidades inventadas). Colores, tipografía, espaciado, botones, campos y estados como estilos reutilizables; recursos gratuitos, sin dependencias externas innecesarias. **Antes de editar, describir brevemente los problemas de jerarquía de la pantalla actual**; luego implementar y revisar visualmente.
3. **Alcance controlado:** completar el editor y los componentes compartidos imprescindibles; no rediseñar todas las secciones; conservar guardado, conflictos, recuperación local, publicación y separación público/privado; no cambiar reglas financieras. Plan de pago (Revolut, Trade Republic, artículo diario, tip diario) pendiente para otra fase.
4. **Evidencias:** capturas comparables antes/después en 320, 390 y 1440 px; estados normal, pendiente de guardar, error, cartera pública con cambios privados y texto ampliado; pruebas relevantes y batería completa; demo reconstruida y comprobada; distinguir ejecutado / simulado / pendiente. **Verificación de una entrega ZIP:** ChatGPT superó 25 pruebas técnicas y A1–A7; **A8 se interrumpió porque el ZIP no contiene `.git`**: documentar cómo verificar una entrega ZIP y qué comprobaciones requieren un repositorio; **no declarar verificado el historial mediante un repositorio nuevo vacío**. Validación remota bloqueada por falta de accesos: seguir con lo independiente y conservar **un único bloque** de requisitos externos; no pedir secretos pegados en el chat ni presentar el correo simulado como real.
5. **Entrega:** código, demo, capturas e informe breve de la ronda 11: decisiones visuales aplicadas, problemas corregidos y qué falta verificar.

## C9. Encargo de la ronda 12 (2026-11-03, resumen fiel): coherencia visual y experiencia completa de exploración
La dirección visual de la ronda 11 queda **aprobada como base**; extender ese lenguaje al recorrido principal.
1. **Tres detalles del editor:** (a) eliminar la duplicación del porcentaje asignado y su barra en escritorio: la composición es la información principal; el resumen lateral, para categorías, cobertura y ROIC; en móvil, la información necesaria sin repetirla. (b) Simplificar la cabecera de una cartera **pública con cambios inválidos**: mensaje principal sugerido «Falta asignar un 5 % para actualizar la publicación», conservar visible que la versión pública sigue igual, detalle en un desplegable; jerarquía clara entre título, estado y acción. (c) **Colores estables por activo** dentro de la cartera: al quitar o añadir una posición las demás no cambian de color; comprobar pesos pequeños, nombres largos y más de ocho posiciones; los colores complementan las etiquetas, nunca las sustituyen.
2. **Extender el diseño a tres pantallas** con `ronda11/SISTEMA-VISUAL.md` (fondo cálido, tinta, petróleo). **«Mis carteras»:** reconocer cada cartera y retomar su edición; priorizar nombre, privacidad, estado de guardado y composición; distinguir claramente los cambios locales pendientes; composición equilibrada con una o varias; estado vacío útil con acción clara. **«Explorar empresas»:** protagonismo de búsqueda y filtros existentes; resultados comparables; conservar la diferencia entre superados / no superados / sin datos; que explicaciones y advertencias repetidas no desplacen los resultados; presentación móvil específica. **Ficha de empresa:** identidad, datos principales, criterios y explicaciones ordenados; unidades, periodos y fuentes cuando existan; datos ausentes identificados; conservar y hacer más visibles las acciones existentes. **No inventar cifras, tendencias, puntuaciones, rentabilidades ni información.**
3. **Recorrido completo:** explorar → buscar → abrir ficha → volver conservando búsqueda y filtros; Mis carteras → abrir → editar → guardar → volver y reconocer el estado actualizado. Debe reducir esfuerzo y facilitar la orientación. Conservar guardado, conflictos, recuperación local y separación público/privado.
4. **Verificación proporcionada:** 320, 390 y 1440 px con datos, sin resultados, errores, nombres largos y texto ampliado; pruebas nuevas (conservar filtros, mantener colores al eliminar una posición…); batería completa al cerrar; **revisar visualmente las capturas** (verde ≠ jerarquía, legibilidad y espacio útil). ChatGPT repitió en la ronda 11 las 33 comprobaciones de servidor, conflictos, migración y acceso con resultado correcto; no repitió las 284.
5. **Alcance y entrega:** validación remota y correo real siguen pendientes de accesos (requisitos documentados); plan de pago reservado; sin servicios de pago ni dependencias nuevas sin necesidad. Entregar código, demo reconstruida, capturas antes/después e informe breve: mejoras visibles y de uso, pruebas ejecutadas, limitaciones y bloqueos, **pantallas que faltan por adaptar**.

## C10 · Ronda 13: primer recorrido completo de cartera, descubrimiento, simulación y seguimiento (resumen fiel; el texto íntegro lo dio el usuario en el chat)
Actualiza la dirección del producto. Propuesta de valor: **«Entiende lo que tienes, descubre alternativas y compara tus opciones antes de invertir»**. Cuatro pilares conectados (no obligatoriamente cuatro páginas): **Mi cartera** (composición, concentración, límites de la información), **Mi radar** (descubrir y guardar alternativas con criterios transparentes), **Mi laboratorio** (comparar escenarios antes de modificar una cartera), **Mi seguimiento** (conservar ideas, razones y revisiones). Explicaciones progresivas: conclusión primero, método después.
Recorrido a implementar de principio a fin: *abrir una cartera → comprender su concentración → explorar una empresa → guardarla en el radar → simular su incorporación → comparar antes/después → guardar el escenario y una nota*.
- **Radiografía**: mayor posición; tres mayores (o menos, indicándolo); categorías disponibles; pendiente o exceso; cobertura y limitaciones. **Límite personal opcional** por posición («Esta posición supera el límite del 20 % que has definido»), sin umbral impuesto. No confundir concentración con riesgo; categoría comercial de un ETF ≠ exposición sectorial; no deducir países/divisas; sin solapamientos de fondos sin composiciones verificadas; sin puntuaciones inventadas; no normalizar una cartera incompleta. Distinguir versión guardada de cambios locales.
- **Radar**: guardar/quitar, consultar, **nota privada**, mostrar si el activo ya está directamente en la cartera seleccionada, pasar al laboratorio; conservar búsqueda, filtros, navegación y foco; filtros con criterios explícitos; mantener superado/no superado/sin datos; **no** ranking de «mejores inversiones». Alcance: universo actual.
- **Laboratorio** (porcentajes, no patrimonio): cartera base, añadir/cambiar peso, financiación (1. % sin asignar si basta; 2. reducir proporcionalmente las demás), explicar el método antes de calcular, cambios por posición, motivo si inviable, sin pesos negativos ni ajustes ocultos. Ejemplo: A 60 / B 40 + C 10 proporcional → A 54, B 36, C 10. Comparar pesos, mayor y tres mayores, categorías, límites afectados, sin asignar; redondeo determinista y totales coherentes; sin rentabilidades esperadas, costes ni impuestos. Guardar escenario privado con nombre y nota; reabrir o descartar sin tocar la cartera original; etiquetado «Simulación»; no ejecuta operaciones ni actualiza publicaciones.
- **Seguimiento**: empresas del radar, escenarios, notas. Cada escenario conserva fecha, cartera y revisión de origen, copia de la base, propuesta, método, nota y estado (en estudio / descartado / archivado); si cambia la cartera avisa de la versión posterior sin recalcular. Sin alertas de mercado simuladas.
- **Arquitectura**: JS/CSS, Pages Functions, D1; plan breve antes; módulos separados (cálculo, almacenamiento, presentación); extracción acotada de `app.js`; CSS sin bloques que se pisan; **migraciones aditivas** (radar, escenarios, límites) con claves y restricciones; datos privados con comprobación de propiedad en cada lectura/escritura; revisión para evitar sobrescrituras; escrituras atómicas. Visitantes: exploración y simulación temporal claramente identificada; no mostrar «Guardado en tu cuenta» sin persistencia real; conservar el trabajo al iniciar sesión.
- **Datos y confianza**: auditar qué datos son ficticios y cuáles reales; identificar datos de demostración en la interfaz sin atribuirlos a la SEC; con datos reales, mostrar fuente, periodo y fecha de actualización; no prometer actualizaciones nocturnas sin comprobarlas; la ausencia de datos limita el análisis, no se rellena.
- **Editorial (solo diseño breve, sin construir)**: *Bajo el radar*, *¿Qué está pasando?*, *El Superespeculador*, *Seguimos la pista*; fuente, fecha, responsable, hechos vs interpretación, historial de tesis; sin contenido generado automático ni noticias ficticias. Futuras: datos internos de fondos y solapamientos, importar posiciones y simulaciones monetarias, Revolut/Trade Republic, artículos personalizados y tip diario, avisos externos, monetización.
- **Pruebas**: cálculos (completa/incompleta/vacía/exceso, activo existente, pesos pequeños, inviables, redondeo), guardar escenario sin tocar la cartera ni su versión pública, reabrir tras cambiar la cartera, persistencia de radar/notas/escenarios, **aislamiento entre dos usuarios**, fallos y reintentos y duplicados, recorrido en 320/390/1440, teclado y texto ampliado; batería completa; demo reconstruida con sus límites visibles. La ronda 12 informa 337 comprobaciones; ChatGPT no las repitió.
- **Entrega**: código y migraciones, demo, capturas del recorrido, resultados y versión probada, explicación de cálculos y límites, documentación de continuidad, plan por fases, y **un ejemplo de qué puede hacer ahora una persona que no podía en la ronda 12**. Validación remota y correo real siguen pendientes de accesos (un único bloque; no pedir secretos).

## C11 · Ronda 14: revisión de la ronda 13 y encargo definitivo (LITERAL, archivo `Klever_Claude_Ronda_14.md`)
# Klever · Revisión de la ronda 13 y encargo definitivo de la ronda 14

Claude, parte de tu última versión funcional de Klever. Implementa y prueba el recorrido descrito aquí. Tú te encargas del desarrollo. ChatGPT hará la revisión independiente de la entrega. El resultado esperado es una versión interna que Javier pueda abrir y probar desde el móvil.

## 1. Revisión de tu entrega

El mayor avance de la ronda 13 es que una persona ya puede descubrir una empresa, simular el efecto de incorporarla y guardar la comparación. Conserva la radiografía de la cartera, el radar privado, el laboratorio y el historial de escenarios. Conserva también la distinción entre la versión guardada de una cartera y sus cambios locales.

ChatGPT revisó las 16 capturas y repitió 88 comprobaciones locales de cálculo, servidor, migración, concurrencia y acceso. Las 88 pasaron. Las 467 comprobaciones completas figuran en tu informe. La revisión independiente no cubrió la ejecución completa en navegador, un móvil físico ni el despliegue remoto.

**Juicio de producto.** En la primera visita, una persona que llega desde una idea y carece de cartera encuentra el simulador desactivado. En la segunda visita puede recuperar cifras y notas, pero le cuesta reconocer qué quería averiguar. Son los dos momentos que la ronda 14 debe resolver.

## 2. Primero, corregir los fallos de confianza

| Prioridad | Evidencia de la ronda 13 | Trabajo y prueba de aceptación |
|---|---|---|
| Privacidad al salir | Al cambiar de cuenta a visitante en una prueba del módulo de la ficha, el HTML aún contenía la nota y el nombre de la cartera anterior. Revisar public/app.js y public/js/lab.js. | Limpiar memoria y pantalla al salir y al caducar la sesión. Invalidar respuestas pendientes. En navegador, abrir una ficha con una nota reconocible en A, salir sin recargar, volver a abrirla como visitante y después entrar como B. Repetir con una respuesta lenta de A. En ningún paso posterior deben aparecer los datos de A. |
| Procedencia de datos | Con un catálogo vacío simulado, scripts/fetch_fundamentals.mjs generó cero filas financieras y aun así marcó el origen global como SEC actualizado hoy. | Registrar fuente, periodo y fecha por dato o lote trazable. Probar carga vacía, parcial y correcta sobre datos previos. Una empresa fallida conserva su fecha anterior. Distinguir ausencia y cero en las métricas derivadas. Usar datos de demostración rotulados mientras falte validación real. |
| Guardado y recuperación | La ficha anuncia que el radar se guarda en el dispositivo. Una escritura fallida tras un primer guardado puede devolver el valor anterior. Revisar public/js/almacen.js y el adaptador de almacenamiento. | Provocar el fallo, conservar el texto en la sesión, mostrar «No se ha podido guardar» y ofrecer reintento. Recuperar espacio, reintentar y recargar para comprobar la nota. Diferenciar error de lectura y radar vacío. |
| Integridad de escenarios | El servidor aceptó un peso de 10,04 % y una propuesta con un símbolo duplicado. Guardó un objetivo de 10,04 y una posición de 10 %. | Validar símbolo único y precisión en décimas antes de guardar. En una prueba con dos pestañas, una revisión antigua no debe borrar una edición más reciente. Verificar también reintentos y topes con escrituras concurrentes. |

## 3. Después, entregar una historia que se pueda leer, probar y retomar

1. **Revista.** Publica en la versión interna una pieza legible sin cuenta y accesible desde el móvil. Puede tratar sobre cómo una empresa de hidrógeno convierte proyectos anunciados en contratos. Indica autor, fecha, fuentes y empresa vinculada. Si utilizas un caso ficticio, identifícalo desde el título y usa documentación de ejemplo identificada como tal. Si utilizas una empresa real, verifica cada cifra y enlaza su documento de origen.
2. **El Superespeculador.** Enlaza una opinión firmada sobre esa misma historia. Distingue el hecho observado, la interpretación del autor y qué evidencia le haría cambiar de opinión. Añade una revisión fechada vinculada a la tesis inicial. En una demo, identifica el desenlace como simulado. La tesis original debe seguir accesible aunque después cambie la opinión.
3. **Laboratorio.** Desde la historia o la ficha, ofrece «Probar en mi cartera». Conserva la empresa seleccionada. Si el visitante carece de cartera, ofrece una de ejemplo en ese mismo punto. Haz opcional el paso por el radar. Muestra primero de dónde sale el peso asignado y después la tabla y el detalle del cálculo.
4. **Seguimiento.** Al guardar la comparación en la cuenta, permite añadir una pregunta y una fecha de revisión, ambas opcionales. Al regresar, muestra la pregunta, la fecha elegida, la comparación original y el enlace a la historia o a su revisión. Los escenarios anteriores que no tengan esos campos deben seguir abriendo. Diferencia «Marcar como descartado», que conserva la historia, y «Eliminar definitivamente».
5. **Móvil.** A 320 y 390 px, comprobar que se pueda leer la pieza, abrir la simulación, entender los cambios y retomar la pregunta. Lleva el método de redondeo a un detalle desplegable y ofrece «Editar nota» en vez de abrir todos los formularios. Conserva la navegación existente donde sea posible.

## 4. Cómo aceptaré la entrega

- **Primera visita sin cuenta.** Abro la historia desde cero, leo la opinión y pruebo la empresa con la cartera de ejemplo. Con A al 60 % y B al 40 %, doy un 10 % a C reduciendo ambas posiciones en proporción. Aparecen A al 54 %, B al 36 % y C al 10 %. Entiendo que A cede seis puntos y B cuatro. La simulación es temporal.
- **Regreso con cuenta.** Guardo la comparación con la pregunta «¿Se han firmado los dos contratos anunciados?». Cierro, vuelvo a entrar y encuentro mi pregunta, la base original y la revisión editorial. Un cambio posterior en mi cartera conserva los pesos históricos del escenario.
- **Errores y datos privados.** Demuestra los fallos anteriores antes y después del arreglo. Comprueba que simular y guardar el escenario deja intactas tanto la composición privada como la publicación de la cartera.
- **Entrega a Javier.** Incluye ZIP del proyecto, instrucciones para abrirlo, capturas del primer uso y del regreso, versión revisada, pruebas ejecutadas y resultado. Separa módulo, navegador y entorno remoto. Indica los bloqueos reales y las pruebas pendientes. ChatGPT repetirá los casos críticos y revisará si el recorrido se entiende en móvil.

## 5. Alcance reservado para después

La ronda 14 cubre una historia, una opinión y una revisión relacionadas. El piloto editorial de tres piezas, la revista con categorías, las publicaciones semanales, los avisos automáticos, la comparación de escenarios y el análisis interno de ETF quedan para fases posteriores. También quedan reservadas las integraciones con Revolut y Trade Republic, el artículo diario personalizado, el tip diario y las suscripciones. La apertura pública se decidirá tras validar privacidad, migración, D1 remoto, correo y procedencia de las cifras reales.

## C12 · Ronda 15: revisión de la ronda 14 y encargo (LITERAL, archivo `Klever_Revision_14_y_encargo_15_1.md`)
# Klever · Revisión de la ronda 14 y encargo de la ronda 15

## Decisión para Javier

Aceptaría esta entrega como demo interna del recorrido editorial. He abierto la demo en Chromium a 390 px, entrado desde portada en la revista, leído la historia ficticia y simulado la incorporación de Hidrógeno Norte. La tabla devuelve KO 54 %, PG 36 % y HNORT 10 %, total 100 %. La comparación explica los seis y cuatro puntos que financian la incorporación.

Mantendría la historia, la opinión, la revisión y el laboratorio. En la próxima portada, la acción principal será crear o retomar una cartera. Antes de abrir cuentas al público hay que cerrar dos carreras de privacidad. La nota y el comparador son encargos nuevos de la ronda 15.

## Qué se verificó

| Evidencia | Resultado independiente |
|---|---|
| Instalación y cinco suites pedidas | npm ci completado en una extracción nueva. Carga 11/11, escenarios R14 14/14, cálculos 23/23, servidor R13 30/30, migración 10/10. Total 88/88. |
| Fallo de escritura del radar | Ejecuté el mismo experimento contra los módulos de R13 y R14. R13 comunicaba éxito dejando la nota antigua en disco. R14 lanza error y conserva la versión anterior. |
| Capturas | Revisadas las 12 imágenes entregadas. En 01 la portada ya explica la cartera simulada. En 02–07 el coste principal es recorrer mucho texto hasta tomar una decisión. En 09 y 12 el radar vacío aparece antes del escenario que sí contiene una pregunta pendiente. |
| Navegador | Recorrido de visitante en la demo autónoma con Chromium y ancho de 390 px. La demo pierde el estado al recargar. El regreso persistente se evaluó mediante capturas y pruebas de servidor. |
| Pruebas pendientes | Ni testL ni testK se repitieron contra la web completa. Wrangler falló al consultar las interfaces de red del entorno. El ZIP carece de historial Git para crear el worktree pedido. Las 522 comprobaciones completas corresponden al informe de Claude. |

| Dimensión | R14 | Comparación con R13 |
|---|---:|---|
| Confianza y privacidad | 6/10 | El radar mejora y persisten carreras relevantes. Confianza anterior 6. |
| Procedencia | 7/10 | Mejora con fuente por fila y tratamiento de ausencias. Antes se valoró dentro de confianza. |
| Claridad móvil | 7/10 | El resultado se entiende mejor. La longitud y el orden del regreso siguen pesando. Anterior 7. |
| Honestidad del contenido | 9/10 | El caso ficticio y su desenlace están identificados. La nota anterior de honestidad del informe era 8 y medía otra dimensión. |
| Solidez técnica | 7/10 | Mejoran integridad y migraciones. Se mantiene la nota anterior. |
| Pruebas | 7/10 | Más casos específicos. La cobertura del editor en vuelo y del móvil físico sigue pendiente. Sin nota anterior separada. |

## Hallazgos que Claude debe poder reproducir

| Gravedad | Evidencia | Corrección y condición de aceptación |
|---|---|---|
| Crítico antes de beta | public/js/almacen.js, líneas 66–76. Inicié la migración de una nota local bajo A, retrasé la lectura, reinicié el módulo y pasé a B. Al liberar la lectura, el módulo llamó al PUT con la nota bajo B. Experimento del módulo con API simulada. | Vincular el intento a la sesión de origen, cancelar al cambiar, comprobar identidad antes de cada escritura y antes de borrar el original. Prueba con dos cuentas y dos activos, interrupción antes de la primera y entre las dos escrituras. |
| Crítico antes de beta | public/app.js, líneas 219–232 y 358–365. Con la función real del editor aislada, liberé la respuesta de A después de limpiar el estado. Volvió a asignar el nombre privado a current. La exposición visual completa depende de la navegación. Además un 401 retrasado en api comprueba el token actual, no el que hizo la petición. | Comprobar la generación de sesión y de navegación antes de tocar estado, abrir diálogos o caducar la sesión. Limpiar inmediatamente al pulsar Salir. Probar A → visitante → B con detalle de cartera, conflicto local y 401 retrasados. |
| Importante | public/app.js, líneas 95–106 y 220–225. Las copias klever_edit_* guardan nombre, tesis y pesos en el dispositivo después de salir. El filtro del servidor no borra el disco local. | En un dispositivo compartido, advertir sobre ediciones pendientes antes de salir voluntariamente y permitir guardarlas o descartarlas. Definir recuperación privada y caducidad. Comprobar que al salir no queda texto privado recuperable por el siguiente usuario. |
| Importante | public/js/almacen.js, líneas 34–53. Reproduje un GET retrasado que devolvía radar vacío después de guardar una nota correctamente. La copia en memoria quedó vacía. El ensayo no demuestra pérdida en el servidor. La eliminación de la última fila usa un removeItem que puede ocultar errores. | Descartar lecturas anteriores a una mutación. Usar borrado estricto para datos privados. Probar almacenamiento bloqueado desde el inicio, último borrado fallido y recuperación tras recargar. |
| Importante antes de comparar/puntuar | scripts/fetch_fundamentals.mjs, líneas 19–33 y 58–60. La selección anual sigue basándose en FY y fecha final. Dos hechos con el mismo cierre pueden diferir en duración o revisión. Solo se extraen tres ejercicios. scripts/lib/carga.mjs admite sec como origen por defecto. | Distinguir flujos anuales de saldos puntuales, validar duración y revisión, guardar identificador del informe. Exigir fuente explícita y separar fixtures del conjunto real. Ampliar a cinco ejercicios verificables antes de emitir notas reales. No se puede estimar la cobertura efectiva sin una carga real. |
| Menor | Capturas 02–12 y prueba L1. Mucha lectura, símbolos sin nombre y aviso vacío antes de la tarea pendiente. outerHTML tampoco inspecciona todas las propiedades value ni prueba que la memoria quedó vacía. | Revisar con contenido realista, campos editados, diálogos, historial y navegación atrás. A 320 px comprobar la acción y sus etiquetas con zoom real, además del ancho total. |

Los topes en la escritura y las comprobaciones de propietario y revisión de escenarios mejoran la integridad. Las pruebas de SQLite pasan. Falta verificar la migración sobre una copia representativa en D1 y restauración. Cambiar los recuentos de 105 a 106 y las etiquetas de edición se ajusta al diseño, pero un recuento por sí solo no garantiza composición del catálogo. Comprobar que la empresa ficticia nunca entra en comparables reales. Una división con denominador cero devuelve valor ausente en los ratios revisados. No atribuir los fallos intermitentes de testE/testF al paralelismo sin un rastro que lo demuestre. Capturar última acción, salida, consola y estado del servidor. La separación de contenido, cálculo y presentación es razonable para una historia. Antes de añadir una base editorial, usar identificadores estables y comprobar la misma ruta en demo y web completa.

**Afirmaciones que ajustaría.** «Se descarta toda respuesta en vuelo» excede las garantías del editor. «Solo una carga real puede marcar SEC» excede lo que valida el generador SQL. «Se entiende en móvil» queda pendiente de una prueba con personas. Los nombres de autora y empresa ficticias, las fuentes de ejemplo y la revisión simulada sí se identifican. Mantener las distinciones entre fecha de carga, periodo financiero y fecha editorial.

## Encargo directo para Claude

Trabaja sobre la última versión funcional. El público inicial tiene entre 20 y 30 años y está aprendiendo a invertir. El propósito de Klever debe entenderse al entrar: crear una cartera, investigar por qué dar espacio a una empresa y observar qué cambia. Implementa en este orden.

### 1. Cerrar privacidad y regresiones

Entrega primero las correcciones de la tabla anterior con evidencia del fallo y del arreglo. Mantén la posibilidad de recuperar trabajo del propietario sin dejar su tesis expuesta tras salir. Repite las pruebas contra la versión completa y demuestra el comportamiento con cuentas A y B. Una dependencia remota pendiente permite avanzar con fixtures identificados en la demo.

### 2. Cinco cambios concretos en la web móvil

1. **Cartera.** Visitante nuevo: «Crea tu primera cartera» y «Explora una cartera de ejemplo». A quien vuelve, enséñale su reparto y cómo retomarlo. En el ejemplo, nombre, peso y una frase sobre por qué el autor incluyó cada posición.
2. **Ideas.** Revista y El Superespeculador alimentan la investigación. Primera vista con qué hace el negocio, por qué merece estudio y qué podría salir mal. Mantén la lectura extensa y las fuentes desplegables.
3. **Ficha.** Presenta nombre y símbolo juntos. Ofrece «Comparar con otra empresa» y «Probar en mi cartera» junto a la pregunta investigada. Preserva el contexto al volver atrás.
4. **Laboratorio.** Muestra cuánto espacio ocuparía la empresa, quién cede ese peso y qué cambia en los bloques evaluables. Usa el mismo ejemplo a lo largo del recorrido. Guárdalo sin tocar la cartera original.
5. **Seguimiento.** Abre con la pregunta pendiente y la fecha si existen. Después muestra la comparación, la revisión editorial y el resto del radar. Navegación principal de tres destinos: Cartera, Ideas y Seguimiento.

Conserva crema, azul tinta y verde petróleo. La referencia visual es la segunda propuesta centrada en construir carteras. Quita de la primera vista el radar vacío por delante de una tarea, los filtros desplegados por defecto y las explicaciones largas repetidas antes de la acción. El duelo de marcas quedó descartado. La entrega es web móvil y escritorio.

### 3. Comparador sencillo entre dos empresas

Desde una ficha se elige una compañía del mismo sector. Presenta tres filas: crecimiento de ventas, margen operativo y deuda. Define el indicador de deuda, su unidad y su interpretación en ambas columnas. Para margen operativo usa resultado operativo sobre ventas. No sustituirlo por margen neto. Alinear ejercicios, moneda cuando corresponda, unidades y método. Mostrar fuente y periodo por cifra y explicar «sin dato» o «no comparable» cuando proceda. La acción final abre el laboratorio con la compañía elegida. Una sola decisión por pantalla, sin clasificación de ganadores.

### 4. Nota de estructura y solidez · v1

Implementa el método en un módulo puro versionado, compartido por cartera y laboratorio. Congela el universo y los datos disponibles en la fecha de evaluación. Primer ámbito: carteras simuladas de acciones. La pantalla presenta nota de 1 a 10, principal fortaleza, principal limitación, cobertura y «¿Por qué esta nota?». Describe estructura y fundamentales observados. Una nota alta no garantiza rentabilidad ni idoneidad personal.

| Bloque | Peso | Regla |
|---|---:|---|
| Empresas | 20 % | Agrupar clases de la misma compañía. Número efectivo N = 1 / suma de pesos al cuadrado. Escala lineal de 1 punto con N=1 a 10 con N≥15. |
| Sectores y actividades | 20 % | Mitad sector, mitad actividad. Misma fórmula, con máximos a 6 sectores y 10 actividades efectivas. Los índices bursátiles solo se muestran como contexto. |
| Tamaño y liquidez | 15 % | Un tercio capitalización, dos tercios mediana de importe diario negociado en 60 sesiones. Percentiles del universo cubierto en moneda común. Convertir percentil p de 0–100 a 1 + 9p/100. |
| Deuda y caja | 25 % | Mitad deuda neta/EBITDA por percentil sectorial inverso, mitad frecuencia de caja libre positiva en cinco ejercicios. Caja neta y EBITDA positivo, 10 en deuda. Deuda positiva con EBITDA nulo o negativo, 1. Si ambos son nulos o negativos, sin evaluar. Documentar casos frontera antes de activarlos. |
| Rentabilidad y crecimiento | 20 % | Mitad percentil sectorial de la mediana de ROIC a cinco años, un cuarto frecuencia de beneficio positivo en cinco ejercicios y un cuarto frecuencia de crecimiento de ventas en cuatro variaciones anuales. |

Las frecuencias se convierten en 1 + 9 × aciertos/periodos. Para los percentiles sectoriales de deuda y ROIC exige al menos 20 compañías válidas y documenta empates. Dentro de cada indicador empresarial pondera según el peso de cada compañía. Publica la nota solo si la cartera suma 100 % y cada indicador cubre al menos 90 % del peso total. Sobre ese mínimo normaliza los pesos evaluables para ese indicador y presenta la cobertura mínima. Si falta un bloque, muestra los disponibles y el motivo de la nota pendiente. Bancos, aseguradoras y ETF sin metodología o composición válida cuentan como peso sin evaluar en los indicadores afectados.

Redondea solo la nota final a un decimal. Explica la mayor limitación mediante peso del bloque × (10 − puntuación). Conserva fecha, fuente, versión del método y composición. En un escenario anterior, mantén la evaluación fechada que vio el usuario. Los umbrales son provisionales. Usa ejemplos sintéticos rotulados para probar el método y deja su activación con datos reales pendiente de calibración y verificación.

**Casos que deben pasar.** 50/50 da dos empresas efectivas y 90/10 aproximadamente 1,22. Dos clases del mismo emisor cuentan una vez. Una empresa pequeña al 2 % pesa menos en el resultado que al 30 %. Falta un ejercicio, hay 19 comparables, la cobertura es 89,9 %, falta composición de un ETF o la cartera suma 95 %: cada caso debe indicar exactamente qué puede calcularse. Probar 90 % exacto, empates y totales sin doble redondeo. Si la cartera y el escenario tienen igual composición, fecha y datos, la nota debe coincidir.

### 5. Seguimiento de tus decisiones en la primera demo

Incorpora esta propuesta en la portada en una frase breve: «Crea tu cartera y sigue qué ha cambiado en las empresas que elegiste investigar». En Seguimiento, muestra la etiqueta **En beta · Formará parte del futuro plan de pago** junto a la función. Debe poder probarse en la demo sin suscripción.

Reutiliza la pregunta, el escenario y la revisión editorial de Hidrógeno Norte. Una tarjeta debe reunir la pregunta original, qué ha ocurrido desde entonces, la fecha, la fuente y el peso de esa empresa en el escenario guardado. Distingue ese peso del que tiene en la cartera actual. Incluye un enlace a la revisión y otro a la simulación. Si la fuente aún no permite responder, indica qué sigue pendiente.

**Prueba de aceptación.** Un visitante abre el ejemplo identificado como ficticio. Puede pasar de «¿Se han firmado los dos contratos anunciados?» a la revisión simulada, ver qué pasó con cada contrato según la historia y entender por qué le interesa si había probado dedicar un 10 % a esa empresa. Añade un caso sin novedades. Con cuenta, usa solo las preguntas y posiciones del propietario. Comprueba a 390 px que se leen tanto la etiqueta de beta como la referencia al futuro plan de pago. El contenido de ejemplo llevará su propia indicación de datos simulados. Entrega una captura de esta tarjeta en el regreso. Si la ronda 15 ya está en marcha, incorpora este apartado sobre los cambios existentes.

### 6. Entrega y aceptación

Envía ZIP, demo autónoma e instrucciones de apertura. Añade cuatro capturas consecutivas del mismo caso: empiezo la cartera, descubro la empresa, entiendo qué aportaría y pruebo su peso. Incluye una captura de regreso y otra de nota pendiente con el motivo. Aporta pruebas antes/después de privacidad y una tabla de entradas y salidas esperadas del comparador y la puntuación.

ChatGPT revisará cálculos, casos límite y recorridos. Para probar con usuarios, observar a cinco principiantes con un móvil: si construyen una cartera sin ayuda, explican de dónde sale el 10 % y distinguen una nota de estructura de una previsión de rentabilidad. Registrar dificultades reales por separado de las pruebas automáticas.

**Verificación pendiente.** TestL/K contra el servidor completo, batería completa en clon limpio, correo y D1 remotos, carga SEC real, recuperación tras recarga en dos dispositivos, Safari/Firefox, móvil físico, tema oscuro y lector de pantalla. Priorizar M50–M57 antes de abrir cuentas a terceros y M58 antes de publicar contenido real. Para accesibilidad comprobar lectura por fila, orden del foco, recuperación tras confirmar o cancelar y anuncio de resultados, además de la presencia de atributos.

## C13 · Ronda 16 (2026-11-04) — revisión de la ronda 15 y encargo, literal

# Klever · Revisión de la ronda 15 y encargo para Claude

## Decisión

Conservaría Cartera, Ideas y Seguimiento como estructura de la demo. La portada permite crear una cartera o entender una de ejemplo. El comparador permite investigar dos empresas del mismo sector, ver tres indicadores y pasar al laboratorio. La tarjeta de seguimiento ya ilustra el servicio que Javier quiere probar. Recupera la pregunta sobre los contratos, distingue el firmado del aplazado, enlaza la revisión y separa el peso simulado del peso actual. La etiqueta «En beta · Formará parte del futuro plan de pago» corresponde al alcance acordado.

Usaría esta entrega en una revisión interna. Antes de abrir cuentas a terceros hay que corregir cómo se guarda y presenta la nota. Antes de demostrársela a principiantes hay que enseñar un caso en el que la nota se pueda calcular y otro en el que deba quedar pendiente.

## Qué se verificó

Repetí 168 comprobaciones en 11 suites locales. Pasaron las 9 de almacenamiento, 9 del comparador, 26 de la nota, 18 de carga, 12 de migración y 94 de cálculo, acceso y servidor de rondas anteriores. Revisé las nueve capturas adjuntas a 390 px, los módulos y las rutas de la API. En Chromium a 390 px abrí la cartera de ejemplo de la demo autónoma y encontré la nota pendiente y sin fecha. No completé una nueva pasada del recorrido en navegador: al reanudar las pruebas, Chromium se cerró durante el arranque.

Claude declara 623 comprobaciones correctas en su última pasada completa. Tras dos retoques de texto volvió a ejecutar testN y a construir la demo. Las pruebas de módulo del radar respaldan el arreglo del cambio de sesión. Las de navegador con A y B proceden de Claude. En una caducidad involuntaria quedan copias locales de ediciones pendientes según la política documentada. Siguen pendientes la validación de D1 remoto, correo real, datos financieros reales, dispositivo físico y la prueba con cinco principiantes.

## Hallazgos y encargo de la ronda 16

Claude, empieza en la última versión y entrega estos cambios por orden. El objetivo es que una persona pueda entender por qué recibe una nota y recuperar su pregunta cuando cambie un hecho importante.

### 1. Proteger las notas de escenarios guardados

En functions/api/escenarios/index.js se verifica la presencia de una versión, pero el campo de nota admite texto. Envié un marcador HTML inocuo dentro de ese campo al manejador con SQLite y obtuve HTTP 201 con el marcador intacto. En public/js/lab.js, mostrarEscenario interpola ese campo en innerHTML sin escaparlo. La prueba demuestra aceptación y persistencia; no demuestra exposición entre cuentas.

Exige números finitos entre 1 y 10 o null según el estado, controles de fecha, cobertura, versión y estructura. Renderiza como texto incluso registros antiguos manipulados. Si el servidor no puede verificar la evaluación, trátala como tal. Criterio de cierre: una nota con marcado se rechaza al guardar y una fila antigua equivalente se abre sin crear etiquetas en el DOM. Un escenario válido conserva su nota histórica.

### 2. Corregir la puntuación antes de calibrarla

En public/js/nota.js, un EBITDA ausente se evalúa como un EBITDA observado igual o inferior a cero cuando hay deuda positiva. Al crear una cartera sintética con una posición al 100 %, EBITDA ausente y una sola sesión de negociación, obtuve **3,5/10 con 100 % de cobertura**. La liquidez comprueba un importe positivo, pero omite la longitud de la ventana. El endpoint universo lee moneda y fuente de mercado, aunque no las transmite por empresa al evaluador.

Distingue tres entradas: ausente, cero y negativa. Si falta EBITDA deja pendiente ese indicador. Para liquidez exige las 60 sesiones acordadas, moneda común, procedencia y fecha. Mantén umbrales y pesos de la v1 y calcula cobertura por indicador, como se acordó; la implementación actual exige datos conjuntos por bloque. Prueba una cartera con datos ausentes en posiciones distintas que conserve un 90 % evaluable en cada indicador. Conserva por separado el caso de solo 89,9 %. Activa la nota de ejemplo solo para un conjunto sintético identificado; con datos reales o mixtos la publicación requiere una habilitación explícita posterior a la calibración.

Pruebas mínimas independientes: EBITDA ausente frente a cero con los demás datos válidos; 59 frente a 60 sesiones con EBITDA válido; mezcla de monedas o fuentes; cartera completa con cobertura suficiente. Guardar y reabrir la misma evaluación debe conservar cifra, fecha, cobertura y versión.

### 3. Mantener el seguimiento cuando cambia la redacción

En public/js/contenido.js, casoSeguimiento vincula respuesta y pregunta mediante igualdad literal del texto. En el módulo, añadir un espacio dejó la revisión sin vínculo. Una reformulación equivalente también lo pierde. La frase «Sin novedades» puede aparecer pese a que existe una revisión publicada de esa historia.

Guarda un identificador estable para la cuestión editorial y separa la nota personal del usuario. Si la persona escribe una pregunta distinta, ofrece «Ver revisión de la historia» y aclara si responde o sigue pendiente. Migra las coincidencias antiguas inequívocas. Prueba tres casos con la misma empresa: texto original, reformulación que conserva el vínculo y pregunta nueva sin respuesta. Mantén el ejemplo de ambos contratos, la fecha, la fuente y la etiqueta del futuro plan de pago. Comprueba cada caso al guardar, cerrar sesión y volver con la misma cuenta, y luego verifica el aislamiento con otra cuenta.

### 4. Hacer demostrables las dos salidas de la nota en móvil

La primera cartera de ejemplo muestra «Nota pendiente. Nota pendiente» y «observados el fecha no disponible». Conserva un ejemplo incompleto, con una explicación como «Podemos medir el reparto. Faltan datos para valorar la deuda». Prepara también un ejemplo con cinco ejercicios, suficientes comparables, liquidez válida y fecha. Debe producir una nota calculada por el mismo módulo y una explicación concreta basada en sus posiciones. Por ejemplo, si una empresa concentra el 60 %, nómbrala y muestra el porcentaje. El encabezado, una fortaleza y una limitación bastan antes de «¿Por qué esta nota?».

En el comparador mantén crecimiento de ventas, margen operativo y deuda neta/EBITDA con fuente y periodo. Expresa la última ratio en veces y describe qué cantidades se comparan. «Años para cubrir la deuda» puede leerse como un plazo efectivo de devolución. En el laboratorio, coloca la frase sobre quién cede el peso justo al calcular y deja el desarrollo debajo.

## Entrega y prueba de aceptación

Entrega el ZIP, la demo autónoma reconstruida del mismo código y las pruebas antes y después de los fallos. Adjunta cuatro capturas legibles del teléfono: una nota calculada, una pendiente con su motivo, la actualización tras editar una pregunta y la comparación con los pesos antes y después. Ejecuta la batería sobre el código definitivo e identifica por separado lo probado en módulos, navegador y entorno remoto.

La demo autónoma pierde sus datos al recargar. Úsala para observar la primera visita y mostrar el ejemplo de regreso. Para probar con personas «mañana, cierra y vuelve», usa un entorno privado con persistencia ya verificada o declara la tarea pendiente. Registra si cada participante entiende de dónde sale el 10 %, qué mide la nota y cuál de los dos contratos se firmó. La disposición a pagar por el seguimiento sigue siendo una hipótesis.

## C14 · Ronda 17 (2026-11-04) — revisión de la ronda 16 y encargo, literal (la maqueta aprobada está en `ronda17/referencia/maqueta-crea-tu-portafolio.png`)

# Klever · Revisión de la ronda 16 y encargo completo para la ronda 17

## Decisión de producto y veredicto

Claude, trabaja sobre la entrega R16 de Klever. La ronda 17 tiene dos objetivos de aceptación independientes. Primero, que cada resultado de la simulación pueda explicarse y verificarse con los datos que lo originaron. Segundo, que desde el primer vistazo el usuario entienda que puede **crear, entender y seguir su portafolio**. La revista de inversión tiene una sección propia y secundaria. La referencia visual aprobada es la última maqueta de «Crea tu portafolio», con el fondo carbón y cobre y la tipografía refinada.

Se aceptan las tres reparaciones de R16 indicadas en la revisión técnica. Hay cuatro frentes abiertos que condicionan la siguiente entrega. La auditoría anterior repitió 133 comprobaciones de siete baterías. El registro de Claude recoge 659 en treinta baterías. Esta actualización incorpora las decisiones de diseño posteriores a aquella auditoría. La maqueta es una referencia de implementación.

## Encargo ejecutable para Claude

### 1. Cierra primero la integridad del resultado

| Frente | Cambio requerido | Evidencia para aceptar |
|---|---|---|
| Procedencia y fechas | Verifica cada fila utilizada antes de clasificar o calcular. Distingue demo sintética, mezcla y datos incompletos. Expón instantánea y periodo efectivo. | Semilla íntegra KO 60 / PG 40 → 4,4. Repite con fuente NULL, fecha imposible, texto «ayer» y origen mixto desde SQL. En cada caso inválido, la interfaz explica por qué queda pendiente. |
| Nota guardada | Comprueba versión conocida, estructura propia y coherencia entre bloques redondeados y total. Trata las filas antiguas según lo verificable. | Cambiar solo 4,4 por 10 o la versión por «foo» debe detectarse. Prueba también redondeos válidos, límites, entidades escapadas y texto bidireccional. |
| Seguimiento editorial | Comparte entre cliente y servidor un catálogo de pares historia/pregunta. En la edición muestra la pregunta vinculada y permite desvincularla expresamente. | Rechaza referencias nuevas inexistentes, identifica históricas inválidas y conserva la reformulación legítima. Verifica aislamiento y edición concurrente. |
| Fiabilidad de las pruebas | Sustituye expresiones abiertas, esperas genéricas y capturas de error que equivalen a éxito por aserciones observables. | Exige 4,4 exacto en la semilla, 200 y lista vacía en la segunda cuenta, 404 sobre el ID ajeno y revocación del token antiguo. Separa respuesta interceptada de fila corrupta real. |

### 2. Implementa el diseño aprobado en los recorridos reales

**Referencia para adjuntar a Claude:** [Interfaz premium de inversión suiza.png](https://chatgpt.com/library?file_id=libfile_5686add816a481919d7da06ff5e8e317&account_id=personal). Usa la imagen como referencia visual. Construye los paneles, controles, textos y gráficos como componentes interactivos. La maqueta representa una distribución de ejemplo. Conserva los activos admitidos, las reglas de cálculo y los estados que ya existen en la aplicación.

| Pantalla | Qué debe poder hacer el usuario | Jerarquía visual |
|---|---|---|
| Entrada | Crear el primer portafolio. Con borrador persistido, retomarlo. Con portafolio guardado, abrir «Mis portafolios» y elegirlo. | Una acción principal según el estado. En demo, indica que la sesión se pierde al recargar. |
| Creador | Entender el objetivo, elegir posiciones y ajustar pesos antes de revisar. Adapta los pasos al flujo existente. | En escritorio, controles a la izquierda y resultado a la derecha. En móvil, una columna con el resumen cerca de los controles. Ofrece entrada numérica además del deslizador. |
| Revisión y laboratorio | Entender el reparto, qué cambia al añadir una posición y los motivos de una nota calculada o pendiente. | Resultado tras la barra de pesos, antes de las salidas. Una fortaleza y una limitación a la vista. Detalle técnico en «Cómo se calcula». |
| Cuaderno | Recuperar una decisión, su pregunta original y la revisión vinculada. | Da prioridad al texto del usuario. Si dos preguntas comparten desenlace, conserva sus enlaces y evita repetir el artículo completo. |
| Revista | Elegir una lectura sobre empresas emergentes, sectores o movimientos de mercado. «El Superespeculador» se identifica como opinión, con hipótesis, motivo para revisarla y fecha. | Entrada secundaria en navegación. Si incorporas una lectura contextual al creador, permite regresar al mismo paso con los pesos intactos. Usa los contenidos disponibles o ejemplos etiquetados. |

**Acabado visual.** Conserva el fondo carbón cálido y el resplandor cobre discreto de la esquina superior derecha. Utiliza marfil para texto principal y un único título con serif de contraste moderado por pantalla. Para controles y tablas, usa una sans legible y cifras tabulares alineadas. Centraliza colores, tipografía, márgenes, bordes y foco en los estilos compartidos. Como punto de partida, prueba Georgia para el título y la sans del sistema para interfaz. Ajusta tamaño y peso frente a la imagen aprobada. Reserva el naranja intenso para la acción principal o el paso activo. Reproduce el anillo fino, las líneas discretas y el espacio alrededor de las cifras. Acompaña cada segmento de nombre, porcentaje o importe. Un control visualmente fino conserva un área táctil amplia.

**Ayuda durante la decisión.** Al mover un peso, actualiza en el mismo paso el importe, la leyenda y el gráfico. Si el reparto aún no es válido, indica cuánto falta o sobra según las reglas existentes. Ejemplo de aceptación para la ayuda contextual: con 10.000 € simulados y 2.000 € en una empresa, una caída hipotética del 25 % en esa posición, manteniendo las demás constantes, supone 500 € menos en la cartera. Identifica la hipótesis y recalcula al editar el peso. La nota global continúa restringida a la demo validada.

### 3. Entrega y revisión independiente

1. **Claude entrega** el código y la demo reproducible, instrucciones de arranque, semillas mínimas, JSON y resultado visible por caso, registro de suites con fallos y reintentos, y lista de pendientes manuales. Identifica cambios técnicos y visuales por separado. Incluye una única guía para abrir el recorrido.
2. **Capturas comparables** del creador en escritorio y a 390 y 320 px. Incluye las dos notas móviles, el acceso a Revista y el retorno desde el contenido si existe. Verifica teclado, foco visible, nombres accesibles, texto al 200 %, posibilidad de ajustar pesos sin arrastrar y ausencia de desplazamiento horizontal de página. En tablas, limita el desplazamiento a una región identificable.
3. **ChatGPT revisa** procedencia, nota, vínculo editorial y aislamiento con casos válidos y corruptos. Repite las pruebas endurecidas y compara capturas con la referencia aprobada. Prueba primera visita, borrador, regreso a cartera y cambio de ejemplo. Distingue verificaciones automáticas, inspección visual y pruebas pendientes en dispositivo real.
4. **Cierre de ronda.** Aceptar por separado la reparación técnica y la aplicación visual. Exigir que KO + PG conserve 4,4 y KO + JPM explique por qué queda pendiente. Registrar cualquier fallo y su reproducción antes de declarar el recorrido completado.

**Alcance futuro ya reservado.** Conexión a Revolut y Trade Republic, artículo diario personalizado y tip diario pertenecen al futuro plan de pago. En esta ronda se prepara la sección editorial. Las integraciones bancarias, la personalización diaria y la activación con datos reales quedan para encargos posteriores.

---

# Evidencia de la revisión independiente de R16

## Veredicto
Aceptaría las tres reparaciones de la ronda 15. El mismo guion cambia de resultado en las dos versiones entregadas.  
La cifra se entiende mejor al relacionarla con Coca-Cola y el sector. La explicación pendiente todavía exige saber qué es el EBITDA.  
Mantendría la nota en demostración. Con fundamentales sin fuente he obtenido el mismo 4,4 y la etiqueta de conjunto sintético.

| Criterio | R15 | R16 | Motivo |
|---|---:|---:|---|
| Confianza y privacidad | 6 | 7 | Se rechaza marcado al guardar y al leer. La otra cuenta queda fuera del detalle y la edición en SQLite. |
| Procedencia de datos | 7 | 6 | Un caso nuevo demuestra que una fila utilizada puede quedar fuera de la clasificación de origen. |
| Claridad móvil | 7 | 8 | Ambos estados tienen ejemplos legibles a 320 px. El principal impedimento es encontrar el resultado. |
| Honestidad del contenido | 9 | 9 | Los ejemplos avisan de su carácter ficticio. El texto de fecha común y la causa atribuida a JPM necesitan precisión. |
| Solidez técnica | 7 | 7 | Mejor cobertura y vínculo estable. Persisten referencias inexistentes y resúmenes numéricamente contradictorios. |
| Calidad de las pruebas | 7 | 8 | La comparación entre versiones es reproducible. Hay aserciones de navegador que pueden pasar con un resultado incorrecto. |

## Qué he repetido
Node 24.22.1. Instalación con npm ci. En SQLite local y módulos puros, 78 comprobaciones correctas de 78: nota 35, escenarios 11, migración 14, comparador 9 y almacén 9. El registro entregado suma 659 en 30 baterías y registra aparte la demo correcta. Esa cifra pertenece a la ejecución del autor.

| Mismo guion sobre ambos ZIP | R15 | R16 |
|---|---|---|
| Marcado en nota | 201, el GET devuelve el marcador | 400, la lista deja de exponer el marcador de la fila antigua |
| EBITDA ausente | 3,5 y cobertura del 100 % | Pendiente, con cobertura de deuda del 0 % |
| Original / espacio añadido / reformulación | Solo responde al original | Responde a los tres conservando la referencia |

Los ZIP carecen de historial Git. Recuperé el ZIP de la ronda 15 y ejecuté el mismo guion sobre sus archivos. Esto compara los módulos y los manejadores incluidos, sin autenticar los hashes ni demostrar comportamiento del DOM.

## Hallazgos y encargo para Claude
**Críticos.** No identifiqué un fallo crítico en los recorridos locales examinados.

**1 · Importante. El ejemplo puede publicar datos sin procedencia.** En SQLite cargué la semilla y ejecuté `UPDATE fundamentales SET fuente=NULL WHERE ticker='KO'`. Llamé a `/api/universo` mediante su manejador y evalué KO 60 / PG 40. Devolvió origen sintético y 4,4. El esquema admite NULL y `functions/api/universo.js`, líneas 12–21, descarta las fuentes vacías para clasificar, pero conserva las cifras para calcular. Además, sustituir la fecha de mercado de KO por «ayer» en la entrada del evaluador también dejó el 4,4. En `public/js/nota.js`, líneas 35–37 y 56–62, basta una fecha no vacía y las filas sin fecha pueden votar por la fuente de referencia. Validar fecha real y fuente antes de votar o puntuar. Separar procedencia incompleta, mezcla y demo. Probar cada caso desde SQLite hasta el resultado visible. La fecha máxima del universo no garantiza que cada fundamental se observara ese día. Mostrar «instantánea» y el periodo efectivo por dato.

**2 · Importante. Una nota inventada puede parecer coherente.** Cambiar solo el 4,4 por 10 en el resumen, conservando todos los bloques, pasa la validación. También pasa la versión «foo». El filtro sí rechazó marcado en los 16 campos y subcampos ensayados. En `public/js/nota.js`, líneas 140–168, validar versiones conocidas y coherencia del total con un intervalo que considere que los bloques guardados se redondean a dos decimales. Si un registro histórico no permite verificar el cálculo, presentarlo como «valor guardado por el cliente» junto a la cifra. El límite de 6000 se aplica a la copia reconstruida en unidades de cadena JS, no a los bytes recibidos. Aceptable como límite del registro para la forma vigente. Las cadenas numéricas se rechazan. El cero negativo queda fuera de la nota publicada y equivale a cero en campos que lo admiten. Se aceptan controles bidireccionales y propiedades heredadas en llamadas JS directas. Usar propiedades propias y filtrar controles de dirección en texto visible. Una clave JSON propia __proto__ es una clave extra. Una entidad escapada debe permanecer como texto al pintar. Añadir casos DOM para entidades y límites 700/701.

**3 · Importante. La referencia editorial admite números inexistentes.** En `functions/api/escenarios/index.js` línea 52 y `[id].js` líneas 32–33 se controla formato e historia, pero no existencia. En `public/js/contenido.js` líneas 103–114 una referencia desconocida puede caer en «otra pregunta». Resolver el par contra un catálogo compartido de identificadores inmutables. Al cambiar el texto de forma sustancial, hacer visible si se conserva el vínculo. Hoy una pregunta sobre otro asunto seguirá apareciendo respondida si se deja marcada la casilla. Mantener la opción de reformular y el control de revisión concurrente. La migración 0011 vincula dos textos exactos dentro de su historia. Probar también la segunda coincidencia y las referencias inválidas preexistentes. No encontré acceso cruzado en las rutas inspeccionadas, que filtran por usuario; P9 verifica lectura y PATCH ajenos.

**4 · Importante para la siguiente validación. Algunas pruebas pueden dar un verde engañoso.** En `tests/ronda16/testO.cjs`, O1 acepta por expresión regular cualquier cifra con uno o dos enteros y un decimal. Fijar 4,4 para esta semilla. O5e, línea 67, convierte cualquier fallo de carga en lista vacía. Exigir autenticación positiva, respuesta 200 con lista vacía y 404 de la otra cuenta sobre el ID concreto. O6 exige mensaje de rechazo, ausencia de imagen y de ejecución. Es una prueba válida de la interfaz con respuesta interceptada. Contabilizar la intercepción del escenario concreto y conservar aparte la prueba de fila corrupta real. P9 reemplaza sesiones directamente en SQLite y ni siquiera compara la evaluación en su aserción de vuelta. Verificar token antiguo revocado y contenido antes/después en el recorrido HTTP. Para los fallos intermitentes E/F y el historial, registrar orden de navegación, respuestas y contexto por repetición, introducir latencia controlada y esperar una condición observable. Su causa sigue abierta.

**Menores.** La moda por par moneda/fuente y el empate se comportaron como se espera con datos completos. En pruebas propias, 59 sesiones dieron pendiente y 60 dieron 4,4; otra fuente y empate dieron pendiente. Sin EBITDA, tanto deuda negativa como deuda cero quedaron pendientes. La cobertura de cada indicador suma pesos de posiciones evaluables, de modo que comparables sin peso pueden alterar el percentil, pero no cubrir el 90 %. El total se redondea una vez. Las veinte ficticias cambian la distribución de consumo básico y, por tanto, el significado del percentil de KO. Separar las semillas por entorno, marcar la población de comparación y probar que ninguna EJBA–EJBT entra en una importación real. La protección actual es el origen global y la habilitación cerrada, no un filtro de esas empresas por identidad.

**Regresiones y mantenimiento.** Actualizar 106 a 126 no debilita por sí solo la prueba, pero que el total coincida no prueba que sigan las 106 originales. Comparar conjuntos de tickers. La igualdad de columnas de escenarios que desapareció de M1d se vuelve a comprobar después de 0011 en M1e. Los cambios de texto en N7/N8 son razonables si se sigue probando el estado y la acción del usuario. El módulo puro compartido entre servidor y UI evita dos validadores divergentes. Aceptaría por ahora la concatenación de la demo con una prueba de paridad de entradas y salidas y reconstrucción reproducible.

## Qué se entiende al mirar las seis capturas
**01–02, calculada.** El lector puede asociar el 4,4 con una decisión concreta: KO pesa el 60 % y ambas posiciones están en el mismo sector. El acierto es explicar el reparto. La expresión «1,9 empresas del mismo tamaño» ocupa atención antes de que se entienda por qué la concentración resta. La tarjeta aparece después de las dos descripciones y los botones. A 320 px es fácil salir hacia el laboratorio sin haber visto la nota.

**03–04, pendiente.** El recuadro nombra lo que sí se mide y señala a JPM, que pesa la mitad. Sin embargo, «faltan datos» invita a pensar que una actualización lo resolverá. En este ejemplo falta un método aplicable a bancos. Debajo se repite la explicación con ratios y porcentajes. En ambos ejemplos queda explícito que la cifra no predice rentabilidad. Haría igualmente visible que la cifra solo está habilitada en la demo sintética.

**05, seguimiento.** Se puede deducir que el original y la reformulación comparten respuesta y que la pregunta sobre el cliente sigue abierta. Para hacerlo hay que leer las tarjetas completas. Las dos primeras muestran «Con novedades» y repiten el mismo desenlace. Mejor titularlas «Tu pregunta tiene respuesta» y «Tu reformulación tiene respuesta». La tercera sí diferencia bien el enlace editorial de una respuesta personal. Mantener la etiqueta visible del futuro plan de pago.

**06, laboratorio.** «Quién cede el peso» llega en el orden correcto. KO pasa de 60 a 54 y PG de 40 a 36: eso explica de dónde sale el nuevo 10 % antes de exigir leer la tabla. Las barras muestran proporciones y la tabla permite recuperar valores sin depender del color. A 390 px la tabla de bloques queda bastante más abajo y sus cabeceras se leen pequeñas. A 320 comprobaría desplazamiento dentro de la tabla y conservación de columna y signo con texto ampliado. La captura aportada no prueba ese ancho.

**Comparador.** «Veces» mejora la unidad. «Dos años de EBITDA» reintroduce la interpretación temporal justo antes de desmentirla. Texto propuesto: «Por cada euro de EBITDA del ejercicio hay dos euros de deuda neta. Esta relación no indica cuándo se devolverá la deuda». En O3 comprobar ambas celdas, no una coincidencia en toda la fila.

### Los cinco cambios de mayor impacto en móvil
1. Colocar el resultado tras la barra de pesos y antes de los botones, con una insignia corta «Ejemplo con datos ficticios».
2. Anclar la cifra a su principal motivo. «4,4 de 10. Toda la cartera está en consumo básico y Coca-Cola concentra el 60 %.»
3. Para JPM, explicar el límite directamente: «Podemos medir cómo repartes tu cartera. La mitad está en un banco y este método todavía no evalúa bien la deuda y los beneficios de los bancos. Por eso no damos una nota total».
4. Dejar a la vista una fortaleza, una limitación y la fecha de la instantánea. Mover porcentajes por indicador, umbral, EBITDA y empresas efectivas a «Cómo se calcula».
5. Juntar ambas salidas bajo un selector con nombres concretos: «KO + PG · con nota» y «KO + JPM · pendiente». Al cambiar, conservar el foco y anunciar el estado. Probar a 320 y 390 px y con texto ampliado.

**Tres cosas que quitaría:** la segunda explicación técnica del pendiente siempre desplegada, la equivalencia «dos años» y el segundo resumen editorial completo cuando dos preguntas enlazan a la misma revisión. Conservar la pregunta personal y un enlace en cada tarjeta.

**Accesibilidad.** La casilla tiene etiqueta asociada (`public/js/lab.js`, líneas 460 y 538). Asociar la ayuda a la casilla y anunciar el cambio de resultado sin mover el foco inesperadamente. Varias tablas tienen cabeceras de columna y región enfocable con nombre. Verificar que al recorrer filas se anuncian posición, antes, después y unidad, y que cada botón repetido identifica su pregunta. Las capturas sirven para juzgar jerarquía y corte visible; no acreditan VoiceOver, TalkBack ni comprensión de principiantes.

## Criterio de entrega para la ronda 17
Primero cerrar los casos reproducibles de procedencia y coherencia. Después resolver la referencia editorial, compactar ambas notas y reforzar las aserciones. Entregar semilla mínima reproducible, respuesta JSON y resultado visible para cada fallo, dos capturas comparables a 320 y 390 px y registro de las suites. Comprobar que un cambio cosmético conserva el 4,4 del ejemplo intacto y la nota pendiente del banco.

**Ajustes al informe anterior.** Describir las 659 como comprobaciones locales del autor. «Comprobación de formato» es defendible; «evaluación verificada» excedería la evidencia. «Toda fila con fuente es sintética» deja fuera las filas sin fuente que sí cuentan. En ABRIR-EN-MOVIL, paso 6, persiste «sin novedades» aunque el producto cambió esa redacción. El ejemplo de antes/después sustenta módulo y servidor. La calidad predictiva, la comprensión y la ausencia de regresiones generales siguen sin demostrarse.

## Pruebas manuales pendientes
- **M67 y M72.** iPhone y Android, con y sin lector. Pedir al usuario que explique el 4,4, diga si anticipa ganancias y por qué JPM deja la nota pendiente. Comprobar casilla, cambio de ejemplo, foco, tabla a 320 px y texto al 200 %.
- **M68.** Dos cuentas, red lenta y reingreso. Crear original, reformulación y pregunta nueva. Comprobar respuesta, orden, pesos y acceso por URL de la otra cuenta.
- **M69 y M70.** En D1 de prueba, copia y restauración verificables antes de migrar. Leer fila antigua corrupta y contrastar los dos textos exactos y los casos ambiguos tras 0011.
- **M71.** En un conjunto aislado, comprobar fechas y fuentes de mercado, periodos y comparables. Documentar una calibración separada antes de cualquier activación real.
- **Históricas.** Mantener el listado M1–M66. Priorizar M50–M57 y M60 antes de abrir cuentas, M58 y M64 antes de contenido real. Siguen pendientes la entrega de correo, carga SEC, migraciones remotas 0008–0011, dispositivos físicos, Safari/Firefox, tema oscuro y prueba con cinco principiantes. La demo pierde los cambios al recargar. No he validado despliegue remoto, datos reales ni el origen de los fallos intermitentes.

## Resultado independiente en navegador
Chromium 153.0.8010.0, Playwright del proyecto y Wrangler/Miniflare local. O pasó 14 de 14 y N pasó 41 de 41. En total repetí **133 comprobaciones de las siete baterías solicitadas, con cero fallos**, además del antes/después y los casos propios. Usé un binario Chromium alternativo porque la descarga de Playwright llegó truncada, y limité la detección de interfaces de Wrangler a loopback. No repetí las 659. O5e pasó con su espera y captura genérica de errores, por lo que su verde aislado sigue siendo débil.

**Dos precisiones para el siguiente encargo.** N25 solo serializa y deserializa JSON; el guardado por API debe acreditarse con la suite de escenarios. N24 prueba origen ausente y real, pero no construye por sí misma un conjunto mixto desde SQL. El guion con principiantes propone cerrar y volver mañana en una demo que pierde datos al recargar: probar esa tarea en el servidor con persistencia, o medir en la demo únicamente la comprensión durante la misma sesión.

**Caso propio de seguimiento.** POST con hidrogeno-norte:99 devolvió 201 y se mostró como otra pregunta. La pregunta «¿Cuánto sube el alquiler?» enviada con hidrogeno-norte:1 también devolvió 201 y el módulo la clasificó como respondida. El sistema se fía de la asociación elegida.

## C15 · Ronda 18 (2026-11-04) — revisión de la ronda 17 y encargo, literal

# Klever · Revisión de la ronda 17 y encargo de la ronda 18

Fecha de revisión · 4 de noviembre de 2026

## Veredicto en tres líneas

**Reparación técnica — rechazo el cierre completo.** Acepto las reparaciones principales de R16, pero he reproducido una nota incoherente aceptada por la API y una fecha mal formada que sigue permitiendo publicar.
**Aplicación visual — rechazo el cierre completo.** El fondo, la tipografía y la navegación siguen la dirección aprobada. El creador móvil necesita una jerarquía más corta y la acción principal visible en el momento de decidir.
**La ronda 18 debe cerrar estos casos y pulir el recorrido existente.** Las comprobaciones repetidas y sus límites se detallan debajo.

| Criterio | R16 | R17 | Motivo |
|---|---:|---:|---|
| Confianza y privacidad | 7 | 8 | Pasan las pruebas repetidas de acceso ajeno, versiones y revocación de token en los manejadores. |
| Procedencia de datos | 6 | 7 | NULL, fechas imposibles y mezcla quedan pendientes. Persiste la aceptación de sufijos arbitrarios y un límite del evaluador directo. |
| Claridad del recorrido móvil | 8 | 7 | La nota de ejemplo se entiende mejor. El creador añade un panel extenso antes de los controles y acumula resultados debajo. |
| Honestidad del contenido | 9 | 9 | Se identifican datos ficticios y simulaciones. «Observados el» sigue atribuyendo una fecha común de forma demasiado amplia. |
| Solidez técnica | 7 | 7 | Catálogo y validación mejoran. Quedan un caso numérico reproducible, una caché incompleta y validaciones históricas parciales. |
| Calidad de las pruebas | 8 | 8 | Las aserciones endurecidas aportan valor. La geometría y los límites del redondeo necesitan casos más precisos. |

Las notas son un juicio de revisión sobre esta entrega, con alcance local. El descenso en claridad móvil corresponde al nuevo creador, no a la legibilidad de las dos notas de ejemplo.

## Evidencia y alcance de esta revisión

He leído las instrucciones entregadas, el código relevante, los documentos de R17 y las doce imágenes. La imagen 00 coincide con la referencia aprobada. Las 01–11 muestran la implementación.

Instalación con `npm ci`, Node 24.22.1. Repetí completas estas baterías sobre los archivos del ZIP.

| Batería | Correctas | Fallos |
|---|---:|---:|
| unit-procedencia17 | 13 | 0 |
| unit-guardada17 | 20 | 0 |
| unit-nota de R15 | 35 | 0 |
| unit-escenarios16 | 11 | 0 |
| unit-migracion de R8 | 14 | 0 |
| testP de R17, navegador | 28 | 0 |
| testO de R16 actualizado en R17, navegador | 18 | 0 |

Son **139 comprobaciones correctas de siete baterías completas**. Las 724 del informe recibido pertenecen a la ejecución local de Claude.

Los manejadores se ejecutan con Request/Response y SQLite real local. El guion `antes-despues-r17.mjs . DESPUES` dio la semilla 4,4, los cuatro estados esperados de procedencia y los rechazos de nota 10, versión foo, control bidi y referencia inexistente. El ZIP carece de historial Git, por lo que el comando de worktree propuesto no se puede ejecutar con esta entrega. Repetí la mitad DESPUES y consulté el registro entregado de ANTES. Esta revisión no autentica los hashes citados.

La descarga oficial de Chromium llegó truncada. Utilicé Chromium 153 de un paquete alternativo con Playwright 1.63.0 y un ajuste de entorno para que Wrangler enumerase loopback. El primer intento de navegador se cerró al crear otro contexto con el argumento single-process. Lo retiré. Otro intento tuvo errores de arranque de Workerd y un estado sin posiciones. La ejecución completa de P pasó tras un arranque limpio. O pasó sus 18 comprobaciones en una ejecución completa posterior. Un intento intermedio de O quedó interrumpido durante un reinicio del entorno de revisión. Estos intentos se excluyen del recuento de baterías completas y no establecen la causa de los fallos intermitentes anteriores.

### Casos propios adicionales

| Entrada o acción | Resultado observado | Interpretación |
|---|---|---|
| Semilla intacta, KO 60 / PG 40 | 4,4 | Conserva el caso de referencia. |
| Fecha de mercado KO = 2026-11-04 10:00:00 | Sintético, 4,4 | Acepta la marca temporal de SQLite. |
| Fecha de mercado KO = 2026-11-04basura | Sintético, 4,4 | Valida únicamente los diez primeros caracteres. |
| Fuente NULL solo en KO FY2020 | Incompleto, pendiente, identifica la fila | La reparación cubre un ejercicio antiguo. |
| Fuente vacía en fundamentales por SQL | CHECK de SQLite rechaza la escritura | El esquema limita las fuentes a NULL/sec/prueba/demo. |
| Fuente NULL de mercado en AAPL, fuera de la cartera | Incompleto, pendiente | La API protege el conjunto de comparación. |
| Fuente de mercado AAPL cambiada de prueba a demo | Sintético, 4,4 | El origen sigue siendo sintético y esa fila queda fuera de la fuente dominante. |
| Evaluador directo, fecha AAPL = ayer, conservando origen sintético | 4,4 | El módulo no revalida esa fila ajena a la cartera. |
| Evaluador directo, fundamentales sin fuente en todos los comparables ajenos | 4,4 | La verificación local solo recorre las posiciones. |
| Mismo objeto empresas, cambiar origen a real y habilitada a true tras evaluar como sintético | Conserva 126 empresas preparadas y 4,4 | La caché reutiliza comparables ficticios. Es un caso de módulo, con habilitación artificial. |
| Total 5,5 con bloques 5,44 / 5,44 / 5,47 / 5,44 / 5,44 | Validador acepta y POST devuelve 201 | La tolerancia admite un total imposible para esos intervalos de redondeo. |
| Referencia nueva con mayúsculas o espacios en los extremos | 400 en los tres casos | Identificador tratado de forma estricta. |
| estadoSeguimiento con historia «otra» y referencia hidrogeno-norte:1 | «responde» | La lectura usa la existencia del ID sin contrastar el par histórico. |
| limitacion.perdida heredada en objeto JS directo | Aceptada | Falta comprobar propiedad propia en ese nivel. JSON HTTP no transporta herencia. |

## Hallazgos por gravedad

### Críticos

No identifiqué un fallo crítico en los recorridos examinados. Esto describe el alcance de la revisión.

### Importantes

**I1. La nota guardada admite una décima que no puede proceder de los bloques.**

En `public/js/nota.js`, constante TOL_TOTAL y líneas 198–204, la tolerancia es 0,056. Con pesos 20/20/15/25/20 y bloques 5,44 / 5,44 / 5,47 / 5,44 / 5,44, la suma es 5,4445. Aun admitiendo ±0,005 por bloque, el extremo superior es menor que 5,4495. La nota 5,5 exige llegar a 5,45. He construido ese resumen con fortaleza tamaño, limitación deuda y pérdida 1,14. El POST devolvió **201**.

Arreglo requerido. Calcula los intervalos posibles de los valores anteriores al redondeo y comprueba que la nota final es compatible con ellos. Usa una representación decimal o tolerancia numérica pequeña y justificada para el cálculo informático. Define la precisión admitida de los bloques guardados. La compatibilidad con registros antiguos debe tratarse explícitamente. Añade el caso anterior, sus vecinos válidos y extremos 1/10 por POST y lectura de fila histórica. La coherencia aritmética sigue sin acreditar el origen de un cálculo remitido por el cliente.

**I2. La fecha admite cualquier sufijo tras un día válido.**

En `functions/api/universo.js`, clasificación y selección de fechas, y `public/js/nota.js`, fechaFila, se usa `slice(0,10)`. El SQL siguiente deja origen sintético y nota 4,4.

```sql
UPDATE mercado SET fecha='2026-11-04basura' WHERE ticker='KO';
```

La marca `2026-11-04 10:00:00` puede ser un formato admitido deliberadamente. Define los formatos aceptados según las columnas actuales y valida toda la cadena, incluido rango de hora y zona cuando proceda. Normaliza después. Prueba fecha sola, marca temporal SQLite, ISO si se admite, hora imposible y sufijo arbitrario. Comparte la misma función entre API y evaluador.

**I3. El creador móvil retrasa demasiado la edición y la revisión.**

Las capturas 02 y 03 miden 390 × 4709 y 320 × 5374 píxeles. Antes del primer activo editable aparecen el encabezado, los pasos, el nombre, la privacidad y el panel completo del anillo con seis filas de leyenda e hipótesis. En mi recorrido de navegador, con viewport de 780 px de alto, el primer deslizador apareció en y=1673 px a 390 de ancho y en y=1853 px a 320. El botón Revisar apareció en y=2385 y y=2641, respectivamente. Son mediciones de mi ejecución, con tipografías del entorno, y explican la distancia entre el inicio y el primer ajuste. El botón naranja de revisión llega tras las seis posiciones. Debajo se acumulan radiografía, ROIC, nota y gráficos.

En `public/style-r17.css`, línea 83, el orden coloca panel-donut antes de panel-pos. La adaptación respeta el color, pero el primer gesto útil queda demasiado abajo. En escritorio 1440 × 900, el botón principal tampoco entra en la captura inicial.

Arreglo requerido. En móvil muestra encabezado breve, estado compacto del reparto, posiciones y acción principal. Permite desplegar anillo completo, leyenda e hipótesis. Lleva la revisión al paso 3 con resultado primero. En escritorio conserva las dos columnas y facilita acceder a revisar mientras se ajustan posiciones. El estado compacto puede mostrar total asignado y saldo simulado. Comprueba la barra fija de guardado y su reserva de espacio con capturas de viewport en varios puntos de scroll. Las capturas largas aportadas muestran esa barra atravesando el panel y no bastan para decidir cómo se comporta durante el desplazamiento real.

**I4. Falta una garantía común del universo que alimenta los comparables.**

En `public/js/nota.js`, líneas 30–37 y 75–80, preparar usa todo el universo, mientras problemasProcedencia recorre solo las posiciones. El origen global enviado por la API protege la ruta habitual contra NULL ajenos a la cartera. El evaluador directo, compartido por demo y laboratorio, acepta comparables alterados si el objeto conserva origen sintético.

Además, CACHE depende solo de la referencia empresas, aunque preparar también depende del origen. Reutilizar el mismo empresas tras cambiar el origen conserva los ficticios preparados. Es un caso de módulo con habilitación artificial, no una activación real observada en la aplicación.

Arreglo requerido. Centraliza la validación de todas las filas que participan en cada población de comparación y documenta si el universo es inmutable. Asegura que la caché depende de todas las entradas relevantes o elimínala si su coste no está justificado. Prueba la ruta de API, la entrada directa, el cambio de origen con mismo objeto y una copia nueva. Mantén explícito el bloqueo de conjuntos incompletos o mixtos.

### Menores que deben quedar registrados

**M1. Par historia/referencia histórico incompleto.** `functions/api/escenarios/_comun.js`, línea 9, marca invalidez usando solo refExiste. `public/js/contenido.js`, líneas 111–115, devuelve la respuesta por ID antes de comprobar historia. POST y cambio a una referencia nueva sí comprueban el par. Usa refDeHistoria en lectura y seguimiento. Una fila antigua discordante debe mostrar vínculo inválido y permitir desvincularlo. Repite también el PATCH que conserva una referencia histórica discordante. La advertencia Jaccard ayuda a revisar un vínculo, pero su similitud de palabras no acredita equivalencia semántica.

**M2. Propiedades propias y texto.** En `nota.js`, línea 195, comprueba también que perdida sea propia. La aceptación de esa propiedad heredada la reproduje únicamente en JS directo. Los caracteres de ancho cero no están cubiertos por el filtro BIDI. Define un tratamiento selectivo y comprueba texto visible, preservando escritura legítima. La afirmación «propiedades propias» necesita ese matiz.

**M3. Fecha en la explicación.** `nota-ui.js`, línea 37, mantiene «fundamentales observados el 4 nov 2026». La API usa la fecha máxima de mercado como instantánea y los ejercicios llegan hasta FY2024. Sustituye por «Instantánea del 4 nov 2026; ejercicios hasta FY2024» y ofrece las fechas efectivas por dato en el detalle.

**M4. Título del ejemplo bancario.** «Ejemplo con datos incompletos» sigue presentando como falta de datos lo que el cuerpo explica como límite del método. Usa «Ejemplo con evaluación parcial». Conserva la explicación sobre banca que ya funciona.

**M5. Cascada CSS.** `html:root:root:root`, tres hojas sucesivas y reglas sobrescritas dificultan la verificación. La pequeña cantidad de !important en R17 no demuestra por sí sola un defecto. Al corregir el creador, consolida sus reglas activas y elimina las anuladas, incluyendo el estado de res-breve. Verifica ambos esquemas de color y foco. La barra lateral fija de escritorio es compatible con el diseño si reserva espacio y permite desplazarse en ventanas bajas.

## Cinco cambios visuales de mayor impacto para R18

1. **Acerca la primera edición al inicio en móvil.** Estado compacto arriba, campos inmediatamente después. En 390 × 780 con la plantilla de seis activos debe aparecer al menos el primer campo de peso en el primer viewport, usando tamaños de texto legibles.
2. **Haz que los tres pasos organicen el contenido.** Distribución centra los controles. Revisión abre el resumen, la nota o su causa y el guardado. Volver conserva cada peso. Comprueba que la navegación entre pasos y el foco siguen el mismo orden.
3. **Refina la columna de activos de escritorio.** Da prioridad a ticker/nombre, porcentaje y deslizador. Lleva categoría ampliada y ROIC al detalle de la posición. Usa pistas finas y manejadores discretos con área táctil de 44 px. Conserva etiquetas y campos numéricos.
4. **Recupera las proporciones de la referencia.** Amplía la presencia del anillo respecto a su panel, alinea sus importes y evita el nombre truncado sin una vía clara para leerlo completo. Ajusta el título y los márgenes para que haya una sola jerarquía fuerte. Mantén el fondo carbón y cobre aprobado, la serif en el encabezado y las cifras tabulares en controles.
5. **Pon el resultado antes de la explicación larga.** En las capturas 04–07 la tarjeta ya está antes de los botones, pero el aviso ocupa el primer bloque. Presenta cifra o pendiente, motivo específico, una fortaleza, una limitación e instantánea. Conserva una advertencia breve visible y reúne la explicación extensa en «Cómo se calcula».

La Revista ocupa correctamente una entrada secundaria. Su acceso puede nombrar de forma directa «El Superespeculador» en la acción de opinión, manteniendo fecha y carácter ficticio. El contenido existente incluye firma, hipótesis y revisión. La captura 08 permite inspeccionar una respuesta y una pregunta pendiente, pero no muestra en ese viewport la reformulación junto al original. Aporta esa pareja en la próxima evidencia del Cuaderno.

### Tres cosas que quitaría del primer nivel

- La leyenda completa y la hipótesis desplegadas antes de editar pesos en móvil.
- El ROIC y la categoría extensa como columnas obligatorias del editor.
- La repetición de explicaciones técnicas y avisos largos antes del resultado.

Conserva el acceso al detalle en su contexto y las advertencias necesarias junto a las simulaciones.

## Pruebas y afirmaciones de la entrega

Las adaptaciones de navegación, títulos y pasos corresponden al rediseño. I3 sustituye una barra estática por un control cuyo valor se compara con el peso, manteniendo verificaciones táctiles y de desbordamiento. I2 conserva la acción principal y la jerarquía frente a ROIC.

H1/H2 asignan cabBottom = 0 cuando la cabecera es fija. Esto sirve para la barra lateral actual, pero liga la condición a position:fixed en vez de a su geometría. Comprueba ocupación real de pantalla y solapes. P6 cuenta botones según un color de fondo exactamente igual al acento. Esa prueba puede pasar si aparece otra acción dominante con un tono ligeramente distinto. Conserva la inspección visual y comprueba qué acciones están visibles y habilitadas en cada estado.

P1 espera cualquier li de la leyenda. El estado vacío también contiene un li. En un intento con fallos del servidor llegó hasta la aserción con «sin posiciones». Espera respuesta válida del universo y las seis posiciones concretas. Mantén el fallo como fallo, registrando consola y respuestas. Sustituye pausas arbitrarias por estados observables en las zonas que presenten intermitencias.

El cambio de font-size al 200 % verifica una aproximación útil. Se mantienen pendientes el zoom real, la ampliación de texto del sistema y los lectores. El anillo con nombre, aria-valuetext, aria-current, aria-live y aria-pressed están contemplados en las pruebas y el código. Esto no acredita que la secuencia completa sea cómoda con VoiceOver o TalkBack. Revisa también el orden DOM cuando CSS cambia el orden visual.

Seis repeticiones correctas de E/F indican que esas ejecuciones pasaron. Su causa histórica permanece abierta. Añade latencia determinista a las respuestas que reconstruyen cartera y sesión, registra orden de navegación, respuesta y estado esperado, y reproduce con y sin borrador. La demo concatenada es aceptable provisionalmente si reconstruirla es reproducible y una prueba compara las mismas entradas/salidas con el módulo compartido.

Ajusta estas afirmaciones del informe siguiente.

| Afirmación | Redacción que respalda la evidencia |
|---|---|
| Cada fila usada se verifica | La API comprueba filas de acciones del conjunto; el módulo directo necesita cubrir también comparables. |
| Fecha real | Se comprueba el día inicial; la validación completa queda pendiente hasta corregir I2. |
| Nota coherente | Se detectan grandes incoherencias; el caso límite de I1 sigue aceptándose. |
| Propiedades propias | Se comprueban campos principales y bloques; perdida requiere comprobación adicional. |
| HTML visible desde SQLite | Se genera y examina texto HTML. El comportamiento del DOM se acredita aparte con navegador. |
| Diseño aprobado aplicado | Paleta y tipografía aplicadas; la aceptación del recorrido móvil sigue pendiente. |
| Sin intermitencias | Seis ejecuciones E/F correctas en el entorno del autor; causa anterior abierta. |

## Encargo completo para Claude · ronda 18

Trabaja sobre la entrega R17. El objetivo de producto sigue siendo crear, entender y seguir portafolios simulados. Usa como referencia la imagen 00 entregada con R17 y las decisiones de este documento.

**Orden de trabajo**

1. Cierra I1 e I2 con pruebas de los contraejemplos exactos por API y módulo. Mantén 4,4 para KO + PG y evaluación parcial para KO + JPM.
2. Cierra I4, M1 y M2 con casos de comparables, caché y filas históricas. Conserva aislamiento de cuentas y control concurrente.
3. Reorganiza creador y revisión conforme a los cinco cambios visuales. Mantén todos los pesos al navegar, abrir detalle, volver y guardar. Revisa los estados invitado, borrador, cuenta sin cambios y cuenta con cambios.
4. Corrige fechas y título del caso bancario. Refina la entrada editorial y aporta el original/reformulación juntos en Cuaderno.
5. Ejecuta las suites pertinentes tras las reparaciones, las regresiones del creador y una pasada completa al cerrar. Registra primer fallo, corrección y última ejecución. Conserva los pendientes manuales.

**Criterios de aceptación**

- El resumen de I1 recibe 400 al guardarse y una fila histórica equivalente se identifica como inválida. Los redondeos legítimos siguen aceptándose.
- El sufijo basura y horas imposibles quedan pendientes. Fecha sola y formatos temporales expresamente admitidos funcionan.
- Los comparables usados cumplen procedencia. Cambiar origen con el mismo objeto no reutiliza una población incorrecta.
- Toda referencia histórica se valida como par. Desvincular una pregunta respondida elimina su asociación editorial, conserva el texto personal y respeta el control de revisión.
- A 320 y 390 px, editar y revisar forman un recorrido corto. El primer campo aparece en el viewport inicial de 390 × 780 con la plantilla acordada. La acción de continuar está accesible y ninguna barra tapa controles enfocados.
- El paso 3 muestra el resultado y su motivo antes de detalles técnicos. Volver a distribución conserva valores e identifica el paso correcto.
- Capturas a 1440 × 900, 390 × 780 y 320 × 780 incluyen inicio, distribución, revisión y guardado, con imágenes de viewport además de página completa. Presenta referencia y resultado en tamaño comparable.
- Pruebas de teclado, lector pendiente identificado, texto ampliado y navegación conservan foco y estado.

**Entrega**

Un ZIP de código con instrucciones reproducibles, un ZIP de capturas ordenadas y un archivo de instrucciones para esta revisión. Incluye semillas mínimas, entrada y respuesta de los casos propios, registro de pruebas y lista de cambios. Si citas commits para comparar versiones, aporta historial utilizable o dos árboles identificados. Diferencia el número de aserciones del número de entradas agrupadas bajo cada aserción.

**Trabajo de ChatGPT al recibir R18**

Repetir contraejemplos y baterías afectadas, comprobar la aplicación visual frente a 00, recorrer invitado/borrador/cuenta y validar que la nueva jerarquía conserva las funciones. Emitir aceptación técnica y visual por separado, con evidencias y pendientes concretos.

## Verificación manual que sigue pendiente

Mantén M1–M79. Prioriza M73–M76 para pulgar, ampliación real, lector, contraste y foco. Esta revisión aporta una comparación visual a M77 con cambios pendientes. M78 requiere D1 de prueba remota con copia y restauración verificadas. M79 requiere cinco principiantes y un registro de comprensión, especialmente del reparto, de la nota y de la simulación.

Antes de abrir cuentas a terceros siguen priorizadas M50–M57 y M60. Antes de contenido real, M58, M64 y M71. Permanecen sin comprobar dispositivos físicos, Safari/Firefox, correo real, carga SEC real, migraciones D1 remotas y datos reales. La demo pierde cambios al recargar. La tarea de regresar otro día debe probarse en el servidor con persistencia.



## C16 · Ronda 19 (2026-11-05) — revisión de la ronda 18 y encargo, literal

# Klever · Revisión de la ronda 18 y encargo de la ronda 19

Revisión independiente · 5 de noviembre de 2026

## Dictamen

La ronda 18 mejora de forma importante el creador: separar Distribución y Revisión permite empezar a editar sin atravesar un anillo, una leyenda y explicaciones largas. La dirección visual se conserva: fondo oscuro cálido, acento naranja/cobre, títulos con serif y controles más sobrios. No propongo otro rediseño.

La reparación técnica supera las 111 comprobaciones de módulo/servidor que he repetido. Los contraejemplos concretos de la ronda 17 están cubiertos. Quedan un borde aritmético, una deficiencia visible en la revisión de 320 px y una explicación poco útil cuando la propia plantilla incluye ETF. La ronda 19 debe cerrar esos puntos y preparar una prueba de uso honesta; no añadir otra gran funcionalidad.

Esta revisión corresponde al ZIP `klever_ronda18.zip`. El identificador de commit `3ae4183` y el total de 774 comprobaciones proceden del informe del autor; no son una certificación independiente de toda esa ejecución.

## 1. Alcance y evidencia

| Comprobación repetida | Resultado propio |
|---|---:|
| `tests/ronda18/unit-integridad18.mjs` | 18 correctas |
| `tests/ronda17/unit-procedencia17.mjs` | 13 correctas |
| `tests/ronda17/unit-guardada17.mjs` | 20 correctas |
| `tests/ronda15/unit-nota.mjs` | 35 correctas |
| `tests/ronda16/unit-escenarios16.mjs` | 11 correctas |
| `tests/ronda8/unit-migracion.mjs` | 14 correctas |
| **Total de estas seis baterías** | **111 correctas, 0 fallos** |

También ejecuté un contraejemplo adicional, fuera de esas baterías: el validador lo admite y el manejador POST con SQLite devuelve 201. Se explica en el apartado 3.

Intenté repetir Q, P, O y la paridad de demo. Chromium abortó al arrancar con `socket() failed: Operation not permitted`. Por tanto, esas baterías de navegador **no quedan verificadas por mí**. La reconstrucción de demo PD1 sí informó OK antes del aborto; eso no demuestra la paridad visual ni funcional completa.

La revisión visual se basa en las capturas aportadas, no en una sesión interactiva propia. Inspeccioné Distribución a 1440, 390 y 320 px; Revisión a 390 y 320; Guardado a 390; y Cuaderno a 390. La inspección permite señalar problemas visibles, pero no certificar interacción, accesibilidad o comportamiento en dispositivos físicos.

## 2. Qué conservar y qué considero resuelto

| Área | Valoración |
|---|---|
| Portafolios como centro | Mantener. Revista y El Superespeculador siguen siendo apoyos secundarios. |
| Fondo, tipografía y composición | Mantener la dirección actual. Los ajustes pendientes son de jerarquía y espacio útil. |
| Distribución móvil | Mejora clara: primer campo, deslizador y Revisar visibles a 320 y 390 px en las capturas. |
| Revisión con nota disponible | La captura de guardado a 390 presenta 4,4, interpretación, fortaleza y limitación de forma comprensible. |
| Fecha con sufijo | El caso exacto de R17 y las horas imposibles quedan cubiertos por las pruebas repetidas. |
| Procedencia y comparables | Las pruebas cubren comparables ajenos a la cartera y el cambio de origen con la misma referencia del universo. |
| Historia/referencia, propiedad propia y texto invisible | Las correcciones pasan en la batería de integridad. |
| Fecha de instantánea y ejemplo bancario | Mejor formulación y pruebas aprobadas. |
| Red lenta y demo | Correcciones plausibles y documentadas; falta mi repetición en navegador. No afirmar que cada intermitencia histórica tenga la misma causa. |

No reabrir estas decisiones sin una regresión reproducible. Mantener explícita la naturaleza ficticia de los datos actuales y la diferencia entre una evaluación coherente y una evaluación acreditada por el servidor.

## 3. Hallazgo técnico: queda una frontera de redondeo

**Prioridad: media; corrección pequeña y acotada.** No invalida el avance general ni demuestra pérdida de datos.

En `public/js/nota.js`, el contraste de intervalos usa:

```js
S4 + 50 >= n10 * 1000 - 500 && S4 - 50 < n10 * 1000 + 500
```

El límite superior de los valores compatibles con un redondeo decimal a centésimas es abierto. La igualdad del primer término admite un contacto entre intervalos que, con ese contrato decimal, no contiene ningún valor válido.

Contraejemplo reproducido:

```json
{
  "version": "estructura-v1",
  "fecha": "2026-11-04",
  "publicada": true,
  "nota": 5.5,
  "motivo": null,
  "cobertura": 100,
  "bloques": {
    "empresas": 5.44,
    "sectores": 5.44,
    "tamano": 5.44,
    "deuda": 5.46,
    "rentabilidad": 5.44
  },
  "fortaleza": "deuda",
  "limitacion": { "bloque": "deuda", "perdida": 1.135 }
}
```

Con pesos 20/20/15/25/20, la suma de los bloques mostrados es 5,445. Su intervalo decimal agregado tiene extremo superior 5,450 **excluido**; la nota 5,5 necesita alcanzar 5,450. Resultado observado: `validarResumen(..., {guardar:true}).ok === true`; el POST de escenario con este resumen como `antes` y un resumen pendiente válido como `despues` devuelve **201**.

Para reproducir el POST se puede reutilizar `montar`, `post` y `guardar` de `unit-integridad18.mjs`, sustituyendo solamente el resumen por el anterior. El caso original de R17, cuya suma era 5,4445, sí queda rechazado ahora: este es un vecino distinto.

**Encargo:** definir explícitamente la regla de redondeo y sus extremos; corregir el contacto de intervalos y el comentario que lo presenta como cerrado. No cambiar una desigualdad a ciegas: contrastar también las salidas reales del evaluador, porque los números binarios de JavaScript pueden introducir diferencias en empates. Añadir frontera, vecinos a ambos lados, extremos 1/10, lectura histórica y resúmenes legítimos producidos por el módulo. Si el contrato pretende tolerar un empate binario, documentarlo y demostrarlo con un caso generado por el evaluador; no llamarlo compatibilidad decimal exacta.

No recalcular silenciosamente notas históricas. Mantener el tratamiento explícito de evaluación inválida cuando corresponda.

## 4. Hallazgo de uso: a 320 px no basta con que entre el panel

**Prioridad: alta para aceptar el recorrido móvil.**

En `Q3-revision-320-viewport.png`, la cabecera, los pasos y el resumen del portafolio ocupan gran parte de la pantalla. El bloque de Revisión comienza aproximadamente en y=561; el aviso de nota pendiente empieza alrededor de y=676; la barra fija empieza alrededor de y=708. Apenas se ve el inicio del resultado antes de quedar oculto por la barra. Además, el paso activo aparece como un «3» naranja sin su etiqueta visible.

En cambio, a 390 px la captura sí empieza directamente en la nota. Hace falta resolver esa diferencia, no declarar que todo el móvil falla.

La prueba Q3 comprueba `top(notaPanel) < innerHeight`. Eso permite aprobar un contenedor cuyo resultado útil está por debajo o tapado. La captura demuestra que ese criterio es insuficiente.

**Encargo:** al entrar en Revisión, situar dentro de la zona visible útil el estado o cifra y una explicación breve. Mantener Volver accesible y el foco coherente. Revisar el desplazamiento programado, su momento respecto al renderizado y la altura real de la barra inferior. No atribuir la causa a la animación sin reproducirla.

En pantallas estrechas, mostrar por ejemplo «Paso 3 de 3 · Revisión», o una variante que conserve la etiqueta activa sin recorte. Evitar resolverlo reduciendo excesivamente el texto.

**Aceptación:** a 320×780 y 390×780, después de pulsar Revisar, el rectángulo completo del resultado breve debe quedar entre la parte superior útil y el inicio de la barra fija. El test debe medir el resultado, no solamente su panel. Repetir con nota disponible y sin nota, movimiento reducido activado/desactivado y navegación por teclado. Guardar capturas estables después de la transición, sin desplazamiento manual para preparar la evidencia.

## 5. Hallazgo de producto: una plantilla con ETF necesita una revisión útil

**Prioridad: alta para comprensión; sin ampliar ahora la metodología financiera.**

La plantilla de dividendos incluye SCHD al 17 % y VYM al 16,6 %. En la captura de 390 px, la revisión dedica un gran bloque ámbar a enumerar los cinco componentes de la nota y repetir la misma limitación para ambos ETF. El mensaje empieza por «Faltan datos», aunque también existe una limitación del método. La persona puede interpretar que debe esperar, o que ha construido mal su cartera.

La consecuencia práctica es que una de las primeras experiencias del producto termina en un aviso largo. No se arregla publicando una nota ficticia ni quitando los ETF para mejorar una puntuación.

**Encargo:** separar tres motivos: datos ausentes o inválidos, instrumento sin método aplicable y cobertura insuficiente para publicar la nota global. Conservar el detalle técnico desplegable y mostrar primero una explicación breve y específica.

Texto orientativo para esta plantilla:

> Esta cartera no tiene nota global. Los ETF representan el 33,6 % y el método actual no evalúa su composición. Puedes revisar el reparto y la concentración por posición; el detalle explica los límites del análisis.

Adaptar el texto a los datos reales del caso. No convertir automáticamente el 66,4 % restante en «cobertura evaluada» si otros indicadores también tienen carencias.

Mostrar el valor que sí existe: asignación total, número de posiciones, peso máximo y reparto por instrumento. Distinguir concentración por posición de exposición subyacente: dos ETF no equivalen a dos empresas y no permiten inferir diversificación sectorial sin conocer su composición.

**Aceptación:** probar la plantilla mixta actual, una cartera solo de acciones evaluables, una con datos inválidos y una solo de ETF. Cada caso debe explicar su causa sin repetir párrafos por activo; detalles y fuentes permanecen disponibles. Ningún cambio de interfaz debe modificar las posiciones o los pesos.

## 6. Encargo completo para Claude · Ronda 19

Trabaja sobre R18. El objetivo es terminar una versión más comprensible y verificable, conservando lo que ya funciona.

1. **Cerrar la frontera de redondeo.** Entregar el caso exacto anterior, resultado antes/después y pruebas de compatibilidad. Cambio aislado y fácil de revisar.
2. **Corregir la revisión a 320 px y la etiqueta del paso.** Usar geometría de la zona libre y el elemento útil; conservar foco, pesos y navegación de vuelta. Mantener fondo, paleta y tipografía aprobados.
3. **Reescribir la revisión sin nota.** Resumen útil, causa específica y detalle desplegable. La plantilla con ETF debe servir para aprender y revisar aunque no tenga nota global.
4. **Cerrar la evidencia de regresión.** Ejecutar las baterías afectadas de módulo y navegador, Q/P/O y paridad de demo; repetir los recorridos afectados por las dos carreras con latencia 0/300 ms. Conservar logs de intentos fallidos y exitosos. No reemplazar aserciones exigentes por comprobaciones de mera existencia.
5. **Preparar la prueba de uso.** Mantener el guion de cinco principiantes, añadiendo la interpretación de una cartera con ETF y la distinción entre datos ficticios, evaluación parcial y nota global. No dar por hecha la prueba ni simular respuestas. La tarea de cerrar y volver exige persistencia verificada; la demo que pierde datos al recargar no sirve para certificarla.
6. **Entregar una ronda auditable.** ZIP, instrucciones únicas para abrirla, antes/después breve, resultados exactos por entorno y capturas de viewport. Enumerar lo pendiente sin mezclarlo con lo aprobado.

### Entregables mínimos

- Código y pruebas de los tres cambios principales, separados de refactorizaciones no necesarias.
- `ronda19/LEEME.md`: versión revisada, cambios, instrucciones y limitaciones.
- `ronda19/ANTES-Y-DESPUES.md`: contraejemplo de redondeo, resultado útil a 320 y mensaje de ETF.
- Logs íntegros de las pruebas ejecutadas, con comando, entorno, resultado y salida de error cuando exista.
- Capturas de Distribución y Revisión a 1440×900, 390×780 y 320×780. Para móvil, variantes con nota y sin nota; no sustituir viewport por página completa.
- Registro de prueba con personas marcado «pendiente» si no se ha realizado.

### Fuera de esta ronda

No cambiar la identidad visual, añadir otro tema, transformar la portada en una revista, rehacer todo el CSS, ampliar instrumentos evaluables, incorporar datos reales de mercado, añadir pagos o presentar recomendaciones de compra/venta. No sustituir la cartera por un asistente conversacional. No desplegar ni enviar comunicaciones como parte de este encargo.

Mantener creador, edición, revisión, guardado, escenarios y Cuaderno como recorrido principal; Revista y El Superespeculador como contenido conectado a ese recorrido. El contenido debe facilitar entender y contrastar una idea, sin sugerir que una opinión mejora automáticamente la cartera.

## 7. Mi siguiente revisión

Cuando llegue R19, repetiré las pruebas relevantes y el contraejemplo nuevo; comprobaré las regresiones que afecten al guardado y las evaluaciones históricas. Intentaré ejecutar el recorrido real en navegador y separaré cualquier limitación del entorno de un fallo del código.

Revisaré especialmente que a 320 px se pueda leer el resultado sin quedar tapado, que Volver conserve el trabajo y que la plantilla con ETF dé una explicación útil. Contrastaré los logs y capturas sin convertir los resultados declarados por Claude en pruebas propias.

La siguiente decisión de producto debe apoyarse en observar a personas construir, revisar y recuperar una cartera. La disposición a pagar y el retorno semanal siguen siendo hipótesis: las pruebas técnicas y el acabado visual, por sí solos, no las validan.

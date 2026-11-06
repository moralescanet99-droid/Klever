# Ronda 5: cerrar los problemas concretos de la ronda 4

> **Nota (ronda 7):** las capturas citadas en este informe **no están en el repositorio** (se regeneran con las baterías; las de la ronda 6 se entregaron en un zip). Ver `ronda7/EVIDENCIAS.md`. Además, desde la ronda 7 el servidor exige la `revision` para guardar: las pruebas de esta ronda se ejecutaron con el servidor de entonces (anterior a la ronda 7).

Se conservan la estructura, la paleta, la portada compacta, las posiciones móviles y la tabla de escritorio. No se ha rediseñado nada: solo se cierran los puntos pedidos.

> Este informe se genera con `tests/ronda5/informe.py` a partir de lo **observado** en una ejecución limpia de las cuatro baterías (`tests/ronda5/run-all.sh`). Las filas de la tabla de evidencias salen de `ronda5/evidencias-D.json`, no están escritas a mano.

## Qué se ha cambiado, punto por punto

**1. «Mis carteras»: las existentes primero.** La lista de carteras guardadas va primero; cada una muestra nombre, privada o pública, número de posiciones, total asignado y fecha. El formulario solo se abre con el botón «Nueva cartera» (y toma el foco). Si no hay ninguna cartera, crear es la acción principal: formulario abierto con «Crea tu primera cartera», sin botón «Nueva cartera» ni «Cancelar». *Fechas:* se añadió el campo real `actualizado_en` (migración `0006`), vacío hasta la primera modificación. Una cartera nunca modificada muestra «Creada el …» (dato real) y no «Modificada»; ninguna fecha se inventa. Una cartera con cambios sin guardar en este dispositivo lo indica con una etiqueta.

**2. Bloqueo visual de Guardar y Publicar.** La lógica ya impedía publicar a 103 %, pero **solo el botón primario tenía estilo de desactivado**: «Publicar cartera» (secundario) se veía igual que activo. Ahora todo botón desactivado lo muestra (borde discontinuo y texto atenuado) y **el motivo va pegado al botón**, en escritorio y en la barra inferior móvil. Las reglas se mantienen en interfaz y servidor:
- más del 100 %: no se guarda en la cuenta ni se publica; el borrador se conserva en el dispositivo;
- menos del 100 %: se guarda en privado como reparto incompleto, sin efectivo implícito;
- publicar exige el 100 %, al menos una posición y tesis.

*Cartera pública con una edición temporalmente inválida:* no modifica la versión publicada, y **no hace falta despublicar** para corregirla. La versión publicada es la última guardada válida; los cambios sin guardar se conservan en el dispositivo (también tras recargar) y, cuando el reparto vuelve a sumar 100 %, se guarda y la versión pública se actualiza. Dejar de publicar sigue siendo la vía para guardar un reparto incompleto.

**3. Estado de guardado sin depender del ⓘ.** Tres planos separados: *privacidad* (chip Privada/Pública), *validez del reparto* (resumen y motivo junto a la acción) y *persistencia* (texto explícito: «Guardada en tu cuenta», «Solo en este dispositivo», «Cambios sin guardar en tu cuenta», «No se pudo guardar»). Un error de asignación **no oculta** la persistencia: se lee «Cambios sin guardar en tu cuenta · copia en este dispositivo» junto al motivo del bloqueo. El ⓘ solo amplía. La confirmación flotante es «Cartera guardada», aparece arriba y no tapa campos editables. «Borrador» queda únicamente para lo que aún no está en la cuenta. *Se añadió* la copia local de los cambios sin guardar de las carteras de la cuenta (antes se perdían al recargar), con aviso de recuperación, conflicto entre dispositivos y «Descartar cambios sin guardar…».

**4. Resumen simplificado.** Visible: «Asignado: X %» (sin «100,0 % ✓ 100 % asignado»), la diferencia («Pendiente de asignar» / «Exceso de asignación») en una línea aparte y a tamaño normal, número de posiciones, ROIC medio de empresas con datos, cobertura y «No representa la rentabilidad de tu cartera». La fórmula, la media ponderada y las definiciones van al desplegable. «Sin dato: 2 fondos (no aplicable)» se sustituye por dos líneas distintas: **«Dato ausente (no disponible)»** y **«No aplicable»**. Categorías: nota breve «Los ETF se agrupan por tipo; no se desglosan sus empresas» y desarrollo en un desplegable.

**5. Explorar empresas en móvil.** Dos líneas por empresa: nombre y resultado; símbolo, sector y «Ver ficha» (con crecimiento para nombres y sectores largos). Buscador justo bajo el título, introducción de una frase y un único desplegable con metodología, significado de cada comprobación y orden. Un dato ausente se muestra en neutro como «no disponible», nunca como comprobación fallida. La tabla de escritorio no cambia.

**6. Ficha.** Cifra y unidad separadas («29,6» y debajo «miles de millones de USD») y la regla del criterio conserva al menos la mitad del ancho. El desplazamiento horizontal de la tabla histórica y la columna fija del año se han verificado de verdad (scroll con teclado), no solo la presencia de la instrucción. La portada no se ha tocado.

## Hallazgos de las propias pruebas (corregidos en esta ronda)
- A texto ampliado al 200 %, el panel «Publicación» plegado desbordaba la página (416 px sobre 390): su cabecera no podía partirse en dos líneas.
- El servidor no devolvía la marca de versión tras guardar: una copia local legítima se interpretaba como «cambios de otra sesión».
- En la ficha, la unidad larga dejaba la regla del criterio con el 46 % del ancho (ahora ≥ 50 %).
- En «Mis carteras» una regla antigua de la lista pisaba la nueva disposición y la tarjeta se desbordaba.

## Pruebas

**Automáticas (navegador automático Chromium, servidor local con base simulada y datos inventados):** 161 comprobaciones correctas y 0 fallos en la ejecución final limpia: batería A 31 (validaciones, estados y resumen), B 51 (móvil, orden, empresas, ficha y portada), C 50 (recorrido, otro navegador, errores, teclado, anchuras de 320 a 1440 px en ambos temas) y D 29 (los escenarios de la tabla siguiente). Estos totales **no sustituyen** a la tabla: lo que importa es lo observado en cada escenario.

**Tabla de escenarios** (evidencia = captura en `ronda5/evidencias/`, que se entrega en el zip, o «ver baterías» cuando el resultado se comprueba por texto y valores):

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| E2 | Mis carteras sin carteras | La creación es la acción principal (formulario abierto, sin botón «Nueva cartera») | título «Crea tu primera cartera»; formulario visible=true; botón «Nueva cartera» visible=false; botón primario «Crear cartera» | E2-mis-carteras-vacia-390.png | ✅ |
| E1 | Mis carteras con carteras | Las carteras guardadas primero; «Nueva cartera» como botón; formulario cerrado | items=2; formulario oculto=true; botón «Nueva cartera» visible=true; la lista aparece por encima del formulario | E1-mis-carteras-390.png | ✅ |
| E1b | Abrir «Nueva cartera» | El formulario solo se abre al pulsar el botón y toma el foco | formulario visible=true; foco en «nueva-nombre»; aria-expanded=true | ver baterías | ✅ |
| E3 | Datos de cada cartera | Nombre, privada/pública, posiciones, total asignado y última modificación SOLO si existe | «Con posiciones y un nombre largo para comprobar el ajuste en pantallas pequeñasPrivada 2 posiciones · Asignado: 88 % (incompleta)Modificada el 3 nov 2026 Abrir Solo creadaPrivada Sin posicionesCreada el 3 nov 2026 Abrir» | E1-mis-carteras-390.png | ✅ |
| E3b | Fechas no inventadas | Una cartera nunca modificada muestra «Creada el», no «Modificada» | actualizado_en de «Solo creada» = null; texto: Creada el 3 nov 2026 | ver baterías | ✅ |
| E4a | Cartera privada al 88 % | Se guarda en privado como reparto incompleto; NO se publica (interfaz y servidor); sin efectivo implícito | Pendiente de asignar: 12 %; Guardar activo=true; Publicar activo=false; motivo: «No disponible: Pendiente de asignar: 12 %. Una cartera pública debe tener el 100 % asignado.»; guardado=Guardada en tu cuenta; servidor al publicar: HTTP 400 «Para publicar, la cartera debe tener el 100 % asignado (ahora tiene 88 %).» | E4-88-escritorio.png | ✅ |
| E4b | Cartera privada al 100 % | Se guarda y puede publicarse (con tesis) | Asignado: 100 %; Publicar activo=true; Guardada en tu cuenta | E4-100-escritorio.png | ✅ |
| E4c | Cartera privada al 103 % | No se guarda ni se publica; motivo junto a cada acción; cambios conservados en el dispositivo | Guardar desactivado=true; Publicar desactivado=true; Exceso de asignación: 3 %. Reduce algún peso para guardar.; publicar: «No disponible: Exceso de asignación: 3 %. Reduce algún peso para poder publicar.»; servidor PUT 103 %: HTTP 400; copia local=true | E4-103-escritorio.png | ✅ |
| E5 | Publicar desactivado se ve como Guardar desactivado | Mismo tratamiento visual y motivo pegado a cada botón | color Guardar rgb(74, 88, 109) / Publicar rgb(74, 88, 109); cursor not-allowed / not-allowed; borde Guardar solid / Publicar dashed; motivo junto a Publicar=true; motivo junto a Guardar=true | E4-103-escritorio.png | ✅ |
| E7 | Con error de asignación, la persistencia sigue visible | Texto explícito de persistencia + motivo del bloqueo + privacidad, por separado | persistencia «Cambios sin guardar en tu cuenta · copia en este dispositivo»; validez «Exceso de asignación: 3 %. Reduce algún peso para guardar.»; privacidad «Privada»; el ⓘ solo amplía | E4-103-escritorio.png | ✅ |
| E8 | Aviso flotante y vocabulario | El aviso dice «Cartera guardada», no tapa campos editables y no se llama «borrador» a una cartera guardada | aviso «Cartera guardada»; solapa campos=false; aparece «borrador» en el editor de una cartera guardada=false | ver baterías | ✅ |
| E7b | Guardada | Texto «Guardada en tu cuenta» | Guardada en tu cuenta | ver baterías | ✅ |
| E6 | Edición inválida de una cartera pública | La versión publicada no cambia mientras el borrador es inválido; se recupera tras recargar; al ser válido de nuevo se guarda sin despublicar | publicada antes «SCHD:17,JNJ:16.6,KO:16.6,PG:16.6,VYM:16.6,XOM:16.6»; durante la edición (108 %) «SCHD:17,JNJ:16.6,KO:16.6,PG:16.6,VYM:16.6,XOM:16.6» (igual=true); Guardar desactivado=true; chip=Pública; copia local=true; servidor PUT incompleto: HTTP 400; tras recargar sigue «SCHD:17,JNJ:16.6,KO:16.6,PG:16.6,VYM:16.6,XOM:16.6» con el valor recuperado 25,0; al corregir, Guardar activo=true; versión publicada final «SCHD:18,KO:16.6,PG:16.6,VYM:16.6,XOM:16.6,JNJ:15.6» (cambió=true); chip final=Pública | E6-publica-invalida-escritorio.png | ✅ |
| E12 | Guardado fallido y recuperación | Se muestra «No se pudo guardar», sin confirmar; los cambios siguen en pantalla y en el dispositivo; al reintentar se guarda | tras fallar: «No se pudo guardar. Tus cambios siguen en este dispositivo» / barra «No se pudo guardar»; confirmación flotante=0; valores conservados 30,0 y 20,0; tras reintentar: «Guardada en tu cuenta» | E12-fallo-390.png | ✅ |
| E14 | Regreso desde «Mis carteras» | Se abre la versión guardada con sus pesos y «Guardada en tu cuenta» | pesos 30,0 y 20,0; estado «Guardada en tu cuenta»; hash #cartera-7 | ver baterías | ✅ |
| E15 | Teclado móvil abierto al editar la última posición (EMULADO: ventana de 390×420) | El campo queda visible, por encima de la barra, y acepta el valor | campo 144–188 px; barra desde 348; ventana 420; valor 12,5 | E15-teclado-emulado-390x420.png | ✅ |
| E13b | Acceso por email en OTRO navegador | Se entra, pero NO se guarda el borrador y se avisa sin prometerlo | aviso previo: «Sobre tu borrador: se guardará en tu cuenta solo si abres el enlace en este mismo dispositivo y navegador. Si lo abres e…»; aviso al entrar: «Has entrado en tu cuenta, pero el borrador que pediste guardar no estaba en este dispositivo y no se ha guardado. Sigue en el dispositivo donde lo creaste.»; borrador en el otro navegador=null; borrador original sigue en el primero (peso 16); carteras creadas=0 | E13-otro-navegador.png | ✅ |
| E13a | Acceso por email en el MISMO navegador | El borrador pasa a la cuenta con sus pesos y se borra del dispositivo | hash #cartera-8; pesos 16,6 16,6 16,6 16,6 16,6 16,0 (el editado es 16,0); borrador local=null; estado «Guardada en tu cuenta» | ver baterías | ✅ |
| E9a | Exceso de asignación a 360 px | Se lee bien sin reducir la letra; sin desbordamiento; barra ≤ 88 px | página 360/360 px; texto del exceso a 16px; barra 72 px; resumen «⚠ Exceso de asignación: 13 %»; barra «⚠ Asignado: 113 %» · «⚠ Exceso: 13 %»; contenido de la barra fuera de pantalla=false | E9-exceso-360.png | ✅ |
| E9b | Etiquetas del resumen | «Asignado: 100 %» sin «100,0 % ✓ 100 % asignado»; «No representa la rentabilidad de tu cartera»; categorías con nota breve | «✓ 100 % asignado» aparece=false; nota ROIC=true; nota categorías=true | ver baterías | ✅ |
| E9c | Cobertura: datos ausentes distintos de no aplicable | Líneas separadas: «Dato ausente (no disponible)» y «No aplicable» | «Con dato: 4 de 6 posiciones (66 % del peso asignado).No aplicable: 2 fondos; los ETF no tienen ROIC.» | ver baterías | ✅ |
| E9d | Con una empresa sin dato (JPMorgan) | Aparece como «Dato ausente (no disponible)», aparte de los fondos «No aplicable» | Con dato: 4 de 7 posiciones (63 % del peso asignado).Dato ausente (no disponible): 1 empresa.No aplicable: 2 fondos; los ETF no tienen ROIC. | ver baterías | ✅ |
| E10a | Explorar empresas en móvil: dos líneas | Línea 1: nombre y resultado; línea 2: símbolo, sector y «Ver ficha»; buscador cerca del título | nombre y resultado en la misma línea=true; símbolo/sector/«Ver ficha» en la línea inferior=true; distancia título→buscador 92 px; ancho del nombre 50 px | E10-empresas-390.png | ✅ |
| E10b | Nombres largos, sectores largos, resultados incompletos | Sin desbordamiento a 320/360/390; datos ausentes en neutro y como «no disponible», no como fallo | anchos de página 320:320, 360:360, 390:390; nombres largos hallados: Philip Morris International; empresas de «Consumo discrecional»: 11; JPMorgan: «3 de 5 2 no disponibles» (color rgb(74, 88, 109), rojo=false) | E10-empresas-sin-dato-390.png | ✅ |
| E11a | Ficha: cifra y unidad separadas | «29,6» arriba y «miles de millones de USD» debajo; la regla del criterio conserva ancho | cifra «29,6», unidad «miles de millones de USD» debajo=true; ancho del criterio 182 de 354 px | E11-ficha-unidad-390.png | ✅ |
| E11b | Tabla histórica: desplazamiento horizontal REAL con teclado (flecha derecha) y columna del año fija | La tabla se desplaza dentro de su contenedor, la columna del año queda como referencia y se llega a la última columna | scrollLeft 0 → 88 de 88; la columna del año sigue a 0 px del borde izquierdo; la última columna termina 0 px respecto al borde; página sin desbordar=true | E11-ficha-tabla-desplazada-390.png | ✅ |
| E16a | Texto ampliado al 200 % en el editor (APROXIMADO: tamaño de texto de la página, no zoom del navegador) | Sin desbordamiento horizontal; la barra crece; la última posición sigue alcanzable | página 390/390 px; barra 139 px; última posición termina en -1979 y la barra empieza en 705 | E16-texto-200-editor-390.png | ✅ |
| E16b | Foco en diálogos con teclado | Al abrir, el foco entra; Tab no sale del diálogo; Escape cierra y el foco vuelve al origen | estado: entra=true, atrapado=true, cierra=true, vuelve=true \| confirmación: entra=true, atrapado=true, cierra=true, vuelve=true \| ficha: entra=true, atrapado=true, cierra=true, vuelve=true \| acceso: entra=true, atrapado=true, cierra=true, vuelve=true | ver baterías | ✅ |
| E16c | Sin errores de JavaScript en toda la ronda | Ninguno | ninguno | ver baterías | ✅ |

**Manuales:** ninguna se ha ejecutado. Lo que no se puede hacer desde el entorno de trabajo queda **explícitamente pendiente** en `ronda5/pruebas-manuales.md` (teclado móvil real, lector de pantalla real, zoom real del navegador, Safari y Firefox, email real, conflicto entre dos dispositivos reales, TradingView, carga de la SEC).

**Qué es aproximado:** el teclado móvil (E15) se emula reduciendo la altura de la ventana; el «200 %» (E16a) es el tamaño de texto de la página, no el zoom del navegador; el «otro navegador» (E13b) es otro contexto de Playwright con almacenamiento separado.

## Decisiones que conviene revisar
- Una cartera pública que se edita a un reparto distinto pero válido (100 %) **se actualiza al guardar** sin pedir confirmación; la versión pública siempre es la última guardada válida.
- La copia local de cambios sin guardar vive en `localStorage` del dispositivo; si el navegador no persiste, la interfaz **no afirma** que haya copia.
- En móvil, la barra inferior muestra el motivo del bloqueo en lugar de la persistencia breve cuando el reparto no es válido; la persistencia completa sigue visible en la cabecera.
- «Carteras públicas» se mantiene como nombre (incluye las de usuarios).

## Fuera de alcance (futuro plan de pago, no implementado)
Conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión.

## Antes de desplegar
Aplicar `migrations/0006_actualizado_en.sql` en las bases existentes (en una base nueva basta `schema.sql`).

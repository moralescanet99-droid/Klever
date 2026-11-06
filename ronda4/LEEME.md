# Ronda 4: claridad, densidad visual y coherencia de estados

Esta ronda parte de la tercera versión y conserva su estructura: portada separada del editor, tabla editable en escritorio, filas específicas en móvil, resumen lateral, búsqueda de activos y paleta. No se añadieron funciones ajenas al recorrido *probar → comprender → guardar → volver a consultar*.

## Contenido del paquete
- `antes/` y `despues/` (60 imágenes cada una): **360, 390, 768 y 1440 px**, **tema claro y oscuro**.
- Pantallas comparables (mismo número en ambas carpetas):
  - `01-portada`: portada completa.
  - `02-editor-valido`: editor con la cartera guardada (pantalla real) y `02b-editor-valido-completo` (página completa).
  - `03-editor-invalido`: editor con un 103 % asignado y la publicación desplegada; `03b-…-completo` (página completa, desde 768 px).
  - `04-mis-carteras`: pantalla «Mis carteras».
  - `05-explorar-empresas`: listado de empresas.
  - `06-ficha`: ficha de empresa.
- **Lo que hay que saber de las capturas:** datos inventados de una base local de prueba (125 activos; algunos bancos salen «sin dato» a propósito). Los gráficos de TradingView salen como recuadros con «Cargar». En las capturas de página completa por debajo de 900 px, la barra inferior fija se coloca al final de la página para que no tape contenido; las capturas `02` y `03` muestran cómo se ve de verdad. Las «antes» a 768 px de página completa no tienen ese ajuste, así que la barra aparece a mitad de la imagen.

## 1. Guardar y publicar, con las mismas reglas

**Qué hacía de verdad la versión anterior** (comprobado con un script, no solo en la captura 09):
- Con un 103 %, «Guardar» estaba desactivado pero «Publicar» no. Al pulsarlo enviaba una petición al servidor, que la rechazaba, y la cabecera decía «Error al guardar» aunque nadie hubiera pulsado Guardar.
- **Más grave:** con un 88 % asignado, la cartera **se publicaba** con la composición incompleta. No existía ninguna regla.
- Las reglas vivían solo en el estado de un botón y en el servidor, sin una fuente común en la interfaz.

**Regla definida** (misma en la interfaz y en el servidor, `functions/_lib.js`):

| Situación | Guardar | Publicar |
|---|---|---|
| Algún peso vacío, 0 o >100 | Bloqueado, indica qué posición | Bloqueado |
| Total > 100 % («Exceso de asignación») | Bloqueado | Bloqueado |
| Total < 100 % («Pendiente de asignar») | **Permitido**: es un reparto incompleto, privado | Bloqueado: una cartera pública debe tener el 100 % |
| 100 % | Permitido | Permitido si hay tesis |
| Cartera ya pública y se deja incompleta | Bloqueado: hay que dejar de publicarla antes | — |

No existe efectivo implícito: lo que no se asigna aparece como «Pendiente de asignar», no como liquidez. «Dejar de publicar» siempre está disponible, aunque la composición esté a medias.

- El motivo se explica junto a la acción afectada (junto al estado en escritorio, en la barra inferior en móvil y bajo «Publicar cartera»). Un botón que no puede ejecutarse no parece disponible: se desactiva.
- Una operación fallida no muestra confirmación: sin «Cartera publicada», sin «Guardada». El borrador local se conserva durante la corrección.
- Si la composición no es válida, **no se envía ninguna petición**; antes la regla solo existía en el servidor.

**Tres conceptos, separados siempre** (chip, línea de estado y diálogo «Estado de tu cartera»):
1. *Dónde está guardada*: «Guardado en este dispositivo» (borrador) o «✓ Guardada en tu cuenta».
2. *Cambios pendientes*: «Cambios sin guardar» frente a «Guardada». Ya no se confunden con la ubicación.
3. *Visibilidad*: chip «Privada» o «Pública». Un borrador no se llama «Borrador» en el chip, porque eso mezclaba ubicación y visibilidad.

## 2. El resumen dice exactamente lo que muestra
- «100 % asignado», «Pendiente de asignar: 12 %», «Exceso de asignación: 3 %».
- «Distribución por categorías», con la nota «No incluye la exposición sectorial de las empresas que hay dentro de los ETF». La tabla usa «Categoría» en lugar de «Sector».
- «ROIC medio de empresas con datos», con «No representa la rentabilidad de tu cartera.» junto al indicador.
- Cobertura con denominador definido: *«Con dato: 4 de 6 posiciones (64 % del peso asignado). Sin dato: 2 fondos (no aplicable). Media ponderada por peso.»* El denominador por número son las posiciones de la cartera; por peso, el peso asignado.
- Metodología desplegable: es una **media ponderada**; solo cuentan las posiciones con dato; los ausentes quedan fuera, ni como cero ni en el denominador.
- «No aplicable» (los fondos no tienen ROIC) frente a «No disponible» (la empresa no tiene el dato). El guion solo aparece cuando ninguna posición tiene dato.
- No se añadió ningún panel nuevo.

## 3. Cabecera móvil compacta
- Cabecera global de **61 px** (antes 105 px): marca, «Entrar» y un menú accesible (`aria-expanded`, Escape lo cierra y devuelve el foco) con las secciones y «Salir».
- Título de la cartera, chip de visibilidad y menú de acciones; **sin botón «Guardar» duplicado** en la cabecera. El estado de guardado se muestra una sola vez en la barra inferior; su detalle, en el diálogo «Estado de tu cartera».
- Barra inferior de **72 px** (rango pedido 72–88), con total asignado, estado breve y acción principal. Crece con el texto ampliado y reserva espacio debajo del contenido (se mide con `ResizeObserver`).
- Se eliminó la tarjeta anidada: en móvil las posiciones son una lista plana con el margen exterior de 16 px. Los nombres largos ocupan hasta dos líneas y, al desplegar los detalles, se lee el nombre completo.
- Campo de peso de 76 px; admite decimales con coma. Controles táctiles ≥ 44 × 44 px.
- **Teclado virtual:** la barra se oculta cuando el visualViewport se reduce y el campo activo se centra al enfocarlo.

## 4. Orden en tableta y móvil (una columna)
Cabecera → resumen breve (total, estado, nº de posiciones y «Ver detalle») → posiciones → resumen detallado → gráficos → publicación. En escritorio se conservan las dos columnas y el resumen breve se oculta.

## 5. Explorar empresas
Tabla con encabezados **Empresa · Sector · Comprobaciones superadas · acción**; el nombre manda y el símbolo es complementario; «Ver ficha» es un botón visible y accesible por teclado en cada fila; filas de 60 px. Se indica el orden real: de más a menos comprobaciones superadas y, en empate, alfabético por símbolo. Se dice expresamente que superar comprobaciones **no es una recomendación de compra**. Se recorre la lista completa de 105 empresas en una sola página, sin paginación; para no tener que pasar por 105 paradas de teclado hay un enlace «Ir a los filtros de precio».

## 6. Ficha en móvil
Se conservan las cinco comprobaciones con valor, icono y texto. La tabla histórica se desplaza solo dentro de su contenedor, con un aviso visible y la columna del año fija; el título dice «miles de millones de dólares (USD)» (sin «mil M»); se muestran el periodo y la fuente; la metodología y el glosario están plegados; la cabecera con «Cerrar» es fija y sigue accesible al desplazarse y con el texto al 200 %. No se redujo la tipografía.

## 7. Portada
Titular conservado; explicación: «Prueba un reparto de activos y consulta los datos de las empresas. Sin invertir dinero real.»; la SEC pasa a un texto secundario de fuentes; «Probar una cartera» desplaza hasta las plantillas y mueve el foco a la primera. Vista previa de escritorio de 3 posiciones más «+3 posiciones» con los totales de las 6 y la indicación de lista abreviada. En móvil las tres plantillas ocupan **357 px** (antes 649 px). Las carteras públicas llevan etiquetas veraces («Ejemplo de Klever» / «Publicada por un usuario», calculadas en el servidor sin exponer ningún email) y los ejemplos van primero. Las descripciones son completas (`data/demo.sql` actualizado); el aviso educativo general se mantiene en el pie.

## 8. Recorrido que las capturas no demuestran
Probado de extremo a extremo: elegir plantilla; cambiar pesos con coma decimal; vaciar un campo y texto no numérico; corregir un total superior a 100 %; añadir con el buscador y quitar; solicitar acceso conservando el borrador; abrir el enlace; guardar; volver desde «Mis carteras»; recargar; publicar y despublicar; fallo de guardado y recuperación sin perder cambios; teclado y foco.

**Enlace abierto en otro navegador o dispositivo.** Antes el texto decía «tu borrador se guardará al entrar», lo que era falso si el enlace se abría en otro sitio (el borrador vive solo en el navegador donde se creó). Ahora:
- Al pedir el enlace se avisa: «ábrelo en este mismo navegador para conservar tu borrador».
- Si se abre en otro navegador, se entra en la cuenta pero **no se guarda nada**, y se avisa: el borrador no estaba en ese dispositivo y sigue donde se creó. Para saber que había un borrador, el servidor guarda solo un indicador (`enlaces.con_borrador`); el contenido del borrador nunca sale del dispositivo.
- El borrador original queda intacto en el primer dispositivo (probado con dos contextos de navegador independientes).

**Borrador con un exceso al entrar.** Antes el borrador se reescalaba en silencio a 100 % al migrarlo. Ahora no se altera: se conserva, se avisa y se abre el editor con la sesión iniciada; al corregirlo y guardar, se crea la cartera en la cuenta.

**Recargar.** En una cartera de la cuenta, los cambios sin guardar **no sobreviven** a recargar: reaparece la última versión guardada (la página pide confirmación antes de salir si hay cambios pendientes: implementado, no probado el aviso del navegador). Los borradores sin cuenta sí se conservan.

## Qué se implementó, qué se probó y qué falta

**Probado con un navegador automático (Chromium), 130 comprobaciones superadas** (`tests/ronda4/`): validaciones y estados (30), móvil, orden, empresas, ficha y portada (51), recorrido, otro navegador, errores, teclado, árbol de accesibilidad y anchuras (49). La matriz de anchuras cubre 320, **360**, 390, 720, 768 y 1440 px, en claro y oscuro, en portada, empresas, ficha, carteras públicas, editor válido e inválido, diálogo de estado y acceso, sin desbordamiento horizontal. También se comprobó el servidor directamente para las reglas de guardar y publicar.

**Implementado y comprobado solo de forma aproximada:**
- *Ampliación al 200 %:* se aproximó con el tamaño de texto de la raíz al 200 % y con anchuras de 320 y 720 px; no es el zoom real del navegador.
- *Teclado virtual:* se emuló reduciendo la altura de la ventana; no se probó un teclado físico de móvil real. La lógica con `visualViewport` (ocultar la barra) solo se comprobó a nivel de estilos.
- *Lector de pantalla:* se comprobaron roles y nombres accesibles con el árbol de accesibilidad de Playwright; **no se probó con un lector real** (NVDA, VoiceOver, TalkBack).
- *Dos dispositivos:* se simularon con dos contextos de navegador con almacenamiento separado, que reproducen lo relevante (no comparten el borrador).

**No probado:** Safari y Firefox, dispositivos táctiles reales, el envío real del email (Brevo), Cloudflare D1 real, los widgets de TradingView.

**Pendiente / decisiones abiertas:**
- Aplicar la migración `migrations/0005_aviso_borrador.sql` en las bases creadas antes (en una base nueva basta `schema.sql`) y volver a cargar `data/demo.sql` si ya se cargó, para actualizar las descripciones.
- Al reabrir una cartera, el servidor devuelve las posiciones ordenadas por peso (de mayor a menor); mientras se edita conservan el orden de inserción.
- Si un borrador con exceso se corrige en el editor tras iniciar sesión, se guarda como cartera nueva; no se ofrece «reescalar» automáticamente (era una decisión silenciosa).
- La lista de 105 empresas sigue siendo una página larga: es lo que se pidió explícitamente (sin paginación ficticia); el salto al screener alivia el teclado.

## Cambios de código relevantes
- `functions/_lib.js`: `validarComposicion` y `puedePublicar` (regla única). `functions/api/portfolios/[id].js` las usa en PUT y PATCH.
- `functions/api/public/*.js`: campo `origen` («ejemplo»/«usuario»).
- `functions/api/login.js`, `verify.js`, `schema.sql`, `migrations/0005_aviso_borrador.sql`: indicador `con_borrador`.
- `public/app.js`: una única función `validar()` para la interfaz, `guardar()` y `cambiarPublicacion()`; máquina de estados de guardado separada en ubicación, cambios y visibilidad; menú móvil; combobox, barra inferior y teclado virtual.
- `public/index.html`, `public/style.css`: cabecera compacta, orden en una columna, tabla de empresas, ficha, barra inferior.

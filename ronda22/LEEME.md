# Ronda 22 · cierre de lo que ya existía: recuperación del registro de revisiones, un Cuaderno coherente y el recorrido pulido

Parte de la revisión de la ronda 21 y de su encargo (`procesos-klever/06-`, C19), más la instrucción de Javier de recorrer el producto como usuario y corregir lo que comprometa la claridad, la confianza o la utilidad. **Se separa lo que ya existía y estaba mal (se resuelve aquí) de las capacidades nuevas (quedan para después, §9).** Sin cobros, sin bancos/brókeres, sin datos reales, sin publicar. Identidad visual intacta.

> **Código de la última pasada completa:** el commit de la cabecera de `ronda22/resultado-ejecucion.txt` (§6). Abrir el recorrido: `ronda22/ABRIR-EN-MOVIL.md`. Antes/después: `ronda22/ANTES-Y-DESPUES.md`.

# 1. A · Recuperación de «Registrar revisión» (I1)
- **Causa:** la ronda 21 borraba la clave del intento antes de terminar la lectura posterior; si esa lectura fallaba, el cliente seguía mostrando el escenario antiguo y el reintento generaba **otra clave** con la versión vieja → 409 → «no se ha registrado nada», aunque la revisión ya estaba guardada.
- **Corrección** (`public/js/revisiones.js`, sin DOM, y su uso en `lab.js`): se separan **borrador**, **intento** (clave y contenido **congelados**), **resultado confirmado** y **actualización de la vista**. Un intento se reenvía siempre con **su** clave y **su** contenido; el servidor es idempotente y devuelve el registro ya guardado. El POST confirmado **trae** el escenario actualizado, así que normalmente no hace falta releer. Si la relectura (tras un `duplicado`) falla, se dice «tu revisión **sí** está guardada» y se ofrece «Actualizar la vista», que **solo lee**. Si el resultado es incierto (sin conexión, 5xx) se conserva el intento y se ofrece «Reintentar el mismo envío»; lo que la persona haya escrito después **no se presenta como guardado** y se conserva. Un 409 de conflicto significa que la clave no existía: no se registró nada, se recarga la versión actual y el texto se mantiene; no se afirma «no guardado» sin saberlo. Lo escrito sobrevive a los repintados.
- **Pruebas** (`unit-cliente-revision22`, 8, cliente **contra el servidor real** con cortes inyectados; `testT`, 24, en el navegador): POST confirmado + lectura fallida; POST persistido con la respuesta perdida; texto modificado con un intento incierto; dos pestañas con versión antigua; rechazo (400) y 500; base intacta. **C8 reproduce la lógica de la ronda 21 y muestra el mensaje falso**; con el código nuevo no ocurre.

# 2. B · Un seguimiento personal coherente en el Cuaderno (I2)
- El estado editorial (`estadoSeguimiento`) ya no se usa como representación del seguimiento personal: **«Tu seguimiento»** (nº de revisiones personales y próxima revisión, con `n_revisiones`, sin cargar el historial por tarjeta) y **«Respuesta editorial»** son datos **separados**. Una revisión personal **nunca** produce «pregunta resuelta» ni una respuesta editorial inventada (`testT` T5: la frase editorial es idéntica antes y después de registrar).
- Las ideas **archivadas** y **descartadas** salen de lo pendiente y siguen accesibles en sus filtros (`testT` T6). Se retiran frases contradictorias («sigue pendiente hasta que la revises tú»).

# 3. C · Lo que toca revisar, a la vista (I3)
- **«Para revisar» va primero**, después «Próximas revisiones» y «Sin fecha»; **una tarjeta por escenario** (pregunta, fecha, resumen, tu seguimiento, respuesta editorial en una frase y la acción). El bloque editorial duplicado desaparece con cuenta; su detalle completo (qué ha ocurrido, pesos del escenario frente a la cartera actual) vive **una vez** en la **ficha**, que también tiene el historial.
- **«Registrar revisión»** en la tarjeta lleva directo al formulario de la ficha, con el foco en «Tu observación». Se conserva el filtro de archivadas/descartadas.
- Rótulos de la comparación en móvil **encima** de las barras (ya no se parte «Alternativa simulada»); se retira del Cuaderno la promesa «Formará parte del futuro plan de pago» (ahora «En beta»).

# 4. Recorrido completo como usuario: defectos encontrados y corregidos (lo que ya existía)
Se recorrió el producto en 390 y 1440 px (portada, ejemplo explicado, Revista, artículo, Cuaderno de visitante y con cuenta vacía, laboratorio, editor vacío, Mis portafolios, empresas). Defectos corregidos:
1. **«Mis portafolios» con cuenta nueva ofrecía una cuarta entrada vieja** (solo plantilla), incoherente con las tres entradas: ahora ofrece «Empezar desde cero» y «Recrear la que ya tengo» (crean la cartera vacía en la cuenta) además de la plantilla.
2. **El editor vacío ofrecía «Más acciones» para cargar una plantilla** que no existe en una cartera vacía o manual: el texto depende del origen; el aviso «sin conexión con bróker» es visible arriba mientras la cartera está vacía.
3. **Avisos ámbar para condiciones normales** («Estás sin cuenta», «No tienes ninguna cartera, usamos una de ejemplo», «Quién cede el peso»): superficie neutra con filete.
4. **Jerarquía de la portada:** quien llega por primera vez ya no ve «Crear desde cero» repetido arriba y en la primera tarjeta (el botón superior solo aparece a quien vuelve).
5. **Jerga en la ficha** («revisión 0») y copy del Cuaderno vacío actualizados; el nombre del escenario ya no se repite bajo su pregunta.

# 5. Verificación centrada en los fallos (tabla D del encargo)
| Caso | Dónde | Estado |
|---|---|---|
| POST confirmado, GET posterior falla | `unit-cliente-revision22` C2, `testT` T3 | verificado: «sí está guardada», recuperar la vista no hace otro POST |
| POST persistido, respuesta perdida | C3, T3 | verificado: una sola revisión |
| Texto modificado con intento incierto | C4, T3 | verificado: el texto nuevo no se da por guardado |
| Dos pestañas y versión antigua | C5, T4 | verificado: sin pisar; texto conservado |
| Revisar y volver al Cuaderno | T5 | verificado: contador y fecha correctos; no dice que nunca se revisó |
| Archivar y descartar | T6 | verificado |
| Revisión personal con historia editorial | T5 | verificado: estados independientes |
| Móvil 320/390 y escritorio | T1–T7 | verificado a 320, 390 y 1440 px |
| Base y alternativa | C7, T6 | verificado: composición y revisión de la cartera base intactas |
| Registro en la demo (sin persistencia) | `testDemo22` (12) | verificado: se registra y **se pierde al recargar** |
| K9 (envíos simultáneos con la misma clave) | `unit-cuaderno21` K9 | el servidor cumple (una inserción, ningún 500); **un cliente puede recibir 409**: el cliente lo trata como `conflicto` con el texto conservado, **no se prueba con dos clientes reales simultáneos** |

# 6. Pruebas realmente ejecutadas (por entorno)
@@PASADA@@

# 7. Cambios en pruebas antiguas (para revisarlos, no se certifica «sin rebajar»)
Por el diseño nuevo se adaptaron: `testO` O5b/O5c/O5e (las tarjetas editoriales pasan a la ficha; se comprueba una tarjeta por escenario con «Tu seguimiento» y «Respuesta editorial» separados, y la ficha con la respuesta completa), `testQ` Q8 (Cuaderno con cuenta), `testN` N7/N9/N9b y `testP` P10 (etiqueta «En beta»; ya no se promete un plan de pago), `testL` L10 (fecha en la tarjeta compacta), `testB` (la primera entrada de la portada es ahora `#entrada-ejemplo`). **No he comparado línea a línea con la versión anterior para certificar que ninguna aserción se rebajó**; se ha intentado mantener lo que cada una comprueba, y la revisión puede contrastarlo con el historial Git.

# 8. Incidencias de la ronda
- **Pasada 1 (`logs-pasada1-fallo-ejecutor/`, 933 correctas):** un único problema, **del ejecutor**, no del producto: al añadir la segunda prueba de la demo, `run-all.sh` comprobaba el «DEMO OK» sobre la salida de la segunda. Corregido el orden.
- **`testK`:** la causa del `goto` abortado (cerrar la ficha con Escape ejecuta `history.back()`, asíncrono) es la **hipótesis principal; aún no demostrada**. **`testP` (sin resultado una vez en la ronda 21): no se declara cerrada**; no se ha reproducido.

# 9. Qué queda fuera (capacidades nuevas, para después)
Cobros, bancos/brókeres, datos reales, noticias o artículos automáticos, tips diarios, notificaciones/correos, recomendaciones, publicación, ampliaciones del laboratorio, ideas generales sin escenario, asistente IA y un sistema global de puntuación. **Sin probar:** la prueba con cinco personas (el protocolo está en `PRUEBA-CON-USUARIOS.md`, todo «pendiente»), el regreso al día siguiente, móvil físico, lector de pantalla, zoom real, Safari/Firefox, correo real y D1 remota. **Con 4 de 5 en la prueba solo se decide qué reparar.**

# Verificación previa en el dispositivo previsto (antes de la sesión 1)

**Estado: NO realizada.** Se rellena en el dispositivo y navegador que se usarán en el piloto (anota cuál: ______________). Todo con datos ficticios y el piloto abierto con `scripts/piloto/abrir-piloto.sh`.
Lado servidor ya comprobado automáticamente (`bash scripts/piloto/comprobar-persistencia.sh`: cuenta, cartera, parar/arrancar, volver a entrar, cerrar sesión → 401). **Eso no sustituye lo de abajo.**

| # | Comprobación | Cómo | Resultado |
|---|---|---|---|
| 1 | Crear y recuperar cartera y escenario | Entrar con un correo ficticio; crear una cartera (cualquier entrada), probar un cambio y guardar una pregunta con fecha. Cerrar la pestaña, **parar y volver a abrir el servidor**, entrar con el mismo correo: la cartera y la idea están en el Cuaderno. | ⬜ pendiente |
| 2 | Editar durante un envío | En «Registrar revisión» pulsar enviar con la red lenta (herramientas del navegador → red → «Slow 3G»/«Offline» un momento) y **escribir una frase nueva mientras espera**. Tras confirmarse: la primera revisión está en el historial y la frase nueva sigue en el formulario con el aviso «NO se ha enviado». | ⬜ pendiente |
| 3 | Recuperar una lectura | Con dos pestañas: registrar una revisión en la A; en la B (versión antigua) registrar otra → conflicto. Con la red cortada, «Reintentar la lectura» no envía nada y el texto sigue; al volver la red, se ve la versión actual y se puede registrar. | ⬜ pendiente |
| 4 | Regresar tras sesión inválida con el borrador | Escribir una revisión **sin enviarla**. En el ordenador del servidor, con el servidor encendido: `./node_modules/.bin/wrangler d1 execute klever --local --persist-to .wrangler/piloto --command "DELETE FROM sesiones"` (invalida todas las sesiones; comprobado que el siguiente acceso recibe 401). Pulsar enviar: la app pide volver a entrar. Entrar **con la misma cuenta** y abrir la idea: el texto escrito está en el formulario. | ⬜ pendiente |
| 5 | Salida voluntaria y limpieza | Con un borrador sin enviar, pulsar «Cerrar sesión». Entrar con **otra** cuenta ficticia: no ve ese texto ni esa idea. Volver a la primera cuenta: el borrador ya no está (dispositivo compartido). | ⬜ pendiente |
| 6 | Entorno | Portada y Cuaderno abren; el enlace de acceso sale en pantalla; no se envía correo; `bash scripts/piloto/verificar-version.sh` dice «VERSIÓN piloto-r23 CORRECTA». | ⬜ pendiente |

**Lo que NO cubre ninguna de estas comprobaciones** (se declara, no se oculta): la limitación de la sección 3 de `PRUEBA-CON-USUARIOS.md` (intento incierto + pérdida de sesión) **existe** y no se «arregla» comprobando; solo se gestiona en la sesión. Si alguna comprobación falla: **no empezar**, anotar qué falla y avisar; no se corrige el producto por sorpresa.
Esta comprobación 4 simula la caducidad invalidando la sesión en el servidor (no espera a una caducidad real por tiempo); equivale a lo que prueba `tests/ronda23/testU.cjs` (U4) pero en el dispositivo previsto.

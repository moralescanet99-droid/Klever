# Ronda 27 · Corrección de la duplicación por un envío incierto

**Encargo (Javier, 2026-11-06):** «corrige el problema». Era la limitación conocida desde R23/R24 (`11-traspaso-supervisor.md`): tras un envío de «Registrar revisión» con resultado **incierto**, si después se recargaba, se cerraba la pestaña o caducaba la sesión, la clave del intento se perdía (`limpiarSesionLab()` borraba `revIntento`, que solo vivía en memoria) y el reenvío creaba **una segunda anotación igual**.

## Qué se ha hecho (implementado)
- El intento incierto (escenario, clave, revisión vista y contenido congelado) se guarda **en el dispositivo**, dentro del borrador de esa revisión (`klever_rev_<id>`), con su misma caducidad (7 días).
- **Solo se restaura para la cuenta autorizada:** después de que el servidor devuelva el escenario a la sesión actual. Otra cuenta recibe 404, no ve formulario ni texto, y el registro se purga al cargar su Cuaderno (comportamiento de R23 que se conserva).
- **Reconciliación antes de otra escritura:** al volver, el botón dice «Reintentar el mismo envío» y avisa de que un envío anterior quedó sin confirmar. Al pulsarlo se reenvía **la misma clave y el mismo contenido**. El servidor ya comprobaba la clave **antes** que la revisión (no se toca el servidor): si la anotación llegó, la devuelve («Esa revisión ya estaba registrada»); si no llegó, la registra una sola vez.
- Lo escrito después de recargar **no se envía** con ese reintento: queda en el formulario con el aviso «NO se ha enviado».
- Cambio en `public/js/lab.js` (+17 líneas). Demo reconstruida.

## Qué se ha probado
- **`tests/ronda27/testW.cjs` (12, servidor real, 1440 y 390 px):** W1 respuesta perdida + recarga; W2 petición perdida + pestaña cerrada; W3 incierto + sesión revocada + misma cuenta (otra sesión, misma clave); W4 texto nuevo tras recargar; W5 otra cuenta en el mismo dispositivo; W0 sin errores.
- **La prueba falla sin la corrección:** con el `lab.js` anterior, **8 de 12 fallan**. El duplicado aparece en el servidor (`["Revisión W1","Revisión W1"]`), y en W4 se guarda el texto equivocado. W5 y W0 pasan en ambos casos: la privacidad ya era correcta.
- **Pasada completa:** ver el final de este documento.

## Lo que sigue sin cubrir (se declara)
- **Cerrar sesión a propósito** borra todos los borradores de revisión, incluido un intento incierto. Se mantiene así por privacidad en dispositivos compartidos. Si alguien sale a propósito justo tras un envío incierto y luego reescribe la revisión, puede duplicarla.
- Si **otra cuenta** carga su Cuaderno en el mismo dispositivo antes de que vuelva la primera, el intento de la primera se purga (privacidad antes que deduplicación), con el mismo efecto.
- **Otro dispositivo:** el intento vive solo en el dispositivo donde se hizo.
- Sin probar: teléfono real, Safari/Firefox, almacenamiento lleno o bloqueado (en ese caso se vuelve al comportamiento anterior: solo en memoria).

## Piloto
Pasa a **`piloto-r27`** (`scripts/piloto/VERSION-PILOTO.txt`). La sección «Incidencia conocida» del guion de la ronda 24 **ya no aplica**: el facilitador ya no tiene que detener la tarea ni revisar el historial antes de un reenvío. Si ve un duplicado, se anota como incidencia del producto (sería una regresión). Opcional en la verificación previa del dispositivo: provocar un envío incierto («Offline» un momento), recargar y comprobar que «Reintentar el mismo envío» deja **una** anotación.

## Resultado de la pasada completa
**Commit `a73b4a2`, árbol limpio, 2026-11-06 17:48 UTC, local del autor: 1010 correctas, 0 fallos, código de salida 0** (51 baterías con resultado: las 998 de la ronda 26 + 12 de `testW`). Registro en `resultado-ejecucion.txt` y `logs/`.

# Abrir el piloto — instrucciones breves para Javier

**Versión del piloto: `piloto-r23`** (código probado en el commit `5de75d8`; se comprueba sola al abrir). **No se cambia nada del producto entre participantes.** Si algo falla o confunde, se anota en el registro; no se arregla sobre la marcha.

## Una sola vez, antes de la primera sesión
1. Necesitas Node.js 20+ y, en la carpeta del proyecto, `npm ci` ejecutado una vez.
2. `bash scripts/piloto/abrir-piloto.sh` — si dice **«VERSIÓN piloto-r23 CORRECTA»**, sigue; si dice que **no** lo es, no abras el piloto y avisa.
3. Abre `http://localhost:8788`. Para entrar: escribe cualquier correo **ficticio** (p. ej. `persona1@ficticio.invalid`), acepta el aviso y pulsa el enlace que sale **en pantalla** («Modo desarrollo: entrar»). **No se envía ningún correo y no se publica nada.** Usa un correo distinto por participante y apúntalo en el registro.
4. Haz la **verificación previa en el dispositivo que se usará** (`VERIFICACION-PREVIA-DISPOSITIVO.md`). Hasta que no esté hecha, la primera sesión no empieza.
5. Si el dispositivo de la persona es otro (móvil): `LAN=1 bash scripts/piloto/abrir-piloto.sh` y, en el móvil, `http://<IP del ordenador>:8788` (misma wifi). Ten en cuenta que ese acceso lo ve cualquiera de esa wifi: úsalo solo en una red de confianza.

## Antes de cada sesión
- Servidor abierto (la ventana de `abrir-piloto.sh` sigue en marcha). Abre la portada y el **Cuaderno** una vez: la primera carga puede tardar. Si no arranca, se anota como **incidencia de entorno, nunca del participante**.
- **Lo guardado se conserva** entre sesiones mientras no uses `RESET_PILOTO=1` (que **borra todo**: solo antes de empezar, nunca entre la sesión 1 y la 2). No cierres el servidor «a lo bruto» durante una tarea de guardado; para parar usa Ctrl+C **entre** sesiones.
- La **demo** (el enlace del artifact) pierde los datos al recargar: **no sirve** para el segundo contacto.

## El registro de resultados
Es la tabla de `PRUEBA-CON-USUARIOS.md` (en esta misma carpeta). **Está vacía a propósito**: cada casilla dice «pendiente» y solo la rellenas tú, tal como ocurra. No hay participantes inventados.

## Si ocurre algo raro con un envío
Lee la sección 3 de `PRUEBA-CON-USUARIOS.md` («Incidencia conocida»). Resumen: **para esa tarea, mira el historial antes de dejar que se envíe otra vez, y anótalo.**

# Ronda 24 · preparar el piloto privado (sin ampliar el producto)

Parte de la revisión de la ronda 23 (`procesos-klever/06-`, C21): **B1/B2 aceptados; R23 aceptado para un piloto privado y supervisado con cinco principiantes; no hay otra ronda general de desarrollo.** Esta ronda **no toca el producto**: solo prepara el piloto. No es una autorización de publicación ni de cobro.

## Qué se ha hecho (implementado / probado / pendiente)
| Punto del encargo | Implementado | Probado | Pendiente |
|---|---|---|---|
| 1. R23 como versión identificable, sin cambios silenciosos | `scripts/piloto/VERSION-PILOTO.txt` (commit probado `5de75d8` + hashes de `public/`, `functions/`, `migrations/`, `schema.sql`) y `verificar-version.sh`; `abrir-piloto.sh` **se niega a abrir** si el código difiere | Sí: el código de HEAD es idéntico al de `5de75d8` (`git diff` vacío en esas rutas) y el verificador da «CORRECTA» | Nada |
| 2. Entorno privado con persistencia, acceso de pruebas y datos ficticios | `scripts/piloto/abrir-piloto.sh` (estado propio `.wrangler/piloto`, **no se reinicia** al reabrir; enlace de acceso en pantalla; sin correo ni publicación; `LAN=1` opcional) | Sí, en este entorno: arranca, sirve la portada y la API, **también por la IP** con `LAN=1`; `comprobar-persistencia.sh`: cuenta+cartera → parar/arrancar → volver a entrar → la cartera sigue → cerrar sesión → 401 | Abrirlo en el ordenador de Javier |
| 3. Verificación previa en el dispositivo previsto | `VERIFICACION-PREVIA-DISPOSITIVO.md` (5 comprobaciones + entorno, con pasos exactos) | **No**: ninguna casilla rellena; requiere el dispositivo real. Comprobado que el comando para invalidar sesiones del paso 4 funciona (401 tras ejecutarlo) | Hacerla antes de la sesión 1 |
| 4. Incidencia del apartado 3 en el guion | `PRUEBA-CON-USUARIOS.md`: detener tarea, mirar historial antes de otro envío, producto **y** intervención, no «sin ayuda», no borrar duplicados, no enseñar antes; tabla de incidencias | — (documento) | Usarlo |
| 5. Instrucciones breves a Javier y registro | `PILOTO-INSTRUCCIONES-JAVIER.md` + registro **vacío** («pendiente») | — | Rellenarlo con personas reales |

## Sin comprobar
Chromium y la interfaz **no** se han ejecutado en esta ronda (no hacía falta: no cambia el código; la pasada completa de la ronda 23, 960/0, sigue siendo la evidencia del producto, solo del autor). Dispositivo físico, Safari/Firefox, lector de pantalla, red real, D1 remota, caducidad real, correo real y el piloto con personas: **no comprobados.**

## Limitación conocida (antes de una beta pública, no del piloto)
Un envío con resultado incierto seguido de pérdida de sesión/recarga puede duplicar una anotación del historial (`limpiarSesionLab()` borra `revIntento`). Corrección prevista: conservar el intento pendiente completo (clave, escenario, carga y contexto de cuenta) hasta conocer su resultado; restaurarlo solo para la cuenta autorizada; reconciliar con el servidor antes de otra escritura; probar cierre/recarga y cambio de cuenta. Durante el piloto se **gestiona** con el guion (sección «Incidencia conocida»). Registrada en `PENDIENTES.md`.

## Nota sobre la etiqueta de versión
La versión se identifica por commit y hashes (`VERSION-PILOTO.txt`); no se ha subido una etiqueta de git al remoto (solo se empuja la rama designada).

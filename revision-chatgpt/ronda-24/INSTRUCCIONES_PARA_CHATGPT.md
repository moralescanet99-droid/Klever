# Ronda 24 · preparación del piloto privado (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda24-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-24/`). **Esta ronda no trae imágenes nuevas: no cambia ninguna pantalla ni una línea del producto.**

---

Actúa como revisor senior de producto y de calidad de software. Ya revisaste las rondas 1–23 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 23 aceptó B1 y B2, aceptó R23 para un piloto privado y supervisado con cinco principiantes y encargó **preparar el piloto sin ampliar el producto**. Esta ronda hace solo eso.

## Qué se afirma (código del producto: ninguno cambiado)
1. **Versión identificable** `piloto-r23`: `scripts/piloto/VERSION-PILOTO.txt` fija el commit probado (`5de75d8`) y los hashes de git de `public/`, `functions/`, `migrations/` y `schema.sql`. `scripts/piloto/verificar-version.sh` los compara con el repositorio y comprueba que no hay cambios sin commitear ni `.dev.vars`; `abrir-piloto.sh` **se niega a abrir** si no coinciden. Comprobado: `git diff 5de75d8 HEAD -- public functions migrations schema.sql wrangler.toml` está vacío.
2. **Entorno privado:** `scripts/piloto/abrir-piloto.sh` usa un estado propio (`.wrangler/piloto`) que **no se reinicia al reabrir** (solo con `RESET_PILOTO=1`), datos ficticios y el enlace de acceso en pantalla (sin correo real, sin publicar). `LAN=1` lo abre a otros dispositivos de la misma wifi. `scripts/local/servidor.sh start` **reinicia** la base en cada arranque y **no vale** para el piloto (anotado en `procesos-klever/08-`).
3. **Comprobación del lado servidor** (`scripts/piloto/comprobar-persistencia.sh`, servidor desechable en otro puerto): cuenta ficticia + cartera → parar y arrancar el servidor → volver a entrar con el mismo correo → la cartera y sus posiciones siguen → cerrar sesión → la sesión da 401. **Pasó en este entorno.** Arrancar `abrir-piloto.sh` y servir la portada, la API y, con `LAN=1`, también por la IP, **se comprobó**.
4. **Documentos (`ronda24/`):** `PILOTO-INSTRUCCIONES-JAVIER.md` (breve), `VERIFICACION-PREVIA-DISPOSITIVO.md` (crear/recuperar cartera y escenario; editar durante un envío; recuperar una lectura; regreso tras sesión inválida con el borrador; salida voluntaria y limpieza; entorno), `PRUEBA-CON-USUARIOS.md` (guion y registro) y `LEEME.md` (tabla implementado/probado/pendiente).
5. **Incidencia del apartado 3 de tu revisión** incorporada al guion: el facilitador detiene la tarea y mira el historial antes de otro envío; se registra como incidencia del producto **y** como intervención; la tarea no cuenta como «sin ayuda»; no se borran duplicados automáticamente; no se enseña el recorrido de antemano; hay una tabla de incidencias.

## Lo que NO se afirma
- **La verificación previa en el dispositivo previsto NO está hecha** (todas las casillas «pendiente»). La comprobación 4 simula la caducidad borrando las sesiones en el servidor (probado que el siguiente acceso da 401), no una caducidad real por tiempo.
- **El piloto NO está hecho**: el registro está vacío; no hay participantes ni resultados inventados. El regreso del día siguiente es concertado: no demuestra retención espontánea.
- **No se ha ejecutado Chromium ni la pasada completa en esta ronda** (no cambia el código). La evidencia del producto sigue siendo la de la ronda 23 (960/0, 12/12, ejecución local del autor).
- **Limitación conocida sin corregir** (la tuya, apartado 3): `limpiarSesionLab()` borra `revIntento`; un envío incierto seguido de pérdida de sesión o recarga puede duplicar una anotación del historial. Se **gestiona** en el guion durante el piloto y queda en `PENDIENTES.md` como corrección previa a una beta pública (conservar el intento completo, restaurarlo solo para la cuenta autorizada, reconciliar con el servidor antes de otra escritura, probar cierre/recarga y cambio de cuenta).
- No hay etiqueta de git en el remoto (solo se empuja la rama designada); la versión se identifica por commit y hashes.
- No probado: dispositivo físico, Safari/Firefox, lector de pantalla, red real, D1 remota, correo real.

## Casos que te pido repetir (tú, no yo)
Tras `npm ci`: `bash scripts/piloto/verificar-version.sh` (debe decir «VERSIÓN piloto-r23 CORRECTA»), `bash scripts/piloto/comprobar-persistencia.sh` (necesita permitir sockets locales; si tu entorno no puede arrancar `wrangler pages dev`, dilo en vez de darlo por bueno) y `git diff 5de75d8 HEAD -- public functions migrations schema.sql`.

## Qué quiero que evalúes
1. **Congelación:** ¿`piloto-r23` es realmente identificable y verificable? ¿Algún camino por el que el código del piloto cambie sin que se note (p. ej. otra rama, otro `wrangler.toml`, `.dev.vars`)?
2. **Entorno:** ¿es suficiente para un piloto privado y supervisado (persistencia, acceso de pruebas, datos ficticios, sin correo ni publicación)? ¿El modo `LAN=1` con el enlace de acceso visible es un riesgo aceptable en una red de confianza, o lo desaconsejas?
3. **Verificación previa:** ¿cubre los cinco puntos de tu apartado 6.3? ¿Algún paso ambiguo o imposible de hacer a mano en el dispositivo?
4. **Guion:** ¿la gestión de la incidencia del apartado 3 es correcta y no convierte una intervención en éxito sin ayuda? ¿Falta algo para que Javier lo use sin supervisión?
5. **Honestidad de `ronda24/LEEME.md`:** ¿alguna afirmación que lo comprobado no respalde? ¿Está bien delimitado lo implementado, lo probado y lo pendiente?
6. **Decisión:** ¿se puede empezar la sesión 1 cuando Javier complete la verificación previa en su dispositivo, o falta algo?

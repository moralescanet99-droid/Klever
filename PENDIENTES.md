# Tareas pendientes (lo que solo puedes hacer tú)

## ★★ Ronda 31 · Klever de última generación (C40, 2026-11-08)
Visión: `ronda31/VISION.md` (6 principios y 14 detalles V1–V14). Auditoría: `ronda31/AUDITORIA.md` (13,5/20; hallazgos P0–P3). Estado de cada punto: `ronda31/LEEME.md`.
Permiso de Javier: trabajar sin consultar en todo lo que cueste 0 €. **Lo que necesita su aprobación está justo debajo.**

### Para Javier (revisar mañana)  ⬜
*(se completa al terminar la ronda 31)*

## ★ Punto 14 «volver y valor»: lo que falta para que valga la pena (anotado 2026-11-07, C35–C36)
La ronda 29 puso el «escaparate» (arranque guiado, huella, «Tu semana», retos). Falta el **motor** y el **aviso**. Estos dos bloques dependen de cuentas externas y **no están hechos**:

### 14.1 · «Novedades de tus empresas» (que algo cambie sin que la persona toque nada)  ⬜
- **Problema:** «Desde tu última visita» solo muestra cambios hechos por la propia persona (`public/js/semana.js`). Si no toca nada, a la semana ve lo mismo → no hay motivo para volver.
- **Qué hacer:** sección en «Tu semana» con hechos de las empresas que tiene o sigue, sin precios ni rentabilidad:
  - «KO ha publicado resultados y su huella ha cambiado: Información pasa de 3/5 a 4/5».
  - «2 empresas de tu cartera presentan resultados esta semana» (calendario de resultados y nuevas presentaciones a la SEC).
- **Depende de:** datos reales de la SEC (fase 4: secretos de GitHub `SEC_USER_AGENT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, flujo `nightly.yml` funcionando y D1 remota; ver §2 de este archivo). Hace falta guardar la **fecha de cada presentación** y la huella anterior para detectar el cambio.
- **Se puede adelantar sin cuentas:** construirlo entero con datos inventados y rotulados, para que solo falte enchufar la SEC.
- **Criterio de hecho:** con datos reales, una cartera sin cambios del usuario muestra al menos una novedad real en una semana con resultados.

### 14.2 · Resumen semanal por correo (el aviso fuera de la web)  ⬜
- **Problema:** «Tu semana» solo la ve quien ya ha decidido volver. Sin un aviso, el punto 14 no pasa de un 6.
- **Qué hacer:** correo semanal de 3 líneas (señal principal, ideas que tocan esta semana, novedades de sus empresas) con un enlace a «Tu semana». **Opcional y desactivado por defecto**, con baja en un clic y consentimiento registrado; sin rentabilidades ni recomendaciones.
- **Depende de:** cuenta de **Brevo** (la misma del enlace de acceso, §1 de este archivo), despliegue en Cloudflare y una tarea programada (Cron Trigger de Cloudflare o GitHub Actions). Revisar el texto legal (consentimiento para comunicaciones).
- **Requisito previo técnico:** ✅ la instantánea semanal ya está en el servidor (ronda 30); falta que una tarea programada la haga también para quien no entra.
- **Criterio de hecho:** en el piloto, al menos 1 de 5 personas vuelve desde el correo.

### Ronda 30 (sin cuentas externas)  ✅ hecha el 2026-11-07 (C37, `ronda30/LEEME.md`)
1. ✅ Instantánea semanal en el servidor (`/api/semana`, tabla `instantaneas`, migración 0013). **Al desplegar: aplicar `migrations/0013_instantaneas_y_foto.sql` en la D1 real** (en una base nueva basta `schema.sql`).
2. ✅ Evolución en el tiempo («Tu evolución» en «Tu semana»).
3. ✅ Reto de la semana rotativo.
4. ✅ Cerrar el ciclo de las ideas («Qué ha cambiado en los datos desde que la guardaste» y «Mira atrás»), sin precios históricos.
5. ⬜ **Criterio de 10 del punto 14** (no pedido aún): ≥ 3 de 5 personas del piloto vuelven solas en 7 días y ≥ 1 vuelve por el correo. Se mide con `scripts/metrics.sql`.
- ⬜ Para el correo (14.2): la foto semanal ya existe en el servidor, pero solo se hace al abrir «Mis carteras»; el correo necesitará una **tarea programada** que la haga también para quien no entra.

## 0. Publicar la demo pública (la más rápida: solo cuenta de Cloudflare)
- [ ] `wrangler login` y `wrangler pages deploy demo --project-name klever-demo` (ver `demo/LEEME.md`). Da una dirección pública con datos inventados que cualquiera, incluido ChatGPT, puede abrir.

## 1. Crear la cuenta de Brevo (envío del enlace de acceso)  ← siguiente
- [ ] Crear cuenta gratuita en brevo.com
- [ ] Verificar un correo remitente (Senders → añadir tu correo → pulsar el enlace de confirmación)
- [ ] Crear una clave API (SMTP & API → API keys → Generate) y copiarla
- [ ] Guardar los secretos en Cloudflare Pages:
  - `wrangler pages secret put BREVO_API_KEY` (la clave)
  - `wrangler pages secret put MAIL_FROM` (el correo remitente verificado)
- [ ] Probar el acceso con tu Gmail y con otro proveedor; mirar la carpeta de spam

## 2. Cloudflare (puesta en marcha)
- [ ] `wrangler d1 create klever` y pegar el `database_id` en `wrangler.toml`
- [ ] Cargar el esquema: `wrangler d1 execute klever --remote --file=schema.sql` (base nueva: no hace falta ninguna migración)
- [ ] Secretos de GitHub: `SEC_USER_AGENT` (app + correo), `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- [ ] Lanzar a mano el flujo «Fundamentales SEC (nocturno)» para cargar datos
- [ ] Cargar `data/demo.sql` (portafolios públicos de ejemplo)
- [ ] Desplegar en Pages y activar Web Analytics (un clic en el panel)

## 3. Antes de abrir al público
- [ ] Leer los términos de TradingView completos (secciones 3 y 4)
- [ ] Que un abogado revise `public/legal.html` y añadir el contacto para derechos de datos
- [x] Universo ampliado a 125 activos (105 acciones y 20 ETFs) (`data/universe.json`); revísalo y quita o añade lo que quieras

## 4. Cuando haya usuarios
- [ ] Medir la decisión de la beta: `wrangler d1 execute klever --remote --file=scripts/metrics.sql` (registros, portafolios creados, usuarios que vuelven pasada una semana)
- [ ] Bases creadas con versiones anteriores: aplicar en orden las migraciones de `migrations/` que falten (de la `0002` a la `0013`) (en una base nueva basta `schema.sql`)
- [ ] Si ya cargaste `data/demo.sql`, vuelve a cargarlo (o actualiza las tesis) para que las descripciones sean las nuevas, completas

## 5. Pruebas manuales que no se pueden ejecutar desde el entorno de trabajo
- [ ] **Validación real (bloqueada hasta que existan accesos): `ronda10/BLOQUEOS.md` (qué hace falta) y `ronda10/GUION-VALIDACION-REMOTA.md` (qué ejecutar; sustituye al de la ronda 9)**; ninguno de sus pasos se ha ejecutado.
- [ ] (histórico) `ronda9/GUION-BETA-Y-D1-REMOTO.md` (proyecto y D1 de prueba, `verificar-api.mjs` y recorrido D1–D11); ninguno de sus pasos se ha ejecutado.
- [ ] Ver `ronda11/pruebas-manuales.md` (M1–M32; sustituye a las anteriores), en especial Safari/Firefox, tema oscuro, texto y zoom reales y la verificación del ZIP en macOS.
- [ ] Extender la dirección visual (`ronda11/SISTEMA-VISUAL.md`) al resto de pantallas tras revisar la del editor. Incluye probar `batch`/`RETURNING` y la migración 0007 en **D1 remoto** (M21, M22) (teclado móvil real, lector de pantalla real, zoom real, Safari y Firefox, email real, conflicto entre dos dispositivos reales, zona horaria, TradingView, carga de la SEC). Ninguna se ha ejecutado todavía.
- [ ] Pruebas de uso con personas: seguir `PRUEBAS-DE-USO.md` (demo `demo/index.html`, o `bash scripts/local/arrancar.sh`) y anotar dónde dudan.

## Ronda 13 (pendiente de accesos y decisiones)
- Ejecutar la carga real de la SEC y comprobar que `nightly.yml` funciona (la interfaz solo dirá «SEC» cuando el cargador escriba `origen = sec`): ver `ronda13/DATOS.md` y `ronda10/BLOQUEOS.md`.
- Aplicar la migración `0008_radar_escenarios.sql` en la D1 real y validar radar, escenarios y aislamiento entre cuentas (M46, M47).
- Decidir: responsables editoriales y proceso de revisión (`ronda13/EDITORIAL.md`); reparto gratuito/pago.

## Ronda 14 (pendiente de accesos y decisiones)
- Ejecutar la carga real de la SEC con la lógica nueva (fuente/fecha por fila) y medir cuántas métricas quedan «sin datos»; aplicar migraciones 0008 y 0009 en la D1 real (M56, M57).
- Sustituir el caso editorial ficticio por contenido real verificado, con responsable editorial (M58).
- Probar el recorrido en un móvil real (M50, M51) y compartir el artefacto de la demo con Javier (menú «Compartir» del artefacto).
- Diagnosticar los fallos intermitentes de `testE` (ronda 13) y `testF` (ronda 14) en las pasadas completas.

## Ronda 15 (pendiente de accesos y decisiones)
- Prueba con **cinco principiantes** en móvil (`ronda15/PRUEBA-CON-USUARIOS.md`, M59): es la única forma de saber si se entiende.
- Cargar mercado real (capitalización, importe negociado) y calibrar los umbrales de la nota antes de activarla con datos reales (M64); la carga SEC con la lógica nueva (M63).
- Probar con dos cuentas reales y red lenta (M60), la D1 real con migraciones 0008–0010 y restauración (M66).
- Diagnosticar los fallos intermitentes de `testE` (R13), `testF` (R14) y la carrera del historial de la ficha.

## Ronda 16 (pendiente de accesos y decisiones)
- Prueba con cinco principiantes (`ronda16/PRUEBA-CON-USUARIOS.md`) y entorno privado con persistencia para «mañana, cierra y vuelve».
- D1 real con migraciones 0008–0011 y restauración (M70); datos de mercado reales y calibración antes de habilitar la nota (M71).
- Exposición entre cuentas de una nota manipulada con una D1 real (M69); móvil físico, lector de pantalla y tema oscuro (M67, M72).

## Ronda 17 (pendiente de accesos y decisiones)
- Aprobación visual por quien diseñó la maqueta (M77); lectura contextual en el creador con retorno al mismo paso (no hecha).
- Prueba con cinco principiantes sobre «crear, entender y seguir» (M79) y entorno privado con persistencia para «mañana, cierra y vuelve».
- D1 de prueba aislada con filas sin fuente, fechas inválidas y mezcla de orígenes (M78); datos de mercado reales y calibración antes de habilitar la nota.
- Dispositivos reales: texto al 200 %, lector de pantalla y contraste del tema carbón (M73–M76).
- Extender «portafolio» al resto del texto si se aprueba el cambio de término.

## Ronda 18 (pendiente de accesos y decisiones)
- Aprobación visual por quien diseñó la maqueta (M77) y la lectura contextual con retorno al mismo paso (no hecha).
- Prueba con cinco principiantes sobre «crear, entender y seguir» (M79) y entorno privado con persistencia para «mañana, cierra y vuelve».
- Dispositivos reales: pulgar, texto al 200 % real, lector de pantalla, contraste y foco (M73–M76); D1 de prueba aislada (M78).
- Confirmar con tráfico real que las dos carreras corregidas eran la causa de los intermitentes antiguos.
- Extender «portafolio» al resto del texto si se aprueba el cambio de término.

## Tras la ronda 19
- ⬜ **Prueba con cinco principiantes** (`ronda19/PRUEBA-CON-USUARIOS.md`): no realizada; «cerrar y volver» exige persistencia verificada.
- ⬜ Comprobaciones manuales M85–M90 (`ronda19/pruebas-manuales.md`): móvil físico a 320 px, lector de pantalla, movimiento reducido.
- ⬜ Investigar la causa de dos fallos intermitentes no demostrados (`testK` goto abortado; `testO` sin salir del proceso).

## Tras la ronda 20
- ⬜ **Prueba con cinco principiantes** (`ronda20/PRUEBA-CON-USUARIOS.md`, ajustada): no realizada; es la siguiente evidencia relevante.
- ⬜ M85–M93 (`ronda20/pruebas-manuales.md`; M86 reformulada).
- ⬜ Causa de `testK` (goto abortado) y `testO` (sin salir): no reproducidas, sin demostrar.

## Tras la ronda 21
- ⬜ **Prueba con cinco principiantes** (`ronda21/PRUEBA-CON-USUARIOS.md`): no realizada; «cerrar y volver al día siguiente» exige persistencia verificada.
- ⬜ M94–M100 (`ronda21/pruebas-manuales.md`) y las anteriores M85–M93.
- ⬜ Probar el registro de una revisión en la demo; comprobar la migración 0012 en una D1 remota con copia.
- ⬜ Ideas generales sin escenario (el modelo exige ticker y propuesta); estados «guardando» y «error» de guardado a fondo.

## Tras la ronda 22
- ⬜ **Piloto con cinco principiantes en dos contactos** (`ronda22/PRUEBA-CON-USUARIOS.md`): no realizado; es lo siguiente.
- ⬜ M101–M105 (`ronda22/pruebas-manuales.md`) y las anteriores; M96 (correo y D1 reales) queda para una fase autorizada posterior.
- ⬜ Probar K9 con dos clientes reales simultáneos; sesión caducada con el formulario de guardar en el Cuaderno ya escrito.
- ⬜ Causa de `testK` (hipótesis principal, no demostrada) y de `testP` (no cerrada).
- **Capacidades nuevas, para después:** ideas generales sin escenario, ampliaciones del laboratorio, cobros, integraciones, datos reales.

## Tras la ronda 23
- ⬜ **Piloto con cinco principiantes en dos contactos** (`ronda24/PRUEBA-CON-USUARIOS.md` (antes ronda23), con dos preguntas abiertas al cierre): no realizado; es lo siguiente.
- ⬜ M102 con una caducidad real y en un dispositivo, M106 y M107 (`ronda23/pruebas-manuales.md`) y las anteriores.
- ⬜ El formulario de «guardar en el Cuaderno» no persiste su borrador (solo el de revisión); un envío incierto pendiente se pierde si caduca la sesión.
- ⬜ K9 con dos clientes reales simultáneos; causa de `testP`/primera carga lenta (mitigada, no demostrada).

## Tras la ronda 24 (preparación del piloto)
- ⬜ **Verificación previa en el dispositivo previsto** (`ronda24/VERIFICACION-PREVIA-DISPOSITIVO.md`): sin rellenar.
- ⬜ **Piloto con cinco principiantes** (`ronda24/PRUEBA-CON-USUARIOS.md`, registro vacío): no realizado.
- ⬜ **Antes de una beta pública (no del piloto):** conservar el intento de revisión pendiente completo (clave, escenario, carga y contexto de cuenta) hasta conocer su resultado; restaurarlo solo para la cuenta autorizada; reconciliar con el servidor antes de otra escritura; probar cierre/recarga y cambio de cuenta. Hoy `limpiarSesionLab()` borra `revIntento` y puede duplicarse una anotación.

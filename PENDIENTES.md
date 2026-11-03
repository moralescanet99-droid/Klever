# Tareas pendientes (lo que solo puedes hacer tú)

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
- [ ] Bases creadas con versiones anteriores: aplicar `migrations/0002`, `0003`, `0004`, `0005`, `0006` y `0007` en orden (en una base nueva basta `schema.sql`)
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

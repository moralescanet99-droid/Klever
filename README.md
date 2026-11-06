# Klever · Portafolios (beta gratuita)

Web a coste cero: Cloudflare Pages (+ Functions) + D1; fundamentales desde SEC EDGAR vía GitHub Actions; precios solo con widgets de TradingView (no se guardan).

## Puesta en marcha
```bash
npm i -g wrangler
wrangler d1 create klever                 # copia database_id en wrangler.toml
wrangler d1 execute klever --remote --file=schema.sql
SEC_USER_AGENT="Klever tu@correo.com" node scripts/fetch_fundamentals.mjs > build/seed.sql
wrangler d1 execute klever --remote --file=build/seed.sql
wrangler pages deploy                     # o conecta el repo a Pages
```
Local: `wrangler d1 execute klever --local --file=schema.sql` y `wrangler pages dev`.

Secrets de GitHub para `nightly.yml`: `SEC_USER_AGENT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Estado (plan, semanas 1-2)
- [x] Esquema D1, universo de 125 activos (105 acciones de EE. UU. y 20 ETFs), tarea nocturna SEC
- [x] Registro, portafolios por plantilla, composición, sectores, ROIC medio, mini gráficos TradingView
- [x] Semana 3: ranking de ideas (5 criterios), ficha de empresa, screener de TradingView aparte
- [x] Semana 4: legal.html (borrador), portafolios públicos con tesis, demo en data/demo.sql
- [x] Ronda 11: avisos sin solapes, editor con identidad propia (composición con datos reales, ROIC secundario), verificación de entregas ZIP. Ver `ronda11/LEEME.md` y `ronda11/SISTEMA-VISUAL.md`
- [x] Ronda 10: avisos en zona reservada, resumen de ROIC plegable, móvil más compacto, pruebas de acceso; validación remota bloqueada (guion y requisitos listos). Ver `ronda10/LEEME.md`
- [x] Ronda 9: `GET /api/public/:id` en una instantánea, ejecutor que comprueba la demo, guion de beta y D1 remoto (sin ejecutar). Ver `ronda9/LEEME.md`
- [x] Ronda 8: respuesta de guardado con la revisión de su propia escritura, lecturas coherentes, ejecutor de pruebas fiable, Node ≥ 22.13 y migración 0007 verificada sobre una base antigua. Ver `ronda8/LEEME.md`
- [x] Ronda 7: conflicto coherente (elegir la local no escribe), guardado en una sola operación transaccional con revisión atómica (migración 0007), E16a corregida, diálogo móvil y proyecto repetible desde cero. Ver `ronda7/LEEME.md` y `LEEME-PRUEBAS.md`
- [x] Ronda 6: aviso persistente al abrir el enlace en otro navegador, «Cambios locales pendientes de guardar en tu cuenta», conflicto con las dos versiones (409 en el servidor), «N superadas · M sin datos», «Guardar y actualizar publicación», versión para pruebas de uso. Ver `ronda6/LEEME.md` y `PRUEBAS-DE-USO.md`
- [x] Ronda 5: «Mis carteras» con lista primero, botones desactivados coherentes, pública con edición inválida sin despublicar, estado de persistencia explícito, resumen simplificado, empresas en móvil, ficha. Ver `ronda5/LEEME.md`
- [x] Ronda 4: reglas únicas de guardar/publicar, resumen con etiquetas exactas, cabecera y barra móviles compactas, orden en una columna, empresas con encabezados, ficha móvil. Ver `ronda4/LEEME.md`
- [x] Rediseño completo (3.ª ronda): portada, editor como espacio de trabajo, móvil específico, sistema visual, acceso y ficha. Ver `rediseno/LEEME.md`
- [x] Revisión de diseño (2.ª ronda): propuesta de valor, prueba sin registro con borrador, guardar separado de publicar, cifras con unidades, ideas reducidas con buscador, accesibilidad
- [x] Consentimiento de cookies de TradingView (los widgets solo se cargan si se acepta, y se pide donde se usan), casilla legal en el registro, último acceso por sesión y `scripts/metrics.sql`
- [ ] Analítica: activar Cloudflare Web Analytics en el panel de Pages (sin código)
- [ ] Bases existentes: `wrangler d1 execute klever --remote --file=migrations/0002_tesis.sql`

Pendiente antes de lanzar: revisar secciones 3 y 4 de los términos de TradingView; ROIC es una aproximación.

Pendientes tuyos: ver `PENDIENTES.md`.

**Memoria del proyecto (contexto, decisiones, estado, cómo retomar): `procesos-klever/README.md`.**

## Acceso por enlace mágico (Brevo)
1. Cuenta gratuita en Brevo → verifica un correo remitente → crea una clave API.
2. `wrangler pages secret put BREVO_API_KEY` y `wrangler pages secret put MAIL_FROM` (el remitente verificado).
3. Bases existentes: `wrangler d1 execute klever --remote --file=migrations/0003_magic_link.sql`.
4. Local: en `.dev.vars` pon `DEV_RETURN_LINK=1` para que el enlace se muestre en pantalla en vez de enviarse. **No lo uses en producción.**

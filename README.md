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
- [x] Revisión de diseño (2.ª ronda): propuesta de valor, prueba sin registro con borrador, guardar separado de publicar, cifras con unidades, ideas reducidas con buscador, accesibilidad
- [x] Consentimiento de cookies de TradingView (los widgets solo se cargan si se acepta, y se pide donde se usan), casilla legal en el registro, último acceso por sesión y `scripts/metrics.sql`
- [ ] Analítica: activar Cloudflare Web Analytics en el panel de Pages (sin código)
- [ ] Bases existentes: `wrangler d1 execute klever --remote --file=migrations/0002_tesis.sql`

Pendiente antes de lanzar: revisar secciones 3 y 4 de los términos de TradingView; ROIC es una aproximación.

Pendientes tuyos: ver `PENDIENTES.md`.

## Acceso por enlace mágico (Brevo)
1. Cuenta gratuita en Brevo → verifica un correo remitente → crea una clave API.
2. `wrangler pages secret put BREVO_API_KEY` y `wrangler pages secret put MAIL_FROM` (el remitente verificado).
3. Bases existentes: `wrangler d1 execute klever --remote --file=migrations/0003_magic_link.sql`.
4. Local: en `.dev.vars` pon `DEV_RETURN_LINK=1` para que el enlace se muestre en pantalla en vez de enviarse. **No lo uses en producción.**

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
- [x] Esquema D1, universo inicial (26 activos), tarea nocturna SEC
- [x] Registro, portafolios por plantilla, composición, sectores, ROIC medio, mini gráficos TradingView
- [ ] Semana 3: screener/ideas, ficha de empresa
- [ ] Semana 4: textos legales completos, analítica, portafolios públicos

Pendiente antes de lanzar: revisar secciones 3 y 4 de los términos de TradingView; ROIC es una aproximación.

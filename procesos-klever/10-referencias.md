# 10 · Referencias

## Repositorio y rama
- Repositorio: `moralescanet99-droid/klever` (GitHub).
- Rama de trabajo: `ccr-b652a7eb-uukhdy`. Se desarrolla y publica solo ahí. No se ha creado ningún pull request (no se ha pedido).
- Sesión de Claude Code: https://claude.ai/code/session_019RMtEMUMCDkBj91GhEPxiz

## Documentos y artefactos de Claude
- **Plan original** (Claude Doc del usuario): https://claude.ai/artifact/9GuysG2gDUBvFKaaw3cje3 · título «Plan web de portafolios (beta gratuita)».
- **Demo interactiva privada** (artefacto; datos inventados): https://claude.ai/artifact/6MEdsYjnZaUPwXtUxriEiD · solo la abre el propietario; se actualiza publicando el mismo archivo con esa URL.
- **Demo pública autónoma:** `demo/index.html` (pendiente de que el usuario la publique con `wrangler pages deploy demo --project-name klever-demo`; ver `demo/LEEME.md`).

## Informes e instrucciones dentro del repositorio
| Archivo | Contenido |
|---|---|
| `README.md`, `PENDIENTES.md` | Puesta en marcha y tareas del usuario |
| `rediseno/LEEME.md` | Informe de la ronda 3 (rediseño) |
| `ronda4/LEEME.md` | Informe de la ronda 4: regla de guardar/publicar, lo probado y lo pendiente |
| `revision-chatgpt/INSTRUCCIONES_PARA_CHATGPT.md`, `…/ronda-3/…`, `…/ronda-4/…`, `…/ronda-5/…` | Textos para ChatGPT de cada ronda |
| `ronda5/LEEME.md`, `ronda5/pruebas-manuales.md` | Informe de la ronda 5 con tabla de evidencias y pruebas manuales pendientes |
| `ronda11/LEEME.md`, `ronda11/SISTEMA-VISUAL.md`, `ronda11/CAPTURAS.md`, `ronda11/pruebas-manuales.md`, `ronda11/mutacion-h1c.txt` | Informe de la ronda 11, sistema visual, comparativa antes/después y mutación que valida H1c |
| `scripts/entrega/*.sh`, `tests/ronda11/test-zip.sh` | Crear y verificar entregas ZIP (qué se verifica y qué exige repositorio) |
| `ronda10/LEEME.md`, `ronda10/BLOQUEOS.md`, `ronda10/GUION-VALIDACION-REMOTA.md`, `ronda10/CAPTURAS.md`, `ronda10/pruebas-manuales.md` | Informe de la ronda 10, requisitos para la validación real, guion remoto actualizado y comparativa visual antes/después |
| `ronda9/LEEME.md`, `ronda9/GUION-BETA-Y-D1-REMOTO.md`, `ronda9/pruebas-manuales.md`, `ronda9/antes-*.txt` | Informe de la ronda 9, guion de beta y D1 remoto (sin ejecutar) y evidencias «falla antes» |
| `ronda8/LEEME.md`, `ronda8/EVIDENCIAS.md`, `ronda8/pruebas-manuales.md`, `ronda8/antes-*.txt` | Informe de la ronda 8 (falla antes / pasa después, local / D1 remoto / pendiente) |
| `ronda7/LEEME.md`, `ronda7/EVIDENCIAS.md`, `ronda7/pruebas-manuales.md`, `LEEME-PRUEBAS.md` | Informe de la ronda 7 (defectos reales frente a demo, guardado atómico, evidencias presentes/ausentes) y cómo repetirlo desde cero |
| `ronda6/LEEME.md`, `ronda6/pruebas-manuales.md` | Informe de la ronda 6 (siete flujos con esperado/observado) y pruebas manuales pendientes |
| `PRUEBAS-DE-USO.md`, `scripts/local/arrancar.sh`, `data/seed-prueba.sql` | Versión para pruebas de uso: cómo abrirla, guion de tareas y datos de prueba |
| `demo/LEEME.md` | Cómo publicar la demo |
| `tests/ronda4/README.md` | Cómo reproducir las 130 comprobaciones y las capturas |

## Material que NO está en el repositorio (pesado; se regenera)
Capturas y zips: `rediseno/antes|despues`, `ronda4/antes|despues`, `ronda4-capturas.zip`, `rediseno-klever-antes-despues.zip`, `revision-chatgpt-ronda-*.zip`. Están en `.gitignore`. Se generan con `tests/ronda4/shots4.cjs`; los paquetes de ChatGPT se arman con las capturas y su `INSTRUCCIONES_PARA_CHATGPT.md`.

## Fuentes técnicas citadas en el plan
- SEC EDGAR, datos gratuitos y límite de 10 peticiones/s: https://dev.to/pickuma/the-sec-edgar-api-free-fundamental-data-for-developers-o2a · https://dev.to/odeeb/the-sec-edgar-api-a-practical-guide-to-free-filing-data-in-python-15b
- TradingView: términos https://in.tradingview.com/policies · widgets https://in.tradingview.com/publishing-tools
- Cloudflare: Workers https://developers.cloudflare.com/workers/about/limits · D1 https://developers.cloudflare.com/d1/platform/pricing/ · Pages https://developers.cloudflare.com/pages/platform/limits
- Precios de datos: Tiingo frente a Massive y planes de Financial Modeling Prep (no usados en la beta).

## Cuentas externas necesarias (las gestiona el usuario)
Cloudflare (Pages, D1), GitHub Actions (secretos `SEC_USER_AGENT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), Brevo (`BREVO_API_KEY`, `MAIL_FROM`). **Nunca guardar claves ni correos personales en el repositorio.**

- Ronda 13: informe `ronda13/LEEME.md`; cálculos `ronda13/CALCULOS.md`; auditoría de datos `ronda13/DATOS.md`; diseño editorial `ronda13/EDITORIAL.md`; plan `ronda13/PLAN-POR-FASES.md`; capturas `ronda13/capturas/`.

- Ronda 14: informe `ronda14/LEEME.md`; antes/después `ronda14/ANTES-Y-DESPUES.md`; procedencia `ronda14/PROCEDENCIA.md`; abrir en móvil `ronda14/ABRIR-EN-MOVIL.md`; capturas `ronda14/capturas/`.

- Ronda 15: informe `ronda15/LEEME.md`; antes/después `ronda15/ANTES-Y-DESPUES.md`; casos `ronda15/TABLA-CASOS.md`; prueba con usuarios (pendiente) `ronda15/PRUEBA-CON-USUARIOS.md`; abrir en móvil `ronda15/ABRIR-EN-MOVIL.md`; capturas `ronda15/capturas/`.

- Ronda 16: informe `ronda16/LEEME.md`; antes/después `ronda16/ANTES-Y-DESPUES.md`; tabla de la nota `ronda16/TABLA-NOTA.md`; prueba con usuarios (pendiente) `ronda16/PRUEBA-CON-USUARIOS.md`; capturas `ronda16/capturas/`.

- Ronda 17: informe `ronda17/LEEME.md`; antes/después `ronda17/ANTES-Y-DESPUES.md`; guía única `ronda17/ABRIR-EN-MOVIL.md`; maqueta aprobada `ronda17/referencia/maqueta-crea-tu-portafolio.png`; capturas `ronda17/capturas/`; repetición de intermitentes `ronda17/intermitentes.txt`.

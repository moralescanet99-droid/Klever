#!/usr/bin/env bash
# Verifica una entrega ZIP SIN repositorio: huellas, archivos prohibidos, secretos evidentes y las pruebas del servidor que no necesitan dependencias.
# Uso: bash scripts/entrega/verificar-zip.sh entrega.zip       (requiere: bash, unzip, node >= 22.13; sha256sum o shasum)
# Distingue lo VERIFICADO desde el ZIP de lo que exige un repositorio o dependencias. No declara verificado el historial de commits.
set -uo pipefail
ZIP="${1:?Uso: verificar-zip.sh entrega.zip}"; [ -f "$ZIP" ] || { echo "No existe $ZIP" >&2; exit 2; }
D="$(mktemp -d)"; trap 'rm -rf "$D"' EXIT; FALLOS=0
ok() { echo "OK    $*"; }; mal() { echo "FALLA $*"; FALLOS=$((FALLOS + 1)); }
unzip -q "$ZIP" -d "$D" || { echo "No se pudo descomprimir"; exit 2; }
cd "$D"
if [ -f MANIFEST-SHA256.txt ]; then
  if command -v sha256sum >/dev/null 2>&1; then sha256sum -c --quiet MANIFEST-SHA256.txt >/dev/null 2>&1; else shasum -a 256 -c --quiet MANIFEST-SHA256.txt >/dev/null 2>&1; fi && ok "huellas: los $(wc -l < MANIFEST-SHA256.txt | tr -d ' ') archivos coinciden con MANIFEST-SHA256.txt" || mal "huellas: algún archivo no coincide con MANIFEST-SHA256.txt (modificado o dañado)"
  extra="$(find . -type f ! -name MANIFEST-SHA256.txt | LC_ALL=C sort | sed 's#^\./##' | grep -vxFf <(sed 's#^[0-9a-f]*  *\./##' MANIFEST-SHA256.txt) || true)"
  [ -z "$extra" ] && ok "no hay archivos fuera del manifiesto" || mal "archivos fuera del manifiesto: $(echo "$extra" | head -3 | tr '\n' ' ')"
else mal "falta MANIFEST-SHA256.txt (no se puede comprobar la integridad)"; fi
[ -f ENTREGA.json ] && ok "ENTREGA.json: commit $(sed -n 's/.*"commit": "\([0-9a-f]*\)".*/\1/p' ENTREGA.json | cut -c1-12), $(sed -n 's/.*"fecha_utc": "\(.*\)",/\1/p' ENTREGA.json)" || mal "falta ENTREGA.json (no se sabe de qué commit procede)"
prohibido="$(find . \( -name .dev.vars -o -name node_modules -o -name .wrangler -o -name '*.pem' -o -name '.env' \) -prune -print | head -3)"
[ -z "$prohibido" ] && ok "sin .dev.vars, .env, claves ni dependencias instaladas" || mal "archivos que no deben ir en una entrega: $prohibido"
grep -q 'REEMPLAZAR_CON_ID_DE_D1' wrangler.toml && ok "wrangler.toml conserva el marcador del database_id" || mal "wrangler.toml no tiene el marcador del database_id"
secretos="$(grep -rIlE 'xkeysib-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|BREVO_API_KEY=[A-Za-z0-9]{20,}|CLOUDFLARE_API_TOKEN=[A-Za-z0-9_-]{20,}' . 2>/dev/null | head -3)"
[ -z "$secretos" ] && ok "sin secretos evidentes en el contenido (patrones de claves conocidos)" || mal "posibles secretos en: $secretos"
if node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=13)?0:1)' 2>/dev/null; then
  for t in tests/ronda7/unit-servidor.mjs tests/ronda8/unit-carreras.mjs tests/ronda8/unit-migracion.mjs tests/ronda10/unit-acceso.mjs; do
    [ -f "$t" ] || continue; salida="$(RONDA="$D/.res" node "$t" 2>&1)"; r="$(echo "$salida" | grep -E 'RESULTADO' | tail -1)"; [ -n "$r" ] && echo "$salida" | grep -q ' 0 fallos' && ok "$t → $r" || mal "$t → ${r:-sin resultado}"
  done
else mal "Node $(node -v 2>/dev/null || echo ausente): se necesita 22.13 o superior para las pruebas del servidor"; fi
echo
echo "VERIFICADO desde el ZIP: integridad por huellas, ausencia de archivos prohibidos y de secretos evidentes, marcador de wrangler.toml y las pruebas del servidor sobre SQLite real (sin dependencias)."
echo "NO verificable desde un ZIP (requiere el REPOSITORIO con su historial): que ningún commit anterior contuvo secretos o un database_id real, el historial de rondas y que ENTREGA.json corresponde al commit real. Un repositorio nuevo creado a partir del ZIP no acredita nada sobre el historial."
echo "NO verificado aquí (requiere «npm ci» + Playwright): la batería de navegador. Cloudflare D1 remoto y correo real: bloqueados (ronda10/BLOQUEOS.md)."
[ "$FALLOS" -eq 0 ] && { echo "RESULTADO: entrega ZIP coherente (0 problemas)"; exit 0; } || { echo "RESULTADO: $FALLOS problema(s) en la entrega ZIP"; exit 1; }

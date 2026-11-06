#!/usr/bin/env bash
# Crea una entrega ZIP VERIFICABLE a partir de un commit: el contenido de HEAD + ENTREGA.json (commit, fecha, rama) + MANIFEST-SHA256.txt (huella de cada archivo).
# Uso: bash scripts/entrega/crear-zip.sh salida.zip      (el árbol de trabajo debe estar limpio: el ZIP corresponde a un commit exacto)
# Un ZIP NO contiene .git: el historial de commits solo se puede verificar con el repositorio (ver LEEME-PRUEBAS.md, «Verificar una entrega ZIP»).
set -euo pipefail
cd "$(dirname "$0")/../.."
SALIDA="${1:?Uso: crear-zip.sh salida.zip}"; mkdir -p "$(dirname "$SALIDA")"; SALIDA="$(cd "$(dirname "$SALIDA")" && pwd)/$(basename "$SALIDA")"
[ "${ENTREGA_SIN_COMPROBAR_ARBOL:-0}" = 1 ] || [ -z "$(git status --porcelain)" ] || { echo "El árbol de trabajo tiene cambios sin commitear: haz commit antes (el ZIP debe corresponder a un commit)." >&2; exit 1; }
sha() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$@"; else shasum -a 256 "$@"; fi; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
git archive HEAD | tar -x -C "$TMP"
printf '{\n  "commit": "%s",\n  "fecha_utc": "%s",\n  "rama": "%s",\n  "contenido": "git archive del commit indicado (sin .git, node_modules, .wrangler ni .dev.vars)",\n  "verificar": "bash scripts/entrega/verificar-zip.sh <este.zip>"\n}\n' "$(git rev-parse HEAD)" "$(date -u '+%Y-%m-%d %H:%M UTC')" "$(git rev-parse --abbrev-ref HEAD)" > "$TMP/ENTREGA.json"
( cd "$TMP" && find . -type f ! -name MANIFEST-SHA256.txt | LC_ALL=C sort | while IFS= read -r f; do sha "$f"; done > MANIFEST-SHA256.txt )
rm -f "$SALIDA"; ( cd "$TMP" && zip -qr "$SALIDA" . )
echo "ZIP creado: $SALIDA  (commit $(git rev-parse --short HEAD), $(wc -l < "$TMP/MANIFEST-SHA256.txt" | tr -d ' ') archivos con huella)"

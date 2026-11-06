#!/usr/bin/env bash
# Comprueba que el código del piloto es EXACTAMENTE la versión declarada en VERSION-PILOTO.txt (hashes de git de public/, functions/, migrations/ y schema.sql)
# y que el árbol de trabajo no tiene cambios sin commitear en ellos. Sale con código 1 si algo difiere.
set -euo pipefail
cd "$(dirname "$0")/../.."
V=scripts/piloto/VERSION-PILOTO.txt; fallo=0; VER="$(grep '^version:' "$V" | awk '{print $2}')"
esp() { grep "^$1:" "$V" | awk '{print $2}'; }
cmp1() { local nombre="$1" esperado="$2" real="$3"
  if [ "$esperado" = "$real" ]; then echo "  ✔ $nombre"; else echo "  ✘ $nombre: esperado ${esperado:0:10}, hay ${real:0:10}"; fallo=1; fi; }
cmp1 "public/"     "$(esp tree-public)"     "$(git rev-parse HEAD:public)"
cmp1 "functions/"  "$(esp tree-functions)"  "$(git rev-parse HEAD:functions)"
cmp1 "migrations/" "$(esp tree-migrations)" "$(git rev-parse HEAD:migrations)"
cmp1 "schema.sql"  "$(esp blob-schema)"     "$(git rev-parse HEAD:schema.sql)"
if [ -n "$(git status --porcelain -- public functions migrations schema.sql wrangler.toml)" ]; then echo "  ✘ hay cambios sin commitear en el código"; fallo=1; else echo "  ✔ sin cambios locales en el código"; fi
[ -e .dev.vars ] && { echo "  ✘ existe .dev.vars (no debe existir en el piloto)"; fallo=1; } || echo "  ✔ sin .dev.vars"
[ "$fallo" = 0 ] && echo "VERSIÓN $VER CORRECTA" || { echo "LA VERSIÓN NO ES $VER: no abras el piloto así."; exit 1; }

#!/usr/bin/env bash
# Ejecuta TODAS las baterías con un servidor LIMPIO entre cada una (comparten base de datos local y se contaminarían).
# Requisitos: «npm ci» y «npx playwright install chromium» hechos. Uso: bash tests/run-all.sh
# Deja el resultado literal y la versión del código en $RONDA/resultado-ejecucion.txt (RONDA=ronda7 por defecto).
set -uo pipefail
cd "$(dirname "$0")/.."
export RONDA="${RONDA:-ronda7}"; mkdir -p "$RONDA"
SALIDA="$RONDA/resultado-ejecucion.txt"
{
  echo "Ejecución: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo "Código: commit $(git rev-parse HEAD 2>/dev/null || echo desconocido); árbol de trabajo $( [ -z "$(git status --porcelain -- . ':!ronda*' 2>/dev/null)" ] && echo limpio || echo 'CON CAMBIOS sin commitear')"
  echo "Node $(node -v) · wrangler $(./node_modules/.bin/wrangler --version 2>/dev/null | tail -1) · playwright $(node -p "require('playwright/package.json').version")"
  echo
} | tee "$SALIDA"
for t in tests/ronda5/testA tests/ronda5/testB tests/ronda5/testC tests/ronda5/testD tests/ronda5/testE tests/ronda7/testF; do
  bash scripts/local/servidor.sh start >/dev/null 2>&1 || { echo "No arrancó el servidor para $t" | tee -a "$SALIDA"; continue; }
  echo "=== $(basename "$t") ===" | tee -a "$SALIDA"
  salida_t="$(timeout 900 node "$t.cjs" 2>&1)"
  echo "$salida_t" | grep -E "^FALLA|RESULTADO|^- |Timeout" | tee -a "$SALIDA"
  echo "$salida_t" | grep -q "RESULTADO" || { echo "FALLA: la batería terminó SIN resultado (error de ejecución): $(echo "$salida_t" | grep -m1 -E 'Error|rror:')" | tee -a "$SALIDA"; }
done
bash scripts/local/servidor.sh stop
# Servidor real (manejadores + SQLite): atomicidad, revisión, sin guardados parciales
echo "=== unit-servidor ===" | tee -a "$SALIDA"
node tests/ronda7/unit-servidor.mjs 2>&1 | grep -E "^FALLA|RESULTADO|^- " | tee -a "$SALIDA"
# Demostración HTML (NO equivale al servidor real: datos en memoria, sin persistencia)
echo "=== demo (demotest) ===" | tee -a "$SALIDA"
mkdir -p .wrangler
python3 -m http.server 8790 --directory demo >/dev/null 2>&1 &
echo $! > .wrangler/demo.pid
sleep 1
DEMO_URL="http://localhost:8790/" timeout 300 node tests/ronda5/demotest.cjs 2>&1 | grep -E "^FALLA|DEMO OK|HAY FALLOS|Timeout" | tee -a "$SALIDA"
kill "$(cat .wrangler/demo.pid)" 2>/dev/null || true

#!/usr/bin/env bash
# Ronda 18: repite las baterías que han fallado de forma intermitente (testE de la ronda 13 y testF de la ronda 14, más la del historial de la ficha, testC) N veces con un servidor
# LIMPIO, SIN latencia y CON latencia determinista (LATENCIA_MS, por defecto 300 ms en las respuestas que reconstruyen cartera y sesión), con TRAZA=1: orden de navegación,
# respuestas y errores por repetición en ronda18/trazas/. Registra hora, duración, código y líneas FALLA por repetición en ronda18/intermitentes.txt.
# Uso: bash tests/ronda18/repetir-intermitentes.sh [N=2] [LATENCIA_MS=300]
cd "$(dirname "$0")/../.."; N="${1:-2}"; LAT="${2:-300}"; export RONDA=ronda18 TRAZA=1; SAL="ronda18/intermitentes.txt"; mkdir -p ronda18; : > "$SAL"
for b in tests/ronda5/testE.cjs tests/ronda7/testF.cjs tests/ronda5/testC.cjs; do for l in 0 "$LAT"; do for i in $(seq 1 "$N"); do
  bash scripts/local/servidor.sh stop >/dev/null 2>&1; bash scripts/local/servidor.sh start >/dev/null 2>&1
  t0=$(date +%s); out="$(LATENCIA_MS=$l node "$b" 2>&1)"; cod=$?; t1=$(date +%s)
  echo "== $b · latencia ${l} ms · repetición $i/$N · $(date -u +%H:%M:%S)Z · $((t1 - t0)) s · código $cod" | tee -a "$SAL"
  echo "$out" | grep -E "RESULTADO|^FALLA|rror:|Timeout" | cut -c1-300 | tee -a "$SAL"
done; done; done
bash scripts/local/servidor.sh stop >/dev/null 2>&1

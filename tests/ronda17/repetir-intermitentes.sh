#!/usr/bin/env bash
# Ronda 17: repite una batería (por defecto las dos que han fallado de forma intermitente: testE de la ronda 13 y testF de la ronda 14) N veces con un servidor LIMPIO
# en cada repetición y registra, POR REPETICIÓN: hora, duración, código de salida, resumen y las líneas FALLA con su contexto. No diagnostica por sí sola: deja el rastro
# para comparar una repetición que falla con las que pasan. Uso: bash tests/ronda17/repetir-intermitentes.sh [N=3] [bateria ...]
cd "$(dirname "$0")/../.."; N="${1:-3}"; shift || true; BATERIAS="${*:-tests/ronda5/testE.cjs tests/ronda7/testF.cjs}"; SAL="ronda17/intermitentes.txt"; : > "$SAL"
for b in $BATERIAS; do for i in $(seq 1 "$N"); do
  bash scripts/local/servidor.sh stop >/dev/null 2>&1; bash scripts/local/servidor.sh start >/dev/null 2>&1
  t0=$(date +%s); out="$(node "$b" 2>&1)"; cod=$?; t1=$(date +%s)
  echo "== $b repetición $i/$N · $(date -u +%H:%M:%S)Z · ${t1}-${t0}=$((t1 - t0)) s · código $cod" | tee -a "$SAL"
  echo "$out" | grep -E "RESULTADO|^FALLA|rror:|Timeout" | cut -c1-300 | tee -a "$SAL"
done; done
bash scripts/local/servidor.sh stop >/dev/null 2>&1

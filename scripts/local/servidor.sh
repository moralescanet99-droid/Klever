#!/usr/bin/env bash
# Servidor local de PRUEBAS en segundo plano (D1 simulada + datos ficticios). Lo usan las pruebas automáticas.
# Uso: bash scripts/local/servidor.sh start|stop|reset      (PORT=8788 por defecto)
# No toca wrangler.toml ni crea .dev.vars. Todo el estado vive en .wrangler/ (ignorado por git).
# Dependencias del sistema: bash, curl, pgrep (Linux y macOS). No usa timeout ni setsid.
set -euo pipefail
cd "$(dirname "$0")/../.."
PORT="${PORT:-8788}"
ESTADO=".wrangler/pruebas-auto"; PID=".wrangler/servidor.pid"; LOG=".wrangler/servidor.log"
WR="./node_modules/.bin/wrangler"
[ -x "$WR" ] || { echo "Falta wrangler: ejecuta antes «npm ci»." >&2; exit 1; }
matar_arbol() { local h; for h in $(pgrep -P "$1" 2>/dev/null || true); do matar_arbol "$h"; done; kill "$1" 2>/dev/null || true; }
parar() {
  if [ -f "$PID" ]; then matar_arbol "$(cat "$PID")"; rm -f "$PID"; fi
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null "http://localhost:$PORT/" 2>/dev/null || return 0; sleep 1; done
  echo "El puerto $PORT sigue ocupado por otro programa: ciérralo o usa PORT=otro." >&2; exit 1
}
sembrar() {
  rm -rf .wrangler/pruebas-auto
  "$WR" d1 execute klever --local --persist-to "$ESTADO" --file=schema.sql           >/dev/null
  "$WR" d1 execute klever --local --persist-to "$ESTADO" --file=data/seed-prueba.sql >/dev/null
  "$WR" d1 execute klever --local --persist-to "$ESTADO" --file=data/demo.sql        >/dev/null
}
case "${1:-}" in
  stop) parar ;;
  reset) parar; sembrar; echo "Base de datos de prueba recreada." ;;
  start)
    parar; mkdir -p .wrangler; sembrar
    nohup "$WR" pages dev public --port "$PORT" --persist-to "$ESTADO" --binding DEV_RETURN_LINK=1 >"$LOG" 2>&1 &
    echo $! >"$PID"
    for _ in $(seq 1 90); do [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/api/ideas" || true)" = 200 ] && { echo "Servidor listo en http://localhost:$PORT"; exit 0; }; sleep 1; done
    echo "El servidor no arrancó; mira $LOG" >&2; matar_arbol "$(cat "$PID")"; rm -f "$PID"; exit 1 ;;
  *) echo "Uso: $0 start|stop|reset" >&2; exit 2 ;;
esac

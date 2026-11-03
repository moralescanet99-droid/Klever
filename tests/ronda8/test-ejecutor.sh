#!/usr/bin/env bash
# Prueba del PROPIO ejecutor (tests/run-all.sh): fallos y timeouts deliberados deben dar código ≠ 0 y limpiar los procesos.
# Uso: bash tests/ronda8/test-ejecutor.sh   (necesita «npm ci»; unos 2 minutos: arranca el servidor local en cada escenario)
set -uo pipefail
cd "$(dirname "$0")/../.."
export PORT="${PORT:-8799}" OMITIR_DEMO=1 UNIDAD=" "
OK=0; MAL=0; RES=()
chequear() { if [ "$2" = ok ]; then OK=$((OK + 1)); echo "OK    [$1] $3"; else MAL=$((MAL + 1)); echo "FALLA [$1] $3  [$4]"; fi; }
ejecutar() { # RONDA_TMP, resto = variables y bateria → deja CODIGO y SALIDA
  local d; d="$(mktemp -d)"; SALIDA="$d/salida.txt"; env "$@" RONDA="$d" bash tests/run-all.sh >"$SALIDA" 2>&1; CODIGO=$?; }
libre() { [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null)" = 000 ]; }
F=tests/ronda8/fixtures
ejecutar BATERIAS="$F/bateria-ok.cjs"; if [ $CODIGO -eq 0 ] && grep -q "todo correcto" "$SALIDA"; then chequear E1 ok "Control: una batería correcta termina con código 0"; else chequear E1 mal "Control: una batería correcta termina con código 0" "código $CODIGO"; fi
libre && chequear E1b ok "Tras terminar, el servidor de pruebas está parado" || chequear E1b mal "Tras terminar, el servidor de pruebas está parado" "el puerto sigue respondiendo"
ejecutar BATERIAS="$F/bateria-falla.cjs"; if [ $CODIGO -ne 0 ] && grep -q "tiene 1 fallos" "$SALIDA"; then chequear E2 ok "Una batería con «1 fallos» hace fallar el ejecutor (código $CODIGO)"; else chequear E2 mal "Una batería con «1 fallos» hace fallar el ejecutor" "código $CODIGO"; fi
ejecutar BATERIAS="$F/bateria-cae.cjs"; if [ $CODIGO -ne 0 ] && grep -q "SIN resultado" "$SALIDA"; then chequear E3 ok "Una batería que se cae sin resultado hace fallar el ejecutor (código $CODIGO)"; else chequear E3 mal "Una batería que se cae sin resultado hace fallar el ejecutor" "código $CODIGO"; fi
PF="$(mktemp)"; INI=$(date +%s); ejecutar BATERIAS="$F/bateria-cuelga.cjs" LIMITE_BATERIA=3 PIDFILE="$PF"; DUR=$(( $(date +%s) - INI ))
PID="$(cat "$PF" 2>/dev/null || echo 0)"
if [ $CODIGO -ne 0 ] && grep -q "superó el límite" "$SALIDA"; then chequear E4 ok "Un timeout hace fallar el ejecutor (código $CODIGO, ${DUR}s en total)"; else chequear E4 mal "Un timeout hace fallar el ejecutor" "código $CODIGO"; fi
if [ "$PID" != 0 ] && ! kill -0 "$PID" 2>/dev/null; then chequear E4b ok "El proceso colgado se mató (PID $PID ya no existe)"; else chequear E4b mal "El proceso colgado se mató" "PID $PID sigue vivo"; kill "$PID" 2>/dev/null; fi
libre && chequear E4c ok "Tras el timeout, el servidor de pruebas está parado" || chequear E4c mal "Tras el timeout, el servidor de pruebas está parado" "el puerto sigue respondiendo"
python3 -m http.server "$PORT" >/dev/null 2>&1 & OCUPA=$!; sleep 1
ejecutar BATERIAS="$F/bateria-ok.cjs"
if [ $CODIGO -ne 0 ] && grep -q "el servidor no arrancó" "$SALIDA"; then chequear E5 ok "Si el servidor no arranca (puerto ocupado), el ejecutor falla y no sigue en silencio (código $CODIGO)"; else chequear E5 mal "Si el servidor no arranca, el ejecutor falla" "código $CODIGO"; fi
kill -0 "$OCUPA" 2>/dev/null && chequear E5b ok "El ejecutor no mata un servidor ajeno que ocupa el puerto" || chequear E5b mal "El ejecutor no mata un servidor ajeno" "murió"
kill "$OCUPA" 2>/dev/null
echo; echo "RESULTADO: $OK correctas, $MAL fallos"; [ $MAL -eq 0 ]

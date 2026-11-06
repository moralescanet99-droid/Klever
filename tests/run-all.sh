#!/usr/bin/env bash
# Ejecuta TODAS las pruebas con un servidor LIMPIO entre baterías. SALE CON CÓDIGO ≠ 0 si ALGO falla:
# fallo de arranque, límite de tiempo, batería sin resultado, código de salida ≠ 0 o «N fallos» > 0. Limpia procesos con trap.
# Requisitos: Node >= 22.13, «npm ci», «npx playwright install chromium»; sistema: bash, curl, git, python3, pgrep (Linux o macOS).
# Variables: RONDA (carpeta de resultados, ronda15), LIMITE_BATERIA (segundos por batería, 900), PORT (8788),
#            BATERIAS / UNIDAD / DEMO_TEST / DEMO_DIR / DEMO_PORT / DEMO_SERVIDOR (para probar el propio ejecutor), OMITIR_DEMO=1.
set -uo pipefail
cd "$(dirname "$0")/.."
export RONDA="${RONDA:-ronda26}"; LIMITE="${LIMITE_BATERIA:-900}"
BATERIAS="${BATERIAS:-tests/ronda5/testA.cjs tests/ronda5/testB.cjs tests/ronda5/testC.cjs tests/ronda5/testD.cjs tests/ronda5/testE.cjs tests/ronda7/testF.cjs tests/ronda8/testG.cjs tests/ronda9/verificar-api.mjs tests/ronda10/testH.cjs tests/ronda11/testI.cjs tests/ronda12/testJ.cjs tests/ronda13/testK.cjs tests/ronda14/testL.cjs tests/ronda15/testM.cjs tests/ronda15/testN.cjs tests/ronda16/testO.cjs tests/ronda17/testP.cjs tests/ronda18/testQ.cjs tests/ronda19/testR.cjs tests/ronda21/testS.cjs tests/ronda22/testT.cjs tests/ronda23/testU.cjs tests/ronda26/testV.cjs tests/ronda18/paridad-demo.cjs}"
UNIDAD="${UNIDAD:-tests/ronda7/unit-servidor.mjs tests/ronda8/unit-carreras.mjs tests/ronda8/unit-migracion.mjs tests/ronda10/unit-acceso.mjs tests/ronda13/unit-calculos.mjs tests/ronda13/unit-r13.mjs tests/ronda14/unit-carga.mjs tests/ronda14/unit-r14.mjs tests/ronda15/unit-nota.mjs tests/ronda15/unit-comparador.mjs tests/ronda15/unit-almacen.mjs tests/ronda16/unit-escenarios16.mjs tests/ronda17/unit-procedencia17.mjs tests/ronda17/unit-guardada17.mjs tests/ronda18/unit-integridad18.mjs tests/ronda19/unit-redondeo19.mjs tests/ronda19/unit-revision19.mjs tests/ronda20/unit-causas20.mjs tests/ronda20/unit-cierre20.mjs tests/ronda21/unit-registro21.mjs tests/ronda21/unit-cuaderno21.mjs tests/ronda22/unit-cliente-revision22.mjs tests/ronda26/unit-senales26.mjs}"
PRUEBAS_SH="${PRUEBAS_SH:-tests/ronda11/test-zip.sh}"   # pruebas en shell (verificación de entregas ZIP)
SEGURIDAD="${SEGURIDAD:-tests/ronda10/seguridad-http.mjs}"   # contra un servidor SIN enlace de acceso en pantalla (como la beta pública)
mkdir -p "$RONDA" .wrangler; SALIDA="$RONDA/resultado-ejecucion.txt"; FALLOS=0
reg() { echo "$@" | tee -a "$SALIDA"; }
fallo() { FALLOS=$((FALLOS + 1)); reg "FALLA (ejecutor): $*"; }
matar_arbol() { local h; for h in $(pgrep -P "$1" 2>/dev/null || true); do matar_arbol "$h"; done; kill "$1" 2>/dev/null || true; }
limpiar() { bash scripts/local/servidor.sh stop >/dev/null 2>&1 || true; [ -f .wrangler/demo.pid ] && { matar_arbol "$(cat .wrangler/demo.pid)"; rm -f .wrangler/demo.pid; }; }
trap limpiar EXIT
trap 'fallo "interrumpido"; exit 130' INT TERM
# Ejecuta «node RUTA» con límite de tiempo portable (sin timeout). Deja SALIDA_T, CODIGO y TIEMPO_AGOTADO.
con_limite() {
  local seg="$1"; shift; CMD_LOG="$*"; local tmp; tmp="$(mktemp)"
  "$@" >"$tmp" 2>&1 & local pid=$!
  ( sleep "$seg"; : >"$tmp.agotado"; matar_arbol "$pid" ) & local vig=$!
  wait "$pid" 2>/dev/null; CODIGO=$?
  matar_arbol "$vig"; wait "$vig" 2>/dev/null
  SALIDA_T="$(cat "$tmp")"; if [ -f "$tmp.agotado" ]; then TIEMPO_AGOTADO=1; else TIEMPO_AGOTADO=0; fi; rm -f "$tmp" "$tmp.agotado"
}
guardar_log() { # nombre — registro ÍNTEGRO (también para la demo): comando, entorno, código, tiempo agotado y toda la salida
  # Registro ÍNTEGRO de cada batería (comando, entorno, código y toda su salida, incluida la de error), también cuando falla: LOGS_DIR (por defecto <ronda>/logs)
  mkdir -p "${LOGS_DIR:-$RONDA/logs}"; { echo "# comando: ${CMD_LOG:-?}"; echo "# entorno: Node $(node -v) · $(uname -sr) · $(date -u '+%Y-%m-%d %H:%M:%S UTC')"; echo "# código de salida: ${CODIGO:-?} · tiempo agotado: ${TIEMPO_AGOTADO:-0}"; echo; echo "$SALIDA_T"; } > "${LOGS_DIR:-$RONDA/logs}/$1.log"
}
evaluar() { # nombre
  guardar_log "$1"
  echo "$SALIDA_T" | grep -E "^FALLA|RESULTADO|^- |Timeout" | tee -a "$SALIDA"
  [ "$TIEMPO_AGOTADO" = 1 ] && fallo "$1 superó el límite de ${LIMITE}s (proceso detenido)"
  echo "$SALIDA_T" | grep -q "RESULTADO" || fallo "$1 terminó SIN resultado"
  echo "$SALIDA_T" | grep -q "^CIERRE FORZADO\|^CIERRE ANÓMALO" && fallo "$1: CIERRE ANÓMALO o forzado (el proceso no terminó solo; ver su registro)"
  [ "$TIEMPO_AGOTADO" = 0 ] && [ "$CODIGO" -ne 0 ] && fallo "$1 salió con código $CODIGO"
  local n; n="$(echo "$SALIDA_T" | sed -n 's/.*RESULTADO: [0-9]* correctas, \([0-9]*\) fallos.*/\1/p' | tail -1)"
  [ -n "$n" ] && [ "$n" -gt 0 ] && fallo "$1 tiene $n fallos"
  return 0
}
: >"$SALIDA"
{
  echo "Ejecución: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo "Código: commit $(git rev-parse HEAD 2>/dev/null || echo desconocido); árbol de trabajo $( [ -z "$(git status --porcelain -- . ':!ronda*' 2>/dev/null)" ] && echo limpio || echo 'CON CAMBIOS sin commitear')"
  echo "Node $(node -v) · wrangler $(./node_modules/.bin/wrangler --version 2>/dev/null | tail -1) · playwright $(node -p "require('playwright/package.json').version" 2>/dev/null)"
  echo
} | tee -a "$SALIDA"
node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=13)?0:1)' || { fallo "Node $(node -v) no sirve: se necesita 22.13 o superior (node:sqlite)"; exit 2; }
for t in $UNIDAD; do
  n="$(basename "$t" | sed 's/\.[^.]*$//')"; reg "=== $n ==="
  con_limite "$LIMITE" node "$t"; evaluar "$n"
done
for t in $PRUEBAS_SH; do
  n="$(basename "$t" | sed 's/\.[^.]*$//')"; reg "=== $n ==="
  con_limite "$LIMITE" bash "$t"; evaluar "$n"
done
for t in $BATERIAS; do
  n="$(basename "$t" | sed 's/\.[^.]*$//')"; reg "=== $n ==="
  if ! bash scripts/local/servidor.sh start >.wrangler/arranque.log 2>&1; then fallo "el servidor no arrancó para $n: $(tail -1 .wrangler/arranque.log)"; continue; fi
  con_limite "$LIMITE" node "$t"; evaluar "$n"
done
bash scripts/local/servidor.sh stop >/dev/null 2>&1 || fallo "no se pudo parar el servidor"
for t in $SEGURIDAD; do
  n="$(basename "$t" | sed 's/\.[^.]*$//')"; reg "=== $n (servidor sin enlace de acceso en pantalla) ==="
  if ! SIN_ENLACE_DEV=1 bash scripts/local/servidor.sh start >.wrangler/arranque.log 2>&1; then fallo "el servidor sin enlace de desarrollo no arrancó para $n: $(tail -1 .wrangler/arranque.log)"; continue; fi
  con_limite "$LIMITE" node "$t"; evaluar "$n"
  bash scripts/local/servidor.sh stop >/dev/null 2>&1 || fallo "no se pudo parar el servidor"
done
if [ "${OMITIR_DEMO:-0}" != 1 ]; then
  reg "=== demo (demotest) ==="
  DPORT="${DEMO_PORT:-8790}"; DDIR="${DEMO_DIR:-demo}"; DTEST="${DEMO_TEST:-tests/ronda5/demotest.cjs}"
  DSERV="${DEMO_SERVIDOR:-python3 -m http.server $DPORT --directory $DDIR}"
  if [ ! -f "$DDIR/index.html" ]; then
    fallo "no existe $DDIR/index.html: no hay demo que probar"
  elif curl -s -o /dev/null "http://localhost:$DPORT/" 2>/dev/null; then
    fallo "el puerto $DPORT de la demo ya está ocupado por otro programa: NO se ejecuta la prueba (probaría un servidor ajeno)"
  else
    $DSERV >.wrangler/demo.log 2>&1 &
    DPID=$!; echo "$DPID" > .wrangler/demo.pid; listo=0
    for _ in $(seq 1 20); do
      kill -0 "$DPID" 2>/dev/null || break
      curl -s -o /dev/null "http://localhost:$DPORT/" 2>/dev/null && { listo=1; break; }; sleep 1
    done
    if [ "$listo" != 1 ]; then
      fallo "el servidor de la demo no arrancó ($(tail -1 .wrangler/demo.log 2>/dev/null))"
    else
      DEMO_URL="http://localhost:$DPORT/" con_limite "$LIMITE" node "$DTEST"
      guardar_log demotest
      echo "$SALIDA_T" | grep -E "^FALLA|DEMO OK|HAY FALLOS" | tee -a "$SALIDA"
      [ "$TIEMPO_AGOTADO" = 1 ] && fallo "la demo superó el límite de ${LIMITE}s (proceso detenido)"
      [ "$TIEMPO_AGOTADO" = 0 ] && [ "$CODIGO" -ne 0 ] && fallo "la demo salió con código $CODIGO (aunque imprimiera «DEMO OK»)"
      echo "$SALIDA_T" | grep -q "DEMO OK" || fallo "la demo no terminó en «DEMO OK»"
      echo "$SALIDA_T" | grep -q "HAY FALLOS" && fallo "la demo informa «HAY FALLOS»"
      # ronda 22: el recorrido del Cuaderno en la demo (en memoria; no persiste tras recargar)
      DEMO_URL="http://localhost:$DPORT/" con_limite "$LIMITE" node tests/ronda22/testDemo22.cjs; guardar_log demotest22
      echo "$SALIDA_T" | grep -E "^FALLA|RESULTADO" | tee -a "$SALIDA"
      [ "$TIEMPO_AGOTADO" = 1 ] && fallo "testDemo22 superó el límite de ${LIMITE}s (proceso detenido)"
      [ "$TIEMPO_AGOTADO" = 0 ] && [ "$CODIGO" -ne 0 ] && fallo "testDemo22 salió con código $CODIGO"
      echo "$SALIDA_T" | grep -q "RESULTADO: [0-9]* correctas, 0 fallos" || fallo "testDemo22 no terminó con 0 fallos"
    fi
    matar_arbol "$DPID"; rm -f .wrangler/demo.pid
  fi
fi
if [ "$FALLOS" -gt 0 ]; then reg "RESUMEN: $FALLOS problema(s) en la ejecución. Código de salida 1."; exit 1; fi
reg "RESUMEN: todo correcto. Código de salida 0."

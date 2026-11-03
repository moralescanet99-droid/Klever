#!/usr/bin/env bash
# Ronda 11: prueba de la verificación de entregas ZIP. Un ZIP no contiene .git: se comprueba que el contenido se verifica, que la manipulación se detecta
# y que NUNCA se declara verificado el historial en una copia sin repositorio real (ZIP, repositorio vacío o de un solo commit).
# Uso: bash tests/ronda11/test-zip.sh   (necesita git, zip, unzip y Node >= 22.13; no necesita «npm ci»)
set -uo pipefail
cd "$(dirname "$0")/../.."; RAIZ="$(pwd)"; T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
OK=0; MAL=0; chequear() { if [ "$2" = ok ]; then OK=$((OK + 1)); echo "OK    [$1] $3"; else MAL=$((MAL + 1)); echo "FALLA [$1] $3  [$4]"; fi; }
ENTREGA_SIN_COMPROBAR_ARBOL=1 bash scripts/entrega/crear-zip.sh "$T/bueno.zip" >/dev/null 2>&1 || { echo "FALLA: no se pudo crear el ZIP"; echo "RESULTADO: 0 correctas, 1 fallos"; exit 1; }
unzip -l "$T/bueno.zip" | grep -q "/\.git/" && chequear Z0 mal "El ZIP no debe contener .git" "contiene .git" || chequear Z0 ok "El ZIP no contiene .git (por eso el historial no es verificable desde él)"
salida="$(bash scripts/entrega/verificar-zip.sh "$T/bueno.zip" 2>&1)"; c=$?
if [ $c -eq 0 ] && echo "$salida" | grep -q "NO verificable desde un ZIP" && echo "$salida" | grep -q "no acredita nada sobre el historial"; then chequear Z1 ok "Un ZIP correcto se verifica (código 0) y la salida separa lo verificado de lo que exige un repositorio"; else chequear Z1 mal "ZIP correcto" "código $c: $(echo "$salida" | grep FALLA | head -2 | tr '\n' ' ')"; fi
# Z2: sin .git, A8 pasa en «modo ZIP» sin declarar el historial verificado
mkdir "$T/a" && unzip -q "$T/bueno.zip" -d "$T/a"; RONDA="$T/ra" node "$T/a/tests/ronda10/unit-acceso.mjs" >/dev/null 2>&1; c=$?
obs="$(node -e "const j=JSON.parse(require('fs').readFileSync('$T/ra/evidencias-A.json'));const a=j.find(x=>x.id==='A8');console.log(a.resultado+'|'+a.observado)")"
if [ $c -eq 0 ] && echo "$obs" | grep -q '^OK|' && echo "$obs" | grep -q 'historial: NO verificado' && ! echo "$obs" | grep -q 'historial: VERIFICADO'; then chequear Z2 ok "Sin .git, A8 pasa en modo ZIP (solo contenido) y dice «historial: NO verificado»"; else chequear Z2 mal "A8 en modo ZIP" "código $c; ${obs:0:160}"; fi
# Z3: un repositorio NUEVO (vacío, o con un solo commit del propio contenido) no acredita historial
for modo in vacio uncommit; do
  rm -rf "$T/r"; mkdir "$T/r"; unzip -q "$T/bueno.zip" -d "$T/r"; ( cd "$T/r" && git init -q . )
  [ $modo = uncommit ] && ( cd "$T/r" && git add -A >/dev/null 2>&1 && git -c user.name=t -c user.email=t@example.invalid commit -q -m "contenido del zip" )
  rm -rf "$T/rr"; RONDA="$T/rr" node "$T/r/tests/ronda10/unit-acceso.mjs" >/dev/null 2>&1
  obs="$(node -e "const j=JSON.parse(require('fs').readFileSync('$T/rr/evidencias-A.json'));console.log(j.find(x=>x.id==='A8').observado)")"
  if echo "$obs" | grep -q 'historial: NO verificado' && ! echo "$obs" | grep -q 'historial: VERIFICADO'; then chequear "Z3-$modo" ok "Repositorio nuevo ($modo): NO se declara verificado el historial"; else chequear "Z3-$modo" mal "Repositorio nuevo $modo" "${obs: -160}"; fi
done
# Z4–Z6: la manipulación se detecta
mkdir "$T/m" && unzip -q "$T/bueno.zip" -d "$T/m" && echo "// manipulado" >> "$T/m/public/app.js" && ( cd "$T/m" && zip -qr "$T/manipulado.zip" . )
bash scripts/entrega/verificar-zip.sh "$T/manipulado.zip" >/dev/null 2>&1 && chequear Z4 mal "Archivo modificado" "pasó" || chequear Z4 ok "Un archivo modificado tras crear el ZIP se detecta (huella distinta, código ≠ 0)"
mkdir "$T/s" && unzip -q "$T/bueno.zip" -d "$T/s" && echo "DEV_RETURN_LINK=1" > "$T/s/.dev.vars" && ( cd "$T/s" && zip -qr "$T/conclaves.zip" . )
bash scripts/entrega/verificar-zip.sh "$T/conclaves.zip" >/dev/null 2>&1 && chequear Z5 mal ".dev.vars en el ZIP" "pasó" || chequear Z5 ok "Un ZIP con .dev.vars se rechaza"
mkdir "$T/n" && unzip -q "$T/bueno.zip" -d "$T/n" && rm -f "$T/n/MANIFEST-SHA256.txt" && ( cd "$T/n" && zip -qr "$T/sinmanifiesto.zip" . )
bash scripts/entrega/verificar-zip.sh "$T/sinmanifiesto.zip" >/dev/null 2>&1 && chequear Z6 mal "Sin manifiesto" "pasó" || chequear Z6 ok "Un ZIP sin manifiesto de huellas se rechaza (no se puede comprobar su integridad)"
echo; echo "RESULTADO: $OK correctas, $MAL fallos"; [ $MAL -eq 0 ]

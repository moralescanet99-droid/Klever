#!/usr/bin/env bash
# Comprobación AUTOMÁTICA del lado servidor (no sustituye la del dispositivo previsto): en un servidor desechable (puerto 8799, estado propio,
# NUNCA toca .wrangler/piloto) crea una cuenta ficticia y una cartera, para el servidor, lo arranca de nuevo, vuelve a entrar con el mismo correo,
# comprueba que la cartera sigue ahí, cierra sesión y comprueba que la sesión queda invalidada (401).
set -euo pipefail
cd "$(dirname "$0")/../.."
P=8799; E=.wrangler/piloto-prueba; WR=./node_modules/.bin/wrangler; B="http://localhost:$P"; LOG=.wrangler/piloto-prueba.log; PIDF=.wrangler/piloto-prueba.pid
EMAIL="persistencia-$$@ficticio.invalid"
parar() { [ -f "$PIDF" ] && { kill "$(cat $PIDF)" 2>/dev/null || true; pkill -P "$(cat $PIDF)" 2>/dev/null || true; rm -f $PIDF; }; pkill -f "port $P" 2>/dev/null || true; sleep 2; }
arrancar() { nohup $WR pages dev public --port $P --persist-to $E --binding DEV_RETURN_LINK=1 >"$LOG" 2>&1 & echo $! >$PIDF
  for _ in $(seq 1 90); do [ "$(curl -s -o /dev/null -w '%{http_code}' $B/api/ideas || true)" = 200 ] && return 0; sleep 1; done; echo "no arrancó ($LOG)"; exit 1; }
entrar() { local l t; l=$(curl -s -X POST $B/api/login -H 'content-type: application/json' -d "{\"email\":\"$EMAIL\",\"acepto\":true}" | sed -n 's/.*"dev_link":"\([^"]*\)".*/\1/p')
  t=${l##*login=}; curl -s -X POST $B/api/verify -H 'content-type: application/json' -d "{\"token\":\"$t\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'; }
ok() { echo "  ✔ $1"; }; mal() { echo "  ✘ $1"; parar; exit 1; }
trap parar EXIT
parar; rm -rf $E
$WR d1 execute klever --local --persist-to $E --file=schema.sql >/dev/null; $WR d1 execute klever --local --persist-to $E --file=data/seed-prueba.sql >/dev/null; $WR d1 execute klever --local --persist-to $E --file=data/demo.sql >/dev/null
arrancar; T1=$(entrar); [ -n "$T1" ] && ok "entrada con enlace en pantalla (sin correo real)" || mal "no se obtuvo sesión"
R=$(curl -s -X POST $B/api/portfolios -H "authorization: Bearer $T1" -H 'content-type: application/json' -d '{"nombre":"Cartera de persistencia","plantilla":"riesgo","origen":"vacia","posiciones":[{"ticker":"AAPL","peso":60},{"ticker":"MSFT","peso":40}]}')
echo "$R" | grep -q '"id"' && ok "cartera creada" || mal "no se creó la cartera: $R"
parar; arrancar; ok "servidor parado y arrancado de nuevo"
sleep 2; T2=$(entrar); [ -n "$T2" ] && ok "vuelve a entrar con el mismo correo" || mal "no se pudo volver a entrar"
L=$(curl -s $B/api/portfolios -H "authorization: Bearer $T2")
echo "$L" | grep -q 'Cartera de persistencia' && echo "$L" | grep -q 'MSFT' && ok "la cartera y sus posiciones siguen ahí" || mal "la cartera NO persiste: $L"
curl -s -X POST $B/api/logout -H "authorization: Bearer $T2" >/dev/null
[ "$(curl -s -o /dev/null -w '%{http_code}' $B/api/portfolios -H "authorization: Bearer $T2")" = 401 ] && ok "tras cerrar sesión, la sesión deja de valer (401)" || mal "la sesión sigue válida tras cerrar"
echo "PERSISTENCIA DEL SERVIDOR CORRECTA (lado servidor; falta la comprobación en el dispositivo previsto)"

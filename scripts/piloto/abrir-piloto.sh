#!/usr/bin/env bash
# Abre el piloto privado: Klever completo en local, base de datos D1 simulada con PERSISTENCIA y datos ficticios.
# Sin correo real y sin publicar nada: el enlace de acceso aparece EN PANTALLA («Modo desarrollo: entrar»).
# Uso:  bash scripts/piloto/abrir-piloto.sh                 (solo este ordenador: http://localhost:8788)
#       LAN=1 bash scripts/piloto/abrir-piloto.sh           (también accesible desde otro dispositivo de la MISMA wifi)
#       RESET_PILOTO=1 bash scripts/piloto/abrir-piloto.sh  (BORRA todo lo guardado y vuelve a sembrar; solo antes de empezar el piloto)
# Parar: Ctrl+C. Lo guardado se conserva en .wrangler/piloto (ignorado por git) y vuelve al abrirlo otra vez.
set -euo pipefail
cd "$(dirname "$0")/../.."
bash scripts/piloto/verificar-version.sh
PORT="${PORT:-8788}"; WR="./node_modules/.bin/wrangler"; ESTADO=".wrangler/piloto"
[ -x "$WR" ] || { echo "Falta wrangler: ejecuta antes «npm ci»." >&2; exit 1; }
if [ "${RESET_PILOTO:-0}" = 1 ] || [ ! -d "$ESTADO" ]; then
  echo "→ Preparando la base de datos del piloto (datos ficticios)…"
  rm -rf "$ESTADO"
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=schema.sql           >/dev/null
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=data/seed-prueba.sql >/dev/null
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=data/demo.sql        >/dev/null
else
  echo "→ Se conserva lo guardado (cuentas, carteras, ideas). RESET_PILOTO=1 solo antes de empezar."
fi
IPARG=(); [ "${LAN:-0}" = 1 ] && IPARG=(--ip 0.0.0.0)
echo "→ Abre http://localhost:${PORT}. Antes de cada sesión: abre la portada y el Cuaderno una vez (la primera carga puede tardar)."
[ "${LAN:-0}" = 1 ] && echo "→ Desde otro dispositivo: http://<IP de este ordenador>:${PORT} (el enlace de acceso se genera con la dirección que hayas usado, así que funciona tal cual)."
exec $WR pages dev public --port "$PORT" --persist-to "$ESTADO" --binding DEV_RETURN_LINK=1 ${IPARG[@]+"${IPARG[@]}"}

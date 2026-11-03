#!/usr/bin/env bash
# Klever completo en local: sitio + API + base de datos D1 simulada, con datos de PRUEBA inventados.
# No toca wrangler.toml, no crea .dev.vars y no usa ninguna cuenta ni servicio externo.
# Uso:   bash scripts/local/arrancar.sh            (abre http://localhost:8788)
#        PORT=9000 bash scripts/local/arrancar.sh  (otro puerto)
#        RESET=1 bash scripts/local/arrancar.sh    (empezar de cero: borra lo guardado en la sesión anterior)
# Parar: Ctrl+C
# En esta versión de pruebas el enlace de acceso NO se envía por email: aparece en pantalla («Modo desarrollo: entrar»).
set -euo pipefail
cd "$(dirname "$0")/../.."
PORT="${PORT:-8788}"
WR="npx --yes wrangler@3"
ESTADO=".wrangler/pruebas"                     # base de datos local; está en .gitignore (.wrangler/)

if [ "${RESET:-0}" = "1" ] || [ ! -d "$ESTADO" ]; then
  echo "→ Preparando la base de datos local con datos de prueba…"
  rm -rf "$ESTADO"
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=schema.sql          >/dev/null
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=data/seed-prueba.sql >/dev/null
  $WR d1 execute klever --local --persist-to "$ESTADO" --file=data/demo.sql        >/dev/null
else
  echo "→ Se conserva la base de datos de la sesión anterior (RESET=1 para empezar de cero)."
fi
echo "→ Listo. Abre http://localhost:${PORT} en el navegador. Para parar: Ctrl+C."
exec $WR pages dev public --port "$PORT" --persist-to "$ESTADO" --binding DEV_RETURN_LINK=1

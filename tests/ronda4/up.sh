#!/bin/bash
# Arranca el sitio en local con D1 simulada y datos de prueba. Uso: up.sh (deja el PID en /tmp/wr/dev.pid)
cd /home/user/Klever
W=/tmp/wr/node_modules/.bin/wrangler
sed -i 's/REEMPLAZAR_CON_ID_DE_D1/00000000-0000-0000-0000-000000000000/' wrangler.toml
printf 'DEV_RETURN_LINK=1\n' > .dev.vars
rm -rf .wrangler
$W d1 execute klever --local --file=schema.sql >/dev/null 2>&1
$W d1 execute klever --local --file=/tmp/wr/rd/seed.sql >/dev/null 2>&1
$W d1 execute klever --local --file=data/demo.sql >/dev/null 2>&1
nohup $W pages dev public --d1 DB=00000000-0000-0000-0000-000000000000 --port 8788 >/tmp/dev.log 2>&1 &
echo $! > /tmp/wr/dev.pid

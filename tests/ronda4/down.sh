#!/bin/bash
cd /home/user/Klever
[ -f /tmp/wr/dev.pid ] && kill $(cat /tmp/wr/dev.pid) 2>/dev/null
sleep 1
sed -i 's/00000000-0000-0000-0000-000000000000/REEMPLAZAR_CON_ID_DE_D1/' wrangler.toml
rm -rf .dev.vars .wrangler

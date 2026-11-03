#!/bin/bash
# Ejecuta las cuatro baterías con un servidor LIMPIO entre cada una (comparten base de datos local y se contaminarían).
# Rutas de este entorno de trabajo (/tmp/wr, /home/user/Klever): ajústalas si lo ejecutas en otro sitio.
cd /tmp/wr; export RONDA=ronda6
for t in testA testB testC testD testE; do
  /tmp/wr/down.sh; /tmp/wr/up.sh; sleep 14
  echo "=== $t ==="; timeout 900 node rd/$t.cjs 2>&1 | grep -E "^FALLA|RESULTADO|^- |Timeout"
done
/tmp/wr/down.sh

# Guiones de verificación (ronda 4)

Reproducen las 130 comprobaciones y las capturas del informe `ronda4/LEEME.md`.

- `seed.py`: genera datos de **prueba** inventados (125 activos, con algunos bancos «sin dato») en `seed.sql`.
- `up.sh` / `down.sh`: arrancan y paran el sitio en local (`wrangler pages dev` con D1 simulada) con `DEV_RETURN_LINK=1`, que devuelve el enlace de acceso en pantalla en lugar de enviar un email. **No usar en producción.**
- `h.cjs`: utilidades comunes. `testA.cjs`, `testB.cjs`, `testC.cjs`: las baterías. `shots4.cjs antes|despues`: capturas.

Requisitos: Node 20+, `playwright` y `wrangler@3`. Las rutas (`/tmp/wr`, `/home/user/Klever`) son las de este entorno de trabajo: ajústalas si los ejecutas en otro sitio.

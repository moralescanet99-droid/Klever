# Klever · cómo repetir las pruebas desde cero

Todo lo necesario está en este repositorio: código, dependencias fijadas (`package.json` + `package-lock.json`), servidor (Cloudflare Pages Functions + D1 simulada en local), migraciones, scripts, datos ficticios y pruebas. **No hay secretos** (no se necesita cuenta de Cloudflare, Brevo ni GitHub para probar).

## Requisitos
- Node.js 20 o superior (probado con 22) y npm.
- Python 3 (solo para regenerar datos de prueba y la demo).
- Linux o macOS (los scripts son `bash`).

## Instalación limpia (comandos exactos)
```bash
git clone https://github.com/moralescanet99-droid/Klever.git
cd Klever
git checkout ccr-b652a7eb-uukhdy        # rama de trabajo
npm ci                                   # instala wrangler 3.114.17 y playwright 1.63.0 EXACTOS (package-lock.json)
npx playwright install chromium          # navegador para las pruebas (una sola vez)
```

## Datos ficticios de prueba
- `data/seed-prueba.sql`: 125 activos y 105 empresas con cifras **inventadas** (semilla fija). Se regenera con `python3 tests/ronda5/seed.py` y sale idéntico.
- `data/demo.sql`: 3 carteras públicas de ejemplo.
- `schema.sql`: esquema completo (incluye la revisión de la ronda 7). `migrations/0002`–`0007`: para bases creadas con versiones anteriores.

## Arrancar la versión completa a mano
```bash
bash scripts/local/arrancar.sh          # http://localhost:8788  (RESET=1 para empezar de cero; PORT=9000 para otro puerto)
```
El enlace de acceso **no se envía por email**: aparece en pantalla («Modo desarrollo: entrar»). Guion de uso para personas: `PRUEBAS-DE-USO.md`.

## Ejecutar TODAS las pruebas automáticas
```bash
bash tests/run-all.sh                   # ~15 min; arranca un servidor limpio entre baterías y lo para al final
```
Escribe el resultado literal y la versión del código en `ronda7/resultado-ejecucion.txt` y los datos observados en `ronda7/evidencias-*.json` (capturas en `ronda7/evidencias/`).

| Prueba | Qué comprueba | Contra qué |
|---|---|---|
| `tests/ronda7/unit-servidor.mjs` (`npm run test:servidor`, ~1 s, sin navegador) | Atomicidad, revisión en cada escritura, sin guardados parciales, carrera simulada de forma determinista | Los manejadores reales de `functions/api/portfolios/*` sobre SQLite real |
| `tests/ronda5/testA`–`testE` | Interfaz completa, móvil, empresas, acceso, escenarios con evidencia | Servidor real local (D1 simulada) + Chromium |
| `tests/ronda7/testF` | Guardado fiable, conflicto, E16a corregida, diálogo móvil, desconexión real | Servidor real local + Chromium |
| `tests/ronda5/demotest.cjs` | La demo HTML (simulada, sin persistencia) | `demo/index.html` en memoria |

Las baterías antiguas `tests/ronda4/` y `shots*.cjs` son históricas (generan capturas de rondas anteriores y llevan rutas de aquel entorno).

## Qué NO se puede repetir con este proyecto
Email real (Brevo), carga real de la SEC, widgets de TradingView, móviles reales, Safari/Firefox, lector de pantalla, zoom real del navegador y teclado móvil real: ver `ronda7/pruebas-manuales.md`. **Ninguna de ellas se ha ejecutado.**

## Demo HTML
`demo/index.html` es una **demostración sin persistencia de cuenta**: simula el servidor en la memoria de la página y al recargar se pierde todo. No es equivalente al servidor probado; sirve para enseñar la interfaz. Su casilla «Simular fallo de red al guardar» es una simulación explícita (el modo sin conexión del navegador no afecta a las peticiones simuladas en memoria). Para probar la desconexión de verdad, usa la versión completa local.

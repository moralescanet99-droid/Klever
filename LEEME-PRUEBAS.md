# Klever · cómo repetir las pruebas desde cero

Todo lo necesario está en este repositorio: código, dependencias fijadas (`package.json` + `package-lock.json`), servidor (Cloudflare Pages Functions + D1 simulada en local), migraciones, scripts, datos ficticios y pruebas. **No hay secretos** (no se necesita cuenta de Cloudflare, Brevo ni GitHub para probar).

## Requisitos
- **Node.js 22.13 o superior** (`.nvmrc` = 22; probado con 22.23) y npm. Las pruebas del servidor usan `node:sqlite`, que sin indicador experimental existe desde 22.13; `tests/run-all.sh` se niega a ejecutarse con una versión menor.
- Python 3 (servidor de la demo y regeneración de datos de prueba).
- Herramientas del sistema: `bash` (vale el 3.2 de macOS), `curl`, `git`, `pgrep`, `mktemp`. **No se usan `timeout` ni `setsid`** (no vienen en macOS): los límites de tiempo y la parada de procesos son propios de los scripts.
- Linux o macOS (en Windows, mediante WSL).

## Instalación limpia (comandos exactos)
```bash
git clone https://github.com/moralescanet99-droid/Klever.git
cd Klever
git checkout 156235065d2c27f1d8269b5588e5aec68a536bc6   # commit EXACTO del código con el que se obtuvo ronda8/resultado-ejecucion.txt (los commits posteriores solo añaden resultados e informes)
npm ci                                   # instala wrangler 3.114.17 y playwright 1.63.0 EXACTOS (package-lock.json)
npx playwright install chromium          # navegador para las pruebas (una sola vez)
```

## Datos ficticios de prueba
- `data/seed-prueba.sql`: 125 activos y 105 empresas con cifras **inventadas** (semilla fija). Se regenera con `python3 tests/ronda5/seed.py` y sale idéntico.
- `data/demo.sql`: 3 carteras públicas de ejemplo.
- `schema.sql`: esquema completo (incluye la revisión de la ronda 7). `migrations/0002`–`0007`: para bases creadas con versiones anteriores (**no** se aplica la 0007 sobre `schema.sql` nuevo: ya tiene las columnas y falla con «duplicate column»; está comprobado en `unit-migracion.mjs`).

## Arrancar la versión completa a mano
```bash
bash scripts/local/arrancar.sh          # http://localhost:8788  (RESET=1 para empezar de cero; PORT=9000 para otro puerto)
```
El enlace de acceso **no se envía por email**: aparece en pantalla («Modo desarrollo: entrar»). Guion de uso para personas: `PRUEBAS-DE-USO.md`.

## Ejecutar TODAS las pruebas automáticas
```bash
bash tests/run-all.sh                   # ~15 min; arranca un servidor limpio entre baterías y lo para al final.
                                        # CÓDIGO DE SALIDA 0 solo si TODO pasa; ≠ 0 si falla el arranque, hay timeout, falta el resultado o hay fallos
bash tests/ronda8/test-ejecutor.sh      # prueba del propio ejecutor (fallos y timeouts deliberados), ~2 min
```
Escribe el resultado literal y la versión del código en `ronda8/resultado-ejecucion.txt` y los datos observados en `ronda8/evidencias-*.json` (capturas en `ronda8/evidencias/`). Variables: `RONDA`, `LIMITE_BATERIA` (900 s), `PORT` (8788).

| Prueba | Qué comprueba | Contra qué |
|---|---|---|
| `tests/ronda7/unit-servidor.mjs`, `tests/ronda8/unit-carreras.mjs`, `tests/ronda8/unit-migracion.mjs` (`npm run test:servidor`, ~2 s, sin navegador) | Atomicidad, revisión en cada escritura, sin guardados parciales, carreras de lectura y de respuesta simuladas de forma determinista, errores internos frente a validación, migración 0007 sobre una base antigua con datos | Los manejadores reales de `functions/api/portfolios/*` sobre SQLite real (adaptador de D1 en `tests/lib/d1-sqlite.mjs`) |
| `tests/ronda5/testA`–`testE` | Interfaz completa, móvil, empresas, acceso, escenarios con evidencia | Servidor real local (D1 simulada) + Chromium |
| `tests/ronda7/testF` | Guardado fiable, conflicto, E16a corregida, diálogo móvil, desconexión real | Servidor real local + Chromium |
| `tests/ronda8/testG` | Respuesta tardía de un guardado/publicación mientras se abre otra cartera | Servidor real local + Chromium |
| `tests/ronda8/test-ejecutor.sh` | Que `run-all.sh` falle (código ≠ 0) ante fallos, caídas, timeouts y servidor que no arranca, y limpie procesos | Fixtures en `tests/ronda8/fixtures/` |
| `tests/ronda5/demotest.cjs` | La demo HTML (simulada, sin persistencia) | `demo/index.html` en memoria |

Las baterías antiguas `tests/ronda4/` y `shots*.cjs` son históricas (generan capturas de rondas anteriores y llevan rutas de aquel entorno).

## Qué NO se puede repetir con este proyecto
Email real (Brevo), carga real de la SEC, widgets de TradingView, móviles reales, Safari/Firefox, lector de pantalla, zoom real del navegador y teclado móvil real: ver `ronda8/pruebas-manuales.md`. **Ninguna de ellas se ha ejecutado.** Tampoco se ha probado **Cloudflare D1 remoto**: todo lo «transaccional» está probado con D1 local simulada (Miniflare) y con SQLite real.

## Demo HTML
`demo/index.html` es una **demostración sin persistencia de cuenta**: simula el servidor en la memoria de la página y al recargar se pierde todo. No es equivalente al servidor probado; sirve para enseñar la interfaz. Su casilla «Simular fallo de red al guardar» es una simulación explícita (el modo sin conexión del navegador no afecta a las peticiones simuladas en memoria). Para probar la desconexión de verdad, usa la versión completa local.

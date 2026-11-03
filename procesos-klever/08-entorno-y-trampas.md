# 08 · Entorno, cómo ejecutar y trampas conocidas

## Entorno de trabajo (sesión en la nube)
- Contenedor efímero: lo que no está en el repositorio **se pierde** (`/tmp`, directorio de scratchpad). Todo lo importante debe estar commiteado.
- **Sin acceso a Internet** salvo el proxy de la sesión: no se puede probar SEC, TradingView ni Brevo reales. Las pruebas son locales con servicios simulados.
- Chromium y Playwright preinstalados (`require('playwright')`; no instalar otra vez). `wrangler@3` se instala con `npm i wrangler@3` en un directorio aparte.
- Rama de trabajo, commits con los dos pies de firma que indique el sistema y `git push -u origin <rama>`. **No crear pull requests** salvo petición expresa.

## Ejecutar y probar en local
Los guiones están en `tests/ronda4/` (rutas escritas para este entorno: `/tmp/wr` y `/home/user/Klever`; ajústalas si cambia).
1. `seed.py` genera `seed.sql` (125 activos con cifras **inventadas**, bancos «sin dato»).
2. `up.sh`: pone un `database_id` falso en `wrangler.toml`, crea `.dev.vars` con `DEV_RETURN_LINK=1`, borra `.wrangler`, aplica `schema.sql`, `seed.sql` y `data/demo.sql` y arranca `wrangler pages dev public` en `:8788` (PID en un archivo).
3. `node testA.cjs`, `testB.cjs`, `testC.cjs` (130 comprobaciones). `node shots4.cjs antes|despues` para capturas.
4. `down.sh`: para el servidor, **restaura `wrangler.toml`** y borra `.dev.vars` y `.wrangler`.
5. **Antes de cada commit:** `git diff wrangler.toml` debe estar vacío (`database_id = "REEMPLAZAR_CON_ID_DE_D1"`).

Demo: `python3 scripts/demo/build_demo.py` regenera `demo/index.html` (y `build/klever_demo_artifact.html` para el artefacto). `scripts/demo/mock.js` es el servidor simulado.

## Trampas que ya nos costaron tiempo
**Entorno**
- **No uses `pkill -f` ni `pgrep -f` con un patrón que aparezca en tu propia línea de comandos** (`pages dev`, `wrangler`, `workerd`): matan tu shell (código 144). Usa un archivo de PID.
- **Límite de acceso por email:** 1 envío por minuto y 5 al día por email. Las pruebas deben usar emails distintos cada vez (`h.cjs` genera uno único). La base local persiste entre ejecuciones: reiníciala con `down.sh` + `up.sh`.
- `DEV_RETURN_LINK=1` devuelve el enlace de acceso en pantalla: **solo en `.dev.vars` local, nunca en producción.**
- El control de seguridad rechaza `rm` con variables (`$OUT/*.png`) o comandos que no puede analizar: usa rutas literales.
- `SendUserFile` rechaza imágenes de más de 8000 px por lado: partirlas o reducirlas. Las capturas de página completa a 2× en móvil suelen pasarse.
- Las herramientas de edición exigen **leer el archivo antes de escribir** si ha cambiado desde la última lectura.
- Los heredocs de Python con `%` en `mock.js`: ese archivo se formatea con `%`, así que un `%` literal va como `%%`.

**Interfaz**
- **Un `display` en una clase pisa al atributo `hidden`** (misma especificidad). Hay una regla global `[hidden]{display:none!important}` y reglas específicas para `.solo-escritorio[hidden]`, etc. Ya salió «Entrar» y «Salir» a la vez y un banner que no se ocultaba.
- **Texto `.sr` (solo lectores) dentro de tablas** posiciona en la página y provoca desbordamiento horizontal si el contenedor no es `position: relative`.
- **Cuadrículas con nombres largos:** usar siempre `grid-template-columns: minmax(0, 1fr)`; si no, un nombre largo ensancha la columna (pasó con «Vanguard High Dividend Yield ETF»).
- **Tablas de empresas en móvil:** el ancho mínimo lo marcan las palabras largas; separar con espacios real entre nombre y símbolo y fijar anchos de columna.
- **Capturas de página completa con barra fija:** la barra aparece a mitad de la imagen; hay que ponerla `position: static` solo para esa captura (y avisarlo).
- El texto de los campos de peso se formatea con coma (`16,6`): en pruebas, comparar con `'17,0'`, no `'17'`.
- Al reabrir una cartera el servidor ordena las posiciones por peso: en pruebas, no asumir índices.

**Artefactos de Claude (demo privada)**
- Solo cargan scripts de cdnjs/jsdelivr/unpkg y nada de `fetch` externo; `window.print`, `alert`, `confirm`, descargas y `mailto:` no funcionan; las rutas por hash solo admiten `#nombre` simple.
- El archivo se publica sin `<html>`/`<head>`; el `<title>` va al principio. Para actualizar, publicar el **mismo archivo** con la misma URL.
- No se puede cambiar el acceso del artefacto desde aquí: el usuario lo hace con «Compartir». ChatGPT no puede interactuar con él; por eso existe `demo/index.html` para publicarla como web normal.

**Pruebas**
- El borrador y la sesión viven en `localStorage`; para simular «otro dispositivo» hay que usar **otro contexto de navegador**, no otra pestaña.
- El teclado virtual no se puede reproducir de verdad: se emula reduciendo la altura de la ventana; el ocultado de la barra solo se comprueba a nivel de estilos.
- Los widgets de TradingView se bloquean en pruebas (`page.route` a `tradingview.com`): sin Internet fallan igualmente.

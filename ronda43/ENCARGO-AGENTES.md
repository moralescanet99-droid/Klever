# Ronda 43 · Encargo común para los agentes que construyen la app v1

Construimos **Klever v1** en `app/`. Es la app final que Javier quiere **publicada** (beta privada).

## Lee antes (obligatorio)
- `ronda43/ESPECIFICACION-V1.md`: decisiones de Javier. **Mandan sobre todo lo demás.**
- `ronda40/INFORME-APP-FINAL.md` §3–§6: estructura y funciones. Aplica lo que diga la especificación.
- `ronda42/fotos/2-nacar/` (01–06 y la portada): **el aspecto a reproducir**. Su HTML fuente está en `ronda42/fotos/2-nacar/fuente/pantallas.html`. Usa sus proporciones, jerarquía, textos y gráficos como referencia directa.
- **Base ya hecha (léela entera antes de escribir):**
  - `app/src/lib/dominio/`: tipos, catálogo de ejemplo, análisis de cartera, liga, draft y fechas.
  - `app/src/lib/servicio/`: lógica de negocio, repositorio en memoria y semilla.
  - `app/src/lib/api/`: contrato `Api`, más `demo.ts` y `http.ts`.
  - `app/src/lib/estado/` y `app/src/lib/router.svelte.ts`.
  - `app/src/App.svelte`: armazón, rutas, barra inferior.
  - `app/src/estilos/nacar.css`: **tokens y clases base**. Úsalos; nada de colores sueltos.

## Pila
- Svelte 5 (runas: `$state`, `$derived`, `$props`, `$effect`), Vite 6 y TypeScript.
- Sin más dependencias salvo que sea imprescindible: dilo en tu informe.
- La interfaz habla **solo** con `api` (`import { api } from '../../lib/api'`).
- Desarrollo:
  - `cd app && npx vite --mode demo` sirve la app con datos de ejemplo en el navegador.
  - `npx vite build --mode demo` genera `app/dist-demo/index.html`, que se puede abrir con `file://`.
  - `npx vitest run` pasa las pruebas unitarias.
  - `npx svelte-check` comprueba los tipos y **debe quedar sin errores en tus archivos**.

## Reglas del producto (no se rompen)
- **Sello siempre visible** (lo pone el armazón).
- **Sin dinero real, sin precios, sin rentabilidad y sin escenarios hipotéticos ni crisis.** «Probar un peso» sí está permitido.
- **Datos de ejemplo rotulados.** Usa `FUENTE_DATOS` de `catalogo.ts`.
- **Klever no recomienda empresas.** Las pistas son solo de **pesos** (`pista()` en `cartera.ts`).
- **Español de España,** textos cortos (unas 12 palabras por bloque como máximo) y tono cercano.

## Calidad exigida
- **Móvil primero (390 px)** y bien a 1280 px. Sin scroll horizontal.
- Objetivos táctiles de 44 px o más.
- Accesible:
  - etiquetas;
  - `aria-live` donde cambian datos;
  - foco visible;
  - teclado;
  - alternativa con botones a todo gesto (el anillo arrastrable tiene que poder usarse con − y +);
  - texto alternativo o tabla para los gráficos.
- `prefers-reduced-motion`: sin movimiento continuo.
- Estados vacíos, de carga y de error en cada pantalla, mostrando el error de la Api con `mensaje(e)`.
- Movimiento con intención (160–420 ms, muelles en lo táctil). Solo `transform` y `opacity`.
- Dibujos y gráficos **a escala** con los datos reales del dominio. SVG propio, sin librerías de gráficos.

## Verificación obligatoria
1. Con Playwright: `require('playwright')`, `chromium.launch()` sin opciones y **nunca** `playwright install`.
2. Abre `app/dist-demo/index.html` (`file://`) a **390×844** y a **1280×900**, en tema claro y oscuro (`document.documentElement.dataset.tema='oscuro'`).
3. Recorre tus pantallas con clics y comprueba:
   - **0 errores** de consola o de página;
   - `scrollWidth` menor o igual que el ancho.
4. Haz capturas en `/tmp/claude-0/-home-user-Klever/1616b4e7-9427-54fd-86d9-16f5519c4290/scratchpad/<prefijo>-*.png` y **míralas con Read**. Itera hasta que se parezcan a las fotos Nácar y estén impecables.

## Propiedad de archivos (para no pisarnos; hay 4 agentes en paralelo)
- Solo tocas **tus** carpetas.
- **No edites** `App.svelte`, `nacar.css`, `lib/dominio/*`, `lib/api/*`, `lib/estado/*` ni `router.svelte.ts`. **Excepción:** el agente de servidor y cuenta puede editar `lib/servicio/*` y `lib/api/*`.
- Si necesitas un cambio ahí, **descríbelo en tu informe** con el parche exacto. Lo integra el coordinador.
- Puedes crear componentes en `app/src/componentes/base/` solo si su nombre empieza por el prefijo de tu sección (p. ej. `CarteraHoja.svelte`). No toques los de otros.
- **No hagas commit ni push.** Lo hace el coordinador.

**Entrega:** archivos creados, qué funciona, lo comprobado (con rutas de las capturas), lo pendiente y los parches que necesites en archivos compartidos.

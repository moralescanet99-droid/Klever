# Encargo común para los tres prototipos (ronda 38, C54)

Javier (dueño de Klever, no programa, habla español de España) va a elegir UNO de tres prototipos para refundar la empresa. Quiere que se vea **muy futurista**, que **la web no sea estática** y que estén **mucho más cuidados** que el prototipo anterior (`ronda37/prototipo-klever-2.html`; léelo para conocer el punto de partida, y supéralo con creces). Lee también `ronda37/REFUNDACION.md` (la propuesta: bucle «el lunes de Klever», Temple, duelos, escenarios, 5 pantallas, ideas) y `CONTEXTO-KLEVER.md`.

## Qué es Klever
Web/app (PWA) gratuita para que personas de 20–30 años en España **construyan carteras de inversión SIMULADAS** y las pongan a prueba antes de arriesgar dinero. Lema: «Practica antes de arriesgar». Sin dinero real, sin recomendaciones.

## Reglas que NO se rompen (legales y de marca)
1. Siempre visible el sello: **«Simulación · sin dinero real · no es consejo»**.
2. Nunca decir qué comprar ni vender; nunca prometer rentabilidad; nada de testimonios ni cifras presentadas como reales.
3. **Todo dato es de ejemplo y se dice:** empresas inventadas (no uses empresas reales), apodos inventados. Las crisis del pasado se presentan como «escenario inspirado en 2008 · cifras aproximadas de ejemplo, no datos históricos». Los escenarios hipotéticos, rotulados «ilustrativo».
4. Klever propone **pesos**, nunca empresas («¿y si la mayor bajara al 25 %?»), y sus referencias son «orientativas, no normas».
5. Solo apodos en la Liga. Mayores de 18.

## Lógica real de Klever (úsala tal cual, da credibilidad)
- **Concentración** (mayor posición `may` %, mayor sector `top` %, `n` posiciones): Alta si `may ≥ 40` o `top ≥ 60` o `n = 1`; Media si `may ≥ 25` o `top ≥ 40`; si no, Baja.
- **Variedad** por nº de sectores: ≥ 5 Amplia, ≥ 3 Media, si no Poca.
- **Huella de una empresa**: 5 comprobaciones — Deuda manejable, ROIC, Margen, Caja libre, Crecimiento; cada una cumple / no cumple / sin datos (sin datos ≠ no cumple).
- **Liga (Temporada 0, 12 semanas)**, hasta 100 puntos/semana: Equilibrio 50 (concentración baja 25 · media 12; variedad amplia 25 · media 12; requiere ≥ 4 posiciones), Aprendizaje 30 (reto de la semana 20; idea guardada o revisada 10), Constancia 20 (entrar 10, +2 por semana seguida hasta 10). Desempate: semanas con concentración baja.
- Escenario sobre la cartera: índice que empieza en 100; `final = 100 × (1 + Σ peso_i × golpe_sector_i)`.

## Requisitos técnicos (obligatorios)
- **Un único archivo HTML** autocontenido en la ruta que se te indique. Se publicará como Artifact de claude.ai, que envuelve el archivo en `<!doctype html><head>…<body>`: **no escribas `<!doctype>`, `<html>`, `<head>` ni `<body>`**; empieza con `<title>` (nombre corto de 2–4 palabras, sin «:» ni «—»), `<meta name="claude:viewport-fit-sides" content="cover">`, enlaces de Google Fonts, `<style>` y después el contenido y `<script>`.
- **Scripts externos solo de** `https://cdnjs.cloudflare.com` (preferido), `https://cdn.jsdelivr.net/npm/`, `https://unpkg.com`, con **versión exacta** (p. ej. `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`, `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`). Fuentes solo de Google Fonts, con pila de reserva. Nada de imágenes externas: todo inline (SVG, Canvas, WebGL, data URI). Sin `fetch` a nada externo. Sin `alert/confirm/prompt`. `localStorage` solo con try/catch y opcional.
- **Móvil primero**: perfecto a 390 px y también a 1280–1440 px. Nunca scroll horizontal del body. Margen lateral `padding-left: max(16px, env(safe-area-inset-left, 0px))` (y derecha igual). Barras fijas suman `env(safe-area-inset-*)`. Una barra pegajosa arriba usa `top: env(safe-area-inset-top, 0px)`.
- **Tema:** todos los colores como tokens en `:root`. Puedes comprometerte con un único mundo visual (sin modo claro/oscuro); entonces define fondo y todos los colores explícitos y `color-scheme` acorde en `:root`, y `body` con `background` explícito.
- **Accesibilidad:** foco visible, botones reales, etiquetas, `aria-live` donde cambie información, contraste AA en el texto, navegable con teclado; **`prefers-reduced-motion`**: sin movimiento continuo, todo sigue siendo usable y la página se ve completa.
- **Rendimiento en Android medio:** `devicePixelRatio` limitado a 2 (1,5 en WebGL), pausa las animaciones cuando el lienzo no se ve (IntersectionObserver) o la pestaña está oculta, anima `transform`/`opacity`.
- **La página está completa en reposo**: nada escondido con `opacity:0` esperando a un observador; el primer fotograma ya muestra el producto con datos de ejemplo.
- Texto: **español de España**, frases cortas (≈ 12 palabras por bloque), tono cercano, nada de jerga sin explicar. Nada de emojis como iconos (usa SVG).

## Nivel de calidad exigido
Esto es un **prototipo de producto que parezca una app real terminada**, no una maqueta: microinteracciones cuidadas (presión, muelles, contadores que cuentan, transiciones entre pantallas), una dirección de arte propia y coherente, tipografía elegida con intención (no uses Inter, Space Grotesk ni Unbounded, que ya se usaron), jerarquía clara, estados vacíos y de éxito, y **un momento «guau»** memorable en los primeros 5 segundos. Debe poder recorrerse como una app: varias pantallas/vistas navegables (no solo una página que se desplaza), con el bucle completo jugable de principio a fin.

## Verificación antes de entregar (obligatoria)
Con Playwright (ya instalado: `require('playwright')`, `chromium.launch()` sin opciones; nunca ejecutes `playwright install`): abre `file://` del archivo a 390×844 y a 1440×900, recoge errores de consola y `pageerror` (deben ser 0), comprueba `document.documentElement.scrollWidth` ≤ ancho, recorre el bucle completo con clics, y haz capturas (guárdalas en `/tmp/claude-0/-home-user-Klever/1616b4e7-9427-54fd-86d9-16f5519c4290/scratchpad/<tu-prefijo>-*.png`) y **míralas** con la herramienta Read para corregir lo que se vea mal (solapes, textos cortados, contraste, huecos). Itera hasta que se vea impecable (máximo unas 4 vueltas). Prueba también con `reducedMotion: 'reduce'`.

## Entrega
- No hagas commit ni push; no toques nada fuera de tu archivo (y tus capturas en el scratchpad).
- Responde con: ruta del archivo, 5–8 líneas explicando el concepto y qué se puede hacer, lo comprobado (errores, anchos, capturas revisadas) y lo que no hayas podido resolver.

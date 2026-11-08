# Klever · contexto completo para otra conversación (actualizado el 8 nov 2026)

> **Cómo usar este archivo:** súbelo (o pégalo) al empezar una conversación nueva y escribe debajo lo que quieras tratar. Contiene todo lo necesario para seguir el proyecto sin haber visto la conversación anterior.

## 1 · Qué es Klever
- **Web (y app instalable en el móvil) para crear carteras de inversión SIMULADAS**: sin dinero real, sin recomendaciones, con datos de prueba (los datos reales de la SEC se cargarán al publicar).
- **Promesa:** «Descubre alternativas y compáralas antes de invertir». **Lema de marketing aprobado:** «Practica antes de arriesgar» (el «gimnasio de las carteras»).
- **Público:** personas de **20–30 años en España** con poca experiencia. **Solo mayores de 18.**
- **Dueño:** Javier (no es programador; prefiere explicaciones sencillas, en español de España).
- **Quién programa:** Claude Code, en el repositorio de GitHub `moralescanet99-droid/Klever`, rama de trabajo **`claude/nice-cori-jjgf24`** (no integrada en `main` todavía).
- **Demo privada para probar:** https://claude.ai/artifact/W7axvW4u7kefDVSkVXhZVp (datos inventados; se pierde al recargar).

## 2 · Reglas que no se rompen
1. **Coste 0 €** (Cloudflare Pages + D1, GitHub Actions, Brevo gratuito). Todo lo que cueste dinero lo decide Javier.
2. **Sin dinero real, sin recomendaciones, sin promesas de rentabilidad, sin testimonios ni cifras inventadas.** Siempre visible: «Simulación · sin dinero real · no es consejo».
3. **Precios:** hoy solo con widgets de TradingView (no se pueden leer ni guardar). **Excepción aprobada:** la Liga podrá mostrar rentabilidad **simulada** cuando haya una fuente de precios gratuita y legal (aún no la hay).
4. **Privacidad:** nada de correos visibles (en la Liga solo apodos); el contador de uso es anónimo (un número por día y evento) y **no guarda nada en el dispositivo**.
5. **Forma de trabajar:** distinguir siempre **hecho / probado / pendiente**; cada ronda con pruebas automáticas en verde; memoria del proyecto al día (carpeta `procesos-klever/`).

## 3 · Lo que ya tiene (todo probado en local; la web aún NO está publicada)
- **Portada «futurista»:** titular corto, botón «Empieza en 1 minuto» y una **rueda de esferas** (inspirada en un vídeo de una app «Wallet») con 9 empresas conocidas: cada esfera dice cuántas de las 5 comprobaciones supera («4/5»); al tocarla, su «huella» y «Probar en una cartera».
- **Arranque guiado** de 2 preguntas y **editor de carteras** (pesos, pegar «KO 40, PG 60», repartir a partes iguales).
- **Revisión de la cartera:** semáforos de **Concentración, Variedad y Datos**, señales («Exposición alta: Tecnología») y **«Ver qué cambiaría»** → **Laboratorio** (simula un cambio y lo compara).
- **Explorar empresas** (126 de prueba) con su **huella** (pentágono de 5 comprobaciones: deuda, ROIC, margen, caja libre, crecimiento), ficha y **comparador** de dos empresas.
- **Cuaderno**: ideas guardadas con su pregunta, revisiones y **«Qué ha cambiado en los datos desde que la guardaste»**.
- **«Hoy»** (pantalla de inicio con cuenta): tu cartera principal en grande (anillo + semáforos + una acción), frase con iconos, **rueda de tu temporada** (una esfera por semana), **«Tu semana»** (evolución, cambios, reto de la semana, 5 retos fijos, «Mira atrás»), acceso a la **Liga** y botón **«Compartir»** (imagen de tu cartera en formato historia).
- **Liga, Temporada 0** (ver §5): inscripción, apodo, puntos semanales, clasificación general opcional y **ligas privadas** con código e invitación por enlace.
- **Instalable en el móvil** (icono, nombre, pantalla completa), tipografía propia (Inter), modo «reducir movimiento», accesibilidad revisada.
- **Calidad:** 71 baterías de pruebas automáticas (**1.305 comprobaciones, 0 fallos** en la última pasada), comparación visual de capturas y pruebas en paralelo (≈ 15 min).

## 4 · Hoja de ruta decidida por Javier (C43)
| Fase | Qué | Estado |
|---|---|---|
| 1 · Cimientos | código ordenado, un sistema de diseño (`DESIGN.md`), pruebas rápidas, medición anónima | ✅ |
| 2 · Experiencia de usuario | «Hoy» ✅, portada con rueda ✅, tarjeta para compartir ✅; **faltan:** menos texto en toda la app, Descubrir como feed (tarjetas que se deslizan), editar la cartera con los dedos (anillo arrastrable), primer minuto «wow» | 🟡 |
| 3 · Perfil y objetivo | 3 preguntas (para qué, horizonte, cuánto te inquietan las caídas) que adaptan misiones y avisos, sin elegir empresas | ⬜ |
| 4 · Comunidad | tu cartera frente a la media (anónimo); seguir y copiar carteras públicas como punto de partida; «cartera de la semana»; niveles sin suspenso; perfil público | ⬜ |
| 5 · Liga con precios | índice de cada cartera que empieza en 100; rendimiento ajustado al riesgo | 🟡 Temporada 0 hecha; falta fuente de precios |
| 6 · Publicar | Cloudflare, datos reales de la SEC, correo (Brevo), revisión legal | ⬜ (lo último) |
| Más adelante | correo semanal y notificaciones, calendario de resultados, importar cartera desde CSV, comparar 4 empresas, modo sin conexión, páginas indexables por empresa | ⬜ |

## 5 · La Liga, en resumen
- **Temporadas de 12 semanas**, sin dinero ni premios en dinero; gana quien mejor construye y cuida su cartera.
- **Hasta 100 puntos por semana:** **Equilibrio 50** (concentración baja 25 · media 12; variedad amplia 25 · media 12; con ≥ 4 posiciones y al 100 %), **Aprendizaje 30** (reto de la semana 20; idea guardada o revisada 10), **Constancia 20** (entrar esa semana 10, +2 por semana seguida).
- Una cartera por temporada (cambiable solo las 2 primeras semanas); cuenta la foto del lunes; desempate por semanas con concentración baja.
- **Ligas privadas:** código de 6 letras, «Invitar» con el menú del móvil, clasificación solo con apodos. Insignias al final: oro (10 %), plata (25 %), bronce (50 %) y «completada».
- Reglas completas: `ronda36/LIGA.md`.

## 6 · Marketing (plan aprobado en C51, `ronda36/PLAN-MARKETING.md`)
- **Crecer con el propio producto**, no con anuncios: **tarjeta para compartir** (hecha), **«reta a un amigo»**, **ligas privadas** entre amigos o de clase.
- **Canales:** TikTok, Reels y Shorts con el mismo vídeo; Reddit y foros; universidades; SEO a medio plazo.
- **Lanzamiento:** lista de espera → beta con 50–100 «fundadores» → día D → cada temporada de la Liga como relanzamiento.
- **Métrica principal:** cuántas cuentas nuevas llegan por enlaces compartidos (coeficiente viral).
- **Legal (España):** nunca decir qué comprar ni prometer nada; #publi en colaboraciones; revisión legal antes del día D.

## 7 · Decisiones pendientes de Javier
1. **Cuentas** de Cloudflare y Brevo y secretos de GitHub (para publicar la web y cargar datos reales).
2. **Revisión legal** antes del lanzamiento (carteras públicas, ligas, invitaciones).
3. **Repositorio de GitHub: hoy es PÚBLICO** (cualquiera puede ver el código). Recomendado: hacerlo privado.
4. **Fuente de precios** para la Liga con rentabilidad (cuando se presenten opciones).
5. **Quién sale en los vídeos** (Javier, voz en off o grabaciones de pantalla) y **lista de espera** por correo (Brevo, recomendado) o Telegram.
6. Integrar la rama en `main` (recomendado tras un piloto con 5 personas) y versión congelada para ese piloto.

## 8 · Dónde está cada cosa (repositorio)
- `PENDIENTES.md` → todo lo pendiente; secciones ★★★ (hoja de ruta) y ★★ («Para Javier»).
- `procesos-klever/` → memoria del proyecto: `05-estado-actual.md` (estado), `03-decisiones.md`, `06-peticiones-del-usuario.md` (todo lo pedido, literal), `09-registro-de-cambios.md`.
- `ronda33/PLAN.md` (hoja de ruta) · `ronda32/PROPUESTA.md` (diagnóstico y propuesta) · `ronda35/INSPIRACION.md` (Darwinex Zero y el vídeo) · `ronda36/LIGA.md` · `ronda36/PLAN-MARKETING.md` · `DESIGN.md` (sistema de diseño).
- Código: `public/` (interfaz), `functions/api/` (servidor), `migrations/` y `schema.sql` (base de datos), `tests/` (pruebas; `bash tests/run-all.sh`).

## 9 · Siguiente paso previsto
Terminar la **fase 2**: menos texto en toda la app, Descubrir como feed, editar la cartera con los dedos y el primer minuto «wow»; después, **Perfil y objetivo** y **Comunidad**.

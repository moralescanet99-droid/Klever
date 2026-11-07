# 11 · Traspaso al supervisor (Claude Opus)

**Desde 2026-11-06 quien supervisa y encarga el trabajo es un Claude Opus** (elegido por Javier; antes lo hacía ChatGPT, circuito terminado: ver `03-`). Este documento es lo mínimo para empezar. Lee después `README.md`, `05-estado-actual.md` y `08-entorno-y-trampas.md`; el detalle histórico está en `04-`, `06-` y `07-`.

## Qué es Klever
Beta **gratuita** de carteras **simuladas** (Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias; español de España). Promesa aprobada: *«Construye tu cartera, entiende sus puntos débiles y prueba cambios antes de decidir»*. Restricciones permanentes: coste 0 €, sin dinero real, **sin recomendaciones**, precios solo con widgets de TradingView intactos, sin fuentes externas ni dependencias de pago, sin testimonios ni rentabilidades inventadas, datos de prueba inventados.

## Quién decide qué
- **Javier (decide):** publicar, desplegar, cuentas externas (Brevo, Cloudflare), cobrar, el piloto con personas y a quién se invita, qué ramas se integran, cambios de alcance o de promesa.
- **Supervisor (encarga y revisa):** prioriza, redacta encargos concretos y acotados, revisa los informes y las pruebas, acepta o rechaza el cierre de cada ronda, exige evidencia.
- **Claude Code (ejecuta):** implementa, prueba, documenta, informa con honestidad. No decide alcance ni publica; no crea pull requests salvo petición expresa.

## Cómo se trabaja (reglas que no cambian)
1. Por **rondas**: encargo → implementación → pasada completa (`bash tests/run-all.sh`) → informe en `rondaNN/LEEME.md` → memoria en `procesos-klever/` → commit y push → ZIP verificable (`scripts/entrega/crear-zip.sh` / `verificar-zip.sh`).
2. **Implementado / probado / pendiente**, siempre separados. Se declara lo que no se ha comprobado (dispositivo físico, Safari/Firefox, lector de pantalla, D1 remota, correo real, personas).
3. **No se rebajan aserciones** para pasar: una prueba solo se adapta si la interfaz cambió a propósito, y se declara (ejemplo: `testH` H4 ≤ 3 en la evolución 25).
4. Cada regresión encontrada se acompaña de una prueba que **falla sin la corrección**.
5. Antes de commitear: `git diff wrangler.toml` vacío (el `database_id` sigue siendo el marcador) y sin `.dev.vars`. Sin claves, tokens ni correos personales en el repositorio.
6. Rama de trabajo del piloto: `ccr-b652a7eb-uukhdy`. Evolución visual: `evolucion-25`. No se empuja a otras ramas sin permiso de Javier.

## Dónde estamos (2026-11-06)
| Línea | Estado |
|---|---|
| **Producto R23** | Implementado; pasada completa 960/0 (local del autor); B1/B2 cerrados. |
| **Piloto privado `piloto-r23`** | Preparado (ronda 24): versión congelada con verificación de hashes (`scripts/piloto/`), entorno con persistencia, guion con la incidencia del intento incierto, registro vacío. **Falta** la verificación previa en el dispositivo de Javier y reclutar 5 principiantes. No se ha hecho ninguna sesión. |
| **Evolución visual 25 (`evolucion-25`)** | Integrada sobre R24; pasada completa 961/0 tras corregir 5 regresiones del patch. **Falta** móvil real, ETF/datos ausentes a la vista, 5 usuarios y decidir 4 observaciones visuales menores (`ronda25/LEEME.md`). No sustituye al piloto. |
| **Evolución 26 (rama `claude/klever-visual-interactive-evolution-h6n454`)** | Sobre `evolucion-25`: señales, comparación instantánea, Cuaderno de un vistazo, nueva promesa «antes de invertir» (`ronda26/LEEME.md`). Decidido: promesa y umbrales; piloto sobre `piloto-r27` (un grupo); sin integrar en `main` hasta el piloto. Pendiente: verificación en dispositivo y 5 personas. |
| **Limitación conocida** | **Corregida en la ronda 27** (el intento incierto se conserva en el dispositivo y se reenvía con la misma clave; `ronda27/LEEME.md`). Siguen declarados: cierre de sesión a propósito, purga por otra cuenta, otro dispositivo. |
| **No demostrado** | Demanda, retención espontánea, disposición a pagar, utilidad con datos reales. El piloto es diagnóstico de usabilidad, no estadístico ni comercial. |

## Decisiones abiertas para el supervisor y Javier
1. ¿Se integra `evolucion-25` en la rama principal, se ajusta o se descarta? ¿Se prueba con usuarios antes de integrarla?
2. ¿El piloto se hace sobre `piloto-r23`, sobre `evolucion-25` o con dos grupos? (Mezclar invalida la comparación.)
3. ¿Se corrige ya la limitación del intento pendiente o solo antes de una beta pública?
4. Criterio de éxito del piloto: se mantiene «4 de 5 completan sin ayuda sustancial, comprenden la simulación y todos recuperan lo guardado».

## Trampas ya conocidas (resumen; detalle en `08-`)
- `scripts/local/servidor.sh start` **resiembra** la base: no sirve para el piloto (`scripts/piloto/abrir-piloto.sh`).
- La primera carga tras arrancar el servidor puede ser lenta (mitigada con calentamiento; **causa no demostrada**) y puede dar fallos en cascada en una batería: repetir antes de concluir.
- `tests/run-all.sh` escribe en carpetas de rondas antiguas: restaurarlas (`git checkout -- ronda…; git clean -fdq ronda…`) antes de commitear.
- Chromium puede no arrancar en algunos entornos (`socket() failed`): declararlo, no darlo por pasado.

## Qué espera Javier de cada informe
Corto y verificable: qué se pidió, qué se hizo, qué se probó (con cifras y commit), qué falló por el camino, qué queda sin comprobar y qué decisión necesita. Sin afirmar nada que no se haya ejecutado.

## Actualización 2026-11-07 (rondas 26–28)
- Rama de trabajo actual: `claude/klever-visual-interactive-evolution-h6n454` (contiene `evolucion-25`). `main` sin cambios. Piloto congelado: `piloto-r27` = commit `f991fd8`.
- Hecho: evolución visual 26, corrección de la duplicación (27), fases 1 y 2 del plan a 10 (28). Última pasada completa: **1094/0** (`0f5cfc9`).
- Siguiente: fase 3 (piloto con 5 personas; decidir si sobre `piloto-r27` o una versión `piloto-r28` con las fases 1–2) y fase 4 (producción). Punto 14 (volver y valor): retomado en las rondas 29 y 30; lo que falta (SEC real, correo semanal, criterio de 10) está en `PENDIENTES.md` § ★.
- Demo privada: https://claude.ai/artifact/TiRC9VLhtzt3ComjiYNyUw
- 2026-11-07 · Ronda 29 (fase 2.5): arranque guiado, huella, «Tu semana» y retos; regresión de privacidad corregida; última pasada **1121/0** (`cd27c09`). Memoria automática con hooks (`.claude/settings.json`).
- 2026-11-07 · Ronda 30 (C37): foto semanal en el servidor (migración 0013), evolución, reto de la semana y ciclo de las ideas. Ver `ronda30/LEEME.md`.

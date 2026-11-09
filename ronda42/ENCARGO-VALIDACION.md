# Ronda 42 · Paquete de validación (C58 + C60)

Antes de construir nada, Javier quiere **evidencia, no opinión**.

**Restricciones fijas:**
- tres secciones (Mi cartera · La Liga · Construye);
- sin supuestos prácticos;
- reglas legales de Klever (`CONTEXTO-KLEVER.md` §2).

**Funciones a evaluar:** las de `ronda40/INFORME-APP-FINAL.md` §6 y las ideas de juego de `ronda41/LIGA-FANTASY.md` §3 (*draft*, reglas configurables, cierre del lunes, puntos provisionales, puntuación abierta, tesis de la semana, cartera ideal sin empresas, modos, divisiones, fichaje limitado, escudo).

**Reglas de trabajo:**
- Parte de **material crudo**: textos legales originales, datos reales y reseñas reales, no resúmenes.
- Distingue siempre **comprobado** de **supuesto**.
- Español de España y lenguaje llano.
- No escribas código de la app.
- No hagas commit.

## Entregables (cada agente hace los suyos, en `ronda42/validacion/`)
1. **`01-mapa-de-supuestos.md`**: los 10 supuestos de los que depende la app, ordenados por riesgo × incertidumbre. Para cada uno:
   - cómo se prueba;
   - cuánto cuesta;
   - **el resultado que haría cambiar el plan**, fijado de antemano.
2. **`02-matriz-legal.md`**: cada función evaluada frente a los criterios de «asesoramiento en materia de inversión», con cita literal del artículo. Fuentes:
   - art. 4.1.4 de MiFID II (Directiva 2014/65/UE);
   - art. 9 del Reglamento Delegado 2017/565;
   - Ley 6/2023 de los Mercados de Valores;
   - CESR/10-293 «Understanding the definition of advice»;
   - documento de ESMA sobre gamificación (2023) y guía de *finfluencers* de la CNMV (2026);
   - Ley 13/2011 del juego, art. 3;
   - art. 7 de la LOPDGDD.

   Incluye las 8 ideas legales de `ronda41` §4 y redacta la **consulta para el Portal FinTech de la CNMV o para un abogado**.
3. **`03-kit-investigacion.md`** y **`03-hoja-resultados.csv`**:
   - guion de entrevista (*Jobs to be Done* + *The Mom Test*);
   - guion de prueba de uso con 6 tareas;
   - prueba de árbol para los nombres de las 3 secciones;
   - encuesta Kano, con las ideas *fantasy* incluidas;
   - criterios de éxito fijados de antemano (al menos el 80 % completa «crea tu cartera» y SUS de 70 o más);
   - instrucciones para que Javier lo haga solo.
4. **`04-liga-a-mano.md`**: la Liga para 4 semanas y 20 personas, sin código:
   - reglas, incluido el modo *draft* en versión papel;
   - hoja de puntuación;
   - mensajes semanales;
   - umbral de abandono (menos del 30 % activos en la semana 4 = rediseñar).
5. **`05-experimento-edgar.md`** (+ datos en CSV): medir en 30 empresas reales de la SEC (`data.sec.gov`, User-Agent descriptivo **sin correos personales**, máximo 10 peticiones por segundo):
   - qué porcentaje trae ventas por región en XBRL (`srt:StatementGeographicalAxis`), sede y moneda de informe;
   - comprobado a mano en 5 empresas.
6. **`06-experimento-votacion.md`**: votación en tiempo real con Durable Objects en local (wrangler o miniflare, en el scratchpad, **no en el repositorio**):
   - funciona o no;
   - mensajes y peticiones por votación;
   - estimación del consumo del plan gratuito para 1.000 equipos.
7. **`07-resenas-competencia.md`** (+ CSV): reseñas de 1–3 estrellas de la App Store España (RSS público `itunes.apple.com/es/rss/customerreviews/id=<id>/sortBy=mostRecent/json`) de LaLiga Fantasy (968915185), Biwenger, Trading 212 y 1–2 simuladores de bolsa o apps de educación financiera:
   - quejas agrupadas por tema, con recuento y citas literales;
   - lecciones para Klever.
8. **`08-que-cambia.md`**: lo escribe el coordinador. Qué cambia del informe de la ronda 40 según la evidencia y qué queda pendiente de los datos con personas.

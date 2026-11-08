# Ronda 37 · Si rehiciéramos Klever desde cero (C53)

> Encargo de Javier: «Si tuvieses que volver a crear la empresa, ¿cómo la harías? Quiero que se vea muy futurista y que la web no sea estática. Desarrolla todos los agentes que necesites y dime todas las ideas que tengas y qué cambiarías».
>
> Cómo se hizo: tres agentes en paralelo (auditoría del código actual, investigación de diseño y competidores, estrategia de producto) y un **prototipo interactivo** (`ronda37/prototipo-klever-2.html`).
> **Estado:** es una **propuesta**. No cambia la app actual. Nada se ha decidido hasta que Javier lo apruebe.

---

## 1 · El diagnóstico en una frase
El núcleo de Klever es bueno: los cálculos, las señales, la huella y las reglas de la Liga. Lo que pesa es lo que se ha ido amontonando: **36 rondas de capas, unos 20 conceptos para el usuario y más documentación que producto**. Además, la web se siente estática porque **nada se mueve si no lo tocas**.

### Datos de la auditoría
- **Código:** unos 460 KB de JavaScript sin minificar. `app.js` ocupa 108 KB y `lab.js` 110 KB. Hay 100 `innerHTML`, 14 vistas en un único `index.html` y una hoja CSS de 1.746 líneas con 25 `!important`.
- **Repositorio:** de 4.714 archivos, **solo 74 son producto**. El resto son `rondaN/` y evidencias: 1.917 PNG, unos 223 MB de evidencias y 311 MB de historial. Hay ZIP en la raíz y una segunda copia de la app en `demo/`. Además, el repositorio es **público**.
- **Pruebas:** 68 baterías y unos 15 minutos. Tienen nombres por ronda (`testR`, `testAH`), así que nadie sabe qué cubre cada una.
- **Producto:** Revisión, Señales y Laboratorio son un mismo flujo partido en tres. Cuaderno, Ideas, Notas y Radar son cuatro maneras de «guardar». Tu semana, Temporada y Liga son tres puntuaciones distintas.
- **Qué hay que conservar sí o sí:** `calculos.js` (las décimas exactas), `senales.js` (propone pesos, nunca empresas: es el núcleo legal), `huella.js` (distingue «sin datos» de «no superada»), `liga.js` (premia el equilibrio y no el riesgo), el modelo de datos de D1, el acceso por enlace sin contraseña, el contador anónimo y todas las reglas legales.

## 2 · La nueva idea de producto
**Posicionamiento propuesto:** *«Klever, el simulador de tu cartera: constrúyela, ponla a prueba y mira cómo aguanta antes de arriesgar un euro.»* El lema actual, «Practica antes de arriesgar», se mantiene.

**Bucle central (uno solo): «el lunes de Klever».**
1. Cada lunes, tu cartera vive un **escenario**. Puede ser una semana real del pasado sin saber cuál es (2008, el covid, 2022) o un golpe hipotético.
2. Decides en dos minutos: **aguantar, reequilibrar o vender**.
3. Ves tu **Temple** (si te dejaste llevar por el pánico) y tu **equilibrio**, y te comparas con tus amigos en la Liga.
4. Se revela qué escenario era y te llevas una **tarjeta para compartir**.

**De unos 20 conceptos a 5 pantallas:**
| Nueva | Junta lo que hoy es |
|---|---|
| **Hoy** | Hoy + Tu semana + Temporada + reto |
| **Mi sistema** | Editor + Revisión + Señales + Laboratorio (un solo panel «¿y si…?» en directo) |
| **Descubrir** | Explorar + Revista + Huella + Comparador (un feed de tarjetas que se deslizan) |
| **Guardado** | Cuaderno + Ideas + Notas + Radar |
| **Liga** | Liga + ligas privadas + duelos |

## 3 · Cómo se vería: futurista y viva (probado en el prototipo)
1. **Tu cartera como un sistema planetario vivo.** Cada empresa es un planeta: su tamaño es el peso y su color, el sector. Si una pesa demasiado, **el sistema se tambalea**. Se gira con el dedo, y al tocar un planeta se ve qué es. *(Hecho en el prototipo.)*
2. **Todo reacciona en directo.** Mueves un peso y cambian a la vez el planeta, los semáforos, la «estabilidad», el escenario y **tu puesto en la Liga**, que se reordena con animación. *(Hecho en el prototipo.)*
3. **Máquina de escenarios.** Botones como «Tecnología −30 %» o «Tipos altos», con un índice que empieza en 100 y se dibuja animado. Compara tu cartera con una igualada. Es pura aritmética sobre tus pesos y lleva la etiqueta «ilustrativo». *(Hecho en el prototipo.)*
4. **Descubrir como historias.** Cartas que se deslizan (derecha: añadir; izquierda: siguiente), con la huella que se dibuja sola y vibración en Android. *(Hecho en el prototipo.)*
5. **Liga en directo** con animación al reordenarse. *(Hecho en el prototipo.)*
6. **Pendiente para la versión real:**
   - transiciones entre pantallas (View Transitions: la esfera «se convierte» en la ficha);
   - números que cuentan al cambiar;
   - animaciones al hacer scroll;
   - paneles de cristal «Liquid Glass» ligeros;
   - escena 3D (Three.js) cargada solo cuando se pide, con una versión plana si el móvil es lento o si está activado «reducir movimiento».

**Identidad visual:** se mantiene el **cobre** como la luz de Klever, ahora sobre un **espacio** casi negro. El azul «plasma» queda para lo simulado. La tipografía de titulares pasa a ser geométrica y ancha (Unbounded), las cifras van en monoespaciada y el texto, en una sans legible.

**Presupuesto de rendimiento** (móvil Android de gama media):
- Primera carga: ≤ 170 KB de JS. El 3D va aparte, con un máximo de 300 KB y carga diferida.
- Interacción (INP): ≤ 200 ms.
- Animar solo `transform` y `opacity`.
- Pausar la escena cuando no se ve.
- Respetar siempre «reducir movimiento» y «reducir transparencia».

## 4 · Todas las ideas (ordenadas por impacto/esfuerzo)
| # | Idea | Por qué engancha | Riesgo legal |
|---|---|---|---|
| 1 | **Máquina del tiempo a ciegas**: tu cartera revive una crisis real sin saber cuál es | Tensión y sorpresa; vídeo perfecto | Bajo |
| 2 | **Temple / botón del pánico**: mide cómo reaccionas, no al mercado | Te mide a ti | Bajo |
| 3 | **Duelos 1 contra 1 por enlace, sin cuenta**: mismo escenario, dos carteras | Pique entre amigos en 60 s | Bajo |
| 4 | **Resumen de temporada al estilo «Wrapped»** + tarjeta para compartir | Algo de lo que presumir | Bajo |
| 5 | **Cartera como planeta vivo** (prototipo) con aspectos cosméticos | Impacto visual; identidad | Bajo |
| 6 | **Ligas de clase y universidad** con panel para el profesor | Grupo cerrado y alguien que empuja | Bajo |
| 7 | **Temporadas con historia** («La década perdida», «Inflación de los 70») | Motivo para volver cada semana | Bajo |
| 8 | **Modo a ciegas**: activos sin nombre | Destapa prejuicios; retos virales | Bajo |
| 9 | **Pregunta diaria de 20 s** («¿Cuánto crees que cayó?») + calibración | Hábito ligero | Bajo |
| 10 | **Primer minuto sin cuenta**: eliges 3–5 esferas, reparto automático, primera señal animada | Activación | Bajo |
| 11 | **Editar con los dedos**: anillo arrastrable con física de muelle | Sensación de app nativa | Bajo |
| 12 | **«Si hubiera empezado a los 18»** con aportación mensual simulada | Habla de su vida | **Medio**: enseñar siempre el peor caso y que el pasado no garantiza el futuro |
| 13 | **Ligas de creadores** (divulgadores) | Llegar a sus seguidores sin anuncios | **Medio**: contrato que prohíba recomendar (guía de *finfluencers* de la CNMV, mayo de 2026) |
| 14 | **Espejo**: subes tu cartera real (CSV), se analiza solo en tu móvil | Gran «ajá» para quien ya invierte | **Medio** |
| 15 | **Coach con IA que explica y nunca recomienda** | Dudas al momento | **Alto**: solo después de la revisión legal |

**Empezaría por:** 1, 2, 3, 4 y 10. Las 14 y 15 quedan para después de la revisión legal.

**Una decisión de fondo que debe tomar Javier:** el agente de estrategia propone que las carteras se hagan con **tipos de activo y sectores** («bolsa EE. UU.», «tecnología», «bonos», «oro») en vez de empresas sueltas. Así baja el riesgo de que parezca una recomendación y bastan datos históricos gratuitos. A cambio, se pierden la huella y las fichas de empresa, que hoy son una de las señas de Klever. **Mi recomendación:** hacer las dos cosas. Los escenarios funcionarían con sectores, y la huella seguiría en Descubrir como aprendizaje.

## 5 · Cómo lo construiría (técnica, siempre a 0 €)
1. **Repositorio nuevo y privado.** Solo el producto. Las rondas y las evidencias pasan a un archivo aparte, sin ZIP ni PNG en el historial.
2. **Vite + Svelte (o Preact) con TypeScript** en la lógica pura, componentes en vez de `innerHTML` y rutas reales. Despliegue en Cloudflare Pages + D1, como hasta ahora.
3. **Se trasladan tal cual** `calculos`, `senales`, `huella` y `liga`, con sus pruebas unitarias.
4. **Pruebas por función y en menos de 3 minutos:** Vitest para la lógica y unos 12 recorridos con Playwright (`liga.spec`, `editor.spec`…), con capturas visuales solo de 4 pantallas.
5. **Datos:**
   - Fundamentales de **SEC EDGAR** (oficial y gratuito).
   - Tipos de cambio del **BCE**.
   - Precios de cierre diarios con un único trabajo nocturno en GitHub Actions que los guarda en D1. Los planes gratuitos de Twelve Data o FMP pueden ser **solo para uso no comercial**: hay que revisar sus términos.
   - **Descartado:** Yahoo/yfinance (no es oficial y bloquea) y Stooq (desde marzo de 2026 pide una clave con CAPTCHA).
6. **Un proceso más ligero:** un archivo de decisiones y un registro de cambios. Pruebas en verde en cada cambio, pero sin ZIP de evidencias por ronda. **Publicar pronto** y aprender con personas reales.

## 6 · Modelo de negocio (sin recomendar nunca)
- **Recomendado:** licencias para **clases y universidades** (panel del profesor, temporadas privadas), además de **subvenciones y alianzas educativas** (Plan de Educación Financiera de la CNMV y el Banco de España, fundaciones).
- **Complemento:** **cosméticos** del planeta, sin cajas sorpresa y sin dar ventaja en la Liga.
- **No:** patrocinio de brókeres ni comisiones por captar clientes. Es una zona legal delicada y rompería la promesa «aquí nadie te vende nada».

## 7 · Plan de 90 días y métricas
- **Días 1–30:** el bucle (escenario, Temple, duelo y tarjeta) con 4 crisis, el sistema planetario y el primer minuto. Piloto con 5 personas. Revisión legal.
- **Días 31–60:** beta con 100 fundadores y 3 ligas de clase. Un vídeo al día: «¿Aguantarías 2008?».
- **Días 61–90:** lanzamiento público con la Temporada 1, «Las 5 crisis».

Los objetivos son de trabajo, no previsiones:
- activación ≥ 50 %;
- vuelve al día siguiente ≥ 35 %, a los 7 días ≥ 20 % y a los 30 días ≥ 10 %;
- duelos aceptados ≥ 25 %;
- coeficiente viral ≥ 0,3;
- 10 aulas en piloto.

## 8 · Riesgos
- **CNMV (parecer asesoramiento):** nada de «la acción de la semana», ningún consejo personalizado y revisión legal antes de abrir.
- **Mirar el pasado con ventaja:** enseñar siempre el peor caso y rotular «pasado y simulado».
- **Retención:** el ritmo es semanal, no diario. Temporadas con historia y el empuje social de duelos y ligas.
- **Capacidad:** Javier no programa. Mejor pocas cosas y bien.

## 9 · Decisiones para Javier
1. ¿Refundación (repositorio y código nuevos, reutilizando la lógica) o evolución de la app actual?
2. ¿El bucle «el lunes de Klever» con escenarios y Temple como centro del producto?
3. ¿Carteras con empresas, con sectores o con las dos cosas (recomendado)?
4. ¿La nueva identidad «espacio y cobre» con el sistema planetario?
5. ¿Hacer privado el repositorio? (Ya estaba pendiente.)

## Fuentes de la investigación (comprobadas por el agente; el resto, marcado como no verificado en su informe)
- **View Transitions (Chrome):** https://developer.chrome.com/docs/web-platform/view-transitions
- **Animaciones con scroll (MDN):** https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll-driven_Animations
- **Liquid Glass según Linear:** https://linear.app/now/linear-liquid-glass
- **SEC EDGAR:** https://www.sec.gov/os/accessing-edgar-data
- **Problemas de Stooq:** https://github.com/pydata/pandas-datareader/issues/1012
- **Bloqueos de yfinance:** https://github.com/ranaroussi/yfinance/discussions/2431
- **Guía de *finfluencers* de la CNMV (Cuatrecasas):** https://www.cuatrecasas.com/es/global/propiedad-intelectual/art/cnmv-publica-guia-finfluencers
- **Cuenta demo de eToro:** https://etoro.com/trading/demo-account
- **Modo práctica de Trading 212:** https://helpcentre.trading212.com/hc/en-us/articles/360007380937

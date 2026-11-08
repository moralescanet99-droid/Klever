# AUDITORÍA CONTRARIA — Mapa de problemas v0.1

**Relevo ejecutado:** H-001 (ChatGPT → Claude)
**Tarea:** T-004 — Auditoría contraria del mapa
**Autor de la auditoría:** Claude · **Revisor previsto:** ChatGPT
**Fecha:** 08/11/2026
**Documentos leídos:** 00, 01, 02, 03, 04, 05, 06, 07
**Veredicto:** **Aprobado con cambios** — la lista reducida (sección 4) es utilizable; la puntuación «Encaje inicial» del v0.1 debe rehacerse.

> Nivel de evidencia de esta auditoría: **E0–E1**. No se ha realizado investigación nueva ni se han comprobado las fuentes enlazadas. Todo lo que sigue es análisis e inferencia, no validación. Las valoraciones de frecuencia, urgencia o disposición a pagar son hipótesis que deben contrastarse.

---

## 1. Qué intenta conseguir el entregable (una frase)

Elegir, entre problemas reales del inversor principiante, cuáles merecen investigación primaria antes de proponer ningún producto.

**Comprobación contra el criterio de T-003** («20–30 problemas, agrupados y razonados»): cumple en volumen y agrupación; **no cumple en razonamiento**, porque la columna «Encaje inicial» carece de criterios definidos y las señales de mercado no están conectadas con ningún problema concreto.

---

## 2. Hallazgos

### 2.1. Críticos

**C-1 — Sesgo hacia un analizador de carteras (patrón Klever).**
No tengo acceso al contenido de Klever (el repositorio está vacío), pero el Documento Maestro (§3.1) advierte expresamente contra «elegir ya una aplicación de inversión» o «reutilizar Klever», lo que indica que Klever es una aplicación de inversión. El mapa contradice esa advertencia:

- Las 8 valoraciones «Muy alto» se concentran en P-13, P-14, P-15, P-16, P-26 y P-30. Seis de ellas (P-13 a P-16, P-26 y en parte P-18/P-29) describen, juntas, las funciones de una misma aplicación: subir la cartera → ver exposición real → detectar solapamientos → simular una compra → recibir educación contextual.
- Varios «problemas» son soluciones redactadas como carencias: P-26 («la educación está separada de su cartera real») presupone que la respuesta es educación integrada en la cartera; P-29 presupone un feed de noticias filtrado por exposición; P-18 presupone un indicador de encaje.
- La lista de «mayor encaje preliminar» se justifica por «la combinación de activos de Javier», es decir, por facilidad de construcción, no por intensidad del problema.

*Corrección:* puntuar los problemas con criterios explícitos e independientes del fundador (frecuencia, urgencia, gasto actual, canal) y evaluar el encaje con Javier en una columna separada y posterior.

**C-2 — Estrechamiento del alcance no registrado como decisión.**
D-006 prioriza la *intersección* finanzas + producto digital + automatización y D-007 admite «consumidores online **o** inversores principiantes». El mapa se titula «Inversor principiante digital» y cubre exclusivamente ese cliente. La rama de e-commerce/marcas/productos y la de consumidor online no inversor quedan descartadas sin decisión ni motivo. Esto es exactamente el tipo de cambio que §00 obliga a registrar en `02_DECISIONES.md`.

*Corrección:* Javier debe confirmar o rechazar el estrechamiento (ver decisión propuesta D-011 en el relevo).

**C-3 — «Encaje inicial» no está definido.**
No hay escala, criterios ni fuente para «Medio / Alto / Muy alto». 22 de 30 problemas son «Alto» o superior, por lo que la columna no discrimina. Funciona como opinión interna (E0) presentada con apariencia de puntuación.

### 2.2. Importantes

**I-1 — Las señales de mercado no prueban demanda pagadora; algunas apuntan en contra.**
- Baja alfabetización financiera describe a una población con *menor* probabilidad de buscar y pagar herramientas de análisis, no mayor.
- «Solo el 35 % compara alternativas» (P-07) es evidencia de que la mayoría **no** realiza el comportamiento que un comparador necesita. Es un argumento contra P-07 como negocio, no a favor.
- El interés de ESMA, BCE y CNMV indica riesgo regulatorio creciente en el espacio, no oportunidad comercial.
- Ninguna señal está vinculada a un problema concreto ni demuestra pago, búsqueda o apaño (E2).

**I-2 — Contradicción entre cliente y problema en el Grupo C.**
Un principiante típico tiene 1–3 fondos indexados o ETF globales. Los problemas de solapamiento, exposición agregada y atribución (P-13 a P-17) aparecen sobre todo en carteras con muchas posiciones, es decir, en inversores intermedios. O se cambia el cliente o se acepta que el problema es pequeño para el principiante. Hay que comprobarlo antes de priorizar el grupo.

**I-3 — Sustitutos gratuitos ignorados.**
Para exposición, solapamiento y X-Ray de carteras existen herramientas gratuitas o incluidas en brókers y webs de fondos (comparadores de solapamiento de ETF, X-Ray de proveedores de datos, hojas de cálculo compartidas en foros). Para educación general el contenido gratuito está saturado. La disposición a pagar en estos problemas debe tratarse como *desfavorable hasta demostrar lo contrario*.

**I-4 — Problemas latentes frente a problemas sentidos.**
Muchos problemas están redactados desde el punto de vista del experto («no sabe», «no distingue», «confunde»). Un problema que el usuario no percibe no genera búsquedas ni pagos. Cada candidato debe reformularse en el lenguaje del usuario y en el **momento** en que aparece (P. ej., «voy a hacer la renta y no sé declarar mis fondos» frente a «no comprende sus obligaciones fiscales»).

**I-5 — Riesgo de asesoramiento regulado no señalado.**
En España el asesoramiento en materia de inversión (recomendación personalizada sobre instrumentos concretos) es actividad reservada a entidades autorizadas por la CNMV. El mapa no marca qué problemas empujan hacia ese límite (ver tabla 3). *Esto es una advertencia general, no una opinión jurídica; si un candidato avanza, el encaje regulatorio debe verificarse en fuentes oficiales.*

**I-6 — Omisión de problemas presentes en la propia evidencia.**
El mapa cita las reclamaciones a la CNMV (comisiones, falta de información, incidencias de compraventa) pero no incluye el problema de **reclamar**. Tampoco aparece la **fiscalidad** de las inversiones, que es el problema del inversor español con calendario, obligación y gasto actual más claros (ver 2.4).

### 2.3. Mejoras

- **M-1** — Fecha del mapa y del Documento Maestro: 9/11/2026, posterior a la fecha de esta auditoría (8/11/2026). Corregir o aclarar.
- **M-2** — Las cifras de las fuentes (19 %/27 %, 35 %, 1.398 reclamaciones, 12.538 consultas) no han sido verificadas en esta auditoría. Registrar cada una en `04_EVIDENCIAS.md` con fecha de consulta.
- **M-3** — Añadir a cada problema el **momento desencadenante** y la **solución actual**, que ya exige la Ficha de oportunidad de `04`.

---

## 3. Revisión problema por problema

**Leyenda.** Riesgo regulatorio (R): Bajo / Medio / Alto según cercanía a recomendación personalizada. Datos/integraciones (D): coste o dependencia de datos de mercado, conexiones bancarias o importaciones. Decisión: **Mantener**, **Fusionar** (en el candidato indicado) o **Eliminar**.

| ID | R | D | Decisión | Motivo principal |
|---|---|---|---|---|
| P-01 | Medio | Bajo | Fusionar → C-08 | Momento claro y muy buscado («¿invierto o ahorro primero?»); por sí solo, una vez en la vida |
| P-02 | Alto | Bajo | Fusionar → C-08 | Traducir objetivos a riesgo roza la recomendación personalizada |
| P-03 | Bajo | Bajo | Eliminar | Conceptual; resuelto por contenido gratuito; sin momento de compra |
| P-04 | Medio | Bajo | Fusionar → C-08 | Variante de P-01 |
| P-05 | Medio | Bajo | Fusionar → C-08 | Real pero vago; la salida natural («dime qué comprar») es asesoramiento |
| P-06 | Bajo | Bajo | Fusionar → C-05 | Meta-problema que el usuario no percibe |
| P-07 | Bajo | Medio | Fusionar → C-03 | La propia evidencia indica que la mayoría no compara |
| P-08 | Bajo | Medio | Mantener → C-02 | Concreto, cuantificable, con documentación pública (KID) |
| P-09 | Bajo | Medio | Reformular → C-07 | Demasiado amplio; se acota al dinero de corto plazo |
| P-10 | Bajo | Medio | Fusionar → C-02 | El usuario no quiere leer documentos; lo que importa es el coste y el riesgo |
| P-11 | Bajo | Bajo | Fusionar → C-03 | Mismo momento que P-07 |
| P-12 | Bajo | Bajo | Mantener → C-04 | Momento urgente; registros oficiales públicos |
| P-13 | Medio | Alto | Fusionar → C-01 | Patrón Klever; depende de datos de composición |
| P-14 | Medio | Alto | Mantener → C-01 | El más concreto del Grupo C; sustitutos gratuitos |
| P-15 | Medio | Alto | Fusionar → C-01 | Igual que P-13 |
| P-16 | **Alto** | Alto | Eliminar | Evaluar una compra concreta para un usuario concreto es lo más cercano a recomendación personalizada del mapa |
| P-17 | Bajo | Alto | Eliminar | Problema de inversor avanzado; requiere histórico completo de operaciones |
| P-18 | Alto | Medio | Fusionar → C-01 | Presupone una solución (indicador de encaje) |
| P-19 | Bajo | **Muy alto** | Eliminar | Agregación entre brókers sin API abierta en España: integración prematura |
| P-20 | Medio | Medio | Mantener → C-09 | Periódico y recurrente; disposición a pagar dudosa |
| P-21 | Medio | Bajo | Fusionar → C-09 | Real pero difícil de monetizar por sí solo |
| P-22 | Bajo | Bajo | Eliminar | Nicho de inversor disciplinado; no lo sufre el principiante |
| P-23 | Alto | Bajo | Eliminar | Infrecuente y cercano a asesoramiento |
| P-24 | Bajo | Medio | Fusionar → C-06 | Se vuelve urgente en el momento fiscal |
| P-25 | Bajo | Bajo | Eliminar | Mercado de contenido saturado y dependiente de autoridad pública (choca con «sin exposición») |
| P-26 | Medio | Alto | Eliminar | Es una solución, no un problema (sesgo C-1) |
| P-27 | Bajo | Bajo | Eliminar | Vago; sin momento ni gasto |
| P-28 | Bajo | Bajo | Eliminar | Vago; el usuario no percibe que lo necesita |
| P-29 | Medio | Alto | Eliminar | Requiere datos de noticias y exposición; encaje bajo en principiantes |
| P-30 | Bajo | Bajo | Mantener → C-05 | Riesgo creciente (finfluencers, fraude); disposición a pagar incierta |

---

## 4. Lista reducida — 11 candidatos para investigación E2+

Ordenados por plausibilidad de demanda pagadora (inferencia E0, no evidencia). «Prueba E2» describe qué comportamiento observable buscar con coste ≈ 0 €.

| ID | Problema reformulado en lenguaje del usuario | Origen | Momento desencadenante | Mayor argumento en contra | Prueba E2 (≤ 0–20 €) | R |
|---|---|---|---|---|---|---|
| **C-06** | «Tengo que hacer la renta y no sé declarar ventas, traspasos, dividendos o retenciones extranjeras» | **Nuevo** + P-24 | Campaña de la renta (abril–junio); venta o traspaso | Estacional; competencia de gestorías y del borrador de la AEAT; error fiscal = riesgo reputacional | Volumen y estacionalidad de búsquedas; hilos en foros; plantillas y apaños compartidos; precios de gestorías por declarar inversiones | Bajo (fiscal, no CNMV; verificar) |
| **C-07** | «Tengo dinero parado: ¿cuenta remunerada, Letras del Tesoro, depósito o fondo monetario?» | P-09 reformulado | Ahorro acumulado; cambio de tipos; vencimiento de un depósito | Monetización probable por afiliación → conflicto con C-05; productos homogéneos | Búsquedas «cómo comprar Letras», «mejor cuenta remunerada»; hilos recurrentes; comparadores existentes y su modelo | Bajo |
| **C-03** | «¿Qué bróker, banco o roboadvisor elijo para empezar?» | P-07 + P-11 | Primera inversión; cambio de plataforma | La mayoría no compara (35 %); espacio saturado de comparadores de afiliación | Búsquedas comparativas; preguntas repetidas en foros; tráfico estimado de comparadores existentes | Bajo |
| **C-02** | «¿Cuánto me cuesta de verdad este fondo, plataforma o cambio de divisa?» | P-08 + P-10 | Antes de contratar o al revisar el extracto | El usuario subestima las comisiones precisamente porque no le preocupan | Búsquedas sobre comisiones concretas; quejas de la CNMV sobre comisiones; calculadoras existentes y su uso | Bajo |
| **C-04** | «¿Es fiable esta entidad, web o persona que me ofrece invertir?» | P-12 | Contacto de un tercero; anuncio; mensaje directo | El usuario en riesgo de fraude no suele buscar verificación; los registros de la CNMV son gratuitos | Búsquedas «[nombre] estafa / opiniones»; advertencias de la CNMV; foros de afectados | Bajo |
| **C-11** | «Mi bróker o banco me ha cobrado o ejecutado mal: ¿cómo reclamo?» | **Nuevo** (omitido pese a citar reclamaciones) | Incidencia concreta | Infrecuente por usuario; posible confusión con servicios jurídicos | Volumen de reclamaciones y consultas a la CNMV; plantillas y hilos sobre cómo reclamar | Bajo–Medio (verificar límites con la abogacía) |
| **C-08** | «¿Estoy preparado para invertir y cuánto debería destinar?» | P-01 + P-02 + P-04 + P-05 | Primer ahorro estable; nómina; herencia | Evento casi único por usuario; contenido gratuito abundante | Búsquedas y preguntas repetidas en foros; calculadoras gratuitas y sus visitas | **Medio–Alto** |
| **C-01** | «Creo que estoy diversificado, pero no sé si repito empresas o países» | P-14 + P-13 + P-15 + P-18 | Añadir un segundo o tercer fondo/ETF | **Sesgo Klever**; principiantes con carteras simples; sustitutos gratuitos; datos de composición costosos | ¿Cuántas preguntas de solapamiento las hacen principiantes? Uso de herramientas gratuitas existentes | Medio |
| **C-09** | «¿Cuándo debo revisar o rebalancear, y qué hago cuando el mercado cae?» | P-20 + P-21 | Caídas de mercado; aniversario de la cartera | Disposición a pagar baja; el valor es no actuar | Picos de búsquedas y mensajes en foros durante caídas; uso de calendarios y recordatorios | Medio |
| **C-05** | «¿Este contenido o recomendación es educación, publicidad o interés oculto?» | P-30 + P-06 | Ver una recomendación de un finfluencer | ¿Quién paga? El usuario rara vez paga para que le digan que le manipulan | Preguntas «¿es fiable [influencer]?»; advertencias regulatorias; casos públicos | Bajo |
| **C-10** | «¿Fondo indexado, ETF o plan de pensiones, teniendo en cuenta los impuestos en España?» | **Nuevo** (traspasos y fiscalidad del vehículo) | Primera elección de vehículo; cambio de normativa | Solapa con C-03 y C-06; tiende a recomendación de producto | Búsquedas y hilos «indexado vs ETF fiscalidad», «traspaso de fondos» | Medio |

**Observación sobre el resultado:** los candidatos con mejor perfil preliminar (C-06, C-07, C-03, C-02, C-04, C-11) **no** son los que el v0.1 marcaba como «Muy alto». Los problemas del Grupo C quedan reducidos a un solo candidato (C-01), mantenido para no descartarlo sin evidencia, pero señalado como el más expuesto a sesgo.

**Problemas importantes omitidos aún no explorados** (fuera del cliente principiante, mencionados solo para la decisión C-2): consumidores online sin relación con la inversión y la rama de e-commerce, marcas y productos de D-006.

---

## 5. Criterios que debe usar la investigación E2

Para cada candidato, la evidencia mínima antes de pasarlo a la Ficha de oportunidad:

1. **Frecuencia:** al menos una fuente de búsquedas o de foros que muestre demanda recurrente (no una sola consulta).
2. **Gasto actual:** alguien paga hoy por resolverlo (gestoría, herramienta, curso, suscripción) o dedica tiempo visible a un apaño.
3. **Canal orgánico:** existe un lugar identificable donde aparecen estos usuarios sin publicidad (D-009).
4. **Sin asesoramiento personalizado:** se puede resolver con información general, cálculo o automatización sin recomendar instrumentos a una persona concreta.
5. **Datos accesibles:** no requiere licencias de datos ni conexiones bancarias antes de validar.

Un candidato que no cumpla 2 y 3 tras la investigación debe descartarse aunque «encaje» con Javier.

---

## 6. Resultado, pendientes y siguiente acción

- **Resultado:** mapa reducido de 30 a 11 candidatos; 3 problemas nuevos (C-06, C-10, C-11); sesgo hacia analizador de carteras identificado y neutralizado.
- **Evidencia nueva:** ninguna (auditoría E0–E1). No se registra ninguna entrada en `04_EVIDENCIAS.md` como evidencia de demanda.
- **Problemas pendientes:** C-2 (alcance) requiere decisión de Javier; fuentes sin verificar; límites regulatorios por verificar en fuentes oficiales para C-06, C-08, C-10 y C-11.
- **Siguiente acción:** ChatGPT consolida, registra los cambios documentales y ejecuta T-005 con los criterios de la sección 5.

---

## 7. Relevo estructurado para ChatGPT

```text
ID DE RELEVO: H-002
DE / PARA: Claude → ChatGPT
OBJETIVO DE LA TAREA: Consolidar la auditoría H-001 y ejecutar T-005
  (seleccionar 5 oportunidades para investigación) sobre la lista reducida.

ESTADO ACTUAL:
- Trabajo completado: auditoría contraria de 07_MAPA_DE_PROBLEMAS.md v0.1
  (T-004). Lista reducida a 11 candidatos (C-01 a C-11). Veredicto:
  Aprobado con cambios.
- Trabajo no completado: verificación de fuentes citadas; verificación
  regulatoria; ninguna investigación E2 realizada.
- Decisiones ya cerradas: D-001 a D-010. No se propone producto (H-001 §6).

ENTREGABLES:
- Archivo o enlace: 08_AUDITORIA_H-001.md
- Versión: 1.0 (08/11/2026)

EVIDENCIA UTILIZADA:
- Fuentes principales: documentos oficiales 00–07. Sin investigación externa.
- Suposiciones: Klever es una aplicación de inversión (inferido de 01 §3.1);
  los principiantes suelen tener carteras de 1–3 fondos; existen sustitutos
  gratuitos para análisis de carteras; el asesoramiento personalizado en
  inversión es actividad reservada en España.
- Nivel de confianza: Medio en el diagnóstico de sesgo; Bajo en el orden
  de los candidatos (E0).

RIESGOS Y DUDAS:
- Fallos posibles: haber sobrevalorado C-06 y C-07 por ser concretos;
  haber infravalorado el Grupo C si la investigación muestra principiantes
  con carteras complejas.
- Evidencia contradictoria: el 35 % de comparación (contra C-03); la baja
  alfabetización financiera (contra demanda pagadora en general).

ENCARGO SIGUIENTE:
- Resultado exacto:
  1. Proponer a Javier la decisión D-011 sobre el alcance (ver abajo) ANTES
     de cerrar T-005, porque puede cambiar la lista.
  2. Para los 11 candidatos, realizar investigación de escritorio orientada
     a E2 según los 5 criterios de la sección 5 de 08, registrando cada
     hallazgo en 04_EVIDENCIAS.md con fuente y fecha.
  3. Seleccionar 5 candidatos en una tabla comparativa con evidencia,
     argumento en contra y prueba de validación ≤ 100 €.
- Criterios de aceptación: cada candidato seleccionado tiene al menos una
  señal de frecuencia y una de gasto actual con fuente verificable;
  riesgo regulatorio indicado; ninguna puntuación sin criterios.
- Qué no debe hacer: proponer producto o nombre; recuperar P-16, P-19 o
  P-26 sin evidencia nueva; usar «encaje con Javier» como criterio de
  ordenación principal; dar por verificadas las cifras del mapa v0.1.

ACTUALIZACIONES DOCUMENTALES NECESARIAS:
- 03_PLAN_Y_TAREAS.md: T-004 → Completada (veredicto: Aprobado con
  cambios); T-005 → Desbloqueada, condicionada a D-011.
- 07_MAPA_DE_PROBLEMAS.md: publicar v0.2 con la lista C-01 a C-11,
  eliminar la columna «Encaje inicial» o definir sus criterios, corregir
  la fecha y añadir momento desencadenante y solución actual.
- 02_DECISIONES.md: proponer a Javier
  D-011 | ¿Limitar la exploración al inversor principiante o mapear
  también consumidor online y e-commerce/marcas (D-006, D-007)? |
  El mapa v0.1 estrechó el alcance sin decisión registrada.
- 01_DOCUMENTO_MAESTRO.md: §8 Próximo resultado obligatorio →
  «Seleccionar 5 candidatos con evidencia E2 (T-005)».
- 05_RELEVO_ENTRE_IAS.md: cerrar H-001, activar H-002.
- 04_EVIDENCIAS.md: sin cambios por esta auditoría (no aporta evidencia).
```

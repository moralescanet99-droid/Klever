# Ronda 6: cerrar los puntos de ChatGPT y dejar una versión lista para pruebas de uso

No se ha rediseñado nada: se conservan estructura, paleta y disposición de la ronda 5. Solo se cierran los puntos pedidos y se prepara la versión de pruebas (`PRUEBAS-DE-USO.md`).

> Este informe se genera con `tests/ronda5/informe6.py` a partir de lo **observado** en una ejecución limpia de las cinco baterías (`tests/ronda5/run-all.sh`). Las tablas salen de `ronda6/evidencias-E.json` y `ronda6/evidencias-D.json`, no están escritas a mano.

## Qué se ha cambiado, punto por punto

**1. Aviso persistente al abrir el enlace en otro navegador.** Se ha quitado el toast largo. Ahora «Mis carteras» muestra, antes del formulario, un aviso fijo: «Tu cartera todavía no se ha guardado en la cuenta. El borrador no está disponible en este navegador. Vuelve al navegador donde lo creaste para guardarlo.» No afirma que el borrador siga existiendo en otro sitio (no se puede comprobar), no muestra ninguna confirmación de guardado cuando solo se ha completado el acceso y se puede cerrar con «Entendido» (no vuelve; se borra al cerrar sesión). Los toasts cortos se reservan para éxitos simples («Cartera guardada»).

**2. «Cambios locales pendientes de guardar en tu cuenta».** Mismo texto en «Mis carteras» y en el editor. Cuando hay una copia local distinta de la de la cuenta, la tarjeta rotula cada cifra con la versión a la que pertenece: «Versión de tu cuenta: 4 posiciones · Asignado: 100 %» y «Versión de este dispositivo: 4 posiciones · Asignado: 98 % (incompleta) · editada el …», con fecha y hora reales. Se conservan la recuperación local y la detección de conflictos. **Conflicto:** diálogo «Hay dos versiones de esta cartera» con «Versión de este dispositivo» y «Versión de tu cuenta» (fechas y horas reales, nombre, posiciones, asignado) y una lista breve de «Qué cambia» (nombre, tesis, posiciones solo en una versión, pesos distintos). Es una decisión obligatoria: Escape y el clic fuera no deciden nada; «Usar la versión de tu cuenta» descarta lo local, «Conservar la de este dispositivo» solo la guarda cuando se pulsa Guardar y «Decidir después» no cambia nada. Nunca se sobrescribe en silencio. **Servidor:** el `PUT` ahora lleva la versión desde la que se editó y devuelve `409` si la cuenta cambió después (antes, guardar pisaba la versión de la cuenta sin avisar).

**3. Comprobaciones con datos ausentes.** La lista muestra «3 superadas · 2 sin datos» (y «4 de 5 superadas» solo si la evaluación es completa); la ficha agrupa en **Superadas / No superadas / Sin datos** con su recuento y la nota «Evaluación parcial». La cabecera de la columna pasa a «Comprobaciones». **Regla real de orden (documentada en la web y en el servidor):** 1.º más superadas; 2.º menos no superadas; 3.º símbolo A–Z. Sin datos no suman ni restan: no se cuentan como no superadas. Antes el servidor ordenaba solo por superadas y símbolo, de modo que una empresa con datos ausentes quedaba colocada igual que una con la misma cifra de superadas pero fallos; ahora el orden usa las no superadas como segundo criterio y el texto de la web lo dice.

**4. Cartera pública.** El botón pasa a «Guardar y actualizar publicación» (dos líneas en móvil); mientras hay cambios pendientes aparece «Tus cambios aún no son públicos» junto al estado público y la versión publicada no cambia hasta que un guardado válido termina. Un guardado válido muestra una sola confirmación corta («Cartera guardada y publicación actualizada»). «Dejar de publicar» sigue funcionando con cambios locales inválidos y no pierde el trabajo local (la copia local se reescribe con la nueva versión base para que no aparezca un conflicto falso).

**5. Detalles.** Tras un fallo el botón es «Reintentar guardado» y se conserva la explicación de dónde quedan los cambios; con exceso se añade «Reduce los pesos hasta sumar 100 %»; la tabla histórica de la ficha lleva «Importes en miles de millones de USD; ROIC en %»; el título de la cartera es ahora un campo de hasta dos líneas en móvil (sin saltos manuales). **Límite medido:** con 80 caracteres (el máximo) a 390 px el título necesita tres líneas y el campo se desplaza dentro de sí mismo en lugar de crecer.

## Hallazgos de las propias pruebas (corregidos en esta ronda)
- Una regla genérica `textarea{min-height:96px}` impedía que el título tuviera dos líneas: se medían tres y media.
- Tras «Dejar de publicar» la marca de versión de la cuenta cambia; la copia local seguía con la versión anterior y habría provocado un conflicto falso al recargar. Ahora se reescribe.
- El servidor no comprobaba la versión en el `PUT`: la «detección de conflicto» solo existía al reabrir. Ahora también al guardar (409).

## Pruebas

**Automáticas (navegador automático Chromium, servidor local con base simulada y datos inventados):** {{TOTAL}} comprobaciones correctas y {{FALLOS}} fallos en la ejecución final limpia: batería A {{A}} (validaciones, estados y resumen), B {{B}} (móvil, orden, empresas, ficha y portada), C {{C}} (recorrido, otro navegador, errores, teclado, anchuras de 320 a 1440 px en ambos temas), D {{D}} (escenarios de la ronda 5 reejecutados) y **E {{E}} (nueva: los siete flujos de la prueba de uso)**. El número de comprobaciones no es un resultado: lo que importa es la tabla siguiente, con lo esperado y lo observado en cada escenario.

**Los siete flujos pedidos (batería E, resultados observados):**

{{TABLA_E}}

**Regresión: escenarios de la ronda 5 reejecutados con la interfaz nueva (batería D):**

{{TABLA_D}}

**Manuales:** ninguna se ha ejecutado. Quedan **explícitamente pendientes** en `ronda6/pruebas-manuales.md` (teclado móvil real, lector de pantalla real, zoom real, Safari y Firefox, email real, conflicto entre dos dispositivos reales, zona horaria, TradingView, carga de la SEC).

**Qué es aproximado:** el «otro navegador» es otro contexto de Playwright con almacenamiento separado, y el «otro dispositivo» del conflicto es una petición directa a la API con la misma cuenta (no un segundo navegador real); el teclado móvil se emula reduciendo la ventana; el «200 %» es el tamaño de texto, no el zoom del navegador.

## Decisiones que conviene revisar
- «Decidir después» existe para que la decisión obligatoria no atrape a nadie; deja la copia local intacta y vuelve a preguntar al reabrir.
- Un guardado válido de una cartera pública actualiza la publicación sin pedir confirmación, con una sola frase breve.
- Las cifras del servidor incluyen ahora `no_superadas`, `sin_datos` y `total` en `/api/ideas` (compatible con lo anterior).

## Fuera de alcance (futuro plan de pago, no implementado)
Conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión.

## Antes de desplegar
Sin migraciones nuevas. Siguen siendo necesarias `migrations/0002`–`0006` en bases antiguas.

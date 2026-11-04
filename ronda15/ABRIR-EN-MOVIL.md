# Cómo abrir y probar la ronda 15 desde el móvil

**Lo abrible en un móvil es la DEMO**: la misma interfaz que la versión completa con un servidor simulado dentro de la página. Todo se pierde al recargar y el «correo» de acceso se simula con un botón. **No es la app remota validada**: la versión completa solo se ha ejecutado en un ordenador, en local.
- **Opción A · artefacto (privado):** `https://claude.ai/artifact/6MEdsYjnZaUPwXtUxriEiD`. Quien lo publicó debe darle acceso desde el menú «Compartir». 
- **Opción B · `demo/index.html`:** un solo archivo; se puede abrir con el navegador del móvil o subir a cualquier alojamiento estático.
- **Opción C · versión completa en un ordenador:** Node ≥ 22.13: `npm ci && npx playwright install chromium && bash scripts/local/arrancar.sh` → `http://localhost:8788`.

## Guion de 6 minutos (móvil)
Los datos y el caso son **inventados** (se rotulan en pantalla).
1. **Cartera.** Portada: «Crea tu primera cartera» / «Explora una cartera de ejemplo» (KO 60 % · PG 40 % con una frase de por qué está cada posición y la nota de estructura).
2. **Ideas.** Menú → «Ideas» → pestañas Historias · Empresas · Carteras públicas. Abre la historia: arriba, «En breve» (qué hace el negocio, por qué estudiarla, qué puede salir mal); abajo, la lectura completa y las fuentes plegadas. Lee la opinión y su revisión (desenlace simulado).
3. **Ficha.** «Hidrógeno Norte (empresa ficticia) (HNORT)»: la pregunta que investigas junto a «Probar en mi cartera» y «Comparar con otra empresa». Prueba el botón «atrás» del navegador: cierra la ficha y vuelves donde estabas.
4. **Comparador.** «Comparar con otra empresa» → elige otra del mismo sector → tres filas (crecimiento de ventas, margen operativo, deuda neta/EBITDA), con fuente y periodo por cifra, «sin dato» / «no comparable» explicados y sin ganadores → «Probar … en mi cartera».
5. **Laboratorio.** 10 % de HNORT reduciendo proporcionalmente: primero cuánto espacio ocuparía y quién cede (KO 6 puntos, PG 4), después la tabla, la nota antes/después y los pasos. Sin cuenta es temporal.
6. **Seguimiento.** Menú → «Seguimiento» (etiqueta «En beta · Formará parte del futuro plan de pago»): abre con «Tus preguntas»: la pregunta del contrato con lo que pasó (C firmado, D aplazado, fuente y fecha, simulado) y otra **sin novedades**. «Entrar» → «Simular enlace del email» → guarda un escenario desde la historia y vuelve: verás la pregunta, la fecha, el peso del **escenario** (10 %) frente al de tu **cartera actual**.

**Límites de la demo:** sin persistencia, correo simulado, sin TradingView, datos de demostración inventados (también «Hidrógeno Norte»).

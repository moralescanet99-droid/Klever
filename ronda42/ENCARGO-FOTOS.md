# Ronda 42 · Encargo común: 3 prototipos de la app final en imágenes (C60)

Javier quiere **ver cómo sería la app final**, pero **solo en fotos**: imágenes estáticas, sin demo interactiva. Hay tres direcciones visuales y cada agente hace una. Las tres muestran **las mismas pantallas con los mismos datos**, para poder compararlas.

## Lee antes
- `ronda40/INFORME-APP-FINAL.md`: estructura, funciones y reglas. Es la especificación.
- `ronda41/LIGA-FANTASY.md` §3: ideas de juego. Hay que incluir el modo *draft*, el cierre del lunes, los puntos provisionales en directo, la tesis de la semana y las reglas de liga.
- Mira, sin modificarlos, los prototipos de los que salen las piezas: `ronda39/d-fantasma.html` (radar, rebobinar, mapa), `ronda38/b-organismo.html` (anillo, semáforos, feed en flor, equipo) y `ronda38/c-arena.html` (marcador, Wrapped).

## Reglas fijas
- **Tres pestañas** en la barra inferior: **Mi cartera · La Liga · Construye**, y un avatar arriba a la derecha.
- **Sin supuestos prácticos:** nada de escenarios, crisis, tormentas, Temple ni «¿y si el dólar baja?». Sí se permite «Probar un peso» (Deshacer / Quedármelo).
- **Sin precios, sin rentabilidad y sin importes en euros.**
- **Sello siempre visible:** «Simulación · sin dinero real · no es consejo».
- **Empresas inventadas, apodos inventados y el rótulo «datos de ejemplo»** en algún sitio visible. Klever solo sugiere **pesos**, nunca empresas.
- **Textos en español de España,** cortos. Iconos en SVG, no emojis.

## Datos comunes (úsalos tal cual)
**Usuario:** apodo `marea_baja`. Lunes 9 nov, semana 3 de 12. Cierre: «lunes 16 nov, 00:00 · faltan 4 d 6 h».

**Cartera principal** (empresa, ticker, sector, sede, moneda, peso):
- Nimbus Cloud · NUBE · Tecnología · EE. UU. · USD · 28 %
- Vitalis Farma · VITA · Salud · Alemania · EUR · 18 %
- Solara Energía · SOLR · Energía · España · EUR · 16 %
- Banco Faro · FARO · Finanzas · España · EUR · 14 %
- Hogar & Co · HOGR · Consumo · España · EUR · 12 %
- Ferrovía · FERR · Industria · Francia · EUR · 12 %

**Semáforos:** Concentración **Media** (mayor: NUBE 28 %), Variedad **Amplia** (6 sectores), Datos **Completos**.

**Fantasma de hace 4 semanas:** NUBE pesaba el 46 %, con 4 sectores. Frase: «Hace 4 semanas tu mayor posición pesaba el 46 %; hoy, el 28 %».

**Mapa:**
- Sede: España 42 %, EE. UU. 28 %, Alemania 18 %, Francia 12 %.
- Ventas: España 31 %, resto de Europa 27 %, Norteamérica 29 %, Latinoamérica 6 %, Asia-Pacífico 5 %, otros 2 %.
- Monedas: EUR 72 % · USD 28 %. Sesgo de casa: «El 42 % de tu cartera tiene sede en España».

**Liga** (temporada 1, liga privada «Facultad Eco 25», 8 participantes, **modo *draft***, reglas: máx. 25 % por empresa · mín. 5 sectores · máx. 3 cambios/semana):
- Semana 3, **puntos provisionales**: Equilibrio 37/50 (concentración media 12 + variedad amplia 25), Aprendizaje 20/30 (reto hecho; falta la idea), Constancia 14/20. **Total 71.**
- Si la NUBE bajara al 24 % («Probar un peso»), Equilibrio sería 50 y el total, 84.
- Clasificación total: 1 @luna_indexada 231 · 2 @ardilla.prudente 219 · 3 @marea_baja (tú) 208 · 4 @el_del_excel 197 · 5 @NoSoyBroker 188 · 6 @pixel_bull 160 · 7 @cero_prisa 151 · 8 @bonos_y_bossa 140.
- Reto de la semana: «Ningún sector por encima del 40 %» ✓.
- **Tesis de la semana:** VITA, «Gana caja libre y no depende de un solo producto», a revisar el 7 dic.
- **Tablero del *draft*** (empresas ya elegidas por cada participante; cada empresa solo puede estar en una cartera): para la imagen, usa una cuadrícula de 8 × 6 con tickers inventados.
- **Duelo semanal** con @ardilla.prudente: tú 71, ella 66 provisional.

**Construye:**
- **Descubrir:** «4 de 10 empresas de hoy». Tarjeta Kaede Robótica · KAED · Industria · Japón · JPY · huella 4/5 (deuda ✓, ROIC ✓, margen ✓, caja ✓, crecimiento ✗). Botones «Guardar idea» y «Probar en mi cartera».
- **Cartera en equipo «Las Medusas»** (4 miembros: marea_baja, bruma, kiwi_9 y coral_3, que es la capitana de la semana):
  - Propuesta de kiwi_9: «Bajar NUBE del 30 % al 24 %», con el porqué «Si NUBE cae, arrastra al equipo; mejor repartir».
  - Antes → después: Concentración Media → Baja; Equilibrio 37 → 50.
  - Votos: 2 a favor, 1 en contra, falta el tuyo. «Cierra en 23 h». Reacciones predefinidas.

## Las 6 pantallas (390 × 844 px, capturadas con `deviceScaleFactor: 2`)
1. `01-mi-cartera.png`: Mi cartera › Reparto. Cabecera de la semana, retrato de la cartera con su fantasma, semáforos, anillo de pesos o lista y «Probar un peso».
2. `02-mi-cartera-mapa.png`: Mi cartera › Mapa. Mapa de sede y ventas, monedas, sesgo de casa y señales.
3. `03-liga.png`: La Liga. Puesto, puntos provisionales con cuenta atrás al cierre, desglose 50/30/20, clasificación, reto y duelo.
4. `04-liga-draft.png`: La Liga › Draft. Tablero del *draft*, reglas de liga, tesis de la semana.
5. `05-construye.png`: Construye › Descubrir. La tarjeta con la huella.
6. `06-construye-equipo.png`: Construye › Cartera en equipo. Propuesta y votación.

Además:
- `00-portada.png`: una **lámina de presentación** de 1600 × 1000 px (`deviceScaleFactor` 1), con el nombre de la dirección, 3–4 pantallas en marcos de teléfono y 3 líneas que expliquen la dirección.

## Cómo se hace
1. Construye un HTML de trabajo (en el scratchpad, `/tmp/claude-0/-home-user-Klever/1616b4e7-9427-54fd-86d9-16f5519c4290/scratchpad/<prefijo>/`) con cada pantalla a 390 × 844.
2. Captúralas con Playwright: `require('playwright')`, `chromium.launch()` sin opciones y nunca `playwright install`. Espera a las fuentes con `document.fonts.ready`.
3. Guarda los PNG en la carpeta indicada.
4. **Mira cada imagen con Read e itera** hasta que esté impecable:
   - sin textos cortados ni solapes;
   - contraste AA;
   - jerarquía clara;
   - una acción principal por pantalla.
5. Calidad de producto terminado, con nivel de presentación a inversores: tipografía elegida con intención (Google Fonts), retícula consistente, tokens de color y gráficos dibujados a escala con los datos de arriba.
6. **No hagas commit.** No toques nada fuera de tu carpeta de fotos y del scratchpad.

**Entrega:** rutas de los PNG, 5 líneas sobre la dirección y lo que no hayas podido resolver.

# 05 · Experimento EDGAR: ¿trae la SEC sede, moneda y ventas por región?

**Fecha de la medición:** 9 nov 2026 · **Datos crudos:** `05-experimento-edgar.csv` (una fila por empresa, 40 columnas) · **Coste:** 0 €.

## Resumen en una frase
Con datos reales de 30 empresas: **la sede y la moneda de informe salen en el 100 %**; **algún desglose geográfico de los ingresos sale en XBRL en 29 de 30 (97 %)**, pero **solo 13 de 30 (43 %) dan zonas tipo «Europa / Asia / América»** que sirvan para una «exposición por región»; el resto da «EE. UU. frente al resto» o un par de países sueltos. Además, cada empresa etiqueta las regiones a su manera, así que no hay un dato que se pueda leer igual para todas.

## 1 · Qué se ha hecho (comprobado)
- **Fuentes:** `data.sec.gov/submissions/CIK…json` (sede, estado de constitución, último 10-K/20-F), `data.sec.gov/api/xbrl/companyfacts/CIK…json` (unidades = moneda) y, del índice de cada presentación (`www.sec.gov/Archives/edgar/data/<cik>/<accession>/index.json`), **la instancia XBRL del último informe anual** (`*_htm.xml`), donde se han buscado contextos con `srt:StatementGeographicalAxis` o `ifrs-full:GeographicalAreasAxis` y, aparte, segmentos con nombre de región.
- **Ritmo:** 120 peticiones en 59 s (≈ 2 por segundo; límite de la SEC: 10/s). Se han descargado 140 MB de instancias XBRL (la mayor, Santander, 30 MB), 106 MB de *companyfacts* y 9 MB de *submissions*.
- **User-Agent:** sin correo personal. **Trampa encontrada:** `data.sec.gov` acepta «Klever-research proyecto-educativo», pero **`www.sec.gov/Archives` responde 403 («Undeclared Automated Tool») a cualquier User-Agent sin forma de correo** (probados 3). Se usó `Klever proyecto-educativo admin@klever.invalid` (dominio reservado `.invalid`, no es de nadie). **Para producción** la SEC pide un contacto real: hará falta un buzón genérico del proyecto (no personal); decisión de Javier.
- **Trampa 2:** el listado oficial de *tickers* de la SEC ya asigna `XOM` a un CIK nuevo (2115436, «ExxonMobil Holdings Corp») que aún no tiene 10-K; se usó el CIK histórico 34088. Un cargador automático por *ticker* fallaría en silencio.
- Script de medición (no es código de la app) en el scratchpad: `edgar-scripts/medir.py`.

## 2 · Muestra (30 empresas)
| Grupo | Empresas |
|---|---|
| Grandes de EE. UU. (15) | Apple, Microsoft, Coca-Cola, Procter & Gamble, Johnson & Johnson, JPMorgan, ExxonMobil, Walmart, Nike, McDonald's, Caterpillar, Pfizer, Netflix, Tesla, Visa |
| Medianas de EE. UU. (7) | Hasbro, Etsy, Crocs, Zebra, Hormel, Texas Roadhouse, Pool Corp |
| Extranjeras con 10-K (5) | Lululemon (Canadá), Garmin (Suiza), Accenture (Irlanda), Medtronic (Irlanda), Shopify (Canadá) |
| Extranjeras con 20-F (3) | Spotify (Luxemburgo, NIIF, EUR), Toyota (Japón, NIIF, JPY), Banco Santander (España, NIIF, EUR) |

Sectores: tecnología, consumo, bebidas, farmacia y salud, banca, energía, distribución, restauración, industria, ocio, pagos, automoción, música. Ejercicios entre oct 2025 y sep 2026.

## 3 · Resultados (comprobado con datos reales)

### Sede
| Fuente | Cobertura | Observación |
|---|---|---|
| `submissions` → `addresses.business.stateOrCountry` | 26/30 (87 %) | Vacío en Garmin, Medtronic, Shopify y Spotify. Usa códigos propios de EDGAR (`A1` = Columbia Británica, `L2` = Irlanda, `M0` = Japón, `U3` = España…), no ISO. |
| `dei:EntityAddressCountry` (instancia XBRL) | 7/30 (23 %) | **Solo lo ponen las extranjeras** (CH, IE, IE, CA, LU, JP, ES). Las de EE. UU. ponen el estado (`dei:EntityAddressStateOrProvince`, 24/30). Lululemon (sede en Canadá) no pone país, solo «BC». |
| **Combinando las dos** | **30/30 (100 %)** | Hace falta una tabla de equivalencias de códigos EDGAR → país. |
| `stateOfIncorporation` | 27/30 | **No sirve como sede:** difiere de la sede en 14 de 27 (13 son de Delaware). |

### Moneda de informe
- **30/30 (100 %)** desde las unidades de `companyfacts`: **USD 27, EUR 2 (Spotify, Santander), JPY 1 (Toyota)**. Taxonomía: us-gaap 27, NIIF (`ifrs-full`) 3.
- **Trampa:** Toyota mezcla en `companyfacts` datos antiguos en us-gaap (JPY y algunos USD de 2012–2013) con NIIF desde 2020; hay que leer la unidad del último ejercicio, no «la primera que aparezca».

### Ventas por región en XBRL
| Medida | Resultado |
|---|---|
| Hechos de ingresos con eje geográfico (`srt:StatementGeographicalAxis` / `ifrs-full:GeographicalAreasAxis`) | **26/30 (87 %)**, todos con el último ejercicio |
| …de ellos, con el eje geográfico **solo** (lectura directa) | 22/30 (73 %); en el resto el eje va combinado con otros (segmento, producto, partidas de consolidación, concentración de riesgo) y hay que filtrar para no contar dos veces |
| Solo por segmentos con nombre de región (sin eje geográfico) | +2: McDonald's (EE. UU. / mercados internacionales) y Accenture (Américas, EMEA, Asia-Pacífico) |
| Detectado a mano (el detector automático no lo vio) | +1: Santander, ver § 4 |
| **Algún desglose geográfico de ingresos en XBRL** | **29/30 (97 %)**; Texas Roadhouse no lo publica (ni en el texto) |

**¿Sirve para «exposición por región»?** Clasificación de lo que trae cada una (miembros reales en el CSV):

| Nivel de detalle | Empresas | Recuento |
|---|---|---|
| **Zonas o continentes** (Europa/EMEA, Asia-Pacífico, Latinoamérica, Norteamérica…) | Apple, Coca-Cola, Nike, Accenture (vía segmentos); J&J, JPMorgan, Caterpillar, Netflix, Hasbro, Zebra, Garmin, Shopify, Lululemon (vía eje geográfico) | **13 (43 %)** |
| Algunos países sueltos + «resto» | ExxonMobil, Walmart, Pfizer, Tesla, Etsy, Crocs, Medtronic, Spotify, Toyota, Santander | 10 (33 %) |
| Solo «país de sede frente al resto» | Microsoft, P&G, Visa, Hormel, Pool, McDonald's | 6 (20 %) |
| Nada | Texas Roadhouse | 1 (3 %) |

**Lo que complica automatizarlo (comprobado):**
- **Nombres propios:** 15 de las 26 con eje geográfico usan miembros inventados por la empresa (`aapl:OtherCountriesMember`, `jnj:WesternHemisphereExcludingUSMember`, `lulu:RestOfWorldMember`, `shop:APACMember`…). Garmin usa incluso un concepto propio (`grmn:NetSalesToExternalCustomers`) en vez del estándar de ingresos.
- **Subtotales mezclados:** Lululemon da EE. UU., Canadá, México **y** «Américas» (que es su suma); sumar todos los miembros duplica.
- **Significado distinto del nombre:** el `country:CN` de Apple incluye Hong Kong y Taiwán (lo dice la nota del 10-K, no el XBRL).
- **El «país de sede» engaña en NIIF:** Spotify declara 13 M€ en Luxemburgo (su domicilio legal) y 10.703 M€ en «otros países».
- **Bancos:** no tienen «ventas»; Santander etiqueta el margen bruto (`ifrs-full:GrossProfit`) por país.

## 4 · Verificación a mano contra el texto del informe (5 empresas + 1)
Se descargó el documento principal de cada informe y se buscaron las tablas. Citas literales del texto (cifras en millones salvo indicación).

| Empresa | Qué dice el XBRL | Qué dice el informe (literal) | ¿Cuadra? |
|---|---|---|---|
| **Apple** (10-K FY2026) | `country:US` 167.746; `country:CN` 82.378; `OtherCountriesMember` 228.710; segmentos Americas 198.083, Europe 127.604, Greater China 82.378, Japan 30.908, Rest of Asia Pacific 39.861 | «U.S. \| $ \| 167,746 … China (1) \| 82,378 … Other countries \| 228,710» y «(1)China includes Hong Kong and Taiwan.»; «Americas \| $ \| 198,083 … Europe \| 127,604 … Greater China \| 82,378 … Japan \| 30,908 … Rest of Asia Pacific \| 39,861» | Sí (ojo con «China») |
| **Coca-Cola** (10-K 2025) | `country:US` 19.127; `NonUsMember` 28.814 | «United States \| $ \| 19,127 … International \| 28,814 … Net operating revenues \| $ \| 47,941» | Sí. Los segmentos regionales (EMEA 11.513, LatAm 6.334, Norteamérica 19.586, Asia-Pacífico 5.638) incluyen ventas entre segmentos y un segmento no geográfico («Bottling Investments» 5.735) |
| **Lululemon** (10-K FY2025, sede en Canadá) | US 6.328.380; CA 1.423.178; MX 95.486; Americas 7.847.044; China continental 1.754.799; HK-Taiwán-Macao 199.079; CN 1.953.878; RestOfWorld 1.301.678 (miles $) | «United States \| $ \| 6,328,380 … Canada \| 1,423,178 … Mexico \| 95,486 … Americas \| 7,847,044 … China Mainland \| 1,754,799 … People's Republic of China \| 1,953,878 … Other geographic areas \| 1,301,678» | Sí (con subtotales) |
| **Spotify** (20-F 2025, EUR) | `country:US` 6.470; `country:LU` 13; `OtherCountriesMember` 10.703 | «United States \| 6,470 … Luxembourg \| 13 … Other countries \| 10,703» y «There are no countries that individually make up 10% or more of total revenue included in "Other countries."» | Sí |
| **Banco Santander** (20-F 2025, EUR) | El detector dijo **«no»** | Segmentos secundarios: «Spain \| 7,305 \| 3,022 \| 11,990 …», «UK \| … \| 5,280», «Brazil \| … \| 12,602» (margen bruto). **Sí están en XBRL**: `ifrs-full:GrossProfit` = 11.990.000.000 con `ifrs-full:SegmentsAxis = country:ES` | **No: falso negativo** del detector (concepto bancario y miembros `country:`) |
| Texas Roadhouse (10-K 2025) | Sin ingresos por región | Solo «…102 franchise restaurants in 49 states, one U.S. territory, and ten foreign countries»; no hay tabla de ingresos por país | Sí (el «no» es correcto) |

**Conclusión de la verificación:** donde el XBRL tiene la cifra, coincide al céntimo con el texto (5/5). El fallo está en **encontrarla**: 1 de 6 casos revisados fue un falso negativo, y en 2 de 6 el nombre del miembro no dice exactamente lo que incluye.

## 5 · Qué significa para Klever
- **Comprobado:** sede (con tabla de códigos) y moneda se pueden cargar automáticamente para todas.
- **Comprobado:** un dato común y honrado sería **«% de ingresos fuera del país de sede»**, disponible en ~28–29 de 30. Un mapa por zonas solo sería fiable en ~4 de cada 10 y necesita una **tabla de equivalencias de miembros mantenida a mano** (y revisión anual, porque cambian: Santander anuncia nueva estructura de segmentos para 2026).
- **Supuesto (no medido):** que la proporción se mantenga en las ~126 empresas del catálogo; esta muestra tiene más grandes y multinacionales que la media.
- **Pendiente de decidir (Javier):** el buzón genérico para el User-Agent de producción; si «región» se muestra solo cuando hay zonas o también como «EE. UU. / resto».

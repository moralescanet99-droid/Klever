// Klever v1 · CATÁLOGO DE EJEMPLO. Todas las empresas son INVENTADAS (nombres, tickers y datos).
// Sirve para la beta mientras no se cargan datos reales. Se rotula siempre como «datos de ejemplo».
import type { Empresa, Huella, Region, Sector, Moneda } from './tipos';

// Huella codificada: 5 caracteres en el orden deuda, roic, margen, caja, crecimiento. '1' cumple · '0' no cumple · '-' sin datos.
const h = (s: string): Huella => {
  const v = (c: string) => (c === '1' ? true : c === '0' ? false : null);
  return { deuda: v(s[0]), roic: v(s[1]), margen: v(s[2]), caja: v(s[3]), crecimiento: v(s[4]) };
};
// Ventas codificadas: «ES40 EU30 NA20 AP10» (ES España · EU resto de Europa · NA Norteamérica · LA Latinoamérica · AP Asia-Pacífico · OT otros). '' = sin desglose.
const R: Record<string, Region> = { ES: 'España', EU: 'Resto de Europa', NA: 'Norteamérica', LA: 'Latinoamérica', AP: 'Asia-Pacífico', OT: 'Otros' };
const v = (s: string): Partial<Record<Region, number>> | null =>
  s ? Object.fromEntries(s.split(' ').map(t => [R[t.slice(0, 2)], Number(t.slice(2))])) : null;

type Fila = [string, string, Sector, string, Moneda, number, string, string, string];
const FILAS: Fila[] = [
  // Tecnología
  ['NUBE', 'Nimbus Cloud', 'Tecnología', 'EE. UU.', 'USD', 41, 'NA59 EU22 AP14 OT5', '11111', 'Servicios de almacenamiento y cálculo en la nube para empresas.'],
  ['SILI', 'Silicia Chips', 'Tecnología', 'EE. UU.', 'USD', 63, 'NA37 AP45 EU14 OT4', '11101', 'Diseña chips para móviles y coches.'],
  ['BITA', 'Bitácora Software', 'Tecnología', 'España', 'EUR', 38, 'ES62 EU21 LA17', '1111-', 'Programas de gestión para pymes.'],
  ['KAED', 'Kaede Robótica', 'Tecnología', 'Japón', 'JPY', 55, 'AP45 NA25 EU25 OT5', '11110', 'Brazos robóticos para fábricas.'],
  ['ORBE', 'Orbe Satélites', 'Tecnología', 'Francia', 'EUR', 70, '', '0-001', 'Lanza y opera pequeños satélites de comunicación.'],
  ['PIXL', 'Pixelforge', 'Tecnología', 'Reino Unido', 'GBP', 66, 'EU34 NA40 AP20 OT6', '10001', 'Motores gráficos para videojuegos.'],
  // Salud
  ['VITA', 'Vitalis Farma', 'Salud', 'Alemania', 'EUR', 72, 'EU28 NA40 AP22 LA6 OT4', '11110', 'Medicamentos para enfermedades crónicas.'],
  ['GENO', 'Genómica Norte', 'Salud', 'EE. UU.', 'USD', 30, 'NA70 EU20 AP10', '0-0-1', 'Pruebas genéticas para hospitales.'],
  ['CLIN', 'Clínicas Alba', 'Salud', 'España', 'EUR', 12, 'ES88 EU12', '01101', 'Red de clínicas y centros de diagnóstico.'],
  ['ORTO', 'Ortodent', 'Salud', 'Suiza', 'CHF', 85, 'EU45 NA30 AP20 OT5', '11111', 'Implantes y material dental.'],
  ['BIOM', 'Biomar Labs', 'Salud', 'Dinamarca', 'EUR', 90, '', '1-1-1', 'Enzimas y fermentos para alimentos.'],
  ['SANA', 'Sanaria Seguros Médicos', 'Salud', 'España', 'EUR', 20, 'ES80 LA20', '11100', 'Seguros de salud para familias.'],
  // Energía
  ['SOLR', 'Solara Energía', 'Energía', 'España', 'EUR', 34, 'ES66 EU18 LA16', '00111', 'Parques solares y eólicos.'],
  ['VIEN', 'Ventisca Eólica', 'Energía', 'Dinamarca', 'EUR', 80, 'EU55 NA30 AP15', '01010', 'Fabrica aerogeneradores.'],
  ['PETR', 'Petrolia Atlántica', 'Energía', 'Reino Unido', 'GBP', 75, 'EU30 NA25 AP25 OT20', '11010', 'Extrae y refina petróleo y gas.'],
  ['HIDR', 'Hidronova', 'Energía', 'Noruega', 'EUR', 40, '', '1-11-', 'Centrales hidroeléctricas.'],
  ['BATE', 'Batería Ibérica', 'Energía', 'España', 'EUR', 25, 'ES75 EU25', '0-001', 'Almacenamiento de energía en baterías.'],
  ['GASN', 'Gasnor Redes', 'Energía', 'Italia', 'EUR', 10, 'EU100', '01110', 'Transporte de gas por tubería.'],
  // Finanzas
  ['FARO', 'Banco Faro', 'Finanzas', 'España', 'EUR', 35, 'ES65 LA25 EU10', '-1-1-', 'Banco minorista para particulares y pymes.'],
  ['AGOR', 'Ágora Seguros', 'Finanzas', 'Francia', 'EUR', 45, 'EU70 AP15 LA15', '-110-', 'Seguros de hogar y de vida.'],
  ['PAGO', 'Pagofácil', 'Finanzas', 'EE. UU.', 'USD', 48, 'NA52 EU28 LA12 AP8', '11111', 'Procesa pagos con tarjeta en tiendas online.'],
  ['BOLS', 'Bolsalia Mercados', 'Finanzas', 'Alemania', 'EUR', 50, 'EU60 NA25 AP15', '11110', 'Opera una bolsa de valores y sus sistemas.'],
  ['CRED', 'Crediunión', 'Finanzas', 'España', 'EUR', 5, 'ES95 EU5', '-0-0-', 'Cooperativa de crédito regional.'],
  ['ASEG', 'Aseguradora Pacífico', 'Finanzas', 'Japón', 'JPY', 22, 'AP90 NA10', '-111-', 'Seguros de vida en Asia.'],
  // Consumo
  ['HOGR', 'Hogar & Co', 'Consumo', 'España', 'EUR', 45, 'ES55 EU30 LA15', '11110', 'Muebles y decoración a precios bajos.'],
  ['RUTA', 'Ruta Moda', 'Consumo', 'España', 'EUR', 68, 'ES32 EU40 LA10 AP12 OT6', '11111', 'Ropa con tiendas en 40 países.'],
  ['MERC', 'Mercalia', 'Consumo', 'Francia', 'EUR', 30, 'EU85 LA15', '01100', 'Supermercados de barrio.'],
  ['CAFE', 'Café Tropical', 'Consumo', 'EE. UU.', 'USD', 35, 'NA65 EU15 AP15 LA5', '11101', 'Cadena de cafeterías.'],
  ['LUMA', 'Luma Cosmética', 'Consumo', 'Corea del Sur', 'USD', 60, 'AP55 NA25 EU20', '11011', 'Cremas y maquillaje.'],
  ['BEBI', 'Bebidas Sierra', 'Consumo', 'España', 'EUR', 40, 'ES60 EU25 LA15', '11110', 'Refrescos y aguas minerales.'],
  // Industria
  ['FERR', 'Ferrovía', 'Industria', 'Francia', 'EUR', 62, 'EU60 AP20 NA12 OT8', '01110', 'Trenes y sistemas de señalización.'],
  ['GRUA', 'Grúas Levante', 'Industria', 'España', 'EUR', 50, 'ES50 EU20 LA20 OT10', '10100', 'Alquiler de grúas y maquinaria pesada.'],
  ['AERO', 'Aeronáutica Boreal', 'Industria', 'Alemania', 'EUR', 78, 'EU40 NA30 AP25 OT5', '01111', 'Piezas para aviones comerciales.'],
  ['CEME', 'Cementos Duero', 'Industria', 'España', 'EUR', 30, 'ES70 LA30', '00100', 'Cemento y hormigón.'],
  ['LOGI', 'Logística Hanse', 'Industria', 'Países Bajos', 'EUR', 70, '', '1111-', 'Transporte de mercancías por barco y camión.'],
  ['TALL', 'Talleres Kobe', 'Industria', 'Japón', 'JPY', 48, 'AP52 NA28 EU20', '11000', 'Máquinas herramienta.'],
  // Servicios públicos
  ['AQUA', 'Aqualis', 'Servicios públicos', 'España', 'EUR', 15, 'ES85 LA15', '01100', 'Gestiona redes de agua de ciudades.'],
  ['ELEC', 'Eléctrica Meseta', 'Servicios públicos', 'España', 'EUR', 8, 'ES92 EU8', '01110', 'Distribución eléctrica.'],
  ['TERM', 'Termia Redes', 'Servicios públicos', 'Italia', 'EUR', 5, 'EU100', '01100', 'Calefacción urbana.'],
  ['RECI', 'Reciclia', 'Servicios públicos', 'Francia', 'EUR', 35, 'EU80 LA20', '1-1-1', 'Recogida y reciclaje de residuos.'],
  ['VOLT', 'Voltia Grid', 'Servicios públicos', 'EE. UU.', 'USD', 0, 'NA100', '01110', 'Red eléctrica en tres estados.'],
  ['GASC', 'Gas Ciudad', 'Servicios públicos', 'Reino Unido', 'GBP', 3, 'EU100', '0110-', 'Suministro de gas doméstico.'],
  // Comunicación
  ['ONDA', 'Onda Telecom', 'Comunicación', 'España', 'EUR', 42, 'ES58 LA42', '01110', 'Telefonía móvil y fibra.'],
  ['ECOS', 'Ecos Media', 'Comunicación', 'Reino Unido', 'GBP', 55, 'EU45 NA35 AP20', '10101', 'Plataforma de pódcasts y audiolibros.'],
  ['VIDE', 'Videoteca', 'Comunicación', 'EE. UU.', 'USD', 52, 'NA48 EU25 LA15 AP12', '01111', 'Series y películas por suscripción.'],
  ['ANUN', 'Anuncia', 'Comunicación', 'EE. UU.', 'USD', 45, 'NA55 EU25 AP20', '11111', 'Publicidad en buscadores y redes.'],
  ['TORR', 'Torres Alto', 'Comunicación', 'España', 'EUR', 60, 'ES40 EU45 LA15', '01011', 'Alquila torres de telecomunicaciones.'],
  ['JUEG', 'Juegos Sakura', 'Comunicación', 'Japón', 'JPY', 58, 'AP42 NA33 EU25', '11111', 'Videojuegos para consola y móvil.'],
];

export const CATALOGO: Empresa[] = FILAS.map(([ticker, nombre, sector, pais, moneda, fuera, ventas, huella, descripcion]) => ({
  ticker, nombre, sector, pais, moneda, fuera, ventas: v(ventas), huella: h(huella), descripcion,
}));
export const POR_TICKER: Record<string, Empresa> = Object.fromEntries(CATALOGO.map(e => [e.ticker, e]));
export const SECTORES: Sector[] = ['Tecnología', 'Salud', 'Energía', 'Finanzas', 'Consumo', 'Industria', 'Servicios públicos', 'Comunicación'];
export const empresa = (t: string): Empresa | undefined => POR_TICKER[String(t).toUpperCase()];
export const FUENTE_DATOS = 'Datos de ejemplo · empresas inventadas';

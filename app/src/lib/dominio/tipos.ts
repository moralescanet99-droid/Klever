// Klever v1 · tipos del dominio. PURO: lo usan la interfaz, el servidor (functions/) y el modo demo.
// Nada mide rentabilidad ni precios. Todo dato de empresa es DE EJEMPLO (empresas inventadas).

export type Sector =
  | 'Tecnología' | 'Salud' | 'Energía' | 'Finanzas' | 'Consumo' | 'Industria' | 'Servicios públicos' | 'Comunicación';

export type Region = 'España' | 'Resto de Europa' | 'Norteamérica' | 'Latinoamérica' | 'Asia-Pacífico' | 'Otros';
export const REGIONES: Region[] = ['España', 'Resto de Europa', 'Norteamérica', 'Latinoamérica', 'Asia-Pacífico', 'Otros'];

export type Moneda = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY';

/** Una comprobación de la huella: true cumple, false no cumple, null sin datos (sin datos ≠ no cumple). */
export type Check = boolean | null;
export interface Huella { deuda: Check; roic: Check; margen: Check; caja: Check; crecimiento: Check }
export const EJES_HUELLA: { clave: keyof Huella; etiqueta: string; explica: string }[] = [
  { clave: 'deuda', etiqueta: 'Deuda', explica: 'Su deuda es manejable para lo que gana.' },
  { clave: 'roic', etiqueta: 'ROIC', explica: 'Saca buena rentabilidad al capital que usa en el negocio.' },
  { clave: 'margen', etiqueta: 'Margen', explica: 'De cada venta le queda una parte razonable como beneficio.' },
  { clave: 'caja', etiqueta: 'Caja', explica: 'Genera más dinero del que gasta (caja libre positiva).' },
  { clave: 'crecimiento', etiqueta: 'Crece', explica: 'Sus ventas han crecido en los últimos años.' },
];

export interface Empresa {
  ticker: string;            // inventado, 4 letras
  nombre: string;            // inventado
  sector: Sector;
  pais: string;              // país de la sede
  moneda: Moneda;            // moneda en la que informa
  /** % de ventas por región (suma 100) o null si la empresa no publica desglose. */
  ventas: Partial<Record<Region, number>> | null;
  /** % de ingresos fuera del país de la sede (siempre disponible). */
  fuera: number;
  huella: Huella;
  descripcion: string;       // una línea, neutra
}

/** Una posición: ticker + peso en décimas de punto porcentual (enteros, sin errores de redondeo). 1000 = 100 %. */
export interface Posicion { ticker: string; decimas: number }

export type Nivel = 'ok' | 'medio' | 'alto';
export type NivelDatos = Nivel | 'na';

export interface Usuario { id: number; apodo: string; esAdmin: boolean; invitacionesLibres: number }

export interface Cartera {
  id: number; nombre: string; principal: boolean;
  posiciones: Posicion[];
  actualizada: string;       // ISO
  ligaId: number | null;     // si es la cartera de un draft
}

export interface VersionCartera { desde: string; posiciones: Posicion[] }

export interface Foto {
  semana: string;            // lunes ISO (yyyy-mm-dd) de la foto
  posiciones: Posicion[];
  concentracion: Nivel; variedad: Nivel; n: number; completa: boolean;
}

export interface ReglasLiga {
  maxPorEmpresa: number | null;   // % (p. ej. 25)
  minSectores: number | null;     // p. ej. 5
  maxCambiosSemana: number | null; // p. ej. 3
  maxPorPais: number | null;      // % (p. ej. 60)
}
export const REGLAS_VACIAS: ReglasLiga = { maxPorEmpresa: null, minSectores: null, maxCambiosSemana: null, maxPorPais: null };

export type TipoLiga = 'clasica' | 'draft' | 'general';
export type EstadoLiga = 'abierta' | 'draft' | 'en_juego' | 'terminada';

export interface PuntosSemana {
  semana: string; equilibrio: number; aprendizaje: number; constancia: number; total: number;
  valida: boolean; motivo: string; incumple: string[]; bajas: 0 | 1;
}

export interface FilaClasificacion { usuarioId: number; apodo: string; total: number; semanasBajas: number; puesto: number; tu: boolean }

export interface Liga {
  id: number; codigo: string; nombre: string; tipo: TipoLiga; estado: EstadoLiga;
  reglas: ReglasLiga; creadorId: number; miembros: number; temporada: Temporada;
}

export interface Temporada { id: number; nombre: string; inicio: string; semanas: string[]; fin: string }

export interface EstadoDraft {
  ronda: number; rondas: number;        // 6 rondas = 6 empresas por persona
  turnoDe: number | null;               // usuarioId al que le toca, null si terminó
  orden: { usuarioId: number; apodo: string }[];
  picks: { ronda: number; usuarioId: number; ticker: string }[];
  libres: string[];                     // tickers aún libres en esta liga
  cambioUsadoEstaSemana: boolean;       // agente libre: 1 cambio por semana
}

export interface DetalleLiga {
  liga: Liga;
  clasificacion: FilaClasificacion[];
  mias: PuntosSemana[];                 // mis puntos por semana hasta hoy
  semanaActual: number;                 // 1..12 (0 = aún no empieza, 13 = terminada)
  carteraInscrita: Cartera | null;
  puedeCambiarCartera: boolean;         // semanas 1–2
  reto: RetoSemana;
  draft: EstadoDraft | null;
}

export interface RetoSemana { id: string; titulo: string; hecho: boolean; pista: string }

export interface ResumenTemporada {
  temporada: Temporada; ligaNombre: string;
  total: number; puesto: number; participantes: number;
  semanasBajas: number; mejorRacha: number; retosHechos: number;
  sectoresMax: number; insignia: 'oro' | 'plata' | 'bronce' | 'completada' | null;
  semanas: PuntosSemana[];
}

export interface Invitacion { codigo: string; usos: number; usosMax: number; creada: string; nota: string }

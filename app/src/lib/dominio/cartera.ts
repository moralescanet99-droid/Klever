// Klever v1 · análisis de una cartera. PURO. Pesos en DÉCIMAS (1000 = 100 %), enteros: sin errores de redondeo.
// Describe el reparto; no mide riesgo ni rentabilidad y no recomienda empresas (las pistas solo hablan de PESOS).
import { empresa } from './catalogo';
import type { Moneda, Nivel, NivelDatos, Posicion, Region, Sector } from './tipos';
import { REGIONES } from './tipos';

export const UMBRALES = Object.freeze({ posicion: 25, categoria: 40, altoPosicion: 40, altoCategoria: 60, sectoresOk: 5, sectoresMedio: 3, minPosiciones: 4 });
export const TOTAL = 1000;

export const pct = (decimas: number) => decimas / 10;
export const fmtPct = (decimas: number) => `${(decimas / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;

export interface Parte<T extends string = string> { clave: T; decimas: number }
export interface Senal { id: string; nivel: 'alerta' | 'aviso' | 'ok'; titulo: string; detalle: string }
export interface Analisis {
  n: number; suma: number; completa: boolean;
  mayor: { ticker: string; decimas: number } | null;
  sectores: Parte<Sector>[]; paises: Parte[]; monedas: Parte<Moneda>[];
  ventas: { region: Region; decimas: number }[];   // ponderado por peso, sobre la parte con desglose
  coberturaVentas: number;                           // décimas del peso con desglose de ventas
  fueraMedio: number;                                // % medio ponderado de ingresos fuera del país de sede
  espana: number;                                    // décimas con sede en España
  concentracion: Nivel; variedad: Nivel; datos: NivelDatos; datosPct: number;
  senales: Senal[]; senalesMapa: Senal[];
}

const agrupa = <T extends string>(pos: Posicion[], f: (t: string) => T | undefined): Parte<T>[] => {
  const m = new Map<T, number>();
  for (const p of pos) { const k = f(p.ticker); if (k) m.set(k, (m.get(k) || 0) + p.decimas); }
  return [...m].map(([clave, decimas]) => ({ clave, decimas })).sort((a, b) => b.decimas - a.decimas || a.clave.localeCompare(b.clave));
};

export function analizar(posiciones: Posicion[]): Analisis {
  const pos = posiciones.filter(p => p.decimas > 0 && empresa(p.ticker));
  const suma = pos.reduce((a, p) => a + p.decimas, 0), n = pos.length;
  const mayorP = [...pos].sort((a, b) => b.decimas - a.decimas)[0];
  const sectores = agrupa(pos, t => empresa(t)?.sector), paises = agrupa(pos, t => empresa(t)?.pais), monedas = agrupa(pos, t => empresa(t)?.moneda);
  const may = mayorP ? mayorP.decimas : 0, top = sectores[0]?.decimas || 0;
  const concentracion: Nivel = !n ? 'alto' : (may >= UMBRALES.altoPosicion * 10 || top >= UMBRALES.altoCategoria * 10 || n === 1) ? 'alto' : (may >= UMBRALES.posicion * 10 || top >= UMBRALES.categoria * 10) ? 'medio' : 'ok';
  const variedad: Nivel = sectores.length >= UMBRALES.sectoresOk ? 'ok' : sectores.length >= UMBRALES.sectoresMedio ? 'medio' : 'alto';
  // Datos: qué parte del peso tiene al menos 4 de las 5 comprobaciones con dato.
  const conDatos = pos.filter(p => Object.values(empresa(p.ticker)!.huella).filter(x => x !== null).length >= 4).reduce((a, p) => a + p.decimas, 0);
  const datosPct = suma ? Math.round(conDatos / suma * 100) : 0;
  const datos: NivelDatos = !n ? 'na' : datosPct >= 80 ? 'ok' : datosPct >= 50 ? 'medio' : 'alto';
  // Ventas por región, ponderadas solo sobre la parte con desglose.
  const conVentas = pos.filter(p => empresa(p.ticker)!.ventas);
  const coberturaVentas = conVentas.reduce((a, p) => a + p.decimas, 0);
  const ventas = REGIONES.map(region => ({ region, decimas: coberturaVentas ? Math.round(conVentas.reduce((a, p) => a + p.decimas * (empresa(p.ticker)!.ventas![region] || 0) / 100, 0) / coberturaVentas * TOTAL) : 0 }));
  const fueraMedio = suma ? Math.round(pos.reduce((a, p) => a + p.decimas * empresa(p.ticker)!.fuera, 0) / suma) : 0;
  const espana = pos.filter(p => empresa(p.ticker)!.pais === 'España').reduce((a, p) => a + p.decimas, 0);
  const base = { n, suma, completa: suma === TOTAL, mayor: mayorP ? { ticker: mayorP.ticker, decimas: may } : null, sectores, paises, monedas, ventas, coberturaVentas, fueraMedio, espana, concentracion, variedad, datos, datosPct };
  return { ...base, senales: senales(base), senalesMapa: senalesMapa(base) };
}

type Base = Omit<Analisis, 'senales' | 'senalesMapa'>;
function senales(a: Base): Senal[] {
  const out: Senal[] = [];
  if (!a.n) return [{ id: 'vacia', nivel: 'aviso', titulo: 'Tu cartera está vacía', detalle: 'Añade de 3 a 5 empresas en Construye para empezar.' }];
  if (!a.completa) out.push({ id: 'incompleta', nivel: 'aviso', titulo: `Repartido: ${fmtPct(a.suma)}`, detalle: 'Para contar en la Liga, la cartera tiene que sumar el 100 %.' });
  if (a.mayor && a.mayor.decimas >= UMBRALES.posicion * 10 && a.n > 1) out.push({ id: 'posicion', nivel: 'alerta', titulo: `${a.mayor.ticker} pesa el ${fmtPct(a.mayor.decimas)}`, detalle: `Una sola posición supera el ${UMBRALES.posicion} % (referencia orientativa de Klever, no una norma).` });
  const s = a.sectores[0];
  if (s && s.decimas >= UMBRALES.categoria * 10) out.push({ id: 'sector', nivel: 'alerta', titulo: `${s.clave}: ${fmtPct(s.decimas)}`, detalle: `Un sector supera el ${UMBRALES.categoria} % de la cartera.` });
  if (a.n > 1 && a.n < UMBRALES.minPosiciones) out.push({ id: 'pocas', nivel: 'aviso', titulo: `${a.n} posiciones`, detalle: `Con menos de ${UMBRALES.minPosiciones}, cada una pesa mucho en el conjunto (y no cuenta en la Liga).` });
  if (!out.length) out.push({ id: 'ok', nivel: 'ok', titulo: 'Sin concentraciones destacadas', detalle: `Ninguna posición supera el ${UMBRALES.posicion} % ni ningún sector el ${UMBRALES.categoria} %. No mide riesgo ni rentabilidad.` });
  return out;
}
function senalesMapa(a: Base): Senal[] {
  const out: Senal[] = [];
  const noEur = a.monedas.filter(m => m.clave !== 'EUR').reduce((x, m) => x + m.decimas, 0);
  if (a.suma && noEur / a.suma > 0.5) out.push({ id: 'moneda', nivel: 'aviso', titulo: `${Math.round(noEur / a.suma * 100)} % en monedas distintas del euro`, detalle: 'Más de la mitad de tu cartera informa en otra moneda (referencia orientativa).' });
  const p = a.paises[0];
  if (p && a.suma && p.decimas / a.suma > 0.6) out.push({ id: 'pais', nivel: 'aviso', titulo: `${p.clave}: ${Math.round(p.decimas / a.suma * 100)} % de la sede`, detalle: 'Un solo país concentra más del 60 % de la sede de tus empresas.' });
  const r = [...a.ventas].sort((x, y) => y.decimas - x.decimas)[0];
  if (r && a.coberturaVentas && r.decimas > 700) out.push({ id: 'region', nivel: 'aviso', titulo: `${r.region}: ${fmtPct(r.decimas)} de las ventas`, detalle: 'Una región concentra más del 70 % de lo que venden tus empresas.' });
  if (!out.length && a.n) out.push({ id: 'ok', nivel: 'ok', titulo: 'Sin concentración geográfica destacada', detalle: 'Ningún país, moneda ni región domina tu cartera.' });
  return out;
}

/** Pista de Klever: solo PESOS. «¿Y si la mayor bajara al X %?» (X = umbral − 1 para que la concentración cambie de nivel). */
export function pista(posiciones: Posicion[]): { ticker: string; decimas: number; texto: string } | null {
  const a = analizar(posiciones);
  if (!a.mayor || a.n < 2 || a.mayor.decimas < UMBRALES.posicion * 10) return null;
  const objetivo = (UMBRALES.posicion - 1) * 10;
  return { ticker: a.mayor.ticker, decimas: objetivo, texto: `¿Y si la mayor bajara al ${fmtPct(objetivo)}?` };
}

/** Cambia el peso de un ticker y reparte la diferencia entre los demás en proporción. Siempre suma 1000 si había ≥ 2 posiciones. */
export function fijarPeso(posiciones: Posicion[], ticker: string, decimas: number): Posicion[] {
  const pos = posiciones.map(p => ({ ...p })); const i = pos.findIndex(p => p.ticker === ticker);
  if (i < 0) return pos;
  const otros = pos.filter((_, j) => j !== i); const restoAntes = otros.reduce((a, p) => a + p.decimas, 0);
  const objetivo = Math.max(0, Math.min(TOTAL, Math.round(decimas)));
  if (!otros.length) { pos[i].decimas = TOTAL; return pos; }
  pos[i].decimas = objetivo; const restoNuevo = TOTAL - objetivo;
  let asignado = 0;
  otros.forEach((p, k) => {
    const q = restoAntes ? Math.floor(p.decimas * restoNuevo / restoAntes) : Math.floor(restoNuevo / otros.length);
    p.decimas = q; asignado += q; if (k === otros.length - 1) p.decimas += restoNuevo - asignado;
  });
  return pos.map(p => (p.ticker === ticker ? pos[i] : otros.find(o => o.ticker === p.ticker)!));
}

/** Reparte a partes iguales (los restos, en orden). */
export function repartirIgual(tickers: string[]): Posicion[] {
  const n = tickers.length; if (!n) return [];
  const base = Math.floor(TOTAL / n), resto = TOTAL - base * n;
  return tickers.map((t, i) => ({ ticker: t, decimas: base + (i < resto ? 1 : 0) }));
}

/** «KO 40, PG 60» o «NUBE 30; VITA 20…» → posiciones. Devuelve también los tickers no reconocidos. */
export function parsearLista(texto: string): { posiciones: Posicion[]; desconocidos: string[] } {
  const posiciones: Posicion[] = [], desconocidos: string[] = [];
  for (const m of String(texto).toUpperCase().matchAll(/([A-Z]{2,5})\s*[:=]?\s*(\d+(?:[.,]\d)?)?\s*%?/g)) {
    const t = m[1]; if (!empresa(t)) { desconocidos.push(t); continue; }
    if (posiciones.some(p => p.ticker === t)) continue;
    posiciones.push({ ticker: t, decimas: m[2] ? Math.round(Number(m[2].replace(',', '.')) * 10) : 0 });
  }
  if (posiciones.length && posiciones.every(p => !p.decimas)) return { posiciones: repartirIgual(posiciones.map(p => p.ticker)), desconocidos };
  return { posiciones, desconocidos };
}

export const NIVEL_TXT = {
  concentracion: { ok: 'Baja', medio: 'Media', alto: 'Alta' },
  variedad: { ok: 'Amplia', medio: 'Media', alto: 'Poca' },
  datos: { ok: 'Completos', medio: 'Parciales', alto: 'Escasos', na: '—' },
} as const;

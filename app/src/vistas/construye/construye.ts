// Klever v1 · Construye: utilidades PURAS (sin Svelte ni Api) para Crear, Descubrir, ficha y comparador.
// Descubrir tiene FINAL: 10 empresas al día, elegidas de forma determinista por fecha + usuario (nunca «lo más popular»).
import { TOTAL, fijarPeso } from '../../lib/dominio/cartera';
import { CATALOGO } from '../../lib/dominio/catalogo';
import type { Empresa, Huella, Posicion, Region, Sector } from '../../lib/dominio/tipos';
import { EJES_HUELLA } from '../../lib/dominio/tipos';

export const POR_DIA = 10;
export const MIN_CREAR = 3, MAX_CREAR = 5;
export const PESO_PROBAR = 100; // décimas: «Probar en mi cartera» entra con un 10 %
/** Cartera de ejemplo para empezar: 5 sectores distintos, a partes iguales. */
export const EJEMPLO = ['NUBE', 'VITA', 'SOLR', 'HOGR', 'FERR'];

const fmtDia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' });
/** Fecha de hoy en Madrid (yyyy-mm-dd). */
export const diaMadrid = (d: Date = new Date()) => fmtDia.format(d);

/** Hash FNV-1a de 32 bits (estable entre navegador y servidor). */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** Generador pseudoaleatorio determinista (mulberry32). */
function azar(semilla: number) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Orden del catálogo para un día y una persona (Fisher-Yates con semilla). */
export function ordenDelDia(dia: string, usuarioId: number | string, catalogo: Empresa[] = CATALOGO): Empresa[] {
  const r = azar(hash(`${dia}|${usuarioId}`)), out = [...catalogo];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export interface Filtro { sector?: Sector | ''; pais?: string }
export const pasaFiltro = (e: Empresa, f: Filtro) => (!f.sector || e.sector === f.sector) && (!f.pais || e.pais === f.pais);
/** Las empresas de hoy (como mucho 10), con los filtros aplicados sobre el orden del día. */
export function empresasDeHoy(dia: string, usuarioId: number | string, f: Filtro = {}): Empresa[] {
  return ordenDelDia(dia, usuarioId).filter(e => pasaFiltro(e, f)).slice(0, POR_DIA);
}

export const PAISES: string[] = [...new Set(CATALOGO.map(e => e.pais))].sort((a, b) => a.localeCompare(b, 'es'));

/** Cuenta de la huella: cumple / no cumple / sin datos. */
export function cuenta(h: Huella) {
  const v = EJES_HUELLA.map(x => h[x.clave]);
  return { si: v.filter(x => x === true).length, no: v.filter(x => x === false).length, nd: v.filter(x => x === null).length };
}
export function textoHuella(h: Huella): string {
  const c = cuenta(h);
  return `Cumple ${c.si} de 5${c.nd ? ` · ${c.nd} sin datos` : ''}`;
}
export const estadoCheck = (v: boolean | null) => (v === true ? 'Cumple' : v === false ? 'No cumple' : 'Sin datos');

/** Región con más ventas (o null si no hay desglose). */
export function regionPrincipal(e: Empresa): { region: Region; pct: number } | null {
  if (!e.ventas) return null;
  const [region, pct] = (Object.entries(e.ventas) as [Region, number][]).sort((a, b) => b[1] - a[1])[0];
  return { region, pct };
}

/** Añade una empresa con un peso (10 % por defecto) y reparte el resto en proporción. */
export function anadirConPeso(pos: Posicion[], ticker: string, decimas = PESO_PROBAR): Posicion[] {
  if (pos.some(p => p.ticker === ticker)) return pos.map(p => ({ ...p }));
  if (!pos.length) return [{ ticker, decimas: TOTAL }];
  return fijarPeso([...pos, { ticker, decimas: 0 }], ticker, decimas);
}
/** Quita una empresa. Si la cartera sumaba el 100 %, reparte su peso entre las demás en proporción. */
export function quitarYReescalar(pos: Posicion[], ticker: string): Posicion[] {
  const suma = pos.reduce((a, p) => a + p.decimas, 0), resto = pos.filter(p => p.ticker !== ticker).map(p => ({ ...p }));
  if (suma !== TOTAL || !resto.length) return resto;
  const sumaResto = resto.reduce((a, p) => a + p.decimas, 0);
  let asignado = 0;
  resto.forEach((p, k) => {
    const q = sumaResto ? Math.floor(p.decimas * TOTAL / sumaResto) : Math.floor(TOTAL / resto.length);
    p.decimas = q; asignado += q; if (k === resto.length - 1) p.decimas += TOTAL - asignado;
  });
  return resto;
}

/** Color estable por región (tokens). */
export const COLOR_REGION: Record<Region, string> = {
  'España': 'var(--cobre)', 'Resto de Europa': 'var(--lila)', 'Norteamérica': 'var(--agua)',
  'Latinoamérica': 'var(--s-ene)', 'Asia-Pacífico': 'var(--s-fin)', 'Otros': 'var(--noche-3)',
};
/** Ventas por región ordenadas de mayor a menor (vacío si no hay desglose). */
export function ventasOrdenadas(e: Empresa): { region: Region; pct: number }[] {
  if (!e.ventas) return [];
  return (Object.entries(e.ventas) as [Region, number][]).filter(([, p]) => p > 0).map(([region, pct]) => ({ region, pct })).sort((a, b) => b.pct - a.pct);
}

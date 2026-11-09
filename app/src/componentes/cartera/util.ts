// Mi cartera · utilidades de dibujo y textos. PURO (sin Svelte). Pesos en décimas (1000 = 100 %).
import { analizar, TOTAL, type Analisis } from '../../lib/dominio/cartera';
import { empresa, SECTORES } from '../../lib/dominio/catalogo';
import { COLOR_SECTOR } from '../../lib/dominio/colores';
import { medianocheMadrid, sumarDias } from '../../lib/dominio/liga';
import type { Moneda, Nivel, Posicion, Region, Sector } from '../../lib/dominio/tipos';

// ── Geometría polar (0° arriba, sentido horario) ──
export const polar = (cx: number, cy: number, r: number, ang: number): [number, number] => {
  const a = (ang * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
export function arco(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1), grande = a1 - a0 > 180 ? 1 : 0;
  if (a1 - a0 >= 359.9) { const [xm, ym] = polar(cx, cy, r, a0 + 180); return `M${x0} ${y0}A${r} ${r} 0 1 1 ${xm} ${ym}A${r} ${r} 0 1 1 ${x0} ${y0}`; }
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${grande} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
/** Ángulo (0° arriba, horario) del punto (x, y) respecto al centro. */
export const anguloDe = (cx: number, cy: number, x: number, y: number) => ((Math.atan2(x - cx, cy - y) * 180) / Math.PI + 360) % 360;

// ── Anillo y radar ──
export const sectorDe = (t: string): Sector => empresa(t)?.sector || 'Tecnología';
/** Orden del anillo: por sector (orden canónico, así cada sector es un tramo continuo) y, dentro, por peso. */
export function ordenAnillo(pos: Posicion[]): Posicion[] {
  return pos.filter(p => p.decimas > 0 && empresa(p.ticker)).sort((a, b) =>
    SECTORES.indexOf(sectorDe(a.ticker)) - SECTORES.indexOf(sectorDe(b.ticker)) || b.decimas - a.decimas || a.ticker.localeCompare(b.ticker));
}
export interface Tramo { ticker: string; sector: Sector; decimas: number; a0: number; a1: number }
/** Tramos del anillo sobre 360° (si la cartera no suma 100 %, el hueco queda vacío al final). */
export function tramos(pos: Posicion[], rot = 0): Tramo[] {
  let acc = 0;
  return ordenAnillo(pos).map(p => { const a0 = rot + (acc / TOTAL) * 360; acc += p.decimas; return { ticker: p.ticker, sector: sectorDe(p.ticker), decimas: p.decimas, a0, a1: rot + (acc / TOTAL) * 360 }; });
}
export function pesoPorSector(pos: Posicion[]): Map<Sector, number> {
  const m = new Map<Sector, number>(); for (const p of pos) if (p.decimas > 0 && empresa(p.ticker)) m.set(sectorDe(p.ticker), (m.get(sectorDe(p.ticker)) || 0) + p.decimas); return m;
}
/** Ejes del radar: un eje por sector (de hoy o del fantasma), en el centro de su tramo del anillo.
 *  Un sector que solo está en el fantasma se coloca en la frontera donde le tocaría por orden canónico. */
export function ejesRadar(ts: Tramo[], sectoresFantasma: Sector[]): { sector: Sector; ang: number }[] {
  const porSector = new Map<Sector, { a0: number; a1: number }>();
  for (const t of ts) { const s = porSector.get(t.sector); porSector.set(t.sector, s ? { a0: Math.min(s.a0, t.a0), a1: Math.max(s.a1, t.a1) } : { a0: t.a0, a1: t.a1 }); }
  const presentes = new Set([...porSector.keys(), ...sectoresFantasma]);
  const out: { sector: Sector; ang: number }[] = []; let frontera = ts[0]?.a0 ?? 0, huecos = 0;
  for (const s of SECTORES) {
    if (!presentes.has(s)) continue;
    const t = porSector.get(s);
    if (t) { out.push({ sector: s, ang: (t.a0 + t.a1) / 2 }); frontera = t.a1; huecos = 0; }
    else { out.push({ sector: s, ang: frontera + 8 * huecos }); huecos++; }
  }
  return out;
}

// ── Textos ──
export function fraseEstado(a: Analisis): string {
  if (!a.n) return 'Tu cartera está vacía';
  if (!a.completa) return 'Aún falta repartir una parte';
  if (a.concentracion === 'alto') return 'Una parte pesa demasiado';
  if (a.concentracion === 'medio') return 'Repartida, pero una parte pesa';
  return a.variedad === 'ok' ? 'Tu cartera está repartida' : 'Repartida, en pocos sectores';
}
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
/** «9 nov» a partir de yyyy-mm-dd. */
export const fechaCorta = (iso: string) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;
/** Milisegundos hasta las 00:00 (Madrid) del lunes siguiente al lunes dado. */
export const msHastaFoto = (lunes: string, ahora = Date.now()) => Math.max(0, Date.parse(medianocheMadrid(sumarDias(lunes, 7))) - ahora);
export function duracion(ms: number): string {
  const min = Math.floor(ms / 6e4), d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
}
export const pctEntero = (decimas: number, base = TOTAL) => (base ? Math.round((decimas / base) * 100) : 0);

// ── Puntos de Equilibrio que sumaría la foto (reglas de lib/dominio/liga.ts: baja 25 / media 12 + amplia 25 / media 12) ──
const P_NIVEL: Record<Nivel, number> = { ok: 25, medio: 12, alto: 0 };
export function puntosEquilibrio(a: Analisis): { puntos: number; valida: boolean; motivo: string } {
  const valida = a.completa && a.n >= 4;
  return { puntos: valida ? P_NIVEL[a.concentracion] + P_NIVEL[a.variedad] : 0, valida, motivo: !a.completa ? 'no suma el 100 %' : a.n < 4 ? 'menos de 4 posiciones' : '' };
}
export const analisisDe = (pos: Posicion[]) => analizar(pos);

// ── Colores (tokens) ──
export const colorSector = (s: Sector) => COLOR_SECTOR[s];
export const COLOR_REGION: Record<Region, string> = {
  'España': 'var(--cobre)', 'Resto de Europa': 'var(--agua)', 'Norteamérica': 'var(--lila)', 'Latinoamérica': 'var(--s-ene)', 'Asia-Pacífico': 'var(--s-ind)', 'Otros': 'var(--noche-3)',
};
export const COLOR_MONEDA: Record<Moneda, string> = { EUR: 'var(--agua)', USD: 'var(--lila)', GBP: 'var(--cobre)', CHF: 'var(--s-ene)', JPY: 'var(--s-ind)' };

// ── Países del catálogo: coordenadas aproximadas (centro del país) y región ──
export const PAISES: Record<string, { lat: number; lon: number; region: Region }> = {
  'España': { lat: 40.2, lon: -3.7, region: 'España' },
  'EE. UU.': { lat: 39, lon: -98, region: 'Norteamérica' },
  'Japón': { lat: 36.5, lon: 138.5, region: 'Asia-Pacífico' },
  'Corea del Sur': { lat: 36.4, lon: 127.8, region: 'Asia-Pacífico' },
  'Francia': { lat: 46.8, lon: 2.4, region: 'Resto de Europa' },
  'Reino Unido': { lat: 53, lon: -1.8, region: 'Resto de Europa' },
  'Alemania': { lat: 51, lon: 10.4, region: 'Resto de Europa' },
  'Suiza': { lat: 46.8, lon: 8.2, region: 'Resto de Europa' },
  'Dinamarca': { lat: 56, lon: 9.5, region: 'Resto de Europa' },
  'Noruega': { lat: 61, lon: 9, region: 'Resto de Europa' },
  'Italia': { lat: 42.8, lon: 12.6, region: 'Resto de Europa' },
  'Países Bajos': { lat: 52.2, lon: 5.5, region: 'Resto de Europa' },
};
/** Región aproximada de un punto del mapa (para colorear «dónde venden»). */
export function regionDe(lat: number, lon: number): Region {
  if (lat >= 36 && lat <= 44.5 && lon >= -10 && lon <= 3.5) return 'España';
  if (lon >= -25 && lon <= 45 && lat >= 35 && lat <= 72) return 'Resto de Europa';
  if (lon < -30) return lat >= 24 ? 'Norteamérica' : 'Latinoamérica';
  if ((lon >= 60 && lat < 55 && lat > -50) || (lon >= 95 && lat < 55)) return 'Asia-Pacífico';
  return 'Otros';
}

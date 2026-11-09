// Klever v1 · LIGA (temporadas de 12 semanas, sin precios ni rentabilidad). PURO.
// Cada semana hasta 100 puntos: EQUILIBRIO 50 + APRENDIZAJE 30 + CONSTANCIA 20 (reglas de ronda36/LIGA.md y ronda43/ESPECIFICACION-V1.md).
// · Equilibrio: concentración baja 25 / media 12; variedad amplia 25 / media 12. Requiere ≥ 4 posiciones, cartera al 100 % y CUMPLIR las reglas de la liga.
// · Aprendizaje: reto de la semana 20 + revisar una empresa (ficha o comparador) esa semana 10.
// · Constancia: entrar esa semana 10, +2 por semana seguida (hasta +10).
import { analizar, UMBRALES } from './cartera';
import { empresa, CATALOGO } from './catalogo';
import type { Foto, PuntosSemana, ReglasLiga, RetoSemana, Posicion, FilaClasificacion, EstadoDraft } from './tipos';

export const SEMANAS_TEMPORADA = 12;
const P_CONC = { ok: 25, medio: 12, alto: 0 } as const, P_VAR = { ok: 25, medio: 12, alto: 0 } as const;

// ── Fechas (hora de Madrid) ────────────────────────────────────────────────
const fmtMadrid = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function partesMadrid(d: Date) { const o: Record<string, string> = {}; for (const p of fmtMadrid.formatToParts(d)) o[p.type] = p.value; return o; }
export const sumarDias = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const DIAS: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
/** Lunes (fecha de Madrid, yyyy-mm-dd) de la semana que contiene el instante d. */
export function lunesDe(d: Date = new Date()): string { const p = partesMadrid(d); return sumarDias(`${p.year}-${p.month}-${p.day}`, -DIAS[p.weekday]); }
/** Instante UTC (ISO) de las 00:00 de Madrid de la fecha dada. */
export function medianocheMadrid(iso: string): string {
  const guess = Date.parse(iso + 'T00:00:00Z');
  for (const off of [-1, -2, 0]) { const t = guess + off * 36e5; const p = partesMadrid(new Date(t)); if (`${p.year}-${p.month}-${p.day}` === iso && p.hour === '00' && p.minute === '00') return new Date(t).toISOString(); }
  return new Date(guess - 36e5).toISOString();
}
export function temporada(inicio: string) { const semanas = [...Array(SEMANAS_TEMPORADA)].map((_, i) => sumarDias(inicio, 7 * i)); return { inicio, fin: sumarDias(inicio, 7 * SEMANAS_TEMPORADA - 1), semanas }; }
/** Número de semana de la temporada para un lunes: 1..12; 0 antes de empezar; 13 después. */
export function numeroSemana(inicio: string, lunes: string): number { const i = Math.round((Date.parse(lunes) - Date.parse(inicio)) / (7 * 864e5)); return i < 0 ? 0 : i >= SEMANAS_TEMPORADA ? 13 : i + 1; }

// ── Foto del lunes ─────────────────────────────────────────────────────────
/** Versión vigente en un instante: la última con desde ≤ instante. versiones ordenadas o no. */
export function versionEn<T extends { desde: string }>(versiones: T[], instanteISO: string): T | null {
  let mejor: T | null = null; for (const v of versiones) if (v.desde <= instanteISO && (!mejor || v.desde > mejor.desde)) mejor = v; return mejor;
}
export function foto(semana: string, posiciones: Posicion[]): Foto {
  const a = analizar(posiciones); return { semana, posiciones, concentracion: a.concentracion, variedad: a.variedad, n: a.n, completa: a.completa };
}

// ── Reglas configurables de liga ───────────────────────────────────────────
export function incumplimientos(posiciones: Posicion[], reglas: ReglasLiga, cambiosSemana = 0): string[] {
  const a = analizar(posiciones), out: string[] = [];
  if (reglas.maxPorEmpresa != null && a.mayor && a.mayor.decimas > reglas.maxPorEmpresa * 10) out.push(`Máx. ${reglas.maxPorEmpresa} % por empresa (${a.mayor.ticker} tiene ${a.mayor.decimas / 10} %)`);
  if (reglas.minSectores != null && a.sectores.length < reglas.minSectores) out.push(`Mín. ${reglas.minSectores} sectores (tienes ${a.sectores.length})`);
  if (reglas.maxPorPais != null && a.paises[0] && a.suma && a.paises[0].decimas / a.suma * 100 > reglas.maxPorPais) out.push(`Máx. ${reglas.maxPorPais} % por país (${a.paises[0].clave} tiene ${Math.round(a.paises[0].decimas / a.suma * 100)} %)`);
  if (reglas.maxCambiosSemana != null && cambiosSemana > reglas.maxCambiosSemana) out.push(`Máx. ${reglas.maxCambiosSemana} cambios por semana (llevas ${cambiosSemana})`);
  return out;
}

// ── Retos de la semana (siempre de construcción; se comprueban con la foto) ─
const RETOS: { id: string; titulo: string; pista: string; ok: (p: Posicion[]) => boolean }[] = [
  { id: 'sector40', titulo: 'Ningún sector por encima del 40 %', pista: 'Mira la barra de sectores en Mi cartera.', ok: p => (analizar(p).sectores[0]?.decimas || 0) <= 400 },
  { id: 'cinco', titulo: 'Llega a 5 sectores', pista: 'Descubre empresas de un sector que aún no tengas.', ok: p => analizar(p).sectores.length >= 5 },
  { id: 'mayor25', titulo: 'Ninguna posición por encima del 25 %', pista: 'Prueba un peso en la mayor.', ok: p => (analizar(p).mayor?.decimas || 0) <= 250 },
  { id: 'fuera', titulo: 'Que más de un tercio de tus ventas venga de fuera de España', pista: 'Mira la pestaña Mapa.', ok: p => { const a = analizar(p); return a.coberturaVentas > 0 && a.ventas.find(v => v.region === 'España')!.decimas < 667; } },
  { id: 'datos', titulo: 'Datos completos en al menos el 80 % del peso', pista: 'Las empresas con «sin datos» bajan este indicador.', ok: p => analizar(p).datosPct >= 80 },
  { id: 'seis', titulo: 'Ten al menos 6 posiciones', pista: 'Con más posiciones, cada una pesa menos.', ok: p => analizar(p).n >= 6 },
];
export function retoDeSemana(n: number, posiciones: Posicion[] | null): RetoSemana {
  const r = RETOS[(Math.max(1, n) - 1) % RETOS.length];
  return { id: r.id, titulo: r.titulo, pista: r.pista, hecho: !!posiciones && r.ok(posiciones) };
}

// ── Puntos ────────────────────────────────────────────────────────────────
export interface DatosSemana { semana: string; foto: Foto | null; incumple: string[]; retoHecho: boolean; reviso: boolean; entro: boolean }
export function puntosTemporada(semanas: DatosSemana[], hasta: string): { total: number; semanasBajas: number; detalle: PuntosSemana[]; mejorRacha: number } {
  let racha = 0, mejorRacha = 0; const detalle: PuntosSemana[] = [];
  for (const s of semanas) {
    if (s.semana > hasta) break;
    racha = s.entro ? racha + 1 : 0; mejorRacha = Math.max(mejorRacha, racha);
    const f = s.foto, valida = !!f && f.completa && f.n >= UMBRALES.minPosiciones && !s.incumple.length;
    const equilibrio = valida ? P_CONC[f!.concentracion] + P_VAR[f!.variedad] : 0;
    const aprendizaje = (s.retoHecho ? 20 : 0) + (s.reviso ? 10 : 0);
    const constancia = s.entro ? 10 + Math.min(10, 2 * (racha - 1)) : 0;
    const motivo = !f ? 'Sin cartera inscrita esa semana' : !f.completa ? 'La cartera no estaba al 100 %' : f.n < UMBRALES.minPosiciones ? `Menos de ${UMBRALES.minPosiciones} posiciones` : s.incumple.length ? 'Incumplía una regla de la liga' : '';
    detalle.push({ semana: s.semana, equilibrio, aprendizaje, constancia, total: equilibrio + aprendizaje + constancia, valida, motivo, incumple: s.incumple, bajas: f?.concentracion === 'ok' ? 1 : 0 });
  }
  return { total: detalle.reduce((a, x) => a + x.total, 0), semanasBajas: detalle.reduce((a, x) => a + x.bajas, 0), detalle, mejorRacha };
}
export function clasificar(filas: Omit<FilaClasificacion, 'puesto'>[] & { inscrito?: string }[]): FilaClasificacion[] {
  return [...filas].sort((a, b) => b.total - a.total || b.semanasBajas - a.semanasBajas || a.usuarioId - b.usuarioId).map((f, i) => ({ ...f, puesto: i + 1 }));
}
export function insignia(puesto: number, total: number, completo = true): 'oro' | 'plata' | 'bronce' | 'completada' | null {
  if (!total || !puesto) return null; const q = puesto / total;
  return q <= 0.10 ? 'oro' : q <= 0.25 ? 'plata' : q <= 0.50 ? 'bronce' : completo ? 'completada' : null;
}

// ── Códigos y apodos ───────────────────────────────────────────────────────
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const codigo = (n = 6, aleatorio = Math.random) => [...Array(n)].map(() => LETRAS[Math.floor(aleatorio() * LETRAS.length)]).join('');
export const codigoValido = (c: string, n = 6) => new RegExp(`^[${LETRAS}]{${n}}$`).test(String(c || '').toUpperCase());
export const apodoValido = (a: string) => { const s = String(a || '').trim(); return s.length >= 3 && s.length <= 20 && /^[\p{L}\p{N} ._-]+$/u.test(s) && !s.includes('@'); };

// ── Draft (serpiente) ──────────────────────────────────────────────────────
export const RONDAS_DRAFT = 6;
/** A quién le toca en el pick número k (0-based) con el orden dado (serpiente: 1→N, N→1, …). */
export function turnoDraft(orden: number[], k: number): { usuarioId: number; ronda: number } | null {
  const n = orden.length; if (!n || k >= n * RONDAS_DRAFT) return null;
  const ronda = Math.floor(k / n), i = k % n; return { usuarioId: ronda % 2 === 0 ? orden[i] : orden[n - 1 - i], ronda: ronda + 1 };
}
export function estadoDraft(orden: { usuarioId: number; apodo: string }[], picks: { ronda: number; usuarioId: number; ticker: string }[], cambioUsado = false): EstadoDraft {
  const t = turnoDraft(orden.map(o => o.usuarioId), picks.length), tomadas = new Set(picks.map(p => p.ticker));
  return { ronda: t?.ronda ?? RONDAS_DRAFT, rondas: RONDAS_DRAFT, turnoDe: t?.usuarioId ?? null, orden, picks, libres: CATALOGO.map(e => e.ticker).filter(x => !tomadas.has(x)), cambioUsadoEstaSemana: cambioUsado };
}
export function puedeElegir(est: EstadoDraft, usuarioId: number, ticker: string): string | null {
  if (est.turnoDe == null) return 'El draft ya ha terminado.';
  if (est.turnoDe !== usuarioId) return 'No es tu turno.';
  if (!empresa(ticker)) return 'Esa empresa no existe en el catálogo.';
  if (!est.libres.includes(ticker)) return 'Esa empresa ya la tiene otra persona de la liga.';
  return null;
}

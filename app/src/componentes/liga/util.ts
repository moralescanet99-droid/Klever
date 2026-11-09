// Klever v1 · La Liga: utilidades de interfaz (formato, avatares, copiar y compartir). Sin datos de negocio.
import type { Liga, ReglasLiga } from '../../lib/dominio/tipos';

/** Dos letras para el avatar de un apodo («luna_indexada» → «LI»; «marea_baja» → «MB»). */
export function iniciales(apodo: string): string {
  const partes = apodo.replace(/^@/, '').split(/[\s._-]+/).filter(Boolean);
  const s = partes.length > 1 ? partes[0][0] + partes[1][0] : apodo.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2);
  return s.toUpperCase();
}
const FONDOS = ['var(--cobre-f)', 'var(--agua-f)', 'var(--lila-f)', 'var(--medio-f)', 'var(--ok-f)', 'var(--alto-f)'];
/** Color de fondo estable por persona (tokens). */
export function fondoAvatar(id: number): string { return FONDOS[Math.abs(id) % FONDOS.length]; }

const fmtDia = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
const fmtCorto = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
/** «lunes, 9 nov» a partir de yyyy-mm-dd. */
export const diaLargo = (iso: string) => fmtDia.format(new Date(iso + 'T00:00:00Z')).replace(/\.$/, '').replace(',', '');
export const diaCorto = (iso: string) => fmtCorto.format(new Date(iso + 'T00:00:00Z')).replace(/\.$/, '');

export const TIPO_TXT: Record<Liga['tipo'], string> = { clasica: 'Clásica', draft: 'Draft', general: 'General' };

/** Explicación de cada regla configurable (para el formulario y la lista de reglas). */
export const REGLAS_INFO: { clave: keyof ReglasLiga; titulo: (v: number) => string; explica: string; min: number; max: number; defecto: number; unidad: string }[] = [
  { clave: 'maxPorEmpresa', titulo: v => `Máx. ${v} % por empresa`, explica: 'Ninguna empresa puede pesar más de ese porcentaje.', min: 10, max: 100, defecto: 25, unidad: '%' },
  { clave: 'minSectores', titulo: v => `Mín. ${v} sectores`, explica: 'La cartera debe tener al menos ese número de sectores.', min: 1, max: 8, defecto: 5, unidad: 'sectores' },
  { clave: 'maxCambiosSemana', titulo: v => `Máx. ${v} cambios por semana`, explica: 'Cuenta las veces que guardas la cartera entre dos lunes.', min: 0, max: 20, defecto: 3, unidad: 'cambios' },
  { clave: 'maxPorPais', titulo: v => `Máx. ${v} % por país`, explica: 'Ningún país de sede puede pasar de ese porcentaje.', min: 20, max: 100, defecto: 60, unidad: '%' },
];
export const hayReglas = (r: ReglasLiga) => REGLAS_INFO.some(i => r[i.clave] != null);

/** Enlace de invitación (abre «Unirme» con el código ya escrito). */
export function enlaceInvitacion(codigo: string): string {
  const base = typeof location !== 'undefined' ? location.href.split('#')[0] : '';
  return `${base}#/liga/unirse?codigo=${encodeURIComponent(codigo)}`;
}
export function textoInvitacion(nombre: string, codigo: string): string {
  return `Únete a mi liga «${nombre}» en Klever (simulación, sin dinero real). Código: ${codigo}. Entra aquí: ${enlaceInvitacion(codigo)}`;
}

/** Copia texto al portapapeles. Devuelve true si lo consigue. */
export async function copiar(texto: string): Promise<boolean> {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(texto); return true; } } catch { /* sigue con el plan B */ }
  try {
    const t = document.createElement('textarea'); t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok;
  } catch { return false; }
}
/** Comparte con navigator.share; si no existe o falla (no por cancelar), copia. Devuelve 'compartido' | 'copiado' | 'cancelado' | 'error'. */
export async function compartir(datos: { title?: string; text: string }): Promise<'compartido' | 'copiado' | 'cancelado' | 'error'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try { await navigator.share(datos); return 'compartido'; }
    catch (e) { if ((e as DOMException)?.name === 'AbortError') return 'cancelado'; }
  }
  return (await copiar(datos.text)) ? 'copiado' : 'error';
}

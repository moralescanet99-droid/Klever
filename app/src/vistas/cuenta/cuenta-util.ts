// Klever v1 · utilidades de las vistas de cuenta.
/** Enlace para compartir una invitación. Funciona en Pages (https://…/#/entrar?invitacion=X) y en la demo (file://…#/…). */
export function enlaceInvitacion(codigo: string): string {
  const base = location.protocol === 'file:' ? location.href.split('#')[0] : location.origin + '/';
  return `${base}#/entrar?invitacion=${encodeURIComponent(codigo)}`;
}
export async function copiar(texto: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(texto); return true; }
  catch {
    try { // reserva para navegadores sin Clipboard API (o sin permiso)
      const t = document.createElement('textarea'); t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok;
    } catch { return false; }
  }
}
const FMT = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
export const fechaCorta = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? '' : FMT.format(d).replace('.', ''); };

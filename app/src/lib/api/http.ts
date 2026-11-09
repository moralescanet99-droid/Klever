// Klever v1 · Api contra el servidor real (functions/ en Cloudflare Pages). Sesión en cookie HttpOnly.
import { ErrorApi, type Api } from './contrato';

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let r: Response;
  try { r = await fetch(ruta, { method: metodo, credentials: 'same-origin', headers: cuerpo !== undefined ? { 'content-type': 'application/json' } : {}, body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined }); }
  catch { throw new ErrorApi('red', 'No hay conexión. Revisa tu internet y vuelve a intentarlo.', 0); }
  const datos = (r.status === 204 ? null : await r.json().catch(() => null)) as { codigo?: string; mensaje?: string } | null;
  if (!r.ok) throw new ErrorApi(datos?.codigo || 'error', datos?.mensaje || 'Algo ha fallado. Vuelve a intentarlo.', r.status);
  return datos as T;
}
const g = <T>(r: string) => pedir<T>('GET', r), p = <T>(r: string, b: unknown = {}) => pedir<T>('POST', r, b);

export function crearApiHttp(): Api {
  return {
    sesion: () => g('/api/sesion'),
    solicitarAcceso: (email, invitacion) => p('/api/acceso', { email, invitacion }),
    completarAlta: (apodo, mayor18) => p('/api/alta', { apodo, mayor18 }),
    salir: () => p('/api/salir'),
    carteras: () => g('/api/carteras'),
    crearCartera: (nombre, posiciones) => p('/api/carteras', { nombre, posiciones }),
    guardarCartera: (id, posiciones, nombre) => pedir('PUT', `/api/carteras/${id}`, { posiciones, nombre }),
    borrarCartera: id => pedir('DELETE', `/api/carteras/${id}`),
    marcarPrincipal: id => p(`/api/carteras/${id}/principal`),
    historial: id => g(`/api/carteras/${id}/historial`),
    revisarEmpresa: ticker => p('/api/revision', { ticker }),
    temporadaActual: () => g('/api/temporada'),
    misLigas: () => g('/api/ligas'),
    crearLiga: (nombre, tipo, reglas) => p('/api/ligas', { nombre, tipo, reglas }),
    unirseLiga: codigo => p('/api/ligas/unirse', { codigo }),
    unirseGeneral: () => p('/api/ligas/general'),
    salirLiga: id => p(`/api/ligas/${id}/salir`),
    detalleLiga: id => g(`/api/ligas/${id}`),
    inscribirCartera: (ligaId, carteraId) => p(`/api/ligas/${ligaId}/cartera`, { carteraId }),
    empezarDraft: id => p(`/api/ligas/${id}/draft/empezar`),
    elegirDraft: (id, ticker) => p(`/api/ligas/${id}/draft/elegir`, { ticker }),
    cambioDraft: (id, sale, entra) => p(`/api/ligas/${id}/draft/cambio`, { sale, entra }),
    resumen: id => g(`/api/ligas/${id}/resumen`),
    misInvitaciones: () => g('/api/invitaciones'),
    crearInvitacion: nota => p('/api/invitaciones', { nota }),
    adminInvitaciones: () => g('/api/admin/invitaciones'),
    adminCrearInvitacion: (usosMax, nota) => p('/api/admin/invitaciones', { usosMax, nota }),
    evento: nombre => p('/api/evento', { nombre }).then(() => undefined).catch(() => undefined),
  };
}

// Estado global mínimo: sesión, carteras del usuario y avisos. Las vistas llaman a recargar() tras cambiar datos.
import { api, ErrorApi, type Sesion } from '../api';
import type { Cartera } from '../dominio/tipos';

export const estado = $state({ sesion: null as Sesion | null, carteras: [] as Cartera[], cargando: true, aviso: '' as string });
export async function cargarSesion() {
  estado.cargando = true;
  try { estado.sesion = await api.sesion(); if (estado.sesion.usuario) estado.carteras = await api.carteras(); }
  catch (e) { estado.sesion = { usuario: null, necesitaAlta: false, modoPruebas: false, demo: false }; avisar(mensaje(e)); }
  finally { estado.cargando = false; }
}
export async function recargarCarteras() { estado.carteras = await api.carteras(); }
export const principal = () => estado.carteras.find(c => c.principal && !c.ligaId) || estado.carteras.find(c => !c.ligaId) || null;
let t: ReturnType<typeof setTimeout>;
export function avisar(m: string) { estado.aviso = m; clearTimeout(t); t = setTimeout(() => (estado.aviso = ''), 3200); }
export const mensaje = (e: unknown) => (e instanceof ErrorApi || e instanceof Error ? e.message : 'Algo ha fallado.');

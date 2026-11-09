// Klever v1 · Api en MODO DEMO: todo en el navegador, con la semilla de ejemplo. Nada se guarda: se pierde al recargar.
// Mismo servicio que el servidor real, sobre un repositorio en memoria.
import { RepoMemoria } from '../servicio/memoria';
import { sembrar } from '../servicio/semilla';
import { Servicio } from '../servicio/servicio';
import { ErrorApi, type Api, type Sesion } from './contrato';

export function crearApiDemo(): Api {
  const repo = new RepoMemoria(), srv = new Servicio(repo);
  let uid: number | null = null; const listo = sembrar(repo).then(r => { uid = r.usuarioId; });
  const yo = async () => { await listo; if (uid == null) throw new ErrorApi('sesion', 'Entra para continuar.', 401); return uid; };
  return {
    async sesion(): Promise<Sesion> { await listo; if (uid != null) await srv.visita(uid); return { usuario: uid != null ? { ...(await srv.usuario(uid)), esAdmin: true } : null, necesitaAlta: false, modoPruebas: true, demo: true }; },
    async solicitarAcceso() { await listo; return { enviado: false, enlacePruebas: '#/' }; },
    async completarAlta() { return srv.usuario(await yo()); },
    async salir() { uid = null; },
    carteras: async () => srv.carteras(await yo()),
    crearCartera: async (n, p) => srv.crearCartera(await yo(), n, p),
    guardarCartera: async (id, p, n) => srv.guardarCartera(await yo(), id, p, n),
    borrarCartera: async id => srv.borrarCartera(await yo(), id),
    marcarPrincipal: async id => srv.marcarPrincipal(await yo(), id),
    historial: async id => srv.historial(await yo(), id),
    revisarEmpresa: async t => srv.revisarEmpresa(await yo(), t),
    temporadaActual: async () => { await listo; return srv.temporadaActual(); },
    misLigas: async () => srv.misLigas(await yo()),
    crearLiga: async (n, t, r) => srv.crearLiga(await yo(), n, t, r),
    unirseLiga: async c => srv.unirseLiga(await yo(), c),
    unirseGeneral: async () => srv.unirseGeneral(await yo()),
    salirLiga: async id => srv.salirLiga(await yo(), id),
    detalleLiga: async id => srv.detalleLiga(await yo(), id),
    inscribirCartera: async (l, c) => srv.inscribirCartera(await yo(), l, c),
    empezarDraft: async id => srv.empezarDraft(await yo(), id),
    elegirDraft: async (id, t) => srv.elegirDraft(await yo(), id, t),
    cambioDraft: async (id, s, e) => srv.cambioDraft(await yo(), id, s, e),
    resumen: async id => srv.resumen(await yo(), id),
    misInvitaciones: async () => srv.misInvitaciones(await yo()),
    crearInvitacion: async nota => srv.crearInvitacion(await yo(), nota),
    adminInvitaciones: async () => { await yo(); return srv.todasInvitaciones(); },
    adminCrearInvitacion: async (usos, nota) => { await yo(); return srv.crearInvitacion(null, nota, usos); },
    evento: async () => {},
  };
}

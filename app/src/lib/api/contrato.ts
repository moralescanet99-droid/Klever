// Klever v1 · CONTRATO entre la interfaz y el servidor. La interfaz SOLO usa esta interfaz `Api`.
// Dos implementaciones: `http.ts` (servidor real: functions/ + D1) y `demo.ts` (todo en el navegador, datos de ejemplo).
// Las rutas HTTP equivalentes están anotadas en cada método (las implementa functions/api/[[ruta]].ts).
import type { Cartera, DetalleLiga, Invitacion, Liga, Posicion, ReglasLiga, ResumenTemporada, TipoLiga, Usuario, VersionCartera, Foto, Temporada } from '../dominio/tipos';

export interface Sesion { usuario: Usuario | null; necesitaAlta: boolean; modoPruebas: boolean; demo: boolean }

export class ErrorApi extends Error { constructor(public codigo: string, mensaje: string, public estado = 400) { super(mensaje); } }

export interface Api {
  // Acceso (enlace por correo; beta privada con código de invitación)
  sesion(): Promise<Sesion>;                                                                       // GET  /api/sesion
  solicitarAcceso(email: string, invitacion?: string): Promise<{ enviado: boolean; enlacePruebas?: string }>; // POST /api/acceso
  completarAlta(apodo: string, mayor18: boolean): Promise<Usuario>;                                 // POST /api/alta
  salir(): Promise<void>;                                                                          // POST /api/salir

  // Carteras
  carteras(): Promise<Cartera[]>;                                                                  // GET    /api/carteras
  crearCartera(nombre: string, posiciones: Posicion[]): Promise<Cartera>;                           // POST   /api/carteras
  guardarCartera(id: number, posiciones: Posicion[], nombre?: string): Promise<Cartera>;            // PUT    /api/carteras/:id
  borrarCartera(id: number): Promise<void>;                                                         // DELETE /api/carteras/:id
  marcarPrincipal(id: number): Promise<void>;                                                      // POST   /api/carteras/:id/principal
  historial(id: number): Promise<{ versiones: VersionCartera[]; fotos: Foto[] }>;                    // GET    /api/carteras/:id/historial

  // Aprendizaje: revisar una empresa (abrir ficha o comparar) cuenta 10 puntos esa semana
  revisarEmpresa(ticker: string): Promise<void>;                                                   // POST   /api/revision

  // Liga
  temporadaActual(): Promise<Temporada>;                                                           // GET    /api/temporada
  misLigas(): Promise<Liga[]>;                                                                     // GET    /api/ligas
  crearLiga(nombre: string, tipo: Exclude<TipoLiga, 'general'>, reglas: ReglasLiga): Promise<Liga>;  // POST   /api/ligas
  unirseLiga(codigo: string): Promise<Liga>;                                                       // POST   /api/ligas/unirse
  unirseGeneral(): Promise<Liga>;                                                                  // POST   /api/ligas/general
  salirLiga(id: number): Promise<void>;                                                            // POST   /api/ligas/:id/salir
  detalleLiga(id: number): Promise<DetalleLiga>;                                                   // GET    /api/ligas/:id
  inscribirCartera(ligaId: number, carteraId: number): Promise<void>;                              // POST   /api/ligas/:id/cartera
  empezarDraft(ligaId: number): Promise<void>;                                                     // POST   /api/ligas/:id/draft/empezar
  elegirDraft(ligaId: number, ticker: string): Promise<void>;                                      // POST   /api/ligas/:id/draft/elegir
  cambioDraft(ligaId: number, sale: string, entra: string): Promise<void>;                         // POST   /api/ligas/:id/draft/cambio
  resumen(ligaId: number): Promise<ResumenTemporada>;                                              // GET    /api/ligas/:id/resumen

  // Invitaciones (beta privada)
  misInvitaciones(): Promise<Invitacion[]>;                                                        // GET    /api/invitaciones
  crearInvitacion(nota?: string): Promise<Invitacion>;                                             // POST   /api/invitaciones (usuarios: hasta 5; admin: sin límite y con usos)
  adminInvitaciones(): Promise<Invitacion[]>;                                                      // GET    /api/admin/invitaciones (solo ADMIN_EMAIL)
  adminCrearInvitacion(usosMax: number, nota: string): Promise<Invitacion>;                        // POST   /api/admin/invitaciones

  // Medición anónima (un número por día y evento; nada en el dispositivo)
  evento(nombre: string): Promise<void>;                                                           // POST   /api/evento
}

// Klever v1 · REPOSITORIO: la única puerta a los datos. Dos implementaciones con el MISMO comportamiento:
//   · memoria.ts  (modo demo y pruebas unitarias)
//   · functions/_lib/repo-d1.ts (servidor real, Cloudflare D1)
// Fechas en ISO UTC (instantes) o yyyy-mm-dd (lunes). Pesos en décimas.
import type { Posicion, ReglasLiga, TipoLiga, EstadoLiga, VersionCartera } from '../dominio/tipos';

export interface FilaUsuario { id: number; email: string; apodo: string; mayor18En: string; invitadoPor: string | null; creado: string }
export interface FilaCartera { id: number; usuarioId: number; nombre: string; principal: boolean; ligaId: number | null; creada: string }
export interface FilaTemporada { id: number; nombre: string; inicio: string }
export interface FilaLiga { id: number; codigo: string; nombre: string; tipo: TipoLiga; estado: EstadoLiga; reglas: ReglasLiga; creadorId: number; temporadaId: number; creada: string }
export interface FilaMiembro { ligaId: number; usuarioId: number; carteraId: number | null; unido: string; ordenDraft: number | null }
export interface FilaPick { ligaId: number; ronda: number; usuarioId: number; ticker: string; en: string }
export interface FilaInvitacion { codigo: string; creadaPor: number | null; usosMax: number; usos: number; creada: string; nota: string }

export interface Repo {
  // usuarios
  usuario(id: number): Promise<FilaUsuario | null>;
  usuarioPorEmail(email: string): Promise<FilaUsuario | null>;
  usuarioPorApodo(apodo: string): Promise<FilaUsuario | null>;
  crearUsuario(u: Omit<FilaUsuario, 'id'>): Promise<FilaUsuario>;
  // carteras y su historial de versiones (cada guardado = una versión nueva)
  carteras(usuarioId: number): Promise<FilaCartera[]>;
  cartera(id: number): Promise<FilaCartera | null>;
  crearCartera(c: Omit<FilaCartera, 'id'>): Promise<FilaCartera>;
  actualizarCartera(id: number, cambios: Partial<Pick<FilaCartera, 'nombre' | 'principal'>>): Promise<void>;
  borrarCartera(id: number): Promise<void>;
  versiones(carteraId: number): Promise<VersionCartera[]>;
  anadirVersion(carteraId: number, desde: string, posiciones: Posicion[]): Promise<void>;
  // aprendizaje y constancia (por semana = lunes yyyy-mm-dd)
  anadirRevision(usuarioId: number, semana: string, ticker: string): Promise<void>;
  semanasConRevision(usuarioId: number): Promise<string[]>;
  marcarVisita(usuarioId: number, semana: string): Promise<void>;
  semanasConVisita(usuarioId: number): Promise<string[]>;
  // temporadas y ligas
  temporadas(): Promise<FilaTemporada[]>;
  crearTemporada(t: Omit<FilaTemporada, 'id'>): Promise<FilaTemporada>;
  liga(id: number): Promise<FilaLiga | null>;
  ligaPorCodigo(codigo: string): Promise<FilaLiga | null>;
  ligaGeneral(temporadaId: number): Promise<FilaLiga | null>;
  crearLiga(l: Omit<FilaLiga, 'id'>): Promise<FilaLiga>;
  actualizarEstadoLiga(id: number, estado: EstadoLiga): Promise<void>;
  ligasDeUsuario(usuarioId: number): Promise<FilaLiga[]>;
  miembros(ligaId: number): Promise<FilaMiembro[]>;
  anadirMiembro(m: FilaMiembro): Promise<void>;
  quitarMiembro(ligaId: number, usuarioId: number): Promise<void>;
  fijarCarteraMiembro(ligaId: number, usuarioId: number, carteraId: number | null): Promise<void>;
  fijarOrdenDraft(ligaId: number, usuarioId: number, orden: number): Promise<void>;
  // draft
  picks(ligaId: number): Promise<FilaPick[]>;
  anadirPick(p: FilaPick): Promise<void>;
  cambiarPick(ligaId: number, usuarioId: number, sale: string, entra: string, semana: string): Promise<void>;
  cambiosDraftSemana(ligaId: number, usuarioId: number, semana: string): Promise<number>;
  // invitaciones
  invitacion(codigo: string): Promise<FilaInvitacion | null>;
  invitacionesDe(creadaPor: number | null): Promise<FilaInvitacion[]>;   // null = todas (admin)
  crearInvitacion(i: FilaInvitacion): Promise<void>;
  usarInvitacion(codigo: string): Promise<void>;
  // medición anónima
  sumarEvento(dia: string, nombre: string): Promise<void>;
}

// Klever v1 · Repo EN MEMORIA (modo demo y pruebas unitarias). Mismo comportamiento que el de D1.
import type { Posicion, VersionCartera } from '../dominio/tipos';
import type { FilaCartera, FilaInvitacion, FilaLiga, FilaMiembro, FilaPick, FilaTemporada, FilaUsuario, Repo } from './repo';

const copia = <T>(x: T): T => JSON.parse(JSON.stringify(x));

export class RepoMemoria implements Repo {
  usuarios: FilaUsuario[] = []; carterasT: FilaCartera[] = []; versionesT: { carteraId: number; desde: string; posiciones: Posicion[] }[] = [];
  revisiones: { usuarioId: number; semana: string; ticker: string }[] = []; visitas: { usuarioId: number; semana: string }[] = [];
  temporadasT: FilaTemporada[] = []; ligas: FilaLiga[] = []; miembrosT: FilaMiembro[] = []; picksT: FilaPick[] = [];
  cambios: { ligaId: number; usuarioId: number; semana: string }[] = []; invitaciones: FilaInvitacion[] = []; eventos: Record<string, number> = {};
  private sec = 1; private id() { return this.sec++; }

  async usuario(id: number) { return copia(this.usuarios.find(u => u.id === id) || null); }
  async usuarioPorEmail(email: string) { return copia(this.usuarios.find(u => u.email === email.toLowerCase()) || null); }
  async usuarioPorApodo(apodo: string) { return copia(this.usuarios.find(u => u.apodo.toLowerCase() === apodo.toLowerCase()) || null); }
  async crearUsuario(u: Omit<FilaUsuario, 'id'>) { const f = { ...u, email: u.email.toLowerCase(), id: this.id() }; this.usuarios.push(f); return copia(f); }

  async carteras(usuarioId: number) { return copia(this.carterasT.filter(c => c.usuarioId === usuarioId)); }
  async cartera(id: number) { return copia(this.carterasT.find(c => c.id === id) || null); }
  async crearCartera(c: Omit<FilaCartera, 'id'>) { const f = { ...c, id: this.id() }; this.carterasT.push(f); return copia(f); }
  async actualizarCartera(id: number, cambios: Partial<Pick<FilaCartera, 'nombre' | 'principal'>>) { const c = this.carterasT.find(x => x.id === id); if (c) Object.assign(c, cambios); }
  async borrarCartera(id: number) { this.carterasT = this.carterasT.filter(c => c.id !== id); this.versionesT = this.versionesT.filter(v => v.carteraId !== id); }
  async versiones(carteraId: number): Promise<VersionCartera[]> { return copia(this.versionesT.filter(v => v.carteraId === carteraId).map(v => ({ desde: v.desde, posiciones: v.posiciones }))); }
  async anadirVersion(carteraId: number, desde: string, posiciones: Posicion[]) { this.versionesT.push({ carteraId, desde, posiciones: copia(posiciones) }); }

  async anadirRevision(usuarioId: number, semana: string, ticker: string) { if (!this.revisiones.some(r => r.usuarioId === usuarioId && r.semana === semana && r.ticker === ticker)) this.revisiones.push({ usuarioId, semana, ticker }); }
  async semanasConRevision(usuarioId: number) { return [...new Set(this.revisiones.filter(r => r.usuarioId === usuarioId).map(r => r.semana))]; }
  async marcarVisita(usuarioId: number, semana: string) { if (!this.visitas.some(v => v.usuarioId === usuarioId && v.semana === semana)) this.visitas.push({ usuarioId, semana }); }
  async semanasConVisita(usuarioId: number) { return this.visitas.filter(v => v.usuarioId === usuarioId).map(v => v.semana); }

  async temporadas() { return copia(this.temporadasT); }
  async crearTemporada(t: Omit<FilaTemporada, 'id'>) { const f = { ...t, id: this.id() }; this.temporadasT.push(f); return copia(f); }
  async liga(id: number) { return copia(this.ligas.find(l => l.id === id) || null); }
  async ligaPorCodigo(codigo: string) { return copia(this.ligas.find(l => l.codigo === codigo && l.tipo !== 'general') || null); }
  async ligaGeneral(temporadaId: number) { return copia(this.ligas.find(l => l.tipo === 'general' && l.temporadaId === temporadaId) || null); }
  async crearLiga(l: Omit<FilaLiga, 'id'>) { const f = { ...copia(l), id: this.id() }; this.ligas.push(f); return copia(f); }
  async actualizarEstadoLiga(id: number, estado: FilaLiga['estado']) { const l = this.ligas.find(x => x.id === id); if (l) l.estado = estado; }
  async ligasDeUsuario(usuarioId: number) { const ids = new Set(this.miembrosT.filter(m => m.usuarioId === usuarioId).map(m => m.ligaId)); return copia(this.ligas.filter(l => ids.has(l.id))); }
  async miembros(ligaId: number) { return copia(this.miembrosT.filter(m => m.ligaId === ligaId)); }
  async anadirMiembro(m: FilaMiembro) { this.miembrosT.push(copia(m)); }
  async quitarMiembro(ligaId: number, usuarioId: number) { this.miembrosT = this.miembrosT.filter(m => !(m.ligaId === ligaId && m.usuarioId === usuarioId)); }
  async fijarCarteraMiembro(ligaId: number, usuarioId: number, carteraId: number | null) { const m = this.miembrosT.find(x => x.ligaId === ligaId && x.usuarioId === usuarioId); if (m) m.carteraId = carteraId; }
  async fijarOrdenDraft(ligaId: number, usuarioId: number, orden: number) { const m = this.miembrosT.find(x => x.ligaId === ligaId && x.usuarioId === usuarioId); if (m) m.ordenDraft = orden; }

  async picks(ligaId: number) { return copia(this.picksT.filter(p => p.ligaId === ligaId).sort((a, b) => a.en.localeCompare(b.en))); }
  async anadirPick(p: FilaPick) { if (this.picksT.some(x => x.ligaId === p.ligaId && x.ticker === p.ticker)) throw new Error('UNIQUE'); this.picksT.push(copia(p)); }
  async cambiarPick(ligaId: number, usuarioId: number, sale: string, entra: string, semana: string) {
    const p = this.picksT.find(x => x.ligaId === ligaId && x.usuarioId === usuarioId && x.ticker === sale); if (p) p.ticker = entra;
    this.cambios.push({ ligaId, usuarioId, semana });
  }
  async cambiosDraftSemana(ligaId: number, usuarioId: number, semana: string) { return this.cambios.filter(c => c.ligaId === ligaId && c.usuarioId === usuarioId && c.semana === semana).length; }

  async invitacion(codigo: string) { return copia(this.invitaciones.find(i => i.codigo === codigo) || null); }
  async invitacionesDe(creadaPor: number | null) { return copia(this.invitaciones.filter(i => creadaPor === null || i.creadaPor === creadaPor)); }
  async crearInvitacion(i: FilaInvitacion) { this.invitaciones.push(copia(i)); }
  async usarInvitacion(codigo: string) { const i = this.invitaciones.find(x => x.codigo === codigo); if (i) i.usos++; }
  async sumarEvento(dia: string, nombre: string) { const k = `${dia}|${nombre}`; this.eventos[k] = (this.eventos[k] || 0) + 1; }
}

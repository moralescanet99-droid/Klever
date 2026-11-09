// Klever v1 · Repo sobre Cloudflare D1. MISMO comportamiento que src/lib/servicio/memoria.ts
// (lo comprueba la batería compartida src/lib/servicio/repo.contrato.ts contra SQLite real).
// El orden de las listas imita al de memoria: orden de inserción (rowid), salvo picks (por instante).
import type { D1Database } from '@cloudflare/workers-types';
import type { EstadoLiga, Posicion, VersionCartera } from '../../src/lib/dominio/tipos';
import type { FilaCartera, FilaInvitacion, FilaLiga, FilaMiembro, FilaPick, FilaTemporada, FilaUsuario, Repo } from '../../src/lib/servicio/repo';

type Fila = Record<string, unknown>;
const n = (x: unknown) => Number(x);
const nn = (x: unknown) => (x === null || x === undefined ? null : Number(x));

const aUsuario = (r: Fila): FilaUsuario => ({ id: n(r.id), email: String(r.email), apodo: String(r.apodo), mayor18En: String(r.mayor18_en), invitadoPor: (r.invitado_por as string) ?? null, creado: String(r.creado) });
const aCartera = (r: Fila): FilaCartera => ({ id: n(r.id), usuarioId: n(r.usuario_id), nombre: String(r.nombre), principal: !!n(r.principal), ligaId: nn(r.liga_id), creada: String(r.creada) });
const aLiga = (r: Fila): FilaLiga => ({ id: n(r.id), codigo: String(r.codigo), nombre: String(r.nombre), tipo: r.tipo as FilaLiga['tipo'], estado: r.estado as EstadoLiga, reglas: JSON.parse(String(r.reglas)), creadorId: n(r.creador_id), temporadaId: n(r.temporada_id), creada: String(r.creada) });
const aMiembro = (r: Fila): FilaMiembro => ({ ligaId: n(r.liga_id), usuarioId: n(r.usuario_id), carteraId: nn(r.cartera_id), unido: String(r.unido), ordenDraft: nn(r.orden_draft) });
const aPick = (r: Fila): FilaPick => ({ ligaId: n(r.liga_id), ronda: n(r.ronda), usuarioId: n(r.usuario_id), ticker: String(r.ticker), en: String(r.en) });
const aInv = (r: Fila): FilaInvitacion => ({ codigo: String(r.codigo), creadaPor: nn(r.creada_por), usosMax: n(r.usos_max), usos: n(r.usos), creada: String(r.creada), nota: String(r.nota ?? '') });

export class RepoD1 implements Repo {
  constructor(private db: D1Database) {}
  private async uno(sql: string, ...a: unknown[]): Promise<Fila | null> { return (await this.db.prepare(sql).bind(...a).first<Fila>()) ?? null; }
  private async todos(sql: string, ...a: unknown[]): Promise<Fila[]> { return (await this.db.prepare(sql).bind(...a).all<Fila>()).results ?? []; }
  private async ejecutar(sql: string, ...a: unknown[]) { return this.db.prepare(sql).bind(...a).run(); }

  // ── usuarios ──
  async usuario(id: number) { const r = await this.uno('SELECT * FROM usuarios WHERE id = ?', id); return r ? aUsuario(r) : null; }
  async usuarioPorEmail(email: string) { const r = await this.uno('SELECT * FROM usuarios WHERE email = ?', email.toLowerCase()); return r ? aUsuario(r) : null; }
  async usuarioPorApodo(apodo: string) { const r = await this.uno('SELECT * FROM usuarios WHERE apodo_clave = ?', apodo.toLowerCase()); return r ? aUsuario(r) : null; }
  async crearUsuario(u: Omit<FilaUsuario, 'id'>) {
    const r = await this.uno('INSERT INTO usuarios (email, apodo, apodo_clave, mayor18_en, invitado_por, creado) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      u.email.toLowerCase(), u.apodo, u.apodo.toLowerCase(), u.mayor18En, u.invitadoPor, u.creado);
    return aUsuario(r!);
  }

  // ── carteras ──
  async carteras(usuarioId: number) { return (await this.todos('SELECT * FROM carteras WHERE usuario_id = ? ORDER BY id', usuarioId)).map(aCartera); }
  async cartera(id: number) { const r = await this.uno('SELECT * FROM carteras WHERE id = ?', id); return r ? aCartera(r) : null; }
  async crearCartera(c: Omit<FilaCartera, 'id'>) {
    const r = await this.uno('INSERT INTO carteras (usuario_id, nombre, principal, liga_id, creada) VALUES (?, ?, ?, ?, ?) RETURNING *', c.usuarioId, c.nombre, c.principal ? 1 : 0, c.ligaId, c.creada);
    return aCartera(r!);
  }
  async actualizarCartera(id: number, cambios: Partial<Pick<FilaCartera, 'nombre' | 'principal'>>) {
    const sets: string[] = [], a: unknown[] = [];
    if (cambios.nombre !== undefined) { sets.push('nombre = ?'); a.push(cambios.nombre); }
    if (cambios.principal !== undefined) { sets.push('principal = ?'); a.push(cambios.principal ? 1 : 0); }
    if (sets.length) await this.ejecutar(`UPDATE carteras SET ${sets.join(', ')} WHERE id = ?`, ...a, id);
  }
  async borrarCartera(id: number) {
    await this.db.batch([this.db.prepare('DELETE FROM versiones WHERE cartera_id = ?').bind(id), this.db.prepare('DELETE FROM carteras WHERE id = ?').bind(id)]);
  }
  async versiones(carteraId: number): Promise<VersionCartera[]> {
    return (await this.todos('SELECT desde, posiciones FROM versiones WHERE cartera_id = ? ORDER BY id', carteraId)).map(r => ({ desde: String(r.desde), posiciones: JSON.parse(String(r.posiciones)) }));
  }
  async anadirVersion(carteraId: number, desde: string, posiciones: Posicion[]) {
    await this.ejecutar('INSERT INTO versiones (cartera_id, desde, posiciones) VALUES (?, ?, ?)', carteraId, desde, JSON.stringify(posiciones.map(p => ({ ticker: p.ticker, decimas: p.decimas }))));
  }

  // ── aprendizaje y constancia ──
  async anadirRevision(usuarioId: number, semana: string, ticker: string) { await this.ejecutar('INSERT OR IGNORE INTO revisiones (usuario_id, semana, ticker) VALUES (?, ?, ?)', usuarioId, semana, ticker); }
  async semanasConRevision(usuarioId: number) { return (await this.todos('SELECT semana FROM revisiones WHERE usuario_id = ? GROUP BY semana ORDER BY MIN(rowid)', usuarioId)).map(r => String(r.semana)); }
  async marcarVisita(usuarioId: number, semana: string) { await this.ejecutar('INSERT OR IGNORE INTO visitas (usuario_id, semana) VALUES (?, ?)', usuarioId, semana); }
  async semanasConVisita(usuarioId: number) { return (await this.todos('SELECT semana FROM visitas WHERE usuario_id = ? ORDER BY rowid', usuarioId)).map(r => String(r.semana)); }

  // ── temporadas y ligas ──
  async temporadas(): Promise<FilaTemporada[]> { return (await this.todos('SELECT * FROM temporadas ORDER BY id')).map(r => ({ id: n(r.id), nombre: String(r.nombre), inicio: String(r.inicio) })); }
  async crearTemporada(t: Omit<FilaTemporada, 'id'>) { const r = await this.uno('INSERT INTO temporadas (nombre, inicio) VALUES (?, ?) RETURNING *', t.nombre, t.inicio); return { id: n(r!.id), nombre: String(r!.nombre), inicio: String(r!.inicio) }; }
  async liga(id: number) { const r = await this.uno('SELECT * FROM ligas WHERE id = ?', id); return r ? aLiga(r) : null; }
  async ligaPorCodigo(codigo: string) { const r = await this.uno("SELECT * FROM ligas WHERE codigo = ? AND tipo <> 'general' ORDER BY id LIMIT 1", codigo); return r ? aLiga(r) : null; }
  async ligaGeneral(temporadaId: number) { const r = await this.uno("SELECT * FROM ligas WHERE tipo = 'general' AND temporada_id = ? ORDER BY id LIMIT 1", temporadaId); return r ? aLiga(r) : null; }
  async crearLiga(l: Omit<FilaLiga, 'id'>) {
    const r = await this.uno('INSERT INTO ligas (codigo, nombre, tipo, estado, reglas, creador_id, temporada_id, creada) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      l.codigo, l.nombre, l.tipo, l.estado, JSON.stringify(l.reglas), l.creadorId, l.temporadaId, l.creada);
    return aLiga(r!);
  }
  async actualizarEstadoLiga(id: number, estado: EstadoLiga) { await this.ejecutar('UPDATE ligas SET estado = ? WHERE id = ?', estado, id); }
  async ligasDeUsuario(usuarioId: number) { return (await this.todos('SELECT l.* FROM ligas l WHERE l.id IN (SELECT liga_id FROM miembros WHERE usuario_id = ?) ORDER BY l.id', usuarioId)).map(aLiga); }
  async miembros(ligaId: number) { return (await this.todos('SELECT * FROM miembros WHERE liga_id = ? ORDER BY rowid', ligaId)).map(aMiembro); }
  async anadirMiembro(m: FilaMiembro) { await this.ejecutar('INSERT INTO miembros (liga_id, usuario_id, cartera_id, unido, orden_draft) VALUES (?, ?, ?, ?, ?)', m.ligaId, m.usuarioId, m.carteraId, m.unido, m.ordenDraft); }
  async quitarMiembro(ligaId: number, usuarioId: number) { await this.ejecutar('DELETE FROM miembros WHERE liga_id = ? AND usuario_id = ?', ligaId, usuarioId); }
  async fijarCarteraMiembro(ligaId: number, usuarioId: number, carteraId: number | null) { await this.ejecutar('UPDATE miembros SET cartera_id = ? WHERE liga_id = ? AND usuario_id = ?', carteraId, ligaId, usuarioId); }
  async fijarOrdenDraft(ligaId: number, usuarioId: number, orden: number) { await this.ejecutar('UPDATE miembros SET orden_draft = ? WHERE liga_id = ? AND usuario_id = ?', orden, ligaId, usuarioId); }

  // ── draft ──
  async picks(ligaId: number) { return (await this.todos('SELECT * FROM picks WHERE liga_id = ? ORDER BY en, rowid', ligaId)).map(aPick); }
  async anadirPick(p: FilaPick) { await this.ejecutar('INSERT INTO picks (liga_id, ronda, usuario_id, ticker, en) VALUES (?, ?, ?, ?, ?)', p.ligaId, p.ronda, p.usuarioId, p.ticker, p.en); }
  async cambiarPick(ligaId: number, usuarioId: number, sale: string, entra: string, semana: string) {
    await this.db.batch([
      this.db.prepare('UPDATE picks SET ticker = ? WHERE liga_id = ? AND usuario_id = ? AND ticker = ?').bind(entra, ligaId, usuarioId, sale),
      this.db.prepare('INSERT INTO cambios_draft (liga_id, usuario_id, semana) VALUES (?, ?, ?)').bind(ligaId, usuarioId, semana),
    ]);
  }
  async cambiosDraftSemana(ligaId: number, usuarioId: number, semana: string) { const r = await this.uno('SELECT COUNT(*) AS c FROM cambios_draft WHERE liga_id = ? AND usuario_id = ? AND semana = ?', ligaId, usuarioId, semana); return n(r?.c ?? 0); }

  // ── invitaciones ──
  async invitacion(codigo: string) { const r = await this.uno('SELECT * FROM invitaciones WHERE codigo = ?', codigo); return r ? aInv(r) : null; }
  async invitacionesDe(creadaPor: number | null) {
    const rs = creadaPor === null ? await this.todos('SELECT * FROM invitaciones ORDER BY rowid') : await this.todos('SELECT * FROM invitaciones WHERE creada_por = ? ORDER BY rowid', creadaPor);
    return rs.map(aInv);
  }
  async crearInvitacion(i: FilaInvitacion) { await this.ejecutar('INSERT INTO invitaciones (codigo, creada_por, usos_max, usos, creada, nota) VALUES (?, ?, ?, ?, ?, ?)', i.codigo, i.creadaPor, i.usosMax, i.usos, i.creada, i.nota); }
  async usarInvitacion(codigo: string) { await this.ejecutar('UPDATE invitaciones SET usos = usos + 1 WHERE codigo = ?', codigo); }

  // ── medición anónima ──
  async sumarEvento(dia: string, nombre: string) { await this.ejecutar('INSERT INTO eventos (dia, nombre, n) VALUES (?, ?, 1) ON CONFLICT (dia, nombre) DO UPDATE SET n = n + 1', dia, nombre); }
}

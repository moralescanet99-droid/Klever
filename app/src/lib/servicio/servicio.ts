// Klever v1 · SERVICIO: toda la lógica de negocio con usuario ya identificado. PURO respecto al entorno:
// corre igual en el navegador (modo demo) y en Cloudflare (functions/). Solo habla con un `Repo`.
import { ErrorApi } from '../api/contrato';
import { analizar, TOTAL } from '../dominio/cartera';
import { empresa } from '../dominio/catalogo';
import {
  apodoValido, clasificar, codigo, codigoValido, estadoDraft, foto, incumplimientos, insignia, lunesDe, medianocheMadrid,
  numeroSemana, puedeElegir, puntosTemporada, retoDeSemana, sumarDias, temporada, turnoDraft, versionEn, RONDAS_DRAFT, type DatosSemana,
} from '../dominio/liga';
import type { Cartera, DetalleLiga, Foto, Invitacion, Liga, Posicion, ReglasLiga, ResumenTemporada, Temporada, TipoLiga, Usuario, VersionCartera } from '../dominio/tipos';
import type { FilaCartera, FilaInvitacion, FilaLiga, Repo } from './repo';

export const MAX_INVITACIONES_USUARIO = 5;
const err = (c: string, m: string, e = 400) => new ErrorApi(c, m, e);

export function validarPosiciones(pos: Posicion[]): Posicion[] {
  if (!Array.isArray(pos)) throw err('posiciones', 'Formato de posiciones no válido.');
  const vistos = new Set<string>(), out: Posicion[] = [];
  for (const p of pos) {
    const t = String(p?.ticker || '').toUpperCase(), d = Number(p?.decimas);
    if (!empresa(t)) throw err('ticker', `No encuentro la empresa «${t}» en el catálogo.`);
    if (!Number.isInteger(d) || d < 0 || d > TOTAL) throw err('peso', 'Cada peso debe estar entre 0 % y 100 %.');
    if (vistos.has(t)) throw err('duplicado', `«${t}» está repetida.`);
    vistos.add(t); if (d > 0) out.push({ ticker: t, decimas: d });
  }
  if (out.length > 30) throw err('max', 'Como mucho 30 posiciones.');
  if (out.reduce((a, p) => a + p.decimas, 0) > TOTAL) throw err('suma', 'Los pesos suman más del 100 %.');
  return out;
}

export class Servicio {
  constructor(private repo: Repo, private ahora: () => Date = () => new Date()) {}
  private iso() { return this.ahora().toISOString(); }
  private lunes() { return lunesDe(this.ahora()); }

  // ── Usuario ──
  async usuario(id: number): Promise<Usuario> {
    const u = await this.repo.usuario(id); if (!u) throw err('sesion', 'Tu sesión ha caducado.', 401);
    const usadas = (await this.repo.invitacionesDe(id)).length;
    return { id: u.id, apodo: u.apodo, esAdmin: false, invitacionesLibres: Math.max(0, MAX_INVITACIONES_USUARIO - usadas) };
  }
  /** Llamar en cada carga de la app: cuenta para Constancia («entrar esa semana»). */
  async visita(usuarioId: number) { await this.repo.marcarVisita(usuarioId, this.lunes()); }
  async validarApodoLibre(apodo: string) {
    if (!apodoValido(apodo)) throw err('apodo', 'El apodo debe tener de 3 a 20 caracteres (letras, números, espacio, punto o guion) y no puede ser un correo.');
    if (await this.repo.usuarioPorApodo(apodo.trim())) throw err('apodo_ocupado', 'Ese apodo ya está cogido.');
  }
  /** Alta de una cuenta nueva (correo ya verificado). `invitacion` null = sin invitación (solo la administración). Consume un uso del código. */
  async darDeAlta(email: string, apodo: string, invitacion: string | null): Promise<Usuario> {
    const correo = String(email || '').trim().toLowerCase();
    if (await this.repo.usuarioPorEmail(correo)) throw err('ya_existe', 'Ya hay una cuenta con ese correo.', 409);
    await this.validarApodoLibre(apodo);
    const cod = invitacion ? String(invitacion).trim().toUpperCase() : null;
    if (cod !== null && !(await this.invitacionValida(cod))) throw err('invitacion', 'Ese código de invitación ya no es válido. Pide otro a quien te invitó.', 403);
    if (cod) await this.repo.usarInvitacion(cod);
    const u = await this.repo.crearUsuario({ email: correo, apodo: apodo.trim(), mayor18En: this.iso(), invitadoPor: cod, creado: this.iso() });
    return this.usuario(u.id);
  }

  // ── Carteras ──
  private async aCartera(f: FilaCartera): Promise<Cartera> {
    const vs = await this.repo.versiones(f.id); const ult = vs.reduce<VersionCartera | null>((a, v) => (!a || v.desde >= a.desde ? v : a), null);
    return { id: f.id, nombre: f.nombre, principal: f.principal, posiciones: ult?.posiciones || [], actualizada: ult?.desde || f.creada, ligaId: f.ligaId };
  }
  private async propia(usuarioId: number, id: number): Promise<FilaCartera> {
    const c = await this.repo.cartera(id); if (!c || c.usuarioId !== usuarioId) throw err('no_existe', 'No encuentro esa cartera.', 404); return c;
  }
  async carteras(usuarioId: number): Promise<Cartera[]> {
    const fs = await this.repo.carteras(usuarioId); const out = await Promise.all(fs.map(f => this.aCartera(f)));
    return out.sort((a, b) => Number(b.principal) - Number(a.principal) || b.actualizada.localeCompare(a.actualizada));
  }
  async crearCartera(usuarioId: number, nombre: string, posiciones: Posicion[]): Promise<Cartera> {
    const pos = validarPosiciones(posiciones), nom = String(nombre || '').trim().slice(0, 40) || 'Mi cartera';
    const ya = await this.repo.carteras(usuarioId);
    if (ya.filter(c => !c.ligaId).length >= 10) throw err('max_carteras', 'Como mucho 10 carteras.');
    const f = await this.repo.crearCartera({ usuarioId, nombre: nom, principal: !ya.some(c => c.principal), ligaId: null, creada: this.iso() });
    await this.repo.anadirVersion(f.id, this.iso(), pos); return this.aCartera(f);
  }
  async guardarCartera(usuarioId: number, id: number, posiciones: Posicion[], nombre?: string): Promise<Cartera> {
    const f = await this.propia(usuarioId, id), pos = validarPosiciones(posiciones);
    if (f.ligaId) { // cartera de draft: solo puede contener las empresas que la persona tiene en esa liga
      const mias = new Set((await this.repo.picks(f.ligaId)).filter(p => p.usuarioId === usuarioId).map(p => p.ticker));
      const ajena = pos.find(p => !mias.has(p.ticker));
      if (ajena) throw err('draft_ajena', `«${ajena.ticker}» no es tuya en esta liga de draft. Usa un cambio de agente libre.`);
    }
    if (nombre !== undefined) await this.repo.actualizarCartera(id, { nombre: String(nombre).trim().slice(0, 40) || f.nombre });
    await this.repo.anadirVersion(id, this.iso(), pos); return this.aCartera((await this.repo.cartera(id))!);
  }
  async borrarCartera(usuarioId: number, id: number) {
    const f = await this.propia(usuarioId, id);
    if (f.ligaId) throw err('draft', 'La cartera de una liga de draft no se puede borrar.');
    for (const l of await this.repo.ligasDeUsuario(usuarioId)) {
      const m = (await this.repo.miembros(l.id)).find(x => x.usuarioId === usuarioId);
      if (m?.carteraId === id && l.estado !== 'terminada') throw err('inscrita', `Está inscrita en la liga «${l.nombre}». Cambia la cartera inscrita antes de borrarla.`);
    }
    await this.repo.borrarCartera(id);
    const resto = await this.repo.carteras(usuarioId);
    if (f.principal && resto.length && !resto.some(c => c.principal)) await this.repo.actualizarCartera(resto[0].id, { principal: true });
  }
  async marcarPrincipal(usuarioId: number, id: number) {
    await this.propia(usuarioId, id);
    for (const c of await this.repo.carteras(usuarioId)) if (c.principal !== (c.id === id)) await this.repo.actualizarCartera(c.id, { principal: c.id === id });
  }
  async historial(usuarioId: number, id: number): Promise<{ versiones: VersionCartera[]; fotos: Foto[] }> {
    const f = await this.propia(usuarioId, id), versiones = (await this.repo.versiones(id)).sort((a, b) => a.desde.localeCompare(b.desde));
    const fotos: Foto[] = []; const hoy = this.lunes();
    for (let s = lunesDe(new Date(f.creada)); s <= hoy; s = sumarDias(s, 7)) {
      const v = versionEn(versiones, medianocheMadrid(s)); if (v) fotos.push(foto(s, v.posiciones));
    }
    return { versiones, fotos: fotos.slice(-12) };
  }
  async revisarEmpresa(usuarioId: number, ticker: string) {
    if (!empresa(ticker)) throw err('ticker', 'Esa empresa no está en el catálogo.');
    await this.repo.anadirRevision(usuarioId, this.lunes(), ticker.toUpperCase());
  }

  // ── Temporadas ──
  async temporadaActual(): Promise<Temporada> {
    const hoy = this.lunes(), ts = (await this.repo.temporadas()).sort((a, b) => a.inicio.localeCompare(b.inicio));
    let t = ts.find(x => hoy >= x.inicio && hoy <= temporada(x.inicio).fin);
    if (!t) t = await this.repo.crearTemporada({ nombre: `Temporada ${ts.length + 1}`, inicio: hoy });
    const tt = temporada(t.inicio); return { id: t.id, nombre: t.nombre, inicio: t.inicio, semanas: tt.semanas, fin: tt.fin };
  }
  private async temporadaDe(l: FilaLiga): Promise<Temporada> {
    const t = (await this.repo.temporadas()).find(x => x.id === l.temporadaId)!; const tt = temporada(t.inicio);
    return { id: t.id, nombre: t.nombre, inicio: t.inicio, semanas: tt.semanas, fin: tt.fin };
  }

  // ── Ligas ──
  private async aLiga(l: FilaLiga): Promise<Liga> {
    return { id: l.id, codigo: l.codigo, nombre: l.nombre, tipo: l.tipo, estado: l.estado, reglas: l.reglas, creadorId: l.creadorId, miembros: (await this.repo.miembros(l.id)).length, temporada: await this.temporadaDe(l) };
  }
  async misLigas(usuarioId: number): Promise<Liga[]> { return Promise.all((await this.repo.ligasDeUsuario(usuarioId)).map(l => this.aLiga(l))); }
  private async principal(usuarioId: number) { const cs = await this.repo.carteras(usuarioId); return cs.find(c => c.principal && !c.ligaId) || cs.find(c => !c.ligaId) || null; }
  async crearLiga(usuarioId: number, nombre: string, tipo: Exclude<TipoLiga, 'general'>, reglas: ReglasLiga): Promise<Liga> {
    const nom = String(nombre || '').trim(); if (nom.length < 3 || nom.length > 40) throw err('nombre', 'El nombre de la liga debe tener de 3 a 40 caracteres.');
    if (tipo !== 'clasica' && tipo !== 'draft') throw err('tipo', 'Tipo de liga no válido.');
    const r = normalizarReglas(reglas), t = await this.temporadaActual();
    let cod = codigo(); while (await this.repo.ligaPorCodigo(cod)) cod = codigo();
    const l = await this.repo.crearLiga({ codigo: cod, nombre: nom, tipo, estado: tipo === 'draft' ? 'abierta' : 'en_juego', reglas: r, creadorId: usuarioId, temporadaId: t.id, creada: this.iso() });
    await this.repo.anadirMiembro({ ligaId: l.id, usuarioId, carteraId: tipo === 'clasica' ? (await this.principal(usuarioId))?.id ?? null : null, unido: this.iso(), ordenDraft: null });
    return this.aLiga(l);
  }
  async unirseLiga(usuarioId: number, cod: string): Promise<Liga> {
    const c = String(cod || '').trim().toUpperCase(); if (!codigoValido(c)) throw err('codigo', 'El código tiene 6 caracteres (letras y números).');
    const l = await this.repo.ligaPorCodigo(c); if (!l || l.tipo === 'general') throw err('no_existe', 'No hay ninguna liga con ese código.', 404);
    const ms = await this.repo.miembros(l.id);
    if (ms.some(m => m.usuarioId === usuarioId)) return this.aLiga(l);
    if (ms.length >= 30) throw err('llena', 'Esta liga ya tiene 30 personas.');
    if (l.tipo === 'draft' && l.estado !== 'abierta') throw err('draft_empezado', 'El draft de esta liga ya ha empezado.');
    await this.repo.anadirMiembro({ ligaId: l.id, usuarioId, carteraId: l.tipo === 'clasica' ? (await this.principal(usuarioId))?.id ?? null : null, unido: this.iso(), ordenDraft: null });
    return this.aLiga(l);
  }
  async unirseGeneral(usuarioId: number): Promise<Liga> {
    const t = await this.temporadaActual(); let l = await this.repo.ligaGeneral(t.id);
    if (!l) l = await this.repo.crearLiga({ codigo: 'GENRAL', nombre: 'Clasificación general', tipo: 'general', estado: 'en_juego', reglas: normalizarReglas({}), creadorId: 0, temporadaId: t.id, creada: this.iso() });
    if (!(await this.repo.miembros(l.id)).some(m => m.usuarioId === usuarioId))
      await this.repo.anadirMiembro({ ligaId: l.id, usuarioId, carteraId: (await this.principal(usuarioId))?.id ?? null, unido: this.iso(), ordenDraft: null });
    return this.aLiga(l);
  }
  async salirLiga(usuarioId: number, id: number) {
    const l = await this.repo.liga(id); if (!l) throw err('no_existe', 'No encuentro esa liga.', 404);
    if (l.tipo === 'draft' && l.estado === 'draft') throw err('draft', 'No puedes salir en mitad del draft.');
    await this.repo.quitarMiembro(id, usuarioId);
  }
  private async miembroDe(usuarioId: number, id: number) {
    const l = await this.repo.liga(id); if (!l) throw err('no_existe', 'No encuentro esa liga.', 404);
    const ms = await this.repo.miembros(id), m = ms.find(x => x.usuarioId === usuarioId);
    if (!m) throw err('no_miembro', 'No estás en esta liga.', 403); return { l, ms, m };
  }
  async inscribirCartera(usuarioId: number, ligaId: number, carteraId: number) {
    const { l } = await this.miembroDe(usuarioId, ligaId);
    if (l.tipo === 'draft') throw err('draft', 'En una liga de draft juegas con la cartera del draft.');
    const c = await this.propia(usuarioId, carteraId); if (c.ligaId) throw err('draft', 'Esa cartera pertenece a otra liga de draft.');
    const t = await this.temporadaDe(l), n = numeroSemana(t.inicio, this.lunes());
    const m = (await this.repo.miembros(ligaId)).find(x => x.usuarioId === usuarioId)!;
    if (m.carteraId && n > 2) throw err('cerrado', 'La cartera solo se puede cambiar en las 2 primeras semanas de la temporada.');
    await this.repo.fijarCarteraMiembro(ligaId, usuarioId, carteraId);
  }

  /** Datos semana a semana de una persona en una liga (lo usa la clasificación y el detalle). */
  private async semanasDe(l: FilaLiga, t: Temporada, usuarioId: number, carteraId: number | null): Promise<DatosSemana[]> {
    const vs = carteraId ? await this.repo.versiones(carteraId) : [], rev = new Set(await this.repo.semanasConRevision(usuarioId)), vis = new Set(await this.repo.semanasConVisita(usuarioId));
    const out: DatosSemana[] = [];
    for (let i = 0; i < t.semanas.length; i++) {
      const s = t.semanas[i], ini = medianocheMadrid(s), v = versionEn(vs, ini), f = v ? foto(s, v.posiciones) : null;
      const cambios = vs.filter(x => x.desde >= medianocheMadrid(sumarDias(s, -7)) && x.desde < ini).length;
      out.push({ semana: s, foto: f, incumple: f ? incumplimientos(f.posiciones, l.reglas, cambios) : [], retoHecho: !!f && retoDeSemana(i + 1, f.posiciones).hecho, reviso: rev.has(s), entro: vis.has(s) });
    }
    return out;
  }
  async detalleLiga(usuarioId: number, id: number): Promise<DetalleLiga> {
    const { l, ms, m } = await this.miembroDe(usuarioId, id), t = await this.temporadaDe(l), hoy = this.lunes(), n = numeroSemana(t.inicio, hoy);
    const filas = [] as { usuarioId: number; apodo: string; total: number; semanasBajas: number; tu: boolean }[]; let mias = null as ReturnType<typeof puntosTemporada> | null;
    for (const x of ms) {
      const u = await this.repo.usuario(x.usuarioId); if (!u) continue;
      const p = puntosTemporada(await this.semanasDe(l, t, x.usuarioId, x.carteraId), hoy);
      if (x.usuarioId === usuarioId) mias = p;
      filas.push({ usuarioId: x.usuarioId, apodo: u.apodo, total: p.total, semanasBajas: p.semanasBajas, tu: x.usuarioId === usuarioId });
    }
    const cart = m.carteraId ? await this.repo.cartera(m.carteraId) : null, carteraInscrita = cart ? await this.aCartera(cart) : null;
    let draft = null;
    if (l.tipo === 'draft') {
      const orden = await Promise.all(ms.filter(x => x.ordenDraft != null).sort((a, b) => a.ordenDraft! - b.ordenDraft!).map(async x => ({ usuarioId: x.usuarioId, apodo: (await this.repo.usuario(x.usuarioId))?.apodo || '—' })));
      const picks = (await this.repo.picks(id)).map(p => ({ ronda: p.ronda, usuarioId: p.usuarioId, ticker: p.ticker }));
      draft = estadoDraft(orden, picks, (await this.repo.cambiosDraftSemana(id, usuarioId, hoy)) > 0);
    }
    return {
      liga: await this.aLiga(l), clasificacion: clasificar(filas), mias: mias?.detalle || [], semanaActual: n, carteraInscrita,
      puedeCambiarCartera: l.tipo !== 'draft' && n <= 2, reto: retoDeSemana(Math.max(1, Math.min(12, n)), carteraInscrita?.posiciones || null), draft,
    };
  }
  async resumen(usuarioId: number, id: number): Promise<ResumenTemporada> {
    const d = await this.detalleLiga(usuarioId, id), yo = d.clasificacion.find(f => f.tu)!;
    const { l, m } = await this.miembroDe(usuarioId, id), t = await this.temporadaDe(l);
    const sem = await this.semanasDe(l, t, usuarioId, m.carteraId), p = puntosTemporada(sem, this.lunes());
    return {
      temporada: d.liga.temporada, ligaNombre: d.liga.nombre, total: yo.total, puesto: yo.puesto, participantes: d.clasificacion.length,
      semanasBajas: yo.semanasBajas, mejorRacha: p.mejorRacha, retosHechos: sem.filter(s => s.semana <= this.lunes() && s.retoHecho).length,
      sectoresMax: Math.max(0, ...sem.map(s => (s.foto ? analizar(s.foto.posiciones).sectores.length : 0))),
      insignia: d.semanaActual >= 13 ? insignia(yo.puesto, d.clasificacion.length) : null, semanas: p.detalle,
    };
  }

  // ── Draft ──
  async empezarDraft(usuarioId: number, id: number, aleatorio = Math.random) {
    const { l, ms } = await this.miembroDe(usuarioId, id);
    if (l.tipo !== 'draft') throw err('tipo', 'Esta liga no es de draft.');
    if (l.creadorId !== usuarioId) throw err('creador', 'Solo quien creó la liga puede empezar el draft.', 403);
    if (l.estado !== 'abierta') throw err('estado', 'El draft ya ha empezado.');
    if (ms.length < 2) throw err('pocos', 'Hacen falta al menos 2 personas para el draft.');
    const orden = [...ms].map(x => ({ x, r: aleatorio() })).sort((a, b) => a.r - b.r).map(o => o.x);
    for (let i = 0; i < orden.length; i++) await this.repo.fijarOrdenDraft(id, orden[i].usuarioId, i);
    await this.repo.actualizarEstadoLiga(id, 'draft');
  }
  async elegirDraft(usuarioId: number, id: number, ticker: string) {
    const { l, ms } = await this.miembroDe(usuarioId, id); if (l.estado !== 'draft') throw err('estado', 'El draft no está en marcha.');
    const orden = ms.filter(x => x.ordenDraft != null).sort((a, b) => a.ordenDraft! - b.ordenDraft!);
    const picks = await this.repo.picks(id), est = estadoDraft(orden.map(o => ({ usuarioId: o.usuarioId, apodo: '' })), picks.map(p => ({ ronda: p.ronda, usuarioId: p.usuarioId, ticker: p.ticker })));
    const t = String(ticker || '').toUpperCase(), e = puedeElegir(est, usuarioId, t); if (e) throw err('draft', e);
    await this.repo.anadirPick({ ligaId: id, ronda: est.ronda, usuarioId, ticker: t, en: this.iso() });
    if (!turnoDraft(orden.map(o => o.usuarioId), picks.length + 1)) { // terminó: cada persona recibe su cartera de draft a partes iguales
      const todos = [...picks, { usuarioId, ticker: t }];
      for (const o of orden) {
        const mias = todos.filter(p => p.usuarioId === o.usuarioId).map(p => p.ticker);
        const c = await this.repo.crearCartera({ usuarioId: o.usuarioId, nombre: `Draft · ${l.nombre}`.slice(0, 40), principal: false, ligaId: id, creada: this.iso() });
        const base = Math.floor(TOTAL / mias.length), resto = TOTAL - base * mias.length;
        await this.repo.anadirVersion(c.id, this.iso(), mias.map((x, i) => ({ ticker: x, decimas: base + (i < resto ? 1 : 0) })));
        await this.repo.fijarCarteraMiembro(id, o.usuarioId, c.id);
      }
      await this.repo.actualizarEstadoLiga(id, 'en_juego');
    }
  }
  async cambioDraft(usuarioId: number, id: number, sale: string, entra: string) {
    const { l, m } = await this.miembroDe(usuarioId, id);
    if (l.tipo !== 'draft' || l.estado !== 'en_juego') throw err('estado', 'Los cambios de agente libre se hacen cuando el draft ha terminado.');
    const s = String(sale).toUpperCase(), e = String(entra).toUpperCase(), picks = await this.repo.picks(id);
    if (!picks.some(p => p.usuarioId === usuarioId && p.ticker === s)) throw err('sale', `«${s}» no es tuya en esta liga.`);
    if (!empresa(e)) throw err('entra', 'Esa empresa no está en el catálogo.');
    if (picks.some(p => p.ticker === e)) throw err('ocupada', `«${e}» ya la tiene otra persona de la liga.`);
    if ((await this.repo.cambiosDraftSemana(id, usuarioId, this.lunes())) > 0) throw err('semana', 'Ya has hecho tu cambio de agente libre esta semana.');
    await this.repo.cambiarPick(id, usuarioId, s, e, this.lunes());
    if (m.carteraId) { // la nueva entra con el peso de la que sale
      const c = await this.aCartera((await this.repo.cartera(m.carteraId))!);
      await this.repo.anadirVersion(m.carteraId, this.iso(), c.posiciones.map(p => (p.ticker === s ? { ticker: e, decimas: p.decimas } : p)));
    }
  }

  // ── Invitaciones ──
  private aInv(i: FilaInvitacion): Invitacion { return { codigo: i.codigo, usos: i.usos, usosMax: i.usosMax, creada: i.creada, nota: i.nota }; }
  async misInvitaciones(usuarioId: number) { return (await this.repo.invitacionesDe(usuarioId)).map(i => this.aInv(i)); }
  /** `sinLimite`: la administración puede crear más de MAX_INVITACIONES_USUARIO a su nombre. */
  async crearInvitacion(usuarioId: number | null, nota = '', usosMax = 1, sinLimite = false): Promise<Invitacion> {
    if (usuarioId !== null && !sinLimite && (await this.repo.invitacionesDe(usuarioId)).length >= MAX_INVITACIONES_USUARIO) throw err('max_invitaciones', `Puedes crear hasta ${MAX_INVITACIONES_USUARIO} invitaciones.`);
    let c = codigo(8); while (await this.repo.invitacion(c)) c = codigo(8);
    const i: FilaInvitacion = { codigo: c, creadaPor: usuarioId, usosMax: Math.max(1, Math.min(500, Math.floor(usosMax))), usos: 0, creada: this.iso(), nota: String(nota).slice(0, 60) };
    await this.repo.crearInvitacion(i); return this.aInv(i);
  }
  async todasInvitaciones() { return (await this.repo.invitacionesDe(null)).map(i => this.aInv(i)); }
  /** ¿Sirve este código para darse de alta? */
  async invitacionValida(c: string) { const i = await this.repo.invitacion(String(c || '').trim().toUpperCase()); return !!i && i.usos < i.usosMax; }

  async evento(nombre: string) { if (/^[a-z0-9_.-]{2,40}$/.test(nombre)) await this.repo.sumarEvento(this.ahora().toISOString().slice(0, 10), nombre); }
}

export function normalizarReglas(r: Partial<ReglasLiga>): ReglasLiga {
  const num = (x: unknown, min: number, max: number) => (x === null || x === undefined || x === '' ? null : Math.max(min, Math.min(max, Math.round(Number(x)))));
  return { maxPorEmpresa: num(r?.maxPorEmpresa, 10, 100), minSectores: num(r?.minSectores, 1, 8), maxCambiosSemana: num(r?.maxCambiosSemana, 0, 20), maxPorPais: num(r?.maxPorPais, 20, 100) };
}

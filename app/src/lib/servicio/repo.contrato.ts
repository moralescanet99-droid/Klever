// Klever v1 · BATERÍA DE CONTRATO del `Repo`: la pasan el repo en memoria (memoria.test.ts) y el de D1 sobre SQLite
// (functions/_lib/repo-d1.test.ts). Si un repo se comporta distinto que el otro, alguna de las dos falla.
// Además de cada método, corre el servicio completo (semilla + draft) sobre el repo para comparar resultados de punta a punta.
import { describe, expect, it } from 'vitest';
import type { Repo } from './repo';
import { Servicio, normalizarReglas } from './servicio';
import { lunesDe } from '../dominio/liga';

const T0 = '2026-11-09T10:00:00.000Z';
const usuarioBase = (email: string, apodo: string) => ({ email, apodo, mayor18En: T0, invitadoPor: 'ABCD2345', creado: T0 });
const reglas = normalizarReglas({ maxPorEmpresa: 30 });

export function bateriaRepo(nombre: string, crear: () => Promise<Repo> | Repo) {
  describe(`contrato del Repo · ${nombre}`, () => {
    it('usuarios: crear, buscar por id, correo (sin mayúsculas) y apodo (sin distinguir mayúsculas)', async () => {
      const r = await crear();
      const u = await r.crearUsuario(usuarioBase('Ana@Ejemplo.invalid', 'Ana_B'));
      expect(u.id).toBeGreaterThan(0); expect(u.email).toBe('ana@ejemplo.invalid');
      expect(await r.usuario(u.id)).toEqual(u);
      expect(await r.usuarioPorEmail('ANA@ejemplo.invalid')).toEqual(u);
      expect(await r.usuarioPorApodo('ana_b')).toEqual(u);
      expect(await r.usuarioPorApodo('nadie')).toBeNull();
      expect(await r.usuario(9999)).toBeNull();
      const v = await r.crearUsuario({ ...usuarioBase('b@ejemplo.invalid', 'Bea'), invitadoPor: null });
      expect(v.id).not.toBe(u.id); expect(v.invitadoPor).toBeNull();
    });

    it('carteras: crear, listar en orden, actualizar, versiones en orden y borrar', async () => {
      const r = await crear(); const u = await r.crearUsuario(usuarioBase('c@ejemplo.invalid', 'Carla'));
      const a = await r.crearCartera({ usuarioId: u.id, nombre: 'A', principal: true, ligaId: null, creada: T0 });
      const b = await r.crearCartera({ usuarioId: u.id, nombre: 'B', principal: false, ligaId: 77, creada: T0 });
      expect(a).toEqual({ id: a.id, usuarioId: u.id, nombre: 'A', principal: true, ligaId: null, creada: T0 });
      expect((await r.carteras(u.id)).map(c => c.nombre)).toEqual(['A', 'B']);
      expect((await r.cartera(b.id))!.ligaId).toBe(77);
      await r.actualizarCartera(a.id, { nombre: 'A2' }); await r.actualizarCartera(a.id, { principal: false }); await r.actualizarCartera(b.id, {});
      expect(await r.cartera(a.id)).toMatchObject({ nombre: 'A2', principal: false });
      await r.anadirVersion(a.id, '2026-11-02T10:00:00.000Z', [{ ticker: 'NUBE', decimas: 600 }, { ticker: 'VITA', decimas: 400 }]);
      await r.anadirVersion(a.id, '2026-11-01T10:00:00.000Z', [{ ticker: 'NUBE', decimas: 1000 }]);
      const vs = await r.versiones(a.id);
      expect(vs).toEqual([{ desde: '2026-11-02T10:00:00.000Z', posiciones: [{ ticker: 'NUBE', decimas: 600 }, { ticker: 'VITA', decimas: 400 }] }, { desde: '2026-11-01T10:00:00.000Z', posiciones: [{ ticker: 'NUBE', decimas: 1000 }] }]);
      vs[0].posiciones[0].decimas = 1; expect((await r.versiones(a.id))[0].posiciones[0].decimas).toBe(600); // devuelve copias
      await r.borrarCartera(a.id);
      expect(await r.cartera(a.id)).toBeNull(); expect(await r.versiones(a.id)).toEqual([]);
      expect((await r.carteras(u.id)).map(c => c.id)).toEqual([b.id]);
      expect(await r.carteras(9999)).toEqual([]);
    });

    it('revisiones y visitas: sin duplicados y en orden de llegada', async () => {
      const r = await crear();
      await r.anadirRevision(1, '2026-11-02', 'NUBE'); await r.anadirRevision(1, '2026-11-02', 'NUBE'); await r.anadirRevision(1, '2026-11-02', 'VITA');
      await r.anadirRevision(1, '2026-10-26', 'NUBE'); await r.anadirRevision(2, '2026-11-09', 'NUBE');
      expect(await r.semanasConRevision(1)).toEqual(['2026-11-02', '2026-10-26']);
      await r.marcarVisita(1, '2026-11-09'); await r.marcarVisita(1, '2026-11-02'); await r.marcarVisita(1, '2026-11-09');
      expect(await r.semanasConVisita(1)).toEqual(['2026-11-09', '2026-11-02']); expect(await r.semanasConVisita(3)).toEqual([]);
    });

    it('temporadas y ligas: códigos, general por temporada, estado y miembros', async () => {
      const r = await crear();
      const t = await r.crearTemporada({ nombre: 'Temporada 1', inicio: '2026-11-02' });
      expect(await r.temporadas()).toEqual([t]);
      const l = await r.crearLiga({ codigo: 'ABC234', nombre: 'Facultad', tipo: 'clasica', estado: 'en_juego', reglas, creadorId: 5, temporadaId: t.id, creada: T0 });
      expect(l.reglas).toEqual(reglas);
      const g = await r.crearLiga({ codigo: 'GENRAL', nombre: 'Clasificación general', tipo: 'general', estado: 'en_juego', reglas, creadorId: 0, temporadaId: t.id, creada: T0 });
      expect(await r.liga(l.id)).toEqual(l);
      expect(await r.ligaPorCodigo('ABC234')).toEqual(l); expect(await r.ligaPorCodigo('GENRAL')).toBeNull(); expect(await r.ligaPorCodigo('ZZZZZZ')).toBeNull();
      expect(await r.ligaGeneral(t.id)).toEqual(g); expect(await r.ligaGeneral(t.id + 100)).toBeNull();
      await r.actualizarEstadoLiga(l.id, 'terminada'); expect((await r.liga(l.id))!.estado).toBe('terminada');
      await r.anadirMiembro({ ligaId: l.id, usuarioId: 5, carteraId: null, unido: T0, ordenDraft: null });
      await r.anadirMiembro({ ligaId: l.id, usuarioId: 6, carteraId: 3, unido: T0, ordenDraft: null });
      await r.anadirMiembro({ ligaId: g.id, usuarioId: 6, carteraId: 3, unido: T0, ordenDraft: null });
      expect((await r.miembros(l.id)).map(m => m.usuarioId)).toEqual([5, 6]);
      expect((await r.ligasDeUsuario(6)).map(x => x.id)).toEqual([l.id, g.id]); expect(await r.ligasDeUsuario(99)).toEqual([]);
      await r.fijarCarteraMiembro(l.id, 5, 8); await r.fijarOrdenDraft(l.id, 5, 1); await r.fijarCarteraMiembro(l.id, 6, null);
      expect(await r.miembros(l.id)).toEqual([{ ligaId: l.id, usuarioId: 5, carteraId: 8, unido: T0, ordenDraft: 1 }, { ligaId: l.id, usuarioId: 6, carteraId: null, unido: T0, ordenDraft: null }]);
      await r.quitarMiembro(l.id, 5); expect((await r.miembros(l.id)).map(m => m.usuarioId)).toEqual([6]);
      await r.anadirMiembro({ ligaId: l.id, usuarioId: 5, carteraId: null, unido: T0, ordenDraft: null });
      expect((await r.miembros(l.id)).map(m => m.usuarioId)).toEqual([6, 5]); // vuelve al final
    });

    it('draft: picks exclusivos, orden por instante, cambios por semana', async () => {
      const r = await crear();
      await r.anadirPick({ ligaId: 1, ronda: 1, usuarioId: 5, ticker: 'NUBE', en: '2026-11-09T10:00:02.000Z' });
      await r.anadirPick({ ligaId: 1, ronda: 1, usuarioId: 6, ticker: 'VITA', en: '2026-11-09T10:00:01.000Z' });
      await r.anadirPick({ ligaId: 1, ronda: 2, usuarioId: 6, ticker: 'SOLR', en: '2026-11-09T10:00:01.000Z' });
      await r.anadirPick({ ligaId: 2, ronda: 1, usuarioId: 5, ticker: 'NUBE', en: T0 }); // otra liga: se puede repetir
      await expect(r.anadirPick({ ligaId: 1, ronda: 2, usuarioId: 5, ticker: 'NUBE', en: T0 })).rejects.toThrow();
      expect((await r.picks(1)).map(p => p.ticker)).toEqual(['VITA', 'SOLR', 'NUBE']);
      expect(await r.cambiosDraftSemana(1, 5, '2026-11-09')).toBe(0);
      await r.cambiarPick(1, 5, 'NUBE', 'FARO', '2026-11-09');
      expect((await r.picks(1)).find(p => p.usuarioId === 5)).toMatchObject({ ticker: 'FARO', ronda: 1 });
      expect(await r.cambiosDraftSemana(1, 5, '2026-11-09')).toBe(1); expect(await r.cambiosDraftSemana(1, 5, '2026-11-02')).toBe(0); expect(await r.cambiosDraftSemana(1, 6, '2026-11-09')).toBe(0);
    });

    it('invitaciones: crear, listar por creador o todas, usar', async () => {
      const r = await crear();
      await r.crearInvitacion({ codigo: 'AAAA2222', creadaPor: 5, usosMax: 1, usos: 0, creada: T0, nota: 'Para Lucía' });
      await r.crearInvitacion({ codigo: 'BBBB3333', creadaPor: null, usosMax: 20, usos: 0, creada: T0, nota: '' });
      expect(await r.invitacion('AAAA2222')).toEqual({ codigo: 'AAAA2222', creadaPor: 5, usosMax: 1, usos: 0, creada: T0, nota: 'Para Lucía' });
      expect(await r.invitacion('NOEXISTE')).toBeNull();
      expect((await r.invitacionesDe(5)).map(i => i.codigo)).toEqual(['AAAA2222']);
      expect((await r.invitacionesDe(null)).map(i => i.codigo)).toEqual(['AAAA2222', 'BBBB3333']);
      await r.usarInvitacion('BBBB3333'); await r.usarInvitacion('BBBB3333'); await r.usarInvitacion('NOEXISTE');
      expect((await r.invitacion('BBBB3333'))!.usos).toBe(2);
    });

    it('eventos: suma sin fallar', async () => {
      const r = await crear(); await r.sumarEvento('2026-11-09', 'abrir'); await r.sumarEvento('2026-11-09', 'abrir');
    });

    it('servicio de punta a punta: alta, carteras, liga clásica, draft completo y agente libre', async () => {
      const r = await crear(), ahora = new Date('2026-11-11T10:00:00Z'); let paso = 0;
      const srv = new Servicio(r, () => new Date(ahora.getTime() + 1000 * paso++));
      await srv.crearInvitacion(null, 'arranque', 3);
      const cod = (await srv.todasInvitaciones())[0].codigo;
      const a = await srv.darDeAlta('ana@ejemplo.invalid', 'Ana', cod), b = await srv.darDeAlta('bea@ejemplo.invalid', 'Bea', cod);
      await expect(srv.darDeAlta('otra@ejemplo.invalid', 'ana', cod)).rejects.toMatchObject({ codigo: 'apodo_ocupado' });
      expect((await srv.todasInvitaciones())[0].usos).toBe(2);
      const ca = await srv.crearCartera(a.id, 'Mía', [{ ticker: 'NUBE', decimas: 500 }, { ticker: 'VITA', decimas: 500 }]);
      expect(ca.principal).toBe(true);
      await srv.crearCartera(b.id, 'De Bea', [{ ticker: 'SOLR', decimas: 1000 }]);
      const l = await srv.crearLiga(a.id, 'Liga de prueba', 'clasica', reglas);
      await srv.unirseLiga(b.id, l.codigo);
      const d = await srv.detalleLiga(a.id, l.id);
      expect(d.clasificacion.map(f => f.apodo).sort()).toEqual(['Ana', 'Bea']); expect(d.carteraInscrita!.id).toBe(ca.id);
      await srv.guardarCartera(a.id, ca.id, [{ ticker: 'NUBE', decimas: 1000 }], 'Renombrada');
      expect((await srv.carteras(a.id))[0]).toMatchObject({ nombre: 'Renombrada', posiciones: [{ ticker: 'NUBE', decimas: 1000 }] });
      expect((await srv.historial(a.id, ca.id)).versiones.length).toBe(2);
      // draft de 2 personas
      const dl = await srv.crearLiga(a.id, 'Draft', 'draft', reglas); await srv.unirseLiga(b.id, dl.codigo);
      await srv.empezarDraft(a.id, dl.id, () => 0.5);
      for (let k = 0; k < 12; k++) { const x = await srv.detalleLiga(a.id, dl.id); await srv.elegirDraft(x.draft!.turnoDe!, dl.id, x.draft!.libres[0]); }
      const fin = await srv.detalleLiga(a.id, dl.id);
      expect(fin.liga.estado).toBe('en_juego'); expect(fin.carteraInscrita!.posiciones.length).toBe(6); expect(fin.draft!.picks.length).toBe(12);
      const mia = fin.draft!.picks.find(p => p.usuarioId === a.id)!.ticker, libre = fin.draft!.libres[0];
      await srv.cambioDraft(a.id, dl.id, mia, libre);
      await expect(srv.cambioDraft(a.id, dl.id, libre, fin.draft!.libres[1])).rejects.toMatchObject({ codigo: 'semana' });
      expect((await srv.detalleLiga(a.id, dl.id)).carteraInscrita!.posiciones.some(p => p.ticker === libre)).toBe(true);
      // general, revisión, visita y resumen
      await srv.unirseGeneral(a.id); await srv.unirseGeneral(a.id); await srv.revisarEmpresa(a.id, 'nube'); await srv.visita(a.id);
      expect((await srv.misLigas(a.id)).length).toBe(3);
      const res = await srv.resumen(a.id, l.id); expect(res.participantes).toBe(2);
      expect(await r.semanasConVisita(a.id)).toEqual([lunesDe(ahora)]);
      await srv.salirLiga(b.id, l.id); expect((await srv.detalleLiga(a.id, l.id)).clasificacion.length).toBe(1);
      await expect(srv.borrarCartera(a.id, ca.id)).rejects.toMatchObject({ codigo: 'inscrita' });
    });
  });
}

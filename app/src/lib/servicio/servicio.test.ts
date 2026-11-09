import { describe, expect, it } from 'vitest';
import { RepoMemoria } from './memoria';
import { sembrar } from './semilla';
import { Servicio } from './servicio';
import { analizar, fijarPeso, parsearLista, pista } from '../dominio/cartera';
import { turnoDraft, lunesDe, medianocheMadrid } from '../dominio/liga';

describe('dominio', () => {
  it('fijarPeso mantiene el 100 %', () => {
    const p = fijarPeso([{ ticker: 'NUBE', decimas: 460 }, { ticker: 'VITA', decimas: 220 }, { ticker: 'SOLR', decimas: 320 }], 'NUBE', 240);
    expect(p.reduce((a, x) => a + x.decimas, 0)).toBe(1000); expect(p.find(x => x.ticker === 'NUBE')!.decimas).toBe(240);
  });
  it('analiza concentración y variedad', () => {
    const a = analizar(parsearLista('NUBE 28, VITA 18, SOLR 16, FARO 14, HOGR 12, FERR 12').posiciones);
    expect(a.concentracion).toBe('medio'); expect(a.variedad).toBe('ok'); expect(a.completa).toBe(true);
    expect(pista(a.sectores.length ? parsearLista('NUBE 28, VITA 18, SOLR 16, FARO 14, HOGR 12, FERR 12').posiciones : [])!.decimas).toBe(240);
  });
  it('draft en serpiente', () => {
    expect([0, 1, 2, 3, 4, 5].map(k => turnoDraft([7, 8, 9], k)!.usuarioId)).toEqual([7, 8, 9, 9, 8, 7]);
  });
  it('lunes y medianoche de Madrid', () => {
    expect(lunesDe(new Date('2026-11-12T10:00:00Z'))).toBe('2026-11-09');
    expect(medianocheMadrid('2026-11-09')).toBe('2026-11-08T23:00:00.000Z');
    expect(medianocheMadrid('2026-07-06')).toBe('2026-07-05T22:00:00.000Z');
  });
});

describe('servicio con la semilla', () => {
  it('detalle de la liga privada y del draft', async () => {
    const repo = new RepoMemoria(), srv = new Servicio(repo), { usuarioId } = await sembrar(repo);
    const ligas = await srv.misLigas(usuarioId); expect(ligas.length).toBe(2);
    const d = await srv.detalleLiga(usuarioId, ligas.find(l => l.tipo === 'clasica')!.id);
    expect(d.semanaActual).toBe(3); expect(d.clasificacion.length).toBe(8); expect(d.mias.length).toBe(3);
    const dd = await srv.detalleLiga(usuarioId, ligas.find(l => l.tipo === 'draft')!.id);
    expect(dd.draft!.picks.length).toBe(24); expect(dd.draft!.turnoDe).toBeNull();
    const h = await srv.historial(usuarioId, (await srv.carteras(usuarioId))[0].id); expect(h.fotos.length).toBeGreaterThanOrEqual(4);
  });
  it('draft completo de 2 personas crea sus carteras', async () => {
    const repo = new RepoMemoria(), srv = new Servicio(repo), { usuarioId } = await sembrar(repo);
    const l = await srv.crearLiga(usuarioId, 'Prueba draft', 'draft', { maxPorEmpresa: null, minSectores: null, maxCambiosSemana: null, maxPorPais: null });
    const otro = repo.usuarios.find(u => u.apodo === 'cero_prisa')!.id; await srv.unirseLiga(otro, l.codigo);
    await srv.empezarDraft(usuarioId, l.id, () => 0.5);
    for (let k = 0; k < 12; k++) { const d = await srv.detalleLiga(usuarioId, l.id); await srv.elegirDraft(d.draft!.turnoDe!, l.id, d.draft!.libres[0]); }
    const fin = await srv.detalleLiga(usuarioId, l.id); expect(fin.liga.estado).toBe('en_juego'); expect(fin.carteraInscrita!.posiciones.length).toBe(6);
  });
});

// Klever v1 · SEMILLA DE EJEMPLO para el modo demo (y para sembrar una base local de pruebas).
// Usuarios, apodos y carteras INVENTADOS. Temporada empezada hace 2 semanas (estamos en la semana 3 de 12).
import { lunesDe, medianocheMadrid, sumarDias } from '../dominio/liga';
import type { Posicion } from '../dominio/tipos';
import { RepoMemoria } from './memoria';
import { normalizarReglas } from './servicio';

const P = (s: string): Posicion[] => s.split(' ').map(t => { const [k, v] = t.split(':'); return { ticker: k, decimas: Number(v) * 10 }; });

export async function sembrar(repo: RepoMemoria, ahora = new Date()): Promise<{ usuarioId: number }> {
  const hoy = lunesDe(ahora), inicio = sumarDias(hoy, -14), antes = (dias: number) => new Date(Date.parse(medianocheMadrid(sumarDias(hoy, -dias))) + 10 * 36e5).toISOString(); // a las 10:00 de ese día
  const t = await repo.crearTemporada({ nombre: 'Temporada 1', inicio });
  const yo = await repo.crearUsuario({ email: 'demo@klever.invalid', apodo: 'marea_baja', mayor18En: antes(40), invitadoPor: 'DEMO', creado: antes(40) });

  // Mi cartera principal, con historia: hace 4 semanas NUBE pesaba el 46 % (el «fantasma»).
  const c = await repo.crearCartera({ usuarioId: yo.id, nombre: 'Mi cartera', principal: true, ligaId: null, creada: antes(34) });
  await repo.anadirVersion(c.id, antes(33), P('NUBE:46 VITA:22 SOLR:18 FARO:14'));
  await repo.anadirVersion(c.id, antes(19), P('NUBE:38 VITA:20 SOLR:16 FARO:14 HOGR:12'));
  await repo.anadirVersion(c.id, antes(12), P('NUBE:30 VITA:18 SOLR:16 FARO:14 HOGR:12 FERR:10'));
  await repo.anadirVersion(c.id, antes(5), P('NUBE:28 VITA:18 SOLR:16 FARO:14 HOGR:12 FERR:12'));
  const c2 = await repo.crearCartera({ usuarioId: yo.id, nombre: 'Prueba tecnológica', principal: false, ligaId: null, creada: antes(9) });
  await repo.anadirVersion(c2.id, antes(9), P('NUBE:40 SILI:30 PIXL:30'));
  for (const d of [14, 7, 0]) await repo.marcarVisita(yo.id, sumarDias(hoy, -d));
  await repo.anadirRevision(yo.id, sumarDias(hoy, -7), 'VITA');

  // Liga privada clásica «Facultad Eco 25» con reglas configurables y 7 personas más.
  const liga = await repo.crearLiga({ codigo: 'FAC25K', nombre: 'Facultad Eco 25', tipo: 'clasica', estado: 'en_juego', reglas: normalizarReglas({ maxPorEmpresa: 30, minSectores: 4, maxCambiosSemana: 3 }), creadorId: yo.id, temporadaId: t.id, creada: antes(16) });
  await repo.anadirMiembro({ ligaId: liga.id, usuarioId: yo.id, carteraId: c.id, unido: antes(16), ordenDraft: null });
  const otros: [string, string, number[], number[]][] = [
    ['luna_indexada', 'NUBE:15 VITA:15 SOLR:14 FARO:14 HOGR:14 FERR:14 ONDA:14', [14, 7, 0], [14, 7]],
    ['ardilla.prudente', 'ORTO:18 BOLS:17 RUTA:17 AERO:16 ELEC:16 TORR:16', [14, 7, 0], [7]],
    ['el_del_excel', 'PAGO:22 CLIN:20 VIEN:20 MERC:20 LOGI:18', [14, 7], [14]],
    ['NoSoyBroker', 'SILI:26 GENO:20 PETR:18 CAFE:18 GRUA:18', [7, 0], []],
    ['pixel_bull', 'PIXL:35 JUEG:25 ANUN:20 VIDE:20', [14, 0], [0]],
    ['cero_prisa', 'AQUA:25 ELEC:25 GASN:25 TERM:25', [14], []],
    ['bonos_y_bossa', 'BEBI:30 HOGR:25 RUTA:25 MERC:20', [0], []],
  ];
  for (const [apodo, cartera, vis, rev] of otros) {
    const u = await repo.crearUsuario({ email: `${apodo.replace(/\W/g, '')}@ejemplo.invalid`, apodo, mayor18En: antes(30), invitadoPor: 'DEMO', creado: antes(30) });
    const cu = await repo.crearCartera({ usuarioId: u.id, nombre: 'Principal', principal: true, ligaId: null, creada: antes(20) });
    await repo.anadirVersion(cu.id, antes(20), P(cartera));
    await repo.anadirMiembro({ ligaId: liga.id, usuarioId: u.id, carteraId: cu.id, unido: antes(16), ordenDraft: null });
    for (const d of vis) await repo.marcarVisita(u.id, sumarDias(hoy, -d));
    for (const d of rev) await repo.anadirRevision(u.id, sumarDias(hoy, -d), 'NUBE');
  }

  // Liga de draft «Draft del jueves» ya en juego (6 rondas, 4 personas).
  const dl = await repo.crearLiga({ codigo: 'DRAF7Q', nombre: 'Draft del jueves', tipo: 'draft', estado: 'en_juego', reglas: normalizarReglas({ maxPorEmpresa: 25, minSectores: 5 }), creadorId: yo.id, temporadaId: t.id, creada: antes(15) });
  const draftistas = [yo.id, ...repo.usuarios.filter(u => ['luna_indexada', 'ardilla.prudente', 'pixel_bull'].includes(u.apodo)).map(u => u.id)];
  const picks: Record<number, string[]> = {
    [draftistas[0]]: ['VITA', 'BITA', 'SOLR', 'RUTA', 'FERR', 'ONDA'],
    [draftistas[1]]: ['NUBE', 'ORTO', 'PAGO', 'HOGR', 'AERO', 'AQUA'],
    [draftistas[2]]: ['SILI', 'BOLS', 'CLIN', 'LOGI', 'ELEC', 'TORR'],
    [draftistas[3]]: ['PIXL', 'JUEG', 'ANUN', 'KAED', 'VIEN', 'CAFE'],
  };
  for (let i = 0; i < draftistas.length; i++) {
    const uid = draftistas[i];
    const cd = await repo.crearCartera({ usuarioId: uid, nombre: 'Draft · Draft del jueves', principal: false, ligaId: dl.id, creada: antes(15) });
    await repo.anadirVersion(cd.id, antes(15), picks[uid].map((tk, k) => ({ ticker: tk, decimas: k < 4 ? 167 : 166 })));
    await repo.anadirMiembro({ ligaId: dl.id, usuarioId: uid, carteraId: cd.id, unido: antes(16), ordenDraft: i });
    picks[uid].forEach((tk, r) => repo.picksT.push({ ligaId: dl.id, ronda: r + 1, usuarioId: uid, ticker: tk, en: antes(15) }));
  }
  await repo.crearInvitacion({ codigo: 'DEMO2026', creadaPor: yo.id, usosMax: 1, usos: 0, creada: antes(2), nota: 'Para Lucía' });
  return { usuarioId: yo.id };
}

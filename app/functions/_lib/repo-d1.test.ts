// RepoD1 contra SQLite real (node:sqlite) con el esquema de producción: misma batería que el repo en memoria.
import { bateriaRepo } from '../../src/lib/servicio/repo.contrato';
import { crearD1 } from '../../scripts/pruebas/d1-sqlite.mjs';
import { RepoD1 } from './repo-d1';

bateriaRepo('D1 (SQLite)', () => new RepoD1(crearD1().DB));

import { bateriaRepo } from './repo.contrato';
import { RepoMemoria } from './memoria';

bateriaRepo('memoria', () => new RepoMemoria());

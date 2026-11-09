// Klever v1 · elige la Api: modo demo (vite --mode demo, o VITE_DEMO=1) o servidor real.
import type { Api } from './contrato';
import { crearApiDemo } from './demo';
import { crearApiHttp } from './http';

export const ES_DEMO = import.meta.env.MODE === 'demo' || import.meta.env.VITE_DEMO === '1';
export const api: Api = ES_DEMO ? crearApiDemo() : crearApiHttp();
export { ErrorApi } from './contrato';
export type { Api, Sesion } from './contrato';

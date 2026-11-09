import type { D1Database } from '@cloudflare/workers-types';
export declare const RAIZ_APP: string;
export declare function crearD1(esquema?: string): { DB: D1Database; sql: unknown };

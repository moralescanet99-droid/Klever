// Klever v1 · Cloudflare Pages Function: TODA la Api (/api/*) pasa por aquí. La lógica está en ../_lib/rutas.ts.
import type { Env } from '../_lib/util';
import { manejar } from '../_lib/rutas';

export const onRequest = (ctx: { request: Request; env: Env }) => manejar(ctx.request, ctx.env);

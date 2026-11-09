// Klever v1 · Construye: acciones que hablan con la Api y estado de la sesión de Descubrir (solo en memoria: nada en el dispositivo).
import { api } from '../../lib/api';
import { avisar, principal, recargarCarteras } from '../../lib/estado/sesion.svelte';
import { ir } from '../../lib/router.svelte';
import type { Sector } from '../../lib/dominio/tipos';
import { anadirConPeso, PESO_PROBAR } from './construye';
import { fmtPct } from '../../lib/dominio/cartera';

/** Por dónde vas en el feed de hoy y qué filtros tienes (se conserva al ir y volver de una ficha). */
export const feed = $state({ dia: '', indice: 0, sector: '' as Sector | '', pais: '', fin: false });

/** «Probar en mi cartera»: añade la empresa a la principal con un 10 % y lleva al reparto.
 *  Sin cartera principal (o vacía), lleva a Crear con la empresa ya elegida. Lanza el error de la Api si falla. */
export async function probarEnMiCartera(ticker: string): Promise<void> {
  const p = principal();
  if (!p || !p.posiciones.length) { ir(`#/construye/crear?con=${encodeURIComponent(ticker)}`); return; }
  if (p.posiciones.some(x => x.ticker === ticker)) { avisar(`${ticker} ya está en tu cartera. Prueba su peso aquí.`); ir('#/cartera/reparto'); return; }
  await api.guardarCartera(p.id, anadirConPeso(p.posiciones, ticker, PESO_PROBAR));
  await recargarCarteras();
  avisar(`${ticker} entra con un ${fmtPct(PESO_PROBAR)}. Ajusta su peso si quieres.`);
  ir('#/cartera/reparto');
}

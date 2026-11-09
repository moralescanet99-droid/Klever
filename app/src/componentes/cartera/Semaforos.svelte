<script lang="ts">
  // Tres semáforos: Concentración, Variedad y Datos (reglas actuales de Klever, lib/dominio/cartera.ts). Con `antes`, enseña el cambio.
  import { NIVEL_TXT, type Analisis } from '../../lib/dominio/cartera';
  import { empresa } from '../../lib/dominio/catalogo';
  import type { Posicion } from '../../lib/dominio/tipos';

  let { a, posiciones, antes = null, compacto = false }: { a: Analisis; posiciones: Posicion[]; antes?: Analisis | null; compacto?: boolean } = $props();
  const conDatos = $derived(posiciones.filter(p => p.decimas > 0 && empresa(p.ticker) && Object.values(empresa(p.ticker)!.huella).filter(x => x !== null).length >= 4).length);
  const filas = $derived([
    { id: 'concentracion', eti: 'Concentración', nivel: a.concentracion, txt: NIVEL_TXT.concentracion[a.concentracion], previo: antes ? NIVEL_TXT.concentracion[antes.concentracion] : '',
      sub: a.mayor ? `Mayor: ${a.mayor.ticker} ${Math.round(a.mayor.decimas / 10)} %` : 'Sin posiciones', mono: a.mayor?.ticker || '' },
    { id: 'variedad', eti: 'Variedad', nivel: a.variedad, txt: NIVEL_TXT.variedad[a.variedad], previo: antes ? NIVEL_TXT.variedad[antes.variedad] : '',
      sub: `${a.sectores.length} ${a.sectores.length === 1 ? 'sector' : 'sectores'}`, mono: '' },
    { id: 'datos', eti: 'Datos', nivel: a.datos, txt: NIVEL_TXT.datos[a.datos], previo: antes ? NIVEL_TXT.datos[antes.datos] : '',
      sub: `${conDatos} de ${a.n} empresas`, mono: '' },
  ]);
</script>

<div class="semaforos" class:compacto role="list" aria-label="Semáforos de la cartera">
  {#each filas as f (f.id)}
    <div role="listitem">
      <span class="eti">{f.eti}</span>
      <span class="pildora fondo-{f.nivel === 'na' ? 'medio' : f.nivel}">
        <i aria-hidden="true"></i>{#if f.previo && f.previo !== f.txt}<s class="previo">{f.previo}</s><span aria-hidden="true">→</span><span class="sr">ahora</span>{/if}{f.txt}
      </span>
      {#if !compacto}<span class="sub">{f.sub}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .semaforos { display: grid; grid-template-columns: 1.2fr .9fr 1fr; }
  .semaforos > div { display: grid; align-content: start; gap: 6px; padding: 2px 0 0 12px; border-left: 1px solid var(--linea-2); min-width: 0; }
  .semaforos > div:first-child { padding-left: 2px; border-left: 0; }
  .pildora { justify-self: start; display: inline-flex; align-items: center; gap: 6px; min-height: 26px; padding: 0 10px; border-radius: var(--r-pildora); font-weight: 700; font-size: var(--t-s); white-space: nowrap; }
  .pildora i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex: none; }
  .previo { opacity: .7; font-weight: 600; }
  .sub { font-size: var(--t-s); color: var(--noche-2); overflow-wrap: anywhere; }
  .compacto .pildora { min-height: 24px; font-size: var(--t-xs); padding: 0 8px; }
  .compacto > div { padding-left: 8px; gap: 4px; }
  .compacto .eti { font-size: .68rem; letter-spacing: .06em; }
</style>

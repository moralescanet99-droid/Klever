<script lang="ts">
  // Mi cartera › Mapa: dónde tienen la sede y dónde venden (no es lo mismo), monedas de informe, sesgo de casa y señales geográficas.
  // Sin escenarios («¿y si el dólar…?»): solo describe el reparto. Se recalcula con los pesos que se estén viendo (también el borrador).
  import { fmtPct, type Analisis } from '../../lib/dominio/cartera';
  import MapaMundo from '../../componentes/cartera/MapaMundo.svelte';
  import Senales from '../../componentes/cartera/Senales.svelte';
  import { COLOR_MONEDA, COLOR_REGION, PAISES, arco, pctEntero } from '../../componentes/cartera/util';

  let { a }: { a: Analisis } = $props();
  let vista = $state<'sede' | 'ventas'>('sede');

  const pct = (d: number) => pctEntero(d, a.suma);
  const casa = $derived(pct(a.espana));
  // Barras: sede por país (4 primeros + resto) y ventas por región.
  const sede = $derived.by(() => {
    const top = a.paises.slice(0, 4).map(p => ({ k: p.clave, v: pct(p.decimas), color: PAISES[p.clave] ? COLOR_REGION[PAISES[p.clave].region] : 'var(--noche-3)' }));
    const resto = a.paises.slice(4).reduce((s, p) => s + p.decimas, 0);
    return resto ? [...top, { k: 'Otros países', v: pct(resto), color: 'var(--noche-3)' }] : top;
  });
  const ventas = $derived(a.ventas.filter(v => v.decimas > 0).sort((x, y) => y.decimas - x.decimas).map(v => ({ k: v.region, v: Math.round(v.decimas / 10), color: COLOR_REGION[v.region] })));
  const sinDesglose = $derived(a.suma ? pctEntero(a.suma - a.coberturaVentas, a.suma) : 0);
  const zonas = $derived(ventas.length);
  // Anillo de monedas
  const monedas = $derived.by(() => { let acc = 0; return a.monedas.map(m => { const a0 = (acc / Math.max(1, a.suma)) * 360; acc += m.decimas; return { k: m.clave, v: pct(m.decimas), a0, a1: (acc / Math.max(1, a.suma)) * 360 }; }); });
  const hueco = $derived(monedas.length > 1 ? 2 : 0);
</script>

{#if !a.n}
  <section class="tarjeta pila" aria-labelledby="mp-vacia">
    <h2 id="mp-vacia">Aún no hay nada en el mapa</h2>
    <p class="tenue">Añade empresas para ver dónde tienen la sede y dónde venden.</p>
    <a class="btn btn-primario" href="#/construye/crear">Ir a Construye</a>
  </section>
{:else}
  <section class="cristal mapa" aria-labelledby="mp-titulo">
    <span class="eti">Sesgo de casa</span>
    <h2 id="mp-titulo" class="titulo" aria-live="polite">{casa ? `El ${casa} % de tu cartera tiene sede en España` : 'Ninguna de tus empresas tiene sede en España'}</h2>
    <div class="segmento" role="tablist" aria-label="Qué enseña el mapa">
      <button role="tab" aria-selected={vista === 'sede'} onclick={() => (vista = 'sede')}>Dónde tienen la sede</button>
      <button role="tab" aria-selected={vista === 'ventas'} onclick={() => (vista = 'ventas')}>Dónde venden</button>
    </div>
    <MapaMundo {vista} paises={a.paises} ventas={a.ventas} suma={a.suma} />
    {#if vista === 'sede'}
      <p class="ley-mapa"><span class="marca" aria-hidden="true"></span>Sede: más grande, más peso.</p>
    {:else}
      <p class="ley-mapa"><span class="puntos" aria-hidden="true"><i></i><i></i><i></i></span>Ventas: más intenso, más peso.{#if sinDesglose} Sin desglose: {sinDesglose} % del peso.{/if}</p>
    {/if}
  </section>

  <section class="pila" aria-labelledby="mp-barras">
    <h2 id="mp-barras" class="eti">Sede y ventas no son lo mismo</h2>
    <p class="tenue peq">Una empresa con sede en España puede vender sobre todo fuera.</p>
    <div class="barra-f">
      <span class="lado">Sede</span>
      <div class="barra" role="img" aria-label="Sede por país: {sede.map(s => `${s.k} ${s.v} %`).join(', ')}">
        {#each sede as s (s.k)}<i style="flex-grow: {s.v}; background: color-mix(in srgb, {s.color} 45%, var(--blanco))" title="{s.k} {s.v} %">{s.v >= 9 ? `${s.v} %` : ''}</i>{/each}
      </div>
    </div>
    <div class="barra-f">
      <span class="lado">Ventas</span>
      <div class="barra" role="img" aria-label="Ventas por región: {ventas.map(s => `${s.k} ${s.v} %`).join(', ')}">
        {#if ventas.length}
          {#each ventas as s (s.k)}<i style="flex-grow: {s.v}; background: color-mix(in srgb, {s.color} 45%, var(--blanco))" title="{s.k} {s.v} %">{s.v >= 9 ? `${s.v} %` : ''}</i>{/each}
        {:else}<i class="nada">Sin desglose</i>{/if}
      </div>
    </div>
    <h3 class="cab-ley">Sede por país</h3>
    <ul class="ley">
      {#each sede as s (s.k)}<li><i style="background: {s.color}"></i>{s.k} <b>{s.v} %</b><span class="sr"> de la sede</span></li>{/each}
    </ul>
    <h3 class="cab-ley">Ventas por región</h3>
    <ul class="ley">
      {#each ventas as s (s.k)}<li><i style="background: {s.color}"></i>{s.k} <b>{s.v} %</b><span class="sr"> de las ventas</span></li>{/each}
    </ul>
    {#if sinDesglose}
      <p class="nota">El {sinDesglose} % del peso es de empresas que no publican dónde venden («sin desglose»). Las ventas se calculan con el resto.</p>
    {/if}
  </section>

  <section class="monedas" aria-labelledby="mp-mon">
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {#each monedas as m (m.k)}<path d={arco(32, 32, 24, m.a0 + hueco / 2, Math.max(m.a0 + hueco / 2 + 0.5, m.a1 - hueco / 2))} style="stroke: {COLOR_MONEDA[m.k]}" />{/each}
    </svg>
    <div class="pila-m">
      <h2 id="mp-mon" class="eti">Monedas</h2>
      <ul class="lista-mon">
        {#each monedas as m (m.k)}<li><b>{m.k}</b> <span class="num" style="color: color-mix(in srgb, {COLOR_MONEDA[m.k]} 70%, var(--noche))">{m.v} %</span></li>{/each}
      </ul>
      <p class="tenue peq">Moneda en la que informa la empresa, no en la que cotiza.</p>
    </div>
  </section>

  <ul class="hechos">
    <li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" /></svg>
      <span>Tienen sede en {a.paises.length} {a.paises.length === 1 ? 'país' : 'países'}{zonas ? `, pero venden en ${zonas} ${zonas === 1 ? 'zona' : 'zonas'} del mundo` : ''}.</span></li>
    <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4.5 20 11v8.5H4z" /><path d="M10 19.5v-5h4v5" /></svg>
      <span>De media, el <b>{a.fueraMedio} %</b> de lo que ingresan viene de fuera de su país de sede.</span></li>
  </ul>

  <section class="pila" aria-labelledby="mp-sen">
    <h2 id="mp-sen" class="eti">Señales geográficas</h2>
    <Senales senales={a.senalesMapa} />
    <p class="tenue peq">Referencias orientativas de Klever. {fmtPct(a.suma)} repartido.</p>
  </section>
{/if}

<style>
  .mapa { padding: var(--s4) var(--s3) var(--s3); display: grid; gap: var(--s2); }
  .mapa > .eti, .mapa > .titulo { padding: 0 var(--s1); }
  .titulo { font-size: 1.3rem; font-weight: 440; }
  .segmento button { min-height: 40px; font-size: var(--t-xs); padding: 0 6px; }
  .ley-mapa { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; font-size: var(--t-xs); font-weight: 600; color: var(--noche-2); padding: 0 var(--s1); }
  .marca { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--noche); background: var(--blanco); }
  .puntos { display: inline-flex; gap: 3px; }
  .puntos i { width: 6px; height: 6px; border-radius: 50%; background: var(--lila); }
  .puntos i:nth-child(1) { opacity: .35; } .puntos i:nth-child(2) { opacity: .65; }
  .barra-f { display: grid; grid-template-columns: 56px 1fr; align-items: center; gap: var(--s2); }
  .lado { font-weight: 700; font-size: var(--t-s); }
  .barra { display: flex; height: 26px; border-radius: 8px; overflow: hidden; gap: 2px; min-width: 0; }
  .barra i { display: flex; align-items: center; justify-content: center; flex-basis: 0; min-width: 4px; font-style: normal; font-weight: 700; font-size: var(--t-xs); color: var(--noche); white-space: nowrap; overflow: hidden; }
  .barra i.nada { flex-grow: 1; background: var(--perla-hi); color: var(--noche-3); }
  .cab-ley { font-family: var(--f-txt); font-size: var(--t-xs); font-weight: 700; color: var(--noche-2); margin-top: var(--s1); }
  .ley { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; }
  .ley li { display: flex; align-items: center; gap: 6px; font-size: var(--t-s); color: var(--noche-2); min-width: 0; }
  .ley b { color: var(--noche); margin-left: auto; }
  .ley i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
  .nota { font-size: var(--t-s); padding: var(--s2) var(--s3); border-radius: var(--r); background: var(--perla-hi); border: 1px dashed var(--linea-2); }
  .monedas { display: flex; align-items: center; gap: var(--s4); padding-top: var(--s3); border-top: 1px solid var(--linea); }
  .monedas svg { width: 72px; height: 72px; flex: none; }
  .monedas path { fill: none; stroke-width: 10; }
  .pila-m { display: grid; gap: 6px; min-width: 0; }
  .lista-mon { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: baseline; }
  .lista-mon .num { font-size: var(--t-l); }
  .hechos { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  .hechos li { display: flex; gap: var(--s3); align-items: flex-start; font-size: var(--t-s); line-height: 1.4; }
  .hechos svg { flex: none; width: 20px; height: 20px; fill: none; stroke: var(--lila-t); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
</style>

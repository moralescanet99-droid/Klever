<script lang="ts">
  // FICHA de empresa: datos, huella grande con la explicación de cada comprobación, sede y ventas por región.
  // Abrirla cuenta como «revisar una empresa» (Aprendizaje: 10 puntos esa semana) → api.revisarEmpresa.
  import { api } from '../../lib/api';
  import { CATALOGO, FUENTE_DATOS, empresa } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import { EJES_HUELLA } from '../../lib/dominio/tipos';
  import { mensaje, principal } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import HuellaFlor from '../../componentes/empresa/HuellaFlor.svelte';
  import EmpresaMeta from '../../componentes/empresa/EmpresaMeta.svelte';
  import VentasBarra from '../../componentes/empresa/VentasBarra.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';
  import { estadoCheck, textoHuella } from './construye';
  import { probarEnMiCartera } from './acciones.svelte';

  let { ticker }: { ticker: string } = $props();
  const e = $derived(empresa(ticker));
  const yaEsta = $derived(!!principal()?.posiciones.some(p => p.ticker === ticker));

  let revision = $state<'' | 'ok' | 'error'>(''), errRevision = $state('');
  $effect(() => {
    const t = ticker; revision = ''; errRevision = '';
    if (!empresa(t)) return;
    let vivo = true;
    api.revisarEmpresa(t).then(() => { if (vivo) revision = 'ok'; }).catch(err => { if (vivo) { revision = 'error'; errRevision = mensaje(err); } });
    return () => { vivo = false; };
  });

  let ocupado = $state(false), error = $state('');
  async function probar() {
    ocupado = true; error = '';
    try { await probarEnMiCartera(ticker); } catch (err) { error = mensaje(err); } finally { ocupado = false; }
  }
  const otras = $derived([...CATALOGO].filter(x => x.ticker !== ticker).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
  let con = $state('');
  $effect(() => { if (!con || con === ticker) con = otras[0]?.ticker || ''; });
</script>

<a class="btn btn-fantasma volver" href="#/construye/descubrir"><Ico n="atras" />Descubrir</a>

{#if !e}
  <section class="tarjeta pila" aria-live="polite">
    <h2>No encuentro «{ticker || '—'}»</h2>
    <p class="tenue">Esa empresa no está en el catálogo de ejemplo.</p>
    <a class="btn btn-primario" href="#/construye/descubrir">Volver a Descubrir</a>
  </section>
{:else}
  <article class="ficha" aria-labelledby="f-nombre">
    <section class="tarjeta cabeza">
      <div class="fila entre tit">
        <h2 id="f-nombre">{e.nombre}</h2>
        <span class="mono ticker" style="--c:{COLOR_SECTOR[e.sector]}">{e.ticker}</span>
      </div>
      <EmpresaMeta {e} />
      <p class="desc">{e.descripcion}</p>
      <p class="revision" aria-live="polite">
        {#if revision === 'ok'}<span class="chip aprende"><Ico n="libro" tam={14} />+10 de Aprendizaje esta semana</span>
        {:else if revision === 'error'}<span class="error">No se ha podido anotar la revisión: {errRevision}</span>{/if}
      </p>
    </section>

    <section class="tarjeta bloque" aria-labelledby="f-huella">
      <div class="fila entre">
        <h3 id="f-huella" class="eti">Huella en flor</h3>
        <span class="cumple">{textoHuella(e.huella)}</span>
      </div>
      <HuellaFlor huella={e.huella} nombre={e.nombre} animar />
      <p class="leyenda">Lleno: cumple · pequeño: no cumple · hueco: sin datos</p>
      <ul class="checks">
        {#each EJES_HUELLA as x (x.clave)}
          {@const v = e.huella[x.clave]}
          <li class={v === true ? 'si' : v === false ? 'no' : 'nd'}>
            <span class="m"><Ico n={v === true ? 'ok' : v === false ? 'no' : 'nd'} tam={13} /></span>
            <div><p class="nom"><b>{x.etiqueta}</b> · {estadoCheck(v)}</p><p class="tenue peq">{x.explica}</p></div>
          </li>
        {/each}
      </ul>
      <p class="tenue peq">Sin datos no es lo mismo que no cumplir.</p>
    </section>

    <section class="tarjeta bloque" aria-labelledby="f-donde">
      <h3 id="f-donde" class="eti">Dónde está y dónde vende</h3>
      <dl class="datos">
        <div><dt>Sede</dt><dd>{e.pais}</dd></div>
        <div><dt>Moneda de informe</dt><dd class="mono">{e.moneda}</dd></div>
        <div><dt>Ingresos fuera de {e.pais}</dt><dd><span class="num grande">{e.fuera}</span> %</dd></div>
      </dl>
      <div class="fuera" aria-hidden="true"><i style="transform:scaleX({e.fuera / 100})"></i></div>
      <h4 class="sub">Ventas por región</h4>
      <VentasBarra {e} />
    </section>

    <section class="acciones">
      {#if yaEsta}
        <a class="btn btn-primario btn-ancho" href="#/cartera/reparto">Ya está en tu cartera · probar su peso</a>
      {:else}
        <button class="btn btn-primario btn-ancho" type="button" disabled={ocupado} onclick={probar}><Ico n="mas" />{ocupado ? 'Añadiendo…' : 'Probar en mi cartera'}</button>
      {/if}
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <form class="comparar" onsubmit={(ev) => { ev.preventDefault(); if (con) ir(`#/construye/comparar/${e.ticker}/${con}`); }}>
        <label for="f-con" class="sr">Comparar {e.ticker} con</label>
        <select id="f-con" class="entrada" bind:value={con}>
          {#each otras as o (o.ticker)}<option value={o.ticker}>{o.nombre} · {o.ticker}</option>{/each}
        </select>
        <button class="btn" type="submit"><Ico n="ojo" />Comparar</button>
      </form>
    </section>
    <p class="fuente tenue">{FUENTE_DATOS}. Klever enseña datos, no recomienda empresas.</p>
  </article>
{/if}

<style>
  .volver { justify-self: start; padding-left: 8px; }
  .ficha { display: grid; gap: var(--s3); min-width: 0; }
  .cabeza, .bloque { display: grid; gap: var(--s3); }
  .tit { flex-wrap: nowrap; align-items: flex-start; }
  .tit h2 { font-size: var(--t-xl); font-weight: 450; overflow-wrap: anywhere; min-width: 0; }
  .ticker { flex: none; font-size: var(--t-s); font-weight: 600; padding: 6px 9px; border-radius: 9px; background: color-mix(in srgb, var(--c) 18%, transparent); }
  .desc { color: var(--noche-2); }
  .revision:empty { display: none; }
  .aprende { background: var(--agua-f); color: var(--agua-t); border-color: transparent; }
  .cumple { font-family: var(--f-disp); font-variation-settings: "SOFT" 100, "opsz" 36; font-size: var(--t-l); }
  .leyenda { text-align: center; font-size: var(--t-xs); color: var(--noche-2); }
  .checks { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); }
  .checks li { display: grid; grid-template-columns: 24px 1fr; gap: 10px; align-items: start; }
  .checks .m { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; }
  .checks .si .m { background: var(--ok-f); color: var(--ok); }
  .checks .no .m { background: var(--alto-f); color: var(--alto); }
  .checks .nd .m { background: var(--perla-hi); color: var(--noche-3); box-shadow: inset 0 0 0 1.5px var(--linea-2); }
  .nom { font-size: var(--t-s); }
  .datos { margin: 0; display: grid; gap: var(--s2); }
  .datos div { display: flex; justify-content: space-between; align-items: baseline; gap: var(--s3); border-bottom: 1px solid var(--linea); padding-bottom: var(--s2); }
  .datos dt { color: var(--noche-2); font-size: var(--t-s); }
  .datos dd { margin: 0; font-weight: 600; text-align: right; }
  .grande { font-size: var(--t-l); }
  .fuera { height: 8px; border-radius: 4px; background: var(--linea); overflow: hidden; }
  .fuera i { display: block; height: 100%; background: linear-gradient(90deg, var(--cobre), var(--lila)); transform-origin: left; }
  .sub { font-size: var(--t-s); font-weight: 700; margin: var(--s2) 0 0; }
  .acciones { display: grid; gap: var(--s2); }
  .comparar { display: grid; grid-template-columns: 1fr auto; gap: var(--s2); }
  .comparar .entrada { min-width: 0; width: 100%; }
  .fuente { font-size: var(--t-xs); text-align: center; }
</style>

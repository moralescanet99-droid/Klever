<script lang="ts">
  // COMPARADOR de dos empresas: huellas lado a lado y datos en una tabla. Cuenta como «revisar una empresa».
  import { api } from '../../lib/api';
  import { CATALOGO, FUENTE_DATOS, empresa } from '../../lib/dominio/catalogo';
  import { EJES_HUELLA, type Empresa } from '../../lib/dominio/tipos';
  import { mensaje } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import HuellaFlor from '../../componentes/empresa/HuellaFlor.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';
  import { estadoCheck, regionPrincipal, textoHuella } from './construye';

  let { a, b }: { a: string; b: string } = $props();
  const ea = $derived(empresa(a)), eb = $derived(empresa(b));
  const valido = $derived(!!ea && !!eb && a !== b);
  const ORDEN = [...CATALOGO].sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));

  let revision = $state<'' | 'ok' | 'error'>(''), errRevision = $state('');
  $effect(() => {
    const t = a, ok = valido; revision = ''; errRevision = '';
    if (!ok) return;
    let vivo = true;
    api.revisarEmpresa(t).then(() => { if (vivo) revision = 'ok'; }).catch(err => { if (vivo) { revision = 'error'; errRevision = mensaje(err); } });
    return () => { vivo = false; };
  });

  const filas: { k: string; f: (e: Empresa) => string }[] = [
    { k: 'Sector', f: e => e.sector },
    { k: 'Sede', f: e => e.pais },
    { k: 'Moneda de informe', f: e => e.moneda },
    { k: 'Ingresos fuera de su país', f: e => `${e.fuera} %` },
    { k: 'Región que más vende', f: e => { const r = regionPrincipal(e); return r ? `${r.region} (${r.pct} %)` : 'Sin desglose'; } },
  ];
  const cambiar = (lado: 'a' | 'b', t: string) => ir(lado === 'a' ? `#/construye/comparar/${t}/${b}` : `#/construye/comparar/${a}/${t}`);
</script>

<a class="btn btn-fantasma volver" href="#/construye/descubrir"><Ico n="atras" />Descubrir</a>

<form class="elige" onsubmit={(e) => e.preventDefault()}>
  <div class="campo"><label for="cmp-a">Primera</label>
    <select id="cmp-a" class="entrada" value={a} onchange={(e) => cambiar('a', e.currentTarget.value)}>
      {#if !ea}<option value={a}>Elige una empresa</option>{/if}
      {#each ORDEN as e (e.ticker)}<option value={e.ticker}>{e.nombre} · {e.ticker}</option>{/each}
    </select></div>
  <div class="campo"><label for="cmp-b">Segunda</label>
    <select id="cmp-b" class="entrada" value={b} onchange={(e) => cambiar('b', e.currentTarget.value)}>
      {#if !eb}<option value={b}>Elige una empresa</option>{/if}
      {#each ORDEN as e (e.ticker)}<option value={e.ticker}>{e.nombre} · {e.ticker}</option>{/each}
    </select></div>
</form>

{#if !valido || !ea || !eb}
  <section class="tarjeta pila" aria-live="polite">
    <h2>{a && a === b ? 'Son la misma empresa' : 'Falta una empresa'}</h2>
    <p class="tenue">Elige arriba dos empresas distintas del catálogo para compararlas.</p>
  </section>
{:else}
  <section class="tarjeta duo" aria-label="Huellas de {ea.nombre} y {eb.nombre}">
    {#each [ea, eb] as e (e.ticker)}
      <div class="lado">
        <a class="nom" href="#/construye/empresa/{e.ticker}"><span>{e.nombre}</span> <span class="mono tk">{e.ticker}</span></a>
        <HuellaFlor huella={e.huella} nombre={e.nombre} tamano="medio" animar />
        <p class="cumple">{textoHuella(e.huella)}</p>
      </div>
    {/each}
    <p class="leyenda">Lleno: cumple · pequeño: no cumple · hueco: sin datos</p>
  </section>

  <section class="tarjeta tabla-env" aria-live="polite">
    <table>
      <caption class="sr">Datos de {ea.nombre} y {eb.nombre}</caption>
      <thead><tr><th scope="col"><span class="sr">Dato</span></th><th scope="col" class="mono">{ea.ticker}</th><th scope="col" class="mono">{eb.ticker}</th></tr></thead>
      <tbody>
        {#each filas as r (r.k)}
          <tr><th scope="row">{r.k}</th><td>{r.f(ea)}</td><td>{r.f(eb)}</td></tr>
        {/each}
        {#each EJES_HUELLA as x (x.clave)}
          <tr><th scope="row" title={x.explica}>{x.etiqueta}</th>
            {#each [ea.huella[x.clave], eb.huella[x.clave]] as v, k (k)}
              <td><span class="est {v === true ? 'si' : v === false ? 'no' : 'nd'}"><span class="m"><Ico n={v === true ? 'ok' : v === false ? 'no' : 'nd'} tam={11} /></span>{estadoCheck(v)}</span></td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
  <p class="revision" aria-live="polite">
    {#if revision === 'ok'}<span class="chip aprende"><Ico n="libro" tam={14} />+10 de Aprendizaje esta semana</span>
    {:else if revision === 'error'}<span class="error">No se ha podido anotar la revisión: {errRevision}</span>{/if}
  </p>
  <p class="fuente tenue">{FUENTE_DATOS}. Klever enseña datos, no recomienda empresas.</p>
{/if}

<style>
  .volver { justify-self: start; padding-left: 8px; }
  .elige { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
  .elige .entrada { width: 100%; min-width: 0; padding: 0 10px; }
  .duo { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); }
  .lado { display: grid; justify-items: center; align-content: start; gap: var(--s2); text-align: center; min-width: 0; }
  .nom { color: var(--noche); text-decoration: none; font-family: var(--f-disp); font-variation-settings: "SOFT" 100; font-size: var(--t-l); line-height: 1.15; min-height: 44px; display: grid; align-content: center; overflow-wrap: anywhere; }
  .nom:hover span:first-child { text-decoration: underline; }
  .tk { display: block; font-size: var(--t-xs); color: var(--noche-3); }
  .cumple { font-weight: 600; font-size: var(--t-s); }
  .leyenda { grid-column: 1 / -1; text-align: center; font-size: var(--t-xs); color: var(--noche-2); }
  .tabla-env { padding: var(--s2) var(--s3); }
  table { width: 100%; border-collapse: collapse; font-size: var(--t-s); table-layout: fixed; }
  th, td { text-align: left; padding: 10px 6px; border-bottom: 1px solid var(--linea); vertical-align: top; overflow-wrap: anywhere; }
  tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
  thead th { font-size: var(--t-xs); color: var(--noche-3); }
  th[scope="row"] { color: var(--noche-2); font-weight: 600; width: 34%; }
  .est { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
  .est .m { width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; flex: none; }
  .est.si .m { background: var(--ok-f); color: var(--ok); }
  .est.no .m { background: var(--alto-f); color: var(--alto); }
  .est.nd { color: var(--noche-3); }
  .est.nd .m { background: var(--perla-hi); box-shadow: inset 0 0 0 1.5px var(--linea-2); }
  .revision { text-align: center; }
  .revision:empty { display: none; }
  .aprende { background: var(--agua-f); color: var(--agua-t); border-color: transparent; }
  .fuente { font-size: var(--t-xs); text-align: center; }
</style>

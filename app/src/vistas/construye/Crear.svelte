<script lang="ts">
  // CREAR: arranque en menos de un minuto (3–5 empresas, a partes iguales, nombre y «Encender mi cartera»).
  // Alternativas: pegar una lista («NUBE 40, VITA 60») o empezar con una cartera de ejemplo.
  // También: editar la cartera principal (añadir con un 10 % o quitar), guardando con api.guardarCartera.
  import { onDestroy } from 'svelte';
  import { api } from '../../lib/api';
  import { fmtPct, parsearLista, repartirIgual, TOTAL } from '../../lib/dominio/cartera';
  import { CATALOGO, empresa } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import type { Posicion, Sector } from '../../lib/dominio/tipos';
  import { avisar, estado, mensaje, principal, recargarCarteras } from '../../lib/estado/sesion.svelte';
  import { ir, ruta } from '../../lib/router.svelte';
  import HuellaFlor from '../../componentes/empresa/HuellaFlor.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';
  import ConstruyeFiltros from '../../componentes/base/ConstruyeFiltros.svelte';
  import Anillo from './Anillo.svelte';
  import { anadirConPeso, EJEMPLO, MAX_CREAR, MIN_CREAR, pasaFiltro, PESO_PROBAR, quitarYReescalar, textoHuella } from './construye';

  const MAX_LISTA = 30;
  const mia = $derived(principal());
  const tieneCartera = $derived(!!mia?.posiciones.length);
  let modo = $state<'nueva' | 'editar'>('nueva');

  // ── Nueva cartera ──
  let elegidas = $state<string[]>([]);
  let pesosLista = $state<Record<string, number> | null>(null); // pesos de una lista pegada (si no, a partes iguales)
  let nombre = $state(estado.carteras.some(c => c.nombre === 'Mi cartera') ? 'Mi cartera nueva' : 'Mi cartera');
  let hacerPrincipal = $state(true);
  let sector = $state<Sector | ''>(''), pais = $state('');
  let ocupado = $state(false), error = $state('');
  let encendida = $state<{ nombre: string; posiciones: Posicion[] } | null>(null);
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => clearTimeout(temporizador));

  const con = ruta.consulta.get('con')?.toUpperCase();
  if (con && empresa(con)) elegidas = [con];

  const visibles = $derived(CATALOGO.filter(e => pasaFiltro(e, { sector, pais })));
  const posiciones = $derived<Posicion[]>(pesosLista ? elegidas.map(t => ({ ticker: t, decimas: pesosLista![t] ?? 0 })) : repartirIgual(elegidas));
  const suma = $derived(posiciones.reduce((a, p) => a + p.decimas, 0));
  const maximo = $derived(pesosLista ? MAX_LISTA : MAX_CREAR);
  const listo = $derived(elegidas.length >= MIN_CREAR && elegidas.length <= maximo && suma > 0 && suma <= TOTAL);
  const faltan = $derived(Math.max(0, MIN_CREAR - elegidas.length));

  function alternar(t: string) {
    error = '';
    if (pesosLista) pesosLista = null; // al tocar la rejilla, se vuelve al reparto a partes iguales
    if (elegidas.includes(t)) elegidas = elegidas.filter(x => x !== t);
    else if (elegidas.length < MAX_CREAR) elegidas = [...elegidas, t];
    else avisar(`Para empezar, como mucho ${MAX_CREAR} empresas. Luego podrás añadir más.`);
  }
  function quitar(t: string) { elegidas = elegidas.filter(x => x !== t); if (pesosLista && !elegidas.length) pesosLista = null; }
  function ejemplo() { pesosLista = null; elegidas = [...EJEMPLO]; nombre = 'Cartera de ejemplo'; error = ''; avisar('Cartera de ejemplo lista: cámbiala a tu gusto.'); }

  // ── Pegar una lista ──
  let texto = $state(''), desconocidos = $state<string[]>([]), avisoLista = $state('');
  function usarLista() {
    const r = parsearLista(texto); desconocidos = r.desconocidos; avisoLista = '';
    if (!r.posiciones.length) { avisoLista = 'No he reconocido ninguna empresa del catálogo.'; return; }
    const pos = r.posiciones.slice(0, MAX_LISTA);
    elegidas = pos.map(p => p.ticker); pesosLista = Object.fromEntries(pos.map(p => [p.ticker, p.decimas]));
    const s = pos.reduce((a, p) => a + p.decimas, 0);
    avisoLista = pos.length < MIN_CREAR ? `Reconozco ${pos.length}; añade hasta ${MIN_CREAR} como mínimo.`
      : s > TOTAL ? `Los pesos suman ${fmtPct(s)}: bájalos hasta el 100 %.`
      : s < TOTAL ? `Suma ${fmtPct(s)}. Podrás repartir el resto en Mi cartera.` : `Lista lista: ${pos.length} empresas al 100 %.`;
  }

  async function encender() {
    if (!listo || ocupado) return;
    ocupado = true; error = '';
    try {
      const habia = !!principal();
      const c = await api.crearCartera(nombre.trim() || 'Mi cartera', posiciones);
      if (habia && hacerPrincipal && !c.principal) await api.marcarPrincipal(c.id);
      await recargarCarteras();
      encendida = { nombre: c.nombre, posiciones: c.posiciones };
      const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
      temporizador = setTimeout(() => ir('#/cartera'), quieto ? 1200 : 1900);
    } catch (e) { error = mensaje(e); } finally { ocupado = false; }
  }

  // ── Editar la principal ──
  let guardando = $state(''), errorEd = $state('');
  async function editar(t: string) {
    if (!mia || guardando) return;
    const esta = mia.posiciones.some(p => p.ticker === t);
    const nuevas = esta ? quitarYReescalar(mia.posiciones, t) : anadirConPeso(mia.posiciones, t, PESO_PROBAR);
    guardando = t; errorEd = '';
    try {
      await api.guardarCartera(mia.id, nuevas); await recargarCarteras();
      avisar(esta ? `${t} fuera. Su peso se reparte entre las demás.` : `${t} dentro con un ${fmtPct(PESO_PROBAR)}.`);
    } catch (e) { errorEd = mensaje(e); } finally { guardando = ''; }
  }
  const enMia = (t: string) => !!mia?.posiciones.some(p => p.ticker === t);
</script>

{#if encendida}
  <div class="encendida" role="status" aria-live="assertive">
    <Anillo posiciones={encendida.posiciones} tam={200} grosor={22} enciende>
      <span class="chispa"><Ico n="chispa" tam={34} /></span>
    </Anillo>
    <h2>Tu cartera se enciende</h2>
    <p class="tenue">«{encendida.nombre}» · {encendida.posiciones.length} empresas</p>
    <a class="btn btn-primario" href="#/cartera">Ver mi cartera</a>
  </div>
{/if}

{#if tieneCartera && mia}
  <div class="modo" role="group" aria-label="Qué quieres hacer">
    <button type="button" aria-pressed={modo === 'nueva'} onclick={() => (modo = 'nueva')}>Nueva cartera</button>
    <button type="button" aria-pressed={modo === 'editar'} onclick={() => (modo = 'editar')}>Editar «{mia.nombre}»</button>
  </div>
{/if}

{#if modo === 'editar' && mia}
  <section class="pila" aria-labelledby="ed-t">
    <div class="tarjeta pila">
      <h2 id="ed-t">Tu cartera principal</h2>
      <p class="tenue peq">Toca una empresa para quitarla o añadirla. Las nuevas entran con un {fmtPct(PESO_PROBAR)}.</p>
      {#if !mia.posiciones.length}
        <p class="tenue">Está vacía. Añade empresas abajo.</p>
      {:else}
        <ul class="actuales" aria-live="polite">
          {#each mia.posiciones as p (p.ticker)}
            {@const e = empresa(p.ticker)}
            <li>
              <span class="punto" style="color:{e ? COLOR_SECTOR[e.sector] : 'var(--noche-3)'}" aria-hidden="true"></span>
              <span class="mono tk">{p.ticker}</span><span class="nm">{e?.nombre ?? p.ticker}</span>
              <span class="mono peso">{fmtPct(p.decimas)}</span>
              <button class="btn btn-icono" type="button" aria-label="Quitar {e?.nombre ?? p.ticker}" disabled={!!guardando} onclick={() => editar(p.ticker)}><Ico n="quitar" /></button>
            </li>
          {/each}
        </ul>
      {/if}
      {#if errorEd}<p class="error" role="alert">{errorEd}</p>{/if}
      <a class="btn btn-ancho" href="#/cartera/reparto">Ajustar pesos en Mi cartera<Ico n="flecha" /></a>
    </div>
    <h3 class="eti">Añadir empresas</h3>
    <ConstruyeFiltros bind:sector bind:pais />
    {@render rejilla(true)}
  </section>
{:else}
  <section class="pila" aria-labelledby="cr-t">
    <div class="paso">
      <h2 id="cr-t">Elige de {MIN_CREAR} a {MAX_CREAR} empresas</h2>
      <p class="tenue peq">Se reparten a partes iguales. Luego lo ajustas.</p>
    </div>

    <div class="atajos">
      <button class="btn" type="button" onclick={ejemplo}><Ico n="chispa" />Empezar con una de ejemplo</button>
      <details class="pegar">
        <summary class="btn"><Ico n="lista" />Pegar una lista</summary>
        <div class="pila caja">
          <label for="lista" class="peq"><b>Tickers y pesos</b>, separados por comas</label>
          <textarea id="lista" class="entrada area" rows="2" placeholder="NUBE 40, VITA 60" bind:value={texto}></textarea>
          <button class="btn btn-primario" type="button" onclick={usarLista} disabled={!texto.trim()}>Usar esta lista</button>
          <div aria-live="polite" class="pila">
            {#if avisoLista}<p class="peq">{avisoLista}</p>{/if}
            {#if desconocidos.length}<p class="error">No encuentro en el catálogo: {desconocidos.join(', ')}.</p>{/if}
          </div>
        </div>
      </details>
    </div>

    <ConstruyeFiltros bind:sector bind:pais />
    {@render rejilla(false)}
  </section>

  <section class="bandeja cristal" aria-labelledby="bj-t">
    <div class="fila entre">
      <h2 id="bj-t" class="eti">Tu cartera</h2>
      <span class="peq" aria-live="polite"><b>{elegidas.length}</b> de {pesosLista ? elegidas.length : MAX_CREAR}{faltan ? ` · faltan ${faltan}` : ''}</span>
    </div>
    <div class="previa">
      <Anillo {posiciones} tam={52} grosor={8}>
        <span class="mono mini">{elegidas.length ? fmtPct(suma) : '—'}</span>
      </Anillo>
      {#if !elegidas.length}
        <p class="tenue peq">Toca empresas en la lista para añadirlas.</p>
      {:else}
        <ul class="elegidas">
          {#each posiciones as p (p.ticker)}
            <li>
              <b style="--c:{COLOR_SECTOR[empresa(p.ticker)!.sector]}">{p.ticker}</b><span class="peso">{fmtPct(p.decimas)}</span>
              <button class="x" type="button" aria-label="Quitar {empresa(p.ticker)!.nombre}" onclick={() => quitar(p.ticker)}><Ico n="no" tam={14} /></button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="final">
      <label for="nombre" class="sr">Nombre de la cartera</label>
      <input id="nombre" class="entrada" maxlength="40" placeholder="Nombre" bind:value={nombre} autocomplete="off" />
      <button class="btn btn-primario encender" type="button" disabled={!listo || ocupado} onclick={encender}>
        <Ico n="chispa" />{ocupado ? 'Encendiendo…' : 'Encender mi cartera'}
      </button>
    </div>
    {#if mia}
      <label class="check"><input type="checkbox" bind:checked={hacerPrincipal} /> Que sea mi cartera principal</label>
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
  </section>
{/if}

{#snippet rejilla(edicion: boolean)}
  {#if !visibles.length}
    <div class="tarjeta vacio"><p>No hay empresas con esos filtros.</p><button class="btn" type="button" onclick={() => { sector = ''; pais = ''; }}>Quitar filtros</button></div>
  {:else}
    <p class="tenue peq" aria-live="polite">{visibles.length} empresas · datos de ejemplo</p>
    <ul class="rejilla">
      {#each visibles as e (e.ticker)}
        {@const on = edicion ? enMia(e.ticker) : elegidas.includes(e.ticker)}
        <li>
          <button class="emp" type="button" aria-pressed={on} disabled={edicion && !!guardando}
            aria-label="{e.nombre}, {e.ticker}, {e.sector}, {e.pais}. {textoHuella(e.huella)}." onclick={() => (edicion ? editar(e.ticker) : alternar(e.ticker))}>
            <HuellaFlor huella={e.huella} tamano="mini" />
            <span class="txt">
              <span class="n">{e.nombre}</span>
              <span class="d"><span class="mono">{e.ticker}</span> · <span class="punto" style="color:{COLOR_SECTOR[e.sector]}"></span> {e.sector} · {e.pais}</span>
            </span>
            <span class="marca" aria-hidden="true">{#if guardando === e.ticker}…{:else if on}<Ico n="ok" tam={14} />{:else}<Ico n="mas" tam={14} />{/if}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<style>
  .modo { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .modo button { min-height: 44px; border-radius: var(--r-pildora); border: 1px solid var(--linea); background: var(--blanco); font-weight: 600; font-size: var(--t-s); cursor: pointer; padding: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .modo button[aria-pressed="true"] { background: var(--noche); color: var(--perla); border-color: var(--noche); }

  .paso h2 { font-size: var(--t-xl); font-weight: 450; }
  .atajos { display: flex; flex-wrap: wrap; gap: var(--s2); align-items: flex-start; }
  .pegar { flex: 1 1 100%; }
  .pegar summary { list-style: none; width: max-content; }
  .pegar summary::-webkit-details-marker { display: none; }
  .pegar[open] summary { background: var(--lila-f); color: var(--lila-t); border-color: transparent; }
  .caja { margin-top: var(--s2); padding: var(--s3); border-radius: var(--r); background: var(--perla-hi); border: 1px solid var(--linea); }
  .area { padding: 12px var(--s4); resize: vertical; min-height: 64px; font-family: var(--f-mono); }

  .rejilla { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); gap: var(--s2); }
  .emp { width: 100%; min-height: 56px; display: grid; grid-template-columns: 34px 1fr 26px; align-items: center; gap: 10px; padding: 8px 10px; text-align: left; border-radius: var(--r); border: 1px solid var(--linea); background: var(--blanco); cursor: pointer; transition: transform var(--rapido) var(--muelle); }
  .emp:active { transform: scale(.98); }
  .emp[aria-pressed="true"] { border-color: var(--lila); box-shadow: inset 0 0 0 1px var(--lila); background: color-mix(in srgb, var(--lila-f) 55%, var(--blanco)); }
  .emp:disabled { cursor: progress; }
  .txt { display: grid; gap: 2px; min-width: 0; }
  .n { font-weight: 650; font-size: var(--t-s); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .d { font-size: var(--t-xs); color: var(--noche-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .d .punto { width: 7px; height: 7px; vertical-align: 1px; }
  .marca { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; border: 1px solid var(--linea-2); color: var(--noche-3); }
  .emp[aria-pressed="true"] .marca { background: var(--noche); border-color: var(--noche); color: var(--perla); }
  .vacio { display: grid; gap: var(--s2); justify-items: start; }

  .bandeja { position: sticky; bottom: calc(var(--barra) + var(--s4) + env(safe-area-inset-bottom)); z-index: 5; padding: var(--s3) var(--s4); display: grid; gap: var(--s2); }
  .previa { display: flex; gap: var(--s3); align-items: center; }
  .elegidas { flex: 1; list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }
  .elegidas li { display: inline-flex; align-items: center; gap: 4px; padding: 0 0 0 8px; letter-spacing: 0; border-radius: var(--r-pildora); background: var(--blanco); border: 1px solid var(--linea); font-size: var(--t-xs); font-weight: 600; }
  .peso { color: var(--noche-3); }
  .x { position: relative; width: 24px; height: 32px; border: 0; background: transparent; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: var(--noche-2); }
  .x::after { content: ""; position: absolute; inset: -8px; }
  .elegidas li { position: relative; }
  .elegidas li { font-variant-numeric: tabular-nums; }
  .elegidas b { box-shadow: inset 0 -2px 0 var(--c); }
  .final { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s2); }
  .final .entrada { min-width: 0; width: 100%; }
  .encender { min-height: 48px; }
  .mini { font-size: 10px; letter-spacing: 0; }
  .check { display: flex; align-items: center; gap: var(--s2); min-height: 44px; margin: -6px 0 -8px; font-size: var(--t-s); font-weight: 600; cursor: pointer; }
  .check input { width: 20px; height: 20px; accent-color: var(--lila-t); }
  .chispa { color: var(--cobre); }

  .actuales { list-style: none; margin: 0; padding: 0; display: grid; }
  .actuales li { display: grid; grid-template-columns: 10px 3.4rem 1fr auto 44px; align-items: center; gap: 8px; min-height: 48px; border-bottom: 1px solid var(--linea); font-size: var(--t-s); }
  .actuales li:last-child { border-bottom: 0; }
  .actuales .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .tk { font-weight: 600; }

  .encendida { position: fixed; inset: 0; z-index: 40; display: grid; place-content: center; justify-items: center; gap: var(--s3); padding: var(--s5); text-align: center; background: var(--perla); animation: aparece var(--medio-t) var(--suave) backwards; }
  .encendida h2 { font-size: var(--t-xl); font-weight: 450; }
  @keyframes aparece { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .encendida { animation: none; } .emp { transition: none; } }
</style>

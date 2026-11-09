<script lang="ts">
  // Mi cartera › Reparto: retrato (anillo arrastrable + radar + fantasma), semáforos, «Probar un peso», posiciones y señales.
  import { analizar, fijarPeso, fmtPct, pista, TOTAL, type Analisis } from '../../lib/dominio/cartera';
  import { sumarDias } from '../../lib/dominio/liga';
  import type { Cartera, Foto, Posicion } from '../../lib/dominio/tipos';
  import Retrato from '../../componentes/cartera/Retrato.svelte';
  import Semaforos from '../../componentes/cartera/Semaforos.svelte';
  import ListaPosiciones from '../../componentes/cartera/ListaPosiciones.svelte';
  import Senales from '../../componentes/cartera/Senales.svelte';
  import { colorSector, fraseEstado, puntosEquilibrio, sectorDe } from '../../componentes/cartera/util';

  let {
    cartera, posiciones, base, a, borrador, fotos, errorFotos, lunes, cuenta, proximoLunes, guardando,
    onProbar, onQuedarmelo, onReintentar,
  }: {
    cartera: Cartera; posiciones: Posicion[]; base: Posicion[]; a: Analisis; borrador: Posicion[] | null; fotos: Foto[] | null; errorFotos: string;
    lunes: string; cuenta: string; proximoLunes: string; guardando: boolean;
    onProbar: (p: Posicion[] | null) => void; onQuedarmelo: () => void; onReintentar: () => void;
  } = $props();

  // ── Fantasma ──
  const ANTIG = [1, 4, 8];
  const fotoDe = (k: number) => fotos?.find(f => f.semana === sumarDias(lunes, -7 * k)) || null;
  let antiguedad = $state(4);
  $effect(() => { if (fotos && !fotoDe(antiguedad)) { const hay = [4, 1, 8].find(k => fotoDe(k)); if (hay) antiguedad = hay; } });
  const fFantasma = $derived(fotoDe(antiguedad));
  const aFantasma = $derived(fFantasma ? analizar(fFantasma.posiciones) : null);
  const semanasTxt = (k: number) => `${k} ${k === 1 ? 'semana' : 'semanas'}`;

  // ── Edición ──
  let seleccionado = $state<string | null>(null);
  $effect(() => { if (seleccionado && !posiciones.some(p => p.ticker === seleccionado)) seleccionado = null; });
  const cambiar = (p: Posicion[]) => onProbar(p);
  function pasoPeso(ticker: string, delta: number) {
    const p = posiciones.find(x => x.ticker === ticker); if (!p || posiciones.length < 2) return;
    const otros = posiciones.filter(x => x.ticker !== ticker), resto = otros.reduce((s, x) => s + x.decimas, 0), menor = Math.min(...otros.map(x => x.decimas));
    const max = resto ? TOTAL - Math.ceil((10 * resto) / Math.max(1, menor)) : TOTAL;
    const objetivo = Math.max(10, Math.min(max, Math.round((p.decimas + delta) / 10) * 10));
    if (objetivo !== p.decimas) onProbar(a.completa ? fijarPeso(posiciones, ticker, objetivo) : posiciones.map(x => (x.ticker === ticker ? { ...x, decimas: Math.min(objetivo, x.decimas + (TOTAL - a.suma)) } : x)));
  }
  function quitar(ticker: string) {
    const quedan = posiciones.filter(p => p.ticker !== ticker);
    onProbar(quedan.length && a.completa ? fijarPeso(posiciones, ticker, 0).filter(p => p.decimas > 0) : quedan);
  }
  const p = $derived(pista(posiciones));
  function probarPista() { if (p) { seleccionado = p.ticker; onProbar(fijarPeso(posiciones, p.ticker, p.decimas)); } }
  function completar() { // reparte lo que falta en proporción a los pesos actuales
    const s = a.suma; if (!s) return; let acc = 0;
    const out = posiciones.map(x => { const d = Math.floor((x.decimas * TOTAL) / s); acc += d; return { ...x, decimas: d }; });
    out.sort((x, y) => y.decimas - x.decimas)[0].decimas += TOTAL - acc; onProbar(out);
  }

  // ── Antes → después ──
  const aBase = $derived(analizar(base));
  const ptsAntes = $derived(puntosEquilibrio(aBase)), ptsDespues = $derived(puntosEquilibrio(a));
  const sel = $derived(posiciones.find(x => x.ticker === seleccionado) || null);
  const selAntes = $derived(base.find(x => x.ticker === seleccionado) || null);
</script>

{#if !a.n && !borrador}
  <section class="cristal tarjeta-v" aria-labelledby="rp-vacia">
    <span class="eti">Tu retrato</span>
    <h2 id="rp-vacia">Esta cartera está vacía</h2>
    <p class="tenue">Añade de 3 a 5 empresas para ver su retrato.</p>
    <a class="btn btn-primario" href="#/construye/crear">Ir a Construye</a>
  </section>
{:else}
  <section class="cristal retrato-c" aria-labelledby="rp-titulo">
    <div class="fila entre arriba">
      <span class="eti">Tu retrato</span>
      <span class="reloj"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>Foto del lunes en {cuenta}</span>
    </div>
    <h2 id="rp-titulo" class="titulo" aria-live="polite">{fraseEstado(a)}</h2>

    <div class="leyenda">
      <div class="claves" aria-hidden="true">
        <span><i class="l-hoy"></i>{borrador ? 'Prueba' : 'Hoy'}</span>
        {#if fFantasma}<span><i class="l-fan" class:viejo={antiguedad >= 8}></i>Fantasma</span>{/if}
      </div>
      <div class="antig" role="group" aria-label="Fantasma: cartera de hace…">
        {#each ANTIG as k}
          <button type="button" aria-pressed={antiguedad === k} disabled={!!fotos && !fotoDe(k)} onclick={() => (antiguedad = k)} aria-label="Hace {semanasTxt(k)}">{k} s</button>
        {/each}
      </div>
    </div>

    <Retrato {posiciones} fantasma={fFantasma?.posiciones || null} {antiguedad} interactivo bind:seleccionado onCambiar={cambiar} etiqueta="Anillo de pesos de {cartera.nombre}" />

    {#if sel}
      <div class="ajuste" role="group" aria-label="Peso de {sel.ticker}">
        <span class="punto" style="color: {colorSector(sectorDe(sel.ticker))}"></span>
        <span class="mono">{sel.ticker}</span>
        <span class="tenue peq">{selAntes && selAntes.decimas !== sel.decimas ? `${fmtPct(selAntes.decimas)} → ` : ''}</span>
        <span class="num valor" aria-live="polite">{fmtPct(sel.decimas)}</span>
        <button class="btn btn-icono" onclick={() => pasoPeso(sel.ticker, -10)} aria-label="Bajar {sel.ticker} un 1 %" disabled={posiciones.length < 2}>−</button>
        <button class="btn btn-icono" onclick={() => pasoPeso(sel.ticker, 10)} aria-label="Subir {sel.ticker} un 1 %" disabled={posiciones.length < 2}>+</button>
      </div>
    {:else if posiciones.length > 1}
      <p class="tenue peq centro">Toca un color y arrastra para probar otro peso.</p>
    {/if}

    {#if errorFotos}
      <p class="error" role="alert">No he podido cargar tus fotos: {errorFotos} <button class="btn btn-fantasma" onclick={onReintentar}>Reintentar</button></p>
    {:else if !fotos}
      <p class="frase tenue" aria-busy="true">Buscando tus fotos de los lunes…</p>
    {:else if !fotos.length}
      <p class="frase">Tu primera foto será el lunes {proximoLunes}: entonces aparecerá tu fantasma.</p>
    {:else if aFantasma?.mayor && a.mayor}
      <p class="frase">Hace {semanasTxt(antiguedad)} tu mayor posición pesaba el <b>{fmtPct(aFantasma.mayor.decimas)}</b>; {borrador ? 'con la prueba' : 'hoy'}, el <b>{fmtPct(a.mayor.decimas)}</b>.</p>
    {:else}
      <p class="frase">Aún no hay foto de hace {semanasTxt(antiguedad)}.</p>
    {/if}
  </section>

  <Semaforos {a} {posiciones} />

  {#if borrador}
    <section class="cristal prueba" aria-labelledby="rp-prueba" aria-live="polite">
      <span class="eti lila">Probando un peso</span>
      <h2 id="rp-prueba" class="sr">Antes y después</h2>
      <Semaforos a={a} {posiciones} antes={aBase} compacto />
      <p class="puntos">
        Equilibrio en la Liga:
        <span class="num">{ptsAntes.puntos}</span> <span aria-hidden="true">→</span><span class="sr">pasaría a</span> <b class="num">{ptsDespues.puntos}</b> de 50
        {#if !ptsDespues.valida}<span class="tenue">({ptsDespues.motivo})</span>{/if}
      </p>
      <p class="tenue peq">Solo cuenta lo que tengas el lunes a las 00:00.</p>
      <div class="acciones">
        <button class="btn" onclick={() => onProbar(null)} disabled={guardando}>Deshacer</button>
        <button class="btn btn-primario" onclick={onQuedarmelo} disabled={guardando}>{guardando ? 'Guardando…' : 'Quedármelo'}</button>
      </div>
    </section>
  {:else if p}
    <section class="cristal pista" aria-labelledby="rp-pista">
      <div class="pista-txt">
        <span class="eti lila">Pista de Klever</span>
        <p id="rp-pista" class="q">{p.texto}</p>
      </div>
      <button class="btn btn-primario" onclick={probarPista}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></svg>Probar un peso
      </button>
    </section>
  {/if}

  {#if !a.completa && a.n}
    <section class="tarjeta incompleta" aria-labelledby="rp-inc">
      <h2 id="rp-inc">Repartido: {fmtPct(a.suma)}</h2>
      <p class="tenue peq">Para contar en la Liga, tiene que sumar el 100 %.</p>
      <div class="acciones">
        <button class="btn" onclick={completar}>Repartir lo que falta</button>
        <a class="btn btn-fantasma" href="#/construye/crear">Ir a Construye</a>
      </div>
    </section>
  {/if}

  <section class="pila" aria-labelledby="rp-pos">
    <div class="fila entre"><h2 id="rp-pos" class="eti">Posiciones · {a.n}</h2><span class="tenue peq">Desliza a la izquierda para quitar</span></div>
    <ListaPosiciones {posiciones} {base} bind:seleccionado onPaso={pasoPeso} onQuitar={quitar} />
    {#if a.n < 4}<a class="btn btn-ancho" href="#/construye/crear">Añadir empresas en Construye</a>{/if}
  </section>

  <section class="pila" aria-labelledby="rp-sen">
    <h2 id="rp-sen" class="eti">Señales</h2>
    <Senales senales={a.senales} />
  </section>
{/if}

<style>
  .retrato-c { padding: var(--s4) var(--s4) var(--s3); display: grid; gap: var(--s2); }
  .tarjeta-v { padding: var(--s5) var(--s4); display: grid; gap: var(--s3); justify-items: start; }
  .arriba { flex-wrap: nowrap; }
  .reloj { display: inline-flex; align-items: center; gap: 5px; font-size: var(--t-xs); font-weight: 650; color: var(--cobre-t); white-space: nowrap; }
  .reloj svg, .pista svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .titulo { font-size: 1.3rem; font-weight: 440; }
  .leyenda { display: flex; justify-content: space-between; align-items: center; gap: var(--s2); }
  .claves { display: grid; gap: 4px; font-size: var(--t-s); font-weight: 600; color: var(--noche-2); }
  .claves span { display: flex; align-items: center; gap: 6px; }
  .claves i { display: inline-block; width: 18px; border-top: 2.5px solid var(--lila); border-radius: 2px; }
  .claves i.l-fan { border-top: 2px dashed var(--cobre); }
  .claves i.l-fan.viejo { border-top-color: var(--alto); }
  .antig { display: flex; gap: 4px; }
  .antig button { min-width: 44px; min-height: 44px; padding: 0 8px; border-radius: var(--r-pildora); border: 1px solid var(--linea); background: transparent; color: var(--noche-2); font-weight: 650; font-size: var(--t-s); cursor: pointer; }
  .antig button[aria-pressed="true"] { background: var(--cobre-f); color: var(--cobre-t); border-color: transparent; }
  .antig button:disabled { opacity: .45; cursor: not-allowed; }
  .ajuste { display: flex; align-items: center; justify-content: center; gap: var(--s2); }
  .ajuste .valor { font-size: var(--t-l); min-width: 4.2ch; text-align: center; }
  .ajuste .btn-icono { font-size: 1.3rem; }
  .centro { text-align: center; }
  .frase { font-family: var(--f-disp); font-style: italic; font-variation-settings: "SOFT" 100, "opsz" 18; font-size: 1.02rem; line-height: 1.38; }
  .frase b { font-style: normal; font-weight: 560; }
  .error { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; }
  .lila { color: var(--lila-t); }
  .pista { padding: var(--s3) var(--s3) var(--s3) var(--s4); display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
  .pista-txt { flex: 1 1 150px; display: grid; gap: 4px; }
  .q { font-family: var(--f-disp); font-variation-settings: "SOFT" 100, "opsz" 30; font-size: 1.08rem; line-height: 1.2; }
  .prueba { padding: var(--s4); display: grid; gap: var(--s3); }
  .puntos { font-size: var(--t-s); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
  .puntos .num { font-size: var(--t-l); }
  .acciones { display: flex; gap: var(--s2); flex-wrap: wrap; }
  .acciones .btn { flex: 1 1 140px; }
  .incompleta { display: grid; gap: var(--s2); }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
</style>

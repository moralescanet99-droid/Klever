<script lang="ts">
  // Resumen de temporada tipo «Wrapped»: 6 historias a pantalla completa + tarjeta final para compartir (SIN importes).
  // Se pasan tocando (mitad izquierda/derecha), con los botones o con las flechas; Esc cierra; el foco queda atrapado en el diálogo.
  import { onMount, onDestroy, tick } from 'svelte';
  import { api } from '../../lib/api';
  import type { ResumenTemporada } from '../../lib/dominio/tipos';
  import { SECTORES } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import { mensaje } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import Semanas from '../../componentes/liga/Semanas.svelte';
  import { compartir } from '../../componentes/liga/util';

  let { id }: { id: number } = $props();
  let r = $state<ResumenTemporada | null>(null), error = $state(''), cargando = $state(true);
  let i = $state(0), dir = $state(1), estadoCompartir = $state('');
  let dialogo = $state<HTMLElement>(), btnSig = $state<HTMLButtonElement>();
  const TOTAL_H = 7; // 6 historias + tarjeta final

  const jugadas = $derived(r ? r.semanas.length : 0);
  const sigue = $derived(!!r && !r.insignia && jugadas < 12);
  const retos = $derived(r ? r.semanas.map(s => s.aprendizaje >= 20) : []);
  const INSIGNIA = { oro: 'Oro', plata: 'Plata', bronce: 'Bronce', completada: 'Completada' } as const;
  const INSIGNIA_TXT = { oro: 'Entre el 10 % mejor de tu liga.', plata: 'Entre el 25 % mejor de tu liga.', bronce: 'En la mitad alta de tu liga.', completada: 'Has jugado la temporada entera.' } as const;
  const textoCompartir = $derived(r ? `Mi ${r.temporada.nombre} en Klever («${r.ligaNombre}»): ${r.puesto}.º de ${r.participantes}, ${r.total} puntos, ${r.semanasBajas} ${r.semanasBajas === 1 ? 'semana' : 'semanas'} con concentración baja, racha de ${r.mejorRacha}, ${r.retosHechos} ${r.retosHechos === 1 ? 'reto' : 'retos'} y hasta ${r.sectoresMax} sectores. Simulación, sin dinero real.` : '');

  async function cargar() {
    cargando = true; error = '';
    try { r = await api.resumen(id); } catch (e) { error = mensaje(e); } finally { cargando = false; }
    await tick(); (btnSig ?? dialogo?.querySelector<HTMLElement>('button, a'))?.focus();
  }
  let overflowAntes = '';
  onMount(() => { overflowAntes = document.body.style.overflow; document.body.style.overflow = 'hidden'; cargar(); });
  onDestroy(() => { document.body.style.overflow = overflowAntes; });

  const cerrar = () => ir(`/liga/${id}`);
  function ir_a(n: number) { if (n < 0 || n >= TOTAL_H) return; dir = n > i ? 1 : -1; i = n; estadoCompartir = ''; }
  function tecla(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); ir_a(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir_a(i - 1); }
    else if (e.key === 'Tab' && dialogo) {
      const f = [...dialogo.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), a[href], [tabindex="0"]')];
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || !dialogo.contains(document.activeElement))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && (document.activeElement === z || !dialogo.contains(document.activeElement))) { e.preventDefault(); a.focus(); }
    }
  }
  async function compartirla() {
    const res = await compartir({ title: 'Mi temporada en Klever', text: textoCompartir });
    estadoCompartir = res === 'compartido' ? 'Compartido' : res === 'copiado' ? 'Texto copiado: pégalo donde quieras' : res === 'cancelado' ? '' : 'No he podido compartir.';
  }
  const FONDOS = [
    'linear-gradient(160deg, var(--cobre-f), var(--lila-f) 70%)',
    'linear-gradient(160deg, var(--agua-f), var(--perla-hi) 75%)',
    'linear-gradient(160deg, var(--lila-f), var(--agua-f) 80%)',
    'linear-gradient(160deg, var(--medio-f), var(--cobre-f) 80%)',
    'linear-gradient(160deg, var(--perla-hi), var(--lila-f) 80%)',
    'linear-gradient(160deg, var(--cobre-f), var(--agua-f) 80%)',
    'linear-gradient(160deg, var(--lila-f), var(--cobre-f) 50%, var(--agua-f))',
  ];
</script>

<svelte:window onkeydown={tecla} />

<div class="velo" style="background:{FONDOS[i]}">
  <div class="dialogo" bind:this={dialogo} role="dialog" aria-modal="true" aria-label="Resumen de temporada">
    <div class="arriba">
      <ol class="progreso" aria-label="Historia {i + 1} de {TOTAL_H}">
        {#each Array(TOTAL_H) as _, k}<li class:on={k <= i} aria-hidden="true"></li>{/each}
      </ol>
      <div class="fila entre">
        <span class="eti">{r ? `${r.temporada.nombre} · ${r.ligaNombre}` : 'Resumen de temporada'}</span>
        <button class="btn btn-icono cerrar" onclick={cerrar} aria-label="Cerrar el resumen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>

    <div class="escena">
      {#if cargando}
        <p class="tenue" aria-busy="true">Preparando tu temporada…</p>
      {:else if error || !r}
        <div class="pila centro" role="alert"><p class="error">{error || 'No hay datos.'}</p><button class="btn" onclick={cargar}>Reintentar</button></div>
      {:else}
        <button class="zona izq" tabindex="-1" aria-hidden="true" onclick={() => ir_a(i - 1)}></button>
        <button class="zona der" tabindex="-1" aria-hidden="true" onclick={() => ir_a(i + 1)}></button>
        {#key i}
          <section class="historia" style="--dx:{dir * 28}px" aria-live="polite" aria-atomic="true">
            {#if i === 0}
              <p class="ante">Tu temporada</p>
              <p class="enorme num">{r.total}</p>
              <p class="tras">puntos · <b>{r.puesto}.º de {r.participantes}</b></p>
              <div class="grafico"><Semanas semanas={r.semanas} actual={sigue ? jugadas : 0} /></div>
            {:else if i === 1}
              <p class="ante">Semanas con concentración baja</p>
              <p class="enorme num">{r.semanasBajas}</p>
              <p class="tras">de {jugadas} {jugadas === 1 ? 'semana jugada' : 'semanas jugadas'}</p>
              <ol class="puntos" aria-label="Semanas con concentración baja">
                {#each Array(12) as _, k}{@const s = r.semanas[k]}<li class:si={s?.bajas === 1} class:futura={!s} title="Semana {k + 1}"><span class="sr">Semana {k + 1}: {!s ? 'por jugar' : s.bajas ? 'baja' : 'no'}</span></li>{/each}
              </ol>
            {:else if i === 2}
              <p class="ante">Tu mejor racha</p>
              <p class="enorme num">{r.mejorRacha}</p>
              <p class="tras">{r.mejorRacha === 1 ? 'semana' : 'semanas seguidas'} entrando a cuidar tu cartera</p>
              <div class="racha" aria-hidden="true">{#each Array(12) as _, k}<i class:on={k < r.mejorRacha}></i>{/each}</div>
            {:else if i === 3}
              <p class="ante">Retos de la semana</p>
              <p class="enorme num">{r.retosHechos}</p>
              <p class="tras">{r.retosHechos === 1 ? 'reto hecho' : 'retos hechos'} de {jugadas}</p>
              <ol class="puntos cuadros" aria-label="Retos por semana">
                {#each Array(12) as _, k}<li class:si={retos[k]} class:futura={k >= jugadas}><span class="sr">Semana {k + 1}: {k >= jugadas ? 'por jugar' : retos[k] ? 'hecho' : 'no'}</span></li>{/each}
              </ol>
            {:else if i === 4}
              <p class="ante">Máximo de sectores a la vez</p>
              <p class="enorme num">{r.sectoresMax}</p>
              <p class="tras">de {SECTORES.length} sectores posibles</p>
              <div class="sectores" aria-hidden="true">{#each SECTORES as s, k}<i style="background:{k < r.sectoresMax ? COLOR_SECTOR[s] : 'var(--linea-2)'}"></i>{/each}</div>
            {:else if i === 5}
              {#if r.insignia}
                <p class="ante">Tu insignia</p>
                <div class="insignia {r.insignia}" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="26" r="18" /><path d="M22 40l-4 18 14-7 14 7-4-18" /></svg></div>
                <p class="grande">{INSIGNIA[r.insignia]}</p>
                <p class="tras">{INSIGNIA_TXT[r.insignia]}</p>
              {:else}
                <p class="ante">La temporada sigue</p>
                <p class="enorme num">{12 - jugadas}</p>
                <p class="tras">{12 - jugadas === 1 ? 'semana' : 'semanas'} por jugar. La insignia llega al final.</p>
              {/if}
            {:else}
              <p class="ante">Para compartir</p>
              <div class="postal cristal">
                <p class="eti">Klever · {r.temporada.nombre}</p>
                <p class="p-nom">{r.ligaNombre}</p>
                <dl>
                  <div><dt>Puesto</dt><dd class="num">{r.puesto}.º<small>/{r.participantes}</small></dd></div>
                  <div><dt>Puntos</dt><dd class="num">{r.total}</dd></div>
                  <div><dt>Conc. baja</dt><dd class="num">{r.semanasBajas}<small> sem.</small></dd></div>
                  <div><dt>Racha</dt><dd class="num">{r.mejorRacha}</dd></div>
                  <div><dt>Retos</dt><dd class="num">{r.retosHechos}</dd></div>
                  <div><dt>Sectores</dt><dd class="num">{r.sectoresMax}</dd></div>
                </dl>
                {#if r.insignia}<p class="chip">Insignia: {INSIGNIA[r.insignia]}</p>{:else}<p class="chip">La temporada sigue</p>{/if}
                <p class="tenue pie">Simulación · sin dinero real</p>
              </div>
              <div class="acciones-f">
                <button class="btn btn-primario" onclick={compartirla}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>Compartir
                </button>
                <button class="btn" onclick={cerrar}>Volver a la liga</button>
              </div>
              <p class="estado" role="status">{estadoCompartir}</p>
            {/if}
          </section>
        {/key}
      {/if}
    </div>

    <div class="abajo">
      <div class="nav">
        <button class="btn btn-icono" onclick={() => ir_a(i - 1)} disabled={i === 0 || !r} aria-label="Historia anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
        <span class="mono cuenta" aria-hidden="true">{i + 1} / {TOTAL_H}</span>
        <button class="btn btn-icono" bind:this={btnSig} onclick={() => ir_a(i + 1)} disabled={i === TOTAL_H - 1 || !r} aria-label="Historia siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <p class="sello"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l5.5 2v4.2c0 3.3-2.3 5.9-5.5 6.8-3.2-.9-5.5-3.5-5.5-6.8V3.5z"/></svg>Simulación · sin dinero real · no es consejo</p>
    </div>
  </div>
</div>

<style>
  .velo { position: fixed; inset: 0; z-index: 40; background-color: var(--perla) !important; display: grid; }
  .dialogo { position: relative; max-width: var(--ancho); width: 100%; margin: 0 auto; height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; padding: calc(var(--s3) + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) calc(var(--s3) + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
  .arriba { display: grid; gap: var(--s2); position: relative; z-index: 2; }
  .progreso { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .progreso li { height: 4px; border-radius: 2px; background: var(--linea-2); }
  .progreso li.on { background: var(--noche); }
  .cerrar svg, .nav svg, .acciones-f svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
  .escena { position: relative; display: grid; align-items: center; min-height: 0; overflow: hidden; }
  .zona { position: absolute; top: 0; bottom: 0; z-index: 0; border: 0; background: transparent; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .zona.izq { left: 0; width: 35%; } .zona.der { right: 0; width: 65%; }
  .historia { position: relative; z-index: 1; pointer-events: none; display: grid; gap: var(--s3); justify-items: center; text-align: center; padding: var(--s4) 0; animation: entra var(--medio-t) var(--suave) both; }
  .historia :global(button), .historia :global(a), .historia .postal { pointer-events: auto; }
  @keyframes entra { from { opacity: 0; transform: translateX(var(--dx)); } to { opacity: 1; transform: none; } }
  .ante { font-weight: 700; font-size: var(--t-m); color: var(--noche-2); text-transform: uppercase; letter-spacing: .08em; font-size: var(--t-s); }
  .enorme { font-size: clamp(5rem, 28vw, 8.5rem); line-height: .9; font-weight: 420; letter-spacing: -.04em; background: linear-gradient(120deg, var(--cobre-t), var(--lila-t) 60%, var(--agua-t)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .grande { font-family: var(--f-disp); font-size: var(--t-xxl); line-height: 1; }
  .tras { font-size: var(--t-l); color: var(--noche); max-width: 22ch; }
  .grafico { width: 100%; max-width: 380px; margin-top: var(--s3); padding: var(--s3); border-radius: var(--r-l); background: var(--cristal); }
  .puntos { list-style: none; margin: var(--s3) 0 0; padding: 0; display: grid; grid-template-columns: repeat(6, 28px); gap: 10px; }
  .puntos li { width: 28px; height: 28px; border-radius: 50%; box-shadow: inset 0 0 0 2px var(--agua); }
  .puntos li.si { background: var(--agua); }
  .puntos li.futura { box-shadow: inset 0 0 0 1.5px var(--linea-2); }
  .cuadros li { border-radius: 8px; box-shadow: inset 0 0 0 2px var(--cobre); }
  .cuadros li.si { background: var(--cobre); }
  .racha { display: flex; gap: 6px; margin-top: var(--s3); }
  .racha i { width: 16px; height: 40px; border-radius: 8px; background: var(--linea-2); }
  .racha i.on { background: linear-gradient(180deg, var(--cobre), var(--lila)); }
  .sectores { display: grid; grid-template-columns: repeat(4, 40px); gap: 8px; margin-top: var(--s3); }
  .sectores i { width: 40px; height: 40px; clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%); }
  .insignia svg { width: 120px; height: 120px; stroke-width: 3; }
  .insignia.oro svg { fill: var(--medio-f); stroke: var(--medio); }
  .insignia.plata svg { fill: var(--perla-hi); stroke: var(--noche-3); }
  .insignia.bronce svg { fill: var(--cobre-f); stroke: var(--cobre-t); }
  .insignia.completada svg { fill: var(--agua-f); stroke: var(--agua-t); }
  .postal { width: 100%; max-width: 340px; padding: var(--s5) var(--s4); display: grid; gap: var(--s3); justify-items: center; }
  .p-nom { font-family: var(--f-disp); font-size: var(--t-xl); line-height: 1.1; overflow-wrap: anywhere; }
  dl { margin: 0; width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s3) var(--s2); }
  dl div { display: grid; gap: 2px; }
  dt { font-size: var(--t-xs); font-weight: 700; color: var(--noche-3); text-transform: uppercase; letter-spacing: .06em; }
  dd { margin: 0; font-size: var(--t-xl); line-height: 1; }
  dd small { font-size: .5em; color: var(--noche-2); }
  .pie { font-size: var(--t-xs); }
  .acciones-f { display: flex; gap: var(--s2); flex-wrap: wrap; justify-content: center; }
  .estado { min-height: 1.4em; font-size: var(--t-s); font-weight: 600; color: var(--ok); }
  .abajo { display: grid; gap: var(--s2); position: relative; z-index: 2; }
  .nav { display: flex; align-items: center; justify-content: center; gap: var(--s4); }
  .cuenta { font-size: var(--t-s); color: var(--noche-2); min-width: 4ch; text-align: center; }
  .sello { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: var(--t-xs); font-weight: 600; color: var(--noche-3); }
  .sello svg { width: 13px; height: 13px; fill: none; stroke: var(--cobre); stroke-width: 1.6; }
  .centro { justify-items: center; }
</style>

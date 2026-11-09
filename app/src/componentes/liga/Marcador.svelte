<script lang="ts">
  // Marcador de «Tu temporada» (foto 03): puesto grande, total, puntos de la semana con desglose 50/30/20 a escala y las 12 semanas.
  // Sin puntos provisionales ni cuenta atrás (C63): los puntos salen de la foto del lunes.
  import type { DetalleLiga, Foto } from '../../lib/dominio/tipos';
  import { NIVEL_TXT } from '../../lib/dominio/cartera';
  import Semanas from './Semanas.svelte';
  import { diaCorto } from './util';
  let { detalle, foto = null }: { detalle: DetalleLiga; foto?: Foto | null } = $props();

  const yo = $derived(detalle.clasificacion.find(f => f.tu));
  const n = $derived(detalle.semanaActual);
  const enJuego = $derived(n >= 1 && n <= 12);
  const sem = $derived(enJuego ? detalle.mias[n - 1] : undefined);
  const P_TXT = { ok: 25, medio: 12, alto: 0 } as const;
  const subEq = $derived.by(() => {
    if (!sem) return '';
    if (!sem.valida) return 'no puntúa';
    if (!foto) return '';
    return `${NIVEL_TXT.concentracion[foto.concentracion].toLowerCase()} ${P_TXT[foto.concentracion]} + ${NIVEL_TXT.variedad[foto.variedad].toLowerCase()} ${P_TXT[foto.variedad]}`;
  });
  const subAp = $derived(!sem ? '' : sem.aprendizaje === 30 ? 'reto + revisión' : sem.aprendizaje === 20 ? 'falta revisar' : sem.aprendizaje === 10 ? 'falta el reto' : 'faltan reto y revisión');
  const subCo = $derived(!sem ? '' : sem.constancia ? `racha de ${sem.constancia >= 20 ? '6+' : 1 + (sem.constancia - 10) / 2}` : 'sin entrar');
  const partes = $derived(sem ? [
    { n: 'Equilibrio', v: sem.equilibrio, m: 50, sub: subEq, c: 'eq' },
    { n: 'Aprendizaje', v: sem.aprendizaje, m: 30, sub: subAp, c: 'ap' },
    { n: 'Constancia', v: sem.constancia, m: 20, sub: subCo, c: 'co' },
  ] : []);
</script>

<section class="marcador cristal" aria-labelledby="marc-t">
  <h2 id="marc-t" class="sr">Tu temporada</h2>
  <p class="linea">
    {#if enJuego}<b>Semana {n}</b> · foto del lunes {diaCorto(detalle.liga.temporada.semanas[n - 1])}
    {:else if n === 0}Empieza el lunes {diaCorto(detalle.liga.temporada.inicio)}
    {:else}<b>Temporada terminada</b>{/if}
  </p>
  <div class="puesto" aria-live="polite">
    <div class="izq">
      <span class="num grande">{yo?.puesto ?? '–'}.<span class="o">º</span></span>
      <span class="de">puesto de {detalle.clasificacion.length}<br><b class="num">{yo?.total ?? 0}</b> en total</span>
    </div>
    {#if sem}
      <div class="der">
        <span class="esta">esta<br>semana</span>
        <span class="num semana">{sem.total}</span>
      </div>
    {/if}
  </div>
  {#if sem}
    <div class="partes">
      {#each partes as p}
        <div class="parte">
          <div class="pista" role="meter" aria-label={p.n} aria-valuemin="0" aria-valuemax={p.m} aria-valuenow={p.v}><i class={p.c} style="width:{(p.v / p.m) * 100}%"></i></div>
          <span class="pn">{p.n}</span>
          <span class="mono pv">{p.v}/{p.m}</span>
          {#if p.sub}<span class="tenue psub">{p.sub}</span>{/if}
        </div>
      {/each}
    </div>
  {/if}
  <div class="doce">
    <Semanas semanas={detalle.mias} actual={n} />
  </div>
</section>

<style>
  .marcador { padding: var(--s4); display: grid; gap: var(--s3); }
  .linea { font-size: var(--t-s); color: var(--noche-2); }
  .linea b { color: var(--noche); }
  .puesto { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--s3); }
  .izq, .der { display: flex; align-items: flex-end; gap: 10px; }
  .grande { font-size: var(--t-num); line-height: .86; font-weight: 420; letter-spacing: -.03em; }
  .o { font-family: var(--f-txt); font-weight: 650; font-size: .36em; vertical-align: 1.2em; margin-left: -2px; }
  .de { font-size: var(--t-s); font-weight: 600; line-height: 1.25; color: var(--noche-2); }
  .de b { color: var(--noche); font-size: 1.05em; }
  .der { text-align: right; }
  .esta { font-size: var(--t-xs); font-weight: 650; line-height: 1.2; color: var(--lila-t); }
  .semana { font-size: 3rem; line-height: .86; font-weight: 440; background: linear-gradient(120deg, var(--cobre-t), var(--lila-t) 60%, var(--agua-t)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .partes { display: grid; grid-template-columns: 50fr 30fr 20fr; gap: var(--s2); margin-top: var(--s1); }
  .parte { display: grid; gap: 2px; align-content: start; min-width: 0; }
  .parte:last-child { text-align: right; }
  .pista { height: 12px; border-radius: 6px; background: var(--linea); overflow: hidden; }
  .pista i { display: block; height: 100%; border-radius: 6px; transform-origin: left; animation: crecer var(--lento) var(--suave) both; }
  .pista i.eq { background: linear-gradient(90deg, var(--lila-f), var(--lila)); }
  .pista i.ap { background: linear-gradient(90deg, var(--cobre-f), var(--cobre)); }
  .pista i.co { background: linear-gradient(90deg, var(--agua-f), var(--agua)); }
  .pn { margin-top: 4px; font-size: var(--t-xs); font-weight: 700; }
  .pv { font-size: var(--t-xs); }
  .psub { font-size: .72rem; line-height: 1.2; }
  .doce { border-top: 1px solid var(--linea); padding-top: var(--s3); }
  @keyframes crecer { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (max-width: 360px) { .grande { font-size: 2.8rem; } .semana { font-size: 2.5rem; } }
</style>

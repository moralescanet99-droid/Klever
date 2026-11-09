<script lang="ts">
  // Reglas de la liga y si MI cartera inscrita las cumple AHORA (incumplimientos() del dominio).
  import type { Posicion, ReglasLiga } from '../../lib/dominio/tipos';
  import { REGLAS_VACIAS } from '../../lib/dominio/tipos';
  import { incumplimientos } from '../../lib/dominio/liga';
  import { analizar, fmtPct } from '../../lib/dominio/cartera';
  import { REGLAS_INFO } from './util';
  let { reglas, posiciones = null, cambios = 0, carteraId = null }: { reglas: ReglasLiga; posiciones?: Posicion[] | null; cambios?: number; carteraId?: number | null } = $props();

  const ICONOS: Record<keyof ReglasLiga, string> = {
    maxPorEmpresa: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    minSectores: 'M12 2l8.66 5v10L12 22l-8.66-5V7zM12 8v8M8 12h8',
    maxCambiosSemana: 'M4 8h14l-4-4M20 16H6l4 4',
    maxPorPais: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  };
  const a = $derived(posiciones ? analizar(posiciones) : null);
  const filas = $derived(REGLAS_INFO.filter(i => reglas[i.clave] != null).map(i => {
    const v = reglas[i.clave]!;
    const fallos = posiciones ? incumplimientos(posiciones, { ...REGLAS_VACIAS, [i.clave]: v }, cambios) : [];
    let estado = '';
    if (a) {
      if (i.clave === 'maxPorEmpresa') estado = a.mayor ? `${a.mayor.ticker} pesa hoy el ${fmtPct(a.mayor.decimas)}` : 'Sin posiciones';
      else if (i.clave === 'minSectores') estado = `Tienes ${a.sectores.length}`;
      else if (i.clave === 'maxCambiosSemana') estado = `Llevas ${cambios} desde el lunes`;
      else estado = a.paises[0] && a.suma ? `${a.paises[0].clave}: ${Math.round(a.paises[0].decimas / a.suma * 100)} % de la sede` : 'Sin posiciones';
    }
    return { clave: i.clave, titulo: i.titulo(v), explica: i.explica, estado, cumple: !fallos.length };
  }));
</script>

<section class="reglas" aria-labelledby="reg-t">
  <h2 id="reg-t" class="eti">Reglas de la liga</h2>
  {#if !filas.length}
    <p class="tenue peq">Esta liga no tiene reglas extra: solo cuentan las de puntuación.</p>
  {:else}
    {#if !posiciones}<p class="tenue peq">Inscribe una cartera para ver si las cumples.</p>{/if}
    <ul>
      {#each filas as f (f.clave)}
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={ICONOS[f.clave]} /></svg></span>
          <span class="txt">
            <b>{f.titulo}</b>
            <span class="sub" class:mal={posiciones && !f.cumple}>{posiciones ? f.estado : f.explica}</span>
          </span>
          {#if posiciones}
            {#if f.cumple}<span class="pild fondo-ok"><i class="punto"></i>Cumples</span>
            {:else if carteraId}<a class="btn btn-primario ajustar" href="#/cartera?c={carteraId}">Ajustar<span class="sr"> la cartera para cumplir «{f.titulo}»</span></a>
            {:else}<span class="pild fondo-alto"><i class="punto"></i>No cumples</span>{/if}
          {/if}
        </li>
      {/each}
    </ul>
    {#if posiciones && filas.some(f => !f.cumple)}<p class="aviso-reglas" role="status">Si la foto del lunes incumple una regla, esa semana no suma Equilibrio.</p>{/if}
  {/if}
</section>

<style>
  .reglas { display: grid; gap: var(--s2); }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  ul { list-style: none; margin: 0; padding: 0; }
  li { display: grid; grid-template-columns: 34px 1fr auto; gap: var(--s3); align-items: center; min-height: 56px; padding: var(--s2) 0; border-top: 1px solid var(--linea); }
  li:first-child { border-top: 0; }
  .ico { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; background: var(--blanco); border: 1px solid var(--linea); }
  .ico svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
  .txt { display: grid; gap: 1px; min-width: 0; }
  .txt b { font-weight: 650; line-height: 1.2; }
  .sub { font-size: var(--t-s); color: var(--noche-2); }
  .sub.mal { color: var(--medio); font-weight: 650; }
  .pild { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--r-pildora); font-size: var(--t-s); font-weight: 650; white-space: nowrap; }
  .ajustar { min-height: 44px; }
  .aviso-reglas { font-size: var(--t-s); color: var(--medio); background: var(--medio-f); padding: var(--s2) var(--s3); border-radius: var(--r); }
</style>

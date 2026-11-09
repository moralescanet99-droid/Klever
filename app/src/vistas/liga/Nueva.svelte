<script lang="ts">
  // Crear liga: nombre, tipo (Clásica / Draft) y reglas configurables opcionales. Tras crear: código, copiar y compartir.
  import { api } from '../../lib/api';
  import type { Liga, ReglasLiga } from '../../lib/dominio/tipos';
  import { REGLAS_VACIAS } from '../../lib/dominio/tipos';
  import { avisar, mensaje } from '../../lib/estado/sesion.svelte';
  import Cabecera from '../../componentes/liga/Cabecera.svelte';
  import Invitar from '../../componentes/liga/Invitar.svelte';
  import { REGLAS_INFO } from '../../componentes/liga/util';

  let nombre = $state(''), tipo = $state<'clasica' | 'draft'>('clasica');
  let activas = $state<Record<keyof ReglasLiga, boolean>>({ maxPorEmpresa: false, minSectores: false, maxCambiosSemana: false, maxPorPais: false });
  let valores = $state<Record<keyof ReglasLiga, number>>(Object.fromEntries(REGLAS_INFO.map(i => [i.clave, i.defecto])) as Record<keyof ReglasLiga, number>);
  let enviando = $state(false), error = $state(''), creada = $state<Liga | null>(null), tocado = $state(false);
  const nombreOk = $derived(nombre.trim().length >= 3 && nombre.trim().length <= 40);

  const TIPOS = [
    { id: 'clasica', t: 'Clásica', d: 'Cada persona juega con su propia cartera.' },
    { id: 'draft', t: 'Draft', d: 'Se eligen por turnos 6 empresas por persona; cada una solo puede estar en una cartera de la liga.' },
  ] as const;

  function cambiarValor(clave: keyof ReglasLiga, delta: number) {
    const i = REGLAS_INFO.find(x => x.clave === clave)!; valores[clave] = Math.max(i.min, Math.min(i.max, (valores[clave] || 0) + delta));
  }
  async function crear(e: SubmitEvent) {
    e.preventDefault(); tocado = true; error = '';
    if (!nombreOk) return;
    const reglas: ReglasLiga = { ...REGLAS_VACIAS };
    for (const i of REGLAS_INFO) if (activas[i.clave]) reglas[i.clave] = valores[i.clave];
    enviando = true;
    try { creada = await api.crearLiga(nombre.trim(), tipo, reglas); avisar('Liga creada'); }
    catch (err) { error = mensaje(err); }
    finally { enviando = false; }
  }
</script>

<main class="pagina">
  <Cabecera>{#snippet contexto()}<b>{creada ? 'Liga creada' : 'Crear liga'}</b>{/snippet}</Cabecera>

  {#if creada}
    <section class="hecho cristal" aria-labelledby="hecho-t">
      <svg class="ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      <h2 id="hecho-t">«{creada.nombre}» está lista</h2>
      <p class="tenue peq">Comparte el código con quien quieras invitar.</p>
      <Invitar liga={creada} grande />
      <div class="fila sig">
        {#if creada.tipo === 'draft'}<a class="btn btn-primario" href="#/liga/{creada.id}/draft">Ir al draft</a>{/if}
        <a class="btn {creada.tipo === 'draft' ? '' : 'btn-primario'}" href="#/liga/{creada.id}">Ver la liga</a>
      </div>
    </section>
  {:else}
    <a class="volver" href="#/liga"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>La Liga</a>
    <form class="pila form" onsubmit={crear} novalidate>
      <div class="campo">
        <label for="liga-nombre">Nombre de la liga</label>
        <input id="liga-nombre" class="entrada" bind:value={nombre} maxlength="40" autocomplete="off" placeholder="Por ejemplo: Facultad Eco 25"
          aria-invalid={tocado && !nombreOk} aria-describedby="liga-nombre-ayuda" />
        <span id="liga-nombre-ayuda" class={tocado && !nombreOk ? 'error' : 'tenue peq'}>De 3 a 40 caracteres. Lo verán todas las personas de la liga.</span>
      </div>

      <fieldset class="tipos">
        <legend>Tipo de liga</legend>
        {#each TIPOS as t}
          <label class="tipo tarjeta" class:on={tipo === t.id}>
            <input type="radio" name="tipo" value={t.id} bind:group={tipo} />
            <span class="marca" aria-hidden="true"></span>
            <span><b>{t.t}</b><span class="tenue peq d">{t.d}</span></span>
          </label>
        {/each}
      </fieldset>

      <fieldset class="reglas">
        <legend>Reglas extra <span class="tenue">(opcionales)</span></legend>
        <p class="tenue peq">Si la foto del lunes incumple una regla, esa semana no suma Equilibrio.</p>
        {#each REGLAS_INFO as i (i.clave)}
          <div class="regla" class:on={activas[i.clave]}>
            <label class="sw">
              <input type="checkbox" bind:checked={activas[i.clave]} aria-describedby="exp-{i.clave}" />
              <span class="txt"><b>{i.titulo(valores[i.clave])}</b><span id="exp-{i.clave}" class="tenue peq">{i.explica}</span></span>
            </label>
            {#if activas[i.clave]}
              <div class="ajuste" role="group" aria-label="Valor de «{i.titulo(valores[i.clave])}»">
                <button type="button" class="btn btn-icono" onclick={() => cambiarValor(i.clave, i.unidad === '%' ? -5 : -1)} disabled={valores[i.clave] <= i.min} aria-label="Menos">−</button>
                <label class="sr" for="val-{i.clave}">Valor en {i.unidad}</label>
                <input id="val-{i.clave}" class="entrada val mono" type="number" inputmode="numeric" min={i.min} max={i.max} bind:value={valores[i.clave]}
                  onchange={() => cambiarValor(i.clave, 0)} />
                <span class="tenue peq">{i.unidad}</span>
                <button type="button" class="btn btn-icono" onclick={() => cambiarValor(i.clave, i.unidad === '%' ? 5 : 1)} disabled={valores[i.clave] >= i.max} aria-label="Más">+</button>
              </div>
            {/if}
          </div>
        {/each}
      </fieldset>

      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <button class="btn btn-primario btn-ancho" type="submit" disabled={enviando}>{enviando ? 'Creando…' : 'Crear liga'}</button>
      <p class="tenue nota">Liga privada de hasta 30 personas. Sin dinero real.</p>
    </form>
  {/if}
</main>

<style>
  .volver { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; font-weight: 600; text-decoration: none; justify-self: start; }
  .volver svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
  .form { gap: var(--s5); }
  fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: var(--s2); min-width: 0; }
  legend { font-weight: 700; margin-bottom: var(--s2); padding: 0; }
  .tipo { display: grid; grid-template-columns: 22px 1fr; gap: var(--s3); align-items: start; cursor: pointer; transition: border-color var(--rapido), transform var(--rapido) var(--muelle); }
  .tipo:active { transform: scale(.99); }
  .tipo.on { border-color: var(--lila); box-shadow: 0 0 0 1px var(--lila); }
  .tipo input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .tipo:has(input:focus-visible) { outline: 2px solid var(--foco); outline-offset: 2px; }
  .marca { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--linea-2); margin-top: 1px; display: grid; place-items: center; }
  .tipo.on .marca { border-color: var(--lila); background: radial-gradient(circle, var(--lila) 45%, transparent 50%); }
  .d { display: block; margin-top: 2px; }
  .regla { border: 1px solid var(--linea); border-radius: var(--r); background: var(--blanco); padding: var(--s3); display: grid; gap: var(--s3); }
  .regla.on { border-color: var(--lila); }
  .sw { display: grid; grid-template-columns: 24px 1fr; gap: var(--s3); align-items: start; cursor: pointer; min-height: 44px; }
  .sw input { width: 22px; height: 22px; margin: 1px 0 0; accent-color: var(--lila-t); }
  .txt { display: grid; gap: 2px; }
  .ajuste { display: flex; align-items: center; gap: var(--s2); padding-left: 36px; }
  .val { width: 76px; text-align: center; padding: 0 8px; }
  .btn-icono { font-size: 1.3rem; }
  .nota { font-size: var(--t-xs); text-align: center; }
  .hecho { padding: var(--s5) var(--s4); display: grid; gap: var(--s3); justify-items: center; text-align: center; }
  .ok { width: 44px; height: 44px; padding: 10px; border-radius: 50%; background: var(--ok-f); fill: none; stroke: var(--ok); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .sig { justify-content: center; margin-top: var(--s2); }
</style>

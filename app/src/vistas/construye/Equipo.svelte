<script lang="ts">
  // CARTERA EN EQUIPO · Próximamente (decisión de Javier, C63: aparece en la beta, pero aún no funciona).
  // Vista previa ESTÁTICA e inerte con un equipo inventado. El botón solo muestra un aviso: no guarda nada.
  import { avisar } from '../../lib/estado/sesion.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';

  const MIEMBROS = [
    { apodo: 'marea_baja', ini: 'mb', fondo: 'linear-gradient(135deg, var(--cobre-f), var(--lila-f), var(--agua-f))', tu: true, capi: false },
    { apodo: 'bruma', ini: 'BR', fondo: 'var(--lila-f)', tu: false, capi: false },
    { apodo: 'kiwi_9', ini: 'K9', fondo: 'var(--agua-f)', tu: false, capi: false },
    { apodo: 'coral_3', ini: 'C3', fondo: 'var(--cobre-f)', tu: false, capi: true },
  ];
  const avisame = () => avisar('Aún no guardamos avisos: lo verás aquí cuando esté listo.');
</script>

<section class="equipo" aria-labelledby="eq-t">
  <div class="intro tarjeta">
    <div class="fila entre">
      <h2 id="eq-t">Cartera en equipo</h2>
      <span class="chip pronto"><Ico n="hora" tam={14} />Próximamente</span>
    </div>
    <ul class="como">
      <li><Ico n="equipo" tam={18} />Formad un equipo de 3 a 5 amigos con una cartera común.</li>
      <li><Ico n="pluma" tam={18} />Cada cambio es una propuesta con su porqué.</li>
      <li><Ico n="ok" tam={18} />Se aprueba con 3 votos a favor de 4. Sin chat libre.</li>
    </ul>
    <button class="btn btn-primario btn-ancho" type="button" onclick={avisame}><Ico n="campana" />Avísame cuando esté</button>
  </div>

  <figure class="previa">
    <figcaption class="eti">Vista previa · equipo inventado</figcaption>
    <p class="sr">Ejemplo de cómo se verá: el equipo «Las Medusas», de cuatro personas, vota una propuesta para bajar NUBE del 30 % al 24 %. Lleva 2 votos a favor y 1 en contra.</p>
    <div class="lamina" inert aria-hidden="true">
      <div class="cab-eq">
        <svg class="emblema" viewBox="0 0 48 48"><rect x="1" y="1" width="46" height="46" rx="15" class="em-fondo" /><path d="M12 25a12 12 0 0 1 24 0z" class="em-cuerpo" /><path d="M16 25c0 5-2 7-2 10M21.5 25c0 5 1.5 6 0 11M26.5 25c0 5-1.5 6 0 11M32 25c0 5 2 7 2 10" class="em-trazo" /></svg>
        <div><p class="nom-eq">Las Medusas</p><p class="tenue peq">Capitana: coral_3 · se aprueba con 3 de 4</p></div>
      </div>
      <ul class="miembros">
        {#each MIEMBROS as m (m.apodo)}
          <li><span class="av" class:tu={m.tu} style="background:{m.fondo}">{m.ini}{#if m.capi}<span class="cor"><Ico n="corona" tam={11} /></span>{/if}{#if m.tu}<span class="tu-b">tú</span>{/if}</span><span class="apodo">{m.apodo}</span></li>
        {/each}
      </ul>
      <div class="prop cristal">
        <div class="fila entre"><span class="eti">Propuesta de kiwi_9</span><span class="chip cierra"><Ico n="hora" tam={13} />Cierra en 23 h</span></div>
        <p class="que">Bajar <span class="mono">NUBE</span> del 30 % al 24 %</p>
        <p class="porque-txt">«Una sola empresa pesa demasiado; mejor repartir.»</p>
        <div class="antes">
          <span>Concentración</span><span class="cambio"><span class="pild medio"><i></i>Media</span><Ico n="flecha" tam={16} /><span class="pild ok"><i></i>Baja</span></span>
          <span>Equilibrio</span><span class="cambio mono"><span class="tenue">37</span><Ico n="flecha" tam={16} /><b class="nivel-ok">50</b><small class="tenue">/50</small></span>
        </div>
        <div class="votos">
          <span class="asientos"><i class="si"><Ico n="ok" tam={15} /></i><i class="si"><Ico n="ok" tam={15} /></i><i class="no"><Ico n="no" tam={15} /></i><i class="esp"><Ico n="espera" tam={17} /></i></span>
          <span class="cuenta">2 a favor · 1 en contra<br /><span class="falta">falta el tuyo</span></span>
        </div>
        <div class="porque"><Ico n="pluma" tam={17} />Tu porqué (obligatorio)</div>
        <div class="botones"><span class="btn">En contra</span><span class="btn btn-primario"><Ico n="ok" />Votar a favor</span></div>
      </div>
      <div class="reac"><span class="chip">Buen porqué</span><span class="chip">Lo veo</span><span class="chip">Faltan datos</span><span class="chip">Sin prisa</span></div>
    </div>
  </figure>
</section>

<style>
  .equipo { display: grid; gap: var(--s4); }
  .intro { display: grid; gap: var(--s3); }
  .intro h2 { font-size: var(--t-xl); font-weight: 450; }
  .pronto { background: var(--cobre-f); color: var(--cobre-t); border-color: transparent; }
  .como { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  .como li { display: flex; gap: 10px; align-items: flex-start; color: var(--noche-2); font-size: var(--t-s); }
  .como li :global(svg) { color: var(--lila-t); margin-top: 1px; }

  .previa { margin: 0; display: grid; gap: var(--s3); }
  .lamina { display: grid; gap: var(--s3); user-select: none; position: relative; }
  .lamina::after { content: ""; position: absolute; inset: -6px; border-radius: var(--r-l); border: 1.5px dashed var(--linea-2); pointer-events: none; }
  .cab-eq { display: flex; align-items: center; gap: 12px; }
  .emblema { width: 48px; height: 48px; flex: none; }
  .em-fondo { fill: var(--lila-f); }
  .em-cuerpo { fill: var(--blanco); stroke: var(--noche); stroke-width: 1.8; stroke-linejoin: round; }
  .em-trazo { fill: none; stroke: var(--noche); stroke-width: 1.8; stroke-linecap: round; }
  .nom-eq { font-family: var(--f-disp); font-variation-settings: "SOFT" 100; font-size: var(--t-l); }
  .miembros { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .miembros li { display: grid; justify-items: center; gap: 13px; font-size: var(--t-xs); font-weight: 600; text-align: center; min-width: 0; }
  .av { position: relative; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: var(--t-xs); font-weight: 750; color: var(--noche); }
  .av.tu { box-shadow: 0 0 0 2px var(--noche); }
  .tu-b { position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); padding: 0 6px; border-radius: 8px; background: var(--noche); color: var(--perla-hi); font-size: 10px; line-height: 15px; box-shadow: 0 0 0 2px var(--perla); }
  .cor { position: absolute; top: -7px; right: -7px; width: 20px; height: 20px; border-radius: 50%; background: var(--noche); color: var(--medio-f); display: grid; place-items: center; }
  .apodo { overflow-wrap: anywhere; }
  .prop { padding: 14px 16px; display: grid; gap: 10px; }
  .cierra { color: var(--cobre-t); }
  .que { font-family: var(--f-disp); font-variation-settings: "SOFT" 100; font-size: var(--t-l); line-height: 1.2; }
  .que .mono { font-size: .85em; }
  .porque-txt { font-family: var(--f-disp); font-style: italic; color: var(--noche-2); }
  .antes { display: grid; grid-template-columns: 1fr auto; gap: 8px 10px; align-items: center; padding: 10px 12px; border-radius: var(--r); background: var(--perla-hi); font-size: var(--t-s); font-weight: 600; }
  .cambio { display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end; }
  .pild { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: var(--r-pildora); font-size: var(--t-xs); }
  .pild i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .pild.medio { background: var(--medio-f); color: var(--medio); }
  .pild.ok { background: var(--ok-f); color: var(--ok); }
  .votos { display: flex; align-items: center; justify-content: space-between; gap: var(--s2); }
  .asientos { display: flex; gap: 5px; }
  .asientos i { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; }
  .asientos .si { background: var(--ok-f); color: var(--ok); }
  .asientos .no { background: var(--alto-f); color: var(--alto); }
  .asientos .esp { box-shadow: inset 0 0 0 1.5px var(--noche); color: var(--noche); }
  .cuenta { text-align: right; font-size: var(--t-xs); font-weight: 600; line-height: 1.35; }
  .falta { color: var(--cobre-t); }
  .porque { min-height: 40px; border-radius: 14px; display: flex; align-items: center; gap: 8px; padding: 0 13px; font-size: var(--t-s); color: var(--noche-3); background: var(--blanco); box-shadow: inset 0 0 0 1.5px var(--lila); }
  .porque :global(svg) { color: var(--lila-t); }
  .botones { display: grid; grid-template-columns: 1fr 1.3fr; gap: var(--s2); }
  .botones .btn { cursor: default; }
  .reac { display: flex; gap: 6px; flex-wrap: wrap; }
</style>

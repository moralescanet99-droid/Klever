<script lang="ts">
  // «¿Cómo se puntúa?» plegable. Reglas de dominio/liga.ts.
  let { general = false }: { general?: boolean } = $props();
</script>
<details class="como tarjeta">
  <summary><span>¿Cómo se puntúa?</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg></summary>
  <div class="cuerpo">
    <p>Cada semana, hasta <b>100 puntos</b>. Cuenta la foto de tu cartera del lunes a las 00:00 (hora de Madrid).</p>
    <dl>
      <dt><i class="eq"></i>Equilibrio · 50</dt>
      <dd>Concentración baja 25 (media 12) y variedad amplia 25 (media 12). Necesitas 4 posiciones o más, cartera al 100 %{general ? '' : ' y cumplir las reglas de la liga'}.</dd>
      <dt><i class="ap"></i>Aprendizaje · 30</dt>
      <dd>Reto de la semana 20 y revisar una empresa (ficha o comparador) 10.</dd>
      <dt><i class="co"></i>Constancia · 20</dt>
      <dd>Entrar esa semana 10, y +2 por cada semana seguida (hasta +10).</dd>
    </dl>
    <p class="tenue">No cuentan precios ni rentabilidad. Empate: más semanas con concentración baja.</p>
  </div>
</details>
<style>
  .como { padding: 0; }
  summary { list-style: none; display: flex; align-items: center; justify-content: space-between; min-height: 52px; padding: 0 var(--s4); font-weight: 700; cursor: pointer; border-radius: var(--r-l); }
  summary::-webkit-details-marker { display: none; }
  summary svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; transition: transform var(--medio-t) var(--suave); }
  details[open] summary svg { transform: rotate(180deg); }
  .cuerpo { padding: 0 var(--s4) var(--s4); display: grid; gap: var(--s3); font-size: var(--t-s); }
  dl { margin: 0; display: grid; gap: 4px; }
  dt { font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  dd { margin: 0; color: var(--noche-2); }
  dt i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .eq { background: var(--lila); } .ap { background: var(--cobre); } .co { background: var(--agua); }
</style>

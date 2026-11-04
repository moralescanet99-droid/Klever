// Presentación de la nota de estructura (el cálculo vive en nota.js). Conclusión primero; el método, en «¿Por qué esta nota?».
import { NOMBRES, PESOS, PARAMETROS, VERSION_NOTA } from './nota.js';
const c = v => String(v).replace('.', ',');
export function aviso_datos(origen) {   // qué decir de los datos según su origen (nunca se atribuye a una fuente sin declararla)
  if (origen === 'prueba') return 'Datos de PRUEBA ficticios: esta nota solo sirve para probar el método.';
  if (origen === 'demo') return 'Datos de DEMOSTRACIÓN inventados: esta nota solo sirve para probar el método.';
  if (origen === 'sec' || origen === 'mixto') return 'Datos con fuente declarada pero sin calibrar: los umbrales son provisionales.';
  return 'Origen de los datos sin verificar: la nota no está activada con datos reales.';
}
export function htmlNotaEstructura(esc, ev, origen) {
  if (!ev) return '';
  const fecha = ev.fecha ? new Date(ev.fecha + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'fecha no disponible';
  const bl = ev.bloques ? Object.values(ev.bloques) : [];
  const cab = `<h3 id="nota-t">Nota de estructura <span class="chip">${esc(VERSION_NOTA.replace('estructura-', ''))} · beta</span></h3>
    <p class="nota-aviso mut peq">Describe la estructura de la cartera y los fundamentales observados el ${esc(fecha)}. <b>No es una previsión de rentabilidad ni una recomendación</b>, y una nota alta no garantiza rentabilidad ni idoneidad personal. ${esc(aviso_datos(origen))}</p>`;
  let cuerpo;
  if (ev.publicada) {
    cuerpo = `<p class="nota-num"><b>${c(ev.nota.toFixed(1))}</b><span> de 10</span></p>
      <ul class="nota-puntos"><li><b>Principal fortaleza:</b> ${esc(NOMBRES[ev.fortaleza])} (${c(ev.bloques[ev.fortaleza].puntuacion.toFixed(1))}/10).</li>
      <li><b>Principal limitación:</b> ${esc(NOMBRES[ev.limitacion.bloque])}: le quita ${c(ev.limitacion.perdida.toFixed(1))} puntos a la nota.</li>
      <li><b>Cobertura mínima:</b> ${c((ev.cobertura.minima * 100).toFixed(1))} % del peso evaluado en el bloque con menos datos.</li></ul>`;
  } else {
    cuerpo = `<p class="nota-pend"><b>Nota pendiente.</b> ${esc(ev.motivo || '')}</p>` + (bl.some(b => b.puntuacion != null) ? `<p class="mut peq">Bloques que sí se pueden calcular: ${bl.filter(b => b.puntuacion != null).map(b => `${esc(b.nombre)} (${c(b.puntuacion.toFixed(1))}/10)`).join(', ')}.</p>` : '');
  }
  const filas = bl.map(b => `<tr><th scope="row">${esc(b.nombre)}</th><td>${PESOS[b.id]} %</td><td>${b.puntuacion == null ? 'pendiente' : c(b.puntuacion.toFixed(2))}</td><td>${c((b.cobertura * 100).toFixed(1))} %</td></tr>`).join('');
  const sin = ev.sinEvaluar.length ? `<p><b>Peso sin evaluar:</b></p><ul>${ev.sinEvaluar.map(s => `<li><b>${esc(s.ticker)}</b> (${c(s.peso)} %): ${esc(s.motivos.join(' '))}</li>`).join('')}</ul>` : '';
  const porque = `<details class="mini"><summary>¿Por qué esta nota?</summary>
    ${bl.length ? `<div class="tabla-h" role="region" aria-label="Bloques de la nota" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Bloque</th><th scope="col">Peso</th><th scope="col">Puntos</th><th scope="col">Cobertura</th></tr></thead><tbody>${filas}</tbody></table></div>` : ''}
    <p class="peq">La nota es la suma de cada bloque (puntuación de 1 a 10 × su peso) y se redondea una sola vez, al final, a un decimal. Solo se publica con la cartera al 100 % y con al menos el ${Math.round(PARAMETROS.minCobertura * 100)} % del peso evaluable en cada bloque; si no, se muestran los bloques disponibles y el motivo.</p>
    <p class="peq">Empresas y sectores: número efectivo de empresas = 1 / suma de los pesos al cuadrado (las clases de una misma compañía cuentan una vez). Tamaño, deuda y rentabilidad: percentiles del universo cubierto o del sector (hacen falta ${PARAMETROS.minComparables} comparables) y frecuencias de los últimos ${PARAMETROS.ejercicios} ejercicios. Los umbrales son provisionales.</p>
    ${sin}</details>`;
  return `<section class="nota" aria-labelledby="nota-t">${cab}${cuerpo}${porque}</section>`;
}

// Qué cambia en los bloques evaluables al pasar de la cartera base a la propuesta (laboratorio). No recalcula nada: recibe las dos evaluaciones.
export function htmlCambioNota(esc, a, d) {
  if (!a || !d) return '';
  const bl = Object.keys(NOMBRES), f = v => v == null ? 'pendiente' : c(v.toFixed(2));
  const dif = (x, y) => (x == null || y == null) ? '—' : (Math.abs(y - x) < 0.005 ? 'sin cambio' : (y > x ? '+' : '−') + c(Math.abs(y - x).toFixed(2)));
  const fila = id => `<tr><th scope="row">${esc(NOMBRES[id])}</th><td>${f(a.bloques?.[id]?.puntuacion)}</td><td>${f(d.bloques?.[id]?.puntuacion)}</td><td>${dif(a.bloques?.[id]?.puntuacion, d.bloques?.[id]?.puntuacion)}</td></tr>`;
  return `<h3>Qué cambia en la nota de estructura <span class="chip">${esc(VERSION_NOTA.replace('estructura-', ''))} · beta</span></h3>
    <p class="mut peq">Nota: ${a.publicada ? c(a.nota.toFixed(1)) : 'pendiente'} → ${d.publicada ? c(d.nota.toFixed(1)) : 'pendiente'}${(!a.publicada || !d.publicada) ? '. ' + esc(!d.publicada ? d.motivo : a.motivo) : ''} Solo cambian los bloques que se pueden evaluar; no es una previsión de rentabilidad.</p>
    <div class="tabla-h" role="region" aria-label="Bloques de la nota antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Bloque</th><th scope="col">Antes</th><th scope="col">Después</th><th scope="col">Cambio</th></tr></thead><tbody>${bl.map(fila).join('')}</tbody></table></div>`;
}

// Presentación de la nota de estructura (el cálculo vive en nota.js). Conclusión primero; el método, en «¿Por qué esta nota?».
import { NOMBRES, PESOS, PARAMETROS, VERSION_NOTA, validarResumen } from './nota.js';
const cm = v => String(v).replace('.', ',');
export function aviso_datos(origen) {   // qué decir de los datos según su origen (nunca se atribuye a una fuente sin declararla)
  if (origen === 'prueba') return 'Datos de PRUEBA ficticios: esta nota solo sirve para probar el método.';
  if (origen === 'demo') return 'Datos de DEMOSTRACIÓN inventados: esta nota solo sirve para probar el método.';
  if (origen === 'sec' || origen === 'mixto') return 'Datos con fuente declarada pero sin calibrar: los umbrales son provisionales.';
  return 'Origen de los datos sin verificar: la nota no está activada con datos reales.';
}
// Explicación CONCRETA, con las posiciones de la cartera y sin jerga: qué se puede medir, qué falta y por qué (o qué es lo que más le resta a la nota).
const minus = s => s.charAt(0).toLowerCase() + s.slice(1);
export function explicarNota(ev) {
  if (!ev?.reparto?.length) return '';
  const top = ev.reparto[0], bl = ev.bloques ? Object.values(ev.bloques) : [];
  if (ev.publicada) {
    const L = ev.limitacion?.bloque, b = ev.bloques?.[L], N = ev.bloques?.empresas?.efectivas;
    const reparto = `${top.nombre} (${top.ticker}) pesa el ${cm(top.peso)} % de la cartera${N != null ? (N < 1.5 ? ': casi todo depende de una sola empresa' : `: el reparto equivale a ${cm(N.toFixed(1))} empresas del mismo tamaño`) : ''}.`;
    if (L === 'empresas') return reparto;
    if (L === 'sectores') { const g = {}; ev.reparto.forEach(r => { g[r.sector] = (g[r.sector] || 0) + r.peso; }); const [sec, p] = Object.entries(g).sort((a, c) => c[1] - a[1])[0]; return `${reparto} Además, el ${cm(Math.round(p * 10) / 10)} % está en ${sec}: el reparto por sectores y actividades es lo que más resta.`; }
    return `${reparto} Lo que más resta es ${minus(NOMBRES[L])}.`;
  }
  const lista = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`, q = b => `«${minus(b.nombre)}»`;
  const ok = bl.filter(b => b.puntuacion != null).map(q), falta = bl.filter(b => b.puntuacion == null).map(q);
  const causas = (ev.sinEvaluar || []).slice(0, 2).map(s => `${s.ticker} (${cm(s.peso)} % de la cartera): ${minus(s.motivos[0] || '').replace(/\.$/, '')}`);
  if (!bl.length) return '';
  return `${ok.length ? `Podemos medir ${lista(ok)}. ` : ''}${falta.length ? `Faltan datos para valorar ${lista(falta)}.` : ''}${causas.length ? ` Causa principal: ${causas.join('; ')}.` : ''}`;
}
export function htmlNotaEstructura(esc, ev, origen) {
  if (!ev) return '';
  const fecha = ev.fecha ? new Date(ev.fecha + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  const bl = ev.bloques ? Object.values(ev.bloques) : [];
  const cab = `<h3 id="nota-t">Nota de estructura <span class="chip">${esc(VERSION_NOTA.replace('estructura-', ''))} · beta</span></h3>
    <p class="nota-aviso mut peq">Describe la estructura de la cartera y los fundamentales ${fecha ? `observados el ${esc(fecha)}` : '(sin fecha de datos disponible)'}. <b>No es una previsión de rentabilidad ni una recomendación</b>, y una nota alta no garantiza rentabilidad ni idoneidad personal. ${esc(aviso_datos(origen || (ev.origenDatos === 'sintetico' ? 'prueba' : null)))}</p>`;
  let cuerpo;
  if (ev.publicada) {
    cuerpo = `<p class="nota-num"><b>${cm(ev.nota.toFixed(1))}</b><span> de 10</span></p>
      <p class="nota-expl">${esc(explicarNota(ev))}</p>
      <ul class="nota-puntos"><li><b>Principal fortaleza:</b> ${esc(NOMBRES[ev.fortaleza])} (${cm(ev.bloques[ev.fortaleza].puntuacion.toFixed(1))}/10).</li>
      <li><b>Principal limitación:</b> ${esc(NOMBRES[ev.limitacion.bloque])}: le quita ${cm(ev.limitacion.perdida.toFixed(1))} puntos a la nota.</li>
      <li><b>Cobertura mínima:</b> ${cm((ev.cobertura.minima * 100).toFixed(1))} % del peso evaluado en el bloque con menos datos.</li></ul>`;
  } else {
    cuerpo = `<p class="nota-pend"><b>Nota pendiente.</b> ${esc(explicarNota(ev) || ev.motivo || '')}</p>${ev.bloques && ev.motivo ? `<p class="mut peq">${esc(ev.motivo)}</p>` : ''}` + (bl.some(b => b.puntuacion != null) ? `<p class="mut peq">Bloques que sí se pueden calcular: ${bl.filter(b => b.puntuacion != null).map(b => `${esc(b.nombre)} (${cm(b.puntuacion.toFixed(1))}/10)`).join(', ')}.</p>` : '');
  }
  const filas = bl.map(b => `<tr><th scope="row">${esc(b.nombre)}</th><td>${PESOS[b.id]} %</td><td>${b.puntuacion == null ? 'pendiente' : cm(b.puntuacion.toFixed(2))}</td><td>${cm((b.cobertura * 100).toFixed(1))} %</td></tr>`).join('');
  const sin = ev.sinEvaluar.length ? `<p><b>Peso sin evaluar:</b></p><ul>${ev.sinEvaluar.map(s => `<li><b>${esc(s.ticker)}</b> (${cm(s.peso)} %): ${esc(s.motivos.join(' '))}</li>`).join('')}</ul>` : '';
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
  const bl = Object.keys(NOMBRES), f = v => v == null ? 'pendiente' : cm(v.toFixed(2));
  const dif = (x, y) => (x == null || y == null) ? '—' : (Math.abs(y - x) < 0.005 ? 'sin cambio' : (y > x ? '+' : '−') + cm(Math.abs(y - x).toFixed(2)));
  const fila = id => `<tr><th scope="row">${esc(NOMBRES[id])}</th><td>${f(a.bloques?.[id]?.puntuacion)}</td><td>${f(d.bloques?.[id]?.puntuacion)}</td><td>${dif(a.bloques?.[id]?.puntuacion, d.bloques?.[id]?.puntuacion)}</td></tr>`;
  return `<h3>Qué cambia en la nota de estructura <span class="chip">${esc(VERSION_NOTA.replace('estructura-', ''))} · beta</span></h3>
    <p class="mut peq">Nota: ${a.publicada ? cm(a.nota.toFixed(1)) : 'pendiente'} → ${d.publicada ? cm(d.nota.toFixed(1)) : 'pendiente'}${(!a.publicada || !d.publicada) ? '. ' + esc(!d.publicada ? d.motivo : a.motivo) : '.'} Solo cambian los bloques que se pueden evaluar; no es una previsión de rentabilidad.</p>
    <div class="tabla-h" role="region" aria-label="Bloques de la nota antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Bloque</th><th scope="col">Antes</th><th scope="col">Después</th><th scope="col">Cambio</th></tr></thead><tbody>${bl.map(fila).join('')}</tbody></table></div>`;
}

// Evaluación GUARDADA con un escenario: se revalida su forma y se pinta solo desde la copia reconstruida (números y fechas formateados, texto escapado).
// Es un registro de lo que vio la persona: el servidor comprueba su forma, no la recalcula.
export function htmlEvaluacionGuardada(esc, e) {
  const nada = '<p class="mut peq">Este escenario trae una evaluación de estructura que no supera las comprobaciones de formato: no se muestra.</p>';
  if (e.evaluacion_invalida) return nada; if (!e.evaluacion) return '';
  const a = validarResumen(e.evaluacion.antes), d = validarResumen(e.evaluacion.despues); if (!a.ok || !d.ok) return nada;
  const f = r => r.publicada ? `${cm(r.nota.toFixed(1))} de 10` : 'pendiente', A = a.limpio, D = d.limpio;
  const fecha = A.fecha ? new Date(A.fecha + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'sin fecha';
  return `<p class="mut peq">Registro de la nota de estructura que viste (${esc(fecha)}, método ${esc(A.version)}): <b>${esc(f(A))}</b> → <b>${esc(f(D))}</b>${D.publicada || A.publicada ? '' : '. ' + esc(D.motivo || A.motivo || '')}. Se guardó con el escenario tal como la viste: el servidor comprobó su formato, no la recalculó, y tampoco se recalcula aunque cambien los datos o el método.</p>`;
}

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
  const lista = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`;
  if (ev.publicada) {                                                       // titular: la cifra anclada a su principal motivo, con nombres y porcentajes reales
    const g = {}; ev.reparto.forEach(r => { g[r.sector] = (g[r.sector] || 0) + r.peso; }); const [sec, p] = Object.entries(g).sort((a, c) => c[1] - a[1])[0];
    const sector = Math.round(p * 10) === 1000 ? `Toda la cartera está en ${sec}` : `El ${cm(Math.round(p * 10) / 10)} % de la cartera está en ${sec}`;
    return `${sector} y ${top.nombre} concentra el ${cm(top.peso)} %.`;
  }
  const ok = bl.filter(b => b.puntuacion != null), falta = bl.filter(b => b.puntuacion == null), q = b => `«${minus(b.nombre)}»`;
  if (!bl.length) return '';
  // el límite es del MÉTODO (no faltan datos que vayan a llegar): bancos y aseguradoras no tienen deuda/EBITDA ni ROIC comparables
  const bancos = (ev.sinEvaluar || []).filter(s => (s.motivos || []).some(m => /banca y seguros/.test(m)));
  if (bancos.length && ev.bloques?.empresas?.puntuacion != null && ev.bloques?.sectores?.puntuacion != null) {
    const w = Math.round(bancos.reduce((a, s) => a + s.peso, 0) * 10) / 10, parte = w === 50 ? 'La mitad' : `El ${cm(w)} %`, uno = bancos.length === 1;
    return `Podemos medir cómo repartes tu cartera. ${parte} está en ${uno ? 'un banco' : 'bancos o aseguradoras'} y este método todavía no evalúa bien la deuda y los beneficios de ${uno ? 'los bancos' : 'esas entidades'}. Por eso no damos una nota total.`;
  }
  const causas = (ev.sinEvaluar || []).slice(0, 2).map(s => `${s.ticker} (${cm(s.peso)} % de la cartera): ${minus(s.motivos[0] || '').replace(/\.$/, '')}`);
  return `${ok.length ? `Podemos medir ${lista(ok.map(q))}. ` : ''}${falta.length ? `Faltan datos para valorar ${lista(falta.map(q))}.` : ''}${causas.length ? ` Causa principal: ${causas.join('; ')}.` : ''}`;
}
export function htmlNotaEstructura(esc, ev, origen) {
  if (!ev) return '';
  const fecha = ev.fecha ? new Date(ev.fecha + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  const bl = ev.bloques ? Object.values(ev.bloques) : [];
  const cab = `<h3 id="nota-t">Nota de estructura <span class="chip">${esc(VERSION_NOTA.replace('estructura-', ''))} · beta</span></h3>`;
  let cuerpo;
  const inst = ev.instantanea ? new Date(ev.instantanea + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  const periodos = (ev.periodos || []).length ? [...new Set(ev.periodos.map(p => p.hasta))].join(', ') : null;
  if (ev.publicada) {
    cuerpo = `<p class="nota-num"><b>${cm(ev.nota.toFixed(1))}</b><span> de 10</span></p>
      <p class="nota-expl">${esc(explicarNota(ev))}</p>
      <ul class="nota-puntos"><li><b>Principal fortaleza:</b> ${esc(NOMBRES[ev.fortaleza])} (${cm(ev.bloques[ev.fortaleza].puntuacion.toFixed(1))}/10).</li>
      <li><b>Principal limitación:</b> ${esc(NOMBRES[ev.limitacion.bloque])}: le quita ${cm(ev.limitacion.perdida.toFixed(1))} puntos a la nota.</li>
      ${inst ? `<li>Instantánea del ${esc(inst)}${periodos ? `; ejercicios hasta ${esc(periodos)}` : ''}.</li>` : ''}</ul>`;
  } else {
    cuerpo = `<p class="nota-pend"><b>Nota pendiente.</b> ${esc(explicarNota(ev) || ev.motivo || '')}</p>${inst ? `<p class="mut peq">Instantánea del ${esc(inst)}${periodos ? `; ejercicios hasta ${esc(periodos)}` : ''}.</p>` : ''}`;
  }
  const filas = bl.map(b => `<tr><th scope="row">${esc(b.nombre)}</th><td>${PESOS[b.id]} %</td><td>${b.puntuacion == null ? 'pendiente' : cm(b.puntuacion.toFixed(2))}</td><td>${cm((b.cobertura * 100).toFixed(1))} %</td></tr>`).join('');
  const sin = ev.sinEvaluar.length ? `<p><b>Peso sin evaluar:</b></p><ul>${ev.sinEvaluar.map(s => `<li><b>${esc(s.ticker)}</b> (${cm(s.peso)} %): ${esc(s.motivos.join(' '))}</li>`).join('')}</ul>` : '';
  const detalleTec = `${ev.publicada ? `<p class="peq"><b>Cobertura mínima:</b> ${cm((ev.cobertura.minima * 100).toFixed(1))} % del peso evaluado en el bloque con menos datos. ${ev.bloques?.empresas?.detalle ? esc(ev.bloques.empresas.detalle) : ''}</p>` : `${ev.bloques && ev.motivo ? `<p class="peq">${esc(ev.motivo)}</p>` : ''}${bl.some(b => b.puntuacion != null) ? `<p class="peq">Bloques que sí se pueden calcular: ${bl.filter(b => b.puntuacion != null).map(b => `${esc(b.nombre)} (${cm(b.puntuacion.toFixed(1))}/10)`).join(', ')}.</p>` : ''}`}${ev.poblacion?.ficticias ? `<p class="peq">Población de comparación: ${ev.poblacion.empresas} empresas, de ellas ${ev.poblacion.ficticias} ficticias (solo existen en la demo y la semilla).</p>` : ''}`;
  const aviso = `<p class="nota-aviso mut peq"><b>No es una previsión de rentabilidad ni una recomendación.</b> ${esc(aviso_datos(origen || (ev.origenDatos === 'sintetico' ? 'prueba' : null)))}</p>`;
  const porDato = (ev.periodos || []).length ? `<p class="peq"><b>Fechas por dato:</b></p><ul class="peq">${ev.periodos.map(p => `<li>${esc(p.ticker)}: ejercicios hasta ${esc(p.hasta)}${p.carga ? `, cargado el ${esc(p.carga)}` : ''}${p.fuente ? ` (${esc(p.fuente)})` : ''}.</li>`).join('')}</ul>` : '';
  const largo = `<p class="peq">Describe la estructura de la cartera y los fundamentales de sus empresas${inst ? ` en una instantánea del ${esc(inst)}` : ' (sin fecha de datos disponible)'}. Una nota alta no garantiza rentabilidad ni idoneidad personal.</p>`;
  const porque = `<details class="mini"><summary>Cómo se calcula</summary>${largo}${porDato}${detalleTec}
    ${bl.length ? `<div class="tabla-h" role="region" aria-label="Bloques de la nota" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Bloque</th><th scope="col">Peso</th><th scope="col">Puntos</th><th scope="col">Cobertura</th></tr></thead><tbody>${filas}</tbody></table></div>` : ''}
    <p class="peq">La nota es la suma de cada bloque (puntuación de 1 a 10 × su peso) y se redondea una sola vez, al final, a un decimal. Solo se publica con la cartera al 100 % y con al menos el ${Math.round(PARAMETROS.minCobertura * 100)} % del peso evaluable en cada bloque; si no, se muestran los bloques disponibles y el motivo.</p>
    <p class="peq">Empresas y sectores: número efectivo de empresas = 1 / suma de los pesos al cuadrado (las clases de una misma compañía cuentan una vez). Tamaño, deuda y rentabilidad: percentiles del universo cubierto o del sector (hacen falta ${PARAMETROS.minComparables} comparables) y frecuencias de los últimos ${PARAMETROS.ejercicios} ejercicios. Los umbrales son provisionales.</p>
    ${sin}</details>`;
  return `<section class="nota" aria-labelledby="nota-t">${cab}${cuerpo}${aviso}${porque}</section>`;
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
  const f = r => r.publicada ? `${cm(r.nota.toFixed(1))} de 10` : 'pendiente', A = a.limpio, D = d.limpio, sin = !!e.evaluacion_sin_comprobar;
  const fecha = A.fecha ? new Date(A.fecha + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'sin fecha';
  const cifra = `<b>${esc(f(A))}</b> → <b>${esc(f(D))}</b>${D.publicada || A.publicada ? '' : '. ' + esc(D.motivo || A.motivo || '')}`;
  return sin ? `<p class="mut peq">Valor guardado por el cliente (${esc(fecha)}, método «${esc(A.version)}», que esta pantalla no sabe comprobar): ${cifra}. No se ha podido verificar cómo se calculó.</p>`
    : `<p class="mut peq">Registro de la nota de estructura que viste (${esc(fecha)}, método ${esc(A.version)}): ${cifra}. Se guardó con el escenario tal como la viste: el servidor comprobó su formato, no la recalculó, y tampoco se recalcula aunque cambien los datos o el método.</p>`;
}

// Fase 1 (ronda 33) · «TU SEMANA» en Mis carteras (antes, dentro de app.js): señal de cada cartera, evolución, cambios desde la última semana,
// reto de la semana, retos fijos y «Mira atrás». La memoria vive en el servidor (/api/semana). Recibe lo que necesita con iniciarSemanaUI(ctx).
import { $, esc, store } from './base.js';
import { retos, resumenSemana, evolucion, cambiosSemana, retoSemana, fotoAnterior, NIVELES_SEMANA, fotoValida } from './semana.js';
import { miraAtras, ESTADO_CICLO } from './ciclo.js';
import { nSeguidas } from './lab.js';
import { montarRueda } from './rueda.js';
let XS = null;   // contexto: { api, getJson, logged, by, fmtFecha }
export const iniciarSemanaUI = ctx => { XS = ctx; };
// Ronda 29 (fase 2.5) · «Tu semana»: lo que conviene mirar hoy (señal de cada cartera, ideas de los próximos 7 días) y los retos de aprendizaje.
// Ronda 30: la memoria vive en el SERVIDOR (/api/semana): evolución de los indicadores semana a semana, cambios de señales desde la última semana con foto,
// el reto de la semana y «Mira atrás» (una idea antigua frente a los datos de hoy). Si algo no se puede leer, esa parte dice «sin datos»: no se inventa.
const hoyIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// Los datos «de hoy» para comparar con la foto de una idea se leen del servidor (como mucho una vez por minuto): la lista de Explorar puede ser de cuando se abrió la página.
let critCache = null;
export const criteriosAhora = () => { if (critCache && Date.now() - critCache.t < 60e3) return critCache.p;
  const p = XS.getJson('/ideas').then(l => Object.fromEntries(l.map(r => [r.ticker, r.criterios]))); critCache = { t: Date.now(), p }; p.catch(() => { if (critCache?.p === p) critCache = null; }); return p; };
const fechaSemana = s => `semana del ${XS.fmtFecha(s)}`;
function htmlEvolucion(c, ev) {
  const fila = (k, et) => { const t = ev.tendencias[k], txt = NIVELES_SEMANA[k];
    return `<li class="evo-fila"><span class="evo-et">${et}</span><span class="evo-puntos" aria-hidden="true">${ev.serie.map(f => `<i class="evo-p evo-${f[k]}" title="${esc(fechaSemana(f.semana))}: ${txt[f[k]]}"></i>`).join('')}</span>
      <span class="evo-txt evo-${t.tendencia}">${txt[t.antes]} → ${txt[t.ahora]}<span class="sr"> (${t.tendencia === 'mejora' ? 'mejora' : t.tendencia === 'empeora' ? 'empeora' : 'sin cambios'})</span></span></li>`; };
  return `<div class="evo"><p class="evo-cab"><b>${esc(c.nombre)}</b> <span class="mut peq">desde hace ${ev.semanas - 1} ${ev.semanas === 2 ? 'semana' : 'semanas'}</span></p><ul class="evo-lista">${fila('concentracion', 'Concentración')}${fila('variedad', 'Variedad')}</ul></div>`;
}
function htmlMiraAtras(m) {
  if (!m) return '';
  const c = m.cambios, emp = c ? c.empresas.filter(e => e.cambios.length || e.periodo) : [];
  const det = !c ? '<p class="mut peq">No se pudieron leer los datos de hoy para compararlos.</p>'
    : c.n || c.periodos ? `<ul class="mira-cambios">${emp.slice(0, 3).map(e => `<li><b>${esc(e.ticker)}</b>${e.periodo ? ` · nuevo informe (${esc(e.periodo.antes || 'sin periodo')} → ${esc(e.periodo.ahora || 'sin periodo')})` : ''}${e.cambios.slice(0, 2).map(x => ` · ${esc(x.etiqueta)}: ${ESTADO_CICLO[x.antes]} → ${ESTADO_CICLO[x.ahora]}`).join('')}</li>`).join('')}</ul>`
    : '<p class="mut peq">Los datos de sus empresas no han cambiado desde entonces.</p>';
  return `<div class="mira"><p class="mira-t"><b>Mira atrás:</b> hace ${m.dias} días guardaste «${esc(m.nombre)}»${m.motivo ? ` (${esc(m.motivo.length > 90 ? m.motivo.slice(0, 89) + '…' : m.motivo)})` : ''}.</p>${det}<a class="reto-pista" href="#escenario-${m.id}">Revisar esta idea →</a></div>`;
}
export async function pintarSemana(list, seq, vigente) {
  const el = $('#tu-semana');
  const [rI, rS, rC] = await Promise.allSettled([XS.api('/escenarios'), XS.api('/semana'), criteriosAhora()]);
  if (!vigente(seq) || !XS.logged()) return;   // respuesta tardía tras salir: no se pinta
  const ideas = rI.status === 'fulfilled' ? rI.value : null, sem = rS.status === 'fulfilled' ? rS.value : null, ahora = rC.status === 'fulfilled' ? rC.value : null;
  store.removeItem('klever_semana');         // ronda 30: la foto ya no vive en el dispositivo (la de la ronda 29 se retira)
  let umb = null; try { umb = JSON.parse(localStorage.getItem('klever_umbrales')); } catch { /* sin almacenamiento */ }
  const datos = { carteras: list.map(c => ({ id: c.id, nombre: c.nombre, pos: c.posiciones || [] })), activos: XS.by(), ideas, sigues: nSeguidas(), umb, hoy: sem?.hoy || hoyIso() };
  const res = resumenSemana(datos, null), rt = retos(datos);
  const porId = Object.fromEntries((sem?.carteras || []).map(c => [c.id, c])), visibles = res.carteras.slice(0, 4);
  // cambios de señales desde la última semana con foto (servidor)
  const cambios = [], desdes = [];
  for (const c of visibles) { const h = porId[c.id]; if (!h) continue; const k = cambiosSemana(h.historial, sem.semana); if (k.cambios.length) { desdes.push(k.desde); k.cambios.forEach(x => cambios.push({ ...x, cartera: c.nombre })); } }
  const desde = desdes.sort().pop();
  const htmlCambios = cambios.length ? `<p class="sem-desde">Desde la ${esc(fechaSemana(desde))}:</p><ul class="sem-cambios">${cambios.slice(0, 4).map(x => `<li class="sem-${x.tipo}">${x.tipo === 'resuelta' ? '✓ Ya no' : '● Nueva'}: ${esc(x.texto)} <span class="mut">(${esc(x.cartera)})</span></li>`).join('')}</ul>` : '';
  // evolución (servidor)
  const evos = sem ? visibles.map(c => ({ c, ev: porId[c.id] ? evolucion(porId[c.id].historial, sem.semana) : null })).filter(x => x.ev?.tendencias) : [];
  const htmlEvo = !sem ? '<p class="mut peq evo-vacia">No se pudo leer tu evolución ahora mismo.</p>'
    : evos.length ? `<div class="evo-bloque"><p class="evo-titulo"><b>Tu evolución</b></p>${evos.slice(0, 3).map(x => htmlEvolucion(x.c, x.ev)).join('')}</div>`
    : '<p class="mut peq evo-vacia">Tu evolución aparecerá aquí cuando vuelvas la semana que viene: Klever guarda una foto de tus carteras cada semana.</p>';
  const tocan = ideas == null ? '' : res.tocan.length ? `<a class="sem-tocan${res.vencidas ? ' hoy' : ''}" href="#seguimiento"><b>${res.tocan.length}</b> ${res.tocan.length === 1 ? 'idea para revisar' : 'ideas para revisar'} esta semana${res.vencidas ? ` · ${res.vencidas} hoy` : ''} →</a>` : '<p class="mut peq">Ninguna idea por revisar esta semana.</p>';
  // reto de la semana (rota cada lunes)
  const rs = sem ? retoSemana({ semana: sem.semana, carteras: sem.carteras.map(c => ({ id: c.id, foto: c.foto })), anteriores: Object.fromEntries(sem.carteras.map(c => [c.id, fotoAnterior(c.historial, sem.semana)]).filter(x => x[1])), ideas }) : null;
  const htmlRetoSem = rs ? `<div class="reto-sem${rs.hecho ? ' hecho' : ''}"><p class="reto-sem-cab"><b>Reto de la semana</b><span class="mut peq">cambia el ${esc(XS.fmtFecha(rs.cambia))}</span></p>
      <p class="reto-sem-t"><span class="reto-i" aria-hidden="true">${rs.hecho ? '✓' : '○'}</span> ${esc(rs.titulo)}<span class="sr">${rs.hecho ? ' (conseguido)' : ' (pendiente)'}</span></p>${rs.hecho ? '<p class="mut peq">¡Conseguido! El lunes llega otro.</p>' : `<a href="${rs.ir}" class="reto-pista">${esc(rs.pista)}</a>`}</div>` : '';
  const lin = c => `<li><a href="#cartera-${c.id}" class="sem-cart"><b>${esc(c.nombre)}</b>${c.senal ? `<span class="ci-senal senal-${c.senal.nivel}"><i aria-hidden="true"></i>${esc(c.senal.titulo)}</span>` : ''}</a></li>`;
  const reto = r => `<li class="reto ${r.hecho === true ? 'hecho' : r.hecho === null ? 'nd' : ''}"><span class="reto-i" aria-hidden="true">${r.hecho === true ? '✓' : '○'}</span><span><b>${esc(r.titulo)}</b>${r.hecho === true ? '' : `<a href="${r.ir}" class="reto-pista">${esc(r.hecho === null ? 'Sin datos ahora mismo' : r.pista)}</a>`}</span><span class="sr">${r.hecho === true ? ' (conseguido)' : r.hecho === null ? ' (sin datos)' : ' (pendiente)'}</span></li>`;
  el.innerHTML = `<div class="sem-cab"><h2 id="semana-t">Tu semana</h2><span class="mut peq">${esc(XS.fmtFecha(datos.hoy))}</span></div>
    <div class="sem-grid"><div class="sem-col"><ul class="sem-carteras">${visibles.map(lin).join('')}</ul>${htmlCambios}${htmlEvo}${tocan}${htmlMiraAtras(ideas ? miraAtras(ideas, datos.hoy, ahora) : null)}</div>
    <div class="sem-col">${htmlRetoSem}<div class="retos-cab"><b>Retos</b><span class="retos-n">${rt.hechos} de ${rt.total}</span></div><div class="retos-barra" role="progressbar" aria-label="Retos conseguidos" aria-valuemin="0" aria-valuemax="${rt.total}" aria-valuenow="${rt.hechos}"><i style="width:${rt.hechos / rt.total * 100}%"></i></div>
      <ul class="retos">${rt.lista.map(reto).join('')}</ul><p class="mut peq">Retos para entender y ordenar tu cartera; no miden rentabilidad.</p></div></div>`;
  el.hidden = false;
  pintarTemporada(sem);
}

// Ronda 35 · en «Hoy», bajo la cartera principal: la FRASE CON ICONOS y la RUEDA DE SU TEMPORADA (una esfera por semana con foto en el servidor).
// El color de cada esfera sale de su concentración (verde baja · ámbar media · cobre alta); el dato grande es ese nivel. Sin importes ni rentabilidad.
const TONO_SEM = { ok: ['#7FF0D0', '#2E8F9E'], medio: ['#FFE3A1', '#C98A2E'], alto: ['#FFB27A', '#C2462B'] };
const ICO = { sectores: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8"/><path d="M12 4v8l6 4"/></svg>', chispa: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3"/></svg>' };
function pintarTemporada(sem) {
  const fr = $('#hoy-frase'), cont = $('#hoy-temporada'); if (!fr || !cont || !sem) return;
  const c = sem.carteras.find(x => String(x.id) === cont.dataset.cartera); if (!c || !c.foto) return;
  const h = (c.historial || []).map(fotoValida).filter(Boolean).sort((a, b) => a.semana.localeCompare(b.semana)).slice(-8), ev = evolucion(h, sem.semana);
  const t = ev.tendencias?.concentracion?.tendencia, v = ev.tendencias?.variedad?.tendencia;
  const como = !ev.tendencias ? 'estrena su temporada esta semana' : t === 'mejora' || v === 'mejora' ? `ha mejorado desde la ${'semana del ' + XS.fmtFecha(ev.desde)}` : t === 'empeora' || v === 'empeora' ? `está más concentrada que la ${'semana del ' + XS.fmtFecha(ev.desde)}` : 'se mantiene estable';
  fr.innerHTML = `Tu cartera ${ICO.sectores} reparte en <b>${c.foto.n_categorias} ${c.foto.n_categorias === 1 ? 'categoría' : 'categorías'}</b> y ${ICO.chispa} <b>${esc(como)}</b>.`;
  fr.hidden = false;
  if (!h.length) return;
  const items = h.map(f => ({ etiqueta: XS.fmtFecha(f.semana).replace(/ \d{4}$/, ''), tono: TONO_SEM[f.concentracion], cifra: NIVELES_SEMANA.concentracion[f.concentracion],
    eti: `Semana del ${XS.fmtFecha(f.semana)} · concentración`, frase: `Variedad ${NIVELES_SEMANA.variedad[f.variedad].toLowerCase()} · ${f.n_categorias} ${f.n_categorias === 1 ? 'categoría' : 'categorías'}`,
    aria: `Semana del ${XS.fmtFecha(f.semana)}: concentración ${NIVELES_SEMANA.concentracion[f.concentracion].toLowerCase()}` }));
  let primera = true; try { primera = !sessionStorage.getItem('klever_rueda_vista'); sessionStorage.setItem('klever_rueda_vista', '1'); } catch { /* sin almacenamiento */ }
  cont.hidden = false;
  montarRueda(cont, items, { titulo: 'Tu temporada, semana a semana', inicio: items.length - 1, auto: primera && items.length > 1,
    alAbrir: i => { const f = h[i], s = f.senales.filter(q => q.id !== 'ok'); return `<p class="rh-eti">Semana del ${esc(XS.fmtFecha(f.semana))}</p><h3 class="rh-t">${s.length ? 'Señales de esa semana' : 'Sin concentraciones destacadas'}</h3>${s.length ? `<ul class="rh-senales">${s.map(q => `<li class="senal-${esc(q.nivel)}"><i aria-hidden="true"></i>${esc(q.titulo)}</li>`).join('')}</ul>` : ''}<p class="mut peq">Foto semanal de tu cartera (niveles y señales). No mide rentabilidad.</p>`; } });
}

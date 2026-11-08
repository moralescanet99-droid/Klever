// Ronda 36 · pantalla de la LIGA (Temporada 0) y su acceso en «Hoy». Reglas: ronda36/LIGA.md. Datos: /api/liga (sin correos ni importes).
import { $, esc, store } from './base.js';
let XL = null;   // contexto: { api, logged, go, toast, toastError, medir }
const CLAVE_UNIRSE = 'klever_liga_codigo';   // código que llega por un enlace de invitación (?liga=CODIGO), hasta poder usarlo
export function iniciarLiga(ctx) {
  XL = ctx;
  try { const c = new URLSearchParams(location.search).get('liga'); if (c) sessionStorage.setItem(CLAVE_UNIRSE, c.toUpperCase().slice(0, 6)); } catch { /* sin almacenamiento */ }
  const el = $('#liga-cuerpo'); if (!el) return;
  el.addEventListener('submit', async e => {
    const f = e.target.closest('form'); if (!f) return; e.preventDefault(); const datos = Object.fromEntries(new FormData(f)), err = f.querySelector('.error'), btn = f.querySelector('button[type=submit]');
    const cuerpo = f.id === 'liga-perfil' ? { accion: 'perfil', apodo: datos.apodo, publica: !!datos.publica } : f.id === 'liga-inscribir' ? { accion: 'inscribir', cartera_id: +datos.cartera } : f.id === 'liga-crear' ? { accion: 'crear_liga', nombre: datos.nombre } : f.id === 'liga-unirse' ? { accion: 'unirse', codigo: datos.codigo } : null;
    if (!cuerpo) return; if (btn) btn.disabled = true;
    try { await XL.api('/liga', { method: 'POST', body: cuerpo }); if (cuerpo.accion === 'unirse') { try { sessionStorage.removeItem(CLAVE_UNIRSE); } catch { /* nada */ } }
      XL.toast({ perfil: 'Apodo guardado', inscribir: 'Cartera inscrita en la Liga', crear_liga: 'Liga creada: invita con su código', unirse: 'Te has unido a la liga' }[cuerpo.accion]); mostrarLiga(); }
    catch (x) { if (err) err.textContent = x.message; } finally { if (btn?.isConnected) btn.disabled = false; }
  });
  el.addEventListener('click', async e => {
    const inv = e.target.closest('[data-liga-invitar]');
    if (inv) { const codigo = inv.dataset.ligaInvitar, url = location.origin + location.pathname + '?liga=' + codigo, texto = `Únete a mi liga «${inv.dataset.nombre}» en Klever (carteras simuladas, sin dinero real). Código: ${codigo}`;
      try { if (navigator.share) { await navigator.share({ title: 'Liga en Klever', text: texto, url }); XL.medir?.('compartir'); return; } } catch { return; }
      try { await navigator.clipboard.writeText(texto + ' ' + url); XL.toast('Invitación copiada: pégala donde quieras'); XL.medir?.('compartir'); } catch { XL.toast('Código de la liga: ' + codigo); } return; }
    const s = e.target.closest('[data-liga-salir], [data-liga-borrar]'); if (!s) return;
    const borrar = !!s.dataset.ligaBorrar; if (!confirm(borrar ? '¿Borrar la liga para todos sus miembros?' : '¿Salir de esta liga?')) return;
    try { await XL.api('/liga', { method: 'POST', body: { accion: borrar ? 'borrar_liga' : 'salir', liga_id: +(s.dataset.ligaBorrar || s.dataset.ligaSalir) } }); mostrarLiga(); } catch (x) { XL.toastError(x.message); }
  });
}
const barraLiga = d => { const t = d.total || 0; return `<li class="lg-sem" title="Semana del ${esc(d.semana)}: ${t} puntos"><span class="lg-barra" style="--h:${t}%"><i class="lg-eq" style="flex:${d.equilibrio}"></i><i class="lg-ap" style="flex:${d.aprendizaje}"></i><i class="lg-co" style="flex:${d.constancia}"></i></span><small>${t}</small></li>`; };
const filaLiga = f => `<li class="${f.tu ? 'tu' : ''}"><span class="lg-pos">${f.puesto}</span><span class="lg-apodo">${esc(f.apodo)}</span><b>${f.total}</b></li>`;
let ligaSeq = 0;
export async function mostrarLiga() {
  const el = $('#liga-cuerpo'); if (!el) return; const seq = ++ligaSeq;
  if (!XL.logged()) { el.innerHTML = '<div class="pag-cab"><h1>Liga</h1><p class="mut">Entra con tu cuenta para jugar la Liga. Es gratis y sin dinero real.</p></div>'; return; }
  el.innerHTML = '<div class="pag-cab"><h1>Liga</h1></div><div class="esq-lista"><span class="sr">Cargando la Liga…</span><span class="esq"></span><span class="esq"></span></div>';
  let L, carteras = []; try { [L, carteras] = await Promise.all([XL.api('/liga'), XL.api('/portfolios')]); } catch (x) { if (seq === ligaSeq) el.innerHTML = `<div class="pag-cab"><h1>Liga</h1></div><p class="estado-lista">${esc(x.message)} <button class="enlace" type="button" data-retry="liga">Reintentar</button></p>`; return; }
  if (seq !== ligaSeq || !XL.logged()) return;
  const T = L.temporada, yo = L.yo, d = yo.puntos?.detalle || [], actual = d[d.length - 1];
  let codigoPend = ''; try { codigoPend = sessionStorage.getItem(CLAVE_UNIRSE) || ''; } catch { /* nada */ }
  const perfil = `<form id="liga-perfil" class="panel lg-perfil"><h2>Tu apodo</h2><p class="mut peq">Es lo único que ven los demás (nunca tu correo).</p>
      <label for="lg-apodo">Apodo</label><input id="lg-apodo" name="apodo" maxlength="20" minlength="3" value="${esc(yo.apodo || '')}" required>
      <label class="chk"><input type="checkbox" name="publica" ${yo.publica ? 'checked' : ''}> <span>Aparecer en la clasificación general</span></label>
      <p><button class="btn btn-secundario" type="submit">Guardar apodo</button></p><p class="error" role="alert"></p></form>`;
  const validas = carteras.filter(c => (c.posiciones || []).length);
  const inscr = yo.inscripcion ? `<p class="lg-juegas">Juegas con <b>«${esc(yo.inscripcion.nombre || 'tu cartera')}»</b>${T.puede_cambiar ? ' · puedes cambiarla hasta la semana 2' : ''}.</p>` : '';
  const formInscr = !yo.inscripcion || T.puede_cambiar ? (validas.length ? `<form id="liga-inscribir" class="lg-inscribir"><label for="lg-cartera">${yo.inscripcion ? 'Cambiar de cartera' : 'Elige la cartera con la que juegas'}</label><select id="lg-cartera" name="cartera">${validas.map(c => `<option value="${c.id}" ${yo.inscripcion?.cartera_id === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select><button class="btn ${yo.inscripcion ? 'btn-secundario' : 'btn-primario'}" type="submit">${yo.inscripcion ? 'Cambiar' : 'Inscribir'}</button><p class="error" role="alert"></p></form>` : '<p class="mut">Crea primero una cartera con al menos 4 posiciones para inscribirte. <a href="#inicio">Crear cartera</a></p>') : '';
  el.innerHTML = `<div class="pag-cab"><p class="eyebrow">${esc(T.nombre)} · semana ${T.semana} de ${T.semanas}</p><h1>Liga</h1><p class="lead">Gana quien mejor construye y cuida su cartera, no quien tiene más suerte. Sin dinero real.</p>
      <details class="mini lg-reglas"><summary>Cómo se puntúa</summary><ul><li><b>Equilibrio</b> (hasta 50 por semana): concentración baja 25 · media 12; variedad amplia 25 · media 12. Con al menos 4 posiciones y la cartera al 100 %.</li><li><b>Aprendizaje</b> (hasta 30): reto de la semana 20 · una idea guardada o revisada 10.</li><li><b>Constancia</b> (hasta 20): entrar esa semana 10 · +2 por semana seguida (hasta 10).</li></ul><p class="mut peq">Cuenta la foto de cada lunes. 12 semanas por temporada. Simulación · sin dinero real · no es consejo.</p></details></div>
    <section class="panel lg-mio" aria-labelledby="lg-mio-t"><h2 id="lg-mio-t">Tu temporada</h2>${inscr}${formInscr}
      ${yo.puntos ? `<div class="lg-total"><b class="lg-num">${yo.puntos.total}</b><span>puntos${yo.puesto_general ? ` · puesto ${yo.puesto_general} de ${yo.en_general}` : ''}</span></div>
        <ol class="lg-semanas" aria-label="Puntos por semana">${d.map(barraLiga).join('')}</ol>
        <p class="lg-leyenda"><i class="lg-eq"></i> equilibrio <i class="lg-ap"></i> aprendizaje <i class="lg-co"></i> constancia</p>
        ${actual ? `<p class="mut peq">Esta semana: equilibrio ${actual.equilibrio}${actual.motivo ? ` (${esc(actual.motivo)})` : ''} · aprendizaje ${actual.aprendizaje} · constancia ${actual.constancia}.</p>` : ''}` : ''}</section>
    ${yo.apodo ? '' : perfil}
    <section class="panel" aria-labelledby="lg-gen-t"><h2 id="lg-gen-t">Clasificación general</h2>${L.general.length ? `<ol class="lg-clas">${L.general.map(filaLiga).join('')}</ol>` : '<p class="mut">Aún no hay nadie en la clasificación pública. Activa «Aparecer en la clasificación general» con tu apodo.</p>'}${yo.apodo ? `<details class="mini"><summary>Tu apodo: ${esc(yo.apodo)}</summary>${perfil}</details>` : ''}</section>
    <section class="panel" aria-labelledby="lg-priv-t"><h2 id="lg-priv-t">Ligas privadas</h2><p class="mut peq">Con tus amigos, tu piso o tu clase. Klever no envía nada a nadie: invitas tú con el código.</p>
      ${L.privadas.map(l => `<article class="lg-priv"><div class="lg-priv-cab"><h3>${esc(l.nombre)}</h3><span class="lg-codigo" aria-label="Código ${esc(l.codigo.split('').join(' '))}">${esc(l.codigo)}</span></div>
        <ol class="lg-clas">${l.clasificacion.map(filaLiga).join('')}</ol>${l.sin_inscribir ? `<p class="mut peq">${l.sin_inscribir} ${l.sin_inscribir === 1 ? 'persona aún no ha' : 'personas aún no han'} inscrito su cartera.</p>` : ''}
        <p class="lg-acc"><button class="btn btn-secundario" type="button" data-liga-invitar="${esc(l.codigo)}" data-nombre="${esc(l.nombre)}">Invitar</button> ${l.mia ? `<button class="enlace" type="button" data-liga-borrar="${l.id}">Borrar liga</button>` : `<button class="enlace" type="button" data-liga-salir="${l.id}">Salir</button>`}</p></article>`).join('')}
      <div class="lg-forms"><form id="liga-unirse"><label for="lg-codigo">Unirme con un código</label><input id="lg-codigo" name="codigo" maxlength="6" autocapitalize="characters" value="${esc(codigoPend)}" required><button class="btn btn-secundario" type="submit">Unirme</button><p class="error" role="alert"></p></form>
        <form id="liga-crear"><label for="lg-nombre">Crear una liga</label><input id="lg-nombre" name="nombre" maxlength="40" minlength="3" placeholder="Los del piso" required><button class="btn btn-secundario" type="submit">Crear</button><p class="error" role="alert"></p></form></div></section>
    <p class="sello-b">Simulación · sin dinero real · no es consejo</p>`;
}
// Acceso desde «Hoy»: puesto y puntos (o la invitación a jugar)
export async function resumenLigaHoy(vigente) {
  const el = $('#hoy-liga'); if (!el) return;
  let L = null; try { L = await XL.api('/liga'); } catch { return; } if (!vigente()) return;
  const p = L.yo.puntos;
  el.innerHTML = `<a class="hoy-liga" href="#liga"><span class="hoy-liga-t">${esc(L.temporada.nombre)} · semana ${L.temporada.semana} de ${L.temporada.semanas}</span><b>${p ? `${p.total} puntos${L.yo.puesto_general ? ` · puesto ${L.yo.puesto_general}` : ''}` : 'Juega la Liga'}</b><span class="hoy-liga-ir" aria-hidden="true">→</span></a>`;
  el.hidden = false;
}
export const codigoLigaPendiente = () => { try { return sessionStorage.getItem(CLAVE_UNIRSE) || ''; } catch { return ''; } };
export const limpiarLiga = () => { ligaSeq++; for (const s of ['#liga-cuerpo', '#hoy-liga']) { const e = $(s); if (e) { e.innerHTML = ''; if (s === '#hoy-liga') e.hidden = true; } } };

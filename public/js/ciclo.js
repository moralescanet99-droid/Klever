// Ronda 30 · CERRAR EL CICLO DE LAS IDEAS. PURO (lo usan el servidor y la interfaz).
// Al guardar una idea, el SERVIDOR hace una foto de las comprobaciones de las empresas que toca (la que se añade o cambia de peso y las que ceden peso).
// Después, la interfaz compara esa foto con las comprobaciones de hoy: «Hace 34 días guardaste esta idea; esto ha cambiado en los datos de esas empresas».
// Solo datos de las empresas (las cinco comprobaciones y el periodo del informe): NUNCA precios ni rentabilidad, y no dice qué hacer.
export const CLAVES_CICLO = Object.freeze(['deuda_ebitda', 'roic', 'margen_neto', 'flujo_caja', 'crecimiento']);
export const ETIQUETAS_CICLO = Object.freeze({ deuda_ebitda: 'Deuda / EBITDA', roic: 'ROIC', margen_neto: 'Margen neto', flujo_caja: 'Caja libre', crecimiento: 'Crecimiento' });
export const ESTADO_CICLO = Object.freeze({ ok: 'superada', no: 'no superada', nd: 'sin datos' });
export const MAX_EMPRESAS_FOTO = 8;
const estCiclo = x => x?.ok === true ? 'ok' : x?.ok === false ? 'no' : 'nd';
const TICKER_CICLO = /^[A-Z.]{1,6}$/, FECHA_CICLO = /^\d{4}-\d{2}-\d{2}$/;

// Empresas de una idea: primero la que se añade o cambia de peso; después las que cambian de peso, de más a menos cambio. Como mucho 8.
export function empresasDeIdea(base, propuesta, ticker) {
  const b = Object.fromEntries((base || []).map(p => [p.ticker, Number(p.peso) || 0])), d = Object.fromEntries((propuesta || []).map(p => [p.ticker, Number(p.peso) || 0]));
  const otras = [...new Set([...Object.keys(b), ...Object.keys(d)])].filter(t => t !== ticker).map(t => [t, Math.abs((d[t] || 0) - (b[t] || 0))]).filter(([, x]) => x > 1e-9)
    .sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([t]) => t);
  return [ticker, ...otras].filter(t => TICKER_CICLO.test(t || '')).slice(0, MAX_EMPRESAS_FOTO);
}
// Foto: { fecha, empresas: { T: { periodo, c: { clave: 'ok'|'no'|'nd' } } | { periodo: null, c: null } (sin datos) } }. criterios: { T: criterios_cumplidos (con periodo) }.
export function fotoDatos(tickers, criterios, fecha) {
  const empresas = {};
  for (const t of tickers) { const c = criterios?.[t]; empresas[t] = c ? { periodo: typeof c.periodo === 'string' ? c.periodo.slice(0, 12) : null, c: Object.fromEntries(CLAVES_CICLO.map(k => [k, estCiclo(c[k])])) } : { periodo: null, c: null }; }
  return { fecha, empresas };
}
// Una foto leída de la base se revalida: si no tiene la forma esperada se descarta (null), nunca se muestra a medias.
export function validarFoto(o) {
  if (!o || typeof o !== 'object' || !FECHA_CICLO.test(o.fecha || '') || !o.empresas || typeof o.empresas !== 'object') return null;
  const ks = Object.keys(o.empresas); if (!ks.length || ks.length > MAX_EMPRESAS_FOTO || ks.some(t => !TICKER_CICLO.test(t))) return null;
  const empresas = {};
  for (const t of ks) {
    const e = o.empresas[t]; if (!e || typeof e !== 'object') return null;
    if (e.periodo != null && (typeof e.periodo !== 'string' || e.periodo.length > 12)) return null;
    if (e.c === null) { empresas[t] = { periodo: e.periodo ?? null, c: null }; continue; }
    if (!e.c || typeof e.c !== 'object' || Object.keys(e.c).some(k => !CLAVES_CICLO.includes(k)) || CLAVES_CICLO.some(k => !['ok', 'no', 'nd'].includes(e.c[k]))) return null;
    empresas[t] = { periodo: e.periodo ?? null, c: { ...e.c } };
  }
  return { fecha: o.fecha, empresas };
}
// Qué ha cambiado: por empresa, el periodo del informe (si es otro) y cada comprobación que cambia de estado. ahora: { T: criterios de hoy } (de /api/ideas).
// Una empresa que hoy no aparece se marca «sin_lectura» (no se sabe; no es un cambio). n = número de comprobaciones que han cambiado.
export function cambiosDatos(foto, ahora) {
  const f = validarFoto(foto); if (!f) return null;
  const empresas = Object.entries(f.empresas).map(([ticker, e]) => {
    const hoy = ahora?.[ticker];
    if (hoy === undefined) return { ticker, sin_lectura: true, periodo: null, cambios: [] };
    const periodo = hoy && e.periodo !== (hoy.periodo ?? null) ? { antes: e.periodo, ahora: hoy.periodo ?? null } : null;
    const cambios = CLAVES_CICLO.map(k => ({ clave: k, etiqueta: ETIQUETAS_CICLO[k], antes: e.c ? e.c[k] : 'nd', ahora: hoy ? estCiclo(hoy[k]) : 'nd' })).filter(x => x.antes !== x.ahora);
    return { ticker, sin_lectura: false, periodo, cambios };
  });
  return { desde: f.fecha, empresas, n: empresas.reduce((a, e) => a + e.cambios.length, 0), periodos: empresas.filter(e => e.periodo).length };
}
export const diasEntre = (desde, hoy) => Math.round((Date.parse(hoy + 'T00:00:00Z') - Date.parse(desde + 'T00:00:00Z')) / 864e5);
// «Mira atrás» en «Tu semana»: la idea EN ESTUDIO más antigua que tiene foto y al menos `minDias` días. null si no hay ninguna.
export function miraAtras(ideas, hoy, ahora, minDias = 28) {
  const cand = (ideas || []).filter(e => e.estado === 'en_estudio' && e.foto_datos && validarFoto(e.foto_datos) && diasEntre(e.foto_datos.fecha, hoy) >= minDias)
    .sort((a, b) => a.foto_datos.fecha.localeCompare(b.foto_datos.fecha) || a.id - b.id);
  if (!cand.length) return null;
  const e = cand[0];
  return { id: e.id, nombre: e.nombre, motivo: e.pregunta || e.nota || '', dias: diasEntre(e.foto_datos.fecha, hoy), cambios: cambiosDatos(e.foto_datos, ahora) };
}

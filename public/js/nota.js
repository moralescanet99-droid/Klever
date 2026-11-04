// NOTA DE ESTRUCTURA Y SOLIDEZ · v1 — módulo PURO y VERSIONADO (sin DOM, sin red, sin reloj), compartido por cartera y laboratorio.
// Describe la ESTRUCTURA de una cartera de acciones y los FUNDAMENTALES observados en una fecha de evaluación. NO es una previsión de rentabilidad,
// no mide riesgo de mercado y una nota alta no garantiza rentabilidad ni idoneidad personal. Los umbrales son PROVISIONALES: su activación con datos
// reales queda pendiente de calibración y verificación; con datos de prueba/sintéticos solo sirve para probar el método.
// El universo se recibe CONGELADO (instantánea con su fecha): la misma cartera, la misma fecha y los mismos datos dan SIEMPRE la misma nota.
export const VERSION_NOTA = 'estructura-v1';
export const PESOS = { empresas: 20, sectores: 20, tamano: 15, deuda: 25, rentabilidad: 20 };
export const NOMBRES = { empresas: 'Empresas', sectores: 'Sectores y actividades', tamano: 'Tamaño y liquidez', deuda: 'Deuda y caja', rentabilidad: 'Rentabilidad y crecimiento' };
export const PARAMETROS = { minCobertura: 0.9, minComparables: 20, ejercicios: 5, sesiones: 60, maxEmpresasEfectivas: 15, maxSectoresEfectivos: 6, maxActividadesEfectivas: 10 };
const SIN_METODOLOGIA = new Set(['Finanzas']);          // bancos y aseguradoras: sin metodología de deuda/EBITDA ni ROIC → peso «sin evaluar» en esos indicadores

const cm1 = c => (c * 100).toFixed(1).replace('.', ',');
const esNum = v => v != null && Number.isFinite(v);
const escala = (n, max) => 1 + 9 * (Math.min(n, max) - 1) / (max - 1);          // lineal: 1 punto con n = 1 … 10 con n ≥ max
const frecuencia = (aciertos, periodos) => 1 + 9 * aciertos / periodos;           // 1 + 9 × aciertos / periodos
const dec = p => Math.round(p * 10);                                               // % → décimas (enteros: sin errores de coma flotante)
// Percentil por rango medio (los EMPATES reparten: cuentan la mitad). p ∈ [0, 100]: 100·(menores + ½·iguales) / n. La lista incluye el propio valor.
export function percentil(v, lista) { let menores = 0, iguales = 0; for (const x of lista) { if (x < v) menores++; else if (x === v) iguales++; } return 100 * (menores + iguales / 2) / lista.length; }
const percentilAPuntos = p => 1 + 9 * p / 100;
export const mediana = xs => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Ventana de los últimos `ejercicios` periodos consecutivos (FYaaaa): hace falta que estén TODOS; si falta alguno, la ventana no existe.
function ventana(ej, n = PARAMETROS.ejercicios) {
  const ys = (ej || []).map(x => ({ y: +String(x.p).replace(/\D/g, ''), x })).filter(o => o.y).sort((a, b) => a.y - b.y); if (ys.length < n) return null;
  const u = ys.slice(-n); for (let i = 1; i < n; i++) if (u[i].y !== u[i - 1].y + 1) return null; return u.map(o => o.x);
}

// Datos derivados por empresa (una vez por universo): lo que cada indicador necesita y por qué falta. Ausente, cero y negativo son TRES entradas distintas:
// un dato ausente deja el indicador PENDIENTE; un EBITDA observado ≤ 0 con deuda positiva es un hecho (1 punto); nunca se rellena un hueco.
const CACHE = new WeakMap();                                   // por referencia de `empresas`: copiar el universo con otras empresas no hereda una preparación ajena
const claveMk = e => `${e.moneda || ''}|${e.fuenteMercado || ''}`;
function preparar(universo) {
  if (CACHE.has(universo.empresas)) return CACHE.get(universo.empresas);
  const E = {}, accs = Object.entries(universo.empresas).filter(([, e]) => e.tipo === 'accion');
  // moneda y fuente de mercado de REFERENCIA = la más frecuente entre quienes tienen datos de mercado con procedencia (un empate no fija ninguna)
  const cuenta = {}; for (const [, e] of accs) if (((esNum(e.cap) && e.cap > 0) || (esNum(e.imp) && e.imp > 0)) && e.moneda && e.fuenteMercado) cuenta[claveMk(e)] = (cuenta[claveMk(e)] || 0) + 1;
  const orden = Object.entries(cuenta).sort((a, b) => b[1] - a[1]), ref = orden.length && (orden.length === 1 || orden[0][1] > orden[1][1]) ? orden[0][0] : null;
  for (const [t, e] of accs) {
    const w = ventana(e.ej), ult = e.ej?.length ? [...e.ej].sort((a, b) => String(a.p).localeCompare(String(b.p))).at(-1) : null, o = { t, sector: e.sector, actividad: e.actividad, emisor: e.emisor, motivos: {} };
    const fin = SIN_METODOLOGIA.has(e.sector);
    // deuda neta / EBITDA del último ejercicio
    if (fin) o.motivos.ratio = 'Sector sin metodología de deuda/EBITDA (banca y seguros).';
    else if (!ult) o.motivos.ratio = 'Sin fundamentales.';
    else {
      const d = ult.deuda, eb = ult.ebitda;
      if (!esNum(d)) o.motivos.ratio = 'Falta la deuda neta del último ejercicio.';
      else if (!esNum(eb)) o.motivos.ratio = 'Falta el EBITDA del último ejercicio (un dato ausente no es un EBITDA cero).';
      else if (d <= 0 && eb > 0) o.deudaCaso = { caso: 'caja neta con EBITDA positivo', puntos: 10 };
      else if (d > 0 && eb <= 0) o.deudaCaso = { caso: 'deuda con EBITDA nulo o negativo', puntos: 1 };
      else if (d > 0 && eb > 0) o.ratio = d / eb;
      else o.motivos.ratio = 'Deuda neta no positiva con EBITDA nulo o negativo: sin evaluar.';
    }
    if (w) { o.fcf = w.every(x => esNum(x.fcf)) ? w.filter(x => x.fcf > 0).length : null; o.ben = w.every(x => esNum(x.ni)) ? w.filter(x => x.ni > 0).length : null;
      o.crec = w.every(x => esNum(x.ing) && x.ing > 0) ? w.slice(1).filter((x, i) => x.ing > w[i].ing).length : null; o.roicMed = !fin && w.every(x => esNum(x.roic)) ? mediana(w.map(x => x.roic)) : null; }
    else o.motivos.ventana = `Faltan ejercicios: hacen falta ${PARAMETROS.ejercicios} consecutivos.`;
    // mercado: con moneda, fuente y fecha, de la misma procedencia que el resto, y (liquidez) con las 60 sesiones acordadas
    const tieneCap = esNum(e.cap) && e.cap > 0, tieneImp = esNum(e.imp) && e.imp > 0;
    let mk = null;
    if (!tieneCap && !tieneImp) mk = 'Faltan los datos de mercado (capitalización e importe diario negociado).';
    else if (!e.moneda || !e.fuenteMercado || !e.fechaMercado) mk = 'Faltan la moneda, la fuente o la fecha de los datos de mercado.';
    else if (claveMk(e) !== ref) mk = ref ? `Moneda o fuente de mercado (${e.moneda}, ${e.fuenteMercado}) distinta de la del resto del universo (${ref.replace('|', ', ')}): no son comparables.` : 'No hay una moneda y fuente de mercado de referencia común (empate o mezcla).';
    o.cap = !mk && tieneCap ? e.cap : null; o.imp = !mk && tieneImp && esNum(e.sesiones) && e.sesiones >= PARAMETROS.sesiones ? e.imp : null;
    if (!o.cap) o.motivos.cap = mk || 'Falta la capitalización.';
    if (!o.imp) o.motivos.liq = mk || (!tieneImp ? 'Falta el importe diario negociado.' : !esNum(e.sesiones) ? 'No consta el número de sesiones de negociación.' : `Solo hay ${e.sesiones} sesiones de negociación (hacen falta ${PARAMETROS.sesiones}).`);
    E[t] = o;
  }
  const porSector = {}; for (const o of Object.values(E)) { (porSector[o.sector] ||= { ratios: [], roics: [] }); if (o.ratio != null) porSector[o.sector].ratios.push(o.ratio); if (o.roicMed != null) porSector[o.sector].roics.push(o.roicMed); }
  const caps = Object.values(E).filter(o => o.cap).map(o => o.cap), imps = Object.values(E).filter(o => o.imp).map(o => o.imp);
  const prep = { E, porSector, caps, imps }; CACHE.set(universo.empresas, prep); return prep;
}

// cartera: [{ ticker, peso }] (peso en %). universo: { fecha, empresas: { TICKER: { nombre, tipo, sector, actividad, emisor, cap, imp, ej: [{ p, ing, ni, op, ebitda, deuda, fcf, roic, f, d }] } } }
export function evaluar(cartera, universo) {
  const res = { version: VERSION_NOTA, fecha: universo.fecha ?? null, origenDatos: universo.origen ?? null, publicada: false, nota: null, motivo: null, cobertura: null, bloques: null, fortaleza: null, limitacion: null, sinEvaluar: [], total: 0, avisoMetodo: 'Estructura y fundamentales observados; no es una previsión de rentabilidad ni una recomendación.' };
  const pos = (cartera || []).filter(p => p?.peso > 0); res.total = pos.reduce((s, p) => s + dec(p.peso), 0) / 10;
  // Reparto con nombres (para explicar la nota con las posiciones REALES de la cartera: «X pesa el 60 %»)
  res.reparto = pos.map(p => ({ ticker: p.ticker, nombre: universo.empresas?.[p.ticker]?.nombre ?? p.ticker, sector: universo.empresas?.[p.ticker]?.sector ?? null, peso: dec(p.peso) / 10 })).sort((a, b) => b.peso - a.peso || a.ticker.localeCompare(b.ticker));
  if (!pos.length) { res.motivo = 'La cartera está vacía: no hay nada que evaluar.'; return res; }
  if (dec(res.total) !== 1000) { res.motivo = `La cartera suma ${String(res.total).replace('.', ',')} %: la nota solo se calcula con el 100 % asignado (no se reescala una cartera incompleta ni se recorta una que excede).`; return res; }
  if (universo.origen !== 'sintetico' && universo.habilitada !== true) { res.motivo = 'La nota todavía no está habilitada con datos reales o mezclados: antes hay que calibrar los umbrales y verificar los datos. Solo se calcula con un conjunto sintético identificado.'; return res; }
  const P = preparar(universo), tot = 1000;
  const empresas = pos.map(p => ({ t: p.ticker, w: dec(p.peso), o: P.E[p.ticker] })), noAccion = empresas.filter(x => !x.o);
  for (const x of noAccion) res.sinEvaluar.push({ ticker: x.t, peso: x.w / 10, motivos: [universo.empresas[x.t] ? 'Fondo (ETF) sin metodología ni composición válida: cuenta como peso sin evaluar.' : 'No está en el universo evaluado.'] });
  const bloques = {};
  const cierre = (id, evaluables, puntuarEmpresa, extra = {}) => {            // evaluables: [{t, w}] con puntuación por empresa; pondera por peso normalizado
    const E = evaluables.reduce((s, x) => s + x.w, 0), cob = E / tot;
    bloques[id] = { id, nombre: NOMBRES[id], peso: PESOS[id], cobertura: cob, disponible: E >= PARAMETROS.minCobertura * tot, puntuacion: null, ...extra };
    return E;
  };
  const motivoSin = (x, m) => { const e = res.sinEvaluar.find(s => s.ticker === x.t); if (e) { if (!e.motivos.includes(m)) e.motivos.push(m); } else res.sinEvaluar.push({ ticker: x.t, peso: x.w / 10, motivos: [m] }); };
  // ---- Empresas: número efectivo N = 1 / Σ (peso)²; las clases de una misma compañía cuentan UNA vez
  { const ev = empresas.filter(x => x.o && x.o.emisor); empresas.filter(x => x.o && !x.o.emisor).forEach(x => motivoSin(x, 'Sin emisor identificado.'));
    const E = cierre('empresas', ev); const g = {}; ev.forEach(x => { g[x.o.emisor] = (g[x.o.emisor] || 0) + x.w; });
    const N = E ? 1 / Object.values(g).reduce((s, v) => s + (v / E) ** 2, 0) : null;
    Object.assign(bloques.empresas, { efectivas: N, puntuacion: N == null ? null : escala(N, PARAMETROS.maxEmpresasEfectivas), detalle: N == null ? '' : `${N.toFixed(2).replace('.', ',')} empresas efectivas (máximo útil: ${PARAMETROS.maxEmpresasEfectivas}).` }); }
  // ---- Sectores y actividades: mitad sector, mitad actividad (misma fórmula; máximos 6 y 10 efectivos)
  { const ev = empresas.filter(x => x.o && x.o.sector && x.o.actividad); empresas.filter(x => x.o && !(x.o.sector && x.o.actividad)).forEach(x => motivoSin(x, 'Sin sector o actividad.'));
    const E = cierre('sectores', ev); const n = k => { const g = {}; ev.forEach(x => { g[x.o[k]] = (g[x.o[k]] || 0) + x.w; }); return 1 / Object.values(g).reduce((s, v) => s + (v / E) ** 2, 0); };
    if (E) { const Ns = n('sector'), Na = n('actividad'); Object.assign(bloques.sectores, { efectivosSector: Ns, efectivasActividad: Na, puntuacion: (escala(Ns, PARAMETROS.maxSectoresEfectivos) + escala(Na, PARAMETROS.maxActividadesEfectivas)) / 2, detalle: `${Ns.toFixed(2).replace('.', ',')} sectores y ${Na.toFixed(2).replace('.', ',')} actividades efectivas.` }); } }
  // ---- Tamaño y liquidez, deuda y caja, rentabilidad y crecimiento: cada INDICADOR tiene su propia cobertura (≥ 90 % del peso); el bloque se publica si los tiene todos.
  //      Faltan datos en posiciones DISTINTAS para indicadores distintos sin que el bloque se caiga mientras cada indicador conserve su 90 %.
  const bloqueInd = (id, defs) => {
    const inds = defs.map(d => { const ev = []; for (const x of empresas.filter(y => y.o)) { const r = d.fn(x.o); if (r.s == null) motivoSin(x, r.m); else ev.push({ w: x.w, s: r.s }); }
      const E = ev.reduce((s, y) => s + y.w, 0); return { id: d.id, nombre: d.nombre, peso: d.peso, cobertura: E / tot, disponible: E >= PARAMETROS.minCobertura * tot, media: E ? ev.reduce((s, y) => s + y.w * y.s, 0) / E : null }; });
    const disp = inds.every(i => i.disponible);
    bloques[id] = { id, nombre: NOMBRES[id], peso: PESOS[id], cobertura: Math.min(...inds.map(i => i.cobertura)), disponible: disp, indicadores: inds.map(i => ({ id: i.id, nombre: i.nombre, cobertura: i.cobertura, disponible: i.disponible })),
      puntuacion: disp ? inds.reduce((s, i) => s + i.peso * i.media, 0) : null };
  };
  const D = P.porSector;
  const sinComparables = (n, que) => ({ s: null, m: `Solo hay ${n} comparables en su sector (hacen falta ${PARAMETROS.minComparables}) para el percentil de ${que}.` });
  bloqueInd('tamano', [
    { id: 'cap', nombre: 'capitalización', peso: 1 / 3, fn: o => o.cap && P.caps.length > 1 ? { s: percentilAPuntos(percentil(o.cap, P.caps)) } : { s: null, m: o.motivos.cap || 'No hay otras capitalizaciones comparables.' } },
    { id: 'liq', nombre: 'liquidez (importe diario)', peso: 2 / 3, fn: o => o.imp && P.imps.length > 1 ? { s: percentilAPuntos(percentil(o.imp, P.imps)) } : { s: null, m: o.motivos.liq || 'No hay otros importes diarios comparables.' } }]);
  bloqueInd('deuda', [
    { id: 'ratio', nombre: 'deuda neta / EBITDA', peso: 0.5, fn: o => { if (o.motivos.ratio) return { s: null, m: o.motivos.ratio }; if (o.deudaCaso) return { s: o.deudaCaso.puntos }; const l = D[o.sector].ratios; return l.length < PARAMETROS.minComparables ? sinComparables(l.length, 'deuda') : { s: percentilAPuntos(100 - percentil(o.ratio, l)) }; } },
    { id: 'fcf', nombre: 'caja libre de los cinco ejercicios', peso: 0.5, fn: o => SIN_METODOLOGIA.has(o.sector) ? { s: null, m: 'Sector sin metodología de deuda/EBITDA (banca y seguros).' } : o.motivos.ventana ? { s: null, m: o.motivos.ventana } : o.fcf == null ? { s: null, m: 'Falta algún dato de caja libre en los cinco ejercicios.' } : { s: frecuencia(o.fcf, PARAMETROS.ejercicios) } }]);
  bloqueInd('rentabilidad', [
    { id: 'roic', nombre: 'ROIC', peso: 0.5, fn: o => { if (SIN_METODOLOGIA.has(o.sector)) return { s: null, m: 'Sector sin metodología de ROIC (banca y seguros).' }; if (o.motivos.ventana) return { s: null, m: o.motivos.ventana }; if (o.roicMed == null) return { s: null, m: 'Falta algún ROIC en los cinco ejercicios.' };
      const l = D[o.sector].roics; return l.length < PARAMETROS.minComparables ? sinComparables(l.length, 'ROIC') : { s: percentilAPuntos(percentil(o.roicMed, l)) }; } },
    { id: 'ben', nombre: 'años con beneficio', peso: 0.25, fn: o => SIN_METODOLOGIA.has(o.sector) ? { s: null, m: 'Sector sin metodología de ROIC (banca y seguros).' } : o.motivos.ventana ? { s: null, m: o.motivos.ventana } : o.ben == null ? { s: null, m: 'Falta algún dato de beneficio en los cinco ejercicios.' } : { s: frecuencia(o.ben, PARAMETROS.ejercicios) } },
    { id: 'crec', nombre: 'años con ventas al alza', peso: 0.25, fn: o => SIN_METODOLOGIA.has(o.sector) ? { s: null, m: 'Sector sin metodología de ROIC (banca y seguros).' } : o.motivos.ventana ? { s: null, m: o.motivos.ventana } : o.crec == null ? { s: null, m: 'Falta algún dato de ventas en los cinco ejercicios.' } : { s: frecuencia(o.crec, PARAMETROS.ejercicios - 1) } }]);
  res.bloques = bloques;
  const lista = Object.values(bloques), faltan = lista.filter(b => !b.disponible || b.puntuacion == null);
  res.cobertura = { minima: Math.min(...lista.map(b => b.cobertura)), umbral: PARAMETROS.minCobertura };
  for (const b of lista) if (!b.disponible || b.puntuacion == null) b.puntuacion = null;
  const ok = lista.filter(b => b.puntuacion != null);
  if (ok.length) { res.fortaleza = ok.slice().sort((a, b) => b.puntuacion - a.puntuacion || b.peso - a.peso)[0].id; const perd = ok.map(b => ({ id: b.id, perdida: b.peso * (10 - b.puntuacion) })).sort((a, b) => b.perdida - a.perdida)[0]; res.limitacion = { bloque: perd.id, perdida: perd.perdida / 100 }; }
  if (faltan.length) { res.motivo = `Faltan datos para valorar ${faltan.map(b => { const mal = (b.indicadores || []).filter(i => !i.disponible); return `${b.nombre.toLowerCase()} (${mal.length ? mal.map(i => `${i.nombre}: ${cm1(i.cobertura)} %`).join(', ') : `cobertura ${cm1(b.cobertura)} %`}; hace falta ${Math.round(PARAMETROS.minCobertura * 100)} %)`; }).join('; ')}.`; return res; }
  res.nota = Math.round(lista.reduce((s, b) => s + b.peso * b.puntuacion, 0) / 100 * 10) / 10;   // ÚNICO redondeo: el de la nota final, a un decimal
  res.publicada = true; return res;
}

// Resumen compacto y estable (lo que se guarda con un escenario: la evaluación FECHADA que vio la persona).
export const resumenNota = ev => ({ version: ev.version, fecha: ev.fecha, publicada: ev.publicada, nota: ev.nota, motivo: ev.motivo, cobertura: ev.cobertura && Math.round(ev.cobertura.minima * 1000) / 10,
  bloques: ev.bloques ? Object.fromEntries(Object.values(ev.bloques).map(b => [b.id, b.puntuacion == null ? null : Math.round(b.puntuacion * 100) / 100])) : null, fortaleza: ev.fortaleza, limitacion: ev.limitacion });

// ---- Validación ESTRICTA de una evaluación guardada (la usan el servidor al guardar y al leer, y la interfaz al mostrar). Una evaluación es un REGISTRO de lo que vio la
// persona: el servidor no puede recalcularla (el universo de entonces ya no existe), así que solo comprueba su FORMA: números finitos en rango, fechas reales,
// identificadores conocidos y texto sin marcado. Devuelve { ok, motivo } y, si es válida, `limpio`: una copia reconstruida campo a campo (nunca el objeto recibido).
const IDS = Object.keys(PESOS), CLAVES = ['version', 'fecha', 'publicada', 'nota', 'motivo', 'cobertura', 'bloques', 'fortaleza', 'limitacion'];
const num = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
const fechaReal = v => { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d = new Date(v + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().slice(0, 10) === v; };
const textoLimpio = (v, max) => typeof v === 'string' && v.length <= max && !/[<>\u0000-\u001f\u007f]/.test(v);
export function validarResumen(r) {
  const mal = motivo => ({ ok: false, motivo });
  if (!r || typeof r !== 'object' || Array.isArray(r)) return mal('La evaluación no es un objeto.');
  if (Object.keys(r).some(k => !CLAVES.includes(k))) return mal('La evaluación trae campos desconocidos.');
  if (typeof r.version !== 'string' || !/^[a-z0-9-]{1,30}$/.test(r.version)) return mal('La versión del método no es válida.');
  if (typeof r.publicada !== 'boolean') return mal('Falta indicar si la nota está publicada.');
  if (r.fecha != null && !fechaReal(r.fecha)) return mal('La fecha de evaluación no es una fecha real (AAAA-MM-DD).');
  if (r.publicada) {
    if (r.fecha == null) return mal('Una nota publicada necesita su fecha.');
    if (!num(r.nota, 1, 10) || Math.round(r.nota * 10) / 10 !== r.nota) return mal('La nota debe ser un número de 1 a 10 con un decimal.');
    if (!num(r.cobertura, 100 * PARAMETROS.minCobertura, 100)) return mal('Una nota publicada necesita una cobertura de al menos el 90 %.');
  } else {
    if (r.nota != null) return mal('Una nota pendiente no puede llevar cifra.');
    if (r.cobertura != null && !num(r.cobertura, 0, 100)) return mal('La cobertura debe estar entre 0 y 100.');
  }
  if (r.motivo != null && !textoLimpio(r.motivo, 700)) return mal('El motivo contiene marcado o es demasiado largo.');
  if (r.bloques != null) {
    if (typeof r.bloques !== 'object' || Array.isArray(r.bloques) || Object.keys(r.bloques).length !== IDS.length || !IDS.every(k => k in r.bloques)) return mal('Los bloques no son los cinco esperados.');
    for (const k of IDS) { const v = r.bloques[k]; if (!(v === null ? !r.publicada : num(v, 1, 10))) return mal('La puntuación de un bloque no es un número de 1 a 10' + (r.publicada ? '' : ' ni null') + '.'); }
  } else if (r.publicada) return mal('Una nota publicada necesita sus bloques.');
  if (r.fortaleza != null && !IDS.includes(r.fortaleza)) return mal('La fortaleza no es un bloque conocido.');
  if (r.limitacion != null) { const l = r.limitacion; if (typeof l !== 'object' || Array.isArray(l) || !IDS.includes(l.bloque) || !num(l.perdida, 0, 10) || Object.keys(l).some(k => !['bloque', 'perdida'].includes(k))) return mal('La limitación no es válida.'); }
  if (r.publicada && (r.fortaleza == null || r.limitacion == null)) return mal('Una nota publicada necesita su fortaleza y su limitación.');
  return { ok: true, limpio: { version: r.version, fecha: r.fecha ?? null, publicada: r.publicada, nota: r.nota ?? null, motivo: r.motivo ?? null, cobertura: r.cobertura ?? null,
    bloques: r.bloques == null ? null : Object.fromEntries(IDS.map(k => [k, r.bloques[k]])), fortaleza: r.fortaleza ?? null, limitacion: r.limitacion == null ? null : { bloque: r.limitacion.bloque, perdida: r.limitacion.perdida } } };
}

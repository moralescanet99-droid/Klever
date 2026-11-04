// NOTA DE ESTRUCTURA Y SOLIDEZ · v1 — módulo PURO y VERSIONADO (sin DOM, sin red, sin reloj), compartido por cartera y laboratorio.
// Describe la ESTRUCTURA de una cartera de acciones y los FUNDAMENTALES observados en una fecha de evaluación. NO es una previsión de rentabilidad,
// no mide riesgo de mercado y una nota alta no garantiza rentabilidad ni idoneidad personal. Los umbrales son PROVISIONALES: su activación con datos
// reales queda pendiente de calibración y verificación; con datos de prueba/sintéticos solo sirve para probar el método.
// El universo se recibe CONGELADO (instantánea con su fecha): la misma cartera, la misma fecha y los mismos datos dan SIEMPRE la misma nota.
export const VERSION_NOTA = 'estructura-v1';
export const PESOS = { empresas: 20, sectores: 20, tamano: 15, deuda: 25, rentabilidad: 20 };
export const NOMBRES = { empresas: 'Empresas', sectores: 'Sectores y actividades', tamano: 'Tamaño y liquidez', deuda: 'Deuda y caja', rentabilidad: 'Rentabilidad y crecimiento' };
export const PARAMETROS = { minCobertura: 0.9, minComparables: 20, ejercicios: 5, maxEmpresasEfectivas: 15, maxSectoresEfectivos: 6, maxActividadesEfectivas: 10 };
const SIN_METODOLOGIA = new Set(['Finanzas']);          // bancos y aseguradoras: sin metodología de deuda/EBITDA ni ROIC → peso «sin evaluar» en esos indicadores

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

// Datos derivados por empresa (una vez por universo): lo que cada bloque necesita y por qué falta.
const CACHE = new WeakMap();                                   // por referencia de `empresas`: copiar el universo con otras empresas no hereda una preparación ajena
function preparar(universo) {
  if (CACHE.has(universo.empresas)) return CACHE.get(universo.empresas);
  const E = {};
  for (const [t, e] of Object.entries(universo.empresas)) {
    if (e.tipo !== 'accion') continue;
    const w = ventana(e.ej), ult = e.ej?.length ? [...e.ej].sort((a, b) => String(a.p).localeCompare(String(b.p))).at(-1) : null, o = { t, sector: e.sector, actividad: e.actividad, emisor: e.emisor, motivos: {} };
    // deuda neta / EBITDA del último ejercicio
    const fin = SIN_METODOLOGIA.has(e.sector);
    if (fin) o.motivos.deuda = 'Sector sin metodología de deuda/EBITDA (banca y seguros).';
    else if (!ult) o.motivos.deuda = 'Sin fundamentales.';
    else {
      const d = ult.deuda, eb = ult.ebitda;
      if (esNum(d) && d <= 0 && esNum(eb) && eb > 0) o.deudaCaso = { caso: 'caja neta con EBITDA positivo', puntos: 10 };
      else if (esNum(d) && d > 0 && (!esNum(eb) || eb <= 0)) o.deudaCaso = { caso: 'deuda con EBITDA nulo o negativo', puntos: 1 };
      else if (esNum(d) && d > 0 && eb > 0) o.ratio = d / eb;
      else o.motivos.deuda = (!esNum(d) && !esNum(eb)) || ((!esNum(d) || d <= 0) && (!esNum(eb) || eb <= 0)) ? 'Deuda y EBITDA nulos o negativos: sin evaluar.' : 'Falta la deuda neta o el EBITDA del último ejercicio.';
    }
    if (w) { o.fcf = w.every(x => esNum(x.fcf)) ? w.filter(x => x.fcf > 0).length : null; o.ben = w.every(x => esNum(x.ni)) ? w.filter(x => x.ni > 0).length : null;
      o.crec = w.every(x => esNum(x.ing) && x.ing > 0) ? w.slice(1).filter((x, i) => x.ing > w[i].ing).length : null; o.roicMed = !fin && w.every(x => esNum(x.roic)) ? mediana(w.map(x => x.roic)) : null; }
    else o.motivos.ventana = `Faltan ejercicios: hacen falta ${PARAMETROS.ejercicios} consecutivos.`;
    o.cap = esNum(e.cap) && e.cap > 0 ? e.cap : null; o.imp = esNum(e.imp) && e.imp > 0 ? e.imp : null;
    E[t] = o;
  }
  const porSector = {}; for (const o of Object.values(E)) { (porSector[o.sector] ||= { ratios: [], roics: [] }); if (o.ratio != null) porSector[o.sector].ratios.push(o.ratio); if (o.roicMed != null) porSector[o.sector].roics.push(o.roicMed); }
  const caps = Object.values(E).filter(o => o.cap).map(o => o.cap), imps = Object.values(E).filter(o => o.imp).map(o => o.imp);
  const prep = { E, porSector, caps, imps }; CACHE.set(universo.empresas, prep); return prep;
}

// cartera: [{ ticker, peso }] (peso en %). universo: { fecha, empresas: { TICKER: { nombre, tipo, sector, actividad, emisor, cap, imp, ej: [{ p, ing, ni, op, ebitda, deuda, fcf, roic, f, d }] } } }
export function evaluar(cartera, universo) {
  const res = { version: VERSION_NOTA, fecha: universo.fecha ?? null, publicada: false, nota: null, motivo: null, cobertura: null, bloques: null, fortaleza: null, limitacion: null, sinEvaluar: [], total: 0, avisoMetodo: 'Estructura y fundamentales observados; no es una previsión de rentabilidad ni una recomendación.' };
  const pos = (cartera || []).filter(p => p?.peso > 0); res.total = pos.reduce((s, p) => s + dec(p.peso), 0) / 10;
  if (!pos.length) { res.motivo = 'La cartera está vacía: no hay nada que evaluar.'; return res; }
  if (dec(res.total) !== 1000) { res.motivo = `La cartera suma ${String(res.total).replace('.', ',')} %: la nota solo se calcula con el 100 % asignado (no se reescala una cartera incompleta ni se recorta una que excede).`; return res; }
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
  // ---- Por empresa (promedio ponderado por su peso): tamaño y liquidez, deuda y caja, rentabilidad y crecimiento
  const porEmpresa = (id, fn) => { const ev = []; for (const x of empresas.filter(y => y.o)) { const r = fn(x.o); if (r.s == null) motivoSin(x, r.m); else ev.push({ t: x.t, w: x.w, s: r.s }); }
    const E = cierre(id, ev); if (E) bloques[id].puntuacion = ev.reduce((s, x) => s + x.w * x.s, 0) / E; return ev; };
  porEmpresa('tamano', o => (o.cap && o.imp && P.caps.length > 1 && P.imps.length > 1) ? { s: (percentilAPuntos(percentil(o.cap, P.caps)) + 2 * percentilAPuntos(percentil(o.imp, P.imps))) / 3 } : { s: null, m: 'Faltan la capitalización o el importe diario negociado (datos de mercado).' });
  porEmpresa('deuda', o => {
    if (o.motivos.deuda) return { s: null, m: o.motivos.deuda }; if (o.motivos.ventana) return { s: null, m: o.motivos.ventana };
    if (o.fcf == null) return { s: null, m: 'Falta algún dato de caja libre en los cinco ejercicios.' };
    let d; if (o.deudaCaso) d = o.deudaCaso.puntos; else { const l = P.porSector[o.sector].ratios; if (l.length < PARAMETROS.minComparables) return { s: null, m: `Solo hay ${l.length} comparables en su sector (hacen falta ${PARAMETROS.minComparables}) para el percentil de deuda.` }; d = percentilAPuntos(100 - percentil(o.ratio, l)); }
    return { s: (d + frecuencia(o.fcf, PARAMETROS.ejercicios)) / 2 }; });
  porEmpresa('rentabilidad', o => {
    if (o.motivos.ventana) return { s: null, m: o.motivos.ventana }; if (SIN_METODOLOGIA.has(o.sector)) return { s: null, m: 'Sector sin metodología de ROIC (banca y seguros).' };
    if (o.roicMed == null) return { s: null, m: 'Falta algún ROIC en los cinco ejercicios.' }; if (o.ben == null || o.crec == null) return { s: null, m: 'Falta algún dato de beneficio o de ventas en los cinco ejercicios.' };
    const l = P.porSector[o.sector].roics; if (l.length < PARAMETROS.minComparables) return { s: null, m: `Solo hay ${l.length} comparables en su sector (hacen falta ${PARAMETROS.minComparables}) para el percentil de ROIC.` };
    return { s: 0.5 * percentilAPuntos(percentil(o.roicMed, l)) + 0.25 * frecuencia(o.ben, PARAMETROS.ejercicios) + 0.25 * frecuencia(o.crec, PARAMETROS.ejercicios - 1) }; });
  res.bloques = bloques;
  const lista = Object.values(bloques), faltan = lista.filter(b => !b.disponible || b.puntuacion == null);
  res.cobertura = { minima: Math.min(...lista.map(b => b.cobertura)), umbral: PARAMETROS.minCobertura };
  for (const b of lista) if (!b.disponible || b.puntuacion == null) b.puntuacion = null;
  const ok = lista.filter(b => b.puntuacion != null);
  if (ok.length) { res.fortaleza = ok.slice().sort((a, b) => b.puntuacion - a.puntuacion || b.peso - a.peso)[0].id; const perd = ok.map(b => ({ id: b.id, perdida: b.peso * (10 - b.puntuacion) })).sort((a, b) => b.perdida - a.perdida)[0]; res.limitacion = { bloque: perd.id, perdida: perd.perdida / 100 }; }
  if (faltan.length) { res.motivo = `Nota pendiente: ${faltan.map(b => `${b.nombre} (cobertura ${(b.cobertura * 100).toFixed(1).replace('.', ',')} %, hace falta ${Math.round(PARAMETROS.minCobertura * 100)} %)`).join('; ')}.`; return res; }
  res.nota = Math.round(lista.reduce((s, b) => s + b.peso * b.puntuacion, 0) / 100 * 10) / 10;   // ÚNICO redondeo: el de la nota final, a un decimal
  res.publicada = true; return res;
}

// Resumen compacto y estable (lo que se guarda con un escenario: la evaluación FECHADA que vio la persona).
export const resumen = ev => ({ version: ev.version, fecha: ev.fecha, publicada: ev.publicada, nota: ev.nota, motivo: ev.motivo, cobertura: ev.cobertura && Math.round(ev.cobertura.minima * 1000) / 10,
  bloques: ev.bloques ? Object.fromEntries(Object.values(ev.bloques).map(b => [b.id, b.puntuacion == null ? null : Math.round(b.puntuacion * 100) / 100])) : null, fortaleza: ev.fortaleza, limitacion: ev.limitacion });

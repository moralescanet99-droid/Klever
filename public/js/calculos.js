// Cálculos de cartera de Klever: PUROS (sin DOM, sin red, sin fecha). Los usan el cliente, el servidor (valida los escenarios) y las pruebas.
// Trabajan en DÉCIMAS de punto porcentual (enteros): 54,0 % = 540. Así el redondeo es exacto, determinista y los totales siempre cuadran.
// Qué NO hacen (a propósito): no miden riesgo, no puntúan «salud» ni «diversificación», no deducen países ni divisas, no suponen la exposición
// real de un fondo ni calculan solapamientos, y no normalizan una cartera incompleta para que parezca asignada al 100 %.

const aDec = p => Math.round(Number(p) * 10);          // % → décimas
const dePct = d => d / 10;                              // décimas → %
const num = d => String(dePct(d)).replace('.', ',');    // 54 → «54»; 5,4 → «5,4»
const porTicker = (a, b) => (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0);
export const SIN_CATEGORIA = 'Sin categoría conocida';
export const FINANCIACIONES = {
  sin_asignar: 'Usar el porcentaje sin asignar',
  proporcional: 'Reducir proporcionalmente las otras posiciones',
};

function normalizar(pos) {
  const vistos = new Set(), lista = [];
  for (const p of pos || []) {
    const d = aDec(p?.peso);
    if (!p?.ticker || vistos.has(p.ticker) || !(d > 0)) continue;
    vistos.add(p.ticker); lista.push({ ticker: p.ticker, d });
  }
  return lista.sort((a, b) => b.d - a.d || porTicker(a, b));
}

// Radiografía de UNA composición (la que se le pase: guardada o con cambios locales; quien llama dice cuál es).
// activos: { TICKER: { nombre, sector, tipo } }. limite: % personal por posición o null.
export function radiografia(pos, activos = {}, limite = null) {
  const lista = normalizar(pos), total = lista.reduce((s, p) => s + p.d, 0);
  const estado = !lista.length ? 'vacia' : total > 1000 ? 'exceso' : total < 1000 ? 'incompleta' : 'completa';
  const top = lista.slice(0, 3), topD = top.reduce((s, p) => s + p.d, 0);
  const grupos = new Map();
  for (const p of lista) {
    const a = activos[p.ticker] || {}, cat = a.sector || SIN_CATEGORIA;
    const g = grupos.get(cat) || { categoria: cat, d: 0, tickers: [], fondos: 0 };
    g.d += p.d; g.tickers.push(p.ticker); if (a.tipo === 'etf') g.fondos++; grupos.set(cat, g);
  }
  const categorias = [...grupos.values()].sort((a, b) => b.d - a.d || (a.categoria < b.categoria ? -1 : 1))
    .map(g => ({ categoria: g.categoria, peso: dePct(g.d), tickers: g.tickers, // la categoría de un ETF es COMERCIAL: no es su exposición sectorial real
      soloFondos: g.fondos === g.tickers.length, hayFondos: g.fondos > 0, conocida: g.categoria !== SIN_CATEGORIA }));
  const limD = limite == null || limite === '' ? null : aDec(limite);
  const superados = limD == null ? [] : lista.filter(p => p.d > limD).map(p => ({ ticker: p.ticker, peso: dePct(p.d), limite: dePct(limD), exceso: dePct(p.d - limD) }));
  return {
    n: lista.length, total: dePct(total), estado,
    pendiente: total < 1000 ? dePct(1000 - total) : 0, exceso: total > 1000 ? dePct(total - 1000) : 0,
    mayor: lista[0] ? { ticker: lista[0].ticker, peso: dePct(lista[0].d) } : null,
    top3: { n: top.length, peso: dePct(topD), tickers: top.map(p => p.ticker), completo: top.length === 3 },
    categorias, limite: limD == null ? null : dePct(limD), superados,
    cobertura: {
      sinCategoria: lista.filter(p => !(activos[p.ticker]?.sector)).map(p => p.ticker),
      fondos: lista.filter(p => activos[p.ticker]?.tipo === 'etf').map(p => p.ticker),
    },
  };
}

// Simula poner `op.ticker` en `op.peso` % (añadirlo o cambiar su peso) sobre `base`, con una de las dos financiaciones.
// Devuelve siempre el método explicado (`pasos`) y, si no es viable, el motivo; nunca pesos negativos ni ajustes ocultos.
export function simular(base, op, financiacion) {
  const antes = normalizar(base), total = antes.reduce((s, p) => s + p.d, 0);
  const res = { viable: false, motivo: '', financiacion, ticker: op?.ticker || null, antes: antes.map(p => ({ ticker: p.ticker, peso: dePct(p.d) })), despues: [], cambios: [], delta: 0, pasos: [], cuadra: false };
  if (!(financiacion in FINANCIACIONES)) { res.motivo = 'Elige cómo se financia el cambio.'; return res; }
  const nuevo = aDec(op?.peso);
  if (!op?.ticker) { res.motivo = 'Elige un activo.'; return res; }
  if (!Number.isFinite(nuevo) || nuevo < 1 || nuevo > 1000) { res.motivo = 'El peso propuesto debe estar entre 0,1 y 100 %.'; return res; }
  if (total > 1000) { res.motivo = `La cartera base suma ${num(total)} % (exceso de ${num(total - 1000)} %). Corrígela antes de simular.`; return res; }
  const actual = antes.find(p => p.ticker === op.ticker)?.d || 0, delta = nuevo - actual, otras = antes.filter(p => p.ticker !== op.ticker), S = otras.reduce((s, p) => s + p.d, 0);
  res.delta = dePct(delta);
  if (delta === 0) { res.motivo = `${op.ticker} ya tiene el ${num(actual)} % en la cartera base: no hay nada que simular.`; return res; }
  res.pasos.push(`Peso actual de ${op.ticker}: ${num(actual)} %. Peso propuesto: ${num(nuevo)} %. ${delta > 0 ? `Hay que financiar ${num(delta)} puntos.` : `Se liberan ${num(-delta)} puntos.`}`);
  let resto = otras.map(p => ({ ticker: p.ticker, d: p.d }));
  if (financiacion === 'sin_asignar') {
    const pend = 1000 - total;
    res.pasos.push(`Porcentaje sin asignar en la base: ${num(pend)} %.`);
    if (delta > pend) { res.motivo = `No hay suficiente porcentaje sin asignar: hay ${num(pend)} % y el cambio necesita ${num(delta)} %. Prueba a reducir proporcionalmente las otras posiciones.`; return res; }
    res.pasos.push(delta > 0 ? `Las otras posiciones no cambian: el cambio sale del porcentaje sin asignar (${num(pend)} % − ${num(delta)} % = ${num(pend - delta)} %).` : `Las otras posiciones no cambian; los ${num(-delta)} puntos liberados quedan sin asignar.`);
  } else if (delta <= 0) {
    res.pasos.push(`Se liberan ${num(-delta)} puntos y no hay nada que financiar: las otras posiciones no cambian y lo liberado queda sin asignar (no se reparte al alza).`);
  } else {
    if (delta > S) { res.motivo = `Las otras posiciones suman ${num(S)} % y el cambio necesita ${num(delta)} %: no se puede financiar sin dejar pesos negativos.`; return res; }
    const objetivo = S - delta; // lo que deben sumar las otras tras reducirse
    res.pasos.push(`Las otras posiciones suman ${num(S)} % y deben bajar a ${num(objetivo)} %: cada una se multiplica por ${num(objetivo)}/${num(S)}${S ? ` = ${(objetivo / S).toFixed(4).replace('.', ',')}` : ''}.`);
    const t = otras.map(p => { const numer = p.d * objetivo; return { ticker: p.ticker, q: Math.floor(numer / S), r: numer % S }; });
    let sobran = objetivo - t.reduce((s, x) => s + x.q, 0);
    [...t].sort((a, b) => b.r - a.r || porTicker(a, b)).forEach(x => { if (sobran > 0) { x.q++; sobran--; } });
    resto = t.map(x => ({ ticker: x.ticker, d: x.q }));
    res.pasos.push('Redondeo a una décima: se reparten las décimas sobrantes por mayor resto y, a igualdad, por orden de símbolo.');
    const chicas = resto.filter(x => x.d < 1).map(x => x.ticker);
    if (chicas.length) { res.motivo = `La reducción dejaría ${chicas.join(', ')} por debajo del 0,1 %. Elige un peso menor.`; return res; }
  }
  const despues = [...resto, { ticker: op.ticker, d: nuevo }].sort((a, b) => b.d - a.d || porTicker(a, b));
  const totalD = despues.reduce((s, p) => s + p.d, 0), esperado = financiacion === 'sin_asignar' || delta <= 0 ? total + delta : total;
  res.cuadra = totalD === esperado && totalD <= 1000;
  if (!res.cuadra) { res.motivo = 'Los totales no cuadran tras el redondeo.'; return res; } // salvaguarda: no debería ocurrir
  res.viable = true; res.despues = despues.map(p => ({ ticker: p.ticker, peso: dePct(p.d) }));
  const mapA = new Map(antes.map(p => [p.ticker, p.d])), mapD = new Map(despues.map(p => [p.ticker, p.d]));
  res.cambios = [...new Set([...mapA.keys(), ...mapD.keys()])].map(t => ({ ticker: t, antes: dePct(mapA.get(t) || 0), despues: dePct(mapD.get(t) || 0), delta: dePct((mapD.get(t) || 0) - (mapA.get(t) || 0)), nueva: !mapA.has(t) }))
    .sort((a, b) => b.despues - a.despues || porTicker(a, b));
  res.totalAntes = dePct(total); res.totalDespues = dePct(totalD);
  res.pasos.push(`Total tras el cambio: ${num(totalD)} %${totalD < 1000 ? ` (sin asignar: ${num(1000 - totalD)} %)` : ''}. La cartera no se normaliza.`);
  return res;
}

// Compara dos composiciones con las mismas reglas de lectura.
export function comparar(antes, despues, activos = {}, limite = null) {
  const A = radiografia(antes, activos, limite), D = radiografia(despues, activos, limite);
  const cats = [...new Set([...A.categorias.map(c => c.categoria), ...D.categorias.map(c => c.categoria)])].map(c => {
    const a = A.categorias.find(x => x.categoria === c)?.peso || 0, d = D.categorias.find(x => x.categoria === c)?.peso || 0;
    return { categoria: c, antes: a, despues: d, delta: dePct(aDec(d) - aDec(a)) };
  }).sort((x, y) => y.despues - x.despues || (x.categoria < y.categoria ? -1 : 1));
  const antesSup = new Set(A.superados.map(s => s.ticker)), despSup = new Set(D.superados.map(s => s.ticker));
  return { antes: A, despues: D, categorias: cats,
    limites: { nuevos: D.superados.filter(s => !antesSup.has(s.ticker)), resueltos: A.superados.filter(s => !despSup.has(s.ticker)), siguen: D.superados.filter(s => antesSup.has(s.ticker)) } };
}

// Comprobación de un escenario guardado (servidor): ¿la propuesta es exactamente la que sale del método con esa base y esa operación?
export function propuestaCoincide(base, op, financiacion, propuesta) {
  const s = simular(base, op, financiacion);
  if (!s.viable) return { ok: false, motivo: s.motivo };
  const a = JSON.stringify(s.despues), b = JSON.stringify(normalizar(propuesta).map(p => ({ ticker: p.ticker, peso: dePct(p.d) })));
  return a === b ? { ok: true } : { ok: false, motivo: 'La propuesta no coincide con el resultado del método elegido.' };
}

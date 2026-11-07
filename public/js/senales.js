// Ronda 26 · Señales de la cartera: alertas BREVES y visuales que salen de la radiografía (calculos.js). PURO: sin DOM, sin red, sin fecha.
// Qué son: avisos de CONCENTRACIÓN por posición y por categoría, y de cartera incompleta. Qué NO son: una medida de riesgo, una previsión ni un consejo.
// Los umbrales son REFERENCIAS ORIENTATIVAS de Klever (se declaran en cada señal); la persona decide. Cada señal accionable propone una HIPÓTESIS
// para el laboratorio (qué peso probar), nunca un activo nuevo: Klever no elige por la persona qué comprar.
export const UMBRALES = Object.freeze({ posicion: 25, categoria: 40, sectores: 3, posiciones: 4 });
const cmS = v => String(Math.round(v * 10) / 10).replace('.', ',');
// Peso hipotético para probar una posición más pequeña: la mitad, como mucho 20 % y al menos 1 % (siempre por debajo del actual).
export const pesoHipotesis = w => { const h = Math.max(1, Math.min(20, Math.round(w / 2))); return h < w ? h : Math.max(0.1, Math.round((w - 1) * 10) / 10); };

// r: resultado de radiografia(); devuelve la lista ordenada (alertas primero) con, como mucho, `max` señales.
// Ronda 28 (fase 2): `umb` permite que la PERSONA fije sus propios umbrales de posición y categoría (se validan; si no valen, se usan los de Klever).
export function umbralesValidos(u) {
  const ok = (v, a, b) => Number.isFinite(Number(v)) && Number(v) >= a && Number(v) <= b;
  return { ...UMBRALES, ...(u && ok(u.posicion, 5, 95) ? { posicion: Number(u.posicion) } : {}), ...(u && ok(u.categoria, 10, 100) ? { categoria: Number(u.categoria) } : {}) };
}
// Por qué importa cada señal (segundo nivel del detalle), en una frase llana y sin prever pérdidas ni ganancias.
const PORQUE = {
  exceso: 'Con más del 100 % las cifras no cuadran y no se puede comparar nada.',
  categoria: 'Si a ese sector le va mal, lo nota casi toda la cartera a la vez.',
  posicion: 'Lo que le pase a una sola empresa mueve buena parte del total.',
  unica: 'Todo depende de lo que le pase a ese activo.',
  sectores: 'Pocos sectores hacen que la cartera dependa de pocas cosas.',
  pocas: 'Con pocas posiciones, cada una cuenta mucho en el resultado.',
  pendiente: 'Lo que falta no está en ninguna parte: la cartera no está completa.',
  ok: 'El reparto no se apoya en una sola posición ni en un solo sector.',
};
export function senales(r, max = 3, umb = null) {
  if (!r || r.estado === 'vacia') return [];
  const out = [], U = umbralesValidos(umb), propio = !!umb && (U.posicion !== UMBRALES.posicion || U.categoria !== UMBRALES.categoria), ref = propio ? 'tu referencia' : 'referencia orientativa de Klever';
  if (r.estado === 'exceso') out.push({ id: 'exceso', nivel: 'alerta', titulo: `Exceso de ${cmS(r.exceso)} %`, detalle: `Los pesos suman el ${cmS(r.total)} %. Ajusta la distribución antes de comparar.`, accion: null });
  const cats = r.categorias.filter(c => c.conocida && !c.soloFondos), top = cats[0];
  if (top && top.peso >= U.categoria && r.n > 1) {
    const t = top.tickers[0];  // la mayor posición de esa categoría (radiografía ordena por peso)
    out.push({ id: 'categoria', nivel: 'alerta', titulo: `Exposición alta: ${top.categoria}`, valor: top.peso,
      detalle: `${top.categoria} suma el ${cmS(top.peso)} % (${top.tickers.join(', ')}). ${ref.charAt(0).toUpperCase() + ref.slice(1)}: más del ${U.categoria} % en una categoría.`,
      accion: { ticker: t, fin: 'proporcional', pregunta: `¿Y si ${t} pesara menos?` } });
  }
  const duplicada = out.some(s => s.id === 'categoria' && s.accion.ticker === r.mayor?.ticker && top.tickers.length === 1);   // misma idea dicha dos veces
  if (r.mayor && r.mayor.peso >= U.posicion && r.n > 1 && !duplicada) {
    out.push({ id: 'posicion', nivel: 'alerta', titulo: `${r.mayor.ticker} pesa el ${cmS(r.mayor.peso)} %`, valor: r.mayor.peso,
      detalle: `Una sola posición supera el ${U.posicion} % de la cartera (${ref}, no una norma).`,
      accion: { ticker: r.mayor.ticker, fin: 'proporcional', pregunta: `¿Y si ${r.mayor.ticker} pesara menos?` } });
  }
  if (r.n === 1) out.push({ id: 'unica', nivel: 'alerta', titulo: 'Una sola posición', detalle: 'Toda la cartera depende de un único activo.', accion: { ticker: '', fin: 'proporcional', pregunta: '¿Y si añadieras otra idea?' } });
  else if (cats.length && cats.length <= U.sectores && !out.some(s => s.id === 'categoria')) {
    out.push({ id: 'sectores', nivel: 'aviso', titulo: `Solo ${cats.length} ${cats.length === 1 ? 'categoría' : 'categorías'}`, valor: cats.length,
      detalle: `Las acciones de la cartera están en ${cats.length === 1 ? 'una sola categoría' : `${cats.length} categorías`}${r.categorias.some(c => c.soloFondos) ? ' (los ETF se cuentan aparte: su categoría es comercial)' : ''}. Referencia orientativa: ${U.sectores} o menos.`,
      accion: { ticker: '', fin: 'proporcional', pregunta: '¿Y si añadieras una idea de otra categoría?' } });
  }
  if (r.n > 1 && r.n < U.posiciones) out.push({ id: 'pocas', nivel: 'aviso', titulo: `${r.n} posiciones`, valor: r.n, detalle: `Menos de ${U.posiciones} posiciones: cada una pesa mucho en el conjunto.`, accion: { ticker: '', fin: 'proporcional', pregunta: '¿Y si añadieras otra idea?' } });
  if (r.estado === 'incompleta') out.push({ id: 'pendiente', nivel: 'aviso', titulo: `Falta asignar ${cmS(r.pendiente)} %`, valor: r.pendiente, detalle: `Está asignado el ${cmS(r.total)} %. Puedes repartir lo que falta o probar a usarlo en el laboratorio.`, accion: { ticker: '', fin: 'sin_asignar', pregunta: '¿Y si usaras lo que falta?' } });
  if (!out.length) out.push({ id: 'ok', nivel: 'ok', titulo: 'Sin concentraciones destacadas', detalle: `Ninguna posición supera el ${U.posicion} % ni ninguna categoría el ${U.categoria} %. No mide riesgo ni rentabilidad.`, accion: { ticker: '', fin: 'proporcional', pregunta: '¿Y si probaras otra idea?' } });
  for (const q of out) q.porque = PORQUE[q.id];
  return out.slice(0, max);
}
// Hipótesis completa para el laboratorio a partir de una señal: { ticker, peso, fin }. pos: las posiciones analizadas ({ ticker, peso }).
// Sin activo elegido (añadir una idea), el peso de partida es 10 % o, si se usa lo que falta, lo que falta (como mucho 100 %).
export function hipotesis(s, r, pos = []) {
  if (!s?.accion) return null;
  const { ticker, fin } = s.accion;
  if (!ticker) return { ticker: '', peso: fin === 'sin_asignar' && r?.pendiente ? Math.min(100, r.pendiente) : 10, fin };
  const actual = pos.find(p => p.ticker === ticker)?.peso;
  return actual > 0 ? { ticker, peso: pesoHipotesis(actual), fin } : null;
}

// Ronda 28 · TRES INDICADORES en lenguaje llano (semáforo), para quien empieza: Concentración, Variedad y Datos. Puros; salen de la radiografía y, para «Datos»,
// de la evaluación de la nota (qué parte del peso se ha podido analizar). No son una nota ni un consejo: describen el reparto. Niveles: 'ok' · 'medio' · 'alto' (o 'na' sin datos).
export function indicadores(r, ev = null) {
  if (!r || r.estado === 'vacia') return [];
  const U = UMBRALES, cats = r.categorias.filter(c => c.conocida && !c.soloFondos), topCat = cats[0]?.peso || 0, may = r.mayor?.peso || 0;
  const conc = may >= 40 || topCat >= 60 || r.n === 1 ? 'alto' : may >= U.posicion || topCat >= U.categoria ? 'medio' : 'ok';
  const nCat = cats.length + (r.categorias.some(c => c.soloFondos) ? 1 : 0);   // los fondos cuentan como UNA variedad más (su categoría es comercial)
  const vari = nCat >= 5 ? 'ok' : nCat >= 3 ? 'medio' : 'alto';
  let datos = { nivel: 'na', valor: 'Calculando', detalle: 'La información de las empresas aún no está disponible.' };
  if (ev?.reparto?.length) {
    const total = ev.reparto.reduce((a, x) => a + x.peso, 0) || 0, sin = (ev.sinEvaluar || []).reduce((a, x) => a + (x.peso || 0), 0), pct = total ? Math.max(0, Math.min(100, Math.round((total - sin) / total * 100))) : 0;
    datos = { nivel: pct >= 80 ? 'ok' : pct >= 50 ? 'medio' : 'alto', valor: pct >= 80 ? 'Completos' : pct >= 50 ? 'Parciales' : 'Escasos', detalle: `Klever puede analizar el ${pct} % del peso. ETF, bancos y empresas sin datos o sin comparables quedan fuera.`, pct };
  }
  return [
    { id: 'concentracion', etiqueta: 'Concentración', nivel: conc, valor: { ok: 'Baja', medio: 'Media', alto: 'Alta' }[conc], dato: `${r.mayor.ticker} ${cmS(may)} %`, detalle: `La mayor posición es ${r.mayor.ticker} (${cmS(may)} %)${cats[0] ? ` y la mayor categoría, ${cats[0].categoria} (${cmS(topCat)} %)` : ''}.` },
    { id: 'variedad', etiqueta: 'Variedad', nivel: vari, valor: { ok: 'Amplia', medio: 'Media', alto: 'Poca' }[vari], dato: `${nCat} ${nCat === 1 ? 'categoría' : 'categorías'}`, detalle: `${r.n} ${r.n === 1 ? 'posición' : 'posiciones'} en ${nCat} ${nCat === 1 ? 'categoría' : 'categorías'}${r.categorias.some(c => c.soloFondos) ? ' (los ETF cuentan como una)' : ''}.` },
    { id: 'datos', etiqueta: 'Datos', nivel: datos.nivel, valor: datos.valor, dato: datos.pct != null ? `${datos.pct} % del peso` : '', detalle: datos.detalle },
  ];
}

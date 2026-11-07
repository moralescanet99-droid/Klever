// Ronda 28 (fase 2) · «Pega tu cartera»: convierte un texto como «KO 40, PG 60» o «AAPL: 25 %; MSFT 30,5» en posiciones. PURO: sin DOM.
// Solo reconoce símbolos del universo disponible (no adivina ni sustituye uno por otro): lo que no reconoce lo devuelve aparte para decirlo.
// Pesos con una decimal como mucho (coma o punto), entre 0,1 y 100. Un símbolo repetido conserva el último peso. Necesita al menos UN par símbolo + peso.
export function leerPegado(texto, universo) {
  const out = { pares: [], desconocidos: [], invalidos: [] }, vistos = new Map();
  const re = /([A-Za-z][A-Za-z.]{0,5})\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*%?/g;
  let m; const limpio = String(texto || '');
  while ((m = re.exec(limpio))) {
    const t = m[1].toUpperCase().replace(/\.$/, ''), num = Number(m[2].replace(',', '.'));
    if (!universo?.[t]) { if (!out.desconocidos.includes(t)) out.desconocidos.push(t); continue; }
    if (!(num >= 0.1 && num <= 100) || Math.abs(num * 10 - Math.round(num * 10)) > 1e-9) { out.invalidos.push(`${t} ${m[2]}`); continue; }
    vistos.set(t, num);
  }
  out.pares = [...vistos].map(([ticker, peso]) => ({ ticker, peso }));
  return out;
}
// ¿Parece una lista para pegar (al menos dos símbolos con número) y no una búsqueda normal?
export const pareceLista = texto => (String(texto || '').match(/[A-Za-z][A-Za-z.]{0,5}\s*[:=]?\s*\d/g) || []).length >= 2;

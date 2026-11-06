// Ronda 13: cálculos de cartera (radiografía, simulación, comparación). Puros: sin navegador ni servidor. Uso: node tests/ronda13/unit-calculos.mjs
import { radiografia, simular, comparar, propuestaCoincide } from '../../public/js/calculos.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-C.json');
const J = x => JSON.stringify(x), mapa = r => Object.fromEntries(r.despues.map(p => [p.ticker, p.peso]));
const AB = [{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 40 }];
const ACT = { A: { sector: 'Tecnología', tipo: 'accion' }, B: { sector: 'Salud', tipo: 'accion' }, C: { sector: 'ETF oro', tipo: 'etf' }, D: { sector: 'ETF oro', tipo: 'etf' }, E: { sector: 'Tecnología', tipo: 'accion' } };

// --- el ejemplo del encargo
let s = simular(AB, { ticker: 'C', peso: 10 }, 'proporcional');
t('C1', 'Ejemplo del encargo: A 60 / B 40 + C 10 reduciendo proporcionalmente', 'A 54, B 36, C 10; total 100', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && J(mapa(s)) === J({ A: 54, B: 36, C: 10 }) && s.totalDespues === 100);
t('C1b', 'Los pasos explican el método ANTES del resultado', 'Menciona el factor 90/100 = 0,9000 y el redondeo', s.pasos.join(' | '), /90\/100 = 0,9000/.test(s.pasos.join(' ')) && /Redondeo/.test(s.pasos.join(' ')));
// --- cartera incompleta: no se normaliza
s = simular([{ ticker: 'A', peso: 50 }, { ticker: 'B', peso: 30 }], { ticker: 'C', peso: 10 }, 'proporcional');
t('C2', 'Base incompleta (80 %) + C 10 proporcional: sigue incompleta, sin normalizar', 'Total 80; A 43,8 y B 26,2 (la décima sobrante a A por el símbolo en el empate)', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && s.totalDespues === 80 && J(mapa(s)) === J({ A: 43.8, B: 26.2, C: 10 }) && /sin asignar: 20/.test(s.pasos.join(' ')));
// --- financiar con lo sin asignar
s = simular([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 20 }], { ticker: 'C', peso: 15 }, 'sin_asignar');
t('C3a', 'Sin asignar suficiente (20 %): C 15 → A y B no cambian', 'A 60, B 20, C 15; total 95', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && J(mapa(s)) === J({ A: 60, B: 20, C: 15 }) && s.totalDespues === 95);
s = simular([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 20 }], { ticker: 'C', peso: 25 }, 'sin_asignar');
t('C3b', 'Sin asignar insuficiente: C 25 con 20 % libre', 'Inviable con el motivo; sin pesos', s.motivo, !s.viable && /hay 20 % y el cambio necesita 25 %/.test(s.motivo) && !s.despues.length);
s = simular(AB, { ticker: 'C', peso: 5 }, 'sin_asignar');
t('C3c', 'Cartera completa y financiación con lo sin asignar: inviable', 'Inviable: hay 0 %', s.motivo, !s.viable && /hay 0 %/.test(s.motivo));
// --- activo que ya existe
s = simular(AB, { ticker: 'A', peso: 30 }, 'proporcional');
t('C4a', 'Bajar el peso de un activo existente: lo liberado queda SIN asignar (no se reparte al alza)', 'A 30, B 40; total 70', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && J(mapa(s)) === J({ B: 40, A: 30 }) && s.totalDespues === 70);
s = simular(AB, { ticker: 'A', peso: 80 }, 'proporcional');
t('C4b', 'Subir el peso de un activo existente financiado por las demás', 'A 80, B 20; total 100', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && J(mapa(s)) === J({ A: 80, B: 20 }));
s = simular(AB, { ticker: 'A', peso: 60 }, 'proporcional');
t('C4c', 'Mismo peso que ya tiene: nada que simular', 'Inviable con motivo', s.motivo, !s.viable && /ya tiene el 60 %/.test(s.motivo));
// --- inviables
s = simular([{ ticker: 'A', peso: 10 }], { ticker: 'B', peso: 20 }, 'proporcional');
t('C5a', 'Las demás no bastan (10 % frente a 20 %)', 'Inviable: pesos negativos imposibles', s.motivo, !s.viable && /suman 10 %.*20 %/.test(s.motivo));
s = simular([{ ticker: 'A', peso: 100 }], { ticker: 'B', peso: 100 }, 'proporcional');
t('C5b', 'Dejaría una posición en 0 %', 'Inviable: «por debajo del 0,1 %»', s.motivo, !s.viable && /por debajo del 0,1 %/.test(s.motivo));
s = simular([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 50 }], { ticker: 'C', peso: 10 }, 'proporcional');
t('C5c', 'Base con exceso (110 %)', 'Inviable: corrígela antes', s.motivo, !s.viable && /exceso de 10 %/.test(s.motivo));
t('C5d', 'Peso fuera de rango o activo vacío', 'Inviables con motivo', [simular(AB, { ticker: 'C', peso: 0 }, 'proporcional').motivo, simular(AB, { ticker: 'C', peso: 101 }, 'proporcional').motivo, simular(AB, { peso: 5 }, 'proporcional').motivo, simular(AB, { ticker: 'C', peso: 5 }, 'x').motivo].join(' | '),
  [simular(AB, { ticker: 'C', peso: 0 }, 'proporcional'), simular(AB, { ticker: 'C', peso: 101 }, 'proporcional'), simular(AB, { peso: 5 }, 'proporcional'), simular(AB, { ticker: 'C', peso: 5 }, 'x')].every(r => !r.viable && r.motivo));
// --- base vacía y pesos pequeños
s = simular([], { ticker: 'A', peso: 50 }, 'sin_asignar');
t('C6a', 'Base vacía + A 50 con lo sin asignar', 'Viable: total 50 (incompleta)', J(mapa(s)) + ` total ${s.totalDespues}`, s.viable && s.totalDespues === 50);
s = simular(AB, { ticker: 'C', peso: 0.1 }, 'proporcional');
t('C6b', 'Peso pequeño (0,1 %) con redondeo', 'C 0,1; A y B suman 99,9; total 100; ninguna por debajo de 0,1', J(mapa(s)), s.viable && mapa(s).C === 0.1 && Math.round((mapa(s).A + mapa(s).B) * 10) === 999 && s.totalDespues === 100);
// --- propiedad: totales, determinismo y nada negativo en 2000 casos
let semilla = 7; const rnd = () => (semilla = (semilla * 1664525 + 1013904223) % 4294967296) / 4294967296;
let casos = 0, viables = 0, mal = [];
for (let i = 0; i < 2000; i++) {
  const n = 1 + Math.floor(rnd() * 8), nombres = 'ABCDEFGH'.slice(0, n).split(''), crudo = nombres.map(() => 1 + Math.floor(rnd() * 100));
  const tot = crudo.reduce((a, b) => a + b, 0), escala = (rnd() < .5 ? 1000 : 700 + Math.floor(rnd() * 300)) / tot;      // base completa o incompleta
  const base = nombres.map((tk, k) => ({ ticker: tk, peso: Math.max(1, Math.round(crudo[k] * escala)) / 10 })), op = { ticker: rnd() < .4 ? nombres[0] : 'Z', peso: (1 + Math.floor(rnd() * 400)) / 10 };
  for (const f of ['proporcional', 'sin_asignar']) {
    casos++; const r = simular(base, op, f), r2 = simular(base, op, f);
    if (J(r) !== J(r2)) mal.push('no determinista'); if (!r.viable) continue; viables++;
    const sum = Math.round(r.despues.reduce((a, p) => a + p.peso * 10, 0)), esperado = Math.round(r.totalDespues * 10);
    if (sum !== esperado || sum > 1000 || r.despues.some(p => !(p.peso >= 0.1)) || r.despues.find(p => p.ticker === op.ticker).peso !== op.peso) mal.push(J({ base, op, f }));
    if (f === 'proporcional' && r.delta > 0 && Math.round(r.totalDespues * 10) !== Math.round(r.totalAntes * 10)) mal.push('proporcional cambió el total ' + J({ base, op }));
  }
}
t('C7', 'Propiedades en 2000 bases y operaciones al azar (semilla fija)', 'Si es viable: totales cuadran, ≤ 100 %, ningún peso < 0,1 %, el activo queda en su peso y el resultado es determinista', `${casos} simulaciones, ${viables} viables, fallos: ${mal.length}${mal[0] ? ' · ' + mal[0].slice(0, 200) : ''}`, mal.length === 0 && viables > 500);
// --- radiografía
let r = radiografia([{ ticker: 'A', peso: 35 }, { ticker: 'B', peso: 25 }, { ticker: 'C', peso: 20 }, { ticker: 'D', peso: 10 }, { ticker: 'E', peso: 5 }], ACT, 20);
t('C8a', 'Radiografía: mayor, tres mayores, pendiente y límite', 'Mayor A 35; tres mayores 80; 95 % asignado (pendiente 5); A y B superan el 20 % (C está en el límite, no lo supera)', J({ mayor: r.mayor, top3: r.top3.peso, estado: r.estado, pendiente: r.pendiente, sup: r.superados.map(x => x.ticker) }),
  r.mayor.ticker === 'A' && r.mayor.peso === 35 && r.top3.peso === 80 && r.top3.completo && r.estado === 'incompleta' && r.pendiente === 5 && J(r.superados.map(x => x.ticker)) === J(['A', 'B']) && r.superados[0].exceso === 15);
t('C8b', 'Categorías comerciales: los ETF se marcan, no se interpretan como exposición', 'Tecnología 40 (A+E), Salud 25, «ETF oro» 30 con soloFondos', J(r.categorias.map(c => [c.categoria, c.peso, c.soloFondos])), J(r.categorias.map(c => [c.categoria, c.peso, c.soloFondos])) === J([['Tecnología', 40, false], ['ETF oro', 30, true], ['Salud', 25, false]]));
r = radiografia([{ ticker: 'A', peso: 70 }, { ticker: 'B', peso: 30 }], ACT);
t('C8c', 'Con menos de tres posiciones se indica', 'top3.n = 2, completo = false, peso 100; sin límite no hay superados', J(r.top3) + ' ' + J(r.superados), r.top3.n === 2 && !r.top3.completo && r.top3.peso === 100 && r.estado === 'completa' && r.limite === null && !r.superados.length);
t('C8d', 'Cartera vacía y cartera con exceso', 'vacía: sin mayor; exceso 10', J([radiografia([], ACT).estado, radiografia([], ACT).mayor, radiografia([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 50 }], ACT).exceso]), radiografia([], ACT).estado === 'vacia' && radiografia([], ACT).mayor === null && radiografia([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 50 }], ACT).exceso === 10);
r = radiografia([{ ticker: 'A', peso: 50 }, { ticker: 'Q', peso: 50 }], ACT);
t('C8e', 'Un activo sin categoría conocida se declara, no se rellena', '«Sin categoría conocida» 50 y Q en la cobertura', J(r.categorias.map(c => [c.categoria, c.peso, c.conocida])) + ' ' + J(r.cobertura.sinCategoria), r.cobertura.sinCategoria[0] === 'Q' && r.categorias.some(c => c.categoria === 'Sin categoría conocida' && c.peso === 50 && !c.conocida));
// --- comparación
const sim = simular([{ ticker: 'A', peso: 40 }, { ticker: 'B', peso: 30 }, { ticker: 'E', peso: 30 }], { ticker: 'C', peso: 25 }, 'proporcional'), c = comparar(sim.antes, sim.despues, ACT, 35);
t('C9', 'Comparar antes/después con un límite personal del 35 %', 'Antes: A (40 %) supera el límite; después A baja a 30 y se resuelve; sin asignar 0 en ambos', J({ nuevos: c.limites.nuevos, resueltos: c.limites.resueltos.map(x => x.ticker), mayorA: c.antes.mayor, mayorD: c.despues.mayor }), c.limites.resueltos.map(x => x.ticker).join() === 'A' && !c.limites.nuevos.length && c.despues.mayor.peso < c.antes.mayor.peso && c.antes.pendiente === 0 && c.despues.pendiente === 0);
t('C10', 'Una propuesta manipulada no coincide con el método', 'ok=false; la correcta, ok=true', J([propuestaCoincide(AB, { ticker: 'C', peso: 10 }, 'proporcional', [{ ticker: 'A', peso: 55 }, { ticker: 'B', peso: 35 }, { ticker: 'C', peso: 10 }]).ok, propuestaCoincide(AB, { ticker: 'C', peso: 10 }, 'proporcional', [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }]).ok]),
  !propuestaCoincide(AB, { ticker: 'C', peso: 10 }, 'proporcional', [{ ticker: 'A', peso: 55 }, { ticker: 'B', peso: 35 }, { ticker: 'C', peso: 10 }]).ok && propuestaCoincide(AB, { ticker: 'C', peso: 10 }, 'proporcional', [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }]).ok);
await fin();

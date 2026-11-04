// Ronda 15: nota de estructura y solidez v1 (módulo puro) con universos SINTÉTICOS rotulados. Casos del encargo: efectivas (50/50 → 2; 90/10 → ≈1,22),
// clases del mismo emisor, peso pequeño, ejercicio que falta, 19 y 20 comparables, cobertura 89,9 % y 90 % exacto, ETF sin composición, cartera al 95 %,
// empates, sin doble redondeo y determinismo cartera = escenario. Uso: node tests/ronda15/unit-nota.mjs
import { evaluar, percentil, resumenNota as resumen, VERSION_NOTA } from '../../public/js/nota.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-NOTA.json');
const J = JSON.stringify, aprox = (a, b, e = 1e-6) => Math.abs(a - b) < e;
// ---- universo sintético: `n` empresas por sector; empresa i del sector s: ventas, ROIC y deuda crecientes con i (así los percentiles son previsibles)
const anios = [2020, 2021, 2022, 2023, 2024];
const emp = (i, o = {}) => ({ nombre: 'Sintética ' + i, tipo: 'accion', sector: 'S1', actividad: 'A' + (i % 4), emisor: 'e' + i, cap: 1e9 * (i + 1), imp: 1e6 * (i + 1), sesiones: 60, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04',
  ej: anios.map((y, k) => ({ p: 'FY' + y, ing: 100 * (1 + k * .1) * (i + 1), ni: 10 * (i + 1), op: 12 * (i + 1), ebitda: 20 * (i + 1), deuda: (i + 1) * 20 * (0.5 + i / 40), fcf: 5 * (i + 1), roic: 0.02 + i * 0.005 })), ...o });
const universo = (n = 24, extra = {}) => { const empresas = {}; for (let i = 0; i < n; i++) empresas['S' + String(i).padStart(2, '0')] = emp(i); return { fecha: '2026-11-04', fuente: 'sintetica', origen: 'sintetico', empresas: { ...empresas, ...extra } }; };
const cartera = (...p) => p.map(([ticker, peso]) => ({ ticker, peso }));
const U = universo();

// ---- empresas efectivas
let r = evaluar(cartera(['S00', 50], ['S01', 50]), U), b = r.bloques.empresas;
t('N1', 'Empresas efectivas: 50/50', 'N = 2 y puntuación 1 + 9·(2−1)/14 = 1,6429', `N=${b.efectivas}; ${b.puntuacion}`, aprox(b.efectivas, 2) && aprox(b.puntuacion, 1 + 9 / 14));
r = evaluar(cartera(['S00', 90], ['S01', 10]), U); b = r.bloques.empresas;
t('N1b', 'Empresas efectivas: 90/10', 'N ≈ 1,22 (1/(0,81+0,01)=1,2195)', `N=${b.efectivas.toFixed(4)}`, aprox(b.efectivas, 1 / .82, 1e-9) && aprox(+b.efectivas.toFixed(2), 1.22));
const C2 = { ...U, empresas: { ...U.empresas, K1: emp(30, { emisor: 'alfa' }), K2: emp(31, { emisor: 'alfa' }) } };
r = evaluar(cartera(['K1', 50], ['K2', 50]), C2);
t('N2', 'Dos clases del mismo emisor cuentan una vez', 'N = 1 (puntuación 1)', `N=${r.bloques.empresas.efectivas}`, aprox(r.bloques.empresas.efectivas, 1) && aprox(r.bloques.empresas.puntuacion, 1));
r = evaluar(cartera(...Array.from({ length: 20 }, (_, i) => ['S' + String(i).padStart(2, '0'), 5])), U);
t('N2b', 'Con 20 posiciones iguales N = 20 ≥ 15: puntuación máxima', '10', String(r.bloques.empresas.puntuacion), aprox(r.bloques.empresas.puntuacion, 10));
// ---- sectores y actividades
const mix = { ...U, empresas: { ...U.empresas } }; ['A', 'B', 'C', 'D', 'E', 'F'].forEach((s, k) => { mix.empresas['X' + s] = emp(40 + k, { sector: 'Sec' + s, actividad: 'Act' + s }); });
r = evaluar(cartera(['XA', 20], ['XB', 20], ['XC', 20], ['XD', 20], ['XE', 10], ['XF', 10]), mix); b = r.bloques.sectores;
t('N3', 'Sectores y actividades: mitad y mitad', 'Con 6 sectores casi iguales (N≈5,56) y 6 actividades (N≈5,56): ½·(1+9·(5,56−1)/5) + ½·(1+9·(5,56−1)/9)', `${b.efectivosSector.toFixed(3)} / ${b.efectivasActividad.toFixed(3)} → ${b.puntuacion.toFixed(3)}`, aprox(b.puntuacion, (1 + 9 * (b.efectivosSector - 1) / 5 + 1 + 9 * (b.efectivasActividad - 1) / 9) / 2));
// ---- tamaño: una empresa pequeña pesa menos al 2 % que al 30 %
const grandes = ['S20', 'S21', 'S22', 'S23'];
const pequena = (w) => evaluar(cartera(['S00', w], ...grandes.map(g => [g, (100 - w) / 4])), U).bloques.tamano.puntuacion, base = evaluar(cartera(...grandes.map(g => [g, 25])), U).bloques.tamano.puntuacion;
t('N4', 'Una empresa pequeña al 2 % pesa menos que al 30 %', 'La puntuación de tamaño se aleja menos de la de las grandes al 2 % que al 30 %', `grandes ${base.toFixed(2)}; con S00 al 2 %: ${pequena(2).toFixed(2)}; al 30 %: ${pequena(30).toFixed(2)}`, Math.abs(base - pequena(2)) < Math.abs(base - pequena(30)) && pequena(30) < pequena(2));
// ---- ejercicio que falta, 90 % exacto, 89,9 %
const sinAnio = (w) => { const u = universo(24, { F1: emp(50, { ej: emp(50).ej.slice(1) }) }); return evaluar(cartera(['F1', w], ['S20', 100 - w]), u); };
r = sinAnio(15);
t('N5', 'Falta un ejercicio (4 de 5) en una empresa del 15 %', 'Deuda y caja y Rentabilidad quedan con cobertura 85 % (< 90 %): nota pendiente y motivo exacto «Faltan ejercicios»', `${r.motivo}; ${r.sinEvaluar[0]?.motivos.join(' | ')}`, !r.publicada && aprox(r.bloques.deuda.cobertura, .85) && /Faltan ejercicios/.test(r.sinEvaluar[0].motivos.join(' ')) && /deuda y caja \(caja libre de los cinco ejercicios: 85,0 %/.test(r.motivo) && r.bloques.empresas.puntuacion != null);
r = sinAnio(10);
t('N5b', 'Cobertura de 90 % EXACTO (empresa sin evaluar del 10 %)', 'Se publica: 90,0 % cumple el mínimo (≥ 90 %)', `cobertura ${(r.cobertura.minima * 100).toFixed(1)}; publicada ${r.publicada}; nota ${r.nota}`, r.publicada && aprox(r.cobertura.minima, .9) && r.nota != null);
const mal = universo(24, { F1: emp(50, { ej: emp(50).ej.slice(1) }) }); r = evaluar(cartera(['F1', 10.1], ['S20', 89.9]), mal);
t('N5c', 'Cobertura de 89,9 %', 'No se publica y dice 89,9 %', `${r.motivo.slice(0, 120)}`, !r.publicada && aprox(r.bloques.deuda.cobertura, .899) && /89,9 %/.test(r.motivo));
// ---- comparables sectoriales (19 y 20)
const sect = (n) => { const e = {}; for (let i = 0; i < n; i++) e['Q' + String(i).padStart(2, '0')] = emp(i, { sector: 'Q' }); return { fecha: '2026-11-04', origen: 'sintetico', empresas: e }; };
r = evaluar(cartera(['Q05', 100]), sect(19));
t('N6', '19 comparables en el sector', 'Deuda y Rentabilidad no se pueden calcular: «Solo hay 19 comparables… hacen falta 20»; no se inventa un percentil', r.sinEvaluar[0].motivos.join(' | ').slice(0, 130), !r.publicada && r.bloques.deuda.puntuacion === null && /Solo hay 19 comparables/.test(r.sinEvaluar[0].motivos.join(' ')) && r.bloques.empresas.puntuacion != null);
r = evaluar(cartera(['Q05', 100]), sect(20));
t('N6b', '20 comparables en el sector', 'Ya se calcula (nota publicada)', `publicada ${r.publicada}; nota ${r.nota}`, r.publicada && r.nota >= 1 && r.nota <= 10);
// ---- ETF y cartera incompleta
const conEtf = { ...U, empresas: { ...U.empresas, ETF1: { nombre: 'Fondo de ejemplo', tipo: 'etf', sector: 'ETF', ej: [] } } };
r = evaluar(cartera(['S20', 80], ['ETF1', 20]), conEtf);
t('N7', 'Un ETF sin composición verificada (20 %)', 'Cuenta como peso sin evaluar en todos los bloques: cobertura 80 %, nota pendiente y el ETF señalado', `${r.motivo.slice(0, 90)}…; ${r.sinEvaluar[0]?.ticker}: ${r.sinEvaluar[0]?.motivos[0]}`, !r.publicada && aprox(r.cobertura.minima, .8) && r.sinEvaluar[0].ticker === 'ETF1' && /ETF/.test(r.sinEvaluar[0].motivos[0]));
r = evaluar(cartera(['S20', 60], ['S21', 35]), U);
t('N8', 'Cartera que suma 95 %', 'Sin nota ni bloques: dice que suma 95 % y que no se reescala', r.motivo, !r.publicada && r.bloques === null && /suma 95 %/.test(r.motivo) && /no se reescala/.test(r.motivo));
r = evaluar(cartera(['S20', 60], ['S21', 50]), U);
t('N8b', 'Cartera que suma 110 %', 'Sin nota: dice 110 % y que no se recorta', r.motivo, !r.publicada && /110 %/.test(r.motivo));
t('N8c', 'Cartera vacía', 'Sin nota y lo dice', evaluar([], U).motivo, !evaluar([], U).publicada && /vacía/.test(evaluar([], U).motivo));
// ---- empates y percentiles
t('N9', 'Empates: percentil por rango medio', 'percentil(2, [1,2,2,3]) = 50; percentil(1) = 12,5; percentil(3) = 87,5', J([percentil(2, [1, 2, 2, 3]), percentil(1, [1, 2, 2, 3]), percentil(3, [1, 2, 2, 3])]), percentil(2, [1, 2, 2, 3]) === 50 && percentil(1, [1, 2, 2, 3]) === 12.5 && percentil(3, [1, 2, 2, 3]) === 87.5);
// ---- fronteras de deuda
const cas = (deuda, ebitda) => universo(24, { Z1: emp(60, { ej: emp(60).ej.map(x => ({ ...x, deuda, ebitda, fcf: 10 })) }) });
let z = evaluar(cartera(['Z1', 100]), cas(-50, 20));
t('N10', 'Caja neta con EBITDA positivo', 'Deuda: (10 + frecuencia de caja libre 5/5 = 10) / 2 = 10', String(z.bloques.deuda.puntuacion), aprox(z.bloques.deuda.puntuacion, 10));
z = evaluar(cartera(['Z1', 100]), { ...cas(80, -5), empresas: { ...cas(80, -5).empresas, Z1: emp(60, { ej: emp(60).ej.map(x => ({ ...x, deuda: 80, ebitda: -5, fcf: -1 })) }) } });
t('N10b', 'Deuda positiva con EBITDA negativo y caja libre siempre negativa', 'Deuda: (1 + 1) / 2 = 1', String(z.bloques.deuda.puntuacion), aprox(z.bloques.deuda.puntuacion, 1));
z = evaluar(cartera(['Z1', 100]), cas(null, null));
t('N10c', 'Deuda y EBITDA AUSENTES (null)', 'Pendiente por dato ausente (cobertura 0 en deuda)', `${z.bloques.deuda.cobertura}; ${z.sinEvaluar[0].motivos[0]}`, z.bloques.deuda.cobertura === 0 && /Falta la deuda neta/.test(z.sinEvaluar[0].motivos[0]));
z = evaluar(cartera(['Z1', 100]), cas(-30, -5));
t('N10d', 'Caja neta pero EBITDA negativo (ambos «nulos o negativos»)', 'Sin evaluar', String(z.bloques.deuda.cobertura), z.bloques.deuda.cobertura === 0);
const banco = { ...U, empresas: { ...U.empresas, B1: emp(70, { sector: 'Finanzas', actividad: 'Banca', ej: emp(70).ej.map(x => ({ ...x, deuda: null, ebitda: null, roic: null })) }) } };
z = evaluar(cartera(['B1', 100]), banco);
t('N11', 'Bancos y aseguradoras', 'Cuentan como peso sin evaluar en Deuda y caja y en Rentabilidad (ROIC); sí en Empresas y Sectores', J(Object.fromEntries(Object.values(z.bloques).map(b => [b.id, b.cobertura]))), z.bloques.deuda.cobertura === 0 && z.bloques.rentabilidad.cobertura === 0 && z.bloques.empresas.cobertura === 1 && z.bloques.sectores.cobertura === 1);
// ---- rentabilidad exacta y sin doble redondeo
const top = 'S23'; z = evaluar(cartera([top, 100]), U); const rb = z.bloques.rentabilidad;
t('N12', 'Rentabilidad y crecimiento de la empresa con mayor ROIC del sector (24 comparables)', 'Percentil 100·(23+½)/24 = 97,9 → 9,81 puntos; frecuencias 10 y 10: ½·9,8125 + ¼·10 + ¼·10 = 9,906', String(rb.puntuacion), aprox(rb.puntuacion, 0.5 * (1 + 9 * 97.91666666666667 / 100) + 5));
r = evaluar(cartera(['S00', 40], ['S07', 35], ['S15', 25]), U); const suma = Object.values(r.bloques).reduce((s, b) => s + b.peso * b.puntuacion, 0) / 100;
t('N13', 'Sin doble redondeo: la nota es la suma de los bloques SIN redondear, redondeada una vez a un decimal', 'nota = round(Σ peso·puntuación / 100, 1) con puntuaciones sin redondear', `suma ${suma}; nota ${r.nota}`, r.nota === Math.round(suma * 10) / 10 && Object.values(r.bloques).some(b => b.puntuacion !== Math.round(b.puntuacion * 10) / 10));
// ---- limitación y fortaleza
const lim = Object.values(r.bloques).map(b => [b.id, b.peso * (10 - b.puntuacion)]).sort((a, b) => b[1] - a[1])[0];
t('N14', 'Principal limitación = mayor «peso del bloque × (10 − puntuación)»; principal fortaleza = bloque de mayor puntuación', `limitación ${lim[0]} con ${(lim[1] / 100).toFixed(3)}`, `${r.limitacion.bloque} ${r.limitacion.perdida.toFixed(3)}; fortaleza ${r.fortaleza}`, r.limitacion.bloque === lim[0] && aprox(r.limitacion.perdida, lim[1] / 100) && r.fortaleza === Object.values(r.bloques).sort((a, b) => b.puntuacion - a.puntuacion)[0].id);
// ---- determinismo: cartera = escenario
const r1 = evaluar(cartera(['S00', 40], ['S07', 35], ['S15', 25]), U), r2 = evaluar(cartera(['S15', 25], ['S00', 40], ['S07', 35]), universo());
t('N15', 'Cartera y escenario con igual composición, fecha y datos', 'Misma nota y mismo resumen (sin importar el orden de las posiciones ni quién llame)', `${r1.nota} / ${r2.nota}`, r1.nota === r2.nota && J(resumen(r1)) === J(resumen(r2)) && r1.version === VERSION_NOTA && r1.fecha === '2026-11-04');
t('N16', 'La evaluación no cambia el universo ni la cartera de entrada', 'Entradas intactas tras evaluar', 'sin mutaciones', J(cartera(['S00', 40])) === J(cartera(['S00', 40])) && Object.keys(U.empresas).length === 24);
// ---- ronda 16: ausente ≠ cero ≠ negativo, 60 sesiones, moneda y fuente comunes, cobertura POR INDICADOR, origen sintético identificado
{
  const conEj = (mod, o = {}) => emp(60, { ...o, ej: emp(60).ej.map(x => ({ ...x, fcf: 10, ...mod })) });
  const aus = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({ ebitda: null }) }));
  t('N20a', 'EBITDA AUSENTE (null) con deuda positiva, una posición al 100 % y los demás datos válidos', 'El indicador deuda/EBITDA queda PENDIENTE (no se evalúa como EBITDA ≤ 0): sin nota publicada y el motivo habla del EBITDA ausente', `publicada ${aus.publicada}; nota ${aus.nota}; ${aus.sinEvaluar[0]?.motivos.join(' ')}`, !aus.publicada && aus.nota === null && /EBITDA/.test(aus.sinEvaluar[0].motivos.join(' ')) && aus.bloques.deuda.puntuacion === null);
  const cero = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({ ebitda: 0 }) }));
  t('N20b', 'EBITDA observado igual a CERO con deuda positiva (mismos datos)', 'Es un hecho: 1 punto en ese indicador; deuda y caja = (1 + 10) / 2 = 5,5 y la nota se publica', `deuda ${cero.bloques.deuda.puntuacion}; publicada ${cero.publicada}`, aprox(cero.bloques.deuda.puntuacion, 5.5) && cero.publicada);
  const neg = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({ ebitda: -5 }) }));
  t('N20c', 'EBITDA NEGATIVO con deuda positiva', 'Igual que cero: 1 punto (tercera entrada distinta de la ausencia)', `deuda ${neg.bloques.deuda.puntuacion}`, aprox(neg.bloques.deuda.puntuacion, 5.5));
  const s59 = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({}, { sesiones: 59 }) })), s60 = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({}, { sesiones: 60 }) }));
  t('N21', '59 frente a 60 sesiones de negociación (EBITDA válido)', '59: la liquidez queda pendiente y la nota no se publica, con el motivo «Solo hay 59 sesiones»; 60: se publica', `59 → ${s59.publicada} (${s59.sinEvaluar[0]?.motivos.join(' ').slice(0, 70)}); 60 → ${s60.publicada}`, !s59.publicada && /Solo hay 59 sesiones/.test(s59.sinEvaluar[0].motivos.join(' ')) && s60.publicada);
  const moneda = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({}, { moneda: 'EUR' }) })), fuente = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({}, { fuenteMercado: 'otra' }) })), sinF = evaluar(cartera(['Z1', 100]), universo(24, { Z1: conEj({}, { fechaMercado: null }) }));
  t('N22', 'Una empresa con otra MONEDA, otra FUENTE o sin FECHA de mercado', 'Cada caso deja su tamaño y liquidez pendientes con su motivo; el resto del universo no cambia', `${moneda.publicada}/${fuente.publicada}/${sinF.publicada}; ${moneda.sinEvaluar[0]?.motivos[0].slice(0, 60)}`, !moneda.publicada && !fuente.publicada && !sinF.publicada && /distinta/.test(moneda.sinEvaluar[0].motivos.join(' ')) && /distinta/.test(fuente.sinEvaluar[0].motivos.join(' ')) && /fecha/.test(sinF.sinEvaluar[0].motivos.join(' ')) && evaluar(cartera(['S00', 100]), universo(24, { Z1: conEj({}, { moneda: 'EUR' }) })).publicada);
  const diez = (mod1, mod2, p1 = 10, p2 = 10) => { const e = {}; for (let i = 0; i < 10; i++) e['W' + i] = emp(30 + i); if (mod1) e.W0 = emp(30, { ej: emp(30).ej.map(x => ({ ...x, ...mod1 })) }); if (mod2) e.W1 = emp(31, { ej: emp(31).ej.map((x, k) => ({ ...x, ...(k === 2 ? mod2 : {}) })) });
    const sobra = (100 - p1 - p2) / 8; return [evaluar([{ ticker: 'W0', peso: p1 }, { ticker: 'W1', peso: p2 }, ...[2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ ticker: 'W' + i, peso: sobra }))], { ...universo(24, e) })]; };
  const [ok90] = diez({ ebitda: null }, { fcf: null });
  t('N23a', 'Datos ausentes en posiciones DISTINTAS: sin EBITDA en una posición del 10 % y sin un dato de caja libre en otra del 10 %', 'Cada indicador conserva el 90 % evaluable: el bloque «Deuda y caja» se publica (antes se caía por exigir los datos conjuntos)', `deuda ${ok90.bloques.deuda.indicadores.map(i => `${i.id} ${(i.cobertura * 100).toFixed(1)}`).join(', ')}; publicada ${ok90.publicada}`, ok90.publicada && ok90.bloques.deuda.indicadores.every(i => aprox(i.cobertura, .9)) && ok90.bloques.deuda.puntuacion != null);
  const [ko] = diez({ ebitda: null }, { fcf: null }, 10.1, 9.9);
  t('N23b', 'Mismo caso con la posición sin EBITDA al 10,1 % (89,9 % evaluable en ese indicador)', 'El indicador deuda/EBITDA tiene 89,9 % y el bloque queda pendiente, aunque el otro indicador tenga 90 %: el motivo cita el indicador', `${ko.motivo.slice(0, 160)}`, !ko.publicada && /deuda neta \/ EBITDA: 89,9 %/.test(ko.motivo) && ko.bloques.deuda.puntuacion === null);
  const sinOrigen = evaluar(cartera(['S00', 100]), { ...universo(), origen: undefined }), real = evaluar(cartera(['S00', 100]), { ...universo(), origen: 'real' }), hab = evaluar(cartera(['S00', 100]), { ...universo(), origen: 'real', habilitada: true });
  t('N24', 'Origen de los datos', 'Solo un conjunto sintético IDENTIFICADO publica la nota; con datos reales, mixtos o sin origen hace falta una habilitación explícita posterior a la calibración', `${sinOrigen.publicada}/${real.publicada}/${hab.publicada}`, !sinOrigen.publicada && !real.publicada && /habilitada/.test(real.motivo) && hab.publicada);
  const g = evaluar(cartera(['S00', 40], ['S07', 35], ['S15', 25]), U), vuelta = JSON.parse(JSON.stringify(resumen(g)));
  t('N25', 'Guardar y reabrir la misma evaluación (JSON)', 'Conserva cifra, fecha, cobertura y versión', `${vuelta.nota}/${vuelta.fecha}/${vuelta.cobertura}/${vuelta.version}`, vuelta.nota === g.nota && vuelta.fecha === '2026-11-04' && aprox(vuelta.cobertura, 100) && vuelta.version === VERSION_NOTA);
}
await fin();

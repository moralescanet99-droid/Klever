// Exporta a JSON los datos sintéticos de la semilla (ejercicios, mercado y clasificación) para que la DEMO use EXACTAMENTE los mismos números que el servidor local:
// así «KO 60 % / PG 40 % = 4,4» es el mismo resultado en la demo, en la semilla y en las pruebas. Sin dependencias: node:sqlite. Uso: node scripts/demo/exportar-semilla.mjs > salida.json
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const R = new URL('../../', import.meta.url);
process.removeAllListeners('warning');
const db = new DatabaseSync(':memory:'); db.exec(readFileSync(new URL('schema.sql', R), 'utf8')); db.exec(readFileSync(new URL('data/seed-prueba.sql', R), 'utf8'));
const fund = {}; for (const r of db.prepare('SELECT * FROM fundamentales ORDER BY ticker, periodo DESC').all()) (fund[r.ticker] ||= []).push({ periodo: r.periodo, ingresos: r.ingresos, beneficio_neto: r.beneficio_neto, deuda_neta: r.deuda_neta, ebitda: r.ebitda, flujo_caja_libre: r.flujo_caja_libre, roic: r.roic, actualizado_en: r.actualizado_en, resultado_operativo: r.resultado_operativo, informe: r.informe });
const mercado = Object.fromEntries(db.prepare('SELECT * FROM mercado').all().map(r => [r.ticker, { cap: r.capitalizacion, imp: r.importe_diario_mediano, sesiones: r.sesiones }]));
const activos = Object.fromEntries(db.prepare('SELECT ticker, actividad, emisor FROM activos').all().map(r => [r.ticker, { actividad: r.actividad, emisor: r.emisor }]));
process.stdout.write(JSON.stringify({ fund, mercado, activos }));

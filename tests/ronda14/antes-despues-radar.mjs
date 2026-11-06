// Demostración ANTES/DESPUÉS del radar con escritura fallida (fallo de la ronda 13). Uso:
//   node tests/ronda14/antes-despues-radar.mjs RUTA/public/js/almacen.js
// Simula localStorage que acepta la primera escritura y rechaza la segunda (cuota llena), con el adaptador `store` de cada versión.
const ruta = process.argv[2], { crearAlmacen } = await import(new URL(ruta, 'file://' + process.cwd() + '/').href);
const disco = {}; let lleno = false;
const ls = { getItem: k => disco[k] ?? null, setItem: (k, v) => { if (lleno) throw new Error('QuotaExceededError'); disco[k] = v; } };
const mem = {};
const store = { ok: true,                                               // adaptador de la ronda 13 (cae en silencio a memoria) + variantes estrictas de la ronda 14
  getItem: k => { try { return ls.getItem(k); } catch { return mem[k] ?? null; } }, setItem: (k, v) => { try { ls.setItem(k, v); } catch { mem[k] = v; } }, removeItem: k => { delete disco[k]; },
  setItemEstricto: (k, v) => ls.setItem(k, v), getItemEstricto: k => ls.getItem(k) };
const alm = crearAlmacen({ api: async () => ({}), logged: () => false, store, activos: () => ({ JNJ: { nombre: 'J&J', sector: 'Salud', tipo: 'accion' } }) }).radar;
await alm.guardar('JNJ', 'v1: nota guardada');                        // primer guardado: bien
lleno = true; let resultado;
try { await alm.guardar('JNJ', 'v2: texto nuevo'); resultado = 'la operación DIJO que había guardado (sin error)'; } catch (e) { resultado = `lanzó un error: «${e.message.slice(0, 70)}…»`; }
console.log(`${resultado}; el radar guarda ahora: «${alm.nota('JNJ')}»; en disco: «${JSON.parse(disco.klever_radar_local).JNJ.nota}»`);

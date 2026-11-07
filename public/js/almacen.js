// Almacenamiento del radar y de las ideas (sin interfaz).
// Con sesión: en la cuenta, por la API (la propiedad la comprueba el servidor en cada lectura y escritura).
// Sin sesión: el radar queda SOLO en este dispositivo (localStorage) y se marca como tal; las ideas requieren cuenta.
// Reglas de confianza:
//  · Nada devuelve «guardado» hasta que la escritura ha ocurrido de verdad (la API ha respondido bien o localStorage ha aceptado el valor).
//  · Un fallo de lectura NO es un radar vacío: se lanza un error distinto, para no mostrar «aún no has guardado nada» ni sobrescribir lo que hay.
//  · `reiniciar()` (salir o caducar la sesión) vacía la memoria e invalida las respuestas que aún estén en vuelo.

const CLAVE_RADAR_LOCAL = 'klever_radar_local';
export const ERR_LECTURA = 'lectura', ERR_ESCRITURA = 'escritura';
const fallo = (tipo, msg) => { const e = new Error(msg); e.tipo = tipo; return e; };

export function crearAlmacen({ api, logged, store, activos, idSesion = () => null }) {
  let gen = 0, mut = 0;                                     // mut: contador de escrituras; una lectura anterior a una escritura NO pisa su resultado                                              // se incrementa al reiniciar: toda respuesta de una generación anterior se descarta
  const leerLocal = () => {                                 // {} si no hay nada; LANZA si no se puede leer (≠ vacío)
    let crudo; try { crudo = store.getItemEstricto(CLAVE_RADAR_LOCAL); } catch { throw fallo(ERR_LECTURA, 'No se han podido leer las empresas que sigues en este dispositivo.'); }
    if (crudo == null || crudo === '') return {};
    try { const o = JSON.parse(crudo); if (o && typeof o === 'object' && !Array.isArray(o)) return o; } catch { /* se informa abajo */ }
    throw fallo(ERR_LECTURA, 'La lista de empresas que sigues en este dispositivo no se puede leer (datos dañados). No se ha borrado nada.');
  };
  const escribirLocal = o => {                              // LANZA si el almacenamiento falla o está lleno: nunca cae en silencio a la memoria
    try { if (Object.keys(o).length) store.setItemEstricto(CLAVE_RADAR_LOCAL, JSON.stringify(o)); else store.removeItemEstricto(CLAVE_RADAR_LOCAL); }     // el borrado también es estricto: si falla, el dato privado NO queda fingiendo estar borrado
    catch { throw fallo(ERR_ESCRITURA, 'No se ha podido guardar en este dispositivo (almacenamiento lleno o bloqueado). Tu texto sigue en pantalla: puedes reintentar.'); }
  };
  const nuevaClave = () => (crypto.randomUUID ? crypto.randomUUID() : 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  let radar = new Map();                                    // ticker → { ticker, nota, ... } (copia en memoria de la última lectura buena)

  const radarAlmacen = {
    enCuenta: () => logged(),
    tiene: t => radar.has(t),
    nota: t => radar.get(t)?.nota || '',
    todos: () => [...radar.values()],
    reiniciar() { gen++; radar = new Map(); },
    async cargar() {
      const g = gen, m0 = mut;
      if (logged()) {
        let filas; try { filas = await api('/radar'); } catch (e) { throw fallo(ERR_LECTURA, e.message || 'No se ha podido leer la lista de empresas que sigues.'); }
        if (g !== gen) return [];                           // la sesión cambió: se descarta
        if (m0 !== mut) return this.todos();                // hubo una escritura mientras llegaba esta lectura: la lectura es anterior y NO se aplica
        radar = new Map(filas.map(f => [f.ticker, f]));
      } else {
        const l = leerLocal(), a = activos();
        radar = new Map(Object.entries(l).map(([t, v]) => [t, { ticker: t, nombre: a[t]?.nombre || t, sector: a[t]?.sector || '', tipo: a[t]?.tipo || '', nota: v.nota || '', creado_en: v.t || null, local: true }]));
      }
      return this.todos();
    },
    async guardar(ticker, nota) {                           // nota undefined = conservar la que haya
      const g = gen; mut++;
      if (logged()) {
        const r = await api('/radar/' + encodeURIComponent(ticker), { method: 'PUT', body: nota === undefined ? {} : { nota } });
        if (g !== gen) return { nuevo: r.nuevo, local: false, descartado: true };
        const a = activos()[ticker] || {};
        radar.set(ticker, { ticker, nombre: a.nombre || ticker, sector: a.sector || '', tipo: a.tipo || '', nota: r.nota ?? '', creado_en: r.creado_en, actualizado_en: r.actualizado_en });
        return { nuevo: r.nuevo, local: false };
      }
      const l = leerLocal(), ya = !!l[ticker];              // si no se puede leer, se lanza ANTES de escribir (no se pisa lo que haya)
      l[ticker] = { nota: nota === undefined ? (l[ticker]?.nota || '') : nota, t: l[ticker]?.t || new Date().toISOString() };
      escribirLocal(l);                                     // si falla, la memoria NO cambia: el valor anterior sigue siendo el anterior y la interfaz lo sabe
      await this.cargar(); return { nuevo: !ya, local: true };
    },
    async quitar(ticker) {
      const g = gen; mut++;
      if (logged()) { await api('/radar/' + encodeURIComponent(ticker), { method: 'DELETE' }); if (g === gen) radar.delete(ticker); }
      else { const l = leerLocal(); delete l[ticker]; escribirLocal(l); radar.delete(ticker); }
    },
    // Al iniciar sesión: lo guardado en este dispositivo pasa a la cuenta (idempotente; no pisa una nota que la cuenta ya tenga).
    // El intento queda ATADO a la sesión de origen: antes de cada lectura, escritura y del borrado del original se comprueba que la generación y la
    // identidad de la sesión siguen siendo las mismas; si cambian (salir, otra cuenta), se corta y NO se borra lo local ni se escribe en otra cuenta.
    async migrarLocal() {
      let l; try { l = leerLocal(); } catch { return 0; }
      const ts = Object.keys(l); if (!logged() || !ts.length) return 0;
      const g = gen, id0 = idSesion(), mismo = () => g === gen && logged() && idSesion() === id0;
      const filas = await api('/radar'); if (!mismo()) return 0;
      const remoto = new Map(filas.map(f => [f.ticker, f]));
      let n = 0;
      for (const t of ts) {
        const ya = remoto.get(t), nota = l[t].nota || '';
        if (!ya) { if (!mismo()) return n; await api('/radar/' + encodeURIComponent(t), { method: 'PUT', body: { nota } }); n++; }
        else if (!ya.nota && nota) { if (!mismo()) return n; await api('/radar/' + encodeURIComponent(t), { method: 'PUT', body: { nota } }); }
        if (!mismo()) return n;
      }
      if (!mismo()) return n;
      try { store.removeItemEstricto(CLAVE_RADAR_LOCAL); } catch { /* si no se puede borrar, queda y se repetirá (idempotente) */ }
      return n;                                                   // solo se borra lo local cuando TODO se ha guardado, en la misma sesión
    },
  };

  const escenariosAlmacen = {
    nuevaClave,
    listar: () => api('/escenarios'),
    leer: id => api('/escenarios/' + id),
    crear: cuerpo => api('/escenarios', { method: 'POST', body: cuerpo }),
    actualizar: (id, cambios) => api('/escenarios/' + id, { method: 'PATCH', body: cambios }),
    borrar: id => api('/escenarios/' + id, { method: 'DELETE' }),
    revisar: (id, cuerpo) => api('/escenarios/' + id + '/revisiones', { method: 'POST', body: cuerpo }),   // ronda 21: añade una revisión (clave de intento; control de revisión)
  };
  return { radar: radarAlmacen, escenarios: escenariosAlmacen, reiniciar: () => radarAlmacen.reiniciar() };
}

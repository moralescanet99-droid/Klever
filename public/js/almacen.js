// Almacenamiento del radar y de los escenarios (sin interfaz).
// Con sesión: en la cuenta, por la API (la propiedad la comprueba el servidor en cada lectura y escritura).
// Sin sesión: el radar queda SOLO en este dispositivo (localStorage) y se marca como tal; los escenarios requieren cuenta.
// Nada devuelve «guardado en tu cuenta» hasta que la API ha respondido bien.

const CLAVE_RADAR_LOCAL = 'klever_radar_local';

export function crearAlmacen({ api, logged, store, activos }) {
  const leerLocal = () => { try { const o = JSON.parse(store.getItem(CLAVE_RADAR_LOCAL)); return o && typeof o === 'object' ? o : {}; } catch { return {}; } };
  const escribirLocal = o => { if (Object.keys(o).length) store.setItem(CLAVE_RADAR_LOCAL, JSON.stringify(o)); else store.removeItem(CLAVE_RADAR_LOCAL); };
  const nuevaClave = () => (crypto.randomUUID ? crypto.randomUUID() : 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  let radar = new Map();                                    // ticker → { ticker, nota, ... } (copia en memoria de la última lectura)

  const radarAlmacen = {
    enCuenta: () => logged(),
    persiste: () => (logged() ? true : store.ok),             // ¿sobrevivirá a cerrar la pestaña?
    tiene: t => radar.has(t),
    nota: t => radar.get(t)?.nota || '',
    todos: () => [...radar.values()],
    async cargar() {
      if (logged()) { const filas = await api('/radar'); radar = new Map(filas.map(f => [f.ticker, f])); }
      else { const l = leerLocal(), a = activos(); radar = new Map(Object.entries(l).map(([t, v]) => [t, { ticker: t, nombre: a[t]?.nombre || t, sector: a[t]?.sector || '', tipo: a[t]?.tipo || '', nota: v.nota || '', creado_en: v.t || null, local: true }])); }
      return this.todos();
    },
    async guardar(ticker, nota) {                              // nota undefined = conservar la que haya
      if (logged()) {
        const r = await api('/radar/' + encodeURIComponent(ticker), { method: 'PUT', body: nota === undefined ? {} : { nota } });
        const a = activos()[ticker] || {};
        radar.set(ticker, { ticker, nombre: a.nombre || ticker, sector: a.sector || '', tipo: a.tipo || '', nota: r.nota ?? '', creado_en: r.creado_en, actualizado_en: r.actualizado_en });
        return { nuevo: r.nuevo, local: false };
      }
      const l = leerLocal(), ya = !!l[ticker]; l[ticker] = { nota: nota === undefined ? (l[ticker]?.nota || '') : nota, t: l[ticker]?.t || new Date().toISOString() };
      escribirLocal(l); await this.cargar(); return { nuevo: !ya, local: true };
    },
    async quitar(ticker) {
      if (logged()) { await api('/radar/' + encodeURIComponent(ticker), { method: 'DELETE' }); radar.delete(ticker); }
      else { const l = leerLocal(); delete l[ticker]; escribirLocal(l); radar.delete(ticker); }
    },
    // Al iniciar sesión: lo guardado en este dispositivo pasa a la cuenta (idempotente; no pisa una nota que la cuenta ya tenga).
    async migrarLocal() {
      const l = leerLocal(), ts = Object.keys(l); if (!logged() || !ts.length) return 0;
      const remoto = new Map((await api('/radar')).map(f => [f.ticker, f]));
      let n = 0;
      for (const t of ts) {
        const ya = remoto.get(t), nota = l[t].nota || '';
        if (!ya) { await api('/radar/' + encodeURIComponent(t), { method: 'PUT', body: { nota } }); n++; }
        else if (!ya.nota && nota) await api('/radar/' + encodeURIComponent(t), { method: 'PUT', body: { nota } });
      }
      store.removeItem(CLAVE_RADAR_LOCAL); return n;                // solo se borra lo local cuando TODO se ha guardado
    },
  };

  const escenariosAlmacen = {
    nuevaClave,
    listar: () => api('/escenarios'),
    leer: id => api('/escenarios/' + id),
    crear: cuerpo => api('/escenarios', { method: 'POST', body: cuerpo }),
    actualizar: (id, cambios) => api('/escenarios/' + id, { method: 'PATCH', body: cambios }),
    borrar: id => api('/escenarios/' + id, { method: 'DELETE' }),
  };
  return { radar: radarAlmacen, escenarios: escenariosAlmacen };
}

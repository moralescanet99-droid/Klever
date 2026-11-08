// Fase 1 (ronda 33) · utilidades comunes de la interfaz (antes, al principio de app.js): almacenamiento seguro, selectores, escape y formatos de cifras.
export const store = (() => { const m = {}; let ok = true; try { localStorage.setItem('__k', '1'); localStorage.removeItem('__k'); } catch { ok = false; } return { ok, // ok: ¿persiste de verdad en este dispositivo?
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } },
  // Variantes ESTRICTAS (radar del visitante): lanzan si el almacenamiento falla, en vez de caer en silencio a la memoria y devolver después el valor anterior.
  setItemEstricto: (k, v) => localStorage.setItem(k, v), getItemEstricto: k => localStorage.getItem(k), removeItemEstricto: k => localStorage.removeItem(k) }; })();
export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const NB = ' '; // espacio duro: número y unidad nunca se separan
export const nf = (v, d = 1) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
export const pct = v => v == null ? '—' : nf(v * 100) + NB + '%';   // fracción: 0,12 → 12,0 %
export const pesoTxt = v => nf(v) + NB + '%';                          // ya en puntos porcentuales (1 decimal)
export const pesoCorto = v => (Number.isInteger(r1(v)) ? nf(v, 0) : nf(v, 1)) + NB + '%'; // 12 % · 12,5 %
export const miles = v => v == null ? '—' : nf(v / 1e9);               // miles de millones
export const r1 = v => Math.round(v * 10) / 10;
export const parsePeso = s => { const n = parseFloat(String(s).trim().replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
export const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

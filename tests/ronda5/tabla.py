"""Genera la tabla de evidencias de ronda5/LEEME.md desde ronda5/evidencias-D.json (lo observado en la ejecución)."""
import json, sys
src = sys.argv[1] if len(sys.argv) > 1 else "ronda5/evidencias-D.json"
filas = json.load(open(src))
esc = lambda s: str(s).replace("|", "\\|").replace("\n", " ")
print("| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |")
print("|---|---|---|---|---|---|")
for f in filas:
    print(f"| {f['id']} | {esc(f['escenario'])} | {esc(f['esperado'])} | {esc(f['observado'])} | {esc(f['evidencia']) or 'ver baterías'} | {'✅' if f['resultado']=='OK' else '❌'} |")

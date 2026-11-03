"""Compone ronda8/LEEME.md y ronda8/EVIDENCIAS.md con lo OBSERVADO. Uso: python3 tests/ronda8/informe8.py"""
import json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
res = (R / 'ronda8/resultado-ejecucion.txt').read_text()
commit = re.search(r'commit ([0-9a-f]{7,40}|desconocido)', res).group(1)
arbol = 'árbol de trabajo limpio' if 'limpio' in res.split('\n')[1] else 'ATENCIÓN: se ejecutó con cambios sin commitear'
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
ausentes = []
def tabla(f):
    out = ['| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |', '|---|---|---|---|---|---|']
    for x in json.load(open(R / 'ronda8' / f)):
        e = x.get('evidencia') or ''
        if e.endswith('.png'):
            ok = (R / 'ronda8/evidencias' / e).exists()
            if not ok: ausentes.append(e)
            e = f'`ronda8/evidencias/{e}`' + ('' if ok else ' (**ausente**)')
        out.append(f"| {x['id']} | {esc(x['escenario'])} | {esc(x['esperado'])} | {esc(x['observado'])} | {e or 'texto y valores en la propia fila'} | {'✅' if x['resultado'] == 'OK' else '❌'} |")
    return '\n'.join(out)
t = (R / 'ronda8/LEEME.plantilla.md').read_text()
for k, v in {'{{COMMIT}}': commit, '{{ARBOL}}': arbol, '{{RESULTADO}}': res.strip(), **{'{{TABLA_%s}}' % c: tabla(f'evidencias-{c}.json') for c in 'RMGFUED'}}.items():
    t = t.replace(k, v)
(R / 'ronda8/LEEME.md').write_text(t)
l = ['# Evidencias referenciadas: presentes y ausentes', '', 'Solo las capturas de la ronda 8 se versionan (ronda8/evidencias/). Las de las rondas 3–7 se regeneran con las baterías (la 6 se entregó en un zip). Esta tabla dice, archivo por archivo, qué hay en el repositorio.', '', '| Informe | Archivo citado | En el repositorio |', '|---|---|---|']
for informe, carpeta in (('ronda8/LEEME.md', 'ronda8'), ('ronda7/LEEME.md', 'ronda7'), ('ronda6/LEEME.md', 'ronda6'), ('ronda5/LEEME.md', 'ronda5')):
    p = R / informe
    if not p.exists(): continue
    for c in sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.png)', p.read_text()))):
        pres = (R / carpeta / 'evidencias' / c).exists()
        l.append(f'| `{informe}` | `{carpeta}/evidencias/{c}` | {"✅ presente" if pres else "❌ ausente (se regenera con la batería)"} |')
(R / 'ronda8/EVIDENCIAS.md').write_text('\n'.join(l) + '\n')
print(f'informe escrito (commit {commit}); capturas ausentes de ronda8: {ausentes or "ninguna"}')

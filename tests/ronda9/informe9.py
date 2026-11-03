"""Compone ronda9/LEEME.md y ronda9/EVIDENCIAS.md. Uso: python3 tests/ronda9/informe9.py"""
import json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
res = (R / 'ronda9/resultado-ejecucion.txt').read_text()
commit = re.search(r'commit ([0-9a-f]{7,40}|desconocido)', res).group(1)
arbol = 'árbol de trabajo limpio' if 'limpio' in res.split('\n')[1] else 'ATENCIÓN: se ejecutó con cambios sin commitear'
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
def tabla(f):
    out = ['| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |', '|---|---|---|---|---|---|']
    for x in json.load(open(R / 'ronda9' / f)):
        e = x.get('evidencia') or ''
        if e.endswith('.png'): e = f'`ronda9/evidencias/{e}`' + ('' if (R / 'ronda9/evidencias' / e).exists() else ' (**ausente**)')
        out.append(f"| {x['id']} | {esc(x['escenario'])} | {esc(x['esperado'])} | {esc(x['observado'])} | {e or 'texto y valores en la propia fila'} | {'✅' if x['resultado'] == 'OK' else '❌'} |")
    return '\n'.join(out)
t = (R / 'ronda9/LEEME.plantilla.md').read_text()
for k, v in {'{{COMMIT}}': commit, '{{ARBOL}}': arbol, '{{RESULTADO}}': res.strip(), **{'{{TABLA_%s}}' % c: tabla(f'evidencias-{c}.json') for c in 'RUF'}}.items(): t = t.replace(k, v)
(R / 'ronda9/LEEME.md').write_text(t)
l = ['# Evidencias referenciadas: presentes y ausentes', '', 'Solo las capturas de las rondas 8 y 9 (si las hay) se versionan. Las anteriores se regeneran con las baterías.', '', '| Informe | Archivo citado | En el repositorio |', '|---|---|---|']
for informe, carpeta in (('ronda9/LEEME.md', 'ronda9'), ('ronda8/LEEME.md', 'ronda8'), ('ronda7/LEEME.md', 'ronda7'), ('ronda6/LEEME.md', 'ronda6'), ('ronda5/LEEME.md', 'ronda5')):
    p = R / informe
    if p.exists():
        for c in sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.png)', p.read_text()))):
            l.append(f'| `{informe}` | `{carpeta}/evidencias/{c}` | {"✅ presente" if (R / carpeta / "evidencias" / c).exists() else "❌ ausente (se regenera con la batería)"} |')
(R / 'ronda9/EVIDENCIAS.md').write_text('\n'.join(l) + '\n')
print(f'informe escrito (commit {commit})')

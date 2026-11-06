"""Compone ronda7/LEEME.md y ronda7/EVIDENCIAS.md con lo OBSERVADO (ronda7/resultado-ejecucion.txt y ronda7/evidencias-*.json).
Uso: python3 tests/ronda7/informe7.py"""
import json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
res = (R / 'ronda7/resultado-ejecucion.txt').read_text()
commit = re.search(r'commit ([0-9a-f]{7,40}|desconocido)', res).group(1)
arbol = 'árbol de trabajo limpio' if 'limpio' in res.split('\n')[1] else 'ATENCIÓN: se ejecutó con cambios sin commitear'
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
ausentes = []
def tabla(f, carpeta='ronda7'):
    filas = json.load(open(R / carpeta / f))
    out = ['| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |', '|---|---|---|---|---|---|']
    for x in filas:
        e = x.get('evidencia') or ''
        if e.endswith('.png'):
            ok = (R / 'ronda7/evidencias' / e).exists()
            if not ok: ausentes.append(e)
            e = f'`ronda7/evidencias/{e}`' + ('' if ok else ' (**ausente**)')
        out.append(f"| {x['id']} | {esc(x['escenario'])} | {esc(x['esperado'])} | {esc(x['observado'])} | {e or 'texto y valores en la propia fila'} | {'✅' if x['resultado'] == 'OK' else '❌'} |")
    return '\n'.join(out)
t = (R / 'ronda7/LEEME.plantilla.md').read_text()
for k, v in {'{{COMMIT}}': commit, '{{ARBOL}}': arbol, '{{RESULTADO}}': res.strip(), '{{TABLA_U}}': tabla('evidencias-U.json'), '{{TABLA_F}}': tabla('evidencias-F.json'),
             '{{TABLA_E}}': tabla('evidencias-E.json'), '{{TABLA_D}}': tabla('evidencias-D.json')}.items():
    t = t.replace(k, v)
(R / 'ronda7/LEEME.md').write_text(t)
# Índice de evidencias referenciadas por los informes anteriores
lineas = ['# Evidencias referenciadas: presentes y ausentes', '', 'Las capturas de las rondas 3–6 **no se versionan** (pesan y se regeneran). Esta tabla dice, archivo por archivo, qué hay en el repositorio.', '', '| Informe | Archivo citado | En el repositorio |', '|---|---|---|']
for informe, carpeta in (('ronda7/LEEME.md', 'ronda7'), ('ronda6/LEEME.md', 'ronda6'), ('ronda5/LEEME.md', 'ronda5')):
    p = R / informe
    if not p.exists(): continue
    citados = sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.png)', p.read_text())))
    for c in citados:
        pres = (R / carpeta / 'evidencias' / c).exists()
        lineas.append(f'| `{informe}` | `{carpeta}/evidencias/{c}` | {"✅ presente" if pres else "❌ ausente (se regenera con la batería; la ronda 6 se entregó en un zip)"} |')
(R / 'ronda7/EVIDENCIAS.md').write_text('\n'.join(lineas) + '\n')
print(f'informe escrito (commit {commit}); capturas ausentes de ronda7: {ausentes or "ninguna"}')

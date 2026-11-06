"""Compone ronda11/LEEME.md, CAPTURAS.md y EVIDENCIAS.md. Uso: python3 tests/ronda11/informe11.py "<resumen ejecutor>" """
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
res = (R / 'ronda11/resultado-ejecucion.txt').read_text()
commit = re.search(r'commit ([0-9a-f]{7,40}|desconocido)', res).group(1)
arbol = 'árbol de trabajo limpio' if 'limpio' in res.split('\n')[1] else 'ATENCIÓN: se ejecutó con cambios sin commitear'
tot = sum(int(m.group(1)) for m in re.finditer(r'RESULTADO: (\d+) correctas, 0 fallos', res)); salida = re.search(r'RESUMEN: (.*)', res)
resumen = f"{tot} comprobaciones correctas; {salida.group(1) if salida else 'sin resumen'}"
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
def tabla(f):
    out = ['| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |', '|---|---|---|---|---|---|']
    for x in json.load(open(R / 'ronda11' / f)):
        e = x.get('evidencia') or ''
        if e.endswith('.png'): e = f'`ronda11/evidencias/{e}`' + ('' if (R / 'ronda11/evidencias' / e).exists() else ' (**ausente**)')
        out.append(f"| {x['id']} | {esc(x['escenario'])} | {esc(x['esperado'])} | {esc(x['observado'])} | {e or 'texto y valores en la propia fila'} | {'✅' if x['resultado'] == 'OK' else '❌'} |")
    return '\n'.join(out)
ej = sys.argv[1] if len(sys.argv) > 1 else 'ver ronda11/resultado-ejecutor.txt'
t = (R / 'ronda11/LEEME.plantilla.md').read_text()
for k, v in {'{{COMMIT}}': commit, '{{ARBOL}}': arbol, '{{RESUMEN}}': resumen, '{{RESULTADO}}': res.strip(), '{{EJECUTOR}}': ej, '{{TABLA_H}}': tabla('evidencias-H.json'), '{{TABLA_I}}': tabla('evidencias-I.json')}.items(): t = t.replace(k, v)
(R / 'ronda11/LEEME.md').write_text(t)
caps = sorted((R / 'ronda11/capturas').glob('antes-*.png'))
c = ['# Capturas comparables antes / después (ronda 11): editor de cartera', '', 'Mismos nombres con prefijo `antes-` y `despues-`, de `tests/ronda11/capturas.cjs`. Chromium; 320, 390 y 1440 px. **El texto ampliado es una simulación** (font-size del documento).', '',
     '| Estado | 320 px (antes → después) | 390 px (antes → después) | 1440 px (antes → después) |', '|---|---|---|---|']
estados = [('1-normal', 'Normal (guardada)'), ('1-normal-pagina', 'Normal, página completa'), ('2-pendiente', 'Pendiente de guardar'), ('3-error-guardado', 'Error de guardado (título largo)'), ('4-publica-con-cambios-privados', 'Pública con cambios privados'), ('5-texto-ampliado', 'Texto ampliado (simulado), arriba'), ('5-texto-ampliado-desplazado', 'Texto ampliado (simulado), desplazado')]
for k, n in estados:
    celdas = []
    for w in (320, 390, 1440):
        a, d = f'antes-{k}-{w}.png', f'despues-{k}-{w}.png'
        celdas.append(f'`{a}` → `{d}`' + ('' if (R / 'ronda11/capturas' / a).exists() and (R / 'ronda11/capturas' / d).exists() else ' (**ausente**)'))
    c.append(f'| {n} | ' + ' | '.join(celdas) + ' |')
(R / 'ronda11/CAPTURAS.md').write_text('\n'.join(c) + '\n')
l = ['# Evidencias referenciadas: presentes y ausentes', '', 'Se versionan las capturas de la ronda 11 (`ronda11/capturas/`) y las evidencias de sus baterías (`ronda11/evidencias/`). Las de rondas anteriores se regeneran con las baterías.', '', '| Informe | Archivo citado | En el repositorio |', '|---|---|---|']
for informe, carpeta in (('ronda11/LEEME.md', 'ronda11'), ('ronda10/LEEME.md', 'ronda10'), ('ronda9/LEEME.md', 'ronda9'), ('ronda8/LEEME.md', 'ronda8')):
    p = R / informe
    if p.exists():
        for f in sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.png)', p.read_text()))): l.append(f'| `{informe}` | `{carpeta}/evidencias/{f}` | {"✅ presente" if (R / carpeta / "evidencias" / f).exists() else "❌ ausente (se regenera con la batería)"} |')
(R / 'ronda11/EVIDENCIAS.md').write_text('\n'.join(l) + '\n')
print(f'informe escrito (commit {commit}); {resumen}')

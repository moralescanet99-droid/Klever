"""Compone ronda10/LEEME.md, ronda10/CAPTURAS.md y ronda10/EVIDENCIAS.md. Uso: python3 tests/ronda10/informe10.py [resumen-ejecutor]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
res = (R / 'ronda10/resultado-ejecucion.txt').read_text()
commit = re.search(r'commit ([0-9a-f]{7,40}|desconocido)', res).group(1)
arbol = 'árbol de trabajo limpio' if 'limpio' in res.split('\n')[1] else 'ATENCIÓN: se ejecutó con cambios sin commitear'
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
def tabla(f):
    out = ['| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |', '|---|---|---|---|---|---|']
    for x in json.load(open(R / 'ronda10' / f)):
        e = x.get('evidencia') or ''
        if e.endswith('.png'): e = f'`ronda10/evidencias/{e}`' + ('' if (R / 'ronda10/evidencias' / e).exists() else ' (**ausente**)')
        out.append(f"| {x['id']} | {esc(x['escenario'])} | {esc(x['esperado'])} | {esc(x['observado'])} | {e or 'texto y valores en la propia fila'} | {'✅' if x['resultado'] == 'OK' else '❌'} |")
    return '\n'.join(out)
a, d = json.load(open(R / 'ronda10/medidas-antes.json')), json.load(open(R / 'ronda10/medidas-despues.json'))
filas = [('Altura de la página del editor (px)', 'paginaEditor'), ('Altura del panel «Resumen» (px)', 'resumenAlto'), ('Texto visible del resumen (caracteres)', 'resumenTextoVisible'), ('Texto visible del pie (caracteres)', 'pieTextoVisible'),
         ('Altura de la barra inferior (px)', 'barraAlto'), ('Altura de la barra con texto al 200 % (px, simulado)', 'barraAlto200'), ('Aviso: posición CSS', 'avisoPosicion'), ('Aviso: controles que tapa (cabecera, título…)', 'avisoTapaControles')]
m = ['| Medida | ' + ' | '.join(f'{w} px antes → después' for w in ('320', '390', '1440')) + ' |', '|---|---|---|---|']
for n, k in filas: m.append(f'| {n} | ' + ' | '.join(f'{a[w][k]} → {d[w][k]}' for w in ('320', '390', '1440')) + ' |')
ejecutor = sys.argv[1] if len(sys.argv) > 1 else 'ver ronda10/resultado-ejecutor.txt'
t = (R / 'ronda10/LEEME.plantilla.md').read_text()
for k, v in {'{{COMMIT}}': commit, '{{ARBOL}}': arbol, '{{RESULTADO}}': res.strip(), '{{TABLA_MEDIDAS}}': '\n'.join(m), '{{EJECUTOR}}': ejecutor, **{'{{TABLA_%s}}' % c: tabla(f'evidencias-{c}.json') for c in 'HAR'}}.items(): t = t.replace(k, v)
(R / 'ronda10/LEEME.md').write_text(t)
caps = sorted((R / 'ronda10/capturas').glob('antes-*.png')); c = ['# Capturas comparables antes / después (ronda 10)', '', 'Mismos nombres con prefijo `antes-` y `despues-`, tomadas por `tests/ronda10/capturas.cjs`. Chromium; 320, 390 y 1440 px. El texto ampliado y el teclado son **simulaciones**.', '',
     '- **N1–N4** aviso de guardado (inicio de la animación, completo, con la página desplazada, sobre «Mis carteras»).', '- **E1–E4** errores: guardado fallido con título largo (al instante y a los 5 s), ficha que no carga (al instante y a los 5 s: antes desaparece, después permanece).', '- **R1–R2** resumen de ROIC.', '- **M1–M3** editor en móvil: arriba, abajo (pie) y página completa.', '', '| Escenario | Antes | Después |', '|---|---|---|']
for p in caps:
    n = p.name.replace('antes-', ''); ok = (R / 'ronda10/capturas' / ('despues-' + n)).exists()
    c.append(f'| `{n[:-4]}` | `ronda10/capturas/{p.name}` | `ronda10/capturas/despues-{n}`{"" if ok else " (**ausente**)"} |')
(R / 'ronda10/CAPTURAS.md').write_text('\n'.join(c) + '\n')
l = ['# Evidencias referenciadas: presentes y ausentes', '', 'Se versionan las capturas de la ronda 10 y las de las baterías de la ronda 10 (`ronda10/evidencias/`, `ronda10/capturas/`). Las de rondas anteriores se regeneran con las baterías.', '', '| Informe | Archivo citado | En el repositorio |', '|---|---|---|']
for informe, carpeta in (('ronda10/LEEME.md', 'ronda10'), ('ronda9/LEEME.md', 'ronda9'), ('ronda8/LEEME.md', 'ronda8'), ('ronda7/LEEME.md', 'ronda7'), ('ronda6/LEEME.md', 'ronda6'), ('ronda5/LEEME.md', 'ronda5')):
    p = R / informe
    if p.exists():
        for f in sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.png)', p.read_text()))): l.append(f'| `{informe}` | `{carpeta}/evidencias/{f}` | {"✅ presente" if (R / carpeta / "evidencias" / f).exists() else "❌ ausente (se regenera con la batería)"} |')
(R / 'ronda10/EVIDENCIAS.md').write_text('\n'.join(l) + '\n')
print(f'informe escrito (commit {commit})')

"""Compone ronda6/LEEME.md con los datos OBSERVADOS: totales del ejecutor y filas de evidencias-E.json y evidencias-D.json.
Uso: python3 tests/ronda5/informe6.py /tmp/wr/run2.txt"""
import json, re, sys, subprocess, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
salida = open(sys.argv[1]).read()
tot = {m.group(1): (int(m.group(2)), int(m.group(3))) for m in re.finditer(r"=== (test\w) ===\s+RESULTADO: (\d+) correctas, (\d+) fallos", salida)}
ok = sum(v[0] for v in tot.values()); fallos = sum(v[1] for v in tot.values())
tabla = lambda f: subprocess.run([sys.executable, str(R / 'tests/ronda5/tabla.py'), str(R / f)], capture_output=True, text=True).stdout.strip()
t = (R / 'ronda6/LEEME.plantilla.md').read_text()
for k, v in {'{{A}}': tot['testA'][0], '{{B}}': tot['testB'][0], '{{C}}': tot['testC'][0], '{{D}}': tot['testD'][0], '{{E}}': tot['testE'][0],
             '{{TOTAL}}': ok, '{{FALLOS}}': fallos, '{{TABLA_E}}': tabla('ronda6/evidencias-E.json'), '{{TABLA_D}}': tabla('ronda6/evidencias-D.json')}.items():
    t = t.replace(k, str(v))
(R / 'ronda6/LEEME.md').write_text(t)
print(f'informe escrito: {ok} correctas, {fallos} fallos; E={len(json.load(open(R/"ronda6/evidencias-E.json")))} escenarios, D={len(json.load(open(R/"ronda6/evidencias-D.json")))}')

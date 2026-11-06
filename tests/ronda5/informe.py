"""Compone ronda5/LEEME.md con los datos OBSERVADOS: totales de run-all.out y filas de evidencias-D.json.
Uso: python3 tests/ronda5/informe.py /tmp/wr/rd/run-all.out"""
import json, re, sys, subprocess, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
salida = open(sys.argv[1]).read()
tot = {m.group(1): (int(m.group(2)), int(m.group(3))) for m in re.finditer(r"=== (test\w) ===\s+RESULTADO: (\d+) correctas, (\d+) fallos", salida)}
total_ok = sum(v[0] for v in tot.values()); total_fail = sum(v[1] for v in tot.values())
tabla = subprocess.run([sys.executable, str(R / 'tests/ronda5/tabla.py'), str(R / 'ronda5/evidencias-D.json')], capture_output=True, text=True).stdout
plantilla = (R / 'ronda5/LEEME.plantilla.md').read_text()
texto = (plantilla.replace('{{TABLA}}', tabla.strip())
         .replace('{{A}}', str(tot['testA'][0])).replace('{{B}}', str(tot['testB'][0])).replace('{{C}}', str(tot['testC'][0])).replace('{{D}}', str(tot['testD'][0]))
         .replace('{{TOTAL}}', str(total_ok)).replace('{{FALLOS}}', str(total_fail)))
(R / 'ronda5/LEEME.md').write_text(texto)
print(f'informe escrito: {total_ok} correctas, {total_fail} fallos; {len(json.load(open(R / "ronda5/evidencias-D.json")))} escenarios con evidencia')

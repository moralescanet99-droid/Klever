# Datos de PRUEBA locales (inventados): universo completo, con huecos para probar "sin dato" y cobertura.
import json, random, hashlib, pathlib
RAIZ = pathlib.Path(__file__).resolve().parents[2]
uni = json.load(open(RAIZ / 'data/universe.json')) + json.load(open(RAIZ / 'data/ficticios.json'))   # ronda 14: además, el caso FICTICIO de la historia editorial (no está en el universo real)
out = []
def q(s): return "'" + str(s).replace("'", "''") + "'"
for a in uni:
    out.append(f"INSERT INTO activos(ticker,nombre,tipo,sector) VALUES({q(a['ticker'])},{q(a['nombre'])},{q(a['tipo'])},{q(a['sector'])});")
    if a['tipo'] != 'accion': continue
    r = random.Random(int(hashlib.md5(a['ticker'].encode()).hexdigest(), 16) % 10**8)
    fin = a['sector'] == 'Finanzas'            # los bancos salen sin deuda/EBITDA/ROIC (como pasaría con datos reales)
    ing = (20 + r.random()*220) * 1e9 * .8; rows = []
    for y in (2022, 2023, 2024):
        ing *= .97 + r.random()*.14; m = .03 + r.random()*.28; e = ing*(.12 + r.random()*.3); d = (r.random()*3.2 - .3)*e
        rows.append(dict(y=y, ing=ing, ni=ing*m, debt=None if fin else d, ebitda=None if fin else e, fcf=ing*(r.random()*.25 - .03), roic=None if fin else .02 + r.random()*.28))
    r2 = random.Random(int(hashlib.md5(('x' + a['ticker']).encode()).hexdigest(), 16) % 10**8); ing0 = rows[0]['ing']; antes = []
    for y in (2021, 2020):                      # ronda 15: cinco ejercicios. Los dos anteriores salen de OTRO generador: 2022-2024 no cambian
        ing0 = ing0 / (.97 + r2.random()*.14); m = .03 + r2.random()*.28; e = ing0*(.12 + r2.random()*.3); d = (r2.random()*3.2 - .3)*e
        antes.insert(0, dict(y=y, ing=ing0, ni=ing0*m, debt=None if fin else d, ebitda=None if fin else e, fcf=ing0*(r2.random()*.25 - .03), roic=None if fin else .02 + r2.random()*.28))
    for x in antes + rows:
        x['op'] = None if fin or x['ebitda'] is None else x['ebitda'] * (.55 + r2.random()*.3)    # resultado operativo (≈ EBITDA menos amortizaciones): inventado
        v = lambda z: 'NULL' if z is None else repr(float(z))
        out.append(f"INSERT INTO fundamentales(ticker,periodo,ingresos,beneficio_neto,deuda_neta,ebitda,flujo_caja_libre,roic,fuente,actualizado_en,resultado_operativo,informe) VALUES({q(a['ticker'])},'FY{x['y']}',{v(x['ing'])},{v(x['ni'])},{v(x['debt'])},{v(x['ebitda'])},{v(x['fcf'])},{v(x['roic'])},'prueba','2026-11-04',{v(x['op'])},'prueba-{a['ticker']}-FY{x['y']}');")
    ACT = {'Tecnología': ['Software', 'Semiconductores', 'Hardware'], 'Salud': ['Farmacia', 'Dispositivos', 'Servicios sanitarios'], 'Finanzas': ['Banca', 'Seguros', 'Mercados'], 'Energía': ['Petróleo y gas', 'Renovables', 'Servicios petrolíferos'],
           'Consumo básico': ['Alimentación', 'Bebidas', 'Distribución'], 'Consumo discrecional': ['Comercio minorista', 'Automoción', 'Ocio'], 'Industria': ['Maquinaria', 'Transporte', 'Defensa'], 'Comunicaciones': ['Medios', 'Telecomunicaciones', 'Plataformas'],
           'Materiales': ['Química', 'Metales', 'Envases'], 'Inmobiliario': ['Oficinas', 'Logística', 'Residencial'], 'Suministros': ['Electricidad', 'Agua', 'Gas']}
    acts = ACT.get(a['sector'], ['General']); act = acts[int(hashlib.md5(('a' + a['ticker']).encode()).hexdigest(), 16) % len(acts)]
    out.append(f"UPDATE activos SET actividad={q(act)}, emisor={q(a['ticker'].lower())} WHERE ticker={q(a['ticker'])};")
    cap = rows[-1]['ing'] * (1.2 + r2.random()*6); imp = cap * (.002 + r2.random()*.006)        # capitalización e importe diario mediano de 60 sesiones: inventados
    out.append(f"INSERT INTO mercado(ticker,capitalizacion,importe_diario_mediano,sesiones,moneda,fecha,fuente) VALUES({q(a['ticker'])},{cap:.0f},{imp:.0f},60,'USD','2026-11-04','prueba');")
    L, P = rows[-1], rows[-2]
    ok = lambda c, val: dict(ok=None if val is None else c, valor=val)
    crit = dict(periodo='FY2024',
        deuda_ebitda=ok(None if L['debt'] is None else L['debt']/L['ebitda'] < 2.5, None if L['debt'] is None else L['debt']/L['ebitda']),
        roic=ok(None if L['roic'] is None else L['roic'] > .1, L['roic']),
        margen_neto=ok(L['ni']/L['ing'] > .1, L['ni']/L['ing']),
        flujo_caja=ok(L['fcf'] > 0, L['fcf']),
        crecimiento=ok(L['ing'] > P['ing'], L['ing']/P['ing'] - 1))
    out.append(f"INSERT INTO ideas VALUES({q(a['ticker'])},{q(json.dumps(crit))},datetime('now'));")
cab = ['-- Klever · datos de PRUEBA (inventados). Solo para ejecutar la web en local con scripts/local/arrancar.sh.', '-- No son cifras reales de ninguna empresa. Se generan con tests/ronda5/seed.py (semilla fija: siempre salen los mismos).']
open(RAIZ / 'data/seed-prueba.sql', 'w').write('\n'.join(cab + out))
print(len(uni), 'activos sembrados')

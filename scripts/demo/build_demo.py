"""Construye la demo de Klever (interfaz real + servidor simulado en el navegador, con datos inventados).
Uso:  python3 scripts/demo/build_demo.py
Salidas:
  demo/index.html                    versión autónoma para publicar como web normal (Cloudflare Pages)
  build/klever_demo_artifact.html    variante para publicar como artefacto de Claude (sin <html>/<head>)
Entradas: public/index.html, public/style.css, public/app.js, data/universe.json, scripts/demo/mock.js
El mock.js se formatea con %: dentro de él, un % literal se escribe %%.
"""
import re
import pathlib
HERE=pathlib.Path(__file__).resolve().parent; R=str(HERE.parent.parent)+'/'; SP=str(HERE)+'/'
html=open(R+'public/index.html').read(); css=open(R+'public/style.css').read(); js=open(R+'public/app.js').read()
uni=open(R+'data/universe.json').read().strip(); mock=open(SP+'mock.js').read() % uni
body=re.search(r'<a class="saltar".*?(?=<script src="app.js")',html,re.S).group(0)
body=re.sub(r'<a href="legal.html"[^>]*>(.*?)</a>',r'\1',body)
body=body.replace('<main id="contenido" tabindex="-1">','<main id="contenido" tabindex="-1">\n  <div class="demo-banner"><b>Demostración sin persistencia de cuenta.</b> Todo vive en la memoria de esta página: <b>al recargar se pierde todo</b> (cuentas, carteras y cambios), y no es equivalente al servidor real que se prueba con las baterías automáticas. Todos los datos son inventados; nada de aquí es información financiera real.<label class="demo-fallo"><input type="checkbox" id="demo-fallo" onchange="window.__demoFalloGuardado=this.checked"> <b>Simular fallo de red al guardar</b> (solo demo: las peticiones de esta página son simuladas y no fallan por activar el modo sin conexión del navegador)</label></div>',1)
css+="\n.demo-fallo{display:block;margin-top:8px;font-size:.875rem}\n.demo-banner{background:var(--warn-bg);color:var(--warn);border-radius:var(--r);padding:12px var(--s2);margin-bottom:var(--s2);font-size:.9375rem}\n"
def sub(old,new):
    global js
    assert old in js, old[:60]; js=js.replace(old,new,1)
# el enlace del email: en la demo se simula con un botón
sub("""$('#acc-dev').innerHTML = r.dev_link ? `Modo desarrollo: <a href="${esc(r.dev_link)}">entrar</a>` : '';""",
"""$('#acc-dev').innerHTML = 'En la web real recibirías un email con un enlace. En la demo, púlsalo tú: <button type="button" class="btn btn-secundario" id="demo-enter">Simular enlace del email</button>';
  $('#demo-enter').onclick = async () => { const { token } = await api('/verify', { method: 'POST', body: { token: 'demo' } }); store.setItem('klever_token', token); $('#dlg-acceso').close(); actualizarCabecera(); await migrarBorrador(); route(); };""")
# TradingView no puede cargarse en la demo (CSP): recuadro honesto
a=js.index('function widget(container, src, config) {'); b=js.index('const placeholder =')
js=js[:a]+"""function widget(container, src, config) {
  container.innerHTML = '<div class="ph" style="min-height:' + (config.height || 200) + 'px">Aquí iría el widget de TradingView' + (config.symbol ? ' de ' + config.symbol : ' (screener de precios)') + '. En la demo no se carga.</div>';
}
"""+js[b:]
# la página de aviso legal no existe en la demo: se enlaza a un texto breve
js=js.replace('legal.html','#aviso')
out=f'''<title>Klever Demo</title>
<style>
{css}
</style>
{body}
<script>
{mock}
{js}
</script>
'''
pathlib.Path(R+'build').mkdir(exist_ok=True); open(R+'build/klever_demo_artifact.html','w').write(out); print('artefacto:',len(out)//1024,'KB')

# ---- versión autónoma para publicar como web normal (Cloudflare Pages) ----
import os
os.makedirs(R+'demo',exist_ok=True)
standalone = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Klever · Demo con datos inventados</title>
<meta name="description" content="Demo interactiva de Klever: crea una cartera simulada y explora empresas. Todos los datos son inventados.">
<meta name="robots" content="noindex">
</head>
<body>
""" + out.replace('<title>Klever Demo</title>\n','',1) + """
</body>
</html>
"""
open(R+'demo/index.html','w').write(standalone)
print('demo autónoma:',len(standalone)//1024,'KB')

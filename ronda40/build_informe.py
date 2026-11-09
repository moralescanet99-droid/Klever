import sys, re
sys.path.insert(0, 'pymd')
import markdown
src = open('/home/user/Klever/ronda40/INFORME-APP-FINAL.md', encoding='utf-8').read()
# drop the H1 (we render our own hero)
src = re.sub(r'^# .*\n', '', src, count=1)
body = markdown.markdown(src, extensions=['tables', 'sane_lists'])
body = body.replace('<table>', '<div class="tabla"><table>').replace('</table>', '</table></div>')
body = re.sub(r'(https?://[^\s<]+)', r'<a href="\1" target="_blank" rel="noopener">\1</a>', body)
body = body.replace('[NV]', '<span class="nv" title="No verificado en fuente primaria">NV</span>')

def tel(titulo, eti, cuerpo, activo):
    tabs = ''.join(f'<span class="{ "on" if i==activo else "" }">{n}</span>' for i, n in enumerate(['Mi cartera','La Liga','Construye']))
    return f'''<figure class="tel" aria-label="Boceto de {titulo}">
  <div class="tel-pant"><div class="tel-cab"><b>klever</b><i>Simulación · no es consejo</i></div>
  <span class="eti">{eti}</span><h3>{titulo}</h3>{cuerpo}</div>
  <div class="tel-bar">{tabs}</div><figcaption>{titulo}</figcaption></figure>'''

radar = '''<svg viewBox="0 0 200 170" class="radar" aria-hidden="true">
<g fill="none" stroke="var(--linea)"><polygon points="100,15 174,57 174,127 100,160 26,127 26,57"/><polygon points="100,50 144,75 144,110 100,130 56,110 56,75"/></g>
<polygon points="100,25 162,64 150,118 100,140 50,112 40,62" fill="var(--fant)" fill-opacity=".18" stroke="var(--fant)" stroke-dasharray="3 3"/>
<polygon points="100,40 150,68 156,120 100,150 60,118 52,68" fill="var(--cobre)" fill-opacity=".22" stroke="var(--cobre)" stroke-width="2"/>
<g fill="var(--tenue)" font-size="9" font-family="Geist Mono, monospace" text-anchor="middle"><text x="100" y="10">TEC</text><text x="186" y="57">SAL</text><text x="186" y="132">ENE</text><text x="100" y="170">FIN</text><text x="14" y="132">CON</text><text x="14" y="57">IND</text></g></svg>'''
s1 = radar + '<div class="sem"><span class="m">Concentración · Media</span><span class="b">Variedad · Amplia</span><span class="b">Datos · Completos</span></div><div class="seg"><span class="on">Reparto</span><span>Mapa</span><span>Evolución</span></div><p class="frase">Hace 4 semanas tu mayor posición pesaba el 46 %; hoy, el 28 %.</p>'
s2 = '<div class="puesto">4<sup>.º</sup></div><div class="pts"><div><b>37</b><small>Equilibrio /50</small></div><div><b>20</b><small>Aprendizaje /30</small></div><div><b>12</b><small>Constancia /20</small></div></div><div class="barras">' + ''.join(f'<i style="height:{h}%"></i>' for h in [40,55,62,69,0,0,0,0,0,0,0,0]) + '</div><p class="frase">Reto: ningún sector por encima del 40 %</p><div class="fila"><span>1</span>@luna_indexada<b>268</b></div><div class="fila tu"><span>4</span>Tú<b>231</b></div>'
flor = '<svg viewBox="0 0 100 100" class="flor" aria-hidden="true">' + ''.join(f'<ellipse cx="50" cy="{50-r}" rx="9" ry="{r}" transform="rotate({i*72} 50 50)" fill="{c}" fill-opacity="{o}" stroke="var(--cobre)"/>' for i,(r,c,o) in enumerate([(22,'var(--cobre)',.6),(22,'var(--cobre)',.6),(10,'var(--cobre)',.6),(22,'var(--cobre)',.6),(22,'none',1)])) + '</svg>'
s3 = '<div class="carta">' + flor + '<b>Nimbus Cloud</b><small>Tecnología · EE. UU. · 4/5</small><div class="acc"><span>Guardar idea</span><span class="pri">Probar en mi cartera</span></div></div><p class="frase">3 de 10 empresas de hoy</p><div class="equipo"><b>Equipo «Las Medusas»</b><small>Bajar NUBE al 24 % · 2 de 4 a favor · cierra en 23 h</small></div>'
bocetos = '<div class="bocetos">' + tel('Mi cartera','Lunes 9 nov · semana 3 de 12',s1,0) + tel('La Liga','Temporada 1 · liga «Facultad»',s2,1) + tel('Construye','Descubrir · huella en flor',s3,2) + '</div>'

html = f'''<title>Klever, la app final</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">
<style>
/* Informe con la identidad propuesta «espectro»: tinta + cobre de hoy + espectro del pasado. Columna de lectura y bocetos de las 3 pestañas. */
:root{{
  color-scheme:dark;
  --fondo:#0b0a0d; --panel:#141217; --panel-2:#1c1920; --linea:#2c2830;
  --texto:#efeae4; --tenue:#a59fa8; --cobre:#f0a46f; --fant:#c58af0; --plasma:#7cc4ff;
  --ok:#5fd39a; --medio:#f2c14e; --alto:#ff7a59;
  --f-ui:"Geist",system-ui,-apple-system,"Segoe UI",sans-serif;
  --f-disp:"Instrument Serif",Georgia,"Times New Roman",serif;
  --f-dato:"Geist Mono",ui-monospace,Menlo,monospace;
}}
@media (prefers-color-scheme: light){{ :root:not([data-theme="dark"]){{ --fondo:#f6f2ee; --panel:#fffdfb; --panel-2:#f0eae4; --linea:#e0d8d0; --texto:#1d1a22; --tenue:#5f5866; --cobre:#b5612a; --fant:#8a4fc2; --plasma:#1f6fb8; --ok:#1f8a57; --medio:#9a6a00; --alto:#c2401f; color-scheme:light }} }}
:root[data-theme="light"]{{ --fondo:#f6f2ee; --panel:#fffdfb; --panel-2:#f0eae4; --linea:#e0d8d0; --texto:#1d1a22; --tenue:#5f5866; --cobre:#b5612a; --fant:#8a4fc2; --plasma:#1f6fb8; --ok:#1f8a57; --medio:#9a6a00; --alto:#c2401f; color-scheme:light }}
*{{box-sizing:border-box}}
body{{background:var(--fondo);color:var(--texto);font:16.5px/1.65 var(--f-ui);margin:0}}
.envoltura{{max-width:1080px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
header.heroe{{padding-block:48px 24px;background:radial-gradient(ellipse 70% 60% at 80% 0%,color-mix(in srgb,var(--fant) 18%,transparent),transparent 70%),radial-gradient(ellipse 60% 50% at 10% 10%,color-mix(in srgb,var(--cobre) 16%,transparent),transparent 70%)}}
.sello{{display:inline-block;font:500 .72rem/1 var(--f-dato);letter-spacing:.08em;text-transform:uppercase;color:var(--tenue);border:1px solid var(--linea);border-radius:999px;padding:6px 12px}}
h1{{font:400 clamp(2.6rem,7vw,4.6rem)/1 var(--f-disp);margin:18px 0 10px;letter-spacing:-.01em;text-wrap:balance}}
h1 em{{color:var(--cobre)}}
.entradilla{{max-width:62ch;color:var(--tenue);font-size:1.08rem;margin:0}}
.tres{{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}}
.tres span{{font:600 .9rem var(--f-ui);padding:8px 14px;border-radius:999px;background:var(--panel-2);border:1px solid var(--linea)}}
.tres span:nth-child(1){{border-color:var(--cobre)}} .tres span:nth-child(2){{border-color:var(--fant)}} .tres span:nth-child(3){{border-color:var(--plasma)}}
.bocetos{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-block:28px 8px}}
@media (max-width:820px){{.bocetos{{grid-template-columns:minmax(0,1fr);max-width:340px;margin-inline:auto}}}}
.tel{{margin:0;display:grid;grid-template-rows:1fr auto auto;gap:0}} .tel figcaption{{margin-top:8px}}
.tel figcaption{{text-align:center;font:500 .78rem var(--f-dato);color:var(--tenue);letter-spacing:.06em;text-transform:uppercase}}
.tel-pant{{background:var(--panel);border:1px solid var(--linea);border-radius:28px 28px 0 0;padding:16px 14px;min-height:430px;display:grid;align-content:start;gap:10px;min-width:0}}
.tel-bar{{display:grid;grid-template-columns:repeat(3,1fr);background:var(--panel-2);border:1px solid var(--linea);border-top:0;border-radius:0 0 28px 28px;padding:10px 6px 14px;text-align:center;font-size:.72rem;color:var(--tenue)}}
.tel-bar .on{{color:var(--texto);font-weight:600}}
.tel-cab{{display:flex;justify-content:space-between;align-items:center;gap:6px}}
.tel-cab b{{font:600 1rem var(--f-ui)}} .tel-cab i{{font:normal .58rem var(--f-dato);color:var(--tenue);border:1px solid var(--linea);border-radius:999px;padding:3px 7px;white-space:nowrap}}
.tel .eti{{font:500 .66rem var(--f-dato);letter-spacing:.08em;text-transform:uppercase;color:var(--tenue)}}
.tel h3{{font:400 1.7rem/1 var(--f-disp);margin:0}}
.radar{{width:100%;max-width:220px;margin:0 auto;display:block}}
.sem{{display:flex;flex-wrap:wrap;gap:5px}} .sem span{{font-size:.68rem;padding:3px 8px;border-radius:999px;background:var(--panel-2)}}
.sem .m{{color:var(--medio)}} .sem .b{{color:var(--ok)}}
.seg{{display:grid;grid-template-columns:repeat(3,1fr);background:var(--panel-2);border-radius:999px;padding:3px;font-size:.72rem;text-align:center}}
.seg span{{padding:4px;border-radius:999px;color:var(--tenue)}} .seg .on{{background:var(--texto);color:var(--fondo);font-weight:600}}
.frase{{font-size:.8rem;color:var(--tenue);margin:0;line-height:1.4}}
.puesto{{font:400 5.4rem/1 var(--f-disp)}} .puesto sup{{font-size:1.6rem;color:var(--cobre)}}
.pts{{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}} .pts div{{background:var(--panel-2);border-radius:10px;padding:6px}} .pts b{{display:block;font:500 1.1rem var(--f-dato)}} .pts small{{font-size:.6rem;color:var(--tenue)}}
.barras{{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;height:60px;align-items:end}} .barras i{{display:block;background:linear-gradient(var(--cobre),var(--fant));border-radius:3px;min-height:3px}}
.fila{{display:grid;grid-template-columns:18px 1fr auto;gap:6px;font-size:.76rem;padding:6px 8px;border-radius:8px;background:var(--panel-2)}} .fila.tu{{outline:1px solid var(--cobre)}} .fila span{{color:var(--tenue)}} .fila b{{font-family:var(--f-dato)}}
.carta{{background:var(--panel-2);border-radius:18px;padding:12px;display:grid;gap:4px;text-align:center}}
.flor{{width:110px;margin:0 auto}} .carta small{{color:var(--tenue);font-size:.7rem}}
.acc{{display:flex;gap:6px;justify-content:center;margin-top:6px;flex-wrap:wrap}} .acc span{{font-size:.68rem;padding:5px 9px;border-radius:999px;border:1px solid var(--linea)}} .acc .pri{{background:var(--cobre);color:#1b0e05;border-color:var(--cobre);font-weight:600}}
.equipo{{border:1px dashed var(--linea);border-radius:12px;padding:8px;display:grid;font-size:.78rem}} .equipo small{{color:var(--tenue);font-size:.68rem}}
.nota-boc{{text-align:center;color:var(--tenue);font-size:.82rem;margin:0 0 8px}}
main{{padding-block:20px 60px}}
.doc{{max-width:760px;margin:0 auto}}
.doc h2{{font:400 2.1rem/1.1 var(--f-disp);margin:56px 0 14px;padding-top:18px;border-top:1px solid var(--linea);text-wrap:balance}}
.doc h3{{font:600 1.15rem var(--f-ui);margin:30px 0 8px;color:var(--cobre)}}
.doc p,.doc li{{max-width:68ch}}
.doc li{{margin-block:4px}}
.doc blockquote{{margin:0;padding:14px 18px;border-left:3px solid var(--fant);background:var(--panel);border-radius:0 12px 12px 0;color:var(--tenue)}}
.doc blockquote p{{margin:.4em 0}}
.doc strong{{color:var(--texto)}}
.doc code{{font:.88em var(--f-dato);background:var(--panel-2);padding:1px 6px;border-radius:6px}}
.doc a{{color:var(--plasma);overflow-wrap:anywhere}}
.doc hr{{border:0;border-top:1px solid var(--linea);margin:32px 0}}
.tabla{{overflow-x:auto;margin:16px 0;border:1px solid var(--linea);border-radius:14px}}
.tabla table{{border-collapse:collapse;width:100%;font-size:.9rem;min-width:520px}}
.tabla th{{text-align:left;font:500 .72rem var(--f-dato);letter-spacing:.06em;text-transform:uppercase;color:var(--tenue);background:var(--panel);padding:10px 12px}}
.tabla td{{padding:10px 12px;border-top:1px solid var(--linea);vertical-align:top}}
.nv{{font:500 .62rem var(--f-dato);color:var(--medio);border:1px solid currentColor;border-radius:4px;padding:0 4px;vertical-align:middle}}
footer{{color:var(--tenue);font-size:.82rem;padding-block:24px 40px;border-top:1px solid var(--linea)}}
@media (prefers-reduced-motion:reduce){{*{{transition:none!important;animation:none!important}}}}
</style>
<header class="heroe"><div class="envoltura">
<span class="sello">Informe · ronda 40 · propuesta, sin construir</span>
<h1>Klever, la app <em>final</em></h1>
<p class="entradilla">Lo mejor de los cuatro prototipos, sin supuestos prácticos y con tres secciones. Investigado con tres agentes: auditoría de los prototipos, comparativa con apps reales y legal, y viabilidad técnica a 0 €.</p>
<div class="tres"><span>Mi cartera</span><span>La Liga</span><span>Construye</span></div>
{bocetos}
<p class="nota-boc">Bocetos ilustrativos, no interactivos. Empresas, apodos y cifras de ejemplo.</p>
</div></header>
<main><div class="envoltura"><article class="doc">
{body}
</article></div></main>
<footer><div class="envoltura">Simulación · sin dinero real · no es consejo. Informe preparado para Javier · Klever · noviembre de 2026.</div></footer>
'''
open('/home/user/Klever/ronda40/informe-app-final.html','w',encoding='utf-8').write(html)
print(len(html))

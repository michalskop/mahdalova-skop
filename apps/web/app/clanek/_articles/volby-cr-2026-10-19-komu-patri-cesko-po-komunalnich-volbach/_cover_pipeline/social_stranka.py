"""Přehledná stránka k postování na sítě: ../_social/index.html (otevřít dvojklikem).

Texty jsou v ../_social/texty.json ({URL} se nahradí adresou článku), čísla v nich z ../_data_pipeline/vystup.txt.
Do textů se doplní nezlomitelné mezery (za jednopísmennými předložkami a spojkami, v tisících, před %).
Obrázky: covery z ../images, dlaždice map stran z ../_social (node dlazdice.cjs).
Spuštění: python social_stranka.py
"""
import html
import json
import re
from pathlib import Path

ART = Path(__file__).parent.parent
SOC = ART / '_social'
d = json.loads((SOC / 'texty.json').read_text(encoding='utf-8'))
URL = d['url']


def nb(t):
    t = re.sub(r'(^|(?<=\s))([vkszouaiVKSZOUAI]) ', '\\2\u00a0', t, flags=re.M)
    t = re.sub(r'(\d) (?=\d{3}\b)', '\\1\u00a0', t)
    return t.replace(' %', '\u00a0%')


STRANY = [('nez', 'Nezávislí'), ('ano', 'ANO'), ('stan', 'STAN'), ('spd', 'SPD'), ('zel', 'Zelení')]
OBRAZKY = [
    ('Covery', [('../images/cover-og.jpg', 'OG 1200×630 – náhled odkazu (FB, X, Bluesky, Lidé.cz)'),
                ('../images/cover-square.png', 'čtverec 1080×1080'),
                ('../images/cover-instagram.png', 'Instagram 1080×1350 – 1. snímek carouselu'),
                ('../images/cover-story.png', 'stories 1080×1920')]),
    ('Mapy stran – Instagram 1080×1350', [(f'{k}-ig.png', n) for k, n in STRANY]),
    ('Mapy stran – stories 1080×1920', [(f'{k}-story.png', n) for k, n in STRANY]),
    ('Mapy stran – čtverec 1080×1080 (X, Bluesky, Facebook)', [(f'{k}-ctverec.png', n) for k, n in STRANY]),
]

e = html.escape
casti = []
for b in d['bloky']:
    limit = b.get('limit')
    polozky = []
    for i, t in enumerate(b['texty'], 1):
        t = nb(t.replace('{URL}', URL))
        delka = len(t.replace(URL, 'x' * 23)) if b['id'] == 'x' else len(t)
        if limit and delka > limit:
            raise SystemExit(f'{b["id"]} {i}/: {delka} znaků, limit {limit}')
        meta = f'{delka} znaků' + (f' / limit {limit}' if limit else '')
        cislo = f'<span class="n">{i}/</span>' if len(b['texty']) > 1 else ''
        polozky.append(f'<div class="txt">{cislo}<pre>{e(t)}</pre><div class="row"><span class="meta">{meta}</span>'
                       f'<button onclick="kopiruj(this)">Kopírovat</button></div></div>')
    casti.append(f'<section><h2>{e(b["sit"])}</h2><p class="pozn">{e(b["pozn"])}</p>{"".join(polozky)}</section>')

galerie = ''.join(
    f'<section><h2>{e(nadpis)}</h2><div class="grid">' + ''.join(
        f'<figure><a href="{src}" download><img src="{src}" alt="{e(popis)}" loading="lazy"></a>'
        f'<figcaption>{e(popis)} · <a href="{src}" download>stáhnout</a></figcaption></figure>' for src, popis in polozky)
    + '</div></section>' for nadpis, polozky in OBRAZKY)

stranka = f'''<!doctype html><html lang="cs"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sítě: komu patří Česko</title>
<style>
:root{{--ink:#101432;--muted:#4c4f8e;--paper:#fdfbf7;--card:#f8f6f0;--line:#e9e9dd;--red:#de1743;--ok:#06677d}}
body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 "IBM Plex Sans",Arial,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px 80px}}
h1{{font-family:"IBM Plex Serif",Georgia,serif;font-size:30px;margin:0 0 4px}}
h2{{font-size:20px;margin:36px 0 6px;border-bottom:2px solid var(--ink);padding-bottom:4px}}
.lead{{color:var(--muted)}} .pozn{{color:var(--muted);margin:4px 0 12px}}
.txt{{background:var(--card);border-radius:6px;padding:12px 14px;margin:10px 0}}
.txt pre{{white-space:pre-wrap;font:inherit;margin:0}}
.n{{font-weight:700;color:var(--red);margin-right:6px}}
.row{{display:flex;justify-content:space-between;align-items:center;margin-top:8px}}
.meta{{font-size:13px;color:var(--muted)}}
button{{font:600 14px "IBM Plex Sans",Arial,sans-serif;background:var(--ink);color:#fff;border:0;border-radius:4px;padding:6px 14px;cursor:pointer}}
button.done{{background:var(--ok)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}}
figure{{margin:0}} figure img{{width:100%;border-radius:6px;display:block;background:var(--ink)}}
figcaption{{font-size:13px;color:var(--muted);margin-top:4px}}
a{{color:var(--ink)}}
</style></head><body><main>
<h1>Komu patří Česko po komunálních volbách: podklady na sítě</h1>
<p class="lead">Článek: <a href="{URL}">{URL}</a><br>Všechna čísla jsou z článku a z výstupu jeho skriptu (<code>_data_pipeline/vystup.txt</code>). Texty jsou návrhy, upravte si je klidně podle sebe.</p>
{''.join(casti)}
{galerie}
</main>
<script>
function kopiruj(btn) {{
  const t = btn.closest('.txt').querySelector('pre').innerText;
  const hotovo = () => {{ btn.textContent = 'Zkopírováno'; btn.classList.add('done'); setTimeout(() => {{ btn.textContent = 'Kopírovat'; btn.classList.remove('done'); }}, 1500); }};
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(hotovo, () => zaloha(t, hotovo)); else zaloha(t, hotovo);
}}
function zaloha(t, hotovo) {{
  const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select();
  document.execCommand('copy'); a.remove(); hotovo();
}}
</script></body></html>'''
(SOC / 'index.html').write_text(stranka, encoding='utf-8')
print(SOC / 'index.html')

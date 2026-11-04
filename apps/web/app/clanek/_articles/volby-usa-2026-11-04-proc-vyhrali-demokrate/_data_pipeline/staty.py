# Kolik amerických států je menších než Česko a kolik obyvatel zastupují senátoři obou stran.
# Vstupy: raw/NST-EST2025-ALLDATA.csv (US Census Bureau, Vintage 2025, odhad k 1. 7. 2025)
#         Česko 10 915 839 obyvatel k 31. 12. 2025 (ČSÚ, Pohyb obyvatelstva – rok 2025)
#         senat_2027.csv (stát, strana senátora 1, strana senátora 2) – složení Senátu po volbách 2026
# Spuštění: python -X utf8 staty.py
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CZ = 10_915_839

with open(os.path.join(HERE, 'raw', 'NST-EST2025-ALLDATA.csv'), encoding='latin-1') as f:
    rows = [r for r in csv.DictReader(f) if r['SUMLEV'] == '040' and r['NAME'] not in ('District of Columbia', 'Puerto Rico')]
pop = {r['NAME']: int(r['POPESTIMATE2025']) for r in rows}
assert len(pop) == 50, len(pop)
total = sum(pop.values())

mensi = sorted([s for s, p in pop.items() if p < CZ], key=lambda s: pop[s])
print(f'Států celkem: {len(pop)}, obyvatel celkem: {total:,}'.replace(',', ' '))
print(f'Menších než Česko ({CZ:,}): {len(mensi)}'.replace(',', ' '))
print(f'  jejich obyvatelé dohromady: {sum(pop[s] for s in mensi):,} = {100 * sum(pop[s] for s in mensi) / total:.1f} % USA'.replace(',', ' '))
vetsi = sorted([s for s in pop if pop[s] >= CZ], key=lambda s: -pop[s])
print('Větší než Česko:', ', '.join(f'{s} {pop[s] / 1e6:.1f} mil.' for s in vetsi))

# polovina USA: kolik nejmenších států dohromady má polovinu obyvatel, a kolik nejlidnatějších
asc = sorted(pop, key=lambda s: pop[s])
acc = 0
for i, s in enumerate(sorted(pop, key=lambda s: -pop[s]), 1):
    acc += pop[s]
    if acc >= total / 2:
        print(f'Polovina obyvatel USA žije v {i} nejlidnatějších státech (ty mají {2 * i} senátorů ze 100)')
        break
wy, ca = pop['Wyoming'], pop['California']
print(f'Wyoming {wy:,}, Kalifornie {ca:,}, poměr {ca / wy:.0f}×'.replace(',', ' '))

# Senát: kolik obyvatel zastupují senátoři každé strany (každý senátor = polovina obyvatel státu)
# senat_2025.csv = před volbami (53 R : 47 D vč. nezávislých), senat_2027.csv = po volbách podle AP (? = nerozhodnuto)
for soubor, popis in [('senat_2025.csv', 'před volbami'), ('senat_2027.csv', 'po volbách')]:
    rep, seats = {}, {}
    with open(os.path.join(HERE, soubor), encoding='utf-8') as f:
        for r in csv.DictReader(f):
            for k in ('s1', 's2'):
                rep[r[k]] = rep.get(r[k], 0) + pop[r['stat']] / 2
                seats[r[k]] = seats.get(r[k], 0) + 1
    for p in sorted(rep):
        print(f'Senát {popis} {p}: {seats[p]} křesel, zastupují {rep[p] / 1e6:.1f} mil. obyvatel = {100 * rep[p] / total:.1f} %')

# Graf pro článek: křesla vs. zastoupení obyvatel, před volbami a po nich -> ../senat-graf.html
BARVY = {'D': '#4a51ab', 'R': '#a03250', '?': '#bcbcb0'}  # brandRoyalBlue.6, brandDeepRed.6, šedá = nerozhodnuto
NAZEV = {'D': 'demokraté', 'R': 'republikáni', '?': 'nerozhodnuto'}
def pruh(hodnoty, jednotka):
    out = '<div class="g-bar">'
    for p in ('D', '?', 'R'):
        v = hodnoty.get(p, 0)
        if not v:
            continue
        txt = f'{v:.0f}' if jednotka == 'křesel' else f'{v:.1f}'.replace('.', ',') + ' %'
        out += f'<i style="width:{v}%;background:{BARVY[p]}" title="{NAZEV[p]}">{txt if v >= 4 else ""}</i>'
    return out + '</div>'
radky = ''
for soubor, popis in [('senat_2025.csv', 'Před volbami'), ('senat_2027.csv', 'Po volbách 2026')]:
    rep, seats = {}, {}
    with open(os.path.join(HERE, soubor), encoding='utf-8') as f:
        for r in csv.DictReader(f):
            for k in ('s1', 's2'):
                rep[r[k]] = rep.get(r[k], 0) + pop[r['stat']] / 2
                seats[r[k]] = seats.get(r[k], 0) + 1
    radky += (f'<div class="g-blok"><div class="g-nadpis">{popis}</div>'
              f'<div class="g-radek"><span class="g-lab">senátoři</span>{pruh(seats, "křesel")}</div>'
              f'<div class="g-radek"><span class="g-lab">obyvatelé, které zastupují</span>{pruh({p: 100 * v / total for p, v in rep.items()}, "%")}</div></div>')
html = '''<style>
.g-sen { font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #101432; margin: 4px 0; }
.g-sen .g-blok { margin: 0 0 16px; }
.g-sen .g-nadpis { font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; }
.g-sen .g-radek { display: grid; grid-template-columns: 150px 1fr; align-items: center; gap: 10px; margin-bottom: 6px; }
.g-sen .g-lab { font-size: 0.82rem; color: #5b5f73; line-height: 1.2; }
.g-sen .g-bar { display: flex; height: 26px; border-radius: 3px; overflow: hidden; }
.g-sen .g-bar i { display: flex; align-items: center; justify-content: center; color: #fff; font-style: normal; font-weight: 700; font-size: 0.85rem; white-space: nowrap; }
.g-sen .g-leg { display: flex; gap: 14px; font-size: 0.8rem; color: #5b5f73; flex-wrap: wrap; }
.g-sen .g-leg b { display: inline-block; width: 11px; height: 11px; border-radius: 2px; margin-right: 5px; vertical-align: -1px; }
@media (max-width: 560px) { .g-sen .g-radek { grid-template-columns: 1fr; gap: 3px; } }
</style>
<div class="g-sen">''' + radky + '''<div class="g-leg"><span><b style="background:#4a51ab"></b>demokraté (vč. nezávislých, kteří s nimi hlasují)</span><span><b style="background:#a03250"></b>republikáni</span><span><b style="background:#bcbcb0"></b>nerozhodnuto (Mississippi, Aljaška)</span></div></div>
'''
with open(os.path.join(HERE, '..', 'senat-graf.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print('graf: ../senat-graf.html')

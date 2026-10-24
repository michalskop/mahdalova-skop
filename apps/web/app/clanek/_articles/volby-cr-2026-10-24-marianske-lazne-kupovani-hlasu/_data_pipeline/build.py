# Mariánské Lázně, komunální volby 2026: jak těsný byl výsledek Našeho Česka.
#
# Všechna čísla článku se počítají odsud. Zdroj: ČSÚ, otevřená data KV 2026
#   https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm
#   - registry  KV2026reg20261011_csv.zip  (kvros.csv = listiny, kvrk.csv = kandidáti vč. pořadí náhradníků)
#   - data      KV2026_data_20261011_csv.zip (kvt3.csv = okrsky, kvhl.csv = hlasy kandidátům v okrscích)
#   - kontrola  https://volby.gov.cz/appdata/kv2026/20261009/odata/zastup/vysledky_obec_554642.xml
# Staženo 24. 10. 2026 do zdroj/ (rozbaleno csv_od/* do zdroj/reg a zdroj/data).
#
# Postup podle zákona 491/2001 Sb., § 45: listiny pod 5 % platných hlasů nedostanou mandát,
# zbytek se dělí d'Hondtovou metodou (dělitelé 1, 2, 3, …); při shodě podílů rozhoduje vyšší
# počet hlasů listiny, pak los.
# Uvnitř listiny jdou napřed kandidáti, kteří mají aspoň o 10 % víc hlasů, než je průměr
# na kandidáta listiny (§ 45 odst. 4; seřazení podle hlasů), pak ostatní podle pořadí.
# Kontrola: shoda se sloupcem PRESKOCENI v kvrk.csv.
#
# Spuštění: python build.py  → vystup.txt + marianske-lazne-vysledky.csv + ../grafy/odecet.html
import csv, sys, xml.etree.ElementTree as ET
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
H = Path(__file__).resolve().parent
Z = H / 'zdroj'
KOD = '554642'          # Mariánské Lázně
MANDATU = 21
NC = 'Naše Česko'
OUT = []
def p(*a): OUT.append(' '.join(str(x) for x in a)); print(*a)
def cz(n, d=0):
    s = f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')
    return s.replace(' ', ' ')

def rows(f):
    with open(f, encoding='utf-8-sig', newline='') as fh:
        return list(csv.DictReader(fh))

# ---------- listiny a kandidáti ----------
listiny = [r for r in rows(Z / 'reg' / 'kvros.csv') if r['KODZASTUP'] == KOD]
kand = [r for r in rows(Z / 'reg' / 'kvrk.csv') if r['KODZASTUP'] == KOD]
L = {r['POR_STR_HL']: dict(nazev=r['NAZEVCELK'], hlasy=int(r['HLASY_STR']), mand=int(r['MAND_STR'])) for r in listiny}
for k in L.values(): k['kand'] = []
for r in kand:
    L[r['POR_STR_HL']]['kand'].append(dict(c=int(r['PORCISLO']), jmeno=f"{r['JMENO']} {r['PRIJMENI']}",
        hlasy=int(r['POCHLASU']), mandat=r['MANDAT'] == 'A', nahr=int(r['PORADINAHR'] or 0),
        presk=r['PRESKOCENI'] == 'A',
        pstrana=r['PSTRANA'], nstrana=r['NSTRANA']))
celkem = sum(x['hlasy'] for x in L.values())
p('Listin:', len(L), '| kandidátů:', len(kand), '| platných hlasů:', cz(celkem))
p('Kandidátů na listinu:', sorted({len(x['kand']) for x in L.values()}))

# ---------- okrsky ----------
t3 = [r for r in rows(Z / 'data' / 'kvt3.csv') if r['KODZASTUP'] == KOD]
p('Okrsků:', len(t3), '| voličů v seznamu:', cz(sum(int(r['VOL_SEZNAM']) for r in t3)),
  '| vydané obálky:', cz(sum(int(r['VYD_OBALKY']) for r in t3)),
  '| platné lístky:', cz(sum(int(r['PLAT_LISTKY']) for r in t3)),
  '| platné hlasy:', cz(sum(int(r['PL_HL_CELK']) for r in t3)))
ids = {r['ID_OKRSKY'] for r in t3}
hl = [r for r in rows(Z / 'data' / 'kvhl.csv') if r['ID_OKRSKY'] in ids]
# kontrola: součet hlasů kandidátům z okrsků = hlasy listin z registru
for k, x in L.items():
    s = sum(int(r[f'HLASY_{i:02d}']) for r in hl if r['POR_STR_HL'] == k for i in range(1, 71))
    assert s == x['hlasy'], (x['nazev'], s, x['hlasy'])
p('Kontrola okrsky × registr: součty hlasů listin sedí.')

# kontrola proti XML ČSÚ
ns = {'k': 'http://www.volby.cz/kv/'}
xr = ET.parse(Z / 'vysledky_obec_554642.xml').getroot()
for vs in xr.iterfind('.//k:VOLEBNI_STRANA', ns):
    x = L[vs.get('POR_STR_HLAS_LIST')]
    assert int(vs.get('HLASY')) == x['hlasy'] and int(vs.get('ZASTUPITELE_POCET')) == x['mand']
p('Kontrola XML ČSÚ: hlasy i mandáty listin sedí.')

# ---------- přepočet ----------
def rozdel(hlasy, mandatu=MANDATU):
    """hlasy: {listina: hlasy}. Vrací ({listina: mandáty}, seznam přidělených podílů)."""
    tot = sum(hlasy.values())
    ok = {k: v for k, v in hlasy.items() if v * 100 >= 5 * tot}
    podily = sorted(((v / d, v, k) for k, v in ok.items() for d in range(1, mandatu + 1)), reverse=True)
    m = {k: 0 for k in hlasy}
    for q, v, k in podily[:mandatu]: m[k] += 1
    return m, podily, tot

def prah(k):
    """Přednostní hranice: o 10 % víc hlasů, než je průměr na kandidáta listiny (§ 45 odst. 4)."""
    x = L[k]; return 1.1 * x['hlasy'] / len(x['kand'])

def obsazeni(k, n):
    """Kdo z listiny k dostane n mandátů (přednostně kandidáti nad hranicí podle hlasů, pak pořadí)."""
    x = L[k]; hr = prah(k)
    pref = sorted([c for c in x['kand'] if c['hlasy'] >= hr], key=lambda c: (-c['hlasy'], c['c']))
    zbytek = [c for c in sorted(x['kand'], key=lambda c: c['c']) if c not in pref]
    return (pref + zbytek)[:n]

zakl = {k: x['hlasy'] for k, x in L.items()}
m0, pod0, _ = rozdel(zakl)
for k, x in L.items():
    assert m0[k] == x['mand'], x['nazev']
    zvol = {c['jmeno'] for c in x['kand'] if c['mandat']}
    assert {c['jmeno'] for c in obsazeni(k, x['mand'])} == zvol, x['nazev']
    if x['mand']:  # u listin bez mandátu ČSÚ přeskočení nevyznačuje
        assert all((c['hlasy'] >= prah(k)) == c['presk'] for c in x['kand']), x['nazev']
p("Kontrola: d'Hondt + přednostní hlasy reprodukují oficiální mandáty i jména všech 21 zastupitelů.")

kNC = next(k for k, x in L.items() if x['nazev'] == NC)
nc = L[kNC]
p(f"\n{NC}: {cz(nc['hlasy'])} hlasů, {cz(nc['hlasy'] / celkem * 100, 2)} %, {nc['mand']} mandáty")
p('Zvolení:', ', '.join(f"{c['jmeno']} (č. {c['c']}, {c['hlasy']} hl.)" for c in nc['kand'] if c['mandat']))
p('Lístků (přepočet na celé lístky):', cz(nc['hlasy'] / MANDATU, 1))

# poslední přidělený podíl a nejbližší další
q21 = pod0[MANDATU - 1]; q22 = pod0[MANDATU]
p(f"\n21. mandát: {L[q21[2]]['nazev']} podíl {cz(q21[0], 2)} | 22. v pořadí: {L[q22[2]]['nazev']} podíl {cz(q22[0], 2)}")

def bez(n):
    h = dict(zakl); h[kNC] -= n * MANDATU
    return rozdel(h)

res = []
for n in range(0, 121):
    m, pod, tot = bez(n)
    res.append(dict(n=n, hlasy=nc['hlasy'] - n * MANDATU, celkem=tot, proc=(nc['hlasy'] - n * MANDATU) / tot * 100, m=m))
prvni_1 = next(r for r in res if r['m'][kNC] < 2)
prvni_0 = next(r for r in res if r['m'][kNC] == 0)
p(f"\nOdečtení celých lístků (21 hlasů pro {NC}, voliči by jinak nepřišli):")
for r in res:
    if r['n'] in (0, prvni_1['n'] - 1, prvni_1['n'], prvni_0['n'] - 1, prvni_0['n']):
        p(f"  bez {r['n']:3d} lístků: {cz(r['hlasy'])} z {cz(r['celkem'])} = {cz(r['proc'], 2)} % → mandátů {r['m'][kNC]}")

def zmeny(m):
    out = []
    for k in L:
        d = m[k] - m0[k]
        if d > 0:
            noví = obsazeni(k, m[k])[m0[k]:]
            out.append(f"{L[k]['nazev']} +{d}: " + ', '.join(f"{c['jmeno']} (č. {c['c']}, náhradník {c['nahr']})" for c in noví))
    return out
p(f"\nBez {prvni_1['n']} lístků mandát navíc:", *zmeny(prvni_1['m']))
p(f"Bez {prvni_0['n']} lístků mandáty navíc:", *zmeny(prvni_0['m']))
# kontrola, že náhradníci v registru odpovídají
for k in L:
    for c in L[k]['kand']:
        if c['nahr'] == 1: p(f"  1. náhradník {L[k]['nazev']}: {c['jmeno']} (č. {c['c']})")

# varianta: voliči by jinak dali celý lístek listině, která je na řadě o 22. mandát (ANO)
k22 = q22[2]
def presun(n):
    h = dict(zakl); h[kNC] -= n * MANDATU; h[k22] += n * MANDATU
    return rozdel(h)[0]
v1 = next(n for n in range(1, 200) if presun(n)[kNC] < 2)
v0 = next(n for n in range(1, 400) if presun(n)[kNC] == 0)
p(f"\nVarianta – voliči by jinak volili celou listinu {L[k22]['nazev']}: druhý mandát padá od {v1} lístků, žádný mandát od {v0} lístků")

# hlasové rozpětí: kolik jednotlivých hlasů (ne celých lístků) stačí
n1 = next(n for n in range(1, 500) if (lambda h: rozdel(h)[0][kNC])({**zakl, kNC: zakl[kNC] - n}) < 2)
p(f"\nPo jednotlivých hlasech: o druhý mandát by přišlo po ztrátě {n1} hlasů (bez dopadu na ostatní listiny).")

# přednostní hlasy uvnitř listiny Našeho Česka
hr = prah(kNC)
p(f"\nPřednostní hranice (průměr {cz(nc['hlasy'] / len(nc['kand']), 2)} × 1,1): {cz(hr, 2)} hlasů")
for c in sorted(nc['kand'], key=lambda c: c['c']):
    p(f"  č. {c['c']:2d} {c['jmeno']:28s} {c['hlasy']:4d} hl. {'ZVOLEN' if c['mandat'] else ''}{' náhr. ' + str(c['nahr']) if c['nahr'] else ''}")

# okrsky: hlasy Našeho Česka
p('\nOkrsky – Naše Česko:')
for r in sorted(t3, key=lambda r: int(r['OKRSEK'])):
    h = sum(int(x[f'HLASY_{i:02d}']) for x in hl if x['ID_OKRSKY'] == r['ID_OKRSKY'] and x['POR_STR_HL'] == kNC for i in range(1, 71))
    p(f"  okrsek {r['OKRSEK']}: voličů {r['VOL_SEZNAM']:>4}, obálek {r['VYD_OBALKY']:>4}, platných hlasů {int(r['PL_HL_CELK']):6d}, NČ {h:4d} = {h / int(r['PL_HL_CELK']) * 100:5.2f} %")

# CSV pro čtenáře
r25 = res[25]
p(f"\n„Asi 25 lidí“ z nahrávky (celé lístky, jinak by nepřišli): {r25['m'][kNC]} mandát(y), {cz(r25['proc'], 2)} %")
p(f"Podíl 7 voličů z vydaných obálek: {cz(7 / sum(int(r['VYD_OBALKY']) for r in t3) * 1000, 2)} ‰")

with open(H / 'marianske-lazne-vysledky.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['listina', 'hlasy', 'procenta', 'mandaty'])
    for k, x in sorted(L.items(), key=lambda kv: -kv[1]['hlasy']):
        w.writerow([x['nazev'], x['hlasy'], f"{x['hlasy'] / celkem * 100:.2f}", x['mand']])

(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')

# ---------- interaktivní graf (grafy/odecet.html) ----------
import json
MAXN = 100
def kdo(m):
    out = []
    for k in L:
        if m[k] > m0[k]:
            for c in obsazeni(k, m[k])[m0[k]:]:
                out.append([c['jmeno'], L[k]['nazev']])
    return out
data = [dict(n=r['n'], h=r['hlasy'], c=r['celkem'], p=round(r['proc'], 2), m=r['m'][kNC], k=kdo(r['m'])) for r in res[:MAXN + 1]]
n1, n0 = prvni_1['n'], prvni_0['n']
html = (H / 'odecet_sablona.html').read_text(encoding='utf-8')
html = html.replace('/*DATA*/', json.dumps(dict(d=data, n1=n1, n0=n0, max=MAXN), ensure_ascii=False))
(H.parent / 'grafy').mkdir(exist_ok=True)
(H.parent / 'grafy' / 'odecet.html').write_text(html, encoding='utf-8')
print('grafy/odecet.html zapsán')

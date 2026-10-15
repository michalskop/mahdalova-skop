"""Data k článku volby-cr-2026-10-15-profese-zastupitelu.

Otázka: dostávají v obecních volbách některé profese (lékařky, učitelé, knihovnice,
řemeslníci…) od voličů víc osobních hlasů než ostatní kandidáti – a dostávají se díky
nim do zastupitelstva i z míst, která by jinak nestačila?

Zdroj: otevřená data ČSÚ (volby.gov.cz/opendata), registr kandidátů:
- KV2026reg20261011_csv.zip (stav po zpracování 11. 10. 2026)
- KV2022reg20260328_csv.zip, KV2018_reg_20230224_csv.zip (srovnání v čase)
Soubory kvrk.csv (kandidáti: povolání, pořadí, hlasy, mandát), kvros.csv (strany:
mandáty), kvrzcoco.csv (zastupitelstva: počet obyvatel).

Metody (srozumitelně vysvětlené i v článku):
1. Povolání je volný text (v roce 2026 přes 49 tisíc různých znění). Zařazujeme ho
   klíčovými slovy do skupin podle pořadí v PROFESE: platí první shoda. Starosta má
   přednost (je to nejznámější člověk v obci a slouží jako srovnání), pak konkrétní
   profese, až potom obecné „podnikatel“, „důchodce“ apod. Tituly MUDr./MDDr./MVDr.
   doplňují lékaře, zubaře a veterináře, pokud povolání nezní konkrétněji.
2. „Pod čarou“: kandidát stojí na kandidátce níž, než kolik mandátů jeho strana
   získala (např. strana má 3 mandáty, on je čtvrtý). Bez preferenčních hlasů by se
   do zastupitelstva nedostal. Počítáme, kolik takových kandidátů se přesto dostalo
   dovnitř („přeskočili“).
3. „Osobní bonus“: kolik hlasů dostal kandidát ve srovnání s tím, kolik obvykle
   dostane kandidát na stejném místě kandidátky stejné délky (hlasy kandidáta děleno
   průměrem jeho kandidátky, vztaženo k mediánu téhož poměru u kandidátů na stejném
   místě stejně dlouhé kandidátky ve stejně velkých obcích). Srovnání uvnitř kandidátky odfiltruje sílu strany
   i velikost obce. Za skupinu uvádíme geometrický průměr (typickou hodnotu).

Spuštění: python build.py  → stáhne data do .cache/, zapíše ../data/*.json,
vstupy/*.csv a vypíše čísla pro text.
"""
import csv
import io
import json
import math
import re
import statistics as st
import sys
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

HERE = Path(__file__).parent
CACHE = HERE / '.cache'
OUT = HERE.parent / 'data'
TAB = HERE / 'vstupy'
for d in (CACHE, OUT, TAB):
    d.mkdir(exist_ok=True)

BASE = 'https://volby.gov.cz/opendata/'
REG = {
    2026: 'kv2026/KV2026reg20261011_csv.zip',
    2022: 'kv2022/KV2022reg20260328_csv.zip',
    2018: 'kv2018/KV2018_reg_20230224_csv.zip',
}

# Paleta DataTimes (ThemeProvider.tsx)
CRIMSON = '#de1743'   # brand.6
INK = '#101432'       # ink blue
GREY = '#c8c8bc'      # background.8
TEAL = '#06677d'      # brandTeal.7
ORANGE = '#f76800'    # brandOrange.6
VIC = '#0e839e'       # brandTeal.6 – víc hlasů
MENE = '#a03250'      # brandDeepRed.6 (vínová) – méně hlasů
SOURCE = 'ČSÚ – registr kandidátů pro volby do zastupitelstev obcí 2026 (stav 11. 10. 2026); výpočet DataTimes.cz'

# (klíč, název pro čtenáře, regex na povolání, tituly) – platí první shoda
PROFESE = [
    ('starosta', 'starostové a místostarostové', r'starost|primátor', ()),
    ('zubar', 'zubaři a zubařky', r'zubn|stomatolog|dentist', ('MDDr.',)),
    ('veterinar', 'veterináři a veterinářky', r'veterinář|veterinární lékař|veterinární lekař|lékař - veterinář', ('MVDr.',)),
    ('lekar', 'lékaři a lékařky', r'(?<!asistentka )(?<!asistent )lékař(ka)?|lekař(ka)?|mudr|primář|chirurg|pediatr|gynekolog|internist|psychiatr|anesteziolog|kardiolog|neurolog|ortoped|radiolog(?!ick)|urolog|oftalmolog|onkolog', ('MUDr.',)),
    ('lekarnik', 'lékárníci a lékárnice', r'lékárn|farmaceut', ('PharmDr.',)),
    ('zdravotnik', 'zdravotní sestry a záchranáři', r'sestra|zdravot|záchranář|porodní|ošetřovat|fyzioterap|laborant|ergoterap|nutriční', ()),
    ('farar', 'faráři, kazatelé a církevní pracovníci', r'farář|kněz|duchovní|kazatel|jáhen|pastor|řeholn', ()),
    ('knihovnik', 'knihovnice a knihovníci', r'knihovn', ()),
    ('reditel_skoly', 'ředitelé škol a jejich zástupci', r'ředitel\w*\s.*(škol|zš|mš|gymn|zuš|školk)|ředitel\w* (zš|mš|zuš)', ()),
    ('ucitel', 'učitelky a učitelé', r'učitel|pedagog|vychovatel|pedagož', ()),
    ('hasic', 'hasiči', r'hasič', ()),
    ('policista', 'policisté, strážníci a vojáci', r'policist|strážník|strážnice|voják|vojačka|armád|celník|příslušník', ()),
    ('zemedelec', 'zemědělci a lesníci', r'zeměděl|farmář|agronom|zootechnik|traktorist|lesník|lesní|chovatel|vinař|mechanizátor|ovocnář|včelař|rolník|revírník|myslivec|rybář', ()),
    ('remeslnik', 'řemeslníci a opraváři', r'elektrikář|instalatér|truhlář|zedník|mechanik|tesař|klempíř|malíř|zámečník|kominík|opravář|údržbář|pokrývač|sklenář|topenář|svářeč|elektromontér|obkladač|podlahář|čalouník|kovář|řezník|pekař|cukrář|krejč|švadlen|hodinář|servisní technik|montér|stolař|lakýrník|autoklemp|kameník|řemesl|plynař|revizní technik', ()),
    ('sluzby', 'prodavačky, kuchařky, kadeřnice a pošťačky', r'prodavač|pokladní|vedoucí prodejny|prodejn|číšník|číšnice|servírk|hostinsk|kuchař|barman|kadeřn|kosmetič|pošt|doručovatel|recepční|obsluha čerpací|provozní restaurace|restauratér|vedoucí jídelny|kuchyn', ()),
    ('socialni', 'sociální pracovníci a pečovatelky', r'sociální|pečovatel|sociálních služ', ()),
    ('pravnik', 'právníci a advokáti', r'právn|advokát|notář|soudc|exekutor|státní zástup', ()),
    ('it', 'ajťáci a programátoři', r'(^|\W)it(\W|$)|programátor|informatik|vývojář|software|správce sítě|ict|počítač', ()),
    ('inzenyr', 'inženýři, technici a architekti', r'technik|inženýr|projektant|konstruktér|technolog|stavbyvedoucí|architekt|geodet|energetik|statik|stavební', ()),
    ('ekonom', 'ekonomové a účetní', r'účetní|ekonom|finanční|daňov|bank|pojišť|auditor|fakturant|mzdov', ()),
    ('manazer', 'manažeři a ředitelé firem', r'manažer|manager|ředitel|jednatel|vedoucí|mistr|předseda|management', ()),
    ('podnikatel', 'podnikatelé a OSVČ', r'podnikatel|osvč|živnost|samostatně výdělečně|obchodník|obchodnice|majitel', ()),
    ('urednik', 'úředníci a administrativa', r'úředn|referent|státní zaměstnan|administrativ|zaměstnan\w* (obce|úřadu|města|obecního|městského)|tajemn|asistent|sekretář|personalist|obchodní zástup', ()),
    ('delnik', 'dělníci, řidiči a skladníci', r'dělník|dělnice|operátor|řidič|skladník|skladnice|strojník|obsluha|výpravčí|strojvedoucí|seřizovač|obráběč|nástrojař|uklízeč|pomocn|svářeč|zaměstnanec|kontrolor|brigád|logistik|dispečer', ()),
    ('student', 'studenti a studentky', r'student', ()),
    ('rodic', 'rodiče na mateřské a v domácnosti', r'mateřsk|rodičovsk|domácnost', ()),
    ('duchodce', 'důchodci a důchodkyně', r'důchod|senior|penzist', ()),
]
LABEL = {k: n for k, n, _, _ in PROFESE}
LABEL['ostatni'] = 'ostatní a nezařazení'
RX = [(k, re.compile(rx), set(tit)) for k, _, rx, tit in PROFESE]
TITLE_FIRST = {'zubar', 'veterinar', 'lekar'}


def classify(povolani, titul):
    p = povolani.lower()
    tituly = set(titul.split())
    for k, rx, tit in RX:
        if rx.search(p):
            return k
    for k, rx, tit in RX:
        if k in TITLE_FIRST and tituly & tit:
            return k
    return 'ostatni'


def fetch(year):
    path = CACHE / Path(REG[year]).name
    if not path.exists():
        urllib.request.urlretrieve(BASE + REG[year], path)
    return zipfile.ZipFile(path)


def table(year, name):
    z = fetch(year)
    names = [n for n in z.namelist() if n.lower().endswith('/' + name) or n.lower() == name]
    pick = [n for n in names if n.startswith('csv_od/')] or names
    raw = z.read(pick[0])
    for enc in ('utf-8', 'cp1250'):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    return list(csv.DictReader(io.StringIO(text)))


# Pět velikostních skupin s přibližně stejným počtem obyvatel (17–23 % obyvatel Česka
# v každé), hranice zaokrouhlené na kulatá čísla.
def velikost(pocobyv):
    n = int(pocobyv or 0)
    if n < 1000:
        return 'do 1 000'
    if n < 4000:
        return '1 000–4 000'
    if n < 20000:
        return '4 000–20 000'
    if n < 100000:
        return '20 000–100 000'
    return 'nad 100 000'


VELIKOSTI = ['do 1 000', '1 000–4 000', '4 000–20 000', '20 000–100 000', 'nad 100 000']


def load(year):
    zast = {r['KODZASTUP']: r for r in table(year, 'kvrzcoco.csv')}   # řádky se opakují po částech obce, počet obyvatel je stejný
    kand = [r for r in table(year, 'kvrk.csv') if r.get('PLATNOST', 'A') in ('A', '0')]
    for r in kand:
        r['prof'] = classify(r['POVOLANI'], r.get('TITULPRED', ''))
        r['zvolen'] = r['MANDAT'] in ('A', '1')
        r['por'] = int(r['PORCISLO'])
        r['hlasy'] = int(r['POCHLASU'] or 0)
        z = zast.get(r['KODZASTUP'], {})
        r['vel'] = velikost(z.get('POCOBYV', 0))
        r['obec'] = z.get('NAZEVZAST', '')
        r['obec_kod'] = z.get('OBEC', '')
        r['mandaty_zast'] = int(z.get('MANDATY', 0) or 0)
    # kandidátky
    listy = defaultdict(list)
    for r in kand:
        listy[(r['KODZASTUP'], r['COBVODU'], r['OSTRANA'])].append(r)
    for key, lst in listy.items():
        seats = sum(r['zvolen'] for r in lst)
        mean = sum(r['hlasy'] for r in lst) / len(lst)
        L = len(lst)
        for r in lst:
            r['seats'] = seats
            r['L'] = L
            r['pod_carou'] = seats >= 1 and r['por'] > seats
            r['preskocil'] = r['pod_carou'] and r['zvolen']
            r['ratio'] = (r['hlasy'] + 1) / (mean + 1)
    # očekávaný poměr podle místa na kandidátce stejné délky ve stejně velké obci
    # (když je takových kandidátů méně než 20, bez ohledu na velikost obce)
    def pos(r):
        if r['L'] <= 30:
            return (r['L'], r['por'])
        lb = 40 if r['L'] <= 40 else (50 if r['L'] <= 50 else 99)
        return (lb, min(9, int(10 * (r['por'] - 1) / r['L'])))
    cells, cells0 = defaultdict(list), defaultdict(list)
    for r in kand:
        if r['L'] >= 2:
            cells[(r['vel'],) + pos(r)].append(r['ratio'])
            cells0[pos(r)].append(r['ratio'])
    def expected(r):
        v = cells[(r['vel'],) + pos(r)]
        return st.median(v if len(v) >= 20 else cells0[pos(r)])
    med = {}
    for r in kand:
        if r['L'] >= 2:
            k = (r['vel'],) + pos(r)
            if k not in med:
                med[k] = expected(r)
            r['bonus'] = math.log(r['ratio'] / med[k])
        else:
            r['bonus'] = None
    # bonus vztažený k průměrnému kandidátovi (všichni = 0 %)
    b = [r['bonus'] for r in kand if r['bonus'] is not None]
    m = sum(b) / len(b)
    for r in kand:
        if r['bonus'] is not None:
            r['bonus'] -= m
    # očekávaná šance přeskočit podle velikosti obce a toho, jak hluboko pod čarou kandidát stojí
    def jcell(r):
        d = r['por'] - r['seats']
        return (r['vel'], d if d <= 2 else (3 if d <= 4 else (5 if d <= 8 else 9)))
    tot, hit = Counter(), Counter()
    for r in kand:
        if r['pod_carou']:
            tot[jcell(r)] += 1
            hit[jcell(r)] += r['preskocil']
    for r in kand:
        r['p_ocek'] = hit[jcell(r)] / tot[jcell(r)] if r['pod_carou'] else None
    return kand


def summary(rows):
    n = len(rows)
    zv = sum(r['zvolen'] for r in rows)
    pod = [r for r in rows if r['pod_carou']]
    pres = sum(r['preskocil'] for r in pod)
    ocek = sum(r['p_ocek'] for r in pod)
    b = [r['bonus'] for r in rows if r['bonus'] is not None]
    return {
        'kandidatu': n,
        'zvoleno': zv,
        'podil_zvolenych': 100 * zv / n if n else 0,
        'pod_carou': len(pod),
        'preskocilo': pres,
        'sance_preskocit': 100 * pres / len(pod) if pod else 0,
        'ocekavano': ocek,
        'nasobek': pres / ocek if ocek else 0,
        'zvolenych_z_pod_cary': 100 * pres / zv if zv else 0,
        'bonus': 100 * (math.exp(sum(b) / len(b)) - 1) if b else 0,
    }


def fmt(n, d=0):
    return f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')


def dump(name, spec):
    (OUT / name).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding='utf-8')


def write_csv(name, rows):
    with open(TAB / name, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)


# ═══ 2026 ════════════════════════════════════════════════════════════════
k26 = load(2026)
ALL = summary(k26)
print('VŠICHNI 2026', {k: round(v, 1) for k, v in ALL.items()})

by = defaultdict(list)
for r in k26:
    by[r['prof']].append(r)
prof_rows = []
for k in list(LABEL):
    s = summary(by[k])
    prof_rows.append({'klic': k, 'profese': LABEL[k], **{a: round(b, 2) for a, b in s.items()}})
prof_rows.sort(key=lambda x: -x['bonus'])
print('\nPROFESE 2026 (seřazeno podle osobního bonusu)')
for p in prof_rows:
    print(f"{p['profese'][:44]:44} kand {p['kandidatu']:6} zvol {p['zvoleno']:5} ({p['podil_zvolenych']:4.1f} %)"
          f"  pod čarou {p['pod_carou']:5} přeskočilo {p['preskocilo']:4} ({p['sance_preskocit']:4.1f} %)"
          f"  bonus {p['bonus']:+5.1f} %  násobek {p['nasobek']:.2f}")
write_csv('profese_2026.csv', prof_rows)

# ── kontroly alternativních vysvětlení ──
# a) dosavadní zastupitelé: stejné jméno, příjmení a zastupitelstvo, zvolen 2022
k22 = load(2022)
inc = {(r['JMENO'], r['PRIJMENI'], r['KODZASTUP']) for r in k22 if r['zvolen']}
for r in k26:
    r['obhajuje'] = (r['JMENO'], r['PRIJMENI'], r['KODZASTUP']) in inc
print('\nDOSAVADNÍ ZASTUPITELÉ: podíl mezi kandidáty', round(100 * sum(r['obhajuje'] for r in k26) / len(k26), 1), '%',
      ' bonus obhajujících', round(summary([r for r in k26 if r['obhajuje']])['bonus'], 1),
      ' nových', round(summary([r for r in k26 if not r['obhajuje']])['bonus'], 1))
kontrola = []
for k in ['lekar', 'veterinar', 'reditel_skoly', 'hasic', 'lekarnik', 'zubar', 'knihovnik', 'ucitel', 'remeslnik', 'sluzby', 'duchodce']:
    nov = [r for r in by[k] if not r['obhajuje']]
    sn, sa = summary(nov), summary(by[k])
    podil_obh = 100 * sum(r['obhajuje'] for r in by[k]) / len(by[k])
    kontrola.append({'klic': k, 'profese': LABEL[k], 'bonus_vsichni': round(sa['bonus'], 1),
                     'bonus_novacci': round(sn['bonus'], 1), 'podil_obhajujicich': round(podil_obh, 1),
                     'nasobek_vsichni': round(sa['nasobek'], 2), 'nasobek_novacci': round(sn['nasobek'], 2)})
    print(f"  {LABEL[k][:36]:36} bonus {sa['bonus']:+5.1f} → bez obhajujících {sn['bonus']:+5.1f}"
          f"   násobek {sa['nasobek']:.2f} → {sn['nasobek']:.2f}   obhajuje {podil_obh:4.1f} %")
write_csv('kontrola_obhajujici.csv', kontrola)

# b) titul na hlasovacím lístku
for lab, f in [('s titulem', lambda r: r.get('TITULPRED', '').strip() or r.get('TITULZA', '').strip()),
               ('bez titulu', lambda r: not (r.get('TITULPRED', '').strip() or r.get('TITULZA', '').strip()))]:
    print(f"TITUL {lab}: bonus {summary([r for r in k26 if f(r)])['bonus']:+.1f} %")
for t in ['MUDr.', 'Ing.', 'Mgr.', 'JUDr.', 'Bc.']:
    s = summary([r for r in k26 if t in r.get('TITULPRED', '').split()])
    print(f"  {t:6} kandidátů {s['kandidatu']:6} bonus {s['bonus']:+.1f} %")

# c) pozice na kandidátce: stojí některé profese výš? (námitka: z 1. místa se přeskakovat nedá)
print('POZICE (medián pořadí; podíl kandidátů na 1.–3. místě; podíl pod čarou)')
for k in ['lekar', 'veterinar', 'reditel_skoly', 'knihovnik', 'ucitel', 'sluzby', 'duchodce', 'student']:
    rr = by[k]
    print(f"  {LABEL[k][:36]:36} medián {st.median(r['por'] for r in rr):4.0f}. místo   na 1.–3. místě {100 * sum(r['por'] <= 3 for r in rr) / len(rr):4.1f} %"
          f"   pod čarou {100 * sum(r['pod_carou'] for r in rr) / len(rr):4.1f} %")
print(f"  {'všichni':36} medián {st.median(r['por'] for r in k26):4.0f}. místo   na 1.–3. místě {100 * sum(r['por'] <= 3 for r in k26) / len(k26):4.1f} %"
      f"   pod čarou {100 * sum(r['pod_carou'] for r in k26) / len(k26):4.1f} %")

# d) knihovny: ředitelky a vedoucí vs. ostatní
for lab, f in [('ředitelky a vedoucí knihoven', lambda r: re.search(r'ředitel|vedoucí', r['POVOLANI'].lower())),
               ('ostatní knihovnice a knihovníci', lambda r: not re.search(r'ředitel|vedoucí', r['POVOLANI'].lower()))]:
    s = summary([r for r in by['knihovnik'] if f(r)])
    print(f"KNIHOVNY {lab}: kand {s['kandidatu']} zvol {s['zvoleno']} bonus {s['bonus']:+.1f} % násobek {s['nasobek']:.2f}")

# ověření zařazení: nejčastější znění v každé skupině
with open(TAB / 'kontrola_zarazeni.txt', 'w', encoding='utf-8') as f:
    for k in LABEL:
        c = Counter(r['POVOLANI'].lower().strip() for r in by[k])
        f.write(f'\n== {LABEL[k]} ({len(by[k])})\n')
        for s, n in c.most_common(40):
            f.write(f'{n:6} {s}\n')

# podle velikosti obce
print('\nBONUS PODLE VELIKOSTI OBCE')
vel_rows = []
for k in ['lekar', 'zubar', 'veterinar', 'farar', 'reditel_skoly', 'ucitel', 'knihovnik', 'hasic', 'remeslnik', 'sluzby', 'zemedelec', 'podnikatel', 'duchodce', 'student', 'starosta']:
    line = []
    for v in VELIKOSTI:
        s = summary([r for r in by[k] if r['vel'] == v])
        vel_rows.append({'klic': k, 'profese': LABEL[k], 'velikost': v, 'kandidatu': s['kandidatu'],
                         'bonus': round(s['bonus'], 1), 'sance_preskocit': round(s['sance_preskocit'], 1)})
        line.append(f"{s['bonus']:+5.0f} ({s['kandidatu']:4})")
    print(f'{LABEL[k][:30]:30}', '  '.join(line))
write_csv('profese_velikost_2026.csv', vel_rows)
print('celkem podle velikosti:', [(v, round(summary([r for r in k26 if r['vel'] == v])['sance_preskocit'], 1)) for v in VELIKOSTI])

# knihovny – detail
kn = by['knihovnik']
kz = [r for r in kn if r['zvolen']]
print(f'\nKNIHOVNY 2026: kandidátů {len(kn)}, zvoleno {len(kz)}, přeskočilo {sum(r["preskocil"] for r in kn)}')
print('  z toho ředitelky/vedoucí:', sum(1 for r in kz if re.search(r'ředitel|vedoucí', r['POVOLANI'].lower())))
skoky = sorted([r for r in kn if r['preskocil']], key=lambda r: -(r['por'] - r['seats']))
for r in skoky[:12]:
    print(f"   {r['obec']:28} {r['POVOLANI'][:40]:40} z {r['por']:2}. místa, strana {r['seats']} mand., pořadí mandátu {r['PORADIMAND']}, {r['VEK']} let")

# největší skoky obecně a podle profesí (pro příklady v textu)
print('\nNEJVĚTŠÍ SKOKY (o kolik míst pod čarou) – lékaři')
for r in sorted([r for r in by['lekar'] if r['preskocil']], key=lambda r: -(r['por'] - r['seats']))[:8]:
    print(f"   {r['obec']:28} {r['POVOLANI'][:40]:40} z {r['por']:2}. místa, strana {r['seats']} mand.")

# ═══ Srovnání v čase ═════════════════════════════════════════════════════
trend = []
for year in (2018, 2022, 2026):
    kk = {2026: k26, 2022: k22}.get(year) or load(year)
    g = defaultdict(list)
    for r in kk:
        g[r['prof']].append(r)
    for k in ['knihovnik', 'lekar', 'zubar', 'ucitel', 'farar', 'veterinar', 'hasic', 'remeslnik', 'sluzby']:
        s = summary(g[k])
        trend.append({'rok': year, 'klic': k, 'profese': LABEL[k], 'kandidatu': s['kandidatu'], 'zvoleno': s['zvoleno'],
                      'bonus': round(s['bonus'], 1), 'sance_preskocit': round(s['sance_preskocit'], 1)})
    s = summary(kk)
    trend.append({'rok': year, 'klic': 'vsichni', 'profese': 'všichni kandidáti', 'kandidatu': s['kandidatu'], 'zvoleno': s['zvoleno'],
                  'bonus': 0.0, 'sance_preskocit': round(s['sance_preskocit'], 1)})
print('\nTREND')
for t in trend:
    print(t)
write_csv('trend.csv', trend)


# ═══ Grafy ═══════════════════════════════════════════════════════════════
def pct(v):
    return ('+' if v > 0 else '−' if v < 0 else '') + fmt(abs(v), 0) + ' %'


# 1) osobní bonus podle profese
JE_VEDENI = lambda r: re.search(r'ředitel|vedoucí', r['POVOLANI'].lower())
KNIHOVNY = [('ředitelky a vedoucí knihoven', [r for r in by['knihovnik'] if JE_VEDENI(r)]),
            ('ostatní knihovnice a knihovníci', [r for r in by['knihovnik'] if not JE_VEDENI(r)])]
g1 = [{'profese': p['profese'], 'bonus': round(p['bonus'], 1), 'popisek': pct(p['bonus']),
       'kandidatu': p['kandidatu'], 'zvoleno': p['zvoleno']}
      for p in prof_rows if p['klic'] not in ('ostatni', 'knihovnik')]
for nazev, rr in KNIHOVNY:
    sk = summary(rr)
    g1.append({'profese': nazev, 'bonus': round(sk['bonus'], 1), 'popisek': pct(sk['bonus']),
               'kandidatu': sk['kandidatu'], 'zvoleno': sk['zvoleno']})
dump('bonus-profese.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Lékaři, veterináři a ředitelé škol dostávají víc hlasů než ostatní kandidáti na stejném místě kandidátky',
        'subtitle': 'O kolik procent víc, nebo méně hlasů dostal typický kandidát z dané profese než kandidáti, kteří stáli na stejném místě stejně dlouhé kandidátky ve stejně velkých obcích. Obecní volby 2026.',
    },
    'width': 600,
    'height': {'step': 22},
    'data': {'values': g1},
    'encoding': {
        'y': {'field': 'profese', 'type': 'nominal', 'sort': {'field': 'bonus', 'order': 'descending'},
              'axis': {'title': None, 'labelLimit': 320, 'ticks': False, 'domain': False, 'labelFontSize': 12}},
    },
    'layer': [
        {'mark': {'type': 'bar', 'height': 15, 'cornerRadius': 1},
         'encoding': {
             'x': {'field': 'bonus', 'type': 'quantitative', 'scale': {'domain': [-14, 16]},
                   'axis': {'title': 'osobní hlasy navíc proti průměru (%)', 'grid': True, 'gridColor': '#e8e2d6', 'format': '+d'}},
             'color': {'condition': {'test': 'datum.bonus > 0', 'value': VIC}, 'value': MENE},
             'tooltip': [{'field': 'profese', 'title': 'Profese'}, {'field': 'popisek', 'title': 'Osobní hlasy navíc'},
                         {'field': 'kandidatu', 'title': 'Kandidátů', 'format': ','}, {'field': 'zvoleno', 'title': 'Zvoleno', 'format': ','}],
         }},
        {'mark': {'type': 'text', 'fontSize': 11, 'dx': 4, 'align': 'left', 'color': '#333333'},
         'transform': [{'filter': 'datum.bonus >= 0'}],
         'encoding': {'x': {'field': 'bonus', 'type': 'quantitative'}, 'text': {'field': 'popisek'}}},
        {'mark': {'type': 'text', 'fontSize': 11, 'dx': -4, 'align': 'right', 'color': '#333333'},
         'transform': [{'filter': 'datum.bonus < 0'}],
         'encoding': {'x': {'field': 'bonus', 'type': 'quantitative'}, 'text': {'field': 'popisek'}}},
        {'mark': {'type': 'rule', 'color': INK, 'strokeWidth': 1}, 'encoding': {'x': {'datum': 0}}},
    ],
    'config': {'view': {'stroke': None}},
    '_source': SOURCE,
})

# 2) kolikrát častěji se dostali do zastupitelstva z nevolitelného místa (proti kandidátům ve stejně
#    velkých obcích, kteří stáli stejně hluboko pod hranicí mandátů své strany)
vyber = ['starosta', 'lekar', 'veterinar', 'farar', 'reditel_skoly', 'lekarnik', 'zubar', 'hasic',
         'ucitel', 'remeslnik', 'sluzby', 'duchodce', 'student', 'rodic']
g2 = []
for nazev, rr in [(LABEL[k], by[k]) for k in vyber] + KNIHOVNY:
    s2 = summary(rr)
    g2.append({'profese': nazev, 'nasobek': round(s2['nasobek'], 2), 'popisek': fmt(s2['nasobek'], 1) + '×',
               'pod_carou': s2['pod_carou'], 'preskocilo': s2['preskocilo']})
dump('preskoceni-profese.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Lékaři se do zastupitelstva dostávají z nevolitelného místa třikrát častěji než ostatní',
        'subtitle': 'Nevolitelné místo: kandidát stál na kandidátce níž, než kolik mandátů jeho strana získala, a zvolen byl jen díky preferenčním hlasům. Kolikrát častěji se to podařilo než kandidátům ve stejně velkých obcích, kteří stáli stejně hluboko (1× = průměr).',
    },
    'width': 600,
    'height': {'step': 24},
    'data': {'values': g2},
    'encoding': {'y': {'field': 'profese', 'type': 'nominal', 'sort': {'field': 'nasobek', 'order': 'descending'},
                       'axis': {'title': None, 'labelLimit': 320, 'ticks': False, 'domain': False, 'labelFontSize': 12}}},
    'layer': [
        # svislá čára 1× přes celou výšku (bez kategorie y, jinak by se kreslila vodorovně od nuly)
        {'mark': {'type': 'rule', 'color': INK, 'strokeWidth': 1, 'opacity': 0.5},
         'encoding': {'x': {'datum': 1}, 'y': {'value': 0}, 'y2': {'value': {'expr': 'height'}}}},
        {'mark': {'type': 'rule', 'color': GREY, 'strokeWidth': 2},
         'encoding': {'x': {'field': 'nasobek', 'type': 'quantitative'}, 'x2': {'datum': 1}}},
        {'mark': {'type': 'circle', 'size': 150, 'opacity': 1},
         'encoding': {
             'x': {'field': 'nasobek', 'type': 'quantitative', 'scale': {'type': 'log', 'domain': [0.2, 4.5]},
                   'axis': {'title': 'kolikrát častěji než průměr (logaritmická osa)', 'values': [0.25, 0.5, 1, 2, 3, 4],
                            'labelExpr': "replace(format(datum.value, '.2~f'), '.', ',') + '×'", 'gridColor': '#e8e2d6'}},
             'color': {'condition': {'test': 'datum.nasobek >= 1', 'value': VIC}, 'value': MENE},
             'tooltip': [{'field': 'profese', 'title': 'Profese'}, {'field': 'popisek', 'title': 'Kolikrát častěji'},
                         {'field': 'pod_carou', 'title': 'Kandidátů na nevolitelném místě', 'format': ','},
                         {'field': 'preskocilo', 'title': 'Z nich zvoleno', 'format': ','}],
         }},
        {'mark': {'type': 'text', 'fontSize': 11, 'dx': 10, 'align': 'left', 'color': '#333333'},
         'transform': [{'filter': 'datum.nasobek >= 1'}],
         'encoding': {'x': {'field': 'nasobek', 'type': 'quantitative'}, 'text': {'field': 'popisek'}}},
        {'mark': {'type': 'text', 'fontSize': 11, 'dx': -10, 'align': 'right', 'color': '#333333'},
         'transform': [{'filter': 'datum.nasobek < 1'}],
         'encoding': {'x': {'field': 'nasobek', 'type': 'quantitative'}, 'text': {'field': 'popisek'}}},
    ],
    'config': {'view': {'stroke': None}},
    '_source': SOURCE,
})

# 3) podle velikosti obce – tabulka s barevnými políčky (každá skupina obcí zvlášť, žádná spojnice)
G3 = ['lekar', 'veterinar', 'reditel_skoly', 'hasic', 'knihovnik', 'ucitel', 'zemedelec', 'podnikatel',
      'remeslnik', 'sluzby', 'duchodce', 'student']
g3 = []
for k in G3:
    for v in VELIKOSTI:
        s = summary([r for r in by[k] if r['vel'] == v])
        ok = s['kandidatu'] >= 30
        g3.append({'profese': LABEL[k], 'velikost': v, 'bonus': round(s['bonus'], 1) if ok else None,
                   'popisek': pct(s['bonus']) if ok else 'málo', 'kandidatu': s['kandidatu']})
# prahy barev: vínová = méně hlasů, petrolejová = víc; kolem nuly světlé pozadí
PRAHY = [-10, -5, -2, 2, 5, 10]
BARVY3 = ['#812840', '#bb3a5d', '#f5c4c9', '#efe9dc', '#b8eff6', '#1a9fbd', '#06677d']  # brandDeepRed 7/5/1, neutrál, brandTeal 1/5/7
dump('bonus-velikost.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Profese rozhoduje hlavně v menších obcích, ve velkých městech se rozdíly stírají',
        'subtitle': 'O kolik procent víc (tyrkysově), nebo méně (vínově) hlasů dostal typický kandidát z dané profese než kandidáti na stejném místě kandidátky ve stejně velkých obcích. Každý sloupec je jedna skupina obcí podle počtu obyvatel; v každé žije zhruba pětina obyvatel Česka.',
    },
    'width': 600,
    'height': {'step': 30},
    'data': {'values': g3},
    'encoding': {
        'x': {'field': 'velikost', 'type': 'ordinal', 'sort': VELIKOSTI,
              'axis': {'title': 'počet obyvatel obce', 'orient': 'top', 'labelAngle': 0, 'ticks': False, 'domain': False, 'labelFontSize': 12}},
        'y': {'field': 'profese', 'type': 'nominal', 'sort': [LABEL[k] for k in G3],
              'axis': {'title': None, 'labelLimit': 300, 'ticks': False, 'domain': False, 'labelFontSize': 12}},
    },
    'layer': [
        {'mark': {'type': 'rect', 'stroke': '#f8f6f0', 'strokeWidth': 3},
         'encoding': {
             'color': {'condition': {'test': 'datum.bonus === null', 'value': '#f8f6f0'},
                       'field': 'bonus', 'type': 'quantitative',
                       'scale': {'type': 'threshold', 'domain': PRAHY, 'range': BARVY3}, 'legend': None},
             'tooltip': [{'field': 'profese', 'title': 'Profese'}, {'field': 'velikost', 'title': 'Obce'},
                         {'field': 'popisek', 'title': 'Hlasy navíc'}, {'field': 'kandidatu', 'title': 'Kandidátů', 'format': ','}],
         }},
        {'mark': {'type': 'text', 'fontSize': 12, 'fontWeight': 600},
         'encoding': {
             'text': {'field': 'popisek'},
             'color': {'condition': {'test': 'datum.bonus !== null && (datum.bonus >= 5 || datum.bonus <= -5)', 'value': '#ffffff'},
                       'value': INK},
         }},
    ],
    'config': {'view': {'stroke': None}},
    '_source': SOURCE + '; „málo“ = méně než 30 kandidátů',
})

# 4) dohledávač: jednotlivá znění povolání, mužský a ženský tvar sloučené (aspoň 15 kandidátů)
zneni = defaultdict(list)
for r in k26:
    zneni[re.sub(r'\s+', ' ', r['POVOLANI'].lower().strip())].append(r)

# Ženský tvar převádíme slovo po slově na mužský; sloučíme jen tehdy, když mužské znění v datech opravdu je.
VARIANTY = [('kyně', ['ec', 'ce']), ('ička', ['ik']), ('ice', ['ík', 'ec']), ('ka', ['', 'a']),
            ('ová', ['ový']), ('ská', ['ský']), ('cká', ['cký']), ('á', ['ý'])]


def muzske(slovo):
    out = [slovo]
    for suf, nahrady in VARIANTY:
        if slovo.endswith(suf) and len(slovo) > len(suf) + 2:
            out += [slovo[: -len(suf)] + n for n in nahrady]
    return out


def kandidati_muz(z):
    from itertools import product
    slova = z.split(' ')
    if len(slova) > 4:
        return []
    return [' '.join(c) for c in product(*[muzske(w) for w in slova]) if ' '.join(c) != z]


sloucit = {}
for z in zneni:
    for m in kandidati_muz(z):
        if m in zneni:
            sloucit[z] = m
            break
skup = defaultdict(list)
popis = {}
for z, rr in zneni.items():
    m = sloucit.get(z, z)
    skup[m].extend(rr)
    if z != m:
        popis[m] = f'{m} / {z}'
lookup = []
for m, rr in skup.items():
    if len(rr) < 15 or not m:
        continue
    s = summary(rr)
    lookup.append({'p': popis.get(m, m), 'k': s['kandidatu'], 'z': s['zvoleno'], 'b': round(s['bonus'], 1)})
print('sloučených dvojic muž/žena:', len(sloucit), 'ukázka:', list(sloucit.items())[:25])
lookup.sort(key=lambda x: -x['k'])
print('\nDOHLEDÁVAČ: znění povolání s ≥ 15 kandidáty:', len(lookup))
(TAB / 'povolani.json').write_text(json.dumps(lookup, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
for z in ['knihovník / knihovnice', 'lékař / lékařka', 'učitel / učitelka', 'novinář / novinářka', 'starosta / starostka', 'důchodce / důchodkyně', 'kadeřník / kadeřnice']:
    print('  ', next((x for x in lookup if x['p'] == z), z))

# 5) HTML dohledávač (iframe srcdoc jako ostatní embedy webu)
import html as _html
DOC = """<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#f8f6f0;color:#101432;font-family:'IBM Plex Sans',Arial,sans-serif;font-size:14px}
.wrap{padding:16px}
h3{margin:0 0 4px;font-size:17px}
p.sub{margin:0 0 12px;color:#4a4d63;font-size:13px;line-height:1.4}
input{width:100%;box-sizing:border-box;padding:9px 12px;font:inherit;border:1px solid #c8c8bc;border-radius:4px;background:#fff;color:#101432}
.list{margin-top:10px;height:330px;overflow-y:auto;border-top:1px solid #e8e2d6}
.row{display:grid;grid-template-columns:minmax(0,1fr) 64px 58px 150px;gap:8px;align-items:center;padding:6px 2px;border-bottom:1px solid #e8e2d6}
.head{font-weight:600;font-size:12px;color:#4a4d63;border-bottom:1px solid #c8c8bc}
.num{text-align:right;font-variant-numeric:tabular-nums}
.bar{position:relative;height:14px}
.bar .zero{position:absolute;left:50%;top:-3px;bottom:-3px;border-left:1px solid #101432}
.bar .b{position:absolute;top:0;height:14px}
.bar .t{position:absolute;top:-1px;font-size:12px;font-variant-numeric:tabular-nums}
.src{margin-top:8px;font-size:11px;color:#4a4d63}
@media (max-width:480px){.row{grid-template-columns:minmax(0,1fr) 46px 120px}.row .k{display:none}}
</style></head><body><div class="wrap">
<h3>Najděte svou profesi</h3>
<p class="sub">Profese tak, jak je kandidáti uvedli na hlasovacím lístku (znění, které použilo aspoň 15 kandidátů). Mužský a ženský tvar jsou zvlášť: vyhledávání „učitel“ najde oba. Poslední sloupec: o kolik procent víc (tyrkysově), nebo méně (vínově) hlasů dostal typický kandidát s tímto povoláním než kandidát na stejném místě stejně dlouhé kandidátky.</p>
<input id="q" type="search" placeholder="Napište profesi, např. knihovnice, lékař, novinářka…" aria-label="Hledat profesi">
<div class="row head"><div>profese</div><div class="num k">kandidátů</div><div class="num">zvoleno</div><div>hlasy navíc</div></div>
<div class="list" id="list"></div>
<div class="src">Zdroj: ČSÚ, registr kandidátů pro volby do zastupitelstev obcí 2026; výpočet DataTimes.cz</div>
</div><script>
const D=__DATA__;
const L=document.getElementById('list'),Q=document.getElementById('q');
const f=n=>n.toLocaleString('cs-CZ');
function bar(b){const w=Math.min(Math.abs(b),25)/25*50;const c=b>0?'#0e839e':'#a03250';
const pos=b>0?'left:50%;width:'+w+'%':'left:'+(50-w)+'%;width:'+w+'%';
const t=(b>0?'+':b<0?'\u2212':'')+Math.abs(Math.round(b))+'\u00a0%';
const tp=b>0?'left:calc(50% + '+w+'% + 4px)':'right:calc(50% + '+w+'% + 4px)';
return '<div class="bar"><div class="zero"></div><div class="b" style="background:'+c+';'+pos+'"></div><div class="t" style="'+tp+'">'+t+'</div></div>'}
function draw(){const q=Q.value.trim().toLowerCase();const r=D.filter(d=>!q||d.p.includes(q)).slice(0,200);
L.innerHTML=r.length?r.map(d=>'<div class="row"><div>'+d.p.replace(/[<&]/g,'')+'</div><div class="num k">'+f(d.k)+'</div><div class="num">'+f(d.z)+'</div>'+bar(d.b)+'</div>').join(''):'<p class="sub" style="padding:10px 2px">Takto profesi uvedlo méně než 15 kandidátů.</p>'}
Q.addEventListener('input',draw);draw();
</script></body></html>"""
doc = DOC.replace('__DATA__', json.dumps(lookup, ensure_ascii=False, separators=(',', ':')))
frame = ('<iframe title="Najděte svou profesi" loading="lazy" sandbox="allow-scripts" srcdoc="' + _html.escape(doc, quote=True) +
         '" style="display:block;width:100%;height:540px;border:1px solid #ddd;border-radius:6px;margin:1.5rem 0;"></iframe>\n')
(HERE.parent / 'dohledavac-povolani.html').write_text(frame, encoding='utf-8')
print('dohledávač zapsán, kB:', round(len(frame) / 1024))

# 6) podklad pro cover: obce, kde se zpod čáry do zastupitelstva dostal lékař, veterinář,
#    ředitel školy nebo knihovnice
skoky = [{'obec_kod': r['obec_kod'], 'obec': r['obec'], 'klic': r['prof'], 'por': r['por'], 'mandaty_strany': r['seats']}
         for r in k26 if r['preskocil'] and r['prof'] in ('lekar', 'veterinar', 'reditel_skoly', 'knihovnik')]
write_csv('skoky_cover.csv', skoky)
print('skoky pro cover:', Counter(x['klic'] for x in skoky))

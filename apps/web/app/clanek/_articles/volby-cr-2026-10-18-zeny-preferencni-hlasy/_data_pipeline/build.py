"""Ženy a muži na kandidátkách obecních voleb 2018–2026: dávají jim voliči rozdílně
preferenčních hlasů?

Navazuje na pipeline článku volby-cr-2026-10-15-profese-zastupitelu (build.py):
stejná data ČSÚ (registr kandidátů kvrk.csv, kvros.csv, kvrzcoco.csv), stejné metriky
a stejné velikostní skupiny obcí. Funkce load() a summary() jsou převzaté beze změny.

Metriky:
- „hlasy navíc“ (bonus): kolik hlasů dostal kandidát proti mediánu kandidátů na stejném
  místě stejně dlouhé kandidátky ve stejně velkých obcích (hlasy kandidáta / průměr jeho
  kandidátky); za skupinu geometrický průměr, všichni kandidáti = 0 %.
- „nevolitelné místo“: kandidát stál níž, než kolik mandátů strana získala; násobek =
  kolikrát častěji se odtud dostal do zastupitelstva než kandidáti ve stejně velkých
  obcích, kteří stáli stejně hluboko (1× = průměr).

Pohlaví: ČSÚ ho v registru neuvádí. Odvozujeme ho takto (viz odvod_pohlavi):
1. příjmení zakončené na -ová / -á (přechýlené) → žena; na -ý / -ský apod. → muž;
2. křestní jméno: z dat samotných spočítáme, jak často nositelé jména mají přechýlené
   příjmení; jméno s ≥ 97 % jednoho pohlaví (a ≥ 20 výskyty) určuje pohlaví;
3. kontrola: ženský tvar povolání (učitelka, prodavačka, důchodkyně…).
Kde se příjmení a jméno rozcházejí nebo nic nerozhodne, je pohlaví „nejisté“ a z
analýzy ho vyřazujeme (počet uvádíme).

Spuštění: python build.py > vstupy/vystup.txt  → stáhne data do .cache/ (poprvé ~2 min,
pak z nactena_data.pkl), vypíše čísla pro text. Shrnutí zjištění: vstupy/ZJISTENI.md.
"""
import csv
import io
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
CACHE = HERE / '.cache'      # zipy ČSÚ; stejné soubory jako v pipeline článku o profesích
CACHE.mkdir(exist_ok=True)
TAB = HERE / 'vstupy'
TAB.mkdir(exist_ok=True)
BASE = 'https://volby.gov.cz/opendata/'
REG = {2026: 'kv2026/KV2026reg20261011_csv.zip', 2022: 'kv2022/KV2022reg20260328_csv.zip', 2018: 'kv2018/KV2018_reg_20230224_csv.zip'}


def fetch(year):
    path = CACHE / Path(REG[year]).name
    if not path.exists():
        urllib.request.urlretrieve(BASE + REG[year], path)
    return zipfile.ZipFile(path)


# ── převzato z build.py (profese zastupitelů) ─────────────────────────────
PROFESE = [
    ('starosta', 'starostové a místostarostové', r'starost|primátor', ()),
    ('zubar', 'zubaři a zubařky', r'zubn|stomatolog|dentist', ('MDDr.',)),
    ('veterinar', 'veterináři a veterinářky', r'veterinář|veterinární lékař|veterinární lekař|lékař - veterinář', ('MVDr.',)),
    ('lekar', 'lékaři a lékařky', r'(?<!asistentka )(?<!asistent )lékař(ka)?|lekař(ka)?|mudr|primář|chirurg|pediatr|gynekolog|internist|psychiatr|anesteziolog|kardiolog|neurolog|ortoped|radiolog(?!ick)|urolog|oftalmolog|onkolog', ('MUDr.',)),
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
    ('it', 'IT specialisté a programátoři', r'(^|\W)it(\W|$)|programátor|informatik|vývojář|software|správce sítě|ict|počítač', ()),
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


def table(year, name):
    z = fetch(year)
    names = [n for n in z.namelist() if n.lower().endswith('/' + name)]
    pick = [n for n in names if n.startswith('csv_od/')] or names
    raw = z.read(pick[0])
    for enc in ('utf-8', 'cp1250'):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    return list(csv.DictReader(io.StringIO(text)))


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
    zast = {r['KODZASTUP']: r for r in table(year, 'kvrzcoco.csv')}
    ros = {(r['KODZASTUP'], r['COBVODU'], r['OSTRANA']): r for r in table(year, 'kvros.csv')}
    kand = [r for r in table(year, 'kvrk.csv') if r.get('PLATNOST', 'A') in ('A', '0')]
    for r in kand:
        r['prof'] = classify(r['POVOLANI'], r.get('TITULPRED', ''))
        r['zvolen'] = r['MANDAT'] in ('A', '1')
        r['por'] = int(r['PORCISLO'])
        r['hlasy'] = int(r['POCHLASU'] or 0)
        z = zast.get(r['KODZASTUP'], {})
        r['vel'] = velikost(z.get('POCOBYV', 0))
        r['obec'] = z.get('NAZEVZAST', '')
        r['typ'] = ros.get((r['KODZASTUP'], r['COBVODU'], r['OSTRANA']), {}).get('ZKRATKAO8', '')
        r['vek'] = int(r['VEK'] or 0)
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
            r['list'] = key
            r['pod_carou'] = seats >= 1 and r['por'] > seats
            r['preskocil'] = r['pod_carou'] and r['zvolen']
            r['ratio'] = (r['hlasy'] + 1) / (mean + 1)

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
    b = [r['bonus'] for r in kand if r['bonus'] is not None]
    m = sum(b) / len(b)
    for r in kand:
        if r['bonus'] is not None:
            r['bonus'] -= m

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
        'bonus': 100 * (math.exp(sum(b) / len(b)) - 1) if b else 0,
    }


# ── pohlaví ───────────────────────────────────────────────────────────────
def prijmeni_pohlavi(p):
    p = p.strip().lower().split()[-1] if p.strip() else ''   # u dvojitých příjmení rozhoduje poslední
    p = p.split('-')[-1]
    if re.search(r'(ová|ská|cká|ná|lá|rá|tá|dá|vá|ká|žá|šá|čá|řá|há|chá|bá|pá|má|zá)$', p):
        return 'Z'
    if re.search(r'(ý|ský|cký)$', p):
        return 'M'
    if re.search(r'[bcčdďfghjklmnňprřsštťvzž]$', p):
        return 'M?'          # souhláska: typicky muž, ale i nepřechýlená žena (Nguyen, Smith)
    return None


def odvod_pohlavi(rows_all):
    """Vrátí slovník jméno → 'Z'/'M' naučený z příjmení všech kandidátů všech let."""
    c = defaultdict(Counter)
    for r in rows_all:
        g = prijmeni_pohlavi(r['PRIJMENI'])
        if g in ('Z', 'M'):
            c[r['JMENO'].strip().split()[0].lower() if r['JMENO'].strip() else ''][g] += 1
    jmena = {}
    for j, cc in c.items():
        n = cc['Z'] + cc['M']
        if n >= 20:
            if cc['Z'] / n >= 0.97:
                jmena[j] = 'Z'
            elif cc['M'] / n >= 0.97:
                jmena[j] = 'M'
    return jmena, c


ZENSKE_POVOLANI = re.compile(r'(ka|kyně|ice|ová|ná|ní pracovnice|ice|čka|ačka|ařka|árka|érka|istka|antka|entka|ánka|ařka)\b')


def pohlavi(r, jmena):
    j = r['JMENO'].strip().split()[0].lower() if r['JMENO'].strip() else ''
    gp = prijmeni_pohlavi(r['PRIJMENI'])
    gj = jmena.get(j)
    if gp in ('Z', 'M'):
        if gj and gj != gp:
            return '?'
        return gp
    if gj:
        return gj
    return '?'


# ═══ načtení ═══════════════════════════════════════════════════════════════
import pickle
PKL = CACHE / 'nactena_data.pkl'   # zrychlení opakovaných běhů; smazat při změně load()
if PKL.exists():
    DATA = pickle.loads(PKL.read_bytes())
else:
    DATA = {y: load(y) for y in (2026, 2022, 2018)}
    PKL.write_bytes(pickle.dumps(DATA))
jmena, jc = odvod_pohlavi([r for y in DATA for r in DATA[y]])
for y, kk in DATA.items():
    for r in kk:
        r['g'] = pohlavi(r, jmena)
k26 = DATA[2026]

print('Jmen s určeným pohlavím:', len(jmena))
for y, kk in DATA.items():
    c = Counter(r['g'] for r in kk)
    print(f'{y}: kandidátů {len(kk)}  ženy {c["Z"]} ({100*c["Z"]/len(kk):.1f} %)  muži {c["M"]}  nejisté {c["?"]} ({100*c["?"]/len(kk):.2f} %)')
nej = Counter((r['JMENO'], r['PRIJMENI']) for r in k26 if r['g'] == '?')
print('ukázka nejistých:', nej.most_common(25))

# kontrola: povolání v jednoznačně ženském/mužském tvaru proti odvozenému pohlaví
F_POV = re.compile(r'\b(učitelka|prodavačka|důchodkyně|ředitelka|starostka|místostarostka|lékařka|zdravotní sestra|kadeřnice|knihovnice|studentka|podnikatelka|úřednice|referentka|manažerka|asistentka|ekonomka|kuchařka|dělnice|uklízečka|vychovatelka|pečovatelka|právnička|advokátka|veterinářka|lékárnice|technička|inženýrka|operátorka|na mateřské)\b')
M_POV = re.compile(r'\b(učitel|prodavač|důchodce|ředitel|starosta|místostarosta|lékař|kadeřník|knihovník|student|podnikatel|úředník|referent|manažer|asistent|ekonom|kuchař|dělník|vychovatel|pečovatel|právník|advokát|veterinář|lékárník|technik|inženýr|operátor|elektrikář|zedník|truhlář|řidič|hasič|policista|zemědělec|mechanik|instalatér)\b')
tab = Counter()
for r in k26:
    p = r['POVOLANI'].lower()
    pf = 'Z' if F_POV.search(p) and not M_POV.search(p) else ('M' if M_POV.search(p) and not F_POV.search(p) else None)
    if pf:
        tab[(pf, r['g'])] += 1
print('\nKONTROLA tvar povolání × odvozené pohlaví 2026:', dict(tab))
nesoulad = [(r['JMENO'], r['PRIJMENI'], r['POVOLANI']) for r in k26
            if F_POV.search(r['POVOLANI'].lower()) and not M_POV.search(r['POVOLANI'].lower()) and r['g'] == 'M']
print('ukázka nesouladu (ženský tvar, odvozen muž):', nesoulad[:15])
nesoulad2 = [(r['JMENO'], r['PRIJMENI'], r['POVOLANI']) for r in k26
             if M_POV.search(r['POVOLANI'].lower()) and not F_POV.search(r['POVOLANI'].lower()) and r['g'] == 'Z']
print('počet mužský tvar & odvozena žena:', len(nesoulad2), nesoulad2[:15])


# ═══ ANALÝZA ═══════════════════════════════════════════════════════════════
def radek(lab, rows):
    s = summary(rows)
    return (f"{lab[:44]:44} kand {s['kandidatu']:7}  zvol {s['podil_zvolenych']:5.1f} %  bonus {s['bonus']:+6.1f} %"
            f"  pod čarou {s['pod_carou']:6} přeskočilo {s['preskocilo']:5} ({s['sance_preskocit']:4.1f} %) násobek {s['nasobek']:.2f}")


Z = lambda rr: [r for r in rr if r['g'] == 'Z']
M = lambda rr: [r for r in rr if r['g'] == 'M']

# dosavadní zastupitelé (stejné jméno, příjmení, zastupitelstvo; zvolen v minulých volbách)
for y, prev in ((2026, 2022), (2022, 2018)):
    inc = {(r['JMENO'], r['PRIJMENI'], r['KODZASTUP']) for r in DATA[prev] if r['zvolen']}
    for r in DATA[y]:
        r['obh'] = (r['JMENO'], r['PRIJMENI'], r['KODZASTUP']) in inc

print('\n(1) CELKEM ŽENY × MUŽI')
for y in (2018, 2022, 2026):
    kk = DATA[y]
    print(y)
    print('  ' + radek('ženy', Z(kk)))
    print('  ' + radek('muži', M(kk)))
    print('  ' + radek('nejisté', [r for r in kk if r['g'] == '?']))

print('\n(4a) PODLE VELIKOSTI OBCE 2026')
for v in VELIKOSTI:
    rr = [r for r in k26 if r['vel'] == v]
    print(v)
    print('  ' + radek('ženy', Z(rr)))
    print('  ' + radek('muži', M(rr)))
print('\n(4b) PODLE VELIKOSTI A ROKU – bonus ženy / muži, násobek ženy / muži')
for v in VELIKOSTI:
    out = []
    for y in (2018, 2022, 2026):
        rr = [r for r in DATA[y] if r['vel'] == v]
        sz, sm = summary(Z(rr)), summary(M(rr))
        out.append(f"{y}: {sz['bonus']:+5.1f}/{sm['bonus']:+5.1f}  {sz['nasobek']:.2f}/{sm['nasobek']:.2f}")
    print(f'{v:16}', ' | '.join(out))

print('\n(5) DOSAVADNÍ ZASTUPITELÉ')
for y in (2022, 2026):
    kk = DATA[y]
    for lab, f in (('obhajující', lambda r: r['obh']), ('noví', lambda r: not r['obh'])):
        rr = [r for r in kk if f(r)]
        print(y, lab)
        print('  ' + radek('ženy', Z(rr)))
        print('  ' + radek('muži', M(rr)))
    print(f"  podíl obhajujících: ženy {100*sum(r['obh'] for r in Z(kk))/len(Z(kk)):.1f} %, muži {100*sum(r['obh'] for r in M(kk))/len(M(kk)):.1f} %")

print('\n(2) PROFESE × POHLAVÍ 2026 (bonus ženy / muži, rozdíl; násobek)')
prof_g = []
for k in LABEL:
    rr = [r for r in k26 if r['prof'] == k]
    sz, sm = summary(Z(rr)), summary(M(rr))
    if sz['kandidatu'] >= 50 and sm['kandidatu'] >= 50:
        prof_g.append((k, sz, sm))
        print(f"{LABEL[k][:40]:40} ž {sz['kandidatu']:6} {sz['bonus']:+6.1f} %  m {sm['kandidatu']:6} {sm['bonus']:+6.1f} %"
              f"  rozdíl {sz['bonus']-sm['bonus']:+5.1f} b.  násobek ž {sz['nasobek']:.2f} m {sm['nasobek']:.2f}")

print('\n(2b) KONKRÉTNÍ ZNĚNÍ (pohlaví odvozené ze jména, ne z tvaru slova)')
SPEC = [
    ('učitel/ka (ZŠ/MŠ/SŠ, bez ředitelů)', lambda p: re.search(r'učitel', p) and not re.search(r'ředitel', p)),
    ('starosta/ka (bez místo-)', lambda p: re.search(r'(?<!místo)(?<!místo-)starost', p) and 'místostarost' not in p),
    ('místostarosta/ka', lambda p: 'místostarost' in p),
    ('lékař/ka (vč. zubařů, bez veterinářů)', lambda p: re.search(r'(?<!asistentka )(?<!asistent )lékař|mudr|stomatolog|zubní lékař', p) and 'veterin' not in p),
    ('ředitel/ka školy', lambda p: re.search(r'ředitel\w*\s.*(škol|zš|mš|gymn|zuš|školk)|ředitel\w* (zš|mš|zuš)', p)),
    ('zdravotní sestra / ošetřovatel', lambda p: re.search(r'sestra|ošetřovat|zdravotní bratr', p)),
    ('prodavač/ka', lambda p: 'prodavač' in p),
    ('důchodce/kyně', lambda p: 'důchod' in p),
    ('student/ka', lambda p: 'student' in p),
    ('účetní', lambda p: 'účetní' in p),
    ('podnikatel/ka, OSVČ', lambda p: re.search(r'podnikatel|osvč', p)),
    ('dělník/ice', lambda p: 'dělní' in p),
]
for y in (2026, 2022, 2018):
    print(y)
    for lab, f in SPEC:
        rr = [r for r in DATA[y] if f(r['POVOLANI'].lower())]
        sz, sm = summary(Z(rr)), summary(M(rr))
        print(f"  {lab[:38]:38} ž {sz['kandidatu']:6} bonus {sz['bonus']:+6.1f}  zvol {sz['podil_zvolenych']:5.1f}  násobek {sz['nasobek']:.2f}"
              f" | m {sm['kandidatu']:6} bonus {sm['bonus']:+6.1f}  zvol {sm['podil_zvolenych']:5.1f}  násobek {sm['nasobek']:.2f}")

print('\n(2c) TVAR SLOVA × POHLAVÍ (učitel vs učitelka; starosta vs starostka) 2026')
for lab, rx in (('„učitel“ (mužský tvar)', r'\bučitel\b(?!k)'), ('„učitelka“', r'učitelk'),
                ('„starosta“', r'(?<!místo)starosta\b'), ('„starostka“', r'(?<!místo)starostk'),
                ('„lékař“', r'\blékař\b'), ('„lékařka“', r'lékařk')):
    rr = [r for r in k26 if re.search(rx, r['POVOLANI'].lower())]
    print(f"  {lab:24} " + radek('ženy', Z(rr))[:110])
    print(f"  {'':24} " + radek('muži', M(rr))[:110])


print('\n(3) RODIČE NA MATEŘSKÉ / RODIČOVSKÉ')
MAT = re.compile(r'mateřsk|rodičovsk|v domácnosti|na md\b|na rd\b|^md$|^rd$')
MAT_X = re.compile(r'škol|ředitel|učitel|údržbář')   # „učitelka mateřské školy“ není rodič na mateřské
for y in (2018, 2022, 2026):
    kk = DATA[y]
    mat = [r for r in kk if (MAT.search(r['POVOLANI'].lower()) and not MAT_X.search(r['POVOLANI'].lower()))]
    print(y, Counter(r['g'] for r in mat))
    print('  ' + radek('ženy na mateřské/rodičovské/v domácnosti', Z(mat)))
    print('  ' + radek('muži na rodičovské/v domácnosti', M(mat)))
    ost = [r for r in Z(kk) if 25 <= r['vek'] <= 44 and not (MAT.search(r['POVOLANI'].lower()) and not MAT_X.search(r['POVOLANI'].lower()))]
    print('  ' + radek('ostatní ženy 25–44 let', ost))
    ostm = [r for r in M(kk) if 25 <= r['vek'] <= 44]
    print('  ' + radek('muži 25–44 let', ostm))
    print('  věk na mateřské medián', st.median(r['vek'] for r in Z(mat)) if Z(mat) else '-')
mat26 = [r for r in k26 if (MAT.search(r['POVOLANI'].lower()) and not MAT_X.search(r['POVOLANI'].lower()))]
print('  znění 2026:', Counter(r['POVOLANI'].lower() for r in mat26).most_common(15))
print('  muži 2026:', [(r['JMENO'], r['POVOLANI'], r['obec'], r['zvolen']) for r in M(mat26)][:30])
# mateřská: rozdělení podle velikosti obce
for v in VELIKOSTI:
    rr = [r for r in Z(mat26) if r['vel'] == v]
    s = summary(rr)
    print(f"  {v:16} kand {s['kandidatu']:4} bonus {s['bonus']:+6.1f}")

print('\nALTERNATIVY')
print('(a) VĚK – bonus ženy / muži podle věku, 2026')
for a, b in ((18, 29), (30, 39), (40, 49), (50, 59), (60, 69), (70, 120)):
    rr = [r for r in k26 if a <= r['vek'] <= b]
    sz, sm = summary(Z(rr)), summary(M(rr))
    print(f"  {a}–{b}: ž {sz['kandidatu']:6} {sz['bonus']:+6.1f} %  m {sm['kandidatu']:6} {sm['bonus']:+6.1f} %  rozdíl {sz['bonus']-sm['bonus']:+5.1f}"
          f"  násobek ž {sz['nasobek']:.2f} m {sm['nasobek']:.2f}")
print('  medián věku ž', st.median(r['vek'] for r in Z(k26)), 'm', st.median(r['vek'] for r in M(k26)))

print('(b) POŘADÍ NA KANDIDÁTCE 2026')
for lab, f in (('ženy', Z), ('muži', M)):
    rr = f(k26)
    print(f"  {lab}: na 1. místě {100*sum(r['por']==1 for r in rr)/len(rr):4.1f} %, na 1.–3. {100*sum(r['por']<=3 for r in rr)/len(rr):4.1f} %,"
          f" relativní pozice (medián) {st.median((r['por']-1)/max(r['L']-1,1) for r in rr):.2f}, pod čarou {100*sum(r['pod_carou'] for r in rr)/len(rr):4.1f} %")
for lab, f in (('lídři (1. místo)', lambda r: r['por'] == 1), ('2.–5. místo', lambda r: 2 <= r['por'] <= 5), ('6. a níž', lambda r: r['por'] >= 6)):
    rr = [r for r in k26 if f(r)]
    sz, sm = summary(Z(rr)), summary(M(rr))
    print(f"  {lab:18} ž {sz['bonus']:+6.1f}  m {sm['bonus']:+6.1f}  rozdíl {sz['bonus']-sm['bonus']:+5.1f}")
print('  podíl žen mezi lídry kandidátek: ', round(100 * len(Z([r for r in k26 if r['por'] == 1])) / len([r for r in k26 if r['por'] == 1 and r['g'] in 'ZM']), 1), '%')
print('  podíl žen mezi kandidáty:', round(100 * len(Z(k26)) / (len(Z(k26)) + len(M(k26))), 1), '%, mezi zvolenými:',
      round(100 * len(Z([r for r in k26 if r['zvolen']])) / len([r for r in k26 if r['zvolen'] and r['g'] in 'ZM']), 1), '%')
for y in (2018, 2022):
    kk = DATA[y]
    print(f'  {y}: ženy mezi kandidáty', round(100 * len(Z(kk)) / (len(Z(kk)) + len(M(kk))), 1), '%, mezi zvolenými',
          round(100 * len(Z([r for r in kk if r['zvolen']])) / len([r for r in kk if r['zvolen'] and r['g'] in 'ZM']), 1), '%')

print('(c) TYP KANDIDÁTKY 2026 (zkratka ZKRATKAO8)')
typy = Counter(r['typ'] for r in k26)
hl = [t for t, n in typy.most_common(14)]
for t in hl:
    rr = [r for r in k26 if r['typ'] == t]
    sz, sm = summary(Z(rr)), summary(M(rr))
    print(f"  {t[:20]:20} ž {sz['kandidatu']:6} {sz['bonus']:+6.1f}  m {sm['kandidatu']:6} {sm['bonus']:+6.1f}  rozdíl {sz['bonus']-sm['bonus']:+5.1f}  podíl žen {100*sz['kandidatu']/(sz['kandidatu']+sm['kandidatu']):.0f} %")

print('(d) UVNITŘ TÉŽE KANDIDÁTKY: průměr (bonus žen − bonus mužů) přes kandidátky, kde jsou obě pohlaví')
for y in (2018, 2022, 2026):
    lst = defaultdict(lambda: ([], []))
    for r in DATA[y]:
        if r['bonus'] is None or r['g'] not in 'ZM':
            continue
        lst[r['list']][0 if r['g'] == 'Z' else 1].append(r['bonus'])
    d, w = [], []
    for z, m in lst.values():
        if z and m:
            d.append(sum(z) / len(z) - sum(m) / len(m))
            w.append(2 / (1 / len(z) + 1 / len(m)))
    md = sum(a * b for a, b in zip(d, w)) / sum(w)
    print(f'  {y}: kandidátek {len(d)}, vážený rozdíl {100*(math.exp(md)-1):+.1f} %  (ženy mají vyšší bonus na {100*sum(x>0 for x in d)/len(d):.0f} % kandidátek)')


print('\n(e) REGRESE: log-bonus ~ žena + profese + věk + obhajuje, uvnitř kandidátky (fixní efekt kandidátky)')
import numpy as np
AGES = [(18, 29), (30, 39), (40, 49), (50, 59), (60, 69), (70, 200)]
def agecat(v):
    return next(i for i, (a, b) in enumerate(AGES) if a <= v <= b) if v >= 18 else 0
PROFS = [k for k in LABEL if k != 'ostatni']
def regrese(rows, s_profesi=True, s_vekem=True, s_obh=True, fe=True):
    rr = [r for r in rows if r['bonus'] is not None and r['g'] in 'ZM']
    cols = ['zena']
    if s_profesi: cols += ['p_' + k for k in PROFS]
    if s_vekem: cols += ['a_%d' % i for i in range(1, len(AGES))]
    if s_obh: cols += ['obh']
    X = np.zeros((len(rr), len(cols)))
    y = np.array([r['bonus'] for r in rr])
    ci = {c: i for i, c in enumerate(cols)}
    for i, r in enumerate(rr):
        X[i, 0] = r['g'] == 'Z'
        if s_profesi and r['prof'] != 'ostatni': X[i, ci['p_' + r['prof']]] = 1
        if s_vekem:
            a = agecat(r['vek'])
            if a: X[i, ci['a_%d' % a]] = 1
        if s_obh and r.get('obh'): X[i, ci['obh']] = 1
    if fe:
        g = np.array([hash(r['list']) for r in rr])
        _, inv = np.unique(g, return_inverse=True)
        cnt = np.bincount(inv)
        def dm(v):
            return v - (np.bincount(inv, weights=v) / cnt)[inv]
        y = dm(y)
        X = np.column_stack([dm(X[:, j]) for j in range(X.shape[1])])
    else:
        X = np.column_stack([np.ones(len(rr)), X]); cols = ['const'] + cols
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    res = y - X @ beta
    # robustní (HC1) chyba pro koeficient žena
    XtXi = np.linalg.pinv(X.T @ X)
    j = cols.index('zena')
    meat = (X * res[:, None]).T @ (X * res[:, None])
    V = XtXi @ meat @ XtXi * len(y) / (len(y) - X.shape[1])
    b, se = beta[j], math.sqrt(V[j, j])
    return 100 * (math.exp(b) - 1), 100 * (math.exp(b - 1.96 * se) - 1), 100 * (math.exp(b + 1.96 * se) - 1), len(rr)
for y_ in (2018, 2022, 2026):
    kk = DATA[y_]
    if y_ == 2018:
        for r in kk: r['obh'] = False
    print(y_)
    for lab, kw in (('hrubý rozdíl (bez kontrol, bez FE)', dict(s_profesi=False, s_vekem=False, s_obh=False, fe=False)),
                    ('uvnitř kandidátky', dict(s_profesi=False, s_vekem=False, s_obh=False)),
                    ('+ profese', dict(s_vekem=False, s_obh=False)),
                    ('+ profese + věk', dict(s_obh=False)),
                    ('+ profese + věk + obhajuje mandát', dict(s_obh=y_ != 2018))):
        e, lo, hi, n = regrese(kk, **kw)
        print(f'   {lab:40} ženy {e:+5.1f} %  (95% interval {lo:+.1f} až {hi:+.1f})  n={n}')
print('  2026 jen noví kandidáti:', [round(x, 1) for x in regrese([r for r in k26 if not r['obh']], s_obh=False)[:3]])
print('  2026 jen obhajující:', [round(x, 1) for x in regrese([r for r in k26 if r['obh']], s_obh=False)[:3]])
for v in VELIKOSTI:
    print(f'  2026 {v:16}', [round(x, 1) for x in regrese([r for r in k26 if r['vel'] == v])[:3]])

print('\n(f) UČITELÉ A LÉKAŘI PODROBNĚJI 2026 (stejné znění povolání)')
for lab, rx in (('učitel/ka základní školy', r'^učitel(ka)? (na |v )?(základní|zš)'), ('učitel/ka střední školy', r'^učitel(ka)? (na |v )?(střední|sš|gymn)'),
                ('učitel/ka MŠ', r'^učitel(ka)? (v |na )?mateřsk'), ('učitel/ka (bez dalšího)', r'^učitel(ka)?$'),
                ('praktický lékař/ka', r'praktick\w+ lékař'), ('lékař/ka (bez dalšího)', r'^lékař(ka)?$'),
                ('ředitel/ka ZŠ', r'^ředitel(ka)? (základní|zš)'), ('ředitel/ka MŠ', r'^ředitel(ka)? (mateřsk|mš)')):
    rr = [r for r in k26 if re.search(rx, r['POVOLANI'].lower().strip())]
    sz, sm = summary(Z(rr)), summary(M(rr))
    print(f"  {lab:28} ž {sz['kandidatu']:5} {sz['bonus']:+6.1f} obh {100*sum(r['obh'] for r in Z(rr))/max(1,len(Z(rr))):4.1f} %"
          f" | m {sm['kandidatu']:5} {sm['bonus']:+6.1f} obh {100*sum(r['obh'] for r in M(rr))/max(1,len(M(rr))):4.1f} %")
for lab, k in (('učitelé', 'ucitel'), ('ředitelé škol', 'reditel_skoly'), ('lékaři', 'lekar')):
    rr = [r for r in k26 if r['prof'] == k]
    print(f'  regrese uvnitř kandidátky – {lab}:', [round(x, 1) for x in regrese(rr, s_profesi=False)[:3]], 'n', len(rr))
    rn = [r for r in rr if not r['obh']]
    sz, sm = summary(Z(rn)), summary(M(rn))
    print(f"     jen noví: ž {sz['kandidatu']} {sz['bonus']:+.1f}  m {sm['kandidatu']} {sm['bonus']:+.1f}")


print('\n(g) KDYBY ROZHODOVALO JEN POŘADÍ: podíl žen mezi zvolenými (skutečnost) × mezi prvními N místy (N = mandáty strany)')
for y in (2018, 2022, 2026):
    kk = [r for r in DATA[y] if r['g'] in 'ZM']
    real = [r for r in kk if r['zvolen']]
    poradi = [r for r in kk if r['seats'] >= 1 and r['por'] <= r['seats']]
    zr = sum(r['g'] == 'Z' for r in real); zp = sum(r['g'] == 'Z' for r in poradi)
    vypadly = sum(1 for r in kk if r['g'] == 'Z' and r['seats'] >= 1 and r['por'] <= r['seats'] and not r['zvolen'])
    preskocily = sum(1 for r in kk if r['g'] == 'Z' and r['preskocil'])
    vypadli_m = sum(1 for r in kk if r['g'] == 'M' and r['seats'] >= 1 and r['por'] <= r['seats'] and not r['zvolen'])
    preskocili_m = sum(1 for r in kk if r['g'] == 'M' and r['preskocil'])
    print(f'  {y}: skutečně {100*zr/len(real):.1f} % žen ({zr}), podle pořadí {100*zp/len(poradi):.1f} % ({zp}); '
          f'ženy: vypadlo z volitelného místa {vypadly}, přeskočilo zpod čáry {preskocily}, saldo {preskocily-vypadly:+d}; '
          f'muži: vypadlo {vypadli_m}, přeskočilo {preskocili_m}, saldo {preskocili_m-vypadli_m:+d}')
    for v in VELIKOSTI:
        re_ = [r for r in real if r['vel'] == v]; po = [r for r in poradi if r['vel'] == v]
        print(f'      {v:16} skutečně {100*sum(r["g"]=="Z" for r in re_)/len(re_):.1f} %, podle pořadí {100*sum(r["g"]=="Z" for r in po)/len(po):.1f} %')

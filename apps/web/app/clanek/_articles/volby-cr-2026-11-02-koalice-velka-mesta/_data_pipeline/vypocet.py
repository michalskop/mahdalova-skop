# Koalice ve 26 statutárních městech a v Praze po komunálních volbách 2026: všechna čísla článku a graf.
#
# Zdroje
# 1) Mandáty a složení kandidátek: ČSÚ, otevřená data komunálních voleb (registr kandidátních listin kvros.csv,
#    zastupitelstva kvrzcoco.csv, číselník stran cvs.csv)
#    https://volby.gov.cz/opendata/kv2026/KV2026reg20261011_csv.zip
#    https://volby.gov.cz/opendata/kv2026/KV2026ciselniky20261011_csv.zip
#    https://volby.gov.cz/opendata/kv2022/KV2022reg20260328_csv.zip (řádné volby 2022 = DATUMVOLEB 20220923)
#    Skript je najde ve sdíleném archivu csu-data (složka vedle repa, nebo proměnná CSU_DATA).
# 2) Koalice: tabulka KOALICE níže, ručně z ověřených zpráv ke 2. 11. 2026 (odkaz u každého města).
#    Koalice se zadává kódy kandidátek (OSTRANA v kvros.csv), do které strany kandidátka patří, určuje ČSÚ
#    (sloupec SLOZENI), ne my.
#
# Tábory: vládní = ANO, SPD, Motoristé sobě, PRO; opoziční = ODS, KDU-ČSL, TOP 09, STAN, Piráti.
# Kandidátka patří do tábora, pokud ji (podle ČSÚ) tvoří aspoň jedna strana tábora; ostatní = místní hnutí,
# regionální hnutí (SLK, Naše Česko), Zelení, SOCDEM aj. Kandidátka se stranami obou táborů mezi
# 1 059 kandidátkami s mandátem v těchto městech není.
#
# Spuštění: python vypocet.py  → vystup.txt + ../data/koalice.json (Vega-Lite)
import csv, json, os, sys
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
H = Path(__file__).resolve().parent
ART = H.parent


def csu_data():
    if os.environ.get('CSU_DATA'):
        return Path(os.environ['CSU_DATA'])
    for p in H.parents:
        if (p / 'csu-data').is_dir():
            return p / 'csu-data'
    sys.exit('Nenalezen archiv csu-data (nastav CSU_DATA).')


KV26 = csu_data() / 'volby' / 'kv2026' / '20261011'
KV22 = csu_data() / 'volby' / 'kv2022' / '20260328'
OUT = []
def p(*a): OUT.append(' '.join(str(x) for x in a))
def t(path): return list(csv.DictReader(open(path, encoding='utf-8')))
def pct(a, b, d=1): return f'{a / b * 100:.{d}f}'.replace('.', ',') + ' %'


VLADA = {'768': 'ANO', '1114': 'SPD', '1178': 'Motoristé', '1265': 'PRO'}
OPOZICE = {'53': 'ODS', '1': 'KDU-ČSL', '721': 'TOP 09', '166': 'STAN', '720': 'Piráti'}

# ── Koalice ke 2. 11. 2026 ─────────────────────────────────────────────────
# stav: smlouva = podepsaná koaliční smlouva; dohoda = memorandum nebo oznámená dohoda; sama = jedna kandidátka
# má většinu sama; jedna = jedná se. kl = kódy kandidátek (OSTRANA) v koalici; prim = ohlášený kandidát
# na primátora/starostu (jméno, kandidátka, pohlaví) – zvolí ho až ustavující zasedání. Kde koalice jméno
# nedohodla (Zlín, Prostějov), je prim=None a možná jména jsou v kand; do počtu žen se nepočítají.
KOALICE = {
    'Praha hl.m.': dict(stav='jedna', kl=[], prim=None, pozn='STAN a SPOLU jednají o koalici, třetí Praha sobě, nebo Piráti; ANO všichni vyloučili; zasedání 5. 11. jen slib, pak přerušení do 12. 11.',
                        zdroj='https://prazsky.denik.cz/komunalni-volby/ustavujici-zastupitelstvo-prahy-se-sejde-5-listopadu-v-planu-je-ho-prerusit/'),
    'Brno': dict(stav='smlouva', datum='23. 10.', kl=['340', '523', '1869', '1870', '1710'], prim=('Jakub Hruška', 'KDU-ČSL', 'M'),
                 zdroj='https://ct24.ceskatelevize.cz/clanek/regiony/jihomoravsky-kraj/uskupeni-v-brne-podepsala-koalicni-smlouvu-primatorem-bude-lidovec-hruska-378942'),
    'Ostrava': dict(stav='smlouva', datum='22. 10.', kl=['768', '1973', '755'], prim=('Richard Vereš', 'ANO', 'M'),
                    zdroj='https://www.ceskenoviny.cz/zpravy/v-ostrave-podepsali-koalici-ano-starostove-pro-ostravu-a-ostravak/2889530'),
    'Plzeň': dict(stav='smlouva', datum='19. 10.', kl=['532', '166', '1661'], prim=('Roman Zarzycký', 'ANO', 'M'),
                  zdroj='https://www.ceskenoviny.cz/zpravy/ano-stan-a-pro-plzen-podepsaly-v-plzni-koalicni-smlouvu-maji-34-z-47-hlasu/2889810'),
    'Liberec': dict(stav='dohoda', datum='12. 10.', kl=['703', '1872', '1066'], prim=None,
                    zdroj='https://www.ceskenoviny.cz/zpravy/v-liberci-se-na-koalici-domluvili-slk-s-hnutim-lepsi-liberec-a-lol+pirati/2886593'),
    'Olomouc': dict(stav='smlouva', datum='19. 10.', kl=['166', '1039', '1', '1192', '1369'], prim=('Marek Zelenka', 'STAN', 'M'),
                    zdroj='https://www.olomouc.eu/aktualni-informace/aktuality/31678'),
    'České Budějovice': dict(stav='jedna', kl=[], prim=None, pozn='jedná se o koalici bez vítězného Našeho Česka: HOPB/STAN, ANO, Piráti, Společně pro Budějovice, možná ODS; zasedání 9. 11.',
                             zdroj='https://www.ceskenoviny.cz/zpravy/2893197'),
    'Hradec Králové': dict(stav='dohoda', datum='22. 10.', kl=['1859', '1350', '479'], prim=('Pavlína Springerová', 'HDK a TOP 09', 'Z'),
                           pozn='smlouvu podepisují 2. 11., zasedání 3. 11.',
                           zdroj='https://www.ceskenoviny.cz/zpravy/2895943'),
    'Ústí nad Labem': dict(stav='sama', kl=['1933'], prim=('Tomáš Vohryzka', 'Jedno Ústí', 'M'),
                           zdroj='https://ustecky.denik.cz/komunalni-volby/jedno-usti-vedeni-vohryzka-zakovska-krivan-cerna/'),
    'Pardubice': dict(stav='smlouva', datum='26. 10.', kl=['389', '166', '1897', '1301', '339'], prim=('Ondřej Tichý', 'ODS', 'M'),
                      zdroj='https://www.ceskenoviny.cz/zpravy/2893137'),
    'Zlín': dict(stav='dohoda', datum='1. 11.', kl=['166', '797', '1387', '53', '1949'], prim=None,
                 kand=[('Věra Stojar', 'STAN', 'Z'), ('Čestmír Vančura', 'Zlín 21', 'M')],
                 pozn='STAN, Zlín 21 a trojblok ODS, Společně pro Zlín, Zlín Srdcem a Piráti; smlouva příští týden; primátor nedohodnut',
                 zdroj='https://www.zlin.cz/zpravy/zlin-povede-nova-koalice-vitezne-ano-skonci-v-opozici/'),
    'Jihlava': dict(stav='dohoda', datum='15. 10.', kl=['1327', '166'], prim=('Petr Ryška', 'ODS', 'M'),
                    zdroj='https://ct24.ceskatelevize.cz/clanek/regiony/kraj-vysocina/koalici-v-jihlave-vytvori-vitezny-tym-pro-jihlavu-se-starosty-378667'),
    'Karlovy Vary': dict(stav='smlouva', datum='20. 10.', kl=['768', '1028', '53'], prim=('Andrea Pfeffer Ferklová', 'ANO', 'Z'),
                         zdroj='https://www.ceskenoviny.cz/zpravy/zastupci-nove-koalice-v-k-varech-z-ano-karlovaraku-a-ods-podepsali-smlouvu/2886913'),
    'Havířov': dict(stav='smlouva', datum='11. 10.', kl=['768', '1531', '114'], prim=('Iveta Kočí Palkovská', 'ANO', 'Z'),
                    zdroj='https://polar.cz/zpravy/karvinsko/havirov/11000057309/havirov-ma-koalicni-smlouvu-vedeni-mesta-pokracuje'),
    'Frýdek-Místek': dict(stav='smlouva', datum='22. 10.', kl=['799', '1531'], prim=('Petr Korč', 'Naše Město F-M', 'M'),
                          zdroj='https://polar.cz/zpravy/frydeckomistecko/frydek-mistek/11000057503/nase-mesto-f-m-a-koalice-spolecne-pro-frydek-mistek-podepsaly-koalicni-smlouvu-primatorem-bude-petr-korc'),
    'Teplice': dict(stav='smlouva', datum='26. 10.', kl=['768', '1370'], prim=('Jiří Štábl', 'ANO', 'M'),
                    zdroj='https://www.ceskenoviny.cz/zpravy/2893229'),
    'Děčín': dict(stav='smlouva', datum='23. 10.', kl=['456', '1851', '53', '166'], prim=('Martin Pošta', 'Volba pro Děčín', 'M'),
                  zdroj='https://www.ceskenoviny.cz/zpravy/koalici-v-decine-podepsala-ctyri-uskupeni-ano-bude-v-opozici/2891892'),
    'Jablonec nad Nisou': dict(stav='dohoda', datum='13. 10.', kl=['703', '53', '479', '541'], prim=('Miloš Vele', 'ODS', 'M'),
                               zdroj='https://jablonecky.denik.cz/zpravy-region/vedeni-jablonec-koalice-ano-opozice-primator-milos-vele/'),
    'Most': dict(stav='smlouva', datum='29. 10.', kl=['1175', '768'], prim=('Marek Hrvol', 'ProMOST', 'M'),
                 pozn='ustavující zasedání čeká na soud', zdroj='https://www.ceskenoviny.cz/zpravy/2894633'),
    'Kladno': dict(stav='dohoda', datum='19. 10.', kl=['727', '768', '53'], prim=('Milan Volf', 'Volba pro Kladno', 'M'),
                   zdroj='https://kladensky.denik.cz/zpravy-region/kladno-povede-koalice-volby-pro-kladno-ano-a-ods-primatorem-ma-byt-nadale-volf/'),
    'Opava': dict(stav='dohoda', datum='21. 10.', kl=['1807', '389', '364'], prim=('Petr Czudek', 'OK Změna pro Opavu', 'M'),
                  zdroj='https://opavsky.denik.cz/komunalni-volby/zlom-v-jednanich-o-opave-ok-zmena-ods-a-zeleni-podepsali-memorandum/'),
    'Karviná': dict(stav='jedna', kl=[], prim=None, pozn='Žijeme pro Karvinou má 30 ze 41 mandátů, partnera neohlásila; ustavující zasedání čeká na soud (tři návrhy u KS Ostrava)',
                    zdroj='https://karvinsky.denik.cz/komunalni-volby/jednani-o-vedeni-karvine-stoji-spd-chysta-soudni-prezkum-voleb/'),
    'Chomutov': dict(stav='jedna', kl=[], prim=None, pozn='blok ANO a Lepší Chomutov proti bloku Nový Sever a JsmePRO!; čeká se na soud (115 A 5/2026)',
                     zdroj='https://chomutovsky.denik.cz/komunalni-volby/chomutov-volby-komunalni-ano-novy-sever-jsme-pro-jednani-opozice-vlada/'),
    'Prostějov': dict(stav='dohoda', datum='1. 11.', kl=['1612', '389'], prim=None,
                      kand=[('Jana Jílková', 'Na rovinu!', 'Z'), ('Milada Sokolová', 'Prostějovští demokraté', 'Z')],
                      pozn='memorandum Na rovinu! (STAN, TOP 09, Zelení) a Prostějovských demokratů (ODS); primátor nedohodnut',
                      zdroj='https://hanacka.drbna.cz/politika/904630-radnicni-koalici-v-prostejove-vytvori-na-rovinu-s-ods-je-podepsano.html'),
    'Mladá Boleslav': dict(stav='smlouva', datum='19. 10.', kl=['1071', '166', '523', '411'], prim=('Jiří Bouška', 'ANO', 'M'),
                           zdroj='https://boleslavsky.denik.cz/komunalni-volby/mlada-boleslav-komunalni-volby-vedeni-mesta-koalice-opozice/'),
    'Přerov': dict(stav='smlouva', datum='21. 10.', kl=['768', '53', '355'], prim=('Petr Vrána', 'ANO', 'M'),
                   zdroj='https://www.ceskenoviny.cz/zpravy/v-prerove-podepsalo-koalicni-smlouvu-ano-ods-a-kdu-csl-primatorem-vrana-z-ano/2890766'),
    'Třinec': dict(stav='dohoda', datum='29. 10.', kl=['1688', '1', '687'], prim=('Marian Plucnar', 'Volte Třinec', 'M'),
                   pozn='menšinová koalice, „by měla vést“ (ČTK), nic podepsáno',
                   zdroj='https://www.ceskenoviny.cz/zpravy/2894506'),
}

# ── Data ČSÚ ──────────────────────────────────────────────────────────────
zast = {r['KODZASTUP']: r for r in t(KV26 / 'reg' / 'kvrzcoco.csv') if r['DRUHZASTUP'] in ('3', '4')}
cvs = {r['VSTRANA']: r['ZKRATKAV8'] for r in t(KV26 / 'ciselniky' / 'cvs.csv')}
listiny = defaultdict(list)
for r in t(KV26 / 'reg' / 'kvros.csv'):
    if r['KODZASTUP'] in zast and int(r['MAND_STR'] or 0):
        slo = [s.lstrip('0') for s in r['SLOZENI'].replace('"', '').split(',')]
        listiny[r['KODZASTUP']].append(dict(os=r['OSTRANA'], nazev=r['NAZEVCELK'], slo=slo, m=int(r['MAND_STR']),
                                            hlasy=int(r['HLASY_STR']), pct=float(r['PROCHLSTR'])))


def tabor(l):
    v = [VLADA[s] for s in l['slo'] if s in VLADA]
    o = [OPOZICE[s] for s in l['slo'] if s in OPOZICE]
    assert not (v and o), l
    return 'ANO' if 'ANO' in v else 'vlada' if v else 'opozice' if o else 'ostatni'


p('=' * 78)
p('KOALICE VE 26 STATUTÁRNÍCH MĚSTECH A V PRAZE (stav 2. 11. 2026)')
p('=' * 78)
assert set(KOALICE) == {z['NAZEVZAST'] for z in zast.values()}, set(KOALICE) ^ {z['NAZEVZAST'] for z in zast.values()}
mesta = []
for k, z in zast.items():
    c = KOALICE[z['NAZEVZAST']]
    L = listiny[k]
    tot = int(z['MANDATY'])
    assert sum(l['m'] for l in L) == tot
    os_ = {l['os']: l for l in L}
    assert all(x in os_ for x in c['kl']), (z['NAZEVZAST'], c['kl'])
    vitez = max(L, key=lambda l: (l['m'], l['hlasy']))
    km = sum(os_[x]['m'] for x in c['kl'])
    tab = {tabor(os_[x]) for x in c['kl']}
    strany = sorted({(VLADA | OPOZICE)[s] for x in c['kl'] for s in os_[x]['slo'] if s in VLADA | OPOZICE})
    ano_v = '768' in {s for x in c['kl'] for s in os_[x]['slo']}
    vlada_m = sum(l['m'] for l in L if tabor(l) in ('ANO', 'vlada'))
    opoz_m = sum(l['m'] for l in L if tabor(l) == 'opozice')
    m = dict(kod=k, nazev=z['NAZEVZAST'], obyv=int(z['POCOBYV']), mand=tot, stav=c['stav'], km=km, tabory=tab,
             strany=strany, ano_v=ano_v, vitez=vitez, ano_vitez='768' in vitez['slo'],
             ano_m=sum(l['m'] for l in L if '768' in l['slo']), vlada_m=vlada_m, opoz_m=opoz_m, c=c, L=L)
    mesta.append(m)
    p(f"\n{z['NAZEVZAST']} ({tot} mandátů, {int(z['POCOBYV']):,} obyv.)".replace(',', ' '))
    for l in sorted(L, key=lambda l: -l['m']):
        p(f"   {'*' if l['os'] in c['kl'] else ' '} {l['m']:>2}  {tabor(l):8} {l['nazev'][:62]}  [{'+'.join(cvs.get(s, s) for s in l['slo'])}]")
    p(f"   stav: {c['stav']} {c.get('datum', '')}; koalice {km}/{tot}" + (' (MENŠINOVÁ)' if c['kl'] and km <= tot / 2 else '')
      + f"; strany v koalici: {', '.join(strany) or '–'}; ANO v koalici: {'ano' if ano_v else 'ne'}"
      + f"; vítěz: {vitez['nazev'][:40]} ({vitez['m']})" + (f"; ohlášen/a: {c['prim'][0]} ({c['prim'][1]})" if c['prim'] else ''))

# ── Souhrny ────────────────────────────────────────────────────────────────
p('\n' + '=' * 78 + '\nSOUHRN\n' + '=' * 78)
st = Counter(m['stav'] for m in mesta)
p('stav koalic:', dict(st), '| celkem', len(mesta))
dohod = [m for m in mesta if m['c']['kl'] and m['stav'] != 'sama']
p(f"dohodnuté koalice (smlouva + dohoda): {len(dohod)}")
s_ano = [m for m in dohod if m['ano_v']]
p(f"  ANO v koalici: {len(s_ano)}: {', '.join(m['nazev'] for m in s_ano)}")
kriz = [m for m in s_ano if 'opozice' in m['tabory']]
p(f"    z toho se stranou opozice (ČSÚ složení kandidátek): {len(kriz)}: "
  + '; '.join(f"{m['nazev']} ({', '.join(s for s in m['strany'] if s in OPOZICE.values())})" for m in kriz))
p(f"    jen s místními/ostatními: {', '.join(m['nazev'] for m in s_ano if 'opozice' not in m['tabory'])}")
p(f"  SPD, Motoristé nebo PRO v dohodnuté koalici: {sum(1 for m in dohod if 'vlada' in m['tabory'] or any(s in m['strany'] for s in ('SPD', 'Motoristé', 'PRO')))}")
bez = [m for m in dohod if not m['ano_v']]
p(f"  ANO mimo dohodnutou koalici: {len(bez)}: {', '.join(m['nazev'] for m in bez)}")
p(f"    z toho koalice se stranou opozice: {sum(1 for m in bez if 'opozice' in m['tabory'])}")
p(f"  menšinové: {', '.join(m['nazev'] for m in dohod if m['km'] <= m['mand'] / 2)}")
p(f"většina jedné kandidátky: {', '.join(m['nazev'] for m in mesta if m['stav'] == 'sama')}")
p(f"jedná se: {', '.join(m['nazev'] for m in mesta if m['stav'] == 'jedna')}")

vit = [m for m in mesta if m['ano_vitez']]
p(f"\nANO má nejvíc mandátů (vítěz) v {len(vit)} z {len(mesta)}: {', '.join(m['nazev'] for m in vit)}")
for lab, f in (('vládne', lambda m: m['ano_v'] and m['stav'] != 'jedna'), ('mimo koalici', lambda m: m['stav'] in ('smlouva', 'dohoda', 'sama') and not m['ano_v']), ('jedná se', lambda m: m['stav'] == 'jedna')):
    x = [m['nazev'] for m in vit if f(m)]
    p(f"   {lab}: {len(x)} – {', '.join(x)}")
p(f"ANO v koalici, kde nevyhrálo: {', '.join(m['nazev'] for m in s_ano if not m['ano_vitez'])}")
p(f"vítěz voleb mimo dohodnutou koalici: {', '.join(m['nazev'] + ' (' + m['vitez']['nazev'][:30] + ')' for m in dohod if m['vitez']['os'] not in m['c']['kl'])}")
p(f"\nANO mandáty ve 27 městech: {sum(m['ano_m'] for m in mesta)} z {sum(m['mand'] for m in mesta)}; "
  f"z toho v dohodnutých koalicích: {sum(m['ano_m'] for m in s_ano)}")

p('\nVládní tábor (ANO, SPD, Motoristé, PRO) sám má většinu: '
  + ', '.join(f"{m['nazev']} ({m['vlada_m']}/{m['mand']})" for m in mesta if m['vlada_m'] > m['mand'] / 2))
prer = next(m for m in mesta if m['nazev'] == 'Přerov')
p(f"Přerov: ANO {prer['ano_m']} + SPD {sum(l['m'] for l in prer['L'] if '1114' in l['slo'])} = většina, koalice ANO + ODS + KDU {prer['km']}/{prer['mand']}")

p('\nOhlášení kandidáti na primátora/starostu (zvolí je ustavující zasedání):')
pr = [m for m in mesta if m['c']['prim']]
for m in pr:
    p(f"   {m['nazev']}: {m['c']['prim'][0]} ({m['c']['prim'][1]}, {m['c']['prim'][2]})")
p(f"   ženy {sum(1 for m in pr if m['c']['prim'][2] == 'Z')} z {len(pr)}")
nd = [m for m in mesta if m['c'].get('kand')]
p('Dohodnutá koalice bez dohodnutého jména (do počtu nezahrnuto): ' + '; '.join(
    f"{m['nazev']}: " + ' nebo '.join(f'{a} ({b}, {c})' for a, b, c in m['c']['kand']) for m in nd))
p(f"dohodnuté koalice bez ohlášeného jména: {', '.join(m['nazev'] for m in mesta if m['stav'] in ('smlouva', 'dohoda') and not m['c']['prim'])}")

# ── Před volbami: společné kandidátky napříč tábory (všechny obce a MČ, 2022 a 2026) ──
p('\n' + '=' * 78 + '\nSPOLEČNÉ KANDIDÁTKY VLÁDNÍCH A OPOZIČNÍCH STRAN (všechna zastupitelstva)\n' + '=' * 78)
for rok, d, flt in (('2022', KV22, '20220923'), ('2026', KV26, None)):
    ros = [r for r in t(d / 'reg' / 'kvros.csv') if not flt or r['DATUMVOLEB'] == flt]
    koal = [r for r in ros if int(r['POCSTR_SLO']) > 1]
    pary = Counter()
    for r in koal:
        s = {(VLADA | OPOZICE)[x.lstrip('0')] for x in r['SLOZENI'].replace('"', '').split(',') if x.lstrip('0') in VLADA | OPOZICE}
        for a, b in combinations(sorted(s), 2):
            pary[(a, b)] += 1
    kr = sum(v for (a, b), v in pary.items() if (a in VLADA.values()) != (b in VLADA.values()))
    ano = sum(v for (a, b), v in pary.items() if 'ANO' in (a, b))
    p(f"{rok}: kandidátek celkem {len(ros)}, koaličních {len(koal)}; dvojic vláda × opozice ve společné koalici: {kr}; "
      f"koalic ANO s parlamentní stranou: {ano}")
    p('   nejčastější dvojice: ' + '; '.join(f'{a}+{b} {v}' for (a, b), v in pary.most_common(12)))

# ── Vítěz voleb: má většinu sám? vládne? kolik hlasů má koalice bez něj? ──────
p('\n' + '=' * 78 + '\nVÍTĚZ VOLEB (kandidátka s nejvíc mandáty, při shodě hlasy)\n' + '=' * 78)
for m in sorted(mesta, key=lambda m: -m['vitez']['m'] / m['mand']):
    v = m['vitez']
    role = 'jedná se' if m['stav'] == 'jedna' else 'vládne' if v['os'] in m['c']['kl'] else 'MIMO KOALICI'
    kh = sum(l['pct'] for l in m['L'] if l['os'] in m['c']['kl'])
    p(f"   {m['nazev'][:20]:20} {v['m']:>2}/{m['mand']:<2} = {pct(v['m'], m['mand']):>7} mandátů, {str(v['pct']).replace('.', ','):>5} % hlasů"
      f"  {'VĚTŠINA SÁM ' if v['m'] > m['mand'] / 2 else '            '}{role:12} | {v['nazev'][:44]}"
      + (f" | koalice bez vítěze: {m['km']} mandátů, {kh:.1f} % hlasů".replace('.', ',') if role == 'MIMO KOALICI' else ''))
rozh = [m for m in mesta if m['stav'] != 'jedna']
mimo = [m for m in rozh if m['vitez']['os'] not in m['c']['kl']]
p(f"rozhodnuto {len(rozh)}: vítěz vládne {len(rozh) - len(mimo)}, vítěz mimo koalici {len(mimo)}")
p(f"většina jedné kandidátky 2026: {', '.join(m['nazev'] for m in mesta if m['vitez']['m'] > m['mand'] / 2)}")
# pro srovnání řádné volby 2022 ve stejných zastupitelstvech
r22 = defaultdict(list)
for r in t(KV22 / 'reg' / 'kvros.csv'):
    if r['DATUMVOLEB'] == '20220923' and r['KODZASTUP'] in zast and int(r['MAND_STR'] or 0):
        r22[r['KODZASTUP']].append((int(r['MAND_STR']), r['NAZEVCELK']))
p('většina jedné kandidátky 2022: ' + ', '.join(f"{zast[k]['NAZEVZAST']} ({max(L)[0]}/{sum(x[0] for x in L)}, {max(L)[1][:30]})"
                                                for k, L in r22.items() if max(L)[0] > sum(x[0] for x in L) / 2))

# Městský obvod Plzeň 2-Slovany (příklad z textu: vítězná ODS mimo koalici, polovina jejích zastupitelů do ní jde)
p('\nPlzeň 2-Slovany:')
for r in t(KV26 / 'reg' / 'kvros.csv'):
    if r['NAZEVZAST'] == 'Plzeň 2-Slovany' and int(r['MAND_STR'] or 0):
        p(f"   {r['MAND_STR']:>2}  {r['PROCHLSTR']:>5} %  {r['NAZEVCELK']}")

# ── Graf 2: podíl mandátů vítěze, barva = vládne / mimo koalici / jedná se ──
rows2 = []
for m in mesta:
    v = m['vitez']
    role = 'jedná se' if m['stav'] == 'jedna' else 'vítěz v koalici' if v['os'] in m['c']['kl'] else 'vítěz mimo koalici'
    rows2.append(dict(mesto=m['nazev'], vitez=v['nazev'][:60],
                      podil=round(v['m'] / m['mand'] * 100, 1), mand=f"{v['m']} z {m['mand']}", hlasy=v['pct'], role=role))
NAZ = {'Praha hl.m.': 'Praha', 'Jablonec nad Nisou': 'Jablonec n. N.', 'Ústí nad Labem': 'Ústí n. L.'}
for r in rows2:
    r['mesto'] = NAZ.get(r['mesto'], r['mesto'])
PORADI2 = [r['mesto'] for r in sorted(rows2, key=lambda r: (-r['podil'], r['mesto']))]
ROLE = {'vítěz v koalici': '#12b886', 'vítěz mimo koalici': '#522a7a', 'jedná se': '#bcbcb0'}   # brandEmeraldMint.5, brandAmethyst.8, background.9 – tlumená dvojice (Kateřina 25. 10.: ne oranžová, ne jedovatá)
spec2 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'Nadpoloviční většinu získala jedna kandidátka jen v Karviné a v Ústí nad Labem',
              'subtitle': 'Podíl mandátů kandidátky, která v zastupitelstvu získala nejvíc křesel (%), a zda je v dohodnuté koalici. Stav 2. 11. 2026'},
    '_source': 'ČSÚ – otevřená data komunálních voleb 2026; koalice podle zpráv ČTK a regionálních médií k 2. 11. 2026; výpočet DataTimes.cz',
    'width': 600, 'height': 560,
    'data': {'values': rows2},
    'layer': [
        {'mark': {'type': 'bar', 'cornerRadiusEnd': 3},
         'encoding': {
             'y': {'field': 'mesto', 'type': 'nominal', 'sort': PORADI2,
                   'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 13, 'labelPadding': 8}},
             'x': {'field': 'podil', 'type': 'quantitative', 'scale': {'domain': [0, 80]},
                   'axis': {'title': None, 'values': [0, 20, 40, 50, 60, 80], 'labelExpr': "datum.value + ' %'", 'grid': True}},
             'color': {'field': 'role', 'type': 'nominal', 'scale': {'domain': list(ROLE), 'range': list(ROLE.values())},
                       'legend': {'title': None, 'orient': 'top'}},
             'tooltip': [{'field': 'mesto', 'title': 'Město'}, {'field': 'vitez', 'title': 'Vítězná kandidátka'},
                         {'field': 'mand', 'title': 'Mandátů'}, {'field': 'hlasy', 'title': 'Hlasů (%)', 'format': '.1f'},
                         {'field': 'role', 'title': 'Koalice'}]}},
        {'mark': {'type': 'text', 'align': 'left', 'dx': 4, 'fontSize': 12, 'color': '#101432'},
         'encoding': {'y': {'field': 'mesto', 'type': 'nominal', 'sort': PORADI2}, 'x': {'field': 'podil', 'type': 'quantitative'},
                      'text': {'field': 'mand'}}},
        {'mark': {'type': 'rule', 'strokeDash': [4, 3], 'strokeWidth': 1.5},
         'encoding': {'x': {'datum': 50, 'type': 'quantitative'}, 'color': {'value': '#101432'}}},
    ],
}
(ART / 'data').mkdir(exist_ok=True)
(ART / 'data' / 'vitezove.json').write_text(json.dumps(spec2, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
p('graf zapsán: data/vitezove.json')

# ── Graf: složení zastupitelstev, koalice plně, ostatní světle ──────────────
SKUP = [('ANO v dohodnuté koalici', lambda m: m['ano_v'] and m['stav'] != 'jedna'),
        ('Koalice bez ANO', lambda m: m['stav'] in ('smlouva', 'dohoda', 'sama') and not m['ano_v']),
        ('Jedná se nebo čeká na soud', lambda m: m['stav'] == 'jedna')]
NAZ = {'Praha hl.m.': 'Praha', 'Jablonec nad Nisou': 'Jablonec n. N.', 'Ústí nad Labem': 'Ústí n. L.'}
TAB_POPIS = {'ANO': 'ANO', 'vlada': 'SPD, Motoristé, PRO', 'opozice': 'ODS, KDU-ČSL, TOP 09, STAN, Piráti',
             'ostatni': 'místní hnutí a ostatní'}
STAV_POPIS = {'smlouva': 'smlouva', 'dohoda': 'dohoda', 'sama': 'většina jedné kandidátky', 'jedna': 'jedná se'}
rows, domena = [], []
for i, (sk, f) in enumerate(SKUP):
    sel = sorted((m for m in mesta if f(m)), key=lambda m: -m['obyv'])
    p(f"\nGraf – {sk}: {len(sel)}")
    domena.append(f'h-{sk} ({len(sel)})')
    for m in sel:
        y = NAZ.get(m['nazev'], m['nazev'])
        domena.append(y)
        poradi = sorted(m['L'], key=lambda l: (l['os'] not in m['c']['kl'], ['ANO', 'vlada', 'opozice', 'ostatni'].index(tabor(l)), -l['m']))
        x0 = 0
        for j, l in enumerate(poradi):
            v = l['os'] in m['c']['kl']
            rows.append(dict(mesto=y, kand=l['nazev'], mand=l['m'], z=m['mand'], x0=round(x0 / m['mand'] * 100, 2),
                             x1=round((x0 + l['m']) / m['mand'] * 100, 2), tabor=TAB_POPIS[tabor(l)],
                             vkoalici='v koalici' if v else 'mimo koalici', poradi=j,
                             stav=STAV_POPIS[m['stav']], koal=f"{m['km']} z {m['mand']}" if m['km'] else '–'))
            x0 += l['m']
    if i < len(SKUP) - 1:
        domena.append(f'mezera-{i}')

BARVY = {'ANO': '#272a59', 'SPD, Motoristé, PRO': '#a47d03',   # barvy stran z predikce (ANO, SPD)
         'ODS, KDU-ČSL, TOP 09, STAN, Piráti': '#06677d',       # brandTeal.7
         'místní hnutí a ostatní': '#bcbcb0'}                    # background.9
JE_H = "indexof(datum.value, 'h-') == 0"
Y = {'field': 'mesto', 'type': 'ordinal', 'sort': domena, 'scale': {'domain': domena, 'paddingInner': 0.22, 'paddingOuter': 0.05},
     'axis': {'title': None, 'domain': False, 'ticks': False, 'labelPadding': 8, 'labelLimit': 240,
              'labelExpr': f"{JE_H} ? replace(datum.value, 'h-', '') : indexof(datum.value, 'mezera') == 0 ? '' : datum.value",
              'labelFontWeight': {'expr': f'{JE_H} ? 800 : 500'}, 'labelFontSize': {'expr': f'{JE_H} ? 14 : 13'},
              'labelColor': {'expr': f"{JE_H} ? '#de1743' : '#101432'"}}}
spec = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'ANO vládne v devíti velkých městech, v osmi z nich se stranami opozice',
              'subtitle': 'Rozdělení mandátů v zastupitelstvech 26 statutárních měst a Prahy; plnou barvou kandidátky v dohodnuté koalici, světle ostatní. Stav 2. 11. 2026'},
    '_source': 'ČSÚ – otevřená data komunálních voleb 2026 (mandáty, složení kandidátek); koalice podle zpráv ČTK a regionálních médií k 2. 11. 2026; výpočet DataTimes.cz',
    'width': 600, 'height': 620,
    'data': {'values': rows},
    'layer': [
        {'mark': {'type': 'bar', 'stroke': '#ffffff', 'strokeWidth': 1},
         'encoding': {
             'y': Y,
             'x': {'field': 'x0', 'type': 'quantitative', 'scale': {'domain': [0, 100]},
                   'axis': {'title': None, 'values': [0, 25, 50, 75, 100], 'labelExpr': "datum.value + ' %'", 'grid': True}},
             'x2': {'field': 'x1'},
             'color': {'field': 'tabor', 'type': 'nominal', 'scale': {'domain': list(BARVY), 'range': list(BARVY.values())},
                       'legend': {'title': None, 'orient': 'top', 'columns': 2, 'labelLimit': 300}},
             'opacity': {'field': 'vkoalici', 'type': 'nominal', 'scale': {'domain': ['v koalici', 'mimo koalici'], 'range': [1, 0.22]},
                         'legend': None},
             'tooltip': [{'field': 'mesto', 'title': 'Město'}, {'field': 'kand', 'title': 'Kandidátka'},
                         {'field': 'mand', 'title': 'Mandátů'}, {'field': 'vkoalici', 'title': 'Koalice'},
                         {'field': 'koal', 'title': 'Koalice má mandátů'}, {'field': 'stav', 'title': 'Stav'}]}},
        {'mark': {'type': 'rule', 'strokeDash': [4, 3], 'strokeWidth': 1.5},
         'encoding': {'x': {'datum': 50, 'type': 'quantitative'}, 'color': {'value': '#101432'}}},
    ],
}
(ART / 'data').mkdir(exist_ok=True)
(ART / 'data' / 'koalice.json').write_text(json.dumps(spec, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
p('\ngraf zapsán: data/koalice.json')

(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')
print('\n'.join(OUT))

# ── Podklad pro cover: role ANO a počet obyvatel každého města ─────────────
cov = [dict(nazev=m['nazev'], obyv=m['obyv'],
            role='ano' if m['ano_v'] and m['stav'] != 'jedna' else 'bez' if m['stav'] != 'jedna' else 'jedna') for m in mesta]
(ART / '_cover_pipeline').mkdir(exist_ok=True)
(ART / '_cover_pipeline' / 'mesta.json').write_text(json.dumps(cov, ensure_ascii=False, indent=0), encoding='utf-8')
print('cover: _cover_pipeline/mesta.json', Counter(c['role'] for c in cov))

# Ustavující zastupitelstva ve 26 statutárních městech a v Praze (stav 4. 11. 2026): všechna čísla článku a graf.
# Navazuje na skript článku volby-cr-2026-10-26-koalice-velka-mesta (stav 2. 11.), doplněno o zvolené primátory
# a o soudní opravy mandátů v Karviné a v Mostě (KOREKCE níže).
#
# Zdroje
# 1) Mandáty a složení kandidátek: ČSÚ, otevřená data komunálních voleb (registr kandidátních listin kvros.csv,
#    zastupitelstva kvrzcoco.csv, číselník stran cvs.csv)
#    https://volby.gov.cz/opendata/kv2026/KV2026reg20261011_csv.zip
#    https://volby.gov.cz/opendata/kv2026/KV2026ciselniky20261011_csv.zip
#    https://volby.gov.cz/opendata/kv2022/KV2022reg20260328_csv.zip (řádné volby 2022 = DATUMVOLEB 20220923)
#    Skript je najde ve sdíleném archivu csu-data (složka vedle repa, nebo proměnná CSU_DATA).
# 2) Koalice: tabulka KOALICE níže, ručně z ověřených zpráv ke 4. 11. 2026 (odkaz u každého města).
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

# ── Koalice ke 4. 11. 2026 ─────────────────────────────────────────────────
# stav: smlouva = podepsaná koaliční smlouva; dohoda = memorandum nebo oznámená dohoda; sama = jedna kandidátka
# má většinu sama; jedna = jedná se. kl = kódy kandidátek (OSTRANA) v koalici; prim = ohlášený kandidát
# na primátora/starostu (jméno, kandidátka, pohlaví) – zvolí ho až ustavující zasedání. Kde koalice jméno
# nedohodla (Zlín, Prostějov), je prim=None a možná jména jsou v kand; do počtu žen se nepočítají.
KOALICE = {
    'Praha hl.m.': dict(stav='jedna', kl=[], prim=None, pozn='STAN a SPOLU jednají o koalici, třetí Praha sobě, nebo Piráti; ANO všichni vyloučili; zasedání 5. 11. jen slib, pak přerušení do 19. 11.; výsledek jednání strany oznámí 10. nebo 11. 11.',
                        zdroj='https://www.ceskenoviny.cz/zpravy/hlavacek-vysledek-jednani-o-koalici-v-praze-oznami-strany-v-utery-ci-ve-stredu/2895938'),
    'Brno': dict(stav='smlouva', datum='23. 10.', kl=['340', '523', '1869', '1870', '1710'], prim=('Jakub Hruška', 'KDU-ČSL', 'M'), zvolen=('3. 11.', '44 z 54 přítomných', 'https://www.ceskenoviny.cz/zpravy/brnenskym-primatorem-se-stal-jakub-hruska-ziskal-44-hlasu-/2896465'),
                 zdroj='https://ct24.ceskatelevize.cz/clanek/regiony/jihomoravsky-kraj/uskupeni-v-brne-podepsala-koalicni-smlouvu-primatorem-bude-lidovec-hruska-378942'),
    'Ostrava': dict(stav='smlouva', datum='22. 10.', kl=['768', '1973', '755'], prim=('Richard Vereš', 'ANO', 'M'),
                    zdroj='https://www.ceskenoviny.cz/zpravy/v-ostrave-podepsali-koalici-ano-starostove-pro-ostravu-a-ostravak/2889530'),
    'Plzeň': dict(stav='smlouva', datum='19. 10.', kl=['532', '166', '1661'], prim=('Roman Zarzycký', 'ANO', 'M'), zvolen=('2. 11.', '33 hlasů, 11 proti', 'https://ct24.ceskatelevize.cz/clanek/domaci/vetsina-krajskych-mest-uz-zna-nove-koalice-praha-a-ceske-budejovice-dal-jednaji-379243'),
                  zdroj='https://www.ceskenoviny.cz/zpravy/ano-stan-a-pro-plzen-podepsaly-v-plzni-koalicni-smlouvu-maji-34-z-47-hlasu/2889810'),
    'Liberec': dict(stav='dohoda', datum='12. 10.', kl=['703', '1872', '1066'], prim=('Lukáš Hájek', 'SLK', 'M'),
                    zdroj='https://www.ceskenoviny.cz/zpravy/v-liberci-se-na-koalici-domluvili-slk-s-hnutim-lepsi-liberec-a-lol+pirati/2886593'),
    'Olomouc': dict(stav='smlouva', datum='19. 10.', kl=['166', '1039', '1', '1192', '1369'], prim=('Marek Zelenka', 'STAN', 'M'),
                    zdroj='https://www.olomouc.eu/aktualni-informace/aktuality/31678'),
    'České Budějovice': dict(stav='jedna', kl=[], prim=None, pozn='jedná se o koalici bez vítězného Našeho Česka: HOPB/STAN, ANO, Piráti, Společně pro Budějovice, ODS zvažuje; 9. 11. jen slib, volba vedení 23. 11.',
                             zdroj='https://www.ceskenoviny.cz/zpravy/zastupitelstvo-v-c-budejovicich-nezvoli-nove-vedeni-mesta-strany-stale-jednaji/2896806'),
    'Hradec Králové': dict(stav='smlouva', datum='2. 11.', kl=['1859', '1350', '479'], prim=('Pavlína Springerová', 'HDK a TOP 09', 'Z'),
                           zvolen=('3. 11.', '22 z 37 přítomných, tajná volba', 'https://www.ceskenoviny.cz/zpravy/primatorkou-hradce-kralove-je-opet-springerova-dostala-22-z-37-hlasu/2896858'),
                           zdroj='https://www.ceskenoviny.cz/zpravy/primatorkou-hradce-kralove-je-opet-springerova-dostala-22-z-37-hlasu/2896858'),
    'Ústí nad Labem': dict(stav='sama', kl=['1933'], prim=('Tomáš Vohryzka', 'Jedno Ústí', 'M'),
                           zdroj='https://ustecky.denik.cz/komunalni-volby/jedno-usti-vedeni-vohryzka-zakovska-krivan-cerna/'),
    'Pardubice': dict(stav='smlouva', datum='26. 10.', kl=['389', '166', '1897', '1301', '339'], prim=('Ondřej Tichý', 'ODS', 'M'),
                      zdroj='https://www.ceskenoviny.cz/zpravy/2893137'),
    'Zlín': dict(stav='dohoda', datum='1. 11.', kl=['166', '797', '1387', '53', '1949'], prim=None,
                 kand=[('Věra Stojar', 'STAN', 'Z'), ('Čestmír Vančura', 'Zlín 21', 'M')],
                 pozn='STAN, Zlín 21 a trojblok ODS, Společně pro Zlín, Zlín Srdcem a Piráti; smlouva příští týden; primátor nedohodnut',
                 zdroj='https://www.zlin.cz/zpravy/zlin-povede-nova-koalice-vitezne-ano-skonci-v-opozici/'),
    'Jihlava': dict(stav='dohoda', datum='15. 10.', kl=['1327', '166'], prim=('Petr Ryška', 'ODS', 'M'), zvolen=('2. 11.', '33 z 35 přítomných', 'https://ct24.ceskatelevize.cz/clanek/domaci/vetsina-krajskych-mest-uz-zna-nove-koalice-praha-a-ceske-budejovice-dal-jednaji-379243'),
                    zdroj='https://ct24.ceskatelevize.cz/clanek/regiony/kraj-vysocina/koalici-v-jihlave-vytvori-vitezny-tym-pro-jihlavu-se-starosty-378667'),
    'Karlovy Vary': dict(stav='smlouva', datum='20. 10.', kl=['768', '1028', '53'], prim=('Andrea Pfeffer Ferklová', 'ANO', 'Z'),
                         zdroj='https://www.ceskenoviny.cz/zpravy/zastupci-nove-koalice-v-k-varech-z-ano-karlovaraku-a-ods-podepsali-smlouvu/2886913'),
    'Havířov': dict(stav='smlouva', datum='11. 10.', kl=['768', '1531', '114'], prim=('Iveta Kočí Palkovská', 'ANO', 'Z'),
                    zdroj='https://polar.cz/zpravy/karvinsko/havirov/11000057309/havirov-ma-koalicni-smlouvu-vedeni-mesta-pokracuje'),
    'Frýdek-Místek': dict(stav='smlouva', datum='22. 10.', kl=['799', '1531'], prim=('Petr Korč', 'Naše Město F-M', 'M'), zvolen=('3. 11.', '30 ze 43 přítomných', 'https://www.ceskenoviny.cz/zpravy/primatorem-frydku-mistku-je-opet-petr-korc-z-vitezneho-hnuti-nase-mesto-f-m/2896513'),
                          zdroj='https://polar.cz/zpravy/frydeckomistecko/frydek-mistek/11000057503/nase-mesto-f-m-a-koalice-spolecne-pro-frydek-mistek-podepsaly-koalicni-smlouvu-primatorem-bude-petr-korc'),
    'Teplice': dict(stav='smlouva', datum='26. 10.', kl=['768', '1370'], prim=('Jiří Štábl', 'ANO', 'M'), zvolen=('3. 11.', '', 'https://teplicky.denik.cz/komunalni-volby/primatorem-teplic-jiri-stabl/'),
                    zdroj='https://www.ceskenoviny.cz/zpravy/2893229'),
    'Děčín': dict(stav='smlouva', datum='23. 10.', kl=['456', '1851', '53', '166'], prim=('Martin Pošta', 'Volba pro Děčín', 'M'),
                  zdroj='https://www.ceskenoviny.cz/zpravy/koalici-v-decine-podepsala-ctyri-uskupeni-ano-bude-v-opozici/2891892'),
    'Jablonec nad Nisou': dict(stav='dohoda', datum='13. 10.', kl=['703', '53', '479', '541'], prim=('Miloš Vele', 'ODS', 'M'),
                               zdroj='https://jablonecky.denik.cz/zpravy-region/vedeni-jablonec-koalice-ano-opozice-primator-milos-vele/'),
    'Most': dict(stav='smlouva', datum='29. 10.', kl=['1175', '768'], prim=('Marek Hrvol', 'ProMOST', 'M'),
                 pozn='soud přidělil ProMOST 23. mandát (většina sám), koalice s ANO pokračuje; zasedání bez termínu', zdroj='https://mostecky.denik.cz/komunalni-volby/most-soud-volby-vysledek-mandaty-promost-vize-zeleni/'),
    'Kladno': dict(stav='dohoda', datum='19. 10.', kl=['727', '768', '53'], prim=('Milan Volf', 'Volba pro Kladno', 'M'),
                   zdroj='https://kladensky.denik.cz/zpravy-region/kladno-povede-koalice-volby-pro-kladno-ano-a-ods-primatorem-ma-byt-nadale-volf/'),
    'Opava': dict(stav='smlouva', datum='1. 11.', kl=['1807', '389', '364'], prim=('Petr Czudek', 'OK Změna pro Opavu', 'M'),
                  zdroj='https://opavsky.denik.cz/zpravy-region/opava-podepsana-koalice-ok-zmena-ods-zelena/'),
    'Karviná': dict(stav='smlouva', datum='', kl=['371', '768'], prim=('Jan Wolf', 'Žijeme pro Karvinou', 'M'),
                    pozn='smlouva Žijeme pro Karvinou + ANO (ČT24 2. 11., datum podpisu neuvádí); soud 3. 11. přidělil SPD 2 mandáty; zasedání 9. 11.',
                    zdroj='https://ct24.ceskatelevize.cz/clanek/domaci/karvinou-povede-koalice-zijeme-pro-karvinou-a-ano-primatorem-bude-wolf-379218'),
    'Chomutov': dict(stav='jedna', kl=[], prim=None, pozn='blok ANO a Lepší Chomutov proti bloku Nový Sever a JsmePRO!; čeká se na soud (115 A 5/2026)',
                     zdroj='https://chomutovsky.denik.cz/komunalni-volby/chomutov-volby-komunalni-ano-novy-sever-jsme-pro-jednani-opozice-vlada/'),
    'Prostějov': dict(stav='dohoda', datum='1. 11.', kl=['1612', '389'], prim=None,
                      kand=[('Jana Jílková', 'Na rovinu!', 'Z'), ('Milada Sokolová', 'Prostějovští demokraté', 'Z')],
                      pozn='memorandum Na rovinu! (STAN, TOP 09, Zelení) a Prostějovských demokratů (ODS); primátor nedohodnut',
                      zdroj='https://hanacka.drbna.cz/politika/904630-radnicni-koalici-v-prostejove-vytvori-na-rovinu-s-ods-je-podepsano.html'),
    'Mladá Boleslav': dict(stav='smlouva', datum='19. 10.', kl=['1071', '166', '523', '411'], prim=('Jiří Bouška', 'ANO', 'M'), zvolen=('2. 11.', '28 z 30 přítomných', 'https://www.ceskenoviny.cz/zpravy/primatorem-mlade-boleslavi-je-bouska-koalice-zmenila-podobu-vedeni-mesta/2890068'),
                           zdroj='https://boleslavsky.denik.cz/komunalni-volby/mlada-boleslav-komunalni-volby-vedeni-mesta-koalice-opozice/'),
    'Přerov': dict(stav='smlouva', datum='21. 10.', kl=['768', '53', '355'], prim=('Petr Vrána', 'ANO', 'M'), zvolen=('2. 11.', '24 z 33 přítomných', 'https://www.prerov.eu/cs/magistrat/tiskove-centrum/tiskove-zpravy-2026/tz-listopad-2026/prerov-ma-vedeni-pro-dalsi-ctyri-roky-primatorem-zustava-petr-vrana.html'),
                   zdroj='https://www.ceskenoviny.cz/zpravy/v-prerove-podepsalo-koalicni-smlouvu-ano-ods-a-kdu-csl-primatorem-vrana-z-ano/2890766'),
    'Třinec': dict(stav='dohoda', datum='29. 10.', kl=['1688', '1', '687'], prim=('Marian Plucnar', 'Volte Třinec', 'M'),
                   pozn='menšinová koalice, dohoda podepsána 29. 10., zasedání 5. 11.',
                   zdroj='https://ehutnik.cz/zpravy/trinec-povede-mensinova-koalice-potrebuje-ale-podporu-dalsich'),
}

# ── Soudní opravy mandátů po 11. 10. (krajské soudy, zprávy z 3.–4. 11.) ──
# Karviná: KS Ostrava na návrh SPD přepočítal okrsek, SPD 2 mandáty, Žijeme pro Karvinou a Srdcem pro Karvinou po −1
#   https://ostravska.drbna.cz/politika/904812-spd-uspela-s-prepoctem-hlasu-v-karvine-ziska-dva-mandaty.html
# Most: KS Ústí nad Labem, okrsek 30: Piráti, Zelení a Starostové −2, ProMOST +1, VIZE pro Most +1
#   https://mostecky.denik.cz/komunalni-volby/most-soud-volby-vysledek-mandaty-promost-vize-zeleni/
# Hlasy a procenta zůstávají podle ČSÚ k 11. 10. (soud změnil hlasy jen v jednom okrsku).
KOREKCE = {('Karviná', '371'): 29, ('Karviná', '1912'): 3, ('Karviná', '1114'): 2,
           ('Most', '1175'): 23, ('Most', '1743'): 12, ('Most', '1894'): 0}

# ── Data ČSÚ ──────────────────────────────────────────────────────────────
zast = {r['KODZASTUP']: r for r in t(KV26 / 'reg' / 'kvrzcoco.csv') if r['DRUHZASTUP'] in ('3', '4')}
cvs = {r['VSTRANA']: r['ZKRATKAV8'] for r in t(KV26 / 'ciselniky' / 'cvs.csv')}
listiny = defaultdict(list)
for r in t(KV26 / 'reg' / 'kvros.csv'):
    mand = KOREKCE.get((r['NAZEVZAST'], r['OSTRANA']), int(r['MAND_STR'] or 0))
    if r['KODZASTUP'] in zast and mand:
        slo = [s.lstrip('0') for s in r['SLOZENI'].replace('"', '').split(',')]
        listiny[r['KODZASTUP']].append(dict(os=r['OSTRANA'], nazev=r['NAZEVCELK'], slo=slo, m=mand,
                                            hlasy=int(r['HLASY_STR']), pct=float(r['PROCHLSTR'])))


def tabor(l):
    v = [VLADA[s] for s in l['slo'] if s in VLADA]
    o = [OPOZICE[s] for s in l['slo'] if s in OPOZICE]
    assert not (v and o), l
    return 'ANO' if 'ANO' in v else 'vlada' if v else 'opozice' if o else 'ostatni'


p('=' * 78)
p('KOALICE VE 26 STATUTÁRNÍCH MĚSTECH A V PRAZE (stav 4. 11. 2026)')
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

p('\nZvolení primátoři a primátorky ke 4. 11.:')
zv = [m for m in mesta if m['c'].get('zvolen')]
for m in sorted(zv, key=lambda m: m['c']['zvolen'][0]):
    c = m['c']
    op = [s for s in m['strany'] if s in OPOZICE.values()]
    p(f"   {c['zvolen'][0]} {m['nazev']}: {c['prim'][0]} ({c['prim'][1]}) {c['zvolen'][1]}; koalice {m['km']}/{m['mand']}; "
      f"ANO v koalici: {'ano' if m['ano_v'] else 'ne'}; opoziční strany v koalici: {', '.join(op) or '–'}")
p(f"   zvoleno {len(zv)} z {len(mesta)}; z ANO {sum(1 for m in zv if m['c']['prim'][1] == 'ANO')}; "
  f"ANO v koalici {sum(1 for m in zv if m['ano_v'])}; z toho s opozicí {sum(1 for m in zv if m['ano_v'] and 'opozice' in m['tabory'])}")
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
              'subtitle': 'Podíl mandátů kandidátky, která v zastupitelstvu získala nejvíc křesel (%), a zda je v dohodnuté koalici. Stav 4. 11. 2026'},
    '_source': 'ČSÚ – otevřená data komunálních voleb 2026; koalice podle zpráv ČTK a regionálních médií ke 4. 11. 2026; mandáty v Karviné a Mostě po rozhodnutí soudů; výpočet DataTimes.cz',
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

# Složení kandidátky do tooltipu: každá strana s barvou jako v ostatních volebních článcích (Komu patří Česko,
# 19. 10.), nezávislí šedomodře, místní hnutí a ostatní světle (Kateřina 4. 11.: tečky stran v tooltipu).
STRANY = {'768': ('ANO', '#272a59'), '1114': ('SPD', '#a47d03'), '166': ('STAN', '#ff1a4a'), '53': ('ODS', '#5e66d5'),
          '720': ('Piráti', '#111111'), '1': ('KDU-ČSL', '#ffcf02'), '721': ('TOP 09', '#812840'),
          '1178': ('Motoristé', '#1a9fbd'), '7': ('SOCDEM', '#f76800'), '47': ('KSČM', '#c5143c'), '5': ('Zelení', '#639e0a'),
          '714': ('Svobodní', '#0e926a'), '1265': ('PRO', '#9f319e'), '1245': ('Přísaha', '#a9b5f0'),
          '1227': ('Trikolora', '#ffb3c0'), '1298': ('Stačilo!', '#c5143c')}
NEZ_ZKR = {'NK', 'NEZ', 'Nestran.'}
TT_BARVY = {n: b for n, b in STRANY.values()} | {'nezávislí': '#8a8fb0', 'místní hnutí': '#c3c6d8'}


def slozeni(l):
    out = []
    for x in l['slo']:
        n = STRANY[x][0] if x in STRANY else 'nezávislí' if cvs.get(x) in NEZ_ZKR else 'místní hnutí'
        if n not in out:
            out.append(n)
    return '\n'.join(out)


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
                             stav=STAV_POPIS[m['stav']], koal=f"{m['km']} z {m['mand']}" if m['km'] else '–',
                             slozeni=slozeni(l)))
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
    'title': {'text': 'ANO vládne v deseti velkých městech, v osmi z nich se stranami sněmovní opozice',
              'subtitle': 'Rozdělení mandátů v zastupitelstvech 26 statutárních měst a Prahy; plnou barvou kandidátky v dohodnuté koalici, světle ostatní. Stav 4. 11. 2026'},
    '_source': 'ČSÚ – otevřená data komunálních voleb 2026 (mandáty, složení kandidátek); koalice podle zpráv ČTK a regionálních médií ke 4. 11. 2026; mandáty v Karviné a Mostě po rozhodnutí soudů; výpočet DataTimes.cz',
    '_tooltip_colors': TT_BARVY,
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
                         {'field': 'koal', 'title': 'Koalice má mandátů'}, {'field': 'stav', 'title': 'Stav'},
                         {'field': 'slozeni', 'title': 'Složení kandidátky'}]}},
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

# ── Sankey: kdo s kým sedí v dohodnutých koalicích (23 koalic ve 27 městech) ─
# Uzel = strana podle složení kandidátek v koalici (ČSÚ); „místní hnutí“ = kandidátka bez celostátní strany
# (jen nezávislí nebo místní hnutí). Vazba A–B = počet koalic, ve kterých jsou A i B (i na společné kandidátce).
UZLY = ['ANO', 'ODS', 'STAN', 'KDU-ČSL', 'TOP 09', 'Piráti', 'Zelení', 'SOCDEM', 'místní hnutí']
def aktery(m):
    os_ = {l['os']: l for l in m['L']}
    a = set()
    for x in m['c']['kl']:
        l = os_[x]
        jm = {STRANY[s][0] for s in l['slo'] if s in STRANY}
        a |= jm if jm else {'místní hnutí'}
    return a
koal = [(m['nazev'], aktery(m)) for m in mesta if m['c']['kl'] and m['stav'] in ('smlouva', 'dohoda')]
p('\n' + '=' * 78 + f'\nSANKEY – KDO S KÝM V {len(koal)} DOHODNUTÝCH KOALICÍCH\n' + '=' * 78)
mimo = sorted({s for _, a in koal for s in a} - set(UZLY))
assert not mimo, mimo
for n, a in koal:
    p(f"   {n}: {', '.join(s for s in UZLY if s in a)}")
pocet = Counter(s for _, a in koal for s in a)
par = Counter()
for _, a in koal:
    for x, y in combinations(sorted(a, key=UZLY.index), 2):
        par[(x, y)] += 1
p('v kolika koalicích: ' + '; '.join(f'{s} {pocet[s]}' for s in UZLY))
for s in UZLY:
    p(f"   {s:13} → " + ', '.join(f"{t} {par.get((s, t), par.get((t, s), 0))}" for t in UZLY if t != s and par.get((s, t), par.get((t, s), 0))))
p(f"SPD, Motoristé, PRO v koalici: {sum(1 for _, a in koal if a & {'SPD', 'Motoristé', 'PRO'})}")
(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')

# ── Sankey jako statické SVG (sankey.html → <HtmlEmbed> v ChartCard) ────────
def vazba(a, b):
    return par.get((a, b), par.get((b, a), 0))
mesta_par = {}
for n, a in koal:
    for x, y in combinations(sorted(a, key=UZLY.index), 2):
        mesta_par.setdefault((x, y), []).append(NAZ.get(n, n))
poradi = sorted(UZLY, key=lambda s: (s == 'místní hnutí', -pocet[s]))   # místní hnutí dospod
barva = lambda s: TT_BARVY[s]
W, LW, RW, GAP, KOEF, NW = 468, 124, 126, 13, 1.45, 9   # šířka, místo na popisky, mezera uzlů, px na koalici, šířka uzlu
tok = {s: sum(vazba(s, t) for t in UZLY if t != s) for s in UZLY}
Hc = sum(tok[s] * KOEF for s in poradi) + GAP * (len(poradi) - 1)
x0, x1 = LW, W - RW
def pozice():
    y, out = 0, {}
    for s in poradi:
        out[s] = y
        y += tok[s] * KOEF + GAP
    return out
yl, yr = pozice(), pozice()
offl = dict(yl); offr = dict(yr)
cesty, prechody = [], []
for s in poradi:
    for t in poradi:
        v = vazba(s, t) if s != t else 0
        if not v:
            continue
        h = v * KOEF
        a0, b0 = offl[s], offr[t]
        offl[s] += h; offr[t] += h
        cx = (x0 + NW + x1) / 2
        d = (f"M{x0 + NW},{a0:.1f} C{cx},{a0:.1f} {cx},{b0:.1f} {x1},{b0:.1f} L{x1},{b0 + h:.1f} "
             f"C{cx},{b0 + h:.1f} {cx},{a0 + h:.1f} {x0 + NW},{a0 + h:.1f} Z")
        mm = mesta_par[tuple(sorted((s, t), key=UZLY.index))]
        k = 'koalici' if v == 1 else 'koalicích'
        # přechod barvy strany vlevo → šedá uprostřed → barva partnera vpravo (Kateřina 4. 11., jako Flourish)
        gid = f'sg{len(cesty)}'
        prechody.append(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x0 + NW}" y1="0" x2="{x1}" y2="0">'
                        f'<stop offset="0" stop-color="{barva(s)}"/><stop offset="0.5" stop-color="#b9bccb"/>'
                        f'<stop offset="1" stop-color="{barva(t)}"/></linearGradient>')
        cesty.append(f'<path d="{d}" fill="url(#{gid})" fill-opacity="{0.7 if s == "ANO" else 0.38}" class="l" data-s="{s}" data-t="{t}" data-v="{v}">'
                     f'<title>{s} a {t}: spolu v {v} {k} ({", ".join(mm)})</title></path>')
# Uzly jsou přepínače (Kateřina 4. 11., jako ve Flourish): klik na stranu v levém nebo pravém sloupci zvýrazní
# jen její pruhy a u partnerů na druhé straně ukáže počet společných koalic; druhý klik vrátí celý graf.
uzly = []
for s in poradi:
    h = tok[s] * KOEF
    kk = f"{pocet[s]} {'koalice' if pocet[s] < 5 else 'koalic'}"
    tw = 700 if s == 'ANO' else 600
    rect = lambda x, ys: f'<rect x="{x}" y="{ys:.1f}" width="{NW}" height="{max(h, 2):.1f}" fill="{barva(s)}"/>'
    c = '<tspan class="c" font-weight="400" fill="#55597a"></tspan>'
    lev = (f'<text x="{x0 - 8}" y="{yl[s] + max(h, 2) / 2:.1f}" text-anchor="end" dominant-baseline="middle" font-weight="{tw}">{s}{c}'
           f'<tspan x="{x0 - 8}" dy="16" font-weight="400" font-size="12.5" fill="#55597a">{kk}</tspan></text>' if h > 22 else
           f'<text x="{x0 - 8}" y="{yl[s] + 1:.1f}" text-anchor="end" dominant-baseline="middle" font-weight="{tw}">{s}{c} <tspan font-weight="400" font-size="12.5" fill="#55597a">{kk}</tspan></text>')
    prav = f'<text x="{x1 + NW + 8}" y="{yr[s] + max(h, 2) / 2:.1f}" dominant-baseline="middle" font-weight="{tw}">{s}{c}</text>'
    for side, obsah in (('L', rect(x0, yl[s]) + lev), ('R', rect(x1, yr[s]) + prav)):
        uzly.append(f'<g class="n" data-n="{s}" data-side="{side}" role="button" tabindex="0" aria-label="Zvýraznit koalice: {s}">{obsah}</g>')
CSS = ('.l{transition:fill-opacity .2s}.n{cursor:pointer;transition:opacity .2s}.n:focus{outline:none}'
       'svg:not(.sel) .l:hover{fill-opacity:.85}svg.sel .l{fill-opacity:.05}svg.sel .l.on{fill-opacity:.8}'
       'svg.sel .n{opacity:.3}svg.sel .n.on,svg.sel .n.p{opacity:1}')
JS = ("(function(){document.querySelectorAll('.dt-sankey svg:not([data-init])').forEach(function(svg){"
      "svg.setAttribute('data-init','1');var sel=null;"
      "function clear(){svg.classList.remove('sel');svg.querySelectorAll('.on,.p').forEach(function(e){e.classList.remove('on','p')});"
      "svg.querySelectorAll('.c').forEach(function(e){e.textContent=''})}"
      "function pick(g){var n=g.getAttribute('data-n'),L=g.getAttribute('data-side')==='L',k=n+'|'+(L?'L':'R');clear();"
      "if(sel===k){sel=null;return}sel=k;svg.classList.add('sel');g.classList.add('on');"
      "svg.querySelectorAll('.l').forEach(function(p){if(p.getAttribute(L?'data-s':'data-t')!==n)return;p.classList.add('on');"
      "var o=p.getAttribute(L?'data-t':'data-s');svg.querySelectorAll('.n[data-side=\"'+(L?'R':'L')+'\"]').forEach(function(og){"
      "if(og.getAttribute('data-n')===o){og.classList.add('p');og.querySelector('.c').textContent=' · '+p.getAttribute('data-v')}})})}"
      "svg.querySelectorAll('.n').forEach(function(g){g.addEventListener('click',function(){pick(g)});"
      "g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(g)}})})})})();")
svg = (f'<svg viewBox="-4 -10 {W + 8} {Hc + 40:.0f}" width="100%" role="img" xmlns="http://www.w3.org/2000/svg" '
       f'aria-label="Sankeyův diagram: kdo s kým sedí v 23 dohodnutých koalicích. ANO nejčastěji s místními hnutími (6) a s ODS (5), opoziční strany spolu nejčastěji (STAN a TOP 09 10, ODS se STAN, lidovci a TOP 09 po 9)." '
       f'style="font-family:IBM Plex Sans,Arial,sans-serif;font-size:15px;fill:#101432;display:block;max-width:500px;margin:0 auto">'
       f'<style>{CSS}</style><defs>{"".join(prechody)}</defs>'
       + ''.join(cesty) + ''.join(uzly) + '</svg>')
JS += r'''
(function () {
  document.querySelectorAll('.dt-sankey').forEach(function (root) {
    const svg = root.querySelector('svg');
    svg.style.maxWidth = '100%';
    svg.setAttribute('role', 'group');
    const style = document.createElement('style');
    style.textContent = '.dt-sankey{position:relative;width:100%}.dt-sankey svg.sel .l:not(.on){pointer-events:none}.dt-sankey .l{cursor:pointer}.dt-sankey .l:focus{outline:2px solid #101432}.dt-sankey .detail{position:sticky;bottom:12px;box-sizing:border-box;width:100%;padding:18px 48px 18px 20px;background:#fff;color:#101432;border:1px solid #c3c6d8;border-top:3px solid #de1743;border-radius:8px;box-shadow:0 4px 20px #10143222;font:16px/1.5 "IBM Plex Sans",Arial,sans-serif}.dt-sankey .detail[hidden]{display:none}.dt-sankey .detail button{position:absolute;right:8px;top:8px;width:36px;height:36px;border:0;background:transparent;color:#101432;font-size:24px;cursor:pointer}';
    root.appendChild(style);
    const panel = document.createElement('div');
    panel.className = 'detail';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Detail koalice');
    const content = document.createElement('div');
    content.setAttribute('aria-live', 'polite');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Zavřít detail');
    panel.append(content, close);
    root.appendChild(panel);
    let pinned = false;
    let active = null;
    function hide() { panel.hidden = true; pinned = false; }
    close.addEventListener('click', function () { hide(); if (active) active.focus(); });
    root.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); });
    svg.querySelectorAll('.n').forEach(function (node) { node.addEventListener('click', hide); });
    svg.querySelectorAll('.l').forEach(function (path) {
      const title = path.querySelector('title');
      const label = title ? title.textContent : '';
      if (title) title.remove();
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', label);
      function show(pin) {
        if (svg.classList.contains('sel') && !path.classList.contains('on')) return;
        if (pinned && !pin) return;
        active = path;
        pinned = pin;
        content.textContent = label;
        panel.hidden = false;
      }
      path.addEventListener('pointerenter', function () { show(false); });
      path.addEventListener('focus', function () { show(false); });
      path.addEventListener('click', function () { show(true); });
      path.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(true); }
      });
    });
  });
})();

'''
(ART / 'sankey.html').write_text(f'<div class="dt-sankey">{svg}</div>\n<script>{JS}</script>\n', encoding='utf-8')
p(f'sankey zapsán: sankey.html (výška {Hc:.0f} px)')
(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')

# ── Podklad pro carousel a animaci Sankey (_cover_pipeline/sankey.cjs) ──────
sk = dict(uzly=[dict(n=s, barva=barva(s), tok=tok[s], koalic=pocet[s]) for s in poradi],
          vazby=[dict(s=s, t=t, v=vazba(s, t), mesta=mesta_par[tuple(sorted((s, t), key=UZLY.index))])
                 for s in poradi for t in poradi if s != t and vazba(s, t)],
          koalic=len(koal))
(ART / '_cover_pipeline' / 'sankey.json').write_text(json.dumps(sk, ensure_ascii=False, indent=1), encoding='utf-8')


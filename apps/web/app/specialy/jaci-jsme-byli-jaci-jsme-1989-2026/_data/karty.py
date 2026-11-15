# -*- coding: utf-8 -*-
"""
„37 let v 37 číslech“ – karty na rozcestníku speciálu Jací jsme byli, jací jsme (1989 × 2026).

Skript NIC nepočítá z hlavy: každé číslo „tehdy“ a „dnes“ (i čísla v kontextové větě) čte
z výstupů skriptů kapitol (_data_pipeline/cisla.json, dvojice.json, doplnky.json, vysledky.json,
vystup*.txt). U každé karty zapíše `zdroj_soubor` = odkud číslo pochází.

Kontrola: číslo tehdy i dnes (v českém zápisu, jak ho karta ukáže) se musí objevit v textu
kapitoly (index.md), jinak skript skončí chybou. Stejně tak musí existovat kapitola v kapitoly.json.

Spuštění (z kořene repa):
    python apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/karty.py
Výstup: karty.json vedle skriptu.
"""
import json
import re
import sys
from pathlib import Path

TU = Path(__file__).resolve().parent
SPECIAL = TU.parent
WEB = SPECIAL.parents[2]  # apps/web
ARTICLES = WEB / 'app' / 'clanek' / '_articles'
KAPITOLY = json.loads((SPECIAL / 'kapitoly.json').read_text(encoding='utf-8'))
ZDROJ = {k['kapitola']: k['zdroj'] for k in KAPITOLY['kapitoly']}
NAZEV = {k['kapitola']: k['nazev'] for k in KAPITOLY['kapitoly']}
NBSP = ' '


# ---------- čtení vstupů ----------
_cache = {}


def _cesta(kap, soubor):
    return ARTICLES / ZDROJ[kap] / '_data_pipeline' / soubor


def rel(kap, soubor):
    return f'apps/web/app/clanek/_articles/{ZDROJ[kap]}/_data_pipeline/{soubor}'


def js(kap, soubor):
    p = _cesta(kap, soubor)
    if p not in _cache:
        _cache[p] = json.loads(p.read_text(encoding='utf-8'))
    return _cache[p]


def txt(kap, soubor):
    p = _cesta(kap, soubor)
    if p not in _cache:
        _cache[p] = p.read_text(encoding='utf-8')
    return _cache[p]


def rx(kap, soubor, vzor):
    """Najde řádek ve vystup*.txt a vrátí zachycené skupiny jako čísla (čárka i mezera tisíců povoleny)."""
    m = re.search(vzor, txt(kap, soubor), re.M)
    if not m:
        sys.exit(f'CHYBA: vzor {vzor!r} nenalezen v {rel(kap, soubor)}')
    out = []
    for g in m.groups():
        g2 = g.replace(NBSP, '').replace(' ', '').replace(',', '.')
        out.append(float(g2) if re.fullmatch(r'-?\d+(\.\d+)?', g2) else g)
    return out


def dvojice(ukazatel):
    for r in js('prehled', 'dvojice.json'):
        if r['ukazatel'] == ukazatel:
            return r
    sys.exit(f'CHYBA: ukazatel {ukazatel!r} není v dvojice.json')


def doplnek(ukazatel):
    for r in js('prehled', 'doplnky.json'):
        if r['ukazatel'] == ukazatel:
            return r
    sys.exit(f'CHYBA: ukazatel {ukazatel!r} není v doplnky.json')


# ---------- český zápis čísel ----------
def cz(v, des=0):
    """Číslo v českém zápisu: desetinná čárka, pevná mezera mezi tisíci."""
    s = f'{float(v):,.{des}f}'
    return s.replace(',', ' ').replace('.', ',').replace(' ', NBSP)


def _norm(s):
    s = s.replace(NBSP, ' ').replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'\s+', ' ', s)


def v_textu(fraze, text):
    """Fráze/číslo je v textu jako celé slovo (7 nenajde v 17, 1 078 ani v 21 078)."""
    return re.search(r'(?<![\w,])' + re.escape(_norm(fraze)) + r'(?![\w]|,\d)', text) is not None


# ---------- karty ----------
# Každá karta: kapitola, nadpis (teze, jedna myšlenka), tehdy/dnes = (rok, hodnota, desetinná místa),
# jednotka, kontext (smí mít {pole} z `extra`), zdroj (zkratka), zdroj_soubor.
def karty():
    K = []

    def karta(kap, nadpis, tehdy, dnes, jednotka, kontext, zdroj, soubory, extra=None, hrava=False,
              overit=(None, None)):
        # overit: když text kapitoly píše číslo slovy („pětkrát“), ověří se tahle fráze místo čísla
        K.append(dict(kapitola=kap, nadpis=nadpis, tehdy=tehdy, dnes=dnes, jednotka=jednotka,
                      kontext=kontext, extra=extra or {}, zdroj=zdroj, soubory=soubory, hrava=hrava,
                      overit=overit))

    # --- Přehled ---
    r = dvojice('Cizinci trvale a dlouhodobě žijící v ČR')
    karta('prehled', 'Cizinců v Česku žije přes milion',
          (r['rok_tehdy'], r['tehdy'], 0), (r['rok_dnes'], r['dnes'], 0), 'cizinců s trvalým nebo dlouhodobým pobytem',
          'Skok v roce 2022 způsobili uprchlíci z Ukrajiny s dočasnou ochranou, ČSÚ je počítá mezi cizince s dlouhodobým pobytem.',
          'ČSÚ', [rel('prehled', 'dvojice.json')])
    r = dvojice('Automatická bubnová pračka – kolik stojí čistých mezd')
    karta('prehled', 'Pračka stojí čtvrtinu výplaty místo dvou a půl',
          (r['rok_tehdy'], r['tehdy'], 2), (r['rok_dnes'], r['dnes'], 2), 'čisté měsíční mzdy za automatickou pračku',
          'Počítáme z průměrných cen, které ČSÚ sleduje od roku 1989. Dnešní pračka je ale jiný výrobek než tehdejší.',
          'ČSÚ', [rel('prehled', 'dvojice.json')], hrava=True,
          overit=('necelé dvě a půl čisté výplaty', 'necelou čtvrtinu jedné'))
    r = dvojice('Automobil Škoda – kolik stojí čistých mezd')
    karta('prehled', 'Škodovka stojí třetinu výplat co v roce 1989',
          (r['rok_tehdy'], r['tehdy'], 0), (r['rok_dnes'], r['dnes'], 0), 'čistých měsíčních mezd za nové auto Škoda',
          'Dnešní škodovka je jiné auto než tehdejší a v roce 1989 nebylo všechno zboží k dostání hned.',
          'ČSÚ', [rel('prehled', 'dvojice.json')], hrava=True,
          overit=(None, 'v roce 2023 dvanáct'))

    # --- Rodina ---
    s = js('rodina', 'cisla.json')
    karta('rodina', 'Skoro polovina dětí se rodí mimo manželství',
          (1989, s['mimo_pct']['1989'], 1), (2025, s['mimo_pct']['2025'], 1), '% živě narozených dětí',
          'Hranici 40 % podíl překročil v roce 2010, od roku 2015 se drží mezi {od} a {do} %.',
          'ČSÚ', [rel('rodina', 'cisla.json'), rel('rodina', 'vystup.txt')],
          extra=dict(zip(('od', 'do'), (cz(x, 1) for x in rx('rodina', 'vystup.txt', r'od 2015 v pásmu ([\d.]+)–([\d.]+) %')))))
    karta('rodina', 'Nevěsty se vdávají o devět let později',
          (1989, s['vek_nevest']['1989'], 1), (2025, s['vek_nevest']['2025'], 1), 'let – průměrný věk svobodné nevěsty',
          'Ženichové stárli pomaleji, z {zenich_tehdy} na {zenich_dnes} roku.',
          'ČSÚ', [rel('rodina', 'cisla.json')],
          extra={'zenich_tehdy': cz(s['vek_zenichu']['1989'], 1), 'zenich_dnes': cz(s['vek_zenichu']['2025'], 1)})
    md = rx('rodina', 'vystup.txt', r'^podíl dětí matek do 19 let: 1989 ([\d.]+) %, 2025 ([\d.]+) %')
    karta('rodina', 'Matku mladší dvaceti let má jen jedno dítě z padesáti',
          (1989, md[0], 1), (2025, md[1], 1), '% narozených dětí matek do 19 let',
          'Ženám nad čtyřicet se od roku 2014 rodí víc dětí než dívkám do 19 let.',
          'ČSÚ', [rel('rodina', 'vystup.txt')])

    # --- Zdraví ---
    z = js('zdravi', 'cisla.json')
    karta('zdravi', 'Muži se dožívají o devět let víc',
          (1989, z['dozit_muzi']['1989'], 1), (2025, z['dozit_muzi']['2025'], 1), 'let – naděje dožití mužů při narození',
          'Ženy si polepšily z {zeny_tehdy} na {zeny_dnes} roku, rozdíl mezi pohlavími se zmenšil.',
          'ČSÚ', [rel('zdravi', 'cisla.json')],
          extra={'zeny_tehdy': cz(z['dozit_zeny']['1989'], 1), 'zeny_dnes': cz(z['dozit_zeny']['2025'], 1)})
    karta('zdravi', 'Kojenců umírá čtvrtina co v roce 1989',
          (1989, z['kojenecka']['1989'], 1), (2025, z['kojenecka']['2025'], 1), '‰ – zemřelí kojenci na 1 000 živě narozených',
          'Pod pět promile klesla kojenecká úmrtnost už v roce 1999.',
          'ČSÚ', [rel('zdravi', 'cisla.json'), rel('zdravi', 'vystup.txt')])
    karta('zdravi', 'Na nemoci srdce a cév umírá o 29 tisíc lidí méně',
          (1989, z['obeh']['1989'], 0), (2024, z['obeh']['2024'], 0), 'zemřelých na nemoci oběhové soustavy',
          'Do roku 1993 ČSÚ třídil příčiny smrti podle starší klasifikace nemocí, u nemocí srdce a cév se ale řada na švu skoro nezměnila.',
          'ČSÚ', [rel('zdravi', 'cisla.json'), rel('zdravi', 'vystup.txt')])

    # --- Duševní zdraví ---
    d = js('dusevni-zdravi', 'cisla.json')
    karta('dusevni-zdravi', 'Antidepresiv se spotřebuje 25krát víc',
          (1989, d['antidepresiva']['1989'], 1), (2024, d['antidepresiva']['2024'], 1), 'denních dávek na 1 000 obyvatel a den',
          'Kdyby se spotřeba rozdělila rovným dílem, bralo by denní dávku každý den {pct} % obyvatel.',
          'OECD', [rel('dusevni-zdravi', 'cisla.json'), rel('dusevni-zdravi', 'vystup.txt')],
          extra={'pct': cz(rx('dusevni-zdravi', 'vystup.txt', r'^N06A 2024 = denní dávka pro % obyvatel ([\d.]+)')[0], 1)})
    karta('dusevni-zdravi', 'Sebevražd je o třetinu méně',
          (1989, d['sdr']['1989'], 1), (2024, d['sdr']['2024'], 1), 'sebevražd na 100 000 obyvatel (standardizováno podle věku)',
          'Nejméně sebevražd bylo v roce 2019. Mezi lety 2023 a 2024 jejich počet stoupl o čtvrtinu.',
          'WHO', [rel('dusevni-zdravi', 'cisla.json'), rel('dusevni-zdravi', 'vystup.txt')])

    # --- Vzdělávání ---
    v = js('vzdelavani', 'cisla.json')
    karta('vzdelavani', 'Vysokoškoláků je skoro třikrát víc',
          (1991, v['sc_vs_celkem_1991_abs'], 0), (2021, v['sc_vs_celkem_2021_abs'], 0), 'lidí starších 15 let s vysokou školou',
          'Srovnání podle sčítání lidu 1991 a 2021. V roce 2021 vzdělání nevyplnilo {nezj} % lidí, v roce 1991 jen {nezj91} %.',
          'ČSÚ, SLDB', [rel('vzdelavani', 'cisla.json')],
          extra={'nezj': cz(v['sc_nezjisteno_2021'], 1), 'nezj91': cz(v['sc_nezjisteno_1991'], 1)})
    karta('vzdelavani', 'Ženy mají vysokou školu častěji než muži',
          (1993, v['vsps_vs_zeny_1993'], 1), (2025, v['vsps_vs_zeny_2025'], 1), '% žen starších 15 let s VŠ',
          'U mužů podíl vzrostl z {m_tehdy} na {m_dnes} %, ženy je předstihly v roce {rok}.',
          'ČSÚ, VŠPS', [rel('vzdelavani', 'cisla.json')],
          extra={'m_tehdy': cz(v['vsps_vs_muzi_1993'], 1), 'm_dnes': cz(v['vsps_vs_muzi_2025'], 1),
                 'rok': str(v['vsps_zeny_predstihly_podil'])})
    karta('vzdelavani', 'Ve třídě sedí o šest dětí méně',
          ('1989/90', v['zs_na_tridu_1989'], 1), (v['ms_rok_dnes'], v['zs_na_tridu_dnes'], 1), 'žáků na jednu třídu základní školy',
          'Základní škola tehdy měla osm ročníků, devátý vrátil až zákon z roku 1990.',
          'ČSÚ', [rel('vzdelavani', 'cisla.json')])

    # --- Peníze ---
    r = dvojice('Reálná mzda (kupní síla), 1989 = 100')
    karta('penize', 'Výplata koupí skoro dvakrát víc',
          (r['rok_tehdy'], r['tehdy'], 0), (r['rok_dnes'], r['dnes'], 0), 'index reálné mzdy (1989 = 100)',
          'V roce 1991 reálné mzdy klesly o čtvrtinu, na úroveň roku 1989 se vrátily až v roce 1996.',
          'ČSÚ', [rel('prehled', 'dvojice.json'), rel('penize', 'vystup.txt')],
          overit=('1,89krát víc než v roce 1989', '1,89krát víc než v roce 1989'))  # 100 = základ indexu, text píše násobek
    pv = rx('penize', 'vystup.txt', r'Pivo lahvové: cena .*?koupí ([\d\s ]+?) → ([\d\s ]+?) lahví')
    karta('penize', 'Za výplatu koupíme třikrát víc piva',
          (1989, pv[0], 0), (2025, pv[1], 0), 'lahví výčepního piva za průměrnou čistou mzdu',
          'Zhruba trojnásobek koupí výplata i u másla.',
          'ČSÚ', [rel('penize', 'vystup.txt')], hrava=True)
    kd = rx('penize', 'vystup.txt', r'Pánský kadeřník: cena .*?koupí ([\d\s ]+?) → ([\d\s ]+?) stříhání')
    karta('penize', 'U kadeřníka se za výplatu ostříháme třikrát méně',
          (1989, kd[0], 0), (2025, kd[1], 0), 'pánských stříhání za průměrnou čistou mzdu',
          'Část rozdílu dělá změna služby: do roku 2010 ČSÚ sledoval stříhání na sucho, od roku 2011 i s mytím.',
          'ČSÚ', [rel('penize', 'vystup.txt')], hrava=True)

    # --- Bydlení ---
    b = js('bydleni', 'cisla.json')
    karta('bydleni', 'Čtvrtina bytů je v osobním vlastnictví',
          (1991, b['uziv91_v_osobním'], 1), (2021, b['uziv21_v_osobním'], 1), '% obydlených bytů',
          'Družstva převáděla byty do vlastnictví členů, obce a lidová družstva převáděla nebo prodávala nájemní byty.',
          'ČSÚ, SLDB', [rel('bydleni', 'cisla.json')],
          overit=(None, 'čtvrtina'))
    karta('bydleni', 'Na každého připadá o deset metrů bytu víc',
          (1991, b['sc_celkov_plocha_bytu_v_1991'], 1), (2021, b['sc_celkov_plocha_bytu_v_2021'], 1), 'm² celkové plochy bytu na osobu',
          'Domácnosti se zmenšily: v obydleném bytě žilo v roce 1991 v průměru {o_tehdy} osoby, v roce 2021 {o_dnes}.',
          'ČSÚ, SLDB', [rel('bydleni', 'cisla.json')],
          extra={'o_tehdy': cz(b['sc_po_et_osob_na_obydle_1991'], 2), 'o_dnes': cz(b['sc_po_et_osob_na_obydle_2021'], 2)})
    karta('bydleni', 'Postavit dům stojí víc výplat než v roce 1989',
          (1989, b['rd_mezd_1989'], 0), (2024, b['rd_mezd_posl'], 0), 'hrubých měsíčních mezd za stavbu rodinného domu',
          'Jen náklady stavby bez pozemku. Metr čtvereční stojí vůči mzdě skoro stejně, domy jsou ale větší.',
          'ČSÚ', [rel('bydleni', 'cisla.json')])

    # --- Doprava ---
    dp = js('doprava', 'cisla.json')
    karta('doprava', 'Aut na obyvatele je 2,7krát víc',
          tuple(dp['auta_1000_tehdy']) + (0,), tuple(dp['auta_1000_dnes']) + (0,), 'osobních aut na 1 000 obyvatel',
          'V registru zůstávají i auta, která majitelé neodhlásili. Skutečný vozový park je proto menší.',
          'Eurostat', [rel('doprava', 'cisla.json')], hrava=True)
    karta('doprava', 'Na silnicích umírá o polovinu méně lidí',
          (1989, dp['umrti_1989'], 0), (dp['umrti_dnes'][0], dp['umrti_dnes'][1], 0), 'usmrcených do 30 dnů po nehodě',
          'Nejvíc mrtvých bylo v roce {max_rok}, {max}.',
          'ČSÚ', [rel('doprava', 'cisla.json')],
          extra={'max_rok': str(dp['umrti_max'][0]), 'max': cz(dp['umrti_max'][1], 0)})
    karta('doprava', 'Skoro čtyři auta z deseti jezdí na naftu',
          (1997, dp['palivo_podil_1997']['nafta'], 1), (2025, dp['palivo_podil_2025']['nafta'], 1), '% registrovaných osobních aut na naftu',
          'Ministerstvo rozlišuje paliva od roku 1997. Elektromobily dnes tvoří {ev} % osobních aut.',
          'MD ČR', [rel('doprava', 'cisla.json')], hrava=True,
          extra={'ev': cz(dp['palivo_podil_2025']['elektřina'], 2)})

    # --- Ovzduší ---
    o = js('ovzdusi', 'cisla.json')
    karta('ovzdusi', 'Emise síry klesly o 97 %',
          (1990, o['so2_emise']['1990'], 0), (2024, o['so2_emise']['2024'], 1), 'tisíc tun oxidu siřičitého za rok',
          'Řada začíná rokem 1990. Většina poklesu proběhla do roku 2000.',
          'ČSÚ', [rel('ovzdusi', 'cisla.json'), rel('ovzdusi', 'vystup.txt')])
    ust = {x['rok']: x['v'] for x in o['so2_ustecky']}
    karta('ovzdusi', 'Na Ústecku je ve vzduchu skoro osmnáctkrát méně síry',
          (1989, ust[1989], 1), (2025, ust[2025], 1), 'µg/m³ oxidu siřičitého, průměr měřicích stanic Ústeckého kraje',
          'Stanic bylo v roce 1989 v kraji {n0}, loni {n1} a stály jinde. Průměr je proto orientační.',
          'ČHMÚ', [rel('ovzdusi', 'cisla.json'), rel('ovzdusi', 'vystup.txt')],
          extra={'n0': str(next(x['n'] for x in o['so2_ustecky'] if x['rok'] == 1989)),
                 'n1': str(next(x['n'] for x in o['so2_ustecky'] if x['rok'] == 2025))})
    bap = rx('ovzdusi', 'vystup.txt', r'EMISE BaP domácnosti \(t\): 1990 [\d,]+ \((\d+) % celku\) → 2023 [\d,]+ \((\d+) % celku\)')
    karta('ovzdusi', 'Rakovinotvorný kouř dnes jde skoro jen z domácích komínů',
          (1990, bap[0], 0), (2023, bap[1], 0), '% emisí benzo[a]pyrenu z vytápění domácností',
          'Domácí topení vypouští polovinu toho co v roce 1990, ostatní zdroje skoro nic.',
          'ČHMÚ', [rel('ovzdusi', 'vystup.txt')])

    # --- Kriminalita ---
    kr = rx('kriminalita-a-bezpecnost', 'vystup.txt', r'^TC 1989 (\d+) vrchol 1999 (\d+) posl 2025 (\d+)')
    karta('kriminalita-a-bezpecnost', 'Trestných činů je víc než v roce 1989',
          (1989, kr[0], 0), (2025, kr[2], 0), 'registrovaných trestných činů za rok',
          'Vrchol přišel v roce 1999 s {vrchol} činy, od té doby kriminalita klesla o 60 %.',
          'Policie ČR, IKSP', [rel('kriminalita-a-bezpecnost', 'vystup.txt')],
          extra={'vrchol': cz(kr[1], 0)})
    ob = rx('kriminalita-a-bezpecnost', 'vystup.txt', r'^OBJASNENOST 1989 ([\d.]+) .*? 2023 ([\d.]+)$')
    karta('kriminalita-a-bezpecnost', 'Policie objasní méně než polovinu činů',
          (1989, ob[0], 1), (2023, ob[1], 1), '% objasněných trestných činů',
          'Do roku 1988 policie objasnila {od} až {do} % zjištěných činů. Nejméně to bylo v roce 1992.',
          'Policie ČR, IKSP', [rel('kriminalita-a-bezpecnost', 'vystup.txt')],
          extra=dict(zip(('od', 'do'), (cz(x, 0) for x in rx('kriminalita-a-bezpecnost', 'vystup.txt', r'^OBJASNENOST 1973–1988 rozpeti ([\d.]+) ([\d.]+)')))))
    vz = rx('kriminalita-a-bezpecnost', 'vystup.txt', r'^VEZNI k 31\.12\. 1989 (\d+) .*? 2025 (\d+) ([\d.]+)$')
    karta('kriminalita-a-bezpecnost', 'Vězňů je jen o necelou pětinu méně než před revolucí',
          (1989, vz[0], 0), (2025, vz[1], 0), 'vězňů k 31. prosinci',
          'Po amnestii z ledna 1990 bylo na konci roku ve vězení {v90} lidí. V EU má dnes Česko čtvrtý nejvyšší počet vězňů na obyvatele.',
          'ČSÚ', [rel('kriminalita-a-bezpecnost', 'vystup.txt')],
          extra={'v90': cz(rx('kriminalita-a-bezpecnost', 'vystup.txt', r'^VEZNI k 31\.12\. 1989 \d+ [\d.]+ \| 1990 (\d+)')[0])})

    # --- Politika ---
    p = js('politika', 'vysledky.json')
    sn = {x['rok']: x for x in p['snemovna']}
    karta('politika', 'Žen ve Sněmovně je třetina',
          (1990, sn[1990]['zeny_pct'], 0), (2025, sn[2025]['zeny_pct'], 1), '% zvolených poslankyň',
          'Nesvobodná ČNR měla v den revoluce {cnr} % žen, kandidáty ale předem vybrala Národní fronta.',
          'ČSÚ, PSP', [rel('politika', 'vysledky.json')],
          extra={'cnr': cz(p['cnr_1989']['zeny_pct'], 1)})
    st = {x['volby']: x for x in p['strany']}
    karta('politika', 'Do Sněmovny se dostane dvakrát víc stran',
          (1990, st['ČNR 1990']['s_mandaty'], 0), (2025, st['PS 2025']['s_mandaty'], 0), 'stran s mandátem',
          'Počítáme strany, které kandidáty navrhly, koalice SPOLU se tak dělí na tři. V roce 1990 kandidovalo {k_tehdy} stran, loni {k_dnes}.',
          'ČSÚ', [rel('politika', 'vysledky.json')], overit=('mandáty získaly čtyři', 'osmi stran'),
          extra={'k_tehdy': str(st['ČNR 1990']['kandidovalo']), 'k_dnes': str(st['PS 2025']['kandidovalo'])})
    karta('politika', 'Poslanci jsou skoro o pět let starší',
          (1990, sn[1990]['vek'], 1), (2025, sn[2025]['vek'], 1), 'let – průměrný věk zvolených poslanců',
          'Mladších 40 let bylo v ČNR roku 1990 {mladi_tehdy} poslanců, v dnešní Sněmovně {mladi_dnes}.',
          'ČSÚ', [rel('politika', 'vysledky.json')],
          extra={'mladi_tehdy': str(sn[1990]['do_39']), 'mladi_dnes': str(sn[2025]['do_39'])})

    # --- Svoboda ---
    uc = rx('svoboda', 'vystup.txt', r'^UCAST 1990 ([\d.]+) \| posledni 2025 ([\d.]+)')
    karta('svoboda', 'K volbám chodí dva ze tří voličů',
          (1990, uc[0], 1), (2025, uc[1], 1), '% účast ve volbách do ČNR / Sněmovny',
          'Nejméně lidí přišlo v roce 2002. Loňská účast byla nejvyšší od roku 1998.',
          'ČSÚ', [rel('svoboda', 'vystup.txt')])
    sv = rx('svoboda', 'vystup.txt', r'^SVATKY dny pracovniho klidu 1989 (\d+) \| dnes (\d+)')
    karta('svoboda', 'Volných dnů je skoro dvakrát víc',
          (1989, sv[0], 0), (2026, sv[1], 0), 'dní pracovního klidu (svátků) za rok',
          'Volno přibylo na Cyrila a Metoděje, Jana Husa, Den české státnosti, 17. listopad, Velký pátek a Štědrý den.',
          'Sbírka zákonů', [rel('svoboda', 'vystup.txt'), rel('prehled', 'doplnky.json')], hrava=True,
          overit=('sedm dní pracovního klidu', 'dní pracovního klidu třináct'))
    r = doplnek('Věřící (všichni, kdo víru uvedli)')
    karta('svoboda', 'K víře se hlásí polovina lidí co po revoluci',
          (r['rok_tehdy'], r['tehdy'], 1), (r['rok_dnes'], r['dnes'], 1), '% obyvatel, kteří při sčítání uvedli víru',
          'Otázka byla v roce 2021 dobrovolná a {nevypl} % lidí ji nevyplnilo.',
          'ČSÚ, SLDB', [rel('prehled', 'doplnky.json'), rel('svoboda', 'vystup.txt')],
          extra={'nevypl': cz(rx('svoboda', 'vystup.txt', r'^VIRA 2021: .*? neuvedeno ([\d.]+)$')[0], 1)})

    # --- Volný čas ---
    ba = rx('volny-cas', 'vystup.txt', r'^\s*Banány: 1989 ([\d,]+) → 2024 ([\d,]+) kg')
    karta('volny-cas', 'Banánů sníme čtyřikrát víc',
          (1989, ba[0], 1), (2024, ba[1], 1), 'kg banánů na obyvatele za rok',
          'Jižního ovoce celkem sní průměrný obyvatel {j1} kilogramu místo {j0}.',
          'ČSÚ', [rel('volny-cas', 'vystup.txt')], hrava=True,
          extra=dict(zip(('j0', 'j1'), (cz(x, 1) for x in rx('volny-cas', 'vystup.txt', r'Jižní ovoce: 1989 ([\d,]+) → 2024 ([\d,]+) kg')))))
    ki = rx('volny-cas', 'vystup.txt', r'návštěvy kina na obyvatele: 1989 ([\d.]+) \| 2024 ([\d.]+)')
    karta('volny-cas', 'Do kina chodíme čtyřikrát méně',
          (1989, ki[0], 1), (2024, ki[1], 1), 'návštěv kina na obyvatele za rok',
          'Kin ubylo z {kina_tehdy} na {kina_dnes}. Mimo covidové roky měla kina nejméně návštěv v roce 1999.',
          'ČSÚ', [rel('volny-cas', 'vystup.txt')], hrava=True, overit=('pětkrát', 'jednou'),
          extra=dict(zip(('kina_tehdy', 'kina_dnes'), (cz(x, 0) for x in rx('volny-cas', 'vystup.txt', r'Kina \(počet\): 1989 ([\d\s ]+?) → 2024 ([\d\s ]+?)\s\s')))))

    return K


def znak_a_popis(jednotka):
    """Rozdělí jednotku na značku za číslem (%, ‰) a popisek pod čísly."""
    for z in ('% ', '‰ – '):
        if jednotka.startswith(z):
            return {'znak': z.split()[0], 'popis': jednotka[len(z):]}
    if jednotka.startswith('let – '):
        return {'znak': '', 'popis': jednotka[len('let – '):] + ' v letech'}
    return {'znak': '', 'popis': jednotka}


def main():
    out = []
    chyby = []
    for i, k in enumerate(karty(), start=1):
        kap = k['kapitola']
        if kap not in ZDROJ:
            chyby.append(f'#{i}: kapitola {kap} není v kapitoly.json')
            continue
        idx = ARTICLES / ZDROJ[kap] / 'index.md'
        if not idx.exists():
            chyby.append(f'#{i}: chybí {idx}')
            continue
        text = _norm(idx.read_text(encoding='utf-8'))
        (r0, v0, d0), (r1, v1, d1) = k['tehdy'], k['dnes']
        t0, t1 = cz(v0, d0), cz(v1, d1)
        # číslo z karty musí být i v textu kapitoly (v jakémkoli zaokrouhlení, které karta ukazuje)
        for t, o in zip((t0, t1), k['overit']):
            if not v_textu(o or t, text):
                chyby.append(f'#{i} {k["nadpis"]}: číslo {t!r} není v textu {ZDROJ[kap]}/index.md')
        kontext = k['kontext'].format(**k['extra'])
        for e in k['extra'].values():
            if not v_textu(e, text):
                chyby.append(f'#{i} {k["nadpis"]}: číslo v kontextu {e!r} není v textu kapitoly')
        out.append({
            'cislo': i,
            'kapitola': kap,
            'kapitola_nazev': NAZEV[kap],
            'href': f'/specialy/{KAPITOLY["slug"]}/{kap}/',
            'nadpis': k['nadpis'],
            'tehdy': {'rok': r0, 'hodnota': v0, 'text': t0},
            'dnes': {'rok': r1, 'hodnota': v1, 'text': t1},
            'jednotka': k['jednotka'],
            **znak_a_popis(k['jednotka']),
            'kontext': kontext,
            'zdroj': k['zdroj'],
            'zdroj_soubor': k['soubory'],
            'hrava': k['hrava'],
        })
    if len(out) != 37:
        chyby.append(f'karet je {len(out)}, má jich být 37')
    for kap in ZDROJ:
        n = sum(1 for c in out if c['kapitola'] == kap)
        if not 2 <= n <= 4:
            chyby.append(f'kapitola {kap}: {n} karet (má být 2–4)')
    for c in out:
        print(f"{c['cislo']:>2} {c['kapitola']:<26} {c['nadpis']} | {c['tehdy']['rok']}: {c['tehdy']['text']} → "
              f"{c['dnes']['rok']}: {c['dnes']['text']} {c['jednotka']}")
    if chyby:
        print('\nCHYBY:\n  ' + '\n  '.join(chyby))
        sys.exit(1)
    (TU / 'karty.json').write_text(json.dumps({
        '_popis': 'Generuje karty.py z výstupů skriptů kapitol. Ručně neupravovat.',
        'karty': out,
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'\nzapsáno: {TU / "karty.json"} ({len(out)} karet)')


if __name__ == '__main__':
    main()

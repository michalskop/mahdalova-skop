"""Účast a hlasy podle typu obce – volby do Knesetu 27. 10. 2026.

Vstupy (zdroj/):
  vysledky_obce_2026-10-29_0737.csv – expc.csv Ústřední volební komise
      (media26.bechirot.gov.il, stav 29. 10. 2026 7:37 IST, 11 920 místností;
      dvojité obálky v řádku 9999, zatím jen 29 253 hlasů)
  vysledky_obce_2026-10-28_1423.csv – starší snímek (11 168 místností), jen pro kontrolu
  vysledky_obce_2022_konecne.csv – expc.csv ÚVK z voleb 1. 11. 2022
      (media25.bechirot.gov.il, konečné výsledky, Last-Modified 8. 11. 2022);
      dvojité obálky jsou v řádku 9999, obcím nepřičtené – proto je účast
      po obcích 2022 srovnatelná s předběžnými daty 2026 bez obálek
  cbs_obce_2024.csv – výtah z číselníku obcí CBS bycode2024.xlsx
      (cbs.gov.il, Last-Modified 23. 9. 2026)

Typ obce bere z číselníku CBS (sloupec „דת יישוב“), ne z toho, jak obec volila:
  1 = židovská, 2 = arabská, 3 = beduínský kmen v Negevu, 4 = smíšené město.
CBS Drúzy od ostatních arabských obcí neodlišuje; drúzské obce vyčleňujeme
podle seznamu DRUZSKE níže.

Spuštění: python -I -X utf8 obce.py
"""

import csv
from pathlib import Path

ZDROJ = Path(__file__).parent / 'zdroj'
VYSLEDKY = ZDROJ / 'vysledky_obce_2026-10-29_0737.csv'
VYSLEDKY_2022 = ZDROJ / 'vysledky_obce_2022_konecne.csv'
CISELNIK = ZDROJ / 'cbs_obce_2024.csv'

ARABSKE_STRANY = {'ודם': 'Společná kandidátka', 'עם': "Ra'am"}
# 2022: Chadaš–Ta'al, Ra'am, Balad (kandidovaly zvlášť)
ARABSKE_STRANY_2022 = {'ום': "Chadaš–Ta'al", 'עם': "Ra'am", 'ד': 'Balad'}
STRANY = {
    'מחל': 'Likud', 'דרך': 'Jašar', 'ודם': 'Společná kandidátka', 'רק': 'Bejachad',
    'אמת': 'Demokraté', 'ל': "Jisra'el bejtenu", 'עם': "Ra'am", 'ג': 'UTJ',
    'ב': 'Ocma jehudit', 'שס': 'Šas', 'ט': 'Náboženský sionismus',
    'די': 'Záložníci', 'ך': 'Amcha Jisra\'el',
}

# Obce s drúzskou většinou (kód CBS: název). Mughár (481) s Drúzy jen o něco
# nad polovinou a silnými arabskými stranami necháváme mezi arabskými obcemi.
# Golanské obce mají většinu obyvatel bez izraelského občanství, proto málo
# oprávněných voličů.
DRUZSKE = {
    480: "Bejt Džan", 485: 'Džulis', 494: 'Dalijat al-Karmil', 496: 'Hurfejš',
    1295: 'Januh-Džat', 1296: 'Kisra-Sumej', 525: 'Sadžur', 546: 'Ajn al-Asad',
    536: "Peki'in", 502: 'Jarka', 534: 'Usfíja',
    4201: 'Madždal Šams', 4203: "Mas'ada", 4001: "Buk'ata", 4502: 'Ajn Kinja',
}
TYP = {1: 'židovské obce', 2: 'arabské obce', 3: 'beduínské kmeny (Negev)',
       4: 'smíšená města', 'D': 'drúzské obce', None: 'nezařazeno',
       'O': 'dvojité obálky (bez obce)'}
SMISENA = ['Jeruzalém', 'Tel Aviv-Jaffa', 'Haifa', 'Lod', 'Ramla', 'Akko',
           'Nof HaGalil', "Ma'alot-Taršicha"]


def nacti():
    cis = {}
    with open(CISELNIK, encoding='utf-8') as f:
        for r in csv.DictReader(f):
            cis[int(r['kod'])] = r
    with open(VYSLEDKY, encoding='utf-8-sig') as f:
        obce = [r for r in csv.DictReader(f)]
    return cis, obce


def typ_obce(kod, cis):
    if kod in DRUZSKE:
        return 'D'
    r = cis.get(kod)
    if r is None or not r['dat_yisuv']:
        return None
    return int(r['dat_yisuv'])


def main():
    cis, obce = nacti()
    pismena = [k for k in obce[0] if k and k not in
               ('סמל ועדה', 'שם ישוב', 'סמל ישוב', 'בזב', 'מצביעים', 'פסולים', 'כשרים')]
    souhrn = {}
    for r in obce:
        kod = int(r['סמל ישוב'])
        t = 'O' if kod == 9999 else typ_obce(kod, cis)
        # Hebron (3400) chybí v číselníku 2024; jde o židovskou osadu.
        if kod == 3400:
            t = 1
        s = souhrn.setdefault(t, {'obci': 0, 'opr': 0, 'vol': 0, 'plat': 0,
                                  **{p: 0 for p in pismena}})
        s['obci'] += 1
        s['opr'] += int(r['בזב'])
        s['vol'] += int(r['מצביעים'])
        s['plat'] += int(r['כשרים'])
        for p in pismena:
            s[p] += int(r[p] or 0)

    celkem_vol = sum(s['vol'] for s in souhrn.values())
    celkem_plat = sum(s['plat'] for s in souhrn.values())
    assert celkem_vol == 5_224_730 and celkem_plat == 5_201_559, 'nesedí součty s celostátem'
    arab_celkem = {p: sum(s[p] for s in souhrn.values()) for p in ARABSKE_STRANY}
    assert arab_celkem == {'ודם': 476_327, 'עם': 317_999}, arab_celkem

    print('Typ obce | obcí | oprávnění | účast | podíl arab. stran | SK | Ra\'am | podíl na hlasech arab. stran')
    for t in [2, 'D', 3, 4, 1, None, 'O']:
        s = souhrn.get(t)
        if not s:
            continue
        arab = sum(s[p] for p in ARABSKE_STRANY)
        ucast = s['vol'] / s['opr'] if s['opr'] else float('nan')
        print(f"{TYP[t]:24} {s['obci']:5} {s['opr']:9,} {ucast:6.1%}"
              f" {arab / s['plat']:6.1%} {s['ודם'] / s['plat']:6.1%} {s['עם'] / s['plat']:6.1%}"
              f" {arab / sum(arab_celkem.values()):6.1%}")

    print('\nNejsilnější strany podle typu obce (podíl platných hlasů):')
    for t in [2, 'D', 3, 4, 1]:
        s = souhrn[t]
        top = sorted(pismena, key=lambda p: -s[p])[:5]
        print(f"  {TYP[t]}: " + ', '.join(f"{STRANY.get(p, p)} {s[p] / s['plat']:.1%}" for p in top))

    # Arabské obce včetně beduínských kmenů (bez drúzských) – hlavní číslo do textu
    a = {k: souhrn[2][k] + souhrn[3][k] for k in souhrn[2]}
    arab = sum(a[p] for p in ARABSKE_STRANY)
    print(f"\nArabské obce + beduínské kmeny: oprávnění {a['opr']:,}, voliči {a['vol']:,},"
          f" účast {a['vol'] / a['opr']:.1%}, arabské strany {arab / a['plat']:.1%}"
          f" ({arab:,} hlasů = {arab / sum(arab_celkem.values()):.1%} všech hlasů arab. stran)")

    print('\nSmíšená města (arabský podíl obyvatel CBS 2024 × podíl arabských stran):')
    for r in obce:
        kod = int(r['סמל ישוב'])
        c = cis.get(kod)
        if typ_obce(kod, cis) != 4:
            continue
        obyv = int(c['obyv_2024'] or 0)
        arabove = int(c['arabove'] or 0)
        arab = sum(int(r[p]) for p in ARABSKE_STRANY)
        print(f"  {c['nazev_en']:20} arabů {arabove / obyv:5.1%}  účast {int(r['מצביעים']) / int(r['בזב']):5.1%}"
              f"  arab. strany {arab / int(r['כשרים']):5.1%}  ({arab:,} hlasů)")

    print('\nDrúzské obce jednotlivě:')
    for r in obce:
        kod = int(r['סמל ישוב'])
        if kod in DRUZSKE:
            plat = int(r['כשרים'])
            top = sorted(pismena, key=lambda p: -int(r[p] or 0))[:3]
            print(f"  {DRUZSKE[kod]:18} opr. {int(r['בזב']):6,} účast {int(r['מצביעים']) / int(r['בזב']):5.1%}  "
                  + ', '.join(f"{STRANY.get(p, p)} {int(r[p]) / plat:.0%}" for p in top))

    print('\nNejvětší arabské obce:')
    velke = sorted((r for r in obce if typ_obce(int(r['סמל ישוב']), cis) == 2),
                   key=lambda r: -int(r['בזב']))[:12]
    for r in velke:
        plat = int(r['כשרים'])
        print(f"  {cis[int(r['סמל ישוב'])]['nazev_en']:20} opr. {int(r['בזב']):6,} účast {int(r['מצביעים']) / int(r['בזב']):5.1%}"
              f"  SK {int(r['ודם']) / plat:5.1%}  Ra'am {int(r['עם']) / plat:5.1%}")



def srovnani_2022():
    cis, obce26 = nacti()
    with open(VYSLEDKY_2022, encoding='utf-8-sig') as f:
        obce22 = list(csv.DictReader(f))
    obalky = [r for r in obce22 if r['סמל ישוב'] == '9999']
    assert len(obalky) == 1 and int(obalky[0]['בזב']) == 0
    assert sum(int(r['מצביעים']) for r in obce22) == 4_794_593

    def agreguj(obce, strany):
        out, nezar = {}, []
        for r in obce:
            kod = int(r['סמל ישוב'])
            if kod == 9999:
                continue
            t = 1 if kod == 3400 else typ_obce(kod, cis)
            if t is None:
                nezar.append((r['שם ישוב'], int(r['בזב'])))
            s = out.setdefault(t, [0, 0, 0, 0])
            s[0] += int(r['בזב']); s[1] += int(r['מצביעים']); s[2] += int(r['כשרים'])
            s[3] += sum(int(r[p] or 0) for p in strany)
        return out, nezar

    a22, n22 = agreguj(obce22, ARABSKE_STRANY_2022)
    a26, _ = agreguj(obce26, ARABSKE_STRANY)
    print(f"\n2022 nezařazené obce: {len(n22)}, oprávnění {sum(b for _, b in n22):,}")
    print('\nSrovnání 2022 → 2026 (bez dvojitých obálek v obou letech):')
    print('Typ obce | oprávnění 22 → 26 | účast 22 → 26 | arab. strany 22 → 26 | hlasy arab. stran 22 → 26')
    for t in [2, 3, 'D', 4, 1]:
        x, y = a22[t], a26[t]
        print(f"{TYP[t]:24} {x[0]:9,} → {y[0]:9,} ({y[0] / x[0] - 1:+.1%})  {x[1] / x[0]:5.1%} → {y[1] / y[0]:5.1%}"
              f"  {x[3] / x[2]:5.1%} → {y[3] / y[2]:5.1%}  {x[3]:8,} → {y[3]:8,}")
    sl = lambda a, ts: [sum(a[t][i] for t in ts) for i in range(4)]
    for nazev, ts in [('arabské + beduínské', [2, 3]), ('arabské + beduínské + drúzské', [2, 3, 'D'])]:
        x, y = sl(a22, ts), sl(a26, ts)
        print(f"{nazev:30} účast {x[1] / x[0]:5.1%} → {y[1] / y[0]:5.1%}, voliči {x[1]:,} → {y[1]:,} ({y[1] / x[1] - 1:+.0%})")
    x22, x26 = sl(a22, list(a22)), sl(a26, list(a26))
    print(f"všechny obce (bez obálek)        účast {x22[1] / x22[0]:5.1%} → {x26[1] / x26[0]:5.1%}")


if __name__ == '__main__':
    main()
    srovnani_2022()

"""Článek 03 – Svět se mění: všechna čísla z OSN World Population Prospects 2024 (střední varianta).

Použití:  python -X utf8 -I vypocet.py <WPP2024_Demographic_Indicators_Medium.csv.gz> <WPP2024_Demographic_Indicators_Medium_Update.csv>
Druhý soubor je dílčí aktualizace OSN z 19. 1. 2026 (WPP 2024 Interim Update): opravuje jen Togo (odhady 1950–2023, projekce
2024–2100), po zjištění, že OSN u sčítání 2022 dvakrát korigovala podhodnocení. Ostatní země a regionální součty beze změny.
Vytvoří data/wpp_vybrane.csv (vybrané oblasti a země, vybrané roky) a vypíše všechna čísla použitá v textu.

Definice: počet obyvatel = odhad k 1. červenci (sloupec TPopulation1July, tisíce), TFR = úhrnná plodnost
za kalendářní rok. Roky do 2023 jsou odhady, 2024 a dál projekce OSN (WPP 2024 vychází z dat do roku 2023).
"Amerika" = Severní Amerika + Latinská Amerika a Karibik (součet).
"""
import csv
import gzip
import sys

src, upd = sys.argv[1], sys.argv[2]
with gzip.open(src, 'rt', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))
with open(upd, encoding='utf-8-sig') as f:
    upd_rows = list(csv.DictReader(f))

idx = {}
for r in rows:
    idx[(r['Location'], int(r['Time']))] = r
orig_togo = {y: r for (loc, y), r in idx.items() if loc == 'Togo'}
for r in upd_rows:  # aktualizace nahradí jen Togo
    idx[(r['Location'], int(r['Time']))] = r
assert {r['Location'] for r in upd_rows} == {'Togo'}


def val(loc, year, col):
    x = idx[(loc, year)][col]
    return float(x) if x != '' else None


def pop(loc, year):  # miliony, 1. 7.
    return val(loc, year, 'TPopulation1July') / 1000.0


LOCS = ['World', 'Africa', 'Sub-Saharan Africa', 'Asia', 'Europe', 'Northern America',
        'Latin America and the Caribbean', 'Oceania', 'China', 'India', 'Togo', 'Czechia', 'Niger', 'Japan']
YEARS = [1950, 1960, 2000, 2022, 2023, 2024, 2025, 2030, 2035, 2040, 2050, 2084, 2100]
with open('data/wpp_vybrane.csv', 'w', newline='', encoding='utf-8') as out:
    w = csv.writer(out)
    w.writerow(['Location', 'Time', 'TPopulation1July_tis', 'TFR', 'MedianAgePop', 'PopGrowthRate_pct'])
    for loc in LOCS:
        for y in YEARS:
            r = idx[(loc, y)]
            w.writerow([loc, y, r['TPopulation1July'], r['TFR'], r['MedianAgePop'], r['PopGrowthRate']])

print('== Tabulka regionů (mil., 1. 7.; TFR) ==')
for label, parts in [('Svět', ['World']), ('Afrika', ['Africa']), ('Asie', ['Asia']), ('Evropa', ['Europe']),
                     ('Amerika', ['Northern America', 'Latin America and the Caribbean']), ('Oceánie', ['Oceania']),
                     ('Čína', ['China']), ('Togo', ['Togo']), ('Česko', ['Czechia'])]:
    p = {y: sum(pop(x, y) for x in parts) for y in (2000, 2024, 2050)}
    # TFR Ameriky jako vážený průměr podle počtu obyvatel
    tot = sum(pop(x, 2024) for x in parts)
    tfr = sum(val(x, 2024, 'TFR') * pop(x, 2024) for x in parts) / tot
    print(f"{label:8s} 2000: {p[2000]:9.1f}  2024: {p[2024]:9.1f}  2050: {p[2050]:9.1f}  TFR 2024: {tfr:.2f}")

print('\n== Svět ==')
mx = max(((y, pop('World', y)) for y in range(2024, 2101)), key=lambda t: t[1])
print('vrchol světové populace (1. 7.): rok %d, %.2f mld.' % (mx[0], mx[1] / 1000))
print('svět 2022: %.2f mld., 2100: %.2f mld.' % (pop('World', 2022) / 1000, pop('World', 2100) / 1000))
print('TFR svět 1960: %.2f, 2023: %.2f, 2024: %.2f' % (val('World', 1960, 'TFR'), val('World', 2023, 'TFR'), val('World', 2024, 'TFR')))
print('TFR subsaharská Afrika 2024: %.2f, Afrika celkem 2024: %.2f' % (val('Sub-Saharan Africa', 2024, 'TFR'), val('Africa', 2024, 'TFR')))
print('Afrika 2024: %.2f mld., 2050: %.2f, 2100: %.2f' % (pop('Africa', 2024) / 1000, pop('Africa', 2050) / 1000, pop('Africa', 2100) / 1000))
print('Evropa 2024: %.0f mil., 2050: %.0f mil.' % (pop('Europe', 2024), pop('Europe', 2050)))

print('\n== Země s nejvyšší plodností 2024 ==')
c = sorted(((float(r['TFR']), r['Location']) for (loc, y), r in idx.items() if y == 2024 and r['LocTypeName'] == 'Country/Area' and r['TFR']), reverse=True)
for t, n in c[:5]:
    print('  %s %.2f' % (n, t))

print('\n== Medián věku 2024 ==')
for loc in ('Niger', 'Japan', 'Czechia', 'Togo'):
    print('  %s %.1f' % (loc, val(loc, 2024, 'MedianAgePop')))
mm = sorted((float(r['MedianAgePop']), r['Location']) for (loc, y), r in idx.items() if y == 2024 and r['LocTypeName'] == 'Country/Area')
print('  nejmladší: %s %.1f; nejstarší: %s %.1f' % (mm[0][1], mm[0][0], mm[-1][1], mm[-1][0]))

print('\n== Togo vs. Česko (1. 7., mil.; růst Toga %/rok) ==')
for y in range(2022, 2036):
    t, cz = pop('Togo', y), pop('Czechia', y)
    print('  %d Togo %.2f  Česko %.2f  rozdíl %+.2f  růst Toga %.2f %%' % (y, t, cz, t - cz, val('Togo', y, 'PopGrowthRate') / 10 if False else val('Togo', y, 'PopGrowthRate')))
first = next(y for y in range(2024, 2101) if pop('Togo', y) > pop('Czechia', y))
print('první rok, kdy Togo > Česko (WPP 2024, 1. 7.): %d' % first)
print('Togo 2024 / 2050: %.2f / %.2f mil.; Česko 2024 / 2050 / 2100: %.2f / %.2f / %.2f mil.' % (pop('Togo', 2024), pop('Togo', 2050), pop('Czechia', 2024), pop('Czechia', 2050), pop('Czechia', 2100)))

print('\n== Indie vs. Čína ==')
for y in (2021, 2022, 2023, 2024):
    print('  %d Indie %.1f Čína %.1f' % (y, pop('India', y), pop('China', y)))
first = next(y for y in range(1990, 2100) if pop('India', y) > pop('China', y))
print('Indie předstihla Čínu (WPP 2024): rok', first)
print('Čína TFR 2024: %.2f; Čína 1. 7. 2022 -> 2023: %.1f -> %.1f' % (val('China', 2024, 'TFR'), pop('China', 2022), pop('China', 2023)))

# ---------------------------------------------------------------------------------------------
# Česko: údaje ČSÚ (v tabulce a v textu místo odhadů OSN, které jsou nižší – viz README)
# Eurostat demo_gind (= ČSÚ): průměrný stav 2000 = 10 255 063, průměrný stav 2024 = 10 905 028,
# stav k 1. 1. 2025 = 10 909 500; medián věku k 1. 1. 2025 = 44,3 (Eurostat demo_pjanind);
# TFR 2024 = 1,36 (Eurostat demo_find; ČSÚ uvádí 1,37). Rok 2025: TFR 1,28 (ČSÚ).
# Projekce ČSÚ 2023–2100, střední varianta, stav k 1. 1. (CSV z článku 15).
# ---------------------------------------------------------------------------------------------
print('\n== Česko: ČSÚ vs. OSN ==')
cz_csu = {2000: 10.255063, 2024: 10.905028}
proj = {}
with open('../15-volicska-zakladna/data/proj_stredni.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['vek'] == 'celkem':
            proj[int(r['rok'])] = int(r['pocet']) / 1e6
cz_csu[2050] = proj[2050]
for y in (2000, 2024, 2050):
    print('  %d: ČSÚ %.2f mil., OSN (WPP 2024) %.2f mil.' % (y, cz_csu[y], pop('Czechia', y)))
print('  ČSÚ projekce (střední, 1. 1.): ' + ', '.join('%d %.2f' % (y, proj[y]) for y in range(2033, 2040)))

print('\n== Kdy Togo předstihne Česko (Togo: stav k 1. 1. podle aktualizace OSN, Česko: projekce ČSÚ k 1. 1.) ==')
for y in range(2033, 2040):
    t = val('Togo', y, 'TPopulation1Jan') / 1000
    print('  1. 1. %d: Togo %.2f, Česko (ČSÚ) %.2f %s' % (y, t, proj[y], '<-- Togo větší' if t > proj[y] else ''))
first_csu = next(y for y in range(2024, 2100) if val('Togo', y, 'TPopulation1Jan') / 1000 > proj[y])
print('  první rok, kdy Togo > Česko (ČSÚ projekce):', first_csu)

print('\n== Finální tabulka pro článek (mil.; TFR 2024) ==')
def fmt(x):
    return ('%.1f mld.' % (x / 1000)).replace('.', ',') if x >= 999.5 else (('%.0f mil.' % x) if x >= 100 else ('%.1f mil.' % x).replace('.', ','))
rows_tab = [('Svět', ['World']), ('Afrika', ['Africa']), ('Asie', ['Asia']), ('Evropa', ['Europe']),
            ('Amerika', ['Northern America', 'Latin America and the Caribbean']), ('Oceánie', ['Oceania']),
            ('Čína', ['China']), ('Togo', ['Togo'])]
for label, parts in rows_tab:
    p = {y: sum(pop(x, y) for x in parts) for y in (2000, 2024, 2050)}
    tot = sum(pop(x, 2024) for x in parts)
    tfr = sum(val(x, 2024, 'TFR') * pop(x, 2024) for x in parts) / tot
    print('%-8s | %s | %s | %s | %s' % (label, fmt(p[2000]), fmt(p[2024]), fmt(p[2050]), ('%.2f' % tfr).replace('.', ',')))
print('%-8s | %s | %s | %s | %s   (ČSÚ; TFR 2024 podle Eurostatu/ČSÚ 1,36; OSN odhaduje 1,46)' % ('Česko', fmt(cz_csu[2000]), fmt(cz_csu[2024]), fmt(cz_csu[2050]), '1,36'))
print('Europe TFR přímo z WPP: %.2f; Oceania %.2f; Asia %.2f' % (val('Europe', 2024, 'TFR'), val('Oceania', 2024, 'TFR'), val('Asia', 2024, 'TFR')))

print('\n== Podíl lidí žijících v zemích s plodností pod 2,1 (WPP 2024, rok 2024) ==')
tot = under = n = nu = 0
for (loc, y), r in idx.items():
    if y == 2024 and r['LocTypeName'] == 'Country/Area' and r['TFR'] and r['TPopulation1July']:
        p = float(r['TPopulation1July'])
        tot += p; n += 1
        if float(r['TFR']) < 2.1:
            under += p; nu += 1
print('  země s TFR < 2,1: %d z %d; podíl obyvatel: %.0f %%' % (nu, n, under / tot * 100))

print('\n== Podíl Afriky na přírůstku světové populace 2024–2050 a další odvozená čísla ==')
dw = pop('World', 2050) - pop('World', 2024)
da = pop('Africa', 2050) - pop('Africa', 2024)
print('  svět +%.0f mil., Afrika +%.0f mil. = %.0f %% přírůstku' % (dw, da, da / dw * 100))
print('  Evropa 2024 → 2050: %.0f → %.0f mil. (%+.1f %%)' % (pop('Europe', 2024), pop('Europe', 2050), (pop('Europe', 2050) / pop('Europe', 2024) - 1) * 100))
print('  Čína 2024 → 2050: %.0f → %.0f mil.' % (pop('China', 2024), pop('China', 2050)))
print('  Togo TFR 2024 %.2f, 2050 %.2f, 2084 %.2f; růst Toga 2024 %.2f %%' % (val('Togo', 2024, 'TFR'), val('Togo', 2050, 'TFR'), val('Togo', 2084, 'TFR'), val('Togo', 2024, 'PopGrowthRate')))
print('  Čad TFR 2024 %.2f; Niger %.2f; Somálsko %.2f' % tuple(val(c, 2024, 'TFR') for c in ('Chad', 'Niger', 'Somalia')) if ('Somalia', 2024) in idx else '')

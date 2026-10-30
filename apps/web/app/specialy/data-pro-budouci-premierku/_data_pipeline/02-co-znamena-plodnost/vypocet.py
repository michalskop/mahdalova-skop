"""Článek 02 – Co znamená plodnost 1,28: výpočty z dat Eurostatu (CSV z stahni_eurostat.py) a ČSÚ.

Použití:  python -X utf8 -I vypocet.py        (ve složce _data_pipeline/02-co-znamena-plodnost)

Co se počítá:
 1. řada úhrnné plodnosti Česka a její srovnání s EU (rok 2025 = ČSÚ, ruční konstanta níže),
 2. úbytek žen v reprodukčním věku 2015 → 2025 a rozklad poklesu narozených 2015 → 2024 na vliv počtu žen a vliv
    míry plodnosti (standardizace: míry plodnosti jednoho roku × věkové složení žen druhého roku),
 3. generační plodnost (součet věkově specifických měr podél ročníku narození) a její srovnání s úhrnnou plodností,
 4. velikost tempo efektu: jednoduchá Bongaarts–Feeneyova korekce TFR* = TFR / (1 − r), kde r je roční přírůstek
    průměrného věku matek při porodu (bez rozlišení pořadí dítěte – hrubý odhad, ne oficiální ukazatel).
"""
import csv
from collections import defaultdict

# ČSÚ, Nejméně narozených dětí v historii, https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii
CSU_2025 = {'tfr': 1.28, 'narozeni': 77636, 'vek_matek': 30.6, 'vek_prvni': 29.2, 'mimo_manzelstvi_pct': 47}

D = defaultdict(dict)  # (tabulka, ukazatel, geo, vek, pohlavi) -> {rok: hodnota}
with open('data/eurostat_dlouhe.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        D[(r['tabulka'], r['ukazatel'], r['geo'], r['vek'], r['pohlavi'])][int(r['rok'])] = float(r['hodnota'])


def find(ind, geo):
    return D[('demo_find', ind, geo, '', '')]


print('== 1. Úhrnná plodnost ==')
tfr_cz = dict(find('TOTFERRT', 'CZ'))
tfr_eu = find('TOTFERRT', 'EU27_2020')
for y in (1995, 1999, 2000, 2005, 2010, 2015, 2021, 2023, 2024):
    print(' ', y, 'CZ', tfr_cz[y], 'EU27', tfr_eu.get(y))
print('  2025 ČSÚ', CSU_2025['tfr'])
print('  roky s TFR mezi 1,25 a 1,30 (Eurostat):', [y for y, v in sorted(tfr_cz.items()) if 1.25 <= v <= 1.30])
print('  minimum:', min(tfr_cz.items(), key=lambda kv: kv[1]))
print('  EU27 2024 %.2f; vyšší než Česko 2024 (%.2f)?' % (tfr_eu[2024], tfr_cz[2024]))
print('  Zemí s TFR >= 2,1 v EU – viz skript článku 04')

print('\n== 2. Ženy v reprodukčním věku a rozklad poklesu narozených ==')
ages = list(range(15, 50))
pop = {a: D[('demo_pjan', 'NR', 'CZ', 'Y%d' % a, 'F')] for a in ages}
for y in (2015, 2021, 2024, 2025):
    tot = sum(pop[a][y] for a in ages)
    a2534 = sum(pop[a][y] for a in range(25, 35))
    a2633 = sum(pop[a][y] for a in range(26, 34))
    print('  1. 1. %d: žen 15–49: %.0f, 25–34: %.0f, 26–33: %.0f' % (y, tot, a2534, a2633))
w15 = sum(pop[a][2015] for a in ages)
w25 = sum(pop[a][2025] for a in ages)
print('  žen 15–49 2015 → 2025: %+.1f %%' % ((w25 / w15 - 1) * 100))
w2534_15 = sum(pop[a][2015] for a in range(25, 35))
w2534_25 = sum(pop[a][2025] for a in range(25, 35))
print('  žen 25–34 2015 → 2025: %+.1f %%' % ((w2534_25 / w2534_15 - 1) * 100))
print('  žen 26–33 2021 → 2025: %+.0f' % (sum(pop[a][2025] for a in range(26, 34)) - sum(pop[a][2021] for a in range(26, 34))))

asfr = {a: D[('demo_frate', 'NR', 'CZ', 'Y%d' % a, '')] for a in ages}
# Eurostat: míra plodnosti = narození / střední stav žen; používáme stav k 1. 1. daného roku (hrubě)
births_total = {int(y): int(v) for y, v in D[('demo_gind', 'LBIRTH', 'CZ', '', '')].items()}
print('  narozených: 2015 %d, 2024 %d, 2025 %d  (2015 → 2025 %+.1f %%)' % (births_total[2015], births_total[2024], births_total[2025], (births_total[2025] / births_total[2015] - 1) * 100))


def expected(rates_year, pop_year):
    return sum(asfr[a][rates_year] * pop[a][pop_year] for a in ages)


b_15 = expected(2015, 2015)
b_24 = expected(2024, 2024)
b_rates24_pop15 = expected(2024, 2015)  # míry 2024, ženy 2015
b_rates15_pop24 = expected(2015, 2024)  # míry 2015, ženy 2024
print('  model: narozených (míry 2015 × ženy 2015) %.0f, (míry 2024 × ženy 2024) %.0f' % (b_15, b_24))
print('  míry 2015 × ženy 2024: %.0f (vliv počtu a věku žen: %+.1f %%)' % (b_rates15_pop24, (b_rates15_pop24 / b_15 - 1) * 100))
print('  míry 2024 × ženy 2015: %.0f (vliv měr plodnosti: %+.1f %%)' % (b_rates24_pop15, (b_rates24_pop15 / b_15 - 1) * 100))
tot_change = b_24 - b_15
eff_pop = ((b_rates15_pop24 - b_15) + (b_24 - b_rates24_pop15)) / 2
eff_rate = ((b_rates24_pop15 - b_15) + (b_24 - b_rates15_pop24)) / 2
print('  rozklad změny %.0f narozených (2015→2024): ženy %+.0f (%.0f %%), míry plodnosti %+.0f (%.0f %%)' % (tot_change, eff_pop, eff_pop / tot_change * 100, eff_rate, eff_rate / tot_change * 100))
print('  kontrola: TFR z měr plodnosti 2015 = %.2f, 2024 = %.2f' % (sum(asfr[a][2015] for a in ages), sum(asfr[a][2024] for a in ages)))

print('\n== 3. Generační plodnost (součet měr podél ročníku narození, věk = dovršený věk v roce porodu) ==')
tfr_period = {y: sum(asfr[a][y] for a in ages) for y in range(1990, 2025)}
for coh in (1965, 1970, 1975, 1980, 1985):
    got = [(coh + a, a) for a in ages if (coh + a) <= 2024]
    ccf = sum(asfr[a][y] for y, a in got)
    last_age = max(a for _, a in got)
    # TFR v roce, kdy byl ročník ve věku 25 (a 30)
    print('  ročník %d: dosud %.2f dítěte na ženu do věku %d (dokončeno: %s); TFR v jeho 25 letech (%d) %.2f, ve 30 letech (%d) %.2f' % (
        coh, ccf, last_age, 'ano' if last_age >= 49 else 'ne', coh + 25, tfr_cz.get(coh + 25, float('nan')), coh + 30, tfr_cz.get(coh + 30, float('nan'))))
# průběh generace 1975 vs. 1985 – kumulativně do věku 39
for coh in (1975, 1980, 1985):
    c = sum(asfr[a][coh + a] for a in range(15, 40) if coh + a <= 2024)
    print('  ročník %d: do věku 39 let (nebo do roku 2024): %.2f' % (coh, c))

print('\n== 4. Tempo efekt (hrubá Bongaarts–Feeneyova korekce z průměrného věku matek) ==')
age_m = find('AGEMOTH', 'CZ')
age_m1 = find('AGEMOTH1', 'CZ')
for y0, y1 in ((1995, 2005), (2005, 2015), (2015, 2024), (2019, 2024)):
    r = (age_m[y1] - age_m[y0]) / (y1 - y0)
    r1 = (age_m1[y1] - age_m1[y0]) / (y1 - y0)
    print('  %d–%d: věk matek %.1f → %.1f (%+.2f roku ročně), věk při 1. dítěti %.1f → %.1f (%+.2f ročně)' % (y0, y1, age_m[y0], age_m[y1], r, age_m1[y0], age_m1[y1], r1))
for y, y0 in ((1999, 1995), (2005, 2000), (2015, 2010), (2024, 2019)):
    r = (age_m[y] - age_m[y0]) / (y - y0)
    print('  rok %d: TFR %.2f, r (5 let zpětně) = %+.3f → TFR* = %.2f' % (y, tfr_cz[y], r, tfr_cz[y] / (1 - r)))
print('  2025 (ČSÚ): věk matek %.1f, věk při 1. dítěti %.1f' % (CSU_2025['vek_matek'], CSU_2025['vek_prvni']))
r_5y = (CSU_2025['vek_matek'] - age_m[2020]) / 5
print('  2025: r (2020–2025) = %+.3f → TFR* = %.2f' % (r_5y, CSU_2025['tfr'] / (1 - r_5y)))

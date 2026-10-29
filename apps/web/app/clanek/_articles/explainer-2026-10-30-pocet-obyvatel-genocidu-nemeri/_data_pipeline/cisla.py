"""Čísla z primárních zdrojů (ověřeno v plném textu 29. 10. 2026) a výpočty, na kterých stojí text a grafy.

Každá konstanta má u sebe zdroj. Spuštění: python -I cisla.py (vypíše všechna čísla použitá v článku).
"""
import sys

sys.stdout.reconfigure(encoding="utf-8")

# --- Gaza: počet obyvatel (Palestinský statistický úřad, PCBS) ---
# Předválečná projekce k polovině roku, tabulka „Projected Population in the Palestine“
# (PCBS 2023, Revised Estimates based on Census 2017), pcbs.gov.ps
PROJEKCE = {2022: 2_166_269, 2023: 2_226_544, 2024: 2_287_558, 2025: 2_349_301, 2026: 2_411_790}
# Válečné odhady PCBS:
# polovina 2024: 2 129 724 („6 % from what was estimated for mid 2024“), zpráva ke Dni populace 2025
# polovina 2025: 2 114 301, https://www.pcbs.gov.ps/portals/_pcbs/PressRelease/Press_En_WPD2025E.pdf
# konec 2025: „2.13 million“, úbytek 254 000 = 10,6 % proti předválečné projekci,
#   https://www.pcbs.gov.ps/portals/_pcbs/PressRelease/Press_En_PalPeopleEnd2025E.pdf
ODHAD = {2024.5: 2_129_724, 2025.5: 2_114_301, 2026.0: 2_130_000}
DETI_PODIL = 47  # % obyvatel Gazy mladších 18 let (PCBS, konec 2024 i Den populace 2025)

# --- Gaza: oběti podle ministerstva zdravotnictví v Gaze, převzaté OCHA (Reported impact snapshot) ---
ZABITI = {
    "31. 12. 2024": 45_541,   # ochaopt.org/content/reported-impact-snapshot-gaza-strip-31-december-2024
    "28. 5. 2025": 54_084,    # ochaopt.org/content/reported-impact-snapshot-gaza-strip-28-may-2025
    "8. 10. 2025": 67_183,    # OCHA Humanitarian Situation Update #329 (den před příměřím 10. 10. 2025)
    "21. 10. 2026": 74_494,   # Gaza_Reported_Impact_Snapshot_21_October_2026.pdf
}
# Lancet Global Health 2026, Spagat a kol.: průzkum 2 000 domácností, násilná úmrtí 7. 10. 2023 – 5. 1. 2025
LANCET_NASILNA, LANCET_DOLNI, LANCET_HORNI = 75_200, 63_600, 86_800
LANCET_MZ = 49_090  # číslo ministerstva za stejné období, o 34,7 % pod centrálním odhadem studie

# --- Gaza: porody a odchody ---
NAROZENI_2022 = 57_877       # registrovaní živě narození v Gaze 2022, PCBS (MAINBRD-2022-E)
PORODY_DENNE = 180           # UNFPA, situační zpráva 24. 1. 2024; totéž UNFPA/UNIFEED 10. 9. 2026
PORODY_1H_2025, PORODY_1H_2022 = 17_000, 29_000  # UNFPA 23. 7. 2025 (data ministerstva zdravotnictví)
ODESLI = 110_000             # OCHA Humanitarian Situation Update #187, 5. 7. 2024: odchody přes Egypt

# --- Srovnání: kolik příslušníků cílové skupiny bylo zavražděno ---
# (skupina, zabití, velikost skupiny, zdroj, právní stav)
SKUPINY = [
    ("Tutsiové ve Rwandě, 1994", 507_000, 657_000,
     "HRW 1999 Leave None to Tell the Story: nejméně 507 000 z odhadem 657 000", "genocida: ICTR (Akayesu 1998)"),
    ("Evropští Židé, 1933–1945", 6_000_000, 9_500_000,
     "USHMM: zhruba 9,5 milionu Židů v Evropě (1933), zavražděno 6 milionů", "holokaust, vzor pro Úmluvu z roku 1948"),
    ("Čamové v Kambodži, 1975–1979", 90_000, 250_000,
     "Ben Kiernan: z 250 000 Čamů zemřelo 90 000", "genocida: tribunál ECCC (2018)"),
    ("Bosňáci v enklávě Srebrenica, 1995", 8_000, 40_000,
     "ICTY Krstić 2004: asi 40 000 bosenských muslimů v enklávě, 7 000–8 000 zavražděných mužů a chlapců", "genocida: ICTY 2004, ICJ 2007"),
    ("Jezídové v Sindžáru, 2014", 3_100, 400_000,
     "PLOS Medicine 2017: 3 100 zabitých (a 6 800 unesených) z asi 400 000", "genocida: komise OSN 2016, soud ve Frankfurtu 2021"),
]
GAZA_PRED_VALKOU = PROJEKCE[2023]


def pct(a, b):
    return a / b * 100


if __name__ == "__main__":
    print("== Gaza: obyvatelé ==")
    for rok, n in ODHAD.items():
        rp = int(rok)
        proj = PROJEKCE[rp] if rok % 1 else (PROJEKCE[rp - 1] + PROJEKCE[rp]) / 2  # konec roku = průměr dvou polovin
        print(f"{rok}: odhad {n:,} | projekce {proj:,.0f} | rozdíl {n - proj:,.0f} ({pct(n - proj, proj):.1f} %) | "
              f"proti polovině 2023: {n - GAZA_PRED_VALKOU:,} ({pct(n - GAZA_PRED_VALKOU, GAZA_PRED_VALKOU):.1f} %)")
    print("\n== Gaza: oběti ==")
    for d, n in ZABITI.items():
        print(f"{d}: {n:,} zabitých = {pct(n, GAZA_PRED_VALKOU):.1f} % předválečné populace (polovina 2023)")
    print(f"Lancet: {LANCET_NASILNA:,} ({LANCET_DOLNI:,}–{LANCET_HORNI:,}) = {pct(LANCET_NASILNA, GAZA_PRED_VALKOU):.1f} %; "
          f"ministerstvo {LANCET_MZ:,} je o {pct(LANCET_NASILNA - LANCET_MZ, LANCET_NASILNA):.1f} % níž")
    dni = (31 + 30 + 31 - 6) + 366  # 7. 10. 2023 – 31. 12. 2024 včetně
    print(f"7. 10. 2023 – 31. 12. 2024: {dni} dní, {ZABITI['31. 12. 2024'] / dni:.0f} zabitých denně vs. {PORODY_DENNE} porodů denně (UNFPA)")
    print(f"Porody 1. pololetí 2025 vs 2022: {pct(PORODY_1H_2025 - PORODY_1H_2022, PORODY_1H_2022):.0f} %")
    print(f"Narození 2022: {NAROZENI_2022:,} = {NAROZENI_2022 / 365:.0f} denně")
    print("\n== Podíl zavražděných v cílové skupině ==")
    for nazev, z, n, *_ in SKUPINY:
        print(f"{nazev}: {z:,} z {n:,} = {pct(z, n):.1f} %")
    print(f"Gaza (k 21. 10. 2026, ministerstvo): {ZABITI['21. 10. 2026']:,} z {GAZA_PRED_VALKOU:,} = "
          f"{pct(ZABITI['21. 10. 2026'], GAZA_PRED_VALKOU):.1f} %")

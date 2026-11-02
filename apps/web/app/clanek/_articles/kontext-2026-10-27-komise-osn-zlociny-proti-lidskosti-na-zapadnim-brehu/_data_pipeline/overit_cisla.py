"""Ověří, že čísla v článku sedí se zprávou komise OSN A/81/430.

Zdroj: Report of the Independent International Commission of Inquiry on the
Occupied Palestinian Territory, including East Jerusalem, and Israel,
A/81/430, advance unedited version, 14. 10. 2026, zveřejněno 26. 10. 2026.
PDF: https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/coiopt/ga-81-430-auv.pdf
Text vytažen pypdf 27. 10. 2026 do zdroj/A-81-430-auv.txt.

Čísla, která zpráva neobsahuje (převzatá z médií), jsou v seznamu MIMO_ZPRAVU
s uvedením zdroje. Spuštění: python -I overit_cisla.py
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).parent
zprava = re.sub(r"\s+", " ", (HERE / "zdroj" / "A-81-430-auv.txt").read_text(encoding="utf-8"))
# pypdf vkládá mezery doprostřed slov ("Commissio n"), proto porovnáváme bez mezer
zprava_bez = zprava.replace(" ", "")

# (číslo v článku, výňatek ze zprávy, který ho dokládá)
VE_ZPRAVE = [
    ("1 080 zabitých, 237 chlapců, 7 dívek", "1,080 Palestinians (including at least 784 men, 237 boys, 22 women and seven girls)"),
    ("10 940 zraněných", "10,940 were injured"),
    ("6 obětí náletů 2008–6. 10. 2023", "Between 2008 and 6 October 2023, six Palestinians were killed by airstrikes"),
    ("254 obětí náletů do 30. 9. 2026", "254 Palestinians were killed"),
    ("34 176 vysídlených", "34,176 Palestinians remaining displaced as of August 2026"),
    ("~95 % zabití izraelskými silami", "approximately 95 percent of killings"),
    ("200 metrů, Eygi", "approximately 200-metre range"),
    ("5. 6. 2026 miminko", "on 5 June 2026, a seven-month-old baby was killed"),
    ("Gaza po příměří 1 431 mrtvých", "over 1,431 people being killed, including at least 300 children and 130 women"),
    ("5 026 zraněných", "5,026 injured as of 30 September 2026"),
    ("53 → 60 %", "from 53 percent of Gaza envisaged under the ceasefire agreement to at least 60 percent"),
    ("9 nových základen", "at least nine new military bases"),
    ("70 % Gazy", "seize 70 percent of Gaza"),
    ("196 mrtvých u Žluté linie", "at least 196 Palestinians were killed near the Yellow Line, including 18 women, 32 boys and 11 girls"),
    ("75 000 / 21 500 / 11 000", "Over 75,000 Palestinians across the Occupied Palestinian Territory have been killed since 7 October 2023, including at least 21,500 children, and 11,000 women"),
    ("14 zabitých palestinskými silami", "killing of at least 14 Palestinians"),
    ("2 žádosti, bez odpovědi Izraele", "two requests for information to the Government of Israel"),
    ("Smotrich: Džabálija", "must look like Jabalia"),
    ("Bluth: od roku 1967", "killing like we haven"),
    ("šest případů Sde Teiman", "additional six cases of sexual violence and torture against male detainees from Gaza in Sde Teiman"),
]

MIMO_ZPRAVU = [
    ("74 000 mrtvých v Gaze", "ministerstvo zdravotnictví v Gaze, podle Reuters a AP 26. 10. 2026"),
    ("1 200 mrtvých a 251 unesených 7. 10. 2023", "AP 26. 10. 2026"),
    ("3 189 vystěhovaných z Hebronu", "hebronská radnice, podle Le Monde/AFP 26. 10. 2026"),
    ("9. 10. 2026 Nobelova cena pro Pillayovou", "Norský Nobelův výbor, Al-Džazíra 9. 10. 2026"),
]

chyby = 0
for cislo, vynatek in VE_ZPRAVE:
    ok = vynatek.replace(" ", "") in zprava_bez
    chyby += not ok
    print(("OK   " if ok else "CHYBÍ"), cislo)
print("\nMimo zprávu (zdroj uveden v článku):")
for cislo, zdroj in MIMO_ZPRAVU:
    print("  -", cislo, "|", zdroj)
sys.exit(1 if chyby else 0)

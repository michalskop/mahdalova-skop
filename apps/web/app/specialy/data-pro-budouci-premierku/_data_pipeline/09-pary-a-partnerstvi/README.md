# Článek 09 – Páry a partnerství (zdroje a postup)

Revize 28. 10. 2026. Čísla z Eurostatu počítá `vypocet.py` (veřejné API, výstup `data/vypis.txt` a CSV v `data/`).

## Eurostat (stažení 28. 10. 2026)
| Údaj v textu | Datová sada, filtr | Definice a limity |
|---|---|---|
| Podíl 25–49letých žijících v páru: CZ 48,7 % (2006) → 57,3 % (2025); EU27 50,4 % (2009) → 50,8 % (2025); 18–24 let CZ 8,9 → 13,9 % | `lfst_hhaceday`, sex=T, age=Y25-49 / Y18-24, phhcomp=A_CPL děleno TOTAL (počet dospělých v domácnosti s partnerem / všichni dospělí), n_child=TOTAL, agechild=TOTAL | Výběrové šetření pracovních sil, soukromé domácnosti. Počítá páry ve společné domácnosti (manželské i nesezdané), nezachytí páry s oddělenými byty. Věk 25–34 nelze oddělit; meziroční kolísání 1–3 p. b. (skok 2022→2023 o 2,9 p. b.). Změna věkového složení pásma 25–49 může mírně zvyšovat podíl. |
| Rodinný stav 25–34letých k 1. 1.: svobodných 64,0 % (2014) → 66,6 % (2025), ženatých/vdaných 31,7 → 30,8 % | `demo_pjanmarsta`, sex=T, jednoleté věky 25–34 (řada od 2014) | Registrový právní stav, partnerství bez sňatku nezachycuje. |
| Průměrný věk při 1. sňatku: muži 31,3 (2013), 33,0 (2023), 33,1 (2024); ženy 28,5, 30,4, 30,4 | `tps00014` (MAGEMAR1, FAGEMAR1) | |
| Průměrný věk matky při 1. dítěti CZ: 25,0 (2000), 27,6 (2010), 28,5 (2020), 29,0 (2024); EU27 29,9 (2024); všech porodů 30,5 | `demo_find` (AGEMOTH1, AGEMOTH) | |
| Narozených mimo manželství: 21,8 % (2000), 40,3 % (2010), 48,5 % (2020), 47,0 % (2024); EU27 41,1 % (2024) | `demo_find` (NMARPCT) | |
| Ženy s terciárním vzděláním (ISCED 5–8): 25–64 let 9,9 % (2001), 12,6 % (2007), 29,4 % (2021), 32,5 % (2025); 25–34 let 11,5 % (2001), 43,5 % (2025) | `edat_lfse_03`, sex=F | LFS. |

## Další zdroje
| Zdroj | URL | SHA-256 |
|---|---|---|
| GGP-CZ, Současná česká rodina: Rodičovství jako životní povinnost? (leták, 73 % → 41 %, 18–29 let 65 % → 22 %, věk 18–69 let; muži 55 → 31 %) | https://ggp-cz.fss.muni.cz/media/3773385/rodicovstvi.pdf | `80376ac0830d2cf99c7abead499773ff6e3979fefa31c6bd155f5cf702463835` |
| GGP-CZ, Partnerství v populaci (leták, data 2020–2022, věk 19–69; „více než 40 % mužů do 29 let nezadaných“) | https://ggp-cz.fss.muni.cz/media/4019527/partnerstvi_v_populaci_letak_ggs.pdf | `31b9e07ef338b69cf101dc46af871175e547607791bf71190c7f8937a61de5b6` |
| Alice Evans, The Global Collapse of Coupling & Fertility (Substack, 13. 1. 2025) | https://www.ggd.world/p/the-global-collapse-of-coupling-and | (web, bez souboru) |
| Geruso, Spears, Childless or Child-fewer? NBER WP 33913 (6/2025): bezdětnost vysvětluje ~38 % poklesu dokončené plodnosti ve vyspělých ekonomikách | https://www.nber.org/papers/w33913 | (abstrakt) |
| Korea: JoongAng Daily 28. 3. 2023 (280 bilionů wonů / 215 mld USD za 2006–2021); Korea Times 26. 8. 2026 (porody 2025: 254 300, TFR 0,8); Reuters přes FMT 25. 2. 2026 (TFR 0,75 → 0,80, sňatky +14,8 % 2024, +8,1 % 2025) | viz odkazy v článku | |

## Co nebylo možné ověřit (a proč je v textu opraveno)
- „Podíl lidí 25–34 let v manželství nebo soužití 68 % (2001) → 58 % (2021)“: v otevřených datech sčítání 2021 je jen právní rodinný stav, ne soužití, a v původním textu nebyl zdroj. Nahrazeno řadami výše. Pokud autorka zdroj má, ať ho doplní.
- „Čtyři skupiny faktorů“ připisované Evans a tvrzení, že pokles párů je nejrychlejší u vzdělanějších žen: v eseji Evans není, esej říká opak (pokles u méně vzdělaných).
- Průměrný věk ženicha při 1. sňatku 24,4 (1990): Eurostat řada začíná 2013, ČSÚ řadu od 1990 jsme nedohledali; vypuštěno.
- Geruso a Spears v JEP 2026 (doi 10.1257/jep.20251463): přesné procento v časopisecké verzi jsme neověřili, uvádíme pracovní verzi NBER (38 %).
- Jihokorejské údaje jsou z agenturních a novinových zpráv; primární zdroj je statistický úřad Koreje (KOSTAT / Ministry of Data and Statistics).

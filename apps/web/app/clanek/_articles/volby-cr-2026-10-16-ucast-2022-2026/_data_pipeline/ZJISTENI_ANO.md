# Klesala účast víc tam, kde je silné ANO? Podklad k rozhodnutí (nepublikováno)

Interní podklad k článku `volby-cr-2026-10-16-ucast-2022-2026`, 16. 10. 2026. Do článku zatím nic nejde.
Čísla pocházejí z `analyza_ano.py` (výstup je v `analyza_ano.txt` a `analyza_ano.json`). Zdroj tvoří otevřená data ČSÚ: KV 2022 a 2026, Senát 2022 a 2026 a sněmovní volby 2025 (`PS2025data20251005_csv.zip`).

## Pracovní věta

Ve 99 městech s více než 10 000 voliči klesala účast víc tam, kde loni silně vyhrálo ANO. Stejně silně ale klesala i tam, kde je silná SPD a kde lidé méně chodí k volbám vůbec. Za celou republiku je souvislost slabá. Data tedy hypotézu „účast padala kvůli voličům ANO“ nepotvrzují. Ukazují jen, že padala ve stejných (sociálně slabších, hlavně severozápadních a severomoravských) městech, kde ANO vítězí nejvýrazněji.

## Co vyšlo

**1. Celá republika (6 239 obcí): souvislost je slabá.**
- Spearmanova korelace podílu ANO a změny účasti je −0,03 za všechny obce a −0,05 za obce nad 500 voličů. Vážená počtem voličů vychází −0,09.
- Pětiny obcí podle síly ANO (souhrnná změna účasti / medián obcí):
  - nejslabší ANO (3,6–30,5 %): +2,56 p. b. / +2,12
  - nejsilnější ANO (45,4–76,6 %): +0,59 p. b. / +1,15
- Rozdíl tedy existuje, ale ve všech pětinách účast v průměru *rostla*. V pětině nejsilnějšího ANO má nižší účast 541 z 1 248 obcí, v pětině nejslabšího 464.
- Regrese pro obce nad 500 voličů s kontrolou senátu, velikosti a kraje: −0,5 p. b. změny účasti na každých +10 p. b. ANO (± 0,6). Výsledek je statisticky neprůkazný. Když se obce váží počtem voličů (bez Prahy), vychází −0,9 ± 0,4. Tahle varianta je průkazná, ale táhnou ji velká města.

**2. Senát: souběžné senátní volby jsou silnější faktor než ANO.**
- „Jen 2026“ (senát letos, v roce 2022 ne) přidává zhruba +1,5 p. b. a „jen 2022“ ubírá zhruba −1,1 až −1,9 p. b. (podle modelu). Je to víc než rozdíl mezi krajními pětinami ANO.
- Uvnitř senátních skupin je spád podle ANO vidět ve skupinách „ani jednou“ (+2,33 → +0,31) a „jen 2026“ (+4,59 → +1,00). Ve skupině „jen 2022“ chybí (+1,21 → +0,35, mezi tím bez trendu).

**3. Velikost obce: vzorec se objevuje skoro jen ve městech.**
- Obce do 500 voličů a obce s 500–2 000 voliči mají mezi pětinami ANO rozdíl kolem 1 p. b. a bez jasného spádu.
- Města s 5–10 tisíci voliči (111 měst): ρ = −0,31, pětiny +3,54 → +1,62 p. b.
- **Města nad 10 000 voličů (99 měst): ρ = −0,48.** Pětiny podle ANO:

  | ANO 2025 | měst | účast 2022 | změna účasti | s poklesem |
  |---|---|---|---|---|
  | 19,7–32,0 % | 19 | 42,6 % | +1,83 p. b. | 4 |
  | 32,1–34,6 % | 20 | 41,9 % | +1,24 | 5 |
  | 34,6–38,6 % | 20 | 40,4 % | +0,53 | 8 |
  | 39,0–43,6 % | 20 | 36,9 % | +0,09 | 12 |
  | 43,8–59,5 % | 20 | 34,9 % | −2,24 | 15 |

  Nejsilnější ANO a pokles účasti mají Karviná (59,5 %; −2,7 p. b.), Orlová (57,4 %; −3,9), Bílina (54,9 %; −3,1), Bohumín (50,5 %; −3,5), Havířov (50,2 %; −3,6) a Most (49,7 %; −2,1).

## Proč to nejspíš není „efekt ANO“ (alternativní vysvětlení)

1. **ANO tu zastupuje sociální strukturu města.** Ve městech nad 10 000 voličů souvisí změna účasti se silou SPD stejně silně jako se silou ANO (ρ −0,47 proti −0,48). Opačně, kladně, s ní souvisí SPOLU (+0,50), Piráti (+0,40) a STAN (+0,32). Nejsilněji ze všeho souvisí s **účastí ve sněmovních volbách 2025** (+0,52). Ta měří, jak moc lidé v daném městě chodí k volbám vůbec, a s podílem ANO ji pojí korelace −0,80. Když se do modelu měst dá účast ve sněmovních volbách, podíl ANO přestane být průkazný (−0,7 ± 0,9 p. b. na 10 p. b.). Účast průkazná zůstane.
2. **Regionální soustředění.** Ve 34 městech Ústeckého, Moravskoslezského a Karlovarského kraje je ρ −0,49. V 65 městech mimo tyto tři kraje jen −0,15, což je neprůkazné. Jde o stejný severozápadní a severomoravský vzorec, který popisuje vydaný článek.
3. **Nízká výchozí účast.** Silné ANO má nízkou účast už v roce 2022 (ρ −0,65 ve městech). Vydaný článek ukazuje, že účast klesala hlavně tam, kde byla nízká už předtím. Pozor na metodu: modely s *účastí 2022* jako kontrolou vycházejí pro ANO „silněji“ (−1,7 až −2,3), jenže jde o artefakt. Změna účasti a účast 2022 sdílejí tutéž náhodnou chybu (návrat k průměru), proto jako kontrolu používám účast ve sněmovních volbách 2025, která tuto chybu nemá.
4. **Ekologický klam.** Data jsou po obcích, ne po lidech. I kdyby souvislost byla silná, neříká, že doma zůstali právě voliči ANO. ANO v komunálních volbách kandiduje jen v části obcí a mnoho jeho voličů volí místní sdružení.
5. **Neověřitelné vysvětlení „spokojenost po vítězství“.** Demobilizaci voličů vítězné strany rok po volbách z těchto dat nelze odlišit od sociální struktury. Do textu bych ji dával nanejvýš jako otázku, ne jako zjištění.

## Doporučení

- **Samostatný text z toho nebude.** Nejsilnější hypotéza zní „účast padala ve městech s nízkou volební aktivitou, hlavně v Ústeckém, Moravskoslezském a Karlovarském kraji“, a tu už článek má. Titulek typu „Kde vládne ANO, lidé přestali volit“ by stál na slabší hypotéze (manuál, část VI).
- **Hodí se jako krátký doplněk** (odstavec nebo infobox pod graf měst), formulovaný zhruba takto: *Ve městech, kde loni nejvíc vyhrálo ANO, účast klesala častěji: v pětině měst s nejsilnějším ANO klesla v 15 z 20, v pětině s nejslabším ve 4 z 19. Stejný vzorec ale platí i pro SPD a pro města, kde lidé méně chodí ke sněmovním volbám. Za celou republiku je souvislost slabá a mimo Ústecký, Moravskoslezský a Karlovarský kraj ve městech skoro mizí.* (Před vložením ověřit čísla proti `analyza_ano.txt`, přečíst manuál a projít checklist části VII.)
- Kdyby z toho měla být samostatná analýza, chybí sociální data za obce: podíl lidí v exekuci, nezaměstnanost, vzdělání (SLDB 2021) nebo vyloučené lokality. Teprve s nimi by šlo poctivě rozlišit „ANO“ od „chudších měst“.

## Kontroly výpočtu

- ANO za ČR bez zahraničí vychází 34,67 %. Z týchž dat včetně zahraničí, kde je ANO slabé, vychází 34,52 % (1 940 507 z 5 621 717 platných hlasů). Účast ve sněmovních volbách bez zahraničí vychází 68,9 %.
- Do analýzy vstoupilo všech 6 239 obcí, které měly komunální volby v obou letech. Žádná nezůstala bez výsledku sněmovních voleb. Pět kódů obcí ze sněmovních voleb (507 voličů) nemá protějšek v KV 2026, nejspíš kvůli změnám obcí. Na výsledek to nemá vliv.
- Celková účast 46,07 → 47,99 % se shoduje s `vystup.json` (obce v obou letech).
- Spuštění: `python analyza_ano.py <složka s balíky KV a Senátu> <složka s rozbaleným PS2025data20251005_csv>`.

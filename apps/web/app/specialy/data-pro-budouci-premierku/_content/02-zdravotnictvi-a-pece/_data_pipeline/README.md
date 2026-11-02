# Datová pipeline kapitoly 2 Zdravotnictví a péče

Skripty počítají čísla a grafy pro články kapitoly ze surových souborů v archivu `Zdrojová data\` (mimo repozitář, složka „Data pro budoucí premiérku“). Soubory se znovu nestahují; seznam zdrojů, URL, data stažení a SHA-256 je v `Zdrojová data\CSU\ZDROJE.md`, oddíl „Zdravotnictví a péče“.

Společné použití (cesty upravit):

```
python <skript> --archiv "C:\Users\datov\Desktop\Mahdalova & Skop\Data pro budoucí premiérku\Zdrojová data" --grafy "<repo>\apps\web\public\specialy\dpbp\charts"
```

| Složka | Skript | Vstup z archivu | Výstup | Článek |
|---|---|---|---|---|
| `sousede/` | `sousede_oecd.py` | `OECD/…DF_PHYS`, `DF_NURSE`, `DF_SHA_vyber-zemi`, `DF_AM` | `sousede_oecd.json`, `CHART_SOUSEDE_PERSONAL`, `CHART_SOUSEDE_VYDAJE` | 15 Sousedé ze střední Evropy |
| `cekaci_doby/` | `cekaci_doby.py` | `Eurostat/…hlth_silc_08…`, `OECD/…DF_WAITING` | `cekaci_doby.json`, `CHART_CEKANI_WLIST` | 13 Čekací doby |
| `penize/` | `platba_stat.py` | `PSP/tisk235-0…`, `tisk235-2…` (čte `pdftotext`) | `platba_stat.json`, `CHART_PLATBA_STAT` | 14 Kolik zdravotnictví stojí |
| `korea/` | `korea_oecd.py` | stejné OECD soubory jako `sousede/` | `korea_oecd.json`, `CHART_KOREA_CESKO` | svět: Jižní Korea |

## Pravidla výběru údajů

- **Lékaři a sestry:** praktikující (status `P`) na 1 000 obyvatel, rok 2024. Slovensko hlásí jen „profesně aktivní“ (`PA`), skript použije tuto hodnotu a v článku je poznámka.
- **Výdaje:** podíl na HDP (cena `_Z`), USD ve stejné kupní síle na osobu (cena `V`, běžné ceny), podíl veřejných (HF1) a přímých plateb pacientů (HF3). Rok 2025 v OECD je odhad, proto se používá 2024.
- **Odvratitelná úmrtnost:** poslední dostupný rok na zemi (Německo jen 2022; Korea 2023, proto srovnání Česko–Korea vždy za 2023).
- **Čekání:** Eurostat `hlth_silc_08`, důvod `WLIST`, lidé 16+, celkem, 2025; ŘEŠENÍ shody: Česko má 0,2 % shodně s Nizozemskem (šest zemí EU s hodnotou 0,2 % a nižší).
- **Platba státu:** měsíční platba = 13,5 % z vyměřovacího základu; skript kontroluje shodu s tabulkou v důvodové zprávě (u všech řádků sedí).

## Co skripty nedělají

- Nepočítají čekací doby v Česku: veřejně srovnatelná data neexistují (OECD Česko mezi 25 zeměmi nemá).
- Netahají data z webu: aktualizace archivu se dělá najednou pro celý projekt.

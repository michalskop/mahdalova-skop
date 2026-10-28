# Článek 13 – Generace Z, slabé ročníky (zdroje a postup)

Čísla počítá `vypocet.py` z `data/*.csv` (vznikly skripty `xlsx_to_csv.py`, `pohyb_z_xlsx.py`, `prehled_narozenych.py`; výstup `vypocet_vystup.txt`; graf `GRAF_13_NAROZENI` staví `build_chart.py`). Stažení 28. 10. 2026.

| CSV | Zdroj | SHA-256 |
|---|---|---|
| `proj_zeny_stredni/nizka/vysoka.csv` | ČSÚ, Projekce obyvatelstva ČR 2023–2100 (publikace 30. 11. 2023), Tab. 3, 7, 11 (ženy podle věku k 1. 1.), https://csu.gov.cz/csu/czso/projekce-obyvatelstva-ceske-republiky-2023-2100 | `1301392303.xlsx` e5e104f9866f764f78de33422a74fd372f105fbee0f459830356c5e94551f4f7; `1301392307.xlsx` a3a2c7b057abdd60f6b625b37fa6b6bd5bcf86ac7a2f182d9a3d24ee33495acf; `1301392311.xlsx` 06ca884dd1ad59f18ee92ea32c79591c5c4030387a6ee0bda1ec2fea835a8d46 |
| `proj_pohyb.csv` | tamtéž, Tab. 4, 8, 12 (narození, úhrnná plodnost, migrace) | `1301392304.xlsx` 25408967f628f846615f357c684f0d38e64995b375d43ef6c623c286b339f458; `1301392308.xlsx` d76bdf51510861907aa2e87c744c374c64335779332b0bbc40aeb76d2b745027; `1301392312.xlsx` 2a6d441cb043ecc7c05409a372406ba98d317c3092733cebaf0f80a769b2a4af |
| `proj_stredni_obe_pohlavi.csv` | kopie `15-volicska-zakladna/data/proj_stredni.csv` (Tab. 1) | viz README článku 15 |
| `narozeni.csv` | ČSÚ OBY01CR, https://data.csu.gov.cz/opendata/sady/OBY01CR/distribuce/csv | c648672288fde644d15b509d27cdc2103764610a27bf80f1a616039158a08cea |
| `ucast_hlavni_vekove_skupiny_simar_s12.csv`, `ucast_vek_simar_s13.csv` | Ozvěny voleb 2025 (SIMAR), s. 12 a 13, N = 7 738, https://www.stem.cz/wp-content/uploads/2026/01/SIMAR_spolecna_povolebni_studie.pdf | 9fc8cb95dd29e6d8621e6009a4a303e565e61af00733f5d09c50b6db16cb390b |

Další zdroje v textu: NMS pro MPSV, Cesty k rodičovství (2024, N = 800, s. 9, 28), https://nms.global/wp-content/uploads/2024/12/NMS_CZ24481-Cesty-k-rodicovstvi_MPSV.pdf (SHA-256 b7f13d7e2264916f3de447dbc3d4adb294028873c56fef591adcc3b4cd5a9dd3); Deloitte Property Index 2025 (Praha 15,0 ročních mezd; tisková zpráva Deloitte CZ); letošní vydání (téměř 17) jen z Expats.cz 21. 10. 2026 – primární zprávu jsme neviděli.

## Definice a limity
- „Ženy 25–34“ = součet věků 25–34 k 1. 1., projekce od roku 2023 (2023 = skutečnost, ovlivněná příchodem uprchlíků z Ukrajiny, proto se s ním text nesrovnává). Projekce počítá s plodností 1,50 (střední), migrací +35 tis. ročně od 2028; skutečnost 2025 je pod ní (77 636 narozených proti 90 582, plodnost 1,28).
- Přepočet počtu narozených na plodnost 1,28 je úměrný (stejné věkové rozložení plodnosti), hrubý odhad.
- Odhad podílu voličů: účast podle věkových skupin (dotazník) × počet lidí z projekce k 1. 1. 2026; kontrola 69,1 % (skutečně 68,95 %).

# Dokumentace speciálů

Tato složka zrcadlí pojmenované speciály z `apps/web/app/specialy/`. Každý
speciál má vlastní dokumentační rozcestník, i když zatím nepotřebuje další
podklady.

| Speciál | Produkční URL | Kód | Dokumentace |
| --- | --- | --- | --- |
| Data pro budoucí premiérku | `/specialy/data-pro-budouci-premierku` | `apps/web/app/specialy/data-pro-budouci-premierku/` | `data-pro-budouci-premierku/` |
| Investigace | `/specialy/investigace` | `apps/web/app/specialy/investigace/` | `investigace/` |
| Data o klimatu | `/specialy/klima` | `apps/web/app/specialy/klima/` | `klima/` |
| Karlovy Vary v datech | `/specialy/kviff` | `apps/web/app/specialy/kviff/` | `kviff/` |
| Svobodná média | `/specialy/svobodna-media` | `apps/web/app/specialy/svobodna-media/` | `svobodna-media/` |

## Co patří do dokumentace speciálu

- účel, publikum a redakční záměr,
- stav projektu a důležitá rozhodnutí,
- datové zdroje a metodika,
- způsob spuštění, ověření a QA,
- odkazy na prototypy, audity a historické baselines.

Zdrojový kód, komponenty a data používaná přímo za běhu webu patří do
`apps/web/app/specialy/<název>/`. Reprodukovatelná datová pipeline může být
u kódu v soukromé složce `_pipeline`; dokumentace na ni odkazuje.

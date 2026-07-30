# KVIFF speciál

Tento adresář je rozcestník k vývoji speciálu o Mezinárodním filmovém
festivalu Karlovy Vary. Repozitář je jediný zdroj pravdy; pracovní kopie
zdrojových souborů se nemají udržovat mimo něj.

## Kde co najít

- Produkční stránka a její komponenty:
  `apps/web/app/specialy/kviff/`
- Sběr, transformace a zdrojová data:
  `apps/web/app/specialy/kviff/_pipeline/`
- Pipeline původu filmů:
  `apps/web/app/specialy/kviff/_pipeline/film-origins/`
- Přenositelný QA skript:
  `apps/web/scripts/qa-kviff.mjs`
- Historické QA screenshoty:
  `docs/specialy/kviff/qa/`
- Referenční prototypy:
  `docs/specialy/kviff/prototypes/`
- Projektová pravidla psaní:
  `docs/specialy/kviff/PSANI.md`
- Nové generované QA výstupy:
  `test-results/kviff/` (záměrně ignorováno Gitem)

## Běžný pracovní postup

Z kořene repozitáře spusťte web:

```powershell
npm run dev --workspace apps/web
```

V druhém terminálu spusťte QA:

```powershell
npm run qa:kviff --workspace apps/web
```

Výchozí adresa je `http://localhost:3001`. Jiný server lze určit proměnnou
`KVIFF_QA_BASE_URL`; cílovou složku screenshotů proměnnou
`KVIFF_QA_OUTPUT_DIR`. Skript standardně používá nainstalovaný Google Chrome.
Jiný Playwright kanál lze zvolit přes `KVIFF_QA_BROWSER_CHANNEL`, případně
zadáním úplné cesty v `KVIFF_QA_EXECUTABLE_PATH`.

## Pravidla údržby

1. Produkční `.tsx` a datové `.ts` soubory upravujte pouze v KVIFF složce
   aplikace.
2. Reprodukovatelná data mají vedle sebe skript, metodiku a výstup.
3. Dočasné logy a aktuální QA screenshoty nepatří do Gitu.
4. Důležitý vizuální baseline lze uložit do datované složky
   `docs/specialy/kviff/qa/YYYY-MM-DD/`.
5. Prototyp není produkční implementace; jeho stav a účel musí být popsán.

## Původ migrace

Obsah byl 30. července 2026 roztříděn z bývalé pracovní složky
`C:\Users\datov\Documents\KVIFF`. Stagingové kopie zdrojového kódu nebyly
přenášeny, protože odpovídaly starším mezistavům a jejich další vývoj je
zachycen v historii větve `kviff-revize-2kolo`. Dočasné serverové a npm logy
byly vědomě vyřazeny.

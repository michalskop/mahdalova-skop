# Dokumentace repozitáře

Tato složka obsahuje interní dokumentaci, která se nenasazuje jako součást
webových stránek.

## Struktura

- `specialy/` – dokumentace každého speciálu publikovaného pod
  `apps/web/app/specialy/`.
- `redakcni-styl/` – společná redakční a datově-žurnalistická pravidla pro
  celý web.
- `design/` – společný vizuální systém.
- `technicke/` – průřezové implementační, testovací a provozní návody.

Produkční kód zůstává v `apps/`. Dokumentace popisuje účel, zdroje, stav,
rozhodnutí a ověřování jednotlivých částí projektu.

## Co zůstává v kořeni

- `README.md` – vstupní stránka repozitáře,
- `AGENTS.md` – automaticky načítané instrukce pro Codex,
- `CLAUDE.md` – automaticky načítané instrukce pro Claude.

Tyto soubory mají technický nebo konvenční důvod zůstat v kořeni. Ostatní
manuály a handovery patří sem do `docs/`.

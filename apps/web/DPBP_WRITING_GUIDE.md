# DPBP_WRITING_GUIDE.md — psaní článků pro "Data pro budoucí premiérku"

Pokyny pro psaní obsahu (intro text, dlaždice/tiles, jednotlivé články) pro `/specialy/data-pro-budouci-premierku`. Technickou pipeline a `_meta.json` schéma popisuje [`SPECIAL.md`](./SPECIAL.md) — tento soubor je o tom, **co a jak psát**, ne kam to uložit.

---

## Titulky kapitol (`intro.title`)

**Neopakuj mechanicky schéma `[otázka]? [twist] aneb [tagline]`.** Tento vzorec byl použit ve všech 11 kapitolách najednou a při čtení za sebou působí monotónně a strojově. Není povinný — je to jedna z možných forem, ne závazná šablona.

Funkční alternativy:
- Přímé tvrzení s číslem: *"Polovina praktiků odejde do roku 2035 do důchodu"*
- Citace nebo parafráze slibu, který článek vyvrací: *"Slíbili jsme jádro do roku 2036. Realita je jiná."*
- Otázka bez "aneb": *"Kdo vás bude léčit za deset let?"*
- Kontrast dvou čísel: *"Sedm z deseti Čechů umí digitálně. Stát ne."*

Cíl titulku je vždy stejný: zachytit centrální napětí kapitoly jedním háčkem, ne popsat téma neutrálně ("Energetika v Česku" je špatný titulek, "Suverenita roku 2030 se měří v drátech, ne v gestech" je dobrý). Forma se může lišit kapitolu od kapitoly.

---

## Intro text (`textBefore` / `textAfter` / `textClosing`)

- `textBefore` — rámuje běžný předpoklad nebo politický slib. Jeden plynulý odstavec, ne odrážky.
- `textAfter` — skutečné zjištění, které `textBefore` vyvrací nebo zpřesňuje pomocí čísla z infoboxu.
- `textClosing` — 2–4 věty po grafu, které uzavírají úvod a typicky nadhazují to, co najde čtenář v dlaždicích níž (zejména v mezinárodním srovnání). Nemá to být shrnutí toho, co bylo řečeno — má to otevírat další krok.

Nikdy nevymýšlej čísla. Pokud přesné číslo neznáš jistě, použij rozsah nebo obecně známý řádový odhad a uveď zdroj na úrovni instituce (ČSÚ, OECD, Eurostat...), ne konkrétní nedohledatelnou URL.

---

## Dlaždice (`tiles`) — pevná editorská struktura

4 páry (8 dlaždic) v této pevné posloupnosti:

| Pár | Vlevo | Vpravo |
|-----|-------|--------|
| 1 | **Explainer** — vysvětlení klíčového konceptu/čísla kapitoly | **Svět** — existující mezinárodní srovnání (pokud už existuje ze starší fáze) |
| 2 | **Evropa** — nový mezinárodní/evropský kontext, jiná země než v páru 1 | **Analýza** — hlavní článek 01 |
| 3 | **Analýza** — hlavní článek 02 | **Analýza** — hlavní článek 03 |
| 4 | **Investigace** — ověření často citovaného čísla z kapitoly (rekonstrukce metodiky) | **Komparace** — solution journalism: jak to řeší jiná země, co je přenositelné |

`topic` v `_meta.json` je **jedno slovo/koncept** (Explainer, Svět, Evropa, Analýza, Investigace, Komparace) — kartová komponenta `DpbpArticleCard` před něj automaticky přidá název kapitoly, takže ho v `topic` neopakuj.

### Co psát do typu "Investigace"

Vezmi konkrétní číslo, které se v debatě opakuje (často z `intro.textAfter` nebo z hlavního článku), a rozeber ho: odkud pochází, jakou metodikou se počítá, co nadhodnocuje, co podhodnocuje, závěr ověření. Cíl je důvěryhodnost dat, ne jejich zpochybnění za každou cenu — pokud je číslo v pořádku, řekni to.

### Co psát do typu "Komparace"

Solution journalism: jiná země řešila podobný problém, co konkrétně udělala, jaký byl měřitelný výsledek, a co je z toho realisticky přenositelné do českého kontextu (vč. limitů přenositelnosti — různá velikost země, jiný rozpočet, jiná politická kultura).

### Co psát do typu "Evropa"

Mezinárodní/evropský kontext jiný než ten, který už kapitola má v existující dlaždici "Svět" — jiná země, jiný úhel pohledu. Nemusí to být vyloženě "řešení" jako u Komparace — může to být srovnání, varování nebo kontrastní příklad.

---

## Formát a délka jednotlivého článku

```yaml
---
title: "..."
excerpt: "..."
author: "Kateřina Mahdalová & Michal Škop"
date: "YYYY-MM-DD"
---
```

(Bez `primaryChart` u nových dlaždicových článků — graf má jen úvod kapitoly a hlavní analýzy z `dpbp-config.json`/staré pipeline.)

- 400–600 slov, čeština
- 3–5 sekcí s `## `
- Konec: `---` a řádek `*Zdroje: Instituce A · Instituce B · ...*`
- Žádné emoji, žádné odrážkové manifesty — psané jako souvislý text

---

## Zdrojování

Vždy fakticky podložené. Pořadí preferencí:
1. `data-pro-premierku/XX_KAPITOLA/01_research_and_audit/RESEARCH_AUDIT*.md` a `RESEARCH_AUDIT_INTERNATIONAL*.md`
2. `data-pro-premierku/XX_KAPITOLA/03_primary_content/DIST_ARTICLE_*.md`
3. Obecně known/ověřitelné instituce (OECD, Eurostat, NATO, Eurostat, ČSÚ, V-Dem, IFR, Deloitte Property Index...) — pokud research audit dané téma nepokrývá

Pokud si nejsi jistá konkrétním číslem, napiš rozsah ("přibližně 30–40 %") nebo obecně uznávaný řádový odhad, a u zdroje uveď instituci, ne nedohledatelnou konkrétní URL.

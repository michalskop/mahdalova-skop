# DPBP_WRITING_GUIDE.md – writing articles for "Data pro budoucí premiérku"

Guidance for writing content (intro text, tiles, individual articles) for `/specialy/data-pro-budouci-premierku`. The technical pipeline and `_meta.json` schema are described in [`SPECIAL.md`](./SPECIAL.md) – this file is about **what and how to write**, not where to save it.

> **Projektový dodatek podřízený kanonickému [REDAKCNI_MANUAL.md](../../REDAKCNI_MANUAL.md).** Obsahuje pouze pravidla specifická pro Data pro budoucí premiérku. Při rozporu platí kanonický manuál.

**The default style is explanatory journalism** according to the canonical manual: concrete mystery → evidence → what it means (Fisher/Klein), drive and clearly named stakes (Cadwalladr), human detail and clean Czech (Třešňák/Němeček), a factual diagnosis of systemic failures that ends with a direction for the solution (Prokop).

---

## Chapter titles (`intro.title`)

**Don't mechanically repeat the `[question]? [twist] aneb [tagline]` formula.** This pattern was used in all 11 chapters at once, and read back to back it feels monotonous and mechanical. It isn't mandatory – it's one possible form, not a binding template.

Working alternatives (examples below are in Czech, the language the titles are actually published in):
- A direct statement with a number: *"Polovina praktiků odejde do roku 2035 do důchodu"* ("Half of GPs will retire by 2035")
- A quote or paraphrase of the promise the article debunks: *"Slíbili jsme jádro do roku 2036. Realita je jiná."* ("We promised nuclear power by 2036. Reality is different.")
- A question without "aneb": *"Kdo vás bude léčit za deset let?"* ("Who will treat you in ten years?")
- A contrast of two numbers: *"Sedm z deseti Čechů umí digitálně. Stát ne."* ("Seven in ten Czechs are digitally literate. The state isn't.")

The goal of the title is always the same: capture the chapter's central tension in a single hook, not describe the topic neutrally ("Energetika v Česku" / "Energy in Czechia" is a bad title, "Suverenita roku 2030 se měří v drátech, ne v gestech" / "2030 sovereignty is measured in wires, not gestures" is a good one). The form can vary from chapter to chapter.

---

## Intro text (`textBefore` / `textAfter` / `textClosing`)

- `textBefore` – frames the common assumption or political promise. One flowing paragraph, not bullet points.
- `textAfter` – the actual finding, which refutes or refines `textBefore` using the number from the infobox.
- `textClosing` – 2–4 sentences after the chart that close out the intro and typically set up what the reader will find in the tiles below (especially in the international comparison). It should not summarize what was already said – it should open the next step.

Never invent numbers. If you don't know an exact figure with certainty, use a range or a generally known order-of-magnitude estimate, and cite the source at the institution level (ČSÚ, OECD, Eurostat...), not an untraceable specific URL.

---

## Tiles (`tiles`) – fixed editorial structure

4 pairs (8 tiles) in this fixed sequence:

| Pair | Left | Right |
|-----|-------|--------|
| 1 | **Explainer** – explains the chapter's key concept/number | **Svět** ("World") – existing international comparison (if one already exists from an earlier phase) |
| 2 | **Evropa** ("Europe") – new international/European context, a different country than in pair 1 | **Analýza** ("Analysis") – main article 01 |
| 3 | **Analýza** – main article 02 | **Analýza** – main article 03 |
| 4 | **Investigace** ("Investigation") – verification of a frequently cited number from the chapter (methodology reconstruction) | **Komparace** ("Comparison") – solution journalism: how another country solves it, what's transferable |

`topic` in `_meta.json` is **a single word/concept** (Explainer, Svět, Evropa, Analýza, Investigace, Komparace) – the `DpbpArticleCard` card component automatically prepends the chapter name, so don't repeat it in `topic`.

### What to write for the "Investigace" type

Take a specific number that keeps recurring in the debate (often from `intro.textAfter` or the main article) and break it down: where it comes from, what methodology computes it, what it overstates, what it understates, the verification conclusion. The goal is data credibility, not casting doubt on it at any cost – if the number holds up, say so.

### What to write for the "Komparace" type

Solution journalism: another country tackled a similar problem – what exactly did it do, what was the measurable result, and what is realistically transferable to the Czech context (including the limits of transferability – different country size, different budget, different political culture).

### What to write for the "Evropa" type

International/European context different from what the chapter already has in its existing "Svět" tile – a different country, a different angle. It doesn't have to be a "solution" in the Komparace sense – it can be a comparison, a warning, or a contrasting example.

---

## Format and length of an individual article

```yaml
---
title: "..."
excerpt: "..."
author: "Kateřina Mahdalová & Michal Škop"
date: "YYYY-MM-DD"
---
```

(No `primaryChart` on new tile articles – only the chapter intro and the main analyses from `dpbp-config.json`/the legacy pipeline carry a chart.)

- 400–600 words, Czech
- 3–5 sections with `## `
- Ending: `---` and a line `*Zdroje: Instituce A · Instituce B · ...*` ("Sources: Institution A · Institution B · ...")
- No emoji, no bullet-point manifestos – written as continuous prose

---

## Sourcing

Always factually grounded. Order of preference:
1. `data-pro-premierku/XX_KAPITOLA/01_research_and_audit/RESEARCH_AUDIT*.md` and `RESEARCH_AUDIT_INTERNATIONAL*.md`
2. `data-pro-premierku/XX_KAPITOLA/03_primary_content/DIST_ARTICLE_*.md`
3. Generally known/verifiable institutions (OECD, Eurostat, NATO, ČSÚ, V-Dem, IFR, Deloitte Property Index...) – if the research audit doesn't cover the topic

If you're not sure of a specific number, write a range ("approximately 30–40%") or a generally accepted order-of-magnitude estimate, and cite the institution as the source, not an untraceable specific URL.

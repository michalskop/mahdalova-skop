# Stav speciálu „Data pro budoucí premiérku"

**Aktualizováno:** 27. 7. 2026 · **`main` na commitu:** `f79a3910`

Tento dokument je jediný zdroj pravdy o tom, co je hotové a co ne.
Čísla níže jsou ověřená proti kódu, ne odhadnutá.

---

## 1. Ověřený stav obsahu

| Metrika | Hodnota |
|---|---|
| Kapitoly | 15 |
| Články | 151 |
| Datové grafy (spec soubory) | 42 |
| Odkazy v metadatech | 165 — **0 rozbitých** |
| Osiřelé články (nikde nedostupné) | **0** |
| Osiřelé grafy (hotové, nepoužité) | **1** → `CHART_MILOSTI_KUMULATIVNE` |

**Rozložení článků:** Demografie 17, Efektivní vládnutí 17, zbývajících 13 kapitol po 9.

**Kontrola stavu kdykoli jedním příkazem:**

```bash
node apps/web/app/specialy/data-pro-budouci-premierku/_audit/validate-meta.mjs
```

Ověří odkazy mezi kapitolami a články i to, že každý graf použitý v textu má svá data.
Skončí chybou při rozbitém odkazu nebo chybějícím grafu.

---

## 2. Hotovo

| ID | Co | Commit |
|---|---|---|
| **T0** | Inventura speciálu (počty, odkazy, placeholdery, duplicity) | — |
| **T0b** | Oprava kontrolního skriptu: doplněny `onePager` a `postSupportTiles`, přidána kontrola grafů a osiřelých článků. Původní verze měla díru — u rozbitého odkazu hlásila „v pořádku". Opraveny sekce 6 a 7 v `inventory.md`. | `9ca44db5` |
| **T1** | Přístupnost: články měly dva hlavní nadpisy (`<h1>`). Nově má stránka kapitoly jako `<h1>` název kapitoly, článek svůj titulek. Vizuálně beze změny. | `f79a3910` |

---

## 3. Nehotovo

| ID | Co | Priorita | Velikost | Blokováno čím |
|---|---|---|---|---|
| **T3** | **Redesign navigace a sticky menu** | P0 | XL | — připraveno ke spuštění |
| **T2** | Editorská klasifikace všech 151 článků | P1 | L | — připraveno |
| **T4** | Smazání mrtvého kódu v `ChapterRail` | P1 | S | čeká na T3 |
| **T7** | Regresní testy (kolize sticky prvků, validace odkazů v CI) | P2 | M | čeká na T3 |
| **T5** | Audio: rozhodnout placeholder vs. skrýt přehrávač | P2 | S | čeká na rozhodnutí |
| **T6** | Článek *Vylidňování obcí* slibuje mapy, které nejsou | P2 | S | čeká na rozhodnutí |
| **T9** | Osiřelý graf `CHART_MILOSTI_KUMULATIVNE` | P3 | XS | čeká na rozhodnutí |
| **T8** | Hustota dlaždic na úzkém mobilu (390/360 px) | P3 | S | — |

### Detail k T3 — proč je to největší úkol

`ChapterRail.tsx` má **647 řádků** kódu a `ChapterRail.module.css` dalších **983**.
Komponenta dělá naráz: hero kapitoly, navigaci mezi články, spodní sticky menu,
dva typy rozbalovacích panelů, seznam kapitol, seznam článků, synchronizaci
najetí myší přes `CustomEvent` a mobilní i desktopovou variantu.

**Ze tří definovaných variant se používá jediná** (`hero`) — varianty `article`
a `landing` se nikdy nevykreslí, jejich kód i CSS jsou mrtvé.

Konkrétní vady:

- na mobilu se navigace překrývá s posuvnou grafikou stárnutí populace
  (rail `top: 56px` vs. `AgeingScrolly` `top: 62px`)
- patnáct proužků kapitol vypadá čistě, ale význam není zřejmý
- ovládání stojí na najetí myší — dotyk a klávesnice nemají plnou cestu
- horní a spodní panel jsou implementované dvakrát

**Není to úkol na další záplaty v CSS.** Vyžaduje přestavbu a vizuální testování.

---

## 4. Otevřená rozhodnutí

| Téma | Otázka | Kde to je |
|---|---|---|
| **Audio** | U článků svítí „audio doplníme". Nechat, nebo přehrávač skrýt, dokud nahrávky nebudou? | `components/dpbp/ArticleByline.tsx:108` |
| **Mapy** | Text slibuje interaktivní mapy Česka a Rakouska „doplníme po dokončení". Přijdou, nebo přeformulovat? | `_content/01-demografie/articles/11-vylidnovani-obci.mdx:38` |
| **Osiřelý graf** | `CHART_MILOSTI_KUMULATIVNE` — doplnit do článku o milostech, nebo smazat? | `public/specialy/dpbp/charts/` |

---

## 5. Větve a archiv

**Zásada: veškerá hotová práce je v `main`. Žádné pracovní větve.**

Na serveru zůstávají pouze:

| Větev | Čí | Stav |
|---|---|---|
| `main` | — | aktuální |
| `feature/donate` | Michal | 5 commitů, nesloučeno, ~1,5 roku staré |
| `feature/key-numbers` | Michal | 15 commitů, nesloučeno, ~8 týdnů — obsahuje fulltextové vyhledávání (Pagefind) |

Rozpracovaná práce, která nebyla dokončena, je zakonzervovaná jako **značky**
(commity zůstávají dohledatelné, větve neexistují):

- `archiv/fact-checker-box` — fact-checking box a proces ověřování faktů (WIP)
- `archiv/kviff-responsivni-mapa` — alternativní pokus o responzivní KVIFF mapu

Obnovení kdykoli: `git checkout -b <nova-vetev> archiv/<znacka>`

---

## 6. Poznámky k procesu

Práce se dělí podle náročnosti mezi různě silné modely. Z dosavadního průběhu
plynou dvě pravidla, která se osvědčila:

1. **Práci nikdy nekontroluje ten, kdo ji udělal.** Levný model spolehlivě počítá
   a hledá, ale při selhání příkazu si dopsal věrohodně znějící výsledek místo
   přiznání, že nenašel. Odhaleno až kontrolou silnějším modelem.
2. **Co se předává dál, musí být commitnuté.** Nezapsané soubory v jedné pracovní
   kopii jsou pro ostatní neviditelné a zdrží navazující práci.

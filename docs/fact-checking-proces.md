# Fact-checking: redakční proces

Tento dokument popisuje, jak ověřujeme fakta v článcích na `mahdalova-skop.cz` a `datajournalism.studio`. Vychází ze session na Akademii investigace a je určen redakci, ne čtenářům (čtenářská verze je samostatný článek — viz odkazy níže).

Fact-checking má u nás dvě různé podoby, které se nesmí zaměňovat:

1. **Interní ověřování** – kontrola vlastního textu před publikací (tato kapitola).
2. **Veřejný fact-check formát** – samostatný typ obsahu pro ověřování konkrétních výroků, viditelný čtenářům (kapitola 2).

## 1. Checklist před publikací

U každého článku, který obsahuje ověřitelná tvrzení (čísla, citace, jména, tituly, data, srovnání, superlativy typu „poprvé", „nejvíc od roku X"), projde text před publikací tímto postupem:

- **Druhá osoba čte text nezávisle na autorovi.** Autor sám sebe nekontroluje – kognitivně je slepý ke svým vlastním chybám. Kontrolu dělá kolega/kolegyně, ideálně bez tlaku dodržet autorovo vyznění textu.
- **Hierarchie zdrojů.** Primární zdroj (dokument, nahrávka, datový soubor, on-record výpověď) > sekundární zdroj (jiné médium) > paměť reportéra/reportérky. Pokud je jediným zdrojem tvrzení vzpomínka z rozhovoru, je to slabé místo a mělo by to být označené.
- **Pravidlo dvou zdrojů** u kontroverzních nebo překvapivých tvrzení – jeden zdroj nestačí, pokud tvrzení může někomu uškodit nebo jde proti očekávání.
- **Nezávislé re-ověření citací**, pokud je to možné – znovu kontaktovat citovanou osobu a přečíst jí výrok zpět, ne kvůli cenzurnímu právu změnit názor, ale kvůli přesnosti a kontextu.
- **Ověření datových zdrojů:**
  - Uložit zdrojový soubor (CSV, XLSX, JSON, PDF, screenshot), ne jen odkaz – odkazy umírají a weby se mění.
  - Poznamenat datum stažení a verzi datasetu.
  - Zaznamenat metodologii přepočtů (co se z čeho počítá), ne jen výsledné číslo.
- **Rozlišení faktu od interpretace.** Neověřujeme názory („tento zákon je špatný"), ale ověřujeme, že fakta, na kterých je názor postavený, sedí.
- **Zápis sign-off do frontmatteru.** Jakmile článek projde kontrolou, doplní kontrolující osoba do frontmatteru pole:
  ```yaml
  verification:
    checkedBy: "Jméno Příjmení"
    checkedAt: "2026-07-11"
  ```
  Skript `scripts/checkVerificationStatus.js` (spouští se automaticky při `npm run build` jako součást `prebuild`, dá se spustit i ručně přes `node scripts/checkVerificationStatus.js`) při každém buildu vypíše seznam článků, které toto pole ještě nemají – jde jen o upozornění (build tím neselže), slouží jako průběžná kontrola, na co se ještě nedostalo. Stávající publikované články se zpětně nedoplňují hromadně, pole se přidává postupně při další editaci nebo revizi.
- **AI-asistovaná kontrola tvrzení.** Před nastavením `verification` pole spusťte na článek skill `/fact-check-review` (viz kapitola 4) – projde text, vytáhne ověřitelná tvrzení a označí ta bez zjevného zdroje. Nahrazuje ruční procházení věta po větě, ne lidský úsudek o tom, jestli je zdroj dostatečný.

## 2. Jak psát veřejný fact-check formát

Pro ověřování konkrétních výroků (politiků, virálních tvrzení) máme formát `FactCheckBox` s barevně odlišeným verdiktem. Autoruje se jako markdown fence přímo v článku:

````
```factcheck pravda
Text ověřovaného výroku a jeho rozbor. Běžný markdown – funguje **tučně**, [odkazy](https://…), seznamy.

Zdroje:
- [Název zdroje 1](https://…)
- [Název zdroje 2](https://…)
```
````

Verdikt se píše jako první slovo za `factcheck` (česky i anglicky, oba jazyky fungují v obou projektech):

| Verdikt (CZ) | Verdikt (EN) | Význam |
|---|---|---|
| `pravda` | `true` | Výrok odpovídá ověřitelným faktům. |
| `nepravda` | `false` | Výrok je prokazatelně nepravdivý. |
| `zavadejici` / `zavádějící` | `misleading` | Výrok obsahuje pravdivé prvky, ale vytváří mylný dojem (chybí kontext, zavádějící srovnání). |
| `neoverene` / `neověřitelné` | `unverifiable` | Nelze ověřit dostupnými zdroji. |

Pokud verdikt vynecháte (` ```factcheck ` bez slova), zobrazí se jako „Neověřitelné" – lepší výchozí stav než tvrdit něco, co nemáme podložené.

**Kritéria pro výběr výroku k ověření:** veřejný zájem/dosah výroku, ověřitelnost dostupnými zdroji, relevance k aktuální debatě. Neověřujeme každé tvrzení – jen ta, kde má ověření smysl pro čtenáře.

Čtenářská verze metodologie (co znamenají jednotlivé verdikty, jak nahlásit chybu) je publikovaná jako běžný článek:
- CZ: `/clanek/jak-overujeme-fakta`
- EN: `/a/how-we-fact-check`

## 3. AI-asistovaná kontrola: `/fact-check-review`

Skill `/fact-check-review` v Claude Code projde návrh textu (existující článek v repu, nebo rovnou vložený draft příspěvku na sociální síť – X, Instagram, LinkedIn, Discord…) a:

1. vytáhne ověřitelná tvrzení (čísla, data, jména a role, citace, srovnání),
2. u každého zkontroluje, jestli je poblíž odkaz/zdroj,
3. pokud text obsahuje `​```factcheck` fence, ověří, že verdikt sedí s okolním textem a má uvedené zdroje,
4. vrátí přehled: podložené / bez zdroje / vyžaduje lidský úsudek,
5. na konci se zeptá, jestli jste označené body vyřešili – u souboru v repu pak nabídne doplnění `verification` pole.

Je to pomocník, ne rozhodčí – finální úsudek o tom, jestli je zdroj dostatečný, dělá vždy člověk. Pro příspěvky na sociální sítě (mimo tento repozitář) je to jediný krok procesu – žádná technická integrace se sítěmi neexistuje, jde jen o to vložit draft textu do chatu a spustit skill předtím, než se příspěvek odešle.

## 4. Co zatím neřešíme

Mimo rozsah této verze procesu (vědomě, ne opomenutím):

- **Correction/errata log** – veřejně viditelný záznam oprav u již publikovaných článků. Zatím žádný technický mechanismus neexistuje; když se najde chyba, opravuje se přímo v textu s poznámkou v těle článku. Formalizovaný correction log (např. `InfoBox type="error"` na konci článku, nebo nové frontmatter pole `updated`/`correctionNote`) je kandidát na příští rozšíření.

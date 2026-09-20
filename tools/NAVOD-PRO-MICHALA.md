# Michale, od grafu k pěknému coveru

Cílem je jeden srozumitelný vizuální nápad, který funguje i jako malý náhled.
Chart-simplifier pomáhá vybrat tvar a hlavní sdělení grafu. Cover-editor přidává
sazbu, značku a varianty pro web a sítě. Úplný graf s osami, jednotkami a zdrojem
zůstává v článku.

## 1. Nejdřív jedna věta

Napiš si, co má člověk pochopit během několika sekund. Například:
„Nájmy rostou rychleji než mzdy.“ Podle toho vyber hlavní řadu a období.
Pokud cover potřebuje dlouhé vysvětlování nebo rozsáhlou legendu, zvol raději
výrazné číslo a krátký titulek; podrobný graf nech do článku.

## 2. Zjednoduš graf v chart-simplifieru

1. Otevři `tools/chart-simplifier.html` a načti zdrojový Vega-Lite JSON přes
   **Load .json file**, případně jej vlož a stiskni **Parse spec**.
2. Zkontroluj pole X, Y a rozlišení řad. Automatický odhad nemusí být správný.
3. Zvol období, které odpovídá tvrzení. Nevystřihuj kontext jen kvůli dramatičtější křivce.
4. Začni jednou hlavní řadou a nejvýše jednou srovnávací. Hlavní řada má mít
   výraznou barvu, druhá klidnější tón.
5. Výchozích 20 bodů ber jako začátek. Ověř proti originálu, že zjednodušení
   neztratilo důležitý vrchol, zlom nebo propad.
6. Pro porovnání velikostí ponech **shared (true difference)**. Volba
   **per-series (shape only)** normalizuje každou řadu zvlášť: slouží porovnání
   tvaru, nikoli velikosti rozdílů. Použij ji jen tehdy, když sdělení toto
   omezení jasně respektuje.

### Důležité: co simplifier dnes skutečně umí

Tlačítka **Copy code** a **Copy entry** kopírují kód pro vývojáře.
Nejde o hotový SVG soubor, který by šlo vložit přes Upload image.
Barvy v náhledu simplifieru se navíc nemusí shodovat s výsledkem jeho
generovaného motivu: ten používá hlavní a vedlejší barvu cover-editoru.

Pro současný postup předej Codexu nebo Claudovi zdrojový JSON, vybrané období,
řady a režim měřítka; případně také oba zkopírované výstupy. Požádej o přípravu
samostatného SVG motivu pro editor, zachování poměru stran a porovnání
s původním grafem. Toto je převod podkladu, nikoli zadání k přepsání editoru.
Má-li se motiv objevit na tmavém pozadí, zkontroluj i kontrast vedlejší řady.

Přímé „Stáhnout SVG / Použít v cover-editoru“ je doporučené další zlepšení;
současná verze tato tlačítka nemá.

## 3. Slož cover

Otevři cover-editor přes lokální web. Pokud už k tématu máme uložený projekt,
začni jím a uprav jen potřebné části.

- **Kicker:** krátká rubrika nebo téma, například „BYDLENÍ“. Bezpatkové písmo.
- **Titulek:** hlavní sdělení, ideálně jeden až dva řádky. Patkové písmo.
- **Claim:** pouze pokud dodává něco nového — třeba konkrétní číslo či období.
  Neopakuj titulek jinými slovy. Patkové písmo; Enter vynucuje nový řádek.
- **Motiv:** nahraj připravený SVG graf nebo původní fotografii bez přidaného
  titulku a loga. U grafu zkontroluj, že výřez neschoval začátek, konec nebo
  důležitý zlom. Editor obrázky ořezává, automatický výřez proto nemusí být
  pro graf správný. Pokud se celý motiv nevejde, uprav jeho rám či podklad.
- **Pozadí:** začni světlou béžovou nebo tmavou navy z palety. Použij jednu
  zvýrazňovací barvu. Další barvu přidej jen pro konkrétní význam v datech.

Značky přidává editor. Nevkládej stejné logo také do podkladového obrázku.
Vestavěné ukázkové křivky nenahrazují data: nepoužívej jejich tvar jako
vizualizaci konkrétního zjištění, pokud mu neodpovídá.

## 4. Aby výsledek vypadal dobře

Při pohledu na cover si polož pět otázek:

1. **Co vidím jako první?** Má to být titulek, hlavní číslo nebo klíčový motiv.
   Pokud spolu soutěží všechny tři, jeden z nich zmenši nebo vynech.
2. **Má kompozice prostor?** Text, motiv a značky se nemají dotýkat.
   Volné místo nemusíš zaplňovat další informací.
3. **Drží prvky stejné okraje?** Srovnej levé hrany textů a motivu.
   Zachovej přiměřené odstupy i od okrajů plátna.
4. **Přečtu to jako malou kartu?** Zkontroluj náhled homepage, ne pouze velké
   pracovní plátno. Pokud je text drobný, nejprve ho zkrať.
5. **Je obrázek pravdivý i bez článku?** Nevyvolává ořez, měřítko nebo
   zjednodušení jiný dojem než původní data?

Praktické výchozí rozložení: krátký kicker nahoře, výrazný titulek,
pod ním jeden grafový motiv, dole případné doplnění a značky.
Fotografii a graf nekombinuj automaticky; druhý motiv musí mít jasný účel.

## 5. Čtyři varianty, jedna kontrola každé

| Varianta | Na co se dívat |
| --- | --- |
| Homepage 5:4 | Čitelnost na skutečné malé kartě, vyvážený poměr textu a motivu. |
| OG 1200 × 630 | Celý landscape i ukázkový čtvercový ořez; podstatný text a značka zůstávají ve středu. |
| Čtverec | Kompozice nesmí působit jako násilně uříznutý landscape. |
| Instagram 4:5 | Využij výšku pro větší motiv a klidné mezery, nepřidávej text jen proto, že je místo. |

Každá varianta má vlastní úpravy. Ořez v náhledu je kontrolní pomůcka;
konkrétní sociální aplikace může náhled odkazu zobrazit jinak.

## 6. Ulož a předej

Stáhni ZIP se všemi variantami a projektem. K publikaci patří kompletní
JPEG/PNG včetně textů a značek. Pro další úpravy uchovej `cover-project.json`,
zdrojový graf/data a původní obrázek. Po úpravě projektu znovu exportuj.

Nemusíš všechny varianty vyrábět ručně: automat je vytvoří společně,
ty nebo editor článku zkontrolujete výsledek a doladíte jen problémové místo.
AI má pomoci s titulkem, převodem podkladu a kontrolou; běžný export dělá skript.

### Krátké zadání pro Codex nebo Claude

> Připrav cover podle tools/COVER-EDITOR.md. Hlavní sdělení: …
> Zdrojový graf/podklad: … Období a hlavní řada: … Měřítko: shared / shape only.
> Zachovej: … Použij existující společný renderer, vytvoř čtyři varianty
> a editovatelný projekt. Zkontroluj čitelnost v malém náhledu a ořezy motivu.
> Nevytvářej nový generátor.

## Doporučení pro další úpravu editoru

Toto je návrh rozhraní, nikoli popis již dostupných funkcí:

- Na začátku nabídnout tři volby: **Fotografie / Grafový motiv / Jen typografie**.
  Režim zvolí rozumné výchozí rozložení a ukáže potřebné vstupy.
- Světlé nebo tmavé pozadí nabídnout přímo vedle náhledu, s výchozí volbou.
  Nevyžadovat samostatné potvrzení při každém otevření projektu.
- Před exportem dát konkrétní upozornění: chybí zvolená fotografie/graf,
  podklad má nízké rozlišení, text přesahuje plátno či bezpečnou oblast.
  Ukázat dotčenou variantu a nabídnout opravu nebo změnu režimu.
- Nezavádět povinné nahrání obrázku pro všechny covery. Typografický cover je
  platná volba a prázdné místo samo o sobě není chyba.
- Prioritou je přímý export SVG ze simplifieru. Odstraní ruční přenášení
  kódu i zbytečné zapojování AI do opakovaného převodu.

Technický postup a spouštění automatu: [COVER-EDITOR.md](COVER-EDITOR.md).

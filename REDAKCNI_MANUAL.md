# Redakční manuál DataTimes — kanonická verze

Jediný zdroj pravdy pro to, jak píšeme, ověřujeme a navrhujeme ve všem, co dělá dvojice Mahdalová & Škop. **Etika a srozumitelný styl platí závazně pro všechny naše analýzy bez ohledu na formát** — text, data, grafiku, audio i video — a napříč oběma značkami (mahdalova-skop.cz i datajournalism.studio) a všemi speciály. Žánry určují stavbu. Vzhled a lokální nuance doplňují projektové kapitoly.

*Umístění: kořen repozitáře `mahdalova-skop`. Tohle je kanonická strojově i lidsky čitelná verze; čtenářský booklet (.docx) se z ní odvozuje.*

Tenhle soubor nahrazuje roztříštěnost pravidel mezi dokumenty. Hlubší rozbory zůstávají jako podřízené reference (viz [Registr](#registr-zdrojů-a-projektových-kapitol)); žádný z nich nesmí tenhle manuál oslabit ani vytvořit druhou „ústavu".

---

## 0. Jak manuál používat

### Pořadí závaznosti
1. **Pravda, bezpečnost a ověřitelnost** — nikdy je nepřebije styl ani projektová potřeba.
2. **Univerzální etika a styl** — platí pro všechny značky a formáty (Část I–II).
3. **Datový modul** — u datových a analytických textů má přednost před vyprávěcími nástroji (Část III).
4. **Pravidla žánru** — určují stavbu konkrétního útvaru (Část V).
5. **Projektová kapitola** — vzhled, komponenty, zdroje, lokální nuance (registr).
6. **Jednorázové zadání** — smí zpřesnit účel a rozsah, nesmí zrušit vyšší pravidlo.

### Rozhodovací test
Když si dva návody odporují, zeptej se: je rozpor **věcný, žánrový, nebo jen technický**? Věcná integrita má vždy přednost. Žánrové pravidlo má přednost před stylistickou inspirací. Projektové pravidlo platí jen uvnitř projektu.

### Co manuál není
Není sbírka zákazů bez vysvětlení. Není příkaz psát vše jedním hlasem. Není technická dokumentace každé komponenty. Nenahrazuje zdrojový audit ani editorský úsudek.

---

# ČÁST I — ETIKA A SMLOUVA SE ČTENÁŘEM

Platí pro každý formát. Čtenář, posluchač i divák musí vždy poznat, **co víme, odkud to víme, co z toho plyne a kde jsou hranice důkazu.**

## Pět nepřekročitelných závazků
1. **Nevymýšlíme** osoby, scény, citace, detaily ani čísla. Ilustrační člověk nesmí předstírat reportáž.
2. **Oddělujeme fakt, výpočet, interpretaci a názor.** Každý z nich potřebuje jiný druh opory.
3. **Opravy děláme viditelně.** Tam, kde chyba změnila smysl, ji nezamlčujeme tichou úpravou.
4. **Limity dat přiznáváme u tvrzení,** ne až v metodické patičce, kterou čtenář nemusí otevřít.
5. **Nezesilujeme zjištění hodnotícími přívlastky.** Sílu nese důkaz a srovnání.

## Odpovědnosti
- **Autor** — argument a čitelnost.
- **Datový autor** — výpočet, definice a reprodukovatelnost.
- **Editor** — proporcionalita, kontext, žánr a férovost.
- **Publikující** — metadata, zdroje, přístupnost a finální kontrola.

## Transparentnost: financování a nezávislost
- Grantové a jiné externí financování projektu **přiznáváme** v patičce nebo o-projektu (např. Nadační fond nezávislé žurnalistiky u DPBP). Zdroj peněz nesmí určovat závěr.
- Když píšeme o subjektu, k němuž máme vztah (zadavatel, partner, osobní vazba), **konflikt zájmů uvedeme** přímo u textu.
- **Právo na vyjádření**: u investigace a u každého vážného obvinění dáme dotčené straně možnost reagovat a její stanovisko podáme férově, i když ho nesdílíme.

## AI a odpovědnost
- AI je nástroj, ne autor. **Každý fakt, číslo a citaci z AI výstupu ověří člověk** proti primárnímu zdroji — AI text bez ověření nepublikujeme.
- Pokud AI vytvořila podstatnou část obsahu (např. generovaný obraz, hlas, shrnutí), přiznáme to.
- Pokyn pro AI vždy odkazuje na platnou verzi těchto pravidel; pravidlo uložené jen v chatu neplatí.

## Opravy a errata
- **Věcná oprava** (změněné číslo, jméno, tvrzení): u textu viditelná poznámka s datem a tím, co se opravilo. U audia/videa oprava v popisu epizody / v připnutém komentáři a v navazujícím díle.
- **Tichá úprava** je přípustná jen u překlepu nebo formatování, které nemění smysl.
- Chybu neututláváme smazáním; opravujeme a přiznáváme.

---

# ČÁST II — SPOLEČNÝ STYL

## Vysvětlující žurnalistika jako výchozí
Nekopírujeme jednoho autora. Z různých linií bereme funkční nástroje a spojujeme je s vlastní odpovědností:
- **Fisher & Klein** — konkrétní záhada nebo napětí → důkazy → vysvětlení mechanismu → význam pro čtenáře.
- **Carole Cadwalladr** — tah textu a jasně pojmenované sázky: o co jde, koho se to týká, kdo má moc to změnit.
- **Petr Třešňák a Tomáš Němeček** — lidské ukotvení, pozorovaný detail, čistá civilní čeština. Detail musí být reportovaný nebo transparentně odvozený z dat. (Podrobná metoda: [NAVOD_STYL_TRESNAK.md](docs/redakcni-styl/NAVOD_STYL_TRESNAK.md).)
- **Daniel Prokop** — systémová diagnóza bez moralizování: příčiny, distribuce dopadů, realistický směr řešení.

Jména jsou zdroj nástrojů, ne pokyn napodobovat hlas. Výsledný rukopis musí být rozpoznatelně náš: **přesný, civilní, analytický a férový.**

## Jazyk bez berliček
**Fakta první.** U datového textu padne klíčový fakt nebo číslo zpravidla v prvním odstavci. Nezačínáme obecnou historií tématu, dokud čtenář neví, proč má číst dál. Číslo vždy dostane měřítko (časové, geografické, populační, rozpočtové). Podíl uvádíme s absolutním počtem a jmenovatelem, jsou-li dostupné.

**Přirozená čeština.** Přímá syntax bez rozjezdových vět a školometských přechodů.

**Zakázané konstrukce a fráze:**
- protichůdné vzorce „není to jen A, je to B" a „X není A, je to B" — napiš rovnou B; negaci nech jen pro vyvrácení skutečně rozšířeného omylu, nejvýš jednou za text;
- klišé a vata: *fascinující, zajímavé, pozoruhodné, anatomie čehokoli, rentgen čehokoli, pod povrchem, za oponou, mechanismus* jako náhrada konkrétní kauzální věty, *v neposlední řadě, v tomto kontextu, jak jsme viděli, stojí za zmínku, je třeba podotknout*;
- anglické kalky: *není to o tom, na denní bázi, adresovat problém, dělat rozdíl, game changer / měnit hru, ikonický* jako univerzální pochvala, *narativ* tam, kde stačí příběh nebo výklad, *poznámka pod čarou* jako metafora bezvýznamnosti.

**Metafora** je dovolená, pokud něco přesně objasní a není klišé. Musí projít testem: dává obraz smysl i tomu, kdo větu slyší poprvé a nahlas? U datového tvrzení nesmí nahrazovat definici ani zvyšovat emoci. Pokud potřebuje dvojtečku s výčtem, aby fungovala, škrtni ji a napiš výčet rovnou. Jedna čerstvá metafora je silnější než řada obrazných přívlastků.

## Stavba textu
**Základní oblouk:** otvírák → nut graf (co zkoumáme, proč je to důležité, proč teď) → evidence (nejsilnější důkaz, pak vysvětlení, limity, alternativy) → mechanismus (jak a proč vzniká, kdo rozhoduje a kdo nese důsledky) → význam → konec (odpověď, nástroj pro čtenáře, návrat k otvíráku nebo realistický směr řešení — ne mechanické shrnutí).

**Povolené otvíráky:** překvapivý přesně zasazený fakt · skutečná reportovaná scéna · veřejný aktér a dohledatelný výrok · výslovně označený statistický nebo modelový případ · redakční datové pátrání (co jsme chtěli zjistit a jak) · konkrétní otázka nebo rozpor, na který text skutečně odpoví.

**Zakázaný zkrat:** nikdy nevytváříme smyšleného „pana Marka", rodinu ani dialog jen proto, aby data působila lidsky. Bez reportáže sáhneme po čísle, veřejném výroku, vlastním pátrání nebo transparentním modelovém případu.

## Čísla, jednotky a formát
- **Tisíce** oddělujeme pevnou mezerou: 77 636, 1 280 000.
- **Desetinná čárka**, ne tečka: 1,28.
- **Procenta** s mezerou: 53 %. Procentní body zkracujeme „p. b." a nezaměňujeme s procenty.
- **Jednotky** píšeme s mezerou (24 TWh, 70 m², 5,5 s) a konzistentně v celém textu.
- **Rozsahy** en-dash bez mezer: 2020–2025, 15–18 eur.
- **Interpunkce**: en-dash (–) místo em-dash (—); spojovník (-) jen ve složených výrazech a spojení typu Praha-Vinohrady.
- **Zaokrouhlení** volíme podle přesnosti dat a držíme ho v celém textu; nepředstíráme přesnost, kterou zdroj nemá.
- **Měna a velké částky**: přepočet nebo lidské měřítko, kde to pomáhá pochopení.

## Jazyk a lokalizace
Výchozí je čeština (mahdalova-skop.cz). **Projekt určuje jazyk a lokalizaci:** datajournalism.studio je anglická, sází Work Sans, používá en-US formát data a čísel a nepřechyluje. Formát data v češtině cs-CZ, v angličtině en-US; nemíchat v rámci jednoho výstupu.

## Lidé, jména a citace
- **První zmínka**: celé jméno a role (Terezie Štyglerová, vedoucí oddělení demografické statistiky ČSÚ), dál příjmení.
- **Zájmena**: pokud je neznáme a nejsou uvedená, volíme neutrální formulaci; nedovozujeme je ze jména.
- **Historické názvy** (státy, instituce) ponecháváme v dobové podobě, nepřepisujeme mechanicky na dnešní hranice.
- **Citace**: přesná, editace bez změny smyslu; vsuvky do [hranatých závorek], vypuštění do výpustky. Necitujeme nikoho tak, aby to obrátilo jeho smysl.

## Fotografie a obraz
- **Kredit a popisek** u každé fotografie; popisek říká, co je na snímku a proč tu je, ne co je zřejmé.
- **Žádné zavádějící ořezy** ani úpravy měnící vyznění; ilustrační a montážní obraz označíme.
- **Licence** ověřená před publikací.
- **Alternativní text** shrnuje obsah, ne vzhled.

---

# ČÁST III — DATOVÁ ŽURNALISTIKA (závazný modul)

U datových a analytických textů má tenhle modul přednost před vyprávěcími doporučeními všude, kde si odporují. Lidský detail a metafora smějí pomoci porozumění, nikdy však odsunout klíčový fakt, změnit význam dat nebo vytvořit dramatizaci. (Rozšířená verze s příklady: [STYL_DATOVA_ZURNALISTIKA.md](docs/redakcni-styl/STYL_DATOVA_ZURNALISTIKA.md).)

## Nejdřív čti data, ne příběh
Před prvním slovem odpověz na tři otázky:
- **Co graf skutečně říká?** Ne co tvrdí titulek zdroje nebo tisková zpráva — co ukazují čísla, osy, měřítka, jednotky a časový rozsah.
- **Co graf neříká?** Jaký kontext chybí: jiné země, historická řada, absolutní čísla za podíly, struktura populace, nejistota, změna metodiky.
- **Co je překvapivé?** Překvapení je rozdíl proti rozumnému očekávání, ne dramatický přívlastek. Pokud žádné není, nemusí v datech být samostatný příběh.

## Nejdřív napiš pracovní větu
Ještě před titulkem napiš jednou větou, co data dokazují: subjekt, změna nebo rozdíl, měřítko a srovnávací bod. Když ji nejde napsat bez slov „zajímavý", „dramatický" nebo „výrazný", vrať se k datům.

## Jak vystavět datový příběh
- **Začni překvapením, ne kontextem.** Špatně: „Česká republika se dlouhodobě potýká s otázkou dostupnosti bydlení. Podle Eurostatu…" Správně: „Necelá polovina českých domácností zůstává po zaplacení bydlení s reálným příjmem nižším než v roce 2021." Definice, příčiny a historie přicházejí, až když čtenář ví, proč jsou důležité.
- **Kotvi čísla v kontextu.** Každé klíčové číslo potřebuje aspoň jeden záchytný bod. Špatně: „Úhrnná plodnost je 1,28." Správně: „…klesla na 1,28 — pod nejpesimističtější scénář, s nímž ČSÚ vstupoval do projekcí pro 2023."
- **Střídej makro a mikro.** Po systému nabídni konkrétní dopad nebo přepočet na lidské měřítko; po lidském příkladu se vrať k datům. Mikro nesmí být smyšlená osoba — reportovaný případ, veřejný dokument nebo označený statistický model.

## Mezititulky, titulek a konec
- **Mezititulek nese informaci, ne štítek.** Test: odstraň ho — pokud text neztratí žádnou tezi ani orientační bod, byl to štítek. Špatně: „Situace v Česku". Správně: „Česko zaostává za polskými regiony i v počtu STEM absolventů".
- **Titulek je falsifikovatelná teze.** Říká, co text dokazuje; má být možné se s ním na základě důkazů přít. Neslibuje kauzalitu, kterou text neprokazuje. Spojka „aneb" je v titulcích zakázaná; v sérii neopakujeme jeden šablonovitý formát.
- **Konec není rekapitulace.** Dokončí myšlenku novým faktem, významem nebo přesně vymezeným směrem řešení — nebo skončí, když je řečeno vše podstatné.

## Zakázané u dat
- **Klišé a vycpávky** (viz Část II) a navíc *rekordní / bezprecedentní* bez vymezení souboru, období a metriky a bez ověření historické řady.
- **Hodnotící přívlastky u čísel**: *pouhých, jen, pouze, dokonce* před číslem; *dramatický propad, alarmující nárůst, závratný růst*. Je-li hodnota malá, velká nebo neobvyklá, ukaž to srovnáním — přívlastek není důkaz.

## Zdroje a odkazy
- Odkaz musí říkat, co čtenář otevře: popisný název („Projekce obyvatelstva ČR 2023–2100, ČSÚ"), ne holé URL ani „zde" nebo jen „ČSÚ".
- Odkazujeme na konkrétní dataset, tabulku, metodiku nebo dokument, ne na domovskou stránku instituce.
- U lokálního souboru zaznamenáme cestu, verzi a datum stažení.
- Výčet databází nepatří do hlavního odstavce; úplný aparát je ve zdrojové patičce nebo metodice. Neodkazujeme přes dočasnou adresu chatu, existuje-li veřejný zdroj.

## Graf je argument, ne ilustrace
Graf má přinést informaci, kterou text sám nepředá stejně dobře: rozsah, trend, distribuci, vztah, srovnání. Pokud jen opakuje jednu hodnotu z věty, zvaž jednodušší formu.

**Tři vrstvy textu ke grafu:** co vidíme (osa, rozsah, jednotka, období, klíčová hodnota — bez výkladu) · co to znamená (proč je hodnota relevantní a s čím ji srovnáváme) · co to neznamená (nejpravděpodobnější chybná interpretace). Ne každý popisek potřebuje tři odstavce, ale autor musí vědět, kterou vrstvu vypouští a proč.

**Titulek grafu je tvrzení.** Anotace zvýrazní bod, který tvrzení podpírá, nekomentuje vše. Zdroj a metodika jsou u grafu. Klíčová hodnota je čitelná bez hoveru.

**Čtyři pasti vizualizací:** zkrácená osa Y (u sloupců zpravidla od nuly; u čar jen viditelně a odůvodněně) · absolutní vs. relativní (mění-li přepnutí závěr, ukaž obě) · průměr vs. medián vs. distribuce (u příjmů, cen, čekacích dob zvaž medián a rozptyl) · korelace vs. kauzalita (kauzální větu jen s odpovídajícím důkazem).

## Čeho se vyvarovat celkově
Moralizování místo diagnózy („systém trestá rodiče s nízkými příjmy" je diagnóza; „je ostudné, že…" patří jen do komentáře) · dramatizace místo věcnosti · fakta bez kotvení · neoznačená extrapolace (trend pěti let není předpověď na dvacet; scénář označ a ukaž nejistotu) · strach jako argument (riziko popisujeme pravděpodobností, rozsahem a podmínkami).

---

# ČÁST IV — AUDIO A VIDEO

Etika a styl z Částí I–II platí beze změny. Formát mění jen řemeslo podání.

## Audio a podcast
Píšeme pro ucho, i když píšeme pro oko.
- **Jedna myšlenka na větu.** Ucho nezvládne vsuvky, výčty a dvojité zápory, které oko přeskočí.
- **Intro nejdřív vyslovit, pak zapsat** — psané intro převedené do řeči zní jako čtený referát.
- **Signposty vyslovujeme** („to ale nebyl jediný problém…"); posluchač se očima nevrátí zpět.
- **Zvuk vypráví za text.** Kde je silná atmosféra, škrtni popis. Při nahrávání mikrofon blízko zdroje.
- **Data v audiu:** číslo řekni s jeho kotvou a nech ho doznít; neodříkávej tabulky. Nanejvýš dvě tři čísla na segment.
- **Čtení nahlas je povinná brána** — kde se zadrhne jazyk, tam se zadrhne posluchač.

## Video
- **Točíme v sekvencích** (five-shot: detail rukou → tvář → celek → přes rameno → neobvyklý úhel). Sekvence dává střihu stavební kameny.
- **Poměr záběrů** orientačně ~50 % detailů, zbytek polocelky a celky — video žije z detailu a emoce.
- **Kompozice:** třetiny, přiměřený headroom, noseroom ve směru pohledu, čisté pozadí.
- **Příběh vede konkrétní člověk**, ne mluvící hlava s obecnými tvrzeními.
- **Data na obrazovce** (titulky, popisky) musí být čitelná a krátká; graf ve videu drží stejná pravidla jako v textu.
- **Žádné inscenované „ilustrační" scény** vydávané za realitu; archivní a rekonstruovaný záběr označíme.

---

# ČÁST V — NAŠE ŽÁNRY

Nejdřív urči žánr, potom piš. Žánr určuje hlavní otázku, povinné rozlišení i typický rozsah. Rozsahy jsou orientační, ne limit.

| Žánr | Hlavní otázka | Povinné rozlišení | Rozsah |
|---|---|---|---|
| Zpráva | Co se stalo? | Ověřená nová informace, kontext, dopad; názor autora do textu nepatří | 300–800 sl. |
| **Číslo dne** | Které jedno číslo dnes něco mění? | Rychlá zpráva s přesahem — jeden úderný aktuální údaj + kontext + „a proč na tom záleží" | 300–700 sl. |
| **Kontext** | Co se doopravdy děje a proč? | Vysvětlující text s jasným úhlem: aktuální podnět → mechanismus → sázky | 500–1400 sl. |
| Explainer | Jak to funguje / kdo je kdo? | Rozložit složitou věc do kroků bez falešného zjednodušení | viz níže |
| Datová analýza | Co data ukazují a proč? | Definice, metoda, srovnání, mechanismus, limity, význam | 500–1500 sl. |
| Investigace | Co bylo skryté a kdo odpovídá? | Původní zjištění, dokumentace, právo na vyjádření, vysoký důkazní standard | dle věci |
| Reportáž | Jak to vypadá pro skutečné lidi? | Pozorování, scény a citace získané reportováním; širší kontext | dle věci |
| Rozhovor | Co ví nebo tvrdí konkrétní člověk? | Přesná citace, kontext, editace bez změny smyslu, férové otázky | dle věci |
| Komentář | Jak autor hodnotí známá fakta? | Jasně označený názor, transparentní argument, poctivě podaný protinázor | 400–1000 sl. |
| Komparace / řešení | Co jinde fungovalo a co lze přenést? | Intervence, měřitelný výsledek, náklady, podmínky a limity přenosu | 500–1200 sl. |

Série mají navíc vlastní logiku: **volby** (cr/německo/usa/…) — predikce, výsledky, přesuny voličů; **mandáty / modely** — přepočet hlasů na mandáty, přiznaná nejistota modelu; **podcast** — viz Část IV.

## Číslo dne — náš specifický útvar
Rychlá zpráva s přesahem. Stojí na **jednom aktuálním, úderném čísle**, které buď překvapí, nebo obrací zažité očekávání — a text ho v pár odstavcích zasadí do kontextu a řekne, proč na něm záleží.
- **Otvírák = to číslo**, hned a s kotvou. (Vzory z webu: „75 % úmrtí způsobených horkem v Mexiku připadá na lidi mladší 35 let"; „Číslo dne: 20 milionů dolarů (nestačilo)".)
- **Přesah, ne jen údaj**: co číslo mění na tom, co jsme si mysleli; koho se týká.
- Krátké, jeden zdroj nebo dva, žádná rozbíhavá struktura. Když téma unese víc, je to spíš Kontext nebo Analýza.

## Explainer a long-read (průvodce)
Explainer má u nás **dvě měřítka** a je důležité je nezaměnit:

**Krátký koncept-explainer (~400–600 slov)** — vysvětlí jeden pojem nebo ukazatel (co je úhrnná plodnost, co je DRG, co je obstrukce). Typický v datových speciálech. Jeden koncept, žádná odbočka.

**Dlouhý explainer / průvodce (long-read, ~1000–2600 slov)** — pro složité, vyvíjející se kauzy, kde čtenář potřebuje provést celou věcí (naše články o CNN, BBC, ČT v sekci Svobodná média jsou právě tohle, ne krátké explainery). Osvědčená kostra, kterou lze skládat podle potřeby:
1. **Otvírák** — kde věc právě teď stojí a proč to má číst.
2. **Kdo je kdo** — aktéři a jejich zájmy, přehledně.
3. **Časová osa** — jak jsme se sem dostali (klidně komponenta Timeline).
4. **Co to fakticky znamená** — jádro výkladu, mechanismus a sázky.
5. **Co se (za)tím nestalo / co je otevřené** — poctivé hranice: co ještě nevíme.

Long-read není „delší zpráva". Drží tah (Cadwalladr) a jasně pojmenované sázky; každý oddíl posouvá porozumění, ne délku. Pokud oddíl jen přidává slova, škrtni ho.

---

# ČÁST VI — FACT-CHECKING

## Čtyři vrstvy kontroly
1. **Zdroj** — je primární, aktuální a dohledatelný? Nezaměňujeme tiskovou zprávu za původní data?
2. **Definice** — měří ukazatel to, co tvrdí věta? Nezměnila se metodika nebo jmenovatel?
3. **Výpočet** — lze číslo reprodukovat? Jsou jednotky, období, ceny a zaokrouhlení konzistentní?
4. **Interpretace** — připouští důkaz naši sílu tvrzení? Existuje jiné rozumné vysvětlení?

## Zdrojová hierarchie
Primární data a dokumenty instituce → metodika, metadata a revize → odborné studie a transparentní analýzy → sekundární média pro kontext → databáze a agregátory jako vodítko, ne automatická autorita.

## Povinný záznam ke každému číslu
Přesný název zdroje, vydavatel, datum, odkaz nebo soubor · použitá tabulka, proměnná, filtr a období · výpočet nebo transformační krok · datum stažení a verze dat · známé limity, chybějící hodnoty a metodické zlomy. Nejisté číslo se nehádá: použije se doložený interval, nebo se tvrzení vypustí.

## Kontrola grafu a vizuálního tvrzení
Titulek je tvrzení, ne téma · osa, jednotka, období, populace a zdroj jsou viditelné · barva nese stabilní význam (stejná barva neznamená dvě věci) · klíčové hodnoty nejsou jen v tooltipu · mapa nenahrazuje přesnější seřazený graf, pokud by zkreslovala malé země či historické hranice · graf ukazuje nejistotu a kategorii „unknown", pokud ovlivňují čtení · alt text shrnuje zjištění, ne vzhled.

---

# ČÁST VII — PROVOZ

## Povinný začátek každého zadání
Urči projekt a žánr → načti tento manuál → načti projektovou kapitolu → vypiš hlavní tvrzení a potřebné důkazy → založ zdrojový záznam → teprve pak piš.

## Minimální brief
Pro koho text je a co má po přečtení vědět nebo umět · jedna hlavní otázka a pracovní odpověď · žánr a rozsah · primární zdroje a datová omezení · projekt, accent a komponenty · editor, termín, stav (research / draft / ready).

## Kontrola před publikací
- [ ] Otvírák je fakt nebo teze ze současnosti — ne obecný kontext, dávná historie ani vymyšlená anekdota
- [ ] Klíčové číslo je ukotveno ve srovnání; podíl má absolutní počet a jmenovatel
- [ ] Titulek je falsifikovatelná teze; mezititulky jsou teze, ne štítky
- [ ] Žádná vymyšlená osoba, scéna, citace, detail
- [ ] Protinázor podán férově, limity dat přiznané u tvrzení
- [ ] Žádná klišé, anglické kalky, hodnotící přívlastky u čísel, protichůdné konstrukce
- [ ] Čísla, jednotky a rozsahy podle Části II; pomlčky en-dash
- [ ] Odkazy mají popisné názvy a vedou na konkrétní zdroj
- [ ] Graf nese vlastní informaci, titulek je tvrzení, barva má stabilní význam, hodnoty čitelné bez hoveru
- [ ] Žánr je z textu i označení jednoznačný
- [ ] Metadata, zdrojová patička, datum a autor sedí
- [ ] Text přečten nahlas (u audia/videa i test podání)
- [ ] Konec dokončuje myšlenku, ne rekapituluje

## Správa a verzování pravidel
Kanonická verze je tento soubor v repozitáři **mahdalova-skop**. Ostatní návody na něj odkazují a obsahují jen projektové dodatky nebo hloubkové rozbory. **Nesmí vzniknout** druhý „obecný" manuál, projektový návod tiše měnící společné standardy, pravidlo uložené jen v chatu, neoznačená kopie v jiném repu ani pokyn pro AI bez odkazu na platnou verzi.

Každá změna pravidel uvede: co se mění a proč · zda jde o univerzální, žánrové, nebo projektové pravidlo · které pravidlo nahrazuje · datum účinnosti a vlastníka · příklad před/po, mění-li se jazyk nebo komponenta.

---

# Registr zdrojů a projektových kapitol

**Projektové kapitoly** (vzhled, komponenty, zdroje, lokální nuance):
- Data pro budoucí premiérku — `apps/web/SPECIAL.md`, `apps/web/DPBP_WRITING_GUIDE.md`
- Karlovy Vary v datech (KVIFF) — `apps/web/KVIFF_WRITING_GUIDE.md`
- Další speciály (mahdalova-skop.cz, datajournalism.studio, Sněmovna.DataTimes, Mandáty.cz…) — lokální pravidla se doplňují až z doložených podkladů, nevymýšlejí se.

**Vizuální systém:** `DESIGN.md` (a `data-pro-premierku/DESIGN.md`).

**Hloubkové reference** (podřízené tomuto manuálu):
- Metoda vyprávěcího stylu — `docs/redakcni-styl/NAVOD_STYL_TRESNAK.md`
- Datová žurnalistika s příklady — `docs/redakcni-styl/STYL_DATOVA_ZURNALISTIKA.md`

**Čtenářská verze:** redakční booklet (DataTimes, .docx) — odvozený z tohoto zdroje.

---

*Píšeme tak, aby čtenář přesně věděl, co se stalo, jak to víme, proč na tom záleží a kde končí naše jistota.*

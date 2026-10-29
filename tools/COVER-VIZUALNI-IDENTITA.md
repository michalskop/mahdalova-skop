# Vizuál coverů a balík výstupů: jak najít motiv a udržet naši identitu

Doplňkový manuál k [COVER-EDITOR.md](COVER-EDITOR.md). Ten určuje **technická pravidla** (pět formátů, bezpečné zóny, písma, štítek, logo, generátor) a při rozporu platí on. Tady je **tvůrčí část**: jak k článku vymyslet motiv, ať je cover na první pohled náš, jak pracovat s fotkou i bez ní a jaký **balík výstupů** (covery, carousel, animace) patří ke každé publikaci. Vychází z coverů, které Kateřina schválila nebo opravila (říjen 2026), a platí od 25. 10. 2026.

Zadání pro AI je v [PROMPT-COVER.md](PROMPT-COVER.md), paleta v `packages/ui/DESIGN.md`.

---

## 1. Co dělá cover naším

Pevné prvky, které drží řadu coverů pohromadě, ať je motiv jakýkoli:

- **Tmavé pozadí** brandNavy.9 `#101432` se zářemi tmavých odstínů palety (index 9: brandOrange.9 `#663200`, brandDeepRed.9 `#431320`, brandTeal.9 `#023440`…). Záře dává hloubku, nikdy neonový efekt.
- **Písma IBM Plex:** Serif Bold jen titulek a nápis loga, všechno ostatní Sans.
- **Štítek nad titulkem:** `ANALÝZA • TÉMA`, první část karmínová s podtržením.
- **Logo DataTimes.cz:** kolečko vlevo, nápis vpravo, volně a bez podkladu (žádná „pilulka“ ani kruh), v klidnějším dolním rohu.
- **Velký motiv**, který vyplní plochu. Kde to jde, má ale **vlastní plochu vedle textu** (kapitola 1.1); text přes motiv jen tam, kde motiv musí zabrat celý formát (tečková mapa ČR, fotka jako podkres), a pak s halo v barvě pozadí.
- **Barvy jen z palety.** Motiv má 1–2 výrazné barvy, vedlejší vrstvy jsou tlumené odstíny téže škály.
- **Hravost:** v řadě karet na homepage má cover zaujmout a vypadat jako sourozenec ostatních. Technicky správný, ale nudný cover je špatný cover.

### 1.1 Kompozice: text a obraz vedle sebe, ne přes sebe

Pravidlo od 26. 10. 2026 (Kateřina u OG coveru Brazílie, 2. kolo: „vycentrování na tomhle formátu není odůvodněné, mapa mohla být na straně a texty na druhé straně“).

- **Kde je to vhodné, text a obrázek se nepřekrývají.** Na širokých formátech (OG 1200×630, homepage 1500×1200) dej motiv (mapu, vlajku, ikonu, fotku) na jednu stranu a text na druhou, **mapa vpravo, text vlevo**. Středové vrstvení textu přes ztlumený motiv je výjimka, ne výchozí volba.
- **Výjimky, kdy překryv dává smysl:** motiv, který musí zabrat celou plochu (tečková mapa ČR přes celý cover, fotka jako podkres, tečková „slunečnice“ u citlivých témat), nebo formát na výšku, kde motiv leží pod textem.
- **OG (1200×630) = „čtverec s ušima“ – výchozí od 26. 10. 2026 (Kateřina):** střed OG je přesně čtvercový cover zmenšený na 630 × 630, tedy bezpečná zóna, kterou WhatsApp a Messenger ořezávají; do stran se jen protáhne stejné pozadí se září a přechod mezi středem a boky je rozmazaný. Proč: náhled odkazu se ukazuje buď celý (Facebook, X, LinkedIn), nebo oříznutý na střední čtverec (WhatsApp, Messenger); samostatné široké rozvržení motiv buď usekne, nebo ho musí ztlumit pod textem. Jedna kompozice pro oba případy = cover se všude pozná a motiv je v plné síle. `cover-generator.cjs` to dělá sám: pozadí se zářemi je jedno souvislé přes celou šířku 1200 a obsah čtverce na něm leží bez vlastního pozadí (`html(…, { ucha: true })`). Nikdy boky nenatahovat ani nerozmazávat z obrázku – pokusy s rozmazanou kopií a nataženým krajním pruhem dělaly švy a „rozpité skvrny“ (Kateřina 26. 10.). Výjimka: motiv přirozeně široký nebo fotka, která vyplní šířku (Brazílie, trest smrti) – pak vlastní `format.og` (text vlevo od x 285, logo pod ním, motiv vpravo celý vidět, nebo `stred: true`). Barvy záře volit tak, aby boky navazovaly na motiv (u trikolóry záře v jejích tónech). V náhledech kreslit bezpečnou zónu OG čárkovaně.
- **Propojení přes ztmavený okraj (OG Brazílie, 26. 10.):** motiv smí dojet až k textu, když jeho strana u textu plynule mizí do tmy (scrim v barvě pozadí, jako na Instagramu). Pak se text a obraz „skloubí“, ale text nikdy neleží přes plnou barvu motivu. V OG drží text rezervu asi 30 px uvnitř středního čtverce (start x ≈ 315), motiv smí zajet i pod text (Kateřina: „klidně ať zasahuje pod ten text“), když jeho část pod textem je ztmavená přechodem; silnější přechod jen pro jeden formát: `pro.og.motiv.scrim`.
- **Homepage:** text vlevo od x 180, motiv vpravo, pravý horní roh (x ≥ 950, y ≤ 280) volný pro štítek rubriky. Když se titulek nevejde vedle motivu, zalom ho jinak (přes `pro.homepage.titulek`), motiv zmenši, nebo ho pod textem plynule ztmav (viz propojení výše); přes text nikdy v plné barvě.
- **Technicky:** v `cover.config.cjs` `format.og = { stred: false, box: [285, …] }` vypne středové rozvržení OG; `pro: { og: { titulek, nad, pod, logo: 'vlevo' } }` upraví texty a polohu loga jen pro jeden formát; `motiv.pozice` posune motiv. Vzor: `volby-brazilie-2026-10-25-druhe-kolo-vyhrava-lula` (homepage i OG: velká mapa vpravo zajíždí pod text a pod titulkem jemně prosvítá, scrim [30, 62]; Kateřina 26. 10.: „klidně to použij v tomto duchu“).
- **Kontrola:** na kontaktním archu (`tools/kontaktni-arch.cjs`) se nesmí žádný text dotýkat motivu v žádném z pěti formátů.

## 2. Nejdřív věta, pak obraz

Než začneš kreslit, napiš jednou větou, co má čtenář z coveru pochopit za tři sekundy. Většinou je to hlavní zjištění článku: „Dívek v léčbě je třikrát víc.“ Motiv pak má **tu větu ukázat**, ne ilustrovat téma obecně.

Test: zakryj titulek. Pozná čtenář z motivu aspoň směr zjištění (víc × míň, kde, kdo)? Když ne, motiv je jen dekorace.

**Titulek coveru má dát informaci, ne holé číslo** (Kateřina 26. 10., cover „Obce utratily 519 miliard korun“): samotná částka neřekne, jestli je to hodně, nebo málo. Číslo zasaď do srovnání („Obce hospodaří s pětinou toho, co utratí stát“) nebo ho nahraď zjištěním. Titulek ani podtitulek nesmí zbytečně zpochybňovat instituci, o které článek vysvětluje (u radnic ne „starostu si přímo nevolíme“). Štítek nad titulkem neopakuje titulek: u rozcestníku „Komunální volby 2026“ je ve štítku „Volby do obecních zastupitelstev“.

### 2.1 Cover musí říkat to, co článek (ponaučení z Data pro budoucí premiérku, 28. 10. 2026)

Cover je tvrzení o článku, a proto platí stejná pravidla jako pro text: každé číslo a každá věta na něm musí sedět s hotovým (revidovaným) článkem.

- **Cover se dělá až z posledního znění článku.** Titulek, podtitulek, čísla v grafu i popisky se kontrolují proti textu článku a proti skriptu v jeho `_data_pipeline/`. Kdo mění titulek nebo číslo v článku, přegeneruje i cover, než jde cokoli ven.
- **Kontrola před ukázkou:** (1) titulek coveru je tvrzení, které článek dokládá; (2) každé číslo na coveru najdu v článku nebo v jeho `_data_pipeline/` s odkazem na zdroj; (3) rok, jednotka a skupina (např. „lidé ve věku 15–64 let“, „děti do tří let“) jsou stejné jako v článku; (4) motiv ukazuje data z článku, ne jiná.
- **Odstrašující příklad (říjen 2026):** covery kapitoly Demografie vznikly dřív než revize textů. Po revizi nesedělo osm z deseti: jesle „5 % × 35 %“ (správně 7,9 % × 40,6 %), Švédsko „1,50 → 1,97, dnes 1,45“ (správně 1,54 → 1,98, 1,42), „v roce 2040 jen 1,8“ (správně 2,5; 1,8 je až rok 2060), Togo „16 mil.“ (správně 14,0 mil. v roce 2050).
- **Hlavička coveru speciálu** má pevně dva řádky vlevo i vpravo, oba bloky svisle vycentrované na společné ose: vlevo logo speciálu a název („Data pro budoucí / premiérku“), vpravo štítek „ANALÝZA“ a na novém řádku „01 DEMOGRAFIE“ (číslo a název části, bez slova „kapitola“ a bez odrážky, která štítek zalamuje).

## 3. Rozcestí: máme fotku?

| Situace | Cesta | Kapitola |
|---|---|---|
| Článek stojí na datech, fotka není nebo by nic nepřidala | datový motiv z čísel článku | 4 |
| Článek stojí na člověku, místě nebo události a máme fotku s právy | fotografický cover | 5 |
| Téma má dobrou vlastní fotku Kateřiny (ilustrační složka, série z mobilu) | vlastní fotka jako podkres pod datový motiv nebo titulek | 5.1 |
| Mediální kauza, spor o to, co kdo napsal | koláž výstřižků | 4.4 |
| Citlivé téma (zdraví, násilí, děti) | vždy abstraktní motiv, i když fotka existuje | 6 |

## 4. Bez fotky: motiv z dat

Motiv se kreslí ze **skutečných čísel článku**, ideálně ze stejného výstupu `_data_pipeline/`, ze kterého vychází text. Každé číslo na coveru musí být v článku.

**Styl není striktně předepsaný.** Vzory níže jsou osvědčené cesty, ne povinný katalog. I obyčejný graf, třeba spojnicový, může být velmi funkční cover, když má dobrý podkres (fotku, mapu, záři v barvě palety) a dobrou kompozici: velký přes plochu, s jasně zvýrazněnou změnou a s titulkem, který ji pojmenuje. Špatně je jen holý graf nebo samotné číslo na prázdné ploše, infografika z pár pruhů bez nápadu a cokoli, co by v řadě karet vedle ostatních coverů působilo jako pracovní výstup.

### 4.1 Tečková mapa ČR: když jde o místo

Volby, obce, kraje. Tečková mapa republiky přes celý cover, body obcí nebo okrsků zvětšené či obarvené podle hodnoty z článku. Jedno zvýrazněné místo dostane jméno přímo u tečky. Vzory: `analyza-2026-10-23-referenda-vetrne-elektrarny` (větrník v každé obci s referendem), `volby-cr-2026-10-24-marianske-lazne-kupovani-hlasu`, `volby-cr-2026-10-21-kolik-stoji-volby` (tečková mapa obcí). Podrobnosti o OG a popiscích jsou v *Ponaučení z oprav* v COVER-EDITOR.md.

### 4.2 Tečková jednotka a „slunečnice“: když jde o počet a změnu

Vzor: `analyza-2026-10-25-poruchy-prijmu-potravy` (Kateřina: „sdělení je v tom nádherně vidět“).

- **Jedna tečka = pevný počet lidí** (tady 10 dívek). Legenda to říká přímo na coveru („1 tečka = 10 dívek“).
- **Tečky leží na Vogelově spirále** (zlatý úhel, poloměr `c·√i`), jako semínka ve slunečnici. Disk roste od středu, takže **plocha je přesně úměrná počtu**: trojnásobek je vidět bez čtení čísel.
- **Před a po v jednom tvaru:** vnitřek disku = výchozí rok v tlumeném odstínu (brandOrange.8), přírůstek = zářivá barva (brandOrange.6). Oko hned vidí, kolik přibylo.
- **Tvar s náznakem:** disk připomíná květinu. Motiv smí jemně evokovat téma (růst, dívky, živé), ale zůstává abstraktní a datový. Obraz má být poctivý graf a zároveň hezký tvar, ne doslovná ilustrace.
- **OG (1200×630):** v kraji vlevo malý disk výchozího roku, vpravo velký disk cílového roku, oba ve **stejném měřítku** s popiskem roku. Titulek zůstává ve středním čtverci.
- Kód: `_cover_pipeline/motiv.cjs` u článku (konstanty z dat, `FORMATY` s polohou disku pro každý formát). Přepoužitelné na každé „X lidí → Y lidí“: počty pacientů, kandidátů, obcí, žádostí.

**Animace slunečnice** (Kateřina 25. 10. 2026: „úplně luxusní v těch třech odstínech“): disk roste rok po roku, **tři odstíny**: výchozí rok tlumeně (brandOrange.8), přírůstek zářivě (brandOrange.6) a tečky přibylé v právě ukazovaném roce světle (brandOrange.3), dokud nezačne další rok.

**Ponaučení z animace (25. 10. 2026), platí i pro statické covery:**
- **Jedno sdělení, žádné zbytečně přesné detaily.** Cover ani animace nejsou místo pro přesná čísla (1 199 → 3 858, počty za jednotlivé roky, popisek zlomového roku). Stačí titulek s hlavním sdělením a krátký dovětek („je dnes třikrát víc“ + „než v roce 2010“). Přesná čísla patří do článku a carouselu.
- **„Dnes“, ne rok dat.** Nejčerstvější data komunikujeme jako „dnes“: titulek „je dnes třikrát víc“, počítadlo animace na konci ukáže „dnes“ místo letopočtu. Nekomunikovat čísla z jiného roku, než je výchozí a dnešní.
- **Počítadlo jen s rokem**, bez počtu lidí, ať čtenář neřeší, proč se mluví zrovna o tom roce.
- **Legenda pod motivem**, ne v bloku textu: titulek nahoře, motiv o kus výš, pod ním legenda na střed motivu.
- **Jednotka („1 tečka = 10 dívek“) může stát svisle** u pravého okraje, otočená o −90°, nenápadně ztlumená. Je to informace „z boku“, nesoutěží s titulkem.
- **Animace začíná i končí stavem „dnes“.** První snímek je náhled videa a GIFu (a jediné, co ukáže poštovní program bez animací), proto na něm musí být hlavní sdělení: plný dnešní stav. Pak se motiv stáhne na výchozí rok, doroste zpátky do dneška a smyčka navazuje bez skoku.
- **Logo v animacích a kartách pro sítě nahoře** na řádku štítku (`logo: 'nahore'` v konfiguraci coveru): dole ho překrývá ovládání Instagramu, Reels a stories. Štítek se mu automaticky uhne, případně zmenší nebo zalomí.
- **Letopočet a „dnes“ lícují vlevo s titulkem** (stejná svislice jako „Dívek…“, „příjmu…“, „je…“). Zkoušeli jsme ho zarovnat těsně k okraji slunečnice; Kateřina chce jednu levou linku textu. Mezi letopočtem a motivem musí zůstat volné místo i u plného disku.
- **Logo nahoře zůstává** i v animacích a carouselu (Kateřina 25. 10.: „je to pěkné, necháme nahoře“). **Jen ve výstupech pro sítě** (`social/`): homepage cover pro web má logo vždy dole a pravý horní roh (x ≥ 950, y ≤ 280) prázdný, protože tam karty webu kreslí karmínový štítek rubriky. Při přenosu stylu animace na statické covery logo nahoru nedávat.

Varianty téže myšlenky: mřížka teček, tečky seskupené podle kategorií, víc disků vedle sebe pro srovnání skupin (vždy ve stejném měřítku).

**Sada tečkových motivů (`tools/cover-tecky.cjs`, od 26. 10. 2026).** Slunečnice je skvělá, ale nesmí se okoukat (Kateřina). Stejný princip (1 tečka = pevný počet, plná tečka = zpráva, prázdný kroužek = chybějící část) nesou i další tvary; v jedné dávce coverů je střídej:

| Motiv | Kdy | Vzor |
|---|---|---|
| slunečnice | počet a jeho změna „X → Y“ | `analyza-2026-10-25-poruchy-prijmu-potravy` |
| plástev (plný tečkový kruh / šestiúhelník) | počet, podíl rozptýlený v celku („každý druhý“ = rovnoměrně zvýrazněná každá druhá tečka) | `volby-cr-2026-09-01-komunalni-a-senatni-volby-2026-pruvodce` |
| tečkové sloupce | vývoj v čase (sloupec = rok), aktuální rok barevně | `volby-cr-2026-08-27-nejmene-kandidatu-do-obci-i-do-senatu` |
| mřížka (waffle) | procenta, srovnání skupin | – |
| hlasovací lístek | hlasy, křížky – **u voleb skutečné křížky, ne tečky** | `volby-cr-2026-09-02-jak-volit-do-zastupitelstva-obce` |
| prstenec („kormidlo“) | tečkový donut jako logo, tečky v mezerách sousední kružnice; schovaný pro témata, kde dává smysl kruh s výsečí – k účasti se nehodil | – |
| piktogramy | místo teček ikony: žena/muž (gender tvarem i barvou), osoba, kapka, srdce, větrník, domek; skládají se do všech tvarů | `volby-cr-2026-10-02-zeny-na-radnicich` |

Piktogramy potřebují víc místa než tečky: hrubší jednotka (1 postava = 5 %), nejvýš ~60 ikon na motiv. „Prázdný“ piktogram = plný tvar ztlumený na 40 %, obrysy drobných ikon splývají do řetízků. Rozesazení teček v kruhu má být těsné (každá tečka v mezeře mezi sousedy, jako dot-packing ve Flourishi), ne v rovných řadách s dírami.

### 4.3 Ikona série

Opakující se seriály (predikce, výsledky, kalkulačka) mají vlastní piktogram na stálém místě coveru. Vzory: `volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky`, `volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat`.

### 4.4 Koláž výstřižků

U mediálních kauz: 6–8 výstřižků titulků (jen hlavička a titulek, bez fotek lidí a bez prvků rozhraní), natočených a překrývajících se, přes závoj v barvě z palety. Vzor: `kontext-2026-09-28-novinarske-remeslo-nestoji-jen-na-utrzcich-od-policie`. Na červeném podkladu je štítek žlutý, karmínová by zanikla. Když Kateřina chce koláž „natáhnout“, myslí zvětšit, ne posunout.

**Výstřižky v malém rozlišení → jen jejich text.** Když jsou výstřižky menší než asi 800 px (screenshoty z webu, náhledy videí), na coveru 1500 px se rozmazávají a rozbíjejí kompozici. Pak se z nich vezme jen text: tři až čtyři krátké citace titulků v původním znění, vysázené jednotně jako papírové proužky (IBM Plex Sans Bold, navy na papírové bílé, tenký karmínový okraj vlevo, pod citací drobně zdroj a datum), v jednom sloupci s mírným střídavým natočením ±1–2°. Pořadí podle časové osy případu. Proužky nesmějí zakrýt obličej podkresové fotky ani zónu štítku rubriky. Vzor: `analyza-2026-10-02-trest-smrti-jako-lidske-selhani` (Kateřina 25. 10.: socha Spravedlnosti jako podkres, výstřižky učesat, „případně jenom použít text z nich a dát tomu jednotnější kompozici“).

### 4.5 Obrázek jako motiv

Hotový ilustrační obrázek (mapa, schéma) jako velká plocha přes cover. Vzor: `volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro`.

## 5. S fotkou: fotka je hlavní

### 5.1 Vlastní fotky Kateřiny jako podkres

Kateřina má velký archiv vlastních autorských fotek, často ve velmi dobré kvalitě. Smějí se používat jako podkres coveru podle stejných pravidel jako jakákoli jiná fotka, takže **není potřeba hledat agenturní ilustrační snímky**, když vhodná vlastní fotka existuje. Kde hledat:

- `Desktop\Mahdalova & Skop\Ilustrační obrázky\`
- série z mobilu na ploše: `Desktop\Z mobilu\`, `Desktop\Z mobilu 2025\`, `Desktop\Z mobilu 26-09-2024\`

Pozor: v ilustrační složce leží i převzaté obrázky (portréty známých lidí, umělecká díla, screenshoty). Jako podkres se používají jen **Kateřininy vlastní fotky**. U nejistého původu se zeptej. Kredit: „Foto: Kateřina Mahdalová“. Fotku vyber, ukaž ji Kateřině spolu s návrhem coveru a originál nech ve složce, do článku jde jen hotová kompozice.

**Fotka musí ilustrovat, ne vyplňovat.** Podkres nikdy nevybírat náhodně ani jen proto, že je hezký nebo po ruce. Cover nese sdělení článku a fotka ho má podpořit:

- **Nejdřív se podívej, co na fotce opravdu je** (místo, lidé, předmět, situace), a napiš si jednou větou, jak to souvisí s větou coveru (kapitola 2). Když vazbu nejde napsat bez natahování, fotka se nehodí.
- **Ořez a zvětšení musí mít důvod:** ukázat to, co ilustruje téma (budovu, o které článek je, prázdnou třídu, ulici z reportáže). Nezvětšovat fotku na náhodný detail, texturu nebo rozmazanou plochu, ze které nikdo nepozná, co na ní je.
- **Motiv a fotka se doplňují:** datová vrstva (graf, tečky, mapa) leží tam, kde fotka nechává klidné místo, a nezakrývá to, kvůli čemu byla fotka vybraná.
- **Když vhodná fotka není, žádná se nepoužije.** Datový motiv na tmavém pozadí (kapitola 4) je vždy lepší než podkres, který nic neilustruje.
- Odstrašující příklad: první návrhy coverů pro Data pro budoucí premiérku (říjen 2026) vzaly fotky z archivu nahodile a přiblížily je na detaily, ze kterých nebylo poznat nic. Takový cover nenese sdělení článku.
- Návrh vždy ukaž Kateřině i s tím, proč je vybraná právě tahle fotka.

Vlastní fotka může být hlavním motivem (kapitola 5) i tlumeným podkresem pod datovým motivem (graf, tečky, mapa přes ztmavenou fotku). Pro podkres platí totéž co pro závoj: silnější tmavá vrstva z palety, aby motiv i text zůstaly čitelné.

### 5.2 Pravidla pro fotografický cover

- **Když je fotka hlavním motivem, nese cover sama.** Text je jen štítek, titulek a případně krátký citát v uvozovkách se jménem, bez čísel, legend a ikon. (Fotka jako tlumený podkres pod datovým motivem viz 5.1.)
- **Výběr:** originál v nejvyšším rozlišení (ideálně 2400 px a víc), jasný hlavní motiv, klidná plocha pro text. Vždy autor a právo k použití.
- **Čitelnost:** závoj a scrim v tmavé barvě palety (navy, případně brandDeepRed.9 a další tmavé odstíny), silnější pod textem. Text nikdy přes rušné místo (obličej, nápisy na fotce).
- **Barva:** závoj drží dominantní barvu série nebo karty. Do frontmatteru dej `coverBg` stejnou barvou, ať případné pruhy na kartě splynou.
- **Ořez:** každý formát se ořízne zvlášť a hlavní motiv (obličej, budova) musí zůstat ve všech pěti formátech. Kontrolovat na kontaktním archu.
- **Okraje fotky nikdy tvrdě:** podkres musí plynule mizet do pozadí (v `cover-generator.cjs` SVG vrstva s radiální maskou), žádný viditelný obdélník fotky ani pruh pozadí nad ní. Obličej nebo hlavní motiv drží mimo zónu štítku rubriky (homepage x ≥ 950, y ≤ 280).
- **Formát souborů:** fotografické covery ukládat jako JPEG (PNG z generátoru má u fotky 1–2 MB, JPEG kolem 200 kB); `tools/kontaktni-arch.cjs` bere PNG i JPEG.
- **Nástroj:** `tools/poster-editor.html` / `npm run covers` (viz COVER-EDITOR.md), nebo `cover-generator.cjs` s fotkou vloženou do SVG vrstvy motivu (vzor trest smrti). Vzor s citátem: `kontext-2026-10-05-vaclav-havel-odkaz-vyroci-90-let`.
- **Fotka je zdroj, ne cover:** publikuje se vždy hotová kompozice. Fotky uvnitř článku jsou bez titulků a log (komponenta `<Figure>`).

## 6. Citlivá témata

U zdraví, duševních nemocí, násilí, dětí a obětí:

- **Jen abstraktní motiv** (tečky, tvary, mapa). Žádná těla, siluety, obličeje dětí, jídlo, váhy, metry, zbraně ani krev.
- Nic, co by mohlo sloužit jako návod nebo spouštěč (u poruch příjmu potravy žádná čísla o váze a kaloriích).
- Barva zůstává klidná a důstojná: sytá barva z palety, žádný poplašný červený efekt.
- Genderové barvy platí i na coveru: ženy brandOrange.6 `#f76800`, muži brandTeal.7 `#06677d`, nikdy růžová × modrá.

## 7. Barvy

- Každá série má vlastní převládající barvu (predikce × výsledky × analýza), ať se covery v řadě neopakují.
- Záře a závoje v odstínech 8–9 téže škály jako motiv, podtitulek v odstínu 1–2 téže škály (u PPP brandOrange.1 `#ffe0c7`).
- Dvě srovnávané skupiny nikdy červená × zelená (barvoslepí).
- Hexy jen přesně z palety, žádné vlastní mezistupně.
- **Záře v pozadí střídat** (Kateřina 26. 10.: „hodně moc toho gradientu mezi oranžovou a modrou“). Dvojice tmavých odstínů 8–9, které spolu ladí: oranžová × vínová (`#663200` × `#431320`), zlatá × čokoládová (`#a47d03` × `#3b2414`), tyrkysová × tmavě fialová (`#044d5e` × `#522a7a`), tyrkysová × královská modř (`#044d5e` × `#272a59`), švestková × královská modř (`#351040` × `#272a59`), oranžová × švestková (`#663200` × `#351040`), mátová × královská modř (`#042319` × `#272a59`), vínová × navy (`#621d30` × `#2f325c`). Nikdy máta se světle fialovou (jedovaté) a oranžová se zelenou. Barva motivu ladí se září (u mátové záře mátové tečky, ne oranžové).
- **Volby v Česku – rozcestníky a speciál: trikolóra** jako karta speciálu (`public/images/specials/volby-2026.svg`): tři rozmazaná světla brand.6 `#de1743`, background.2 `#f8f6f0`, brandRoyalBlue.6 `#4a51ab` a kolečko loga v trikolóře. Na tomto podkladu je karmínová část štítku špatně čitelná → `barvy.kickCervena` světlejší brand.2 `#ff8099`. Vzor `volby-cr-2026-08-06-komunalni-volby-2026`; generátor umí třetí záři (`barvy.glowC`).

## 8. Balík výstupů ke každé publikaci

Platí pro všechno, co jde ven na web nebo na sociální sítě (článek, speciál, číslo dne, podcast). Nikdo to nemusí zvlášť zadávat: kdo připravuje publikaci, připraví i tento balík a ukáže ho Kateřině.

| Výstup | Kdy | Formát | Kam se ukládá |
|---|---|---|---|
| **Pět coverů** (homepage, OG, čtverec, Instagram, story) | vždy | podle COVER-EDITOR.md | `images/` článku |
| **Instagram carousel** | vždy, když článek má aspoň dvě samostatná zjištění (graf, mapa, číslo) | 1080×1350 PNG, 5–10 slidů | `social/carousel/` článku |
| **Animace** (mapa nebo graf, který se proměňuje, překlikávání stavů, růst „slunečnice“) | když článek ukazuje změnu v čase nebo srovnání míst a stavů | MP4 (hlavní) + GIF (odvozený), viz níže | `social/animace/` článku |
| **Reels / stories video** | u silných témat, poskládané z carouselu a animací | MP4 1080×1920 | `social/animace/` článku |

**Carousel se skládá z obsahu článku**, nic se nevymýšlí znovu:

1. Slide 1 = cover-instagram (hák: hlavní zjištění), nebo **otázka k tipování** („U kterého prezidenta mají ženy největší podíl?“), na kterou odpoví další slidy.
2. Slidy 2 až n−2 = po jednom zjištění na slide: graf nebo mapa z článku překreslené na výšku 4:5, velké popisky, titulek slidu je tvrzení (stejné jako titulek grafu v článku).
3. Předposlední slide = jak jsme to počítali a co data neříkají (jednou dvěma větami).
4. Poslední slide = **výzva k interakci** + „Celý článek na DataTimes.cz“ a odkaz v biu; u citlivých témat kontakt na pomoc (např. Linka Anabell).

### 8.1 Výzva k interakci: v každém carouselu (povinné)

Od 28. 10. 2026 má každý náš carousel výzvu, aby lidé odpověděli. Převzali jsme to od týmu Moravec.cz, se kterým jsme dělali carousel k vyznamenáním, a Kateřina chce tenhle způsob komunikace s publikem používat vždy. Carousel není jen shrnutí článku, je to rozhovor.

- **Tip na začátku:** úvodní slide položí otázku, na kterou si čtenář může tipnout, než se dozví odpověď („Který prezident rozdal nejvíc vyznamenání? Tipněte si.“). Odpověď přijde v dalších slidech.
- **Názor na konci:** předposlední slide (poslední slide obsahu) se ptá na postoj a zve do komentářů. Vzor: „Zatímco Václav Havel rozdával vyznamenání po desítkách, Václav Klaus počty držel na minimu. Jaký z těchto přístupů je vám bližší? Dejte nám vědět do komentářů a sledujte dál náš sváteční datový speciál.“
- **Pozvánka na další díl:** když vychází série výstupů (sváteční speciál, volby), výzva láká na pokračování („pro odpovědi dnes sledujte naše sítě“).
- **Otázka musí jít z dat zodpovědět** a nesmí podsouvat odpověď. Tip musí mít jednoznačné řešení: „nejvíce žen“ je podle počtu jiný prezident než podle podílu, proto ptát se přesně. Otázky na názor stojí na doložené věci (Klaus Havlovy počty sám kritizoval), ne na naší interpretaci.
- **Stejná výzva i v textu pod carouselem** (`carousel-caption.txt`): otázka + „napište nám do komentářů“.
- **Úplně poslední slide je vždy poděkování a výzva k podpoře** (Kateřina 29. 10. 2026): „Máme vás rádi. Bez vaší podpory to nepůjde.“ a QR kód na podporu (Stripe odkaz ze `apps/web/components/common/SupportBanner.tsx`) s popiskem „Podpořte nás“. Generátor ho přidá sám na konec každého carouselu, v konfiguraci se nepíše; vypnout jde jen výjimečně (`bezPodekovani: true`). QR je `tools/podpora-qr.svg`, vyrobený lokálně balíkem `segno` v barvách DataTimes. Když se změní odkaz v SupportBanneru, QR přegenerovat (`python -c "import segno; segno.make('<odkaz>', error='m').save('tools/podpora-qr.svg', kind='svg', dark='#101432', light='#f8f6f0', border=2, xmldecl=False, omitsize=True)"`) a ověřit, že se z hotového slidu načte (např. `zxing-cpp`).

### 8.2 Pravidla obsahu carouselu (ponaučení z vyznamenání, 28. 10. 2026)

- **Čísla přesně jako v článku a ve stejné jednotce:** „71 vyznamenání z 547 obdržely ženy“, ne „71 žen z 547 oceněných“, když jeden člověk mohl dostat víc vyznamenání. Na všech slidech série stejná formulace.
- **Stejné měřítko os** na všech slidech, které čtenář porovnává (sloupce prezidentů): stejné číslo = stejná výška.
- **Chronologické pořadí** (Havel → Klaus → Zeman → Pavel).
- **Přechodné roky popsat:** „2003 (leden)“ u odcházejícího prezidenta, aby součty seděly s článkem.
- **Žádná nehotová data:** ročník, který ještě neproběhl (ohlášený počet na večerní ceremonii), do grafu nepatří, nebo musí být výrazně odlišený.
- **Poznámka k metodě srozumitelně:** „Počítáme všechna vyznamenání roku, i ta udělená při státních návštěvách, ne jen 28. října.“
- **Titulky slidů jsou doložená tvrzení,** ne výklad („Nejvíc vyznamenání ročně od Havla“, ne „Návaznost na Havlovu linii“). „Historicky nejvyšší“ jen pro období, které máme spočítané („nejvíc za rok od roku 1995“).
- **Slova z analýzy:** „oblast / za jaké zásluhy“, ne „profese“; „vyznamenání“, ne „metály“ či „ocenění“, když jde o řády i medaile.
- **Dekorace nesmí vypadat jako data:** barevné výseče přes medaile čtenář čte jako koláčový graf. Červená se zelenou navíc barvoslepí nerozliší.
- **Co-branding:** logo partnera (Moravec) nepřesouváme ani nezmenšujeme bez domluvy s partnerem.

Generátor: `tools/carousel-generator.cjs` + `_cover_pipeline/carousel.config.cjs` u článku:

```bash
PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <článek>/_cover_pipeline/carousel.config.cjs [čísla slidů]
```

Každý slide kreslí `cover-generator.cjs` (stejné pozadí, štítek, Plex, logo nahoře), obsah je SVG vrstva (graf překreslený na výšku, tečkový disk) nebo HTML blok (body, text, kontakt). Dole vlevo zdroj, vpravo „2 / 8“. Generátor sám hlídá, aby obsah nevjel do titulku ani patičky, a dává nezlomitelné mezery za jednopísmenná slova. Výstup `social/carousel/01.png …` a kontaktní arch `social/carousel-arch.png`; text pod carousel do `_cover_pipeline/carousel-caption.txt` (složka `social/` je mimo git, výstupy se vyrábějí znovu). Slide 1 je první snímek animace (stav „dnes“), pokud článek animaci má, jinak cover-instagram. Grafy: osa začíná nulou, popsat jen výchozí, zlomové a poslední hodnoty, blízké koncové popisky rozestoupit. Vzor: `analyza-2026-10-25-poruchy-prijmu-potravy`.

**Animace na homepage webu:** animaci lze dát přímo do karty článku jako GIF ve formátu homepage 1500×1200 (formát `homepage` v `animace.config.cjs` s `coverPro.homepage.logo = 'vlevo'`, GIF šířka 1000 do `images/cover-homepage-animace.gif`, ve frontmatteru `homepageImage`). Karta ho vykreslí jako obyčejný obrázek. Platí pravidla homepage coveru: logo dole, pravý horní roh volný pro štítek rubriky, první snímek = hlavní sdělení. Čtvercový GIF ze sítí s logem nahoře na homepage nepatří. **Animace webu jsou v Git LFS** (od 25. 10. 2026): `*.gif`, `*.mp4` a `*-animace.webp` v `images/` článků se v gitu ukládají jen jako odkaz, soubor leží na LFS úložišti GitHubu; Cloudflare Pages je při buildu stáhne (ověřeno testem). Statické covery do LFS nedávat: každé nasazení stahuje LFS soubory znovu a počítá se to do měsíčního limitu stahování GitHubu. Animovaný WebP proto vždy pojmenovat `…-animace.webp`.

Všechna čísla jsou totožná s článkem (DISTRIBUCNI_FORMATY.md). Identita je stejná jako u coverů: tmavé pozadí, IBM Plex, paleta, logo, žádný barevný proužek nahoře. Text pod carouselem podle `tools/social-cards/prompts/instagram-caption.md`.

**MP4, nebo GIF?**

- **MP4 je hlavní formát.** Video H.264, 30 snímků za sekundu, bez zvuku (hudbu lze přidat až v aplikaci Instagramu). Instagram (Reels, stories, feed), Facebook, LinkedIn, X i Bluesky berou MP4. Instagram GIF nahrát neumí. Rozměry: 1080×1920 pro Reels a stories, 1080×1350 pro feed, 1200×675 nebo 1080×1080 pro X a Bluesky. Délka jedné animace 5–15 sekund, Reels poskládané z carouselu a animací 20–40 sekund.
- **GIF je odvozený formát** ze stejných snímků: pro newsletter a e-maily (poštovní programy video nepřehrají), messengery, Slack a prezentace. Šířka nejvýš 800 px, délka do 8 sekund, velikost do 5 MB. Naše ploché barvy z palety se do GIFu vejdou bez ztráty kvality.
- **Na webu v článku** je lepší krátké MP4 ve smyčce bez zvuku než GIF: je několikanásobně menší a ostřejší.
- Animace vzniká stejně jako cover: snímky se vykreslí z dat přes Playwright (stejné SVG a písma) a teprve pak se zakódují do MP4 a GIF. Kódování dělá ffmpeg z `tools/media/` (balíček `ffmpeg-static` 5.3.0, ffmpeg 6.1.1, H.264 i GIF paleta). Je záměrně mimo npm workspaces, aby ho Cloudflare při deployi neinstaloval a výpadek stahování nemohl shodit nasazení webu. V nové kopii repa (i v každém worktree) jednou spusť `npm install` ve složce `tools/media`; instalace sama ověří otisk SHA256 binárky proti GitHub releasu a při neshodě ji smaže. Cesta k programu v Node: `require('./tools/media/node_modules/ffmpeg-static')`. Společný generátor animací je `tools/animation-generator.cjs`:

```bash
PW_PATH=<repo>/node_modules/playwright node tools/animation-generator.cjs <článek>/_cover_pipeline/animace.config.cjs [formát…] [--nahledy <složka>]
```

Konfigurace článku (`_cover_pipeline/animace.config.cjs`) převezme štítek, barvy a logo z `cover.config.cjs` (texty smí zkrátit) a barvy a geometrii motivu z `motiv.cjs`; sama dodává jen funkci `snimek(t, formát)`, která vrátí SVG motivu v čase `t`. Pozadí, štítek, titulek a logo kreslí `cover-generator.cjs`, takže animace vypadá přesně jako cover. Výstup: `social/animace/<nazev>-{story,instagram,square}.mp4` a `<nazev>.gif` (ze čtverce, šířka 800). Složka `social/` se na web nekopíruje. Render trvá asi 3 minuty na formát; `--nahledy` uloží kontrolní snímky v časech `nahledy` z konfigurace. Čísla čte konfigurace přímo z `_data_pipeline/vystup.txt`, nikdy je nepřepisuje ručně. Vzor: slunečnice u `analyza-2026-10-25-poruchy-prijmu-potravy` (disk roste rok po roku, vlevo jen letopočet a na konci „dnes“, legenda pod diskem, jednotka svisle vpravo; viz 4.2).

## 9. Postup krok za krokem

1. Věta, kterou má cover ukázat (kapitola 2), a cesta podle rozcestí (kapitola 3).
2. Čísla z `_data_pipeline/` článku: zapsat je do `motiv.cjs` jako konstanty s odkazem na zdroj. Před kreslením zkontrolovat, že cover odpovídá poslednímu znění článku (kapitola 2.1).
3. `_cover_pipeline/motiv.cjs` vyrobí `motiv-<formát>.svg`, `cover.config.cjs` nastaví text, legendu, barvy a logo, `tools/cover-generator.cjs` vyrenderuje všech pět formátů.
4. Kontaktní arch: všech pět formátů, karty 5:4 se štítkem rubriky, mobilní seznam, náhled 120×96, OG a jeho čtvercový ořez, mřížka Instagramu, zóny stories.
5. Carousel a případné animace podle kapitoly 8.
6. **Ukázat Kateřině:** kontaktní arch, homepage, OG, carousel a animace poslat jako náhled, tedy soubory přímo do chatu, ne jen zmínku „hotovo“. Platí i pro výstupy od pomocného agenta. Na web a sítě až po jejím souhlasu nebo pokynu.

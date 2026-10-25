# Vizuál coverů: jak najít motiv a udržet naši identitu

Doplňkový manuál k [COVER-EDITOR.md](COVER-EDITOR.md). Ten určuje **technická pravidla** (pět formátů, bezpečné zóny, písma, štítek, logo, generátor) a při rozporu platí on. Tady je **tvůrčí část**: jak k článku vymyslet motiv, ať je cover na první pohled náš, a jak pracovat s fotkou i bez ní. Vychází z coverů, které Kateřina schválila nebo opravila (říjen 2026).

Zadání pro AI je v [PROMPT-COVER.md](PROMPT-COVER.md), paleta v `packages/ui/DESIGN.md`.

---

## 1. Co dělá cover naším

Pevné prvky, které drží řadu coverů pohromadě, ať je motiv jakýkoli:

- **Tmavé pozadí** brandNavy.9 `#101432` se zářemi tmavých odstínů palety (index 9: brandOrange.9 `#663200`, brandDeepRed.9 `#431320`, brandTeal.9 `#023440`…). Záře dává hloubku, nikdy neonový efekt.
- **Písma IBM Plex:** Serif Bold jen titulek a nápis loga, všechno ostatní Sans.
- **Štítek nad titulkem:** `ANALÝZA • TÉMA`, první část karmínová s podtržením.
- **Logo DataTimes.cz:** kolečko vlevo, nápis vpravo, volně a bez podkladu (žádná „pilulka“ ani kruh), v klidnějším dolním rohu.
- **Velký motiv**, který vyplní plochu. Text, legenda a logo smějí ležet přes něj, čitelnost drží halo v barvě pozadí.
- **Barvy jen z palety.** Motiv má 1–2 výrazné barvy, vedlejší vrstvy jsou tlumené odstíny téže škály.
- **Hravost:** v řadě karet na homepage má cover zaujmout a vypadat jako sourozenec ostatních. Technicky správný, ale nudný cover je špatný cover.

## 2. Nejdřív věta, pak obraz

Než začneš kreslit, napiš jednou větou, co má čtenář z coveru pochopit za tři sekundy. Většinou je to hlavní zjištění článku: „Dívek v léčbě je třikrát víc.“ Motiv pak má **tu větu ukázat**, ne ilustrovat téma obecně.

Test: zakryj titulek. Pozná čtenář z motivu aspoň směr zjištění (víc × míň, kde, kdo)? Když ne, motiv je jen dekorace.

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

Varianty téže myšlenky: mřížka teček, tečky seskupené podle kategorií, víc disků vedle sebe pro srovnání skupin (vždy ve stejném měřítku).

### 4.3 Ikona série

Opakující se seriály (predikce, výsledky, kalkulačka) mají vlastní piktogram na stálém místě coveru. Vzory: `volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky`, `volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat`.

### 4.4 Koláž výstřižků

U mediálních kauz: 6–8 výstřižků titulků (jen hlavička a titulek, bez fotek lidí a bez prvků rozhraní), natočených a překrývajících se, přes závoj v barvě z palety. Vzor: `kontext-2026-09-28-novinarske-remeslo-nestoji-jen-na-utrzcich-od-policie`. Na červeném podkladu je štítek žlutý, karmínová by zanikla. Když Kateřina chce koláž „natáhnout“, myslí zvětšit, ne posunout.

### 4.5 Obrázek jako motiv

Hotový ilustrační obrázek (mapa, schéma) jako velká plocha přes cover. Vzor: `volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro`.

## 5. S fotkou: fotka je hlavní

### 5.1 Vlastní fotky Kateřiny jako podkres

Kateřina má velký archiv vlastních autorských fotek, často ve velmi dobré kvalitě. Smějí se používat jako podkres coveru podle stejných pravidel jako jakákoli jiná fotka, takže **není potřeba hledat agenturní ilustrační snímky**, když vhodná vlastní fotka existuje. Kde hledat:

- `Desktop\Mahdalova & Skop\Ilustrační obrázky\`
- série z mobilu na ploše: `Desktop\Z mobilu\`, `Desktop\Z mobilu 2025\`, `Desktop\Z mobilu 26-09-2024\`

Pozor: v ilustrační složce leží i převzaté obrázky (portréty známých lidí, umělecká díla, screenshoty). Jako podkres se používají jen **Kateřininy vlastní fotky**. U nejistého původu se zeptej. Kredit: „Foto: Kateřina Mahdalová“. Fotku vyber, ukaž ji Kateřině spolu s návrhem coveru a originál nech ve složce, do článku jde jen hotová kompozice.

Vlastní fotka může být hlavním motivem (kapitola 5) i tlumeným podkresem pod datovým motivem (graf, tečky, mapa přes ztmavenou fotku). Pro podkres platí totéž co pro závoj: silnější tmavá vrstva z palety, aby motiv i text zůstaly čitelné.

### 5.2 Pravidla pro fotografický cover

- **Když je fotka hlavním motivem, nese cover sama.** Text je jen štítek, titulek a případně krátký citát v uvozovkách se jménem, bez čísel, legend a ikon. (Fotka jako tlumený podkres pod datovým motivem viz 5.1.)
- **Výběr:** originál v nejvyšším rozlišení (ideálně 2400 px a víc), jasný hlavní motiv, klidná plocha pro text. Vždy autor a právo k použití.
- **Čitelnost:** závoj a scrim v tmavé barvě palety (navy, případně brandDeepRed.9 a další tmavé odstíny), silnější pod textem. Text nikdy přes rušné místo (obličej, nápisy na fotce).
- **Barva:** závoj drží dominantní barvu série nebo karty. Do frontmatteru dej `coverBg` stejnou barvou, ať případné pruhy na kartě splynou.
- **Ořez:** každý formát se ořízne zvlášť a hlavní motiv (obličej, budova) musí zůstat ve všech pěti formátech. Kontrolovat na kontaktním archu.
- **Nástroj:** `tools/poster-editor.html` / `npm run covers` (viz COVER-EDITOR.md). Vzor s citátem: `kontext-2026-10-05-vaclav-havel-odkaz-vyroci-90-let`.
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

## 8. Postup krok za krokem

1. Věta, kterou má cover ukázat (kapitola 2), a cesta podle rozcestí (kapitola 3).
2. Čísla z `_data_pipeline/` článku: zapsat je do `motiv.cjs` jako konstanty s odkazem na zdroj.
3. `_cover_pipeline/motiv.cjs` vyrobí `motiv-<formát>.svg`, `cover.config.cjs` nastaví text, legendu, barvy a logo, `tools/cover-generator.cjs` vyrenderuje všech pět formátů.
4. Kontaktní arch: všech pět formátů, karty 5:4 se štítkem rubriky, mobilní seznam, náhled 120×96, OG a jeho čtvercový ořez, mřížka Instagramu, zóny stories.
5. **Ukázat Kateřině:** kontaktní arch, homepage a OG poslat jako náhled (soubory, ne jen zmínka „hotovo“). Na web až po jejím souhlasu nebo pokynu.

## Ponaučení

- *25. 10. 2026 – „covery jsou hotové“, ale Kateřina je neviděla.* Hotový cover se vždy hned pošle jako náhled (kontaktní arch + homepage + OG), ne jen popíše v textu. Platí i pro covery od pomocného agenta.
- *25. 10. 2026 – vlastní fotky a volnost stylu.* Kateřinin archiv vlastních fotek se smí používat jako podkres (kapitola 5.1). Styl není striktně předepsaný, i spojnicový graf je dobrý cover, když má podkres a kompozici (kapitola 4).
- *25. 10. 2026 – slunečnice z teček (poruchy příjmu potravy).* Abstraktní tečková jednotka s plochou úměrnou počtu a s tlumeným „před“ a zářivým „přibylo“ unese citlivé téma i hlavní číslo zároveň. Kateřina ji chce jako vzor pro covery bez fotky.

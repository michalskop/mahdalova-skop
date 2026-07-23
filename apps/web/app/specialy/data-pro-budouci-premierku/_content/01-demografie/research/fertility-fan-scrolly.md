# Datový audit: fan chart změn úhrnné plodnosti

## Publikační použití

Scrollytelling v článku `01-proc-klesa-plodnost.mdx` porovnává změny úhrnné
plodnosti v pětiletých a desetiletých oknech s politickým cílem zvýšit českou
úhrnnou plodnost z 1,28 na 2,10, tedy o 0,82 dítěte na ženu.

## Vstup

Výpočet dodal Michal Škop ve čtyřech tabulkách:

- pětiletá okna, počáteční body;
- pětiletá okna, koncové body;
- desetiletá okna, počáteční body;
- desetiletá okna, koncové body.

Tabulky obsahují zemi, kód země, začátek a konec okna, úhrnnou plodnost,
změnu za celé okno, počáteční populaci, region a příjmovou skupinu. Zdrojem
řad je World Bank / UN Population Division.

## Rozsah

- 621 pětiletých oken;
- 732 desetiletých oken;
- vysokopříjmové země s více než milionem obyvatel podle dodaného výběru.

Odvozený publikační soubor `components/dpbp/FertilityFanScrolly/data.json`
spojuje počáteční a koncový bod podle kódu země a hranic okna.

## Důležité omezení

Zdrojové tabulky obsahují pouze začátek a konec každého okna. Vizualizace je
proto spojuje přímou úsečkou a netvrdí nic o průběhu v mezilehlých letech.

Současný pohyb plodnosti a zavedení rodinné politiky nedokazuje, že celé
zvýšení způsobilo dané opatření. Popisky proto rozlišují pozorovanou změnu od
kauzálního účinku.

## Kontrolní hodnoty

- maximum pětiletého souboru: Nový Zéland 2002–2007, +0,29;
- maximum desetiletého souboru: Rusko 2005–2015, +0,483;
- Švédsko 2000–2010: +0,44;
- Maďarsko 2011–2021: +0,40;
- Česko 2011–2021: +0,40;
- český politický cíl: +0,82.

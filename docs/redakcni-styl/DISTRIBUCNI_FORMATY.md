# Distribuční formáty — z jednoho výzkumu balík výstupů

Kanonickým zdrojem etiky, jazyka a datových pravidel zůstává
`REDAKCNI_MANUAL.md`. Tento dokument nic z toho neopakuje ani nemění —
řeší jen to, do jakých dalších formátů smí totéž zjištění putovat, kdy to
dává smysl pro dvoučlennou redakci a jak se který formát píše. Při rozporu
platí `REDAKCNI_MANUAL.md`.

## Princip

Jeden výzkum → jeden ověřený, kanonický web článek → z něj se odvozují
ostatní formáty pro jiná publika a situace. Web článek je vždy hotový
jako první a zůstává jediným zdrojem čísel a metodiky. Odvozené formáty:

- **nesmí uvádět jiné číslo ani jinou metodiku** než kanonický článek —
  žádné zaokrouhlení, výběr dat ani zjednodušení, které by změnilo závěr;
- **smí měnit jen řemeslo podání** (délku, jazyk formátu, vizuál) — stejně
  jako to Část IV manuálu už dělá pro audio a video;
- se aktualizují nebo stahují spolu s opravou kanonického článku (Část I,
  Opravy a errata) — oprava, která zůstane jen na webu a dál žije v threadu
  na X, je oprava napůl.

Ne každý výzkum unese celý balík. Rozsah repurposingu se řídí tím, jak
silné je zjištění a kolik kapacity dvoučlenná redakce reálně má — je lepší
udělat dva formáty pořádně než šest formálně.

## Mapa formátů

| Formát | Publikum / účel | Stav u DataTimes |
|---|---|---|
| Longread / analýza / série na webu | čtenář webu, jádro | **rutina** — Část V manuálu |
| Graf, mapa, infografika jako komponenta článku | čtenář webu | **rutina** — `VegaChart`/`ChartRow`, design viz `DESIGN.md` |
| Tweet-stories (X, Bluesky, Threads) | rychlé šíření, odkaz zpět na web | **rutina** — viz níže |
| Cover image / statistická karta | sdílení, náhled odkazu | **rutina** — stejná pipeline jako u tohoto článku (`_cover_pipeline/`) |
| Instagram carousel | vizuální publikum, mladší/jiné než web | **rutina, ale samostatná výroba** — viz níže |
| Podcast (Spotify, Apple), ~15 min | poslechové publikum, dojíždění | **rutina v menší frekvenci** — viz níže; navazuje na Část IV |
| Datový insight / myth-buster / podklad pro jiné redakce | novináři přebírající zjištění | **rutina, na vyžádání nebo proaktivně** — viz níže |
| Aktivní rozeslání politikům a odborníkům | přímí adresáti zjištění | **rutina u relevantních témat** — je to kanál, ne žánr, viz níže |
| Otevřená data ke stažení + metodika | výzkumníci, jiné redakce, ověřitelnost | **doporučujeme zavést jako standard** — chybí v původním seznamu, viz „Co doplnit" |
| Samostatný interaktivní graf / scrollytelling | čtenář webu u výjimečně silného zjištění | **výjimečně** — jen když zjištění unese vlastní stránku, ne jako defaultní výstup |
| Dashboard / interaktivní simulátor | opakované dotazování dat čtenářem | **výjimečně, projektově** — v repu existuje precedens (`docs/specialy/kviff/prototypes/`), ale je to samostatný vývojový náklad, ne automatický vedlejší produkt článku |
| Volební nástroje a kalkulačky (KohoVolit.eu) | volič připravující se na rozhodnutí | **sesterský produkt, ne odvozený formát** — propojujeme odkazem, nebudujeme znovu v rámci článku |
| Executive briefing / one-pager / PDF pro decision makers | úzký okruh rozhodovatelů | **výjimečně** — jen u témat s přímým dopadem na rozhodování (např. legislativa), ne jako plošný výstup |
| Expertní rozhovor | čtenář chce hlas autority k tématu | **není repurposing** — je to vlastní žánr Rozhovor (Část V), ne odvozenina článku |
| Mezinárodní verze | zahraniční publikum/redakce | **zatím neděláme rutinně** — viz „Co (zatím) neděláme" |
| Kapitola do knihy | čtenář knihy, dlouhý horizont | **příležitostně, ne plánovaně** — viz „Co (zatím) neděláme" |
| Audio příběh (long-form, ne podcast-digest) | poslechové publikum, hlubší forma | **výjimečně** — Část IV manuálu platí, ale jde nad rámec 15minutového formátu níže |

## Jak se který rutinní formát píše

### Tweet-stories (X, Bluesky, Threads)

Účel: dostat čtenáře z platformy na web, ne odvyprávět celý článek na
platformě. Reálný dosah bývá v desítkách tisíc, občas nižší stovky tisíc —
je to plnohodnotný distribuční kanál, ne doplněk, a platí pro něj stejná
etická laťka jako pro web (Část I): hook nesmí tvrdit víc, než co článek
unese.

- **Hák = jedno číslo s kotvou**, stejně jako u „Čísla dne" (Část V) — první
  příspěvek nese nejsilnější zjištění a nic jiného.
  - Doprovodný vizuál k háku (ořez grafu nebo statistická karta) prodává
    lépe než čistý text — použij existující grafovou/cover pipeline
    článku, nekresli nový graf ad hoc.
- **Dál 3–6 příspěvků, jedno zjištění na příspěvek**, každé s vlastní
  kotvou. Žádné souvětí — Část II pravidlo „jedna myšlenka na větu" pro
  audio platí tady stejně, protože se čte na mobilu za pochodu.
- **Poslední příspěvek = odkaz na článek** a jedna věta, proč dočíst dál
  (co v threadu není, ale v článku je — typicky metodika a limity dat).
- **Cross-posting, ne copy-paste:** kostra threadu je stejná napříč X,
  Bluesky a Threads, ale tón se drobně liší — Bluesky publikum čte datové
  detaily ochotněji, klidně jedna úroveň „wonk" navíc; Threads je
  konverzačnější; X zůstává výchozí formát pro délku a číslování.
- Neopravuje se každá platforma zvlášť — oprava kanonického čísla znamená
  opravit nebo smazat i thread, ne nechat ho žít s chybou.

### Instagram carousel

Nese ho vizuál, ne text pod ním. Jeden slide = jedno zjištění s jedním
grafem nebo číslem, styl podle `DESIGN.md` (fonty, barvy, ne further
zjednodušování dat). Výroba jde stejnou cestou jako cover image tohoto
článku — HTML šablona přes headless Chromium, ne ruční obrázek v jiném
nástroji, aby zůstala vizuální shoda s webem. Caption pod carouselem je
krátké shrnutí + odkaz do bia, ne přelepený text z X threadu.

### Podcast, ~15 minut, „hutný"

Navazuje na Část IV (psáno pro ucho, intro nejdřív vysloveno pak zapsáno,
signposty nahlas). Specifika krátkého formátu:
- **Jeden článek = jedna epizoda**, ne přehled víc témat.
- Manuálový limit „nanejvýš dvě tři čísla na segment" tady znamená
  **maximálně jedno hlavní a jedno vedlejší číslo na celou epizodu** —
  patnáct minut mluveného slova je zhruba 2 200–2 500 slov, na víc čísel
  není v hutném formátu místo.
- Nuance a limity dat (co manuál vyžaduje v článku, ČÁST III) se v epizodě
  zmíní jednou větou a odkážou na web — nejsou vystřižené, jsou zhuštěné.

### Datový insight / myth-buster / podklad pro jiné redakce

Krátký, čistě věcný backgrounder pro novináře, kteří chtějí přebrat
zjištění: metodika + klíčová čísla + limity, bez vyprávěcího rámce (ten
mají v kanonickém článku). Vždy odkaz na článek a na otevřená data (viz
níže). Cíl je usnadnit správnou citaci, ne získat čtenáře přímo.

### Aktivní rozeslání politikům a odborníkům

Není žánr, je to distribuční kanál navíc k publikaci — pošle se hotový
článek nebo jeho stručné shrnutí lidem, kterých se zjištění přímo týká
(tvůrci politiky, obor. odborníci). Platí stejná pravidla jako pro
kohokoli jiného čtenáře (Část I, transparentnost): žádná verze „na míru"
s jiným důrazem než veřejně publikovaná.

## Co doplnit (chybí v původním seznamu)

- **Otevřená data ke stažení + zdokumentovaná metodika.** U datové analýzy
  je to přirozený a levný vedlejší produkt (viz `REUTERS_INSPIRACE.md` —
  vlastní dataset je „levná superschopnost" malé redakce) a zvyšuje
  důvěryhodnost i dosah přes reuse jinými redakcemi a výzkumníky.
  Doporučujeme zavést jako standardní součást balíku u datových analýz,
  ne jako výjimku.
- **Sdílitelná statistická karta / „citátový" obrázek** jednoho čísla —
  menší jednotka než celý Instagram carousel, hodí se i samostatně k
  threadu nebo pro přebrání jinými médii/sítěmi. V zásadě podmnožina cover
  image pipeline, stojí za pojmenování jako vlastní formát.
- **Newsletter / e-mailové shrnutí** — web už má „newsletter/subscription"
  prvek v `DESIGN.md`, ale chybí obsahová konvence, jak do něj analýzu
  převyprávět. Stojí za budoucí doplnění, jakmile bude newsletter aktivní.

## Co (zatím) neděláme rutinně

- **Mezinárodní verze** — DataTimes stojí na civilní češtině a lokálním
  kontextu; překlad dává smysl jen u jednotlivého tématu s jasným
  zahraničním přesahem nebo poptávkou zahraniční redakce, ne jako součást
  standardního balíku.
- **Kapitola do knihy** — vzniká příležitostně z nahromaděné práce (typicky
  série), ne jako plánovaný výstup jednoho výzkumu.
- **Interaktivní simulátor / vlastní dashboard** a **executive
  briefing/PDF pro decision makers** — obojí je smysluplné jen u vybraných
  témat s dostatečnou vahou a jasným adresátem; pro dvoučlennou redakci je
  to projektové rozhodnutí od případu k případu, ne automatický krok po
  publikaci článku.
- **Expertní rozhovor** jako „odvozenina" článku — veď ho rovnou jako žánr
  Rozhovor (Část V manuálu) s vlastními pravidly, ne jako repackaging
  hotové analýzy.

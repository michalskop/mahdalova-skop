# Automatické publikování na sítě – pravidla (pilot: Bluesky)

Stav 4. 11. 2026, zkušební verze. Obsahová pravidla se nevymýšlejí znovu:
platí `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md` (Tweet-stories) a
`tools/social-cards/prompts/bluesky-thread.md`. Tady je jen to, co hlídá
automat.

## Tok

1. **Článek vyjde na webu** → objeví se v `https://www.mahdalova-skop.cz/rss.xml`.
2. **Návrh** (`node tools/social-publish/bluesky.mjs navrh`): skript vezme
   článek z RSS, stáhne z něj OG obrázek, titulek a perex a uloží návrh
   do `tools/social-publish/navrhy/<slug>.bluesky.json`. Text příspěvku
   napíše Xenia nebo Claude podle pravidel níže (zatím ručně do pole `text`).
3. **Schválení**: Kateřina nebo Michal. Bez schválení skript nic nezveřejní.
   Schvaluje se text i čas zveřejnění. (Později v hubu tlačítkem 👍.)
4. **Zveřejnění** (`node tools/social-publish/bluesky.mjs zverejnit <soubor> --schvalil "Jméno"`).
   Odkaz, náhled a jazyk doplní skript sám. Výsledná adresa příspěvku se
   zapíše zpět do návrhu, aby nešlo zveřejnit dvakrát.

## Vlákno s obrázky

Pod zveřejněný první příspěvek jde přidat vlákno (`navrhy/<slug>.bluesky-vlakno.json`):
každý příspěvek má `text`, volitelně `obrazek` (soubor v `navrhy/obrazky/` nebo URL)
s povinným `alt` textem, nebo `odkaz` (karta článku). Pilot: vlákno k článku
`volby-usa-2026-11-04-proc-vyhrali-demokrate`.

```
node tools/social-publish/bluesky.mjs vlakno-kontrola <soubor>
node tools/social-publish/bluesky.mjs vlakno <soubor> --schvalil "Jméno"
```

- Stavba: 2/ naše zjištění, další příspěvky po jednom zjištění, poslední „V článku: …“ s kartou.
- Obrázky: covery článku nebo otisk grafu či mapy z živé stránky (Playwright,
  element s titulkem, logem a zdrojem), do 1 MB, vždy s alt textem.
- Zveřejněné příspěvky se zapisují průběžně; doplněný příspěvek se připojí na konec
  vlákna, nic se nepošle dvakrát.

## Jednotná štábní kultura příspěvku

- **Stavba textu má dvě části** (Kateřina 4. 11. 2026):
  1. **Naše zjištění:** hák s jedním číslem s kotvou, tedy nejsilnější zjištění článku.
  2. **Navnazení:** co čtenáři v článku najdou navíc a proč se na něj jít podívat,
     například „V článku: proč…, jak…, co ukazují data o…“. Jen věci, které
     v článku opravdu jsou.
  Příklad: „Demokraté vzali republikánům sedm křesel v Senátu, mimo jiné
  v Texasu a Kansasu. Texas poslal do Senátu demokrata poprvé od roku 1988.
  ⏎⏎ V článku: proč voliči trestali Trumpa a jak se k demokratům přesunuli
  mladí lidé a Hispánci.“
- Jen čísla a tvrzení, která jsou v článku. Hák nesmí tvrdit víc, než článek unese.
- Jedna myšlenka na větu, civilní čeština, bez emoji, bez hashtagů v textu.
- Nejvýš **300 znaků** (limit Bluesky); skript delší text odmítne.
- Odkaz na článek nese **náhledová karta** s coverem `cover-og.jpg` (skript
  ji připojí sám), do textu se adresa nepíše.
- Jazyk příspěvku `cs`.
- Profese v obou rodech (lékaři a lékařky), na konci titulků bez tečky.
- Oprava čísla v článku = oprava nebo smazání příspěvku.

## Přístup

Heslo pro aplikaci (App Password) se **nikdy neukládá do repa**. Leží
v `C:\Users\datov\.datatimes\bluesky.env`:

```
BLUESKY_HANDLE=datatimes.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Pro ostrý provoz (nezávisle na notebooku) se stejné dvě hodnoty uloží jako
tajné proměnné (Secrets) do GitHubu a skript poběží v GitHub Actions.

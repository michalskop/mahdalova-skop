# Předávka: automatický balík výstupů pro sítě (carousel, animace MP4/GIF, Reels)

Zadala Kateřina 25. 10. 2026 v chatu „Mandlové matky a zdraví dětí“. Tenhle soubor vlož do nové session (nebo napiš „přečti `organizational structure\PREDAVKA-VYSTUPY-SITE.md` a pokračuj“).

## Stav převzetí

- **25. 10. 2026 převzato** do samostatné session „Cover images“ (větev `claude/cover-images-articles-98d356`). Session o článku o matkách a poruchách příjmu potravy se tím už nezabývá.
- Kapitola 8 *Balík výstupů* je v téhle větvi (cherry-pick z větve článku), zatím **nepushnuto**.
- Kanonická kopie předávky je tento soubor v repu; originál zůstává v `organizational structure\PREDAVKA-VYSTUPY-SITE.md`.
- Hotové kroky odškrtávat v sekci *Co postavit* níže.

## O co jde

Ke každé publikaci na webu nebo sítích má automaticky vzniknout **balík výstupů**, aniž by ho kdo zadával:

1. **Pět coverů** (homepage, OG, čtverec, Instagram, story): už funguje, `tools/cover-generator.cjs`.
2. **Instagram carousel** 1080×1350, 5–10 slidů, složený z obsahu článku (grafy, mapy, čísla). **Zatím chybí generátor.**
3. **Animace**: mapa nebo graf, který se proměňuje, překlikávání stavů, růst „slunečnice“ z teček. Hlavní formát MP4, z něj odvozený GIF. **ffmpeg hotový (`tools/media/`), generátor zatím chybí.**
4. **Reels / stories video** 1080×1920 poskládané z carouselu a animací. **Zatím chybí.**

Pravidla (co, kdy, formáty, MP4 × GIF, stavba carouselu) jsou už zapsaná a schválená: `tools/COVER-VIZUALNI-IDENTITA.md` → kapitola 8 *Balík výstupů*. Odkazuje na ně CLAUDE.md (cover rule) a `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md`. Úkolem nové session je postavit nástroje, které ta pravidla naplní.

## Co už v repu je (přepoužít, nevymýšlet znovu)

- `tools/cover-generator.cjs` + `_cover_pipeline/cover.config.cjs` a `motiv.cjs` u článků: Playwright render, IBM Plex, paleta, logo, štítek. Vzor bez fotky: `apps/web/app/clanek/_articles/analyza-2026-10-25-poruchy-prijmu-potravy/_cover_pipeline/` (tečková „slunečnice“).
- `tools/social-cards/` (`generate.mjs`, `presets.mjs`, `template.html`): karty do vláken ve formátech og, x-square, bluesky, ig-portrait, ig-story. Kandidát na základ carouselu, ale vizuálně musí ladit s covery (bez barevného proužku nahoře, viz jeho README *Ponaučení*).
- `tools/social-cards/prompts/instagram-caption.md`: text pod carousel.
- Grafy článků jsou Vega-Lite JSON v `data/` (komponenta VegaChart) nebo SVG/HTML z `_data_pipeline/`. Carousel je má překreslit na výšku 4:5 s většími popisky, ne fotit z webu.
- Playwright je v `node_modules` hlavního repa (`C:\Users\datov\Desktop\datatimes\mahdalova-skop\node_modules\playwright`), na Windows Chrome: `C:/Program Files/Google/Chrome/Application/chrome.exe`.

## Co postavit (návrh pořadí)

1. ✅ **HOTOVO 25. 10. 2026:** Kateřina schválila variantu `ffmpeg-static` 5.3.0 odděleně v `tools/media/` (mimo workspaces, pevná verze, kontrola SHA256 v `verify-ffmpeg.cjs`), otestováno MP4 H.264 1080×1350 i GIF s paletou. ~~**ffmpeg:** na počítači chybí. Navrhnout Kateřině způsob instalace (např. `winget install Gyan.FFmpeg`, nebo npm balíček `ffmpeg-static` v repu) a **počkat na její souhlas**, stahování programů schvaluje ona.~~
2. ✅ **HOTOVO 25. 10. 2026:** `tools/carousel-generator.cjs`, pilot 8 slidů u článku o PPP, čeká na Kateřinino schválení. Původní zadání: **Generátor carouselu** (např. `tools/carousel-generator.cjs` + `social/carousel.config.cjs` u článku): slide 1 = cover-instagram, slidy se zjištěními z grafů článku, slide „jak jsme to počítali“, poslední slide „Celý článek na DataTimes.cz“ (u citlivých témat kontakt na pomoc). Výstup `social/carousel/01.png …`.
3. ✅ **HOTOVO 25. 10. 2026:** `tools/animation-generator.cjs` (popis v COVER-VIZUALNI-IDENTITA.md kap. 8); pilot slunečnice hotový, čeká na Kateřinino schválení. Původní zadání: **Generátor animací** (např. `tools/animation-generator.cjs`): snímky z SVG přes Playwright → ffmpeg → MP4 (H.264, 30 fps, bez zvuku; 1080×1920, 1080×1350, 1080×1080) a GIF (paleta přes `palettegen`/`paletteuse`, šířka ≤ 800 px, ≤ 8 s, ≤ 5 MB). Výstup `social/animace/`.
4. **Reels:** složit slidy carouselu a animace s jednoduchými přechody do 20–40 s MP4 1080×1920.
5. **Pilot na vydaném článku** `analyza-2026-10-25-poruchy-prijmu-potravy`: carousel (hák, graf léčených dívek 2010–2025, HBSC graf, výzkum o řečech o váze, metodika, Linka Anabell), animace slunečnice rostoucí z 2010 na 2025 a animace sloupcového grafu, Reels. Všechna čísla jen z `_data_pipeline/vystup.txt` článku.
6. **Ukázat Kateřině** všechny výstupy jako soubory přímo do chatu (SendUserFile), ne jen popis.
7. **Zapsat do manuálu:** doplnit do `tools/COVER-VIZUALNI-IDENTITA.md` kapitoly 8 a do CLAUDE.md, jak nástroje spustit; odstranit větu „ffmpeg zatím chybí“.

## Hotovo znamená

- Jedním příkazem z konfigurace u článku vznikne carousel, MP4 a GIF a u pilotního článku jsou výstupy ve složce `social/`.
- Kateřina výstupy viděla a schválila.
- Manuál a CLAUDE.md popisují spuštění.
- Commit v pracovní větvi; **push do `main` jen na Kateřinin výslovný pokyn** (push = publikace), před pushem build.

## Pravidla, která platí

- Barvy jen z palety (`packages/ui/DESIGN.md`), IBM Plex, logo kolečko vlevo, žádný barevný proužek nahoře, žádná emoji.
- Citlivá témata: jen abstraktní motivy (tečky, tvary), žádná těla, jídlo ani váhy.
- Genderové barvy: ženy brandOrange.6 `#f76800`, muži brandTeal.7 `#06677d`.
- Česká typografie: jednopísmenné předložky a spojky nikdy na konci řádku (karty mimo web nejdou přes `fixCzechTypography`).
- Odpovídat česky, ukazovat průběh, chaty nearchivovat.

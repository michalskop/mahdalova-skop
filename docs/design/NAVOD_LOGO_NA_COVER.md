# Návod: logo DataTimes.cz na cover fotku

Jak zapéct logo (kolečko + bílý text „DataTimes.cz“) vpravo dole do coveru
článku – tak, jak to má např. cover u Babiše (benzin) nebo u Paula Steigera.

> Pro **grafy a vizualizace** se logo nepéká do obrázku ručně – používá se
> komponenta `ChartSignature` (viz `DESIGN.md`, sekce 10). Tento návod je jen
> pro **fotkové covery** (portréty, profily/medailonky).

## 1. Jak má logo vypadat (závazné)

**Zdroj pravdy = kanonické SVG:**
`…/0001 - DataTimes - identita, vizuál, kampaně/Logo + vizuál/datatimes-logo-final.svg`
(stejné cesty jsou i v `apps/web/components/common/LogoWithText.tsx`).

Kolečko jsou tři obloukové segmenty se zaoblenými konci (`stroke-linecap:
round`), poloměr 100, tloušťka 76, střed 250 × 250, celá skupina pootočená
o **−30°**:

- žlutá `#ffdc33`
- oranžová `#f76800`
- červená `#de1743`

Nad ně se **počtvrté** překresluje žlutý segment přes `linearGradient`.

**Pořadí překryvů (tohle se kontroluje očima!):**

- žlutá **přes** červenou u ocásku,
- oranžová **přes** žlutou v místě jejich styku,
- červená **přes** oranžovou nahoře.

**Pozor – gradient NENÍ plynulý přechod.** Má dvě zarážky **obě na 50 %**
(`stop-opacity 0` → `1`), takže jde o **tvrdý předěl po přímce**: žlutá je
u červeného ocásku plná a od poloviny se naráz stává průhlednou. Navíc je to
**prostorový** lineární gradient v bounding boxu žlutého oblouku
(vektor `(1; 0,5) → (0,25; 1)`), **ne** „podél oblouku“. Aproximace měkkým
přechodem podél oblouku vypadá špatně – nedělej to.

## 2. Umístění a rozměry na coveru

- **Vpravo dole**, pravý okraj ≈ 3,2 % šířky obrázku.
- Logo ≈ 150 px na obrázku šířky 2000 px; text ≈ 96 px.
- Font textu: **IBM Plex Sans Bold** (font webu). Když není po ruce (např.
  automatizace na Windows), použij **Segoe UI Bold** jako náhradu. Barva
  **bílá**, s jemným stínem kvůli čitelnosti na světlých místech.
- Cover se zobrazuje **jen na kartách 5:4 a v OG náhledu** – na detailu článku
  se plný cover nevykresluje. Karta ořízne ≈ 10 % nahoře i dole, takže **spodní
  hranu loga drž uvnitř bezpečné zóny** (u čtvercového obrázku 2000 × 2000 px
  spodní hrana ≤ ~1780 px), jinak se logo na kartě ořízne. Viz systém
  `coverFit` (`project` pravidla + `ArticleCard`).
- Výstup pojmenuj `…-datatimes.webp`, ve frontmatteru nasměruj `coverImage`
  na něj a **needitovanou předlohu z `images/` smaž** (ať se do `public/`
  nekopíruje nepoužitá fotka).

## 3. Jak to vyrobit

### Preferovaně: rasterizovat kanonické SVG

Otevři `datatimes-logo-final.svg` v libovolném nástroji, který umí SVG → PNG
s průhledností (vektorový editor, `resvg`/`rsvg-convert`, `inkscape`, `sharp`,
`cairosvg`, Figma…), vyexportuj logo v potřebné velikosti a vlož ho do fotky
vpravo dole podle rozměrů výše. Doplň bílý text „DataTimes.cz“.

### Fallback: reprodukce v Pythonu (když není SVG rasterizer)

Na některých strojích (včetně tohoto) **žádný SVG rasterizer není** –
cairosvg/sharp/Inkscape/ImageMagick chybí (`convert` ve `system32` je windowsí
nástroj na disky) a in-app prohlížeč neumí sejmout lokální SVG. Pak logo
reprodukuj **deterministicky** v `PIL + numpy`:

1. Každý oblouk vykresli „razítkováním“ vyplněných koleček (o poloměru poloviny
   tloušťky) podél jeho dráhy – to dá zaoblené konce i konstantní tloušťku.
   Kresli v pořadí **žlutá → oranžová → červená**.
2. Čtvrtý žlutý path: vytvoř masku pokrytí žlutého oblouku a **vynásob ji
   přesnou gradientovou půlrovinou** (`offset ≥ 0,5`), teprve pak slož navrch.
   Tím vznikne ten tvrdý rovný předěl – žlutá zůstane jen u ocásku.
3. Text vykresli bílým Segoe UI Bold s jemným stínem a badge slož vpravo dole.

**Parametry gradientu** (bounding box žlutého oblouku, souřadnice před
rotací −30°):

- bbox: `x ∈ [250; 336,60254]`, `y ∈ [300; 350]`
- `G1 = (336,60254; 325)`  ← `(x1,y1) = (1; 0,5)`
- `G2 = (271,65064; 350)`  ← `(x2,y2) = (0,25; 1)`
- `offset(p) = dot(p − G1, G2 − G1) / |G2 − G1|²`; **plná žlutá** tam, kde
  `offset ≥ 0,5`, jinak průhledná. Souřadnice pixelu je nutné převést zpět do
  této lokální (nerotované) soustavy, tj. pootočit o +30° kolem 250 × 250.

## 4. Kontrolní seznam

- [ ] žlutá přes červenou (ocásek), oranžová přes žlutou (styk), červená přes
      oranžovou (nahoře)
- [ ] tvrdý rovný předěl na žluté, ne rozmazaný fade
- [ ] logo vpravo dole, spodní hrana uvnitř bezpečné zóny 5:4
- [ ] bílý text, čitelný i na světlém pozadí
- [ ] soubor `…-datatimes.webp`, `coverImage` míří na něj, předloha smazána

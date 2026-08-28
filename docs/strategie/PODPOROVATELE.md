# Strategie podporovatelů DataTimes

Jak oslovujeme, získáváme a udržíme lidi, kteří platí za to, aby DataTimes
(mahdalova-skop.cz / datatimes.cz) existovaly. Podklad pro stránku `/klub`
a pro komunikaci na sociálních sítích.

- **Rozsah:** český web `apps/web`. Anglická verze pro datajournalism.studio
  a institucionální/partnerská linie jsou zatím mimo (viz Fáze 4).
- **Nadřazené dokumenty:** [Redakční manuál](../redakcni-styl/REDAKCNI_MANUAL.md)
  (§ *Transparentnost: financování a nezávislost*) — závazný. Celkový finanční
  model („šest zdrojů, tři fáze") žije v repu `impact-materials`
  (`projects/datatimes/`). Tato strategie rozpracovává **pilíř č. 1 —
  komunita a crowdfunding**.
- **Stav:** v2, 2026-08-28. Model, kanály, no-auth a „bez zdi ve v1" jsou
  rozhodnuté. **Konkrétní částky nejsou finální** (viz § 4 a § 11).

---

## 1. Východisko a ideologie

Z existujících materiálů:

- **Redakční manuál** má jediné psané pravidlo o penězích: externí a grantové
  financování **přiznáváme** (patička / o‑projektu), *zdroj peněz nesmí určovat
  závěr*, konflikt zájmů uvádíme přímo u textu. Žádná strategie podporovatelů
  dosud neexistovala.
- **Kdo jsme / Co děláme:** „Nezávislost. … Naše práce je financována
  z nezávislých zdrojů a **crowdfundingu**." Crowdfunding už veřejně slibujeme
  jako pilíř.
- **Deck (impact-materials):** *„Lhát je levné. Říkat pravdu je drahé. A proto
  pravda bez aktivní podpory nutně prohrává."* Model = **šest zdrojů**
  (komunita ✔ / granty ✔ / filantropie / mediální spolupráce / zakázky ✔ /
  vlastní investice ✔) ve **třech fázích**: Viability (~500 000 Kč, nyní) →
  Sustainability (~2 000 000 Kč, do 2 let) → Profitability.

### Právní forma (důležité pro rail i rámování)

- **DataTimes** (žurnalistika) běží pod **Michalem jako OSVČ**. Přechod na
  neziskovou formu je v úvaze, ale **nerozhodnutý a neudělaný**.
- **KohoVolit.eu** je samostatná pro-demokratická civic-tech nezisková
  organizace (Volební kalkulačka, Mandaty.cz) a **není vehiklem pro peníze
  DataTimes**. **Darujme.cz patří KohoVolitu**, ne DataTimes.
- **Důsledky pro `/klub`, dokud je DataTimes OSVČ:**
  - Žádné **Darujme.cz** a žádné **potvrzení o daru** (odečet z daní pro
    dárce) — to jde jen přes způsobilou entitu (nezisková, církev…).
  - Peníze jsou příjem OSVČ; u plátce DPH může „členství" spadat pod službu
    s DPH. *Ověřit s účetní / daňovým poradcem.*
  - Stripe / bankovní převod + QR / Donio / Herohero **fungují bez problému**.
  - Rámování je blíž „podpoř nás / staň se přítelem" než „daňově uznatelný dar".
- **Návrh:** `/klub` v1 postavit tak, aby **nezávisel na právní formě**
  (Stripe + převod/QR + Donio). Darujme.cz, potvrzení o daru, širší granty
  = přidat ve **Fázi 4**, pokud vznikne nezisková forma.

### Zvolený model: **žurnalistika zdarma navždy + dobrovolná podpora**

Všechny analýzy, data i metodika zůstávají veřejné a bez paywallu. Podpora
**není přístup k obsahu** — je to způsob, jak umožnit, aby ten obsah vznikal.
Úrovně se liší **výší podpory a mírou poděkování / přístupu k lidem a zákulisí**,
nikdy ne exkluzivní žurnalistikou.

- **Nejbližší vzory:** *The Nerve* (UK, 5 lidí — zdarma, bez paywallu, financuje
  komunita; £6,95/měs, £250/rok „founding", jednorázově na investigace) a
  *Guardian* (zdarma + „support", nízká úroveň bez výhod, 68 % podpory je
  jednorázová). Obě **nepotřebují čtenářské účty**.
- **Protipříklad:** *Voxpot* / *Deník N* / *Krautreporter* brání „bonusový"
  obsah nebo dávají členům hlas → **nutný login a paywall**. My to neděláme,
  takže **no-auth není omezení, ale přirozený stav** (viz § 5).

Proč tento model: sedí k už vyslovenému závazku nezávislosti a crowdfundingu,
k tezi decku (pravda potřebuje aktivní podporu) a k tomu, že obsah má fungovat
i jako veřejně ověřitelný zdroj pro AI nástroje — což paywall popírá.

### Veřejný závazek (na stránku `/klub`, doslovně)

> Naše žurnalistika zůstane vždy zdarma a bez paywallu. Přátelé a přítelkyně
> DataTimes nemají vliv na výběr témat ani na závěry. Když píšeme o někom,
> s kým nás pojí vztah, uvedeme to. Jednou ročně zveřejníme, odkud peníze jsou.

---

## 2. Koho oslovujeme

| Segment | Kde je | Co ho přesvědčí | Priorita |
|---|---|---|---|
| Pravidelní čtenáři a čtenářky webu / newsletteru | web, Ecomail | „tohle čtu, chci aby to zůstalo" | **1** |
| Posluchači podcastu *Mahdalky* | Spotify, YouTube | osobní vztah k autorkám, důvěra | **1** |
| Sledující na sítích („DataTimes na sítích") | Bluesky, FB, IG, Threads, X | „držte se ve feedu, kde je dezinformace" | **2** |
| Lidé zasažení konkrétní kauzou (Turek, volby…) | příchod z článku | jednorázový dar „za tenhle text" | **2** |
| Firmy a lokální podnikatelé | příchod z mesta.datatimes.cz | „adopce města" — údržba dat o jejich městě, s přiznáním | **2** |
| Instituce, knihovny, redakce | — | licence / partnerství | mimo `/klub`, Fáze 4 |
| Spolupracovníci (data, tipy, překlady, spoluautorství) | — | uznání, ne peníze | Fáze 4 |

Trychtýř: **post na síti → sledující → odběratel newsletteru → přítel DataTimes.**
Síť je vršek trychtýře, ne pokladna (viz § 6).

---

## 3. Název a adresa

Pojmenování výrazně pomáhá retenci, sociálnímu důkazu i zkratce na sítích.

- **Program / mechanismus:** **Klub DataTimes** (běžný český úzus — Klub N,
  Voxpot Klub). Na stránce ošetřit větou: *„Klub nedostává žádnou žurnalistiku
  navíc. Je to klub lidí, díky kterým vzniká."*
- **Lidé — pojmenované úrovně** (testovací verze, 2026-08-28): uznávaný český
  žebřík dárcovství, kde *patron* leží uprostřed, ne na vrcholu:
  - 29 Kč = **podporovatel / podporovatelka** — bezostyšná základní příčka
  - prostřední = **patron / patronka** — „berete DataTimes pod svá křídla";
    stejné slovo použít i pro *adopci města* (§ 4) → *patron/ka [města]*
  - horní + vlastní částka = **mecenáš / mecenáška** — historicky velký dárce
    dobré věci, takže „zní draze" přesně tam, kde to chceme
  - Zvažované a zamítnuté: *přátelé* (moc měkké), *opora* (významově sedí, ale
    „nezní"), *spojenci* (Reportérky), *členové* (úřední). Lehčí varianta:
    pojmenovat jen horní dvě, základ bez titulu.
  - **Nepoužívat** „Předplatné / Předplatitelé" — implikuje paywall.
- **Startovní / Donio kohorta:** **zakladatelé a zakladatelky** (jako „founding
  members" u The Nerve; pojí se s jednorázovým darem 5 000 Kč, viz § 4).
- **Route:** **`/klub`**. Přesměrovat `/podpora`, `/pridejte-se`, `/support`
  → `/klub`. Odkaz: `datatimes.cz/klub`. Slovo „podpora/support" v názvu
  stránky nepoužíváme (zadání).
- **Tlačítko v hlavičce:** dnes „Podpořte nás / Podpořit". Nechat, nebo změnit
  na „Klub" / „Přidejte se". → otevřené rozhodnutí (§ 11).

---

## 4. Nabídka (formy a částky)

> **Stav: pracovní / testovací verze. Model je rozhodnutý, konkrétní částky ne.**
> Výchozí stav v UI dnes: měsíční Stripe 29 / 199 / 499 Kč (Student / Standard /
> Patron), Standard zvýrazněn, 3 samostatné payment links.

### Rozhodnuto

- **Pojmenované úrovně:** **podporovatel / podporovatelka** (29 Kč) →
  **patron / patronka** (prostřední) → **mecenáš / mecenáška** (horní + vlastní
  částka). Zakládající jednorázový dar 5 000 Kč = **zakladatel / zakladatelka**.
  Rozpracováno v § 3.
- **29 Kč/měs zůstává** jako plnohodnotná **„základní podpora"** — ne „pro
  studenty". Rámování: *„Chci přispívat, ať malou částkou."* / *„Za cenu jedné
  SMS měsíčně."* Dveře jsou otevřené každému. (Vzor: nízká úroveň Guardianu
  „bez výhod navíc".)
- **Měsíční žebřík = 29 Kč + 2 „normální" úrovně + vlastní částka** = tři
  viditelná tlačítka + custom. Tři rozhodovací body jsou podle dat optimum
  (Guardian, US norma 3 příčky; MPP: víc úrovní s odstupňovanými výhodami je
  „hodně na zpracování"). Naše výhody jsou tenké (uznání + přístup, žádný
  bráněný obsah), takže víc příček nemá čím se lišit.
- **Nad ~500 Kč = „mecenáš / mecenáška"** přes pole vlastní částky — jiná
  *kategorie* (velké / jednorázové / vztahové), ne čtvrté tlačítko na stejném
  žebříku.
- **Předvybrat a zvýraznit prostřední** úroveň; příčky řadit zdola nahoru;
  „co to pokryje" psát jen u vyšších příček (ne u 29 Kč), aby stránka
  nekotvila nízko.

### K rozhodnutí — částky 2 „normálních" úrovní

| Varianta | Žebřík (měs.) | Předvybráno | Pozn. |
|---|---|---|---|
| **A — minimální změna** | 29 / **199** / 499 | 199 | „těsně pod 200", „jeden oběd"; už zadrátováno ve Stripe |
| **B — dle dat** | 29 / **149** / 299 (příp. 39 / 149 / 299) | 149 | MPP: „organizace ceny spíš podceňují"; blíž Voxpot (250) a Herohero normě (120–150 Kč) |

Po spuštění sledovat reálné rozložení a případně zvýšit — El Diario
(60 → 80 €/rok) i Krautreporter zvýšili **bez odchodů**.

### Další formy

| Forma | Návrh | Pozn. |
|---|---|---|
| **Ročně** | každá částka × 10 (dva měsíce zdarma) | u 29 Kč nabídnout **290 Kč/rok** — sníží podíl transakčních poplatků (na 29 Kč ~12 %) |
| **Jednorázově** | chipy 300 / **700** / 1 500 / 3 000 Kč + vlastní | default 700 (český průměr jedné transakce je 655 Kč); vázat na konkrétní texty |
| **Zakladatel/ka** | jednorázově **5 000 Kč** | jméno v první výroční zprávě + první tištěné věci; hook pro Donio kampaň |
| **Mecenáš/ka** | vlastní částka (velká / opakovaná) | vztahové, ne samoobsluha |

### Projektová (účelová) podpora

Lze směřovat podporu ke **stálému programu**, ne k výstupu ani úhlu:

- **DataTimes na sítích** (feed-native debunky a grafika — už tam podporovatele
  máte), **Města v datech** (mesta.datatimes.cz), **Sněmovna**
  (snemovna.datatimes.cz), **Investigace**.
- **„Adopce města":** člověk nebo firma financuje **údržbu datového pokrytí**
  jednoho města na mesta.datatimes.cz (aktuální dataset, udržovaná stránka).
  Uznání: *„Data pro [město] udržujeme díky [jméno]."*
  - Na stránce **výslovně:** platí to údržbu a pozornost, **ne příznivé
    pokrytí. Když najdeme problém v hospodaření města, napíšeme o něm.**
  - **Konflikt zájmů:** firma adoptující město, kde působí → přiznat na stránce
    města + standardní věta o nezávislosti. Některé adopce **odmítáme** (radnice
    sama; dominantní místní zaměstnavatel, který je častým tématem).
  - **Nikdy:** dárcem pojmenovaná témata, „napište o mé firmě", „adopce =
    pozitivní pokrytí".
- **Vztah k § 8:** tohle **není** účelově vázaný dar ve smyslu zákazu —
  nekupuje výstup ani úhel, jen posiluje část práce. Přesto vše přiznáváme.
- **Mechanika bez backendu:** samostatný Stripe Payment Link na projekt
  (metadata `project=…`) nebo kampaň na Donio na projekt (vlastní teploměr).
  „Adopce města" ve v1 = *„Chcete adoptovat své město? Napište nám."*
  (vztahová + disclosure práce, ne samoobsluha).
- **Na startu max 2 pojmenované projekty** (první: DataTimes na sítích), ať se
  stránka neroztříští. Napojení na § 6 a Donio.

### Co přítel/kyně dostává

Vše slučitelné s „zdarma navždy" — poděkování a přístup k lidem/procesu, nikdy
exkluzivní obsah. Kapacita = 2 lidé, takže vše asynchronní a dávkové.

- **Každý:**
  - **Dopis z redakce** — měsíční newsletter jen pro přátele: na čem děláme,
    co jsme zabili a proč, zákulisí. *Hlavní nástroj retence.*
  - Poděkování a jasná věta na stránce: *„Bez vás to nejde."*
  - Zrušení kdykoli, jedním klikem (hostovaný Stripe portál).
- **Od prostřední úrovně:**
  - Pozvánky na online **redakční hovory** (kvartálně) — ptejte se na cokoli,
    ukážeme, jak vzniká analýza.
  - Embargovaný náhled velkých projektů (v den vydání jde stejně všem zdarma —
    neguje bránění obsahu).
- **Od horní úrovně / zakládající / roční:**
  - Jméno ve výroční zprávě o financování (opt-in).
  - Jednou ročně otevřené setkání / malý sraz.
  - Formulář „navrhni téma" (bez záruky zpracování).
- **Veřejná zeď přátel:** **až po v1** (viz § 5 — ve v1 žádná zeď; uznání jde
  přes newsletter a agregované poděkování na sítích).
- **Zatím nenabízíme:** verzi bez reklam (žádné nemáme), exkluzivní archiv či
  data (metodika a data jsou veřejná z principu), merch s plněním (možná
  později: tisk/plátěnka).

---

## 5. Infrastruktura

**Zásadní omezení:** web je statický export (`output: 'export'`, bez serveru).
Stránka `/klub` je statické HTML; transakci odbaví externí hostovaná služba.
**Web nemá a ve v1 nebude mít přihlašování / profily.**

**No-auth model (rozhodnuto):** identita přítele = **e-mail** (Ecomail +
Stripe). Správa předplatného = **hostovaný Stripe Customer Portal** (odkaz).
Žádný login na datatimes.cz. Perky jsou e-mailové (dopis z redakce, pozvánky,
Discord přes odkaz v děkovném e-mailu). To celé sedí k „zdarma navždy".

| Rail | Role | Pozn. |
|---|---|---|
| **Stripe Payment Links** + Stripe Customer Portal | **primární — opakované i jednorázové**, hostované, bez backendu | vlastní částka u jednorázových jde nastavit; u opakovaných omezeně |
| **Bankovní převod + QR (SPAYD)** | **potvrzeno — chtějí to**, hlavně FB / starší / firmy | ruční párování a poděkování; účet zatím OSVČ, **později nový transparentní účet** (silný signál důvěry) |
| **Donio** | **časově ohraničená kampaň** (~říjen–listopad 2026): launch + PR moment, jednorázové, projektové teploměry, „zakládající přátelé" | funguje i pod OSVČ; po kampani `/klub` přebírá setrvačnost |
| **Herohero** | **legacy** — necháváme běžet, nepropagujeme (viz § 7) | provize platformy, nevlastníme e-maily |
| **Substack** | **zvažuje se pro některé části** (samostatný newsletter / anglická linie) | není součástí `/klub` v1 |
| **Darujme.cz** | **mimo DataTimes** — patří KohoVolitu; přichází v úvahu až s neziskovou formou (Fáze 4) | pak i potvrzení o daru |
| `stripe-api-worker` (Cloudflare, dnes prázdný) | **není potřeba pro v1** (zeď zrušena) | volitelně později: vlastní částka u opakovaných + webhook → Ecomail tagy |

**Cílový stav v1:** `/klub` statická stránka → opakované na Stripe Payment
Links, jednorázové na Stripe (vlastní částka) + převod/QR, Donio odkaz při
kampani, Herohero odkaz dole („raději přes Herohero?"). Přátele do Ecomailu
tagujeme **ručně z měsíčního exportu ze Stripe**; převody párujeme ručně.

---

## 6. Sociální sítě

**Princip:** síť buduje důvěru a dosah; ask konvertuje přes newsletter a na
webu. Poměr **~1 z 8–10 příspěvků** je přímá výzva do Klubu, zbytek je
žurnalistika. Feed se nesmí stát sbírkovým feedem.

**„DataTimes na sítích"** = obsahový pilíř (feed-native výstupy z decku:
posty, grafy, debunky tam, kde je dezinformace) **i** pojmenovaný cíl
projektové podpory (§ 4). Stávající pár podporovatelů „na sítích" = raní
přátelé; sloučit do Klubu a používat *„držte nás ve feedu, kde je propaganda"*
jako jednu z motivací (doslova navazuje na text SupportBanneru).

| Kanál | Účet | Role | Ask |
|---|---|---|---|
| **Bluesky** | @data_zurnalist, @skopmichal | jádro — novináři, zapojené publikum | pinned post → /klub, odkaz v profilu, občas vlákno „jak je to financované" |
| **Facebook** | datovazurnalistika1 | starší publikum, vyšší ochota darovat, dobře sdílí | pinned post, QR obrázek v darovacích postech, boost impact postů |
| **Instagram** | katemahdalova | dosah, mladší, hlas Kateřiny | link v biu → /klub, Stories po silných textech, carousel „kdo za tím stojí" |
| **YouTube / Spotify** (*Mahdalky*) | mahdalova-skop | podcast — vysoká důvěra, dlouhá pozornost | 20s mluvený ask v dílu, odkaz v popisu, připnutý komentář |
| **X/Twitter** | @data_zurnalist, @skopmichal | upadá, jen cross-post | odkaz v profilu |
| **Threads** | @katemahdalova, @skopmichal | zrcadlo IG/Bluesky | odkaz v profilu |
| **LinkedIn** | (zatím ne) | instituce, decision makeři | partnerská linie, ne Klub (Fáze 4) |
| **TikTok** | (ne) | „tam, kde je dezinformace" | jen při kapacitě |

**Pravidla:**

- **Ask navazuj na moment:** po velké investigaci, na milníku, na konci roku
  (prosincový vrchol darování), během Donio kampaně.
- **Ukazuj dopad, ne nouzi:** *„Díky vám jsme mohli strávit 3 týdny na
  Turkových příjmech"* > *„pomozte nám přežít"*. Jeden kvartální impact post
  s reálnými čísly.
- **Smyčka uznání:** měsíční veřejné agregované poděkování („tento měsíc se
  přidalo 24 lidí"), oslava milníků. (Jmenná zeď až po v1.)
- **Transparentní posty zakladatelů:** občas civilní vlákno „jak se DataTimes
  financuje" (šest zdrojů, jaký podíl je komunita).
- **Assety:** pinned copy per platforma, brandovaný QR obrázek
  (crimson/newsprint), 15s video ask, link-in-bio (může být přímo `/klub`),
  šablona impact karty.
- **Kopírovací bloky výzvy k podpoře** (krátká / střední / dlouhá / Donio /
  „na sítích" / podcast): [`VYZVA-K-PODPORE.md`](VYZVA-K-PODPORE.md).
- **UTM na všechno:** `?utm_source=bluesky&utm_campaign=klub`.

---

## 7. Herohero — legacy režim

Herohero **necháváme běžet jako legacy**. Nekilujeme, ale ani nepropagujeme.

1. **Teď:** odkazy v biu a postech přepsat na `/klub`. Stránku Herohero nechat
   živou a plněnou (dopis z redakce apod. tam dál posílat).
2. **Komunikace (jednorázově, bez tlaku):** *„Podporu sjednocujeme na vlastní
   web — víc z vašich peněz jde na žurnalistiku a dopis z redakce vám můžeme
   posílat přímo. Nemusíte nic dělat: přejít můžete na datatimes.cz/klub, nebo
   zůstat. Díky, že jste byli první."*
3. **Bez tvrdého data ukončení.** Případný útlum zvážit později podle počtu
   aktivních a zbylého MRR; pokud ano, oznámit ~měsíc předem a opozdilcům
   napsat osobně.

---

## 8. Transparentnost a etika (navazuje na Redakční manuál)

- **Redakční firewall — na stránce:** *„Přátelé a přítelkyně DataTimes nemají
  vliv na výběr témat ani na závěry."* Dary, které implikují **výstup nebo
  úhel**, odmítáme — patří do pilíře „zakázky" se smlouvou a přiznáním.
  Projektová podpora (§ 4) je povolená jako **posílení programu**, ne objednávka.
- **Výroční zpráva o financování** (ideálně 2× ročně): rozpad příjmů podle
  šesti pilířů, podíl komunity, počet přátel, jmenovaní největší grantoři, co
  to zaplatilo. Odkaz z `/klub` i z patičky. Zároveň nejsilnější fundraisingový
  materiál. (Vzor: NFNZ veřejně přiznává dárce nad 50 000 Kč/rok a nebere
  peníze od státu/obcí/PEP.)
- **GDPR / co ukládáme:** e-mail, jméno, částka, úroveň. Zpracovatelé: Stripe,
  Ecomail, (Donio), (Cloudflare). Účel: platba, dopis z redakce, uznání (jen
  při opt-in). Krátká věta + odkaz na plné znění na `/klub`.
- **Žádné dark patterns:** zrušení jedním klikem, bez vyčítání; roční
  auto-obnova jasně uvedená; jednorázové je opravdu jednorázové.

---

## 9. Cíle a metriky

Rámec + kotvy z dat (viz Příloha C), bez vymyšlených tvrdých čísel:

- **Severka:** podíl komunity/crowdfundingu na celkových příjmech + předvídatelné
  měsíční opakované příjmy (MRR) z Klubu.
- **Benchmarky (MPP, 40 redakcí):** medián ~1 000 členů v prvním roce; členství
  = medián **19 % / průměr 29 %** celkových příjmů. Tj. Klub je **významný
  výsek, ne celý rozpočet**.
- **Orientační matematika:** 1 000 přátel × ~200 Kč blended (mix úrovní + roční
  + rozpočítané jednorázové) ≈ **200 000 Kč/měs ≈ 2,4 M Kč/rok** → mapuje na
  „Sustainability". Konzervativně 300–500 přátel × ~180 Kč ≈ 55–110 000 Kč/měs.
- **Role Klubu ve fázi Viability:** pokrýt **pojmenovaný výsek** (hosting +
  nástroje + jedna opakovaná položka), ať dárce vidí, co financuje.
- **Trychtýř:** odběratelé newsletteru → návštěva `/klub` → začatý checkout →
  dokončený; noví přátelé/měs.; jednorázové dary/měs.; churn (měsíční vs.
  roční); průměrný dar; atribuce kanálů (UTM).
- **Zdraví:** měsíční churn < ~5 %; rostoucí podíl ročních; zachycený prosincový
  vrchol.
- **První veřejný milník:** kulaté lidské číslo („100 přátel", „prvních
  50 000 Kč měsíčně") — oslavit naplno.

---

## 10. Postup nasazení

### Fáze 0 — teď (dny)

Právní forma **neblokuje** v1 (Darujme mimo). Blokující je:

1. **Částky** — vybrat variantu A/B pro 2 „normální" úrovně a předvybranou
   úroveň (§ 4).
2. **Label tlačítka** v hlavičce.
3. **Vztah k Donio** — časově ohraničená kampaň vs. trvalý domov opakované
   podpory (doporučení: kampaň).
4. **Které 2 projekty** spustit v projektové podpoře.
5. Finalizovat texty: veřejný závazek + věta o firewallu (§ 1, § 8).

### Fáze 1 — spuštění `/klub` (1–2 týdny)

- Statická stránka `/klub` v `apps/web` (design dle
  [DESIGN.md](../design/DESIGN.md): newsprint `#fdfbf7`, crimson `#de1743`,
  Roboto Slab, wordmark DataTimes).
- Sekce: **proč** (deck slide 1/9) → **co dostáváš** → **částky**
  (měs./ročně/jednorázově; Stripe + vlastní částka) → **projektová podpora**
  (2 projekty) → **převod/QR** → **transparentnost + firewall** → **FAQ**.
  **Bez zdi.**
- Post-checkout: `/klub/dekujeme` + výzva k odběru newsletteru.
- Přesměrování `/podpora`, `/pridejte-se`, `/support` → `/klub`.
- Hlavička + `SupportBanner` míří na `/klub` (ne přímo na Stripe).
- Herohero: přepsat odkazy v biu, jednorázový oznamovací post.

### Fáze 2 — Donio kampaň + první newsletter (~říjen–listopad 2026)

- Donio kampaň: headline cíl, odměny (vč. „zakládající přátelé"), projektové
  teploměry. `/klub` ji po dobu běhu propaguje nahoře; pak přebírá setrvačnost.
- Dopis z redakce #1.
- Volitelně: `stripe-api-worker` pro vlastní částku u opakovaných + Ecomail tagy.

### Fáze 3 — provoz a růst (průběžně)

- První výroční zpráva o financování; první redakční hovor; první milník;
  kvartální impact post; prosincová kampaň.

### Fáze 4 — později

- **Nezisková forma** pro DataTimes (pak Darujme.cz jako přídavný rail,
  potvrzení o daru, širší granty).
- Veřejná **zeď přátel** + počítadlo (automat přes worker).
- **Spolupracovníci** (data, tipy, překlady, spoluautorství).
- **Anglická verze** / Substack linie; institucionální/partnerská linie.
- Merch; případně členské předplatné tištěného speciálu.

---

## 11. Otevřená rozhodnutí

1. **Částky 2 „normálních" úrovní** — varianta A (29/199/499) vs. B (29/149/299)
   a která je předvybraná.
2. **Label tlačítka v hlavičce** — „Podpořte nás" vs. „Klub" vs. „Přidejte se".
3. **Vztah k Donio** — jednorázová launch kampaň vs. trvalý domov opakované
   podpory. *Doporučení: časově ohraničená kampaň.*
4. **Které 2 projekty** v projektové podpoře na startu. *Návrh: DataTimes na
   sítích + Města v datech (adopce na vyžádání).*
5. **Jméno pro lidi** — testovací verze: *podporovatel/ka → patron/ka →
   mecenáš/ka* (+ *zakladatel/ka*). Ověřit v provozu; případně pojmenovat jen
   horní dvě úrovně.
6. **Právní forma DataTimes** — OSVČ zatím; nezisková později? Neblokuje v1,
   určuje Fázi 4.
7. **Horizont případného útlumu Herohero** — nebo nechat běžet bez data.
8. **Kdo vlastní** dopis z redakce a impact reporting (kadence, odpovědná osoba).

---

## Příloha A — Současný stav (audit 2026-08-28)

- **Hlavička** (`HeaderSimple.tsx`): „Podpořte nás" → dropdown se 3 měsíčními
  Stripe tiery 29 / 199 / 499 Kč (Standard zvýrazněn), 3 samostatné payment
  links.
- **`SupportBanner.tsx`**: tmavě modrý banner, text *„Veřejný prostor i politiku
  zaplavují blbosti, fake news a propaganda… Za cenu jednoho oběda."*, CTA
  „Jdu do toho" → jeden Stripe odkaz (199). Vložený na 6 speciálech.
- **`stripe-api-worker/`**: prázdný (jediný commit `temp`), přestože CLAUDE.md
  ho popisuje jako Cloudflare Worker.
- **Newsletter:** Ecomail (`mahdalovaskop.ecomailapp.cz`), použit na `/kdo-jsme`.
- **Route `/podpora` / `/klub` / členská:** neexistuje. Žádný paywall, žádné
  měření — 100 % obsahu zdarma, staticky.
- **Kanály** (footer/ContactsBlock): Bluesky (`katemahdalova.bsky.social`,
  `michalskop.bsky.social`), X (`@data_zurnalist`, `@skopmichal`), Threads
  (`@katemahdalova`, `@skopmichal`), Facebook (`datovazurnalistika1`),
  Instagram (`katemahdalova`), Spotify podcast (`mahdalova-skop`), RSS.

## Příloha B — Vzory k okoukání

| Projekt | Model | Co si vzít / na co pozor |
|---|---|---|
| **The Nerve** (UK, 5 lidí) | zdarma, bez paywallu, financuje komunita; £6,95/měs · £250/rok „founding" · jednorázově na investigace | **nejbližší vzor**; „founding" kohorta; login jen na správu; bez čtenářských účtů |
| **Guardian — „Support"** | zdarma + příspěvek; nízká úroveň „bez výhod"; 68 % podpory jednorázově | přispěj kolik chceš; jednorázové je klíčové; bez účtu |
| **Voxpot Klub** (CZ) | hybrid — jádro zdarma, **bonus bráněný**; 250 Kč/měs; Discord, tištěný mag | **varování:** bráněný obsah → nutný účet a paywall; my to neděláme |
| **okraj.cz** (CZ, Ghost) | freemium, „Předplatné" / úroveň „Základ"; lidi **nepojmenovává** | Ghost řeší identitu i platby; jméno pro lidi není nutné, ale pomáhá |
| **Klub Deníku N** (CZ) | paywall + klubový příplatek (+136 Kč/měs) | pojmenovaný klub, „mohli bychom mít paywall"; ale je za paywallem |
| **Alarm** (CZ) | zdarma, ~80 % z podpory čtenářů, přes Darujme.cz | transparentní čísla, komunitní akce |
| **Hlídací pes / Investigace.cz** (CZ) | dar „za investigaci"; NFNZ granty | výroční zpráva jako fundraising; přiznání dárců nad 50k |
| **Krautreporter / De Correspondent** | členství = přístup **+ hlas** v tématech; €9–11/měs | zapojení členů; ale **nutný login** |
| **404 Media / Defector** (US) | worker-owned, převážně paywall; ~$8/měs · ~$100/rok | malý tým uživí kvalitní žurnalistiku; ale paywall + účty |

## Příloha C — Data k cenotvorbě (2026-08, není finální)

**Srovnatelné měsíční ceny:** Herohero CZ norma ~120–150 Kč (Strakatý 147);
Guardian nízká úroveň ~115 Kč („bez výhod"); Reportérky ~175 Kč (€7);
The Nerve ~200 Kč (£6,95); Deník N digital ~199 Kč; **Voxpot 250 Kč**;
Krautreporter/De Correspondent €9–11 (ale brání obsah).

**České dárcovské chování** (Darujme + Donio, 2023): 600 000+ dárců;
**průměrná jedna transakce ≈ 655 Kč**; průměrný dárce **≈ 1 699 Kč/rok**
ve 2–3 darech. Širší filantropie: průměr ~15 500 Kč/dárce/rok (táhnou velcí).

**Konsenzus výzkumu** (MPP, News Revenue Hub, Steady):

- *„Organizace ceny dramaticky podceňují."* El Diario a Krautreporter zvýšili
  **bez odchodů**.
- **Předvybrat default** — lidé na něj kotví. Vyšší default = větší, ale méně
  darů; nižší = víc dárců, menší dary.
- Nechat **skutečně nízkou příčku** (Guardian £4 „bez výhod"), ať necenzuruješ
  lidi pod tlakem.
- **Pay-what-you-want funguje** (Daily Maverick), ale „většina lidí si nevybere
  nejnižší"; perky navázat na práh, ne na žurnalistiku.
- Medián: ~1 000 členů v prvním roce; členství medián 19 % / průměr 29 % příjmů.

**Zdroje:**
Membership Guide (pricing) — <https://membershipguide.org/handbook/developing-and-launching-membership/designing-our-membership-program/how-do-we-price-our-membership-program> ·
Press Gazette (The Nerve) — <https://pressgazette.co.uk/news/new-launch-from-ex-observer-staff-nears-1000-paying-subscribers-in-a-week/> ·
INMA (Guardian) — <https://www.inma.org/blogs/reader-revenue/post.cfm/the-guardian-bypasses-a-paywall-to-find-reader-support> ·
Voxpot Klub — <https://www.voxpot.cz/clanky/voxpot-spousti-klub-darcum-nabidne-bonusove-clanky-podcasty-a-mnohem-vic> ·
Nieman Lab (Krautreporter) — <https://www.niemanlab.org/2019/07/five-years-after-crowdfunding-heres-how-krautreporter-is-keeping-its-members-engaged-and-building-tools-for-you-to-too/> ·
Darujme.cz statistiky — <https://www.darujme.cz/darcovske-statistiky> ·
Nadace OSF (dárcovství roste) — <https://osf.cz/2025/01/22/darcovstvi-v-cesku-raketove-roste-ukazuji-data-cesi-daruji-rocne-miliardy/> ·
HN (Herohero ceny) — <https://archiv.hn.cz/c1-67199720-zjistili-jsme-kdo-z-tvurcu-na-herohero-bere-nejvice-podcastem-si-lze-vydelat-i-statisice-mesicne> ·
Nieman Lab (404 Media) — <https://www.niemanlab.org/2024/02/six-months-in-journalist-owned-tech-publication-404-media-is-profitable/>

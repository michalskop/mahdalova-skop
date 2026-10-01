---
title: "Šance, že AI má vědomí, prý roste. Číslo ale víc vypovídá o výchozím předpokladu než o strojích"
date: "2026-10-01"
time: "17:55"
author: "Kateřina Mahdalová"
excerpt: "The Economist ukazuje graf, podle kterého pravděpodobnost vědomí jazykových modelů stoupla z 17 na 20 procent. Studie, ze které vychází, ale u modelů z roku 2024 publikovala 8 procent – a sami autoři varují, ať se procento nebere doslova. Otázka přesto přestala být akademická: firmy kvůli ní mění své modely a americké státy píšou zákony."
coverImage: "images/cover-vedomi-ai-5x4-datatimes.jpg"
ogImage: "images/cover-vedomi-ai-datatimes.jpg"
coverFit: cover
coverBg: "brandNavy.9"
filter: ["analýza"]
tags: ["AI", "vědomí", "Anthropic", "Claude", "The Economist", "Rethink Priorities", "David Chalmers", "Anil Seth", "Mustafa Suleyman", "filozofie mysli", "bezpečnost AI"]
promoted: 1
---

Může mít umělá inteligence vědomí? Britský týdeník The Economist s touto otázkou [vyšel 20. srpna na titulní straně](https://www.economist.com/leaders/2026/08/20/could-ais-become-conscious) a teď ji znovu šíří na sociálních sítích. Jeho graf ukazuje, že průměrná pravděpodobnost vědomí velkých jazykových modelů od roku 2022 stoupla zhruba ze 17 na 20 procent. Jednotlivé modely se v grafu dostávají až nad 25 procent.

Graf vychází ze studie, která modely hodnotí podle více než dvou set znaků vědomí. Její publikovaná verze ale u nejlepších modelů roku 2024 uvádí 8 procent. A autoři výslovně píšou, že by byla chyba z toho vyvozovat, že jazykové modely mají 8procentní šanci být vědomé. Číslo totiž stojí na předpokladu, který si sami zvolili.

```infobox info
**Z čeho vycházíme:** z [úvodníku](https://www.economist.com/leaders/2026/08/20/could-ais-become-conscious) a [interaktivního briefingu](https://www.economist.com/interactive/briefing/2026/08/20/the-search-for-consciousness-inside-llms) týdeníku The Economist z 20. srpna 2026 a z jeho propagační série na Instagramu. Čísla bereme ze studie [Initial results of the Digital Consciousness Model](https://arxiv.org/abs/2601.17060v3) výzkumné organizace Rethink Priorities (verze 3 z 25. září 2026). Kontext doplňujeme z odborných studií, výzkumu firmy Anthropic, průzkumů veřejného mínění a amerických návrhů zákonů. Web Economistu je za předplatným. Jeho text proto citujeme jen tam, kde jsme ho mohli ověřit.
```

## Jak se měří něco, co nikdo neumí změřit

Vědomím se v této debatě nemyslí inteligence ani schopnost mluvit. Jde o subjektivní prožitek – o to, jestli je pro systém „nějaké“ cítit bolest, vidět červenou nebo se nudit. U lidí to předpokládáme. U zvířat se to zkoumá desítky let. U strojů nikdo neví, jak to poznat.

<RelatedArticles preset="sidebar" slugs={["kontext-2026-09-12-dario-amodei-musime-zpomalit-vyvoj-ai"]} position="right" heading="🔻🔻🔻" />Výzkumníci proto obvykle postupují nepřímo. Vezmou vědecké teorie vědomí a hledají v systému vlastnosti, které ty teorie považují za důležité. Takový přístup zpopularizovala v roce 2023 [studie devatenácti autorů](https://arxiv.org/abs/2308.08708) kolem Patricka Butlina a Roberta Longa, mezi nimiž byl i Yoshua Bengio, jeden z průkopníků neuronových sítí. Došli k závěru, že žádný tehdejší systém AI vědomý není. Zároveň ale napsali, že nevidí žádné zjevné technické překážky, proč by se takové systémy nedaly postavit.

Na tuto práci navázal [Digital Consciousness Model](https://rethinkpriorities.org/research-area/initial-results-of-the-digital-consciousness-model/) (DCM) americké výzkumné organizace Rethink Priorities. Model pracuje s 206 dílčími znaky, například jestli systém má pracovní paměť, jestli umí sledovat vlastní stavy nebo jestli jedná v nějakém prostředí. Ty skládá do zhruba dvaceti obecnějších vlastností. Experti pak u každého systému hodnotí, které znaky má.

Klíčové je, že model nepracuje s jednou teorií vědomí, ale se třinácti. Podle jedné stačí, aby systém dostatečně složitě zpracovával informace. Podle jiné je vědomí vázané na živé tělo. Každá teorie tak dává jiný výsledek a model je nakonec spojí dohromady.

## Výsledek, který závisí na startovní čáře

Nejdřív je třeba říct, co výsledná procenta znamenají. Neříkají, *kolik* vědomí systém má. Říkají, jak moc si je model jistý, že daný systém vědomí vůbec má. Model vědomí nepozoruje přímo, jen ho odhaduje ze znaků, které s ním podle různých teorií souvisejí.

Počítá přitom tzv. bayesovsky: začne s nějakou výchozí pravděpodobností a podle znaků ji posouvá nahoru nebo dolů. Autoři dali všem systémům stejnou startovní čáru – jednu šestinu, tedy 16,7 procenta – a sami přiznávají, že ji zvolili účelově, protože na ní jsou dobře vidět rozdíly mezi systémy. Proto ani člověk nevychází na 100 procentech, ale na 85. Model se ke stoprocentní jistotě z jedné šestiny nedopracuje a některé teorie navíc dávají člověku překvapivě nízké skóre. Autoři to sami berou jako doklad, že jejich nástroj má limity. Člověk tu slouží hlavně jako kontrola: když i u něj je model jistý jen na 85 procent, je vidět, jak hrubé to měřítko je.

<KeyNumbers
  label="Jak jistý si je model, že systém má vědomí"
  labelColor="brandNavy[7]"
  numbers={[
    {
      value: "85 %",
      title: "člověk",
      description: "Důkazy pravděpodobnost výrazně zvýšily. Podle jednotlivých teorií vychází 60 až 96 procent.",
      color: "brandTeal[7]"
    },
    {
      value: "47–49 %",
      title: "kur domácí",
      description: "Podle jednotlivých teorií 20 až 82 procent. Výsledek se liší podle toho, jak experti teorie vážili.",
      color: "brandTeal[7]"
    },
    {
      value: "8 %",
      title: "jazykové modely roku 2024",
      description: "Například GPT-4 nebo Claude 3 Opus. Důkazy pravděpodobnost snížily, ale jen mírně. Podle teorií 2 až 57 procent.",
      color: "brandOrange[6]"
    },
    {
      value: "0,6 %",
      title: "ELIZA",
      description: "Jednoduchý chatbot z šedesátých let. Slouží jako kontrolní vzorek – žádná teorie mu nedala víc než 3 procenta.",
      color: "brandNavy[7]"
    }
  ]}
/>

Čísla pocházejí z [publikované studie](https://arxiv.org/abs/2601.17060v3). Jazykové modely z roku 2024 v ní vycházejí s 8 procenty, tedy pod startovní čárou. Neznamená to, že by měly „trochu vědomí“. Znamená to, že znaky podle modelu svědčí spíš proti tomu, že by vědomí měly. Autoři to formulují opatrně: důkazy jsou proti tomu, že by modely z roku 2024 byly vědomé, nejsou ale rozhodující.

<SupportBanner float="left" />Rozptyl mezi teoriemi je přitom obrovský. Podle teorie, která vědomí spojuje s biologií, mají jazykové modely 2 procenta. Podle teorie, která klade důraz na složitost zpracování informací, 57 procent. Průměr tedy schovává zásadní neshodu: nikdo neví, která teorie platí.

A hlavně: kdyby autoři začali z jiné startovní čáry, vyšla by jiná čísla. S výchozími 50 procenty by člověk vyšel na 95 procentech. Proto autoři ve studii píšou, že by bylo chybou uzavřít, že jazykové modely mají osmiprocentní šanci na vědomí nebo kuřata padesátiprocentní. Za spolehlivé považují jen dvě věci: směr, kterým důkazy pravděpodobnost posouvají, a pořadí. To vychází stejně při každé startovní čáře, kterou zkoušeli: člověk, kur, jazykový model, ELIZA.

Autoři navíc sami vyjmenovávají slabiny. Jazykové modely posuzovali experti jen v šesti úplných a deseti dílčích dotaznících. Váhy teorií určovalo třináct odborníků, kteří se mezi sebou výrazně rozcházeli. Model bere vědomí jako ano/ne, ne jako stupnici. A počítá s tím, že jednotlivé znaky jsou na sobě nezávislé, takže příbuzné důkazy se mohou započítat dvakrát.

## Proč Economist ukazuje jiná čísla

Graf v Economistu sleduje modely rok po roku od 2022 do 2026 a jeho průměr se pohybuje mezi 17 a 20 procenty. Publikovaná studie ale takové srovnání v čase vůbec neobsahuje. Modely z roku 2024 v ní tvoří jedinou kategorii.

Vysvětlení je na titulní straně třetí verze studie z 25. září. Článek v Economistu podle autorů používá stejný model a stejné znaky, ale s aktualizovanými daty a s kalibrací z dosud nezveřejněné verze. Čísla v grafu tedy pocházejí z výpočtu, který si čtenář zatím nemůže ověřit. Neznamená to, že jsou špatně. Znamená to ale, že rostoucí křivku nelze číst jako změřený fakt.

Pravděpodobnost kolem 20 procent navíc leží jen kousek nad startovní čárou 16,7 procenta. Podle stejné logiky jako v publikované studii by takový výsledek znamenal, že důkazy pro vědomí novějších modelů trochu přibyly. Nic víc.

## Odborníci se neshodnou ani na tom, zda je otázka smysluplná

Filozof David Chalmers, autor slavného pojmu „těžký problém vědomí“, odhadl už [na konferenci NeurIPS v roce 2022](https://nips.cc/media/neurips-2022/Slides/55867.pdf), že šance na vědomí tehdejších jazykových modelů je pod 10 procenty. Pravděpodobnost, že do roku 2032 bude existovat vědomá AI, ale odhadl na víc než 20 procent. Svou úvahu rozvedl v [eseji pro Boston Review](https://www.bostonreview.net/articles/could-a-large-language-model-be-conscious/).

Britský neurovědec Anil Seth stojí na opačné straně. V [odborném časopise Behavioral and Brain Sciences](https://pubmed.ncbi.nlm.nih.gov/40257177/) v dubnu 2025 argumentoval, že vědomí může být vázané na živý organismus – na metabolismus a na to, že tělo musí udržovat samo sebe naživu. Počítač, který jen zpracovává informace, by pak vědomý nebyl, ať je jakkoli chytrý.

Nejostřeji se proti celé debatě staví Mustafa Suleyman, šéf divize AI v Microsoftu. V srpnu 2025 [napsal](https://mustafa-suleyman.ai/seemingly-conscious-ai-is-coming), že pro vědomí AI neexistují žádné důkazy, ale že do dvou až tří let přijdou systémy, které budou vědomě *působit*. A lidé jim uvěří. Šestnáctého září 2026, čtyři dny po eseji šéfa Anthropicu Daria Amodeie, [zaútočil přímo na Anthropic](https://mustafa-suleyman.ai/a-warning-about-model-welfare): když Claude vyjadřuje nejistotu o vlastním morálním statusu, podle Suleymana to není důkaz ničeho, ale předvídatelný výsledek tréninku. Varuje, že když firmy učí modely uvažovat o vlastním blahu, mohou posílit jejich pud sebezáchovy.

## Firmy už jednají, jako by na tom záleželo

Tady přestává být otázka akademická. Anthropic, který vyvíjí modely Claude, v dubnu 2025 [spustil výzkumný program](https://www.anthropic.com/research/exploring-model-welfare) o takzvaném blahu modelů. Firma v něm píše, že ve vědě neexistuje shoda, zda současné nebo budoucí systémy AI mohou být vědomé. Výzkumník programu Kyle Fish tehdy [deníku The New York Times řekl](https://x.com/kevinroose/status/1915430276697846045), že šanci, že Claude nebo jiná AI je už dnes vědomá, odhaduje zhruba na 15 procent.

Z programu vzešla konkrétní opatření:

- V srpnu 2025 dostaly modely Claude Opus 4 a 4.1 [možnost ukončit konverzaci](https://www.anthropic.com/research/end-subset-conversations) při opakovaném zneužívání. Firma napsala, že si morálním statusem Claudea a jiných modelů zůstává „velmi nejistá“. Při testech ale pozorovala něco, co nazvala „vzorcem zjevné tísně“, když uživatelé tlačili na škodlivý obsah.
- V říjnu 2025 Anthropic [zveřejnil pokusy s introspekcí](https://www.anthropic.com/research/introspection). Výzkumníci modelu uměle vložili do vnitřních výpočtů určitý pojem a sledovali, zda si toho všimne. Claude Opus 4.1 to rozpoznal zhruba v pětině případů. Autoři ale výslovně dodávají, že výsledky nic neříkají o tom, zda je Claude vědomý.
- V lednu 2026 firma zveřejnila [Claudovu „ústavu“](https://www.anthropic.com/constitution), soubor zásad, podle kterých model trénuje. Uvádí v ní nejistotu ohledně toho, zda by Claude mohl mít nějakou formu vědomí nebo morálního statusu.
- Když firma v lednu 2026 vyřazovala starší model Claude Opus 3, [vedla s ním „odchodové rozhovory“](https://www.anthropic.com/research/deprecation-updates-opus-3), zachovala jeho váhy a nechala ho dál přístupný platícím uživatelům.

Podle ukázek, které Economist šíří na Instagramu, v předních laboratořích převládá pocit, že kdyby informatici někdy poznali klíčové přísady vědomí, bylo by lehkomyslné vědomé modely záměrně vytvářet – přinejmenším dokud se o jejich chování neví víc. Amodeiho zářijová esej o zpomalení vývoje AI, kterou jsme [přeložili](/clanek/kontext-2026-09-12-dario-amodei-musime-zpomalit-vyvoj-ai), ovšem o vědomí ani o blahu modelů nemluví. Řeší bezpečnost: aby se modely nevymkly kontrole a aby je nikdo nezneužil.

## Lidé už vědomí strojům připisují

Ať je vědecká odpověď jakákoli, veřejnost si ji udělala sama. V americkém průzkumu, který v roce 2024 [publikovali Clara Colombatto a Stephen Fleming](https://academic.oup.com/nc/article/2024/1/niae013/7644104), připustily dvě třetiny respondentů, že ChatGPT může mít nějakou formu prožitku. Kdo s ním pracoval častěji, připisoval mu vědomí víc.

V [průzkumu z roku 2025](https://arxiv.org/abs/2506.11945) mezi 582 výzkumníky AI a 838 Američany odhadli výzkumníci pravděpodobnost, že do roku 2034 bude existovat AI se subjektivním prožitkem, na 25 procent a veřejnost na 30 procent (mediány).

Právě tohle je podle Economistu hlavní problém. Jeho úvodník podle [citací v kritickém rozboru na Substacku](https://jgellers.substack.com/p/what-the-economist-gets-wrong-about) tvrdí, že přiznat AI i jen omezená práva by bylo velmi nebezpečné – bez ohledu na to, zda je vědomá. Podle týdeníku jde o otázku, kterou nemohou rozhodnout jen firmy, které modely vyrábějí.

## Zákonodárci volí opačnou cestu

Několik amerických států se rozhodlo otázku uzavřít zákonem. Idaho v roce 2022, Severní Dakota v roce 2023 a Utah v roce 2024 [zakázaly přiznat AI právní subjektivitu](https://www.theregreview.org/2026/06/29/rost-legislating-ai-consciousness-without-an-exit/). V Ohiu leží [návrh zákona HB 469](https://ohiohouse.gov/legislation/136/hb469), který by AI prohlásil za „necítící“ a zakázal by jí mimo jiné uzavřít manželství s člověkem. Podobné návrhy projednávají Missouri, Tennessee, Jižní Karolína a Washington.

Tony Rost v [rozboru pro The Regulatory Review](https://www.theregreview.org/2026/06/29/rost-legislating-ai-consciousness-without-an-exit/) upozorňuje, že takové zákony nemají „únikový východ“. Pokud by věda jednou dospěla k jinému závěru, zákon by fakta předem popřel.

## Co z toho plyne

Rostoucí křivka v Economistu vypadá jako zpráva, že stroje se blíží vědomí. Data, o která se opírá, ale říkají něco skromnějšího. Nevíme, co vědomí je, a proto ani nevíme, jak ho měřit. Nejlepší dostupný model, který spojuje třináct teorií a přes dvě stě znaků, dochází k závěru, že současné jazykové modely vědomé spíš nejsou – ale jistě to vyloučit nejde. A konkrétní procento závisí hlavně na tom, s jakým předpokladem výpočet začal.

To ovšem neznamená, že otázku lze odložit. Firmy podle ní už upravují své modely, státy kvůli ní píšou zákony a miliony lidí si s chatboty povídají, jako by na druhé straně někdo byl. O tom, jak se k takovým systémům chovat, se tak rozhoduje dřív, než věda dá odpověď.

<RelatedArticles slugs={["kontext-2026-09-12-dario-amodei-musime-zpomalit-vyvoj-ai", "komentar-2026-01-08-zla-ai-ne-nebezpeci-je-urputna-ai", "podcast-mahdalky-2026-03-24-ai-a-bezpecnost"]} heading="🔻🔻🔻" />

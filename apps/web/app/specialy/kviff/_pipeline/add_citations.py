# -*- coding: utf-8 -*-
"""One-off script: inject researched citationCz/citationSource into honors.ts
for recipients where the KVIFF archive fulltext had no descriptive text, and
add the newly-discovered 2005 recipient Jiri Krejcik. Run once, then delete."""
import re

PATH = r"C:\Users\datov\Desktop\mahdalova-skop-projekty\mahdalova-skop\apps\web\app\specialy\karlovy-vary\honors.ts"

CITATIONS = {
    "Karel Kachyňa": (
        "Ocenění dostal za dlouholetý umělecký přínos jako jeden z klíčových režisérů poválečného československého filmu.",
        "https://www.filmovyprehled.cz/cs/person/3526/karel-kachyna",
    ),
    "Věra Chytilová": (
        "Cenu přebírala s typickým černým humorem – slavnou se stala scéna ze zahajovací znělky, kdy se rozbitý glóbus snažila slepit lepidlem, které „nechytalo“.",
        "https://www.e15.cz/magazin/znelky-patri-k-festivalu-sedmnact-let-vybrali-jsme-sedm-nej-847973",
    ),
    "Otakar Vávra": (
        "Ocenění převzal v roce, kdy Křišťálový glóbus dostal svou dnešní podobu – křišťálovou kouli v objetí ženské postavy podle návrhu fotografa Tona Stana.",
        "https://www.e15.cz/magazin/rezisera-vavru-uctila-nova-znelka-karlovarskeho-festivalu-777564",
    ),
    "John Boorman": (
        "Šlo o čestné ocenění za celoživotní dílo, nikoli o soutěžní cenu – hlavní Křišťálový glóbus téhož ročníku vyhrál český film Rok ďábla.",
        "https://en.wikipedia.org/wiki/37th_Karlovy_Vary_International_Film_Festival",
    ),
    "Vlastimil Brodský": (
        "Ocenění mu bylo uděleno in memoriam – český herec zemřel v dubnu 2002, několik měsíců před červencovým festivalem.",
        "https://en.wikipedia.org/wiki/Vlastimil_Brodsk%C3%BD",
    ),
    "Sean Connery": (
        "Na osobní účast rezignoval ze zdravotních důvodů; v té době natáčel v Praze film Liga výjimečných.",
        "https://en.wikipedia.org/wiki/37th_Karlovy_Vary_International_Film_Festival",
    ),
    "Miroslav Ondříček": (
        "Slavný kameraman ocenění přebíral se slovy „Hlavně ať žije Slavia“ – narážkou na svou fotbalovou vášeň.",
        "https://isport.blesk.cz/clanek/fotbal/232118/slavny-filmar-i-fanousek-predevsim-at-zije-slavia-hlasal-ondricek.html",
    ),
    "Sharon Stone": (
        "Ocenění dostala ve stejném ročníku jako Robert Redford, Liv Ullmann a český režisér Jiří Krejčík.",
        "https://iol.co.za/entertainment/whats-on/2005-06-15-czechs-honour-stone-and-redford/",
    ),
    "Robert Shaye": (
        "Ocenění dostal jako zakladatel studia New Line Cinema, které mimo jiné distribuovalo filmovou trilogii Pán prstenů.",
        "https://en.wikipedia.org/wiki/41st_Karlovy_Vary_International_Film_Festival",
    ),
    "Jan Němec": (
        "Ocenění dostal klíčový režisér československé nové vlny 60. let.",
        "https://www.filmovyprehled.cz/cs/person/3041/jan-nemec",
    ),
    "Břetislav Pojar": (
        "Glóbus mu předala herečka Renée Zellwegerová. Spoluzaložil animační studio Bratři v triku a jeho film Lev a písnička vyhrál v roce 1960 Grand Prix na festivalu v Annecy.",
        "https://www.denik.cz/film-a-televize/zemrel-znamy-tvurce-animovanych-filmu-bretislav-pojar-20121013.html",
    ),
    "Dušan Hanák": (
        "Ocenění dostal v roce svých sedmdesátin; festival k tomu uspořádal jeho minipřehlídku a výstavu fotografií Záznamy a odkazy.",
        "https://www.denik.cz/film-a-televize/dusan_hanak_rozhovor20080708.html",
    ),
    "Juraj Jakubisko": (
        "Ocenění přezdívaný „Fellini východu“ převzal u příležitosti světové premiéry svého filmu Bathory – ve stejném ročníku jako Dušan Hanák, se kterým sdílel i sedmdesáté narozeniny.",
        "https://ct24.ceskatelevize.cz/kultura/1449201-snimek-bathory-prijat-vlazne-jakubisko-pred-premierou-prevzal-kristalovy-globus",
    ),
    "Ivan Passer": (
        "Ten rok zároveň vedl hlavní porotu festivalu.",
        "https://en.wikipedia.org/wiki/43rd_Karlovy_Vary_International_Film_Festival",
    ),
    "Isabelle Huppert": (
        "Ocenění přebírala za standing ovace před promítáním svého filmu Villa Amalia.",
        "https://english.radio.cz/isabelle-huppert-presented-crystal-globe-award-8418045",
    ),
    "Jan Švankmajer": (
        "Na otázku novinářů, zda si cenu zaslouží, suše odpověděl: „Cena za sobectví? No nevím.“ Festival k oceněné uvedl jeho film Spiklenci slasti.",
        "https://www.denik.cz/film-a-televize/jan-svankmajer-cena-za-sobectvi-no-nevim20090713.html",
    ),
    "Juraj Herz": (
        "Glóbus přebíral se slovy, že jde o „cenu za filmy, co mi zakázali točit“ – narážkou na normalizační cenzuru. Ocenění dostal před promítáním svého filmu Petrolejové lampy.",
        "https://www.denik.cz/festivaly/juraj-herz-je-to-cena-za-ty-filmy20100710.html",
    ),
    "Theodor Pištěk": (
        "Oscarový kostýmní výtvarník a malíř navrhl mimo jiné uniformy Hradní stráže; Oscara získal za kostýmy k Formanovu Amadeovi a Césara za Valmonta.",
        "https://magazin.aktualne.cz/kultura/vytvarnik-theodor-pistek-dostal-kristalovy-globus/r~i:article:784422/",
    ),
    "Richard Gere": (
        "Ocenění přebíral na zahájení 50. jubilejního ročníku festivalu, kde připomněl i 80. narozeniny dalajlamy.",
        "https://variety.com/2015/film/festivals/richard-gere-to-receive-crystal-globe-at-karlovy-vary-film-festival-1201524955/",
    ),
    "Willem Dafoe": (
        "Festival mu jako poctu promítl snímky Pasolini a Poslední pokušení Krista.",
        "https://www.euronews.com/culture/2016/07/04/karlovy-vary-film-festival-honours-willem-dafoe-with-outstanding-contribution",
    ),
    "Ken Loach": (
        "Festival dvojici s Paulem Lavertym označil za tvůrce, kteří společně na dvanácti filmech spoluvytvořili britský sociálně-realistický film – mimo jiné držitele Zlaté palmy za I, Daniel Blake a Vítr, který čechrá ječmen. Loach přijel do Varů poprvé už v roce 1967 s filmem Chudák Kráva a v roce 1970 tu za film Kes získal svůj první Křišťálový glóbus.",
        "https://www.criterion.com/current/posts/4737-a-cinema-of-conscience-ken-loach-and-paul-laverty-at-karlovy-vary",
    ),
    "Paul Laverty": (
        "Festival dvojici s Kenem Loachem označil za tvůrce, kteří společně na dvanácti filmech spoluvytvořili britský sociálně-realistický film – mimo jiné držitele Zlaté palmy za I, Daniel Blake a Vítr, který čechrá ječmen.",
        "https://www.criterion.com/current/posts/4737-a-cinema-of-conscience-ken-loach-and-paul-laverty-at-karlovy-vary",
    ),
    "James Newton Howard": (
        "Skladatel hudby k filmům Pretty Woman, Šestý smysl, Batman Begins i všem čtyřem dílům Hunger Games na zahájení dirigoval Symfonický orchestr Českého rozhlasu při světové premiéře hudby z Fantastických zvířat 2.",
        "https://variety.com/2017/film/festivals/ken-loach-james-newton-howard-honored-karlovy-vary-1202393875/",
    ),
    "Tim Robbins": (
        "Na festivalu vystoupil i se svou kapelou The Rogues Gallery Band a uvedl vlastní filmy Bob Roberts a Cradle Will Rock.",
        "https://variety.com/2018/film/global/tim-robbins-karlovy-vary-film-festival-1202850697/",
    ),
    "Barry Levinson": (
        "Čtyřnásobný oscarový nominant, který za Rain Mana získal Oscara za režii.",
        "https://www.praguereporter.com/home/2018/6/19/tim-robbins-to-be-awarded-at-2018-karlovy-vary-film-fest/",
    ),
    "Julianne Moore": (
        "Cenu přebírala na zahájení festivalu a uvedla film Po svatbě po boku manžela a režiséra Barta Freundlicha i spoluhráče Billyho Crudupa.",
        "https://variety.com/2019/film/global/julianne-moore-karlovy-vary-film-festival-1203256004/",
    ),
    "Patricia Clarkson": (
        "Krátce předtím získala Zlatý glóbus za seriál Sharp Objects; ve Varech uvedla film Isabel Coixetové Learning to Drive.",
        "https://variety.com/2019/film/global/julianne-moore-patricia-clarkson-karlovy-vary-film-festival-1203238750/",
    ),
    "Michael Caine": (
        "Dvojnásobný oscarový a trojnásobný držitel Zlatého glóbu i Evropské filmové ceny sklidil na zahájení standing ovaci, kterou pozdravil zvednutou vycházkovou holí. Ve Varech uvedl film Best Sellers.",
        "https://variety.com/2021/film/news/michael-caine-karlovy-vary-film-festival-1235046159/",
    ),
    "Geoffrey Rush": (
        "Festival mu jako poctu promítl filmy Králova řeč, Quills a Shine, za který získal Oscara za mužský herecký výkon.",
        "https://variety.com/2022/film/global/geoffrey-rush-benicio-del-toro-karlovy-vary-film-festival-1235298942/",
    ),
    "Russell Crowe": (
        "Na zahajovacím koncertu vystoupil se svou kapelou Indoor Garden Party; festival k poctě připomněl i dvacáté výročí filmu Master and Commander.",
        "https://variety.com/2023/film/global/russell-crowe-karlovy-vary-1235604290/",
    ),
    "Stellan Skarsgård": (
        "Ve Varech uvedl film Sentimentální hodnota Joachima Triera, který krátce předtím získal Grand Prix v Cannes.",
        "https://variety.com/2025/film/global/stellan-skarsgard-vicky-krieps-peter-sarsgaard-dakota-johnson-karlovy-vary-1236439883/",
    ),
    "Dustin Hoffman": (
        "Ocenění dostal za celoživotní dílo od průlomové role v Absolventovi (1967) až po Oscary za Kramerová vs. Kramer a Rain Mana.",
        "https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/",
    ),
    "Juliette Binoche": (
        "Ocenění dostala za kariéru, která spojuje velké mezinárodní produkce s evropskou auteurskou kinematografií; Oscara získala za Anglického pacienta a opakovaně spolupracovala s režiséry jako Michael Haneke, Abbas Kiarostami nebo Claire Denis.",
        "https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/",
    ),
    "Robert Richardson": (
        "Trojnásobný oscarový kameraman (JFK, Aviator, Hugo), přezdívaný „Bílý ďábel“, převzal cenu z rukou Harveyho Keitela; na festivalu byl uveden i dokumentární portrét o jeho kariéře.",
        "https://www.hollywoodreporter.com/movies/movie-news/karlovy-vary-award-the-white-devil-robert-richardson-keitel-1236638062/",
    ),
}

text = open(PATH, encoding="utf-8").read()

def find_entry_span(text, name, start_from=0):
    marker = f"name: '{name}'"
    idx = text.index(marker, start_from)
    # walk backwards to the opening '{' of this object literal
    start = text.rindex("{", 0, idx)
    depth = 0
    j = start
    while True:
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    return start, j + 1  # end exclusive

applied = 0
for name, (cz, src) in CITATIONS.items():
    start, end = find_entry_span(text, name)
    entry = text[start:end]
    if "citationCz" in entry:
        print("SKIP (already has citation):", name)
        continue
    # insert before the final closing brace, after the last field
    inner = entry[1:-1].rstrip()
    if inner.endswith(","):
        inner = inner[:-1]
    new_entry = "{" + inner + f", citationCz: '{cz}', citationSource: '{src}' }}"
    text = text[:start] + new_entry + text[end:]
    applied += 1
    print("OK:", name)

print(f"\nApplied {applied}/{len(CITATIONS)} citations")

open(PATH, "w", encoding="utf-8", newline="").write(text)

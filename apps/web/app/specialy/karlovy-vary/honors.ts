// OVĚŘENO PROTI OFICIÁLNÍMU ARCHIVU KVIFF A ROČNÍKOVÝM SOUHRNŮM:
// https://www.kviff.com/en/about-us/festival-archive/{rok}
// Dnešní archivní karty "Awarded Guests" nejsou u starších ročníků úplné,
// proto u doplněných historických jmen držíme jako kontrolní vrstvu i
// ročníkové souhrny cen.
//
// Držíme VÝHRADNĚ Křišťálový glóbus za mimořádný umělecký přínos světové
// kinematografii (Crystal Globe for Outstanding Artistic Contribution to
// World Cinema). Festival na téže stránce uděluje i Cenu prezidenta festivalu
// (Festival President's Award) a Cenu prezidenta festivalu za přínos české
// kinematografii (Festival President's Award for Contribution to Czech
// Cinema) – to jsou JINÉ ceny a záměrně je do této řady neplníme.
//
// Rok 1994 a starší: archiv na stránce ročníku sekci "Awarded Guests" vůbec
// nemá, jediná zmínka "Crystal Globe" patří soutěžní Grand Prix. Čestná řada
// pro osobnosti tedy podle dostupného archivu začíná až rokem 1995.
// Chybí roky: 2020 (festival se nekonal, covid) a 2024 (festival dle dostupného
// archivu udělil jen Ceny prezidenta).
export type HonorGender = 'woman' | 'man';

export type HonorRecipient = {
  year: number;
  name: string;
  gender: HonorGender;
  country: string;
  role: string;
  roleCz: string;
  award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema';
  awardCz: 'Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii';
  reason: string;
  source: string;
  status?: 'announced';
  // Jak konkrétní ocenění zdůvodnil/okomentoval festival nebo dobový tisk –
  // u starších ročníků parafráze textu z archivu KVIFF (sekce "Awarded
  // Guests" daného ročníku), u ročníků, kde archiv od cca 2015 uvádí jen
  // holý název ceny, dohledáno v serióz. médiích (ČTK, Deník, Aktuálně.cz,
  // Variety, Hollywood Reporter aj.) – zdroj u takových záznamů je v
  // citationSource, protože je jiný než ověřovací zdroj v poli "source".
  citationCz?: string;
  citationSource?: string;
};

const award = 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' as const;
const awardCz = 'Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii' as const;
const reason = 'Čestné ocenění za mimořádný umělecký přínos a výraznou stopu ve vývoji světové kinematografie; nejde o soutěžní cenu za jeden konkrétní film.';

function src(year: number) {
  return `https://www.kviff.com/en/about-us/festival-archive/${year}`;
}

function wiki(year: number) {
  const editionByYear: Record<number, string> = {
    1999: '34th',
    2000: '35th',
    2001: '36th',
    2002: '37th',
    2004: '39th',
    2005: '40th',
    2006: '41st',
    2007: '42nd',
    2008: '43rd',
    2009: '44th',
    2010: '45th',
    2013: '48th',
  };
  return `https://en.wikipedia.org/wiki/${editionByYear[year]}_Karlovy_Vary_International_Film_Festival`;
}

const rawHonoraryCrystalGlobeRecipients = [
  { year: 1995, name: 'Gina Lollobrigida', gender: 'woman', country: 'Itálie', role: 'actor', roleCz: 'herečka', source: src(1995), citationCz: 'Legendární italská herečka dostala ocenění za mimořádný umělecký přínos světové kinematografii.' },
  { year: 1996, name: 'Gregory Peck', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(1996), citationCz: 'Hollywoodský herec dostal ocenění jako hvězda daného ročníku.' },
  { year: 1997, name: 'Miloš Forman', gender: 'man', country: 'Česko / USA', role: 'director', roleCz: 'režisér', source: src(1997), citationCz: 'Festival ocenil režiséra, jehož filmy jsou podle vlastního textu důležitou součástí českého i amerického filmového dědictví.' },
  { year: 1998, name: 'Michael Douglas', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(1998), citationCz: 'Byl hvězdou 33. ročníku a ocenění převzal osobně.' },
  { year: 1999, name: 'Karel Kachyňa', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(1999), citationCz: 'Ocenění dostal za dlouholetý umělecký přínos jako jeden z klíčových režisérů poválečného československého filmu.', citationSource: 'https://www.filmovyprehled.cz/cs/person/3526/karel-kachyna' },
  { year: 1999, name: 'Franco Zeffirelli', gender: 'man', country: 'Itálie', role: 'director', roleCz: 'režisér', source: src(1999), citationCz: 'Festival vyzdvihl, že se celý život pohyboval mezi divadlem a filmem, zejména díky adaptacím Shakespearových her.' },
  { year: 2000, name: 'Věra Chytilová', gender: 'woman', country: 'Česko', role: 'director', roleCz: 'režisérka', source: wiki(2000), citationCz: 'Cenu přebírala s typickým černým humorem – slavnou se stala scéna ze zahajovací znělky, kdy se rozbitý glóbus snažila slepit lepidlem, které „nechytalo“.', citationSource: 'https://www.e15.cz/magazin/znelky-patri-k-festivalu-sedmnact-let-vybrali-jsme-sedm-nej-847973' },
  { year: 2000, name: 'Carlos Saura', gender: 'man', country: 'Španělsko', role: 'director', roleCz: 'režisér', source: src(2000), citationCz: 'Festival ho označil za jednoho z nejzavedenějších španělských režisérů vedle Almodóvara a připomněl jeho dlouholetou spolupráci s Geraldine Chaplinovou.' },
  { year: 2001, name: 'Ben Kingsley', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: src(2001), citationCz: 'Festival připomněl jeho ikonické role – Itzhaka Sterna, Gándhího a Georgese Mélièse – u příležitosti držitele Oscaru a dvou Zlatých glóbů.' },
  { year: 2001, name: 'Otakar Vávra', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(2001), citationCz: 'Ocenění převzal v roce, kdy Křišťálový glóbus dostal svou dnešní podobu – křišťálovou kouli v objetí ženské postavy podle návrhu fotografa Tona Stana.', citationSource: 'https://www.e15.cz/magazin/rezisera-vavru-uctila-nova-znelka-karlovarskeho-festivalu-777564' },
  { year: 2002, name: 'John Boorman', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: wiki(2002), citationCz: 'Šlo o čestné ocenění za celoživotní dílo, nikoli o soutěžní cenu – hlavní Křišťálový glóbus téhož ročníku vyhrál český film Rok ďábla.', citationSource: 'https://en.wikipedia.org/wiki/37th_Karlovy_Vary_International_Film_Festival' },
  { year: 2002, name: 'Vlastimil Brodský', gender: 'man', country: 'Česko', role: 'actor', roleCz: 'herec', source: wiki(2002), citationCz: 'Ocenění mu bylo uděleno in memoriam – český herec zemřel v dubnu 2002, několik měsíců před červencovým festivalem.', citationSource: 'https://en.wikipedia.org/wiki/Vlastimil_Brodsk%C3%BD' },
  { year: 2002, name: 'Sean Connery', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: wiki(2002), citationCz: 'Na osobní účast rezignoval ze zdravotních důvodů; v té době natáčel v Praze film Liga výjimečných.', citationSource: 'https://en.wikipedia.org/wiki/37th_Karlovy_Vary_International_Film_Festival' },
  { year: 2003, name: 'Morgan Freeman', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2003), citationCz: 'Festival ho popsal jako charismatického herce, jehož přítomnost byla poctou pro celý ročník.' },
  { year: 2003, name: 'Stephen Frears', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: src(2003), citationCz: 'Křišťálový glóbus dostal společně s Jiřím Menzelem za celoživotní dílo.' },
  { year: 2003, name: 'Jiří Menzel', gender: 'man', country: 'Česko', role: 'director, actor', roleCz: 'režisér, herec', source: src(2003), citationCz: 'Křišťálový glóbus dostal společně se Stephenem Frearsem za celoživotní dílo.' },
  { year: 2004, name: 'Harvey Keitel', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2004), citationCz: 'Festival vyzdvihl širokou škálu jeho rolí – od brutálních násilníků po citlivé otce a manžely.' },
  { year: 2004, name: 'Miroslav Ondříček', gender: 'man', country: 'Česko', role: 'cinematographer', roleCz: 'kameraman', source: wiki(2004), citationCz: 'Slavný kameraman ocenění přebíral se slovy „Hlavně ať žije Slavia“ – narážkou na svou fotbalovou vášeň.', citationSource: 'https://isport.blesk.cz/clanek/fotbal/232118/slavny-filmar-i-fanousek-predevsim-at-zije-slavia-hlasal-ondricek.html' },
  { year: 2004, name: 'Roman Polanski', gender: 'man', country: 'Polsko / Francie', role: 'director', roleCz: 'režisér', source: src(2004), citationCz: 'Ocenění dostal jako tvůrce Čínské čtvrti, Rosemary má děťátko a Pianisty.' },
  { year: 2005, name: 'Robert Redford', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2005), citationCz: 'Festival ho označil za velikána světového filmu a u příležitosti jeho návštěvy promítl pět filmů, které režíroval nebo v nich hrál.' },
  { year: 2005, name: 'Liv Ullmann', gender: 'woman', country: 'Norsko', role: 'actor, director', roleCz: 'herečka, režisérka', source: src(2005), citationCz: 'Festival ji představil jako hvězdu evropského filmu, mladou múzu Ingmara Bergmana, autorku a velvyslankyni UNICEF.' },
  { year: 2005, name: 'Sharon Stone', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: wiki(2005), citationCz: 'Ocenění dostala ve stejném ročníku jako Robert Redford, Liv Ullmann a český režisér Jiří Krejčík.', citationSource: 'https://iol.co.za/entertainment/whats-on/2005-06-15-czechs-honour-stone-and-redford/' },
  { year: 2005, name: 'Jiří Krejčík', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: 'https://en.wikipedia.org/wiki/Ji%C5%99%C3%AD_Krej%C4%8D%C3%ADk', citationCz: 'Ocenění dostal český režisér a scenárista ve stejném ročníku jako Robert Redford, Liv Ullmann a Sharon Stone – v přehledech hvězdného ročníku 2005 bývá zmiňován méně často než zahraniční jména.', citationSource: 'https://adoc.pub/jii-krejik-hostem-zahrady-kulturni-pehled-zafii-2005-kli-kia.html' },
  { year: 2006, name: 'Andy García', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2006), citationCz: 'Ocenění dostal jako herec, ačkoli na festival přijel spíš jako režisér svého debutu Ztracené město.' },
  { year: 2006, name: 'Robert Shaye', gender: 'man', country: 'USA', role: 'producer', roleCz: 'producent', source: wiki(2006), citationCz: 'Ocenění dostal jako zakladatel studia New Line Cinema, které mimo jiné distribuovalo filmovou trilogii Pán prstenů.', citationSource: 'https://en.wikipedia.org/wiki/41st_Karlovy_Vary_International_Film_Festival' },
  { year: 2006, name: 'Jan Němec', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(2006), citationCz: 'Ocenění dostal klíčový režisér československé nové vlny 60. let.', citationSource: 'https://www.filmovyprehled.cz/cs/person/3041/jan-nemec' },
  { year: 2007, name: 'Danny DeVito', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2007), citationCz: 'Festival připomněl, že ho české publikum zná i jako producenta Pulp Fiction a Erin Brockovichové.' },
  { year: 2007, name: 'Břetislav Pojar', gender: 'man', country: 'Česko', role: 'animator, director', roleCz: 'animátor, režisér', source: wiki(2007), citationCz: 'Glóbus mu předala herečka Renée Zellwegerová. Spoluzaložil animační studio Bratři v triku a jeho film Lev a písnička vyhrál v roce 1960 Grand Prix na festivalu v Annecy.', citationSource: 'https://www.denik.cz/film-a-televize/zemrel-znamy-tvurce-animovanych-filmu-bretislav-pojar-20121013.html' },
  { year: 2008, name: 'Robert De Niro', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2008), citationCz: 'Dvojnásobný držitel Oscara si Křišťálovým glóbem rozšířil sbírku; přítomnost žijící legendy byla podle festivalu velkou událostí.' },
  { year: 2008, name: 'Dušan Hanák', gender: 'man', country: 'Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2008), citationCz: 'Ocenění dostal v roce svých sedmdesátin; festival k tomu uspořádal jeho minipřehlídku a výstavu fotografií Záznamy a odkazy.', citationSource: 'https://www.denik.cz/film-a-televize/dusan_hanak_rozhovor20080708.html' },
  { year: 2008, name: 'Juraj Jakubisko', gender: 'man', country: 'Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2008), citationCz: 'Ocenění přezdívaný „Fellini východu“ převzal u příležitosti světové premiéry svého filmu Bathory – ve stejném ročníku jako Dušan Hanák, se kterým sdílel i sedmdesáté narozeniny.', citationSource: 'https://ct24.ceskatelevize.cz/kultura/1449201-snimek-bathory-prijat-vlazne-jakubisko-pred-premierou-prevzal-kristalovy-globus' },
  { year: 2008, name: 'Ivan Passer', gender: 'man', country: 'Česko / USA', role: 'director', roleCz: 'režisér', source: wiki(2008), citationCz: 'Ten rok zároveň vedl hlavní porotu festivalu.', citationSource: 'https://en.wikipedia.org/wiki/43rd_Karlovy_Vary_International_Film_Festival' },
  { year: 2009, name: 'Isabelle Huppert', gender: 'woman', country: 'Francie', role: 'actor', roleCz: 'herečka', source: wiki(2009), citationCz: 'Ocenění přebírala za standing ovace před promítáním svého filmu Villa Amalia.', citationSource: 'https://english.radio.cz/isabelle-huppert-presented-crystal-globe-award-8418045' },
  { year: 2009, name: 'John Malkovich', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2009), citationCz: 'Festival ho označil za mistra vedlejších rolí, který svou přítomností publikum okouzlil.' },
  { year: 2009, name: 'Jan Švankmajer', gender: 'man', country: 'Česko', role: 'director, animator', roleCz: 'režisér, animátor', source: wiki(2009), citationCz: 'Na otázku novinářů, zda si cenu zaslouží, suše odpověděl: „Cena za sobectví? No nevím.“ Festival k oceněné uvedl jeho film Spiklenci slasti.', citationSource: 'https://www.denik.cz/film-a-televize/jan-svankmajer-cena-za-sobectvi-no-nevim20090713.html' },
  { year: 2010, name: 'Nikita Michalkov', gender: 'man', country: 'Rusko', role: 'director', roleCz: 'režisér', source: src(2010), citationCz: 'Ocenění dostal jako režisér.' },
  { year: 2010, name: 'Juraj Herz', gender: 'man', country: 'Česko / Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2010), citationCz: 'Glóbus přebíral se slovy, že jde o „cenu za filmy, co mi zakázali točit“ – narážkou na normalizační cenzuru. Ocenění dostal před promítáním svého filmu Petrolejové lampy.', citationSource: 'https://www.denik.cz/festivaly/juraj-herz-je-to-cena-za-ty-filmy20100710.html' },
  { year: 2011, name: 'Judi Dench', gender: 'woman', country: 'Británie', role: 'actor', roleCz: 'herečka', source: src(2011), citationCz: 'Festival připomněl její role královny Alžběty I. a legendární šéfky M. z bondovek.' },
  { year: 2012, name: 'Helen Mirren', gender: 'woman', country: 'Británie', role: 'actor', roleCz: 'herečka', source: src(2012), citationCz: 'Podle festivalu ocenění převzala s elegancí.' },
  { year: 2012, name: 'Susan Sarandon', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2012), citationCz: 'Festival ji označil za další velkou hvězdu ročníku; osobně uvedla film Jeff, který bydlí doma.' },
  { year: 2013, name: 'Oliver Stone', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2013), citationCz: 'Festival ho popsal jako tvůrce, který se vymyká tradičním měřítkům hodnocení, a připomněl Četu i jeho další filmy.' },
  { year: 2013, name: 'John Travolta', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2013), citationCz: 'Festival ho označil za energického herce a vášnivého tanečníka, který si publikum získal.' },
  { year: 2013, name: 'Theodor Pištěk', gender: 'man', country: 'Česko', role: 'costume designer', roleCz: 'kostýmní výtvarník', source: wiki(2013), citationCz: 'Oscarový kostýmní výtvarník a malíř navrhl mimo jiné uniformy Hradní stráže; Oscara získal za kostýmy k Formanovu Amadeovi a Césara za Valmonta.', citationSource: 'https://magazin.aktualne.cz/kultura/vytvarnik-theodor-pistek-dostal-kristalovy-globus/r~i:article:784422/' },
  { year: 2014, name: 'Mel Gibson', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2014), citationCz: 'Ocenění přijal jako herec, režisér i producent, podle festivalu s nadšením.' },
  { year: 2014, name: 'William Friedkin', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2014), citationCz: 'Festival připomněl jeho režii filmů Mzda strachu a Vymítač ďábla.' },
  { year: 2015, name: 'Richard Gere', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2015), citationCz: 'Ocenění přebíral na zahájení 50. jubilejního ročníku festivalu, kde připomněl i 80. narozeniny dalajlamy.', citationSource: 'https://variety.com/2015/film/festivals/richard-gere-to-receive-crystal-globe-at-karlovy-vary-film-festival-1201524955/' },
  { year: 2016, name: 'Willem Dafoe', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2016), citationCz: 'Festival mu jako poctu promítl snímky Pasolini a Poslední pokušení Krista.', citationSource: 'https://www.euronews.com/culture/2016/07/04/karlovy-vary-film-festival-honours-willem-dafoe-with-outstanding-contribution' },
  { year: 2017, name: 'Ken Loach', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: src(2017), citationCz: 'Festival dvojici s Paulem Lavertym označil za tvůrce, kteří společně na dvanácti filmech spoluvytvořili britský sociálně-realistický film – mimo jiné držitele Zlaté palmy za I, Daniel Blake a Vítr, který čechrá ječmen. Loach přijel do Varů poprvé už v roce 1967 s filmem Chudák Kráva a v roce 1970 tu za film Kes získal svůj první Křišťálový glóbus.', citationSource: 'https://www.criterion.com/current/posts/4737-a-cinema-of-conscience-ken-loach-and-paul-laverty-at-karlovy-vary' },
  { year: 2017, name: 'Paul Laverty', gender: 'man', country: 'Británie', role: 'screenwriter', roleCz: 'scenárista', source: src(2017), citationCz: 'Festival dvojici s Kenem Loachem označil za tvůrce, kteří společně na dvanácti filmech spoluvytvořili britský sociálně-realistický film – mimo jiné držitele Zlaté palmy za I, Daniel Blake a Vítr, který čechrá ječmen.', citationSource: 'https://www.criterion.com/current/posts/4737-a-cinema-of-conscience-ken-loach-and-paul-laverty-at-karlovy-vary' },
  { year: 2017, name: 'James Newton Howard', gender: 'man', country: 'USA', role: 'composer', roleCz: 'skladatel', source: src(2017), citationCz: 'Skladatel hudby k filmům Pretty Woman, Šestý smysl, Batman Begins i všem čtyřem dílům Hunger Games na zahájení dirigoval Symfonický orchestr Českého rozhlasu při světové premiéře hudby z Fantastických zvířat 2.', citationSource: 'https://variety.com/2017/film/festivals/ken-loach-james-newton-howard-honored-karlovy-vary-1202393875/' },
  { year: 2018, name: 'Tim Robbins', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2018), citationCz: 'Na festivalu vystoupil i se svou kapelou The Rogues Gallery Band a uvedl vlastní filmy Bob Roberts a Cradle Will Rock.', citationSource: 'https://variety.com/2018/film/global/tim-robbins-karlovy-vary-film-festival-1202850697/' },
  { year: 2018, name: 'Barry Levinson', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2018), citationCz: 'Čtyřnásobný oscarový nominant, který za Rain Mana získal Oscara za režii.', citationSource: 'https://www.praguereporter.com/home/2018/6/19/tim-robbins-to-be-awarded-at-2018-karlovy-vary-film-fest/' },
  { year: 2019, name: 'Julianne Moore', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2019), citationCz: 'Cenu přebírala na zahájení festivalu a uvedla film Po svatbě po boku manžela a režiséra Barta Freundlicha i spoluhráče Billyho Crudupa.', citationSource: 'https://variety.com/2019/film/global/julianne-moore-karlovy-vary-film-festival-1203256004/' },
  { year: 2019, name: 'Patricia Clarkson', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2019), citationCz: 'Krátce předtím získala Zlatý glóbus za seriál Sharp Objects; ve Varech uvedla film Isabel Coixetové Learning to Drive.', citationSource: 'https://variety.com/2019/film/global/julianne-moore-patricia-clarkson-karlovy-vary-film-festival-1203238750/' },
  { year: 2021, name: 'Michael Caine', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: src(2021), citationCz: 'Dvojnásobný oscarový a trojnásobný držitel Zlatého glóbu i Evropské filmové ceny sklidil na zahájení standing ovaci, kterou pozdravil zvednutou vycházkovou holí. Ve Varech uvedl film Best Sellers.', citationSource: 'https://variety.com/2021/film/news/michael-caine-karlovy-vary-film-festival-1235046159/' },
  { year: 2022, name: 'Geoffrey Rush', gender: 'man', country: 'Austrálie', role: 'actor', roleCz: 'herec', source: src(2022), citationCz: 'Festival mu jako poctu promítl filmy Králova řeč, Quills a Shine, za který získal Oscara za mužský herecký výkon.', citationSource: 'https://variety.com/2022/film/global/geoffrey-rush-benicio-del-toro-karlovy-vary-film-festival-1235298942/' },
  { year: 2023, name: 'Russell Crowe', gender: 'man', country: 'Austrálie', role: 'actor', roleCz: 'herec', source: src(2023), citationCz: 'Na zahajovacím koncertu vystoupil se svou kapelou Indoor Garden Party; festival k poctě připomněl i dvacáté výročí filmu Master and Commander.', citationSource: 'https://variety.com/2023/film/global/russell-crowe-karlovy-vary-1235604290/' },
  // 2024: dle archivu bez čestného oceněného (všichni čtyři hosté měli Cenu prezidenta)
  { year: 2025, name: 'Stellan Skarsgård', gender: 'man', country: 'Švédsko', role: 'actor', roleCz: 'herec', source: src(2025), citationCz: 'Ve Varech uvedl film Sentimentální hodnota Joachima Triera, který krátce předtím získal Grand Prix v Cannes.', citationSource: 'https://variety.com/2025/film/global/stellan-skarsgard-vicky-krieps-peter-sarsgaard-dakota-johnson-karlovy-vary-1236439883/' },
  {
    year: 2026, name: 'Dustin Hoffman', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', status: 'announced',
    source: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/', citationCz: 'Ocenění dostal za celoživotní dílo od průlomové role v Absolventovi (1967) až po Oscary za Kramerová vs. Kramer a Rain Mana.', citationSource: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/' },
  {
    year: 2026, name: 'Juliette Binoche', gender: 'woman', country: 'Francie', role: 'actor', roleCz: 'herečka', status: 'announced',
    source: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/', citationCz: 'Ocenění dostala za kariéru, která spojuje velké mezinárodní produkce s evropskou auteurskou kinematografií; Oscara získala za Anglického pacienta a opakovaně spolupracovala s režiséry jako Michael Haneke, Abbas Kiarostami nebo Claire Denis.', citationSource: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/' },
  {
    year: 2026, name: 'Robert Richardson', gender: 'man', country: 'USA', role: 'cinematographer', roleCz: 'kameraman', status: 'announced',
    source: 'https://aninews.in/news/entertainment/hollywood/dustin-hoffman-juliette-binoche-robert-richardson-to-receive-crystal-globe-honours-at-karlovy-vary-film-festival20260623235202/', citationCz: 'Trojnásobný oscarový kameraman (JFK, Aviator, Hugo), přezdívaný „Bílý ďábel“, převzal cenu z rukou Harveyho Keitela; na festivalu byl uveden i dokumentární portrét o jeho kariéře.', citationSource: 'https://www.hollywoodreporter.com/movies/movie-news/karlovy-vary-award-the-white-devil-robert-richardson-keitel-1236638062/' },
] satisfies Array<Omit<HonorRecipient, 'award' | 'awardCz' | 'reason'>>;

export const honoraryCrystalGlobeRecipients: HonorRecipient[] = rawHonoraryCrystalGlobeRecipients.map((recipient) => ({
  ...recipient,
  award,
  awardCz,
  reason,
}));

export const honorarySelectionNote =
  'KVIFF uvádí, že touto cenou každoročně oceňuje alespoň jednu (obvykle dvě až tři) výjimečné osobnosti, které zanechaly výraznou stopu ve vývoji světové kinematografie. Nevybírá je soutěžní porota filmů; jde o čestné dramaturgicko-institucionální rozhodnutí festivalu. Odděleně od ní festival uděluje Cenu prezidenta festivalu a Cenu prezidenta festivalu za přínos české kinematografii – ty do této řady nepočítáme.';

export const pre1989AwardsNotes = [
  {
    period: '1946–1947',
    title: 'Začátek byl nesoutěžní',
    body: 'První dva ročníky v letech 1946 a 1947 uvádí oficiální archiv jako nesoutěžní. Pokud se ptáme na první oceněné, musíme začít až rokem 1948.',
  },
  {
    period: '1948',
    title: 'První soutěžní ocenění',
    body: 'V roce 1948 získal Grand International Prize film The Last Stage režisérky Wandy Jakubowské. Prvními uvedenými individuálními oceněními jsou William Wyler za režii filmu The Best Years of Our Lives a Madeleine Robinson za herecký výkon.',
  },
  {
    period: '60. léta',
    title: 'Film, režie, herectví, ne dnešní celebrity',
    body: 'V 60. letech archiv ukazuje hlavně soutěžní systém: Grand Prix nebo hlavní ceny filmům, ceny za režii, herecké ceny a zvláštní uznání. Například 1960 vyhrál Grand Prix film Seryozha, 1964 se udělovaly hlavní ceny bez uvedeného Grand Prix a 1968 vyhrálo Rozmarné léto Jiřího Menzela.',
  },
  {
    period: '1988–1990',
    title: 'Předěl po listopadu',
    body: 'Poslední předlistopadový ročník 1988 měl Grand Prix pro čínský film Hibiscus Town. V roce 1990 už po politickém zlomu Grand Prix udělena nebyla. Současná čestná řada oceněných hostů (Křišťálový glóbus za mimořádný umělecký přínos) začíná podle dostupného archivu až rokem 1995.',
  },
];

export const honoraryGenderCounts = honoraryCrystalGlobeRecipients.reduce(
  (acc, recipient) => {
    acc[recipient.gender] += 1;
    return acc;
  },
  { woman: 0, man: 0 } as Record<HonorGender, number>,
);

export const honoraryTotal = honoraryCrystalGlobeRecipients.length;
export const honoraryWomenShare = Math.round((honoraryGenderCounts.woman / honoraryTotal) * 1000) / 10;

// Roky s nejvyšší koncentrací žen v jednom ročníku (fakticky ověřeno, ne odhad "vlny"):
// 2005 (Ullmann + Stone), 2012 (Mirren + Sarandon) a 2019 (Moore + Clarkson)
// jsou jediné roky se dvěma ženami zároveň.
export const honoraryDoubleWomanYears = [2005, 2012, 2019];

export const honoraryByPeriod = [
  { period: '1995–2008', woman: 4, man: 28 },
  { period: '2009–2019', woman: 6, man: 16 },
  { period: '2021–2026', woman: 1, man: 6 },
];

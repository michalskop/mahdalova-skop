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
  { year: 1995, name: 'Gina Lollobrigida', gender: 'woman', country: 'Itálie', role: 'actor', roleCz: 'herečka', source: src(1995) },
  { year: 1996, name: 'Gregory Peck', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(1996) },
  { year: 1997, name: 'Miloš Forman', gender: 'man', country: 'Česko / USA', role: 'director', roleCz: 'režisér', source: src(1997) },
  { year: 1998, name: 'Michael Douglas', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(1998) },
  { year: 1999, name: 'Karel Kachyňa', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(1999) },
  { year: 1999, name: 'Franco Zeffirelli', gender: 'man', country: 'Itálie', role: 'director', roleCz: 'režisér', source: src(1999) },
  { year: 2000, name: 'Věra Chytilová', gender: 'woman', country: 'Česko', role: 'director', roleCz: 'režisérka', source: wiki(2000) },
  { year: 2000, name: 'Carlos Saura', gender: 'man', country: 'Španělsko', role: 'director', roleCz: 'režisér', source: src(2000) },
  { year: 2001, name: 'Ben Kingsley', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: src(2001) },
  { year: 2001, name: 'Otakar Vávra', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(2001) },
  { year: 2002, name: 'John Boorman', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: wiki(2002) },
  { year: 2002, name: 'Vlastimil Brodský', gender: 'man', country: 'Česko', role: 'actor', roleCz: 'herec', source: wiki(2002) },
  { year: 2002, name: 'Sean Connery', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: wiki(2002) },
  { year: 2003, name: 'Morgan Freeman', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2003) },
  { year: 2003, name: 'Stephen Frears', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: src(2003) },
  { year: 2003, name: 'Jiří Menzel', gender: 'man', country: 'Česko', role: 'director, actor', roleCz: 'režisér, herec', source: src(2003) },
  { year: 2004, name: 'Harvey Keitel', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2004) },
  { year: 2004, name: 'Miroslav Ondříček', gender: 'man', country: 'Česko', role: 'cinematographer', roleCz: 'kameraman', source: wiki(2004) },
  { year: 2004, name: 'Roman Polanski', gender: 'man', country: 'Polsko / Francie', role: 'director', roleCz: 'režisér', source: src(2004) },
  { year: 2005, name: 'Robert Redford', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2005) },
  { year: 2005, name: 'Liv Ullmann', gender: 'woman', country: 'Norsko', role: 'actor, director', roleCz: 'herečka, režisérka', source: src(2005) },
  { year: 2005, name: 'Sharon Stone', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: wiki(2005) },
  { year: 2006, name: 'Andy García', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2006) },
  { year: 2006, name: 'Robert Shaye', gender: 'man', country: 'USA', role: 'producer', roleCz: 'producent', source: wiki(2006) },
  { year: 2006, name: 'Jan Němec', gender: 'man', country: 'Česko', role: 'director', roleCz: 'režisér', source: wiki(2006) },
  { year: 2007, name: 'Danny DeVito', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2007) },
  { year: 2007, name: 'Břetislav Pojar', gender: 'man', country: 'Česko', role: 'animator, director', roleCz: 'animátor, režisér', source: wiki(2007) },
  { year: 2008, name: 'Robert De Niro', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2008) },
  { year: 2008, name: 'Dušan Hanák', gender: 'man', country: 'Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2008) },
  { year: 2008, name: 'Juraj Jakubisko', gender: 'man', country: 'Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2008) },
  { year: 2008, name: 'Ivan Passer', gender: 'man', country: 'Česko / USA', role: 'director', roleCz: 'režisér', source: wiki(2008) },
  { year: 2009, name: 'Isabelle Huppert', gender: 'woman', country: 'Francie', role: 'actor', roleCz: 'herečka', source: wiki(2009) },
  { year: 2009, name: 'John Malkovich', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2009) },
  { year: 2009, name: 'Jan Švankmajer', gender: 'man', country: 'Česko', role: 'director, animator', roleCz: 'režisér, animátor', source: wiki(2009) },
  { year: 2010, name: 'Nikita Michalkov', gender: 'man', country: 'Rusko', role: 'director', roleCz: 'režisér', source: src(2010) },
  { year: 2010, name: 'Juraj Herz', gender: 'man', country: 'Česko / Slovensko', role: 'director', roleCz: 'režisér', source: wiki(2010) },
  { year: 2011, name: 'Judi Dench', gender: 'woman', country: 'Británie', role: 'actor', roleCz: 'herečka', source: src(2011) },
  { year: 2012, name: 'Helen Mirren', gender: 'woman', country: 'Británie', role: 'actor', roleCz: 'herečka', source: src(2012) },
  { year: 2012, name: 'Susan Sarandon', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2012) },
  { year: 2013, name: 'Oliver Stone', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2013) },
  { year: 2013, name: 'John Travolta', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2013) },
  { year: 2013, name: 'Theodor Pištěk', gender: 'man', country: 'Česko', role: 'costume designer', roleCz: 'kostýmní výtvarník', source: wiki(2013) },
  { year: 2014, name: 'Mel Gibson', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2014) },
  { year: 2014, name: 'William Friedkin', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2014) },
  { year: 2015, name: 'Richard Gere', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2015) },
  { year: 2016, name: 'Willem Dafoe', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', source: src(2016) },
  { year: 2017, name: 'Ken Loach', gender: 'man', country: 'Británie', role: 'director', roleCz: 'režisér', source: src(2017) },
  { year: 2017, name: 'Paul Laverty', gender: 'man', country: 'Británie', role: 'screenwriter', roleCz: 'scenárista', source: src(2017) },
  { year: 2017, name: 'James Newton Howard', gender: 'man', country: 'USA', role: 'composer', roleCz: 'skladatel', source: src(2017) },
  { year: 2018, name: 'Tim Robbins', gender: 'man', country: 'USA', role: 'actor, director', roleCz: 'herec, režisér', source: src(2018) },
  { year: 2018, name: 'Barry Levinson', gender: 'man', country: 'USA', role: 'director', roleCz: 'režisér', source: src(2018) },
  { year: 2019, name: 'Julianne Moore', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2019) },
  { year: 2019, name: 'Patricia Clarkson', gender: 'woman', country: 'USA', role: 'actor', roleCz: 'herečka', source: src(2019) },
  { year: 2021, name: 'Michael Caine', gender: 'man', country: 'Británie', role: 'actor', roleCz: 'herec', source: src(2021) },
  { year: 2022, name: 'Geoffrey Rush', gender: 'man', country: 'Austrálie', role: 'actor', roleCz: 'herec', source: src(2022) },
  { year: 2023, name: 'Russell Crowe', gender: 'man', country: 'Austrálie', role: 'actor', roleCz: 'herec', source: src(2023) },
  // 2024: dle archivu bez čestného oceněného (všichni čtyři hosté měli Cenu prezidenta)
  { year: 2025, name: 'Stellan Skarsgård', gender: 'man', country: 'Švédsko', role: 'actor', roleCz: 'herec', source: src(2025) },
  {
    year: 2026, name: 'Dustin Hoffman', gender: 'man', country: 'USA', role: 'actor', roleCz: 'herec', status: 'announced',
    source: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/',
  },
  {
    year: 2026, name: 'Juliette Binoche', gender: 'woman', country: 'Francie', role: 'actor', roleCz: 'herečka', status: 'announced',
    source: 'https://variety.com/2026/film/global/dustin-hoffman-juliette-binoche-jeffrey-wright-karlovy-vary-1236787921/',
  },
  {
    year: 2026, name: 'Robert Richardson', gender: 'man', country: 'USA', role: 'cinematographer', roleCz: 'kameraman', status: 'announced',
    source: 'https://aninews.in/news/entertainment/hollywood/dustin-hoffman-juliette-binoche-robert-richardson-to-receive-crystal-globe-honours-at-karlovy-vary-film-festival20260623235202/',
  },
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
  { period: '1995–2008', woman: 4, man: 27 },
  { period: '2009–2019', woman: 6, man: 16 },
  { period: '2021–2026', woman: 1, man: 6 },
];

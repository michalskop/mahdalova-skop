export type HonorGender = 'woman' | 'man';

export type HonorRecipient = {
  year: number;
  name: string;
  gender: HonorGender;
  country: string;
  role: string;
  award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema';
  status?: 'announced';
};

export const honoraryCrystalGlobeRecipients: HonorRecipient[] = [
  { year: 1998, name: 'Michael Douglas', gender: 'man', country: 'USA', role: 'actor, producer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 1999, name: 'Karel Kachyňa', gender: 'man', country: 'Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 1999, name: 'Franco Zeffirelli', gender: 'man', country: 'Italy', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2000, name: 'Věra Chytilová', gender: 'woman', country: 'Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2000, name: 'Carlos Saura', gender: 'man', country: 'Spain', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2001, name: 'Ben Kingsley', gender: 'man', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2001, name: 'Otakar Vávra', gender: 'man', country: 'Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2002, name: 'John Boorman', gender: 'man', country: 'United Kingdom', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2002, name: 'Vlastimil Brodský', gender: 'man', country: 'Czech Republic', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2002, name: 'Sean Connery', gender: 'man', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2003, name: 'Stephen Frears', gender: 'man', country: 'United Kingdom', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2003, name: 'Jiří Menzel', gender: 'man', country: 'Czech Republic', role: 'director, actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2003, name: 'Morgan Freeman', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2004, name: 'Harvey Keitel', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2004, name: 'Miroslav Ondříček', gender: 'man', country: 'Czech Republic', role: 'cinematographer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2004, name: 'Roman Polanski', gender: 'man', country: 'Poland / France', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2005, name: 'Robert Redford', gender: 'man', country: 'USA', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2005, name: 'Liv Ullmann', gender: 'woman', country: 'Norway', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2005, name: 'Sharon Stone', gender: 'woman', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2006, name: 'Andy García', gender: 'man', country: 'USA', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2006, name: 'Robert Shaye', gender: 'man', country: 'USA', role: 'producer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2006, name: 'Jan Němec', gender: 'man', country: 'Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2007, name: 'Danny DeVito', gender: 'man', country: 'USA', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2007, name: 'Břetislav Pojar', gender: 'man', country: 'Czech Republic', role: 'animator, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2008, name: 'Robert De Niro', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2008, name: 'Dušan Hanák', gender: 'man', country: 'Slovakia', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2008, name: 'Juraj Jakubisko', gender: 'man', country: 'Slovakia', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2008, name: 'Ivan Passer', gender: 'man', country: 'USA / Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2009, name: 'John Malkovich', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2009, name: 'Isabelle Huppert', gender: 'woman', country: 'France', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2010, name: 'Jude Law', gender: 'man', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2011, name: 'Judi Dench', gender: 'woman', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2012, name: 'Susan Sarandon', gender: 'woman', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2012, name: 'Helen Mirren', gender: 'woman', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2013, name: 'John Travolta', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2013, name: 'Oliver Stone', gender: 'man', country: 'USA', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2013, name: 'Theodor Pištěk', gender: 'man', country: 'Czech Republic', role: 'costume designer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2014, name: 'Mel Gibson', gender: 'man', country: 'USA', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2014, name: 'William Friedkin', gender: 'man', country: 'USA', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2015, name: 'Richard Gere', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2016, name: 'Willem Dafoe', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2017, name: 'Ken Loach', gender: 'man', country: 'United Kingdom', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2017, name: 'Paul Laverty', gender: 'man', country: 'United Kingdom', role: 'screenwriter', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2017, name: 'James Newton Howard', gender: 'man', country: 'USA', role: 'composer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2018, name: 'Tim Robbins', gender: 'man', country: 'USA', role: 'actor, director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2018, name: 'Barry Levinson', gender: 'man', country: 'USA', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2019, name: 'Julianne Moore', gender: 'woman', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2019, name: 'Patricia Clarkson', gender: 'woman', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2019, name: 'Billy Crudup', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2021, name: 'Michael Caine', gender: 'man', country: 'United Kingdom', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2021, name: 'Johnny Depp', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2021, name: 'Jan Svěrák', gender: 'man', country: 'Czech Republic', role: 'director', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2022, name: 'Geoffrey Rush', gender: 'man', country: 'Australia', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2023, name: 'Russell Crowe', gender: 'man', country: 'Australia', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2025, name: 'Stellan Skarsgård', gender: 'man', country: 'Sweden', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema' },
  { year: 2026, name: 'Dustin Hoffman', gender: 'man', country: 'USA', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema', status: 'announced' },
  { year: 2026, name: 'Juliette Binoche', gender: 'woman', country: 'France', role: 'actor', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema', status: 'announced' },
  { year: 2026, name: 'Robert Richardson', gender: 'man', country: 'USA', role: 'cinematographer', award: 'Crystal Globe for Outstanding Artistic Contribution to World Cinema', status: 'announced' },
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

export const honoraryByPeriod = [
  { period: '1998-2008', woman: 3, man: 25 },
  { period: '2009-2019', woman: 6, man: 15 },
  { period: '2021-2026', woman: 1, man: 8 },
];

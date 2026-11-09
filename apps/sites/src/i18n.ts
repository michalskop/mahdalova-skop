// UI strings per language. Page texts live in src/texts/<lang>/ and src/texts/<site>/.
export const ui = {
  en: { about: 'About', impact: 'Impact', latest: 'Latest impact', mainSite: 'Our main site (Czech)', follow: 'Follow us', empty: 'Nothing here yet.', by: 'DataTimes is a project of Kateřina Mahdalová and Michal Škop.', all: 'All impact', featured: 'Featured analysis', original: 'Read the full article on DataTimes.cz (in Czech)', numbers: 'In numbers', impactSoon: 'Impact materials are being prepared.' },
  cs: { about: 'O nás', impact: 'Dopad', latest: 'Nejnovější dopad', mainSite: 'Náš hlavní web', follow: 'Sledujte nás', empty: 'Zatím tu nic není.', by: 'DataTimes je projekt Kateřiny Mahdalové a Michala Škopa.', all: 'Všechen dopad', featured: 'Doporučená analýza', original: 'Číst celý článek na DataTimes.cz', numbers: 'V číslech', impactSoon: 'Materiály o dopadu se připravují.' },
} as const;
export type Lang = keyof typeof ui;

export const paths = {
  en: { about: '/about/', impact: '/impact/' },
  cs: { about: '/o-nas/', impact: '/dopad/' },
} as const;

// Dates: never US style. English "4 November 2026", Czech "4. 11. 2026".
// YAML turns 2026-11-04 into a Date at UTC midnight, so format in UTC.
export function formatDate(value: Date | string, lang: Lang): string {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB', {
    day: 'numeric', month: lang === 'cs' ? 'numeric' : 'long', year: 'numeric', timeZone: 'UTC',
  }).format(d);
}

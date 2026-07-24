export const DPBP_HOME = '/specialy/data-pro-budouci-premierku';

export interface DpbpChapterNavItem {
  id: string;
  slug: string;
  shortTitle: string;
  title: string;
  accent: string;
}

export const DPBP_CHAPTERS: DpbpChapterNavItem[] = [
  { id: '01', slug: '01-demografie', shortTitle: 'Demografie', title: 'Demografie', accent: '#de1743' },
  { id: '02', slug: '02-zdravotnictvi-a-pece', shortTitle: 'Zdravotnictví', title: 'Zdravotnictví a péče', accent: '#5e66d5' },
  { id: '03', slug: '03-nedostupnost-bydleni', shortTitle: 'Bydlení', title: 'Nedostupnost bydlení', accent: '#ff5c4a' },
  { id: '04', slug: '04-regionalni-propasti', shortTitle: 'Regiony', title: 'Regionální propasti', accent: '#1a9fbd' },
  { id: '05', slug: '05-uroven-vzdelavani', shortTitle: 'Vzdělávání', title: 'Úroveň vzdělávání', accent: '#639e0a' },
  { id: '06', slug: '06-ekonomicka-nerovnost', shortTitle: 'Nerovnost', title: 'Ekonomická nerovnost', accent: '#efb704' },
  { id: '07', slug: '07-ai-a-trh-prace', shortTitle: 'AI', title: 'AI a trh práce', accent: '#4c4f8e' },
  { id: '08', slug: '08-digitalizace-a-inovace', shortTitle: 'Inovace', title: 'Digitalizace a inovace', accent: '#5fcce6' },
  { id: '09', slug: '09-energie-a-energeticka-bezpecnost', shortTitle: 'Energie', title: 'Energie a energetická bezpečnost', accent: '#f76800' },
  { id: '10', slug: '10-klimaticka-zmena', shortTitle: 'Klima', title: 'Klimatická změna', accent: '#f01745' },
  { id: '11', slug: '11-bezpecnost-a-konflikty', shortTitle: 'Bezpečnost', title: 'Bezpečnost a konflikty', accent: '#a03250' },
  { id: '12', slug: '12-informacni-manipulace', shortTitle: 'Manipulace', title: 'Informační manipulace', accent: '#53361e' },
  { id: '13', slug: '13-oligarchizace-a-korupce', shortTitle: 'Oligarchizace', title: 'Oligarchizace a korupce', accent: '#9f319e' },
  { id: '14', slug: '14-verejne-finance-a-dane', shortTitle: 'Finance', title: 'Veřejné finance a daně', accent: '#a47d03' },
  { id: '15', slug: '15-efektivni-vladnuti', shortTitle: 'Vládnutí', title: 'Efektivní vládnutí', accent: '#0e926a' },
];

export function chapterHref(slug: string) {
  return `${DPBP_HOME}/${slug}`;
}

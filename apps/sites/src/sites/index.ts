export type SiteId = 'org' | 'eu' | 'at';

export interface SiteConfig {
  id: SiteId;
  domain: string;
  lang: 'en' | 'cs';
  name: string;
  tagline: string;
  perspective: string;        // shown in the header badge
  sections: string[];         // which sections the site shows
}

export const sites: Record<SiteId, SiteConfig> = {
  org: {
    id: 'org', domain: 'datatimes.org', lang: 'en', name: 'DataTimes',
    tagline: 'Data. Context. Clarity. Courage.', perspective: 'Global',
    sections: ['about', 'impact'],
  },
  eu: {
    id: 'eu', domain: 'datatimes.eu', lang: 'en', name: 'DataTimes',
    tagline: 'Data journalism on European questions.', perspective: 'European perspective',
    sections: ['about', 'impact'],
  },
  at: {
    id: 'at', domain: 'datatimes.at', lang: 'cs', name: 'DataTimes',
    tagline: 'Data, která dávají smysl. Pohled z Rakouska.', perspective: 'Rakouský pohled',
    sections: ['about', 'impact'],
  },
};

export function currentSiteId(value: string | undefined): SiteId {
  return value && value in sites ? (value as SiteId) : 'org';
}

export const site: SiteConfig = sites[currentSiteId(process.env.SITE)];

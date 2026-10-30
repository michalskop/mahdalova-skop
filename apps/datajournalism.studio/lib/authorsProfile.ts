// lib/authorsProfile.ts
// Author profile for the /author/[slug] page header (person card).
// English bios translated from the Czech /o-nas page (datatimes.cz).

export interface AuthorSocial {
  bluesky?: string; // handle bez protokolu, např. "katemahdalova.bsky.social"
  threads?: string; // handle s @, např. "@katemahdalova"
  twitter?: string; // handle s @, např. "@data_zurnalist"
  facebook?: string; // cesta za facebook.com/, např. "readerwriterKate"
  instagram?: string; // handle bez @, např. "katemahdalova"
  linkedin?: string; // cesta za linkedin.com/in/, např. "katerina-mahdalova-89050a70"
}

export interface AuthorProfile {
  name: string;
  photo?: string; // cesta v /public, kruhový ořez
  email?: string;
  bio?: string; // 1–2 věty; když chybí, medailonek se nevykreslí
  social?: AuthorSocial;
}

const PROFILES: AuthorProfile[] = [
  {
    name: 'Kateřina Mahdalová',
    photo: '/authors/katerina-mahdalova-portret-v4.webp',
    bio: 'Editor-in-chief and co-owner of DataTimes. Journalist and analyst, author of thousands of visualisations and analyses; led data projects at the Czech News Agency (ČTK) in 2016–19 and works with leading media in Czechia and abroad. She focuses on human rights and holding the powerful to account. Two-time winner of the Czech Journalism Award with eight shortlist nominations, including the Data Journalism Awards. She teaches data journalism at Jan Evangelista Purkyně University.',
    social: {
      bluesky: 'katemahdalova.bsky.social',
      threads: '@katemahdalova',
      twitter: '@data_zurnalist',
      facebook: 'readerwriterKate',
      instagram: 'katemahdalova',
      linkedin: 'katerina-mahdalova-89050a70',
    },
  },
  {
    name: 'Michal Škop',
    photo: '/authors/michal-skop-portret.webp',
    bio: 'Editor-in-chief and co-owner of DataTimes. Statistician, demographer and programmer; founder and director of the non-profit Voting Advice Applications (volebnikalkulacka.cz), which since 2006 have helped millions of voters in many countries make better-informed choices. Winner of the Czech Journalism Award (2025) with three shortlist nominations. He has worked at the Max Planck Institute for Demographic Research in Rostock, the University of Salamanca and Charles University, specialises in election analysis and predictions, and teaches at the University of West Bohemia in Pilsen.',
    social: {
      bluesky: 'michalskop.bsky.social',
      threads: '@skopmichal',
      twitter: '@skopmichal',
    },
  },
];

/** Finds a profile by the author's display name (case-insensitive). */
export function getAuthorProfile(name: string): AuthorProfile | undefined {
  const n = name.trim().toLowerCase();
  return PROFILES.find((p) => p.name.toLowerCase() === n);
}

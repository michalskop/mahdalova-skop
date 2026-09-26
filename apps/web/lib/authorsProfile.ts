// lib/authorsProfile.ts
// Profil autora/autorky pro hlavičku stránky /autor/[slug] (person-karta).
// Data (jméno, foto, socialy, e-mail) sdílíme s ContactsBlock; „bio" je krátký
// medailonek, který se ukáže jen když je vyplněný (nevymýšlíme ho automaticky).

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
    photo: '/authors/katerina-mahdalova.webp',
    email: 'datovazurnalistika@gmail.com',
    // bio: '…', // TODO doplnit krátký medailonek (1–2 věty)
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
    photo: '/authors/michal-skop.webp',
    email: 'michal@datajurnalism.studio',
    // bio: '…', // TODO doplnit krátký medailonek (1–2 věty)
    social: {
      bluesky: 'michalskop.bsky.social',
      threads: '@skopmichal',
      twitter: '@skopmichal',
    },
  },
];

/** Najde profil podle zobrazovaného jména autora (case-insensitive). */
export function getAuthorProfile(name: string): AuthorProfile | undefined {
  const n = name.trim().toLowerCase();
  return PROFILES.find((p) => p.name.toLowerCase() === n);
}

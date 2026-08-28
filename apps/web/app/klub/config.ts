// apps/web/app/klub/config.ts
//
// Konfigurace stránky Klub DataTimes (/klub). TESTOVACÍ VERZE.
// Všechna místa označená `TODO:` je potřeba doplnit reálnou hodnotou před
// ostrým spuštěním. Strategie: docs/strategie/PODPOROVATELE.md
//
// Rozhodnuto: žurnalistika zůstává zdarma, bez paywallu, bez přihlašování.
// Úrovně: podporovatel/ka → patron/ka → mecenáš/ka (+ zakladatel/ka).

export type Tier = {
  /** interní klíč */
  key: 'podporovatel' | 'patron' | 'mecenas';
  /** mužský / ženský tvar */
  label: string;
  /** částka v Kč pro zvolenou periodu */
  amount: number;
  /** Stripe Payment Link; prázdné = tlačítko „Připravujeme" */
  url: string;
  /** krátký popis pod názvem */
  note: string;
};

export type Period = 'monthly' | 'yearly';

/** Měsíční úrovně — používají existující, ověřené Stripe Payment Links. */
export const MONTHLY: Tier[] = [
  {
    key: 'podporovatel',
    label: 'Podporovatel / Podporovatelka',
    amount: 29,
    url: 'https://buy.stripe.com/dRm9AU8U6dlOaEa1x93ks0b',
    note: 'Základní podpora. Za cenu jedné SMS měsíčně držíte dveře otevřené.',
  },
  {
    key: 'patron',
    label: 'Patron / Patronka',
    amount: 199,
    url: 'https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a',
    note: 'Za jeden oběd měsíčně. Berete DataTimes pod svá křídla.',
  },
  {
    key: 'mecenas',
    label: 'Mecenáš / Mecenáška',
    amount: 499,
    url: 'https://buy.stripe.com/eVq5kE9Ya3LebIea3F3ks0c',
    note: 'Pro ty, kdo můžou a chtějí táhnout víc.',
  },
];

/** Roční úrovně — 10× měsíční (dva měsíce zdarma). TODO: vytvořit Stripe Payment Links. */
export const YEARLY: Tier[] = [
  { key: 'podporovatel', label: 'Podporovatel / Podporovatelka', amount: 290, url: '', note: 'Základní podpora na celý rok. Nižší poplatky než u měsíční platby.' },
  { key: 'patron', label: 'Patron / Patronka', amount: 1990, url: '', note: 'Jeden oběd měsíčně, zaplacený najednou. Dva měsíce zdarma.' },
  { key: 'mecenas', label: 'Mecenáš / Mecenáška', amount: 4990, url: '', note: 'Roční podpora pro ty, kdo táhnou víc. Dva měsíce zdarma.' },
];

/** Která úroveň je předvybraná / zvýrazněná. */
export const HIGHLIGHT_TIER: Tier['key'] = 'patron';

/** Jednorázový dar — Stripe Payment Link s volitelnou částkou. TODO. */
export const ONE_OFF = {
  suggested: [300, 700, 1500, 3000],
  defaultAmount: 700,
  url: '', // TODO: Stripe Payment Link, „customer chooses amount"
};

/** Zakládající jednorázový dar. TODO. */
export const FOUNDER = {
  amount: 5000,
  url: '', // TODO: Stripe Payment Link 5 000 Kč
};

/** Vlastní (větší / opakovaná) částka — „mecenáš". TODO. */
export const CUSTOM_URL = ''; // TODO

/** Bankovní převod + QR. TODO: doplnit po založení účtu (zatím OSVČ, později transparentní). */
export const BANK = {
  account: '', // TODO: číslo účtu / IBAN
  variableSymbol: '', // TODO (volitelné)
  message: 'DataTimes – podpora',
  qrSvgPath: '', // TODO: /images/klub/qr-platba.svg (SPAYD)
};

/** Časově ohraničená kampaň na Donio (~podzim 2026). TODO. */
export const DONIO_URL = ''; // TODO

/** Herohero — legacy. Necháváme běžet, nepropagujeme. TODO: ověřit URL. */
export const HEROHERO_URL = ''; // TODO

/** Hostovaný Stripe Customer Portal pro správu / zrušení. TODO. */
export const STRIPE_PORTAL_URL = ''; // TODO

/** Newsletter (Ecomail) — existující. */
export const NEWSLETTER_ACTION_URL =
  'https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088';

/** Kontakt pro „adopci města" apod. */
export const CONTACT_EMAIL = 'info@datatimes.cz';

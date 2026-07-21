import styles from './GenreBadge.module.css';

// Žánrová značka: IKONA + neutrální šedý chip. Záměrně nezávislá na barvě
// kapitoly (accent) – žánr rozlišuje ikona + popisek, kapitolu rozlišuje barva
// jinde na stránce. Díky tomu se dva kanály (žánr vs. kapitola) nikdy netlučou.

type IconKey =
  | 'explainer'
  | 'svet'
  | 'evropa'
  | 'analyza'
  | 'investigace'
  | 'komparace'
  | 'aktualizace'
  | 'datastory'
  | 'duvera'
  | 'document';

// Mapování názvu rubriky (pole `topic` v _meta.json) na ikonu.
const TOPIC_ICON: Record<string, IconKey> = {
  Explainer: 'explainer',
  Svět: 'svet',
  Evropa: 'evropa',
  Analýza: 'analyza',
  Investigace: 'investigace',
  Komparace: 'komparace',
  Aktualizace: 'aktualizace',
  'Data story': 'datastory',
  Důvěra: 'duvera',
  Shrnutí: 'document',
  'Souhrn kapitoly': 'document',
};

function Icon({ name }: { name: IconKey }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'explainer':
      return (
        <svg {...common}>
          <path d="M12 6c-2-1.3-4.5-1.3-8 0v12c3.5-1.3 6-1.3 8 0 2-1.3 4.5-1.3 8 0V6c-3.5-1.3-6-1.3-8 0z" />
          <path d="M12 6v12" />
        </svg>
      );
    case 'svet':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" />
        </svg>
      );
    case 'evropa':
      return (
        <svg {...common}>
          <path d="M6 4v16" />
          <path d="M6 5h11l-2 3.5 2 3.5H6" />
        </svg>
      );
    case 'analyza':
      return (
        <svg {...common}>
          <path d="M5 19V11M10 19V6M15 19v-8M20 19V8" />
        </svg>
      );
    case 'investigace':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16l4.5 4.5" />
        </svg>
      );
    case 'komparace':
      return (
        <svg {...common}>
          <path d="M4 8h13l-3-3M20 16H7l3 3" />
        </svg>
      );
    case 'aktualizace':
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 1 0-.7 4" />
          <path d="M20 5v6h-6" />
        </svg>
      );
    case 'datastory':
      return (
        <svg {...common}>
          <path d="M4 18l5-6 4 3 7-8" />
          <circle cx="20" cy="7" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'duvera':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'document':
    default:
      return (
        <svg {...common}>
          <path d="M7 4h7l4 4v12H7z" />
          <path d="M14 4v4h4M9 12h6M9 16h5" />
        </svg>
      );
  }
}

export default function GenreBadge({ topic }: { topic: string }) {
  const icon = TOPIC_ICON[topic.trim()] ?? 'document';
  return (
    <span className={styles.badge}>
      <Icon name={icon} />
      {topic}
    </span>
  );
}

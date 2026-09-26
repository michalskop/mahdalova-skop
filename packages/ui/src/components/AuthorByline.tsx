import classes from './AuthorByline.module.css';

// Sdílená byline do karet i hero bloku: avatar(y) autora + jméno.
// Foto známých členů týmu, jinak iniciály v kroužku. U dvojice autorů se
// jméno zkrátí na příjmení („Mahdalová & Škop“), aby se vešlo na jeden řádek
// i v úzké kartě (celé jméno je v tooltipu). Fotky jsou v /public/authors.
const AUTHOR_PHOTOS: Record<string, string> = {
  'Kateřina Mahdalová': '/authors/katerina-mahdalova.webp',
  'Michal Škop': '/authors/michal-skop.webp',
};

function splitNames(author?: string): string[] {
  return (author || '')
    .split(/\s*&\s*|,\s*|\s+a\s+|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function surname(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || name;
}

interface AuthorBylineProps {
  author?: string;
  /** Velikost avataru v px (default 24). Hero lead může chtít větší. */
  size?: number;
  /** Když true, ukáže celé jméno i u více autorů (pro široké kontexty). */
  full?: boolean;
}

export function AuthorByline({ author, size = 24, full = false }: AuthorBylineProps) {
  const names = splitNames(author);
  if (names.length === 0) return null;

  const label = !full && names.length > 1 ? names.map(surname).join(' & ') : author;

  return (
    <span className={classes.byline} title={author}>
      <span className={classes.avatars}>
        {names.map((name) => {
          const photo = AUTHOR_PHOTOS[name];
          return photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={name} src={photo} alt={name} width={size} height={size} />
          ) : (
            <span
              key={name}
              className={classes.initials}
              style={{ width: size, height: size }}
              aria-hidden="true"
            >
              {initials(name)}
            </span>
          );
        })}
      </span>
      <span className={full ? `${classes.name} ${classes.nameFull}` : classes.name}>{label}</span>
    </span>
  );
}

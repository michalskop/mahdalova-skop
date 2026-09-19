// components/common/AuthorProfileCard.tsx
// Hlavička stránky autora/autorky: fotka + jméno + (volitelně) mini bio +
// prolinky na sociální sítě ve stejném stylu jako sdílení u článků.
import type { ReactNode } from 'react';
import {
  IconMail,
  IconBrandBluesky,
  IconBrandThreads,
  IconBrandX,
} from '@tabler/icons-react';
import { getAuthorProfile } from '@/lib/authorsProfile';
import styles from './AuthorProfileCard.module.css';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface AuthorProfileCardProps {
  name: string;
}

export default function AuthorProfileCard({ name }: AuthorProfileCardProps) {
  const profile = getAuthorProfile(name);

  const socials: { label: string; href: string; icon: ReactNode }[] = [];
  const s = profile?.social;
  if (s?.bluesky) {
    socials.push({ label: 'Bluesky', href: `https://${s.bluesky}`, icon: <IconBrandBluesky size={19} stroke={1.8} /> });
  }
  if (s?.threads) {
    const handle = s.threads.startsWith('@') ? s.threads : `@${s.threads}`;
    socials.push({ label: 'Threads', href: `https://www.threads.net/${handle}`, icon: <IconBrandThreads size={19} stroke={1.8} /> });
  }
  if (s?.twitter) {
    socials.push({ label: 'X', href: `https://twitter.com/${s.twitter.replace(/^@/, '')}`, icon: <IconBrandX size={19} stroke={1.8} /> });
  }
  if (profile?.email) {
    socials.push({ label: 'E-mail', href: `mailto:${profile.email}`, icon: <IconMail size={19} stroke={1.8} /> });
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {profile?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photo} alt={name} />
        ) : (
          <span aria-hidden="true">{initials(name)}</span>
        )}
      </div>

      <div className={styles.body}>
        <h1 className={styles.name}>{name}</h1>
        {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
        {socials.length > 0 && (
          <div className={styles.social} aria-label="Sociální sítě">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

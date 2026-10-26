'use client';

import { useEffect, useState } from 'react';
import { BsFillPostageHeartFill } from 'react-icons/bs';
import classes from './NewsletterSlideIn.module.css';

const STORAGE_KEY = 'dt-newsletter-slidein';
const HIDE_AFTER_CLOSE_DAYS = 30;
const HIDE_AFTER_SUBMIT_DAYS = 365;
/** Podíl stránky, po jehož přečtení se obálka vysune. */
const SCROLL_TRIGGER = 0.5;

function hiddenUntil(): number {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function hideFor(days: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now() + days * 864e5));
  } catch {
    // Bez úložiště se obálka jen znovu ukáže při dalším článku.
  }
}

/**
 * Vysouvací newsletter v článku: malá obálka v pravém dolním rohu (na mobilu
 * pruh dole), vysune se po přečtení zhruba poloviny stránky. Schová se, když
 * je na obrazovce velký box SubscribeNewsletter pod článkem. Po zavření se
 * 30 dní neukáže, po přihlášení rok. `?newsletter=demo` ji ukáže hned.
 */
export default function NewsletterSlideIn({ actionUrl }: { actionUrl: string }) {
  const [eligible, setEligible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [boxVisible, setBoxVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get('newsletter') === 'demo';
    if (!demo && hiddenUntil() > Date.now()) return;
    setEligible(true);
    if (demo) setScrolled(true);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_TRIGGER) setScrolled(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Velký box pod článkem – když je vidět, obálka se zasune (žádné dvojí).
    const box = document.querySelector('input.dt-newsletter-input')?.closest('form');
    let io: IntersectionObserver | undefined;
    if (box) {
      io = new IntersectionObserver(([entry]) => setBoxVisible(entry.isIntersecting));
      io.observe(box);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  if (!eligible) return null;
  const open = scrolled && !boxVisible && !dismissed;

  return (
    <aside
      className={`${classes.root} ${open ? classes.open : ''}`}
      aria-label="Newsletter"
      aria-hidden={!open}
    >
      <BsFillPostageHeartFill className={classes.stamp} size={26} aria-hidden="true" />
      <button
        type="button"
        className={classes.close}
        aria-label="Zavřít"
        tabIndex={open ? 0 : -1}
        onClick={() => {
          hideFor(HIDE_AFTER_CLOSE_DAYS);
          setDismissed(true);
        }}
      >
        ×
      </button>
      <p className={classes.title}>Líbí se vám, jak pracujeme s daty?</p>
      <p className={classes.text}>To hlavní z našich článků přímo do vašeho emailu.</p>
      <form
        method="post"
        action={actionUrl}
        target="_blank"
        className={classes.row}
        onSubmit={() => {
          hideFor(HIDE_AFTER_SUBMIT_DAYS);
          setTimeout(() => setDismissed(true), 600);
        }}
      >
        <input
          className={classes.input}
          type="email"
          name="email"
          required
          placeholder="vas.email@example.com"
          aria-label="Váš email"
          tabIndex={open ? 0 : -1}
        />
        <button type="submit" className={classes.button} tabIndex={open ? 0 : -1}>
          Odebírat
        </button>
      </form>
    </aside>
  );
}

import NewsletterStripe from '@/components/about/NewsletterStripe';
import styles from './ClosingNote.module.css';
import RouteEndLogo from './RouteEndLogo';

/** Closing note of /about: serif text followed by the newsletter stripe. */
export default function ClosingNote() {
  return (
    <section className={styles.section}>
      <div className={styles.text}>
        <RouteEndLogo />
        <p>
          Important, truthful and undistorted information exists, but it often never reaches the
          public space, or it gets lost there unnoticed under layers of trivia and nonsense.
        </p>
        <p className={styles.highlight}>
          We bring it to light. And straight to you, if you like.
        </p>
      </div>

      <div id="newsletter" className={styles.newsletter}>
        <NewsletterStripe />
      </div>
    </section>
  );
}

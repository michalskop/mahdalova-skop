import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import styles from './ClosingNote.module.css';
import RouteEndLogo from './RouteEndLogo';

const NEWSLETTER_URL = 'https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088';

/** Closing note of /o-nas: serif text followed by the newsletter stripe. */
export default function ClosingNote() {
  return (
    <section className={styles.section}>
      <div className={styles.text}>
        <RouteEndLogo />
        <p>
          Důležité, pravdivé a{' '}nezkreslené informace existují, do veřejného prostoru se ale
          často nedostanou nebo se v{' '}něm ztrácejí bez povšimnutí pod nánosy banalit
          a{' '}nesmyslů.
        </p>
        <p className={styles.highlight}>
          My je dostáváme na světlo. A{' '}přímo k{' '}vám, chcete-li.
        </p>
      </div>

      <div className={styles.newsletter}>
        <SubscribeNewsletter actionUrl={NEWSLETTER_URL} />
      </div>
    </section>
  );
}

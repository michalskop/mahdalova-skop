import preferredSourceStyles from './PreferredSource.module.css';

export default function PreferredSource() {
  return (
<div data-pagefind-ignore className={preferredSourceStyles.wrapper}>
            <a
              className={preferredSourceStyles.button}
              href="https://www.google.com/preferences/source?q=mahdalova-skop.cz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z" />
              </svg>
              <span>Přidejte si <span className={preferredSourceStyles.brand}><img src="/images/datatimes-logo.png" width="24" height="24" alt="" style={{ display: 'block', flexShrink: 0 }} /><span>DataTimes.cz</span></span> jako oblíbený zdroj</span>
            </a>
          </div>
  );
}

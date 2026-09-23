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
              <span className={preferredSourceStyles.nowrap}>
                <svg className={preferredSourceStyles.star} viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z" />
                </svg>
                Chci víc
              </span>{' '}
              <span className={preferredSourceStyles.nowrap}>
                <img className={preferredSourceStyles.logo} src="/images/datatimes-logo.png" width="18" height="18" alt="" />
                DataTimes.cz
              </span>{' '}
              ve zprávách Googlu
            </a>
          </div>
  );
}

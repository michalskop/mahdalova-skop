// components/MatomoAnalytics.tsx
'use client';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    _paq?: any[];
  }
}

export function MatomoAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views on route changes
    if (window._paq) {
      window._paq.push(['setCustomUrl', pathname]);
      window._paq.push(['trackPageView']);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="matomo-analytics"
        strategy="afterInteractive"
      >
        {`
          var _paq = window._paq = window._paq || [];
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u="//matomo.kohovolit.eu/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '4']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}
      </Script>
    </>
  );
}
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

declare global {
  interface Window {
    _paq: any[];
    __matomoInitialized?: boolean;
  }
}

interface MatomoTrackerProps {
  siteId: string;
}

function MatomoTracker({ siteId }: MatomoTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window._paq = window._paq || [];
    if (!window.__matomoInitialized) {
      window.__matomoInitialized = true;
      window._paq.push(['enableLinkTracking']);

      const u = "//matomo.kohovolit.eu/";
      window._paq.push(['setTrackerUrl', u + 'matomo.php']);
      window._paq.push(['setSiteId', siteId]);

      if (!document.getElementById('matomo-script')) {
        const d = document;
        const g = d.createElement('script');
        g.id = 'matomo-script';
        g.async = true;
        g.src = u + 'matomo.js';
        const s = d.getElementsByTagName('script')[0];
        if (s?.parentNode) {
          s.parentNode.insertBefore(g, s);
        } else {
          d.head?.appendChild(g);
        }
      }
    }
  }, [siteId]);

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    window._paq.push(['setCustomUrl', fullPath]);
    window._paq.push(['setDocumentTitle', document.title]);
    window._paq.push(['trackPageView']);
  }, [pathname, searchParams]);

  return null;
}

interface MatomoAnalyticsProps {
  siteId: string;
}

export function MatomoAnalytics({ siteId }: MatomoAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <MatomoTracker siteId={siteId} />
    </Suspense>
  );
}

// Průběžné načítání statického JSON (online reportáže, volební odhady).
// Bez cache-busting parametru: soubor jde přes CDN a prohlížeč ho jen revaliduje (ETag → 304),
// takže i velká návštěvnost znamená pár bajtů na požadavek. Na skryté kartě se nepolluje.
export function pollJson(url: string, onData: (d: unknown) => void, intervalMs = 60_000): () => void {
  let alive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last = '';

  const load = async () => {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) return;
      const text = await r.text();
      if (alive && text !== last) {
        last = text;
        onData(JSON.parse(text));
      }
    } catch {
      // výpadek sítě – zkusí se znovu v dalším kole
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (document.visibilityState === 'visible') await load();
      if (alive) schedule();
    }, intervalMs);
  };

  const onVisible = () => { if (document.visibilityState === 'visible') load(); };

  load().then(() => { if (alive) schedule(); });
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    alive = false;
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

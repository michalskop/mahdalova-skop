// Navigace mezi kapitolami speciálu „Jací jsme byli, jací jsme“ (nahoře lišta kapitol, dole předchozí / další).
import Link from 'next/link';
import type { Kapitola } from '@/lib/jaciJsme';
import { JACI_JSME, JACI_JSME_PATH } from '@/lib/jaciJsme';
import s from './jaciJsme.module.css';

export function KapitolyNav({ kapitoly, aktivni, dole = false }: { kapitoly: Kapitola[]; aktivni: string; dole?: boolean }) {
  const i = kapitoly.findIndex((k) => k.kapitola === aktivni);
  if (dole) {
    const pred = kapitoly[i - 1];
    const dalsi = kapitoly[i + 1];
    return (
      <nav className={s.prevNext} aria-label="Další kapitoly speciálu">
        {pred ? (
          <Link href={`${JACI_JSME_PATH}/${pred.kapitola}`} className={s.pnLink}>
            <span className={s.pnLabel}>← předchozí kapitola</span>
            <span className={s.pnTitle}>{pred.nazev}</span>
          </Link>
        ) : <span />}
        <Link href={JACI_JSME_PATH} className={s.pnHome}>Všechny kapitoly</Link>
        {dalsi ? (
          <Link href={`${JACI_JSME_PATH}/${dalsi.kapitola}`} className={`${s.pnLink} ${s.pnRight}`}>
            <span className={s.pnLabel}>další kapitola →</span>
            <span className={s.pnTitle}>{dalsi.nazev}</span>
          </Link>
        ) : <span />}
      </nav>
    );
  }
  return (
    <nav className={s.bar} aria-label="Kapitoly speciálu">
      <div className={s.barInner}>
        <Link href={JACI_JSME_PATH} className={s.barBrand}>
          <span className={s.flag} aria-hidden />
          {JACI_JSME.nazev} <span className={s.barYears}>{JACI_JSME.podtitul}</span>
        </Link>
        <ol className={s.barList}>
          {kapitoly.map((k) => (
            <li key={k.kapitola}>
              <Link href={`${JACI_JSME_PATH}/${k.kapitola}`} className={k.kapitola === aktivni ? s.barActive : s.barItem}
                aria-current={k.kapitola === aktivni ? 'page' : undefined}>
                {k.nazev}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

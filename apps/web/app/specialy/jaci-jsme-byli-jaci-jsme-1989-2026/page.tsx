// Rozcestník speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (k 37. výročí 17. listopadu).
// Kapitoly a jejich zdrojové články: kapitoly.json. Karta bere titulek, perex a cover z frontmatteru článku.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import type { Metadata } from 'next';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { JACI_JSME, JACI_JSME_OG, JACI_JSME_PATH, hotoveKapitoly } from '@/lib/jaciJsme';
import CislaKarty, { type CisloKarta } from '@/components/specialy/jaciJsme/CislaKarty';
import kartyData from './_data/karty.json';
import s from './jaciJsme.module.css';

// „37 let v 37 číslech“: karty generuje _data/karty.py z výstupů skriptů kapitol.
// Na rozcestníku jen karty kapitol, které už existují (odkaz nesmí vést na 404).
const KARTY = kartyData.karty as unknown as CisloKarta[];

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const TITLE = `${JACI_JSME.nazev} – ${JACI_JSME.podtitul}`;
const DESCRIPTION =
  'Speciál DataTimes k 37. výročí 17. listopadu: jak se za 37 let změnily rodiny, zdraví, vzdělání, peníze, bydlení, doprava, vzduch, bezpečí i svoboda. Rok 1989 a dnešek v datech.';
const ARTICLES_DIR = path.join(process.cwd(), 'app/clanek/_articles');

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: JACI_JSME_PATH },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: `${BASE_URL}${JACI_JSME_PATH}`, type: 'website',
    images: [{ url: JACI_JSME_OG, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [JACI_JSME_OG] },
};

function karta(zdroj: string) {
  const f = path.join(ARTICLES_DIR, zdroj, 'index.md');
  if (!fs.existsSync(f)) return null;
  const { data } = matter(fs.readFileSync(f, 'utf8'));
  return {
    title: String(data.title || ''),
    excerpt: String(data.excerpt || ''),
    image: (data.ogImage || data.coverImage) as string | undefined,
  };
}

export default function JaciJsmePage() {
  const hotove = new Set(hotoveKapitoly().map((k) => k.kapitola));
  return (
    <div style={{ background: '#f8f6f0' }}>
      <header className={s.hero}>
        <div className={s.heroInner}>
          <div>
            <p className={s.eyebrow}><span className={s.flag} aria-hidden />Speciál k 17. listopadu</p>
            <h1 className={s.heroTitle}>{JACI_JSME.nazev}</h1>
            <p className={s.heroLead}>
              Od sametové revoluce uplynulo 37 let. Porovnali jsme rok 1989 s dneškem v datech ČSÚ, sčítání lidu,
              volební statistiky a dalších zdrojů: jak dlouho žijeme, kdy se bereme a máme děti, co si koupíme
              za výplatu, kde a jak bydlíme, čím jezdíme, co dýcháme a jak svobodně se cítíme.
            </p>
          </div>
          <div className={s.years} aria-label="1989 a 2026">
            <span className={s.y1989}>1989</span>
            <span className={s.yTimes}>×</span>
            <span className={s.y2026}>2026</span>
          </div>
        </div>
        <div className={s.stripe} aria-hidden />
      </header>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Kapitoly</h2>
        <div className={s.grid}>
          {JACI_JSME.kapitoly.map((k, i) => {
            const c = karta(k.zdroj);
            const href = `${JACI_JSME_PATH}/${k.kapitola}`;
            const obsah = (
              <>
                {c?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={s.cardImg} src={c.image} alt="" loading="lazy" />
                ) : (
                  <div className={s.cardPlaceholder}>{k.nazev}</div>
                )}
                <div className={s.cardBody}>
                  <span className={s.cardNum}>{i === 0 ? 'Úvod' : `Kapitola ${i}`} · {k.nazev}</span>
                  <h3 className={s.cardTitle}>{c ? c.title : 'Připravujeme'}</h3>
                  {c?.excerpt && <p className={s.cardExcerpt}>{c.excerpt}</p>}
                </div>
              </>
            );
            return c ? (
              <Link key={k.kapitola} href={href} className={s.card}>{obsah}</Link>
            ) : (
              <div key={k.kapitola} className={`${s.card} ${s.cardSoon}`} aria-disabled>{obsah}</div>
            );
          })}
        </div>
      </section>

      <section className={s.section} id="37-cisel" aria-labelledby="37-cisel-nadpis">
        <h2 id="37-cisel-nadpis" className={s.sectionTitle}>37 let v 37 číslech</h2>
        <p className={s.sectionLead}>
          Co se v Česku změnilo od sametové revoluce, v číslech z kapitol speciálu. Každá karta má vlastní
          odkaz, takže ji můžete poslat dál samostatně.
        </p>
        <CislaKarty karty={KARTY.filter((k) => hotove.has(k.kapitola))} />
      </section>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </div>
  );
}

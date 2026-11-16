'use client';

// „37 let v 37 číslech“ – očíslované karty tehdy × dnes na rozcestníku speciálu
// „Jací jsme byli, jací jsme – 1989 × 2026“. Každá karta má kotvu #cislo-N a tlačítko
// „Kopírovat odkaz“, aby šla sdílet samostatně. Nahoře filtr podle kapitol.
// Data: app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/karty.json (generuje karty.py
// z výstupů skriptů kapitol – čísla v JSON ručně neupravovat).

import { useState } from 'react';
import Link from 'next/link';
import { typo } from './spolecne';
import s from './CislaKarty.module.css';

export type CisloKarta = {
  cislo: number;
  kapitola: string;
  kapitola_nazev: string;
  href: string;
  nadpis: string;
  tehdy: { rok: number | string; text: string };
  dnes: { rok: number | string; text: string };
  znak: string;
  popis: string;
  kontext: string;
  zdroj: string;
};

const NBSP = ' ';
const desetin = (t: string) => (t.includes(',') ? t.length - t.indexOf(',') - 1 : 0);

/** Hodnota zarovnaná doprava tak, aby desetinné čárky stály pod sebou: kratší desetinnou část
 *  dorovná neviditelnými nulami (u „13“ proti „33,5“ skrytá „,0“). */
function Hodnota({ text, znak, desetinMax }: { text: string; znak: string; desetinMax: number }) {
  const chybi = desetinMax - desetin(text);
  const vypln = chybi > 0 ? `${text.includes(',') ? '' : ','}${'0'.repeat(chybi)}` : '';
  return (
    <>
      {text}
      {vypln && <span className={s.vypln} aria-hidden>{vypln}</span>}
      {znak && `${NBSP}${znak}`}
    </>
  );
}

/** Zkopíruje text do schránky; když Clipboard API chybí (http, starší prohlížeč), použije skryté textarea. */
async function kopiruj(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* spadne na záložní cestu */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function Karta({ k }: { k: CisloKarta }) {
  const [stav, setStav] = useState<'' | 'ok' | 'chyba'>('');
  const [url, setUrl] = useState('');
  const kotva = `cislo-${k.cislo}`;
  const desetinMax = Math.max(desetin(k.tehdy.text), desetin(k.dnes.text));

  const onKopiruj = async () => {
    const u = `${window.location.origin}${window.location.pathname}#${kotva}`;
    setUrl(u);
    const ok = await kopiruj(u);
    // když prohlížeč schránku nepustí, ukáže se odkaz v poli k ručnímu zkopírování
    setStav(ok ? 'ok' : 'chyba');
    if (ok) window.setTimeout(() => setStav(''), 2200);
  };

  return (
    <article id={kotva} className={s.karta} aria-labelledby={`${kotva}-nadpis`}>
      <div className={s.hlava}>
        <a href={`#${kotva}`} className={s.poradi} aria-label={`Číslo ${k.cislo} z 37`}>
          {k.cislo}
        </a>
        <Link href={k.href} className={s.stitek}>{k.kapitola_nazev}</Link>
      </div>

      <h3 id={`${kotva}-nadpis`} className={s.nadpis}>{typo(k.nadpis)}</h3>

      <dl className={s.cisla}>
        <div className={s.radek}>
          <dt className={s.rokTehdy}>{k.tehdy.rok}</dt>
          <dd className={s.hodnotaTehdy}><Hodnota text={k.tehdy.text} znak={k.znak} desetinMax={desetinMax} /></dd>
        </div>
        <div className={s.radek}>
          <dt className={s.rokDnes}>{k.dnes.rok}</dt>
          <dd className={s.hodnotaDnes}><Hodnota text={k.dnes.text} znak={k.znak} desetinMax={desetinMax} /></dd>
        </div>
      </dl>
      <p className={s.popis}>{typo(k.popis)}</p>

      <p className={s.kontext}>{typo(k.kontext)}</p>

      <div className={s.pata}>
        <span className={s.zdroj}>
          Zdroj: {k.zdroj} · <Link href={k.href} className={s.odkaz}>{typo(`kapitola ${k.kapitola_nazev}`)}{NBSP}→</Link>
        </span>
        <button type="button" className={s.kopiruj} onClick={onKopiruj} aria-live="polite">
          {stav === 'ok' ? 'Odkaz zkopírován' : 'Kopírovat odkaz'}
        </button>
      </div>
      {stav === 'chyba' && (
        <label className={s.rucne}>
          Zkopírujte odkaz ručně:
          <input
            type="text"
            readOnly
            value={url}
            className={s.rucnePole}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
    </article>
  );
}

export default function CislaKarty({ karty }: { karty: CisloKarta[] }) {
  const [filtr, setFiltr] = useState<string>('');
  const kapitoly = karty
    .map((k) => ({ kapitola: k.kapitola, nazev: k.kapitola_nazev }))
    .filter((k, i, a) => a.findIndex((x) => x.kapitola === k.kapitola) === i);
  const vidim = filtr ? karty.filter((k) => k.kapitola === filtr) : karty;

  return (
    <>
      <div className={s.filtr} role="group" aria-label="Filtrovat čísla podle kapitoly">
        <button type="button" className={s.chip} aria-pressed={filtr === ''} onClick={() => setFiltr('')}>
          Všech {karty.length}
        </button>
        {kapitoly.map((k) => (
          <button
            key={k.kapitola}
            type="button"
            className={s.chip}
            aria-pressed={filtr === k.kapitola}
            onClick={() => setFiltr(k.kapitola)}
          >
            {k.nazev}
          </button>
        ))}
      </div>
      <div className={s.mrizka}>
        {vidim.map((k) => (
          <Karta key={k.cislo} k={k} />
        ))}
      </div>
    </>
  );
}

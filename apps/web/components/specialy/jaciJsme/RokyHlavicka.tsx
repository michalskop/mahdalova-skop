'use client';

// Letopočty v hlavičce speciálu „Jací jsme byli, jací jsme – 1989 × 2026“: rok se nalistuje od 1989 do 2026.
// Tři návrhy ke schválení (Kateřina 17. 11. 2026: „chytře estetické“, místo křížku „×“ počítadlo let):
//   a = listovací kalendář (překlápěcí destičky jako na nádraží, mění se jen číslice, které se mění),
//   b = časová osa (pravítko s ryskou za každý rok, karmínová linka doběhne k 2026),
//   c = odometr (číslice se plynule odvalí jako na počítadle kilometrů).
// Náhled varianty: ?hlavicka=a|b|c. Server a čtečky obrazovky dostanou rovnou 2026;
// při prefers-reduced-motion se nic nehýbe.

import { useEffect, useState } from 'react';
import s from './RokyHlavicka.module.css';

const OD = 1989;
const DO = 2026;
const TRVANI = 2800; // ms
const PRODLEVA = 400; // ms – ať čtenář zachytí výchozí 1989
const ROKY = Array.from({ length: DO - OD + 1 }, (_, i) => OD + i);
// rozjede se a ke konci zpomalí, aby poslední roky šly přečíst
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Varianta = 'a' | 'b' | 'c';

/** Rok, který právě „běží“: 2026 na serveru, po načtení 1989 → 2026. */
function useRok(): [number, boolean] {
  const [rok, setRok] = useState(DO);
  const [bezi, setBezi] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let start = 0;
    setRok(OD);
    setBezi(true);
    const krok = (cas: number) => {
      if (!start) start = cas;
      const t = Math.min(1, (cas - start) / TRVANI);
      setRok(OD + Math.round((DO - OD) * ease(t)));
      if (t < 1) raf = requestAnimationFrame(krok);
      else setBezi(false);
    };
    const timer = window.setTimeout(() => { raf = requestAnimationFrame(krok); }, PRODLEVA);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);
  return [rok, bezi];
}

/** a) Listovací kalendář: každá číslice je destička, při změně se překlopí. */
function Kalendar() {
  const [rok] = useRok();
  return (
    <div className={s.kalendar} aria-hidden>
      <div className={s.kalRadek}>
        {String(OD).split('').map((d, i) => <span key={i} className={`${s.destTehdy}`}>{d}</span>)}
      </div>
      <div className={s.kalRadek}>
        {String(rok).split('').map((d, i) => (
          <span key={i} className={s.destDnes}>
            {/* key = číslice: při změně React prvek vymění a animace překlopení se spustí znovu */}
            <span key={d} className={s.klop}>{d}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** b) Časová osa: pravítko 1989–2026, ryska za každý rok, desetiletí delší. */
function Osa() {
  const [rok] = useRok();
  const podil = (rok - OD) / (DO - OD);
  return (
    <div className={s.osa} aria-hidden>
      <div className={s.osaRoky}>
        <span className={s.osaTehdy}>1989</span>
        <span className={s.osaDnes}>{rok}</span>
      </div>
      <div className={s.pravitko}>
        <div className={s.linka} style={{ transform: `scaleX(${podil})` }} />
        {ROKY.map((r) => (
          <span
            key={r}
            className={`${s.ryska} ${r % 10 === 0 || r === OD || r === DO ? s.ryskaDlouha : ''} ${r <= rok ? s.ryskaZa : ''}`}
          />
        ))}
        <span className={s.bod} style={{ left: `${podil * 100}%` }} />
      </div>
      <div className={s.osaPopisky}>
        {[1989, 2000, 2010, 2020, 2026].map((r) => (
          <span key={r} style={{ left: `${((r - OD) / (DO - OD)) * 100}%` }}>{r}</span>
        ))}
      </div>
    </div>
  );
}

/** c) Odometr: každý řád je váleček s číslicemi, který se plynule odvalí z 1989 na 2026. */
function Odometr() {
  const [cil, setCil] = useState(DO);
  const [jede, setJede] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setCil(OD);
    const t = window.setTimeout(() => { setJede(true); setCil(DO); }, PRODLEVA);
    return () => window.clearTimeout(t);
  }, []);
  // řád k (tisíce … jednotky): váleček nese číslice od floor(OD/10^k) do floor(DO/10^k), poloha = floor(cil/10^k)
  const rady = [1000, 100, 10, 1].map((m) => {
    const z = Math.floor(OD / m), k = Math.floor(DO / m);
    const cifry = Array.from({ length: k - z + 1 }, (_, i) => (z + i) % 10);
    return { m, z, cifry };
  });
  return (
    <div className={s.odometr} aria-hidden>
      <div className={s.odoTehdy}>1989</div>
      <div className={s.odoDnes}><div className={s.okno}>
        {rady.map(({ m, z, cifry }) => (
          <span key={m} className={s.valecek}>
            <span
              className={s.pas}
              style={{
                transform: `translateY(${-(Math.floor(cil / m) - z)}em)`,
                transition: jede ? `transform ${TRVANI}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none',
              }}
            >
              {cifry.map((c, i) => <span key={i}>{c}</span>)}
            </span>
          </span>
        ))}
      </div></div>
    </div>
  );
}

export default function RokyHlavicka({ varianta = 'a' }: { varianta?: Varianta }) {
  const [v, setV] = useState<Varianta>(varianta);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('hlavicka');
    if (q === 'a' || q === 'b' || q === 'c') setV(q);
  }, []);
  return (
    <div className={s.obal} role="img" aria-label="1989 a 2026">
      {v === 'a' ? <Kalendar key="a" /> : v === 'b' ? <Osa key="b" /> : <Odometr key="c" />}
    </div>
  );
}

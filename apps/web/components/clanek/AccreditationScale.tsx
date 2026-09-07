'use client';
import { useEffect, useId, useState } from 'react';
import styles from './AccreditationScale.module.css';
type Item = { name: string; detail: string; mode?: 'automaticky' | 'na vyžádání' };
const answered: Item[] = [
  { name: 'Ministerstvo dopravy', detail: 'Akreditace není podmínkou vstupu; bez ní běžně neodmítá.', mode: 'na vyžádání' }, { name: 'Ministerstvo financí', detail: 'V letech 2024–2026 neodmítlo nikoho.', mode: 'na vyžádání' }, { name: 'Ministerstvo práce a sociálních věcí', detail: 'Od roku 2024 nezná případ neudělení.', mode: 'na vyžádání' }, { name: 'Ministerstvo pro místní rozvoj', detail: 'Akreditaci vyžaduje před každou akcí; při převisu rozhoduje pořadí žádostí.', mode: 'na vyžádání' }, { name: 'Ministerstvo spravedlnosti', detail: 'Ojediněle ji neudělí z kapacitních či tematických důvodů. Obsah média důvodem není.', mode: 'na vyžádání' }, { name: 'Ministerstvo školství', detail: 'Za posledních 15 let nezná případ, kdy by akreditovaného novináře nepustilo.', mode: 'na vyžádání' }, { name: 'Ministerstvo zdravotnictví', detail: 'Účast bez akreditace řeší na místě podle podmínek akce.', mode: 'na vyžádání' }, { name: 'Ministerstvo zemědělství', detail: 'Akreditaci uděluje automaticky všem novinářům, kteří o ni požádají.', mode: 'automaticky' },
];
const outlier: Item = { name: 'Ministerstvo zahraničí', detail: 'Odmítlo akreditovanou novinářku Deníku N Zdislavu Pokornou (31. 7. 2026) a její redakci označilo za „alternativní média a konspirační blogy“.', mode: 'na vyžádání' };
const noAnswer: Item[] = [
  { name: 'Ministerstvo obrany', detail: 'Na žádost do uzávěrky neodpovědělo.' }, { name: 'Ministerstvo vnitra', detail: 'Na žádost do uzávěrky neodpovědělo.' }, { name: 'Ministerstvo průmyslu a obchodu', detail: 'Žádost pouze zaevidovalo.' }, { name: 'Ministerstvo kultury', detail: 'Body žádosti formálně odmítlo.' }, { name: 'Ministerstvo životního prostředí', detail: 'Lhůtu prodloužilo, odpověď zatím nedodalo.' }, { name: 'Úřad vlády', detail: 'Lhůtu prodloužil, odpověď zatím nedodal.' },
];
const groups = [{ key: 'answered', label: 'Bez odmítnutí', symbol: '✓', items: answered }, { key: 'outlier', label: 'Odmítnutí', symbol: '!', items: [outlier] }, { key: 'unknown', label: 'Bez odpovědi', symbol: '?', items: noAnswer }];
const abbreviations = ['MD', 'MF', 'MPSV', 'MMR', 'MS', 'MŠMT', 'MZ', 'MZe', 'MZV', 'MO', 'MV', 'MPO', 'MK', 'MŽP', 'ÚV'];
const offices = groups.flatMap(group => group.items.map(item => ({ ...item, group })));

export function AccreditationScale() {
  const id = useId();
  const [selected, setSelected] = useState<(typeof offices)[number] | null>(null);
  useEffect(() => { if (!selected) return; const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null); document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [selected]);
  return <section className={styles.root} aria-labelledby={`${id}-title`}>
    <div className={styles.eyebrow}>PŘÍSTUP NOVINÁŘŮ NA ÚŘADY · 4. 9. 2026</div>
    <h3 id={`${id}-title`} className={styles.title}>Jak úřady přistupují k akreditacím</h3>
    <p className={styles.intro}>Osm úřadů novináře kvůli obsahu média neodmítá. Ministerstvo zahraničí je výjimka. U šesti úřadů odpověď chybí.</p>
    <div className={styles.overview}>{groups.map(group => <div key={group.key} className={styles.group} data-kind={group.key}>
      <div className={styles.groupHeading}><strong>{group.items.length}</strong><span>{group.label}</span></div>
      <div className={styles.tiles}>{group.items.map(item => { const office = { ...item, group }; const index = offices.findIndex(entry => entry.name === item.name); return <button type="button" key={item.name} className={styles.tile} data-tooltip={`${item.name}${item.mode ? ` · ${item.mode}` : ''}`} aria-label={`${item.name}: ${item.detail}`} onClick={() => setSelected(office)}><span aria-hidden="true" className={styles.symbol}>{group.symbol}</span><span>{abbreviations[index]}</span></button>; })}</div>
    </div>)}</div>
    <div className={styles.legend}><span><i className={styles.dotAutomatic} /> automaticky</span><span><i className={styles.dotRequest} /> na vyžádání</span><span>Najetím zobrazíte úřad, kliknutím detail.</span></div>
    <p className={styles.source}>Zdroj: infožádosti redakce podle zákona č. 106/1999 Sb. a zpravodajské zdroje uvedené v článku. Stav k uzávěrce 4. září 2026.</p>
    {selected && <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}><div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`${id}-modal-title`}><button type="button" className={styles.close} aria-label="Zavřít" onClick={() => setSelected(null)}>×</button><div className={styles.modalSymbol} data-kind={selected.group.key}>{selected.group.symbol}</div><h4 id={`${id}-modal-title`}>{selected.name}</h4>{selected.mode && <div className={styles.mode}>{selected.mode}</div>}<p>{selected.detail}</p><small>{selected.group.key === 'outlier' ? 'Doložený případ · 31. 7. 2026' : 'Souhrn odpovědi na infožádost · stav k uzávěrce článku'}</small></div></div>}
  </section>;
}
export default AccreditationScale;

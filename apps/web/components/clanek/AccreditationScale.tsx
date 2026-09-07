'use client';
import { useId, useState } from 'react';
import styles from './AccreditationScale.module.css';
type Item = { name: string; detail: string };

const answered: Item[] = [
  { name: 'Ministerstvo dopravy', detail: 'akreditace není podmínkou vstupu; kvůli její absenci běžně neodmítá (výjimečně kapacita či bezpečnost).' },
  { name: 'Ministerstvo financí', detail: 'v letech 2024–2026 neodmítlo nikoho; akreditaci popisuje jako organizační proces, ne rozhodování.' },
  { name: 'Ministerstvo práce a sociálních věcí', detail: 'od roku 2024 nezná případ neudělení; nemá formalizovaný seznam důvodů.' },
  { name: 'Ministerstvo pro místní rozvoj', detail: 'akreditaci vyžaduje před každou akcí, ale nezná případ zamítnutí; při převisu rozhoduje pořadí žádostí.' },
  { name: 'Ministerstvo spravedlnosti', detail: 'akreditaci ojediněle neudělí, ale jen z kapacitních či tematických důvodů – charakter ani názor média důvodem není.' },
  { name: 'Ministerstvo školství', detail: 'za posledních 15 let nezná případ, kdy by akreditovaného novináře nepustilo dovnitř.' },
  { name: 'Ministerstvo zdravotnictví', detail: 'účast bez akreditace řeší na místě podle organizačních, kapacitních a bezpečnostních podmínek.' },
  { name: 'Ministerstvo zemědělství', detail: 'akreditaci uděluje automaticky všem novinářům, kteří o ni požádají.' },
];

const outlier: Item = {
  name: 'Ministerstvo zahraničí',
  detail: 'odmítlo akreditovanou novinářku Deníku N Zdislavu Pokornou (31. 7. 2026) a její redakci označilo za „alternativní média a konspirační blogy“.',
};

const noAnswer: Item[] = [
  { name: 'Ministerstvo obrany', detail: 'na žádost do uzávěrky neodpovědělo.' },
  { name: 'Ministerstvo vnitra', detail: 'na žádost do uzávěrky neodpovědělo.' },
  { name: 'Ministerstvo průmyslu a obchodu', detail: 'žádost pouze zaevidovalo, věcně neodpovědělo.' },
  { name: 'Ministerstvo kultury', detail: 'uvedlo, že obecný seznam důvodů nemá, a body žádosti formálně odmítlo.' },
  { name: 'Ministerstvo životního prostředí', detail: 'prodloužilo lhůtu, odpověď zatím nedodalo.' },
  { name: 'Úřad vlády', detail: 'prodloužil lhůtu, odpověď zatím nedodal.' },
];

const groups = [
  { key: 'answered', label: 'Bez odmítání kvůli obsahu', symbol: '✓', items: answered, note: 'Podle odpovědí úřadů; organizační či kapacitní omezení se liší.' },
  { key: 'outlier', label: 'Doložené odmítnutí', symbol: '!', items: [outlier], note: 'MZV nepustilo akreditovanou novinářku Deníku N.' },
  { key: 'unknown', label: 'Bez věcné odpovědi', symbol: '?', items: noAnswer, note: 'Z těchto odpovědí nelze praxi úřadů posoudit.' },
];
const abbreviations = ['MD', 'MF', 'MPSV', 'MMR', 'MS', 'MŠMT', 'MZ', 'MZe', 'MZV', 'MO', 'MV', 'MPO', 'MK', 'MŽP', 'ÚV'];
const offices = groups.flatMap(group => group.items.map(item => ({ ...item, group })));

export function AccreditationScale() {
  const id = useId();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const visible = offices.filter(item => filter === 'all' || item.group.key === filter);
  function selectOffice(name: string) {
    setFilter('all');
    setSelected(name);
    requestAnimationFrame(() => document.getElementById(`${id}-${offices.findIndex(item => item.name === name)}`)?.focus());
  }
  return (
    <section className={styles.root} aria-labelledby={`${id}-title`}>
      <div className={styles.eyebrow}>PŘÍSTUP NOVINÁŘŮ NA ÚŘADY · 4. 9. 2026</div>
      <h3 id={`${id}-title`} className={styles.title}>Jak se úřady staví k akreditacím</h3>
      <p className={styles.intro}>14 ministerstev a Úřad vlády. Osm úřadů popisuje přístup bez odmítání kvůli obsahu média, u MZV je doložen opačný případ. U šesti úřadů chybí věcná odpověď.</p>
      <div className={styles.overview}>
        {groups.map(group => <div key={group.key} className={styles.group} data-kind={group.key}>
          <div className={styles.groupHeading}><strong>{group.items.length}</strong><span>{group.label}</span></div>
          <div className={styles.tiles}>
            {group.items.map(item => <button type="button" key={item.name} className={styles.tile} aria-label={`${item.name}: ${group.label}. Zobrazit podrobnosti`} onClick={() => selectOffice(item.name)}>
              <span aria-hidden="true" className={styles.symbol}>{group.symbol}</span>
              <span>{abbreviations[offices.findIndex(office => office.name === item.name)]}</span>
            </button>)}
          </div>
          <p className={styles.groupNote}>{group.note}</p>
        </div>)}
      </div>
      <p className={styles.hint}>1 políčko = 1 úřad. Vyberte políčko nebo rozbalte řádek níže.</p>
      <div className={styles.filters} role="group" aria-label="Filtrovat úřady">
        {[{ key: 'all', label: 'Všechny úřady', items: offices }, ...groups].map(group => <button type="button" key={group.key} aria-pressed={filter === group.key} onClick={() => setFilter(group.key)}>{group.label} <span>{group.items.length}</span></button>)}
      </div>
      <p className={styles.result} role="status">Zobrazeno {visible.length} z {offices.length} úřadů</p>
      <div className={styles.list}>
        {visible.map(item => <details key={item.name} className={styles.office} data-kind={item.group.key} open={selected === item.name}>
          <summary id={`${id}-${offices.indexOf(item)}`} onClick={event => { event.preventDefault(); setSelected(selected === item.name ? null : item.name); }}>
            <span className={styles.rowSymbol} aria-hidden="true">{item.group.symbol}</span><strong>{item.name}</strong><span className={styles.status}>{item.group.label}</span><span className={styles.expand} aria-hidden="true">+</span>
          </summary>
          <div className={styles.detail}><p>{item.detail.charAt(0).toUpperCase() + item.detail.slice(1)}</p><span>{item.group.key === 'outlier' ? 'Doložený případ · 31. 7. 2026 · zpravodajské zdroje odkazované v článku' : 'Zdroj: redakční souhrn odpovědi na infožádost · stav k uzávěrce článku'}</span></div>
        </details>)}
      </div>
      <p className={styles.source}>Zdroj: infožádosti redakce podle zákona č. 106/1999 Sb. a zpravodajské zdroje uvedené v článku. Stav k uzávěrce 4. září 2026. Jde o souhrn doložených odpovědí a případu MZV, nikoli o nezávislý audit praxe. Chybějící odpověď neznamená odmítání novinářů.</p>
    </section>
  );
}
export default AccreditationScale;

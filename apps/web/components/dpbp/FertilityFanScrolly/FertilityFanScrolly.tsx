'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import ChartSignature from '../ChartSignature';
import rawData from './data.json';
import styles from './FertilityFanScrolly.module.css';

type WindowRow = {
  window: 5 | 10;
  country: string;
  iso: string;
  startYear: number;
  endYear: number;
  start: number;
  end: number;
  change: number;
};

const data = rawData as WindowRow[];
const TARGET_CHANGE = 0.82;
const COUNTRY_LABELS: Record<string, string> = {
  ARE: 'Spojené arabské emiráty',
  AUS: 'Austrálie',
  AUT: 'Rakousko',
  BEL: 'Belgie',
  BGR: 'Bulharsko',
  BHR: 'Bahrajn',
  CAN: 'Kanada',
  CHE: 'Švýcarsko',
  CHL: 'Chile',
  CRI: 'Kostarika',
  CYP: 'Kypr',
  CZE: 'Česko',
  DEU: 'Německo',
  DNK: 'Dánsko',
  ESP: 'Španělsko',
  EST: 'Estonsko',
  FIN: 'Finsko',
  FRA: 'Francie',
  GBR: 'Spojené království',
  GRC: 'Řecko',
  HKG: 'Hongkong',
  HRV: 'Chorvatsko',
  HUN: 'Maďarsko',
  IRL: 'Irsko',
  ISR: 'Izrael',
  ITA: 'Itálie',
  JPN: 'Japonsko',
  KOR: 'Jižní Korea',
  KWT: 'Kuvajt',
  LTU: 'Litva',
  LVA: 'Lotyšsko',
  NLD: 'Nizozemsko',
  NOR: 'Norsko',
  NZL: 'Nový Zéland',
  OMN: 'Omán',
  PAN: 'Panama',
  POL: 'Polsko',
  PRI: 'Portoriko',
  PRT: 'Portugalsko',
  QAT: 'Katar',
  ROU: 'Rumunsko',
  RUS: 'Rusko',
  SAU: 'Saúdská Arábie',
  SGP: 'Singapur',
  SVK: 'Slovensko',
  SVN: 'Slovinsko',
  SWE: 'Švédsko',
  TTO: 'Trinidad a Tobago',
  URY: 'Uruguay',
  USA: 'Spojené státy',
};

const STEPS = [
  {
    window: 5 as const,
    title: 'Pět let',
    text: 'Nejvyšší pětiletý nárůst patří Novému Zélandu v letech 2002–2007: +0,29 dítěte na ženu. Země tehdy zavedla placenou rodičovskou dovolenou a postupně balík Working for Families, který zvýšil podporu rodin. Graf ale neprokazuje, jakou část růstu tato opatření způsobila.',
  },
  {
    window: 10 as const,
    title: 'Deset let',
    text: 'Za deset let se vějíř rozevře víc: rozdíly mezi počátkem a koncem sledovaných období jsou větší, směrem nahoru i dolů. Převládají poklesy.\n\nNejvyšší růst zaznamenalo Rusko v letech 2005–2015, +0,48, ani ten se nepřiblížil cíli premiéra Babiše +0,82.\n\nOd roku 2007 stát nabízel rodinám po narození druhého či dalšího dítěte vysoký příspěvek využitelný zejména na bydlení, vzdělání nebo penzi matky a zvýšil také další dávky. Nelze však tvrdit, že zafungovalo jedno konkrétní opatření: růst provázelo ekonomické zotavení i jiné načasování porodů.',
  },
  {
    window: 10 as const,
    iso: 'RUS',
    startYear: 2005,
    title: 'Rusko 2005–2015',
    text: 'Nejvyšší nárůst v tomto souboru: +0,48. Od roku 2007 stát nabízel rodinám po narození druhého či dalšího dítěte vysoký příspěvek využitelný zejména na bydlení, vzdělání nebo penzi matky a zvýšil také další dávky. Nelze tvrdit, že zafungovalo jedno konkrétní opatření: současně se měnila ekonomika i načasování porodů.',
  },
  {
    window: 10 as const,
    iso: 'SWE',
    startYear: 2000,
    title: 'Švédsko 2000–2010',
    text: 'Nárůst +0,44 provázela dostupná péče o děti, rodičovská vázaná na příjem a nepřenosné měsíce pro otce. Politiky snížily překážky rodičovství, ale vzestup se neudržel.',
  },
  {
    window: 10 as const,
    iso: 'HUN',
    startYear: 2011,
    title: 'Maďarsko 2011–2021',
    text: 'Daňové úlevy, zvýhodněné úvěry a podpora rodin doprovázely nárůst +0,40. Z dat zatím nelze oddělit trvale vyšší počet dětí od dřívějšího načasování porodů.',
  },
  {
    window: 10 as const,
    iso: 'CZE',
    startYear: 2011,
    title: 'Česko 2011–2021',
    text: 'Také Česko zažilo nárůst +0,40, aniž by mělo jednu mimořádnou pronatalitní reformu. Je to varování před přisuzováním celé změny jedinému opatření.',
  },
  {
    window: 10 as const,
    target: true,
    title: 'Politický cíl hnutí ANO',
    text: 'Cesta z 1,28 na 2,10 leží výrazně nad všemi pozorovanými okny. Rodinná politika může odstraňovat překážky, ale dostupná data nedokládají nástroj, který by takový skok spolehlivě vyvolal.',
  },
] as const;

const WIDTH = 760;
const HEIGHT = 470;
const MARGIN = { top: 24, right: 116, bottom: 52, left: 58 };
const Y_MIN = -1.65;
const Y_MAX = 1;

function x(value: number, duration: number) {
  return MARGIN.left + (value / duration) * (WIDTH - MARGIN.left - MARGIN.right);
}

function y(value: number) {
  return MARGIN.top + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * (HEIGHT - MARGIN.top - MARGIN.bottom);
}

function formatChange(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}`;
}

function formatPeriod(startYear: number, endYear: number) {
  return `${startYear}–${String(endYear).slice(-2)}`;
}

function policyContext(row: WindowRow) {
  const key = `${row.iso}-${row.startYear}-${row.endYear}`;
  const contexts: Record<string, string> = {
    'NZL-2002-2007': 'Placená rodičovská dovolená od roku 2002 a postupně zaváděný balík Working for Families; graf neprokazuje jejich samostatný účinek.',
    'RUS-2005-2015': 'Od roku 2007 stát nabízel vysoký příspěvek po narození druhého či dalšího dítěte, využitelný hlavně na bydlení, vzdělání nebo penzi matky. Nelze tvrdit, že zafungoval právě on.',
    'SWE-2000-2010': 'Dostupná péče o děti, rodičovská vázaná na příjem a nepřenosné měsíce pro otce; vzestup se později neudržel.',
    'HUN-2011-2021': 'Daňové úlevy, zvýhodněné úvěry a podpora rodin; z grafu nelze určit, jakou část změny způsobila jednotlivá opatření.',
    'CZE-2011-2021': 'Bez jedné mimořádné pronatalitní reformy; změnu proto nelze připsat jedinému opatření.',
  };
  return contexts[key];
}

export default function FertilityFanScrolly() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<{ row: WindowRow; x: number; y: number } | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const step = STEPS[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setHovered(null);
          setActive(Number((visible.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.2, 0.5, 0.8] },
    );
    stepRefs.current.forEach(element => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => data.filter(row => row.window === step.window), [step.window]);
  const selected = 'iso' in step
    ? rows.find(row => row.iso === step.iso && row.startYear === step.startYear)
    : undefined;
  const duration = step.window;
  const endX = x(duration, duration);
  const directLabelName = selected
    ? `${COUNTRY_LABELS[selected.iso] ?? selected.country} (${formatPeriod(selected.startYear, selected.endYear)})`
    : 'target' in step && step.target
      ? 'Politický cíl hnutí ANO'
      : null;
  const directLabelValue = selected
    ? formatChange(selected.change)
    : 'target' in step && step.target
      ? '+0,82'
      : null;
  const hasDirectLabel = Boolean(selected || ('target' in step && step.target));

  const handlePointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const localX = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const localY = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    const plotX = Math.max(MARGIN.left, Math.min(endX, localX));
    const progress = (plotX - MARGIN.left) / (endX - MARGIN.left);
    const nearest = rows.reduce<{ row: WindowRow; distance: number } | null>((best, row) => {
      const distance = Math.abs(localY - y(row.change * progress));
      return !best || distance < best.distance ? { row, distance } : best;
    }, null);
    if (!nearest) return;
    if (nearest.row === selected) {
      setHovered(null);
      return;
    }
    setHovered({ row: nearest.row, x: plotX, y: y(nearest.row.change * progress) });
  };
  const hoveredContext = hovered ? policyContext(hovered.row) : undefined;
  const tooltipHeight = hoveredContext ? 280 : 78;

  return (
    <section className={styles.scrolly} aria-label="Změny úhrnné plodnosti v pětiletých a desetiletých oknech">
      <div className={styles.graphicStage}>
        <div className={styles.graphic}>
          <header className={styles.header}>
            <div>
              <h2>Jak velký obrat dokázaly bohaté země</h2>
              <p>Hledáme největší nárůst, jaký se kdy podařil</p>
            </div>
            <ChartSignature size={28} layout="stacked" textWeight={400} />
          </header>

          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label="Vějíř změn úhrnné plodnosti"
            aria-describedby="fan-desc"
          >
            <desc id="fan-desc">
              Každá šedá úsečka představuje skutečné pětileté nebo desetileté okno jedné země.
              Zvýrazněná úsečka odpovídá právě popisovanému případu.
            </desc>

            {[-1.5, -1, -0.5, 0, 0.5, 1].map(tick => (
              <g key={tick}>
                <line className={tick === 0 ? styles.zero : styles.grid} x1={MARGIN.left} x2={endX} y1={y(tick)} y2={y(tick)} />
                <text className={styles.tick} x={MARGIN.left - 10} y={y(tick) + 4} textAnchor="end">
                  {tick > 0 ? '+' : ''}{tick.toFixed(1).replace('.', ',')}
                </text>
              </g>
            ))}

            {rows.map(row => {
              const isSelected = selected === row;
              const isHovered = hovered?.row === row;
              return (
                <line
                  key={`${row.iso}-${row.startYear}-${row.window}`}
                  className={isSelected ? styles.selectedLine : isHovered ? styles.hoveredLine : styles.fanLine}
                  x1={x(0, duration)}
                  y1={y(0)}
                  x2={endX}
                  y2={y(row.change)}
                />
              );
            })}

            {'target' in step && step.target && (
              <line className={styles.targetLine} x1={x(0, duration)} y1={y(0)} x2={endX} y2={y(TARGET_CHANGE)} />
            )}

            <text className={styles.axisLabel} x={(MARGIN.left + endX) / 2} y={HEIGHT - 13} textAnchor="middle">
              roky od začátku {duration}letého okna
            </text>
            <text className={styles.startLabel} x={MARGIN.left} y={y(0) - 10}>začátek = 0</text>

            {(selected || ('target' in step && step.target)) && (
              <g>
                <circle
                  className={'target' in step && step.target ? styles.targetDot : styles.selectedDot}
                  cx={endX}
                  cy={y(selected?.change ?? TARGET_CHANGE)}
                  r={5}
                />
                <text
                  className={'target' in step && step.target ? styles.targetLabel : styles.directLabel}
                  x={endX - 8}
                  y={y(selected?.change ?? TARGET_CHANGE) - 11}
                  textAnchor="end"
                >
                  <tspan className={styles.labelName}>{directLabelName}</tspan>
                  <tspan className={styles.labelValue} dx="7">{directLabelValue}</tspan>
                </text>
              </g>
            )}

            <rect
              className={styles.hoverLayer}
              x={MARGIN.left}
              y={MARGIN.top}
              width={endX - MARGIN.left}
              height={HEIGHT - MARGIN.top - MARGIN.bottom}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHovered(null)}
            />

            {hovered && (
              <foreignObject
                className={styles.tooltipObject}
                x={Math.min(Math.max(hovered.x + 10, MARGIN.left), WIDTH - 388)}
                y={hovered.y > tooltipHeight + 10 ? hovered.y - tooltipHeight - 8 : hovered.y + 12}
                width="380"
                height={tooltipHeight}
                pointerEvents="none"
              >
                <div className={styles.tooltip} role="tooltip">
                  <strong>
                    {COUNTRY_LABELS[hovered.row.iso] ?? hovered.row.country} ({formatPeriod(hovered.row.startYear, hovered.row.endYear)})
                    <b className={styles.tooltipValue}> {formatChange(hovered.row.change)}</b>
                  </strong>
                  {hoveredContext && <p><b>Politický kontext:</b> {hoveredContext}</p>}
                </div>
              </foreignObject>
            )}
          </svg>

          <div className={`${styles.current} ${hasDirectLabel ? styles.currentCompact : ''}`} aria-live="polite">
            {!hasDirectLabel && <strong>{step.title}</strong>}
            <span>
              {rows.length} {duration === 5 ? 'pětiletých' : 'desetiletých'} období různých zemí
            </span>
          </div>

          <footer className={styles.footer}>
            <div>• autoři: Kateřina Mahdalová &amp; Michal Škop</div>
            <div>• data: World Bank / UN Population Division; země a filtry podle dodaného analytického výstupu</div>
            <div>• vějíř: každá spojnice zachycuje změnu v jednom období – pouze jeho začátek a konec, nikoli průběh mezi nimi</div>
          </footer>
        </div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((item, index) => (
          <div
            key={item.title}
            ref={element => { stepRefs.current[index] = element; }}
            data-step={index}
            className={`${styles.step} ${active === index ? styles.active : ''}`}
          >
            <div className={styles.bubble}>
              <strong>{item.title}</strong>
              {item.text.split('\n\n').map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

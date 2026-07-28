'use client';

import { useEffect, useRef, useState } from 'react';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

const steps = [
  {
    title: '1. Praktická lékařka',
    text: 'Marie, 78 let, žije sama v malé obci. Má diabetes, srdeční selhání a začínající poruchu paměti. První otázka zní, zda má její praktik ještě kapacitu a kdo ordinaci převezme.',
    metric: '39 % českých lékařů je ve věku 55+',
  },
  {
    title: '2. Vyšetření a žádanka',
    text: 'Další péče závisí na tom, zda spolu ordinace sdílejí dokumentaci a zda se Marie dostane ke specialistovi včas. Elektronická žádanka pomůže teprve tehdy, když ji používají obě strany.',
    metric: 'slib → zákon → spuštění → používání',
  },
  {
    title: '3. Nemocnice',
    text: 'Zhoršení stavu končí hospitalizací. Část takových pobytů lze odvrátit dobrou ambulantní a koordinovanou péčí; Česko je nad průměrem OECD.',
    metric: '592 vs. 473 hospitalizací na 100 tisíc',
  },
  {
    title: '4. Propuštění',
    text: 'Akutní léčba skončila, potřeba pomoci nikoli. Nejslabší okamžik přichází při předání mezi zdravotním a sociálním systémem.',
    metric: 'jedna pacientka, dva rozpočty',
  },
  {
    title: '5. Péči přebírá rodina',
    text: 'Dcera zařizuje léky, hygienu, dopravu i dohled. Tato práce se neobjeví v počtu lůžek ani zdravotnických úvazků.',
    metric: '13 % výdajů na dlouhodobou péči v Česku',
  },
  {
    title: '6. Místo v síti péče',
    text: 'Když domácí péče nestačí, rozhoduje skutečná kapacita terénních a pobytových služeb, čekací doba, cena a vlastník zařízení.',
    metric: 'potřeba roste rychleji než formální kapacita',
  },
] as const;

const nodes = [
  { x: 80, label: 'praktik' },
  { x: 205, label: 'specialista' },
  { x: 330, label: 'nemocnice' },
  { x: 455, label: 'propuštění' },
  { x: 580, label: 'rodina' },
  { x: 705, label: 'služba' },
];

export default function CareJourneyScrolly() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0.2, 0.55, 0.8] },
    );
    refs.current.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <VisualFrame
      title="Jedna pacientka prochází několika systémy"
      subtitle="Modelová cesta ukazuje místa, kde se z dostupnosti lékaře stává problém koordinace, kapacity a financování."
      source={<><a href="https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en/czechia_3f532d88-en.html">OECD, Health at a Glance 2025</a>; <a href="https://www.nzip.cz/data/2358-pracovnici-pocty-zp-vek-pohlavi-kraj-okres-datovy-souhrn">ÚZIS, věková struktura zdravotníků</a>; modelová osoba není skutečnou pacientkou</>}
    >
      <div className={styles.scrolly}>
        <div className={styles.sticky}>
          <svg className={styles.journeySvg} viewBox="0 0 785 410" role="img" aria-label={`Cesta pacientky, aktivní krok ${active + 1}`}>
            <line x1="80" y1="205" x2="705" y2="205" stroke="#c9c4ba" strokeWidth="9" strokeLinecap="round" />
            <line x1="80" y1="205" x2={nodes[active].x} y2="205" stroke="#d7194b" strokeWidth="9" strokeLinecap="round" />
            {nodes.map((node, index) => (
              <g key={node.label}>
                <circle cx={node.x} cy="205" r={index === active ? 22 : 13} fill={index <= active ? '#d7194b' : '#fff'} stroke={index <= active ? '#d7194b' : '#8f938f'} strokeWidth="4" />
                <text x={node.x} y={index % 2 ? 255 : 165} textAnchor="middle" fontSize="15" fontWeight={index === active ? 700 : 400} fill="#171a32">{node.label}</text>
              </g>
            ))}
            <text x="392" y="52" textAnchor="middle" fontSize="18" fontWeight="700" fill="#171a32">{steps[active].metric}</text>
            <g transform={`translate(${nodes[active].x - 24} 272)`}>
              <circle cx="24" cy="24" r="22" fill="#315f8c" />
              <path d="M14 45c2-12 18-12 20 0M24 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x={nodes[active].x} y="350" textAnchor="middle" fontSize="16" fontWeight="700" fill="#315f8c">Marie, 78 let</text>
          </svg>
        </div>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div
              key={step.title}
              ref={node => { refs.current[index] = node; }}
              data-step={index}
              className={`${styles.step} ${index === active ? styles.stepActive : ''}`}
            >
              <div className={styles.bubble}>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

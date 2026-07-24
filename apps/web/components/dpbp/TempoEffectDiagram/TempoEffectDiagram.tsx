import styles from './TempoEffectDiagram.module.css';

export default function TempoEffectDiagram() {
  return (
    <div className={styles.visual}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 280"
        role="img"
        aria-label="Schéma tempo efektu: ženy v roce 1995 rodily první dítě ve 22 letech, dnes ve 30"
      >
        <rect width="600" height="280" className={styles.bg} />
        <rect x="140" y="55" width="240" height="160" className={styles.gapBox} />
        <text x="260" y="138" className={styles.textRed} textAnchor="middle">TEMPO EFEKT</text>
        <text className={styles.textTitle} textAnchor="end">
          <tspan x="65" y="70">Rok</tspan>
          <tspan x="65" dy="20">1995</tspan>
        </text>
        <text x="65" y="210" className={styles.textTitle} textAnchor="end">Dnes</text>
        <line x1="80" y1="80" x2="560" y2="80" className={styles.linePast} opacity="0.3" />
        <line x1="80" y1="200" x2="560" y2="200" className={styles.linePresent} opacity="0.3" />
        <line x1="80" y1="28" x2="80" y2="235" className={styles.tick} />
        <text x="80" y="255" className={styles.textAge} textAnchor="middle">Věk 20</text>
        <line x1="230" y1="28" x2="230" y2="235" className={styles.tick} />
        <text x="230" y="255" className={styles.textAge} textAnchor="middle">Věk 25</text>
        <line x1="380" y1="28" x2="380" y2="235" className={styles.tick} />
        <text x="380" y="255" className={styles.textAge} textAnchor="middle">Věk 30</text>
        <line x1="530" y1="28" x2="530" y2="235" className={styles.tick} />
        <text x="530" y="255" className={styles.textAge} textAnchor="middle">Věk 35</text>
        <circle cx="140" cy="80" r="7" className={styles.dotPast} />
        <text x="140" y="62" className={styles.textMain} textAnchor="middle" fontWeight="700">1. dítě</text>
        <circle cx="230" cy="80" r="7" className={styles.dotPast} />
        <text x="230" y="62" className={styles.textMain} textAnchor="middle" fontWeight="700">2. dítě</text>
        <circle cx="380" cy="200" r="7" className={styles.dotPresent} />
        <text x="380" y="222" className={styles.textMain} textAnchor="middle" fontWeight="700">1. dítě</text>
        <circle cx="470" cy="200" r="7" className={styles.dotPresent} />
        <text x="470" y="222" className={styles.textMain} textAnchor="middle" fontWeight="700">2. dítě</text>
      </svg>
      <p className={styles.caption}>Tempo efekt: posunutí věku rození dítěte způsobuje v daném roce pokles statistické plodnosti, i když ženy nakonec děti mít budou.</p>
    </div>
  );
}

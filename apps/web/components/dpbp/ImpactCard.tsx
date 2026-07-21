import styles from './ImpactCard.module.css';

export interface ImpactCardData {
  id: string;
  number: string;
  unit: string;
  perUnit: string;
  label: string;
  sublabel: string;
  context: string;
  source: string;
  accent: string;
}

interface ImpactCardProps {
  card: ImpactCardData;
}

// Úvodní statistika kapitoly. Záměrně NENÍ karta ani odkaz – je to editoriální
// „callout“ ve vlastním textovém toku (linka nahoře i dole, žádný stín, rámeček
// ani šipka). Číslo je hák; delší kontext patří do úvodního textu, ne sem.
export default function ImpactCard({ card }: ImpactCardProps) {
  return (
    <div className={styles.stat} style={{ borderColor: card.accent }}>
      <div className={styles.fig} style={{ color: card.accent }}>
        {card.number}
        {card.unit && <span className={styles.unit}>{card.unit}</span>}
        {card.perUnit && <span className={styles.perUnit}>{card.perUnit}</span>}
      </div>
      <div className={styles.cap}>
        {(card.sublabel || card.label) && (
          <div className={styles.lbl}>{card.sublabel || card.label}</div>
        )}
        {card.source && <div className={styles.src}>Zdroj: {card.source}</div>}
      </div>
    </div>
  );
}

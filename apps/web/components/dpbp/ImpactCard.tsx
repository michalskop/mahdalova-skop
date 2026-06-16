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

export default function ImpactCard({ card }: ImpactCardProps) {
  return (
    <div className={styles.card} style={{ borderLeftColor: card.accent }}>
      <div className={styles.num} style={{ color: card.accent }}>
        {card.number}
        {card.unit && <span className={styles.unit}>{' '}{card.unit}</span>}
        {card.perUnit && <span className={styles.perUnit}>{card.perUnit}</span>}
      </div>
      <div className={styles.text}>
        {card.sublabel && <b>{card.sublabel}</b>}
        {card.context && ` ${card.context}`}
        <span className={styles.source}>{' · '}Zdroj: {card.source}</span>
      </div>
    </div>
  );
}

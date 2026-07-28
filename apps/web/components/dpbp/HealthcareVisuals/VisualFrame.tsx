import styles from './HealthcareVisuals.module.css';

type Props = {
  title: string;
  subtitle: string;
  source: React.ReactNode;
  children: React.ReactNode;
};

export default function VisualFrame({ title, subtitle, source, children }: Props) {
  return (
    <section className={styles.frame}>
      <header className={styles.header}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className={styles.brand}>DataTimes.cz<br />Mahdalová &amp; Škop</div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div>• autoři: Kateřina Mahdalová &amp; Michal Škop</div>
        <div>• data: {source}</div>
      </footer>
    </section>
  );
}

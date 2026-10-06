'use client';

import Link from 'next/link';
import { Accordion } from '@mantine/core';
import { StepBody, supportSteps } from '../podporte-nas/supportSteps';
import stepStyles from '../podporte-nas/SupportScrolly.module.css';
import styles from './SupportAccordion.module.css';

const [intro, ...ways] = supportSteps;

/**
 * Bottom of /o-nas: "Podpořte nás" – the same ways to help as the
 * /podporte-nas timeline, one accordion item each (content: supportSteps).
 */
export default function SupportAccordion() {
  return (
    <section id="podporte-nas" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Podpořte nás</h2>
        {/* Only the first intro paragraph – the second one talks about the timeline. */}
        <p className={styles.lead} dangerouslySetInnerHTML={{ __html: intro.paragraphs[0] }} />
        <p className={styles.lead}>
          Většina způsobů je zdarma a{' '}zabere minutu. Vyberte si, co vám sedí – i{' '}jediný krok nám pomůže.
        </p>

        <Accordion
          variant="separated"
          radius="md"
          chevronPosition="right"
          classNames={{
            item: styles.item,
            control: styles.control,
            label: styles.label,
            panel: styles.panel,
          }}
        >
          {ways.map((step) => (
            <Accordion.Item key={step.id} value={step.id}>
              <Accordion.Control>
                <span className={styles.controlTitle}>{step.title}</span>
                {step.effort ? <span className={stepStyles.effort}>{step.effort}</span> : null}
              </Accordion.Control>
              <Accordion.Panel>
                <StepBody step={step} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        <p className={styles.more}>
          <Link href="/podporte-nas">Všechny způsoby podpory na jedné stránce →</Link>
        </p>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { Accordion } from '@mantine/core';
import { StepBody, supportSteps } from '../support/supportSteps';
import stepStyles from '../support/SupportScrolly.module.css';
import styles from './SupportAccordion.module.css';

const [intro, ...ways] = supportSteps;

/**
 * Bottom of /about: "Support us" – the same ways to help as the /support
 * timeline, one accordion item each (content: supportSteps).
 */
export default function SupportAccordion() {
  return (
    <section id="support" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Support us</h2>
        {/* Only the first intro paragraph – the second one talks about the timeline. */}
        <p className={styles.lead} dangerouslySetInnerHTML={{ __html: intro.paragraphs[0] }} />
        <p className={styles.lead}>
          Most of them are free and take a minute. Pick whatever suits you – even a single step helps.
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
          <Link href="/support">All the ways to support us on one page →</Link>
        </p>
      </div>
    </section>
  );
}

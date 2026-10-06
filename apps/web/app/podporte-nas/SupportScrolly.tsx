'use client';

import RouteTimeline, { RouteTimelineItem } from '@/components/common/RouteTimeline/RouteTimeline';
import aboutStyles from '../o-nas/AboutScrolly.module.css';
import styles from './SupportScrolly.module.css';
import { StepBody, supportSteps } from './supportSteps';

const items: RouteTimelineItem[] = supportSteps.map((step) => ({
  id: step.id,
  side: step.side,
  content: (
    <div id={step.id} className={styles.anchor}>
      {step.masthead ? (
        <div className={aboutStyles.bubbleMasthead}>
          <h3 className={aboutStyles.titleInk}>{step.title}</h3>
        </div>
      ) : (
        <>
          {step.effort ? <span className={styles.effort}>{step.effort}</span> : null}
          <h3>{step.title}</h3>
        </>
      )}
      <StepBody step={step} />
    </div>
  ),
}));

/** The /podporte-nas route: ways to support DataTimes along the shared wavy line. */
export default function SupportScrolly() {
  return <RouteTimeline items={items} />;
}

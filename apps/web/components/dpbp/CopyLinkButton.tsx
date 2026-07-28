'use client';

import { useState } from 'react';
import { IconLink, IconCheck } from '@tabler/icons-react';
import styles from './ArticleHeader.module.css';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? 'Odkaz zkopírován' : 'Zkopírovat odkaz';
  return (
    // Ikona řetězu není samovysvětlující jako loga sítí – hover tooltip ukáže,
    // co dělá (a po kliknutí potvrdí zkopírování).
    <button
      type="button"
      aria-label={label}
      style={{ position: 'relative' }}
      onClick={() => {
        navigator.clipboard?.writeText(url).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          },
          () => {}
        );
      }}
    >
      {copied ? <IconCheck size={16} stroke={2} /> : <IconLink size={16} stroke={1.9} />}
      <span className={styles.tip} aria-hidden="true">{copied ? 'Zkopírováno!' : 'Kopírovat odkaz'}</span>
    </button>
  );
}

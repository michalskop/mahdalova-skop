'use client';

import { useState } from 'react';
import { IconLink, IconCheck } from '@tabler/icons-react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? 'Odkaz zkopírován' : 'Zkopírovat odkaz'}
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
    </button>
  );
}

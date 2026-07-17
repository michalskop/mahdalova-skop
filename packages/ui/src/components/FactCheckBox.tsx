'use client';

import { Paper, useMantineTheme } from '@mantine/core';
import type { ReactNode } from 'react';

type Verdict = 'true' | 'false' | 'misleading' | 'unverifiable';
type Locale = 'cs-CZ' | 'en-US';

interface FactCheckBoxProps {
  children: ReactNode;
  verdict?: Verdict;
  claim?: string;
  locale?: Locale;
}

// Reuses InfoBox's success/error/warning/info hex tokens for visual consistency
const verdictStyles: Record<Verdict, { borderColor: string; backgroundColor: string; badgeColor: string }> = {
  true:         { borderColor: '#0f6c78', backgroundColor: '#e5f9fc', badgeColor: '#0f6c78' },
  false:        { borderColor: '#de1743', backgroundColor: '#fff4f6', badgeColor: '#de1743' },
  misleading:   { borderColor: '#f76800', backgroundColor: '#fff4eb', badgeColor: '#f76800' },
  unverifiable: { borderColor: '#6267a3', backgroundColor: '#f0f1f8', badgeColor: '#6267a3' },
};

const verdictLabels: Record<Locale, Record<Verdict, string>> = {
  'cs-CZ': {
    true: 'Pravda',
    false: 'Nepravda',
    misleading: 'Zavádějící',
    unverifiable: 'Neověřitelné',
  },
  'en-US': {
    true: 'True',
    false: 'False',
    misleading: 'Misleading',
    unverifiable: 'Unverifiable',
  },
};

export function FactCheckBox({ children, verdict = 'unverifiable', claim, locale = 'cs-CZ' }: FactCheckBoxProps) {
  const theme = useMantineTheme();
  const boxStyles = verdictStyles[verdict] ?? verdictStyles.unverifiable;
  const label = verdictLabels[locale]?.[verdict] ?? verdictLabels[locale].unverifiable;

  return (
    <Paper
      shadow="xs"
      px="md"
      py="xs"
      radius="md"
      my="lg"
      style={{
        backgroundColor: boxStyles.backgroundColor,
        borderLeft: `4px solid ${boxStyles.borderColor}`,
        color: theme.colors.dark?.[7] ?? '#1a1a2e',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          backgroundColor: boxStyles.badgeColor,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.8em',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          padding: '2px 10px',
          borderRadius: 999,
          marginBottom: '0.5em',
        }}
      >
        {label}
      </span>
      {claim && (
        <p style={{ fontStyle: 'italic', fontWeight: 600, margin: '0.3em 0 0.6em' }}>
          „{claim}“
        </p>
      )}
      {children}
    </Paper>
  );
}

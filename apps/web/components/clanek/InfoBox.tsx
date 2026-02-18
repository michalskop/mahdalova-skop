// components/clanek/InfoBox.tsx
import { Paper, useMantineTheme } from '@mantine/core';
import React from 'react';
import styles from './box.module.css';

type InfoBoxType = 'info' | 'warning' | 'success' | 'error';

interface InfoBoxProps {
  children: React.ReactNode;
  float?: 'right' | 'left' | 'none';
  type?: InfoBoxType;
}

const typeStyles: Record<InfoBoxType, { borderColor: string; backgroundColor: string }> = {
  info: { borderColor: '#6267a3', backgroundColor: '#f0f1f8' },
  warning: { borderColor: '#f76800', backgroundColor: '#fff4eb' },
  success: { borderColor: '#0f6c78', backgroundColor: '#e5f9fc' },
  error: { borderColor: '#de1743', backgroundColor: '#fff4f6' },
};

export function InfoBox({ children, float, type = 'info' }: InfoBoxProps) {
  const theme = useMantineTheme();
  const boxStyles = typeStyles[type];

  const floatClass =
    float === 'right' ? styles.floatRight :
    float === 'left'  ? styles.floatLeft  :
    undefined;

  return (
    <Paper
      shadow="xs"
      px="md"
      py="xs"
      radius="md"
      my="lg"
      className={floatClass}
      style={{
        backgroundColor: boxStyles.backgroundColor,
        borderLeft: `4px solid ${boxStyles.borderColor}`,
        color: theme.colors.dark?.[7] ?? '#1a1a2e',
      }}
    >
      {children}
    </Paper>
  );
}

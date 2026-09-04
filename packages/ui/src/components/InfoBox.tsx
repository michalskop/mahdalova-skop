'use client';

import { Paper, useMantineTheme } from '@mantine/core';
import React, { useState } from 'react';
import styles from './box.module.css';

type InfoBoxType = 'default' | 'info' | 'warning' | 'success' | 'error';

interface InfoBoxProps {
  children: React.ReactNode;
  float?: 'right' | 'left' | 'none';
  type?: InfoBoxType;
  readMoreAt?: string | number;
  readMoreLabel?: string;
  readLessLabel?: string;
}

const typeStyles: Record<InfoBoxType, { borderColor: string; backgroundColor: string; buttonColor: string }> = {
  default: { borderColor: '#e8e8dc', backgroundColor: '#f8f6f0', buttonColor: '#5c5b52' }, // background[6], background[2]
  info:    { borderColor: '#6267a3', backgroundColor: '#f0f1f8', buttonColor: '#6267a3' },
  warning: { borderColor: '#f76800', backgroundColor: '#fff4eb', buttonColor: '#f76800' },
  success: { borderColor: '#0f6c78', backgroundColor: '#e5f9fc', buttonColor: '#0f6c78' },
  error:   { borderColor: '#de1743', backgroundColor: '#fff4f6', buttonColor: '#de1743' },
};

export function InfoBox({
  children,
  float,
  type = 'default',
  readMoreAt,
  readMoreLabel = 'Read more',
  readLessLabel = 'Less',
}: InfoBoxProps) {
  const theme = useMantineTheme();
  const [expanded, setExpanded] = useState(false);
  const boxStyles = typeStyles[type];

  const floatClass =
    float === 'right' ? styles.floatRight :
    float === 'left'  ? styles.floatLeft  :
    undefined;

  // Font: body inherits the app body font (web: IBM Plex Serif); the box title
  // (leading bold / any heading) is switched to the headings font (IBM Plex
  // Sans) via styles.infoBox rules in box.module.css. Uses Mantine's font CSS
  // variables so it adapts per app (DJS → Work Sans).
  const boxClass = [styles.infoBox, floatClass].filter(Boolean).join(' ');

  const splitAt = readMoreAt !== undefined ? Number(readMoreAt) : undefined;
  const childArray = React.Children.toArray(children);
  const visibleChildren = splitAt !== undefined ? childArray.slice(0, splitAt) : childArray;
  const collapsedChildren = splitAt !== undefined ? childArray.slice(splitAt) : [];

  return (
    <Paper
      shadow="xs"
      px="md"
      py="xs"
      radius="md"
      my="lg"
      className={boxClass}
      style={{
        backgroundColor: boxStyles.backgroundColor,
        borderLeft: `4px solid ${boxStyles.borderColor}`,
        color: theme.colors.dark?.[7] ?? '#1a1a2e',
      }}
    >
      {collapsedChildren.length > 0 ? (
        <div style={{ position: 'relative' }}>
          {visibleChildren}
          {!expanded && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3em',
                background: `linear-gradient(to bottom, transparent, ${boxStyles.backgroundColor})`,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      ) : (
        visibleChildren
      )}
      {collapsedChildren.length > 0 && (
        <>
          {expanded && collapsedChildren}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: boxStyles.buttonColor,
              fontWeight: 600,
              padding: '4px 0',
              fontSize: '0.9em',
              display: 'block',
            }}
          >
            {expanded ? readLessLabel : readMoreLabel}
          </button>
        </>
      )}
    </Paper>
  );
}

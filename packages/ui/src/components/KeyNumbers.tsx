'use client';

import { Container, useMantineTheme } from '@mantine/core';
import classes from './KeyNumbers.module.css';

export type KeyNumberColor = 'red' | 'blue' | 'green';

export interface KeyNumberItem {
  value: string;
  title: string;
  description: string;
  color?: KeyNumberColor;
}

interface KeyNumbersProps {
  label?: string;
  numbers: KeyNumberItem[];
}

export function KeyNumbers({ label = 'Klíčová čísla', numbers }: KeyNumbersProps) {
  const theme = useMantineTheme();

  const getColorStyles = (color?: KeyNumberColor) => {
    switch (color) {
      case 'blue':
        return {
          borderColor: '#1a6fa8',
          valueColor: '#1a6fa8',
        };
      case 'green':
        return {
          borderColor: '#2a8a50',
          valueColor: '#2a8a50',
        };
      case 'red':
      default:
        return {
          borderColor: theme.colors.brand[6],
          valueColor: theme.colors.brand[6],
        };
    }
  };

  return (
    <section className={classes.numbersSection}>
      <Container size="md">
        <div className={classes.sectionLabel}>{label}</div>
        <div className={classes.numbersGrid}>
          {numbers.map((item, index) => {
            const colorStyles = getColorStyles(item.color);
            return (
              <div
                key={index}
                className={classes.numCard}
                style={{ borderTopColor: colorStyles.borderColor }}
              >
                <div
                  className={classes.numBig}
                  style={{ color: colorStyles.valueColor }}
                >
                  {item.value}
                </div>
                <div className={classes.numLabel}>
                  <strong>{item.title}</strong>
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

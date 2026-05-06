'use client';

import React from 'react';
import { Container, useMantineTheme } from '@mantine/core';
import classes from './KeyNumbers.module.css';

export type KeyNumberPaletteColor = 'red' | 'blue' | 'green' | 'teal' | 'orange' | 'navy' | 'yellow' | 'forestGreen' | 'emeraldMint' | 'deepRed';

export interface KeyNumberItem {
  value: string;
  title: string;
  description: string;
  color?: KeyNumberPaletteColor | string;
}

export interface KeyNumbersData {
  label?: string;
  numbers: KeyNumberItem[];
}

interface KeyNumbersProps {
  label?: string;
  numbers?: KeyNumberItem[];
  dataFile?: string;
}

export function KeyNumbers({ label = 'Klíčová čísla', numbers, dataFile }: KeyNumbersProps) {
  const theme = useMantineTheme();
  const [data, setData] = React.useState<KeyNumberItem[] | null>(numbers || null);
  const [loading, setLoading] = React.useState(!!dataFile);

  React.useEffect(() => {
    if (dataFile) {
      fetch(dataFile)
        .then(res => res.json())
        .then((jsonData: KeyNumbersData) => {
          setData(jsonData.numbers);
          if (jsonData.label && !label) {
            label = jsonData.label;
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load KeyNumbers data:', err);
          setLoading(false);
        });
    }
  }, [dataFile]);

  const getPaletteColor = (colorName: KeyNumberPaletteColor): string => {
    const paletteColors: Record<KeyNumberPaletteColor, string> = {
      red: theme.colors.brand?.[6] || '#de1743',
      blue: '#1a6fa8',
      green: '#2a8a50',
      teal: theme.colors.brandTeal?.[6] || '#0f6c78',
      orange: theme.colors.brandOrange?.[6] || '#f76800',
      navy: theme.colors.brandNavy?.[6] || '#6267a3',
      yellow: theme.colors.brandYellow?.[6] || '#ffcf02',
      forestGreen: theme.colors.brandForestGreen?.[6] || '#639e0a',
      emeraldMint: theme.colors.brandEmeraldMint?.[6] || '#12b886',
      deepRed: theme.colors.brandDeepRed?.[6] || '#a03250',
    };
    return paletteColors[colorName];
  };

  const getColorStyles = (color?: KeyNumberPaletteColor | string) => {
    if (!color || color === 'red') {
      const defaultColor = theme.colors.brand?.[6] || '#de1743';
      return {
        borderColor: defaultColor,
        valueColor: defaultColor,
      };
    }

    if (color.startsWith('#') || color.startsWith('rgb')) {
      return {
        borderColor: color,
        valueColor: color,
      };
    }

    const paletteColor = getPaletteColor(color as KeyNumberPaletteColor);
    return {
      borderColor: paletteColor,
      valueColor: paletteColor,
    };
  };

  if (loading) {
    return (
      <section className={classes.numbersSection}>
        <Container size="md">
          <div className={classes.sectionLabel}>{label}</div>
          <div>Loading...</div>
        </Container>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className={classes.numbersSection}>
      <Container size="md">
        <div className={classes.sectionLabel}>{label}</div>
        <div className={classes.numbersGrid}>
          {data.map((item, index) => {
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

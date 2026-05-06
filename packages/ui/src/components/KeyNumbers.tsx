'use client';

import React from 'react';
import { Container, useMantineTheme } from '@mantine/core';
import classes from './KeyNumbers.module.css';

export type KeyNumberPaletteColor = 'brand' | 'background' | 'brandNavy' | 'brandTeal' | 'brandOrange' | 'brandRoyalBlue' | 'brandYellow' | 'brandForestGreen' | 'brandEmeraldMint' | 'brandDeepRed';

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
}

export function KeyNumbers({ label = 'Klíčová čísla', numbers }: KeyNumbersProps) {
  const theme = useMantineTheme();

  const getPaletteColor = (colorName: KeyNumberPaletteColor): string => {
    const paletteColors: Record<KeyNumberPaletteColor, string> = {
      brand: theme.colors.brand?.[6] || '#de1743',
      background: theme.colors.background?.[6] || '#e8e8dc',
      brandNavy: theme.colors.brandNavy?.[6] || '#6267a3',
      brandTeal: theme.colors.brandTeal?.[6] || '#0f6c78',
      brandOrange: theme.colors.brandOrange?.[6] || '#f76800',
      brandRoyalBlue: theme.colors.brandRoyalBlue?.[6] || '#4a51ab',
      brandYellow: theme.colors.brandYellow?.[6] || '#ffcf02',
      brandForestGreen: theme.colors.brandForestGreen?.[6] || '#639e0a',
      brandEmeraldMint: theme.colors.brandEmeraldMint?.[6] || '#12b886',
      brandDeepRed: theme.colors.brandDeepRed?.[6] || '#a03250',
    };
    return paletteColors[colorName];
  };

  const getColorStyles = (color?: KeyNumberPaletteColor | string) => {
    if (!color || color === 'brand') {
      const defaultColor = theme.colors.brand?.[6] || '#de1743';
      return {
        borderColor: defaultColor,
        valueColor: defaultColor,
      };
    }

    // Handle hex and rgb(a) colors
    if (color.startsWith('#') || color.startsWith('rgb')) {
      return {
        borderColor: color,
        valueColor: color,
      };
    }

    // Handle shade notation like "brand[9]" or "brandTeal[3]"
    const shadeMatch = color.match(/^([a-zA-Z]+)\[(\d)\]$/);
    if (shadeMatch) {
      const [, colorName, shadeStr] = shadeMatch;
      const shade = parseInt(shadeStr, 10);
      if (shade >= 0 && shade <= 9) {
        const colorScale = (theme.colors as any)[colorName];
        if (Array.isArray(colorScale) && colorScale[shade]) {
          return {
            borderColor: colorScale[shade],
            valueColor: colorScale[shade],
          };
        }
      }
    }

    // Handle palette color names
    const paletteColor = getPaletteColor(color as KeyNumberPaletteColor);
    return {
      borderColor: paletteColor,
      valueColor: paletteColor,
    };
  };

  if (!numbers || numbers.length === 0) {
    return null;
  }

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

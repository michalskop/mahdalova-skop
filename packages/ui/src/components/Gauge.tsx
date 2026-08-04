'use client';

import React from 'react';
import { Container, useMantineTheme } from '@mantine/core';
import classes from './Gauge.module.css';

export type GaugePaletteColor =
  | 'brand'
  | 'background'
  | 'brandNavy'
  | 'brandTeal'
  | 'brandOrange'
  | 'brandRoyalBlue'
  | 'brandYellow'
  | 'brandForestGreen'
  | 'brandEmeraldMint'
  | 'brandDeepRed';

export interface GaugeItem {
  /** Value shown on the dial. Interpreted against `max` (default 100). */
  value: number;
  /** Unit appended to the printed value. Defaults to "%". */
  suffix?: string;
  /** Scale maximum for this dial. Defaults to 100. */
  max?: number;
  title: string;
  description?: string;
  color?: GaugePaletteColor | string;
}

export interface GaugeData {
  label?: string;
  items: GaugeItem[];
}

interface GaugeProps {
  label?: string;
  items?: GaugeItem[];
  align?: 'left' | 'center' | 'right';
}

// Dial geometry. A 180° arc: 0 sits at the left (9 o'clock), the maximum at the
// right (3 o'clock), sweeping clockwise over the top. Screen coords (y down), so
// the left→top→right path is sweep-flag 1.
const CX = 100;
const CY = 100;
const R = 82;
const NEEDLE_R = R - 24;

function pointAt(fraction: number): [number, number] {
  const angle = (180 + fraction * 180) * (Math.PI / 180);
  return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)];
}

function arcPath(from: number, to: number): string {
  const [x0, y0] = pointAt(from);
  const [x1, y1] = pointAt(to);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function Gauge({ label = 'Klíčová čísla', items, align = 'left' }: GaugeProps) {
  const theme = useMantineTheme();

  const getPaletteColor = (colorName: GaugePaletteColor): string => {
    const paletteColors: Record<GaugePaletteColor, string> = {
      brand: theme.colors.brand?.[6] || '#de1743',
      background: theme.colors.background?.[6] || '#e8e8dc',
      brandNavy: theme.colors.brandNavy?.[6] || '#6267a3',
      brandTeal: theme.colors.brandTeal?.[6] || '#0e839e',
      brandOrange: theme.colors.brandOrange?.[6] || '#f76800',
      brandRoyalBlue: theme.colors.brandRoyalBlue?.[6] || '#4a51ab',
      brandYellow: theme.colors.brandYellow?.[6] || '#ffcf02',
      brandForestGreen: theme.colors.brandForestGreen?.[6] || '#639e0a',
      brandEmeraldMint: theme.colors.brandEmeraldMint?.[6] || '#12b886',
      brandDeepRed: theme.colors.brandDeepRed?.[6] || '#a03250',
    };
    return paletteColors[colorName];
  };

  const resolveColor = (color?: GaugePaletteColor | string): string => {
    if (!color || color === 'brand') return theme.colors.brand?.[6] || '#de1743';
    if (color.startsWith('#') || color.startsWith('rgb')) return color;

    // Shade notation like "brandTeal[3]"
    const shadeMatch = color.match(/^([a-zA-Z]+)\[(\d)\]$/);
    if (shadeMatch) {
      const [, colorName, shadeStr] = shadeMatch;
      const shade = parseInt(shadeStr, 10);
      const scale = (theme.colors as Record<string, readonly string[] | undefined>)[colorName];
      if (Array.isArray(scale) && shade >= 0 && shade <= 9) return scale[shade];
    }

    return getPaletteColor(color as GaugePaletteColor);
  };

  if (!items || items.length === 0) return null;

  let alignClass = '';
  if (items.length === 1) {
    if (align === 'center') alignClass = classes.alignCenter;
    else if (align === 'right') alignClass = classes.alignRight;
    else alignClass = classes.alignLeft;
  }

  return (
    <section className={classes.gaugeSection}>
      <Container size="md">
        <div className={alignClass}>
          <div className={classes.sectionLabel}>{label}</div>
          <div className={classes.grid}>
            {items.map((item, index) => {
              const color = resolveColor(item.color);
              const max = item.max && item.max > 0 ? item.max : 100;
              const suffix = item.suffix ?? '%';
              const fraction = Math.max(0, Math.min(1, item.value / max));
              const [needleX, needleY] = (() => {
                const angle = (180 + fraction * 180) * (Math.PI / 180);
                return [CX + NEEDLE_R * Math.cos(angle), CY + NEEDLE_R * Math.sin(angle)];
              })();

              return (
                <div key={index} className={classes.card} style={{ borderTopColor: color }}>
                  <svg
                    className={classes.dial}
                    viewBox="0 10 200 114"
                    role="img"
                    aria-label={`${item.title}: ${item.value}${suffix}`}
                  >
                    <path className={classes.track} d={arcPath(0, 1)} />
                    <path className={classes.value} style={{ stroke: color }} d={arcPath(0, fraction)} />
                    <line
                      className={classes.needle}
                      style={{ stroke: color }}
                      x1={CX}
                      y1={CY}
                      x2={needleX.toFixed(2)}
                      y2={needleY.toFixed(2)}
                    />
                    <circle className={classes.hub} style={{ fill: color }} cx={CX} cy={CY} r={5.5} />
                    <text className={classes.tick} x="16" y="118">0</text>
                    <text className={classes.tick} x="184" y="118" textAnchor="end">{max}</text>
                  </svg>

                  <div className={classes.value_num} style={{ color }}>
                    {item.value.toLocaleString('cs-CZ')}
                    <span className={classes.suffix}>{suffix}</span>
                  </div>

                  <div className={classes.caption}>
                    <strong>{item.title}</strong>
                    {item.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Gauge;

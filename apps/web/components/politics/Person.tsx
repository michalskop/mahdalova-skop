'use client';

import { useMantineTheme } from '@mantine/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PartyFace } from './PartyFace';

// A `Person` is an inline, highlighted name in the article body that reveals a
// short "medailonek" (who they are + how they relate to the event) on hover or
// tap. It never links out – all the information lives in the card itself.
//
// Data lives in a single `osobnosti.json` next to the article and is injected
// into `mdxSource.scope.personsData` by lib/articles.ts, so the markdown only
// carries the id and the display text:  <Person id="foldyna">Jaroslav Foldyna</Person>
// Inline props (name/role/bio/…) override the data-file entry when present.
//
// The card is a self-contained, absolutely-positioned layer (no portal / no
// floating-ui) so it renders reliably inside serialised MDX on every device.

export interface PersonInfo {
  /** Full name shown as the medailonek heading. */
  name?: string;
  /** Current role – one short line under the name. */
  role?: string;
  /** One–two sentences: who they are + relevant tie to the event. */
  bio?: string;
  /** PartyFace preset key (SPD, KSČM, …) – shows a party badge when it matches. */
  party?: string;
  /** Ideové zařazení / prostředí – small tag above the name. */
  proud?: string;
  /** Summary of their appearances at the event ("doložen 2019 a 2024"). */
  pricovy?: string;
}

interface PersonProps extends PersonInfo {
  /** Key into the injected osobnosti.json map. */
  id?: string;
  /** Display text for the inline name (defaults to `name`). */
  children?: React.ReactNode;
  /** Injected by ArticleRenderer from mdxSource.scope.personsData. */
  data?: Record<string, PersonInfo>;
}

export function Person({ id, children, data, ...inline }: PersonProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLSpanElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromData = (id && data?.[id]) || {};
  const info: PersonInfo = { ...fromData, ...stripUndefined(inline) };
  const label = children ?? info.name ?? id ?? '';

  const hasCard = Boolean(info.name || info.role || info.bio || info.pricovy);

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpened(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpened(false), 140);
  };

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!opened) return;
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpened(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpened(false);
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [opened]);

  // Keep the card inside the viewport horizontally. Converges in one–two frames.
  useLayoutEffect(() => {
    if (!opened) {
      if (shift !== 0) setShift(0);
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    let delta = 0;
    if (rect.left < margin) delta = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) delta = window.innerWidth - margin - rect.right;
    if (Math.abs(delta) > 0.5) setShift((prev) => prev + delta);
  }, [opened, shift]);

  if (!hasCard) return <>{label}</>;

  const accent = theme.colors.brand[6];
  const navy = theme.colors.brandNavy?.[8] ?? theme.colors.dark[8];
  const border = theme.colors.background[6];

  return (
    <span
      ref={wrapRef as React.RefObject<HTMLSpanElement>}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <span
        role="button"
        tabIndex={0}
        aria-expanded={opened}
        onFocus={open}
        onClick={() => setOpened((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpened((v) => !v);
          }
        }}
        style={{
          cursor: 'help',
          fontWeight: 600,
          color: navy,
          borderBottom: `2px dotted ${accent}`,
        }}
      >
        {label}
      </span>

      {opened ? (
        <span
          role="dialog"
          ref={cardRef}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: `translateX(calc(-50% + ${shift}px))`,
            paddingBottom: 8, // transparent bridge so hover survives the gap
            width: 'min(330px, 88vw)',
            zIndex: 200,
            cursor: 'default',
            textAlign: 'left',
            fontWeight: 400,
          }}
        >
          <span
            style={{
              display: 'block',
              background: theme.white,
              border: `1px solid ${border}`,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 28px rgba(16, 20, 50, 0.18)',
            }}
          >
            <span
              style={{
                display: 'block',
                padding: '11px 14px 8px',
                background: theme.colors.background[2],
                borderBottom: `1px solid ${border}`,
              }}
            >
              {info.proud ? (
                <span
                  style={{
                    display: 'block',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: accent,
                    marginBottom: 3,
                  }}
                >
                  {info.proud}
                </span>
              ) : null}
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {info.party ? <PartyFace party={info.party} size={26} /> : null}
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2, color: navy }}>
                  {info.name}
                </span>
              </span>
              {info.role ? (
                <span
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    color: theme.colors.gray[7],
                    marginTop: 3,
                    lineHeight: 1.35,
                  }}
                >
                  {info.role}
                </span>
              ) : null}
            </span>

            <span style={{ display: 'block', padding: '10px 14px 12px' }}>
              {info.bio ? (
                <span
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: theme.colors.dark[7],
                  }}
                >
                  {info.bio}
                </span>
              ) : null}
              {info.pricovy ? (
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: theme.colors.gray[7],
                    marginTop: info.bio ? 8 : 0,
                  }}
                >
                  <span style={{ fontWeight: 700, color: navy }}>V Příčovech: </span>
                  {info.pricovy}
                </span>
              ) : null}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k in obj) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export default Person;

'use client';

import {
  Anchor,
  Box,
  Card,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import { CircleFlag } from 'react-circle-flags';
import { CSSProperties, useMemo, useState } from 'react';
import type { TimelineCategory, TimelineContent, TimelineEvent, TimelineFacetGroup } from '@/types/timeline';

type TimelineProps = {
  content: TimelineContent;
  className?: string;
  slug?: string;
};

function getAssetPath(src: string, slug?: string) {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }
  return slug ? `/a/_articles/${slug}/${src}` : src;
}

function getCategoryMeta(categories: TimelineCategory[] | undefined, key: string) {
  return categories?.find((c) => c.key === key);
}

function flattenFacetValues(facetGroups: TimelineFacetGroup[] | undefined) {
  return (facetGroups || []).flatMap((g) => g.values || []);
}

function categoryColorKey(key: string): string {
  return 'brandNavy';
}

function isThemeColorKey(theme: ReturnType<typeof useMantineTheme>, key: string) {
  return Boolean((theme.colors as Record<string, unknown>)[key]);
}

function parseThemeColorSpec(theme: ReturnType<typeof useMantineTheme>, spec: string) {
  const m = /^([A-Za-z0-9_-]+)\.(\d)$/.exec(spec);
  if (!m) return null;
  const key = m[1];
  const shade = Number(m[2]);
  if (!Number.isFinite(shade)) return null;
  if (!isThemeColorKey(theme, key)) return null;
  if (shade < 0 || shade > 9) return null;
  return { key, shade };
}

function resolveCategoryColors(
  theme: ReturnType<typeof useMantineTheme>,
  categories: TimelineCategory[] | undefined,
  key: string
) {
  const meta = getCategoryMeta(categories, key);
  const spec = meta?.color;

  const fromThemeKey = (themeKey: string, shade?: number) => {
    const s = typeof shade === 'number' ? Math.max(0, Math.min(9, shade)) : 6;
    const strong = theme.colors[themeKey]?.[s] || theme.colors.brand[6];
    const light = theme.colors[themeKey]?.[Math.max(0, s - 3)] || theme.colors.gray[3];
    const grad0 = theme.colors[themeKey]?.[s] || theme.colors.brand[6];
    const grad1 = theme.colors[themeKey]?.[Math.min(9, s + 2)] || theme.colors.brand[8];
    return { strong, light, grad0, grad1 };
  };

  const fromCss = (cssColor: string) => {
    const strong = cssColor;
    const light = `color-mix(in srgb, ${cssColor} 35%, white)`;
    const grad0 = cssColor;
    const grad1 = `color-mix(in srgb, ${cssColor} 70%, black)`;
    return { strong, light, grad0, grad1 };
  };

  if (spec) {
    const parsed = parseThemeColorSpec(theme, spec);
    if (parsed) return fromThemeKey(parsed.key, parsed.shade);
  }

  if (spec && isThemeColorKey(theme, spec)) return fromThemeKey(spec);
  if (spec) return fromCss(spec);

  const fallbackKey = categoryColorKey(key);
  if (isThemeColorKey(theme, fallbackKey)) return fromThemeKey(fallbackKey);
  return fromThemeKey('brandNavy');
}

function eventPrimaryCategory(event: TimelineEvent): string {
  return event.facets?.topic || Object.values(event.facets || {})[0] || 'default';
}

function eventMatchesFacets(event: TimelineEvent, activeFacets: Record<string, string | null>) {
  const facets = event.facets || {};
  for (const [facetKey, selected] of Object.entries(activeFacets)) {
    if (!selected) continue;
    if (facets[facetKey] !== selected) return false;
  }
  return true;
}

function defaultLabelForKey(key: string) {
  return key;
}

function labelForCategoryKey(categories: TimelineCategory[] | undefined, key: string) {
  return getCategoryMeta(categories, key)?.label || defaultLabelForKey(key);
}

export default function Timeline({ content, className, slug }: TimelineProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 700px)');

  const facetGroups: TimelineFacetGroup[] = content.facetGroups || [];
  const categories: TimelineCategory[] = useMemo(() => flattenFacetValues(facetGroups), [facetGroups]);
  const events: TimelineEvent[] = content.events || [];

  const activeFacetsInitial = useMemo(() => {
    const init: Record<string, string | null> = {};
    (content.facetGroups || []).forEach((g) => {
      init[g.key] = null;
    });
    return init;
  }, [content.facetGroups]);

  const [activeFacets, setActiveFacets] = useState<Record<string, string | null>>(activeFacetsInitial);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  const collapsedByDefault = useMemo(() => new Set<number>(content.collapsedYears || [2024]), [content]);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(collapsedByDefault);

  const grouped = useMemo(() => {
    const yearMap = new Map<number, TimelineEvent[]>();
    const noYear: TimelineEvent[] = [];

    for (const e of events) {
      const y = e.year;
      if (typeof y === 'number' && Number.isFinite(y)) {
        const arr = yearMap.get(y) || [];
        arr.push(e);
        yearMap.set(y, arr);
      } else {
        noYear.push(e);
      }
    }

    const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
    const sections = years.map((y) => {
      const yearEvents = (yearMap.get(y) || []).slice().sort((a, b) => {
        const ma = typeof a.month === 'number' ? a.month : 0;
        const mb = typeof b.month === 'number' ? b.month : 0;
        return ma - mb;
      });
      return { year: y, events: yearEvents };
    });

    return { sections, noYear };
  }, [events]);

  const openEvent = (e: TimelineEvent) => {
    setSelected(e);
    setOpened(true);
  };

  const toggleFacet = (facetKey: string, valueKey: string) => {
    setActiveFacets((prev) => {
      const current = prev[facetKey] || null;
      const next = current === valueKey ? null : valueKey;
      return { ...prev, [facetKey]: next };
    });
  };

  const toggleYear = (year: number) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const borderColor = theme.colors.background?.[5] || theme.colors.gray[2];
  const lineColor = theme.colors.background?.[9] || theme.colors.gray[4];

  const renderLegendDot = (key: string, active: boolean, hasFilter: boolean, flag?: string) => {
    if (flag) {
      return (
        <Box
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hasFilter && !active ? 0.6 : 1,
            transition: 'opacity 120ms ease',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          <CircleFlag
            countryCode={flag.toLowerCase()}
            height={12}
            width={12}
            style={{ display: 'block' }}
          />
        </Box>
      );
    }

    const { strong, light } = resolveCategoryColors(theme, categories, key);

    return (
      <Box
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: hasFilter && !active ? light : strong,
          transition: 'background 120ms ease',
        }}
      />
    );
  };

  return (
    <Box className={className} style={{ position: 'relative' }}>
      <Card withBorder radius={0} p="xl" style={{ background: theme.white, borderColor: borderColor }}>
        <Stack gap={4} align="center">
          <Title order={2} style={{ color: theme.colors.brandNavy?.[9] || theme.colors.dark[9] }}>
            {content.title || ''}
          </Title>
          {content.subtitle ? (
            <Text c="dimmed" size="sm" ta="center">
              {content.subtitle}
            </Text>
          ) : null}
          {content.lastUpdated ? (
            <Text
              size="xs"
              style={{ color: theme.colors.brandRoyalBlue?.[3] || theme.colors.brandNavy?.[3] || theme.colors.gray[6] }}
            >
              {content.lastUpdated}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <Box
        style={{
          background: theme.white,
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 'var(--app-shell-header-offset, var(--app-shell-header-height, 60px))',
          zIndex: 50,
          padding: '0.75rem 1rem',
        }}
      >
        <Group justify="center" gap={8} wrap="wrap" maw={900} mx="auto">
          {facetGroups.flatMap((group) => {
            const selected = activeFacets[group.key];
            const hasSelection = Boolean(selected);

            const valuesInEvents = new Set<string>();
            events.forEach((e) => {
              const v = e.facets?.[group.key];
              if (v) valuesInEvents.add(v);
            });

            const availableValues = group.values.filter((v) => valuesInEvents.has(v.key));
            return availableValues.map((f) => {
              const active = selected === f.key;
              return (
                <UnstyledButton
                  key={`${group.key}:${f.key}`}
                  onClick={() => toggleFacet(group.key, f.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: theme.colors.brandNavy?.[9] || theme.black,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: 999,
                    transition: 'background 120ms ease, opacity 120ms ease',
                    background: active ? 'rgba(16, 20, 50, 0.10)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    opacity: hasSelection && !active ? 0.5 : 1,
                  }}
                >
                  {renderLegendDot(f.key, active, hasSelection, f.flag)}
                  <span>{f.label}</span>
                </UnstyledButton>
              );
            });
          })}
        </Group>
      </Box>

      <Box maw={900} mx="auto" style={{ position: 'relative', padding: '2rem 1rem' }}>
        <Box
          style={{
            position: 'absolute',
            left: isMobile ? 20 : '50%',
            top: 0,
            bottom: 0,
            width: 2,
            transform: isMobile ? 'none' : 'translateX(-50%)',
            background: lineColor,
          }}
        />

        {grouped.noYear.length ? (
          <Box>
            {grouped.noYear.map((e, idx) => {
              const catKey = eventPrimaryCategory(e);
              const accent = resolveCategoryColors(theme, categories, catKey).strong;
              const meta = getCategoryMeta(categories, catKey);
              const match = eventMatchesFacets(e, activeFacets);
              const side = idx % 2 === 0 ? 'left' : 'right';

              if (!match) return null;

              const isLeft = !isMobile && side === 'left';
              const width = isMobile ? 'calc(100% - 50px)' : 'calc(50% - 35px)';

              const cardStyle: CSSProperties = {
                background: theme.white,
                borderRadius: 8,
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
                boxShadow: '0 1px 3px rgba(16, 20, 50, 0.06)',
                border: `1px solid ${borderColor}`,
                ...(isMobile
                  ? { borderLeft: `4px solid ${accent}` }
                  : isLeft
                    ? { borderRight: `4px solid ${accent}` }
                    : { borderLeft: `4px solid ${accent}` }),
              };

              return (
                <Box
                  key={e.id || `${e.title}-${idx}`}
                  style={{
                    position: 'relative',
                    width,
                    marginBottom: isMobile ? '0.75rem' : -8,
                    marginLeft: isMobile ? 50 : isLeft ? 0 : 'auto',
                    marginRight: isMobile ? 0 : isLeft ? 'auto' : 0,
                    paddingLeft: isMobile ? 20 : 0,
                  }}
                >
                  <Box
                    style={{
                      position: 'absolute',
                      top: 18,
                      height: 2,
                      width: isMobile ? 20 : 28,
                      background: accent,
                      left: isMobile ? 0 : isLeft ? 'auto' : -28,
                      right: isMobile ? 'auto' : isLeft ? -28 : 'auto',
                    }}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      top: 12,
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: accent,
                      left: isMobile ? -7 : isLeft ? 'auto' : -42,
                      right: isMobile ? 'auto' : isLeft ? -42 : 'auto',
                    }}
                  />

                  <Box
                    style={cardStyle}
                    onClick={() => openEvent(e)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') openEvent(e);
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <Text
                      size="xs"
                      fw={600}
                      tt="uppercase"
                      style={{ letterSpacing: '0.02em', color: theme.colors.gray[6] }}
                      mb={2}
                    >
                      {e.date}
                    </Text>
                    <Text fw={600} style={{ fontSize: 15, lineHeight: 1.3 }}>
                      {e.title}
                    </Text>
                    {e.summary ? (
                      <Text size="sm" mt={4} style={{ color: theme.colors.gray[7], lineHeight: 1.45 }}>
                        {e.summary}
                      </Text>
                    ) : null}
                    {e.persons?.length ? (
                      <Box style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${borderColor}` }}>
                        <Text size="sm" style={{ fontSize: 12, color: theme.colors.gray[7] }}>
                          <strong style={{ color: theme.colors.gray[9] }}>
                            {e.persons.map((p) => p.name).join(', ')}
                          </strong>
                        </Text>
                      </Box>
                    ) : null}
                    <Box style={{ display: 'none' }}>{meta?.emoji}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : null}

        {grouped.sections.map((section) => {
          const isCollapsed = collapsedYears.has(section.year);
          const icon = isCollapsed ? '▼' : '▲';

          return (
            <Box key={section.year} style={{ position: 'relative', marginBottom: 16 }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <UnstyledButton
                  onClick={() => toggleYear(section.year)}
                  style={{
                    background: theme.colors.brandNavy?.[9] || theme.colors.dark[9],
                    color: theme.white,
                    padding: '8px 24px',
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 700,
                    transition: 'background 120ms ease',
                  }}
                >
                  {section.year} <span style={{ marginLeft: 8, fontSize: 12 }}>{icon}</span>
                </UnstyledButton>
              </Box>

              {isCollapsed ? null : (
                <Box style={{ position: 'relative' }}>
                  {section.events.map((e, idx) => {
                    const catKey = eventPrimaryCategory(e);
                    const accent = resolveCategoryColors(theme, categories, catKey).strong;
                    const meta = getCategoryMeta(categories, catKey);

                    if (!eventMatchesFacets(e, activeFacets)) return null;

                    const side = idx % 2 === 0 ? 'left' : 'right';
                    const isLeft = !isMobile && side === 'left';
                    const width = isMobile ? 'calc(100% - 50px)' : 'calc(50% - 35px)';

                    const cardStyle: CSSProperties = {
                      background: theme.white,
                      borderRadius: 8,
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      transition: 'transform 120ms ease, box-shadow 120ms ease',
                      boxShadow: '0 1px 3px rgba(16, 20, 50, 0.06)',
                      border: `1px solid ${borderColor}`,
                      ...(isMobile
                        ? { borderLeft: `4px solid ${accent}` }
                        : isLeft
                          ? { borderRight: `4px solid ${accent}` }
                          : { borderLeft: `4px solid ${accent}` }),
                    };

                    return (
                      <Box
                        key={e.id || `${e.title}-${section.year}-${idx}`}
                        style={{
                          position: 'relative',
                          width,
                          marginBottom: isMobile ? '0.75rem' : -8,
                          marginLeft: isMobile ? 50 : isLeft ? 0 : 'auto',
                          marginRight: isMobile ? 0 : isLeft ? 'auto' : 0,
                          paddingLeft: isMobile ? 20 : 0,
                        }}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            top: 18,
                            height: 2,
                            width: isMobile ? 20 : 28,
                            background: accent,
                            left: isMobile ? 0 : isLeft ? 'auto' : -28,
                            right: isMobile ? 'auto' : isLeft ? -28 : 'auto',
                          }}
                        />
                        <Box
                          style={{
                            position: 'absolute',
                            top: 12,
                            width: 14,
                            height: 14,
                            borderRadius: 999,
                            background: accent,
                            left: isMobile ? -7 : isLeft ? 'auto' : -42,
                            right: isMobile ? 'auto' : isLeft ? -42 : 'auto',
                          }}
                        />

                        <Box
                          style={cardStyle}
                          onClick={() => openEvent(e)}
                          onKeyDown={(ev) => {
                            if (ev.key === 'Enter' || ev.key === ' ') openEvent(e);
                          }}
                          tabIndex={0}
                          role="button"
                        >
                          <Text
                            size="xs"
                            fw={600}
                            tt="uppercase"
                            style={{
                              letterSpacing: '0.02em',
                              color: theme.colors.gray[6],
                              marginBottom: 2,
                            }}
                          >
                            {e.date}
                          </Text>
                          <Text fw={600} style={{ fontSize: 15, lineHeight: 1.3 }}>
                            {e.title}
                          </Text>
                          {e.summary ? (
                            <Text
                              size="sm"
                              mt={4}
                              style={{
                                color: theme.colors.gray[7],
                                lineHeight: 1.45,
                              }}
                            >
                              {e.summary}
                            </Text>
                          ) : null}
                          {e.persons?.length ? (
                            <Box style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${borderColor}` }}>
                              <Text size="sm" style={{ fontSize: 12, color: theme.colors.gray[7] }}>
                                <strong style={{ color: theme.colors.gray[9] }}>
                                  {e.persons.map((p) => p.name).join(', ')}
                                </strong>
                              </Text>
                            </Box>
                          ) : null}
                          <Box style={{ display: 'none' }}>{meta?.emoji}</Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="lg"
        radius="md"
        title={null}
        centered
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.4, blur: 0 }}
        padding={0}
        styles={{ content: { overflow: 'hidden' } }}
      >
        {selected ? (
          <Box>
            {(() => {
              const catKey = eventPrimaryCategory(selected);
              const { grad0: c0, grad1: c1 } = resolveCategoryColors(theme, categories, catKey);
              return (
                <Box
                  style={{
                    padding: '1.25rem 1.5rem',
                    position: 'relative',
                    color: theme.white,
                    background: `linear-gradient(135deg, ${c0} 0%, ${c1} 100%)`,
                    borderTopLeftRadius: theme.radius.md,
                    borderTopRightRadius: theme.radius.md,
                  }}
                >
                  <UnstyledButton
                    onClick={() => setOpened(false)}
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.2)',
                      color: theme.white,
                      fontSize: 22,
                      lineHeight: '32px',
                      textAlign: 'center',
                    }}
                  >
                    ×
                  </UnstyledButton>

                  <Text style={{ fontSize: 32, marginBottom: 6 }}>{selected.emoji || '📌'}</Text>
                  <Title order={3} style={{ margin: 0, fontWeight: 600, color: theme.white }}>
                    {selected.title}
                  </Title>
                  <Text
                    mt={8}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 13,
                    }}
                  >
                    {selected.date}
                  </Text>
                </Box>
              );
            })()}

            <Box style={{ padding: '1.25rem 1.5rem' }}>
              <Box style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: theme.colors.brandNavy?.[6] || theme.colors.gray[6],
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Kategorie
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.brandNavy?.[9] || theme.black }}>
                  {labelForCategoryKey(categories, eventPrimaryCategory(selected))}
                </Text>
              </Box>

              <Box style={{ marginBottom: selected.persons?.length ? 16 : 0 }}>
                <Text
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: theme.colors.brandNavy?.[6] || theme.colors.gray[6],
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Co se stalo
                </Text>
                {selected.description ? (
                  <Text
                    style={{ fontSize: 14, lineHeight: 1.5, color: theme.colors.brandNavy?.[9] || theme.black }}
                    dangerouslySetInnerHTML={{ __html: selected.description }}
                  />
                ) : (
                  <Text style={{ fontSize: 14, lineHeight: 1.5, color: theme.colors.brandNavy?.[9] || theme.black }}>
                    {selected.summary || ''}
                  </Text>
                )}
              </Box>

              {selected.persons?.length ? (
                <Box style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${borderColor}` }}>
                  <Text
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: theme.colors.brandNavy?.[6] || theme.colors.gray[6],
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Klíčové osoby
                  </Text>

                  <Stack gap={8}>
                    {selected.persons.map((p) => (
                      <Box
                        key={p.name}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: 12,
                          background: theme.colors.background?.[2] || theme.colors.gray[0],
                          borderRadius: 8,
                        }}
                      >
                        <Center
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            background: theme.colors.background?.[1] || theme.white,
                            flexShrink: 0,
                            fontSize: 18,
                          }}
                        >
                          👤
                        </Center>
                        <Box style={{ flex: 1 }}>
                          <Text fw={600} style={{ fontSize: 14, color: theme.colors.brandNavy?.[9] || theme.black }}>
                            {p.name}
                          </Text>
                          {p.bio ? (
                            <Text style={{ fontSize: 13, lineHeight: 1.4, color: theme.colors.brandNavy?.[6] || theme.colors.gray[7] }}>
                              {p.bio}
                            </Text>
                          ) : null}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {selected.thumb ? (
                <Box mt="md" style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                  <Image
                    src={getAssetPath(selected.thumb, slug)}
                    alt={selected.title}
                    width={1100}
                    height={700}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>
              ) : null}

              {selected.link && selected.linkText ? (
                <Group justify="flex-end" mt="md">
                  <Anchor
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.colors.brandRoyalBlue?.[6] || theme.colors.blue[6],
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    → {selected.linkText}
                  </Anchor>
                </Group>
              ) : null}
            </Box>
          </Box>
        ) : null}
      </Modal>
    </Box>
  );
}

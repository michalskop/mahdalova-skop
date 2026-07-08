'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3geo from 'd3-geo';
import * as d3proj from 'd3-geo-projection';
import * as topojson from 'topojson-client';
import tripsData from './data.json';
import ChartSignature from '../ChartSignature';

type Trip = {
  p: 'Z' | 'P';
  c: string;
  d0: string;
  yr: number;
  di: number;
  cd: number;
  z: string;
  m: string;
  lat: number;
  lon: number;
  t: string;
};

const TRIPS = tripsData as Trip[];

const ALIASES: Record<string, string[]> = {
  'Slovensko': ['Slovakia'], 'Rakousko': ['Austria'], 'Polsko': ['Poland'], 'Německo': ['Germany'],
  'Chorvatsko': ['Croatia'], 'Belgie': ['Belgium'], 'Izrael': ['Israel'], 'Ukrajina': ['Ukraine'],
  'Afghánistán': ['Afghanistan'], 'Rusko': ['Russia'], 'Francie': ['France'], 'Srbsko': ['Serbia'],
  'Slovinsko': ['Slovenia'], 'Rumunsko': ['Romania'], 'Moldavsko': ['Moldova'], 'Maďarsko': ['Hungary'],
  'Spojené království': ['United Kingdom'], 'Itálie': ['Italy'], 'Čína': ['China'], 'Kazachstán': ['Kazakhstan'],
  'Tádžikistán': ['Tajikistan'], 'Jordánsko': ['Jordan'], 'Spojené arabské emiráty': ['United Arab Emirates'],
  'USA': ['United States of America', 'United States'], 'Vatikán': ['Vatican', 'Holy See'], 'Lotyšsko': ['Latvia'],
  'Ázerbájdžán': ['Azerbaijan'], 'Arménie': ['Armenia'], 'Severní Makedonie': ['North Macedonia', 'Macedonia'],
  'Mongolsko': ['Mongolia'], 'Brazílie': ['Brazil'], 'Řecko': ['Greece'], 'Portugalsko': ['Portugal'],
  'Vietnam': ['Vietnam'], 'Španělsko': ['Spain'], 'Lucembursko': ['Luxembourg'], 'Rwanda': ['Rwanda'],
  'Švýcarsko': ['Switzerland'], 'Albánie': ['Albania'], 'Austrálie': ['Australia'], 'Nový Zéland': ['New Zealand'],
  'Saúdská Arábie': ['Saudi Arabia'], 'Černá Hora': ['Montenegro'], 'Bosna a Hercegovina': ['Bosnia and Herz.', 'Bosnia and Herzegovina'],
  'Mauritánie': ['Mauritania'], 'Ghana': ['Ghana'], 'Nizozemsko': ['Netherlands'], 'Japonsko': ['Japan'],
  'Indie': ['India'], 'Turecko': ['Turkey', 'Türkiye'], 'Dánsko': ['Denmark'], 'Island': ['Iceland'], 'Katar': ['Qatar'],
  'Litva': ['Lithuania'], 'Argentina': ['Argentina'], 'Chile': ['Chile'], 'Estonsko': ['Estonia'],
};

const COLORS = { Z: '#DE1743', P: '#6267A3' };
const TINT = { Z: '#F2BEC5', P: '#D3D2DD' };
const LAND_BASE = '#E4DCC8';
const LAND_BORDER = '#B5A986';
const OCEAN = '#F8F6F0';

const ZEMAN_MAX_DI = Math.max(...TRIPS.filter(d => d.p === 'Z').map(d => d.di));
const PAVEL_MAX_DI = Math.max(...TRIPS.filter(d => d.p === 'P').map(d => d.di));

function matchName(featureName: string, czech: string): boolean {
  const aliases = ALIASES[czech] || [];
  const fn = featureName.toLowerCase();
  for (const a0 of aliases) {
    const a = a0.toLowerCase();
    if (fn === a || fn.indexOf(a) !== -1 || a.indexOf(fn) !== -1) return true;
  }
  return false;
}

function formatCzDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function tripTooltip(t: Trip): string {
  const president = t.p === 'Z' ? 'Zeman' : 'Pavel';
  const place = t.m ? `${t.z} (${t.m})` : t.z;
  return `${president} · ${formatCzDate(t.d0)} · ${place} · ${t.t}`;
}

type HoverInfo = { text: string; left: number; top: number } | null;

function mandateLabel(days: number): string {
  const years = Math.floor(days / 365.25);
  const months = Math.round((days - years * 365.25) / 30.44);
  if (years <= 0) return `${months}. měsíc mandátu`;
  return `${years}. rok, ${months}. měsíc mandátu`;
}

interface HalfMapProps {
  president: 'Z' | 'P';
  label: string;
  years: string;
  countries: unknown[];
  path: d3geo.GeoPath;
  height: number;
  width: number;
  visible: Trip[];
  frozen: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onHover: (info: HoverInfo) => void;
}

function HalfMap({ president, label, years, countries, path, height, width, visible, frozen, containerRef, onHover }: HalfMapProps) {
  const visited = useMemo(() => new Set(visible.map(d => d.z)), [visible]);
  function showTip(e: React.MouseEvent, text: string) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    onHover({ text, left: rect.left - box.left + rect.width / 2, top: rect.top - box.top });
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: COLORS[president], padding: '6px 12px', borderRadius: '4px 4px 0 0',
      }}>
        <span style={{ fontFamily: 'var(--font-roboto-slab), Georgia, serif', fontWeight: 700, fontSize: 13, color: '#fdfbf7', letterSpacing: '0.02em' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 11, color: '#fdfbf7', opacity: 0.85 }}>
          {years}{frozen ? ' · mandát dosud běží' : ''}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block', background: OCEAN }}>
          <g>
            {(countries as Array<{ properties: { name: string }; d: string | null }>).map((feat, i) => {
              const czech = Array.from(visited).find(z => matchName(feat.properties.name, z));
              const d = feat.d;
              if (!d) return null;
              const countryTrips = czech ? visible.filter(t => t.z === czech) : [];
              const countryTip = czech
                ? `${czech} · ${countryTrips.length} ${countryTrips.length === 1 ? 'návštěva' : countryTrips.length < 5 ? 'návštěvy' : 'návštěv'}`
                : null;
              return (
                <path
                  key={i}
                  d={d}
                  fill={czech ? TINT[president] : LAND_BASE}
                  stroke={czech ? COLORS[president] : LAND_BORDER}
                  strokeWidth={czech ? 1.1 : 0.6}
                  onMouseEnter={countryTip ? (e => showTip(e, countryTip)) : undefined}
                  onMouseLeave={countryTip ? (() => onHover(null)) : undefined}
                  style={{ cursor: countryTip ? 'pointer' : 'default' }}
                />
              );
            })}
          </g>
          <g>
            {visible.map((d, i) => {
              const p = path.projection<d3geo.GeoProjection>()([d.lon, d.lat]);
              if (!p) return null;
              return (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={4.5}
                  fill={COLORS[president]}
                  fillOpacity={0.95}
                  stroke={OCEAN}
                  strokeWidth={1}
                  onMouseEnter={e => showTip(e, tripTooltip(d))}
                  onMouseLeave={() => onHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)' }}>
          <ChartSignature size={18} />
        </div>
      </div>
    </div>
  );
}

export default function PresidentialTripsMap() {
  const [value, setValue] = useState(ZEMAN_MAX_DI);
  const [playing, setPlaying] = useState(false);
  const [world, setWorld] = useState<{ objects: { countries: unknown } } | null>(null);
  const [hover, setHover] = useState<HoverInfo>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/dpbp/data/world-countries-110m.json')
      .then(r => r.json())
      .then(w => { if (!cancelled) setWorld(w); });
    return () => { cancelled = true; };
  }, []);

  const maxValue = ZEMAN_MAX_DI;

  useEffect(() => {
    if (!playing) return;
    const step = Math.max(1, Math.round(maxValue / 140));
    const id = setInterval(() => {
      setValue(v => {
        const next = v + step;
        if (next >= maxValue) { setPlaying(false); return maxValue; }
        return next;
      });
    }, 70);
    return () => clearInterval(id);
  }, [playing, maxValue]);

  const width = 680;
  const { path, height } = useMemo(() => {
    const scale = 135;
    const projection = d3proj.geoRobinson().scale(scale).translate([width / 2, 0]);
    const top = projection([0, 72])![1];
    const bottom = projection([0, -50])![1];
    projection.translate([width / 2, -top]);
    return { path: d3geo.geoPath(projection as d3geo.GeoProjection), height: bottom - top };
  }, []);

  const countries = useMemo(() => {
    if (!world) return [];
    const feats = topojson.feature(world as never, (world as { objects: { countries: unknown } }).objects.countries as never) as unknown as { features: Array<{ properties: { name: string } }> };
    return feats.features.map(f => ({ ...f, d: path(f as never) }));
  }, [world, path]);

  const visibleZ = useMemo(() => TRIPS.filter(d => d.p === 'Z' && d.di <= value), [value]);
  const visibleP = useMemo(() => TRIPS.filter(d => d.p === 'P' && d.di <= value), [value]);

  const frozenP = value > PAVEL_MAX_DI;
  const label = mandateLabel(value);

  return (
    <div style={{ margin: '24px 0', background: '#F8F6F0', padding: '18px 16px', borderRadius: 4 }}>
      <div
        style={{
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 20, fontWeight: 700,
          color: '#101432', lineHeight: 1.25, marginBottom: 2,
        }}
      >
        Zahraniční cesty prezidentů Zemana a Pavla
      </div>
      <div
        style={{
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 13, color: '#666', marginBottom: 14,
        }}
      >
        Podle délky mandátu ● Přehrajte stisknutím play
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <HalfMap
          president="Z"
          label="ZEMAN"
          years="2013–23"
          countries={countries}
          path={path}
          height={height}
          width={width}
          visible={visibleZ}
          frozen={false}
          containerRef={containerRef}
          onHover={setHover}
        />
        <HalfMap
          president="P"
          label="PAVEL"
          years="2023–26"
          countries={countries}
          path={path}
          height={height}
          width={width}
          visible={visibleP}
          frozen={frozenP}
          containerRef={containerRef}
          onHover={setHover}
        />
        {hover && (
          <div
            style={{
              position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 8px))',
              background: '#101432', color: '#fdfbf7', padding: '5px 9px', borderRadius: 4, fontSize: 11.5,
              fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            {hover.text}
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #101432',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button
          onClick={() => {
            if (!playing && value >= maxValue) setValue(0);
            setPlaying(p => !p);
          }}
          aria-label={playing ? 'Pozastavit mapu cest' : 'Přehrát mapu cest'}
          style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #c9c2af', background: '#fff', cursor: 'pointer' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={maxValue}
          value={value}
          onChange={e => { setPlaying(false); setValue(Number(e.target.value)); }}
          style={{ flex: 1, accentColor: '#de1743' }}
        />
        <span style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 13, fontWeight: 700, color: '#101432', minWidth: 150, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {label}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', marginTop: 6 }}>
        Srovnání podle počtu dnů od inaugurace, ne podle kalendářního data – Zeman odsloužil obě funkční období v kuse (2013–2023), Pavlův mandát dosud běží.
      </p>
      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 14, color: '#333333', marginTop: 10 }}>
        • autoři: <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>Kateřina Mahdalová &amp; Michal Škop</a> • data: Kancelář prezidenta republiky
      </p>
    </div>
  );
}

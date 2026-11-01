'use client';

// Podkladová mapa OpenStreetMap (zástavba, lesy, voda, silnice, názvy) pod d3 mapami, filtrem ztlumená
// do světlé šedi. Dlaždice se skládají do stejné Mercatorovy projekce, kterou kreslí d3
// (svět = 2π·scale, roh dlaždice 0/0/0 = translate − π·scale), takže sedí i při přiblížení.
// Patří dovnitř <g transform="translate(x,y) scale(k)">, barevné plochy nad ní s mix-blend-mode: multiply.
// (CARTO od 2026 chce API klíč, ZTM ČÚZK je přeplněná kódy a katastrem – viz DESIGN.md.)

import { useId, useMemo } from 'react';

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_MAX_Z = 19;
const tileUrl = (z: number, x: number, y: number) => TILES.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));

export type Zoom = { k: number; x: number; y: number };

export interface OsmPodkladProps {
  scale: number;              // projection.scale() bez přiblížení
  translate: [number, number]; // projection.translate()
  width: number;
  height: number;
  tf?: Zoom;
}

export default function OsmPodklad({ scale, translate, width, height, tf = { k: 1, x: 0, y: 0 } }: OsmPodkladProps) {
  const fid = `osm-podklad${useId().replace(/:/g, '')}`;
  // dlaždice pro viditelný výřez; souřadnice v nepřiblížené soustavě
  const tiles = useMemo(() => {
    const z = Math.max(0, Math.min(TILE_MAX_Z, Math.round(Math.log2((2 * Math.PI * scale * tf.k) / 256))));
    const n = 2 ** z;
    const T = (2 * Math.PI * scale) / n;
    const ox = translate[0] - Math.PI * scale, oy = translate[1] - Math.PI * scale;
    const [x0, x1] = [-tf.x / tf.k, (width - tf.x) / tf.k];
    const [y0, y1] = [-tf.y / tf.k, (height - tf.y) / tf.k];
    const i0 = Math.max(0, Math.floor((x0 - ox) / T)), i1 = Math.min(n - 1, Math.floor((x1 - ox) / T));
    const j0 = Math.max(0, Math.floor((y0 - oy) / T)), j1 = Math.min(n - 1, Math.floor((y1 - oy) / T));
    const out: { key: string; href: string; px: number; py: number; T: number }[] = [];
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) out.push({ key: `${z}/${i}/${j}`, href: tileUrl(z, i, j), px: ox + i * T, py: oy + j * T, T: T + 0.5 / tf.k });
    return out;
  }, [scale, translate, width, height, tf]);

  return (
    <>
      <defs>
        {/* podklad do tlumené šedi s nádechem původních barev */}
        <filter id={fid} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0.3" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.75" intercept="0.25" />
            <feFuncG type="linear" slope="0.75" intercept="0.25" />
            <feFuncB type="linear" slope="0.75" intercept="0.25" />
          </feComponentTransfer>
        </filter>
      </defs>
      <g pointerEvents="none" filter={`url(#${fid})`}>
        {tiles.map((t) => <image key={t.key} href={t.href} x={t.px} y={t.py} width={t.T} height={t.T} preserveAspectRatio="none" />)}
      </g>
    </>
  );
}

export function OsmAttribution({ color }: { color: string }) {
  return (
    <>
      Base map ©&nbsp;<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color }}>OpenStreetMap contributors</a>
    </>
  );
}

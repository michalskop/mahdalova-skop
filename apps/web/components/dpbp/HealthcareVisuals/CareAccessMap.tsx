'use client';

import { useMemo, useState } from 'react';
import mapData from './data/care-access-map.json';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

type Layer = 'distance' | 'age65';
type Feature = (typeof mapData.features)[number];

const distanceColors = ['#edf2f5', '#c8dbe7', '#87afc7', '#477d9f', '#173d5b'];
const ageColors = ['#f4eed7', '#e1cf92', '#c6a84f', '#8e7015', '#554100'];

function color(feature: Feature, layer: Layer) {
  const value = layer === 'distance' ? feature.distanceKm : feature.share65;
  if (value == null) return '#d9d6cf';
  if (layer === 'distance') {
    if (value < 1) return distanceColors[0];
    if (value < 3) return distanceColors[1];
    if (value < 6) return distanceColors[2];
    if (value < 10) return distanceColors[3];
    return distanceColors[4];
  }
  if (value < 15) return ageColors[0];
  if (value < 25) return ageColors[1];
  if (value < 35) return ageColors[2];
  if (value < 45) return ageColors[3];
  return ageColors[4];
}

export default function CareAccessMap() {
  const [layer, setLayer] = useState<Layer>('distance');
  const [hovered, setHovered] = useState<Feature | null>(null);
  const legend = useMemo(() => layer === 'distance'
    ? [['< 1 km', distanceColors[0]], ['1–3', distanceColors[1]], ['3–6', distanceColors[2]], ['6–10', distanceColors[3]], ['10+ km', distanceColors[4]]]
    : [['< 15 %', ageColors[0]], ['15–25', ageColors[1]], ['25–35', ageColors[2]], ['35–45', ageColors[3]], ['45+ %', ageColors[4]]], [layer]);

  return (
    <VisualFrame
      title="Ordinace může být blízko a přesto zranitelná"
      subtitle="Obce podle vzdálenosti k nejbližšímu registrovanému místu praktického lékaře; druhá vrstva ukazuje věk lékařů v příslušném okrese."
      source={<><a href="https://data.gov.cz/datová-sada?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatové-sady%2F00024341%2Faa4c99d9f1480cca59807389cf88d4dc">ÚZIS, NRPZS – místa poskytování</a>; <a href="https://www.nzip.cz/data/2358-pracovnici-pocty-zp-vek-pohlavi-kraj-okres-datovy-souhrn">ÚZIS, věk zdravotníků, stav 31. 12. 2024</a>; geometrie obcí: Index kvality života</>}
    >
      <div className={styles.controls}>
        <button type="button" aria-pressed={layer === 'distance'} onClick={() => setLayer('distance')}>Vzdálenost k ordinaci</button>
        <button type="button" aria-pressed={layer === 'age65'} onClick={() => setLayer('age65')}>Praktici 65+ v okrese</button>
      </div>
      <div className={styles.mapWrap}>
        {hovered && (
          <div className={styles.tooltip}>
            <strong>{hovered.name}</strong><br />
            {hovered.region}, okres {hovered.district ?? 'neuveden'}<br />
            nejbližší registrované místo: <strong>{hovered.distanceKm?.toFixed(1).replace('.', ',')} km</strong><br />
            praktici 65+ v okrese: <strong>{hovered.share65?.toFixed(1).replace('.', ',') ?? 'bez údaje'} %</strong>
          </div>
        )}
        <svg className={styles.mapSvg} viewBox="0 0 1000 520" role="img" aria-label="Mapa obcí Česka podle dostupnosti praktického lékaře">
          {mapData.features.map(feature => (
            <path
              key={feature.code}
              d={feature.path}
              fill={color(feature, layer)}
              tabIndex={0}
              aria-label={`${feature.name}: ${layer === 'distance' ? `${feature.distanceKm} km` : `${feature.share65} procent`}`}
              onPointerEnter={() => setHovered(feature)}
              onFocus={() => setHovered(feature)}
              onPointerLeave={() => setHovered(null)}
              onBlur={() => setHovered(null)}
            />
          ))}
        </svg>
      </div>
      <div className={styles.legend}>
        {legend.map(([label, fill]) => <span key={label}><i className={styles.swatch} style={{ background: fill }} />{label}</span>)}
      </div>
      <div className={styles.note}>
        Mapa zatím neměří dobu jízdy, ordinační hodiny, smlouvu s pojišťovnou ani přijímání nových pacientů. Vzdálenost je počítána vzdušnou čarou ze středu obce. Registr obsahuje místo poskytování, nikoli záruku dostupné kapacity.
      </div>
    </VisualFrame>
  );
}

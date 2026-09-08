"use client";
import { useEffect, useState } from "react";
import { PROJECTIONS, type ProjectionId } from "./geometry";
import styles from "./TrueSizeGame.module.css";

const descriptions: Record<ProjectionId, { text: string; source: string }> = {
  mercator: {
    text: "Země u pólů vypadají mnohem větší, než jsou. Malé tvary a úhly ale zůstávají věrné. Mercator ji navrhl v roce 1569 pro navigaci; dodnes se používá na námořních mapách, protože kurz podle kompasu lze zakreslit přímkou.",
    source: "https://nauticalcharts.noaa.gov/learn/nautical-cartography.html",
  },
  equal: {
    text: "Velikosti zemí jsou ve správném poměru: Afrika už není zmenšená vůči Evropě. Tvary se trochu mění. Equal Earth vznikla v roce 2018 a hodí se na nástěnné mapy i mapy světových dat, kde záleží na porovnání rozloh.",
    source:
      "https://pro.arcgis.com/en/pro-app/3.6/help/mapping/properties/equal-earth.htm",
  },
  peters: {
    text: "Zachovává poměr rozloh, ale země kolem rovníku protahuje a u pólů zplošťuje. Gall ji popsal v roce 1855, Peters později zpopularizoval. Ve výuce pomáhá ukázat skutečné velikosti kontinentů; najdete ji například v irských metodikách zeměpisu.",
    source:
      "https://www.curriculumonline.ie/getmedia/86f7ee50-2437-4327-a7c9-4a03ce7565a1/PSEC03b_Geography_Guidelines.pdf",
  },
  mollweide: {
    text: "Svět se vejde do oválu a rozlohy zůstávají ve správném poměru. U okrajů se země výrazně ohýbají a protahují. Mollweide ji navrhl v roce 1805; používá se pro mapy celosvětových jevů, kde je důležitá velikost zasažených oblastí.",
    source:
      "https://support.esri.com/en-us/gis-dictionary/mollweide-projection",
  },
  robinson: {
    text: "Svět působí vyváženě, ale velikosti ani tvary nejsou úplně přesné. Robinson v roce 1963 hledal přehlednou mapu pro atlasy a nástěnné mapy. Pro své mapy světa ji dříve používal také National Geographic.",
    source:
      "https://pro.arcgis.com/en/pro-app/latest/help/mapping/properties/robinson.htm",
  },
  winkel: {
    text: "Mírně mění velikosti, tvary i vzdálenosti, aby žádné zkreslení příliš nepřevládlo. Winkel ji navrhl v roce 1921. Hodí se pro přehledné mapy celého světa; National Geographic ji používá od roku 1998.",
    source:
      "https://pro.arcgis.com/en/pro-app/3.6/help/mapping/properties/winkel-tripel.htm",
  },
};

export default function ProjectionGuide({
  projectionId,
}: {
  projectionId: ProjectionId;
}) {
  const { text, source } = descriptions[projectionId];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(text.length);
      return;
    }
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const count = Math.min(text.length, Math.floor((now - start) / 4));
      setVisible(count);
      if (count < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text]);
  return (
    <aside className={styles.projectionGuide}>
      <strong>
        {PROJECTIONS.find((item) => item.id === projectionId)?.name}
      </strong>
      <p className={styles.guideText}>
        <span className={styles.guideMeasure} aria-hidden="true">
          {text}
        </span>
        <span className={styles.guideTyped} aria-hidden="true">
          {text.slice(0, visible)}
        </span>
        <span className={styles.srOnly}>{text}</span>
      </p>
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zdroj popisu projekce"
      >
        Zdroj
      </a>
    </aside>
  );
}

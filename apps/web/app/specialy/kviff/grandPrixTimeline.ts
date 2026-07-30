// Mapování vítězů Grand Prix na obsah sdílené časové osy
// (components/common/Timeline, dle KVIFF_WRITING_GUIDE §13). Žádná vlastní
// timeline komponenta – jen data. Rok dáváme do titulku (Timeline by holý
// rok v poli `date` jinak naparsoval jako 1. 1. rok), blok řešíme facetem,
// který v Timeline zároveň barví kartu a nabízí filtr.
import type { TimelineContent, TimelineEvent } from '@/types/timeline';
import type { GrandPrixWinner } from './grandPrix';

const BLOC_FACET_GROUP = {
  key: 'bloc',
  label: 'Blok',
  values: [
    { key: 'socialisticky', label: 'země sovětského bloku', color: 'brandNavy.6' },
    { key: 'ostatni', label: 'ostatní země', color: 'brandTeal.6' },
    { key: 'neudelena', label: 'cena neudělena', color: 'background.8' },
  ],
};

function toEvents(winners: GrandPrixWinner[]): TimelineEvent[] {
  return winners.map((w) => {
    if (!w.awarded) {
      return {
        date: '',
        title: `${w.year} · Hlavní cena neudělena`,
        facets: { bloc: 'neudelena' },
      };
    }
    const orig = w.filmCz !== w.filmOriginal ? ` (${w.filmOriginal})` : '';
    return {
      date: '',
      title: `${w.year} · ${w.filmCz}`,
      summary: `Režie: ${w.directors.join(', ')} · ${w.countries.join(', ')}`,
      description: `${w.filmCz}${orig}. Režie: ${w.directors.join(', ')}. Země: ${w.countries.join(', ')}.`,
      facets: { bloc: w.bloc },
    };
  });
}

export function communistEraTimeline(winners: GrandPrixWinner[]): TimelineContent {
  return {
    title: 'Vítězové Grand Prix 1948–1989',
    subtitle: 'Vítězný film každého soutěžního ročníku; barva karty rozlišuje blok. Klikněte na kartu pro detail, na štítek pro filtr.',
    facetGroups: [BLOC_FACET_GROUP],
    events: toEvents(winners),
  };
}

export function postRevolutionTimeline(winners: GrandPrixWinner[]): TimelineContent {
  return {
    title: 'Vítězové Grand Prix 1990–2025',
    subtitle: 'Vítězný film každého ročníku otevřené mezinárodní soutěže. Klikněte na kartu pro detail.',
    facetGroups: [BLOC_FACET_GROUP],
    events: toEvents(winners),
  };
}

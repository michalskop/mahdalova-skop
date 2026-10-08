// types/timeline.ts

export type TimelineCategoryKey = string;

export interface TimelineCategory {
  key: TimelineCategoryKey;
  label: string;
  emoji?: string;
  color?: string;
  flag?: string;
}

export interface TimelineFacetGroup {
  key: string;
  label: string;
  values: TimelineCategory[];
}

export interface TimelinePerson {
  name: string;
  bio?: string;
}

export interface TimelineEvent {
  id?: string;
  year?: number;
  month?: number;
  facets?: Record<string, string | string[]>;
  date: string;
  title: string;
  summary?: string;
  description?: string;
  emoji?: string;
  thumb?: string;
  /** RouteTimeline: alt text of the thumb. */
  thumbAlt?: string;
  /** RouteTimeline: CSS object-position of the cropped thumb, e.g. "50% 20%" for portraits. */
  thumbPosition?: string;
  /** RouteTimeline: photo credit under the thumb (HTML allowed – author, licence link). */
  thumbCredit?: string;
  tags?: string[];
  persons?: TimelinePerson[];
  link?: string;
  linkText?: string;
  barValue?: number;
  barLabel?: string;
}

export interface TimelineContent {
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
  collapsedYears?: number[];
  facetGroups?: TimelineFacetGroup[];
  layout?: 'vertical' | 'horizontal';
  hideLegend?: boolean;
  barMax?: number;
  barReferenceValue?: number;
  barReferenceLabel?: string;
  /** RouteTimeline only: colour theme (e.g. 'trikolora' – Czech tricolour from the palette). */
  theme?: 'trikolora';
  events: TimelineEvent[];
}

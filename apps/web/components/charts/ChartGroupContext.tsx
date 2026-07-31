'use client';

import { createContext, useContext } from 'react';

// Lets ChartRow tell every VegaChart underneath it to render `bare`,
// regardless of what MDX/remark wraps each chart tag in (a bare child
// element, a <p>, a fragment...). Prop-cloning only reaches *direct*
// children and breaks the moment there's an extra wrapper in between;
// context reaches through any nesting shape.
export type ChartGroupState = {
  bare: boolean;
  hoverRatio: number | null;
  setHoverRatio?: (ratio: number | null) => void;
};

const ChartGroupContext = createContext<ChartGroupState>({
  bare: false,
  hoverRatio: null,
});

export function useChartGroup() {
  return useContext(ChartGroupContext);
}

export default ChartGroupContext;

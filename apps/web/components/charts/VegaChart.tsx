import dynamic from 'next/dynamic';
import type { VegaChartProps } from './VegaChartImpl';

// vega-embed → vega-geo → vega-canvas requires the native 'canvas' module,
// which cannot be bundled server-side. dynamic + ssr:false ensures it only
// ever loads in the browser.
const VegaChart = dynamic<VegaChartProps>(
  () => import('./VegaChartImpl'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', minHeight: '110px', background: '#f0ece4', borderRadius: 4 }} />
    ),
  }
);

export default VegaChart;

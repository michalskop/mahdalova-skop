import Link from 'next/link';

interface ChartSignatureProps {
  size?: number | string;
  color?: string;
  layout?: 'inline' | 'stacked';
  textSize?: number | string;
  textWeight?: number;
  style?: React.CSSProperties;
}

export default function ChartSignature({
  size = 22,
  color = '#101432',
  layout = 'inline',
  textSize,
  textWeight = 400,
  style,
}: ChartSignatureProps) {
  const stacked = layout === 'stacked';
  const fontSize = textSize ?? (
    typeof size === 'number' ? size * (stacked ? 0.47 : 0.52) : 14
  );

  return (
    <Link
      href="https://datatimes.cz"
      target="_blank"
      rel="noopener noreferrer"
      className="dpbp-chart-signature"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: stacked ? 'column' : 'row',
        gap: stacked ? 3 : 6,
        textDecoration: 'none',
        textAlign: 'center',
        fontFamily: 'var(--font-roboto-slab), Georgia, serif',
        fontSize,
        fontWeight: textWeight,
        color, lineHeight: 1, ...style,
      }}
    >
      <svg width={size} height={size} viewBox="112 112 276 276" style={{ flex: '0 0 auto', display: 'block' }}>
        <defs>
          <linearGradient id="chartSignatureGradient" x1="1" x2="0.25" y1="0.5" y2="1">
            <stop offset="0%" stopColor="#ffdc33" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffdc33" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffdc33" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffdc33" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g transform="rotate(-30 250 250)">
          <path fill="none" stroke="#ffdc33" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
          <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 250 150" />
          <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M 250 150 A 100 100 0 0 0 250 350" />
          <path fill="none" stroke="url(#chartSignatureGradient)" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
        </g>
      </svg>
      DataTimes.cz
    </Link>
  );
}

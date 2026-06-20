'use client';

export default function SupportBanner() {
  return (
    <div style={{ width: '100%', fontFamily: "'Roboto', Arial, sans-serif" }}>
      <a
        href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Podpořit DataTimes přes Stripe"
        className="dt-support-banner"
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        {/* top gradient line */}
        <span style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: 3,
          background: 'linear-gradient(to right, #de1743 0%, #f76800 52%, #ffcf02 100%)',
        }} />
        {/* bottom gradient line */}
        <span style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3,
          background: 'linear-gradient(to right, #ffcf02 0%, #f76800 48%, #de1743 100%)',
        }} />

        {/* Brand */}
        <div className="dt-support-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="112 112 276 276" aria-hidden="true" style={{ display: 'block', width: 38, height: 38, flexShrink: 0 }}>
            <defs>
              <linearGradient id="dtSupportG" x1="1" x2=".25" y1=".5" y2="1">
                <stop offset="0%" stopColor="#ffcf02" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffcf02" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffcf02" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffcf02" stopOpacity="1" />
              </linearGradient>
            </defs>
            <g transform="rotate(-30 250 250)">
              <path fill="none" stroke="#ffcf02" strokeWidth="76" strokeLinecap="round" d="M250 350 A100 100 0 0 0 336.60254 300" />
              <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M336.60254 300 A100 100 0 0 0 250 150" />
              <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M250 150 A100 100 0 0 0 250 350" />
              <path fill="none" stroke="url(#dtSupportG)" strokeWidth="76" strokeLinecap="round" d="M250 350 A100 100 0 0 0 336.60254 300" />
            </g>
          </svg>
          <p style={{ margin: 0, fontFamily: "'Roboto Slab', serif", fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#de1743' }}>Data</span><span style={{ color: '#ffcf02' }}>Times</span>
          </p>
        </div>

        {/* Text */}
        <p className="dt-support-text" style={{ flex: '1 1 auto', margin: 0, color: '#ffffff', fontSize: 15, fontWeight: 400, lineHeight: 1.35 }}>
          Veřejný prostor i&nbsp;politiku zaplavují blbosti, fake news a&nbsp;propaganda.
          Pomozte nám šířit ověřená fakta, data a&nbsp;analýzy. Za cenu jednoho oběda.
        </p>

        {/* CTA */}
        <span className="dt-support-cta" style={{
          flex: '0 0 auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 26px',
          background: '#f01952',
          color: '#ffffff',
          fontFamily: "'Roboto Slab', serif",
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          borderRadius: 999,
        }}>
          Jdu do toho
        </span>
      </a>

      <style>{`
        .dt-support-banner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 14px 12px;
          background: #0d1438;
          text-decoration: none;
          overflow: hidden;
          box-sizing: border-box;
        }
        .dt-support-brand { min-width: 175px; }
        @media (max-width: 640px) {
          .dt-support-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 20px 16px;
          }
          .dt-support-brand { min-width: 0; }
          .dt-support-text { flex: 1 1 auto; width: 100%; }
          .dt-support-cta { width: 100%; }
        }
      `}</style>
    </div>
  );
}

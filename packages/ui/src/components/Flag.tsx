import { forwardRef } from 'react';

export type FlagShape = 'square' | 'circle';

interface FlagProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  /** ISO 3166-1 alpha-2 kód země, např. "de", "cz", "gb" (nezáleží na velikosti písmen). */
  code: string;
  /** Velikost v pixelech (šířka = výška). Výchozí 20. */
  size?: number;
  /** Styl vlajky. Výchozí 'square'. */
  shape?: FlagShape;
  /** Základní URL, odkud se servírují galerie vlajek. Výchozí '/flags'. */
  basePath?: string;
}

/**
 * Flag – sdílená vlaječková komponenta pro apps/web i datajournalism.studio.
 *
 * PROČ OBRÁZEK A NE EMOJI: Windows (a Chrome na Windows) nevykresluje emoji
 * vlajek – znaky „regional indicator" se zobrazí jen jako kód země (např. „DE").
 * Proto se vlajky renderují jako SVG ze sad square-flags / circle-flags.
 *
 * Galerie SVG musí být v dané aplikaci servírované z `${basePath}/${shape}/`
 * (viz apps/web/public/flags/square a /circle). Kód země = název souboru.
 *
 * @example
 * <Flag code="de" size={20} />                 // hranatá, 20 px
 * <Flag code="cz" shape="circle" size={16} />  // kulatá, 16 px
 */
export const Flag = forwardRef<HTMLImageElement, FlagProps>(
  ({ code, size = 20, shape = 'square', basePath = '/flags', alt, style, ...props }, ref) => {
    const cc = String(code).trim().toLowerCase();
    const radius: string | number = shape === 'circle' ? '50%' : Math.max(1, Math.round(size * 0.12));
    return (
      <img
        ref={ref}
        src={`${basePath}/${shape}/${cc}.svg`}
        width={size}
        height={size}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        style={{
          display: 'inline-block',
          objectFit: 'cover',
          verticalAlign: '-0.15em',
          borderRadius: radius,
          boxShadow: '0 0 0 1px rgba(23, 45, 63, 0.12)',
          background: '#eef1f3',
          ...style,
        }}
        {...props}
      />
    );
  },
);

Flag.displayName = 'Flag';

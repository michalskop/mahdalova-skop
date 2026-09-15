import { forwardRef } from 'react';

export type FlagShape = 'rectangle' | 'circle';

interface FlagProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  /** ISO 3166-1 alpha-2 kód země, např. "de", "cz", "gb" (nezáleží na velikosti písmen). */
  code: string;
  /** Výška vlajky v pixelech; šířka dopočítá poměr 4:3 (u circle šířka = výška). Výchozí 20. */
  size?: number;
  /** Styl vlajky. Výchozí 'rectangle'. 'circle' jen pro výjimečné, ad hoc případy. */
  shape?: FlagShape;
  /** Základní URL, odkud se servírují sady vlajek. Výchozí '/flags'. */
  basePath?: string;
}

/**
 * Flag – sdílená vlaječková komponenta pro apps/web i datajournalism.studio.
 *
 * PROČ OBRÁZEK A NE EMOJI: Windows (a Chrome na Windows) nevykresluje emoji
 * vlajek – znaky „regional indicator" se zobrazí jen jako kód země (např. „DE").
 * Vlajky proto renderujeme jako SVG.
 *
 * VZHLED: výchozí je čistý obdélník v přirozeném poměru 4:3 (sada flag-icons),
 * BEZ rámečku, stínu, pozadí i zaoblení. Kruhový výřez ('circle') je jen pro
 * výjimečné případy, které určujeme ad hoc.
 *
 * Sady SVG musí být servírované z `${basePath}/${shape}/` (viz
 * apps/*/public/flags/rectangle a /circle). Kód země = název souboru.
 *
 * @example
 * <Flag code="de" />                           // obdélník, výška 20 px
 * <Flag code="cz" size={16} />                 // obdélník, výška 16 px
 * <Flag code="cz" shape="circle" size={18} />  // kulatá (ad hoc), 18 px
 */
export const Flag = forwardRef<HTMLImageElement, FlagProps>(
  ({ code, size = 20, shape = 'rectangle', basePath = '/flags', alt, style, ...props }, ref) => {
    const cc = String(code).trim().toLowerCase();
    const isCircle = shape === 'circle';
    const width = isCircle ? size : Math.round((size * 4) / 3);
    const height = size;
    return (
      <img
        ref={ref}
        src={`${basePath}/${shape}/${cc}.svg`}
        width={width}
        height={height}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        style={{
          display: 'inline-block',
          width,
          height,
          verticalAlign: '-0.15em',
          objectFit: isCircle ? 'cover' : 'contain',
          borderRadius: isCircle ? '50%' : 0,
          ...style,
        }}
        {...props}
      />
    );
  },
);

Flag.displayName = 'Flag';

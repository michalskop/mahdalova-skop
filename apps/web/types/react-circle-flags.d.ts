declare module 'react-circle-flags' {
  import * as React from 'react';

  export type CircleFlagProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    countryCode: string;
    height?: number | string;
    width?: number | string;
    cdnUrl?: string;
  };

  export const CircleFlag: React.FC<CircleFlagProps>;
}

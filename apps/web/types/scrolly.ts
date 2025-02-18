// types/scrolly.ts
export interface ScrollyStep {
  text: string;
  content: {
    type: 'image' | 'iframe';
    src: string;
    // Optional: additional attributes for iframe
    width?: string;
    height?: string;
    allowFullScreen?: boolean;
  };
  bgColor?: string;
}

export interface ScrollyContent {
  textAlignment?: string;
  defaultContent?: {
    type: 'image' | 'iframe';
    src: string;
    width?: string;
    height?: string;
    allowFullScreen?: boolean;
    bgColor?: string;
  };
  steps: ScrollyStep[];
}
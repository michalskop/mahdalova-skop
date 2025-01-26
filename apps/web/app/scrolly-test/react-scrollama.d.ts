declare module 'react-scrollama' {
  import { ReactNode } from 'react';
  
  interface ScrollamaProps {
    children: ReactNode;
    offset?: number;
    onStepEnter?: (response: { data: any; entry: IntersectionObserverEntry }) => void;
    onStepExit?: ({ element, data, direction }: { element: HTMLElement; data: any; direction: string }) => void;
    onStepProgress?: (response: { data: any; progress: number }) => void;
    debug?: boolean;
  }

  interface StepProps {
    data?: any;
    children: ReactNode;
  }

  export const Scrollama: React.FC<ScrollamaProps>;
  export const Step: React.FC<StepProps>;
}
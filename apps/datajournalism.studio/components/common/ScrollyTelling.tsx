// components/ScrollyTelling.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Scrollama, Step } from 'react-scrollama';
import type { ScrollyStep, ScrollyContent } from '@/types/scrolly';

interface ScrollyTellingProps {
  steps: ScrollyStep[];
  defaultContent?: ScrollyContent['defaultContent'];
  className?: string;
  textAlignment?: 'left' | 'right';
  slug?: string;
}

const ScrollyTelling: React.FC<ScrollyTellingProps> = ({ 
  steps,
  defaultContent,
  className = '',
  textAlignment = 'left',
  slug
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // breakpoint at 1024px
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onStepEnter = ({ data }: { data: number }) => {
    setCurrentStepIndex(data);
  };

  const onStepProgress = ({ data, progress }: { data: number; progress: number }) => {
    if (data === 0 && progress < 0.1) {
      setCurrentStepIndex(-1);
    }
  };

  const getImagePath = (src: string) => {
    if (src.startsWith('http')) {
      return src;
    }
    return slug ? `/a/_articles/${slug}/${src}` : src;
  };

  const getCurrentContent = () => {
    const content = currentStepIndex === -1 
      ? defaultContent 
      : steps[currentStepIndex].content;

    if (!content) return null;

    if (content.type === 'image') {
      return (
        <div style={{ width: '100%', height: 'auto' }}>
          <img
            src={getImagePath(content.src)}
            alt={`Visualization step ${currentStepIndex + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </div>
      );
    } else if (content.type === 'iframe') {
      return (
        <div style={{ 
          width: '100%',
          height: isMobile ? '80vh' : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <iframe
            src={content.src}
            width="100%"
            height="90%"
            style={{
              border: 'none',
              width: '100%',
              height: '90%'
            }}
            allowFullScreen={content.allowFullScreen}
          />
        </div>
      );
    }

    return null;
  };

  const getBackgroundColor = () => {
    if (currentStepIndex === -1) {
      // For default content, check if there's a bgColor in defaultContent
      return defaultContent?.bgColor || 'transparent';
    }
    // Only return bgColor if it exists, otherwise transparent
    return steps[currentStepIndex].bgColor || 'transparent';
  };

  if (isMobile) {
    return (
      <div className={`relative ${className}`} style={{ width: '100%', minHeight: '100vh' }}>
        {/* Sticky container for content */}
        <div style={{
          position: 'sticky',
          top: '0px',
          height: '100vh',
          width: '100%',
          zIndex: 0
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: getBackgroundColor(),
            transition: 'background-color 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '800px',
              padding: '0.1rem'
            }}>
            <div style={{
              width: '100%',
              maxWidth: '800px',
              padding: '0.1rem'
            }}>
              {getCurrentContent()}
            </div>
            </div>
          </div>
        </div>

        {/* Scrolling text container */}
        <div style={{ 
          position: 'relative',
          zIndex: 1,
          marginTop: '-100vh'
        }}>
          <Scrollama offset={0.7} onStepEnter={onStepEnter} onStepProgress={onStepProgress}>
            {steps.map((step, idx) => (
              <Step data={idx} key={idx}>
                <div style={{
                  margin: idx === 0 ? '40vh 0 80vh 0' :
                         idx === steps.length - 1 ? '80vh 0 0 0' :
                         '80vh 0',
                  padding: '1rem',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  position: 'relative'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: step.text }} />
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`relative ${className}`} style={{ width: '100%', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        flexDirection: textAlignment === 'left' ? 'row' : 'row-reverse' as const,
      }}>
        <div style={{
          width: '35%',
          padding: '0 2rem',
        }}>
          <Scrollama offset={0.5} onStepEnter={onStepEnter} onStepProgress={onStepProgress}>
            {steps.map((step, idx) => (
              <Step data={idx} key={idx}>
                <div style={{
                  margin: idx === 0 ? '40vh 0 80vh 0' :
                         idx === steps.length - 1 ? '80vh 0 0 0' :
                         '80vh 0',
                  padding: '1rem',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  position: 'relative'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: step.text }} />
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>

        <div style={{
          width: '65%',
          position: 'sticky',
          top: 0,
          height: '100vh',
          backgroundColor: getBackgroundColor(),
          transition: 'background-color 0.3s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {getCurrentContent()}
        </div>
      </div>
    </div>
  );
};

export default ScrollyTelling;

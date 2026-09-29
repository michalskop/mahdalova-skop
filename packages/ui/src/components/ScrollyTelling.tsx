'use client';
import React, { useState, useEffect } from 'react';
import { Scrollama, Step } from 'react-scrollama';
import type { ScrollyStep, ScrollyContent } from '../types/scrolly';
import { replaceFlagEmojiInHtml } from '../lib/flag-emoji';
import { fixCzechTypography } from '../lib/remark-czech-typography';

// Step text is raw HTML, so apply the Czech typography fixes only to the text
// between tags – never inside attributes such as href or class.
const formatStepHtml = (html: string) =>
  replaceFlagEmojiInHtml(
    html
      .split(/(<[^>]*>)/)
      .map((part) => (part.startsWith('<') ? part : fixCzechTypography(part)))
      .join('')
  );

interface ScrollyTellingProps {
  steps: ScrollyStep[];
  defaultContent?: ScrollyContent['defaultContent'];
  className?: string;
  textAlignment?: 'left' | 'right';
  slug?: string;
  articleBasePath?: string;
  width?: string;
}

const ScrollyTelling: React.FC<ScrollyTellingProps> = ({
  steps,
  defaultContent,
  className = '',
  textAlignment = 'left',
  slug,
  articleBasePath = '/clanek/_articles',
  width,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);

  const normalizedWidth = typeof width === 'string' ? width.replace(/\s+/g, '') : undefined;
  const mediaColumnWidth = normalizedWidth || '65%';
  const textColumnWidth = `calc(100% - ${mediaColumnWidth})`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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
    return slug ? `${articleBasePath}/${slug}/${src}` : src;
  };

  // Image steps are stacked in one grid cell and cross-faded, so consecutive
  // images of identical size (e.g. before/after satellite pairs) overlay
  // pixel-exactly. Only the steps near the current one are mounted, which
  // also preloads the next image before it is needed.
  const renderImageStack = () => {
    const layers: { key: string; src: string; alt: string; width: string; active: boolean }[] = [];
    const seen = new Set<string>();
    const addLayer = (idx: number) => {
      const content = idx === -1 ? defaultContent : steps[idx]?.content;
      if (!content || content.type !== 'image') return;
      const src = getImagePath(content.src);
      if (seen.has(src)) return;
      seen.add(src);
      layers.push({
        key: src,
        src,
        alt: content.alt || '',
        width: content.width || '100%',
        active: false,
      });
    };
    const currentContent = currentStepIndex === -1 ? defaultContent : steps[currentStepIndex]?.content;
    for (let idx = currentStepIndex - 1; idx <= currentStepIndex + 2; idx++) {
      if (idx >= -1 && idx < steps.length) addLayer(idx);
    }
    const activeSrc = currentContent ? getImagePath(currentContent.src) : undefined;
    layers.forEach((layer) => { layer.active = layer.src === activeSrc; });

    return (
      <div style={{ display: 'grid', gridTemplate: '100% / 100%', width: '100%', height: '100%', placeItems: 'center' }}>
        {layers.map((layer) => (
          <img
            key={layer.key}
            src={layer.src}
            alt={layer.active ? layer.alt : ''}
            aria-hidden={layer.active ? undefined : true}
            style={{
              gridArea: '1 / 1',
              width: layer.width,
              maxWidth: '100%',
              maxHeight: '100%',
              height: 'auto',
              objectFit: 'contain',
              opacity: layer.active ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out',
            }}
          />
        ))}
      </div>
    );
  };

  const getCurrentContent = () => {
    const step = currentStepIndex >= 0 ? steps[currentStepIndex] : undefined;
    const content = currentStepIndex === -1 ? defaultContent : step?.content;

    if (!content) return null;

    const finalWidth = content.width || '100%';

    if (content.type === 'image') {
      return renderImageStack();
    } else if (content.type === 'iframe') {
      return (
        <div style={{
          width: finalWidth,
          height: isMobile ? '80vh' : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <iframe
            src={content.src}
            height="90%"
            style={{
              border: 'none',
              width: finalWidth,
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
      return defaultContent?.bgColor || 'transparent';
    }
    return steps[currentStepIndex]?.bgColor || 'transparent';
  };

  if (isMobile) {
    return (
      <div className={`relative ${className}`} style={{ width: '100%', minHeight: '100vh' }}>
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
                  <div dangerouslySetInnerHTML={{ __html: formatStepHtml(step.text) }} />
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: '100%', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        flexDirection: textAlignment === 'left' ? 'row' : 'row-reverse' as const,
      }}>
        <div style={{
          width: textColumnWidth,
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
                  <div dangerouslySetInnerHTML={{ __html: formatStepHtml(step.text) }} />
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>

        <div style={{
          width: mediaColumnWidth,
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

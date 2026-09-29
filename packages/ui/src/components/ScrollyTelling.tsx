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
  // 'side' (default): text column next to a sticky media column.
  // 'overlay': media full-bleed across the viewport, text boxes scroll over it.
  layout?: 'side' | 'overlay';
  // Image fit in the overlay layout: 'contain' keeps the whole image,
  // 'cover' fills the full viewport and crops the edges.
  fit?: 'contain' | 'cover';
}

const ScrollyTelling: React.FC<ScrollyTellingProps> = ({
  steps,
  defaultContent,
  className = '',
  textAlignment = 'left',
  slug,
  articleBasePath = '/clanek/_articles',
  width,
  layout = 'side',
  fit = 'contain',
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
  const renderImageStack = (imageFit: 'contain' | 'cover' = 'contain') => {
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
              width: imageFit === 'cover' ? '100%' : layer.width,
              maxWidth: '100%',
              maxHeight: '100%',
              height: imageFit === 'cover' ? '100%' : 'auto',
              objectFit: imageFit,
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

  if (layout === 'overlay') {
    // In the overlay layout `width` caps the image width (e.g. "720px");
    // the dark band behind it still spans the full viewport.
    const mediaMaxWidth = normalizedWidth || '100%';
    const boxWidth = 420;
    const boxInset = normalizedWidth
      ? `max(16px, calc(50% - ${normalizedWidth} / 2 - ${boxWidth / 3}px))`
      : '6vw';
    return (
      <div
        className={`relative ${className}`}
        style={{
          // Break out of the reading column to the full viewport width.
          width: 'calc(100vw - 16px)',
          marginLeft: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          // Keep the top of the image clear of the fixed site header.
          padding: fit === 'cover' ? 0 : '64px 0 16px',
          backgroundColor: getBackgroundColor(),
          transition: 'background-color 0.3s ease-in-out',
          zIndex: 0,
        }}>
          <div style={{ maxWidth: mediaMaxWidth, height: '100%', margin: '0 auto' }}>
            {(currentStepIndex === -1 ? defaultContent : steps[currentStepIndex]?.content)?.type === 'image'
              ? renderImageStack(fit)
              : getCurrentContent()}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: '-100vh' }}>
          <Scrollama offset={0.6} onStepEnter={onStepEnter} onStepProgress={onStepProgress}>
            {steps.map((step, idx) => (
              <Step data={idx} key={idx}>
                <div style={{
                  margin: idx === 0 ? '60vh 0 90vh' : idx === steps.length - 1 ? '90vh 0 60vh' : '90vh 0',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 24px rgba(16, 20, 50, 0.35)',
                  width: isMobile ? 'calc(100% - 32px)' : `${boxWidth}px`,
                  marginLeft: isMobile ? 'auto' : textAlignment === 'left' ? boxInset : 'auto',
                  marginRight: isMobile ? 'auto' : textAlignment === 'right' ? boxInset : 'auto',
                  position: 'relative',
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

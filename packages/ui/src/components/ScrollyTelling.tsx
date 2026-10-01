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
  // react-scrollama derives its IntersectionObserver thresholds from
  // window.innerHeight; with a zero-height viewport (background tab, hidden
  // pane, some crawlers) it builds NaN thresholds and crashes the whole page.
  // Until the viewport has a height, the steps render without Scrollama.
  const [viewportReady, setViewportReady] = useState(false);
  // Highest step index whose image has been mounted. Image layers are only
  // ever added (never unmounted) and keep step order, so a layer is never
  // re-created or moved while scrolling back and forth.
  const [mountedUpTo, setMountedUpTo] = useState<number>(2);
  useEffect(() => {
    setMountedUpTo((prev) => Math.max(prev, currentStepIndex + 4));
  }, [currentStepIndex]);

  const normalizedWidth = typeof width === 'string' ? width.replace(/\s+/g, '') : undefined;
  const mediaColumnWidth = normalizedWidth || '65%';
  const textColumnWidth = `calc(100% - ${mediaColumnWidth})`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setViewportReady(window.innerHeight > 0);
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
  // pixel-exactly. Layers are mounted progressively a few steps ahead of the
  // reader, which preloads the next images before they are needed.
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
    // Preload a few steps ahead so the next image is ready before it shows.
    const lastIdx = Math.min(steps.length - 1, Math.max(mountedUpTo, currentStepIndex + 4));
    for (let idx = -1; idx <= lastIdx; idx++) addLayer(idx);
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

  const renderSteps = (
    offset: number,
    renderBox: (step: ScrollyStep, idx: number) => React.ReactElement,
  ) => (viewportReady ? (
    <Scrollama offset={offset} onStepEnter={onStepEnter} onStepProgress={onStepProgress}>
      {steps.map((step, idx) => (
        <Step data={idx} key={idx}>
          {renderBox(step, idx)}
        </Step>
      ))}
    </Scrollama>
  ) : (
    <>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>{renderBox(step, idx)}</React.Fragment>
      ))}
    </>
  ));

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
    // Full-bleed scrollytelling with a sticky graphic and text steps that
    // scroll past it, laid out so the two barely overlap:
    // - desktop: text column on the left, image on the right (`width` caps
    //   the image width, e.g. "720px");
    // - mobile/tablet: image pinned under the site header, text cards pass
    //   through the free band below it and slide *under* the image.
    // Step spacing follows the usual scrollama pattern (steps spaced in vh,
    // trigger at `offset`); `display: flow-root` keeps the first/last step
    // margins inside the section so no empty gap leaks out after the last step.
    const headerOffset = isMobile ? 56 : 64;
    const gutter = 'max(16px, 4vw)';
    const boxWidth = 380;
    const mediaMaxWidth = normalizedWidth || '720px';
    const mobileMediaHeight = '58vh';
    const activeContent = currentStepIndex === -1 ? defaultContent : steps[currentStepIndex]?.content;
    const bg = getBackgroundColor();

    return (
      <div
        className={`relative dt-scrolly-overlay ${className}`}
        style={{
          // Break out of the reading column to the full viewport width.
          width: 'calc(100vw - 16px)',
          marginLeft: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: bg,
          transition: 'background-color 0.3s ease-in-out',
          display: 'flow-root',
        }}
      >
        <style>{`
          .dt-scrolly-overlay .dt-scrolly-box p { margin: 0 0 0.6em; font-size: inherit; line-height: inherit; }
          .dt-scrolly-overlay .dt-scrolly-box p:last-child { margin-bottom: 0; }
        `}</style>

        {/* Sticky graphic layer – above the text on mobile so cards slide under it. */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <div style={isMobile ? {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `calc(${headerOffset}px + ${mobileMediaHeight})`,
            padding: `${headerOffset + 8}px 8px 8px`,
            backgroundColor: bg,
            transition: 'background-color 0.3s ease-in-out',
          } : {
            position: 'absolute',
            top: headerOffset,
            bottom: 16,
            right: gutter,
            width: `min(${mediaMaxWidth}, calc(100% - ${boxWidth}px - 3 * ${gutter}))`,
          }}>
            {activeContent?.type === 'image' ? renderImageStack(fit) : getCurrentContent()}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: '-100vh', display: 'flow-root' }}>
          {renderSteps(isMobile ? 0.8 : 0.5, (step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1;
            const margin = isMobile
              ? `${isFirst ? 75 : 0}vh 0 ${isLast ? 25 : 70}vh`
              : `${isFirst ? 55 : 0}vh 0 ${isLast ? 50 : 80}vh`;
            return (
              <div
                className="dt-scrolly-box"
                style={{
                  margin,
                  marginLeft: isMobile ? 'auto' : textAlignment === 'right' ? 'auto' : gutter,
                  marginRight: isMobile ? 'auto' : textAlignment === 'right' ? gutter : 'auto',
                  // Keep lines readable: never wider than ~60 characters.
                  width: isMobile ? 'calc(100% - 24px)' : `${boxWidth}px`,
                  maxWidth: isMobile ? '520px' : '100%',
                  padding: isMobile ? '0.75rem 0.9rem' : '1rem 1.25rem',
                  fontSize: isMobile ? '15px' : '17px',
                  lineHeight: 1.45,
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 24px rgba(16, 20, 50, 0.35)',
                  position: 'relative',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: formatStepHtml(step.text) }} />
              </div>
            );
          })}
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
          {renderSteps(0.7, (step, idx) => (
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
            ))}
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
          {renderSteps(0.5, (step, idx) => (
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
            ))}
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

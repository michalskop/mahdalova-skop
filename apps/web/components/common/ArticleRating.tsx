'use client';

import React, { useEffect, useRef } from 'react';
import { Container, Title, Stack, Paper, useMantineTheme } from '@mantine/core';
import classes from './ArticleRating.module.css';
// import FreeArticleButton from './FreeArticleButton';

interface StripeBuyButton extends HTMLElement {
  'buy-button-id': string;
  'publishable-key': string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<
        React.HTMLAttributes<StripeBuyButton> & {
          'buy-button-id': string;
          'publishable-key': string;
        },
        StripeBuyButton
      >;
    }
  }
}

const ArticleRating = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // The three Stripe Buy Buttons are fixed-width (~288px) iframes. To keep them
  // side by side down to a 600px viewport, scale the whole row to fit the
  // available width via `zoom`; below 600px CSS switches to a stacked column
  // and no scaling is applied.
  useEffect(() => {
    const el = optionsRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    // Natural row width = three fixed-width (288px) Stripe buttons + two 1.5rem
    // (24px) gaps. Known up-front, so scaling works immediately and never needs
    // to wait for the async Stripe iframes to load.
    const NATURAL = 3 * 288 + 2 * 24;

    const fit = () => {
      // Below 600px CSS stacks them in a column; no scaling there.
      // Use setProperty because `zoom` isn't in every TS DOM typing.
      if (window.innerWidth < 600) {
        el.style.removeProperty('zoom');
      } else {
        el.style.setProperty('zoom', String(Math.min(1, wrap.clientWidth / NATURAL)));
      }
    };

    // Called directly (not via requestAnimationFrame) so the initial scale is
    // applied even when rAF is throttled (hidden/background tab). Setting zoom on `el`
    // doesn't change `wrap`'s width, so the observer can't loop.
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener('resize', fit);
    fit();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  const theme = useMantineTheme();

  return (
    <Paper py="xl" style={{ backgroundColor: theme.colors.brandRoyalBlue[6] }}>
      <Container size="xl">
        <Stack align="center" gap="lg" w="100%">
          <Title order={2} ta="center" c="gray.2">
            {/* Oceňte kvalitu a přínos článku částkou: */}
            Bylo to pro vás přínosné?
          </Title>

          <div className={classes.optionsWrap} ref={wrapRef}>
          <div className={classes.options} ref={optionsRef}>
            <div className={classes.option}>
              <stripe-buy-button
                // buy-button-id="buy_btn_1Qhe15KmkuqgWTg6tAwZvJzp"
                // publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
                buy-button-id="buy_btn_1Qhi8bKmkuqgWTg6sJNDt81Q"
                publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
              />
            </div>
            
            <div className={classes.option}>
              <stripe-buy-button
                // buy-button-id="buy_btn_1Qhe4FKmkuqgWTg60Z5l4Fpt"
                // publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
                buy-button-id="buy_btn_1QhiDeKmkuqgWTg6EgDj3AjM"
                publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
              />
            </div>
            
            <div className={classes.option}>
              <stripe-buy-button
                // buy-button-id="buy_btn_1Qhe8OKmkuqgWTg6jovwx3Oo"
                // publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
                buy-button-id="buy_btn_1QhiH0KmkuqgWTg6KRdJL3cj"
                publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
              />
            </div>

            {/* <div className={classes.option}>
              <FreeArticleButton />
            </div> */}
          </div>
          </div>
        </Stack>
      </Container>
    </Paper>
  );
};

export default ArticleRating;
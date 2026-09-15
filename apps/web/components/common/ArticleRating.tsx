'use client';

import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const theme = useMantineTheme();

  return (
    <Paper py="xl" style={{ backgroundColor: theme.colors.brandRoyalBlue[6] }}>
      <Container size="xl">
        <Stack align="center" gap="lg">
          <Title order={2} ta="center" c="gray.2">
            {/* Oceňte kvalitu a přínos článku částkou: */}
            Bylo to pro vás přínosné?
          </Title>
          
          <div className={classes.options}>
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
        </Stack>
      </Container>
    </Paper>
  );
};

export default ArticleRating;
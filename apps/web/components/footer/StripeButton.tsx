import React, { useEffect } from "react";

// Declare the stripe-buy-button as a valid JSX intrinsic element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
import { Box, Loader, Center } from "@mantine/core";

const DonateButton = () => {
  useEffect(() => {
    // Dynamically load the Stripe script
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    script.onload = () => console.log("Stripe Buy Button script loaded");
    document.body.appendChild(script);

    return () => {
      // Clean up the script if the component is unmounted
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Center style={{ marginTop: "2rem" }}>
      <Box>
        <stripe-buy-button
          buy-button-id="buy_btn_1QefadKmkuqgWTg69Nu4Ejql"
          publishable-key="pk_live_8qb1Ik0TojaL1MGjPUcQDnap00Mgsnwape"
        >
          <Loader />
        </stripe-buy-button>
      </Box>
    </Center>
  );
};

export default DonateButton;

import { buffer } from 'micro';
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Set this in your .env.local
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Payment successful for session:", session);
        // TODO: Update your database with the successful payment details
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        console.error("Payment failed for:", paymentIntent.id);
        // TODO: Handle payment failure (e.g., notify the user)
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

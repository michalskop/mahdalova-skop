import { useState } from "react";
import { TextInput, Button, Box, Text, Group, Image, Center } from "@mantine/core";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function DonateForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount || isNaN(Number(amount)) || parseFloat(amount) <= 4.99) {
      alert("Please enter a valid amount greater than 4.99");
      return;
    }

    setLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const session = await response.json();
      if (session.id) {
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: session.id });
        } else {
          alert("Stripe failed to load. Please try again later.");
        }
      } else {
        alert("Failed to create a checkout session.");
      }
    } catch (error) {
      console.error("Error in donation:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      mx="auto"
      mt="lg"
      style={{
        maxWidth: 400,
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Title */}
      <Text ta="center" size="lg" fw={700} mb="md">
        Unterstütze uns mit einer Spende
      </Text>

      {/* Donation Input */}
      <TextInput
        label=""
        placeholder="0,00 €"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        size="lg"
        style={{
          input: {
            fontSize: "1.5rem",
            fontWeight: 700,
            textAlign: "center",
          },
        }}
      />

      {/* Donate Button */}
      <Button
        fullWidth
        mt="md"
        size="lg"
        loading={loading}
        onClick={handleDonate}
        style={{
          backgroundColor: "#000",
          ":hover": { backgroundColor: "#333" },
        }}
      >
        Spenden
      </Button>

      {/* Supported Payment Methods */}
      <Center mt="sm">
        <Text size="sm" c="dimmed">
          Unterstützte Zahlungsmethoden:
        </Text>
      </Center>
      <Center mt="xs">
        <Group>
          <Image src="/payment-logos/amex.png" alt="Amex" height={20} />
          <Image src="/payment-logos/mastercard.png" alt="Mastercard" height={20} />
          <Image src="/payment-logos/visa.png" alt="Visa" height={20} />
          <Image src="/payment-logos/ideal.png" alt="iDEAL" height={20} />
        </Group>
      </Center>
    </Box>
  );
}

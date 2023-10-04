import { Elements } from "@stripe/react-stripe-js";
import Form from "./Form";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function StripeForm({ cartId }) {
  const [clientSecret, setClientSecret] = useState();

  useEffect(() => {
    const selectStripe = async () => {
      const select_session_response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/select-payment-session`,
        {
          medusa_cart_id: cartId,
          provider_id: "stripe",
        }
      );

      const _client_secret =
        select_session_response.data.cart.payment_session.data.client_secret;

      setClientSecret(_client_secret);
    };

    selectStripe();
  }, [cartId]);

  return (
    <div style={{ padding: 16 }}>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
          }}
        >
          <Form clientSecret={clientSecret} cartId={cartId} />
        </Elements>
      )}
    </div>
  );
}

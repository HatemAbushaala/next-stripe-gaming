import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { useEffect, useState } from "react";

export default function PaypalForm({ cartId, amount }) {
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [processing, setProcessing] = useState(false);

  const handlePayment = (data, actions) => {
    console.log("paypal data is ", data);
    actions.order.authorize().then(async (authorization) => {
      if (authorization.status !== "COMPLETED") {
        setErrorMessage(`An error occurred, status: ${authorization.status}`);
        setProcessing(false);
        return;
      }

      //   const response = await client.carts.setPaymentSession(cart.id, {
      //     processor_id: "paypal",
      //   });

      //   if (!response.cart) {
      //     setProcessing(false);
      //     return;
      //   }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/update-payment-session`,
        { ...authorization, provider_id: "paypal", medusa_cart_id: cartId }
      );
      const complete_order_response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/complete-order`,
        {
          medusa_cart_id: cartId,
        }
      );

      //   const { data } = await client.carts.complete(cart.id);

      //   if (!data || data.object !== "order") {
      //     setProcessing(false);
      //     return;
      //   }

      // order successful
      alert("success");
    });
  };

  return (
    <div style={{ marginTop: "10px", marginLeft: "10px" }}>
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          currency: "EUR",
          intent: "authorize",
        }}
      >
        <PayPalButtons
          style={{ layout: "horizontal" }}
          onApprove={handlePayment}
          createOrder={(data, actions) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount,
                  },
                },
              ],
            })
          }
          disabled={processing}
        />
      </PayPalScriptProvider>
    </div>
  );
}

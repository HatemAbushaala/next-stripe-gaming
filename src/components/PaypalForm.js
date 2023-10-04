import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { useEffect, useState } from "react";

export default function PaypalForm({ cartId, amount }) {
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [processing, setProcessing] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    const selectPaypal = async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/select-payment-session`,
        {
          medusa_cart_id: cartId,
          provider_id: "paypal",
        }
      );

      console.log(paymentSession, res.data.cart.payment_session);
      setPaymentSession(res.data.cart.payment_session);
    };

    selectPaypal();
  }, [cartId]);

  const handlePayment = (data, actions) => {
    console.log("paypal data is ", data);

    actions.order.authorize().then(async (authorization) => {
      console.log("authorization", authorization);
      if (authorization.status !== "COMPLETED") {
        setErrorMessage(`An error occurred, status: ${authorization.status}`);
        setProcessing(false);
        return;
      }
      // update payment session with required data to complete capture payment later
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/update-payment-session`,
        { ...authorization, provider_id: "paypal", medusa_cart_id: cartId }
      );
      // complete order
      const complete_order_response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/complete-order`,
        {
          medusa_cart_id: cartId,
        }
      );

      alert("success");
    });
  };

  return (
    <div style={{ marginTop: "10px", marginLeft: "10px" }}>
      {paymentSession && (
        <PayPalScriptProvider
          options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
            currency: "EUR",
            intent: "authorize",
          }}
        >
          <PayPalButtons
            style={{ layout: "horizontal" }}
            // after user approve payment from paypal popup
            onApprove={handlePayment}
            // medusa paypal plugin will create paypal order for us so we only need to return paypal order id from medusa payment session
            createOrder={(data, actions) => paymentSession.data.id}
            disabled={processing}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}

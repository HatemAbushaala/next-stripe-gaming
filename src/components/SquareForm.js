import axios from "axios";
import { useEffect, useState } from "react";
import {
  PaymentForm,
  CreditCard,
  ApplePay,
  GooglePay,
} from "react-square-web-payments-sdk";

// ref: https://developer.squareup.com/blog/online-payments-with-square-and-react/
export default function SquareForm({ cartId }) {
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    const selectPaymentProvider = async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/select-payment-session`,
        {
          medusa_cart_id: cartId,
          provider_id: "square",
        }
      );

      setPaymentSession(res.data.cart.payment_session);
    };

    selectPaymentProvider();
  }, [cartId]);

  return (
    <div>
      {paymentSession && (
        <PaymentForm
          createPaymentRequest={() => ({
            // TODO set currency
            countryCode: "US",
            currencyCode: "USD",
            total: {
              amount: (paymentSession.amount / 100).toFixed(2),
              label: "Total",
            },
          })}
          applicationId={process.env.NEXT_PUBLIC_APP_ID}
          cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
            console.log("token:", token);
            //   we need to send token to payment session

            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/update-payment-session`,
              {
                ...token,
                amount: paymentSession.amount,
                provider_id: "square",
                medusa_cart_id: cartId,
              }
            );

            // complete order
            const complete_order_response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/complete-order`,
              {
                medusa_cart_id: cartId,
              }
            );

            alert("success");
          }}
          locationId={process.env.NEXT_PUBLIC_LOCATION_ID}
        >
          <CreditCard />
          {/* 
          NOTE: You won’t see the Apple Pay button appear. In order to support Apple Pay, first you’ll need to Register your Sandbox domain with Apple. Keep in mind that this payment method will only be available on Safari browsers that support Apple Pay.
          */}
          <ApplePay />
          <GooglePay />
        </PaymentForm>
      )}
    </div>
  );
}

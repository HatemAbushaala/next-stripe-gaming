import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";

export default function Form({ clientSecret, cartId }) {
  const stripe = useStripe();
  const elements = useElements();

  async function handlePayment(e) {
    e.preventDefault();
    //  handle payment
    return stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          //TODO: get billing details from user
          billing_details: {
            name: "hatem",
            email: "hatemwebotak@gmail.com",
            phone: "05586881454",
            address: {
              city: "istanbul",
              country: "TR",
              postal_code: "32215",
            },
          },
        },
      })
      .then(async ({ error, paymentIntent }) => {
        // create request to complete order using cartId
        console.log("stripe payment intent ", paymentIntent);
        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          const complete_order_response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/complete-order`,
            {
              medusa_cart_id: cartId,
            }
          );
          alert("success");
        } else {
          // TODO handle errors: ex wrong card, not enough balance
          alert(`error, payment status:${paymentIntent.status}`);
        }
      });
  }

  return (
    <form>
      <CardElement />
      <button onClick={handlePayment}>Submit</button>
    </form>
  );
}

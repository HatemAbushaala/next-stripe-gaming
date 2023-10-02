"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Form from "@/components/Form";
import Container from "@/components/Container";
import axios from "axios";
import { useState } from "react";
import PaypalForm from "@/components/PaypalForm";

export default function Home() {
  const [clientSecret, setClientSecret] = useState();
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [cartId, setCartId] = useState();

  const test_cart = [
    {
      quantity: 2,
      product: 1,
    },
  ];

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!email) return alert("email required");
    const order_response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
      {
        email,
        items: test_cart,
      }
    );

    const _cart_id = order_response.data.medusa.draft_order.cart_id;

    const payment_session_response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/create-payment-session`,
      {
        medusa_cart_id: _cart_id,
      }
    );
    // when we have multiple method we need to select the method that will be used to complete payment
    const select_session_response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/select-payment-session`,
      {
        medusa_cart_id: _cart_id,
        provider_id: paymentMethod,
      }
    );

    if (paymentMethod === "stripe") {
      const _client_secret =
        select_session_response.data.cart.payment_sessions.find(
          (ps) => ps.provider_id === "stripe"
        ).data.client_secret;

      setClientSecret(_client_secret);
    }
    setCartId(_cart_id);
    // console.log(payment_session_response.data)
    // console.log('response ',payment_session_response.data.cart.payment_session.data.client_secret)
  };
  return (
    <main>
      {!clientSecret && (
        <form onSubmit={handleCheckout}>
          <label>
            <input
              type="radio"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={(e) => setPaymentMethod("paypal")}
            />
            Paypal
          </label>
          <label>
            <input
              type="radio"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={(e) => setPaymentMethod("stripe")}
            />
            Stripe
          </label>

          <input
            required
            placeholder="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
          />
          <button type="submit">checkout</button>
        </form>
      )}

      {paymentMethod === "stripe" && clientSecret && cartId && (
        <Container cartId={cartId} clientSecret={clientSecret} />
      )}
      {/* NOTE: amount should be calculated from cart items */}
      {paymentMethod === "paypal" && cartId && (
        <PaypalForm amount={30} cartId={cartId} />
      )}
    </main>
  );
}

"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Form from "@/components/Form";
import Container from "@/components/Container";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [clientSecret, setClientSecret] = useState();
  const [cartId, setCartId] = useState();

  const handleCheckout = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    if (!email) return alert("email required");
    const order_response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
      {
        email: email,
        items: [
          {
            quantity: 1,
            product: 1,
          },
        ],
      }
    );

    const _cart_id = order_response.data.medusa.draft_order.cart_id;

    const payment_session_response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/create-payment-session`,
      {
        medusa_cart_id: _cart_id,
      }
    );

    const _client_secret =
      payment_session_response.data.cart.payment_session.data.client_secret;
    // console.log(payment_session_response.data)
    // console.log('response ',payment_session_response.data.cart.payment_session.data.client_secret)
    setCartId(_cart_id);
    setClientSecret(_client_secret);
  };
  return (
    <main>
      {!clientSecret && (
        <form onSubmit={handleCheckout}>
          <input required placeholder="email" type="email" name="email" />
          <button type="submit">checkout</button>
        </form>
      )}

      {clientSecret && cartId && (
        <Container cartId={cartId} clientSecret={clientSecret} />
      )}
    </main>
  );
}

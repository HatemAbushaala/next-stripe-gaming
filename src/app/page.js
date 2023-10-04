"use client";

import Image from "next/image";
import styles from "./page.module.css";
import StripeForm from "@/components/StripeForm";
import axios from "axios";
import { useState } from "react";
import PaypalForm from "@/components/PaypalForm";
import SquareForm from "@/components/SquareForm";

export default function Home() {
  const [email, setEmail] = useState("h@h.hh");
  const [paymentMethod, setPaymentMethod] = useState("square");
  const [cartId, setCartId] = useState();

  const test_cart = [
    {
      quantity: 1,
      product: 1,
    },
  ];

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!email) return alert("email required");

    let order_response;

    try {
      order_response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
        {
          email,
          items: test_cart,
        }
      );
    } catch (err) {
      return alert(
        "fail to create order, make sure that product with id:1 in stock and contain activation keys"
      );
    }

    const _cart_id = order_response.data.medusa.draft_order.cart_id;
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/create-payment-session`,
      {
        medusa_cart_id: _cart_id,
      }
    );

    setCartId(_cart_id);
    // console.log(payment_session_response.data)
    // console.log('response ',payment_session_response.data.cart.payment_session.data.client_secret)
  };
  return (
    <main>
      {!cartId && (
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
          <label>
            <input
              type="radio"
              value="square"
              checked={paymentMethod === "square"}
              onChange={(e) => setPaymentMethod("square")}
            />
            Square
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

      {paymentMethod === "stripe" && cartId && <StripeForm cartId={cartId} />}
      {/* NOTE: amount should be calculated from cart items */}
      {paymentMethod === "paypal" && cartId && (
        <PaypalForm amount={30} cartId={cartId} />
      )}
      {paymentMethod === "square" && cartId && (
        <SquareForm amount={30} cartId={cartId} />
      )}
    </main>
  );
}

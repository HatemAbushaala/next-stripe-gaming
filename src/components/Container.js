
import { Elements } from "@stripe/react-stripe-js"
import Form from "./Form"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)

export default function Container({clientSecret,cartId}) {

  return (
    <div style={{padding:16}}>
        <Elements stripe={stripePromise} options={{
          clientSecret,
        }}>
        <Form clientSecret={clientSecret} cartId={cartId} />
      </Elements>
    </div>
  )
};
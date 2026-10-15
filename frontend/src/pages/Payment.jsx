import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Payment() {
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  const shippingAddress = location.state?.shippingAddress;
  const checkoutAttemptId = location.state?.checkoutAttemptId;

  useEffect(() => {
    async function callPaymentIntent() {
      try {
        setError("");

        const res = await api.post("/payments/create-intent", {
          shippingAddress,
          checkoutAttemptId,
        });

        setClientSecret(res.data.clientSecret);
        setOrderId(res.data.orderId);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize payment");
      }
    }
    callPaymentIntent();
  }, []);

  if (!shippingAddress || !checkoutAttemptId) {
    return <p>Invalid payment session. Please return to checkout.</p>;
  }

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : clientSecret && orderId ? (
        <>
          <h1>Payment</h1>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm orderId={orderId} />
          </Elements>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Payment;

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import "../styles/Payment.css";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const shippingAddress = location.state?.shippingAddress;
  const checkoutAttemptId = location.state?.checkoutAttemptId;

  useEffect(() => {
    let cancelled = false;

    async function callPaymentIntent() {
      if (!shippingAddress || !checkoutAttemptId) {
        setError("Invalid payment session. Please return to checkout.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.post("/payments/create-intent", {
          shippingAddress,
          checkoutAttemptId,
        });

        const receivedClientSecret = res.data?.clientSecret;
        const receivedOrderId = res.data?.orderId;

        if (!receivedClientSecret || !receivedOrderId) {
          throw new Error(
            "The server did not return a valid payment session."
          );
        }

        if (!cancelled) {
          setClientSecret(receivedClientSecret);
          setOrderId(receivedOrderId);
        }
      } catch (err) {
        console.error("Payment initialization failed:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to initialize payment. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    callPaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [shippingAddress, checkoutAttemptId]);

  if (!shippingAddress || !checkoutAttemptId) {
    return (
      <div className="payment-page">
        <h2>Invalid payment session</h2>
        <p>Please return to checkout and try again.</p>
        <button onClick={() => navigate("/checkout")}>
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Payment</h1>

      {loading && <p>Initializing secure payment...</p>}

      {!loading && error && (
        <div role="alert" className="payment-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && clientSecret && orderId && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <PaymentForm orderId={orderId} />
        </Elements>
      )}
    </div>
  );
}

export default Payment;

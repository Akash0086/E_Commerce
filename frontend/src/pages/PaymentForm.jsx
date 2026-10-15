import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api.js";

function PaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();

  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function waitForPaymentConfirmation() {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await api.get(`/order/${orderId}`);

      const status = res.data.order.paymentStatus;

      if (status === "paid") {
        return true;
      }

      if (status === "failed" || status === "refunded") {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const confirmed = await waitForPaymentConfirmation();

        if (confirmed) {
          await fetchCart();
          navigate("/order-success");
          return;
        }

        setMessage(
          "Payment succeeded, but order confirmation is still pending. Please check your order history.",
        );
      } catch (err) {
        setMessage(
          "Payment succeeded, but we couldn't verify the order. Please check your order history.",
        );
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment Form</h2>

      <PaymentElement />

      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default PaymentForm;

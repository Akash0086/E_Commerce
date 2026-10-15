import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../styles/OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="order-success-page">
      <section className="success-card">
        <div className="success-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="success-eyebrow">ORDER CONFIRMATION</p>

        <h1>Thank you for your order!</h1>

        <p className="success-description">
          Your order has been placed successfully. We're glad you chose Nexora.
        </p>

        {orderId && (
          <div className="order-reference">
            <span>Order reference</span>
            <strong>{orderId}</strong>
          </div>
        )}

        <div className="success-next-steps">
          <div className="next-step-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7.5L12 12.5L21 7.5M4 6H20C20.55 6 21 6.45 21 7V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V7C3 6.45 3.45 6 4 6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2>What's next?</h2>
            <p>
              Keep your order reference for future enquiries. You can return
              to Nexora to explore more products.
            </p>
          </div>
        </div>

        <Link to="/" className="success-home-button">
          Continue Shopping
          <span aria-hidden="true">→</span>
        </Link>

        <p className="success-footer">
          Thank you for shopping with <strong>Nexora</strong>.
        </p>
      </section>
    </main>
  );
}

export default OrderSuccess;

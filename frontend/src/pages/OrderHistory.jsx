import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import OrderCard from "../components/OrderCard";
import "../styles/OrderHistory.css";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/order");
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(
        err.response?.data?.message ||
          "We couldn't load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <main className="order-history-page">
      <div className="order-history-container">
        <header className="order-history-header">
          <div>
            <p className="order-history-eyebrow">YOUR ACCOUNT</p>
            <h1>My Orders</h1>
            <p className="order-history-subtitle">
              Track your purchases and view order details.
            </p>
          </div>

          <Link to="/" className="order-history-shop-link">
            Continue Shopping <span aria-hidden="true">→</span>
          </Link>
        </header>

        {loading ? (
          <div className="order-history-message">
            <span className="order-history-spinner" aria-hidden="true" />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <section className="order-history-empty" role="alert">
            <div className="order-history-empty-icon" aria-hidden="true">
              !
            </div>
            <h2>Unable to load orders</h2>
            <p>{error}</p>
            <button
              type="button"
              className="order-history-primary-button"
              onClick={getOrders}
            >
              Try Again
            </button>
          </section>
        ) : orders.length === 0 ? (
          <section className="order-history-empty">
            <div className="order-history-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>
              Your purchases will appear here once you place your first order.
            </p>
            <Link to="/" className="order-history-primary-button">
              Start Shopping
            </Link>
          </section>
        ) : (
          <>
            <div className="order-history-summary">
              <span className="order-history-summary-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>
                  {orders.length} {orders.length === 1 ? "order" : "orders"}
                </strong>
                <p>Your order history is up to date.</p>
              </div>
            </div>

            <section className="order-history-list" aria-label="Your orders">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  formatPrice={formatPrice}
                  onOrderUpdated={getOrders}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default OrderHistory;
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import "../styles/OrderDetails.css";

function formatPrice(amount = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(date) {
  if (!date) return "Unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsedDate);
}

function readableStatus(value) {
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/order/${encodeURIComponent(orderId)}`
        );

        if (!isCancelled) {
          setOrder(res.data?.order || null);

          if (!res.data?.order) {
            setError("The order details could not be found.");
          }
        }
      } catch (err) {
        console.error("Failed to load order details:", err);

        if (!isCancelled) {
          setError(
            err.response?.status === 404
              ? "This order could not be found."
              : err.response?.data?.message ||
                  "Unable to load order details. Please try again."
          );
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    } else {
      setError("Invalid order reference.");
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );

    if (!confirmCancel) return;

    try {
      setCancelling(true);
      setCancelError("");

      // Calls backend PUT route for order cancellation
      const res = await api.put(`/order/cancel/${orderId}`);

      if (res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error("Cancellation failed:", err);
      setCancelError(
        err.response?.data?.message ||
          "Failed to cancel the order. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-message">Loading order details...</div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <section className="order-details-error">
          <h1>Order unavailable</h1>
          <p>{error || "We couldn't find this order."}</p>
          <Link to="/orders" className="order-details-button">
            Back to My Orders
          </Link>
        </section>
      </main>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const currentStatusIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancellable = ["pending", "processing"].includes(order.orderStatus);

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <Link to="/orders" className="order-details-back">
          <span aria-hidden="true">←</span> Back to My Orders
        </Link>

        <header className="order-details-header">
          <div>
            <p className="order-details-eyebrow">ORDER INFORMATION</p>
            <h1>Order Details</h1>
            <p className="order-details-date">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`order-details-status status-${String(
              order.orderStatus || "pending"
            ).toLowerCase()}`}
          >
            {readableStatus(order.orderStatus)}
          </span>
        </header>

        {/* ORDER PROGRESS STEPPER */}
        <section className="order-details-card">
          <h2>Order progress</h2>
          {order.orderStatus === "cancelled" ? (
            <div className="order-status-banner cancelled">
              This order has been cancelled.
            </div>
          ) : (
            <div className="order-stepper">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                return (
                  <div
                    key={step}
                    className={`stepper-step ${
                      isCompleted ? "completed" : "pending"
                    }`}
                  >
                    <div className="stepper-icon">
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    <span className="stepper-label">{readableStatus(step)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {isCancellable && (
            <div className="order-details-cancel-wrapper">
              <button
                type="button"
                className="order-details-cancel-button"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling Order..." : "Cancel Order"}
              </button>
              {cancelError && (
                <p className="order-details-cancel-error">{cancelError}</p>
              )}
            </div>
          )}
        </section>

        {/* ORDER ITEMS SUMMARY */}
        <section className="order-details-card">
          <div className="order-details-card-heading">
            <h2>Order summary</h2>
            <span>{items.length} product types</span>
          </div>

          <div className="order-details-reference">
            <span>Order ID</span>
            <strong>{order._id}</strong>
          </div>

          <div className="order-details-items">
            {items.map((item, index) => (
              <article
                className="order-details-item"
                key={`${item.productId || item.name}-${index}`}
              >
                <div className="order-details-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="order-details-placeholder-image">
                      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                        <rect width="24" height="24" rx="4" fill="#F3F4F6" />
                        <path
                          d="M8 16L11.5 11.5L14 14.5L17.5 10L21 16H8Z"
                          fill="#9CA3AF"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="order-details-item-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>Unit price: {formatPrice(item.price)}</p>
                </div>

                <strong className="order-details-line-total">
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          <div className="order-details-totals">
            <div>
              <span>Subtotal</span>
              <strong>
                {formatPrice(
                  order.itemsSubtotal ??
                    items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                )}
              </strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>{formatPrice(order.shippingAmount || 0)}</strong>
            </div>

            <div className="order-details-grand-total">
              <span>Total</span>
              <strong>{formatPrice(order.totalAmount || 0)}</strong>
            </div>
          </div>
        </section>

        {/* SHIPPING & PAYMENT GRID */}
        <div className="order-details-grid">
          <section className="order-details-card">
            <h2>Shipping address</h2>
            <div className="order-details-address">
              <strong>{order.shippingAddress?.name}</strong>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>
          </section>

          <section className="order-details-card">
            <h2>Payment information</h2>

            <div className="order-details-info-row">
              <span>Payment method</span>
              <strong>{order.paymentMethod || "Unavailable"}</strong>
            </div>

            <div className="order-details-info-row">
              <span>Payment status</span>
              <strong>{readableStatus(order.paymentStatus)}</strong>
            </div>

            {order.paymentIntentId && (
              <div className="order-details-info-row">
                <span>Payment reference</span>
                <strong className="order-details-payment-reference">
                  {order.paymentIntentId}
                </strong>
              </div>
            )}
          </section>
        </div>

        <div className="order-details-bottom">
          <Link to="/orders" className="order-details-button secondary">
            Back to My Orders
          </Link>

          <Link to="/" className="order-details-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getStatus(value) {
  const status = String(value || "pending").toLowerCase();

  const labels = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
    requires_action: "Action required",
  };

  let className = "status-neutral";

  if (["paid", "delivered"].includes(status)) {
    className = "status-success";
  } else if (["processing", "shipped"].includes(status)) {
    className = "status-info";
  } else if (["failed", "cancelled"].includes(status)) {
    className = "status-danger";
  } else if (status === "refunded" || status === "requires_action") {
    className = "status-warning";
  }

  return {
    label: labels[status] || status.replaceAll("_", " "),
    className,
  };
}

function OrderCard({ order, formatPrice, onOrderUpdated }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // In-card confirmation toggle

  const orderStatus = getStatus(order.orderStatus);
  const paymentStatus = getStatus(order.paymentStatus);

  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  // Orders are cancellable only when pending or processing
  const isCancellable = ["pending", "processing"].includes(order.orderStatus);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      setCancelError("");

      await api.put(`/order/cancel/${order._id}`);

      // Notify parent component to reload order history
      if (typeof onOrderUpdated === "function") {
        onOrderUpdated();
      }
    } catch (err) {
      console.error("Exact cancellation error:", err.response?.data);
      setCancelError(
        err.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      );
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  return (
    <article className="order-card">
      <div className="order-card-header">
        <div className="order-card-reference">
          <span className="order-card-label">ORDER ID</span>
          <strong className="order-card-id">{order._id}</strong>
          <span className="order-card-date">
            Placed on {formatDate(order.createdAt)}
          </span>
        </div>

        <span className={`order-status-badge ${orderStatus.className}`}>
          {orderStatus.label}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-card-products">
          {items.slice(0, 3).map((item, index) => (
            <div
              className="order-card-product"
              key={`${item.productId || item.name}-${index}`}
            >
              <div className="order-card-product-image">
                {item.image ? (
                  <img
                    src={`/images/${item.image?.replace(/^\/?images\//, "")}`}
                    alt={item.name}
                  />
                ) : (
                  <div className="order-card-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <rect width="24" height="24" rx="4" fill="#F3F4F6" />
                      <path
                        d="M8 16L11.5 11.5L14 14.5L17.5 10L21 16H8Z"
                        fill="#9CA3AF"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="order-card-product-info">
                <strong>{item.name}</strong>
                <span>Qty: {item.quantity}</span>
              </div>
            </div>
          ))}

          {items.length > 3 && (
            <p className="order-card-more">
              +{items.length - 3} more product
              {items.length - 3 === 1 ? "" : "s"}
            </p>
          )}

          {items.length === 0 && (
            <p className="order-card-more">No item details available.</p>
          )}
        </div>

        <div className="order-card-total">
          <span className="order-card-label">ORDER TOTAL</span>
          <strong>
            {formatPrice
              ? formatPrice(order.totalAmount || 0)
              : order.totalAmount}
          </strong>
          <span className="order-card-item-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {cancelError && (
        <div className="order-card-error-banner" role="alert">
          {cancelError}
        </div>
      )}

      <div className="order-card-footer">
        <div className="order-card-payment">
          <span>
            Payment Method: <strong>{order.paymentMethod || "N/A"}</strong>
          </span>
          <span className={`order-status-badge ${paymentStatus.className}`}>
            {paymentStatus.label}
          </span>
        </div>

        <div className="order-card-actions">
          {isCancellable &&
            (!showConfirm ? (
              <button
                type="button"
                className="order-card-cancel-button"
                onClick={() => setShowConfirm(true)}
              >
                Cancel Order
              </button>
            ) : (
              <div className="order-card-confirm-group">
                <span className="confirm-text">Cancel this order?</span>
                <button
                  type="button"
                  className="confirm-btn-yes"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Yes"}
                </button>
                <button
                  type="button"
                  className="confirm-btn-no"
                  onClick={() => setShowConfirm(false)}
                  disabled={cancelling}
                >
                  No
                </button>
              </div>
            ))}

          <Link to={`/orders/${order._id}`} className="order-card-details-link">
            View Details <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default OrderCard;

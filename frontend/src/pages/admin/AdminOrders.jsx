import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/Admin/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    async function getOrder() {
      try {
        const res = await api.get("/admin/order");
        setOrders(res.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      }
    }
    getOrder();
  }, []);

  const handleStatusUpdate = async (orderId) => {
    try {
      const newStatus = selectedStatus[orderId];

      const res = await api.put(`/admin/order/${orderId}`, {
        orderStatus: newStatus,
      });

      setOrders(
        orders.map((order) => {
          if (order._id === orderId) {
            return res.data.order;
          }
          return order;
        })
      );

      // Clear the temporary selected status for this order
      setSelectedStatus((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (err) {
      console.log("Failed to update order:", err.response?.data);
    }
  };

  const allowedTransitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h2>Admin Orders</h2>
      </div>

      {error && <div className="alert-message error">{error}</div>}

      {orders.length === 0 ? (
        <p className="empty-orders">No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-info">
                <div className="info-item">
                  <span className="label">Order ID</span>
                  <span className="value order-id">{order._id}</span>
                </div>

                <div className="info-item">
                  <span className="label">User ID</span>
                  <span className="value order-id">{order.userId}</span>
                </div>

                <div className="info-item">
                  <span className="label">Total</span>
                  <span className="value">₹{order.totalAmount}</span>
                </div>

                <div className="info-item">
                  <span className="label">Payment</span>
                  <span
                    className={`badge payment-${order.paymentStatus?.toLowerCase()}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">Status</span>
                  <span
                    className={`badge status-${order.orderStatus?.toLowerCase()}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {allowedTransitions[order.orderStatus]?.length > 0 && (
                <div className="order-actions">
                  <select
                    className="status-select"
                    value={selectedStatus[order._id] || order.orderStatus}
                    onChange={(e) =>
                      setSelectedStatus({
                        ...selectedStatus,
                        [order._id]: e.target.value,
                      })
                    }
                  >
                    <option value={order.orderStatus} disabled>
                      {order.orderStatus}
                    </option>

                    {allowedTransitions[order.orderStatus].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn-update"
                    disabled={!selectedStatus[order._id]}
                    onClick={() => handleStatusUpdate(order._id)}
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
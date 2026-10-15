import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    async function getOrder() {
      const res = await api.get("/admin/order");
      setOrders(res.data.orders);
      console.log(res.data);
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
        }),
      );
    } catch (err) {
      //console.log("Failed to update order:", err.message);
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
    <div>
      <h2>Admin Orders</h2>

      {error && <p>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id}>
            <p>Order ID: {order._id}</p>
            <p>User ID: {order.userId}</p>
            <p>Total: ₹{order.totalAmount}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Status: {order.orderStatus}</p>

            {allowedTransitions[order.orderStatus].length > 0 && (
              <>
                <select
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
                  disabled={!selectedStatus[order._id]}
                  onClick={() => handleStatusUpdate(order._id)}
                >
                  Update
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;

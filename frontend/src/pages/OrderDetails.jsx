import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const getSingleOrder = async () => {
      try {
        const res = await api.get(`/order/${orderId}`);

        console.log(res.data.order);

        setOrder(res.data.order);
      } catch (err) {
        setError(err.message);
        console.log("Something went wrong", err.message);
      }
    };

    getSingleOrder();
  }, [orderId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!order) {
    return <p>Loading...</p>;
  }

  const statusSteps = ["pending", "processing", "shipped", "delivered"];

  const currentStatusIndex = statusSteps.indexOf(order.orderStatus);

  const handleCancelOrder = async () => {
    setCancelError("");
    setCancelling(true);

    try {
      const res = await api.patch(`/order/${orderId}/cancel`);

      setOrder(res.data.order);
    } catch (err) {
      console.log("Cancellation failed:", err.message);
      setCancelError("Failed to cancel the order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h2>Order Details</h2>

      <p>Order ID: {order._id}</p>
      <p>Order Status: {order.orderStatus}</p>
      <p>Payment Status: {order.paymentStatus}</p>
      <p>Total: ₹{order.totalAmount}</p>

      <h3>Order Progress</h3>

      {order.orderStatus === "cancelled" ? (
        <p>Order Cancelled</p>
      ) : (
        statusSteps.map((step, index) => (
          <p key={step}>
            {index <= currentStatusIndex ? "✓" : "○"} {step}
          </p>
        ))
      )}

      {["pending", "processing"].includes(order.orderStatus) && (
        <>
          <button onClick={handleCancelOrder} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>

          {cancelError && <p>{cancelError}</p>}
        </>
      )}
      
      <h3>Items</h3>
      {order.items.map((item) => (
        <div key={item._id}>
          {item.image && (
            <img
              src={`/images/${item.image}`}
              alt={item.name}
              width="120"
              height="120"
            />
          )}
          <p>{item.name}</p>
          <p>Qty: {item.quantity}</p>
          <p>Price: ₹{item.price}</p>
          <p>Item Total: ₹{item.price * item.quantity}</p>
        </div>
      ))}

      <h3>Shipping Address</h3>

      <p>{order.shippingAddress.name}</p>
      <p>{order.shippingAddress.address}</p>
      <p>
        {order.shippingAddress.city}, {order.shippingAddress.state}
      </p>
      <p>{order.shippingAddress.pincode}</p>
      <p>Phone: {order.shippingAddress.phone}</p>

      <h3>Price Summary</h3>

      <p>Subtotal: ₹{order.totalAmount - order.shippingAmount}</p>

      <p>Shipping: ₹{order.shippingAmount}</p>

      <p>Total: ₹{order.totalAmount}</p>

      <p>Ordered on: {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
    </div>
  );
}

export default OrderDetails;

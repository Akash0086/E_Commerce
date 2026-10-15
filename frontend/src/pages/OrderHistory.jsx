import { useState, useEffect } from "react";
import api from "../services/api.js";
import OrderCard from "../components/OrderCard";

function OrderHistory() {
  const [orders, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getOrder = async () => {
      try {
        const res = await api.get("/order");
        console.log(res.data.orders);
        setOrderData(res.data.orders);
      } catch (err) {
        setError(err.message);
        console.log("Something went wrong", err.message);
      } finally {
        setLoading(false);
      }
    };

    getOrder();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <>
      {error && <p>Failed to load your orders. Please try again.</p>}

      <div>Order histroy</div>

      {!error && orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => <OrderCard key={order._id} order={order} />)
      )}
    </>
  );
}

export default OrderHistory;

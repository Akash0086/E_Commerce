import { Link } from "react-router-dom";

function OrderCard({ order }) {
  const mainItem = order.items[0];
  const remainingCount = order.items.length - 1;

  return (
    <div>
      <p>order Id: {order._id}</p>
      <p>Order Status: {order.orderStatus}</p>
      <p>Payment Status: {order.paymentStatus}</p>
      <p>Total: ₹{order.totalAmount}</p>

      {mainItem?.image && (
        <img
          src={`/images/${mainItem.image}`}
          alt={mainItem.name}
          width="100"
          height="100"
        />
      )}

      <p>{mainItem?.name}</p>
      <p>Qty: {mainItem?.quantity}</p>

      {remainingCount > 0 && (
        <p>
          +{remainingCount} more item{remainingCount > 1 ? "s" : ""}
        </p>
      )}

      <Link to={`/orders/${order._id}`}>View Details</Link>
    </div>
  );
}
export default OrderCard;

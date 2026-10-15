import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/wishlist");

        console.log(res.data.items);
        setItems(res.data.items);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);

      setItems(items.filter((item) => item.productId._id !== productId));
    } catch (err) {
      console.log("Failed to remove wishlist item", err);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const res = await api.post(`/wishlist/${productId}`);

      console.log(res.data);
    } catch (err) {
      console.log(
        "Failed to add to wishlist:",
        err.response?.data?.message || err.message,
      );
    }
  };

  return (
    <div>
      <h2>My Wishlist</h2>

      {error && <p>{error}</p>}

      {items.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        items.map((item) => (
          <div key={item._id}>
            <p>{item.productId.name}</p>
            <p>₹{item.productId.price}</p>
            <p>Stock: {item.productId.stock}</p>

            <button onClick={() => handleRemove(item.productId._id)}>
              Remove
            </button>

            <button onClick={() => addToCart(item.productId, 1)}>
              Add to Cart
            </button>
            
          </div>
        ))
      )}
    </div>
  );
}

export default Wishlist;

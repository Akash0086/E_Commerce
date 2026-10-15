import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Memoize fetchCart so its reference remains stable across renders
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/cart");
      setCart(res.data.cartDetails.items);
    } catch (err) {
      console.error("Failed to fetch cart:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (product, quantity) => {
    setActionError(null);
    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: quantity,
      });
      await fetchCart();
    } catch (err) {
      setActionError("Failed to add item to cart.");
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    setActionError(null);
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      console.log("something went wrong", err.message);
      setActionError("Failed to remove item from cart.");
    }
  }, [fetchCart]);

  const updateCartQuantity = useCallback(async (productId, quantity) => {
    setActionError(null);
    try {
      await api.put(`/cart/${productId}`, {
        quantity: quantity,
      });
      await fetchCart();
    } catch (err) {
      console.error("something went wrong", err.message);
      setActionError("Failed to update cart quantity.");
    }
  }, [fetchCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = cart.reduce((sum, item) => {
    if (!item.productId?.isActive) {
      return sum;
    }
    return sum + item.productId.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        loading,
        error,
        actionError,
        setCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
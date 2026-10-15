import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useCart } from "../context/CartContext";
import "../styles/Wishlist.css";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price / 100);
}

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const { addToCart } = useCart();

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/wishlist");

      setItems(
        Array.isArray(res.data?.items) ? res.data.items : []
      );
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    if (!productId || removingId !== null) return;

    try {
      setActionError("");
      setRemovingId(productId);

      await api.delete(`/wishlist/${productId}`);

      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            String(item.productId?._id) !== String(productId)
        )
      );
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);

      setActionError(
        err.response?.data?.message ||
          "Unable to remove this item."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (!product?._id || addingId !== null) return;

    try {
      setActionError("");
      setAddingId(product._id);

      await addToCart(product, 1);
    } catch (err) {
      console.error("Failed to add product to cart:", err);

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to add this item to your cart."
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <header className="wishlist-header">
          <div>
            <p className="wishlist-eyebrow">YOUR COLLECTION</p>
            <h1>My Wishlist</h1>
            <p className="wishlist-subtitle">
              Keep track of the products you want.
            </p>
          </div>

          <Link to="/" className="wishlist-shop-link">
            Continue Shopping <span aria-hidden="true">→</span>
          </Link>
        </header>

        {!loading && !error && items.length > 0 && (
          <div className="wishlist-summary">
            <span className="wishlist-summary-count">
              {items.length}
            </span>

            <p>
              {items.length === 1
                ? "Product saved"
                : "Products saved"}{" "}
              to your wishlist
            </p>
          </div>
        )}

        {actionError && (
          <p className="wishlist-action-error" role="alert">
            {actionError}
          </p>
        )}

        {loading ? (
          <div className="wishlist-message">
            <span
              className="wishlist-spinner"
              aria-hidden="true"
            />
            <p>Loading your wishlist...</p>
          </div>
        ) : error ? (
          <section className="wishlist-empty" role="alert">
            <h2>Unable to load wishlist</h2>
            <p>{error}</p>

            <button
              type="button"
              className="wishlist-primary-button"
              onClick={fetchWishlist}
            >
              Try Again
            </button>
          </section>
        ) : items.length === 0 ? (
          <section className="wishlist-empty">
            <div
              className="wishlist-empty-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2>Your wishlist is empty</h2>
            <p>
              Save products you like and they will be waiting
              for you here.
            </p>

            <Link
              to="/"
              className="wishlist-primary-button"
            >
              Explore Products
            </Link>
          </section>
        ) : (
          <section
            className="wishlist-grid"
            aria-label="Wishlist products"
          >
            {items.map((item) => {
              const product = item.productId;

              // Handle products deleted after being wishlisted.
              if (!product?._id) {
                return (
                  <article
                    className="wishlist-card"
                    key={item._id}
                  >
                    <div className="wishlist-product-info">
                      <h2>Product unavailable</h2>
                      <p>
                        This product is no longer available.
                      </p>

                      <p>
                        Remove this item from your wishlist
                        using your backend's wishlist-item
                        removal endpoint.
                      </p>
                    </div>
                  </article>
                );
              }

              const outOfStock = product.stock <= 0;

              const image = Array.isArray(product.images)
                ? product.images[0]
                : product.image;

              const imageName = image
                ? image.replace(/^\/?images\//, "")
                : "";

              return (
                <article
                  className="wishlist-card"
                  key={item._id}
                >
                  <div className="wishlist-image-wrap">
                    {imageName ? (
                      <Link
                        to={`/products/${product._id}`}
                        className="wishlist-image-link"
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          className="wishlist-product-image"
                          src={`/images/${imageName}`}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </Link>
                    ) : (
                      <div className="wishlist-image-placeholder">
                        <span>N</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="wishlist-remove-icon"
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from wishlist"
                      disabled={removingId !== null}
                      onClick={() => handleRemove(product._id)}
                    >
                      {removingId === product._id
                        ? "…"
                        : "×"}
                    </button>
                  </div>

                  <div className="wishlist-product-info">
                    <h2>
                      <Link
                        to={`/products/${product._id}`}
                        className="wishlist-product-link"
                      >
                        {product.name}
                      </Link>
                    </h2>

                    <p className="wishlist-product-price">
                      {formatPrice(product.price)}
                    </p>

                    <p
                      className={`wishlist-stock ${
                        outOfStock
                          ? "out-of-stock"
                          : "in-stock"
                      }`}
                    >
                      <span aria-hidden="true">●</span>

                      {outOfStock
                        ? "Out of stock"
                        : `In stock (${product.stock})`}
                    </p>

                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className="wishlist-add-button"
                        disabled={
                          outOfStock ||
                          addingId !== null ||
                          removingId !== null
                        }
                        onClick={() =>
                          handleAddToCart(product)
                        }
                      >
                        {addingId === product._id
                          ? "Adding..."
                          : outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove-button"
                        disabled={
                          removingId !== null ||
                          addingId !== null
                        }
                        onClick={() =>
                          handleRemove(product._id)
                        }
                      >
                        {removingId === product._id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default Wishlist;

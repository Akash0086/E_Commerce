
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const {
    cart,
    total,
    loading,
    actionError,
    error,
    removeFromCart,
    updateCartQuantity,
  } = useCart();

  const navigate = useNavigate();

  const hasAvailableProducts = cart.some(
    (item) => item.productId?.isActive === true,
  );

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const availableItemCount = cart.reduce((count, item) => {
    return item.productId?.isActive
      ? count + item.quantity
      : count;
  }, 0);

  return (
    <main className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <span className="cart-eyebrow">THE NEXORA COLLECTION</span>
          <h1>Your Cart</h1>
          <p>
            Review your items before proceeding to checkout.
          </p>
        </header>

        {actionError && (
          <div className="cart-alert cart-alert-error" role="alert">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="cart-state">
            <span className="cart-spinner" />
            <p>Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="cart-state">
            <h2>Unable to load your cart</h2>
            <p>{error}</p>
            <button
              type="button"
              className="cart-primary-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>

            <h2>Your cart is empty</h2>
            <p>
              You haven't added any products to your cart yet.
            </p>

            <Link to="/products" className="cart-primary-button">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-heading">
                <h2>Cart Items</h2>
                <span>
                  {availableItemCount}{" "}
                  {availableItemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => {
                  const product = item.productId;
                  const unavailable = !product || !product.isActive;
                  const stock = Math.max(
                    0,
                    Number(product?.stock) || 0,
                  );

                  return (
                    <article
                      className={`cart-item ${
                        unavailable ? "cart-item-unavailable" : ""
                      }`}
                      key={item._id}
                    >
                      <div className="cart-item-image">
                        {product?.images?.[0] ? (
                          <img
                            src={`/images/${product.images[0]}`}
                            alt={product.name}
                          />
                        ) : (
                          <div className="cart-no-image">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-main">
                          <div>
                            {product?.brand && (
                              <p className="cart-item-brand">
                                {product.brand}
                              </p>
                            )}

                            <h3>
                              {product ? (
                                product.name
                              ) : (
                                "Product no longer exists"
                              )}
                            </h3>
                          </div>

                          {product && (
                            <p className="cart-item-price">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>

                        {unavailable ? (
                          <p className="cart-unavailable-message">
                            This product is currently unavailable.
                            Remove it to continue with available items.
                          </p>
                        ) : stock === 0 ? (
                          <p className="cart-unavailable-message">
                            Currently out of stock.
                          </p>
                        ) : (
                          <div className="cart-item-controls">
                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    product._id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1}
                                aria-label={`Decrease quantity of ${product.name}`}
                              >
                                −
                              </button>

                              <span>{item.quantity}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    product._id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={item.quantity >= stock}
                                aria-label={`Increase quantity of ${product.name}`}
                              >
                                +
                              </button>
                            </div>

                            <span className="cart-stock-label">
                              {stock} available
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          className="cart-remove-button"
                          onClick={() =>
                            product
                              ? removeFromCart(product._id)
                              : undefined
                          }
                          disabled={!product}
                        >
                          Remove item
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link to="/products" className="cart-continue-link">
                <span aria-hidden="true">←</span>
                Continue shopping
              </Link>
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Available items</span>
                <span>{availableItemCount}</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <p className="cart-summary-note">
                Shipping and any applicable charges will be calculated
                during checkout.
              </p>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
                disabled={!hasAvailableProducts}
              >
                Proceed to Checkout
                <span aria-hidden="true">→</span>
              </button>

              {!hasAvailableProducts && (
                <p className="cart-checkout-warning">
                  Remove unavailable products before proceeding.
                </p>
              )}

              <div className="cart-secure-note">
                <span aria-hidden="true">✓</span>
                Review your order before placing it.
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
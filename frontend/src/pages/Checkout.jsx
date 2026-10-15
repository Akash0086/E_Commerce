import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api.js";
import "../styles/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart, loading: cartLoading } = useCart();

  const shipping = 50;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const availableItems = (cart || []).filter(
    (item) =>
      item?.productId &&
      item.productId.isActive === true &&
      Number(item.productId.stock) >= Number(item.quantity) &&
      Number(item.quantity) > 0,
  );

  const subtotal = availableItems.reduce((sum, item) => {
    return sum + Number(item.productId?.price || 0) * item.quantity;
  }, 0);

  const totalAmount = subtotal + shipping;

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("/")) {
      return imagePath;
    }
    return `/images/${imagePath}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const cleanedForm = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      phone: form.phone.trim(),
    };

    if (Object.values(cleanedForm).some((value) => !value)) {
      setError("Please complete all delivery address fields.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(cleanedForm.pincode)) {
      setError("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(cleanedForm.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (availableItems.length === 0) {
      setError("There are no available products to checkout.");
      return;
    }

    setSubmitting(true);

    const checkoutAttemptId = crypto.randomUUID();

    try {
      if (paymentMethod === "COD") {
        await api.post("/order", {
          shippingAddress: cleanedForm,
          checkoutAttemptId,
        });

        await fetchCart();
        navigate("/order-success");
      } else {
        navigate("/payment", {
          state: {
            shippingAddress: cleanedForm,
            checkoutAttemptId,
          },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your checkout. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main className="checkout-page">
        <div className="checkout-state">
          <span className="checkout-spinner" />
          <p>Preparing your checkout...</p>
        </div>
      </main>
    );
  }

  if (availableItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-state">
          <h1>No available products</h1>
          <p>
            Your cart has no items that are currently available in the
            required quantities.
          </p>
          <Link to="/cart" className="checkout-primary-button">
            Return to Cart
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <span className="checkout-eyebrow">
            THE NEXORA COLLECTION
          </span>
          <h1>Checkout</h1>
          <p>Confirm your delivery details and review your order.</p>
        </header>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-main">
            {error && (
              <div className="checkout-error" role="alert">
                {error}
              </div>
            )}

            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">1</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="phone">Mobile Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number"
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="address">Street Address</label>
                  <textarea
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    rows={3}
                    maxLength={300}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="pincode">PIN Code</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    title="Enter a valid 6-digit Indian PIN code"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">2</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Choose how you would like to pay.</p>
                </div>
              </div>

              <div className="checkout-payment-options">
                <label
                  className={`checkout-payment-option ${
                    paymentMethod === "COD" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span className="checkout-radio-indicator" />
                  <span className="checkout-payment-copy">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives.</span>
                  </span>
                </label>

                <label
                  className={`checkout-payment-option ${
                    paymentMethod === "Stripe" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Stripe"
                    checked={paymentMethod === "Stripe"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span className="checkout-radio-indicator" />
                  <span className="checkout-payment-copy">
                    <strong>Online Payment</strong>
                    <span>Continue to secure payment.</span>
                  </span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="checkout-place-order-button checkout-mobile-submit"
              disabled={submitting || availableItems.length === 0}
            >
              {submitting
                ? "Processing..."
                : paymentMethod === "COD"
                  ? "Place Order"
                  : "Continue to Payment"}
            </button>

            <Link to="/cart" className="checkout-back-link">
              <span aria-hidden="true">←</span>
              Return to Cart
            </Link>
          </div>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            <p className="checkout-summary-caption">
              {availableItems.length}{" "}
              {availableItems.length === 1 ? "product" : "products"}
            </p>

            <div className="checkout-summary-items">
              {availableItems.map((item) => {
                const product = item?.productId || {};

                return (
                  <div
                    className="checkout-summary-item"
                    key={item._id}
                  >
                    <div className="checkout-summary-image">
                      {product.images?.[0] ? (
                        <img
                          src={getImageSrc(product.images[0])}
                          alt={product.name || "Product"}
                        />
                      ) : (
                        <span>No image</span>
                      )}
                      <span className="checkout-item-quantity">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="checkout-summary-item-info">
                      <h3>{product.name}</h3>
                      <p>Qty: {item.quantity}</p>
                    </div>

                    <strong>
                      {formatPrice(
                        Number(product.price || 0) * item.quantity,
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="checkout-summary-row">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>Total Amount</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>

            <p className="checkout-summary-note">
              Your final order total will be confirmed when your order
              is placed.
            </p>

            <button
              type="submit"
              className="checkout-place-order-button checkout-desktop-submit"
              disabled={submitting || availableItems.length === 0}
            >
              {submitting
                ? "Processing..."
                : paymentMethod === "COD"
                  ? "Place Order"
                  : "Continue to Payment"}
            </button>

            <div className="checkout-review-note">
              <span aria-hidden="true">✓</span>
              Review your details before confirming your order.
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
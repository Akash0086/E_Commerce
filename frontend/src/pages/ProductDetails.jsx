
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [productDetail, setProductDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistError, setWishlistError] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      setProductDetail(null);
      setSelectedImage(0);
      setQuantity(1);

      try {
        const res = await api.get(`/product/${id}`);
        setProductDetail(res.data.product);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    setWishlistMessage("");
    setWishlistError(false);

    try {
      await api.post(`/wishlist/${productDetail._id}`);
      setWishlistMessage("Product added to your wishlist.");
    } catch (err) {
      setWishlistError(true);
      setWishlistMessage(
        err.response?.data?.message || "Failed to add product to wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-state">
          <span className="product-details-spinner" />
          <p>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (error || !productDetail) {
    return (
      <main className="product-details-page">
        <div className="product-details-state">
          <h2>Product unavailable</h2>
          <p>{error || "This product could not be found."}</p>
          <Link to="/products" className="details-back-button">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const images = Array.isArray(productDetail.images)
    ? productDetail.images
    : [];

  const stock = Math.max(0, Number(productDetail.stock) || 0);
  const outOfStock = stock === 0;

  const currentImage = images[selectedImage];

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span className="breadcrumb-current">
            {productDetail.name}
          </span>
        </nav>

        <section className="product-details-layout">
          <div className="product-gallery">
            <div className="product-main-image">
              {currentImage ? (
                <img
                  src={`/images/${currentImage}`}
                  alt={productDetail.name}
                />
              ) : (
                <div className="product-image-placeholder">
                  <span>No image available</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-left"
                    onClick={() =>
                      setSelectedImage((current) => current - 1)
                    }
                    disabled={selectedImage === 0}
                    aria-label="Previous product image"
                  >
                    &#8592;
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-right"
                    onClick={() =>
                      setSelectedImage((current) => current + 1)
                    }
                    disabled={selectedImage === images.length - 1}
                    aria-label="Next product image"
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-image-thumbnails">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={`product-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                  >
                    <img
                      src={`/images/${image}`}
                      alt={`${productDetail.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <span className="product-details-eyebrow">
              THE NEXORA COLLECTION
            </span>

            {productDetail.brand && (
              <p className="product-details-brand">
                {productDetail.brand}
              </p>
            )}

            <h1>{productDetail.name}</h1>

            <div className="product-details-price">
              ₹{Number(productDetail.price).toLocaleString("en-IN")}
            </div>

            <div
              className={`product-stock ${
                outOfStock ? "stock-unavailable" : "stock-available"
              }`}
            >
              <span className="stock-indicator" />
              {outOfStock ? "Out of stock" : `${stock} available`}
            </div>

            <div className="product-details-divider" />

            <div className="product-description">
              <h2>Product Description</h2>
              <p>
                {productDetail.description ||
                  "Explore the details of this product from Nexora."}
              </p>
            </div>

            <div className="product-quantity-section">
              <span className="quantity-label">Quantity</span>

              <div className="product-quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(stock, current + 1))
                  }
                  disabled={quantity >= stock || outOfStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-details-actions">
              <button
                type="button"
                className="add-to-cart-button"
                onClick={() => addToCart(productDetail, quantity)}
                disabled={outOfStock}
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                type="button"
                className="add-to-wishlist-button"
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? "Adding..." : "♡ Add to Wishlist"}
              </button>
            </div>

            {wishlistMessage && (
              <p
                className={`wishlist-feedback ${
                  wishlistError ? "wishlist-feedback-error" : ""
                }`}
                role="status"
              >
                {wishlistMessage}
              </p>
            )}

            <div className="product-details-note">
              <span className="product-note-icon" aria-hidden="true">
                ✓
              </span>
              <p>Browse and choose products for your everyday needs.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
import { Link } from "react-router-dom";
import "../../styles/RecentlyAddedProducts.css";

function RecentlyAddedProducts({ products = [], loading, error }) {
return ( <section className="recent-products"> <div className="recent-products-heading"> <div> <span className="recent-products-eyebrow">
FRESH FINDS </span> <h2>Recently Added</h2> <p>Discover the latest additions to Nexora.</p> </div>

    <Link to="/products" className="recent-view-all">
      View All <span aria-hidden="true">→</span>
    </Link>
  </div>

  {loading && (
    <p className="recent-products-status">
      Loading recently added products...
    </p>
  )}

  {!loading && error && (
    <p className="recent-products-status recent-products-error">
      Unable to load recently added products.
    </p>
  )}

  {!loading && !error && products.length === 0 && (
    <p className="recent-products-status">
      No recently added products available.
    </p>
  )}

  {!loading && !error && products.length > 0 && (
    <div className="recent-products-grid">
      {products.slice(0, 5).map((product) => (
        <article
          className="recent-product-card"
          key={product._id}
        >
          <Link
            to={`/products/${product._id}`}
            className="recent-product-link"
            aria-label={`View ${product.name}`}
          >
            <div className="recent-product-image-wrapper">
              <span className="recent-product-badge">
                NEW ARRIVAL
              </span>

              <img
                src={`/images/${product.images?.[0]}`}
                alt={product.name}
                className="recent-product-image"
                loading="lazy"
              />
            </div>

            <div className="recent-product-info">
              <h3>{product.name}</h3>

              {product.brand && (
                <p className="recent-product-brand">
                  {product.brand}
                </p>
              )}

              <p className="recent-product-description">
                {product.description ||
                  "Explore this latest addition to our collection."}
              </p>

              <div className="recent-product-bottom">
                <span className="recent-product-price">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>

                <span className="recent-product-button">
                  View Product <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )}
</section>

);
}

export default RecentlyAddedProducts;

import { Link } from "react-router-dom";
import "../../styles/FeaturedProducts.css";

function FeaturedProducts({ products }) {
  return (
    <section className="featured-products">
      <div className="featured-products-heading">
        <div>
          <h2>Featured Products</h2>
          <p>Explore our handpicked products for you.</p>
        </div>

        <Link to="/products" className="featured-view-all">
          View All →
        </Link>
      </div>

      <div className="featured-products-grid">
        {products.slice(0, 5).map((product) => (
          <article className="featured-product-card" key={product._id}>
            <Link
              to={`/products/${product._id}`}
              className="featured-product-link"
            >
              <div className="featured-product-image-wrapper">
                <img
                  src={`/images/${product.images?.[0]}`}
                  alt={product.name}
                  className="featured-product-image"
                  loading="lazy"
                />
              </div>

              <div className="featured-product-info">
                <h3>{product.name}</h3>
                <p className="featured-product-brand">
                  {product.brand}
                </p>
              </div>
            </Link>

            <p className="featured-product-description">
              {product.description}
            </p>

            <div className="featured-product-bottom">
              <span className="featured-product-price">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>

              <Link
                to={`/products/${product._id}`}
                className="featured-product-button"
              >
                View Product
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;

import { Link } from "react-router-dom";
import "../../styles/PopularProducts.css";

function PopularProducts({ products }) {
  return (
    <section className="popular-products">
      <div className="popular-products-heading">
        <div>
          <h2>Popular Products</h2>
          <p>Discover products worth checking out.</p>
        </div>

        <Link to="/products" className="popular-view-all">
          View All →
        </Link>
      </div>

      <div className="popular-products-grid">
        {products.slice(0, 5).map((product) => (
          <article className="popular-product-card" key={product._id}>
            <Link
              to={`/products/${product._id}`}
              className="popular-product-link"
            >
              <div className="popular-product-image-wrapper">
                <img
                  src={`/images/${product.images?.[0]}`}
                  alt={product.name}
                  className="popular-product-image"
                  loading="lazy"
                />
              </div>

              <div className="popular-product-info">
                <h3>{product.name}</h3>
              </div>
            </Link>

            <div className="popular-product-bottom">
              <span className="popular-product-price">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>

              <Link
                to={`/products/${product._id}`}
                className="popular-product-button"
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

export default PopularProducts;

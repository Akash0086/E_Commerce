import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard({ product }) {
return ( <article className="product-card">
<Link
to={`/products/${product._id}`}
className="product-card-image-link"
aria-label={`View ${product.name}`}
> <div className="product-card-image-wrapper">
{product.images?.[0] ? (
<img
src={`/images/${product.images[0]}`}
alt={product.name}
className="product-card-image"
loading="lazy"
/>
) : ( <div className="product-card-no-image">
No image available </div>
)} </div> </Link>

  <div className="product-card-content">
    {product.brand && (
      <p className="product-card-brand">{product.brand}</p>
    )}

    <h3 className="product-card-title">
      <Link to={`/products/${product._id}`}>
        {product.name}
      </Link>
    </h3>

    <p className="product-card-description">
      {product.description || "Explore this product from Nexora."}
    </p>

    <div className="product-card-footer">
      <span className="product-card-price">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </span>

      <Link
        to={`/products/${product._id}`}
        className="product-card-button"
      >
        View Details <span aria-hidden="true">→</span>
      </Link>
    </div>
  </div>
</article>


);
}

export default ProductCard;

import { Link } from "react-router-dom";
import "../../styles/ShopByCategory.css";
import mobileImage from "../../assets/phone-catgry.jpg";
import wearablesImage from "../../assets/wearables-catgry.jpg";
import laptopImage from "../../assets/laptop-catgry.jpg";
import electronicsImage from "../../assets/electronics-catgry.png";

const categories = [
  { label: "Mobiles", value: "Mobile", image: mobileImage },
  { label: "Wearables", value: "Wearables", image: wearablesImage },
  { label: "Laptops", value: "Laptops", image: laptopImage },
  {label: "Electronics",value: "Electronics",image: electronicsImage},
];

function ShopByCategory() {
  return (
    <section className="shop-category">
      <div className="shop-category-heading">
        <h2>Shop by Category</h2>
        <p>Explore products that fit your lifestyle.</p>
      </div>
      <ul className="shop-category-grid">
        {categories.map((category) => (
          <li key={category.value} className="shop-category-item">
            <Link
              className="shop-category-card"
              to={`/products?category=${encodeURIComponent(category.value)}`}
            >
              <img
                className="shop-category-image"
                src={category.image}
                alt={category.label}
              />
              <span className="shop-category-name"> {category.label} </span>{" "}
              <span className="shop-category-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ShopByCategory;

import { Link } from "react-router-dom";
import "../../styles/HomeFooter.css";

function HomeFooter() {
return ( <footer className="home-footer"> <div className="home-footer-main">
{/* Brand section */} <section className="home-footer-brand"> <Link to="/" className="home-footer-logo">
Nexora<span>.</span> </Link>

      <p>
        Discover mobiles, laptops, wearables, and electronics
        in one convenient place.
      </p>

      <span className="home-footer-tagline">
        Technology for everyday life.
      </span>
    </section>

    {/* Quick links */}
    <nav className="home-footer-column" aria-label="Quick links">
      <h3>Explore</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">All Products</Link></li>
        <li><Link to="/cart">My Cart</Link></li>
        <li><Link to="/orders">My Orders</Link></li>
      </ul>
    </nav>

    {/* Account links */}
    <nav className="home-footer-column" aria-label="Account links">
      <h3>Your Account</h3>
      <ul>
        <li><Link to="/profile">My Profile</Link></li>
        <li><Link to="/orders">Order History</Link></li>
        <li><Link to="/products">Continue Shopping</Link></li>
      </ul>
    </nav>

    {/* Shopping information */}
    <section className="home-footer-column home-footer-info">
      <h3>Shop with Nexora</h3>
      <p>
        Find your next favourite device and enjoy a straightforward
        shopping experience.
      </p>
      <Link to="/products" className="home-footer-shop-link">
        Start Shopping <span aria-hidden="true">→</span>
      </Link>
    </section>
  </div>

  <div className="home-footer-bottom">
    <p>
      © {new Date().getFullYear()} Nexora. All rights reserved.
    </p>

    <p className="home-footer-project-note">
      Built as an e-commerce portfolio project.
    </p>
  </div>
</footer>

);
}

export default HomeFooter;

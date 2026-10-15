import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

import ShopByCategory from "../components/home/ShopByCategory.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import PopularProducts from "../components/home/PopularProducts.jsx";
import RecentlyAddedProducts from "../components/home/RecentlyAddedProducts.jsx";
import WhyShopWithUs from "../components/home/WhyShopWithUs.jsx";
import Newsletter from "../components/home/Newsletter.jsx";
import HomeFooter from "../components/home/HomeFooter.jsx";
import heroProductsCollection from "../assets/hero_photo2.jpg";
import "../styles/Home.css";

function Home() {
  const [product, setProduct] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(false);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const response = await api.get("/product");
        setProduct(response.data.products);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, []);

  useEffect(() => {
    async function fetchRecentProducts() {
      try {
        const response = await api.get(
          "/product?sortBy=createdAt:DESC&limit=5",
        );

        setRecentProducts(response.data.products);
      } catch (err) {
        console.error("Failed to fetch recently added products:", err);
        setRecentError(true);
      } finally {
        setRecentLoading(false);
      }
    }

    fetchRecentProducts();
  }, []);

  if (loading) {
    return <p className="home-status">Loading homepage...</p>;
  }

  if (error) {
    return <p className="home-status home-status-error">{error}</p>;
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-label">DISCOVER SOMETHING NEW</span>

          <h1>
            Find Your Next
            <span> Favorite.</span>
          </h1>

          <p>
            From everyday essentials to the latest technology, discover products
            that fit your life.
          </p>

          <div className="home-hero-actions">
            <Link to="/products" className="home-hero-button">
              Explore Products
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-hero-note">
            <span className="home-hero-dot" />
            Discover your next great find at Nexora
          </div>
        </div>

        <div className="home-hero-decoration">
          <img
            src={heroProductsCollection}
            alt="Collection of electronics, fashion, and lifestyle products"
            className="home-hero-image"
          />
        </div>
      </section>


      <div className="home-content">
        <ShopByCategory />

        <FeaturedProducts products={product} />

        <PopularProducts products={product} />

        <RecentlyAddedProducts
          products={recentProducts}
          loading={recentLoading}
          error={recentError}
        />

        <WhyShopWithUs />

        <Newsletter />
      </div>

      <HomeFooter />
    </main>
  );
}

export default Home;

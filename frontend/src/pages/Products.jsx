import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard";
import "../styles/Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("price:DESC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          search: searchQuery,
          category,
          sortBy,
        });

        const res = await api.get(`/product?${params.toString()}`);

        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, searchQuery, category, sortBy, retryCount]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearchQuery(search.trim());
  }

  function handleCategoryChange(event) {
    const nextCategory = event.target.value;
    setPage(1);

    const nextParams = new URLSearchParams(searchParams);

    if (nextCategory) {
      nextParams.set("category", nextCategory);
    } else {
      nextParams.delete("category");
    }

    setSearchParams(nextParams);
  }

  function clearFilters() {
    setSearch("");
    setSearchQuery("");
    setSortBy("price:DESC");
    setPage(1);
    setSearchParams({});
  }

  const totalPages = Number(pagination.totalPages) || 1;
  const totalProducts = pagination.totalProducts ?? pagination.totalItems;

  return (
    <main className="products-page">
      {" "}
      <header className="products-page-header">
        {" "}
        <div>
          {" "}
          <span className="products-eyebrow">THE NEXORA COLLECTION</span>{" "}
          <h1>Explore Products</h1>{" "}
        </div>
        {!loading && !error && (
          <div className="products-count">
            <span className="products-count-number">
              {totalProducts ?? products.length}
            </span>
            <span className="products-count-label">
              {totalProducts === 1 ? "Product" : "Products"}
            </span>
          </div>
        )}
      </header>
      <section
        className="products-toolbar"
        aria-label="Product search and filters"
      >
        <form className="products-search" onSubmit={handleSearch}>
          <label className="products-sr-only" htmlFor="product-search">
            Search products
          </label>

          <span className="products-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
          </span>

          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
          />

          <button type="submit" className="products-search-button">
            Search
          </button>
        </form>

        <div className="products-filter-group">
          <label className="products-sr-only" htmlFor="product-category">
            Filter by category
          </label>

          <select
            id="product-category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Laptops">Laptops</option>
            <option value="Wearables">Wearables</option>
            <option value="Mobile">Mobile</option>
          </select>

          <label className="products-sr-only" htmlFor="product-sort">
            Sort products
          </label>

          <select
            id="product-sort"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
          >
            <option value="price:DESC">Price: High to Low</option>
            <option value="price:ASC">Price: Low to High</option>
            <option value="name:ASC">Name: A to Z</option>
            <option value="name:DESC">Name: Z to A</option>
          </select>

          <button
            type="button"
            className="products-clear-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      </section>
      {category && (
        <div className="products-active-filter">
          <span>Category:</span>
          <strong>{category}</strong>
          <button
            type="button"
            aria-label="Remove category filter"
            onClick={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete("category");
              setSearchParams(nextParams);
              setPage(1);
            }}
          >
            ×
          </button>
        </div>
      )}
      {loading ? (
        <div className="products-state" role="status">
          <span className="products-spinner" />
          <h2>Loading products</h2>
          <p>Finding products for you...</p>
        </div>
      ) : error ? (
        <div className="products-state products-state-error" role="alert">
          <h2>Unable to load products</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="products-state">
          <div className="products-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4M8 11h6" />
            </svg>
          </div>
          <h2>No products found</h2>
          <p>Try another search term or change your filters.</p>
          <button
            type="button"
            className="products-reset-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="products-results-heading">
            <h2>{category ? `${category} Products` : "All Products"}</h2>
            <span>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "Browse our collection"}
            </span>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="products-pagination" aria-label="Product pages">
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page <= 1}
              >
                ← Previous
              </button>

              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default Products;

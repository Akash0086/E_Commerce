import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin/AdminProducts.css";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get("/product/admin/all");
        console.log(res.data.products);
        setProducts(res.data.products);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
    fetchProduct();
  }, []);

  const handleToggleActive = async (product) => {
    try {
      const newActiveStatus = !product.isActive;

      const res = await api.put(`/product/${product._id}`, {
        isActive: newActiveStatus,
      });

      setProducts(
        products.map((item) => {
          if (item._id === product._id) {
            return res.data.product;
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <div>
          <h2>Product Inventory</h2>
          <p className="subtitle">Manage products, stock levels, and store visibility.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/admin/products/add")}
        >
          + Add New Product
        </button>
      </div>

      {error && <div className="alert-message error">{error}</div>}

      {products.length === 0 ? (
        <p className="empty-products">No products available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="product-name-cell">{product.name}</td>
                  <td>{product.category || "—"}</td>
                  <td>{product.brand || "—"}</td>
                  <td className="price-cell">₹{product.price}</td>
                  <td>
                    <span
                      className={`stock-indicator ${
                        product.stock <= 5 ? "low-stock" : ""
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        product.isActive ? "status-active" : "status-inactive"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-action edit"
                      onClick={() =>
                        navigate(`/admin/products/edit/${product._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className={`btn-action toggle ${
                        product.isActive ? "deactivate" : "activate"
                      }`}
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/Admin/EditProduct.css";

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [success, setSuccess] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/product/admin/${productId}`);
        
        // Convert images array back to a comma-separated string if present
        const productData = res.data.product;
        if (Array.isArray(productData.images)) {
          productData.images = productData.images.join(", ");
        }

        setProduct(productData);
      } catch (err) {
        setLoadError(err.response?.data?.message || "Failed to load product");
      }
    }

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccess("");

    const payload = {
      ...product,
      images: typeof product.images === "string"
        ? product.images.split(",").map((img) => img.trim()).filter(Boolean)
        : product.images,
    };

    try {
      const res = await api.put(`/product/${productId}`, payload);

      const updatedData = res.data.product;
      if (Array.isArray(updatedData.images)) {
        updatedData.images = updatedData.images.join(", ");
      }

      setProduct(updatedData);
      setSuccess("Product updated successfully");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update product");
    }
  };

  if (loadError) {
    return (
      <div className="admin-card-container">
        <div className="alert-message error">{loadError}</div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/products")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-card-container text-center">
        <p className="loading-state">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="admin-card-container">
      <div className="admin-card-header">
        <h2>Edit Product</h2>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/products")}
        >
          Back to Products
        </button>
      </div>

      {success && <div className="alert-message success">{success}</div>}
      {submitError && <div className="alert-message error">{submitError}</div>}

      <form className="edit-product-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={product.name || ""}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              value={product.price || ""}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={product.stock ?? ""}
              onChange={handleChange}
              placeholder="Enter stock"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              value={product.category || ""}
              onChange={handleChange}
              placeholder="Enter category"
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              type="text"
              name="brand"
              value={product.brand || ""}
              onChange={handleChange}
              placeholder="Enter brand"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="images">Images (Comma separated URLs/filenames)</label>
            <input
              id="images"
              type="text"
              name="images"
              value={product.images || ""}
              onChange={handleChange}
              placeholder="image1.jpg, image2.jpg"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={product.description || ""}
              onChange={handleChange}
              placeholder="Enter product description"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
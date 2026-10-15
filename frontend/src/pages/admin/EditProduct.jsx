import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

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

        setProduct(res.data.product);
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

    try {
      const res = await api.put(`/product/${productId}`, product);

      setProduct(res.data.product);
      setSuccess("Product updated successfully");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update product");
    }
  };

  if (loadError) {
    return <p>{loadError}</p>;
  }

  if (!product) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      {success && <p>{success}</p>}
      {submitError && <p>{submitError}</p>}

      <h2>Edit Product</h2>

      {success && <p>{success}</p>}

      {product && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={product.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              type="text"
              name="brand"
              value={product.brand}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Update Product</button>
        </form>
      )}

      <button type="button" onClick={() => navigate("/admin/products")}>
        Back to Products
      </button>
    </div>
  );
}

export default EditProduct;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddProduct() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    images: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const productData = {
      ...formData,
      images: formData.images.split(",").map((image) => image.trim()),
    };
    try {
      const res = await api.post("/product", productData);
      setSuccess("Product added successfully");
      console.log(res.data);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        images: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
      
      <h2>Add Product</h2>
      {success && <p>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name : </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label htmlFor="price">Price : </label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
          />
        </div>
        <div>
          <label htmlFor="description">Description : </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />
        </div>
        <div>
          <label htmlFor="stock">Stock : </label>
          <input
            id="stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="category">Category : </label>
          <input
            id="category"
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="brand">Brand : </label>
          <input
            id="brand"
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="images">Image : </label>
          <input
            id="images"
            type="text"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="Image filename"
          />
        </div>
        <button type="submit">Add Product</button>
      </form>

      <button type="button" onClick={() => navigate("/admin/products")}>
        Back to Products
      </button>
    </div>
  );
}

export default AddProduct;

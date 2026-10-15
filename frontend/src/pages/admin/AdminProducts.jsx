import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

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
        setError(err.message);
      }
    }
    fetchProduct();
  }, []);

  const handleToggleActive = async (product) => {
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
      }),
    );
  };

  return (
    <div>
      <h2>Admin Products</h2>

      {products.map((product) => (
        <div key={product._id}>
          <p>Name: {product.name}</p>
          <p>Price: {product.price}</p>
          <p>Stock: {product.stock}</p>
          <p>Category: {product.category}</p>
          <p>Brand: {product.brand}</p>
          <p>Active: {product.isActive ? "Yes" : "No"}</p>

          <button
            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
          >
            Edit
          </button>

          <button onClick={() => handleToggleActive(product)}>
            {product.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminProducts;

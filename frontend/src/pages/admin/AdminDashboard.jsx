import { Link } from "react-router-dom";
import "../../styles/Admin/AdminDashboard.css";

function AdminDashboard() {
  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-eyebrow">
              NEXORA MANAGEMENT
            </p>
            <h1>Admin Dashboard</h1>
            <p>
              Manage your store, products, and customer orders.
            </p>
          </div>
        </header>

        <section className="admin-dashboard-grid">
          <Link
            to="/admin/products"
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">P</div>
            <h2>Manage Products</h2>
            <p>View, edit, and manage your store products.</p>
            <span>View Products →</span>
          </Link>

          <Link
            to="/admin/products/add"
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">+</div>
            <h2>Add Product</h2>
            <p>Add a new product to the Nexora store.</p>
            <span>Create Product →</span>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">O</div>
            <h2>Manage Orders</h2>
            <p>Review customer orders and update their status.</p>
            <span>View Orders →</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
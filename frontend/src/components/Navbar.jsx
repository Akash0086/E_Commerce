import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import nexoraLogo from "../assets/nexoralogo2.png";
import "../styles/Navbar.css";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);

  const firstName = user?.name?.split(" ")[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <img src={nexoraLogo} alt="Nexora" />
      </Link>

      <div className="navbar-links">
        {user?.role === "admin" ? (
          <>
            <Link to="/admin" onClick={closeMenu}>
              Admin
            </Link>
            <Link to="/admin/products" onClick={closeMenu}>
              Products
            </Link>

            <Link to="/admin/orders" onClick={closeMenu}>
              Manage Orders
            </Link>
          </>
        ) : (
          <>
            <Link to="/products" onClick={closeMenu}>
              Products
            </Link>

            <Link to="/orders" onClick={closeMenu}>
              Returns & Orders
            </Link>

            <Link to="/cart" onClick={closeMenu}>
              Cart
            </Link>
          </>
        )}
      </div>

      {user ? (
        <div className="navbar-account" ref={menuRef}>
          <button
            type="button"
            className="navbar-account-button"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-expanded={showMenu}
            aria-haspopup="true"
          >
            Hello, {firstName} <span aria-hidden="true">▾</span>
          </button>

          {showMenu && (
            <div className="navbar-menu">
              {user.role === "admin" ? (
                <>
                  <Link to="/admin/products" onClick={closeMenu}>
                    Manage Products
                  </Link>

                  <Link to="/admin/orders" onClick={closeMenu}>
                    Manage Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" onClick={closeMenu}>
                    Account Details
                  </Link>

                  <Link to="/orders" onClick={closeMenu}>
                    My Orders
                  </Link>

                  <Link to="/wishlist" onClick={closeMenu}>
                    Wishlist
                  </Link>
                </>
              )}

              <button
                type="button"
                className="navbar-logout-button"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="navbar-auth">
          <Link to="/login" className="navbar-signin">
            Sign In
          </Link>

          <Link to="/register" className="navbar-register">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

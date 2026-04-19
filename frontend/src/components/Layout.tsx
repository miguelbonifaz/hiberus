import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
    closeMenu();
  };

  if (!user) return <Outlet />;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      <nav
        className="nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--white)",
          borderBottom: "1px solid var(--gray-200)",
          height: "var(--nav-height)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link to="/catalog" className="wordmark" onClick={closeMenu}>
          Hiberus
        </Link>

        <div className="nav-links">
          <Link
            to="/catalog"
            className={`nav-link ${isActive("/catalog") ? "active" : ""}`}
          >
            Catalog
          </Link>
          <Link
            to="/cart"
            className={`nav-link ${isActive("/cart") ? "active" : ""}`}
          >
            Cart{count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <div className="nav-sep" />
          <span className="nav-meta">
            #{user.id} · {user.role}
          </span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`nav-hamburger-bar ${menuOpen ? "nav-hamburger-bar--rotate-1" : ""}`}
          />
          <span
            className={`nav-hamburger-bar ${menuOpen ? "nav-hamburger-bar--hide" : ""}`}
          />
          <span
            className={`nav-hamburger-bar ${menuOpen ? "nav-hamburger-bar--rotate-2" : ""}`}
          />
        </button>
      </nav>

      {menuOpen && (
        <nav className="nav-mobile-menu">
          <Link
            to="/catalog"
            className={`nav-mobile-link ${isActive("/catalog") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Catalog
          </Link>
          <Link
            to="/cart"
            className={`nav-mobile-link ${isActive("/cart") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Cart{count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <div className="nav-mobile-divider" />
          <span className="nav-mobile-meta">
            #{user.id} · {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm nav-mobile-signout"
          >
            Sign out
          </button>
        </nav>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

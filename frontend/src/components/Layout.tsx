import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return <Outlet />;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
        height: 'var(--nav-height)', display: 'flex', alignItems: 'center', padding: '0 32px',
      }}>
        <Link to="/catalog" className="wordmark">Hiberus</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>Catalog</Link>
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            Cart{count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <Link to="/order" className={`nav-link ${isActive('/order') ? 'active' : ''}`}>Orders</Link>
          <div className="nav-sep" />
          <span className="nav-meta">#{user.id} · {user.role}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Sign out</button>
        </div>
      </nav>
      <main><Outlet /></main>
    </div>
  );
}
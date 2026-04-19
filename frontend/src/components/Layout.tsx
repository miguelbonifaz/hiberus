import { Link, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Package, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{
        background: '#1e293b', color: 'white', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 56, gap: 24,
      }}>
        <Link to="/catalog" style={{ color: 'white', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
          Hiberus Shop
        </Link>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', alignItems: 'center' }}>
          <Link to="/catalog" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Package size={18} /> Catalog
          </Link>
          <Link to="/cart" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
            <ShoppingCart size={18} /> Cart
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -12,
                background: '#ef4444', borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </Link>
          <Link to="/order" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Package size={18} /> Orders
          </Link>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>#{user.id} ({user.role})</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <ShoppingCart size={64} style={{ color: '#94a3b8' }} />
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/catalog')} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Browse catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Shopping Cart</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Subtotal</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={tdStyle}>{item.product.name}</td>
              <td style={tdStyle}>${item.product.price.toFixed(2)}</td>
              <td style={tdStyle}>
                <input
                  type="number"
                  min={1}
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                  style={{ width: 60, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                />
              </td>
              <td style={tdStyle}>${(item.product.price * item.quantity).toFixed(2)}</td>
              <td style={tdStyle}>
                <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: 16 }}>
        <button onClick={clearCart} style={{ padding: '8px 16px', border: '1px solid #dc2626', color: '#dc2626', background: 'white', borderRadius: 4, cursor: 'pointer' }}>
          Clear Cart
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Total: ${total.toFixed(2)}</div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        style={{
          width: '100%', marginTop: 16, padding: '12px',
          background: '#2563eb', color: 'white', border: 'none', borderRadius: 4,
          cursor: 'pointer', fontWeight: 600, fontSize: 16,
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 8px', textAlign: 'left', fontWeight: 600, fontSize: 14 };
const tdStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 14 };
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';
import type { Order } from '../types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleCreateOrder = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.create(items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
      setOrder(res.data);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!order) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.checkout(order.id);
      setOrder(res.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
      if (err.response?.data?.order) {
        setOrder(err.response.data.order);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Checkout</h1>

      {!order ? (
        <>
          <h3>Order Summary</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((i) => (
              <li key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>{i.product.name} x {i.quantity}</span>
                <span>${(i.product.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginTop: 8 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button
            onClick={handleCreateOrder}
            disabled={loading || items.length === 0}
            style={btnStyle}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </>
      ) : (
        <>
          <div style={{ background: order.status === 'paid' ? '#dcfce7' : order.status === 'failed' ? '#fee2e2' : '#fef3c7', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              Order #{order.id} — Status: <span style={{ textTransform: 'uppercase' }}>{order.status}</span>
            </p>
            <p style={{ margin: '4px 0 0' }}>Total: ${order.total.toFixed(2)}</p>
          </div>

          <h3>Items</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {order.items.map((i) => (
              <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>{i.product.name} x {i.quantity}</span>
                <span>${i.subtotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {order.status === 'pending' && (
            <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
              {loading ? 'Processing...' : 'Pay Now (Simulated)'}
            </button>
          )}
          {order.status === 'failed' && (
            <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
              {loading ? 'Processing...' : 'Retry Payment'}
            </button>
          )}
          {order.status === 'paid' && (
            <button onClick={() => navigate('/catalog')} style={{ ...btnStyle, background: '#16a34a' }}>
              Continue Shopping
            </button>
          )}
        </>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%', marginTop: 16, padding: '12px',
  background: '#2563eb', color: 'white', border: 'none', borderRadius: 4,
  cursor: 'pointer', fontWeight: 600, fontSize: 16,
};
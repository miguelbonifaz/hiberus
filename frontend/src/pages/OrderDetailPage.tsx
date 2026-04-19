import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import type { Order } from '../types';

export default function OrderDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !user) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.get(parseInt(orderId));
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const res = await orderApi.checkout(order.id);
      setOrder(res.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
      if (err.response?.data?.order) setOrder(err.response.data.order);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Order Detail</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="number"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {order && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong>Order #{order.id}</strong>
            <span style={{
              padding: '4px 8px', borderRadius: 4,
              background: order.status === 'paid' ? '#dcfce7' : order.status === 'failed' ? '#fee2e2' : '#fef3c7',
              fontWeight: 600, textTransform: 'uppercase', fontSize: 13,
            }}>
              {order.status}
            </span>
          </div>
          <p>Customer ID: {order.customerId}</p>
          <p>Total: ${order.total.toFixed(2)}</p>
          <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
          {order.paidAt && <p>Paid: {new Date(order.paidAt).toLocaleString()}</p>}

          <h4 style={{ marginTop: 16 }}>Items</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {order.items.map((i) => (
              <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{i.product.name} x {i.quantity}</span>
                <span>${i.subtotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {order.status === 'pending' && (
            <button onClick={handleCheckout} disabled={loading} style={{ width: '100%', marginTop: 12, padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      )}

      <button onClick={() => navigate('/catalog')} style={{ marginTop: 16, padding: '8px 16px', background: 'white', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
        Back to Catalog
      </button>
    </div>
  );
}
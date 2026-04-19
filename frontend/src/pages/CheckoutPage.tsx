import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/services/api';
import PaymentForm from '@/components/PaymentForm';
import type { Order } from '@/types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  const handlePayment = async () => {
    if (!order) return;
    setProcessing(true);
    setError('');
    try {
      const res = await orderApi.checkout(order.id);
      const paidOrder = res.data.order;
      navigate(`/payment/success?orderId=${paidOrder.id}&total=${paidOrder.total}`, { replace: true });
    } catch (err: any) {
      const failedOrder = err.response?.data?.order;
      navigate(`/payment/failed?orderId=${order.id}${failedOrder ? `&total=${failedOrder.total}` : ''}`, { replace: true });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <>
      {processing && (
        <div className="payment-overlay">
          <div className="payment-overlay-content">
            <div className="payment-overlay-spinner" />
            <span className="payment-overlay-text">Processing payment...</span>
          </div>
        </div>
      )}

      <div className="page" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
          {order && (
            <span className="data">Order #{order.id}</span>
          )}
        </div>

        {!order ? (
          <>
            <h2 className="label label-xs" style={{ marginBottom: 16 }}>Order Summary</h2>
            <div style={{ border: '1px solid var(--gray-200)' }}>
              {items.map((i) => (
                <div key={i.product.id} className="order-line">
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{i.product.name}</span>
                    <span className="data" style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                      × {i.quantity}
                    </span>
                  </div>
                  <span className="data-lg">${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="total-row total-row-sm">
                <span className="label">Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}
            <button
              onClick={handleCreateOrder}
              disabled={loading || items.length === 0}
              className="btn btn-primary btn-block"
              style={{ marginTop: 20 }}
            >
              {loading ? 'Creating...' : 'Continue to Payment'}
            </button>
          </>
        ) : (
          <>
            <div style={{ border: '1px solid var(--gray-200)', padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="label label-xs">ORDER #{order.id}</span>
                <span className="data">${order.total.toFixed(2)}</span>
              </div>
              {order.items.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-200)', fontSize: 14 }}>
                  <span>{i.product.name} <span className="data" style={{ fontSize: 12, color: 'var(--gray-400)' }}>× {i.quantity}</span></span>
                  <span className="data">${i.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <h2 className="label label-xs" style={{ marginBottom: 8 }}>Payment Method</h2>
            <PaymentForm onSubmit={handlePayment} loading={loading} disabled={processing} />
          </>
        )}
      </div>
    </>
  );
}
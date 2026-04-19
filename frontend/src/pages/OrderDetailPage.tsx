import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/services/api';
import PaymentForm from '@/components/PaymentForm';
import type { Order } from '@/types';

export default function OrderDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !user) return;
    setLoading(true);
    setError("");
    try {
      const res = await orderApi.get(parseInt(orderId));
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;
    setProcessing(true);
    setError("");
    try {
      const res = await orderApi.checkout(order.id);
      const paidOrder = res.data.order;
      navigate(
        `/payment/success?orderId=${paidOrder.id}&total=${paidOrder.total}`,
        { replace: true },
      );
    } catch (err: any) {
      const failedOrder = err.response?.data?.order;
      navigate(
        `/payment/failed?orderId=${order.id}${failedOrder ? `&total=${failedOrder.total}` : ""}`,
        { replace: true },
      );
    } finally {
      setProcessing(false);
    }
  };

  const statusClass: Record<string, string> = {
    paid: "badge-paid",
    pending: "badge-pending",
    failed: "badge-failed",
  };

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

      <div className="page" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <h1 className="page-title">Orders</h1>
        </div>

        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 12, marginBottom: 40 }}
        >
          <input
            className="input"
            type="number"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ flex: 1, maxWidth: 240 }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="error-msg" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {order && (
          <div>
            <div className="order-header">
              <div>
                <div className="label label-xs" style={{ marginBottom: 4 }}>
                  ORDER #{order.id}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 400,
                  }}
                >
                  ${order.total.toFixed(2)}
                </div>
              </div>
              <span className={`badge ${statusClass[order.status] ?? ""}`}>
                {order.status}
              </span>
            </div>

            <div className="meta-grid" style={{ marginBottom: 24 }}>
              <div>
                <div className="meta-label">Customer</div>
                <div className="meta-value">#{order.customerId}</div>
              </div>
              <div>
                <div className="meta-label">Created</div>
                <div className="meta-value">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              {order.paidAt && (
                <div>
                  <div className="meta-label">Paid</div>
                  <div className="meta-value">
                    {new Date(order.paidAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th style={{ textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 600 }}>{i.product.name}</td>
                      <td>
                        <span className="data">{i.quantity}</span>
                      </td>
                      <td>
                        <span className="data">${i.unitPrice.toFixed(2)}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="data">${i.subtotal.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(order.status === "pending" || order.status === "failed") && (
              <>
                <hr className="divider" />
                <h2 className="label label-xs" style={{ marginBottom: 8 }}>
                  Payment Method
                </h2>
                <PaymentForm
                  onSubmit={handlePayment}
                  loading={loading}
                  disabled={processing}
                />
              </>
            )}

            {order.status === "paid" && (
              <div
                style={{
                  marginTop: 24,
                  padding: "16px 20px",
                  border: "1px solid var(--black)",
                  background: "var(--gray-100)",
                }}
              >
                <span
                  className="label label-xs"
                  style={{ color: "var(--black)" }}
                >
                  Payment confirmed
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

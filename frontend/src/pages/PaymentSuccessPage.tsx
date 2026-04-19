import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="payment-result-page">
      <div className={`payment-result ${showContent ? 'payment-result--visible' : ''}`}>
        <div className="payment-result-icon">
          <svg className="payment-check-svg" viewBox="0 0 52 52">
            <circle className="payment-check-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="payment-check-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="payment-result-title">Payment Successful</h1>

        {orderId && (
          <div className="payment-result-details">
            <div className="payment-result-row">
              <span className="label">Order</span>
              <span className="data">#{orderId}</span>
            </div>
            {total && (
              <div className="payment-result-row">
                <span className="label">Total</span>
                <span className="data-lg">${parseFloat(total).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <p className="payment-result-message">
          Your order has been confirmed and is being processed.
        </p>

        <button
          onClick={() => navigate('/catalog')}
          className="btn btn-primary btn-block"
          style={{ marginTop: 32 }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
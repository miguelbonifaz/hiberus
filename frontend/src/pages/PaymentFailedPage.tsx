import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="payment-result-page">
      <div className={`payment-result ${showContent ? 'payment-result--visible' : ''}`}>
        <div className="payment-result-icon">
          <svg className="payment-fail-svg" viewBox="0 0 52 52">
            <circle className="payment-fail-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="payment-fail-x" fill="none" d="M16 16 36 36 M36 16 16 36" />
          </svg>
        </div>

        <h1 className="payment-result-title payment-result-title--failed">Payment Failed</h1>

        {orderId && (
          <div className="payment-result-details">
            <div className="payment-result-row">
              <span className="label">Order</span>
              <span className="data">#{orderId}</span>
            </div>
          </div>
        )}

        <p className="payment-result-message">
          Your payment could not be processed. Please try again.
        </p>

        <button
          onClick={() => navigate(orderId ? `/order?orderId=${orderId}` : '/catalog')}
          className="btn btn-primary btn-block"
          style={{ marginTop: 32 }}
        >
          Retry Payment
        </button>

        <button
          onClick={() => navigate('/catalog')}
          className="btn btn-ghost btn-block"
          style={{ marginTop: 8 }}
        >
          Back to Catalog
        </button>
      </div>
    </div>
  );
}
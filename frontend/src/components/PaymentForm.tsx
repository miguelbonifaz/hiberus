import { useState, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';

interface PaymentFormProps {
  onSubmit: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

function getCardBrand(number: string): string {
  const d = number.replace(/\s/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^6/.test(d)) return 'discover';
  return '';
}

export default function PaymentForm({ onSubmit, loading, disabled }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleCardNumber = (e: ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiry = (e: ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleCvc = (e: ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleExpiryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && expiry.length === 3 && expiry.endsWith('/')) {
      setExpiry(expiry.slice(0, 1));
      e.preventDefault();
    }
  };

  const cardNumberValid = cardNumber.replace(/\s/g, '').length === 16;
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
  const cvcValid = /^\d{3,4}$/.test(cvc);
  const cardholderValid = cardholder.trim().length >= 2;
  const brand = getCardBrand(cardNumber);
  const allValid = cardNumberValid && expiryValid && cvcValid && cardholderValid;

  const handleSubmit = useCallback(async () => {
    if (!allValid || loading || disabled) return;
    await onSubmit();
  }, [allValid, loading, disabled, onSubmit]);

  return (
    <div className="payment-form">
      <div className="payment-form-header">
        <span className="payment-form-title">Payment Details</span>
        <span className="payment-form-brand-secure">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="5" width="10" height="8" rx="1" />
            <path d="M3 5V3.5a3 3 0 0 1 6 0V5" />
          </svg>
          Secure
        </span>
      </div>

      <div className="payment-card-field">
        <label className="payment-field-label">Card Number</label>
        <div className={`payment-input-wrap ${focused === 'cardNumber' ? 'payment-input-wrap--focus' : ''} ${cardNumberValid ? 'payment-input-wrap--valid' : ''}`}>
          <svg className="payment-card-icon" width="20" height="14" viewBox="0 0 24 17" fill="none">
            <rect x="1" y="1" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="1" y1="6" x2="23" y2="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <input
            className="payment-input payment-input--card"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={handleCardNumber}
            onFocus={() => setFocused('cardNumber')}
            onBlur={() => setFocused(null)}
            disabled={loading || disabled}
            inputMode="numeric"
            autoComplete="cc-number"
          />
          {brand && (
            <span className="payment-card-brand">
              {brand === 'visa' && 'VISA'}
              {brand === 'mastercard' && 'MC'}
              {brand === 'amex' && 'AMEX'}
              {brand === 'discover' && 'DISC'}
            </span>
          )}
        </div>
      </div>

      <div className="payment-card-field">
        <label className="payment-field-label">Cardholder Name</label>
        <div className={`payment-input-wrap ${focused === 'cardholder' ? 'payment-input-wrap--focus' : ''} ${cardholderValid ? 'payment-input-wrap--valid' : ''}`}>
          <input
            className="payment-input"
            placeholder="Full name on card"
            value={cardholder}
            onChange={(e) => setCardholder(e.target.value)}
            onFocus={() => setFocused('cardholder')}
            onBlur={() => setFocused(null)}
            disabled={loading || disabled}
            autoComplete="cc-name"
          />
        </div>
      </div>

      <div className="payment-row">
        <div className="payment-card-field payment-card-field--expiry">
          <label className="payment-field-label">Expiry</label>
          <div className={`payment-input-wrap ${focused === 'expiry' ? 'payment-input-wrap--focus' : ''} ${expiryValid ? 'payment-input-wrap--valid' : ''}`}>
            <input
              className="payment-input"
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiry}
              onKeyDown={handleExpiryKeyDown}
              onFocus={() => setFocused('expiry')}
              onBlur={() => setFocused(null)}
              disabled={loading || disabled}
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
        </div>
        <div className="payment-card-field payment-card-field--cvc">
          <label className="payment-field-label">CVC</label>
          <div className={`payment-input-wrap ${focused === 'cvc' ? 'payment-input-wrap--focus' : ''} ${cvcValid ? 'payment-input-wrap--valid' : ''}`}>
            <input
              className="payment-input"
              placeholder="123"
              value={cvc}
              onChange={handleCvc}
              onFocus={() => setFocused('cvc')}
              onBlur={() => setFocused(null)}
              disabled={loading || disabled}
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      </div>

      <button
        className={`btn btn-primary btn-block payment-submit ${loading ? 'payment-submit--loading' : ''}`}
        onClick={handleSubmit}
        disabled={!allValid || loading || disabled}
      >
        {loading ? (
          <span className="payment-submit-loading">
            <span className="payment-spinner" />
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="payment-disclaimer">
        This is a simulated payment. No real charges will be made.
        <br />
        Use any card number — 80% success rate.
      </p>
    </div>
  );
}
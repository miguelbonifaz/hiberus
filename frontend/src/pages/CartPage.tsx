import { useCart } from '@/context/CartContext';
import { useNavigate } from "react-router";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ paddingTop: 120 }}>
        <p className="empty-state-title">Your cart is empty</p>
        <button
          onClick={() => navigate("/catalog")}
          className="btn btn-primary"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1 className="page-title">Cart</h1>
        <span className="page-subtitle">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="table-scroll">
        <table className="data-table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product.id}>
                <td style={{ fontWeight: 600 }}>{item.product.name}</td>
                <td>
                  <span className="data">${item.product.price.toFixed(2)}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.product.id,
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="input-qty"
                  />
                </td>
                <td>
                  <span className="data-lg">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="total-row" style={{ marginTop: 8 }}>
        <button
          onClick={clearCart}
          className="btn btn-ghost"
          style={{ fontSize: 11 }}
        >
          Clear cart
        </button>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="label">Total</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="btn btn-primary btn-block"
        style={{ marginTop: 24 }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

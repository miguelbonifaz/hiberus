import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { productApi } from '../services/api';
import type { Product } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    productApi
      .get(Number(id))
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading</div>;

  if (error || !product) {
    return (
      <div className="page" style={{ maxWidth: 640 }}>
        <div className="error-msg">{error || 'Product not found'}</div>
        <button onClick={() => navigate('/catalog')} className="btn" style={{ marginTop: 16 }}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <nav className="breadcrumb">
        <button onClick={() => navigate('/catalog')} className="btn btn-ghost" style={{ padding: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Catalog</button>
        <span className="breadcrumb-sep">/</span>
        <span className="label" style={{ color: 'var(--black)' }}>#{product.id}</span>
      </nav>

      <div className="page-header" style={{ alignItems: 'flex-end' }}>
        <h1 className="page-title">{product.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <button onClick={() => navigate(`/products/${product.id}/edit`)} className="btn btn-ghost btn-sm">Edit</button>
          )}
          <button onClick={() => { addItem(product); toast(`${product.name} added to cart`); }} disabled={product.stock === 0} className="btn btn-primary btn-sm">
            Add to cart
          </button>
        </div>
      </div>

      <div className="meta-grid" style={{ marginBottom: 24 }}>
        <div>
          <div className="meta-label">Price</div>
          <div className="meta-value" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>
            ${product.price.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="meta-label">Stock</div>
          <div className="meta-value">
            {product.stock === 0 ? <span className="badge badge-outstock">Out of stock</span> : <span className="data">{product.stock}</span>}
          </div>
        </div>
        <div>
          <div className="meta-label">Category</div>
          <div className="meta-value"><span className="label">{product.category}</span></div>
        </div>
      </div>

      {product.description && (
        <div style={{ marginBottom: 24 }}>
          <div className="meta-label" style={{ marginBottom: 8 }}>Description</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{product.description}</p>
        </div>
      )}

      <hr className="divider" />

      <div className="meta-grid">
        <div>
          <div className="meta-label">Created</div>
          <div className="meta-value">{new Date(product.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <div className="meta-label">Product ID</div>
          <div className="meta-value">#{product.id}</div>
        </div>
      </div>
    </div>
  );
}
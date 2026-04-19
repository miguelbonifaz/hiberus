import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productApi } from '../services/api';
import type { Product, PaginatedResponse } from '../types';

export default function CatalogPage() {
  const { user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('id');
  const [loading, setLoading] = useState(false);

  // Admin form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '' });

  useEffect(() => {
    setLoading(true);
    productApi.list({ search, page, sort })
      .then((res) => {
        const data: PaginatedResponse<Product> = res.data;
        setProducts(data.items);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [search, page, sort]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.create({
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category,
      });
      setShowForm(false);
      setForm({ name: '', description: '', price: '', stock: '', category: '' });
      productApi.list({ search, page, sort }).then((res) => {
        setProducts(res.data.items);
        setTotal(res.data.total);
      });
    } catch (err: any) {
      alert(err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Error creating product');
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Catalog</h1>
        <span style={{ color: '#666' }}>User #{user?.id} ({user?.role})</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="id">Sort: Default</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="category">Category</option>
        </select>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            + New Product
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#f9fafb', padding: 16, borderRadius: 4, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <button type="submit" style={{ padding: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Create Product</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.category}</td>
                <td style={tdStyle}>${p.price.toFixed(2)}</td>
                <td style={tdStyle}>{p.stock}</td>
                <td style={tdStyle}>
                  <button onClick={() => addItem(p)} disabled={p.stock === 0} style={{ padding: '4px 12px', background: p.stock ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: 4, cursor: p.stock ? 'pointer' : 'not-allowed' }}>
                    {p.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={pageBtnStyle}>Prev</button>
        <span style={{ padding: '8px 12px' }}>Page {page} of {totalPages || 1}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={pageBtnStyle}>Next</button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 8px', textAlign: 'left', fontWeight: 600, fontSize: 14 };
const tdStyle: React.CSSProperties = { padding: '10px 8px', fontSize: 14 };
const pageBtnStyle: React.CSSProperties = { padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer' };
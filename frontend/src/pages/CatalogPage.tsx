import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { productApi } from '@/services/api';
import { CATEGORIES } from '@/constants';
import type { Product, PaginatedResponse } from '@/types';

const SORT_OPTIONS = [
  { value: "id", label: "Default" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "category", label: "Category" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function CatalogPage() {
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("id");
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const activeFilters = useMemo(() => {
    const count =
      (category ? 1 : 0) + (search ? 1 : 0) + (sort !== "id" ? 1 : 0);
    return count;
  }, [category, search, sort]);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ search, page, sort, direction, category: category || undefined })
      .then((res) => {
        const data: PaginatedResponse<Product> = res.data;
        setProducts(data.items);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [search, page, sort, direction, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("id");
    setDirection("ASC");
    setPage(1);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Catalog</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="page-subtitle">{total} products</span>
          {isAdmin && (
            <button
              onClick={() => navigate("/products/new")}
              className="btn btn-primary btn-sm"
            >
              + New Product
            </button>
          )}
        </div>
      </div>

      <div className="catalog-filters">
        <div className="filter-row">
          <div className="filter-search-wrap">
            <svg
              className="filter-search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input filter-search-input"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                className="filter-clear-btn"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-sort-group">
            <select
              className="input filter-sort-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortValue);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sort-dir"
              onClick={() => {
                setDirection(direction === "ASC" ? "DESC" : "ASC");
                setPage(1);
              }}
              title={direction === "ASC" ? "Ascending" : "Descending"}
            >
              {direction === "ASC" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="filter-categories">
          <span className="filter-categories-label">Category</span>
          <div className="filter-pills">
            <button
              className={`filter-pill ${category === "" ? "filter-pill--active" : ""}`}
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${category === cat ? "filter-pill--active" : ""}`}
                onClick={() => {
                  setCategory(category === cat ? "" : cat);
                  setPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          {activeFilters > 0 && (
            <button className="filter-reset" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No products found</p>
        </div>
      ) : (
        <>
          <div className="catalog-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-name">{p.name}</div>
                        {p.description && (
                          <div className="product-desc">{p.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="label">{p.category}</span>
                      </td>
                      <td>
                        <span className="data-lg">${p.price.toFixed(2)}</span>
                      </td>
                      <td>
                        {p.stock === 0 ? (
                          <span className="badge badge-outstock">
                            Out of stock
                          </span>
                        ) : (
                          <span className="data">{p.stock}</span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => navigate(`/products/${p.id}`)}
                            className="btn btn-ghost btn-sm"
                          >
                            View
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => navigate(`/products/${p.id}/edit`)}
                              className="btn btn-ghost btn-sm"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => {
                              addItem(p);
                              toast(`${p.name} added to cart`);
                            }}
                            disabled={p.stock === 0}
                            className="btn btn-primary btn-sm"
                          >
                            Add to cart
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="catalog-cards">
            {products.map((p) => (
              <div className="catalog-card" key={p.id}>
                <div className="catalog-card-header">
                  <div>
                    <div className="product-name">{p.name}</div>
                    {p.description && (
                      <div className="product-desc">{p.description}</div>
                    )}
                  </div>
                  <span className="data-lg">${p.price.toFixed(2)}</span>
                </div>
                <div className="catalog-card-meta">
                  <span className="label">{p.category}</span>
                  {p.stock === 0 ? (
                    <span className="badge badge-outstock">Out of stock</span>
                  ) : (
                    <span className="data">Stock: {p.stock}</span>
                  )}
                </div>
                <div className="catalog-card-actions">
                  <button
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="btn btn-ghost btn-sm"
                  >
                    View
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => navigate(`/products/${p.id}/edit`)}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      addItem(p);
                      toast(`${p.name} added to cart`);
                    }}
                    disabled={p.stock === 0}
                    className="btn btn-primary btn-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn btn-sm"
          >
            ← Prev
          </button>
          <span className="pagination-indicator">
            <span className="pagination-current">{page}</span>
            <span className="pagination-sep">/</span>
            <span className="pagination-total">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="btn btn-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

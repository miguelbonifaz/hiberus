import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
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

const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((o) => o.value));
const VALID_DIRS = new Set(["ASC", "DESC"]);

export default function CatalogPage() {
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sort: SortValue = VALID_SORTS.has(searchParams.get("sort") ?? "")
    ? (searchParams.get("sort") as SortValue)
    : "id";
  const direction: "ASC" | "DESC" = VALID_DIRS.has(searchParams.get("dir") ?? "")
    ? (searchParams.get("dir") as "ASC" | "DESC")
    : "ASC";
  const category = searchParams.get("category") ?? "";

  const activeFilters = useMemo(() => {
    const count =
      (category ? 1 : 0) + (search ? 1 : 0) + (sort !== "id" ? 1 : 0);
    return count;
  }, [category, search, sort]);

  const setFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        if (!("page" in updates)) {
          next.delete("page");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

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
    setSearchParams({}, { replace: true });
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          Catalog<span className="page-header-count">{total}</span>
        </h1>
        <div className="page-header-actions">
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
              onChange={(e) => setFilter({ search: e.target.value || null })}
            />
            {search && (
              <button
                className="filter-clear-btn"
                onClick={() => setFilter({ search: null })}
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
              onChange={(e) => setFilter({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sort-dir"
              onClick={() =>
                setFilter({ dir: direction === "ASC" ? "DESC" : "ASC" })
              }
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
              onClick={() => setFilter({ category: null })}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${category === cat ? "filter-pill--active" : ""}`}
                onClick={() =>
                  setFilter({ category: category === cat ? null : cat })
                }
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
          {activeFilters > 0 && (
            <p className="empty-state-hint">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <>
          <div className="catalog-table-wrap">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="th-right">Actions</th>
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
                        <div className="table-actions">
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
            onClick={() => setFilter({ page: String(Math.max(1, page - 1)) })}
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
            onClick={() => setFilter({ page: String(page + 1) })}
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
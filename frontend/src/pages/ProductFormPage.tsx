import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { productApi } from "../services/api";

type FormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};
const empty: FormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit) return;
    productApi
      .get(Number(id))
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          stock: String(p.stock),
          category: p.category,
        });
      })
      .catch(() => navigate("/catalog"))
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
    };

    try {
      if (isEdit) {
        await productApi.update(Number(id), payload);
      } else {
        await productApi.create(payload);
      }
      navigate("/catalog");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ _: err.response?.data?.error || "Something went wrong" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Loading</div>;
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <nav className="breadcrumb">
        <button
          onClick={() => navigate("/catalog")}
          className="btn btn-ghost"
          style={{
            padding: 0,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Catalog
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="label" style={{ color: "var(--black)" }}>
          {isEdit ? `Edit #${id}` : "New Product"}
        </span>
      </nav>

      <div className="page-header" style={{ alignItems: "flex-end" }}>
        <h1 className="page-title">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
        {isEdit && <span className="page-subtitle">ID #{id}</span>}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        <div className="field">
          <label>Name *</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Product name"
          />
          {errors.name && (
            <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
              {errors.name}
            </span>
          )}
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            className="input"
            value={form.description}
            onChange={set("description")}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div className="grid-2col">
          <div className="field">
            <label>Price *</label>
            <input
              className="input"
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={set("price")}
              placeholder="0.00"
            />
            {errors.price && (
              <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
                {errors.price}
              </span>
            )}
          </div>
          <div className="field">
            <label>Stock *</label>
            <input
              className="input"
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={set("stock")}
              placeholder="0"
            />
            {errors.stock && (
              <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
                {errors.stock}
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label>Category *</label>
          <input
            className="input"
            required
            value={form.category}
            onChange={set("category")}
            placeholder="e.g. Electronics"
          />
          {errors.category && (
            <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
              {errors.category}
            </span>
          )}
        </div>

        {errors._ && <div className="error-msg">{errors._}</div>}

        <hr className="divider" />

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="btn"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

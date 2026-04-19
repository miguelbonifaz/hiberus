import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'ADMIN'>('CLIENT');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      setError('Enter a valid customer ID (positive number)');
      return;
    }
    login(Number(id), role);
    navigate('/catalog');
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Customer ID</label>
          <input
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. 1"
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'CLIENT' | 'ADMIN')}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
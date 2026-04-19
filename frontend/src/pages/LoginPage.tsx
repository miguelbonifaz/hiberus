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
      setError('Enter a valid customer ID');
      return;
    }
    login(Number(id), role);
    navigate('/catalog');
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-wordmark">Hiberus</div>
        <p className="login-tagline">Commerce Platform</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label>Customer ID</label>
            <input
              className="input"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          <div className="field">
            <label>Role</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as 'CLIENT' | 'ADMIN')}
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: -8 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" style={{ height: 48, marginTop: 8 }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/wardrobe');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card glass animate-fadein">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">✦ Youra</Link>
          <h1 className="auth-title">Tekrar Hoş Geldin</h1>
          <p className="auth-sub">Hesabına giriş yaparak dolabına ulaş</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-posta</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Şifre</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">⚠️ {error}</p>}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Giriş Yap →'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Hesabın yok mu?</span>
          <Link to="/register" className="auth-link">Üye Ol</Link>
        </div>
      </div>
    </div>
  );
}

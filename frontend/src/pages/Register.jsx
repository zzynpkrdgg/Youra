import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Kayıt başarısız. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card glass animate-fadein">
        <div className="auth-header">
          <Link to="/" className="auth-logo">✦ Youra</Link>
          <h1 className="auth-title">Hesap Oluştur</h1>
          <p className="auth-sub">Ücretsiz üye ol, stilini keşfet</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Ad Soyad</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="Tolga Acar"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">E-posta</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Şifre</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Şifre Tekrar</label>
            <input
              id="reg-confirm"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">⚠️ {error}</p>}

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '✦ Üye Ol'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Zaten hesabın var mı?</span>
          <Link to="/login" className="auth-link">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}

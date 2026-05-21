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
      setError(err.response?.data?.message ?? 'Kayıt başarısız. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing auth-page animate-fadein">
      <div className="auth-split">
        <div className="auth-left">
          <div className="hero-content">
            <p className="hero-desc" style={{ marginBottom: '40px' }}>
              Yapay zeka stil asistanınla dolabındaki her parçayı yeniden keşfet. Modanın sınırlarını zorlayan benzersiz kombinlerle kendi tarzını yarat ve her an göz alıcı ol.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-sharp btn-sharp--black">
                Giriş Yap
              </Link>
              <Link to="/register" className="btn-sharp btn-sharp--white">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-box animate-fadein">
            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                className="auth-input"
                type="text"
                placeholder="Ad Soyad"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                autoFocus
              />
              <input
                className="auth-input"
                type="email"
                placeholder="E-posta"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Şifre (En az 6 karakter)"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Şifre Tekrar"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                required
              />

              {error && <p className="error-msg" style={{margin:0, fontSize: '12px'}}>{error}</p>}
              
              <button
                id="register-submit"
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'KAYIT YAPILIYOR...' : 'ÜYE OL'}
              </button>
            </form>

            <div className="auth-footer">
              <span className="auth-footer-text">Zaten hesabın var mı?</span>
              <Link to="/login" className="auth-footer-link">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="marquee-container" style={{zIndex: 0}}>
        <div className="marquee-content">
          <span>YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA </span>
          <span>YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA </span>
        </div>
      </div>
    </div>
  );
}

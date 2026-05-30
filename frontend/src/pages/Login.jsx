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
      const response = await login(form.email, form.password);
      
      // Backend'den gelen user objesinde stil tercihleri varsa kaydet
      if (response.user && response.user.style_preferences && response.user.style_preferences.length > 0) {
        localStorage.setItem('youra_style_preferences', JSON.stringify(response.user.style_preferences));
        navigate('/wardrobe');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Giriş başarısız. Bilgilerinizi kontrol edin.');
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
                type="email"
                placeholder="E-posta"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                autoFocus
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Şifre"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
              
              {error && <p className="error-msg" style={{margin:0, fontSize: '12px'}}>{error}</p>}
              
              <button
                id="login-submit"
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
              </button>
            </form>

            <div className="auth-footer">
              <span className="auth-footer-text">Hesabın yok mu?</span>
              <Link to="/register" className="auth-footer-link">Üye Ol</Link>
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

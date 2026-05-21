import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import './Landing.css';

export default function Landing({ initialForm = null }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeForm, setActiveForm] = useState(initialForm); // null, 'login', 'register'
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      const hasStyle = localStorage.getItem('youra_style_preferences');
      if (hasStyle) {
        setActiveForm(null);
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await register(regForm.name, regForm.email, regForm.password);
      setActiveForm(null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Kayıt başarısız. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const switchForm = (formName) => {
    setError('');
    setActiveForm(formName);
  };

  return (
    <div className="landing auth-page animate-fadein">
      <div className="auth-split">
        <div className="auth-left">
          <div className="hero-content" style={{ position: 'relative' }}>
            {/* Sol taraftan kısaltmak için left oranını artırıp minWidth'i düşürüyoruz */}
            <div style={{ position: 'absolute', top: '0', left: '130%', minWidth: '550px', zIndex: 50 }}>
              <WeatherWidget />
            </div>

            <p className="hero-desc" style={{ marginBottom: '40px' }}>
              Yapay zeka stil asistanınla dolabındaki her parçayı yeniden keşfet. Modanın sınırlarını zorlayan benzersiz kombinlerle kendi tarzını yarat ve her an göz alıcı ol.
            </p>

            <div className="hero-actions">
              {user ? (
                <>
                  <Link to="/wardrobe" className="btn-sharp btn-sharp--black">
                    Dolabıma Git
                  </Link>
                  <Link to="/outfit" className="btn-sharp btn-sharp--white">
                    Kombin Öner
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => switchForm('login')} className="btn-sharp btn-sharp--black">
                    Giriş Yap
                  </button>
                  <button onClick={() => switchForm('register')} className="btn-sharp btn-sharp--white">
                    Kayıt Ol
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="auth-right">
          {activeForm === 'login' && (
            <div className="auth-box animate-fadein">
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <input className="auth-input" type="email" placeholder="E-posta" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required autoFocus />
                <input className="auth-input" type="password" placeholder="Şifre" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
                {error && <p className="error-msg" style={{margin:0, fontSize: '12px'}}>{error}</p>}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
                </button>
              </form>
              <div className="auth-footer">
                <span className="auth-footer-text">Hesabın yok mu?</span>
                <button className="auth-footer-link" style={{background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={() => switchForm('register')}>Üye Ol</button>
              </div>
            </div>
          )}

          {activeForm === 'register' && (
            <div className="auth-box animate-fadein">
              <form className="auth-form" onSubmit={handleRegSubmit}>
                <input className="auth-input" type="text" placeholder="Ad Soyad" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required autoFocus />
                <input className="auth-input" type="email" placeholder="E-posta" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
                <input className="auth-input" type="password" placeholder="Şifre (En az 6 karakter)" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required />
                <input className="auth-input" type="password" placeholder="Şifre Tekrar" value={regForm.confirm} onChange={e => setRegForm({...regForm, confirm: e.target.value})} required />
                {error && <p className="error-msg" style={{margin:0, fontSize: '12px'}}>{error}</p>}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'KAYIT YAPILIYOR...' : 'ÜYE OL'}
                </button>
              </form>
              <div className="auth-footer">
                <span className="auth-footer-text">Zaten hesabın var mı?</span>
                <button className="auth-footer-link" style={{background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={() => switchForm('login')}>Giriş Yap</button>
              </div>
            </div>
          )}
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

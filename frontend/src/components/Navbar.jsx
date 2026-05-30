import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/wardrobe',   label: 'Dolabım' },
  { to: '/myoutfits',  label: 'Kombinlerim' },
  { to: '/create',     label: 'Kombin Oluştur' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-text">YOURA</span>
          </Link>

          {/* Nav links — yalnızca giriş yapılmışsa */}
          {user && (
            <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`navbar-link ${location.pathname === to ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  style={{ color: '#ec4899' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ADMIN PANEL
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="profile-dropdown-container">
              <div className="navbar-avatar" title={user.name}>
                <span>{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
              </div>
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item">PROFİL</Link>
                <button className="dropdown-item" onClick={handleLogout}>ÇIKIŞ</button>
              </div>
            </div>
          ) : null}

          <button onClick={toggleTheme} className="theme-toggle-btn" title="Temayı Değiştir">
            {theme === 'light' ? '☾' : '☼'}
          </button>

          {user && (
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

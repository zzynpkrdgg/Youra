import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/wardrobe', label: 'Dolabım', icon: '👗' },
  { to: '/outfit',   label: 'Kombin',  icon: '✨' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">✦</span>
          <span className="navbar-logo-text">Youra</span>
        </Link>

        {/* Nav links — yalnızca giriş yapılmışsa */}
        {user && (
          <nav className="navbar-links">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`navbar-link ${location.pathname === to ? 'active' : ''}`}
              >
                <span className="navbar-link-icon">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/profile" className="navbar-avatar" title={user.name}>
                <span>{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Üye Ol</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

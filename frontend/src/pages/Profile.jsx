import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="page-wrapper">
      <div className="profile-page container animate-fadein">
        {/* Avatar */}
        <div className="profile-hero">
          <div className="profile-avatar">{initial}</div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* Info Card */}
        <div className="profile-card glass">
          <h2 className="profile-section-title">Hesap Bilgileri</h2>
          <div className="profile-fields">
            <ProfileField label="Ad Soyad"  value={user.name} />
            <ProfileField label="E-posta"   value={user.email} />
            <ProfileField label="Üyelik"    value="Youra Üyesi" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="profile-card glass profile-danger">
          <h2 className="profile-section-title profile-section-title--danger">Hesap İşlemleri</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value}</span>
    </div>
  );
}

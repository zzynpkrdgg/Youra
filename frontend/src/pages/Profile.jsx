import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Profile.css';

const ALL_STYLES = [
  { id: 'casual',       name: 'Casual' },
  { id: 'sport',        name: 'Sport' },
  { id: 'smart-casual', name: 'Smart Casual' },
  { id: 'coquette',     name: 'Coquette' },
  { id: 'streetwear',   name: 'Streetwear' },
  { id: 'minimalist',   name: 'Minimalist' },
  { id: 'y2k',          name: 'Y2K' },
  { id: 'bohemian',     name: 'Boho' },
  { id: 'business',     name: 'Business' },
  { id: 'vintage',      name: 'Vintage' },
  { id: 'grunge',       name: 'Grunge' },
  { id: 'elegant',      name: 'Elegant' },
];

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [clothingCount, setClothingCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [loadingItems, setLoadingItems] = useState(true);
  const [savedStyles, setSavedStyles] = useState([]);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [tempStyles, setTempStyles] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    // Load styles
    const styles = JSON.parse(localStorage.getItem('youra_style_preferences') || '[]');
    setSavedStyles(styles);

    // Load counts
    const fetchCount = async () => {
      try {
        const [clothRes, outfitRes] = await Promise.all([
          api.get('/clothing'),
          api.get('/outfit')
        ]);
        setClothingCount(clothRes.data.length);
        setOutfitCount(outfitRes.data.length);
      } catch {
        // Fallback mock number
        setClothingCount(5); 
        setOutfitCount(2);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: editName, email: editEmail });
      setShowProfileModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Profil güncellenemedi');
    }
  };

  const canEditName = () => {
    if (!user?.lastNameChangeAt) return true;
    const diffTime = Math.abs(new Date() - new Date(user.lastNameChangeAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  };

  const getNextNameChangeDate = () => {
    if (!user?.lastNameChangeAt) return '';
    const date = new Date(user.lastNameChangeAt);
    date.setDate(date.getDate() + 15);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const openStyleModal = () => {
    setTempStyles([...savedStyles]);
    setShowStyleModal(true);
  };

  const toggleTempStyle = (id) => {
    setTempStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleStyleSave = () => {
    localStorage.setItem('youra_style_preferences', JSON.stringify(tempStyles));
    setSavedStyles(tempStyles);
    setShowStyleModal(false);
  };

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="profile-wrapper">
      <div className="profile-container animate-fadein">
        
        {/* Header Box */}
        <div className="profile-header-box">
          <div className="profile-avatar-large">{initial}</div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-header-actions">
            <button className="btn-sharp btn-sharp--white" onClick={() => {
              setEditName(user.name);
              setEditEmail(user.email);
              setShowProfileModal(true);
            }}>
              PROFİLİ DÜZENLE
            </button>
            <button className="btn-sharp btn-sharp--black" onClick={handleLogout}>
              ÇIKIŞ YAP
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="profile-grid">
          {/* Wardrobe Stat */}
          <div className="profile-card">
            <h2 className="profile-card-title">DOLAP DURUMU</h2>
            <div className="profile-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Clothing Section */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="profile-stat-number" style={{ fontSize: '2.5rem' }}>{loadingItems ? '-' : clothingCount}</span>
                  <p style={{ marginTop: '5px', fontWeight: 'bold' }}>TOPLAM KIYAFET</p>
                </div>
                <button className="btn-sharp btn-sharp--black" onClick={() => navigate('/wardrobe')} style={{ padding: '8px 16px', fontSize: '14px' }}>
                  DOLABA GİT
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: '2px', background: 'var(--color-text)', width: '100%' }}></div>

              {/* Outfits Section */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="profile-stat-number" style={{ fontSize: '2.5rem' }}>{loadingItems ? '-' : outfitCount}</span>
                  <p style={{ marginTop: '5px', fontWeight: 'bold' }}>TOPLAM KOMBİN</p>
                </div>
                <button className="btn-sharp btn-sharp--black" onClick={() => navigate('/my-outfits')} style={{ padding: '8px 16px', fontSize: '14px' }}>
                  KOMBİNLERE GİT
                </button>
              </div>

            </div>
          </div>

          {/* Style Preferences */}
          <div className="profile-card">
            <h2 className="profile-card-title">
              TARZ TERCİHLERİ
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={openStyleModal} title="Düzenle">
                ✎
              </button>
            </h2>
            <div className="profile-card-content">
              {savedStyles.length === 0 ? (
                <p>Henüz tarz seçilmedi.</p>
              ) : (
                <div className="profile-styles-list">
                  {savedStyles.map(id => {
                    const found = ALL_STYLES.find(s => s.id === id);
                    return <span key={id} className="profile-style-tag">{found ? found.name : id}</span>;
                  })}
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              <button className="btn-sharp btn-sharp--black" onClick={openStyleModal} style={{ width: '100%' }}>
                TARZIMI GÜNCELLE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-box animate-fadein">
            <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            <h2 className="modal-title">PROFİLİ DÜZENLE</h2>
            <form className="modal-form" onSubmit={handleProfileSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  className="modal-input" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  placeholder="Ad Soyad"
                  maxLength={15}
                  disabled={!canEditName()}
                  required
                />
                {!canEditName() && <span style={{fontSize: '11px', color: 'red', fontWeight: 'bold'}}>Kullanıcı isminizi {getNextNameChangeDate()} tarihinde değiştirebilirsiniz.</span>}
              </div>
              <input 
                className="modal-input" 
                value={editEmail} 
                onChange={e => setEditEmail(e.target.value)} 
                placeholder="E-posta"
                type="email"
                required
              />
              <button type="submit" className="btn-sharp btn-sharp--black" style={{ marginTop: '10px', width: '100%' }}>
                KAYDET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Style Edit Modal */}
      {showStyleModal && (
        <div className="modal-overlay">
          <div className="modal-box animate-fadein">
            <button className="modal-close" onClick={() => setShowStyleModal(false)}>×</button>
            <h2 className="modal-title">TARZINI SEÇ</h2>
            <div className="style-edit-grid">
              {ALL_STYLES.map(style => (
                <button
                  key={style.id}
                  className={`style-edit-btn ${tempStyles.includes(style.id) ? 'selected' : ''}`}
                  onClick={() => toggleTempStyle(style.id)}
                >
                  {style.name}
                </button>
              ))}
            </div>
            <button 
              className="btn-sharp btn-sharp--black" 
              style={{ width: '100%' }}
              onClick={handleStyleSave}
              disabled={tempStyles.length === 0}
            >
              TARZLARI KAYDET
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

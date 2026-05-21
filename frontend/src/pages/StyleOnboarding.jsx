import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StyleOnboarding.css';

const STYLES = [
  { id: 'casual',       name: 'Casual',        emoji: '', desc: 'Rahat günlük şıklık',          color: '#3b82f6' },
  { id: 'sport',        name: 'Sport',          emoji: '', desc: 'Aktif ve dinamik görünüm',      color: '#10b981' },
  { id: 'smart-casual', name: 'Smart Casual',   emoji: '', desc: 'Şık ama rahat denge',           color: '#8b5cf6' },
  { id: 'coquette',     name: 'Coquette',       emoji: '', desc: 'Feminen ve zarif detaylar',      color: '#ec4899' },
  { id: 'streetwear',   name: 'Streetwear',     emoji: '', desc: 'Sokak modasının enerjisi',       color: '#f97316' },
  { id: 'minimalist',   name: 'Minimalist',     emoji: '', desc: 'Az ama öz, sade zarafet',        color: '#94a3b8' },
  { id: 'y2k',          name: 'Y2K',            emoji: '', desc: "2000'lerin retro trendi",        color: '#a855f7' },
  { id: 'bohemian',     name: 'Boho',           emoji: '', desc: 'Özgür ruhlu bohemian stil',      color: '#d97706' },
  { id: 'business',     name: 'Business',       emoji: '', desc: 'Profesyonel güçlü görünüm',      color: '#475569' },
  { id: 'vintage',      name: 'Vintage',        emoji: '', desc: 'Klasik dönemlerin şıklığı',     color: '#92400e' },
  { id: 'grunge',       name: 'Grunge',         emoji: '', desc: 'Sert ve edgy alternatif stil',   color: '#7f1d1d' },
  { id: 'elegant',      name: 'Elegant',        emoji: '', desc: 'Zamansız sofistike zarafet',     color: '#6366f1' },
];

export default function StyleOnboarding() {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggle = (id) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const handleSubmit = () => {
    if (selected.length === 0) return;
    localStorage.setItem('youra_style_preferences', JSON.stringify(selected));
    navigate('/wardrobe');
  };

  return (
  return (
    <div className="onb-page">
      <div className="onb-inner animate-fadein">
        <div className="onb-header">
          <h1 className="onb-title">STİLİNİ TANIYALIM</h1>
          <p className="onb-sub">
            Sana en iyi kombinleri önerebilmem için tarzını seç.<br />
            <strong>En az bir seçenek işaretlemen gerekiyor.</strong>
          </p>
        </div>

        <div className="onb-grid">
          {STYLES.map(style => {
            const isActive = selected.includes(style.id);
            return (
              <button
                key={style.id}
                className={`onb-card ${isActive ? 'onb-card--active' : ''}`}
                onClick={() => toggle(style.id)}
                style={{ '--style-color': style.color }}
              >
                {isActive && <span className="onb-check">✓</span>}
                <span className="onb-emoji">{style.emoji}</span>
                <span className="onb-name">{style.name}</span>
                <span className="onb-desc">{style.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="onb-footer">
          <span className="onb-count">
            {selected.length > 0
              ? `${selected.length} tarz seçildi`
              : 'Bir veya daha fazla seçeneği işaretleyiniz'}
          </span>
          <button
            className="btn-sharp btn-sharp--black"
            disabled={selected.length === 0}
            onClick={handleSubmit}
          >
            DEVAM ET →
          </button>
        </div>
      </div>
    </div>
  );
}

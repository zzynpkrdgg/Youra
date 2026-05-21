import { useState, useEffect, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';
import './ClothingCard.css';

const CATEGORY_ICONS = {
  'Üst':      '',
  'Alt':      '',
  'Elbise':   '',
  'Dış Giyim':'',
  'Ayakkabı': '',
  'Aksesuar': '',
  'Diğer':    '',
};

const SEASON_COLORS = {
  'İlkbahar': '#10b981',
  'Yaz':      '#f59e0b',
  'Sonbahar': '#f97316',
  'Kış':      '#60a5fa',
  'Tüm Mevsimler': '#8b5cf6',
};

export default function ClothingCard({ item, onDelete, onEdit, onToggleDirty }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef(null);
  const icon        = CATEGORY_ICONS[item.category] ?? '';
  const seasonColor = SEASON_COLORS[item.season]    ?? '#a09db8';

  // Başka bir interaktif elemana tıklanınca kapat (boş ekrana tıklamada kapanmasın)
  useEffect(() => {
    if (!showConfirm) return;
    const handler = (e) => {
      const isInteractive = e.target.closest('button, a, input, select, [role="button"]');
      const isInsideConfirm = confirmRef.current?.contains(e.target);
      if (isInteractive && !isInsideConfirm) {
        setShowConfirm(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [showConfirm]);

  return (
    <div className="clothing-card animate-fadein">

      {/* Sağ üst: Düzenle + Kirli Sepeti */}
      <div className="clothing-card-top-actions">
        <button
          className="card-icon-btn"
          title="Düzenle"
          onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(item); }}
        >
          ✏
        </button>
        <button
          className={`card-icon-btn ${item.isDirty ? 'card-icon-btn--active' : ''}`}
          title={item.isDirty ? 'Temizlendi İşaretle' : 'Kirli Sepetine At'}
          onClick={(e) => { e.stopPropagation(); if (onToggleDirty) onToggleDirty(item._id); }}
        >
          🧺
        </button>
      </div>

      {/* Görsel */}
      <div
        className="clothing-card-img"
        style={
          !(item.image || item.imageUrl)
            ? { background: `linear-gradient(135deg, ${item.color ?? '#8b5cf6'}22, ${item.color ?? '#ec4899'}44)` }
            : {}
        }
      >
        {(item.image || item.imageUrl) ? (
          <img 
            src={item.image || item.imageUrl} 
            alt={item.style || item.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
          />
        ) : (
          icon && <span className="clothing-card-emoji">{icon}</span>
        )}
        {item.color && (
          <span
            className="clothing-color-dot"
            style={{ background: item.color }}
            title={item.color}
          />
        )}
      </div>

      {/* İçerik */}
      <div className="clothing-card-body">
        <div className="clothing-card-header">
          <h3 className="clothing-card-name">{item.style || item.name}</h3>
          {item.season && item.season !== 'Tümü' && (
            <span className="clothing-card-season">{item.season}</span>
          )}
        </div>

        <div className="clothing-card-meta">
          <span className="clothing-card-brand">{item.category}</span>
          {item.brand && (
            <>
              <span className="clothing-card-brand">•</span>
              <span className="clothing-card-brand">{item.brand}</span>
            </>
          )}
        </div>
      </div>

      {/* Alt: SİL butonu — her zaman sabit */}
      <div className="clothing-card-footer">
        <button
          className="card-delete-btn btn-sharp btn-sharp--black"
          onClick={() => setShowConfirm(true)}
        >
          SİL
        </button>
      </div>

      {/* Onay Diyaloğu */}
      {showConfirm && (
        <ConfirmDialog
          message="Bu kıyafeti silmek istediğine emin misin?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => { setShowConfirm(false); if (onDelete) onDelete(item._id); }}
        />
      )}
    </div>
  );
}

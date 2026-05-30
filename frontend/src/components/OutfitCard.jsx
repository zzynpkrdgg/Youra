import { useState, useEffect, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';
import './OutfitCard.css';
import api from '../api/axios';

export default function OutfitCard({ outfit, onDelete, onEdit, onToggleFavorite }) {
  const [isFavorited, setIsFavorited] = useState(outfit.isFavorite ?? false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef(null);

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

  const formattedDate = new Date(outfit.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();

  const handleFavorite = async () => {
    const previous = isFavorited;
    const next = !previous;
    setIsFavorited(next);
    if (onToggleFavorite) onToggleFavorite(outfit._id, next);
    try {
      await api.patch(`/outfit/${outfit._id}/favorite`);
    } catch (err) {
      setIsFavorited(previous);
      if (onToggleFavorite) onToggleFavorite(outfit._id, previous);
      alert('Favori güncellenemedi.');
    }
  };

  return (
    <div className="outfit-card animate-fadein">

      {/* Sağ üst: Düzenle + Favorile */}
      <div className="outfit-card-top-actions">
        <button
          className="card-icon-btn"
          title="Düzenle"
          onClick={() => onEdit && onEdit(outfit)}
        >
          ✏
        </button>
        <button
          className={`card-icon-btn ${isFavorited ? 'card-icon-btn--favorited' : ''}`}
          title={isFavorited ? 'Favorilerden Çıkar' : 'Favorile'}
          onClick={handleFavorite}
        >
          {isFavorited ? '★' : '☆'}
        </button>
      </div>

      {/* Başlık */}
      <div className="outfit-card-header">
        <div className="outfit-card-title-area">
          <h3 className="outfit-card-name">{outfit.title}</h3>
          {outfit.occasion && (
            <span className="outfit-card-style">{outfit.occasion.toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Kıyafet küçük önizlemeleri */}
      {outfit.items && outfit.items.length > 0 && (
        <div className="outfit-card-items">
          {outfit.items.slice(0, 6).map((item, i) => (
            <div
              key={item._id ?? i}
              className="outfit-card-thumb"
              title={item.style || item.name || ''}
              style={{
                background: item.image
                  ? `url(${item.image}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${item.color ?? '#888'}88, ${item.color ?? '#888'}22)`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {!item.image && <span className="outfit-card-thumb-label">{(item.style || item.name || '?').slice(0, 6)}</span>}
            </div>
          ))}
          {outfit.items.length > 6 && (
            <div
              className="outfit-card-thumb"
              style={{
                background: 'var(--color-bg-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
              }}
              title={`+${outfit.items.length - 6} daha`}
            >
              <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-text)' }}>
                +{outfit.items.length - 6}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Not */}
      {outfit.notes && (
        <p className="outfit-card-notes">{outfit.notes}</p>
      )}

      {/* Alt: tarih + SİL — her zaman sabit */}
      <div className="outfit-card-footer">
        <span className="outfit-card-date">{formattedDate}</span>
        <button
          className="card-delete-btn btn-sharp btn-sharp--black"
          onClick={() => setShowConfirm(true)}
        >
          SİL
        </button>
      </div>

      {/* Onay Diyaloğu */}
      {showConfirm && (
        <div ref={confirmRef}>
          <ConfirmDialog
            message="Bu kombini silmek istediğine emin misin?"
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => { setShowConfirm(false); if (onDelete) onDelete(outfit._id); }}
          />
        </div>
      )}
    </div>
  );
}

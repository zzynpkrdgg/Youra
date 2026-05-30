import { useState } from 'react';
import './AddClothingModal.css'; // Aynı stilleri kullan

const STYLES = ['Günlük', 'Spor', 'Şık', 'İş', 'Gece', 'Plaj', 'Kış', 'Yaz', 'Vintage', 'Minimalist', 'Diğer'];

const INITIAL_FORM = { name: '', style: '', notes: '' };

export default function SaveOutfitModal({ onClose, onSubmit, loading, outfitItems = [], initialData }) {
  const [form, setForm] = useState(initialData || INITIAL_FORM);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, items: outfitItems, savedAt: new Date().toISOString() });
  };

  return (
    <div className="brut-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="brut-modal-panel animate-fadein" style={{ maxWidth: '520px' }}>
        <form className="brut-modal-form" onSubmit={handleSubmit}>

          {/* Header */}
          <div className="brut-modal-header">
            <h2 className="brut-modal-title">{initialData ? 'KOMBİNİ DÜZENLE' : 'KOMBİNİ KAYDET'}</h2>
            <button type="button" className="brut-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="brut-modal-line-container">
            <div className="brut-modal-line" />
          </div>

          {/* Seçilen kıyafet özeti */}
          {outfitItems.length > 0 && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-text)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {outfitItems.map(item => (
                <div
                  key={item._id}
                  title={item.name}
                  style={{
                    width: '32px', height: '32px',
                    background: `linear-gradient(135deg, ${item.color}88, ${item.color}33)`,
                    border: '2px solid var(--color-text)',
                    boxShadow: '2px 2px 0 var(--color-text)',
                    flexShrink: 0,
                  }}
                />
              ))}
              <span style={{ fontSize: '11px', fontWeight: '700', alignSelf: 'center', color: 'var(--color-text-2)' }}>
                {outfitItems.length} PARÇA
              </span>
            </div>
          )}

          <div className="brut-modal-body" style={{ flexDirection: 'column' }}>
            {/* Kombin Adı */}
            <div className="brut-form-group">
              <label className="brut-label">KOMBİN ADI *</label>
              <input
                className="brut-input"
                placeholder="ÖRN: YAZA ÖZEL GÜNLÜK KOMBİNİM"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Tarz */}
            <div className="brut-form-group">
              <label className="brut-label">TARZ</label>
              <select className="brut-select" value={form.style} onChange={e => set('style', e.target.value)}>
                <option value="">TARZ SEÇ...</option>
                {STYLES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Notlar */}
            <div className="brut-form-group">
              <label className="brut-label">NOTLAR</label>
              <textarea
                className="brut-input"
                placeholder="BU KOMBİN HAKKINDAKİ NOTLARIN..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="brut-modal-footer">
            <button type="button" className="btn-sharp btn-sharp--white brut-modal-cancel" onClick={onClose}>İPTAL</button>
            <button type="submit" className="btn-sharp btn-sharp--black brut-modal-submit" disabled={loading || !form.name.trim()}>
              {loading ? 'KAYDEDİLİYOR...' : 'KAYDET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import './AddClothingModal.css';

const CATEGORIES = ['Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['Mevsim', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];

const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#10b981','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#ffffff','#6b7280','#1f2937',
];

const INITIAL_FORM = {
  name: '', category: 'Üst', season: 'Mevsim',
  color: '#000000', brand: '', imageUrl: '', notes: '', file: null,
};

export default function AddClothingModal({ onClose, onSubmit, loading, initialData }) {
  const [form, setForm] = useState(initialData || INITIAL_FORM);
  const [isDragging, setIsDragging] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set('imageUrl', url);
    set('file', file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      set('imageUrl', url);
      set('file', file);
    }
  };

  return (
    <div className="brut-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="brut-modal-panel animate-fadein">
        <form className="brut-modal-form" onSubmit={handleSubmit}>
          
          {/* Header */}
          <div className="brut-modal-header">
            <h2 className="brut-modal-title">{initialData ? 'KIYAFET DÜZENLE' : 'KIYAFET EKLE'}</h2>
            <button type="button" className="brut-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="brut-modal-line-container">
            <div className="brut-modal-line" />
          </div>

          <div className="brut-modal-body">
            {/* LEFT SIDE (60%) */}
            <div className="brut-modal-left">
              {/* Name */}
              <div className="brut-form-group">
                <label className="brut-label">KIYAFET ADI *</label>
                <input
                  className="brut-input"
                  placeholder="ÖRN: BEYAZ OVERSIZE T-SHIRT"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>

              {/* Category & Season */}
              <div className="brut-modal-row">
                <div className="brut-form-group">
                  <label className="brut-label">KATEGORİ</label>
                  <select className="brut-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="brut-form-group">
                  <label className="brut-label">MEVSİM</label>
                  <select className="brut-select" value={form.season} onChange={e => set('season', e.target.value)}>
                    {SEASONS.map(s => <option key={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              {/* Color & Brand */}
              <div className="brut-modal-row">
                <div className="brut-form-group">
                  <label className="brut-label">RENK</label>
                  <div className="brut-color-grid">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`brut-color-swatch ${form.color === c ? 'active' : ''}`}
                        style={{ background: c }}
                        onClick={() => set('color', c)}
                      />
                    ))}
                    <div className="brut-color-custom-wrapper">
                      <input
                        type="color"
                        className="brut-color-custom"
                        value={form.color}
                        onChange={e => set('color', e.target.value)}
                        title="Özel renk seç"
                      />
                    </div>
                  </div>
                </div>
                <div className="brut-form-group">
                  <label className="brut-label">MARKA</label>
                  <input
                    className="brut-input"
                    placeholder="ZARA, H&M, NIKE..."
                    value={form.brand}
                    onChange={e => set('brand', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="brut-form-group">
                <label className="brut-label">NOTLAR</label>
                <input
                  className="brut-input"
                  placeholder="KURU YIKAMA, ÖZEL GÜNLER İÇİN..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>

            {/* RIGHT SIDE (40%) */}
            <div className="brut-modal-right">
              <label className="brut-label">FOTOĞRAF YÜKLE</label>
              {form.imageUrl ? (
                <div className="brut-image-preview-container">
                  <div className="brut-image-preview-actions">
                    <label className="brut-dropzone-remove">
                      DEĞİŞTİR
                      <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                    </label>
                    <button 
                      type="button" 
                      className="brut-dropzone-remove" 
                      onClick={() => { set('imageUrl', ''); set('file', null); }}
                    >
                      KALDIR
                    </button>
                  </div>
                  <img src={form.imageUrl} className="brut-dropzone-img" alt="preview" />
                </div>
              ) : (
                <label 
                  className={`brut-dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                  <div className="brut-dropzone-content">
                    <span className="brut-dropzone-icon">+</span>
                    <span className="brut-dropzone-text">SÜRÜKLE BIRAK VEYA<br/>SEÇMEK İÇİN TIKLA</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="brut-modal-footer">
            <button type="button" className="btn-sharp btn-sharp--white brut-modal-cancel" onClick={onClose}>İPTAL</button>
            <button type="submit" className="btn-sharp btn-sharp--black brut-modal-submit" disabled={loading || !form.name.trim()}>
              {loading ? 'KAYDEDİLİYOR...' : (initialData ? 'KAYDET' : 'EKLE')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

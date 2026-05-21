import { useState } from 'react';
import './AddClothingModal.css';

const CATEGORIES = ['Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış', 'Tüm Mevsimler'];

const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#10b981','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#ffffff','#6b7280','#1f2937',
];

const INITIAL_FORM = {
  name: '', category: 'Üst', season: 'Tüm Mevsimler',
  color: '#8b5cf6', brand: '', imageUrl: '', notes: '',
};

export default function AddClothingModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-fadein">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Yeni Kıyafet Ekle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* İsim */}
          <div className="form-group">
            <label className="form-label">Kıyafet Adı *</label>
            <input
              className="form-input"
              placeholder="Örn: Beyaz oversize t-shirt"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          {/* Kategori + Mevsim */}
          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mevsim</label>
              <select className="form-select" value={form.season} onChange={e => set('season', e.target.value)}>
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Renk */}
          <div className="form-group">
            <label className="form-label">Renk</label>
            <div className="color-picker-row">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${form.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
              <input
                type="color"
                className="color-custom"
                value={form.color}
                onChange={e => set('color', e.target.value)}
                title="Özel renk seç"
              />
            </div>
          </div>

          {/* Marka + Resim URL */}
          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Marka</label>
              <input
                className="form-input"
                placeholder="Zara, H&M, Nike..."
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resim URL</label>
              <input
                className="form-input"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={e => set('imageUrl', e.target.value)}
                type="url"
              />
            </div>
          </div>

          {/* Notlar */}
          <div className="form-group">
            <label className="form-label">Notlar</label>
            <input
              className="form-input"
              placeholder="Kuru yıkama, özel günler için..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Önizleme rengi */}
          <div
            className="color-preview"
            style={{ background: `linear-gradient(135deg, ${form.color}33, ${form.color}11)`, borderColor: `${form.color}44` }}
          >
            <span style={{ color: form.color }}>■</span>
            <span className="color-preview-name">{form.name || 'Kıyafet adı'}</span>
            <span className="badge badge-primary">{form.category}</span>
          </div>

          {/* Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !form.name.trim()}>
              {loading ? <span className="spinner" /> : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

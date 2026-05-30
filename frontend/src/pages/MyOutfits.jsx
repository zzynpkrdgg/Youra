import { useState, useEffect } from 'react';
import OutfitCard from '../components/OutfitCard';
import SaveOutfitModal from '../components/SaveOutfitModal';
import './MyOutfits.css';
import api from '../api/axios';

const STYLE_FILTERS = ['Tümü', 'Favoriler', 'Günlük', 'Spor', 'Şık', 'İş', 'Gece', 'Plaj', 'Kış', 'Yaz', 'Vintage', 'Minimalist', 'Diğer'];

export default function MyOutfits() {
  const [outfits, setOutfits]         = useState([]);
  const [filterStyle, setFilterStyle] = useState('Tümü');
  const [search, setSearch]           = useState('');
  const [sortOrder, setSortOrder]     = useState('desc'); // 'desc' = yeniden eskiye
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Backendden kombinleri yükle
  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const { data } = await api.get('/outfit');
        setOutfits(data.outfits || []);
      } catch (err) {
        console.error('Kombinler yüklenemedi:', err);
      }
    };
    fetchOutfits();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/outfit/${id}`);
      setOutfits(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Kombin silinemedi:', err);
      alert('Kombin silinemedi.');
    }
  };

  const handleToggleFavorite = (id, newStatus) => {
    setOutfits(prev => prev.map(o => o._id === id ? { ...o, isFavorite: newStatus } : o));
  };

  const handleEdit = async (form) => {
    setEditLoading(true);
    try {
      const payload = {
        title: form.name,
        occasion: form.style,
        notes: form.notes
      };
      const { data } = await api.put(`/outfit/${editingOutfit._id}`, payload);
      setOutfits(prev => prev.map(o => o._id === editingOutfit._id ? {
          ...o,
          title: data.outfit.title,
          occasion: data.outfit.occasion,
          notes: data.outfit.notes,
      } : o));
      setEditingOutfit(null);
    } catch (err) {
      console.error(err);
      alert('Kombin güncellenemedi.');
    } finally {
      setEditLoading(false);
    }
  };

  // Filtrele + ara + sırala
  const filtered = outfits
    .filter(o => {
      if (filterStyle === 'Favoriler' && !o.isFavorite) return false;
      const matchStyle = filterStyle === 'Tümü' || filterStyle === 'Favoriler' || o.occasion === filterStyle;
      const matchSearch = !search ||
        o.title?.toLowerCase().includes(search.toLowerCase()) ||
        o.occasion?.toLowerCase().includes(search.toLowerCase()) ||
        o.notes?.toLowerCase().includes(search.toLowerCase());
      return matchStyle && matchSearch;
    })
    .sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return sortOrder === 'desc' ? -diff : diff;
    });

  return (
    <div className="page-wrapper myoutfits-wrapper">
      {/* Background Vertical Marquee */}
      <div className="myoutfits-bg-marquee">
        <div className="myoutfits-bg-marquee-content">
          <span>KOMBİN</span>
          <span>KOMBİN</span>
          <span>KOMBİN</span>
          <span>KOMBİN</span>
        </div>
      </div>

      <div className="myoutfits-inner">
        <div className="myoutfits-content-overlay">

          {/* Brutalist Header — Dolabım ile aynı yapı */}
          <div className="brut-top-section">
            <div className="brut-title-area" style={{ width: 'auto', flex: 1 }}>
              <div className="brut-title-row">
                <h1 className="brut-title">KOMBİNLERİM</h1>
                <span className="brut-count">{outfits.length} KOMBİN</span>
              </div>
              <div className="brut-thick-line" />
            </div>
            {/* Sıralama — başlığın sağında, bağımsız */}
            <button
              className="myoutfits-sort-btn"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              <span className="myoutfits-sort-arrow">
                {sortOrder === 'desc' ? '↓' : '↑'}
              </span>
              {sortOrder === 'desc' ? 'YENİDEN ESKİYE' : 'ESKİDEN YENİYE'}
            </button>
          </div>

          {/* Filter Bar — sadece arama + tarz sekmeleri */}
          <div className="brut-filter-bar">
            <input
              className="brut-search"
              placeholder="KOMBİN ARA..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="brut-filter-tabs">
              {STYLE_FILTERS.map(s => (
                <button
                  key={s}
                  className={`brut-tab ${filterStyle === s ? 'brut-tab--active' : ''}`}
                  onClick={() => setFilterStyle(s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* İçerik */}
          <div className="brut-main-container">
            {filtered.length === 0 ? (
              <div className="wardrobe-empty">
                <h2>
                  {outfits.length === 0
                    ? 'HENÜZ KAYDEDİLMİŞ KOMBİN YOK'
                    : 'SONUÇ BULUNAMADI'}
                </h2>
                <p>
                  {outfits.length === 0
                    ? '"Kombin Oluştur" sayfasından kombinlerini kaydet!'
                    : 'Farklı bir filtre dene.'}
                </p>
              </div>
            ) : (
              <div className="myoutfits-grid">
                {filtered.map(outfit => (
                  <OutfitCard
                    key={outfit._id}
                    outfit={outfit}
                    onDelete={handleDelete}
                    onEdit={(outfit) => setEditingOutfit(outfit)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Outfit Modal */}
      {editingOutfit && (
        <SaveOutfitModal
          initialData={{
            name: editingOutfit.title,
            style: editingOutfit.occasion,
            notes: editingOutfit.notes || ''
          }}
          outfitItems={editingOutfit.items}
          onClose={() => setEditingOutfit(null)}
          onSubmit={handleEdit}
          loading={editLoading}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import OutfitCard from '../components/OutfitCard';
import './MyOutfits.css';

const STYLE_FILTERS = ['Tümü', 'Günlük', 'Spor', 'Şık', 'İş', 'Gece', 'Plaj', 'Kış', 'Yaz', 'Vintage', 'Minimalist', 'Diğer'];

export default function MyOutfits() {
  const [outfits, setOutfits]         = useState([]);
  const [filterStyle, setFilterStyle] = useState('Tümü');
  const [search, setSearch]           = useState('');
  const [sortOrder, setSortOrder]     = useState('desc'); // 'desc' = yeniden eskiye

  // localStorage'dan kombinleri yükle
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('youra_outfits') || '[]');
    setOutfits(saved);
  }, []);

  const handleDelete = (id) => {
    const updated = outfits.filter(o => o.id !== id);
    setOutfits(updated);
    localStorage.setItem('youra_outfits', JSON.stringify(updated));
  };

  // Filtrele + ara + sırala
  const filtered = outfits
    .filter(o => {
      const matchStyle = filterStyle === 'Tümü' || o.style === filterStyle;
      const matchSearch = !search ||
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.style?.toLowerCase().includes(search.toLowerCase()) ||
        o.notes?.toLowerCase().includes(search.toLowerCase());
      return matchStyle && matchSearch;
    })
    .sort((a, b) => {
      const diff = new Date(a.savedAt) - new Date(b.savedAt);
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
                    key={outfit.id}
                    outfit={outfit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

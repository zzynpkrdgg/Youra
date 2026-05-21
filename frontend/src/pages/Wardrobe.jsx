import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ClothingCard from '../components/ClothingCard';
import AddClothingModal from '../components/AddClothingModal';
import './Wardrobe.css';

const CATEGORIES = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['Tümü', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış', 'Tüm Mevsimler'];

export default function Wardrobe() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [filterCat, setFilterCat]   = useState('Tümü');
  const [filterSea, setFilterSea]   = useState('Tümü');
  const [search, setSearch]         = useState('');
  const [error, setError]           = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clothing');
      setItems(data);
    } catch {
      setError('Kıyafetler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async (form) => {
    setAddLoading(true);
    try {
      const { data } = await api.post('/clothing', form);
      setItems(prev => [data, ...prev]);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Eklenemedi.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kıyafeti silmek istediğine emin misin?')) return;
    try {
      await api.delete(`/clothing/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Silinemedi.');
    }
  };

  // Filter & search
  const filtered = items.filter(item => {
    const matchCat = filterCat === 'Tümü' || item.category === filterCat;
    const matchSea = filterSea === 'Tümü' || item.season === filterSea;
    const matchQ   = !search || item.name.toLowerCase().includes(search.toLowerCase())
                             || item.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSea && matchQ;
  });

  return (
    <div className="page-wrapper">
      <div className="wardrobe container">
        {/* Page Header */}
        <div className="wardrobe-header">
          <div>
            <h1 className="wardrobe-title">
              <span className="text-gradient">Dolabım</span>
            </h1>
            <p className="wardrobe-count">
              {loading ? '...' : `${items.length} kıyafet`}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Kıyafet Ekle
          </button>
        </div>

        {/* Filters */}
        <div className="wardrobe-filters">
          {/* Search */}
          <input
            className="form-input wardrobe-search"
            placeholder="🔍 Kıyafet ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Category chips */}
          <div className="filter-chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`chip ${filterCat === c ? 'chip-active' : ''}`}
                onClick={() => setFilterCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Season select */}
          <select
            className="form-select wardrobe-season-select"
            value={filterSea}
            onChange={e => setFilterSea(e.target.value)}
          >
            {SEASONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && <p className="error-msg">{error}</p>}

        {/* Grid */}
        {loading ? (
          <div className="wardrobe-loading">
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="wardrobe-empty animate-fadein">
            <div className="wardrobe-empty-icon">👗</div>
            <h2>
              {items.length === 0 ? 'Dolabın henüz boş' : 'Sonuç bulunamadı'}
            </h2>
            <p>
              {items.length === 0
                ? 'İlk kıyafetini ekleyerek başla ve AI asistanından kombin iste!'
                : 'Farklı filtreler veya arama terimleri dene.'}
            </p>
            {items.length === 0 && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                ✦ İlk Kıyafeti Ekle
              </button>
            )}
          </div>
        ) : (
          <div className="wardrobe-grid">
            {filtered.map(item => (
              <ClothingCard
                key={item._id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <AddClothingModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
          loading={addLoading}
        />
      )}
    </div>
  );
}

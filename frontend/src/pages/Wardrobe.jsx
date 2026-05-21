import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ClothingCard from '../components/ClothingCard';
import AddClothingModal from '../components/AddClothingModal';
import './Wardrobe.css';

const CATEGORIES = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['Mevsim', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];

const DEMO_ITEMS = [
  { _id:'d1', name:'Beyaz T-Shirt',    category:'Üst',       color:'#e8e8e8', season:'Yaz',             brand:'Zara' },
  { _id:'d2', name:'Siyah Pantolon',   category:'Alt',       color:'#1a1a1a', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d3', name:'Denim Ceket',      category:'Dış Giyim', color:'#5b7ea6', season:'İlkbahar',        brand:"Levi's" },
  { _id:'d4', name:'Beyaz Sneaker',    category:'Ayakkabı',  color:'#f0f0f0', season:'Tüm Mevsimler',   brand:'Nike' },
  { _id:'d5', name:'Çizgili Gömlek',   category:'Üst',       color:'#4a90e2', season:'Tüm Mevsimler',   brand:'' }
];

export default function Wardrobe() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [filterCat, setFilterCat]   = useState('Tümü');
  const [filterSea, setFilterSea]   = useState('Mevsim');
  const [search, setSearch]         = useState('');
  const [showDirty, setShowDirty]   = useState(false);
  const [error, setError]           = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clothing');
      setItems(data.clothes || []);
    } catch {
      setItems(DEMO_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async (form) => {
    setAddLoading(true);
    try {
      const payload = {
        image: form.imageUrl || 'https://via.placeholder.com/200',
        category: form.category,
        color: form.color,
        style: form.name,
        season: form.season,
      };
      const { data } = await api.post('/clothing', payload);
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

  const handleToggleDirty = async (id) => {
    // Backend bağlı değilken state'te güncelle
    setItems(prev => prev.map(item => 
      item._id === id ? { ...item, isDirty: !item.isDirty } : item
    ));
    // Gerçek uygulamada api.patch çağrılır
  };

  // Filter & search
  const filtered = items.filter(item => {
    const matchCat = filterCat === 'Tümü' || item.category === filterCat;
    const matchSea = filterSea === 'Mevsim' || filterSea === 'Tümü' || item.season === filterSea;
    const matchQ   = !search || item.name.toLowerCase().includes(search.toLowerCase())
                             || item.brand?.toLowerCase().includes(search.toLowerCase());
    
    // showDirty false ise isDirty: true olanları gizle
    const matchDirty = showDirty || !item.isDirty;
    
    return matchCat && matchSea && matchQ && matchDirty;
  });

  return (
    <div className="page-wrapper wardrobe-wrapper">
      {/* Background Vertical Marquee */}
      <div className="wardrobe-bg-marquee">
        <div className="wardrobe-bg-marquee-content">
          <span>DOLAP</span>
          <span>DOLAP</span>
          <span>DOLAP</span>
          <span>DOLAP</span>
        </div>
      </div>

      <div className="wardrobe">
        <div className="wardrobe-content-overlay">
          {/* Brutalist Header */}
        <div className="brut-top-section">
          <div className="brut-title-area">
            <div className="brut-title-row">
              <h1 className="brut-title">DOLABIM</h1>
              <span className="brut-count">{loading ? '...' : `${items.length} KIYAFET`}</span>
            </div>
            <div className="brut-thick-line" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setShowDirty(!showDirty)}>
              <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                Kirlileri Göster
              </span>
              <div style={{
                width: '24px', height: '24px', backgroundColor: 'var(--color-bg)', border: '2px solid var(--color-text)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 0 var(--color-text)'
              }}>
                {showDirty && <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text)', lineHeight: 1 }}>✓</span>}
              </div>
            </div>

            <button className="btn-sharp btn-sharp--white brut-add-btn" onClick={() => setShowModal(true)}>
              KIYAFET EKLE
            </button>
          </div>
        </div>

        {/* Brutalist Filter Bar */}
        <div className="brut-filter-bar">
          <input
            className="brut-search"
            placeholder="ARAMA ÇUBUĞU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="brut-filter-tabs">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`brut-tab ${filterCat === c ? 'brut-tab--active' : ''}`}
                onClick={() => setFilterCat(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
          <select
            className="brut-season-select"
            value={filterSea}
            onChange={e => setFilterSea(e.target.value)}
          >
            {SEASONS.map(s => <option key={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && <p className="error-msg">{error}</p>}

        {/* Main Grid Container */}
        <div className="brut-main-container">
          {loading ? (
            <div className="wardrobe-loading">
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderColor: 'var(--color-text)', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="wardrobe-empty">
              <h2>{items.length === 0 ? 'DOLABIN HENÜZ BOŞ' : 'SONUÇ BULUNAMADI'}</h2>
              <p>{items.length === 0 ? 'İlk kıyafetini ekleyerek başla!' : 'Farklı arama terimleri dene.'}</p>
            </div>
          ) : (
            <div className="brut-grid">
              {filtered.map(item => (
                <ClothingCard
                  key={item._id}
                  item={item}
                  onDelete={handleDelete}
                  onToggleDirty={handleToggleDirty}
                />
              ))}
            </div>
          )}
        </div>
        </div>
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

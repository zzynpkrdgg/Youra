import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ClothingCard from '../components/ClothingCard';
import AddClothingModal from '../components/AddClothingModal';
import './Wardrobe.css';

const CATEGORIES = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['Mevsim', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];



export default function Wardrobe() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    } catch (err) {
      setItems([]);
      setError('Kıyafetler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async (form) => {
    setAddLoading(true);
    try {
      if (form.file) {
        const formData = new FormData();
        formData.append('image', form.file);
        formData.append('category', form.category);
        formData.append('color', form.color);
        formData.append('style', form.name);
        formData.append('season', form.season);
        formData.append('brand', form.brand);
        
        const { data } = await api.post('/clothing/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setItems(prev => [data.clothing, ...prev]);
        setShowModal(false);
        return;
      }

      const payload = {
        image: form.imageUrl || 'https://via.placeholder.com/200',
        category: form.category,
        color: form.color,
        style: form.name,
        season: form.season,
        brand: form.brand,
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

  const handleEdit = async (form) => {
    setAddLoading(true);
    try {
      const payload = {
        image: form.imageUrl,
        category: form.category,
        color: form.color,
        style: form.name,
        season: form.season,
        brand: form.brand,
        notes: form.notes
      };
      const { data } = await api.put(`/clothing/${editingItem._id}`, payload);
      setItems(prev => prev.map(i => i._id === editingItem._id ? data.clothing : i));
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Güncellenemedi.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clothing/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Silinemedi.');
    }
  };

  const handleToggleDirty = async (id, currentStatus) => {
    const newStatus = currentStatus === 'dirty' ? 'available' : 'dirty';
    try {
      await api.patch(`/clothing/${id}/status`, { status: newStatus });
      setItems(prev => prev.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      alert('Durum güncellenemedi.');
    }
  };

  // Filter & search
  const filtered = items.filter(item => {
    // Kategori karşılaştırmasını normalize et (trim ve sıfır space'ler)
    const normalizedItemCat = (item.category || '').trim();
    const normalizedFilterCat = filterCat.trim();
    const matchCat = normalizedFilterCat === 'Tümü' || normalizedItemCat === normalizedFilterCat;
    const matchSea = filterSea === 'Mevsim' || filterSea === 'Tümü' || item.season === filterSea;
    const matchQ   = !search || (item.name || item.style || '').toLowerCase().includes(search.toLowerCase())
                             || item.brand?.toLowerCase().includes(search.toLowerCase());
    
    // showDirty true ise sadece kirlileri göster
    const matchDirty = showDirty ? item.status === 'dirty' : true;
    
    return matchCat && matchSea && matchQ && matchDirty;
  }).sort((a, b) => {
    // Kirliler her zaman en altta olsun
    const aIsDirty = a.status === 'dirty';
    const bIsDirty = b.status === 'dirty';
    if (aIsDirty && !bIsDirty) return 1;
    if (!aIsDirty && bIsDirty) return -1;
    return 0;
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
                Sadece Kirlileri Göster
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
                  onEdit={(item) => setEditingItem(item)}
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

      {/* Edit Clothing Modal */}
      {editingItem && (
        <AddClothingModal
          initialData={{
            name: editingItem.style || editingItem.name || '',
            category: editingItem.category || 'Üst',
            season: editingItem.season || 'Mevsim',
            color: editingItem.color || '#000000',
            brand: editingItem.brand || '',
            imageUrl: editingItem.image || '',
            notes: editingItem.notes || ''
          }}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEdit}
          loading={addLoading}
        />
      )}
    </div>
  );
}

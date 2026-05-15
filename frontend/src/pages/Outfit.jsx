import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import './Outfit.css';

const TABS = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar'];

const CAT_ICONS = {
  'Üst':'','Alt':'','Elbise':'','Dış Giyim':'',
  'Ayakkabı':'','Aksesuar':'','Diğer':'',
};

// Demo kıyafetler (backend hazır olana kadar)
const DEMO_ITEMS = [
  { _id:'d1', name:'Beyaz T-Shirt',    category:'Üst',       color:'#e8e8e8', season:'Yaz',             brand:'Zara' },
  { _id:'d2', name:'Siyah Pantolon',   category:'Alt',       color:'#1a1a1a', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d3', name:'Denim Ceket',      category:'Dış Giyim', color:'#5b7ea6', season:'İlkbahar',        brand:"Levi's" },
  { _id:'d4', name:'Beyaz Sneaker',    category:'Ayakkabı',  color:'#f0f0f0', season:'Tüm Mevsimler',   brand:'Nike' },
  { _id:'d5', name:'Çizgili Gömlek',   category:'Üst',       color:'#4a90e2', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d6', name:'Chino Pantolon',   category:'Alt',       color:'#c8a96e', season:'İlkbahar',        brand:'H&M' },
  { _id:'d7', name:'Siyah Blazer',     category:'Dış Giyim', color:'#222222', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d8', name:'Kırmızı Etek',     category:'Elbise',    color:'#dc2626', season:'Yaz',             brand:'Zara' },
  { _id:'d9', name:'Spor Ayakkabı',    category:'Ayakkabı',  color:'#f97316', season:'Yaz',             brand:'Adidas' },
  { _id:'d10',name:'Keten Gömlek',     category:'Üst',       color:'#d4c5a9', season:'Yaz',             brand:'' },
];

export default function Outfit() {
  const [wardrobe, setWardrobe]     = useState([]);
  const [activeTab, setActiveTab]   = useState('Tümü');
  const [outfitItems, setOutfitItems] = useState([]);
  const [chatInput, setChatInput]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [generating, setGenerating] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragItemRef                 = useRef(null);

  // Dolabı çek
  useEffect(() => {
    api.get('/clothing')
      .then(({ data }) => setWardrobe(data.clothes || data || DEMO_ITEMS))
      .catch(() => setWardrobe(DEMO_ITEMS));
  }, []);

  // Filtrele
  const filtered = activeTab === 'Tümü'
    ? wardrobe
    : wardrobe.filter(i => i.category === activeTab);

  // Drag handlers (sol panel)
  const handleDragStart = (e, item) => {
    dragItemRef.current = item;
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drop handlers (sağ kanvas)
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!dragItemRef.current) return;
    const item = dragItemRef.current;
    dragItemRef.current = null;
    setOutfitItems(prev => {
      // Aynı kategorideki eski öğeyi çıkar ve yenisini ekle
      const filtered = prev.filter(i => i.category !== item.category);
      // Eğer grid dolduysa ve yeni ekleniyorsa (9 sınırına takılmamak için, gerçi kategori sayısı 7)
      return [...filtered, item].slice(0, 9);
    });
  };

  const removeFromOutfit = (id) =>
    setOutfitItems(prev => prev.filter(i => i._id !== id));

  const clearOutfit = () => setOutfitItems([]);

  // AI Kombin oluştur
  const handleGenerate = useCallback(async () => {
    if (generating) return;
    const styles = JSON.parse(localStorage.getItem('youra_style_preferences') || '[]');
    
    const currentMode = outfitItems.length === 0 ? 'sifirdan' : 'tamamla';
    const userMsg = chatInput.trim() ||
      (currentMode === 'sifirdan' ? 'Bana kombin öner' : 'Seçtiğim kıyafetlere göre kombinimi tamamla');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatExpanded(true);
    setGenerating(true);

    try {
      const { data } = await api.post('/outfit/generate', {
        message:    userMsg,
        mode:       currentMode,
        items:      outfitItems,
        styles,
        wardrobe:   wardrobe
      });
      
      const aiData = data.data;
      if (aiData && aiData.suggested_outfit) {
        // AI'dan dönen ID'leri eşleştir
        const suggestedItems = wardrobe.filter(item => aiData.suggested_outfit.includes(item._id));
        
        if (currentMode === 'sifirdan') {
          setOutfitItems(suggestedItems.slice(0, 9));
        } else {
          setOutfitItems(prev => {
            const existingIds = new Set(prev.map(i => i._id));
            const newItems = suggestedItems.filter(i => !existingIds.has(i._id));
            return [...prev, ...newItems].slice(0, 9);
          });
        }
        
        if (aiData.explanation) {
           setMessages(prev => [...prev, { role: 'ai', content: aiData.explanation }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply ?? data.suggestion ?? JSON.stringify(data) }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: currentMode === 'sifirdan'
          ? 'Sana önerim: Beyaz t-shirt + siyah slim pantolon + denim ceket kombinasyonu. Rahat ama şık bir görünüm için beyaz sneaker ekleyebilirsin.'
          : `Seçtiğin ${outfitItems.map(i=>i.name).join(', ')} ile harika görüneceksin! Eksik parçalar için yanına ${outfitItems.length < 2 ? 'koyu renk bir alt + beyaz sneaker' : 'nötr tonlarda bir dış giyim'} öneririm.`,
      }]);
    } finally {
      setGenerating(false);
    }
  }, [chatInput, outfitItems, generating, wardrobe]);

  return (
    <div className="outfit-builder page-wrapper">
      {/* ── Page Header ─────────────────────────── */}
      <div className="ob-top-bar container">
        <h1 className="ob-title">
          <span className="text-gradient">Kombin Oluştur</span>
        </h1>
      </div>

      {/* ── Main Split Panel ──────────────────────── */}
      <div className="ob-split container">

        {/* LEFT — Dolap */}
        <div className="ob-left">
          <div className="ob-panel-title">
            Dolabım
            <span className="ob-item-count">{wardrobe.length} parça</span>
          </div>

          {/* Category tabs */}
          <div className="ob-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ob-tab ${activeTab === tab ? 'ob-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Clothing mini-cards */}
          <div className="ob-clothing-grid">
            {filtered.length === 0 ? (
              <p className="ob-empty-hint">Bu kategoride kıyafet yok.</p>
            ) : filtered.map(item => (
              <div
                key={item._id}
                className="ob-clothing-card"
                draggable
                onDragStart={e => handleDragStart(e, item)}
                title={`${item.name} — sürükle`}
              >
                <div
                  className="ob-clothing-thumb"
                  style={{ background: `linear-gradient(135deg, ${item.color}44, ${item.color}22)` }}
                >
                  <span className="ob-clothing-emoji">
                    {CAT_ICONS[item.category] ?? ''}
                  </span>
                  <span
                    className="ob-color-dot"
                    style={{ background: item.color }}
                  />
                </div>
                <div className="ob-clothing-info">
                  <span className="ob-clothing-name">{item.name}</span>
                  {item.brand && <span className="ob-clothing-brand">{item.brand}</span>}
                </div>
                <span className="ob-drag-hint">⠿</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Kombin Kanvası */}
        <div className="ob-right">
          <div className="ob-panel-title">
            Kombin Kanvası
            {outfitItems.length > 0 && (
              <button className="ob-clear-btn" onClick={clearOutfit}>Temizle</button>
            )}
          </div>

          <div
            className={`ob-canvas ${isDragOver ? 'ob-canvas--dragover' : ''} ${outfitItems.length === 0 ? 'ob-canvas--empty' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {outfitItems.length === 0 ? (
              <div className="ob-canvas-placeholder">
                <p>Kıyafetleri buraya sürükle</p>
                <span className="ob-canvas-hint">Sol panelden kıyafet sürükleyip bırak</span>
              </div>
            ) : (
              <div className="ob-canvas-items">
                {Array.from({ length: 9 }).map((_, i) => {
                  const item = outfitItems[i];
                  if (item) {
                    return (
                      <div key={item._id} className="ob-canvas-item animate-fadein">
                        <div
                          className="ob-canvas-thumb"
                          style={{ background: `linear-gradient(135deg, ${item.color}55, ${item.color}22)` }}
                        >
                          <span>{CAT_ICONS[item.category] ?? ''}</span>
                        </div>
                        <span className="ob-canvas-item-name">{item.name}</span>
                        <button
                          className="ob-canvas-remove"
                          onClick={() => removeFromOutfit(item._id)}
                        >✕</button>
                      </div>
                    );
                  }
                  return <div key={`empty-${i}`} className="ob-canvas-empty-slot" />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Chat + Generate ────────────────── */}
      <div className="ob-bottom container">

        {/* AI Mesajları */}
        {messages.length > 0 && (
          <div className="ob-messages-wrapper animate-fadein">
            {isChatExpanded ? (
              <>
                <button 
                  className="ob-chat-toggle" 
                  onClick={() => setIsChatExpanded(false)}
                  title="Küçült"
                >
                  ▼
                </button>
                <div className="ob-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`ob-msg ob-msg--${m.role} animate-fadein`}>
                      {m.role === 'ai' && <span className="ob-msg-avatar">Y</span>}
                      <div className="ob-msg-bubble">{m.content}</div>
                      {m.role === 'user' && <span className="ob-msg-avatar ob-msg-avatar--user">U</span>}
                    </div>
                  ))}
                  {generating && (
                    <div className="ob-msg ob-msg--ai animate-fadein">
                      <span className="ob-msg-avatar">Y</span>
                      <div className="ob-msg-bubble ob-msg-bubble--typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                className="ob-chat-expand-btn animate-fadein" 
                onClick={() => setIsChatExpanded(true)}
              >
                Sohbet Geçmişini Göster ({messages.length} mesaj)
              </button>
            )}
          </div>
        )}

        <div className="ob-input-row">
          <input
            className="ob-chat-input"
            placeholder={
              outfitItems.length === 0
                ? 'Nasıl bir kombin istiyorsun? Örn: İş toplantısına gidiyorum...'
                : 'Kombinine ne eklensin? Örn: Casual ama biraz daha şık olsun...'
            }
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            disabled={generating}
          />
          <button
            className="ob-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating
              ? <span className="spinner" />
              : <>Kombini Oluştur</>}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import AddClothingModal from '../components/AddClothingModal';
import WeatherWidget from '../components/WeatherWidget';
import './Outfit.css';

const TABS = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar'];

const CAT_ICONS = {
  'Üst':'','Alt':'','Elbise':'','Dış Giyim':'',
  'Ayakkabı':'','Aksesuar':'','Diğer':'',
};

// Demo kıyafetler (backend hazır olana kadar)
const DEMO_ITEMS = [
  { _id:'d1', name:'BEYAZ T-SHIRT',    category:'Üst',       color:'#e8e8e8', season:'Yaz',             brand:'ZARA' },
  { _id:'d2', name:'SİYAH PANTOLON',   category:'Alt',       color:'#1a1a1a', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d3', name:'DENİM CEKET',      category:'Dış Giyim', color:'#5b7ea6', season:'İlkbahar',        brand:"LEVI'S" },
  { _id:'d4', name:'BEYAZ SNEAKER',    category:'Ayakkabı',  color:'#f0f0f0', season:'Tüm Mevsimler',   brand:'NIKE' },
  { _id:'d5', name:'ÇİZGİLİ GÖMLEK',   category:'Üst',       color:'#4a90e2', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d6', name:'CHINO PANTOLON',   category:'Alt',       color:'#c8a96e', season:'İlkbahar',        brand:'H&M' },
  { _id:'d7', name:'SİYAH BLAZER',     category:'Dış Giyim', color:'#222222', season:'Tüm Mevsimler',   brand:'' },
  { _id:'d8', name:'KIRMIZI ETEK',     category:'Elbise',    color:'#dc2626', season:'Yaz',             brand:'ZARA' },
  { _id:'d9', name:'SPOR AYAKKABI',    category:'Ayakkabı',  color:'#f97316', season:'Yaz',             brand:'ADIDAS' },
  { _id:'d10',name:'KETEN GÖMLEK',     category:'Üst',       color:'#d4c5a9', season:'Yaz',             brand:'' },
];

export default function Outfit() {
  const [wardrobe, setWardrobe]     = useState([]);
  const [activeTab, setActiveTab]   = useState('Tümü');
  const [outfitItems, setOutfitItems] = useState([]);
  const [chatInput, setChatInput]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [generating, setGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragItemRef                 = useRef(null);
  const [showModal, setShowModal]   = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [weather, setWeather]       = useState(null);

  // Hava durumunu çek (varsayılan: İstanbul koordinatları)
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const { data } = await api.get('/weather?lat=41.0082&lon=28.9784');
        setWeather(data.weather);
      } catch (err) {
        console.log('Hava durumu alınamadı:', err.message);
      }
    };
    getWeatherData();
  }, []);

  // Dolabı çek
  useEffect(() => {
    api.get('/clothing')
      .then(({ data }) => setWardrobe(data.clothes || data || DEMO_ITEMS))
      .catch(() => setWardrobe(DEMO_ITEMS));
  }, []);

  // Kıyafet Ekle (Modal)
  const handleAdd = async (form) => {
    setAddLoading(true);
    try {
      let newItem = null;
      if (form.file) {
        const formData = new FormData();
        formData.append('image', form.file);
        formData.append('category', form.category);
        formData.append('color', form.color);
        formData.append('style', form.name);
        formData.append('season', form.season);
        
        const { data } = await api.post('/clothing/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newItem = data.clothing;
      } else {
        const payload = {
          image: form.imageUrl || 'https://via.placeholder.com/200',
          category: form.category,
          color: form.color,
          style: form.name,
          season: form.season,
        };
        const { data } = await api.post('/clothing', payload);
        newItem = data.clothing || data;
      }
      setWardrobe(prev => [newItem, ...prev]);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Eklenemedi.');
    } finally {
      setAddLoading(false);
    }
  };

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
      const filtered = prev.filter(i => i.category !== item.category);
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
      (currentMode === 'sifirdan' ? 'BANA KOMBİN ÖNER' : 'SEÇTİĞİM KIYAFETLERE GÖRE KOMBİNİMİ TAMAMLA');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setGenerating(true);

    try {
      const { data } = await api.post('/outfit/generate', {
        message:    userMsg,
        mode:       currentMode,
        items:      outfitItems,
        styles,
        wardrobe:   wardrobe,
        weather:    weather
      });
      
      const aiData = data.data;
      if (aiData && aiData.suggested_outfit) {
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
          ? 'SANA ÖNERİM: BEYAZ T-SHIRT + SİYAH SLİM PANTOLON + DENİM CEKET.'
          : `EKSİK PARÇALAR İÇİN YANINA KOYU RENK BİR ALT + BEYAZ SNEAKER ÖNERİRİM.`,
      }]);
    } finally {
      setGenerating(false);
    }
  }, [chatInput, outfitItems, generating, wardrobe]);

  return (
    <div className="outfit-builder page-wrapper">
      
      {/* Brutalist Header Area */}
      <div className="brut-ob-top-section">
        <div className="brut-ob-title-area">
          <div className="brut-ob-title-row">
            <h1 className="brut-ob-title">KOMBİN OLUŞTUR</h1>
          </div>
          <div className="brut-ob-divider" />
        </div>
      </div>

      {/* TOP — Weather & AI Chat Split */}
      <div className="brut-ob-top-split">
        <div className="outfit-bg-marquee">
          <div className="outfit-bg-marquee-content">
            <span>KOMBİN</span><span>KOMBİN</span><span>KOMBİN</span><span>KOMBİN</span><span>KOMBİN</span><span>KOMBİN</span>
          </div>
        </div>

        <div className="brut-ob-top-left">
          <WeatherWidget staticMode={true} />
        </div>
        <div className="brut-ob-chat-section">
          
          <div className="brut-ob-messages-wrapper">
          <div className="brut-ob-messages">
            {messages.map((m, i) => (
              <div key={i} className={`brut-ob-msg ${m.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                <div className="brut-ob-msg-avatar">{m.role === 'ai' ? 'AI' : 'U'}</div>
                <div className="brut-ob-msg-bubble">{m.content}</div>
              </div>
            ))}
            {generating && (
              <div className="brut-ob-msg msg-ai">
                <div className="brut-ob-msg-avatar">AI</div>
                <div className="brut-ob-msg-bubble">YAZIYOR...</div>
              </div>
            )}
          </div>
        </div>

        <div className="brut-ob-input-row">
          <input
            className="brut-ob-chat-input"
            placeholder={
              outfitItems.length === 0
                ? "NASIL BİR KOMBİN İSTİYORSUN? ÖRN: SİYAH AĞIRLIKLI..."
                : "KOMBİNİNE NE EKLENSİN?"
            }
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            disabled={generating}
          />
          <button
            className="brut-ob-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '...' : 'OLUŞTUR'}
          </button>
        </div>
      </div>
      </div>

      <div className="brut-ob-main-wrapper">
        
        {/* LEFT — Dolap (Kıyafet Seçimi) */}
        <div className="brut-ob-left-container">
          <div className="brut-ob-left">
            
            <div className="brut-ob-left-header">
              <div className="brut-ob-left-title-row">
                <h2 className="brut-ob-panel-title">DOLABIM [{wardrobe.length}]</h2>
                <button 
                  className="brut-ob-add-btn" 
                  onClick={() => setShowModal(true)}
                >
                  KIYAFET EKLE
                </button>
              </div>
            {/* Category Tabs */}
            <div className="brut-ob-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`brut-ob-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="brut-ob-clothing-grid">
            {filtered.length === 0 ? (
              <p className="brut-ob-empty">BU KATEGORİDE KIYAFET YOK.</p>
            ) : filtered.map(item => (
              <div
                key={item._id}
                className="brut-ob-mini-card"
                draggable
                onDragStart={e => handleDragStart(e, item)}
              >
                <div
                  className="brut-ob-mini-thumb"
                  style={!(item.image || item.imageUrl) ? { background: `linear-gradient(135deg, ${item.color}44, ${item.color}11)` } : {}}
                >
                  {(item.image || item.imageUrl) && (
                    <img src={item.image || item.imageUrl} alt={item.style || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
                <div className="brut-ob-mini-info">
                  <span className="brut-ob-mini-name">{item.style || item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* RIGHT — Kombin Kanvası */}
        <div className="brut-ob-right">
          <div className="brut-ob-right-header">
            <h2 className="brut-ob-panel-title">
              KANVAS
              {weather && weather.weathercode !== undefined && (
                ((weather.weathercode >= 51 && weather.weathercode <= 67) || 
                 (weather.weathercode >= 80 && weather.weathercode <= 82) ||
                 (weather.weathercode >= 95 && weather.weathercode <= 99))
              ) && (
                <span style={{ marginLeft: 10, fontSize: '1.2rem' }} title="Hava yağmurlu! Kombinine şemsiye veya uygun bir dış giyim eklemeyi unutma.">☔</span>
              )}
            </h2>
            {outfitItems.length > 0 && (
              <button className="brut-ob-clear-btn" onClick={clearOutfit}>TEMİZLE</button>
            )}
          </div>

          <div
            className={`brut-ob-canvas ${isDragOver ? 'dragover' : ''} ${outfitItems.length === 0 ? 'empty' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {outfitItems.length === 0 ? (
              <div className="brut-ob-canvas-placeholder">
                <p>KIYAFETLERİ<br/>SÜRÜKLE</p>
              </div>
            ) : (
              <div className="brut-ob-canvas-items">
                {Array.from({ length: 9 }).map((_, i) => {
                  const item = outfitItems[i];
                  if (item) {
                    return (
                      <div key={item._id} className="brut-ob-canvas-item animate-fadein">
                        <div
                          className="brut-ob-canvas-thumb"
                          style={!(item.image || item.imageUrl) ? { background: `linear-gradient(135deg, ${item.color}55, ${item.color}22)` } : {}}
                        >
                          {(item.image || item.imageUrl) && (
                            <img src={item.image || item.imageUrl} alt={item.style || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          )}
                        </div>
                        <span className="brut-ob-canvas-name">{item.style || item.name}</span>
                        <button
                          className="brut-ob-canvas-remove"
                          onClick={() => removeFromOutfit(item._id)}
                        >✕</button>
                      </div>
                    );
                  }
                  return <div key={`empty-${i}`} className="brut-ob-canvas-empty" />;
                })}
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

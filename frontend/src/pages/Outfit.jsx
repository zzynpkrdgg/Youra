import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AddClothingModal from '../components/AddClothingModal';
import SaveOutfitModal from '../components/SaveOutfitModal';
import WeatherWidget from '../components/WeatherWidget';
import './Outfit.css';

const TABS = ['Tümü', 'Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar'];

const CAT_ICONS = {
  'Üst':'','Alt':'','Elbise':'','Dış Giyim':'',
  'Ayakkabı':'','Aksesuar':'','Diğer':'',
};



export default function Outfit() {
  const navigate = useNavigate();
  const [wardrobe, setWardrobe]     = useState([]);
  const [activeTab, setActiveTab]   = useState('Tümü');
  const [outfitItems, setOutfitItems] = useState([]);
  const [chatInput, setChatInput]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [generating, setGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragItemRef                 = useRef(null);
  const [showModal, setShowModal]         = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [addLoading, setAddLoading]       = useState(false);
  const [saveLoading, setSaveLoading]     = useState(false);

  // Dolabı çek
  useEffect(() => {
    api.get('/clothing')
      .then(({ data }) => setWardrobe(data.clothes || []))
      .catch(() => setWardrobe([]));
  }, []);

  // Kıyafet Ekle (Modal)
  const handleAdd = async (form) => {
    setAddLoading(true);
    try {
      const payload = {
        image: form.imageUrl || 'https://via.placeholder.com/200',
        category: form.category,
        color: form.color,
        style: form.name,
        season: form.season,
        brand: form.brand,
      };
      const { data } = await api.post('/clothing', payload);
      // Yeni eklenen kıyafeti wardrobe state'ine ekle
      setWardrobe(prev => [data, ...prev]);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Eklenemedi.');
    } finally {
      setAddLoading(false);
    }
  };

  // Filtrele: Kirli (status === 'dirty') olan kıyafetler kombin oluşturma sayfasında gözükmemeli
  const filtered = wardrobe.filter(i => {
    if (i.status === 'dirty') return false;
    // Kategori karşılaştırmasını normalize et
    const normalizedItemCat = (i.category || '').trim();
    const normalizedActiveTab = activeTab.trim();
    if (normalizedActiveTab !== 'Tümü' && normalizedItemCat !== normalizedActiveTab) return false;
    return true;
  });

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

  // Kombini backend'e kaydet
  const handleSaveOutfit = async (form) => {
    setSaveLoading(true);
    try {
      const payload = {
        title: form.name,
        occasion: form.style,
        items: form.items.map(i => i._id),
      };
      await api.post('/outfit', payload);
      setShowSaveModal(false);
      setOutfitItems([]);
      // Kombin kaydedildikten sonra Kombinlerim sayfasına yönlendir
      navigate('/myoutfits');
    } catch (err) {
      console.error(err);
      alert('Kombin kaydedilemedi.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  // MyOutfits sayfasına kombin kaydedildiğinde haber ver
  const onOutfitSaved = () => {
    // MyOutfits sayfasını yeniden yüklemesi için bir mekanizma tetikleyebiliriz
    // Şimdilik sadece bilgilendirme yapalım, manuel yenileme gerekebilir
  };

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
        wardrobe:   wardrobe
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
                  style={{
                    background: item.image
                      ? `url(${item.image}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${item.color}44, ${item.color}11)`
                  }}
                />
                <div className="brut-ob-mini-info">
                  <span className="brut-ob-mini-name">{item.name || item.style}</span>
                  <div className="brut-ob-mini-brand-color">
                    <span className="brut-ob-mini-brand">{item.brand}</span>
                    {item.color && (
                      <span className="brut-ob-mini-colorbox" style={{ background: item.color }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* RIGHT — Kombin Kanvası */}
        <div className="brut-ob-right">
          <div className="brut-ob-right-header">
            <h2 className="brut-ob-panel-title">KANVAS</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="brut-ob-clear-btn"
                onClick={clearOutfit}
                style={{ visibility: outfitItems.length > 0 ? 'visible' : 'hidden' }}
              >
                TEMİZLE
              </button>
              <button
                className="brut-ob-save-btn"
                onClick={() => setShowSaveModal(true)}
                disabled={outfitItems.length === 0}
                title={outfitItems.length === 0 ? 'Önce kıyafet ekle' : 'Kombini Kaydet'}
              >
                KOMBİNİ KAYDET
              </button>
            </div>
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
                          style={{
                            background: item.image
                              ? `url(${item.image}) center/cover no-repeat`
                              : `linear-gradient(135deg, ${item.color}55, ${item.color}22)`
                          }}
                        />
                        <span className="brut-ob-canvas-name">{item.name || item.style}</span>
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



      {/* Add Clothing Modal */}
      {showModal && (
        <AddClothingModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
          loading={addLoading}
        />
      )}

      {/* Save Outfit Modal */}
      {showSaveModal && (
        <SaveOutfitModal
          onClose={() => setShowSaveModal(false)}
          onSubmit={handleSaveOutfit}
          loading={saveLoading}
          outfitItems={outfitItems}
        />
      )}

    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import './ChatBot.css';

const WELCOME = {
  role: 'assistant',
  content: 'Merhaba! Ben Youra\'nın AI asistanıyım\n\nSana dolabına uygun kombinler önermek, hava durumuna göre tavsiyeler vermek veya stil rehberliği yapmak için buradayım. Nasıl yardımcı olabilirim?',
};

const SUGGESTIONS = [
  'Bugün ne giysem?',
  'Toplantı için kombin öner',
  'Parti kıyafeti önerisi',
  'Spor kombinini hazırla',
  'Yağmurlu hava için kombin',
];

export default function ChatBot() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('youra_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [WELCOME];
  });
  
  useEffect(() => {
    sessionStorage.setItem('youra_chat_history', JSON.stringify(messages));
  }, [messages]);

  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/outfit/chat', {
        message: msg,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message ?? 'Bir hata oluştu. Tekrar deneyin.';
      setMessages(prev => [...prev, { role: 'assistant', content: `${errMsg}`, isError: true }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (s) => {
    sendMessage(s); // emoji kaldırıldı, text doğrudan gönderiliyor
  };

  return (
    <div className="chatbot">
      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chatbot-msg chatbot-msg--${msg.role} ${msg.isError ? 'chatbot-msg--error' : ''} animate-fadein`}>
            {msg.role === 'assistant' && (
              <div className="chatbot-avatar">Y</div>
            )}
            <div className="chatbot-bubble">
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="chatbot-avatar chatbot-avatar--user">U</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chatbot-msg chatbot-msg--assistant animate-fadein">
            <div className="chatbot-avatar">Y</div>
            <div className="chatbot-bubble chatbot-bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="chatbot-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="chatbot-suggestion" onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chatbot-input-row">
        <input
          ref={inputRef}
          className="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Bir kombin iste veya soru sor..."
          disabled={loading}
          autoFocus
        />
        <button
          className="chatbot-send"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          {loading ? <span className="spinner" /> : '➤'}
        </button>
      </div>
    </div>
  );
}

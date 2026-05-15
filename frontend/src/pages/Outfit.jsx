import ChatBot from '../components/ChatBot';
import './Outfit.css';

export default function Outfit() {
  return (
    <div className="page-wrapper">
      <div className="outfit-page container">
        {/* Header */}
        <div className="outfit-header">
          <div className="outfit-header-left">
            <h1 className="outfit-title">
              <span className="text-gradient">AI Kombin Asistanı</span>
            </h1>
            <p className="outfit-sub">
              Dolabındaki kıyafetlere göre anında kombin önerileri al.
              Hava durumu, etkinlik türü veya modan hakkında sorabilirsin.
            </p>
          </div>
          <div className="outfit-status">
            <span className="outfit-status-dot" />
            AI Aktif
          </div>
        </div>

        {/* Chatbot */}
        <ChatBot />
      </div>
    </div>
  );
}

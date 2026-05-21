import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const FEATURES = [
  {
    icon: '👗',
    title: 'Akıllı Dolap',
    desc: 'Tüm kıyafetlerini dijital dolapta sakla. Renk, kategori ve mevsime göre organize et.',
  },
  {
    icon: '✨',
    title: 'AI Kombin Asistanı',
    desc: 'Yapay zeka destekli chatbot ile anında kombin önerileri al. Günlük, iş, spor ve özel etkinlik için.',
  },
  {
    icon: '🌤️',
    title: 'Kişiselleştirilmiş Stil',
    desc: 'Dolabına ve tercihlerine göre tamamen kişisel kombin önerileri. Modan asla ödün verme.',
  },
  {
    icon: '📱',
    title: 'Her Zaman Hazır',
    desc: 'Sabah "ne giysem" derdine son. Hızlı ve akıllı önerilerle her gün stiline güven.',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="hero">
        {/* Animated background orbs */}
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />

        <div className="container hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI Destekli Giyim Asistanı
          </div>

          <h1 className="hero-title">
            Dolabını Keşfet,
            <br />
            <span className="text-gradient">Stilini Yarat</span>
          </h1>

          <p className="hero-desc">
            Youra, yapay zeka ile kombinin ruhunu buluyor. Tüm kıyafetlerini bir yerde yönet,
            her gün için mükemmel kombini saniyeler içinde keşfet.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/wardrobe" className="btn btn-primary btn-lg">
                  ✦ Dolabıma Git
                </Link>
                <Link to="/outfit" className="btn btn-ghost btn-lg">
                  Kombin Öner
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  ✦ Ücretsiz Başla
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Giriş Yap
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {[
              { value: 'AI',      label: 'Powered'       },
              { value: '∞',       label: 'Kıyafet'       },
              { value: '7/24',    label: 'Asistan'       },
            ].map(({ value, label }) => (
              <div key={label} className="hero-stat">
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="features container">
        <h2 className="section-title">
          Neden <span className="text-gradient">Youra?</span>
        </h2>
        <p className="section-desc">
          Sabahları hızlı ve güzel giyinmek artık çok kolay.
        </p>

        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card glass">
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      {!user && (
        <section className="cta container">
          <div className="cta-card">
            <div className="cta-orb" />
            <h2 className="cta-title">Stiline Kavuşmaya Hazır mısın?</h2>
            <p className="cta-desc">
              Ücretsiz hesap oluştur, dolabını ekle ve AI asistanınla tanış.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              ✦ Hemen Başla — Ücretsiz
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="footer">
        <p>© 2026 Youra — Akıllı Giyim Asistanı</p>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-desc">
              Yapay zeka stil asistanınla dolabındaki her parçayı yeniden keşfet. Modanın sınırlarını zorlayan benzersiz kombinlerle kendi tarzını yarat ve her an göz alıcı ol.
            </p>

            <div className="hero-actions">
              <Link to="/wardrobe" className="btn-sharp btn-sharp--black">
                Dolabıma Git
              </Link>
              <Link to="/outfit" className="btn-sharp btn-sharp--white">
                Kombin Öner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────── */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA </span>
          <span>YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA YOURA </span>
        </div>
      </div>
    </div>
  );
}

import './ClothingCard.css';

const CATEGORY_ICONS = {
  'Üst':      '',
  'Alt':      '',
  'Elbise':   '',
  'Dış Giyim':'',
  'Ayakkabı': '',
  'Aksesuar': '',
  'Diğer':    '',
};

const SEASON_COLORS = {
  'İlkbahar': '#10b981',
  'Yaz':      '#f59e0b',
  'Sonbahar': '#f97316',
  'Kış':      '#60a5fa',
  'Tüm Mevsimler': '#8b5cf6',
};

export default function ClothingCard({ item, onDelete, onEdit }) {
  const icon        = CATEGORY_ICONS[item.category] ?? '';
  const seasonColor = SEASON_COLORS[item.season]    ?? '#a09db8';

  return (
    <div className="clothing-card animate-fadein">
      {/* Görsel ya da renk placeholder */}
      <div
        className="clothing-card-img"
        style={{
          background: item.imageUrl
            ? `url(${item.imageUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${item.color ?? '#8b5cf6'}22, ${item.color ?? '#ec4899'}44)`,
        }}
      >
        {!item.imageUrl && icon && <span className="clothing-card-emoji">{icon}</span>}
        {item.color && (
          <span
            className="clothing-color-dot"
            style={{ background: item.color }}
            title={item.color}
          />
        )}
      </div>

      {/* İçerik */}
      <div className="clothing-card-body">
        <div className="clothing-card-header">
          <h3 className="clothing-card-name">{item.name}</h3>
          <span
            className="clothing-card-season"
            style={{ color: seasonColor }}
          >
            {item.season}
          </span>
        </div>

        <div className="clothing-card-meta">
          <span className="badge badge-primary">{item.category}</span>
          {item.brand && (
            <span className="clothing-card-brand">{item.brand}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="clothing-card-actions">
        {onEdit && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(item)}
            title="Düzenle"
          >
            Düzenle
          </button>
        )}
        {onDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(item._id)}
            title="Sil"
          >
            Sil
          </button>
        )}
      </div>
    </div>
  );
}

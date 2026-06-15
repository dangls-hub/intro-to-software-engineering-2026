import { ArrowUpRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const APT_STATUS = {
  AVAILABLE: { label: 'Còn trống',     color: '#34d399', bg: 'rgba(52,211,153,0.14)'  },
  OCCUPIED:  { label: 'Đang ở',        color: '#c9a96e', bg: 'rgba(201,169,110,0.14)' },
  INACTIVE:  { label: 'Ngưng sử dụng', color: '#f87171', bg: 'rgba(248,113,113,0.14)' },
};

// Deterministic gradient per index — no Math.random on render
const GRADIENTS = [
  'linear-gradient(135deg, rgba(201,169,110,0.22) 0%, rgba(11,31,40,0.6) 65%)',
  'linear-gradient(135deg, rgba(52,211,153,0.16)  0%, rgba(11,31,40,0.6) 65%)',
  'linear-gradient(135deg, rgba(240,192,64,0.18)  0%, rgba(11,31,40,0.6) 65%)',
  'linear-gradient(135deg, rgba(96,165,250,0.14)  0%, rgba(11,31,40,0.6) 65%)',
  'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(11,31,40,0.6) 65%)',
  'linear-gradient(135deg, rgba(248,113,113,0.14) 0%, rgba(11,31,40,0.6) 65%)',
];

// ── Apartment card ──────────────────────────────────────
function ApartmentCard({ apt, idx }) {
  const cfg = APT_STATUS[apt.status] || APT_STATUS.AVAILABLE;

  return (
    <article className="apt-card">
      {/* Gradient header with ghost floor number */}
      <div
        className="apt-card-header"
        style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
      >
        <Building2 size={36} style={{ color: 'rgba(201,169,110,0.28)', position: 'relative', zIndex: 2 }} aria-hidden="true" />
        <span className="apt-card-floor" aria-hidden="true">
          {apt.floor ?? '—'}
        </span>
      </div>

      {/* Card body */}
      <div className="apt-card-body">
        <div className="apt-card-header-row">
          <h3 className="apt-card-name">Phòng {apt.roomNumber}</h3>
          <span
            className="apt-status-badge"
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.color}22`,
            }}
          >
            {cfg.label}
          </span>
        </div>

        <div className="apt-details-grid">
          {[
            { k: 'Tầng',      v: apt.floor  ?? '—' },
            { k: 'Diện tích', v: apt.area ? `${apt.area} m²` : '—' },
          ].map(({ k, v }) => (
            <div key={k} className="apt-detail-cell">
              <div className="apt-detail-key">{k}</div>
              <div className="apt-detail-val">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

// ── Skeleton card ───────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="apt-skeleton">
      <div className="apt-skeleton-header" />
      <div className="apt-skeleton-body">
        <div className="apt-skeleton-row">
          <div className="apt-skeleton-title" />
          <div className="apt-skeleton-badge" />
        </div>
        <div className="apt-details-grid">
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                height: '48px',
                background: 'var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                animation: `pulse 1.5s ease-in-out ${i * 150}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section ─────────────────────────────────────────────
export default function ApartmentsPortfolio({ apartments, isLoading }) {
  return (
    <section
      className="db-section"
      style={{
        backgroundImage: 'url("/images/section-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--bg-body)',
        paddingBottom: '20px'
      }}
    >
      {/* Deep overlay */}
      <div className="db-overlay" aria-hidden="true" />

      {/* Top separator */}
      <div className="db-separator" aria-hidden="true" />

      <div className="db-content">
        {/* Header row */}
        <div className="db-portfolio-header">
          <div>
            <p className="db-eyebrow">
              <Building2 size={11} strokeWidth={2.5} aria-hidden="true" />
              Danh mục bất động sản
            </p>
            <h2 className="db-section-title">Căn hộ quản lý</h2>
          </div>
          <Link
            to="/apartments"
            className="pm-btn-outline"
          >
            Xem tất cả <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="db-portfolio-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : apartments.length === 0 ? (
          <div className="db-empty-state">
            <Building2 size={52} strokeWidth={1} aria-hidden="true" />
            <p>Chưa có căn hộ nào được đăng ký</p>
            <Link to="/apartments" className="pm-btn-outline">
              Thêm căn hộ <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="db-portfolio-grid">
            {apartments.map((apt, i) => <ApartmentCard key={apt.id} apt={apt} idx={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

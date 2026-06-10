import { ArrowUpRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const GOLD  = '#c9a96e';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

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
    <article
      style={{
        /* True glassmorphism */
        background:           'var(--glass-bg)',
        backdropFilter:       'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border:               '1px solid var(--glass-border)',
        boxShadow:            'var(--shadow-md), inset 0 1px 0 var(--glass-border-highlight)',
        borderRadius:         '18px',
        overflow:             'hidden',
        transition:           'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-focus)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-lg), 0 0 0 1px var(--border-focus), inset 0 1px 0 var(--glass-border-highlight)';
        e.currentTarget.style.transform   = 'translateY(-6px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-md), inset 0 1px 0 var(--glass-border-highlight)';
        e.currentTarget.style.transform   = 'translateY(0)';
      }}
    >
      {/* Gradient header with ghost floor number */}
      <div style={{
        height: '130px',
        background: GRADIENTS[idx % GRADIENTS.length],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Building2 size={36} style={{ color: 'rgba(201,169,110,0.28)', position: 'relative', zIndex: 2 }} />
        <span style={{
          ...SERIF,
          position: 'absolute',
          top: '6px',
          right: '14px',
          fontSize: '4rem',
          fontWeight: 900,
          color: 'rgba(201,169,110,0.09)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          userSelect: 'none',
        }}>
          {apt.floor ?? '—'}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 style={{ ...SERIF, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.01em' }}>
            Phòng {apt.roomNumber}
          </h3>
          <span style={{
            background: cfg.bg,
            color: cfg.color,
            borderRadius: '999px',
            fontSize: '0.67rem',
            fontWeight: 700,
            padding: '4px 11px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            border: `1px solid ${cfg.color}22`,
          }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { k: 'Tầng',     v: apt.floor  ?? '—' },
            { k: 'Diện tích', v: apt.area ? `${apt.area} m²` : '—' },
          ].map(({ k, v }) => (
            <div key={k} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '10px',
              padding: '10px 12px',
            }}>
              <div style={{ color: 'rgba(201,169,110,0.5)', fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 3px' }}>{k}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.93rem' }}>{v}</div>
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
    <div style={{
      background:           'var(--glass-bg)',
      backdropFilter:       'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border:               '1px solid var(--glass-border)',
      borderRadius:         '18px',
      overflow:             'hidden',
    }}>
      <div style={{ height: '130px', background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '18px 20px 20px' }}>
        <div className="flex justify-between gap-2 mb-3">
          <div style={{ height: '22px', width: '100px', background: 'var(--border-subtle)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '22px', width: '72px', background: 'var(--bg-hover)', borderRadius: '999px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{ height: '48px', background: 'var(--border-subtle)', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 150}ms` }} />
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
        paddingTop: '56px',
        paddingBottom: '64px',
        position: 'relative',
        backgroundImage: 'url("/images/section-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--bg-body)',
      }}
    >
      {/* Deep overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(var(--bg-body-rgb), 0.90)',
          zIndex: 0,
        }}
      />

      {/* Top separator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.14), transparent)',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row */}
        <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
          <div>
            <p style={{ color: GOLD, fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Building2 size={11} strokeWidth={2.5} />
              Danh mục bất động sản
            </p>
            <h2 style={{ ...SERIF, color: 'var(--text-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
              Căn hộ quản lý
            </h2>
          </div>
          <Link
            to="/apartments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: GOLD,
              fontWeight: 700,
              fontSize: '0.84rem',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              padding: '10px 22px',
              borderRadius: '999px',
              border: '1px solid rgba(201,169,110,0.22)',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.48)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.22)'; }}
          >
            Xem tất cả <ArrowUpRight size={15} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '18px' }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : apartments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 24px', color: 'rgba(201,169,110,0.3)' }}>
            <Building2 size={52} style={{ margin: '0 auto 16px', opacity: 0.25 }} strokeWidth={1} />
            <p style={{ margin: '0 0 20px', fontSize: '0.93rem', color: 'var(--text-muted)' }}>
              Chưa có căn hộ nào được đăng ký
            </p>
            <Link
              to="/apartments"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: GOLD, fontWeight: 700, fontSize: '0.84rem', textDecoration: 'none', padding: '10px 22px', borderRadius: '999px', border: '1px solid rgba(201,169,110,0.3)' }}
            >
              Thêm căn hộ <ArrowUpRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '18px' }}>
            {apartments.map((apt, i) => <ApartmentCard key={apt.id} apt={apt} idx={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

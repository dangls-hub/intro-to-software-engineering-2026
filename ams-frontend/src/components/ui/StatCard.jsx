import { ArrowUpRight } from 'lucide-react';

const GOLD  = '#c9a96e';
const TEAL  = '#0b1f28';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

/**
 * Reusable premium stat card.
 * Props:
 *   glass — dark-background glassmorphism variant (admin dashboard over image bg)
 *   default — solid white card (beige section, resident dashboard)
 */
export default function StatCard({ label, value, icon: Icon, suffix, isLoading = false, delay = 0, glass = false }) {
  /* ── variant tokens ───────────────────────────────── */
  const cardBase = glass ? {
    background:     'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border:         '1px solid var(--glass-border)',
    boxShadow:      'var(--shadow-md), inset 0 1px 0 var(--glass-border-highlight)',
  } : {
    background:     'var(--bg-card-solid)',
    border:         '1px solid var(--border)',
    boxShadow:      'var(--shadow-sm)',
  };

  const hoverShadow = glass
    ? 'var(--shadow-lg), 0 0 0 1px var(--border-focus), inset 0 1px 0 var(--glass-border-highlight)'
    : 'var(--shadow-md), 0 0 0 1px var(--border-focus)';

  const valueColor  = 'var(--text-heading)';
  const labelColor  = 'var(--text-secondary)';
  const suffixColor = 'var(--accent)';
  const arrowColor  = 'var(--text-muted)';
  const skeletonA   = 'var(--border-subtle)';
  const skeletonB   = 'var(--bg-hover)';

  return (
    <article
      style={{
        ...cardBase,
        borderRadius: '20px',
        padding: '28px 26px 24px',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-6px)';
        e.currentTarget.style.boxShadow  = hoverShadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)';
        e.currentTarget.style.boxShadow  = cardBase.boxShadow;
      }}
    >
      {/* Gold top shimmer line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '8%',
        right: '8%',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
      }} />

      <div className="flex justify-between items-start mb-5">
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '15px',
          background: glass ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0.1)',
          border: glass ? '1px solid rgba(201,169,110,0.16)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={22} style={{ color: GOLD }} strokeWidth={2} />
        </div>
        <ArrowUpRight size={17} style={{ color: arrowColor, marginTop: '4px' }} strokeWidth={2} />
      </div>

      {isLoading ? (
        <>
          <div style={{ height: '40px', width: '80px', background: skeletonA, borderRadius: '8px', marginBottom: '8px', animation: `pulse 1.5s ease-in-out ${delay}ms infinite` }} />
          <div style={{ height: '14px', width: '60%', background: skeletonB, borderRadius: '6px', animation: `pulse 1.5s ease-in-out ${delay + 100}ms infinite` }} />
        </>
      ) : (
        <>
          <div style={{ ...SERIF, fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: valueColor, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.03em' }}>
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : (value ?? '—')}
          </div>
          <div style={{ color: labelColor, fontSize: '0.84rem', fontWeight: 600 }}>
            {label}
          </div>
          {suffix && !isLoading && (
            <div style={{ color: suffixColor, fontSize: '0.73rem', fontWeight: 600, marginTop: '5px' }}>
              {value} {suffix}
            </div>
          )}
        </>
      )}
    </article>
  );
}

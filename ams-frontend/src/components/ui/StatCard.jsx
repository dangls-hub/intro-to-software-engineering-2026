import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable premium stat card.
 * Props:
 *   glass — dark-background glassmorphism variant (admin dashboard over image bg)
 *   default — solid white card (beige section, resident dashboard)
 */
export default function StatCard({ label, value, icon: Icon, suffix, isLoading = false, delay = 0, glass = false }) {
  const variant = glass ? 'glass-variant' : 'solid-variant';

  return (
    <article
      className={`stat-card ${variant}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gold top shimmer line */}
      <div className="stat-card-shimmer" aria-hidden="true" />

      <div className="stat-card-top">
        <div className={`stat-card-icon ${variant}`}>
          <Icon size={22} style={{ color: 'var(--accent)' }} strokeWidth={2} aria-hidden="true" />
        </div>
        <ArrowUpRight size={17} className="stat-card-arrow" strokeWidth={2} aria-hidden="true" />
      </div>

      {isLoading ? (
        <>
          <div
            className="stat-skeleton-value"
            style={{ animation: `pulse 1.5s ease-in-out ${delay}ms infinite` }}
          />
          <div
            className="stat-skeleton-label"
            style={{ animation: `pulse 1.5s ease-in-out ${delay + 100}ms infinite` }}
          />
        </>
      ) : (
        <>
          <div className="stat-card-value">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : (value ?? '—')}
          </div>
          <div className="stat-card-label">{label}</div>
          {suffix && (
            <div className="stat-card-suffix">{value} {suffix}</div>
          )}
        </>
      )}
    </article>
  );
}

import { RefreshCcw, RotateCcw, TrendingUp } from 'lucide-react';

export default function DashboardHero({ greeting, dateStr, error, onRefresh }) {
  return (
    <section
      className="db-section db-section-hero"
      style={{
        backgroundImage: 'url("/images/hero-bg.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundColor: 'var(--bg-body)',
      }}
    >
      {/* Gradient overlay — body color from left, fades to transparent right */}
      <div className="db-overlay-hero" aria-hidden="true" />

      {/* Decorative ghost watermark */}
      <span className="db-watermark" aria-hidden="true">AMS</span>

      {/* All content floats above overlay */}
      <div className="db-content db-section" style={{ paddingTop: 0, paddingBottom: 0 }}>

        {/* Error banner */}
        {error && (
          <div className="db-error-banner">
            <span className="flex-1">{error}</span>
            <button className="db-error-retry" onClick={onRefresh}>
              <RotateCcw size={13} strokeWidth={2.5} />
              Thử lại
            </button>
          </div>
        )}

        {/* Date row + refresh button */}
        <div className="db-date-row">
          <p className="db-date-label">
            <TrendingUp size={12} strokeWidth={2.5} aria-hidden="true" />
            {dateStr}
          </p>

          <button
            className="db-refresh-btn"
            onClick={onRefresh}
            aria-label="Tải lại dữ liệu"
            type="button"
          >
            <RefreshCcw size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Greeting */}
        <h1 className="db-hero-title">{greeting},</h1>
        <h2 className="db-hero-subtitle">
          Hệ thống Quản lý Căn hộ BlueMoon
        </h2>

        {/* Gold rule divider */}
        <div className="db-gold-rule">
          <div className="db-gold-rule-line" aria-hidden="true" />
          <p className="db-hero-description">
            Tổng quan toàn bộ hoạt động chung cư
          </p>
          <div className="db-gold-rule-trail" aria-hidden="true" />
        </div>

      </div>
    </section>
  );
}

import { RefreshCcw, RotateCcw, TrendingUp } from 'lucide-react';

const GOLD  = '#c9a96e';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

export default function DashboardHero({ greeting, dateStr, error, onRefresh }) {
  return (
    <section
      className="db-section"
      style={{
        paddingTop: '80px',
        paddingBottom: '64px',
        position: 'relative',
        overflow: 'hidden',
        /* Background image — fallback to deep teal */
        backgroundImage: 'url("/images/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundColor: '#0b1f28',
      }}
    >
      {/* Gradient overlay — deep teal from left, fades to transparent right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #0b1f28 0%, rgba(11,31,40,0.84) 52%, rgba(11,31,40,0.42) 100%)',
          zIndex: 0,
        }}
      />

      {/* Decorative ghost watermark — sits between overlay and content */}
      <span
        aria-hidden="true"
        style={{
          ...SERIF,
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          fontSize: 'clamp(5rem, 12vw, 10rem)',
          fontWeight: 900,
          color: 'rgba(201,169,110,0.055)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.05em',
          zIndex: 1,
        }}
      >
        AMS
      </span>

      {/* All content floats above overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#f87171',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={onRefresh}
              style={{
                background: 'rgba(248,113,113,0.15)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#f87171',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={13} strokeWidth={2.5} />
              Thử lại
            </button>
          </div>
        )}

        {/* Date row + refresh button */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <p style={{
            color: GOLD,
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            <TrendingUp size={12} strokeWidth={2.5} />
            {dateStr}
          </p>

          <button
            onClick={onRefresh}
            aria-label="Tải lại dữ liệu"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '999px',
              background: 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.22)',
              backdropFilter: 'blur(8px)',
              color: GOLD,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.25s ease, transform 0.4s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,169,110,0.18)';
              e.currentTarget.style.transform  = 'rotate(180deg)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(201,169,110,0.08)';
              e.currentTarget.style.transform  = 'rotate(0deg)';
            }}
          >
            <RefreshCcw size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Greeting */}
        <h1 style={{
          ...SERIF,
          fontSize: 'clamp(2rem, 5vw, 3.6rem)',
          fontWeight: 800,
          color: '#f8f5f0',
          margin: '0 0 8px',
          lineHeight: 1.08,
          letterSpacing: '-0.025em',
          textShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}>
          {greeting},
        </h1>
        <h2 style={{
          ...SERIF,
          fontSize: 'clamp(1.3rem, 3.2vw, 2.2rem)',
          fontWeight: 700,
          color: GOLD,
          fontStyle: 'italic',
          margin: '0 0 32px',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          Hệ thống Quản lý Căn hộ BlueMoon
        </h2>

        {/* Gold rule divider */}
        <div className="flex items-center gap-4">
          <div style={{ height: '1px', width: '52px', background: `linear-gradient(90deg, ${GOLD}, transparent)`, flexShrink: 0 }} />
          <p style={{ color: 'rgba(232,224,212,0.42)', fontSize: '0.86rem', fontWeight: 500, margin: 0 }}>
            Tổng quan toàn bộ hoạt động chung cư
          </p>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(201,169,110,0.12), transparent)' }} />
        </div>

      </div>
    </section>
  );
}

import { Activity, FileText, Server, Shield } from 'lucide-react';

const GOLD  = '#c9a96e';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

const SERVICES = [
  { label: 'Spring Boot API', icon: Server  },
  { label: 'MySQL Database',  icon: FileText },
  { label: 'JWT Auth',        icon: Shield  },
];

export default function SystemStatus({ health }) {
  const isOnline  = health === true;
  const isOffline = health === false;
  const isPending = health === null;

  const statusColor   = isOnline ? '#34d399' : isOffline ? '#f87171' : GOLD;
  const statusBg      = isOnline ? 'rgba(52,211,153,0.1)'  : isOffline ? 'rgba(248,113,113,0.1)'  : 'rgba(201,169,110,0.08)';
  const statusBorder  = isOnline ? 'rgba(52,211,153,0.2)'  : isOffline ? 'rgba(248,113,113,0.2)'  : 'rgba(201,169,110,0.15)';
  const pillBg        = isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)';
  const pillBorder    = isOnline ? 'rgba(52,211,153,0.16)' : 'rgba(248,113,113,0.16)';
  const pillColor     = isOnline ? '#34d399' : '#f87171';
  const dotGlow       = isOnline ? '0 0 8px rgba(52,211,153,0.7)' : 'none';
  const statusLabel   = isPending ? 'Đang kiểm tra kết nối…' : isOnline ? 'Backend sẵn sàng' : 'Mất kết nối Backend';

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
        backgroundColor: '#0b1f28',
      }}
    >
      {/* Deep overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11,31,40,0.90)',
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
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '640px', marginInline: 'auto', textAlign: 'center' }}>

          {/* Status circle */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '999px',
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginInline: 'auto',
            marginBottom: '24px',
          }}>
            {isPending ? (
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: '3px solid rgba(201,169,110,0.2)',
                borderTopColor: GOLD,
                animation: 'spin 0.75s linear infinite',
              }} />
            ) : isOnline ? (
              <Activity size={30} style={{ color: '#34d399' }} strokeWidth={2} />
            ) : (
              <Server size={30} style={{ color: '#f87171' }} strokeWidth={2} />
            )}
          </div>

          <p style={{ color: GOLD, fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Hạ tầng hệ thống
          </p>
          <h2 style={{ ...SERIF, color: '#f8f5f0', fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {statusLabel}
          </h2>
          <p style={{ color: 'rgba(232,224,212,0.42)', fontSize: '0.88rem', lineHeight: 1.75, margin: '0 0 32px' }}>
            Hệ thống quản lý chung cư BlueMoon — quản lý căn hộ, cư dân, khoản thu và thanh toán.
            Dữ liệu đồng bộ từ backend Spring Boot, lưu trữ trên MySQL.
          </p>

          {/* Service pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SERVICES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  color: pillColor,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform  = 'scale(1.05)';
                  e.currentTarget.style.boxShadow  = `0 4px 16px ${pillColor}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: statusColor,
                  boxShadow: dotGlow,
                  animation: isOnline ? 'pulse 2s ease-in-out infinite' : 'none',
                }} />
                <Icon size={13} strokeWidth={2} />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

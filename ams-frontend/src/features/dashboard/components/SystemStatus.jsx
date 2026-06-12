import { Activity, FileText, Server, Shield } from 'lucide-react';

const SERVICES = [
  { label: 'Spring Boot API', icon: Server   },
  { label: 'MySQL Database',  icon: FileText },
  { label: 'JWT Auth',        icon: Shield   },
];

export default function SystemStatus({ health }) {
  const isOnline  = health === true;
  const isOffline = health === false;
  const isPending = health === null;

  // Status-dependent tokens
  const statusColor  = isOnline ? '#34d399' : isOffline ? '#f87171' : '#c9a96e';
  const statusBg     = isOnline ? 'rgba(52,211,153,0.1)'  : isOffline ? 'rgba(248,113,113,0.1)'  : 'rgba(201,169,110,0.08)';
  const statusBorder = isOnline ? 'rgba(52,211,153,0.2)'  : isOffline ? 'rgba(248,113,113,0.2)'  : 'rgba(201,169,110,0.15)';
  const pillBg       = isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)';
  const pillBorder   = isOnline ? 'rgba(52,211,153,0.16)' : 'rgba(248,113,113,0.16)';
  const pillColor    = isOnline ? '#34d399' : '#f87171';
  const dotGlow      = isOnline ? '0 0 8px rgba(52,211,153,0.7)' : 'none';
  const statusLabel  = isPending
    ? 'Đang kiểm tra kết nối…'
    : isOnline
      ? 'Backend sẵn sàng'
      : 'Mất kết nối Backend';

  return (
    <section
      className="db-section"
      style={{
        backgroundImage: 'url("/images/section-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--bg-body)',
      }}
    >
      {/* Deep overlay */}
      <div className="db-overlay" aria-hidden="true" />

      {/* Top separator */}
      <div className="db-separator" aria-hidden="true" />

      <div className="db-content">
        <div className="db-status-center">

          {/* Status circle */}
          <div
            className="db-status-circle"
            style={{ background: statusBg, border: `1px solid ${statusBorder}` }}
          >
            {isPending ? (
              <div className="spinner" style={{ width: '22px', height: '22px', borderWidth: '3px', borderColor: 'rgba(201,169,110,0.2)', borderTopColor: '#c9a96e' }} />
            ) : isOnline ? (
              <Activity size={30} style={{ color: '#34d399' }} strokeWidth={2} />
            ) : (
              <Server size={30} style={{ color: '#f87171' }} strokeWidth={2} />
            )}
          </div>

          <p className="db-eyebrow" style={{ justifyContent: 'center' }}>
            Hạ tầng hệ thống
          </p>
          <h2 className="db-status-title">{statusLabel}</h2>
          <p className="db-status-desc">
            Hệ thống quản lý chung cư BlueMoon — quản lý căn hộ, cư dân, khoản thu và thanh toán.
            Dữ liệu đồng bộ từ backend Spring Boot, lưu trữ trên MySQL.
          </p>

          {/* Service pills */}
          <div className="db-service-pills">
            {SERVICES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="db-service-pill"
                style={{
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                  color: pillColor,
                }}
              >
                <div
                  className="db-service-dot"
                  style={{
                    background: statusColor,
                    boxShadow: dotGlow,
                    animation: isOnline ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                />
                <Icon size={13} strokeWidth={2} aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

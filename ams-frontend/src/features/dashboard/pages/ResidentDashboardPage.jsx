import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CreditCard,
  Home,
  Receipt,
  User,
  Megaphone,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../store/authStore';
import { apiClient } from '../../../lib/apiClient';
import StatCard from '../../../components/ui/StatCard';
import { fetchAnnouncements } from '../../announcements/api/announcementsApi';

/* ── Design tokens (hardcoded for section-level dark/beige contrast) ── */
const GOLD  = '#c9a96e';
const TEAL  = '#0b1f28';
const BEIGE = '#f8f5f0';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

/* ── Eyebrow styles per section background ── */
const EYEBROW_DARK  = { color: GOLD,            fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' };
const EYEBROW_LIGHT = { color: 'rgba(139,108,62,0.7)', fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: 0 };

function ResidentDashboardPage() {
  const { user } = useAuth();

  /* ── Preserved logic — DO NOT MODIFY ─────────────── */
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const aptInfo = useMemo(() => {
    return user?.apartmentId
      ? { id: user.apartmentId, code: user.apartmentCode }
      : null;
  }, [user?.apartmentId, user?.apartmentCode]);

  const [stats,     setStats]     = useState({ unpaidCount: 0, totalPaid: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [health,    setHealth]    = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);

  useEffect(() => {
    async function checkHealthAndLoadData() {
      apiClient('/health', { token: null })
        .then(() => setHealth(true))
        .catch(() => setHealth(false));

      setIsAnnouncementsLoading(true);
      fetchAnnouncements()
        .then(data => setAnnouncements(data.slice(0, 3)))
        .catch(err => console.error('Error fetching announcements:', err))
        .finally(() => setIsAnnouncementsLoading(false));

      if (!aptInfo) return;
      setIsLoading(true);

      try {
        const [feesRes, paymentsRes] = await Promise.allSettled([
          apiClient(`/fees/by-apartment/${aptInfo.id}`),
          apiClient(`/payments/by-apartment/${aptInfo.id}`),
        ]);

        let unpaid = 0;
        let paid   = 0;

        if (feesRes.status === 'fulfilled' && feesRes.value?.data) {
          unpaid = feesRes.value.data.filter(f => f.status !== 'PAID').length;
        }
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
          paid = paymentsRes.value.data.reduce((acc, p) => acc + (p.amount || 0), 0);
        }

        setStats({ unpaidCount: unpaid, totalPaid: paid });
      } catch (err) {
        console.error('Error fetching resident stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkHealthAndLoadData();
  }, [aptInfo]); // eslint-disable-line react-hooks/exhaustive-deps
  /* ── End preserved logic ──────────────────────────── */

  const displayName = user?.fullName || user?.username || 'Cư dân';

  /* Health pill derived values */
  const healthColor  = health === true ? '#34d399' : health === false ? '#f87171' : GOLD;
  const healthBg     = health === true ? 'rgba(52,211,153,0.1)'  : health === false ? 'rgba(248,113,113,0.1)'  : 'rgba(201,169,110,0.08)';
  const healthBorder = health === true ? 'rgba(52,211,153,0.2)'  : health === false ? 'rgba(248,113,113,0.2)'  : 'rgba(201,169,110,0.15)';
  const healthLabel  = health === null ? 'Đang kiểm tra…' : health ? 'Hệ thống hoạt động' : 'Mất kết nối';

  /* Profile info rows */
  const INFO_ROWS = [
    { label: 'Họ và tên',     value: user?.fullName || '—'       },
    { label: 'Tên đăng nhập', value: user?.username || '—'       },
    { label: 'Email',         value: user?.email    || '—'       },
    { label: 'Căn hộ',       value: aptInfo?.code  || 'Chưa được gán' },
  ];

  return (
    <div className="ap-root dashboard-bleed">

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO (image + teal gradient)
          ══════════════════════════════════════════════ */}
      <section
        className="db-section"
        style={{
          paddingTop: '80px',
          paddingBottom: '56px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url("/images/hero-bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundColor: 'var(--bg-body)',
        }}
      >
        {/* Gradient overlay — teal from left, fades to transparent right */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, var(--bg-body) 0%, rgba(var(--bg-body-rgb), 0.84) 52%, rgba(var(--bg-body-rgb), 0.42) 100%)',
            zIndex: 0,
          }}
        />

        {/* Ghost apartment code watermark */}
        <span
          aria-hidden="true"
          style={{
            ...SERIF,
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            fontSize: 'clamp(6rem, 14vw, 11rem)',
            fontWeight: 900,
            color: 'rgba(201,169,110,0.055)',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
            letterSpacing: '-0.05em',
            zIndex: 1,
          }}
        >
          {aptInfo?.code || 'HOME'}
        </span>

        {/* All content above overlay */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* System health chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: healthBg,
              border: `1px solid ${healthBorder}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '999px',
              padding: '5px 14px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: healthColor,
              marginBottom: '36px',
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'currentColor',
              flexShrink: 0,
              animation: health === true ? 'pulse 2s ease-in-out infinite' : 'none',
            }} />
            <Activity size={11} strokeWidth={2.5} />
            {healthLabel}
          </div>

          {/* Eyebrow */}
          <p style={{ ...EYEBROW_DARK, marginBottom: '12px' }}>
            <Home size={11} strokeWidth={2.5} />
            Chào mừng trở lại
          </p>

          {/* Greeting */}
          <h1 style={{
            ...SERIF,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: 'var(--text-heading)',
            margin: '0 0 8px',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            textShadow: '0 2px 24px rgba(0,0,0,0.4)',
          }}>
            {greeting},
          </h1>

          {/* Name — italic gold serif */}
          <h2 style={{
            ...SERIF,
            fontSize: 'clamp(1.25rem, 3.2vw, 2.1rem)',
            fontWeight: 700,
            color: GOLD,
            fontStyle: 'italic',
            margin: '0 0 36px',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 16px rgba(0,0,0,0.3)',
          }}>
            {displayName}
          </h2>

          {/* Gold divider + context note */}
          <div className="pm-divider" style={{ margin: '0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 500, margin: 0, flexShrink: 0 }}>
              {aptInfo ? `Căn hộ ${aptInfo.code}` : 'Cư dân BlueMoon AMS'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — STATS (warm beige)
          ══════════════════════════════════════════════ */}
      <section
        className="db-section"
        style={{ paddingTop: '52px', paddingBottom: '52px' }}
      >
        <p style={{ ...EYEBROW_LIGHT, marginBottom: '6px' }}>Số liệu của tôi</p>
        <h2 style={{
          ...SERIF,
          color: 'var(--text-heading)',
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          fontWeight: 800,
          margin: '0 0 32px',
          letterSpacing: '-0.025em',
        }}>
          Thống kê nhanh
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
          {/* Apartment — always available from auth, never in loading state */}
          <StatCard
            label="Căn hộ của tôi"
            value={aptInfo?.code ?? null}
            icon={Home}
            isLoading={false}
            delay={0}
          />
          {/* Unpaid fee count */}
          <StatCard
            label="Khoản thu chưa nộp"
            value={stats.unpaidCount}
            icon={Receipt}
            suffix="khoản"
            isLoading={isLoading}
            delay={80}
          />
          {/* Total paid — formatted as VND currency string */}
          <StatCard
            label="Đã thanh toán"
            value={`${stats.totalPaid.toLocaleString('vi-VN')} ₫`}
            icon={CreditCard}
            isLoading={isLoading}
            delay={160}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2.5 — ANNOUNCEMENTS & EVENTS (glass/border cards)
          ══════════════════════════════════════════════ */}
      <section
        className="db-section"
        style={{ paddingTop: '12px', paddingBottom: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <p style={{ ...EYEBROW_LIGHT, marginBottom: '6px' }}>Bảng tin tòa nhà</p>
            <h2 style={{
              ...SERIF,
              color: 'var(--text-heading)',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.025em',
            }}>
              Thông báo & Sự kiện mới nhất
            </h2>
          </div>
          <Link
            to="/announcements"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {isAnnouncementsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ marginRight: '8px' }} /> Đang tải bảng tin...
          </div>
        ) : announcements.length === 0 ? (
          <div className="workspace-panel liquid-glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có thông báo hoặc sự kiện mới.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {announcements.map((item) => {
              const isEvent = item.type === 'EVENT';
              const Icon = isEvent ? Calendar : Megaphone;
              return (
                <Link
                  key={item.id}
                  to="/announcements"
                  className="workspace-panel liquid-glass"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span
                        className={`status-badge ${isEvent ? 'paid' : 'pending'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        <Icon size={11} />
                        {isEvent ? 'Sự kiện' : 'Thông báo'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-heading)',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.content}
                    </p>
                  </div>
                  {isEvent && item.eventDate && (
                    <div style={{
                      marginTop: '12px',
                      fontSize: '0.75rem',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      background: 'var(--accent-subtle)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                    }}>
                      <Calendar size={12} />
                      {new Date(item.eventDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — PROFILE (image + dark overlay)
          ══════════════════════════════════════════════ */}
      <section
        className="db-section"
        style={{
          paddingTop: '52px',
          paddingBottom: '72px',
          position: 'relative',
          backgroundImage: 'url("/images/hero-bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundColor: 'var(--bg-body)',
        }}
      >
        {/* Deep overlay — more opaque for profile card readability */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(var(--bg-body-rgb), 0.90)',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ ...EYEBROW_DARK, marginBottom: '6px' }}>
          <User size={11} strokeWidth={2.5} />
          Hồ sơ cư dân
        </p>
        <h2 style={{
          ...SERIF,
          color: 'var(--text-heading)',
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          fontWeight: 800,
          margin: '0 0 28px',
          letterSpacing: '-0.025em',
        }}>
          Thông tin cá nhân
        </h2>

        {/* Profile card — reusing .pm-card-dark */}
        <div
          className="pm-card-dark"
          style={{ maxWidth: '640px' }}
        >
          {INFO_ROWS.map(({ label, value }, idx) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '15px 22px',
                borderBottom: idx < INFO_ROWS.length - 1
                  ? '1px solid rgba(201,169,110,0.06)'
                  : '1px solid rgba(201,169,110,0.06)',
              }}
            >
              <span style={{
                color: 'rgba(201,169,110,0.55)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{
                color: 'var(--text-primary)',
                fontSize: '0.93rem',
                fontWeight: 600,
                textAlign: 'right',
                wordBreak: 'break-all',
              }}>
                {value}
              </span>
            </div>
          ))}

          {/* Role row — uses .pm-badge reusable class */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '15px 22px',
          }}>
            <span style={{
              color: 'rgba(201,169,110,0.55)',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              Vai trò
            </span>
            <span
              className="pm-badge"
              style={{
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.2)',
                color: '#34d399',
                fontSize: '0.67rem',
              }}
            >
              <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'currentColor',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              Cư dân
            </span>
          </div>
        </div>

        {/* System status footer note */}
        <p style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          color: 'rgba(201,169,110,0.32)',
          fontSize: '0.8rem',
          fontWeight: 500,
          lineHeight: 1.6,
        }}>
          <Activity size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
          {health === null
            ? 'Đang kiểm tra kết nối hệ thống…'
            : health
              ? 'Spring Boot API đang hoạt động bình thường. Dữ liệu được đồng bộ theo thời gian thực.'
              : 'Mất kết nối với Backend. Dữ liệu có thể không được cập nhật.'}
        </p>
        </div>
      </section>

    </div>
  );
}

export default ResidentDashboardPage;

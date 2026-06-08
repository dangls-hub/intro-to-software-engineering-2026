import { Building2, CreditCard, Receipt, Users } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';

const GOLD  = '#c9a96e';
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

const CARD_DEFS = [
  { key: 'apartments', label: 'Tổng căn hộ', icon: Building2,  suffix: 'căn',   delay: 0   },
  { key: 'residents',  label: 'Cư dân',       icon: Users,      suffix: 'người', delay: 80  },
  { key: 'fees',       label: 'Khoản thu',    icon: Receipt,    suffix: 'khoản', delay: 160 },
  { key: 'payments',   label: 'Giao dịch',    icon: CreditCard, suffix: 'lần',   delay: 240 },
];

export default function MetricsGrid({ metrics, isLoading }) {
  return (
    <section
      className="db-section"
      style={{
        paddingTop: '56px',
        paddingBottom: '56px',
        position: 'relative',
        /* Continue same hero image for visual flow */
        backgroundImage: 'url("/images/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0b1f28',
      }}
    >
      {/* Deep teal overlay — slightly transparent so image texture bleeds through */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11,31,40,0.84)',
          zIndex: 0,
        }}
      />

      {/* Subtle top separator line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.18), transparent)',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Section label */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{
            color: GOLD,
            fontSize: '0.73rem',
            fontWeight: 700,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            margin: '0 0 6px',
          }}>
            Số liệu tổng quan
          </p>
          <h2 style={{
            ...SERIF,
            color: '#f8f5f0',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.025em',
          }}>
            Thống kê nhanh
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
          {CARD_DEFS.map(({ key, label, icon, suffix, delay }) => (
            <StatCard
              key={key}
              glass
              label={label}
              value={metrics[key]}
              icon={icon}
              suffix={suffix}
              isLoading={isLoading}
              delay={delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

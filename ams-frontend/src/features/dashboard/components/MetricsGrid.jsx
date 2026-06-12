import { Building2, CreditCard, Receipt, Users } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';

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
        backgroundImage: 'url("/images/hero-bg.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--bg-body)',
      }}
    >
      {/* Overlay */}
      <div className="db-overlay-metrics" aria-hidden="true" />

      {/* Subtle top separator line */}
      <div className="db-separator" aria-hidden="true" />

      <div className="db-content">
        {/* Section label */}
        <div className="db-metrics-label">
          <p>Số liệu tổng quan</p>
          <h2>Thống kê nhanh</h2>
        </div>

        <div className="db-metrics-grid">
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

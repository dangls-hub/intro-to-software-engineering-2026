import { useEffect, useState } from 'react';
import {
  Building2,
  CreditCard,
  Home,
  Receipt,
  RefreshCcw,
  Users,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { fetchDashboardStats } from '../api/dashboardApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { fetchResidents } from '../../residents/api/residentsApi';
import { fetchFees } from '../../fees/api/feesApi';
import { fetchPayments } from '../../payments/api/paymentsApi';
import { useToast } from '../../../components/ui/Toast';

const initialMetrics = { apartments: 0, residents: 0, fees: 0, payments: 0 };

function DashboardPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const showToast = useToast();

  async function loadDashboard() {
    setIsLoading(true);
    setError('');

    try {
      // Kiểm tra health check
      const healthRes = await apiClient('/health', { token: null }).then(() => true).catch(() => false);
      setHealth(healthRes);

      // Thử gọi dashboard stats API trước
      const dashStats = await fetchDashboardStats();

      if (dashStats) {
        // Backend đã có Dashboard API
        setMetrics({
          apartments: dashStats.totalApartments ?? dashStats.apartments ?? 0,
          residents: dashStats.totalResidents ?? dashStats.residents ?? 0,
          fees: dashStats.totalFees ?? dashStats.fees ?? 0,
          payments: dashStats.totalPayments ?? dashStats.payments ?? 0,
        });
      } else {
        // Fallback: đếm từ từng API riêng lẻ
        const [aptsRes, resRes, feesRes, payRes] = await Promise.allSettled([
          fetchApartments(),
          fetchResidents(),
          fetchFees(),
          fetchPayments(),
        ]);

        setMetrics({
          apartments: aptsRes.status === 'fulfilled' ? aptsRes.value.length : 0,
          residents: resRes.status === 'fulfilled' ? resRes.value.length : 0,
          fees: feesRes.status === 'fulfilled' ? feesRes.value.length : 0,
          payments: payRes.status === 'fulfilled' ? payRes.value.length : 0,
        });

        const failed = [aptsRes, resRes, feesRes, payRes].find((r) => r.status === 'rejected');
        if (failed) {
          setError(failed.reason?.message || 'Không tải được một số dữ liệu.');
        }
      }
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu dashboard.');
      showToast('Lỗi tải dữ liệu dashboard', 'error');
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    { label: 'Căn hộ', value: metrics.apartments, icon: Home, color: 'blue' },
    { label: 'Cư dân', value: metrics.residents, icon: Users, color: 'green' },
    { label: 'Khoản thu', value: metrics.fees, icon: Receipt, color: 'purple' },
    { label: 'Thanh toán', value: metrics.payments, icon: CreditCard, color: 'amber' },
  ];

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <TrendingUp size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Tổng quan hệ thống
          </p>
          <h1>{greeting} 👋</h1>
        </div>
        <button className="secondary-button" onClick={loadDashboard} type="button">
          <RefreshCcw size={17} aria-hidden="true" />
          Tải lại
        </button>
      </header>

      {error && <div className="alert warning">{error}</div>}

      <section className="metric-grid" aria-label="Thống kê nhanh" aria-busy={isLoading}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <article className="metric-card" key={label}>
            <div className={`metric-icon ${color}`}>
              <Icon size={24} aria-hidden="true" />
            </div>
            <div>
              <div className="metric-label">{label}</div>
              <div className="metric-value">{isLoading ? '—' : value}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Trạng thái hệ thống</p>
            <h2>Kết nối Backend</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity
              size={18}
              aria-hidden="true"
              style={{ color: health ? 'var(--success)' : 'var(--danger)' }}
            />
            <span className={`status-badge ${health ? 'active' : 'inactive'}`}>
              {health === null
                ? 'Đang kiểm tra...'
                : health
                  ? 'Backend sẵn sàng'
                  : 'Không kết nối được'}
            </span>
          </div>
        </div>
        <p className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
          Hệ thống quản lý chung cư BlueMoon — quản lý căn hộ, cư dân, khoản thu và thanh toán.
          Dữ liệu được đồng bộ từ backend Spring Boot và lưu trữ trên MySQL.
        </p>
      </section>
    </>
  );
}

export default DashboardPage;

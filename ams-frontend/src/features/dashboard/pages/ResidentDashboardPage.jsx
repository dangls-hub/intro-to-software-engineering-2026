import { useEffect, useState } from 'react';
import {
  CreditCard,
  Home,
  Receipt,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../../store/authStore';
import { apiClient } from '../../../lib/apiClient';

function ResidentDashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const aptInfo = user?.apartmentId
    ? { id: user.apartmentId, code: user.apartmentCode }
    : null;
  const [stats, setStats] = useState({ unpaidCount: 0, totalPaid: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function checkHealthAndLoadData() {
      // Check backend health
      apiClient('/health', { token: null })
        .then(() => setHealth(true))
        .catch(() => setHealth(false));

      if (!aptInfo) return;
      setIsLoading(true);

      try {
        const [feesRes, paymentsRes] = await Promise.allSettled([
          apiClient(`/fees/by-apartment/${aptInfo.id}`),
          apiClient(`/payments/by-apartment/${aptInfo.id}`),
        ]);

        let unpaid = 0;
        let paid = 0;

        if (feesRes.status === 'fulfilled' && feesRes.value?.data) {
          const feesList = feesRes.value.data;
          unpaid = feesList.filter((f) => f.status !== 'PAID').length;
        }

        if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
          const paymentsList = paymentsRes.value.data;
          paid = paymentsList.reduce((acc, p) => acc + (p.amount || 0), 0);
        }

        setStats({ unpaidCount: unpaid, totalPaid: paid });
      } catch (err) {
        console.error('Error fetching resident stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkHealthAndLoadData();
  }, [user, aptInfo]);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Home size={14} />
            Trang cư dân
          </p>
          <h1>{greeting}, {user?.fullName || user?.username || 'Cư dân'} 👋</h1>
        </div>
      </header>

      <section className="metric-grid">
        <article className="metric-card" style={{ '--i': 0 }}>
          <div className="metric-icon blue">
            <User size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Tài khoản</div>
            <div className="metric-value" style={{ fontSize: '1.1rem' }}>{user?.username || '—'}</div>
          </div>
        </article>

        <article className="metric-card" style={{ '--i': 1 }}>
          <div className="metric-icon purple">
            <Receipt size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Khoản thu chưa nộp</div>
            <div className="metric-value">{isLoading ? '—' : stats.unpaidCount}</div>
          </div>
        </article>

        <article className="metric-card" style={{ '--i': 2 }}>
          <div className="metric-icon green">
            <CreditCard size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Đã thanh toán</div>
            <div className="metric-value" style={{ fontSize: '1.3rem' }}>
              {isLoading ? '—' : `${stats.totalPaid.toLocaleString('vi-VN')} đ`}
            </div>
          </div>
        </article>
      </section>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Thông tin cá nhân</p>
            <h2>Hồ sơ cư dân</h2>
          </div>
          <div className="system-status-row">
            <Activity
              size={18}
              aria-hidden="true"
              style={{ color: health ? 'var(--success)' : 'var(--danger)' }}
            />
            <span className={`status-badge ${health ? 'active' : 'inactive'}`}>
              {health === null
                ? 'Đang kiểm tra...'
                : health
                  ? 'Kết nối ổn định'
                  : 'Mất kết nối'}
            </span>
          </div>
        </div>

        <div className="resident-info-grid">
          <div className="info-row">
            <span className="info-label">Họ và tên</span>
            <span className="info-value">{user?.fullName || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tên đăng nhập</span>
            <span className="info-value">{user?.username || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Căn hộ</span>
            <span className="info-value">{aptInfo ? aptInfo.code : 'Chưa được gán'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Vai trò</span>
            <span className="info-value">
              <span className="status-badge active">Cư dân</span>
            </span>
          </div>
        </div>

        <p className="muted-text system-description" style={{ marginTop: 20 }}>
          <Clock size={16} />
          Bạn có thể xem chi tiết khoản thu và lịch sử thanh toán của mình tại các mục tương ứng trong menu bên trái.
        </p>
      </section>
    </>
  );
}

export default ResidentDashboardPage;

import {
  CreditCard,
  Home,
  Receipt,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '../../../store/authStore';

function ResidentDashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Home size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Trang cư dân
          </p>
          <h1>{greeting}, {user?.fullName || user?.username || 'Cư dân'} 👋</h1>
        </div>
      </header>

      <section className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(155px, 1fr))' }}>
        <article className="metric-card">
          <div className="metric-icon blue">
            <User size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Tài khoản</div>
            <div className="metric-value" style={{ fontSize: '1.1rem' }}>{user?.username || '—'}</div>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon purple">
            <Receipt size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Khoản thu</div>
            <div className="metric-value">—</div>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon green">
            <CreditCard size={24} aria-hidden="true" />
          </div>
          <div>
            <div className="metric-label">Thanh toán</div>
            <div className="metric-value">—</div>
          </div>
        </article>
      </section>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Thông tin cá nhân</p>
            <h2>Hồ sơ cư dân</h2>
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

        <p className="muted-text" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <Clock size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
          Bạn có thể xem khoản thu và lịch sử thanh toán của mình tại các mục tương ứng trong menu bên trái.
        </p>
      </section>
    </>
  );
}

export default ResidentDashboardPage;

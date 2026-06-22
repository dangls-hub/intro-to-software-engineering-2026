import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Menu, X } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import { useAuth } from '../../store/authStore';

const ROUTE_MAP = {
  '/':            'Tổng quan',
  '/apartments':  'Căn hộ',
  '/residents':   'Cư dân',
  '/approvals':   'Phê duyệt',
  '/fees':        'Khoản thu',
  '/payments':    'Thanh toán',
  '/profile':     'Hồ sơ',
  '/my-fees':     'Khoản thu',
  '/my-payments': 'Thanh toán',
};

function initials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('').slice(0, 2) || '?';
}

export default function AppHeader({ displayName, sidebarOpen, onToggleSidebar }) {
  const { pathname } = useLocation();
  const pageLabel = ROUTE_MAP[pathname] ?? 'BlueMoon AMS';
  const { user, token } = useAuth();
  const userId = user?.userId || user?.id;

  return (
    <header className="app-header">

      {/* Left: toggle + breadcrumb */}
      <div className="app-header-left">
        <button
          className="app-header-toggle"
          onClick={onToggleSidebar}
          type="button"
          aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
        >
          {sidebarOpen
            ? <X size={17} strokeWidth={2.5} />
            : <Menu size={17} strokeWidth={2.5} />}
        </button>

        <nav className="app-breadcrumb" aria-label="Breadcrumb">
          <span className="app-breadcrumb-root">BlueMoon</span>
          <ChevronRight size={12} strokeWidth={2.5} className="app-breadcrumb-sep" aria-hidden="true" />
          <span className="app-breadcrumb-page">{pageLabel}</span>
        </nav>
      </div>

      {/* Right: notifications + user chip */}
      <div className="app-header-right">
        {userId && <NotificationBell userId={userId} token={token || localStorage.getItem('token')} />}

        <div
          className="header-user-chip"
          role="button"
          tabIndex={0}
          aria-label={`Tài khoản: ${displayName}`}
        >
          <div className="header-user-avatar" aria-hidden="true">
            {initials(displayName)}
          </div>
          <span className="header-user-name">
            {displayName.trim().split(/\s+/).at(-1)}
          </span>
        </div>
      </div>

    </header>
  );
}

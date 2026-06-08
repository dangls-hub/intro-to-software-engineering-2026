import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Menu, X } from 'lucide-react';

const ROUTE_MAP = {
  '/':            'Tổng quan',
  '/apartments':  'Căn hộ',
  '/residents':   'Cư dân',
  '/fees':        'Khoản thu',
  '/payments':    'Thanh toán',
  '/my-fees':     'Khoản thu',
  '/my-payments': 'Thanh toán',
};

function initials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('').slice(0, 2) || '?';
}

export default function AppHeader({ displayName, sidebarOpen, onToggleSidebar }) {
  const { pathname } = useLocation();
  const pageLabel = ROUTE_MAP[pathname] ?? 'BlueMoon AMS';

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
        <button
          className="header-bell"
          type="button"
          aria-label="Thông báo"
        >
          <Bell size={16} strokeWidth={2} />
          <span className="header-bell-dot" aria-hidden="true" />
        </button>

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

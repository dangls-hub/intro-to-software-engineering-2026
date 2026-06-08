import { NavLink } from 'react-router-dom';
import { Building2, LogOut, Moon, Sun, X } from 'lucide-react';

const ROLE_LABEL = { ADMIN: 'Quản trị viên', STAFF: 'Nhân viên', RESIDENT: 'Cư dân' };

function initials(name = '') {
  return name.trim().split(/\s+/).filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('').slice(0, 2) || '?';
}

export default function Sidebar({ navItems, displayName, role, sidebarOpen, onClose, theme, onToggleTheme, onLogout }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* ── Brand ──────────────────────────────────── */}
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Building2 size={19} strokeWidth={2} />
          </span>
          <div>
            <span className="brand-name">
              BlueMoon <em>AMS</em>
            </span>
            <small>Quản lý chung cư</small>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Đóng menu"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="brand-divider" aria-hidden="true" />

        {/* ── Navigation ─────────────────────────────── */}
        <p className="nav-section-label" aria-hidden="true">Điều hướng</p>
        <nav className="nav-list" aria-label="Điều hướng chính">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="nav-link"
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={2} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: user card + actions ────────────── */}
        <div className="sidebar-bottom">

          {/* User identity card */}
          <div className="sidebar-user-card">
            <div className="sidebar-avatar" aria-hidden="true">
              {initials(displayName)}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="role-tag" data-role={role}>{ROLE_LABEL[role] ?? role}</span>
            </div>
          </div>

          {/* Compact action row */}
          <div className="sidebar-actions">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              type="button"
              aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {theme === 'dark'
                ? <><Sun size={14} strokeWidth={2} aria-hidden="true" /> Sáng</>
                : <><Moon size={14} strokeWidth={2} aria-hidden="true" /> Tối</>}
            </button>
            <button className="logout-button" onClick={onLogout} type="button">
              <LogOut size={14} strokeWidth={2} aria-hidden="true" />
              Thoát
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}

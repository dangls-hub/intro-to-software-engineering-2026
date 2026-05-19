import { useState } from 'react';
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Users,
} from 'lucide-react';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ApartmentsPage from './features/apartments/pages/ApartmentsPage';
import ResidentsPage from './features/residents/pages/ResidentsPage';
import FeesPage from './features/fees/pages/FeesPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import { clearAuthToken, getAuthToken, setAuthToken } from './lib/apiClient';

function getInitialAuth() {
  const token = getAuthToken();
  if (!token) return null;
  return { token, user: { username: 'staff' } };
}

function AppLayout({ auth, onLogout }) {
  const navItems = [
    { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/apartments', label: 'Căn hộ', icon: Building2 },
    { to: '/residents', label: 'Cư dân', icon: Users },
    { to: '/fees', label: 'Khoản thu', icon: Receipt },
    { to: '/payments', label: 'Thanh toán', icon: CreditCard },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Building2 size={22} aria-hidden="true" />
          </span>
          <div>
            <span>BlueMoon AMS</span>
            <small>{auth.user?.fullName || auth.user?.username || 'Nhân viên'}</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Điều hướng chính">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink className="nav-link" end={end} key={to} to={to}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" onClick={onLogout} type="button">
          <LogOut size={18} aria-hidden="true" />
          Đăng xuất
        </button>
      </aside>

      <section className="content">
        <Routes>
          <Route element={<DashboardPage />} index />
          <Route element={<ApartmentsPage />} path="apartments" />
          <Route element={<ResidentsPage />} path="residents" />
          <Route element={<FeesPage />} path="fees" />
          <Route element={<PaymentsPage />} path="payments" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </section>
    </main>
  );
}

function App() {
  const [auth, setAuth] = useState(getInitialAuth);

  function handleLogin(authPayload) {
    setAuthToken(authPayload.token);
    setAuth(authPayload);
  }

  function handleLogout() {
    clearAuthToken();
    setAuth(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={auth ? <Navigate replace to="/" /> : <LoginPage onLogin={handleLogin} />}
          path="/login"
        />
        <Route
          element={auth ? <AppLayout auth={auth} onLogout={handleLogout} /> : <Navigate replace to="/login" />}
          path="/*"
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

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
  Home,
  LayoutDashboard,
  LogOut,
  Receipt,
  KeyRound,
  Users,
} from 'lucide-react';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ApartmentsPage from './features/apartments/pages/ApartmentsPage';
import ResidentsPage from './features/residents/pages/ResidentsPage';
import FeesPage from './features/fees/pages/FeesPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import ResidentDashboardPage from './features/dashboard/pages/ResidentDashboardPage';
import { clearAuthToken, getAuthToken, setAuthToken } from './lib/apiClient';

const AUTH_USER_KEY = 'bluemoon_auth_user';

function getInitialAuth() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    const user = savedUser ? JSON.parse(savedUser) : { username: 'staff', role: 'STAFF' };
    return { token, user };
  } catch {
    return { token, user: { username: 'staff', role: 'STAFF' } };
  }
}

/** Danh sách nav items cho ADMIN và STAFF */
const adminStaffNavItems = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/apartments', label: 'Căn hộ', icon: Building2 },
  { to: '/residents', label: 'Cư dân', icon: Users },
  { to: '/fees', label: 'Khoản thu', icon: Receipt },
  { to: '/payments', label: 'Thanh toán', icon: CreditCard },
];

/** Danh sách nav items cho RESIDENT (cư dân) */
const residentNavItems = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/my-fees', label: 'Khoản thu', icon: Receipt },
  { to: '/my-payments', label: 'Thanh toán', icon: CreditCard },
];

function AppLayout({ auth, onLogout }) {
  const role = auth.user?.role || 'STAFF';
  const isResident = role === 'RESIDENT';
  const navItems = isResident ? residentNavItems : adminStaffNavItems;
  const displayName = auth.user?.fullName || auth.user?.username || (isResident ? 'Cư dân' : 'Nhân viên');

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Building2 size={22} aria-hidden="true" />
          </span>
          <div>
            <span>BlueMoon AMS</span>
            <small>{displayName}</small>
            <small className="role-tag" data-role={role}>{
              role === 'ADMIN' ? 'Quản trị viên' :
              role === 'STAFF' ? 'Nhân viên' : 'Cư dân'
            }</small>
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
        {isResident ? (
          <Routes>
            <Route element={<ResidentDashboardPage auth={auth} />} index />
            <Route element={<FeesPage role={role} />} path="my-fees" />
            <Route element={<PaymentsPage role={role} />} path="my-payments" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        ) : (
          <Routes>
            <Route element={<DashboardPage />} index />
            <Route element={<ApartmentsPage />} path="apartments" />
            <Route element={<ResidentsPage />} path="residents" />
            <Route element={<FeesPage role={role} />} path="fees" />
            <Route element={<PaymentsPage role={role} />} path="payments" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        )}
      </section>
    </main>
  );
}

function App() {
  const [auth, setAuth] = useState(getInitialAuth);

  function handleLogin(authPayload) {
    setAuthToken(authPayload.token);
    // Lưu thông tin user vào localStorage
    const user = authPayload.user || {};
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setAuth(authPayload);
  }

  function handleLogout() {
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_KEY);
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
          element={auth ? <Navigate replace to="/" /> : <RegisterPage />}
          path="/register"
        />
        <Route
          element={auth ? <Navigate replace to="/" /> : <ForgotPasswordPage />}
          path="/forgot-password"
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

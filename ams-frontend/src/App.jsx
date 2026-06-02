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
  Users,
} from 'lucide-react';

import { AuthProvider, useAuth } from './store/authStore';
import { ToastProvider } from './components/ui/Toast';
import { PrivateRoute, PublicRoute } from './routes/AppRouter';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ApartmentsPage from './features/apartments/pages/ApartmentsPage';
import ResidentsPage from './features/residents/pages/ResidentsPage';
import FeesPage from './features/fees/pages/FeesPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import ResidentDashboardPage from './features/dashboard/pages/ResidentDashboardPage';

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

function AppLayout() {
  const { user, logout } = useAuth();
  const role = user?.role || 'STAFF';
  const isResident = role === 'RESIDENT';
  const navItems = isResident ? residentNavItems : adminStaffNavItems;
  const displayName = user?.fullName || user?.username || (isResident ? 'Cư dân' : 'Nhân viên');

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

        <button className="logout-button" onClick={logout} type="button">
          <LogOut size={18} aria-hidden="true" />
          Đăng xuất
        </button>
      </aside>

      <section className="content">
        {isResident ? (
          <Routes>
            <Route element={<ResidentDashboardPage />} index />
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

function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
        path="/login"
      />
      <Route
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
        path="/register"
      />
      <Route
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
        path="/forgot-password"
      />
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
        path="/*"
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

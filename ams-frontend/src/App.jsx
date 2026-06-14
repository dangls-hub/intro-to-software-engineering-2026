import { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  Receipt,
  UserRound,
  Users,
} from 'lucide-react';

import { AuthProvider, useAuth } from './store/authStore';
import { ThemeProvider, useTheme } from './store/themeStore';
import { ToastProvider } from './components/ui/Toast';
import { PrivateRoute, PublicRoute } from './routes/AppRouter';
import Sidebar from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ApartmentsPage from './features/apartments/pages/ApartmentsPage';
import ResidentsPage from './features/residents/pages/ResidentsPage';
import ApprovalsPage from './features/residents/pages/ApprovalsPage';
import { fetchPendingCount } from './features/residents/api/residentsApi';
import FeesPage from './features/fees/pages/FeesPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import ResidentDashboardPage from './features/dashboard/pages/ResidentDashboardPage';
import ProfilePage from './features/profile/pages/ProfilePage';

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
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
  { to: '/my-fees', label: 'Khoản thu', icon: Receipt },
  { to: '/my-payments', label: 'Thanh toán', icon: CreditCard },
];

function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const role = user?.role || 'STAFF';
  const isResident = role === 'RESIDENT';
  const isAdmin = role === 'ADMIN';
  const displayName = user?.fullName || user?.username || (isResident ? 'Cư dân' : 'Nhân viên');

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount()
        .then(setPendingCount)
        .catch((err) => console.error('Error fetching pending count:', err));
    }
  }, [isAdmin, location.pathname]);

  // Build nav items dynamically based on role
  const navItems = isResident
    ? residentNavItems
    : [
        ...adminStaffNavItems,
        ...(isAdmin
          ? [{
              to: '/approvals',
              label: 'Phê duyệt',
              icon: ClipboardCheck,
              badge: pendingCount,
            }]
          : []),
      ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  useEffect(() => { closeSidebar(); }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e) { if (e.key === 'Escape') closeSidebar(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <main className="app-shell">
      <Sidebar
        navItems={navItems}
        displayName={displayName}
        role={role}
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />

      <div className="content-shell">
        <AppHeader
          displayName={displayName}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <section className="content">
          {isResident ? (
            <Routes>
              <Route element={<ResidentDashboardPage />} index />
              <Route element={<ProfilePage />} path="profile" />
              <Route element={<FeesPage role={role} />} path="my-fees" />
              <Route element={<PaymentsPage role={role} />} path="my-payments" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          ) : (
            <Routes>
              <Route element={<DashboardPage />} index />
              <Route element={<ApartmentsPage />} path="apartments" />
              <Route element={<ResidentsPage />} path="residents" />
              <Route element={<ApprovalsPage />} path="approvals" />
              <Route element={<FeesPage role={role} />} path="fees" />
              <Route element={<PaymentsPage role={role} />} path="payments" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          )}
        </section>
      </div>
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
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

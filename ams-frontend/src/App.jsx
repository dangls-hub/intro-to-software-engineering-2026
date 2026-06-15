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
  FileCheck,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
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
import { fetchPendingRequestCount } from './features/payments/api/paymentRequestsApi';
import FeesPage from './features/fees/pages/FeesPage';
import FeesByApartmentPage from './features/fees/pages/FeesByApartmentPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import PaymentApprovalsPage from './features/payments/pages/PaymentApprovalsPage';
import ResidentDashboardPage from './features/dashboard/pages/ResidentDashboardPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import ResidentReportsPage from './features/reports/pages/ResidentReportsPage';
import ReportsPage from './features/reports/pages/ReportsPage';
import AnnouncementsPage from './features/announcements/pages/AnnouncementsPage';

/** Danh sách nav items cho ADMIN và STAFF */
const adminStaffNavItems = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/announcements', label: 'Bảng tin', icon: Megaphone },
  { to: '/apartments', label: 'Căn hộ', icon: Building2 },
  { to: '/residents', label: 'Cư dân', icon: Users },
  { to: '/fees', label: 'Khoản thu', icon: Receipt },
  { to: '/payments', label: 'Thanh toán', icon: CreditCard },
  { to: '/reports', label: 'Ý kiến cư dân', icon: MessageSquare },
];

/** Danh sách nav items cho RESIDENT (cư dân) */
const residentNavItems = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/announcements', label: 'Bảng tin', icon: Megaphone },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
  { to: '/my-fees', label: 'Khoản thu', icon: Receipt },
  { to: '/my-payments', label: 'Thanh toán', icon: CreditCard },
  { to: '/my-reports', label: 'Phản ánh', icon: MessageSquare },
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
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount()
        .then(setPendingCount)
        .catch((err) => console.error('Error fetching pending count:', err));
      fetchPendingRequestCount()
        .then(setPendingPaymentCount)
        .catch((err) => console.error('Error fetching pending payment count:', err));
    }
  }, [isAdmin, location.pathname]);

  // Build nav items dynamically based on role
  const navItems = isResident
    ? residentNavItems
    : [
        ...adminStaffNavItems,
        ...(isAdmin
          ? [
              {
                to: '/approvals',
                label: 'Phê duyệt CD',
                icon: ClipboardCheck,
                badge: pendingCount,
              },
              {
                to: '/payment-approvals',
                label: 'Duyệt TT',
                icon: FileCheck,
                badge: pendingPaymentCount,
              },
            ]
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
              <Route element={<AnnouncementsPage />} path="announcements" />
              <Route element={<ProfilePage />} path="profile" />
              <Route element={<FeesPage role={role} />} path="my-fees" />
              <Route element={<PaymentsPage role={role} />} path="my-payments" />
              <Route element={<ResidentReportsPage />} path="my-reports" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          ) : (
            <Routes>
              <Route element={<DashboardPage />} index />
              <Route element={<AnnouncementsPage />} path="announcements" />
              <Route element={<ApartmentsPage />} path="apartments" />
              <Route element={<ResidentsPage />} path="residents" />
              <Route element={<ApprovalsPage />} path="approvals" />
              <Route element={<FeesPage role={role} />} path="fees" />
              <Route element={<FeesByApartmentPage />} path="fees-by-apartment" />
              <Route element={<PaymentsPage role={role} />} path="payments" />
              <Route element={<PaymentApprovalsPage />} path="payment-approvals" />
              <Route element={<ReportsPage />} path="reports" />
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

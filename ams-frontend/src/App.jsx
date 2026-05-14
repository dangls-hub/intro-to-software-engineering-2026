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
  LogOut,
  Receipt,
  Users,
} from 'lucide-react';
import ApartmentsPage from './features/apartments/pages/ApartmentsPage';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ResidentsPage from './features/residents/pages/ResidentsPage';
import { clearAuthToken, getAuthToken, setAuthToken } from './lib/apiClient';

function getInitialAuth() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  return {
    token,
    user: {
      username: 'staff',
    },
  };
}

function PlaceholderPage({ title, description }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Sprint 3</p>
          <h1>{title}</h1>
        </div>
      </header>
      <section className="workspace-panel">
        <p className="muted-text">{description}</p>
      </section>
    </>
  );
}

function AppLayout({ auth, onLogout }) {
  const navItems = [
    { to: '/', label: 'Tong quan', icon: Home, end: true },
    { to: '/residents', label: 'Cu dan', icon: Users },
    { to: '/apartments', label: 'Can ho', icon: Building2 },
    { to: '/fees', label: 'Khoan thu', icon: Receipt },
    { to: '/payments', label: 'Thanh toan', icon: CreditCard },
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
            <small>{auth.user?.fullName || auth.user?.username || 'Staff'}</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Dieu huong chinh">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink className="nav-link" end={end} key={to} to={to}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" onClick={onLogout} type="button">
          <LogOut size={18} aria-hidden="true" />
          Dang xuat
        </button>
      </aside>

      <section className="content">
        <Routes>
          <Route element={<DashboardPage />} index />
          <Route element={<ApartmentsPage />} path="apartments" />
          <Route element={<ResidentsPage />} path="residents" />
          <Route
            element={
              <PlaceholderPage
                description="Module khoan thu se duoc hoan thien sau khi backend fee API san sang."
                title="Quan ly khoan thu"
              />
            }
            path="fees"
          />
          <Route
            element={
              <PlaceholderPage
                description="Module thanh toan thuoc Sprint 3, hien de san vi tri dieu huong."
                title="Quan ly thanh toan"
              />
            }
            path="payments"
          />
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

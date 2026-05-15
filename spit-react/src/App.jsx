import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import PublicNavbar from './components/layout/PublicNavbar';
import PassengerNavbar from './components/layout/PassengerNavbar';
import PublicFooter from './components/layout/PublicFooter';

// ── Lazy-loaded pages ──────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/public/LoginPage'));
const HomePage           = lazy(() => import('./pages/public/HomePage'));
const RegisterPage       = lazy(() => import('./pages/public/RegisterPage'));
const AboutPage          = lazy(() => import('./pages/public/AboutPage'));
const PassengerDashboard = lazy(() => import('./pages/public/PassengerDashboard'));
const PassengerProfile   = lazy(() => import('./pages/public/PassengerProfile'));
const PassengerFeed      = lazy(() => import('./pages/public/PassengerFeed'));
const PassengerMessenger = lazy(() => import('./pages/public/PassengerMessenger'));
const SuggestionsPage    = lazy(() => import('./pages/public/SuggestionsPage'));
const AdminLayout          = lazy(() => import('./components/layout/AdminLayout'));
const DashboardPage        = lazy(() => import('./pages/admin/DashboardPage'));
const PassengersPage       = lazy(() => import('./pages/admin/PassengersPage'));
const PassengerDetailPage  = lazy(() => import('./pages/admin/PassengerDetailPage'));
const RecommendationsPage  = lazy(() => import('./pages/admin/RecommendationsPage'));
const AnalyticsPage        = lazy(() => import('./pages/admin/AnalyticsPage'));
const UsersPage            = lazy(() => import('./pages/admin/UsersPage'));
const RolesPage            = lazy(() => import('./pages/admin/RolesPage'));
const SettingsPage         = lazy(() => import('./pages/admin/SettingsPage'));

// ── Loading fallback ───────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: '#4A919E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Loading…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────
function PassengerRoute({ children }) {
  const { isLoggedIn, isPassenger, isAdmin } = useAuth();
  if (!isLoggedIn)  return <Navigate to="/login" replace />;
  // Admins can also view passenger pages if needed
  if (!isPassenger && !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

import ModernNavbar from './components/layout/ModernNavbar';
import ChatWidget from './components/ChatWidget';

// ── Passenger Portal Layout ───────────────────────────────
function PassengerPortalLayout() {
  const { theme } = useTheme();
  const bg = theme === 'dark' 
    ? 'linear-gradient(180deg, #0B1121 0%, #040814 100%)' 
    : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)';

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'all 0.5s ease', display: 'flex', flexDirection: 'column' }}>
      <ModernNavbar />
      <div style={{ paddingTop: '85px', flex: 1 }}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}

// ── Global Layout Wrapper ──────────────────────────────────
function MainLayout() {
  const { isLoggedIn, isPassenger, isAdmin } = useAuth();
  const showPassengerNav = isLoggedIn && (isPassenger || isAdmin);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {showPassengerNav ? <PassengerNavbar /> : <PublicNavbar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ChatWidget />
      <Routes>
        {/* Immersive Auth Pages (No Global Header/Footer) */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public routes wrapped with Header and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/"         element={<HomePage />} />
          <Route path="/about"    element={<AboutPage />} />
        </Route>

        {/* Immersive Passenger Portal with Modern Navbar */}
        <Route element={<PassengerPortalLayout />}>
          <Route path="/feed"      element={<PassengerRoute><PassengerFeed /></PassengerRoute>} />
          <Route path="/dashboard" element={<PassengerRoute><PassengerDashboard /></PassengerRoute>} />
          <Route path="/profile"   element={<PassengerRoute><PassengerProfile /></PassengerRoute>} />
          <Route path="/messages"     element={<PassengerRoute><PassengerMessenger /></PassengerRoute>} />
          <Route path="/suggestions"  element={<PassengerRoute><SuggestionsPage /></PassengerRoute>} />
        </Route>

        {/* Admin portal (No Global Header/Footer) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                  element={<DashboardPage />} />
          <Route path="passengers"      element={<PassengersPage />} />
          <Route path="passengers/:id"  element={<PassengerDetailPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="analytics"       element={<AnalyticsPage />} />
          <Route path="users"           element={<UsersPage />} />
          <Route path="roles"           element={<RolesPage />} />
          <Route path="settings"        element={<SettingsPage />} />
        </Route>

        <Route path="*"  element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

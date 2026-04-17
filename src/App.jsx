// Trigger redeployment to sync stable state
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home, CheckSquare, Settings as SettingsIcon, LogOut, Bell, Menu, X, Sparkles, Share2, ChevronRight, Compass } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function MainLayout({ children }) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const displayName = user?.name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="container">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <span className="logo-mark" aria-hidden="true">🎁</span>
            <span className="logo-wordmark">WishNest</span>
          </Link>

          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <a href="#ai-assistant" className="nav-link" onClick={closeMobileMenu}>AI Assistant</a>
                <Link to="/discover" className="nav-link" onClick={closeMobileMenu}>Discover</Link>
                <a href="#features" className="nav-link" onClick={closeMobileMenu}>Features</a>
            <div className="nav-actions-mobile">
              {user ? (
                <>
                  <div className="nav-user-pill" style={{ marginBottom: '1rem', width: '100%', justifyContent: 'center' }}>
                    <div className="nav-user-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={displayName} />
                      ) : (
                        <div className="nav-user-avatar-placeholder" aria-hidden="true">{initials}</div>
                      )}
                    </div>
                    <span>{displayName}</span>
                  </div>
                  <Link to="/dashboard" className="btn btn-primary w-full" onClick={closeMobileMenu}>Go to Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary w-full" style={{ marginBottom: '1rem' }} onClick={closeMobileMenu}>Login</Link>
                  <Link to="/signup" className="btn btn-primary w-full" onClick={closeMobileMenu}>Sign Up</Link>
                </>
              )}
            </div>
          </nav>

          <div className="nav-actions">
            {user ? (
              <div className="flex-center gap-4">
                <button className="nav-user-pill" onClick={() => navigate('/settings')}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={displayName} />
                    ) : (
                      <div className="nav-user-avatar-placeholder" aria-hidden="true">{initials}</div>
                    )}
                  <span className="nav-user-name">{displayName}</span>
                </button>
                <Link to="/dashboard" className="btn btn-primary header-dashboard-btn">Dashboard</Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-text">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer style={{ backgroundColor: '#0F172A', color: 'white', padding: '4rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="logo" style={{ color: 'white', marginBottom: '1.25rem' }}>
              <span className="logo-mark" aria-hidden="true">🎁</span>
              <span className="logo-wordmark">WishNest</span>
            </div>
            <p style={{ color: '#94A3B8', maxWidth: '300px', fontSize: '0.95rem' }}>
              Create and Share Your Wishlist in Seconds. Never receive duplicate gifts again. Build your premium registry today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="/#features" style={{ color: '#94A3B8', transition: 'var(--transition)' }}>Features</a>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/about" style={{ color: '#94A3B8', transition: 'var(--transition)' }}>About</Link>
                <Link to="/contact" style={{ color: '#94A3B8', transition: 'var(--transition)' }}>Contact</Link>
                <Link to="/privacy-policy" style={{ color: '#94A3B8', transition: 'var(--transition)' }}>Privacy Policy</Link>
                <Link to="/terms" style={{ color: '#94A3B8', transition: 'var(--transition)' }}>Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const displayName = user?.name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
  const email = user?.email || 'hello@wishnest.app';

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header flex-between">
          <Link to="/" className="logo" onClick={closeSidebar}>
            <span className="logo-mark" aria-hidden="true">🎁</span>
            <span className="logo-wordmark">WishNest</span>
          </Link>
          <button className="mobile-close-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`} onClick={closeSidebar}>
            <Home size={22} /> Dashboard
          </Link>
          <Link to="/wishlists" className={`sidebar-link ${path === '/wishlists' ? 'active' : ''}`} onClick={closeSidebar}>
            <CheckSquare size={22} /> My Wishlists
          </Link>
          <Link to="/shared" className={`sidebar-link ${path === '/shared' ? 'active' : ''}`} onClick={closeSidebar}>
            <Share2 size={22} /> Shared With Me
          </Link>
          <Link to="/notifications" className={`sidebar-link ${path === '/notifications' ? 'active' : ''}`} onClick={closeSidebar}>
            <Bell size={22} /> Notifications
          </Link>
          <Link to="/ai-assistant" className={`sidebar-link ${path === '/ai-assistant' ? 'active' : ''}`} onClick={closeSidebar}>
            <Sparkles size={22} /> AI Assistant
          </Link>
          <Link to="/discover" className={`sidebar-link ${path === '/discover' ? 'active' : ''}`} onClick={closeSidebar}>
            <Compass size={22} /> Discover Gifts
          </Link>
          <Link to="/settings" className={`sidebar-link ${path === '/settings' ? 'active' : ''}`} onClick={closeSidebar}>
            <SettingsIcon size={22} /> Settings
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} />
              ) : (
                <div className="sidebar-user-avatar-placeholder" aria-hidden="true">{initials}</div>
              )}
            </div>
            <div className="sidebar-user-copy">
              <strong>{displayName}</strong>
              <span>{email}</span>
            </div>
          </div>
          <button
            className="sidebar-link"
            style={{ width: '100%' }}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut size={22} /> Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="flex-center gap-3" style={{ flex: 1, minWidth: 0 }}>
            <button className="mobile-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
            <SearchBar />
          </div>
          <div className="topbar-actions">
            <button className="btn btn-text" onClick={() => navigate('/notifications')}>
              <Bell size={22} />
            </button>
            <button className="user-chip" onClick={() => navigate('/settings')} title="Open settings">
              <div className="avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} />
                ) : (
                  <div className="user-chip-avatar-placeholder" aria-hidden="true">{initials}</div>
                )}
              </div>
              <div className="user-chip-copy">
                <span className="user-chip-name">{displayName}</span>
              </div>
              <ChevronRight size={16} className="user-chip-arrow" />
            </button>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Pages Placeholders
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import WishlistPage from './pages/WishlistPage';
import SharedWithMe from './pages/SharedWithMe';
import PublicWishlist from './pages/PublicWishlist';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AuthCallback from './pages/AuthCallback';
import DiscoverPage from './pages/DiscoverPage';
import WishNestDashboardMockup from './components/WishNestDashboardMockup';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: '1.5px solid #F0EDE8',
            borderRadius: '18px',
            background: '#FFFFFF',
            color: '#1C1917',
            boxShadow: '0 16px 40px rgba(249,115,22,0.12)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#F97316',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><AuthPage type="login" /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><AuthPage type="signup" /></MainLayout>} />
        <Route path="/wishnest-preview" element={<WishNestDashboardMockup />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/wishlists" element={<ProtectedRoute><DashboardLayout><WishlistPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/shared" element={<ProtectedRoute><DashboardLayout><SharedWithMe /></DashboardLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><DashboardLayout><AIAssistantPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

        {/* Public — no login required */}
        <Route path="/discover" element={user ? <DashboardLayout><DiscoverPage /></DashboardLayout> : <MainLayout><DiscoverPage /></MainLayout>} />
        <Route path="/wishlist/:id" element={<PublicWishlist />} />
        <Route path="/w/:wishlistId" element={<PublicWishlist />} />

        {/* Legal and About Pages */}
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
        <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

        {/* Google OAuth callback landing — stores token then redirects */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

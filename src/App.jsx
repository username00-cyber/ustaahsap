import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, LogOut, Users, Store, ShoppingCart, Trophy, Menu, X, Crown, Shield } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import Home from './views/Home';
import MasterPanel from './views/MasterPanel';
import CustomerPanel from './views/CustomerPanel';
import JobDetail from './views/JobDetail';
import Profile from './views/Profile';
import AuthModal from './components/AuthModal';
import Shops from './views/Shops';
import Community from './views/Community';

import MasterProfile from './views/MasterProfile';
import Leaderboard from './views/Leaderboard';
import ShopProfile from './views/ShopProfile';
import Cart from './views/Cart';
import ShopPanel from './views/ShopPanel';
import AdminPanel from './views/AdminPanel';
import VipSubscription from './views/VipSubscription';

function App() {
  const { currentUser, logout, cart, authLoading } = useAppContext();
  const navigate = useNavigate();
  const [authType, setAuthType] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  const isAdmin = currentUser && (
    ['ahmetusta', 'admin', 'superadmin'].includes(currentUser.username) ||
    ['ahmetusta', 'admin', 'superadmin'].includes(currentUser.name?.toLowerCase().replace(/\s/g, '')) ||
    currentUser.email?.includes('admin') ||
    currentUser.email?.includes('ahmetusta') ||
    currentUser.role === 'admin'
  );

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenu(false);
  };

  const navLink = (to, icon, label) => (
    <Link 
      to={to} 
      className="nav-item" 
      onClick={() => setMobileMenu(false)}
    >
      {icon} <span>{label}</span>
    </Link>
  );

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-top-row">
            <Link to="/" className="logo" onClick={() => setMobileMenu(false)}>
              <span className="logo-icon">🪵</span> <span className="logo-text">UstaAhşap</span>
            </Link>
            
            <div className="navbar-actions-mobile">
              {currentUser && cart && cart.length > 0 && (
                <Link to="/cart" className="cart-badge-mobile" onClick={() => setMobileMenu(false)}>
                  <ShoppingCart size={20} /> 
                  <span className="cart-count">{cart.length}</span>
                </Link>
              )}
              <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            <div className={`nav-links ${mobileMenu ? 'nav-links--open' : ''}`}>
              {/* Ortak Linkler */}
              <div className="mobile-nav-scroll">
                {navLink('/shops', <Store size={16} />, 'Mağazalar')}
                {navLink('/community', <Users size={16} />, 'Topluluk')}
                {navLink('/leaderboard', <Trophy size={16} />, 'Liderlik')}

              </div>

              {currentUser ? (
                <div className="nav-auth">
                  {currentUser.role === 'musteri' && (
                    <Link to="/customer" className="btn btn-ghost" onClick={() => setMobileMenu(false)}>
                      <Briefcase size={16} /> İşlerim
                    </Link>
                  )}
                  {currentUser.role === 'usta' && (
                    <Link to="/master" className="btn btn-ghost" onClick={() => setMobileMenu(false)}>
                      <Briefcase size={16} /> İlan Havuzu
                    </Link>
                  )}
                  {currentUser.role === 'dukkan' && (
                    <Link to="/shop-panel" className="btn btn-ghost" onClick={() => setMobileMenu(false)}>
                      <Store size={16} /> Dükkan Paneli
                    </Link>
                  )}

                  {!currentUser.isVip && currentUser.role !== 'dukkan' && (
                    <Link to="/vip" className="btn btn-ghost" style={{ color: 'var(--warning)' }} onClick={() => setMobileMenu(false)}>
                      <Crown size={16} /> VIP Ol
                    </Link>
                  )}

                  {isAdmin && (
                    <Link to="/admin" className="btn btn-ghost" style={{ color: 'var(--primary-color)' }} onClick={() => setMobileMenu(false)}>
                      <Shield size={16} /> Admin Paneli
                    </Link>
                  )}

                  {cart && cart.length > 0 && (
                    <Link to="/cart" className="btn btn-ghost cart-btn-desktop" onClick={() => setMobileMenu(false)}>
                      <ShoppingCart size={16} /> 
                      <span className="cart-count">{cart.length}</span>
                    </Link>
                  )}
                  
                  <Link to="/profile" className="btn btn-secondary" onClick={() => setMobileMenu(false)}>
                    <User size={14} /> {currentUser.name.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-danger">
                    <LogOut size={14} /> Çıkış
                  </button>
                </div>
              ) : (
                <div className="nav-auth">
                  <button onClick={() => { setAuthType('login'); setMobileMenu(false); }} className="btn btn-ghost">Giriş</button>
                  <button onClick={() => { setAuthType('register'); setMobileMenu(false); }} className="btn btn-primary btn-glow">Kayıt Ol</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home onLoginClick={() => setAuthType('login')} />} />
          <Route path="/master" element={<MasterPanel />} />
          <Route path="/customer" element={<CustomerPanel />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/dukkan/:id" element={<ShopProfile />} />
          <Route path="/community" element={<Community />} />

          <Route path="/usta/:id" element={<MasterProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shop-panel" element={<ShopPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/vip" element={<VipSubscription />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">🪵</span> <span className="logo-text">UstaAhşap</span>
              <p className="footer-tagline">Türkiye'nin ahşap işçiliği platformu.</p>
            </div>
            <div className="footer-links">
              <Link to="/shops">Mağazalar</Link>
              <Link to="/community">Topluluk</Link>
              <Link to="/leaderboard">Liderlik Tablosu</Link>
            </div>
            <div className="footer-copy">
              © 2025 UstaAhşap — Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>

      {authType && (
        <AuthModal type={authType} onClose={() => setAuthType(null)} onSwitch={(type) => setAuthType(type)} />
      )}
    </div>
  );
}

export default App;

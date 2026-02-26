import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, User, Search, Menu, X, LogOut, Shield, Package, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only update if they are true to prevent cascading renders when switching routes
    if (menuOpen) setTimeout(() => setMenuOpen(false), 0);
    if (userMenuOpen) setTimeout(() => setUserMenuOpen(false), 0);
  }, [location.pathname, menuOpen, userMenuOpen]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">ONESTOPSHOP</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/catalog" className={location.pathname === '/catalog' ? 'active' : ''}>Shop</Link>
          {isAdmin && (
            <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <button className="btn-icon nav-action-btn theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/catalog" className="btn-icon nav-action-btn">
            <Search size={20} />
          </Link>

          <button className="btn-icon nav-action-btn cart-btn" onClick={() => setIsOpen(true)}>
            <ShoppingBag size={20} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="user-menu-wrapper">
              <button className="btn-icon nav-action-btn user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <User size={20} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="user-dropdown glass-strong"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="user-dropdown-header">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-dropdown-divider" />
                    <Link to="/profile" className="user-dropdown-item">
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="user-dropdown-item">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item logout" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-login-btn">
              Sign In
            </Link>
          )}

          <button className="btn-icon nav-action-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

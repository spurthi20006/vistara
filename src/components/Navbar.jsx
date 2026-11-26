import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import { SiteSearch } from './SiteSearch';
import './Navbar.css';

const PUBLIC_NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/alumni', label: 'Alumni' },
  { to: '/students', label: 'Students' },
  { to: '/communities', label: 'Communities' },
  { to: '/projects', label: 'Projects' },
  { to: '/questions', label: 'Q&A' },
  { to: '/hackathons', label: 'Hackathons' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScrollPosition();
  const { currentUser, logout } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useFocusTrap(mobilePanelRef, mobileOpen, closeMobileMenu);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const roleNavItems = currentUser
    ? [...PUBLIC_NAV_ITEMS, { to: '/profile', label: 'My Profile' }]
    : [...PUBLIC_NAV_ITEMS, { to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }];

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'You are now browsing as a guest.',
    });
    navigate('/');
  };

  return (
    <header className={`site-header ${scrollY > 10 ? 'is-scrolled' : ''}`}>
      <div className="container navbar-top-row">
        <Link to="/" className="navbar-brand" aria-label="University Connect home">
          <span className="brand-mark" aria-hidden="true">
            UC
          </span>
          <span className="brand-text">University Connect</span>
        </Link>

        <div className="navbar-desktop-search">
          <SiteSearch />
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {currentUser && (
            <button
              type="button"
              className="btn btn-outline btn-sm desktop-logout-btn"
              onClick={handleLogout}
            >
              Sign out ({currentUser.roleLabel.split(' ')[0]})
            </button>
          )}

          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="container navbar-mobile-search">
        <SiteSearch />
      </div>

      <nav className="navbar-desktop-nav" aria-label="Main navigation">
        <div className="container navbar-nav-list">
          {roleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="mobile-menu-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMobileMenu();
            }
          }}
        >
          <div
            ref={mobilePanelRef}
            className="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            tabIndex={-1}
          >
            <div className="mobile-menu-header">
              <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
                <span className="brand-mark" aria-hidden="true">
                  UC
                </span>
                <span className="brand-text">University Connect</span>
              </Link>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
              >
                &times;
              </button>
            </div>

            {currentUser && (
              <div className="mobile-user-banner">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.roleLabel}</span>
              </div>
            )}

            <nav aria-label="Mobile navigation links" className="mobile-nav-links">
              {roleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mobile-menu-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleTheme}
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
              {currentUser && (
                <button type="button" className="btn btn-outline" onClick={handleLogout}>
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

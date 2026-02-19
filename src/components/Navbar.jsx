import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icons from './Icons';
import VerifiedBadge from './VerifiedBadge';
import useTheme from '../hooks/useTheme';
import { localStore } from '../lib/store';

export default function Navbar({ isAdmin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [logoUrl] = useState(() => localStore.getLogoUrl());

  const links = [
    { to: '/', label: 'Home' },
    { to: '/beats', label: 'Catalog' },
    { to: '/licensing', label: 'Licensing' },
    { to: '/custom', label: 'Custom Production' },
    { to: '/contact', label: 'Contact' },
  ];
  if (isAdmin) links.push({ to: '/admin', label: 'Dashboard' });

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--bg-secondary)',
      boxShadow: '0 1px 0 var(--border)',
    }} role="navigation" aria-label="Main navigation">
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <Link
          to="/"
          style={{
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
            letterSpacing: 2, color: 'var(--accent)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="AJKEYZZZ" style={{ height: 48, objectFit: 'contain' }} />
          ) : (
            <>AJKEYZZZ <VerifiedBadge size={14} /></>
          )}
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                background: 'none', border: 'none', textDecoration: 'none',
                color: isActive(l.to) ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontFamily: 'var(--font)',
                fontWeight: isActive(l.to) ? 600 : 400,
                letterSpacing: 0.5, textTransform: 'uppercase',
                position: 'relative',
              }}
            >
              {l.label}
              {isActive(l.to) && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute', bottom: -4, left: 0, right: 0,
                    height: 2, background: 'var(--accent)', borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="icon-spin"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', padding: 4,
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
              </motion.div>
            </AnimatePresence>
          </button>

          {isAdmin && (
            <button
              onClick={onLogout}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', padding: 4,
              }}
              title="Logout"
              aria-label="Logout"
            >
              <Icons.Logout />
            </button>
          )}
          <div style={{ display: 'flex', gap: 12, marginLeft: 16 }}>
            <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }} aria-label="Instagram">
              <Icons.Instagram />
            </a>
            <a href="https://youtube.com/@ajkeyzzz1927" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }} aria-label="YouTube">
              <Icons.YouTube />
            </a>
            <a href="https://x.com/ajkeyzzz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }} aria-label="X / Twitter">
              <Icons.Twitter />
            </a>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'none', padding: 4,
            }}
            className="mobile-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-primary)',
              cursor: 'pointer', display: 'none', padding: 4,
            }}
            className="mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden',
              background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ padding: '16px 24px' }}>
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '12px 0',
                    color: isActive(l.to) ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 15, fontFamily: 'var(--font)', fontWeight: 500,
                    borderBottom: '1px solid var(--border)', textDecoration: 'none',
                  }}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '12px 0',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    fontSize: 15, fontFamily: 'var(--font)', cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

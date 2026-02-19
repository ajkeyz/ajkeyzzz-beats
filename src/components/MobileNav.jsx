import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/beats', label: 'Beats', icon: 'beats' },
  { path: '/licensing', label: 'License', icon: 'license' },
  { path: '/contact', label: 'Contact', icon: 'contact' },
];

function TabIcon({ type, active }) {
  const color = active ? 'var(--accent)' : 'var(--text-muted)';
  const size = 22;
  const sw = active ? '2.5' : '1.8';
  switch (type) {
    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'beats':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'license':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'contact':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MobileNav({ hasPlayer }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        display: 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 8px 4px', maxWidth: 400, margin: '0 auto',
      }}>
        {tabs.map((tab) => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '8px 16px', position: 'relative', minWidth: 56,
                transition: 'transform var(--duration-fast)',
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1 : 0.92, y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <TabIcon type={tab.icon} active={isActive} />
              </motion.div>
              <span style={{
                fontSize: 11, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color var(--duration-normal)',
              }}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  style={{
                    position: 'absolute', top: -1, left: '20%', right: '20%',
                    height: 3, borderRadius: 1.5,
                    background: 'var(--accent)',
                    boxShadow: 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

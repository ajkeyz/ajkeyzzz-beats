import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('ajk-cookies-accepted');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('ajk-cookies-accepted', 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="cookie-banner"
        >
          <div style={{
            maxWidth: 1280, margin: '0 auto', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
              This site uses cookies and localStorage to improve your experience, remember preferences, and provide analytics.
            </p>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={accept}
                className="btn-press"
                style={{
                  padding: '8px 24px', borderRadius: 50, background: 'var(--accent)',
                  border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Accept
              </button>
              <button
                onClick={accept}
                style={{
                  padding: '8px 16px', borderRadius: 50, background: 'transparent',
                  border: '1px solid var(--border)', color: 'var(--text-muted)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

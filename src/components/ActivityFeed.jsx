import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITIES = [
  { city: 'Lagos', beat: 'Midnight Cruise', action: 'licensed' },
  { city: 'London', beat: 'Golden Hour', action: 'licensed' },
  { city: 'Atlanta', beat: 'Jollof', action: 'downloaded' },
  { city: 'Toronto', beat: 'Hearts', action: 'licensed' },
  { city: 'Accra', beat: 'Palmwine', action: 'licensed' },
  { city: 'New York', beat: 'Lagos Nights', action: 'downloaded' },
  { city: 'Nairobi', beat: 'Balance', action: 'licensed' },
  { city: 'Los Angeles', beat: 'Away', action: 'licensed' },
];

export default function ActivityFeed() {
  const [current, setCurrent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const showNext = useCallback(() => {
    const idx = Math.floor(Math.random() * ACTIVITIES.length);
    setCurrent(ACTIVITIES[idx]);
    setTimeout(() => setCurrent(null), 4000);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const initial = setTimeout(showNext, 8000);
    const interval = setInterval(showNext, 25000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [showNext, dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed', bottom: 100, left: 20, zIndex: 900,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: 'var(--shadow-lg)', maxWidth: 320, cursor: 'default',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent)15', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 16,
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
              Someone in <strong>{current.city}</strong> just {current.action}{' '}
              <strong>&ldquo;{current.beat}&rdquo;</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Just now
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, flexShrink: 0, fontSize: 14,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

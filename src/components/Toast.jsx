import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((message) => toast({ message, type: 'success' }), [toast]);
  const error = useCallback((message) => toast({ message, type: 'error', duration: 6000 }), [toast]);
  const info = useCallback((message) => toast({ message, type: 'info' }), [toast]);
  const warning = useCallback((message) => toast({ message, type: 'warning', duration: 5000 }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 120, right: 24, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const typeConfig = {
  success: { bg: '#00B894', icon: '\u2713' },
  error: { bg: '#D63031', icon: '\u2717' },
  warning: { bg: '#FDCB6E', icon: '!', color: '#000' },
  info: { bg: '#0984E3', icon: 'i' },
};

function ToastItem({ toast, onDismiss }) {
  const cfg = typeConfig[toast.type] || typeConfig.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(20,20,22,0.95)', backdropFilter: 'blur(12px)',
        borderRadius: 12, padding: '12px 18px',
        border: `1px solid ${cfg.bg}33`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.bg}22`,
        minWidth: 280, maxWidth: 400, pointerEvents: 'auto', cursor: 'pointer',
        fontFamily: 'var(--font)',
      }}
      onClick={onDismiss}
    >
      <div style={{
        width: 24, height: 24, borderRadius: '50%', background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: cfg.color || '#fff', flexShrink: 0,
      }}>
        {cfg.icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {toast.message}
      </span>
    </motion.div>
  );
}

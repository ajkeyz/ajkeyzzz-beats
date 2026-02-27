import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icons from './Icons';
import { cart } from '../lib/cart';
import { formatPrice } from '../lib/utils';

export default function CartDrawer({ isOpen, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen) setItems(cart.getItems());
  }, [isOpen]);

  const removeItem = (beatId) => {
    const updated = cart.removeItem(beatId);
    setItems(updated);
  };

  const clearAll = () => {
    cart.clear();
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 1998, backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '90vw',
              zIndex: 1999, background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 48px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icons.Cart />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Cart</h3>
                {items.length > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#000', fontSize: 11,
                    fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  }}>
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex',
                }}
              >
                <Icons.Close />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--bg-tertiary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: 28,
                  }}>
                    <Icons.Cart />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    Your cart is empty
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Browse beats and add licenses to get started
                  </p>
                  <Link
                    to="/beats"
                    onClick={onClose}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px' }}
                  >
                    Browse Beats
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map((item) => (
                    <div
                      key={item.beatId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 16, background: 'var(--bg-card)',
                        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                        background: `linear-gradient(135deg, ${item.coverColor || '#FFD800'}33, ${item.coverColor || '#FFD800'}11)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      }}>
                        {item.coverEmoji || '🎵'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.beatTitle}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {item.tierName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {formatPrice(item.price)}
                        </div>
                        <button
                          onClick={() => removeItem(item.beatId)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', fontSize: 11, padding: '2px 0',
                            fontFamily: 'var(--font)',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{
                padding: '20px 24px', borderTop: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{formatPrice(total)}</span>
                </div>
                <button
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 50,
                    background: 'var(--accent)', border: 'none', color: '#000',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font)', marginBottom: 8,
                  }}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 50,
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font)',
                  }}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

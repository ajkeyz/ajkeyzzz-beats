import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icons from './Icons';
import { localStore } from '../lib/store';

export default function Footer() {
  const [logoUrl] = useState(() => localStore.getLogoUrl());
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // Store locally (would be sent to backend in production)
    const subs = JSON.parse(localStorage.getItem('ajkeyzzz-subscribers') || '[]');
    if (!subs.includes(email)) {
      subs.push(email);
      localStorage.setItem('ajkeyzzz-subscribers', JSON.stringify(subs));
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border)', padding: '56px 24px 0',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 40,
        marginBottom: 48,
      }}>
        {/* Column 1: Brand */}
        <div>
          <Link to="/" style={{
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
            letterSpacing: 2, color: 'var(--accent)', textDecoration: 'none',
            display: 'block', marginBottom: 10,
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt="AJKEYZZZ" style={{ height: 56, objectFit: 'contain' }} />
            ) : (
              'AJKEYZZZ'
            )}
          </Link>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Premium Afrobeats, Alt&eacute; &amp; Afro Swing production. From Lagos to Cali.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
              aria-label="Instagram"
            >
              <Icons.Instagram />
            </a>
            <a href="https://youtube.com/@ajkeyzzz1927" target="_blank" rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
              aria-label="YouTube"
            >
              <Icons.YouTube />
            </a>
            <a href="https://x.com/ajkeyzzz" target="_blank" rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
              aria-label="X / Twitter"
            >
              <Icons.Twitter />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 16,
          }}>
            Beats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Browse Catalog', to: '/beats' },
              { label: 'Trending', to: '/beats?sort=popular' },
              { label: 'New Releases', to: '/beats?sort=newest' },
              { label: 'Licensing', to: '/licensing' },
              { label: 'Custom Production', to: '/custom' },
            ].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
                transition: 'color 0.2s',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Support */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 16,
          }}>
            Support
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
              Contact Us
            </Link>
            <Link to="/licensing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
              License Agreement
            </Link>
            <Link to="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
              Terms of Service
            </Link>
            <Link to="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 16,
          }}>
            Stay Updated
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Get notified when new beats drop. No spam.
          </p>
          {subscribed ? (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius)',
              background: 'var(--accent-green)15', border: '1px solid var(--accent-green)33',
              fontSize: 13, color: 'var(--accent-green)', fontWeight: 500,
            }}>
              You&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)',
                  outline: 'none', minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 18px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent)', border: 'none', color: '#000',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font)', flexShrink: 0,
                }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Payment badges */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '20px 0', borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {['Visa', 'Mastercard', 'Amex', 'Stripe'].map((name) => (
          <span
            key={name}
            style={{
              padding: '4px 12px', borderRadius: 4, border: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)',
              fontWeight: 600, letterSpacing: 0.5,
            }}
          >
            {name}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
          Secure payments
        </span>
      </div>

      {/* Bottom bar */}
      <div style={{
        paddingTop: 20, paddingBottom: 24, borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} AJKEYZZZ. All rights reserved.
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Made with love in Lagos
        </span>
      </div>
    </footer>
  );
}

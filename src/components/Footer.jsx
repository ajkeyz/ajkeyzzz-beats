import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icons from './Icons';
import { localStore } from '../lib/store';

export default function Footer() {
  const [logoUrl] = useState(() => localStore.getLogoUrl());
  return (
    <footer style={{
      borderTop: '1px solid var(--border)', padding: '48px 24px 0',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 32,
        marginBottom: 40,
      }}>
        {/* Column 1: Logo + tagline + social */}
        <div>
          <Link to="/" style={{
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
            letterSpacing: 2, color: 'var(--accent)', textDecoration: 'none',
            display: 'block', marginBottom: 8,
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt="AJKEYZZZ" style={{ height: 56, objectFit: 'contain' }} />
            ) : (
              'AJKEYZZZ'
            )}
          </Link>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            From Lagos to Cali — beats that move the world
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Instagram">
              <Icons.Instagram />
            </a>
            <a href="https://youtube.com/@ajkeyzzz1927" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="YouTube">
              <Icons.YouTube />
            </a>
            <a href="https://x.com/ajkeyzzz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="X / Twitter">
              <Icons.Twitter />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <div style={{
            fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 16,
          }}>
            Quick Links
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Home', to: '/' },
              { label: 'Beats', to: '/beats' },
              { label: 'Licensing', to: '/licensing' },
              { label: 'Custom', to: '/custom' },
              { label: 'Contact', to: '/contact' },
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

        {/* Column 3: Legal */}
        <div>
          <div style={{
            fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 16,
          }}>
            Legal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="#" style={{
              color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}>
              Terms of Service
            </Link>
            <Link to="#" style={{
              color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}>
              Privacy Policy
            </Link>
            <Link to="/licensing" style={{
              color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
              transition: 'color 0.2s',
            }}>
              License Agreement
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        paddingTop: 24, paddingBottom: 24, borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} AJKEYZZZ. All rights reserved.
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Made with 🎵 in Lagos
        </span>
      </div>
    </footer>
  );
}

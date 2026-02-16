import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import Icons from '../../components/Icons';

export default function AdminLayout({ isAdmin, login, children }) {
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const location = useLocation();

  if (!isAdmin) {
    return (
      <div style={{
        paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 48,
          border: '1px solid var(--border)', width: '100%', maxWidth: 400, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Admin Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            Enter your credentials to access the dashboard
          </p>
          {loginError && (
            <div style={{ color: '#D63031', fontSize: 13, marginBottom: 12 }}>{loginError}</div>
          )}
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
            style={{
              width: '100%', padding: '14px 18px', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)',
              outline: 'none', marginBottom: 12,
            }}
          />
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setLoginError(''); }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                setLoggingIn(true);
                const { error } = await login(email, pass);
                if (error) setLoginError(error);
                setLoggingIn(false);
              }
            }}
            style={{
              width: '100%', padding: '14px 18px', background: 'var(--bg-tertiary)',
              border: loginError ? '1px solid #D63031' : '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: 14, fontFamily: 'var(--font)', outline: 'none', marginBottom: 16,
            }}
          />
          <button
            onClick={async () => {
              setLoggingIn(true);
              const { error } = await login(email, pass);
              if (error) setLoginError(error);
              setLoggingIn(false);
            }}
            disabled={loggingIn}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 50, background: 'var(--accent)',
              border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: loggingIn ? 'wait' : 'pointer', fontFamily: 'var(--font)',
              opacity: loggingIn ? 0.7 : 1,
            }}
          >
            {loggingIn ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 12 }}>
            Set VITE_ADMIN_PASSWORD in your .env for local mode access.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { path: '/admin', label: 'Overview', exact: true },
    { path: '/admin/beats', label: 'Beats' },
    { path: '/admin/collections', label: 'Collections' },
    { path: '/admin/inquiries', label: 'Inquiries' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/messages', label: 'Messages' },
  ];

  const isActiveTab = (tab) => {
    if (tab.exact) return location.pathname === tab.path;
    return location.pathname.startsWith(tab.path);
  };

  return (
    <div style={{ paddingTop: 80, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your beats, orders, and inquiries</p>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 32, background: 'var(--bg-card)',
        borderRadius: 50, padding: 4, width: 'fit-content', flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 500,
              fontFamily: 'var(--font)', textDecoration: 'none',
              background: isActiveTab(tab) ? 'var(--accent)' : 'transparent',
              color: isActiveTab(tab) ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchBeats, fetchMessages, fetchInquiries, fetchOrders } from '../../lib/data';

// Simple bar chart component (no external library needed)
function BarChart({ data, label, color = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 24,
      border: '1px solid var(--border)',
    }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>{label}</h4>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              style={{
                width: '100%', maxWidth: 40, borderRadius: '4px 4px 0 0',
                background: `linear-gradient(to top, ${color}88, ${color})`,
                minHeight: d.value > 0 ? 4 : 0,
              }}
              title={`${d.label}: ${d.value}`}
            />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [beats, setBeats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    Promise.all([
      fetchBeats({ published: false }),
      fetchMessages(),
      fetchInquiries(),
      fetchOrders(),
    ]).then(([b, m, i, o]) => {
      setBeats(b);
      setMessages(m);
      setInquiries(i);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const filterByDate = useCallback((items) => {
    if (dateRange === 'all') return items;
    const days = { '7d': 7, '30d': 30, '90d': 90 }[dateRange];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return items.filter(item => new Date(item.created_at) >= cutoff);
  }, [dateRange]);

  const filteredOrders = useMemo(() => filterByDate(orders), [orders, filterByDate]);
  const filteredInquiries = useMemo(() => filterByDate(inquiries), [inquiries, filterByDate]);
  const filteredMessages = useMemo(() => filterByDate(messages), [messages, filterByDate]);

  const totalPlays = beats.reduce((a, b) => a + (b.plays || 0), 0);
  const unreadMsgs = filteredMessages.filter((m) => !m.read).length;
  const newInquiries = filteredInquiries.filter((i) => i.status === 'new').length;
  const totalRevenue = filteredOrders.reduce((a, o) => a + (o.amount || 0), 0);

  const stats = [
    { label: 'Total Beats', value: beats.length, color: 'var(--accent)', emoji: '🎵' },
    { label: 'Total Plays', value: totalPlays.toLocaleString(), color: 'var(--accent-blue)', emoji: '▶' },
    { label: 'Orders', value: filteredOrders.length, color: 'var(--accent-green)', emoji: '💰', sub: totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : null },
    { label: 'Inquiries', value: filteredInquiries.length, color: 'var(--accent-purple)', emoji: '📋', badge: newInquiries },
    { label: 'Messages', value: filteredMessages.length, color: '#FDCB6E', emoji: '✉', badge: unreadMsgs },
  ];

  // Genre distribution chart data
  const genreData = useMemo(() => {
    const counts = {};
    beats.forEach(b => { counts[b.genre] = (counts[b.genre] || 0) + 1; });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [beats]);

  // Plays per beat chart data (top 8)
  const playsData = useMemo(() => {
    return [...beats]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 8)
      .map(b => ({ label: b.title.slice(0, 8), value: b.plays || 0 }));
  }, [beats]);

  return (
    <div>
      {/* Date Range Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'All Time' },
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: '90d', label: 'Last 90 Days' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setDateRange(opt.value)} style={{
            padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font)',
            border: dateRange === opt.value ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: dateRange === opt.value ? 'var(--accent)15' : 'transparent',
            color: dateRange === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 24,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{stat.emoji}</span>
                {stat.badge > 0 && (
                  <span style={{
                    background: 'var(--accent)', padding: '2px 8px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>
                    {stat.badge} new
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
              {stat.sub && <div style={{ fontSize: 13, color: stat.color, marginTop: 4, fontWeight: 600 }}>{stat.sub}</div>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics charts */}
      {beats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <BarChart data={genreData} label="Beats by Genre" color="var(--accent-purple)" />
          <BarChart data={playsData} label="Top Beats by Plays" color="var(--accent)" />
        </div>
      )}

      {/* Top beats */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Top Performing Beats</h3>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 64, borderRadius: 0 }} />
            ))}
          </div>
        ) : beats.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            No beats yet. Add your first beat!
          </div>
        ) : (
          [...beats].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5).map((beat, i) => (
            <div key={beat.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--mono)', width: 24 }}>
                {i + 1}
              </span>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${beat.cover_color || '#E84393'}33, ${beat.cover_color || '#E84393'}11)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {beat.cover_emoji || '🎵'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{beat.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{beat.genre}</div>
              </div>
              {/* Mini bar showing relative plays */}
              <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((beat.plays || 0) / Math.max(totalPlays, 1)) * 100 * 5}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  style={{ height: '100%', borderRadius: 3, background: beat.cover_color || 'var(--accent)', maxWidth: '100%' }}
                />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--mono)', minWidth: 60, textAlign: 'right' }}>
                &#9654; {(beat.plays || 0).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"][style*="gap: 16px"][style*="margin-bottom: 40px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

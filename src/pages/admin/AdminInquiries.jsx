import { useEffect, useState } from 'react';
import { fetchInquiries, updateInquiry } from '../../lib/data';
import { formatDate } from '../../lib/utils';

const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'closed'];
const STATUS_COLORS = {
  new: 'var(--accent)',
  contacted: 'var(--accent-blue)',
  in_progress: '#FDCB6E',
  closed: 'var(--text-muted)',
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInquiries().then(data => {
      setInquiries(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateInquiry(id, { status });
    setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Type', 'Budget', 'Timeline', 'Platform', 'Vocals', 'Status', 'Message'];
    const rows = inquiries.map(i => [
      i.created_at ? new Date(i.created_at).toISOString().split('T')[0] : '',
      i.name || '', i.email || '', (i.inquiry_type || '').replace('_', ' '),
      i.budget || '', i.timeline || '', i.platform || '',
      i.vocals_needed ? 'Yes' : 'No', i.status || 'new',
      (i.message || '').replace(/\n/g, ' ').slice(0, 500),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>
          Custom Production Inquiries ({inquiries.length})
        </h3>
        {inquiries.length > 0 && (
          <button onClick={exportCSV} style={{
            padding: '6px 16px', borderRadius: 50, fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font)', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)',
          }}>
            Export CSV
          </button>
        )}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 50, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font)', textTransform: 'capitalize',
              border: filter === s ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: filter === s ? 'var(--accent)22' : 'transparent',
              color: filter === s ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {s === 'in_progress' ? 'In Progress' : s} ({s === 'all' ? inquiries.length : inquiries.filter(i => i.status === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 48,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>No inquiries yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((inq) => (
            <div key={inq.id} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 24,
              border: `1px solid ${inq.status === 'new' ? 'var(--accent)33' : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{inq.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{inq.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(inq.created_at)}</span>
                  <select
                    value={inq.status || 'new'}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: `${STATUS_COLORS[inq.status || 'new']}22`,
                      color: STATUS_COLORS[inq.status || 'new'],
                      border: `1px solid ${STATUS_COLORS[inq.status || 'new']}44`,
                      cursor: 'pointer', fontFamily: 'var(--font)', outline: 'none',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                {inq.inquiry_type && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Type:</strong> {inq.inquiry_type.replace('_', ' ')}
                  </div>
                )}
                {inq.budget && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Budget:</strong> {inq.budget}
                  </div>
                )}
                {inq.timeline && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Timeline:</strong> {inq.timeline}
                  </div>
                )}
                {inq.platform && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Platform:</strong> {inq.platform}
                  </div>
                )}
                {inq.vocals_needed && (
                  <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                    Vocals needed
                  </div>
                )}
              </div>

              {inq.reference_links && (
                <div style={{ fontSize: 13, color: 'var(--accent-blue)', marginBottom: 8, wordBreak: 'break-all' }}>
                  {inq.reference_links}
                </div>
              )}

              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {inq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { fetchOrders, updateOrder } from '../../lib/data';
import { formatDate, formatPrice } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import env from '../../lib/env';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    fetchOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((a, o) => a + (o.amount || 0), 0);

  const handleExtendExpiry = async (order) => {
    setActionLoading(order.id);
    try {
      const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      await updateOrder(order.id, { download_expires_at: newExpiry });
      setOrders(orders.map(o => o.id === order.id ? { ...o, download_expires_at: newExpiry } : o));
    } catch (err) {
      toastError('Failed to extend: ' + (err.message || 'Unknown error'));
    }
    setActionLoading(null);
  };

  const copyDownloadLink = (order) => {
    if (!order.download_token) return;
    const url = `${env.SITE_URL}/download/${order.download_token}`;
    navigator.clipboard.writeText(url).then(() => {
      toastSuccess('Download link copied!');
    }).catch(() => {
      toastError('Could not copy — check your browser permissions');
    });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Customer Name', 'Email', 'Beat', 'License', 'Amount', 'Download Token', 'Expires'];
    const rows = orders.map(o => [
      o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : '',
      o.customer_name || '',
      o.customer_email || '',
      o.beats?.title || o.beat_id || '',
      o.license_tier || '',
      o.amount || 0,
      o.download_token || '',
      o.download_expires_at ? new Date(o.download_expires_at).toISOString().split('T')[0] : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const isExpired = (order) => order.download_expires_at && new Date(order.download_expires_at) < new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>
          Orders ({orders.length})
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {totalRevenue > 0 && (
            <div style={{ fontSize: 14, color: 'var(--accent-green)', fontWeight: 600 }}>
              Total: {formatPrice(totalRevenue)}
            </div>
          )}
          {orders.length > 0 && (
            <button
              onClick={exportCSV}
              style={{
                padding: '6px 16px', borderRadius: 50, fontSize: 12, cursor: 'pointer',
                fontFamily: 'var(--font)', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)',
              }}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 64,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No orders yet</div>
          <div style={{ color: 'var(--text-muted)' }}>Orders will appear here when customers purchase licenses</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => (
            <div key={order.id} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 20,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{order.customer_name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer_email}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {order.beats?.title || order.beat_id}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {order.license_tier}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: 'var(--accent-green)' }}>
                  {formatPrice(order.amount)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle, var(--border))' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatDate(order.created_at)}
                  {order.download_expires_at && (
                    <span style={{ marginLeft: 12, color: isExpired(order) ? '#D63031' : 'var(--text-muted)' }}>
                      {isExpired(order) ? 'Expired' : `Expires ${formatDate(order.download_expires_at)}`}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.download_token && (
                    <button
                      onClick={() => copyDownloadLink(order)}
                      style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font)',
                      }}
                    >
                      Copy Link
                    </button>
                  )}
                  <button
                    onClick={() => handleExtendExpiry(order)}
                    disabled={actionLoading === order.id}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11,
                      background: 'transparent', border: '1px solid var(--accent-blue, #0984E3)44',
                      color: 'var(--accent-blue, #0984E3)', cursor: actionLoading === order.id ? 'wait' : 'pointer',
                      fontFamily: 'var(--font)', opacity: actionLoading === order.id ? 0.5 : 1,
                    }}
                  >
                    {actionLoading === order.id ? '...' : 'Extend 72h'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

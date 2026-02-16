import { useEffect, useState } from 'react';
import { fetchMessages, updateMessage, deleteMessage as deleteMessageApi } from '../../lib/data';
import { formatDate } from '../../lib/utils';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages().then(data => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  const handleMarkRead = async (id) => {
    await updateMessage(id, { read: true });
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    await deleteMessageApi(id);
    setMessages(messages.filter(m => m.id !== id));
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Messages {unreadCount > 0 && <span style={{ color: 'var(--accent)', fontSize: 14 }}>({unreadCount} unread)</span>}
      </h3>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : messages.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 48,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>No messages yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 20,
              border: msg.read ? '1px solid var(--border)' : '1px solid var(--accent)44',
              position: 'relative',
            }}>
              {!msg.read && (
                <div style={{
                  position: 'absolute', top: 16, right: 16, width: 8, height: 8,
                  borderRadius: '50%', background: 'var(--accent)',
                }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{msg.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>{msg.email}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatDate(msg.created_at || msg.date)}
                </span>
              </div>
              {msg.subject && (
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{msg.subject}</div>
              )}
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {msg.message}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!msg.read && (
                  <button onClick={() => handleMarkRead(msg.id)} style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 20,
                    padding: '5px 14px', fontSize: 12, color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>
                    Mark Read
                  </button>
                )}
                <button onClick={() => handleDelete(msg.id)} style={{
                  background: 'none', border: '1px solid #D6303133', borderRadius: 20,
                  padding: '5px 14px', fontSize: 12, color: '#D63031',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

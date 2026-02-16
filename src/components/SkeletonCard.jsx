export function SkeletonCard({ delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
      border: '1px solid var(--border)',
      animation: `fadeIn 0.4s var(--ease-out) ${delay}s both`,
    }}>
      <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 0 }} />
      <div style={{ padding: '16px 18px' }}>
        <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <div className="skeleton" style={{ height: 22, width: 55, borderRadius: 'var(--radius-pill)' }} />
          <div className="skeleton" style={{ height: 22, width: 45, borderRadius: 'var(--radius-pill)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 12, width: 40 }} />
          <div className="skeleton" style={{ height: 28, width: 70, borderRadius: 'var(--radius-pill)' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ delay = 0 }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 60px 80px 100px',
      padding: '12px 16px', alignItems: 'center', gap: 8,
      borderBottom: '1px solid var(--border-subtle)',
      animation: `fadeIn 0.3s var(--ease-out) ${delay}s both`,
    }}>
      <div className="skeleton" style={{ height: 14, width: 20 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-xs)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 4 }} />
          <div className="skeleton" style={{ height: 10, width: '40%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 14, width: '70%' }} />
      <div className="skeleton" style={{ height: 14, width: '50%', margin: '0 auto' }} />
      <div className="skeleton" style={{ height: 14, width: '50%', margin: '0 auto' }} />
      <div className="skeleton" style={{ height: 14, width: '50%', margin: '0 auto' }} />
      <div className="skeleton" style={{ height: 28, width: 70, borderRadius: 'var(--radius-pill)', marginLeft: 'auto' }} />
    </div>
  );
}

export default SkeletonCard;

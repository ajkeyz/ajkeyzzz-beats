import { motion } from 'framer-motion';
import Icons from './Icons';
import { formatTime, formatPrice } from '../lib/utils';
import useFocusTrap from '../hooks/useFocusTrap';

export default function BeatComparison({ beats, onClose, onPlay, currentBeat, isPlaying }) {
  const trapRef = useFocusTrap(true);
  const [a, b] = beats;
  if (!a || !b) return null;

  const fields = [
    { label: 'Genre', key: 'genre' },
    { label: 'BPM', key: 'bpm' },
    { label: 'Key', key: 'musical_key', fallback: '—' },
    { label: 'Duration', key: 'duration', format: formatTime },
    { label: 'Basic', key: 'price_basic', format: formatPrice },
    { label: 'Premium', key: 'price_premium', format: formatPrice },
    { label: 'Plays', key: 'plays', format: (v) => (v || 0).toLocaleString() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        ref={trapRef}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 32,
          border: '1px solid var(--border)', maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Compare Beats</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Icons.Close />
          </button>
        </div>

        {/* Beat headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div />
          {[a, b].map((beat) => {
            const color = beat.cover_color || '#E84393';
            const active = currentBeat?.id === beat.id && isPlaying;
            return (
              <div key={beat.id} style={{ textAlign: 'center' }}>
                <div
                  onClick={() => onPlay(beat)}
                  style={{
                    width: 100, height: 100, borderRadius: 'var(--radius)', margin: '0 auto 12px',
                    background: beat.cover_art_url
                      ? `url(${beat.cover_art_url}) center/cover`
                      : `linear-gradient(135deg, ${color}33, ${color}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, cursor: 'pointer', position: 'relative',
                    border: active ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  {!beat.cover_art_url && (beat.cover_emoji || '🎵')}
                  {active && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)',
                    }}>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} style={{
                            width: 3, borderRadius: 2, background: color,
                            animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{beat.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{beat.typebeat}</div>
              </div>
            );
          })}
        </div>

        {/* Comparison rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {fields.map(({ label, key, format, fallback }) => (
            <div key={key} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 16,
              padding: '12px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
              {[a, b].map((beat) => (
                <span key={beat.id} style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', fontFamily: key === 'bpm' || key === 'musical_key' ? 'var(--mono)' : 'inherit' }}>
                  {format ? format(beat[key]) : (beat[key] || fallback || '—')}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Mood tags */}
        <div style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 16,
          padding: '12px 0', marginTop: 4,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Moods</span>
          {[a, b].map((beat) => (
            <div key={beat.id} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {(beat.moods || []).map((m) => (
                <span key={m} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 500,
                }}>
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

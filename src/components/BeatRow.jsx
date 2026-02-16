import { useState, memo } from 'react';
import Icons from './Icons';
import { formatTime } from '../lib/utils';

export default memo(function BeatRow({ beat, index, playBeat, currentBeat, isPlaying, liked, toggleLike, onLicense }) {
  const isActive = currentBeat?.id === beat.id;
  const [hovered, setHovered] = useState(false);
  const color = beat.cover_color || beat.coverColor || '#E84393';

  return (
    <div
      className="beat-row-grid"
      onClick={() => playBeat(beat)}
      style={{
        display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 60px 80px 100px',
        padding: '12px 16px', alignItems: 'center', cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        background: isActive ? `${color}0D` : hovered ? 'var(--bg-tertiary)' : 'transparent',
        transition: 'background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 14, color: isActive ? color : 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        {isActive && isPlaying ? (
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2, background: color,
                animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          String(index + 1).padStart(2, '0')
        )}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-xs)',
          background: beat.cover_art_url
            ? `url(${beat.cover_art_url}) center/cover`
            : `linear-gradient(135deg, ${color}33, ${color}11)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
        }}>
          {!beat.cover_art_url && (beat.cover_emoji || beat.coverEmoji || '🎵')}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? color : 'var(--text-primary)' }}>{beat.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{beat.typebeat}</div>
        </div>
      </div>

      <span className="beat-row-genre" style={{
        fontSize: 12, padding: '3px 10px', borderRadius: 20,
        background: `${color}12`, color: color, fontWeight: 500,
        width: 'fit-content',
      }}>
        {beat.genre}
      </span>

      <span className="beat-row-bpm" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
        {beat.bpm}
      </span>

      <span className="beat-row-key" style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        {beat.musical_key || '—'}
      </span>

      <span className="beat-row-plays" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        {(beat.plays || 0).toLocaleString()}
      </span>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={toggleLike}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            padding: 4, display: 'flex', opacity: hovered || liked ? 1 : 0.3, transition: 'opacity 0.2s',
          }}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Icons.Heart filled={liked} />
        </button>
        <button
          onClick={onLicense}
          style={{
            background: 'none', border: `1px solid ${color}33`, padding: '4px 12px',
            borderRadius: 20, fontSize: 11, color: color, cursor: 'pointer',
            fontFamily: 'var(--font)', opacity: hovered ? 1 : 0.5, transition: 'all 0.2s',
          }}
        >
          License
        </button>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .beat-row-grid {
      grid-template-columns: 40px 1fr 80px !important;
    }
    .beat-row-genre, .beat-row-bpm, .beat-row-key, .beat-row-plays {
      display: none !important;
    }
  }
`}</style>
    </div>
  );
})

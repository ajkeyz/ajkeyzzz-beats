import { useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from './Icons';
import CoverArt from './CoverArt';
import TiltCard from './TiltCard';
import { formatTime } from '../lib/utils';
import { MOOD_OPTIONS } from '../lib/seeds';

const moodColorMap = Object.fromEntries(MOOD_OPTIONS.map(m => [m.name, m.color]));

export default memo(function BeatCard({ beat, index, playBeat, currentBeat, isPlaying, liked, toggleLike, onLicense, comparing, onCompare }) {
  const navigate = useNavigate();
  const isActive = currentBeat?.id === beat.id;
  const [hovered, setHovered] = useState(false);
  const color = beat.cover_color || beat.coverColor || '#E84393';

  const hoverTimer = useRef(null);
  const previewAudio = useRef(null);

  const startHoverPreview = useCallback(() => {
    if (isActive || !beat.preview_url) return;
    hoverTimer.current = setTimeout(() => {
      const audio = new Audio(beat.preview_url);
      audio.volume = 0.3;
      audio.play().catch(() => {});
      previewAudio.current = audio;
      setTimeout(() => {
        if (previewAudio.current) { previewAudio.current.pause(); previewAudio.current = null; }
      }, 5000);
    }, 800);
  }, [beat.preview_url, isActive]);

  const stopHoverPreview = useCallback(() => {
    clearTimeout(hoverTimer.current);
    if (previewAudio.current) { previewAudio.current.pause(); previewAudio.current = null; }
  }, []);

  return (
    <TiltCard
      className={`fade-in fade-in-${(index % 4) + 1}`}
      style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
        border: comparing ? '2px solid var(--accent)' : isActive ? `1px solid ${color}44` : '1px solid var(--border)',
        cursor: 'pointer', position: 'relative',
        transition: 'border-color var(--duration-normal) var(--ease-out)',
      }}
    >
      <div
        onMouseEnter={() => { setHovered(true); startHoverPreview(); }}
        onMouseLeave={() => { setHovered(false); stopHoverPreview(); }}
      >
        {/* Compare */}
        {onCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            style={{
              position: 'absolute', top: 8, left: 8, zIndex: 5,
              width: 28, height: 28, borderRadius: '50%',
              background: comparing ? 'var(--accent)' : 'rgba(0,0,0,0.5)',
              border: comparing ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.5)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
              opacity: hovered || comparing ? 1 : 0, transition: 'opacity 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Add to compare"
          >
            {comparing ? <Icons.Check /> : '+'}
          </button>
        )}

        {/* Cover */}
        <CoverArt beat={beat} isPlaying={isPlaying} isActive={isActive} showGlow={true} kenBurns={true} borderRadius="0" onClick={() => playBeat(beat)}>
          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered || isActive ? 1 : 0, transition: 'opacity 0.3s var(--ease-out)',
          }}>
            {isActive && isPlaying ? (
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 24 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ width: 4, borderRadius: 2, background: color, animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'transform 0.2s',
                transform: hovered ? 'scale(1)' : 'scale(0.85)',
              }}>
                <Icons.Play />
              </div>
            )}
          </div>

          {/* Animated BPM badge — tap to filter */}
          <div
            onClick={(e) => { e.stopPropagation(); navigate(`/beats?bpm_min=${Math.max(60, beat.bpm - 10)}&bpm_max=${Math.min(200, beat.bpm + 10)}`); }}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--mono)', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              animation: isActive && isPlaying ? 'bpmPulse 1s ease-in-out infinite' : 'none',
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${color}CC`}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
            title="Filter similar BPM"
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {beat.bpm}
          </div>

          {/* Key badge — tap to filter */}
          {beat.musical_key && (
            <div
              onClick={(e) => { e.stopPropagation(); navigate(`/beats?key=${encodeURIComponent(beat.musical_key)}`); }}
              style={{
                position: 'absolute', top: 10, left: onCompare ? 44 : 10,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--mono)', color: '#fff',
                cursor: 'pointer', transition: 'background var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-purple)CC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              title="Filter by key"
            >
              {beat.musical_key}
            </div>
          )}

          {/* Duration */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--mono)',
          }}>
            {formatTime(beat.duration)}
          </div>
        </CoverArt>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div onClick={() => navigate(`/beats/${beat.slug}`)} style={{ cursor: 'pointer', minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {beat.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{beat.typebeat}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike?.(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', flexShrink: 0 }}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Icons.Heart filled={liked} />
            </button>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
              background: `${color}12`, color: color, fontWeight: 500,
            }}>
              {beat.genre}
            </span>
            {(beat.moods || []).slice(0, 2).map((m) => (
              <span key={m} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                background: `${moodColorMap[m] || '#636E72'}10`, color: moodColorMap[m] || 'var(--text-muted)', fontWeight: 500,
              }}>
                {m}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              &#9654; {(beat.plays || 0).toLocaleString()}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onLicense?.(); }}
              style={{
                background: 'none', border: `1px solid ${color}33`,
                padding: '5px 14px', borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)', fontWeight: 500, color: color,
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all var(--duration-normal) var(--ease-out)',
              }}
              onMouseEnter={(e) => { e.target.style.background = color + '15'; e.target.style.borderColor = color + '55'; }}
              onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.borderColor = color + '33'; }}
            >
              License
            </button>
          </div>
        </div>
      </div>
    </TiltCard>
  );
})

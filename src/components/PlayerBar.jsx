import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icons from './Icons';
import Waveform from './Waveform';
import VinylDisc from './VinylDisc';
import { formatTime } from '../lib/utils';

// ─── KEYBOARD SHORTCUTS OVERLAY ───
function KeyboardShortcuts({ onClose }) {
  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: 'M', action: 'Mute / Unmute' },
    { key: '\u2190', action: 'Seek backward' },
    { key: '\u2192', action: 'Seek forward' },
    { key: 'N', action: 'Next track' },
    { key: 'P', action: 'Previous track' },
    { key: 'S', action: 'Toggle shuffle' },
    { key: 'R', action: 'Toggle repeat' },
    { key: 'E', action: 'Expand / Collapse player' },
    { key: 'Q', action: 'Toggle queue' },
    { key: 'H', action: 'Recently played' },
    { key: '?', action: 'Show shortcuts' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2001, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: 32,
          border: '1px solid var(--border)', maxWidth: 400, width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Keyboard Shortcuts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Icons.Close />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shortcuts.map((s) => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.action}</span>
              <kbd style={{
                padding: '3px 10px', borderRadius: 6, background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', fontSize: 'var(--text-xs)', fontFamily: 'var(--mono)',
                color: 'var(--text-primary)', minWidth: 32, textAlign: 'center',
              }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── QUEUE DRAWER ───
function QueueDrawer({ queue, recentlyPlayed, onClose, currentBeat, onPlayFromHistory }) {
  const [tab, setTab] = useState('queue');

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 1999,
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 20px 0',
      }}>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xs)', padding: 2 }}>
          {['queue', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font)',
              textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)',
            }}>
              {t === 'queue' ? 'Queue' : 'History'}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
          <Icons.Close />
        </button>
      </div>

      {currentBeat && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', marginTop: 16 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontWeight: 600 }}>Now Playing</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-xs)', flexShrink: 0,
              background: currentBeat.cover_art_url
                ? `url(${currentBeat.cover_art_url}) center/cover`
                : `linear-gradient(135deg, ${currentBeat.cover_color || '#E84393'}33, ${currentBeat.cover_color || '#E84393'}11)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              overflow: 'hidden',
            }}>
              {!currentBeat.cover_art_url && (currentBeat.cover_emoji || '🎵')}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentBeat.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{currentBeat.typebeat || ''}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
        {tab === 'queue' ? (
          <>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
              Up Next ({queue.length})
            </div>
            {queue.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                No tracks in queue
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {queue.map((b, i) => (
                  <div key={b.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: `linear-gradient(135deg, ${b.cover_color || '#E84393'}33, ${b.cover_color || '#E84393'}11)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {b.cover_emoji || '🎵'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.title}
                      </div>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      {formatTime(b.duration)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
              Recently Played ({recentlyPlayed.length})
            </div>
            {recentlyPlayed.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                No history yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentlyPlayed.map((b, i) => (
                  <div key={b.id + '-' + i}
                    onClick={() => onPlayFromHistory?.(b)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                      borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                      transition: 'background var(--duration-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: `linear-gradient(135deg, ${b.cover_color || '#E84393'}33, ${b.cover_color || '#E84393'}11)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {b.cover_emoji || '🎵'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.genre}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── EXPANDED PLAYER ───
function ExpandedPlayer({ beat, isPlaying, progress, currentTime, duration, volume, setVolume, loading, onPlayPause, onNext, onPrev, onSeek, onShuffle, shuffle, repeat, onRepeat, liked, onLike, onLicense, onCollapse }) {
  const color = beat.cover_color || '#E84393';

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
      onDragEnd={(_, info) => { if (info.offset.y > 120) onCollapse(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1998,
        background: `linear-gradient(180deg, ${color}18 0%, var(--bg-primary) 50%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 40px',
      }}
    >
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 40, height: 4, borderRadius: 2, background: 'var(--border-hover)', opacity: 0.6,
      }} />

      <button onClick={onCollapse} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
      }} aria-label="Collapse player">
        <Icons.Collapse />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }} style={{ marginBottom: 40 }}
      >
        <VinylDisc beat={beat} isPlaying={isPlaying} size={260} />
      </motion.div>

      <div style={{ textAlign: 'center', marginBottom: 32, maxWidth: 400 }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 4 }}>{beat.title}</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{beat.typebeat || beat.genre}</p>
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12,
          fontSize: 'var(--text-xs)', fontFamily: 'var(--mono)', color: 'var(--text-secondary)',
        }}>
          <span style={{
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            background: `${color}15`, border: `1px solid ${color}22`,
            animation: 'bpmPulse 1.2s ease-in-out infinite',
          }}>
            {beat.bpm} BPM
          </span>
          {beat.musical_key && (
            <span style={{
              padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              background: 'var(--accent-purple)15', border: '1px solid var(--accent-purple)22',
            }}>
              {beat.musical_key}
            </span>
          )}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 500, marginBottom: 16 }}>
        <Waveform audioUrl={beat.preview_url} progress={progress} color={color} height={64} onSeek={onSeek} isPlaying={isPlaying} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 500, marginBottom: 24 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{formatTime(currentTime)}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{formatTime(duration)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 32 }}>
        <button onClick={onShuffle} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
          color: shuffle ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'color var(--duration-normal)',
        }} title="Shuffle">
          <Icons.Shuffle />
        </button>
        <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
          <Icons.SkipPrev />
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          style={{
            width: 64, height: 64, borderRadius: '50%', background: color,
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: `0 0 40px ${color}44`,
          }}
        >
          {loading ? (
            <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            isPlaying ? <Icons.Pause /> : <Icons.Play />
          )}
        </motion.button>
        <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
          <Icons.SkipNext />
        </button>
        <button onClick={onRepeat} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
          color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'color var(--duration-normal)', position: 'relative',
        }} title="Repeat">
          <Icons.Repeat />
          {repeat === 'one' && (
            <span style={{
              position: 'absolute', top: -6, right: -8, fontSize: 9, fontWeight: 700,
              color: 'var(--accent)', lineHeight: 1,
            }}>1</span>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
          {volume > 0 ? <Icons.Volume /> : <Icons.VolumeMute />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: 120, accentColor: color }}
        />
        <button className="like-bounce" onClick={onLike} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
          <Icons.Heart filled={liked} />
        </button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onLicense}
          className="btn-primary"
          style={{ padding: '10px 24px', background: color }}
        >
          License Beat
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── MAIN PLAYER BAR ───
export default function PlayerBar({
  beat, isPlaying, progress, currentTime, duration,
  volume, setVolume, loading, queue = [],
  onPlayPause, onNext, onPrev, onSeek,
  liked, onLike, onLicense,
  shuffle, onShuffle, repeat, onRepeat, recentlyPlayed = [], onPlayFromHistory,
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (!beat) return;

    switch (e.key) {
      case ' ': e.preventDefault(); onPlayPause(); break;
      case 'm': case 'M': setVolume(volume > 0 ? 0 : 0.8); break;
      case 'ArrowRight':
        if (!e.target.closest('[role="slider"]')) { e.preventDefault(); onSeek(Math.min(100, progress + 3)); }
        break;
      case 'ArrowLeft':
        if (!e.target.closest('[role="slider"]')) { e.preventDefault(); onSeek(Math.max(0, progress - 3)); }
        break;
      case 'n': case 'N': onNext(); break;
      case 'p': case 'P': onPrev(); break;
      case 's': case 'S': onShuffle?.(); break;
      case 'r': case 'R': onRepeat?.(); break;
      case 'e': case 'E': setExpanded(prev => !prev); break;
      case 'q': case 'Q': setShowQueue(prev => !prev); break;
      case 'h': case 'H': setShowQueue(true); break;
      case '?': setShowShortcuts(prev => !prev); break;
      case 'Escape': setExpanded(false); setShowQueue(false); setShowShortcuts(false); break;
    }
  }, [beat, onPlayPause, onSeek, onNext, onPrev, onShuffle, onRepeat, volume, setVolume, progress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!beat) return null;

  const color = beat.cover_color || beat.coverColor || '#E84393';

  return (
    <>
      {/* Mini player bar */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001,
              background: 'var(--glass-strong)', backdropFilter: 'blur(24px) saturate(180%)',
              borderTop: '1px solid var(--border)',
            }}
            role="region" aria-label="Audio player"
          >
            {/* Waveform scrubber */}
            <div style={{ padding: '0 24px', maxWidth: 1280, margin: '0 auto' }}>
              <Waveform audioUrl={beat.preview_url} progress={progress} color={color} height={28} onSeek={onSeek} isPlaying={isPlaying} mini />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 24px 10px', maxWidth: 1280, margin: '0 auto', gap: 16,
            }}>
              {/* Beat info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => beat.slug && navigate(`/beats/${beat.slug}`)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-xs)', flexShrink: 0,
                  background: beat.cover_art_url
                    ? `url(${beat.cover_art_url}) center/cover`
                    : `linear-gradient(135deg, ${color}33, ${color}11)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden',
                  boxShadow: isPlaying ? `0 0 16px ${color}22` : 'none',
                  transition: 'box-shadow var(--duration-normal)',
                }}>
                  {!beat.cover_art_url && (beat.cover_emoji || beat.coverEmoji || '🎵')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {beat.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {beat.typebeat || ''}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onLike?.(); }}
                  className="like-bounce"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', flexShrink: 0 }}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <Icons.Heart filled={liked} />
                </button>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="player-shuffle-btn" onClick={onShuffle}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: shuffle ? 'var(--accent)' : 'var(--text-muted)' }}
                  aria-label="Shuffle" title="Shuffle (S)"
                >
                  <Icons.Shuffle />
                </button>
                <button className="player-repeat-btn" onClick={onRepeat}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', position: 'relative',
                    color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                  aria-label="Repeat" title="Repeat (R)"
                >
                  <Icons.Repeat />
                  {repeat === 'one' && (
                    <span style={{
                      position: 'absolute', top: -6, right: -8, fontSize: 9, fontWeight: 700,
                      color: 'var(--accent)', lineHeight: 1,
                    }}>1</span>
                  )}
                </button>
                <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} aria-label="Previous">
                  <Icons.SkipPrev />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }} onClick={onPlayPause}
                  className={isPlaying ? 'glow-active' : ''}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', background: color,
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff',
                    transition: 'box-shadow var(--duration-normal)',
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {loading ? (
                    <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    isPlaying ? <Icons.Pause /> : <Icons.Play />
                  )}
                </motion.button>
                <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} aria-label="Next">
                  <Icons.SkipNext />
                </button>
              </div>

              {/* Right side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
                <span className="player-time" style={{
                  fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)',
                  minWidth: 80, textAlign: 'center',
                }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="player-vol" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                    aria-label={volume > 0 ? 'Mute' : 'Unmute'}
                  >
                    {volume > 0 ? <Icons.Volume /> : <Icons.VolumeMute />}
                  </button>
                  <input type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{ width: 80, accentColor: color }} aria-label="Volume"
                  />
                </div>

                <button className="player-extra-btn" onClick={() => setShowQueue(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', position: 'relative' }}
                  aria-label="Queue" title="Queue (Q)"
                >
                  <Icons.Queue />
                  {queue.length > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -6, width: 14, height: 14, borderRadius: '50%',
                      background: color, fontSize: 9, fontWeight: 700, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {queue.length}
                    </span>
                  )}
                </button>

                <button className="player-extra-btn" onClick={() => setExpanded(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  aria-label="Expand player" title="Expand (E)"
                >
                  <Icons.Expand />
                </button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="player-license-btn btn-primary"
                  onClick={onLicense}
                  style={{ padding: '8px 20px', background: color, fontSize: 'var(--text-xs)' }}
                >
                  License
                </motion.button>
              </div>
            </div>

            <style>{`
              @media (max-width: 768px) {
                .player-vol { display: none !important; }
                .player-license-btn { display: none !important; }
                .player-extra-btn { display: none !important; }
                .player-shuffle-btn { display: none !important; }
                .player-repeat-btn { display: none !important; }
                .player-time { display: none !important; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {expanded && (
          <ExpandedPlayer
            beat={beat} isPlaying={isPlaying} progress={progress} currentTime={currentTime}
            duration={duration} volume={volume} setVolume={setVolume} loading={loading}
            onPlayPause={onPlayPause} onNext={onNext} onPrev={onPrev} onSeek={onSeek}
            shuffle={shuffle} onShuffle={onShuffle}
            repeat={repeat} onRepeat={onRepeat}
            liked={liked} onLike={onLike} onLicense={onLicense}
            onCollapse={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Queue/History drawer */}
      <AnimatePresence>
        {showQueue && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1998 }}
              onClick={() => setShowQueue(false)}
            />
            <QueueDrawer
              queue={queue} recentlyPlayed={recentlyPlayed}
              currentBeat={beat} onClose={() => setShowQueue(false)}
              onPlayFromHistory={onPlayFromHistory}
            />
          </>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts */}
      <AnimatePresence>
        {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>
    </>
  );
}

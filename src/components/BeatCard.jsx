import { useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icons from './Icons';
import CoverArt from './CoverArt';

import { formatTime, haptic } from '../lib/utils';
import { MOOD_OPTIONS } from '../lib/seeds';

const moodColorMap = Object.fromEntries(MOOD_OPTIONS.map(m => [m.name, m.color]));

export default memo(function BeatCard({ beat, index, playBeat, currentBeat, isPlaying, liked, toggleLike, onLicense, comparing, onCompare }) {
  const navigate = useNavigate();
  const isActive = currentBeat?.id === beat.id;
  const [hovered, setHovered] = useState(false);
  const color = beat.cover_color || beat.coverColor || '#FFD800';

  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef(null);
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

  // Compute extra tags count for mobile "+N" badge
  const moodTags = (beat.moods || []).slice(0, 2);
  const extraTagCount = moodTags.length; // genre is always shown; mood tags are hidden on mobile

  const handleCardClick = () => {
    navigate(`/beats/${beat.slug}`);
  };

  return (
    <div
      className={`beat-card fade-in fade-in-${(index % 4) + 1}`}
      style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)', overflow: 'hidden',
        border: comparing ? '2px solid var(--accent)' : isActive ? `1px solid ${color}44` : '1px solid var(--border)',
        cursor: 'pointer', position: 'relative',
        transition: 'border-color var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'none',
      }}
      onTouchStart={() => {
        longPressTimer.current = setTimeout(() => setShowActions(true), 500);
      }}
      onTouchEnd={() => clearTimeout(longPressTimer.current)}
      onTouchMove={() => clearTimeout(longPressTimer.current)}
    >
      <div
        onClick={handleCardClick}
        onMouseEnter={() => { setHovered(true); startHoverPreview(); }}
        onMouseLeave={() => { setHovered(false); stopHoverPreview(); }}
        style={{ cursor: 'pointer' }}
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

        {/* Cover — relative wrapper for mobile overlays */}
        <div style={{ position: 'relative' }} className="beat-card-cover">
          <CoverArt beat={beat} isPlaying={isPlaying} isActive={isActive} showGlow={true} kenBurns={true} borderRadius="0" onClick={(e) => { e.stopPropagation(); playBeat(beat); }}>
            {/* Play overlay (desktop: hover-based) */}
            <div className="beat-card-play-desktop" style={{
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

            {/* Animated BPM badge -- tap to filter */}
            <div
              onClick={(e) => { e.stopPropagation(); navigate(`/beats?bpm_min=${Math.max(60, beat.bpm - 10)}&bpm_max=${Math.min(200, beat.bpm + 10)}`); }}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                padding: '6px 12px', borderRadius: 'var(--radius-pill)', minHeight: 32,
                fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--mono)', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                animation: 'none',
                transition: 'background var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${color}CC`}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              title="Filter similar BPM"
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {beat.bpm}
            </div>

            {/* Key badge -- tap to filter */}
            {beat.musical_key && (
              <div
                onClick={(e) => { e.stopPropagation(); navigate(`/beats?key=${encodeURIComponent(beat.musical_key)}`); }}
                style={{
                  position: 'absolute', top: 10, left: onCompare ? 44 : 10,
                  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                  padding: '6px 12px', borderRadius: 'var(--radius-pill)', minHeight: 32,
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

          {/* Mobile-only: center play button overlay */}
          <button
            className="beat-card-play"
            onClick={(e) => { e.stopPropagation(); haptic(); playBeat(beat); }}
            aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
            style={{
              display: 'none', /* hidden by default, shown via media query */
              position: 'absolute', bottom: 12, right: 12, zIndex: 5,
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {isActive && isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>

          {/* Mobile-only: heart overlay on top-right of cover */}
          <button
            className="beat-card-heart"
            onClick={(e) => { e.stopPropagation(); haptic(); toggleLike?.(); }}
            aria-label={liked ? 'Unlike' : 'Like'}
            style={{
              display: 'none', /* hidden by default, shown via media query */
              position: 'absolute', top: 10, right: 10, zIndex: 5,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: 'none',
              cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
              color: liked ? '#FFD800' : '#fff',
            }}
          >
            <Icons.Heart filled={liked} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ cursor: 'pointer', minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {beat.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{beat.typebeat}</div>
            </div>
            {/* Desktop-only heart (hidden on mobile via class) */}
            <button
              className="beat-card-heart-desktop"
              onClick={(e) => { e.stopPropagation(); haptic(); toggleLike?.(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', flexShrink: 0 }}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Icons.Heart filled={liked} />
            </button>
          </div>

          {/* Tags */}
          <div className="beat-card-tags" style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="beat-card-tag-primary" style={{
              fontSize: 10, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
              background: `${color}12`, color: color, fontWeight: 500,
            }}>
              {beat.genre}
            </span>
            {moodTags.map((m) => (
              <span key={m} className="beat-card-tag-extra" style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                background: `${moodColorMap[m] || '#636E72'}10`, color: moodColorMap[m] || 'var(--text-muted)', fontWeight: 500,
              }}>
                {m}
              </span>
            ))}
            {/* Mobile-only: "+N" badge for collapsed tags */}
            {extraTagCount > 0 && (
              <span className="beat-card-tag-count" style={{
                display: 'none', /* shown on mobile via media query */
                fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                background: 'var(--border)', color: 'var(--text-muted)', fontWeight: 600,
              }}>
                +{extraTagCount}
              </span>
            )}
          </div>

          <div className="beat-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                &#9654; {(beat.plays || 0).toLocaleString()}
              </span>
              <span className="beat-card-price" style={{
                fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)',
                fontFamily: 'var(--mono)',
              }}>
                From ${(beat.price_basic || 29.99).toFixed(0)}
              </span>
            </div>
            <button
              className="beat-card-license"
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

      {/* Mobile action sheet */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActions(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
                padding: '20px 24px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
                width: '100%', maxWidth: 420,
                border: '1px solid var(--border)', borderBottom: 'none',
              }}
            >
              <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: beat.cover_art_url ? `url(${beat.cover_art_url}) center/cover` : `linear-gradient(135deg, ${color}33, ${color}11)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {!beat.cover_art_url && (beat.cover_emoji || '🎵')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{beat.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{beat.genre} · {beat.bpm} BPM</div>
                </div>
              </div>
              {[
                { icon: <Icons.Play />, label: isActive && isPlaying ? 'Pause' : 'Play', action: () => playBeat(beat) },
                { icon: <Icons.Heart />, label: liked ? 'Unlike' : 'Like', action: () => toggleLike() },
                { icon: <Icons.Music />, label: 'License Beat', action: () => onLicense?.() },
                { icon: <Icons.ExternalLink />, label: 'View Details', action: () => navigate(`/beats/${beat.slug}`) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowActions(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '14px 0', background: 'none', border: 'none',
                    borderTop: '1px solid var(--border)', color: 'var(--text-primary)',
                    fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overrides */}
      <style>{`
        @media (max-width: 768px) {
          /* ---- Play button: visible as overlay on cover ---- */
          .beat-card-play {
            display: flex !important;
          }

          /* Hide the desktop hover-based play overlay on mobile */
          .beat-card-play-desktop {
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* Show play overlay only when active & playing (waveform) */
          .beat-card .beat-card-play-desktop {
            display: none !important;
          }

          /* ---- Heart: overlay on cover top-right ---- */
          .beat-card-heart {
            display: flex !important;
          }

          /* Hide the desktop heart in the info section */
          .beat-card-heart-desktop {
            display: none !important;
          }

          /* Move BPM badge to make room for heart overlay */
          .beat-card-cover > div [title="Filter similar BPM"] {
            right: auto !important;
            left: 10px !important;
            top: auto !important;
            bottom: 10px !important;
          }

          /* ---- Tags collapse: hide extra tags, show +N badge ---- */
          .beat-card-tag-extra {
            display: none !important;
          }

          .beat-card-tag-count {
            display: inline-flex !important;
          }

          /* ---- License button: full-width on mobile ---- */
          .beat-card-footer {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .beat-card-license {
            width: 100% !important;
            text-align: center !important;
            padding: 10px 14px !important;
            min-height: 44px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            border-width: 1.5px !important;
          }

          /* ---- Tap target sizes: minimum 44px ---- */
          .beat-card-play {
            min-width: 52px !important;
            min-height: 52px !important;
          }

          .beat-card-heart {
            min-width: 44px !important;
            min-height: 44px !important;
          }

          .beat-card [aria-label="Add to compare"] {
            min-width: 44px !important;
            min-height: 44px !important;
            width: 44px !important;
            height: 44px !important;
          }

          /* ---- Spacing rhythm ---- */
          .beat-card-tags {
            margin-bottom: 8px !important;
          }

          .beat-card-footer span {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
})

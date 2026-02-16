import { motion } from 'framer-motion';

export default function VinylDisc({ beat, isPlaying, size = 280 }) {
  const color = beat.cover_color || beat.coverColor || '#E84393';
  const labelSize = size * 0.38;
  const grooveCount = 18;
  const grooves = Array.from({ length: grooveCount }, (_, i) => {
    const inner = labelSize / 2 + 4;
    const outer = size / 2 - 8;
    return inner + (outer - inner) * (i / grooveCount);
  });

  return (
    <motion.div
      animate={isPlaying ? { rotate: 360 } : {}}
      transition={isPlaying
        ? { duration: 4, repeat: Infinity, ease: 'linear' }
        : { duration: 0.5 }
      }
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%,
          #111 0%, #1a1a1a 30%, #151515 31%,
          #1a1a1a 32%, #151515 33%, #1a1a1a 35%,
          #151515 60%, #222 61%, #111 100%)`,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 60px ${color}33, inset 0 0 30px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Grooves */}
      {grooves.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: r * 2, height: r * 2, borderRadius: '50%',
            border: '0.5px solid rgba(255,255,255,0.04)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Shine reflection */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Center label */}
      <div style={{
        width: labelSize, height: labelSize, borderRadius: '50%',
        overflow: 'hidden', position: 'relative',
        background: beat.cover_art_url
          ? `url(${beat.cover_art_url}) center/cover`
          : `linear-gradient(135deg, ${color}55, ${color}22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
      }}>
        {!beat.cover_art_url && (
          <span style={{ fontSize: labelSize * 0.4, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            {beat.cover_emoji || beat.coverEmoji || '🎵'}
          </span>
        )}
        {/* Center hole */}
        <div style={{
          position: 'absolute', width: 8, height: 8, borderRadius: '50%',
          background: '#111', border: '1px solid rgba(255,255,255,0.1)',
        }} />
      </div>
    </motion.div>
  );
}

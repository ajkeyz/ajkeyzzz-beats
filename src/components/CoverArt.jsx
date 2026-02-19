import { useState, useMemo, useRef, useEffect } from 'react';

// Deterministic hash from string
function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generative SVG pattern seeded by beat properties
function GenerativePattern({ beat, color }) {
  const seed = hashStr(`${beat.title}-${beat.bpm}-${beat.genre}`);
  const bpm = beat.bpm || 140;
  const numCircles = 3 + (seed % 5);
  const numLines = 4 + (seed % 6);

  const circles = useMemo(() =>
    Array.from({ length: numCircles }, (_, i) => {
      const angle = (i / numCircles) * Math.PI * 2 + (seed * 0.1);
      const r = 20 + ((seed + i * 37) % 30);
      const cx = 50 + Math.cos(angle) * (15 + i * 8);
      const cy = 50 + Math.sin(angle) * (15 + i * 8);
      return { cx, cy, r, opacity: 0.08 + i * 0.04 };
    }),
  [seed, numCircles]);

  const lines = useMemo(() =>
    Array.from({ length: numLines }, (_, i) => {
      const y0 = 10 + ((seed + i * 23) % 80);
      const cp1x = 20 + ((seed + i * 17) % 30);
      const cp1y = y0 + ((seed + i * 11) % 40) - 20;
      const cp2x = 50 + ((seed + i * 31) % 30);
      const cp2y = y0 + ((seed + i * 13) % 40) - 20;
      const y1 = y0 + ((seed + i * 7) % 20) - 10;
      return {
        d: `M 0 ${y0} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, 100 ${y1}`,
        opacity: 0.06 + i * 0.03,
        strokeWidth: 1 + ((seed + i) % 3),
      };
    }),
  [seed, numLines]);

  const dur = Math.max(4, 20 - bpm / 20);
  const gId = `grd-${seed}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id={gId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gId})`} />
      {circles.map((c, i) => (
        <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} fill={color} opacity={c.opacity}>
          <animate attributeName="r" values={`${c.r};${c.r + 5};${c.r}`} dur={`${dur + i}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {lines.map((l, i) => (
        <path key={`l${i}`} d={l.d} fill="none" stroke={color} strokeWidth={l.strokeWidth} opacity={l.opacity} strokeLinecap="round" />
      ))}
      <circle cx="50" cy="50" r="25" fill={color} opacity="0.06" />
    </svg>
  );
}

export default function CoverArt({
  beat,
  size,
  isPlaying = false,
  isActive = false,
  showGlow = true,
  kenBurns = true,
  borderRadius = 'var(--radius)',
  onClick,
  children,
  style: customStyle = {},
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const color = beat.cover_color || beat.coverColor || '#FFD800';
  const hasImage = !!beat.cover_art_url;
  const shouldZoom = kenBurns && (hovered || isPlaying);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: size,
        height: size,
        aspectRatio: size ? undefined : '1',
        borderRadius,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: 'var(--shadow)',
        transition: 'box-shadow 0.5s ease',
        ...customStyle,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Instant color fill */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
      }} />

      {/* Generative pattern fallback (only rendered when visible) */}
      {!hasImage && isVisible && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: shouldZoom ? 'scale(1.08)' : 'scale(1)',
          transition: `transform ${isPlaying ? '12s' : '0.6s'} ease`,
        }}>
          <GenerativePattern beat={beat} color={color} />
        </div>
      )}

      {/* Blur-up image loading */}
      {hasImage && (
        <img
          src={beat.cover_art_url}
          alt={beat.title}
          loading="lazy"
          width={typeof size === 'number' ? size : 260}
          height={typeof size === 'number' ? size : 260}
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0.4,
            filter: imgLoaded ? 'blur(0px)' : 'blur(12px)',
            transform: shouldZoom ? 'scale(1.08)' : 'scale(1)',
            transition: `opacity 0.6s ease, filter 0.6s ease, transform ${isPlaying ? '12s' : '0.6s'} ease`,
          }}
        />
      )}

      {/* Emoji (no-image) */}
      {!hasImage && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: typeof size === 'number' ? size * 0.4 : 64,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          transform: shouldZoom ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.6s ease',
          zIndex: 1,
        }}>
          {beat.cover_emoji || beat.coverEmoji || '🎵'}
        </div>
      )}

      {/* Children (overlays, badges) */}
      {children && <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>{children}</div>}
    </div>
  );
}

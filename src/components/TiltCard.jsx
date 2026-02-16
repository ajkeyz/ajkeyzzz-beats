import { useRef, useState, useCallback } from 'react';

export default function TiltCard({
  children,
  className = '',
  style = {},
  tiltMax = 8,
  glareMax = 0.15,
  perspective = 800,
  scale = 1.02,
  disabled = false,
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState(null);
  const [glare, setGlare] = useState(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (disabled) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * tiltMax * 2;
      const rotY = (x - 0.5) * tiltMax * 2;
      setTilt(`perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`);
      const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
      const opacity = Math.min(glareMax, Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) * glareMax * 2);
      setGlare(`linear-gradient(${angle}deg, rgba(255,255,255,${opacity}) 0%, transparent 60%)`);
    });
  }, [disabled, tiltMax, perspective, scale, glareMax]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt(null);
    setGlare(null);
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: tilt || `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
        transition: tilt ? 'none' : 'transform 0.5s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        position: style.position || 'relative',
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          pointerEvents: 'none',
          background: glare || 'transparent',
          transition: glare ? 'none' : 'background 0.5s ease-out',
          zIndex: 10,
        }}
      />
    </div>
  );
}

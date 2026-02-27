import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import BeatCard from '../components/BeatCard';
import CoverArt from '../components/CoverArt';
import Footer from '../components/Footer';
import Icons from '../components/Icons';
import { SkeletonCard } from '../components/SkeletonCard';
import { fetchBeats, fetchCollections } from '../lib/data';
import { localStore } from '../lib/store';

// ─── SCROLL-TRIGGERED SECTION WRAPPER ───
function RevealSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── SECTION HEADING ───
function SectionHeading({ label, title, subtitle, action, actionTo }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
      <div>
        {label && (
          <div style={{
            fontSize: 'var(--text-xs)', fontFamily: 'var(--mono)', color: 'var(--accent)',
            textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 8, fontWeight: 600,
          }}>
            {label}
          </div>
        )}
        <h2 style={{
          fontSize: 'var(--text-3xl)', fontWeight: 800,
          letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-tight)',
          marginBottom: subtitle ? 6 : 0,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && actionTo && (
        <Link to={actionTo} className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {action} <span style={{ fontSize: 16 }}>&rarr;</span>
        </Link>
      )}
    </div>
  );
}

// ─── ANIMATED COUNTER ───
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (!ref.current || target === 0) return;
    // If target hasn't changed, skip
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const runAnimation = () => {
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    // If already visible, animate immediately; otherwise wait for intersection
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          runAnimation();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── LIVE WAVEFORM VISUALIZER ───
function HeroWaveform({ isPlaying, color = '#FFD800' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement.offsetWidth;
    const H = 48;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const bars = 60;
    const gap = 3;
    const barW = (W - (bars - 1) * gap) / bars;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += isPlaying ? 0.06 : 0.015;

      for (let i = 0; i < bars; i++) {
        const x = i * (barW + gap);
        const base = isPlaying
          ? 0.3 + 0.5 * Math.sin(t + i * 0.25) * Math.cos(t * 0.7 + i * 0.1)
          : 0.15 + 0.12 * Math.sin(t * 0.5 + i * 0.3);
        const h = Math.abs(base) * H * 0.85;
        const y = (H - h) / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, color + (isPlaying ? 'CC' : '44'));
        gradient.addColorStop(1, '#6C5CE7' + (isPlaying ? '88' : '22'));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, color]);

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <canvas ref={canvasRef} style={{ display: 'block', opacity: 0.6 }} />
    </div>
  );
}

// ─── FEATURED CAROUSEL ───
const FeaturedCarousel = memo(function FeaturedCarousel({ beats, playBeat, currentBeat, isPlaying }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (beats.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % beats.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [beats.length]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setActiveIndex(idx);
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % beats.length);
    }, 5000);
  };

  if (beats.length === 0) return null;
  const beat = beats[activeIndex];
  const color = beat?.cover_color || '#FFD800';
  const isActive = currentBeat?.id === beat?.id;

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="carousel-grid"
          style={{
            display: 'grid', gridTemplateColumns: '360px 1fr', gap: 0,
            background: `linear-gradient(135deg, ${color}12, ${color}04)`,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          <CoverArt
            beat={beat}
            isPlaying={isPlaying}
            isActive={isActive}
            showGlow={true}
            kenBurns={true}
            borderRadius="0"
            onClick={() => playBeat(beat)}
          >
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.3s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                {isActive && isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </div>
            </div>
          </CoverArt>

          <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: 'var(--text-xs)', color: color, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 16,
              fontFamily: 'var(--mono)',
            }}>
              Featured
            </div>
            <h3 style={{
              fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8,
              letterSpacing: 'var(--tracking-tight)',
            }}>
              {beat.title}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>{beat.typebeat}</p>
            <div style={{
              display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
              marginBottom: 32, fontFamily: 'var(--mono)',
            }}>
              <span>{beat.bpm} BPM</span>
              <span>{beat.musical_key || ''}</span>
              <span>{beat.genre}</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => playBeat(beat)}
                className="btn-primary"
                style={{
                  padding: '14px 32px', background: color,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: `0 0 32px ${color}33`,
                }}
              >
                <Icons.Play /> Listen
              </motion.button>
              <Link
                to={`/beats/${beat.slug}`}
                className="btn-ghost"
                style={{ padding: '14px 32px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                View Details
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {beats.length > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          {beats.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === activeIndex ? 28 : 8, height: 8, borderRadius: 4,
                background: i === activeIndex ? color : 'var(--border)',
                border: 'none', cursor: 'pointer', transition: 'all 0.4s var(--ease-out)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .carousel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
});

// ─── MARQUEE TICKER ───
function MarqueeTicker({ items }) {
  return (
    <div style={{
      overflow: 'hidden', padding: '20px 0',
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      background: 'linear-gradient(90deg, var(--bg-primary), var(--bg-secondary), var(--bg-primary))',
    }}>
      <div className="marquee-track" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{
            fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: 'var(--accent)', fontSize: 6 }}>&#11044;</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── QUICK ACCESS BEAT ROW ───
const QuickAccessRow = memo(function QuickAccessRow({ title, subtitle, beats, playBeat, currentBeat, isPlaying, likedBeats, toggleLike, openLicensing, allBeats }) {
  const scrollRef = useRef(null);

  if (beats.length === 0) return null;

  return (
    <RevealSection>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: 'var(--tracking-tight)' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button
            onClick={() => { if (beats.length > 0) playBeat(beats[0], beats); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'var(--accent)', border: 'none', borderRadius: 50,
              color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)', flexShrink: 0,
            }}
            aria-label={`Play all ${title}`}
          >
            <Icons.Play /> Play All
          </button>
        </div>
        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8,
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}
        >
          <style>{`.quick-scroll::-webkit-scrollbar { display: none; }`}</style>
          {beats.slice(0, 6).map((beat, i) => (
            <div key={beat.id} style={{ minWidth: 260, maxWidth: 280, scrollSnapAlign: 'start', flex: '0 0 auto' }}>
              <BeatCard
                beat={beat}
                index={i}
                playBeat={(b) => playBeat(b, allBeats)}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
                liked={likedBeats.has(beat.id)}
                toggleLike={() => toggleLike(beat.id)}
                onLicense={() => openLicensing(beat)}
              />
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
});

// ─── TESTIMONIALS ───
const TESTIMONIALS = [
  { name: 'DJ Flame', text: 'AJKEYZZZ never misses. Every beat is a hit waiting to happen.', role: 'Artist', rating: 5, color: '#FF6B6B' },
  { name: 'Kelvin O.', text: 'The quality is insane. My mix just hit 100K with one of these beats.', role: 'Producer', rating: 5, color: '#6C5CE7' },
  { name: 'Adaeze M.', text: 'Best Alté beats on the internet. Period. The vibes are always right.', role: 'Singer', rating: 5, color: '#00B894' },
];

// ─── MAIN COMPONENT ───
export default function HomePage({ playBeat, currentBeat, isPlaying, likedBeats, toggleLike, openLicensing }) {
  const [beats, setBeats] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroBg, setHeroBg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBeats().then((data) => { setBeats(data); setLoading(false); }).catch(() => setLoading(false));
    fetchCollections().then(setCollections).catch(() => {});
    setHeroBg(localStore.getHeroBg());
  }, []);

  const featured = beats.filter((b) => b.featured);
  const trending = [...beats].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6);
  const newest = [...beats].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const playlists = collections;

  const totalPlays = beats.reduce((sum, b) => sum + (b.plays || 0), 0);

  // Quick access sections per genre
  const genreSections = playlists.slice(0, 4).map(pl => ({
    title: `Best for ${pl.name}`,
    subtitle: `${pl.cover_emoji} Top picks`,
    beats: beats.filter(b => b.playlist === pl.id || b.genre === pl.name)
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 6),
  })).filter(s => s.beats.length > 0);

  return (
    <>
      <Helmet>
        <title>AJKEYZZZ — Beats That Move The World</title>
        <meta name="description" content="Premium Alté, Afro Swing, and Afrobeats production from Lagos to Cali. Browse, preview, and license beats by AJKEYZZZ." />
        <meta property="og:title" content="AJKEYZZZ — Beats That Move The World" />
        <meta property="og:description" content="Premium Alté, Afro Swing, and Afrobeats production. Listen first, vibe always." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{ paddingTop: 64 }}>

        {/* ═══ HERO ═══ */}
        <section className="hero-section" style={{
          position: 'relative', minHeight: '65vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', textAlign: 'center',
          background: heroBg ? '#1a1a1a' : 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), #1a1a1a',
        }}>
          {/* Animated background image */}
          {heroBg && (
            <div className="hero-bg-image" style={{
              position: 'absolute', inset: '-2%',
              backgroundImage: `url(${heroBg})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              animation: 'heroPan 25s ease-in-out infinite alternate',
            }} />
          )}
          {/* Dark overlay on top of image */}
          {heroBg && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
              zIndex: 0,
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 860 }}>
            <h1
              className="hero-title"
              style={{
                fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.15,
                letterSpacing: '0.06em', marginBottom: 20,
                color: '#fff', textTransform: 'uppercase',
              }}
            >
              Welcome to AJKEYZZZ Beats Store
            </h1>
            <p
              className="hero-tagline"
              style={{
                fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.7)',
                fontWeight: 400, lineHeight: 'var(--leading-normal)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                maxWidth: 600, margin: '0 auto 40px',
              }}
            >
              From Lagos to Cali &mdash; Beats That Move the World
            </p>
            <HeroWaveform isPlaying={isPlaying} color="#FFD800" />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                onClick={() => { if (trending[0]) playBeat(trending[0], beats); }}
                className="btn-primary hero-cta-btn"
                style={{
                  padding: '18px 44px', fontSize: 'var(--text-base)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Icons.Play /> Start Listening
              </button>
            </div>
          </div>
        </section>

        {/* Hero animation + mobile overrides */}
        <style>{`
          @keyframes heroPan {
            0% { transform: scale(1) translate(0%, 0%); }
            33% { transform: scale(1.03) translate(-0.8%, -0.5%); }
            66% { transform: scale(1.02) translate(0.5%, 0.3%); }
            100% { transform: scale(1.03) translate(-0.3%, -0.3%); }
          }
          @media (max-width: 768px) {
            .hero-section {
              min-height: auto !important;
              padding-top: 32px !important;
              padding-bottom: 24px !important;
            }
            .hero-title { margin-bottom: 10px !important; }
            .hero-tagline { margin: 0 auto 20px !important; font-size: var(--text-base) !important; }
            .hero-cta-btn { padding: 14px 28px !important; font-size: var(--text-sm) !important; }
          }
        `}</style>

        {/* ═══ MARQUEE ═══ */}
        <MarqueeTicker items={[
          'Premium Beats', 'Alté', 'Afro Swing', 'Exclusive Licensing',
          'Stems Available', 'Afrobeats', 'Custom Production', 'Lagos to Cali',
          'Premium Beats', 'Alté', 'Afro Swing', 'Exclusive Licensing',
        ]} />

        {/* ═══ STATS ═══ */}
        <RevealSection>
          <section className="stats-section" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
            <div className="stats-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1,
              background: 'var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            }}>
              {[
                { label: 'Total Beats', value: beats.length, suffix: '+', icon: '\uD83C\uDFB5' },
                { label: 'Total Plays', value: totalPlays, suffix: '', icon: '\uD83D\uDD25' },
                { label: 'Collections', value: playlists.length, suffix: '', icon: '\uD83D\uDCBF' },
              ].map((stat) => (
                <div key={stat.label} className="stat-card" style={{
                  textAlign: 'center', padding: '40px 24px', background: 'var(--bg-card)',
                }}>
                  <div className="stat-icon" style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>
                    {stat.icon}
                  </div>
                  <div className="stat-number" style={{
                    fontSize: 'var(--text-4xl)', marginBottom: 6,
                    color: 'var(--text-primary)', fontWeight: 800,
                  }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="stat-label" style={{
                    fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* Stats mobile overrides */}
        <style>{`
          @media (max-width: 768px) {
            .stats-section {
              padding: 56px 16px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 1px !important;
              border-radius: var(--radius) !important;
            }
            .stat-card {
              padding: 28px 16px !important;
            }
            .stat-card:last-child {
              grid-column: 1 / -1;
            }
            .stat-icon {
              font-size: 22px !important;
              margin-bottom: 8px !important;
            }
            .stat-number {
              font-size: var(--text-3xl) !important;
            }
            .stat-label {
              font-size: 10px !important;
              letter-spacing: 0.14em !important;
            }
          }
        `}</style>

        {/* ═══ FEATURED ═══ */}
        {featured.length > 0 && (
          <RevealSection>
            <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 96px' }}>
              <SectionHeading label="Spotlight" title="Featured" subtitle="Hand-picked selections" />
              <FeaturedCarousel
                beats={featured}
                playBeat={(b) => playBeat(b, beats)}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
              />
            </section>
          </RevealSection>
        )}

        {/* ═══ TRENDING NOW ═══ */}
        <RevealSection>
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 96px' }}>
            <SectionHeading
              label="Hot right now"
              title="Trending"
              subtitle="Most played beats this month"
              action="View All"
              actionTo="/beats?sort=popular"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.06} />)
                : trending.slice(0, 4).map((beat, i) => (
                  <BeatCard
                    key={beat.id}
                    beat={beat}
                    index={i}
                    playBeat={(b) => playBeat(b, beats)}
                    currentBeat={currentBeat}
                    isPlaying={isPlaying}
                    liked={likedBeats.has(beat.id)}
                    toggleLike={() => toggleLike(beat.id)}
                    onLicense={() => openLicensing(beat)}
                  />
                ))
              }
            </div>
          </section>
        </RevealSection>

        {/* ═══ NEW RELEASES ═══ */}
        <RevealSection>
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 96px' }}>
            <SectionHeading
              label="Just dropped"
              title="New Releases"
              subtitle="Fresh beats hot off the studio"
              action="View All"
              actionTo="/beats?sort=newest"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.06} />)
                : newest.slice(0, 4).map((beat, i) => (
                  <BeatCard
                    key={beat.id}
                    beat={beat}
                    index={i}
                    playBeat={(b) => playBeat(b, beats)}
                    currentBeat={currentBeat}
                    isPlaying={isPlaying}
                    liked={likedBeats.has(beat.id)}
                    toggleLike={() => toggleLike(beat.id)}
                    onLicense={() => openLicensing(beat)}
                  />
                ))
              }
            </div>
          </section>
        </RevealSection>

        {/* ═══ COLLECTIONS ═══ */}
        {loading && genreSections.length === 0 ? (
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
            <SectionHeading label="Explore" title="Collections" subtitle="Browse beats by genre" />
            {[1, 2].map(i => (
              <div key={i} style={{ marginBottom: 48 }}>
                <div className="skeleton" style={{ height: 24, width: 180, marginBottom: 20, borderRadius: 6 }} />
                <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="skeleton" style={{ minWidth: 260, height: 320, borderRadius: 'var(--radius)', flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : genreSections.length > 0 ? (
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
            <SectionHeading label="Explore" title="Collections" subtitle="Browse beats by genre" />
            {genreSections.map((sec) => (
              <QuickAccessRow
                key={sec.title}
                title={sec.title}
                subtitle={sec.subtitle}
                beats={sec.beats}
                allBeats={beats}
                playBeat={playBeat}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
                likedBeats={likedBeats}
                toggleLike={toggleLike}
                openLicensing={openLicensing}
              />
            ))}
          </section>
        ) : null}

        {/* ═══ TESTIMONIALS ═══ */}
        <RevealSection>
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 96px' }}>
            <SectionHeading
              label="Community"
              title="What Artists Say"
              subtitle="Trusted by producers and artists worldwide"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 32,
                    border: '1px solid var(--border)', position: 'relative',
                    transition: 'all 0.3s var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Icons.Star key={s} filled={s < (t.rating || 5)} />
                    ))}
                  </div>
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-normal)', marginBottom: 24,
                  }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${t.color || 'var(--accent)'}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--text-base)', fontWeight: 700, color: t.color || 'var(--accent)',
                    }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ═══ CTA ═══ */}
        <RevealSection>
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 120px', textAlign: 'center' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '80px 32px',
              position: 'relative', overflow: 'hidden',
            }}>
              <h2 style={{
                fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 16,
                letterSpacing: 'var(--tracking-tight)', position: 'relative',
              }}>
                Need Something Custom?
              </h2>
              <p style={{
                color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: 40,
                maxWidth: 500, margin: '0 auto 40px', lineHeight: 'var(--leading-normal)', position: 'relative',
              }}>
                Let&apos;s create something unique for your project. Custom beats, exclusive production, and more.
              </p>
              <Link
                to="/custom"
                className="btn-primary"
                style={{
                  padding: '18px 44px', background: 'var(--accent)', color: '#000', fontSize: 'var(--text-base)',
                  textDecoration: 'none', display: 'inline-block', position: 'relative',
                }}
              >
                Get In Touch
              </Link>
            </div>
          </section>
        </RevealSection>

        <Footer />
      </div>
    </>
  );
}

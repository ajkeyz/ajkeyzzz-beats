import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Icons from '../components/Icons';
import Footer from '../components/Footer';
import BeatCard from '../components/BeatCard';
import CoverArt from '../components/CoverArt';
import Waveform from '../components/Waveform';
import { useToast } from '../components/Toast';
import { fetchBeatBySlug, fetchBeats } from '../lib/data';
import { LICENSE_TIERS, MOOD_OPTIONS } from '../lib/seeds';
import { formatTime, formatPrice } from '../lib/utils';
import { trackBeatView } from '../lib/analytics';

const moodColorMap = Object.fromEntries(MOOD_OPTIONS.map(m => [m.name, m.color]));

function ShareButtons({ beat }) {
  const { success } = useToast();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `Check out "${beat.title}" by AJKEYZZZ`;

  const share = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    if (platform === 'copy') {
      navigator.clipboard?.writeText(url).then(() => success('Link copied!'));
      return;
    }
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { id: 'twitter', label: 'Share on X' },
        { id: 'facebook', label: 'Share on Facebook' },
        { id: 'copy', label: 'Copy link' },
      ].map(({ id, label }) => (
        <motion.button
          key={id}
          whileTap={{ scale: 0.9 }}
          onClick={() => share(id)}
          title={label}
          style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          {id === 'twitter' && '𝕏'}
          {id === 'facebook' && 'f'}
          {id === 'copy' && <Icons.Copy />}
        </motion.button>
      ))}
    </div>
  );
}

export default function BeatDetailPage({ playBeat, currentBeat, isPlaying, progress, seek, likedBeats, toggleLike, openLicensing }) {
  const { slug } = useParams();
  const [beat, setBeat] = useState(null);
  const [similarBeats, setSimilarBeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBeatBySlug(slug),
      fetchBeats(),
    ]).then(([beatData, allBeats]) => {
      setBeat(beatData);
      if (beatData) {
        trackBeatView(beatData.id, beatData.title);
        // Score-based similar beats
        const similar = allBeats
          .filter(b => b.id !== beatData.id)
          .map(b => {
            let score = 0;
            if (b.genre === beatData.genre) score += 3;
            if (Math.abs(b.bpm - beatData.bpm) <= 15) score += 2;
            if (b.musical_key === beatData.musical_key) score += 2;
            const sharedMoods = (b.moods || []).filter(m => (beatData.moods || []).includes(m)).length;
            score += sharedMoods;
            const sharedTags = (b.tags || []).filter(t => (beatData.tags || []).includes(t)).length;
            score += sharedTags;
            return { ...b, _score: score };
          })
          .filter(b => b._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 4);
        setSimilarBeats(similar);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ paddingTop: 100, maxWidth: 1000, margin: '0 auto', padding: '100px 24px 80px' }}>
        <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 300, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!beat) {
    return (
      <div style={{ paddingTop: 100, textAlign: 'center', padding: '200px 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Beat not found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This beat may have been removed or the link is incorrect.</p>
        <Link to="/beats" style={{
          padding: '12px 28px', borderRadius: 50, background: 'var(--accent)',
          color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
        }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const color = beat.cover_color || '#E84393';
  const isActive = currentBeat?.id === beat.id;

  return (
    <>
      <Helmet>
        <title>{beat.title} — AJKEYZZZ Beats</title>
        <meta name="description" content={beat.description || `${beat.title} — ${beat.typebeat}. ${beat.bpm} BPM, ${beat.musical_key || ''} ${beat.genre}. License this beat from AJKEYZZZ.`} />
        <meta property="og:title" content={`${beat.title} — AJKEYZZZ Beats`} />
        <meta property="og:description" content={`${beat.typebeat || beat.genre} · ${beat.bpm} BPM`} />
        <meta property="og:type" content="music.song" />
        {beat.cover_art_url && <meta property="og:image" content={beat.cover_art_url} />}
        <link rel="canonical" href={`https://ajkeyzzz.com/beats/${beat.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MusicRecording',
          name: beat.title,
          description: beat.description || `${beat.typebeat} - ${beat.genre} beat at ${beat.bpm} BPM`,
          duration: `PT${Math.floor((beat.duration || 0) / 60)}M${Math.floor((beat.duration || 0) % 60)}S`,
          genre: beat.genre,
          creator: { '@type': 'Person', name: 'AJKEYZZZ' },
          offers: {
            '@type': 'Offer',
            price: beat.price_basic || 29.99,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        })}</script>
      </Helmet>

      {/* Blurred Hero Header */}
      <div style={{
        position: 'relative', paddingTop: 64, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 80% 80% at 50% 0%, ${color}30 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 20% 80%, ${color}15 0%, transparent 50%),
            var(--bg-primary)
          `,
          filter: 'blur(0px)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 300,
          background: beat.cover_art_url
            ? `url(${beat.cover_art_url}) center/cover`
            : `linear-gradient(135deg, ${color}22, ${color}08)`,
          filter: 'blur(60px) saturate(150%)', opacity: 0.5,
        }} />

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '40px 24px 0' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 32, fontSize: 13, color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link to="/beats" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Catalog</Link>
            {' / '}
            <span style={{ color: 'var(--text-secondary)' }}>{beat.title}</span>
          </div>

          {/* Main content */}
          <div className="beat-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 64 }}>
            {/* Left: Cover + Play */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CoverArt
                beat={beat}
                isPlaying={isPlaying}
                isActive={isActive}
                showGlow={true}
                kenBurns={true}
                onClick={() => playBeat(beat)}
                style={{ boxShadow: `0 20px 60px ${color}22` }}
              >
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.3s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
                >
                  {isActive && isPlaying ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          width: 5, borderRadius: 2, background: '#fff',
                          animation: `waveform 0.6s ease-in-out ${i * 0.12}s infinite`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}>
                      <Icons.Play />
                    </div>
                  )}
                </div>
              </CoverArt>
            </motion.div>

            {/* Right: Metadata + Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>{beat.title}</h1>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>{beat.typebeat}</p>

              {/* Share + like */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                <ShareButtons beat={beat} />
              </div>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'BPM', value: beat.bpm },
                  { label: 'Key', value: beat.musical_key || '—' },
                  { label: 'Duration', value: formatTime(beat.duration) },
                  { label: 'Genre', value: beat.genre },
                  { label: 'Plays', value: (beat.plays || 0).toLocaleString() },
                ].map((m) => (
                  <div key={m.label} style={{
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '14px 16px',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--mono)' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Tags + moods */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {(beat.tags || []).map((tag) => (
                  <Link
                    key={tag}
                    to={`/beats?q=${encodeURIComponent(tag)}`}
                    style={{
                      fontSize: 12, padding: '4px 14px', borderRadius: 20,
                      background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                      textDecoration: 'none', border: '1px solid var(--border)',
                    }}
                  >
                    #{tag}
                  </Link>
                ))}
                {(beat.moods || []).map((m) => (
                  <Link
                    key={m}
                    to={`/beats?mood=${encodeURIComponent(m)}`}
                    style={{
                      fontSize: 12, padding: '4px 14px', borderRadius: 20,
                      background: `${moodColorMap[m] || '#636E72'}15`,
                      color: moodColorMap[m] || 'var(--text-secondary)',
                      textDecoration: 'none', fontWeight: 500,
                    }}
                  >
                    {m}
                  </Link>
                ))}
              </div>

              {beat.description && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                  {beat.description}
                </p>
              )}

              {/* Waveform */}
              <div style={{
                marginBottom: 28, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                padding: '16px 20px', border: '1px solid var(--border)',
              }}>
                <Waveform
                  audioUrl={beat.preview_url}
                  progress={isActive ? progress : 0}
                  color={color}
                  height={56}
                  onSeek={isActive ? seek : () => playBeat(beat)}
                  isPlaying={isActive && isPlaying}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playBeat(beat)}
                  style={{
                    padding: '14px 32px', borderRadius: 50, background: color,
                    border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: `0 0 20px ${color}33`,
                  }}
                >
                  {isActive && isPlaying ? <Icons.Pause /> : <Icons.Play />}
                  {isActive && isPlaying ? 'Pause' : 'Play Preview'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openLicensing(beat)}
                  style={{
                    padding: '14px 32px', borderRadius: 50, background: 'transparent',
                    border: `1px solid ${color}44`, color: color, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  License This Beat
                </motion.button>
                <button
                  onClick={() => toggleLike(beat.id)}
                  style={{
                    padding: '14px', borderRadius: '50%', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', cursor: 'pointer', display: 'flex',
                    color: 'var(--text-muted)',
                  }}
                  aria-label={likedBeats.has(beat.id) ? 'Unlike' : 'Like'}
                >
                  <Icons.Heart filled={likedBeats.has(beat.id)} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* License tiers + similar beats */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>License Options</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {LICENSE_TIERS.map((tier) => {
              const price = beat[tier.priceKey] || tier.defaultPrice;
              return (
                <motion.div
                  key={tier.id}
                  whileHover={{ y: -4 }}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: 24,
                    border: tier.popular ? `1px solid ${tier.accent}44` : '1px solid var(--border)',
                    position: 'relative', transition: 'box-shadow 0.3s',
                  }}
                >
                  {tier.popular && (
                    <div style={{
                      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                      background: tier.accent, padding: '3px 12px', borderRadius: 20,
                      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#fff',
                    }}>
                      Popular
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: tier.accent, marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{formatPrice(price)}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {tier.features.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                        <span style={{ color: tier.accent }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openLicensing(beat)}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 50,
                      background: tier.popular ? tier.accent : 'transparent',
                      border: tier.popular ? 'none' : `1px solid ${tier.accent}33`,
                      color: tier.popular ? '#fff' : tier.accent,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    Select
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {similarBeats.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Similar Beats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {similarBeats.map((b, i) => (
                <BeatCard
                  key={b.id}
                  beat={b}
                  index={i}
                  playBeat={playBeat}
                  currentBeat={currentBeat}
                  isPlaying={isPlaying}
                  liked={likedBeats.has(b.id)}
                  toggleLike={() => toggleLike(b.id)}
                  onLicense={() => openLicensing(b)}
                />
              ))}
            </div>
          </section>
        )}

        <style>{`
          @media (max-width: 768px) {
            .beat-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
          }
        `}</style>

        <Footer />
      </div>
    </>
  );
}

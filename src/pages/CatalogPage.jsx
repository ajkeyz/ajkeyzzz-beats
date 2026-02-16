import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import BeatCard from '../components/BeatCard';
import BeatRow from '../components/BeatRow';
import BeatComparison from '../components/BeatComparison';
import Footer from '../components/Footer';
import Icons from '../components/Icons';
import { SkeletonCard, SkeletonRow } from '../components/SkeletonCard';
import PullToRefresh from '../components/PullToRefresh';
import { fetchBeats } from '../lib/data';
import { GENRE_OPTIONS, MOOD_OPTIONS, MUSICAL_KEYS } from '../lib/seeds';

const PAGE_SIZE = 12;

// ─── BPM RANGE SLIDER ───
function BpmRangeSlider({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const valuesRef = useRef({ min: localMin, max: localMax });

  useEffect(() => { setLocalMin(min); setLocalMax(max); valuesRef.current = { min, max }; }, [min, max]);

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), localMax - 5);
    setLocalMin(v);
    valuesRef.current.min = v;
  };
  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), localMin + 5);
    setLocalMax(v);
    valuesRef.current.max = v;
  };
  const commit = () => onChange(valuesRef.current.min, valuesRef.current.max);

  const pctMin = ((localMin - 60) / (200 - 60)) * 100;
  const pctMax = ((localMax - 60) / (200 - 60)) * 100;

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{localMin} BPM</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{localMax} BPM</span>
      </div>
      <div className="range-slider" style={{ position: 'relative', height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
        <div style={{
          position: 'absolute', height: '100%', borderRadius: 2,
          left: `${pctMin}%`, right: `${100 - pctMax}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent-purple))',
        }} />
        <input type="range" min={60} max={200} step={5} value={localMin}
          onChange={handleMinChange}
          onMouseUp={commit} onTouchEnd={commit}
          style={{ position: 'absolute', width: '100%', top: -6, height: 16, background: 'transparent', pointerEvents: 'none', zIndex: 2 }}
        />
        <input type="range" min={60} max={200} step={5} value={localMax}
          onChange={handleMaxChange}
          onMouseUp={commit} onTouchEnd={commit}
          style={{ position: 'absolute', width: '100%', top: -6, height: 16, background: 'transparent', pointerEvents: 'none', zIndex: 3 }}
        />
      </div>
    </div>
  );
}

// ─── FILTER PANEL ───
function FilterPanel({
  searchParams, updateParam, clearFilters,
  genreFilter, moodFilter, keyFilter, sortBy,
  bpmMin, bpmMax, stemsOnly,
  genreCounts, moodCounts, beats, hasFilters,
}) {
  const [showMore, setShowMore] = useState(false);
  const activeMoods = MOOD_OPTIONS.filter(m => moodCounts[m.name] > 0);

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)',
        borderRadius: 'var(--radius-pill)', padding: '12px 24px', marginBottom: 20,
        border: '1px solid var(--border)', maxWidth: 480,
        transition: 'border-color var(--duration-normal)',
      }}>
        <Icons.Search />
        <input
          type="text" placeholder="Search beats, genres, moods, keys..."
          value={searchParams.get('q') || ''}
          onChange={(e) => updateParam('q', e.target.value)}
          style={{
            background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)', width: '100%', fontFamily: 'var(--font)',
          }}
          aria-label="Search beats"
        />
      </div>

      {/* Genre pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => updateParam('genre', '')}
          style={{
            padding: '8px 18px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font)',
            border: !genreFilter ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: !genreFilter ? 'var(--accent)15' : 'transparent',
            color: !genreFilter ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'all var(--duration-normal) var(--ease-out)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          All
          <span style={{
            fontSize: 'var(--text-xs)', background: !genreFilter ? 'var(--accent)22' : 'var(--bg-tertiary)',
            padding: '1px 7px', borderRadius: 10, fontWeight: 600,
          }}>
            {beats.length}
          </span>
        </button>
        {GENRE_OPTIONS.map((g) => {
          const count = genreCounts[g] || 0;
          if (count === 0) return null;
          const isActive = genreFilter === g;
          return (
            <button key={g}
              onClick={() => updateParam('genre', isActive ? '' : g)}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'var(--accent)15' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all var(--duration-normal) var(--ease-out)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {g}
              <span style={{
                fontSize: 'var(--text-xs)', background: isActive ? 'var(--accent)22' : 'var(--bg-tertiary)',
                padding: '1px 7px', borderRadius: 10, fontWeight: 600,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mood tags */}
      {activeMoods.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: 4, fontWeight: 500 }}>Mood</span>
          {activeMoods.map((m) => {
            const isActive = moodFilter === m.name;
            return (
              <button key={m.name}
                onClick={() => updateParam('mood', isActive ? '' : m.name)}
                style={{
                  padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  border: isActive ? `1px solid ${m.color}` : '1px solid var(--border)',
                  background: isActive ? `${m.color}18` : 'transparent',
                  color: isActive ? m.color : 'var(--text-muted)',
                  transition: 'all var(--duration-normal) var(--ease-out)',
                }}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced filters toggle */}
      <button onClick={() => setShowMore(!showMore)} style={{
        fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none',
        border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
        display: 'flex', alignItems: 'center', gap: 4, marginBottom: showMore ? 16 : 0, padding: '4px 0',
      }}>
        {showMore ? 'Less filters' : 'More filters'}
        <span style={{ fontSize: 10, transform: showMore ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>&#9660;</span>
      </button>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
              padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', marginBottom: 8,
            }}>
              {/* BPM Range */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  BPM Range
                </label>
                <BpmRangeSlider
                  min={bpmMin || 60} max={bpmMax || 200}
                  onChange={(mn, mx) => { updateParam('bpm_min', mn > 60 ? String(mn) : ''); updateParam('bpm_max', mx < 200 ? String(mx) : ''); }}
                />
              </div>

              {/* Duration */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Duration
                </label>
                <select value={searchParams.get('duration') || ''} onChange={e => updateParam('duration', e.target.value)} style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none',
                }}>
                  <option value="">Any</option>
                  <option value="0-120">Under 2 min</option>
                  <option value="120-180">2–3 min</option>
                  <option value="180-240">3–4 min</option>
                  <option value="240-999">Over 4 min</option>
                </select>
              </div>

              {/* Key dropdown */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Musical Key
                </label>
                <select value={keyFilter} onChange={(e) => updateParam('key', e.target.value)} style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none',
                }}>
                  <option value="">All Keys</option>
                  {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Sort By
                </label>
                <select value={sortBy} onChange={(e) => updateParam('sort', e.target.value)} style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none',
                }}>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="bpm_asc">BPM Low → High</option>
                  <option value="bpm_desc">BPM High → Low</option>
                  <option value="title">Title A → Z</option>
                  <option value="price_asc">Price Low → High</option>
                </select>
              </div>

              {/* Stems toggle */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Options
                </label>
                <button onClick={() => updateParam('stems', stemsOnly ? '' : '1')} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  background: stemsOnly ? 'var(--accent)12' : 'var(--bg-tertiary)',
                  border: stemsOnly ? '1px solid var(--accent)44' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)', cursor: 'pointer',
                  color: stemsOnly ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', width: '100%',
                  transition: 'all var(--duration-normal)',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: stemsOnly ? '2px solid var(--accent)' : '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: stemsOnly ? 'var(--accent)' : 'transparent',
                    transition: 'all var(--duration-normal)',
                  }}>
                    {stemsOnly && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  Stems included
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasFilters && (
        <div style={{ marginTop: 12 }}>
          <button onClick={clearFilters} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)',
            cursor: 'pointer', fontFamily: 'var(--font)', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
          }}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ───
export default function CatalogPage({ playBeat, currentBeat, isPlaying, likedBeats, toggleLike, openLicensing }) {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareBeats, setCompareBeats] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const searchQuery = searchParams.get('q') || '';
  const genreFilter = searchParams.get('genre') || '';
  const moodFilter = searchParams.get('mood') || '';
  const keyFilter = searchParams.get('key') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const bpmMin = parseInt(searchParams.get('bpm_min')) || 0;
  const bpmMax = parseInt(searchParams.get('bpm_max')) || 300;
  const stemsOnly = searchParams.get('stems') === '1';

  const sentinelRef = useRef(null);

  useEffect(() => { fetchBeats().then((data) => { setBeats(data); setLoading(false); }); }, []);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilters = () => { setSearchParams({}, { replace: true }); setVisibleCount(PAGE_SIZE); };

  const filteredBeats = useMemo(() => {
    let result = [...beats];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q) ||
        (b.typebeat || '').toLowerCase().includes(q) || (b.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (b.musical_key || '').toLowerCase().includes(q) || (b.moods || []).some(m => m.toLowerCase().includes(q))
      );
    }
    if (genreFilter) result = result.filter(b => b.genre === genreFilter);
    if (moodFilter) result = result.filter(b => (b.moods || []).includes(moodFilter));
    if (keyFilter) result = result.filter(b => b.musical_key === keyFilter);
    if (stemsOnly) result = result.filter(b => b.stems_url);
    if (bpmMin > 0) result = result.filter(b => b.bpm >= bpmMin);
    if (bpmMax < 300) result = result.filter(b => b.bpm <= bpmMax);

    const durationFilter = searchParams.get('duration');
    if (durationFilter) {
      const [minDur, maxDur] = durationFilter.split('-').map(Number);
      result = result.filter(b => (b.duration || 0) >= minDur && (b.duration || 0) <= maxDur);
    }

    switch (sortBy) {
      case 'popular': result.sort((a, b) => (b.plays || 0) - (a.plays || 0)); break;
      case 'bpm_asc': result.sort((a, b) => a.bpm - b.bpm); break;
      case 'bpm_desc': result.sort((a, b) => b.bpm - a.bpm); break;
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'price_asc': result.sort((a, b) => (a.price_basic || 0) - (b.price_basic || 0)); break;
      case 'newest': default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
    }
    return result;
  }, [beats, searchQuery, genreFilter, moodFilter, keyFilter, sortBy, bpmMin, bpmMax, stemsOnly, searchParams]);

  const genreCounts = useMemo(() => { const c = {}; beats.forEach(b => { c[b.genre] = (c[b.genre] || 0) + 1; }); return c; }, [beats]);
  const moodCounts = useMemo(() => { const c = {}; beats.forEach(b => { (b.moods || []).forEach(m => { c[m] = (c[m] || 0) + 1; }); }); return c; }, [beats]);

  const visibleBeats = filteredBeats.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBeats.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredBeats.length));
    }, { rootMargin: '200px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredBeats.length]);

  const toggleCompare = useCallback((beat) => {
    setCompareBeats(prev => {
      if (prev.find(b => b.id === beat.id)) return prev.filter(b => b.id !== beat.id);
      if (prev.length >= 2) return [prev[1], beat];
      return [...prev, beat];
    });
  }, []);

  const hasFilters = searchQuery || genreFilter || moodFilter || keyFilter || stemsOnly || bpmMin > 0 || bpmMax < 300 || searchParams.get('duration');
  const activeFilterCount = [searchQuery, genreFilter, moodFilter, keyFilter, stemsOnly, bpmMin > 60, bpmMax < 200].filter(Boolean).length;
  const handleRefresh = useCallback(() => fetchBeats().then(setBeats), []);

  return (
    <>
      <Helmet>
        <title>Beat Catalog — AJKEYZZZ</title>
        <meta name="description" content="Browse and preview beats by AJKEYZZZ. Filter by genre, BPM, key, and more." />
      </Helmet>

      <PullToRefresh onRefresh={handleRefresh}>
      <div style={{ paddingTop: 100, maxWidth: 1280, margin: '0 auto', padding: '100px 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 8, letterSpacing: 'var(--tracking-tight)' }}>
            Beat Catalog
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 'var(--text-base)' }}>
            Explore, listen, and find your sound
          </p>
        </motion.div>

        {/* Desktop filters - hidden on mobile via CSS */}
        <div className="desktop-filters">
          <FilterPanel
            searchParams={searchParams} updateParam={updateParam} clearFilters={clearFilters}
            genreFilter={genreFilter} moodFilter={moodFilter} keyFilter={keyFilter} sortBy={sortBy}
            bpmMin={bpmMin} bpmMax={bpmMax} stemsOnly={stemsOnly}
            genreCounts={genreCounts} moodCounts={moodCounts} beats={beats} hasFilters={hasFilters}
          />
        </div>

        {/* Mobile filter button - visible only on mobile */}
        <button
          className="mobile-filter-btn"
          onClick={() => setShowMobileFilters(true)}
          style={{
            display: 'none',
            padding: '10px 20px', borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 16,
            gap: 8, alignItems: 'center',
          }}
        >
          <Icons.Filter /> Filters {hasFilters ? `(${activeFilterCount})` : ''}
        </button>

        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div onClick={() => setShowMobileFilters(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: '20px 20px 0 0', padding: '24px 24px 32px',
              maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border)', borderBottom: 'none',
              animation: 'slideUpDrawer 0.3s ease-out',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20,
                }}>&#10005;</button>
              </div>
              <FilterPanel
                searchParams={searchParams} updateParam={updateParam} clearFilters={clearFilters}
                genreFilter={genreFilter} moodFilter={moodFilter} keyFilter={keyFilter} sortBy={sortBy}
                bpmMin={bpmMin} bpmMax={bpmMax} stemsOnly={stemsOnly}
                genreCounts={genreCounts} moodCounts={moodCounts} beats={beats} hasFilters={hasFilters}
              />
              <button onClick={() => setShowMobileFilters(false)} style={{
                width: '100%', padding: '14px 0', borderRadius: 50, background: 'var(--accent)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font)', marginTop: 20,
              }}>
                Show {filteredBeats.length} beats
              </button>
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .mobile-filter-btn { display: flex !important; }
            .desktop-filters { display: none !important; }
          }
          @keyframes slideUpDrawer {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Results bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {filteredBeats.length} beat{filteredBeats.length !== 1 ? 's' : ''}{sortBy !== 'newest' ? ` \u00b7 ${{ newest: 'Newest', popular: 'Most Popular', bpm_asc: 'BPM \u2191', bpm_desc: 'BPM \u2193', title: 'A\u2013Z', price_asc: 'Price \u2191' }[sortBy] || sortBy}` : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <AnimatePresence>
              {compareBeats.length > 0 && (
                <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => compareBeats.length >= 2 && setShowCompare(true)}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: 'var(--text-xs)', background: compareBeats.length >= 2 ? 'var(--accent)' : 'var(--bg-tertiary)', color: compareBeats.length >= 2 ? '#fff' : 'var(--text-muted)' }}
                >
                  Compare ({compareBeats.length}/2)
                </motion.button>
              )}
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 2, background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', padding: 2, border: '1px solid var(--border)' }}>
              {['grid', 'list'].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: viewMode === mode ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex',
                }} aria-label={`${mode} view`}>
                  {mode === 'grid' ? <Icons.Grid /> : <Icons.List />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Beat list */}
        {loading ? (
          viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.06} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.04} />)}
            </div>
          )
        ) : filteredBeats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 'var(--text-lg)', marginBottom: 8 }}>No beats found</div>
            <div style={{ fontSize: 'var(--text-sm)', marginBottom: 24 }}>Try different filters</div>
            {hasFilters && <button onClick={clearFilters} className="btn-ghost">Clear filters</button>}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="content-loaded" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {visibleBeats.map((beat, i) => (
              <BeatCard key={beat.id} beat={beat} index={i}
                playBeat={(b) => playBeat(b, filteredBeats)} currentBeat={currentBeat} isPlaying={isPlaying}
                liked={likedBeats.has(beat.id)} toggleLike={() => toggleLike(beat.id)}
                onLicense={() => openLicensing(beat)}
                comparing={compareBeats.some(c => c.id === beat.id)} onCompare={() => toggleCompare(beat)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="beat-row-grid" style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 60px 80px 100px',
              padding: '12px 16px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', borderBottom: '1px solid var(--border)',
            }}>
              <span>#</span><span>Title</span><span className="beat-row-genre">Genre</span>
              <span className="beat-row-bpm" style={{ textAlign: 'center' }}>BPM</span><span className="beat-row-key" style={{ textAlign: 'center' }}>Key</span>
              <span className="beat-row-plays" style={{ textAlign: 'center' }}>Plays</span><span></span>
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
            {visibleBeats.map((beat, i) => (
              <BeatRow key={beat.id} beat={beat} index={i}
                playBeat={(b) => playBeat(b, filteredBeats)} currentBeat={currentBeat} isPlaying={isPlaying}
                liked={likedBeats.has(beat.id)} toggleLike={() => toggleLike(beat.id)}
                onLicense={() => openLicensing(beat)}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {!hasMore && filteredBeats.length > PAGE_SIZE && (
          <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Showing all {filteredBeats.length} beats
          </p>
        )}
        <div style={{ height: 40 }} />
        <Footer />
      </div>
      </PullToRefresh>

      <AnimatePresence>
        {showCompare && compareBeats.length >= 2 && (
          <BeatComparison beats={compareBeats} onClose={() => setShowCompare(false)}
            onPlay={(b) => playBeat(b, filteredBeats)} currentBeat={currentBeat} isPlaying={isPlaying}
          />
        )}
      </AnimatePresence>
    </>
  );
}

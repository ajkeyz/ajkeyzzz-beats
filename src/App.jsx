import { useState, useEffect, useRef, useCallback } from "react";

// ─── STORAGE KEYS ───
const BEATS_KEY = "ajkeyzzz-beats-v2";
const MESSAGES_KEY = "ajkeyzzz-messages";
const ADMIN_KEY = "ajkeyzzz-admin-session";
const PLAYLISTS_KEY = "ajkeyzzz-playlists";

// ─── SEED DATA ───
const SEED_BEATS = [
  {
    id: "1",
    title: "hearts",
    genre: "Alté",
    bpm: 140,
    typebeat: "amaarae type beat",
    tags: ["alte", "amaarae"],
    coverColor: "#E84393",
    coverEmoji: "💗",
    dateAdded: "2025-01-15",
    plays: 342,
    likes: 87,
    duration: 198,
    featured: true,
    playlist: "alte",
  },
  {
    id: "2",
    title: "balance",
    genre: "Alté",
    bpm: 96,
    typebeat: "amaarae type beat",
    tags: ["alte", "amaarae"],
    coverColor: "#2D3436",
    coverEmoji: "⚖️",
    dateAdded: "2025-01-10",
    plays: 218,
    likes: 54,
    duration: 174,
    featured: true,
    playlist: "alte",
  },
  {
    id: "3",
    title: "palmwine",
    genre: "Alté",
    bpm: 90,
    typebeat: "boj type beat",
    tags: ["alte", "boj"],
    coverColor: "#00B894",
    coverEmoji: "🌴",
    dateAdded: "2025-01-08",
    plays: 189,
    likes: 41,
    duration: 210,
    featured: true,
    playlist: "alte",
  },
  {
    id: "4",
    title: "away",
    genre: "Alté",
    bpm: 99,
    typebeat: "odumodu type beat",
    tags: ["alte", "odumodu"],
    coverColor: "#636E72",
    coverEmoji: "🌊",
    dateAdded: "2025-01-05",
    plays: 156,
    likes: 33,
    duration: 186,
    featured: true,
    playlist: "alte",
  },
  {
    id: "5",
    title: "midnight cruise",
    genre: "Afro Swing",
    bpm: 108,
    typebeat: "burna boy type beat",
    tags: ["afroswing", "burna"],
    coverColor: "#0984E3",
    coverEmoji: "🌙",
    dateAdded: "2025-02-01",
    plays: 421,
    likes: 112,
    duration: 204,
    featured: false,
    playlist: "afro-swing",
  },
  {
    id: "6",
    title: "jollof",
    genre: "Afro Swing",
    bpm: 115,
    typebeat: "rema type beat",
    tags: ["afroswing", "rema"],
    coverColor: "#D63031",
    coverEmoji: "🍛",
    dateAdded: "2025-02-05",
    plays: 305,
    likes: 78,
    duration: 192,
    featured: false,
    playlist: "afro-swing",
  },
  {
    id: "7",
    title: "golden hour",
    genre: "Alté",
    bpm: 85,
    typebeat: "tems type beat",
    tags: ["alte", "tems"],
    coverColor: "#FDCB6E",
    coverEmoji: "☀️",
    dateAdded: "2025-02-10",
    plays: 267,
    likes: 65,
    duration: 216,
    featured: false,
    playlist: "alte",
  },
  {
    id: "8",
    title: "lagos nights",
    genre: "Afro Swing",
    bpm: 120,
    typebeat: "wizkid type beat",
    tags: ["afroswing", "wizkid"],
    coverColor: "#6C5CE7",
    coverEmoji: "🌃",
    dateAdded: "2025-02-12",
    plays: 534,
    likes: 145,
    duration: 180,
    featured: false,
    playlist: "afro-swing",
  },
];

const SEED_PLAYLISTS = [
  { id: "alte", name: "Alté", coverColor: "#E84393", coverEmoji: "💗", count: 5 },
  { id: "afro-swing", name: "Afro Swing", coverColor: "#0984E3", coverEmoji: "🎶", count: 3 },
];

const LICENSE_TIERS = [
  {
    name: "Basic Lease",
    price: "$29.99",
    features: ["High Quality MP3", "For Hobby Musicians, YouTubers & Podcasters", "YouTube, SoundCloud, Audiomack"],
    accent: "#636E72",
  },
  {
    name: "Premium Lease",
    price: "$99.99",
    features: ["MP3 & WAV", "DSP Distribution", "Radio Broadcasting Rights", "Monetize YouTube Videos", "Spotify, iTunes & more"],
    accent: "#0984E3",
    popular: true,
  },
  {
    name: "Unlimited Lease",
    price: "$149.99",
    features: ["MP3, WAV & Stems", "Unlimited Distribution", "Radio Broadcasting", "Paid Performances", "All Platforms"],
    accent: "#6C5CE7",
  },
  {
    name: "Exclusive",
    price: "$299.99",
    features: ["MP3, WAV & Stems", "Full Ownership & Control", "Beat Removed From Store", "All Premium Features", "Film, TV, Netflix & More"],
    accent: "#E84393",
  },
];

// ─── ICONS (inline SVG components) ───
const Icons = {
  Play: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  SkipNext: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  ),
  SkipPrev: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#E84393" : "none"} stroke={filled ? "#E84393" : "currentColor"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Share: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Volume: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  YouTube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Twitter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Headphones: () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
};

// ─── UTILITIES ───
const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── MAIN APP ───
export default function AJKEYZZZApp() {
  // Data state
  const [beats, setBeats] = useState(SEED_BEATS);
  const [playlists, setPlaylists] = useState(SEED_PLAYLISTS);
  const [messages, setMessages] = useState([]);

  // UI state
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [showLicensing, setShowLicensing] = useState(false);
  const [licensingBeat, setLicensingBeat] = useState(null);

  // Player state
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [likedBeats, setLikedBeats] = useState(new Set());
  const progressInterval = useRef(null);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState("dashboard");

  // Load stored data from localStorage
  useEffect(() => {
    try {
      const b = localStorage.getItem(BEATS_KEY);
      if (b) setBeats(JSON.parse(b));
    } catch {}
    try {
      const m = localStorage.getItem(MESSAGES_KEY);
      if (m) setMessages(JSON.parse(m));
    } catch {}
    try {
      const p = localStorage.getItem(PLAYLISTS_KEY);
      if (p) setPlaylists(JSON.parse(p));
    } catch {}
    try {
      const a = localStorage.getItem(ADMIN_KEY);
      if (a) setIsAdmin(JSON.parse(a));
    } catch {}
  }, []);

  // Save functions
  const saveBeats = (newBeats) => {
    setBeats(newBeats);
    try { localStorage.setItem(BEATS_KEY, JSON.stringify(newBeats)); } catch {}
  };
  const saveMessages = (newMsgs) => {
    setMessages(newMsgs);
    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(newMsgs)); } catch {}
  };
  const savePlaylists = (newPl) => {
    setPlaylists(newPl);
    try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPl)); } catch {}
  };

  // Simulate playback
  const playBeat = useCallback((beat) => {
    if (currentBeat?.id === beat.id && isPlaying) {
      setIsPlaying(false);
      clearInterval(progressInterval.current);
      return;
    }
    if (currentBeat?.id === beat.id && !isPlaying) {
      setIsPlaying(true);
      startProgress();
      return;
    }
    setCurrentBeat(beat);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);

    // Increment plays
    const updated = beats.map((b) => (b.id === beat.id ? { ...b, plays: b.plays + 1 } : b));
    saveBeats(updated);
    startProgress(beat.duration);
  }, [currentBeat, isPlaying, beats]);

  const startProgress = (duration) => {
    clearInterval(progressInterval.current);
    const dur = duration || currentBeat?.duration || 180;
    progressInterval.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.5;
        if (next >= dur) {
          clearInterval(progressInterval.current);
          setIsPlaying(false);
          // Auto-play next
          const idx = beats.findIndex((b) => b.id === currentBeat?.id);
          if (idx < beats.length - 1) {
            setTimeout(() => playBeat(beats[idx + 1]), 300);
          }
          return 0;
        }
        setProgress((next / dur) * 100);
        return next;
      });
    }, 500);
  };

  const skipNext = () => {
    const idx = beats.findIndex((b) => b.id === currentBeat?.id);
    if (idx < beats.length - 1) playBeat(beats[idx + 1]);
  };
  const skipPrev = () => {
    const idx = beats.findIndex((b) => b.id === currentBeat?.id);
    if (idx > 0) playBeat(beats[idx - 1]);
  };

  const toggleLike = (id) => {
    setLikedBeats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openLicensing = (beat) => {
    setLicensingBeat(beat);
    setShowLicensing(true);
  };

  // Admin login
  const handleAdminLogin = (pass) => {
    if (pass === "ajkeyzzz2025") {
      setIsAdmin(true);
      try { localStorage.setItem(ADMIN_KEY, JSON.stringify(true)); } catch {}
      return true;
    }
    return false;
  };

  // Filter beats
  const filteredBeats = searchQuery
    ? beats.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.typebeat.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : activePlaylist
    ? beats.filter((b) => b.playlist === activePlaylist)
    : beats;

  // ─── STYLES ───
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-primary: #0A0A0B;
      --bg-secondary: #111113;
      --bg-tertiary: #1A1A1D;
      --bg-card: #141416;
      --text-primary: #F5F5F7;
      --text-secondary: #8E8E93;
      --text-muted: #48484A;
      --accent: #E84393;
      --accent-blue: #0984E3;
      --accent-purple: #6C5CE7;
      --accent-green: #00B894;
      --border: rgba(255,255,255,0.06);
      --border-hover: rgba(255,255,255,0.12);
      --glass: rgba(20,20,22,0.85);
      --radius: 16px;
      --radius-sm: 10px;
      --radius-xs: 6px;
      --shadow: 0 8px 32px rgba(0,0,0,0.4);
      --font: 'Outfit', sans-serif;
      --mono: 'Space Mono', monospace;
    }

    html { scroll-behavior: smooth; }
    body { font-family: var(--font); background: var(--bg-primary); color: var(--text-primary); overflow-x: hidden; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 3px; }

    /* Animations */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes waveform {
      0%, 100% { height: 4px; }
      50% { height: 20px; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .fade-in { animation: fadeIn 0.6s ease-out both; }
    .fade-in-1 { animation-delay: 0.1s; }
    .fade-in-2 { animation-delay: 0.2s; }
    .fade-in-3 { animation-delay: 0.3s; }
    .fade-in-4 { animation-delay: 0.4s; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: currentBeat ? 100 : 0 }}>
        {/* Navigation */}
        <Navbar
          page={page}
          setPage={(p) => { setPage(p); setActivePlaylist(null); setSearchQuery(""); setMobileMenuOpen(false); }}
          isAdmin={isAdmin}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        {page === "home" && (
          <HomePage
            beats={beats}
            playlists={playlists}
            playBeat={playBeat}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            likedBeats={likedBeats}
            toggleLike={toggleLike}
            setPage={setPage}
            setActivePlaylist={setActivePlaylist}
            openLicensing={openLicensing}
          />
        )}
        {page === "catalog" && (
          <CatalogPage
            beats={filteredBeats}
            allBeats={beats}
            playlists={playlists}
            playBeat={playBeat}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            likedBeats={likedBeats}
            toggleLike={toggleLike}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activePlaylist={activePlaylist}
            setActivePlaylist={setActivePlaylist}
            openLicensing={openLicensing}
          />
        )}
        {page === "licensing" && <LicensingPage />}
        {page === "custom" && <CustomPage />}
        {page === "contact" && (
          <ContactPage messages={messages} saveMessages={saveMessages} />
        )}
        {page === "admin" && (
          <AdminPanel
            isAdmin={isAdmin}
            handleAdminLogin={handleAdminLogin}
            beats={beats}
            saveBeats={saveBeats}
            playlists={playlists}
            savePlaylists={savePlaylists}
            messages={messages}
            saveMessages={saveMessages}
            adminView={adminView}
            setAdminView={setAdminView}
          />
        )}

        {/* Global Player Bar */}
        {currentBeat && (
          <PlayerBar
            beat={currentBeat}
            isPlaying={isPlaying}
            progress={progress}
            currentTime={currentTime}
            volume={volume}
            setVolume={setVolume}
            onPlayPause={() => {
              if (isPlaying) {
                setIsPlaying(false);
                clearInterval(progressInterval.current);
              } else {
                setIsPlaying(true);
                startProgress(currentBeat.duration);
              }
            }}
            onNext={skipNext}
            onPrev={skipPrev}
            onSeek={(pct) => {
              const newTime = (pct / 100) * currentBeat.duration;
              setCurrentTime(newTime);
              setProgress(pct);
            }}
            liked={likedBeats.has(currentBeat.id)}
            onLike={() => toggleLike(currentBeat.id)}
            onLicense={() => openLicensing(currentBeat)}
          />
        )}

        {/* Licensing Modal */}
        {showLicensing && (
          <LicensingModal beat={licensingBeat} onClose={() => setShowLicensing(false)} />
        )}
      </div>
    </>
  );
}

// ─── NAVBAR ───
function Navbar({ page, setPage, isAdmin, mobileMenuOpen, setMobileMenuOpen }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "catalog", label: "Catalog" },
    { id: "licensing", label: "Licensing" },
    { id: "custom", label: "Custom Production" },
    { id: "contact", label: "Contact" },
  ];
  if (isAdmin) links.push({ id: "admin", label: "Dashboard" });

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(10,10,11,0.88)", backdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div
          style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, letterSpacing: 2, cursor: "pointer", color: "var(--accent)" }}
          onClick={() => setPage("home")}
        >
          AJKEYZZZ
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="desktop-nav">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{
                background: "none", border: "none", color: page === l.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 13, fontFamily: "var(--font)", fontWeight: page === l.id ? 600 : 400, cursor: "pointer",
                letterSpacing: 0.5, transition: "color 0.2s", textTransform: "uppercase",
              }}
            >
              {l.label}
            </button>
          ))}
          <div style={{ display: "flex", gap: 12, marginLeft: 16 }}>
            <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
              <Icons.Instagram />
            </a>
            <a href="https://youtube.com/@ajkeyzzz1927" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
              <Icons.YouTube />
            </a>
            <a href="https://x.com/ajkeyzzz" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
              <Icons.Twitter />
            </a>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", display: "none" }} className="mobile-toggle">
          {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "absolute", top: 64, left: 0, right: 0, background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)", padding: "16px 24px",
        }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "12px 0",
                background: "none", border: "none", color: page === l.id ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 15, fontFamily: "var(--font)", fontWeight: 500, cursor: "pointer",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

// ─── HOME PAGE ───
function HomePage({ beats, playlists, playBeat, currentBeat, isPlaying, likedBeats, toggleLike, setPage, setActivePlaylist, openLicensing }) {
  const featured = beats.filter((b) => b.featured);
  const trending = [...beats].sort((a, b) => b.plays - a.plays).slice(0, 4);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{
        position: "relative", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", textAlign: "center",
      }}>
        {/* Animated bg */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,67,147,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(9,132,227,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 80% 60%, rgba(108,92,231,0.08) 0%, transparent 50%),
            var(--bg-primary)
          `,
        }} />
        {/* Floating waveform */}
        <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 3, alignItems: "flex-end", height: 40 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2, background: `linear-gradient(to top, var(--accent), var(--accent-purple))`,
              opacity: 0.2 + Math.random() * 0.3,
              animation: `waveform ${0.8 + Math.random() * 0.8}s ease-in-out ${i * 0.05}s infinite`,
            }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: "0 24px", maxWidth: 800 }}>
          <div className="fade-in" style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: 4, color: "var(--accent)", marginBottom: 24, textTransform: "uppercase" }}>
            From Lagos to Cali
          </div>
          <h1 className="fade-in fade-in-1" style={{
            fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 900, lineHeight: 0.95,
            letterSpacing: "-0.03em", marginBottom: 24,
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            AJKEYZZZ
          </h1>
          <p className="fade-in fade-in-2" style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 40, fontWeight: 300, lineHeight: 1.6 }}>
            Beats that move the world. Listen first, vibe always.
          </p>
          <div className="fade-in fade-in-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => { if (featured[0]) playBeat(featured[0]); }}
              style={{
                padding: "16px 40px", borderRadius: 50, background: "var(--accent)", border: "none",
                color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)",
                letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8,
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 0 30px rgba(232,67,147,0.3)",
              }}
              onMouseEnter={(e) => { e.target.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
            >
              <Icons.Play /> Start Listening
            </button>
            <button
              onClick={() => setPage("catalog")}
              style={{
                padding: "16px 40px", borderRadius: 50, background: "transparent",
                border: "1px solid var(--border-hover)", color: "var(--text-primary)",
                fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)",
                letterSpacing: 0.5, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "var(--border-hover)"; e.target.style.color = "var(--text-primary)"; }}
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Trending Now</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Most played beats this month</p>
          </div>
          <button onClick={() => setPage("catalog")} style={{
            background: "none", border: "1px solid var(--border)", padding: "8px 20px",
            borderRadius: 50, color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
            fontFamily: "var(--font)", transition: "all 0.2s",
          }}>
            View All
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {trending.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              index={i}
              playBeat={playBeat}
              currentBeat={currentBeat}
              isPlaying={isPlaying}
              liked={likedBeats.has(beat.id)}
              toggleLike={() => toggleLike(beat.id)}
              onLicense={() => openLicensing(beat)}
            />
          ))}
        </div>
      </section>

      {/* Playlists */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Collections</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>Browse beats by genre</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {playlists.map((pl, i) => (
            <div
              key={pl.id}
              className={`fade-in fade-in-${i + 1}`}
              onClick={() => { setActivePlaylist(pl.id); setPage("catalog"); }}
              style={{
                background: `linear-gradient(135deg, ${pl.coverColor}22, ${pl.coverColor}08)`,
                border: `1px solid ${pl.coverColor}33`,
                borderRadius: "var(--radius)", padding: 32, cursor: "pointer",
                transition: "all 0.3s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = pl.coverColor + "66"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = pl.coverColor + "33"; }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{pl.coverEmoji}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{pl.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {beats.filter((b) => b.playlist === pl.id).length} beats
              </div>
              <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.1 }}>
                <Icons.Headphones />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Beats */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Featured Beats</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>Hand-picked selections</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {featured.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              index={i}
              playBeat={playBeat}
              currentBeat={currentBeat}
              isPlaying={isPlaying}
              liked={likedBeats.has(beat.id)}
              toggleLike={() => toggleLike(beat.id)}
              onLicense={() => openLicensing(beat)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px 100px", textAlign: "center",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(232,67,147,0.08), rgba(108,92,231,0.08))",
          border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "64px 32px",
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Need Something Custom?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
            Let's create something unique for your project. Custom beats, exclusive production, and more.
          </p>
          <button
            onClick={() => setPage("contact")}
            style={{
              padding: "16px 40px", borderRadius: 50, background: "var(--accent-purple)", border: "none",
              color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)",
              transition: "transform 0.2s", boxShadow: "0 0 30px rgba(108,92,231,0.3)",
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            Get In Touch
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer setPage={setPage} />
    </div>
  );
}

// ─── BEAT CARD ───
function BeatCard({ beat, index, playBeat, currentBeat, isPlaying, liked, toggleLike, onLicense }) {
  const isActive = currentBeat?.id === beat.id;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`fade-in fade-in-${(index % 4) + 1}`}
      style={{
        background: "var(--bg-card)", borderRadius: "var(--radius)", overflow: "hidden",
        border: isActive ? `1px solid ${beat.coverColor}44` : "1px solid var(--border)",
        transition: "all 0.3s", cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.3)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div
        onClick={() => playBeat(beat)}
        style={{
          aspectRatio: "1", position: "relative",
          background: `linear-gradient(135deg, ${beat.coverColor}33, ${beat.coverColor}11)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 64, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>{beat.coverEmoji}</span>

        {/* Play overlay */}
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered || isActive ? 1 : 0, transition: "opacity 0.3s",
        }}>
          {isActive && isPlaying ? (
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: 4, borderRadius: 2, background: beat.coverColor,
                  animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}>
              <Icons.Play />
            </div>
          )}
        </div>

        {/* BPM badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          fontFamily: "var(--mono)", color: "var(--text-secondary)",
        }}>
          {beat.bpm} BPM
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{beat.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{beat.typebeat}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={(e) => { e.stopPropagation(); toggleLike(); }} style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
              padding: 4, display: "flex",
            }}>
              <Icons.Heart filled={liked} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 20,
            background: `${beat.coverColor}18`, color: beat.coverColor,
            fontWeight: 500,
          }}>
            {beat.genre}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12 }}>
            <span>▶ {beat.plays}</span>
            <span>♡ {beat.likes}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLicense(); }}
            style={{
              background: "none", border: `1px solid ${beat.coverColor}44`,
              padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 500,
              color: beat.coverColor, cursor: "pointer", fontFamily: "var(--font)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.background = beat.coverColor + "22"; }}
            onMouseLeave={(e) => { e.target.style.background = "none"; }}
          >
            License
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CATALOG PAGE ───
function CatalogPage({ beats, allBeats, playlists, playBeat, currentBeat, isPlaying, likedBeats, toggleLike, searchQuery, setSearchQuery, activePlaylist, setActivePlaylist, openLicensing }) {
  return (
    <div style={{ paddingTop: 100, maxWidth: 1280, margin: "0 auto", padding: "100px 24px 80px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Beat Catalog</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 40, fontSize: 16 }}>
        Explore, listen, and find your sound
      </p>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, background: "var(--bg-tertiary)",
          borderRadius: 50, padding: "10px 20px", flex: 1, minWidth: 240, maxWidth: 400,
          border: "1px solid var(--border)",
        }}>
          <Icons.Search />
          <input
            type="text"
            placeholder="Search beats, genres, artists..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActivePlaylist(null); }}
            style={{
              background: "none", border: "none", outline: "none", color: "var(--text-primary)",
              fontSize: 14, width: "100%", fontFamily: "var(--font)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => { setActivePlaylist(null); setSearchQuery(""); }}
            style={{
              padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font)", border: !activePlaylist ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: !activePlaylist ? "var(--accent)" + "22" : "transparent",
              color: !activePlaylist ? "var(--accent)" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            All
          </button>
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => { setActivePlaylist(pl.id); setSearchQuery(""); }}
              style={{
                padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--font)",
                border: activePlaylist === pl.id ? `1px solid ${pl.coverColor}` : "1px solid var(--border)",
                background: activePlaylist === pl.id ? pl.coverColor + "22" : "transparent",
                color: activePlaylist === pl.id ? pl.coverColor : "var(--text-secondary)",
                transition: "all 0.2s",
              }}
            >
              {pl.coverEmoji} {pl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Beat list */}
      {beats.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18 }}>No beats found</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Try a different search term</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "48px 1fr 120px 80px 80px 100px",
            padding: "12px 16px", color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid var(--border)",
          }}>
            <span>#</span>
            <span>Title</span>
            <span>Genre</span>
            <span style={{ textAlign: "center" }}>BPM</span>
            <span style={{ textAlign: "center" }}>Plays</span>
            <span></span>
          </div>
          {beats.map((beat, i) => (
            <BeatRow
              key={beat.id}
              beat={beat}
              index={i}
              playBeat={playBeat}
              currentBeat={currentBeat}
              isPlaying={isPlaying}
              liked={likedBeats.has(beat.id)}
              toggleLike={() => toggleLike(beat.id)}
              onLicense={() => openLicensing(beat)}
            />
          ))}
        </div>
      )}

      <div style={{ height: 40 }} />
      <Footer setPage={() => {}} />
    </div>
  );
}

// ─── BEAT ROW ───
function BeatRow({ beat, index, playBeat, currentBeat, isPlaying, liked, toggleLike, onLicense }) {
  const isActive = currentBeat?.id === beat.id;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => playBeat(beat)}
      style={{
        display: "grid", gridTemplateColumns: "48px 1fr 120px 80px 80px 100px",
        padding: "12px 16px", alignItems: "center", cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        background: isActive ? `${beat.coverColor}0D` : hovered ? "var(--bg-tertiary)" : "transparent",
        transition: "background 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 14, color: isActive ? beat.coverColor : "var(--text-muted)", fontFamily: "var(--mono)" }}>
        {isActive && isPlaying ? (
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2, background: beat.coverColor,
                animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "var(--radius-xs)",
          background: `linear-gradient(135deg, ${beat.coverColor}33, ${beat.coverColor}11)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
        }}>
          {beat.coverEmoji}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? beat.coverColor : "var(--text-primary)" }}>{beat.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{beat.typebeat}</div>
        </div>
      </div>

      <span style={{
        fontSize: 12, padding: "3px 10px", borderRadius: 20,
        background: `${beat.coverColor}12`, color: beat.coverColor, fontWeight: 500,
        width: "fit-content",
      }}>
        {beat.genre}
      </span>

      <span style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--mono)" }}>
        {beat.bpm}
      </span>

      <span style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
        {beat.plays.toLocaleString()}
      </span>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleLike} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
          padding: 4, display: "flex", opacity: hovered || liked ? 1 : 0.3, transition: "opacity 0.2s",
        }}>
          <Icons.Heart filled={liked} />
        </button>
        <button onClick={onLicense} style={{
          background: "none", border: `1px solid ${beat.coverColor}33`, padding: "4px 12px",
          borderRadius: 20, fontSize: 11, color: beat.coverColor, cursor: "pointer",
          fontFamily: "var(--font)", opacity: hovered ? 1 : 0.5, transition: "all 0.2s",
        }}>
          License
        </button>
      </div>
    </div>
  );
}

// ─── PLAYER BAR ───
function PlayerBar({ beat, isPlaying, progress, currentTime, volume, setVolume, onPlayPause, onNext, onPrev, onSeek, liked, onLike, onLicense }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1001,
      background: "rgba(15,15,17,0.95)", backdropFilter: "blur(24px) saturate(180%)",
      borderTop: "1px solid var(--border)",
      animation: "slideUp 0.4s ease-out",
    }}>
      {/* Progress bar */}
      <div
        style={{ height: 3, background: "var(--bg-tertiary)", cursor: "pointer", position: "relative" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = ((e.clientX - rect.left) / rect.width) * 100;
          onSeek(pct);
        }}
      >
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${beat.coverColor}, var(--accent-purple))`,
          transition: "width 0.3s linear",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%, -50%)",
          width: 10, height: 10, borderRadius: "50%", background: beat.coverColor,
          opacity: 0, transition: "opacity 0.2s",
        }} />
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 24px", maxWidth: 1280, margin: "0 auto", gap: 16,
      }}>
        {/* Beat info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-xs)", flexShrink: 0,
            background: `linear-gradient(135deg, ${beat.coverColor}33, ${beat.coverColor}11)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>
            {beat.coverEmoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {beat.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{beat.typebeat}</div>
          </div>
          <button onClick={onLike} style={{
            background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
            padding: 4, display: "flex", flexShrink: 0,
          }}>
            <Icons.Heart filled={liked} />
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onPrev} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
            <Icons.SkipPrev />
          </button>
          <button
            onClick={onPlayPause}
            style={{
              width: 44, height: 44, borderRadius: "50%", background: beat.coverColor,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <button onClick={onNext} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
            <Icons.SkipNext />
          </button>
        </div>

        {/* Time & Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--mono)", minWidth: 80, textAlign: "center" }}>
            {formatTime(currentTime)} / {formatTime(beat.duration)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Volume />
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 80, accentColor: beat.coverColor }}
            />
          </div>
          <button
            onClick={onLicense}
            style={{
              padding: "8px 20px", borderRadius: 50, background: beat.coverColor,
              border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font)", whiteSpace: "nowrap",
            }}
          >
            License Beat
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .player-vol, .player-license-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── LICENSING MODAL ───
function LicensingModal({ beat, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.3s ease-out",
    }} onClick={onClose}>
      <div
        style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 40,
          maxWidth: 900, width: "100%", maxHeight: "90vh", overflow: "auto",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>License "{beat?.title}"</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Choose a license that fits your project</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <Icons.Close />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
          {LICENSE_TIERS.map((tier) => (
            <div key={tier.name} style={{
              background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", padding: 24,
              border: tier.popular ? `1px solid ${tier.accent}55` : "1px solid var(--border)",
              position: "relative",
            }}>
              {tier.popular && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: tier.accent, padding: "3px 14px", borderRadius: 20,
                  fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                }}>
                  Popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: tier.accent }}>{tier.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{tier.price}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {tier.features.map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: tier.accent, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", padding: "10px 0", borderRadius: 50,
                background: tier.popular ? tier.accent : "transparent",
                border: tier.popular ? "none" : `1px solid ${tier.accent}44`,
                color: tier.popular ? "#fff" : tier.accent,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)",
              }}>
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LICENSING PAGE ───
function LicensingPage() {
  return (
    <div style={{ paddingTop: 100, maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Licensing Options</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Transparent pricing. Pick the license that matches your project scope.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {LICENSE_TIERS.map((tier) => (
          <div key={tier.name} style={{
            background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 32,
            border: tier.popular ? `2px solid ${tier.accent}` : "1px solid var(--border)",
            position: "relative", transition: "transform 0.3s",
          }}>
            {tier.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: tier.accent, padding: "4px 16px", borderRadius: 20,
                fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              }}>
                Most Popular
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: tier.accent, marginBottom: 12 }}>{tier.name}</div>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>{tier.price}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {tier.features.map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 10 }}>
                  <span style={{ color: tier.accent }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", padding: "14px 0", borderRadius: 50,
              background: tier.popular ? tier.accent : "transparent",
              border: tier.popular ? "none" : `1px solid ${tier.accent}44`,
              color: tier.popular ? "#fff" : tier.accent,
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)",
              transition: "all 0.2s",
            }}>
              Get Started
            </button>
          </div>
        ))}
      </div>
      <div style={{ height: 60 }} />
      <Footer setPage={() => {}} />
    </div>
  );
}

// ─── CUSTOM PRODUCTION PAGE ───
function CustomPage() {
  return (
    <div style={{ paddingTop: 100, maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Custom / Exclusive Production</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>
        Need something made from scratch? I create custom beats tailored to your vision, sound, and project requirements. Whether it's an album, single, film score, or commercial project — let's build something unique.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 48 }}>
        {[
          { emoji: "🎵", title: "Custom Beats", desc: "Made-to-order production matching your style and references" },
          { emoji: "🎬", title: "Film & Media", desc: "Scoring for films, commercials, and video content" },
          { emoji: "🎤", title: "Artist Development", desc: "Ongoing production partnerships for projects and albums" },
          { emoji: "🎛️", title: "Sound Design", desc: "Unique textures, sound kits, and sonic landscapes" },
        ].map((item) => (
          <div key={item.title} style={{
            background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 28,
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{item.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: "linear-gradient(135deg, rgba(232,67,147,0.08), rgba(108,92,231,0.08))",
        borderRadius: "var(--radius)", padding: 40, textAlign: "center",
        border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Ready to start?</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15 }}>
          Reach out with your idea, references, and timeline. Let's make something special.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener" style={{
            padding: "12px 28px", borderRadius: 50, background: "var(--accent)", border: "none",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Icons.Instagram /> Instagram
          </a>
          <a href="mailto:ajkeyzzz@gmail.com" style={{
            padding: "12px 28px", borderRadius: 50, background: "transparent",
            border: "1px solid var(--border-hover)", color: "var(--text-primary)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Icons.Mail /> Email
          </a>
        </div>
      </div>
      <div style={{ height: 60 }} />
      <Footer setPage={() => {}} />
    </div>
  );
}

// ─── CONTACT PAGE ───
function ContactPage({ messages, saveMessages }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    const msg = { ...form, id: Date.now().toString(), date: new Date().toISOString(), read: false };
    saveMessages([msg, ...messages]);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px", background: "var(--bg-tertiary)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font)",
    outline: "none", transition: "border-color 0.2s",
  };

  return (
    <div style={{ paddingTop: 100, maxWidth: 700, margin: "0 auto", padding: "100px 24px 80px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Get In Touch</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>
        Have a question, want to collaborate, or need a custom beat? Drop a message.
      </p>

      {sent && (
        <div style={{
          background: "var(--accent-green)" + "22", border: `1px solid var(--accent-green)`,
          borderRadius: "var(--radius-sm)", padding: "14px 20px", marginBottom: 24,
          color: "var(--accent-green)", fontSize: 14, fontWeight: 500,
        }}>
          ✓ Message sent! I'll get back to you soon.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <input placeholder="Your email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        </div>
        <input placeholder="Subject (optional)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
        <textarea
          placeholder="Your message..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={6}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.email || !form.message}
          style={{
            padding: "16px 40px", borderRadius: 50,
            background: form.name && form.email && form.message ? "var(--accent)" : "var(--bg-tertiary)",
            border: "none", color: form.name && form.email && form.message ? "#fff" : "var(--text-muted)",
            fontSize: 15, fontWeight: 600, cursor: form.name && form.email && form.message ? "pointer" : "not-allowed",
            fontFamily: "var(--font)", transition: "all 0.2s", alignSelf: "flex-start",
          }}
        >
          Send Message
        </button>
      </div>

      <div style={{ marginTop: 60, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { icon: <Icons.Instagram />, label: "@ajkeyzzz", href: "https://www.instagram.com/ajkeyzzz" },
          { icon: <Icons.YouTube />, label: "YouTube", href: "https://youtube.com/@ajkeyzzz1927" },
          { icon: <Icons.Twitter />, label: "@ajkeyzzz", href: "https://x.com/ajkeyzzz" },
        ].map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
            background: "var(--bg-card)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, transition: "all 0.2s",
          }}>
            {s.icon} {s.label}
          </a>
        ))}
      </div>
      <div style={{ height: 60 }} />
      <Footer setPage={() => {}} />
    </div>
  );
}

// ─── ADMIN PANEL ───
function AdminPanel({ isAdmin, handleAdminLogin, beats, saveBeats, playlists, savePlaylists, messages, saveMessages, adminView, setAdminView }) {
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [beatForm, setBeatForm] = useState({
    title: "", genre: "", bpm: 120, typebeat: "", tags: "",
    coverColor: "#E84393", coverEmoji: "🎵", playlist: "", featured: false,
  });

  if (!isAdmin) {
    return (
      <div style={{
        paddingTop: 64, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 48,
          border: "1px solid var(--border)", width: "100%", maxWidth: 400, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Admin Login</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
            Enter your password to access the dashboard
          </p>
          {loginError && (
            <div style={{ color: "#D63031", fontSize: 13, marginBottom: 12 }}>Incorrect password</div>
          )}
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setLoginError(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!handleAdminLogin(pass)) setLoginError(true);
              }
            }}
            style={{
              width: "100%", padding: "14px 18px", background: "var(--bg-tertiary)",
              border: loginError ? "1px solid #D63031" : "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
              fontSize: 14, fontFamily: "var(--font)", outline: "none", marginBottom: 16,
            }}
          />
          <button
            onClick={() => { if (!handleAdminLogin(pass)) setLoginError(true); }}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 50, background: "var(--accent)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font)",
            }}
          >
            Login
          </button>
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 12 }}>
            Default: ajkeyzzz2025
          </p>
        </div>
      </div>
    );
  }

  const openNewBeat = () => {
    setEditingBeat("new");
    setBeatForm({
      title: "", genre: "Alté", bpm: 120, typebeat: "", tags: "",
      coverColor: "#E84393", coverEmoji: "🎵", playlist: "alte", featured: false,
    });
  };

  const openEditBeat = (beat) => {
    setEditingBeat(beat.id);
    setBeatForm({
      title: beat.title, genre: beat.genre, bpm: beat.bpm, typebeat: beat.typebeat,
      tags: beat.tags.join(", "), coverColor: beat.coverColor, coverEmoji: beat.coverEmoji,
      playlist: beat.playlist, featured: beat.featured,
    });
  };

  const saveBeat = () => {
    const beatData = {
      ...beatForm,
      bpm: parseInt(beatForm.bpm) || 120,
      tags: beatForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editingBeat === "new") {
      const newBeat = {
        ...beatData, id: Date.now().toString(), dateAdded: new Date().toISOString().split("T")[0],
        plays: 0, likes: 0, duration: 180 + Math.floor(Math.random() * 60),
      };
      saveBeats([newBeat, ...beats]);
    } else {
      const updated = beats.map((b) => (b.id === editingBeat ? { ...b, ...beatData } : b));
      saveBeats(updated);
    }
    setEditingBeat(null);
  };

  const deleteBeat = (id) => {
    saveBeats(beats.filter((b) => b.id !== id));
  };

  const deleteMessage = (id) => {
    saveMessages(messages.filter((m) => m.id !== id));
  };

  const markRead = (id) => {
    saveMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const totalPlays = beats.reduce((a, b) => a + b.plays, 0);
  const totalLikes = beats.reduce((a, b) => a + b.likes, 0);
  const unreadMsgs = messages.filter((m) => !m.read).length;

  const inputStyle = {
    width: "100%", padding: "12px 16px", background: "var(--bg-primary)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
    color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font)", outline: "none",
  };

  const emojiOptions = ["🎵", "💗", "⚖️", "🌴", "🌊", "🌙", "🍛", "☀️", "🌃", "🔥", "💎", "🎤", "🎧", "🌺", "⚡", "🎭", "🌈", "🦋"];

  return (
    <div style={{ paddingTop: 80, maxWidth: 1200, margin: "0 auto", padding: "80px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage your beats, playlists, and messages</p>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "var(--bg-card)", borderRadius: 50, padding: 4, width: "fit-content" }}>
        {[
          { id: "dashboard", label: "Overview" },
          { id: "beats", label: `Beats (${beats.length})` },
          { id: "messages", label: `Messages ${unreadMsgs ? `(${unreadMsgs})` : ""}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminView(tab.id)}
            style={{
              padding: "10px 22px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font)", border: "none",
              background: adminView === tab.id ? "var(--accent)" : "transparent",
              color: adminView === tab.id ? "#fff" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Overview */}
      {adminView === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Total Beats", value: beats.length, color: "var(--accent)", emoji: "🎵" },
              { label: "Total Plays", value: totalPlays.toLocaleString(), color: "var(--accent-blue)", emoji: "▶" },
              { label: "Total Likes", value: totalLikes.toLocaleString(), color: "var(--accent-purple)", emoji: "♡" },
              { label: "Messages", value: messages.length, color: "var(--accent-green)", emoji: "✉", badge: unreadMsgs },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 24,
                border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{stat.emoji}</span>
                  {stat.badge > 0 && (
                    <span style={{
                      background: "var(--accent)", padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {stat.badge} new
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Top beats */}
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Top Performing Beats</h3>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {[...beats].sort((a, b) => b.plays - a.plays).slice(0, 5).map((beat, i) => (
              <div key={beat.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderBottom: i < 4 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--mono)", width: 24 }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `linear-gradient(135deg, ${beat.coverColor}33, ${beat.coverColor}11)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>
                  {beat.coverEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{beat.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{beat.genre}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  ▶ {beat.plays} &nbsp; ♡ {beat.likes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beat Management */}
      {adminView === "beats" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Manage Beats</h3>
            <button
              onClick={openNewBeat}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 24px",
                borderRadius: 50, background: "var(--accent)", border: "none",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)",
              }}
            >
              <Icons.Upload /> Add Beat
            </button>
          </div>

          {/* Beat form modal */}
          {editingBeat && (
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 28,
              border: "1px solid var(--accent)" + "44", marginBottom: 20,
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                {editingBeat === "new" ? "Add New Beat" : "Edit Beat"}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Title *</label>
                  <input value={beatForm.title} onChange={(e) => setBeatForm({ ...beatForm, title: e.target.value })} style={inputStyle} placeholder="Beat title" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Type Beat</label>
                  <input value={beatForm.typebeat} onChange={(e) => setBeatForm({ ...beatForm, typebeat: e.target.value })} style={inputStyle} placeholder="e.g. wizkid type beat" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Genre</label>
                  <select value={beatForm.genre} onChange={(e) => setBeatForm({ ...beatForm, genre: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option>Alté</option><option>Afro Swing</option><option>Afrobeats</option><option>Amapiano</option><option>R&B</option><option>Hip Hop</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BPM</label>
                  <input type="number" value={beatForm.bpm} onChange={(e) => setBeatForm({ ...beatForm, bpm: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Playlist</label>
                  <select value={beatForm.playlist} onChange={(e) => setBeatForm({ ...beatForm, playlist: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    {playlists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
                <input value={beatForm.tags} onChange={(e) => setBeatForm({ ...beatForm, tags: e.target.value })} style={inputStyle} placeholder="alte, amaarae, vibes" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Cover Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={beatForm.coverColor} onChange={(e) => setBeatForm({ ...beatForm, coverColor: e.target.value })} style={{ width: 40, height: 40, border: "none", cursor: "pointer", borderRadius: 8 }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>{beatForm.coverColor}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Cover Emoji</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {emojiOptions.map((e) => (
                      <button
                        key={e}
                        onClick={() => setBeatForm({ ...beatForm, coverEmoji: e })}
                        style={{
                          width: 36, height: 36, borderRadius: 8, fontSize: 18, border: "none",
                          background: beatForm.coverEmoji === e ? "var(--accent)" + "33" : "var(--bg-tertiary)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          outline: beatForm.coverEmoji === e ? `2px solid var(--accent)` : "none",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", fontSize: 14, color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={beatForm.featured} onChange={(e) => setBeatForm({ ...beatForm, featured: e.target.checked })} />
                Featured beat (shown on homepage)
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={saveBeat} disabled={!beatForm.title} style={{
                  padding: "10px 28px", borderRadius: 50, background: beatForm.title ? "var(--accent)" : "var(--bg-tertiary)",
                  border: "none", color: beatForm.title ? "#fff" : "var(--text-muted)",
                  fontSize: 13, fontWeight: 600, cursor: beatForm.title ? "pointer" : "not-allowed", fontFamily: "var(--font)",
                }}>
                  {editingBeat === "new" ? "Add Beat" : "Save Changes"}
                </button>
                <button onClick={() => setEditingBeat(null)} style={{
                  padding: "10px 28px", borderRadius: 50, background: "transparent",
                  border: "1px solid var(--border)", color: "var(--text-secondary)",
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font)",
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Beat list */}
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {beats.map((beat, i) => (
              <div key={beat.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderBottom: i < beats.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `linear-gradient(135deg, ${beat.coverColor}33, ${beat.coverColor}11)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {beat.coverEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    {beat.title}
                    {beat.featured && (
                      <span style={{ fontSize: 10, background: "var(--accent)" + "22", color: "var(--accent)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                        Featured
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{beat.genre} · {beat.bpm} BPM · {beat.typebeat}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 8 }}>
                  ▶ {beat.plays} · ♡ {beat.likes}
                </div>
                <button onClick={() => openEditBeat(beat)} style={{
                  background: "none", border: "1px solid var(--border)", borderRadius: 8,
                  padding: 8, cursor: "pointer", color: "var(--text-secondary)", display: "flex",
                }}>
                  <Icons.Edit />
                </button>
                <button onClick={() => deleteBeat(beat.id)} style={{
                  background: "none", border: "1px solid #D63031" + "33", borderRadius: 8,
                  padding: 8, cursor: "pointer", color: "#D63031", display: "flex",
                }}>
                  <Icons.Trash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {adminView === "messages" && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            Messages {unreadMsgs > 0 && <span style={{ color: "var(--accent)", fontSize: 14 }}>({unreadMsgs} unread)</span>}
          </h3>
          {messages.length === 0 ? (
            <div style={{
              background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 48,
              border: "1px solid var(--border)", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ color: "var(--text-muted)", fontSize: 15 }}>No messages yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 20,
                  border: msg.read ? "1px solid var(--border)" : "1px solid var(--accent)" + "44",
                  position: "relative",
                }}>
                  {!msg.read && (
                    <div style={{
                      position: "absolute", top: 16, right: 16, width: 8, height: 8,
                      borderRadius: "50%", background: "var(--accent)",
                    }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{msg.name}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 12 }}>{msg.email}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  {msg.subject && (
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>{msg.subject}</div>
                  )}
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                    {msg.message}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!msg.read && (
                      <button onClick={() => markRead(msg.id)} style={{
                        background: "none", border: "1px solid var(--border)", borderRadius: 20,
                        padding: "5px 14px", fontSize: 12, color: "var(--text-secondary)",
                        cursor: "pointer", fontFamily: "var(--font)",
                      }}>
                        Mark Read
                      </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)} style={{
                      background: "none", border: "1px solid #D63031" + "33", borderRadius: 20,
                      padding: "5px 14px", fontSize: 12, color: "#D63031",
                      cursor: "pointer", fontFamily: "var(--font)",
                    }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FOOTER ───
function Footer({ setPage }) {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)", padding: "48px 24px",
      maxWidth: 1280, margin: "0 auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "var(--accent)", marginBottom: 8 }}>
            AJKEYZZZ
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>From Lagos to Cali — beats that move the world</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <Icons.Instagram />
          </a>
          <a href="https://youtube.com/@ajkeyzzz1927" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <Icons.YouTube />
          </a>
          <a href="https://x.com/ajkeyzzz" target="_blank" rel="noopener" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <Icons.Twitter />
          </a>
        </div>
      </div>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>© 2026 AJKEYZZZ. All rights reserved.</span>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>PayPal · Venmo</span>
      </div>
    </footer>
  );
}

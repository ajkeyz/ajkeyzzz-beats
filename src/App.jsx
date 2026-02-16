import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import PlayerBar from './components/PlayerBar';
import LicensingModal from './components/LicensingModal';
import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import MobileNav from './components/MobileNav';
import useAudioPlayer from './hooks/useAudioPlayer';
import useAuth from './hooks/useAuth';
import { localStore } from './lib/store';

// Pages — eager load critical routes
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import BeatDetailPage from './pages/BeatDetailPage';

// Lazy load non-critical routes
const LicensingPage = lazy(() => import('./pages/LicensingPage'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));

// Lazy load admin pages (only needed for admin users)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminBeats = lazy(() => import('./pages/admin/AdminBeats'));
const BeatEditor = lazy(() => import('./pages/admin/BeatEditor'));
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));

function PageLoader() {
  return (
    <div style={{ paddingTop: 100, textAlign: 'center', padding: '200px 24px' }}>
      <div style={{
        width: 32, height: 32, border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto',
      }} />
    </div>
  );
}

// Animated 404 page
function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ paddingTop: 100, textAlign: 'center', padding: '160px 24px' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        style={{ fontSize: 120, marginBottom: 16, lineHeight: 1 }}
      >
        <motion.span
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-block' }}
        >
          4
        </motion.span>
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-block', margin: '0 4px', fontSize: 100 }}
        >
          🎵
        </motion.span>
        <motion.span
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ display: 'inline-block' }}
        >
          4
        </motion.span>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}
      >
        This beat doesn&apos;t exist
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}
      >
        The page you&apos;re looking for has left the studio.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        style={{
          padding: '14px 32px', borderRadius: 50, background: 'var(--accent)',
          border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font)', boxShadow: '0 0 30px rgba(232,67,147,0.25)',
        }}
      >
        Back to Home
      </motion.button>
    </div>
  );
}

// Page transition wrapper with scroll-to-top
function PageWrapper({ children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { isAdmin, login, logout } = useAuth();
  const player = useAudioPlayer();

  // Likes (persisted to localStorage)
  const [likedBeats, setLikedBeats] = useState(() => new Set(localStore.getLikes()));
  const toggleLike = useCallback((id) => {
    setLikedBeats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStore.setLikes([...next]);
      return next;
    });
  }, []);

  // Licensing modal
  const [showLicensing, setShowLicensing] = useState(false);
  const [licensingBeat, setLicensingBeat] = useState(null);
  const openLicensing = useCallback((beat) => {
    setLicensingBeat(beat);
    setShowLicensing(true);
  }, []);

  // Shared props for pages that need player/likes/licensing
  const sharedProps = {
    playBeat: player.playBeat,
    currentBeat: player.currentBeat,
    isPlaying: player.isPlaying,
    progress: player.progress,
    seek: player.seek,
    likedBeats,
    toggleLike,
    openLicensing,
  };

  return (
    <ErrorBoundary>
      <a href="#main-content" style={{
        position: 'absolute', top: -40, left: 0, padding: '8px 16px',
        background: 'var(--accent)', color: '#fff', zIndex: 9999,
        fontSize: 14, fontWeight: 600, borderRadius: '0 0 8px 0',
        transition: 'top 0.2s',
      }} onFocus={(e) => { e.target.style.top = '0'; }}
         onBlur={(e) => { e.target.style.top = '-40px'; }}>
        Skip to main content
      </a>
      <div id="main-content" style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: player.currentBeat ? 100 : 0 }}>
        <Navbar isAdmin={isAdmin} onLogout={logout} />

        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage {...sharedProps} /></PageWrapper>} />
              <Route path="/beats" element={<PageWrapper><CatalogPage {...sharedProps} /></PageWrapper>} />
              <Route path="/beats/:slug" element={<PageWrapper><BeatDetailPage {...sharedProps} /></PageWrapper>} />
              <Route path="/licensing" element={<PageWrapper><LicensingPage /></PageWrapper>} />
              <Route path="/custom" element={<PageWrapper><CustomPage /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
              <Route path="/download/:token" element={<PageWrapper><DownloadPage /></PageWrapper>} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminOverview />
                </AdminLayout>
              } />
              <Route path="/admin/beats" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminBeats />
                </AdminLayout>
              } />
              <Route path="/admin/beats/new" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <BeatEditor />
                </AdminLayout>
              } />
              <Route path="/admin/beats/:id/edit" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <BeatEditor />
                </AdminLayout>
              } />
              <Route path="/admin/collections" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminCollections />
                </AdminLayout>
              } />
              <Route path="/admin/inquiries" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminInquiries />
                </AdminLayout>
              } />
              <Route path="/admin/orders" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminOrders />
                </AdminLayout>
              } />
              <Route path="/admin/messages" element={
                <AdminLayout isAdmin={isAdmin} login={login}>
                  <AdminMessages />
                </AdminLayout>
              } />

              {/* 404 */}
              <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Suspense>

        {/* Global Player Bar */}
        <PlayerBar
          beat={player.currentBeat}
          isPlaying={player.isPlaying}
          progress={player.progress}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          setVolume={player.setVolume}
          loading={player.loading}
          queue={player.queue}
          shuffle={player.shuffle}
          onShuffle={player.toggleShuffle}
          repeat={player.repeat}
          onRepeat={player.toggleRepeat}
          recentlyPlayed={player.recentlyPlayed}
          onPlayFromHistory={player.playFromHistory}
          onPlayPause={player.togglePlay}
          onNext={player.skipNext}
          onPrev={player.skipPrev}
          onSeek={player.seek}
          liked={player.currentBeat ? likedBeats.has(player.currentBeat.id) : false}
          onLike={() => player.currentBeat && toggleLike(player.currentBeat.id)}
          onLicense={() => player.currentBeat && openLicensing(player.currentBeat)}
        />

        {/* Licensing Modal */}
        <AnimatePresence>
          {showLicensing && (
            <LicensingModal beat={licensingBeat} onClose={() => setShowLicensing(false)} />
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav */}
        <MobileNav hasPlayer={!!player.currentBeat} />

        {/* Cookie Consent */}
        <CookieBanner />
      </div>
    </ErrorBoundary>
  );
}

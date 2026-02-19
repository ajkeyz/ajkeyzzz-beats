import { useState, useRef, useCallback, useEffect } from 'react';
import { incrementPlays } from '../lib/data';

const CROSSFADE_MS = 1200;
const FADE_STEPS = 24;
const MAX_HISTORY = 30;

export default function useAudioPlayer() {
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // off, all, one
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const audioRef = useRef(new Audio());
  const hasCountedPlay = useRef(false);
  const pendingBeatId = useRef(null);
  const countedPlaysSession = useRef(new Set());
  const fadeOutRef = useRef(null);
  const fadeInRef = useRef(null);
  const volumeRef = useRef(volume);
  const queueRef = useRef(queue);
  const repeatRef = useRef(repeat);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const addToHistory = useCallback((beat) => {
    if (!beat) return;
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(b => b.id !== beat.id);
      return [beat, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      if (audio.currentTime > 10 && !hasCountedPlay.current && pendingBeatId.current && !countedPlaysSession.current.has(pendingBeatId.current)) {
        hasCountedPlay.current = true;
        countedPlaysSession.current.add(pendingBeatId.current);
        incrementPlays(pendingBeatId.current);
      }
    };
    const onLoadedMetadata = () => { setDuration(audio.duration); setLoading(false); };
    const onEnded = () => {
      const curRepeat = repeatRef.current;
      const curQueue = queueRef.current;
      if (curRepeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setProgress(0); setCurrentTime(0);
        return;
      }
      if (curRepeat === 'all') {
        if (curQueue.length > 0) {
          const [next, ...rest] = curQueue;
          setQueue(rest);
          loadAndPlay(next);
        } else {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          setProgress(0); setCurrentTime(0);
        }
        return;
      }
      setIsPlaying(false); setProgress(0); setCurrentTime(0);
      if (curQueue.length > 0) {
        const [next, ...rest] = curQueue;
        setQueue(rest);
        loadAndPlay(next);
      }
    };
    const onError = () => { setLoading(false); setError('Failed to load audio'); setIsPlaying(false); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);

  const startCrossfade = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.src || audio.paused) return;
    const fadeAudio = new Audio(audio.src);
    fadeAudio.currentTime = audio.currentTime;
    fadeAudio.volume = audio.volume;
    fadeAudio.play().catch(() => {});
    audio.pause();
    const stepMs = CROSSFADE_MS / FADE_STEPS;
    const volStep = fadeAudio.volume / FADE_STEPS;
    let count = 0;
    clearInterval(fadeOutRef.current);
    fadeOutRef.current = setInterval(() => {
      count++;
      fadeAudio.volume = Math.max(0, fadeAudio.volume - volStep);
      if (count >= FADE_STEPS) { clearInterval(fadeOutRef.current); fadeAudio.pause(); fadeAudio.src = ''; }
    }, stepMs);
  }, []);

  const fadeInAudio = useCallback(() => {
    const audio = audioRef.current;
    const targetVol = volumeRef.current;
    audio.volume = 0;
    const stepMs = CROSSFADE_MS / FADE_STEPS;
    const volStep = targetVol / FADE_STEPS;
    let count = 0;
    clearInterval(fadeInRef.current);
    fadeInRef.current = setInterval(() => {
      count++;
      audio.volume = Math.min(targetVol, volStep * count);
      if (count >= FADE_STEPS) { clearInterval(fadeInRef.current); audio.volume = targetVol; }
    }, stepMs);
  }, []);

  const loadAndPlay = useCallback((beat, useCrossfade = false) => {
    const audio = audioRef.current;
    setError(null);
    hasCountedPlay.current = false;
    pendingBeatId.current = beat.id;

    if (beat.preview_url) {
      if (useCrossfade) startCrossfade();
      setLoading(true);
      audio.src = beat.preview_url;
      audio.load();
      setCurrentBeat(beat); setProgress(0); setCurrentTime(0); setDuration(beat.duration || 0);
      addToHistory(beat);
      audio.play().then(() => {
        setIsPlaying(true);
        if (useCrossfade) fadeInAudio(); else audio.volume = volumeRef.current;
      }).catch((e) => { console.warn('Autoplay blocked:', e); setIsPlaying(false); setLoading(false); });
    } else {
      audio.pause(); audio.src = '';
      setCurrentBeat(beat); setProgress(0); setCurrentTime(0); setDuration(beat.duration || 180);
      setIsPlaying(true);
      addToHistory(beat);
      startSimulation(beat.duration || 180);
    }
  }, [startCrossfade, fadeInAudio, addToHistory]);

  const simulationRef = useRef(null);

  const startSimulation = useCallback((dur) => {
    clearInterval(simulationRef.current);
    simulationRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.5;
        if (next >= dur) {
          clearInterval(simulationRef.current);
          const curRepeat = repeatRef.current;
          const curQueue = queueRef.current;
          if (curRepeat === 'one') {
            setProgress(0);
            startSimulation(dur);
            return 0;
          }
          if (curRepeat === 'all') {
            if (curQueue.length > 0) {
              const [nextBeat, ...rest] = curQueue; setQueue(rest); loadAndPlay(nextBeat);
            } else {
              setProgress(0);
              startSimulation(dur);
              return 0;
            }
            return 0;
          }
          setIsPlaying(false); setProgress(0);
          if (curQueue.length > 0) { const [nextBeat, ...rest] = curQueue; setQueue(rest); loadAndPlay(nextBeat); }
          return 0;
        }
        setProgress((next / dur) * 100);
        return next;
      });
    }, 500);
  }, [loadAndPlay]);

  const stopSimulation = useCallback(() => { clearInterval(simulationRef.current); }, []);

  const playBeat = useCallback((beat, beatList) => {
    if (beatList) {
      const idx = beatList.findIndex(b => b.id === beat.id);
      if (idx >= 0) {
        let upcoming = beatList.slice(idx + 1);
        if (shuffle) {
          for (let i = upcoming.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
          }
        }
        setQueue(upcoming);
      }
    }
    if (currentBeat?.id === beat.id) {
      if (isPlaying) {
        if (beat.preview_url) audioRef.current.pause(); else stopSimulation();
        setIsPlaying(false);
      } else {
        if (beat.preview_url) audioRef.current.play().catch(() => {}); else startSimulation(duration || beat.duration || 180);
        setIsPlaying(true);
      }
      return;
    }
    stopSimulation();
    const shouldCrossfade = currentBeat?.preview_url && beat.preview_url;
    loadAndPlay(beat, shouldCrossfade);
  }, [currentBeat, isPlaying, loadAndPlay, stopSimulation, startSimulation, duration, shuffle]);

  const togglePlay = useCallback(() => {
    if (!currentBeat) return;
    if (isPlaying) {
      if (currentBeat.preview_url) audioRef.current.pause(); else stopSimulation();
      setIsPlaying(false);
    } else {
      if (currentBeat.preview_url) audioRef.current.play().catch(() => {}); else startSimulation(duration || currentBeat.duration || 180);
      setIsPlaying(true);
    }
  }, [currentBeat, isPlaying, stopSimulation, startSimulation, duration]);

  const seek = useCallback((pct) => {
    const time = (pct / 100) * (duration || currentBeat?.duration || 180);
    if (currentBeat?.preview_url) audioRef.current.currentTime = time;
    setCurrentTime(time); setProgress(pct);
  }, [currentBeat, duration]);

  const skipNext = useCallback(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest); stopSimulation();
      const shouldCrossfade = currentBeat?.preview_url && next.preview_url;
      loadAndPlay(next, shouldCrossfade);
    }
  }, [queue, currentBeat, loadAndPlay, stopSimulation]);

  const skipPrev = useCallback(() => {
    if (currentTime > 3 && currentBeat) { seek(0); return; }
    if (currentBeat) seek(0);
  }, [currentBeat, currentTime, seek]);

  const toggleShuffle = useCallback(() => { setShuffle(prev => !prev); }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  const playFromHistory = useCallback((beat) => {
    stopSimulation();
    const shouldCrossfade = currentBeat?.preview_url && beat.preview_url;
    loadAndPlay(beat, shouldCrossfade);
  }, [currentBeat, loadAndPlay, stopSimulation]);

  useEffect(() => {
    return () => { clearInterval(fadeOutRef.current); clearInterval(fadeInRef.current); clearInterval(simulationRef.current); };
  }, []);

  return {
    currentBeat, isPlaying, progress, currentTime,
    duration: duration || currentBeat?.duration || 0,
    volume, setVolume, loading, error, queue,
    shuffle, repeat, recentlyPlayed,
    playBeat, togglePlay, seek, skipNext, skipPrev,
    toggleShuffle, toggleRepeat, playFromHistory,
  };
}
